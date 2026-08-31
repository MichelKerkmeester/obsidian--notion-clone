// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-render-bench
// COMPONENT: measures calendar render cost against event count, column count and how full the data is
// ───────────────────────────────────────────────────────────────────
//
// The list, board and gallery each shared a per-row scan over the whole row set
// and each had a bench that could see it. The calendar had neither: it does not
// call that helper, and no bench ever drove it. It was reported freezing on a
// real device with no measurement of any kind behind the report, which is the
// gap this closes.
//
// WHAT THIS MEASURES: the real CalendarRenderer's whole render call — the event
// model it builds from every row, the month grid, and the segments it lays into
// that grid — plus the browser layout that follows.
//
// WHAT IT DOES NOT: row preparation, the metadata cache, computed fields,
// relation rollups. Those need a live vault. Field values here are plain text
// and constant-time, so a real database pays more per field than this reports,
// never less.
//
// TWO PROPERTIES OF THE CALENDAR DECIDE HOW THIS FIXTURE IS BUILT, and getting
// either wrong measures an empty grid rather than a busy one:
//
//   1. With no date-like column the renderer draws its empty state and returns.
//      A text-only column set would make every sample measure that early exit,
//      so a date column is forced in regardless of the requested column kind.
//   2. The month view draws one anchor month, and the anchor is taken from the
//      first event when the config does not pin one. Dates spread across a year
//      would leave eleven twelfths of the rows outside the drawn window, so the
//      fixture concentrates every event into a single month.
//
// The event count that reaches the grid is reported separately from the row
// count for exactly this reason: a render that drew nothing must be legible as
// such rather than passing as a fast one.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { CalendarRenderer, type CalendarRendererActions } from "../../src/views/calendar-renderer";
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

/** The field every event is dated by. Held apart from the generated column keys so the
 *  fixture cannot silently stop having a date column when the generated names change. */
const EVENT_DATE_FIELD = "event_date";

/** The single month every event falls in. February is deliberate: a short month packs the
 *  same event count into fewer day cells, which is the denser and slower arrangement. */
const EVENT_MONTH = "2026-02";
const EVENT_MONTH_DAYS = 28;

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
  /** Month is the reported scale. Week and day draw a narrower window and fewer events. */
  scale: "month" as "month" | "week" | "day",
};

export type CalendarBenchOptions = Partial<typeof DEFAULTS>;

const MIXED_TYPES: ColumnDef["type"][] = [
  "text", "number", "date", "select", "multi-select", "checkbox", "relation", "currency",
];

/**
 * The generated columns, with a date column forced into the second slot.
 *
 * The first slot is the file name, as everywhere else in these benches. The second is the event
 * date, because a calendar with no date-like column renders its empty state — measuring that
 * would report a fast calendar and prove nothing about the one the operator opened.
 */
export function makeColumns(count: number, kind: "text" | "mixed"): ColumnDef[] {
  return Array.from({ length: count }, (_unused, i) => {
    if (i === 0) return { key: "file.name", label: "Name", type: "text" } as ColumnDef;
    if (i === 1) return { key: EVENT_DATE_FIELD, label: "Event date", type: "date" } as ColumnDef;
    const base = {
      key: REPORTED_COLUMNS[i % REPORTED_COLUMNS.length] + (i >= REPORTED_COLUMNS.length ? String(i) : ""),
      label: REPORTED_COLUMNS[i % REPORTED_COLUMNS.length],
      type: kind === "mixed" ? MIXED_TYPES[i % MIXED_TYPES.length] : "text",
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

/** A date inside the drawn month, spread across its days rather than piled on one. */
function eventDate(i: number): string {
  return `${EVENT_MONTH}-${String((i % EVENT_MONTH_DAYS) + 1).padStart(2, "0")}`;
}

/**
 * Rows whose gaps are spread rather than clustered, and deterministic rather than random, so a
 * rerun measures the same shape.
 *
 * The event date is exempt from the fill rate. A partially-dated set would make the fill rate
 * change the event count as well as the field count, and then a cheaper sample could not be
 * told apart from a smaller one.
 */
export function makeRows(count: number, columns: ColumnDef[], fillRate: number): RowData[] {
  return Array.from({ length: count }, (_unused, i) => {
    const frontmatter: Record<string, unknown> = { [EVENT_DATE_FIELD]: eventDate(i) };
    columns.forEach((col, colIndex) => {
      if (col.key === EVENT_DATE_FIELD || col.key === "file.name") return;
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

export function makeConfig(columns: ColumnDef[], scale: "month" | "week" | "day"): ViewConfig {
  return {
    name: "Bench",
    sourceFolder: "notes",
    viewType: "calendar",
    calendarScale: scale,
    calendarStartDateField: EVENT_DATE_FIELD,
    // Pinned rather than inferred from the first event, so a fixture change that stopped
    // producing events would draw an empty month instead of quietly drawing today's.
    calendarMonth: EVENT_MONTH,
    // The day scale anchors on its own key and falls back to today, which is nowhere near the
    // fixture's month: left unset it draws an empty day and reports a fast calendar that
    // rendered none of the events it was given.
    calendarDay: `${EVENT_MONTH}-16`,
    schema: { columns, computedFields: [] },
  } as unknown as ViewConfig;
}

/**
 * Every required action present, none of them doing work worth measuring.
 *
 * `isReadOnly` is omitted rather than set, matching the shipped construction sites: the drag and
 * resize wiring that a read-only calendar skips is wiring the operator's calendar pays for.
 */
function makeActions(columns: ColumnDef[]): CalendarRendererActions {
  return {
    openRow: () => undefined,
    getColumns: () => columns,
  };
}

// ───────────────────────────────────────────────────────────────────
// 3. MEASUREMENT
// ───────────────────────────────────────────────────────────────────

export interface CalendarBenchSample {
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
  /** Event segments actually drawn into the grid. Zero means the sample measured an empty month. */
  cardNodes: number;
  /** Day cells in the drawn grid — bounded by the window, not by the row count. */
  fieldNodes: number;
  msPerRow: number;
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

export function runCalendarBench(host: HTMLElement, options: CalendarBenchOptions = {}): CalendarBenchSample[] {
  const { fillRates, columnCounts, rowCounts, repeats: REPEATS, columnKind, scale } = { ...DEFAULTS, ...options };
  const samples: CalendarBenchSample[] = [];

  for (const fillRate of fillRates) {
    for (const columnCount of columnCounts) {
      const columns = makeColumns(columnCount, columnKind);
      const config = makeConfig(columns, scale);
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
          const renderer = new CalendarRenderer(actions);

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
            cardNodes = container.querySelectorAll(
              ".db-calendar-month-segment, .db-calendar-week-allday-segment, .db-calendar-timed-event",
            ).length;
            fieldNodes = container.querySelectorAll(".db-calendar-day").length;
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
