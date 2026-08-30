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

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ListRenderer, type ListRendererActions } from "../../src/views/list-renderer";
import { TableRenderer, type TableRendererActions } from "../../src/views/table-renderer";
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
export const MAX_LAYOUT_READS = 8;

export interface ScenarioSpec {
  renderer: "list" | "table";
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

// Armed once at module load, in the browser only: the harness is bundled into
// the render entry and never runs outside it.
tagListRenders();
tagTableRenders();

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
  let count = 0;
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
      return (original as (...rest: unknown[]) => unknown).apply(this, args);
    };
    restored.push(() => {
      elementProto[name] = original;
    });
  }
  const originalStyle = win.getComputedStyle.bind(win);
  win.getComputedStyle = ((el: Element, pseudo?: string | null) => {
    count += 1;
    return originalStyle(el, pseudo);
  }) as typeof win.getComputedStyle;
  restored.push(() => {
    win.getComputedStyle = originalStyle;
  });

  return () => {
    for (const restore of restored) restore();
    return count;
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

  results.push({
    name: "rows rendered",
    pass: rowEls.length === rows.length,
    detail: `${rowEls.length} .db-list-row for ${rows.length} rows`,
  });
  results.push({
    name: "row open affordance is one per row",
    pass: container.querySelectorAll("button.db-list-row-open").length === rows.length,
    detail: `${container.querySelectorAll("button.db-list-row-open").length} open buttons for ${rows.length} rows`,
  });
  results.push({
    name: "row checkbox affordance is one per row",
    pass: container.querySelectorAll("input.db-list-row-checkbox").length === rows.length,
    detail: `${container.querySelectorAll("input.db-list-row-checkbox").length} checkboxes for ${rows.length} rows`,
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

// ───────────────────────────────────────────────────────────────────
// 7. SCENARIO RUNNER
// ───────────────────────────────────────────────────────────────────

export function runRenderAssertions(host: HTMLElement, scenario: ScenarioSpec): ScenarioOutcome {
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
  } else {
    const columns = makeTableColumns(TABLE_COLUMNS);
    const rows = makeTableRows(TABLE_ROWS, columns);
    const config = makeTableConfig(columns);
    const bag = scenario.bag === "file-view" ? fileViewTableBag(columns) : embedTableBag(columns);
    bagKeys = Object.keys(bag).sort();
    const renderer = new TableRenderer(bag);

    const stopCounting = countRowAppendsToConnectedNodes();
    renderer.renderTable(container, config, rows);
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
    }
  }

  container.remove();
  return { scenario, bagKeys, results };
}
