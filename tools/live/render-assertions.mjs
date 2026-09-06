// ───────────────────────────────────────────────────────────────────
// MODULE:    render-assertions
// COMPONENT: gate check that asserts what the shipped renderers build
// ───────────────────────────────────────────────────────────────────
//
// Fourteen gate checks used to run and none of them built a renderer the
// plugin ships: the unit suite has no DOM, the captures photograph hand-written
// markup, and the placement check bundles production code but no renderer. A
// row loop that forced a synchronous layout per row shipped through all of
// them and froze the app on a real device.
//
// This check bundles the shipped renderers with esbuild and drives them in the
// same headless Chrome the other harnesses use, then asserts structural facts
// about the DOM they build — counts, affordances, column alignment, and the
// absence of per-row forced layout. Structural facts with thresholds, not
// snapshots and not timings: a count moves when the renderer changes shape and
// is stable when it does not, and the timing budget the benches own stays with
// the benches.
//
// It also refuses to assert on DOM that did not come from a bundled src/views
// module. Hand-written fixture markup resembles renderer output closely enough
// to satisfy any DOM-shaped check — the capture harness is built on exactly
// that resemblance — so the render entry tags what the real render call built,
// the assertions require the tag, and the bundle manifest must name the
// renderer sources.
//
// What a green run does NOT prove: no Obsidian host is constructed (the hosts
// need a live App, workspace and metadata cache; the renderers tolerate their
// absence), no device is involved, and App is undefined here, so vault-resolving
// fields render unresolved — a real database pays more per field, never less.
//
// `RENDER_READ_CONTROL=per-item` arms the owned negative control for the card
// and row renderers: the harness reintroduces one forced layout read per item,
// so each scenario's count exceeds its bound and this check fails naming the
// scenario. Board reads 1 against a bound of 8 and has no shipped
// defect on this tree — a bound that was never observed failing is not
// evidence — and the table's per-row bound (measured 3, same bound of 8) has
// the same need. The calendar week/day and chart scenarios are new here and
// own the same control: week/day through the per-item bag seam, the chart
// through a per-row read at the render entry. Disarmed is the default; the
// gate never arms it.
//
// Usage: node tools/live/render-assertions.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { stamp } from "./evidence.mjs";
import { buildRenderAssertionBundle, RENDERER_SOURCES, SCENARIOS, STATE_SCENARIOS } from "./render-assertion-bundle.mjs";
import { countConstructed, scenarioLabel } from "./render-scenario-utils.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. THE CHECKED SHAPES
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));

// ───────────────────────────────────────────────────────────────────
// 2a. ROW RHYTHM
// ───────────────────────────────────────────────────────────────────
//
// A table row's height belongs to the table, not to whichever cell happens to
// hold the most. The generated fixtures cannot show the difference — they give
// every row the same field count and the same value lengths — so this measures
// the mock-data catalogue instead, whose records vary the way real ones do.
//
// WHAT WENT WRONG WHEN NOTHING MEASURED THIS. `.db-multi-select-values` is a
// wrapping flex container, and a table cell's `height` is a minimum, so six
// option chips in a narrow column stacked six deep and took the row with them:
// one Home Inventory row measured 141px beside neighbours at 45px, and the
// column that did it sits far off the right edge of a phone. The operator saw a
// row three times too tall with nothing in it, because the cause was never on
// screen.
//
// THE BOUND IS UNIFORMITY, NOT A PIXEL COUNT. Rows are held to a single height
// across the table rather than to a number: a magic threshold passes a table
// that is uniformly wrong and needs re-picking whenever the density tokens move,
// while "every data row is the same height" is the rhythm itself, and it fails
// the moment one cell starts setting the height for everybody. The ceiling is
// kept alongside it so a table that is uniformly too tall cannot pass either.
//
// THE VIEWPORT IS NOT THE VARIABLE, AND MOVING THIS TO A PHONE LANE WOULD PROVE
// NOTHING NEW. The table carries its own inline width, so the chips wrap against
// their column and not against the window: the same 141px row was measured at
// 390x844 and at this check's 1100x900, identically. It is measured here because
// this is where renderer-built DOM is asserted, not because the width is right.
const RHYTHM_SCENARIOS = [
  { name: "table-catalogue-home-inventory/file-view", renderer: "table", bag: "file-view", catalogueUseCase: "home-inventory" },
  { name: "table-catalogue-project-tracker/file-view", renderer: "table", bag: "file-view", catalogueUseCase: "project-tracker" },
];

// The comfortable density (40px) plus one border, plus the 8px a coarse-pointer
// control is allowed to add to the row it sits in. A row at the shipped default
// density measures 36px, so this leaves headroom for a density change and none
// for a second line of anything.
const ROW_HEIGHT_CEILING = 49;

// ───────────────────────────────────────────────────────────────────
// 2b. WRAP TOGGLE
// ───────────────────────────────────────────────────────────────────
//
// A data row that clips its cells to one line has to fall back to the row floor, or "no wrapping"
// means nothing. This proves the toggle side of that on the same catalogue mount RHYTHM_SCENARIOS
// measures — clipped stays at the floor, and forcing the view's own wrap default on re-opens the
// exact row-height defect that fix closed, because every column without its own wrap override now
// carries `.db-cell-wrap` and the four value containers wrap again. That second scenario is the
// negative control: a check that cannot go red when wrap is actually on proves nothing about the
// toggle actually reaching the renderer.
const WRAP_TOGGLE_SCENARIOS = [
  { name: "table-catalogue-home-inventory-wrap-off/file-view", renderer: "table", bag: "file-view", catalogueUseCase: "home-inventory" },
  { name: "table-catalogue-home-inventory-wrap-on/file-view", renderer: "table", bag: "file-view", catalogueUseCase: "home-inventory", wrapText: true },
  // A third mount, paired with neither of the above: home-inventory's chips prove the flex
  // containers clip, but a markdown column whose source value carries literal newlines takes a
  // different path to the DOM (`renderInlineMarkdown` turns each `\n` into a real `<br>`), and a
  // `<br>` forces its line break regardless of `white-space: nowrap` on every ancestor. This
  // column carries no wrap override of its own — it follows the view, which is off here — so the
  // clip this proves is the same one the chip pair proves, reached through markdown instead of a
  // flex-wrap container.
  { name: "table-catalogue-habit-health-log-markdown-newline-wrap-off/file-view", renderer: "table", bag: "file-view", catalogueUseCase: "habit-health-log", catalogueMarkdownNewline: true },
];

// ───────────────────────────────────────────────────────────────────
// 2c. WRAP TOGGLE, DESKTOP PROFILE
// ───────────────────────────────────────────────────────────────────
//
// The pass above measures a phone, because that is the device the first row-height report came
// from. The second one came from the desktop, and the phone page could not have caught it: the
// phone stylesheet used to hold every cell to one line whatever the wrap state, so the defect
// class the desktop reported — a cell that wraps and takes the whole row with it — was invisible
// there and a green phone lane said nothing about it.
//
// The catalogue is the Habit and Health Log the operator photographed, and its Journal column is
// the one that grew: a long-text column carrying its own wrap mode, in a table whose switch was
// off. It measured 300px against neighbours at 36px. Both directions are asserted, because a
// check that cannot go red when the switch is on proves nothing about the switch.
const WRAP_DESKTOP_SCENARIOS = [
  { name: "table-catalogue-habit-health-log-wrap-off/desktop", renderer: "table", bag: "file-view", catalogueUseCase: "habit-health-log" },
  { name: "table-catalogue-habit-health-log-wrap-on/desktop", renderer: "table", bag: "file-view", catalogueUseCase: "habit-health-log", wrapText: true },
];

// A single line of body text in a data cell, measured: 16px for a bare sentence, 23px for the
// tallest one-line cell the catalogue produces. The ceiling sits above both and well below two
// lines, so it separates "this cell took a second line" from "this cell is one tall line".
const ONE_LINE_CEILING = 28;

// The measured floor at the shipped default density, tokens attached (see RHYTHM_SCENARIOS above,
// which holds this table to the same number). One pixel of headroom for sub-pixel rounding, not
// for a second line of anything.
const ROW_FLOOR = 36;

// ───────────────────────────────────────────────────────────────────
// 2c. BOARD GEOMETRY
// ───────────────────────────────────────────────────────────────────
//
// `screenshots:verify` only proves a capture's declared sources have not changed since it was
// taken, and `pixelHash` buckets a capture into a coarse 16x16 grid — a radius change, a border
// width, or a two-pixel-taller chip does not necessarily move either one. A negative control
// proved this directly: reverting the board card's radius from 8px to 2px and recapturing left
// `pixelHash` identical. Nothing else in this gate reads the board's own geometry, so this pass
// does, on the same bundle and the same headless Chrome the structural assertions above already
// use, with the token sheets attached the way the row-rhythm pass attaches them.
//
// Each row reads the property a device-pixel diff actually found wrong, not a proxy for it —
// `.db-kanban-col-chip`'s painted height rather than its declared one, since `height: 24px`
// alone does not tell you whether the border sits inside it.
const GEOMETRY_PINS = [
  { label: "card radius", selector: ".db-kanban-card", prop: "borderRadius", expected: "8px" },
  { label: "column width", selector: ".db-kanban-col", prop: "width", expected: "246px" },
  { label: "column gap", selector: ".db-kanban-board", prop: "gap", expected: "24px" },
  { label: "checkbox size", selector: ".db-kanban-card-meta .db-checkbox-field", prop: "boxWidth", expected: 14 },
  // A card text value read right-aligned and a single-token value broke mid-word. The first
  // non-checkbox property value on the mounted card proves both: it reads from the left, and has
  // nowhere to force a break a single unbreakable token would take.
  {
    label: "value align",
    selector: ".db-kanban-card-meta .db-board-card-field:not(.is-checkbox-field) .db-board-card-value",
    prop: "textAlign",
    expected: "left",
  },
  {
    label: "value wrap",
    selector: ".db-kanban-card-meta .db-board-card-field:not(.is-checkbox-field) .db-board-card-value",
    prop: "wordBreak",
    expected: "normal",
  },
  // The column header rides the page like every other row of it. No capture in the reference set
  // shows one caught mid-scroll or held against the top, and the operator asked for the page to
  // scroll — so a pin here is the check that a sticky header does not get reintroduced as an
  // inference. It is inert as well as unwanted: the header's nearest scrollport would be the
  // board, which scrolls in neither axis.
  { label: "header position", selector: ".db-kanban-col-header", prop: "position", expected: "static" },
];

/** The board scenario this pass mounts: the shipped renderer at its production entry. */
const GEOMETRY_SCENARIO = SCENARIOS.find((scenario) => scenario.renderer === "board" && scenario.bag === "file-view");

// ───────────────────────────────────────────────────────────────────
// 2d. PHONE WEEK OVERLAP INK
// ───────────────────────────────────────────────────────────────────
//
// The red value this proves: on a phone's default (fit-to-width) column, two genuinely timed
// events overlapping the same hour split their day column in half, and the halved block has no
// room left for a title after its own inset and padding — "one clipped glyph and zero ink" where
// the two blocks used to read as coloured bars. This measures the DOM proxy for that: both
// overlap-pair titles must carry a visible ink width past PHONE_OVERLAP_INK_FLOOR once the phone
// minimum column width (styles.css, `--db-calendar-phone-week-col-min`) is in effect. The split
// block, not the whole column, is what sets that minimum: a floor sized for an unsplit block
// leaves the halved one a sliver, which is the reading a capture of this surface showed. It shares
// the phone-profile rhythm page below (`is-phone` class, theme/runtime tokens attached) rather
// than opening a third browser page for one more measurement.
const PHONE_OVERLAP_SCENARIO = {
  name: "calendar-week-overlap-timed-phone/file-view",
  renderer: "calendar",
  bag: "file-view",
  scale: "week",
  calendarOverlapTimed: true,
};

// A read-it floor, not a bare non-zero one, because non-zero is what the defect already measured.
// Both states measured on this fixture, at the 286px container below:
//
//   no minimum column width (`--db-calendar-phone-week-col-min: 0px`, the pre-fix grid)
//     block 8px, title ink 3px and 1px — a sub-pixel sliver of one letter, not a glyph
//   the shipped minimum (styles.css)
//     block 32px, title ink 27px and 25px — three glyphs and the ellipsis
//
// 16px sits between the two with margin on both sides rather than on the boundary of either, and
// is above the ~6px one glyph of the title's 11px face costs, so a single surviving letter still
// reads as red here.
const PHONE_OVERLAP_INK_FLOOR = 16;

// Measured on the same phone-profile rhythm page (is-phone class, real token sheets attached) the
// two passes above share, since the floor this checks is a `.is-phone`-scoped rule and nowhere
// else resolves it correctly.
const FOOTER_PHONE_SCENARIO = {
  name: "table-footer-phone/file-view",
  renderer: "table",
  bag: "file-view",
  captureData: true,
  tableFooter: true,
};

// styles.css's own floor: 44px on phone, so a trigger a reader taps is never smaller than the
// touch-target minimum this repository holds every tappable control to elsewhere.
const FOOTER_PHONE_FLOOR = 44;

// The five permanent guards on behaviours already at or ahead of Notion parity: the footer's
// zero-row skip and phone floor, the header's icon/label/sort-ordinal composition, the inline
// chip layout, per-option pill colour, and the conditional-format tint's td paint. Kept local
// rather than added to the shared SCENARIOS/STATE_SCENARIOS lists in render-assertion-bundle.mjs
// — those feed touch-targets.mjs and unstyled-links.mjs too, and a scenario built for this file's
// own assertions has no reason to also become a fixture those two lanes iterate.
const TABLE_GUARD_SCENARIOS = [
  { name: "table-guards/file-view", renderer: "table", bag: "file-view", captureData: true, tableFooter: true, tableSortRules: true, tableHeaderNoop: true },
  { name: "table-guards-empty-footer/file-view", renderer: "table", bag: "file-view", tableFooter: true, tableFooterEmpty: true },
];

// SCENARIOS and RENDERER_SOURCES are shared with touch-targets.mjs and unstyled-links.mjs via
// render-assertion-bundle.mjs, so "every scenario the harness knows" means the same list in all
// three checks rather than three lists that could silently diverge.

// The action bags the two hosts build, measured at the two construction sites
// and pinned here as data. The harness builds its own bags; this comparison is
// what makes a bag change visible — a member the renderer calls disappearing
// from a bag must fail rather than being silently tolerated.
const BAGS = {
  "table/file-view": [
    "addColumn", "applyConditionalFormat", "areAllRowsSelected", "captureInteractionSnapshot",
    "changeColumnCalculation", "createEntry", "expandGroup", "getVisibleColumns",
    "hideCreateEntry", "isGroupCollapsed", "isRowSelected", "moveRowToGroupAndPosition",
    "moveRowToPosition", "moveRowsToGroup", "renderCell", "renderGroupSummaries",
    "renderRecordIcon", "restoreInteractionSnapshot", "setupColumnHeader", "setupFillHandle",
    "setupRow", "showRowMenu", "toggleGroupCollapsed", "toggleRowSelected", "toggleRowsSelected",
  ],
  "table/embed": [
    "addColumn", "applyConditionalFormat", "areAllRowsSelected", "changeColumnCalculation",
    "createEntry", "expandGroup", "getVisibleColumns", "hideCreateEntry", "isGroupCollapsed",
    "isReadOnly", "isRowSelected", "moveRowToPosition", "renderCell", "renderGroupSummaries",
    "renderRecordIcon", "setupColumnHeader", "setupRow", "showRowMenu", "toggleGroupCollapsed",
    "toggleRowSelected", "toggleRowsSelected",
  ],
  "board/file-view": [
    "applyConditionalFormat", "areAllRowsSelected", "createEntry", "createGroup", "editCell",
    "editFileName", "editFormula", "expandGroup", "getColumns", "getSelectedRows",
    "hideCreateEntry", "hideGroup", "isGroupCollapsed", "isRowSelected", "moveRowToPosition",
    "moveRowWithGroupUpdatesAndPosition", "moveRowsToPosition", "openRecordDetail", "openRow",
    "renderGroupSummaries", "renderRecordIcon", "saveCellValue", "setBoardHideEmptyGroups",
    "showColumnMenu", "showGroup", "showRowMenu", "toggleGroupCollapsed", "toggleRowSelected",
    "toggleRowsSelected", "updateCardOrder", "updateColumnWidth", "updateGroup", "updateGroupOrder",
  ],
  "board/embed": [
    "applyConditionalFormat", "areAllRowsSelected", "canReorderGroups", "createEntry",
    "editCell", "expandGroup", "getColumns", "hideCreateEntry", "hideGroup", "isGroupCollapsed",
    "isReadOnly", "isRowSelected", "moveRowToPosition", "openRow", "renderGroupSummaries",
    "renderRecordIcon", "setBoardHideEmptyGroups", "showColumnMenu", "showGroup", "showRowMenu",
    "toggleGroupCollapsed", "toggleRowSelected", "toggleRowsSelected", "updateCardOrder",
    "updateColumnWidth", "updateGroup", "updateGroupOrder",
  ],
  "calendar/file-view": [
    "applyConditionalFormat", "createEntryForDate", "getCalendarInvalidEventCount", "getColumns",
    "onConfigChange", "openCalendarInvalidEvents", "openDateConfig", "openRecordDetail", "openRow",
    "renderRecordIcon", "showRowMenu", "updateCalendarScale", "updateEventDates",
  ],
  "calendar/embed": [
    "applyConditionalFormat", "getCalendarInvalidEventCount", "getColumns", "isReadOnly",
    "onConfigChange", "openCalendarInvalidEvents", "openDateConfig", "openRecordDetail", "openRow",
    "renderRecordIcon",
  ],
  "timeline/file-view": [
    "applyConditionalFormat", "createEntryForDate", "expandGroup", "getTimelineInvalidEventCount",
    "isGroupCollapsed", "moveTimelineEventToGroup", "onConfigChange", "openDateConfig",
    "openRecordDetail", "openRow", "openTimelineInvalidEvents", "renderGroupSummaries",
    "renderRecordIcon", "reorderTimelineEvent", "showRowMenu", "toggleGroupCollapsed",
    "updateEventDates", "updateTimelineAnchor", "updateTimelineScale",
  ],
  "timeline/embed": [
    "applyConditionalFormat", "expandGroup", "getTimelineInvalidEventCount", "isGroupCollapsed",
    "isReadOnly", "onConfigChange", "openDateConfig", "openRecordDetail", "openRow",
    "openTimelineInvalidEvents", "renderGroupSummaries", "renderRecordIcon",
    "toggleGroupCollapsed", "updateTimelineAnchor", "updateTimelineScale",
  ],
  // The chart's bag is the actions object passed to render, and both hosts pass the same two
  // members — the embed does not trim it, because neither host calls a chart action during render.
  "chart/file-view": ["onConfigChange", "onFilter"],
};

const FILE_VIEW_ONLY = [
  "openRecordDetail", "saveCellValue", "editFileName", "editFormula", "getSelectedRows",
  "moveRowToGroupAndPosition", "moveRowsToGroup", "moveRowsToPosition",
];

const STAMP_PATH = "tools/live/renderer-coverage.json";

// Read in the runner and passed into the bundle, matching the other controls in
// this lane (SELECTION_BAR_CONTROL, PLACEMENT_SECTION_CONTROL): an armed value
// makes the harness reintroduce one per-item layout read, and the bound failing
// names the scenario.
const READ_CONTROL = process.env.RENDER_READ_CONTROL || "";

// ───────────────────────────────────────────────────────────────────
// 3. BUNDLE
// ───────────────────────────────────────────────────────────────────

const { work, missingSources } = await buildRenderAssertionBundle(`
window.__renderAssertions = (scenario) => runRenderAssertions(document.body, scenario, ${JSON.stringify(READ_CONTROL)});
window.__boardGeometry = (scenario) => {
  // The harness removes the container as soon as this callback returns, so every read happens
  // inside it — reading afterwards measures a node already detached, whose boxes are all 0.
  let measurement = null;
  let provenance = false;
  runRenderAssertions(document.body, scenario, "", (container, results) => {
    provenance = results.length > 0 && results[0].pass;
    if (!provenance) return;

    const read = (selector, prop) => {
      const el = container.querySelector(selector);
      if (!el) return { found: false };
      if (prop === "boxWidth") return { found: true, value: Math.round(el.getBoundingClientRect().width) };
      return { found: true, value: getComputedStyle(el)[prop] };
    };

    // The chip's painted height, not its declared one: box-sizing decides whether the border
    // sits inside or outside it, which "height: 24px" alone cannot tell you.
    const chip = container.querySelector(".db-kanban-col-chip");

    // Row pitch, read on every property row of the first card rather than one of them, since a
    // shared rule regressing on a single row type — a checkbox row beside a text row, say — is
    // exactly what "uniform" is there to catch.
    const firstCard = container.querySelector(".db-kanban-card");
    const checkbox = container.querySelector(".db-kanban-card-meta .db-checkbox-field");

    // The scrollbar box is read off the ::-webkit-scrollbar pseudo-element of the container,
    // which is the element that scrolls — at rest, again with "is-scrolling" applied the way the
    // renderer's own scroll listener would, and again with "is-edge-hover" applied the way its
    // pointermove listener would once the pointer sits within the bar's own edge band. A later
    // reinstatement of the painted-at-rest bar, or a reversion of the edge-only reveal back to a
    // pane-wide hover pseudo-class, both have a number here to turn red against.
    //
    // Width as well as height, and not for symmetry: the height half alone shipped a board whose
    // VERTICAL bar stayed painted at rest, because the app-wide 8px width was never overridden
    // here and the board's own thumb rule outranks the app-wide transparency by source order.
    // One number per axis per state is what tells the two bars apart.
    const board = container.querySelector(".db-kanban-board");
    const restBar = getComputedStyle(container, "::-webkit-scrollbar");
    const scrollbarRestHeight = restBar.height;
    const scrollbarRestWidth = restBar.width;
    container.classList.add("is-scrolling");
    const activeBar = getComputedStyle(container, "::-webkit-scrollbar");
    const scrollbarActiveHeight = activeBar.height;
    const scrollbarActiveWidth = activeBar.width;
    container.classList.remove("is-scrolling");
    container.classList.add("is-edge-hover");
    const edgeHoverBar = getComputedStyle(container, "::-webkit-scrollbar");
    const scrollbarEdgeHoverHeight = edgeHoverBar.height;
    const scrollbarEdgeHoverWidth = edgeHoverBar.width;
    container.classList.remove("is-edge-hover");
    const boardOverflowY = board ? getComputedStyle(board).overflowY : null;

    measurement = {
      pins: ${JSON.stringify(GEOMETRY_PINS)}.map((pin) => ({ ...pin, ...read(pin.selector, pin.prop) })),
      chipHeight: chip ? Math.round(chip.getBoundingClientRect().height) : null,
      rowHeights: firstCard
        ? Array.from(firstCard.querySelectorAll(".db-kanban-card-meta .db-board-card-field"))
          .map((row) => Math.round(row.getBoundingClientRect().height))
        : [],
      checkboxRadius: checkbox ? getComputedStyle(checkbox).borderRadius : null,
      pageOverflowY: getComputedStyle(container).overflowY,
      columnOverflowY: read(".db-kanban-cards", "overflowY").value ?? null,
      boardOverflowY,
      scrollbarRestHeight,
      scrollbarActiveHeight,
      scrollbarEdgeHoverHeight,
      scrollbarRestWidth,
      scrollbarActiveWidth,
      scrollbarEdgeHoverWidth,
    };

    // Reachability, measured, not inferred from an overflow keyword. A container whose overflow
    // computes to "auto" still scrolls nothing when its only child has been flex-shrunk back to
    // the container's own height and clips what does not fit — which is precisely how a board
    // that reported "overflow-y: auto" left every card past the first screen unreachable. So the
    // check gives the container a pane's definite height (the shape a real host gives it; this
    // page's body has none), overfills one column, and asks whether the scroll actually moved and
    // the last card came with it. Destructive to the DOM, so it runs after every read above.
    const cardsEl = container.querySelector(".db-kanban-cards");
    const template = cardsEl && cardsEl.querySelector(".db-kanban-card");
    if (cardsEl && template) {
      container.style.height = "600px";
      for (let i = 0; i < 30; i += 1) cardsEl.appendChild(template.cloneNode(true));
      const cards = cardsEl.querySelectorAll(".db-kanban-card");
      const last = cards[cards.length - 1];
      container.scrollTop = 1e6;
      const reached = container.scrollTop;
      const rect = container.getBoundingClientRect();
      const lastRect = last.getBoundingClientRect();
      measurement.pageScrollReached = reached;
      measurement.lastCardReachable = lastRect.bottom <= rect.bottom + 1 && lastRect.top >= rect.top - 1;
      measurement.pageScrollHeight = container.scrollHeight;
      measurement.pageClientHeight = container.clientHeight;
    }
  });
  return { provenance, ...measurement };
};
window.__rowRhythm = (scenario) => {
  let out = null;
  runRenderAssertions(document.body, scenario, "", (container) => {
    // Data rows only. The insert line between rows and the create-entry row at the bottom are
    // chrome, sized by their own affordance rather than by a record, and holding them to the
    // record rhythm would fail a table that is correct.
    const rows = [...container.querySelectorAll("table.db-table tbody tr")].filter((tr) =>
      !tr.classList.contains("db-row-insert-line")
      && !tr.classList.contains("db-new-row")
      && !tr.classList.contains("db-group-expand-row"));
    // The tallest child of the tallest row, named. A bare number says a row is wrong; the class
    // says which cell made it wrong, which is the difference between a failure and a diagnosis.
    //
    // The utility columns are excluded from the attribution, not from the measurement. Their
    // contents stretch to whatever height the row already has, so they tie with the real cause on
    // every tall row and win the comparison by document order — the first version of this named
    // the select column's inner box on both catalogues, which is the checkbox reporting a symptom
    // it was handed. The cause is always a cell that grew on its own.
    const UTILITY = ["db-select-col", "db-record-icon-col", "db-add-column-cell"];
    // A cell's own content height, measured by a range over its contents rather than by its box.
    // The box is the row's height once the row has grown, so every cell reports the symptom; the
    // range reports what that cell alone asked for. It also reaches a cell holding nothing but
    // text, which has no element child to measure and is exactly what a wrapping text column is —
    // an earlier version looked only at element children and blamed the chips for a row the notes
    // column had grown.
    const contentHeight = (td) => {
      const range = td.ownerDocument.createRange();
      range.selectNodeContents(td);
      const box = range.getBoundingClientRect();
      range.detach();
      return box.height;
    };
    const describe = (td) => {
      const child = [...td.children].sort((a, b) =>
        b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
      return child ? "<" + child.className + ">" : "its own text";
    };
    let worst = { height: 0, cell: "", child: "", width: 0 };
    for (const tr of rows) {
      const height = tr.getBoundingClientRect().height;
      if (height <= worst.height) continue;
      let cell = "", child = "", width = 0, tallest = 0;
      for (const td of tr.children) {
        if (UTILITY.some((name) => td.classList.contains(name))) continue;
        const asked = contentHeight(td);
        if (asked <= tallest) continue;
        tallest = asked; cell = td.className; child = describe(td); width = td.getBoundingClientRect().width;
      }
      worst = { height: Math.round(height), cell, child, width: Math.round(width) };
    }
    // The tallest cell holding nothing but text, reported apart from the worst-row attribution. A
    // wrapping flex container and a wrapping sentence both grow a row, and only the second one
    // proves the wrap switch reached the text: a lane that asserted only that the row grew would
    // pass on the chips alone, which is how a phone where no sentence ever wrapped kept a green
    // toggle check.
    let tallestTextCell = 0;
    for (const tr of rows) {
      for (const td of tr.children) {
        if (UTILITY.some((name) => td.classList.contains(name))) continue;
        if (td.children.length > 0) continue;
        tallestTextCell = Math.max(tallestTextCell, contentHeight(td));
      }
    }
    out = {
      count: rows.length,
      heights: rows.map((tr) => Math.round(tr.getBoundingClientRect().height)),
      tallestTextCell: Math.round(tallestTextCell),
      worst,
      provenance: !!container.querySelector("table.db-table[data-render-assertion-source]")
        || !!container.querySelector("table.db-table"),
    };
  });
  return out;
};
window.__phoneOverlapInk = (scenario) => {
  let out = null;
  // This bundle mounts straight into document.body with none of a real device's chrome
  // (sidebar, workspace-leaf padding) narrowing the pane, so a bare 402px viewport (the real
  // phone captures' own width) leaves the grid a full ~350px of room here against the ~286px
  // measured on-device for the columns alone ("seven week columns inside ~286px leave each about
  // 41px"). Narrowing the whole container (gutter included) to that same 286px reproduces the
  // chrome's constraint, so the fit-to-width column this measurement's negative control depends
  // on is the one a phone actually produces rather than a roomier one: with
  // --db-calendar-phone-week-col-min set to 0px (this fixture's own pre-fix baseline) the
  // overlap pair reads 1-3px of visible ink at 286px, and PHONE_OVERLAP_INK_FLOOR names why that
  // counts as none.
  runRenderAssertions(document.body, scenario, "", (container) => {
    // Narrowed after mount rather than given its own pre-sized host: sweepPortaledSurfaces
    // (called at the top of runRenderAssertions, before this callback fires) removes any
    // document.body child that was not present when the page's very first scenario ran, which
    // would delete a wrapper created ahead of the render call. Setting the width here, before
    // the geometry reads below force a layout, narrows the same live box just as effectively.
    container.style.width = "286px";
    const blocks = [...container.querySelectorAll(".db-calendar-week-timed-event")];
    // The title's visible ink, not its laid-out text box: the title is white-space: nowrap, so a
    // Range over its contents measures the glyph run at its full natural width regardless of how
    // narrow the block is — the block clips overflow (styles.css), so text wider than the block
    // never paints past its edge. Intersecting the text's rect with the block's own clipped rect
    // is what actually decodes as ink versus a blank rect, which is the exact distinction the
    // red capture above turned on ("one clipped glyph and zero ink").
    const titleBox = (block) => {
      const blockRect = block.getBoundingClientRect();
      const title = block.querySelector(".db-calendar-week-event-title");
      if (!title) return { blockWidth: Math.round(blockRect.width), visibleWidth: 0, text: "" };
      const range = title.ownerDocument.createRange();
      range.selectNodeContents(title);
      const textRect = range.getBoundingClientRect();
      range.detach();
      const visibleWidth = Math.max(0, Math.min(textRect.right, blockRect.right) - Math.max(textRect.left, blockRect.left));
      return {
        blockWidth: Math.round(blockRect.width),
        visibleWidth: Math.round(visibleWidth),
        text: title.textContent || "",
      };
    };
    out = { blockCount: blocks.length, titles: blocks.map(titleBox) };
  });
  return out;
};
window.__footerFloor = (scenario) => {
  let out = null;
  runRenderAssertions(document.body, scenario, "", (container) => {
    const triggers = [...container.querySelectorAll(".db-table-footer-trigger")];
    out = {
      count: triggers.length,
      minHeights: triggers.map((trigger) => parseFloat(getComputedStyle(trigger).minHeight) || 0),
    };
  });
  return out;
};
`);

if (missingSources.length > 0) {
  console.error(`render-assertions: FAIL — the bundle no longer imports ${missingSources.join(", ")}`);
  console.error("  a check that does not bundle the shipped renderer asserts nothing about them");
  process.exit(1);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${REPO}styles.css"></head>
<body class="theme-dark"><script src="render-bundle.js"></script></body></html>`);

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
  ]) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error("render-assertions: no Chrome/Chromium found. Set SCREENSHOT_CHROME to a browser executable.");
}

const failures = [];
let browser;
let outcomes = null;
let rhythmOutcomes = null;
let geometryOutcome = null;
let wrapToggleOutcomes = null;
let phoneOverlapInk = null;
let footerFloorOutcome = null;
let wrapDesktopOutcomes = null;
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);
  outcomes = await page.evaluate((scenarios) => scenarios.map((scenario) => window.__renderAssertions(scenario)), SCENARIOS);
  // The toolbar's declared trigger state, the chip rail it gates, and the tab context menu
  // carry no action bag to compare and are not part of the coverage ratchet below, so they are
  // asserted here rather than folded into `outcomes` — the four rules combinations
  // (none/filter/sort/both) plus the tab-menu row each get their own scenario in STATE_SCENARIOS
  // and their own red-first pass/fail line. The chart's empty state joins them for the same
  // reason: chartEmptyAbsorptionAssertion (render-assertion-harness.ts) is the permanent lane row
  // asserting the shared card, its action, and the retired private markup's absence. The two
  // emptyReason scenarios join for the same reason again: the permanent row proving the
  // source-missing and no-matching-data flavours render distinctly through getEmptyStateReason's
  // own predicate, not a hand-supplied reason string.
  const rulesScenarios = STATE_SCENARIOS.filter((scenario) =>
    scenario.rules != null || scenario.toolbarPopover === "tab-menu" || scenario.chartVariant === "empty"
    || scenario.emptyReason != null || scenario.boardGroupsPanel === true);
  const rulesOutcomes = await page.evaluate(
    (scenarios) => scenarios.map((scenario) => window.__renderAssertions(scenario)),
    rulesScenarios,
  );
  const guardOutcomes = await page.evaluate(
    (scenarios) => scenarios.map((scenario) => window.__renderAssertions(scenario)),
    TABLE_GUARD_SCENARIOS,
  );
  await page.close();

  // The rhythm pass gets its own page, with the theme and runtime token sheets attached beside
  // the plugin's own.
  //
  // The structural assertions above read counts and classes, which survive a missing token; a
  // height does not. Measured without `theme.css` and `runtime-vars.css` the same table reports
  // rows at 261px that measure 36px once the tokens resolve — the font sizes fall back and every
  // badge grows. A geometry check run against that document reports numbers for a product nobody
  // ships, which is the failure the sizing census was written to stop repeating.
  const rhythmPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const rhythmErrors = [];
  rhythmPage.on("pageerror", (error) => rhythmErrors.push(error.message));
  await rhythmPage.goto(`file://${join(work, "index.html")}`);
  for (const sheet of ["styles.css", "tools/screenshots/theme.css", "tools/screenshots/runtime-vars.css"]) {
    await rhythmPage.addStyleTag({ content: readFileSync(join(REPO, sheet), "utf8") });
  }
  // The surface this measures is the phone table the row heights were reported against, so the
  // page declares itself one. The class is not cosmetic here: the host's phone rules decide how
  // the table spends its width, and with them off the same table resolves its columns differently
  // and measures a layout no device produces.
  await rhythmPage.evaluate(() => document.body.classList.add("is-phone"));
  // The premise, asserted rather than assumed: a run whose tokens did not attach measures the
  // fallback document and must say so instead of publishing its heights.
  const tokensResolved = await rhythmPage.evaluate(() => {
    const probe = document.createElement("div");
    probe.className = "note-database-container";
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).getPropertyValue("--db-row-height-default").trim();
    probe.remove();
    return value;
  });
  if (tokensResolved !== "34px") {
    failures.push(`row rhythm: the token sheets did not attach (--db-row-height-default is `
      + `"${tokensResolved}", expected "34px"); heights measured here would describe a fallback document`);
  } else {
    rhythmOutcomes = await rhythmPage.evaluate(
      (scenarios) => scenarios.map((scenario) => window.__rowRhythm(scenario)),
      RHYTHM_SCENARIOS,
    );
    wrapToggleOutcomes = await rhythmPage.evaluate(
      (scenarios) => scenarios.map((scenario) => window.__rowRhythm(scenario)),
      WRAP_TOGGLE_SCENARIOS,
    );
    // 402px, not this page's own 390px: the real phone captures this measurement is a proxy for
    // (calendar-week-time-grid-mobile-*, screenshots/capture.mjs's "mobile" device) open at 402,
    // and 402 is where both the red and the green values below were read. The two widths do not
    // change the verdict — the minimum column width binds at either — but a proxy measured at a
    // width no capture uses is a number nobody can check against a picture.
    await rhythmPage.setViewportSize({ width: 402, height: 874 });
    phoneOverlapInk = await rhythmPage.evaluate(
      (scenario) => window.__phoneOverlapInk(scenario),
      PHONE_OVERLAP_SCENARIO,
    );
    footerFloorOutcome = await rhythmPage.evaluate(
      (scenario) => window.__footerFloor(scenario),
      FOOTER_PHONE_SCENARIO,
    );
    // Same document, same token sheets, the phone profile dropped: the class the host sets and the
    // viewport the phone rules are written against. Last of the three passes, because it is the
    // only one that changes the profile, and measured on this page rather than one of its own so
    // the two profiles cannot drift apart on anything but the profile itself.
    await rhythmPage.evaluate(() => document.body.classList.remove("is-phone"));
    await rhythmPage.setViewportSize({ width: 1100, height: 900 });
    wrapDesktopOutcomes = await rhythmPage.evaluate(
      (scenarios) => scenarios.map((scenario) => window.__rowRhythm(scenario)),
      WRAP_DESKTOP_SCENARIOS,
    );
  }
  await rhythmPage.close();
  for (const error of rhythmErrors) failures.push(`row rhythm page error: ${error}`);

  // The board geometry pass gets its own page too, and for the same reason the rhythm pass does:
  // a computed length measured without the token sheets describes a fallback document. It runs at
  // deviceScaleFactor 2 and at the desktop viewport the board's own captures are taken at, so a
  // number read here and a number counted off a capture are the same number.
  if (!GEOMETRY_SCENARIO) {
    failures.push("board geometry: no board/file-view scenario in the shared scenario list");
  } else {
    const geometryPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const geometryErrors = [];
    geometryPage.on("pageerror", (error) => geometryErrors.push(error.message));
    await geometryPage.goto(`file://${join(work, "index.html")}`);
    for (const sheet of ["styles.css", "tools/screenshots/theme.css", "tools/screenshots/runtime-vars.css"]) {
      await geometryPage.addStyleTag({ content: readFileSync(join(REPO, sheet), "utf8") });
    }
    geometryOutcome = await geometryPage.evaluate(
      (scenario) => window.__boardGeometry(scenario),
      { ...GEOMETRY_SCENARIO, captureData: true },
    );
    await geometryPage.close();
    for (const error of geometryErrors) failures.push(`board geometry page error: ${error}`);
  }
  for (const error of pageErrors) {
    failures.push(`page error: ${error}`);
  }

  console.log(`render-assertions: ${SCENARIOS.length} scenarios x ${outcomes[0]?.results.length ?? 0} assertions in headless Chrome\n`);

  // The shape numbers this check exists to keep visible, printed whether they
  // pass or fail: layout reads must not scale with rows, and data rows must not
  // be appended to a table that is already in the document.
  // Every shape number, not the first one found. The table carries two — where its rows are
  // attached, and how many of its reads land on a connected node — and they answer different
  // questions: a `find` printed whichever was pushed first and silently hid the other.
  for (const outcome of outcomes) {
    const shapes = outcome.results.filter((result) =>
      result.name === "no forced layout inside the row loop"
      || result.name === "no forced layout inside the card loop"
      || result.name === "no forced layout inside the segment loop"
      || result.name === "no forced layout inside the event loop"
      || result.name === "no forced layout inside the chart build"
      || result.name === "no per-row layout read"
      || result.name === "no row appended to a connected table");
    for (const shape of shapes) {
      console.log(`  shape  ${scenarioLabel(outcome.scenario).padEnd(20)} ${shape.detail}`);
    }
  }
  console.log("");

  for (const outcome of outcomes) {
    const label = scenarioLabel(outcome.scenario);
    for (const result of outcome.results) {
      const mark = result.pass ? "PASS" : "FAIL";
      if (!result.pass) failures.push(`${label}: ${result.name} — ${result.detail}`);
      console.log(`  ${mark}  ${label.padEnd(20)} ${result.name}`);
      if (!result.pass) console.log(`       ${result.detail}`);
    }
  }

  console.log(`\nrender-assertions: ${rulesScenarios.length} filter/sort rules scenario(s) `
    + `x ${rulesOutcomes[0]?.results.length ?? 0} assertions\n`);
  for (const outcome of rulesOutcomes) {
    const label = outcome.scenario.name;
    for (const result of outcome.results) {
      const mark = result.pass ? "PASS" : "FAIL";
      if (!result.pass) failures.push(`${label}: ${result.name} — ${result.detail}`);
      console.log(`  ${mark}  ${label.padEnd(38)} ${result.name}`);
      if (!result.pass) console.log(`       ${result.detail}`);
    }
  }

  console.log(`\nrender-assertions: guards on the already-haves, ${TABLE_GUARD_SCENARIOS.length} scenario(s) `
    + `x ${guardOutcomes[0]?.results.length ?? 0} assertions\n`);
  for (const outcome of guardOutcomes) {
    const label = outcome.scenario.name;
    for (const result of outcome.results) {
      const mark = result.pass ? "PASS" : "FAIL";
      if (!result.pass) failures.push(`${label}: ${result.name} — ${result.detail}`);
      console.log(`  ${mark}  ${label.padEnd(38)} ${result.name}`);
      if (!result.pass) console.log(`       ${result.detail}`);
    }
  }
} catch (error) {
  failures.push(`harness run failed: ${error.message}`);
} finally {
  if (browser) await browser.close();
  rmSync(work, { recursive: true, force: true });
}

if (!outcomes) {
  console.error(`\nrender-assertions: FAIL — ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────
// 4a. ROW RHYTHM
// ───────────────────────────────────────────────────────────────────

console.log("\nrender-assertions: row rhythm over the mock-data catalogue");
for (let i = 0; i < RHYTHM_SCENARIOS.length; i += 1) {
  const scenario = RHYTHM_SCENARIOS[i];
  const measured = rhythmOutcomes ? rhythmOutcomes[i] : null;
  if (!measured || measured.count === 0) {
    failures.push(`${scenario.name}: row rhythm measured no rows`);
    console.log(`  FAIL  ${scenario.name} — no rows measured`);
    continue;
  }
  const heights = [...new Set(measured.heights)].sort((a, b) => a - b);
  const tallest = heights[heights.length - 1];
  const uniform = heights.length === 1;
  const withinCeiling = tallest <= ROW_HEIGHT_CEILING;
  const ok = uniform && withinCeiling;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${scenario.name.padEnd(46)} `
    + `${measured.count} rows, ${heights.length} distinct height(s) ${heights.join("/")}, ceiling ${ROW_HEIGHT_CEILING}px`);
  if (!ok) {
    console.log(`       tallest row ${measured.worst.height}px — set by ${measured.worst.child} `
      + `inside ${measured.worst.cell} at ${measured.worst.width}px wide`);
    failures.push(`${scenario.name}: a table row's height is not the table's — `
      + `${heights.length} distinct height(s) ${heights.join("/")}, tallest ${measured.worst.height}px `
      + `set by ${measured.worst.child} in ${measured.worst.cell} at ${measured.worst.width}px`);
  }
}

// ───────────────────────────────────────────────────────────────────
// 4a2. FOOTER PHONE FLOOR
// ───────────────────────────────────────────────────────────────────

console.log("\nrender-assertions: table footer trigger phone floor");
{
  const measured = footerFloorOutcome;
  if (!measured || measured.count === 0) {
    failures.push(`${FOOTER_PHONE_SCENARIO.name}: no .db-table-footer-trigger measured`);
    console.log(`  FAIL  ${FOOTER_PHONE_SCENARIO.name} — no footer trigger measured`);
  } else {
    const shortfall = measured.minHeights.filter((h) => h < FOOTER_PHONE_FLOOR);
    const ok = shortfall.length === 0;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${FOOTER_PHONE_SCENARIO.name.padEnd(46)} `
      + `${measured.count} trigger(s), min-height ${Math.min(...measured.minHeights)}..${Math.max(...measured.minHeights)}px, `
      + `floor ${FOOTER_PHONE_FLOOR}px`);
    if (!ok) {
      failures.push(`${FOOTER_PHONE_SCENARIO.name}: ${shortfall.length} of ${measured.count} footer trigger(s) `
        + `computed a min-height under the ${FOOTER_PHONE_FLOOR}px phone floor — ${shortfall.join(", ")}px`);
    }
  }
}

// ───────────────────────────────────────────────────────────────────
// 4b. WRAP TOGGLE
// ───────────────────────────────────────────────────────────────────

console.log("\nrender-assertions: wrap toggle over the mock-data catalogue");
{
  const clippedName = WRAP_TOGGLE_SCENARIOS[0].name;
  const wrappedName = WRAP_TOGGLE_SCENARIOS[1].name;
  const clipped = wrapToggleOutcomes ? wrapToggleOutcomes[0] : null;
  const wrapped = wrapToggleOutcomes ? wrapToggleOutcomes[1] : null;
  if (!clipped || clipped.count === 0 || !wrapped || wrapped.count === 0) {
    failures.push("wrap toggle: measured no rows");
    console.log("  FAIL  wrap toggle — no rows measured");
  } else {
    const clippedTallest = Math.max(...clipped.heights);
    const wrappedTallest = Math.max(...wrapped.heights);
    const clippedOk = clippedTallest <= ROW_FLOOR + 1;
    console.log(`  ${clippedOk ? "PASS" : "FAIL"}  ${clippedName.padEnd(52)} `
      + `tallest ${clippedTallest}px, floor ${ROW_FLOOR}px`);
    if (!clippedOk) {
      failures.push(`${clippedName}: view default off did not clip — tallest ${clippedTallest}px `
        + `exceeds the row floor (${ROW_FLOOR}px + 1) set by ${clipped.worst.child} in ${clipped.worst.cell}`);
    }
    // The negative control: forcing the view's wrapText default on must measure MORE than the
    // floor, or the toggle is not reaching the renderer at all — a check that cannot go red here
    // proves nothing about the wrap half of the pair.
    const wrappedOk = wrappedTallest > ROW_FLOOR + 1;
    console.log(`  ${wrappedOk ? "PASS" : "FAIL"}  ${wrappedName.padEnd(52)} `
      + `tallest ${wrappedTallest}px, floor ${ROW_FLOOR}px (must exceed it)`);
    if (!wrappedOk) {
      failures.push(`${wrappedName}: forcing wrapText on did not grow any row past the floor `
        + `(${ROW_FLOOR}px + 1) — tallest ${wrappedTallest}px; the view-level default is not reaching the cell renderer`);
    }
    // And it has to be the TEXT that wrapped. The phone stylesheet held every cell to one line at a
    // specificity the wrapping class could not reach, so switching wrapping on stacked the chips
    // and left every sentence on one line — a row that grew, a toggle that looked wired, and no
    // wrapped text anywhere on the device. A row-height assertion alone passes that.
    const wrappedText = wrapped.tallestTextCell ?? 0;
    const wrappedTextOk = wrappedText > ONE_LINE_CEILING;
    console.log(`  ${wrappedTextOk ? "PASS" : "FAIL"}  ${"wrap on wraps text, not only chips".padEnd(52)} `
      + `tallest text-only cell ${wrappedText}px, one line ≤ ${ONE_LINE_CEILING}px`);
    if (!wrappedTextOk) {
      failures.push(`${wrappedName}: no text-only cell took a second line — tallest ${wrappedText}px `
        + `against a one-line ceiling of ${ONE_LINE_CEILING}px. The rows grew, so a wrapping value `
        + `container did it; the switch is not reaching the text`);
    }
  }

  const markdownName = WRAP_TOGGLE_SCENARIOS[2].name;
  const markdownClipped = wrapToggleOutcomes ? wrapToggleOutcomes[2] : null;
  if (!markdownClipped || markdownClipped.count === 0) {
    failures.push("wrap toggle: measured no rows for the markdown-newline scenario");
    console.log("  FAIL  wrap toggle — markdown-newline scenario measured no rows");
  } else {
    const markdownTallest = Math.max(...markdownClipped.heights);
    const markdownOk = markdownTallest <= ROW_FLOOR + 1;
    console.log(`  ${markdownOk ? "PASS" : "FAIL"}  ${markdownName.padEnd(52)} `
      + `tallest ${markdownTallest}px, floor ${ROW_FLOOR}px`);
    if (!markdownOk) {
      failures.push(`${markdownName}: a markdown value's literal newlines did not clip — tallest `
        + `${markdownTallest}px exceeds the row floor (${ROW_FLOOR}px + 1) set by `
        + `${markdownClipped.worst.child} in ${markdownClipped.worst.cell}`);
    }
  }
}

// ───────────────────────────────────────────────────────────────────
// 4c. WRAP TOGGLE, DESKTOP PROFILE
// ───────────────────────────────────────────────────────────────────

console.log("\nrender-assertions: wrap toggle on the desktop profile");
{
  const [offScenario, onScenario] = WRAP_DESKTOP_SCENARIOS;
  const off = wrapDesktopOutcomes ? wrapDesktopOutcomes[0] : null;
  const on = wrapDesktopOutcomes ? wrapDesktopOutcomes[1] : null;
  if (!off || off.count === 0 || !on || on.count === 0) {
    failures.push("wrap toggle (desktop): measured no rows");
    console.log("  FAIL  wrap toggle (desktop) — no rows measured");
  } else {
    const offHeights = [...new Set(off.heights)].sort((a, b) => a - b);
    const offTallest = offHeights[offHeights.length - 1];
    // Uniformity as well as the floor: the reported symptom was one row standing several times its
    // neighbours, which a tallest-only bound would let through if the whole table were tall.
    const offOk = offTallest <= ROW_FLOOR + 1 && offHeights.length === 1;
    console.log(`  ${offOk ? "PASS" : "FAIL"}  ${offScenario.name.padEnd(52)} `
      + `${off.count} rows, height(s) ${offHeights.join("/")}, floor ${ROW_FLOOR}px`);
    if (!offOk) {
      failures.push(`${offScenario.name}: the switch off did not clip every column — height(s) `
        + `${offHeights.join("/")} against the row floor (${ROW_FLOOR}px + 1), tallest set by `
        + `${off.worst.child} in ${off.worst.cell} at ${off.worst.width}px wide`);
    }

    const onText = on.tallestTextCell ?? 0;
    const onOk = Math.max(...on.heights) > ROW_FLOOR + 1 && onText > ONE_LINE_CEILING;
    console.log(`  ${onOk ? "PASS" : "FAIL"}  ${onScenario.name.padEnd(52)} `
      + `tallest ${Math.max(...on.heights)}px, tallest text-only cell ${onText}px (both must exceed)`);
    if (!onOk) {
      failures.push(`${onScenario.name}: the switch on did not wrap — tallest row `
        + `${Math.max(...on.heights)}px against the floor (${ROW_FLOOR}px + 1), tallest text-only `
        + `cell ${onText}px against a one-line ceiling of ${ONE_LINE_CEILING}px`);
    }
  }
}

// ───────────────────────────────────────────────────────────────────
// 4c. BOARD GEOMETRY
// ───────────────────────────────────────────────────────────────────

console.log("\nrender-assertions: board geometry against the measured Anytype capture");
if (!geometryOutcome || !geometryOutcome.provenance) {
  failures.push("board geometry: the board scenario did not carry the production-render marker — "
    + "measuring DOM without it would prove nothing about the shipped renderer");
  console.log("  FAIL  board geometry — no production-render marker");
} else {
  for (const pin of geometryOutcome.pins) {
    const ok = pin.found && pin.value === pin.expected;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${pin.label.padEnd(16)} ${pin.selector.padEnd(42)} `
      + `${JSON.stringify(pin.found ? pin.value : null)}`);
    if (!pin.found) failures.push(`board geometry ${pin.label}: selector "${pin.selector}" matched nothing`);
    else if (!ok) failures.push(`board geometry ${pin.label}: ${pin.selector} read ${JSON.stringify(pin.value)}, `
      + `expected ${JSON.stringify(pin.expected)}`);
  }

  const chipOk = geometryOutcome.chipHeight === 24;
  console.log(`  ${chipOk ? "PASS" : "FAIL"}  ${"chip height".padEnd(16)} `
    + `${".db-kanban-col-chip painted".padEnd(42)} ${geometryOutcome.chipHeight}px`);
  if (!chipOk) failures.push(`board geometry header chip: painted height ${geometryOutcome.chipHeight}px, `
    + "expected 24px (a capture reads it at 48 device pixels; divide by the DPR before comparing)");

  const heights = geometryOutcome.rowHeights;
  const pitchOk = heights.length > 0 && heights.every((height) => height === 25);
  console.log(`  ${pitchOk ? "PASS" : "FAIL"}  ${"row pitch".padEnd(16)} `
    + `${".db-board-card-field on card one".padEnd(42)} [${heights.join(", ")}]`);
  if (heights.length === 0) failures.push("board geometry row pitch: no .db-board-card-field row on the first card");
  else if (!pitchOk) failures.push(`board geometry row pitch: ${[...new Set(heights)].join(", ")}px, expected a uniform 25px`);

  const radiusOk = geometryOutcome.checkboxRadius === "50%";
  console.log(`  ${radiusOk ? "PASS" : "FAIL"}  ${"checkbox shape".padEnd(16)} `
    + `${".db-checkbox-field border-radius".padEnd(42)} ${JSON.stringify(geometryOutcome.checkboxRadius)}`);
  if (!radiusOk) failures.push(`board geometry checkbox shape: border-radius ${JSON.stringify(geometryOutcome.checkboxRadius)}, `
    + 'expected "50%" — a circle, not the app-wide rounded square');

  // The page scrolls far enough to reach the last card of an overfilled column, no column and no
  // board is its own vertical scroll container, and the horizontal bar paints 0px at rest and
  // 10px while scrolling rather than a bar painted at rest — a threshold on the declined-at-rest
  // value rather than a deletion of the pin, so a later reinstatement still has a check to redden.
  const pageScrollOk = geometryOutcome.pageOverflowY === "auto"
    && geometryOutcome.pageScrollReached > 0
    && geometryOutcome.lastCardReachable === true;
  console.log(`  ${pageScrollOk ? "PASS" : "FAIL"}  ${"page scroll".padEnd(16)} `
    + `${"overflow-y / scrollTop / last card".padEnd(42)} `
    + `${JSON.stringify(geometryOutcome.pageOverflowY)} / ${geometryOutcome.pageScrollReached} / ${geometryOutcome.lastCardReachable}`);
  if (!pageScrollOk) failures.push(`board geometry page scroll: .db-kanban-view overflow-y read `
    + `${JSON.stringify(geometryOutcome.pageOverflowY)}, scrolled to ${geometryOutcome.pageScrollReached} of `
    + `${geometryOutcome.pageScrollHeight}/${geometryOutcome.pageClientHeight}, last card reachable `
    + `${geometryOutcome.lastCardReachable} — the container must scroll far enough to reach the last card of an `
    + `overfilled column. An "auto" that scrolls 0 is the shape this check exists to catch: a board flex-shrunk `
    + `back to the container's height, clipping everything past the first screen with nothing left to scroll`);

  const columnScrollOk = geometryOutcome.columnOverflowY === "visible" && geometryOutcome.boardOverflowY === "visible";
  console.log(`  ${columnScrollOk ? "PASS" : "FAIL"}  ${"column scroll".padEnd(16)} `
    + `${".db-kanban-cards / .db-kanban-board overflow-y".padEnd(42)} `
    + `${JSON.stringify(geometryOutcome.columnOverflowY)} / ${JSON.stringify(geometryOutcome.boardOverflowY)}`);
  if (!columnScrollOk) failures.push(`board geometry column scroll: .db-kanban-cards overflow-y read `
    + `${JSON.stringify(geometryOutcome.columnOverflowY)} and .db-kanban-board read ${JSON.stringify(geometryOutcome.boardOverflowY)}, `
    + `expected "visible" for both — neither a column nor the board may be its own scroll container `
    + `(the negative control: putting "overflow-y: auto" back on .db-kanban-cards turns this red)`);

  const scrollbarRestOk = geometryOutcome.scrollbarRestHeight === "0px";
  console.log(`  ${scrollbarRestOk ? "PASS" : "FAIL"}  ${"scrollbar (rest)".padEnd(16)} `
    + `${".db-kanban-view ::-webkit-scrollbar".padEnd(42)} ${JSON.stringify(geometryOutcome.scrollbarRestHeight)}`);
  if (!scrollbarRestOk) failures.push(`board geometry scrollbar (rest): height read `
    + `${JSON.stringify(geometryOutcome.scrollbarRestHeight)}, expected "0px" — the operator's ruling declines the `
    + `measured 10px lane at rest`);

  const scrollbarActiveOk = geometryOutcome.scrollbarActiveHeight === "10px";
  console.log(`  ${scrollbarActiveOk ? "PASS" : "FAIL"}  ${"scrollbar (active)".padEnd(16)} `
    + `${".db-kanban-view.is-scrolling ::-webkit-scrollbar".padEnd(42)} ${JSON.stringify(geometryOutcome.scrollbarActiveHeight)}`);
  if (!scrollbarActiveOk) failures.push(`board geometry scrollbar (active): height read `
    + `${JSON.stringify(geometryOutcome.scrollbarActiveHeight)}, expected "10px" — the measured reference geometry still applies `
    + `once the bar is shown, only "at rest" is declined`);

  // "Edge only": the bar reveals when the pointer sits within its own edge band, keyed by the
  // class the renderer's pointermove listener toggles — not by a bare `:hover`, which painted the
  // bar for a pointer anywhere over the cards. A regression back to a pane-wide `:hover` selector
  // would still read "10px" here (both selectors would match a hovered, unclassed container in a
  // real browser), so this pin cannot by itself catch that regression; it exists to keep the
  // edge-hover class wired to the same reveal the operator asked scrolling to have, the way
  // scrollbar (active) does for "is-scrolling".
  const scrollbarEdgeHoverOk = geometryOutcome.scrollbarEdgeHoverHeight === "10px";
  console.log(`  ${scrollbarEdgeHoverOk ? "PASS" : "FAIL"}  ${"scrollbar (edge-hover)".padEnd(16)} `
    + `${".db-kanban-view.is-edge-hover ::-webkit-scrollbar".padEnd(42)} ${JSON.stringify(geometryOutcome.scrollbarEdgeHoverHeight)}`);
  if (!scrollbarEdgeHoverOk) failures.push(`board geometry scrollbar (edge-hover): height read `
    + `${JSON.stringify(geometryOutcome.scrollbarEdgeHoverHeight)}, expected "10px" — the "Edge only" ruling still reveals `
    + `the bar once the pointer is within its edge band, only a pane-wide hover is declined`);

  // The vertical bar, on the same three states as the horizontal one above. Its own row rather
  // than a fourth height read: the three rules above set `height` only, which left the app-wide
  // 8px width standing and shipped a board whose vertical thumb was painted at rest on any pane
  // with vertical overflow — the exact state the ruling declines, invisible to a height-only pin.
  // All three states are read together so the row cannot go green the other way either, by a
  // width of 0 that never reveals.
  const restWidth = geometryOutcome.scrollbarRestWidth;
  const activeWidth = geometryOutcome.scrollbarActiveWidth;
  const edgeWidth = geometryOutcome.scrollbarEdgeHoverWidth;
  const scrollbarWidthOk = restWidth === "0px" && activeWidth === "10px" && edgeWidth === "10px";
  console.log(`  ${scrollbarWidthOk ? "PASS" : "FAIL"}  ${"scrollbar (vertical)".padEnd(16)} `
    + `${".db-kanban-view ::-webkit-scrollbar width".padEnd(42)} `
    + `${JSON.stringify(restWidth)} / ${JSON.stringify(activeWidth)} / ${JSON.stringify(edgeWidth)}`);
  if (!scrollbarWidthOk) failures.push(`board geometry scrollbar (vertical): ::-webkit-scrollbar width read `
    + `${JSON.stringify(restWidth)} at rest, ${JSON.stringify(activeWidth)} scrolling, ${JSON.stringify(edgeWidth)} `
    + `edge-hovered, expected "0px" / "10px" / "10px" — the same ruling that hides the horizontal bar at rest `
    + `hides the vertical one, and the app-wide 8px width is what it has to override to do it`);

}

// ───────────────────────────────────────────────────────────────────
// 4d. PHONE WEEK OVERLAP INK
// ───────────────────────────────────────────────────────────────────

console.log("\nrender-assertions: phone week overlap-column title ink");
{
  const name = PHONE_OVERLAP_SCENARIO.name;
  if (!phoneOverlapInk || phoneOverlapInk.blockCount !== 2) {
    failures.push(`${name}: measured ${phoneOverlapInk?.blockCount ?? 0} timed block(s), want 2 — `
      + "the overlap fixture itself did not render, so this run proves nothing about the overlap column");
    console.log(`  FAIL  ${name} — ${phoneOverlapInk?.blockCount ?? 0} timed block(s), want 2`);
  } else {
    for (const title of phoneOverlapInk.titles) {
      // Past PHONE_OVERLAP_INK_FLOOR, not merely non-zero: green here is "three glyphs and an
      // ellipsis", not the whole title — the halved column stays tight even at the phone minimum
      // — but a 1-3px sliver is antialiasing dust, not a title (see the floor's own comment for
      // the measured pre/post values).
      const ok = title.visibleWidth >= PHONE_OVERLAP_INK_FLOOR && title.text.trim().length > 0;
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${name.padEnd(46)} `
        + `block ${title.blockWidth}px, visible title ink ${title.visibleWidth}px, floor ${PHONE_OVERLAP_INK_FLOOR}px ("${title.text}")`);
      if (!ok) {
        failures.push(`${name}: an overlap-column block's title measured ${title.visibleWidth}px of `
          + `visible ink against a ${PHONE_OVERLAP_INK_FLOOR}px floor (block ${title.blockWidth}px, `
          + `text "${title.text}") — no ink, the defect this scenario exists to catch`);
      }
    }
  }
}

// ───────────────────────────────────────────────────────────────────
// 5. BAG SHAPE COMPARISON
// ───────────────────────────────────────────────────────────────────

console.log("\nrender-assertions: bag shapes against the measured host construction sites");
for (const outcome of outcomes) {
  const key = `${outcome.scenario.renderer}/${outcome.scenario.bag}`;
  const expected = BAGS[key];
  const actual = outcome.bagKeys;
  const missing = expected.filter((member) => !actual.includes(member));
  const extra = actual.filter((member) => !expected.includes(member));
  const ok = missing.length === 0 && extra.length === 0;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${key.padEnd(20)} ${actual.length}/${expected.length} members`
    + (missing.length ? `; MISSING: ${missing.join(", ")}` : "")
    + (extra.length ? `; UNEXPECTED: ${extra.join(", ")}` : ""));
  if (!ok) failures.push(`bag shape ${key}: ${missing.length ? `missing ${missing.join(", ")}` : `unexpected ${extra.join(", ")}`}`);
}

console.log(`  file-view-only members (${FILE_VIEW_ONLY.length}): ${FILE_VIEW_ONLY.join(", ")}`);
console.log("  embed-only member: isReadOnly");
console.log("  note: the embed omits openRecordDetail, so an embedded row cannot open the record panel;");
console.log("        this check asserts the difference exists, not that it is intended");

// ───────────────────────────────────────────────────────────────────
// 6. COVERAGE RATCHET
// ───────────────────────────────────────────────────────────────────

const constructed = countConstructed(SCENARIOS);
const viewFiles = readdirSync(join(REPO, "src/views"))
  .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts") && !name.endsWith(".stories.ts"));
const total = viewFiles.filter((name) =>
  /export class \w*Renderer/.test(readFileSync(join(REPO, "src/views", name), "utf8"))).length;

let published = 0;
if (existsSync(join(REPO, STAMP_PATH))) {
  const record = JSON.parse(readFileSync(join(REPO, STAMP_PATH), "utf8"));
  published = Number(record.constructed) || 0;
}
console.log(`\nrender-assertions: coverage ${constructed} distinct renderers of ${total} renderer files exercised by this check`
  + ` (published ${published})`);
if (constructed < published) {
  console.error(`render-assertions: FAIL — coverage cannot decrease: ${published} published, `
    + `this check constructs ${constructed} distinct renderers`);
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────
// 7. VERDICT
// ───────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(`\nrender-assertions: FAIL — ${failures.length} assertion(s) failed`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

stamp(
  STAMP_PATH,
  { constructed, total, note: "was 6/21; gallery renderer retired" },
  [
    "tools/live/render-assertions.mjs",
    "tools/live/render-assertion-harness.ts",
    "styles.css",
    ...RENDERER_SOURCES,
    "tools/bench/table-render-bench.ts",
    "tools/bench/board-render-bench.ts",
    "tools/bench/calendar-render-bench.ts",
    "tools/bench/timeline-render-bench.ts",
    "src/views/database-view.ts",
    "src/views/embedded-database-renderer.ts",
  ],
);
console.log(`render-assertions: coverage stamped at ${STAMP_PATH}`);

console.log("\nrender-assertions: PASS — the shipped renderers built the asserted structure in headless Chrome");
console.log("  what this does not prove: no Obsidian host is constructed (DatabaseView and the embed");
console.log("  need a live App, workspace and metadata cache); no device is involved; App is undefined,");
console.log("  so vault-resolving fields render unresolved — a real database pays more per field, never less.");
process.exit(0);
