// ───────────────────────────────────────────────────────────────────
// MODULE:    temporal-tick-parity
// COMPONENT: proves the timeline fixture's hand-mirrored geometry against the real model
// ───────────────────────────────────────────────────────────────────

// The timeline screenshot fixtures cannot import calendar-timeline-model.ts or
// calendar-title-formatter.ts directly: `npm run screenshots` runs
// `node tools/screenshots/capture.mjs` under plain node, with no ts-node/tsx step in that
// pipeline, and no other scenario file imports from src/. So temporal.mjs mirrors
// buildTimelineTicks()'s date arithmetic, buildTimelineAxisBands()'s week-scale band, and the
// render loop's own per-event clip decision by hand — and exports every one of those mirror
// functions so this file asserts the actual functions the fixture runs, not a second
// hand-written copy of them that could drift from the fixture without either copy going red.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildTimelineAxisBands, formatCalendarTitleParts } from "../../../src/data/calendar-title-formatter";
import { t } from "../../../src/i18n";
import {
  TIMELINE_RANGE_DAY_WIDTH,
  buildTimelineTicks,
  getTimelineTitleWindow,
  getTimelineViewportContentWidth,
  resolveEventAbsoluteScale,
  resolveTimelineMilestoneLabelPlacement,
  resolveTimelineViewportUnitCount,
} from "../../../src/data/calendar-timeline-model";
import {
  TEMPORAL_SCENARIOS,
  TIMELINE_FIXTURES,
  TL_LANES,
  timelineAxisBands,
  timelineDynamicFixture,
  timelineEventAbsoluteScale,
  timelineEventVisibility,
  timelineFormatTickLabel,
  timelineGanttHeader,
  timelineMilestoneLabelPlacement,
  timelineMonthBoundaryBands,
  timelineResolveUnitWidth,
  timelineResolveViewportUnitCount,
  timelineEvent,
  timelineTickLabel,
  timelineTicksFor,
  timelineTicksForDateRange,
  timelineViewportContentWidth,
  timelineViewportWindow,
  calendarBacklogEmptyMarkup,
  calendarEmptyStateMarkup,
  calendarIsWeekendDateKey,
  calendarWeekdayMarkup,
  monthDayCell,
  monthSegment,
  timedEvent,
} from "./temporal.mjs";

const ALL_SCALES = ["day", "week", "month", "quarter", "year"];

describe("timeline screenshot event markup mirrors the renderer", () => {
  const source = readFileSync(resolve(process.cwd(), "src/views/calendar-timeline-renderer.ts"), "utf8");
  const fixtureMarkup = timelineEvent(TL_LANES[0].events[0], TIMELINE_FIXTURES.week);
  const milestone = TL_LANES[0].events[1];
  const milestoneMarkup = timelineEvent(milestone, TIMELINE_FIXTURES.week, TL_LANES[0].events);
  const requiredClasses = [
    "pm-gantt-bar-group",
    "pm-gantt-bar",
    "pm-gantt-bar-progress",
    "pm-gantt-drag-handle",
    "pm-gantt-link-dot",
  ];

  it("uses the same event classes and native sibling controls", () => {
    for (const className of requiredClasses) {
      expect(fixtureMarkup).toContain(className);
      expect(source).toContain(className);
    }
    expect(fixtureMarkup).toContain('class="pm-gantt-bar"');
    expect(fixtureMarkup).toContain('class="pm-gantt-bar-progress"');
    expect(fixtureMarkup).toContain('class="pm-gantt-drag-handle"');
    expect(fixtureMarkup).toContain('class="pm-gantt-link-dot"');
    expect(fixtureMarkup).not.toContain("db-timeline");
    expect(source).toContain('class: "pm-gantt-bar-group"');
    expect(source).toContain('class: "pm-gantt-drag-handle"');
    expect(source).toContain('class: "pm-gantt-link-dot"');
  });

  it("photographs a milestone label above its bar when the next bar starts inside its span", () => {
    expect(milestoneMarkup).toContain("pm-gantt-milestone");
    expect(timelineGanttHeader(TIMELINE_FIXTURES.week)).toContain("pm-gantt-header");
    expect(source).toContain('class: "pm-gantt-milestone"');
  });

  it("uses the reference SVG tick classes for first and interior labels", () => {
    const first = timelineTickLabel({ label: "00:00" }, "day", true);
    const interior = timelineTickLabel({ label: "01:00" }, "day");
    expect(first).toContain('<text class="pm-gantt-header-day"');
    expect(first).toContain('data-first-tick="true"');
    expect(interior).not.toContain('data-first-tick="true"');
    expect(source).toContain('class: "pm-gantt-header-day"');
  });
});

describe("timeline toolbar options fixture mirrors the week-label select", () => {
  // The constructed scenario mounts the real popover and needs no hand mirror, but the
  // hand-written "timeline-toolbar-options" fixture is still captured alongside it, so a row
  // the real renderer added has to be added here too, class-for-class, or the hand fixture
  // depicts a popover the shipped code no longer renders.
  const source = readFileSync(resolve(process.cwd(), "src/views/calendar-timeline-toolbar-renderer.ts"), "utf8");
  const scenario = TEMPORAL_SCENARIOS.find((s) => s.id === "timeline-toolbar-options");

  it("registers the timeline-toolbar-options scenario", () => {
    expect(scenario).toBeDefined();
  });

  it("shows the reference week-label select, defaulting to week number, using the shared dropdown-row markup", () => {
    const markup = scenario.html();
    expect(markup).toContain('class="db-dropdown-field db-chart-options-dropdown has-current-icon"');
    expect(markup).toContain('<span class="db-dropdown-field-label">Week label</span>');
    expect(markup).toContain('<span class="db-dropdown-field-value">Week number</span>');
    // Placed after the local-extensions column-width controls and before the day-scale slot
    // duration row, the same order renderLayoutContent() emits them in.
    const localExtensionsAt = markup.indexOf("Local extensions");
    const columnWidthAt = markup.indexOf("Column width");
    const weekLabelAt = markup.indexOf("Week label");
    const slotDurationAt = markup.indexOf("Slot duration");
    expect(localExtensionsAt).toBeGreaterThan(-1);
    expect(columnWidthAt).toBeGreaterThan(localExtensionsAt);
    expect(weekLabelAt).toBeGreaterThan(columnWidthAt);
    expect(slotDurationAt).toBeGreaterThan(weekLabelAt);
  });

  it("keeps the week-label select's i18n keys and default in the renderer source", () => {
    expect(source).toContain('t("viewConfig.timelineWeekLabel")');
    expect(source).toContain('t("viewConfig.timelineWeekLabel.weekNumber")');
    expect(source).toContain('t("viewConfig.timelineWeekLabel.dateRange")');
    expect(source).toContain('t("viewConfig.timelineWeekLabel.both")');
    expect(source).toContain('config.timelineWeekLabel || "weekNumber"');
  });
});

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURE WINDOWS
// ───────────────────────────────────────────────────────────────────

/* The exact start/units the timeline screenshot scenarios use for every non-day scale. */
const WINDOWS = ["week", "month", "quarter", "year"].map((scale) => TIMELINE_FIXTURES[scale]);

// ───────────────────────────────────────────────────────────────────
// 3. TICK PARITY
// ───────────────────────────────────────────────────────────────────

describe("timeline fixture tick mirror matches the real model", () => {
  for (const window of WINDOWS) {
    it(`agrees with buildTimelineTicks at ${window.scale} scale`, () => {
      const real = buildTimelineTicks(
        {
          startDateKey: window.start,
          endDateKey: new Date(new Date(`${window.start}T00:00:00Z`).getTime() + (window.units - 1) * 86400000)
            .toISOString().slice(0, 10),
          totalUnits: window.units,
        },
        window.scale,
        {},
        "en",
      ).map((tick) => (tick.isScaleBoundary ? tick : { dateKey: tick.dateKey, label: tick.label, offsetUnits: tick.offsetUnits }));
      const mirrored = timelineTicksForDateRange(window).map((tick) => (tick.boundary
        ? { dateKey: tick.key, label: tick.label, offsetUnits: tick.offset, isScaleBoundary: true }
        : { dateKey: tick.key, label: tick.label, offsetUnits: tick.offset }));
      expect(mirrored).toEqual(real);
    });
  }

  it("agrees with formatTimelineTickLabel's real counterpart for a spot date at every scale", () => {
    // formatTimelineTickLabel() itself is not exported (calendar-timeline-model.ts:1093-1108); the
    // ticks it feeds are, and the assertion above already proves timelineTicksForDateRange()'s
    // labels equal buildTimelineTicks()'s labels for every window scale carries. This adds the
    // one scale that loop skips — day, whose ticks are hour strings the fixture builds inline in
    // timelineTicksFor(), not through timelineFormatTickLabel() — by checking the label format
    // directly matches what the day-scale tick loop in temporal.mjs actually emits.
    const hourZero = new Date("2026-03-25T00:00:00Z");
    expect(timelineFormatTickLabel(hourZero, "month")).toBe("25");
    expect(timelineFormatTickLabel(hourZero, "week")).toBe("Wed 25");
    expect(timelineFormatTickLabel(hourZero, "year")).toBe("3");
  });

  it("agrees with buildTimelineAxisBands at week scale (the band this review flagged)", () => {
    const real = buildTimelineAxisBands({
      scale: "week",
      startDateKey: "2026-03-23",
      endDateKey: "2026-04-05",
      totalUnits: 14,
    });
    const mirrored = timelineAxisBands(TIMELINE_FIXTURES.week);
    expect(mirrored).toEqual(real);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. TITLE PARITY (the double-year review flagged)
// ───────────────────────────────────────────────────────────────────

/* The exact fixture.title strings TIMELINE_FIXTURES carries per scale, and whether the year span
   renders beside them — kept in lockstep with temporal.mjs by hand, the same reason the tick
   mirror above exists. Year scale's own main text already is the year, so its year span is
   suppressed by formatCalendarTitleParts() itself; every other scale keeps a separate year span. */
const TITLE_WINDOWS = [
  { scale: "day", end: "2026-03-25", hasYearSpan: true },
  { scale: "week", end: "2026-04-05", hasYearSpan: true },
  { scale: "month", end: "2026-03-31", hasYearSpan: true },
  { scale: "quarter", end: "2026-03-31", hasYearSpan: true },
  { scale: "year", end: "2026-12-31", hasYearSpan: false },
];

describe("timeline fixture title matches formatCalendarTitleParts, once", () => {
  for (const window of TITLE_WINDOWS) {
    it(`agrees with formatCalendarTitleParts at ${window.scale} scale`, () => {
      const fixture = TIMELINE_FIXTURES[window.scale];
      const real = formatCalendarTitleParts({
        scale: window.scale,
        startDateKey: fixture.start,
        endDateKey: window.end,
        locale: "en",
      });
      expect(real.main).toBe(fixture.title);
      expect(Boolean(real.year)).toBe(window.hasYearSpan);
      // The year, when present, is never baked into `main` too — that repetition is the bug.
      if (real.year) expect(real.main.endsWith(real.year)).toBe(false);
    });
  }
});

const TITLE_DEVICE_WIDTHS = [1440, 402];

describe("timeline fixture title follows the fixture's own centred window", () => {
  for (const width of TITLE_DEVICE_WIDTHS) {
    for (const scale of ALL_SCALES) {
      it(`agrees with formatCalendarTitleParts at ${scale} scale, ${width}px`, () => {
        const fixture = timelineDynamicFixture(scale, { id: width === 402 ? "mobile" : "desktop", width });
        const realTitle = formatCalendarTitleParts({
          scale,
          startDateKey: fixture.start,
          endDateKey: fixture.end,
          locale: "en",
        });
        expect(fixture.title).toBe(realTitle.main);
        expect(fixture.titleYear).toBe(realTitle.year);
        // The local viewport window agrees for the scales whose windows are anchor-centred
        // too (the fixture no longer mirrors the day scale's local anchor-fixed window).
        if (scale !== "day") {
          const realWindow = getTimelineTitleWindow({ timelineScale: scale }, "2026-03-25", fixture.units);
          expect(fixture.start).toBe(realWindow.startDateKey);
          expect(fixture.end).toBe(realWindow.endDateKey);
        }
      });
    }
  }
});

const modelTimelineEvent = (event) => ({
  id: `Subscriptions/${event.title}.md`,
  title: event.title,
  startDateKey: event.start,
  endDateKey: event.end,
  startMinutes: event.startMinutes,
  endMinutes: event.endMinutes,
  isMilestone: Boolean(event.milestone),
});

describe("timeline milestone placement parity", () => {
  for (const scale of ["week", "month", "quarter", "year"]) {
    it(`puts the Adobe CC label above at ${scale} scale`, () => {
      const fixture = timelineDynamicFixture(scale, { id: "desktop", width: 1440 });
      const lane = TL_LANES[0].events;
      const milestone = modelTimelineEvent(lane[1]);
      const next = modelTimelineEvent(lane[2]);
      const real = resolveTimelineMilestoneLabelPlacement(
        milestone,
        [milestone, next],
        fixture.width,
        "day",
      );
      expect(real).toBe("above");
      expect(timelineMilestoneLabelPlacement(lane[1], lane, fixture.width, "day")).toBe(real);
      expect(timelineEvent(lane[1], fixture, lane)).toContain("pm-gantt-milestone");
    });
  }
});

// ───────────────────────────────────────────────────────────────────
// 5. BAR GEOMETRY & VISIBILITY PARITY (the fake-clamped-bar review flagged)
// ───────────────────────────────────────────────────────────────────

/* resolveEventAbsoluteScale() is the one real export both the render loop and the fixture's
   timelineEventAbsoluteScale() build a bar from (calendar-timeline-model.ts:1294-1311). This is
   NOT assignEventUnits(): that function separately clamps every event's offset into the visible
   unit count no matter how far outside the window it starts, which draws a bar nothing on screen
   draws — the review-flagged bug this test now guards against reappearing. */
describe("timeline fixture event geometry matches resolveEventAbsoluteScale", () => {
  for (const fixture of Object.values(TIMELINE_FIXTURES)) {
    for (const event of [...TL_LANES[0].events, ...TL_LANES[1].events]) {
      it(`places ${event.title} the same absolute range as the model at ${fixture.scale} scale`, () => {
        const real = resolveEventAbsoluteScale(
          { startDateKey: event.start, endDateKey: event.end, startMinutes: null, endMinutes: null, endIsDateOnly: true },
          fixture.start,
        );
        const mirrored = timelineEventAbsoluteScale(event, fixture.start);
        expect(mirrored).toEqual(real);
      });
    }
  }
});

/* The visibility mirror follows the model's absolute range and mounted-window intersection.
   The Gantt fixture itself keeps the source-date geometry, including a clipped edge bar. */
describe("timeline fixture event visibility matches the render loop's clip decision", () => {
  it("draws the Adobe CC milestone as a bar at every scale (real window, not the old clamp)", () => {
    const adobeCc = TL_LANES[0].events.find((event) => event.title === "Adobe CC");
    for (const fixture of Object.values(TIMELINE_FIXTURES)) {
      const visibility = timelineEventVisibility(adobeCc, fixture);
      expect(visibility.bar, `${fixture.scale} scale`).not.toBeNull();
      // Day scale opens at midnight and shows the configured whole-hour span. The all-day
      // milestone starts at that visible boundary and extends beyond the trailing edge, matching
      // the renderer's bar-plus-trailing-jump behavior while remaining visible in the lane.
      if (fixture.scale !== "day") {
        expect(visibility.isClippedStart, `${fixture.scale} scale`).toBe(false);
        expect(visibility.isClippedEnd, `${fixture.scale} scale`).toBe(false);
      }
    }
  });

  it("keeps Notion inside the static day window (12 day columns from Mar 25)", () => {
    const notion = TL_LANES[0].events.find((event) => event.title === "Notion");
    const visibility = timelineEventVisibility(notion, TIMELINE_FIXTURES.day);
    expect(visibility.bar).not.toBeNull();
    expect(visibility.isClippedStart).toBe(false);
    expect(visibility.isClippedEnd).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────
// 5B. UNIT-WIDTH PARITY (the fixture's per-scale column width against the real model)
// ───────────────────────────────────────────────────────────────────

/* The photographed default render is the reference gantt, whose day width is fixed per scale
   (TimelineConfig DAY_WIDTH → TIMELINE_RANGE_DAY_WIDTH): 44/22/9/5/2 with no phone branch.
   The local path's viewport-aware column widths are a gated extension and are not mirrored
   here. */
describe("timeline fixture unit widths match the reference gantt's fixed day widths", () => {
  for (const scale of ALL_SCALES) {
    it(`uses TIMELINE_RANGE_DAY_WIDTH at ${scale} scale`, () => {
      expect(TIMELINE_FIXTURES[scale].width).toBe(TIMELINE_RANGE_DAY_WIDTH[scale]);
      expect(timelineResolveUnitWidth(scale)).toBe(TIMELINE_RANGE_DAY_WIDTH[scale]);
    });
  }

  it("keeps the 44px day width at the phone container width", () => {
    const fixture = timelineDynamicFixture("day", { id: "mobile", width: 402 });
    expect(fixture.width).toBe(TIMELINE_RANGE_DAY_WIDTH.day);
    expect(TIMELINE_RANGE_DAY_WIDTH.day).toBe(44);
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. FIXTURE-WINDOW PARITY (all five scales)
// ───────────────────────────────────────────────────────────────────

/* The screenshot scenarios mount a window of their own: totalUnits day columns centred on the
   pinned anchor date (temporal.mjs's timelineDynamicFixture → timelineViewportWindow), because
   the photographed default render's range is task-driven and has no viewport window of its own
   (the local viewport-centred window is a gated extension). This section proves the unit-count
   and content-width mirrors against the real model exports, for every scale, at the two device
   widths the capture harness actually opens the page at. getTimelineViewportUnitCount()
   (calendar-timeline-renderer.ts:2419-2426) measures the outer .note-database-container's rect
   width, then getTimelineViewportContentWidth() (calendar-timeline-model.ts:245-250) subtracts
   that container's own CSS padding (`padding: 0 var(--db-space-8) var(--db-space-8)`,
   styles.css:809; --db-space-8 is 24px, styles.css:52) — never the sticky group-label column,
   which overlays rather than shrinks the measured container. */
const DEVICE_WIDTHS = [1440, 402];
const CONTAINER_PADDING_PX = 24;

describe("timeline viewport content-width mirror matches the real container measurement", () => {
  for (const width of DEVICE_WIDTHS) {
    it(`agrees with getTimelineViewportContentWidth at ${width}px`, () => {
      const real = getTimelineViewportContentWidth(width, CONTAINER_PADDING_PX, CONTAINER_PADDING_PX);
      const mirrored = timelineViewportContentWidth(width, CONTAINER_PADDING_PX, CONTAINER_PADDING_PX);
      expect(mirrored).toBe(real);
      expect(mirrored).toBe(width - CONTAINER_PADDING_PX * 2);
    });
  }

  for (const width of DEVICE_WIDTHS) {
    for (const scale of ALL_SCALES) {
      it(`timelineDynamicFixture's unit count equals resolveTimelineViewportUnitCount(getTimelineViewportContentWidth(...), TIMELINE_RANGE_DAY_WIDTH[...]) at ${scale} scale, ${width}px`, () => {
        const unitWidth = TIMELINE_RANGE_DAY_WIDTH[scale];
        const realContentWidth = getTimelineViewportContentWidth(width, CONTAINER_PADDING_PX, CONTAINER_PADDING_PX);
        const realUnits = resolveTimelineViewportUnitCount(realContentWidth, unitWidth, scale);
        const fixture = timelineDynamicFixture(scale, { id: width === 402 ? "mobile" : "desktop", width });
        expect(fixture.units, `${scale} @ ${width}px`).toBe(realUnits);
        // Same assertion driven end-to-end off the model width, not the fixture's own width,
        // so a fixture width that quietly drifted from TIMELINE_RANGE_DAY_WIDTH cannot make
        // this unit count agree with itself.
        expect(fixture.units, `${scale} @ ${width}px (model-resolved width)`).toBe(
          resolveTimelineViewportUnitCount(
            getTimelineViewportContentWidth(width, CONTAINER_PADDING_PX, CONTAINER_PADDING_PX),
            TIMELINE_RANGE_DAY_WIDTH[scale],
            scale,
          ),
        );
      });
    }
  }
});

describe("timeline fixture window centres totalUnits on the anchor date", () => {
  for (const width of DEVICE_WIDTHS) {
    for (const scale of ALL_SCALES) {
      it(`mirrors the rounding and the anchor centring at ${scale} scale, ${width}px`, () => {
        const unitWidth = TIMELINE_RANGE_DAY_WIDTH[scale];
        const contentWidth = getTimelineViewportContentWidth(width, CONTAINER_PADDING_PX, CONTAINER_PADDING_PX);
        const realUnits = resolveTimelineViewportUnitCount(contentWidth, unitWidth, scale);
        const mirroredContentWidth = timelineViewportContentWidth(width, CONTAINER_PADDING_PX, CONTAINER_PADDING_PX);
        const mirroredUnits = timelineResolveViewportUnitCount(mirroredContentWidth, unitWidth, scale);
        expect(mirroredUnits).toBe(realUnits);
        // Day scale rounds down (a partial trailing column is not a whole visible column);
        // every other scale rounds up — asserted directly so a signature change that silently
        // drops the scale argument (and its rounding) goes red here, not just in the window
        // it feeds.
        expect(mirroredUnits).toBe(scale === "day" ? Math.floor(contentWidth / unitWidth) : Math.ceil(contentWidth / unitWidth));

        const mirrored = timelineViewportWindow("2026-03-25", mirroredUnits);
        const before = Math.floor((mirroredUnits - 1) / 2);
        const anchor = new Date("2026-03-25T00:00:00Z");
        const expectedStart = new Date(anchor.getTime() - before * 86400000).toISOString().slice(0, 10);
        expect(mirrored.start).toBe(expectedStart);
        expect(mirrored.units).toBe(mirroredUnits);
      });
    }
  }

  for (const scale of ["week", "month", "quarter", "year"]) {
    it(`agrees with buildTimelineAxisBands at ${scale} scale under the desktop fixture window`, () => {
      const fixture = timelineDynamicFixture(scale, { id: "desktop", width: 1440 });
      const real = buildTimelineAxisBands({
        scale,
        startDateKey: fixture.start,
        endDateKey: fixture.end,
        totalUnits: fixture.units,
      });
      const mirrored = timelineMonthBoundaryBands(fixture.start, fixture.end);
      expect(mirrored).toEqual(real);
    });
  }
});

// ───────────────────────────────────────────────────────────────────
// 6B. DAY-SCALE HEADER PARITY (the reference gantt's day columns)
// ───────────────────────────────────────────────────────────────────

/* The reference gantt's day scale is one column per day: an unpadded day-of-month label
   (GanttHeaderRenderer.renderDayHeader's String(d.day)) over the month-top band, weekend
   fills, and Monday grid lines. The fixture mirrors that — the local hour-column day scale
   is a gated extension, not the photographed default. */
describe("timeline day-scale header mirrors the reference gantt day header", () => {
  for (const width of DEVICE_WIDTHS) {
    it(`labels day columns with unpadded day-of-month numbers at ${width}px`, () => {
      const fixture = timelineDynamicFixture("day", { id: width === 402 ? "mobile" : "desktop", width });
      const ticks = timelineTicksFor(fixture);
      expect(ticks.length).toBe(fixture.units);
      ticks.forEach((tick, index) => {
        const date = new Date(`${fixture.start}T00:00:00Z`);
        date.setUTCDate(date.getUTCDate() + index);
        expect(tick.label, `day ${index}`).toBe(String(date.getUTCDate()));
        expect(tick.label, `day ${index} unpadded`).not.toMatch(/^0/);
        expect(tick.key, `day ${index}`).toBe(date.toISOString().slice(0, 10));
      });
      // The renderer draws the same unpadded day-of-month text.
      const source = readFileSync(resolve(process.cwd(), "src/views/calendar-timeline-renderer.ts"), "utf8");
      expect(source).toContain("String(d.getUTCDate())");
      expect(source).toContain("pm-gantt-header-day");
    });
  }

  for (const scale of ALL_SCALES) {
    it(`draws the top band at ${scale} scale, like the renderer`, () => {
      const header = timelineGanttHeader(timelineDynamicFixture(scale, { id: "desktop", width: 1440 }));
      // A band rect for every scale: month bands on day/week, year bands on month/quarter/year.
      expect(header).toMatch(/pm-gantt-band-(even|odd)/);
      const expectedLabelClass = scale === "day" || scale === "week" ? "pm-gantt-header-month-top" : "pm-gantt-header-year";
      expect(header, `${scale} scale`).toContain(expectedLabelClass);
    });
  }

  it("keeps both band label classes in the renderer source", () => {
    const source = readFileSync(resolve(process.cwd(), "src/views/calendar-timeline-renderer.ts"), "utf8");
    expect(source).toContain("pm-gantt-header-month-top");
    expect(source).toContain("pm-gantt-header-year");
  });
});

// ───────────────────────────────────────────────────────────────────
// 7. DAY-SCALE BAR/JUMP PARITY (the visible-window start)
// ───────────────────────────────────────────────────────────────────

/* timelineEventVisibility()'s day branch measures its visible window in day units from
   fixture.start, matching the ticks, bands, grid columns and today-line. This direct check
   covers the render loop's clip decision, not just the fixture window it is fed. There is no
   exported symbol for the render loop's own clip (calendar-timeline-renderer.ts:450-476 is
   four lines of Math.max/Math.min inline in a private method), so the oracle here is
   resolveEventAbsoluteScale() (a real export) plus that same small, documented formula,
   applied to the real device-width window from timelineDynamicFixture() — for every fixture
   event, at both device widths. */
describe("timeline day-scale event visibility matches the render loop's clip decision", () => {
  for (const width of DEVICE_WIDTHS) {
    const fixture = timelineDynamicFixture("day", { id: width === 402 ? "mobile" : "desktop", width });
    for (const event of [...TL_LANES[0].events, ...TL_LANES[1].events]) {
      it(`places ${event.title} the same as the render loop at day scale, ${width}px`, () => {
        const scale = resolveEventAbsoluteScale(
          { startDateKey: event.start, endDateKey: event.end, startMinutes: null, endMinutes: null, endIsDateOnly: true },
          fixture.start,
        );
        const visible = { start: 0, end: fixture.units * 1440 };
        const renderStart = Math.max(scale.start, visible.start);
        const renderEnd = Math.min(scale.end, visible.end);
        const real = {
          isOverEvent: renderStart < renderEnd,
          isClippedStart: scale.start < visible.start,
          isClippedEnd: scale.end > visible.end,
        };
        const mirrored = timelineEventVisibility(event, fixture);
        expect(mirrored.isOverEvent, `${event.title} @ ${width}px`).toBe(real.isOverEvent);
        expect(Boolean(mirrored.bar), `${event.title} @ ${width}px bar presence`).toBe(real.isOverEvent);
        expect(mirrored.isClippedStart, `${event.title} @ ${width}px`).toBe(real.isClippedStart);
        expect(mirrored.isClippedEnd, `${event.title} @ ${width}px`).toBe(real.isClippedEnd);
      });
    }
  }

  it("keeps every fixture event inside the desktop day window", () => {
    const fixture = timelineDynamicFixture("day", { id: "desktop", width: 1440 });
    for (const event of [...TL_LANES[0].events, ...TL_LANES[1].events]) {
      const visibility = timelineEventVisibility(event, fixture);
      expect(visibility.bar, `${event.title} @ day-desktop`).not.toBeNull();
      expect(visibility.isClippedStart, `${event.title} @ day-desktop`).toBe(false);
      expect(visibility.isClippedEnd, `${event.title} @ day-desktop`).toBe(false);
    }
  });

  it("clips Notion's trailing edge at the phone day window", () => {
    const fixture = timelineDynamicFixture("day", { id: "mobile", width: 402 });
    const notion = TL_LANES[0].events.find((event) => event.title === "Notion");
    const visibility = timelineEventVisibility(notion, fixture);
    expect(visibility.bar).not.toBeNull();
    expect(visibility.isClippedStart).toBe(false);
    expect(visibility.isClippedEnd).toBe(true);
  });
});

describe("calendar fixture markup mirrors the renderer states", () => {
  it("keeps weekend labels and day cells aligned", () => {
    expect(calendarIsWeekendDateKey("2026-03-22")).toBe(true);
    expect(calendarIsWeekendDateKey("2026-03-23")).toBe(false);
    expect(calendarWeekdayMarkup("Sun", 0)).toContain("db-calendar-weekday is-weekend");
    expect(calendarWeekdayMarkup("Mon", 1)).toContain("class=\"db-calendar-weekday \"");
    expect(monthDayCell({ n: 22, key: "2026-03-22" }, 1)).toContain("is-weekend");
    expect(monthDayCell({ n: 23, key: "2026-03-23" }, 2)).not.toContain("is-weekend");
  });

  it("keeps completion modifiers on calendar event and backlog markup", () => {
    expect(monthSegment({ column: 1, span: 1, lane: 0, title: "Done", tone: "green", completed: true, start: true, end: true }))
      .toContain("is-completed");
    expect(timedEvent({ title: "Done", from: 540, to: 630, tone: "green", completed: true }))
      .toContain("is-completed");
    const empty = calendarBacklogEmptyMarkup();
    expect(empty).toContain("db-calendar-backlog");
    expect(empty).toContain("db-calendar-backlog-empty");
    expect(empty).toContain("Nothing unscheduled.");
  });

  it("keeps the fixture's calendar copy tied to the strings the product renders", () => {
    // The card and the drawer are hand-mirrored markup, so their words can drift from the
    // dictionary the renderer reads without any class changing — and the capture would then
    // depict copy the product no longer shows. These bind the two.
    const noDateField = calendarEmptyStateMarkup("no-date-field");
    expect(noDateField).toContain(t("emptyState.noDateFieldTitle"));
    expect(noDateField).toContain(t("emptyState.noDateFieldMessage"));
    expect(noDateField).toContain(t("emptyState.selectDateProperty"));
    const noEvents = calendarEmptyStateMarkup("no-events");
    expect(noEvents).toContain(t("emptyState.noEventsTitle"));
    expect(noEvents).toContain(t("emptyState.noEventsMessage"));
    const backlog = calendarBacklogEmptyMarkup();
    expect(backlog).toContain(t("calendar.unscheduled"));
    expect(backlog).toContain(t("calendar.unscheduledEmpty"));
  });

  it("mirrors renderEmpty()'s empty-card markup class-for-class for both calendar reasons", () => {
    // "no-date-field" carries the one action calendar-renderer.ts's renderEmpty() ever attaches
    // (openDateConfig is always present in the real app), and lands as a direct child of
    // .note-database-container — never a .db-calendar descendant — matching the actual DOM
    // renderCard() builds before any calendar wrapper exists.
    const noDateField = calendarEmptyStateMarkup("no-date-field");
    expect(noDateField).toContain('class="db-empty db-empty-card"');
    expect(noDateField).toContain('data-empty-reason="no-date-field"');
    expect(noDateField).toContain("db-empty-card-icon");
    expect(noDateField).toContain("db-empty-card-content");
    expect(noDateField).toContain("db-empty-card-title");
    expect(noDateField).toContain("No date property");
    expect(noDateField).toContain("db-empty-card-message");
    expect(noDateField).toContain("Select the property that supplies dates for this view.");
    expect(noDateField).toContain("db-empty-action-group");
    expect(noDateField).toContain('db-empty-action mod-cta');
    expect(noDateField).toContain("Select date property");

    // "no-events" never carries an action (renderEmpty() only attaches one for "no-date-field").
    const noEvents = calendarEmptyStateMarkup("no-events");
    expect(noEvents).toContain('data-empty-reason="no-events"');
    expect(noEvents).toContain("No events");
    expect(noEvents).toContain("Records with a value in the selected date property will appear here.");
    expect(noEvents).not.toContain("db-empty-action-group");
  });
});
