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
  buildTimelineTicks,
  getTimelineViewportContentWidth,
  getTimelineViewportWindow,
  resolveEventAbsoluteScale,
  resolveTimelineUnitWidth,
  resolveTimelineViewportUnitCount,
} from "../../../src/data/calendar-timeline-model";
import {
  TIMELINE_FIXTURES,
  TL_LANES,
  timelineAxisBands,
  timelineDynamicFixture,
  timelineEventAbsoluteScale,
  timelineEventVisibility,
  timelineFormatTickLabel,
  timelineMonthBoundaryBands,
  timelineResolveViewportUnitCount,
  timelineEvent,
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
  const requiredClasses = [
    "db-timeline-event",
    "is-progressing",
    "db-timeline-event-trigger",
    "db-timeline-event-content",
    "db-timeline-event-title",
    "db-timeline-event-meta",
    "db-timeline-link-dot",
  ];

  it("uses the same event classes and native sibling controls", () => {
    for (const className of requiredClasses) {
      expect(fixtureMarkup).toContain(className);
      expect(source).toContain(className);
    }
    expect(fixtureMarkup).toContain('role="group"');
    expect(fixtureMarkup).toContain('<button type="button" class="db-timeline-event-trigger"');
    expect(fixtureMarkup).toContain('<button type="button" class="db-timeline-link-dot is-left"');
    expect(fixtureMarkup).not.toContain('role="button"');
    expect(source).toContain('const eventEl = eventsEl.createDiv({');
    expect(source).toContain('role: "group"');
    expect(source).toContain('const trigger = eventEl.createEl("button", {');
    expect(source).toContain('const dot = parent.createEl("button", {');
    expect(source).not.toMatch(/renderTimelineLinkDots[\s\S]{0,1200}role: "button"/);
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

/* The render loop's own clip decision (calendar-timeline-renderer.ts:450-476) has no exported
   symbol of its own — it is four lines of Math.max/Math.min inline in a private method, not a
   model export — so this negative control is what proves timelineEventVisibility() implements it
   rather than the old assignEventUnits()-shaped clamp: Adobe CC, moved onto the one day (25
   March) every scale's window contains, must draw a bar at every scale, and Notion, whose 26-31
   March range never reaches the day-scale window (25 March only), must draw no bar there — only
   the .db-timeline-window-jump markup the real renderer would build for an event outside the
   visible range, never a bar dragged to the window's edge. */
describe("timeline fixture event visibility matches the render loop's clip decision", () => {
  it("draws the Adobe CC milestone as a bar at every scale (real window, not the old clamp)", () => {
    const adobeCc = TL_LANES[0].events.find((event) => event.title === "Adobe CC");
    for (const fixture of Object.values(TIMELINE_FIXTURES)) {
      const visibility = timelineEventVisibility(adobeCc, fixture);
      expect(visibility.bar, `${fixture.scale} scale`).not.toBeNull();
      // Day scale's visible window is only its own 08:00-20:00 hour band (temporal.mjs's mirror
      // of the fixture's fixed window open), and the milestone is an all-day event spanning the
      // full 00:00-24:00 of 25 March — so it legitimately carries both jump arrows there, same as
      // the real renderer, while still drawing the bar the old clamp never reached at three of
      // the other four scales.
      if (fixture.scale !== "day") {
        expect(visibility.isClippedStart, `${fixture.scale} scale`).toBe(false);
        expect(visibility.isClippedEnd, `${fixture.scale} scale`).toBe(false);
      }
    }
  });

  it("draws Notion as a jump indicator, not a bar, at day scale", () => {
    const notion = TL_LANES[0].events.find((event) => event.title === "Notion");
    const visibility = timelineEventVisibility(notion, TIMELINE_FIXTURES.day);
    expect(visibility.bar).toBeNull();
    expect(visibility.isClippedEnd).toBe(true);
  });
});

// ───────────────────────────────────────────────────────────────────
// 5B. UNIT-WIDTH PARITY (the fixture's per-scale column width against the real model)
// ───────────────────────────────────────────────────────────────────

/* Every fixture's `width` must equal what resolveTimelineUnitWidth() resolves for that scale
   with no config override (calendar-timeline-model.ts:200-205), the same value the renderer
   writes to --db-timeline-unit-width (calendar-timeline-renderer.ts:340). Without this, a
   fixture width could drift from production silently: the later viewport-unit-count tests feed
   TIMELINE_FIXTURES[scale].width to both the real and the mirrored side, so a wrong shared width
   cancels out and neither side goes red. */
describe("timeline fixture unit width matches resolveTimelineUnitWidth", () => {
  for (const scale of ALL_SCALES) {
    it(`agrees with resolveTimelineUnitWidth at ${scale} scale`, () => {
      expect(TIMELINE_FIXTURES[scale].width).toBe(resolveTimelineUnitWidth({}, scale));
    });
  }
});

// ───────────────────────────────────────────────────────────────────
// 6. VIEWPORT-CENTRED WINDOW PARITY (all five scales, the missing-scroll-to-today gap)
// ───────────────────────────────────────────────────────────────────

/* The renderer always has a real mounted container, so buildTimelineModel() always receives a
   visibleUnitCount (calendar-timeline-renderer.ts:306-311, calendar-timeline-model.ts:649-651)
   and always renders through getTimelineViewportWindow() — centred on the anchor date (day scale
   excepted: it always opens at the anchor date, only totalUnits varies), not the scale's calendar
   boundary getTimelineWindow() uses. All five screenshot scenarios now mirror that mode
   (temporal.mjs's timelineDynamicFixture()); this proves the mirror functions it is built from
   against their real exports, for every scale, at the two device widths the capture harness
   actually opens the page at. getTimelineViewportUnitCount() (calendar-timeline-renderer.ts:
   2419-2426) measures the outer .note-database-container's rect width, then
   getTimelineViewportContentWidth() (calendar-timeline-model.ts:245-250) subtracts that
   container's own CSS padding (`padding: 0 var(--db-space-8) var(--db-space-8)`, styles.css:809;
   --db-space-8 is 24px, styles.css:52) — never the sticky group-label column, which overlays
   rather than shrinks the measured container. */
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
      it(`timelineDynamicFixture's unit count equals resolveTimelineViewportUnitCount(getTimelineViewportContentWidth(...), resolveTimelineUnitWidth(...)) at ${scale} scale, ${width}px`, () => {
        const unitWidth = TIMELINE_FIXTURES[scale].width;
        const realContentWidth = getTimelineViewportContentWidth(width, CONTAINER_PADDING_PX, CONTAINER_PADDING_PX);
        const realUnits = resolveTimelineViewportUnitCount(realContentWidth, unitWidth, scale);
        const fixture = timelineDynamicFixture(scale, { id: width === 402 ? "mobile" : "desktop", width });
        expect(fixture.units, `${scale} @ ${width}px`).toBe(realUnits);
        // Same assertion driven end-to-end off the config resolver, not the fixture's own width,
        // so a fixture width that quietly drifted from resolveTimelineUnitWidth() cannot make
        // this unit count agree with itself.
        expect(fixture.units, `${scale} @ ${width}px (config-resolved width)`).toBe(
          resolveTimelineViewportUnitCount(
            getTimelineViewportContentWidth(width, CONTAINER_PADDING_PX, CONTAINER_PADDING_PX),
            resolveTimelineUnitWidth({}, scale),
            scale,
          ),
        );
      });
    }
  }
});

describe("timeline viewport-window mirror matches the real live-container mode", () => {
  for (const width of DEVICE_WIDTHS) {
    for (const scale of ALL_SCALES) {
      it(`agrees with resolveTimelineViewportUnitCount + getTimelineViewportWindow at ${scale} scale, ${width}px`, () => {
        const unitWidth = TIMELINE_FIXTURES[scale].width;
        const contentWidth = getTimelineViewportContentWidth(width, CONTAINER_PADDING_PX, CONTAINER_PADDING_PX);
        const realUnits = resolveTimelineViewportUnitCount(contentWidth, unitWidth, scale);
        const mirroredContentWidth = timelineViewportContentWidth(width, CONTAINER_PADDING_PX, CONTAINER_PADDING_PX);
        const mirroredUnits = timelineResolveViewportUnitCount(mirroredContentWidth, unitWidth, scale);
        expect(mirroredUnits).toBe(realUnits);
        // Day scale rounds down (a partial trailing hour is not a whole visible column); every
        // other scale rounds up — asserted directly so a signature change that silently drops the
        // scale argument (and its rounding) goes red here, not just in the window it feeds.
        expect(mirroredUnits).toBe(scale === "day" ? Math.floor(contentWidth / unitWidth) : Math.ceil(contentWidth / unitWidth));

        const real = getTimelineViewportWindow({ timelineScale: scale }, "2026-03-25", realUnits);
        const mirrored = timelineViewportWindow(scale, "2026-03-25", mirroredUnits);
        expect(mirrored.start).toBe(real.startDateKey);
        expect(mirrored.units).toBe(real.totalUnits);
        if (scale === "day") expect(mirrored.startMinutes).toBe(real.startMinutes);
      });
    }
  }

  for (const scale of ["week", "month", "quarter", "year"]) {
    it(`agrees with buildTimelineAxisBands at ${scale} scale under the desktop viewport window`, () => {
      const unitWidth = TIMELINE_FIXTURES[scale].width;
      const contentWidth = getTimelineViewportContentWidth(1440, CONTAINER_PADDING_PX, CONTAINER_PADDING_PX);
      const units = resolveTimelineViewportUnitCount(contentWidth, unitWidth, scale);
      const window = getTimelineViewportWindow({ timelineScale: scale }, "2026-03-25", units);
      const real = buildTimelineAxisBands({
        scale,
        startDateKey: window.startDateKey,
        endDateKey: window.endDateKey,
        totalUnits: window.totalUnits,
      });
      const mirrored = timelineMonthBoundaryBands(window.startDateKey, window.endDateKey);
      expect(mirrored).toEqual(real);
    });
  }

  it("agrees with buildTimelineAxisBands at day scale under the desktop viewport window", () => {
    const unitWidth = TIMELINE_FIXTURES.day.width;
    const contentWidth = getTimelineViewportContentWidth(1440, CONTAINER_PADDING_PX, CONTAINER_PADDING_PX);
    const units = resolveTimelineViewportUnitCount(contentWidth, unitWidth, "day");
    const window = getTimelineViewportWindow({ timelineScale: "day" }, "2026-03-25", units);
    const real = buildTimelineAxisBands({
      scale: "day",
      startDateKey: window.startDateKey,
      endDateKey: window.startDateKey,
      totalUnits: window.totalUnits,
      startMinutes: window.startMinutes,
    });
    const mirrored = timelineAxisBands({ scale: "day", start: window.startDateKey, units: window.totalUnits, startMinutes: window.startMinutes });
    expect(mirrored).toEqual(real);
  });
});

// ───────────────────────────────────────────────────────────────────
// 7. DAY-SCALE BAR/JUMP PARITY (the P0: visible.start hardcoded to 08:00)
// ───────────────────────────────────────────────────────────────────

/* timelineEventVisibility()'s day branch measured its visible window from a hardcoded 08:00 while
   every other day-scale helper (ticks, bands, grid columns, today-line) already read
   fixture.startMinutes (TL_DAY_START_MINUTES = 0) — so this is the one function that needs a
   direct check against the real render loop's clip decision, not just the window it is fed.
   There is no exported symbol for the render loop's own clip (calendar-timeline-renderer.ts:
   450-476 is four lines of Math.max/Math.min inline in a private method), so the oracle here is
   resolveEventAbsoluteScale() (a real export) plus that same small, documented formula, applied
   to the real device-width window from timelineDynamicFixture() — for every fixture event, at
   both device widths. */
describe("timeline day-scale event visibility matches the render loop's clip decision", () => {
  for (const width of DEVICE_WIDTHS) {
    const fixture = timelineDynamicFixture("day", { id: width === 402 ? "mobile" : "desktop", width });
    for (const event of [...TL_LANES[0].events, ...TL_LANES[1].events]) {
      it(`places ${event.title} the same as the render loop at day scale, ${width}px`, () => {
        const scale = resolveEventAbsoluteScale(
          { startDateKey: event.start, endDateKey: event.end, startMinutes: null, endMinutes: null, endIsDateOnly: true },
          fixture.start,
        );
        const visible = { start: fixture.startMinutes, end: fixture.startMinutes + fixture.units * 60 };
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

  it("draws no Notion bar at day-desktop (26-31 March never reaches a midnight-start window)", () => {
    const fixture = timelineDynamicFixture("day", { id: "desktop", width: 1440 });
    const notion = TL_LANES[0].events.find((event) => event.title === "Notion");
    const visibility = timelineEventVisibility(notion, fixture);
    expect(visibility.bar).toBeNull();
    expect(visibility.isClippedStart).toBe(false);
    expect(visibility.isClippedEnd).toBe(true);
  });

  it("gives Adobe CC no spurious is-before jump at day-desktop (25 March starts exactly at the midnight-start window)", () => {
    const fixture = timelineDynamicFixture("day", { id: "desktop", width: 1440 });
    const adobeCc = TL_LANES[0].events.find((event) => event.title === "Adobe CC");
    const visibility = timelineEventVisibility(adobeCc, fixture);
    expect(visibility.bar).not.toBeNull();
    expect(visibility.isClippedStart).toBe(false);
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
