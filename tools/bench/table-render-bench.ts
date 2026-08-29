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

function makeColumns(count: number): ColumnDef[] {
  return Array.from({ length: count }, (_unused, i) => ({
    key: i === 0 ? "file.name" : `field${i}`,
    label: i === 0 ? "Name" : `Field ${i}`,
    type: "text",
  })) as ColumnDef[];
}

function makeRows(count: number, columns: ColumnDef[]): RowData[] {
  return Array.from({ length: count }, (_unused, i) => {
    const frontmatter: Record<string, unknown> = {};
    for (const col of columns) frontmatter[col.key] = `${col.key}-${i}`;
    return {
      file: { path: `notes/row-${i}.md`, basename: `row-${i}`, name: `row-${i}.md` },
      frontmatter,
      computed: {},
    } as unknown as RowData;
  });
}

function makeConfig(columns: ColumnDef[]): ViewConfig {
  return { name: "Bench", sourceFolder: "notes", columns } as unknown as ViewConfig;
}

/** Minimal but honest: every required action, none of them doing work worth measuring. */
function makeActions(columns: ColumnDef[]): TableRendererActions {
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

export function runBench(host: HTMLElement, detached = false): BenchSample[] {
  const samples: BenchSample[] = [];

  for (const columnCount of COLUMN_COUNTS) {
    const columns = makeColumns(columnCount);
    const config = makeConfig(columns);
    const actions = makeActions(columns);

    for (const rowCount of ROW_COUNTS) {
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
