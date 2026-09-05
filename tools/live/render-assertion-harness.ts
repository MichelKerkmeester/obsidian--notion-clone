// ───────────────────────────────────────────────────────────────────
// MODULE:    render-assertion-harness
// COMPONENT: asserts structural properties of what the shipped renderers build
// ───────────────────────────────────────────────────────────────────
//
// The gate used to run fourteen checks and none of them built a renderer the
// plugin ships. The unit suite has no DOM, the captures photograph hand-written
// markup, and the placement check bundles production code but no renderer — so
// a row loop that forced a synchronous layout once per row froze the app on a
// real device and every check stayed green.
//
// This harness mounts the real renderers in a real browser and asserts facts
// about the DOM they build: node counts per row, affordance presence, column
// alignment, and the absence of per-row forced layout. It asserts structure
// with thresholds, not snapshots — a count moves when the renderer changes
// shape and is stable when it does not.
//
// It constructs renderers, never hosts. The hosts extend Obsidian's FileView
// and MarkdownRenderChild and need a live App, workspace and metadata cache;
// the renderers tolerate their absence, which is the property this exploits.
// The two hosts are reproduced by their action bags, which are plain objects
// and are built here as data measured from the two construction sites.
//
// WHAT THIS RUN DOES NOT PROVE, in the runner's own output: no Obsidian host
// is constructed, no device is involved, and App is undefined here, so
// vault-resolving fields render unresolved — a real database pays more per
// field, never less.
//
// NEGATIVE CONTROLS. Every bound below must have been observed failing before
// it counts as evidence, and a bound that was never seen failing is not
// evidence. The list, calendar and timeline bounds reddened on the trees that
// shipped their defects; board and gallery read 1 against the same bound of 8
// with no red on this tree, and the table's per-row bound is new here, so all
// three own a switch that reintroduces the shape the bound exists to catch.
// The calendar week and day scenarios are new here and own the same switch;
// the chart scenario's switch is separate, because the chart has no bag member
// called per item.
//
// `RENDER_READ_CONTROL=per-item`, read by the runner and passed into
// `runRenderAssertions`, arms it: the card and row renderers call the bag's
// `applyConditionalFormat` once per item with no target field — field-level
// calls always name the field — and the armed wrapper reads the item's box at
// that call. Board and gallery then read one per card plus the touch probe,
// the table one per row plus its O(1) reads, and the check fails naming the
// scenario; disarmed, each reads its O(1) count. The chart's armed wrapper
// reads the host's box once per row at the render entry, since neither host
// passes an action the renderer calls per item.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { TableRenderer, type TableRendererActions } from "../../src/views/table-renderer";
import { applyListMigration, planListMigration } from "../../src/data/list-migration";
import { CellRenderer } from "../../src/views/cell-renderer";
import { CalendarRenderer, type CalendarRendererActions } from "../../src/views/calendar-renderer";
import { ChartRenderer, type ChartRendererActions } from "../../src/views/chart-renderer";
import {
  CalendarTimelineRenderer,
  type CalendarTimelineRendererActions,
} from "../../src/views/calendar-timeline-renderer";
import { buildTimelineRangeGeometry } from "../../src/data/calendar-timeline-model";
import { dateKeyDaysBetween, getLocalDateKey, renderNow, setFrozenRenderNow } from "../../src/data/calendar-date-time";
import { ChartToolbarRenderer, type ChartToolbarActions } from "../../src/views/chart-toolbar-renderer";
import { CalendarToolbarRenderer, type CalendarToolbarActions } from "../../src/views/calendar-toolbar-renderer";
import {
  CalendarTimelineToolbarRenderer,
  type CalendarTimelineToolbarActions,
} from "../../src/views/calendar-timeline-toolbar-renderer";
import type { App } from "obsidian";
import type { DataSource } from "../../src/data/data-source";
import type { ColumnDef, RowData, StatusOptionDef, TimelineScale, ViewConfig } from "../../src/data/types";
import {
  makeColumns as makeTableColumns,
  makeRows as makeTableRows,
  makeConfig as makeTableConfig,
} from "../bench/table-render-bench";
import { BoardRenderer, type BoardRendererActions } from "../../src/views/board-renderer";
import { GalleryRenderer, type GalleryRendererActions } from "../../src/views/gallery-renderer";
import {
  makeColumns as makeBoardColumns,
  makeRows as makeBoardRows,
  makeGroups as makeBoardGroups,
  makeConfig as makeBoardConfig,
  GROUP_FIELD as BOARD_GROUP_FIELD,
} from "../bench/board-render-bench";
import {
  makeColumns as makeGalleryColumns,
  makeRows as makeGalleryRows,
  makeConfig as makeGalleryConfig,
} from "../bench/gallery-render-bench";
import {
  makeColumns as makeCalendarColumns,
  makeRows as makeCalendarRows,
  makeConfig as makeCalendarConfig,
} from "../bench/calendar-render-bench";
import {
  makeColumns as makeTimelineColumns,
  makeRows as makeTimelineRows,
  makeConfig as makeTimelineConfig,
} from "../bench/timeline-render-bench";
import { ToolbarRenderer, type ToolbarActions, type ToolbarViewEntry } from "../../src/views/toolbar-renderer";
import { ActiveViewControlsRenderer, type ActiveViewControlsActions } from "../../src/views/active-view-controls-renderer";
import { ActiveRulePopoverRenderer } from "../../src/views/active-rule-popover-renderer";
import { FilterPanelRenderer, type FilterPanelActions } from "../../src/views/filter-panel-renderer";
import { SortPanelRenderer, type SortPanelActions } from "../../src/views/sort-panel-renderer";
import { ViewConfigPanelRenderer, type ViewConfigPanelActions } from "../../src/views/view-config-panel-renderer";
import { listBoardCardFields, toBoardCardFieldList } from "../../src/views/board-card-fields";
import { ColumnManagerRenderer, type ColumnManagerActions } from "../../src/views/column-manager-renderer";
import { openColumnWidthAdjuster } from "../../src/views/column-width";
import {
  openRecordDetailPanel,
  closeRecordDetailPanel,
  type RecordDetailActions,
} from "../../src/views/record-detail-panel";
import { mountNoteBodyRegion } from "../../src/views/note-body-region";
import { openTableRecordPeek } from "../../src/views/table-record-peek";
import { SummaryRenderer } from "../../src/views/summary-renderer";
import { createOwnedMenu } from "../../src/views/owned-menu";
import { renderDateValuePicker } from "../../src/views/date-value-picker";
import { openIconPickerPopover } from "../../src/views/icon-picker-popover";
import { openOptionColorPicker, closeActiveOptionColorPicker } from "../../src/views/option-color-picker";
import { renderRelationValue } from "../../src/views/relation-value-renderer";
import { renderSpecialFileFieldValue } from "../../src/views/file-field-renderer";
import { renderRating, renderProgress, renderProgressRing } from "../../src/views/number-display-renderer";
import { renderRecordIcon } from "../../src/views/record-icon-renderer";
import { openDropdownMenu } from "../../src/views/dropdown-field";
import { EmptyStateRenderer } from "../../src/views/empty-state-renderer";
import { ColumnHeaderController, type ColumnHeaderActions } from "../../src/views/column-header-controller";
import { withEmptyOptionGroups } from "../../src/data/group-visibility";
import type { DatabaseConfig, RecordSchema } from "../../src/data/types";
import type { DatabaseViewState } from "../../src/views/view-state-store";
import type { BoardGroup } from "../../src/views/board-renderer";
import type { TableGroup } from "../../src/views/table-renderer";
import type { GalleryGroup } from "../../src/views/gallery-renderer";

// The constructed timeline capture mounts the real CalendarTimelineRenderer against the real
// bench fixture, and both anchor their dates on "today" (the bars, the gantt's today line and
// the drawn range all read renderNow()). Freezing it once here — the only place this harness
// bundle ever calls the setter — means every render-assertions/touch-targets/unstyled-links/
// screenshot run this bundle drives sees the same "today" regardless of which real calendar day
// it runs on. Production never imports this file, so the shipped views keep reading the real
// clock unaffected.
setFrozenRenderNow(new Date(2026, 2, 25, 13, 45, 0, 0));

// ───────────────────────────────────────────────────────────────────
// 2. SHAPES UNDER TEST
// ───────────────────────────────────────────────────────────────────

// The same measured shapes the benches time: the operator's twenty-one-column
// database at thirty percent fill, and the table bench's sixteen-column table.
// Sampling above the bend matters for timing budgets; for structure it matters
// that the row count is the count the freeze was measured at.
export const LIST_COLUMNS = 21;
export const TABLE_COLUMNS = 16;
export const TABLE_ROWS = 2000;

// A render that forces layout more than a small constant times has something
// per-row in it. The legitimate reads are O(1) in the row count and decided
// once per render: the touch-mode probe and the reservation decision.
//
// The table carries the same constant over its TOTAL reads — the touch probe
// and the width question are its legitimate O(1) reads, measured 3. Its
// connected reads are separately bounded below, because a geometry read on the
// detached body costs no layout and the two populations answer different
// questions; the total bound is the per-item guard, the connected one the
// layout-cost guard.
export const MAX_LAYOUT_READS = 8;

// The two date-driven views, at the row count their freeze was reported at. Both draw a window
// rather than the whole set, so their row count and their drawn-item count are different numbers
// and the assertions below check the second one is not zero.
export const CALENDAR_COLUMNS = 21;
export const CALENDAR_ROWS = 1600;
export const CALENDAR_FILL = 0.3;
export const TIMELINE_COLUMNS = 21;
export const TIMELINE_ROWS = 1600;
export const TIMELINE_FILL = 0.3;

// The two card views, at the same shape their benches time. Both build one card per row into a
// single container, which is the arrangement the per-item layout read is dangerous in.
export const BOARD_COLUMNS = 21;
export const BOARD_ROWS = 1600;
export const BOARD_FILL = 0.3;
export const BOARD_GROUPS = 5;
export const GALLERY_COLUMNS = 21;
export const GALLERY_ROWS = 1600;
export const GALLERY_FILL = 0.3;

// The chart is fed the board bench's measured shape — the operator's twenty-one-column database
// at thirty percent fill, grouped by the bench's five-status field. The chart has no bench of
// its own: it draws one canvas, so its item count is the group count, and the row count only
// enters through the aggregation, which is the path this shape exercises.
export const CHART_COLUMNS = BOARD_COLUMNS;
export const CHART_ROWS = BOARD_ROWS;
export const CHART_FILL = BOARD_FILL;
export const CHART_GROUPS = BOARD_GROUPS;

// The chart pays a fixed token-read set — the theme colours are read once per render — plus
// Chart.js's own canvas sizing, which is O(1) in the data. The bound sits above that fixed set
// (measured 30 on this fixture) and far below any read that scales with rows; the armed control
// re-introduces one read per row and must clear it by two orders of magnitude.
export const MAX_CHART_LAYOUT_READS = 48;

export interface ScenarioSpec {
  renderer: "list" | "table" | "calendar" | "timeline" | "board" | "gallery" | "chart"
    | "calendar-toolbar" | "timeline-toolbar" | "chart-toolbar"
    | "toolbar" | "active-view-controls" | "active-rule-popover" | "filter-panel" | "sort-panel"
    | "view-config" | "column-manager" | "record-detail" | "record-detail-body" | "record-peek"
    | "column-width-adjuster"
    | "summary" | "owned-menu" | "cell-editors" | "date-picker" | "icon-picker" | "color-picker"
    | "relation-values" | "file-fields" | "number-display" | "record-icon" | "dropdown"
    | "empty-state" | "column-header" | "group-selection-controls" | "card-covers";
  bag: "file-view" | "embed";
  /** Opt-in table shape for a width comparison that fits on desktop and overflows on a phone. */
  tableColumnCount?: number;
  /** The calendar scale to construct (month/week/day) or the timeline scale to construct
   *  (day/week/month/quarter/year) — whichever the named `renderer` owns. A ScenarioSpec names
   *  one renderer, so the two scale sets never need this field at once. Calendar defaults to
   *  "month" when omitted; timeline defaults to "week", its own implicit behaviour before this
   *  field existed. */
  scale?: "month" | "week" | "day" | "quarter" | "year";
  /**
   * Opt-in: swaps the harness's own 1600-2000-row "text" structural-cost shape for a small
   * "mixed"-type dataset sized like the hand-written fixtures (`scenarios/shared.mjs`'s ~20-row
   * ROWS) — select, checkbox, date, currency, relation. Off by default so `render-assertions.mjs`,
   * `touch-targets.mjs` and `unstyled-links.mjs` keep measuring the shape their bounds were
   * calibrated against; `capture.mjs` is the only caller that turns it on, because a capture
   * proves what the shipped types render as, not how many layout reads a freeze-scale render costs.
   * The table branch reads it too, but for the cell renderer rather than the row shape: table
   * keeps its full row count and instead routes cells through the production `CellRenderer` (the
   * same class the file-view and embed hosts wire into their own `renderCell` action) so a typed
   * column paints its real pill/checkbox/currency/date/relation display instead of the bench's
   * plain-text stub. The chart branch reads it to pick a per-row value column and switch off
   * `count` aggregation, since `count` needs no per-row field to draw its bars.
   */
  captureData?: boolean;
  /**
   * Opt-in, board and timeline only, read together with `captureData`: wires the first three
   * capture-sized rows into a parent with two children via the same frontmatter keys
   * `buildSubtaskRelation` reads (`parentId`/`subtaskIds`/`collapsed`/`progress`) — the relation is
   * a pure derivation over those fields, so setting them is the same input a real vault note gives
   * it, not a fabricated DOM shape. Off by default; every existing consumer is unaffected.
   */
  subtaskTree?: boolean;
  /**
   * Opt-in, calendar only: strips every date-like column from the constructed schema and clears
   * `calendarStartDateField`, reproducing the real "no date property configured" condition
   * `getDefaultEventDateField` and `renderMonth`/`renderWeek`/`renderDay` already branch on in
   * production, rather than a harness-invented empty state. Off by default; every existing
   * consumer is unaffected.
   */
  emptyState?: boolean;
  /**
   * Opt-in, chart only: "number" sets `chartType: "number"` (the renderer's own three-div,
   * no-canvas branch); "empty" hides every group value the board bench's group field produces via
   * `chartHiddenGroups`, reproducing the real `allGroupsHidden` aggregation result. Both are real
   * `ViewConfig` shapes a configured chart can reach, not synthesized DOM. Undefined keeps the
   * existing "bar" behaviour every current consumer measures.
   */
  chartVariant?: "number" | "empty";
  /**
   * Opt-in, calendar, month scale only: after the month grid mounts, clicks the real mini
   * date-picker trigger `renderMiniCalendarButton` builds in the header — the same
   * `data-icon="calendar-days"` button a device tap reaches — so `renderMiniCalendar`'s own
   * popover opens through its real production path rather than a hand-applied class. Off by
   * default; every existing consumer is unaffected.
   */
  miniCalendar?: boolean;
  /**
   * Opt-in, renderer "toolbar" only: after the toolbar mounts, clicks one of its own trigger
   * buttons to open the surface it owns — "utilities" clicks the More-tools button
   * (`renderUtilitiesOverflowButton`'s own onclick), "add-view" clicks the view-tab plus button
   * (`showAddViewMenu`'s own onclick). The same anchors a device tap reaches; nothing is
   * hand-applied. Undefined leaves the toolbar closed, which is what the plain toolbar
   * scenarios photograph.
   */
  toolbarPopover?: "utilities" | "add-view";
  /**
   * Opt-in, renderer "toolbar" only: the search text `renderSearch` reads from the view state.
   * A non-empty value is what widens the collapsed 28px wrap into its active state and reveals
   * the clear button — the real `DatabaseViewState.searchText` a typed query produces. Defaults
   * to the empty string every state starts with.
   */
  searchText?: string;
  /**
   * Opt-in, renderer "active-view-controls" only: which chip groups the state carries.
   * "filter" renders the filter group alone, "sort" the sort group alone, "both" the shared
   * rail with sort chips first and the AND/OR logic button between the groups. Defaults to
   * "both", the only shape the fixture this supersedes photographs.
   */
  rules?: "filter" | "sort" | "both";
  /**
   * Opt-in, renderer "active-rule-popover" only: which single-rule editor the popover opens —
   * `ActiveRulePopoverRenderer.toggleFilter` or `toggleSort`, the same entries the chip row's
   * edit buttons call.
   */
  ruleKind?: "filter" | "sort";
  /**
   * Opt-in, renderer "filter-panel" only: how deep the filter tree the panel renders is. "flat"
   * is a single AND group of leaf rules (the panel header drops its own logic button, because
   * the group carries it); "nested" is a group holding a NOT node and an inner OR group — the
   * deepest shape `MAX_FILTER_GROUP_DEPTH` allows for the wrapped subtree. Defaults to "flat".
   */
  filterDepth?: "flat" | "nested";
  /**
   * Opt-in, renderer "sort-panel" only: renders the calendar-layout hint above the empty state.
   * `SortPanelRenderer` reads `config.viewType === "calendar"` to decide, so this sets that real
   * config value and leaves the rule list empty, which is the only state the hint appears in.
   */
  calendarHint?: boolean;
  /**
   * Opt-in, renderer "view-config" only: builds a board view instead of the branch's default
   * table view, so `renderBoardSettings` mounts `renderBoardCardProperties` — the harness's one
   * `view-config` scenario before this option existed was table-only, and the Properties section
   * only exists on a board. The schema and stored `boardCardFields` list are
   * `board-card-properties-panel.stories.ts`'s own `Editable` fixture verbatim (Hours and Due
   * stored visible, Tags stored hidden), so the story and this capture show identical state.
   * Defaults to "table".
   */
  viewConfigVariant?: "table" | "board";
  /**
   * Opt-in, renderer "record-detail-body" only: which note-body mode `mountNoteBodyRegion`
   * mounts. "empty" is a record whose note is only frontmatter (the placeholder line);
   * "editing" is the region after `beginEdit` swapped the rendered body for its textarea;
   * "read" is a rendered body with content. Defaults to "read".
   */
  recordBodyVariant?: "empty" | "editing" | "read";
  /**
   * Opt-in, renderer "record-peek" only: whether `openTableRecordPeek` is given the touch
   * hand-off it is wired with in production. Defaults to `true` (undefined behaves the same as
   * `true`), matching every existing caller of this scenario unchanged: the harness's own
   * positioning anchor (`makeHiddenAnchor`) is a 1px span, so `isTouchDevice`'s container-width
   * signal reads it as narrow regardless of the page's real viewport, and the hand-off always
   * fires. Explicit `false` renders the docked rail instead, by omitting the `openRecordDetail`
   * callback entirely — `openTableRecordPeek`'s own contract for an absent callback ("the rail
   * opens as it always did"), not a synthetic touch override, since no anchor width this harness
   * could construct would make `isTouchDevice` agree that a 1px span is a wide desktop pane.
   */
  recordPeekTouch?: boolean;
  /**
   * Opt-in, renderer "cell-editors" only: which cell editor `CellRenderer.startEdit` opens on
   * the constructed row. "text" opens the markdown textarea editor (with its format toolbar) on
   * one cell and the single-line number editor on another; "select" opens the option-list
   * editor. Defaults to "text".
   */
  editorKind?: "text" | "select";
  /**
   * Opt-in, renderer "date-picker" only: whether the picker's column type is datetime. Sets the
   * `includeTime` flag the trigger reads for its clock icon and the popover reads for its hour
   * and minute segments.
   */
  includeTime?: boolean;
  /**
   * Opt-in, renderer "board" only: `boardExtensionsEnabled` — the real config flag that switches
   * the board from the reference kanban vocabulary to the plugin's own extension classes
   * (`db-board`, `db-board-column-checkbox`, `db-board-card-checkbox`, the card tree with
   * covers). Off by default, matching the board every existing consumer constructs.
   */
  boardExtensions?: boolean;
  /**
   * Opt-in, renderer "board" only, read with `boardExtensions`: sets `boardImageField` to a real
   * schema column the rows resolve no image for, so `renderCover` draws its placeholder cover on
   * every card — the empty-cover state, which is the only one a capture without a vault can show.
   */
  boardImageField?: boolean;
  /**
   * Opt-in, renderer "board" only: appends an empty group through the same
   * `withEmptyOptionGroups` call the hosts make, by configuring one select option the rows never
   * carry. The reference board then renders a column with a header, a zero count and an empty
   * cards container beside the populated lanes.
   */
  boardEmptyColumn?: boolean;
  /**
   * Opt-in, renderer "board" only: stores an explicit `boardCardFields` list that reproduces
   * today's derived default verbatim — same fields, same order, same visibility — except for
   * hiding the schema's first currency column (`columnOfType(columns, "currency")`, the same
   * helper the filter/sort panel branches already use to find one). Proves a stored list removes
   * a field from the rendered card, not only from the panel that edits it: the card this produces
   * differs from `board`'s own default capture in exactly one field. Off by default; every
   * existing board consumer is unaffected.
   */
  boardCardFieldsHidden?: boolean;
  /**
   * Opt-in, renderer "gallery" only: sets `galleryImageField` to a real schema column the rows
   * resolve no image for, so `renderCover` draws its placeholder cover on every card.
   */
  galleryImageField?: boolean;
  /**
   * Opt-in, renderer "table" only: renders the grouped table instead of the flat one — the
   * `renderGroupedTable` public entry the host calls when a group field is configured, with a
   * two-level group tree and per-group summary rules so the divider rows carry their badges and
   * computed totals.
   */
  tableGroups?: boolean;
  /**
   * Opt-in, renderer "table" only: configures `summaryRules` for a currency (sum + average), a
   * date (earliest) and a select (unique) column, so the footer the table renders after its body
   * stacks real calculated results instead of the + Calculate hints alone.
   */
  tableFooter?: boolean;
  /**
   * Opt-in, renderer "table" only: points the table's select/status/multi-select columns at a
   * sixteen-colour option palette and gives one multi-select row every value, so a single capture
   * shows the whole `status-color-*` vocabulary as the renderer paints it.
   */
  fullStatusPalette?: boolean;
  /**
   * Opt-in, renderer "table" only: `showRecordIcon` plus a real `renderRecordIcon` bag member,
   * so the table draws its 28px icon gutter and each row's icon span. Token variety is bounded
   * by the bundle: Obsidian's `getIconIds` is out of scope, so lucide tokens degrade to the
   * default file-text fallback and only emoji tokens render their own variant.
   */
  recordIconColumn?: boolean;
  /**
   * Opt-in, renderer "table" only: wires the `setupColumnHeader` bag member to a real
   * `ColumnHeaderController.setup` — the same wiring `database-view.ts` uses — so every header
   * carries its production menu trigger, resize handle and drag affordances instead of the
   * plain-text stub.
   */
  columnHeaderController?: boolean;
  /**
   * Opt-in, renderer "table" only: stretches one column's label past the header width, the
   * truncation state the column-header fixture exists to photograph. Read together with
   * `columnHeaderController`.
   */
  longHeaderLabel?: boolean;
  /**
   * Opt-in, renderer "table" only: builds the config as `viewType: "list"`, runs it through the
   * production `planListMigration`/`applyListMigration`, then always mounts `TableRenderer`.
   * A migration that failed to flip the type fails the marker (`table.db-table` present,
   * `.db-list-row` absent) rather than constructing a retired renderer.
   */
  migratedFromList?: boolean;
}

export interface AssertionResult {
  name: string;
  pass: boolean;
  detail: string;
}

export interface ScenarioOutcome {
  scenario: ScenarioSpec;
  bagKeys: string[];
  results: AssertionResult[];
  /** The chart branch's own per-row value column key, when captureData wired one. Undefined for
   *  every other renderer and for a chart scenario that left captureData off — exposed here
   *  rather than only through an assertion's pass/fail, since a caller proving the OPTION is what
   *  produced it (the same negative-control shape typed-data-assertions.mjs already uses for the
   *  list scenario) needs a value that actually differs between the two states, not an invariant
   *  that stays true either way. */
  chartValueField?: string;
}

// ───────────────────────────────────────────────────────────────────
// 2B. CAPTURE-SIZED TYPED DATA (opt-in — see ScenarioSpec.captureData)
// ───────────────────────────────────────────────────────────────────

// A row count in the fixtures' own range rather than the freeze-scale shape above: the constructed
// list capture mounted 37 DOM rows below the fold at 1600 rows with no bounded scroll height in the
// capture host, which is a picture of an empty page, not of the renderer.
export const CAPTURE_ROWS = 18;
/** Rows for a capture whose subject sits under the table: few enough that a phone frames both. */
const FOOTER_CAPTURE_ROWS = 6;
// Every filled cell rather than the structural-cost benches' sparse fill: a capture exists to show
// what a select pill, a checkbox and a currency figure look like, and a mostly-empty row shows
// mostly placeholders instead.
const CAPTURE_FILL = 1;

// A small, named set rather than one colour per row. `col.type === "select"` under the benches'
// "mixed" kind produces a placeholder value ("${key}-${i}") that matches no configured option, so
// the renderer takes its real grey no-match fallback — accurate, but not the state a capture of a
// configured database exists to show. A repeated set of five is what a real select column looks
// like; giving every row its own value would prove the fallback, not the feature. Short, single
// words rather than "In progress": a multi-select cell shows two side by side, and the longer
// label overflowed the column at the bench's own width — the same words board-render-bench's own
// GROUP_KEYS already use for the same reason.
const CAPTURE_OPTIONS: StatusOptionDef[] = [
  { value: "Backlog", color: "gray" },
  { value: "Doing", color: "blue" },
  { value: "Review", color: "purple" },
  { value: "Done", color: "green" },
  { value: "Blocked", color: "red" },
];

/**
 * Gives every row an empty metadata cache, in place. `resolveCoverImage` reads `row.cache` first
 * and only reaches for `app.metadataCache` when the row has none — and this harness renders
 * without an App, so a cover-drawing scenario that leaves the cache unset throws rather than
 * rendering. An empty cache is also the honest state: no embed resolves an image, which is the
 * only cover state a render without a vault can reach.
 */
function applyEmptyMetadataCache(rows: RowData[]): void {
  for (const row of rows) (row as unknown as { cache?: unknown }).cache = {};
}

/**
 * Points every "mixed"-kind select/status/multi-select column (besides `excludeKey`, a caller's
 * own group field whose values grouping logic reads by identity) at `CAPTURE_OPTIONS` and
 * rewrites the rows' values to match, in place. Only touches keys the row already carries, so the
 * fill-rate gaps the bench decided stay gaps.
 *
 * The board bench's renamed "priority" column (board-render-bench.ts's PRIORITY_COLUMN_INDEX) is
 * excluded the same way the group field is: CAPTURE_OPTIONS' five generic status names carry no
 * tier meaning, so a priority column left in this loop would paint the reference's card-top strip
 * on every row (none of "Backlog"/"Doing"/"Review"/"Done"/"Blocked" match the reference's omitted
 * "medium"/"low"/"none" tiers) instead of only the tiers the reference actually paints it for.
 * `applyCapturePriorityTiers`, below, gives it real tier values instead.
 */
function applyCaptureOptions(columns: ColumnDef[], rows: RowData[], excludeKey?: string): void {
  const optionColumns = columns.filter(
    (col) => (col.type === "select" || col.type === "status" || col.type === "multi-select")
      && col.key !== excludeKey && col.key !== "priority",
  );
  for (const col of optionColumns) col.statusOptions = CAPTURE_OPTIONS;
  rows.forEach((row, i) => {
    const frontmatter = (row as unknown as { frontmatter: Record<string, unknown> }).frontmatter;
    for (const col of optionColumns) {
      if (!(col.key in frontmatter)) continue;
      frontmatter[col.key] = col.type === "multi-select"
        ? [CAPTURE_OPTIONS[i % CAPTURE_OPTIONS.length].value, CAPTURE_OPTIONS[(i + 2) % CAPTURE_OPTIONS.length].value]
        : CAPTURE_OPTIONS[i % CAPTURE_OPTIONS.length].value;
    }
  });
}

// The reference paints the card-top strip for every priority except its two lowest named tiers
// (board-renderer.ts's isReferenceLowPriorityTier: "medium"/"low"/"none") and omits it entirely
// when no priority column is mapped or a row carries no value. Four named tiers, not
// CAPTURE_OPTIONS' five generic status names, is what lets a single capture show both states at
// once — some cards striped, some not — rather than proving only the fallback or only the strip.
const PRIORITY_OPTIONS: StatusOptionDef[] = [
  { value: "urgent", color: "red" },
  { value: "high", color: "orange" },
  { value: "medium", color: "yellow" },
  { value: "low", color: "gray" },
];

/**
 * Gives the board bench's renamed "priority" column (board-render-bench.ts's
 * PRIORITY_COLUMN_INDEX) real tier values and colours, in place — the same shape
 * `applyCaptureGroupPalette` gives the group field, carved out of `applyCaptureOptions` above for
 * the same reason. `CAPTURE_ROWS` (18) cycling four tiers puts the first two tiers (urgent, high —
 * the ones the reference paints) on five rows each and the last two (medium, low — the reference's
 * own omitted tiers) on four rows each, so a mount always shows the strip on some cards and not
 * others rather than on all eighteen or none.
 */
function applyCapturePriorityTiers(columns: ColumnDef[], rows: RowData[]): void {
  const col = columns.find((candidate) => candidate.key === "priority");
  if (!col) return;
  col.statusOptions = PRIORITY_OPTIONS;
  rows.forEach((row, i) => {
    const frontmatter = (row as unknown as { frontmatter: Record<string, unknown> }).frontmatter;
    if (!(col.key in frontmatter)) return;
    frontmatter[col.key] = PRIORITY_OPTIONS[i % PRIORITY_OPTIONS.length].value;
  });
}

/**
 * The board's own group field carries values the bench decides (`GROUP_KEYS`, not exported), so
 * this derives a palette from whatever distinct values are actually present rather than
 * duplicating that list here — a copy that drifted out of sync would silently stop colouring the
 * column instead of failing loudly.
 */
function applyCaptureGroupPalette(columns: ColumnDef[], rows: RowData[], groupKey: string): void {
  const col = columns.find((candidate) => candidate.key === groupKey);
  if (!col) return;
  const distinct = [...new Set(rows.map((row) =>
    (row as unknown as { frontmatter: Record<string, unknown> }).frontmatter[groupKey]))]
    .filter((value): value is string => typeof value === "string");
  col.statusOptions = distinct.map((value, i) => ({ value, color: CAPTURE_OPTIONS[i % CAPTURE_OPTIONS.length].color }));
}

/**
 * Wires the first three capture-sized rows into a parent with two children via the same relation
 * frontmatter keys `buildSubtaskRelation` (subtask-relation.ts) derives from — `subtaskIds` /
 * `parentId` / `collapsed` / `progress`. `groupKey`, when given, copies the parent's group value
 * onto both children so a grouped renderer (board) keeps them in the same lane instead of
 * scattering them across columns a real vault's own grouping would never separate them from.
 */
function applyCaptureSubtaskTree(rows: RowData[], groupKey?: string): void {
  const record = (row: RowData) => (row as unknown as { frontmatter: Record<string, unknown> }).frontmatter;
  const [parent, first, second] = rows;
  const parentFm = record(parent);
  const firstFm = record(first);
  const secondFm = record(second);
  if (groupKey) {
    firstFm[groupKey] = parentFm[groupKey];
    secondFm[groupKey] = parentFm[groupKey];
  }
  parentFm.subtaskIds = [first.file.path, second.file.path];
  parentFm.collapsed = false;
  parentFm.progress = 62;
  firstFm.parentId = parent.file.path;
  secondFm.parentId = parent.file.path;
}

function allHiddenGroupsFor(rows: RowData[], key: string): Record<string, true> {
  const hidden: Record<string, true> = {};
  for (const row of rows) {
    const value = (row as unknown as { frontmatter: Record<string, unknown> }).frontmatter[key];
    if (typeof value === "string") hidden[value] = true;
  }
  return hidden;
}

/**
 * The table branch's captureData path routes cells through this instead of the bench's stub
 * writer — the same `CellRenderer` class `database-view.ts` and `embedded-database-renderer.ts`
 * wire into their own `renderCell` action, constructed with no live `DataSource` or `App`. Neither
 * is read by the typed display branches this exists to exercise (status/select, checkbox,
 * currency, date, relation): `this.dataSource` is only touched by rename/rollup-config/edit-commit
 * paths, none of which a static capture ever triggers, and `this.app` is optional everywhere it's
 * read (the relation renderer's own header comment documents the same "no app, resolve nothing"
 * tolerance every other renderer in this harness already depends on). `isReadOnly` is left at its
 * default `false`, matching `database-view.ts`'s own file-view wiring, which is also why the
 * default `openNote` (calling through `dataSource`) is left alone rather than stubbed — the same
 * choice `embedded-database-renderer.ts` makes for its own embed wiring, and a static capture
 * never fires the click that would reach it.
 */
function makeCaptureCellRenderer(): CellRenderer {
  return new CellRenderer(undefined as unknown as DataSource, async () => undefined);
}

// ───────────────────────────────────────────────────────────────────
// 3. HOST ACTION BAGS
// ───────────────────────────────────────────────────────────────────

// The file view wires twenty-six members; the embed wires nineteen, nine of
// them absent from the file view's bag being the point. The embed omits
// openRecordDetail entirely, so an embedded row cannot open the record panel
// — whether that is intended belongs to the embed's owner; this check asserts
// that the difference exists and that the renderer acts on it.

function fileViewTableBag(columns: ColumnDef[], captureData?: boolean): TableRendererActions {
  // Only built when a scenario actually reads it — the 2000-row structural path never pays for a
  // CellRenderer it never calls.
  const cellRenderer = captureData ? makeCaptureCellRenderer() : undefined;
  return {
    getVisibleColumns: () => columns,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    setupColumnHeader: (th, col) => { th.setText(col.label); },
    setupRow: () => undefined,
    renderCell: cellRenderer
      ? (td, row, col) => cellRenderer.renderCell(td, row, col)
      : (td, row, col) => { td.setText(String(row.frontmatter[col.key] ?? "")); },
    captureInteractionSnapshot: () => undefined,
    restoreInteractionSnapshot: () => undefined,
    renderRecordIcon: () => null,
    renderGroupSummaries: () => undefined,
    applyConditionalFormat: () => undefined,
    setupFillHandle: () => undefined,
    moveRowToPosition: () => undefined,
    moveRowsToGroup: () => undefined,
    moveRowToGroupAndPosition: () => undefined,
    createEntry: () => undefined,
    addColumn: () => undefined,
    showRowMenu: () => undefined,
    changeColumnCalculation: () => undefined,
    isGroupCollapsed: () => false,
    toggleGroupCollapsed: () => undefined,
    expandGroup: () => undefined,
    get hideCreateEntry() { return false; },
  };
}

function embedTableBag(columns: ColumnDef[], captureData?: boolean): TableRendererActions {
  const cellRenderer = captureData ? makeCaptureCellRenderer() : undefined;
  return {
    getVisibleColumns: () => columns,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    setupColumnHeader: (th, col) => { th.setText(col.label); },
    setupRow: () => undefined,
    renderCell: cellRenderer
      ? (td, row, col) => cellRenderer.renderCell(td, row, col)
      : (td, row, col) => { td.setText(String(row.frontmatter[col.key] ?? "")); },
    renderRecordIcon: () => null,
    renderGroupSummaries: () => undefined,
    applyConditionalFormat: () => undefined,
    moveRowToPosition: () => undefined,
    createEntry: () => undefined,
    addColumn: () => undefined,
    showRowMenu: () => undefined,
    changeColumnCalculation: () => undefined,
    isGroupCollapsed: () => false,
    toggleGroupCollapsed: () => undefined,
    expandGroup: () => undefined,
    isReadOnly: false,
    get hideCreateEntry() { return false; },
  };
}

// The calendar and timeline bags, transcribed from the same two construction sites.
//
// The embed sets isReadOnly where the file view leaves it unset, and that difference used to be
// invisible on the timeline in the way that matters here: the per-event touch probe was evaluated
// before the read-only guard, so a read-only embed paid a forced layout per event for a button it
// then declined to render. Both bags are exercised so a guard that moves back in front of the
// probe fails on the embed rather than only on the file view.

function fileViewBoardBag(columns: ColumnDef[]): BoardRendererActions {
  return {
    openRow: () => undefined,
    openRecordDetail: () => undefined,
    createEntry: () => undefined,
    createGroup: async () => true,
    updateGroup: async () => undefined,
    updateGroupOrder: () => undefined,
    updateCardOrder: () => undefined,
    moveRowToPosition: () => undefined,
    moveRowWithGroupUpdatesAndPosition: () => undefined,
    moveRowsToPosition: () => undefined,
    getSelectedRows: () => [],
    updateColumnWidth: () => undefined,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    editCell: () => undefined,
    saveCellValue: () => undefined,
    editFileName: () => undefined,
    getColumns: () => columns,
    isGroupCollapsed: () => false,
    toggleGroupCollapsed: () => undefined,
    expandGroup: () => undefined,
    showRowMenu: () => undefined,
    showColumnMenu: () => undefined,
    editFormula: () => undefined,
    renderRecordIcon: () => null,
    renderGroupSummaries: () => undefined,
    applyConditionalFormat: () => undefined,
    get hideCreateEntry() { return false; },
  };
}

function embedBoardBag(columns: ColumnDef[]): BoardRendererActions {
  return {
    openRow: () => undefined,
    createEntry: () => undefined,
    updateGroup: async () => undefined,
    updateGroupOrder: () => undefined,
    updateCardOrder: () => undefined,
    moveRowToPosition: () => undefined,
    updateColumnWidth: () => undefined,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    editCell: () => undefined,
    getColumns: () => columns,
    isGroupCollapsed: () => false,
    toggleGroupCollapsed: () => undefined,
    expandGroup: () => undefined,
    showRowMenu: () => undefined,
    showColumnMenu: () => undefined,
    renderRecordIcon: () => null,
    renderGroupSummaries: () => undefined,
    applyConditionalFormat: () => undefined,
    isReadOnly: true,
    get canReorderGroups() { return false; },
    get hideCreateEntry() { return false; },
  };
}

function fileViewGalleryBag(columns: ColumnDef[]): GalleryRendererActions {
  return {
    openRow: () => undefined,
    openRecordDetail: () => undefined,
    createEntry: () => undefined,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    editCell: () => undefined,
    saveCellValue: () => undefined,
    editFileName: () => undefined,
    getColumns: () => columns,
    updateCardSize: () => undefined,
    moveRowToPosition: () => undefined,
    moveRowsToGroup: () => undefined,
    moveRowToGroupAndPosition: () => undefined,
    moveRowsToPosition: () => undefined,
    getSelectedRows: () => [],
    isGroupCollapsed: () => false,
    toggleGroupCollapsed: () => undefined,
    expandGroup: () => undefined,
    showRowMenu: () => undefined,
    showColumnMenu: () => undefined,
    editFormula: () => undefined,
    renderRecordIcon: () => null,
    renderGroupSummaries: () => undefined,
    applyConditionalFormat: () => undefined,
    get hideCreateEntry() { return false; },
  };
}

function embedGalleryBag(columns: ColumnDef[]): GalleryRendererActions {
  return {
    openRow: () => undefined,
    createEntry: () => undefined,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    editCell: () => undefined,
    getColumns: () => columns,
    updateCardSize: () => undefined,
    moveRowToPosition: () => undefined,
    isGroupCollapsed: () => false,
    toggleGroupCollapsed: () => undefined,
    expandGroup: () => undefined,
    showRowMenu: () => undefined,
    showColumnMenu: () => undefined,
    renderRecordIcon: () => null,
    renderGroupSummaries: () => undefined,
    applyConditionalFormat: () => undefined,
    isReadOnly: true,
    get hideCreateEntry() { return false; },
  };
}

function fileViewCalendarBag(columns: ColumnDef[]): CalendarRendererActions {
  return {
    openRow: () => undefined,
    openRecordDetail: () => undefined,
    showRowMenu: () => undefined,
    createEntryForDate: () => undefined,
    updateEventDates: () => undefined,
    updateCalendarScale: () => undefined,
    onConfigChange: () => undefined,
    getColumns: () => columns,
    getCalendarInvalidEventCount: () => 0,
    openCalendarInvalidEvents: () => undefined,
    openDateConfig: () => undefined,
    renderRecordIcon: () => null,
    applyConditionalFormat: () => undefined,
  };
}

function embedCalendarBag(columns: ColumnDef[]): CalendarRendererActions {
  return {
    openRow: () => undefined,
    openRecordDetail: () => undefined,
    isReadOnly: true,
    onConfigChange: () => undefined,
    getColumns: () => columns,
    getCalendarInvalidEventCount: () => 0,
    openCalendarInvalidEvents: () => undefined,
    openDateConfig: () => undefined,
    renderRecordIcon: () => null,
    applyConditionalFormat: () => undefined,
  };
}

function fileViewTimelineBag(): CalendarTimelineRendererActions {
  return {
    openRow: () => undefined,
    openRecordDetail: () => undefined,
    showRowMenu: () => undefined,
    createEntryForDate: () => undefined,
    updateEventDates: () => undefined,
    reorderTimelineEvent: () => undefined,
    moveTimelineEventToGroup: () => undefined,
    isGroupCollapsed: () => false,
    toggleGroupCollapsed: () => undefined,
    expandGroup: () => undefined,
    getTimelineInvalidEventCount: () => 0,
    openTimelineInvalidEvents: () => undefined,
    updateTimelineAnchor: () => undefined,
    updateTimelineScale: () => undefined,
    onConfigChange: () => undefined,
    openDateConfig: () => undefined,
    renderRecordIcon: () => null,
    renderGroupSummaries: () => undefined,
    applyConditionalFormat: () => undefined,
  };
}

function embedTimelineBag(): CalendarTimelineRendererActions {
  return {
    openRow: () => undefined,
    openRecordDetail: () => undefined,
    isReadOnly: true,
    isGroupCollapsed: () => false,
    toggleGroupCollapsed: () => undefined,
    expandGroup: () => undefined,
    updateTimelineAnchor: () => undefined,
    updateTimelineScale: () => undefined,
    onConfigChange: () => undefined,
    openDateConfig: () => undefined,
    getTimelineInvalidEventCount: () => 0,
    openTimelineInvalidEvents: () => undefined,
    renderRecordIcon: () => null,
    renderGroupSummaries: () => undefined,
    applyConditionalFormat: () => undefined,
  };
}

// The chart's bag is the actions object the render call takes, and the two hosts pass the same
// two members — unlike the other views, the embed does not trim it, because neither host calls
// any chart action during render. The census pins that sameness every run.
function chartBag(): ChartRendererActions {
  return {
    onFilter: () => undefined,
    onConfigChange: () => undefined,
  };
}

// ───────────────────────────────────────────────────────────────────
// 4. PROVENANCE
// ───────────────────────────────────────────────────────────────────

// The assertion suite refuses DOM that did not come from a bundled src/views
// module. Hand-written fixture markup resembles renderer output closely enough
// to satisfy any DOM-shaped check — the capture harness is built on exactly
// that resemblance — so the render entry tags the container the real render
// call built into, and every assertion below requires the tag first. A harness
// that substitutes a fixture never runs the wrapped render, never tags, and is
// told so in the failure message.

const PROVENANCE_ATTR = "data-production-render";

function tagTableRenders(): void {
  const original = TableRenderer.prototype.renderTable;
  TableRenderer.prototype.renderTable = function taggedRenderTable(
    container: HTMLElement,
    config: ViewConfig,
    rows: RowData[],
    emptyState?: unknown,
  ): void {
    original.call(this, container, config, rows, emptyState);
    container.setAttribute(PROVENANCE_ATTR, "table-renderer");
  };
}

function tagBoardRenders(): void {
  const original = BoardRenderer.prototype.render;
  BoardRenderer.prototype.render = function taggedRender(
    container: HTMLElement,
    config: ViewConfig,
    groups: Parameters<BoardRenderer["render"]>[2],
    groupField: string,
    emptyState?: Parameters<BoardRenderer["render"]>[4],
  ): void {
    original.call(this, container, config, groups, groupField, emptyState);
    container.setAttribute(PROVENANCE_ATTR, "board-renderer");
  };
}

function tagGalleryRenders(): void {
  const original = GalleryRenderer.prototype.render;
  GalleryRenderer.prototype.render = function taggedRender(
    container: HTMLElement,
    config: ViewConfig,
    rows: RowData[],
    emptyState?: Parameters<GalleryRenderer["render"]>[3],
  ): void {
    original.call(this, container, config, rows, emptyState);
    container.setAttribute(PROVENANCE_ATTR, "gallery-renderer");
  };
}

function tagCalendarRenders(): void {
  const original = CalendarRenderer.prototype.render;
  CalendarRenderer.prototype.render = function taggedRender(
    container: HTMLElement,
    config: ViewConfig,
    rows: RowData[],
  ): void {
    original.call(this, container, config, rows);
    container.setAttribute(PROVENANCE_ATTR, "calendar-renderer");
  };
}

function tagTimelineRenders(): void {
  const original = CalendarTimelineRenderer.prototype.renderTimeline;
  CalendarTimelineRenderer.prototype.renderTimeline = function taggedRenderTimeline(
    container: HTMLElement,
    config: ViewConfig,
    rows: RowData[],
  ): void {
    original.call(this, container, config, rows);
    container.setAttribute(PROVENANCE_ATTR, "timeline-renderer");
  };
}

function tagChartRenders(): void {
  const original = ChartRenderer.prototype.render;
  ChartRenderer.prototype.render = function taggedRender(
    container: HTMLElement,
    config: ViewConfig,
    rows: RowData[],
    columns: ColumnDef[],
    actions?: ChartRendererActions,
  ): void {
    original.call(this, container, config, rows, columns, actions);
    container.setAttribute(PROVENANCE_ATTR, "chart-renderer");
  };
}

// The three toolbar renderers build their popover into the CALLER-supplied `containerEl`, not into
// a container the class itself creates, so the marker belongs on `containerEl` rather than on the
// popover panel — reachable through `togglePopover`, the same public entry the real toolbar calls
// on open, so a tagged run proves the real open path fired rather than a hand-built panel.
function tagChartToolbarRenders(): void {
  const original = ChartToolbarRenderer.prototype.togglePopover;
  ChartToolbarRenderer.prototype.togglePopover = function taggedTogglePopover(
    containerEl: HTMLElement,
    anchor: HTMLElement,
    config: ViewConfig | undefined,
    actions: ChartToolbarActions,
  ): void {
    original.call(this, containerEl, anchor, config, actions);
    containerEl.setAttribute(PROVENANCE_ATTR, "chart-toolbar-renderer");
  };
}

function tagCalendarToolbarRenders(): void {
  const original = CalendarToolbarRenderer.prototype.togglePopover;
  CalendarToolbarRenderer.prototype.togglePopover = function taggedTogglePopover(
    containerEl: HTMLElement,
    anchor: HTMLElement,
    config: ViewConfig | undefined,
    actions: CalendarToolbarActions,
  ): void {
    original.call(this, containerEl, anchor, config, actions);
    containerEl.setAttribute(PROVENANCE_ATTR, "calendar-toolbar-renderer");
  };
}

function tagTimelineToolbarRenders(): void {
  const original = CalendarTimelineToolbarRenderer.prototype.togglePopover;
  CalendarTimelineToolbarRenderer.prototype.togglePopover = function taggedTogglePopover(
    containerEl: HTMLElement,
    anchor: HTMLElement,
    config: ViewConfig | undefined,
    actions: CalendarTimelineToolbarActions,
  ): void {
    original.call(this, containerEl, anchor, config, actions);
    containerEl.setAttribute(PROVENANCE_ATTR, "timeline-toolbar-renderer");
  };
}

function tagToolbarRenders(): void {
  const original = ToolbarRenderer.prototype.render;
  ToolbarRenderer.prototype.render = function taggedToolbarRender(
    containerEl: HTMLElement,
    viewEntries: ToolbarViewEntry[],
    currentDbIndex: number,
    currentViewIndex: number,
    state: DatabaseViewState,
    actions: ToolbarActions,
  ): void {
    original.call(this, containerEl, viewEntries, currentDbIndex, currentViewIndex, state, actions);
    containerEl.setAttribute(PROVENANCE_ATTR, "toolbar-renderer");
  };
}

function tagActiveViewControlsRenders(): void {
  const original = ActiveViewControlsRenderer.prototype.render;
  ActiveViewControlsRenderer.prototype.render = function taggedRender(
    containerEl: HTMLElement,
    config: ViewConfig,
    state: DatabaseViewState,
    actions: ActiveViewControlsActions,
  ): void {
    original.call(this, containerEl, config, state, actions);
    containerEl.setAttribute(PROVENANCE_ATTR, "active-view-controls-renderer");
  };
}

function tagActiveRulePopoverRenders(): void {
  const patch = (key: "toggleFilter" | "toggleSort"): void => {
    const original = ActiveRulePopoverRenderer.prototype[key];
    ActiveRulePopoverRenderer.prototype[key] = function taggedToggle(
      this: ActiveRulePopoverRenderer,
      options: { containerEl: HTMLElement },
    ): void {
      (original as (options: { containerEl: HTMLElement }) => void).call(this, options);
      options.containerEl.setAttribute(PROVENANCE_ATTR, "active-rule-popover-renderer");
    };
  };
  patch("toggleFilter");
  patch("toggleSort");
}

function tagFilterPanelRenders(): void {
  const original = FilterPanelRenderer.prototype.render;
  FilterPanelRenderer.prototype.render = function taggedRender(
    containerEl: HTMLElement,
    visible: boolean,
    state: DatabaseViewState,
    config: ViewConfig,
    actions: FilterPanelActions,
    anchorEl?: HTMLElement,
  ): void {
    original.call(this, containerEl, visible, state, config, actions, anchorEl);
    containerEl.setAttribute(PROVENANCE_ATTR, "filter-panel-renderer");
  };
}

function tagSortPanelRenders(): void {
  const original = SortPanelRenderer.prototype.render;
  SortPanelRenderer.prototype.render = function taggedRender(
    containerEl: HTMLElement,
    visible: boolean,
    config: ViewConfig,
    state: DatabaseViewState,
    actions: SortPanelActions,
    anchorEl?: HTMLElement,
  ): void {
    original.call(this, containerEl, visible, config, state, actions, anchorEl);
    containerEl.setAttribute(PROVENANCE_ATTR, "sort-panel-renderer");
  };
}

function tagViewConfigRenders(): void {
  const original = ViewConfigPanelRenderer.prototype.render;
  ViewConfigPanelRenderer.prototype.render = function taggedRender(
    containerEl: HTMLElement,
    visible: boolean,
    config: ViewConfig | undefined,
    actions: ViewConfigPanelActions,
    anchorEl?: HTMLElement,
  ): void {
    original.call(this, containerEl, visible, config, actions, anchorEl);
    containerEl.setAttribute(PROVENANCE_ATTR, "view-config-panel-renderer");
  };
}

function tagColumnManagerRenders(): void {
  const original = ColumnManagerRenderer.prototype.render;
  ColumnManagerRenderer.prototype.render = function taggedRender(
    containerEl: HTMLElement,
    visible: boolean,
    config: ViewConfig,
    state: DatabaseViewState,
    columns: ColumnDef[],
    actions: ColumnManagerActions,
    anchorEl?: HTMLElement,
  ): void {
    original.call(this, containerEl, visible, config, state, columns, actions, anchorEl);
    containerEl.setAttribute(PROVENANCE_ATTR, "column-manager-renderer");
  };
}

function tagTableGroupedRenders(): void {
  const original = TableRenderer.prototype.renderGroupedTable;
  TableRenderer.prototype.renderGroupedTable = function taggedRenderGroupedTable(
    containerEl: HTMLElement,
    config: ViewConfig,
    rows: RowData[],
    groups: TableGroup[],
    groupField?: string,
    emptyState?: unknown,
  ): void {
    original.call(this, containerEl, config, rows, groups, groupField, emptyState);
    containerEl.setAttribute(PROVENANCE_ATTR, "table-renderer");
  };
}

function tagSummaryRenders(): void {
  const original = SummaryRenderer.prototype.render;
  SummaryRenderer.prototype.render = function taggedRender(
    containerEl: HTMLElement,
    rows: RowData[],
    config?: ViewConfig,
    database?: unknown,
    options?: unknown,
  ): void {
    original.call(this, containerEl, rows, config, database, options);
    containerEl.setAttribute(PROVENANCE_ATTR, "summary-renderer");
  };
}

function tagEmptyStateRenders(): void {
  const patch = (key: "renderCard" | "renderHero"): void => {
    const original = EmptyStateRenderer.prototype[key];
    EmptyStateRenderer.prototype[key] = function taggedRender(
      this: EmptyStateRenderer,
      container: HTMLElement,
    ): HTMLElement {
      const built = (original as (container: HTMLElement, options: never) => HTMLElement)
        .call(this, container, arguments[1]);
      container.setAttribute(PROVENANCE_ATTR, "empty-state-renderer");
      return built;
    };
  };
  patch("renderCard");
  patch("renderHero");
}

function tagColumnHeaderSetups(): void {
  const original = ColumnHeaderController.prototype.setup;
  ColumnHeaderController.prototype.setup = function taggedSetup(th: HTMLElement, col: ColumnDef): void {
    original.call(this, th, col);
    th.closest(".note-database-container")?.setAttribute(PROVENANCE_ATTR, "column-header-controller");
  };
}

function tagCellStartEdits(): void {
  const original = CellRenderer.prototype.startEdit;
  CellRenderer.prototype.startEdit = function taggedStartEdit(
    target: HTMLElement,
    row: RowData,
    col: ColumnDef,
    ...rest: unknown[]
  ): void {
    original.call(this, target, row, col, ...rest);
    target.closest(".note-database-container")?.setAttribute(PROVENANCE_ATTR, "cell-renderer");
  };
}

function tagGalleryGroupedRenders(): void {
  const original = GalleryRenderer.prototype.renderGrouped;
  GalleryRenderer.prototype.renderGrouped = function taggedRenderGrouped(
    container: HTMLElement,
    config: ViewConfig,
    groups: GalleryGroup[],
    groupField: string,
    emptyState?: unknown,
  ): void {
    original.call(this, container, config, groups, groupField, emptyState);
    container.setAttribute(PROVENANCE_ATTR, "gallery-renderer");
  };
}

// Armed once at module load, in the browser only: the harness is bundled into
// the render entry and never runs outside it.
tagTableRenders();
tagBoardRenders();
tagGalleryRenders();
tagCalendarRenders();
tagTimelineRenders();
tagChartRenders();
tagChartToolbarRenders();
tagCalendarToolbarRenders();
tagTimelineToolbarRenders();
tagToolbarRenders();
tagActiveViewControlsRenders();
tagActiveRulePopoverRenders();
tagFilterPanelRenders();
tagSortPanelRenders();
tagViewConfigRenders();
tagColumnManagerRenders();
tagTableGroupedRenders();
tagSummaryRenders();
tagEmptyStateRenders();
tagColumnHeaderSetups();
tagCellStartEdits();
tagGalleryGroupedRenders();

function provenanceResult(container: HTMLElement, expected: string): AssertionResult {
  const marker = container.getAttribute(PROVENANCE_ATTR);
  const pass = marker === expected;
  return {
    name: "output was produced by the bundled renderer, not fixture markup",
    pass,
    detail: pass
      ? `container carries the ${expected} production-render marker`
      : `refusing DOM without a bundled-renderer marker (got "${marker ?? "none"}"): `
        + "hand-written markup resembles renderer output and proves nothing about it",
  };
}

// ───────────────────────────────────────────────────────────────────
// 5. INSTRUMENTATION
// ───────────────────────────────────────────────────────────────────

const win = globalThis.window;

// Counting reads of geometry during a render is how the shipped freeze is
// seen without timing: the defect was a per-row read that forced a growing
// layout, so its shape is "reads scale with rows", which a constant bound
// distinguishes at any row count.
function countLayoutReads(): () => number {
  const stop = countLayoutReadsSplit();
  return () => stop().total;
}

/**
 * The same instrumentation, keeping the two populations apart.
 *
 * A geometry read on a DETACHED node forces no layout of the document — it returns zeros off a
 * node the engine has never laid out. So "reads scale with rows" and "layout is forced per row"
 * are different claims, and the table is the surface where they come apart: it builds its body
 * off-document and reads per row, which is a growing count of reads that flush nothing.
 *
 * A bound over the total would fail that correct implementation, which is why `028` recorded the
 * check it specified as unusable rather than writing one that lied. The bound that survives is
 * over the CONNECTED reads: those are the ones that cost a layout, and their count is what
 * regresses the moment the body is attached before the loop rather than after it.
 */
function countLayoutReadsSplit(): () => { total: number; connected: number } {
  let count = 0;
  let connected = 0;
  const win = window;
  const elementProto = win.Element.prototype;
  const htmlProto = win.HTMLElement.prototype;
  const restored: Array<() => void> = [];

  for (const name of ["offsetHeight", "offsetWidth", "clientWidth", "clientHeight"] as const) {
    const descriptor = Object.getOwnPropertyDescriptor(htmlProto, name);
    if (!descriptor?.get) continue;
    const original = descriptor.get;
    Object.defineProperty(htmlProto, name, {
      ...descriptor,
      get(this: HTMLElement) {
        count += 1;
        if (this.isConnected) connected += 1;
        return original.call(this);
      },
    });
    restored.push(() => Object.defineProperty(htmlProto, name, descriptor));
  }
  for (const name of ["getBoundingClientRect", "getClientRects"] as const) {
    const original = elementProto[name];
    if (typeof original !== "function") continue;
    elementProto[name] = function counted(this: Element, ...args: unknown[]) {
      count += 1;
      if (this.isConnected) connected += 1;
      return (original as (...rest: unknown[]) => unknown).apply(this, args);
    };
    restored.push(() => {
      elementProto[name] = original;
    });
  }
  const originalStyle = win.getComputedStyle.bind(win);
  win.getComputedStyle = ((el: Element, pseudo?: string | null) => {
    count += 1;
    if (el.isConnected) connected += 1;
    return originalStyle(el, pseudo);
  }) as typeof win.getComputedStyle;
  restored.push(() => {
    win.getComputedStyle = originalStyle;
  });

  return () => {
    for (const restore of restored) restore();
    return { total: count, connected };
  };
}

// The table's quadratic was a row appended to an attached table paying layout
// per insertion. The shipped fix builds the body off-document and attaches it
// once; this counts data rows appended to a tbody that is already connected,
// which only happens when that property regresses. Header and footer rows are
// O(1) appends to thead/tfoot and are not the defect, so they are not counted.
function countRowAppendsToConnectedNodes(): () => number {
  let count = 0;
  const original = Node.prototype.appendChild;
  Node.prototype.appendChild = function appended(this: Node, child: Node): Node {
    if (
      child instanceof win.Element
      && child.tagName === "TR"
      && this instanceof win.HTMLTableSectionElement
      && this.tagName === "TBODY"
      && this.isConnected
    ) {
      count += 1;
    }
    return original.call(this, child);
  };
  return () => {
    Node.prototype.appendChild = original;
    return count;
  };
}

// ───────────────────────────────────────────────────────────────────
// 6. ASSERTION SUITE
// ───────────────────────────────────────────────────────────────────

function tableAssertions(
  container: HTMLElement,
  rows: RowData[],
  columns: ColumnDef[],
): AssertionResult[] {
  const results: AssertionResult[] = [];
  const rowEls = Array.from(container.querySelectorAll<HTMLElement>("tr[data-note-database-row-path]"));
  const cellsPerRow = rowEls.map((row) => row.querySelectorAll<HTMLElement>("td[data-note-database-column-key]").length);
  const cellIndexes = rowEls.map((row) => {
    const cell = row.querySelector<HTMLTableCellElement>('[data-note-database-column-key="field1"]');
    return cell ? cell.cellIndex : -1;
  });

  results.push({
    name: "rows rendered",
    pass: rowEls.length === rows.length,
    detail: `${rowEls.length} data rows for ${rows.length} rows`,
  });
  results.push({
    name: "every row renders every visible column cell",
    pass: cellsPerRow.every((count) => count === columns.length),
    detail: cellsPerRow.length
      ? `cell counts per row ${Math.min(...cellsPerRow)}..${Math.max(...cellsPerRow)}, want ${columns.length}`
      : "no rows to count",
  });
  results.push({
    name: "column \"field1\" holds the same cell index on every row",
    pass: cellIndexes.length > 0 && cellIndexes.every((index) => index === cellIndexes[0] && index >= 0),
    detail: `cellIndex ${Math.min(...cellIndexes)}..${Math.max(...cellIndexes)} across ${rowEls.length} rows`,
  });
  results.push({
    name: "selection checkbox affordance is one per row",
    pass: container.querySelectorAll("td.db-select-col").length === rows.length,
    detail: `${container.querySelectorAll("td.db-select-col").length} selection cells for ${rows.length} rows`,
  });
  return results;
}

// Both date-driven views draw a window rather than the whole row set, so "rows rendered" is the
// wrong question for them and a count of zero is the failure that matters. A window that drew
// nothing satisfies every per-item bound trivially — no items, no per-item work — which would
// make a silent fixture break read as a clean pass. Each suite therefore establishes that the
// view drew something before any bound below it is worth reading.

// The card views render one card per row with no window, so unlike the two date-driven views
// their drawn count is the row count and a shortfall is a real failure rather than a fixture slip.

function boardAssertions(container: HTMLElement, rows: RowData[]): AssertionResult[] {
  const results: AssertionResult[] = [];
  // The default board (boardExtensionsEnabled unset) renders the reference's
  // pm-kanban-* vocabulary, not the local extension classes; probe that
  // vocabulary rather than opting the scenario into the extensions.
  const cards = container.querySelectorAll<HTMLElement>(".pm-kanban-card").length;
  const columns = container.querySelectorAll<HTMLElement>(".pm-kanban-col").length;

  results.push({
    name: "every row becomes a card",
    pass: cards === rows.length,
    detail: `${cards} cards for ${rows.length} rows`,
  });
  results.push({
    name: "the board drew its columns",
    pass: columns === BOARD_GROUPS,
    detail: `${columns} columns, want ${BOARD_GROUPS}`,
  });
  return results;
}

function galleryAssertions(container: HTMLElement, rows: RowData[]): AssertionResult[] {
  const results: AssertionResult[] = [];
  const cards = container.querySelectorAll<HTMLElement>(".db-gallery-card").length;

  results.push({
    name: "every row becomes a card",
    pass: cards === rows.length,
    detail: `${cards} cards for ${rows.length} rows`,
  });
  return results;
}

function calendarAssertions(container: HTMLElement): AssertionResult[] {
  const results: AssertionResult[] = [];
  const dayCells = container.querySelectorAll<HTMLElement>(".db-calendar-day").length;
  const segments = container.querySelectorAll<HTMLElement>(
    ".db-calendar-month-segment, .db-calendar-week-allday-segment, .db-calendar-timed-event",
  ).length;

  results.push({
    name: "the month grid drew its day cells",
    pass: dayCells > 0,
    detail: `${dayCells} day cells`,
  });
  results.push({
    name: "the drawn month is not empty",
    pass: segments > 0,
    detail: segments > 0
      ? `${segments} event segments drawn from ${CALENDAR_ROWS} rows`
      : "no event segment was drawn: every bound below this passes trivially on an empty grid, "
        + "so this run proves nothing about the calendar",
  });

  // A multi-day bar is positioned against its week row, and the arithmetic that places it is not the
  // arithmetic that draws the grid. Reading a phone capture, the last row's bar looked as though it
  // started outside the grid's left edge while a bar two rows above started inside it — two
  // different offsets on one surface, which a picture can suggest and only a measurement can settle.
  //
  // Stated as containment rather than as an offset, because the offset is allowed to differ between
  // a bar that starts mid-week and one that starts on Sunday; what is never allowed is ink outside
  // the row that owns it.
  const rows = Array.from(container.querySelectorAll<HTMLElement>(".db-calendar-month-week"));
  const escaped: string[] = [];
  let bars = 0;
  for (const row of rows) {
    const rowBox = row.getBoundingClientRect();
    if (rowBox.width === 0) continue;
    for (const bar of Array.from(row.querySelectorAll<HTMLElement>(".db-calendar-month-segment"))) {
      const box = bar.getBoundingClientRect();
      if (box.width === 0) continue;
      bars += 1;
      const overLeft = Math.round(rowBox.left - box.left);
      const overRight = Math.round(box.right - rowBox.right);
      if (overLeft > 1 || overRight > 1) {
        escaped.push(`"${(bar.textContent || "").trim().slice(0, 18)}" `
          + `${overLeft > 1 ? `${overLeft}px past the left` : `${overRight}px past the right`}`);
      }
    }
  }
  results.push({
    name: "no month segment paints outside the week row that owns it",
    pass: bars > 0 && escaped.length === 0,
    detail: bars === 0
      ? `${rows.length} week row(s) and no measurable segment inside any of them, so this asserts `
        + "nothing — the containment it checks is vacuous on a row with no bar"
      : `${bars} segment(s) across ${rows.length} week row(s); ${escaped.length} outside their row`
        + (escaped.length ? `: ${escaped.join("; ")}` : ""),
  });
  return results;
}

// The week and day scales draw a window of their own width — seven day columns, or one — and
// the same empty-window rule applies: a scale that drew nothing satisfies every per-item bound
// trivially, so each suite establishes a non-zero drawn count before the layout bound is read.
function weekAssertions(container: HTMLElement, scale: "week" | "day"): AssertionResult[] {
  const results: AssertionResult[] = [];
  const dayCols = container.querySelectorAll<HTMLElement>(".db-calendar-week-day-col").length;
  const segments = container.querySelectorAll<HTMLElement>(
    ".db-calendar-week-allday-segment, .db-calendar-week-timed-event",
  ).length;

  results.push({
    name: `the ${scale} view drew its day column${scale === "week" ? "s" : ""}`,
    pass: scale === "week" ? dayCols === 7 : dayCols === 1,
    detail: `${dayCols} day column(s), want ${scale === "week" ? 7 : 1}`,
  });
  results.push({
    name: `the drawn ${scale} is not empty`,
    pass: segments > 0,
    detail: segments > 0
      ? `${segments} event segments drawn from ${CALENDAR_ROWS} rows`
      : "no event segment was drawn: every bound below this passes trivially on an empty window, "
        + "so this run proves nothing about the calendar",
  });
  return results;
}

function chartAssertions(container: HTMLElement, config: ViewConfig): AssertionResult[] {
  const results: AssertionResult[] = [];
  const roots = container.querySelectorAll<HTMLElement>(".db-chart").length;
  const empties = container.querySelectorAll<HTMLElement>(".db-chart-empty, .db-chart-number").length;
  const canvases = container.querySelectorAll<HTMLElement>(".db-chart-canvas").length;
  const titles = Array.from(container.querySelectorAll<HTMLElement>(".db-chart-title"))
    .filter((el) => (el.textContent || "").trim().length > 0).length;

  results.push({
    name: "the chart drew its root exactly once",
    pass: roots === 1 && empties === 0,
    detail: `${roots} .db-chart root(s) and ${empties} empty/number state(s), want 1 and 0`,
  });
  results.push({
    name: "the chart drew its canvas",
    pass: canvases === 1,
    detail: `${canvases} .db-chart-canvas element(s), want 1`,
  });
  results.push({
    name: "the chart drew a non-empty title",
    pass: titles === 1,
    detail: `${titles} non-empty .db-chart-title element(s), want 1`,
  });
  // Vacuously true when no value field is configured (a plain "count" chart needs none) — the
  // point is to catch a value field that names a column that does not exist or is not numeric,
  // which "the chart drew its root" above would not catch on its own: an aggregation that silently
  // treats a bad field as always-zero still draws a root, a canvas and a title.
  const valueColumn = config.chartValueField
    ? config.schema.columns.find((col) => col.key === config.chartValueField)
    : undefined;
  results.push({
    name: "a configured value field resolves to a numeric column",
    pass: !config.chartValueField || (valueColumn?.type === "number" || valueColumn?.type === "currency"),
    detail: config.chartValueField
      ? `chartValueField "${config.chartValueField}" resolves to type ${valueColumn?.type ?? "missing"}`
      : "no chartValueField configured — this scenario's aggregation needs none",
  });
  return results;
}

// The timeline's default render is the one-to-one reference gantt tree (config.timelineLocalExtensions
// unset), which carries subtask affordances under its own vocabulary rather than the local
// db-subtask-* markup: `.pm-collapse-toggle` for the expand/collapse control, `.pm-gantt-label-progress`
// for the percentage chip, and no depth attribute at all — depth is an inline `padding-left` on
// `.pm-gantt-label-row`, matched here as the tallest indent exceeding the shallowest row's own.
// `.pm-gantt-label-progress` alone is not specific to a subtask: the timeline bench's own
// per-row fixture (`timeline-render-bench.ts`, `i % 4 === 0`) gives every fourth row, including
// row 0, a genuine progress value (60%) independent of `subtaskTree`. `applyCaptureSubtaskTree`
// overwrites that same row's progress to 62% (a value the bench fixture never produces on its
// own), so matching that exact text distinguishes the synthetic subtask aggregation from the
// bench's own unrelated progress fixture.
function subtaskTreeAssertion(container: HTMLElement, kind: "board" | "timeline"): AssertionResult {
  const toggle = container.querySelector(kind === "board" ? ".db-subtask-toggle" : ".pm-collapse-toggle");
  const progress = kind === "board"
    ? container.querySelector(".db-subtask-progress")
    : Array.from(container.querySelectorAll(".pm-gantt-label-progress")).find((el) => el.textContent === "62%");
  const depthChild = kind === "board"
    ? container.querySelector('[data-subtask-depth="1"]')
    : (() => {
      // `[data-task-id]` excludes the trailing add-task row (`.pm-gantt-add-row`), which shares
      // the `.pm-gantt-label-row` class but carries no `padding-left` at all — an unset style
      // that would otherwise read as its own, spurious "depth".
      const rows = Array.from(container.querySelectorAll<HTMLElement>(".pm-gantt-label-row[data-task-id]"));
      const indents = rows.map((row) => parseInt(row.style.paddingLeft || "0", 10));
      return indents.length > 1 && Math.max(...indents) > Math.min(...indents);
    })();
  const pass = Boolean(toggle) && Boolean(progress) && Boolean(depthChild);
  return {
    name: `the ${kind} drew its subtask tree`,
    pass,
    detail: pass
      ? "collapse toggle, progress affordance and a depth-1 child all present"
      : `missing: ${[!toggle && "collapse toggle", !progress && "progress affordance", !depthChild && "depth-1 child"]
        .filter(Boolean).join(", ")}`,
  };
}

function calendarEmptyStateAssertion(container: HTMLElement): AssertionResult {
  const card = container.querySelector('[data-empty-reason="no-date-field"]');
  const grid = container.querySelectorAll(".db-calendar").length;
  const pass = Boolean(card) && grid === 0;
  return {
    name: "the calendar drew its no-date-field empty state",
    pass,
    detail: card
      ? `data-empty-reason="no-date-field" present, ${grid} .db-calendar grid(s) (want 0)`
      : "no [data-empty-reason=\"no-date-field\"] element — the empty state never rendered",
  };
}

function chartVariantAssertion(container: HTMLElement, variant: "number" | "empty"): AssertionResult {
  const selector = variant === "number" ? ".db-chart-number" : ".db-chart-empty";
  const present = container.querySelectorAll(selector).length;
  return {
    name: `the chart drew its ${variant} state`,
    pass: present === 1,
    detail: `${present} ${selector} element(s), want 1`,
  };
}

function miniCalendarAssertion(container: HTMLElement): AssertionResult {
  const popover = container.querySelector(".db-calendar-mini-popover");
  const grid = popover?.querySelector(".db-calendar-mini-grid");
  const pass = Boolean(popover) && Boolean(grid);
  return {
    name: "the calendar opened its mini date-picker popover",
    pass,
    detail: pass
      ? ".db-calendar-mini-popover and its grid both present"
      : "the mini-calendar trigger click never opened the popover",
  };
}

function toolbarPopoverAssertion(container: HTMLElement, selector: string): AssertionResult {
  const panel = container.querySelector(selector);
  return {
    name: "the toolbar opened its options popover",
    pass: Boolean(panel),
    detail: panel ? `${selector} present` : `${selector} missing — togglePopover did not build the panel`,
  };
}

// ───────────────────────────────────────────────────────────────────
// 6B. SURFACE BUILDERS
// ───────────────────────────────────────────────────────────────────
//
// The toolbar, panel, popover and field surfaces read the same capture-sized typed dataset the
// view branches build, but each one's public entry takes a different wrapper: the panels and
// popovers take a view state object, the toolbar takes a database entry list, the field editors
// take a row. These helpers build those wrappers from the benches' own columns and rows so the
// branches stay data-shaped rather than each inventing its own.

/** The first non-name column of a type, for the surfaces that need one specific column kind. */
function columnOfType(columns: ColumnDef[], type: ColumnDef["type"]): ColumnDef | undefined {
  return columns.find((col) => col.key !== "file.name" && col.type === type);
}

/** The view state every toolbar/panel surface reads, with the given members overlaid. */
function makeSurfaceState(overrides: Partial<DatabaseViewState> = {}): DatabaseViewState {
  return {
    searchText: "",
    statusFilter: "",
    groupByField: "",
    filters: [],
    hiddenColumns: new Set(),
    filterLogic: "and",
    sortColumn: undefined,
    sortDirection: "asc",
    sortRules: [],
    ...overrides,
  };
}

/** A one-view database over the given schema, the shape ToolbarRenderer.render takes entries of. */
function makeSurfaceDatabase(columns: ColumnDef[], view: ViewConfig): DatabaseConfig {
  return {
    id: "bench",
    name: "Bench",
    sourceFolder: "notes",
    schema: { columns, computedFields: [] } as unknown as RecordSchema,
    computedSyncMode: "manual",
    views: [view],
  } as DatabaseConfig;
}

/**
 * A real, connected anchor for the anchored panels and popovers. The production positioners
 * refuse a detached anchor (`positionToolbarPopover` returns without placing), so the surfaces
 * get a button the way a toolbar gives them one — visually hidden so the capture shows only the
 * panel, at the top-left inside the container where a real toolbar button would sit.
 */
function makeHiddenAnchor(container: HTMLElement, cls: string): HTMLElement {
  // A span, not a button: the anchored surfaces only read this element's box to position
  // themselves, and a harness-only button would be counted as a real under-floor control by the
  // touch-target lane, which measures this same bundle.
  return container.createEl("span", {
    cls,
    attr: {
      "aria-hidden": "true",
      style: "position:absolute;top:16px;left:16px;width:1px;height:1px;opacity:0;pointer-events:none",
    },
  });
}

/** The toolbar's action bag, every required member present and none of them doing work. */
function makeToolbarActions(): ToolbarActions {
  return {
    selectDatabase: () => undefined,
    moveDatabase: () => undefined,
    selectViewInView: () => undefined,
    addView: () => undefined,
    deleteView: () => undefined,
    renameView: () => undefined,
    setViewIcon: () => undefined,
    moveView: () => undefined,
    renameDatabase: () => undefined,
    updateDatabaseDescription: () => undefined,
    editDatabaseIcon: () => undefined,
    editViewIcon: () => undefined,
    showDatabaseIcon: true,
    toggleDatabaseIcon: () => undefined,
    addDatabase: () => undefined,
    deleteDatabase: () => undefined,
    copyCurrentDatabase: () => undefined,
    copyCurrentView: () => undefined,
    copyViewCode: () => undefined,
    openDatabaseFile: () => undefined,
    exportData: () => undefined,
    exportCsvMarkdownZip: () => undefined,
    setViewType: () => undefined,
    setDisplayWidth: () => undefined,
    setSearchText: () => undefined,
    onSearchFocus: () => undefined,
    setGroupByField: () => undefined,
    setGroupOrderMode: () => undefined,
    setShowEmptyGroups: () => undefined,
    setGroupDateMode: () => undefined,
    setGroupRowLimit: () => undefined,
    setBoardSubgroupEnabled: () => undefined,
    setBoardSubgroupField: () => undefined,
    toggleViewConfig: () => undefined,
    configureGroupOrder: () => undefined,
    toggleSortPanel: () => undefined,
    toggleChartOptions: () => undefined,
    toggleCalendarOptions: () => undefined,
    updateViewConfig: () => undefined,
    updateTimelineScale: () => undefined,
    syncComputedFields: () => undefined,
    refreshDatabase: () => undefined,
    toggleFilterPanel: () => undefined,
    toggleColumnManager: () => undefined,
    closeToolbarPopovers: () => undefined,
    openFullView: () => undefined,
    createEntry: () => undefined,
    getCreateEntryPosition: () => undefined,
    getTimelineInvalidEventCount: () => 0,
    openTimelineInvalidEvents: () => undefined,
    createRecordIconField: () => undefined,
    setDefaultTemplate: () => undefined,
    createEntryFromTemplate: () => undefined,
    showDatabaseChrome: true,
  };
}

/** The capture-sized typed dataset the panel branches share: 21 columns, 18 rows. */
function makeSurfaceListData(): { columns: ColumnDef[]; rows: RowData[] } {
  const columns = makeTableColumns(LIST_COLUMNS, "mixed");
  const rows = makeTableRows(CAPTURE_ROWS, columns);
  applyCaptureOptions(columns, rows);
  return { columns, rows };
}

// ───────────────────────────────────────────────────────────────────
// 6C. SURFACE ASSERTIONS
// ───────────────────────────────────────────────────────────────────

function toolbarAssertions(container: HTMLElement, scenario: ScenarioSpec): AssertionResult[] {
  const results: AssertionResult[] = [];
  const tabs = container.querySelectorAll(".db-view-tab").length;
  results.push({
    name: "the toolbar drew its view tabs and clusters",
    pass: Boolean(container.querySelector(".db-toolbar")) && tabs > 0
      && Boolean(container.querySelector(".db-toolbar-right")),
    detail: `${tabs} view tab(s), query/properties/utilities/creation clusters `
      + `${container.querySelectorAll(".db-toolbar-cluster").length} present`,
  });
  if (scenario.toolbarPopover === "utilities") {
    results.push(toolbarPopoverAssertion(container, ".db-toolbar-utilities-popover"));
  }
  if (scenario.toolbarPopover === "add-view") {
    results.push(toolbarPopoverAssertion(container, ".db-add-view-popover"));
  }
  if (scenario.searchText) {
    const active = container.querySelector(".db-search-control.is-active");
    const hasText = container.querySelector<HTMLInputElement>(".db-search-input")?.value === scenario.searchText;
    results.push({
      name: "the search control widened for its text",
      pass: Boolean(active) && hasText,
      detail: active ? `is-active present, input holds "${scenario.searchText}"`
        : "the search wrap stayed collapsed despite the state's search text",
    });
  }
  return results;
}

function chipRailAssertions(container: HTMLElement, scenario: ScenarioSpec): AssertionResult[] {
  const results: AssertionResult[] = [];
  const rail = container.querySelector(".db-active-view-controls");
  const chips = container.querySelectorAll(".db-active-control-chip").length;
  results.push({
    name: "the active-view-controls rail drew its chips",
    pass: Boolean(rail) && chips > 0,
    detail: `${chips} chip(s) in ${container.querySelectorAll(".db-active-control-group").length} group(s)`,
  });
  if (scenario.rules !== "sort") {
    results.push({
      name: "two filters show the AND/OR logic button",
      pass: Boolean(container.querySelector(".db-active-control-logic")),
      detail: container.querySelector(".db-active-control-logic") ? "logic button present"
        : "logic button missing — the filter group renders it only when more than one rule is effective",
    });
  }
  return results;
}

function activeRulePopoverAssertions(container: HTMLElement, kind: "filter" | "sort"): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = container.querySelector(".db-active-rule-popover");
  const fieldDropdown = container.querySelector(kind === "filter"
    ? ".db-filter-field-dropdown" : ".db-sort-field-dropdown");
  const valueDropdown = container.querySelector(kind === "filter"
    ? ".db-filter-value-dropdown" : ".db-sort-direction-dropdown");
  results.push({
    name: `the active-rule popover opened its ${kind} single-rule editor`,
    pass: Boolean(panel) && Boolean(fieldDropdown) && Boolean(valueDropdown),
    detail: [panel && "panel", fieldDropdown && "field dropdown", valueDropdown && "value dropdown"]
      .filter(Boolean).join(", ") || "neither the panel nor its dropdowns mounted",
  });
  results.push({
    name: "the single-rule editor carries no remove button",
    pass: panel !== null && panel.querySelectorAll("button.db-panel-button").length === 0,
    detail: panel ? `${panel.querySelectorAll("button.db-panel-button").length} remove button(s), want 0` : "no panel",
  });
  return results;
}

function filterPanelAssertions(container: HTMLElement, nested: boolean): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = container.querySelector(".db-filter-panel");
  results.push({
    name: "the filter panel drew its tree",
    pass: panel !== null && Boolean(panel.querySelector(".db-source-rule-node")),
    detail: panel ? "panel and at least one rule node present" : "no .db-filter-panel",
  });
  results.push({
    name: nested ? "the nested tree drew its NOT node and inner OR group"
      : "the flat tree draws its leaves without a NOT node",
    pass: nested
      ? Boolean(panel?.querySelector(".db-source-rule-not"))
        && Boolean(panel?.querySelector('.db-source-rule-logic[title*="OR"], .db-source-rule-logic'))
      : !panel?.querySelector(".db-source-rule-not") && panel?.querySelectorAll(".db-panel-row").length === 3,
    detail: nested
      ? `${panel?.querySelectorAll(".db-source-rule-not").length} NOT node(s), `
        + `${panel?.querySelectorAll(".db-source-rule-group").length} group(s)`
      : `${panel?.querySelectorAll(".db-panel-row").length} leaf row(s), `
        + `${panel?.querySelectorAll(".db-source-rule-not").length} NOT node(s)`,
  });
  return results;
}

function sortPanelAssertions(container: HTMLElement, calendarHint: boolean): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = container.querySelector(".db-sort-panel");
  results.push({
    name: "the sort panel drew its rules",
    pass: panel !== null && Boolean(panel.querySelector(".db-sort-rule-row")),
    detail: `${panel?.querySelectorAll(".db-sort-rule-row").length ?? 0} rule row(s)`,
  });
  const firstUp = panel?.querySelector<HTMLButtonElement>(".db-sort-rule-row button[title='Move up']");
  results.push({
    name: "the first rule's move-up control is disabled",
    pass: firstUp ? firstUp.disabled : false,
    detail: firstUp ? `disabled=${firstUp.disabled}` : "no move-up control",
  });
  if (calendarHint) {
    results.push({
      name: "the calendar view drew its layout hint above the empty state",
      pass: Boolean(panel?.querySelector(".db-panel-hint")) && Boolean(panel?.querySelector(".db-panel-empty")),
      detail: panel ? `${panel.querySelectorAll(".db-panel-hint").length} hint(s), `
        + `${panel.querySelectorAll(".db-panel-empty").length} empty state(s)` : "no panel",
    });
  }
  return results;
}

function viewConfigAssertions(container: HTMLElement): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = container.querySelector(".db-view-config-panel");
  results.push({
    name: "the view-config panel drew its database and view sections",
    pass: panel !== null
      && Boolean(panel.querySelector('.db-view-config-section-title[data-scope="database"]'))
      && Boolean(panel.querySelector('.db-view-config-section-title[data-scope="view"]')),
    detail: panel ? `${panel.querySelectorAll(".db-view-config-row").length} config row(s)`
      : "no .db-view-config-panel",
  });
  return results;
}

function boardCardPropertiesPanelAssertions(container: HTMLElement): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = container.querySelector(".db-view-config-panel");
  const rows = Array.from(panel?.querySelectorAll<HTMLElement>(".db-column-manager-row") ?? []);
  // hours, tags, due (the stored list) plus status (the board's own group field, appended
  // because the stored list never names it) — the same four `listBoardCardFields` produces for
  // any config carrying this exact schema and stored list, board-card-fields.test.ts included.
  results.push({
    name: "the board Properties section drew one row per listable field",
    pass: rows.length === 4,
    detail: `${rows.length} row(s), want 4 (hours, tags, due, status)`,
  });
  const checkedFor = (key: string) =>
    panel?.querySelector<HTMLInputElement>(`[data-note-database-column-key="${key}"] input[type='checkbox']`)?.checked;
  results.push({
    name: "the stored list's hidden field renders its checkbox unchecked",
    pass: checkedFor("tags") === false,
    detail: `tags checkbox checked=${checkedFor("tags")}`,
  });
  results.push({
    name: "a stored visible field renders its checkbox checked",
    pass: checkedFor("hours") === true && checkedFor("due") === true,
    detail: `hours checked=${checkedFor("hours")}, due checked=${checkedFor("due")}`,
  });
  return results;
}

function columnManagerAssertions(container: HTMLElement, columns: ColumnDef[]): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = container.querySelector(".db-column-manager");
  const rows = panel?.querySelectorAll(".db-column-manager-row").length ?? 0;
  results.push({
    name: "the column manager drew one row per property",
    pass: Boolean(panel) && rows === columns.length,
    detail: `${rows} row(s) for ${columns.length} column(s)`,
  });
  results.push({
    name: "the column manager drew its add-property row",
    pass: Boolean(panel?.querySelector(".db-column-manager-add-row")),
    detail: panel?.querySelector(".db-column-manager-add-row") ? "add row present" : "add row missing",
  });
  return results;
}

function recordDetailAssertions(container: HTMLElement): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = container.querySelector(".db-record-detail-panel");
  results.push({
    name: "the record detail panel drew its header and fields",
    pass: Boolean(panel?.querySelector(".db-record-detail-header"))
      && Boolean(panel?.querySelector(".db-record-detail-fields")),
    detail: panel ? `${panel.querySelectorAll(".db-record-detail-field").length} field(s)`
      : "no .db-record-detail-panel",
  });
  results.push({
    name: "the panel carries the sheet chrome on a phone and the close button",
    pass: Boolean(panel?.querySelector(".db-cell-edit-close")),
    detail: panel?.querySelector(".db-cell-edit-close") ? "close button present" : "close button missing",
  });
  return results;
}

function recordDetailBodyAssertions(container: HTMLElement, variant: "empty" | "editing" | "read"): AssertionResult[] {
  const results: AssertionResult[] = [];
  const body = container.querySelector(".db-record-detail-body");
  const rendered = body?.querySelector(".db-record-detail-body-rendered");
  const editor = body?.querySelector(".db-record-detail-body-editor");
  const pass = variant === "editing"
    ? Boolean(body?.classList.contains("is-editing")) && Boolean(editor)
    : variant === "empty"
      ? Boolean(rendered?.classList.contains("is-empty")) && (rendered?.textContent || "").trim().length > 0
      : Boolean(rendered) && (rendered?.textContent || "").trim().length > 0;
  results.push({
    name: `the note body region mounted its ${variant} mode`,
    pass,
    detail: variant === "editing"
      ? `${body ? "is-editing on the region" : "no region"}, editor ${editor ? "present" : "missing"}`
      : `${rendered ? "rendered body" : "no rendered body"}${rendered?.classList.contains("is-empty") ? " (empty placeholder)" : ""}`,
  });
  return results;
}

function recordPeekAssertions(container: HTMLElement): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = container.querySelector(".db-record-peek-panel");
  results.push({
    name: "the record peek docked its panel beside the table",
    pass: Boolean(panel?.querySelector(".db-record-peek-header"))
      && Boolean(panel?.querySelector(".db-record-peek-properties")),
    detail: panel ? `${panel.querySelectorAll(".db-record-peek-field").length} peek field(s)`
      : "no .db-record-peek-panel",
  });
  results.push({
    name: "the peek carries its hidden-properties disclosure",
    pass: Boolean(panel?.querySelector(".db-record-peek-hidden-toggle")),
    detail: panel?.querySelector(".db-record-peek-hidden-toggle") ? "disclosure present" : "disclosure missing",
  });
  return results;
}

function columnWidthAdjusterAssertions(doc: Document): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = doc.querySelector(".db-mobile-column-width-panel");
  results.push({
    name: "the adjuster drew the shared header and the shared range row",
    pass: Boolean(panel?.querySelector(".db-panel-header .db-panel-title"))
      && Boolean(panel?.querySelector(".db-cell-edit-close"))
      && Boolean(panel?.querySelector(".db-view-config-range input[type=\"range\"]"))
      && Boolean(panel?.querySelector(".db-view-config-number")),
    detail: panel ? "header, close button and range row present" : "no .db-mobile-column-width-panel",
  });
  const presets = panel?.querySelectorAll(".db-new-placement-option").length ?? 0;
  results.push({
    name: "the adjuster drew all four presets, one of them selected",
    pass: presets === 4 && Boolean(panel?.querySelector('.db-new-placement-option[aria-checked="true"]')),
    detail: `${presets} preset(s), a checked one ${panel?.querySelector('.db-new-placement-option[aria-checked="true"]') ? "present" : "missing"}`,
  });
  return results;
}

function summaryAssertions(container: HTMLElement, ruleCount: number): AssertionResult[] {
  const results: AssertionResult[] = [];
  const summary = container.querySelector(".db-summary");
  const items = summary?.querySelectorAll(".db-summary-item").length ?? 0;
  results.push({
    name: "the summary row drew its total and its rules",
    pass: Boolean(summary) && items >= 1 + ruleCount,
    detail: `${items} item(s), want at least ${1 + ruleCount} (total + ${ruleCount} rule(s))`,
  });
  return results;
}

function ownedMenuAssertions(doc: Document, wantSheet: boolean): AssertionResult[] {
  const results: AssertionResult[] = [];
  const menu = doc.querySelector(".db-owned-menu");
  results.push({
    name: "the owned menu mounted on the document body",
    pass: Boolean(menu) && menu.querySelectorAll(".db-menu-item").length > 0,
    detail: menu ? `${menu.querySelectorAll(".db-menu-item").length} menu row(s)` : "no .db-owned-menu",
  });
  if (wantSheet) {
    results.push({
      name: "the phone menu carries the bottom-sheet chrome",
      pass: Boolean(menu?.classList.contains("db-mobile-bottom-sheet")),
      detail: menu?.classList.contains("db-mobile-bottom-sheet") ? "sheet classes present"
        : "menu mounted as a popover, not a sheet",
    });
  }
  return results;
}

function cellEditorAssertions(container: HTMLElement, kind: "text" | "select"): AssertionResult[] {
  const results: AssertionResult[] = [];
  if (kind === "text") {
    const textPopover = container.querySelector('.db-cell-edit-popover[data-note-database-editor-kind="text"]');
    const linePopover = container.querySelector(".db-cell-line-edit-popover");
    results.push({
      name: "the text editor opened its markdown toolbar and textarea",
      pass: Boolean(textPopover?.querySelector(".db-md-toolbar")) && Boolean(textPopover?.querySelector("textarea.db-cell-textarea")),
      detail: textPopover ? "popover with toolbar and textarea present" : "no text-edit popover",
    });
    results.push({
      name: "the number cell opened its single-line editor",
      pass: Boolean(linePopover?.querySelector("input.db-cell-line-input")),
      detail: linePopover ? "line editor present" : "no line-edit popover",
    });
  } else {
    const optionPopover = container.querySelector(".db-cell-option-popover");
    results.push({
      name: "the select cell opened its option list",
      pass: Boolean(optionPopover?.querySelector(".db-cell-option-item")),
      detail: optionPopover ? `${optionPopover.querySelectorAll(".db-cell-option-item").length} option row(s)`
        : "no .db-cell-option-popover",
    });
  }
  return results;
}

function datePickerAssertions(container: HTMLElement, includeTime: boolean): AssertionResult[] {
  const results: AssertionResult[] = [];
  const popover = container.querySelector(".db-date-value-popover");
  const trigger = container.querySelector(".db-date-value-field");
  results.push({
    name: "the date trigger click opened its value popover",
    pass: Boolean(trigger) && Boolean(popover?.querySelector(".db-calendar-mini-grid")),
    detail: popover ? "popover with mini calendar present" : "no .db-date-value-popover",
  });
  if (includeTime) {
    results.push({
      name: "the datetime picker drew its time segments",
      pass: Boolean(popover?.classList.contains("is-datetime")) && Boolean(popover?.querySelector(".db-hour-seg")),
      detail: popover?.classList.contains("is-datetime") ? "is-datetime and hour segment present"
        : "datetime flag missing from the popover",
    });
  }
  return results;
}

function bodySurfaceAssertion(container: HTMLElement, selector: string, name: string): AssertionResult {
  return {
    name,
    pass: Boolean(container.querySelector(selector)),
    detail: container.querySelector(selector) ? `${selector} present` : `${selector} missing`,
  };
}

function multiMarkerAssertion(container: HTMLElement, markers: string[], name: string): AssertionResult {
  const found = markers.filter((selector) => container.querySelector(selector));
  return {
    name,
    pass: found.length === markers.length,
    detail: `${found.length}/${markers.length} markers present`
      + (found.length === markers.length ? "" : `; missing: ${markers.filter((s) => !found.includes(s)).join(", ")}`),
  };
}

function timelineAssertions(container: HTMLElement): AssertionResult[] {
  const results: AssertionResult[] = [];
  // The bench leaves timelineLocalExtensions unset, so the renderer's default path is the
  // reference-copy gantt tree (pm-gantt-*), not the local db-timeline-* markup.
  const bars = container.querySelectorAll<HTMLElement>(".pm-gantt-bar-group, .pm-gantt-milestone").length;
  const labelRows = container.querySelectorAll<HTMLElement>(".pm-gantt-label-row:not(.pm-gantt-add-row)").length;

  results.push({
    name: "the gantt drew its label rows",
    pass: labelRows > 0,
    detail: `${labelRows} label rows`,
  });
  results.push({
    name: "the drawn window is not empty",
    pass: bars > 0,
    detail: bars > 0
      ? `${bars} bar/milestone marks drawn from ${TIMELINE_ROWS} rows`
      : "no bar or milestone was drawn: every bound below this passes trivially on an empty window, "
        + "so this run proves nothing about the timeline",
  });
  return results;
}

/** Recomputes the gantt's date range through the same exported pure function
 *  renderTimelineGantt calls (both read renderNow() for their notion of "today"), and checks the
 *  drawn today-line's x against it. A today-line built from a clock this harness never froze —
 *  or a range built from a different one — shows up here as a mismatch rather than passing by
 *  the two happening to agree on whatever day the run happened to execute. */
function timelineTodayLineAssertion(
  container: HTMLElement,
  rows: RowData[],
  config: ViewConfig,
  scale: TimelineScale,
): AssertionResult {
  const line = container.querySelector<SVGLineElement>(".pm-gantt-today-line");
  if (!line) {
    return { name: "the today line sits at the frozen date's x", pass: false, detail: "no .pm-gantt-today-line was drawn" };
  }
  const range = buildTimelineRangeGeometry(rows, config, scale);
  const todayKey = getLocalDateKey(renderNow());
  const expectedX = (dateKeyDaysBetween(range.startDateKey, todayKey) ?? 0) * range.dayWidth;
  const actualX = Number(line.getAttribute("x1"));
  return {
    name: "the today line sits at the frozen date's x",
    pass: Math.abs(actualX - expectedX) < 0.5,
    detail: `x1=${actualX}, expected ${expectedX} for ${todayKey} in range ${range.startDateKey}..${range.endDateKey} `
      + `(dayWidth ${range.dayWidth})`,
  };
}

// ───────────────────────────────────────────────────────────────────
// 7. SCENARIO RUNNER
// ───────────────────────────────────────────────────────────────────

// The armed control's seam. Every card and row renderer calls
// `applyConditionalFormat` once per item with the item's element and no target
// field, while field-level calls always name the field — so a wrapper that
// reads the box only when the field is unnamed adds exactly one geometry read
// per item, at the call the bound exists to police. Wrapping the bag member
// rather than a renderer method keeps the seam on harness-owned data, and the
// bag census pins the member's existence every run.
function armPerItemRead(bag: {
  applyConditionalFormat?: (element: HTMLElement, row: RowData, config: ViewConfig, targetField?: string) => void;
}): void {
  const original = bag.applyConditionalFormat;
  bag.applyConditionalFormat = (element, row, config, targetField) => {
    if (targetField === undefined) element.getBoundingClientRect();
    original?.(element, row, config, targetField);
  };
}

// The default board (boardExtensionsEnabled unset) renders the reference's
// card tree, which never calls `applyConditionalFormat` — that call is one of
// the local extensions the reference has no equivalent for, so armPerItemRead
// alone leaves this scenario's negative control unarmed. `getColumns` is the
// one bag member the reference card path still calls once per card
// (`getReferenceCardFields`), so it is the seam this scenario polices instead.
function armBoardReferenceCardRead(
  bag: { getColumns: (config: ViewConfig) => ColumnDef[] },
  container: HTMLElement,
): void {
  const original = bag.getColumns;
  bag.getColumns = (config) => {
    container.getBoundingClientRect();
    return original(config);
  };
}

// The chart and the day-scale calendar share a structural constraint: neither renders enough
// visible items for the per-item bag seam to exceed the bound — the chart draws one canvas, and
// a day column caps its all-day lanes at six — so their armed control wraps the render entry and
// reads the host's box once per row. That is the shape the bound exists to catch: reads that
// scale with the data at the render boundary. Wrapping the instance rather than the prototype
// keeps the seam on harness-owned data.
function armPerRowReadAtRenderEntry(
  render: (container: HTMLElement, config: ViewConfig, rows: RowData[], ...rest: unknown[]) => void,
  container: HTMLElement,
): (container: HTMLElement, config: ViewConfig, rows: RowData[], ...rest: unknown[]) => void {
  return (c, config, rows, ...rest) => {
    for (let i = 0; i < rows.length; i += 1) void container.getBoundingClientRect();
    render(c, config, rows, ...rest);
  };
}

// The measurement lanes mount every scenario in one page, and the surfaces that portal to the
// document body (a phone sheet, a menu, a picker, an anchored panel) would otherwise accumulate
// across mounts and be measured by every scenario that follows. The production open entries close
// their own predecessors, but nothing closes them when the NEXT scenario is a different surface,
// so the harness closes the previous mount's body surfaces before each new one — the same
// lifecycle obligation the runner already has for its own container.
//
// The named closes below run first, so each surface that owns a teardown gets it (listeners
// unbound, sheet chrome unwound, focus returned). The body sweep after them is the backstop for
// every surface that has no exported close: a panel this file would otherwise have to enumerate
// one by one, and a new one nobody remembered to add. Both run at the START of the next mount
// rather than at the end of this one, so a capture — which photographs the page after the runner
// has already handed the container back — still sees the surface its scenario opened.
let leftoverOwnedMenu: { close: () => void } | null = null;
let leftoverIconPickerClose: (() => void) | null = null;
// The adjuster mounts on document.body the same way the owned menu does, and its close is what
// releases keepSheetPlaced's visualViewport/resize subscriptions and the overlay-stack
// registration — the sweep below would remove the node but leave those listening on a page the
// next scenario reuses.
let leftoverColumnWidthClose: (() => void) | null = null;
// A branch that has to re-enter a state after the runner's own teardown schedules the re-entry on
// the next task. The measurement lanes mount every scenario into one page, so a timer still
// pending when the next scenario mounts would land inside that scenario's DOM instead — the
// mounts would stop being independent, and a lane measuring one of them would read another's.
let leftoverDeferred: number | null = null;
// The body children a page carries before any scenario mounts: its own scaffolding, never a
// renderer's output. Captured on the first mount, since the harness is loaded before the page
// has one.
let pristineBodyChildren: Set<Element> | null = null;

function sweepPortaledSurfaces(doc: Document): void {
  if (!pristineBodyChildren) {
    pristineBodyChildren = new Set(Array.from(doc.body.children));
    return;
  }
  for (const el of Array.from(doc.body.children)) {
    if (!pristineBodyChildren.has(el)) el.remove();
  }
}

export function runRenderAssertions(
  host: HTMLElement,
  scenario: ScenarioSpec,
  control = "",
  onMounted?: (container: HTMLElement, results: AssertionResult[]) => void,
): ScenarioOutcome {
  const results: AssertionResult[] = [];
  leftoverOwnedMenu?.close();
  leftoverOwnedMenu = null;
  leftoverColumnWidthClose?.();
  leftoverColumnWidthClose = null;
  closeRecordDetailPanel();
  closeActiveOptionColorPicker(host.ownerDocument);
  leftoverIconPickerClose?.();
  leftoverIconPickerClose = null;
  if (leftoverDeferred !== null) window.clearTimeout(leftoverDeferred);
  leftoverDeferred = null;
  sweepPortaledSurfaces(host.ownerDocument);
  const container = host.createDiv({ cls: "note-database-container" });
  const app = undefined as unknown as App;
  let bagKeys: string[] = [];
  let chartValueField: string | undefined;

  if (scenario.renderer === "board") {
    const columns = makeBoardColumns(BOARD_COLUMNS, scenario.captureData ? "mixed" : "text");
    const rows = makeBoardRows(
      scenario.captureData ? CAPTURE_ROWS : BOARD_ROWS,
      columns,
      scenario.captureData ? CAPTURE_FILL : BOARD_FILL,
      BOARD_GROUPS,
    );
    if (scenario.captureData) {
      applyCaptureOptions(columns, rows, BOARD_GROUP_FIELD);
      applyCaptureGroupPalette(columns, rows, BOARD_GROUP_FIELD);
      applyCapturePriorityTiers(columns, rows);
      if (scenario.subtaskTree) applyCaptureSubtaskTree(rows, BOARD_GROUP_FIELD);
    }
    let groups = makeBoardGroups(rows, BOARD_GROUPS);
    const config = {
      ...makeBoardConfig(columns),
      ...(scenario.boardExtensions ? { boardExtensionsEnabled: true } : {}),
      ...(scenario.boardImageField ? { boardImageField: columnOfType(columns, "text")?.key } : {}),
    } as ViewConfig;
    const hiddenCardColumn = scenario.boardCardFieldsHidden ? columnOfType(columns, "currency") : undefined;
    if (hiddenCardColumn) {
      // Seed the stored list from the derived default itself, rather than hand-listing every
      // column, so the only deliberate difference from `board`'s own default capture is the one
      // field this scenario hides.
      const defaultEntries = listBoardCardFields(config, columns, { groupField: BOARD_GROUP_FIELD });
      config.boardCardFields = toBoardCardFieldList(defaultEntries.map((entry) =>
        entry.column.key === hiddenCardColumn.key ? { ...entry, visible: false } : entry));
    }
    if (scenario.boardImageField) applyEmptyMetadataCache(rows);
    if (scenario.boardEmptyColumn) {
      // The empty lane comes from the same data call the hosts make: a configured select option
      // no row carries is backfilled as a zero-row group. The group column's options are the
      // values the rows actually hold plus one that none of them do.
      const groupCol = columns.find((col) => col.key === BOARD_GROUP_FIELD);
      if (groupCol) {
        const distinct = [...new Set(rows.map((row) =>
          String((row as unknown as { frontmatter: Record<string, unknown> }).frontmatter[BOARD_GROUP_FIELD])))];
        groupCol.statusOptions = [...distinct, "empty-lane"]
          .map((value, i) => ({ value, color: CAPTURE_OPTIONS[i % CAPTURE_OPTIONS.length].color }));
        groups = withEmptyOptionGroups(config, BOARD_GROUP_FIELD, groups);
        // withEmptyOptionGroups appends, so the backfilled lane is always last. A board scrolls
        // horizontally and an element capture crops to the viewport, which drew the lane this
        // scenario exists for off the right edge: five full lanes and none of the state. The lane
        // is still the one production built — only which end of the row it is drawn at is chosen.
        const emptyAt = groups.findIndex((group) => group.count === 0);
        if (emptyAt > 0) {
          groups = [groups[emptyAt], ...groups.filter((_unused, i) => i !== emptyAt)];
        }
      }
    }
    const bag = scenario.bag === "file-view" ? fileViewBoardBag(columns) : embedBoardBag(columns);
    bagKeys = Object.keys(bag).sort();
    if (control === "per-item") {
      armPerItemRead(bag);
      armBoardReferenceCardRead(bag, container);
    }
    const renderer = new BoardRenderer(app, bag);

    const stopCounting = countLayoutReads();
    renderer.render(container, config, groups, BOARD_GROUP_FIELD);
    const layoutReads = stopCounting();

    results.push(provenanceResult(container, "board-renderer"));
    if (results[0].pass) {
      if (scenario.boardExtensions) {
        results.push(multiMarkerAssertion(container,
          [".db-board", ".db-board-column", ".db-board-card"],
          "the extensions board drew its columns and cards"));
        if (scenario.boardImageField) {
          results.push(multiMarkerAssertion(container,
            [".db-board-card-cover.is-empty", ".db-board-card-cover-placeholder"],
            "the board cards drew their empty covers"));
        }
      } else if (scenario.boardEmptyColumn) {
        const columnsEls = Array.from(container.querySelectorAll<HTMLElement>(".pm-kanban-col"));
        const empties = columnsEls.filter((col) => col.querySelectorAll(".pm-kanban-card").length === 0);
        results.push({
          name: "the board drew an empty column beside its populated lanes",
          pass: columnsEls.length === BOARD_GROUPS + 1 && empties.length === 1,
          detail: `${columnsEls.length} column(s), ${empties.length} with zero cards`,
        });
      } else {
        results.push(...boardAssertions(container, rows));
      }
      if (scenario.subtaskTree) results.push(subtaskTreeAssertion(container, "board"));
      if (scenario.boardCardFieldsHidden) {
        const stillPresent = hiddenCardColumn
          ? container.querySelector(`.db-board-card-field[data-note-database-column-key="${hiddenCardColumn.key}"]`)
          : null;
        results.push({
          name: "a stored card field list removes the hidden field from every card",
          pass: Boolean(hiddenCardColumn) && !stillPresent,
          detail: !hiddenCardColumn
            ? "no currency column in this schema to hide — captureData must be on"
            : stillPresent
              ? `found data-note-database-column-key="${hiddenCardColumn.key}" on a card`
              : `"${hiddenCardColumn.key}" absent from every card`,
        });
      }
      if (!scenario.boardExtensions) results.push({
        name: "no forced layout inside the card loop",
        pass: layoutReads <= MAX_LAYOUT_READS,
        detail: `${layoutReads} layout reads during render, bound ${MAX_LAYOUT_READS}`
          + (layoutReads > MAX_LAYOUT_READS
            ? " — reads scale with cards, which is the quadratic shape that froze the app"
            : " (the touch-mode probe is the legitimate O(1) read)"),
      });
    }
  } else if (scenario.renderer === "gallery") {
    const columns = makeGalleryColumns(GALLERY_COLUMNS, scenario.captureData ? "mixed" : "text");
    const rows = makeGalleryRows(
      scenario.captureData ? CAPTURE_ROWS : GALLERY_ROWS,
      columns,
      scenario.captureData ? CAPTURE_FILL : GALLERY_FILL,
    );
    if (scenario.captureData) applyCaptureOptions(columns, rows);
    const config = {
      ...makeGalleryConfig(columns),
      ...(scenario.galleryImageField ? { galleryImageField: columnOfType(columns, "text")?.key } : {}),
    } as ViewConfig;
    if (scenario.galleryImageField) applyEmptyMetadataCache(rows);
    const bag = scenario.bag === "file-view" ? fileViewGalleryBag(columns) : embedGalleryBag(columns);
    bagKeys = Object.keys(bag).sort();
    if (control === "per-item") armPerItemRead(bag);
    const renderer = new GalleryRenderer(app, bag);

    const stopCounting = countLayoutReads();
    renderer.render(container, config, rows);
    const layoutReads = stopCounting();

    results.push(provenanceResult(container, "gallery-renderer"));
    if (results[0].pass) {
      results.push(...galleryAssertions(container, rows));
      if (scenario.galleryImageField) {
        results.push(multiMarkerAssertion(container,
          [".db-gallery-cover.is-empty", ".db-gallery-cover-placeholder"],
          "the gallery cards drew their empty covers"));
      }
      results.push({
        name: "no forced layout inside the card loop",
        pass: layoutReads <= MAX_LAYOUT_READS,
        detail: `${layoutReads} layout reads during render, bound ${MAX_LAYOUT_READS}`
          + (layoutReads > MAX_LAYOUT_READS
            ? " — reads scale with cards, which is the quadratic shape that froze the app"
            : " (the touch-mode probe is the legitimate O(1) read)"),
      });
    }
  } else if (scenario.renderer === "calendar") {
    // Narrowed rather than cast: ScenarioSpec.scale is shared with the timeline branch's five
    // scales, and a calendar scenario is only ever constructed with its own three (see
    // render-assertion-bundle.mjs's SCENARIOS and constructed-scenarios.mjs's registry), so a
    // "quarter"/"year" value here would be a construction bug — this falls back to "month" rather
    // than passing an out-of-range scale to `makeCalendarConfig`.
    const scale: "month" | "week" | "day" =
      scenario.scale === "week" || scenario.scale === "day" ? scenario.scale : "month";
    // "No date-like column" is the real condition getDefaultEventDateField/renderMonth branch on
    // (calendar-renderer.ts), so the empty-state option removes the date-typed column from the
    // constructed schema rather than fabricating the empty-state DOM directly.
    const baseColumns = makeCalendarColumns(CALENDAR_COLUMNS, scenario.captureData ? "mixed" : "text");
    const columns = scenario.emptyState
      ? baseColumns.filter((col) => col.type !== "date" && col.type !== "datetime")
      : baseColumns;
    const rows = makeCalendarRows(
      scenario.captureData ? CAPTURE_ROWS : CALENDAR_ROWS,
      columns,
      scenario.captureData ? CAPTURE_FILL : CALENDAR_FILL,
    );
    if (scenario.captureData) applyCaptureOptions(columns, rows);
    const baseConfig = makeCalendarConfig(columns, scale);
    const config: ViewConfig = scenario.emptyState
      ? { ...baseConfig, calendarStartDateField: undefined }
      : baseConfig;
    const bag = scenario.bag === "file-view" ? fileViewCalendarBag(columns) : embedCalendarBag(columns);
    bagKeys = Object.keys(bag).sort();
    const renderer = new CalendarRenderer(bag);
    if (control === "per-item" && scale === "week") armPerItemRead(bag);
    if (control === "per-item" && scale === "day") {
      renderer.render = armPerRowReadAtRenderEntry(renderer.render.bind(renderer), container);
    }

    const stopCounting = countLayoutReads();
    renderer.render(container, config, rows);
    const layoutReads = stopCounting();

    // The same button a device tap reaches: renderMiniCalendarButton tags its icon span
    // data-icon="calendar-days", and .click() fires the real onclick handler that calls the
    // renderer's own (private) toggleMiniCalendar — no hand-applied class.
    if (scenario.miniCalendar) {
      const trigger = container.querySelector('[data-icon="calendar-days"]')?.closest("button");
      (trigger as HTMLButtonElement | null)?.click();
    }

    results.push(provenanceResult(container, "calendar-renderer"));
    if (results[0].pass) {
      results.push(...(scenario.emptyState
        ? [calendarEmptyStateAssertion(container)]
        : scenario.miniCalendar
          ? [miniCalendarAssertion(container)]
          : scale === "month"
            ? calendarAssertions(container)
            : weekAssertions(container, scale)));
      results.push({
        name: "no forced layout inside the segment loop",
        pass: layoutReads <= MAX_LAYOUT_READS,
        detail: `${layoutReads} layout reads during render, bound ${MAX_LAYOUT_READS}`
          + (layoutReads > MAX_LAYOUT_READS
            ? " — reads scale with events, which is the quadratic shape that froze the app"
            : " (the window is sized once per render, not once per segment)"),
      });
    }
  } else if (scenario.renderer === "chart") {
    const columns = makeBoardColumns(CHART_COLUMNS, scenario.captureData ? "mixed" : "text");
    const rows = makeBoardRows(CHART_ROWS, columns, CHART_FILL, CHART_GROUPS);
    // "count" needs no per-row field — every row just adds one to its group's tally, which is why
    // the chart never had one before. A per-row value column is what a configured sum/avg chart
    // actually reads, so captureData picks the first number/currency column MIXED_TYPES produced
    // (never the reserved group field, which is always "select") and switches the aggregation to
    // "sum" so that column's value feeds every bar rather than sitting unread.
    const valueColumn = scenario.captureData
      ? columns.find((col) => col.type === "number" || col.type === "currency")
      : undefined;
    chartValueField = valueColumn?.key;
    if (valueColumn) {
      // The board bench's own sparse fill (CHART_FILL = BOARD_FILL, 30%) can land entirely
      // outside a particular group's row indices, summing that group's bar to zero — a real
      // number, but one that proves nothing about the marks this option exists to exercise. A
      // dedicated fill for the one column the aggregation reads keeps every group's bar real
      // without changing the bench's general fill shape for every other column.
      const key = valueColumn.key;
      rows.forEach((row, i) => {
        (row as unknown as { frontmatter: Record<string, unknown> }).frontmatter[key] = i * 37 + 0.5;
      });
    }
    const config = {
      ...makeBoardConfig(columns),
      viewType: "chart",
      chartType: scenario.chartVariant === "number" ? "number" : "bar",
      chartAggregation: valueColumn ? "sum" : "count",
      chartValueField: valueColumn?.key,
      chartGroupField: BOARD_GROUP_FIELD,
      // "empty" hides every value the group field actually produced, reproducing the real
      // `allGroupsHidden` result computeChartAggregate returns rather than an invented empty DOM.
      ...(scenario.chartVariant === "empty" ? { chartHiddenGroups: allHiddenGroupsFor(rows, BOARD_GROUP_FIELD) } : {}),
      schema: { columns, computedFields: [] },
    } as ViewConfig;
    const actions = chartBag();
    bagKeys = Object.keys(actions).sort();
    const renderer = new ChartRenderer();
    if (control === "per-item") {
      renderer.render = armPerRowReadAtRenderEntry(renderer.render.bind(renderer), container);
    }

    const stopCounting = countLayoutReads();
    renderer.render(container, config, rows, columns, actions);
    const layoutReads = stopCounting();

    results.push(provenanceResult(container, "chart-renderer"));
    if (results[0].pass) {
      results.push(...(scenario.chartVariant
        ? [chartVariantAssertion(container, scenario.chartVariant)]
        : chartAssertions(container, config)));
      results.push({
        name: "no forced layout inside the chart build",
        pass: layoutReads <= MAX_CHART_LAYOUT_READS,
        detail: `${layoutReads} layout reads during render, bound ${MAX_CHART_LAYOUT_READS}`
          + (layoutReads > MAX_CHART_LAYOUT_READS
            ? " — reads scale with rows, which is the quadratic shape that froze the app"
            : " (the theme token reads and Chart.js's own canvas sizing are the legitimate O(1) set)"),
      });
    }
  } else if (scenario.renderer === "timeline") {
    // Timeline owns the full five-scale set ScenarioSpec.scale carries, so unlike the calendar
    // branch this reads it directly rather than narrowing — every value in the union is one the
    // bench's own makeConfig already accepts. "week" is the implicit default this field replaces.
    const timelineScale = scenario.scale ?? "week";
    const columns = makeTimelineColumns(TIMELINE_COLUMNS, scenario.captureData ? "mixed" : "text");
    const rows = makeTimelineRows(
      scenario.captureData ? CAPTURE_ROWS : TIMELINE_ROWS,
      columns,
      scenario.captureData ? CAPTURE_FILL : TIMELINE_FILL,
    );
    if (scenario.captureData) {
      applyCaptureOptions(columns, rows);
      if (scenario.subtaskTree) applyCaptureSubtaskTree(rows);
    }
    const config = makeTimelineConfig(columns, timelineScale);
    if (timelineScale === "day") {
      // The day scale is a datetime-field state. normalizeTimelineDayScale rewrites the config
      // back to "week" whenever the timeline's own date field is a plain date column, so a bench
      // whose event field is `date` photographs the week scale under a day-scale name. Giving the
      // field the type and the times production requires is what actually reaches the scale.
      const eventKey = (config as unknown as { timelineStartDateField?: string }).timelineStartDateField;
      const eventColumn = eventKey ? columns.find((col) => col.key === eventKey) : undefined;
      if (eventKey && eventColumn) {
        eventColumn.type = "datetime";
        rows.forEach((row, i) => {
          const frontmatter = (row as unknown as { frontmatter: Record<string, unknown> }).frontmatter;
          const value = frontmatter[eventKey];
          if (typeof value === "string" && !value.includes("T")) {
            frontmatter[eventKey] = `${value}T${String(8 + (i % 9)).padStart(2, "0")}:00`;
          }
        });
      }
    }
    const bag = scenario.bag === "file-view" ? fileViewTimelineBag() : embedTimelineBag();
    bagKeys = Object.keys(bag).sort();
    const renderer = new CalendarTimelineRenderer(bag);

    const stopCounting = countLayoutReads();
    renderer.renderTimeline(container, config, rows);
    const layoutReads = stopCounting();

    results.push(provenanceResult(container, "timeline-renderer"));
    if (results[0].pass) {
      results.push(...timelineAssertions(container));
      // Only the plain scenario: the subtask-tree scenario collapses some rows before the
      // renderer's own visibleRows filter runs, and this assertion recomputes the range from
      // the unfiltered fixture rows, which would not match the collapsed set.
      if (!scenario.subtaskTree) results.push(timelineTodayLineAssertion(container, rows, config, timelineScale));
      if (scenario.subtaskTree) results.push(subtaskTreeAssertion(container, "timeline"));
      results.push({
        name: "no forced layout inside the event loop",
        pass: layoutReads <= MAX_LAYOUT_READS,
        detail: `${layoutReads} layout reads during render, bound ${MAX_LAYOUT_READS}`
          + (layoutReads > MAX_LAYOUT_READS
            ? " — reads scale with events, which is the quadratic shape that froze the app"
            : " (the touch-mode probe and the viewport window are the legitimate O(1) reads)"),
      });
    }
    // The renderer holds a ResizeObserver and pending timers; dropping the container without
    // this leaks one of each per scenario into the run that follows.
    renderer.destroy();
  } else if (scenario.renderer === "chart-toolbar") {
    // The chart options popover: opened through ChartToolbarRenderer's own public togglePopover,
    // never a hand-applied class, against the same board-bench chart config the "chart" branch
    // above builds. The anchor is a real, connected button — positionToolbarPopover needs one to
    // place against — visually hidden so the capture shows only the popover it opens.
    const columns = makeBoardColumns(CHART_COLUMNS, "mixed");
    const rows = makeBoardRows(CAPTURE_ROWS, columns, CAPTURE_FILL, CHART_GROUPS);
    applyCaptureOptions(columns, rows, BOARD_GROUP_FIELD);
    const valueColumn = columns.find((col) => col.type === "number" || col.type === "currency");
    if (valueColumn) {
      const key = valueColumn.key;
      rows.forEach((row, i) => {
        (row as unknown as { frontmatter: Record<string, unknown> }).frontmatter[key] = i * 37 + 0.5;
      });
    }
    const config = {
      ...makeBoardConfig(columns),
      viewType: "chart",
      chartType: "bar",
      chartAggregation: valueColumn ? "sum" : "count",
      chartValueField: valueColumn?.key,
      chartGroupField: BOARD_GROUP_FIELD,
      schema: { columns, computedFields: [] },
    } as ViewConfig;
    const anchor = makeHiddenAnchor(container, "db-chart-options-trigger");
    const toolbar = new ChartToolbarRenderer();
    const actions: ChartToolbarActions = { onChange: () => undefined };
    bagKeys = Object.keys(actions).sort();
    toolbar.togglePopover(container, anchor, config, actions);

    results.push(provenanceResult(container, "chart-toolbar-renderer"));
    if (results[0].pass) results.push(toolbarPopoverAssertion(container, ".db-chart-options-popover"));
  } else if (scenario.renderer === "calendar-toolbar") {
    // The calendar settings popover, week scale so the Time section (only shown at week/day
    // scale, per the fixture this supersedes) is in frame.
    const columns = makeCalendarColumns(CALENDAR_COLUMNS, "mixed");
    const rows = makeCalendarRows(CAPTURE_ROWS, columns, CAPTURE_FILL);
    applyCaptureOptions(columns, rows);
    const config = makeCalendarConfig(columns, "week");
    const anchor = makeHiddenAnchor(container, "db-calendar-options-trigger");
    const toolbar = new CalendarToolbarRenderer();
    const actions: CalendarToolbarActions = { onChange: () => undefined };
    bagKeys = Object.keys(actions).sort();
    toolbar.togglePopover(container, anchor, config, actions);

    results.push(provenanceResult(container, "calendar-toolbar-renderer"));
    if (results[0].pass) results.push(toolbarPopoverAssertion(container, ".db-calendar-options-popover"));
  } else if (scenario.renderer === "timeline-toolbar") {
    // The timeline settings popover. The bench's own makeConfig sets viewType: "calendar" (it
    // never reaches a viewType-gated caller today), but CalendarTimelineToolbarRenderer.
    // togglePopover guards on viewType === "timeline" — the real value database-view.ts gives a
    // timeline host — so this local override matches the real config shape this popover expects.
    const columns = makeTimelineColumns(TIMELINE_COLUMNS, "mixed");
    const rows = makeTimelineRows(CAPTURE_ROWS, columns, CAPTURE_FILL);
    applyCaptureOptions(columns, rows);
    const config: ViewConfig = { ...makeTimelineConfig(columns, "week"), viewType: "timeline" };
    const anchor = makeHiddenAnchor(container, "db-calendar-timeline-options-trigger");
    const toolbar = new CalendarTimelineToolbarRenderer();
    const actions: CalendarTimelineToolbarActions = { onChange: () => undefined };
    bagKeys = Object.keys(actions).sort();
    toolbar.togglePopover(container, anchor, config, actions);

    results.push(provenanceResult(container, "timeline-toolbar-renderer"));
    if (results[0].pass) results.push(toolbarPopoverAssertion(container, ".db-calendar-timeline-options-popover"));
  } else if (scenario.renderer === "toolbar") {
    // The full toolbar: ToolbarRenderer.render with a one-view database over the table bench's
    // typed columns. The popover states ride the toolbar's own trigger buttons — the same
    // onclick handlers a device tap reaches — rather than a separate mount. `showDatabaseChrome`
    // is the file-view shape: heading, view tabs, and the four right-hand clusters.
    const columns = makeTableColumns(TABLE_COLUMNS, "mixed");
    const rows = makeTableRows(TABLE_ROWS, columns);
    applyCaptureOptions(columns, rows);
    const config = { ...makeTableConfig(columns), viewType: "table" } as ViewConfig;
    const db = makeSurfaceDatabase(columns, config);
    const state = makeSurfaceState({ searchText: scenario.searchText ?? "" });
    const actions = makeToolbarActions();
    bagKeys = Object.keys(actions).sort();
    const renderer = new ToolbarRenderer();
    renderer.render(container, [{ config: db, sourcePath: "notes" }], 0, 0, state, actions);
    if (scenario.toolbarPopover === "utilities") {
      (container.querySelector<HTMLButtonElement>(".db-toolbar-more-btn"))?.click();
    } else if (scenario.toolbarPopover === "add-view") {
      (container.querySelector<HTMLButtonElement>(".db-view-tab-add"))?.click();
    }

    results.push(provenanceResult(container, "toolbar-renderer"));
    if (results[0].pass) results.push(...toolbarAssertions(container, scenario));
  } else if (scenario.renderer === "active-view-controls") {
    // The chip rail lives inside the header the toolbar builds, so the branch supplies the
    // minimal header host the renderer requires (it refuses to render without one) and the
    // state the chips summarise: effective filter rules and sort rules over real columns.
    const { columns } = makeSurfaceListData();
    const config = { ...makeTableConfig(columns), viewType: "table" } as ViewConfig;
    const selectCols = columns.filter((col) => col.type === "select" || col.type === "status");
    const currencyCol = columnOfType(columns, "currency");
    const dateCol = columnOfType(columns, "date");
    const filters: Array<{ field: string; op: "eq"; value: string }> = selectCols.slice(0, 2)
      .map((col, i) => ({ field: col.key, op: "eq" as const, value: ["Backlog", "Doing"][i] }));
    const sortRules = currencyCol && dateCol
      ? [{ field: currencyCol.key, direction: "desc" as const }, { field: dateCol.key, direction: "asc" as const }]
      : [];
    const state = makeSurfaceState({
      ...(scenario.rules === "sort" ? {} : { filters }),
      ...(scenario.rules === "filter" ? {} : { sortRules }),
    });
    const actions: ActiveViewControlsActions = {
      editFilter: () => undefined,
      editSort: () => undefined,
      removeFilter: () => undefined,
      removeSort: () => undefined,
      toggleFilterLogic: () => undefined,
      clearAll: () => undefined,
    };
    bagKeys = Object.keys(actions).sort();
    container.createDiv({ cls: "db-header" });
    const renderer = new ActiveViewControlsRenderer();
    renderer.render(container, config, state, actions);

    results.push(provenanceResult(container, "active-view-controls-renderer"));
    if (results[0].pass) results.push(...chipRailAssertions(container, scenario));
  } else if (scenario.renderer === "active-rule-popover") {
    // The single-rule popover the chip row's edit buttons open: ActiveRulePopoverRenderer's own
    // toggleFilter/toggleSort against a real anchor, with the panel's editor delegated to the
    // filter or sort renderer's renderSingleRuleEditor.
    const { columns } = makeSurfaceListData();
    const config = makeTableConfig(columns);
    const anchor = makeHiddenAnchor(container, "db-active-rule-anchor");
    const close = (): void => undefined;
    if (scenario.ruleKind === "sort") {
      const currencyCol = columnOfType(columns, "currency");
      const state = makeSurfaceState({ sortRules: [{ field: currencyCol?.key ?? "file.name", direction: "asc" }] });
      const renderer = new SortPanelRenderer();
      const actions: SortPanelActions = { save: close, refresh: close, close };
      bagKeys = Object.keys(actions).sort();
      new ActiveRulePopoverRenderer().toggleSort({
        containerEl: container, anchorEl: anchor, index: 0, state, config, renderer, actions, onClose: close,
      });
      results.push(provenanceResult(container, "active-rule-popover-renderer"));
      if (results[0].pass) results.push(...activeRulePopoverAssertions(container, "sort"));
    } else {
      const selectCol = columnOfType(columns, "select");
      const state = makeSurfaceState({ filters: [{ field: selectCol?.key ?? "file.name", op: "eq", value: "Backlog" }] });
      const renderer = new FilterPanelRenderer();
      const actions: FilterPanelActions = { saveState: close, refresh: close, close };
      bagKeys = Object.keys(actions).sort();
      new ActiveRulePopoverRenderer().toggleFilter({
        containerEl: container, anchorEl: anchor, index: 0, state, config, renderer, actions, onClose: close,
      });
      results.push(provenanceResult(container, "active-rule-popover-renderer"));
      if (results[0].pass) results.push(...activeRulePopoverAssertions(container, "filter"));
    }
  } else if (scenario.renderer === "filter-panel") {
    // The filter panel over a real filter tree: flat rules build the single AND group the panel
    // header defers its logic button to, the nested tree exercises the NOT node and the inner
    // OR group at the depth the panel's own wrap rules allow.
    const { columns } = makeSurfaceListData();
    const config = makeTableConfig(columns);
    const anchor = makeHiddenAnchor(container, "db-filter-anchor");
    const actions: FilterPanelActions = { saveState: () => undefined, refresh: () => undefined, close: () => undefined };
    bagKeys = Object.keys(actions).sort();
    const selectCols = columns.filter((col) => col.type === "select" || col.type === "status");
    const currencyCol = columnOfType(columns, "currency");
    const dateCol = columnOfType(columns, "date");
    const state = scenario.filterDepth === "nested" && selectCols.length >= 2 && currencyCol
      ? makeSurfaceState({
          filterTree: {
            type: "group",
            logic: "and",
            rules: [
              { field: selectCols[0].key, op: "eq", value: "Backlog" },
              { type: "not", rule: { field: selectCols[1].key, op: "eq", value: "Doing" } },
              {
                type: "group",
                logic: "or",
                rules: [
                  { field: currencyCol.key, op: "gt", value: "50" },
                  ...(selectCols[2] ? [{ field: selectCols[2].key, op: "eq" as const, value: "Review" }] : []),
                ],
              },
            ],
          },
        })
      : makeSurfaceState({
          filters: [
            ...(selectCols[0] ? [{ field: selectCols[0].key, op: "eq" as const, value: "Backlog" }] : []),
            ...(currencyCol ? [{ field: currencyCol.key, op: "gt" as const, value: "20" }] : []),
            ...(dateCol ? [{ field: dateCol.key, op: "notempty" as const, value: "" }] : []),
          ],
        });
    const renderer = new FilterPanelRenderer();
    renderer.render(container, true, state, config, actions, anchor);

    results.push(provenanceResult(container, "filter-panel-renderer"));
    if (results[0].pass) results.push(...filterPanelAssertions(container, scenario.filterDepth === "nested"));
  } else if (scenario.renderer === "sort-panel") {
    // The sort panel: two rules with their reorder controls, or — under calendarHint — the
    // calendar-layout hint above the empty state, the only state the hint appears in.
    const { columns } = makeSurfaceListData();
    const currencyCol = columnOfType(columns, "currency");
    const dateCol = columnOfType(columns, "date");
    const config = scenario.calendarHint
      ? { ...makeTableConfig(columns), viewType: "calendar" } as ViewConfig
      : makeTableConfig(columns);
    const state = scenario.calendarHint
      ? makeSurfaceState()
      : makeSurfaceState({
          sortRules: [
            ...(currencyCol ? [{ field: currencyCol.key, direction: "desc" as const }] : []),
            ...(dateCol ? [{ field: dateCol.key, direction: "asc" as const }] : []),
          ],
        });
    const actions: SortPanelActions = { save: () => undefined, refresh: () => undefined, close: () => undefined };
    bagKeys = Object.keys(actions).sort();
    const renderer = new SortPanelRenderer();
    renderer.render(container, true, config, state, actions, makeHiddenAnchor(container, "db-sort-anchor"));

    results.push(provenanceResult(container, "sort-panel-renderer"));
    if (results[0].pass) results.push(...sortPanelAssertions(container, Boolean(scenario.calendarHint)));
  } else if (scenario.renderer === "view-config") {
    if (scenario.viewConfigVariant === "board") {
      // The board's Properties section (`renderBoardCardProperties`), reached only through
      // `renderBoardSettings` when `config.viewType === "board"` — the branch below this one is
      // table-only, so this scenario is what makes the section mount through the capture
      // pipeline at all. Schema and stored `boardCardFields` list are
      // `board-card-properties-panel.stories.ts`'s own `Editable` fixture, unchanged, so the
      // story and this capture are provably the same state: Hours and Due stored visible, Tags
      // stored hidden, Status (the board's own group field) appended hidden because the
      // operator's list never named it. `render()`'s own `isMobileBottomSheet` fork is what turns
      // this into the phone's bottom sheet on that device pass — nothing here decides that.
      const columns: ColumnDef[] = [
        { key: "file.name", label: "Name", type: "text" },
        { key: "status", label: "Status", type: "status" },
        { key: "cover", label: "Cover", type: "text" },
        { key: "hours", label: "Hours", type: "number" },
        { key: "tags", label: "Tags", type: "multi-select" },
        { key: "due", label: "Due", type: "date" },
      ];
      const config = {
        name: "Board",
        sourceFolder: "",
        viewType: "board",
        boardGroupField: "status",
        boardImageField: "cover",
        schema: { columns, computedFields: [] },
        boardCardFields: [
          { key: "hours", visible: true },
          { key: "tags", visible: false },
          { key: "due", visible: true },
        ],
      } as ViewConfig;
      const actions: ViewConfigPanelActions = {
        app: undefined as unknown as App,
        onChange: () => undefined,
      };
      bagKeys = Object.keys(actions).sort();
      const renderer = new ViewConfigPanelRenderer();
      renderer.render(container, true, config, actions, makeHiddenAnchor(container, "db-view-config-anchor"));

      results.push(provenanceResult(container, "view-config-panel-renderer"));
      if (results[0].pass) results.push(...boardCardPropertiesPanelAssertions(container));
    } else {
      // The settings panel for a table view with a one-view database: the database-scoped rows
      // render because actions.database is present, the view-scoped rows from the config. The
      // bench's config shape puts columns at the top level, but the settings panel reads the real
      // ViewConfig schema, so this branch wraps the bench data in that shape.
      const columns = makeTableColumns(TABLE_COLUMNS, "mixed");
      const rows = makeTableRows(TABLE_ROWS, columns);
      applyCaptureOptions(columns, rows);
      const config = {
        ...makeTableConfig(columns),
        viewType: "table",
        schema: { columns, computedFields: [] },
      } as ViewConfig;
      const db = makeSurfaceDatabase(columns, config);
      const actions: ViewConfigPanelActions = {
        app: undefined as unknown as App,
        onChange: () => undefined,
        database: db,
      };
      bagKeys = Object.keys(actions).sort();
      const renderer = new ViewConfigPanelRenderer();
      renderer.render(container, true, config, actions, makeHiddenAnchor(container, "db-view-config-anchor"));

      results.push(provenanceResult(container, "view-config-panel-renderer"));
      if (results[0].pass) results.push(...viewConfigAssertions(container));
    }
  } else if (scenario.renderer === "column-manager") {
    // The properties panel: one row per schema column, with a hidden column so the select-all
    // checkbox sits in its real indeterminate state.
    const columns = makeTableColumns(TABLE_COLUMNS, "mixed");
    const rows = makeTableRows(TABLE_ROWS, columns);
    applyCaptureOptions(columns, rows);
    const config = { ...makeTableConfig(columns), schema: { columns, computedFields: [] } } as ViewConfig;
    const state = makeSurfaceState({ hiddenColumns: new Set(columns.length > 2 ? [columns[2].key] : []) });
    const actions: ColumnManagerActions = {
      close: () => undefined,
      setColumnVisible: () => undefined,
      setColumnsVisible: () => undefined,
      setAllColumnsVisible: () => undefined,
      moveColumn: () => undefined,
      moveColumnTo: () => undefined,
      toggleColumnWrap: () => undefined,
      editColumn: () => undefined,
      addColumn: () => undefined,
      addFileFieldColumn: () => undefined,
      deleteColumn: () => undefined,
    };
    bagKeys = Object.keys(actions).sort();
    const renderer = new ColumnManagerRenderer();
    renderer.render(container, true, config, state, columns, actions, makeHiddenAnchor(container, "db-column-manager-anchor"));

    results.push(provenanceResult(container, "column-manager-renderer"));
    if (results[0].pass) results.push(...columnManagerAssertions(container, columns));
  } else if (scenario.renderer === "record-detail") {
    // The record panel: openRecordDetailPanel's own module entry against a real anchor. The
    // note body is absent on purpose — mounting it requires the readNoteBody action, which
    // constructs an obsidian Component the shared stub refuses — so this photographs the panel
    // chrome and its typed fields. The phone device pass turns it into the bottom sheet through
    // positionToolbarPopover's own is-phone branch.
    const columns = makeBoardColumns(BOARD_COLUMNS, "mixed");
    const rows = makeBoardRows(CAPTURE_ROWS, columns, CAPTURE_FILL, BOARD_GROUPS);
    applyCaptureOptions(columns, rows, BOARD_GROUP_FIELD);
    const config = { ...makeBoardConfig(columns), showEmptyFields: true } as ViewConfig;
    const row = rows[0];
    if (row) {
      const fm = (row as unknown as { frontmatter: Record<string, unknown> }).frontmatter;
      const blankKey = columns.find((col) => col.key !== "file.name" && col.type === "text")?.key;
      if (blankKey) delete fm[blankKey];
    }
    const anchor = makeHiddenAnchor(container, "db-record-detail-anchor");
    const actions: RecordDetailActions = {
      editCell: () => undefined,
      openRow: () => undefined,
    };
    bagKeys = Object.keys(actions).sort();
    openRecordDetailPanel({
      anchorEl: anchor,
      host: container,
      row,
      columns,
      config,
      app: undefined as unknown as App,
      actions,
    });
    container.setAttribute(PROVENANCE_ATTR, "record-detail-panel");

    results.push(provenanceResult(container, "record-detail-panel"));
    if (results[0].pass) results.push(...recordDetailAssertions(container));
  } else if (scenario.renderer === "record-detail-body") {
    // The note body region on its own: mountNoteBodyRegion's public entry with the renderer
    // injected the module's contract requires (the real MarkdownRenderer has no standalone
    // build; the harness's injected renderer writes the markdown as text). The marker lands on
    // the region's own element, which is the one the production call built.
    const variant = scenario.recordBodyVariant ?? "read";
    const body = variant === "empty" ? "" : "## Cancellation\n\nCancel before the renewal date.";
    const region = mountNoteBodyRegion({
      parent: container,
      body,
      renderMarkdown: (target, markdown) => { target.textContent = markdown; },
      onCommit: () => undefined,
      placeholder: "Write a note…",
      commitDelayMs: 60000,
    });
    if (variant === "editing") {
      region.beginEdit();
      // The region's edit mode is focus-held by contract: the textarea's own blur handler
      // commits and returns to the rendered body. The runner removes the mounted container
      // after its hook, and removing a focused element fires blur, which would photograph the
      // body as read — so the edit is re-entered on the next task, after the teardown, through
      // the same public beginEdit the tap handler calls.
      leftoverDeferred = window.setTimeout(() => {
        leftoverDeferred = null;
        if (!region.isEditing()) region.beginEdit();
      }, 0);
    }
    container.setAttribute(PROVENANCE_ATTR, "record-detail-body");

    results.push(provenanceResult(container, "record-detail-body"));
    if (results[0].pass) results.push(...recordDetailBodyAssertions(container, variant));
  } else if (scenario.renderer === "record-peek") {
    // The table's record peek: a real table beneath it (the surface it docks against), then
    // openTableRecordPeek's own module entry for the first row.
    const columns = makeTableColumns(TABLE_COLUMNS, "mixed");
    const rows = makeTableRows(CAPTURE_ROWS, columns);
    applyCaptureOptions(columns, rows);
    const config = { ...makeTableConfig(columns), schema: { columns, computedFields: [] } } as ViewConfig;
    const bag = fileViewTableBag(columns, true);
    bagKeys = Object.keys(bag).sort();
    const renderer = new TableRenderer(bag);
    renderer.renderTable(container, config, rows);
    const anchor = makeHiddenAnchor(container, "db-record-peek-anchor");
    openTableRecordPeek({
      anchor,
      row: rows[0],
      config,
      visibleColumns: columns,
      allColumns: columns,
      container,
      returnFocus: () => undefined,
      renderRecordIcon: () => null,
      // On a touch mount the peek hands off to the record sheet — the same hand-off the view
      // host makes — so a phone scenario photographs the surface a phone actually gets.
      // `recordPeekTouch: false` omits this callback so the scenario proves the other side of
      // the same branch: the docked rail a caller without the hand-off still gets.
      ...(scenario.recordPeekTouch === false ? {} : {
        openRecordDetail: (openAnchor: HTMLElement, openRow: RowData) => {
          openRecordDetailPanel({
            anchorEl: openAnchor,
            host: container,
            row: openRow,
            columns,
            config,
            app: undefined as unknown as App,
            actions: { editCell: () => undefined, openRow: () => undefined },
          });
        },
      }),
    });
    container.setAttribute(PROVENANCE_ATTR, "record-peek");

    results.push(provenanceResult(container, "record-peek"));
    if (results[0].pass) results.push(...recordPeekAssertions(container));
  } else if (scenario.renderer === "column-width-adjuster") {
    // The column-width adjuster: openColumnWidthAdjuster's own module entry over a real column
    // from the table bench. It mounts on document.body the same way the owned menu does — never
    // as a child of `container` — so the marker rides the panel element itself and the assertions
    // query the body, not the container. On a phone device isMobileBottomSheet's own check turns
    // it into the shared bottom sheet; on desktop it stays the fixed panel.
    const columns = makeTableColumns(TABLE_COLUMNS, "mixed");
    const config = { ...makeTableConfig(columns), schema: { columns, computedFields: [] } } as ViewConfig;
    const col = columnOfType(columns, "currency") ?? columns[1];
    leftoverColumnWidthClose = openColumnWidthAdjuster({
      root: container,
      col,
      config,
      persist: () => undefined,
    });
    const adjusterPanel = container.ownerDocument.querySelector(".db-mobile-column-width-panel");
    adjusterPanel?.setAttribute(PROVENANCE_ATTR, "column-width-adjuster");
    bagKeys = [];

    results.push(provenanceResult(adjusterPanel as HTMLElement ?? container, "column-width-adjuster"));
    if (results[0].pass) results.push(...columnWidthAdjusterAssertions(container.ownerDocument));
  } else if (scenario.renderer === "summary") {
    // The summary row: SummaryRenderer.render with a config whose summaryRules name real
    // columns, and the onChange hook that makes the rule items draggable and clickable.
    const { columns, rows } = makeSurfaceListData();
    const currencyCol = columnOfType(columns, "currency");
    const selectCol = columnOfType(columns, "select");
    const config = {
      ...makeTableConfig(columns),
      summaryRules: [
        ...(currencyCol ? [{ field: currencyCol.key, summary: "sum" }, { field: currencyCol.key, summary: "avg" }] : []),
        ...(selectCol ? [{ field: selectCol.key, summary: "unique" }] : []),
      ],
    } as ViewConfig;
    const renderer = new SummaryRenderer();
    renderer.render(container, rows, config, undefined, { onChange: () => undefined });
    bagKeys = [];

    results.push(provenanceResult(container, "summary-renderer"));
    if (results[0].pass) results.push(...summaryAssertions(container, 3));
  } else if (scenario.renderer === "owned-menu") {
    // The context-menu shell: createOwnedMenu's own entry, rows built through the handle's own
    // addRow the way ColumnMenu builds them. The menu mounts on document.body by design (the
    // module creates it there), so the marker rides the menu element itself and the assertions
    // query the body. On a phone device the showAt placement applies the bottom-sheet chrome.
    const menu = createOwnedMenu(container.ownerDocument, { onClose: () => undefined, title: "Status" });
    menu.addSection("Column");
    menu.addRow({ icon: "arrow-up-down", label: "Sort ascending", selected: true });
    menu.addRow({ icon: "list-filter", label: "Filter on this column", selected: true });
    menu.addRow({ icon: "columns-3", label: "Property type", value: "Select", submenu: true });
    menu.addSeparator();
    menu.addRow({ icon: "copy", label: "Duplicate property" });
    menu.addRow({ icon: "group", label: "Group by this column", disabled: true });
    menu.addRow({ icon: "trash", label: "Delete property", warning: true });
    menu.showAt({ anchor: makeHiddenAnchor(container, "db-owned-menu-anchor") });
    menu.el.setAttribute(PROVENANCE_ATTR, "owned-menu");
    leftoverOwnedMenu = menu;
    bagKeys = [];

    results.push(provenanceResult(menu.el, "owned-menu"));
    if (results[0].pass) {
      results.push(...ownedMenuAssertions(container.ownerDocument, false));
    }
  } else if (scenario.renderer === "cell-editors") {
    // The in-cell editors: the table the shipped TableRenderer builds — its own <td>, carrying
    // only the classes CellRenderer's renderCell decides rather than any this harness applies —
    // then startEdit, the same public entry database-view.ts wires into its editCell action, on
    // the cells the fixture photographs. Each editor gets its own CellRenderer instance because
    // an instance tracks its own open editor, which is what lets one frame hold the markdown
    // text editor and the number line editor at once.
    const columns = makeTableColumns(TABLE_COLUMNS, "mixed");
    const rows = makeTableRows(CAPTURE_ROWS, columns);
    applyCaptureOptions(columns, rows);
    const textCol = columns.find((col) => col.type === "text" && col.key !== "file.name");
    if (textCol) textCol.textRenderMode = "markdown";
    const numberCol = columnOfType(columns, "number") ?? columnOfType(columns, "currency");
    const selectCol = columnOfType(columns, "select");
    const config = makeTableConfig(columns);
    const bag = fileViewTableBag(columns, true);
    bagKeys = Object.keys(bag).sort();
    new TableRenderer(bag).renderTable(container, config, rows);
    const row = rows[0];
    const cellFor = (col?: ColumnDef): HTMLElement | null => (col
      ? container.querySelector<HTMLElement>(`td[data-note-database-column-key="${col.key}"]`)
      : null);
    if (scenario.editorKind === "select") {
      const selectTd = cellFor(selectCol);
      if (selectTd && selectCol) makeCaptureCellRenderer().startEdit(selectTd, row, selectCol);
    } else {
      const textTd = cellFor(textCol);
      if (textTd && textCol) makeCaptureCellRenderer().startEdit(textTd, row, textCol);
      const numberTd = cellFor(numberCol);
      if (numberTd && numberCol) makeCaptureCellRenderer().startEdit(numberTd, row, numberCol);
    }

    results.push(provenanceResult(container, "cell-renderer"));
    if (results[0].pass) results.push(...cellEditorAssertions(container, scenario.editorKind === "select" ? "select" : "text"));
  } else if (scenario.renderer === "date-picker") {
    // The date value picker: renderDateValuePicker builds the trigger, and clicking it fires the
    // module's own open handler — the same tap a device makes — which mounts the popover inside
    // the container.
    const trigger = renderDateValuePicker({
      parent: container,
      value: "2026-08-21T09:30",
      includeTime: Boolean(scenario.includeTime),
      fieldLabel: "Due date",
      onChange: () => undefined,
    });
    trigger.click();
    container.setAttribute(PROVENANCE_ATTR, "date-picker");
    bagKeys = [];

    results.push(provenanceResult(container, "date-picker"));
    if (results[0].pass) results.push(...datePickerAssertions(container, Boolean(scenario.includeTime)));
  } else if (scenario.renderer === "icon-picker") {
    // The icon picker: openIconPickerPopover's own entry. The current token starts with
    // "lucide:", which is what the module reads to open its Icons tab (with the colour strip)
    // instead of Emoji. The panel mounts on document.body, so the marker rides the container the
    // anchor lives in and the assertions query the body.
    const anchor = makeHiddenAnchor(container, "db-icon-picker-anchor");
    leftoverIconPickerClose = openIconPickerPopover({
      anchor,
      current: "lucide:x@blue",
      label: "Icon",
      onSelect: async () => undefined,
      onConfigureField: () => undefined,
    });
    container.setAttribute(PROVENANCE_ATTR, "icon-picker");
    bagKeys = [];

    results.push(provenanceResult(container, "icon-picker"));
    if (results[0].pass) {
      const popover = container.ownerDocument.querySelector(".db-icon-picker-popover");
      results.push({
        name: "the picker opened on its Icons tab with the colour strip",
        pass: Boolean(popover?.querySelector(".db-icon-picker-colors"))
          && Boolean(popover?.querySelector(".db-icon-picker-grid")),
        detail: popover ? "Icons tab, colour strip and icon grid present" : "no .db-icon-picker-popover on the body",
      });
    }
  } else if (scenario.renderer === "color-picker") {
    // The option colour picker: openOptionColorPicker's own entry, opened with the current
    // colour that rings the matching swatch. Mounts on document.body like the icon picker.
    const anchor = makeHiddenAnchor(container, "db-color-picker-anchor");
    openOptionColorPicker(anchor, "blue", () => undefined);
    container.setAttribute(PROVENANCE_ATTR, "color-picker");
    bagKeys = [];

    results.push(provenanceResult(container, "color-picker"));
    if (results[0].pass) {
      const popup = container.ownerDocument.querySelector(".db-color-picker-popup");
      results.push({
        name: "the colour picker drew its sixteen swatches with the current one selected",
        pass: Boolean(popup) && popup.querySelectorAll(".db-color-picker-swatch").length === 16
          && Boolean(popup?.querySelector(".db-color-picker-swatch.is-selected")),
        detail: popup ? `${popup.querySelectorAll(".db-color-picker-swatch").length} swatch(es)` : "no .db-color-picker-popup",
      });
    }
  } else if (scenario.renderer === "relation-values") {
    // The relation chips: renderRelationValue's own entry with no App, which is the module's
    // documented no-vault mode where every target renders as resolved — the unresolved state
    // needs a live metadata cache and stays fixture-only.
    const row = makeBoardRows(1, [{
      key: "file.name", label: "Name", type: "text",
    } as ColumnDef], 1, 1)[0];
    renderRelationValue(container, undefined, row, ["[[Design tooling]]", "[[Q3 budget]]"]);
    container.setAttribute(PROVENANCE_ATTR, "relation-value-renderer");
    bagKeys = [];

    results.push(provenanceResult(container, "relation-value-renderer"));
    if (results[0].pass) results.push(multiMarkerAssertion(container,
      [".db-relation-values", ".db-relation-link", ".db-relation-link-label"], "the relation chips rendered"));
  } else if (scenario.renderer === "file-fields") {
    // The file pseudo-columns: renderSpecialFileFieldValue's own dispatch for file.tags and the
    // link-list key, over a real table row. The per-tag remove buttons render only when the
    // context asks for them, the same writable-cell shape the table passes.
    const columns = makeTableColumns(TABLE_COLUMNS, "mixed");
    const rows = makeTableRows(TABLE_ROWS, columns);
    applyCaptureOptions(columns, rows);
    const table = container.createEl("table", { cls: "db-table" });
    const rowEl = table.createEl("tbody").createEl("tr");
    const fileCol: ColumnDef = { key: "file.tags", label: "Tags", type: "text" } as ColumnDef;
    const linkCol: ColumnDef = { key: "file.links", label: "Outlinks", type: "text" } as ColumnDef;
    const tagsTd = rowEl.createEl("td");
    renderSpecialFileFieldValue(tagsTd, undefined, rows[0], fileCol, ["design", "saas"], { onRemoveTag: () => undefined });
    const linksTd = rowEl.createEl("td");
    renderSpecialFileFieldValue(linksTd, undefined, rows[0], linkCol, ["[[Design tooling]]", "[[Q3 budget]]"]);
    container.setAttribute(PROVENANCE_ATTR, "file-field-renderer");
    bagKeys = [];

    results.push(provenanceResult(container, "file-field-renderer"));
    if (results[0].pass) {
      results.push(multiMarkerAssertion(container,
        [".db-file-tags .status-badge.db-file-tag-badge", ".db-file-link-list .internal-link"],
        "the file tags and link list rendered"));
    }
  } else if (scenario.renderer === "number-display") {
    // The three number display styles: renderRating/renderProgress/renderProgressRing's own
    // entries into a table of rows, one style per row the way the cell renderer calls them.
    const table = container.createEl("table", { cls: "db-table" });
    const tbody = table.createEl("tbody");
    const styleRow = (label: string, build: (td: HTMLElement) => void): void => {
      const tr = tbody.createEl("tr");
      tr.createEl("td", { text: label });
      const valueTd = tr.createEl("td", { cls: "db-numeric-value" });
      build(valueTd);
    };
    styleRow("Rating", (td) => renderRating(td, 62.5));
    styleRow("Rating outline", (td) => renderRating(td, 40, { ratingStyle: "outline" }));
    styleRow("Rating emoji", (td) => renderRating(td, 80, { ratingSymbol: "emoji" }));
    styleRow("Progress", (td) => renderProgress(td, 72));
    styleRow("Progress tinted", (td) => renderProgress(td, 34, { color: "orange" }));
    styleRow("Ring", (td) => renderProgressRing(td, 72));
    styleRow("Ring tinted", (td) => renderProgressRing(td, 96, { color: "green" }));
    container.setAttribute(PROVENANCE_ATTR, "number-display-renderer");
    bagKeys = [];

    results.push(provenanceResult(container, "number-display-renderer"));
    if (results[0].pass) {
      results.push(multiMarkerAssertion(container,
        [".db-cell-rating", ".db-cell-progress", ".db-cell-progress-ring", ".db-num-color-orange", ".db-num-color-green"],
        "the rating, progress and ring styles rendered"));
    }
  } else if (scenario.renderer === "record-icon") {
    // The record-icon gutter: a real table with showRecordIcon and a real renderRecordIcon bag
    // member, mirroring database-view.ts's wiring. One row carries an emoji token (the variant
    // that needs no icon registry); the others plain text, which is the default fallback the
    // bundle can draw — lucide tokens need Obsidian's getIconIds and degrade to that same
    // fallback here.
    const columns = makeTableColumns(TABLE_COLUMNS, "mixed");
    const rows = makeTableRows(CAPTURE_ROWS, columns);
    applyCaptureOptions(columns, rows);
    const iconKey = columns.find((col) => col.key !== "file.name" && col.type === "text")?.key;
    if (iconKey) {
      const fm = (rows[0] as unknown as { frontmatter: Record<string, unknown> }).frontmatter;
      fm[iconKey] = "☁️";
    }
    const config = {
      ...makeTableConfig(columns),
      showRecordIcon: true,
      recordIconFieldOverrideEnabled: true,
      recordIconField: iconKey,
    } as ViewConfig;
    const bag = fileViewTableBag(columns, true);
    bag.renderRecordIcon = (parent, row, cfg) => renderRecordIcon(
      parent,
      iconKey ? row.frontmatter[iconKey] : undefined,
      { compact: true, editable: true, tooltip: "Icon" },
    );
    bagKeys = Object.keys(bag).sort();
    const renderer = new TableRenderer(bag);
    renderer.renderTable(container, config, rows);

    results.push(provenanceResult(container, "table-renderer"));
    if (results[0].pass) {
      results.push(multiMarkerAssertion(container,
        [".db-record-icon-colgroup", ".db-record-icon.is-compact", ".db-record-icon.is-default", ".db-record-icon-emoji"],
        "the record-icon gutter rendered with its default and emoji variants"));
    }
  } else if (scenario.renderer === "dropdown") {
    // The dropdown popover: openDropdownMenu's own entry, the same call the column manager's
    // add-file-property button makes. The disabled option carries the reason the fixture's
    // tooltip exists to surface.
    const anchor = makeHiddenAnchor(container, "db-dropdown-anchor");
    openDropdownMenu({
      anchor,
      label: "Aggregate",
      options: [
        { value: "sum", text: "Sum", section: "Aggregate" },
        { value: "avg", text: "Average", section: "Aggregate" },
        { value: "rollup", text: "Rollup", section: "Aggregate", disabled: true, disabledReason: "Rollup needs a numeric target field" },
      ],
      value: "sum",
      onChange: () => undefined,
    });
    container.setAttribute(PROVENANCE_ATTR, "dropdown-field");
    bagKeys = [];

    results.push(provenanceResult(container, "dropdown-field"));
    if (results[0].pass) {
      results.push(multiMarkerAssertion(container,
        [".db-dropdown-popover", ".db-dropdown-option.is-selected", ".db-dropdown-option.is-disabled"],
        "the dropdown popover rendered its options with the selected and disabled states"));
    }
  } else if (scenario.renderer === "empty-state") {
    // The no-columns empty card: EmptyStateRenderer.renderCard's own entry. The fixture this
    // supersedes wrapped the card vocabulary in the hero's wrapper — a composite no single
    // renderer emits — so the constructed counterpart is the real card shape with the same copy.
    const renderer = new EmptyStateRenderer();
    renderer.renderCard(container, {
      reason: "no-columns",
      title: "No properties yet",
      message: "Add a property to start describing these notes.",
      actions: [
        { label: "Add property", primary: true, onClick: async () => undefined },
        { label: "Learn more", onClick: async () => undefined },
      ],
    });
    bagKeys = [];

    results.push(provenanceResult(container, "empty-state-renderer"));
    if (results[0].pass) {
      results.push(multiMarkerAssertion(container,
        [".db-empty-card", ".db-empty-card-title", ".db-empty-action.mod-cta"],
        "the empty card rendered with its actions"));
    }
  } else if (scenario.renderer === "column-header") {
    // The column header affordances: the header cells the shipped TableRenderer builds, with
    // ColumnHeaderController.setup wired into the renderer's own setupColumnHeader action — the
    // wiring database-view.ts uses — so the picture is the header the table emits, property-type
    // icon and label included, rather than one this harness drew. One label is long enough to
    // truncate, the state the fixture exists to photograph.
    const columns = makeTableColumns(TABLE_COLUMNS, "mixed");
    const rows = makeTableRows(CAPTURE_ROWS, columns);
    applyCaptureOptions(columns, rows);
    columns[1].label = "A deliberately long column name that must truncate";
    const config = makeTableConfig(columns);
    const controller = new ColumnHeaderController({
      getConfig: () => config,
      ensureColumnOrder: () => undefined,
      showContextMenu: () => undefined,
      sortByColumn: () => undefined,
      saveConfig: () => undefined,
      setUndoLabel: () => undefined,
      refresh: () => undefined,
    } satisfies ColumnHeaderActions);
    // The controller tags the container mid-render and renderTable's own tag replaces it on the
    // way out, so the controller's marker is read where it is written: inside the action the
    // renderer calls.
    const controllerMarks: string[] = [];
    const bag: TableRendererActions = {
      ...fileViewTableBag(columns, true),
      setupColumnHeader: (th, col) => {
        controller.setup(th, col);
        const marker = th.closest(".note-database-container")?.getAttribute(PROVENANCE_ATTR);
        if (marker) controllerMarks.push(marker);
      },
    };
    bagKeys = Object.keys(bag).sort();
    new TableRenderer(bag).renderTable(container, config, rows);

    results.push(provenanceResult(container, "table-renderer"));
    if (results[0].pass) {
      results.push({
        name: "the controller ran inside the renderer's own setupColumnHeader action",
        pass: controllerMarks.includes("column-header-controller"),
        detail: controllerMarks.length
          ? `${controllerMarks.length} header(s) tagged ${controllerMarks[0]}`
          : "no header carried the column-header-controller marker",
      });
      results.push(multiMarkerAssertion(container,
        [".db-column-menu-trigger", ".db-resize-handle", ".db-th-content .db-th-label", ".db-th-content .db-property-icon"],
        "the column headers carry their menu triggers, resize handles and property-type icons"));
    }
  } else if (scenario.renderer === "group-selection-controls") {
    // One role, two remaining views: the whole-group selection box from the gallery and the
    // extensions board's column header, each through its renderer's own grouped entry.
    const columns = makeBoardColumns(BOARD_COLUMNS, "mixed");
    const rows = makeBoardRows(CAPTURE_ROWS, columns, CAPTURE_FILL, BOARD_GROUPS);
    applyCaptureOptions(columns, rows, BOARD_GROUP_FIELD);
    applyCaptureGroupPalette(columns, rows, BOARD_GROUP_FIELD);
    const groups = makeBoardGroups(rows, BOARD_GROUPS);
    const galleryHost = container.createDiv({ cls: "db-group-selection-host" });
    const boardHost = container.createDiv({ cls: "db-group-selection-host" });
    const galleryRenderer = new GalleryRenderer(undefined as unknown as App, fileViewGalleryBag(columns));
    galleryRenderer.renderGrouped(galleryHost, { ...makeBoardConfig(columns), viewType: "gallery" } as ViewConfig,
      groups.map((g) => ({ key: g.key, rows: g.rows, count: g.count })), BOARD_GROUP_FIELD);
    const boardRenderer = new BoardRenderer(undefined as unknown as App, fileViewBoardBag(columns));
    boardRenderer.render(boardHost, {
      ...makeBoardConfig(columns),
      viewType: "board",
      boardExtensionsEnabled: true,
    } as ViewConfig, groups, BOARD_GROUP_FIELD);
    bagKeys = [];

    const markers = [
      ["gallery", galleryHost.getAttribute(PROVENANCE_ATTR)],
      ["board", boardHost.getAttribute(PROVENANCE_ATTR)],
    ];
    results.push({
      name: "both grouped renders mounted through their production entries",
      pass: markers.every(([, marker]) => marker !== null),
      detail: markers.map(([name, marker]) => `${name}:${marker ?? "none"}`).join(", "),
    });
    if (results[0].pass) {
      results.push(multiMarkerAssertion(container,
        [".db-gallery-group-checkbox", ".db-board-column-checkbox"],
        "the whole-group selection boxes rendered in gallery and board"));
    }
  } else if (scenario.renderer === "card-covers") {
    // The empty card cover in the two card views: board with its extensions vocabulary and an
    // image field the rows resolve nothing for, gallery with the same — the only cover state a
    // capture without a vault can show.
    const columns = makeBoardColumns(BOARD_COLUMNS, "mixed");
    const rows = makeBoardRows(CAPTURE_ROWS, columns, CAPTURE_FILL, BOARD_GROUPS);
    applyCaptureOptions(columns, rows, BOARD_GROUP_FIELD);
    applyCaptureGroupPalette(columns, rows, BOARD_GROUP_FIELD);
    const groups = makeBoardGroups(rows, BOARD_GROUPS);
    applyEmptyMetadataCache(rows);
    const imageKey = columnOfType(columns, "text")?.key;
    const boardHost = container.createDiv({ cls: "db-cover-host" });
    const galleryHost = container.createDiv({ cls: "db-cover-host" });
    const boardRenderer = new BoardRenderer(undefined as unknown as App, fileViewBoardBag(columns));
    boardRenderer.render(boardHost, {
      ...makeBoardConfig(columns),
      viewType: "board",
      boardExtensionsEnabled: true,
      boardImageField: imageKey,
    } as ViewConfig, groups, BOARD_GROUP_FIELD);
    const galleryRenderer = new GalleryRenderer(undefined as unknown as App, fileViewGalleryBag(columns));
    galleryRenderer.render(galleryHost, {
      ...makeBoardConfig(columns),
      viewType: "gallery",
      galleryImageField: imageKey,
    } as ViewConfig, rows);
    bagKeys = [];

    const markers = [
      ["board", boardHost.getAttribute(PROVENANCE_ATTR)],
      ["gallery", galleryHost.getAttribute(PROVENANCE_ATTR)],
    ];
    results.push({
      name: "both card views mounted through their production entries",
      pass: markers.every(([, marker]) => marker !== null),
      detail: markers.map(([name, marker]) => `${name}:${marker ?? "none"}`).join(", "),
    });
    if (results[0].pass) {
      results.push(multiMarkerAssertion(container,
        [".db-board-card-cover.is-empty .db-board-card-cover-placeholder", ".db-gallery-cover.is-empty .db-gallery-cover-placeholder"],
        "the empty cover rendered in the board card and the gallery card"));
    }
  } else if (scenario.renderer === "table" && scenario.migratedFromList) {
    const columns = makeTableColumns(TABLE_COLUMNS, scenario.captureData ? "mixed" : "text");
    const rows = makeTableRows(scenario.captureData ? CAPTURE_ROWS : TABLE_ROWS, columns);
    if (scenario.captureData) applyCaptureOptions(columns, rows);
    // Built as a list and only ever turned into a table by the production plan/apply pair.
    // The migrated table is the proof; a failed flip fails the marker below.
    const migratedConfig = {
      ...makeTableConfig(columns),
      schema: { columns, computedFields: [] },
      viewType: "list",
    } as ViewConfig;
    const plan = planListMigration(migratedConfig);
    if (plan) applyListMigration(migratedConfig, plan);
    bagKeys = [];

    const bag = scenario.bag === "file-view"
      ? fileViewTableBag(columns, scenario.captureData)
      : embedTableBag(columns, scenario.captureData);
    new TableRenderer(bag).renderTable(container, migratedConfig, rows);

    results.push({
      name: "the migrated list view rendered through the table renderer, not the list renderer",
      pass: !!container.querySelector("table.db-table") && !container.querySelector(".db-list-row"),
      detail: `table.db-table present: ${!!container.querySelector("table.db-table")}, `
        + `.db-list-row present: ${!!container.querySelector(".db-list-row")}, `
        + `plan: ${plan ? `${plan.from}->${plan.to}` : "null"}, `
        + `final viewType: ${migratedConfig.viewType}`,
    });
    if (results[0].pass) {
      results.push(...tableAssertions(container, rows, columns));
    }
  } else {
    // captureData sizes the data as well as typing it, the way it already does for board
    // and gallery. The table has no window, so every row becomes a real <tr>: at the bench's 2000
    // the container measures over 80,000px tall, which no element-mode capture can photograph and
    // which repeats one under-floor control thousands of times in the touch-target lane without
    // saying anything the first row did not. The structural-cost shape stays the lanes' own
    // no-captureData scenarios, which still mount 2000 rows here.
    const columns = makeTableColumns(
      scenario.tableColumnCount ?? TABLE_COLUMNS,
      scenario.captureData ? "mixed" : "text",
    );
    // The footer sits under the last row, and a phone crops the table at its own viewport height:
    // at the capture row count the row the scenario exists to show falls below the fold, so the
    // footer variant takes the shorter set that fits both devices.
    const captureRowCount = scenario.tableFooter ? FOOTER_CAPTURE_ROWS : CAPTURE_ROWS;
    const rows = makeTableRows(scenario.captureData ? captureRowCount : TABLE_ROWS, columns);
    if (scenario.captureData) applyCaptureOptions(columns, rows);
    const currencyCol = columnOfType(columns, "currency") ?? columnOfType(columns, "number");
    const dateCol = columnOfType(columns, "date");
    const selectCols = columns.filter((col) => col.type === "select" || col.type === "status");
    const textCol = columnOfType(columns, "text");
    if (scenario.longHeaderLabel && columns[1]) {
      columns[1].label = "A deliberately long column name that must truncate";
    }
    if (scenario.fullStatusPalette) {
      // The whole sixteen-colour vocabulary: point every option column at one option per colour
      // and give a single multi-select row every value, so one table shows the full range the
      // way the fixture's strip does.
      const colors = ["gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink",
        "red", "slate", "cyan", "teal", "lime", "indigo", "violet", "rose"] as const;
      const palette = colors.map((color, i) => ({ value: `tone-${i}`, color }));
      for (const col of columns) {
        if (col.type === "select" || col.type === "status" || col.type === "multi-select") {
          col.statusOptions = palette;
        }
      }
      const multi = columns.find((col) => col.type === "multi-select");
      if (multi) {
        const row = rows[rows.length - 1];
        const fm = (row as unknown as { frontmatter: Record<string, unknown> }).frontmatter;
        fm[multi.key] = palette.map((option) => option.value);
      }
      for (const col of selectCols) {
        rows.forEach((row, i) => {
          const fm = (row as unknown as { frontmatter: Record<string, unknown> }).frontmatter;
          if (col.key in fm) fm[col.key] = palette[i % palette.length].value;
        });
      }
    }
    const config = {
      ...makeTableConfig(columns),
      // The bench's config shape puts columns at the top level, but the footer, the group
      // divider rows and the peek read the real ViewConfig schema. Supplying it is inert for
      // every renderer path that reads the bench shape instead.
      schema: { columns, computedFields: [] },
      ...(scenario.tableFooter ? {
        summaryRules: [
          ...(currencyCol ? [
            { field: currencyCol.key, summary: "sum" },
            { field: currencyCol.key, summary: "avg" },
          ] : []),
          ...(dateCol ? [{ field: dateCol.key, summary: "earliest" }] : []),
          ...(selectCols[0] ? [{ field: selectCols[0].key, summary: "unique" }] : []),
        ],
      } : {}),
      ...(scenario.recordIconColumn ? {
        showRecordIcon: true,
        recordIconFieldOverrideEnabled: true,
        recordIconField: textCol?.key,
      } : {}),
    } as ViewConfig;
    const bag = scenario.bag === "file-view"
      ? fileViewTableBag(columns, scenario.captureData)
      : embedTableBag(columns, scenario.captureData);
    if (scenario.columnHeaderController) {
      const controller = new ColumnHeaderController({
        getConfig: () => config,
        ensureColumnOrder: () => undefined,
        showContextMenu: () => undefined,
        sortByColumn: () => undefined,
        saveConfig: () => undefined,
        setUndoLabel: () => undefined,
        refresh: () => undefined,
      } satisfies ColumnHeaderActions);
      bag.setupColumnHeader = (th, col) => controller.setup(th, col);
    }
    if (scenario.recordIconColumn) {
      const iconKey = textCol?.key;
      const fm0 = (rows[0] as unknown as { frontmatter: Record<string, unknown> }).frontmatter;
      if (iconKey) fm0[iconKey] = "☁️";
      bag.renderRecordIcon = (parent, row, cfg) => renderRecordIcon(
        parent,
        iconKey ? row.frontmatter[iconKey] : undefined,
        { compact: true, editable: true, tooltip: "Icon" },
      );
    }
    if (scenario.tableGroups) {
      // The grouped table: a two-level tree over the capture rows (a parent group, one child
      // subgroup), with summary rules so the divider rows carry their computed totals. The
      // group field is a real select column whose configured options colour the badges.
      const groupField = selectCols[0]?.key;
      const groupCol = selectCols[0];
      const subField = selectCols[1]?.key;
      const topKeys = [...new Set(rows.map((row) =>
        String((row as unknown as { frontmatter: Record<string, unknown> }).frontmatter[groupField])))];
      if (groupCol) {
        groupCol.statusOptions = topKeys.map((value, i) =>
          ({ value, color: CAPTURE_OPTIONS[i % CAPTURE_OPTIONS.length].color }));
      }
      const top = topKeys[0];
      const topRows = rows.filter((row) =>
        String((row as unknown as { frontmatter: Record<string, unknown> }).frontmatter[groupField]) === top);
      const second = topKeys[1];
      const secondRows = rows.filter((row) =>
        String((row as unknown as { frontmatter: Record<string, unknown> }).frontmatter[groupField]) === second);
      const subGroups: TableGroup[] = subField && topRows.length > 0
        ? [...new Set(topRows.map((row) =>
            String((row as unknown as { frontmatter: Record<string, unknown> }).frontmatter[subField] ?? "")))]
            .filter(Boolean)
            .slice(0, 2)
            .map((key) => {
              const subRows = topRows.filter((row) =>
                String((row as unknown as { frontmatter: Record<string, unknown> }).frontmatter[subField]) === key);
              return { key, rows: subRows, count: subRows.length, depth: 1, field: subField };
            })
        : [];
      const groups: TableGroup[] = [
        { key: top, rows: topRows, count: topRows.length, depth: 0, field: groupField, children: subGroups.length ? subGroups : undefined },
        { key: second, rows: secondRows, count: secondRows.length, depth: 0, field: groupField },
      ].filter((group) => group.key !== "undefined");
      bagKeys = Object.keys(bag).sort();
      const renderer = new TableRenderer(bag);
      renderer.renderGroupedTable(container, config, rows, groups, groupField);

      results.push(provenanceResult(container, "table-renderer"));
      if (results[0].pass) {
        results.push(multiMarkerAssertion(container,
          [".db-grouped-table", "tr.db-group-divider-row", ".db-group-divider-row .status-badge", ".db-group-summary-item"],
          "the grouped table drew its divider rows with badges and summaries"));
      }
      // The grouped table owns no layout-bound assertion: the per-row guards above are
      // calibrated on the flat body loop and the grouped path is the host's shape, not the
      // measured one.
    } else {
      bagKeys = Object.keys(bag).sort();
      if (control === "per-item") armPerItemRead(bag);
      const renderer = new TableRenderer(bag);

      const stopCounting = countRowAppendsToConnectedNodes();
      const stopReads = countLayoutReadsSplit();
      renderer.renderTable(container, config, rows);
      const reads = stopReads();
      const rowAppends = stopCounting();

      results.push(provenanceResult(container, "table-renderer"));
      if (results[0].pass) {
        results.push(...tableAssertions(container, rows, columns));
        if (scenario.tableFooter) {
          results.push(multiMarkerAssertion(container,
            ["tfoot.db-table-footer", ".db-table-footer-trigger.has-calculation", ".db-table-footer-kind"],
            "the footer rendered its calculated aggregates"));
        }
        if (scenario.fullStatusPalette) {
          const badgeColors = new Set(Array.from(container.querySelectorAll<HTMLElement>(
            ".status-badge[data-status-color], .status-badge[class*='status-color-']",
          )).map((el) => [...el.classList].find((cls) => cls.startsWith("status-color-")) || ""));
          results.push({
            name: "the palette spans the sixteen status colours",
            pass: badgeColors.size >= 16,
            detail: `${badgeColors.size} distinct status-color-* class(es) painted`,
          });
        }
        if (scenario.recordIconColumn) {
          results.push(multiMarkerAssertion(container,
            [".db-record-icon-colgroup", ".db-record-icon.is-compact", ".db-record-icon.is-default", ".db-record-icon-emoji"],
            "the record-icon gutter rendered with its default and emoji variants"));
        }
        results.push({
          name: "no row appended to a connected table",
          pass: rowAppends === 0,
          detail: rowAppends === 0
            ? "the row body is built off-document and attached once"
            : `${rowAppends} row(s) appended to a connected table — per-insertion layout is back`,
        });
      // `028` asked for "the per-item forced layout is gone from board-renderer.ts and
      // table-renderer.ts" and recorded that the bound it specified would fail the shipped table,
      // because the table reads per row against a DETACHED body and those reads flush nothing. The
      // bound that survives that distinction is over the connected reads alone — and it is the one
      // that goes red the moment the body is attached before the loop instead of after it, which is
      // the regression the row exists to catch.
      results.push({
        name: "no forced layout inside the row loop",
        pass: reads.connected <= MAX_LAYOUT_READS,
        detail: `${reads.connected} of ${reads.total} layout reads were taken against a connected `
          + `node, bound ${MAX_LAYOUT_READS}, over ${rows.length} rows`
          + (reads.connected > MAX_LAYOUT_READS
            ? " — reads scale with rows against an attached body, which is the shape that froze the app"
            : reads.total > reads.connected
              ? ". The rest land on the detached body the renderer builds before attaching it, and a"
                + " geometry read on a node the engine has never laid out forces no layout — which is"
                + " why the total is allowed to grow and this number is not"
              : ". Both numbers are O(1): the questions that need a box are asked once per render"
                + " rather than once per row"),
      });
      // The connected bound above is the layout-cost guard; this one is the per-item guard, the
      // same contract the other five renderers carry. A per-row read that lands on the detached
      // body costs no layout today, but it is the exact shape that went quadratic the moment the
      // body was attached before the loop — and the count moving with rows is the signal, on the
      // detached body or off it.
      results.push({
        name: "no per-row layout read",
        pass: reads.total <= MAX_LAYOUT_READS,
        detail: `${reads.total} layout reads during render, bound ${MAX_LAYOUT_READS}, over ${rows.length} rows`
          + (reads.total > MAX_LAYOUT_READS
            ? " — reads scale with rows, which is the quadratic shape that froze the app"
            : " (the touch probe and the width question are the legitimate O(1) reads)"),
      });
    }
    }
  }

  // Fires while the container is still attached and styled — a measurement check can inspect the
  // exact DOM the renderer built without re-implementing any of the branches above, and a
  // measurement that ran after this line would be measuring a node already removed from the page.
  if (onMounted) onMounted(container, results);

  container.remove();
  return { scenario, bagKeys, results, chartValueField };
}
