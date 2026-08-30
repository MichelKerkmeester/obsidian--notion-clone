// ───────────────────────────────────────────────────────────────────
// MODULE:    board-render-bench
// COMPONENT: measures board render cost against card count, column count and how full the data is
// ───────────────────────────────────────────────────────────────────
//
// The board builds one card per row across a handful of group columns, and each
// card is appended to the same cards container its predecessors were appended
// to. Anything inside that loop which reads layout — an element's box, its
// width, its offset — forces the browser to flush the tree built so far before
// it can answer. Do that once per card and the work the browser does is the sum
// of every prefix, which is quadratic in card count rather than linear.
//
// WHAT THIS MEASURES: the real BoardRenderer's group loop and card loop, the
// DOM it produces, and the browser layout that follows.
//
// WHAT IT DOES NOT: row preparation, the metadata cache, computed fields,
// relation rollups, cover images. Those need a live vault. Field values here
// are plain text and constant-time, which isolates structural cost — and means
// a real database with relation or markdown columns pays more per field than
// this reports, never less.
//
// The fixture deliberately leaves `isReadOnly` unset rather than false. The
// shipped board is constructed without that key at all, so it is `undefined`
// there, and every guard written as `!isReadOnly` takes its expensive arm. A
// fixture that passed `false` would measure the same path; one that passed
// `true` would measure a board no user of the main view has.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { BoardRenderer, type BoardGroup, type BoardRendererActions } from "../../src/views/board-renderer";
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

/** The column the board groups by. Present in the schema so the renderer excludes it from cards. */
const GROUP_FIELD = "board_status";

/** A kanban is a few columns wide, not a few hundred. Five is a normal working board. */
const GROUP_KEYS = ["backlog", "todo", "doing", "review", "done"];

/**
 * Row counts start where the earlier list ceiling stopped and go two doublings past it.
 *
 * A quadratic term is invisible until the linear term stops dominating. Sampling 50–400, as the
 * first harness did, measures entirely below that crossover and reports a clean straight line —
 * which is exactly why every earlier reading missed this. The bend sits between 1,600 and 3,200,
 * so the ladder has to bracket it on both sides to show a slope at all.
 */
const DEFAULTS = {
  fillRates: [1, 0.3],
  columnCounts: [4, 21],
  rowCounts: [400, 1600, 3200, 6400],
  groupCount: GROUP_KEYS.length,
  repeats: 3,
  /** "text" isolates structural cost; "mixed" adds the types whose renderers do real work. */
  columnKind: "text" as "text" | "mixed",
};

export type BoardBenchOptions = Partial<typeof DEFAULTS>;

/**
 * The types a real database actually holds. Structural cost is the subject here, so the default
 * stays "text"; "mixed" is available for a run that wants per-type renderer cost in the number.
 */
const MIXED_TYPES: ColumnDef["type"][] = [
  "text", "number", "date", "select", "multi-select", "checkbox", "relation", "currency",
];

function makeColumns(count: number, kind: "text" | "mixed"): ColumnDef[] {
  const columns = Array.from({ length: count }, (_unused, i) => {
    const base = {
      key: i === 0 ? "file.name" : REPORTED_COLUMNS[i % REPORTED_COLUMNS.length] + (i >= REPORTED_COLUMNS.length ? String(i) : ""),
      label: i === 0 ? "Name" : REPORTED_COLUMNS[i % REPORTED_COLUMNS.length],
      type: kind === "mixed" && i > 0 ? MIXED_TYPES[i % MIXED_TYPES.length] : "text",
    } as ColumnDef;
    if (kind === "mixed" && base.type === "text" && i % 5 === 0) base.textRenderMode = "markdown";
    return base;
  });
  // The grouping column has to exist in the schema, or the renderer cannot resolve group display
  // and the cards keep a field the real board would have consumed into the column header.
  columns.push({ key: GROUP_FIELD, label: "Status", type: "select" } as ColumnDef);
  return columns;
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
function makeRows(count: number, columns: ColumnDef[], fillRate: number, groupCount: number): RowData[] {
  return Array.from({ length: count }, (_unused, i) => {
    const frontmatter: Record<string, unknown> = {};
    columns.forEach((col, colIndex) => {
      if (col.key === GROUP_FIELD) return;
      const filled = fillRate >= 1 || ((i * 7 + colIndex * 3) % 10) < fillRate * 10;
      if (filled) frontmatter[col.key] = valueForType(col, i);
    });
    frontmatter[GROUP_FIELD] = GROUP_KEYS[i % groupCount];
    return {
      file: { path: `notes/row-${i}.md`, basename: `row-${i}`, name: `row-${i}.md` },
      frontmatter,
      computed: {},
    } as unknown as RowData;
  });
}

/** Rows dealt round-robin across the board's columns, so no single column carries the whole load. */
function makeGroups(rows: RowData[], groupCount: number): BoardGroup[] {
  const keys = GROUP_KEYS.slice(0, groupCount);
  return keys.map((key) => {
    const groupRows = rows.filter((row) => (row as unknown as { frontmatter: Record<string, unknown> }).frontmatter[GROUP_FIELD] === key);
    return { key, rows: groupRows, count: groupRows.length };
  });
}

function makeConfig(columns: ColumnDef[]): ViewConfig {
  return {
    name: "Bench",
    sourceFolder: "notes",
    viewType: "board",
    boardGroupField: GROUP_FIELD,
    // Absent group row limit means every card renders. A limit would cap the card count and
    // measure a board that stops before the size under investigation.
    schema: { columns, computedFields: [] },
  } as unknown as ViewConfig;
}

/**
 * Every required action present, none of them doing work worth measuring.
 *
 * `isReadOnly` is omitted rather than set, because the shipped board omits it. See the module
 * header: setting it either way would measure a board the main view does not construct.
 */
function makeActions(columns: ColumnDef[]): BoardRendererActions {
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
  };
}

// ───────────────────────────────────────────────────────────────────
// 3. MEASUREMENT
// ───────────────────────────────────────────────────────────────────

export interface BoardBenchSample {
  columns: number;
  rows: number;
  groups: number;
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
  cardNodes: number;
  fieldNodes: number;
  msPerRow: number;
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

export function runBoardBench(host: HTMLElement, options: BoardBenchOptions = {}): BoardBenchSample[] {
  const { fillRates, columnCounts, rowCounts, groupCount, repeats: REPEATS, columnKind } = { ...DEFAULTS, ...options };
  const samples: BoardBenchSample[] = [];
  // No metadata cache: the renderers treat a missing app as "resolve nothing" rather than throwing.
  const app = undefined as unknown as App;

  for (const fillRate of fillRates) {
    for (const columnCount of columnCounts) {
      const columns = makeColumns(columnCount, columnKind);
      const config = makeConfig(columns);
      const actions = makeActions(columns);

      for (const rowCount of rowCounts) {
        const rows = makeRows(rowCount, columns, fillRate, groupCount);
        const groups = makeGroups(rows, groupCount);
        const renderTimes: number[] = [];
        const layoutTimes: number[] = [];
        let domNodes = 0;
        let cardNodes = 0;
        let fieldNodes = 0;

        // One discarded warm-up: the first run pays for lazily-compiled paths.
        for (let run = 0; run <= REPEATS; run += 1) {
          const container = host.createDiv({ cls: "note-database-container" });
          const renderer = new BoardRenderer(app, actions);

          const start = performance.now();
          renderer.render(container, config, groups, GROUP_FIELD);
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
            cardNodes = container.querySelectorAll(".db-board-card").length;
            fieldNodes = container.querySelectorAll(".db-board-card-meta > *").length;
          }
          container.remove();
        }

        const median = percentile(renderTimes, 0.5);
        samples.push({
          columns: columnCount,
          rows: rowCount,
          groups: groups.length,
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
