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
// evidence. Board reads 1 against the same bound of 8 with no red on this tree,
// and the table's per-row bound is new here, so both own a switch that
// reintroduces the shape the bound exists to catch.
//
// `RENDER_READ_CONTROL=per-item`, read by the runner and passed into
// `runRenderAssertions`, arms it: the card and row renderers call the bag's
// `applyConditionalFormat` once per item with no target field — field-level
// calls always name the field — and the armed wrapper reads the item's box at
// that call. Board then reads one per card plus the touch probe, the table one
// per row plus its O(1) reads, and the check fails naming the
// scenario; disarmed, each reads its O(1) count.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { TableRenderer, type TableRendererActions } from "../../src/views/table-renderer";
import { applyListMigration, planListMigration } from "../../src/data/list-migration";
import { CellRenderer } from "../../src/views/cell-renderer";
import { CalendarRenderer, type CalendarRendererActions } from "../../archive/deprecated-views/calendar/calendar-renderer";
import { ChartRenderer, type ChartRendererActions } from "../../archive/deprecated-views/chart/chart-renderer";
import {
  CalendarTimelineRenderer,
  type CalendarTimelineRendererActions,
} from "../../archive/deprecated-views/timeline/calendar-timeline-renderer";
import { buildTimelineRangeGeometry } from "../../src/data/calendar-timeline-model";
import { addDateKeyDays, dateKeyDaysBetween, getLocalDateKey, renderNow, setFrozenRenderNow } from "../../src/data/calendar-date-time";
import { ChartToolbarRenderer, type ChartToolbarActions } from "../../src/views/chart-toolbar-renderer";
import { CalendarToolbarRenderer, type CalendarToolbarActions } from "../../src/views/calendar-toolbar-renderer";
import {
  CalendarTimelineToolbarRenderer,
  type CalendarTimelineToolbarActions,
} from "../../src/views/calendar-timeline-toolbar-renderer";
import type { App } from "obsidian";
import type { DataSource } from "../../src/data/data-source";
import type { ColumnDef, RowData, StatusOptionDef, TimelineScale, TitleFileFormat, ViewConfig } from "../../src/data/types";
import { catalogueTableData } from "./catalogue-scenario";
import {
  makeColumns as makeTableColumns,
  makeRows as makeTableRows,
  makeConfig as makeTableConfig,
} from "../bench/table-render-bench";
import { BoardRenderer, type BoardRendererActions } from "../../src/views/board-renderer";
import {
  makeColumns as makeBoardColumns,
  makeRows as makeBoardRows,
  makeGroups as makeBoardGroups,
  makeConfig as makeBoardConfig,
  GROUP_FIELD as BOARD_GROUP_FIELD,
} from "../bench/board-render-bench";
import {
  makeColumns as makeCalendarColumns,
  makeRows as makeCalendarRows,
  makeConfig as makeCalendarConfig,
} from "../../archive/deprecated-views/calendar/calendar-render-bench";
import {
  makeColumns as makeTimelineColumns,
  makeRows as makeTimelineRows,
  makeConfig as makeTimelineConfig,
} from "../../archive/deprecated-views/timeline/timeline-render-bench";
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
import { createDropdownField, openDropdownMenu } from "../../src/views/dropdown-field";
import {
  EmptyStateRenderer,
  EMPTY_STATE_COPY,
  getEmptyStateReason,
  type EmptyStateOptions,
} from "../../src/views/empty-state-renderer";
import { ColumnHeaderController, type ColumnHeaderActions } from "../../src/views/column-header-controller";
import { withEmptyOptionGroups } from "../../src/data/group-visibility";
import type { RowPipelineDiagnostics } from "../../src/data/row-pipeline";
import { t } from "../../src/i18n";
import type { DatabaseConfig, RecordSchema } from "../../src/data/types";
import type { DatabaseViewState } from "../../src/views/view-state-store";
import type { BoardGroup } from "../../src/views/board-renderer";
import type { TableGroup } from "../../src/views/table-renderer";
import { clearRenderedViewRoots } from "../../src/views/rendered-view-roots";

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

// Two genuinely timed events sharing an hour on the same day, so renderWeekTimedEvent splits
// their day column instead of stacking two all-day segments. A Wednesday well inside the bench's
// own February window, matching EVENT_MONTH in calendar-render-bench.ts, so
// calendarWeekStart/calendarDay resolve inside a model the calendar actually builds rather than
// pinning a week the row set never populates.
export const OVERLAP_TIMED_DATE = "2026-02-04";

/** calendarOverlapTimed's fixture: exactly two rows, both `datetime`-timed and both landing on
 *  `OVERLAP_TIMED_DATE`, so `buildCalendarTimedEventLayouts` puts them in the same two-column
 *  overlap `assignTimedColumns` packs — the shape a phone-width overlap column's title has no
 *  room in only exists on this path. */
function makeOverlapTimedRows(): RowData[] {
  return [
    {
      file: { path: "notes/notion-sync.md", basename: "Notion sync", name: "Notion sync.md" },
      frontmatter: { event_date: `${OVERLAP_TIMED_DATE}T14:00`, event_end: `${OVERLAP_TIMED_DATE}T15:30` },
      computed: {},
    },
    {
      file: { path: "notes/q1-renewals-sweep.md", basename: "Q1 renewals sweep", name: "Q1 renewals sweep.md" },
      frontmatter: { event_date: `${OVERLAP_TIMED_DATE}T14:30`, event_end: `${OVERLAP_TIMED_DATE}T15:00` },
      computed: {},
    },
  ] as unknown as RowData[];
}
export const TIMELINE_COLUMNS = 21;
export const TIMELINE_ROWS = 1600;
export const TIMELINE_FILL = 0.3;

// The board card view, at the same shape its bench times. It builds one card per row into a
// single container, which is the arrangement the per-item layout read is dangerous in.
export const BOARD_COLUMNS = 21;
export const BOARD_ROWS = 1600;
export const BOARD_FILL = 0.3;
export const BOARD_GROUPS = 5;

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
  renderer: "list" | "table" | "calendar" | "timeline" | "board" | "chart"
    | "calendar-toolbar" | "timeline-toolbar" | "chart-toolbar"
    | "toolbar" | "active-view-controls" | "active-rule-popover" | "filter-panel" | "sort-panel"
    | "view-config" | "column-manager" | "record-detail" | "record-detail-body" | "record-peek"
    | "column-width-adjuster"
    | "summary" | "owned-menu" | "cell-editors" | "date-picker" | "icon-picker" | "color-picker"
    | "relation-values" | "file-fields" | "number-display" | "record-icon" | "dropdown"
    | "empty-state" | "column-header" | "card-covers";
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
   * Opt-in, renderer "toolbar" only: after the toolbar mounts, clicks one of its own trigger
   * buttons to open the surface it owns — "utilities" clicks the More-tools button
   * (`renderUtilitiesOverflowButton`'s own onclick), "add-view" clicks the view-tab plus button
   * (`showAddViewMenu`'s own onclick), "tab-menu" right-clicks the first view tab, "group" clicks
   * the Group sheet trigger (`renderGroupPopover`'s own onclick) — so the panel a real
   * press opens is the panel measured, not a hand-built stand-in
   * (`showViewTabMenu`'s own oncontextmenu, reading rename/duplicate/remove through the owned-menu
   * primitive). The same anchors a device tap or a right-click reaches; nothing is
   * hand-applied. Undefined leaves the toolbar closed, which is what the plain toolbar
   * scenarios photograph.
   */
  toolbarPopover?: "utilities" | "add-view" | "tab-menu" | "group";
  /**
   * Opt-in, renderer "toolbar" only: the search text `renderSearch` reads from the view state.
   * A non-empty value is what widens the collapsed 28px wrap into its active state and reveals
   * the clear button — the real `DatabaseViewState.searchText` a typed query produces. Defaults
   * to the empty string every state starts with.
   */
  searchText?: string;
  /**
   * Opt-in, renderer "active-view-controls" and "toolbar": which chip groups (or, on the
   * toolbar, which trigger counts) the state carries. "filter" the filter group/count alone,
   * "sort" the sort group/count alone, "both" the shared rail with sort chips first and the
   * AND/OR logic button between the groups, "none" neither — the row absent and both toolbar
   * triggers reporting `add`. Defaults to "both" on "active-view-controls" (the only shape the
   * fixture this supersedes photographs) and to "none" on "toolbar" (its own prior default).
   */
  rules?: "none" | "filter" | "sort" | "both";
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
   * Opt-in, renderer "record-detail" only: how the panel is placed. Defaults to "anchored",
   * which is the affordance that has an element to point at.
   *
   * "docked" is the affordance that has none — a menu item, a card's open button — and it is built
   * the way the view builds it: the pane container standing in as the anchor, because that is what
   * those callers pass for focus return and outside-press containment. The placement is what
   * changes, and the reason this scenario exists is that pointing a panel AT that container is what
   * used to clip it to a strip.
   */
  recordPlacement?: "anchored" | "docked";
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
   * Opt-in, renderer "board" only: sets `boardImageField` to a real schema column the rows
   * resolve no image for, so `renderCover` draws its placeholder cover on every card — the
   * empty-cover state, which is the only one a capture without a vault can show.
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
   * Opt-in, renderer "board" only: after the board mounts, clicks the first column's own
   * column-options button and then the "Manage groups" row it opens — the same two clicks a
   * reader makes, not a hand-built panel. Proves the Groups panel is reachable from the board's
   * own menu rather than only constructible in isolation.
   */
  boardGroupsPanel?: boolean;
  /**
   * Opt-in, renderer "board" only: sets `titleField` to the schema's first currency column
   * (`columnOfType(columns, "currency")`), proving the format routing on the REAL BoardRenderer
   * rather than against hand-written fixture HTML. The card's main name must read that column's
   * own formatted text (`formatEuroCurrency`), not the raw stored number.
   */
  boardTitleFieldCurrency?: boolean;
  /**
   * Opt-in, renderer "board" only, read together with `titleFormat`: overwrites every row's
   * `file.basename`/`file.name` with a numeric string (mirroring the operator's own report — a
   * board card titled "3537.32", the raw file name) so a `titleFormat` choice has a real numeric
   * file name to format. `titleField` stays unset, matching the operator's actual view.
   */
  numericFileNames?: boolean;
  /** Opt-in, renderer "board" only: sets `ViewConfig.titleFormat` — see `numericFileNames`. */
  titleFormat?: TitleFileFormat;
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
   * Opt-in, renderer "table" only, read together with `tableFooter`: forces zero rows through the
   * normal (non-`emptyReason`) body path, so the footer's own zero-row skip is exercised rather
   * than the empty-state card's separate branch. `emptyReason` alone cannot stand in for this —
   * it switches the result branch to `emptyReasonAssertion`, which asserts nothing about the
   * footer.
   */
  tableFooterEmpty?: boolean;
  /**
   * Opt-in, renderer "table" only: configures two sort rules over the constructed columns, so the
   * header's own multi-sort ordinal and `aria-sort` render on a real sorted pair rather than only
   * on the unsorted default every other table scenario mounts.
   */
  tableSortRules?: boolean;
  /**
   * Opt-in, renderer "table" only: replaces the bag's default `setupColumnHeader` stub (which
   * overwrites the header content `renderHeader` just built) with a true no-op, so a header
   * composition assertion reads the icon/label/sort-ordinal structure the renderer itself
   * produced rather than the stub's overwrite.
   */
  tableHeaderNoop?: boolean;
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
   * Opt-in, renderer "calendar" only: `showRecordIcon` plus a real `renderRecordIcon` bag
   * member on one event's row, mirroring the table's own `recordIconColumn` wiring, so a chip
   * with an icon actually exists somewhere in the capture corpus rather than every calendar
   * scenario stubbing the bag member to `() => null`.
   */
  calendarRecordIcon?: boolean;
  /**
   * Opt-in, renderer "calendar" only: mounts with a view config that already carries
   * `calendarColumnSizeMode: "custom"` and this width. The month scale must ignore it and stay
   * seven fluid columns; week and day must honour it. There is no other way to get a
   * custom-width config into a real mount, and a config carried over from week/day is exactly
   * how the seventh month column was clipped off the operator's pane.
   */
  calendarCustomColumnWidth?: number;
  /**
   * Opt-in, renderer "calendar", scale "week"/"day" only: replaces the bench fixture's rows with
   * exactly two genuinely timed events overlapping the same hour on the same day — real
   * `datetime` start and end fields (the bench's own rows are `date`-typed, so they always land
   * in the all-day lane and never exercise `renderWeekTimedEvent`'s overlap-column split at all).
   * A phone-width overlap column's title has nowhere to sit only on this path: two blocks
   * sharing a day column, each halved to `calc(50% - 8px)`, is what a narrow column leaves no
   * room for a title in.
   */
  calendarOverlapTimed?: boolean;
  /**
   * Opt-in, renderer "calendar" only: strips the date field from one bench row so the grid draws
   * a real unscheduled record and the header's "Unscheduled · N" chip has something to count,
   * rather than every calendar capture stubbing that surface to zero rows.
   */
  calendarUnscheduled?: boolean;
  /**
   * Opt-in, renderer "calendar" only: gives one bench row a real end-date field spanning several
   * days, so a multi-day all-day segment actually exists somewhere in the capture corpus instead
   * of every calendar scenario drawing single-day segments alone.
   */
  calendarMultiDay?: boolean;
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
   * A migration that failed to flip the type fails the marker (`table.obnotion-table` present,
   * `.obnotion-list-row` absent) rather than constructing a retired renderer.
   */
  migratedFromList?: boolean;
  /**
   * Opt-in, renderer "dropdown" only: mounts a labelled field rather than the plain `dropdown`
   * scenario's anchored menu, opens it the way a click does, and types into the input its trigger
   * turned into, so the capture shows the combobox mid-filter rather than merely open.
   */
  dropdownSearch?: boolean;
  /**
   * Opt-in, renderer "dropdown" only: mounts a labelled field with a list long enough that its
   * natural height cannot fit beside the anchor at any position in the capture's own viewport,
   * driving `createDropdownField`'s real desktop-sheet escalation rather than the ordinary
   * anchored popover `dropdownSearch` and the plain `dropdown` scenario both show.
   */
  dropdownDesktopSheet?: boolean;
  /**
   * Opt-in, renderer "table" only: mounts a `tools/mock-data` use case's own columns and records
   * instead of the generated bench fixture. The fixture gives every row the same field count and
   * the same value lengths, so no fixture scenario can show a row that grew past its neighbours;
   * the catalogue varies per record, which is the population a row-rhythm measurement needs.
   */
  catalogueUseCase?: string;
  /**
   * Opt-in, renderer "table" only: sets the view's own `wrapText` default, read by every column
   * that carries no wrap override of its own. Used to prove the per-view toggle actually changes
   * what a cell renders, on the same catalogue mount `catalogueUseCase` builds.
   */
  wrapText?: boolean;
  /**
   * Opt-in, renderer "table" only: forces zero rows and drives the real `getEmptyStateReason`
   * predicate over one hand-built `RowPipelineDiagnostics`, varying only the source signal the
   * caller supplies — `"source-missing"` is a configured source that no longer resolves in the
   * vault, `"no-matching-data"` the same empty result from a source that is still there. The
   * predicate decides the reason, not the scenario, so a rule that reads the row count alone is
   * exactly what turns one of these rows red.
   */
  emptyReason?: "source-missing" | "no-matching-data";
  /**
   * Opt-in, renderer "table" only, `catalogueUseCase` required: overwrites the catalogue's own
   * markdown-render column with a value carrying literal newlines, on a column that carries no
   * `wrap` override of its own (follows the view). Proves that a clipped resolution — the view's
   * `wrapText` off, nothing set on the column — still clips a value whose source markdown breaks
   * across lines, rather than reopening the row through a `<br>` a `white-space: nowrap` ancestor
   * cannot stop.
   */
  catalogueMarkdownNewline?: boolean;
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

function fileViewTableBag(columns: ColumnDef[], captureData?: boolean, wrapText?: boolean): TableRendererActions {
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
      ? (td, row, col) => cellRenderer.renderCell(td, row, col, wrapText)
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

function embedTableBag(columns: ColumnDef[], captureData?: boolean, wrapText?: boolean): TableRendererActions {
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
      ? (td, row, col) => cellRenderer.renderCell(td, row, col, wrapText)
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
    hideGroup: () => undefined,
    showGroup: () => undefined,
    setBoardHideEmptyGroups: () => undefined,
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
    hideGroup: () => undefined,
    showGroup: () => undefined,
    setBoardHideEmptyGroups: () => undefined,
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
    th.closest(".obnotion-container")?.setAttribute(PROVENANCE_ATTR, "column-header-controller");
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
    target.closest(".obnotion-container")?.setAttribute(PROVENANCE_ATTR, "cell-renderer");
  };
}

// Armed once at module load, in the browser only: the harness is bundled into
// the render entry and never runs outside it.
tagTableRenders();
tagBoardRenders();
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

// A permanent guard on the header row's composition — Notion's own header carries a type icon, a
// label and a menu target on every column, and ours adds an in-header multi-sort ordinal on top.
// Reading the DOM the header actually built rather than only counting columns: dropping the icon
// call is what this guard exists to catch, and a bare column count would not go red for it.
function headerCompositionAssertions(container: HTMLElement): AssertionResult[] {
  const results: AssertionResult[] = [];
  const headerCells = Array.from(container.querySelectorAll<HTMLElement>(
    "thead th[data-obnotion-column-key]",
  ));
  if (headerCells.length === 0) return results;
  const missingIcon = headerCells.filter((th) => !th.querySelector(".obnotion-property-icon"));
  results.push({
    name: "every column header carries a type icon",
    pass: missingIcon.length === 0,
    detail: missingIcon.length === 0
      ? `${headerCells.length} header(s), each with a .obnotion-property-icon`
      : `${missingIcon.length} of ${headerCells.length} header(s) missing .obnotion-property-icon: `
        + missingIcon.map((th) => th.getAttribute("data-obnotion-column-key")).join(", "),
  });
  const missingLabel = headerCells.filter((th) => !(th.querySelector(".obnotion-th-label")?.textContent || "").trim());
  results.push({
    name: "every column header carries a non-empty label",
    pass: missingLabel.length === 0,
    detail: missingLabel.length === 0
      ? `${headerCells.length} header(s), each with a non-empty .obnotion-th-label`
      : `${missingLabel.length} of ${headerCells.length} header(s) with an empty or missing .obnotion-th-label`,
  });
  const missingAriaSort = headerCells.filter((th) => !th.hasAttribute("aria-sort"));
  results.push({
    name: "every column header declares aria-sort (\"none\" when unsorted)",
    pass: missingAriaSort.length === 0,
    detail: missingAriaSort.length === 0
      ? `${headerCells.length} header(s), each carrying aria-sort`
      : `${missingAriaSort.length} of ${headerCells.length} header(s) missing aria-sort entirely`,
  });
  // The multi-sort ordinal only exists on a scenario that actually configured more than one sort
  // rule (tableSortRules) — vacuously true otherwise, the same shape the calendar/timeline guards
  // above use for a state a given mount may not have put on the page at all.
  const sorted = headerCells.filter((th) => th.getAttribute("aria-sort") !== "none");
  const missingOrdinal = sorted.filter((th) => !th.querySelector(".sort-indicator"));
  results.push({
    name: "a sorted column header carries its ordinal, matching aria-sort",
    pass: sorted.length === 0 || missingOrdinal.length === 0,
    detail: sorted.length === 0
      ? "no sorted column in this scenario, so this asserts nothing"
      : missingOrdinal.length === 0
        ? `${sorted.length} sorted header(s), each with a .sort-indicator ordinal`
        : `${missingOrdinal.length} of ${sorted.length} sorted header(s) missing a .sort-indicator ordinal`,
  });
  return results;
}

// Multi-select chips stack inline in a flex row with a fixed gap between them — the negative
// control this guard exists for is a chip container that has regressed to a block/column stack,
// which a count-only assertion ("N chips exist") would never catch. A clipped table cell forces
// this same container to `flex-wrap: nowrap` on purpose (the wrap-off row-height fix), so this
// checks `display`/`gap` only — the wrap value itself is the view's wrap switch's own question,
// not this guard's. Vacuously true on a scenario with no multi-select values on the page at all.
function chipLayoutAssertions(container: HTMLElement): AssertionResult[] {
  const wrap = Array.from(container.querySelectorAll<HTMLElement>(".obnotion-multi-select-values"))
    .find((el) => el.querySelectorAll(".obnotion-multi-select-badge").length >= 2);
  if (!wrap) {
    return [{
      name: "inline chips stack in a flex row with a 4px gap",
      pass: true,
      detail: "no multi-select cell with two or more values in this scenario, so this asserts nothing",
    }];
  }
  const style = win.getComputedStyle(wrap);
  const pass = style.display === "flex" && style.columnGap === "4px";
  return [{
    name: "inline chips stack in a flex row with a 4px gap",
    pass,
    detail: `display="${style.display}" columnGap="${style.columnGap}" (want flex/4px)`,
  }];
}

// Two rows carrying two different configured option values must paint two different badge
// colours — grouped by the option's own text rather than by the rendered data-status-color
// attribute, because the exact regression this guard exists for (every option resolving to one
// forced colour) collapses that attribute right along with the paint, which a grouping keyed on
// the attribute would silently read as "nothing to compare" instead of a failure. Vacuously true
// when the scenario has fewer than two distinct option values on the page at all.
function pillColorAssertions(container: HTMLElement): AssertionResult[] {
  const badges = Array.from(container.querySelectorAll<HTMLElement>(
    "td[data-obnotion-column-key] .status-badge[data-status-color]",
  ));
  const byValue = new Map<string, HTMLElement>();
  for (const badge of badges) {
    const value = (badge.textContent || "").trim();
    if (value && !byValue.has(value)) byValue.set(value, badge);
  }
  const distinct = Array.from(byValue.entries());
  if (distinct.length < 2) {
    return [{
      name: "two rows with different option values compute different badge colours",
      pass: true,
      detail: `${distinct.length} distinct option value(s) on the page, so this asserts nothing`,
    }];
  }
  const [[firstValue, first], [secondValue, second]] = distinct;
  const firstBg = win.getComputedStyle(first).backgroundColor;
  const secondBg = win.getComputedStyle(second).backgroundColor;
  return [{
    name: "two rows with different option values compute different badge colours",
    pass: firstBg !== secondBg,
    detail: `"${firstValue}" resolved ${firstBg}, "${secondValue}" resolved ${secondBg}`,
  }];
}

// The conditional-format tint is a CSS variable set on the row, painted through a td selector —
// setting the variable on a tr and reading nothing on its own td is the exact failure a digest
// once misread as "the feature does not exist". Applied directly (not through the harness's own
// no-op applyConditionalFormat bag member, which only proves the renderer calls the action at the
// right time) so this reads the shipped stylesheet's own paint rule rather than the call site.
function conditionalTintAssertions(container: HTMLElement, rows: RowData[]): AssertionResult[] {
  const dataRows = Array.from(container.querySelectorAll<HTMLElement>("tr[data-obnotion-row-path]"));
  if (dataRows.length < 2) {
    return [{
      name: "a row's conditional-format tint paints on its td backgrounds, not only the tr",
      pass: true,
      detail: `${dataRows.length} data row(s) in this scenario, need at least two to compare`,
    }];
  }
  const [tinted, plain] = dataRows;
  const probeColor = "rgb(1, 2, 3)";
  const tintedTd = tinted.querySelector<HTMLElement>("td[data-obnotion-column-key]");
  const plainTd = plain.querySelector<HTMLElement>("td[data-obnotion-column-key]");
  // `.obnotion-table td` transitions its own background-color, so a read taken in the same tick as the
  // class/variable change would report the pre-change value — the transition has not advanced a
  // single frame yet. Suspending the transition on the one cell being probed makes the change
  // land synchronously, which is what this assertion actually needs to measure.
  tintedTd?.style.setProperty("transition", "none");
  tinted.addClass("obnotion-conditional-format");
  tinted.style.setProperty("--obnotion-conditional-format-bg", probeColor);
  const tintedBg = tintedTd ? win.getComputedStyle(tintedTd).backgroundColor : "";
  const plainBg = plainTd ? win.getComputedStyle(plainTd).backgroundColor : "";
  tinted.removeClass("obnotion-conditional-format");
  tinted.style.removeProperty("--obnotion-conditional-format-bg");
  tintedTd?.style.removeProperty("transition");
  return [{
    name: "a row's conditional-format tint paints on its td backgrounds, not only the tr",
    pass: Boolean(tintedTd) && Boolean(plainTd) && tintedBg === probeColor && plainBg !== probeColor,
    detail: `tinted row's td resolved ${tintedBg || "(no cell found)"}, an untinted row's td resolved `
      + `${plainBg || "(no cell found)"}, want ${probeColor} on the first and anything else on the second `
      + `(${rows.length} row(s) total)`,
  }];
}

function tableAssertions(
  container: HTMLElement,
  rows: RowData[],
  columns: ColumnDef[],
): AssertionResult[] {
  const results: AssertionResult[] = [];
  const rowEls = Array.from(container.querySelectorAll<HTMLElement>("tr[data-obnotion-row-path]"));
  const cellsPerRow = rowEls.map((row) => row.querySelectorAll<HTMLElement>("td[data-obnotion-column-key]").length);
  const cellIndexes = rowEls.map((row) => {
    const cell = row.querySelector<HTMLTableCellElement>('[data-obnotion-column-key="field1"]');
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
  results.push(...chipLayoutAssertions(container));
  results.push(...pillColorAssertions(container));
  results.push(...conditionalTintAssertions(container, rows));
  results.push({
    name: "selection checkbox affordance is one per row",
    pass: container.querySelectorAll("td.obnotion-select-col").length === rows.length,
    detail: `${container.querySelectorAll("td.obnotion-select-col").length} selection cells for ${rows.length} rows`,
  });
  return results;
}

// The pair `getEmptyStateReason` has to keep apart, held one variable apart: identical zero-row
// diagnostics, differing only in whether the caller found the configured source still in the vault.
// The predicate decides which reason comes back, so a rule that reads the row count alone — the
// shape that reports a brand-new empty database as a source the user lost — fails whichever of the
// two rows it collapses into the other.
function buildEmptyReasonOptions(kind: "source-missing" | "no-matching-data"): EmptyStateOptions {
  const diagnostics: RowPipelineDiagnostics = {
    sourceCount: 0, postSearchCount: 0, postFilterCount: 0, postLimitCount: 0, visibleCount: 0,
    hasActiveSearch: false, hasActiveFilters: false, hasActiveLimit: false,
  };
  const reason = getEmptyStateReason(diagnostics, kind === "source-missing");
  const copy = EMPTY_STATE_COPY[reason];
  return {
    reason,
    title: t(copy.title),
    message: t(copy.body),
    actions: reason === "source-missing"
      ? [{ label: t("emptyState.chooseDatabase"), icon: "database", primary: true, onClick: () => undefined }]
      : undefined,
  };
}

// Reading a zero-row source as one cause regardless of whether it still resolves is exactly what
// turns this red: the two scenarios that read this assertion share one predicate and one set of
// diagnostics, so a collapse in either direction fails the row whose expectation it broke.
function emptyReasonAssertion(container: HTMLElement, expected: "source-missing" | "no-matching-data"): AssertionResult {
  const el = container.querySelector<HTMLElement>("[data-empty-reason]");
  const actual = el?.getAttribute("data-empty-reason") ?? null;
  return {
    name: `the empty table renders the "${expected}" reason, not a collapsed neighbour`,
    pass: actual === expected,
    detail: `data-empty-reason="${actual}" (want "${expected}")`,
  };
}

// Both date-driven views draw a window rather than the whole row set, so "rows rendered" is the
// wrong question for them and a count of zero is the failure that matters. A window that drew
// nothing satisfies every per-item bound trivially — no items, no per-item work — which would
// make a silent fixture break read as a clean pass. Each suite therefore establishes that the
// view drew something before any bound below it is worth reading.

// The card views render one card per row with no window, so unlike the two date-driven views
// their drawn count is the row count and a shortfall is a real failure rather than a fixture slip.

/**
 * Reads every drawn card's `.obnotion-kanban-card-title` text and checks it carries the
 * format's own currency mark (a euro/dollar/pound formatter always includes one) and never
 * equals the value's raw, unformatted stringification — the defect the operator's screenshot
 * showed ("3537.32" as a card's main name).
 */
function boardCardTitleFormatAssertion(
  container: HTMLElement,
  rawValues: string[],
  mark: string,
  name: string,
): AssertionResult {
  const titles = Array.from(container.querySelectorAll<HTMLElement>(".obnotion-kanban-card-title"))
    .map((el) => (el.textContent || "").trim());
  const unmarked = titles.filter((text) => !text.includes(mark));
  const stillRaw = titles.filter((text) => rawValues.includes(text));
  return {
    name,
    pass: titles.length > 0 && unmarked.length === 0 && stillRaw.length === 0,
    detail: `${titles.length} card title(s) drawn; ${unmarked.length} missing "${mark}", `
      + `${stillRaw.length} still reading a raw unformatted value`
      + (stillRaw.length ? `: ${JSON.stringify(stillRaw.slice(0, 3))}` : "")
      + (titles.length ? ` (sample: ${JSON.stringify(titles.slice(0, 3))})` : ""),
  };
}

function boardAssertions(container: HTMLElement, rows: RowData[], groups: BoardGroup[]): AssertionResult[] {
  const results: AssertionResult[] = [];
  // The default board (boardExtensionsEnabled unset) renders the Anytype-shaped
  // obnotion-kanban-* vocabulary, not the local extension classes; probe that
  // vocabulary rather than opting the scenario into the extensions.
  const cards = container.querySelectorAll<HTMLElement>(".obnotion-kanban-card").length;
  const columns = container.querySelectorAll<HTMLElement>(".obnotion-kanban-col").length;

  // The kanban page limit is 10 per column, applied at board-renderer.ts's own render call
  // rather than through the shared config field every other view's own default still reads
  // as unlimited.
  // A group under the limit shows every row; one at or over it shows exactly 10.
  const expectedCards = groups.reduce((sum, group) => sum + Math.min(group.rows.length, 10), 0);
  results.push({
    name: "every row becomes a card, up to the kanban page limit",
    pass: cards === expectedCards,
    detail: `${cards} cards for ${rows.length} rows across ${groups.length} groups, want ${expectedCards}`,
  });
  results.push({
    name: "the board drew its columns",
    pass: columns === BOARD_GROUPS,
    detail: `${columns} columns, want ${BOARD_GROUPS}`,
  });
  return results;
}

function calendarAssertions(container: HTMLElement, scenario: ScenarioSpec): AssertionResult[] {
  const results: AssertionResult[] = [];
  const dayCells = container.querySelectorAll<HTMLElement>(".obnotion-calendar-day").length;

  // The unscheduled surface is a header chip, never a band above the grid: this class named a
  // full-width drawer element that no longer exists anywhere in the renderer's output, on any
  // scenario — a regression that reintroduced it would still pass every check above.
  const drawerBands = container.querySelectorAll<HTMLElement>(".obnotion-calendar-backlog").length;
  results.push({
    name: "no unscheduled band renders above the grid",
    pass: drawerBands === 0,
    detail: `${drawerBands} .obnotion-calendar-backlog element(s), want 0`,
  });

  // The chip is present exactly when the scenario put an unscheduled row in the data, and absent
  // otherwise — never a band with nothing to hold, never a hidden-but-present control either.
  const chip = container.querySelector<HTMLElement>(".obnotion-calendar-unscheduled-chip");
  const wantsChip = Boolean(scenario.calendarUnscheduled);
  results.push({
    name: "the unscheduled chip's presence matches whether any row is undated",
    pass: wantsChip ? Boolean(chip) : !chip,
    detail: wantsChip
      ? (chip ? `present: "${(chip.textContent || "").trim()}"` : "absent, but the scenario put an unscheduled row in the data")
      : (chip ? `present ("${(chip.textContent || "").trim()}"), but every row in this scenario carries a date` : "absent, as expected with zero unscheduled rows"),
  });

  // A multi-day segment's title can flex-grow to fill the whole spanning box when nothing bounds
  // it, stranding the date range at the segment's far edge instead of right after the title — the
  // defect an operator screenshot showed as a centred/detached range. Bound the gap between them
  // rather than an exact pixel, since the title's own width varies with its text.
  const spanning = Array.from(container.querySelectorAll<HTMLElement>(".obnotion-calendar-month-segment"))
    .filter((segment) => segment.querySelector(":scope > .obnotion-calendar-month-dates"));
  const detached: string[] = [];
  for (const segment of spanning) {
    const title = segment.querySelector<HTMLElement>(":scope > .obnotion-calendar-month-title");
    const dates = segment.querySelector<HTMLElement>(":scope > .obnotion-calendar-month-dates");
    if (!title || !dates) continue;
    const titleBox = title.getBoundingClientRect();
    const datesBox = dates.getBoundingClientRect();
    if (titleBox.width === 0 || datesBox.width === 0) continue;
    const gap = Math.round(datesBox.left - titleBox.right);
    if (gap > 20) detached.push(`"${(title.textContent || "").trim()}" ${gap}px before its own date range`);
  }
  results.push({
    name: "a multi-day chip's date range sits right after its title, not stranded at the segment's far edge",
    pass: spanning.length === 0 || detached.length === 0,
    detail: spanning.length === 0
      ? "no multi-day (ranged) segment in this scenario, so this asserts nothing"
      : `${spanning.length} ranged segment(s), ${detached.length} with the range detached from its title`
        + (detached.length ? `: ${detached.join("; ")}` : ""),
  });
  const segments = container.querySelectorAll<HTMLElement>(
    ".obnotion-calendar-month-segment, .obnotion-calendar-week-allday-segment, .obnotion-calendar-timed-event",
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
  const rows = Array.from(container.querySelectorAll<HTMLElement>(".obnotion-calendar-month-week"));
  const escaped: string[] = [];
  let bars = 0;
  for (const row of rows) {
    const rowBox = row.getBoundingClientRect();
    if (rowBox.width === 0) continue;
    for (const bar of Array.from(row.querySelectorAll<HTMLElement>(".obnotion-calendar-month-segment"))) {
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
  const dayCols = container.querySelectorAll<HTMLElement>(".obnotion-calendar-week-day-col").length;
  const segments = container.querySelectorAll<HTMLElement>(
    ".obnotion-calendar-week-allday-segment, .obnotion-calendar-week-timed-event",
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
  const roots = container.querySelectorAll<HTMLElement>(".obnotion-chart").length;
  const empties = container.querySelectorAll<HTMLElement>(".obnotion-chart-empty, .obnotion-chart-number").length;
  const canvases = container.querySelectorAll<HTMLElement>(".obnotion-chart-canvas").length;
  const titles = Array.from(container.querySelectorAll<HTMLElement>(".obnotion-chart-title"))
    .filter((el) => (el.textContent || "").trim().length > 0).length;

  results.push({
    name: "the chart drew its root exactly once",
    pass: roots === 1 && empties === 0,
    detail: `${roots} .obnotion-chart root(s) and ${empties} empty/number state(s), want 1 and 0`,
  });
  results.push({
    name: "the chart drew its canvas",
    pass: canvases === 1,
    detail: `${canvases} .obnotion-chart-canvas element(s), want 1`,
  });
  results.push({
    name: "the chart drew a non-empty title",
    pass: titles === 1,
    detail: `${titles} non-empty .obnotion-chart-title element(s), want 1`,
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
// obnotion-subtask-* markup: `.pm-collapse-toggle` for the expand/collapse control, `.pm-gantt-label-progress`
// for the percentage chip, and no depth attribute at all — depth is an inline `padding-left` on
// `.pm-gantt-label-row`, matched here as the tallest indent exceeding the shallowest row's own.
// `.pm-gantt-label-progress` alone is not specific to a subtask: the timeline bench's own
// per-row fixture (`timeline-render-bench.ts`, `i % 4 === 0`) gives every fourth row, including
// row 0, a genuine progress value (60%) independent of `subtaskTree`. `applyCaptureSubtaskTree`
// overwrites that same row's progress to 62% (a value the bench fixture never produces on its
// own), so matching that exact text distinguishes the synthetic subtask aggregation from the
// bench's own unrelated progress fixture.
function subtaskTreeAssertion(container: HTMLElement, kind: "board" | "timeline"): AssertionResult {
  const toggle = container.querySelector(kind === "board" ? ".obnotion-subtask-toggle" : ".pm-collapse-toggle");
  const progress = kind === "board"
    ? container.querySelector(".obnotion-subtask-progress")
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
  const grid = container.querySelectorAll(".obnotion-calendar").length;
  const pass = Boolean(card) && grid === 0;
  return {
    name: "the calendar drew its no-date-field empty state",
    pass,
    detail: card
      ? `data-empty-reason="no-date-field" present, ${grid} .obnotion-calendar grid(s) (want 0)`
      : "no [data-empty-reason=\"no-date-field\"] element — the empty state never rendered",
  };
}

function chartVariantAssertion(container: HTMLElement, variant: "number" | "empty"): AssertionResult {
  const selector = variant === "number" ? ".obnotion-chart-number" : ".obnotion-chart-empty";
  const present = container.querySelectorAll(selector).length;
  return {
    name: `the chart drew its ${variant} state`,
    pass: present === 1,
    detail: `${present} ${selector} element(s), want 1`,
  };
}

/** The chart's empty state renders through the shared EmptyStateRenderer card with its action
 *  preserved, and none of the retired private obnotion-chart-empty-icon/-text/-action vocabulary
 *  remains — the outer .obnotion-chart-empty structural wrapper is unaffected and asserted separately
 *  by chartVariantAssertion. */
function chartEmptyAbsorptionAssertion(container: HTMLElement): AssertionResult {
  const card = container.querySelector(".obnotion-chart-empty .obnotion-empty-card");
  const action = container.querySelector(".obnotion-chart-empty .obnotion-empty-action");
  const retired = container.querySelectorAll(
    ".obnotion-chart-empty-icon, .obnotion-chart-empty-text, .obnotion-chart-empty-action"
  ).length;
  const pass = Boolean(card) && Boolean(action) && retired === 0;
  return {
    name: "the chart's empty state renders the shared card with its action, and no retired chart-empty markup",
    pass,
    detail: `.obnotion-empty-card present: ${Boolean(card)}, .obnotion-empty-action present: ${Boolean(action)}, `
      + `retired obnotion-chart-empty-icon/-text/-action element(s): ${retired} (want 0)`,
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
export function columnOfType(columns: ColumnDef[], type: ColumnDef["type"]): ColumnDef | undefined {
  return columns.find((col) => col.key !== "file.name" && col.type === type);
}

/** The view state every toolbar/panel surface reads, with the given members overlaid. */
export function makeSurfaceState(overrides: Partial<DatabaseViewState> = {}): DatabaseViewState {
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
export function makeSurfaceDatabase(columns: ColumnDef[], view: ViewConfig): DatabaseConfig {
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
export function makeToolbarActions(): ToolbarActions {
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
    setHiddenColumns: () => undefined,
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
  const tabs = container.querySelectorAll(".obnotion-view-tab").length;
  results.push({
    name: "the toolbar drew its view tabs and clusters",
    pass: Boolean(container.querySelector(".obnotion-toolbar")) && tabs > 0
      && Boolean(container.querySelector(".obnotion-toolbar-right")),
    detail: `${tabs} view tab(s), query/properties/utilities/creation clusters `
      + `${container.querySelectorAll(".obnotion-toolbar-cluster").length} present`,
  });
  if (scenario.toolbarPopover === "utilities") {
    results.push(toolbarPopoverAssertion(container, ".obnotion-toolbar-utilities-popover"));
  }
  if (scenario.toolbarPopover === "add-view") {
    results.push(toolbarPopoverAssertion(container, ".obnotion-add-view-popover"));
  }
  if (scenario.toolbarPopover === "tab-menu") {
    // The view tab's context menu is `showViewTabMenu`'s own owned menu, not the hand-built
    // "obnotion-view-tab-popover" shell every other toolbar surface still opens — the componentization
    // leg that moved this one surface onto the shared primitive. Every `createOwnedMenu` mounts on
    // `doc.body`, a sibling of `container` rather than a descendant of it, so this reads the
    // document the same way every other owned-menu assertion here does.
    const panel = container.ownerDocument.querySelector(".obnotion-owned-menu");
    results.push({
      name: "right-clicking a view tab opens its context menu through the owned-menu primitive",
      pass: Boolean(panel),
      detail: panel ? `classes=${panel.className}` : "no owned menu mounted on contextmenu",
    });
    const rowLabels = Array.from(panel?.querySelectorAll(".obnotion-menu-item-label") ?? [])
      .map((row) => row.textContent?.trim() ?? "");
    const hasRename = rowLabels.some((label) => label.includes("Rename"));
    const hasDuplicate = rowLabels.some((label) => /duplicate|copy/i.test(label));
    const hasRemove = rowLabels.some((label) => /delete|remove/i.test(label));
    results.push({
      name: "the tab context menu offers rename, duplicate and remove through the shared row builder",
      pass: hasRename && hasDuplicate && hasRemove,
      detail: `rows: ${rowLabels.join(" | ") || "none"}`,
    });
    const deleteRow = Array.from(panel?.querySelectorAll<HTMLElement>(".obnotion-menu-item") ?? [])
      .find((row) => /delete|remove/i.test(row.querySelector(".obnotion-menu-item-label")?.textContent ?? ""));
    results.push({
      name: "the destructive row carries the primitive's warning tone, not a bespoke danger class",
      pass: Boolean(deleteRow?.classList.contains("is-warning")),
      detail: deleteRow ? `classes=${deleteRow.className}` : "no delete row found",
    });
  }
  if (scenario.toolbarPopover === "group") {
    results.push(toolbarPopoverAssertion(container, ".obnotion-group-popover"));
  }
  if (scenario.searchText) {
    const active = container.querySelector(".obnotion-search-control.is-active");
    const hasText = container.querySelector<HTMLInputElement>(".obnotion-search-input")?.value === scenario.searchText;
    results.push({
      name: "the search control widened for its text",
      pass: Boolean(active) && hasText,
      detail: active ? `is-active present, input holds "${scenario.searchText}"`
        : "the search wrap stayed collapsed despite the state's search text",
    });
  }
  const rules = scenario.rules ?? "none";
  const wantFilterActive = rules === "filter" || rules === "both";
  const wantSortActive = rules === "sort" || rules === "both";
  const filterState = container.querySelector<HTMLElement>(".obnotion-filter-btn")?.getAttribute("data-control-state");
  const sortState = container.querySelector<HTMLElement>(".obnotion-sort-btn")?.getAttribute("data-control-state");
  results.push({
    name: `filter and sort triggers declare add versus active from their counts (rules=${rules})`,
    pass: filterState === (wantFilterActive ? "active" : "add") && sortState === (wantSortActive ? "active" : "add"),
    detail: `filter=${filterState ?? "missing"}, sort=${sortState ?? "missing"}, want `
      + `${wantFilterActive ? "active" : "add"}/${wantSortActive ? "active" : "add"} on rules=${rules}`,
  });
  // The stamp moved with the live trigger: the settings entry is the permanent gear button now,
  // not "···". `openViewSettingsAfterMutation`'s two `.obnotion-view-config-btn` anchor-fallback
  // queries still need to resolve to something live, which is what this asserts.
  const settingsBtn = container.querySelector(".obnotion-toolbar-settings-btn");
  const fallbacks = ["obnotion-view-config-btn", "obnotion-chart-options-toolbar-btn", "obnotion-calendar-timeline-options-toolbar-btn"]
    .filter((cls) => settingsBtn?.classList.contains(cls));
  results.push({
    name: "the live settings trigger still resolves the older settings-anchor queries",
    pass: fallbacks.length === 3,
    detail: settingsBtn ? `fallback classes present: ${fallbacks.join(", ") || "none"}` : "no settings trigger",
  });
  if (scenario.toolbarPopover === "utilities" || scenario.toolbarPopover === "add-view" || scenario.toolbarPopover === "group") {
    const panel = container.querySelector(".obnotion-toolbar-utilities-popover, .obnotion-add-view-popover, .obnotion-group-popover");
    results.push({
      name: "an opened toolbar menu is built through the shared popover shell",
      pass: Boolean(panel?.classList.contains("obnotion-toolbar-popover")),
      detail: panel ? `classes=${panel.className}` : "no opened toolbar menu",
    });
  }
  return results;
}

function chipRailAssertions(container: HTMLElement, scenario: ScenarioSpec): AssertionResult[] {
  const results: AssertionResult[] = [];
  const rail = container.querySelector(".obnotion-active-view-controls");
  const chips = container.querySelectorAll(".obnotion-active-control-chip").length;
  if (scenario.rules === "none") {
    results.push({
      name: "the rail is absent entirely when neither a filter nor a sort is active",
      pass: chips === 0,
      detail: rail
        ? `${chips} chip(s) still drew with no active rule — the row must be absent, not just empty`
        : "no chip rail mounted, none active",
    });
    return results;
  }
  results.push({
    name: "the active-view-controls rail drew its chips",
    pass: Boolean(rail) && chips > 0,
    detail: `${chips} chip(s) in ${container.querySelectorAll(".obnotion-active-control-group").length} group(s)`,
  });
  if (scenario.rules !== "sort") {
    results.push({
      name: "two filters show the AND/OR logic button",
      pass: Boolean(container.querySelector(".obnotion-active-control-logic")),
      detail: container.querySelector(".obnotion-active-control-logic") ? "logic button present"
        : "logic button missing — the filter group renders it only when more than one rule is effective",
    });
  }
  if (scenario.rules !== "filter") {
    results.push({
      name: "a sort chip carries the direction as a word, not only an arrow",
      pass: Boolean(container.querySelector(".obnotion-active-control-direction")),
      detail: container.querySelector(".obnotion-active-control-direction")
        ? "direction word present"
        : "no direction word — the rail used to show an ordinal only",
    });
  }
  const expectedAddControls = (scenario.rules !== "sort" ? 1 : 0) + (scenario.rules !== "filter" ? 1 : 0);
  const addControls = container.querySelectorAll(".obnotion-active-control-add").length;
  results.push({
    name: "each active rule group carries its own add control, wired to the actions bag's addFilter/addSort",
    pass: addControls === expectedAddControls,
    detail: `${addControls} add control(s), want ${expectedAddControls}`,
  });
  return results;
}

function activeRulePopoverAssertions(container: HTMLElement, kind: "filter" | "sort"): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = container.querySelector(".obnotion-active-rule-popover");
  const fieldDropdown = container.querySelector(kind === "filter"
    ? ".obnotion-filter-field-dropdown" : ".obnotion-sort-field-dropdown");
  const valueDropdown = container.querySelector(kind === "filter"
    ? ".obnotion-filter-value-dropdown" : ".obnotion-sort-direction-dropdown");
  results.push({
    name: `the active-rule popover opened its ${kind} single-rule editor`,
    pass: Boolean(panel) && Boolean(fieldDropdown) && Boolean(valueDropdown),
    detail: [panel && "panel", fieldDropdown && "field dropdown", valueDropdown && "value dropdown"]
      .filter(Boolean).join(", ") || "neither the panel nor its dropdowns mounted",
  });
  results.push({
    name: "the single-rule editor carries no remove button",
    pass: panel !== null && panel.querySelectorAll("button.obnotion-panel-button").length === 0,
    detail: panel ? `${panel.querySelectorAll("button.obnotion-panel-button").length} remove button(s), want 0` : "no panel",
  });
  return results;
}

function filterPanelAssertions(container: HTMLElement, nested: boolean): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = container.querySelector(".obnotion-filter-panel");
  results.push({
    name: "the filter panel drew its tree",
    pass: panel !== null && Boolean(panel.querySelector(".obnotion-source-rule-node")),
    detail: panel ? "panel and at least one rule node present" : "no .obnotion-filter-panel",
  });
  results.push({
    name: nested ? "the nested tree drew its NOT node and inner OR group"
      : "the flat tree draws its leaves without a NOT node",
    pass: nested
      ? Boolean(panel?.querySelector(".obnotion-source-rule-not"))
        && Boolean(panel?.querySelector('.obnotion-source-rule-logic[title*="OR"], .obnotion-source-rule-logic'))
      : !panel?.querySelector(".obnotion-source-rule-not") && panel?.querySelectorAll(".obnotion-panel-row").length === 3,
    detail: nested
      ? `${panel?.querySelectorAll(".obnotion-source-rule-not").length} NOT node(s), `
        + `${panel?.querySelectorAll(".obnotion-source-rule-group").length} group(s)`
      : `${panel?.querySelectorAll(".obnotion-panel-row").length} leaf row(s), `
        + `${panel?.querySelectorAll(".obnotion-source-rule-not").length} NOT node(s)`,
  });
  return results;
}

function sortPanelAssertions(container: HTMLElement, calendarHint: boolean): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = container.querySelector(".obnotion-sort-panel");
  results.push({
    name: "the sort panel drew its rules",
    pass: panel !== null && Boolean(panel.querySelector(".obnotion-sort-rule-row")),
    detail: `${panel?.querySelectorAll(".obnotion-sort-rule-row").length ?? 0} rule row(s)`,
  });
  const firstUp = panel?.querySelector<HTMLButtonElement>(".obnotion-sort-rule-row button[title='Move up']");
  results.push({
    name: "the first rule's move-up control is disabled",
    pass: firstUp ? firstUp.disabled : false,
    detail: firstUp ? `disabled=${firstUp.disabled}` : "no move-up control",
  });
  if (calendarHint) {
    results.push({
      name: "the calendar view drew its layout hint above the empty state",
      pass: Boolean(panel?.querySelector(".obnotion-panel-hint")) && Boolean(panel?.querySelector(".obnotion-panel-empty")),
      detail: panel ? `${panel.querySelectorAll(".obnotion-panel-hint").length} hint(s), `
        + `${panel.querySelectorAll(".obnotion-panel-empty").length} empty state(s)` : "no panel",
    });
  }
  return results;
}

function viewConfigAssertions(container: HTMLElement): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = container.querySelector(".obnotion-view-config-panel");
  results.push({
    name: "the view-config panel drew its database and view sections",
    pass: panel !== null
      && Boolean(panel.querySelector('.obnotion-view-config-section-title[data-scope="database"]'))
      && Boolean(panel.querySelector('.obnotion-view-config-section-title[data-scope="view"]')),
    detail: panel ? `${panel.querySelectorAll(".obnotion-view-config-row").length} config row(s)`
      : "no .obnotion-view-config-panel",
  });
  const summaries = Array.from(panel?.querySelectorAll(".obnotion-view-config-summary") ?? []).map((el) => el.textContent || "");
  results.push({
    name: "every settings summary row states a count or the empty word",
    pass: summaries.length >= 3 && summaries.every((text) => text.length > 0),
    detail: summaries.length ? summaries.join(" · ") : "no summary rows",
  });
  return results;
}

function boardCardPropertiesPanelAssertions(container: HTMLElement): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = container.querySelector(".obnotion-view-config-panel");
  const rows = Array.from(panel?.querySelectorAll<HTMLElement>(".obnotion-column-manager-row") ?? []);
  // hours, tags, due (the stored list) plus status (the board's own group field, appended
  // because the stored list never names it) — the same four `listBoardCardFields` produces for
  // any config carrying this exact schema and stored list, board-card-fields.test.ts included.
  results.push({
    name: "the board Properties section drew one row per listable field",
    pass: rows.length === 4,
    detail: `${rows.length} row(s), want 4 (hours, tags, due, status)`,
  });
  const checkedFor = (key: string) =>
    panel?.querySelector<HTMLInputElement>(`[data-obnotion-column-key="${key}"] input[type='checkbox']`)?.checked;
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
  const panel = container.querySelector(".obnotion-column-manager");
  const rows = panel?.querySelectorAll(".obnotion-column-manager-row").length ?? 0;
  results.push({
    name: "the column manager drew one row per property",
    pass: Boolean(panel) && rows === columns.length,
    detail: `${rows} row(s) for ${columns.length} column(s)`,
  });
  results.push({
    name: "the column manager drew its add-property row",
    pass: Boolean(panel?.querySelector(".obnotion-column-manager-add-row")),
    detail: panel?.querySelector(".obnotion-column-manager-add-row") ? "add row present" : "add row missing",
  });
  return results;
}

function recordDetailAssertions(container: HTMLElement): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = container.querySelector(".obnotion-record-detail-panel");
  results.push({
    name: "the record detail panel drew its header and fields",
    pass: Boolean(panel?.querySelector(".obnotion-record-detail-header"))
      && Boolean(panel?.querySelector(".obnotion-record-detail-fields")),
    detail: panel ? `${panel.querySelectorAll(".obnotion-record-detail-field").length} field(s)`
      : "no .obnotion-record-detail-panel",
  });
  results.push({
    name: "the panel carries the sheet chrome on a phone and the close button",
    pass: Boolean(panel?.querySelector(".obnotion-cell-edit-close")),
    detail: panel?.querySelector(".obnotion-cell-edit-close") ? "close button present" : "close button missing",
  });
  results.push({
    name: "an empty field with an editor names the action, never the word Empty",
    pass: Boolean(panel?.querySelector(".obnotion-record-detail-field.is-empty-field .obnotion-card-empty-placeholder"))
      && !Array.from(panel?.querySelectorAll(".obnotion-record-detail-field.is-empty-field .obnotion-card-empty-placeholder") ?? [])
        .some((el) => (el.textContent || "").trim() === "Empty"),
    detail: `${panel?.querySelectorAll(".obnotion-record-detail-field.is-empty-field").length ?? 0} empty field(s), none reading "Empty"`,
  });
  const hiddenGroup = panel?.querySelector(".obnotion-record-detail-hidden-group");
  results.push({
    name: "the hidden-properties group always renders, even with nothing hidden",
    pass: Boolean(hiddenGroup),
    detail: hiddenGroup ? "group present" : "no .obnotion-record-detail-hidden-group",
  });
  results.push({
    name: "the group's Shown section carries the full row anatomy: drag handle, type icon, name, eye, chevron",
    pass: (() => {
      const row = hiddenGroup?.querySelector(".obnotion-record-detail-hidden-row");
      return Boolean(row)
        && Boolean(row?.querySelector(".obnotion-record-detail-hidden-drag"))
        && Boolean(row?.querySelector(".obnotion-record-detail-hidden-type"))
        && Boolean(row?.querySelector(".obnotion-record-detail-hidden-name"))
        && Boolean(row?.querySelector(".obnotion-record-detail-hidden-eye"))
        && Boolean(row?.querySelector(".obnotion-record-detail-hidden-chevron"));
    })(),
    detail: `${hiddenGroup?.querySelectorAll(".obnotion-record-detail-hidden-row").length ?? 0} row(s) in the group`,
  });
  results.push({
    name: "the title row's eye is disabled and every other row's is not",
    pass: (() => {
      const eyes = Array.from(hiddenGroup?.querySelectorAll<HTMLButtonElement>(".obnotion-record-detail-hidden-eye") ?? []);
      if (eyes.length === 0) return false;
      const disabledCount = eyes.filter((eye) => eye.disabled).length;
      return disabledCount === 1 && eyes[0]?.disabled === true;
    })(),
    detail: `${hiddenGroup?.querySelectorAll(".obnotion-record-detail-hidden-eye").length ?? 0} eye control(s), one disabled`,
  });
  return results;
}

function recordDetailBodyAssertions(container: HTMLElement, variant: "empty" | "editing" | "read"): AssertionResult[] {
  const results: AssertionResult[] = [];
  const body = container.querySelector(".obnotion-record-detail-body");
  const rendered = body?.querySelector(".obnotion-record-detail-body-rendered");
  const editor = body?.querySelector(".obnotion-record-detail-body-editor");
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
  const panel = container.querySelector(".obnotion-record-peek-panel");
  results.push({
    name: "the record peek docked its panel beside the table",
    pass: Boolean(panel?.querySelector(".obnotion-record-peek-header"))
      && Boolean(panel?.querySelector(".obnotion-record-peek-properties")),
    detail: panel ? `${panel.querySelectorAll(".obnotion-record-peek-field").length} peek field(s)`
      : "no .obnotion-record-peek-panel",
  });
  results.push({
    name: "the peek carries its hidden-properties disclosure",
    pass: Boolean(panel?.querySelector(".obnotion-record-peek-hidden-toggle")),
    detail: panel?.querySelector(".obnotion-record-peek-hidden-toggle") ? "disclosure present" : "disclosure missing",
  });
  return results;
}

function columnWidthAdjusterAssertions(doc: Document): AssertionResult[] {
  const results: AssertionResult[] = [];
  const panel = doc.querySelector(".obnotion-mobile-column-width-panel");
  results.push({
    name: "the adjuster drew the shared header and the shared range row",
    pass: Boolean(panel?.querySelector(".obnotion-panel-header .obnotion-panel-title"))
      && Boolean(panel?.querySelector(".obnotion-cell-edit-close"))
      && Boolean(panel?.querySelector(".obnotion-view-config-range input[type=\"range\"]"))
      && Boolean(panel?.querySelector(".obnotion-view-config-number")),
    detail: panel ? "header, close button and range row present" : "no .obnotion-mobile-column-width-panel",
  });
  const presets = panel?.querySelectorAll(".obnotion-new-placement-option").length ?? 0;
  results.push({
    name: "the adjuster drew all four presets, one of them selected",
    pass: presets === 4 && Boolean(panel?.querySelector('.obnotion-new-placement-option[aria-checked="true"]')),
    detail: `${presets} preset(s), a checked one ${panel?.querySelector('.obnotion-new-placement-option[aria-checked="true"]') ? "present" : "missing"}`,
  });
  return results;
}

function summaryAssertions(container: HTMLElement, ruleCount: number): AssertionResult[] {
  const results: AssertionResult[] = [];
  const summary = container.querySelector(".obnotion-summary");
  const items = summary?.querySelectorAll(".obnotion-summary-item").length ?? 0;
  results.push({
    name: "the summary row drew its total and its rules",
    pass: Boolean(summary) && items >= 1 + ruleCount,
    detail: `${items} item(s), want at least ${1 + ruleCount} (total + ${ruleCount} rule(s))`,
  });
  return results;
}

function ownedMenuAssertions(doc: Document, wantSheet: boolean): AssertionResult[] {
  const results: AssertionResult[] = [];
  const menu = doc.querySelector(".obnotion-owned-menu");
  results.push({
    name: "the owned menu mounted on the document body",
    pass: Boolean(menu) && menu.querySelectorAll(".obnotion-menu-item").length > 0,
    detail: menu ? `${menu.querySelectorAll(".obnotion-menu-item").length} menu row(s)` : "no .obnotion-owned-menu",
  });
  if (wantSheet) {
    results.push({
      name: "the phone menu carries the bottom-sheet chrome",
      pass: Boolean(menu?.classList.contains("obnotion-mobile-bottom-sheet")),
      detail: menu?.classList.contains("obnotion-mobile-bottom-sheet") ? "sheet classes present"
        : "menu mounted as a popover, not a sheet",
    });
  }
  return results;
}

function cellEditorAssertions(container: HTMLElement, kind: "text" | "select"): AssertionResult[] {
  const results: AssertionResult[] = [];
  if (kind === "text") {
    const textPopover = container.querySelector('.obnotion-cell-edit-popover[data-obnotion-editor-kind="text"]');
    const linePopover = container.querySelector(".obnotion-cell-line-edit-popover");
    results.push({
      name: "the text editor opened its markdown toolbar and textarea",
      pass: Boolean(textPopover?.querySelector(".obnotion-md-toolbar")) && Boolean(textPopover?.querySelector("textarea.obnotion-cell-textarea")),
      detail: textPopover ? "popover with toolbar and textarea present" : "no text-edit popover",
    });
    results.push({
      name: "the number cell opened its single-line editor",
      pass: Boolean(linePopover?.querySelector("input.obnotion-cell-line-input")),
      detail: linePopover ? "line editor present" : "no line-edit popover",
    });
  } else {
    const optionPopover = container.querySelector(".obnotion-cell-option-popover");
    results.push({
      name: "the select cell opened its option list",
      pass: Boolean(optionPopover?.querySelector(".obnotion-cell-option-item")),
      detail: optionPopover ? `${optionPopover.querySelectorAll(".obnotion-cell-option-item").length} option row(s)`
        : "no .obnotion-cell-option-popover",
    });
  }
  return results;
}

function datePickerAssertions(container: HTMLElement, includeTime: boolean): AssertionResult[] {
  const results: AssertionResult[] = [];
  const popover = container.querySelector(".obnotion-date-value-popover");
  const trigger = container.querySelector(".obnotion-date-value-field");
  results.push({
    name: "the date trigger click opened its value popover",
    pass: Boolean(trigger) && Boolean(popover?.querySelector(".obnotion-calendar-mini-grid")),
    detail: popover ? "popover with mini calendar present" : "no .obnotion-date-value-popover",
  });
  if (includeTime) {
    results.push({
      name: "the datetime picker drew its time segments",
      pass: Boolean(popover?.classList.contains("is-datetime")) && Boolean(popover?.querySelector(".obnotion-hour-seg")),
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
  // reference-copy gantt tree (pm-gantt-*), not the local obnotion-timeline-* markup.
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
  const container = host.createDiv({ cls: "obnotion-container" });
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
      ...(scenario.boardImageField ? { boardImageField: columnOfType(columns, "text")?.key } : {}),
      ...(scenario.boardTitleFieldCurrency ? { titleField: columnOfType(columns, "currency")?.key } : {}),
      ...(scenario.titleFormat ? { titleFormat: scenario.titleFormat } : {}),
    } as ViewConfig;
    if (scenario.numericFileNames) {
      // Mirrors the operator's own report: a board card titled "3537.32", the raw file name.
      // titleField stays unset (this scenario's whole point is the file-name default path), so
      // only the file identity moves — the row's actual data is untouched.
      rows.forEach((row, index) => {
        const basename = (3537.32 + index * 1199.1).toFixed(2);
        const file = row.file as unknown as { name: string; basename: string; path: string };
        file.basename = basename;
        file.name = `${basename}.md`;
        file.path = file.path.replace(/[^/]+$/, `${basename}.md`);
      });
    }
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
      // The board's own default now hides an empty group, so this scenario — built specifically
      // to prove one still renders beside its populated lanes — pins the setting off explicitly
      // rather than depending on a default that has since moved.
      config.boardHideEmptyGroups = false;
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
      if (scenario.boardEmptyColumn) {
        const columnsEls = Array.from(container.querySelectorAll<HTMLElement>(".obnotion-kanban-col"));
        const empties = columnsEls.filter((col) => col.querySelectorAll(".obnotion-kanban-card").length === 0);
        results.push({
          name: "the board drew an empty column beside its populated lanes",
          pass: columnsEls.length === BOARD_GROUPS + 1 && empties.length === 1,
          detail: `${columnsEls.length} column(s), ${empties.length} with zero cards`,
        });
      } else {
        results.push(...boardAssertions(container, rows, groups));
      }
      if (scenario.boardImageField) {
        results.push(multiMarkerAssertion(container,
          [".obnotion-board-card-cover.is-empty", ".obnotion-board-card-cover-placeholder"],
          "the board cards drew their empty covers"));
      }
      if (scenario.boardTitleFieldCurrency) {
        const currencyCol = columnOfType(columns, "currency");
        const rawValues = currencyCol
          ? rows.map((row) => String((row as unknown as { frontmatter: Record<string, unknown> }).frontmatter[currencyCol.key]))
          : [];
        results.push(boardCardTitleFormatAssertion(container, rawValues, "€",
          "a currency-typed titleField renders the card's main name through its own column format, not "
          + "the raw stored number, proven here on the real BoardRenderer rather than hand-written "
          + "fixture HTML"));
      }
      if (scenario.titleFormat) {
        const rawValues = rows.map((row) => (row as unknown as { file: { basename: string } }).file.basename);
        const mark = scenario.titleFormat === "currency-usd" ? "$" : scenario.titleFormat === "currency-gbp" ? "£" : "€";
        results.push(boardCardTitleFormatAssertion(container, rawValues, mark,
          "a file-name titleFormat choice formats the card's main name, not the raw file name — the "
          + "operator's own report (a board card titled \"3537.32\"), proven on the real BoardRenderer"));
      }
      if (scenario.subtaskTree) results.push(subtaskTreeAssertion(container, "board"));
      if (scenario.boardGroupsPanel) {
        // The same two clicks a reader makes: the first column's own column-options button, then
        // the "Manage groups" row it opens. The row's own click handler opens the panel before the
        // menu that carried it closes, so the panel is already in the DOM by the time this reads it.
        const optionsButton = container.querySelector<HTMLButtonElement>(".obnotion-board-column-options");
        optionsButton?.click();
        const menuRows = document.querySelectorAll(".obnotion-menu-item").length;
        results.push({
          name: "the column menu carries sort ascending, sort descending, collapse and Manage groups — no standalone hide row",
          pass: menuRows === 4,
          detail: `${menuRows} row(s)`,
        });
        const entryRow = document.querySelector<HTMLButtonElement>(".obnotion-board-groups-entry");
        entryRow?.click();
        const panel = container.querySelector<HTMLElement>(".obnotion-board-groups-panel");
        const width = panel ? panel.getBoundingClientRect().width : null;
        const rowEls = panel ? Array.from(panel.querySelectorAll(".obnotion-column-manager-row")) : [];
        const toggleCount = rowEls.filter((row) => row.querySelector('input[type="checkbox"]')).length;
        results.push({
          name: "the Groups panel opens from the column menu at a width inside the panel role's 292-360px band",
          pass: width !== null && width >= 292 && width <= 360,
          detail: panel
            ? `computed width ${width}px`
            : "the column-options button or its \"Manage groups\" row did not open a panel",
        });
        results.push({
          name: "every group row in the Groups panel carries a live visibility toggle",
          pass: rowEls.length > 0 && toggleCount === rowEls.length,
          detail: `${toggleCount} checkbox(es) across ${rowEls.length} row(s)`,
        });
      }
      if (scenario.boardCardFieldsHidden) {
        const stillPresent = hiddenCardColumn
          ? container.querySelector(`.obnotion-board-card-field[data-obnotion-column-key="${hiddenCardColumn.key}"]`)
          : null;
        results.push({
          name: "a stored card field list removes the hidden field from every card",
          pass: Boolean(hiddenCardColumn) && !stillPresent,
          detail: !hiddenCardColumn
            ? "no currency column in this schema to hide — captureData must be on"
            : stillPresent
              ? `found data-obnotion-column-key="${hiddenCardColumn.key}" on a card`
              : `"${hiddenCardColumn.key}" absent from every card`,
        });
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
      : scenario.calendarOverlapTimed
        ? [...baseColumns, { key: "event_end", label: "Event end", type: "datetime" } as ColumnDef]
        : baseColumns;
    if (scenario.calendarOverlapTimed) {
      const eventDateColumn = columns.find((col) => col.key === "event_date");
      if (eventDateColumn) eventDateColumn.type = "datetime";
    }
    const rows = scenario.calendarOverlapTimed
      ? makeOverlapTimedRows()
      : makeCalendarRows(
        scenario.captureData ? CAPTURE_ROWS : CALENDAR_ROWS,
        columns,
        scenario.captureData ? CAPTURE_FILL : CALENDAR_FILL,
      );
    if (scenario.captureData) applyCaptureOptions(columns, rows);
    const baseConfig = makeCalendarConfig(columns, scale);
    const iconKey = scenario.calendarRecordIcon
      ? columns.find((col) => col.type === "text" && col.key !== "file.name")?.key
      : undefined;
    let config: ViewConfig = scenario.emptyState
      ? { ...baseConfig, calendarStartDateField: undefined }
      : scenario.calendarRecordIcon
        ? { ...baseConfig, showRecordIcon: true, recordIconFieldOverrideEnabled: true, recordIconField: iconKey }
        : scenario.calendarOverlapTimed
          ? { ...baseConfig, calendarEndDateField: "event_end", calendarWeekStart: OVERLAP_TIMED_DATE, calendarDay: OVERLAP_TIMED_DATE }
          : baseConfig;
    if (scenario.calendarUnscheduled && baseConfig.calendarStartDateField) {
      // Row 1, not row 0: row 0 stays a normal drawn event so a scenario combining this with
      // calendarRecordIcon still has one to carry the icon.
      const fm = (rows[1] as unknown as { frontmatter: Record<string, unknown> }).frontmatter;
      delete fm[baseConfig.calendarStartDateField];
    }
    if (scenario.calendarMultiDay && baseConfig.calendarStartDateField) {
      const endField = `${baseConfig.calendarStartDateField}_end`;
      config = { ...config, calendarEndDateField: endField };
      // Row 2: distinct from the icon row (0) and the unscheduled row (1), so all three options
      // can combine on one capture without one opt-in overwriting another's row.
      const fm = (rows[2] as unknown as { frontmatter: Record<string, unknown> }).frontmatter;
      const start = fm[baseConfig.calendarStartDateField];
      if (typeof start === "string") fm[endField] = addDateKeyDays(start, 4);
    }
    if (scenario.calendarCustomColumnWidth) {
      config = { ...config, calendarColumnSizeMode: "custom", calendarCustomColumnWidth: scenario.calendarCustomColumnWidth };
    }
    const bag = scenario.bag === "file-view" ? fileViewCalendarBag(columns) : embedCalendarBag(columns);
    if (scenario.calendarRecordIcon) {
      // Every bench row already carries an event date (calendar-render-bench.ts's makeRows sets
      // it unconditionally), so the first row is always a real, drawn event.
      const fm = (rows[0] as unknown as { frontmatter: Record<string, unknown> }).frontmatter;
      if (iconKey) fm[iconKey] = "☁️";
      bag.renderRecordIcon = (parent, row, cfg, compact) => renderRecordIcon(
        parent,
        iconKey ? row.frontmatter[iconKey] : undefined,
        { compact: !!compact, editable: false, tooltip: "Icon" },
      );
    }
    bagKeys = Object.keys(bag).sort();
    const renderer = new CalendarRenderer(bag);
    if (control === "per-item" && scale === "week") armPerItemRead(bag);
    if (control === "per-item" && scale === "day") {
      renderer.render = armPerRowReadAtRenderEntry(renderer.render.bind(renderer), container);
    }

    const stopCounting = countLayoutReads();
    renderer.render(container, config, rows);
    const layoutReads = stopCounting();

    results.push(provenanceResult(container, "calendar-renderer"));
    if (results[0].pass) {
      results.push(...(scenario.emptyState
        ? [calendarEmptyStateAssertion(container)]
        : scale === "month"
          ? calendarAssertions(container, scenario)
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
        ? [
          chartVariantAssertion(container, scenario.chartVariant),
          ...(scenario.chartVariant === "empty" ? [chartEmptyAbsorptionAssertion(container)] : []),
        ]
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
    const anchor = makeHiddenAnchor(container, "obnotion-chart-options-trigger");
    const toolbar = new ChartToolbarRenderer();
    const actions: ChartToolbarActions = { onChange: () => undefined };
    bagKeys = Object.keys(actions).sort();
    toolbar.togglePopover(container, anchor, config, actions);

    results.push(provenanceResult(container, "chart-toolbar-renderer"));
    if (results[0].pass) results.push(toolbarPopoverAssertion(container, ".obnotion-chart-options-popover"));
  } else if (scenario.renderer === "calendar-toolbar") {
    // The calendar settings popover, week scale so the Time section (only shown at week/day
    // scale, per the fixture this supersedes) is in frame.
    const columns = makeCalendarColumns(CALENDAR_COLUMNS, "mixed");
    const rows = makeCalendarRows(CAPTURE_ROWS, columns, CAPTURE_FILL);
    applyCaptureOptions(columns, rows);
    const config = makeCalendarConfig(columns, "week");
    const anchor = makeHiddenAnchor(container, "obnotion-calendar-options-trigger");
    const toolbar = new CalendarToolbarRenderer();
    const actions: CalendarToolbarActions = { onChange: () => undefined };
    bagKeys = Object.keys(actions).sort();
    toolbar.togglePopover(container, anchor, config, actions);

    results.push(provenanceResult(container, "calendar-toolbar-renderer"));
    if (results[0].pass) results.push(toolbarPopoverAssertion(container, ".obnotion-calendar-options-popover"));
  } else if (scenario.renderer === "timeline-toolbar") {
    // The timeline settings popover. The bench's own makeConfig sets viewType: "calendar" (it
    // never reaches a viewType-gated caller today), but CalendarTimelineToolbarRenderer.
    // togglePopover guards on viewType === "timeline" — the real value database-view.ts gives a
    // timeline host — so this local override matches the real config shape this popover expects.
    const columns = makeTimelineColumns(TIMELINE_COLUMNS, "mixed");
    const rows = makeTimelineRows(CAPTURE_ROWS, columns, CAPTURE_FILL);
    applyCaptureOptions(columns, rows);
    const config: ViewConfig = { ...makeTimelineConfig(columns, "week"), viewType: "timeline" };
    const anchor = makeHiddenAnchor(container, "obnotion-calendar-timeline-options-trigger");
    const toolbar = new CalendarTimelineToolbarRenderer();
    const actions: CalendarTimelineToolbarActions = { onChange: () => undefined };
    bagKeys = Object.keys(actions).sort();
    toolbar.togglePopover(container, anchor, config, actions);

    results.push(provenanceResult(container, "timeline-toolbar-renderer"));
    if (results[0].pass) results.push(toolbarPopoverAssertion(container, ".obnotion-calendar-timeline-options-popover"));
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
    if (scenario.toolbarPopover === "tab-menu") {
      // showViewTabMenu gates its delete row on totalViews > 1 — the single-view fixture every
      // other toolbar scenario mounts would suppress it, proving nothing about the menu's remove
      // row. A second view is the minimum that exercises the row this scenario exists to read.
      db.views = [config, { ...config, id: "bench-second-view", name: "Second view" }];
    }
    // `rules` mirrors the active-view-controls branch below so the two surfaces the same state
    // drives — the chip rail and the toolbar's own filter/sort triggers — are provable against
    // the identical four combinations, not two harnesses that could quietly diverge.
    const toolbarRules = scenario.rules ?? "none";
    const selectCol = columns.find((col) => col.type === "select" || col.type === "status");
    const dateCol = columnOfType(columns, "date");
    const toolbarFilters = selectCol && (toolbarRules === "filter" || toolbarRules === "both")
      ? [{ field: selectCol.key, op: "eq" as const, value: "Backlog" }]
      : [];
    const toolbarSortRules = dateCol && (toolbarRules === "sort" || toolbarRules === "both")
      ? [{ field: dateCol.key, direction: "asc" as const }]
      : [];
    const state = makeSurfaceState({
      searchText: scenario.searchText ?? "",
      filters: toolbarFilters,
      sortRules: toolbarSortRules,
    });
    const actions = makeToolbarActions();
    bagKeys = Object.keys(actions).sort();
    const renderer = new ToolbarRenderer();
    renderer.render(container, [{ config: db, sourcePath: "notes" }], 0, 0, state, actions);
    if (scenario.toolbarPopover === "utilities") {
      (container.querySelector<HTMLButtonElement>(".obnotion-toolbar-more-btn"))?.click();
    } else if (scenario.toolbarPopover === "add-view") {
      (container.querySelector<HTMLButtonElement>(".obnotion-view-tab-add"))?.click();
    } else if (scenario.toolbarPopover === "tab-menu") {
      // showViewTabMenu binds oncontextmenu, not onclick — a synthetic click proves nothing
      // about the real trigger a right-click reaches, so this dispatches the same event type.
      const tab = container.querySelector<HTMLElement>(".obnotion-view-tab:not(.obnotion-view-tab-add)");
      tab?.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    } else if (scenario.toolbarPopover === "group") {
      (container.querySelector<HTMLButtonElement>(".obnotion-group-btn"))?.click();
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
      ...(scenario.rules === "sort" || scenario.rules === "none" ? {} : { filters }),
      ...(scenario.rules === "filter" || scenario.rules === "none" ? {} : { sortRules }),
    });
    const actions: ActiveViewControlsActions = {
      editFilter: () => undefined,
      editSort: () => undefined,
      removeFilter: () => undefined,
      removeSort: () => undefined,
      toggleFilterLogic: () => undefined,
      clearAll: () => undefined,
      addFilter: () => undefined,
      addSort: () => undefined,
    };
    bagKeys = Object.keys(actions).sort();
    container.createDiv({ cls: "obnotion-header" });
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
    const anchor = makeHiddenAnchor(container, "obnotion-active-rule-anchor");
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
    const anchor = makeHiddenAnchor(container, "obnotion-filter-anchor");
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
    renderer.render(container, true, config, state, actions, makeHiddenAnchor(container, "obnotion-sort-anchor"));

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
      renderer.render(container, true, config, actions, makeHiddenAnchor(container, "obnotion-view-config-anchor"));

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
      renderer.render(container, true, config, actions, makeHiddenAnchor(container, "obnotion-view-config-anchor"));

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
    renderer.render(container, true, config, state, columns, actions, makeHiddenAnchor(container, "obnotion-column-manager-anchor"));

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
    const docked = scenario.recordPlacement === "docked";
    // The docked case passes the container, which is exactly what an affordance with no element of
    // its own passes in the view. Using a hidden anchor here instead would photograph a case that
    // does not occur.
    const anchor = docked ? container : makeHiddenAnchor(container, "obnotion-record-detail-anchor");
    const actions: RecordDetailActions = {
      editCell: () => undefined,
      openRow: () => undefined,
      // The trailing add-property row is part of the sheet's own markup: without the action the
      // panel photographs a footer the production record sheet always draws, because the row
      // only renders when a picker host exists to open onto.
      addProperty: () => undefined,
    };
    bagKeys = Object.keys(actions).sort();
    openRecordDetailPanel({
      anchorEl: anchor,
      host: container,
      placement: docked ? "docked" : "anchored",
      row,
      columns,
      allColumns: columns,
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
    const anchor = makeHiddenAnchor(container, "obnotion-record-peek-anchor");
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
            allColumns: columns,
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
    const adjusterPanel = container.ownerDocument.querySelector(".obnotion-mobile-column-width-panel");
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
    menu.showAt({ anchor: makeHiddenAnchor(container, "obnotion-owned-menu-anchor") });
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
      ? container.querySelector<HTMLElement>(`td[data-obnotion-column-key="${col.key}"]`)
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
    const anchor = makeHiddenAnchor(container, "obnotion-icon-picker-anchor");
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
      const popover = container.ownerDocument.querySelector(".obnotion-icon-picker-popover");
      results.push({
        name: "the picker opened on its Icons tab with the colour strip",
        pass: Boolean(popover?.querySelector(".obnotion-icon-picker-colors"))
          && Boolean(popover?.querySelector(".obnotion-icon-picker-grid")),
        detail: popover ? "Icons tab, colour strip and icon grid present" : "no .obnotion-icon-picker-popover on the body",
      });
    }
  } else if (scenario.renderer === "color-picker") {
    // The option colour picker: openOptionColorPicker's own entry, opened with the current
    // colour that rings the matching swatch. Mounts on document.body like the icon picker.
    const anchor = makeHiddenAnchor(container, "obnotion-color-picker-anchor");
    openOptionColorPicker(anchor, "blue", () => undefined);
    container.setAttribute(PROVENANCE_ATTR, "color-picker");
    bagKeys = [];

    results.push(provenanceResult(container, "color-picker"));
    if (results[0].pass) {
      const popup = container.ownerDocument.querySelector(".obnotion-color-picker-popup");
      // A one-column labelled list built from the family's own `.obnotion-dropdown-option`
      // row, not a swatch grid — sixteen rows, zero swatches, the current colour's row selected
      // with its trailing check.
      results.push({
        name: "the colour picker drew its sixteen labelled rows with the current one selected",
        pass: Boolean(popup) && popup.querySelectorAll(".obnotion-dropdown-option").length === 16
          && popup!.querySelectorAll(".obnotion-color-picker-swatch").length === 0
          && Boolean(popup?.querySelector(".obnotion-dropdown-option.is-selected .obnotion-dropdown-option-check")),
        detail: popup ? `${popup.querySelectorAll(".obnotion-dropdown-option").length} row(s)` : "no .obnotion-color-picker-popup",
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
      [".obnotion-relation-values", ".obnotion-relation-link", ".obnotion-relation-link-label"], "the relation chips rendered"));
  } else if (scenario.renderer === "file-fields") {
    // The file pseudo-columns: renderSpecialFileFieldValue's own dispatch for file.tags and the
    // link-list key, over a real table row. The per-tag remove buttons render only when the
    // context asks for them, the same writable-cell shape the table passes.
    const columns = makeTableColumns(TABLE_COLUMNS, "mixed");
    const rows = makeTableRows(TABLE_ROWS, columns);
    applyCaptureOptions(columns, rows);
    const table = container.createEl("table", { cls: "obnotion-table" });
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
        [".obnotion-file-tags .status-badge.obnotion-file-tag-badge", ".obnotion-file-link-list .internal-link"],
        "the file tags and link list rendered"));
    }
  } else if (scenario.renderer === "number-display") {
    // The three number display styles: renderRating/renderProgress/renderProgressRing's own
    // entries into a table of rows, one style per row the way the cell renderer calls them.
    const table = container.createEl("table", { cls: "obnotion-table" });
    const tbody = table.createEl("tbody");
    const styleRow = (label: string, build: (td: HTMLElement) => void): void => {
      const tr = tbody.createEl("tr");
      tr.createEl("td", { text: label });
      const valueTd = tr.createEl("td", { cls: "obnotion-numeric-value" });
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
        [".obnotion-cell-rating", ".obnotion-cell-progress", ".obnotion-cell-progress-ring", ".obnotion-num-color-orange", ".obnotion-num-color-green"],
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
        [".obnotion-record-icon-colgroup", ".obnotion-record-icon.is-compact", ".obnotion-record-icon.is-default", ".obnotion-record-icon-emoji"],
        "the record-icon gutter rendered with its default and emoji variants"));
    }
  } else if (scenario.renderer === "dropdown" && scenario.dropdownSearch) {
    // The combobox shape, driven the way a person drives it: a real labelled field is built, its
    // trigger is clicked, and the query is typed into the input the trigger turned into. Nine
    // properties, so the phone profile of this same scenario photographs the sheet's own search
    // row — the grammar the desktop change deliberately leaves alone — while the desktop profile
    // photographs the trigger mid-search. Typing goes through the real `input` event `oninput`
    // listens for, so the capture shows the list narrowed to the query rather than an empty box
    // over a full list.
    const row = container.createDiv({
      cls: "obnotion-panel-row",
      attr: { style: "width:320px;margin:16px" },
    });
    createDropdownField({
      parent: row,
      label: "Property",
      className: "obnotion-panel-dropdown obnotion-filter-field-dropdown",
      hideLabel: true,
      // Declared, so the phone profile of this scenario renders the sheet's own search row: the
      // desktop no longer reads this flag (every desktop list filters), and the phone still does.
      searchable: true,
      options: [
        { value: "title", text: "Title" },
        { value: "status", text: "Status" },
        { value: "assignee", text: "Assignee" },
        { value: "priority", text: "Priority" },
        { value: "due", text: "Due date" },
        { value: "created", text: "Created date" },
        { value: "tags", text: "Tags" },
        { value: "estimate", text: "Estimate" },
        { value: "risk", text: "Risk burn" },
      ],
      value: "title",
      onChange: () => undefined,
    });
    row.querySelector<HTMLButtonElement>(".obnotion-dropdown-field")?.click();
    const searchInput = container.querySelector<HTMLInputElement>(".obnotion-dropdown-field-input")
      || container.querySelector<HTMLInputElement>(".obnotion-dropdown-search input");
    if (searchInput) {
      searchInput.value = "ri";
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
    container.setAttribute(PROVENANCE_ATTR, "dropdown-field");
    bagKeys = [];

    results.push(provenanceResult(container, "dropdown-field"));
    if (results[0].pass) {
      results.push(multiMarkerAssertion(container,
        [".obnotion-dropdown-popover", ".obnotion-dropdown-option:not(.is-hidden)"],
        "the combobox opened its list and filtered it to the typed query"));
    }
  } else if (scenario.renderer === "dropdown" && scenario.dropdownDesktopSheet) {
    // The desktop-sheet escalation: the same labelled-field entry `dropdownSearch` drives, but
    // with a list long enough (thirty rows) that its natural height cannot fit beside the anchor
    // at any position in this page's own viewport — `isDesktopDropdownCramped` reads that from
    // the same numbers `resolveDesktopDropdownFit` derives, not a hand-set flag, so this scenario
    // proves the escalation rather than asserting a class the primitive never earned. The trigger
    // never becomes the query field on this path; the escalated sheet carries its own titled
    // header and search row instead.
    const row = container.createDiv({
      cls: "obnotion-panel-row",
      attr: { style: "width:320px;margin:16px" },
    });
    createDropdownField({
      parent: row,
      label: "Property",
      className: "obnotion-panel-dropdown obnotion-filter-field-dropdown",
      hideLabel: true,
      searchable: true,
      options: Array.from({ length: 30 }, (_, index) => ({
        value: `property-${index}`,
        text: `Property ${index + 1}`,
      })),
      value: "property-0",
      onChange: () => undefined,
    });
    row.querySelector<HTMLButtonElement>(".obnotion-dropdown-field")?.click();
    container.setAttribute(PROVENANCE_ATTR, "dropdown-field");
    bagKeys = [];

    results.push(provenanceResult(container, "dropdown-field"));
    if (results[0].pass) {
      // The escalated sheet is portalled to document.body, the same as the icon and colour
      // pickers above — it is never a descendant of `container`, so querying `container` can
      // only ever find nothing and this assertion would fail regardless of what actually
      // rendered. `container.ownerDocument` reaches the whole document the way those pickers do.
      const sheet = container.ownerDocument.querySelector(".obnotion-dropdown-popover.obnotion-dropdown-popover-desktop-sheet");
      results.push({
        name: "a cramped anchored placement escalated to a titled sheet with its own search row",
        pass: Boolean(sheet)
          && Boolean(sheet?.querySelector(".obnotion-panel-title"))
          && Boolean(sheet?.querySelector(".obnotion-dropdown-search input"))
          && row.querySelector(".obnotion-dropdown-field-input") == null,
        detail: sheet
          ? "desktop-sheet class, titled header and search row all present, trigger never converted"
          : "no .obnotion-dropdown-popover-desktop-sheet — the anchored branch fired instead",
      });
    }
  } else if (scenario.renderer === "dropdown") {
    // The dropdown popover: openDropdownMenu's own entry, the same call the column manager's
    // add-file-property button makes. The disabled option carries the reason the fixture's
    // tooltip exists to surface.
    const anchor = makeHiddenAnchor(container, "obnotion-dropdown-anchor");
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
        [".obnotion-dropdown-popover", ".obnotion-dropdown-option.is-selected", ".obnotion-dropdown-option.is-disabled"],
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
        [".obnotion-empty-card", ".obnotion-empty-card-title", ".obnotion-empty-action.mod-cta"],
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
        const marker = th.closest(".obnotion-container")?.getAttribute(PROVENANCE_ATTR);
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
        [".obnotion-column-menu-trigger", ".obnotion-resize-handle", ".obnotion-th-content .obnotion-th-label", ".obnotion-th-content .obnotion-property-icon"],
        "the column headers carry their menu triggers, resize handles and property-type icons"));
    }
  } else if (scenario.renderer === "card-covers") {
    // The empty card cover in the board card view: an image field the rows resolve nothing for,
    // which is the only cover state a capture without a vault can show. renderCover is shared by
    // the default board, so this needs no extensions opt-in to reach it. This used to mount the
    // gallery's own empty cover alongside it; the gallery is retired, so only the board host is
    // constructed here now.
    const columns = makeBoardColumns(BOARD_COLUMNS, "mixed");
    const rows = makeBoardRows(CAPTURE_ROWS, columns, CAPTURE_FILL, BOARD_GROUPS);
    applyCaptureOptions(columns, rows, BOARD_GROUP_FIELD);
    applyCaptureGroupPalette(columns, rows, BOARD_GROUP_FIELD);
    const groups = makeBoardGroups(rows, BOARD_GROUPS);
    applyEmptyMetadataCache(rows);
    const imageKey = columnOfType(columns, "text")?.key;
    const boardHost = container.createDiv({ cls: "obnotion-cover-host" });
    const boardRenderer = new BoardRenderer(undefined as unknown as App, fileViewBoardBag(columns));
    boardRenderer.render(boardHost, {
      ...makeBoardConfig(columns),
      viewType: "board",
      boardImageField: imageKey,
    } as ViewConfig, groups, BOARD_GROUP_FIELD);
    bagKeys = [];

    const markers = [
      ["board", boardHost.getAttribute(PROVENANCE_ATTR)],
    ];
    results.push({
      name: "the card view mounted through its production entry",
      pass: markers.every(([, marker]) => marker !== null),
      detail: markers.map(([name, marker]) => `${name}:${marker ?? "none"}`).join(", "),
    });
    if (results[0].pass) {
      results.push(multiMarkerAssertion(container,
        [".obnotion-board-card-cover.is-empty .obnotion-board-card-cover-placeholder"],
        "the empty cover rendered in the board card"));
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
      pass: !!container.querySelector("table.obnotion-table") && !container.querySelector(".obnotion-list-row"),
      detail: `table.obnotion-table present: ${!!container.querySelector("table.obnotion-table")}, `
        + `.obnotion-list-row present: ${!!container.querySelector(".obnotion-list-row")}, `
        + `plan: ${plan ? `${plan.from}->${plan.to}` : "null"}, `
        + `final viewType: ${migratedConfig.viewType}`,
    });
    if (results[0].pass) {
      results.push(...tableAssertions(container, rows, columns));
    }
  } else {
    // captureData sizes the data as well as typing it, the way it already does for board.
    // The table has no window, so every row becomes a real <tr>: at the bench's 2000
    // the container measures over 80,000px tall, which no element-mode capture can photograph and
    // which repeats one under-floor control thousands of times in the touch-target lane without
    // saying anything the first row did not. The structural-cost shape stays the lanes' own
    // no-captureData scenarios, which still mount 2000 rows here.
    // The catalogue path replaces both the columns and the rows, because its point is that the
    // two disagree with the fixture together: real labels against real values, at the per-record
    // variation the generated set flattens away.
    const catalogueData = scenario.catalogueUseCase ? catalogueTableData(scenario.catalogueUseCase) : null;
    const columns = catalogueData ? catalogueData.columns : makeTableColumns(
      scenario.tableColumnCount ?? TABLE_COLUMNS,
      scenario.captureData ? "mixed" : "text",
    );
    // The footer sits under the last row, and a phone crops the table at its own viewport height:
    // at the capture row count the row the scenario exists to show falls below the fold, so the
    // footer variant takes the shorter set that fits both devices.
    const captureRowCount = scenario.tableFooter ? FOOTER_CAPTURE_ROWS : CAPTURE_ROWS;
    // The catalogue's own columns stand — mounting the state on the catalogue, not a fixture — but
    // its rows are dropped, the real condition an empty table renders under.
    const rows = scenario.emptyReason || scenario.tableFooterEmpty
      ? []
      : catalogueData
        ? catalogueData.rows
        : makeTableRows(scenario.captureData ? captureRowCount : TABLE_ROWS, columns);
    if (scenario.captureData && !catalogueData) applyCaptureOptions(columns, rows);
    const emptyOptions = scenario.emptyReason ? buildEmptyReasonOptions(scenario.emptyReason) : undefined;
    const currencyCol = columnOfType(columns, "currency") ?? columnOfType(columns, "number");
    const dateCol = columnOfType(columns, "date");
    const selectCols = columns.filter((col) => col.type === "select" || col.type === "status");
    const textCol = columnOfType(columns, "text");
    if (scenario.longHeaderLabel && columns[1]) {
      columns[1].label = "A deliberately long column name that must truncate";
    }
    if (scenario.catalogueMarkdownNewline) {
      const markdownCol = columns.find((col) => col.textRenderMode === "markdown");
      const target = rows[0] as unknown as { frontmatter: Record<string, unknown> } | undefined;
      if (markdownCol && target) {
        target.frontmatter[markdownCol.key] = "Streak intact\nBut mornings are still rough\nWatch tomorrow";
      }
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
      ...(catalogueData ? catalogueData.config : makeTableConfig(columns)),
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
      ...(scenario.wrapText ? { wrapText: true } : {}),
      ...(scenario.tableSortRules && textCol && selectCols[0] ? {
        sortRules: [
          { field: textCol.key, direction: "asc" },
          { field: selectCols[0].key, direction: "desc" },
        ],
      } : {}),
    } as ViewConfig;
    // The catalogue path always takes the production CellRenderer, never the text stub: a row
    // height measured against `td.setText` is the height of a string, not of the cell the plugin
    // builds, and the whole reason to mount real records is that their cells differ in shape.
    const realCells = scenario.captureData || !!catalogueData;
    const bag = scenario.bag === "file-view"
      ? fileViewTableBag(columns, realCells, config.wrapText)
      : embedTableBag(columns, realCells, config.wrapText);
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
    if (scenario.tableHeaderNoop) {
      // The default bag's own setupColumnHeader (`th.setText(col.label)`) is a bench shortcut
      // that overwrites whatever renderHeader already built — harmless for the row-cost benches
      // it was written for, but it erases the icon/label/sort-ordinal structure a header
      // composition assertion needs to read. A true no-op leaves that structure intact without
      // pulling in the real ColumnHeaderController's own per-column layout reads, which this
      // check's row-cost bound was never calibrated against.
      bag.setupColumnHeader = () => undefined;
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
          [".obnotion-grouped-table", "tr.obnotion-group-divider-row", ".obnotion-group-divider-row .status-badge", ".obnotion-group-summary-item"],
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
      renderer.renderTable(container, config, rows, emptyOptions);
      const reads = stopReads();
      const rowAppends = stopCounting();

      results.push(provenanceResult(container, "table-renderer"));
      if (results[0].pass) {
        if (scenario.emptyReason) {
          results.push(emptyReasonAssertion(container, scenario.emptyReason));
        } else if (!scenario.tableFooterEmpty) {
          // Zero rows through the plain (non-emptyReason) branch is a real, if narrow, condition
          // this suite's own tableAssertions was never shaped for — several of its checks assume
          // at least one row exists — so a scenario that deliberately mounts zero rows here skips
          // it rather than reading a false failure that has nothing to do with the footer.
          results.push(...tableAssertions(container, rows, columns));
        }
        if (scenario.tableFooter) {
          if (rows.length === 0) {
            const tfoot = container.querySelector("tfoot.obnotion-table-footer");
            results.push({
              name: "a zero-row table renders no footer",
              pass: !tfoot,
              detail: tfoot ? "tfoot.obnotion-table-footer is present over zero rows" : "no tfoot.obnotion-table-footer, as expected",
            });
          } else {
            results.push(multiMarkerAssertion(container,
              ["tfoot.obnotion-table-footer", ".obnotion-table-footer-trigger.has-calculation", ".obnotion-table-footer-kind"],
              "the footer rendered its calculated aggregates"));
            const triggers = container.querySelectorAll(".obnotion-table-footer-trigger").length;
            results.push({
              name: "one footer trigger per column",
              pass: triggers === columns.length,
              detail: `${triggers} .obnotion-table-footer-trigger element(s) for ${columns.length} column(s)`,
            });
          }
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
        // Only meaningful once the destructive default stub is out of the way (tableHeaderNoop) —
        // the plain bag's own setupColumnHeader calls th.setText(col.label), which — accurately
        // for the benches that stub exists for, wrongly for this guard — wipes the icon/label
        // structure renderHeader just built.
        if (scenario.tableHeaderNoop) {
          results.push(...headerCompositionAssertions(container));
        }
        if (scenario.recordIconColumn) {
          results.push(multiMarkerAssertion(container,
            [".obnotion-record-icon-colgroup", ".obnotion-record-icon.is-compact", ".obnotion-record-icon.is-default", ".obnotion-record-icon-emoji"],
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

// ───────────────────────────────────────────────────────────────────
// 5. VIEW-SWITCH TEARDOWN RESIDUE
// ───────────────────────────────────────────────────────────────────
//
// `database-view.ts`'s `refresh()` and `embedded-database-renderer.ts`'s `renderResults()` each
// tear down the outgoing view's DOM (`clearRenderedViewRoots`, or that same root-class list
// inlined) before the next view type renders into the SAME container the host reuses across a
// switch. Neither host's own unit suite constructs that container-reuse sequence — the unit
// tests mount one renderer at a time into a fresh container — so a renderer whose root uses a
// class the teardown's list does not name regressed silently until an operator saw the outgoing
// view's stale root sitting on top of whatever replaced it: the timeline's default render (the
// reference-gantt path; `config.timelineLocalExtensions` is opt-in and off for every database
// that has not turned it on) roots itself as "pm-gantt-view", not "obnotion-timeline", and the
// class list before this fix named only the latter.
//
// This reproduces that exact sequence — mount the outgoing view, run the production teardown,
// mount table — on the real renderers in the real browser, and counts what the outgoing view
// left in the container afterward. Zero is the only passing count. The mounted-before and
// table-rendered checks are the negative control: a residue count of zero because the outgoing
// view or the table never actually mounted would be an empty-set pass proving nothing.

export interface ViewSwitchResidueResult {
  name: string;
  pass: boolean;
  detail: string;
}

const VIEW_SWITCH_RESIDUE_SELECTOR: Record<"timeline" | "calendar", string> = {
  timeline: ".obnotion-timeline, .pm-gantt-view",
  calendar: ".obnotion-calendar",
};

export function runViewSwitchResidueCheck(host: HTMLElement, from: "timeline" | "calendar"): ViewSwitchResidueResult {
  const container = host.createDiv({ cls: "obnotion-container" });
  const selector = VIEW_SWITCH_RESIDUE_SELECTOR[from];

  if (from === "timeline") {
    const columns = makeTimelineColumns(TIMELINE_COLUMNS, "mixed");
    const rows = makeTimelineRows(CAPTURE_ROWS, columns, CAPTURE_FILL);
    new CalendarTimelineRenderer(fileViewTimelineBag())
      .renderTimeline(container, makeTimelineConfig(columns, "week"), rows);
  } else {
    const columns = makeCalendarColumns(CALENDAR_COLUMNS, "mixed");
    const rows = makeCalendarRows(CAPTURE_ROWS, columns, CAPTURE_FILL);
    new CalendarRenderer(fileViewCalendarBag(columns)).render(container, makeCalendarConfig(columns, "month"), rows);
  }
  const mounted = container.querySelectorAll(selector).length;

  // The exact call `refresh()` makes before `render()` rebuilds into the next view type.
  clearRenderedViewRoots(container);

  const tableColumns = makeTableColumns(TABLE_COLUMNS, "mixed");
  const tableRows = makeTableRows(CAPTURE_ROWS, tableColumns);
  const tableConfig = {
    ...makeTableConfig(tableColumns),
    schema: { columns: tableColumns, computedFields: [] },
  } as ViewConfig;
  new TableRenderer(fileViewTableBag(tableColumns, true)).renderTable(container, tableConfig, tableRows);

  const residue = container.querySelectorAll(selector).length;
  const tableMounted = container.querySelector("table.obnotion-table") != null;
  container.remove();

  return {
    name: `view-switch residue: ${from} -> table`,
    pass: mounted > 0 && tableMounted && residue === 0,
    detail: `${residue} leftover ${from} root(s) after the switch (selector "${selector}"); `
      + `${mounted} mounted before the switch, table rendered: ${tableMounted}`,
  };
}
