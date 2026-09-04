// ───────────────────────────────────────────────────────────────────
// MODULE:    table-render-bench
// COMPONENT: measures how table render cost scales with row count
// ───────────────────────────────────────────────────────────────────
//
// The research that motivated this reached a deliberate UNKNOWN: nothing
// established whether row count dominates cost, and it set a decision gate —
// support windowing only if same-condition measurements concentrate cost in
// table DOM and layout. Windowing is the most invasive option available, and
// it interacts with scroll anchoring, sticky headers, fixed column widths,
// keyboard traversal and every screenshot fixture. It should not be built on
// an intuition.
//
// WHAT THIS MEASURES: the real TableRenderer's skeleton, row loop and cell
// loop, plus the browser's forced layout, at several row counts.
//
// WHAT IT DOES NOT: row preparation, the metadata cache, computed-field
// evaluation, relation rollups, or the refresh coordinator's queueing. Those
// need a live vault. Cell *content* cost is also excluded deliberately — the
// stub cell writer is constant-time, which isolates the structural cost that
// windowing would actually remove. A slow cell renderer would confound that.
//
// So: this answers "does the table's own DOM work scale badly with rows", and
// nothing wider. Read it as one input to the gate, not the whole gate.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { TableRenderer, type TableRendererActions } from "../../src/views/table-renderer";
import type { ColumnDef, RowData, ViewConfig } from "../../src/data/types";

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURE
// ───────────────────────────────────────────────────────────────────

const COLUMN_COUNTS = [4, 16];
const ROW_COUNTS = [100, 500, 1000, 2000];
const REPEATS = 5;

// The types a capture of a configured table actually holds. Unused by `runBench` itself — the
// perf sweep stays on "text" so cell content cost never confounds the structural number — but the
// assertion harness's captureData option (render-assertion-harness.ts) needs the real renderer's
// typed branches (a select pill, a checkbox, a currency figure, a relation chip) exercised rather
// than the stub writer this file's cost-isolation depends on.
const MIXED_TYPES: ColumnDef["type"][] = [
  "text", "number", "date", "select", "multi-select", "checkbox", "relation", "currency",
];

function valueForType(col: ColumnDef, i: number): unknown {
  switch (col.type) {
    case "number": case "currency": return i * 37 + 0.5;
    case "date": case "datetime": return `2026-0${(i % 9) + 1}-1${i % 9}`;
    case "checkbox": return i % 2 === 0;
    case "multi-select": return [`tag-${i % 5}`, `tag-${(i + 2) % 5}`];
    case "relation": return `[[notes/row-${i % 20}]]`;
    default: return `${col.key}-${i}`;
  }
}

/** Exported for the assertion harness, which must render the same measured shape the bench times.
 *  "mixed" rotates every column but the first through MIXED_TYPES; the key/label naming stays
 *  `field${i}` either way, so a caller indexing by key (the harness's own column-alignment
 *  assertion) keeps finding the same column regardless of kind. */
export function makeColumns(count: number, kind: "text" | "mixed" = "text"): ColumnDef[] {
  return Array.from({ length: count }, (_unused, i) => ({
    key: i === 0 ? "file.name" : `field${i}`,
    label: i === 0 ? "Name" : `Field ${i}`,
    type: kind === "mixed" && i > 0 ? MIXED_TYPES[i % MIXED_TYPES.length] : "text",
  })) as ColumnDef[];
}

export function makeRows(count: number, columns: ColumnDef[]): RowData[] {
  return Array.from({ length: count }, (_unused, i) => {
    const frontmatter: Record<string, unknown> = {};
    for (const col of columns) frontmatter[col.key] = valueForType(col, i);
    return {
      file: { path: `notes/row-${i}.md`, basename: `row-${i}`, name: `row-${i}.md` },
      frontmatter,
      computed: {},
    } as unknown as RowData;
  });
}

export function makeConfig(columns: ColumnDef[]): ViewConfig {
  return { name: "Bench", sourceFolder: "notes", columns } as unknown as ViewConfig;
}

/** Minimal but honest: every required action, none of them doing work worth measuring. */
export function makeActions(columns: ColumnDef[]): TableRendererActions {
  return {
    getVisibleColumns: () => columns,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    setupColumnHeader: (th, col) => { th.setText(col.label); },
    setupRow: () => undefined,
    // Constant-time on purpose: this bench isolates structural cost, not cell rendering.
    renderCell: (td, row, col) => { td.setText(String(row.frontmatter[col.key] ?? "")); },
    createEntry: () => undefined,
  };
}

// ───────────────────────────────────────────────────────────────────
// 3. MEASUREMENT
// ───────────────────────────────────────────────────────────────────

export interface BenchSample {
  columns: number;
  rows: number;
  /** Median across repeats, in milliseconds. */
  renderMs: number;
  p95Ms: number;
  /** Forced layout after render — the cost windowing would actually remove. */
  layoutMs: number;
  domNodes: number;
  /** Milliseconds per row, the number that shows whether scaling is linear or worse. */
  msPerRow: number;
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

/**
 * Shape overrides, so a sweep can be pushed past the default range without editing this file.
 *
 * The defaults stop at 2,000 rows, and a scaling verdict taken from a range that stops below the
 * bend cannot see the bend. The list bench grew the same override for the same reason.
 */
export interface TableBenchOptions {
  rowCounts?: number[];
  columnCounts?: number[];
}

export function runBench(host: HTMLElement, detached = false, options: TableBenchOptions = {}): BenchSample[] {
  const samples: BenchSample[] = [];
  const columnCounts = options.columnCounts ?? COLUMN_COUNTS;
  const rowCounts = options.rowCounts ?? ROW_COUNTS;

  for (const columnCount of columnCounts) {
    const columns = makeColumns(columnCount);
    const config = makeConfig(columns);
    const actions = makeActions(columns);

    for (const rowCount of rowCounts) {
      const rows = makeRows(rowCount, columns);
      const renderTimes: number[] = [];
      let layoutMs = 0;
      let domNodes = 0;

      // One discarded warm-up: the first run pays for lazily-compiled paths and would skew a
      // median taken over a small number of repeats.
      for (let run = 0; run <= REPEATS; run += 1) {
        // Detached: build off-document, attach once. If this is linear while the attached path
        // is not, the cost is live-DOM insertion rather than anything in the render loop.
        const container = detached
          ? host.ownerDocument.createElement("div")
          : host.createDiv({ cls: "note-database-container" });
        if (detached) container.className = "note-database-container";
        const renderer = new TableRenderer(actions);

        const start = performance.now();
        renderer.renderTable(container, config, rows);
        if (detached) host.appendChild(container);
        const rendered = performance.now();

        // Reading offsetHeight forces the layout the render deferred, so the cost lands here
        // rather than silently at the next frame.
        const layoutStart = performance.now();
        void container.offsetHeight;
        const layoutEnd = performance.now();

        if (run > 0) {
          renderTimes.push(rendered - start);
          layoutMs += layoutEnd - layoutStart;
          domNodes = container.querySelectorAll("*").length;
        }
        container.remove();
      }

      const median = percentile(renderTimes, 0.5);
      samples.push({
        columns: columnCount,
        rows: rowCount,
        renderMs: Number(median.toFixed(2)),
        p95Ms: Number(percentile(renderTimes, 0.95).toFixed(2)),
        layoutMs: Number((layoutMs / REPEATS).toFixed(2)),
        domNodes,
        msPerRow: Number((median / rowCount).toFixed(4)),
      });
    }
  }

  return samples;
}
