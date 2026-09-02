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
//
// `RENDER_READ_CONTROL=per-item`, read by the runner and passed into
// `runRenderAssertions`, arms it: the card and row renderers call the bag's
// `applyConditionalFormat` once per item with no target field — field-level
// calls always name the field — and the armed wrapper reads the item's box at
// that call. Board and gallery then read one per card plus the touch probe,
// the table one per row plus its O(1) reads, and the check fails naming the
// scenario; disarmed, each reads its O(1) count.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ListRenderer, type ListRendererActions } from "../../src/views/list-renderer";
import { TableRenderer, type TableRendererActions } from "../../src/views/table-renderer";
import { CalendarRenderer, type CalendarRendererActions } from "../../src/views/calendar-renderer";
import {
  CalendarTimelineRenderer,
  type CalendarTimelineRendererActions,
} from "../../src/views/calendar-timeline-renderer";
import type { App } from "obsidian";
import type { ColumnDef, RowData, ViewConfig } from "../../src/data/types";
import {
  makeColumns as makeListColumns,
  makeRows as makeListRows,
  makeConfig as makeListConfig,
} from "../bench/list-render-bench";
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

// ───────────────────────────────────────────────────────────────────
// 2. SHAPES UNDER TEST
// ───────────────────────────────────────────────────────────────────

// The same measured shapes the benches time: the operator's twenty-one-column
// database at thirty percent fill, and the table bench's sixteen-column table.
// Sampling above the bend matters for timing budgets; for structure it matters
// that the row count is the count the freeze was measured at.
export const LIST_COLUMNS = 21;
export const LIST_ROWS = 1600;
export const LIST_FILL = 0.3;
export const TABLE_COLUMNS = 16;
export const TABLE_ROWS = 2000;

// The column whose grid position must be identical on every row. It sits mid-
// list, where a reservation change silently breaks alignment. The column
// factory maps the first slot to the file name, so the named column lands one
// index earlier than its position in the reported database's property list.
export const ALIGNMENT_COLUMN = "amount";
export const ALIGNMENT_GRID_COLUMN = "18";

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

export interface ScenarioSpec {
  renderer: "list" | "table" | "calendar" | "timeline" | "board" | "gallery";
  bag: "file-view" | "embed";
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
}

// ───────────────────────────────────────────────────────────────────
// 3. HOST ACTION BAGS
// ───────────────────────────────────────────────────────────────────

// The file view wires twenty-six members; the embed wires nineteen, nine of
// them absent from the file view's bag being the point. The embed omits
// openRecordDetail entirely, so an embedded row cannot open the record panel
// — whether that is intended belongs to the embed's owner; this check asserts
// that the difference exists and that the renderer acts on it.

function fileViewListBag(columns: ColumnDef[]): ListRendererActions {
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

function embedListBag(columns: ColumnDef[]): ListRendererActions {
  return {
    openRow: () => undefined,
    createEntry: () => undefined,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    editCell: () => undefined,
    getColumns: () => columns,
    moveRowToPosition: () => undefined,
    isGroupCollapsed: () => false,
    toggleGroupCollapsed: () => undefined,
    expandGroup: () => undefined,
    showRowMenu: () => undefined,
    showColumnMenu: () => undefined,
    renderRecordIcon: () => null,
    renderGroupSummaries: () => undefined,
    applyConditionalFormat: () => undefined,
    isReadOnly: false,
    get hideCreateEntry() { return false; },
  };
}

function fileViewTableBag(columns: ColumnDef[]): TableRendererActions {
  return {
    getVisibleColumns: () => columns,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    setupColumnHeader: (th, col) => { th.setText(col.label); },
    setupRow: () => undefined,
    renderCell: (td, row, col) => { td.setText(String(row.frontmatter[col.key] ?? "")); },
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

function embedTableBag(columns: ColumnDef[]): TableRendererActions {
  return {
    getVisibleColumns: () => columns,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    setupColumnHeader: (th, col) => { th.setText(col.label); },
    setupRow: () => undefined,
    renderCell: (td, row, col) => { td.setText(String(row.frontmatter[col.key] ?? "")); },
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

function tagListRenders(): void {
  const original = ListRenderer.prototype.render;
  ListRenderer.prototype.render = function taggedRender(
    container: HTMLElement,
    config: ViewConfig,
    rows: RowData[],
    emptyState?: unknown,
  ): void {
    original.call(this, container, config, rows, emptyState);
    container.setAttribute(PROVENANCE_ATTR, "list-renderer");
  };
}

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

// Armed once at module load, in the browser only: the harness is bundled into
// the render entry and never runs outside it.
tagListRenders();
tagTableRenders();
tagBoardRenders();
tagGalleryRenders();
tagCalendarRenders();
tagTimelineRenders();

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

function listAssertions(
  container: HTMLElement,
  rows: RowData[],
  columns: ColumnDef[],
  bag: ListRendererActions,
  bagName: string,
): AssertionResult[] {
  const results: AssertionResult[] = [];
  const rowEls = Array.from(container.querySelectorAll<HTMLElement>(".db-list-row"));
  const fieldsPerRow = rowEls.map((row) => row.querySelectorAll<HTMLElement>(".db-list-field").length);
  const placeholderPerRow = rowEls.map((row) => row.querySelectorAll<HTMLElement>(".db-list-field.is-placeholder").length);
  const valuePerRow = rowEls.map((row) => row.querySelectorAll<HTMLElement>(".db-list-field:not(.is-placeholder)").length);
  const expectedFields = columns.length - 1;

  // The list is windowed, so "every row is rendered" is now deliberately false. The whole point of
  // windowing is that node count stops tracking row count, and that cannot be true while this
  // asserts the opposite — the two are the same claim pointing in opposite directions. What
  // replaces it is stricter about the thing that actually matters: the window must be a real
  // subset, neither empty nor the whole list.
  results.push({
    name: "the list mounts a window, not every row",
    pass: rowEls.length > 0 && rowEls.length < rows.length,
    detail: `${rowEls.length} .db-list-row mounted for ${rows.length} rows`,
  });
  // Counted per MOUNTED row rather than per row. The invariant is unchanged — one affordance per
  // row, so a second checkbox on any row still fails — but its denominator is now the rows that
  // exist in the DOM, which is the only set an affordance can belong to.
  results.push({
    name: "row open affordance is one per mounted row",
    pass: container.querySelectorAll("button.db-list-row-open").length === rowEls.length,
    detail: `${container.querySelectorAll("button.db-list-row-open").length} open buttons for ${rowEls.length} mounted rows`,
  });
  results.push({
    name: "row checkbox affordance is one per mounted row",
    pass: container.querySelectorAll("input.db-list-row-checkbox").length === rowEls.length,
    detail: `${container.querySelectorAll("input.db-list-row-checkbox").length} checkboxes for ${rowEls.length} mounted rows`,
  });
  results.push({
    name: "every row renders every non-title column",
    pass: fieldsPerRow.every((count) => count === expectedFields),
    detail: fieldsPerRow.length
      ? `field counts per row ${Math.min(...fieldsPerRow)}..${Math.max(...fieldsPerRow)}, want ${expectedFields}`
      : "no rows to count",
  });
  results.push({
    name: "empty slots reserve their column index",
    pass: rowEls.every((row) => {
      const columnsOnRow = Array.from(row.querySelectorAll<HTMLElement>(".db-list-field"))
        .map((field) => field.style.gridColumn)
        .sort((a, b) => Number(a) - Number(b));
      return columnsOnRow.length === expectedFields
        && columnsOnRow.every((value, index) => value === String(index + 1));
    }),
    detail: "every row's fields occupy grid columns 1..20 including placeholders",
  });
  results.push({
    name: `column "${ALIGNMENT_COLUMN}" sits at the same grid column on every row that renders it`,
    pass: (() => {
      // Placeholders do not carry the column-key attribute — only value fields
      // do — so the named column is only identifiable on rows where it has a
      // value. The empty rows' slots are covered by the reserve assertion.
      const fields = Array.from(container.querySelectorAll<HTMLElement>(
        `[data-note-database-column-key="${ALIGNMENT_COLUMN}"]`,
      ));
      return fields.length > 0 && fields.every((field) => field.style.gridColumn === ALIGNMENT_GRID_COLUMN);
    })(),
    detail: `"${ALIGNMENT_COLUMN}" fields: `
      + `${container.querySelectorAll(`[data-note-database-column-key="${ALIGNMENT_COLUMN}"]`).length} found, `
      + `grid columns ${[...new Set(Array.from(container.querySelectorAll<HTMLElement>(
        `[data-note-database-column-key="${ALIGNMENT_COLUMN}"]`,
      )).map((field) => field.style.gridColumn))].join(",") || "none"}`
      + `, want ${ALIGNMENT_GRID_COLUMN} on every one`,
  });
  results.push({
    name: "empty cells render as placeholders, never as skipped nodes",
    pass: placeholderPerRow.every((placeholders, index) => placeholders === expectedFields - valuePerRow[index])
      && placeholderPerRow.some((count) => count > 0),
    detail: `placeholders per row ${Math.min(...placeholderPerRow)}..${Math.max(...placeholderPerRow)} `
      + `against value fields ${Math.min(...valuePerRow)}..${Math.max(...valuePerRow)}`,
  });
  results.push({
    name: "row click reaches the record-panel action in the file-view bag",
    pass: bagName === "file-view"
      ? (() => {
          if (typeof bag.openRecordDetail !== "function") return false;
          let calls = 0;
          const original = bag.openRecordDetail;
          bag.openRecordDetail = () => { calls += 1; };
          const title = container.querySelector<HTMLElement>(".db-list-row-title");
          if (!title) return false;
          title.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
          bag.openRecordDetail = original;
          return calls === 1;
        })()
      : typeof bag.openRecordDetail !== "function",
    detail: bagName === "file-view"
      ? "clicking a row title must invoke openRecordDetail exactly once"
      : "the embed bag omits openRecordDetail, so its rows cannot open the record panel",
  });
  return results;
}

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
  const cards = container.querySelectorAll<HTMLElement>(".db-board-card").length;
  const columns = container.querySelectorAll<HTMLElement>(".db-board-column").length;

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

function timelineAssertions(container: HTMLElement): AssertionResult[] {
  const results: AssertionResult[] = [];
  const bars = container.querySelectorAll<HTMLElement>(".db-timeline-event").length;
  const lanes = container.querySelectorAll<HTMLElement>(".db-timeline-events").length;

  results.push({
    name: "the timeline drew its lanes",
    pass: lanes > 0,
    detail: `${lanes} lanes`,
  });
  results.push({
    name: "the drawn window is not empty",
    pass: bars > 0,
    detail: bars > 0
      ? `${bars} event bars drawn from ${TIMELINE_ROWS} rows`
      : "no event bar was drawn: every bound below this passes trivially on an empty window, "
        + "so this run proves nothing about the timeline",
  });
  return results;
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

export function runRenderAssertions(host: HTMLElement, scenario: ScenarioSpec, control = ""): ScenarioOutcome {
  const results: AssertionResult[] = [];
  const container = host.createDiv({ cls: "note-database-container" });
  const app = undefined as unknown as App;
  let bagKeys: string[] = [];

  if (scenario.renderer === "list") {
    const columns = makeListColumns(LIST_COLUMNS, "text");
    const rows = makeListRows(LIST_ROWS, columns, LIST_FILL);
    const config = makeListConfig(columns);
    const bag = scenario.bag === "file-view" ? fileViewListBag(columns) : embedListBag(columns);
    bagKeys = Object.keys(bag).sort();
    const renderer = new ListRenderer(app, bag);

    // Render first, then ask whether the output carries the renderer's marker:
    // the marker is applied by the render call itself, so checking before it
    // would fail every run.
    const stopCounting = countLayoutReads();
    renderer.render(container, config, rows);
    const layoutReads = stopCounting();

    results.push(provenanceResult(container, "list-renderer"));
    if (results[0].pass) {
      results.push(...listAssertions(container, rows, columns, bag, scenario.bag));
      results.push({
        name: "no forced layout inside the row loop",
        pass: layoutReads <= MAX_LAYOUT_READS,
        detail: `${layoutReads} layout reads during render, bound ${MAX_LAYOUT_READS}`
          + (layoutReads > MAX_LAYOUT_READS
            ? " — reads scale with rows, which is the quadratic shape that froze the app"
            : " (the touch-mode probe and reservation decision are the legitimate O(1) reads)"),
      });
    }
  } else if (scenario.renderer === "board") {
    const columns = makeBoardColumns(BOARD_COLUMNS, "text");
    const rows = makeBoardRows(BOARD_ROWS, columns, BOARD_FILL, BOARD_GROUPS);
    const groups = makeBoardGroups(rows, BOARD_GROUPS);
    const config = makeBoardConfig(columns);
    const bag = scenario.bag === "file-view" ? fileViewBoardBag(columns) : embedBoardBag(columns);
    bagKeys = Object.keys(bag).sort();
    if (control === "per-item") armPerItemRead(bag);
    const renderer = new BoardRenderer(app, bag);

    const stopCounting = countLayoutReads();
    renderer.render(container, config, groups, BOARD_GROUP_FIELD);
    const layoutReads = stopCounting();

    results.push(provenanceResult(container, "board-renderer"));
    if (results[0].pass) {
      results.push(...boardAssertions(container, rows));
      results.push({
        name: "no forced layout inside the card loop",
        pass: layoutReads <= MAX_LAYOUT_READS,
        detail: `${layoutReads} layout reads during render, bound ${MAX_LAYOUT_READS}`
          + (layoutReads > MAX_LAYOUT_READS
            ? " — reads scale with cards, which is the quadratic shape that froze the app"
            : " (the touch-mode probe is the legitimate O(1) read)"),
      });
    }
  } else if (scenario.renderer === "gallery") {
    const columns = makeGalleryColumns(GALLERY_COLUMNS, "text");
    const rows = makeGalleryRows(GALLERY_ROWS, columns, GALLERY_FILL);
    const config = makeGalleryConfig(columns);
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
    const columns = makeCalendarColumns(CALENDAR_COLUMNS, "text");
    const rows = makeCalendarRows(CALENDAR_ROWS, columns, CALENDAR_FILL);
    const config = makeCalendarConfig(columns, "month");
    const bag = scenario.bag === "file-view" ? fileViewCalendarBag(columns) : embedCalendarBag(columns);
    bagKeys = Object.keys(bag).sort();
    const renderer = new CalendarRenderer(bag);

    const stopCounting = countLayoutReads();
    renderer.render(container, config, rows);
    const layoutReads = stopCounting();

    results.push(provenanceResult(container, "calendar-renderer"));
    if (results[0].pass) {
      results.push(...calendarAssertions(container));
      results.push({
        name: "no forced layout inside the segment loop",
        pass: layoutReads <= MAX_LAYOUT_READS,
        detail: `${layoutReads} layout reads during render, bound ${MAX_LAYOUT_READS}`
          + (layoutReads > MAX_LAYOUT_READS
            ? " — reads scale with events, which is the quadratic shape that froze the app"
            : " (the window is sized once per render, not once per segment)"),
      });
    }
  } else if (scenario.renderer === "timeline") {
    const columns = makeTimelineColumns(TIMELINE_COLUMNS, "text");
    const rows = makeTimelineRows(TIMELINE_ROWS, columns, TIMELINE_FILL);
    const config = makeTimelineConfig(columns, "week");
    const bag = scenario.bag === "file-view" ? fileViewTimelineBag() : embedTimelineBag();
    bagKeys = Object.keys(bag).sort();
    const renderer = new CalendarTimelineRenderer(bag);

    const stopCounting = countLayoutReads();
    renderer.renderTimeline(container, config, rows);
    const layoutReads = stopCounting();

    results.push(provenanceResult(container, "timeline-renderer"));
    if (results[0].pass) {
      results.push(...timelineAssertions(container));
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
  } else {
    const columns = makeTableColumns(TABLE_COLUMNS);
    const rows = makeTableRows(TABLE_ROWS, columns);
    const config = makeTableConfig(columns);
    const bag = scenario.bag === "file-view" ? fileViewTableBag(columns) : embedTableBag(columns);
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

  container.remove();
  return { scenario, bagKeys, results };
}
