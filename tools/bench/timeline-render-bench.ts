// ───────────────────────────────────────────────────────────────────
// MODULE:    timeline-render-bench
// COMPONENT: measures timeline render cost against event count, column count and how full the data is
// ───────────────────────────────────────────────────────────────────
//
// The timeline was reported freezing alongside the calendar and, like it, had
// no bench and does not call the per-row helper whose removal fixed the list,
// board and gallery. Its event loop does something those three no longer do:
// it asks whether the surface takes touch input once per event, and that
// question is answered by reading the container's box while events are still
// being appended to it. Whether that costs what its shape suggests is a
// measurement, and this is the instrument that takes it.
//
// WHAT THIS MEASURES: the real CalendarTimelineRenderer's whole render call —
// the model it builds from every row, the axis, the lanes, and the event bars
// it lays into them — plus the browser layout that follows.
//
// WHAT IT DOES NOT: row preparation, the metadata cache, computed fields,
// relation rollups. Those need a live vault. Field values here are plain text
// and constant-time, so a real database pays more per field than this reports,
// never less.
//
// THE FIXTURE HAS TO LAND ITS EVENTS INSIDE THE DRAWN WINDOW, and two things
// stop it doing so by accident:
//
//   1. With no date-like column the renderer draws its empty state and returns,
//      so a date column is forced in regardless of the requested column kind.
//   2. The timeline draws a window of units sized from the viewport, not the
//      whole data range. Dates spread across a year would leave nearly every
//      event off-window and unrendered, so the fixture packs them into a span
//      narrow enough to sit inside the window at both measured widths.
//
// The rendered event count is reported separately from the row count for that
// reason: a render that drew nothing must be legible as such rather than
// passing as a fast one.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import {
  CalendarTimelineRenderer,
  type CalendarTimelineRendererActions,
} from "../../src/views/calendar-timeline-renderer";
import { addDateKeyDays, getLocalDateKey } from "../../src/data/calendar-date-time";
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

/** The first day of the drawn span, and how many days the events spread over. The span is
 *  kept short so every event sits inside the viewport-sized window at 390px as well as
 *  1100px — a wider spread would measure the narrow surface drawing fewer events than the
 *  wide one, and report that difference as a speed-up. The span is anchored around the
 *  current date (the render harness does not freeze a "today"): the default render scrolls
 *  to today on first paint, so a fixed past span would photograph an empty chart. Four days
 *  back keeps the ten-day window covering today at every offset. */
const EVENT_START = addDateKeyDays(getLocalDateKey(new Date()), -4);
export const EVENT_WINDOW_DAYS = 10;

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
  /** Week puts the unit at one day, which is the densest arrangement of the reported scales. */
  scale: "week" as "day" | "week" | "month" | "quarter" | "year",
};

export type TimelineBenchOptions = Partial<typeof DEFAULTS>;

const MIXED_TYPES: ColumnDef["type"][] = [
  "text", "number", "date", "select", "multi-select", "checkbox", "relation", "currency",
];

/**
 * The generated columns, with a date column forced into the second slot.
 *
 * The first slot is the file name, as everywhere else in these benches. The second is the event
 * date, because a timeline with no date-like column renders its empty state — measuring that
 * would report a fast timeline and prove nothing about the one the operator opened.
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

/**
 * The pure day-arithmetic behind `eventDate`, exported so a test can probe month/year
 * rollover with an explicit worst-case start date rather than depending on whatever "today"
 * happens to be when the suite runs. `addDateKeyDays` carries real calendar rollover (August
 * 31 + 1 day is September 1); the day-of-month string arithmetic this replaced did not, and
 * silently produced out-of-range dates like "2026-08-32" whenever EVENT_START's day-of-month
 * plus an offset from `i % EVENT_WINDOW_DAYS` crossed the end of its month. An out-of-range
 * date fails to parse, so `buildCalendarTimelineEvents` drops that row's event — the bar,
 * milestone diamond or dependency arrow the constructed captures exist to prove never draws.
 */
export function eventDateFrom(start: string, i: number): string {
  return addDateKeyDays(start, i % EVENT_WINDOW_DAYS);
}

/** A date inside the drawn span, spread across its days rather than piled on one. */
function eventDate(i: number): string {
  return eventDateFrom(EVENT_START, i);
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
    // A sparse, deterministic spread of the affordances the constructed captures must show:
    // progress fill on every fourth row, a milestone diamond on the first row, and a
    // dependency arrow from row 0 into row 2 (both near the top of the scrolled-to-today view).
    if (i % 4 === 0) frontmatter.progress = 60;
    if (i === 1) frontmatter.milestone = "milestone";
    if (i % 5 === 0 && i > 0) frontmatter.dependencies = [`notes/row-${i - 1}.md`];
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

export function makeConfig(columns: ColumnDef[], scale: TimelineBenchOptions["scale"]): ViewConfig {
  return {
    name: "Bench",
    sourceFolder: "notes",
    viewType: "calendar",
    calendarScale: "timeline",
    timelineScale: scale,
    timelineStartDateField: EVENT_DATE_FIELD,
    // The gantt's range is task-driven and its first paint scrolls to today, so the
    // today-relative span above keeps bars on screen. The anchor is inert on the default
    // path but keeps the local-extension path's window deterministic if a bench ever
    // enables that gated renderer.
    timelineAnchor: EVENT_START,
    schema: { columns, computedFields: [] },
  } as unknown as ViewConfig;
}

/**
 * Every required action present, none of them doing work worth measuring.
 *
 * `isReadOnly` is omitted rather than set, matching the shipped construction sites: the drag and
 * resize wiring that a read-only timeline skips is wiring the operator's timeline pays for.
 */
function makeActions(): CalendarTimelineRendererActions {
  return {
    openRow: () => undefined,
  };
}

// ───────────────────────────────────────────────────────────────────
// 3. MEASUREMENT
// ───────────────────────────────────────────────────────────────────

export interface TimelineBenchSample {
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
  /** Event bars actually drawn. Zero means the sample measured an empty window. */
  cardNodes: number;
  /** Lane rows in the drawn window. */
  fieldNodes: number;
  msPerRow: number;
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

export function runTimelineBench(host: HTMLElement, options: TimelineBenchOptions = {}): TimelineBenchSample[] {
  const { fillRates, columnCounts, rowCounts, repeats: REPEATS, columnKind, scale } = { ...DEFAULTS, ...options };
  const samples: TimelineBenchSample[] = [];

  for (const fillRate of fillRates) {
    for (const columnCount of columnCounts) {
      const columns = makeColumns(columnCount, columnKind);
      const config = makeConfig(columns, scale);
      const actions = makeActions();

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
          const renderer = new CalendarTimelineRenderer(actions);

          const start = performance.now();
          renderer.renderTimeline(container, config, rows);
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
            cardNodes = container.querySelectorAll(".db-timeline-event").length;
            fieldNodes = container.querySelectorAll(".db-timeline-events").length;
          }
          // The renderer holds a ResizeObserver and timers across renders; dropping the
          // container without this leaks one of each per sample and the later samples
          // measure a browser busier than the one the earlier samples measured.
          renderer.destroy();
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
