// ───────────────────────────────────────────────────────────────────
// MODULE:    gallery-render-bench
// COMPONENT: measures gallery render cost against card count, column count and how full the data is
// ───────────────────────────────────────────────────────────────────
//
// The gallery is the board's structural twin: one card per row, appended in a
// loop to a single container. Three separate per-card decisions asked whether
// the surface takes touch input — the resize handle, the grouped drag setup and
// the reorder drag setup — and each answer read the container's box, forcing the
// browser to lay out every card appended so far.
//
// WHAT THIS MEASURES: the real GalleryRenderer's card loop and field loop, the
// DOM it produces, and the browser layout that follows.
//
// WHAT IT DOES NOT: row preparation, the metadata cache, computed fields,
// relation rollups, cover images. Those need a live vault. Field values here
// are plain text and constant-time, which isolates structural cost — and means
// a real database with relation or markdown columns pays more per field than
// this reports, never less.
//
// The fixture leaves `isReadOnly` unset rather than false, because the shipped
// gallery is constructed without that key. One of the three per-card calls sat
// outside the read-only guard entirely, so it ran on every card regardless.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { GalleryRenderer, type GalleryRendererActions } from "../../src/views/gallery-renderer";
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

/**
 * Row counts start where the earlier ceiling stopped and go two doublings past it, because a
 * quadratic term is invisible until the linear term stops dominating.
 */
const DEFAULTS = {
  fillRates: [1, 0.3],
  columnCounts: [4, 21],
  rowCounts: [400, 1600, 3200, 6400],
  repeats: 3,
  /** "text" isolates structural cost; "mixed" adds the types whose renderers do real work. */
  columnKind: "text" as "text" | "mixed",
};

export type GalleryBenchOptions = Partial<typeof DEFAULTS>;

const MIXED_TYPES: ColumnDef["type"][] = [
  "text", "number", "date", "select", "multi-select", "checkbox", "relation", "currency",
];

function makeColumns(count: number, kind: "text" | "mixed"): ColumnDef[] {
  return Array.from({ length: count }, (_unused, i) => {
    const base = {
      key: i === 0 ? "file.name" : REPORTED_COLUMNS[i % REPORTED_COLUMNS.length] + (i >= REPORTED_COLUMNS.length ? String(i) : ""),
      label: i === 0 ? "Name" : REPORTED_COLUMNS[i % REPORTED_COLUMNS.length],
      type: kind === "mixed" && i > 0 ? MIXED_TYPES[i % MIXED_TYPES.length] : "text",
    } as ColumnDef;
    if (kind === "mixed" && base.type === "text" && i % 5 === 0) base.textRenderMode = "markdown";
    return base;
  });
}

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
 * rerun measures the same shape.
 */
function makeRows(count: number, columns: ColumnDef[], fillRate: number): RowData[] {
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

function makeConfig(columns: ColumnDef[]): ViewConfig {
  return {
    name: "Bench",
    sourceFolder: "notes",
    viewType: "gallery",
    schema: { columns, computedFields: [] },
  } as unknown as ViewConfig;
}

/**
 * Every required action present, none of them doing work worth measuring.
 *
 * `isReadOnly` is omitted rather than set, because the shipped gallery omits it.
 */
function makeActions(columns: ColumnDef[]): GalleryRendererActions {
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
  };
}

// ───────────────────────────────────────────────────────────────────
// 3. MEASUREMENT
// ───────────────────────────────────────────────────────────────────

export interface GalleryBenchSample {
  columns: number;
  rows: number;
  fillRate: number;
  /** Median across repeats, in milliseconds. */
  renderMs: number;
  p95Ms: number;
  /**
   * Forced layout after render, kept separate so a layout cost cannot hide inside render time.
   * Median across repeats like `renderMs`, because the budget asserts the two added together.
   */
  layoutMs: number;
  domNodes: number;
  cardNodes: number;
  fieldNodes: number;
  msPerRow: number;
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

export function runGalleryBench(host: HTMLElement, options: GalleryBenchOptions = {}): GalleryBenchSample[] {
  const { fillRates, columnCounts, rowCounts, repeats: REPEATS, columnKind } = { ...DEFAULTS, ...options };
  const samples: GalleryBenchSample[] = [];
  // No metadata cache: the renderers treat a missing app as "resolve nothing" rather than throwing.
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
        let cardNodes = 0;
        let fieldNodes = 0;

        // One discarded warm-up: the first run pays for lazily-compiled paths.
        for (let run = 0; run <= REPEATS; run += 1) {
          const container = host.createDiv({ cls: "note-database-container" });
          const renderer = new GalleryRenderer(app, actions);

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
            cardNodes = container.querySelectorAll(".db-gallery-card").length;
            fieldNodes = container.querySelectorAll(".db-gallery-meta > *").length;
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
          cardNodes,
          fieldNodes,
          msPerRow: Number((median / rowCount).toFixed(4)),
        });
      }
    }
  }

  return samples;
}
