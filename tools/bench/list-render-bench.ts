// ───────────────────────────────────────────────────────────────────
// MODULE:    list-render-bench
// COMPONENT: measures list render cost against column count and how full the data is
// ───────────────────────────────────────────────────────────────────
//
// The list row renderer used to skip a property with no value and now builds
// every property, hiding the empty ones. That trade was made to fix alignment:
// a hidden field holds its column, so the column is an index rather than a
// count. What nothing measured is what it costs, and the answer depends on two
// numbers that no existing check varies — how many columns a database has, and
// how much of it is filled in.
//
// So this varies both. Fill rate is the axis that matters: at 100% both the old
// and new renderers build the same number of fields and look identical, which
// is exactly the shape every fixture and story already uses. The cost only
// appears as the data gets sparser, and it grows with column count.
//
// WHAT THIS MEASURES: the real ListRenderer's row loop and field loop, the DOM
// it produces, and the browser layout that follows.
//
// WHAT IT DOES NOT: row preparation, the metadata cache, computed fields,
// relation rollups. Those need a live vault. Field values here are plain text
// and constant-time, which isolates structural cost — and means a real database
// with relation or markdown columns pays more per field than this reports,
// never less.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ListRenderer, type ListGroup, type ListRendererActions } from "../../src/views/list-renderer";
import type { App } from "obsidian";
import type { ColumnDef, RowData, ViewConfig } from "../../src/data/types";

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURE
// ───────────────────────────────────────────────────────────────────

// Taken from the database in the operator's report rather than invented, so the column count is
// a measured property of a real database and not a number chosen to make a point.
const REPORTED_COLUMNS = [
  "notion_id", "month", "sort_key", "purchases", "subscriptions", "done", "added_to",
  "stocks", "date", "p_", "withdrawn", "balance", "category", "account", "note",
  "cleared", "transfer", "tag", "amount", "currency", "source",
];

/** Fraction of cells that hold a value. A personal database is mostly gaps, not mostly values. */
const DEFAULTS = {
  fillRates: [1, 0.3],
  columnCounts: [4, 21],
  rowCounts: [50, 100, 200, 400],
  repeats: 5,
  /** "text" isolates structural cost; "mixed" adds the types whose renderers do real work. */
  columnKind: "text" as "text" | "mixed",
};

export type BenchOptions = Partial<typeof DEFAULTS>;

/**
 * The types a real database actually holds. An empty value used to skip the renderer entirely, so
 * whatever these cost per field was previously never paid on a gap and is now paid on every one.
 */
const MIXED_TYPES: ColumnDef["type"][] = [
  "text", "number", "date", "select", "multi-select", "checkbox", "relation", "currency",
];

/** Exported for the assertion harness, which must render the same measured shape the bench times. */
export function makeColumns(count: number, kind: "text" | "mixed"): ColumnDef[] {
  return Array.from({ length: count }, (_unused, i) => {
    const base = {
      key: i === 0 ? "file.name" : REPORTED_COLUMNS[i % REPORTED_COLUMNS.length] + (i >= REPORTED_COLUMNS.length ? String(i) : ""),
      label: i === 0 ? "Name" : REPORTED_COLUMNS[i % REPORTED_COLUMNS.length],
      type: kind === "mixed" && i > 0 ? MIXED_TYPES[i % MIXED_TYPES.length] : "text",
    } as ColumnDef;
    // Markdown is the costliest text mode because it runs a parser per value, so a fifth of the
    // text columns use it rather than none of them.
    if (kind === "mixed" && base.type === "text" && i % 5 === 0) base.textRenderMode = "markdown";
    return base;
  });
}

/** A value each column type will actually accept, so no type falls back to an empty render. */
function valueForType(col: ColumnDef, i: number): unknown {
  switch (col.type) {
    case "number": case "currency": return i * 37 + 0.5;
    case "date": case "datetime": return `2026-0${(i % 9) + 1}-1${i % 9}`;
    case "checkbox": return i % 2 === 0;
    case "multi-select": return [`tag-${i % 5}`, `tag-${(i + 2) % 5}`];
    case "relation": return `[[notes/row-${i % 20}]]`;
    default: return col.textRenderMode === "markdown" ? `**${col.key}**-${i} _v_` : `${col.key}-${i}`;
  }
}

/**
 * Rows whose gaps are spread rather than clustered, and deterministic rather than random, so a
 * rerun measures the same shape. A row that is empty in the same columns every time would let a
 * per-column cost hide behind a cache that a real database would never hit.
 */
export function makeRows(count: number, columns: ColumnDef[], fillRate: number): RowData[] {
  return Array.from({ length: count }, (_unused, i) => {
    const frontmatter: Record<string, unknown> = {};
    columns.forEach((col, colIndex) => {
      const filled = fillRate >= 1 || ((i * 7 + colIndex * 3) % 10) < fillRate * 10;
      if (filled) frontmatter[col.key] = valueForType(col, i);
    });
    return {
      file: { path: `notes/row-${i}.md`, basename: `row-${i}`, name: `row-${i}.md` },
      frontmatter,
      computed: {},
    } as unknown as RowData;
  });
}

export function makeConfig(columns: ColumnDef[]): ViewConfig {
  return {
    name: "Bench",
    sourceFolder: "notes",
    schema: { columns, computedFields: [] },
  } as unknown as ViewConfig;
}

/** Every required action present, none of them doing work worth measuring. */
function makeActions(columns: ColumnDef[]): ListRendererActions {
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
    // Left editable on purpose. Read-only short-circuits the drag setup that reads layout, and
    // measuring the cheaper path would report a cost the operator's database never pays.
    isReadOnly: false,
  };
}

// ───────────────────────────────────────────────────────────────────
// 3. MEASUREMENT
// ───────────────────────────────────────────────────────────────────

export interface ListBenchSample {
  /** "flat" or "grouped". A grouped list is a different renderer entry point, not a variant of one. */
  shape?: "flat" | "grouped";
  columns: number;
  rows: number;
  fillRate: number;
  /** Median across repeats, in milliseconds. */
  renderMs: number;
  p95Ms: number;
  /**
   * Forced layout after render, kept separate so a layout cost cannot hide inside render time.
   *
   * Median across repeats like `renderMs`, because the budget asserts the two added together and
   * a median plus a mean is a statistic of nothing.
   */
  layoutMs: number;
  domNodes: number;
  fieldNodes: number;
  placeholderNodes: number;
  msPerRow: number;
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

export function runListBench(host: HTMLElement, options: BenchOptions = {}): ListBenchSample[] {
  const { fillRates, columnCounts, rowCounts, repeats: REPEATS, columnKind } = { ...DEFAULTS, ...options };
  const samples: ListBenchSample[] = [];
  // No metadata cache: the relation renderer treats a missing app as "resolve nothing" rather than
  // throwing, so a relation column still renders here, just without vault resolution.
  const app = undefined as unknown as App;

  for (const fillRate of fillRates) {
    for (const columnCount of columnCounts) {
      const columns = makeColumns(columnCount, columnKind);
      const config = makeConfig(columns);
      const actions = makeActions(columns);

      for (const rowCount of rowCounts) {
        const rows = makeRows(rowCount, columns, fillRate);
        const renderTimes: number[] = [];
        const layoutTimes: number[] = [];
        let domNodes = 0;
        let fieldNodes = 0;
        let placeholderNodes = 0;

        // One discarded warm-up: the first run pays for lazily-compiled paths.
        for (let run = 0; run <= REPEATS; run += 1) {
          const container = host.createDiv({ cls: "note-database-container" });
          // Give the container the surface's own viewport height.
          //
          // Without this it inherits an unconstrained host, and a windowed list computes its
          // window against a height nothing on a device would have. The old full-render numbers
          // were unaffected by it — every row was built regardless — so this changes nothing
          // historical, but it decides how many rows a window keeps and therefore what this bench
          // is measuring. A harness that supplies its own viewport is measuring the harness.
          container.setCssProps({ height: `${window.innerHeight}px` });
          const renderer = new ListRenderer(app, actions);

          const start = performance.now();
          renderer.render(container, config, rows);
          const rendered = performance.now();

          // Reading offsetHeight forces the layout the render deferred, so its cost lands here
          // rather than silently at the next frame.
          const layoutStart = performance.now();
          void container.offsetHeight;
          const layoutEnd = performance.now();

          if (run > 0) {
            renderTimes.push(rendered - start);
            layoutTimes.push(layoutEnd - layoutStart);
            domNodes = container.querySelectorAll("*").length;
            fieldNodes = container.querySelectorAll(".db-list-field").length;
            placeholderNodes = container.querySelectorAll(".db-list-field.is-placeholder").length;
          }
          container.remove();
        }

        const median = percentile(renderTimes, 0.5);
        samples.push({
          columns: columnCount,
          rows: rowCount,
          fillRate,
          renderMs: Number(median.toFixed(2)),
          p95Ms: Number(percentile(renderTimes, 0.95).toFixed(2)),
          layoutMs: Number(percentile(layoutTimes, 0.5).toFixed(2)),
          domNodes,
          fieldNodes,
          placeholderNodes,
          msPerRow: Number((median / rowCount).toFixed(4)),
        });
      }
    }
  }

  return samples;
}

// ───────────────────────────────────────────────────────────────────
// 4. THE GROUPED ARM
// ───────────────────────────────────────────────────────────────────

/**
 * One oversized group, which is the shape that still blocked after the flat list was windowed.
 *
 * A grouped list is a different entry point, not an option on the flat one, so nothing the flat
 * bench measured said anything about it. Grouping does have a row cap, but it defaults to "all",
 * so a database grouped by a field most of its rows share renders every one of them.
 *
 * The distribution is deliberate: most rows in a single group, the rest spread thin. A bench that
 * split rows evenly across many groups would keep every section under the windowing threshold and
 * report a cost the operator's database never pays — the harness choosing the shape that passes.
 */
function makeGroups(rows: RowData[], groupCount: number): ListGroup[] {
  const groups: ListGroup[] = Array.from({ length: groupCount }, (_unused, i) => ({
    key: `group-${i}`,
    rows: [],
    count: 0,
  }));
  rows.forEach((row, i) => {
    // Nine in ten land in group 0; the remainder round-robin through the others.
    const target = i % 10 === 0 && groupCount > 1 ? 1 + (i % (groupCount - 1)) : 0;
    groups[target].rows.push(row);
  });
  for (const group of groups) group.count = group.rows.length;
  return groups;
}

export function runGroupedListBench(host: HTMLElement, options: BenchOptions = {}): ListBenchSample[] {
  const { fillRates, columnCounts, rowCounts, repeats: REPEATS, columnKind } = { ...DEFAULTS, ...options };
  const samples: ListBenchSample[] = [];
  const app = undefined as unknown as App;

  for (const fillRate of fillRates) {
    for (const columnCount of columnCounts) {
      const columns = makeColumns(columnCount, columnKind);
      const config = makeConfig(columns);
      const actions = makeActions(columns);

      for (const rowCount of rowCounts) {
        const rows = makeRows(rowCount, columns, fillRate);
        const groups = makeGroups(rows, 4);
        const renderTimes: number[] = [];
        const layoutTimes: number[] = [];
        let domNodes = 0;
        let fieldNodes = 0;
        let placeholderNodes = 0;

        for (let run = 0; run <= REPEATS; run += 1) {
          const container = host.createDiv({ cls: "note-database-container" });
          // The same viewport the flat arm gives itself. A windowed section keeps rows against the
          // scroller's height, so a harness with no height decides the answer instead of measuring it.
          container.setCssProps({ height: `${window.innerHeight}px` });
          const renderer = new ListRenderer(app, actions);

          const start = performance.now();
          renderer.renderGrouped(container, config, groups, "category");
          const rendered = performance.now();

          const layoutStart = performance.now();
          void container.offsetHeight;
          const layoutEnd = performance.now();

          if (run > 0) {
            renderTimes.push(rendered - start);
            layoutTimes.push(layoutEnd - layoutStart);
            domNodes = container.querySelectorAll("*").length;
            fieldNodes = container.querySelectorAll(".db-list-field").length;
            placeholderNodes = container.querySelectorAll(".db-list-field.is-placeholder").length;
          }
          container.remove();
        }

        const median = percentile(renderTimes, 0.5);
        samples.push({
          shape: "grouped",
          columns: columnCount,
          rows: rowCount,
          fillRate,
          renderMs: Number(median.toFixed(2)),
          p95Ms: Number(percentile(renderTimes, 0.95).toFixed(2)),
          layoutMs: Number(percentile(layoutTimes, 0.5).toFixed(2)),
          domNodes,
          fieldNodes,
          placeholderNodes,
          msPerRow: Number((median / rowCount).toFixed(4)),
        });
      }
    }
  }

  return samples;
}
