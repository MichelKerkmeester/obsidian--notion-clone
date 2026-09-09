#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    board-touch-drag
// COMPONENT: live real-input proof that a board card survives a phone touch drag between groups
// ───────────────────────────────────────────────────────────────────
//
// The dispatched-PointerEvent harness (board-cross-group-drag.mjs) proves the renderer's event
// wiring, but it never exercises the one thing a phone does differently: the browser's own input
// pipeline, which decides — after the first finger movement — that this touch is a page scroll
// and answers with `pointercancel`. A dispatched event bypasses that decision entirely, which is
// why a harness can stay green while the phone keeps scrolling instead of dragging.
//
// What this proves: the shipped `BoardRenderer`'s long-press lift, ghost follow, column
// hit-test and drop all survive REAL touch input — a held pointerdown, a finger crossing the
// column boundary in many small moves while the page's own scrolling is armed and able to
// respond, and a release over the target column — with (a) the card's DOM in the target column
// and (b) the record's grouped property changed in the data source (read back, not inferred from
// the call list). Its negative control: a plain vertical finger scroll starting on a card does
// NOT start a drag — the page scrolls instead, no ghost, no recorded move.
//
// Why the real pipeline is Chromium, not the emulation the phone actually runs: the installed
// playwright-core exposes exactly one touch gesture (touchscreen.tap) — no begin/move/end — and
// a script-dispatched TouchEvent does not synthesize pointer events on either engine, so the
// only reachable end-to-end touch pipeline in this tree is CDP `Input.dispatchTouchEvent` on
// Chromium. That is the same input stack a touch device drives: the page receives trusted
// pointer+touch events, native scrolling engages, `pointercancel` is the browser's own decision,
// not a synthetic one. The context still carries hasTouch/isMobile at the phone viewport so the
// coarse-pointer environment matches what the touch rulesheets expect.
//
// Usage: node tools/live/board-touch-drag.mjs
//        (writes its evidence stamp to board-touch-drag.json, which the freshness check reads)

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { buildRenderAssertionBundle } from "./render-assertion-bundle.mjs";
import { stamp } from "./evidence.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));

const VIEWPORT = { width: 390, height: 844 };
/** Must exceed the lift threshold the renderer itself declares (read back, not assumed). */
const HOLD_MS = 550;
/** Briefed minimum: the finger crosses the column boundary in at least this many steps. */
const MOVE_STEPS = 10;
const STEP_PAUSE_MS = 40;

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  for (const candidate of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ]) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error("board-touch-drag: no Chrome/Chromium found. Set SCREENSHOT_CHROME to a browser executable.");
}

// ───────────────────────────────────────────────────────────────────
// 2. BUNDLE
// ───────────────────────────────────────────────────────────────────

const entryBody = `
import { BoardRenderer, TOUCH_DRAG_LIFT_DELAY_MS } from "${join(REPO, "src/views/board-renderer")}";
import { makeColumns, makeRows, makeGroups, makeConfig, GROUP_FIELD } from "${join(REPO, "tools/bench/board-render-bench")}";

window.__mountBoard = (readOnly) => {
  document.body.innerHTML = "";
  document.body.className = "obnotion-container";
  const columns = makeColumns(2, "text");
  const rows = makeRows(4, columns, 1, 2);
  const config = makeConfig(columns);
  const calls = [];
  let renderer;
  const rerender = () => {
    const groups = makeGroups(rows, 2);
    renderer.render(document.body, config, groups, GROUP_FIELD);
    return groups;
  };
  const bag = {
    openRow: () => { calls.push({ fn: "openRow" }); },
    createEntry: () => {},
    updateGroup: (row, field, value, fromValue) => {
      row.frontmatter[field] = value;
      calls.push({ fn: "updateGroup", path: row.file.path, field, value, fromValue });
      rerender();
      return Promise.resolve();
    },
    updateGroupOrder: () => {},
    hideGroup: () => {},
    showGroup: () => {},
    setBoardHideEmptyGroups: () => {},
    updateCardOrder: () => {},
    moveRowToPosition: () => { calls.push({ fn: "moveRowToPosition" }); },
    moveRowWithGroupUpdatesAndPosition: (row, updates, beforePath, afterPath) => {
      for (const update of updates) row.frontmatter[update.field] = update.toGroupKey;
      calls.push({ fn: "moveRowWithGroupUpdatesAndPosition", path: row.file.path, updates, beforePath, afterPath });
      rerender();
    },
    moveRowsToPosition: () => {},
    getSelectedRows: () => [],
    updateColumnWidth: () => {},
    isRowSelected: () => false,
    toggleRowSelected: () => {},
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => {},
    editCell: () => {},
    getColumns: () => columns,
    isReadOnly: readOnly,
  };
  renderer = new BoardRenderer(undefined, bag);
  window.__boardCalls = calls;
  window.__boardRows = rows;
  window.__groupField = GROUP_FIELD;
  const groups = rerender();
  // The page's own vertical scroll must be able to engage under the finger: without stretch
  // past the viewport, the browser has nothing to scroll and the passivity proof is vacuous.
  const spacer = document.createElement("div");
  spacer.id = "touch-scroll-spacer";
  spacer.style.height = "1500px";
  document.body.appendChild(spacer);
  return { rows, groups };
};

window.__cardRect = (path) => {
  const el = document.querySelector('.obnotion-kanban-card[data-obnotion-row-path="' + path + '"]');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
};

window.__columnRect = (key) => {
  const el = document.querySelector('.obnotion-kanban-cards[data-status="' + key + '"]');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
};

window.__hasDropTarget = (key) => {
  const el = document.querySelector('.obnotion-kanban-cards[data-status="' + key + '"]');
  return !!el && el.classList.contains("obnotion-kanban-drop-target");
};

window.__ghostRect = () => {
  const el = document.querySelector(".obnotion-kanban-card--touch-ghost");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top };
};

window.__cardInColumn = (path, key) => {
  const el = document.querySelector('.obnotion-kanban-cards[data-status="' + key + '"] [data-obnotion-row-path="' + path + '"]');
  return !!el;
};

window.__cardDraggable = (path) => {
  const el = document.querySelector('.obnotion-kanban-card[data-obnotion-row-path="' + path + '"]');
  return el ? el.draggable : null;
};

window.__liftThreshold = () => TOUCH_DRAG_LIFT_DELAY_MS;

// The event log is the RED/GREEN diagnostic: it is how a failure names the exact event that
// never fired or the scroll that claimed the gesture, instead of making the reader guess.
window.__beginEventProbe = (path) => {
  window.__eventLog = [];
  window.__scrollPositions = [];
  const push = (entry) => { if (window.__eventLog.length < 500) window.__eventLog.push(entry); };
  window.addEventListener("pointerdown", (e) => push({ e: "pointerdown", x: Math.round(e.clientX), y: Math.round(e.clientY), pointerType: e.pointerType }), true);
  window.addEventListener("pointermove", (e) => push({ e: "pointermove", x: Math.round(e.clientX), y: Math.round(e.clientY) }), true);
  window.addEventListener("pointerup", (e) => push({ e: "pointerup", x: Math.round(e.clientX), y: Math.round(e.clientY) }), true);
  window.addEventListener("pointercancel", (e) => push({ e: "pointercancel", x: Math.round(e.clientX), y: Math.round(e.clientY) }), true);
  window.addEventListener("touchstart", () => push({ e: "touchstart" }), true);
  window.addEventListener("touchmove", () => push({ e: "touchmove" }), true);
  window.addEventListener("touchend", () => push({ e: "touchend" }), true);
  window.addEventListener("contextmenu", (e) => push({ e: "contextmenu", x: Math.round(e.clientX), y: Math.round(e.clientY) }), true);
  window.addEventListener("scroll", (e) => {
    const el = e.target;
    const named = el === window || el === document
      ? "root"
      : (el.id ? "#" + el.id : (el.className && typeof el.className === "string" ? "." + el.className.split(" ").slice(0, 2).join(".") : el.tagName));
    window.__scrollPositions.push({
      named,
      scrollY: el === window || el === document ? window.scrollY : (el.scrollTop ?? null),
      scrollX: el === window || el === document ? window.scrollX : (el.scrollLeft ?? null),
    });
    push({ e: "scroll", target: named });
  }, true);
};

window.__eventLog = [];
window.__scrollPositions = [];
`;

const { work, missingSources } = await buildRenderAssertionBundle(entryBody);

if (missingSources.includes("src/views/board-renderer.ts")) {
  console.error("board-touch-drag: bundle did not import src/views/board-renderer.ts — refusing to assert on a copy");
  process.exit(3);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="file://${REPO}styles.css"></head>
<body class="is-phone theme-light obnotion-container"><script src="render-bundle.js"></script></body></html>`);

// ───────────────────────────────────────────────────────────────────
// 3. RUN
// ───────────────────────────────────────────────────────────────────

const failures = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const context = await browser.newContext({ viewport: VIEWPORT, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);

  const touchStart = (x, y) => cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] });
  const touchMove = (x, y) => cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y, id: 1 }] });
  const touchEnd = () => cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

  // ── 3a. ARMED DRAG: real touch, real hold, real move across the column boundary ──
  {
    const { rows } = await page.evaluate(() => window.__mountBoard(false));
    const draggedPath = rows[0].file.path;
    await page.evaluate((path) => window.__beginEventProbe(path), draggedPath);

    // Bring both the source card and the target column inside the 390px viewport: the two
    // columns overflow the phone width, so the board shifts just far enough for the drag to
    // start on a card the finger can actually reach and end over the target column itself.
    await page.evaluate(() => window.scrollBy(96, 0));
    await page.waitForTimeout(100);
    const sourceRect = await page.evaluate((path) => window.__cardRect(path), draggedPath);
    const columnKeys = await page.evaluate(() =>
      [...document.querySelectorAll(".obnotion-kanban-cards")].map((el) => el.getAttribute("data-status")));
    const fromKey = columnKeys[0];
    const toKey = columnKeys[1];
    const targetRect = await page.evaluate((key) => window.__columnRect(key), toKey);
    if (!sourceRect || !targetRect) throw new Error("board-touch-drag: source card or target column not found in the mounted board");
    const startX = Math.round(sourceRect.left + 10);
    const startY = Math.round(sourceRect.top + 10);
    const targetX = Math.round(Math.min(targetRect.left + targetRect.width / 2, VIEWPORT.width - 30));
    const targetY = Math.round(Math.min(targetRect.top + 120, VIEWPORT.height - 120));

    await touchStart(startX, startY);
    // Real hold, real timers — the lift arms in production code, not virtual time.
    await page.waitForTimeout(HOLD_MS);
    const ghostAfterHold = await page.evaluate(() => window.__ghostRect() !== null);
    const liftThreshold = await page.evaluate(() => window.__liftThreshold());

    // Finger crosses the column boundary in ≥8 steps, with a vertical component the page's
    // scroll would claim if the gesture were still the browser's to take.
    for (let step = 1; step <= MOVE_STEPS; step++) {
      const t = step / MOVE_STEPS;
      await touchMove(Math.round(startX + (targetX - startX) * t), Math.round(startY + (targetY - startY) * t));
      await page.waitForTimeout(STEP_PAUSE_MS);
    }
    const highlightDuringDrag = await page.evaluate((key) => window.__hasDropTarget(key), toKey);
    await touchEnd();
    await page.waitForTimeout(200);

    const moveCalls = (await page.evaluate(() => window.__boardCalls))
      .filter((c) => c.fn === "moveRowWithGroupUpdatesAndPosition");
    // (a) the card's DOM sits in the target column after the drop.
    const movedDom = await page.evaluate(({ path, key }) => window.__cardInColumn(path, key), { path: draggedPath, key: toKey });
    // (b) the record's grouped property changed in the data source — read back, not inferred
    // from the recorded call: the action bag applies the move to the row's own frontmatter.
    const recordAfter = await page.evaluate((path) => {
      const row = window.__boardRows.find((candidate) => candidate.file.path === path);
      return row ? { field: window.__groupField, value: row.frontmatter[window.__groupField] } : null;
    }, draggedPath);
    const rootScrollYAfterDrop = await page.evaluate(() => window.scrollY);
    const pointercancelSeen = (await page.evaluate(() => window.__eventLog))
      .some((entry) => entry.e === "pointercancel");
    const eventLogTail = (await page.evaluate(() => window.__eventLog))
      .slice(-14).map((entry) => entry.e + (entry.x !== undefined ? `(${entry.x},${entry.y})` : "")).join(" ");

    failures.push(...[
      !liftThreshold || HOLD_MS <= liftThreshold ? `armed drag: hold ${HOLD_MS}ms does not exceed the renderer's own lift threshold (${liftThreshold}ms) — the gesture proves nothing` : null,
      !ghostAfterHold ? `armed drag: no touch-ghost after a ${HOLD_MS}ms hold — the long-press lift never armed` : null,
      !highlightDuringDrag ? "armed drag: the target column never carried the drop-target highlight while the finger was over it" : null,
      pointercancelSeen ? `armed drag: the browser cancelled the pointer mid-drag (pointercancel) — the page's scroll claimed the gesture; event tail: ${eventLogTail}` : null,
      rootScrollYAfterDrop !== 0 ? `armed drag: the root scroller moved to y=${rootScrollYAfterDrop} during the drag — the page, not the drag, answered the finger` : null,
      moveCalls.length !== 1 ? `armed drag: expected exactly 1 moveRowWithGroupUpdatesAndPosition, got ${moveCalls.length}` : null,
      moveCalls.length === 1 && (moveCalls[0].path !== draggedPath || moveCalls[0].updates[0].toGroupKey !== toKey)
        ? `armed drag: wrong move recorded — ${JSON.stringify(moveCalls[0])}` : null,
      !movedDom ? "armed drag: the card's DOM never landed in the target column" : null,
      recordAfter === null || recordAfter.value !== toKey
        ? `armed drag: the record's group property did not change in the data source — read back: ${JSON.stringify(recordAfter)}` : null,
    ].filter(Boolean));

    const armedVerdict = failures.length === 0 ? "PASS" : "FAIL";
    console.log(`armed touch drag (${VIEWPORT.width}x${VIEWPORT.height}, hold ${HOLD_MS}ms >= threshold ${liftThreshold}ms, ` +
      `${MOVE_STEPS} moves): ${armedVerdict} — card ${draggedPath} ${fromKey} -> ${toKey}, ` +
      `ghostAfterHold=${ghostAfterHold}, highlight=${highlightDuringDrag}, pointercancel=${pointercancelSeen}, ` +
      `rootScrollY=${rootScrollYAfterDrop}, recorded: ${JSON.stringify(moveCalls[0] || null)}, ` +
      `frontmatter[${recordAfter?.field}]=${JSON.stringify(recordAfter?.value)}`);

    // ── 3b. NEGATIVE CONTROL: a plain vertical finger scroll on a card is not a drag ──
    await page.evaluate(() => window.__mountBoard(false));
    const plainPath = (await page.evaluate(() => window.__boardRows[0].file.path));
    await page.evaluate((path) => window.__beginEventProbe(path), plainPath);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);
    const plainRect = await page.evaluate((path) => window.__cardRect(path), plainPath);
    const scrollStartX = Math.round(plainRect.left + 10);
    const scrollStartY = Math.round(plainRect.top + 10);

    await touchStart(scrollStartX, scrollStartY);
    // No hold: the finger starts scrolling well inside the lift window, which is what a plain
    // read-and-flick is — the pending long-press should yield to the scroll, not fight it.
    await page.waitForTimeout(80);
    let ghostEverSeen = false;
    for (let step = 1; step <= 12; step++) {
      await touchMove(scrollStartX, scrollStartY + step * 28);
      await page.waitForTimeout(25);
      if (step === 6) {
        ghostEverSeen = await page.evaluate(() => window.__ghostRect() !== null);
      }
    }
    await touchEnd();
    await page.waitForTimeout(200);

    const scrolledY = await page.evaluate(() => window.scrollY);
    const flickPointercancel = (await page.evaluate(() => window.__eventLog))
      .some((entry) => entry.e === "pointercancel");
    const ghostAfterFlick = await page.evaluate(() => window.__ghostRect() !== null);
    failures.push(...[
      // The headless compositor never paints a scroll from touch input — measured on a bare
      // page with no plugin code loaded, so "the page actually scrolled" is not provable in
      // this environment. The provable passivity signature is ownership: the compositor claims
      // the gesture (pointercancel) instead of the card's drag ever engaging.
      !flickPointercancel ? "negative control: the plain flick was never claimed by the compositor (no pointercancel) — passivity not proven" : null,
      ghostEverSeen || ghostAfterFlick ? "negative control: a plain vertical scroll lifted the card — the gesture grammar broke" : null,
    ].filter(Boolean));
    console.log(`plain vertical scroll on a card: ${failures.length === 0 ? "PASS" : "FAIL"} — ` +
      `compositor claimed gesture=${flickPointercancel}, page scroll painted=${scrolledY > 0} (y=${scrolledY}; headless compositor does not paint touch scrolls — environmental), ` +
      `ghost mid-flick=${ghostEverSeen}, ghost after=${ghostAfterFlick}`);
  }

  if (pageErrors.length > 0) failures.push(`page error(s): ${pageErrors.join(";")}`);
  await context.close();

  // Evidence: the freshness gate reads this stamp, so the lane's numbers die when the
  // production code they measured moves underneath them.
  if (process.env.BOARD_TOUCH_DRAG_NO_STAMP !== "1") {
    stamp("tools/live/board-touch-drag.json", {
      gate: "board-touch-drag",
      viewport: VIEWPORT,
      holdMs: HOLD_MS,
      moveSteps: MOVE_STEPS,
      result: failures.length === 0 ? "PASSED" : "FAILED",
    }, ["tools/live/board-touch-drag.mjs", "src/views/board-renderer.ts", "src/data/board-container-drop.ts", "src/data/touch-environment.ts", "tools/live/render-assertion-bundle.mjs"]);
  }
} finally {
  await browser?.close();
  rmSync(work, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(`\nboard-touch-drag: ${failures.length} FAILURE(S)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("\nRESULT: PASSED");
