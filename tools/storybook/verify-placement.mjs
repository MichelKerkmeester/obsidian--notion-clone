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
// 2b. WHAT THE HOST DECLARES ON A BARE CONTROL
// ───────────────────────────────────────────────────────────────────
//
// Copied verbatim out of Obsidian's own app.css, the same way the leaf's `contain: strict` is
// reproduced in the page below: a harness that omits what the app declares certifies a rendering
// nobody ships.
//
// This one rule is the reason a shared menu row could be measured as correctly aligned here and
// arrive centred on a phone. A row is a `<button>`, and the plugin's row rule outranks this type
// selector on every property BOTH of them name — but `justify-content` was named by only one, so
// the host's `center` applied uncontested and nothing in a plugin-only page could show it. The
// defect was invisible not because the check was weak but because the document it ran against was
// missing a declaration the device has.
//
// It is loaded on every page rather than only the ones being investigated. A property the plugin
// leaves unstated is not a phone problem or a menu problem; it is a gap anywhere a host rule
// reaches, and the whole point is that the gap is silent until something models it.
const HOST_BARE_CONTROLS = `
/* The variable the rule below has always read and never had.
 *
 * This block was transcribed from the host's own button rule, including its
 * height declaration — but not the token that declaration resolves through, so
 * every button here measured content height while a real one measures a fixed
 * 30. A rule modelled without its variable is worse than a rule left out: it
 * looks like the host is represented and it answers every question with auto.
 * Read from the installed app stylesheet rather than recalled, which is the
 * only reason it is a number and not an estimate. */
:root { --input-height: 30px; }
button {
  --text-color: var(--text-normal);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  font-size: var(--font-ui-small);
  border-radius: var(--button-radius);
  border: 0;
  padding: var(--size-4-1) var(--size-4-3);
  height: var(--input-height);
  font-weight: var(--input-font-weight);
  cursor: var(--cursor);
  font-family: inherit;
  outline: none;
  user-select: none;
  white-space: nowrap;
}`;

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
import { positionToolbarPopover, getVisiblePopoverBounds, COMPACT_MENU_POPOVER, setPosition, clamp, resolvePopoverHorizontalLeft, PANEL_POPOVER, placeSheet, publishKeyboardInset, calendarSearchResultsPlacement, anchorlessSubmenuPlacement, resolveKeyboardInset, MAX_UNZOOMED_SCALE } from "${join(REPO, "src/views/popover-position")}";
import { shouldFlickDismiss, FLICK_PX_PER_MS, FLICK_MIN_PX, STALE_SAMPLE_MS } from "${join(REPO, "src/views/mobile-bottom-sheet")}";
import { refreshRecordDetailPanel, closeRecordDetailPanel, getOpenRecordDetailPath } from "${join(REPO, "src/views/record-detail-panel")}";
import { attachSheetDragToDismiss, hasSheetDrag } from "${join(REPO, "src/views/mobile-bottom-sheet")}";
import { applySheetChrome } from "${join(REPO, "src/views/mobile-bottom-sheet")}";
import { createOwnedMenu } from "${join(REPO, "src/views/owned-menu")}";
import { createMenuRow } from "${join(REPO, "src/views/menu-row")}";
import { renderCardField } from "${join(REPO, "src/views/card-field-renderer")}";
import { ToolbarRenderer } from "${join(REPO, "src/views/toolbar-renderer")}";
import { trackCellGesture, nextCellRange, resolveCellTapAction, isMainItemColumn, shouldExtendRowRange, applyRowSelectionPress, attachRowRangeGesture, isRowSelectionCheckbox } from "${join(REPO, "src/views/table-cell-gesture")}";
import { attachLongPress, isTouchDevice } from "${join(REPO, "src/data/touch-environment")}";
import { attachTitleOpenAffordance, setupTitleCellTap, openTableRecordPeek, closeTableRecordPeek } from "${join(REPO, "src/views/table-record-peek")}";
import { openDropdownMenu } from "${join(REPO, "src/views/dropdown-field")}";
import { ColumnManagerRenderer } from "${join(REPO, "src/views/column-manager-renderer")}";
import { FilterPanelRenderer } from "${join(REPO, "src/views/filter-panel-renderer")}";
import { SortPanelRenderer } from "${join(REPO, "src/views/sort-panel-renderer")}";
import { renderDateValuePicker, closeActiveDateValuePicker } from "${join(REPO, "src/views/date-value-picker")}";
import { SURFACE_REGISTRY } from "${join(REPO, "src/views/surface-contract")}";
import { TableRenderer } from "${join(REPO, "src/views/table-renderer")}";
import { openRecordDetailPanel } from "${join(REPO, "src/views/record-detail-panel")}";
import { mountNoteBodyRegion } from "${join(REPO, "src/views/note-body-region")}";
import { RowMenu } from "${join(REPO, "src/views/row-menu")}";
import { ColumnMenu } from "${join(REPO, "src/views/column-menu")}";
import { CellRenderer } from "${join(REPO, "src/views/cell-renderer")}";
import { DatabaseView } from "${join(REPO, "src/views/database-view")}";
import { EmbeddedDatabaseRenderer } from "${join(REPO, "src/views/embedded-database-renderer")}";
import { getColumnDisplayType, isEmptyValue } from "${join(REPO, "src/data/column-display")}";
import { openColumnWidthAdjuster } from "${join(REPO, "src/views/column-width")}";
import { formatEuroCurrency, formatEuroNumber } from "${join(REPO, "src/data/euro-format")}";
globalThis.__edit = { openRecordDetailPanel, closeRecordDetailPanel, CellRenderer };
globalThis.__tall = { openRecordDetailPanel, closeRecordDetailPanel, mountNoteBodyRegion };
globalThis.__dock = { DatabaseView, closeRecordDetailPanel, CellRenderer };
globalThis.__viewrow = { ToolbarRenderer };
globalThis.__number = { renderCardField, CellRenderer, getColumnDisplayType, isEmptyValue, formatEuroCurrency, formatEuroNumber };
globalThis.__selection = { DatabaseView, EmbeddedDatabaseRenderer };
globalThis.__opentarget = { DatabaseView, openTableRecordPeek, closeTableRecordPeek, closeRecordDetailPanel };
globalThis.__place = { positionToolbarPopover, getVisiblePopoverBounds, COMPACT_MENU_POPOVER, applySheetChrome, renderCardField, createOwnedMenu, createMenuRow, ToolbarRenderer, trackCellGesture, nextCellRange, resolveCellTapAction, isMainItemColumn, shouldExtendRowRange, applyRowSelectionPress, attachRowRangeGesture, isRowSelectionCheckbox, attachLongPress, isTouchDevice, attachTitleOpenAffordance, setupTitleCellTap, openRecordDetailPanel, closeRecordDetailPanel, getOpenRecordDetailPath, refreshRecordDetailPanel, RowMenu, ColumnMenu };
globalThis.__p = { positionToolbarPopover, getVisiblePopoverBounds, setPosition, clamp, resolvePopoverHorizontalLeft, COMPACT_MENU_POPOVER, PANEL_POPOVER, createOwnedMenu, createMenuRow, publishKeyboardInset, calendarSearchResultsPlacement, anchorlessSubmenuPlacement, resolveKeyboardInset, MAX_UNZOOMED_SCALE };
globalThis.__drag = { openRecordDetailPanel, refreshRecordDetailPanel, applySheetChrome, positionToolbarPopover };
globalThis.__a = { positionToolbarPopover, placeSheet, applySheetChrome, attachSheetDragToDismiss, hasSheetDrag, openRecordDetailPanel, refreshRecordDetailPanel, closeRecordDetailPanel, createOwnedMenu, createMenuRow };
globalThis.__flick = { shouldFlickDismiss, FLICK_PX_PER_MS, FLICK_MIN_PX, STALE_SAMPLE_MS };
globalThis.__layer = { openTableRecordPeek, closeTableRecordPeek, openDropdownMenu };
globalThis.__columns = { ColumnManagerRenderer };
globalThis.__panels = { FilterPanelRenderer, SortPanelRenderer };
globalThis.__registry = { SURFACE_REGISTRY, renderDateValuePicker, closeActiveDateValuePicker };
globalThis.__table = { TableRenderer };
globalThis.__columnWidth = { openColumnWidthAdjuster };
`);

execFileSync(join(REPO, "node_modules/.bin/esbuild"), [
  entry, "--bundle", "--format=iife", `--outfile=${bundle}`,
  `--alias:obsidian=${join(REPO, "tools/storybook/obsidian-stub.mjs")}`,
], { stdio: "pipe" });

const positionerJs = readFileSync(bundle, "utf8")
  // ── A DRAG WITH TIMING IT CHOSE, APPENDED TO EVERY PAGE ─────────────
  //
  // `PointerEvent.timeStamp` is stamped by the browser at dispatch, and two dispatches in one tick
  // are 0.0999ms apart — measured, not assumed. The shipped gesture divides by that interval, so a
  // 30px synthetic move computes 300 px/ms against a 0.8 px/ms flick threshold. EVERY hand-made
  // drag in this file has been reading as an infinitely fast flick.
  //
  // Nothing went red for it, which is the problem: a drag that dismisses because the distance
  // threshold was passed and a drag that dismisses because it was mistaken for a flick look
  // identical from outside, so the checks kept their stated cause while the real one had changed.
  // A sibling lane learned this the expensive way — two lanes went red on a commit touching
  // neither the gesture nor its constants, because machine load moved a number the harness was
  // producing rather than measuring.
  //
  // `timeStamp` is writable per instance, so the clock becomes the check's to choose. Speed is
  // then an input rather than an accident, and a check can say which path it is exercising.
  + `
globalThis.__timedDrag = (opts) => {
  const { target, panel, x, from, to, steps = 6, msPerStep = 16, restMs = 0, pointerId = 7,
    onStep } = opts;
  let clock = 1000;
  const send = (type, node, y) => {
    const event = new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId, isPrimary: true, pointerType: "touch", button: 0,
      clientX: Math.round(x), clientY: Math.round(y),
    });
    Object.defineProperty(event, "timeStamp", { value: clock, configurable: true });
    node.dispatchEvent(event);
  };
  send("pointerdown", target, from);
  for (let i = 1; i <= steps; i += 1) {
    clock += msPerStep;
    send("pointermove", panel, from + ((to - from) * i) / steps);
    // A caller that needs to see the surface mid-gesture gets it here. Reading after the release
    // reads a dismissed sheet, which is how the follow-the-thumb half of a check goes quiet.
    if (onStep) onStep(i, steps);
  }
  // A finger that rests before it lifts is not flicking, however fast it arrived. The gesture
  // reads that as the interval between the last move and the release, so the rest is time and
  // not another move.
  clock += restMs;
  send("pointerup", panel, to);
  return { pxPerMs: Math.abs(to - from) / steps / msPerStep, restMs };
};
`;
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
// 4b. A SECTION THAT THROWS IS A RED CHECK, NOT A DEAD RUN
// ───────────────────────────────────────────────────────────────────
//
// Every section measured into its own array and the arrays were spread into one list at the very
// end, so nothing was reported until everything had run. One throw anywhere therefore printed none
// of the two hundred checks that had already been measured — the run died with a stack trace and
// said nothing about the surface it had just finished measuring.
//
// That is strictly worse than a red. A red names the property that broke; an empty run looks like a
// broken harness and leaves whoever reads it unable to tell a product defect from a typo. It also
// scales the wrong way: the sections that drive shipped renderers are the ones that can throw for
// the same reasons production does, and those are the sections this harness is gaining.
//
// So each section runs inside this. A throw becomes one red check carrying the error, the run
// continues into the next section, and the red is not in KNOWN, so it still fails the run. The
// section's own checks are lost — they were never measured — and the red says so rather than
// letting the total quietly shrink.
//
// `PLACEMENT_SECTION_CONTROL=<substring>` arms the control: the first section whose label contains
// the substring throws after its checks were measured, which is the worst case this has to survive.
// A control that stops producing exactly one red and a complete run means the isolation is gone.
const sectionFailures = [];
const SECTION_CONTROL = process.env.PLACEMENT_SECTION_CONTROL || "";

const section = async (label, run, fallback = []) => {
  try {
    const value = await run();
    if (SECTION_CONTROL && label.includes(SECTION_CONTROL)) {
      throw new Error(`PLACEMENT_SECTION_CONTROL is armed for "${label}"`);
    }
    return value;
  } catch (error) {
    const trace = error && error.stack ? String(error.stack) : String(error);
    sectionFailures.push({
      name: `the "${label}" section reports its own checks`,
      pass: false,
      detail: `it threw, so none of its checks were measured and the count below is short by that `
        + `section's worth: ${trace.split("\n").slice(0, 4).map((line) => line.trim()).join(" | ")}`,
    });
    return fallback;
  }
};

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
await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await page.addScriptTag({ content: positionerJs });

// No arguments: every number below is measured off the rendered page. Passing the sidebar width in
// as a constant would let a check agree with the harness's own idea of the layout rather than with
// what the browser actually laid out.
const results = await section("desktop workspace geometry", () => page.evaluate(() => {
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

  // 0. What the SHIPPED call returns, with the argument the shipped call passes.
  //
  // `column-menu.ts` calls `getVisiblePopoverBounds(panel)`. Every check that clamps a submenu here
  // passed `null` instead, because the real caller is private and needs a live App — and `null`
  // yields the editing area, so those checks read green over the argument that decides the answer.
  //
  // A body-portalled fixed panel that has not laid out yet reports a zero rect. Intersecting that
  // with the editing area gives `right <= left`, which trips the degenerate guard and returns the
  // WHOLE VIEWPORT — the exact bound the clamp exists to remove. A submenu placed against it slides
  // under an open right sidebar.
  //
  // Both arguments are measured in one case. `null` alone cannot fail this way, so on its own it
  // would be evidence about the wrong call.
  {
    const fresh = document.body.createDiv({ cls: "db-anchored-popover" });
    fresh.setCssProps({ position: "fixed", width: "292px" });
    const withNull = getVisiblePopoverBounds(null);
    const withPanel = getVisiblePopoverBounds(fresh);
    fresh.remove();
    const viewportWidth = window.innerWidth;
    out.push({
      name: "AC-4 bounds for an unlaid-out panel are the editing area, not the viewport",
      pass: Math.round(withPanel.right) === Math.round(withNull.right)
        && Math.round(withPanel.right) < viewportWidth,
      detail: `getVisiblePopoverBounds(panel).right=${Math.round(withPanel.right)}`
        + ` against (null).right=${Math.round(withNull.right)} and viewport ${viewportWidth}`
        + " — a fresh fixed panel has a zero rect, and intersecting it collapses the range into the"
        + " degenerate guard, which hands back the whole viewport and lets a submenu sit under the sidebar",
    });
  }

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
}));

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
// The navbar as the host actually declares it, not as this file used to guess it.
//
// It was a hand-written div at `height:72px; z-index:100`. Both numbers were inventions. The
// installed application stylesheet gives `.mobile-navbar` `position: var(--navbar-position)` which
// is `fixed`, `height: var(--navbar-height)` which is **80px**, full width — and **no z-index at
// all**. That last one is the whole of the difference: an invented stacking context made the navbar
// win a hit test it does not win on a device, and every check reading through it inherited the
// invention. Declared as tokens rather than literals so the rule and its values arrive together.
const NAVBAR_TOKENS = '--navbar-position: fixed; --navbar-height: 80px; --navbar-width: 100%;'
  + ' --navbar-max-width: 100%; --navbar-radius: 0;'
  + ' --navbar-bottom-offset: max(var(--safe-area-inset-bottom), 12px);';
const NAVBAR_RULE = `.mobile-navbar {
  background-color: var(--background-primary, #222);
  position: var(--navbar-position);
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: var(--navbar-width);
  max-width: var(--navbar-max-width);
  height: var(--navbar-height);
  padding: 0 8px var(--navbar-bottom-offset);
  border-radius: var(--navbar-radius);
  display: flex;
}`;
const phoneBody = '<body class="is-phone" style="--safe-area-inset-bottom: 34px;'
  + '--background-modifier-border: #333333;' + NAVBAR_TOKENS + '">'
  // The rule travels with the markup rather than as a separate stylesheet call. Fifteen pages build
  // themselves from this string, and a rule added per page is a rule fourteen of them can miss —
  // which is exactly what happened: the navbar carried its class, no page but one gave it a height,
  // and the check that reads it measured 0px while still reporting a number.
  + '<style>' + NAVBAR_RULE + '</style>'
  + '<div class="mobile-navbar"></div>';
await phone.setContent(page_html.replace("<body>", phoneBody));
await phone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await phone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await phone.addScriptTag({ content: positionerJs });

const phoneResults = await section("the phone sheet and its selection bar", () => phone.evaluate(async (control) => {
  const out = [];
  const { applySheetChrome, positionToolbarPopover, getVisiblePopoverBounds } = globalThis.__place;
  const { DatabaseView, EmbeddedDatabaseRenderer } = globalThis.__selection;

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
    // Bound to --db-font-base rather than --db-font-md since the label moved onto the base step.
    // The property asserted is unchanged and just as able to fail: the label must equal a token
    // rather than a literal, the value must equal its own token, and the label must not outgrow
    // the value. Only which token the label is expected to read has moved with the label.
    pass: labelPx === tokenPx("--db-font-base") && valuePx === tokenPx("--db-font-lg") && labelPx <= valuePx,
    detail: `label=${labelPx}px (--db-font-base=${tokenPx("--db-font-base")}) `
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

  // Render both bars through the shipped view methods. The embed must keep its own presentation
  // because it has no viewport-level keyboard to clear and its host note owns the scroll context.
  const selectedAddresses = [
    { rowPath: "record.md", colKey: "amount" },
    { rowPath: "record.md", colKey: "name" },
  ];
  // `Object.create` gives a real view without the constructor, which wants an Obsidian leaf this
  // page has no way to supply. The cost is that class field initialisers never run: every field the
  // driven method reads is `undefined` unless it is written here, and a field the method only reads
  // — never assigns — fails with nothing pointing at the missing state. `historyStack` is one of
  // those. It decides whether the bar carries an undo action, and a fresh view starts it empty, so
  // that is what a view drawn at rest holds and what is supplied here.
  const renderStandaloneSelection = () => {
    const host = document.body.createDiv({ cls: "note-database-container" });
    const view = Object.create(DatabaseView.prototype);
    view.containerEl_ = host;
    view.selectedRows = new Set();
    view.cellSelection = { anchor: selectedAddresses[0], focus: selectedAddresses[1] };
    view.selectionStatusBar = undefined;
    view.pendingCellFillDraft = null;
    view.showCellFillInput = false;
    view.historyStack = [];
    view.getSelectedCellAddresses = () => selectedAddresses;
    view.getConfig = () => ({ schema: { columns: [] } });
    DatabaseView.prototype.renderSelectionStatusBar.call(view);
    return { host, view, bar: host.querySelector(".db-selection-status-bar") };
  };
  const renderEmbeddedSelection = () => {
    const host = document.body.createDiv({ cls: "note-database-embed note-database-container" });
    const renderer = Object.create(EmbeddedDatabaseRenderer.prototype);
    renderer.containerEl = host;
    renderer.config = { viewType: "table" };
    renderer.cellSelection = { anchor: selectedAddresses[0], focus: selectedAddresses[1] };
    renderer.getSelectedEmbedCellAddresses = () => selectedAddresses;
    EmbeddedDatabaseRenderer.prototype.renderEmbedSelectionStatusBar.call(renderer);
    return { host, bar: host.querySelector(".db-selection-status-bar") };
  };
  // The bar's own checks need a page with nothing else docked at the bottom.
  //
  // Every sheet on this page is a measuring fixture, but a sheet is a sheet: mounting one takes the
  // bottom edge, and the bar now yields it — correctly, and that is asserted on its own page in
  // "one thing owns the phone's bottom edge". Here it would mean the checks below measured a 0x0
  // rectangle and reported the bar as failing the thumb floor and the keyboard clearance, which is a
  // fixture artefact wearing the costume of a product defect.
  const releaseDock = () => document.body.removeClass("db-bottom-dock-taken");
  releaseDock();
  const standaloneSelection = renderStandaloneSelection();
  const embeddedSelection = renderEmbeddedSelection();
  const selectionBar = standaloneSelection.bar;
  const embeddedBar = embeddedSelection.bar;
  const selectionFloor = selectionBar.getBoundingClientRect().bottom;
  const selectionContentHeight = selectionBar.scrollHeight;
  const selectionContentBoxHeight = selectionBar.clientHeight;
  const embeddedFloor = embeddedBar.getBoundingClientRect().bottom;
  const selectionBarRect = selectionBar.getBoundingClientRect();
  const selectionBarClientRight = selectionBarRect.left + selectionBar.clientLeft + selectionBar.clientWidth;
  const selectionActions = [...selectionBar.querySelectorAll(
    ".db-selection-action, .db-selection-clear-pill, .db-selection-delete",
  )];
  const selectionActionRights = selectionActions.map((el) => el.getBoundingClientRect().right);
  const maxSelectionActionRight = Math.max(...selectionActionRights);

  out.push({
    name: "selection bar content fits inside its border box",
    pass: selectionContentHeight <= selectionContentBoxHeight + 1,
    detail: `content=${selectionContentHeight}px box=${selectionContentBoxHeight}px `
      + `(the measured pre-fix pair was 36px inside 28px)`,
  });
  out.push({
    name: "selection bar actions stay inside the phone bar after wrapping",
    pass: selectionActions.length > 0
      && maxSelectionActionRight <= selectionBarClientRight + 1
      && selectionContentHeight <= selectionContentBoxHeight + 1,
    detail: `actions=${selectionActions.length} maxActionRight=${maxSelectionActionRight.toFixed(1)}px `
      + `clientRight=${selectionBarClientRight.toFixed(1)}px content=${selectionContentHeight}px `
      + `box=${selectionContentBoxHeight}px (superseded decision: horizontal scroll lane when actions exceed phone width)`,
  });
  const minSelectionActionHeight = Math.min(...selectionActions.map((el) => el.getBoundingClientRect().height));
  out.push({
    name: "selection bar action targets reach the phone thumb floor",
    pass: minSelectionActionHeight >= 44,
    detail: `min action height=${minSelectionActionHeight.toFixed(0)}px (want >=44px)`,
  });
  out.push({
    name: "embedded selection bar keeps its viewport-floor presentation",
    pass: Math.abs(embeddedFloor - selectionFloor) <= 1,
    detail: `standalone bottom=${selectionFloor.toFixed(0)}px embedded bottom=${embeddedFloor.toFixed(0)}px`,
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
  // Releases the dock on the way out. Every settle here follows a resize, a resize re-places the
  // sheet fixtures on this page, and re-placing a sheet re-takes the bottom edge. Doing it in the
  // helper rather than at each call site is what stops the next reader adding one that measures a
  // hidden bar.
  const settle = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => {
    releaseDock();
    resolve();
  })));

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
  if (control.breakDock) selectionBar.style.bottom = "0px";
  const liftedSelectionBox = selectionBar.getBoundingClientRect();
  const liftedEmbeddedBox = embeddedBar.getBoundingClientRect();
  const keyboardBarBottom = window.innerHeight - KEYBOARD;
  out.push({
    name: "selection bar clears the keyboard the host reports",
    pass: Math.abs(liftedSelectionBox.bottom - keyboardBarBottom) <= 2,
    detail: `bar bottom=${liftedSelectionBox.bottom.toFixed(0)} want=${keyboardBarBottom}px `
      + `(keyboard covers ${keyboardBarBottom}..${window.innerHeight}); `
      + `(harness-supplied --keyboard-height=${KEYBOARD}px; a device where the host publishes nothing `
      + `is covered by "the selection bar clears a keyboard no host reported")`,
  });
  out.push({
    name: "selection bar keeps its box fully visible above the keyboard",
    pass: liftedSelectionBox.top >= -1 && liftedSelectionBox.bottom <= keyboardBarBottom + 1,
    detail: `bar ${liftedSelectionBox.top.toFixed(0)}-${liftedSelectionBox.bottom.toFixed(0)}px `
      + `available floor=${keyboardBarBottom}px`,
  });
  out.push({
    name: "embedded selection bar does not inherit standalone keyboard docking",
    pass: Math.abs(liftedEmbeddedBox.bottom - embeddedFloor) <= 1,
    detail: `embedded before=${embeddedFloor.toFixed(0)}px after=${liftedEmbeddedBox.bottom.toFixed(0)}px`,
  });
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
  selectionBar.style.bottom = "";
  window.dispatchEvent(new window.Event("resize"));
  await settle();
  const closedSelectionBox = selectionBar.getBoundingClientRect();
  out.push({
    name: "selection bar returns to its safe floor when the keyboard closes",
    pass: Math.abs(closedSelectionBox.bottom - selectionFloor) <= 1,
    detail: `closed bottom=${closedSelectionBox.bottom.toFixed(0)}px resting bottom=${selectionFloor.toFixed(0)}px`,
  });
  const closedBox = rhythmPanel.getBoundingClientRect();
  out.push({
    name: "the sheet returns to the floor when the keyboard closes",
    pass: Math.abs(closedBox.bottom - window.innerHeight) <= 1,
    detail: `bottom=${closedBox.bottom.toFixed(0)} viewport=${window.innerHeight}`,
  });

  // ── the same keyboard, with the host silent ──
  //
  // Everything above drives the host's REPORT of a keyboard. This block drives the DEVICE, and the
  // difference between the two is the reason it exists.
  //
  // Writing `--keyboard-height` does the host's job for it. It presupposes the one thing actually
  // in question — that Obsidian published a number this surface can read — so a check built that
  // way can only ever confirm arithmetic. Shrinking `visualViewport.height` grants no such favour:
  // a phone shrinks that viewport itself when the software keyboard opens, on every host, whether
  // or not anything is published. The override below therefore models the platform, and the
  // variable stays absent on purpose.
  //
  // It also covers a real gap rather than a hypothetical one. Both blocks above set the variable
  // and then dispatched a synthetic resize while the viewport stayed at full height, so the
  // observed term inside the positioner's inset computed zero in every run ever captured and only
  // the host term was ever exercised. The branch that is supposed to protect these surfaces on a
  // host that publishes nothing had never once run.
  //
  // `height` is an accessor on VisualViewport.prototype, so an own property on the instance shadows
  // it for the duration and `delete` hands the real getter back.
  const restingVisualHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const shrinkVisualViewport = (covered) => {
    Object.defineProperty(window.visualViewport, "height", {
      configurable: true,
      get: () => restingVisualHeight - covered,
    });
  };
  const restoreVisualViewport = () => { delete window.visualViewport.height; };

  out.push({
    name: "the visual viewport rests at the window height before it is shrunk",
    pass: Boolean(window.visualViewport) && Math.abs(restingVisualHeight - window.innerHeight) <= 1,
    detail: `visualViewport.height=${restingVisualHeight} innerHeight=${window.innerHeight}; `
      + `a gap here means the shrink below is measured from the wrong resting height and every `
      + `number in this block is off by it`,
  });

  // `SELECTION_BAR_CONTROL=revert` puts the bar back on the host variable alone — the declaration
  // that shipped and that the operator watched float over an open keyboard. The fallback check below
  // must go red under it. If it stays green, the check is not testing the docking rule and should be
  // deleted rather than believed. Written inline on the one element under test, which is the same
  // declaration the stylesheet used to carry and reaches only this bar.
  if (control.revertDock) {
    selectionBar.style.setProperty(
      "bottom",
      "max(16px, env(safe-area-inset-bottom), var(--keyboard-height, 0px))",
      "important",
    );
  }
  shrinkVisualViewport(KEYBOARD);
  window.visualViewport.dispatchEvent(new window.Event("resize"));
  await settle();
  const silentVar = getComputedStyle(document.documentElement)
    .getPropertyValue("--keyboard-height").trim();
  const fallbackFloor = window.innerHeight - KEYBOARD;
  const fallbackSheetBox = rhythmPanel.getBoundingClientRect();
  const fallbackSelectionBox = selectionBar.getBoundingClientRect();
  const fallbackEmbeddedBox = embeddedBar.getBoundingClientRect();

  out.push({
    name: "no host variable is in play while the fallback is measured",
    pass: silentVar === "" || parseFloat(silentVar) === 0,
    detail: `--keyboard-height reads "${silentVar || "(unset)"}"; anything else means this block is `
      + `driving the host path again under a different name and proves nothing new`,
  });
  out.push({
    name: "the sheet clears a keyboard no host reported",
    pass: Math.abs(fallbackSheetBox.bottom - fallbackFloor) <= 2,
    detail: `sheet bottom=${fallbackSheetBox.bottom.toFixed(0)} want=${fallbackFloor} `
      + `(window ${window.innerHeight}, visual viewport shrunk to ${window.visualViewport.height}); `
      + `lever var=${rhythmPanel.style.getPropertyValue("--db-mobile-sheet-bottom") || "(unset)"}`,
  });
  out.push({
    name: "the selection bar clears a keyboard no host reported",
    pass: Math.abs(fallbackSelectionBox.bottom - fallbackFloor) <= 2,
    detail: `bar bottom=${fallbackSelectionBox.bottom.toFixed(0)} want=${fallbackFloor} `
      + `(window ${window.innerHeight}, visual viewport shrunk to ${window.visualViewport.height}); `
      + `bar reads ${getComputedStyle(selectionBar).bottom} from the bottom`,
  });
  out.push({
    name: "the embedded selection bar stays put when only the visual viewport moves",
    pass: Math.abs(fallbackEmbeddedBox.bottom - embeddedFloor) <= 1,
    detail: `embedded before=${embeddedFloor.toFixed(0)}px after=${fallbackEmbeddedBox.bottom.toFixed(0)}px `
      + `(an embedded database is not the phone's bottom surface and must not dock to a keyboard)`,
  });

  if (control.revertDock) selectionBar.style.removeProperty("bottom");
  restoreVisualViewport();
  window.visualViewport.dispatchEvent(new window.Event("resize"));
  await settle();
  const settledSheetBox = rhythmPanel.getBoundingClientRect();
  const settledSelectionBox = selectionBar.getBoundingClientRect();
  out.push({
    name: "the sheet returns to the floor when the visual viewport comes back",
    pass: Math.abs(settledSheetBox.bottom - window.innerHeight) <= 1,
    detail: `bottom=${settledSheetBox.bottom.toFixed(0)} viewport=${window.innerHeight}`,
  });
  out.push({
    name: "the selection bar returns to its safe floor when the visual viewport comes back",
    pass: Math.abs(settledSelectionBox.bottom - selectionFloor) <= 1,
    detail: `closed bottom=${settledSelectionBox.bottom.toFixed(0)}px resting bottom=${selectionFloor.toFixed(0)}px`,
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
  //
  // THIS USED TO BE A CHECK THAT COULD NOT FAIL. It read
  // `window.visualViewport.scale <= 1.01 && zoomed <= 1` off the harness's own untouched viewport,
  // where `scale` is always 1 and the visual height always equals `innerHeight` — `1 <= 1.01 &&
  // 0 <= 1`, two constants, true on every run for ever. It never called the positioner, and its own
  // comment conceded that a viewport cannot be pinched from script. It measured the harness's
  // viewport identity and reported it as the guard.
  //
  // A viewport still cannot be pinched from script, so the answer is not a better browser trick: the
  // decision is three numbers in and one out, and it is now called as one. Same shrink, two scales.
  const restingScale = window.visualViewport.scale;
  const covered = 336;
  const { resolveKeyboardInset } = globalThis.__p;
  const atRest = resolveKeyboardInset(0, window.innerHeight, {
    height: window.innerHeight - covered, offsetTop: 0, scale: 1,
  });
  const whileZoomed = resolveKeyboardInset(0, window.innerHeight, {
    height: window.innerHeight - covered, offsetTop: 0, scale: 2,
  });
  const hostStillHeard = resolveKeyboardInset(covered, window.innerHeight, {
    height: window.innerHeight - covered, offsetTop: 0, scale: 2,
  });
  out.push({
    name: "the visual-viewport fallback is guarded against pinch-zoom",
    pass: atRest === covered && whileZoomed === 0 && hostStillHeard === covered,
    detail: `the shipped resolveKeyboardInset, called with the same ${covered}px shrink at two `
      + `scales: at rest it returns ${atRest}px, zoomed it returns ${whileZoomed}px. With the host `
      + `also declaring ${covered}px it returns ${hostStillHeard}px while zoomed, because the guard `
      + `belongs to the observed term and does not contradict a host that says a keyboard is open. `
      + `The page's own viewport reports scale=${restingScale}, which is why this is called rather `
      + `than observed — a check reading that number measures the harness, not the guard.`,
  });

  // The publisher's teardown, driven rather than assumed.
  //
  // Publishing the inset costs a viewport subscription, and one left alive per view is a real leak.
  // Nothing in this repository counts listeners — the owner census that would is still unbuilt — so
  // this asserts the consequence instead. Clearing the selection is the shipped release path: it
  // removes the bar and drops the subscription with it. After that the variable is gone, and a
  // shrink that would have republished it a moment earlier leaves it gone. A publisher still
  // holding its subscription would rewrite the variable on that very event and fail here.
  const publishedWhileOpen = standaloneSelection.host.style.getPropertyValue("--db-keyboard-inset");
  standaloneSelection.view.selectedRows = new Set();
  standaloneSelection.view.cellSelection = undefined;
  standaloneSelection.view.getSelectedCellAddresses = () => [];
  DatabaseView.prototype.renderSelectionStatusBar.call(standaloneSelection.view);
  const afterClear = standaloneSelection.host.style.getPropertyValue("--db-keyboard-inset");
  shrinkVisualViewport(KEYBOARD);
  window.visualViewport.dispatchEvent(new window.Event("resize"));
  await settle();
  const afterClearedShrink = standaloneSelection.host.style.getPropertyValue("--db-keyboard-inset");
  restoreVisualViewport();
  out.push({
    name: "clearing the selection takes the keyboard publisher's viewport listener with it",
    pass: publishedWhileOpen !== "" && afterClear === "" && afterClearedShrink === "",
    detail: `--db-keyboard-inset held "${publishedWhileOpen || "(unset)"}" while a bar was up, `
      + `"${afterClear || "(unset)"}" once the selection cleared, and "${afterClearedShrink || "(unset)"}" `
      + `after a viewport shrink that would have republished it`,
  });
  out.push({
    name: "clearing the selection removes the bar it published for",
    pass: !standaloneSelection.host.querySelector(".db-selection-status-bar"),
    detail: `bars left in the container: ${standaloneSelection.host.querySelectorAll(".db-selection-status-bar").length} `
      + `(a surviving bar would keep the publisher legitimately alive and make the check above vacuous)`,
  });

  // The announcement, driven rather than read off an attribute.
  //
  // An aria-live attribute states an intent. What actually reaches a screen reader is a change made
  // INSIDE a region that was already there when the change happened — a region that is itself
  // brand new announces nothing, because there is no before for the after to differ from. The
  // selection bar is emptied and rebuilt on every selection change, so a badge inside it carrying
  // the attribute is a different element each time and the intent never fires. That is the defect
  // this pair is written to catch, and it is invisible to any check that only looks for the
  // attribute. Both checks below drive two real renders at different counts through the shipped
  // method and compare the announcing NODE across them.
  const liveHost = document.body.createDiv({ cls: "note-database-container" });
  const liveView = Object.create(DatabaseView.prototype);
  liveView.containerEl_ = liveHost;
  liveView.selectedRows = new Set(["one.md", "two.md"]);
  liveView.cellSelection = undefined;
  liveView.selectionStatusBar = undefined;
  liveView.pendingCellFillDraft = null;
  liveView.showCellFillInput = false;
  liveView.historyStack = [];
  liveView.getSelectedCellAddresses = () => [];
  liveView.getConfig = () => ({ schema: { columns: [] } });
  DatabaseView.prototype.renderSelectionStatusBar.call(liveView);
  const announcerBefore = liveHost.querySelector("[aria-live]");
  const announcerTextBefore = announcerBefore ? announcerBefore.textContent : "";
  liveView.selectedRows = new Set(["one.md", "two.md", "three.md"]);
  DatabaseView.prototype.renderSelectionStatusBar.call(liveView);
  const announcerAfter = liveHost.querySelector("[aria-live]");
  const announcerTextAfter = announcerAfter ? announcerAfter.textContent : "";
  const announcerCount = liveHost.querySelectorAll("[aria-live]").length;
  out.push({
    name: "the selection announcer survives the count change it is meant to announce",
    pass: !!announcerBefore && announcerBefore === announcerAfter
      && announcerTextBefore !== announcerTextAfter && /\b3\b/.test(announcerTextAfter),
    detail: `same node across renders: ${announcerBefore === announcerAfter} `
      + `text "${announcerTextBefore}" -> "${announcerTextAfter}" `
      + `(a badge rebuilt inside the bar reads as a different node and announces nothing)`,
  });
  // One region, and outside the bar. Two announcing nodes would make the pair above pick whichever
  // came first in the tree and could hide a stale one, and a region the rebuild can reach is the
  // original defect wearing a new class name.
  const liveBar = liveHost.querySelector(".db-selection-status-bar");
  out.push({
    name: "exactly one announcer exists and the bar rebuild cannot reach it",
    pass: announcerCount === 1 && !!liveBar && !!announcerAfter && !liveBar.contains(announcerAfter),
    detail: `announcing nodes=${announcerCount} inside the bar=${liveBar && announcerAfter ? liveBar.contains(announcerAfter) : "n/a"}`,
  });
  // Hidden to the eye, present to the reader. display:none and visibility:hidden both take a node
  // out of the accessibility tree and the announcement with it, so the region has to be clipped
  // instead — which is a CSS decision a check can hold, not a comment.
  const announcerStyle = announcerAfter ? getComputedStyle(announcerAfter) : null;
  const announcerBox = announcerAfter ? announcerAfter.getBoundingClientRect() : { width: 0, height: 0 };
  out.push({
    name: "the announcer is clipped rather than hidden, so it stays in the accessibility tree",
    pass: !!announcerStyle && announcerStyle.display !== "none" && announcerStyle.visibility !== "hidden"
      && announcerBox.width <= 2 && announcerBox.height <= 2,
    detail: `display=${announcerStyle ? announcerStyle.display : "n/a"} `
      + `visibility=${announcerStyle ? announcerStyle.visibility : "n/a"} `
      + `clip-path=${announcerStyle ? announcerStyle.clipPath : "n/a"} `
      + `box=${Math.round(announcerBox.width)}x${Math.round(announcerBox.height)}px`,
  });
  liveHost.remove();

  rhythmHost.remove();
  standaloneSelection.host.remove();
  embeddedSelection.host.remove();

  return out;
}, {
  breakDock: process.env.SELECTION_BAR_CONTROL === "break",
  revertDock: process.env.SELECTION_BAR_CONTROL === "revert",
}));

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
await menuPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await menuPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await menuPhone.addScriptTag({ content: positionerJs });

const menuResults = await section("the phone menu presentation", () => menuPhone.evaluate(() => {
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
  // The owned menu is the tighter of the two surfaces that share the handle rule — its first row
  // starts closer to the top than the add-view sheet's first field does — so it is the one that
  // decides how far the band may reach. It had no check of its own: its band was a number written
  // into a comment on another surface's check, and a number nothing re-asserts is how the
  // double-counted arithmetic survived. Both ends are asserted here, because a band that clears the
  // thumb minimum by eating the first row is not a fix.
  {
    const h = el.querySelector(".db-mobile-bottom-sheet-handle");
    const hb2 = h.getBoundingClientRect();
    const hit2 = (x, y) => {
      const e2 = document.elementFromPoint(Math.round(x), Math.round(y));
      return Boolean(e2) && (e2 === h || h.contains(e2));
    };
    const cx2 = hb2.left + hb2.width / 2;
    const cy2 = hb2.top + hb2.height / 2;
    let u2 = 0;
    let d2 = 0;
    while (u2 < 80 && hit2(cx2, cy2 - u2 - 1)) u2 += 1;
    while (d2 < 80 && hit2(cx2, cy2 + d2 + 1)) d2 += 1;
    const band2 = u2 + d2 + 1;
    const rows = [...el.querySelectorAll(".db-menu-item")];
    const stolenRows = rows.filter((row) => {
      const rr = row.getBoundingClientRect();
      const mid = document.elementFromPoint(Math.round(rr.left + rr.width / 2), Math.round(rr.top + rr.height / 2));
      return Boolean(mid) && (mid === h || h.contains(mid));
    });
    const firstRowTop = rows.length ? Math.round(rows[0].getBoundingClientRect().top - r.top) : 0;
    out.push({
      name: "a menu sheet's grab band is a thumb-sized target and takes no row with it",
      pass: band2 >= 44 && hit2(cx2 + 120, cy2) && stolenRows.length === 0,
      detail: `band ${band2}px (${u2} above the bar + ${d2} below + the centre pixel; want >= 44), `
        + `reaching 120px sideways=${hit2(cx2 + 120, cy2)}; the band ends `
        + `${Math.round(cy2 + d2 - r.top)}px from the sheet's top edge and the first row starts at `
        + `${firstRowTop}px, ${stolenRows.length} of ${rows.length} rows answered by the band`,
    });
  }

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
}));

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
// `pauseMs` is what makes a short drag a DRAG rather than a flick.
//
// Dismissal is no longer distance-only: a fast pull past a velocity threshold closes the sheet too,
// which is the gesture a phone user already has and which did nothing before. That makes timing
// load-bearing here. Fired back-to-back these two moves complete a 40px gesture in about 18ms —
// roughly 2 px/ms, faster than a measured real flick — so an unpaced "short drag" is a flick and
// asserting it springs back would be asserting the feature is absent. Paced, it models the
// deliberate drag it was always meant to describe.
const dragCase = async (distance, { pauseMs = 0, steps = 2 } = {}) => {
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
  for (let step = 1; step <= steps; step += 1) {
    await menuPhone.mouse.move(start.x, start.y + Math.round((distance * step) / steps));
    if (pauseMs) await menuPhone.waitForTimeout(pauseMs);
  }
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

await section("the menu sheet's drag-to-dismiss gesture", async () => {
  const longDrag = await dragCase(140);
  menuResults.push({
    name: "dragging a menu sheet's handle down past the threshold dismisses it",
    pass: longDrag.handle && !longDrag.mounted && !longDrag.scrim,
    detail: longDrag.handle
      ? `dragged 140px (threshold 96): menu still mounted=${longDrag.mounted} backdrop=${longDrag.scrim ? "left behind" : "gone"}`
      : "the menu has no grab handle, so there is no gesture to drive",
  });
  // Deliberate: 40px spread over four paced moves, which is how a person drags a sheet they are
  // reading rather than dismissing.
  const shortDrag = await dragCase(40, { pauseMs: 120, steps: 4 });
  menuResults.push({
    name: "a short SLOW drag on the handle springs back instead of dismissing",
    pass: shortDrag.handle && shortDrag.mounted && shortDrag.scrim,
    detail: shortDrag.handle
      ? `dragged 40px slowly (distance threshold 96): menu still mounted=${shortDrag.mounted} backdrop=${shortDrag.scrim ? "present" : "gone"}`
      : "the menu has no grab handle, so there is no gesture to drive",
  });
  // The velocity half, ASKED rather than raced for.
  //
  // This drove the same 40px "as fast as possible" and asserted it dismissed. A harness cannot
  // control how fast its own events arrive: that delivered roughly 2 px/ms on a quiet machine and
  // under 0.8 on a loaded one, so the same tree reported a working flick as broken depending on what
  // else was running. Both this lane and `sheet-rebuild` failed that way on a commit that touched
  // neither the gesture nor its constants — a value the harness supplies, which is the shape this
  // program has repaired three times elsewhere.
  //
  // The gesture is still driven, because reaching the handler is a real claim; what is asserted is
  // the decision, which is three numbers in and one out.
  const flick = await dragCase(40, { pauseMs: 0, steps: 4 });
  const flickRule = await menuPhone.evaluate(() => {
    const { shouldFlickDismiss, FLICK_PX_PER_MS, FLICK_MIN_PX, STALE_SAMPLE_MS } = globalThis.__flick;
    return {
      genuine: shouldFlickDismiss(40, 1.18, 8),
      brisk: shouldFlickDismiss(80, 0.5, 8),
      tap: shouldFlickDismiss(FLICK_MIN_PX - 1, 50, 1),
      rested: shouldFlickDismiss(40, 2, STALE_SAMPLE_MS + 1),
      threshold: FLICK_PX_PER_MS,
    };
  });
  menuResults.push({
    name: "the flick rule dismisses on speed and refuses a brisk drag, a tap and a rest",
    pass: flick.handle && flickRule.genuine && !flickRule.brisk && !flickRule.tap && !flickRule.rested,
    detail: flick.handle
      ? `the shipped rule takes a genuine flick at 1.18 px/ms (${flickRule.genuine}), refuses a brisk`
        + ` drag at 0.5 (${flickRule.brisk}), refuses a tap that travelled nowhere (${flickRule.tap})`
        + ` and refuses a finger that rested before lifting (${flickRule.rested}), against a`
        + ` ${flickRule.threshold} px/ms threshold. A real 40px gesture was driven at the bar and`
        + ` left the menu mounted=${flick.mounted} — NOT asserted, because that number moved with`
        + ` machine load rather than with the tree`
      : "the menu has no grab handle, so there is no gesture to drive",
  });
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
    // The floor is a guard against an empty-set pass — a menu that rendered nothing would satisfy
    // "no row diverges" trivially. It was 8 when the gallery was still offered, then 7 once that
    // withdrawal shipped; `006` withdraws list the same way, legitimately removing a second row,
    // so the floor follows the surface down to 6 rather than pinning a count this check was never
    // about.
    pass: rows.length >= 6 && offGrammar.length === 0 && refCs.minHeight === expectedMinHeight,
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
  // `between` carries its own threshold now, and the reason is a control that did not go red.
  //
  // The criterion this serves asked for each heading to be "load-bearing for the gap above", and the
  // control it named — remove a heading element and require this check to fall to the within-group
  // value — does not do that. It cannot: `trailing` is the FORM's own bottom whitespace, and a
  // heading outside the form cannot change it. That independence is deliberate and this check's own
  // comment explains why, so restoring the dependency would restore the defect.
  //
  // What the heading IS load-bearing for is the distance between the two groups, and that was
  // asserted only as `> 0` — satisfied by the separator alone. Removing the "Create" heading takes
  // `between` from 36px to 9px, measured, and the same `within` the rest of the check uses gives the
  // threshold: two group-gaps' worth of space, which a bare separator cannot supply.
  out.push({
    name: `add view: groups are further apart than the items inside them (${where})`,
    pass: trailing >= within * 2 && trailing > 0 && between >= within * 2,
    detail: `group trailing space ${trailing}px vs within-group item gap ${within}px (want >= 2x; `
      + `was 0px vs 4px), and ${between}px of separator and heading between the two groups`
      + ` (want >= ${within * 2}px — a separator on its own measures 9px there, so this is the`
      + ` clause the heading carries)`,
  });

  // The groups are named, in the vocabulary the owned menu already uses.
  //
  // The TEXT is load-bearing, not just the element. Counting `.db-menu-section` nodes is a
  // class-name criterion: two empty divs satisfy it, draw nothing a reader can use, and still hold
  // the gap the check below measures — so the two clauses pass together while the surface says
  // nothing. Asserting the text is what separates "the group is named" from "the group has a box
  // where a name would go".
  const sections = [...panel.querySelectorAll(".db-menu-section")];
  const separators = panel.querySelectorAll(".db-menu-separator");
  const namedSections = sections.filter((el) => (el.textContent || "").trim().length > 0);
  out.push({
    name: `add view: the groups carry headings (${where})`,
    pass: sections.length >= 2 && separators.length >= 1 && namedSections.length === sections.length,
    detail: `${sections.length} headings [${sections.map((s) => `"${(s.textContent || "").trim()}"`).join(", ")}], `
      + `${namedSections.length} of them carrying text, ${separators.length} separators (was 0 and 0)`,
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
    // the sheet clips, so the half of the band above the bar is cut short.
    //
    // The walk starts at the bar's own CENTRE, so up and down already cross the bar. Adding the
    // bar's height back counted those 4px twice and reported a band 3px larger than the one a thumb
    // gets: 45 here and 41 on the owned-menu sheet were both that artefact, and the first of them
    // was over this check's own 44px threshold, so a failing surface reported green. The span of a
    // walk outward from a centre is up + down + 1 — the two arms plus the pixel they start on,
    // which is the form usableHeight uses below. The threshold is the 44px thumb minimum this
    // stylesheet already uses for phone menu rows.
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
    const band = handleBox ? up + down + 1 : 0;
    // Headroom: how far the band could reach downward before it starts taking presses aimed at the
    // surface's own first content. That is the number the record sheet's fix was sized against, so
    // measuring it the same way here makes the two surfaces comparable rather than each arguing
    // from its own vocabulary.
    const firstContent = [...panel.children].find((el) => el !== handle);
    const headroom = firstContent
      ? Math.round(firstContent.getBoundingClientRect().top - rect.top)
      : 0;
    // The band is only allowed to be this big because everything it covers is inert. Asserted, not
    // assumed: the surface's own controls are hit-tested, and if one of them ever moves up under the
    // band this fails instead of the band quietly swallowing it the way the record sheet's did.
    const controls = [...panel.querySelectorAll("button, input, select, textarea, .db-menu-item, [role=button]")];
    const swallowed = controls.filter((el) => {
      const r = el.getBoundingClientRect();
      const mid = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
      return Boolean(mid) && (mid === handle || handle?.contains(mid));
    });
    // Sideways reach is the half of the claim a vertical walk cannot see: the band spans the header
    // rather than the 36px bar, so a thumb landing anywhere along the top still starts the gesture.
    const sideways = handleBox ? hitsHandle(cx + 120, cy) : false;
    out.push({
      name: "add view: the sheet's grab band is a thumb-sized target",
      pass: band >= 44 && sideways && swallowed.length === 0,
      detail: handleBox
        ? `bar ${Math.round(handleBox.width)}x${Math.round(handleBox.height)}, usable band ${band}px `
          + `(${up}px above + ${down}px below + the centre pixel; want >= 44), reaches 120px `
          + `sideways=${sideways}; ${headroom}px of chrome above the first content `
          + `(.${firstContent?.className.split(" ")[0] ?? "none"}, which is inert), `
          + `${swallowed.length} of ${controls.length} controls answered by the band`
          + (swallowed.length ? `: ${swallowed.map((el) => el.className.split(" ")[0]).join(", ")}` : "")
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
await addViewDesktop.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await addViewDesktop.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await addViewDesktop.addScriptTag({ content: positionerJs });
const addViewDesktopResults = await section("the add-view surface on the desktop", () => addViewDesktop.evaluate(addViewProbe, false));
await addViewDesktop.close();

const addViewPhone = await browser.newPage({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
await addViewPhone.setContent(page_html.replace("<body>", phoneBody));
await addViewPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await addViewPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await addViewPhone.addScriptTag({ content: positionerJs });
const addViewPhoneResults = await section("the add-view surface on a phone", () => addViewPhone.evaluate(addViewProbe, true));
await addViewPhone.close();

// ───────────────────────────────────────────────────────────────────
// 5c-iii. ONE ROW GRAMMAR, MEASURED AGAINST THE HOST'S OWN BUTTON RULE
// ───────────────────────────────────────────────────────────────────
//
// "Aligned" is an opinion until it is a count. The number this section exists to hold is the number
// of DISTINCT x-positions the labels in one sheet take: one means the eye can track a single left
// edge down the list, and anything above one means it cannot. Measured on the surface the operator
// reported twice, built by the shipped `ColumnMenu` rather than by markup written here — a fixture
// that fakes a menu proves nothing about the menu.
//
// Before the fix, against the host rule this page now loads: 14 distinct positions across 18 rows.
// The two that stayed put were the submenu rows, because an auto margin on their trailing chevron
// absorbed the free space that centred everything else — which is why the defect read as rows
// disagreeing with each other rather than as one missing declaration.
//
// The same page also carries the behaviours a row grammar has to include but a static measurement
// cannot see: that a row which OPENS something says so, that a sheet scrolls on one axis, and that
// the submenu a row opens is actually in front of the surface that opened it.

const grammarPhone = await browser.newPage({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
await grammarPhone.setContent(page_html.replace("<body>", phoneBody));
await grammarPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await grammarPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await grammarPhone.addScriptTag({ content: positionerJs });

const grammarResults = await section("the shared row grammar on a phone", () => grammarPhone.evaluate(async () => {
  const out = [];
  const { ColumnMenu } = globalThis.__place;

  const labelXs = (root) => [...root.querySelectorAll(".db-menu-item")]
    .map((row) => row.querySelector(".db-menu-item-label"))
    .filter(Boolean)
    .map((label) => Math.round(label.getBoundingClientRect().x));

  // ── the column menu, through the class that ships it ────────────────
  const anchor = document.querySelector(".note-database-container").createDiv({ cls: "anchor" });
  const columnMenu = new ColumnMenu(new Proxy({}, { get: () => () => {} }));
  const openEvent = new MouseEvent("click", { clientX: 120, clientY: 120, bubbles: true });
  Object.defineProperty(openEvent, "view", { value: window });
  columnMenu.show(openEvent, { key: "stocks", label: "Stocks", type: "text" }, anchor, {});
  const sheet = document.querySelector(".db-owned-menu");

  const xs = labelXs(sheet);
  const distinct = [...new Set(xs)];
  out.push({
    name: "column menu: every label starts at the same x",
    pass: distinct.length === 1,
    detail: `${distinct.length} distinct label x-position(s) across ${xs.length} rows `
      + `[${distinct.sort((a, b) => a - b).join(", ")}] (want exactly 1; measured 14 before the row `
      + "stated its own justify-content, with only the two chevron rows holding their edge)",
  });

  const firstRow = sheet.querySelector(".db-menu-item");
  const rowStyle = getComputedStyle(firstRow);
  out.push({
    name: "column menu: the row states its own main-axis alignment",
    pass: rowStyle.justifyContent === "flex-start",
    detail: `justify-content=${rowStyle.justifyContent} with the host's button rule loaded `
      + "(an unstated value resolves to the host's 'center')",
  });

  // A thumb target, and a hairline between neighbours. The last row of the sheet draws none: a rule
  // under nothing is a border, not a separator.
  const rows = [...sheet.querySelectorAll(".db-menu-item")];
  const shortest = Math.min(...rows.map((row) => Math.round(row.getBoundingClientRect().height)));
  out.push({
    name: "column menu: every row clears the 44px thumb floor",
    pass: shortest >= 44,
    detail: `shortest row ${shortest}px across ${rows.length} rows`,
  });

  const hairline = (row) => {
    const after = getComputedStyle(row, "::after");
    return after.content !== "none" && Math.round(parseFloat(after.height || "0")) === 1;
  };
  const middle = rows.filter((row) => row.nextElementSibling?.classList.contains("db-menu-item"));
  const trailing = rows.filter((row) => !row.nextElementSibling?.classList.contains("db-menu-item"));
  out.push({
    name: "column menu: adjacent rows are divided by a hairline, and a group's last row is not",
    pass: middle.length > 0 && middle.every(hairline) && trailing.every((row) => !hairline(row)),
    detail: `${middle.filter(hairline).length}/${middle.length} rows with a following row carry one; `
      + `${trailing.filter(hairline).length}/${trailing.length} rows that end a group carry one (want 0)`,
  });

  // The hairline starts where the labels start, which is the whole reason it reads as a column
  // rather than as a set of stripes.
  const divided = middle[0];
  const dividerLeft = Math.round(divided.getBoundingClientRect().x
    + parseFloat(getComputedStyle(divided, "::after").left || "0"));
  const labelLeft = Math.round(divided.querySelector(".db-menu-item-label").getBoundingClientRect().x);
  out.push({
    name: "column menu: the hairline begins at the label, not at the sheet edge",
    pass: Math.abs(dividerLeft - labelLeft) <= 1,
    detail: `divider starts at x=${dividerLeft}, label at x=${labelLeft} `
      + `(sheet's own left edge is ${Math.round(sheet.getBoundingClientRect().x)})`,
  });

  // A row that OPENS something announces itself; a row that ACTS does not. That difference is the
  // component's to express, not each caller's.
  const opener = rows.find((row) => /Change type/.test(row.textContent));
  const actor = rows.find((row) => /Duplicate property/.test(row.textContent));
  out.push({
    name: "a row that opens a submenu carries a chevron and says so; a row that acts carries neither",
    pass: Boolean(opener?.querySelector(".db-menu-item-chevron"))
      && opener?.getAttribute("aria-haspopup") !== null
      && !actor?.querySelector(".db-menu-item-chevron")
      && actor?.getAttribute("aria-haspopup") === null,
    detail: `"Change type" chevron=${Boolean(opener?.querySelector(".db-menu-item-chevron"))} `
      + `aria-haspopup=${opener?.getAttribute("aria-haspopup")}; `
      + `"Duplicate property" chevron=${Boolean(actor?.querySelector(".db-menu-item-chevron"))} `
      + `aria-haspopup=${actor?.getAttribute("aria-haspopup")}`,
  });

  // One axis, not two. Declaring only `overflow-y` makes the other axis `auto` by the overflow
  // spec's own coupling rule, so a full-width sheet gains a sideways drag nobody asked for.
  const longRow = sheet.querySelector(".db-menu-item .db-menu-item-label");
  longRow.setText("A property name long enough that it cannot possibly fit across a phone sheet in one line");
  sheet.getBoundingClientRect();
  const sheetStyle = getComputedStyle(sheet);
  out.push({
    name: "a sheet scrolls vertically only, and a long label truncates instead of widening it",
    pass: sheetStyle.overflowX === "hidden" && sheet.scrollWidth <= sheet.clientWidth + 1,
    detail: `overflow-x=${sheetStyle.overflowX} overflow-y=${sheetStyle.overflowY}; `
      + `content ${sheet.scrollWidth}px wide in a ${sheet.clientWidth}px box`,
  });

  out.push({
    name: "a sheet stops at 90% of the screen and scrolls inside it",
    pass: Math.round(sheet.getBoundingClientRect().height) <= Math.round(window.innerHeight * 0.9) + 2
      && sheet.scrollHeight > sheet.clientHeight + 1,
    detail: `height=${Math.round(sheet.getBoundingClientRect().height)} `
      + `cap=${Math.round(window.innerHeight * 0.9)} (90svh) `
      + `content=${sheet.scrollHeight} visible=${sheet.clientHeight}`,
  });

  // ── the submenu the operator could not open ─────────────────────────
  const chevronRow = rows.find((row) => /Change type/.test(row.textContent));
  const box = chevronRow.getBoundingClientRect();
  const press = {
    bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, pointerType: "touch", button: 0,
    clientX: Math.round(box.x + box.width / 2), clientY: Math.round(box.y + box.height / 2),
  };
  chevronRow.dispatchEvent(new PointerEvent("pointerdown", press));
  chevronRow.dispatchEvent(new PointerEvent("pointerup", press));
  chevronRow.dispatchEvent(new MouseEvent("click", press));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const submenu = document.querySelector(".db-column-type-popover");
  const scrim = document.querySelector(".db-mobile-sheet-scrim");
  const submenuZ = submenu ? Number(getComputedStyle(submenu).zIndex) : null;
  const scrimZ = scrim ? Number(getComputedStyle(scrim).zIndex) : null;
  const submenuBox = submenu?.getBoundingClientRect();
  const painted = submenuBox
    ? document.elementFromPoint(Math.round(submenuBox.x + submenuBox.width / 2),
      Math.round(submenuBox.y + submenuBox.height / 2))
    : null;
  out.push({
    name: "a submenu opened from a sheet is in front of that sheet and its backdrop",
    pass: Boolean(submenu) && submenuZ !== null && scrimZ !== null && submenuZ > scrimZ
      && Boolean(painted) && submenu.contains(painted),
    detail: submenu
      ? `submenu z=${submenuZ} scrim z=${scrimZ} sheet z=${getComputedStyle(sheet).zIndex}; `
        + `the document paints "${painted ? painted.className || painted.tagName : "nothing"}" at the `
        + "submenu's own centre (it was 110 against a 999 backdrop, opened and laid out correctly "
        + "and painted underneath, which on a phone is a tap that does nothing)"
      : "the row produced no submenu at all",
  });

  return out;
}));

// The add-view sheet is the second surface the operator reported, and it reaches the row through a
// different door — `createMenuRow` called directly rather than through the owned menu — so it is
// measured separately rather than assumed to follow.
const addViewGrammar = await section("the add-view menu's row grammar", () => grammarPhone.evaluate(async () => {
  const out = [];
  const { ToolbarRenderer } = globalThis.__place;
  document.querySelectorAll(".db-owned-menu, .db-column-menu-subpopover, .db-mobile-sheet-scrim")
    .forEach((node) => node.remove());

  const host = document.querySelector(".note-database-container");
  const anchor = host.createDiv({ cls: "anchor" });
  new ToolbarRenderer().showAddViewMenu(
    new MouseEvent("click"),
    { addView() {}, closeToolbarPopovers() {} },
    anchor,
    { schema: { columns: [{ key: "file.name", label: "Name" }, { key: "cost", label: "Cost" }] },
      views: [{ viewType: "table", name: "All" }] },
    0,
  );
  const panel = document.querySelector(".db-add-view-popover");
  const xs = [...panel.querySelectorAll(".db-add-view-choices .db-menu-item")]
    .map((row) => Math.round(row.querySelector(".db-menu-item-label").getBoundingClientRect().x));
  const distinct = [...new Set(xs)];
  out.push({
    name: "add view: every create row starts at the same x",
    pass: distinct.length === 1,
    detail: `${distinct.length} distinct label x-position(s) across ${xs.length} rows `
      + `[${distinct.sort((a, b) => a - b).join(", ")}] (want exactly 1)`,
  });

  // The grab bar was chrome with nothing behind it on every surface the positioner presents. A
  // gesture, not a source grep: press the handle, drag past the threshold, and see whether the
  // sheet answers.
  const handle = panel.querySelector(".db-mobile-bottom-sheet-handle");
  const hb = handle.getBoundingClientRect();
  const start = hb.y + hb.height / 2;
  const x = hb.x + hb.width / 2;
  // Deliberately SLOW — 140px over six 40ms steps is 0.58 px/ms, under the 0.8 flick threshold, so
  // the dismissal this asserts is the distance one it names. Left to the event loop the same drag
  // computes 300 px/ms and dismisses as a flick, which is a different mechanism wearing this
  // check's description.
  let followed = "";
  globalThis.__timedDrag({
    target: handle, panel, x, from: start, to: start + 140, steps: 6, msPerStep: 40, pointerId: 2,
    onStep: (i) => { if (i === 2) followed = getComputedStyle(panel).transform; },
  });
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const stillOpen = Boolean(document.querySelector(".db-add-view-popover"));
  out.push({
    name: "add view: the sheet follows a drag on its grab bar and dismisses past the threshold",
    pass: /matrix/.test(followed) && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(followed) && !stillOpen,
    detail: `two steps in the sheet had moved to ${followed}; the full 140px drag delivered at `
      + `0.58 px/ms — under the 0.8 px/ms flick threshold, so this is the distance path and not the `
      + `velocity one — left the sheet ${stillOpen ? "still open" : "dismissed"} (the bar was drawn `
      + "on every positioner-presented sheet and wired on none of them)",
  });

  return out;
}));
await grammarPhone.close();

// ───────────────────────────────────────────────────────────────────
// 5c-iv. THE ENTRANCE — the one page in this file that lets motion run
// ───────────────────────────────────────────────────────────────────
//
// Every other page reduces motion so a rectangle is a layout rather than an animation frame. That
// is right for placement and blind for exactly one question: does the sheet move at all.
//
// It did not. Measured over the whole window, the sheet sat at identity from the first sample and
// no animation object ever existed — because both call sites added the start class and flipped to
// the end class inside one `requestAnimationFrame`, which fires BEFORE that frame's style
// recalculation. One style resolution, already carrying the end state, nothing to interpolate. The
// duration and the distance were never the reason it appeared instantly, so retuning either would
// have changed nothing on a device, and no check here could have told anyone that.
//
// Both halves are asserted: that it moves, and that reducing motion still lands it at rest.

const motionPhone = await browser.newPage({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
await motionPhone.setContent(page_html.replace("<body>", phoneBody));
await motionPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await motionPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await motionPhone.addScriptTag({ content: positionerJs });

const motionResults = await section("the sheet entrance with motion allowed", () => motionPhone.evaluate(async () => {
  const out = [];
  const { createOwnedMenu } = globalThis.__place;
  // The vertical translation out of the computed matrix. Parsed rather than read through
  // DOMMatrixReadOnly so this stays inside the lint's browser-globals set.
  const offsetY = (el) => {
    const matrix = getComputedStyle(el).transform;
    if (!matrix || matrix === "none") return 0;
    const parts = matrix.slice(matrix.indexOf("(") + 1, -1).split(",").map((n) => parseFloat(n));
    return Math.round(parts.length === 16 ? parts[13] : parts[5]);
  };

  const menu = createOwnedMenu(document);
  for (let i = 0; i < 10; i += 1) menu.addRow({ icon: "pencil", label: `Row ${i}` });
  menu.showAt({ x: 200, y: 200 });
  const sheet = menu.el;
  const height = Math.round(sheet.getBoundingClientRect().height);

  const start = offsetY(sheet);
  await new Promise((resolve) => setTimeout(resolve, 60));
  const inFlight = offsetY(sheet);
  await new Promise((resolve) => setTimeout(resolve, 400));
  const settled = offsetY(sheet);

  out.push({
    name: "the sheet starts a full sheet-height below the screen, not a nudge below it",
    pass: Math.abs(start - height) <= 2,
    detail: `initial translateY=${start}px against a ${height}px sheet `
      + "(the popover entrance it inherited moved it 8px, which is below the distance at which "
      + "travel reads as travel)",
  });
  out.push({
    name: "the sheet is still travelling one frame in, and has settled by the end of its duration",
    // The mid-flight floor is what stops this passing on the 8px entrance it replaced: a nudge
    // technically moves, so "greater than zero" is not a threshold anybody can fail.
    pass: inFlight > height * 0.2 && inFlight < start && settled === 0,
    detail: `translateY ${start} -> ${inFlight} at 60ms -> ${settled} at 460ms `
      + `(want more than ${Math.round(height * 0.2)}px still to travel at 60ms; a stalled entrance `
      + "reads 0 at every sample, which is what it did)",
  });

  const easing = getComputedStyle(sheet);
  out.push({
    name: "the entrance runs on the shared sheet duration, easing out, on transform alone",
    pass: easing.transitionProperty === "transform"
      && easing.transitionDuration === "0.26s"
      && easing.transitionTimingFunction === "ease-out",
    detail: `${easing.transitionProperty} ${easing.transitionDuration} ${easing.transitionTimingFunction}`,
  });

  // A gesture must be able to interrupt an entrance. The drag writes an inline transform, and an
  // inline value outranks the class the transition is running on — so the thumb takes the surface
  // over mid-flight instead of waiting the animation out.
  const second = createOwnedMenu(document);
  for (let i = 0; i < 10; i += 1) second.addRow({ icon: "pencil", label: `Row ${i}` });
  second.showAt({ x: 200, y: 200 });
  const rising = second.el;
  const bar = rising.querySelector(".db-mobile-bottom-sheet-handle");
  const bb = bar.getBoundingClientRect();
  const grabX = bb.x + bb.width / 2;
  const grab = (y) => ({
    bubbles: true, cancelable: true, pointerId: 4, isPrimary: true, pointerType: "touch", button: 0,
    clientX: Math.round(grabX), clientY: Math.round(y),
  });
  // The press and the move are timed so the 30px travel reads as 0.19 px/ms rather than as 300.
  // This check reads the transform mid-gesture, so an accidental flick would not fail it — it
  // would dismiss the sheet underneath it and leave the next reader measuring a surface that is
  // gone. Timing it makes the gesture the one the name describes.
  const downEvent = new PointerEvent("pointerdown", grab(bb.y + 2));
  Object.defineProperty(downEvent, "timeStamp", { value: 1000, configurable: true });
  bar.dispatchEvent(downEvent);
  const moveEvent = new PointerEvent("pointermove", grab(bb.y + 32));
  Object.defineProperty(moveEvent, "timeStamp", { value: 1160, configurable: true });
  rising.dispatchEvent(moveEvent);
  const held = offsetY(rising);
  const upEvent = new PointerEvent("pointerup", grab(bb.y + 32));
  Object.defineProperty(upEvent, "timeStamp", { value: 1176, configurable: true });
  rising.dispatchEvent(upEvent);
  out.push({
    name: "a thumb on the grab bar takes the sheet over while the entrance is still running",
    pass: Math.abs(held - 30) <= 4,
    detail: `a 30px drag begun during the entrance put the sheet at translateY=${held}px `
      + "(the finger's own offset, not a position the animation chose)",
  });

  return out;
}));
await motionPhone.close();

const reducedPhone = await browser.newPage({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
await reducedPhone.setContent(page_html.replace("<body>", phoneBody));
await reducedPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await reducedPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await reducedPhone.addScriptTag({ content: positionerJs });

const reducedResults = await section("the sheet entrance under reduced motion", () => reducedPhone.evaluate(async () => {
  const out = [];
  const { createOwnedMenu } = globalThis.__place;
  const menu = createOwnedMenu(document);
  for (let i = 0; i < 10; i += 1) menu.addRow({ icon: "pencil", label: `Row ${i}` });
  menu.showAt({ x: 200, y: 200 });
  const sheet = menu.el;
  const transform = getComputedStyle(sheet).transform;
  const scrim = document.querySelector(".db-mobile-sheet-scrim");
  out.push({
    name: "reduced motion lands the sheet at rest with nothing running, backdrop included",
    pass: (transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)")
      && sheet.getAnimations().length === 0
      && Boolean(scrim)
      && getComputedStyle(scrim).animationName === "none"
      && Number(getComputedStyle(scrim).opacity) === 1,
    detail: `sheet transform=${transform}, ${sheet.getAnimations().length} running animation(s); `
      + `backdrop animation=${scrim ? getComputedStyle(scrim).animationName : "no backdrop"} `
      + `opacity=${scrim ? getComputedStyle(scrim).opacity : "n/a"} `
      + "(the backdrop fades through an animation, which a transition reset does not reach)",
  });
  return out;
}));
await reducedPhone.close();

// ───────────────────────────────────────────────────────────────────
// 5c2. PHONE — the column-width adjuster follows the keyboard
// ───────────────────────────────────────────────────────────────────
//
// Two operator reports, one phone, 2026-09-04. The first screenshot showed the adjuster as a bare
// strip glued to the bottom of the screen — no scrim, no grab bar, no header — unlike every other
// sheet in the plugin; the second showed the numeric keyboard covering that same strip outright
// while the width field was focused, with no way to see the column being resized. The fix moved the
// adjuster onto the shared sheet host (`applySheetChrome`, `placeSheet`, `keepSheetPlaced`) the same
// way every other phone sheet in this file is already proven to dock and to follow a keyboard; this
// section proves it for THIS producer specifically, the same way `sheet-rebuild` and `sheet-teardown`
// check each real producer rather than trusting that calling the shared functions once is enough.
//
// The negative control below is a fixture, not a pinned style: `keepSheetPlaced` resubscribes to
// the very `resize`/`visualViewport` events this section dispatches to simulate a keyboard, so an
// override written to the real panel's `bottom` is overwritten again by the mechanism on the next
// of those events, before anything reads it. That self-healing is correct and it defeats a
// pin-and-drive control. What proves the assertions can fail instead is the exact rectangle the
// pre-fix panel drew — `position: fixed; bottom: 0` and nothing else — carried through the same
// keyboard simulation.
const columnWidthPhone = await browser.newPage({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
await columnWidthPhone.setContent(page_html.replace("<body>", phoneBody));
await columnWidthPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await columnWidthPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await columnWidthPhone.addScriptTag({ content: positionerJs });

const columnWidthKeyboardResults = await section(
  "the column-width adjuster follows the keyboard",
  () => columnWidthPhone.evaluate(async () => {
    const out = [];
    const { openColumnWidthAdjuster } = globalThis.__columnWidth;
    const settle = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const host = document.body.createDiv({ cls: "note-database-container" });
    const col = { key: "amount", label: "Amount", width: 150 };
    const config = { schema: { columns: [col] }, columnWidths: {}, defaultColumnWidth: 150 };
    let persistCount = 0;
    const close = openColumnWidthAdjuster({ root: host, col, config, persist: () => { persistCount += 1; } });

    const panel = document.querySelector(".db-mobile-column-width-panel");
    const numberField = panel ? panel.querySelector('input[type="number"]') : null;
    out.push({
      name: "the adjuster mounts as the shared sheet, with the field the keyboard checks focus",
      pass: Boolean(panel) && panel.classList.contains("db-mobile-bottom-sheet") && Boolean(numberField),
      detail: `panel=${panel ? panel.className : "(none)"} numberField=${Boolean(numberField)}`,
    });

    numberField.focus();
    const restingBox = panel.getBoundingClientRect();
    out.push({
      name: "with no keyboard the adjuster still sits on the viewport floor",
      pass: Math.abs(restingBox.bottom - window.innerHeight) <= 1,
      detail: `bottom=${restingBox.bottom.toFixed(0)} viewport=${window.innerHeight} `
        + "(this must not move — only the keyboard cases below should)",
    });

    // The same 331px keyboard height every other check in this file drives, measured off the
    // operator's own screenshot rather than invented for this section.
    const KEYBOARD = 331;

    // ── the host declares a keyboard ──
    document.documentElement.style.setProperty("--keyboard-height", `${KEYBOARD}px`);
    window.dispatchEvent(new window.Event("resize"));
    await settle();
    const hostFloor = window.innerHeight - KEYBOARD;
    const hostPanelBox = panel.getBoundingClientRect();
    const hostFieldBox = numberField.getBoundingClientRect();
    out.push({
      name: "the adjuster clears a keyboard the host reports",
      pass: Math.abs(hostPanelBox.bottom - hostFloor) <= 2,
      detail: `panel bottom=${hostPanelBox.bottom.toFixed(0)} want=${hostFloor} `
        + `(keyboard covers ${hostFloor}..${window.innerHeight})`,
    });
    out.push({
      name: "the focused width field stays visible above a keyboard the host reports",
      pass: hostFieldBox.bottom <= hostFloor + 1 && hostFieldBox.top >= -1,
      detail: `field ${hostFieldBox.top.toFixed(0)}-${hostFieldBox.bottom.toFixed(0)}px floor=${hostFloor}px`,
    });
    // The control: the pre-fix panel's own rectangle, carried through the identical drive above,
    // still active. A bare fixed-and-docked surface reading as clearing the keyboard here would
    // mean the two "clears the keyboard" checks above are not testing anything and this section
    // could not be trusted.
    const staleHost = document.body.createDiv({ cls: "note-database-container" });
    const stalePanel = staleHost.createDiv({});
    stalePanel.setCssProps({ position: "fixed", left: "0px", right: "0px", bottom: "0px" });
    const staleField = stalePanel.createEl("input", { attr: { type: "number" } });
    staleField.focus();
    await settle();
    const staleBox = stalePanel.getBoundingClientRect();
    out.push({
      name: "control: a panel that does not follow the keyboard fails the same check",
      pass: Math.abs(staleBox.bottom - hostFloor) > 4,
      detail: `pre-fix-shaped panel bottom=${staleBox.bottom.toFixed(0)} keyboard floor=${hostFloor}px `
        + "(this must stay parked at the screen bottom rather than clearing the keyboard)",
    });
    staleHost.remove();

    document.documentElement.style.removeProperty("--keyboard-height");
    window.dispatchEvent(new window.Event("resize"));
    await settle();

    // ── the device shrinks visualViewport, host silent ──
    //
    // The same two-arm split `keyboard-inset.test.ts` and the sheet/selection-bar section above
    // both draw: writing `--keyboard-height` only proves the host-reported arm, and a platform that
    // shrinks the visual viewport without publishing anything is the gap that arm cannot see.
    const restingVisualHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    Object.defineProperty(window.visualViewport, "height", {
      configurable: true,
      get: () => restingVisualHeight - KEYBOARD,
    });
    window.visualViewport.dispatchEvent(new window.Event("resize"));
    await settle();
    const deviceFloor = window.innerHeight - KEYBOARD;
    const devicePanelBox = panel.getBoundingClientRect();
    const deviceFieldBox = numberField.getBoundingClientRect();
    out.push({
      name: "the adjuster clears a keyboard no host reported",
      pass: Math.abs(devicePanelBox.bottom - deviceFloor) <= 2,
      detail: `panel bottom=${devicePanelBox.bottom.toFixed(0)} want=${deviceFloor} `
        + `(visualViewport shrunk to ${window.visualViewport.height})`,
    });
    out.push({
      name: "the focused width field stays visible above a keyboard no host reported",
      pass: deviceFieldBox.bottom <= deviceFloor + 1 && deviceFieldBox.top >= -1,
      detail: `field ${deviceFieldBox.top.toFixed(0)}-${deviceFieldBox.bottom.toFixed(0)}px floor=${deviceFloor}px`,
    });
    delete window.visualViewport.height;
    window.visualViewport.dispatchEvent(new window.Event("resize"));
    await settle();

    const closedBox = panel.getBoundingClientRect();
    out.push({
      name: "the adjuster returns to the floor once the keyboard closes",
      pass: Math.abs(closedBox.bottom - window.innerHeight) <= 1,
      detail: `bottom=${closedBox.bottom.toFixed(0)} viewport=${window.innerHeight}`,
    });

    close();
    out.push({
      name: "closing the adjuster leaves no sheet chrome behind",
      pass: !document.querySelector(".db-mobile-column-width-panel")
        && !document.querySelector(".db-mobile-sheet-scrim"),
      detail: `panel=${Boolean(document.querySelector(".db-mobile-column-width-panel"))} `
        + `scrim=${Boolean(document.querySelector(".db-mobile-sheet-scrim"))} persisted=${persistCount}x`,
    });
    host.remove();
    return out;
  }),
);
await columnWidthPhone.close();

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
await menuDesktop.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await menuDesktop.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await menuDesktop.addScriptTag({ content: positionerJs });

const desktopMenuResults = await section("the desktop menu presentation", () => menuDesktop.evaluate(() => {
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
}));

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
await cellPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await cellPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await cellPhone.addScriptTag({ content: positionerJs });

const cellResults = await section("what a press on a table cell means", () => cellPhone.evaluate(async () => {
  const out = [];
  const {
    trackCellGesture, nextCellRange, resolveCellTapAction, isMainItemColumn,
    attachLongPress, isTouchDevice, attachTitleOpenAffordance, setupTitleCellTap,
    openRecordDetailPanel, closeRecordDetailPanel, getOpenRecordDetailPath,
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
  //
  // AND THE OTHER END IS THE REAL OPENER, NOT A COUNTER. This check used to hand `setupTitleCellTap`
  // an `openRecord` that pushed a path onto an array, so `opened 1` meant a function had been
  // called and nothing else: no record sheet was created, mounted, placed or rendered anywhere in
  // the run, and the check would have gone on passing if `openRecordDetailPanel` had been deleted.
  // "Opens the record" is an outcome, so what is asserted below is the panel itself — the module's
  // own report of which record it holds, its mounted node, its rendered fields, and its box on
  // screen. Each open is closed again immediately, because the probes further down this section
  // hit-test the table and a sheet left standing would answer for it.
  const openTd = cellAt(5, 0);
  const openRow = {
    file: { path: rowPaths[5], basename: "34", name: "34.md" },
    frontmatter: { income: 4975.32, expenses: 12 },
    computed: {},
  };
  const openLink = openTd.querySelector("a");
  let navigated = 0;
  openLink.addEventListener("click", () => { navigated += 1; });
  attachTitleOpenAffordance(openTd, openRow, { open: () => undefined });
  const openBtn = openTd.querySelector(".db-record-open-btn");
  const openedPaths = [];
  const openedSheets = [];
  const driveRealOpener = (anchorEl, r) => {
    openedPaths.push(r.file.path);
    openRecordDetailPanel({
      anchorEl,
      host,
      row: r,
      columns: [
        { key: "file.name", label: "Name", type: "text" },
        { key: "income", label: "Income", type: "number" },
        { key: "expenses", label: "Expenses", type: "number" },
      ],
      config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
      app: {},
      actions: {
        editCell: () => {}, openRow: () => {}, editFileName: () => {}, isReadOnly: false,
      },
    });
    const sheet = document.querySelector(".db-record-detail-panel");
    const rect = sheet ? sheet.getBoundingClientRect() : null;
    openedSheets.push({
      row: r.file.path,
      held: getOpenRecordDetailPath(),
      mounted: Boolean(sheet && sheet.isConnected),
      isSheet: Boolean(sheet && sheet.classList.contains("db-mobile-bottom-sheet")),
      title: sheet ? (sheet.querySelector(".db-record-detail-title")?.textContent ?? "") : "",
      fields: sheet ? sheet.querySelectorAll(".db-record-detail-field").length : 0,
      width: rect ? Math.round(rect.width) : 0,
      height: rect ? Math.round(rect.height) : 0,
      onScreen: Boolean(rect && rect.width > 0 && rect.height > 0
        && rect.top < window.innerHeight && rect.bottom > 0),
    });
    closeRecordDetailPanel();
  };
  setupTitleCellTap(openTd, openRow, { openRecord: driveRealOpener });

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

  // The control for "a record sheet exists": a different row, whose sheet must hold a different
  // record and draw a different title. Without it, a handler that opened row 0 every time would
  // satisfy every assertion above — one sheet is not evidence that it is THIS row's sheet.
  const otherTd = cellAt(9, 0);
  const otherLink = otherTd.querySelector("a");
  otherLink.textContent = "99 • Dec '27";
  const otherRow = {
    file: { path: rowPaths[9], basename: "99", name: "99.md" },
    frontmatter: { income: 1, expenses: 2 },
    computed: {},
  };
  setupTitleCellTap(otherTd, otherRow, { openRecord: driveRealOpener });
  const otherLinkRect = otherLink.getBoundingClientRect();
  pressAndRelease(
    otherLink,
    Math.round(otherLinkRect.left + otherLinkRect.width / 2),
    Math.round(otherLinkRect.top + otherLinkRect.height / 2),
    "touch",
  );

  // Nothing may be left standing: the probes below hit-test the table, and a sheet or a scrim
  // still on the body would answer for it — which is the failure 031 root-caused on other surfaces.
  const sheetsLeft = document.querySelectorAll(".db-record-detail-panel").length;
  const scrimsLeft = document.querySelectorAll(".db-mobile-sheet-scrim").length;

  const everySheetReal = openedSheets.length === 3 && openedSheets.every((sheet) => sheet.mounted
    && sheet.isSheet && sheet.held === sheet.row && sheet.title.length > 0 && sheet.fields >= 2
    && sheet.onScreen);
  const firstSheet = openedSheets[0];
  const otherSheet = openedSheets[2];
  const distinct = Boolean(firstSheet && otherSheet
    && otherSheet.held === rowPaths[9] && otherSheet.title !== firstSheet.title);

  out.push({
    name: "the shipped title-cell handler opens a real record sheet from a real tap, and leaves the mouse alone",
    pass: openBareX !== null
      && afterBareTap === 1 && afterLinkTap === 2 && navigatedAfterTaps === 0
      && afterLinkClick === 2 && navigated === 1
      && afterButtonTap === 2
      && openedPaths.slice(0, 2).every((path) => path === rowPaths[5])
      && everySheetReal && distinct && sheetsLeft === 0 && scrimsLeft === 0,
    detail: `tap on bare cell at x=${openBareX} opened ${afterBareTap}; tap on the link opened`
      + ` ${afterLinkTap - afterBareTap} more and navigated ${navigatedAfterTaps} time(s);`
      + ` a mouse click on the link opened ${afterLinkClick - afterLinkTap} more and navigated`
      + ` ${navigated - navigatedAfterTaps} time(s); a tap on the open button opened`
      + ` ${afterButtonTap - afterLinkClick} more, because the button owns that press;`
      + ` rows opened=${openedPaths.join(",") || "none"} (want ${rowPaths[5]} twice, then ${rowPaths[9]}).`
      + ` Each open built the shipped panel: ${openedSheets.length} sheet(s), first one held`
      + ` "${firstSheet ? firstSheet.held : "nothing"}" with title "${firstSheet ? firstSheet.title : ""}",`
      + ` ${firstSheet ? firstSheet.fields : 0} field row(s), box`
      + ` ${firstSheet ? firstSheet.width : 0}x${firstSheet ? firstSheet.height : 0}, bottom sheet=`
      + `${firstSheet ? firstSheet.isSheet : false}, on screen=${firstSheet ? firstSheet.onScreen : false};`
      + ` the control row opened "${otherSheet ? otherSheet.held : "nothing"}" titled`
      + ` "${otherSheet ? otherSheet.title : ""}", different from the first=${distinct};`
      + ` after closing, ${sheetsLeft} sheet(s) and ${scrimsLeft} scrim(s) remain`,
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
  // ── the same hit test, with the scrim told not to take pointers ──
  //
  // `012` recorded this control as "observed" once, in prose: `pointer-events=none ... resolves to
  // <td>`. That was honest when it was written and it is the weaker half of the criterion, because
  // a control observed once and written down cannot go red when the behaviour regresses — and going
  // red on a regression is the only thing a control is for.
  //
  // So it runs. Same panel, same cell, same `elementFromPoint`; the one thing that changes is the
  // option, and the result has to change with it. Registered on its own line so the run reports it
  // by name beside the case it defends, the way `010` registers its two.
  globalThis.__place.applySheetChrome(sheetPanel, false);
  document.querySelector(".db-mobile-sheet-scrim")?.remove();
  globalThis.__place.applySheetChrome(sheetPanel, true, { scrimCapturesPointer: false });
  const openScrim = document.body.querySelector(".db-mobile-sheet-scrim");
  const openStyle = openScrim ? getComputedStyle(openScrim) : null;
  const overCellOpen = document.elementFromPoint(
    Math.round(cellBox.left + cellBox.width / 2),
    Math.round(cellBox.top + cellBox.height / 2),
  );
  out.push({
    name: "control: the scrim check reacts when the scrim stops taking pointers",
    pass: Boolean(openScrim) && openStyle.pointerEvents === "none"
      && Boolean(overCellOpen) && Boolean(overCellOpen.closest("td")),
    detail: `with {scrimCapturesPointer: false} the backdrop is `
      + `${openScrim ? "present" : "absent"} at pointer-events=`
      + `${openStyle ? openStyle.pointerEvents : "n/a"}, and the same press resolves to `
      + `<${overCellOpen ? overCellOpen.tagName.toLowerCase() : "nothing"}`
      + `${overCellOpen && overCellOpen.className ? ` class="${overCellOpen.className}"` : ""}>. `
      + `The case above and this one are the same measurement with one option flipped, so a build `
      + `that ignored the option entirely would pass one and fail the other`,
  });

  globalThis.__place.applySheetChrome(sheetPanel, false);
  sheetPanel.remove();

  table.remove();
  return out;
}));

// ── every check above must have been watched failing ──
//
// `012-mobile-touch-semantics` asked for "every check watched failing first on a deliberately broken
// tree, with the failing number recorded", and for most of a year that was prose in a spec doc: seven
// checks had a control, the section grew to eleven, and nothing noticed. The two that were named as
// missing were found by reading the run against the doc — which is exactly the method that stops
// happening the next time someone is in a hurry.
//
// So the attribution is on the SECTION, not on each check. A check added to this section inherits the
// phase automatically and the run goes red until someone records the red they watched. Registering
// per-check would have let the next addition arrive unregistered, which is the failure being fixed.
const SURFACE_PHASE = "012-mobile-touch-semantics";
const phaseChecks = cellResults.map((r) => ({ ...r, phase: SURFACE_PHASE }));

/**
 * The failing number each check produced on a deliberately broken tree.
 *
 * Every entry is a red someone watched, quoted from the run that produced it — not a description of
 * a red that could be produced. The break is named too, because "it went red" is worth nothing
 * without saying what was broken to make it.
 */
const PHASE_CONTROLS = new Map([
  ["a table cell reads its gesture from the pointer event, not from the device",
    "with the reader consulting the device instead of the event: `after touch=mouse` (acceptance-criteria.md §4.1)"],
  ["a second tap picks one cell while a mouse still paints the range",
    "with the tap extending like a mouse: `16 cells, rows 2-9 x 2 columns` (§4.1)"],
  ["shift-extend still works at 390px with touch reported present",
    "with the guard keyed to the device rather than the event: shift+click collapses to 1 cell at 390px (§4.1)"],
  ["a tap edits its column and the main item opens the record, while a click does neither",
    "with the truth table pinned: rows disagree with their wanted action, printed inline as `WANT ...` (§4.1)"],
  ["the row's main item is the note name, or the first visible column when it is hidden",
    "with `isMainItemColumn` reduced to `colKey === TITLE_COLUMN_KEY`, the pre-fix answer: "
      + "`income in [income,expenses]=false WANT true`"],
  ["a tap anywhere in the title cell opens the record, and a click there still does not",
    "with the same press dispatched as a mouse: `tap=select-cell` (§4.1, AC-5)"],
  ["the shipped title-cell handler opens a real record sheet from a real tap, and leaves the mouse alone",
    "twice. With the opener replaced by the old push-to-array stub the routing half is unchanged and "
      + "the outcome half is empty: `first one held \"null\" with title \"\", 0 field row(s), box 0x0 "
      + "on screen=false`. With every open forced to row 5: `the control row opened \"note-5.md\" "
      + "titled \"34\", different from the first=false`"],
  ["every pixel of a table row belongs to the row it looks like it belongs to",
    "with a 44px band centred on the cell instead of anchored to it AND the cell's clip lifted: "
      + "`the cell owns 28px of the 34px row`, `the last pixel above the boundary is still this "
      + "row's=false`. The band alone is not enough — the cell clips its overflow, so the naive "
      + "fix is defeated by the surface before the check ever sees it, and only lifting both makes "
      + "the mis-anchoring reachable"],
  ["a held press still opens the row menu and a tap still does not",
    "with the delay removed: a 100ms press fires 1 long-press (§4.1, AC-7)"],
  ["the long-press row menu offers a rename, and pressing it reaches the shipped editor",
    "with the rename entry not built, the pre-fix menu: `3 menu entries [Open note, Duplicate record, "
      + "Delete \"36\"]; a rename entry is MISSING and pressing it renamed 0 row(s)`"],
  ["while a record sheet is open the backdrop takes the tap, not the cell under it",
    "with the backdrop's pointer-events at none: `pointer-events=none ... resolves to <td>` (§4.1, AC-6)"],
  ["control: the scrim check reacts when the scrim stops taking pointers",
    "this IS the red the row above was watched failing at, promoted from a one-off observation in "
      + "prose to a standing case. It fails on a build that ignores `scrimCapturesPointer`: the "
      + "opt-out then reports the modal value and the press still resolves to the scrim, so the "
      + "pair stops disagreeing and the default stops being a decision"],
]);

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
await sheetPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await sheetPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await sheetPhone.addScriptTag({ content: positionerJs });

const sheetResults = await section("the record sheet's own header", async () => {
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

  const measured = await sheetPhone.evaluate((titleCentre) => {
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

    // ── the title and its actions read as one row ──
    //
    // Found by reading the capture, then measured rather than argued. The header is a flex row at
    // `align-items: flex-start`, so a one-line title occupies its own line box while each action
    // occupies a 44px touch target beside it — and the glyphs end up on visibly different lines.
    // `flex-start` is the right anchor for a title that wraps, so the fix is not `center`: it is
    // that the title's own band matches the control's.
    const titleRect = title.getBoundingClientRect();
    const actionCentres = actions.map((el) => {
      const r = el.getBoundingClientRect();
      return Math.round(r.top + r.height / 2);
    });
    const titleMiddle = Math.round(titleRect.top + titleRect.height / 2);
    const worstOffset = actionCentres.length
      ? Math.max(...actionCentres.map((c) => Math.abs(c - titleMiddle)))
      : 999;
    out.push({
      name: "the sheet header's title and its actions sit on one line",
      // 2px, not 0: sub-pixel line boxes and an odd control height can land a centre half a pixel
      // out either way, and a check that demanded exact equality would fail on rounding.
      pass: actions.length >= 2 && worstOffset <= 2,
      detail: `title centre y=${titleMiddle} (box ${Math.round(titleRect.height)}px tall),`
        + ` action centres ${actionCentres.join(", ")}; worst offset ${worstOffset}px, want <= 2.`
        + ` The header anchors at flex-start so a wrapping title keeps its actions at the top,`
        + ` which is right — what has to match is the single-line band, not the alignment mode`,
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
    // up + down + 1, not + hb.height: the walk begins at the bar's centre and both arms already
    // cross the bar, so adding its height counted those pixels twice. This surface reported 35px on
    // that arithmetic and delivers 32px.
    const band = up + down + 1;
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
  measured.push({
    name: "a double-tap on the record sheet's title reaches the rename editor",
    pass: renames === 1,
    detail: `two taps at the title's centre opened ${renames} rename editor(s) (want 1)`
      + " — under the grab band this was 0, and every other rename entry point in the plugin is also"
      + " a double-click, so this was the whole of it on a phone",
  });
  return measured;
});
await sheetPhone.close();

// ───────────────────────────────────────────────────────────────────
// 5a2. THE DESKTOP RECORD PANEL'S FOUR FROZEN VALUES
// ───────────────────────────────────────────────────────────────────
//
// `010` reshaped the record row on the phone and claimed the desktop was untouched, with four
// numbers attached: row 26.84px, value right-aligned, 2px between rows, and no divider. Three of the
// four were measured nowhere in the run and the fourth appeared only inside another phase's detail
// line. The stylesheet does corroborate the SCOPING — every phone rule for this surface is written
// under `.db-record-detail-panel.db-mobile-bottom-sheet` — but scoping proves the phone rules cannot
// match a desktop panel. It does not prove the four values, because row height and the gap between
// rows are computed rather than declared.
//
// So the desktop panel is built through the shipped opener at 1440x900 and the four are read off it.
// `--background-modifier-border` is supplied for the same reason the phone body supplies it: the
// plugin's hairline tokens are `color-mix` over Obsidian's variable, so with the host silent every
// border computes as `0px none` and a "no divider" check reports a pass against a stylesheet that
// declares one. That trap is the whole reason this criterion's fourth clause needs a real host value.

const desktopPanel = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
await desktopPanel.setContent(page_html.replace(
  "<body>",
  '<body style="--background-modifier-border: #333333">',
));
await desktopPanel.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await desktopPanel.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await desktopPanel.addScriptTag({ content: positionerJs });

const desktopPanelResults = await section("the desktop record panel's frozen values", () => desktopPanel.evaluate(() => {
  const out = [];
  const { openRecordDetailPanel } = globalThis.__place;
  const host = document.querySelector(".note-database-container");
  const anchor = host.createDiv({ cls: "anchor" });
  anchor.setCssProps({ position: "absolute", left: "80px", top: "80px" });
  openRecordDetailPanel({
    anchorEl: anchor,
    host,
    row: {
      file: { path: "37.md", basename: "Figma", name: "37.md" },
      frontmatter: { cost: 18.75, billing: "Yearly", payment: "Revolut", category: "Design" },
      computed: {},
    },
    columns: [
      { key: "file.name", label: "Name", type: "text" },
      { key: "cost", label: "Cost", type: "number" },
      { key: "billing", label: "Billing", type: "text" },
      { key: "payment", label: "Payment", type: "text" },
      { key: "category", label: "Category", type: "text" },
    ],
    config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
    app: {},
    actions: { editCell: () => {}, openRow: () => {}, editFileName: () => {}, isReadOnly: false },
  });

  const panel = document.querySelector(".db-record-detail-panel");
  const isSheet = panel ? panel.classList.contains("db-mobile-bottom-sheet") : true;
  const rows = panel ? [...panel.querySelectorAll(".db-record-detail-field")] : [];
  const boxes = rows.map((row) => row.getBoundingClientRect());
  const heights = boxes.map((b) => +b.height.toFixed(2));
  // The gap between rows, measured as the space between one row's bottom and the next row's top
  // rather than read off `row-gap`. A declared gap that a margin or a border eats is still a
  // declared gap; what the reader sees is this number.
  const gaps = boxes.slice(1).map((b, i) => +(b.top - boxes[i].bottom).toFixed(2));
  const borders = rows.map((row) => {
    const cs = getComputedStyle(row);
    return `${cs.borderBottomWidth} ${cs.borderBottomStyle}`;
  });
  const withDivider = borders.filter((b) => !b.startsWith("0px")).length;
  // Right-aligned: the value box ends where the row's content box ends. Read against the row's own
  // padding rather than its border box, because the padding is not the alignment.
  const alignment = rows.map((row) => {
    const value = row.querySelector(".db-board-card-value");
    if (!value) return null;
    const rowRect = row.getBoundingClientRect();
    const valueRect = value.getBoundingClientRect();
    const padRight = parseFloat(getComputedStyle(row).paddingRight) || 0;
    return +(rowRect.right - padRight - valueRect.right).toFixed(2);
  }).filter((v) => v !== null);
  const worstAlignment = alignment.length ? Math.max(...alignment.map((v) => Math.abs(v))) : 999;

  const uniformHeight = heights.length > 0 && heights.every((h) => Math.abs(h - heights[0]) <= 0.02);
  out.push({
    name: "the desktop record panel keeps the four values 010 froze",
    pass: !isSheet && rows.length >= 4 && uniformHeight
      && Math.abs(heights[0] - 26.84) <= 0.5
      && gaps.every((g) => Math.abs(g - 2) <= 0.5)
      && withDivider === 0
      && worstAlignment <= 1,
    detail: `${rows.length} row(s) on a desktop panel (bottom sheet=${isSheet}):`
      + ` heights ${[...new Set(heights)].join(", ")}px (want 26.84, uniform=${uniformHeight});`
      + ` gaps ${[...new Set(gaps)].join(", ")}px (want 2);`
      + ` ${withDivider} row(s) carry a bottom border, borders read ${[...new Set(borders)].join(" | ")}`
      + ` against --background-modifier-border supplied, so "0px none" here is the stylesheet's`
      + ` answer rather than an absent host variable;`
      + ` the value box ends within ${worstAlignment}px of the row's content right edge`,
  });
  document.querySelectorAll(".db-record-detail-panel").forEach((el) => el.remove());
  anchor.remove();
  return out;
}));
await desktopPanel.close();

// ───────────────────────────────────────────────────────────────────
// 5a3. THE SHEET'S SEMANTIC IDENTITY AND ITS RESOURCE OWNERSHIP
// ───────────────────────────────────────────────────────────────────
//
// Two of the five stateful dimensions had no measurement on this surface at all. Every check here
// read a geometry number, which covers state only by accident: a panel can be the right size and
// still be showing the wrong record, and it can look correct while leaving a viewport subscription
// alive that silently moves the NEXT sheet.
//
// SEMANTIC IDENTITY is not node identity. A refresh empties and rebuilds the panel, so every node is
// new by construction — asserting a surviving node would assert the opposite of what happens. What
// must survive is the mapping: the row that means "Income" is still found BY ITS COLUMN KEY, still
// belongs to the record the panel was opened on, and now shows that record's current value.
//
// RESOURCE OWNERSHIP is counted rather than inferred. The inset is written by a subscription, so a
// leaked one is invisible until the next sheet moves for no reason.

const statePhone = await browser.newPage({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
await statePhone.setContent(page_html.replace("<body>", phoneBody));
await statePhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await statePhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await statePhone.addScriptTag({ content: positionerJs });

const stateResults = await section("the record sheet's identity and its subscriptions", () => statePhone.evaluate(async () => {
  const out = [];
  const {
    openRecordDetailPanel, closeRecordDetailPanel, getOpenRecordDetailPath, refreshRecordDetailPanel,
  } = globalThis.__place;
  const host = document.querySelector(".note-database-container");
  const anchor = host.createDiv({ cls: "anchor" });
  anchor.setCssProps({ position: "absolute", left: "40px", top: "40px" });

  const columns = [
    { key: "file.name", label: "Name", type: "text" },
    { key: "income", label: "Income", type: "number" },
    { key: "expenses", label: "Expenses", type: "number" },
  ];
  const config = { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" };
  const actions = { editCell: () => {}, openRow: () => {}, editFileName: () => {}, isReadOnly: false };
  const recordA = (income) => ({
    file: { path: "A.md", basename: "Record A", name: "A.md" },
    frontmatter: { income, expenses: 7 },
    computed: {},
  });
  const recordB = {
    file: { path: "B.md", basename: "Record B", name: "B.md" },
    frontmatter: { income: 999, expenses: 1 },
    computed: {},
  };

  // ── the subscription count, taken around the whole cycle ──
  //
  // Wrapped before anything opens, so what is counted is what this surface adds and removes rather
  // than whatever the page was already carrying.
  const live = new Map();
  const realAdd = window.visualViewport.addEventListener.bind(window.visualViewport);
  const realRemove = window.visualViewport.removeEventListener.bind(window.visualViewport);
  window.visualViewport.addEventListener = (type, fn, opts) => {
    live.set(fn, (live.get(fn) || 0) + 1);
    return realAdd(type, fn, opts);
  };
  window.visualViewport.removeEventListener = (type, fn, opts) => {
    const held = live.get(fn) || 0;
    if (held <= 1) live.delete(fn); else live.set(fn, held - 1);
    return realRemove(type, fn, opts);
  };
  const outstanding = () => [...live.values()].reduce((a, b) => a + b, 0);
  const before = outstanding();

  openRecordDetailPanel({ anchorEl: anchor, host, row: recordA(100), columns, config, app: {}, actions });
  const openedPath = getOpenRecordDetailPath();
  const fieldFor = (key) => document.querySelector(
    `.db-record-detail-panel .db-record-detail-field[data-note-database-column-key="${key}"]`);
  const incomeBefore = fieldFor("income");
  const textBefore = incomeBefore ? incomeBefore.textContent : "";

  refreshRecordDetailPanel(recordA(250));
  const incomeAfter = fieldFor("income");
  const textAfter = incomeAfter ? incomeAfter.textContent : "";
  const stillSameRecord = getOpenRecordDetailPath();
  // The panel was rebuilt, so the node MUST have changed. If it had not, the refresh did nothing and
  // "the mapping survived" would be a statement about a panel that never moved.
  const nodeWasRebuilt = Boolean(incomeBefore) && Boolean(incomeAfter) && incomeBefore !== incomeAfter;

  out.push({
    name: "a refreshed sheet still maps its rows to the record it was opened on",
    pass: openedPath === "A.md" && stillSameRecord === "A.md"
      && Boolean(incomeAfter) && nodeWasRebuilt
      && textBefore.includes("100") && textAfter.includes("250"),
    detail: `opened on "${openedPath}", after a refresh the panel still holds "${stillSameRecord}";`
      + ` the row is found by its column key rather than by index, its node was rebuilt=${nodeWasRebuilt}`
      + ` (a surviving node would mean the refresh did nothing), and its text went`
      + ` "${textBefore.trim()}" -> "${textAfter.trim()}"`,
  });

  // The control for identity: a refresh naming a DIFFERENT record must not silently re-point the
  // panel. Without this, "the mapping survived" is satisfied by a panel that shows whatever it is
  // last handed.
  refreshRecordDetailPanel(recordB);
  const afterForeign = getOpenRecordDetailPath();
  const panelAfterForeign = document.querySelectorAll(".db-record-detail-panel").length;
  out.push({
    name: "CONTROL a refresh naming another record closes the sheet rather than re-pointing it",
    pass: afterForeign === null && panelAfterForeign === 0,
    detail: `refreshed with ${recordB.file.path} while open on A.md: the panel now holds`
      + ` ${afterForeign === null ? "nothing" : `"${afterForeign}"`} and ${panelAfterForeign} panel(s)`
      + ` remain. Re-pointing would show B's values under A's identity`,
  });

  // ── resource ownership ──
  //
  // One full cycle: open, drive a keyboard open and closed, close. Anything still subscribed after
  // that is a leak, and a leak here writes the inset for the NEXT sheet.
  openRecordDetailPanel({ anchorEl: anchor, host, row: recordA(100), columns, config, app: {}, actions });
  const whileOpen = outstanding();
  document.documentElement.style.setProperty("--keyboard-height", "336px");
  window.visualViewport.dispatchEvent(new Event("resize"));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const liftedBottom = document.querySelector(".db-record-detail-panel")?.style
    .getPropertyValue("--db-mobile-sheet-bottom") || "(unset)";
  document.documentElement.style.removeProperty("--keyboard-height");
  window.visualViewport.dispatchEvent(new Event("resize"));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  closeRecordDetailPanel();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const after = outstanding();
  const leftBehind = document.querySelectorAll(".db-record-detail-panel, .db-mobile-sheet-scrim").length;

  out.push({
    name: "a closed sheet leaves no viewport subscription and no node behind",
    pass: after === before && whileOpen > before && leftBehind === 0,
    detail: `visualViewport listeners: ${before} before, ${whileOpen} while the sheet was open,`
      + ` ${after} after one keyboard cycle and a close. The sheet lifted to`
      + ` --db-mobile-sheet-bottom=${liftedBottom} while the keyboard was declared (harness-supplied `
      + `--keyboard-height=336px; a device where the host publishes nothing is covered by `
      + `"the sheet clears a keyboard no host reported").`
      + ` ${leftBehind} panel or scrim node(s) remain. The inset is written by a subscription, so a`
      + ` leaked one silently moves the next sheet rather than this one`,
  });

  window.visualViewport.addEventListener = realAdd;
  window.visualViewport.removeEventListener = realRemove;
  anchor.remove();
  return out;
}));
await statePhone.close();

// ───────────────────────────────────────────────────────────────────
// 5a4. EVERY SHEET ANSWERS THE KEYBOARD THE SAME WAY
// ───────────────────────────────────────────────────────────────────
//
// The panel path registers a reposition loop; `owned-menu.ts` calls `placeSheet` once at `showAt`
// and contains no `visualViewport` listener, no `resize` listener and no `requestAnimationFrame` at
// all. So whatever the keyboard inset was at open time is the number a menu sheet keeps for its
// whole life, and every existing check measures a sheet at rest — none of them can see it.
//
// The invariant is stated across the two surfaces rather than about one of them. A check that only
// asserted the menu's behaviour would need a number to compare against, and the honest number is
// whatever the panel does: two sheets on one screen answering the same signal differently is the
// defect, whichever of them is right.

const keyboardPhone = await browser.newPage({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
await keyboardPhone.setContent(page_html.replace("<body>", phoneBody));
await keyboardPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await keyboardPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await keyboardPhone.addScriptTag({ content: positionerJs });

const keyboardParityResults = await section("both sheet families under one keyboard", () => keyboardPhone.evaluate(async () => {
  const out = [];
  const P = globalThis.__p;
  const { openRecordDetailPanel, closeRecordDetailPanel } = globalThis.__place;
  const host = document.querySelector(".note-database-container");
  const KEYBOARD = 336;
  const tick = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  // The same signal both surfaces are supposed to read, delivered the way a host delivers it.
  const openKeyboard = async () => {
    document.documentElement.style.setProperty("--keyboard-height", `${KEYBOARD}px`);
    window.dispatchEvent(new Event("resize"));
    window.visualViewport.dispatchEvent(new Event("resize"));
    await tick();
  };
  const closeKeyboard = async () => {
    document.documentElement.style.removeProperty("--keyboard-height");
    window.dispatchEvent(new Event("resize"));
    window.visualViewport.dispatchEvent(new Event("resize"));
    await tick();
  };
  const readSheet = (el) => ({
    lever: el.style.getPropertyValue("--db-mobile-sheet-bottom") || "(unset)",
    bottom: Math.round(el.getBoundingClientRect().bottom),
  });

  // ── the menu sheet ──
  const menu = P.createOwnedMenu(document);
  for (let i = 0; i < 6; i += 1) menu.addRow({ title: `Row ${i}`, onClick: () => undefined });
  menu.showAt({ x: 40, y: 200 });
  const menuEl = menu.el || menu.dom || menu.containerEl;
  const menuAtRest = readSheet(menuEl);
  await openKeyboard();
  const menuLifted = readSheet(menuEl);
  await closeKeyboard();
  const menuBack = readSheet(menuEl);
  menu.close();
  await tick();

  // ── the panel sheet, the same cycle ──
  const anchor = host.createDiv({ cls: "anchor" });
  anchor.setCssProps({ position: "absolute", left: "40px", top: "40px" });
  openRecordDetailPanel({
    anchorEl: anchor,
    host,
    row: { file: { path: "K.md", basename: "K", name: "K.md" }, frontmatter: { income: 1 }, computed: {} },
    columns: [{ key: "file.name", label: "Name", type: "text" }, { key: "income", label: "Income", type: "number" }],
    config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
    app: {},
    actions: { editCell: () => {}, openRow: () => {}, editFileName: () => {}, isReadOnly: false },
  });
  const panelEl = document.querySelector(".db-record-detail-panel");
  const panelAtRest = readSheet(panelEl);
  await openKeyboard();
  const panelLifted = readSheet(panelEl);
  await closeKeyboard();
  const panelBack = readSheet(panelEl);
  closeRecordDetailPanel();
  anchor.remove();

  const lifted = (before, after) => after.bottom < before.bottom - 1;
  out.push({
    name: "a menu sheet answers the keyboard the way a panel sheet does",
    pass: lifted(panelAtRest, panelLifted) && lifted(menuAtRest, menuLifted)
      && Math.abs(menuLifted.bottom - panelLifted.bottom) <= 1
      && Math.abs(menuBack.bottom - menuAtRest.bottom) <= 1
      && Math.abs(panelBack.bottom - panelAtRest.bottom) <= 1,
    detail: `under one declared ${KEYBOARD}px keyboard (harness-supplied --keyboard-height=${KEYBOARD}px; `
      + `a device where the host publishes nothing is covered by "the sheet clears a keyboard `
      + `no host reported") — menu sheet bottom`
      + ` ${menuAtRest.bottom} -> ${menuLifted.bottom} -> ${menuBack.bottom} (lever`
      + ` ${menuAtRest.lever} -> ${menuLifted.lever} -> ${menuBack.lever}); panel sheet bottom`
      + ` ${panelAtRest.bottom} -> ${panelLifted.bottom} -> ${panelBack.bottom} (lever`
      + ` ${panelAtRest.lever} -> ${panelLifted.lever} -> ${panelBack.lever}).`
      + ` Stated across the two surfaces rather than about one: two sheets on one screen answering`
      + ` the same signal differently is the defect, whichever of them is right`,
  });

  // ── resource ownership, over ten cycles rather than one ──
  //
  // One open and close proves the happy path. Ten proves nothing accumulates, which is the failure
  // mode a dismissal owner actually has: a leaked capture-phase `pointerdown` is a second owner, and
  // a second owner closes the menu on a press the first one meant to deliver. The subscription that
  // keeps a sheet placed is counted here too, because it was added in the same change as the check
  // above and a fix that leaks is not a fix.
  const docLive = new Map();
  const realDocAdd = document.addEventListener.bind(document);
  const realDocRemove = document.removeEventListener.bind(document);
  const key = (type, fn, opts) => `${type}|${opts === true || (opts && opts.capture) ? "capture" : "bubble"}`;
  document.addEventListener = (type, fn, opts) => {
    if (type === "pointerdown") docLive.set(fn, key(type, fn, opts));
    return realDocAdd(type, fn, opts);
  };
  document.removeEventListener = (type, fn, opts) => {
    if (type === "pointerdown") docLive.delete(fn);
    return realDocRemove(type, fn, opts);
  };
  const vvLive = new Set();
  const realVvAdd = window.visualViewport.addEventListener.bind(window.visualViewport);
  const realVvRemove = window.visualViewport.removeEventListener.bind(window.visualViewport);
  window.visualViewport.addEventListener = (type, fn, opts) => { vvLive.add(fn); return realVvAdd(type, fn, opts); };
  window.visualViewport.removeEventListener = (type, fn, opts) => { vvLive.delete(fn); return realVvRemove(type, fn, opts); };

  let scrimsWhileOpen = new Set();
  for (let i = 0; i < 10; i += 1) {
    const m = P.createOwnedMenu(document);
    for (let r = 0; r < 4; r += 1) m.addRow({ title: `Row ${r}`, onClick: () => undefined });
    m.showAt({ x: 40, y: 200 });
    scrimsWhileOpen.add(document.querySelectorAll(".db-mobile-sheet-scrim").length);
    m.close();
    await tick();
  }
  const capturesLeft = [...docLive.values()].filter((k) => k.endsWith("capture")).length;
  const viewportLeft = vvLive.size;
  const scrimsLeft = document.querySelectorAll(".db-mobile-sheet-scrim").length;
  const sheetsLeft = document.querySelectorAll(".db-mobile-bottom-sheet").length;
  document.addEventListener = realDocAdd;
  document.removeEventListener = realDocRemove;
  window.visualViewport.addEventListener = realVvAdd;
  window.visualViewport.removeEventListener = realVvRemove;

  // ── A PANEL OF FORTY PROPERTIES STILL FITS THE SCREEN ──
  //
  // `002` states the cap as `min(560px, 70% of the visible bounds)` at 40 properties, and nothing
  // asserted it at that count — the fixtures draw a handful of rows, and a handful fits any cap.
  //
  // 70% of the VISIBLE BOUNDS, not of the viewport: the two are the same number on a desktop and
  // differ by the navbar and the safe-area inset on a phone, which is the surface the criterion was
  // written about. The shipped rule caps at `min(560px, 100vh - 140px)`, which is the viewport, so
  // the two agree on a desktop and can disagree here. Measuring against the criterion's own terms is
  // the point; agreeing with the stylesheet would be reading the rule back to itself.
  // The row is built with the children the shipped one has, not with a bare span. A first version
  // put a text node in each row and measured 40 rows at 380px — 9px a row, a height no property
  // panel has ever had — and passed comfortably under a cap it was never near. That is the "the
  // harness made the content small" failure these packets' own audits keep naming, reproduced while
  // writing a check to answer one of them.
  const propsPanel = host.createDiv({ cls: "db-column-manager db-surface" });
  for (let i = 0; i < 40; i += 1) {
    const row = propsPanel.createDiv({ cls: "db-column-manager-row" });
    row.createSpan({ cls: "db-column-drag", text: "⋮⋮" });
    const box = row.createEl("input", { cls: "db-checkbox db-checkbox-field" });
    box.type = "checkbox";
    row.createSpan({ cls: "db-column-type", text: "T" });
    row.createSpan({ cls: "db-column-name", text: `Property ${i}` });
    for (const icon of ["wrap", "edit", "delete"]) {
      row.createEl("button", { cls: "clickable-icon", text: icon[0] });
    }
  }
  const propsRect = propsPanel.getBoundingClientRect();
  const propsStyle = getComputedStyle(propsPanel);
  const propsDeclaredCap = propsStyle.maxHeight;
  const propsOverflow = propsStyle.overflowY;
  const propsScroll = propsPanel.scrollHeight;
  const visible = P.getVisiblePopoverBounds(null);
  const propsCap = Math.min(560, visible.height * 0.7);
  propsPanel.remove();

  out.push({
    name: "a forty-property panel stays inside the cap its own criterion states",
    pass: propsRect.height <= propsCap + 1,
    detail: `40 rows measure ${Math.round(propsRect.height)}px against a cap of`
      + ` ${Math.round(propsCap)} = min(560, 70% of the ${Math.round(visible.height)}px visible`
      + ` bounds). The shipped rule caps at min(560px, 100vh - 140px) — the VIEWPORT — so on a`
      + ` desktop the two agree and on a phone they differ by the navbar and the safe-area inset,`
      + ` which is the surface this criterion was written about.`
      + ` The panel declares max-height ${propsDeclaredCap} and overflow-y ${propsOverflow}, and its`
      + ` content wants ${propsScroll}px — so what bounds it here is`
      + ` ${propsScroll > propsRect.height + 1 ? "the cap, with the rest scrolling" : "its own content"},`
      + ` which is the distinction a height alone cannot report`,
  });

  // ── A SHEET IS A SURFACE, NOT A STRIP ──
  //
  // `006` asks that the action never produce a sub-half-height panel, and nothing asserted the
  // floor — the cap was asserted from the start, the minimum never. A two-field record measured
  // 189px on an 844px screen, 22%, which is a sliver a thumb has to aim at.
  //
  // Both ends in one check, deliberately. A floor alone passes on a sheet pinned to the full screen,
  // which is the opposite defect and the one `003`'s cap exists to prevent; a cap alone is what has
  // been here all along. The sparse record is the case that matters — a full one clears any floor by
  // having content — so the check opens the emptiest record the panel will build.
  const floorAnchor = host.createDiv({ cls: "anchor" });
  floorAnchor.setCssProps({ position: "absolute", left: "40px", top: "40px" });
  openRecordDetailPanel({
    anchorEl: floorAnchor,
    host,
    row: { file: { path: "thin.md", basename: "Thin", name: "thin.md" }, frontmatter: { one: 1 }, computed: {} },
    columns: [{ key: "file.name", label: "Name", type: "text" }, { key: "one", label: "One", type: "number" }],
    config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
    app: {},
    actions: { editCell: () => {}, openRow: () => {}, editFileName: () => {}, isReadOnly: false },
  });
  const thin = document.querySelector(".db-record-detail-panel");
  const thinRect = thin.getBoundingClientRect();
  const thinFields = thin.querySelectorAll(".db-record-detail-field").length;
  const cap = window.innerHeight * 0.9;
  closeRecordDetailPanel();
  floorAnchor.remove();
  await tick();

  out.push({
    name: "a record sheet on a phone is at least half the screen and never more than the cap",
    pass: thinRect.height >= window.innerHeight / 2 - 1 && thinRect.height <= cap + 1,
    detail: `the emptiest record the panel builds — ${thinFields} field row(s) — measures`
      + ` ${Math.round(thinRect.height)}px on a ${window.innerHeight}px screen, against a floor of`
      + ` ${Math.round(window.innerHeight / 2)} and the 90svh cap at ${Math.round(cap)}. The same`
      + ` record measures 145px with the floor removed — 17% of the screen, a strip rather than a`
      + ` surface; a two-field one measured 189px, which is where this started.`
      + ` Both ends are asserted here because a floor alone passes on a sheet pinned to the full`
      + ` screen, which is the opposite defect and the one the cap exists to prevent`,
  });

  // ── TWO SURFACES OF THE SAME ROLE AGREE, AS A SET ──
  //
  // `001` asks that any two surfaces of the same role carry identical computed padding, radius,
  // shadow, row height and font-size — set equality, not a pairwise spot check. Nothing asserted it,
  // and the shape of the claim is why: a spot check between two named surfaces passes while a third
  // drifts, and there are eight panels sharing one base rule.
  //
  // Grouped by ROLE rather than by class, and compared as a set, so a surface that leaves the family
  // shows up as a second value rather than as a check nobody wrote for it. The same shape as the
  // checkbox census next door, which found its answer needed a pointer-mode axis before it was true.
  //
  // THE AUDIT'S EXPOSURE IS REAL AND IS NOT CURED HERE. `createMenuRow` builds a `<button>`, and
  // `app.css` declares display, align-items, padding, border-radius, height and font-size on every
  // bare button — none of which this page loads outside HOST_BARE_CONTROLS. So this says the plugin
  // gives one role one set of values; it cannot say what a host does to them. That is stated rather
  // than left for a reader to discover, and it is why the row it answers keeps its caveat.
  const surfaceSignature = (el) => {
    const cs = getComputedStyle(el);
    return [cs.padding, cs.borderRadius, cs.boxShadow, cs.fontSize, cs.borderWidth].join(" | ");
  };
  const roleFamilies = {
    panel: ["db-filter-panel", "db-view-config-panel", "db-column-manager", "db-group-popover",
      "db-export-popover", "db-chart-options-popover"],
    "menu-row": [],
  };
  const panelValues = new Map();
  for (const cls of roleFamilies.panel) {
    const el = host.createDiv({ cls: `${cls} db-surface` });
    el.createDiv({ cls: "db-panel-header" }).createDiv({ cls: "db-panel-title", text: "T" });
    panelValues.set(cls, surfaceSignature(el));
    el.remove();
  }
  // A menu row, built by the shipped `createMenuRow` in each container that hosts one.
  const rowHosts = [
    ["owned-menu", () => {
      const menu = P.createOwnedMenu(document);
      menu.showAt({ x: 20, y: 20 });
      return { el: menu.el || menu.dom || menu.containerEl, done: () => menu.close() };
    }],
    ["panel-sheet", () => {
      const el = document.body.createDiv({ cls: "db-record-detail-panel" });
      P.applySheetChrome ? undefined : undefined;
      globalThis.__a.applySheetChrome(el, true);
      return { el, done: () => { globalThis.__a.applySheetChrome(el, false); el.remove(); } };
    }],
    ["filter-panel", () => {
      const el = host.createDiv({ cls: "db-filter-panel db-surface" });
      return { el, done: () => el.remove() };
    }],
  ];
  const rowValues = new Map();
  for (const [name, build] of rowHosts) {
    const { el, done } = build();
    const row = P.createMenuRow(el, { label: "Duplicate", icon: "copy" }).row;
    const cs = getComputedStyle(row);
    rowValues.set(name, [cs.minHeight, cs.padding, cs.fontSize,
      Math.round(row.getBoundingClientRect().height)].join(" | "));
    done();
  }
  await tick();

  const panelSet = new Set(panelValues.values());
  const rowSet = new Set(rowValues.values());
  out.push({
    name: "two surfaces of the same role carry the same padding, radius, shadow and type",
    pass: panelValues.size >= 4 && panelSet.size === 1 && rowValues.size >= 3 && rowSet.size === 1,
    detail: `${panelValues.size} panel surfaces resolve ${panelSet.size} distinct signature(s)`
      + ` [${[...panelSet].join("  //  ")}]; ${rowValues.size} containers give a shipped menu row`
      + ` ${rowSet.size} distinct signature(s) [${[...rowSet].join("  //  ")}].`
      + (panelSet.size > 1 || rowSet.size > 1
        ? ` Split: ${[...panelValues].concat([...rowValues]).map(([k, v]) => `${k}=${v}`).join(" ; ")}`
        : " One role, one set of values.")
      + ` What this cannot say is what a HOST does to them: createMenuRow builds a <button>, and`
      + ` app.css declares padding, radius, height and font-size on every bare button, which this`
      + ` page does not load outside HOST_BARE_CONTROLS`,
  });

  // ── NO SURFACE DEPENDS ON AN UNDECLARED PIGGYBACK ──
  //
  // `001` asks that removing any one class from a panel change a measured value. It is the strongest
  // row in that packet and it had nothing behind it, which is the usual fate of a criterion phrased
  // as a universal: it is easy to write and needs an ablation per class to answer.
  //
  // What it is really asking is whether a surface's appearance is DECLARED by the classes it
  // carries, or borrowed from one it happens to sit inside. A class that changes nothing when
  // removed is either dead — and will be deleted by someone tidying up, taking a rule with it — or
  // its work is being done by an ancestor, which is the piggyback: the surface looks right here and
  // wrong the moment it is portalled somewhere else. This program has already paid for that twice,
  // in the checkbox that borrowed its appearance from an ancestor class and in the menu row that
  // only laid out inside the owned menu's shell.
  //
  // The signature is the box plus the properties a panel is made of. Removing a class and measuring
  // nothing is the failure; removing it and measuring a change is the class earning its place.
  // A class carried for the HOST's stylesheet cannot move anything here, and that is a fact about
  // the harness rather than about the class. Declared by name with its reason, the way the
  // touch-target census declares its exempt controls — a predicate wide enough to hide these would
  // hide the next dead class with them.
  const HOST_OWNED_CLASSES = {
    "db-menu": "Obsidian's own menu class, carried so the host's app.css reaches the surface;"
      + " the harness does not load app.css, so nothing it declares can move here",
    // These two are the entrance, and an entrance has no resting value to move. The page runs with
    // `reducedMotion: reduce`, so the surface is already at rest when this measures it — which is
    // the correct state to ablate a LAYOUT class in and the wrong one to ablate a TRANSITION class
    // in. They are covered where their work happens: the motion-allowed section asserts the sheet
    // travels and settles, and its reduced-motion counterpart asserts it lands at rest with nothing
    // running. Declaring them here rather than widening this check to run animations keeps one
    // question per check.
    "db-overlay-enter": "the entrance class; its work is the transition, and this measures a surface"
      + " already at rest under reducedMotion. Covered by the two sheet-entrance sections",
    "is-visible": "the entrance's end state; same reason — at rest it is the state, not a change to"
      + " it, and the transition it completes is asserted by the entrance sections",
  };
  const signOf = (el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return [
      Math.round(r.width), Math.round(r.height), cs.display, cs.position, cs.padding,
      cs.borderRadius, cs.backgroundColor, cs.boxShadow, cs.fontSize, cs.maxHeight, cs.overflowY,
      // State and animation classes do their work here rather than in the box, and a signature
      // without them reported three of them dead.
      cs.opacity, cs.visibility, cs.transform, cs.color, cs.zIndex, cs.pointerEvents,
    ].join("|");
  };
  const ablateAt = (el) => {
    const base = signOf(el);
    const inert = [];
    for (const cls of [...el.classList]) {
      el.classList.remove(cls);
      const moved = signOf(el) !== base;
      el.classList.add(cls);
      if (!moved) inert.push(cls);
    }
    return { classes: [...el.classList], inert, restored: signOf(el) === base };
  };

  const ablationMenu = P.createOwnedMenu(document);
  for (let i = 0; i < 6; i += 1) ablationMenu.addRow({ title: `Row ${i}`, onClick: () => undefined });
  ablationMenu.showAt({ x: 40, y: 200 });
  const menuAblation = ablateAt(ablationMenu.el || ablationMenu.dom || ablationMenu.containerEl);
  ablationMenu.close();
  await tick();

  // TWO MOUNT POINTS, and a class earns its place by moving something at EITHER. `db-surface` is the
  // token-root marker: inside the container the tokens already resolve, so removing it changes
  // nothing and it reads dead. On the body — where the panels that need it actually go — it is the
  // only thing making them resolve at all, which `replay` has recorded since `000`. A one-position
  // ablation would have called the marker dead and invited its deletion.
  const buildPanel = (parent) => {
    const el = parent.createDiv({ cls: "db-filter-panel db-surface" });
    el.createDiv({ cls: "db-panel-header" }).createDiv({ cls: "db-panel-title", text: "Filter" });
    for (let i = 0; i < 3; i += 1) el.createDiv({ cls: "db-panel-row", text: `Rule ${i}` });
    return el;
  };
  const inContainer = buildPanel(host);
  const containerAblation = ablateAt(inContainer);
  inContainer.remove();
  const onBody = buildPanel(document.body);
  const bodyAblation = ablateAt(onBody);
  onBody.remove();

  const panelAblation = {
    classes: containerAblation.classes,
    // Dead only if it moved nothing at BOTH mount points.
    inert: containerAblation.inert.filter((c) => bodyAblation.inert.includes(c)),
    restored: containerAblation.restored && bodyAblation.restored,
  };
  const inertAll = [
    ...menuAblation.inert.map((c) => `owned-menu .${c}`),
    ...panelAblation.inert.map((c) => `filter-panel .${c}`),
  ].filter((entry) => !Object.keys(HOST_OWNED_CLASSES).some((c) => entry.endsWith(`.${c}`)));
  const declaredInert = [
    ...menuAblation.inert.map((c) => `owned-menu .${c}`),
    ...panelAblation.inert.map((c) => `filter-panel .${c}`),
  ].filter((entry) => Object.keys(HOST_OWNED_CLASSES).some((c) => entry.endsWith(`.${c}`)));
  out.push({
    name: "removing any one class from a panel changes a measured value",
    pass: menuAblation.classes.length >= 2 && panelAblation.classes.length >= 2
      && inertAll.length === 0 && menuAblation.restored && panelAblation.restored,
    detail: `owned menu carries [${menuAblation.classes.join(", ")}] and the filter panel`
      + ` [${panelAblation.classes.join(", ")}]; each class was removed on its own and the surface`
      + ` re-measured across box, display, position, padding, radius, background, shadow, font-size,`
      + ` max-height, overflow, opacity, visibility, transform, colour, z-index and pointer-events,`
      + ` at two mount points — inside the container and on the body.`
      + (declaredInert.length ? ` Declared inert: ${declaredInert.join(", ")}.` : "")
      + (inertAll.length
        ? ` ${inertAll.length} changed nothing: ${inertAll.join(", ")} — either dead, and the next`
          + ` tidy-up takes a rule with it, or its work is being done by an ancestor, which is the`
          + ` piggyback: right here and wrong the moment the surface is portalled`
        : " Every class moved something, so none of the appearance is borrowed from an ancestor.")
      + ` Both surfaces restored to their original signature=${menuAblation.restored && panelAblation.restored}`,
  });

  // ── THE GATE 003 WROTE FOR ITSELF, and never ran ──
  //
  // Its plan says it plainly: "Stage 1 is a gate, not a task. Until removing the navbar from the
  // harness moves an asserted number by more than the 1.35px fallback artefact, no later claim in
  // this spec means anything." Two of that packet's rows are open precisely because nobody could say
  // whether its navbar was load-bearing or scenery — a hand-written div with no `app.css` rule and
  // no stacking context, which a body portal beats almost by default.
  //
  // It is load-bearing, and by a margin nothing could mistake for noise. `getVisiblePopoverBounds`
  // reads the navbar's measured height and falls back to a hardcoded 50 when there is none, so a
  // 72px navbar and its absence are 22px apart — sixteen times the artefact the gate names.
  //
  // The fallback is why the number has to be read rather than assumed: removing the navbar does not
  // give the surface the whole screen, it gives it 50px of guessed chrome instead of 72px of
  // measured chrome. A check written against "no navbar means no inset" would report the opposite
  // sign and pass on a positioner that ignored the element entirely.
  //
  // NOT REDUNDANT WITH ITS NEIGHBOUR, and the difference is the whole reason to keep both. The
  // earlier check asserts `bounds.bottom === viewport - navbar - inset`, which TRANSCRIBES the
  // positioner's arithmetic into the harness — and this packet's own plan says a later phase deletes
  // that subtraction outright, because the sheet is supposed to COVER the navbar rather than avoid
  // it. On the day that lands, the transcription goes red for an intended change and the obvious
  // repair is to copy the new formula across, at which point it stops discriminating. This asks only
  // whether the element is read at all, which stays the right question on both sides of that change.
  const withNavbar = P.getVisiblePopoverBounds(null);
  const navbarEl = document.querySelector(".mobile-navbar");
  const navbarHeight = navbarEl ? Math.round(navbarEl.getBoundingClientRect().height) : 0;
  const navbarParent = navbarEl?.parentElement ?? null;
  const navbarNext = navbarEl?.nextSibling ?? null;
  navbarEl?.remove();
  const withoutNavbar = P.getVisiblePopoverBounds(null);
  if (navbarEl && navbarParent) navbarParent.insertBefore(navbarEl, navbarNext);
  const restored = P.getVisiblePopoverBounds(null);
  const moved = Math.abs(Math.round(withoutNavbar.bottom) - Math.round(withNavbar.bottom));

  out.push({
    name: "removing the navbar from the harness moves an asserted number",
    pass: navbarHeight > 0 && moved > 1.35
      && Math.round(restored.bottom) === Math.round(withNavbar.bottom),
    detail: `the harness navbar measures ${navbarHeight}px; the visible bounds end at`
      + ` ${Math.round(withNavbar.bottom)} with it and ${Math.round(withoutNavbar.bottom)} without,`
      + ` a move of ${moved}px against the 1.35px fallback artefact the gate names. Removing it does`
      + ` not hand the surface the screen — the positioner falls back to a hardcoded 50px of guessed`
      + ` chrome — so the sign is the one a check written from intuition would get backwards.`
      + ` Restored to ${Math.round(restored.bottom)}, because a gate that leaves the page it`
      + ` measured in a different state has broken every check after it`,
  });

  // ── the two grab bands, against one constant instead of two literals ──
  //
  // Both bands were already measured, in different sections, against independent literals: 44px on
  // the menu sheet and 32px on the record sheet. Two literals cannot express the relation the
  // acceptance criterion actually states — a menu sheet's band "at least as tall as the record
  // sheet's own" — so a change to either surface's chrome moved one number and left the other
  // standing, and the goal line drifted into "matches the record sheet's 32px", which would fail a
  // menu sheet that correctly clears the 44px thumb floor.
  //
  // So both are walked here, on one page, by the same function, and the assertion is the relation
  // plus one declared floor.
  const SHEET_BAND_FLOOR = 28;
  // Walked from the handle's own centre outward, counting the pixels the HANDLE answers — the same
  // method both existing band checks use, so the two numbers are comparable. Walking down from the
  // sheet's top edge instead reports a different quantity: the menu sheet measures 20px that way and
  // 44px this way, because the two surfaces put their handle at different offsets. Two methods is
  // how the numbers stopped being comparable in the first place.
  const walkBand = (sheet) => {
    const handle = sheet.querySelector(".db-mobile-bottom-sheet-handle");
    if (!handle) return 0;
    const box = handle.getBoundingClientRect();
    const answers = (y) => {
      const hit = document.elementFromPoint(Math.round(box.left + box.width / 2), Math.round(y));
      return Boolean(hit) && (hit === handle || handle.contains(hit));
    };
    const centre = box.top + box.height / 2;
    let up = 0;
    let down = 0;
    while (up < 80 && answers(centre - up - 1)) up += 1;
    while (down < 80 && answers(centre + down + 1)) down += 1;
    return up + down + 1;
  };

  // Built as the column menu is — a section header and a long row list — because the band's extent
  // depends on what sits under it. A six-row menu with no header puts its first row directly beneath
  // the handle and the band walks to 20px; the surface this phase is about is the column menu, and
  // comparing a stand-in against the record sheet would compare two different questions.
  const bandMenu = P.createOwnedMenu(document);
  bandMenu.addSection("Property");
  for (const label of [
    "Edit property", "Change type", "Insert property left", "Insert property right",
    "Duplicate property", "Move up", "Move down", "Hide property", "Enable wrap",
    "Filter by property", "Adjust column width", "Sort ascending", "Delete property",
  ]) bandMenu.addRow({ icon: "pencil", label });
  bandMenu.showAt({ x: 300, y: 90 });
  const menuBand = walkBand(bandMenu.el || bandMenu.dom || bandMenu.containerEl);
  bandMenu.close();
  await tick();

  const bandAnchor = host.createDiv({ cls: "anchor" });
  bandAnchor.setCssProps({ position: "absolute", left: "40px", top: "40px" });
  openRecordDetailPanel({
    anchorEl: bandAnchor,
    host,
    row: { file: { path: "B.md", basename: "B", name: "B.md" }, frontmatter: { income: 1 }, computed: {} },
    columns: [{ key: "file.name", label: "Name", type: "text" }, { key: "income", label: "Income", type: "number" }],
    config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
    app: {},
    actions: { editCell: () => {}, openRow: () => {}, editFileName: () => {}, isReadOnly: false },
  });
  const recordBand = walkBand(document.querySelector(".db-record-detail-panel"));
  closeRecordDetailPanel();
  bandAnchor.remove();
  await tick();

  out.push({
    name: "a menu sheet's grab band is at least the record sheet's, and both clear the control floor",
    pass: recordBand >= SHEET_BAND_FLOOR && menuBand >= recordBand,
    detail: `menu sheet band ${menuBand}px, record sheet band ${recordBand}px, walked by the same`
      + ` function on one page; the relation asserted is menu >= record (${menuBand >= recordBand})`
      + ` with the record band itself against this project's ${SHEET_BAND_FLOOR}px control floor`
      + ` (${recordBand >= SHEET_BAND_FLOOR}). Two independent literals could not state this: they`
      + ` let one surface's chrome move while the other's number stood, which is how the goal line`
      + ` came to read "matches the record sheet's 32px" and would have failed a menu sheet that`
      + ` correctly clears the 44px thumb floor`,
  });

  // ── semantic identity: the menu acts on the column it was opened on ──
  //
  // Every other check on this surface reads geometry, which covers state only by accident: a menu
  // can be the right size, docked and dismissible while acting on the wrong column. The failure this
  // rules out is specific and cheap to write by mistake — a menu that resolves its target from the
  // header cell under its anchor, rather than from the column it captured, acts on whichever column
  // now occupies that coordinate after a re-render.
  const header = host.createDiv({ cls: "db-header-row" });
  const cellFor = (label, left) => {
    const cell = header.createDiv({ cls: "db-header-cell", text: label });
    cell.setCssProps({ position: "absolute", top: "0px", left: `${left}px`, width: "100px", height: "28px" });
    return cell;
  };
  const colA = { key: "income", label: "Income", type: "number" };
  const colB = { key: "expenses", label: "Expenses", type: "number" };
  let cellA = cellFor("Income", 0);
  cellFor("Expenses", 100);
  const acted = [];
  const columnMenu = new (globalThis.__place.ColumnMenu)({
    editColumn: (c) => acted.push(`edit:${c.key}`),
    editFormula: () => undefined,
    editStatusOptions: () => undefined,
    showOptionsEditor: () => undefined,
    changeColumnType: () => undefined,
    insertColumn: () => undefined,
    duplicateColumn: (c) => acted.push(`duplicate:${c.key}`),
    moveColumn: () => undefined,
    hideColumn: (c) => acted.push(`hide:${c.key}`),
    toggleColumnWrap: () => undefined,
    setTextRenderMode: () => undefined,
    setTextLinkScheme: () => undefined,
    setNumberDisplayStyle: () => undefined,
    updateNumberDisplayConfig: () => undefined,
    sortByColumn: () => undefined,
    deleteColumn: (c) => acted.push(`delete:${c.key}`),
  });
  const cellARect = cellA.getBoundingClientRect();
  columnMenu.show(
    new MouseEvent("contextmenu", {
      bubbles: true, cancelable: true,
      clientX: Math.round(cellARect.left + 10), clientY: Math.round(cellARect.bottom),
    }),
    colA,
    cellA,
  );
  const menuEl2 = document.querySelector(".db-owned-menu");
  const openedRows = menuEl2 ? menuEl2.querySelectorAll(".db-menu-item").length : 0;

  // The header is rebuilt and the columns swap places, so the coordinate the menu opened at now
  // belongs to the OTHER column and the node the menu captured is gone from the document.
  header.empty();
  cellFor("Expenses", 0);
  cellA = cellFor("Income", 100);
  const labelOf2 = (el) => (el.querySelector(".db-menu-item-label") ?? el).textContent.trim();
  const rowsNow = menuEl2 ? [...menuEl2.querySelectorAll(".db-menu-item")] : [];
  const hideRow = rowsNow.find((el) => /hide/i.test(labelOf2(el)));
  hideRow?.click();
  const stillOpenAfterAction = document.querySelectorAll(".db-owned-menu").length;
  document.querySelectorAll(".db-owned-menu").forEach((el) => el.remove());
  document.querySelectorAll(".db-mobile-sheet-scrim").forEach((el) => el.remove());
  header.remove();

  out.push({
    name: "a column menu acts on the column it was opened on, not on the one now under its anchor",
    pass: openedRows > 0 && Boolean(hideRow) && acted.length === 1 && acted[0] === `hide:${colA.key}`,
    detail: `opened on "${colA.key}" over a header cell at x=${Math.round(cellARect.left)};`
      + ` the header was then rebuilt with ${colB.key} at that coordinate and ${colA.key} moved`
      + ` beside it, which is what a commit does. Pressing Hide acted on`
      + ` ${acted.length ? acted.join(", ") : "nothing"} (want hide:${colA.key}).`
      + ` ${openedRows} row(s) were drawn, ${stillOpenAfterAction} menu(s) stood after the press.`
      + ` A menu that resolved its target from the cell under its anchor would report hide:${colB.key}`,
  });

  out.push({
    name: "ten menu sheets opened and dismissed leave one owner and no residue",
    pass: scrimsWhileOpen.size === 1 && scrimsWhileOpen.has(1)
      && capturesLeft === 0 && viewportLeft === 0 && scrimsLeft === 0 && sheetsLeft === 0,
    detail: `across 10 open/dismiss cycles the document held`
      + ` ${[...scrimsWhileOpen].sort().join(", ")} backdrop(s) while a menu was open (want exactly`
      + ` one value, and that value 1); afterwards ${capturesLeft} capture-phase pointerdown`
      + ` listener(s), ${viewportLeft} visualViewport listener(s), ${scrimsLeft} backdrop(s) and`
      + ` ${sheetsLeft} sheet(s) remain. A leaked capture listener is a second dismissal owner, and`
      + ` a second owner closes the menu on a press the first one meant to deliver`,
  });

  return out;
}));

await keyboardPhone.close();

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
//
// The document is two fixtures, not one. Appearance is asserted as a comparison against a role-mate
// the same factory builds in another family, and the table fixture holds no second family — so the
// gallery is mounted beside it and both are read out of one document. Two absolute assertions in two
// documents can drift together and still agree, which is the failure a comparison exists to catch.
// The gallery contributes no select cell, so every number the three geometry checks report is
// unchanged by its presence.
//
// `PLACEMENT_SELECT_CONTROL=<name>` arms one of this section's negative controls. styles.css is not
// this harness's to edit, so a control that has to reproduce the pre-fix cascade appends the guard
// the fix removed rather than reverting the file. That is a fixture mutation and is recorded as one.
//
//   strip-select     removes the shared component's class from one select checkbox
//   strip-mate       removes it from the role-mate the appearance check compares against
//   reguard-desktop  puts the desktop pin back behind the guard, leaving the phone arm standing
//   reguard-phone    does the same to the phone arm
//
// Armed rather than hand-edited because a control nobody can re-run is a claim, not evidence, and
// the phone pair this section now prints used to rest on exactly such a run.
//
// Measured here and deliberately not asserted: the height of the select cell's inner flex container.
// A specification asked for the header's and a row's to be coincident to 0px, citing 32px against
// 33px as the pre-fix failing pair. On the shipped tree the header measures 32px, twenty-three rows
// measure 33px and the last row 34px — and with the pin re-guarded the same three numbers come back
// unchanged. The spread is table-border geometry: the header's container starts 1px into its cell
// and the last row has no bottom border to give back. An exact-equality clause there is red against
// correct code and blind to the defect in the same breath, so the clause that is asserted is the
// horizontal one, which does move — 7px uniform when pinned, 25px uniform when not.

const SELECT_CONTROL = process.env.PLACEMENT_SELECT_CONTROL || "";

// Scoped by body class so the desktop arm can be taken back to the defect while the phone arm is
// left standing. That is the half of the phone criterion that tells "the phone was already right"
// apart from "the desktop edit reached the phone".
const SELECT_CONTROL_CSS = {
  "reguard-desktop": 'body:not(.is-phone) .note-database-container .db-table .db-select-col'
    + ' .db-select-inner input[type="checkbox"].db-checkbox { position: static; right: auto; }',
  "reguard-phone": 'body.is-phone .note-database-container .db-table .db-select-col'
    + ' .db-select-inner input[type="checkbox"].db-checkbox { position: static; right: auto; }',
}[SELECT_CONTROL] || "";

const SELECT_FIXTURE = ["table-view", "gallery-view"]
  .map((id) => SCENARIOS.find((s) => s.id === id).html()).join("");

const selectStyles = (extra) => readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS + extra;

/**
 * Arms a class-stripping control, and refuses to arm silently.
 *
 * A control that matches nothing produces a green run and reads as safety, which is the one outcome
 * a negative control must never have. So an armed control that strips nothing throws, and the
 * section wrapper turns that into a named red rather than a quiet pass.
 */
const armSelectControl = async (page) => {
  if (SELECT_CONTROL !== "strip-select" && SELECT_CONTROL !== "strip-mate") return;
  const stripped = await page.evaluate((which) => {
    const boxes = [...document.querySelectorAll('input[type="checkbox"].db-checkbox')];
    const target = which === "strip-select"
      ? boxes.find((el) => el.closest(".db-select-col"))
      : boxes.find((el) => !el.closest(".db-select-col") && el.classList.contains("db-checkbox-row"));
    if (!target) return 0;
    target.classList.remove("db-checkbox");
    return 1;
  }, SELECT_CONTROL);
  if (!stripped) throw new Error(`PLACEMENT_SELECT_CONTROL=${SELECT_CONTROL} matched no element to strip`);
};

/**
 * Everything this section measures, out of whichever document it is handed.
 *
 * One probe rather than a desktop copy and a phone copy, so a number that differs between the two
 * arms is a property of the viewport and not of two hand-written measurements that drifted apart.
 */
const selectCellProbe = ({ phone }) => {
  const out = [];
  const cells = [...document.querySelectorAll(".db-select-col")].filter((c) => c.querySelector('input[type="checkbox"]'));
  const measured = cells.map((cell) => {
    const box = cell.querySelector('input[type="checkbox"]');
    const inner = cell.querySelector(".db-select-inner");
    const c = cell.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    return {
      tag: cell.tagName,
      owned: box.classList.contains("db-checkbox"),
      left: +(b.left - c.left).toFixed(2),
      right: +(c.right - b.right).toFixed(2),
      innerH: inner ? +inner.getBoundingClientRect().height.toFixed(2) : null,
      clips: getComputedStyle(cell).overflow === "hidden",
    };
  });

  const worst = measured.reduce((a, m) => Math.min(a, m.left), Infinity);
  const clipping = measured.filter((m) => m.clips).length;
  const rights = new Set(measured.map((m) => m.right));

  if (phone) {
    // A phone page that is not actually being measured as a phone reports the desktop numbers, and
    // the desktop numbers satisfy both clauses — so the surface is asserted before its geometry is,
    // or a green here would mean nothing about a phone.
    const onPhone = document.body.classList.contains("is-phone") && matchMedia("(pointer: coarse)").matches;
    out.push({
      name: "the select checkbox keeps its clearance on a phone",
      pass: onPhone && measured.length > 0 && worst >= 4,
      detail: `narrowest left clearance ${worst}px across ${measured.length} cells`
        + ` (${clipping} of them clip their overflow); right clearance`
        + ` ${[...rights].join("/")}px. Measured as a phone=${onPhone}, which is asserted alongside`
        + " the geometry because a desktop rendering of this page passes both clauses",
    });
    out.push({
      name: "the phone header and the phone row checkboxes land on the same column",
      pass: onPhone && rights.size === 1,
      detail: `right clearance takes ${rights.size} distinct value(s): ${[...rights].join(", ")}px`
        + ` across ${measured.length} cells, measured as a phone=${onPhone}. The phone arm was`
        + " repaired before the desktop one, so this is what the desktop repair must not disturb",
    });
    return out;
  }

  const owned = measured.filter((m) => m.owned).length;
  out.push({
    name: "the select column's checkbox is the shared owned control",
    pass: measured.length > 0 && owned === measured.length,
    detail: `${owned}/${measured.length} select checkboxes carry the shared component class`
      + " (if this fails the fixture no longer resembles what the factory builds, and the geometry"
      + " check below is measuring something production does not render)",
  });

  out.push({
    name: "the select checkbox keeps clearance from the cell edge that clips it",
    pass: measured.length > 0 && worst >= 4,
    detail: `narrowest left clearance ${worst}px across ${measured.length} cells`
      + ` (${clipping} of them clip their overflow); right clearance`
      + ` ${[...rights].join("/")}px. Unpinned this measures 0px and the`
      + " box is sheared by the cell wall.",
  });

  const headerInner = measured.filter((m) => m.tag === "TH").map((m) => m.innerH);
  const rowInner = [...new Set(measured.filter((m) => m.tag === "TD").map((m) => m.innerH))];
  out.push({
    name: "the header checkbox and the row checkboxes land on the same column",
    pass: rights.size === 1,
    detail: `right clearance takes ${rights.size} distinct value(s): ${[...rights].join(", ")}px`
      + " — the header and every row must coincide, or sorting a column makes the checkbox jump."
      + ` The inner flex containers are not coincident and are not asserted to be: header`
      + ` ${headerInner.join("/")}px against row values ${rowInner.join("/")}px, the same spread`
      + " with the pin re-guarded, so it is table-border geometry rather than a placement defect",
  });

  // Appearance has one owner, measured as a comparison rather than asserted absolutely. Two absolute
  // assertions can drift together and still agree; a comparison against a role-mate in the same
  // document cannot.
  //
  // `borderColor` is asserted alongside the rest, and it is the one that earns the list its fifth
  // entry. Stripping the shared class does not leave the control unstyled: a second block guarded
  // against that class wakes and repaints it with the same appearance, border width, radius and
  // fill, so a four-property comparison sees nothing move and reports a single owner where there
  // are two. Only the colour separates them — and it separates them across an accessibility floor.
  // A checkbox border is the only thing identifying an unchecked control, which puts it under the
  // 3:1 non-text contrast minimum: the shared component measures 3.22:1 against the panel and the
  // dormant fallback 1.36:1, the same figure recorded beside the rule this ownership work replaced.
  // Without this entry the control is dormant rather than dead, and nothing here can tell.
  const APPEARANCE = ["appearance", "borderWidth", "borderRadius", "backgroundColor", "borderColor"];
  const readAppearance = (el) => {
    const s = getComputedStyle(el);
    return {
      appearance: s.appearance || s.webkitAppearance || "",
      borderWidth: s.borderWidth,
      borderRadius: s.borderRadius,
      backgroundColor: s.backgroundColor,
      borderColor: s.borderColor,
    };
  };
  const selectBox = cells.length ? cells[0].querySelector('input[type="checkbox"]') : null;
  const mate = [...document.querySelectorAll('input[type="checkbox"].db-checkbox-row')]
    .find((el) => !el.closest(".db-select-col"));
  const mateFamily = mate
    ? ([...mate.classList].find((c) => c !== "db-checkbox" && !c.startsWith("db-checkbox-")) || "(role only)")
    : "(no role-mate in this document)";
  const selectStyle = selectBox ? readAppearance(selectBox) : null;
  const mateStyle = mate ? readAppearance(mate) : null;
  const differing = selectStyle && mateStyle ? APPEARANCE.filter((k) => selectStyle[k] !== mateStyle[k]) : APPEARANCE;
  out.push({
    name: "the select checkbox and a role-mate compute one appearance",
    pass: !!(selectStyle && mateStyle) && differing.length === 0,
    detail: `${differing.length} of ${APPEARANCE.length} properties differ between the select`
      + ` checkbox and the ${mateFamily} role-mate`
      + (differing.length ? `: ${differing.map((k) => `${k} ${selectStyle[k]} vs ${mateStyle[k]}`).join(", ")}` : "")
      + `. Select reads ${APPEARANCE.map((k) => `${k}=${selectStyle ? selectStyle[k] : "?"}`).join(" ")}`
      + ". borderColor is the only one of the five that moves when the shared class is stripped,"
      + " because this column keeps its own fallback block and that block agrees with the component"
      + " on the other four — so a comparison without it reports one owner where there are two,"
      + " and misses that the fallback repaints the border below the 3:1 non-text contrast floor",
  });
  return out;
};

const selectCell = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
await selectCell.setContent(`<body><div id="shot">${SELECT_FIXTURE}</div></body>`);
await selectCell.addStyleTag({ content: selectStyles(SELECT_CONTROL_CSS) });
await selectCell.addStyleTag({ content: readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8") });
const selectCellResults = await section("the select column's clipping cell", async () => {
  await armSelectControl(selectCell);
  // The component rule transitions background and border over 120ms, so a colour read before the
  // page settles is an animation frame rather than a computed value — the trap the family probe
  // below documents, and this section reads colours now.
  await selectCell.waitForTimeout(250);
  return selectCell.evaluate(selectCellProbe, { phone: false });
});
await selectCell.close();

// The same cell on a phone, because the desktop arm cannot speak for it. The phone hit this defect
// first and was repaired on its own, so the desktop repair had to leave the phone where it was —
// and until this page existed that invariance was a sentence rather than a number. Run it with
// `PLACEMENT_SELECT_CONTROL=reguard-desktop` and the pair below must not move; with `reguard-phone`
// it must collapse to a sheared 0px, which is what distinguishes the two claims.
const selectPhoneContext = await browser.newContext({
  viewport: { width: 390, height: 844 }, reducedMotion: "reduce", hasTouch: true, isMobile: true,
});
const selectPhone = await selectPhoneContext.newPage();
await selectPhone.setContent(`<body class="is-mobile is-phone"><div id="shot">${SELECT_FIXTURE}</div></body>`);
await selectPhone.addStyleTag({ content: selectStyles(SELECT_CONTROL_CSS) });
await selectPhone.addStyleTag({ content: readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8") });
const selectPhoneResults = await section("the select column's clipping cell, on a phone", async () => {
  await armSelectControl(selectPhone);
  await selectPhone.waitForTimeout(250);
  return selectPhone.evaluate(selectCellProbe, { phone: true });
});
await selectPhone.close();
await selectPhoneContext.close();

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
    applyRowSelectionPress, attachRowRangeGesture, attachLongPress, isTouchDevice, RowMenu,
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
  let menuReport = "no hold yet";

  const boxes = [];
  const cells = [];
  const rows = [];
  const sync = () => {
    for (let i = 0; i < boxes.length; i += 1) boxes[i].checked = selected.has(rowPaths[i]);
  };

  const host = document.querySelector(".note-database-container");

  // A real menu, not a counter.
  //
  // This used to pass `onLongPress` a function that added one to a number, and the number was then
  // read as "1 row menu". It proved the hold reached a handler and nothing about a menu — not that
  // one was built, not that it carried entries, not that it landed on the row that was held. That
  // is the same shape that produced a false green earlier in this program, where a counting stub
  // for the filename editor let a check certify a double-tap had opened an editor that was never
  // created. So the handler below is the shipped one: production hands the row menu the event, the
  // row and the row element, and so does this, through the same `RowMenu` the rename check on this
  // page already drives.
  const heldRowMenu = new RowMenu({
    app: { workspace: { containerEl: host } },
    openRow: () => undefined,
    deleteRow: async () => undefined,
    duplicateRow: async () => undefined,
    renameRow: () => undefined,
    isReadOnly: false,
  });
  // Placed, not merely built — and the first version of this rule got the shipped answer wrong.
  //
  // It demanded the menu sit on one of the row's edges, and the driven menu failed it: on a 390px
  // page the menu came back at 0,622 spanning 390x222 while the row sat at 12,198. That is not a
  // misplacement, it is the phone presentation. `owned-menu.ts:165` discards the anchor on a phone
  // on purpose and shows a bottom sheet, so a check demanding an anchored popover there is asserting
  // against the design. Which is the whole argument for driving the menu rather than counting calls:
  // the counter could not have been wrong about this, because it never knew what a menu looked like.
  //
  // So the rule reads the presentation and holds it to its own contract. A sheet has to be full
  // width and sitting on the bottom edge. A popover has to be against the row that was held. Either
  // way it has to be on screen, and either way a menu dropped at the origin fails.
  const menuAnchoredTo = (menu, tr) => {
    const m = menu.getBoundingClientRect();
    const r = tr.getBoundingClientRect();
    const asSheet = menu.classList.contains("db-mobile-bottom-sheet");
    const onScreen = m.top >= 0 && m.left >= -1
      && m.bottom <= window.innerHeight + 1 && m.right <= window.innerWidth + 1;
    const placed = asSheet
      ? Math.abs(m.width - window.innerWidth) <= 1 && Math.abs(m.bottom - window.innerHeight) <= 1
      : (Math.abs(m.top - r.bottom) <= 12 || Math.abs(m.bottom - r.top) <= 12
        || (m.top >= r.top - 12 && m.top <= r.bottom + 12))
        && m.right > r.left && m.left < r.right;
    return { ok: placed && onScreen, asSheet, placed, onScreen, m, r };
  };
  const dismissAnyMenu = () => {
    // The shipped dismissal first, so the teardown a user gets is the one exercised here.
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    for (const stale of document.querySelectorAll(".db-owned-menu")) stale.remove();
  };

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
      onLongPress: (event) => {
        heldRowMenu.show(
          event,
          { file: { path, name: path, basename: path.replace(/\.md$/, "") } },
          undefined,
          tr,
        );
        const built = document.querySelector(".db-owned-menu");
        const entries = built ? built.querySelectorAll(".db-menu-item").length : 0;
        const placement = built ? menuAnchoredTo(built, tr) : null;
        if (built && entries > 0 && placement.ok) menuCount += 1;
        menuReport = built
          ? `in the document with ${entries} entries, placed=${placement.ok} `
            + `[as ${placement.asSheet ? "the phone sheet" : "a popover"}, placed=${placement.placed} onscreen=${placement.onScreen}] `
            + `menu ${Math.round(placement.m.left)},${Math.round(placement.m.top)} `
            + `${Math.round(placement.m.width)}x${Math.round(placement.m.height)} `
            + `against row ${Math.round(placement.r.left)},${Math.round(placement.r.top)} `
            + `${Math.round(placement.r.width)}x${Math.round(placement.r.height)}`
          : "no menu was built";
        dismissAnyMenu();
      },
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
    menuReport = "no hold yet";
    vibrations = 0;
    dismissAnyMenu();
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
  const boxMenuReport = menuReport;
  release(boxes[5]);
  reset();
  await holdDown(cells[5], 520);
  const bodyExtends = extendCount;
  const bodyMenus = menuCount;
  const bodyBuzz = vibrations;
  const bodyMenuReport = menuReport;
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
      + ` threshold by coincidence. ${where}.`
      + ` The menu term is counted by building the shipped row menu and measuring it rather than by`
      + ` adding one to a number — on the checkbox: ${boxMenuReport}. On the row body: ${bodyMenuReport}`,
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
await rowPhone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
await rowPhone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await rowPhone.addScriptTag({ content: positionerJs });
const rowPhoneResults = await section("a press on a row checkbox, by finger", () => rowPhone.evaluate(rowRangeProbe, { pointerType: "touch" }));
await rowPhone.close();

const rowNarrowPane = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
await rowNarrowPane.setContent(page_html);
await rowNarrowPane.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
// The split pane the predicate is wrong about: a desktop window, a mouse, and a leaf under 760px.
await rowNarrowPane.addStyleTag({ content: ".workspace-split.mod-root { flex: 0 0 700px; }" });
await rowNarrowPane.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await rowNarrowPane.addScriptTag({ content: positionerJs });
const rowNarrowResults = await section("a press on a row checkbox, by mouse in a narrow pane", () => rowNarrowPane.evaluate(rowRangeProbe, { pointerType: "mouse" }));
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
await section("every checkbox family, at the size its role declares", async () => {
  const sheets = [
    readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS,
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
});
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
const touchResults = await section("what a finger can actually reach", () => touchPage.evaluate((floor) => {
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
}, TOUCH_FLOOR));
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
await section("the reorder button and the row checkbox share one cell", async () => {
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
      const results = [{
        name: `on ${id} the reorder button and the row checkbox do not overlap`,
        pass: worst === null || worst >= 0,
        detail: shown.length === 0
          ? `no reorder button is shown in ${cells.length} select cells, so nothing can collide`
            + " — the table creates this button only on touch"
          : `${shown.length} cells show both; narrowest gap ${worst}px in a ${cellWidth}px cell`
            + " (negative means the two controls are drawn on top of one another)",
      }];

      // The column has to be wide enough for what is painted in it, measured now rather than
      // taken from the arithmetic in a comment.
      //
      // This is the failure that produced the phase. The width carried a comment reading
      // `48 = button 24 + checkbox 16 + gap 8`, which was true when written and became false the
      // moment another phase raised both controls to 28px — two 28px controls do not fit in 48px
      // at any gap. A criterion that read the comment would still pass today. Summing the boxes
      // the browser actually painted, plus the cell's own padding, cannot go stale that way.
      if (shown.length > 0) {
        const cell = shown[0];
        const style = getComputedStyle(cell);
        const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const button = cell.querySelector(".db-table-mobile-move-btn").getBoundingClientRect().width;
        const checkbox = cell.querySelector('input[type="checkbox"]').getBoundingClientRect().width;
        const needed = Math.round(padding + button + Math.max(0, worst) + checkbox);
        results.push({
          name: `on ${id} the select column is wide enough for the controls it paints`,
          pass: cellWidth >= needed,
          detail: `cell ${cellWidth}px against ${needed}px needed`
            + ` = padding ${Math.round(padding)} + button ${Math.round(button)} + gap ${worst} + checkbox ${Math.round(checkbox)}`
            + " — summed from the painted boxes, not from the width comment that went stale when both controls became 28px",
        });
      }
      return results;
    }, device.id));
    await context.close();
  }
});

const rhythmResults = [];
const rendererRhythmResults = [];

// ───────────────────────────────────────────────────────────────────
// 5n. LIFTED FROM THE PHASE PROBES
// ───────────────────────────────────────────────────────────────────
//
// Three probes were written beside their phases, ran once, and were never run
// again — 31 desktop placement checks, 10 on the sheet drag, 22 auditing the
// sheet against the asks it was built from. A check that lives outside the
// harness asserts nothing after the day it was written, which is the same
// failure as a stale artefact: it carries the authority of having been measured
// without the fact of one.
//
// They are lifted rather than rewritten, so what passed there passes here for
// the same reason. Each keeps its own page shape, because each was built around
// a different trap — the desktop one puts a 300px sidebar before the root split
// so the leaf is NOT at the viewport origin, and its two GUARD checks fail if
// that ever stops being true. Two harness defects in the drag probe were fixed
// on the way in and are commented where they were.
//
// The one thing deliberately dropped is each probe's private setCssProps
// override. They patched in the device's setProperty semantics locally because
// the shared shim did not have them; it does now, so these run against the same
// shim everything else does.

const liftedResults = [];

await section("lifted probes: desktop placement", async () => {
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


  async function openPage(opts) {
    const page = await browser.newPage({ viewport: opts?.viewport ?? VIEWPORT, reducedMotion: "reduce" });
    await page.setContent(pageHtml(opts));
    await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
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

    // The shipped placement, CALLED rather than copied.
    //
    // This used to reproduce the arithmetic from `database-view.ts` and `embedded-database-renderer.ts`
    // verbatim, because both copies were private methods on renderers that need a live Obsidian
    // `App`. That transcription was measured failing in the way that matters: reverting the SOURCE
    // to `window.innerWidth` left this run at exit 0, while reverting the COPY turned it red. The
    // check answered a question about the copy. The arithmetic now lives in one exported function
    // both renderers call, and this calls the same one.
    //
    // The anchor is a toolbar search control near the right of the editing area.
    const searchControl = document.querySelector(".note-database-container").createDiv({ cls: "anchor" });
    searchControl.setCssProps({ position: "absolute", top: "20px", width: "200px" });
    const panel = document.body.createDiv({ cls: "db-calendar-search-results-popover" });
    const placeSearchPanel = (anchorX) => {
      searchControl.setCssProps({ left: `${anchorX}px` });
      const placement = P.calendarSearchResultsPlacement(
        searchControl.getBoundingClientRect(),
        P.getVisiblePopoverBounds(null),
      );
      panel.setCssProps({
        left: `${placement.left}px`, top: `${placement.top}px`, width: `${placement.width}px`,
      });
      return panel.getBoundingClientRect();
    };
    // Two anchor positions, because one cannot tell a clamp from a coincidence. The overhang used to
    // grow with the anchor, so a panel that happens to fit at one x can still run under the sidebar
    // at another, and a single-position check would report that as fixed.
    const near = placeSearchPanel(600);
    const far = placeSearchPanel(1000);
    out.push({
      name: "the shipped search-results placement clears the right sidebar",
      pass: Math.round(near.right) <= Math.round(split.right) + 1
        && Math.round(far.right) <= Math.round(split.right) + 1,
      // Reports what it measured rather than asserting the fix. The old wording said "clamped
      // against bounds.right rather than the window" unconditionally, and printed that sentence
      // unchanged while the reverted source was placing the panel 292px under the sidebar — a
      // detail line that describes the intended behaviour instead of the observed one is a second
      // way for a check to lie about its own failure.
      detail: `anchor x=600 panel=[${Math.round(near.left)}..${Math.round(near.right)}], `
        + `anchor x=1000 panel=[${Math.round(far.left)}..${Math.round(far.right)}], `
        + `editing area right=${Math.round(split.right)}, bounds.right=${Math.round(bounds.right)}, `
        + `window.innerWidth=${window.innerWidth}. Both anchors land at the same right edge when the `
        + `clamp decides it; against the window they land ${Math.round(window.innerWidth - split.right)}px `
        + `under the sidebar and the overhang grows with the anchor, which the control below measures.`,
    });
    // The negative control: the statement this replaced, re-run in place. It still overhangs and the
    // overhang still grows with the anchor, so the check above can distinguish a clamp from a
    // coincidence rather than passing on a panel that was never going to reach the sidebar.
    const unclampedRight = (anchorX) => {
      searchControl.setCssProps({ left: `${anchorX}px` });
      const rect = searchControl.getBoundingClientRect();
      const width = Math.max(320, Math.min(480, window.innerWidth - 16));
      return Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)) + width;
    };
    const unclampedNear = unclampedRight(600);
    const unclampedFar = unclampedRight(1000);
    out.push({
      name: "HAND CONTROL the search-results overhang grows with the anchor, so the clamp is the cause",
      pass: Math.round(unclampedFar - split.right) > Math.round(unclampedNear - split.right)
        && Math.round(unclampedNear) > Math.round(split.right),
      detail: `against window.innerWidth the right edge is ${Math.round(unclampedNear)} at anchor x=600 `
        + `(${Math.round(unclampedNear - split.right)}px past the editing area) and ${Math.round(unclampedFar)} `
        + `at x=1000 (${Math.round(unclampedFar - split.right)}px); clamped against the editing area the same `
        + `two anchors give ${Math.round(near.right)} and ${Math.round(far.right)}.`,
    });
    panel.remove();

    // column-menu.ts anchorless submenu fallback — CALLED, not copied.
    //
    // This used to carry the expression transcribed from the source, and said so: "copying means
    // this can go stale". It could also go green while the source regressed, which is the failure
    // that matters. `anchorlessSubmenuPlacement` is now exported from `popover-position` and the
    // shipped renderer calls the same function this does, so reverting the source to a
    // window-relative clamp turns this red.
    const estimatedWidth = 292;
    const point = { x: Math.round(split.right - 60), y: 200 };
    const sub = document.body.createDiv({ cls: "db-dropdown-popover db-column-menu-subpopover" });
    for (let i = 0; i < 5; i += 1) sub.createDiv({ cls: "row", text: `Item ${i}` });
    sub.setCssProps({ position: "fixed", width: `${estimatedWidth}px` });
    const subHeight = sub.getBoundingClientRect().height || 320;
    const placed = P.anchorlessSubmenuPlacement(point, bounds, { width: estimatedWidth, height: subHeight });
    sub.setCssProps({ left: `${placed.left}px`, top: `${placed.top}px` });
    const sr = sub.getBoundingClientRect();
    out.push({
      name: "the anchorless column submenu clears the right sidebar",
      pass: Math.round(sr.right) <= Math.round(split.right) + 1,
      detail: `submenu=[${Math.round(sr.left)}..${Math.round(sr.right)}] editing area right=${Math.round(split.right)}; `
        + `placed by the shipped \`anchorlessSubmenuPlacement\` against bounds.right=${Math.round(bounds.right)} `
        + `rather than view.innerWidth=${view.innerWidth}, which is what used to place it 188px under the sidebar`,
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
    '<body class="is-phone" style="--safe-area-inset-bottom: 34px; --background-modifier-border: #333333;'
    + NAVBAR_TOKENS + '">'
    + '<div class="mobile-navbar"></div>',
  ));
  await phone.addStyleTag({ content: NAVBAR_RULE });
  await phone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await phone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await phone.addScriptTag({ content: positionerJs });
  all.push(...await phone.evaluate(async () => {
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
    // The CAP, not the resulting height. Asserting only `height <= 90%` passes on almost any menu:
    // a six-row list is under that ceiling wherever it is placed, so the clause went green on a
    // desktop-placed menu carrying an 836px cap — measured, when the sheet fork was removed as a
    // control and this was the one presentation clause that did not move. What discriminates is
    // which ceiling is in force.
    const cap = parseFloat(style.maxHeight);
    const sheetCap = window.innerHeight * 0.9;
    out.push({
      name: "PHONE the sheet is capped and scrolls rather than growing past the screen",
      pass: Math.abs(cap - sheetCap) <= 1 && r.height <= cap + 2 && style.overflowY === "auto",
      detail: `height=${Math.round(r.height)} against a computed max-height of ${cap.toFixed(1)}px; `
        + `the sheet's 90svh cap is ${sheetCap.toFixed(1)}px, and the two agree=`
        + `${Math.abs(cap - sheetCap) <= 1} — which is the clause, because the desktop branch writes `
        + `its own ceiling and a short menu sits under either one; overflow-y=${style.overflowY}`,
    });
    menu.close();

    // ─────────────────────────────────────────────────────────────────
    // PHONE ANCHOR LIFETIME — what a dead anchor does and does not mean
    // ─────────────────────────────────────────────────────────────────
    //
    // These rows used to assert the opposite: a phone sheet whose anchor died stopped presenting and
    // took its backdrop down. The reasoning was that an unreachable sheet should stop blocking the
    // app, and the premise inside it — that a sheet with no anchor is unreachable — is the part that
    // is wrong. It is true of an anchored popover, which has no coordinate without its trigger. A
    // bottom sheet is docked to the viewport edge and spans it; nothing about where it sits, how it
    // is drawn, or whether a thumb can reach it passes through the anchor at all.
    //
    // The cost of that inference was the whole surface. The view rebuilds its toolbar on roughly two
    // dozen paths, most of them background refreshes; each one leaves the panel's owner holding a
    // detached button, and the next viewport event — a scroll, a rotation, the keyboard — read that
    // as an unreachable sheet and took it away mid-edit. The operator reported it twice as the add
    // controls doing nothing, which is what it looks like from the outside.
    //
    // The freeze the old rows were aimed at is real and is guarded at the event that actually means
    // the surface is gone: the panel leaving the document. `sheet-teardown` asserts it across every
    // producer, and the sheet module's own observer takes the backdrop down on the last removal
    // however it happened. The second row below states that here too, because the row it replaced
    // was the only place this file said the backdrop cannot outlive its sheet.
    //
    // Sequential, not parallel: the backdrop is shared and comes down when the LAST sheet goes, so
    // two open at once would report each other's state.
    const buildSheet = (rows) => {
      const el = document.body.createDiv({ cls: "probe-panel" });
      for (let i = 0; i < rows; i += 1) el.createDiv({ cls: "row", text: `Item ${i}` });
      return el;
    };
    const scrims = () => document.querySelectorAll(".db-mobile-sheet-scrim").length;
    const tick = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const doomed = document.body.createDiv({ cls: "anchor" });
    doomed.setCssProps({ position: "absolute", left: "40px", top: "100px", width: "40px", height: "20px" });
    const orphan = buildSheet(6);
    P.positionToolbarPopover(orphan, doomed, P.COMPACT_MENU_POPOVER);
    const openedAsSheet = orphan.classList.contains("db-mobile-bottom-sheet");
    const scrimWhileOpen = scrims();
    // The real sequence: a commit rebuilds the toolbar that owned the trigger while the surface
    // stays open, and the reposition loop is what notices. Re-calling the positioner would measure
    // the entry guard instead of the loop.
    doomed.remove();
    window.dispatchEvent(new Event("resize"));
    await tick();
    const orphanVisibility = getComputedStyle(orphan).visibility;
    const scrimAfter = scrims();
    const orphanIsSheet = orphan.classList.contains("db-mobile-bottom-sheet");
    out.push({
      name: "PHONE a sheet outlives the toolbar rebuild that destroyed its anchor",
      pass: openedAsSheet && scrimWhileOpen === 1
        && orphanVisibility !== "hidden" && orphanIsSheet && orphan.isConnected && scrimAfter === 1,
      detail: `opened as a sheet=${openedAsSheet} with ${scrimWhileOpen} backdrop(s);`
        + ` after the anchor was destroyed and the loop ran, visibility=${orphanVisibility},`
        + ` still a sheet=${orphanIsSheet}, ${scrimAfter} backdrop(s). A docked full-width surface`
        + ` measures nothing through its trigger, so losing one says nothing about whether it can`
        + ` still be seen or touched — and taking it away mid-edit is what the add controls doing`
        + ` nothing looks like from the outside`,
    });

    // The freeze the row above used to chase, asserted at the event that actually means the surface
    // is gone. Without this the file would say a sheet survives a dead anchor and say nothing at all
    // about the backdrop ever coming down, which is the shape a full-screen tap-swallowing overlay
    // reaches production in.
    orphan.remove();
    await tick();
    out.push({
      name: "PHONE CONTROL a sheet that leaves the document takes its backdrop with it",
      pass: scrims() === 0,
      detail: `${scrims()} backdrop(s) after the panel was removed. A backdrop is a body-level`
        + ` sibling, so a bare removal cannot take it down by containment; the sheet module's`
        + ` observer is what does, and this is the clause that says so`,
    });

    // CONTROL: a live anchor must survive the same loop with its backdrop intact, or the check
    // above is satisfied by a positioner that hides every sheet and clears every scrim.
    const liveAnchor = document.body.createDiv({ cls: "anchor" });
    liveAnchor.setCssProps({ position: "absolute", left: "40px", top: "200px", width: "40px", height: "20px" });
    const kept = buildSheet(6);
    P.positionToolbarPopover(kept, liveAnchor, P.COMPACT_MENU_POPOVER);
    window.dispatchEvent(new Event("resize"));
    await tick();
    const keptRect = kept.getBoundingClientRect();
    const keptVisibility = getComputedStyle(kept).visibility;
    const keptScrims = scrims();
    out.push({
      name: "PHONE CONTROL a sheet with a live anchor keeps its backdrop and stays on the floor",
      pass: keptVisibility !== "hidden" && keptScrims === 1
        && Math.abs(keptRect.bottom - window.innerHeight) <= 1,
      detail: `visibility=${keptVisibility}, ${keptScrims} backdrop(s), sheet bottom`
        + ` ${Math.round(keptRect.bottom)} of ${window.innerHeight}`,
    });
    kept.remove();
    liveAnchor.remove();
    await tick();

    return out;
  }));
  await phone.close();

  liftedResults.push(...all);
  });

await section("lifted probes: the sheet drag", async () => {
  const pageHtml = `<!doctype html><html><head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; }
    .app-container { display: flex; width: 100vw; height: 100vh; }
    .workspace { display: flex; width: 100%; }
    .workspace-split.mod-root { flex: 1 1 auto; position: relative; overflow: hidden; }
    .note-database-container { position: relative; height: 100%; padding: 40px; }
    .workspace-leaf { position: relative; contain: strict !important; overflow: hidden; isolation: isolate; }
    .workspace-leaf, .workspace-leaf-content, .view-content { height: 100%; }
    .app-container.mod-static-nav .workspace { height: calc(100% - 80px); }
    .anchor { width: 120px; height: 28px; background: #ccd; }
    ${NAVBAR_RULE}
  </style></head>
  <body class="is-phone" style="--safe-area-inset-bottom: 34px; --background-modifier-border: #333333; ${NAVBAR_TOKENS}">
    <div class="mobile-navbar"></div>
    <div class="app-container mod-static-nav"><div class="workspace">
      <div class="workspace-split mod-root">
        <div class="workspace-leaf"><div class="workspace-leaf-content"><div class="view-content">
        <div class="note-database-container"><div class="anchor" id="anchor"></div></div>
        </div></div></div>
      </div>
    </div></div>
  </body></html>`;

  // ───────────────────────────────────────────────────────────────────
  // 5. HARNESS
  // ───────────────────────────────────────────────────────────────────

  // Reduced motion, like every other page in this file — see the note on the sheet-behaviour page
  // below for what a page without it now measures.
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  await page.setContent(pageHtml);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const cdp = await page.context().newCDPSession(page);
  const touch = async (type, x, y) => {
    await cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y, radiusX: 12, radiusY: 12, force: 1 }],
    });
  };

  const results = [];
  const record = (name, pass, detail) => results.push({ name, pass, detail });

  // ── Open the record sheet through the shipped entry point ─────────────
  await page.evaluate(() => {
    const { openRecordDetailPanel } = globalThis.__drag;
    globalThis.__log = [];
    for (const type of ["pointerdown", "pointermove", "pointerup", "pointercancel", "lostpointercapture", "touchstart", "touchmove"]) {
      document.addEventListener(type, (e) => {
        globalThis.__log.push({
          type: e.type,
          target: e.target?.className || e.target?.tagName || "?",
          button: e.button,
          pointerType: e.pointerType,
          clientY: Math.round(e.clientY ?? -1),
          defaultPrevented: e.defaultPrevented,
        });
      }, true);
    }
    openRecordDetailPanel({
      anchorEl: document.getElementById("anchor"),
      host: document.querySelector(".note-database-container"),
      row: { file: { path: "33.md", basename: "33", name: "33.md" }, frontmatter: { income: 1 }, computed: {} },
      columns: [
        { key: "file.name", label: "Name", type: "text" },
        { key: "income", label: "Income", type: "number" },
        { key: "status", label: "Status", type: "text" },
      ],
      config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
      app: {},
      actions: { editCell: () => {}, openRow: () => {}, editFileName: () => {}, isReadOnly: false },
    });
  });
  // The positioner re-measures on the next frame; measure after it settles.
  await page.waitForTimeout(120);

  // ── 1. GEOMETRY: where the grab band actually answers ────────────────
  const geometry = await page.evaluate(() => {
    const panel = document.querySelector(".db-record-detail-panel");
    const handle = panel?.querySelector(".db-mobile-bottom-sheet-handle");
    if (!panel || !handle) return { error: "no panel or no handle", hasPanel: !!panel, hasHandle: !!handle };
    const pr = panel.getBoundingClientRect();
    const hr = handle.getBoundingClientRect();
    const cx = Math.round(pr.left + pr.width / 2);
    // Walk down the sheet's own coordinate space and ask the document who answers.
    const column = [];
    for (let dy = 0; dy <= 60; dy += 1) {
      const el = document.elementFromPoint(cx, Math.round(pr.top) + dy);
      column.push(el === handle ? "H" : panel.contains(el) ? "p" : el ? "x" : "-");
    }
    // And across the full width at the band's vertical middle.
    const bandRows = column.map((c, i) => (c === "H" ? i : -1)).filter((i) => i >= 0);
    const midY = bandRows.length ? Math.round(pr.top) + bandRows[Math.floor(bandRows.length / 2)] : Math.round(hr.top + 2);
    let leftMost = null; let rightMost = null;
    // Stepped 2px, so the scan could miss the edge pixel at each end, and the width was taken as
    // the distance between the two sample points rather than the count of pixels between them. A
    // 390px band measured 384 and read as short of a full-width one. Step 1, and count inclusively.
    for (let x = Math.round(pr.left); x <= Math.round(pr.right); x += 1) {
      if (document.elementFromPoint(x, midY) === handle) { if (leftMost === null) leftMost = x; rightMost = x; }
    }
    return {
      panel: { top: Math.round(pr.top), bottom: Math.round(pr.bottom), left: Math.round(pr.left), right: Math.round(pr.right), width: Math.round(pr.width), height: Math.round(pr.height) },
      handleBar: { top: Math.round(hr.top), height: Math.round(hr.height), width: Math.round(hr.width) },
      column: column.join(""),
      bandTop: bandRows.length ? bandRows[0] : null,
      bandBottom: bandRows.length ? bandRows[bandRows.length - 1] : null,
      bandHeight: bandRows.length,
      bandLeft: leftMost === null ? null : leftMost - Math.round(pr.left),
      bandRight: rightMost === null ? null : rightMost - Math.round(pr.left),
      bandWidth: leftMost === null ? 0 : rightMost - leftMost + 1,
      midY,
      handleTouchAction: getComputedStyle(handle).touchAction,
      panelTouchAction: getComputedStyle(panel).touchAction,
      panelOverflowY: getComputedStyle(panel).overflowY,
      panelInlineOverflowY: panel.style.overflowY || "(unset)",
      panelInlineBoxSizing: panel.style.boxSizing || "(unset)",
      panelTransformAtRest: getComputedStyle(panel).transform,
      scrimPointerEvents: getComputedStyle(document.querySelector(".db-mobile-sheet-scrim")).pointerEvents,
    };
  });
  record(
    "the grab band answers presses at the top of the sheet",
    geometry.bandHeight > 0,
    `band occupies y=${geometry.bandTop}..${geometry.bandBottom} of the sheet (${geometry.bandHeight}px tall); hit column from sheet top: ${geometry.column}`,
  );
  record(
    "the grab band spans the full sheet width",
    geometry.bandWidth >= geometry.panel.width - 4,
    `band x=${geometry.bandLeft}..${geometry.bandRight} of a ${geometry.panel.width}px sheet (${geometry.bandWidth}px wide)`,
  );
  record(
    "the handle keeps touch-action: none so the browser cannot claim the drag",
    geometry.handleTouchAction === "none",
    `handle touch-action=${geometry.handleTouchAction}, panel touch-action=${geometry.panelTouchAction}`,
  );

  // ── 2. THE GESTURE: a real thumb, from the very first move ───────────
  const startX = Math.round(geometry.panel.left + geometry.panel.width / 2);
  const startY = geometry.midY;
  const samples = [];
  await touch("touchStart", startX, startY);
  for (const dy of [1, 2, 4, 8, 16, 32, 64, 95]) {
    await touch("touchMove", startX, startY + dy);
    // Read after the frame the handler paints into, not in the same tick as the dispatch.
    // Without this the transform read back belongs to the PREVIOUS move: the drag reported
    // 32->16 64->32 95->64, each sample lagging one behind, which looks exactly like a sheet
    // tracking the finger at half speed. Two frames, because the handler schedules its write in
    // one rAF and the style is only observable after that frame has been committed.
    const t = await page.evaluate(() => new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const p = document.querySelector(".db-record-detail-panel");
        resolve(p ? { computed: getComputedStyle(p).transform, inline: p.style.transform || "(none)" } : null);
      }));
    }));
    samples.push({ dy, ...t });
  }
  const log = await page.evaluate(() => globalThis.__log.slice());
  // Settle before lifting, so this stays the deliberate drag it is describing.
  //
  // Dismissal is no longer distance-only — a fast pull past a velocity threshold closes the sheet
  // too. These samples are two animation frames apart, which carries 95px at roughly 1 px/ms:
  // flick speed, not the speed of someone dragging a sheet to read it. Lifting straight from that
  // last move would dismiss the panel and this story would be asserting the feature is absent,
  // while what it is actually about is the grab bar surviving a field refresh. A pause before the
  // lift models a finger that came to rest, which is what a 95px non-dismissing drag means.
  await page.waitForTimeout(180);
  await touch("touchEnd", startX, startY + 95);
  await page.waitForTimeout(60);

  const translateY = (m) => {
    if (!m || m === "none") return 0;
    const nums = m.match(/matrix(?:3d)?\(([^)]+)\)/);
    if (!nums) return 0;
    const parts = nums[1].split(",").map((n) => parseFloat(n.trim()));
    return parts.length === 6 ? parts[5] : parts[13];
  };
  const firstMove = samples[0];
  const moved = samples.filter((s) => Math.abs(translateY(s.computed) - s.dy) <= 1.5);
  record(
    "the sheet follows the finger from the very first movement",
    Math.abs(translateY(firstMove.computed) - firstMove.dy) <= 1.5,
    `after a ${firstMove.dy}px move the panel's computed transform is ${firstMove.computed} (translateY=${translateY(firstMove.computed)}px, want ${firstMove.dy}px); inline=${firstMove.inline}`,
  );
  record(
    "the sheet tracks the finger 1:1 across the whole drag",
    moved.length === samples.length,
    samples.map((s) => `${s.dy}->${Math.round(translateY(s.computed))}`).join(" "),
  );
  const downs = log.filter((e) => e.type === "pointerdown");
  record(
    "pointerdown reaches the handle with button 0",
    downs.length > 0 && downs[0].target.includes("handle") && downs[0].button === 0,
    downs.length ? `pointerdown target=${downs[0].target} button=${downs[0].button} pointerType=${downs[0].pointerType}` : "no pointerdown observed at all",
  );
  record(
    "the pointer stream is never cancelled mid-drag",
    !log.some((e) => e.type === "pointercancel"),
    `${log.filter((e) => e.type === "pointermove").length} pointermove, ${log.filter((e) => e.type === "pointercancel").length} pointercancel, ${log.filter((e) => e.type === "lostpointercapture").length} lostpointercapture`,
  );

  // ── 3. THE REBUILD: does a field commit take the handle away? ────────
  const afterRefresh = await page.evaluate(() => {
    const { refreshRecordDetailPanel } = globalThis.__drag;
    refreshRecordDetailPanel({ file: { path: "33.md", basename: "33", name: "33.md" }, frontmatter: { income: 2 }, computed: {} });
    const panel = document.querySelector(".db-record-detail-panel");
    return {
      hasPanel: !!panel,
      hasHandle: !!panel?.querySelector(".db-mobile-bottom-sheet-handle"),
      firstChild: panel?.firstElementChild?.className || "(none)",
    };
  });
  record(
    "the grab handle survives a field refresh",
    afterRefresh.hasHandle,
    `after refreshRecordDetailPanel the sheet's first child is "${afterRefresh.firstChild}"; handle present=${afterRefresh.hasHandle}`,
  );

  // A second real drag, after the refresh, is the operator's "barely works" case.
  if (afterRefresh.hasPanel) {
    const g2 = await page.evaluate(() => {
      const p = document.querySelector(".db-record-detail-panel");
      const r = p.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top) + 8 };
    });
    await touch("touchStart", g2.x, g2.y);
    await touch("touchMove", g2.x, g2.y + 40);
    const t2 = await page.evaluate(() => getComputedStyle(document.querySelector(".db-record-detail-panel")).transform);
    await touch("touchEnd", g2.x, g2.y + 40);
    record(
      "a drag still works after the sheet has refreshed its fields",
      Math.abs(translateY(t2) - 40) <= 1.5,
      `after a 40px drag on the refreshed sheet, transform=${t2} (translateY=${Math.round(translateY(t2))}px, want 40px)`,
    );
  }

  // ── 4. THE PROPERTY NAMES the positioner writes ──────────────────────
  record(
    "every declaration the positioner writes actually lands on the sheet",
    geometry.panelInlineOverflowY !== "(unset)",
    `positioner asked for overflow-y:auto and box-sizing:border-box; the panel's inline style holds`
      + ` overflow-y=${geometry.panelInlineOverflowY}, box-sizing=${geometry.panelInlineBoxSizing}`
      + ` — measured through the shared shim, which now carries the device's setProperty semantics,`
      + ` so a camelCase key here would land nowhere and this would read (unset)`,
  );


  liftedResults.push(...results);
  await page.close();
  });

await section("lifted probes: the sheet audit", async () => {
  // The nine classes that present as a phone sheet. Named rather than discovered, because the
  // audit asks whether each one gets the sheet treatment and a discovery pass would only ever find
  // the ones that already do.
  const SHEET_SURFACES = [
    "db-record-detail-panel",
    "db-owned-menu",
    "db-dropdown-popover",
    "db-cell-option-popover",
    "db-cell-edit-popover",
    "db-date-value-popover",
    "db-icon-picker-popover",
    "db-color-picker-popup",
    "db-relation-popover",
  ];

  const pageHtml = `<!doctype html><html><head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; } body { margin: 0; }
    .app-container { display: flex; width: 100vw; height: 100vh; }
    .workspace { display: flex; width: 100%; }
    .workspace-split.mod-root { flex: 1 1 auto; position: relative; overflow: hidden; }
    .note-database-container { position: relative; height: 100%; padding: 40px; }
    .workspace-leaf { position: relative; contain: strict !important; overflow: hidden; isolation: isolate; }
    .workspace-leaf, .workspace-leaf-content, .view-content { height: 100%; }
    .app-container.mod-static-nav .workspace { height: calc(100% - 80px); }
    .anchor { width: 120px; height: 28px; background: #ccd; }
    ${NAVBAR_RULE}
  </style></head>
  <body class="is-phone theme-light" style="--safe-area-inset-bottom: 34px; --background-modifier-border: #333333; --background-primary: #ffffff; ${NAVBAR_TOKENS}">
    <div class="mobile-navbar"></div>
    <div class="app-container mod-static-nav"><div class="workspace"><div class="workspace-split mod-root">
      <div class="workspace-leaf"><div class="workspace-leaf-content"><div class="view-content">
      <div class="note-database-container"><div class="anchor" id="anchor"></div></div>
      </div></div></div>
    </div></div></div>
  </body></html>`;

  // ───────────────────────────────────────────────────────────────────
  // 4. HARNESS
  // ───────────────────────────────────────────────────────────────────

  // Reduced motion, like every other page in this file, and this is the page that shows why the
  // policy exists rather than merely stating it.
  //
  // Two pages were missing it. That cost nothing while the sheet's entrance never ran — the surface
  // was at rest the instant it opened, so a rectangle read 200ms later was a layout. Now that the
  // entrance does run, the same read lands 200ms into a 260ms rise and reports the sheet 24px below
  // where it settles, which reads exactly like a placement defect and is an animation frame. The
  // checks here are about where the keyboard puts the sheet; geometry is what reduced motion leaves
  // behind, and the entrance has its own checks on the grammar page that assert it does move.
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  await page.setContent(pageHtml);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const cdp = await page.context().newCDPSession(page);
  const touch = (type, x, y) => cdp.send("Input.dispatchTouchEvent", {
    type, touchPoints: type === "touchEnd" ? [] : [{ x, y, radiusX: 12, radiusY: 12, force: 1 }],
  });

  const results = [];
  const record = (ask, name, pass, detail) => results.push({ ask, name, pass, detail });

  const openSheet = () => page.evaluate(() => {
    globalThis.__a.closeRecordDetailPanel();
    globalThis.__a.openRecordDetailPanel({
      anchorEl: document.getElementById("anchor"),
      host: document.querySelector(".note-database-container"),
      row: { file: { path: "33.md", basename: "Quarterly review", name: "33.md" }, frontmatter: { income: 1200, status: "Active", owner: "Michel" }, computed: {} },
      columns: [
        { key: "file.name", label: "Name", type: "text" },
        { key: "income", label: "Income", type: "number" },
        { key: "status", label: "Status", type: "text" },
        { key: "owner", label: "Owner", type: "text" },
      ],
      config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
      app: {},
      actions: { editCell: () => {}, openRow: () => {}, editFileName: () => {}, isReadOnly: false },
    });
  });

  await openSheet();
  await page.waitForTimeout(250);

  // ── ASK 1 — the drag ──────────────────────────────────────────────────
  const geom = await page.evaluate(() => {
    const panel = document.querySelector(".db-record-detail-panel");
    const handle = panel.querySelector(".db-mobile-bottom-sheet-handle");
    const pr = panel.getBoundingClientRect();
    const cx = Math.round(pr.left + pr.width / 2);
    const rows = [];
    for (let dy = 0; dy <= 70; dy += 1) if (document.elementFromPoint(cx, Math.round(pr.top) + dy) === handle) rows.push(dy);
    let l = null; let r = null;
    const midY = Math.round(pr.top) + rows[Math.floor(rows.length / 2)];
    for (let x = Math.round(pr.left); x <= Math.round(pr.right); x += 1) {
      if (document.elementFromPoint(x, midY) === handle) { if (l === null) l = x; r = x; }
    }
    return {
      panelTop: Math.round(pr.top), panelLeft: Math.round(pr.left), panelWidth: Math.round(pr.width),
      bandTop: rows[0], bandBottom: rows[rows.length - 1], bandRows: rows.length,
      bandLeft: l - Math.round(pr.left), bandRight: r - Math.round(pr.left), bandWidth: r - l + 1,
      midY, cx,
    };
  });

  const dragOnce = async (x, y, dy) => {
    await touch("touchStart", x, y);
    await touch("touchMove", x, y + dy);
    await page.waitForTimeout(160); // outlive the 120ms overlay transition before reading
    const t = await page.evaluate(() => {
      const p = document.querySelector(".db-record-detail-panel");
      return p ? getComputedStyle(p).transform : "gone";
    });
    await touch("touchEnd", x, y + dy);
    await page.waitForTimeout(200);
    return t;
  };
  const ty = (m) => {
    if (!m || m === "none" || m === "gone") return 0;
    const g = m.match(/matrix(?:3d)?\(([^)]+)\)/);
    if (!g) return 0;
    const p = g[1].split(",").map((n) => parseFloat(n.trim()));
    return p.length === 6 ? p[5] : p[13];
  };

  const freshDrag = await dragOnce(geom.cx, geom.midY, 60);
  record(1, "a fresh sheet follows the finger 1:1", Math.abs(ty(freshDrag) - 60) <= 1,
    `60px drag on a just-opened sheet moved it ${ty(freshDrag).toFixed(1)}px`);

  // The operator's case: the view re-renders while the sheet is open, which every
  // edit, metadata resolve and computed sync does.
  const afterRefresh = await page.evaluate(() => {
    globalThis.__a.refreshRecordDetailPanel({ file: { path: "33.md", basename: "Quarterly review", name: "33.md" }, frontmatter: { income: 1300, status: "Active", owner: "Michel" }, computed: {} });
    const panel = document.querySelector(".db-record-detail-panel");
    return { hasHandle: !!panel.querySelector(".db-mobile-bottom-sheet-handle"), firstChild: panel.firstElementChild?.className || "(none)" };
  });
  record(1, "the grab bar survives a view re-render", afterRefresh.hasHandle,
    `after one refresh the sheet's first child is "${afterRefresh.firstChild}"; grab bar present=${afterRefresh.hasHandle}`);

  const staleDrag = await dragOnce(geom.cx, geom.midY, 60);
  record(1, "a re-rendered sheet still follows the finger 1:1", Math.abs(ty(staleDrag) - 60) <= 1,
    `60px drag after a re-render moved it ${ty(staleDrag).toFixed(1)}px`);

  // ── ASK 2 — header actions aligned, 44x44 ─────────────────────────────
  await openSheet();
  await page.waitForTimeout(200);
  const header = await page.evaluate(() => {
    const panel = document.querySelector(".db-record-detail-panel");
    const open = panel.querySelector(".db-board-card-open");
    const close = panel.querySelector(".db-cell-edit-close");
    const box = (el) => { const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(1), h: +r.height.toFixed(1), cy: +(r.top + r.height / 2).toFixed(1), top: +r.top.toFixed(1), right: +r.right.toFixed(1) }; };
    return { open: box(open), close: box(close) };
  });
  record(2, "expand and close are both 44x44 on the record sheet",
    header.open.w >= 44 && header.open.h >= 44 && header.close.w >= 44 && header.close.h >= 44,
    `expand ${header.open.w}x${header.open.h}, close ${header.close.w}x${header.close.h}`);
  record(2, "expand and close share one centre line",
    Math.abs(header.open.cy - header.close.cy) <= 0.5,
    `centres differ by ${Math.abs(header.open.cy - header.close.cy).toFixed(2)}px (expand cy=${header.open.cy}, close cy=${header.close.cy})`);

  // ── ASK 3 — Notion-like rows: no gap, bigger text, a divider ──────────
  const rows = await page.evaluate(() => {
    const panel = document.querySelector(".db-record-detail-panel");
    const fields = panel.querySelectorAll(".db-record-detail-field");
    const list = panel.querySelector(".db-record-detail-fields");
    const a = fields[0].getBoundingClientRect();
    const b = fields[1].getBoundingClientRect();
    const label = fields[0].querySelector(".db-record-detail-field-label");
    const value = fields[0].querySelector(".db-board-card-value");
    const cs = (el) => getComputedStyle(el);
    return {
      count: fields.length,
      gap: +(b.top - a.bottom).toFixed(2),
      listGap: cs(list).rowGap,
      labelSize: cs(label).fontSize,
      valueSize: value ? cs(value).fontSize : "(none)",
      dividerWidth: cs(fields[0]).borderBottomWidth,
      dividerColor: cs(fields[0]).borderBottomColor,
      rowHeight: +a.height.toFixed(2),
    };
  });
  record(3, "no gap between rows", rows.gap <= 0.5, `measured gap between adjacent rows = ${rows.gap}px (row-gap token ${rows.listGap})`);
  record(3, "the row's value text is larger than the caption default",
    parseFloat(rows.valueSize) >= 16,
    `value ${rows.valueSize} (was em-derived caption size), row height ${rows.rowHeight}px`);
  // 12 14 16 18 20 24 ... is the type scale. 13 is not on it, and an off-scale size is the defect
  // a scale exists to prevent: it reads as "not quite 14" rather than as a decision.
  record(3, "the row's label size is on the type scale",
    [12, 14, 16, 18, 20, 24].includes(parseFloat(rows.labelSize)),
    `label ${rows.labelSize}; nearest scale steps are 12px and 14px`);
  record(3, "a light divider separates each row",
    parseFloat(rows.dividerWidth) > 0 && rows.dividerColor !== "rgba(0, 0, 0, 0)",
    `border-bottom ${rows.dividerWidth} ${rows.dividerColor}`);

  // ── ASK 5 — the grab band, as accepted: 35px, full width ──────────────
  // The 48px ask was closed: the band gets the chrome above the header and no more, which is
  // --db-space-6 (16) + the handle's 8px top margin + its 4px bar + its 4px bottom reach = 32px.
  // That clears WCAG 2.5.8's 24px AA target and falls short of 2.5.5's 44px AAA one, knowingly.
  // The prose record says 35px; the stylesheet's own arithmetic says 32px, and this is the number.
  record(5, "the grab band takes all the chrome above the header", geom.bandRows >= 32 && geom.bandTop <= 1,
    `band answers presses over y=${geom.bandTop}..${geom.bandBottom} of the sheet = ${geom.bandRows}px (>= the 24px WCAG 2.5.8 AA target; the written record's "35px" is 3px optimistic)`);
  // Full width less the sheet's own border and scroll gutter, which clip the band's box.
  record(5, "the grab band spans the full sheet width", geom.bandWidth >= geom.panelWidth - 4,
    `band x=${geom.bandLeft}..${geom.bandRight} = ${geom.bandWidth}px of a ${geom.panelWidth}px sheet`);

  // ── the handle exists only where a gesture drew it, across every surface ──
  //
  // A bar that says a sheet can be pulled down and then ignores the thumb reads as a frozen app
  // rather than as a missing feature, and sixteen modal sheets shipped exactly that. The repair was
  // to move the bar's creation into the gesture, so an unwired bar is unrepresentable rather than
  // merely discouraged — and the claim to check is that it holds for EVERY sheet surface, not for
  // the two the rebuild lane happens to cover.
  //
  // Both directions, per surface. Chrome alone must draw nothing: if it did, the invariant would be
  // one call away from breaking again. And the gesture must draw exactly one: a check that only
  // asserted "no unwired bar" would pass a build where the bar had stopped appearing at all.
  const handles = await page.evaluate((classes) => {
    const { applySheetChrome, attachSheetDragToDismiss, hasSheetDrag } = globalThis.__a;
    const host = document.querySelector(".note-database-container");
    const out = [];
    for (const cls of classes) {
      const el = host.createDiv({ cls });
      applySheetChrome(el, true);
      const chromeAlone = el.querySelectorAll(".db-mobile-bottom-sheet-handle").length;
      const wiredBefore = hasSheetDrag(el);
      const release = attachSheetDragToDismiss(el, () => undefined);
      const afterGesture = el.querySelectorAll(".db-mobile-bottom-sheet-handle").length;
      const wiredAfter = hasSheetDrag(el);
      if (typeof release === "function") release();
      applySheetChrome(el, false);
      el.remove();
      out.push({ cls, chromeAlone, afterGesture, wiredBefore, wiredAfter });
    }
    return out;
  }, SHEET_SURFACES);

  const drewUnwired = handles.filter((h) => h.chromeAlone > 0);
  const missingWired = handles.filter((h) => h.afterGesture !== 1);
  record(4, "chrome alone draws no grab bar, on every sheet surface",
    drewUnwired.length === 0 && handles.every((h) => !h.wiredBefore),
    `${handles.length} surfaces given the sheet treatment with no gesture attached: `
      + `${drewUnwired.length} drew a bar (${drewUnwired.map((h) => h.cls).join(", ") || "none"}). `
      + `A bar the thumb does not answer reads as a frozen app, and sixteen modal sheets shipped one`);
  record(4, "the gesture draws exactly one grab bar, on every sheet surface",
    missingWired.length === 0 && handles.every((h) => h.wiredAfter),
    `after attaching the gesture: ${handles.filter((h) => h.afterGesture === 1).length} of `
      + `${handles.length} carry exactly one bar`
      + (missingWired.length
        ? `; wrong count on ${missingWired.map((h) => `${h.cls}=${h.afterGesture}`).join(", ")}`
        : "")
      + `. Asserted beside the clause above because "no unwired bar" alone would pass a build where `
      + `the bar had stopped being drawn at all`);

  // ── ASK 6 — one fill for every sheet surface ──────────────────────────
  // Each surface is built where its owner builds it. A panel is created inside the plugin's
  // container and portalled out by applySheetChrome, which is what hands it `db-surface` and the
  // token scope; a bare div parked on the body instead takes applySheetChrome's already-on-the-body
  // early return, never receives that class, and measures transparent for a reason that has nothing
  // to do with the fill under test. The owned menu is measured through its own constructor, since it
  // is the one surface that really does mount itself on the body.
  // Each surface is built under an ancestor that declares its OWN `--background-primary`.
  //
  // The previous version of this built all nine in one parent, so they inherited one value from one
  // node and the comparison could only ever re-read a single declaration nine times. It could not
  // see the shape the ask came from — a host scoping `--background-primary` differently under a
  // modal — because nothing in it ever varied by ancestor.
  //
  // So the ancestors vary here, deliberately and distinctly: nine wrappers, nine different values,
  // none of them the value the sheets should end up painting. If a surface resolved its fill from
  // where it was BUILT, the nine would come back nine different colours. They do not, and the reason
  // is structural rather than stylistic: `setSheetMount` appends every sheet to `document.body`, so
  // a surface stops inheriting from its builder the moment it becomes a sheet. That is a stronger
  // claim than "one rule declares the fill", and it is the one that answers the ask.
  const fills = await page.evaluate((classes) => {
    const { applySheetChrome, createOwnedMenu } = globalThis.__a;
    const host = document.querySelector(".note-database-container");
    const out = {};
    const parents = {};
    const wrappers = [];
    classes.forEach((cls, index) => {
      // Nine values a theme might plausibly scope, all far from the sheet's own fill so a leak shows.
      const wrapper = host.createDiv({ cls: "sheet-fill-ancestor" });
      wrapper.style.setProperty("--background-primary", `rgb(${20 + index * 25}, ${index * 20}, ${200 - index * 20})`);
      wrappers.push(wrapper);
      const el = cls === "db-owned-menu" ? createOwnedMenu(document).el : wrapper.createDiv({ cls });
      if (cls === "db-owned-menu") wrapper.appendChild(el);
      applySheetChrome(el, true);
      out[cls] = getComputedStyle(el).backgroundColor;
      parents[cls] = el.parentElement === document.body ? "body" : (el.parentElement?.className || "detached");
      applySheetChrome(el, false);
      el.remove();
    });
    // The control lives in the same run: one surface given the same varied ancestor and NOT made a
    // sheet. It has to read its wrapper's colour, or the nine agreeing above proves nothing about
    // the portal — they would agree just as well if the property were never inherited at all.
    const unportalled = wrappers[0].createDiv({ cls: classes[0] });
    const unportalledFill = getComputedStyle(unportalled).backgroundColor;
    const wrapperValue = getComputedStyle(wrappers[0]).getPropertyValue("--background-primary").trim();
    unportalled.remove();
    for (const w of wrappers) w.remove();
    return { out, parents, unportalledFill, wrapperValue };
  }, SHEET_SURFACES);
  const distinct = [...new Set(Object.values(fills.out))];
  const allOnBody = Object.values(fills.parents).every((p) => p === "body");
  record(6, "every sheet surface paints the same fill, from nine different ancestors", distinct.length === 1,
    distinct.length === 1
      ? `all ${SHEET_SURFACES.length} surfaces measure ${distinct[0]} despite being built under nine `
        + `wrappers each declaring its own --background-primary`
      : `${distinct.length} different fills: ` + Object.entries(fills.out).map(([k, v]) => `${k}=${v}`).join("  "));
  record(6, "the agreement is the portal, not the ancestor each was built under", allOnBody,
    `mount after the sheet treatment: ${[...new Set(Object.values(fills.parents))].join(", ")} `
      + `(setSheetMount appends to document.body, so a host rule scoped under a modal cannot reach a sheet)`);
  // Without this the pair above is vacuous: if `--background-primary` reached nothing, nine
  // surfaces would agree for the wrong reason and the check would pass on a stylesheet that had
  // stopped using the variable at all.
  record(6, "PREMISE the varied ancestor does reach an unportalled surface",
    fills.unportalledFill !== distinct[0] && fills.wrapperValue !== "",
    `the same class left unportalled under wrapper 1 measures ${fills.unportalledFill} against the `
      + `sheets' ${distinct[0]}; the wrapper declares --background-primary: ${fills.wrapperValue || "(nothing)"}`);

  // ── the sheet covers the navbar, hit-tested against the host's own rule ──
  //
  // This was recorded unmeasurable, and the objection was right about the harness rather than about
  // the sheet: the navbar it hit-tested was a hand-written div carrying `height: 72px` and
  // `z-index: 100`, and both numbers were inventions. The installed application stylesheet gives
  // `.mobile-navbar` `position: fixed`, `height: 80px`, full width — and **no z-index at all**. An
  // invented stacking context made the navbar win a contest it does not enter on a device, so a
  // check reading through it was measuring the invention.
  //
  // With the real rule in the page the question becomes answerable, and it is answered by a hit
  // test rather than by comparing declared z-indexes: what a thumb reaches is what
  // `elementFromPoint` returns, and a sheet that merely declares a higher layer while something
  // else takes the press is the defect this is about.
  await openSheet();
  await page.waitForTimeout(200);
  const navbarCover = await page.evaluate(() => {
    const nav = document.querySelector(".mobile-navbar");
    const panel = document.querySelector(".db-record-detail-panel");
    const scrim = document.querySelector(".db-mobile-sheet-scrim");
    if (!nav || !panel) return null;
    const navBox = nav.getBoundingClientRect();
    const x = Math.round(navBox.left + navBox.width / 2);
    const y = Math.round(navBox.top + navBox.height / 2);
    const hit = document.elementFromPoint(x, y);
    const describe = (el) => (el ? `${el.tagName.toLowerCase()}.${String(el.className || "").split(" ").filter(Boolean).join(".") || "(none)"}` : "nothing");
    const scrimBox = scrim ? scrim.getBoundingClientRect() : null;
    return {
      navHeight: Math.round(navBox.height),
      navZ: getComputedStyle(nav).zIndex,
      panelZ: getComputedStyle(panel).zIndex,
      at: describe(hit),
      insidePanel: Boolean(hit && panel.contains(hit)),
      isPanel: hit === panel,
      panelBottom: Math.round(panel.getBoundingClientRect().bottom),
      viewportH: window.innerHeight,
      scrimCoversNavBand: Boolean(scrimBox && scrimBox.top <= 0.5 && scrimBox.bottom >= window.innerHeight - 0.5
        && scrimBox.left <= 0.5 && scrimBox.right >= window.innerWidth - 0.5),
      scrimBox: scrimBox
        ? `${Math.round(scrimBox.left)},${Math.round(scrimBox.top)} ${Math.round(scrimBox.width)}x${Math.round(scrimBox.height)}`
        : "(no scrim)",
    };
  });

  record(7, "a press at the navbar's centre reaches the sheet, not the navbar",
    Boolean(navbarCover) && navbarCover.navHeight === 80 && (navbarCover.isPanel || navbarCover.insidePanel),
    navbarCover
      ? `the navbar is ${navbarCover.navHeight}px with z-index ${navbarCover.navZ} — the host declares none — `
        + `and a press at its centre lands on ${navbarCover.at}. The sheet reads z-index ${navbarCover.panelZ}. `
        + `The height is asserted at 80 because this used to be a hand-written 72px div at z-index 100, and a `
        + `check that passed against that was reading an invention`
      : "no navbar or no panel in the page — the harness cannot observe this at all");

  record(7, "the scrim covers the whole viewport, navbar band included",
    Boolean(navbarCover) && navbarCover.scrimCoversNavBand,
    navbarCover
      ? `scrim box ${navbarCover.scrimBox} against a ${navbarCover ? 390 : 0}x${navbarCover.viewportH} viewport. `
        + `A scrim stopping short of the navbar leaves a live strip of the app under a modal surface`
      : "no navbar or no panel in the page");

  // ── ASK 7 — the scrim: modal, 25% black, and out of the drag's way ────
  await openSheet();
  await page.waitForTimeout(200);
  const scrim = await page.evaluate(() => {
    const s = document.querySelector(".db-mobile-sheet-scrim");
    const panel = document.querySelector(".db-record-detail-panel");
    const handle = panel.querySelector(".db-mobile-bottom-sheet-handle");
    const cs = getComputedStyle(s);
    const pr = panel.getBoundingClientRect();
    // Behind the sheet: does the scrim take the press instead of the table?
    const behind = document.elementFromPoint(Math.round(pr.left + pr.width / 2), Math.round(pr.top) - 120);
    // On the grab band: does the scrim steal it?
    const onBand = document.elementFromPoint(Math.round(pr.left + pr.width / 2), Math.round(pr.top) + 12);
    return {
      background: cs.backgroundColor,
      pointerEvents: cs.pointerEvents,
      scrimZ: cs.zIndex,
      sheetZ: getComputedStyle(panel).zIndex,
      behind: behind?.className || behind?.tagName || "(nothing)",
      behindIsScrim: behind === s,
      onBandIsHandle: onBand === handle,
    };
  });
  record(7, "the scrim is a 25% black modal layer", scrim.background === "rgba(0, 0, 0, 0.25)" && scrim.pointerEvents === "auto",
    `background ${scrim.background}, pointer-events ${scrim.pointerEvents}`);
  record(7, "the scrim blocks the app behind the sheet", scrim.behindIsScrim,
    `a press 120px above the sheet lands on "${scrim.behind}"`);
  record(7, "the scrim does not steal the grab band", scrim.onBandIsHandle,
    `a press on the band lands on the ${scrim.onBandIsHandle ? "grab handle" : "scrim"}; sheet z=${scrim.sheetZ}, scrim z=${scrim.scrimZ}`);

  // ── ASK 4 — the keyboard inset, driven through the shipped lever ──────
  //
  // Two host signals announce a software keyboard and they do not behave the same.
  // iOS shrinks visualViewport and leaves window.innerHeight alone; Android fires a
  // window resize as well. The sheet reacts to both, and it reacts to them in
  // opposite directions, so each is driven separately.
  await openSheet();
  await page.waitForTimeout(200);
  const kbVisual = await page.evaluate(async () => {
    const panel = document.querySelector(".db-record-detail-panel");
    const before = Math.round(panel.getBoundingClientRect().bottom);
    document.documentElement.style.setProperty("--keyboard-height", "336px");
    // The iOS-shaped signal: visualViewport changes, window does not.
    window.visualViewport?.dispatchEvent(new Event("resize"));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const live = document.querySelector(".db-record-detail-panel");
    const out = live
      ? { survived: true, before, bottom: Math.round(live.getBoundingClientRect().bottom), top: Math.round(live.getBoundingClientRect().top), varValue: live.style.getPropertyValue("--db-mobile-sheet-bottom"), maxH: getComputedStyle(live).maxHeight }
      : { survived: false, before };
    document.documentElement.style.removeProperty("--keyboard-height");
    window.visualViewport?.dispatchEvent(new Event("resize"));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const back = document.querySelector(".db-record-detail-panel");
    return { ...out, restored: back ? Math.round(back.getBoundingClientRect().bottom) : null, viewport: window.innerHeight };
  });
  record(4, "a declared keyboard height lifts the sheet clear of it",
    kbVisual.survived && kbVisual.viewport - kbVisual.bottom >= 330,
    kbVisual.survived
      ? `--keyboard-height:336px moved the sheet's bottom edge ${kbVisual.before} -> ${kbVisual.bottom} on an ${kbVisual.viewport}px screen (clearance ${kbVisual.viewport - kbVisual.bottom}px); lever var=${kbVisual.varValue}; `
        + `(harness-supplied --keyboard-height=336px; a device where the host publishes nothing is `
        + `covered by "the keyboard inset falls back to the visual viewport when the host declares nothing")`
      : "the sheet was destroyed before any inset could be applied");
  record(4, "lifting the sheet does not push its top off the screen",
    kbVisual.survived && kbVisual.top >= 0,
    kbVisual.survived ? `top edge at y=${kbVisual.top}, max-height ${kbVisual.maxH}` : "n/a — sheet gone");
  record(4, "the sheet returns to the floor when the keyboard closes",
    kbVisual.restored !== null && Math.abs(kbVisual.restored - kbVisual.viewport) <= 1,
    kbVisual.restored === null ? "n/a — sheet gone" : `bottom edge back at ${kbVisual.restored} of ${kbVisual.viewport}`);

  // The fallback ON ITS OWN, with the host variable absent.
  //
  // Every keyboard reading above comes through `--keyboard-height`, which only Obsidian writes. On
  // a host that does not write it — an older release, a platform whose keyboard plugin is missing —
  // the inset has to come from the visual viewport shrinking instead, and nothing here had ever
  // shrunk it. So the branch that carries those hosts was the one branch never exercised.
  //
  // `visualViewport` cannot be resized from a test, so it is replaced with a stub reporting the
  // shrink a keyboard causes. What is under test is the arithmetic that reads it, and that is the
  // half a host cannot supply.
  const kbFallback = await page.evaluate(async () => {
    const { publishKeyboardInset } = globalThis.__p;
    const host = document.querySelector(".note-database-container");
    if (!host) return { ran: false };
    // Host variable absent, which is the whole premise.
    document.documentElement.style.removeProperty("--keyboard-height");
    const real = window.visualViewport;
    const shrunk = 336;
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: {
        height: window.innerHeight - shrunk,
        offsetTop: 0,
        scale: 1,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      },
    });
    const stop = publishKeyboardInset(host);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const observed = host.style.getPropertyValue("--db-keyboard-inset");
    stop();
    Object.defineProperty(window, "visualViewport", { configurable: true, value: real });
    return { ran: true, observed, want: `${shrunk}px`, declared: document.documentElement.style.getPropertyValue("--keyboard-height") || "(absent)" };
  });
  record(4, "the keyboard inset falls back to the visual viewport when the host declares nothing",
    kbFallback.ran && kbFallback.observed === kbFallback.want,
    kbFallback.ran
      ? `--keyboard-height ${kbFallback.declared}, visual viewport shrunk by 336px, published --db-keyboard-inset=${kbFallback.observed} (want ${kbFallback.want})`
      : "no container to publish onto");

  // The Android-shaped signal: the window itself resizes. Driven by resizing the page rather than
  // by dispatching a synthetic event, so the geometry the handler reads actually changed — a
  // dispatched `resize` on an unchanged viewport passes any width comparison for free.
  //
  // Both directions, because "never close" is a one-line rig that satisfies the first half. A
  // keyboard takes height and leaves the width alone; a rotation moves the width. The sheet has to
  // survive the first and not the second, and the pair is what says the handler is reading the
  // geometry rather than ignoring the event.
  await openSheet();
  await page.waitForTimeout(200);
  await page.setViewportSize({ width: 390, height: 508 });
  await page.waitForTimeout(120);
  const kbWindow = await page.evaluate(() => {
    const live = document.querySelector(".db-record-detail-panel");
    return {
      survived: Boolean(live),
      bottom: live ? Math.round(live.getBoundingClientRect().bottom) : null,
      viewport: window.innerHeight,
      width: window.innerWidth,
    };
  });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(120);
  const rotated = await page.evaluate(() => ({
    survived: Boolean(document.querySelector(".db-record-detail-panel")),
    width: window.innerWidth,
  }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(120);
  record(4, "the sheet survives the window resize a keyboard causes, and not the one a rotation causes",
    kbWindow.survived && kbWindow.bottom === kbWindow.viewport && !rotated.survived,
    kbWindow.survived
      ? `the viewport shrank 844 -> ${kbWindow.viewport} at an unchanged width of ${kbWindow.width}:`
        + ` the sheet is still open and still on the floor, bottom edge ${kbWindow.bottom} of`
        + ` ${kbWindow.viewport}. Rotating to ${rotated.width} wide closed it=${!rotated.survived},`
        + ` which is what says the handler reads the geometry rather than ignoring the event`
      : "one window resize closed the record sheet outright — openRecordDetailPanel registers"
        + " onResize = close(), so on a host that resizes the window for its keyboard the sheet is"
        + " gone before any inset can be applied");

  // ── ASK 8 — one row grammar across sheets ─────────────────────────────
  const grammar = await page.evaluate(() => {
    const { createOwnedMenu, createMenuRow, applySheetChrome } = globalThis.__a;
    const measure = (host) => {
      const row = createMenuRow(host, { label: "Duplicate", icon: "copy" }).row;
      const cs = getComputedStyle(row);
      const r = row.getBoundingClientRect();
      return { minHeight: cs.minHeight, padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`, height: +r.height.toFixed(1), cls: row.className };
    };
    const menu = createOwnedMenu(document);
    const menuEl = menu.el || menu.dom || menu.containerEl;
    document.body.appendChild(menuEl);
    applySheetChrome(menuEl, true);
    const inMenuSheet = measure(menuEl);
    const bare = document.body.createDiv({ cls: "db-record-detail-panel" });
    applySheetChrome(bare, true);
    const inPanelSheet = measure(bare);
    applySheetChrome(menuEl, false); applySheetChrome(bare, false);
    menuEl.remove(); bare.remove();
    return { inMenuSheet, inPanelSheet };
  });
  record(8, "a menu row lays out identically in any sheet",
    grammar.inMenuSheet.minHeight === grammar.inPanelSheet.minHeight
    && grammar.inMenuSheet.padding === grammar.inPanelSheet.padding
    && Math.abs(grammar.inMenuSheet.height - grammar.inPanelSheet.height) <= 0.5,
    `owned-menu sheet: min-height ${grammar.inMenuSheet.minHeight}, padding ${grammar.inMenuSheet.padding}, height ${grammar.inMenuSheet.height}px | panel sheet: min-height ${grammar.inPanelSheet.minHeight}, padding ${grammar.inPanelSheet.padding}, height ${grammar.inPanelSheet.height}px`);
  record(8, "a sheet row meets the 44px thumb floor",
    grammar.inMenuSheet.height >= 44 && grammar.inPanelSheet.height >= 44,
    `owned-menu row ${grammar.inMenuSheet.height}px, panel row ${grammar.inPanelSheet.height}px`);

  // ── The declarations the positioner writes but the phone never gets ───
  await openSheet();
  await page.waitForTimeout(200);
  const dropped = await page.evaluate(() => {
    const panel = document.querySelector(".db-record-detail-panel");
    return {
      overflowY: panel.style.getPropertyValue("overflow-y") || "(unset)",
      overscroll: panel.style.getPropertyValue("overscroll-behavior") || "(unset)",
      computedOverflowY: getComputedStyle(panel).overflowY,
    };
  });
  record(0, "every declaration placeSheet writes reaches the sheet",
    dropped.overflowY !== "(unset)",
    `placeSheet asks for overflowY:auto and overscrollBehavior:contain; inline holds overflow-y=${dropped.overflowY}, overscroll-behavior=${dropped.overscroll}; computed overflow-y=${dropped.computedOverflowY}`);


  liftedResults.push(...results);
  await page.close();
  });

// ───────────────────────────────────────────────────────────────────
// 5b. THE SHEET'S INLINE EDITOR — where the editor lands once a row is tapped
// ───────────────────────────────────────────────────────────────────
//
// Every check above measures a surface at rest. The reported defect only exists
// while a row is being edited, so this section drives the real thing: it opens
// the record sheet, wires the sheet's editCell action to the shipped
// CellRenderer, and taps a value the way a finger does. Nothing here builds an
// editor by hand — a fixture that fakes the edit state would measure the
// fixture.
//
// What comes back is not one editor but four, and only one of them is inline.
// A number or currency cell gets `.db-cell-line-edit-popover`, sized and placed
// against the value it replaces, which is the one a reader expects to sit on the
// label's line. Text and date get a full-width overlay docked below the row, and
// a select gets a list popover; those are deliberately different affordances and
// are measured for containment rather than for alignment.
//
// The inline one is an absolutely positioned child of the sheet, not a flex
// child of the row. That distinction decides the whole fix: an out-of-flow box
// cannot make its row grow, so "the row contains the editor" has to be bought by
// sizing the editor to the row rather than by letting the row stretch.

const inlineEditResults = [];

await section("the sheet's inline editor", async () => {
  const results = [];
  const record = (name, pass, detail) => results.push({ name, pass, detail });

  // The body carries `--font-ui-medium` for the same reason the bare-control rule exists: the host
  // declares it and a page that omits it measures the plugin's fallback rather than what ships.
  //
  // This one is load-bearing here and nowhere else on this page. The record title sizes from that
  // token and declares no line-height, so it inherits the container's unitless one — which means its
  // line box is the HOST's font size times the plugin's ratio, and is not computable from the
  // plugin's scale alone. With the token absent the token reference is invalid at computed-value
  // time, `font-size` falls back to the inherited value, and the title renders two steps smaller
  // than a device ever shows it. Every measurement taken against that title is then a measurement of
  // a box no reader has.
  const pageHtml = (phone) => `<!doctype html><html><head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; } body { margin: 0; }
    .app-container { display: flex; width: 100vw; height: 100vh; }
    .workspace { display: flex; width: 100%; }
    .workspace-split.mod-root { flex: 1 1 auto; position: relative; overflow: hidden; }
    .workspace-split.mod-right-split { width: ${SIDEBAR}px; flex: 0 0 ${SIDEBAR}px; background: #eee; }
    .is-phone .workspace-split.mod-right-split { display: none; }
    .note-database-container { position: relative; height: 100%; padding: 40px; }
    .workspace-leaf { position: relative; contain: strict !important; overflow: hidden; isolation: isolate; }
    .workspace-leaf, .workspace-leaf-content, .view-content { height: 100%; }
    .app-container.mod-static-nav .workspace { height: calc(100% - 80px); }
    .anchor { width: 120px; height: 28px; background: #ccd; }
    ${NAVBAR_RULE}
  </style></head>
  <body class="${phone ? "is-phone " : ""}theme-light" style="--safe-area-inset-bottom: 34px; --background-modifier-border: #333333; --background-primary: #ffffff; --font-ui-medium: 15px; ${NAVBAR_TOKENS}">
    ${phone ? '<div class="mobile-navbar"></div>' : ""}
    <div class="app-container${phone ? " mod-static-nav" : ""}"><div class="workspace"><div class="workspace-split mod-root">
      <div class="workspace-leaf"><div class="workspace-leaf-content"><div class="view-content">
      <div class="note-database-container"><div class="anchor" id="anchor"></div></div>
      </div></div></div>
    </div><div class="workspace-split mod-right-split"></div></div></div>
  </body></html>`;

  // Runs inside the page. Opens the sheet through the shipped opener, taps every
  // editable value through the shipped renderer, and reports the geometry each
  // tap produced. `hostileInputCss` is how a host stylesheet that inflates every
  // input is simulated — Obsidian's own app.css is not loaded here, and on a real
  // phone it makes this editor taller than the plugin's stylesheet alone does.
  const measure = async (hostileInputCss) => {
    const { openRecordDetailPanel, closeRecordDetailPanel, CellRenderer } = globalThis.__edit;
    const row = {
      file: { path: "33.md", basename: "Quarterly review", name: "33.md" },
      frontmatter: { income: 4736.32, subs: 254.39, note: "Some text", when: "2026-08-20", status: "Active" },
      computed: {},
    };
    const columns = [
      { key: "file.name", label: "Name", type: "text" },
      { key: "income", label: "Income", type: "number" },
      { key: "subs", label: "Subscriptions", type: "currency" },
      { key: "note", label: "Note", type: "text" },
      { key: "when", label: "When", type: "date" },
      { key: "status", label: "Status", type: "select", options: [{ value: "Active" }, { value: "Done" }] },
    ];
    // The renderer only needs a data source to save through, and nothing here saves.
    const cellRenderer = new CellRenderer({ openNote() {}, getRows: () => [row] }, async () => {});

    if (hostileInputCss) {
      const style = document.createElement("style");
      style.id = "hostile-host-css";
      style.textContent = hostileInputCss;
      document.head.appendChild(style);
    }

    closeRecordDetailPanel();
    openRecordDetailPanel({
      anchorEl: document.getElementById("anchor"),
      host: document.querySelector(".note-database-container"),
      row,
      columns,
      config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
      app: {},
      actions: {
        editCell: (target, r, col, event) => cellRenderer.startEdit(target, r, col, event),
        openRow: () => {},
        // Wired to the shipped renderer, exactly like the cell action beside it. A stub here
        // renders no editor, so the title's rename had no geometry to measure and the surface's
        // second inline editor was invisible to every check on this page.
        editFileName: (target, r, currentName) => cellRenderer.editFileName(target, r, currentName),
        isReadOnly: false,
      },
    });

    const panel = document.querySelector(".db-record-detail-panel");
    const raf = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    // The sheet slides in. Measuring before it lands reads a moving rectangle.
    await new Promise((r) => setTimeout(r, 450));
    await raf();

    const rect = (el) => {
      const r = el.getBoundingClientRect();
      return {
        top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), left: +r.left.toFixed(1),
        height: +r.height.toFixed(1), centreY: +((r.top + r.bottom) / 2).toFixed(1),
      };
    };

    const out = { isSheet: panel.classList.contains("db-mobile-bottom-sheet"), fields: [] };
    for (const fieldRow of [...panel.querySelectorAll(".db-record-detail-field")]) {
      const label = fieldRow.querySelector(".db-record-detail-field-label");
      const value = fieldRow.querySelector(".db-board-card-value");
      if (!label || !value) continue;
      const valueAtRest = rect(value);

      value.click();
      await raf();
      await new Promise((r) => setTimeout(r, 40));
      await raf();

      // Document-wide: the desktop panel hosts its editor on the container, the
      // sheet hosts it on itself, and a check that looked in only one would find
      // nothing on the other and read that as "no defect".
      const editor = document.querySelector(".db-cell-edit-popover, .db-cell-option-popover")
        || document.querySelector("input.db-cell-input, textarea.db-cell-input");
      const input = editor ? (editor.matches("input, textarea") ? editor : editor.querySelector("input, textarea")) : null;
      const rowRect = rect(fieldRow);
      const labelRect = rect(label);
      const editorRect = editor ? rect(editor) : null;

      out.fields.push({
        label: label.textContent,
        cls: editor ? editor.className : "(no editor opened)",
        inline: Boolean(editor && editor.classList.contains("db-cell-line-edit-popover")),
        position: editor ? getComputedStyle(editor).position : null,
        inFlowChildOfRow: Boolean(editor && fieldRow.contains(editor) && getComputedStyle(editor).position === "static"),
        marginTop: editor ? getComputedStyle(editor).marginTop : null,
        valueHeightAtRest: valueAtRest.height,
        rowTop: rowRect.top, rowBottom: rowRect.bottom, rowHeight: rowRect.height,
        labelCentreY: labelRect.centreY,
        editorTop: editorRect ? editorRect.top : null,
        editorBottom: editorRect ? editorRect.bottom : null,
        editorHeight: editorRect ? editorRect.height : null,
        inputHeight: input ? rect(input).height : null,
        centreDelta: editorRect ? +(editorRect.centreY - labelRect.centreY).toFixed(1) : null,
        overflowBelow: editorRect ? +(editorRect.bottom - rowRect.bottom).toFixed(1) : null,
        overflowAbove: editorRect ? +(rowRect.top - editorRect.top).toFixed(1) : null,
      });

      document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await raf();
    }
    // The surface's OTHER inline editor. The title is not a field row, so the loop above never
    // reaches it, and it opens on a double-click rather than a click — either difference alone is
    // enough to keep it out of a check that only walks the rows and only clicks.
    //
    // It matters because it lands on the same absolutely-positioned popover as a value does, and
    // therefore inherits the same height and the same centring correction, while anchoring on a
    // line box of its own. Whether one correction can serve both anchors is only answerable by
    // measuring the second one.
    const titleEl = panel.querySelector(".db-record-detail-title");
    const titleAtRest = rect(titleEl);
    const titleCs = getComputedStyle(titleEl);
    titleEl.dispatchEvent(new window.MouseEvent("dblclick", { bubbles: true, cancelable: true, view: window }));
    await raf();
    await new Promise((r) => setTimeout(r, 40));
    await raf();
    const titleEditor = document.querySelector(".db-cell-edit-popover, .db-cell-option-popover");
    const titleEditorRect = titleEditor ? rect(titleEditor) : null;
    out.title = {
      cls: titleEditor ? titleEditor.className : "(no editor opened)",
      // The rename reaches the shared single-line popover through the renderer, so it is subject to
      // the sheet's popover rules. If it ever stops doing so the geometry below measures a
      // different box and would read as "no defect" rather than as a changed mechanism.
      inline: Boolean(titleEditor && titleEditor.classList.contains("db-cell-line-edit-popover")),
      columnKey: titleEditor ? titleEditor.dataset.noteDatabaseColumnKey || "(none)" : null,
      marginTop: titleEditor ? getComputedStyle(titleEditor).marginTop : null,
      // The anchor's own metrics, read rather than derived. The title takes its size from a HOST
      // token and declares no line-height of its own, so both numbers depend on what the host
      // supplies and neither can be computed from the plugin's own scale.
      fontSize: titleCs.fontSize,
      lineHeight: titleCs.lineHeight,
      titleTop: titleAtRest.top, titleBottom: titleAtRest.bottom, titleHeight: titleAtRest.height,
      titleCentreY: titleAtRest.centreY,
      editorTop: titleEditorRect ? titleEditorRect.top : null,
      editorBottom: titleEditorRect ? titleEditorRect.bottom : null,
      editorHeight: titleEditorRect ? titleEditorRect.height : null,
      centreDelta: titleEditorRect ? +(titleEditorRect.centreY - titleAtRest.centreY).toFixed(1) : null,
    };
    document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await raf();

    document.getElementById("hostile-host-css")?.remove();
    return out;
  };

  const runOn = async (phone, hostileInputCss) => {
    const page = await browser.newPage(phone
      ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }
      : { viewport: VIEWPORT });
    await page.setContent(pageHtml(phone));
    await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
    await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
    await page.addScriptTag({ content: positionerJs });
    const out = await page.evaluate(measure, hostileInputCss);
    await page.close();
    return out;
  };

  // A host stylesheet the plugin does not control. Obsidian's app.css gives every
  // input its own height, which is why the editor on a real phone is taller than
  // the one this harness builds from styles.css alone. The number is a stress
  // value, not a claim about what Obsidian sets — what it proves is that the fix
  // holds as the input grows instead of only at the height measured here.
  const HOSTILE = "input { min-height: 50px !important; padding: 14px 12px !important; }";

  const phone = await runOn(true, null);
  const phoneInflated = await runOn(true, HOSTILE);
  const desktop = await runOn(false, null);

  const inlineOf = (run) => run.fields.filter((f) => f.inline);
  // A centre offset is wrong in either direction, so it is measured absolutely.
  const worst = (rows, pick) => rows.reduce((a, f) => Math.max(a, Math.abs(pick(f))), 0);
  // An overhang is only ever the positive excursion: an editor that stops short of
  // the row's edge has not overflowed it, and measuring that absolutely would
  // report the clearance as the defect.
  const worstOverhang = (rows, pick) => rows.reduce((a, f) => Math.max(a, pick(f)), 0);

  const sheetInline = inlineOf(phone);
  const describe = (rows) => rows.map((f) => `${f.label}: row [${f.rowTop}..${f.rowBottom}] h=${f.rowHeight},`
    + ` editor [${f.editorTop}..${f.editorBottom}] h=${f.editorHeight},`
    + ` labelCentre=${f.labelCentreY} editorCentre=${(f.labelCentreY + f.centreDelta).toFixed(1)}`).join(" | ");

  record("the sheet opens an inline editor on a number row",
    phone.isSheet && sheetInline.length === 2,
    `${sheetInline.length} of ${phone.fields.length} sheet rows opened .db-cell-line-edit-popover`
      + ` (${phone.fields.map((f) => `${f.label}=${f.cls.replace("db-cell-edit-popover ", "")}`).join(", ")})`);

  // Pinning the shape, because the fix depends on it. An out-of-flow editor is
  // sized to its row; an in-flow one would let the row size itself, and the
  // correction below would then be a double count.
  record("the sheet's inline editor is an overlay, not a child of its row",
    sheetInline.length > 0 && sheetInline.every((f) => f.position === "absolute" && !f.inFlowChildOfRow),
    sheetInline.map((f) => `${f.label}: position=${f.position}, in-flow child of the row=${f.inFlowChildOfRow}`).join(" | "));

  record("the sheet's inline editor sits on its label's centre line",
    sheetInline.length > 0 && worst(sheetInline, (f) => f.centreDelta) <= 1,
    `worst centre offset ${worst(sheetInline, (f) => f.centreDelta)}px (want <= 1px) — ${describe(sheetInline)}`);

  // ── THE SECOND INLINE EDITOR: the title's rename ─────────────────────
  //
  // Two assertions, and the first is what makes the second mean anything. The rename reaches the
  // shared single-line popover, so it is governed by the sheet's popover rules; if it ever stops
  // doing so, the geometry assertion would be measuring some other box and would pass while the
  // rename sat anywhere at all.
  record("the sheet's title opens the same inline editor a value does",
    phone.title.inline && phone.title.columnKey === "file.name",
    `a double-click on the title opened "${phone.title.cls}" for column ${phone.title.columnKey}`
      + ` — wired through the shipped renderer, not a stub; a stub here rendered no editor at all and`
      + ` left this surface's second inline editor unmeasured`);

  // The correction the popover carries is written in terms of the VALUE's line box. The title's is
  // its own, and it is not the plugin's to set: the title sizes from a host token and declares no
  // line-height, so its box is whatever the host's UI font makes it. That is why this reports both
  // metrics rather than only the offset — the offset alone cannot say which of the two moved.
  record("the sheet's rename editor sits on the title's centre line",
    phone.title.inline && Math.abs(phone.title.centreDelta) <= 1,
    `centre offset ${phone.title.centreDelta}px (want <= 1px) — title [${phone.title.titleTop}..${phone.title.titleBottom}]`
      + ` h=${phone.title.titleHeight} at ${phone.title.fontSize}/${phone.title.lineHeight},`
      + ` editor [${phone.title.editorTop}..${phone.title.editorBottom}] h=${phone.title.editorHeight}`
      + ` carrying margin-top ${phone.title.marginTop}; the value editor beside it measures`
      + ` ${worst(sheetInline, (f) => f.centreDelta)}px against a ${sheetInline[0]?.valueHeightAtRest}px line box`);

  record("the sheet's inline editor stays inside its row",
    sheetInline.length > 0
      && worstOverhang(sheetInline, (f) => f.overflowBelow) <= 1
      && worstOverhang(sheetInline, (f) => f.overflowAbove) <= 1,
    `worst overhang ${worstOverhang(sheetInline, (f) => f.overflowBelow)}px past the row's bottom edge and`
      + ` ${worstOverhang(sheetInline, (f) => f.overflowAbove)}px past its top (want <= 1px each) — ${describe(sheetInline)}`);

  record("the sheet's inline editor meets the 44px thumb floor",
    sheetInline.length > 0 && sheetInline.every((f) => f.editorHeight >= 44),
    `editor heights ${sheetInline.map((f) => `${f.label}=${f.editorHeight}px`).join(", ")} (want >= 44px,`
      + ` the same floor the sheet's textarea editor already holds)`);

  const inflated = inlineOf(phoneInflated);
  record("the sheet's inline editor holds its row when the host inflates every input",
    inflated.length > 0
      && worst(inflated, (f) => f.centreDelta) <= 1
      && worstOverhang(inflated, (f) => f.overflowBelow) <= 1
      && worstOverhang(inflated, (f) => f.overflowAbove) <= 1,
    `with ${HOSTILE} applied: worst centre offset ${worst(inflated, (f) => f.centreDelta)}px,`
      + ` worst overhang ${worstOverhang(inflated, (f) => f.overflowBelow)}px below / ${worstOverhang(inflated, (f) => f.overflowAbove)}px above`
      + ` (want <= 1px each); inner input measured ${inflated.map((f) => `${f.inputHeight}px`).join(", ")}`);

  // The desktop guard. The anchored panel shares this markup and carries the same
  // defect — a 34.8px editor top-aligned onto an 18.8px value inside a 26.8px row,
  // so 8px below the label's line and 12px past the row. It is deliberately out of
  // scope here, which makes "unchanged" the thing to prove, so its geometry is
  // pinned to what was measured before this phase touched anything.
  //
  // Pinned to the defect's own numbers, deliberately. A later phase that fixes
  // desktop has to update them, which is right: that is a change to a frozen
  // surface and should not pass silently.
  //
  // The cheaper guard — assert the desktop editor's margin-top is still 0px — was
  // written first and does not work. Unscoping both selectors, which is the mistake
  // this exists to catch, still left margin-top reading 0px, because
  // `--db-sheet-row-min-height` is declared only on the sheet and off it the whole
  // declaration is invalid at computed-value time and falls back to the initial
  // value. The input rule leaked anyway and shrank the desktop editor to 31px.
  // Only measuring the rectangle sees that.
  const DESKTOP_FROZEN = { height: 34.8, centreDelta: 8, overflowBelow: 12 };
  const desktopInline = inlineOf(desktop);
  const frozen = (f) => Math.abs(f.editorHeight - DESKTOP_FROZEN.height) <= 0.5
    && Math.abs(f.centreDelta - DESKTOP_FROZEN.centreDelta) <= 0.5
    && Math.abs(f.overflowBelow - DESKTOP_FROZEN.overflowBelow) <= 0.5;
  record("the desktop record panel's editor geometry is frozen by this phase",
    desktopInline.length > 0 && desktopInline.every(frozen),
    `want height ${DESKTOP_FROZEN.height}px, centre offset ${DESKTOP_FROZEN.centreDelta}px, overhang`
      + ` ${DESKTOP_FROZEN.overflowBelow}px (+-0.5px each); measured `
      + desktopInline.map((f) => `${f.label} ${f.editorHeight}/${f.centreDelta}/${f.overflowBelow}`).join(", ")
      + ` — ${describe(desktopInline)}`);

  inlineEditResults.push(...results);
});

// ───────────────────────────────────────────────────────────────────
// A NUMBER READS THE SAME ON A CARD AND IN THE ROW BEHIND IT
// ───────────────────────────────────────────────────────────────────
//
// The operator reported a card reading 1000.24 beside a table row reading 1.000,24, and the fix
// wired the card's numeric branch to the same formatter the table already used. Nothing in this
// repository rendered both and compared them, which is why the divergence survived long enough to
// be found by a person rather than by a check.
//
// So what is measured here is disagreement, not a literal. A check asserting the card renders
// "1.000,24" passes happily while the table drifts the other way, and the complaint was a
// comparison. The two renderers are built from the shipped modules and handed the same record and
// the same column, which is the one comparison neither of them can make on its own.
//
// The euro sign is followed by U+00A0, not a space. An assertion written from habit fails against
// output that is correct, so the expected strings below name the code point.

const numberParityResults = [];

await section("a number reads the same on a card and in the row behind it", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const { renderCardField, CellRenderer, getColumnDisplayType, isEmptyValue, formatEuroNumber } = globalThis.__number;
    const host = document.querySelector(".note-database-container");

    // One record and one column, rendered both ways. The card is given the frontmatter value the
    // way the board and list renderers give it, and the cell reads the same record itself — so the
    // two sides share an input rather than sharing a copy of one.
    const both = (value, type, columnExtra) => {
      const col = { key: "amount", label: "Amount", type, ...columnExtra };
      const row = {
        file: { path: "record.md", basename: "record", name: "record.md" },
        frontmatter: { amount: value },
        computed: {},
      };
      const displayType = getColumnDisplayType(col, []);
      const field = renderCardField({
        app: {}, row, col, config: { schema: { computedFields: [] } },
        value: row.frontmatter[col.key], displayType, empty: isEmptyValue(row.frontmatter[col.key]),
        fieldClass: "db-board-card-field", valueClass: "db-board-card-value",
        labelClass: "db-board-card-field-label", badgesClass: "db-board-card-badges",
        linkClass: "db-board-card-link",
      });
      host.appendChild(field);
      const td = host.createDiv({ cls: "db-cell" });
      // The renderer only needs a data source to save through, and nothing here saves.
      new CellRenderer({ openNote() {}, getRows: () => [row] }, async () => {}).renderCell(td, row, col);
      return { field, card: field.querySelector(".db-board-card-value").textContent, cell: td.textContent };
    };

    const pairs = (values) => {
      const out = [];
      for (const value of values) {
        for (const type of ["number", "currency"]) {
          const { card, cell } = both(value, type);
          out.push({ type, value: typeof value === "string" ? value : String(value), card, cell });
        }
      }
      return out;
    };

    // Numbers the plugin stores as numbers. Both sides coerce these identically, so a disagreement
    // here is a formatter drifting on one side — the defect that was reported. The operator's own
    // figure and their own record are in the sample, plus the boundaries the formatters turn on:
    // zero is finite and is not the placeholder, a negative carries its sign past the euro symbol,
    // a million groups twice, and six fraction digits separate the cell formatter from the summary
    // one.
    const numeric = pairs([1000.24, 4975.32, 0, -81.8, 1000000, 1.234567, 1500]);

    // Values a numeric column can hold that are not finite numbers. The card coerces the whole
    // string and the cell coerces its numeric prefix, so these two take different branches and
    // then different fallbacks. Kept as its own measurement because it has a different producer
    // from the one above, and folding them together would let one cause mask the other.
    const coerced = pairs(["1000.24", "1.000,24", "1000,24", "12abc", "abc", Number.NaN]);

    // A number column set to draw a bar or a ring. The value is chosen so its grouped form and its
    // raw form differ: the bar labels itself 1234.5 through its own formatter, and the euro form is
    // 1.234,5. Without that gap the second count below would be green against any implementation
    // and would prove nothing.
    const styled = ["progress", "ring"].map((style) => {
      const { field } = both(1234.5, "number", { numberDisplayStyle: style });
      const needle = formatEuroNumber(1234.5);
      // Reached through `window` because this file is linted as Node, where the bare global is
      // undefined. The named constant is worth the detour; the numeric filter value is not.
      const walker = document.createTreeWalker(field, window.NodeFilter.SHOW_TEXT);
      const texts = [];
      while (walker.nextNode()) texts.push(walker.currentNode.nodeValue);
      return {
        style,
        needle,
        elements: field.querySelectorAll(style === "ring" ? ".db-cell-progress-ring" : ".db-cell-progress").length,
        formatted: texts.filter((text) => text.includes(needle)).length,
        texts,
      };
    });

    return { numeric, coerced, styled };
  });
  await page.close();

  const results = [];
  const record = (name, pass, detail) => results.push({ name, pass, detail });
  // The sign's non-breaking space is invisible in a terminal, and this whole surface is about two
  // strings that look identical and are not. Show the code point rather than the glyph.
  const show = (text) => JSON.stringify(text).replace(/\u00A0/g, "\\u00A0");
  const disagreements = (rows) => rows.filter((row) => row.card !== row.cell);
  const listing = (rows) => rows
    .map((row) => `${row.type} ${show(row.value)} card=${show(row.card)} cell=${show(row.cell)}`)
    .join(", ");

  // A literal, and deliberately so. This one asks whether the output is the Dutch currency form at
  // all, which comparing the renderer against its own formatter cannot answer — that comparison is
  // true however the formatter is rewritten.
  const NBSP = "\u00A0";
  const currency = measured.numeric.find((row) => row.type === "currency" && row.value === "1000.24");
  record("a currency card field carries its euro sign and its Dutch separators",
    currency.card === `€${NBSP}1.000,24`,
    `card renders ${show(currency.card)} for 1000.24, want ${show(`€${NBSP}1.000,24`)} — grouped with `
      + `a dot, a comma decimal mark, and a sign followed by U+00A0 rather than a space. The default `
      + `String() path this replaced rendered "1000.24"`);

  record("a card and a cell agree, byte for byte, on every numeric column type",
    disagreements(measured.numeric).length === 0,
    `${measured.numeric.length} pairs compared across number and currency columns, `
      + `${disagreements(measured.numeric).length} disagreements`
      + (disagreements(measured.numeric).length ? `: ${listing(disagreements(measured.numeric))}` : "")
      + `. Sample: ${[...new Set(measured.numeric.map((row) => row.value))].join(", ")}`);

  record("a card and a cell agree when the column holds text or a non-finite number",
    disagreements(measured.coerced).length === 0,
    `${measured.coerced.length} pairs compared, ${disagreements(measured.coerced).length} disagreements`
      + (disagreements(measured.coerced).length ? `: ${listing(disagreements(measured.coerced))}` : "")
      + `. A clean numeric string agrees; one the card's whole-string coercion rejects does not`);

  // The comparison above measures disagreement, so it reports green if both sides ever drift the
  // same way. This one names the string, and it names the value that made the drift dangerous: a
  // leading-digits parse reads 1.000,24 as 1 and prints a figure that looks correct and is short by
  // three digits. Asserting the text is unchanged is the difference between the two renderers
  // matching and the row telling the truth about the note.
  const truncated = measured.coerced.find((row) => row.type === "number" && row.value === "1.000,24");
  record("a row prints a value it cannot read as a number rather than a truncation of it",
    truncated.cell === "1.000,24",
    `cell renders ${show(truncated.cell)} for the stored text "1.000,24", want ${show("1.000,24")}. `
      + `A numeric-prefix parse renders "1" here, and "1.000" for "1000,24" — both plausible, both `
      + `wrong. The card renders ${show(truncated.card)}`);

  // Two counts per style, kept apart on purpose. The element count alone reports green on the shape
  // that actually breaks this — a formatted string appearing beside the bar rather than instead of
  // it — so the count that catches that has to be able to go red while the other stays green.
  for (const style of measured.styled) {
    const name = style.style === "ring" ? "ring" : "bar";
    record(`a card's ${name} display renders one ${name}`,
      style.elements === 1,
      `${style.elements} ${name} elements on the rendered field, want 1`);
    record(`a card's ${name} display carries no euro-formatted text beside the ${name}`,
      style.formatted === 0,
      `${style.formatted} text nodes carry ${show(style.needle)}, want 0. The ${name} labels itself `
        + `through its own formatter, so the text nodes present are ${style.texts.map(show).join(", ")} `
        + `— a different string, which is what makes this count able to fail`);
  }

  numberParityResults.push(...results);
});

// ───────────────────────────────────────────────────────────────────
// A DROPDOWN OPENED INSIDE THE PEEK PAINTS ABOVE IT
// ───────────────────────────────────────────────────────────────────
//
// The peek was docked with a hand-written `z-index: 998`. That number is not in the layer scale —
// the scale is panel 50, popover 100, submenu 110, modal 1000 — so it beat two declared tiers
// without anyone choosing that, and a dropdown opened inside the peek painted underneath the panel
// containing it. The literal has since been replaced with `var(--db-layer-panel, 50)`, and nothing
// in this repository could tell the difference: no check reads a stacking order anywhere.
//
// A check that reads the stylesheet for the string "998" would pass on the fixed tree and prove
// nothing about painting. What decides this on a screen is `elementFromPoint`, so that is what is
// asked — with the shipped stylesheet loaded, because on a page with no cascade no z-index applies
// to anything and the hit test returns whatever DOM order gives.
//
// BOTH SURFACES ARE THE SHIPPED ONES. `openTableRecordPeek` mounts the panel and `openDropdownMenu`
// mounts the dropdown, which matters more than usual here: the dropdown resolves its own host, and
// it resolves to `.note-database-container` — the peek's parent. That shared parent is the whole
// mechanism. A hand-built dropdown appended somewhere else would be in a different stacking context
// and would paint above a peek at any z-index, which is a check that cannot fail.
//
// The last check is the ablation. It puts 998 back on the shipped panel and requires the hit test to
// flip. Without it the two above are a pair of numbers nobody has watched move.

const peekLayerResults = [];

await section("the peek's layer sits inside the token scale", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const { openTableRecordPeek, closeTableRecordPeek, openDropdownMenu } = globalThis.__layer;
    const container = document.querySelector(".note-database-container");
    const anchor = document.getElementById("anchor");

    const row = {
      file: { path: "note.md", name: "note.md", basename: "Quarterly review" },
      frontmatter: { status: "Open", owner: "Ada" },
      computed: {},
    };
    const columns = [
      { key: "file.name", label: "Name", type: "text" },
      { key: "status", label: "Status", type: "text" },
      { key: "owner", label: "Owner", type: "text" },
    ];

    // A real config, not `{}`. The panel reads the column's display type to decide whether a value
    // is a badge, and `{}` is a shape no caller passes — it threw here the first time the panel
    // needed one, and a thrown section takes its whole check count with it.
    const peekConfig = { viewType: "table", schema: { columns, computedFields: [] }, titleField: "file.name" };
    openTableRecordPeek({
      anchor, row, config: peekConfig, visibleColumns: columns, allColumns: columns, container,
    });
    const peek = container.querySelector(".db-record-peek-panel");

    // The dropdown is anchored inside the peek, which is what the criterion says: opened *inside*
    // it. The anchor's own host resolution then puts the popover in the container beside the peek.
    const trigger = peek.querySelector(".db-record-peek-title");
    const close = openDropdownMenu({
      anchor: trigger,
      label: "Status",
      options: [{ value: "open", text: "Open" }, { value: "done", text: "Done" }],
      value: "open",
      onChange: () => undefined,
    });
    const dropdown = container.querySelector(".db-dropdown-popover");

    // The scale is declared on the surface list, not on `:root` — `.note-database-container` is in
    // that list and is what both surfaces inherit through, so this is the scale they actually
    // resolve against. Read off the document element it comes back empty and every tier reads 0,
    // which compares the peek against a scale that does not exist.
    const rootStyle = getComputedStyle(container);
    const tier = (name) => Number(rootStyle.getPropertyValue(name).trim());
    const layers = {
      panel: tier("--db-layer-panel"),
      popover: tier("--db-layer-popover"),
      submenu: tier("--db-layer-submenu"),
    };

    // Painting at 50 and declaring the tier are different claims: a hand-written 50 paints
    // identically today and drifts the moment the scale moves. This asks the cascade's own record
    // rather than the stylesheet's text, so it answers for the rule that actually won.
    let declaredZ = "(no rule found)";
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch { continue; }
      for (const rule of rules) {
        if (!rule.selectorText || !rule.style) continue;
        if (!rule.selectorText.includes(".db-record-peek-panel")) continue;
        const z = rule.style.getPropertyValue("z-index");
        if (z) declaredZ = z.trim();
      }
    }

    // Where the two rectangles actually meet. A point picked from the dropdown's centre alone can
    // land outside the peek entirely, and then the hit test answers a question about empty page.
    const a = peek.getBoundingClientRect();
    const b = dropdown.getBoundingClientRect();
    const overlap = {
      left: Math.max(a.left, b.left),
      right: Math.min(a.right, b.right),
      top: Math.max(a.top, b.top),
      bottom: Math.min(a.bottom, b.bottom),
    };
    const overlaps = overlap.right > overlap.left && overlap.bottom > overlap.top;
    const point = {
      x: Math.round((overlap.left + overlap.right) / 2),
      y: Math.round((overlap.top + overlap.bottom) / 2),
    };

    const whoIsOnTop = () => {
      const hit = document.elementFromPoint(point.x, point.y);
      if (!hit) return "nothing";
      if (dropdown.contains(hit)) return "dropdown";
      if (peek.contains(hit)) return "peek";
      return `${hit.tagName.toLowerCase()}.${String(hit.className).split(" ")[0]}`;
    };

    const shipped = {
      peekZ: getComputedStyle(peek).zIndex,
      dropdownZ: getComputedStyle(dropdown).zIndex,
      onTop: whoIsOnTop(),
      sameParent: peek.parentElement === dropdown.parentElement,
      parent: dropdown.parentElement?.className || "(none)",
      declaredZ,
    };

    // THE ABLATION. The literal that used to be here, put back on the shipped panel by the same
    // property the stylesheet sets. Everything else is untouched, so a flip is attributable to the
    // number and to nothing else.
    peek.style.zIndex = "998";
    const ablated = { peekZ: getComputedStyle(peek).zIndex, onTop: whoIsOnTop() };
    peek.style.zIndex = "";

    close();
    closeTableRecordPeek();
    return { layers, shipped, ablated, overlaps, point, peekBox: a, dropBox: b };
  });

  const { layers, shipped, ablated } = measured;
  const record = (name, pass, detail) => peekLayerResults.push({ name, pass, detail });

  record("the peek's layer is a declared tier, not a literal outside the scale",
    Number(shipped.peekZ) === layers.panel
      && shipped.declaredZ.includes("--db-layer-panel")
      && layers.panel < layers.popover && layers.popover < layers.submenu,
    `peek paints at z-index ${shipped.peekZ} from the declaration \`${shipped.declaredZ}\`, against `
      + `the scale panel=${layers.panel} popover=${layers.popover} submenu=${layers.submenu}. The `
      + `value this row exists for is 998, which is inside no tier and above two of them`);

  record("the dropdown and the peek are siblings, so the comparison is a real one",
    shipped.sameParent && measured.overlaps,
    `dropdown parent is .${String(shipped.parent).split(" ")[0]}, same as the peek's=${shipped.sameParent}; `
      + `the rectangles overlap=${measured.overlaps} and the hit test is taken at `
      + `[${measured.point.x},${measured.point.y}]. Different parents means different stacking `
      + `contexts, and then the dropdown paints on top whatever the peek's z-index says`);

  record("a dropdown opened inside the peek paints above it",
    shipped.onTop === "dropdown",
    `the topmost element where the two overlap is the ${shipped.onTop}; peek z-index ${shipped.peekZ}, `
      + `dropdown z-index ${shipped.dropdownZ}`);

  record("the same hit test reports the peek on top when 998 is put back",
    ablated.onTop === "peek",
    `with the peek forced to z-index ${ablated.peekZ} the topmost element is the ${ablated.onTop}, `
      + `want the peek. A check that answers "dropdown" both ways is measuring DOM order, not the `
      + `cascade, and would have passed on the tree this row was written against`);
});

// ───────────────────────────────────────────────────────────────────
// WHAT A SINGLE CLICK ON A PROPERTY ROW REACHES
// ───────────────────────────────────────────────────────────────────
//
// The packet's row reads "Delete is not a bare one-click target in the row's primary line", and it
// was recorded failing from a reading of the wiring: `deleteBtn.onclick = () => deleteColumn(col)`.
// The cost of that click is decided one call deeper, and `column-delete-confirmation.test.ts` drives
// it — every branch interposes a confirmation, a refusal is a zero delta, and consent deletes.
//
// What that unit test cannot see is the ROW. It knows what `deleteColumn` costs; it does not know
// how many ways there are to reach it, or whether the row that says "status" hands `deleteColumn`
// the status column. Both are properties of the rendered row, and both are what "in the row's
// primary line" is asking about.
//
// So this drives a real click on every element of a real row. Not a synthetic dispatch on the one
// button that is expected to answer — every element, so a second path is discoverable rather than
// assumed absent. The identity half then clicks the delete on a NAMED row and reads which column
// object arrived, which is the assertion AC-008 asks for and no positional check can make.

// ───────────────────────────────────────────────────────────────────
// THE PROPERTY ROW'S OWN GEOMETRY, ON BOTH VIEWPORTS
// ───────────────────────────────────────────────────────────────────
//
// Two clauses, and the packet had them both wrong for different reasons.
//
// "Every laid-out child resolves to grid row 1" was being read off a replay claim whose recorded
// value is 1. That claim counts GRID TRACKS, where one track means one line and is the good answer,
// and it was read as if it counted wrapping children, where anything above zero is a failure. So a
// passing measurement was recorded as half a failure. The metric is sound — an overflowing grid
// really does report its implicit tracks in computed `grid-template-rows`, which was verified
// against a two-by-two fixture that reports `20px 18px` — but a track count and a defect count are
// not the same number and nothing reconciled them.
//
// "Row height <= 36px" was recorded as undecidable here, because the tallest children were said to
// take `height: var(--input-height)` from the host stylesheet and the harness never declared it, so
// the row would measure shorter here than on a device. The token is now declared, read from the
// installed app stylesheet rather than recalled. It changed nothing: 0 of 240 captures moved
// geometry and no check on this page moved. The stated exposure does not hold for this row, because
// its children are the plugin's own controls with their own heights, and that is now measurable
// instead of assumed.
//
// The premise row is what keeps the second clause honest. If the token were dropped again, every
// height here would fall back to content and the clause would pass optimistically for exactly the
// reason the packet feared. So the run asserts the token reaches a bare host-styled control before
// trusting any height it reports.

// ───────────────────────────────────────────────────────────────────
// WHERE A RECORD OPENS, AND WHETHER THE SETTING DECIDES IT
// ───────────────────────────────────────────────────────────────────
//
// Twenty affordances used to resolve to four surfaces, and the surface was decided by which control
// was pressed: the same icon opened a preview from a table row and a real leaf from a list row, and
// a keyboard shortcut disagreed with the button beside it. The repair is one resolver every
// affordance calls, so the claim to check is not "the resolver returns the right name" — a unit
// test already holds that — but "changing the setting changes the surface a real open produces".
//
// So this drives the shipped `openRecordAt` on a real view object once per setting and reads what
// appeared in the document. The two plugin surfaces are built for real and found by their own
// selectors. The three leaf targets have no DOM, so what is recorded there is the argument handed
// to the data source, which is the whole of what the view decides for them.
const openTargetResults = [];

await section("the setting decides where a record opens", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(async () => {
    const { DatabaseView, closeTableRecordPeek, closeRecordDetailPanel } = globalThis.__opentarget;
    const host = document.querySelector(".note-database-container");
    const columns = [
      { key: "file.name", label: "Name", type: "text" },
      { key: "amount", label: "Amount", type: "text" },
    ];
    const config = { schema: { columns, computedFields: [] }, viewType: "table" };
    const row = { file: { path: "record.md", name: "record.md", basename: "record" }, frontmatter: { amount: "1" }, computed: {} };

    const anchor = host.createDiv({ cls: "db-cell" });
    anchor.tabIndex = 0;

    const run = async (setting, hasAnchor) => {
      closeTableRecordPeek();
      closeRecordDetailPanel();
      // A panel whose construction was refused mid-way leaves its node behind, and the next run
      // would then read a surface the run before it opened. Clearing by selector rather than by the
      // close helper is what makes each reading independent.
      for (const stale of document.querySelectorAll(".db-record-detail-panel, .db-record-peek-panel")) stale.remove();
      const opened = [];
      // `Object.create` gives a real view without the constructor, which wants a leaf this page
      // cannot supply. Every field the driven method reads is written here; a field it only reads
      // would otherwise be undefined with nothing pointing at the omission.
      const view = Object.create(DatabaseView.prototype);
      view.containerEl_ = host;
      view.rows = [row];
      // The view-state shape the column resolver really reads. An empty object throws inside
      // `getVisibleColumns` on `searchText.trim()`, and a stub that throws is a stub that was
      // never standing in for anything.
      view.pendingShowColumns = new Set();
      view.vs = () => ({ searchText: "", statusFilter: "", filters: [], filterTree: undefined, hiddenColumns: new Set() });
      view.getConfig = () => config;
      view.renderRowRecordIcon = () => undefined;
      view.syncComputedFieldsNow = async () => undefined;
      view.dataSource = { openNote: (file, target) => opened.push(`leaf:${target}`) };
      // The settings lookup the view really performs, answered by a stub registry shaped like the
      // one Obsidian keeps. Supplying the value any other way would test a different code path.
      view.app = { plugins: { plugins: { "note-database": { saveSettings: async () => undefined, settings: { recordOpenTarget: setting } } } } };

      // The panel is identified by reaching the shim's boundary, and that is a proxy.
      //
      // The record panel always asks for the note body, so building it constructs an Obsidian
      // `Component`, which this catalogue's stub refuses on purpose — its rule is that a surface
      // reaching the vault fails loudly rather than renders a pretence. Weakening that to make this
      // check easier would trade a real guard for a convenient one. So the panel branch is read
      // from the refusal it raises, which proves the view chose the panel and NOT one of the other
      // four, and does not prove a panel was built. The other four outcomes are observed directly.
      try {
        await DatabaseView.prototype.openRecordAt.call(view, row, hasAnchor ? anchor : undefined);
      } catch (err) {
        if (/Component is not available/.test(String(err && err.message))) opened.push("panel");
        else throw err;
      }

      const peek = document.querySelector(".db-record-peek-panel");
      const panel = document.querySelector(".db-record-detail-panel");
      if (peek) opened.push("peek");
      if (panel && !opened.includes("panel")) opened.push("panel");
      closeTableRecordPeek();
      closeRecordDetailPanel();
      return opened;
    };

    const anchored = {};
    for (const setting of ["panel", "peek", "tab", "split", "window", undefined, "nonsense"]) {
      anchored[String(setting)] = await run(setting, true);
    }
    const unanchored = { peek: await run("peek", false) };
    return { anchored, unanchored };
  });
  await page.close();

  const record = (name, pass, detail) => openTargetResults.push({ name, pass, detail });
  const got = (key) => (measured.anchored[key] || []).join("+") || "(nothing)";

  record("each setting produces its own surface, driven through the shipped opener",
    got("panel") === "panel" && got("peek") === "peek"
      && got("tab") === "leaf:tab" && got("split") === "leaf:split" && got("window") === "leaf:window",
    `panel -> ${got("panel")}, peek -> ${got("peek")}, tab -> ${got("tab")}, `
      + `split -> ${got("split")}, window -> ${got("window")}. Five settings, five outcomes: if any two `
      + `matched, the setting would not be deciding the surface`);

  record("an unset setting and an unreadable one both land on the default",
    got("undefined") === "panel" && got("nonsense") === "panel",
    `unset -> ${got("undefined")}, "nonsense" -> ${got("nonsense")}. A settings file written by a `
      + `newer build must not reach the view as a surface nobody implemented`);

  record("a peek with nothing to anchor against falls back rather than opening nowhere",
    (measured.unanchored.peek || []).join("+") === "panel",
    `peek without an anchor -> ${(measured.unanchored.peek || []).join("+") || "(nothing)"}. `
      + `A keyboard shortcut and a menu item have a record and no element to point at, and a `
      + `preview layer with no anchor has no position to take`);
});

const propertyGeometryResults = [];

for (const surface of [
  { label: "desktop", viewport: VIEWPORT },
  { label: "phone", viewport: { width: 390, height: 844 } },
]) {
  await section(`the property row's geometry on ${surface.label}`, async () => {
    const page = await browser.newPage({ viewport: surface.viewport, reducedMotion: "reduce" });
    await page.setContent(page_html);
    await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
    await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
    await page.addScriptTag({ content: positionerJs });
    await page.addScriptTag({
      content: `globalThis.__propertyRowControl = ${JSON.stringify(process.env.PROPERTY_ROW_CONTROL || "")};`,
    });

    const geo = await page.evaluate(() => {
      const { ColumnManagerRenderer } = globalThis.__columns;
      const container = document.querySelector(".note-database-container");
      const columns = [
        { key: "file.name", label: "Name", type: "text" },
        { key: "status", label: "Status", type: "text" },
        { key: "owner", label: "Owner", type: "text" },
      ];
      const config = { schema: { columns }, viewType: "table", columnOrder: columns.map((c) => c.key) };
      const state = { hiddenColumns: new Set(), filters: [], sortRules: [], sortDirection: "asc" };
      const actions = {};
      for (const name of ["close", "setColumnVisible", "setAllColumnsVisible", "moveColumn",
        "moveColumnTo", "toggleColumnWrap", "editColumn", "addColumn", "deleteColumn"]) {
        actions[name] = () => undefined;
      }
      const renderer = new ColumnManagerRenderer();
      renderer.render(container, true, config, state, columns, actions, document.getElementById("anchor"));
      const panel = renderer.getPanel();
      const rows = [...panel.querySelectorAll(".db-column-manager-row")];

      // Two controls, one per clause, because the clauses fail in different ways and a single
      // mutation would leave one of them untested.
      //
      // `wrap` appends one more child than the track list has columns, so auto-placement has to
      // open an implicit second row — the shape a real wrap takes. `escape` leaves the track count
      // alone and pushes one child below the band, which is the case a track count cannot see and
      // is the entire reason the containment clause exists beside it.
      const control = globalThis.__propertyRowControl || "";
      if (control === "wrap") {
        for (const row of rows) row.appendChild(document.createElement("span")).textContent = "overflow";
      } else if (control === "escape") {
        for (const row of rows) {
          // A LAID-OUT child, not simply the second one. The first attempt took `children[1]` and
          // moved nothing measurable, because the measurement filters zero-size children and that
          // is what it had picked — a control failing for its own reason rather than the check's.
          const victim = [...row.children].find((child) => {
            const box = child.getBoundingClientRect();
            return box.width > 0 || box.height > 0;
          });
          if (victim) { victim.style.position = "relative"; victim.style.top = "40px"; }
        }
      }

      // The premise, measured on a bare host-styled control rather than asserted about the token.
      const probe = document.body.appendChild(document.createElement("button"));
      probe.textContent = "x";
      const probeHeight = probe.getBoundingClientRect().height;
      const declared = getComputedStyle(document.documentElement).getPropertyValue("--input-height").trim();
      probe.remove();

      const perRow = rows.map((row) => {
        const cs = getComputedStyle(row);
        const rowBox = row.getBoundingClientRect();
        const laidOut = [...row.children].filter((child) => {
          const box = child.getBoundingClientRect();
          return box.width > 0 || box.height > 0;
        });
        // The single track's own band, not the row's box: the row carries padding the track does
        // not. A child inside the band is in row 1 whatever its vertical alignment within it, and a
        // child hanging below it has been placed somewhere row 1 does not reach. Comparing child
        // TOPS instead measures alignment — a 16px icon centred in a 26px track legitimately starts
        // lower than a stretched sibling, and reading that as a second line is a check failing for
        // its own reason.
        const trackSizes = cs.gridTemplateRows.split(/\s+/).filter(Boolean);
        const bandTop = rowBox.top + parseFloat(cs.paddingTop || "0");
        const bandBottom = bandTop + parseFloat(trackSizes[0] || "0");
        const escaped = laidOut.filter((child) => {
          const box = child.getBoundingClientRect();
          return box.top < bandTop - 1 || box.bottom > bandBottom + 1;
        });
        return {
          height: Math.round(rowBox.height * 100) / 100,
          tracks: trackSizes.length,
          trackText: cs.gridTemplateRows,
          children: row.children.length,
          laidOut: laidOut.length,
          escaped: escaped.length,
          band: `${Math.round(bandTop * 10) / 10}..${Math.round(bandBottom * 10) / 10}`,
        };
      });
      return { perRow, probeHeight, declared };
    });
    await page.close();

    const record = (name, pass, detail) => propertyGeometryResults.push({ name, pass, detail });
    const tallest = Math.max(...geo.perRow.map((r) => r.height));
    const worstTracks = Math.max(...geo.perRow.map((r) => r.tracks));
    const worstEscaped = Math.max(...geo.perRow.map((r) => r.escaped));

    record(`PREMISE the host control height reaches this ${surface.label} page`,
      geo.declared !== "" && Math.abs(geo.probeHeight - parseFloat(geo.declared)) <= 1,
      `--input-height reads "${geo.declared || "(undeclared)"}" and a bare button measures `
        + `${geo.probeHeight.toFixed(1)}px. Undeclared, every height below falls back to content and `
        + `the row reads shorter here than on a device — which is the direction that passes a height `
        + `clause for the wrong reason`);

    record(`every laid-out child of a property row is on one line, ${surface.label}`,
      worstTracks === 1 && worstEscaped === 0,
      `${geo.perRow.length} row(s): worst grid-track count ${worstTracks} (${geo.perRow[0].trackText}), `
        + `and ${worstEscaped} of ${geo.perRow[0].laidOut} laid-out children of ${geo.perRow[0].children} `
        + `fall outside the single track's band ${geo.perRow[0].band}. One track means there is no `
        + `second line to be on — a wrapped row reports its implicit track, verified against a fixture `
        + `that reports two — and the containment clause is what catches a child placed outside the `
        + `track without creating one`);

    record(`a property row is no taller than 36px, ${surface.label}`,
      tallest <= 36,
      `tallest of ${geo.perRow.length} row(s) is ${tallest}px against the 36px ceiling `
        + `(the packet's recorded failing value was 52px), measured with the host's own `
        + `--input-height present at ${geo.declared || "(undeclared)"}`);
  });
}

const propertyRowResults = [];

await section("what a single click on a property row reaches", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const { ColumnManagerRenderer } = globalThis.__columns;
    const container = document.querySelector(".note-database-container");

    const columns = [
      { key: "file.name", label: "Name", type: "text" },
      { key: "status", label: "Status", type: "text" },
      { key: "owner", label: "Owner", type: "text" },
    ];
    const config = { schema: { columns }, viewType: "table", columnOrder: columns.map((c) => c.key) };
    const state = { hiddenColumns: new Set(), filters: [], sortRules: [], sortDirection: "asc" };

    // Every action records, none mutates. What is being measured is which action a click reaches
    // and with which column — the mutation itself is the unit test's subject, not this one's.
    const calls = [];
    const actions = {};
    for (const name of ["close", "setColumnVisible", "setAllColumnsVisible", "moveColumn",
      "moveColumnTo", "toggleColumnWrap", "editColumn", "addColumn", "deleteColumn"]) {
      actions[name] = (...args) => calls.push({ action: name, arg: args[0] });
    }

    const renderer = new ColumnManagerRenderer();
    renderer.render(container, true, config, state, columns, actions, document.getElementById("anchor"));
    const panel = renderer.getPanel();

    // The middle row, so a mis-resolution has somewhere to land in both directions. A first or last
    // row hides an off-by-one against the array's own edge.
    const rows = [...panel.querySelectorAll(".db-column-manager-row")];
    const row = rows[1];
    const named = row.querySelector(".db-column-name").textContent;

    // Every element inside the row, clicked once. `elementFromPoint` at each one's centre would
    // measure the same thing for overlapping children; dispatching on the element itself asks what
    // that element's own handler does, and the bubbling then reports any ancestor that also answers.
    const describe = (el) => `${el.tagName.toLowerCase()}.`
      + (String(el.className || "").split(" ").filter(Boolean).join(".") || "(none)");
    const reached = [];
    for (const el of [row, ...row.querySelectorAll("*")]) {
      const before = calls.length;
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      for (const call of calls.slice(before)) {
        reached.push({
          on: describe(el),
          // A click on the trash's own glyph bubbles to the trash, which is one path reported
          // twice, not two paths. What separates a real second route from that is whether the
          // element sits inside the delete control at all.
          insideDelete: Boolean(el.closest(".db-column-delete-btn")),
          isRow: el === row,
          action: call.action,
          key: call.arg && call.arg.key ? call.arg.key : String(call.arg),
        });
      }
    }

    const deletes = reached.filter((r) => r.action === "deleteColumn");
    return {
      named,
      rows: rows.length,
      elements: 1 + row.querySelectorAll("*").length,
      reached,
      deletes,
      outside: deletes.filter((d) => !d.insideDelete).map((d) => d.on),
      rowItselfDeletes: deletes.some((d) => d.isRow),
      deleteKeys: [...new Set(deletes.map((d) => d.key))],
    };
  });

  const record = (name, pass, detail) => propertyRowResults.push({ name, pass, detail });
  const quote = (value) => JSON.stringify(String(value));
  const { deletes, deleteKeys } = measured;

  record("nothing outside the trash control reaches the delete",
    deletes.length > 0 && measured.outside.length === 0 && !measured.rowItselfDeletes,
    `${measured.elements} element(s) in the row were each clicked once; ${deletes.length} reached `
      + `deleteColumn and ${measured.outside.length} of those were outside the trash control `
      + `(${measured.outside.join(", ") || "none"}). The row itself was clicked too, and answered `
      + `with ${measured.rowItselfDeletes ? "a delete" : "no delete"} — a stray press on the row is `
      + `the shape this row of the packet is about`);

  record("the delete on a named row deletes the property that row names",
    deleteKeys.length === 1 && measured.named.includes(deleteKeys[0]),
    `the row reads ${quote(measured.named)} and its delete was handed ${quote(deleteKeys.join(", "))}. `
      + `Asserted by the column object the action received, not by the row's index — the same index `
      + `is a different property on phone than on desktop, which is the misattribution this catches`);

  // A row is more than its delete, and "nothing else deletes" is satisfied by a row where nothing
  // else does anything. So the rest of the line is asserted as a SET: these four actions and no
  // others. Dropping any one of them goes red here, which a count or an every() over the same list
  // does not — an every() with one control removed is still true of the remainder.
  const WANTED = ["editColumn", "moveColumn", "setColumnVisible", "toggleColumnWrap"];
  const others = [...new Set(measured.reached
    .filter((r) => r.action !== "deleteColumn").map((r) => r.action))].sort();
  record("the rest of the row's primary line offers exactly its four non-destructive actions",
    others.join(",") === WANTED.join(","),
    `the row's other clicks reached [${others.join(", ") || "nothing"}], want `
      + `[${WANTED.join(", ")}]. Reorder is two buttons reaching one action, which is why this is a `
      + `set and not a count`);
});

// ───────────────────────────────────────────────────────────────────
// A MENU'S HEADING AND ITS ROWS SHARE ONE LEFT EDGE
// ───────────────────────────────────────────────────────────────────
//
// `027` recorded a fourth operator report against this: in the desktop More-tools dropdown the
// heading and the rows do not line up. It also recorded a correction — the first hypothesis compared
// two selectors that are not the two elements in the report — and left a lead explicitly unmeasured:
//
//   "there is a rule aligning the heading to the rows' icon column, and it is scoped `.is-phone`
//    only. Report 28 is a desktop report. Whether that is the mechanism or a coincidence needs
//    measuring, not arguing."
//
// This measures it. Both presentations of the same grammar, one page each, reading the left edge
// the eye actually tracks: the heading's text box, the row's icon box, and the row's label box.
//
// The rule the lead names is `.is-phone .db-menu-section { padding-inline: 16px }`. If it is the
// mechanism, removing it moves the phone heading and leaves the desktop one where it is — which is
// the ablation below, and it is what makes this a measurement rather than a second argument.

const menuEdgeResults = [];

const menuEdgeProbe = async (isPhone) => {
  const page = await browser.newPage({
    viewport: isPhone ? { width: 390, height: 844 } : VIEWPORT,
    reducedMotion: "reduce",
    ...(isPhone ? { isMobile: true, hasTouch: true } : {}),
  });
  await page.setContent(page_html);
  if (isPhone) await page.evaluate(() => document.body.classList.add("is-mobile", "is-phone"));
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const { createOwnedMenu, createMenuRow } = globalThis.__place;
    const host = document.querySelector(".note-database-container");

    // Surface A: the owned menu, which is what a column menu is on a phone. Heading through its own
    // `addSection`, rows through `addRow` — both the shipped entry points.
    const menu = createOwnedMenu(document);
    menu.addSection("Column");
    for (const label of ["Sort ascending", "Filter on this column", "Duplicate property"]) {
      menu.addRow({ icon: "pencil", label });
    }
    menu.showAt({ x: 200, y: 200 });

    // Surface B: the More-tools dropdown, built the way `renderUtilitiesOverflowButton` builds it —
    // `.db-panel-header` holding a `.db-panel-title`, then `createMenuRow` rows carrying
    // `db-toolbar-menu-row`. Those three classes ARE the subject of report 28, so they are named
    // from the shipped source rather than guessed, and the rows come from the shared factory.
    const utilities = host.createDiv({ cls: "db-view-tab-popover db-toolbar-utilities-popover" });
    const header = utilities.createDiv({ cls: "db-panel-header" });
    header.createDiv({ cls: "db-panel-title", text: "Utilities" });
    for (const label of ["Display width", "Refresh database", "View settings"]) {
      createMenuRow(utilities, { cls: "db-toolbar-menu-row", icon: "pencil", label });
    }

    // The INK's left edge, not the box's. A heading is a padded div whose border box starts at the
    // surface's content edge however much padding it carries, so comparing boxes reports every
    // heading as aligned with every row and cannot fail. The first version of this check did
    // exactly that and reported `heading 4, row box 4` on a heading whose text sits at 20.
    const inkLeft = (el) => {
      if (!el) return null;
      const box = el.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      return Math.round(box.left + pad);
    };
    const edgesOf = (root, headingSel, rowSel) => {
      const heading = root.querySelector(headingSel);
      const row = root.querySelector(rowSel);
      if (!heading || !row) return null;
      const icon = row.querySelector(".db-menu-item-icon");
      const label = row.querySelector(".db-menu-item-label");
      return {
        heading: inkLeft(heading),
        rowBox: inkLeft(row),
        icon: icon ? Math.round(icon.getBoundingClientRect().left) : null,
        // The glyph inside the icon slot, when there is one. A slot wider than its glyph would let
        // box edges agree while the ink a reader tracks sits somewhere else — so it is reported,
        // and reported as absent rather than as a number when the DOM shim draws no SVG. What is
        // ASSERTED is the slot: that is what the stylesheet places, and a glyph inset within a
        // correctly placed slot is the icon set's metrics, not this surface's alignment.
        glyph: icon?.querySelector("svg")
          ? Math.round(icon.querySelector("svg").getBoundingClientRect().left)
          : "not drawn by the shim",
        label: label ? Math.round(label.getBoundingClientRect().left) : null,
        headingText: heading.textContent,
      };
    };

    // Surface C: the same dropdown mounted on the BODY, which is where a phone puts it. These
    // surfaces present as sheets and are portalled out of `.note-database-container`, so a rule
    // scoped to the container is correct on the desktop half and simply absent on the presentation
    // whose rows are largest. Same builder, different parent, and that is the whole test.
    const portalled = document.body.createDiv({ cls: "db-view-tab-popover db-toolbar-utilities-popover db-surface" });
    const portalledHeader = portalled.createDiv({ cls: "db-panel-header" });
    portalledHeader.createDiv({ cls: "db-panel-title", text: "Utilities" });
    for (const label of ["Display width", "Refresh database"]) {
      createMenuRow(portalled, { cls: "db-toolbar-menu-row", icon: "pencil", label });
    }

    const read = () => ({
      owned: edgesOf(menu.el, ".db-menu-section", ".db-menu-item"),
      utilities: edgesOf(utilities, ".db-panel-title", ".db-toolbar-menu-row"),
      portalled: edgesOf(portalled, ".db-panel-title", ".db-toolbar-menu-row"),
    });

    const shipped = read();

    // THE ABLATION the lead asks for. The `.is-phone`-scoped rule is switched off in place, and the
    // two surfaces are re-read. A rule scoped to the phone cannot move the desktop; if the desktop
    // number moves anyway the lead is wrong about the mechanism, and if the phone number does not
    // move the rule is not doing what its comment claims.
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch { continue; }
      for (const rule of rules) {
        if (rule.selectorText && rule.selectorText.includes(".is-phone .db-menu-section")) {
          rule.style.removeProperty("padding-inline");
        }
      }
    }
    const ablated = read();

    menu.close();
    utilities.remove();
    portalled.remove();
    return { shipped, ablated, phone: document.body.classList.contains("is-phone") };
  });

  await page.close();
  return measured;
};

await section("a menu's heading and its rows share one left edge", async () => {
  const phone = await menuEdgeProbe(true);
  const desktop = await menuEdgeProbe(false);
  const record = (name, pass, detail) => menuEdgeResults.push({ name, pass, detail });

  // The edge a reader tracks down a menu is the ICON column, because that is the first ink on every
  // row. A heading that lines up with the label instead sits eight to sixteen pixels in from
  // everything below it, which is what the four reports describe.
  for (const [where, m] of [["a phone sheet", phone], ["a desktop popover", desktop]]) {
    record(`the owned menu's heading sits on its rows' icon column in ${where}`,
      m.shipped.owned !== null && Math.abs(m.shipped.owned.heading - m.shipped.owned.icon) <= 1,
      `heading left ${m.shipped.owned?.heading}, row icon slot left ${m.shipped.owned?.icon} `
        + `(its glyph at ${m.shipped.owned?.glyph}), row label left ${m.shipped.owned?.label}, `
        + `row box left ${m.shipped.owned?.rowBox}`);
  }

  // Both presentations, because the row's inset is not the same on both and a fix stated once can
  // land on only one of them. Report 28 is a desktop report; the phone is where the rows grow for a
  // thumb, which is exactly where a heading pinned to the wrong number drifts furthest.
  for (const [where, m] of [["a phone sheet", phone], ["a desktop popover", desktop]]) {
    record(`the More-tools dropdown's heading sits on its rows' icon column in ${where}`,
      m.shipped.utilities !== null
        && Math.abs(m.shipped.utilities.heading - m.shipped.utilities.icon) <= 1,
      `heading left ${m.shipped.utilities?.heading}, row icon slot left `
        + `${m.shipped.utilities?.icon} (its glyph at ${m.shipped.utilities?.glyph}), row label left `
        + `${m.shipped.utilities?.label}. `
        + `This is operator report 28, measured rather than argued: the rows take a per-surface `
        + `\`db-toolbar-menu-row\` inset and the heading takes whatever \`.db-panel-header\` gives it`);
  }

  // The same surface, portalled — on the PHONE, which is the only presentation that portals it.
  // A container-scoped fix passes the in-container rows above and fails here, which is the
  // difference between a rule that reaches a phone sheet and one that does not.
  //
  // The desktop half of this pairing is deliberately not asserted. Measured, it reads heading 916
  // against icon 912: on the body the ROW loses `.note-database-container .db-toolbar-menu-row` and
  // falls back to the shared row's own inset, so the heading is four pixels in rather than out. But
  // a desktop popover is never portalled — only the sheet presentation moves — so that shape is one
  // no surface renders, and a check that failed on it would be asking the stylesheet to be correct
  // about a combination the app does not produce. Un-scoping the row rule would settle it and is
  // not taken: it drops the row from two classes to one and hands the next host rule a fight it
  // does not currently have.
  record("the dropdown keeps its heading's inset after it is portalled onto the body on a phone",
    phone.shipped.portalled !== null
      && Math.abs(phone.shipped.portalled.heading - phone.shipped.portalled.icon) <= 1,
    `mounted on the body at phone width: heading left ${phone.shipped.portalled?.heading}, row icon `
      + `left ${phone.shipped.portalled?.icon}. On a phone these surfaces leave `
      + `\`.note-database-container\` to become sheets, so a rule that names that container is `
      + `absent exactly where the rows are largest`);

  // The lead, answered. Two claims in one row, because either alone is satisfiable by a coincidence.
  const phoneMoved = phone.shipped.owned.heading !== phone.ablated.owned.heading;
  const desktopMoved = desktop.shipped.owned.heading !== desktop.ablated.owned.heading;
  record("the .is-phone heading rule moves the phone menu and cannot move the desktop one",
    phoneMoved && !desktopMoved,
    `with \`.is-phone .db-menu-section\`'s padding-inline removed, the phone heading goes `
      + `${phone.shipped.owned.heading} → ${phone.ablated.owned.heading} and the desktop heading `
      + `goes ${desktop.shipped.owned.heading} → ${desktop.ablated.owned.heading}. `
      + `\`027\` left this as a lead: a rule scoped to the phone cannot be the mechanism behind a `
      + `desktop report, and this is the measurement that says so instead of arguing it`);
});

// ───────────────────────────────────────────────────────────────────
// THE HEADER KEEPS ITS HEIGHT WHEN THE VIEW TYPE CHANGES
// ───────────────────────────────────────────────────────────────────
//
// `005` asks that switching view type changes the header's height by at most one token step, and
// recorded "No check". The reason it matters is not tidiness: the header sits above the content, so
// every pixel it gains or loses on a switch is a pixel of content that jumps. A reader who changes
// from table to board should not have the rows move under them.
//
// The toolbar is driven, not described. `ToolbarRenderer.render` is the shipped entry point and it
// forks per view type — calendar and timeline hand off to their own toolbar renderer entirely — so
// the only way to know what a switch costs is to perform six of them and measure.
//
// The bound is stated as a TOKEN STEP rather than as a pixel count, because that is what the
// criterion says and because a pixel bound would have to be re-tuned every time the scale moves.
// `--db-space-2` is read off the surface rather than assumed.

const headerRhythmResults = [];

await section("the header keeps its height when the view type changes", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const { ToolbarRenderer } = globalThis.__place;
    const host = document.querySelector(".note-database-container");

    const columns = [
      { key: "file.name", label: "Name", type: "text" },
      { key: "status", label: "Status", type: "select", options: [{ value: "open", text: "Open" }] },
      { key: "due", label: "Due", type: "date" },
      { key: "cost", label: "Cost", type: "number" },
    ];

    // Every action a no-op, every FLAG a boolean. The distinction is the whole of this block.
    //
    // A Proxy that answers everything with a function answers `hideHeaderChrome` with a function
    // too, and `if (actions.hideHeaderChrome) return;` is the first line of the render — so the
    // toolbar returned immediately, drew nothing, threw nothing, and the first version of this
    // check reported six null heights as though the surface had no header. A truthy stub is not a
    // neutral one.
    //
    // So a key that reads as a flag resolves to a boolean and never to a function. `show*` defaults
    // true and `hide*`, `is*` and `disable*` default false, which is the full-chrome toolbar a
    // reader sees; anything else is a method and gets a no-op, because a render is not supposed to
    // call one and a render that did would be its own defect.
    const flags = {
      isReadOnly: false, hideWidthSelect: false, standalone: true,
      hideCreateEntry: false, showViewTabs: true, showDatabaseChrome: true,
    };
    const looksLikeFlag = (key) => /^(hide|show|is|disable|allow|can)[A-Z]/.test(key);
    const actions = new Proxy(flags, {
      get(target, key) {
        if (key in target) return target[key];
        if (typeof key === "symbol") return undefined;
        if (looksLikeFlag(key)) return key.startsWith("show");
        return () => undefined;
      },
      has: () => true,
    });

    const state = {
      hiddenColumns: new Set(), filters: [], sortRules: [], filterTree: undefined,
      sortColumn: undefined, sortDirection: "asc", searchText: "", groupByField: "",
    };

    const step = Number.parseFloat(getComputedStyle(host).getPropertyValue("--db-space-2")) || 0;

    const VIEW_TYPES = ["table", "board", "gallery", "list", "calendar", "timeline"];
    const heights = [];
    const renderer = new ToolbarRenderer();
    for (const viewType of VIEW_TYPES) {
      const container = host.createDiv({ cls: "db-view-host" });
      const view = { viewType, name: viewType, schema: { columns }, columnOrder: columns.map((c) => c.key) };
      const db = { id: "db", name: "Subs", schema: { columns }, views: [view], sourceRules: [] };
      let error = null;
      try {
        renderer.render(container, [{ config: db, sourcePath: "db.md" }], 0, 0, state, actions);
      } catch (e) {
        error = String(e && e.message ? e.message : e);
      }
      const header = container.querySelector(".db-header") ?? container.querySelector(".db-toolbar");
      heights.push({
        viewType,
        error,
        height: header ? Math.round(header.getBoundingClientRect().height) : null,
        drew: header ? header.querySelectorAll("button, input, select").length : 0,
      });
      container.remove();
    }
    return { step, heights };
  });

  const record = (name, pass, detail) => headerRhythmResults.push({ name, pass, detail });
  const { step, heights } = measured;
  const drawn = heights.filter((h) => h.height !== null);
  const values = drawn.map((h) => h.height);
  const spread = values.length ? Math.max(...values) - Math.min(...values) : null;
  const listing = heights
    .map((h) => `${h.viewType}=${h.error ? `threw(${h.error.slice(0, 40)})` : `${h.height}px/${h.drew} controls`}`)
    .join(", ");

  // A height comparison over one rendered header would pass while five others threw, so the count
  // is its own row. This is the shape `020` repaired elsewhere: an empty measurement reads as a
  // clean one.
  record("every view type renders a header to measure",
    drawn.length === heights.length && drawn.every((h) => h.drew > 0),
    `${drawn.length} of ${heights.length} view types produced a header: ${listing}`);

  record("switching view type changes header height by at most one token step",
    spread !== null && step > 0 && spread <= step,
    `header heights ${listing}; spread ${spread}px against one --db-space-2 step of ${step}px. `
      + `Stated in token steps because that is what the criterion says and because a pixel bound `
      + `would need re-tuning every time the scale moves`);
});

// ───────────────────────────────────────────────────────────────────
// FILTER AND SORT ANSWER A KEYBOARD THE SAME WAY
// ───────────────────────────────────────────────────────────────────
//
// `001` asks that Filter and Sort expose the same role, focus behaviour and keyboard contract, and
// marks it "asserted, not inspected". The two panels share a stylesheet class and sit behind
// adjacent toolbar buttons, which is exactly the shape where a difference survives: they look
// identical, so nobody checks that they behave identically.
//
// Both are driven through their own shipped renderers and compared to EACH OTHER rather than to a
// list of expected attributes. A list would have to be updated whenever the contract moves, and
// then it would be the list that was wrong; a comparison stays true to whatever the pair agrees on.
// Which of the two is right is a separate question — and where they disagree, the detail names both
// values so the answer is legible rather than implied.

const panelParityResults = [];

await section("filter and sort answer a keyboard the same way", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const { FilterPanelRenderer, SortPanelRenderer } = globalThis.__panels;
    const host = document.querySelector(".note-database-container");

    const columns = [
      { key: "file.name", label: "Name", type: "text" },
      { key: "status", label: "Status", type: "text" },
    ];
    const config = { schema: { columns }, viewType: "table", columnOrder: columns.map((c) => c.key) };

    const probe = (which) => {
      const container = host.createDiv({ cls: "db-panel-host" });
      container.createDiv({ cls: "db-toolbar" });
      const anchor = container.createEl("button", { cls: "anchor", text: which });
      let closed = 0;
      const actions = {
        save: () => undefined, saveState: () => undefined, refresh: () => undefined,
        close: () => { closed += 1; },
      };
      // Each panel carries at least one rule, so the focus and Tab questions have somewhere to go.
      // An empty panel has no focusable child, and a trap over nothing is indistinguishable from
      // no trap at all — which is the exact difference being measured.
      const state = {
        hiddenColumns: new Set(), filters: [], sortRules: [{ field: "status", direction: "asc" }],
        filterTree: undefined, sortColumn: undefined, sortDirection: "asc",
      };
      const renderer = which === "filter" ? new FilterPanelRenderer() : new SortPanelRenderer();
      // The two renderers take `state` and `config` in opposite orders, which is its own small
      // inconsistency and is why each call is written out rather than shared.
      if (which === "filter") renderer.render(container, true, state, config, actions, anchor);
      else renderer.render(container, true, config, state, actions, anchor);

      const panel = renderer.getPanel();
      if (!panel) return { which, built: false };

      const focusedOnOpen = document.activeElement === panel
        ? "the panel"
        : panel.contains(document.activeElement)
          ? "a child of the panel"
          : "something outside it";

      // Escape driven on the panel, not asserted from the source. A handler that exists and is
      // registered on the wrong node answers a reading and not a key press.
      panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
      const escapeClosed = closed > 0;

      // Tab from the last focusable child: a trap wraps to the first, no trap lets it leave.
      const focusable = [...panel.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )].filter((el) => !el.disabled);
      let tabWrapped = null;
      if (focusable.length > 1) {
        focusable[focusable.length - 1].focus();
        const before = document.activeElement;
        panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }));
        tabWrapped = document.activeElement !== before && document.activeElement === focusable[0];
      }

      const result = {
        which,
        built: true,
        role: panel.getAttribute("role") || "(none)",
        labelled: Boolean(panel.getAttribute("aria-label") || panel.getAttribute("aria-labelledby")),
        tabIndex: panel.tabIndex,
        focusedOnOpen,
        escapeClosed,
        tabWrapped,
        focusables: focusable.length,
      };
      container.remove();
      return result;
    };

    return { filter: probe("filter"), sort: probe("sort") };
  });

  const record = (name, pass, detail) => panelParityResults.push({ name, pass, detail });
  const { filter, sort } = measured;

  record("both panels render, so there is something to compare",
    filter.built && sort.built && filter.focusables > 1 && sort.focusables > 1,
    `filter built=${filter.built} with ${filter.focusables} focusable child(ren); `
      + `sort built=${sort.built} with ${sort.focusables}. A panel with one focusable child cannot `
      + `show a Tab trap, so the count is part of the premise rather than an aside`);

  const DIMENSIONS = [
    ["role", (p) => p.role],
    ["accessible name", (p) => (p.labelled ? "present" : "absent")],
    ["panel tabindex", (p) => p.tabIndex],
    ["focus on open", (p) => p.focusedOnOpen],
    ["Escape closes", (p) => p.escapeClosed],
    ["Tab wraps inside", (p) => p.tabWrapped],
  ];
  for (const [name, read] of DIMENSIONS) {
    const a = read(filter);
    const b = read(sort);
    record(`filter and sort agree on ${name}`,
      filter.built && sort.built && String(a) === String(b),
      `filter=${JSON.stringify(a)} sort=${JSON.stringify(b)}. Compared to each other rather than to `
        + `an expected value, so this stays true when the contract moves; where they differ, which `
        + `one is right is a separate question and both numbers are here to answer it`);
  }
});

// ───────────────────────────────────────────────────────────────────
// THE REGISTRY DESCRIBES WHERE THESE SURFACES ACTUALLY MOUNT
// ───────────────────────────────────────────────────────────────────
//
// `008` asks for "registry equality between source census and runtime census" and recorded it as
// computable and uncomputed. `surface-census` now enforces one half of that — no fixture draws a
// class the source cannot build. This is the other half, and it is about a different registry:
// `SURFACE_REGISTRY` declares, for five producers, a `host` of `body` or `container` and a `mount`
// of `bodyPortal` or `local`.
//
// A registry is a claim about the running program, and nothing was reading it. An entry that says
// `bodyPortal` while the producer mounts into the container is worse than no entry: every check
// that trusts the registry is then reasoning about a program that does not exist.
//
// So each producer is OPENED and its node's real parent is compared to what its own entry says.
// The registry is iterated rather than listed, so a sixth producer added tomorrow arrives here
// without anyone remembering to add it — and arrives red until it is driven.

const registryResults = [];

await section("the registry describes where these surfaces actually mount", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const { SURFACE_REGISTRY, renderDateValuePicker, closeActiveDateValuePicker } = globalThis.__registry;
    const { createOwnedMenu, ColumnMenu, openRecordDetailPanel, closeRecordDetailPanel } = globalThis.__place;
    const { FilterPanelRenderer } = globalThis.__panels;
    const host = document.querySelector(".note-database-container");

    const columns = [
      { key: "file.name", label: "Name", type: "text" },
      { key: "status", label: "Status", type: "text" },
    ];
    const config = { schema: { columns }, viewType: "table", columnOrder: columns.map((c) => c.key) };
    const row = {
      file: { path: "note.md", name: "note.md", basename: "Note" },
      frontmatter: { status: "Open" }, computed: {},
    };

    // One opener per registered producer, each the shipped entry point. The map is keyed by the
    // registry's own ids so a producer with no opener here is reported as undriven rather than
    // quietly skipped.
    const OPENERS = {
      "owned-menu": () => {
        const menu = createOwnedMenu(document);
        menu.addRow({ icon: "pencil", label: "Edit" });
        menu.showAt({ x: 300, y: 200 });
        return { el: menu.el, close: () => menu.close() };
      },
      "column-menu": () => {
        const anchor = host.createDiv({ cls: "anchor" });
        const noop = new Proxy({}, { get: () => () => undefined });
        new ColumnMenu(noop).show(
          new MouseEvent("click", { clientX: 300, clientY: 200 }),
          columns[1], anchor, {},
        );
        const el = document.querySelector(".db-menu:not(.db-column-menu-subpopover)")
          ?? document.querySelector(".menu");
        return { el, close: () => { el?.remove(); anchor.remove(); } };
      },
      "record-detail-panel": () => {
        const anchor = host.createDiv({ cls: "anchor" });
        openRecordDetailPanel({
          anchorEl: anchor, host, row, columns, config, app: {}, actions: {},
        });
        return {
          el: document.querySelector(".db-record-detail-panel"),
          close: () => { closeRecordDetailPanel(); anchor.remove(); },
        };
      },
      "filter-panel": () => {
        const container = host.createDiv({ cls: "db-panel-host" });
        container.createDiv({ cls: "db-toolbar" });
        const anchor = container.createEl("button", { cls: "anchor", text: "Filter" });
        const renderer = new FilterPanelRenderer();
        const state = {
          hiddenColumns: new Set(), filters: [], sortRules: [], filterTree: undefined,
          sortColumn: undefined, sortDirection: "asc",
        };
        renderer.render(container, true, state, config, {
          saveState: () => undefined, refresh: () => undefined, close: () => undefined,
        }, anchor);
        return { el: renderer.getPanel(), close: () => container.remove() };
      },
      "date-value-picker": () => {
        const parent = host.createDiv({ cls: "db-panel-host" });
        const trigger = renderDateValuePicker({
          parent, value: "2026-03-25", onChange: () => undefined,
        });
        trigger.click();
        return {
          el: document.querySelector(".db-date-value-popover, .db-date-edit-popover"),
          close: () => { closeActiveDateValuePicker(document); parent.remove(); },
        };
      },
    };

    const out = [];
    for (const [id, entry] of Object.entries(SURFACE_REGISTRY)) {
      const open = OPENERS[id];
      if (!open) { out.push({ id, entry, driven: false }); continue; }
      let opened = null;
      let error = null;
      try {
        opened = open();
      } catch (e) {
        error = String(e && e.message ? e.message : e);
      }
      const el = opened?.el ?? null;
      const parent = el?.parentElement ?? null;
      out.push({
        id,
        entry: { host: entry.host, mount: entry.mount, role: entry.role },
        driven: true,
        error,
        built: Boolean(el),
        parentIsBody: parent === document.body,
        parentClass: parent ? (String(parent.className).split(" ")[0] || parent.tagName.toLowerCase()) : "(none)",
        insideContainer: Boolean(el && host.contains(el)),
      });
      opened?.close?.();
    }
    return out;
  });

  const record = (name, pass, detail) => registryResults.push({ name, pass, detail });

  record("every registered producer has an opener here",
    measured.every((m) => m.driven),
    `${measured.filter((m) => m.driven).length} of ${measured.length} registry entries are driven; `
      + `undriven: ${measured.filter((m) => !m.driven).map((m) => m.id).join(", ") || "none"}. The `
      + `registry is iterated rather than listed, so a producer added tomorrow arrives here red `
      + `instead of silently uncovered`);

  for (const m of measured) {
    if (!m.driven) continue;
    record(`${m.id} is built when its opener runs`,
      m.built && !m.error,
      m.error ? `it threw: ${m.error}` : `built=${m.built}. A mount comparison over a surface that `
        + `never opened compares nothing and reports agreement`);
  }

  for (const m of measured) {
    if (!m.driven || !m.built) continue;
    const wantsBody = m.entry.host === "body";
    record(`${m.id} mounts where its registry entry says (${m.entry.host}/${m.entry.mount})`,
      wantsBody ? m.parentIsBody : m.insideContainer,
      `declared host=${m.entry.host} mount=${m.entry.mount} role=${m.entry.role}; the node's parent `
        + `is .${m.parentClass}, body=${m.parentIsBody}, inside .note-database-container=${m.insideContainer}`);
  }
});

// ───────────────────────────────────────────────────────────────────
// THE FLICK, DRIVEN THROUGH THE GESTURE RATHER THAN ASKED OF THE RULE
// ───────────────────────────────────────────────────────────────────
//
// `031` shipped velocity dismissal and `sheet-rebuild` asks `shouldFlickDismiss` four questions
// directly, which is the right thing to do with a pure function whose speed a harness cannot
// control. What neither covers is the WIRING: that `onUp` consults the rule at all, that it feeds
// it the velocity carried from the move stream rather than one measured against the release, and
// that it feeds it the interval since the last move rather than since the press.
//
// Any of those three could be wrong while both existing checks stay green — the rule would be
// correct and never reach the surface. Now that a drag can name its own speed, the decision can be
// driven end to end on a real sheet, which is what this does.
//
// FOUR CASES, AND THE PAIRS ARE THE POINT. A fast short drag and a slow short drag differ only in
// the clock; a slow long drag and a fast short one dismiss for different reasons. A single case
// passes on a gesture wired to nothing, because "the sheet went away" is also what an outside-tap
// does.

const flickResults = [];

await section("the flick decision reaches the sheet", async () => {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "reduce",
  });
  await page.setContent(page_html.replace("<body>", phoneBody));
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const { createOwnedMenu } = globalThis.__place;
    const { FLICK_PX_PER_MS, FLICK_MIN_PX, STALE_SAMPLE_MS } = globalThis.__flick;

    const attempt = ({ travel, msPerStep, restMs }) => {
      const menu = createOwnedMenu(document);
      for (let i = 0; i < 8; i += 1) menu.addRow({ icon: "pencil", label: `Row ${i}` });
      menu.showAt({ x: 200, y: 200 });
      const panel = menu.el;
      const bar = panel.querySelector(".db-mobile-bottom-sheet-handle");
      if (!bar) return { built: false };
      const bb = bar.getBoundingClientRect();
      const from = bb.y + bb.height / 2;
      const info = globalThis.__timedDrag({
        target: bar, panel, x: bb.x + bb.width / 2,
        from, to: from + travel, steps: 4, msPerStep, restMs,
      });
      const dismissed = !panel.isConnected;
      if (!dismissed) menu.close();
      return { built: true, dismissed, pxPerMs: Number(info.pxPerMs.toFixed(2)), travel, restMs };
    };

    return {
      threshold: FLICK_PX_PER_MS,
      minPx: FLICK_MIN_PX,
      staleMs: STALE_SAMPLE_MS,
      // Well under the 96px distance threshold, so only the velocity path can dismiss these.
      fastShort: attempt({ travel: 40, msPerStep: 8, restMs: 0 }),
      slowShort: attempt({ travel: 40, msPerStep: 120, restMs: 0 }),
      // Past the distance threshold at a speed the flick rule refuses, so only distance can.
      slowLong: attempt({ travel: 140, msPerStep: 60, restMs: 0 }),
      // Fast, then the finger rests on the glass before lifting.
      restedAfterFast: attempt({ travel: 40, msPerStep: 8, restMs: 150 }),
      // THE GESTURE THE PACKET ARGUED ABOUT. A brisk drag aiming for the distance threshold and
      // falling a pixel short: 95px at frame pace. An earlier velocity rule dismissed it, which is
      // why `031` reverted that attempt — a drag deliberately stopped short is a cancel, and a
      // surface that closes anyway ignores the user's own correction.
      briskShortOfThreshold: attempt({ travel: 95, msPerStep: 40, restMs: 0 }),
    };
  });

  const record = (name, pass, detail) => flickResults.push({ name, pass, detail });
  const { threshold, minPx, staleMs } = measured;
  const shape = (r) => `${r.travel}px at ${r.pxPerMs} px/ms`
    + (r.restMs ? ` with a ${r.restMs}ms rest before release` : "")
    + ` → ${r.dismissed ? "dismissed" : "sprang back"}`;

  record("all four gestures were staged on a real grab bar",
    [measured.fastShort, measured.slowShort, measured.slowLong, measured.restedAfterFast]
      .every((r) => r.built),
    `a sheet with no bar cannot answer any of these, and a run that could not stage them would `
      + `report four identical "sprang back" results and read as a working threshold`);

  record("a short drag delivered fast dismisses, and the same drag delivered slowly does not",
    measured.fastShort.dismissed && !measured.slowShort.dismissed,
    `${shape(measured.fastShort)}; ${shape(measured.slowShort)}. Both are ${measured.fastShort.travel}px, `
      + `well under the 96px distance threshold, so the only thing separating them is the clock — `
      + `which is the whole of what velocity dismissal added, and neither existing check drives it`);

  record("a long drag dismisses at a speed the flick rule refuses",
    measured.slowLong.dismissed && measured.slowLong.pxPerMs < threshold,
    `${shape(measured.slowLong)}, against a ${threshold} px/ms threshold. Distance and velocity are `
      + `separate paths and this one proves the distance path still works — a gesture wired only to `
      + `velocity would fail here while passing the pair above`);

  record("a finger that rests before lifting is not flicking",
    !measured.restedAfterFast.dismissed,
    `${shape(measured.restedAfterFast)}, against a ${staleMs}ms staleness bound. Same travel and `
      + `same speed as the case that dismissed, so what is asserted is that the interval the gesture `
      + `measures is the one since the last MOVE and not the one since the press`);

  record("a brisk drag that stops one pixel short of the threshold springs back",
    !measured.briskShortOfThreshold.dismissed,
    `${shape(measured.briskShortOfThreshold)} against a 96px distance threshold and a ${threshold} `
      + `px/ms velocity one. This is the gesture the packet argued about: an earlier velocity rule `
      + `dismissed it, and a drag deliberately stopped short is a cancel — a surface that closes `
      + `anyway ignores the correction the user just made. The 0.8 threshold sits above frame-pace `
      + `so both readings of this gesture agree, and that is why it is measured here rather than reasoned`);

  record("the distance floor is what keeps a tap off the velocity path",
    measured.fastShort.travel >= minPx,
    `the fast case travels ${measured.fastShort.travel}px against a ${minPx}px floor. A press and `
      + `release in one spot divides a tiny distance by a tiny interval and reads as infinitely `
      + `fast, which is the number this floor exists to refuse`);
});

// ───────────────────────────────────────────────────────────────────
// THE SELECT COLUMN IS AS WIDE AS WHAT IT DRAWS
// ───────────────────────────────────────────────────────────────────
//
// Read off the phone table capture: the select column is 65px of cell around a single 28px
// checkbox. The width rule said "on touch this cell holds two controls" and the row drew the second
// one only when a reorder was possible — two questions that had drifted apart, with the column
// always taking the wider answer.
//
// That is not an edge case. `canManualReorder` is false the moment a view is explicitly sorted,
// which is where a reader lands as soon as they tap a column header, so the ordinary sorted table
// on a phone carried 36px of dead width on every row of a 402px screen.
//
// Both states are rendered through the shipped `TableRenderer` on a coarse-pointer page, because
// the width rule only forks under touch and a desktop harness cannot see this at all.

const selectWidthResults = [];

await section("the select column is as wide as what it draws", async () => {
  const page = await browser.newPage({
    viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, reducedMotion: "reduce",
  });
  await page.setContent(page_html.replace("<body>", phoneBody));
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const { TableRenderer } = globalThis.__table;
    const host = document.querySelector(".note-database-container");

    const columns = [
      { key: "file.name", label: "Name", type: "text" },
      { key: "cost", label: "Cost", type: "number" },
    ];
    const rows = [0, 1, 2].map((i) => ({
      file: { path: `note-${i}.md`, name: `note-${i}.md`, basename: `Note ${i}` },
      frontmatter: { cost: i }, computed: {},
    }));

    const bag = {
      getVisibleColumns: () => columns,
      isRowSelected: () => false, toggleRowSelected: () => undefined,
      areAllRowsSelected: () => false, toggleRowsSelected: () => undefined,
      setupColumnHeader: (th, col) => { th.setText(col.label); },
      setupRow: () => undefined,
      renderCell: (td, row, col) => { td.setText(String(row.frontmatter[col.key] ?? "")); },
      captureInteractionSnapshot: () => undefined, restoreInteractionSnapshot: () => undefined,
      renderRecordIcon: () => null, renderGroupSummaries: () => undefined,
      applyConditionalFormat: () => undefined, setupFillHandle: () => undefined,
      // Present, so `canManualReorder` turns on the sort state alone rather than on a missing action.
      moveRowToPosition: () => undefined, moveRowsToGroup: () => undefined,
      moveRowToGroupAndPosition: () => undefined,
      createEntry: () => undefined, addColumn: () => undefined, showRowMenu: () => undefined,
      changeColumnCalculation: () => undefined,
      isGroupCollapsed: () => false, toggleGroupCollapsed: () => undefined,
      expandGroup: () => undefined,
      get hideCreateEntry() { return false; },
    };

    const render = (config) => {
      const container = host.createDiv({ cls: "db-table-host" });
      new TableRenderer(bag).renderTable(container, config, rows);
      const cell = container.querySelector("td.db-select-col");
      const headerCell = container.querySelector("th.db-select-col");
      const box = cell?.getBoundingClientRect();
      const controls = cell ? cell.querySelectorAll("button, input").length : 0;
      const widest = cell
        ? Math.max(0, ...[...cell.querySelectorAll("button, input")]
          .map((el) => Math.round(el.getBoundingClientRect().width)))
        : 0;
      const result = {
        built: Boolean(cell),
        headerWidth: headerCell ? Math.round(headerCell.getBoundingClientRect().width) : null,
        headerLeft: headerCell ? Math.round(headerCell.getBoundingClientRect().left) : null,
        cellLeft: box ? Math.round(box.left) : null,
        width: box ? Math.round(box.width) : null,
        controls,
        widest,
        classes: cell ? [...cell.querySelectorAll("button, input")]
          .map((el) => String(el.className).split(" ")[0]).join(", ") : "",
      };
      container.remove();
      return result;
    };

    const base = { schema: { columns }, viewType: "table", columnOrder: columns.map((c) => c.key) };
    return {
      // Reorder available: nothing pinned to a sort, so the row can draw its move button.
      reorderable: render({ ...base }),
      // The state a reader reaches by tapping a column header.
      sorted: render({ ...base, sortColumn: "cost", sortDirection: "asc" }),
    };
  });

  const record = (name, pass, detail) => selectWidthResults.push({ name, pass, detail });
  const { reorderable, sorted } = measured;
  const show = (r) => `${r.width}px of cell around ${r.controls} control(s) [${r.classes || "none"}]`
    + `, header ${r.headerWidth}px`;

  record("both table states render a select cell to measure",
    reorderable.built && sorted.built,
    `reorderable built=${reorderable.built}, sorted built=${sorted.built}. A width comparison over `
      + `a cell that never rendered compares nothing`);

  record("a sorted table does not reserve room for a reorder button it will not draw",
    sorted.controls === 1 && sorted.width !== null && sorted.width - sorted.widest <= 16,
    `sorted: ${show(sorted)}; reorderable: ${show(reorderable)}. The gap between the cell and its `
      + `widest control is ${sorted.width - sorted.widest}px — that is padding, and anything much `
      + `larger is a second control's worth of room with no second control in it`);

  // A HEADER/ROW ALIGNMENT PAIR WAS WRITTEN HERE AND REMOVED, BECAUSE IT COULD NOT FAIL.
  //
  // The concern was real: a `th` never holds a move button, so a `:has()` written against the CELL
  // rather than the table would shrink the header and leave it on a different column from its rows.
  // Two attempts to produce that red both stayed green — once with the cell-keyed rule, once with a
  // rule narrowing the `th` outright — because in an AUTO-layout table the column algorithm
  // reconciles a `th` and a `td` in the same column to one width. The pair was asserting a property
  // of table layout, not of this stylesheet.
  //
  // The width check above is the real guard: run against the cell-keyed rule it reported 64px in
  // both states, which is that mistake failing. The header/row numbers stay in the detail line so a
  // reader can still see them.

  record("the two states differ, so the width is answering the question and not a constant",
    reorderable.width !== sorted.width,
    `reorderable ${reorderable.width}px against sorted ${sorted.width}px. Equal widths here mean `
      + `the rule stopped forking — which is how it went wrong the first time, in the other direction`);
});

// ───────────────────────────────────────────────────────────────────
// EVERY FIXTURE TABLE HAS AS MANY CELLS AS IT HAS HEADERS
// ───────────────────────────────────────────────────────────────────
//
// Two captures were photographing tables the plugin does not build, and both were found by a person
// opening the PNG rather than by anything here.
//
// `panel-record-peek` hand-rolled its rows and omitted the select cell its own header declares, so
// every body row sat one column LEFT of its header: the record name rendered inside the 76px
// checkbox column and truncated to two characters, the cost sat under "Name", the category under
// "Next Renewal". `table-mobile` drew its own select and record-icon headers and then called
// `tableHeader()`, which emits a select header of its own — nine header cells against eight body
// cells, so the columns were labelled with their neighbours' names and the phone shot had no
// visible labels at all.
//
// Both are one bug: a header and its rows disagreeing about how many columns there are. It is
// mechanically checkable, and it is exactly the kind of thing that survives because the picture
// still looks like a table. Every scenario is rendered and every `<table>` in it is asked.
//
// COLSPAN IS COUNTED, NOT IGNORED. A footer or group row legitimately spans columns, and summing
// `colSpan` rather than counting elements is what lets those rows pass while a missing cell fails.

const fixtureTableResults = [];
let titleLinksChecked = 0;
const bareTitleOffenders = [];
let dropdownFieldsChecked = 0;
const iconlessOffenders = [];
let menuRowsChecked = 0;
const sharedGlyphOffenders = [];

await section("every fixture table has as many cells as it has headers", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  const styles = readFileSync(join(REPO, "styles.css"), "utf8");
  const theme = readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8");

  const offenders = [];
  let tablesChecked = 0;
  let scenariosRendered = 0;

  for (const scenario of SCENARIOS) {
    let html;
    try {
      html = scenario.html();
    } catch {
      continue;
    }
    await page.setContent(`<body class="theme-dark"><div id="shot">${html}</div></body>`);
    for (const content of [styles, theme]) await page.addStyleTag({ content });
    scenariosRendered += 1;

    const found = await page.evaluate((id) => {
      const rows = [];
      let tables = 0;
      for (const table of document.querySelectorAll("table")) {
        const headerRow = table.querySelector("thead tr");
        if (!headerRow) continue;
        tables += 1;
        const span = (cells) => [...cells].reduce((sum, cell) => sum + (cell.colSpan || 1), 0);
        const headerCells = span(headerRow.querySelectorAll(":scope > th, :scope > td"));
        for (const bodyRow of table.querySelectorAll("tbody > tr")) {
          const bodyCells = span(bodyRow.querySelectorAll(":scope > th, :scope > td"));
          if (bodyCells === headerCells) continue;
          rows.push({
            scenario: id,
            headerCells,
            bodyCells,
            first: (bodyRow.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40),
          });
          break;
        }
      }
      // A title link the renderer never builds.
      //
      // `cell-renderer` puts the note title through `renderInlineFileTitle`, which wraps it in
      // `.db-file-title-inline > .db-file-title-name` — and the ellipsis lives on that inner span.
      // A fixture that drops bare text into the anchor instead gets no ellipsis owner, so a long
      // name hard-clips at the cell wall. That is a fact about the fixture, and it was photographed
      // as though it were a fact about the plugin.
      const bareTitles = [];
      for (const link of document.querySelectorAll(".db-title-cell a.internal-link")) {
        if (link.querySelector(".db-file-title-name")) continue;
        bareTitles.push({
          scenario: id,
          text: (link.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40),
        });
      }
      // An icon supplied without the class that reveals it.
      //
      // The renderer sets `has-current-icon` whenever an icon exists. Without it the stylesheet
      // hides `.db-dropdown-field-icon`, and a hidden element is not a grid item — so on a
      // three-column row every remaining child shifts one track left, the label lands in the icon's
      // 18px column and the chevron takes the label's. Five rows of one popover rendered as single
      // clipped glyphs that way, and four captures of it were kept as though that were the surface.
      const iconlessRows = [];
      for (const field of document.querySelectorAll(".db-dropdown-field")) {
        const icon = field.querySelector(".db-dropdown-field-icon");
        if (!icon || !icon.children.length) continue;
        if (field.classList.contains("has-current-icon")) continue;
        iconlessRows.push({ scenario: id, text: (field.textContent || "").trim().replace(/\s+/g, " ").slice(0, 34) });
      }
      // One glyph serving two actions in one menu.
      //
      // In a row list the icon is what separates two settings at a glance, so two rows drawing the
      // same SVG read as the same control twice. The fixtures did it three times — the utilities
      // popover drew the plain refresh for both "Save computed results" and "Refresh database"
      // where the toolbar draws a recalculate badge for the first, and the timeline options drew
      // the dotted calendar for "Year display" where the renderer draws the plain one.
      //
      // One pair is EXEMPT because it is faithful: the calendar options give "Event start date" and
      // "First day of the week" the same icon in the renderer too, and they sit under different
      // section headings. A check that flagged it would be asking the fixture to disagree with the
      // product.
      const SHARED_GLYPH_EXEMPT = ["First day of the week"];
      const sharedGlyphs = [];
      for (const group of document.querySelectorAll(
        ".db-toolbar-utilities-popover, .db-view-tab-popover, .db-owned-menu, .db-chart-options-popover, .db-calendar-options-content, .db-calendar-timeline-options-content",
      )) {
        const byIcon = new Map();
        for (const row of group.querySelectorAll("button, .db-menu-item, .db-utilities-row")) {
          const svg = row.querySelector("svg");
          const label = (row.textContent || "").trim().split("\n")[0].trim();
          if (!svg || !label) continue;
          const key = svg.innerHTML.replace(/\s+/g, "");
          if (!key) continue;
          if (!byIcon.has(key)) byIcon.set(key, new Set());
          byIcon.get(key).add(label);
        }
        for (const [, labels] of byIcon) {
          const list = [...labels];
          if (list.length < 2) continue;
          if (list.some((l) => SHARED_GLYPH_EXEMPT.includes(l))) continue;
          sharedGlyphs.push({ scenario: id, labels: list.slice(0, 3) });
        }
      }
      return {
        rows, tables, bareTitles, iconlessRows, sharedGlyphs,
        menuRows: document.querySelectorAll(
          ".db-toolbar-utilities-popover .db-menu-item, .db-view-tab-popover .db-menu-item, .db-owned-menu .db-menu-item, .db-chart-options-popover button",
        ).length,
        titleLinks: document.querySelectorAll(".db-title-cell a.internal-link").length,
        dropdownFields: document.querySelectorAll(".db-dropdown-field").length,
      };
    }, scenario.id);

    tablesChecked += found.tables;
    offenders.push(...found.rows);
    titleLinksChecked += found.titleLinks;
    bareTitleOffenders.push(...found.bareTitles);
    dropdownFieldsChecked += found.dropdownFields;
    iconlessOffenders.push(...found.iconlessRows);
    menuRowsChecked += found.menuRows;
    sharedGlyphOffenders.push(...found.sharedGlyphs);
  }

  await page.close();

  const record = (name, pass, detail) => fixtureTableResults.push({ name, pass, detail });

  record("there are fixture tables to check",
    tablesChecked > 0,
    `${tablesChecked} table(s) with a header row across ${scenariosRendered} scenario(s). A run that `
      + `found no table would report perfect agreement over nothing, which is how this class of `
      + `defect survived in the first place`);

  record("every fixture title link is built the way the renderer builds one",
    titleLinksChecked > 0 && bareTitleOffenders.length === 0,
    `${titleLinksChecked} title link(s) across the fixture set; ${bareTitleOffenders.length} carry bare `
      + `text instead of the renderer's .db-file-title-name`
      + (bareTitleOffenders.length
        ? `: ${[...new Set(bareTitleOffenders.map((b) => b.scenario))].join(", ")}`
        : "")
      + `. The ellipsis lives on that inner span, so a bare-text anchor hard-clips a long name at the `
      + `cell wall and the capture then shows a truncation the plugin does not produce`);

  record("a fixture dropdown that supplies an icon also says it has one",
    dropdownFieldsChecked > 0 && iconlessOffenders.length === 0,
    `${dropdownFieldsChecked} dropdown field(s) across the fixture set; ${iconlessOffenders.length} carry `
      + `icon markup without has-current-icon`
      + (iconlessOffenders.length
        ? `: ${[...new Set(iconlessOffenders.map((o) => o.scenario))].join(", ")}`
        : "")
      + `. The stylesheet hides the icon without that class, and a hidden element leaves the grid, so `
      + `every later child slides one track left and the label ends up in the icon's column`);

  record("no menu draws one glyph for two different actions",
    menuRowsChecked > 0 && sharedGlyphOffenders.length === 0,
    `${menuRowsChecked} menu row(s) across the fixture set; ${sharedGlyphOffenders.length} pair(s) share a glyph`
      + (sharedGlyphOffenders.length
        ? `: ${sharedGlyphOffenders.map((o) => `${o.scenario} ${JSON.stringify(o.labels)}`).join("; ")}`
        : "")
      + `. The icon is what separates two settings at a glance, so the same SVG twice reads as the `
      + `same control twice. One pair is exempt as faithful: the calendar's start-date and `
      + `first-day rows share an icon in the renderer too, under different section headings`);

  record("no fixture body row disagrees with its own header about the column count",
    offenders.length === 0,
    offenders.length === 0
      ? `${tablesChecked} table(s) checked, every body row matching its header's column span`
      : offenders.map((o) => `${o.scenario}: header spans ${o.headerCells}, a body row spans `
        + `${o.bodyCells} ("${o.first}")`).join("; "));
});

// ───────────────────────────────────────────────────────────────────
// THE PROPERTIES PANEL OWNS WHAT IT SUBSCRIBES
// ───────────────────────────────────────────────────────────────────
//
// `002`'s five-dimension row says "No mapping exists for this packet", and of the five, RESOURCE
// OWNERSHIP is the one nothing here had ever measured. `010` mapped the same dimension for the
// record sheet and its first run found a real leak — `0 listeners before, 4 while open, 2 after` —
// which is the reason to measure rather than reason.
//
// The column manager is the shape that makes this worth asking. It re-renders on every mutation:
// adding a property, toggling one, reordering, deleting. Each render calls `positionToolbarPopover`,
// which subscribes to window resize, document scroll and both `visualViewport` events, and each
// render removes the previous panel node. A node removed is not a subscription released.
//
// So the question is not "does one render leak" but "does the tenth". A single open-and-close can
// balance while a re-render path accumulates, and a panel a reader has poked at four times has
// re-rendered four times.

const panelOwnershipResults = [];

await section("the properties panel owns what it subscribes", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(async () => {
    const { ColumnManagerRenderer } = globalThis.__columns;
    const host = document.querySelector(".note-database-container");

    // Count every window-level subscription the panel path can take, not only the viewport ones.
    // `positionToolbarPopover` takes four across three targets, and counting one target would
    // report a quarter of a leak as none.
    const live = new Map();
    const targets = [
      ["window", window],
      ["document", document],
      ["visualViewport", window.visualViewport],
    ].filter(([, t]) => t);
    for (const [name, target] of targets) {
      const add = target.addEventListener.bind(target);
      const remove = target.removeEventListener.bind(target);
      target.addEventListener = (type, fn, opts) => {
        const key = `${name}:${type}`;
        live.set(key, (live.get(key) || 0) + 1);
        return add(type, fn, opts);
      };
      target.removeEventListener = (type, fn, opts) => {
        const key = `${name}:${type}`;
        const held = live.get(key) || 0;
        if (held <= 1) live.delete(key); else live.set(key, held - 1);
        return remove(type, fn, opts);
      };
    }
    const outstanding = () => [...live.values()].reduce((a, b) => a + b, 0);

    const columns = [
      { key: "file.name", label: "Name", type: "text" },
      { key: "status", label: "Status", type: "text" },
      { key: "owner", label: "Owner", type: "text" },
    ];
    const config = { schema: { columns }, viewType: "table", columnOrder: columns.map((c) => c.key) };
    const state = { hiddenColumns: new Set(), filters: [], sortRules: [], sortDirection: "asc" };
    const actions = new Proxy({ isReadOnly: false }, {
      get(target, key) {
        if (key in target) return target[key];
        if (typeof key === "symbol") return undefined;
        return () => undefined;
      },
      has: () => true,
    });

    const container = host.createDiv({ cls: "db-cm-host" });
    container.createDiv({ cls: "db-toolbar" });
    const anchor = container.createEl("button", { cls: "anchor", text: "Properties" });
    const renderer = new ColumnManagerRenderer();

    const before = outstanding();
    renderer.render(container, true, config, state, columns, actions, anchor);
    const afterFirst = outstanding();

    // Nine more renders, which is what toggling a few properties costs a reader.
    for (let i = 0; i < 9; i += 1) {
      renderer.render(container, true, config, state, columns, actions, anchor);
    }
    const afterTen = outstanding();

    // And the close: `render(..., visible=false)` is how the panel is dismissed.
    renderer.render(container, false, config, state, columns, actions, anchor);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const afterClose = outstanding();
    const nodesLeft = document.querySelectorAll(".db-column-manager").length;

    // The positioner's `schedule` releases itself when it finds its panel disconnected — but only
    // when an event arrives to run it. So the question is not whether the subscriptions exist after
    // ten renders, it is whether they are still there after the first thing that would use them.
    // A lazy release and a leak look identical until something fires.
    window.dispatchEvent(new Event("resize"));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const afterOneEvent = outstanding();

    container.remove();
    return {
      before, afterFirst, afterTen, afterClose, afterOneEvent, nodesLeft,
      perRender: afterFirst - before,
      byKey: [...live.entries()].map(([k, n]) => `${k}=${n}`).join(", ") || "none",
    };
  });

  const record = (name, pass, detail) => panelOwnershipResults.push({ name, pass, detail });
  const m = measured;

  record("opening the properties panel subscribes to something",
    m.afterFirst > m.before,
    `${m.before} subscription(s) before, ${m.afterFirst} after one render. A panel that subscribes `
      + `to nothing makes every count below trivially balanced, so this is the premise rather than `
      + `an aside`);

  // STATED AS COLLECTION, NOT AS ABSENCE — because absence is not what this design promises.
  //
  // The positioner releases itself when `schedule` finds its panel disconnected, which means a
  // stale subscription is collected by the first event that would have used it rather than at
  // teardown. Asserting zero between renders would fail a correct implementation; asserting they
  // never go would miss a real leak. What is asserted is that ONE event collects the lot.
  record("stale subscriptions are collected by the first event that would use them",
    m.afterOneEvent === m.before && m.nodesLeft === 0,
    `${m.before} before, ${m.afterFirst} after one render, ${m.afterTen} after ten, `
      + `${m.afterClose} after the close, and ${m.afterOneEvent} after a single window resize. `
      + `${m.nodesLeft} panel node(s) remain. Outstanding by key at the close: ${m.byKey}. `
      + `The positioner self-releases when it finds its panel disconnected, so the accumulation `
      + `between renders is deferred collection rather than a leak — but only if an event actually `
      + `collects it, which is what this measures instead of assuming`);

  record("the accumulation between renders is bounded by the renders, not unbounded",
    m.afterTen === m.afterFirst * 10,
    `${m.afterFirst} per render and ${m.afterTen} after ten — exactly ten times, so each render `
      + `subscribes once and nothing subscribes on its own. A number above this would mean a `
      + `render subscribing more than once, which no event count would collect back`);
});

// ───────────────────────────────────────────────────────────────────
// THE RECORD PEEK OWNS WHAT IT SUBSCRIBES
// ───────────────────────────────────────────────────────────────────
//
// `006`'s five-dimension row says "No mapping exists for this packet", and resource ownership is
// again the one with nothing behind it.
//
// The peek is the surface where this is worth asking rather than reasoning. It takes four things —
// a capturing `keydown` on the document, a `scroll` on its container, a `resize` on the window, and
// a `setTimeout` that later adds a capturing `mousedown` — and it is a module-level SINGLETON:
// opening a second peek closes the first. So there are two teardown paths, the explicit close and
// the replacement, and only one of them is the one a reader takes most often.
//
// The timer is the interesting part. The outside-click listener is added a tick AFTER open, so a
// peek closed within that tick must not add it — and a peek closed after must remove it. Those are
// different bugs and a single open-and-close exercises neither.

const peekOwnershipResults = [];

await section("the record peek owns what it subscribes", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(async () => {
    const { openTableRecordPeek, closeTableRecordPeek } = globalThis.__layer;
    const host = document.querySelector(".note-database-container");

    const live = new Map();
    const watch = (name, target) => {
      const add = target.addEventListener.bind(target);
      const remove = target.removeEventListener.bind(target);
      target.addEventListener = (type, fn, opts) => {
        const key = `${name}:${type}`;
        live.set(key, (live.get(key) || 0) + 1);
        return add(type, fn, opts);
      };
      target.removeEventListener = (type, fn, opts) => {
        const key = `${name}:${type}`;
        const held = live.get(key) || 0;
        if (held <= 1) live.delete(key); else live.set(key, held - 1);
        return remove(type, fn, opts);
      };
    };
    watch("document", document);
    watch("window", window);
    watch("container", host);
    const outstanding = () => [...live.values()].reduce((a, b) => a + b, 0);
    const keys = () => [...live.entries()].map(([k, n]) => `${k}=${n}`).join(", ") || "none";

    const columns = [
      { key: "file.name", label: "Name", type: "text" },
      { key: "status", label: "Status", type: "text" },
    ];
    const rowFor = (name) => ({
      file: { path: `${name}.md`, name: `${name}.md`, basename: name },
      frontmatter: { status: "Open" }, computed: {},
    });
    const peekConfig = { viewType: "table", schema: { columns, computedFields: [] }, titleField: "file.name" };
    const open = (name) => {
      const anchor = host.createDiv({ cls: "anchor" });
      openTableRecordPeek({
        anchor, row: rowFor(name), config: peekConfig,
        visibleColumns: columns, allColumns: columns, container: host,
      });
      return anchor;
    };
    const settle = () => new Promise((r) => setTimeout(r, 4));

    const before = outstanding();

    // 1. Open, let the deferred listener arrive, close.
    const a = open("A");
    const afterOpen = outstanding();
    await settle();
    const afterTimer = outstanding();
    closeTableRecordPeek();
    const afterClose = outstanding();

    // 2. Replacement, which is the path a reader takes by clicking a second row. The singleton
    //    closes the first peek itself, and that teardown is a different line from the explicit one.
    const b = open("B");
    await settle();
    const twoDeep = outstanding();
    const c = open("C");
    await settle();
    const afterReplace = outstanding();
    closeTableRecordPeek();
    await settle();
    const afterReplaceClose = outstanding();

    // 3. Closed INSIDE the tick, before the deferred listener is due. It must never be added.
    const d = open("D");
    closeTableRecordPeek();
    await settle();
    const closedInsideTick = outstanding();

    for (const anchor of [a, b, c, d]) anchor.remove();
    const nodesLeft = document.querySelectorAll(".db-record-peek-panel").length;
    return {
      before, afterOpen, afterTimer, afterClose,
      twoDeep, afterReplace, afterReplaceClose, closedInsideTick, nodesLeft, keys: keys(),
    };
  });

  const record = (name, pass, detail) => peekOwnershipResults.push({ name, pass, detail });
  const m = measured;

  record("opening a peek subscribes, and the deferred outside-click arrives after it",
    m.afterOpen > m.before && m.afterTimer > m.afterOpen,
    `${m.before} before, ${m.afterOpen} on open, ${m.afterTimer} once the tick has passed. The `
      + `outside-click listener is added a tick late on purpose — the click that opened the panel `
      + `must not close it — so a count taken at open misses it and a balanced total proves nothing`);

  record("closing a peek takes back everything it took",
    m.afterClose === m.before,
    `${m.before} before, ${m.afterClose} after one open-and-close`);

  record("replacing a peek does not stack a second peek's subscriptions",
    m.afterReplace === m.twoDeep && m.afterReplaceClose === m.before,
    `${m.twoDeep} with one peek open, ${m.afterReplace} after opening a second on top of it, and `
      + `${m.afterReplaceClose} after closing. The peek is a module singleton, so the second open `
      + `tears the first down itself — a different line from the explicit close, and the one a `
      + `reader takes by clicking another row`);

  record("a peek closed inside the tick never adds the deferred listener",
    m.closedInsideTick === m.before && m.nodesLeft === 0,
    `${m.closedInsideTick} outstanding after opening and closing within the same tick, `
      + `${m.nodesLeft} panel node(s) left. Adding a capturing document listener for a panel that `
      + `is already gone is the shape a timer-based subscription fails in, and it is invisible to `
      + `an open-and-close that waits`);
});

// ───────────────────────────────────────────────────────────────────
// EVERY ROW CHECKBOX TOGGLES ITS OWN ROW
// ───────────────────────────────────────────────────────────────────
//
// `004`'s five-dimension row names them and maps none. Its appearance is measured to death — sizes,
// radii, per-state signatures, borrowed ancestors — and all of that is about how a checkbox LOOKS.
// Nothing here had asked what one DOES.
//
// Semantic identity and action outcome are the same question for this surface: the box in row seven
// must toggle row seven. That is the bug an index-keyed selection produces, it survives every
// appearance check ever written, and it is invisible until two rows disagree.
//
// So every row's checkbox is clicked in turn and the row the action received is compared to the row
// the box was drawn in. `createCheckbox` itself subscribes to nothing — it is a DOM factory — so
// resource ownership here is a zero claim, and it is asserted rather than assumed for the same
// reason: a factory that started subscribing would be a change worth catching.

const checkboxIdentityResults = [];

await section("every row checkbox toggles its own row", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const { TableRenderer } = globalThis.__table;
    const host = document.querySelector(".note-database-container");

    const columns = [
      { key: "file.name", label: "Name", type: "text" },
      { key: "cost", label: "Cost", type: "number" },
    ];
    const rows = Array.from({ length: 8 }, (_, i) => ({
      file: { path: `note-${i}.md`, name: `note-${i}.md`, basename: `Note ${i}` },
      frontmatter: { cost: i }, computed: {},
    }));

    const toggled = [];
    const bag = {
      getVisibleColumns: () => columns,
      isRowSelected: () => false,
      toggleRowSelected: (row) => toggled.push(row?.file?.path ?? String(row)),
      areAllRowsSelected: () => false, toggleRowsSelected: () => undefined,
      setupColumnHeader: (th, col) => { th.setText(col.label); },
      setupRow: () => undefined,
      renderCell: (td, row, col) => { td.setText(String(row.frontmatter[col.key] ?? "")); },
      captureInteractionSnapshot: () => undefined, restoreInteractionSnapshot: () => undefined,
      renderRecordIcon: () => null, renderGroupSummaries: () => undefined,
      applyConditionalFormat: () => undefined, setupFillHandle: () => undefined,
      moveRowToPosition: () => undefined, moveRowsToGroup: () => undefined,
      moveRowToGroupAndPosition: () => undefined,
      createEntry: () => undefined, addColumn: () => undefined, showRowMenu: () => undefined,
      changeColumnCalculation: () => undefined,
      isGroupCollapsed: () => false, toggleGroupCollapsed: () => undefined,
      expandGroup: () => undefined,
      get hideCreateEntry() { return false; },
    };

    // A factory that takes nothing is a claim, so it is watched rather than trusted.
    const live = new Map();
    for (const [name, target] of [["document", document], ["window", window]]) {
      const add = target.addEventListener.bind(target);
      target.addEventListener = (type, fn, opts) => {
        live.set(`${name}:${type}`, (live.get(`${name}:${type}`) || 0) + 1);
        return add(type, fn, opts);
      };
    }

    const container = host.createDiv({ cls: "db-cb-host" });
    const config = { schema: { columns }, viewType: "table", columnOrder: columns.map((c) => c.key) };
    new TableRenderer(bag).renderTable(container, config, rows);

    const rowEls = [...container.querySelectorAll("tr[data-note-database-row-path]")];
    const pairs = [];
    for (const tr of rowEls) {
      const drawnIn = tr.getAttribute("data-note-database-row-path");
      const box = tr.querySelector("td.db-select-col input.db-checkbox");
      if (!box) { pairs.push({ drawnIn, received: "(no checkbox)" }); continue; }
      const before = toggled.length;
      box.click();
      pairs.push({ drawnIn, received: toggled.slice(before)[0] ?? "(nothing)" });
    }

    container.remove();
    return {
      rows: rowEls.length,
      pairs,
      mismatched: pairs.filter((p) => p.drawnIn !== p.received),
      factoryKeys: [...live.entries()].map(([k, n]) => `${k}=${n}`).join(", ") || "none",
      factoryCount: [...live.values()].reduce((a, b) => a + b, 0),
    };
  });

  const record = (name, pass, detail) => checkboxIdentityResults.push({ name, pass, detail });
  const m = measured;

  record("every row rendered a checkbox to click",
    m.rows > 1 && m.pairs.every((p) => p.received !== "(no checkbox)"),
    `${m.rows} row(s) rendered, ${m.pairs.filter((p) => p.received === "(no checkbox)").length} `
      + `without a checkbox. A run over one row cannot show a row toggling its neighbour, and a run `
      + `over none reports perfect agreement`);

  record("the checkbox in each row toggles the row it was drawn in",
    m.rows > 1 && m.mismatched.length === 0,
    m.mismatched.length === 0
      ? `${m.rows} rows, each box handed the action its own path — this is the bug an index-keyed `
        + `selection produces, and it survives every appearance check in this packet`
      : m.mismatched.map((p) => `drawn in ${p.drawnIn} but toggled ${p.received}`).join("; "));

  record("the checkbox factory subscribes to nothing",
    m.factoryCount === 0,
    `${m.factoryCount} document or window subscription(s) taken while rendering ${m.rows} rows: `
      + `${m.factoryKeys}. A DOM factory that started subscribing would leak once per row, which is `
      + `the worst place for it — so the zero is asserted rather than assumed`);
});

const listOwnershipResults = [];

// ───────────────────────────────────────────────────────────────────
// CHOOSING A VIEW TYPE ASKS FOR THAT VIEW TYPE
// ───────────────────────────────────────────────────────────────────
//
// `013`'s five-dimension row is unticked and the reason is visible in this file: every existing
// add-view check drives the menu with `{ addView() {} }` — a no-op stub. They measure the surface's
// layout, its row grammar, its width and its placement, and not one of them looks at what the menu
// ASKS FOR when a row is pressed.
//
// That is the false-green shape `000`'s audit names by hand: "the action-outcome dimension here
// drives `openRow` and `editCell`, which are no-op stubs — the same false green the title-cell tap
// had." The add-view menu has it too.
//
// So every type row is pressed and the arguments `addView` received are read: the type, and the
// form fields the row is supposed to carry with it. A menu that offered seven rows and asked for
// "table" every time would pass every check this file already has.

const addViewOutcomeResults = [];

await section("choosing a view type asks for that view type", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const { ToolbarRenderer } = globalThis.__place;
    const host = document.querySelector(".note-database-container");

    const db = {
      schema: { columns: [
        { key: "file.name", label: "Name" },
        { key: "due", label: "Due" },
      ] },
      views: [{ viewType: "table", name: "All" }],
    };

    const asked = [];
    const open = () => {
      const anchor = host.createDiv({ cls: "anchor" });
      new ToolbarRenderer().showAddViewMenu(
        new MouseEvent("click"),
        {
          addView: (type, options) => asked.push({ type, options: options ?? null }),
          closeToolbarPopovers: () => undefined,
        },
        anchor, db, 0,
      );
      return anchor;
    };

    // One press per row, each on a freshly opened menu — pressing a row closes the popover, so a
    // single open cannot exercise the second row at all.
    const anchor0 = open();
    const panel = document.querySelector(".db-add-view-popover");
    const labels = panel
      ? [...panel.querySelectorAll(".db-add-view-choices .db-menu-item")]
        .map((row) => (row.querySelector(".db-menu-item-label")?.textContent || "").trim())
      : [];
    anchor0.remove();
    panel?.remove();

    const pressed = [];
    for (let i = 0; i < labels.length; i += 1) {
      const anchor = open();
      const menu = document.querySelector(".db-add-view-popover");
      const rows = [...menu.querySelectorAll(".db-add-view-choices .db-menu-item")];
      const before = asked.length;
      // Name the view before pressing, so the options the row carries can be read too — a row that
      // asks for the right TYPE and drops the form is still the wrong outcome.
      const nameInput = menu.querySelector("input[type=text], .db-add-view-name input, input");
      if (nameInput) nameInput.value = `View ${i}`;
      rows[i].click();
      const got = asked.slice(before)[0] ?? null;
      pressed.push({
        label: labels[i],
        type: got?.type ?? "(nothing)",
        name: got?.options?.name ?? "(none)",
        duplicate: got?.options?.duplicateCurrent === true,
        isDuplicateRow: rows[i].classList.contains("db-add-view-duplicate-action"),
      });
      anchor.remove();
      document.querySelector(".db-add-view-popover")?.remove();
    }

    const typeRows = pressed.filter((p) => !p.isDuplicateRow);
    return {
      labels, pressed, typeRows,
      duplicateRows: pressed.filter((p) => p.isDuplicateRow),
      distinctTypes: [...new Set(typeRows.map((p) => p.type))].length,
    };
  });

  const record = (name, pass, detail) => addViewOutcomeResults.push({ name, pass, detail });
  const m = measured;

  record("the add view menu offers more than one type row to press",
    m.labels.length > 2,
    `${m.labels.length} row(s) in the choices group: ${m.labels.join(", ") || "none"}. One row `
      + `cannot show a menu that asks for the same type whatever is pressed`);

  record("every row reached the action",
    m.pressed.length > 0 && m.pressed.every((p) => p.type !== "(nothing)"),
    m.pressed.map((p) => `${p.label} → ${p.type}`).join("; ")
      + `. Existing add-view checks pass a no-op \`addView\`, so none of them can tell a wired row `
      + `from a dead one`);

  // THE DUPLICATE ROW IS NOT A SEVENTH TYPE, AND ASSERTING IT WAS FOUND A FAULT IN THE CHECK.
  //
  // The first version of this required all seven rows to ask for different types and reported
  // `6 distinct type(s) from 7 row(s)` — because "Duplicate current view" correctly asks for the
  // CURRENT view's type, which is `table` here, the same as the Table row. The product was right
  // and the assertion was wrong. Splitting them is stronger than loosening the count: the six type
  // rows must each ask for something different, and the duplicate row must ask for the current
  // type WITH `duplicateCurrent`, which is what distinguishes it from a type row that shares a name.
  record("each type row asks for a different type, so the menu is not answering with one answer",
    m.distinctTypes === m.typeRows.length && m.typeRows.length > 2,
    `${m.distinctTypes} distinct type(s) from ${m.typeRows.length} type row(s): `
      + `${m.typeRows.map((p) => `${p.label} → ${p.type}`).join("; ")}. A menu wired to ask for `
      + `"table" from every row passes every layout, grammar and placement check in this file`);

  record("the duplicate row asks for the current view's type and says it is a duplicate",
    m.duplicateRows.length === 1 && m.duplicateRows[0].type === "table"
      && m.duplicateRows[0].duplicate === true
      && m.typeRows.every((p) => p.duplicate === false),
    `${m.duplicateRows.length} duplicate row(s): `
      + `${m.duplicateRows.map((p) => `${p.label} → ${p.type}, duplicateCurrent=${p.duplicate}`).join("; ")}. `
      + `The current view is a table, so its type matching the Table row is correct — the flag is `
      + `what separates them, and the type rows all carry it false`);

  record("the row carries the form's name with it, not only the type",
    m.pressed.every((p, i) => p.name === `View ${i}`),
    `names received: ${m.pressed.map((p) => p.name).join(", ")}. A row that asks for the right type `
      + `and drops the name the operator just typed is still the wrong outcome, and a type-only `
      + `assertion cannot see it`);
});

// ───────────────────────────────────────────────────────────────────
// A TAP ON A FIELD EDITS THAT FIELD
// ───────────────────────────────────────────────────────────────────
//
// `000`'s five-dimension row names its own gap: "the action-outcome dimension here drives `openRow`
// and `editCell`, which are no-op stubs — the same false green the title-cell tap had."
//
// The record sheet has nine checks on its inline editor in this file. Every one is about GEOMETRY —
// where the editor lands, whether it is an overlay, whether it clears the thumb floor, whether it
// stays inside its row. Not one reads which COLUMN it opened for. A sheet that answered every tap
// by editing the first field would pass all nine.
//
// So each field row is tapped in turn and the column `editCell` received is compared to the column
// the row was drawn for. The row is identified by its own declared column key, never by its index,
// because index-matching is the bug being looked for.

const editOutcomeResults = [];

await section("a tap on a field edits that field", async () => {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "reduce",
  });
  await page.setContent(page_html.replace("<body>", phoneBody));
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const { openRecordDetailPanel, closeRecordDetailPanel } = globalThis.__edit;
    const host = document.querySelector(".note-database-container");

    const columns = [
      { key: "file.name", label: "Name", type: "text" },
      { key: "income", label: "Income", type: "number" },
      { key: "expenses", label: "Expenses", type: "number" },
      { key: "status", label: "Status", type: "text" },
    ];
    const row = {
      file: { path: "note.md", name: "note.md", basename: "Note" },
      frontmatter: { income: 100, expenses: 40, status: "Open" },
      computed: {},
    };

    const edits = [];
    const anchor = host.createDiv({ cls: "anchor" });
    openRecordDetailPanel({
      anchorEl: anchor, host, row, columns,
      config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
      app: {},
      actions: {
        editCell: (target, editRow, col) => edits.push(col?.key ?? String(col)),
        openRow: () => undefined,
        editFileName: () => edits.push("file.name"),
        isReadOnly: false,
      },
    });

    const panel = document.querySelector(".db-record-detail-panel");
    if (!panel) return { built: false, pairs: [] };

    // Rows carry their own column key, so the pairing is by declaration and never by position.
    const fieldRows = [...panel.querySelectorAll("[data-note-database-column-key]")];
    const pairs = [];
    for (const el of fieldRows) {
      const declared = el.getAttribute("data-note-database-column-key");
      const value = el.querySelector(".db-record-detail-value, .db-record-detail-field-value") ?? el;
      const before = edits.length;
      value.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      pairs.push({ declared, received: edits.slice(before)[0] ?? "(nothing)" });
    }

    closeRecordDetailPanel();
    anchor.remove();
    return { built: true, pairs, rows: fieldRows.length };
  });

  const record = (name, pass, detail) => editOutcomeResults.push({ name, pass, detail });
  const m = measured;
  const reached = m.pairs.filter((p) => p.received !== "(nothing)");
  const wrong = reached.filter((p) => p.declared !== p.received);

  record("the sheet drew field rows carrying their own column key",
    m.built && m.rows > 2,
    `${m.rows} row(s) with a declared column key. Fewer than three cannot show a tap answering with `
      + `its neighbour's column, and pairing by INDEX would hide exactly the bug this looks for`);

  record("at least one tap reached the edit action",
    reached.length > 0,
    `${reached.length} of ${m.pairs.length} taps reached \`editCell\`: `
      + `${m.pairs.map((p) => `${p.declared} → ${p.received}`).join("; ")}. The nine existing checks `
      + `on this editor are all geometry and pass a no-op action, so none can tell a wired row `
      + `from a dead one`);

  record("every tap that reached the action edited the column its row declares",
    reached.length > 0 && wrong.length === 0,
    wrong.length === 0
      ? `${reached.length} tap(s), each answering with its own column: `
        + `${reached.map((p) => p.declared).join(", ")}`
      : wrong.map((p) => `row declares ${p.declared} but edited ${p.received}`).join("; "));
});

// ───────────────────────────────────────────────────────────────────
// EVERY MENU ROW REACHES ITS OWN ACTION
// ───────────────────────────────────────────────────────────────────
//
// `001` owns menu language and its five-dimension row maps none. Everything this file measures about
// the column menu is SHAPE — one left edge, one row height, a chevron where a submenu opens, a
// hairline that starts at the label. All of it survives a menu whose every row calls the same
// action, or the wrong one.
//
// The add-view menu had exactly that gap and it took a driven press to see it. This is the same
// question asked of the surface `001` actually owns: press every row of a real `ColumnMenu` and read
// which action each one reached.
//
// PRESSING BY LABEL, NOT BY INDEX. The menu's contents depend on the column's type, so a positional
// assertion would encode today's ordering and fail the next time a row is inserted. Each row is
// identified by its own label, and the pairing is label → action name.

const menuOutcomeResults = [];

await section("every menu row reaches its own action", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const { ColumnMenu } = globalThis.__place;
    const host = document.querySelector(".note-database-container");
    const col = { key: "cost", label: "Cost", type: "number" };

    const calls = [];
    // Every action records its own name and the column it was handed. A menu wired to one action
    // shows up as one name repeated; a menu wired to the wrong COLUMN shows up in the second field.
    // Every member of `ColumnMenuActions`, read off the interface. A guessed list is why the first
    // run reported `Sort by "Cost" → (nothing)`: the row calls `sortByColumn`, which was not in the
    // guess, so the stub was undefined and the press reached nobody. That read as a dead row in a
    // shipped menu, and it was a hole in the harness.
    const names = [
      "editColumn", "editFormula", "editRelationRollup", "editStatusOptions", "showOptionsEditor",
      "changeColumnType", "insertColumn", "duplicateColumn", "moveColumn", "hideColumn",
      "toggleColumnWrap", "setTextRenderMode", "setTextLinkScheme", "setNumberDisplayStyle",
      "updateNumberDisplayConfig", "sortByColumn", "sortColumnDirection", "filterByColumn",
      "getColumnSortDirection", "clearColumnSort", "openColumnWidthPanel", "autoFitColumn",
      "autoFitAllColumns", "deleteColumn",
    ];
    // Actions that take no column. Demanding one from these is demanding the wrong thing: the first
    // run reported `Auto fit all visible columns → autoFitAllColumns handed undefined` as a defect,
    // and it is the correct call for an action whose whole point is that it is not per-column.
    const COLUMNLESS = new Set(["autoFitAllColumns"]);
    const actions = {};
    for (const name of names) {
      actions[name] = (first) => calls.push({ action: name, key: first?.key ?? String(first) });
    }

    const pressRow = (label) => {
      const anchor = host.createDiv({ cls: "anchor" });
      new ColumnMenu(actions).show(
        new MouseEvent("click", { clientX: 300, clientY: 200 }), col, anchor, {},
      );
      const menu = document.querySelector(".db-menu") ?? document.querySelector(".menu");
      const rows = menu ? [...menu.querySelectorAll(".db-menu-item")] : [];
      const target = rows.find(
        (r) => (r.querySelector(".db-menu-item-label")?.textContent || "").trim() === label,
      );
      const before = calls.length;
      target?.click();
      const got = calls.slice(before)[0] ?? null;
      menu?.remove();
      anchor.remove();
      document.querySelectorAll(".db-mobile-sheet-scrim").forEach((el) => el.remove());
      return { label, action: got?.action ?? "(nothing)", key: got?.key ?? "(none)", found: Boolean(target) };
    };

    // Read the labels once from a real menu, then press each on its own freshly opened one —
    // pressing a row closes the menu, so one open cannot reach the second row.
    const anchor = host.createDiv({ cls: "anchor" });
    new ColumnMenu(actions).show(new MouseEvent("click", { clientX: 300, clientY: 200 }), col, anchor, {});
    const first = document.querySelector(".db-menu") ?? document.querySelector(".menu");
    const labels = first
      ? [...first.querySelectorAll(".db-menu-item")]
        .filter((r) => !r.querySelector(".db-menu-item-chevron"))
        .map((r) => (r.querySelector(".db-menu-item-label")?.textContent || "").trim())
        .filter(Boolean)
      : [];
    first?.remove();
    anchor.remove();
    document.querySelectorAll(".db-mobile-sheet-scrim").forEach((el) => el.remove());

    const pressed = labels.map(pressRow);
    return {
      labels,
      pressed,
      reached: pressed.filter((p) => p.action !== "(nothing)"),
      distinct: [...new Set(pressed.filter((p) => p.action !== "(nothing)").map((p) => p.action))].length,
      columnless: [...COLUMNLESS],
      wrongColumn: pressed.filter(
        (p) => p.action !== "(nothing)" && !COLUMNLESS.has(p.action) && p.key !== "cost",
      ),
    };
  });

  const record = (name, pass, detail) => menuOutcomeResults.push({ name, pass, detail });
  const m = measured;

  record("the column menu offers several action rows to press",
    m.labels.length > 3,
    `${m.labels.length} non-submenu row(s): ${m.labels.join(", ") || "none"}. A menu with one row `
      + `cannot show every row calling the same action`);

  record("every action row reached an action",
    m.reached.length === m.pressed.length && m.pressed.length > 0,
    `${m.reached.length} of ${m.pressed.length} rows reached one: `
      + `${m.pressed.map((p) => `${p.label} → ${p.action}`).join("; ")}. Everything else this file `
      + `measures about this menu is shape, and shape survives a row wired to nothing`);

  // SHARING AN ACTION IS ALLOWED IN PAIRS, AND ONLY IN PAIRS.
  //
  // "not all the same action" is too weak — rewiring one row to a neighbour's action leaves the
  // count barely moved and the check green. The menu's real structure is 16 rows over 13 actions,
  // and the three that share are the ones that legitimately do: insert left/right, move up/down,
  // sort ascending/descending. Each is one action taking a direction argument.
  //
  // So the assertion is that every action reached by more than one row is one of those three. A row
  // rewired to any other row's action produces a fourth sharing group and fails, whatever the
  // distinct count happens to be.
  const byAction = new Map();
  for (const p of m.reached) {
    if (!byAction.has(p.action)) byAction.set(p.action, []);
    byAction.get(p.action).push(p.label);
  }
  const shared = [...byAction.entries()].filter(([, labels]) => labels.length > 1);
  const ALLOWED_PAIRS = new Set(["insertColumn", "moveColumn", "sortColumnDirection"]);
  const unexpected = shared.filter(([action]) => !ALLOWED_PAIRS.has(action));

  record("only the direction pairs share an action, and nothing else does",
    m.reached.length > 3 && unexpected.length === 0,
    `${m.reached.length} rows over ${m.distinct} actions. Sharing: `
      + `${shared.map(([a, l]) => `${a} ← ${l.join(" + ")}`).join("; ") || "none"}. The three that `
      + `may share are one action taking a direction — insert left/right, move up/down, sort `
      + `asc/desc. Any fourth sharing group is a row wired to its neighbour's action, which "not `
      + `all the same" would miss because the count barely moves`);

  record("every row that names a column names the one the menu was opened on",
    m.wrongColumn.length === 0,
    m.wrongColumn.length === 0
      ? `every per-column action received "cost", the column the menu was opened on. `
        + `${m.columnless.join(", ")} is excluded because it takes no column — demanding one from `
        + `an action whose whole point is that it is not per-column is demanding the wrong thing, `
        + `and the first version of this row reported exactly that as a defect`
      : m.wrongColumn.map((p) => `${p.label} → ${p.action} handed ${p.key}`).join("; "));
});

// ───────────────────────────────────────────────────────────────────
// A PRESS ON THE BACKDROP DISMISSES THE SHEET UNDER IT
// ───────────────────────────────────────────────────────────────────
//
// `003` owns sheet presentation and its five-dimension row maps none. Everything measured about the
// backdrop here is PRESENCE and POINTER POLICY: that it arrives with the sheet, that it leaves with
// it, that its `pointer-events` is modal by default and `none` under the opt-out, that a press at a
// cell centre resolves to it rather than to the cell.
//
// All of that establishes the backdrop can RECEIVE the press. Nothing established that receiving it
// does anything. A backdrop that takes every tap and dismisses nothing is the freeze this program
// opened for — the surface is dimmed, the taps are swallowed, and the app looks hung.
//
// So the press is driven where a thumb would put it — the backdrop, well away from the sheet — and
// the outcome is read. The stacked case is the one worth having: with two sheets open, a press must
// take the TOP one and leave the one beneath, which is what an overlay stack is for.

const backdropOutcomeResults = [];

await section("a press on the backdrop dismisses the sheet under it", async () => {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "reduce",
  });
  await page.setContent(page_html.replace("<body>", phoneBody));
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(async () => {
    const { createOwnedMenu } = globalThis.__place;

    const openSheet = (label) => {
      const menu = createOwnedMenu(document);
      for (let i = 0; i < 5; i += 1) menu.addRow({ icon: "pencil", label: `${label} ${i}` });
      menu.showAt({ x: 200, y: 200 });
      return menu;
    };
    const settle = () => new Promise((r) => setTimeout(r, 4));

    // A point on the backdrop, above the sheet's own top edge — where a thumb reaching past the
    // surface actually lands. Pressing the backdrop's centre would land ON the sheet, which is a
    // different gesture entirely and would report the wrong thing.
    const pressBackdrop = (panel) => {
      const box = panel.getBoundingClientRect();
      const x = Math.round(window.innerWidth / 2);
      const y = Math.max(4, Math.round(box.top / 2));
      const hit = document.elementFromPoint(x, y);
      const target = hit ?? document.body;
      for (const type of ["pointerdown", "mousedown", "pointerup", "click"]) {
        target.dispatchEvent(new (type.startsWith("pointer") ? PointerEvent : MouseEvent)(type, {
          bubbles: true, cancelable: true, clientX: x, clientY: y,
          ...(type.startsWith("pointer") ? { pointerId: 11, isPrimary: true, pointerType: "touch" } : {}),
        }));
      }
      return { x, y, landedOn: target.className || target.tagName.toLowerCase() };
    };

    // 1. One sheet: the press must dismiss it and take the backdrop with it.
    const only = openSheet("Row");
    await settle();
    const scrimBefore = Boolean(document.querySelector(".db-mobile-sheet-scrim"));
    const where = pressBackdrop(only.el);
    await settle();
    const singleClosed = !only.el.isConnected;
    const scrimAfter = Boolean(document.querySelector(".db-mobile-sheet-scrim"));
    if (!singleClosed) only.close();
    document.querySelectorAll(".db-mobile-sheet-scrim").forEach((el) => el.remove());

    // 2. Two sheets, counting the document handlers each one registers.
    let handlers = 0;
    const realAdd = document.addEventListener.bind(document);
    const realRemove = document.removeEventListener.bind(document);
    document.addEventListener = (type, fn, opts) => {
      if (type === "pointerdown") handlers += 1;
      return realAdd(type, fn, opts);
    };
    document.removeEventListener = (type, fn, opts) => {
      if (type === "pointerdown") handlers -= 1;
      return realRemove(type, fn, opts);
    };
    const under = openSheet("Under");
    await settle();
    const handlersOneMenu = handlers;
    const over = openSheet("Over");
    await settle();
    const handlersTwoMenus = handlers;
    const bothOpen = under.el.isConnected && over.el.isConnected;
    pressBackdrop(over.el);
    await settle();
    const topClosed = !over.el.isConnected;
    const bottomSurvived = under.el.isConnected;
    under.close();
    over.close();
    document.querySelectorAll(".db-mobile-sheet-scrim").forEach((el) => el.remove());

    document.addEventListener = realAdd;
    document.removeEventListener = realRemove;
    return {
      scrimBefore, where, singleClosed, scrimAfter, bothOpen, topClosed, bottomSurvived,
      handlersOneMenu, handlersTwoMenus,
    };
  });

  const record = (name, pass, detail) => backdropOutcomeResults.push({ name, pass, detail });
  const m = measured;

  record("the press landed on the backdrop, not on the sheet",
    m.scrimBefore && String(m.where.landedOn).includes("scrim"),
    `a backdrop was present=${m.scrimBefore}; the press at [${m.where.x},${m.where.y}] landed on `
      + `"${m.where.landedOn}". The point is above the sheet's top edge, where a thumb reaching past `
      + `the surface goes — a press at the backdrop's own centre lands ON the sheet and would `
      + `report a different gesture entirely`);

  record("a press on the backdrop dismisses the sheet and takes the backdrop with it",
    m.singleClosed && !m.scrimAfter,
    `sheet still mounted after the press=${!m.singleClosed}, backdrop still present=${m.scrimAfter}. `
      + `Everything else measured about this backdrop is presence and pointer policy — that it can `
      + `RECEIVE the press. A backdrop that receives every tap and dismisses nothing is the freeze `
      + `this program opened for`);

  // WHAT THE STACKED CASE ACTUALLY SHOWS, AND WHY IT IS NOT ASSERTED AS A DEFECT.
  //
  // Measured: with two owned menus open, one backdrop press closes BOTH — `top dismissed=true,
  // beneath survived=false`. That follows from the factory's design rather than contradicting it.
  // `createOwnedMenu` adds its own capturing `pointerdown` on the document per menu and treats any
  // press outside ITSELF as a dismissal, and its comment says so: "the sheet's backdrop is a
  // rectangle, not a handler ... an outside press like any other". Two menus, two handlers, one
  // press, both dismissed.
  //
  // Whether that is wrong depends on whether the plugin ever stacks two independent owned menus,
  // which is NOT established here — a submenu portals a `db-column-menu-subpopover` rather than
  // opening a second owned menu. So what is asserted is the mechanism, which is decidable: one
  // document handler per open menu. The consequence is recorded in `003`'s packet as a question
  // with its number, rather than as a defect nobody has shown a user can reach.
  record("each open menu owns exactly one document-level dismissal handler",
    m.handlersOneMenu === 1 && m.handlersTwoMenus === 2,
    `${m.handlersOneMenu} capturing pointerdown handler(s) with one menu open, `
      + `${m.handlersTwoMenus} with two. That is the factory's stated design — a press outside a `
      + `menu arrives at that menu's own handler — and it is why one backdrop press dismissed both `
      + `(top=${m.topClosed}, beneath survived=${m.bottomSurvived}). Whether two independent owned `
      + `menus ever stack in the shipped app is a separate question, recorded in \`003\` rather `
      + `than assumed here`);
});

// ───────────────────────────────────────────────────────────────────
// SIXTEEN NAMED COLOURS, SIXTEEN DIFFERENT COLOURS
// ───────────────────────────────────────────────────────────────────
//
// A capture reviewer reported that `gray` and `slate` render identically, and that `brown` and
// `orange` collapse onto one swatch in the dark theme. Both are true at the token level — but a
// reviewer's reading is a hypothesis, and the mitigations matter: these are `color-mix` values that
// resolve differently per theme, and the swatch paints the FOREGROUND token rather than the
// background, so "the chips look the same" and "the swatches look the same" are different claims
// about different properties.
//
// So every entry is rendered in both themes and its computed pair is read. A palette that offers a
// name the reader cannot distinguish from another cannot express the choice it is offering — which
// is a defect in the picker, not a matter of taste.
//
// BOTH PROPERTIES, BOTH THEMES. Two entries sharing a background while differing in foreground are
// still distinguishable; two sharing both are not. The signature is the pair, and the run is per
// theme because a collision can exist in one and not the other.

const paletteResults = [];

await section("sixteen named colours are sixteen different colours", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const NAMES = [
      "blue", "brown", "cyan", "gray", "green", "indigo", "lime", "orange",
      "pink", "purple", "red", "rose", "slate", "teal", "violet", "yellow",
    ];
    const host = document.querySelector(".note-database-container");

    const readTheme = (themeClass) => {
      document.body.className = themeClass;
      const probe = host.createDiv({ cls: "db-palette-probe" });
      const entries = NAMES.map((name) => {
        const chip = probe.createSpan({ cls: `db-status-chip db-option-color-${name}` });
        const style = getComputedStyle(chip);
        return {
          name,
          bg: style.backgroundColor,
          fg: style.color,
          // The swatch in the pickers paints the FOREGROUND token, so it is read as its own
          // property — a pair can differ in chip fill and still show two identical swatches.
          swatch: style.backgroundColor,
        };
      });
      // Swatches are a separate element class; read them the same way.
      const swatches = NAMES.map((name) => {
        const sw = probe.createSpan({ cls: `db-color-picker-swatch db-option-color-${name}` });
        return { name, fill: getComputedStyle(sw).backgroundColor };
      });
      probe.remove();
      return { entries, swatches };
    };

    const dark = readTheme("theme-dark");
    const light = readTheme("theme-light");
    document.body.className = "";

    // The picker's own wrap. Sixteen swatches in a popover that fits five per row is three full
    // rows and an orphan, which reads as an accident rather than a layout — and the leftover track
    // pushes the block off-centre in its own frame. Measured by row, from the rendered boxes.
    const popup = document.body.createDiv({ cls: "db-color-picker-popup db-surface" });
    for (const name of NAMES) popup.createSpan({ cls: `db-color-picker-swatch db-option-color-${name}` });
    const tops = [...popup.querySelectorAll(".db-color-picker-swatch")]
      .map((el) => Math.round(el.getBoundingClientRect().top));
    const rowCounts = [...tops.reduce((map, top) => map.set(top, (map.get(top) || 0) + 1), new Map()).values()];
    const box = popup.getBoundingClientRect();
    const last = popup.lastElementChild.getBoundingClientRect();
    const style = getComputedStyle(popup);
    const pad = parseFloat(style.paddingRight) || 0;
    const slack = Math.round(box.right - pad - last.right);
    popup.remove();

    const collisions = (rows, key) => {
      const seen = new Map();
      const out = [];
      for (const row of rows) {
        const sig = key(row);
        if (seen.has(sig)) out.push(`${seen.get(sig)} ≡ ${row.name} (${sig})`);
        else seen.set(sig, row.name);
      }
      return out;
    };

    return {
      names: NAMES.length,
      darkChips: collisions(dark.entries, (r) => `${r.bg} / ${r.fg}`),
      lightChips: collisions(light.entries, (r) => `${r.bg} / ${r.fg}`),
      darkSwatches: collisions(dark.swatches, (r) => r.fill),
      lightSwatches: collisions(light.swatches, (r) => r.fill),
      sampleDark: dark.entries.slice(0, 2).map((r) => `${r.name}=${r.bg}/${r.fg}`).join(", "),
      rowCounts, slack,
    };
  });

  const record = (name, pass, detail) => paletteResults.push({ name, pass, detail });
  const m = measured;

  record("the palette rendered something to compare",
    m.names === 16 && m.sampleDark.length > 0,
    `${m.names} named entries, sample: ${m.sampleDark}. A probe that resolved every entry to the `
      + `same empty value would report sixteen collisions, and one that resolved none would report `
      + `zero — so the sample is printed rather than assumed`);

  record("the picker's swatches fill every row they start",
    m.rowCounts.length > 1 && new Set(m.rowCounts).size === 1,
    `swatches per row: [${m.rowCounts.join(", ")}], and the last one ends ${m.slack}px short of the `
      + `popover's content edge. Sixteen wrapping five to a row is three full rows and an orphan, `
      + `which reads as an accident rather than a layout and leaves the block off-centre in its own `
      + `frame. Four per row is the only count that divides sixteen evenly`);

  for (const [where, found] of [
    ["chip in dark", m.darkChips], ["chip in light", m.lightChips],
    ["swatch in dark", m.darkSwatches], ["swatch in light", m.lightSwatches],
  ]) {
    record(`no two palette entries share a ${where}`,
      found.length === 0,
      found.length === 0
        ? `all 16 distinct`
        : `${found.length} collision(s): ${found.join("; ")}. A name the reader cannot tell from `
          + `another cannot express the choice the picker is offering`);
  }
});

// ───────────────────────────────────────────────────────────────────
// THE SELECTED DAY IS THE ONE THING THE PICKER EXISTS TO SHOW
// ───────────────────────────────────────────────────────────────────
//
// A capture reviewer reported the selected day at 1.10:1 against its own panel. Measured, the fill
// is `rgba(255, 255, 255, 0.055)` in dark and `rgba(0, 0, 0, 0.043)` in light — a 4 to 5 per cent
// wash, and it is `--background-modifier-hover`, the HOVER token. On the view-cell rule `:hover` and
// `.is-selected` are literally the same declaration.
//
// So the three states a date picker has to keep apart — plain, selected, today — differ by one
// barely-visible property each, and the one the picker exists to communicate is the faintest.
//
// CONTRAST AGAINST THE PANEL, NOT AGAINST NOTHING. A fill is only visible against what it sits on,
// so the ratio is computed against the popover's own background rather than against white. The floor
// is WCAG 1.4.11's 3:1 for a non-text UI indicator, which is the standard that actually governs
// "you can see which day is selected".

const dayStateResults = [];

await section("the selected day is the one thing the picker exists to show", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  // THE HOST'S OWN TOKENS, because this section reads colours rather than boxes. Without
  // `theme.css` every `var(--background-modifier-hover)` resolves to nothing and all three states
  // read `rgba(0, 0, 0, 0)` — which the first run reported as "three identical states", a product
  // verdict drawn from a missing stylesheet. The premise row below is what turns that into a
  // refusal instead of a finding.
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addStyleTag({ content: readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8") });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const host = document.querySelector(".note-database-container");

    const parse = (value) => {
      const m = String(value).match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const parts = m[1].split(",").map((n) => parseFloat(n));
      return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
    };
    const over = (top, bottom) => ({
      r: top.r * top.a + bottom.r * (1 - top.a),
      g: top.g * top.a + bottom.g * (1 - top.a),
      b: top.b * top.a + bottom.b * (1 - top.a),
      a: 1,
    });
    const lum = (c) => {
      const f = (v) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const ratio = (a, b) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };

    const read = (themeClass) => {
      document.body.className = themeClass;
      const popover = host.createDiv({ cls: "db-calendar-mini-popover db-surface" });
      const grid = popover.createDiv({ cls: "db-calendar-mini-grid" });
      const make = (cls) => {
        const day = grid.createEl("button", { cls: `db-calendar-mini-day ${cls}`.trim() });
        const num = day.createSpan({ cls: "db-calendar-mini-day-num", text: "9" });
        const style = getComputedStyle(num);
        return {
          bg: style.backgroundColor, color: style.color,
          weight: style.fontWeight, outline: style.outlineWidth, border: style.borderWidth,
        };
      };
      const plain = make("");
      const selected = make("is-selected");
      const today = make("is-today");
      // The COMBINATION, which is every reader's view whenever today falls in the selected week.
      // Building the three states separately cannot see it: `is-today` and `is-selected` carry
      // equal specificity, so source order decided the colour, and an accent numeral landed on the
      // accent fill — the day rendered as an empty pill. That was found by opening the capture
      // after this section was already green.
      const both = make("is-today is-selected");
      const panel = parse(getComputedStyle(popover).backgroundColor);
      const selFill = parse(selected.bg);
      popover.remove();
      const sig = (s) => `${s.bg}|${s.color}|${s.weight}|${s.outline}|${s.border}`;
      const bothFill = parse(both.bg);
      const bothText = parse(both.color);
      return {
        theme: themeClass,
        signatures: { plain: sig(plain), selected: sig(selected), today: sig(today), both: sig(both) },
        distinct: new Set([sig(plain), sig(selected), sig(today)]).size,
        selectedFill: selected.bg,
        contrast: selFill && panel ? Number(ratio(over(selFill, panel), panel).toFixed(2)) : null,
        bothReadable: bothFill && bothText
          ? Number(ratio(over(bothText, over(bothFill, panel)), over(bothFill, panel)).toFixed(2))
          : null,
        bothDesc: `${both.color} on ${both.bg}`,
      };
    };

    const dark = read("theme-dark");
    const light = read("theme-light");
    document.body.className = "";
    return { dark, light };
  });

  const record = (name, pass, detail) => dayStateResults.push({ name, pass, detail });

  for (const arm of [measured.dark, measured.light]) {
    // A page whose tokens did not resolve paints every state the same and reads as a defect. It is
    // a refusal, not a finding, and it is separated here because the first run of this section made
    // exactly that mistake.
    record(`the ${arm.theme} page resolved its host tokens`,
      arm.signatures.plain !== arm.signatures.selected || arm.contrast !== 1,
      `plain=${arm.signatures.plain}. All three states identical AND a 1:1 fill means no stylesheet `
        + `supplied \`--background-modifier-hover\` — the states below would then be compared on a `
        + `page that painted none of them`);

    record(`plain, selected and today are three different things in ${arm.theme}`,
      arm.distinct === 3,
      `${arm.distinct} distinct signature(s) from 3 states. plain=${arm.signatures.plain} · `
        + `selected=${arm.signatures.selected} · today=${arm.signatures.today}`);

    // A day that is both today and selected is not a corner case — it is what every reader sees
    // whenever today falls inside the selected week.
    // THE FLOOR IS 3, AND THE REASON IS OWNERSHIP RATHER THAN LENIENCE.
    //
    // The pair here is `--text-on-accent` on `--interactive-accent`, and BOTH are the host's —
    // Obsidian's, and re-themeable by the reader. In the default dark theme that pair measures
    // 4.04:1, under AA's 4.5 for text. The plugin cannot raise it without overriding an accent the
    // user chose, which is a worse outcome than the shortfall.
    //
    // What this row exists to catch is the numeral DISAPPEARING — accent on accent, 1:1 — which is
    // what the losing source order produced and what the capture showed as an empty pill. A 3:1
    // floor catches that with room to spare and does not pretend the plugin owns a token it does
    // not. The 4.04 is recorded here so the shortfall is visible rather than silently accepted.
    record(`a day that is both today and selected still shows its number in ${arm.theme}`,
      arm.bothReadable !== null && arm.bothReadable >= 3,
      `the numeral reads ${arm.bothDesc}, at ${arm.bothReadable}:1 against its own fill, against a `
        + `3:1 floor. Equal specificity between the two state rules means source order picks the `
        + `colour, and the losing order paints the accent numeral onto the accent fill — an empty `
        + `pill where the date should be, which is what the capture showed. The floor is 3 rather `
        + `than AA's 4.5 because both tokens are the HOST's and re-themeable: the default dark pair `
        + `measures 4.04 and the plugin cannot raise it without overriding the reader's own accent`);

    record(`the selected day is visible against its own panel in ${arm.theme}`,
      arm.contrast !== null && arm.contrast >= 3,
      `the selected fill ${arm.selectedFill} sits at ${arm.contrast}:1 against the popover it is `
        + `drawn on, against a 3:1 floor for a non-text indicator. Measured against the PANEL rather `
        + `than against white, because a fill is only visible against what it sits on — and the `
        + `fill was the hover tint at 1.17:1 in dark and 1.1:1 in light before this row existed, `
        + `which is a state the DOM distinguishes and the eye does not`);
  }
});

// ───────────────────────────────────────────────────────────────────
// NOTHING TRUNCATES WHILE ITS NEIGHBOUR HAS ROOM TO SPARE
// ───────────────────────────────────────────────────────────────────
//
// The last cluster off the capture review. Measured on the sort rule row: the direction chip was
// `flex: 0 0 92px`, which left its value box 52px while "Descending" needs 67 — and the field chip
// beside it sat at 422px holding "Cost", which needs 26. Nearly 400px of slack next to a 15px
// shortfall, and the shortfall was in the one chip that could not grow.
//
// THE ROW IS `flex-wrap: wrap` AND WAS EXACTLY FULL, which is why the obvious fix is wrong.
// Sizing the direction chip to its content (`flex: 0 0 auto`) put both onto their own lines — a
// worse outcome than the truncation. A wider FIXED basis does not, because the field chip is
// `flex: 1 1 0` and absorbs the difference by itself.
//
// So the check reads both halves: the value fits, AND the row is still one line. A `min-width: 0`
// was added to the field chip alongside the fix on the theory that it was needed for that shrink,
// then removed when a control showed the row stays on one line without it. The theory was written
// before it was tested and it was wrong; the one-line assertion below is what would have caught it
// either way.

const rowSlackResults = [];

await section("nothing truncates while its neighbour has room to spare", async () => {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: "reduce" });
  await page.setContent(page_html);
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addStyleTag({ content: readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8") });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(() => {
    const host = document.querySelector(".note-database-container");
    const chip = (cls, value) => `
      <button type="button" class="db-dropdown-field db-panel-dropdown ${cls}">
        <span class="db-dropdown-field-icon"></span>
        <div class="db-dropdown-field-text"><span class="db-dropdown-field-value">${value}</span></div>
        <span class="db-dropdown-field-chevron"></span>
      </button>`;

    // The longest value each chip can hold, which is what a fixed basis has to be sized against.
    const read = (direction) => {
      const wrap = host.createDiv({ cls: "db-active-rule-popover db-filter-panel db-sort-panel is-sort" });
      wrap.innerHTML = `<div class="db-panel-row db-sort-rule-row db-active-rule-editor-row">`
        + chip("db-sort-field-dropdown", "Cost")
        + chip("db-sort-direction-dropdown", direction)
        + `</div>`;
      const row = wrap.querySelector(".db-panel-row");
      const kids = [...row.children];
      const tops = new Set(kids.map((el) => Math.round(el.getBoundingClientRect().top)));
      const value = kids[1].querySelector(".db-dropdown-field-value");
      const result = {
        direction,
        lines: tops.size,
        clipped: value.scrollWidth > value.clientWidth + 1,
        valueW: Math.round(value.getBoundingClientRect().width),
        wants: value.scrollWidth,
        fieldW: Math.round(kids[0].getBoundingClientRect().width),
        dirW: Math.round(kids[1].getBoundingClientRect().width),
      };
      wrap.remove();
      return result;
    };

    return { descending: read("Descending"), ascending: read("Ascending") };
  });

  const record = (name, pass, detail) => rowSlackResults.push({ name, pass, detail });

  for (const arm of [measured.descending, measured.ascending]) {
    record(`the sort row shows "${arm.direction}" without clipping it`,
      !arm.clipped,
      `the value box is ${arm.valueW}px and the text needs ${arm.wants}px; the field chip beside it `
        + `is ${arm.fieldW}px holding "Cost". A fixed basis has to be sized against the LONGEST `
        + `value the chip can hold, and "${arm.direction}" is that test`);

    record(`the sort row stays on one line for "${arm.direction}"`,
      arm.lines === 1,
      `${arm.lines} line(s): field ${arm.fieldW}px + direction ${arm.dirW}px. The row is `
        + `flex-wrap: wrap and was exactly full, so sizing the direction chip to its CONTENT put `
        + `both on their own line. A wider fixed basis does not — the field chip absorbs it, 422 `
        + `to 388 — and this row is asserted beside the clipping because that distinction is the `
        + `whole of the fix`);
  }
});


// ───────────────────────────────────────────────────────────────────
// A RECORD SHEET TALLER THAN ITS CAP KEEPS THE HANDLE IT IS DRAGGED BY
// ───────────────────────────────────────────────────────────────────
//
// Reported from a phone as the sheet "not fitting". Measured here on the shipped path — eighteen
// properties and a long note body at 390x844 — the sheet does reach its cap and it does scroll, so
// the report's own words describe the symptom rather than the mechanism. What it loses is its
// chrome: the grab bar and the whole header were ordinary children of the scrolling panel, so
// reading to the end of a long record carried the bar, the close button and the open-note button
// off the top of the screen. The sheet was then dismissible only by the backdrop, and the drag the
// bar advertises had nothing left to aim at.
//
// So the requirement has two halves and they are asserted together: the content scrolls to its end,
// AND the handle is still where a thumb can reach it once it has. Either half alone passes on the
// defect — scrolling was never broken, and a sheet short enough not to scroll keeps its handle for
// the wrong reason. The premise is asserted too, because a check whose content fits inside the cap
// measures nothing at all and would go quiet the day a fixture shrinks.
//
// The body is mounted through the shipped region rather than through `openRecordDetailPanel`'s own
// body path: that path builds an Obsidian `Component` and renders through `MarkdownRenderer`, both
// of which reach the vault and are deliberately absent here. Only the markdown renderer is stood
// in for; the region, its classes and its `overflow: hidden` are the ones that ship.

const tallSheetResults = [];

await section("a record sheet taller than its cap keeps its handle", async () => {
  const record = (name, pass, detail) => tallSheetResults.push({ name, pass, detail });
  const page = await browser.newPage({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  await page.setContent(page_html.replace("<body>", phoneBody));
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(async () => {
    const { openRecordDetailPanel, mountNoteBodyRegion } = globalThis.__tall;
    const host = document.querySelector(".note-database-container");
    // The operator's own record, extended past the point where a sheet at its cap can hold it.
    const PROPS = ["Income", "Expenses", "Subscriptions", "Remaining", "Sales", "Saved",
      "Invested", "Withdrawn", "Added to", "Balance", "Stocks", "Year", "Quarter", "Owner",
      "Status", "Category", "Reviewed", "Notes"];
    const frontmatter = {};
    for (const key of PROPS) frontmatter[key] = `${key} value`;
    openRecordDetailPanel({
      anchorEl: document.getElementById("anchor"),
      host,
      row: { file: { path: "33.md", basename: "33", name: "33.md" }, frontmatter, computed: {} },
      columns: [
        { key: "file.name", label: "Name", type: "text" },
        ...PROPS.map((key) => ({ key, label: key, type: "text" })),
      ],
      config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
      app: {},
      actions: { editCell: () => {}, openRow: () => {}, isReadOnly: false },
    });
    const panel = document.querySelector(".db-record-detail-panel");
    mountNoteBodyRegion({
      parent: panel.querySelector(".db-record-detail-scroll") ?? panel,
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(40),
      placeholder: "Empty",
      renderMarkdown: (target, markdown) => { target.textContent = markdown; },
      onCommit: () => {},
    });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const sheetRect = panel.getBoundingClientRect();
    const cap = window.innerHeight * 0.9;
    const handle = panel.querySelector(".db-mobile-bottom-sheet-handle");
    const body = panel.querySelector(".db-record-detail-body");

    // Whatever inside the sheet actually owns the scroll — the panel itself before the fix, an
    // inner region after it. Naming the element would be asserting the mechanism rather than the
    // outcome, and the outcome is what the operator sees.
    const scroller = [panel, ...panel.querySelectorAll("*")]
      .find((el) => el.scrollHeight > el.clientHeight + 1
        && /auto|scroll/.test(getComputedStyle(el).overflowY));
    const overflow = scroller ? scroller.scrollHeight - scroller.clientHeight : 0;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const handleBox = handle.getBoundingClientRect();
    const hit = document.elementFromPoint(
      Math.round(handleBox.left + handleBox.width / 2),
      Math.round(handleBox.top + handleBox.height / 2),
    );
    const bodyBox = body.getBoundingClientRect();
    return {
      sheetHeight: Math.round(sheetRect.height),
      cap: Math.round(cap),
      fields: panel.querySelectorAll(".db-record-detail-field").length,
      scrollerClass: scroller ? (scroller.className.split(" ")[0] || scroller.tagName) : "none",
      overflow: Math.round(overflow),
      scrolledTo: scroller ? Math.round(scroller.scrollTop) : 0,
      bodyEndReached: bodyBox.bottom <= sheetRect.bottom + 1,
      handleOffsetFromSheetTop: Math.round(handleBox.top - sheetRect.top),
      handleReachable: Boolean(hit) && (hit === handle || handle.contains(hit)),
    };
  });
  await page.close();

  record("a record sheet with more content than its cap scrolls inside itself and keeps its handle at the top",
    measured.overflow > 1
      && measured.sheetHeight <= measured.cap + 2
      && measured.bodyEndReached
      && measured.handleReachable
      && measured.handleOffsetFromSheetTop >= -1
      && measured.handleOffsetFromSheetTop <= 40,
    `${measured.fields} properties and a note body make the sheet ${measured.sheetHeight}px against a `
      + `${measured.cap}px cap, with ${measured.overflow}px more than fits; "${measured.scrollerClass}" `
      + `owns the scroll and reached ${measured.scrolledTo}px, body end visible=${measured.bodyEndReached}. `
      + `Scrolled to the end the handle sits ${measured.handleOffsetFromSheetTop}px from the sheet's top `
      + `edge and a press there reaches it=${measured.handleReachable}. Before the chrome was lifted out `
      + `of the scroll region the panel itself scrolled, and at its end the handle measured -1148px from `
      + `the sheet's top with reachable=false — off the screen entirely, along with the close button, `
      + `leaving the backdrop as the only way out of a long record. Both halves are asserted because `
      + `either alone passes on that: scrolling was never broken, and a sheet short enough not to `
      + `scroll keeps its handle for the wrong reason`);
});

// ───────────────────────────────────────────────────────────────────
// ONE THING OWNS THE PHONE'S BOTTOM EDGE AT A TIME
// ───────────────────────────────────────────────────────────────────
//
// Three surfaces dock to the bottom of a phone screen and none of them knew about the others. The
// operator's screenshots show the collisions at once: the selection status bar still docked under an
// open view-switcher sheet, the inline cell editor landing on top of the bar and clipping its count
// chip, and the floating add control sitting behind both.
//
// They are one defect, not three. Each surface decided on its own that it belonged at the bottom, so
// whichever painted last won and nothing arbitrated. What is asserted here is the arbitration: while
// a sheet or a cell editor is open, the bar is not on screen; while the bar is on screen, the add
// control is not. The bar is the surface that yields, because a sheet and an editor are both the
// active task and the bar is a status readout of a selection that is not going anywhere.
//
// Geometry, not classes. A check that asserted the marker class would pass on a marker no rule
// reads, which is the same failure as asserting a portal instead of the floor the portal exists to
// reach. Intersection area is the question the screenshots ask.

const dockResults = [];

await section("one thing owns the phone's bottom edge", async () => {
  const record = (name, pass, detail) => dockResults.push({ name, pass, detail });
  const page = await browser.newPage({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  await page.setContent(page_html.replace("<body>", phoneBody));
  await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
  await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
  await page.addScriptTag({ content: positionerJs });

  const measured = await page.evaluate(async () => {
    const { DatabaseView, closeRecordDetailPanel, CellRenderer } = globalThis.__dock;
    const { openRecordDetailPanel } = globalThis.__tall;
    const settle = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const host = document.querySelector(".note-database-container");

    // The bar through the shipped view method. `Object.create` gives a real view without the
    // constructor's Obsidian leaf, so every field the method reads is written here.
    const addresses = [{ rowPath: "record.md", colKey: "amount" }];
    const view = Object.create(DatabaseView.prototype);
    view.containerEl_ = host;
    view.selectedRows = new Set();
    view.cellSelection = { anchor: addresses[0], focus: addresses[0] };
    view.selectionStatusBar = undefined;
    view.pendingCellFillDraft = null;
    view.showCellFillInput = false;
    view.historyStack = [];
    view.getSelectedCellAddresses = () => addresses;
    view.getConfig = () => ({ schema: { columns: [] } });
    DatabaseView.prototype.renderSelectionStatusBar.call(view);
    await settle();

    const bar = () => host.querySelector(".db-selection-status-bar");
    const box = (el) => {
      if (!el) return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
      const r = el.getBoundingClientRect();
      return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const onScreen = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
    };
    const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
      * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

    const restingBar = box(bar());

    // ── 1. a sheet is open ──
    openRecordDetailPanel({
      anchorEl: document.getElementById("anchor"),
      host,
      row: { file: { path: "33.md", basename: "33", name: "33.md" }, frontmatter: { income: 1 }, computed: {} },
      columns: [{ key: "file.name", label: "Name", type: "text" }, { key: "income", label: "Income", type: "number" }],
      config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
      app: {},
      actions: { editCell: () => {}, openRow: () => {}, isReadOnly: false },
    });
    await new Promise((resolve) => setTimeout(resolve, 450));
    await settle();
    const sheetOpen = {
      barOnScreen: onScreen(bar()),
      barBox: box(bar()),
      sheetBox: box(document.querySelector(".db-record-detail-panel")),
    };
    sheetOpen.overlapWithSheet = Math.round(overlap(sheetOpen.barBox, sheetOpen.sheetBox));
    closeRecordDetailPanel();
    await settle();
    const barBackAfterSheet = onScreen(bar());

    // ── 2. a cell editor is open ──
    document.documentElement.style.setProperty("--keyboard-height", "331px");
    window.dispatchEvent(new window.Event("resize"));
    await settle();
    const table = host.createDiv({ cls: "db-table-wrap" });
    const td = table.createDiv({ cls: "db-cell db-editable-cell db-numeric-value", text: "4975.32" });
    // Placed in the band the bar has just docked into, read off the bar rather than guessed.
    //
    // The editor is not lifted by the keyboard — it is clamped to bounds the navbar derives and
    // otherwise stays beside its own cell. So the collision is not two surfaces rising to meet each
    // other; it is a cell whose row happens to lie where the bar now sits, which is what the
    // operator's screenshot shows and what a fixed coordinate would only reproduce by luck. A cell
    // anywhere else keeps its editor nowhere near the bar and makes this check green on the defect.
    const barBand = box(bar());
    td.setCssProps({
      position: "fixed", left: "40px", top: `${Math.round(barBand.top + 4)}px`,
      width: "160px", height: "34px",
    });
    const cellRenderer = new CellRenderer({ openNote() {}, getRows: () => [] }, async () => {});
    cellRenderer.startEdit(td, { file: { path: "record.md", basename: "record" }, frontmatter: { amount: 4975.32 }, computed: {} },
      { key: "amount", label: "Amount", type: "number" });
    await settle();
    const editorEl = document.querySelector(".db-cell-line-edit-popover");
    const editing = {
      hasEditor: Boolean(editorEl),
      editorBox: box(editorEl),
      barOnScreen: onScreen(bar()),
      barBox: box(bar()),
    };
    editing.overlap = Math.round(overlap(editing.editorBox, editing.barBox));
    // Closed the way a person closes it. Removing the node by hand skips the renderer's own close,
    // which is what releases the editor's claim on the bottom edge — so the bar would stay hidden
    // into the next check and that check would pass for the wrong reason. It did, before this line.
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await settle();
    document.documentElement.style.removeProperty("--keyboard-height");
    window.dispatchEvent(new window.Event("resize"));
    await settle();

    // ── 3. the floating add control, while the bar is up ──
    //
    // Hand-built, because the shipped toolbar needs a live view to render at all. What the renderer
    // contributes to this geometry is exactly the class string below — `toolbar-renderer.ts` adds
    // `is-mobile-fab` on a touch device — and everything that decides where the control lands is in
    // the stylesheet, which is loaded here as it ships.
    const fab = host.createEl("button", { cls: "db-new-button db-new-button-primary is-mobile-fab" });
    fab.createSpan({ cls: "db-new-button-icon", text: "+" });
    await settle();
    const withBar = {
      barOnScreen: onScreen(bar()),
      fabOnScreen: onScreen(fab),
      fabBox: box(fab),
      barBox: box(bar()),
    };
    withBar.overlap = Math.round(overlap(withBar.fabBox, withBar.barBox));

    return { restingBar, sheetOpen, barBackAfterSheet, editing, withBar };
  });
  await page.close();

  record("the selection bar is off the screen while a bottom sheet is open",
    measured.restingBar.height > 0
      && !measured.sheetOpen.barOnScreen
      && measured.barBackAfterSheet,
    `at rest the bar measures ${Math.round(measured.restingBar.width)}x${Math.round(measured.restingBar.height)}px; `
      + `with a record sheet open it is on screen=${measured.sheetOpen.barOnScreen} `
      + `(box ${Math.round(measured.sheetOpen.barBox.width)}x${Math.round(measured.sheetOpen.barBox.height)}px, `
      + `overlapping the sheet by ${measured.sheetOpen.overlapWithSheet}px²), and it comes back when the `
      + `sheet closes=${measured.barBackAfterSheet}. Before the docking owner it stayed drawn under every `
      + `sheet — measured 358x98px sitting 35084px² inside the sheet's own rectangle, which is the `
      + `operator's view-switcher screenshot. The restoration is asserted beside the hiding because a `
      + `bar that never comes back is a worse defect than one that overlaps`);

  record("an open cell editor and the selection bar do not overlap",
    measured.editing.hasEditor && measured.editing.overlap === 0,
    `editor ${Math.round(measured.editing.editorBox.width)}x${Math.round(measured.editing.editorBox.height)}px `
      + `at y=${Math.round(measured.editing.editorBox.top)}..${Math.round(measured.editing.editorBox.bottom)}, `
      + `bar on screen=${measured.editing.barOnScreen} at `
      + `y=${Math.round(measured.editing.barBox.top)}..${Math.round(measured.editing.barBox.bottom)}; `
      + `they share ${measured.editing.overlap}px². The bar docks above a 331px keyboard and the editor `
      + `stays beside its own cell, so a row that lies in the bar's band puts one on top of the other — `
      + `7666px² of overlap before the editor became the docking owner, which is the capture where the `
      + `count chip reads "1 cells select" with the rest of it underneath. The editor is the active `
      + `task, so the bar is the one that yields`);

  record("the floating add control is off the screen while the selection bar is up",
    measured.withBar.barOnScreen && !measured.withBar.fabOnScreen,
    `with a selection live the bar is on screen=${measured.withBar.barOnScreen} and the add control is `
      + `on screen=${measured.withBar.fabOnScreen} `
      + `(${Math.round(measured.withBar.fabBox.width)}x${Math.round(measured.withBar.fabBox.height)}px), `
      + `sharing ${measured.withBar.overlap}px². Before the fix the 52px control sat at the same bottom `
      + `corner the bar reaches and measured 2704px² underneath it — the whole of it — at z-index 40 `
      + `against the bar's 100, visible as a half-covered circle in the operator's capture and reachable `
      + `only by the part of it the bar left uncovered`);
});


// ───────────────────────────────────────────────────────────────────
// A VIEW-SWITCHER ROW ON A PHONE CARRIES ONE TRAILING CONTROL
// ───────────────────────────────────────────────────────────────────
//
// The all-views sheet put five icon buttons on every row — rename, duplicate, change layout,
// delete, set icon. On a 390px screen that is a short title beside 220px of controls, so names
// truncate while most of the row is affordances for actions nobody opened the sheet to take. The
// operator's capture shows eight rows of it.
//
// The shape borrowed is the reference implementation's: one trailing overflow control per row, and
// the actions behind it. What differs is where they open — this codebase already presents an owned
// menu as a sheet on a phone, so the menu is the same object the rest of the plugin uses rather
// than a second popover written for this row.
//
// Three checks, because collapsing the row, keeping the desktop alone, and keeping every action
// reachable are different claims and only one of them is about geometry. A row reduced to a title
// with its actions dropped would pass the first on its own, and that is the likelier regression.

const viewRowResults = [];

await section("a view-switcher row on a phone carries one trailing control", async () => {
  const record = (name, pass, detail) => viewRowResults.push({ name, pass, detail });
  const build = async (phone) => {
    const page = await browser.newPage({
      reducedMotion: "reduce",
      ...(phone
        ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }
        : { viewport: VIEWPORT }),
    });
    await page.setContent(phone ? page_html.replace("<body>", phoneBody) : page_html);
    await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") + HOST_BARE_CONTROLS });
    await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
    await page.addScriptTag({ content: positionerJs });
    const out = await page.evaluate(async () => {
      const { ToolbarRenderer } = globalThis.__viewrow;
      const host = document.querySelector(".note-database-container");
      const anchor = host.createDiv({ cls: "anchor" });
      const renderer = new ToolbarRenderer();
      // The operator's own view list, including the name that truncated on the device.
      const db = {
        schema: { columns: [] },
        views: [
          { viewType: "table", name: "All" }, { viewType: "table", name: "2027" },
          { viewType: "table", name: "2026" }, { viewType: "table", name: "2025" },
          { viewType: "gallery", name: "Gallery view" }, { viewType: "list", name: "List view" },
          { viewType: "board", name: "Board view" }, { viewType: "calendar", name: "Calendar view" },
        ],
      };
      renderer.showAllViewsHub(anchor, db, 0, {
        isReadOnlyViews: false,
        selectViewInView() {}, renameView() {}, deleteView() {},
        copyCurrentView() {}, editViewIcon() {}, moveView() {},
      });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const panel = document.querySelector(".db-all-views-popover");
      const rows = [...panel.querySelectorAll(".db-all-view-row")];
      const perRow = rows.map((row) => row.querySelectorAll(".db-all-view-action").length);
      const heights = rows.map((row) => Math.round(row.getBoundingClientRect().height));
      // Truncation as the element reports it, not as a width comparison guesses it.
      const labels = rows.map((row) => row.querySelector(".db-all-view-label"));
      const clipped = labels.filter((el) => el.scrollWidth > el.clientWidth + 1);

      // The actions behind the control, reached the way a thumb reaches them.
      const more = rows[7].querySelector(".db-all-view-more");
      let menuLabels = [];
      if (more) {
        more.click();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        // The row's own label element, not its whole text: the harness stands in for Obsidian's
        // icons with a placeholder glyph that production does not emit, and reading `textContent`
        // would compare against the stand-in rather than against the label the row carries.
        menuLabels = [...document.querySelectorAll(".db-owned-menu .db-menu-item")]
          .map((el) => (el.querySelector(".db-menu-item-label") ?? el).textContent.trim())
          .filter(Boolean);
      }
      return {
        rows: rows.length,
        perRow,
        maxPerRow: Math.max(...perRow),
        minHeight: Math.min(...heights),
        clipped: clipped.length,
        clippedNames: clipped.map((el) => el.textContent).join(", "),
        hasMore: Boolean(more),
        menuLabels,
        pageWidth: document.documentElement.clientWidth,
      };
    });
    await page.close();
    return out;
  };

  const phone = await build(true);
  const desktop = await build(false);

  record("a view-switcher row on a phone carries one trailing control, not five",
    phone.rows === 8
      && phone.maxPerRow === 1
      && phone.hasMore
      && phone.clipped === 0
      && phone.minHeight >= 44,
    `${phone.rows} rows at ${phone.pageWidth}px wide carry ${phone.perRow.join("/")} trailing `
      + `control(s), shortest row ${phone.minHeight}px, ${phone.clipped} truncated title(s)`
      + (phone.clipped ? ` (${phone.clippedNames})` : "")
      + `. Before the collapse this measured 5/5/5/5/5/5/5/5 with a shortest row of 30px, under the `
      + `44px thumb floor the rest of this stylesheet's phone rows already meet. The truncation the `
      + `operator photographed — "Calendar vi…" — is NOT reproduced here and this check does not `
      + `claim it: the harness places the hub as a compact popover where the device presents it as a `
      + `full-width sheet, so no title overflows at either width. The zero is a guard against the `
      + `collapse introducing clipping, not a red anyone watched. Whether the device's titles come `
      + `back whole is a device observation`);

  record("the desktop view-switcher row is unchanged",
    desktop.rows === 8 && desktop.maxPerRow === 5 && !desktop.hasMore,
    `${desktop.rows} rows carry ${desktop.perRow.join("/")} trailing control(s) and no overflow `
      + `control is built (${desktop.hasMore}). The collapse is a phone answer to a phone problem — `
      + `there is room for five on a 1440px screen and hiding them behind a menu would cost a click `
      + `each. Asserted rather than assumed, because the branch is one function both presentations `
      + `share and the cheapest wrong fix collapses both`);

  record("every action the row dropped is still reachable behind its control",
    phone.menuLabels.length === 5
      && ["Rename", "Duplicate current view", "Change layout", "Delete view", "Set view icon"]
        .every((label) => phone.menuLabels.includes(label)),
    `the overflow control opens ${phone.menuLabels.length} row(s): ${phone.menuLabels.join(", ") || "none"}. `
      + `Want the same five the inline icons carried — rename, duplicate, change layout, delete, set `
      + `icon — because a row that sheds four controls and four actions has not been tidied, it has `
      + `been cut. Before the control existed this measured 0`);
});

results.push(...tallSheetResults, ...dockResults, ...viewRowResults, ...phoneResults, ...menuResults, ...columnWidthKeyboardResults, ...addViewDesktopResults, ...addViewPhoneResults,
  ...grammarResults, ...addViewGrammar, ...motionResults, ...reducedResults, ...desktopMenuResults, ...cellResults, ...sheetResults, ...selectCellResults, ...selectPhoneResults, ...rowPhoneResults, ...rowNarrowResults,
  ...desktopPanelResults, ...stateResults, ...keyboardParityResults, ...familyResults, ...touchResults, ...overlapResults, ...rhythmResults, ...rendererRhythmResults,
  ...liftedResults, ...inlineEditResults, ...numberParityResults, ...peekLayerResults, ...propertyRowResults, ...propertyGeometryResults, ...openTargetResults, ...menuEdgeResults, ...headerRhythmResults, ...panelParityResults, ...registryResults, ...flickResults, ...selectWidthResults, ...fixtureTableResults, ...panelOwnershipResults, ...peekOwnershipResults, ...checkboxIdentityResults, ...listOwnershipResults, ...addViewOutcomeResults, ...editOutcomeResults, ...menuOutcomeResults, ...backdropOutcomeResults, ...paletteResults, ...dayStateResults, ...rowSlackResults, ...sectionFailures);

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
  // Four entries have left this map by being repaired rather than by being weakened, which is the
  // outcome it exists to produce. The calendar/timeline search-results clamp was fixed in both of
  // its duplicated copies. The row label's off-scale size was unsatisfiable as declared — one check
  // bound the label to `--db-font-md` and another required it on the audited scale, and no value
  // satisfied both while that token read 13px — and moving the step to 14px satisfies both at once.
  // And the record sheet's window-resize dismissal is fixed at the handler: it now tells a keyboard
  // from a rotation by whether the width moved, so the sheet survives the first and not the second.
  // A declared red that has been repaired is a check that can no longer fail, so its entry goes.
]);

// A check attributed to a phase with no recorded red is a check nobody watched fail, and that is
// reported as a failure of the run rather than as a note. The inverse is checked too: a baseline
// whose check has vanished means a rename dropped its provenance silently.
for (const r of phaseChecks.filter((row) => !PHASE_CONTROLS.has(row.name))) {
  results.push({
    name: `the ${SURFACE_PHASE} check "${r.name}" records the red it was watched failing at`,
    pass: false,
    detail: "it carries no entry in PHASE_CONTROLS, so nothing says it was ever seen to fail."
      + " Break the thing it checks, read the failing number, and record it there.",
  });
}
for (const name of [...PHASE_CONTROLS.keys()].filter((n) => !phaseChecks.some((r) => r.name === n))) {
  results.push({
    name: `the recorded red for "${name}" still belongs to a check in this run`,
    pass: false,
    detail: "PHASE_CONTROLS holds a baseline for a check name that no longer appears in the"
      + " section — a rename or a removal took its provenance with it.",
  });
}

// ───────────────────────────────────────────────────────────────────
// HOW MUCH OF THIS LANE HAS PROVENANCE, PROGRAM-WIDE
// ───────────────────────────────────────────────────────────────────
//
// The block above enforces provenance for ONE section: every check attributed to that phase must
// carry a red someone watched, and every recorded red must still belong to a live check. It is the
// right mechanism and it covers a fraction of the lane.
//
// Making it literally program-wide would demand a recorded red for every check here, and most of
// them never had one — they were written against correct code and never failed. Demanding a number
// for those is demanding fiction, which is the mistake the failing-values baseline was created to
// avoid and says so in its own reason field.
//
// So the program-wide form is a RATCHET over the same fact: how many of this lane's checks sit in a
// section that carries provenance at all. It may not fall. A section that gains attribution raises
// it; a rename that drops a check out of an attributed section lowers it and is refused. That turns
// "enforced nowhere" into "enforced in one place and unable to shrink", which is what can honestly
// be claimed without inventing reds nobody watched.
const ATTRIBUTION_BASELINE = join(REPO, "tools/lane/control-attribution-baseline.json");
const attributedNames = new Set(phaseChecks.map((r) => r.name));
const attributedLive = results.filter((r) => attributedNames.has(r.name)).length;
const attributionBaseline = existsSync(ATTRIBUTION_BASELINE)
  ? JSON.parse(readFileSync(ATTRIBUTION_BASELINE, "utf8"))
  : null;
if (attributionBaseline && attributedLive < attributionBaseline.attributed) {
  results.push({
    name: "the lane's provenance coverage has not shrunk",
    pass: false,
    detail: `${attributedLive} check(s) sit in a section that records the red it was watched failing`
      + ` at, against a recorded ${attributionBaseline.attributed}. Coverage fell, which means a`
      + ` check left an attributed section — by a rename, a move or a deletion — and took its`
      + ` provenance with it. The count may rise and may not fall.`,
  });
} else {
  results.push({
    name: "the lane's provenance coverage has not shrunk",
    pass: true,
    detail: `${attributedLive} of ${results.length} checks sit in a section that records a watched red,`
      + ` against a recorded floor of ${attributionBaseline ? attributionBaseline.attributed : attributedLive}.`
      + ` This is a ratchet rather than a target: most checks here were written against correct code`
      + ` and never failed, and demanding a red for those would be demanding fiction`,
  });
}

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
