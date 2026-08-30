// ───────────────────────────────────────────────────────────────────
// MODULE:    verify-placement
// COMPONENT: measures popover geometry against a real Obsidian layout
// ───────────────────────────────────────────────────────────────────
//
// Every other check on the positioner is a string match, because vitest runs
// without a DOM here. String matches cannot answer the question that actually
// matters: does the popover land where a person would want it.
//
// So this builds the workspace Obsidian builds — an app container, a root
// split holding the editor, and a right sidebar beside it — puts the plugin's
// container inside the root split, and runs the shipped positioner against it
// in a real browser. Then it measures the resulting rectangle.
//
// It cannot replace opening Obsidian; the real app has themes, its own CSS,
// and a workspace this only approximates. What it can do is fail when the
// popover slides under the sidebar or renders four times wider than its
// contents, which are the two defects that were reported and are otherwise
// invisible until someone looks.
//
// Usage: node tools/storybook/verify-placement.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { SCENARIOS } from "../screenshots/scenarios.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SIDEBAR = 300;
const VIEWPORT = { width: 1440, height: 900 };

const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find(existsSync) || process.env.SCREENSHOT_CHROME;

// ───────────────────────────────────────────────────────────────────
// 3. BUNDLE THE SHIPPED POSITIONER
// ───────────────────────────────────────────────────────────────────

const work = mkdtempSync(join(tmpdir(), "placement-"));
const entry = join(work, "entry.ts");
const bundle = join(work, "bundle.js");

// Re-export exactly what ships. Bundling rather than reimplementing is the point: a hand-copied
// positioner would prove the copy.
import { writeFileSync } from "node:fs";
writeFileSync(entry, `
import { positionToolbarPopover, getVisiblePopoverBounds, COMPACT_MENU_POPOVER } from "${join(REPO, "src/views/popover-position")}";
import { applySheetChrome } from "${join(REPO, "src/views/mobile-bottom-sheet")}";
import { createOwnedMenu } from "${join(REPO, "src/views/owned-menu")}";
import { createMenuRow } from "${join(REPO, "src/views/menu-row")}";
import { renderCardField } from "${join(REPO, "src/views/card-field-renderer")}";
import { ToolbarRenderer } from "${join(REPO, "src/views/toolbar-renderer")}";
import { trackCellGesture, nextCellRange, resolveCellTapAction, isMainItemColumn, shouldExtendRowRange, applyRowSelectionPress, attachRowRangeGesture, isRowSelectionCheckbox } from "${join(REPO, "src/views/table-cell-gesture")}";
import { attachLongPress, isTouchDevice } from "${join(REPO, "src/data/touch-environment")}";
import { attachTitleOpenAffordance, setupTitleCellTap } from "${join(REPO, "src/views/table-record-peek")}";
import { openRecordDetailPanel } from "${join(REPO, "src/views/record-detail-panel")}";
import { RowMenu } from "${join(REPO, "src/views/row-menu")}";
globalThis.__place = { positionToolbarPopover, getVisiblePopoverBounds, COMPACT_MENU_POPOVER, applySheetChrome, renderCardField, createOwnedMenu, createMenuRow, ToolbarRenderer, trackCellGesture, nextCellRange, resolveCellTapAction, isMainItemColumn, shouldExtendRowRange, applyRowSelectionPress, attachRowRangeGesture, isRowSelectionCheckbox, attachLongPress, isTouchDevice, attachTitleOpenAffordance, setupTitleCellTap, openRecordDetailPanel, RowMenu };
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

const page_html = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; }
  .app-container { display: flex; width: 100vw; height: 100vh; }
  .workspace { display: flex; width: 100%; }
  .workspace-split.mod-root { flex: 1 1 auto; position: relative; overflow: hidden; }
  .workspace-split.mod-right-split { width: ${SIDEBAR}px; flex: 0 0 ${SIDEBAR}px; background: #eee; }
  /* A left sidebar, because the leaf's own origin is the whole point. With the root split first the
     leaf started at x=0, where the leaf-relative and viewport-relative coordinates of a fixed
     descendant coincide — so a harness built that way cannot show a popover being placed against the
     wrong origin however wrong the placement is. A phone has no persistent sidebars. */
  .workspace-split.mod-left-split { width: ${SIDEBAR}px; flex: 0 0 ${SIDEBAR}px; background: #eee; }
  .is-phone .workspace-split.mod-left-split,
  .is-phone .workspace-split.mod-right-split { display: none; }
  .note-database-container { position: relative; height: 100%; padding: 40px; }
  /* Reproduced from the shipped Obsidian stylesheet, because it changes what is even possible.
     contain:strict includes paint containment, which makes the leaf the containing block for
     fixed-position descendants AND clips them; isolation:isolate traps every descendant z-index
     inside it. Without these the harness certifies a viewport-relative mechanism the app does not
     provide — a sheet measured here reaches the screen bottom while on a phone it stops at the
     leaf's edge. Every earlier sheet check passed against a page that lacked them. */
  .workspace-leaf { position: relative; contain: strict !important; overflow: hidden; isolation: isolate; }
  .workspace-leaf, .workspace-leaf-content, .view-content { height: 100%; }
  /* The workspace stops above the navigation bar when that bar is not floating, which is the
     configuration the reported defect lives in. Combined with the containment above, a fixed
     descendant is then clipped to the leaf and cannot reach the screen bottom however it is
     positioned. A harness whose leaf fills the viewport cannot show this: containment is real but
     invisible, because the leaf and the viewport share an edge. */
  .app-container.mod-static-nav .workspace { height: calc(100% - 80px); }
  .anchor { width: 120px; height: 28px; background: #ccd; }
  .panel { position: absolute; background: #fff; border: 1px solid #999; }
  .panel .row { height: 30px; }
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

// ───────────────────────────────────────────────────────────────────
// 5. MEASURE
// ───────────────────────────────────────────────────────────────────

const browser = await chromium.launch({ executablePath: CHROME });
// Transitions are disabled the same way the capture harness does it: a geometry number read
// mid-transition is an animation frame, not a layout.
const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
await page.setContent(page_html);
// The desktop checks used to run against a page with no stylesheet, so they measured a document
// that does not contain the cascade the defects live in — the same structural blindness as
// wrapping a story in the one container that supplies its tokens. Every desktop number taken
// before this line was loaded described a rendering nobody ships.
await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await page.addScriptTag({ content: positionerJs });

// No arguments: every number below is measured off the rendered page. Passing the sidebar width in
// as a constant would let a check agree with the harness's own idea of the layout rather than with
// what the browser actually laid out.
const results = await page.evaluate(() => {
  const out = [];
  const { positionToolbarPopover, getVisiblePopoverBounds, COMPACT_MENU_POPOVER } = globalThis.__place;
  const container = document.querySelector(".note-database-container");
  const rootSplit = document.querySelector(".workspace-split.mod-root");

  const build = (rows) => {
    const p = container.createDiv({ cls: "panel" });
    for (let i = 0; i < rows; i += 1) p.createDiv({ cls: "row", text: `Item ${i}` });
    return p;
  };

  const split = rootSplit.getBoundingClientRect();

  // 1. The clamp target, isolated.
  //
  // Passing a container does NOT test this: bounds are the intersection of viewport, app element
  // and container, and a container living inside the root split constrains the result on its own —
  // so the check passes even with the clamp reverted, which is exactly what an earlier version of
  // this file did. Null is the honest input, and it is what owned menus actually pass.
  const bounds = getVisiblePopoverBounds(null);
  out.push({
    name: "clamp target is the editing area, not the window (container=null)",
    pass: Math.round(bounds.right) <= Math.round(split.right) + 1,
    detail: `bounds.right=${Math.round(bounds.right)} rootSplit.right=${Math.round(split.right)} window=${window.innerWidth}`,
  });

  // 2. With a container, the intersection must still hold.
  const withContainer = getVisiblePopoverBounds(container);
  out.push({
    name: "container-scoped bounds stay within the editing area",
    pass: Math.round(withContainer.right) <= Math.round(split.right) + 1,
    detail: `bounds.right=${Math.round(withContainer.right)}`,
  });

  // 2. A compact menu must not be pushed to the default 520.
  const compact = build(5);
  positionToolbarPopover(compact, document.getElementById("anchor"), COMPACT_MENU_POPOVER);
  const cr = compact.getBoundingClientRect();
  out.push({
    name: "compact preset stays narrow",
    pass: cr.width <= 320 && cr.width >= 220,
    detail: `width=${Math.round(cr.width)}px (preset 220..320, default would be 520)`,
  });

  // 3. It must sit inside the editing area, never under the sidebar.
  out.push({
    name: "compact menu clears the sidebar",
    pass: Math.round(cr.right) <= Math.round(split.right) + 1,
    detail: `panel.right=${Math.round(cr.right)} sidebar starts at ${Math.round(split.right)}`,
  });
  compact.remove();

  // 4. A caller that states no width must not be handed an absurd one.
  //
  // This assertion used to require the opposite — that a widthless caller render WIDER than 320px —
  // and it was green, and it ran on every push. It certified the defect: a four-item menu rendered
  // at the 520px default, and any fix would have turned the pipeline red. The cheapest response to
  // a red pipeline is to revert the fix, which is how a check like this quietly defends a bug.
  //
  // It now asserts the behaviour we want, so it is EXPECTED TO FAIL until the width policy lands.
  // A red result here is the check working. Do not "fix" it by widening the threshold.
  const wide = build(5);
  positionToolbarPopover(wide, document.getElementById("anchor"), {});
  const wr = wide.getBoundingClientRect();
  out.push({
    name: "widthless caller is not handed an absurd default width",
    pass: wr.width <= 320,
    detail: `width=${Math.round(wr.width)}px (want <=320; the 520 default is the defect)`,
  });
  out.push({
    name: "even the wide default clears the sidebar",
    pass: Math.round(wr.right) <= Math.round(split.right) + 1,
    detail: `panel.right=${Math.round(wr.right)} sidebar starts at ${Math.round(split.right)}`,
  });
  wide.remove();

  // 5. An anchor near the right edge must flip rather than overflow.
  const anchor = document.getElementById("anchor");
  anchor.style.marginLeft = `${split.width - 200}px`;
  const edge = build(5);
  positionToolbarPopover(edge, anchor, COMPACT_MENU_POPOVER);
  const er = edge.getBoundingClientRect();
  out.push({
    name: "anchored at the right edge, stays inside",
    pass: Math.round(er.right) <= Math.round(split.right) + 1 && er.left >= split.left - 1,
    detail: `panel=[${Math.round(er.left)}..${Math.round(er.right)}] split=[${Math.round(split.left)}..${Math.round(split.right)}]`,
  });
  edge.remove();

  // 6. A tall menu must be capped, not run off the bottom.
  anchor.style.marginLeft = "0px";
  const tall = build(60);
  positionToolbarPopover(tall, anchor, COMPACT_MENU_POPOVER);
  const tr = tall.getBoundingClientRect();
  out.push({
    name: "tall menu is capped within the viewport",
    pass: Math.round(tr.bottom) <= window.innerHeight + 1,
    detail: `panel.bottom=${Math.round(tr.bottom)} viewport=${window.innerHeight}`,
  });
  tall.remove();

  // Live Preview, which is where an embedded database actually renders. The plugin registers two
  // markdown code block processors, so its view is a CM6 widget — and Obsidian gives every such
  // widget `contain: paint !important`. Placement can be exactly right and the surface still be cut
  // off at the widget's own edge, because no coordinate lets a box escape a paint-contained
  // ancestor. That is why the sheet is portalled, and this is the same problem one layer in.
  const widget = document.querySelector(".note-database-container").createDiv({ cls: "cm-widget-probe" });
  widget.setCssProps({ position: "relative", height: "180px", contain: "paint", overflow: "visible" });
  const wAnchor = widget.createDiv({ cls: "anchor" });
  wAnchor.setCssProps({ position: "absolute", left: "40px", top: "120px", width: "120px", height: "28px" });
  // Built inside the widget, not beside it. A first version of this check used the shared builder,
  // which appends to the container — so the panel was the widget's sibling and the check reported a
  // clean pass while measuring a surface that was never contained by anything.
  const inWidget = widget.createDiv({ cls: "panel" });
  for (let i = 0; i < 12; i += 1) inWidget.createDiv({ cls: "row", text: `Item ${i}` });
  positionToolbarPopover(inWidget, wAnchor, COMPACT_MENU_POPOVER);
  const wRect = widget.getBoundingClientRect();
  const pRect = inWidget.getBoundingClientRect();
  const spill = Math.round(pRect.bottom - wRect.bottom);
  // Read the document rather than the rectangle: a clipped box still reports its full geometry.
  const probe = document.elementFromPoint(Math.round(pRect.left + pRect.width / 2), Math.round(pRect.bottom - 4));
  out.push({
    name: "a popover inside a paint-contained widget is not clipped by it",
    pass: spill <= 0 || Boolean(probe && inWidget.contains(probe)),
    detail: `widget contain=${getComputedStyle(widget).contain} panel position=${getComputedStyle(inWidget).position}; `
      + `panel extends ${spill}px past the widget; the document paints `
      + `${probe ? probe.className || probe.tagName : "nothing"} at the panel's own bottom edge`,
  });
  widget.remove();

  return out;
});

await page.close();

// ───────────────────────────────────────────────────────────────────
// 5b. PHONE — the sheet presentation
// ───────────────────────────────────────────────────────────────────

const phone = await browser.newPage({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
// Obsidian draws a fixed bottom navigation bar on a phone. No harness contained one, so the
// positioner's phone branch always fell back to a hardcoded 50px and the harness agreed with the
// device for the wrong reason. A safe-area inset is supplied for the same reason.
// `--background-modifier-border` is supplied for the same reason and is Obsidian's own dark-theme
// value. The plugin's hairline tokens are `color-mix` over it, so with the host variable absent
// they resolve to the guaranteed-invalid value and every border computes as `0px none` — a divider
// check would then report "no divider" against a stylesheet that declares one, which is a harness
// failure wearing the costume of a product defect.
const phoneBody = '<body class="is-phone" style="--safe-area-inset-bottom: 34px;'
  + '--background-modifier-border: #333333">'
  + '<div class="mobile-navbar" style="position:fixed;left:0;right:0;bottom:0;height:72px;'
  + 'background:#222;z-index:100"></div>';
await phone.setContent(page_html.replace("<body>", phoneBody));
await phone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await phone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await phone.addScriptTag({ content: positionerJs });

const phoneResults = await phone.evaluate(async () => {
  const out = [];
  const { applySheetChrome, positionToolbarPopover, getVisiblePopoverBounds } = globalThis.__place;

  // Drive the positioner, not only the chrome helper.
  //
  // The phone checks used to call applySheetChrome alone, which toggles a class and adds a grab
  // handle. The offset arithmetic that reads the navbar lives in the positioner, so it was never
  // executed here — which is why adding a navbar to the page changed no asserted number and the
  // harness agreed with the device for the wrong reason.
  const anchoredHost = document.body.createDiv({ cls: "note-database-container" });
  const anchor = anchoredHost.createDiv({ cls: "anchor" });
  const anchored = anchoredHost.createDiv({ cls: "panel" });
  for (let i = 0; i < 6; i += 1) anchored.createDiv({ cls: "row", text: `Row ${i}` });
  positionToolbarPopover(anchored, anchor, {});
  const bounds = getVisiblePopoverBounds(null);
  const navbar = document.querySelector(".mobile-navbar");
  const navRect = navbar ? navbar.getBoundingClientRect() : null;

  // The bound must be derived from the navbar that is actually on the page, not from the
  // positioner's hardcoded fallback. The harness navbar is deliberately 72px: a height close to
  // that fallback makes present and absent produce nearly the same number, which is a check that
  // cannot tell the two apart while appearing to pass.
  // The current branch subtracts BOTH the navbar height and the safe-area inset, so the expected
  // bound is viewport - navbar - inset. Asserting the navbar alone was wrong about the code, which
  // is worth recording: the harness caught a naive assertion before it could certify anything.
  //
  // This measures the behaviour as it stands today. A later phase deletes this subtraction outright,
  // because the sheet is supposed to COVER the navbar rather than avoid it; when that lands, this
  // expectation changes with it and the change should be deliberate and visible here.
  const inset = parseFloat(
    getComputedStyle(document.body).getPropertyValue("--safe-area-inset-bottom") || "0",
  ) || 0;
  const expected = navRect ? window.innerHeight - navRect.height - inset : null;
  const fallbackBound = window.innerHeight - 50;
  out.push({
    name: "phone bounds are derived from the navbar on the page, not the hardcoded fallback",
    pass: expected !== null && Math.abs(bounds.bottom - expected) <= 1,
    detail: navRect
      ? `bounds.bottom=${Math.round(bounds.bottom)} expected=${Math.round(expected)} `
        + `(viewport ${window.innerHeight} - navbar ${Math.round(navRect.height)} - inset ${inset}); `
        + `a fallback-derived bound would sit near ${fallbackBound}`
      : "no .mobile-navbar in the page — the harness cannot observe this at all",
  });
  anchoredHost.remove();
  const panel = document.body.createDiv({ cls: "note-database-container" });
  for (let i = 0; i < 40; i += 1) panel.createDiv({ text: `Row ${i}` });

  applySheetChrome(panel, true);
  const r = panel.getBoundingClientRect();
  const style = getComputedStyle(panel);

  out.push({
    name: "sheet docks to the bottom of the screen",
    pass: Math.abs(r.bottom - window.innerHeight) <= 1,
    detail: `panel.bottom=${Math.round(r.bottom)} viewport=${window.innerHeight}`,
  });
  out.push({
    name: "sheet spans the full width",
    pass: Math.round(r.width) >= window.innerWidth - 1,
    detail: `width=${Math.round(r.width)} viewport=${window.innerWidth}`,
  });
  out.push({
    name: "sheet height is capped, not full-screen",
    pass: r.height <= window.innerHeight * 0.9 + 2,
    detail: `height=${Math.round(r.height)} cap=${Math.round(window.innerHeight * 0.9)} (90svh)`,
  });
  out.push({
    name: "sheet declares a max-height rather than relying on content",
    pass: /svh|vh|px/.test(style.maxHeight) && style.maxHeight !== "none",
    detail: `max-height: ${style.maxHeight}`,
  });

  // Chrome off again must not leave the surface stuck bottom-docked.
  applySheetChrome(panel, false);
  const after = getComputedStyle(panel);
  out.push({
    name: "chrome is reversible (desktop presentation restored)",
    pass: after.position !== "fixed" || after.bottom === "auto",
    detail: `position=${after.position} bottom=${after.bottom}`,
  });

  // The requirement this whole sheet effort is judged on: a sheet sits on the viewport floor,
  // over the host's bottom navigation bar.
  //
  // These checks previously asserted a portal — that the sheet had been moved to the body. That was
  // the wrong mechanism, and asserting it hid the real one: the positioner writes the sheet's
  // bottom offset from bounds that deliberately subtract the navigation bar and the safe-area
  // inset, so the sheet was parked 106px above the floor no matter where it was mounted. The
  // portal checks were green while the operator's phone showed the defect.
  //
  // What is asserted now is the outcome. `position: fixed` resolves against the viewport, so a
  // sheet whose bottom is 0 reaches the floor from inside the container.
  const sheetHost = document.querySelector(".note-database-container");
  const sheetAnchor = sheetHost.createDiv({ cls: "anchor" });
  const sheetPanel = sheetHost.createDiv({ cls: "db-record-detail-panel" });
  // Real content, not a fixed height. The sheet sizes to what it holds, so an empty panel measures
  // 48px and passes the floor checks while covering almost none of the navigation band — a check
  // that would report success on a sheet no user could see.
  for (let i = 0; i < 6; i += 1) {
    const field = sheetPanel.createDiv({ cls: "db-record-detail-field" });
    field.createDiv({ cls: "db-record-detail-label", text: `Field ${i}` });
    field.createDiv({ cls: "db-record-detail-value", text: `Value ${i}` });
  }
  positionToolbarPopover(sheetPanel, sheetAnchor, {});

  const sheetStyle = getComputedStyle(sheetPanel);
  const sheetRect = sheetPanel.getBoundingClientRect();
  const navBox = document.querySelector(".mobile-navbar").getBoundingClientRect();

  out.push({
    name: "a sheet is placed on the viewport floor, not above the navigation bar",
    pass: Math.abs(sheetRect.bottom - window.innerHeight) <= 1,
    detail: `sheet bottom=${Math.round(sheetRect.bottom)} viewport=${window.innerHeight} (gap ${Math.round(window.innerHeight - sheetRect.bottom)}px)`,
  });
  out.push({
    name: "the sheet's bottom offset is zero, not the navbar-avoiding inset",
    pass: sheetStyle.bottom === "0px",
    detail: `computed bottom=${sheetStyle.bottom}`,
  });
  // The same sheet, in the arrangement where the workspace stops above the bar.
  document.querySelector(".app-container").classList.add("mod-static-nav");
  positionToolbarPopover(sheetPanel, sheetAnchor, {});
  const staticRect = sheetPanel.getBoundingClientRect();
  const leafRect = document.querySelector(".workspace-leaf").getBoundingClientRect();
  document.querySelector(".app-container").classList.remove("mod-static-nav");

  out.push({
    name: "a sheet reaches the screen bottom even when the workspace does not",
    pass: Math.abs(staticRect.bottom - window.innerHeight) <= 1,
    detail: `sheet bottom=${Math.round(staticRect.bottom)} leaf bottom=${Math.round(leafRect.bottom)} viewport=${window.innerHeight}`,
  });

  out.push({
    name: "the sheet's rectangle covers the navigation bar's band",
    pass: sheetRect.bottom >= navBox.bottom - 1 && sheetRect.top <= navBox.top,
    detail: `sheet ${Math.round(sheetRect.top)}-${Math.round(sheetRect.bottom)} navbar ${Math.round(navBox.top)}-${Math.round(navBox.bottom)}`,
  });
  sheetAnchor.remove();
  sheetPanel.remove();

  // ─────────────────────────────────────────────────────────────────
  // THE SHEET'S READING RHYTHM, AND THE KEYBOARD
  // ─────────────────────────────────────────────────────────────────
  //
  // Everything above measures where the sheet is. These measure what it looks like once it is
  // there, and what happens when a software keyboard opens underneath it. Both defects were
  // reported from a phone with screenshots and neither is visible in any fixture, because every
  // fixture renders static markup and imports nothing from src/.
  //
  // The rows are built with the shipped `renderCardField`, not with hand-written markup. An earlier
  // sheet check in this file builds its rows with the class names `db-record-detail-label` and
  // `db-record-detail-value`, and production emits neither — it emits `db-record-detail-field-label`
  // on a span and `db-board-card-value` on a div. Those checks are measuring a stylesheet path no
  // user reaches. Bundling the renderer means the harness cannot drift from production that way,
  // because there is only one of them.
  const rhythmHost = document.body.createDiv({ cls: "note-database-container" });
  const rhythmAnchor = rhythmHost.createDiv({ cls: "anchor" });
  const rhythmPanel = rhythmHost.createDiv({ cls: "db-record-detail-panel" });
  const rhythmFields = rhythmPanel.createDiv({ cls: "db-record-detail-fields" });
  // The operator's own record, and enough repeats to drive the sheet into its height cap — a short
  // sheet passes the "fits above the keyboard" check without the cap ever being consulted.
  const RECORD = [
    ["Income", "4975.32"], ["Expenses", "3535.74"], ["Subscriptions", "81.8"],
    ["Remaining", "1439.58"], ["Sales", "0"], ["Saved", "1500"], ["Invested", "0"],
    ["Withdrawn", "81.8"], ["Added to", "1418.2"], ["Balance", "24560.33"],
    ["Stocks", "0"], ["Year", "2027"],
  ];
  const fieldRow = { file: { basename: "record", path: "record.md" }, values: {} };
  for (const [label, value] of [...RECORD, ...RECORD, ...RECORD]) {
    rhythmFields.appendChild(globalThis.__place.renderCardField({
      app: {}, row: fieldRow, col: { key: label, label, type: "text" }, config: {},
      value, displayType: "text", empty: false,
      fieldClass: "db-record-detail-field", valueClass: "db-board-card-value",
      labelClass: "db-record-detail-field-label", badgesClass: "db-board-card-badges",
      linkClass: "db-board-card-link", wrap: false, readOnly: false,
    }));
  }
  positionToolbarPopover(rhythmPanel, rhythmAnchor, { minWidth: 240, preferredWidth: 360, maxWidth: 420 });

  // The gutter a reader sees is between glyphs, not between boxes. A box rect answers a different
  // question, and for a right-aligned value it answers it in a way that hides the defect entirely.
  const textRect = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rect = range.getBoundingClientRect();
    return rect.width ? rect : el.getBoundingClientRect();
  };
  const fieldRows = [...rhythmFields.querySelectorAll(".db-record-detail-field")];
  const labelText = fieldRows.map((r) => textRect(r.querySelector(".db-record-detail-field-label")));
  const valueText = fieldRows.map((r) => textRect(r.querySelector(".db-board-card-value")));
  const rowBoxes = fieldRows.map((r) => r.getBoundingClientRect());
  const sheetBox = rhythmPanel.getBoundingClientRect();

  // A harness that lays out at the 980px default while calling itself a phone measures a screen
  // nobody has. Assert the width rather than trusting the viewport option.
  out.push({
    name: "the phone page lays out at phone width",
    pass: document.documentElement.clientWidth === 390,
    detail: `clientWidth=${document.documentElement.clientWidth} (980 means no viewport meta tag)`,
  });

  const valueSpread = Math.max(...valueText.map((r) => r.left)) - Math.min(...valueText.map((r) => r.left));
  out.push({
    name: "every value starts in one fixed column",
    pass: valueSpread <= 2,
    detail: `value text left-edge spread across ${fieldRows.length} rows = ${valueSpread.toFixed(1)}px `
      + `(want <=2; right-aligned values measured 42.3 here and 51.0 on the device)`,
  });

  // Where the column sits, not how wide each gap happens to be. A fixed column necessarily leaves a
  // variable gap beside a short label — the reference does too, from 11px to 71px — so a per-row
  // gutter threshold would forbid the very layout being copied. What made the sheet unreadable was
  // the column's POSITION: values began at 81-94% of the screen width, so a pair spanned the sheet.
  const columnFraction = (valueText[0].left - sheetBox.left) / sheetBox.width;
  const gutters = fieldRows.map((_, i) => valueText[i].left - labelText[i].right);
  out.push({
    name: "the value column starts early, so a label and its value read as one line",
    pass: columnFraction <= 0.4,
    detail: `value column at ${(columnFraction * 100).toFixed(1)}% of sheet width `
      + `(reference measured 38.5%; the device measured 81-94%). Per-row gap between label and `
      + `value now ${Math.min(...gutters).toFixed(0)}-${Math.max(...gutters).toFixed(0)}px `
      + `(reference 11-71px; the device 261-330px)`,
  });

  const pitches = rowBoxes.slice(1).map((b, i) => b.top - rowBoxes[i].top);
  out.push({
    name: "row pitch reaches the reference rhythm",
    pass: Math.min(...pitches) >= 38,
    detail: `min pitch=${Math.min(...pitches).toFixed(1)}px (reference measured 38.0, device 28.0)`,
  });

  out.push({
    name: "a sheet row is a thumb-sized target",
    pass: Math.min(...rowBoxes.map((b) => b.height)) >= 44,
    detail: `min row height=${Math.min(...rowBoxes.map((b) => b.height)).toFixed(1)}px `
      + `(WCAG 2.5.5 target size is 44)`,
  });

  const deadGaps = rowBoxes.slice(1).map((b, i) => b.top - rowBoxes[i].bottom);
  out.push({
    name: "no dead space between adjacent sheet rows",
    pass: Math.max(...deadGaps) <= 0.5,
    detail: `max gap between consecutive rows=${Math.max(...deadGaps).toFixed(1)}px `
      + `(want 0 so every pixel belongs to one target or the other)`,
  });

  const dividerStyle = getComputedStyle(fieldRows[0]);
  out.push({
    name: "a divider separates each sheet row",
    pass: parseFloat(dividerStyle.borderBottomWidth) > 0
      && dividerStyle.borderBottomStyle !== "none"
      && dividerStyle.borderBottomColor !== "rgba(0, 0, 0, 0)",
    detail: `border-bottom: ${dividerStyle.borderBottomWidth} ${dividerStyle.borderBottomStyle} `
      + `${dividerStyle.borderBottomColor}`,
  });

  // Read the sizes off the project's own tokens rather than off numbers typed into this file, so
  // retuning the scale moves the check with it instead of leaving it asserting a stale literal.
  //
  // Off the sheet, not off the document element: these tokens are declared on `.db-surface` and the
  // plugin's other surface roots, never on `:root`. Reading them from `documentElement` returns the
  // empty string, which `parseFloat` turns into NaN and a careless check turns into 0 === 0.
  const tokenPx = (name) => parseFloat(
    getComputedStyle(rhythmPanel).getPropertyValue(name) || "",
  );
  const labelPx = parseFloat(getComputedStyle(fieldRows[0].querySelector(".db-record-detail-field-label")).fontSize);
  const valuePx = parseFloat(getComputedStyle(fieldRows[0].querySelector(".db-board-card-value")).fontSize);
  out.push({
    name: "value text clears the size at which iOS zooms an input on focus",
    pass: valuePx >= 16,
    detail: `value font-size=${valuePx}px, --db-font-lg=${tokenPx("--db-font-lg")}px`,
  });
  out.push({
    name: "label and value are both on the project's type scale, label no larger",
    pass: labelPx === tokenPx("--db-font-md") && valuePx === tokenPx("--db-font-lg") && labelPx <= valuePx,
    detail: `label=${labelPx}px (--db-font-md=${tokenPx("--db-font-md")}) `
      + `value=${valuePx}px (--db-font-lg=${tokenPx("--db-font-lg")})`,
  });

  // A label wider than its column must truncate, not shove the column sideways. Measured on the
  // value's BOX: its text rect cannot move while the value is right-aligned, so a check written
  // against the text rect passes against the defect and can never fail.
  const longRow = fieldRows[2];
  const longLabel = longRow.querySelector(".db-record-detail-field-label");
  const columnBefore = longRow.querySelector(".db-board-card-value").getBoundingClientRect().left;
  longLabel.textContent = "A supercalifragilistic property name";
  const columnAfter = longRow.querySelector(".db-board-card-value").getBoundingClientRect().left;
  longLabel.textContent = "Subscriptions";
  out.push({
    name: "a long label truncates instead of moving the value column",
    pass: Math.abs(columnAfter - columnBefore) <= 1,
    detail: `value box left ${columnBefore.toFixed(0)} -> ${columnAfter.toFixed(0)}px `
      + `(a min-width label moved it 115px)`,
  });

  // ── the keyboard ──
  //
  // No harness here contains a software keyboard, and none of these checks claims otherwise. What
  // they drive is the mechanism the host uses to REPORT one. Obsidian listens to the platform
  // keyboard events and publishes the height as `--keyboard-height` on the document element, then
  // places its own mobile toolbar and caps its own app container from that same variable. The sheet
  // is portalled to body, a sibling of that container, so it inherits none of the cap — which is
  // why it stayed docked to a floor that had gone behind the keyboard.
  //
  // 331px is not invented: it is the keyboard's height measured off the operator's screenshot
  // (1206x2622 at DPR 3, keyboard top edge at y=1628 physical).
  const KEYBOARD = 331;
  const settle = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  out.push({
    name: "the WebView exposes visualViewport at all",
    pass: Boolean(window.visualViewport),
    detail: `visualViewport ${window.visualViewport ? "present" : "absent"}; `
      + `the positioner already subscribes to its resize and scroll`,
  });

  const restingBox = rhythmPanel.getBoundingClientRect();
  out.push({
    name: "with no keyboard the sheet still sits on the viewport floor",
    pass: Math.abs(restingBox.bottom - window.innerHeight) <= 1,
    detail: `bottom=${restingBox.bottom.toFixed(0)} viewport=${window.innerHeight} `
      + `(this is 003's requirement and must not move)`,
  });

  document.documentElement.style.setProperty("--keyboard-height", `${KEYBOARD}px`);
  window.dispatchEvent(new window.Event("resize"));
  await settle();
  const liftedBox = rhythmPanel.getBoundingClientRect();
  out.push({
    name: "the sheet clears the keyboard the host reports",
    pass: Math.abs(liftedBox.bottom - (window.innerHeight - KEYBOARD)) <= 2,
    detail: `sheet bottom=${liftedBox.bottom.toFixed(0)} want=${window.innerHeight - KEYBOARD} `
      + `(keyboard covers ${window.innerHeight - KEYBOARD}..${window.innerHeight})`,
  });
  out.push({
    name: "a lifted sheet fits in the space the keyboard leaves",
    pass: liftedBox.top >= -1 && liftedBox.height <= (window.innerHeight - KEYBOARD) + 1,
    detail: `top=${liftedBox.top.toFixed(0)} height=${liftedBox.height.toFixed(0)} `
      + `available=${window.innerHeight - KEYBOARD} (raising the bottom without lowering the cap `
      + `pushes the top off screen instead)`,
  });

  document.documentElement.style.removeProperty("--keyboard-height");
  window.dispatchEvent(new window.Event("resize"));
  await settle();
  const closedBox = rhythmPanel.getBoundingClientRect();
  out.push({
    name: "the sheet returns to the floor when the keyboard closes",
    pass: Math.abs(closedBox.bottom - window.innerHeight) <= 1,
    detail: `bottom=${closedBox.bottom.toFixed(0)} viewport=${window.innerHeight}`,
  });

  // ── controls ──
  //
  // A check that cannot fail proves nothing, and three of the checks above began that way. Each
  // control breaks the property on purpose and confirms the assertion notices; a control that stops
  // reporting YES means its check has quietly become decorative.
  const controlRow = fieldRows[0];
  const controlValue = controlRow.querySelector(".db-board-card-value");
  const controlLabel = controlRow.querySelector(".db-record-detail-field-label");

  const beforeShove = controlValue.getBoundingClientRect().left;
  controlLabel.style.flex = "0 0 220px";
  const afterShove = controlValue.getBoundingClientRect().left;
  controlLabel.style.flex = "";
  out.push({
    name: "control: the column check reacts when a label really does shove the value",
    pass: Math.abs(afterShove - beforeShove) > 1,
    detail: `widening the label moved the value box ${beforeShove.toFixed(0)} -> ${afterShove.toFixed(0)}px`,
  });

  // Read into primitives before restoring. `getComputedStyle` hands back a live declaration that
  // re-resolves whenever it is touched, so capturing the object and reading it after the restore
  // reports the restored value — and this control did exactly that, claiming the divider survived
  // being removed.
  controlRow.style.borderBottom = "none";
  const strippedWidth = getComputedStyle(controlRow).borderBottomWidth;
  const strippedStyleName = getComputedStyle(controlRow).borderBottomStyle;
  controlRow.style.borderBottom = "";
  out.push({
    name: "control: the divider check reacts when the divider is taken away",
    pass: parseFloat(strippedWidth) === 0,
    detail: `with the border removed the check reads ${strippedWidth} ${strippedStyleName}`,
  });

  // Which ceiling actually binds, measured rather than assumed. Both the stylesheet and the
  // positioner state a cap, and the stylesheet's carries `!important`, which outranks an inline
  // declaration — the opposite of what a reader would guess and of what this module used to say.
  // It matters because the keyboard fix lowers the cap through the stylesheet's `calc`, so if the
  // inline value won, a lifted sheet would keep its full height and run off the top of the screen.
  const inlineCap = parseFloat(rhythmPanel.style.maxHeight);
  const bindingCap = parseFloat(getComputedStyle(rhythmPanel).maxHeight);
  out.push({
    name: "the stylesheet's !important max-height is the one that binds, not the inline one",
    pass: Math.abs(bindingCap - window.innerHeight * 0.9) <= 1 && inlineCap < bindingCap,
    detail: `computed=${bindingCap.toFixed(1)}px, inline=${inlineCap.toFixed(1)}px, `
      + `90svh=${(window.innerHeight * 0.9).toFixed(1)}px`,
  });

  // The pinch-zoom case, which the visual-viewport fallback would otherwise mistake for a keyboard.
  // Chromium reports scale through visualViewport, and it cannot be pinched from script, so the
  // guard is exercised directly against the same input the fallback reads.
  const zoomed = window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop;
  out.push({
    name: "the visual-viewport fallback is guarded against pinch-zoom",
    pass: window.visualViewport.scale <= 1.01 && zoomed <= 1,
    detail: `scale=${window.visualViewport.scale} inset=${zoomed.toFixed(1)}px; the fallback ignores `
      + `its term when scale exceeds 1.01, so a zoom cannot lift the sheet`,
  });

  rhythmHost.remove();

  return out;
});

// ───────────────────────────────────────────────────────────────────
// 5c. PHONE — the menu presentation
// ───────────────────────────────────────────────────────────────────
//
// A fresh page, not the one above. That page has an open sheet and a backdrop left on the body by
// the checks before it, and a backdrop assertion run against inherited state answers a question
// about the previous check rather than this one.

const menuPhone = await browser.newPage({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
await menuPhone.setContent(page_html.replace("<body>", phoneBody));
await menuPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await menuPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await menuPhone.addScriptTag({ content: positionerJs });

const menuResults = await menuPhone.evaluate(() => {
  const out = [];
  const { createOwnedMenu, createMenuRow, applySheetChrome, positionToolbarPopover, COMPACT_MENU_POPOVER } = globalThis.__place;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // The reported menu, at its reported length. Nineteen rows is what the table's column menu holds
  // for a number property, and the count is the point: a shorter menu fits on the screen by
  // accident and cannot show either the overflow or the scrolling.
  const menu = createOwnedMenu(document);
  menu.addSection("Property");
  for (const label of [
    "Edit property", "Change type", "Insert property left", "Insert property right",
    "Duplicate property", "Move up", "Move down", "Hide property", "Enable wrap",
    "Filter by property", "Adjust column width", "Auto fit column width",
    "Auto fit all visible columns", "Sort ascending", "Sort descending", "Freeze up to column",
    "Copy property name", "Copy values", "Delete property",
  ]) menu.addRow({ icon: "pencil", label });
  // The anchor-rect shape, which is how the column menu opens: a point under the header cell.
  menu.showAt({ x: 300, y: 90 });

  const el = menu.el;
  const r = el.getBoundingClientRect();
  const rowCount = el.querySelectorAll(".db-menu-item").length;

  out.push({
    name: "a phone menu docks to the bottom of the screen instead of opening at the point",
    pass: Math.abs(r.bottom - vh) <= 1,
    detail: `menu bottom=${Math.round(r.bottom)} viewport=${vh}; opened at y=90 with ${rowCount} rows`,
  });
  out.push({
    name: "a phone menu spans the full width instead of the menu's own 220-320px",
    pass: Math.round(r.width) >= vw - 1,
    detail: `width=${Math.round(r.width)} viewport=${vw} (the anchored menu is 220..320)`,
  });
  out.push({
    name: "a 19-row phone menu is capped at the sheet ceiling and scrolls inside it",
    pass: r.height <= vh * 0.9 + 2 && r.top >= -1 && el.scrollHeight > el.clientHeight + 1,
    detail: `height=${Math.round(r.height)} cap=${Math.round(vh * 0.9)} top=${Math.round(r.top)} `
      + `content=${el.scrollHeight} visible=${el.clientHeight} `
      + `(unclamped these rows measure ${rowCount * 44}px, past a ${vh}px screen)`,
  });
  out.push({
    name: "a phone menu carries the sheet's grab handle",
    pass: Boolean(el.querySelector(".db-mobile-bottom-sheet-handle")),
    detail: `handle=${el.querySelector(".db-mobile-bottom-sheet-handle") ? "present" : "absent"} `
      + `classes=${el.className}`,
  });

  // The backdrop has to take the tap, or the press that dismisses the menu also lands on the table
  // underneath. Read from the document rather than from the element: an inert backdrop is present
  // in the tree and absent from the hit test, and only the hit test is the behaviour.
  const scrim = document.querySelector(".db-mobile-sheet-scrim");
  const above = document.elementFromPoint(Math.round(vw / 2), Math.max(2, Math.round(r.top / 2)));
  out.push({
    name: "the backdrop over a menu sheet takes the tap rather than passing it to the table",
    pass: Boolean(scrim) && above === scrim,
    detail: `backdrop=${scrim ? "present" : "absent"} `
      + `pointer-events=${scrim ? getComputedStyle(scrim).pointerEvents : "n/a"}; `
      + `the document paints ${above ? above.className || above.tagName : "nothing"} above the sheet`,
  });

  const scrimWhileOpen = Boolean(document.querySelector(".db-mobile-sheet-scrim"));
  menu.close();
  const scrimAfterClose = Boolean(document.querySelector(".db-mobile-sheet-scrim"));
  out.push({
    name: "the backdrop arrives with the menu and leaves with it",
    pass: scrimWhileOpen && !scrimAfterClose && !el.isConnected,
    detail: `while open=${scrimWhileOpen} after close=${scrimAfterClose} menu still mounted=${el.isConnected}`,
  });

  // Rows inside the sheet: one left edge, whether or not a row carries an icon. The icon-less row
  // is the case that goes wrong — a menu of icons with one bare row pulls that row's label left by
  // the width of the slot every sibling holds.
  const aligned = createOwnedMenu(document);
  aligned.addRow({ icon: "pencil", label: "With an icon" });
  aligned.addRow({ label: "Without an icon" });
  aligned.addRow({ icon: "trash-2", label: "With another icon" });
  aligned.showAt({ x: 0, y: 0 });
  const labelLefts = [...aligned.el.querySelectorAll(".db-menu-item-label")]
    .map((n) => Math.round(n.getBoundingClientRect().left));
  out.push({
    name: "rows in a sheet menu share one left edge, icon or no icon",
    pass: Math.max(...labelLefts) - Math.min(...labelLefts) <= 1,
    detail: `label left edges=[${labelLefts.join(", ")}] spread=${Math.max(...labelLefts) - Math.min(...labelLefts)}px`,
  });
  aligned.close();

  // The utilities menu's rows, built the way the toolbar now builds them: the shared row component
  // plus the class its container styles. Before the row component could carry that class the only
  // way to keep it was to hand-build the row, which is how a second implementation of this row came
  // to exist and to drift.
  const container = document.querySelector(".note-database-container");
  const anchor = container.createDiv({ cls: "anchor" });
  const utilities = container.createDiv({ cls: "db-view-tab-popover db-toolbar-utilities-popover" });
  for (const [icon, label] of [
    ["arrow-left-right", "Display width"],
    ["refresh-cw", "Refresh database"],
    ["clipboard-copy", "Export to clipboard"],
    ["settings-2", "View settings"],
  ]) createMenuRow(utilities, { cls: "db-toolbar-menu-row", icon, label });
  positionToolbarPopover(utilities, anchor, COMPACT_MENU_POPOVER);
  const utilityRows = [...utilities.querySelectorAll(".db-menu-item")];
  const utilityStyle = getComputedStyle(utilityRows[0]);
  const utilityLefts = utilityRows.map((n) =>
    Math.round(n.querySelector(".db-menu-item-label").getBoundingClientRect().left));
  out.push({
    name: "utilities rows keep their container's row layout after moving to the shared component",
    pass: utilityStyle.display === "flex"
      && utilityStyle.textAlign === "start"
      && Math.max(...utilityLefts) - Math.min(...utilityLefts) <= 1,
    detail: `display=${utilityStyle.display} text-align=${utilityStyle.textAlign} `
      + `label left edges=[${utilityLefts.join(", ")}]; a row that lost the class renders inline-block, centred`,
  });
  // Put this surface away before the next check runs. On a phone the positioner turned it into a
  // sheet and portalled it to the body, and the backdrop is shared by every open sheet — so a
  // panel left open here makes the next check's "the backdrop left with the menu" read false for a
  // reason that belongs to this one. The first version of that check failed exactly this way.
  applySheetChrome(utilities, false);
  utilities.remove();
  anchor.remove();

  // The same shared row, in a sheet that is not the owned menu's own shell.
  //
  // This is the family case, and it is the one that was reported: the row's layout used to be
  // written `.db-owned-menu .db-menu-item`, so a row built anywhere else rendered as an unstyled
  // button — inline, centred, each one a different width, which is the ragged sheet in the device
  // screenshot. Re-keying the grammar to the row itself fixed it, and this is what holds it fixed.
  // A row is a row wherever it is mounted, or the shared component is shared in name only.
  const bare = document.body.createDiv({ cls: "db-view-tab-popover" });
  createMenuRow(bare, { icon: "pencil", label: "With an icon" });
  createMenuRow(bare, { label: "Without an icon" });
  createMenuRow(bare, { icon: "trash-2", label: "A much longer label than its siblings" });
  applySheetChrome(bare, true);
  const bareRows = [...bare.querySelectorAll(".db-menu-item")];
  const bareStyle = getComputedStyle(bareRows[0]);
  const bareLefts = bareRows.map((n) =>
    Math.round(n.querySelector(".db-menu-item-label").getBoundingClientRect().left));
  out.push({
    name: "a shared menu row lays itself out in any sheet, not only inside the owned menu",
    pass: bareStyle.display === "flex"
      && Math.max(...bareLefts) - Math.min(...bareLefts) <= 1,
    detail: `display=${bareStyle.display} text-align=${bareStyle.textAlign} `
      + `label left edges=[${bareLefts.join(", ")}] spread=${Math.max(...bareLefts) - Math.min(...bareLefts)}px`,
  });
  applySheetChrome(bare, false);
  bare.remove();

  return out;
});

// The grab handle, driven by the browser's own pointer stream rather than synthesised events.
//
// A hand-made PointerEvent carries a pointerId the browser never issued, and `setPointerCapture`
// rejects it — so a synthetic version of this check would measure the harness throwing rather than
// the gesture working. Playwright's mouse produces a real stream, capture succeeds, and the code
// under test is the shipped listener.
//
// The short drag is the control. Both directions of the threshold are asserted, because a check
// that only proves "a long drag closes it" also passes on a surface that closes on any touch at
// all — which would make the menu impossible to scroll.
const dragCase = async (distance) => {
  const start = await menuPhone.evaluate(() => {
    const { createOwnedMenu } = globalThis.__place;
    const menu = globalThis.__dragMenu = createOwnedMenu(document);
    for (let i = 0; i < 8; i += 1) menu.addRow({ icon: "pencil", label: `Row ${i}` });
    menu.showAt({ x: 10, y: 10 });
    const handle = menu.el.querySelector(".db-mobile-bottom-sheet-handle");
    // A missing handle is a result, not a crash. Reading a rectangle off null aborts the whole run,
    // and a harness that dies on the defect it exists to find reports nothing at all.
    if (!handle) return null;
    const box = handle.getBoundingClientRect();
    return { x: Math.round(box.left + box.width / 2), y: Math.round(box.top + box.height / 2) };
  });
  if (!start) {
    await menuPhone.evaluate(() => globalThis.__dragMenu.close());
    return { mounted: true, scrim: false, handle: false };
  }
  await menuPhone.mouse.move(start.x, start.y);
  await menuPhone.mouse.down();
  await menuPhone.mouse.move(start.x, start.y + Math.round(distance / 2));
  await menuPhone.mouse.move(start.x, start.y + distance);
  await menuPhone.mouse.up();
  const after = await menuPhone.evaluate(() => {
    const state = {
      mounted: globalThis.__dragMenu.el.isConnected,
      scrim: Boolean(document.querySelector(".db-mobile-sheet-scrim")),
    };
    globalThis.__dragMenu.close();
    return state;
  });
  return { ...after, handle: true };
};

const longDrag = await dragCase(140);
menuResults.push({
  name: "dragging a menu sheet's handle down past the threshold dismisses it",
  pass: longDrag.handle && !longDrag.mounted && !longDrag.scrim,
  detail: longDrag.handle
    ? `dragged 140px (threshold 96): menu still mounted=${longDrag.mounted} backdrop=${longDrag.scrim ? "left behind" : "gone"}`
    : "the menu has no grab handle, so there is no gesture to drive",
});
const shortDrag = await dragCase(40);
menuResults.push({
  name: "a short drag on the handle springs back instead of dismissing",
  pass: shortDrag.handle && shortDrag.mounted && shortDrag.scrim,
  detail: shortDrag.handle
    ? `dragged 40px (threshold 96): menu still mounted=${shortDrag.mounted} backdrop=${shortDrag.scrim ? "present" : "gone"}`
    : "the menu has no grab handle, so there is no gesture to drive",
});

await menuPhone.close();

// ───────────────────────────────────────────────────────────────────
// 5c-ii. THE ADD VIEW SURFACE
// ───────────────────────────────────────────────────────────────────
//
// Driven through `ToolbarRenderer.showAddViewMenu`, which is the only path that builds this surface
// and the only one that hands it to `positionToolbarPopover`. Nothing here is measured off the
// screenshot fixture: that fixture is hand-written markup, and when it was last trusted it reported
// four view types where the renderer emits seven, omitted the accessible names the renderer sets,
// and — because it pins the panel to `position: static` so the capture box does not collapse —
// photographed a bottom sheet as a popover. Two of six reported defects came from those gaps.
//
// The same block runs on a phone and on a desktop and asserts the two DIFFER, because the phone
// branch is a fork inside a function fourteen surfaces share.

const addViewProbe = (isPhone) => {
  const out = [];
  const { ToolbarRenderer, createMenuRow } = globalThis.__place;
  const host = document.querySelector(".note-database-container");
  const anchor = host.createDiv({ cls: "anchor" });
  const renderer = new ToolbarRenderer();
  const db = {
    schema: { columns: [
      { key: "file.name", label: "Name" },
      { key: "cost", label: "Cost" },
      { key: "billing", label: "Billing" },
    ] },
    views: [{ viewType: "table", name: "All" }],
  };
  renderer.showAddViewMenu(new MouseEvent("click"), { addView() {}, closeToolbarPopovers() {} }, anchor, db, 0);
  const panel = document.querySelector(".db-add-view-popover");
  const where = isPhone ? "phone" : "desktop";
  if (!panel) {
    out.push({ name: `add view: the surface renders (${where})`, pass: false, detail: "showAddViewMenu produced no panel" });
    return out;
  }

  // The accessible name of a control, by the same precedence a screen reader uses for the shapes
  // this surface contains: aria-label, then a label[for], then a wrapping label, then — for a
  // button — its own text.
  //
  // That last clause is not a detail. Without it every action row resolved to the empty string and
  // was filtered out, so the collision check compared four form controls and never saw the eight
  // rows it exists to check. Renaming the checkbox back to "Duplicate current view" left it green.
  const accName = (el) => {
    const aria = el.getAttribute("aria-label");
    if (aria) return aria.trim();
    const byFor = el.id ? panel.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
    if (byFor) return byFor.textContent.trim();
    const wrapping = el.closest("label");
    if (wrapping) return wrapping.textContent.trim();
    if (el.tagName !== "BUTTON") return "";
    // The icon slot contributes nothing to an accessible name: production puts an <svg> there, and
    // the harness stub puts a "\u25c6" glyph. Reading the whole button therefore compared
    // "\u25c6Duplicate current view" against "Duplicate current view" and found no collision — a
    // harness artifact deciding the result of a product check. Read the label slot when there is one.
    const labelSlot = el.querySelector(".db-menu-item-label");
    return (labelSlot ?? el).textContent.trim();
  };
  const controls = [...panel.querySelectorAll("input, select, textarea, button")];
  const named = controls.map((el) => accName(el)).filter(Boolean);
  const collisions = named.filter((n, i) => named.indexOf(n) !== i);

  // One affordance per action, or two names for two actions.
  out.push({
    name: `add view: no two controls share an accessible name (${where})`,
    pass: collisions.length === 0,
    detail: `${controls.length} controls, ${new Set(named).size} distinct names; `
      + (collisions.length ? `repeated: ${[...new Set(collisions)].join(", ")}` : "no repeats")
      + ` (was 2x "Duplicate current view")`,
  });

  // A visible label, not only an accessible one. A placeholder is not a label: it is gone
  // at the first keystroke, which is when the field most needs naming.
  const fields = [...panel.querySelectorAll("input, select, textarea")];
  const unlabelled = fields.filter((el) => {
    const byFor = el.id ? panel.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
    const wrapping = el.closest("label");
    const visible = byFor || wrapping;
    return !visible || !visible.textContent.trim();
  });
  out.push({
    name: `add view: every field carries a visible label (${where})`,
    pass: unlabelled.length === 0,
    detail: `${fields.length} fields, ${fields.length - unlabelled.length} visibly labelled`
      + (unlabelled.length ? `; unlabelled: ${unlabelled.map((el) => el.className || el.tagName).join(", ")}` : "")
      + " (was 0 of 3; the select read \"Cost\" and was named \"Title property\")",
  });

  // One row grammar. The comparison row is built by the shipped builder inside an owned
  // menu, so the two sides cannot drift apart in the harness; and the absolute value is pinned as
  // well as the difference, or a regression that moved BOTH would pass on equality alone.
  const control = host.createDiv({ cls: "db-owned-menu" });
  const reference = createMenuRow(control, { icon: "copy", label: "Reference row" }).row;
  const refCs = getComputedStyle(reference);
  const box = (el) => {
    const s = getComputedStyle(el);
    return `${s.minHeight}|${s.paddingTop}/${s.paddingRight}/${s.paddingBottom}/${s.paddingLeft}|${s.fontSize}`;
  };
  const refBox = box(reference);
  const rows = [...panel.querySelectorAll(".db-menu-item")];
  const offGrammar = rows.filter((r) => box(r) !== refBox);
  const expectedMinHeight = isPhone ? "44px" : "30px";
  out.push({
    name: `add view: every action row is the shared row grammar (${where})`,
    pass: rows.length >= 8 && offGrammar.length === 0 && refCs.minHeight === expectedMinHeight,
    detail: `${rows.length} rows, ${offGrammar.length} off-grammar; reference ${refBox}`
      + (offGrammar.length ? `; first divergence ${box(offGrammar[0])} on .${offGrammar[0].className}` : "")
      + `; reference min-height ${refCs.minHeight} (want ${expectedMinHeight})`
      + " (the duplicate action was 36px/6px 12px against the grammar's 30px/0 8px)",
  });
  control.remove();

  // Nothing reads as a loading skeleton.
  const skeletons = [...panel.querySelectorAll("span, div")].filter((el) => {
    if (el.childElementCount || el.textContent.trim()) return false;
    const s = getComputedStyle(el);
    const top = parseFloat(s.borderTopWidth) || 0;
    const bottom = parseFloat(s.borderBottomWidth) || 0;
    const sides = (parseFloat(s.borderLeftWidth) || 0) + (parseFloat(s.borderRightWidth) || 0);
    return top > 0 && bottom > 0 && sides === 0;
  });
  out.push({
    name: `add view: no element is drawn as bare horizontal rules (${where})`,
    pass: skeletons.length === 0,
    detail: `${skeletons.length} empty top-and-bottom-ruled boxes`
      + " (was 7 preview-lines spans, 42x18, 2px rules at .35 opacity — 1.54:1 in light)",
  });

  // More space around a group than inside it, measured off rectangles rather than
  // declarations, so a value the cascade overrode cannot satisfy it.
  //
  // The number asserted is the group's own trailing whitespace — its last field's bottom edge to
  // its own bottom edge — NOT the distance to the next group. The first version measured that
  // distance, and it stayed green when the padding was reverted, because the separator and the
  // heading sit in between and are tall enough to carry the gap on their own. A check whose subject
  // is furniture cannot see the property it claims to measure.
  const form = panel.querySelector(".db-add-view-form");
  const choices = panel.querySelector(".db-add-view-choices");
  const formFields = [...form.children];
  const withinGaps = formFields.slice(1).map((el, i) =>
    Math.round(el.getBoundingClientRect().top - formFields[i].getBoundingClientRect().bottom));
  const within = Math.max(0, ...withinGaps);
  const lastField = formFields[formFields.length - 1];
  const trailing = Math.round(form.getBoundingClientRect().bottom - lastField.getBoundingClientRect().bottom);
  const between = Math.round(choices.getBoundingClientRect().top - form.getBoundingClientRect().bottom);
  out.push({
    name: `add view: groups are further apart than the items inside them (${where})`,
    pass: trailing >= within * 2 && trailing > 0 && between > 0,
    detail: `group trailing space ${trailing}px vs within-group item gap ${within}px (want >= 2x; `
      + `was 0px vs 4px), and ${between}px of separator and heading between the two groups`,
  });

  // The groups are named, in the vocabulary the owned menu already uses.
  const sections = panel.querySelectorAll(".db-menu-section");
  const separators = panel.querySelectorAll(".db-menu-separator");
  out.push({
    name: `add view: the groups carry headings (${where})`,
    pass: sections.length >= 2 && separators.length >= 1,
    detail: `${sections.length} headings [${[...sections].map((s) => s.textContent).join(", ")}], `
      + `${separators.length} separators (was 0 and 0)`,
  });

  // One left edge for the whole surface.
  //
  // Measured at the CONTENT edge, not the box edge: a padded block starts its text a padding in
  // from its border, and comparing that against an unpadded label's rectangle reported a
  // misalignment that did not exist. The four things a reader scans down — group heading, field
  // caption, checkbox caption, row icon — have to share one edge, and on a phone they all move
  // together to the wider thumb inset rather than diverging.
  const contentLeft = (el) => {
    if (!el) return null;
    const box = el.getBoundingClientRect().left - panel.getBoundingClientRect().left;
    return Math.round(box + parseFloat(getComputedStyle(el).paddingLeft || "0"));
  };
  const edges = {
    heading: contentLeft(panel.querySelector(".db-menu-section")),
    fieldLabel: contentLeft(panel.querySelector(".db-add-view-field-label")),
    checkbox: contentLeft(panel.querySelector(".db-add-view-duplicate")),
    rowIcon: contentLeft(panel.querySelector(".db-menu-item .db-menu-item-icon")),
  };
  const distinctEdges = new Set(Object.values(edges));
  out.push({
    name: `add view: headings, captions and rows share one left edge (${where})`,
    pass: distinctEdges.size === 1,
    detail: Object.entries(edges).map(([k, v]) => `${k}=${v}`).join(" ")
      + ` — ${distinctEdges.size} distinct edge(s) (was 3: heading 9, field 15, row ${isPhone ? 29 : 21})`,
  });

  // A row is a <button>, and a host stylesheet fills every bare button. Nothing may paint behind a
  // resting row: the reset used to be scoped to the owned menu, so the first surface to build rows
  // outside one got that fill as a visible band.
  const restingRow = panel.querySelector(".db-menu-item");
  const rowBg = getComputedStyle(restingRow).backgroundColor;
  const transparent = rowBg === "rgba(0, 0, 0, 0)" || rowBg === "transparent";
  out.push({
    name: `add view: a resting row paints no fill of its own (${where})`,
    pass: transparent,
    detail: `row background=${rowBg} (want transparent; the host's button fill showed through as a band)`,
  });

  // Presentation. Asserted in both directions from one block, so a change that made
  // everything a sheet fails on the desktop side rather than passing quietly.
  const cs = getComputedStyle(panel);
  const rect = panel.getBoundingClientRect();
  const isSheet = panel.classList.contains("db-mobile-bottom-sheet");
  const scrim = Boolean(document.querySelector(".db-mobile-sheet-scrim"));
  const handle = panel.querySelector(".db-mobile-bottom-sheet-handle");
  const handleBox = handle ? handle.getBoundingClientRect() : null;
  if (isPhone) {
    out.push({
      name: "add view: on a phone the surface is a sheet on the viewport floor",
      pass: isSheet && cs.bottom === "0px" && Math.abs(rect.bottom - window.innerHeight) <= 1
        && Math.round(rect.width) >= window.innerWidth - 1 && scrim && Boolean(handle),
      detail: `sheet=${isSheet} bottom=${cs.bottom} rect.bottom=${Math.round(rect.bottom)} `
        + `viewport=${window.innerHeight} width=${Math.round(rect.width)}/${window.innerWidth} `
        + `scrim=${scrim} handle=${Boolean(handle)}`,
    });
    // The grab band is a ::before on the handle — 100vw by 48px, centred on a bar that is itself
    // only 36x4. `getBoundingClientRect` returns the bar and reports 4px, which is what this check
    // asserted on its first run: a real number read off the wrong box.
    //
    // So hit-test the document and walk outward until it stops answering "the handle". That also
    // catches what a declaration read would miss: the bar sits 8px below the sheet's top edge and
    // the sheet clips, so the half of the band above the bar is cut short. The declared 48px is
    // delivered as 45px here — and as 41px on the owned-menu sheet, measured the same way, so the
    // shortfall belongs to the shared handle rule rather than to this surface. The threshold is the
    // 44px thumb minimum this stylesheet already uses for phone menu rows.
    const hitsHandle = (x, y) => {
      const el = document.elementFromPoint(Math.round(x), Math.round(y));
      return Boolean(el) && (el === handle || handle?.contains(el));
    };
    const cx = handleBox ? handleBox.left + handleBox.width / 2 : 0;
    const cy = handleBox ? handleBox.top + handleBox.height / 2 : 0;
    let up = 0;
    let down = 0;
    if (handleBox) {
      while (up < 80 && hitsHandle(cx, cy - up - 1)) up += 1;
      while (down < 80 && hitsHandle(cx, cy + down + 1)) down += 1;
    }
    const band = handleBox ? up + down + Math.round(handleBox.height) : 0;
    // Sideways reach is the half of the claim a vertical walk cannot see: the band spans the header
    // rather than the 36px bar, so a thumb landing anywhere along the top still starts the gesture.
    const sideways = handleBox ? hitsHandle(cx + 120, cy) : false;
    out.push({
      name: "add view: the sheet's grab band is a thumb-sized target",
      pass: band >= 44 && sideways,
      detail: handleBox
        ? `bar ${Math.round(handleBox.width)}x${Math.round(handleBox.height)}, usable band ${band}px `
          + `(${up}px above + ${down}px below, walked by hit test; want >= 44), reaches 120px sideways=${sideways}`
          + " — the rule declares 48px and the sheet clips the top of it"
        : "no grab handle to measure",
    });
    out.push({
      name: "add view: the sheet is capped and scrolls rather than growing past the screen",
      pass: cs.maxHeight !== "none" && rect.height <= window.innerHeight * 0.9 + 2,
      detail: `height=${Math.round(rect.height)} max-height=${cs.maxHeight} cap=${Math.round(window.innerHeight * 0.9)}`,
    });
  } else {
    out.push({
      name: "add view: on a desktop the surface is still an anchored popover, not a sheet",
      pass: !isSheet && !scrim && !handle && cs.position === "fixed" && Math.round(rect.width) <= 320,
      detail: `sheet=${isSheet} scrim=${scrim} handle=${Boolean(handle)} position=${cs.position} `
        + `width=${Math.round(rect.width)} (menu-role ceiling 320)`,
    });
  }

  panel.remove();
  document.querySelector(".db-mobile-sheet-scrim")?.remove();
  anchor.remove();
  return out;
};

const addViewDesktop = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
await addViewDesktop.setContent(page_html);
await addViewDesktop.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await addViewDesktop.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await addViewDesktop.addScriptTag({ content: positionerJs });
const addViewDesktopResults = await addViewDesktop.evaluate(addViewProbe, false);
await addViewDesktop.close();

const addViewPhone = await browser.newPage({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
await addViewPhone.setContent(page_html.replace("<body>", phoneBody));
await addViewPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await addViewPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await addViewPhone.addScriptTag({ content: positionerJs });
const addViewPhoneResults = await addViewPhone.evaluate(addViewProbe, true);
await addViewPhone.close();

// ───────────────────────────────────────────────────────────────────
// 5d. DESKTOP — the menu must not have become a sheet
// ───────────────────────────────────────────────────────────────────
//
// A regression guard, and it passes before the change as well as after. That is what it is for: the
// phone branch is a new fork in a function fourteen call sites share, and the way this goes wrong is
// silently, on the presentation nobody was looking at. Its detail line carries the phone's numbers
// for the same menu so the two are legible side by side — a guard that cannot be seen to differ
// from the case it excludes is a guard nobody can check.

const menuDesktop = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
await menuDesktop.setContent(page_html);
await menuDesktop.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await menuDesktop.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await menuDesktop.addScriptTag({ content: positionerJs });

const desktopMenuResults = await menuDesktop.evaluate(() => {
  const out = [];
  const { createOwnedMenu } = globalThis.__place;
  const menu = createOwnedMenu(document);
  for (let i = 0; i < 6; i += 1) menu.addRow({ icon: "pencil", label: `Item ${i}` });
  menu.showAt({ x: 400, y: 200 });
  const r = menu.el.getBoundingClientRect();
  const style = getComputedStyle(menu.el);
  out.push({
    name: "a desktop menu still opens at its point and is not a sheet",
    pass: Math.abs(r.left - 400) <= 1
      && Math.abs(r.top - 200) <= 1
      && r.width <= 320
      && !menu.el.hasClass("db-mobile-bottom-sheet")
      && !menu.el.querySelector(".db-mobile-bottom-sheet-handle")
      && !document.querySelector(".db-mobile-sheet-scrim"),
    detail: `menu=[${Math.round(r.left)},${Math.round(r.top)}] asked for [400,200] width=${Math.round(r.width)} `
      + `bottom=${Math.round(r.bottom)} viewport=${window.innerHeight}; sheet class=${menu.el.hasClass("db-mobile-bottom-sheet")} `
      + `backdrop=${document.querySelector(".db-mobile-sheet-scrim") ? "present" : "absent"} position=${style.position}`,
  });
  menu.close();
  return out;
});

await menuDesktop.close();

// ───────────────────────────────────────────────────────────────────
// 5e. PHONE — what a press on a table cell means
// ───────────────────────────────────────────────────────────────────
//
// These drive the shipped press router with real `PointerEvent`s in a real document, because the
// question is which input made the press and that is only answerable from an event. A fixture that
// hands the router a string would prove the string.
//
// The stub reports `Platform.isDesktop`, which is left alone on purpose: the routing under test must
// not consult a platform flag, so a harness whose flags say desktop while its pointer says touch is
// the configuration that can tell the two apart. Every detail line prints `innerWidth` so a probe
// that quietly laid out at 980px cannot pass itself off as a phone.

const cellPhone = await browser.newPage({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
await cellPhone.setContent(page_html.replace("<body>", phoneBody));
await cellPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await cellPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await cellPhone.addScriptTag({ content: positionerJs });

const cellResults = await cellPhone.evaluate(async () => {
  const out = [];
  const {
    trackCellGesture, nextCellRange, resolveCellTapAction, isMainItemColumn,
    attachLongPress, isTouchDevice, attachTitleOpenAffordance, setupTitleCellTap,
  } = globalThis.__place;
  const vw = window.innerWidth;

  // The rectangle a range covers, by the same rule the views paint with (database-view
  // getSelectedCellAddresses): index the anchor and focus into the rendered order and take the
  // inclusive span. Arithmetic over the shipped range, not a second copy of the decision.
  const countCells = (range, rowPaths, colKeys) => {
    const rowA = rowPaths.indexOf(range.anchor.rowPath);
    const rowB = rowPaths.indexOf(range.focus.rowPath);
    const colA = colKeys.indexOf(range.anchor.colKey);
    const colB = colKeys.indexOf(range.focus.colKey);
    if (rowA < 0 || rowB < 0 || colA < 0 || colB < 0) return 0;
    return (Math.abs(rowA - rowB) + 1) * (Math.abs(colA - colB) + 1);
  };

  const rowPaths = Array.from({ length: 12 }, (unused, i) => `note-${i}.md`);
  const colKeys = ["file.name", "income", "expenses"];

  // Build the table the screenshot was taken of, and press the two cells the operator's two taps
  // landed on. The block's extent is measured off the screenshot rather than counted by eye: at
  // 1206x2622 for a 402x874 CSS viewport the device pixel ratio is 3, the selection borders sit at
  // y 1116-1121 and y 1824-1829, and the 708 device pixels between them are 236 CSS px. Over a 34px
  // row that is 6.94 rows, and exactly seven labels are enclosed — so the block is 7 rows by 2
  // columns, 14 cells. Counting it as 8 rows was an eye estimate that never survived measurement.
  const host = document.querySelector(".note-database-container");
  const table = document.createElement("table");
  table.className = "db-table";
  const tbody = document.createElement("tbody");
  for (const path of rowPaths) {
    const tr = document.createElement("tr");
    for (const key of colKeys) {
      const td = document.createElement("td");
      td.setAttribute("data-note-database-row-path", path);
      td.setAttribute("data-note-database-column-key", key);
      if (key === "file.name") {
        td.className = "db-title-cell";
        const a = document.createElement("a");
        a.textContent = "33 • Sep '27";
        td.appendChild(a);
      } else {
        td.textContent = "€ 4.975,32";
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  host.appendChild(table);

  const cellAt = (rowIndex, colIndex) => tbody.rows[rowIndex].cells[colIndex];
  const addressAt = (rowIndex, colIndex) => ({ rowPath: rowPaths[rowIndex], colKey: colKeys[colIndex] });

  const press = (el, pointerType) => {
    const rect = el.getBoundingClientRect();
    const init = {
      pointerType, bubbles: true, cancelable: true, button: 0,
      clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2,
    };
    el.dispatchEvent(new PointerEvent("pointerdown", init));
    el.dispatchEvent(new MouseEvent("mousedown", init));
  };

  // ── the gesture reader answers from the event ──
  //
  // Checked before anything that depends on it. A reader hardcoded to "touch" would satisfy the
  // range check below on its own, so the resting value and the mouse value are both asserted: only
  // a reader that actually reads `pointerType` returns all three.
  const readerCell = cellAt(0, 1);
  const readGesture = trackCellGesture(readerCell);
  const atRest = readGesture();
  press(readerCell, "touch");
  const afterTouch = readGesture();
  press(readerCell, "mouse");
  const afterMouse = readGesture();
  press(readerCell, "pen");
  const afterPen = readGesture();
  out.push({
    name: "a table cell reads its gesture from the pointer event, not from the device",
    pass: atRest === "mouse" && afterTouch === "touch" && afterMouse === "mouse" && afterPen === "touch",
    detail: `at rest=${atRest} after touch=${afterTouch} after mouse=${afterMouse} after pen=${afterPen}`
      + ` — Platform says desktop and isTouchDevice(container)=${isTouchDevice(host)}, so this answer`
      + ` came from the event; innerWidth=${vw}`,
  });

  // ── a tap collapses, a mouse still extends ──
  //
  // Both halves in one check, deliberately. "Always collapse" and "always extend" are each a
  // one-line rig that satisfies half of this, and neither survives the pair.
  const tapFirst = nextCellRange(null, addressAt(2, 0), { gesture: "touch", shiftKey: false });
  const tapSecond = nextCellRange(tapFirst, addressAt(8, 1), { gesture: "touch", shiftKey: false });
  const tapCells = countCells(tapSecond, rowPaths, colKeys);

  const mouseFirst = nextCellRange(null, addressAt(2, 0), { gesture: "mouse", shiftKey: false });
  const mouseSecond = nextCellRange(mouseFirst, addressAt(8, 1), { gesture: "mouse", shiftKey: true });
  const mouseCells = countCells(mouseSecond, rowPaths, colKeys);

  out.push({
    name: "a second tap picks one cell while a mouse still paints the range",
    pass: tapCells === 1 && mouseCells === 14
      && tapSecond.anchor.rowPath === tapSecond.focus.rowPath
      && mouseSecond.anchor.rowPath === rowPaths[2],
    detail: `tap then tap = ${tapCells} cell(s), anchor=${tapSecond.anchor.rowPath} focus=${tapSecond.focus.rowPath}`
      + ` (the reported block is 14: rows 2-8 x 2 columns, measured off the screenshot);`
      + ` mouse+shift = ${mouseCells} cell(s),`
      + ` anchor held at ${mouseSecond.anchor.rowPath}; innerWidth=${vw}`,
  });

  // ── the desktop grammar survives at phone width ──
  //
  // The constraint stated where it is hardest: 390px, hasTouch and isMobile both on. Passing here
  // means the routing keys off the gesture and not off the viewport.
  const dragStart = nextCellRange(null, addressAt(2, 0), { gesture: "mouse", shiftKey: false });
  const dragEnd = nextCellRange(dragStart, addressAt(9, 2), { gesture: "mouse", shiftKey: true });
  out.push({
    name: "shift-extend still works at 390px with touch reported present",
    pass: countCells(dragEnd, rowPaths, colKeys) === 24 && dragEnd.anchor.colKey === "file.name",
    detail: `mouse+shift across 8 rows x 3 columns = ${countCells(dragEnd, rowPaths, colKeys)} cell(s)`
      + ` (want 24), anchor=${dragEnd.anchor.colKey}; viewport=${vw}x${window.innerHeight}`
      + ` hasTouch=${navigator.maxTouchPoints > 0} coarse=${matchMedia("(pointer: coarse)").matches}`,
  });

  // ── the operator's sentence, as a truth table ──
  const action = (gesture, isTitleCell, isEditable) => resolveCellTapAction({ gesture, isTitleCell, isEditable });
  const table4 = [
    ["touch", true, true, "open-record"],
    ["touch", false, true, "edit-cell"],
    ["touch", false, false, "select-cell"],
    ["mouse", true, true, "select-cell"],
    ["mouse", false, true, "select-cell"],
  ];
  const wrong = table4.filter(([g, t, e, want]) => action(g, t, e) !== want);
  out.push({
    name: "a tap edits its column and the main item opens the record, while a click does neither",
    pass: wrong.length === 0,
    detail: table4.map(([g, t, e, want]) => `${g}/${t ? "title" : "cell"}/${e ? "editable" : "readonly"}`
      + `=${action(g, t, e)}${action(g, t, e) === want ? "" : ` WANT ${want}`}`).join(" "),
  });

  // ── which column is the row's main item ──
  //
  // The truth table above takes `isTitleCell` as given. This is where that answer comes from, and
  // the second row is the one that was wrong: with the note name hidden the first visible column
  // becomes the main item, and the cell renderer used to answer `false` there unconditionally — so
  // a tap opened that column's editor while the cell's own handler opened the record sheet.
  const mainItem = [
    ["file.name", ["file.name", "income", "expenses"], true],
    ["income", ["income", "expenses"], true],
    ["income", ["file.name", "income", "expenses"], false],
    ["expenses", ["income", "expenses"], false],
    ["income", [], false],
  ];
  const mainItemWrong = mainItem.filter(([key, visible, want]) => isMainItemColumn(key, visible) !== want);
  out.push({
    name: "the row's main item is the note name, or the first visible column when it is hidden",
    pass: mainItemWrong.length === 0,
    detail: mainItem.map(([key, visible, want]) =>
      `${key} in [${visible.join(",") || "nothing"}]=${isMainItemColumn(key, visible)}`
      + `${isMainItemColumn(key, visible) === want ? "" : ` WANT ${want}`}`).join("; "),
  });

  // ── the record opens from the cell, not from the icon in it ──
  //
  // The shipped affordance is mounted so the real button is present at its real size, and the press
  // has to land on bare cell — not on the button, and not on the note link either.
  //
  // "40px left of the button" was the first version of that, and it landed on the link every time:
  // the phone rule gives the link `min-width:128px` inside a 169px cell, so the offset that was
  // meant to mean "cell" pointed at a descendant with its own click handler, and the bare-cell case
  // this check is named for was never probed. So find the strip by measurement instead — walk left
  // from the button's edge until the hit test answers with the cell itself. If no such strip exists
  // the walk returns nothing and this fails, which is the honest result: a cell with no bare area
  // has no bare-area behaviour to assert.
  const titleTd = cellAt(4, 0);
  attachTitleOpenAffordance(titleTd, { file: { path: rowPaths[4], name: "33.md" } }, { open: () => undefined });
  const button = titleTd.querySelector(".db-record-open-btn");
  const btnRect = button.getBoundingClientRect();
  const cellRect = titleTd.getBoundingClientRect();
  const probeY = Math.round(cellRect.top + cellRect.height / 2);
  const bareCellX = (() => {
    for (let x = Math.round(btnRect.left) - 1; x > cellRect.left; x -= 1) {
      if (document.elementFromPoint(x, probeY) === titleTd) return x;
    }
    return null;
  })();
  const probeX = bareCellX ?? Math.round(btnRect.left - 40);
  const hit = document.elementFromPoint(probeX, probeY);
  const hitIsCell = hit === titleTd;

  const titleGesture = trackCellGesture(titleTd);
  titleTd.dispatchEvent(new PointerEvent("pointerdown", {
    pointerType: "touch", bubbles: true, cancelable: true, button: 0, clientX: probeX, clientY: probeY,
  }));
  const tapAction = resolveCellTapAction({ gesture: titleGesture(), isTitleCell: true, isEditable: true });
  titleTd.dispatchEvent(new PointerEvent("pointerdown", {
    pointerType: "mouse", bubbles: true, cancelable: true, button: 0, clientX: probeX, clientY: probeY,
  }));
  const clickAction = resolveCellTapAction({ gesture: titleGesture(), isTitleCell: true, isEditable: true });

  out.push({
    name: "a tap anywhere in the title cell opens the record, and a click there still does not",
    pass: hitIsCell && tapAction === "open-record" && clickAction === "select-cell",
    detail: `press at x=${probeX} (bare cell found ${bareCellX === null ? "nowhere" : `${Math.round(btnRect.left) - bareCellX}px left of the button`})`
      + ` hits ${hit ? hit.tagName.toLowerCase() : "nothing"}, and that is the cell itself=${hitIsCell};`
      + ` tap=${tapAction} click=${clickAction};`
      + ` cell=${Math.round(cellRect.width)}x${Math.round(cellRect.height)}`
      + ` vs button=${Math.round(btnRect.width)}x${Math.round(btnRect.height)}`,
  });

  // ── the shipped handler, driven end to end ──
  //
  // Everything above calls the pure functions and reads the gesture. None of it binds the thing
  // that ships: the composition that has to hear a click, ask the router, and open the record. A
  // resolver returning the right string proves nothing if nobody calls it, and that is exactly the
  // state the embedded renderer was in — the module was correct and the binding was missing.
  //
  // So bind the production handler and dispatch the pointerdown-then-click a finger really
  // produces, at three points that mean three different things. The link carries a click handler
  // here because the shipped cell renderer gives it one: without that stand-in, "the capture phase
  // suppresses the link" is a claim with nothing on the other side of it to suppress.
  const openTd = cellAt(5, 0);
  const openRow = { file: { path: rowPaths[5], name: "34.md" } };
  const openLink = openTd.querySelector("a");
  let navigated = 0;
  openLink.addEventListener("click", () => { navigated += 1; });
  attachTitleOpenAffordance(openTd, openRow, { open: () => undefined });
  const openBtn = openTd.querySelector(".db-record-open-btn");
  const openedPaths = [];
  setupTitleCellTap(openTd, openRow, { openRecord: (anchorEl, r) => openedPaths.push(r.file.path) });

  const openCellRect = openTd.getBoundingClientRect();
  const openBtnRect = openBtn.getBoundingClientRect();
  const openLinkRect = openLink.getBoundingClientRect();
  const openY = Math.round(openCellRect.top + openCellRect.height / 2);
  const openBareX = (() => {
    for (let x = Math.round(openBtnRect.left) - 1; x > openCellRect.left; x -= 1) {
      if (document.elementFromPoint(x, openY) === openTd) return x;
    }
    return null;
  })();
  const openLinkX = Math.round(openLinkRect.left + openLinkRect.width / 2);

  // Dispatched on the element the finger is actually over, so the capture-phase handler on the cell
  // meets a real descendant target rather than a synthetic one that skips the phase under test.
  const pressAndRelease = (el, x, y, pointerType) => {
    const init = { pointerType, bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y };
    el.dispatchEvent(new PointerEvent("pointerdown", init));
    el.dispatchEvent(new MouseEvent("click", init));
  };

  pressAndRelease(openTd, openBareX ?? Math.round(openCellRect.left + 4), openY, "touch");
  const afterBareTap = openedPaths.length;
  pressAndRelease(openLink, openLinkX, openY, "touch");
  const afterLinkTap = openedPaths.length;
  const navigatedAfterTaps = navigated;
  pressAndRelease(openLink, openLinkX, openY, "mouse");
  const afterLinkClick = openedPaths.length;
  pressAndRelease(openBtn, Math.round(openBtnRect.left + openBtnRect.width / 2), openY, "touch");
  const afterButtonTap = openedPaths.length;

  out.push({
    name: "the shipped title-cell handler opens the record from a real tap, and leaves the mouse alone",
    pass: openBareX !== null
      && afterBareTap === 1 && afterLinkTap === 2 && navigatedAfterTaps === 0
      && afterLinkClick === 2 && navigated === 1
      && afterButtonTap === 2
      && openedPaths.every((path) => path === rowPaths[5]),
    detail: `tap on bare cell at x=${openBareX} opened ${afterBareTap}; tap on the link opened`
      + ` ${afterLinkTap - afterBareTap} more and navigated ${navigatedAfterTaps} time(s);`
      + ` a mouse click on the link opened ${afterLinkClick - afterLinkTap} more and navigated`
      + ` ${navigated - navigatedAfterTaps} time(s); a tap on the open button opened`
      + ` ${afterButtonTap - afterLinkClick} more, because the button owns that press;`
      + ` rows opened=${openedPaths.join(",") || "none"} (want ${rowPaths[5]} twice)`,
  });

  // ── how much of a thumb the main-item cell actually gets ──
  //
  // The 44px floor is not reachable here and this says so with a measurement rather than leaving it
  // to a reader's arithmetic. Two independent reasons, both measured: the cell clips its overflow,
  // so a pseudo-element grown past its box is cut back to it; and even uncut, every row in a
  // contiguous table is followed by another row whose own area starts exactly where this one's box
  // ends, so there are no dead pixels between them to reclaim. Growing the hit area cannot add
  // reach that no one else is already using. Only the row's height can, and that is a density
  // setting the reader owns.
  //
  // What IS assertable, and is the thing a naive fix breaks, is that every pixel belongs to the row
  // it looks like it belongs to. A band centred on the row instead of anchored to it reaches into
  // the row above and, because the lower row paints last, hands those pixels to the wrong row —
  // trading a near miss for a confident hit on something else. This fails if anyone tries that.
  const targetTd = cellAt(7, 0);
  const belowTd = cellAt(8, 0);
  const targetRect = targetTd.getBoundingClientRect();
  const belowRect = belowTd.getBoundingClientRect();
  const targetX = Math.round(targetRect.left + 8);
  // Ownership is the cell or anything inside it: a finger on the note link is still a finger on
  // that row, and the question here is which row a press lands in, not which descendant.
  const ownerAt = (y) => {
    const el = document.elementFromPoint(targetX, Math.round(y));
    return el ? el.closest("td") : null;
  };
  let reach = 0;
  while (reach < 120 && ownerAt(targetRect.top + reach + 0.5) === targetTd) reach += 1;
  const lastPixelOfMine = ownerAt(belowRect.top - 1) === targetTd;
  const firstPixelOfTheirs = ownerAt(belowRect.top + 0.5) === belowTd;
  const theirMiddle = ownerAt(belowRect.top + belowRect.height / 2) === belowTd;
  out.push({
    name: "every pixel of a table row belongs to the row it looks like it belongs to",
    pass: lastPixelOfMine && firstPixelOfTheirs && theirMiddle && reach >= Math.round(targetRect.height) - 1,
    detail: `the cell owns ${reach}px of the ${Math.round(targetRect.height)}px row and no more;`
      + ` the row below owns its own first pixel=${firstPixelOfTheirs} and its middle=${theirMiddle},`
      + ` and the last pixel above the boundary is still this row's=${lastPixelOfMine}`
      + ` — ${reach}px is under the 44px thumb floor and cannot be raised from here: the cell clips`
      + ` its overflow, and the row below starts where this one ends, so there is nothing between`
      + ` them to claim. Only row height reaches 44, and that is a density decision.`,
  });

  // ── the long-press row menu is still reachable ──
  //
  // The gesture space was not empty before this change and must not be emptied by it. A press held
  // past the delay has to still open the row menu, and a tap has to still not open it.
  const menuRow = tbody.rows[6];
  let longPresses = 0;
  attachLongPress(menuRow, { onLongPress: () => { longPresses += 1; } });
  const hold = (el, ms) => new Promise((resolve) => {
    const rect = el.getBoundingClientRect();
    const init = {
      pointerType: "touch", bubbles: true, cancelable: true, button: 0, pointerId: 1,
      clientX: rect.left + 20, clientY: rect.top + rect.height / 2,
    };
    el.dispatchEvent(new PointerEvent("pointerdown", init));
    setTimeout(() => {
      el.dispatchEvent(new PointerEvent("pointerup", init));
      resolve();
    }, ms);
  });
  await hold(menuRow, 100);
  const afterTap = longPresses;
  await hold(menuRow, 600);
  const afterHold = longPresses;
  out.push({
    name: "a held press still opens the row menu and a tap still does not",
    pass: afterTap === 0 && afterHold === 1,
    detail: `100ms press fired ${afterTap} long-press(es), 600ms press fired ${afterHold - afterTap}`
      + ` (delay is 450ms); isTouchDevice(row)=${isTouchDevice(menuRow)}`,
  });

  // ── renaming is reachable without a hover-only hint ──
  //
  // Every rename entry point in this plugin opens on a double-click and says so in a tooltip. A
  // phone can produce the gesture but never sees the tooltip, so the action existed and could not
  // be found. The long-press menu is the one place a thumb already goes on purpose, so the action is
  // named there. Driven through the shipped RowMenu rather than asserted against the source: the
  // entry has to be built, carry a label, and reach the host's rename when pressed.
  const { RowMenu } = globalThis.__place;
  const menuHost = document.querySelector(".note-database-container");
  const renamed = [];
  const rowMenu = new RowMenu({
    app: { workspace: { containerEl: menuHost } },
    openRow: () => undefined,
    deleteRow: async () => undefined,
    duplicateRow: async () => undefined,
    renameRow: (r) => renamed.push(r.file.path),
    isReadOnly: false,
  });
  const menuRowData = { file: { path: rowPaths[3], name: "36.md", basename: "36" } };
  rowMenu.show(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }), menuRowData, undefined, tbody.rows[3]);
  const builtMenu = document.querySelector(".db-owned-menu");
  const entries = builtMenu ? [...builtMenu.querySelectorAll(".db-menu-item")] : [];
  const labelOf = (el) => (el.querySelector(".db-menu-item-label") ?? el).textContent.trim();
  const renameEntry = entries.find((el) => /renam/i.test(labelOf(el)));
  renameEntry?.click();
  out.push({
    name: "the long-press row menu offers a rename, and pressing it reaches the shipped editor",
    pass: Boolean(renameEntry) && renamed.length === 1 && renamed[0] === rowPaths[3],
    detail: `${entries.length} menu entries [${entries.map(labelOf).join(", ")}];`
      + ` a rename entry is ${renameEntry ? `present as "${labelOf(renameEntry)}"` : "MISSING"}`
      + ` and pressing it renamed ${renamed.length} row(s) [${renamed.join(",") || "none"}]`
      + ` (want 1: ${rowPaths[3]}) — the other entry points are all double-click plus a tooltip,`
      + " which a phone shows to nobody",
  });
  builtMenu?.remove();
  document.querySelector(".db-mobile-sheet-scrim")?.remove();

  // ── an open sheet takes the tap instead of the table ──
  //
  // "A tap must not fight the sheet's dismissal" is a claim about what the tap can reach, so it is
  // answered with a hit test rather than by reading the handlers. The sheet's own backdrop is what
  // settles it: while one is up, the coordinates of a cell resolve to the backdrop, so the press
  // that dismisses cannot also land on a cell and open an editor on the way out.
  const sheetPanel = document.createElement("div");
  sheetPanel.className = "note-database-container db-record-detail-panel";
  document.body.appendChild(sheetPanel);
  globalThis.__place.applySheetChrome(sheetPanel, true);
  const scrim = document.body.querySelector(".db-mobile-sheet-scrim");
  const probeCell = cellAt(1, 1);
  const cellBox = probeCell.getBoundingClientRect();
  const overCell = document.elementFromPoint(
    Math.round(cellBox.left + cellBox.width / 2),
    Math.round(cellBox.top + cellBox.height / 2),
  );
  const scrimStyle = scrim ? getComputedStyle(scrim) : null;
  out.push({
    name: "while a record sheet is open the backdrop takes the tap, not the cell under it",
    pass: Boolean(scrim) && scrimStyle.pointerEvents !== "none"
      && Boolean(overCell) && !overCell.closest("td"),
    detail: `backdrop=${scrim ? "present" : "absent"} pointer-events=${scrimStyle ? scrimStyle.pointerEvents : "n/a"}`
      + ` inset=${scrimStyle ? scrimStyle.inset : "n/a"}; a press at the centre of a visible cell`
      + ` resolves to <${overCell ? overCell.tagName.toLowerCase() : "nothing"}`
      + `${overCell && overCell.className ? ` class="${overCell.className}"` : ""}>`,
  });
  globalThis.__place.applySheetChrome(sheetPanel, false);
  sheetPanel.remove();

  table.remove();
  return out;
});

await cellPhone.close();

// ───────────────────────────────────────────────────────────────────
// 5f. PHONE — THE RECORD SHEET'S OWN HEADER IS REACHABLE
// ───────────────────────────────────────────────────────────────────
//
// The sheet's grab band is a 100vw pseudo-element centred on a 4px bar. Where a sheet pads its top
// generously the bar sits far enough down that the band's lower half lands on the sheet's own
// header, and a pseudo-element hit-tests as its owner — so the band answers presses aimed at the
// header and nothing announces it. Measured on the record sheet before this was fixed: the band ran
// 2..50px from the sheet's top edge while the header started at 32, so it covered the title outright
// and the top 18px of both 44px actions.
//
// That mattered beyond the buttons. The title's rename opens on a double-click, and with the band
// over it the second tap never reached the title — which is how "a tap opens the record" came to
// look like it had removed renaming from the phone entirely. It had not; the band had.
//
// So this drives the shipped panel and asks the questions by hit test and by gesture: does a press
// aimed at each header element reach it, does each action deliver the 44px it declares, and does a
// real double-tap on the title reach the rename handler.

const sheetPhone = await browser.newPage({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
await sheetPhone.setContent(page_html.replace("<body>", phoneBody));
await sheetPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await sheetPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await sheetPhone.addScriptTag({ content: positionerJs });

const sheetSetup = await sheetPhone.evaluate(() => {
  const { openRecordDetailPanel } = globalThis.__place;
  const host = document.querySelector(".note-database-container");
  const row = { file: { path: "33.md", basename: "33", name: "33.md" }, frontmatter: { income: 1 }, computed: {} };
  globalThis.__renames = 0;
  openRecordDetailPanel({
    anchorEl: document.getElementById("anchor"),
    host,
    row,
    columns: [{ key: "file.name", label: "Name", type: "text" }, { key: "income", label: "Income", type: "number" }],
    config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
    app: {},
    actions: {
      editCell: () => {},
      openRow: () => {},
      editFileName: () => { globalThis.__renames += 1; },
      isReadOnly: false,
    },
  });
  const panel = document.querySelector(".db-record-detail-panel");
  const title = panel.querySelector(".db-record-detail-title");
  const box = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; };
  return { titleCentre: box(title) };
});

const sheetResults = await sheetPhone.evaluate((titleCentre) => {
  const out = [];
  const panel = document.querySelector(".db-record-detail-panel");
  const handle = panel.querySelector(".db-mobile-bottom-sheet-handle");
  const title = panel.querySelector(".db-record-detail-title");
  const actions = [...panel.querySelectorAll(".db-record-detail-header button")];
  const panelTop = panel.getBoundingClientRect().top;

  const reaches = (el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
    return Boolean(hit) && (hit === el || el.contains(hit));
  };
  // How much of a declared target a thumb can actually use: walk from its own centre until
  // something else answers. A 44px button with 18 of them under a drag band is a 26px button.
  const usableHeight = (el) => {
    const r = el.getBoundingClientRect();
    const x = Math.round(r.left + r.width / 2);
    const owns = (y) => { const hit = document.elementFromPoint(x, Math.round(y)); return Boolean(hit) && (hit === el || el.contains(hit)); };
    if (!owns(r.top + r.height / 2)) return 0;
    let up = 0; let down = 0;
    while (up < 80 && owns(r.top + r.height / 2 - up - 1)) up += 1;
    while (down < 80 && owns(r.top + r.height / 2 + down + 1)) down += 1;
    return up + down + 1;
  };

  const stolen = [title, ...actions].filter((el) => !reaches(el));
  out.push({
    name: "the sheet's grab band takes no press that was aimed at the sheet's own header",
    pass: stolen.length === 0 && actions.length >= 2,
    detail: `${actions.length} header action(s) and the title, ${stolen.length} of them answered by`
      + ` something else` + (stolen.length ? `: ${stolen.map((el) => el.className).join(", ")}` : "")
      + ` — the band was measured covering the title outright and the top 18px of both actions`,
  });

  const short = actions.filter((el) => usableHeight(el) < 44);
  out.push({
    name: "the sheet's header actions deliver the whole 44px they declare",
    pass: short.length === 0 && actions.length >= 2,
    detail: actions.map((el) => `${el.className.split(" ")[0]}=${usableHeight(el)}px of`
      + ` ${Math.round(el.getBoundingClientRect().height)}px`).join(", ")
      + ` (want >= 44 each; under the band they measured 26 of 44)`,
  });

  // The band still has to be a band. Walked the same way the menu sheet's is, so the two numbers
  // are comparable, and reported against the sheet's top edge so a reader can see where it starts.
  const hb = handle.getBoundingClientRect();
  const hits = (x, y) => { const el = document.elementFromPoint(Math.round(x), Math.round(y)); return Boolean(el) && (el === handle || handle.contains(el)); };
  const cx = hb.left + hb.width / 2; const cy = hb.top + hb.height / 2;
  let up = 0; let down = 0;
  while (up < 80 && hits(cx, cy - up - 1)) up += 1;
  while (down < 80 && hits(cx, cy + down + 1)) down += 1;
  const band = up + down + Math.round(hb.height);
  const startsAtTheEdge = Math.round(cy - up - panelTop) <= 1;
  out.push({
    name: "the record sheet's grab band starts at the sheet's top edge and spans its width",
    pass: startsAtTheEdge && band >= 30 && hits(cx + 120, cy),
    detail: `band ${band}px (${up} above the bar + ${down} below), starting ${Math.round(cy - up - panelTop)}px`
      + ` from the sheet's top edge, reaching 120px sideways=${hits(cx + 120, cy)}`
      + ` — the operator asked for 48. This surface has ${Math.round(title.getBoundingClientRect().top - panelTop)}px`
      + ` of chrome above its header, so 48 is only reachable by making the header taller, which`
      + ` moves every sheet's content and is a decision this does not take`,
  });

  void titleCentre;
  void title;
  return out;
}, sheetSetup.titleCentre);

// The gesture, not a synthesised pair: two real taps through the browser's own touch pipeline, so
// the `dblclick` the rename listens for is the one the browser decides to synthesise or not.
await sheetPhone.touchscreen.tap(sheetSetup.titleCentre.x, sheetSetup.titleCentre.y);
await sheetPhone.waitForTimeout(60);
await sheetPhone.touchscreen.tap(sheetSetup.titleCentre.x, sheetSetup.titleCentre.y);
await sheetPhone.waitForTimeout(300);
const renames = await sheetPhone.evaluate(() => globalThis.__renames);
sheetResults.push({
  name: "a double-tap on the record sheet's title reaches the rename editor",
  pass: renames === 1,
  detail: `two taps at the title's centre opened ${renames} rename editor(s) (want 1)`
    + " — under the grab band this was 0, and every other rename entry point in the plugin is also"
    + " a double-click, so this was the whole of it on a phone",
});
await sheetPhone.close();

// ───────────────────────────────────────────────────────────────────
// 5b. THE SELECT COLUMN'S CHECKBOX STAYS INSIDE ITS CLIPPING CELL
// ───────────────────────────────────────────────────────────────────
//
// The select cell declares `overflow: hidden`, so a checkbox that is not pinned does not merely sit
// in the wrong place — it is sheared by the cell wall. The pin lived in a block guarded against the
// shared checkbox component's own class, written as a fallback for controls that had not migrated.
// When the table's checkbox migrated, the guard switched the pin off with the appearance it was
// meant to scope, and the box fell into flow at the left wall with zero clearance.
//
// Two assertions, because either alone can pass while the defect is live. The class assertion is
// what makes the geometry meaningful: it fails if the shared component ever stops stamping the class
// the fixture carries, which is the drift that would make this fixture stop resembling production.

const selectCell = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
await selectCell.setContent(`<body><div id="shot">${SCENARIOS.find((s) => s.id === "table-view").html()}</div></body>`);
await selectCell.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await selectCell.addStyleTag({ content: readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8") });
const selectCellResults = await selectCell.evaluate(() => {
  const out = [];
  const cells = [...document.querySelectorAll(".db-select-col")].filter((c) => c.querySelector('input[type="checkbox"]'));
  const measured = cells.map((cell) => {
    const box = cell.querySelector('input[type="checkbox"]');
    const c = cell.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    return {
      tag: cell.tagName,
      owned: box.classList.contains("db-checkbox"),
      left: +(b.left - c.left).toFixed(2),
      right: +(c.right - b.right).toFixed(2),
      clips: getComputedStyle(cell).overflow === "hidden",
    };
  });

  const owned = measured.filter((m) => m.owned).length;
  out.push({
    name: "the select column's checkbox is the shared owned control",
    pass: measured.length > 0 && owned === measured.length,
    detail: `${owned}/${measured.length} select checkboxes carry the shared component class`
      + " (if this fails the fixture no longer resembles what the factory builds, and the geometry"
      + " check below is measuring something production does not render)",
  });

  const worst = measured.reduce((a, m) => Math.min(a, m.left), Infinity);
  const clipping = measured.filter((m) => m.clips).length;
  out.push({
    name: "the select checkbox keeps clearance from the cell edge that clips it",
    pass: measured.length > 0 && worst >= 4,
    detail: `narrowest left clearance ${worst}px across ${measured.length} cells`
      + ` (${clipping} of them clip their overflow); right clearance`
      + ` ${[...new Set(measured.map((m) => m.right))].join("/")}px. Unpinned this measures 0px and the`
      + " box is sheared by the cell wall.",
  });

  const rights = new Set(measured.map((m) => m.right));
  out.push({
    name: "the header checkbox and the row checkboxes land on the same column",
    pass: rights.size === 1,
    detail: `right clearance takes ${rights.size} distinct value(s): ${[...rights].join(", ")}px`
      + " — the header and every row must coincide, or sorting a column makes the checkbox jump",
  });
  return out;
});
await selectCell.close();

// ───────────────────────────────────────────────────────────────────
// 5f. WHAT A PRESS ON A ROW CHECKBOX MEANS
// ───────────────────────────────────────────────────────────────────
//
// The row checkbox had the cell defect that 5e repaired, in the same two files, and kept it: its
// range flag read `shiftKey || isTouchDevice(container)`, so on anything measuring as touch every
// press extended from the last one. Shift held down with no way to let go.
//
// These drive the shipped rule with real `PointerEvent`s through the shipped gesture module, and
// let it mutate a real selection set through `applyRowSelectionPress` — the function both views
// now call. The only thing standing in for production is the four-line adapter each view wraps it
// in, reproduced here in the same shape and the same listener order.
//
// Two pages, because one number has to come from each. The phone answers whether a thumb can still
// reach a range. The desktop page is deliberately built narrow — a 700px split pane on a 1440px
// window — so `isTouchDevice` reports true while the pointer says mouse. That configuration is the
// one the old predicate got wrong on a desktop, and every check on that page asserts the predicate
// is true before trusting its own result, or it would be passing for the wrong reason.

const rowRangeProbe = async ({ pointerType }) => {
  const {
    applyRowSelectionPress, attachRowRangeGesture, attachLongPress, isTouchDevice,
  } = globalThis.__place;
  const out = [];

  // The haptic is the gesture's only outward signal, so it is counted rather than assumed. A hold
  // that buzzes twice is two gestures wearing one costume, which is what the embedded row menu did
  // before it started screening its targets ahead of its timer instead of after it.
  let vibrations = 0;
  Object.defineProperty(navigator, "vibrate", {
    value: () => { vibrations += 1; return true; },
    configurable: true,
    writable: true,
  });

  const rowPaths = Array.from({ length: 12 }, (unused, i) => `note-${i}.md`);
  const selected = new Set();
  let anchorId = null;
  let extendCount = 0;
  let menuCount = 0;

  const boxes = [];
  const cells = [];
  const rows = [];
  const sync = () => {
    for (let i = 0; i < boxes.length; i += 1) boxes[i].checked = selected.has(rowPaths[i]);
  };

  const host = document.querySelector(".note-database-container");
  const table = document.createElement("table");
  table.className = "db-table";
  const tbody = document.createElement("tbody");
  for (const path of rowPaths) {
    const tr = document.createElement("tr");
    tr.setAttribute("data-note-database-row-path", path);
    const selectTd = document.createElement("td");
    selectTd.className = "db-select-col";
    const inner = document.createElement("div");
    inner.className = "db-select-inner";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "db-checkbox db-checkbox-row";
    inner.appendChild(cb);
    selectTd.appendChild(inner);
    tr.appendChild(selectTd);
    const dataTd = document.createElement("td");
    dataTd.textContent = "€ 4.975,32";
    tr.appendChild(dataTd);
    tbody.appendChild(tr);
    boxes.push(cb);
    cells.push(dataTd);
    rows.push(tr);

    // The view adapter. It decides nothing: it reports whether a modifier was down and whether the
    // press came through the hold gesture, and the bundle decides what that means.
    const press = (isSelected, input) => {
      anchorId = applyRowSelectionPress({
        orderedIds: rowPaths,
        selectedIds: selected,
        anchorId,
        targetId: path,
        selected: isSelected,
        shiftKey: input.shiftKey,
        heldPress: input.heldPress,
      });
      sync();
    };
    cb.onclick = (event) => {
      event.stopPropagation();
      press(!selected.has(path), { shiftKey: event.shiftKey, heldPress: false });
    };
    attachLongPress(tr, {
      ignoreTarget: (event) => typeof event.target?.closest === "function"
        && Boolean(event.target.closest("input, select, textarea, button, a")),
      onLongPress: () => { menuCount += 1; },
    });
    attachRowRangeGesture(tr, {
      onExtendRange: () => {
        extendCount += 1;
        press(true, { shiftKey: false, heldPress: true });
      },
    });
  }
  table.appendChild(tbody);
  host.appendChild(table);

  const at = (el) => {
    const r = el.getBoundingClientRect();
    return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
  };
  const pointer = (el, type) => el.dispatchEvent(new PointerEvent(type, {
    pointerType, pointerId: 1, bubbles: true, cancelable: true, button: 0, ...at(el),
  }));
  const clickOn = (el, shiftKey) => el.dispatchEvent(new MouseEvent("click", {
    bubbles: true, cancelable: true, button: 0, shiftKey: Boolean(shiftKey), ...at(el),
  }));
  const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
  const tap = async (el, shiftKey) => {
    pointer(el, "pointerdown");
    await wait(20);
    pointer(el, "pointerup");
    clickOn(el, shiftKey);
  };
  const holdDown = async (el, ms) => {
    pointer(el, "pointerdown");
    await wait(ms);
  };
  const release = (el) => {
    pointer(el, "pointerup");
    clickOn(el, false);
  };

  const reset = () => {
    selected.clear();
    anchorId = null;
    extendCount = 0;
    menuCount = 0;
    vibrations = 0;
    sync();
  };
  const shown = () => [...selected].sort().join(",");
  const spanOf = (a, b) => rowPaths.slice(a, b + 1).sort().join(",");

  // `isTouchDevice` is reported, never consulted. It is in every detail line because it is the
  // predicate that used to answer this question, and seeing what it says next to what the code did
  // is the only way to read whether the two came apart on purpose.
  const measuresTouch = isTouchDevice(rows[0]);
  const where = `pointerType=${pointerType} isTouchDevice(row)=${measuresTouch} innerWidth=${window.innerWidth}`;

  // ── a press with no second grammar behind it selects exactly one row ──
  reset();
  await tap(boxes[2]);
  await tap(boxes[8]);
  const twoTaps = shown();
  out.push({
    name: pointerType === "touch"
      ? "a tap on a row checkbox selects only that row"
      : "a mouse click on a row checkbox selects only that row, however narrow the pane",
    pass: twoTaps === "note-2.md,note-8.md" && selected.size === 2 && extendCount === 0
      && (pointerType !== "mouse" || measuresTouch),
    detail: `pressing rows 2 and 8 selected ${selected.size} row(s): ${twoTaps} — want 2.`
      + ` Under \`shiftKey || isTouchDevice\` the second press painted the span and this read 7:`
      + ` ${spanOf(2, 8)}. ${where}`
      + (pointerType === "mouse"
        ? " — this check requires the predicate to be true, or it would pass on a wide pane for a reason it is not testing"
        : ""),
  });

  // ── the modifier grammar, which only a keyboard can reach ──
  reset();
  await tap(boxes[2]);
  await tap(boxes[8], true);
  const shiftSpan = shown();
  out.push({
    name: "a shift-click on a row checkbox still extends the selection",
    pass: shiftSpan === spanOf(2, 8) && selected.size === 7,
    detail: `shift-clicking row 8 after row 2 selected ${selected.size} row(s) — want 7, rows 2 through 8.`
      + ` This is the desktop behaviour the repair must not have touched; it is measured on both`
      + ` pages because a rule keyed to the pointer could plausibly have taken it away from one. ${where}`,
  });

  // ── the hold grammar, which only a finger can reach ──
  reset();
  await tap(boxes[2]);
  await holdDown(boxes[8], 520);
  const atHold = shown();
  const sizeAtHold = selected.size;
  const extendsAtHold = extendCount;
  const vibrationsAtHold = vibrations;
  release(boxes[8]);
  const afterRelease = shown();
  const wantHold = pointerType === "touch" ? spanOf(2, 8) : "note-2.md";
  out.push({
    name: pointerType === "touch"
      ? "a held press on a second row checkbox extends the selection to it"
      : "a held mouse press never extends, however the pane measures",
    pass: atHold === wantHold && extendsAtHold === (pointerType === "touch" ? 1 : 0)
      && vibrationsAtHold === (pointerType === "touch" ? 1 : 0)
      && (pointerType !== "mouse" || measuresTouch),
    detail: `holding row 8 for 520ms after tapping row 2 selected ${sizeAtHold} row(s)`
      + ` (${atHold}) and fired ${extendsAtHold} extension(s) and ${vibrationsAtHold} haptic(s)`
      + ` — want ${pointerType === "touch" ? "7 rows, 1 extension, 1 haptic" : "1 row, 0 extensions, 0 haptics"}.`
      + ` A mouse cannot reach this path at any width because \`attachLongPress\` admits only touch`
      + ` and pen, which is why the pane here is narrow enough to measure as touch. ${where}`,
  });

  // The release is a separate question from the hold, and it has opposite right answers. After a
  // completed hold the click has to be swallowed or the gesture undoes itself; after a press that
  // completed nothing — every slow mouse click there has ever been — it has to go through. A swallow
  // keyed to "a long press happened" rather than "a hold fired" would satisfy the first and break
  // the second, silently, on desktop.
  const wantRelease = pointerType === "touch" ? atHold : "note-2.md,note-8.md";
  out.push({
    name: pointerType === "touch"
      ? "the click a completed hold releases does not undo the range it painted"
      : "a slow mouse click still toggles, because no hold completed to swallow it",
    pass: afterRelease === wantRelease,
    detail: `lifting after a 520ms press left ${selected.size} row(s) selected (${afterRelease})`
      + ` — want ${wantRelease}. On touch that is the range the hold painted, unchanged: the release`
      + ` produces a click on an already-selected checkbox, and unswallowed it toggles the row`
      + ` straight back off. With a mouse no hold fired, so the same slow press must stay an ordinary`
      + ` click and select row 8. ${where}`,
  });

  // ── the threshold is a threshold, not a synonym for touch ──
  reset();
  await tap(boxes[2]);
  await holdDown(boxes[8], 300);
  const shortHold = shown();
  const shortExtends = extendCount;
  release(boxes[8]);
  const afterShort = shown();
  out.push({
    name: "a press released before the hold threshold selects one row, not a range",
    pass: shortHold === "note-2.md" && shortExtends === 0 && afterShort === "note-2.md,note-8.md",
    detail: `a 300ms press fired ${shortExtends} extension(s) against the shipped 450ms threshold,`
      + ` and released to ${selected.size} row(s): ${afterShort} — want 0 extensions and 2 rows.`
      + ` Without a real threshold "held" would just be another word for "touch", which is the`
      + ` defect this replaced. ${where}`,
  });

  // ── one gesture vocabulary: same threshold, same haptic, two targets, two answers ──
  reset();
  await holdDown(boxes[5], 520);
  const boxExtends = extendCount;
  const boxMenus = menuCount;
  const boxBuzz = vibrations;
  release(boxes[5]);
  reset();
  await holdDown(cells[5], 520);
  const bodyExtends = extendCount;
  const bodyMenus = menuCount;
  const bodyBuzz = vibrations;
  release(cells[5]);
  const wantMenu = pointerType === "touch" ? 1 : 0;
  const wantBox = pointerType === "touch" ? 1 : 0;
  out.push({
    name: "a hold on the checkbox and a hold on the row body are one gesture with two answers",
    pass: boxExtends === wantBox && boxMenus === 0 && boxBuzz === wantBox
      && bodyExtends === 0 && bodyMenus === wantMenu && bodyBuzz === wantMenu,
    detail: `on the checkbox: ${boxExtends} extension(s), ${boxMenus} row menu(s), ${boxBuzz} haptic(s).`
      + ` On the row body: ${bodyExtends} extension(s), ${bodyMenus} row menu(s), ${bodyBuzz} haptic(s).`
      + ` Want ${wantBox}/0/${wantBox} and 0/${wantMenu}/${wantMenu}. The row menu is the only way to`
      + ` reach several row actions on a phone, so it has to still answer; and the two holds share one`
      + ` implementation, so a single haptic each is what proves they are not two gestures at one`
      + ` threshold by coincidence. ${where}`,
  });

  return out;
};

const rowPhone = await browser.newPage({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
await rowPhone.setContent(page_html.replace("<body>", phoneBody));
await rowPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await rowPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await rowPhone.addScriptTag({ content: positionerJs });
const rowPhoneResults = await rowPhone.evaluate(rowRangeProbe, { pointerType: "touch" });
await rowPhone.close();

const rowNarrowPane = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
await rowNarrowPane.setContent(page_html);
await rowNarrowPane.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
// The split pane the predicate is wrong about: a desktop window, a mouse, and a leaf under 760px.
await rowNarrowPane.addStyleTag({ content: ".workspace-split.mod-root { flex: 0 0 700px; }" });
await rowNarrowPane.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await rowNarrowPane.addScriptTag({ content: positionerJs });
const rowNarrowResults = await rowNarrowPane.evaluate(rowRangeProbe, { pointerType: "mouse" });
await rowNarrowPane.close();

// ───────────────────────────────────────────────────────────────────
// 5g. EVERY CHECKBOX FAMILY, AT THE SIZE ITS ROLE DECLARES
// ───────────────────────────────────────────────────────────────────
//
// The class-agreement half of this lives in checkbox-family-coverage.test.ts, where the factory can
// be called directly. What a node test cannot see is what the browser then paints, and the defect
// this phase exists for was entirely a painted one: a control carrying every right class that still
// computes the platform box because no rule reached it.
//
// Measured across every fixture rather than a hand-picked list. A hand-picked list is a list of the
// families somebody remembered, which is how eleven of twelve came to be missed.

const familyPage = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
const familyResults = [];
{
  const sheets = [
    readFileSync(join(REPO, "styles.css"), "utf8"),
    readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8"),
    readFileSync(join(REPO, "tools/screenshots/runtime-vars.css"), "utf8"),
  ];
  const measured = [];
  for (const scenario of SCENARIOS) {
    if (typeof scenario.html !== "function") continue;
    let html;
    try {
      html = scenario.html();
    } catch {
      continue;
    }
    if (!html.includes('type="checkbox"')) continue;
    await familyPage.setContent(`<body><div id="shot">${html}</div></body>`);
    for (const sheet of sheets) await familyPage.addStyleTag({ content: sheet });
    // The base rule transitions background and border, and the reduced-motion block that stops
    // transitions is scoped to the plugin container — so a control mounted outside one is still
    // animating when the page settles. Read mid-flight it reports a transparent track and a
    // near-black border, which is neither the broken value nor the fixed one.
    await familyPage.waitForTimeout(250);
    measured.push(...await familyPage.evaluate((id) => {
      return [...document.querySelectorAll('input[type="checkbox"]')].map((el) => {
        const style = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        const classes = [...el.classList];
        return {
          scenario: id,
          family: classes.find((c) => c !== "db-checkbox" && !c.startsWith("db-checkbox-")) || "(role only)",
          role: classes.includes("db-checkbox-row") ? "row"
            : classes.includes("db-checkbox-field") ? "field"
              : classes.includes("db-toggle-switch") ? "switch" : "(none)",
          appearance: style.appearance || style.webkitAppearance || "",
          shape: `${Math.round(box.width)}x${Math.round(box.height)} r=${style.borderRadius}`,
        };
      });
    }, scenario.id));
  }

  const platform = measured.filter((m) => m.appearance !== "none");
  familyResults.push({
    name: "every checkbox the plugin renders computes the plugin's box, not the platform's",
    pass: measured.length > 0 && platform.length === 0,
    detail: `${measured.length - platform.length}/${measured.length} controls across `
      + `${new Set(measured.map((m) => m.family)).size} families compute appearance:none`
      + (platform.length ? ` — still platform: ${[...new Set(platform.map((m) => m.family))].join(", ")}` : "")
      + ". The report this phase answers was round boxes, and round is what the platform draws.",
  });

  // One role paints one box. Set cardinality rather than per-family equality, because a per-family
  // list can be quietly short and a set cannot.
  for (const role of ["row", "field", "switch"]) {
    const ofRole = measured.filter((m) => m.role === role);
    if (!ofRole.length) continue;
    const shapes = [...new Set(ofRole.map((m) => m.shape))];
    familyResults.push({
      name: `the ${role} role paints one box everywhere it appears`,
      pass: shapes.length === 1,
      detail: `${ofRole.length} controls across ${new Set(ofRole.map((m) => m.family)).size} families`
        + ` take ${shapes.length} distinct shape(s): ${shapes.join(" / ")}`,
    });
  }
}
await familyPage.close();

// ───────────────────────────────────────────────────────────────────
// 5h. WHAT A FINGER CAN ACTUALLY REACH
// ───────────────────────────────────────────────────────────────────
//
// This phase set a 28px floor for a control under a coarse pointer and never asserted it, so a
// control below the floor was found by looking rather than by a check.
//
// Reach is measured by stepping out from the centre and asking the document what is under the
// point, not by adding up pseudo-element insets. The arithmetic version got the switch wrong by
// 20px: its ::before is the knob, and a knob reads as an inset while being a child.
//
// A dedicated page rather than the fixtures, because a control clipped by a scroll container or
// pushed past a fixture's edge measures short for a reason that is not its target size, and that
// artifact is indistinguishable from the defect.

const TOUCH_FLOOR = 28;
const touchContext = await browser.newContext({
  viewport: { width: 480, height: 900 }, reducedMotion: "reduce", hasTouch: true, isMobile: true,
});
const touchPage = await touchContext.newPage();
await touchPage.setContent(`<body class="is-mobile is-phone"><div class="note-database-container" id="shot"
  style="display:flex;flex-direction:column;gap:40px;padding:40px">
  <div><input type="checkbox" class="db-checkbox db-checkbox-row" aria-label="row"></div>
  <div><input type="checkbox" class="db-checkbox db-checkbox-field" aria-label="field"></div>
  <div><input type="checkbox" role="switch" class="db-toggle-switch" aria-label="switch"></div>
</div></body>`);
for (const file of ["styles.css", "tools/screenshots/theme.css", "tools/screenshots/runtime-vars.css"]) {
  await touchPage.addStyleTag({ content: readFileSync(join(REPO, file), "utf8") });
}
await touchPage.waitForTimeout(250);
const touchResults = await touchPage.evaluate((floor) => {
  const reach = (el, dx, dy) => {
    const box = el.getBoundingClientRect();
    const cx = box.left + box.width / 2, cy = box.top + box.height / 2;
    let steps = 0;
    while (steps < 200 && document.elementFromPoint(cx + dx * (steps + 1), cy + dy * (steps + 1)) === el) steps++;
    return steps;
  };
  return [...document.querySelectorAll('input[type="checkbox"]')].map((el) => {
    const box = el.getBoundingClientRect();
    const width = reach(el, -1, 0) + reach(el, 1, 0) + 1;
    const height = reach(el, 0, -1) + reach(el, 0, 1) + 1;
    return {
      name: `the ${el.getAttribute("aria-label")} control gives a finger at least ${floor}px`,
      pass: width >= floor && height >= floor,
      detail: `painted ${Math.round(box.width)}x${Math.round(box.height)}, reachable ${width}x${height}`
        + ` (want >= ${floor} on both axes). Reach is a hit test, so an expanded pseudo-element`
        + " counts toward it and a decorative one does not.",
    };
  });
}, TOUCH_FLOOR);
await touchContext.close();

// ───────────────────────────────────────────────────────────────────
// 5i. THE REORDER BUTTON AND THE ROW CHECKBOX SHARE ONE CELL
// ───────────────────────────────────────────────────────────────────
//
// The select cell holds a reorder button and a selection checkbox. The stylesheet's own comment
// derives that column's width as "move button 24 + checkbox 16 + gap 8"; both controls have since
// grown to 28 to clear the touch floor and the column was never re-derived, so they overlap.
//
// Both devices, because the table builds this button only on touch. A desktop cell that shows one
// is a fixture rendering a control production never creates, and that is worth failing on too.

const overlapResults = [];
for (const device of [
  { id: "desktop", viewport: VIEWPORT, bodyClass: "", touch: false },
  { id: "phone", viewport: { width: 402, height: 874 }, bodyClass: "is-mobile is-phone", touch: true },
]) {
  const context = await browser.newContext({
    viewport: device.viewport, reducedMotion: "reduce", hasTouch: device.touch, isMobile: device.touch,
  });
  const page = await context.newPage();
  await page.setContent(`<body class="${device.bodyClass}"><div id="shot">${SCENARIOS.find((s) => s.id === "table-mobile").html()}</div></body>`);
  for (const file of ["styles.css", "tools/screenshots/theme.css", "tools/screenshots/runtime-vars.css"]) {
    await page.addStyleTag({ content: readFileSync(join(REPO, file), "utf8") });
  }
  await page.waitForTimeout(250);
  overlapResults.push(...await page.evaluate((id) => {
    const cells = [...document.querySelectorAll("td.db-select-col")]
      .filter((cell) => cell.querySelector('input[type="checkbox"]'));
    const shown = cells.filter((cell) => {
      const button = cell.querySelector(".db-table-mobile-move-btn");
      return button && getComputedStyle(button).display !== "none";
    });
    const gaps = shown.map((cell) => {
      const button = cell.querySelector(".db-table-mobile-move-btn").getBoundingClientRect();
      const checkbox = cell.querySelector('input[type="checkbox"]').getBoundingClientRect();
      return Math.round(checkbox.left - button.right);
    });
    const worst = gaps.length ? Math.min(...gaps) : null;
    const cellWidth = cells.length ? Math.round(cells[0].getBoundingClientRect().width) : 0;
    return [{
      name: `on ${id} the reorder button and the row checkbox do not overlap`,
      pass: worst === null || worst >= 0,
      detail: shown.length === 0
        ? `no reorder button is shown in ${cells.length} select cells, so nothing can collide`
          + " — the table creates this button only on touch"
        : `${shown.length} cells show both; narrowest gap ${worst}px in a ${cellWidth}px cell`
          + " (negative means the two controls are drawn on top of one another)",
    }];
  }, device.id));
  await context.close();
}

// ───────────────────────────────────────────────────────────────────
// 5j. A PROPERTY KEEPS ITS COLUMN ON EVERY CARD
// ───────────────────────────────────────────────────────────────────
//
// The renderer omits nothing now: a property with no value is still built and hidden, so its column
// is claimed by index rather than left to whichever siblings happened to survive. That was already
// true on the desktop, where the meta row is a grid and `grid-column` decides. It was not true on a
// phone, where the same element is a wrapping flex line that ignores `grid-column` entirely, and
// the phone is the surface the raggedness was reported on.
//
// Built the way capture.mjs builds a page, `--capture-max-width` included. Without it the plugin
// container sized itself to content and measured 948px inside a 402px viewport, and every phone
// number taken off that page described a width no phone has — including the first version of this
// measurement, which reported fourteen distinct positions where the truth was two.

const rhythmResults = [];
{
  const sheets = ["tools/screenshots/theme.css", "styles.css", "tools/screenshots/runtime-vars.css"]
    .map((file) => `<style>${readFileSync(join(REPO, file), "utf8")}</style>`).join("\n");
  const sparse = SCENARIOS.find((s) => s.id === "list-sparse-fields");
  for (const device of [
    { id: "desktop", viewport: VIEWPORT, bodyClass: "", touch: false },
    { id: "phone", viewport: { width: 402, height: 874 }, bodyClass: "is-mobile is-phone", touch: true },
  ]) {
    const context = await browser.newContext({
      viewport: device.viewport, reducedMotion: "reduce", hasTouch: device.touch, isMobile: device.touch,
    });
    const page = await context.newPage();
    await page.setContent(`<!doctype html><html class="theme-light" style="--capture-max-width: ${device.viewport.width}px">`
      + `<head><meta name="viewport" content="width=device-width, initial-scale=1">${sheets}</head>`
      + `<body class="${device.bodyClass}"><div id="shot">${sparse.html()}</div></body></html>`);
    await page.waitForTimeout(250);
    rhythmResults.push(...await page.evaluate((id) => {
      const metas = [...document.querySelectorAll(".db-list-row-meta")];
      const widths = [...new Set(metas.map((m) => Math.round(m.getBoundingClientRect().width)))];
      const byProperty = new Map();
      for (const meta of metas) {
        const origin = meta.getBoundingClientRect().left;
        for (const field of meta.querySelectorAll(".db-list-field")) {
          const label = (field.querySelector(".db-list-field-label")?.textContent || "?").trim();
          if (!byProperty.has(label)) byProperty.set(label, new Set());
          byProperty.get(label).add(Math.round(field.getBoundingClientRect().left - origin));
        }
      }
      const spread = [...byProperty].map(([label, xs]) => [label, xs.size]);
      const worst = Math.max(...spread.map(([, n]) => n));
      return [
        {
          name: `on ${id} every list card's field area is the same width`,
          pass: metas.length > 0 && widths.length === 1,
          detail: `${metas.length} cards, each missing a different subset of its properties, take`
            + ` ${widths.length} distinct meta width(s): ${widths.join("/")}px`
            + " — cards of different widths is what ragged looks like before the columns are even read",
        },
        {
          name: `on ${id} a property starts in the same column on every card`,
          pass: metas.length > 0 && worst === 1,
          detail: `${spread.length} properties across ${metas.length} cards; worst lands in ${worst}`
            + ` column(s) [${spread.map(([l, n]) => `${l}:${n}`).join(" ")}]`
            + ". Drop the hidden placeholder and the survivors shuffle up one slot each.",
        },
      ];
    }, device.id));
    await context.close();
  }
}

results.push(...phoneResults, ...menuResults, ...addViewDesktopResults, ...addViewPhoneResults, ...desktopMenuResults, ...cellResults, ...sheetResults, ...selectCellResults, ...rowPhoneResults, ...rowNarrowResults,
  ...familyResults, ...touchResults, ...overlapResults, ...rhythmResults);

await browser.close();
rmSync(work, { recursive: true, force: true });

// ───────────────────────────────────────────────────────────────────
// 6. REPORT
// ───────────────────────────────────────────────────────────────────

/**
 * Defects this harness measures and the code does not yet fix.
 *
 * A check that would block the gate gets deleted or weakened by whoever is trying to ship; a defect
 * with no check gets forgotten. Naming it keeps the number in front of everyone, and the moment the
 * fix lands the entry has to go or the run reports an unexpected pass.
 */
const KNOWN = new Map([
  [
    "a popover inside a paint-contained widget is not clipped by it",
    "Live Preview renders an embedded database as a CM6 widget, and Obsidian gives every such widget "
      + "`contain: paint !important`. Placement is correct; the surface is cut off at the widget's own "
      + "edge, which no coordinate can fix. The remedy is the body portal the mobile sheet already uses.",
  ],
]);

const failed = results.filter((r) => !r.pass);
const unexpectedFail = failed.filter((r) => !KNOWN.has(r.name));
const unexpectedPass = results.filter((r) => r.pass && KNOWN.has(r.name));
for (const r of results) {
  const known = KNOWN.has(r.name);
  const label = r.pass ? (known ? "GREEN (unexpected)" : "PASS") : (known ? "RED (declared)" : "FAIL");
  console.log(`  ${label}  ${r.name}\n        ${r.detail}`);
  if (known && !r.pass) console.log(`        why it stands: ${KNOWN.get(r.name)}`);
}
console.log(`\nverify-placement: ${results.length - failed.length}/${results.length} geometry checks passed`
  + (failed.length ? `, ${failed.length - unexpectedFail.length} red for a declared reason` : ""));
for (const r of unexpectedPass) {
  console.log(`  a declared defect now passes — remove it from KNOWN: ${r.name}`);
}
process.exit(unexpectedFail.length || unexpectedPass.length ? 1 : 0);
