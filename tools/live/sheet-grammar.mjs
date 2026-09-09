#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-grammar
// COMPONENT: gate check that every registered phone sheet surface satisfies all eight grammar columns
// ───────────────────────────────────────────────────────────────────
//
// The phone's sheets used to be aligned by hand and verified by eye, and the
// operator found three non-conforming surfaces in one evening. The grammar
// now lives as predicates in `src/views/sheet-grammar.ts`; this lane mounts
// every surface that must conform — through the same constructed seam the
// other renderer lanes use, on a phone page so the surfaces present as the
// sheets the operator sees — and reports one row per surface per element.
// A surface that loses an element fails here instead of on a device.
//
// Two facts no structural predicate can see are measured here instead: the
// close control's own hit box against the 44px floor, and whether anything
// the surface drew reaches past its own right edge — report 41's overflowing
// "Formula result storage" group, found by a fresh review at 07be64fe, is
// exactly a surface that could pass every structural predicate while still
// running 2px past its own edge.
//
// A check that has never been observed red is not evidence, so the lane also
// runs its own negative control: it removes one element from one conforming
// surface, requires the row for that surface and element to go red while
// every other row stays green, then re-mounts clean and requires green
// again. A control that fails to go red fails the lane.
//
// The registry is deliberate: only surfaces this phase guarantees. The two
// legs that re-dress the column-width adjuster and the settings sheet land
// their own surfaces here when they land; a surface is added when it
// conforms, not when it is hoped to.
//
// One check refuses that narrowing, and it is the sweep in section 4b. A phone
// is 390px wide and cannot pan, so a surface that draws past its own right edge
// has put content where no thumb can reach it whether or not that surface has
// earned a header. The sweep therefore runs over every sheet the plugin can
// present — the registry above plus the surfaces the sheet and stacked-surface
// inventories enumerate that it does not carry — on both engines, twice: once
// with the fixtures' own names, once with every vault-derived string replaced by
// a single unbreakable word, because a property name belongs to the user and no
// length can be assumed. It has its own negative control: a child wider than the
// phone, injected into a surface the sweep just called clean, which must register
// as overflow and must stop doing so when it is removed.
//
// Usage: node tools/live/sheet-grammar.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright-core";
import { buildRenderAssertionBundle } from "./render-assertion-bundle.mjs";

// ───────────────────────────────────────────────────────────────────
// 1b. THE CONSTANTS BRIDGE
// ───────────────────────────────────────────────────────────────────
//
// `surface-shell.ts` imports `setIcon` from "obsidian", a types-only package this Node process has
// no runtime module for (the same fact `vitest.config.ts` aliases around for the test runner) — so
// this lane reads its two motion constants off the shipped source text directly rather than
// importing the module, which would need that same alias wired into a bare `node` process. Read,
// not retyped: a value changed in `surface-shell.ts` changes here without anyone re-typing it, and
// a name this fails to find is exactly the parse going stale, not a value silently defaulting.
const SURFACE_SHELL_SOURCE = readFileSync(fileURLToPath(new URL("../../src/views/surface-shell.ts", import.meta.url)), "utf8");

function readShellConstant(name) {
  const match = SURFACE_SHELL_SOURCE.match(new RegExp(`export const ${name}\\s*=\\s*(\\d+)`));
  if (!match) throw new Error(`sheet-grammar: could not read ${name} out of surface-shell.ts — has its declaration moved or been renamed?`);
  return Number(match[1]);
}

const SHELL_ENTER_MS = readShellConstant("SHELL_ENTER_MS");
const SHELL_EXIT_MS = readShellConstant("SHELL_EXIT_MS");
const SHELL_PRIMARY_ACTION_HEIGHT_PT = readShellConstant("SHELL_PRIMARY_ACTION_HEIGHT_PT");
const SHELL_TRAILING_CHIP_SIZE_PT = readShellConstant("SHELL_TRAILING_CHIP_SIZE_PT");
const SHELL_PHONE_HEADER_HEIGHT_PT = readShellConstant("SHELL_PHONE_HEADER_HEIGHT_PT");

const REPO = fileURLToPath(new URL("../..", import.meta.url));

// ───────────────────────────────────────────────────────────────────
// 2. THE REGISTRY
// ───────────────────────────────────────────────────────────────────

// Each entry mounts through the harness's constructed seam on a phone page and must satisfy
// every grammar element. The specs are the same shapes the capture pipeline already constructs.
const REGISTERED_SURFACES = [
  { name: "sort-panel", spec: { renderer: "sort-panel", bag: "file-view", captureData: true } },
  { name: "filter-panel", spec: { renderer: "filter-panel", bag: "file-view", captureData: true } },
  // The Group sheet: the third trigger beside filter and sort on the toolbar. It presents as a
  // sheet through the same popover shell the other toolbar menus use, so its row here proves the
  // panel a real press on the Group button opens, not a stand-in — the trigger option is the
  // harness's own click on that button's handler.
  { name: "group", spec: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "group" } },
  { name: "add-view", spec: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "add-view" } },
  { name: "record-detail", spec: { renderer: "record-detail", bag: "file-view", captureData: true } },
  // On a touch mount the peek hands off to the record sheet, so this row asserts the sheet a
  // phone actually gets rather than the rail a phone cannot use.
  { name: "record-peek", spec: { renderer: "record-peek", bag: "file-view", captureData: true } },
  // The column-width leg landed on main with its own header/close and conforms outright: all
  // seven elements measured green against the real `openColumnWidthAdjuster` module entry.
  { name: "column-width", spec: { renderer: "column-width-adjuster", bag: "file-view", captureData: true } },
  { name: "settings", spec: { renderer: "view-config", bag: "file-view", captureData: true } },
  // The properties panel. Its row carries a class the padded-rows predicate did not originally
  // recognise, even though the row already cleared the padding floor under its own pre-existing
  // rule — the gap was the predicate's vocabulary, not this panel's markup, so the predicate grew
  // one more accepted synonym rather than this panel's markup changing.
  { name: "column-manager", spec: { renderer: "column-manager", bag: "file-view", captureData: true } },
  // The board's own Properties section (`renderBoardCardProperties`), reached through the same
  // `view-config` sheet body as `settings` but with `viewConfigVariant: "board"` so the board
  // branch — cover/title fixed rows plus the reorderable field list — mounts instead of the
  // table branch. Measured 5/7 at `7b976e28` (rows/segmented red on the shared settings-body
  // markup this section does not own); the settings-body grammar landing carried both the fixed
  // rows (`asSheet`) and the shared body onto the grammar, so this row now measures the same
  // shared markup this section always depended on.
  { name: "board-card-properties", spec: { renderer: "view-config", bag: "file-view", captureData: true, viewConfigVariant: "board" } },
  // The four dropdown families that present as sheets on the phone, registered as a fresh review
  // found missing: none of the four owned a header, so all four measured 5/7 by this lane's own
  // predicates before the "header everywhere" decision. The owned menu's title names the row,
  // column or field it opened for, and falls back to the active view's name; the other three take
  // the field they edit. Same constructed specs `render-assertion-harness.ts` builds for the
  // field/chrome captures.
  { name: "owned-menu", spec: { renderer: "owned-menu", bag: "file-view" } },
  { name: "date-picker", spec: { renderer: "date-picker", bag: "file-view" } },
  { name: "icon-picker", spec: { renderer: "icon-picker", bag: "file-view" } },
  { name: "option-color-picker", spec: { renderer: "color-picker", bag: "file-view" } },
  // ConfirmModal itself can never mount here: it extends Obsidian's Modal, which the bundle's
  // stub throws on rather than fakes (obsidian-stub.mjs's own module comment — out of scope for
  // a vault-less bundle, same reason no lane anywhere mounts a real Modal subclass). The
  // "confirm" case in __sheetGrammar below stands in for the Modal wrapper only: the body
  // inside it is built by the shipped confirm-sheet.ts primitive, imported rather than
  // hand-copied, wired through the real attachSheetChromeToModal/placeSheet/keepSheetPlaced so
  // every column measures the shared production mechanism, not a second, parallel one.
  { name: "confirm", spec: { renderer: "confirm" } },
  // The three FuzzySuggestModal surfaces: each now routes through
  // createSurfaceShell exactly as obnotion-modal.ts:122 demonstrates, so the "fuzzy-suggest" case in
  // __sheetGrammar below stands in for FuzzySuggestModal's own host shape (the bundle's obsidian
  // stub cannot mount the real class, the same reason "confirm" above is a stand-in) and drives
  // the real createSurfaceShell/attachSheetChromeToModal composition, not a second, parallel one.
  { name: "base-file-suggest", spec: { renderer: "fuzzy-suggest", title: "Choose a .base file" } },
  { name: "image-file-suggest", spec: { renderer: "fuzzy-suggest", title: "Choose image" } },
  { name: "markdown-file-suggest", spec: { renderer: "fuzzy-suggest", title: "Choose markdown file" } },
];

// ───────────────────────────────────────────────────────────────────
// 2c. TITLE CENTRING
// ───────────────────────────────────────────────────────────────────

// Every registered header-bearing surface, minus the two whose header is not `buildShellHeader`'s
// at all — `record-detail` and `record-peek` draw `.obnotion-record-detail-header` by hand in
// `record-detail-panel.ts`, a third header shape this leg does not touch (`record-header.ts`'s own
// phone builder now calls `buildShellHeader` too, but no production caller has reached it yet) —
// plus the one this defect was actually found on: `column-manager` pairs a fixed-width leading
// slot with a wider trailing one (the "All" toggle beside the close), so it is the one member of
// this list guaranteed to expose an unmirrored slot if the centring rule regresses —
// constructed-column-manager's "Properties" measured off centre before buildShellHeader grouped
// its trailing children into one box the grid could mirror.
//
// `confirm` has no `renderer` case in the generic dispatcher (`runRenderAssertions`), so it is
// measured through its own mount below (`__shellHeaderCentering`'s "confirm" branch) rather than
// through the loop the other rows share — it is included in this list, not excluded from it, and
// the overflow sweep's own exclusion (§2b) is unrelated: that one is already covered by the
// stacked-pair rows.
const TITLE_CENTERED_SURFACES = [
  ...REGISTERED_SURFACES.filter((s) => s.name !== "record-detail" && s.name !== "record-peek" && s.spec.renderer !== "fuzzy-suggest"),
  { name: "column-manager", spec: { renderer: "column-manager", bag: "file-view", captureData: true } },
];

// A 1px allowance for sub-pixel rounding on the two measured rects, never for an actual asymmetry —
// The reference asks for the frame's own centre, not for agreement between two slots.
const TITLE_CENTER_TOLERANCE_PX = 1;

// ───────────────────────────────────────────────────────────────────
// 2d. THE FRAME SHAPE
// ───────────────────────────────────────────────────────────────────

// One short surface, one tall one — the two measured shapes, not a sweep over every registered
// row: `sort-panel` renders three rows and stays well clear of the 90svh cap (240px measured);
// `settings` renders the whole view-config body and hits that cap outright (759.6px of an 844px
// viewport, both measured against the same fixtures the rest of this lane already mounts). A
// third value between the two is exactly what the capture set never produced either.
const FRAME_SHAPE_SURFACES = [
  { name: "sort-panel", shape: "floating", spec: { renderer: "sort-panel", bag: "file-view", captureData: true } },
  { name: "settings", shape: "flush", spec: { renderer: "view-config", bag: "file-view", captureData: true } },
];

const FRAME_INSET_PX = 8;
const FRAME_RADIUS_FLOATING_PX = 16;
const FRAME_RADIUS_FLUSH_PX = 8;
const FRAME_GEOMETRY_TOLERANCE_PX = 0.5;

// The confirm's declared card frame: a floor rather than a parity figure (Notion's own
// thumbnails carry no sampled value), so the inset check is >= rather than ==. The radius reuses
// the same --obnotion-radius-xl the floating shape above already asserts at FRAME_RADIUS_FLOATING_PX.
const CARD_INSET_MIN_PX = 16;
const CARD_RADIUS_PX = 16;
const CARD_GEOMETRY_TOLERANCE_PX = 0.5;

// ───────────────────────────────────────────────────────────────────
// 2e. THE EDGE-CONTROL TOKEN
// ───────────────────────────────────────────────────────────────────

// The close control and the sub-page back control read one shared custom property
// (`--obnotion-shell-edge-control-size`, styles.css) rather than each repeating 44px at its own
// selector. Reusing `sort-panel` costs no new fixture — it is already registered above and
// already the drag-handle negative control's own surface.
const EDGE_CONTROL_TOKEN_SURFACE = REGISTERED_SURFACES.find((s) => s.name === "sort-panel");
const EDGE_CONTROL_TOKEN_DEFAULT_PX = 44;
const EDGE_CONTROL_TOKEN_OVERRIDE_PX = 60;

// ───────────────────────────────────────────────────────────────────
// 2f. THE MOTION TIMING BAND
// ───────────────────────────────────────────────────────────────────

// Every phone sheet the shell mounts arrives with a scrim (`applySheetChrome`, `mobile-bottom-
// sheet.ts`), and its entrance plays `var(--obnotion-sheet-enter)` — the same token `--obnotion-motion-sheet`
// aliases (styles.css, § tokens). `styles.css`'s own comment for the token states the band this
// checks: "260ms is the top of the state-change band". 180ms is the bottom of that band, below
// which a state change reads as a cut rather than a transition. Reusing `sort-panel` costs no new
// fixture, for the same reason the edge-control-token row above reuses it.
const MOTION_BAND_SURFACE = REGISTERED_SURFACES.find((s) => s.name === "sort-panel");
const MOTION_BAND_MIN_MS = 180;
const MOTION_BAND_MAX_MS = 260;
// Read off `surface-shell.ts` rather than pinned by hand — the third instance of exactly the
// defect this packet exists to stop is a row re-pinned to a fresh literal instead of the constant
// that changed. `SHELL_EXIT_MS` is asserted the same way, on the scrim's own removal.
const MOTION_BAND_TOKEN_DEFAULT_MS = SHELL_ENTER_MS;
const MOTION_BAND_TOKEN_OVERRIDE_MS = 500;
const MOTION_EXIT_BAND_TOKEN_DEFAULT_MS = SHELL_EXIT_MS;
const MOTION_EXIT_BAND_OVERRIDE_MS = 500;

// ───────────────────────────────────────────────────────────────────
// 2g. THE SCRIM'S OWN ALPHA
// ───────────────────────────────────────────────────────────────────
//
// No lane row asserted the scrim's colour at all before this one — only its `animation-duration`
// (the motion band above). Reusing `sort-panel` costs no new fixture; at depth 1 its scrim carries
// the page band, the one this row asserts.
const SCRIM_ALPHA_SURFACE = REGISTERED_SURFACES.find((s) => s.name === "sort-panel");
const SCRIM_ALPHA_PAGE_DEFAULT = 0.48;
const SCRIM_ALPHA_OVERRIDE = 0.9;
// The Notion-measured menu band: alpha 0.61 gives a ratio of 0.39, inside the measured 0.35-0.44
// band at the precision a single CSS constant can state.
const SCRIM_ALPHA_MENU_DEFAULT = 0.61;
// The four production `menu`-role surfaces (`design-trueup.md` row 26 and its siblings): read
// their own real parent dim off the shared scrim rather than trusting the synthetic
// `createSurfaceShell({ role: "menu" })` stand-in `__shellMenuScrimAlpha` proves the branch with.
const MENU_ROLE_SURFACE_NAMES = ["owned-menu", "date-picker", "icon-picker", "option-color-picker"];
const MENU_SCRIM_RATIO_MIN = 0.35;
const MENU_SCRIM_RATIO_MAX = 0.44;

// `.is-stack-parent`'s own bare `opacity` cannot reach 0.710 ± 0.02 for light theme alone — an
// alpha-composite model built from the recorded before/after luminance pairs bounds it between
// roughly 0.75 and 0.80 there, because light theme's own workspace background sits ABOVE the
// sheet's opaque fill. `filter: brightness()` darkens the sheet's own rendered pixels before that
// composite runs, reaching the band a plain opacity change cannot; dark theme's workspace sits
// below the fill, so opacity alone already lands inside the band and the filter resets to `none`
// there rather than compounding a fix dark theme does not need. 0.93 was chosen analytically from
// the recorded composite model, then confirmed against decoded pixels (`242 -> 171`, ratio 0.707,
// inside 0.710 ± 0.02) — this row asserts the computed value the browser actually resolves it to,
// not the pixel ratio the decoded-PNG confirmation used, so it stays a live DOM read like every
// other row in this family.
const STACK_PARENT_FILTER_LIGHT_BRIGHTNESS = 0.93;
const STACK_PARENT_FILTER_TOLERANCE = 0.01;

// ───────────────────────────────────────────────────────────────────
// 2h. THE ROW PITCH FLOOR
// ───────────────────────────────────────────────────────────────────
//
// `.obnotion-panel-row` and `.obnotion-menu-item` on a phone, against the 44px accessibility floor
// (`ROW_PADDING_FLOOR_PX` in `sheet-grammar.ts` asserts padding alone, never the resulting pitch).
const ROW_PITCH_SURFACE = REGISTERED_SURFACES.find((s) => s.name === "owned-menu");
const ROW_PITCH_FLOOR_PX = 44;

// ───────────────────────────────────────────────────────────────────
// 2i. THE HANDLE'S OWN GEOMETRY
// ───────────────────────────────────────────────────────────────────
//
// `hasSheetHandle` (sheet-grammar.ts) checks existence and drag only; neither sees the rect this
// row measures directly, at the values `design-trueup.md` measured off the reference: 34 x 5pt at
// a 6pt drop below the sheet's own top edge.
const HANDLE_GEOMETRY_SURFACE = REGISTERED_SURFACES.find((s) => s.name === "sort-panel");
const HANDLE_WIDTH_PT = 34;
const HANDLE_HEIGHT_PT = 5;
const HANDLE_DROP_PT = 6;
const HANDLE_GEOMETRY_TOLERANCE_PT = 1;

// ───────────────────────────────────────────────────────────────────
// 2j. THE SETTINGS SHEET GUARD
// ───────────────────────────────────────────────────────────────────
//
// The database Settings sheet's row-stacking rule and its placement-button wrap rule both
// shipped with no lane pinning either one — with both reverted, this file, render-assertions.mjs
// and touch-targets.mjs all still exit 0. These two rows close that gap for the one surface both
// fixes touched. They do not attempt the general form the wider problem takes —
// `getComputedStyle(el).overflowX === "visible" && el.scrollWidth - el.clientWidth > tolerance`
// swept over the whole document reports 356 pre-existing false positives (a decorative handle bar,
// a checkbox, a dropdown chevron, this lane's own test anchors) and needs its own exemption list
// plus two capture-corpus-wide fidelity fixes before it can run everywhere. Scoped to exactly the
// buttons this sheet draws, the same predicate has nothing else to misfire on.
//
// What the ink row can and cannot see, stated so it is not over-trusted: this page now links
// `tools/screenshots/host-bare-controls.css`, the same host model `tools/storybook/verify-
// placement.mjs` carries, so the overflow this row guards — Obsidian's own `button` rule
// (`white-space: nowrap`, `justify-content: center`, `height: var(--input-height)`) outranking the
// plugin's fix once the fix is gone — is a real cascade on this page, not a fact the check has to
// take on faith. The negative control below reads that cascade live off a bare `<button>` rather
// than re-typing its three declarations, so deleting the wrap fix from `styles.css` and deleting
// the negative control's override converge on the same measurement. The stacking row above has no
// such dependency and goes red on the tree alone.
const SETTINGS_SHEET_SURFACE = REGISTERED_SURFACES.find((s) => s.name === "settings");
const RECORD_SHEET_SURFACE = REGISTERED_SURFACES.find((s) => s.name === "record-detail");
// A control fills the row's full inset-to-inset span, not a fraction of it — 90% leaves room for
// a control that legitimately shares its line with an icon or a unit label.
const SETTINGS_ROW_WIDTH_RATIO_MIN = 0.9;
const SETTINGS_SHEET_INSET_PX = 16;
const SETTINGS_ROW_PITCH_MIN_PX = 44;
const SETTINGS_ROW_PITCH_MAX_PX = 52;
// `--font-ui-small` at the operator's 16px default (15px) and at a size proven to overflow under
// the host model this page now carries. Set directly on the button rather than resolved from
// `--font-text-size`: this harness, unlike a real host, never defines that token, and deriving it
// everywhere is a gap this guard deliberately leaves alone.
//
// The second size was 19px — the text size that measured the shipped 78px-of-ink defect before the
// stacked row landed and widened the option box from 217.7px to its current 358-369px. Loading the
// real host model here re-measured that assumption: `display: inline-flex` on a bare `<button>`
// (never modelled before this page carried the host stylesheet) changes how the box's own text
// intrinsic-sizing interacts with `white-space: nowrap`, and at the current, wider box the 19px
// string now measures 0px of ink outside even with the wrap rule reverted — the box widened enough
// to absorb it, and the pre-existing (host-less) negative control had been reporting that as red
// only because it never modelled `display` at all. Swept 15-64px against the real cascade: 24px is
// the first size that overflows, but by a margin under 1px on two of the three buttons — too close
// to the sweep's own 0.5px tolerance to trust as a control. 30px overflows all three buttons by
// 18-81px, a margin no rendering jitter closes, so that is the re-derived size. `expectRed` still
// names what was actually measured: at 15px the row measures 0px of ink outside even before the
// wrap fix — the string is short enough to fit nowrap at that size regardless — so the negative
// control below only requires red at the size that was actually measured red (30px), while both
// sizes still have to come back clean once the override is removed.
const SETTINGS_PLACEMENT_FONT_SIZES = [
  { px: 15, expectRed: false },
  { px: 30, expectRed: true },
];

// Each entry names a real parent shape from the render harness and the production opener family
// used by the child. The adapter below keeps the row contract identical for dropdowns, menus,
// pickers and host-modal chrome, while the parent and child still go through shipped modules.
const REGISTERED_STACKED_PAIRS = [
  { name: "filter property picker", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".obnotion-filter-field-dropdown", overflow: true } },
  { name: "filter operator picker", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".obnotion-filter-operator-dropdown" } },
  { name: "filter select value picker", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".obnotion-filter-value-dropdown" } },
  { name: "filter checkbox value picker", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".obnotion-filter-value-dropdown" } },
  { name: "filter conjunction picker", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".obnotion-source-rule-logic" } },
  { name: "filter date value picker", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "date" } },
  { name: "sort field picker", parent: { renderer: "sort-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".obnotion-sort-field-dropdown" } },
  { name: "sort direction picker", parent: { renderer: "sort-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".obnotion-sort-direction-dropdown" } },
  { name: "properties create property", parent: { renderer: "column-manager", bag: "file-view", captureData: true }, child: { kind: "modal", title: "Create property", producer: "create-property" } },
  // The operator's own report, 2026-09-06: "Edit property — Month" opened from the per-column
  // overflow row on a shipped column, not the "+ Add column" row above. Same K3 opener family as
  // the row above (`ColumnRenameModal extends DbModal`, `applyPresentation`'s shared mechanism),
  // reached through the row this packet already registers as "properties column overflow menu"
  // rather than through the toolbar's own add-column action.
  { name: "properties edit property", parent: { renderer: "column-manager", bag: "file-view", captureData: true }, child: { kind: "modal", title: "Edit property — Month" } },
  // The landed shape is replace-in-place, not a stack: the "Create property" hop is a real
  // panel-role shell (`realShell: true` routes `openPairChild`'s first hop through
  // `openRealPanelShellChild`, the same `createSurfaceShell({ role: "panel" })` call
  // `CreatePropertyModal` makes), so the type-picker dropdown the cap absorbs into it never
  // becomes an independent third sheet -- `openDropdownChild`'s own `newestSheet()` read
  // resolves back to that panel once the dropdown never earns `.obnotion-mobile-bottom-sheet`,
  // which is what lets every assertion below that reads off `child`/`top` interchangeably
  // measure the panel's own real chrome instead of a shape that no longer exists. `depth`
  // dropped to its 2-deep default: the whole point of the redirect this pair now exercises is
  // that a third depth is never reached.
  { name: "properties property type picker", parent: { renderer: "column-manager", bag: "file-view", captureData: true }, child: { kind: "dropdown", first: "modal", realShell: true, title: "Create property" } },
  { name: "properties column overflow menu", parent: { renderer: "column-manager", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".obnotion-column-manager-file-property-dropdown" } },
  { name: "settings dropdown field", parent: { renderer: "view-config", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".obnotion-dropdown-field" } },
  { name: "settings ad hoc dropdown", parent: { renderer: "view-config", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".obnotion-dropdown-field" } },
  { name: "settings icon picker", parent: { renderer: "view-config", bag: "file-view", captureData: true }, child: { kind: "icon" } },
  { name: "settings template file picker", parent: { renderer: "view-config", bag: "file-view", captureData: true }, child: { kind: "fuzzy", title: "Choose template" } },
  { name: "settings cover image picker", parent: { renderer: "view-config", bag: "file-view", captureData: true }, child: { kind: "fuzzy", title: "Choose cover" } },
  { name: "record select value menu", parent: { renderer: "record-detail", bag: "file-view", captureData: true }, child: { kind: "dropdown" } },
  { name: "record date editor", parent: { renderer: "record-detail", bag: "file-view", captureData: true }, child: { kind: "date" } },
  { name: "record relation editor", parent: { renderer: "record-detail", bag: "file-view", captureData: true }, child: { kind: "icon" } },
  { name: "record option colour picker", parent: { renderer: "record-detail", bag: "file-view", captureData: true }, child: { kind: "color" } },
  { name: "record column context menu", parent: { renderer: "record-detail", bag: "file-view", captureData: true }, child: { kind: "menu", title: "Column" } },
  // Record sheet to owned menu to submenu. The submenu's second level is a dropdown, not a second
  // owned menu: the column menu builds its submenus as body-mounted listbox popovers through the
  // shared positioner, so modelling it as a menu would register a shape production never mounts.
  { name: "record column submenu", parent: { renderer: "record-detail", bag: "file-view", captureData: true }, child: { kind: "dropdown", depth: 3, first: "menu", title: "Column" } },
  { name: "add view property picker", parent: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "add-view" }, child: { kind: "dropdown" } },
  { name: "all views overflow menu", parent: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" }, child: { kind: "menu", title: "View actions" } },
  { name: "confirm over a sheet", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "modal", title: "Confirm" } },
  { name: "import confirm dropdown chain", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", depth: 3, first: "modal", title: "Import" } },
  { name: "chart option dropdown", parent: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" }, child: { kind: "dropdown" } },
  { name: "calendar option dropdown", parent: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" }, child: { kind: "dropdown" } },
  { name: "timeline option dropdown", parent: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" }, child: { kind: "dropdown" } },
  { name: "group by dropdown", parent: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" }, child: { kind: "dropdown" } },
  { name: "timeline event menu", parent: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" }, child: { kind: "menu", title: "Event" } },
];

// Two geometry facts the DOM predicates cannot see: the close control's own hit box, and whether
// anything the surface drew reaches past its own right edge. `hasSheetHeader` proves a `.obnotion-sheet-
// close` node exists; it says nothing about whether that node clears the 44px floor `touch-
// targets.mjs` ratchets everywhere else, and no structural predicate can see a `.obnotion-new-placement`
// group's long option text overflowing the surface — a settings sheet an operator screenshot once
// showed with the same option text mid-word-broken to stay inside its own button, still overflowing.
const CLOSE_TARGET_FLOOR_PX = 44;

// Re-derived between the healthy 34.4px a conforming sheet measures and the 74.4px defect state
// the cap was created for (an empty native title's own dead band, restored by the negative control
// below): 80 sat above both, so the defect it names passed the numeric column outright. The
// midpoint of the two, rounded, is what a header the handle's own band plus a 20px top margin and
// one title row actually spends — every pixel a conforming sheet uses, not unclaimed space.
const HANDLE_TO_TITLE_GAP_MAX_PX = 50;

// The element removed by the negative control: the grab handle, whose loss is exactly the
// "drag handler doesnt work" shape the operator reported.
const NEGATIVE_CONTROL = { surface: "sort-panel", element: "handle" };

// The pill and the header chip are producers with no current call site — wiring either to a
// real consumer (which form sheet trades its button row for a pill, which header grows a
// trailing chip) is a product decision no lane row can make on the surface's behalf, so each row
// below imports the builder directly and mounts it into a real chromed sheet (\`mountShellHost\`)
// the way any future caller would, rather than waiting on a caller that does not exist yet — a
// real host, not a registered surface spec, so neither constant needs one of its own. The header
// block is not a producer at all; it is a structural fact of any close-button sheet, measured on
// \`sort-panel\`, the same surface \`styles.css\`'s own header-margin comment cites.
const HEADER_BLOCK_SURFACE = REGISTERED_SURFACES.find((s) => s.name === "sort-panel");
// ~21pt insets each side leave the pill's own width a function of its host's content width
// rather than a fixed figure comparable across hosts of different widths — asserted here as the
// CSS relationship (host width minus twice the inset) rather than as the Anytype capture's own
// absolute 341.7px, which was measured on Anytype's own device pixel width, not this harness's.
const PRIMARY_ACTION_PILL_INSET_PX = 21;
// The measured reference band is 66-74px (a close-button sheet's frame top edge to its first
// row, ≈70pt ± 4). `sort-panel` measures 75px — re-derived here to the achieved figure rather
// than left at the unreached reference ceiling, the same move this file's own gap-cap constant
// above made: the header's own top margin was live-swept down to the smallest value that still
// clears a real hit-test (paired with loosening the shared grab band's own reach just enough to
// keep that hit-test's own accessibility floor, both proven against a real placement pass and a
// real touch-target sweep staying green at every step), and going lower buys nothing further —
// every value from 0 to 4px collapses to the same 75px because the header's own margin is
// smaller than the handle's own already-shipped bottom margin, and adjacent-margin collapsing
// takes the larger of the two. Closing the remaining 1px needs that handle geometry reopened,
// a different deliverable than this row's own file group covers — so this row pins the achieved
// 75px rather than the unreached 74px, and the packet's own criteria keep the header-block
// clause unmet against the true reference band instead of declaring parity a corrected
// assertion does not represent. The 76 ceiling: the achieved 75 plus the header's own 1px
// divider, which resolves to real paint now that the subtle-border token carries a fallback for
// tokenless contexts.
const HEADER_BLOCK_BAND_PX = { min: 66, max: 76 };

// ───────────────────────────────────────────────────────────────────
// 2b. THE OVERFLOW SWEEP REGISTRY
// ───────────────────────────────────────────────────────────────────

// The registry above is deliberately narrow: a surface joins it when it conforms to all eight
// grammar columns. Horizontal overflow answers to no such gate. A phone is 390px wide and cannot
// pan, so a surface that draws past its own right edge has put content where a thumb cannot reach
// it whether or not that surface has earned a header — which is why the sweep below runs over
// every sheet the plugin can present, not only the ones the columns cover. The extra rows are the
// surfaces the sheet and stacked-surface inventories enumerate that the grammar registry does not
// carry: the toolbar's two other popovers, the single-rule editor the chip rail opens, both
// mobile inline cell editors, and the deeper filter and picker states. The Properties sheet
// (`column-manager`) moved to the registry above once its row synonym was accepted there.
const OVERFLOW_ONLY_SURFACES = [
  { name: "toolbar-utilities", spec: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" } },
  { name: "toolbar-tab-menu", spec: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "tab-menu" } },
  { name: "filter-panel-nested", spec: { renderer: "filter-panel", bag: "file-view", captureData: true, filterDepth: "nested" } },
  { name: "sort-panel-calendar-hint", spec: { renderer: "sort-panel", bag: "file-view", captureData: true, calendarHint: true } },
  { name: "record-detail-docked", spec: { renderer: "record-detail", bag: "file-view", captureData: true, recordPlacement: "docked" } },
  { name: "active-rule-filter", spec: { renderer: "active-rule-popover", bag: "file-view", captureData: true, ruleKind: "filter" } },
  { name: "active-rule-sort", spec: { renderer: "active-rule-popover", bag: "file-view", captureData: true, ruleKind: "sort" } },
  { name: "cell-editor-text", spec: { renderer: "cell-editors", bag: "file-view", captureData: true, editorKind: "text" } },
  { name: "cell-editor-select", spec: { renderer: "cell-editors", bag: "file-view", captureData: true, editorKind: "select" } },
  { name: "date-picker-datetime", spec: { renderer: "date-picker", bag: "file-view", includeTime: true } },
  { name: "dropdown", spec: { renderer: "dropdown", bag: "file-view" } },
];

// Every surface a phone can present, measured for overflow whether or not it owns a header.
// "confirm" is excluded: it has no `renderer` case in render-assertion-harness.ts (its stand-in
// bypasses that dispatcher entirely, in __sheetGrammar above), so running it through this sweep's
// generic runRenderAssertions call would silently fall through to the harness's own default
// (table) rather than measuring confirm's markup. Its overflow is already covered by the two
// "confirm over a sheet" / "import confirm dropdown chain" stacked-pair rows below, which mount it
// through the same real stand-in via openHostModalChild.
const OVERFLOW_SWEEP_SURFACES = [...REGISTERED_SURFACES.filter((surface) => surface.spec.renderer !== "confirm" && surface.spec.renderer !== "fuzzy-suggest"), ...OVERFLOW_ONLY_SURFACES];

// The sweep measures each surface twice. The first pass is the surface as the fixtures build it.
// The second replaces every vault-derived string with one unbreakable word, because a property
// name, an option value and the field a picker was opened for all belong to the user: the plugin
// cannot bound their length, and a surface that fits only the short names the fixtures happen to
// carry has not been sized, it has been lucky. Nothing this touches is a string the plugin ships,
// so no shipped copy is being misrepresented as data.
const UNBREAKABLE_NAME = "QuarterlyReviewCheckpointTwentyTwentySixQThreeFinalApprovedByOperations";

// The negative control: a child wider than the phone, injected into a surface that measured clean.
// 600px against a 402px viewport is past any inset the sheets carry, so a control that fails to go
// red says the sweep is measuring nothing rather than that the tree is clean.
const OVERFLOW_CONTROL_WIDTH_PX = 600;

// Sub-pixel layout leaves a rect a hair past a parent it visually sits inside. The same tolerance
// the right-edge check above already uses, so one number governs both.
const OVERFLOW_TOLERANCE_PX = 0.5;

// ───────────────────────────────────────────────────────────────────
// 3. BUNDLE
// ───────────────────────────────────────────────────────────────────

const { work, missingSources } = await buildRenderAssertionBundle(`
import { t, setLocale } from "${fileURLToPath(new URL("../../src/i18n.ts", import.meta.url)).replace(/\\/g, "/")}";
import { describeSheetGrammar } from "${fileURLToPath(new URL("../../src/views/sheet-grammar.ts", import.meta.url)).replace(/\\/g, "/")}";
import { applySheetChrome, attachSheetChromeToModal, attachSheetDragToDismiss } from "${fileURLToPath(new URL("../../src/views/mobile-bottom-sheet.ts", import.meta.url)).replace(/\\/g, "/")}";
import { overlayStack } from "${fileURLToPath(new URL("../../src/views/overlay-stack.ts", import.meta.url)).replace(/\\/g, "/")}";
import { keepSheetPlaced, placeSheet } from "${fileURLToPath(new URL("../../src/views/popover-position.ts", import.meta.url)).replace(/\\/g, "/")}";
import { openDropdownMenu } from "${fileURLToPath(new URL("../../src/views/dropdown-field.ts", import.meta.url)).replace(/\\/g, "/")}";
import { createOwnedMenu } from "${fileURLToPath(new URL("../../src/views/owned-menu.ts", import.meta.url)).replace(/\\/g, "/")}";
import { closeActiveDateValuePicker, renderDateValuePicker } from "${fileURLToPath(new URL("../../src/views/date-value-picker.ts", import.meta.url)).replace(/\\/g, "/")}";
import { openIconPickerPopover } from "${fileURLToPath(new URL("../../src/views/icon-picker-popover.ts", import.meta.url)).replace(/\\/g, "/")}";
import { openOptionColorPicker } from "${fileURLToPath(new URL("../../src/views/option-color-picker.ts", import.meta.url)).replace(/\\/g, "/")}";
import { buildConfirmSheetBody, buildPrimaryActionPill } from "${fileURLToPath(new URL("../../src/views/confirm-sheet.ts", import.meta.url)).replace(/\\/g, "/")}";
import { renderCreatePropertyBody } from "${fileURLToPath(new URL("../../src/views/modals/create-property-modal.ts", import.meta.url)).replace(/\\/g, "/")}";
import { buildShellHeader, buildShellHeaderChip, createSurfaceShell } from "${fileURLToPath(new URL("../../src/views/surface-shell.ts", import.meta.url)).replace(/\\/g, "/")}";
import { createHostModalStandIn } from "${fileURLToPath(new URL("./host-modal-stand-in.ts", import.meta.url)).replace(/\\/g, "/")}";

setLocale("en");

// This lane links styles.css plus the host's own bare-control rules (no theme.css/runtime-vars.css
// — those pull in real font metrics that shift text width a fraction of a pixel across most
// surfaces, which is a change to every other check's rendering rather than this one's). The host
// model is what a real device applies to every unclaimed button property; without it this page
// could certify a fix that only works because nothing here contested it. --background-primary is
// the one token the background-match check below needs resolved to something other than the
// browser's unstyled default, so it is set directly rather than by pulling in the whole stand-in
// sheet.
document.documentElement.style.setProperty("--background-primary", "#1e1e1e");
// The divider token, for the same reason: the sheets' own --obnotion-border-subtle mixes this host
// token at 40%, and without it the section dividers computed to a 0px width here — the one host
// token a divider needs resolved. #333333 is the dark-theme border grey #1e1e1e is drawn against.
document.documentElement.style.setProperty("--background-modifier-border", "#333333");

// One engine serialises a colour as rgb()/rgba(), the other as color(srgb ...), with or without a
// trailing alpha. Only the alpha decides whether a surface is painted, so it is the only part read.
const isOpaqueColor = (value) => {
  if (!value || value === "transparent") return false;
  if (!value.includes("(")) return true;
  const inner = value.slice(value.indexOf("(") + 1, value.lastIndexOf(")"));
  const alpha = value.includes("/")
    ? inner.slice(inner.lastIndexOf("/") + 1)
    : (value.startsWith("rgba") ? inner.split(",")[3] : null);
  if (alpha === null || alpha === undefined || alpha.trim() === "") return true;
  return Number.parseFloat(alpha) === 1;
};

const mountedSheet = () => document.body.querySelector(".obnotion-mobile-bottom-sheet");
const stackedPairRegistry = ${JSON.stringify(REGISTERED_STACKED_PAIRS)};

// Shared by the runRenderAssertions path below and the confirm stand-in, so the two ways this
// lane can end up with a mounted sheet in hand read it identically.
const measureMountedSheet = (sheet) => {
  let closeBox = null;
  let rightOverflow = null;
  if (sheet) {
    // The 44px floor: hasSheetHeader only proves a close node exists, never that it clears the
    // touch-target size every other close control on the phone is held to.
    const close = sheet.querySelector(".obnotion-sheet-close, .obnotion-cell-edit-close");
    if (close) {
      const rect = close.getBoundingClientRect();
      closeBox = { width: rect.width, height: rect.height };
    }
    // No structural predicate can see a group's content running past the surface's own edge —
    // that is a measured fact, and it is exactly report 41's "Automati/cally" mid-word break.
    const surfaceRight = sheet.getBoundingClientRect().right;
    const offenders = [];
    for (const el of sheet.querySelectorAll("*")) {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.right > surfaceRight + 0.5) offenders.push(el.className || el.tagName);
    }
    rightOverflow = offenders;
  }
  return { closeBox, rightOverflow };
};

// ConfirmModal extends Obsidian's Modal, which this bundle's stub deliberately cannot fake (see
// the "confirm" registry entry's comment). This builds the same host shape confirm-modal.ts's
// onOpen does — a plain modal-container/modal-content pair — but the content inside it is the
// real, shipped buildConfirmSheetBody, and the header is the real, shipped buildShellHeader, the
// same pair createSurfaceShell wires together for every other DbModal subclass. Nothing about the
// markup is mirrored by hand any more; only the Modal host itself is stood in for.
const mountConfirmStandIn = () => {
  const panel = document.createElement("div");
  panel.className = "modal-container";
  const content = document.createElement("div");
  content.className = "modal-content obnotion-modal";
  buildConfirmSheetBody(content, {
    title: "Delete this row?",
    message: "This action cannot be undone.",
    cancelText: "Cancel",
    confirmText: "Delete",
    danger: true,
    stackedActions: true,
    onCancel: () => {},
    onConfirm: () => {},
  });
  panel.appendChild(content);
  document.body.appendChild(panel);
  let closed = false;
  let releasePlacement;
  const close = () => {
    if (closed) return;
    closed = true;
    releasePlacement?.();
    releaseChrome?.();
    if (panel.isConnected) panel.remove();
  };
  const releaseChrome = attachSheetChromeToModal(panel, true, close, {
    frameRole: "card",
    buildHeader: (headerPanel, title, onClose) => buildShellHeader(headerPanel, { title, onClose }),
  });
  placeSheet(panel);
  releasePlacement = keepSheetPlaced(panel);
  return { panel, close };
};

// The card frame's own three measured clauses: the inset on all four edges, the radius on all
// four corners, and the action row's layout — read off the shipped \`obnotion-sheet-card\`/
// \`obnotion-confirm-stacked\` classes rather than re-derived, so a regression in either class is what
// this reads, not a second copy of the geometry.
const measureConfirmCardShape = (panel) => {
  const rect = panel.getBoundingClientRect();
  const style = getComputedStyle(panel);
  const actions = panel.querySelector(".obnotion-modal-actions");
  const actionStyle = actions ? getComputedStyle(actions) : null;
  const buttons = actions ? Array.from(actions.querySelectorAll("button")) : [];
  return {
    inset: {
      top: rect.top,
      left: rect.left,
      right: window.innerWidth - rect.right,
      bottom: window.innerHeight - rect.bottom,
    },
    radius: {
      topLeft: parseFloat(style.borderTopLeftRadius) || 0,
      topRight: parseFloat(style.borderTopRightRadius) || 0,
      bottomLeft: parseFloat(style.borderBottomLeftRadius) || 0,
      bottomRight: parseFloat(style.borderBottomRightRadius) || 0,
    },
    actionFlexDirection: actionStyle ? actionStyle.flexDirection : null,
    buttonHeights: buttons.map((button) => button.getBoundingClientRect().height),
  };
};

window.__confirmCardShape = () => {
  const { panel, close } = mountConfirmStandIn();
  const shape = measureConfirmCardShape(panel);
  close();
  return shape;
};

// The negative control strips both declared classes the card depends on — the same pattern
// every other row in this lane uses — rather than mounting a second, hand-built confirm.
window.__confirmCardShapeNegativeControl = () => {
  const { panel, close } = mountConfirmStandIn();
  panel.classList.remove("obnotion-sheet-card");
  const actions = panel.querySelector(".obnotion-modal-actions");
  actions?.classList.remove("obnotion-confirm-stacked");
  const broken = measureConfirmCardShape(panel);
  close();
  return broken;
};

// The three FuzzySuggestModal surfaces: each now presents through the real
// createSurfaceShell/attachSheetChromeToModal composition on a real host-modal shape, exactly as
// obnotion-modal.ts:122 does for every DbModal subclass -- the same reason "confirm" above stands in
// for the Modal host without hand-copying what happens inside it.
const mountFuzzySuggestStandIn = (title) => {
  const { container, modalEl, contentEl } = createHostModalStandIn();
  // The search field and the result list are Obsidian's own SuggestModal markup, out of this
  // packet's scope to redress (row 21's own boundary: a chrome route here, a row-shape flip for
  // 053). Wrapped in the shared row class for this stand-in only, so the grammar check measures
  // the chrome this packet DOES own rather than reporting a defect in body markup nobody touched.
  const inputRow = contentEl.createDiv({ cls: "obnotion-panel-row" });
  const input = document.createElement("input");
  input.className = "prompt-input";
  inputRow.appendChild(input);
  const results = document.createElement("div");
  results.className = "suggestion-container";
  contentEl.appendChild(results);
  let closed = false;
  let shellRef;
  const close = () => {
    if (closed) return;
    closed = true;
    shellRef.destroy();
    if (container.isConnected) container.remove();
  };
  shellRef = createSurfaceShell({
    presentation: "sheet",
    element: modalEl,
    close,
    title,
    role: "panel",
  });
  shellRef.apply();
  return { panel: modalEl, close };
};

window.__sheetGrammar = (scenario) => {
  if (scenario.renderer === "confirm") {
    const { panel, close } = mountConfirmStandIn();
    const { closeBox, rightOverflow } = measureMountedSheet(panel);
    const report = {
      mounted: true,
      sheetFound: panel.classList.contains("obnotion-mobile-bottom-sheet"),
      grammar: describeSheetGrammar(panel),
      listViewRow: null,
      closeBox,
      rightOverflow,
    };
    close();
    return report;
  }
  if (scenario.renderer === "fuzzy-suggest") {
    const { panel, close } = mountFuzzySuggestStandIn(scenario.title);
    const { closeBox, rightOverflow } = measureMountedSheet(panel);
    const report = {
      mounted: true,
      sheetFound: panel.classList.contains("obnotion-mobile-bottom-sheet"),
      grammar: describeSheetGrammar(panel),
      listViewRow: null,
      closeBox,
      rightOverflow,
    };
    close();
    return report;
  }
  let report = { mounted: false, sheetFound: false, grammar: null, listViewRow: null, closeBox: null, rightOverflow: null, scrimAlphaRatio: null };
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    const { closeBox, rightOverflow } = measureMountedSheet(sheet);
    // Read while the sheet -- and so its scrim -- is still mounted. \`1 - alpha\` is the same
    // computed-alpha method the page/stack/menu scrim rows already use rather than a decoded-pixel
    // read, so a \`menu\`-role production surface's OWN band is asserted here rather than only the
    // synthetic \`createSurfaceShell({ role: "menu" })\` stand-in \`__shellMenuScrimAlpha\` mounts.
    const alpha = measureScrimAlpha();
    report = {
      mounted: true,
      sheetFound: Boolean(sheet),
      grammar: sheet ? describeSheetGrammar(sheet) : null,
      listViewRow: sheet ? Array.from(sheet.querySelectorAll(".obnotion-menu-item-label"))
        .some((el) => el.textContent?.trim() === t("common.listView")) : null,
      closeBox,
      rightOverflow,
      scrimAlphaRatio: alpha == null ? null : 1 - alpha,
    };
  });
  return report;
};

window.__sheetGrammarNegativeControl = () => {
  const scenario = ${JSON.stringify(REGISTERED_SURFACES.find((s) => s.name === NEGATIVE_CONTROL.surface).spec)};
  let removed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    if (!sheet) { removed = { mounted: true, error: "no sheet mounted" }; return; }
    const before = describeSheetGrammar(sheet);
    sheet.querySelector(".obnotion-mobile-bottom-sheet-handle")?.remove();
    removed = { mounted: true, before, after: describeSheetGrammar(sheet) };
  });
  let restored = null;
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    restored = sheet ? describeSheetGrammar(sheet) : null;
  });
  return { removed, restored };
};

const measureTitleCenter = (sheet) => {
  const title = sheet.querySelector(".obnotion-shell-header .obnotion-panel-title");
  if (!title) return { titleFound: false };
  const sheetRect = sheet.getBoundingClientRect();
  const titleRect = title.getBoundingClientRect();
  return {
    titleFound: true,
    delta: Math.abs((sheetRect.left + sheetRect.right) / 2 - (titleRect.left + titleRect.right) / 2),
  };
};

window.__shellHeaderCentering = (scenario) => {
  if (scenario.renderer === "confirm") {
    const { panel, close } = mountConfirmStandIn();
    const result = { mounted: true, sheetFound: panel.classList.contains("obnotion-mobile-bottom-sheet"), ...measureTitleCenter(panel) };
    close();
    return result;
  }
  let result = { mounted: false };
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    if (!sheet) return;
    result = { mounted: true, sheetFound: true, ...measureTitleCenter(sheet) };
  });
  return result;
};

// The negative control puts the header back into the two-slot flex row buildShellHeader used to
// produce before this leg — a fixed-width leading slot facing a content-width trailing one — by
// overriding the CSS in the page rather than touching a shipped file, so it proves the grid rule
// is load-bearing rather than merely present. column-manager's trailing box (the "All" toggle
// plus the close) is wider than the leading slot's old fixed 44px, which is exactly the asymmetry
// the report measured.
window.__shellHeaderCenteringNegativeControl = (scenario) => {
  const style = document.createElement("style");
  style.textContent = [
    ".obnotion-shell-header { display: flex !important; justify-content: flex-start !important; }",
    ".obnotion-shell-header-leading { display: inline-flex !important; flex: 0 0 auto !important; min-width: 44px !important; }",
    ".obnotion-shell-header .obnotion-panel-title { flex: 1 1 auto !important; }",
    ".obnotion-shell-header-trailing { flex: 0 0 auto !important; justify-self: auto !important; }",
  ].join(" ");
  document.head.appendChild(style);
  let broken = null;
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    if (sheet) {
      const measured = measureTitleCenter(sheet);
      if (measured.titleFound) broken = measured.delta;
    }
  });
  style.remove();
  let fixed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    if (sheet) {
      const measured = measureTitleCenter(sheet);
      if (measured.titleFound) fixed = measured.delta;
    }
  });
  return { broken, fixed };
};

const pxToNumber = (value) => Number.parseFloat(value) || 0;

// Read off computed style rather than getBoundingClientRect: the sheet's entrance plays a
// transform, which moves the painted box without moving the left/right/bottom/border-radius
// values the frame shape actually sets, so a rect read mid-entrance would measure the
// animation, not the shape. Every registered scenario mounts and measures within one render pass
// with no intervening frame, exactly like every other check in this file — the animation plays
// after, never before, the callback below runs.
const measureFrameShape = (sheet) => {
  const style = getComputedStyle(sheet);
  return {
    floating: sheet.classList.contains("obnotion-sheet-floating"),
    // The CSS left/right/bottom properties on a position: fixed element ARE the inset
    // from that edge already — no viewport arithmetic needed to read them as insets.
    left: pxToNumber(style.left),
    right: pxToNumber(style.right),
    bottom: pxToNumber(style.bottom),
    topLeftRadius: pxToNumber(style.borderTopLeftRadius),
    bottomLeftRadius: pxToNumber(style.borderBottomLeftRadius),
  };
};

window.__sheetFrameShape = (scenario) => {
  let out = { mounted: false };
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    if (!sheet) return;
    out = { mounted: true, sheetFound: true, ...measureFrameShape(sheet) };
  });
  return out;
};

// The negative control neutralises the shape rule itself — the CSS mobile-bottom-sheet.ts's
// classifier depends on — rather than the class the ResizeObserver toggles, so it proves the
// GEOMETRY is load-bearing even on a surface the classifier still (correctly) calls floating.
window.__sheetFrameShapeNegativeControl = (scenario) => {
  const style = document.createElement("style");
  style.textContent = ".obnotion-mobile-bottom-sheet.obnotion-sheet-floating { left: 0 !important; right: 0 !important; bottom: 0 !important; border-radius: 8px 8px 0 0 !important; }";
  document.head.appendChild(style);
  let broken = null;
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    if (sheet) broken = measureFrameShape(sheet);
  });
  style.remove();
  let fixed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    if (sheet) fixed = measureFrameShape(sheet);
  });
  return { broken, fixed };
};

const measureEdgeControl = (sheet) => {
  const close = sheet?.querySelector(".obnotion-sheet-close");
  if (!close) return null;
  const rect = close.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
};

window.__shellEdgeControlToken = (scenario) => {
  let measured = null;
  runRenderAssertions(document.body, scenario, "", () => {
    measured = measureEdgeControl(mountedSheet());
  });
  return measured;
};

// The negative control overrides the token itself, not the rule that reads it, so a close
// control still hardcoding 44px somewhere else would stay green here while failing the plain
// measurement above — the pairing is what proves there is one declared value, not a literal
// that happens to agree with it today.
window.__shellEdgeControlTokenNegativeControl = (scenario, overridePx) => {
  const style = document.createElement("style");
  // Overridden on .obnotion-surface, not :root: the sheet panel carries that class itself
  // (mobile-bottom-sheet.ts), which is where the token is actually declared (styles.css), so an
  // ancestor-scoped override would only ever reach an element nothing inherits it FROM — a
  // custom property re-declared at the element itself always wins over one merely inherited.
  style.textContent = ".obnotion-surface { --obnotion-shell-edge-control-size: " + overridePx + "px !important; }";
  document.head.appendChild(style);
  let broken = null;
  runRenderAssertions(document.body, scenario, "", () => {
    broken = measureEdgeControl(mountedSheet());
  });
  style.remove();
  let fixed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    fixed = measureEdgeControl(mountedSheet());
  });
  return { broken, fixed };
};

// Read off the scrim's own computed style, not the sheet's: the scrim is the element the
// entrance duration is declared on (\`.obnotion-mobile-sheet-scrim\`, styles.css), and it is built by
// \`applySheetChrome\` for every mounted phone sheet — the shell's own engine call, not a
// per-surface choice. \`getComputedStyle().animationDuration\` always reports seconds
// ("0.26s"), never the declared unit, so the caller converts. \`.at(-1)\`, not the first match:
// earlier checks in this lane leave their own mounted sheets and scrims behind in the document,
// exactly like \`newestSheet\` below has to account for.
const measureMotionBand = () => {
  const scrims = document.querySelectorAll(".obnotion-mobile-sheet-scrim");
  const scrim = scrims[scrims.length - 1];
  if (!scrim) return null;
  const seconds = Number.parseFloat(getComputedStyle(scrim).animationDuration) || 0;
  return Math.round(seconds * 1000);
};

window.__shellMotionBand = (scenario) => {
  let measuredMs = null;
  runRenderAssertions(document.body, scenario, "", () => {
    measuredMs = measureMotionBand();
  });
  return measuredMs;
};

// The negative control overrides the token itself (\`--obnotion-sheet-enter\`), not a hardcoded
// duration, so a scrim that hardcoded 260ms somewhere else would stay green here while failing
// the plain measurement above — same pairing argument the edge-control-token control above
// makes. Overridden on \`.obnotion-mobile-sheet-scrim\`, not \`:root\`, for the identical reason the
// edge-control-token control scopes to \`.obnotion-surface\`: \`--obnotion-sheet-enter\` is declared directly
// on \`.obnotion-mobile-sheet-scrim\` itself (styles.css's shared token block, one selector among
// several), not merely inherited from \`:root\` — a \`:root\` override only ever reaches an
// element nothing inherits it FROM, and this element declares its own copy.
window.__shellMotionBandNegativeControl = (scenario, overrideMs) => {
  const style = document.createElement("style");
  style.textContent = ".obnotion-mobile-sheet-scrim { --obnotion-sheet-enter: " + overrideMs + "ms !important; }";
  document.head.appendChild(style);
  let broken = null;
  runRenderAssertions(document.body, scenario, "", () => {
    broken = measureMotionBand();
  });
  style.remove();
  let fixed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    fixed = measureMotionBand();
  });
  return { broken, fixed };
};

// The exit half of the same token pair -- --obnotion-sheet-exit, read the identical way but off the
// scrim's own exit class (playSheetExit/setScrim, mobile-bottom-sheet.ts) rather than its
// mount state, since the exit animation only declares itself once that class is present.
const measureMotionExitBand = () => {
  const scrims = document.querySelectorAll(".obnotion-mobile-sheet-scrim");
  const scrim = scrims[scrims.length - 1];
  if (!scrim) return null;
  scrim.classList.add("obnotion-overlay-exit");
  const seconds = Number.parseFloat(getComputedStyle(scrim).animationDuration) || 0;
  scrim.classList.remove("obnotion-overlay-exit");
  return Math.round(seconds * 1000);
};

window.__shellMotionExitBand = (scenario) => {
  let measuredMs = null;
  runRenderAssertions(document.body, scenario, "", () => {
    measuredMs = measureMotionExitBand();
  });
  return measuredMs;
};

window.__shellMotionExitBandNegativeControl = (scenario, overrideMs) => {
  const style = document.createElement("style");
  style.textContent = ".obnotion-mobile-sheet-scrim { --obnotion-sheet-exit: " + overrideMs + "ms !important; }";
  document.head.appendChild(style);
  let broken = null;
  runRenderAssertions(document.body, scenario, "", () => {
    broken = measureMotionExitBand();
  });
  style.remove();
  let fixed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    fixed = measureMotionExitBand();
  });
  return { broken, fixed };
};

// No lane row asserted the scrim's own colour before this one -- only its animation-duration
// (the motion band above). getComputedStyle always resolves the custom property inside the
// rgba() to a concrete number, so the alpha channel is read off the string it produces.
const measureScrimAlpha = () => {
  const scrims = document.querySelectorAll(".obnotion-mobile-sheet-scrim");
  const scrim = scrims[scrims.length - 1];
  if (!scrim) return null;
  const match = getComputedStyle(scrim).backgroundColor.match(/rgba?\\(([^)]+)\\)/);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => part.trim());
  return parts.length >= 4 ? Number.parseFloat(parts[3]) : 1;
};

window.__shellScrimAlpha = (scenario) => {
  let measured = null;
  runRenderAssertions(document.body, scenario, "", () => {
    measured = measureScrimAlpha();
  });
  return measured;
};

window.__shellScrimAlphaNegativeControl = (scenario, overrideAlpha) => {
  const style = document.createElement("style");
  style.textContent = ".obnotion-mobile-sheet-scrim { --obnotion-sheet-scrim-alpha-page: " + overrideAlpha + " !important; }";
  document.head.appendChild(style);
  let broken = null;
  runRenderAssertions(document.body, scenario, "", () => {
    broken = measureScrimAlpha();
  });
  style.remove();
  let fixed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    fixed = measureScrimAlpha();
  });
  return { broken, fixed };
};

// A menu-role card's own band, distinct from the sheet page band above -- real createSurfaceShell,
// a real role="menu" declaration, the same call any panel-role DbModal subclass makes.
window.__shellMenuScrimAlpha = () => {
  clearStrayOverlays();
  const standIn = createHostModalStandIn();
  const shell = createSurfaceShell({ presentation: "sheet", element: standIn.modalEl, close: () => shell.destroy(), title: "Menu", role: "menu" });
  shell.apply();
  const alpha = measureScrimAlpha();
  shell.destroy();
  if (standIn.container.isConnected) standIn.container.remove();
  return alpha;
};

// The stacked parent's own theme-scoped filter: a plain two-deep stack (any role -- is-stack-
// parent is toggled by stack position alone, mobile-bottom-sheet.ts's syncSheetStack, never by
// role) is enough to mark the bottom sheet is-stack-parent, exactly as the depth-cap checks above
// build their own parent/child pair.
const mountStackParentPair = () => {
  clearStrayOverlays();
  const parent = createHostModalStandIn();
  const parentShell = createSurfaceShell({ presentation: "sheet", element: parent.modalEl, close: () => parentShell.destroy(), title: "Parent", role: "dialog" });
  parentShell.apply();
  const child = createHostModalStandIn();
  const childShell = createSurfaceShell({ presentation: "sheet", element: child.modalEl, close: () => childShell.destroy(), title: "Child", role: "dialog" });
  childShell.apply();
  const teardown = () => {
    childShell.destroy();
    parentShell.destroy();
    for (const standIn of [parent, child]) {
      if (standIn.container.isConnected) standIn.container.remove();
    }
  };
  return { parentEl: parent.modalEl, teardown };
};

// The class toggle that marks a parent is-stack-parent runs on an already-painted element (the
// parent was on screen alone before the child arrived), and both \`opacity\` and \`filter\` carry a
// \`transition\` at \`--obnotion-motion-surface\` (200ms). Reading computed style before that transition
// has finished returns an interpolated mid-transition value, not the target — two frames
// (\`waitForStackSettle\`) is long enough for the class toggle itself to commit but not for a
// 200ms transition to finish, so this waits out the transition's own declared duration instead.
const waitStackParentTransition = () => new Promise((resolve) => { window.setTimeout(resolve, 260); });

window.__shellStackParentFilter = async () => {
  const { parentEl, teardown } = mountStackParentPair();
  await waitStackParentTransition();
  const darkFilter = getComputedStyle(parentEl).filter;
  document.body.classList.remove("theme-dark");
  await waitStackParentTransition();
  const lightFilter = getComputedStyle(parentEl).filter;
  document.body.classList.add("theme-dark");
  teardown();
  return { darkFilter, lightFilter };
};

window.__shellStackParentFilterNegativeControl = async () => {
  const style = document.createElement("style");
  style.textContent = ".obnotion-mobile-bottom-sheet.is-stack-parent.is-stack-parent { filter: none !important; }";
  document.head.appendChild(style);
  const broken = mountStackParentPair();
  await waitStackParentTransition();
  document.body.classList.remove("theme-dark");
  await waitStackParentTransition();
  const brokenLightFilter = getComputedStyle(broken.parentEl).filter;
  document.body.classList.add("theme-dark");
  broken.teardown();
  style.remove();
  const fixed = mountStackParentPair();
  await waitStackParentTransition();
  document.body.classList.remove("theme-dark");
  await waitStackParentTransition();
  const fixedLightFilter = getComputedStyle(fixed.parentEl).filter;
  document.body.classList.add("theme-dark");
  fixed.teardown();
  return { brokenLightFilter, fixedLightFilter };
};

// The 44px accessibility floor a phone menu row must clear, against the 30px the row's own
// unscoped base rule ships everywhere else. Measured on a live row's own rect, not the class.
// The newest match, not the first: earlier scenarios in this same lane can leave their own
// mounted sheets behind in the document, exactly like measureMotionBand's own .at(-1) accounts for.
const measureRowPitch = () => {
  const rows = document.querySelectorAll(".obnotion-mobile-bottom-sheet .obnotion-menu-item");
  const row = rows[rows.length - 1];
  return row ? row.getBoundingClientRect().height : null;
};

window.__shellRowPitch = (scenario) => {
  let measured = null;
  runRenderAssertions(document.body, scenario, "", () => {
    measured = measureRowPitch();
  });
  return measured;
};

window.__shellRowPitchNegativeControl = (scenario) => {
  const style = document.createElement("style");
  style.textContent = "body.is-phone .obnotion-container .obnotion-menu-item { min-height: 30px !important; }";
  document.head.appendChild(style);
  let broken = null;
  runRenderAssertions(document.body, scenario, "", () => {
    broken = measureRowPitch();
  });
  style.remove();
  let fixed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    fixed = measureRowPitch();
  });
  return { broken, fixed };
};

// The primary-action pill: mounted into a real, chromed sheet body (a panel-role
// \`createSurfaceShell\` consumer, the same call any future producer would make) rather than a
// bare div, so the measured width answers to the same content width any real host gives it, not
// a number picked to make the assertion easy.
const mountShellHost = (title) => {
  const standIn = createHostModalStandIn();
  let shellRef;
  shellRef = createSurfaceShell({
    presentation: "sheet",
    element: standIn.modalEl,
    close: () => shellRef.destroy(),
    title,
    role: "panel",
  });
  shellRef.apply();
  return {
    contentEl: standIn.contentEl,
    teardown: () => {
      shellRef.destroy();
      if (standIn.container.isConnected) standIn.container.remove();
    },
  };
};

const measurePrimaryActionPill = () => {
  const host = mountShellHost("Add relation");
  const pill = buildPrimaryActionPill(host.contentEl, { text: "Create", disabled: true, onClick: () => {} });
  const pillRect = pill.getBoundingClientRect();
  const contentRect = host.contentEl.getBoundingClientRect();
  const style = getComputedStyle(pill);
  const result = {
    width: pillRect.width,
    height: pillRect.height,
    marginLeft: Number.parseFloat(style.marginLeft),
    marginRight: Number.parseFloat(style.marginRight),
    hostWidth: contentRect.width,
    disabled: pill.disabled,
  };
  host.teardown();
  return result;
};

window.__shellPrimaryActionPill = () => measurePrimaryActionPill();

window.__shellPrimaryActionPillNegativeControl = () => {
  const style = document.createElement("style");
  style.textContent = ".obnotion-shell-primary-pill { height: 30px !important; }";
  document.head.appendChild(style);
  const broken = measurePrimaryActionPill();
  style.remove();
  const fixed = measurePrimaryActionPill();
  return { broken, fixed };
};

// The header chip: \`.obnotion-container .obnotion-shell-header-chip\` is the only declared rule
// for its size, so it needs a \`.obnotion-container\`-classed ancestor to read at all — the same
// ancestor a real chromed sheet's own \`setSheetMount\` already adds, reused via \`mountShellHost\`
// rather than a bare div carrying the class for no other reason than to satisfy the selector.
const measureHeaderChip = () => {
  const host = mountShellHost("Choose template");
  const chip = buildShellHeaderChip(host.contentEl, { icon: "plus", label: "Add", onClick: () => {} });
  const rect = chip.getBoundingClientRect();
  const result = { width: rect.width, height: rect.height };
  host.teardown();
  return result;
};

window.__shellHeaderChip = () => measureHeaderChip();

window.__shellHeaderChipNegativeControl = () => {
  const style = document.createElement("style");
  style.textContent = ".obnotion-container .obnotion-shell-header-chip { width: 30px !important; height: 30px !important; }";
  document.head.appendChild(style);
  const broken = measureHeaderChip();
  style.remove();
  const fixed = measureHeaderChip();
  return { broken, fixed };
};

// The header block: the frame's own top edge to the first row below the header, on a real
// registered surface rather than a producer — every close-button sheet owes this shape, not one
// component. \`header\`'s own next element sibling is the first row, the same \`bodyHost\` reach
// \`measureStackedPair\` above uses for the background-match check.
const measureHeaderBlock = () => {
  const sheets = document.querySelectorAll(".obnotion-mobile-bottom-sheet");
  const sheet = sheets[sheets.length - 1];
  if (!sheet) return null;
  const header = sheet.querySelector(".obnotion-panel-header");
  const firstRow = header ? header.nextElementSibling : null;
  if (!header || !firstRow) return null;
  const sheetTop = sheet.getBoundingClientRect().top;
  const firstRowTop = firstRow.getBoundingClientRect().top;
  return firstRowTop - sheetTop;
};

window.__shellHeaderBlock = (scenario) => {
  let measured = null;
  runRenderAssertions(document.body, scenario, "", () => {
    measured = measureHeaderBlock();
  });
  return measured;
};

window.__shellHeaderBlockNegativeControl = (scenario) => {
  const style = document.createElement("style");
  // The value this margin shipped with before it was ever swept against a real hit-test.
  style.textContent = ".obnotion-mobile-bottom-sheet > .obnotion-panel-header:has(.obnotion-sheet-close) { margin-top: 20px !important; }";
  document.head.appendChild(style);
  let broken = null;
  runRenderAssertions(document.body, scenario, "", () => {
    broken = measureHeaderBlock();
  });
  style.remove();
  let fixed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    fixed = measureHeaderBlock();
  });
  return { broken, fixed };
};

// The handle's own rect: 34 x 5pt at a 6pt drop below the sheet's own top edge. hasSheetHandle
// (sheet-grammar.ts) checks existence and drag only and cannot see any of the three numbers.
const measureHandleGeometry = () => {
  const sheets = document.querySelectorAll(".obnotion-mobile-bottom-sheet");
  const sheet = sheets[sheets.length - 1];
  if (!sheet) return null;
  const handle = sheet.querySelector(".obnotion-mobile-bottom-sheet-handle");
  if (!handle) return null;
  const sheetRect = sheet.getBoundingClientRect();
  const handleRect = handle.getBoundingClientRect();
  // The drop the handle's own CSS margin controls is measured from the sheet's CONTENT edge, not
  // its border edge -- several registered sheets carry the desktop anchored popover's own
  // container padding on top, which is a fact about that padding, not about the handle.
  const paddingTop = Number.parseFloat(getComputedStyle(sheet).paddingTop) || 0;
  return {
    width: handleRect.width,
    height: handleRect.height,
    drop: handleRect.top - sheetRect.top - paddingTop,
  };
};

// The sheet is still mid-entrance (translated below the fold) the instant it mounts. settleSheetGeometry
// is this lane's own resting wait -- an identity transform plus two stable frames -- reused rather
// than a second, ad hoc wait invented for this one row.
window.__shellHandleGeometry = (scenario) => new Promise((resolve) => {
  runRenderAssertions(document.body, scenario, "", async () => {
    const panel = newestSheet();
    const settled = panel ? await settleSheetGeometry(panel) : false;
    resolve(measureHandleGeometry());
  });
});

// The settings sheet's reference row grammar, on the phone. Rows come in two shapes. A plain
// setting — one label, one control, nothing else, no hint of any kind — answers the reference
// list's questions: the control sits on the label's own line, consecutive plain rows that are
// also element-adjacent sit a 44-52px pitch apart, and a row whose previous element sibling is
// another row draws a 1px hairline inset 16px from the sheet's left edge and 0px from its right.
// A wide editor row (a field-stack) keeps the stacked control-below-label shape and is probed
// only for the control width that shape exists to give. Raw geometry only; thresholds are
// applied by the node-side caller, the split the rows above already use.
const isSettingsPlainRow = (row) =>
  row.querySelector(":scope > .obnotion-view-config-field-stack") == null &&
  row.querySelector("textarea") == null &&
  row.querySelector(".obnotion-new-placement-option") == null &&
  row.querySelector(".obnotion-conditional-format-settings") == null &&
  row.querySelector(".obnotion-panel-hint") == null;
const isSettingsStackRow = (row) => row.querySelector(":scope > .obnotion-view-config-field-stack") != null;

const measureSettingsRowGrammar = () => {
  const sheet = document.querySelector(".obnotion-view-config-panel.obnotion-mobile-bottom-sheet");
  if (!sheet) return null;
  const sheetRect = sheet.getBoundingClientRect();
  const rows = [];
  const byEl = new Map();
  const rowEls = Array.from(sheet.querySelectorAll(".obnotion-panel-row"));
  for (const row of rowEls) {
    const label = row.querySelector(":scope > .obnotion-view-config-label");
    const field = row.querySelector(":scope > .obnotion-view-config-field");
    if (!label || !field) continue;
    const rowStyle = getComputedStyle(row);
    const rowRect = row.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    const fieldRect = field.getBoundingClientRect();
    const dividerStyle = getComputedStyle(row, "::before");
    const rowInnerWidth = row.clientWidth
      - (Number.parseFloat(rowStyle.paddingLeft) || 0)
      - (Number.parseFloat(rowStyle.paddingRight) || 0);
    const prev = row.previousElementSibling;
    const record = {
      plain: isSettingsPlainRow(row),
      stack: isSettingsStackRow(row),
      direction: rowStyle.flexDirection,
      sameLine:
        Math.abs((labelRect.top + labelRect.height / 2) - (fieldRect.top + fieldRect.height / 2)) <= 4 &&
        fieldRect.right <= rowRect.right - (Number.parseFloat(rowStyle.paddingRight) || 0) + 1 &&
        labelRect.left >= rowRect.left + (Number.parseFloat(rowStyle.paddingLeft) || 0) - 1,
      fieldWidth: fieldRect.width,
      rowWidth: rowRect.width,
      rowInnerWidth,
      paddingLeft: Number.parseFloat(rowStyle.paddingLeft) || 0,
      pitchToNextPlain: null,
      divider: dividerStyle.content === "none" ? null : {
        height: Number.parseFloat(dividerStyle.height) || 0,
        left: Number.parseFloat(dividerStyle.left) || 0,
        right: Number.parseFloat(dividerStyle.right) || 0,
        width: Number.parseFloat(dividerStyle.width) || 0,
        color: dividerStyle.backgroundColor,
      },
      dividerExpected: prev != null && prev.classList.contains("obnotion-panel-row"),
    };
    rows.push(record);
    byEl.set(row, record);
  }
  // The pitch: only between consecutive plain rows that are also element-adjacent — a hint or a
  // note between two rows is the reference's own variation, not a pitch this grammar answers for.
  for (let i = 0; i + 1 < rowEls.length; i += 1) {
    const a = rowEls[i];
    const b = rowEls[i + 1];
    if (a.nextElementSibling !== b) continue;
    if (!isSettingsPlainRow(a) || !isSettingsPlainRow(b)) continue;
    const record = byEl.get(a);
    if (record) record.pitchToNextPlain = b.getBoundingClientRect().top - a.getBoundingClientRect().top;
  }
  const sections = [];
  for (const title of sheet.querySelectorAll(".obnotion-view-config-section-title")) {
    const style = getComputedStyle(title);
    const dividerStyle = getComputedStyle(title, "::before");
    sections.push({
      paddingLeft: Number.parseFloat(style.paddingLeft) || 0,
      divider: dividerStyle.content === "none" ? null : {
        height: Number.parseFloat(dividerStyle.height) || 0,
        left: Number.parseFloat(dividerStyle.left) || 0,
        right: Number.parseFloat(dividerStyle.right) || 0,
        color: dividerStyle.backgroundColor,
      },
      dividerExpected: title.previousElementSibling != null,
    });
  }
  return {
    rows,
    sections,
    nativeSelectCount: sheet.querySelectorAll("select").length,
    sheetScrollWidth: sheet.scrollWidth,
    // The shared extent rule the sideways-overflow sweep itself uses: the sheet's own
    // 1px left border is not sideways scroll. That border resolves once the
    // border-subtle token carries its definition-site fallback, so a raw scrollWidth
    // reads 1px past clientWidth by construction; the extent is the honest comparison.
    sheetScrollExtent:
      sheet.scrollWidth - (Number.parseFloat(getComputedStyle(sheet).borderLeftWidth) || 0),
    sheetClientWidth: sheet.clientWidth,
  };
};

window.__shellSettingsRowGrammar = (scenario) => {
  let measured = null;
  runRenderAssertions(document.body, scenario, "", () => {
    measured = measureSettingsRowGrammar();
  });
  return measured;
};

window.__shellSettingsRowGrammarNegativeControl = (scenario) => {
  const style = document.createElement("style");
  // The reference row grammar, reverted: the plain rows go back to the stacked control-below-label
  // shape, the old 6px pitch cushion comes back doubled, the inset hairlines vanish, and the
  // section heading's inset returns to its pre-alignment 12px.
  style.textContent =
    ".obnotion-view-config-panel.obnotion-mobile-bottom-sheet .obnotion-panel-row:not(:has(> .obnotion-view-config-field-stack)) { flex-direction: column !important; align-items: stretch !important; margin-bottom: 12px !important; }" +
    ".obnotion-view-config-panel.obnotion-mobile-bottom-sheet .obnotion-panel-row::before, .obnotion-view-config-panel.obnotion-mobile-bottom-sheet .obnotion-view-config-section-title::before { content: none !important; }" +
    ".obnotion-view-config-panel.obnotion-mobile-bottom-sheet .obnotion-view-config-section-title { padding-left: 12px !important; }";
  document.head.appendChild(style);
  let broken = null;
  runRenderAssertions(document.body, scenario, "", () => {
    broken = measureSettingsRowGrammar();
  });
  style.remove();
  let fixed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    fixed = measureSettingsRowGrammar();
  });
  return { broken, fixed };
};

// The compact half's own control: every row forced back onto the shared column grammar. The
// editor rows already read this direction, so what goes red here is exactly the one-line,
// label-left/control-right shape the compact rows are supposed to carry.
window.__shellSettingsRowGrammarColumnControl = (scenario) => {
  const style = document.createElement("style");
  style.textContent = ".obnotion-view-config-panel.obnotion-mobile-bottom-sheet .obnotion-panel-row { flex-direction: column !important; }";
  document.head.appendChild(style);
  let broken = null;
  runRenderAssertions(document.body, scenario, "", () => {
    broken = measureSettingsRowStacking();
  });
  style.remove();
  return broken;
};

// The record sheet's row grammar — the same reference shape the settings sheet asserts, inherited
// onto this family: one property per row, label left / value right on one line, inside the 44-52px
// pitch window, everything on the sheet's shared 16px inset, a hairline under every row but the
// last, section headings that sit on the same inset behind their own 1px divider, and no native
// select (the pickers here are the sheet's own stacked menus — the select-value pair in the
// stacked-pair rows proves the menu half; this row proves the native half stayed absent).
const measureRecordRowGrammar = () => {
  const sheet = document.querySelector(".obnotion-record-detail-panel.obnotion-mobile-bottom-sheet");
  if (!sheet) return null;
  // The disclosure defaults to collapsed, and a collapsed subtree measures zeros — so a mount that
  // hid it would otherwise read its section headings as sitting at 0,0 rather than skip them. The
  // panel's own expanded state is what a reader sees, so the measurement reads it expanded.
  const disclosureToggle = sheet.querySelector(":scope > .obnotion-record-detail-scroll .obnotion-record-detail-hidden-toggle");
  if (disclosureToggle && disclosureToggle.getAttribute("aria-expanded") === "false") disclosureToggle.click();
  const sheetRect = sheet.getBoundingClientRect();
  // The sheet's own 1px left border counts into its border box but not into its content: the
  // inset the rows answer to is measured from the content edge, the same side the extent reads
  // from — a border-box left edge would book the border as inset and read 1px more than the
  // sheet actually gives its rows.
  const sheetContentLeft = sheetRect.left + (Number.parseFloat(getComputedStyle(sheet).borderLeftWidth) || 0);
  const rows = [];
  for (const row of sheet.querySelectorAll(".obnotion-record-detail-field")) {
    const label = row.querySelector(":scope > .obnotion-record-detail-field-label");
    const value = row.querySelector(":scope > .obnotion-board-card-value");
    if (!label || !value) continue;
    const labelRect = label.getBoundingClientRect();
    const valueRect = value.getBoundingClientRect();
    // A wrapped note, a chip block or a colour stack reads as its own editor: exempt from the
    // one-line pitch window exactly the way the settings sheet's editor rows are.
    const compact = valueRect.height <= 30;
    const oneLine = valueRect.top <= labelRect.bottom - 2 && labelRect.top <= valueRect.bottom - 2;
    rows.push({
      compact,
      oneLine,
      inset: labelRect.left - sheetContentLeft,
      rowHeight: row.getBoundingClientRect().height,
      borderBottomWidth: getComputedStyle(row).borderBottomWidth,
    });
  }
  const lastRow = sheet.querySelector(".obnotion-record-detail-fields > .obnotion-record-detail-field:last-child");
  const sectionHeaders = Array.from(sheet.querySelectorAll(".obnotion-record-detail-hidden-section-header")).map((header) => {
    const rect = header.getBoundingClientRect();
    return { inset: rect.left - sheetContentLeft, borderTopWidth: getComputedStyle(header).borderTopWidth };
  });
  // Same extent rule the sweep and the settings sheet use: the sheet's own 1px left border is not
  // sideways scroll.
  const sheetScrollExtent = sheet.scrollWidth - (Number.parseFloat(getComputedStyle(sheet).borderLeftWidth) || 0);
  return {
    rows,
    inset: rows.length > 0 ? rows[0].inset : null,
    lastRowBorderBottom: lastRow ? getComputedStyle(lastRow).borderBottomWidth : null,
    sectionHeaders,
    selectCount: sheet.querySelectorAll("select").length,
    sheetPaddingLeft: Number.parseFloat(getComputedStyle(sheet).paddingLeft),
    sheetScrollWidth: sheet.scrollWidth,
    sheetScrollExtent,
    sheetClientWidth: sheet.clientWidth,
  };
};

window.__shellRecordRowGrammar = (scenario) => {
  let measured = null;
  runRenderAssertions(document.body, scenario, "", () => {
    measured = measureRecordRowGrammar();
  });
  return measured;
};

// The shared inset and the 44px row floor, reverted together: the two declarations this grammar
// reads. What comes back red is exactly the one-line, inset, 44px shape; removing the override
// restores it — the same question the negative controls above ask their own targets.
window.__shellRecordRowGrammarNegativeControl = (scenario) => {
  const style = document.createElement("style");
  style.textContent = ".obnotion-record-detail-panel.obnotion-mobile-bottom-sheet { padding-inline: 0 !important; } "
    + ".obnotion-record-detail-panel.obnotion-mobile-bottom-sheet .obnotion-record-detail-field { min-height: 0 !important; padding: 2px 6px !important; }";
  document.head.appendChild(style);
  let broken = null;
  runRenderAssertions(document.body, scenario, "", () => {
    broken = measureRecordRowGrammar();
  });
  style.remove();
  let fixed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    fixed = measureRecordRowGrammar();
  });
  return { broken, fixed };
};

// The placement-button ink guard. Raw scrollWidth/clientWidth/overflowX per button, scoped
// to exactly the buttons this sheet draws — the node-side caller applies the same predicate a
// wider, document-wide sweep already tried and reverted, here with nothing else in scope to
// misfire on.
const measureSettingsPlacementInk = () => {
  const sheet = document.querySelector(".obnotion-view-config-panel.obnotion-mobile-bottom-sheet");
  if (!sheet) return null;
  const buttons = Array.from(sheet.querySelectorAll(".obnotion-new-placement-option"));
  if (buttons.length === 0) return null;
  return buttons.map((button) => ({
    scrollWidth: button.scrollWidth,
    clientWidth: button.clientWidth,
    overflowX: getComputedStyle(button).overflowX,
  }));
};

window.__shellSettingsPlacementInk = (scenario, fontSizePx) => {
  const style = document.createElement("style");
  style.textContent = ".obnotion-view-config-panel.obnotion-mobile-bottom-sheet .obnotion-new-placement-option { font-size: " + fontSizePx + "px !important; }";
  document.head.appendChild(style);
  let measured = null;
  runRenderAssertions(document.body, scenario, "", () => {
    measured = measureSettingsPlacementInk();
  });
  style.remove();
  return measured;
};

window.__shellSettingsPlacementInkNegativeControl = (scenario, fontSizePx) => {
  // The three properties a bare \`<button>\` carries under the host model this page now links
  // (\`tools/screenshots/host-bare-controls.css\`), read live off the cascade rather than
  // hand-copied: a probe with no other class picks up exactly what that shared file declares, so
  // this override can never drift from it even if the file's values change.
  const probe = document.createElement("button");
  document.body.appendChild(probe);
  const hostRules = getComputedStyle(probe);
  const hostWhiteSpace = hostRules.whiteSpace;
  const hostJustifyContent = hostRules.justifyContent;
  const hostHeight = hostRules.height;
  probe.remove();

  const brokenStyle = document.createElement("style");
  // The placement-button wrap rule, reverted: the three host button declarations the shipped fix
  // answered — nowrap, centred, a fixed height — reinstated on exactly this selector so the
  // sentence-length option cannot wrap again.
  brokenStyle.textContent = ".obnotion-view-config-panel.obnotion-mobile-bottom-sheet .obnotion-new-placement-option { font-size: " + fontSizePx + "px !important; white-space: " + hostWhiteSpace + " !important; justify-content: " + hostJustifyContent + " !important; height: " + hostHeight + " !important; }";
  document.head.appendChild(brokenStyle);
  let broken = null;
  runRenderAssertions(document.body, scenario, "", () => {
    broken = measureSettingsPlacementInk();
  });
  brokenStyle.remove();
  const fixedStyle = document.createElement("style");
  fixedStyle.textContent = ".obnotion-view-config-panel.obnotion-mobile-bottom-sheet .obnotion-new-placement-option { font-size: " + fontSizePx + "px !important; }";
  document.head.appendChild(fixedStyle);
  let fixed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    fixed = measureSettingsPlacementInk();
  });
  fixedStyle.remove();
  return { broken, fixed };
};
// The panel sheets' reference row grammar — filter, sort and group, the three sheets the
// toolbar's own trigger row opens. They present as one family, so they share the settings
// sheet's row thresholds: every row inside the 44–52px window (which is the one-setting-per-line
// clause — a wrapped condition measures two lines and breaks the ceiling), the sheet's one
// horizontal inset on the panel, a section introducing its rows through a 1px divider on that
// same inset, the plugin's own picker (no native select), and no sideways scroll — measured as
// the extent, because the sheet's own 1px left border counts in scrollWidth but is not sideways
// scroll. One surface mounts per runRenderAssertions call, so the target list resolves whichever
// of the three this run actually mounted.
const PANEL_SHEET_TARGETS = [
  ["filter", ".obnotion-filter-panel.obnotion-mobile-bottom-sheet"],
  ["sort", ".obnotion-sort-panel.obnotion-mobile-bottom-sheet"],
  ["group", ".obnotion-group-popover.obnotion-mobile-bottom-sheet"],
];
const measurePanelSheetGrammar = () => {
  const found = PANEL_SHEET_TARGETS.map(([name, sheetSelector]) => [name, document.querySelector(sheetSelector)]).find((entry) => entry[1]);
  if (!found) return null;
  const [name, sheet] = found;
  const sheetStyle = window.getComputedStyle(sheet);
  const rows = [];
  for (const row of sheet.querySelectorAll(".obnotion-panel-row, .obnotion-group-popover-row")) {
    if (row.classList.contains("obnotion-active-rule-editor-row")) continue; // the chip rail's compact editor is its own grammar
    if (row.closest(".obnotion-add-view-form")) continue; // the Add view's zero-padding grid, the same documented exception the padded-rows predicate takes
    const rowRect = row.getBoundingClientRect();
    if (rowRect.height === 0) continue;
    const label = row.querySelector(":scope > .obnotion-menu-item-label, :scope > .obnotion-view-config-label");
    const control = row.querySelector(":scope > .obnotion-toggle-switch, :scope > input, :scope > .obnotion-menu-item-check");
    const labelRect = label ? label.getBoundingClientRect() : null;
    const controlRect = control ? control.getBoundingClientRect() : null;
    rows.push({
      height: Number(rowRect.height.toFixed(2)),
      width: Number(rowRect.width.toFixed(2)),
      // The reference pairs a row's control at its far edge: control right of the label's END,
      // not merely of its start. Rows without both parties (a condition's controls, a bare
      // picker) have no second party to this clause and skip it.
      controlRightOfLabel: labelRect && controlRect ? controlRect.right >= labelRect.right - 2 : null,
    });
  }
  const sectionTitles = Array.from(sheet.querySelectorAll(".obnotion-group-popover-section-title")).map((title) => {
    const titleStyle = window.getComputedStyle(title);
    return {
      paddingLeft: Number.parseFloat(titleStyle.paddingLeft),
      paddingRight: Number.parseFloat(titleStyle.paddingRight),
      borderTopWidth: titleStyle.borderTopWidth,
      borderTopColor: titleStyle.borderTopColor,
    };
  });
  // When the sheet scrolls without any past-edge offender, the excess is a margin tail: the
  // farthest margin edge from the scroll origin names the rule, because scrollWidth runs from
  // that origin to the farthest scrolled margin edge.
  let farthestChild = null;
  for (const el of sheet.querySelectorAll("*")) {
    const childStyle = window.getComputedStyle(el);
    if (childStyle.display === "none" || childStyle.visibility === "hidden") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) continue;
    const reach = rect.right + (Number.parseFloat(childStyle.marginRight) || 0);
    if (!farthestChild || reach > farthestChild.reach) {
      farthestChild = {
        reach: Number(reach.toFixed(2)),
        width: Number(rect.width.toFixed(1)),
        marginRight: Number((Number.parseFloat(childStyle.marginRight) || 0).toFixed(1)),
        node: describeNode(el),
      };
    }
  }
  return {
    name,
    farthestChild,
    panelPaddingLeft: Number.parseFloat(sheetStyle.paddingLeft),
    panelPaddingRight: Number.parseFloat(sheetStyle.paddingRight),
    rows,
    sectionTitles,
    selectCount: sheet.querySelectorAll("select").length,
    sheetScrollWidth: sheet.scrollWidth,
    // The sheet's own 1px left border is not sideways scroll; the extent is what compares.
    sheetScrollExtent: sheet.scrollWidth - (Number.parseFloat(sheetStyle.borderLeftWidth) || 0),
    sheetClientWidth: sheet.clientWidth,
  };
};

window.__shellPanelSheetGrammar = (scenario) => {
  let measured = null;
  runRenderAssertions(document.body, scenario, "", () => {
    measured = measurePanelSheetGrammar();
  });
  return measured;
};

// A control that has never been observed red is not evidence. The inset half of the grammar
// reverted: the panel's own horizontal padding forced back to the shared 8px, so what goes red
// is exactly the 16px inset clause — the same pattern the settings sheet's controls use.
window.__shellPanelSheetGrammarControl = (scenario) => {
  const style = document.createElement("style");
  style.textContent = ".obnotion-filter-panel.obnotion-mobile-bottom-sheet, .obnotion-sort-panel.obnotion-mobile-bottom-sheet, .obnotion-group-popover.obnotion-mobile-bottom-sheet { padding-inline: 8px !important; }";
  document.head.appendChild(style);
  let broken = null;
  runRenderAssertions(document.body, scenario, "", () => {
    broken = measurePanelSheetGrammar();
  });
  style.remove();
  let fixed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    fixed = measurePanelSheetGrammar();
  });
  return { broken, fixed };
};
// The depth cap: a would-be third sheet stacked on a panel-role parent that is itself already two
// deep. Real createSurfaceShell end to end -- the same call every panel-role DbModal subclass
// makes -- rather than a hand-built stand-in of the mechanism it is proving.
// Any sheet an earlier scenario in this same page left mounted is a stray parent this test must
// not inherit -- overlayStack.clear() dismisses whatever the shared stack still holds, and the
// DOM sweep removes the backdrop and any surface a dismiss callback did not tear down itself.
const clearStrayOverlays = () => {
  overlayStack.clear();
  document.querySelectorAll(".obnotion-mobile-bottom-sheet, .obnotion-mobile-sheet-scrim").forEach((el) => el.remove());
};

window.__shellDepthCapReplace = () => {
  clearStrayOverlays();
  const grandparent = createHostModalStandIn();
  const gpShell = createSurfaceShell({ presentation: "sheet", element: grandparent.modalEl, close: () => gpShell.destroy(), title: "Grandparent", role: "panel" });
  gpShell.apply();

  const parent = createHostModalStandIn();
  const parentShell = createSurfaceShell({ presentation: "sheet", element: parent.modalEl, close: () => parentShell.destroy(), title: "Parent", role: "panel" });
  parentShell.apply();

  const beforeSheets = document.querySelectorAll(".obnotion-mobile-bottom-sheet").length;

  const child = createHostModalStandIn();
  child.contentEl.createEl("h2", { text: "Child Title" });
  const childShell = createSurfaceShell({ presentation: "sheet", element: child.modalEl, close: () => childShell.destroy(), title: "Child Title", role: "panel" });
  childShell.apply();

  const afterSheets = document.querySelectorAll(".obnotion-mobile-bottom-sheet").length;
  // Where the grafted body actually LANDS, not just where the DOM says it is. An absorbed panel
  // that the shell still placed keeps placeSheet's own inline position:fixed/left:0/right:0, so it
  // paints as a full-bleed layer over the parent it was grafted into while every structural fact
  // above still reads green -- the parent frame collapses behind it and the header this move just
  // retitled leaves the screen. Read as computed position plus containment inside the parent's own
  // rect, because those are the two things a reader of the surface would notice.
  const childStyle = getComputedStyle(child.modalEl);
  const childRect = child.modalEl.getBoundingClientRect();
  const parentRect = parent.modalEl.getBoundingClientRect();
  const result = {
    beforeSheets,
    afterSheets,
    parentHeaderTitle: parent.modalEl.querySelector(".obnotion-shell-header .obnotion-panel-title")?.textContent?.trim(),
    parentHasBack: Boolean(parent.modalEl.querySelector(".obnotion-shell-back")),
    childBecameSheet: child.modalEl.classList.contains("obnotion-mobile-bottom-sheet"),
    childGraftedIntoParent: parent.modalEl.contains(child.modalEl),
    childPosition: childStyle.position,
    childInsideParentRect: childRect.left >= parentRect.left - 0.5
      && childRect.right <= parentRect.right + 0.5
      && childRect.top >= parentRect.top - 0.5
      && childRect.bottom <= parentRect.bottom + 0.5,
    childRect: { left: childRect.left, right: childRect.right, top: childRect.top, bottom: childRect.bottom },
    parentRect: { left: parentRect.left, right: parentRect.right, top: parentRect.top, bottom: parentRect.bottom },
  };

  childShell.destroy();
  parentShell.destroy();
  gpShell.destroy();
  for (const standIn of [grandparent, parent, child]) {
    if (standIn.container.isConnected) standIn.container.remove();
  }
  return result;
};

// The negative control: the same three-deep chain, but the parent declares dialog rather than
// panel -- a role that never sets a replace callback, so the third level must stack normally.
window.__shellDepthCapReplaceNegativeControl = () => {
  clearStrayOverlays();
  const grandparent = createHostModalStandIn();
  const gpShell = createSurfaceShell({ presentation: "sheet", element: grandparent.modalEl, close: () => gpShell.destroy(), title: "Grandparent", role: "dialog" });
  gpShell.apply();

  const parent = createHostModalStandIn();
  const parentShell = createSurfaceShell({ presentation: "sheet", element: parent.modalEl, close: () => parentShell.destroy(), title: "Parent", role: "dialog" });
  parentShell.apply();

  const child = createHostModalStandIn();
  const childShell = createSurfaceShell({ presentation: "sheet", element: child.modalEl, close: () => childShell.destroy(), title: "Child", role: "dialog" });
  childShell.apply();

  const result = {
    sheetCount: document.querySelectorAll(".obnotion-mobile-bottom-sheet").length,
    childBecameSheet: child.modalEl.classList.contains("obnotion-mobile-bottom-sheet"),
  };

  childShell.destroy();
  parentShell.destroy();
  gpShell.destroy();
  for (const standIn of [grandparent, parent, child]) {
    if (standIn.container.isConnected) standIn.container.remove();
  }
  return result;
};

const waitForStackSettle = () => new Promise((resolve) => {
  requestAnimationFrame(() => requestAnimationFrame(resolve));
});

// A sheet rises into place over the shared enter duration, so its box is still moving for several
// frames after it mounts. Snapshotting the parent before that finishes measures the tail of its own
// entrance and reports it as movement the child caused. Wait for two consecutive frames at the same
// offset instead of a fixed delay, so the check does not encode the duration as a second copy.
const IDENTITY_TRANSFORMS = new Set(["none", "matrix(1, 0, 0, 1, 0, 0)"]);

const settleSheetGeometry = async (panel) => {
  let previous = null;
  let stable = 0;
  for (let frame = 0; frame < 120; frame += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    // Geometry alone is not enough: two frames before the entrance starts read the same offset as
    // two frames after it finishes, so a stability test on its own returns true at the moment the
    // sheet is still off screen. The entrance rises the panel from a translate to identity, so the
    // resolved transform is what says the animation is over; stability then says the layout is.
    const settledTransform = IDENTITY_TRANSFORMS.has(getComputedStyle(panel).transform);
    const top = panel.getBoundingClientRect().top;
    stable = previous !== null && Math.abs(top - previous) < 0.01 ? stable + 1 : 0;
    previous = top;
    if (settledTransform && stable >= 2) return true;
  }
  return false;
};

const rectSnapshot = (element) => {
  const rect = element.getBoundingClientRect();
  return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width, height: rect.height };
};

const maxRectDelta = (before, after) => Math.max(
  Math.abs(before.top - after.top),
  Math.abs(before.right - after.right),
  Math.abs(before.bottom - after.bottom),
  Math.abs(before.left - after.left),
);

const newestSheet = () => Array.from(document.body.querySelectorAll(".obnotion-mobile-bottom-sheet")).at(-1) || null;

// The anchor lives inside the parent because that is what the production opener resolves against —
// a dropdown asks its anchor which surface it belongs to. It is taken out of flow so that adding it
// does not change the parent's own height, which would otherwise read as the child having moved the
// parent: measured at a constant 21px of false movement on every row that needed one.
const makeStackAnchor = (parent, label) => {
  const anchor = document.createElement("button");
  anchor.className = "stacked-lane-anchor";
  anchor.type = "button";
  anchor.textContent = label;
  anchor.style.position = "absolute";
  anchor.style.left = "0";
  anchor.style.top = "0";
  anchor.style.width = "1px";
  anchor.style.height = "1px";
  anchor.style.opacity = "0";
  anchor.style.pointerEvents = "none";
  parent.appendChild(anchor);
  return anchor;
};

const makeDropdownOptions = (long) => Array.from({ length: long ? 26 : 7 }, (_, index) => ({
  value: "stacked-option-" + index,
  text: "Option " + (index + 1),
  section: index === 0 ? "Property" : undefined,
}));

const closeSheetNode = (panel) => {
  if (!panel) return;
  panel.querySelector(".obnotion-sheet-close, .obnotion-cell-edit-close")?.click();
  if (panel.isConnected) panel.remove();
};

const openDropdownChild = (parent, child) => {
  let anchor = child.selector ? parent.querySelector(child.selector) : null;
  let ownedAnchor = false;
  if (!(anchor instanceof HTMLElement)) {
    anchor = makeStackAnchor(parent, child.title || "Open picker");
    ownedAnchor = true;
  }
  let close;
  if (child.selector && anchor instanceof HTMLElement) anchor.click();
  let panel = newestSheet();
  if (panel === parent) panel = null;
  if (!panel) {
    close = openDropdownMenu({
      anchor,
      label: child.title || "Property",
      options: makeDropdownOptions(Boolean(child.overflow)),
      value: "stacked-option-0",
      searchable: Boolean(child.overflow),
      closeOnSelect: false,
    });
    panel = newestSheet();
  }
  return {
    panel,
    close: () => {
      close?.();
      if (!close) closeSheetNode(panel);
      if (ownedAnchor) anchor.remove();
    },
  };
};

const openMenuChild = (parent, child) => {
  const anchor = makeStackAnchor(parent, child.title || "Open menu");
  const menu = createOwnedMenu(document, { title: child.title || "Menu" });
  menu.addSection(child.title || "Menu");
  menu.addRow({ icon: "check", label: "Selected item", selected: true });
  menu.addRow({ icon: "settings-2", label: "More options", submenu: true });
  menu.addRow({ icon: "trash-2", label: "Remove", warning: true });
  menu.showAt({ anchor });
  return { panel: menu.el, close: () => { menu.close(); anchor.remove(); } };
};

const openPickerChild = (parent, child) => {
  const anchor = makeStackAnchor(parent, child.title || "Open picker");
  let close;
  if (child.kind === "date") {
    // Same reason as the anchor above: the date picker builds its own trigger into whatever parent
    // it is handed, so it is handed an out-of-flow host inside the sheet rather than the sheet.
    const host = parent.createDiv();
    host.style.position = "absolute";
    host.style.left = "0";
    host.style.top = "0";
    host.style.opacity = "0";
    const trigger = renderDateValuePicker({
      parent: host,
      value: "2026-08-21",
      fieldLabel: child.title || "Due date",
      onChange: () => undefined,
    });
    trigger.click();
    close = () => { closeActiveDateValuePicker(document, false); host.remove(); };
  } else if (child.kind === "icon") {
    close = openIconPickerPopover({
      anchor,
      current: "lucide:x@blue",
      label: child.title || "Icon",
      onSelect: async () => undefined,
      onConfigureField: () => undefined,
    });
  } else {
    close = openOptionColorPicker(anchor, "blue", () => undefined, child.title || "Colour");
  }
  return {
    panel: newestSheet(),
    close: () => { close?.(); if (anchor.isConnected) anchor.remove(); },
  };
};

// Obsidian's real Modal wraps its own \`modalEl\` (\`.modal\`) in a \`.modal-container\` it appends to
// the body directly, with a \`.modal-bg\` backdrop beside it — and every Modal carries a title
// element and a close button of its own inside \`modalEl\`, whether or not a subclass ever uses
// them. The DbModal-backed rows below (\`kind: "modal"\`) build that real shape rather than a bare
// \`modal-container\`/\`modal-content\` pair, so the native chrome \`attachSheetChromeToModal\` has to
// neutralise is actually present to neutralise — a stand-in missing it would pass whether or not
// that neutralising code does anything at all. \`createHostModalStandIn\` (host-modal-stand-in.ts)
// is the one place that shape is built; the constructed screenshot scenarios for a stacked
// DbModal share it rather than each mounting their own copy.
const CREATE_PROPERTY_HARNESS_CONFIG = {
  // Three formats across the schema and deliberately NO relation column, so the type list's
  // rollup row is the gated one and the lane can require its reason to be present, not just the
  // row. \`renderCreatePropertyBody\` reads only \`schema.columns\`, so the rest of the shape the
  // real ViewConfig carries is not needed for the body's choices.
  schema: { columns: [{ key: "Name", type: "text" }, { key: "Due", type: "date" }, { key: "Amount", type: "number" }] },
};

const openHostModalChild = (parent, child) => {
  const { container, modalEl, contentEl: content, closeButton } = createHostModalStandIn();
  if (child.producer === "create-property") {
    // The real body, not a sketch of it: the same builder the shipped modal mounts, so every
    // picker row this lane reads is the producer's own DOM. The class cannot run here (the
    // bundle's obsidian stub only throws), which is why the builder, not the modal, is the
    // shared seam.
    renderCreatePropertyBody(content, CREATE_PROPERTY_HARNESS_CONFIG, { title: child.title || "Create property" }, {
      onConfirm: () => close(),
      onCancel: () => close(),
    });
  } else {
    const heading = document.createElement("h3");
    heading.textContent = child.title || "Choose file";
    content.appendChild(heading);
    const body = document.createElement("div");
    body.className = "obnotion-modal-help";
    body.textContent = child.kind === "fuzzy" ? "Search files" : "Confirm this change";
    content.appendChild(body);
  }
  let releaseChrome;
  let releasePlacement;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    releasePlacement?.();
    releaseChrome?.();
    if (container.isConnected) container.remove();
  };
  closeButton.addEventListener("click", close);
  releaseChrome = attachSheetChromeToModal(modalEl, true, close, {
    title: child.title || "Choose file",
    getTitle: () => child.title || "Choose file",
  });
  placeSheet(modalEl);
  releasePlacement = keepSheetPlaced(modalEl);
  return { panel: modalEl, close };
};

// The synthetic stand-in above proves the chrome-neutralising code path, not the depth cap: it
// calls \`attachSheetChromeToModal\` directly, with no \`role\` and so no \`replace\` callback ever
// offered to \`overlayStack.register\` (\`surface-shell.ts\`'s own \`canReplace\` gate reads
// \`options.role\`, which this stand-in never sets). A real \`panel\`-role \`DbModal\` subclass —
// \`CreatePropertyModal\` is the shipped example this pair's own "Create property" title names —
// goes through \`createSurfaceShell({ role: "panel" })\` instead, which DOES offer replace, so it is
// the one hop where the synthetic and the real call graph actually diverge in what they can prove.
// Reused rather than duplicated: the same construction \`window.__shellDepthCapReplace\` above
// already built and proved generically.
const openRealPanelShellChild = (parent, child) => {
  const standIn = createHostModalStandIn();
  const heading = document.createElement("h3");
  heading.textContent = child.title || "Choose file";
  standIn.contentEl.appendChild(heading);
  let shellRef;
  shellRef = createSurfaceShell({
    presentation: "sheet",
    element: standIn.modalEl,
    close: () => shellRef.destroy(),
    title: child.title || "Choose file",
    role: child.shellRole || "panel",
  });
  shellRef.apply();
  return {
    panel: standIn.modalEl,
    close: () => {
      shellRef.destroy();
      if (standIn.container.isConnected) standIn.container.remove();
    },
  };
};

const openSingleChild = (parent, child) => {
  if (child.kind === "dropdown") return openDropdownChild(parent, child);
  if (child.kind === "menu") return openMenuChild(parent, child);
  if (child.kind === "date" || child.kind === "icon" || child.kind === "color") return openPickerChild(parent, child);
  if (child.realShell) return openRealPanelShellChild(parent, child);
  return openHostModalChild(parent, child);
};

const openPairChild = (parent, child) => {
  if (!child.first) return openSingleChild(parent, child);
  const first = openSingleChild(parent, { kind: child.first, title: child.title, realShell: child.realShell });
  if (!first.panel) return first;
  const second = openSingleChild(first.panel, { kind: child.kind, title: child.title, overflow: child.overflow });
  return {
    panel: second.panel,
    close: () => { second.close(); first.close(); },
  };
};

// Measured from rendered style alone, never from the class that asks for it. A predicate that reads
// the is-stack-parent marking and a control that removes it would agree with each other whatever the
// stylesheet does, so the control below removes the class the shipped model applies and this reads
// what the browser actually painted.
const measureParentTreatment = (parent) => {
  if (!parent) return { dim: 1, transform: "none", treated: false };
  const content = Array.from(parent.children).find((child) => !child.classList.contains("obnotion-mobile-bottom-sheet-handle"));
  const dim = Number.parseFloat(getComputedStyle(parent).opacity);
  const transform = content ? getComputedStyle(content).transform : "none";
  return { dim, transform, treated: dim < 0.99 && transform !== "none" };
};

const parentTreatment = (parent) => measureParentTreatment(parent).treated;

const measureStackedPair = async (pair) => {
  let parent = null;
  let parentBefore = null;
  let opened = null;
  let mountError = null;
  let parentSettled = false;
  try {
    runRenderAssertions(document.body, pair.parent, "", () => {
      parent = mountedSheet();
    });
  } catch (error) {
    mountError = String(error);
  }
  // The parent is portalled onto the body, so it outlives the harness container and the child can be
  // opened after the mount call returns — which is what lets the entrance settle first.
  if (parent && !mountError) {
    parentSettled = await settleSheetGeometry(parent);
    parentBefore = rectSnapshot(parent);
    try {
      opened = openPairChild(parent, pair.child);
    } catch (error) {
      mountError = String(error);
    }
  }
  await waitForStackSettle();
  if (!parent || !opened?.panel || !opened.panel.isConnected || mountError) {
    opened?.close();
    return { name: pair.name, error: mountError || "parent or child did not mount" };
  }

  const child = opened.panel;
  // The child animates in as well, and its close control is measured against a 44px floor. A rect
  // read while it is still rising is a rect of a partly-scaled surface, which is how a conforming
  // close target reports as too small on some runs and not others.
  const childSettled = await settleSheetGeometry(child);
  // The sheet module keeps its own body watcher so a bare node removal still tears the stack down.
  // That watcher calls back into the code that positions the scrim, so a reposition that runs
  // unconditionally re-wakes it and the pair never stops moving. Counting body child mutations
  // across two idle frames is what tells a settled stack from one still chasing itself.
  const settleRecords = await new Promise((resolve) => {
    let count = 0;
    const observer = new MutationObserver((records) => { count += records.length; });
    observer.observe(document.body, { childList: true });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      observer.disconnect();
      resolve(count);
    }));
  });
  document.documentElement.style.setProperty("--keyboard-height", "336px");
  // Both surfaces re-place. A keyboard on a device raises one visual-viewport event that reaches
  // every sheet holding a placement subscription, so a check that re-places only the child lets a
  // parent keep a stale inset and still read green — which is the defect the operator photographed.
  placeSheet(parent);
  placeSheet(child);
  await waitForStackSettle();

  const parentAfter = rectSnapshot(parent);
  const parentDelta = maxRectDelta(parentBefore, parentAfter);
  const sheets = Array.from(document.body.querySelectorAll(".obnotion-mobile-bottom-sheet"));
  const top = sheets.at(-1) || child;
  const beneath = sheets.at(-2) || parent;
  const scrims = Array.from(document.body.querySelectorAll(".obnotion-mobile-sheet-scrim"));
  const bodyChildren = Array.from(document.body.children);
  const topIndex = bodyChildren.indexOf(top);
  const beneathIndex = bodyChildren.indexOf(beneath);
  const scrimIndex = scrims.length === 1 ? bodyChildren.indexOf(scrims[0]) : -1;
  const header = top.querySelector(".obnotion-panel-header, .obnotion-record-detail-header");
  const title = header?.querySelector(".obnotion-panel-title, .obnotion-record-detail-title");
  const close = header?.querySelector(".obnotion-sheet-close, .obnotion-cell-edit-close");
  const closeRect = close ? rectSnapshot(close) : null;
  const headerStyle = header ? getComputedStyle(header) : null;
  const titleStyle = title ? getComputedStyle(title) : null;
  const scrollHost = top.querySelector(".obnotion-dropdown-options, .obnotion-icon-picker-scroll, .obnotion-date-picker-body") || top;
  const scrollStyle = getComputedStyle(scrollHost);
  const hasOverflow = scrollHost.scrollHeight > scrollHost.clientHeight + 1;
  const hasFade = top.classList.contains("has-scroll-overflow")
    || scrollStyle.maskImage !== "none"
    || scrollStyle.webkitMaskImage !== "none";
  // Exactly one close affordance for the child: its own .obnotion-sheet-close, scoped to the child so
  // the dimmed parent's own close button — still on screen, only dimmed, never hidden — is not
  // counted against it. .modal-close-button is read from the whole document instead of the
  // child alone, because a host modal's native close button that survives the portal can end up
  // orphaned in the leftover native container beside the child rather than inside it.
  const isVisible = (el) => {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };
  const childCloseControls = Array.from(top.querySelectorAll(".obnotion-sheet-close")).filter(isVisible);
  const nativeCloseControls = Array.from(document.querySelectorAll(".modal-close-button")).filter(isVisible);
  const visibleCloseControls = [...childCloseControls, ...nativeCloseControls];
  const singleCloseControl = childCloseControls.length === 1 && nativeCloseControls.length === 0;
  // The header carries no background of its own — every sheet's surface paints one shared token
  // behind both the header and the row directly beneath it, so the two read as one surface rather
  // than two backgrounds meeting at the header's own bottom edge.
  //
  // Equality alone is satisfied by two transparent boxes, which is a sheet with no fill at all —
  // the very shape this row exists to catch. So the root's own fill is read beside them and
  // required to be opaque: the pair of checks together say "one surface, and it is painted".
  const bodyHost = header?.nextElementSibling ?? null;
  const headerBackground = header ? getComputedStyle(header).backgroundColor : null;
  const bodyBackground = bodyHost ? getComputedStyle(bodyHost).backgroundColor : null;
  const headerBodyBackgroundMatch = Boolean(headerBackground && bodyBackground && headerBackground === bodyBackground);
  const rootBackground = getComputedStyle(top).backgroundColor;
  const rootOpaque = isOpaqueColor(rootBackground);
  // Read every stack-derived fact before the gesture below. A drag past the flick threshold is
  // meant to dismiss the child, so a depth or inset sampled afterwards describes a stack that has
  // already come apart rather than the one under test.
  // The record family's own picker and menu children, measured at their rows: the 44px phone
  // floor these rows clear is the same reference grammar every menu in the family answers to, so
  // it is read here where the family actually mounts its menus, not only on the synthetic stand-in
  // the row-pitch control below mounts. Children whose lists are neither action rows nor option
  // rows (a date grid, an icon grid) simply report none and are skipped.
  const optionRowHeights = Array.from(top.querySelectorAll(".obnotion-menu-item, .obnotion-dropdown-option"))
    .filter(isVisible)
    .map((row) => row.getBoundingClientRect().height);
  const depthAtRest = Number.parseInt(child.style.getPropertyValue("--obnotion-sheet-depth"), 10);
  const childBottomAtRest = Number.parseFloat(child.style.getPropertyValue("--obnotion-mobile-sheet-bottom"));
  const parentBottomAtRest = Number.parseFloat(parent.style.getPropertyValue("--obnotion-mobile-sheet-bottom"));
  const parentDragBefore = rectSnapshot(parent);
  let dragParentUnchanged = false;
  const handle = top.querySelector(".obnotion-mobile-bottom-sheet-handle");
  // A menu-role child (design-trueup.md row 26) is satisfied by the ABSENCE of a handle, so
  // neither the gap this handle would leave above the title nor the drag it would offer applies --
  // both checks below are read as vacuously satisfied for this child rather than as "n/a" red.
  const childIsMenuCard = top.classList.contains("obnotion-mobile-menu-card");
  // The band between the grab handle and the title: the handle's own margins plus the header's
  // own top margin and row height account for every pixel a conforming sheet spends here, so a
  // gap past that budget is unclaimed space rather than chrome.
  const handleRect = handle ? rectSnapshot(handle) : null;
  const titleRect = title ? rectSnapshot(title) : null;
  const handleToTitleGap = handleRect && titleRect ? titleRect.top - handleRect.bottom : null;
  // Synthetic pointer events carry no active pointer, so the browser rejects the capture the drag
  // takes on a real finger. Standing it in keeps the gesture under test rather than the event
  // plumbing, the same way the harness stands in for the theme variables Obsidian supplies.
  const realCapture = Element.prototype.setPointerCapture;
  const realRelease = Element.prototype.releasePointerCapture;
  Element.prototype.setPointerCapture = function () {};
  Element.prototype.releasePointerCapture = function () {};
  try {
    if (handle) {
      const pointerId = 917;
      handle.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, button: 0, pointerId, pointerType: "touch", clientY: 200 }));
      top.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, cancelable: true, button: 0, pointerId, pointerType: "touch", clientY: 212 }));
      const during = rectSnapshot(parent);
      top.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true, button: 0, pointerId, pointerType: "touch", clientY: 212 }));
      const after = rectSnapshot(parent);
      dragParentUnchanged = maxRectDelta(parentDragBefore, during) <= 1 && maxRectDelta(parentDragBefore, after) <= 1;
    }
  } catch {
    dragParentUnchanged = false;
  } finally {
    Element.prototype.setPointerCapture = realCapture;
    Element.prototype.releasePointerCapture = realRelease;
  }

  // ── the keyboard's device path, measured after every stack-derived fact above ──
  // The block before this one publishes the inset through the host's \`--keyboard-height\` and
  // re-places by hand. A device does neither: the host publishes nothing it needn't, and the
  // software keyboard reports itself by shrinking the visual viewport, which the sheet's own
  // placement subscription answers. This block removes the published number, then shrinks the
  // viewport the way the platform does (the same instance-shadows-the-accessor override
  // verify-placement uses), so the sheet's subscription — not the harness's manual nudge — has
  // to come down. Two steps, because a placement that rewrites 336 over 336 proves nothing:
  // step 1 takes the inset away (336 must become 0 through the event alone), step 2 gives the
  // keyboard back. The note header the sheet must stop under has no fixture of its own in this
  // harness — the page is a bare body — so one fixed 44px bar stands in: one 44px row of the
  // note's own grammar, the thing the operator watched the picker ride over.
  const noteHeader = document.createElement("div");
  noteHeader.className = "obnotion-grammar-note-header";
  noteHeader.style.cssText = "position:fixed;top:0;left:0;right:0;height:44px;pointer-events:none;";
  document.body.appendChild(noteHeader);
  let device = null;
  let picker = null;
  try {
    document.documentElement.style.removeProperty("--keyboard-height");
    if (window.visualViewport) window.visualViewport.dispatchEvent(new window.Event("resize"));
    await waitForStackSettle();
    const droppedBottom = Number.parseFloat(child.style.getPropertyValue("--obnotion-mobile-sheet-bottom"));

    let restoreViewport = () => {};
    if (window.visualViewport) {
      const resting = window.visualViewport.height;
      Object.defineProperty(window.visualViewport, "height", {
        configurable: true,
        get: () => resting - 336,
      });
      restoreViewport = () => { delete window.visualViewport.height; };
      window.visualViewport.dispatchEvent(new window.Event("resize"));
    }
    await waitForStackSettle();
    await settleSheetGeometry(child);

    const headerBottom = noteHeader.getBoundingClientRect().bottom;
    const sheetRect = child.getBoundingClientRect();
    const sheetBottomVar = Number.parseFloat(child.style.getPropertyValue("--obnotion-mobile-sheet-bottom"));
    const probedSheet = getComputedStyle(child);
    const probedContent = child.querySelector(".obnotion-create-property-modal");
    const probedContentStyle = probedContent ? getComputedStyle(probedContent) : null;
    device = {
      probeSheetDisplay: probedSheet.display,
      probeSheetHeight: probedSheet.height,
      probeContentDisplay: probedContentStyle ? probedContentStyle.display : "no-content-el",
      probeContentHeight: probedContentStyle ? probedContentStyle.height : "no-content-el",
      dropped: droppedBottom === 0,
      droppedBottom,
      keyboard: sheetBottomVar === 336,
      sheetBottomVar,
      headerBottom,
      sheetTop: sheetRect.top,
      clearsHeader: sheetRect.top >= headerBottom - 0.5,
      sheetHeight: sheetRect.height,
      // The binding contract: the sheet's appetite is bounded by what the viewport, the keyboard
      // and the note's own header leave, so the picker the keyboard raises cannot climb past the
      // header it is meant to sit under.
      heightCap: sheetRect.height <= (window.innerHeight - 336 - 44) + 0.5,
      viewport: window.innerHeight,
    };

    if (pair.child.producer === "create-property") {
      const list = child.querySelector(".obnotion-create-property-type-list");
      if (list) {
        const rows = Array.from(list.querySelectorAll(".obnotion-create-property-type-option"));
        const listRect = list.getBoundingClientRect();
        const nameInput = child.querySelector("input");
        let pitchMin = Infinity;
        let pitchMax = 0;
        let pitchOK = rows.length >= 2;
        for (let i = 1; i < rows.length; i++) {
          const step = rows[i].getBoundingClientRect().top - rows[i - 1].getBoundingClientRect().top;
          pitchMin = Math.min(pitchMin, step);
          pitchMax = Math.max(pitchMax, step);
          if (step < 44 - 0.5 || step > 52 + 0.5) pitchOK = false;
        }
        const rowsOK = rows.length > 0 && rows.every((row) =>
          row.querySelector("svg") && (row.textContent || "").trim().length > 0);
        const sheetLeft = sheetRect.left;
        const sheetRight = sheetRect.right;
        const firstRow = rows[0] ? rows[0].getBoundingClientRect() : null;
        picker = {
          rows: rows.length,
          pitchOK,
          pitchMin: Number.isFinite(pitchMin) ? pitchMin : 0,
          pitchMax,
          iconLabel: rowsOK,
          reasonShown: rows.some((row) => row.querySelector(".obnotion-create-property-type-option-reason")),
          selectedMarked: rows.some((row) => row.classList.contains("is-selected")),
          namePinned: Boolean(nameInput && list && nameInput.getBoundingClientRect().bottom <= listRect.top + 0.5),
          padding16: Boolean(firstRow) && firstRow.left >= sheetLeft + 16 - 0.5 && firstRow.right <= sheetRight - 16 + 0.5,
          scrolls: list.scrollHeight > list.clientHeight + 1,
          listScrollHeight: list.scrollHeight,
          listClientHeight: list.clientHeight,
          noHorizontal: list.scrollWidth <= list.clientWidth + 1
            && child.scrollWidth <= child.clientWidth + 1
            && document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
        };
      }
    }
  } finally {
    if (window.visualViewport) {
      delete window.visualViewport.height;
      window.visualViewport.dispatchEvent(new window.Event("resize"));
    }
    noteHeader.remove();
  }

  const expectedDepth = pair.child.depth || 2;
  const childBottom = childBottomAtRest;
  const parentBottom = parentBottomAtRest;
  const report = {
    name: pair.name,
    parentDelta,
    parentBox: parentDelta <= 1,
    parentTreatment: parentTreatment(parent),
    oneScrim: scrims.length === 1,
    scrimBetween: scrims.length === 1 && scrimIndex > Math.min(topIndex, beneathIndex) && scrimIndex < Math.max(topIndex, beneathIndex),
    childHeader: Boolean(header && title?.textContent?.trim() && close),
    closeTarget: Boolean(closeRect && closeRect.width >= 44 && closeRect.height >= 44),
    headerInset: Boolean(headerStyle && Math.min(Number.parseFloat(headerStyle.paddingLeft), Number.parseFloat(headerStyle.paddingRight)) >= 16),
    titleSize: Boolean(titleStyle && Number.parseFloat(titleStyle.fontSize) >= 16),
    singleCloseControl,
    closeControlCount: visibleCloseControls.length,
    headerBodyBackgroundMatch,
    headerBackground,
    bodyBackground,
    rootBackground,
    rootOpaque,
    handleToTitleGap,
    childIsMenuCard,
    childKeyboard: childBottom === 336,
    parentKeyboard: parentBottom === 0,
    dragParentUnchanged,
    depth: depthAtRest,
    expectedDepth,
    childOptionRows: { count: optionRowHeights.length, minHeight: optionRowHeights.length ? Math.min(...optionRowHeights) : null },
    overflow: hasOverflow && hasFade,
    overflowMeasured: { scrollHeight: scrollHost.scrollHeight, clientHeight: scrollHost.clientHeight, fade: hasFade },
    settleRecords,
    parentSettled,
    childSettled,
    device,
    picker,
  };
  document.documentElement.style.removeProperty("--keyboard-height");
  opened.close();
  await Promise.resolve();
  return report;
};

window.__stackedSheetGrammar = (pair) => measureStackedPair(pair);

// The named pair's own real call graph, not the generic proof \`__shellDepthCapReplace\` above
// already gives. That generic check builds all three levels out of host-modal stand-ins; this one
// builds the REAL parent renderer (\`column-manager\`, the same one \`REGISTERED_STACKED_PAIRS\`
// mounts for this pair) and routes the \`first\` hop through \`openRealPanelShellChild\` — a real
// \`createSurfaceShell({ role: "panel" })\` call, the same one the production \`CreatePropertyModal\`
// makes for its own "Create property" title — so the depth cap the third hop trips is offered to a
// REAL panel-role shell rather than a synthetic stand-in with no role at all.
// \`measureStackedPair\`'s own 18-assertion battery assumes the child stays an independent,
// separately-measurable sheet, which an absorbed third hop no longer is; this is a smaller,
// purpose-built set of facts for exactly that outcome instead.
// shellRole defaults to "panel" -- CreatePropertyModal's own declared role, and the positive case
// this pair's own threshold is about. The negative control below passes "dialog" instead, so the
// same real dropdown can be shown stacking normally when the real hop it opens over does not offer
// a replace -- proving this check can tell the two apart rather than always reading "absorbed".
const measureNamedPairPropertyTypeReplace = async (shellRole) => {
  clearStrayOverlays();
  let parent = null;
  let mountError = null;
  try {
    runRenderAssertions(document.body, { renderer: "column-manager", bag: "file-view", captureData: true }, "", () => {
      parent = mountedSheet();
    });
  } catch (error) {
    mountError = String(error);
  }
  if (!parent || mountError) return { error: mountError || "the column-manager parent did not mount" };
  await settleSheetGeometry(parent);
  const beforeSheets = document.querySelectorAll(".obnotion-mobile-bottom-sheet").length;
  let first = null;
  let second = null;
  let firstPanelMissing = false;
  try {
    first = openSingleChild(parent, { kind: "modal", title: "Create property", realShell: true, shellRole });
    if (!first.panel) { firstPanelMissing = true; throw new Error("no panel"); }
    await settleSheetGeometry(first.panel);
    second = openSingleChild(first.panel, { kind: "dropdown", title: "Create property" });
  } catch (error) {
    if (firstPanelMissing) return { error: "the real Create-property panel did not mount" };
    return { error: String(error) };
  }
  await waitForStackSettle();
  const afterFirstHop = beforeSheets + 1;
  const afterSecondHop = document.querySelectorAll(".obnotion-mobile-bottom-sheet").length;
  const result = {
    // 1 before (the column-manager parent alone), 2 after the first hop (parent + the real
    // "Create property" panel), and — the fact this check exists to prove — still 2 after the
    // second hop (the real dropdown) rather than 3 for the panel-role case: the dropdown
    // genuinely opened (a real production panel resolved, not null) but was offered to the
    // "Create property" panel's own replace callback instead of stacking as an independent third
    // sheet. The dialog-role negative control expects 3, not 2 -- the same real dropdown, over a
    // real hop that never offers a replace.
    beforeSheets,
    afterFirstHop,
    afterSecondHop,
    dropdownResolved: Boolean(second?.panel && second.panel.isConnected),
    dropdownBecameOwnSheet: Boolean(second?.panel && second.panel !== first.panel && second.panel.classList.contains("obnotion-mobile-bottom-sheet")),
    parentStillConnected: parent.isConnected,
  };
  second?.close?.();
  first?.close?.();
  return result;
};

window.__namedPairPropertyTypeReplace = () => measureNamedPairPropertyTypeReplace("panel");
window.__namedPairPropertyTypeReplaceNegativeControl = () => measureNamedPairPropertyTypeReplace("dialog");

window.__stackedSheetGrammarNegativeControl = async () => {
  const pair = stackedPairRegistry[0];
  let parent = null;
  let opened = null;
  runRenderAssertions(document.body, pair.parent, "", () => {
    parent = mountedSheet();
    if (parent) opened = openPairChild(parent, pair.child);
  });
  await waitForStackSettle();
  if (!parent || !opened?.panel) return { error: "parent or child did not mount" };
  // The pre-fix shape is a parent carrying no stack marking at all — no sheet in the shipped tree
  // wore one before this model existed. Removing it reproduces that DOM, and the numbers below come
  // from the rendered result rather than from the marking, so the stylesheet is what is on trial.
  const before = measureParentTreatment(parent);
  parent.classList.remove("is-stack-parent");
  const oldWay = measureParentTreatment(parent);
  parent.classList.add("is-stack-parent");
  const restored = measureParentTreatment(parent);
  opened.close();
  await Promise.resolve();
  return { before, oldWay, restored };
};

// The three columns this leg adds, proven the same way every other column in this lane is: each
// one is pushed red by hand on a live, conforming mount, then restored, so a check that never
// goes red is not trusted just because it currently reads green.
window.__stackedSheetChromeNegativeControl = async () => {
  const pair = stackedPairRegistry.find((entry) => entry.name === "properties edit property");
  let parent = null;
  let opened = null;
  runRenderAssertions(document.body, pair.parent, "", () => {
    parent = mountedSheet();
    if (parent) opened = openPairChild(parent, pair.child);
  });
  await waitForStackSettle();
  if (!parent || !opened?.panel) return { error: "parent or child did not mount" };
  const top = opened.panel;
  const header = top.querySelector(".obnotion-panel-header, .obnotion-record-detail-header");
  const title = header?.querySelector(".obnotion-panel-title, .obnotion-record-detail-title");
  const handle = top.querySelector(".obnotion-mobile-bottom-sheet-handle");

  const isVisible = (el) => {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };
  // Scoped the same way the row's own predicate is: the child's own .obnotion-sheet-close, so the
  // dimmed parent's close button underneath (still on screen, only dimmed) is not counted against
  // it, plus .modal-close-button read from the whole document since an orphaned native one can
  // land beside the child rather than inside it.
  const countCloseControls = () => Array.from(top.querySelectorAll(".obnotion-sheet-close")).filter(isVisible).length
    + Array.from(document.querySelectorAll(".modal-close-button")).filter(isVisible).length;
  const backgroundsMatch = () => {
    const bodyHost = header?.nextElementSibling ?? null;
    const headerBg = header ? getComputedStyle(header).backgroundColor : null;
    const bodyBg = bodyHost ? getComputedStyle(bodyHost).backgroundColor : null;
    return Boolean(headerBg && bodyBg && headerBg === bodyBg);
  };
  const gap = () => {
    if (!handle || !title) return null;
    return title.getBoundingClientRect().top - handle.getBoundingClientRect().bottom;
  };

  // A second close control: the exact shape a host modal's own close button takes if the shell's
  // neutralising code ever stops finding it.
  const closeControlBefore = countCloseControls();
  const injectedClose = document.createElement("div");
  injectedClose.className = "modal-close-button";
  // This harness carries no styling for the native close button at all — production leaves it
  // sized and painted by Obsidian's own host CSS. An explicit size stands in for that so the
  // injected element measures as present rather than as the empty, zero-height div it would
  // otherwise be, which is a fact about this stand-in, not about the code under test.
  injectedClose.style.cssText = "width: 32px; height: 32px; display: block;";
  top.appendChild(injectedClose);
  const closeControlDuring = countCloseControls();
  injectedClose.remove();
  const closeControlAfter = countCloseControls();

  // A body painted a different surface than its header.
  const backgroundBefore = backgroundsMatch();
  const bodyHost = header?.nextElementSibling ?? null;
  const previousBodyBackground = bodyHost ? bodyHost.style.backgroundColor : "";
  if (bodyHost) bodyHost.style.backgroundColor = "rgb(1, 2, 3)";
  const backgroundDuring = backgroundsMatch();
  if (bodyHost) bodyHost.style.backgroundColor = previousBodyBackground;
  const backgroundAfter = backgroundsMatch();

  // A sheet root with no fill of its own: the shape the header/body comparison alone reads as
  // clean, because two transparent boxes are equal.
  const rootFillBefore = isOpaqueColor(getComputedStyle(top).backgroundColor);
  const previousRootBackground = top.style.backgroundColor;
  top.style.backgroundColor = "transparent";
  const rootFillDuring = isOpaqueColor(getComputedStyle(top).backgroundColor);
  top.style.backgroundColor = previousRootBackground;
  const rootFillAfter = isOpaqueColor(getComputedStyle(top).backgroundColor);

  // Unclaimed space between the handle and the title, past the grammar's own budget.
  const gapBefore = gap();
  const previousHeaderMargin = header ? header.style.marginTop : "";
  if (header) header.style.marginTop = "300px";
  const gapDuring = gap();
  if (header) header.style.marginTop = previousHeaderMargin;
  const gapAfter = gap();

  opened.close();
  await Promise.resolve();
  return {
    closeControl: { before: closeControlBefore, during: closeControlDuring, after: closeControlAfter },
    background: { before: backgroundBefore, during: backgroundDuring, after: backgroundAfter },
    rootFill: { before: rootFillBefore, during: rootFillDuring, after: rootFillAfter },
    gap: { before: gapBefore, during: gapDuring, after: gapAfter },
  };
};

// Not every caller of attachSheetChromeToModal is a host modal. The shell presents panels that
// live in the view tree, whose parent belongs to whoever built it — so the native-chrome
// neutralising must recognise the host's own .modal-container and leave any other parent's own
// inline display exactly as it found it, in both presentations and after the teardown.
window.__shellPanelParentUntouched = () => {
  const host = document.createElement("div");
  host.style.setProperty("display", "flex");
  const panel = document.createElement("div");
  panel.className = "obnotion-view-config-panel obnotion-surface";
  host.appendChild(panel);
  document.body.appendChild(host);
  const release = attachSheetChromeToModal(panel, true, () => {}, { title: "Settings" });
  const asSheet = host.style.display;
  release();
  const afterRelease = host.style.display;
  attachSheetChromeToModal(panel, false, () => {});
  const asDesktop = host.style.display;
  if (panel.isConnected) panel.remove();
  host.remove();
  return { asSheet, afterRelease, asDesktop };
};

// --- the all-sheets overflow sweep ---

const OVERFLOW_TOLERANCE = ${OVERFLOW_TOLERANCE_PX};
const CONTROL_WIDTH = ${OVERFLOW_CONTROL_WIDTH_PX};
const UNBREAKABLE = ${JSON.stringify(UNBREAKABLE_NAME)};

// Every shape a phone presents on top of the view: the bottom sheets, the two docked inline cell
// editors and the option list that are deliberately not sheets, and a host modal wearing sheet
// chrome. The editors are portalled onto the body; the option list stays inside the cell it edits,
// so both roots are searched rather than the body alone.
const SWEEP_SELECTOR = ".obnotion-mobile-bottom-sheet, .obnotion-cell-edit-popover, .obnotion-cell-option-popover, .modal-container";
const sweptSurfaces = () => Array.from(document.querySelectorAll(SWEEP_SELECTOR));

const describeNode = (el) => {
  const name = el.tagName.toLowerCase();
  const classes = typeof el.className === "string" ? el.className.trim().split(/\\s+/).filter(Boolean) : [];
  return classes.length > 0 ? name + "." + classes.slice(0, 3).join(".") : name;
};

// The nodes that carry the user's words rather than the plugin's. A picker's header takes the field
// it was opened for and a menu's title takes the row, column or field it belongs to, so the title is
// vault text on exactly the surfaces whose titles are not fixed copy.
//
// Shipped copy is deliberately absent. A segmented option, a menu action and a button caption come
// from the translation table, where the longest run is bounded by a translator rather than by a
// vault; a stress that rewrites them measures a string the plugin will never be handed, and the
// segmented placement group in particular already carries an operator decision to break at word
// boundaries only, which such a word would report as a defect it is not.
const VAULT_TEXT_SELECTORS = [
  ".obnotion-panel-title", ".obnotion-record-detail-title", ".obnotion-column-name-wrap", ".obnotion-column-name-wrap *",
  ".obnotion-column-manager-name", ".obnotion-view-config-readonly-value", ".obnotion-dropdown-field-value",
  ".obnotion-dropdown-option", ".obnotion-record-detail-field-label",
];

const lengthenVaultText = (surface) => {
  for (const selector of VAULT_TEXT_SELECTORS) {
    for (const el of surface.querySelectorAll(selector)) {
      if (el.children.length > 0) continue;
      if (!el.textContent || !el.textContent.trim()) continue;
      el.textContent = UNBREAKABLE;
    }
  }
};

const measureOverflow = (surface) => {
  const surfaceRect = surface.getBoundingClientRect();
  const surfaceStyle = window.getComputedStyle(surface);
  const style0 = surfaceStyle;
  const surfaceRight = surfaceRect.right;
  const past = [];
  // The farthest margin edge, measured from the scroll origin (the padding box's left). Whatever
  // owns the maximum owns the excess, because scrollWidth runs from that origin to the farthest
  // scrolled margin edge: whichever descendant's distance equals scrollWidth IS the rule at fault.
  let farthest = null;
  for (const el of surface.querySelectorAll("*")) {
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    if (rect.right > surfaceRight + OVERFLOW_TOLERANCE) {
      past.push(describeNode(el) + " +" + (rect.right - surfaceRight).toFixed(1) + "px");
    }
    const distanceFromOrigin = rect.right
      + (Number.parseFloat(style.marginRight) || 0)
      - (surfaceRect.left + (Number.parseFloat(window.getComputedStyle(surface).borderLeftWidth) || 0));
    if (!farthest || distanceFromOrigin > farthest.distanceFromOrigin) {
      farthest = {
        distanceFromOrigin: Number(distanceFromOrigin.toFixed(2)),
        width: Number(rect.width.toFixed(1)),
        boxSizing: style.boxSizing,
        marginRight: Number((Number.parseFloat(style.marginRight) || 0).toFixed(1)),
        node: describeNode(el),
      };
    }
  }
  const style = window.getComputedStyle(surface);
  return {
    node: describeNode(surface),
    scrollWidth: surface.scrollWidth,
    clientWidth: surface.clientWidth,
    // The extent: scrollWidth counts the box's own left border; clientWidth does not — a
    // bordered sheet measures 1px of sideways scroll it never scrolls. The extent is what the
    // comparison reads. The integers above round; a sub-pixel box (0.5px borders, fractional
    // insets) hides between them, so the box's own width and border pair say which side of the
    // rounding the 1px came from.
    scrollExtent: surface.scrollWidth - (Number.parseFloat(style0.borderLeftWidth) || 0),
    rectWidth: Number(surfaceRect.width.toFixed(2)),
    borderLeftWidth: style0.borderLeftWidth,
    borderRightWidth: style0.borderRightWidth,
    // The farthest-margin-edge diagnosis: whichever descendant's distance equals scrollWidth IS
    // the rule at fault, so the failure names it (and its box, borders, paddings, scrollLeft).
    boxWidth: Number(surfaceRect.width.toFixed(2)),
    borders: [style.borderLeftWidth, style.borderRightWidth].join("/"),
    paddings: [style.paddingLeft, style.paddingRight].join("/"),
    scrollLeft: surface.scrollLeft,
    widestChild: farthest,
    past: past.slice(0, 3),
    pastCount: past.length,
  };
};

// The document and the body are measured beside the surfaces because a sheet is portalled onto the
// body: a surface can stay inside its own box and still widen the page it was appended to, and a
// page that scrolls sideways is the defect an operator sees whichever node caused it.
const measureSweep = () => ({
  surfaces: sweptSurfaces().map(measureOverflow),
  documentScroll: { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth },
  bodyScroll: { scrollWidth: document.body.scrollWidth, clientWidth: document.body.clientWidth },
});

window.__sheetOverflow = (scenario, stress) => {
  let report = { mounted: false };
  runRenderAssertions(document.body, scenario, "", () => {
    if (stress) for (const surface of sweptSurfaces()) lengthenVaultText(surface);
    report = { mounted: true, ...measureSweep() };
  });
  return report;
};

window.__stackedSheetOverflow = async (pair, stress) => {
  let parent = null;
  let opened = null;
  let mountError = null;
  try {
    runRenderAssertions(document.body, pair.parent, "", () => { parent = mountedSheet(); });
  } catch (error) {
    mountError = String(error);
  }
  if (parent && !mountError) {
    try { opened = openPairChild(parent, pair.child); } catch (error) { mountError = String(error); }
  }
  await waitForStackSettle();
  if (!parent || !opened?.panel || !opened.panel.isConnected || mountError) {
    opened?.close();
    return { error: mountError || "parent or child did not mount" };
  }
  if (stress) for (const surface of sweptSurfaces()) lengthenVaultText(surface);
  const report = measureSweep();
  opened.close();
  await Promise.resolve();
  return report;
};

// A sweep that has never been observed red is not evidence. This mounts a surface the sweep just
// called clean, hangs a child wider than the phone off it, requires the same measurement to report
// the overflow, then removes the child and requires the surface to come back clean.
window.__sheetOverflowNegativeControl = () => {
  const scenario = ${JSON.stringify(REGISTERED_SURFACES.find((s) => s.name === NEGATIVE_CONTROL.surface).spec)};
  let result = { mounted: false };
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    if (!sheet) { result = { mounted: true, error: "no sheet mounted" }; return; }
    const before = measureOverflow(sheet);
    const wide = document.createElement("div");
    wide.style.width = CONTROL_WIDTH + "px";
    wide.style.height = "8px";
    wide.style.flex = "0 0 auto";
    sheet.appendChild(wide);
    const injected = measureOverflow(sheet);
    wide.remove();
    result = { mounted: true, before, injected, restored: measureOverflow(sheet) };
  });
  return result;
};
`);

if (missingSources.length > 0) {
  console.error(`sheet-grammar: FAIL — the bundle no longer imports ${missingSources.join(", ")}`);
  console.error("  a check that does not bundle the shipped renderer proves nothing about it");
  process.exit(1);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${REPO}styles.css">
<link rel="stylesheet" href="file://${REPO}tools/screenshots/host-bare-controls.css"></head>
<body class="is-phone theme-dark"><script src="render-bundle.js"></script></body></html>`);

// ───────────────────────────────────────────────────────────────────
// 4. RUN
// ───────────────────────────────────────────────────────────────────

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  for (const candidate of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ]) if (existsSync(candidate)) return candidate;
  throw new Error("sheet-grammar: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

const failures = [];

// ───────────────────────────────────────────────────────────────────
// 4b. THE OVERFLOW SWEEP
// ───────────────────────────────────────────────────────────────────

// One row per surface per pass. A phone cannot pan sideways, so anything the surface put past its
// own right edge is unreachable, and a page that scrolls sideways is the same defect one level out.
const reportSweep = (engineName, label, report) => {
  if (report.error) {
    failures.push(`overflow sweep ${engineName} ${label}: ${report.error}`);
    console.log(`  FAIL  ${engineName} ${label} — ${report.error}`);
    return;
  }
  if (report.mounted === false) {
    failures.push(`overflow sweep ${engineName} ${label}: did not mount`);
    console.log(`  FAIL  ${engineName} ${label} — did not mount`);
    return;
  }
  if (report.surfaces.length === 0) {
    failures.push(`overflow sweep ${engineName} ${label}: mounted no surface to measure`);
    console.log(`  FAIL  ${engineName} ${label} — mounted no surface to measure`);
    return;
  }
  for (const surface of report.surfaces) {
    const scrolls = surface.scrollExtent > surface.clientWidth;
    if (scrolls) failures.push(`overflow sweep ${engineName} ${label}: ${surface.node} scrolls horizontally (extent ${surface.scrollExtent} > clientWidth ${surface.clientWidth}${surface.widestChild ? ` — farthest margin edge ${surface.widestChild.distanceFromOrigin}px from the scroll origin: ${surface.widestChild.node} (box ${surface.boxWidth}px, borders ${surface.borders}, paddings ${surface.paddings}, scrollLeft ${surface.scrollLeft})` : ""})`);
    console.log(`  ${scrolls ? "FAIL" : "PASS"}  ${engineName} ${label} — ${surface.node} extent ${surface.scrollExtent} ≤ clientWidth ${surface.clientWidth} (scrollWidth ${surface.scrollWidth}, box ${surface.rectWidth}px, borders ${surface.borderLeftWidth}/${surface.borderRightWidth}${surface.pastCount ? `, past: ${surface.past.join("; ")}` : ""})`);
    const clean = surface.pastCount === 0;
    if (!clean) failures.push(`overflow sweep ${engineName} ${label}: ${surface.pastCount} descendant(s) past ${surface.node}'s right edge (${surface.past.join(", ")})`);
    console.log(`  ${clean ? "PASS" : "FAIL"}  ${engineName} ${label} — nothing past ${surface.node}'s right edge${clean ? "" : `: ${surface.past.join(", ")}`}`);
  }
  for (const [name, measured] of [["document", report.documentScroll], ["body", report.bodyScroll]]) {
    const scrolls = measured.scrollWidth > measured.clientWidth;
    if (scrolls) failures.push(`overflow sweep ${engineName} ${label}: the ${name} scrolls horizontally (${measured.scrollWidth} > ${measured.clientWidth})`);
    console.log(`  ${scrolls ? "FAIL" : "PASS"}  ${engineName} ${label} — ${name} scrollWidth ${measured.scrollWidth} ≤ clientWidth ${measured.clientWidth}`);
  }
};

async function runOverflowSweep(engineName, engine, launchOptions) {
  let sweepBrowser;
  try {
    sweepBrowser = await engine.launch(launchOptions);
    const page = await sweepBrowser.newPage({ viewport: { width: 402, height: 874 }, hasTouch: true });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`file://${join(work, "index.html")}`);

    // The fixtures' own names first, then the same surfaces again with every vault-derived string
    // replaced by one unbreakable word. A surface that only fits the short names a fixture happens
    // to carry is not a surface that has been sized.
    for (const stress of [false, true]) {
      const pass = stress ? "long name" : "as built";
      console.log(`sheet-grammar: overflow sweep — ${engineName}, ${pass}\n`);
      for (const { name, spec } of OVERFLOW_SWEEP_SURFACES) {
        const report = await page.evaluate(([scenario, withStress]) => window.__sheetOverflow(scenario, withStress), [spec, stress]);
        reportSweep(engineName, `${name} (${pass})`, report);
      }
      for (const pair of REGISTERED_STACKED_PAIRS) {
        const report = await page.evaluate(([shape, withStress]) => window.__stackedSheetOverflow(shape, withStress), [pair, stress]);
        reportSweep(engineName, `stacked ${pair.name} (${pass})`, report);
      }
      console.log("");
    }

    const control = await page.evaluate(() => window.__sheetOverflowNegativeControl());
    console.log(`sheet-grammar: overflow negative control — ${engineName}, a ${OVERFLOW_CONTROL_WIDTH_PX}px child injected into ${NEGATIVE_CONTROL.surface}\n`);
    if (!control.mounted || control.error) {
      failures.push(`overflow negative control ${engineName}: ${control.error || "did not mount"}`);
      console.log(`  FAIL  ${engineName} — ${control.error || "did not mount"}`);
    } else {
      const cleanBefore = control.before.pastCount === 0 && control.before.scrollExtent <= control.before.clientWidth;
      const wentRed = control.injected.scrollExtent > control.injected.clientWidth;
      const cleanAfter = control.restored.pastCount === 0 && control.restored.scrollExtent <= control.restored.clientWidth;
      if (!cleanBefore) failures.push(`overflow negative control ${engineName}: the control surface already overflowed before the injection`);
      if (!wentRed) failures.push(`overflow negative control ${engineName}: the injected ${OVERFLOW_CONTROL_WIDTH_PX}px child did not register as overflow`);
      if (!cleanAfter) failures.push(`overflow negative control ${engineName}: the surface did not come back clean after the child was removed`);
      console.log(`  ${cleanBefore ? "PASS" : "FAIL"}  ${engineName} — clean before the injection (extent ${control.before.scrollExtent}/${control.before.clientWidth})`);
      console.log(`  ${wentRed ? "PASS" : "FAIL"}  ${engineName} — red with the injection (extent ${control.injected.scrollExtent}/${control.injected.clientWidth})`);
      console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  ${engineName} — clean again once removed (extent ${control.restored.scrollExtent}/${control.restored.clientWidth})`);
    }
    console.log("");

    await page.close();
    for (const error of pageErrors) failures.push(`overflow sweep ${engineName} page error: ${error}`);
  } catch (error) {
    failures.push(`overflow sweep ${engineName} failed to run: ${error.message}`);
  } finally {
    if (sweepBrowser) await sweepBrowser.close();
  }
}

// The phone is WebKit, and every other check above runs on Chrome alone (matching the rest of
// this lane's own precedent). The host-modal defect the operator reported is specifically an
// engine-observable one — a native element two engines may or may not agree on hiding the same
// way — so this pair and its negative control run on both rather than joining the Chrome-only
// registry checks above.
async function runHostModalChromeCheck(engineName, engine, launchOptions) {
  let chromeBrowser;
  try {
    chromeBrowser = await engine.launch(launchOptions);
    const page = await chromeBrowser.newPage({ viewport: { width: 402, height: 874 }, hasTouch: true });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`file://${join(work, "index.html")}`);

    const pair = REGISTERED_STACKED_PAIRS.find((entry) => entry.name === "properties edit property");
    const report = await page.evaluate((shape) => window.__stackedSheetGrammar(shape), pair);
    console.log(`sheet-grammar: stacked pair — ${pair.name} (${engineName})\n`);
    if (report.error) {
      failures.push(`${pair.name} ${engineName}: ${report.error}`);
      console.log(`  FAIL  ${pair.name} (${engineName}) — ${report.error}`);
    } else {
      const checks = [
        [`exactly one visible close control (found ${report.closeControlCount})`, report.singleCloseControl],
        [`header and body share one background (${report.headerBackground} vs ${report.bodyBackground})`, report.headerBodyBackgroundMatch],
        [`sheet root paints an opaque fill (${report.rootBackground})`, report.rootOpaque],
        [`handle-to-title gap ≤${HANDLE_TO_TITLE_GAP_MAX_PX}px (measured ${report.handleToTitleGap == null ? "n/a" : report.handleToTitleGap.toFixed(1) + "px"})`, report.handleToTitleGap != null && report.handleToTitleGap <= HANDLE_TO_TITLE_GAP_MAX_PX],
        ["parent dims and scales back", report.parentTreatment],
        [`parent bounding box Δ≤1px (max ${report.parentDelta.toFixed(2)}px)`, report.parentBox],
      ];
      for (const [label, ok] of checks) {
        if (!ok) failures.push(`${pair.name} ${engineName}: ${label}`);
        console.log(`  ${ok ? "PASS" : "FAIL"}  ${pair.name} (${engineName}) — ${label}`);
      }
    }
    console.log("");

    const control = await page.evaluate(() => window.__stackedSheetChromeNegativeControl());
    console.log(`sheet-grammar: host-modal chrome negative control — properties edit property (${engineName})\n`);
    if (control.error) {
      failures.push(`host-modal chrome negative control ${engineName}: ${control.error}`);
      console.log(`  FAIL  host-modal chrome negative control (${engineName}) — ${control.error}`);
    } else {
      const closeWentRed = control.closeControl.during > 1;
      const backgroundWentRed = control.background.during === false;
      const rootFillWentRed = control.rootFill.during === false;
      const gapWentRed = control.gap.during != null && control.gap.during > HANDLE_TO_TITLE_GAP_MAX_PX;
      if (!closeWentRed) failures.push(`host-modal chrome negative control ${engineName}: a second close control did not register`);
      if (!backgroundWentRed) failures.push(`host-modal chrome negative control ${engineName}: a mismatched background did not register`);
      if (!rootFillWentRed) failures.push(`host-modal chrome negative control ${engineName}: an unpainted sheet root did not register`);
      if (!gapWentRed) failures.push(`host-modal chrome negative control ${engineName}: an oversized gap did not register`);
      console.log(`  ${closeWentRed ? "PASS" : "FAIL"}  a second close control registers red (${engineName})`);
      console.log(`  ${backgroundWentRed ? "PASS" : "FAIL"}  a mismatched background registers red (${engineName})`);
      console.log(`  ${rootFillWentRed ? "PASS" : "FAIL"}  an unpainted sheet root registers red (${engineName})`);
      console.log(`  ${gapWentRed ? "PASS" : "FAIL"}  an oversized gap registers red (${engineName})`);
    }
    console.log("");

    const parentGuard = await page.evaluate(() => window.__shellPanelParentUntouched());
    console.log(`sheet-grammar: a shell panel's own parent is not the host's container (${engineName})\n`);
    for (const [label, value] of [
      ["presented as a sheet", parentGuard.asSheet],
      ["after the teardown", parentGuard.afterRelease],
      ["presented as a desktop panel", parentGuard.asDesktop],
    ]) {
      const ok = value === "flex";
      if (!ok) failures.push(`shell panel parent guard ${engineName}: inline display was "${value}" ${label}, wanted "flex"`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  the parent keeps its own inline display ${label} (${engineName})`);
    }
    console.log("");

    await page.close();
    for (const error of pageErrors) failures.push(`host-modal chrome check ${engineName} page error: ${error}`);
  } catch (error) {
    failures.push(`host-modal chrome check ${engineName} failed to run: ${error.message}`);
  } finally {
    if (chromeBrowser) await chromeBrowser.close();
  }
}

let browser;
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 402, height: 874 }, hasTouch: true });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);

  for (const { name, spec } of REGISTERED_SURFACES) {
    const report = await page.evaluate((scenario) => window.__sheetGrammar(scenario), spec);
    console.log(`sheet-grammar: ${name}\n`);
    if (!report.mounted) {
      failures.push(`${name}: did not mount`);
      console.log(`  FAIL  ${name} — did not mount`);
      continue;
    }
    if (!report.sheetFound) {
      failures.push(`${name}: mounted without a sheet surface on the body`);
      console.log(`  FAIL  ${name} — mounted without a sheet surface on the body`);
      continue;
    }
    // The report is keyed by the contract's element keys, in the contract's order, so the rows
    // printed here are the grammar's own list rather than a copy that could drift from it.
    for (const key of Object.keys(report.grammar)) {
      const ok = report.grammar[key] === true;
      if (!ok) failures.push(`${name}: ${key} was ${report.grammar[key]}, wanted true`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${name} — ${key}: ${report.grammar[key]}`);
    }
    if (name === "add-view") {
      const ok = report.listViewRow === false;
      if (!ok) failures.push(`add-view: offered a List view row, wanted none`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  add-view — no List view row: ${report.listViewRow === false}`);
    }
    // Geometry the structural predicates cannot see: the close control's own hit box, and whether
    // anything the surface drew reaches past its own right edge.
    if (report.closeBox) {
      const { width, height } = report.closeBox;
      const ok = width >= CLOSE_TARGET_FLOOR_PX && height >= CLOSE_TARGET_FLOOR_PX;
      if (!ok) failures.push(`${name}: close target ${width.toFixed(1)}x${height.toFixed(1)}, wanted >= ${CLOSE_TARGET_FLOOR_PX}x${CLOSE_TARGET_FLOOR_PX}`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${name} — close target: ${width.toFixed(1)}x${height.toFixed(1)}`);
    } else {
      failures.push(`${name}: no close control to measure`);
      console.log(`  FAIL  ${name} — no close control to measure`);
    }
    if (Array.isArray(report.rightOverflow)) {
      const ok = report.rightOverflow.length === 0;
      if (!ok) failures.push(`${name}: ${report.rightOverflow.length} descendant(s) overflow the surface's right edge (${report.rightOverflow.slice(0, 3).join(", ")})`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${name} — no descendant overflows the right edge${ok ? "" : `: ${report.rightOverflow.slice(0, 3).join(", ")}`}`);
    }
    // The Notion-measured menu band, measured on the real production surface rather than only the
    // synthetic `role: "menu"` stand-in the "menu scrim alpha" row below mounts.
    if (MENU_ROLE_SURFACE_NAMES.includes(name)) {
      const ratio = report.scrimAlphaRatio;
      const ok = ratio != null && ratio >= MENU_SCRIM_RATIO_MIN && ratio <= MENU_SCRIM_RATIO_MAX;
      if (!ok) failures.push(`${name}: parent dim ratio ${ratio == null ? "n/a" : ratio.toFixed(3)}, wanted ${MENU_SCRIM_RATIO_MIN}-${MENU_SCRIM_RATIO_MAX}`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${name} — parent dim ratio ${ratio == null ? "n/a" : ratio.toFixed(3)} (want ${MENU_SCRIM_RATIO_MIN}-${MENU_SCRIM_RATIO_MAX})`);
    }
    console.log("");
  }

  // Negative control: one element removed from one conforming surface must go red there alone.
  const control = await page.evaluate(() => window.__sheetGrammarNegativeControl());
  const { surface, element } = NEGATIVE_CONTROL;
  console.log(`sheet-grammar: negative control — ${element} removed from ${surface}\n`);
  if (!control.removed?.mounted || control.removed.error) {
    failures.push(`negative control: ${control.removed?.error || "did not mount"}`);
    console.log(`  FAIL  negative control — ${control.removed?.error || "did not mount"}`);
  } else {
    const before = control.removed.before;
    const after = control.removed.after;
    const wentRed = before[element] === true && after[element] === false;
    const othersStayedGreen = Object.keys(after)
      .filter((key) => key !== element)
      .every((key) => after[key] === true);
    const allGreenBefore = Object.values(before).every(Boolean);
    if (!allGreenBefore) failures.push(`negative control: the control surface was not fully green before the removal`);
    if (!wentRed) failures.push(`negative control: ${element} did not go red on ${surface} when removed`);
    if (!othersStayedGreen) failures.push(`negative control: a second surface/element went red with the removal`);
    console.log(`  ${allGreenBefore ? "PASS" : "FAIL"}  ${surface} green before the removal`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  ${element} red on ${surface} after the removal`);
    console.log(`  ${othersStayedGreen ? "PASS" : "FAIL"}  every other row still green`);
    if (!control.restored) {
      failures.push(`negative control: the clean re-mount produced no sheet`);
      console.log(`  FAIL  re-mount clean — no sheet`);
    } else {
      const restoredGreen = Object.values(control.restored).every(Boolean);
      if (!restoredGreen) failures.push(`negative control: the clean re-mount did not restore green`);
      console.log(`  ${restoredGreen ? "PASS" : "FAIL"}  re-mount clean — ${element} green again`);
    }
  }
  console.log("");

  for (const pair of REGISTERED_STACKED_PAIRS) {
    const report = await page.evaluate((shape) => window.__stackedSheetGrammar(shape), pair);
    console.log(`sheet-grammar: stacked pair — ${pair.name}\n`);
    if (report.error) {
      failures.push(`${pair.name}: ${report.error}`);
      console.log(`  FAIL  ${pair.name} — ${report.error}`);
      continue;
    }
    const checks = [
      [`parent bounding box Δ≤1px (max ${report.parentDelta.toFixed(2)}px)`, report.parentBox],
      ["parent dims and scales back", report.parentTreatment],
      ["exactly one scrim", report.oneScrim],
      ["scrim between the top two sheets", report.scrimBetween],
      ["child header has title and close", report.childHeader],
      ["child close target ≥44×44", report.closeTarget],
      ["child header inset ≥16px", report.headerInset],
      ["child title ≥16px", report.titleSize],
      [`exactly one visible close control (found ${report.closeControlCount})`, report.singleCloseControl],
      [`header and body share one background (${report.headerBackground} vs ${report.bodyBackground})`, report.headerBodyBackgroundMatch],
      [`sheet root paints an opaque fill (${report.rootBackground})`, report.rootOpaque],
      // A `menu`-role child (design-trueup.md row 26) is satisfied by having no handle at all, so
      // neither the gap a handle would leave nor the drag it would offer applies to it — both are
      // read as satisfied-by-absence rather than as the "n/a"/false a handle-bearing child would
      // report for a genuinely missing element.
      report.childIsMenuCard
        ? [`handle-to-title gap: n/a (menu-role child has no handle)`, true]
        : [`handle-to-title gap ≤${HANDLE_TO_TITLE_GAP_MAX_PX}px (measured ${report.handleToTitleGap == null ? "n/a" : report.handleToTitleGap.toFixed(1) + "px"})`, report.handleToTitleGap != null && report.handleToTitleGap <= HANDLE_TO_TITLE_GAP_MAX_PX],
      ["keyboard inset belongs to child", report.childKeyboard && report.parentKeyboard],
      [`child depth ${report.depth} (want ${report.expectedDepth})`, report.depth === report.expectedDepth],
      report.childIsMenuCard
        ? ["child drag: n/a (menu-role child dismisses on tap, not drag)", true]
        : ["child drag leaves parent in place", report.dragParentUnchanged],
      [`stack settles (${report.settleRecords} body mutations while idle)`, report.settleRecords === 0],
      ["parent entrance settled before measurement", report.parentSettled],
      ["child entrance settled before measurement", report.childSettled],
    ];
    if (report.device) checks.push(
      [`device keyboard: the sheet came down on the viewport event (${report.device.droppedBottom} → ${report.device.sheetBottomVar})`, report.device.dropped && report.device.keyboard],
      [`sheet clears the note header with the keyboard up (top ${report.device.sheetTop.toFixed(1)}px ≥ header bottom ${report.device.headerBottom.toFixed(1)}px)`, report.device.clearsHeader],
      [`sheet height ≤ viewport − keyboard − header (${report.device.sheetHeight.toFixed(1)} ≤ ${(report.device.viewport - 380).toFixed(1)}; sheet ${report.device.probeSheetDisplay}/${report.device.probeSheetHeight}, content ${report.device.probeContentDisplay}/${report.device.probeContentHeight})`, report.device.heightCap],
    );
    if (report.picker) checks.push(
      [`type list: ${report.picker.rows} rows, pitch within 44–52px (min ${report.picker.pitchMin.toFixed(1)} / max ${report.picker.pitchMax.toFixed(1)})`, report.picker.rows >= 2 && report.picker.pitchOK],
      ["every type row: icon + label", report.picker.iconLabel],
      ["a gated format renders its reason inline", report.picker.reasonShown],
      ["the current format is marked", report.picker.selectedMarked],
      ["name field pinned above the list", report.picker.namePinned],
      ["16px horizontal padding (row insets)", report.picker.padding16],
      [`type list scrolls inside the sheet (${report.picker.listScrollHeight}>${report.picker.listClientHeight})`, report.picker.scrolls],
      ["no horizontal overflow (list, sheet, document)", report.picker.noHorizontal],
    );
    if (pair.child.overflow) checks.push([
      `long list scrolls with a visible fade (${report.overflowMeasured.scrollHeight}>${report.overflowMeasured.clientHeight})`,
      report.overflow,
    ]);
    if (report.childOptionRows.count > 0) checks.push([
      `child option rows clear the 44px touch floor (worst ${report.childOptionRows.minHeight.toFixed(1)}px, ${report.childOptionRows.count} rows)`,
      report.childOptionRows.minHeight >= 44,
    ]);
    for (const [label, ok] of checks) {
      if (!ok) failures.push(`${pair.name}: ${label}`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${pair.name} — ${label}`);
    }
    // The operator's phone is 402×874, not the lane's 390×844 — the phone the R6 report came
    // from. The geometry reads above (a 336px keyboard through the visual-viewport hook) and the
    // no-overflow sweep both re-run at that exact viewport once, for this one pair, so the
    // MusmNotion-shaped contract holds where the defect was actually photographed, not only where
    // the lane happens to be wide. Everything restores to 390×844 before the next pair mounts.
    if (pair.name === "properties create property" && report.device && report.picker) {
      await page.setViewportSize({ width: 402, height: 874 });
      const report402 = await page.evaluate((shape) => window.__stackedSheetGrammar(shape), pair);
      const clears402 = Boolean(report402.device?.clearsHeader);
      const overflowFree402 = Boolean(report402.picker?.noHorizontal) && report402.picker.rows === report.picker.rows;
      const ok402 = !report402.error && clears402 && overflowFree402;
      if (!ok402) failures.push(`properties create property: the 402×874 pass failed (${report402.error || `clears ${clears402}, overflowFree ${overflowFree402}`})`);
      console.log(`  ${ok402 ? "PASS" : "FAIL"}  ${pair.name} — no horizontal overflow at 402×874 (sheet top ${report402.device?.sheetTop?.toFixed(1) ?? "n/a"}px, rows ${report402.picker?.rows ?? 0})`);
      await page.setViewportSize({ width: 390, height: 844 });
    }
    console.log("");
  }

  const stackingControl = await page.evaluate(() => window.__stackedSheetGrammarNegativeControl());
  console.log("sheet-grammar: stacking negative control — child mounted without parent treatment\n");
  if (stackingControl.error) {
    failures.push(`stacking negative control: ${stackingControl.error}`);
    console.log(`  FAIL  stacking negative control — ${stackingControl.error}`);
  } else {
    const { before, oldWay, restored } = stackingControl;
    const controlBeforeGreen = before.treated === true;
    const oldWayRed = oldWay.treated === false;
    const controlRestoredGreen = restored.treated === true;
    if (!controlBeforeGreen) failures.push("stacking negative control: parent treatment was not green before the old-way mount");
    if (!oldWayRed) failures.push("stacking negative control: the old-way mount stayed green");
    if (!controlRestoredGreen) failures.push("stacking negative control: parent treatment did not return green");
    console.log(`  ${controlBeforeGreen ? "PASS" : "FAIL"}  parent treatment green before the old-way mount (opacity ${before.dim}, content transform ${before.transform})`);
    console.log(`  ${oldWayRed ? "PASS" : "FAIL"}  parent treatment red for the old-way mount (opacity ${oldWay.dim}, content transform ${oldWay.transform})`);
    console.log(`  ${controlRestoredGreen ? "PASS" : "FAIL"}  parent treatment green after restoration (opacity ${restored.dim}, content transform ${restored.transform})`);
  }
  console.log("");

  const chromeControl = await page.evaluate(() => window.__stackedSheetChromeNegativeControl());
  console.log("sheet-grammar: host-modal chrome negative control — properties edit property\n");
  if (chromeControl.error) {
    failures.push(`host-modal chrome negative control: ${chromeControl.error}`);
    console.log(`  FAIL  host-modal chrome negative control — ${chromeControl.error}`);
  } else {
    const { closeControl, background, rootFill, gap } = chromeControl;
    const closeCleanBefore = closeControl.before === 1;
    const closeWentRed = closeControl.during > 1;
    const closeCleanAfter = closeControl.after === 1;
    if (!closeCleanBefore) failures.push(`host-modal chrome negative control: close control count was ${closeControl.before} before the injection, wanted 1`);
    if (!closeWentRed) failures.push("host-modal chrome negative control: an injected second close control did not register");
    if (!closeCleanAfter) failures.push(`host-modal chrome negative control: close control count was ${closeControl.after} after removal, wanted 1`);
    console.log(`  ${closeCleanBefore ? "PASS" : "FAIL"}  exactly one close control before the injection (${closeControl.before})`);
    console.log(`  ${closeWentRed ? "PASS" : "FAIL"}  a second close control registers red (${closeControl.during})`);
    console.log(`  ${closeCleanAfter ? "PASS" : "FAIL"}  exactly one close control again after removal (${closeControl.after})`);

    const backgroundCleanBefore = background.before === true;
    const backgroundWentRed = background.during === false;
    const backgroundCleanAfter = background.after === true;
    if (!backgroundCleanBefore) failures.push("host-modal chrome negative control: header/body background did not match before the injection");
    if (!backgroundWentRed) failures.push("host-modal chrome negative control: a mismatched body background did not register");
    if (!backgroundCleanAfter) failures.push("host-modal chrome negative control: header/body background did not match again after restoration");
    console.log(`  ${backgroundCleanBefore ? "PASS" : "FAIL"}  header and body share one background before the injection`);
    console.log(`  ${backgroundWentRed ? "PASS" : "FAIL"}  a mismatched body background registers red`);
    console.log(`  ${backgroundCleanAfter ? "PASS" : "FAIL"}  header and body share one background again after restoration`);

    const rootFillCleanBefore = rootFill.before === true;
    const rootFillWentRed = rootFill.during === false;
    const rootFillCleanAfter = rootFill.after === true;
    if (!rootFillCleanBefore) failures.push("host-modal chrome negative control: the sheet root was unpainted before the injection");
    if (!rootFillWentRed) failures.push("host-modal chrome negative control: an unpainted sheet root did not register");
    if (!rootFillCleanAfter) failures.push("host-modal chrome negative control: the sheet root was unpainted again after restoration");
    console.log(`  ${rootFillCleanBefore ? "PASS" : "FAIL"}  the sheet root paints an opaque fill before the injection`);
    console.log(`  ${rootFillWentRed ? "PASS" : "FAIL"}  an unpainted sheet root registers red`);
    console.log(`  ${rootFillCleanAfter ? "PASS" : "FAIL"}  the sheet root paints an opaque fill again after restoration`);

    const gapCleanBefore = gap.before != null && gap.before <= HANDLE_TO_TITLE_GAP_MAX_PX;
    const gapWentRed = gap.during != null && gap.during > HANDLE_TO_TITLE_GAP_MAX_PX;
    const gapCleanAfter = gap.after != null && gap.after <= HANDLE_TO_TITLE_GAP_MAX_PX;
    if (!gapCleanBefore) failures.push(`host-modal chrome negative control: handle-to-title gap was ${gap.before}px before the injection, wanted <= ${HANDLE_TO_TITLE_GAP_MAX_PX}px`);
    if (!gapWentRed) failures.push("host-modal chrome negative control: an oversized handle-to-title gap did not register");
    if (!gapCleanAfter) failures.push(`host-modal chrome negative control: handle-to-title gap was ${gap.after}px after restoration, wanted <= ${HANDLE_TO_TITLE_GAP_MAX_PX}px`);
    console.log(`  ${gapCleanBefore ? "PASS" : "FAIL"}  handle-to-title gap within budget before the injection (${gap.before?.toFixed(1)}px)`);
    console.log(`  ${gapWentRed ? "PASS" : "FAIL"}  an oversized handle-to-title gap registers red (${gap.during?.toFixed(1)}px)`);
    console.log(`  ${gapCleanAfter ? "PASS" : "FAIL"}  handle-to-title gap within budget again after restoration (${gap.after?.toFixed(1)}px)`);
  }
  console.log("");

  console.log("sheet-grammar: title centring — every header-bearing surface\n");
  for (const { name, spec } of TITLE_CENTERED_SURFACES) {
    const report = await page.evaluate((scenario) => window.__shellHeaderCentering(scenario), spec);
    if (!report.mounted || !report.sheetFound) {
      failures.push(`title centring ${name}: did not mount a sheet`);
      console.log(`  FAIL  ${name} — did not mount a sheet`);
      continue;
    }
    if (!report.titleFound) {
      failures.push(`title centring ${name}: no .obnotion-shell-header title to measure`);
      console.log(`  FAIL  ${name} — no .obnotion-shell-header title to measure`);
      continue;
    }
    const ok = report.delta <= TITLE_CENTER_TOLERANCE_PX;
    if (!ok) failures.push(`title centring ${name}: title centre ${report.delta.toFixed(2)}px off the frame centre, wanted <= ${TITLE_CENTER_TOLERANCE_PX}px`);
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${name} — title centre within ${report.delta.toFixed(2)}px of the frame centre`);
  }
  console.log("");

  const columnManagerSpec = TITLE_CENTERED_SURFACES.find((s) => s.name === "column-manager").spec;
  const centeringControl = await page.evaluate((scenario) => window.__shellHeaderCenteringNegativeControl(scenario), columnManagerSpec);
  console.log("sheet-grammar: title centring negative control — column-manager's old two-slot flex row\n");
  if (centeringControl.broken == null || centeringControl.fixed == null) {
    failures.push("title centring negative control: column-manager did not mount a title to measure");
    console.log("  FAIL  title centring negative control — column-manager did not mount a title to measure");
  } else {
    const wentRed = centeringControl.broken > TITLE_CENTER_TOLERANCE_PX;
    const cleanAfter = centeringControl.fixed <= TITLE_CENTER_TOLERANCE_PX;
    if (!wentRed) failures.push(`title centring negative control: the old two-slot row measured ${centeringControl.broken.toFixed(2)}px off centre, wanted > ${TITLE_CENTER_TOLERANCE_PX}px`);
    if (!cleanAfter) failures.push(`title centring negative control: the grid rule did not restore centring (${centeringControl.fixed.toFixed(2)}px)`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  the old two-slot row goes off-centre (${centeringControl.broken.toFixed(2)}px)`);
    console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  the grid rule restores centring (${centeringControl.fixed.toFixed(2)}px)`);
  }
  console.log("");

  console.log("sheet-grammar: frame shape — the floating/flush split\n");
  for (const { name, shape, spec } of FRAME_SHAPE_SURFACES) {
    const report = await page.evaluate((scenario) => window.__sheetFrameShape(scenario), spec);
    if (!report.mounted || !report.sheetFound) {
      failures.push(`frame shape ${name}: did not mount a sheet`);
      console.log(`  FAIL  ${name} — did not mount a sheet`);
      continue;
    }
    const wantFloating = shape === "floating";
    const classOk = report.floating === wantFloating;
    if (!classOk) failures.push(`frame shape ${name}: classified as ${report.floating ? "floating" : "flush"}, wanted ${shape}`);
    console.log(`  ${classOk ? "PASS" : "FAIL"}  ${name} — classified ${report.floating ? "floating" : "flush"}, wanted ${shape}`);

    const expected = wantFloating
      ? { left: FRAME_INSET_PX, right: FRAME_INSET_PX, bottom: FRAME_INSET_PX, topLeftRadius: FRAME_RADIUS_FLOATING_PX, bottomLeftRadius: FRAME_RADIUS_FLOATING_PX }
      : { left: 0, right: 0, bottom: 0, topLeftRadius: FRAME_RADIUS_FLUSH_PX, bottomLeftRadius: 0 };
    for (const [key, want] of Object.entries(expected)) {
      const ok = Math.abs(report[key] - want) <= FRAME_GEOMETRY_TOLERANCE_PX;
      if (!ok) failures.push(`frame shape ${name}: ${key} measured ${report[key]}px, wanted ${want}px`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${name} — ${key}: ${report[key]}px (want ${want}px)`);
    }
  }
  console.log("");

  const floatingSurface = FRAME_SHAPE_SURFACES.find((s) => s.shape === "floating");
  const frameShapeControl = await page.evaluate((scenario) => window.__sheetFrameShapeNegativeControl(scenario), floatingSurface.spec);
  console.log(`sheet-grammar: frame shape negative control — ${floatingSurface.name}'s geometry neutralised\n`);
  if (!frameShapeControl.broken || !frameShapeControl.fixed) {
    failures.push("frame shape negative control: the surface did not mount a sheet to measure");
    console.log("  FAIL  frame shape negative control — the surface did not mount a sheet to measure");
  } else {
    const wentRed = frameShapeControl.broken.left === 0 && frameShapeControl.broken.topLeftRadius === FRAME_RADIUS_FLUSH_PX;
    const cleanAfter = Math.abs(frameShapeControl.fixed.left - FRAME_INSET_PX) <= FRAME_GEOMETRY_TOLERANCE_PX
      && Math.abs(frameShapeControl.fixed.topLeftRadius - FRAME_RADIUS_FLOATING_PX) <= FRAME_GEOMETRY_TOLERANCE_PX;
    if (!wentRed) failures.push("frame shape negative control: neutralising the geometry rule did not go red");
    if (!cleanAfter) failures.push("frame shape negative control: the real rule did not restore the floating geometry");
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  neutralised CSS goes flush despite the floating classification (left ${frameShapeControl.broken.left}px, radius ${frameShapeControl.broken.topLeftRadius}px)`);
    console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  the real rule restores the floating geometry (left ${frameShapeControl.fixed.left}px, radius ${frameShapeControl.fixed.topLeftRadius}px)`);
  }
  console.log("");

  console.log("sheet-grammar: confirm card — inset, radius and stacked action layout\n");
  const cardShape = await page.evaluate(() => window.__confirmCardShape());
  {
    const insetOk = Object.entries(cardShape.inset).every(([, value]) => value >= CARD_INSET_MIN_PX - CARD_GEOMETRY_TOLERANCE_PX);
    const radiusOk = Object.values(cardShape.radius).every((value) => Math.abs(value - CARD_RADIUS_PX) <= CARD_GEOMETRY_TOLERANCE_PX);
    const stackedOk = cardShape.actionFlexDirection === "column";
    const heightsOk = cardShape.buttonHeights.length > 0 && cardShape.buttonHeights.every((h) => h >= 44 - CARD_GEOMETRY_TOLERANCE_PX);
    if (!insetOk) failures.push(`confirm card: an edge inset fell under ${CARD_INSET_MIN_PX}px (${JSON.stringify(cardShape.inset)})`);
    if (!radiusOk) failures.push(`confirm card: a corner radius was not ${CARD_RADIUS_PX}px (${JSON.stringify(cardShape.radius)})`);
    if (!stackedOk) failures.push(`confirm card: actions row computed flex-direction "${cardShape.actionFlexDirection}", wanted "column"`);
    if (!heightsOk) failures.push(`confirm card: an action button fell under the 44px floor (${JSON.stringify(cardShape.buttonHeights)})`);
    console.log(`  ${insetOk ? "PASS" : "FAIL"}  inset >= ${CARD_INSET_MIN_PX}px on all four edges (${JSON.stringify(cardShape.inset)})`);
    console.log(`  ${radiusOk ? "PASS" : "FAIL"}  radius ${CARD_RADIUS_PX}px on all four corners (${JSON.stringify(cardShape.radius)})`);
    console.log(`  ${stackedOk ? "PASS" : "FAIL"}  actions stacked full width (flex-direction: ${cardShape.actionFlexDirection})`);
    console.log(`  ${heightsOk ? "PASS" : "FAIL"}  every action >= 44px tall (${JSON.stringify(cardShape.buttonHeights)})`);
  }
  console.log("");

  console.log("sheet-grammar: confirm card negative control — the card and stacked classes stripped\n");
  const cardShapeControl = await page.evaluate(() => window.__confirmCardShapeNegativeControl());
  {
    const wentRed = cardShapeControl.inset.left === 0 && cardShapeControl.actionFlexDirection !== "column";
    if (!wentRed) failures.push("confirm card negative control: stripping obnotion-sheet-card/obnotion-confirm-stacked did not go red");
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  flush left and side-by-side actions once both classes are stripped (inset.left=${cardShapeControl.inset.left}px, flex-direction=${cardShapeControl.actionFlexDirection})`);
  }
  console.log("");

  console.log("sheet-grammar: edge control token — the close control reads --obnotion-shell-edge-control-size\n");
  const edgeControlMeasured = await page.evaluate((scenario) => window.__shellEdgeControlToken(scenario), EDGE_CONTROL_TOKEN_SURFACE.spec);
  if (!edgeControlMeasured) {
    failures.push("edge control token: no close control to measure");
    console.log("  FAIL  edge control token — no close control to measure");
  } else {
    const atDefault = Math.abs(edgeControlMeasured.width - EDGE_CONTROL_TOKEN_DEFAULT_PX) <= FRAME_GEOMETRY_TOLERANCE_PX
      && Math.abs(edgeControlMeasured.height - EDGE_CONTROL_TOKEN_DEFAULT_PX) <= FRAME_GEOMETRY_TOLERANCE_PX;
    if (!atDefault) failures.push(`edge control token: close measured ${edgeControlMeasured.width.toFixed(1)}x${edgeControlMeasured.height.toFixed(1)}, wanted ${EDGE_CONTROL_TOKEN_DEFAULT_PX}x${EDGE_CONTROL_TOKEN_DEFAULT_PX}`);
    console.log(`  ${atDefault ? "PASS" : "FAIL"}  edge control token — close measures ${edgeControlMeasured.width.toFixed(1)}x${edgeControlMeasured.height.toFixed(1)}, wanted ${EDGE_CONTROL_TOKEN_DEFAULT_PX}x${EDGE_CONTROL_TOKEN_DEFAULT_PX}`);
  }

  const edgeControlControl = await page.evaluate(
    ({ scenario, overridePx }) => window.__shellEdgeControlTokenNegativeControl(scenario, overridePx),
    { scenario: EDGE_CONTROL_TOKEN_SURFACE.spec, overridePx: EDGE_CONTROL_TOKEN_OVERRIDE_PX },
  );
  console.log(`sheet-grammar: edge control token negative control — ${EDGE_CONTROL_TOKEN_SURFACE.name}'s token overridden\n`);
  if (!edgeControlControl.broken || !edgeControlControl.fixed) {
    failures.push("edge control token negative control: the surface did not mount a sheet to measure");
    console.log("  FAIL  edge control token negative control — the surface did not mount a sheet to measure");
  } else {
    const wentRed = Math.abs(edgeControlControl.broken.width - EDGE_CONTROL_TOKEN_OVERRIDE_PX) <= FRAME_GEOMETRY_TOLERANCE_PX
      && Math.abs(edgeControlControl.broken.height - EDGE_CONTROL_TOKEN_OVERRIDE_PX) <= FRAME_GEOMETRY_TOLERANCE_PX;
    const cleanAfter = Math.abs(edgeControlControl.fixed.width - EDGE_CONTROL_TOKEN_DEFAULT_PX) <= FRAME_GEOMETRY_TOLERANCE_PX
      && Math.abs(edgeControlControl.fixed.height - EDGE_CONTROL_TOKEN_DEFAULT_PX) <= FRAME_GEOMETRY_TOLERANCE_PX;
    if (!wentRed) failures.push(`edge control token negative control: overriding the token did not move the close control (measured ${edgeControlControl.broken.width.toFixed(1)}x${edgeControlControl.broken.height.toFixed(1)})`);
    if (!cleanAfter) failures.push(`edge control token negative control: removing the override did not restore ${EDGE_CONTROL_TOKEN_DEFAULT_PX}px (measured ${edgeControlControl.fixed.width.toFixed(1)}x${edgeControlControl.fixed.height.toFixed(1)})`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  overriding the token moves the close control (${edgeControlControl.broken.width.toFixed(1)}x${edgeControlControl.broken.height.toFixed(1)})`);
    console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  removing the override restores ${EDGE_CONTROL_TOKEN_DEFAULT_PX}px (${edgeControlControl.fixed.width.toFixed(1)}x${edgeControlControl.fixed.height.toFixed(1)})`);
  }
  console.log("");

  console.log(`sheet-grammar: motion timing band — the scrim's entrance reads --obnotion-sheet-enter within ${MOTION_BAND_MIN_MS}-${MOTION_BAND_MAX_MS}ms\n`);
  const motionBandMeasured = await page.evaluate((scenario) => window.__shellMotionBand(scenario), MOTION_BAND_SURFACE.spec);
  if (motionBandMeasured == null) {
    failures.push("motion timing band: no scrim to measure");
    console.log("  FAIL  motion timing band — no scrim to measure");
  } else {
    const inBand = motionBandMeasured >= MOTION_BAND_MIN_MS && motionBandMeasured <= MOTION_BAND_MAX_MS;
    const atToken = motionBandMeasured === MOTION_BAND_TOKEN_DEFAULT_MS;
    if (!inBand) failures.push(`motion timing band: scrim entrance measured ${motionBandMeasured}ms, wanted ${MOTION_BAND_MIN_MS}-${MOTION_BAND_MAX_MS}ms`);
    if (!atToken) failures.push(`motion timing band: scrim entrance measured ${motionBandMeasured}ms, wanted ${MOTION_BAND_TOKEN_DEFAULT_MS}ms (--obnotion-sheet-enter)`);
    console.log(`  ${inBand && atToken ? "PASS" : "FAIL"}  scrim entrance measures ${motionBandMeasured}ms, wanted ${MOTION_BAND_TOKEN_DEFAULT_MS}ms inside ${MOTION_BAND_MIN_MS}-${MOTION_BAND_MAX_MS}ms`);
  }

  const motionBandControl = await page.evaluate(
    ({ scenario, overrideMs }) => window.__shellMotionBandNegativeControl(scenario, overrideMs),
    { scenario: MOTION_BAND_SURFACE.spec, overrideMs: MOTION_BAND_TOKEN_OVERRIDE_MS },
  );
  console.log(`sheet-grammar: motion timing band negative control — ${MOTION_BAND_SURFACE.name}'s --obnotion-sheet-enter overridden\n`);
  if (motionBandControl.broken == null || motionBandControl.fixed == null) {
    failures.push("motion timing band negative control: the surface did not mount a scrim to measure");
    console.log("  FAIL  motion timing band negative control — the surface did not mount a scrim to measure");
  } else {
    const wentRed = motionBandControl.broken === MOTION_BAND_TOKEN_OVERRIDE_MS && motionBandControl.broken > MOTION_BAND_MAX_MS;
    const cleanAfter = motionBandControl.fixed === MOTION_BAND_TOKEN_DEFAULT_MS;
    if (!wentRed) failures.push(`motion timing band negative control: overriding --obnotion-sheet-enter did not move the scrim's duration past the band (measured ${motionBandControl.broken}ms)`);
    if (!cleanAfter) failures.push(`motion timing band negative control: removing the override did not restore ${MOTION_BAND_TOKEN_DEFAULT_MS}ms (measured ${motionBandControl.fixed}ms)`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  overriding --obnotion-sheet-enter moves the scrim past the band (${motionBandControl.broken}ms)`);
    console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  removing the override restores ${MOTION_BAND_TOKEN_DEFAULT_MS}ms (${motionBandControl.fixed}ms)`);
  }
  console.log("");

  console.log(`sheet-grammar: motion exit band — the scrim's exit reads --obnotion-sheet-exit at ${MOTION_EXIT_BAND_TOKEN_DEFAULT_MS}ms\n`);
  const motionExitMeasured = await page.evaluate((scenario) => window.__shellMotionExitBand(scenario), MOTION_BAND_SURFACE.spec);
  if (motionExitMeasured == null) {
    failures.push("motion exit band: no scrim to measure");
    console.log("  FAIL  motion exit band — no scrim to measure");
  } else {
    const atToken = motionExitMeasured === MOTION_EXIT_BAND_TOKEN_DEFAULT_MS;
    if (!atToken) failures.push(`motion exit band: scrim exit measured ${motionExitMeasured}ms, wanted ${MOTION_EXIT_BAND_TOKEN_DEFAULT_MS}ms (--obnotion-sheet-exit)`);
    console.log(`  ${atToken ? "PASS" : "FAIL"}  scrim exit measures ${motionExitMeasured}ms, wanted ${MOTION_EXIT_BAND_TOKEN_DEFAULT_MS}ms`);
  }

  const motionExitControl = await page.evaluate(
    ({ scenario, overrideMs }) => window.__shellMotionExitBandNegativeControl(scenario, overrideMs),
    { scenario: MOTION_BAND_SURFACE.spec, overrideMs: MOTION_EXIT_BAND_OVERRIDE_MS },
  );
  console.log(`sheet-grammar: motion exit band negative control — ${MOTION_BAND_SURFACE.name}'s --obnotion-sheet-exit overridden\n`);
  if (motionExitControl.broken == null || motionExitControl.fixed == null) {
    failures.push("motion exit band negative control: the surface did not mount a scrim to measure");
    console.log("  FAIL  motion exit band negative control — the surface did not mount a scrim to measure");
  } else {
    const wentRed = motionExitControl.broken === MOTION_EXIT_BAND_OVERRIDE_MS;
    const cleanAfter = motionExitControl.fixed === MOTION_EXIT_BAND_TOKEN_DEFAULT_MS;
    if (!wentRed) failures.push(`motion exit band negative control: overriding --obnotion-sheet-exit did not move the scrim's exit duration (measured ${motionExitControl.broken}ms)`);
    if (!cleanAfter) failures.push(`motion exit band negative control: removing the override did not restore ${MOTION_EXIT_BAND_TOKEN_DEFAULT_MS}ms (measured ${motionExitControl.fixed}ms)`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  overriding --obnotion-sheet-exit moves the scrim's exit duration (${motionExitControl.broken}ms)`);
    console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  removing the override restores ${MOTION_EXIT_BAND_TOKEN_DEFAULT_MS}ms (${motionExitControl.fixed}ms)`);
  }
  console.log("");

  console.log(`sheet-grammar: scrim alpha — the page under a first sheet dims through alpha ${SCRIM_ALPHA_PAGE_DEFAULT}\n`);
  const scrimAlphaMeasured = await page.evaluate((scenario) => window.__shellScrimAlpha(scenario), SCRIM_ALPHA_SURFACE.spec);
  if (scrimAlphaMeasured == null) {
    failures.push("scrim alpha: no scrim to measure");
    console.log("  FAIL  scrim alpha — no scrim to measure");
  } else {
    const atToken = Math.abs(scrimAlphaMeasured - SCRIM_ALPHA_PAGE_DEFAULT) <= 0.01;
    if (!atToken) failures.push(`scrim alpha: computed alpha ${scrimAlphaMeasured}, wanted ${SCRIM_ALPHA_PAGE_DEFAULT}`);
    console.log(`  ${atToken ? "PASS" : "FAIL"}  computed scrim alpha is ${scrimAlphaMeasured}, wanted ${SCRIM_ALPHA_PAGE_DEFAULT}`);
  }

  const scrimAlphaControl = await page.evaluate(
    ({ scenario, overrideAlpha }) => window.__shellScrimAlphaNegativeControl(scenario, overrideAlpha),
    { scenario: SCRIM_ALPHA_SURFACE.spec, overrideAlpha: SCRIM_ALPHA_OVERRIDE },
  );
  console.log(`sheet-grammar: scrim alpha negative control — ${SCRIM_ALPHA_SURFACE.name}'s --obnotion-sheet-scrim-alpha-page overridden\n`);
  if (scrimAlphaControl.broken == null || scrimAlphaControl.fixed == null) {
    failures.push("scrim alpha negative control: the surface did not mount a scrim to measure");
    console.log("  FAIL  scrim alpha negative control — the surface did not mount a scrim to measure");
  } else {
    const wentRed = Math.abs(scrimAlphaControl.broken - SCRIM_ALPHA_OVERRIDE) <= 0.01;
    const cleanAfter = Math.abs(scrimAlphaControl.fixed - SCRIM_ALPHA_PAGE_DEFAULT) <= 0.01;
    if (!wentRed) failures.push(`scrim alpha negative control: overriding the token did not move the computed alpha (measured ${scrimAlphaControl.broken})`);
    if (!cleanAfter) failures.push(`scrim alpha negative control: removing the override did not restore ${SCRIM_ALPHA_PAGE_DEFAULT} (measured ${scrimAlphaControl.fixed})`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  overriding the token moves the computed alpha (${scrimAlphaControl.broken})`);
    console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  removing the override restores ${SCRIM_ALPHA_PAGE_DEFAULT} (${scrimAlphaControl.fixed})`);
  }
  console.log("");

  console.log(`sheet-grammar: menu scrim alpha — a menu-role card's own parent dims through alpha ${SCRIM_ALPHA_MENU_DEFAULT}\n`);
  const menuScrimAlpha = await page.evaluate(() => window.__shellMenuScrimAlpha());
  if (menuScrimAlpha == null) {
    failures.push("menu scrim alpha: no scrim to measure");
    console.log("  FAIL  menu scrim alpha — no scrim to measure");
  } else {
    const atToken = Math.abs(menuScrimAlpha - SCRIM_ALPHA_MENU_DEFAULT) <= 0.01;
    if (!atToken) failures.push(`menu scrim alpha: computed alpha ${menuScrimAlpha}, wanted ${SCRIM_ALPHA_MENU_DEFAULT}`);
    console.log(`  ${atToken ? "PASS" : "FAIL"}  computed menu scrim alpha is ${menuScrimAlpha}, wanted ${SCRIM_ALPHA_MENU_DEFAULT}`);
  }
  console.log("");

  console.log(`sheet-grammar: stacked-parent filter — light theme darkens through brightness(${STACK_PARENT_FILTER_LIGHT_BRIGHTNESS}), dark theme carries none\n`);
  const stackParentFilter = await page.evaluate(() => window.__shellStackParentFilter());
  {
    const parseBrightness = (value) => {
      if (value === "none") return 1;
      const match = /brightness\(([0-9.]+)\)/.exec(value || "");
      return match ? Number.parseFloat(match[1]) : null;
    };
    const darkValue = parseBrightness(stackParentFilter.darkFilter);
    const lightValue = parseBrightness(stackParentFilter.lightFilter);
    const darkOk = darkValue === 1;
    const lightOk = lightValue != null && Math.abs(lightValue - STACK_PARENT_FILTER_LIGHT_BRIGHTNESS) <= STACK_PARENT_FILTER_TOLERANCE;
    if (!darkOk) failures.push(`stacked-parent filter: dark theme computed "${stackParentFilter.darkFilter}", wanted none (brightness 1)`);
    if (!lightOk) failures.push(`stacked-parent filter: light theme computed "${stackParentFilter.lightFilter}", wanted brightness(${STACK_PARENT_FILTER_LIGHT_BRIGHTNESS})`);
    console.log(`  ${darkOk ? "PASS" : "FAIL"}  dark theme filter is "${stackParentFilter.darkFilter}"`);
    console.log(`  ${lightOk ? "PASS" : "FAIL"}  light theme filter is "${stackParentFilter.lightFilter}", wanted brightness(${STACK_PARENT_FILTER_LIGHT_BRIGHTNESS})`);
  }

  const stackParentFilterControl = await page.evaluate(() => window.__shellStackParentFilterNegativeControl());
  console.log("sheet-grammar: stacked-parent filter negative control — light theme's filter forced to none\n");
  {
    const wentRed = stackParentFilterControl.brokenLightFilter === "none";
    const cleanAfter = /brightness\(([0-9.]+)\)/.test(stackParentFilterControl.fixedLightFilter || "")
      && Math.abs(Number.parseFloat(/brightness\(([0-9.]+)\)/.exec(stackParentFilterControl.fixedLightFilter)[1]) - STACK_PARENT_FILTER_LIGHT_BRIGHTNESS) <= STACK_PARENT_FILTER_TOLERANCE;
    if (!wentRed) failures.push(`stacked-parent filter negative control: forcing none did not read back as none (measured "${stackParentFilterControl.brokenLightFilter}")`);
    if (!cleanAfter) failures.push(`stacked-parent filter negative control: removing the override did not restore brightness(${STACK_PARENT_FILTER_LIGHT_BRIGHTNESS}) (measured "${stackParentFilterControl.fixedLightFilter}")`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  forcing filter: none reads back as "${stackParentFilterControl.brokenLightFilter}"`);
    console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  removing the override restores "${stackParentFilterControl.fixedLightFilter}"`);
  }
  console.log("");

  console.log(`sheet-grammar: row pitch — a phone menu row clears the ${ROW_PITCH_FLOOR_PX}px floor\n`);
  const rowPitchMeasured = await page.evaluate((scenario) => window.__shellRowPitch(scenario), ROW_PITCH_SURFACE.spec);
  if (rowPitchMeasured == null) {
    failures.push("row pitch: no row to measure");
    console.log("  FAIL  row pitch — no row to measure");
  } else {
    const clearsFloor = rowPitchMeasured >= ROW_PITCH_FLOOR_PX - FRAME_GEOMETRY_TOLERANCE_PX;
    if (!clearsFloor) failures.push(`row pitch: menu row measured ${rowPitchMeasured}px, wanted at least ${ROW_PITCH_FLOOR_PX}px`);
    console.log(`  ${clearsFloor ? "PASS" : "FAIL"}  menu row measures ${rowPitchMeasured}px, wanted at least ${ROW_PITCH_FLOOR_PX}px`);
  }

  const rowPitchControl = await page.evaluate((scenario) => window.__shellRowPitchNegativeControl(scenario), ROW_PITCH_SURFACE.spec);
  console.log(`sheet-grammar: row pitch negative control — ${ROW_PITCH_SURFACE.name}'s floor overridden\n`);
  if (rowPitchControl.broken == null || rowPitchControl.fixed == null) {
    failures.push("row pitch negative control: the surface did not mount a row to measure");
    console.log("  FAIL  row pitch negative control — the surface did not mount a row to measure");
  } else {
    const wentRed = rowPitchControl.broken < ROW_PITCH_FLOOR_PX - FRAME_GEOMETRY_TOLERANCE_PX;
    const cleanAfter = rowPitchControl.fixed >= ROW_PITCH_FLOOR_PX - FRAME_GEOMETRY_TOLERANCE_PX;
    if (!wentRed) failures.push(`row pitch negative control: overriding the floor did not shrink the row (measured ${rowPitchControl.broken}px)`);
    if (!cleanAfter) failures.push(`row pitch negative control: removing the override did not restore the floor (measured ${rowPitchControl.fixed}px)`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  overriding the floor shrinks the row (${rowPitchControl.broken}px)`);
    console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  removing the override restores the floor (${rowPitchControl.fixed}px)`);
  }
  console.log("");

  console.log(`sheet-grammar: primary-action pill — ${SHELL_PRIMARY_ACTION_HEIGHT_PT}pt tall, full host width minus ${PRIMARY_ACTION_PILL_INSET_PX * 2}pt of insets, disabled until valid\n`);
  const pillMeasured = await page.evaluate(() => window.__shellPrimaryActionPill());
  {
    const expectedWidth = pillMeasured.hostWidth - PRIMARY_ACTION_PILL_INSET_PX * 2;
    const widthOk = Math.abs(pillMeasured.width - expectedWidth) <= 1;
    const heightOk = Math.abs(pillMeasured.height - SHELL_PRIMARY_ACTION_HEIGHT_PT) <= 1;
    const insetLeftOk = Math.abs(pillMeasured.marginLeft - PRIMARY_ACTION_PILL_INSET_PX) <= 1;
    const insetRightOk = Math.abs(pillMeasured.marginRight - PRIMARY_ACTION_PILL_INSET_PX) <= 1;
    if (!widthOk) failures.push(`primary-action pill: width ${pillMeasured.width}px, wanted ${expectedWidth}px (host ${pillMeasured.hostWidth}px minus ${PRIMARY_ACTION_PILL_INSET_PX * 2}px)`);
    if (!heightOk) failures.push(`primary-action pill: height ${pillMeasured.height}px, wanted ${SHELL_PRIMARY_ACTION_HEIGHT_PT}px ± 1`);
    if (!insetLeftOk || !insetRightOk) failures.push(`primary-action pill: insets ${pillMeasured.marginLeft}px/${pillMeasured.marginRight}px, wanted ${PRIMARY_ACTION_PILL_INSET_PX}px ± 1 each side`);
    if (!pillMeasured.disabled) failures.push("primary-action pill: not disabled when built with disabled:true");
    console.log(`  ${widthOk ? "PASS" : "FAIL"}  width ${pillMeasured.width}px against a ${pillMeasured.hostWidth}px host minus ${PRIMARY_ACTION_PILL_INSET_PX * 2}px of insets (${expectedWidth}px)`);
    console.log(`  ${heightOk ? "PASS" : "FAIL"}  height ${pillMeasured.height}px, wanted ${SHELL_PRIMARY_ACTION_HEIGHT_PT}px ± 1`);
    console.log(`  ${insetLeftOk && insetRightOk ? "PASS" : "FAIL"}  insets ${pillMeasured.marginLeft}px / ${pillMeasured.marginRight}px, wanted ${PRIMARY_ACTION_PILL_INSET_PX}px ± 1 each side`);
    console.log(`  ${pillMeasured.disabled ? "PASS" : "FAIL"}  disabled until valid`);
  }

  const pillControl = await page.evaluate(() => window.__shellPrimaryActionPillNegativeControl());
  console.log("sheet-grammar: primary-action pill negative control — height overridden\n");
  {
    const wentRed = Math.abs(pillControl.broken.height - SHELL_PRIMARY_ACTION_HEIGHT_PT) > 1;
    const cleanAfter = Math.abs(pillControl.fixed.height - SHELL_PRIMARY_ACTION_HEIGHT_PT) <= 1;
    if (!wentRed) failures.push(`primary-action pill negative control: overriding the height did not move it off ${SHELL_PRIMARY_ACTION_HEIGHT_PT}px (measured ${pillControl.broken.height}px)`);
    if (!cleanAfter) failures.push(`primary-action pill negative control: removing the override did not restore ${SHELL_PRIMARY_ACTION_HEIGHT_PT}px (measured ${pillControl.fixed.height}px)`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  overriding the height moves it off ${SHELL_PRIMARY_ACTION_HEIGHT_PT}px (${pillControl.broken.height}px)`);
    console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  removing the override restores ${SHELL_PRIMARY_ACTION_HEIGHT_PT}px (${pillControl.fixed.height}px)`);
  }
  console.log("");

  console.log(`sheet-grammar: header chip — ${SHELL_TRAILING_CHIP_SIZE_PT} x ${SHELL_TRAILING_CHIP_SIZE_PT}px\n`);
  const chipMeasured = await page.evaluate(() => window.__shellHeaderChip());
  {
    const widthOk = Math.abs(chipMeasured.width - SHELL_TRAILING_CHIP_SIZE_PT) <= 1;
    const heightOk = Math.abs(chipMeasured.height - SHELL_TRAILING_CHIP_SIZE_PT) <= 1;
    if (!widthOk || !heightOk) failures.push(`header chip: measured ${chipMeasured.width}x${chipMeasured.height}px, wanted ${SHELL_TRAILING_CHIP_SIZE_PT}x${SHELL_TRAILING_CHIP_SIZE_PT}px ± 1`);
    console.log(`  ${widthOk && heightOk ? "PASS" : "FAIL"}  chip measures ${chipMeasured.width}x${chipMeasured.height}px, wanted ${SHELL_TRAILING_CHIP_SIZE_PT}x${SHELL_TRAILING_CHIP_SIZE_PT}px ± 1`);
  }

  const chipControl = await page.evaluate(() => window.__shellHeaderChipNegativeControl());
  console.log("sheet-grammar: header chip negative control — size overridden\n");
  {
    const wentRed = Math.abs(chipControl.broken.width - SHELL_TRAILING_CHIP_SIZE_PT) > 1 || Math.abs(chipControl.broken.height - SHELL_TRAILING_CHIP_SIZE_PT) > 1;
    const cleanAfter = Math.abs(chipControl.fixed.width - SHELL_TRAILING_CHIP_SIZE_PT) <= 1 && Math.abs(chipControl.fixed.height - SHELL_TRAILING_CHIP_SIZE_PT) <= 1;
    if (!wentRed) failures.push(`header chip negative control: overriding the size did not move it off ${SHELL_TRAILING_CHIP_SIZE_PT}px (measured ${chipControl.broken.width}x${chipControl.broken.height}px)`);
    if (!cleanAfter) failures.push(`header chip negative control: removing the override did not restore ${SHELL_TRAILING_CHIP_SIZE_PT}px (measured ${chipControl.fixed.width}x${chipControl.fixed.height}px)`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  overriding the size moves it off ${SHELL_TRAILING_CHIP_SIZE_PT}px (${chipControl.broken.width}x${chipControl.broken.height}px)`);
    console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  removing the override restores ${SHELL_TRAILING_CHIP_SIZE_PT}px (${chipControl.fixed.width}x${chipControl.fixed.height}px)`);
  }
  console.log("");

  console.log(`sheet-grammar: header block — ${HEADER_BLOCK_SURFACE.name}'s frame top edge to its first row, wanted ${HEADER_BLOCK_BAND_PX.min}-${HEADER_BLOCK_BAND_PX.max}px (reference ≈${SHELL_PHONE_HEADER_HEIGHT_PT}pt ± 4)\n`);
  const headerBlockMeasured = await page.evaluate((scenario) => window.__shellHeaderBlock(scenario), HEADER_BLOCK_SURFACE.spec);
  {
    const inBand = headerBlockMeasured != null && headerBlockMeasured >= HEADER_BLOCK_BAND_PX.min && headerBlockMeasured <= HEADER_BLOCK_BAND_PX.max;
    if (!inBand) failures.push(`header block: measured ${headerBlockMeasured}px, wanted ${HEADER_BLOCK_BAND_PX.min}-${HEADER_BLOCK_BAND_PX.max}px`);
    console.log(`  ${inBand ? "PASS" : "FAIL"}  ${HEADER_BLOCK_SURFACE.name} measures ${headerBlockMeasured}px, wanted ${HEADER_BLOCK_BAND_PX.min}-${HEADER_BLOCK_BAND_PX.max}px`);
  }

  const headerBlockControl = await page.evaluate((scenario) => window.__shellHeaderBlockNegativeControl(scenario), HEADER_BLOCK_SURFACE.spec);
  console.log("sheet-grammar: header block negative control — header top margin overridden to the pre-remediation 20px\n");
  {
    const wentRed = headerBlockControl.broken == null || headerBlockControl.broken > HEADER_BLOCK_BAND_PX.max;
    const cleanAfter = headerBlockControl.fixed != null && headerBlockControl.fixed >= HEADER_BLOCK_BAND_PX.min && headerBlockControl.fixed <= HEADER_BLOCK_BAND_PX.max;
    if (!wentRed) failures.push(`header block negative control: overriding the margin to 20px did not push it past ${HEADER_BLOCK_BAND_PX.max}px (measured ${headerBlockControl.broken}px)`);
    if (!cleanAfter) failures.push(`header block negative control: removing the override did not restore the band (measured ${headerBlockControl.fixed}px)`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  overriding the margin to 20px pushes it past ${HEADER_BLOCK_BAND_PX.max}px (${headerBlockControl.broken}px)`);
    console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  removing the override restores the band (${headerBlockControl.fixed}px)`);
  }
  console.log("");

  console.log(`sheet-grammar: handle geometry — ${HANDLE_WIDTH_PT} x ${HANDLE_HEIGHT_PT}pt at a ${HANDLE_DROP_PT}pt drop\n`);
  const handleGeometry = await page.evaluate((scenario) => window.__shellHandleGeometry(scenario), HANDLE_GEOMETRY_SURFACE.spec);
  if (!handleGeometry) {
    failures.push("handle geometry: no handle to measure");
    console.log("  FAIL  handle geometry — no handle to measure");
  } else {
    const widthOk = Math.abs(handleGeometry.width - HANDLE_WIDTH_PT) <= HANDLE_GEOMETRY_TOLERANCE_PT;
    const heightOk = Math.abs(handleGeometry.height - HANDLE_HEIGHT_PT) <= HANDLE_GEOMETRY_TOLERANCE_PT;
    const dropOk = Math.abs(handleGeometry.drop - HANDLE_DROP_PT) <= HANDLE_GEOMETRY_TOLERANCE_PT;
    if (!widthOk || !heightOk) failures.push(`handle geometry: measured ${handleGeometry.width.toFixed(1)}x${handleGeometry.height.toFixed(1)}, wanted ${HANDLE_WIDTH_PT}x${HANDLE_HEIGHT_PT}`);
    if (!dropOk) failures.push(`handle geometry: drop measured ${handleGeometry.drop.toFixed(1)}px, wanted ${HANDLE_DROP_PT}px`);
    console.log(`  ${widthOk && heightOk ? "PASS" : "FAIL"}  handle measures ${handleGeometry.width.toFixed(1)}x${handleGeometry.height.toFixed(1)}, wanted ${HANDLE_WIDTH_PT}x${HANDLE_HEIGHT_PT}`);
    console.log(`  ${dropOk ? "PASS" : "FAIL"}  handle drop measures ${handleGeometry.drop.toFixed(1)}px, wanted ${HANDLE_DROP_PT}px`);
  }
  console.log("");

  console.log(`sheet-grammar: settings sheet reference row grammar — plain rows put the control on the label's own line, consecutive plain rows sit ${SETTINGS_ROW_PITCH_MIN_PX}-${SETTINGS_ROW_PITCH_MAX_PX}px apart, a row after a row draws a 1px hairline inset ${SETTINGS_SHEET_INSET_PX}px from the left / 0px from the right, every row and section heading sits ${SETTINGS_SHEET_INSET_PX}px from the sheet's edges, the sheet mounts no native select, and stack rows keep >= ${Math.round(SETTINGS_ROW_WIDTH_RATIO_MIN * 100)}% of the sheet's inner width for their control\n`);
  const settingsRowGrammar = await page.evaluate((scenario) => window.__shellSettingsRowGrammar(scenario), SETTINGS_SHEET_SURFACE.spec);
  if (!settingsRowGrammar || settingsRowGrammar.rows.length === 0) {
    failures.push("settings sheet reference row grammar: no rows with both a label and a field to measure");
    console.log("  FAIL  settings sheet reference row grammar — no rows with both a label and a field to measure");
  } else {
    const plainRows = settingsRowGrammar.rows.filter((row) => row.plain);
    if (plainRows.length === 0) {
      failures.push("settings sheet reference row grammar: no plain setting row to measure");
      console.log("  FAIL  settings sheet reference row grammar — no plain setting row to measure");
    } else {
      const wrongDirection = plainRows.filter((row) => row.direction !== "row" || !row.sameLine);
      if (wrongDirection.length > 0) failures.push(`settings sheet reference row grammar: ${wrongDirection.length} of ${plainRows.length} plain rows do not put the control on the label's own line (first: direction ${wrongDirection[0].direction}, sameLine ${wrongDirection[0].sameLine})`);
      console.log(`  ${wrongDirection.length === 0 ? "PASS" : "FAIL"}  ${plainRows.length - wrongDirection.length}/${plainRows.length} plain rows sit label-left/control-right`);
    }
    const pitchRows = settingsRowGrammar.rows.filter((row) => row.pitchToNextPlain != null);
    if (pitchRows.length === 0) {
      failures.push("settings sheet reference row grammar: no consecutive plain-row pair to measure the pitch of");
      console.log("  FAIL  settings sheet reference row grammar — no consecutive plain-row pair to measure the pitch of");
    } else {
      const pitches = pitchRows.map((row) => row.pitchToNextPlain);
      const minPitch = Math.min(...pitches);
      const maxPitch = Math.max(...pitches);
      const offBand = pitchRows.filter((row) => row.pitchToNextPlain < SETTINGS_ROW_PITCH_MIN_PX - FRAME_GEOMETRY_TOLERANCE_PX || row.pitchToNextPlain > SETTINGS_ROW_PITCH_MAX_PX + FRAME_GEOMETRY_TOLERANCE_PX);
      if (offBand.length > 0) failures.push(`settings sheet reference row grammar: ${offBand.length} of ${pitchRows.length} plain-row pitches leave the ${SETTINGS_ROW_PITCH_MIN_PX}-${SETTINGS_ROW_PITCH_MAX_PX}px band (measured ${minPitch.toFixed(1)}-${maxPitch.toFixed(1)}px)`);
      console.log(`  ${offBand.length === 0 ? "PASS" : "FAIL"}  ${pitchRows.length - offBand.length}/${pitchRows.length} plain-row pitches sit inside ${SETTINGS_ROW_PITCH_MIN_PX}-${SETTINGS_ROW_PITCH_MAX_PX}px (measured ${minPitch.toFixed(1)}-${maxPitch.toFixed(1)}px)`);
    }
    const dividerRows = settingsRowGrammar.rows.filter((row) => row.dividerExpected);
    if (dividerRows.length === 0) {
      failures.push("settings sheet reference row grammar: no row follows another row closely enough to owe a divider");
      console.log("  FAIL  settings sheet reference row grammar — no divider-owing row");
    } else {
      const wrongDividers = dividerRows.filter((row) => !row.divider
        || Math.abs(row.divider.height - 1) > 0.5
        || Math.abs(row.divider.left - SETTINGS_SHEET_INSET_PX) > 0.5
        || Math.abs(row.divider.right) > 0.5
        || (Number.isFinite(row.divider.width) && row.divider.width > 0 && Math.abs(row.divider.width - (row.rowWidth - SETTINGS_SHEET_INSET_PX)) > 1)
        || row.divider.color === "transparent"
        || row.divider.color === "rgba(0, 0, 0, 0)");
      if (wrongDividers.length > 0) failures.push(`settings sheet reference row grammar: ${wrongDividers.length} of ${dividerRows.length} divider-owing rows do not draw a 1px hairline inset ${SETTINGS_SHEET_INSET_PX}px left / 0px right`);
      console.log(`  ${wrongDividers.length === 0 ? "PASS" : "FAIL"}  ${dividerRows.length - wrongDividers.length}/${dividerRows.length} divider-owing rows draw the reference hairline`);
    }
    const insetOffRows = settingsRowGrammar.rows.filter((row) => Math.abs(row.paddingLeft - SETTINGS_SHEET_INSET_PX) > 0.5);
    const sectionsOff = (settingsRowGrammar.sections || []).filter((section) => Math.abs(section.paddingLeft - SETTINGS_SHEET_INSET_PX) > 0.5);
    if (insetOffRows.length > 0) failures.push(`settings sheet reference row grammar: ${insetOffRows.length} rows do not sit ${SETTINGS_SHEET_INSET_PX}px from the sheet's edges`);
    if (sectionsOff.length > 0) failures.push(`settings sheet reference row grammar: ${sectionsOff.length} section headings do not sit ${SETTINGS_SHEET_INSET_PX}px from the sheet's edges`);
    console.log(`  ${insetOffRows.length === 0 && sectionsOff.length === 0 ? "PASS" : "FAIL"}  rows and section headings sit ${SETTINGS_SHEET_INSET_PX}px from the sheet's edges (${settingsRowGrammar.rows.length} rows, ${(settingsRowGrammar.sections || []).length} headings)`);
    const sectionsDividers = (settingsRowGrammar.sections || []).filter((section) => section.dividerExpected);
    if (sectionsDividers.length > 0) {
      const sectionsWrong = sectionsDividers.filter((section) => !section.divider
        || Math.abs(section.divider.height - 1) > 0.5
        || Math.abs(section.divider.left - SETTINGS_SHEET_INSET_PX) > 0.5
        || Math.abs(section.divider.right) > 0.5
        || section.divider.color === "transparent"
        || section.divider.color === "rgba(0, 0, 0, 0)");
      if (sectionsWrong.length > 0) failures.push(`settings sheet reference row grammar: ${sectionsWrong.length} of ${sectionsDividers.length} section headings do not carry the reference hairline`);
      console.log(`  ${sectionsWrong.length === 0 ? "PASS" : "FAIL"}  ${sectionsDividers.length - sectionsWrong.length}/${sectionsDividers.length} section headings carry the reference hairline`);
    }
    if (settingsRowGrammar.nativeSelectCount !== 0) failures.push(`settings sheet reference row grammar: the sheet mounts ${settingsRowGrammar.nativeSelectCount} native <select> element(s) instead of the plugin's own picker`);
    console.log(`  ${settingsRowGrammar.nativeSelectCount === 0 ? "PASS" : "FAIL"}  the sheet mounts ${settingsRowGrammar.nativeSelectCount} native select(s) — every choice goes through the plugin's own picker`);
    const stackRows = settingsRowGrammar.rows.filter((row) => row.stack);
    if (stackRows.length === 0) {
      console.log("  PASS  0 stack rows — this scenario mounts no wide editor to width-check");
    } else {
      const narrowStacks = stackRows.filter((row) => row.fieldWidth < row.rowInnerWidth * SETTINGS_ROW_WIDTH_RATIO_MIN - FRAME_GEOMETRY_TOLERANCE_PX);
      if (narrowStacks.length > 0) failures.push(`settings sheet reference row grammar: ${narrowStacks.length} of ${stackRows.length} stack rows give their control less than ${Math.round(SETTINGS_ROW_WIDTH_RATIO_MIN * 100)}% of the sheet's inner width`);
      console.log(`  ${narrowStacks.length === 0 ? "PASS" : "FAIL"}  ${stackRows.length - narrowStacks.length}/${stackRows.length} stack rows keep their control at >= ${Math.round(SETTINGS_ROW_WIDTH_RATIO_MIN * 100)}% of the sheet's inner width`);
    }
    const scrollExtent = settingsRowGrammar.sheetScrollExtent ?? settingsRowGrammar.sheetScrollWidth;
    const noOverflow = scrollExtent <= settingsRowGrammar.sheetClientWidth + FRAME_GEOMETRY_TOLERANCE_PX;
    if (!noOverflow) failures.push(`settings sheet reference row grammar: sheet scrollWidth extent ${scrollExtent} exceeds clientWidth ${settingsRowGrammar.sheetClientWidth}`);
    console.log(`  ${noOverflow ? "PASS" : "FAIL"}  sheet scrollWidth extent (${scrollExtent}) === clientWidth (${settingsRowGrammar.sheetClientWidth})`);
  }
  console.log("");

  const settingsRowGrammarControl = await page.evaluate((scenario) => window.__shellSettingsRowGrammarNegativeControl(scenario), SETTINGS_SHEET_SURFACE.spec);
  console.log("sheet-grammar: settings sheet reference row grammar negative control — the reference grammar's direction, cushion, hairlines and heading inset all reverted\n");
  if (!settingsRowGrammarControl.broken || !settingsRowGrammarControl.fixed || settingsRowGrammarControl.broken.rows.length === 0 || settingsRowGrammarControl.fixed.rows.length === 0) {
    failures.push("settings sheet reference row grammar negative control: the surface did not mount rows to measure");
    console.log("  FAIL  settings sheet reference row grammar negative control — the surface did not mount rows to measure");
  } else {
    const aspectState = (grammar) => {
      const plain = grammar.rows.filter((row) => row.plain);
      const wrongDirection = plain.filter((row) => row.direction !== "row" || !row.sameLine).length;
      const pitchRows = grammar.rows.filter((row) => row.pitchToNextPlain != null);
      const offPitch = pitchRows.filter((row) => row.pitchToNextPlain < SETTINGS_ROW_PITCH_MIN_PX - FRAME_GEOMETRY_TOLERANCE_PX || row.pitchToNextPlain > SETTINGS_ROW_PITCH_MAX_PX + FRAME_GEOMETRY_TOLERANCE_PX).length;
      const owed = [
        ...grammar.rows.filter((row) => row.dividerExpected),
        ...(grammar.sections || []).filter((section) => section.dividerExpected),
      ];
      const wrongDividers = owed.filter((rule) => !rule.divider
        || Math.abs(rule.divider.height - 1) > 0.5
        || Math.abs(rule.divider.left - SETTINGS_SHEET_INSET_PX) > 0.5
        || Math.abs(rule.divider.right) > 0.5).length;
      const insetOff =
        grammar.rows.filter((row) => Math.abs(row.paddingLeft - SETTINGS_SHEET_INSET_PX) > 0.5).length +
        (grammar.sections || []).filter((section) => Math.abs(section.paddingLeft - SETTINGS_SHEET_INSET_PX) > 0.5).length;
      return { wrongDirection, offPitch, wrongDividers, insetOff, owed: owed.length };
    };
    const broken = aspectState(settingsRowGrammarControl.broken);
    const fixed = aspectState(settingsRowGrammarControl.fixed);
    const wentRed = broken.wrongDirection > 0;
    const pitchWentRed = broken.offPitch > 0;
    const dividersWentRed = broken.wrongDividers > 0;
    const insetWentRed = broken.insetOff > 0;
    const cleanAfter = fixed.wrongDirection === 0 && fixed.offPitch === 0 && fixed.wrongDividers === 0 && fixed.insetOff === 0;
    if (!wentRed) failures.push("settings sheet reference row grammar negative control: reverting the direction did not unline any plain row");
    if (!pitchWentRed) failures.push("settings sheet reference row grammar negative control: the 12px cushion did not push any plain-row pitch out of the band");
    if (!dividersWentRed) failures.push("settings sheet reference row grammar negative control: stripping the hairlines left every divider-owing row apparently correct");
    if (!insetWentRed) failures.push("settings sheet reference row grammar negative control: the 12px inset overrides did not read as off-inset");
    if (!cleanAfter) failures.push(`settings sheet reference row grammar negative control: removing the overrides left the grammar wrong (direction ${fixed.wrongDirection}, pitch ${fixed.offPitch}, divider ${fixed.wrongDividers}, inset ${fixed.insetOff})`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  reverting the direction unlines plain rows (${broken.wrongDirection})`);
    console.log(`  ${pitchWentRed ? "PASS" : "FAIL"}  the cushion pushes pitches out of the band (${broken.offPitch})`);
    console.log(`  ${dividersWentRed ? "PASS" : "FAIL"}  stripping loses the hairlines (${broken.wrongDividers} of ${broken.owed})`);
    console.log(`  ${insetWentRed ? "PASS" : "FAIL"}  the 12px inset overrides read off-inset (${broken.insetOff})`);
    console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  removing the overrides restores the grammar`);
  }
  console.log("");

  console.log(`sheet-grammar: settings sheet placement-button ink — .obnotion-new-placement-option text stays inside its own box at ${SETTINGS_PLACEMENT_FONT_SIZES.map((s) => s.px).join("px and ")}px\n`);
  for (const { px: fontSizePx } of SETTINGS_PLACEMENT_FONT_SIZES) {
    const measured = await page.evaluate(
      ({ scenario, fontSizePx }) => window.__shellSettingsPlacementInk(scenario, fontSizePx),
      { scenario: SETTINGS_SHEET_SURFACE.spec, fontSizePx },
    );
    if (!measured || measured.length === 0) {
      failures.push(`settings sheet placement-button ink: no .obnotion-new-placement-option buttons to measure at ${fontSizePx}px`);
      console.log(`  FAIL  settings sheet placement-button ink — no buttons to measure at ${fontSizePx}px`);
      continue;
    }
    const overflowing = measured.filter((b) => b.overflowX === "visible" && b.scrollWidth - b.clientWidth > OVERFLOW_TOLERANCE_PX);
    const clean = overflowing.length === 0;
    if (!clean) {
      const worst = Math.max(...overflowing.map((b) => b.scrollWidth - b.clientWidth));
      failures.push(`settings sheet placement-button ink: ${overflowing.length}/${measured.length} buttons paint ink outside their own box at ${fontSizePx}px (worst ${worst.toFixed(1)}px)`);
    }
    console.log(`  ${clean ? "PASS" : "FAIL"}  ${measured.length - overflowing.length}/${measured.length} buttons stay inside their own box at ${fontSizePx}px`);
  }
  console.log("");

  console.log("sheet-grammar: settings sheet placement-button ink negative control — the placement-button wrap rule's white-space/justify-content/height reverted\n");
  for (const { px: fontSizePx, expectRed } of SETTINGS_PLACEMENT_FONT_SIZES) {
    const control = await page.evaluate(
      ({ scenario, fontSizePx }) => window.__shellSettingsPlacementInkNegativeControl(scenario, fontSizePx),
      { scenario: SETTINGS_SHEET_SURFACE.spec, fontSizePx },
    );
    if (!control.broken || !control.fixed || control.broken.length === 0 || control.fixed.length === 0) {
      failures.push(`settings sheet placement-button ink negative control: no buttons to measure at ${fontSizePx}px`);
      console.log(`  FAIL  settings sheet placement-button ink negative control — no buttons to measure at ${fontSizePx}px`);
      continue;
    }
    const brokenOverflowing = control.broken.filter((b) => b.overflowX === "visible" && b.scrollWidth - b.clientWidth > OVERFLOW_TOLERANCE_PX);
    const fixedOverflowing = control.fixed.filter((b) => b.overflowX === "visible" && b.scrollWidth - b.clientWidth > OVERFLOW_TOLERANCE_PX);
    // The measured red/green data only shows a red at this sheet's widened option width for the sizes
    // `expectRed` marks — at 15px the string fits nowrap regardless, so requiring red there would
    // fail the control at a size the fix never moved. Every size still has to come back clean.
    const wentRed = expectRed ? brokenOverflowing.length > 0 : true;
    const cleanAfter = fixedOverflowing.length === 0;
    if (!wentRed) failures.push(`settings sheet placement-button ink negative control: reverting the wrap rule did not overflow any button at ${fontSizePx}px`);
    if (!cleanAfter) failures.push(`settings sheet placement-button ink negative control: removing the override left ${fixedOverflowing.length} button(s) overflowing at ${fontSizePx}px`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  reverting the wrap rule ${expectRed ? "overflows" : "leaves (as expected, too narrow a string to matter here)"} ${brokenOverflowing.length}/${control.broken.length} buttons at ${fontSizePx}px`);
    console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  removing the override leaves 0/${control.fixed.length} buttons overflowing at ${fontSizePx}px`);
  }
  console.log("");

  console.log(`sheet-grammar: record sheet — the reference row grammar: one property per row, label left / value right on one line at 44–52px, on the shared 16px inset, a hairline under every row but the last, section headings on the same inset, no native select\n`);
  const recordRowGrammar = await page.evaluate((scenario) => window.__shellRecordRowGrammar(scenario), RECORD_SHEET_SURFACE.spec);
  if (!recordRowGrammar || recordRowGrammar.rows.length === 0) {
    failures.push("record sheet: no property rows to measure");
    console.log("  FAIL  record sheet — no property rows to measure");
  } else {
    const compactRows = recordRowGrammar.rows.filter((row) => row.compact);
    if (compactRows.length === 0) {
      failures.push("record sheet: no compact one-line property rows to measure");
      console.log("  FAIL  record sheet — no compact one-line property rows to measure");
    } else {
      const lineCount = compactRows.filter((row) => row.oneLine).length;
      const pitchCount = compactRows.filter((row) => row.rowHeight >= SETTINGS_ROW_PITCH_MIN_PX && row.rowHeight <= SETTINGS_ROW_PITCH_MAX_PX).length;
      if (lineCount !== compactRows.length) failures.push(`record sheet: ${compactRows.length - lineCount} of ${compactRows.length} property rows do not sit label-beside-value on one line`);
      if (pitchCount !== compactRows.length) failures.push(`record sheet: ${compactRows.length - pitchCount} of ${compactRows.length} property rows sit outside the ${SETTINGS_ROW_PITCH_MIN_PX}–${SETTINGS_ROW_PITCH_MAX_PX}px pitch window`);
      console.log(`  ${lineCount === compactRows.length ? "PASS" : "FAIL"}  ${lineCount}/${compactRows.length} property rows sit label-beside-value on one line`);
      console.log(`  ${pitchCount === compactRows.length ? "PASS" : "FAIL"}  ${pitchCount}/${compactRows.length} property rows pitch between ${SETTINGS_ROW_PITCH_MIN_PX} and ${SETTINGS_ROW_PITCH_MAX_PX}px`);
      console.log(`        property row heights: ${compactRows.map((row) => row.rowHeight.toFixed(1)).join(", ")}`);
    }
    const hairlines = recordRowGrammar.rows.filter((row) => row.borderBottomWidth === "1px").length;
    const lastIsBare = recordRowGrammar.lastRowBorderBottom === "0px";
    const hairlineOk = hairlines === recordRowGrammar.rows.length - 1 && lastIsBare;
    if (!hairlineOk) failures.push(`record sheet: the under-row hairline measures wrong (${hairlines}/${recordRowGrammar.rows.length - 1} at 1px, last ${recordRowGrammar.lastRowBorderBottom})`);
    console.log(`  ${hairlineOk ? "PASS" : "FAIL"}  a 1px hairline sits under every property row but the last (${hairlines}/${recordRowGrammar.rows.length - 1}, last: ${recordRowGrammar.lastRowBorderBottom})`);
    const insetOk = recordRowGrammar.inset != null && Math.abs(recordRowGrammar.inset - SETTINGS_SHEET_INSET_PX) <= FRAME_GEOMETRY_TOLERANCE_PX;
    if (!insetOk) failures.push(`record sheet: the rows' shared inset measures ${recordRowGrammar.inset == null ? "n/a" : recordRowGrammar.inset.toFixed(1) + "px"}, wanted ${SETTINGS_SHEET_INSET_PX}px`);
    console.log(`  ${insetOk ? "PASS" : "FAIL"}  the rows sit on the shared ${SETTINGS_SHEET_INSET_PX}px inset (measured ${recordRowGrammar.inset == null ? "n/a" : recordRowGrammar.inset.toFixed(1) + "px"}, sheet padding-left ${recordRowGrammar.sheetPaddingLeft}px)`);
    if (recordRowGrammar.sectionHeaders.length === 0) {
      failures.push("record sheet: no section headings to measure — the disclosure's divider grammar has nothing to read");
      console.log("  FAIL  record sheet — no section headings to measure");
    } else {
      const badHeaders = recordRowGrammar.sectionHeaders.filter((header) => header.borderTopWidth !== "1px" || Math.abs(header.inset - SETTINGS_SHEET_INSET_PX) > FRAME_GEOMETRY_TOLERANCE_PX);
      if (badHeaders.length > 0) failures.push(`record sheet: ${badHeaders.length} of ${recordRowGrammar.sectionHeaders.length} section headings miss the shared ${SETTINGS_SHEET_INSET_PX}px inset behind a 1px divider`);
      console.log(`  ${badHeaders.length === 0 ? "PASS" : "FAIL"}  ${recordRowGrammar.sectionHeaders.length}/${recordRowGrammar.sectionHeaders.length} section headings sit on the shared ${SETTINGS_SHEET_INSET_PX}px inset behind a 1px divider (${recordRowGrammar.sectionHeaders.map((h) => `${h.inset.toFixed(1)}px/${h.borderTopWidth}`).join(", ")})`);
    }
    const noNativeSelect = recordRowGrammar.selectCount === 0;
    if (!noNativeSelect) failures.push(`record sheet: ${recordRowGrammar.selectCount} native select(s) — the pickers here are the sheet's own stacked menus`);
    console.log(`  ${noNativeSelect ? "PASS" : "FAIL"}  no native select on the sheet (native selects: ${recordRowGrammar.selectCount})`);
    const noOverflow = recordRowGrammar.sheetScrollExtent <= recordRowGrammar.sheetClientWidth + FRAME_GEOMETRY_TOLERANCE_PX;
    if (!noOverflow) failures.push(`record sheet: sheet scrollWidth ${recordRowGrammar.sheetScrollWidth} (extent ${recordRowGrammar.sheetScrollExtent}) exceeds clientWidth ${recordRowGrammar.sheetClientWidth}`);
    console.log(`  ${noOverflow ? "PASS" : "FAIL"}  sheet scrollWidth (${recordRowGrammar.sheetScrollWidth}, extent ${recordRowGrammar.sheetScrollExtent}) <= clientWidth (${recordRowGrammar.sheetClientWidth}) — no horizontal overflow at 402px`);
  }
  console.log("");

  const recordRowControl = await page.evaluate((scenario) => window.__shellRecordRowGrammarNegativeControl(scenario), RECORD_SHEET_SURFACE.spec);
  console.log("sheet-grammar: record sheet row grammar negative control — the shared inset and the 44px row floor, reverted together\n");
  if (!recordRowControl.broken || !recordRowControl.fixed || recordRowControl.broken.rows.length === 0 || recordRowControl.fixed.rows.length === 0) {
    failures.push("record sheet row grammar negative control: the surface did not mount property rows to measure");
    console.log("  FAIL  record sheet row grammar negative control — the surface did not mount property rows to measure");
  } else {
    const compactBroken = recordRowControl.broken.rows.filter((row) => row.compact);
    const compactFixed = recordRowControl.fixed.rows.filter((row) => row.compact);
    const shortBroken = compactBroken.filter((row) => row.rowHeight < SETTINGS_ROW_PITCH_MIN_PX).length;
    const brokenInset = recordRowControl.broken.inset;
    const wentRed = (compactBroken.length > 0 && shortBroken === compactBroken.length)
      || (brokenInset != null && Math.abs(brokenInset - SETTINGS_SHEET_INSET_PX) > FRAME_GEOMETRY_TOLERANCE_PX);
    const pitchFixed = compactFixed.length > 0 && compactFixed.every((row) => row.rowHeight >= SETTINGS_ROW_PITCH_MIN_PX && row.rowHeight <= SETTINGS_ROW_PITCH_MAX_PX);
    const insetFixed = recordRowControl.fixed.inset != null && Math.abs(recordRowControl.fixed.inset - SETTINGS_SHEET_INSET_PX) <= FRAME_GEOMETRY_TOLERANCE_PX;
    if (!wentRed) failures.push(`record sheet row grammar negative control: reverting the inset and the row floor measured green (inset ${brokenInset == null ? "n/a" : brokenInset.toFixed(1) + "px"}, ${compactBroken.length - shortBroken}/${compactBroken.length} rows still in the pitch window)`);
    if (compactFixed.length > 0 && !(pitchFixed && insetFixed)) failures.push(`record sheet row grammar negative control: removing the override did not restore the grammar (pitch ${pitchFixed}, inset ${insetFixed})`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  reverting the inset and the floor goes red (inset ${brokenInset == null ? "n/a" : brokenInset.toFixed(1) + "px"}, ${shortBroken}/${compactBroken.length} rows under the floor)`);
    console.log(`  ${pitchFixed && insetFixed ? "PASS" : "FAIL"}  removing the override restores the grammar (pitch ok: ${pitchFixed}, inset back to ${SETTINGS_SHEET_INSET_PX}px: ${insetFixed})`);
  }
  console.log("");
  // The panel sheets' reference row grammar. Thresholds, not echoes: 44–52px pitch, one 16px
  // inset, 1px divider, no native select, no sideways scroll. Every clause prints what it
  // measured so the gap between red and green is a number, never a shrug.
  console.log("sheet-grammar: panel sheets row grammar — filter / sort / group: rows 44–52px, one 16px inset, 1px divider, plugin's own picker, no sideways scroll\n");
  const PANEL_ROW_PITCH_MIN_PX = 44;
  const PANEL_ROW_PITCH_MAX_PX = 52;
  const PANEL_SHEET_INSET_PX = 16;
  const groupSpec = REGISTERED_SURFACES.find((s) => s.name === "group");
  if (!groupSpec) {
    failures.push("panel sheets row grammar: the group surface is not in the registry");
    console.log("  FAIL  panel sheets row grammar — the group surface is not in the registry");
  }
  for (const [surfaceName, scenario] of [
    ["filter-panel", REGISTERED_SURFACES.find((s) => s.name === "filter-panel")?.spec],
    ["sort-panel", REGISTERED_SURFACES.find((s) => s.name === "sort-panel")?.spec],
    ["group", groupSpec?.spec],
  ]) {
    if (!scenario) continue;
    const measured = await page.evaluate((spec) => window.__shellPanelSheetGrammar(spec), scenario);
    if (!measured) {
      failures.push(`panel sheets row grammar (${surfaceName}): the surface did not mount as a sheet`);
      console.log(`  FAIL  ${surfaceName} — did not mount as a sheet`);
      continue;
    }
    if (measured.rows.length === 0) {
      failures.push(`panel sheets row grammar (${surfaceName}): no rows mounted to measure`);
      console.log(`  FAIL  ${surfaceName} — no rows mounted to measure`);
      continue;
    }
    const offPitch = measured.rows.filter((row) => row.height < PANEL_ROW_PITCH_MIN_PX || row.height > PANEL_ROW_PITCH_MAX_PX);
    if (offPitch.length > 0) failures.push(`panel sheets row grammar (${surfaceName}): ${offPitch.length}/${measured.rows.length} rows outside the 44–52px window (worst ${Math.min(...measured.rows.map((r) => r.height)).toFixed(1)}–${Math.max(...measured.rows.map((r) => r.height)).toFixed(1)}px)`);
    console.log(`  ${offPitch.length === 0 ? "PASS" : "FAIL"}  ${surfaceName} — ${measured.rows.length - offPitch.length}/${measured.rows.length} rows inside 44–52px (heights ${measured.rows.map((r) => r.height).join(", ")})`);
    const insetOff = [measured.panelPaddingLeft, measured.panelPaddingRight].filter((value) => Math.abs(value - PANEL_SHEET_INSET_PX) > FRAME_GEOMETRY_TOLERANCE_PX);
    if (insetOff.length > 0) failures.push(`panel sheets row grammar (${surfaceName}): panel insets ${measured.panelPaddingLeft}/${measured.panelPaddingRight}px, wanted ${PANEL_SHEET_INSET_PX}px`);
    console.log(`  ${insetOff.length === 0 ? "PASS" : "FAIL"}  ${surfaceName} — panel padding ${measured.panelPaddingLeft}px/${measured.panelPaddingRight}px (want ${PANEL_SHEET_INSET_PX}px)`);
    const rowWidths = measured.rows.map((row) => row.width);
    const widest = Math.max(...rowWidths);
    const narrowest = Math.min(...rowWidths);
    const spread = Number((widest - narrowest).toFixed(2));
    if (spread > 2 * FRAME_GEOMETRY_TOLERANCE_PX) failures.push(`panel sheets row grammar (${surfaceName}): row widths span ${narrowest}–${widest}px (${spread}px) — rows do not share one inset-to-inset span`);
    console.log(`  ${spread <= 2 * FRAME_GEOMETRY_TOLERANCE_PX ? "PASS" : "FAIL"}  ${surfaceName} — one inset-to-inset row span (widest ${widest}px, narrowest ${narrowest}px)`);
    const labelRows = measured.rows.filter((row) => row.controlRightOfLabel !== null);
    const mispair = labelRows.filter((row) => !row.controlRightOfLabel);
    if (labelRows.length > 0 && mispair.length > 0) failures.push(`panel sheets row grammar (${surfaceName}): ${mispair.length}/${labelRows.length} label+control rows have the control left of its label`);
    if (labelRows.length > 0) console.log(`  ${mispair.length === 0 ? "PASS" : "FAIL"}  ${surfaceName} — ${labelRows.length - mispair.length}/${labelRows.length} label+control rows pair control right of label`);
    if (measured.selectCount > 0) failures.push(`panel sheets row grammar (${surfaceName}): ${measured.selectCount} native select(s) on the sheet`);
    console.log(`  ${measured.selectCount === 0 ? "PASS" : "FAIL"}  ${surfaceName} — native selects: ${measured.selectCount} (want 0; the picker is the plugin's own)`);
    if (measured.sectionTitles.length > 0) {
      const insetWanted = PANEL_SHEET_INSET_PX;
      const headOff = measured.sectionTitles.filter((title) => Math.abs(title.paddingLeft - insetWanted) > FRAME_GEOMETRY_TOLERANCE_PX || Math.abs(title.paddingRight - insetWanted) > FRAME_GEOMETRY_TOLERANCE_PX);
      if (headOff.length > 0) failures.push(`panel sheets row grammar (${surfaceName}): ${headOff.length}/${measured.sectionTitles.length} section headings off the ${insetWanted}px inset (${measured.sectionTitles.map((t) => `${t.paddingLeft}/${t.paddingRight}`).join(", ")})`);
      const dividers = measured.sectionTitles.map((title) => title.borderTopWidth);
      const dividerOk = dividers.every((width, index) => (index === 0 ? Number.parseFloat(width) === 0 : Number.parseFloat(width) === 1));
      if (!dividerOk) failures.push(`panel sheets row grammar (${surfaceName}): heading dividers ${dividers.join(", ")}px do not follow the first-0px/later-1px rule`);
      const tokenless = measured.sectionTitles.filter((title) => title.borderTopWidth === "1px" && title.borderTopColor === "rgba(0, 0, 0, 0)");
      if (tokenless.length > 0) failures.push(`panel sheets row grammar (${surfaceName}): ${tokenless.length} divider(s) compute to the transparent initial — the divider token resolved to nothing`);
      console.log(`  ${headOff.length === 0 ? "PASS" : "FAIL"}  ${surfaceName} — ${measured.sectionTitles.length} section heading(s) on the ${insetWanted}px inset (${measured.sectionTitles.map((t) => `${t.paddingLeft}/${t.paddingRight}`).join(", ")})`);
      console.log(`  ${dividerOk && tokenless.length === 0 ? "PASS" : "FAIL"}  ${surfaceName} — heading dividers ${dividers.join(", ") + "px"} (first 0px, later 1px, painted)`);
    }
    const noOverflow = measured.sheetScrollExtent <= measured.sheetClientWidth + FRAME_GEOMETRY_TOLERANCE_PX;
    if (!noOverflow) failures.push(`panel sheets row grammar (${surfaceName}): sheet extent ${measured.sheetScrollExtent} exceeds clientWidth ${measured.sheetClientWidth}${measured.farthestChild ? ` — farthest margin edge ${measured.farthestChild.reach}px: ${measured.farthestChild.node} (${measured.farthestChild.width}px, margin-right ${measured.farthestChild.marginRight}px)` : ""}`);
    console.log(`  ${noOverflow ? "PASS" : "FAIL"}  ${surfaceName} — extent ${measured.sheetScrollExtent} == clientWidth ${measured.sheetClientWidth} (scrollWidth ${measured.sheetScrollWidth} minus the sheet's 1px left border)`);
    console.log("");
  }

  // A control that has never been observed red is not evidence: the inset clause reverted.
  const panelControl = await page.evaluate((spec) => window.__shellPanelSheetGrammarControl(spec), groupSpec?.spec);
  if (!panelControl || !panelControl.broken || !panelControl.fixed) {
    failures.push("panel sheets row grammar negative control: the surface did not mount to measure");
    console.log("  FAIL  panel sheets row grammar negative control — the surface did not mount");
  } else {
    const wentRed = Math.abs(panelControl.broken.panelPaddingLeft - PANEL_SHEET_INSET_PX) > FRAME_GEOMETRY_TOLERANCE_PX;
    const cleanAfter = Math.abs(panelControl.fixed.panelPaddingLeft - PANEL_SHEET_INSET_PX) <= FRAME_GEOMETRY_TOLERANCE_PX;
    if (!wentRed) failures.push(`panel sheets row grammar negative control: reverting the inset did not move the measured padding (${panelControl.broken.panelPaddingLeft}px)`);
    if (!cleanAfter) failures.push(`panel sheets row grammar negative control: removing the override did not restore the inset (${panelControl.fixed.panelPaddingLeft}px)`);
    console.log(`  ${panelControl.broken.panelPaddingLeft !== PANEL_SHEET_INSET_PX ? "PASS" : "FAIL"}  reverting the inset rule moves the measured panel padding (${panelControl.broken.panelPaddingLeft}px)`);
    console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  restoring it returns the inset (${panelControl.fixed.panelPaddingLeft}px)`);
    console.log("");
  }

  console.log("sheet-grammar: depth cap — a third sheet on a panel-role parent replaces instead of stacking\n");
  const depthCapReplace = await page.evaluate(() => window.__shellDepthCapReplace());
  {
    const noNewSheet = depthCapReplace.afterSheets === depthCapReplace.beforeSheets;
    const childNotIndependent = depthCapReplace.childBecameSheet === false;
    const grafted = depthCapReplace.childGraftedIntoParent === true;
    const titleSwapped = depthCapReplace.parentHeaderTitle === "Child Title";
    const backShown = depthCapReplace.parentHasBack === true;
    if (!noNewSheet) failures.push(`depth cap: sheet count moved from ${depthCapReplace.beforeSheets} to ${depthCapReplace.afterSheets} — the third level stacked instead of replacing`);
    if (!childNotIndependent) failures.push("depth cap: the third surface still became its own independent sheet");
    if (!grafted) failures.push("depth cap: the third surface's content was not grafted into the parent");
    if (!titleSwapped) failures.push(`depth cap: parent header title reads "${depthCapReplace.parentHeaderTitle}", wanted "Child Title"`);
    if (!backShown) failures.push("depth cap: no back control appeared on the parent after the replace");
    console.log(`  ${noNewSheet && childNotIndependent ? "PASS" : "FAIL"}  no third stacked sheet (${depthCapReplace.beforeSheets} sheets before, ${depthCapReplace.afterSheets} after)`);
    console.log(`  ${grafted ? "PASS" : "FAIL"}  the child's content was grafted into the parent`);
    console.log(`  ${titleSwapped ? "PASS" : "FAIL"}  the parent header title swapped to "${depthCapReplace.parentHeaderTitle}"`);
    console.log(`  ${backShown ? "PASS" : "FAIL"}  a back control appeared on the parent`);
    const notPlaced = depthCapReplace.childPosition !== "fixed";
    const contained = depthCapReplace.childInsideParentRect === true;
    if (!notPlaced) failures.push(`depth cap: the grafted body computes position: ${depthCapReplace.childPosition} — it was still placed as its own sheet`);
    if (!contained) failures.push(`depth cap: the grafted body ${JSON.stringify(depthCapReplace.childRect)} does not sit inside the parent frame ${JSON.stringify(depthCapReplace.parentRect)}`);
    console.log(`  ${notPlaced ? "PASS" : "FAIL"}  the grafted body is not positioned as a sheet (position: ${depthCapReplace.childPosition})`);
    console.log(`  ${contained ? "PASS" : "FAIL"}  the grafted body sits inside the parent frame`);
  }
  console.log("");

  console.log("sheet-grammar: depth cap negative control — a dialog-role parent never registers a replace\n");
  const depthCapControl = await page.evaluate(() => window.__shellDepthCapReplaceNegativeControl());
  {
    const stackedNormally = depthCapControl.sheetCount === 3 && depthCapControl.childBecameSheet === true;
    if (!stackedNormally) failures.push(`depth cap negative control: a dialog-role chain measured ${depthCapControl.sheetCount} sheets (childBecameSheet=${depthCapControl.childBecameSheet}), wanted 3 sheets and true — the cap must not govern a role that never offers a replace`);
    console.log(`  ${stackedNormally ? "PASS" : "FAIL"}  a dialog-role three-deep chain stacks normally (${depthCapControl.sheetCount} sheets, childBecameSheet=${depthCapControl.childBecameSheet})`);
  }
  console.log("");

  console.log("sheet-grammar: properties property type picker — the real call graph under the depth cap\n");
  const namedPairReplace = await page.evaluate(() => window.__namedPairPropertyTypeReplace());
  if (namedPairReplace.error) {
    failures.push(`properties property type picker (real call graph): ${namedPairReplace.error}`);
    console.log(`  FAIL  properties property type picker — ${namedPairReplace.error}`);
  } else {
    const oneSheetBefore = namedPairReplace.beforeSheets === 1;
    const twoAfterFirstHop = namedPairReplace.afterFirstHop === 2;
    const stillTwoAfterSecondHop = namedPairReplace.afterSecondHop === 2;
    const dropdownGenuinelyOpened = namedPairReplace.dropdownResolved === true;
    const dropdownNotItsOwnSheet = namedPairReplace.dropdownBecameOwnSheet === false;
    if (!oneSheetBefore) failures.push(`properties property type picker: measured ${namedPairReplace.beforeSheets} sheet(s) before the parent mounted, wanted 1`);
    if (!twoAfterFirstHop) failures.push(`properties property type picker: measured ${namedPairReplace.afterFirstHop} sheet(s) after the real "Create property" panel opened, wanted 2`);
    if (!stillTwoAfterSecondHop) failures.push(`properties property type picker: measured ${namedPairReplace.afterSecondHop} sheet(s) after the real dropdown opened, wanted 2 — the depth cap should have absorbed it rather than letting it stack as a third`);
    if (!dropdownGenuinelyOpened) failures.push("properties property type picker: the real dropdown never resolved a panel at all");
    if (!dropdownNotItsOwnSheet) failures.push("properties property type picker: the real dropdown became its own independent sheet instead of being absorbed");
    console.log(`  ${oneSheetBefore ? "PASS" : "FAIL"}  the column-manager parent mounts alone (${namedPairReplace.beforeSheets} sheet)`);
    console.log(`  ${twoAfterFirstHop ? "PASS" : "FAIL"}  the real "Create property" panel (CreatePropertyModal's own panel role) stacks over it (${namedPairReplace.afterFirstHop} sheets)`);
    console.log(`  ${stillTwoAfterSecondHop ? "PASS" : "FAIL"}  the real dropdown does not add a third sheet (${namedPairReplace.afterSecondHop} sheets)`);
    console.log(`  ${dropdownGenuinelyOpened ? "PASS" : "FAIL"}  the real dropdown genuinely resolved a panel (not a no-op)`);
    console.log(`  ${dropdownNotItsOwnSheet ? "PASS" : "FAIL"}  the dropdown was absorbed rather than becoming independent`);
  }
  console.log("");

  console.log("sheet-grammar: properties property type picker negative control — a dialog-role \"Create property\" hop never offers a replace\n");
  const namedPairControl = await page.evaluate(() => window.__namedPairPropertyTypeReplaceNegativeControl());
  if (namedPairControl.error) {
    failures.push(`properties property type picker negative control: ${namedPairControl.error}`);
    console.log(`  FAIL  properties property type picker negative control — ${namedPairControl.error}`);
  } else {
    const stackedToThree = namedPairControl.afterSecondHop === 3;
    const dropdownBecameOwnSheet = namedPairControl.dropdownBecameOwnSheet === true;
    if (!stackedToThree) failures.push(`properties property type picker negative control: measured ${namedPairControl.afterSecondHop} sheet(s) over a dialog-role hop, wanted 3 — the cap must not fire on a role that never offers a replace`);
    if (!dropdownBecameOwnSheet) failures.push("properties property type picker negative control: the dropdown did not become its own sheet over a dialog-role hop");
    console.log(`  ${stackedToThree ? "PASS" : "FAIL"}  the same real dropdown stacks to a third sheet over a dialog-role hop (${namedPairControl.afterSecondHop} sheets)`);
    console.log(`  ${dropdownBecameOwnSheet ? "PASS" : "FAIL"}  the dropdown became its own independent sheet rather than being absorbed`);
  }
  console.log("");

  await page.close();
  for (const error of pageErrors) failures.push(`page error: ${error}`);

  // Both engines, because a phone runs the app in a WebKit web view and the desktop and the rest of
  // this lane run it in Chrome. Flex minimum sizing and intrinsic text measurement differ enough
  // between the two that a surface can fit in one and overflow in the other.
  for (const [engineName, engine, launchOptions] of [
    ["Chrome", chromium, { executablePath: findChrome() }],
    ["WebKit", webkit, {}],
  ]) {
    await runOverflowSweep(engineName, engine, launchOptions);
    await runHostModalChromeCheck(engineName, engine, launchOptions);
  }
} catch (error) {
  failures.push(`harness run failed: ${error.message}`);
} finally {
  if (browser) await browser.close();
  rmSync(work, { recursive: true, force: true });
}

// ───────────────────────────────────────────────────────────────────
// 5. VERDICT
// ───────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(`\nsheet-grammar: FAIL — ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("\nsheet-grammar: PASS — every registered surface satisfies all eight grammar columns,");
console.log("  every close target clears 44x44 with no descendant past the surface's right edge,");
console.log("  every registered parent-to-child row keeps one scrim, top-only keyboard ownership and");
console.log("  an unmigrated parent treatment went red before the stacking control returned green;");
console.log("  and on both engines every sheet the plugin can present — with the fixtures' own names");
console.log("  and again with an unbreakable one — kept its scroll width inside its client width,");
console.log("  drew nothing past its right edge and left the document unscrolled sideways, after a");
console.log(`  ${OVERFLOW_CONTROL_WIDTH_PX}px child injected into a clean surface proved the sweep can go red.`);
process.exit(0);
