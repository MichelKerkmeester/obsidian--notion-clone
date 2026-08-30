// ───────────────────────────────────────────────────────────────────
// MODULE:    probe-desktop-placement
// COMPONENT: measures where every desktop dropdown family actually lands
// ───────────────────────────────────────────────────────────────────
//
// Written to be lifted into tools/storybook/verify-placement.mjs. Every check
// emits the same { name, pass, detail } record that file collects, the page
// shape is the same workspace it builds, and the shipped modules are bundled
// rather than reimplemented for the same reason: a hand-copied positioner
// proves the copy. That file is open in another session, so the merge is owed
// rather than done.
//
// Four defects are kept apart on purpose, because they have four different
// fixes: OFF-SCREEN (the box leaves the editing area), MIS-ANCHORED (the box is
// on screen but not attached to the thing that opened it), CLIPPED (the box is
// placed correctly and an ancestor cuts it), and WRONG-SIDE (the box flipped to
// a side that had no more room than the one it left, or flipped and kept the
// gap on the side it came from). Collapsing them into "the dropdown is in the
// wrong place" is what makes the same report get fixed three times.
//
// THE TRAP THIS FILE IS BUILT AROUND: a probe whose leaf sits at the viewport
// origin measures nothing, because the leaf-relative and viewport-relative
// coordinates of a fixed descendant coincide there and the offset under test is
// zero by construction. The page therefore puts a 300px left sidebar before the
// root split, and the two checks named "GUARD ..." go red if that ever stops
// being true — so a run that silently lost its offset fails loudly instead of
// passing everything.
//
// One check is a DECLARED RED, listed in DECLARED_RED below with its reason.
// Exit status ignores those and only those, so an unexpected failure still fails
// the run.
//
// Usage: node probe-desktop-placement.mjs [--json]

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../../../..", import.meta.url));
const SIDEBAR = 300;
const VIEWPORT = { width: 1440, height: 900 };

const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find(existsSync) || process.env.SCREENSHOT_CHROME;

// ───────────────────────────────────────────────────────────────────
// 3. BUNDLE THE SHIPPED PLACEMENT PATHS
// ───────────────────────────────────────────────────────────────────

const work = mkdtempSync(join(tmpdir(), "desktop-placement-"));
const entry = join(work, "entry.ts");
const bundle = join(work, "bundle.js");

writeFileSync(entry, `
import {
  positionToolbarPopover, getVisiblePopoverBounds, setPosition, clamp,
  resolvePopoverHorizontalLeft, COMPACT_MENU_POPOVER, PANEL_POPOVER,
} from "${join(REPO, "src/views/popover-position")}";
import { createOwnedMenu } from "${join(REPO, "src/views/owned-menu")}";
import { createMenuRow } from "${join(REPO, "src/views/menu-row")}";
globalThis.__p = {
  positionToolbarPopover, getVisiblePopoverBounds, setPosition, clamp,
  resolvePopoverHorizontalLeft, COMPACT_MENU_POPOVER, PANEL_POPOVER,
  createOwnedMenu, createMenuRow,
};
`);

execFileSync(join(REPO, "node_modules/.bin/esbuild"), [
  entry, "--bundle", "--format=iife", `--outfile=${bundle}`,
  `--alias:obsidian=${join(REPO, "tools/storybook/obsidian-stub.mjs")}`,
], { stdio: "pipe" });

const positionerJs = readFileSync(bundle, "utf8");
const shimJs = readFileSync(join(REPO, "tools/storybook/obsidian-dom-shim.mjs"), "utf8")
  .replace(/^export /gm, "");

// ───────────────────────────────────────────────────────────────────
// 4. THE PAGE — Obsidian's workspace shape
// ───────────────────────────────────────────────────────────────────
//
// `body { contain: strict }` and `.workspace-leaf { contain: strict !important }`
// are reproduced from the shipped Obsidian stylesheet because they decide what is
// even possible: paint containment makes an element the containing block for its
// fixed-position descendants AND clips them. A page without them certifies a
// viewport-relative mechanism the app does not provide.

const pageHtml = (opts = {}) => {
  const leftSidebar = opts.leftSidebar === false ? "none" : "block";
  const splitWidth = opts.splitWidth ? `flex: 0 0 ${opts.splitWidth}px; width: ${opts.splitWidth}px;` : "flex: 1 1 auto;";
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; contain: strict; width: 100vw; height: 100vh; }
  .app-container { display: flex; width: 100vw; height: 100vh; }
  .workspace { display: flex; width: 100%; }
  .workspace-split.mod-root { ${splitWidth} position: relative; overflow: hidden; }
  .workspace-split.mod-right-split { width: ${SIDEBAR}px; flex: 0 0 ${SIDEBAR}px; background: #eee; }
  .workspace-split.mod-left-split { width: ${SIDEBAR}px; flex: 0 0 ${SIDEBAR}px; background: #eee; display: ${leftSidebar}; }
  .workspace-leaf { position: relative; contain: strict !important; overflow: hidden; isolation: isolate; }
  .workspace-leaf, .workspace-leaf-content, .view-content { height: 100%; }
  .note-database-container { position: relative; height: 100%; padding: 40px; overflow: auto; }
  .anchor { width: 120px; height: 28px; background: #ccd; }
  .probe-panel { background: #fff; border: 1px solid #999; }
  .probe-panel .row { height: 30px; }
  .spacer { height: 2000px; }
</style></head><body>
  <div class="app-container"><div class="workspace">
    <div class="workspace-split mod-left-split"></div>
    <div class="workspace-split mod-root">
      <div class="workspace-leaf"><div class="workspace-leaf-content"><div class="view-content">
      <div class="note-database-container"><div class="anchor" id="anchor"></div></div>
      </div></div></div>
    </div>
    <div class="workspace-split mod-right-split"></div>
  </div></div>
</body></html>`;
};

// ───────────────────────────────────────────────────────────────────
// 5. MEASURE
// ───────────────────────────────────────────────────────────────────

const browser = await chromium.launch({ executablePath: CHROME });

async function openPage(opts) {
  const page = await browser.newPage({ viewport: opts?.viewport ?? VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(pageHtml(opts));
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });
  return page;
}

const all = [];

// ── 5a. DESKTOP, THE DEFAULT LAYOUT ────────────────────────────────

const page = await openPage();
all.push(...await page.evaluate(async () => {
  const out = [];
  const P = globalThis.__p;
  const container = document.querySelector(".note-database-container");
  const leaf = document.querySelector(".workspace-leaf");
  const split = document.querySelector(".workspace-split.mod-root").getBoundingClientRect();
  const leafRect = leaf.getBoundingClientRect();
  const bounds = P.getVisiblePopoverBounds(null);

  // ── GUARD: the trap. Without this every number below is zero by construction.
  out.push({
    name: "GUARD the leaf is not at the viewport origin",
    pass: leafRect.left >= 200,
    detail: `leaf.left=${Math.round(leafRect.left)}px. At 0 the leaf-relative and viewport-relative `
      + `coordinates of a fixed descendant coincide, so every containing-block check below would `
      + `pass against a broken positioner.`,
  });

  // ── GUARD: containment is actually in force.
  out.push({
    name: "GUARD the leaf and body both establish a fixed containing block",
    pass: /strict|paint|content|layout/.test(getComputedStyle(leaf).contain)
      && /strict|paint|content|layout/.test(getComputedStyle(document.body).contain),
    detail: `leaf contain=${getComputedStyle(leaf).contain} body contain=${getComputedStyle(document.body).contain}`,
  });

  const buildPanel = (host, rows, cls = "probe-panel") => {
    const p = host.createDiv({ cls });
    for (let i = 0; i < rows; i += 1) p.createDiv({ cls: "row", text: `Item ${i}` });
    return p;
  };

  const buildMenu = (rowCount) => {
    const menu = P.createOwnedMenu(document);
    for (let i = 0; i < rowCount; i += 1) menu.addRow({ title: `Row ${i}`, onClick: () => undefined });
    return menu;
  };

  // ─────────────────────────────────────────────────────────────────
  // CLASS A — positionToolbarPopover, container mount
  // Covers the toolbar menus, view-config, filter, sort, column manager,
  // chart options, calendar toolbar, active-rule popover: 28 of 34 sites.
  // ─────────────────────────────────────────────────────────────────

  const anchor = document.getElementById("anchor");
  const a1 = buildPanel(container, 5);
  P.positionToolbarPopover(a1, anchor, P.COMPACT_MENU_POPOVER);
  const a1r = a1.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();

  out.push({
    name: "A container-mounted panel is anchored to its trigger, not to the leaf origin",
    pass: Math.abs(a1r.top - (anchorRect.bottom + 6)) <= 1,
    detail: `panel.top=${Math.round(a1r.top)} anchor.bottom=${Math.round(anchorRect.bottom)} `
      + `gap=${Math.round(a1r.top - anchorRect.bottom)}px (want 6)`,
  });

  // CONTROL. The pre-fix behaviour, reproduced deliberately: place the same panel
  // with no containing-block compensation. If this does not move the number, the
  // check above cannot tell a corrected positioner from an uncorrected one and
  // every "anchored" result in this file is worthless.
  const ctl = buildPanel(container, 5);
  ctl.setCssProps({ position: "fixed" });
  P.setPosition(ctl, anchorRect.left, anchorRect.bottom + 6, undefined, 0, 0);
  const ctlr = ctl.getBoundingClientRect();
  out.push({
    name: "CONTROL uncompensated placement is displaced by the leaf origin",
    pass: Math.abs(ctlr.top - a1r.top) > 8 || Math.abs(ctlr.left - a1r.left) > 8,
    detail: `corrected=[${Math.round(a1r.left)},${Math.round(a1r.top)}] `
      + `uncorrected=[${Math.round(ctlr.left)},${Math.round(ctlr.top)}] `
      + `displacement=[${Math.round(ctlr.left - a1r.left)},${Math.round(ctlr.top - a1r.top)}]px `
      + `(leaf origin is [${Math.round(leafRect.left)},${Math.round(leafRect.top)}])`,
  });
  ctl.remove();

  out.push({
    name: "A container-mounted panel stays inside the editing area",
    pass: Math.round(a1r.right) <= Math.round(split.right) + 1 && Math.round(a1r.left) >= Math.round(split.left) - 1,
    detail: `panel=[${Math.round(a1r.left)}..${Math.round(a1r.right)}] editing area=[${Math.round(split.left)}..${Math.round(split.right)}]`,
  });

  // Not clipped: read the document, because a clipped box still reports full geometry.
  const hitA = document.elementFromPoint(Math.round(a1r.left + a1r.width / 2), Math.round(a1r.bottom - 4));
  out.push({
    name: "A container-mounted panel is not clipped by the leaf",
    pass: Boolean(hitA && (a1 === hitA || a1.contains(hitA))),
    detail: `the document paints ${hitA ? (hitA.className || hitA.tagName) : "nothing"} at the panel's own bottom edge; `
      + `panel bottom=${Math.round(a1r.bottom)} leaf bottom=${Math.round(leafRect.bottom)}`,
  });
  a1.remove();

  // ─────────────────────────────────────────────────────────────────
  // CLASS B — owned menu, cursor point, body portal (11 of 14 showAt sites)
  // ─────────────────────────────────────────────────────────────────

  const shortMenu = buildMenu(5);
  shortMenu.showAt({ x: Math.round(bounds.left + 100), y: Math.round(bounds.top + 100) });
  const bm = shortMenu.el.getBoundingClientRect();
  out.push({
    name: "B owned menu at a cursor point lands at that point",
    pass: Math.abs(bm.left - (bounds.left + 100)) <= 1 && Math.abs(bm.top - (bounds.top + 100)) <= 1,
    detail: `menu=[${Math.round(bm.left)},${Math.round(bm.top)}] point=[${Math.round(bounds.left + 100)},${Math.round(bounds.top + 100)}]`,
  });
  out.push({
    name: "B owned menu stays inside the editing area",
    pass: Math.round(bm.right) <= Math.round(split.right) + 1,
    detail: `menu.right=${Math.round(bm.right)} editing area right=${Math.round(split.right)}`,
  });
  shortMenu.close();

  // ── DEFECT PROBE: a tall owned menu has no height cap and no scroll.
  // positionToolbarPopover writes maxHeight and overflowY on every placement.
  // showAt writes neither, and .db-owned-menu declares neither.
  const tallMenu = buildMenu(60);
  tallMenu.showAt({ x: Math.round(bounds.left + 100), y: Math.round(bounds.top + 40) });
  const tm = tallMenu.el.getBoundingClientRect();
  const tmStyle = getComputedStyle(tallMenu.el);
  const overflowPx = Math.round(tm.bottom - bounds.bottom);
  out.push({
    name: "B a tall owned menu is capped inside the editing area",
    pass: overflowPx <= 1,
    detail: `menu is ${Math.round(tm.height)}px tall and runs ${overflowPx}px past the editing area's `
      + `bottom edge (menu.bottom=${Math.round(tm.bottom)} bounds.bottom=${Math.round(bounds.bottom)}); `
      + `max-height=${tmStyle.maxHeight} overflow-y=${tmStyle.overflowY}`,
  });
  // Reachability, not scrollability. The obvious form of this check —
  // `scrollHeight <= clientHeight || overflow is auto` — PASSES on the broken
  // menu, because an uncapped element grows to fit its content and its
  // scrollHeight equals its clientHeight by definition. A check that is green
  // precisely because the defect is present is worse than no check.
  // So ask the document instead: is the last row somewhere a pointer can land?
  const lastRow = tallMenu.el.querySelector(".db-menu-item:last-of-type");
  // Scroll the menu to its end, then ask where the last row actually is. Reachable means
  // "a user can bring it under the pointer", not "it is visible right now" — a capped,
  // scrolling menu correctly leaves its last row off screen until scrolled.
  tallMenu.el.scrollTop = tallMenu.el.scrollHeight;
  const lastRect = lastRow.getBoundingClientRect();
  const reachable = lastRect.bottom <= bounds.bottom + 1 && lastRect.top >= bounds.top - 1;
  out.push({
    name: "B every row of a tall owned menu is reachable",
    pass: reachable,
    detail: `after scrolling to the end (scrollTop=${tallMenu.el.scrollTop}), the last row sits at `
      + `y=${Math.round(lastRect.top)}..${Math.round(lastRect.bottom)} against an editing area ending at `
      + `${Math.round(bounds.bottom)} — ${reachable ? "on screen" : "off screen"}. `
      + `scrollHeight=${tallMenu.el.scrollHeight} clientHeight=${tallMenu.el.clientHeight} `
      + `overflow-y=${tmStyle.overflowY}. Note the shape of the naive version of this check: an `
      + `UNCAPPED element grows to fit, so its scrollHeight equals its clientHeight, and asserting `
      + `"scrollHeight <= clientHeight or overflow is auto" reports success on exactly the defect `
      + `it is supposed to catch.`,
  });
  // CONTROL for the two above: the same menu built short must not trip them, or the
  // checks are measuring "menus exist" rather than "tall menus overflow".
  const ctlShort = buildMenu(5);
  ctlShort.showAt({ x: Math.round(bounds.left + 100), y: Math.round(bounds.top + 40) });
  const cs = ctlShort.el.getBoundingClientRect();
  out.push({
    name: "CONTROL a short owned menu does not overflow, so the cap check can distinguish",
    pass: Math.round(cs.bottom - bounds.bottom) <= 1,
    detail: `short menu overflow=${Math.round(cs.bottom - bounds.bottom)}px vs tall menu overflow=${overflowPx}px`,
  });
  ctlShort.close();
  tallMenu.close();

  // ─────────────────────────────────────────────────────────────────
  // CLASS C — owned menu from an ANCHOR rect (3 of 14 showAt sites):
  // column-menu.ts:214, row-menu.ts:166, embedded-database-renderer.ts:2411
  // all pass { x: rect.left, y: rect.bottom + 4 }.
  // ─────────────────────────────────────────────────────────────────

  // Put the trigger near the bottom edge so the menu must flip up.
  const lowAnchor = container.createDiv({ cls: "anchor" });
  lowAnchor.setCssProps({ position: "absolute", left: "40px", top: `${Math.round(leafRect.height - 120)}px` });
  const lar = lowAnchor.getBoundingClientRect();
  const flipMenu = buildMenu(12);
  flipMenu.showAt({ anchor: lowAnchor });
  const fm = flipMenu.el.getBoundingClientRect();
  const flipped = fm.top < lar.top;
  // A menu that flips up must sit ABOVE the trigger with the same 4px gap it would
  // have had below. The call site bakes the downward gap into the point, so flipping
  // subtracts the height from a y that is already past the trigger's bottom edge.
  const coverage = Math.round(Math.min(fm.bottom, lar.bottom) - Math.max(fm.top, lar.top));
  out.push({
    name: "C an anchor-derived owned menu that flips up clears its trigger",
    pass: !flipped || coverage <= 0,
    detail: `trigger=[${Math.round(lar.top)}..${Math.round(lar.bottom)}] menu=[${Math.round(fm.top)}..${Math.round(fm.bottom)}]; `
      + `flipped=${flipped}; the menu covers ${Math.max(0, coverage)}px of the trigger it belongs to. `
      + `Passing the anchor rather than a derived point is what makes this answerable: the point form `
      + `bakes the downward gap into y, so flipping subtracted the height from a y already below the `
      + `trigger and landed the menu's bottom 4px BELOW the trigger's bottom — a ${Math.round(lar.height + 8)}px error `
      + `that covered the whole control.`,
  });
  out.push({
    name: "C an anchor-derived owned menu keeps its gap on the side it flipped to",
    pass: !flipped || Math.abs((lar.top - fm.bottom) - 4) <= 1,
    detail: `gap above trigger = ${Math.round(lar.top - fm.bottom)}px (want 4 when flipped up)`,
  });
  flipMenu.close();

  // CONTROL: the cursor form must be UNCHANGED. A menu opened at a pointer is a different
  // request — its bottom edge meeting the cursor on an upward flip is correct, and "fixing"
  // that would move eleven call sites nobody complained about.
  const cursorMenu = buildMenu(12);
  const cursorY = Math.round(lar.bottom + 4);
  cursorMenu.showAt({ x: lar.left, y: cursorY });
  const cm = cursorMenu.el.getBoundingClientRect();
  out.push({
    name: "C CONTROL the cursor form still flips to meet the point, unchanged",
    pass: Math.abs(cm.bottom - cursorY) <= 1,
    detail: `opened at y=${cursorY}, menu bottom=${Math.round(cm.bottom)} — the point form still puts the `
      + `menu's bottom edge on the cursor. The anchor form above lands at ${Math.round(fm.bottom)} instead, `
      + `${Math.round(cursorY - fm.bottom)}px higher, which is the trigger's height plus both gaps.`,
  });
  cursorMenu.close();
  lowAnchor.remove();

  // ─────────────────────────────────────────────────────────────────
  // EDGE — right edge, bottom edge
  // ─────────────────────────────────────────────────────────────────

  const edgeAnchor = container.createDiv({ cls: "anchor" });
  edgeAnchor.setCssProps({ position: "absolute", left: `${Math.round(leafRect.width - 180)}px`, top: "40px" });
  const ear = edgeAnchor.getBoundingClientRect();

  const edgePanel = buildPanel(container, 6);
  P.positionToolbarPopover(edgePanel, edgeAnchor, P.PANEL_POPOVER);
  const epr = edgePanel.getBoundingClientRect();
  out.push({
    name: "EDGE a panel anchored at the right edge stays inside the editing area",
    pass: Math.round(epr.right) <= Math.round(split.right) + 1,
    detail: `panel.right=${Math.round(epr.right)} editing area right=${Math.round(split.right)} `
      + `anchor.right=${Math.round(ear.right)}`,
  });
  edgePanel.remove();

  const edgeMenu = buildMenu(6);
  edgeMenu.showAt({ x: Math.round(bounds.right - 20), y: Math.round(bounds.top + 60) });
  const emr = edgeMenu.el.getBoundingClientRect();
  out.push({
    name: "EDGE an owned menu opened near the right edge stays inside the editing area",
    pass: Math.round(emr.right) <= Math.round(split.right) + 1,
    detail: `menu=[${Math.round(emr.left)}..${Math.round(emr.right)}] editing area right=${Math.round(split.right)}; `
      + `opened at x=${Math.round(bounds.right - 20)}`,
  });
  edgeMenu.close();
  edgeAnchor.remove();

  // ─────────────────────────────────────────────────────────────────
  // SCROLL — the container scrolls under a placed surface
  // ─────────────────────────────────────────────────────────────────

  const spacer = container.createDiv({ cls: "spacer" });
  const scrollAnchor = container.createDiv({ cls: "anchor" });
  scrollAnchor.setCssProps({ position: "absolute", left: "40px", top: "600px" });
  container.scrollTop = 300;
  const sar = scrollAnchor.getBoundingClientRect();
  const scrollPanel = buildPanel(container, 5);
  P.positionToolbarPopover(scrollPanel, scrollAnchor, P.COMPACT_MENU_POPOVER);
  const spr = scrollPanel.getBoundingClientRect();
  out.push({
    name: "SCROLL a panel placed while the container is scrolled tracks its anchor",
    pass: Math.abs(spr.top - (sar.bottom + 6)) <= 1,
    detail: `container.scrollTop=${container.scrollTop} anchor.bottom=${Math.round(sar.bottom)} `
      + `panel.top=${Math.round(spr.top)} gap=${Math.round(spr.top - sar.bottom)}px (want 6)`,
  });
  scrollPanel.remove();
  container.scrollTop = 0;
  spacer.remove();
  scrollAnchor.remove();

  // ─────────────────────────────────────────────────────────────────
  // ANCHOR LIFETIME — the anchor is destroyed while the surface survives
  // ─────────────────────────────────────────────────────────────────
  //
  // place() early-returns when the anchor is disconnected, and the rAF loop only
  // cleans up when the PANEL goes. A view that rebuilds its toolbar on commit
  // therefore leaves a live surface pinned to where a now-deleted element used to be.

  const doomed = container.createDiv({ cls: "anchor" });
  doomed.setCssProps({ position: "absolute", left: "40px", top: "100px" });
  const orphan = buildPanel(container, 5);
  P.positionToolbarPopover(orphan, doomed, P.COMPACT_MENU_POPOVER);
  const before = orphan.getBoundingClientRect();
  const beforeVisibility = getComputedStyle(orphan).visibility;

  // Drive the REAL sequence, which is not "call the positioner again with a dead anchor".
  // The surface is opened and placed against a live anchor, which installs the reposition
  // loop; only then does a commit rebuild the panel that owned the trigger. The loop is what
  // notices, so it has to be the thing that runs. Simulating this by re-calling
  // positionToolbarPopover measures a different code path entirely — the entry guard returns
  // before `place` is ever reached, so the fix under test would never execute and the check
  // would report a failure that the running app does not have.
  doomed.remove();
  const rebuilt = container.createDiv({ cls: "anchor" });
  rebuilt.setCssProps({ position: "absolute", left: "40px", top: "400px" });
  window.dispatchEvent(new Event("resize"));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const afterVisibility = getComputedStyle(orphan).visibility;
  const after = orphan.getBoundingClientRect();
  out.push({
    name: "LIFETIME a surface whose anchor was destroyed stops presenting as placed",
    pass: afterVisibility === "hidden" || !orphan.isConnected,
    detail: `anchor destroyed while the surface stayed open, then the reposition loop ran. `
      + `visibility before=${beforeVisibility} after=${afterVisibility}; `
      + `panel.top before=${Math.round(before.top)} after=${Math.round(after.top)}. `
      + `Unhandled, the surface stays painted at the dead anchor's last coordinate, over content `
      + `that has been rebuilt underneath it, still focusable and still accepting input.`,
  });

  // CONTROL: a surface whose anchor is alive must NOT be hidden by the same loop, or the
  // check above is satisfied by a positioner that hides everything.
  const liveAnchor = container.createDiv({ cls: "anchor" });
  liveAnchor.setCssProps({ position: "absolute", left: "40px", top: "200px" });
  const kept = buildPanel(container, 5);
  P.positionToolbarPopover(kept, liveAnchor, P.COMPACT_MENU_POPOVER);
  window.dispatchEvent(new Event("resize"));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const keptRect = kept.getBoundingClientRect();
  const liveRect = liveAnchor.getBoundingClientRect();
  out.push({
    name: "LIFETIME CONTROL a surface with a live anchor survives the same loop and stays placed",
    pass: getComputedStyle(kept).visibility !== "hidden" && Math.abs(keptRect.top - (liveRect.bottom + 6)) <= 1,
    detail: `visibility=${getComputedStyle(kept).visibility} panel.top=${Math.round(keptRect.top)} `
      + `anchor.bottom=${Math.round(liveRect.bottom)} gap=${Math.round(keptRect.top - liveRect.bottom)}px`,
  });

  orphan.remove();
  rebuilt.remove();
  kept.remove();
  liveAnchor.remove();

  return out;
}));
await page.close();

// ── 5b. NARROW SPLIT ───────────────────────────────────────────────

const narrow = await openPage({ splitWidth: 420 });
all.push(...await narrow.evaluate(() => {
  const out = [];
  const P = globalThis.__p;
  const container = document.querySelector(".note-database-container");
  const split = document.querySelector(".workspace-split.mod-root").getBoundingClientRect();
  const anchor = document.getElementById("anchor");

  const panel = container.createDiv({ cls: "probe-panel" });
  for (let i = 0; i < 6; i += 1) panel.createDiv({ cls: "row", text: `Item ${i}` });
  P.positionToolbarPopover(panel, anchor, P.PANEL_POPOVER);
  const pr = panel.getBoundingClientRect();
  out.push({
    name: "NARROW a 360px panel in a 420px split stays inside it",
    pass: Math.round(pr.right) <= Math.round(split.right) + 1 && Math.round(pr.left) >= Math.round(split.left) - 1,
    detail: `split=[${Math.round(split.left)}..${Math.round(split.right)}] (${Math.round(split.width)}px wide) `
      + `panel=[${Math.round(pr.left)}..${Math.round(pr.right)}] (${Math.round(pr.width)}px wide)`,
  });
  panel.remove();

  const menu = P.createOwnedMenu(document);
  for (let i = 0; i < 6; i += 1) menu.addRow({ title: `Row ${i}`, onClick: () => undefined });
  const bounds = P.getVisiblePopoverBounds(null);
  menu.showAt({ x: Math.round(bounds.right - 40), y: Math.round(bounds.top + 60) });
  const mr = menu.el.getBoundingClientRect();
  out.push({
    name: "NARROW an owned menu in a 420px split stays inside it",
    pass: Math.round(mr.right) <= Math.round(split.right) + 1 && Math.round(mr.left) >= Math.round(split.left) - 1,
    detail: `split=[${Math.round(split.left)}..${Math.round(split.right)}] menu=[${Math.round(mr.left)}..${Math.round(mr.right)}] (${Math.round(mr.width)}px wide)`,
  });
  menu.close();
  return out;
}));
await narrow.close();

// ── 5c. LEFT SIDEBAR CLOSED ────────────────────────────────────────

const noSidebar = await openPage({ leftSidebar: false });
all.push(...await noSidebar.evaluate(() => {
  const out = [];
  const P = globalThis.__p;
  const container = document.querySelector(".note-database-container");
  const leafRect = document.querySelector(".workspace-leaf").getBoundingClientRect();
  const split = document.querySelector(".workspace-split.mod-root").getBoundingClientRect();
  const anchor = document.getElementById("anchor");
  const anchorRect = anchor.getBoundingClientRect();

  const panel = container.createDiv({ cls: "probe-panel" });
  for (let i = 0; i < 5; i += 1) panel.createDiv({ cls: "row", text: `Item ${i}` });
  P.positionToolbarPopover(panel, anchor, P.COMPACT_MENU_POPOVER);
  const pr = panel.getBoundingClientRect();
  out.push({
    name: "SIDEBAR-CLOSED a panel is still anchored when the leaf origin returns to x=0",
    pass: Math.abs(pr.top - (anchorRect.bottom + 6)) <= 1,
    detail: `leaf.left=${Math.round(leafRect.left)} (sidebar hidden) anchor.bottom=${Math.round(anchorRect.bottom)} `
      + `panel.top=${Math.round(pr.top)} gap=${Math.round(pr.top - anchorRect.bottom)}px`,
  });
  out.push({
    name: "SIDEBAR-CLOSED a panel still clears the right sidebar",
    pass: Math.round(pr.right) <= Math.round(split.right) + 1,
    detail: `panel.right=${Math.round(pr.right)} editing area right=${Math.round(split.right)}`,
  });
  panel.remove();
  return out;
}));
await noSidebar.close();

// ── 5d. HAND-PLACED SURFACES — the ones no primitive touches ────────
//
// These are reproduced from their source rather than imported, because each is a
// private method on a renderer that needs a live Obsidian App. The arithmetic is
// copied verbatim from the named file and line; if that arithmetic changes, this
// probe goes stale and the merge into verify-placement is what should catch it.

const hand = await openPage();
all.push(...await hand.evaluate(() => {
  const out = [];
  const P = globalThis.__p;
  const split = document.querySelector(".workspace-split.mod-root").getBoundingClientRect();
  const bounds = P.getVisiblePopoverBounds(null);
  const view = window;

  // database-view.ts:6890 / embedded-database-renderer.ts:1305, verbatim.
  // The anchor is a toolbar search control near the right of the editing area.
  const searchControl = document.querySelector(".note-database-container").createDiv({ cls: "anchor" });
  searchControl.setCssProps({ position: "absolute", left: "600px", top: "20px", width: "200px" });
  const rect = searchControl.getBoundingClientRect();
  const panel = document.body.createDiv({ cls: "db-calendar-search-results-popover" });
  const width = Math.max(320, Math.min(480, window.innerWidth - 16));
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
  const top = Math.min(rect.bottom + 6, window.innerHeight - 80);
  panel.setCssProps({ left: `${left}px`, top: `${top}px`, width: `${width}px` });
  const pr = panel.getBoundingClientRect();
  out.push({
    name: "HAND calendar/timeline search results clear the right sidebar",
    pass: Math.round(pr.right) <= Math.round(split.right) + 1,
    detail: `panel=[${Math.round(pr.left)}..${Math.round(pr.right)}] editing area right=${Math.round(split.right)} `
      + `window.innerWidth=${window.innerWidth}. The clamp is written against window.innerWidth, not against `
      + `getVisiblePopoverBounds, so it permits ${Math.round(window.innerWidth - split.right)}px of travel under the sidebar.`,
  });
  // Prove the clamp is what permits it: an anchor further right should slide further under.
  searchControl.setCssProps({ left: "1000px" });
  const rect2 = searchControl.getBoundingClientRect();
  const left2 = Math.max(8, Math.min(rect2.left, window.innerWidth - width - 8));
  panel.setCssProps({ left: `${left2}px` });
  const pr2 = panel.getBoundingClientRect();
  out.push({
    name: "HAND CONTROL the search-results overhang grows with the anchor, so the clamp is the cause",
    pass: Math.round(pr2.right - split.right) > Math.round(pr.right - split.right),
    detail: `anchor at x=600 overhangs ${Math.round(pr.right - split.right)}px; `
      + `anchor at x=1000 overhangs ${Math.round(pr2.right - split.right)}px`,
  });
  panel.remove();

  // column-menu.ts anchorless submenu fallback, transcribed from the current source.
  // It is a private method on a renderer that needs a live Obsidian App, so the arithmetic is
  // copied rather than called. Copying means this can go stale; lifting it into verify-placement
  // beside the real modules is what should eventually retire the transcription.
  const estimatedWidth = 292;
  const point = { x: Math.round(split.right - 60), y: 200 };
  const sub = document.body.createDiv({ cls: "db-dropdown-popover db-column-menu-subpopover" });
  for (let i = 0; i < 5; i += 1) sub.createDiv({ cls: "row", text: `Item ${i}` });
  sub.setCssProps({ position: "fixed", width: `${estimatedWidth}px` });
  const subHeight = sub.getBoundingClientRect().height || 320;
  sub.setCssProps({
    left: `${P.clamp(point.x + 8, bounds.left + 8, Math.max(bounds.left + 8, bounds.right - estimatedWidth - 8))}px`,
    top: `${P.clamp(point.y - 8, bounds.top + 8, Math.max(bounds.top + 8, bounds.bottom - subHeight - 8))}px`,
  });
  const sr = sub.getBoundingClientRect();
  out.push({
    name: "HAND the anchorless column submenu clears the right sidebar",
    pass: Math.round(sr.right) <= Math.round(split.right) + 1,
    detail: `submenu=[${Math.round(sr.left)}..${Math.round(sr.right)}] editing area right=${Math.round(split.right)}; `
      + `clamped against bounds.right=${Math.round(bounds.right)} rather than view.innerWidth=${view.innerWidth}, `
      + `which is what used to place it 188px under the sidebar`,
  });
  sub.remove();

  // formula-modal.ts:1343, verbatim — the property/function autocomplete inside
  // the formula workbench. Placed at an estimated caret position with no clamp of
  // any kind, so its right edge is wherever the caret plus its own width land.
  const modal = document.body.createDiv({ cls: "note-database-modal" });
  modal.setCssProps({ position: "fixed", left: "300px", top: "100px", width: "800px", height: "400px" });
  const suggest = modal.createDiv({ cls: "db-formula-property-suggestions is-visible" });
  for (let i = 0; i < 6; i += 1) {
    const b = suggest.createEl("button", { cls: "db-formula-property-suggestion" });
    b.createSpan({ text: `functionName${i}` });
    b.createSpan({ text: "(value, unit, locale, fallback)" });
  }
  // A caret near the right edge of a wide textarea is the ordinary case, not a corner.
  // The clamp is transcribed from showSuggestionBox for the same reason as the submenu above.
  const modalRect = modal.getBoundingClientRect();
  const place = (caretLeft) => {
    const available = modal.clientWidth;
    const left = Math.max(0, Math.min(caretLeft, available - suggest.offsetWidth));
    suggest.setCssProps({ left: `${left}px`, top: "44px" });
    return suggest.getBoundingClientRect();
  };
  const sg = place(700);
  out.push({
    name: "HAND the formula autocomplete stays inside its modal",
    pass: Math.round(sg.right) <= Math.round(modalRect.right) + 1,
    detail: `suggest=[${Math.round(sg.left)}..${Math.round(sg.right)}] modal=[${Math.round(modalRect.left)}..${Math.round(modalRect.right)}]; `
      + `overhang=${Math.round(sg.right - modalRect.right)}px with the caret at x=700 of an 800px modal. `
      + `Unclamped this measured 169px: the old statement bounded the corner the box starts at and `
      + `left the corner it ends at free.`,
  });
  // CONTROL: the check must be able to see an overhang at all, or a green result means nothing.
  // Reproduce the pre-fix statement — left = caret with no right-edge bound — and require it to fail.
  suggest.setCssProps({ left: "700px" });
  const sgBroken = suggest.getBoundingClientRect();
  out.push({
    name: "HAND CONTROL the unclamped formula autocomplete overhangs, so the check can distinguish",
    pass: Math.round(sgBroken.right) > Math.round(modalRect.right) + 1,
    detail: `unclamped right=${Math.round(sgBroken.right)} (overhang ${Math.round(sgBroken.right - modalRect.right)}px) `
      + `vs clamped right=${Math.round(sg.right)} (overhang ${Math.round(sg.right - modalRect.right)}px)`,
  });
  modal.remove();

  // calendar-renderer.ts:600-616 — the "more events" day popover. Unlike the three
  // above it clamps to `.note-database-container`, which lives inside the leaf, so it
  // cannot reach the sidebar however wrong its arithmetic is. That is a different
  // risk class and the number that establishes it is the container's own right edge.
  const cont = document.querySelector(".note-database-container").getBoundingClientRect();
  out.push({
    name: "HAND the calendar day popover clamps to a container that is inside the editing area",
    pass: Math.round(cont.right) <= Math.round(split.right) + 1,
    detail: `container.right=${Math.round(cont.right)} editing area right=${Math.round(split.right)}. `
      + `positionDayPopover clamps to .note-database-container rather than to the window, so its `
      + `worst case is a misplacement inside the editing area, never travel under a sidebar.`,
  });

  searchControl.remove();
  return out;
}));
await hand.close();

// ── 5e. PHONE — must not move ──────────────────────────────────────
//
// Desktop is the subject. These numbers exist so a desktop change that moves the
// phone is visible rather than discovered later.

const phone = await browser.newPage({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
await phone.setContent(pageHtml().replace(
  "<body>",
  '<body class="is-phone" style="--safe-area-inset-bottom: 34px; --background-modifier-border: #333333">'
  + '<div class="mobile-navbar" style="position:fixed;left:0;right:0;bottom:0;height:72px;background:#222;z-index:100"></div>',
));
await phone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await phone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await phone.addScriptTag({ content: positionerJs });
all.push(...await phone.evaluate(() => {
  const out = [];
  const P = globalThis.__p;
  const menu = P.createOwnedMenu(document);
  for (let i = 0; i < 8; i += 1) menu.addRow({ title: `Row ${i}`, onClick: () => undefined });
  menu.showAt({ x: 40, y: 200 });
  const r = menu.el.getBoundingClientRect();
  const style = getComputedStyle(menu.el);
  out.push({
    name: "PHONE an owned menu still presents as a full-width bottom sheet",
    pass: Math.round(r.width) >= window.innerWidth - 1 && Math.abs(r.bottom - window.innerHeight) <= 1,
    detail: `menu=[${Math.round(r.left)}..${Math.round(r.right)}] width=${Math.round(r.width)} `
      + `viewport=${window.innerWidth}x${window.innerHeight} bottom=${Math.round(r.bottom)} `
      + `position=${style.position} max-height=${style.maxHeight}`,
  });
  out.push({
    name: "PHONE the sheet is capped and scrolls rather than growing past the screen",
    pass: r.height <= window.innerHeight * 0.9 + 2,
    detail: `height=${Math.round(r.height)} cap=${Math.round(window.innerHeight * 0.9)} overflow-y=${style.overflowY}`,
  });
  menu.close();
  return out;
}));
await phone.close();

await browser.close();
rmSync(work, { recursive: true, force: true });

// ───────────────────────────────────────────────────────────────────
// 6. REPORT
// ───────────────────────────────────────────────────────────────────

// A red that is known, owned and deliberately not fixed here. Naming it is what keeps
// the run's exit status meaningful: a bare "1 failure is fine" would also swallow the
// next real regression.
const DECLARED_RED = new Map([
  [
    "HAND calendar/timeline search results clear the right sidebar",
    "The clamp lives in database-view.ts and embedded-database-renderer.ts, duplicated verbatim. "
    + "Both files were held by another session for the duration of this work, so the defect is "
    + "measured and reported rather than fixed.",
  ],
]);

if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify(all, null, 2));
} else {
  for (const r of all) {
    const declared = !r.pass && DECLARED_RED.has(r.name);
    console.log(`  ${r.pass ? "PASS" : declared ? "RED " : "FAIL"}  ${r.name}`);
    console.log(`        ${r.detail}`);
    if (declared) console.log(`        DECLARED: ${DECLARED_RED.get(r.name)}`);
  }
  const passed = all.filter((r) => r.pass).length;
  const declaredCount = all.filter((r) => !r.pass && DECLARED_RED.has(r.name)).length;
  console.log(`\nprobe-desktop-placement: ${passed}/${all.length} checks passed`
    + (declaredCount ? `, ${declaredCount} red for a declared reason` : ""));
}

const unexpected = all.filter((r) => !r.pass && !DECLARED_RED.has(r.name));
process.exit(unexpected.length === 0 ? 0 : 1);
