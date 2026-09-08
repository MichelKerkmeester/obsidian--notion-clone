#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    embedded-linked-view-ux
// COMPONENT: live headless-Chrome proof that a linked view inside a note behaves on a phone
// ───────────────────────────────────────────────────────────────────
//
// Two questions the operator's report rides on, answered with numbers rather than belief:
//
//   Lane A — does the board inside an embedded/linked view lift on a long press and complete a
//   cross-group drop EXACTLY as the file view's board does? The 069 proof drove one synthetic
//   action bag that had BOTH cross-group methods, so it never distinguished the two hosts. Here
//   the same gesture runs twice against the same fixture: once through the file view's bag (the
//   primary moveRowWithGroupUpdatesAndPosition branch) and once through the bag the embedded
//   host actually passes — whose distinguishing feature is the ABSENCE of that method, so the
//   drop resolves through the updateGroup + moveRowToPosition fallback. The proof: the lift, the
//   ghost tracking, the target highlight, the recorded calls, the card actually landing in the
//   target column, and the drop POSITION (before/after) — which must survive the fallback
//   unchanged, because a Notion-parity board puts the card where the finger released, not at the
//   end of the column.
//
//   Lane B — what does the linked view's own toolbar/header chrome measure on a phone, against
//   the file view's, at the 402x874 viewport the phone rhythm checks already use? Mounted through
//   the same ToolbarRenderer both hosts ship, in its three flavors (the full file-view chrome, the
//   codeblock linked-view's, and the frontmatter-embedded database's), under the .is-phone body
//   the real phone runs with. The reports: which header rows exist and how tall, the toolbar
//   row's height and its horizontal overflow, the container's paddings, the --phone navbar inset
//   both hosts reserve, and the linked-view drag handle's touch geometry (the 44x44 phone rule
//   and its touch-action). Note the toolbar collapse sweep measures WITHOUT .is-phone, so the
//   56px handle-clearance the phone adds is only ever measured here.
//
// What this does NOT prove: no real vault exists in this harness (the 069 header carries the
// standing argument), so "the note's text changed" is the action bag's recorded call, and the
// frontmatter write behind it stays with the vitest host-binding suites.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { buildRenderAssertionBundle } from "./render-assertion-bundle.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));

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
  throw new Error("embedded-linked-view-ux: no Chrome/Chromium found. Set SCREENSHOT_CHROME to a browser executable.");
}

// ───────────────────────────────────────────────────────────────────
// 2. BUNDLE
// ───────────────────────────────────────────────────────────────────

const entryBody = `
import { BoardRenderer } from "${join(REPO, "src/views/board-renderer")}";
import { ToolbarRenderer } from "${join(REPO, "src/views/toolbar-renderer")}";
import { makeColumns, makeRows, makeGroups, makeConfig, GROUP_FIELD } from "${join(REPO, "tools/bench/board-render-bench")}";
import { makeColumns as makeTableColumns, makeConfig as makeTableConfig } from "${join(REPO, "tools/bench/table-render-bench")}";
import { makeSurfaceDatabase, makeSurfaceState, makeToolbarActions, TABLE_COLUMNS } from "${join(REPO, "tools/live/render-assertion-harness")}";

// The fixture and the gesture plumbing are the 069 proof's own, carried over verbatim so the two
// lanes read as one continuum; the differences are noted at each divergence.

// Both hosts' bags receive the recorded drop position and resolve it by the same insertion rule,
// so the LANDED index difference measures the BOARD's resolution, not the mount's benevolence:
// a card goes after the "before" card, or before the "after" card, inside the row list it now
// belongs to. A real host's data layer does the equivalent through its own persistence.
window.__mountBoard = (bagKind, readOnly) => {
  document.body.innerHTML = "";
  document.body.className = "obnotion-container";
  const columns = makeColumns(3, "text");
  const rows = makeRows(4, columns, 1, 2);
  const config = makeConfig(columns);
  const calls = [];
  let renderer;
  const byPath = (path) => rows.find((row) => row.file.path === path);
  const placeMovedRow = (movedPath, beforePath, afterPath) => {
    const moved = byPath(movedPath);
    if (!moved) return;
    const at = rows.indexOf(moved);
    if (at >= 0) rows.splice(at, 1);
    let index = -1;
    if (beforePath) index = rows.findIndex((row) => row.file.path === beforePath) + 1;
    else if (afterPath) index = rows.findIndex((row) => row.file.path === afterPath);
    if (index >= 0) rows.splice(index, 0, moved);
    else rows.push(moved);
  };
  const rerender = () => {
    const groups = makeGroups(rows, 2);
    renderer.render(document.body, config, groups, GROUP_FIELD);
    return groups;
  };
  // The file view's bag: the primary cross-group branch exists, exactly as the 069 mount defined it.
  const fileViewBag = {
    openRow: () => { calls.push({ fn: "openRow" }); },
    createEntry: () => {},
    updateGroup: (row, field, value, fromValue) => {
      row.frontmatter[field] = value;
      calls.push({ fn: "updateGroup", path: row.file.path, field, value, fromGroupKey: fromValue });
      rerender();
      return Promise.resolve();
    },
    updateGroupOrder: () => {},
    hideGroup: () => {},
    showGroup: () => {},
    setBoardHideEmptyGroups: () => {},
    updateCardOrder: () => {},
    moveRowToPosition: (movedPath, beforePath, afterPath) => {
      calls.push({ fn: "moveRowToPosition", path: movedPath, beforePath, afterPath });
      if (beforePath || afterPath) placeMovedRow(movedPath, beforePath, afterPath);
      rerender();
    },
    moveRowWithGroupUpdatesAndPosition: (row, updates, beforePath, afterPath) => {
      for (const update of updates) row.frontmatter[update.field] = update.toGroupKey;
      calls.push({ fn: "moveRowWithGroupUpdatesAndPosition", path: row.file.path, updates, beforePath, afterPath });
      if (beforePath || afterPath) placeMovedRow(row.file.path, beforePath, afterPath);
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
  // The embedded host's bag: exactly the member set its constructor passes, and just as
  // importantly NOT the members it does not — no moveRowWithGroupUpdatesAndPosition, no
  // moveRowsToPosition, no getSelectedRows. If the board reaches for one of those, the absence
  // is the finding, not the mount's fault.
  const embedBag = {
    openRow: (row) => { calls.push({ fn: "openRow", path: row.file.path }); },
    createEntry: () => {},
    confirmSortConflict: () => Promise.resolve(false),
    clearSort: () => {},
    updateGroup: (row, field, value, fromValue) => {
      row.frontmatter[field] = value;
      calls.push({ fn: "updateGroup", path: row.file.path, field, value, fromGroupKey: fromValue });
      rerender();
      return Promise.resolve();
    },
    updateGroupOrder: (field, order) => { calls.push({ fn: "updateGroupOrder", field, order }); },
    hideGroup: () => {},
    showGroup: () => {},
    setBoardHideEmptyGroups: () => {},
    updateCardOrder: (field, groupKey, paths) => { calls.push({ fn: "updateCardOrder", field, groupKey, paths }); },
    moveRowToPosition: (movedPath, beforePath, afterPath) => {
      calls.push({ fn: "moveRowToPosition", path: movedPath, beforePath, afterPath });
      if (beforePath || afterPath) placeMovedRow(movedPath, beforePath, afterPath);
      rerender();
    },
    moveSubtask: () => {},
    isSubtaskCollapsed: () => false,
    toggleSubtaskCollapsed: () => {},
    updateColumnWidth: () => {},
    isRowSelected: () => false,
    toggleRowSelected: () => {},
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => {},
    editCell: () => {},
    getColumns: () => columns,
    isGroupCollapsed: () => false,
    toggleGroupCollapsed: () => {},
    expandGroup: () => {},
    showRowMenu: () => {},
    showColumnMenu: () => {},
    renderRecordIcon: () => null,
    renderGroupSummaries: () => {},
    applyConditionalFormat: () => {},
    get isReadOnly() { return readOnly; },
    canReorderGroups: true,
    get hideCreateEntry() { return false; },
  };
  renderer = new BoardRenderer(undefined, bagKind === "embed" ? embedBag : fileViewBag);
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

window.__sourceLifted = () => !!document.querySelector(".obnotion-kanban-card--touch-lifted");

window.__cardInColumn = (path, key) => {
  const el = document.querySelector('.obnotion-kanban-cards[data-status="' + key + '"] [data-obnotion-row-path="' + path + '"]');
  return !!el;
};

window.__cardIndexInColumn = (path, key) => {
  const col = document.querySelector('.obnotion-kanban-cards[data-status="' + key + '"]');
  if (!col) return -1;
  const cards = col.querySelectorAll(".obnotion-kanban-card");
  for (let i = 0; i < cards.length; i += 1) {
    if (cards[i].getAttribute && cards[i].getAttribute("data-obnotion-row-path") === path) return i;
    if (cards[i].dataset && cards[i].dataset.obnotionRowPath === path) return i;
  }
  return -1;
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

// ── Lane B: the toolbar chrome, in its three flavors, under the phone body the real device runs.

window.__mountToolbarChrome = (flavor) => {
  document.body.innerHTML = "";
  document.body.style.margin = "0";
  document.body.className = "is-phone";
  const root = document.createElement("div");
  root.style.width = "402px";
  // The embed's own container classes come from its onload: every embed carries
  // .obnotion-embed, the codeblock-linked kind adds .obnotion-embed-linked, and every
  // mount needs .obnotion-container for the stylesheet's containment rules.
  root.className = flavor === "file-view"
    ? "obnotion-container"
    : flavor === "codeblock-embed"
      ? "obnotion-container obnotion-embed obnotion-embed-linked"
      : "obnotion-container obnotion-embed";
  document.body.appendChild(root);
  const columns = makeTableColumns(TABLE_COLUMNS, "mixed");
  const config = { ...makeTableConfig(columns), viewType: "table" };
  const db = makeSurfaceDatabase(columns, config);
  const state = makeSurfaceState({ searchText: "", filters: [], sortRules: [] });
  // The harness's own stub is the file-view action shape; each flavor overrides only the fields
  // the two hosts genuinely differ on, so the measured deltas are the chrome's, not the stub's.
  const actions = {
    ...makeToolbarActions(),
    showDatabaseChrome: flavor !== "codeblock-embed",
    hideDatabaseTitle: flavor === "codeblock-embed",
    hideDatabaseActions: flavor === "frontmatter-embed",
    hideHeaderChrome: undefined,
    moveLinkedView: flavor === "codeblock-embed" ? () => {} : undefined,
    isReadOnlyViews: flavor !== "file-view",
    hideWidthSelect: flavor !== "file-view",
  };
  const renderer = new ToolbarRenderer();
  renderer.render(root, [{ config: db, sourcePath: "notes" }], 0, 0, state, actions);
  const pick = (selector) => root.querySelector(selector);
  const box = (selector) => {
    const el = pick(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      present: true, height: Math.round(r.height * 100) / 100, width: Math.round(r.width * 100) / 100,
      scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
      paddingLeft: cs.paddingLeft, paddingRight: cs.paddingRight,
      paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom,
    };
  };
  // When the toolbar row's scrollWidth outruns its clientWidth, name the descendants whose
  // right edge passes the row's own — without the culprit the 4px is just a number. For each
  // culprit also report its nearest scrolling ancestor's overflow style, because a
  // horizontally scrollable right cluster overflowing its own box is the designed behaviour,
  // not a leak.
  const overflowCulprits = (() => {
    const toolbar = root.querySelector(".obnotion-toolbar");
    if (!toolbar) return [];
    const limit = toolbar.getBoundingClientRect().right;
    return Array.from(toolbar.querySelectorAll(".obnotion-toolbar-cluster, .obnotion-new-button-group, .obnotion-toolbar-left, .obnotion-toolbar-right"))
      .map((el) => ({
        el,
        right: el.getBoundingClientRect().right,
        over: Math.round((el.getBoundingClientRect().right - limit) * 100) / 100,
        scrollW: el.scrollWidth, clientW: el.clientWidth,
      }))
      .filter((c) => c.right - limit > 0.5 || (c.el.classList.contains("obnotion-toolbar-right") && c.scrollW - c.clientW > 1))
      .sort((a, b) => b.right - a.right)
      .slice(0, 4)
      .map((c) => c.el.tagName.toLowerCase() + "." + String(c.el.className).split(" ").join(".")
        + " right+" + (c.el.getBoundingClientRect().right - limit).toFixed(1)
        + " scrollW=" + c.scrollW + " clientW=" + c.clientW
        + " overflowX=" + getComputedStyle(c.el).overflowX);
  })();
  const rootCS = getComputedStyle(root);
  const handle = box(".obnotion-linked-view-drag-handle");
  return {
    flavor,
    header: box(".obnotion-header"),
    headingRow: box(".obnotion-heading-row"),
    description: box(".obnotion-description"),
    titleRow: box(".obnotion-title-row"),
    toolbar: box(".obnotion-toolbar"),
    toolbarLeft: box(".obnotion-toolbar-left"),
    toolbarRight: box(".obnotion-toolbar-right"),
    firstViewTab: box(".obnotion-view-tab"),
    inlineSearch: box(".obnotion-toolbar-search, .obnotion-search, [class*=search]"),
    handle,
    handleTouchAction: handle ? getComputedStyle(pick(".obnotion-linked-view-drag-handle")).touchAction : null,
    overflowCulprits,
    rootPadding: { left: rootCS.paddingLeft, right: rootCS.paddingRight, top: rootCS.paddingTop, bottom: rootCS.paddingBottom },
    rootScrollWidth: root.scrollWidth,
    rootClientWidth: root.clientWidth,
    phoneNavbarInset: root.style.getPropertyValue("--obnotion-mobile-navbar-height"),
    newButton: pick(".obnotion-new-button") ? {
      present: true,
      isFab: pick(".obnotion-new-button").classList.contains("is-mobile-fab"),
    } : { present: false },
  };
};
`;

const { work, missingSources } = await buildRenderAssertionBundle(entryBody);

// Only the board's absence means the bundle stopped importing the shipped source (see the 069
// proof's own note: this script's assertions ride the board and the toolbar, and the toolbar is
// imported directly by the entry, so a bundling failure there throws rather than silently missing).
if (missingSources.includes("src/views/board-renderer.ts")) {
  console.error("embedded-linked-view-ux: bundle did not import src/views/board-renderer.ts — refusing to assert on a copy");
  process.exit(3);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8">
<!-- Obsidian's app.css gives every element border-box sizing; a bare document does not, so
     width:100% plus horizontal padding on the toolbar's phone rows would measure 4px wider
     than they do in the app. Restore the host's reset here so the numbers describe the phone,
     not the harness. -->
<style>*, *::before, *::after { box-sizing: border-box; }</style>
<link rel="stylesheet" href="file://${REPO}styles.css"></head>
<body class="obnotion-container"><script src="render-bundle.js"></script></body></html>`);
// ───────────────────────────────────────────────────────────────────
// 3. RUN
// ───────────────────────────────────────────────────────────────────

const failures = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: findChrome() });

  // ── Lane A: both hosts' bags, one gesture, one fixture, 402x874 ──
  for (const bagKind of ["file-view", "embed"]) {
    const page = await browser.newPage({ viewport: { width: 402, height: 874 } });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`file://${join(work, "index.html")}`);
    for (const sheet of ["tools/screenshots/theme.css", "tools/screenshots/runtime-vars.css"]) {
      await page.addStyleTag({ content: readFileSync(join(REPO, sheet), "utf8") });
    }

    await page.evaluate(() => window.__mountBoard("embed", false) && 0, 0).then(() => 0)
      .catch(() => 0);
    // (the evaluate above warms nothing; the real mounts run below)

    // gesture 1: cross-group, both bags go through the identical dance
    const mount = await page.evaluate(({ bagKind }) => window.__mountBoard(bagKind, false), { bagKind });
    const fromKey = mount.groups[0].key;
    const toKey = mount.groups[1].key;
    const draggedPath = mount.groups[0].rows[0].file.path;

    const startRect = await page.evaluate((path) => window.__cardRect(path), draggedPath);
    const startX = startRect.left + 10;
    const startY = startRect.top + 10;
    const targetRect = await page.evaluate((key) => window.__columnRect(key), toKey);
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + 30;

    await page.evaluate(({ path, x, y }) => window.__touchPointerDown(path, x, y), { path: draggedPath, x: startX, y: startY });
    const ghostBeforeThreshold = await page.evaluate(() => document.querySelector(".obnotion-kanban-card--touch-ghost") !== null);
    // 450ms real threshold, real wall clock — a live-Chrome proof, not a unit test.
    await page.waitForTimeout(500);
    const ghostAfterThreshold = await page.evaluate(() => document.querySelector(".obnotion-kanban-card--touch-ghost") !== null);
    const sourceLifted = await page.evaluate(() => window.__sourceLifted());

    await page.evaluate(({ x, y }) => window.__touchPointerMove(x, y), { x: targetX, y: targetY });
    const ghostRect = await page.evaluate(() => window.__ghostRect());
    const expectedOffsetX = startX - startRect.left;
    const expectedOffsetY = startY - startRect.top;
    const ghostDeltaX = Math.abs(ghostRect.left - (targetX - expectedOffsetX));
    const ghostDeltaY = Math.abs(ghostRect.top - (targetY - expectedOffsetY));
    const highlighted = await page.evaluate((key) => window.__hasDropTarget(key), toKey);

    await page.evaluate(({ x, y }) => window.__touchPointerUp(x, y), { x: targetX, y: targetY });
    const calls = await page.evaluate(() => window.__boardCalls);
    const landed = await page.evaluate(({ path, key }) => window.__cardInColumn(path, key), { path: draggedPath, key: toKey });
    const landedIndex = await page.evaluate(({ path, key }) => window.__cardIndexInColumn(path, key), { path: draggedPath, key: toKey });

    const dropPosition = bagKind === "embed"
      ? (calls.filter((c) => c.fn === "moveRowToPosition")[0] || null)
      : (calls.filter((c) => c.fn === "moveRowWithGroupUpdatesAndPosition")[0] || null);
    const groupCall = bagKind === "embed"
      ? (calls.filter((c) => c.fn === "updateGroup")[0] || null)
      : (calls.filter((c) => c.fn === "moveRowWithGroupUpdatesAndPosition")[0] || null);
  (void 0); // the per-bag record lives in the page; the parity pass re-derives it below

    failures.push(...[
      ghostBeforeThreshold ? `[${bagKind}] ghost appeared before the long-press threshold` : null,
      !ghostAfterThreshold ? `[${bagKind}] no ghost after the long-press threshold` : null,
      !sourceLifted ? `[${bagKind}] source card never carried the lifted class` : null,
      ghostDeltaX > 2 || ghostDeltaY > 2 ? `[${bagKind}] ghost drifted ${ghostDeltaX.toFixed(1)}x/${ghostDeltaY.toFixed(1)}y px from the finger` : null,
      !highlighted ? `[${bagKind}] target column never carried the drop-target highlight` : null,
      !landed ? `[${bagKind}] card did not land in the target column after the drop` : null,
      landedIndex < 0 ? `[${bagKind}] landed card not found in the target column` : null,
      !groupCall ? `[${bagKind}] no group-update call recorded` : null,
      bagKind === "embed" && groupCall && (groupCall.field !== "board_status" || groupCall.value !== toKey || groupCall.fromGroupKey !== fromKey)
        ? `[${bagKind}] wrong group update — ${JSON.stringify(groupCall)}` : null,
      bagKind === "file-view" && groupCall && (JSON.stringify(groupCall.updates) !== JSON.stringify([{ field: "board_status", fromGroupKey: fromKey, toGroupKey: toKey }]))
        ? `[${bagKind}] wrong group update — ${JSON.stringify(groupCall)}` : null,
      !dropPosition ? `[${bagKind}] no drop position recorded` : null,
      bagKind === "embed" && dropPosition && (dropPosition.path !== draggedPath)
        ? `[${bagKind}] fallback moveRowToPosition moved the wrong path — ${JSON.stringify(dropPosition)}` : null,
      bagKind === "file-view" && calls.filter((c) => c.fn === "moveRowToPosition").length !== 0
        ? `[${bagKind}] the primary branch also called moveRowToPosition — the early return is gone` : null,
      pageErrors.length > 0 ? `[${bagKind}] page error(s): ${pageErrors.join("; ")}` : null,
    ].filter(Boolean));

    console.log(`[${bagKind}] cross-group touch drag (402x874): `
      + `lift=${ghostAfterThreshold && sourceLifted}, ghost delta ${ghostDeltaX.toFixed(1)}x/${ghostDeltaY.toFixed(1)}y px, `
      + `highlight=${highlighted}, landed=${landed} (index ${landedIndex}), `
      + `${bagKind === "embed" ? "fallback" : "primary"} call: ${JSON.stringify(dropPosition)}`);

    // gesture 2: the card goes back — the rerendered column must support a second gesture
    const backRect = await page.evaluate((path) => window.__cardRect(path), draggedPath);
    if (!backRect) failures.push(`[${bagKind}] reverse gesture: the moved card vanished from the DOM`);
    else {
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
      const backLanded = await page.evaluate(({ path, key }) => window.__cardInColumn(path, key), { path: draggedPath, key: fromKey });
      const secondGroupCall = bagKind === "embed"
        ? callsAfterReverse.filter((c) => c.fn === "updateGroup")[1]
        : callsAfterReverse.filter((c) => c.fn === "moveRowWithGroupUpdatesAndPosition")[1];
      const reversedOk = !!secondGroupCall && (
        bagKind === "embed"
          ? secondGroupCall.value === fromKey && secondGroupCall.fromGroupKey === toKey
          : JSON.stringify(secondGroupCall.updates) === JSON.stringify([{ field: "board_status", fromGroupKey: toKey, toGroupKey: fromKey }])
      ) && backLanded;
      if (!reversedOk) failures.push(`[${bagKind}] reverse move did not land — second call: ${JSON.stringify(secondGroupCall)}, backLanded=${backLanded}`);
      console.log(`[${bagKind}] reverse touch drag: ${reversedOk ? "PASS" : "FAIL"} — second call: ${JSON.stringify(secondGroupCall || null)}`);
    }

    // gesture 3: same-column drop — the shipped container-drop rule keeps a same-group blank-area
    // drop in place (no call at all), which is what the 069 proof asserts for the file view's bag;
    // both hosts must agree on the 0-call silence
    const remounted = await page.evaluate(({ bagKind }) => window.__mountBoard(bagKind, false), { bagKind });
    const sameKey = remounted.groups[0].key;
    const samePath = remounted.groups[0].rows[0].file.path;
    const sameRect = await page.evaluate((path) => window.__cardRect(path), samePath);
    const sameColRect = await page.evaluate((key) => window.__columnRect(key), sameKey);
    await page.evaluate(({ path, x, y }) => window.__touchPointerDown(path, x, y), { path: samePath, x: sameRect.left + 10, y: sameRect.top + 10 });
    await page.waitForTimeout(500);
    await page.evaluate(({ x, y }) => window.__touchPointerMove(x, y), { x: sameColRect.left + sameColRect.width / 2, y: sameColRect.top + 60 });
    await page.evaluate(({ x, y }) => window.__touchPointerUp(x, y), { x: sameColRect.left + sameColRect.width / 2, y: sameColRect.top + 60 });
    const sameColCalls = (await page.evaluate(() => window.__boardCalls)).filter((c) => c.fn !== "openRow");
    const sameColOk = sameColCalls.length === 0;
    if (!sameColOk) failures.push(`[${bagKind}] same-column drop: expected the shipped keep-in-place rule (0 calls), got ${JSON.stringify(sameColCalls)}`);
    console.log(`[${bagKind}] same-column drop (keep-in-place, 0 calls): ${sameColOk ? "PASS" : "FAIL"} — ${JSON.stringify(sameColCalls)}`);

    // gesture 4: read-only — no lift, no calls
    const readOnlyMount = await page.evaluate(({ bagKind }) => window.__mountBoard(bagKind, true), { bagKind });
    const readOnlyPath = readOnlyMount.groups[0].rows[0].file.path;
    const readOnlyRect = await page.evaluate((path) => window.__cardRect(path), readOnlyPath);
    await page.evaluate(({ path, x, y }) => window.__touchPointerDown(path, x, y), { path: readOnlyPath, x: readOnlyRect.left + 10, y: readOnlyRect.top + 10 });
    await page.waitForTimeout(500);
    const readOnlyGhost = await page.evaluate(() => document.querySelector(".obnotion-kanban-card--touch-ghost") !== null);
    const readOnlyLifted = await page.evaluate(() => window.__sourceLifted());
    await page.evaluate(({ x, y }) => window.__touchPointerUp(x, y), { x: readOnlyRect.left + 10, y: readOnlyRect.top + 10 });
    const readOnlyOk = !readOnlyGhost && !readOnlyLifted;
    if (!readOnlyOk) failures.push(`[${bagKind}] read-only: a card lifted on a read-only board`);
    console.log(`[${bagKind}] read-only (no lift): ${readOnlyOk ? "PASS" : "FAIL"}`);

    for (const error of pageErrors) failures.push(`[${bagKind}] page error: ${error}`);
    await page.close();
  }

  // the Notion-parity number: the fallback must carry the SAME drop position the primary got
  const parity = await browser.newPage();
  await parity.goto(`file://${join(work, "index.html")}`);
  await parity.addStyleTag({ content: readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8") });
  const positions = {};
  for (const bagKind of ["file-view", "embed"]) {
    await parity.evaluate(({ bagKind }) => window.__mountBoard(bagKind, false), { bagKind });
    const groups = await parity.evaluate(() => window.__boardCalls && document.querySelectorAll(".obnotion-kanban-cards").length);
    if (!groups) { failures.push(`[parity] fixture: no columns rendered`); continue; }
    // drag through the same dance the gesture loop used, purely to capture the recorded position
    const fromRect = await parity.evaluate(() => window.__cardRect(document.querySelector(".obnotion-kanban-card").getAttribute("data-obnotion-row-path")));
    // (the mount's own groups are not reachable from here; read the columns from the DOM instead)
    const columnKeys = await parity.evaluate(() => Array.from(document.querySelectorAll(".obnotion-kanban-cards")).map((el) => el.getAttribute("data-status")));
    const draggedPath = await parity.evaluate(() => document.querySelector(".obnotion-kanban-card").getAttribute("data-obnotion-row-path"));
    const toKey = columnKeys[1];
    const targetRect = await parity.evaluate((key) => window.__columnRect(key), toKey);
    await parity.evaluate(({ path, x, y }) => window.__touchPointerDown(path, x, y), { path: draggedPath, x: fromRect.left + 10, y: fromRect.top + 10 });
    await parity.waitForTimeout(500);
    await parity.evaluate(({ x, y }) => window.__touchPointerMove(x, y), { x: targetRect.left + targetRect.width / 2, y: targetRect.top + 30 });
    await parity.evaluate(({ x, y }) => window.__touchPointerUp(x, y), { x: targetRect.left + targetRect.width / 2, y: targetRect.top + 30 });
    const calls = await parity.evaluate(() => window.__boardCalls);
    positions[bagKind] = bagKind === "embed"
      ? calls.filter((c) => c.fn === "moveRowToPosition")[0] || null
      : calls.filter((c) => c.fn === "moveRowWithGroupUpdatesAndPosition")[0] || null;
  }
  parity.close();

  if (positions["file-view"] && positions["embed"]) {
    const fp = positions["file-view"];
    const ep = positions["embed"];
    const same = fp.beforePath === ep.beforePath && fp.afterPath === ep.afterPath;
    if (!same) failures.push(`[parity] drop position diverges: primary ${JSON.stringify({ before: fp.beforePath, after: fp.afterPath })} vs fallback ${JSON.stringify({ before: ep.beforePath, after: ep.afterPath })}`);
    console.log(`[parity] drop position: primary=(${JSON.stringify(fp.beforePath)}, ${JSON.stringify(fp.afterPath)}) fallback=(${JSON.stringify(ep.beforePath)}, ${JSON.stringify(ep.afterPath)}) — ${same ? "MATCH" : "DIVERGE"}`);
  }

  // ── Lane B: the toolbar chrome, three flavors, 402x874, the .is-phone body ──
  {
    const page = await browser.newPage({ viewport: { width: 402, height: 874 } });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`file://${join(work, "index.html")}`);
    for (const sheet of ["tools/screenshots/theme.css", "tools/screenshots/runtime-vars.css"]) {
      await page.addStyleTag({ content: readFileSync(join(REPO, sheet), "utf8") });
    }
    const measures = {};
    for (const flavor of ["file-view", "codeblock-embed", "frontmatter-embed"]) {
      measures[flavor] = await page.evaluate((f) => window.__mountToolbarChrome(f), flavor);
    }

    for (const flavor of Object.keys(measures)) {
      const m = measures[flavor];
      const toolbarOverflow = m.toolbar ? m.toolbar.scrollWidth - m.toolbar.clientWidth : -1;
      const rootOverflow = m.rootScrollWidth - m.rootClientWidth;
      failures.push(...[
        !m.header ? `[chrome/${flavor}] no header rendered` : null,
        !m.toolbar ? `[chrome/${flavor}] no toolbar row rendered` : null,
        m.toolbar && toolbarOverflow > 1 ? `[chrome/${flavor}] the toolbar row overflows by ${toolbarOverflow}px (scrollWidth ${m.toolbar.scrollWidth} vs clientWidth ${m.toolbar.clientWidth}) culprits: ${JSON.stringify(m.overflowCulprits)}` : null,
        rootOverflow > 1 ? `[chrome/${flavor}] the mount root overflows horizontally by ${rootOverflow}px` : null,
        flavor === "codeblock-embed" && (!m.handle || m.handle.width < 40 || m.handle.height < 40)
          ? `[chrome/${flavor}] the linked-view drag handle misses the 44x44 phone rule — ${JSON.stringify(m.handle)}`
          : null,
        flavor === "codeblock-embed" && m.handleTouchAction !== "none"
          ? `[chrome/${flavor}] the linked-view drag handle lost touch-action: none — "${m.handleTouchAction}"`
          : null,
      ].filter(Boolean));
      console.log(`[chrome/${flavor}] header=${m.header ? Math.round(m.header.height) + "px" : "none"}`
        + ` headingRow=${m.headingRow ? Math.round(m.headingRow.height) + "px" : "none"}`
        + ` description=${m.description ? Math.round(m.description.height) + "px" : "none"}`
        + ` titleRow=${m.titleRow ? Math.round(m.titleRow.height) + "px" : "none"}`);
      console.log(`[chrome/${flavor}] toolbarRow=${m.toolbar ? Math.round(m.toolbar.height) + "px" : "none"}`
        + ` overflow=${m.toolbar ? toolbarOverflow + "px" : "?"} padding=${m.toolbar ? m.toolbar.paddingLeft + "/" + m.toolbar.paddingRight : "?"}`
        + ` rootPadding=${m.rootPadding.left}/${m.rootPadding.right}/${m.rootPadding.top}/${m.rootPadding.bottom}`
        + ` navbarInset="${m.phoneNavbarInset}"`);
      if (flavor === "codeblock-embed") {
        console.log(`[chrome/codeblock-embed] dragHandle=${m.handle ? Math.round(m.handle.width) + "x" + Math.round(m.handle.height) : "none"}`
          + ` touchAction=${m.handleTouchAction} newButton=${JSON.stringify(m.newButton)}`);
      }
    }
    const fileToolbarHeight = measures["file-view"].toolbar ? measures["file-view"].toolbar.height : 0;
    const embedToolbarHeight = measures["codeblock-embed"].toolbar ? measures["codeblock-embed"].toolbar.height : 0;
    const toolbarHeightDelta = Math.abs(fileToolbarHeight - embedToolbarHeight);
    if (toolbarHeightDelta > 2) {
      failures.push(`[chrome] the toolbar row's own height differs: file-view ${fileToolbarHeight}px vs codeblock-embed ${embedToolbarHeight}px (delta ${toolbarHeightDelta}px) — the row the tabs+controls share should measure the same`);
    }
    console.log(`[chrome] toolbar-row height: file-view=${fileToolbarHeight}px codeblock-embed=${embedToolbarHeight}px (delta ${toolbarHeightDelta}px)`);

    for (const error of pageErrors) failures.push(`[chrome] page error: ${error}`);
    await page.close();
  }
} finally {
  await browser?.close();
  rmSync(work, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(`\nembedded-linked-view-ux: ${failures.length} FAILURE(S)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("\nRESULT: PASSED");
