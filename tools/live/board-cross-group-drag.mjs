#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    board-cross-group-drag
// COMPONENT: live headless-Chrome proof that a board drag rewrites the grouped property
// ───────────────────────────────────────────────────────────────────
//
// Standalone verification script for the board's cross-group drag, run manually rather than from
// `npm run gate` (this adds no gate lane). It bundles the shipped `BoardRenderer` with
// the same esbuild step `render-assertions.mjs` uses, then drives it in real headless Chrome —
// not jsdom or vitest's plain-object event dispatch, because a real `DataTransfer` and real
// `PointerEvent` are exactly what those cannot construct, and the desktop drag path reads one
// while the phone path's ghost-follow and column hit-testing depend on real `getBoundingClientRect`
// geometry from a real layout engine.
//
// What this proves: the real `BoardRenderer`'s dragstart/dragover/drop wiring (desktop) and its
// long-press/ghost/hit-test/drop wiring (phone, at the 402x874 viewport the phone rhythm checks
// already use) both resolve a cross-group move to the correct `moveRowWithGroupUpdatesAndPosition`
// call — the same call `board-renderer-parity.test.ts` proves reaches `dataSource.updateFrontmatter`
// on both hosts (that host-binding proof needs a live App neither this script nor
// `render-assertions.mjs` constructs — see that file's own header — so it stays in the vitest
// suite, which is the established way this repository proves that class of claim). What this does
// NOT prove: no real vault or file exists here, so "the file's frontmatter" is the action bag's own
// recorded call — a stand-in for the note write, not the write itself.
//
// Usage: node tools/live/board-cross-group-drag.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { buildRenderAssertionBundle } from "./render-assertion-bundle.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
// The packet's own scratch/ — working files, not the tracked screenshots/ pipeline (these two
// PNGs carry no manifest entry, no content hash, no capture.mjs provenance, so they stand as
// this script's own evidence rather than as a registered capture).
const OUT_DIR = join(REPO, "specs/005-component-surface-system/069-board-cross-group-drag/scratch/captures");

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
  throw new Error("board-cross-group-drag: no Chrome/Chromium found. Set SCREENSHOT_CHROME to a browser executable.");
}

// ───────────────────────────────────────────────────────────────────
// 2. BUNDLE
// ───────────────────────────────────────────────────────────────────

const entryBody = `
import { BoardRenderer } from "${join(REPO, "src/views/board-renderer")}";
import { makeColumns, makeRows, makeGroups, makeConfig, GROUP_FIELD } from "${join(REPO, "tools/bench/board-render-bench")}";

// The bag applies each move to the fixture's own frontmatter and re-renders, the way a real
// host's action bag re-renders once its data source has the new value — a reverse drag needs the
// card to actually be in its new column's DOM, not just a recorded call, or "drag it back" is
// really "drag it within the column it never left".
window.__mountBoard = (readOnly) => {
  document.body.innerHTML = "";
  document.body.className = "obnotion-container";
  const columns = makeColumns(3, "text");
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
  const groups = rerender();
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

window.__dispatchDesktopDrag = (draggedPath, targetKey) => {
  const card = document.querySelector('.obnotion-kanban-card[data-obnotion-row-path="' + draggedPath + '"]');
  const targetCardsEl = document.querySelector('.obnotion-kanban-cards[data-status="' + targetKey + '"]');
  if (!card || !targetCardsEl) return { ok: false, reason: "card or target column not found" };
  const dt = new DataTransfer();
  card.dispatchEvent(new DragEvent("dragstart", { dataTransfer: dt, bubbles: true, cancelable: true }));
  const rect = targetCardsEl.getBoundingClientRect();
  targetCardsEl.dispatchEvent(new DragEvent("dragover", {
    dataTransfer: dt, bubbles: true, cancelable: true, clientX: rect.left + 10, clientY: rect.top + 10,
  }));
  targetCardsEl.dispatchEvent(new DragEvent("drop", {
    dataTransfer: dt, bubbles: true, cancelable: true, clientX: rect.left + 10, clientY: rect.top + 10,
  }));
  card.dispatchEvent(new DragEvent("dragend", { dataTransfer: dt, bubbles: true, cancelable: true }));
  return { ok: true };
};

function pointerEvent(type, x, y) {
  return new PointerEvent(type, {
    pointerId: 1, pointerType: "touch", button: 0, clientX: x, clientY: y, bubbles: true, cancelable: true,
  });
}

window.__touchPointerDown = (path, x, y) => {
  const card = document.querySelector('.obnotion-kanban-card[data-obnotion-row-path="' + path + '"]');
  if (!card) return { ok: false };
  card.dispatchEvent(pointerEvent("pointerdown", x, y));
  window.__touchDragCard = card;
  return { ok: true };
};

window.__touchPointerMove = (x, y) => {
  const card = window.__touchDragCard;
  if (!card) return { ok: false };
  card.dispatchEvent(pointerEvent("pointermove", x, y));
  return { ok: true };
};

window.__touchPointerUp = (x, y) => {
  const card = window.__touchDragCard;
  if (!card) return { ok: false };
  card.dispatchEvent(pointerEvent("pointerup", x, y));
  window.__touchDragCard = null;
  return { ok: true };
};
`;

const { work, missingSources } = await buildRenderAssertionBundle(entryBody);

// `missingSources` checks the shared `RENDERER_SOURCES` list (all five renderers) — this script
// only ever imports `board-renderer.ts`, so only that one entry's absence means the bundle stopped
// importing the shipped source; the other four are expected to read as "missing" here and carry
// no meaning for this check.
if (missingSources.includes("src/views/board-renderer.ts")) {
  console.error("board-cross-group-drag: bundle did not import src/views/board-renderer.ts — refusing to assert on a copy");
  process.exit(3);
}

// The caller writes its own index.html beside the bundle — the shared builder does not, since the
// stylesheet set differs per check. styles.css loads for every page here; theme.css and
// runtime-vars.css are added only to the phone page below, which is the one that screenshots.
writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${REPO}styles.css"></head>
<body class="obnotion-container"><script src="render-bundle.js"></script></body></html>`);

// ───────────────────────────────────────────────────────────────────
// 3. RUN
// ───────────────────────────────────────────────────────────────────

const failures = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: findChrome() });

  // ── 3a. DESKTOP: real dragstart/dragover/drop, real DataTransfer ──
  {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`file://${join(work, "index.html")}`);

    const { groups } = await page.evaluate(() => window.__mountBoard(false));
    const fromKey = groups[0].key;
    const toKey = groups[1].key;
    const draggedPath = groups[0].rows[0].file.path;

    const dispatch = await page.evaluate(
      ({ draggedPath, toKey }) => window.__dispatchDesktopDrag(draggedPath, toKey),
      { draggedPath, toKey },
    );
    const calls = await page.evaluate(() => window.__boardCalls);
    const moveCalls = calls.filter((c) => c.fn === "moveRowWithGroupUpdatesAndPosition");

    failures.push(...[
      !dispatch.ok ? `desktop drag: dispatch failed (${dispatch.reason})` : null,
      moveCalls.length !== 1 ? `desktop drag: expected 1 moveRowWithGroupUpdatesAndPosition call, got ${moveCalls.length}` : null,
      moveCalls[0] && moveCalls[0].path !== draggedPath ? `desktop drag: wrong path moved` : null,
      moveCalls[0] && JSON.stringify(moveCalls[0].updates) !== JSON.stringify([{ field: "board_status", fromGroupKey: fromKey, toGroupKey: toKey }])
        ? `desktop drag: wrong group update — ${JSON.stringify(moveCalls[0].updates)}` : null,
      pageErrors.length > 0 ? `desktop drag: page error(s): ${pageErrors.join("; ")}` : null,
    ].filter(Boolean));

    console.log(`desktop cross-group drag: ${moveCalls.length === 1 ? "PASS" : "FAIL"} — `
      + `${draggedPath} ${fromKey} -> ${toKey}, recorded call: ${JSON.stringify(moveCalls[0] || null)}`);

    await page.close();
  }

  // ── 3b. PHONE: real long-press + PointerEvent drag at the 402x874 viewport ──
  {
    const page = await browser.newPage({ viewport: { width: 402, height: 874 } });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`file://${join(work, "index.html")}`);
    // styles.css already loaded via index.html's own <link>; the theme and runtime-token sheets
    // are added here because they are what the light/dark screenshots below actually need resolved.
    for (const sheet of ["tools/screenshots/theme.css", "tools/screenshots/runtime-vars.css"]) {
      await page.addStyleTag({ content: readFileSync(join(REPO, sheet), "utf8") });
    }

    const { groups } = await page.evaluate(() => window.__mountBoard(false));
    const fromKey = groups[0].key;
    const toKey = groups[1].key;
    const draggedPath = groups[0].rows[0].file.path;

    const startRect = await page.evaluate((path) => window.__cardRect(path), draggedPath);
    const startX = startRect.left + 10;
    const startY = startRect.top + 10;
    const targetRect = await page.evaluate((key) => window.__columnRect(key), toKey);
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + 30;

    await page.evaluate(({ path, x, y }) => window.__touchPointerDown(path, x, y), { path: draggedPath, x: startX, y: startY });
    const ghostBeforeThreshold = await page.evaluate(() => document.querySelector(".obnotion-kanban-card--touch-ghost") !== null);
    // 450ms real threshold, not virtual time — this is a live-Chrome proof, not a unit test.
    await page.waitForTimeout(500);
    const ghostAfterThreshold = await page.evaluate(() => document.querySelector(".obnotion-kanban-card--touch-ghost") !== null);

    await page.evaluate(({ x, y }) => window.__touchPointerMove(x, y), { x: targetX, y: targetY });
    const ghostRect = await page.evaluate(() => window.__ghostRect());
    const expectedOffsetX = startX - startRect.left;
    const expectedOffsetY = startY - startRect.top;
    const ghostDeltaX = Math.abs(ghostRect.left - (targetX - expectedOffsetX));
    const ghostDeltaY = Math.abs(ghostRect.top - (targetY - expectedOffsetY));
    const highlighted = await page.evaluate((key) => window.__hasDropTarget(key), toKey);

    // The capture happens at a nearer point than the drop target: the target column sits mostly
    // past the 402px edge (only one board column fits at this width, matching the real phone
    // board's own horizontal scroll), so a card-width ghost placed at the target's centre would
    // paint mostly off-screen. A point partway along the same drag reads as the same "lifted,
    // mid-drag" state and keeps the ghost inside the frame the two PNGs actually show.
    const captureX = Math.min(startX + (targetX - startX) * 0.35, 402 - 140);
    const captureY = startY + (targetY - startY) * 0.35;
    await page.evaluate(({ x, y }) => window.__touchPointerMove(x, y), { x: captureX, y: captureY });
    mkdirSync(OUT_DIR, { recursive: true });
    for (const theme of ["light", "dark"]) {
      if (theme === "dark") await page.evaluate(() => document.body.classList.add("theme-dark"));
      await page.screenshot({ path: join(OUT_DIR, `board-touch-drag-lifted-mobile-${theme}.png`) });
      if (theme === "dark") await page.evaluate(() => document.body.classList.remove("theme-dark"));
    }
    await page.evaluate(({ x, y }) => window.__touchPointerMove(x, y), { x: targetX, y: targetY });

    await page.evaluate(({ x, y }) => window.__touchPointerUp(x, y), { x: targetX, y: targetY });
    const calls = await page.evaluate(() => window.__boardCalls);
    const moveCalls = calls.filter((c) => c.fn === "moveRowWithGroupUpdatesAndPosition");

    failures.push(...[
      ghostBeforeThreshold ? "phone drag: ghost appeared before the long-press threshold" : null,
      !ghostAfterThreshold ? "phone drag: no ghost after the long-press threshold" : null,
      ghostDeltaX > 2 || ghostDeltaY > 2 ? `phone drag: ghost drifted ${ghostDeltaX.toFixed(1)}x/${ghostDeltaY.toFixed(1)}y px from the finger (>2px)` : null,
      !highlighted ? "phone drag: target column never carried the drop-target highlight" : null,
      moveCalls.length !== 1 ? `phone drag: expected 1 moveRowWithGroupUpdatesAndPosition call, got ${moveCalls.length}` : null,
      moveCalls[0] && JSON.stringify(moveCalls[0].updates) !== JSON.stringify([{ field: "board_status", fromGroupKey: fromKey, toGroupKey: toKey }])
        ? `phone drag: wrong group update — ${JSON.stringify(moveCalls[0].updates)}` : null,
    ].filter(Boolean));

    console.log(`phone touch drag (402x874): ${moveCalls.length === 1 && ghostDeltaX <= 2 && ghostDeltaY <= 2 ? "PASS" : "FAIL"} — `
      + `ghost delta ${ghostDeltaX.toFixed(1)}x/${ghostDeltaY.toFixed(1)}y px, highlighted=${highlighted}, `
      + `recorded call: ${JSON.stringify(moveCalls[0] || null)}`);
    console.log(`  captures: ${join(OUT_DIR, "board-touch-drag-lifted-mobile-{light,dark}.png")}`);

    // ── Reverse drag: the card that just landed in toKey goes back to fromKey ──
    const backRect = await page.evaluate((path) => window.__cardRect(path), draggedPath);
    const backStartX = backRect.left + 10;
    const backStartY = backRect.top + 10;
    const backTargetRect = await page.evaluate((key) => window.__columnRect(key), fromKey);
    const backTargetX = backTargetRect.left + backTargetRect.width / 2;
    const backTargetY = backTargetRect.top + 30;
    await page.evaluate(({ path, x, y }) => window.__touchPointerDown(path, x, y), { path: draggedPath, x: backStartX, y: backStartY });
    await page.waitForTimeout(500);
    await page.evaluate(({ x, y }) => window.__touchPointerMove(x, y), { x: backTargetX, y: backTargetY });
    await page.evaluate(({ x, y }) => window.__touchPointerUp(x, y), { x: backTargetX, y: backTargetY });
    const callsAfterReverse = await page.evaluate(() => window.__boardCalls);
    const reverseMoveCalls = callsAfterReverse.filter((c) => c.fn === "moveRowWithGroupUpdatesAndPosition");
    const reversedOk = reverseMoveCalls.length === 2
      && JSON.stringify(reverseMoveCalls[1].updates) === JSON.stringify([{ field: "board_status", fromGroupKey: toKey, toGroupKey: fromKey }]);
    if (!reversedOk) failures.push(`phone drag: reverse move did not land — ${JSON.stringify(reverseMoveCalls)}`);
    console.log(`phone touch drag reverse: ${reversedOk ? "PASS" : "FAIL"}`);

    // ── Same-column drop: reorder only, no group update ──
    const remounted = await page.evaluate(() => window.__mountBoard(false));
    const sameKey = remounted.groups[0].key;
    const samePath = remounted.groups[0].rows[0].file.path;
    const sameRect = await page.evaluate((path) => window.__cardRect(path), samePath);
    const sameColRect = await page.evaluate((key) => window.__columnRect(key), sameKey);
    await page.evaluate(({ path, x, y }) => window.__touchPointerDown(path, x, y), { path: samePath, x: sameRect.left + 10, y: sameRect.top + 10 });
    await page.waitForTimeout(500);
    await page.evaluate(({ x, y }) => window.__touchPointerMove(x, y), { x: sameColRect.left + sameColRect.width / 2, y: sameColRect.top + 60 });
    await page.evaluate(({ x, y }) => window.__touchPointerUp(x, y), { x: sameColRect.left + sameColRect.width / 2, y: sameColRect.top + 60 });
    const sameColCalls = (await page.evaluate(() => window.__boardCalls)).filter((c) => c.fn === "moveRowWithGroupUpdatesAndPosition");
    const sameColOk = sameColCalls.length === 0;
    if (!sameColOk) failures.push(`phone drag same-column: expected 0 group-update calls, got ${sameColCalls.length}`);
    console.log(`phone touch drag same-column (reorder only, no group update): ${sameColOk ? "PASS" : "FAIL"}`);

    // ── Read-only board: no lift ──
    const readOnlyMount = await page.evaluate(() => window.__mountBoard(true));
    const readOnlyPath = readOnlyMount.rows[0].file.path;
    const readOnlyCardExists = await page.evaluate(
      (path) => document.querySelector('.obnotion-kanban-card[data-obnotion-row-path="' + path + '"]') !== null,
      readOnlyPath,
    );
    let readOnlyGhostAppeared = false;
    if (readOnlyCardExists) {
      const readOnlyRect = await page.evaluate((path) => window.__cardRect(path), readOnlyPath);
      await page.evaluate(({ path, x, y }) => window.__touchPointerDown(path, x, y), { path: readOnlyPath, x: readOnlyRect.left + 10, y: readOnlyRect.top + 10 });
      await page.waitForTimeout(500);
      readOnlyGhostAppeared = await page.evaluate(() => document.querySelector(".obnotion-kanban-card--touch-ghost") !== null);
      await page.evaluate(({ x, y }) => window.__touchPointerUp(x, y), { x: readOnlyRect.left + 10, y: readOnlyRect.top + 10 });
    }
    const readOnlyOk = readOnlyCardExists && !readOnlyGhostAppeared;
    if (!readOnlyOk) failures.push("phone drag read-only: a card lifted on a read-only board");
    console.log(`phone touch drag read-only (no lift): ${readOnlyOk ? "PASS" : "FAIL"}`);

    for (const error of pageErrors) failures.push(`phone drag: page error: ${error}`);
    await page.close();
  }
} finally {
  await browser?.close();
  rmSync(work, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(`\nboard-cross-group-drag: ${failures.length} FAILURE(S)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("\nRESULT: PASSED");
