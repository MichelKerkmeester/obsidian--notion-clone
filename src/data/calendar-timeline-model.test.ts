// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-timeline-model.test
// COMPONENT: range geometry, bar geometry, and scale-boundary ticks
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import {
  buildCalendarTimelineEvents,
  buildTimelineRangeGeometry,
  buildTimelineTicks,
  collectUnscheduledTimelineRows,
  formatTimelineAccessibilityLabel,
  getTimelineTitleWindow,
  getTimelineViewportWindow,
  resolveTimelineBarGeometry,
  resolveTimelineBarMinUnits,
  resolveTimelineDayCentredStartMinutes,
  resolveTimelineMilestoneLabelPlacement,
  resolveTimelineProgressFillUnits,
  resolveTimelineUnitWidth,
} from "./calendar-timeline-model";
import type { CalendarTimelineEvent } from "./calendar-timeline-model";
import type { RowData, ViewConfig } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURES
// ───────────────────────────────────────────────────────────────────

const baseConfig: ViewConfig = {
  id: "timeline-test",
  name: "Timeline",
  sourceFolder: "notes",
  timelineStartDateField: "start",
  timelineEndDateField: "due",
  schema: {
    columns: [
      { key: "start", label: "Start", type: "date" as const },
      { key: "due", label: "Due", type: "date" as const },
    ],
    computedFields: [],
  },
};

function row(path: string, frontmatter: Record<string, unknown>): RowData {
  return { file: { path, name: path } as never, frontmatter, computed: {} };
}

// ───────────────────────────────────────────────────────────────────
// 3. ACCESSIBILITY LABEL
// ───────────────────────────────────────────────────────────────────

describe("formatTimelineAccessibilityLabel", () => {
  it("summarizes the visible window and off-window event counts", () => {
    expect(formatTimelineAccessibilityLabel("2026-08-24", "2026-08-30", 3, 2, 1, 1))
      .toBe("Timeline 2026-08-24 to 2026-08-30. 3 events in the visible range; 2 outside the range (1 before and 1 after).");
  });

  it("reports an empty timeline without omitting the window", () => {
    expect(formatTimelineAccessibilityLabel("2026-08-24", "2026-08-30", 0, 0, 0, 0))
      .toBe("Timeline 2026-08-24 to 2026-08-30. 0 events in the visible range; 0 outside the range (0 before and 0 after).");
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. RANGE GEOMETRY
// ───────────────────────────────────────────────────────────────────

describe("buildTimelineRangeGeometry", () => {
  it("pads the range 7 days before the earliest task date and 14 after the latest of task dates and today", () => {
    const rows = [row("a.md", { start: "2026-08-10", due: "2026-08-20" })];
    const range = buildTimelineRangeGeometry(rows, baseConfig, "day", { todayDateKey: "2026-09-03" });
    // Today (09-03) is newer than the task due, so the range extends after it.
    expect(range.startDateKey).toBe("2026-08-03");
    expect(range.endDateKey).toBe("2026-09-17");
    expect(range.totalDays).toBe(45);
  });

  it("expands a short range to the scale's minimum span, centered", () => {
    const rows = [row("a.md", { start: "2026-09-03", due: "2026-09-03" })];
    const range = buildTimelineRangeGeometry(rows, baseConfig, "day", { todayDateKey: "2026-09-03" });
    // 21 days after padding; day scale needs 30, so each side grows by ceil(9/2).
    expect(range.startDateKey).toBe("2026-08-22");
    expect(range.endDateKey).toBe("2026-09-22");
    expect(range.totalDays).toBe(31);
  });

  it("snaps the start to the first of the month at non-day scales", () => {
    const rows = [row("a.md", { start: "2026-08-10", due: "2026-08-10" })];
    const range = buildTimelineRangeGeometry(rows, baseConfig, "week", { todayDateKey: "2026-09-03" });
    expect(range.startDateKey).toBe("2026-07-01");
    // 45 days padded (today extends the tail), expanded to the 90-day week minimum, then month-snapped.
    expect(range.endDateKey).toBe("2026-10-10");
    expect(range.totalDays).toBe(101);
  });

  it("keeps the day-scale start unsnapped", () => {
    const rows = [row("a.md", { start: "2026-08-10", due: "2026-08-10" })];
    const range = buildTimelineRangeGeometry(rows, baseConfig, "day", { todayDateKey: "2026-09-03" });
    expect(range.startDateKey).toBe("2026-08-03");
    expect(range.endDateKey).toBe("2026-09-17");
  });

  it("falls back to today when no row carries a date", () => {
    const rows = [row("a.md", {})];
    const range = buildTimelineRangeGeometry(rows, baseConfig, "week", { todayDateKey: "2026-09-03" });
    // Today padded 7/14 days, expanded to the 90-day week minimum, month-snapped.
    expect(range.startDateKey).toBe("2026-07-01");
    expect(range.endDateKey).toBe("2026-10-22");
    expect(range.totalDays).toBe(113);
  });

  it("reports the reference day width per scale", () => {
    const rows: RowData[] = [];
    expect(buildTimelineRangeGeometry(rows, baseConfig, "day", { todayDateKey: "2026-09-03" }).dayWidth).toBe(44);
    expect(buildTimelineRangeGeometry(rows, baseConfig, "week", { todayDateKey: "2026-09-03" }).dayWidth).toBe(22);
    expect(buildTimelineRangeGeometry(rows, baseConfig, "month", { todayDateKey: "2026-09-03" }).dayWidth).toBe(9);
    expect(buildTimelineRangeGeometry(rows, baseConfig, "quarter", { todayDateKey: "2026-09-03" }).dayWidth).toBe(5);
    expect(buildTimelineRangeGeometry(rows, baseConfig, "year", { todayDateKey: "2026-09-03" }).dayWidth).toBe(2);
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. BAR GEOMETRY
// ───────────────────────────────────────────────────────────────────

describe("resolveTimelineBarMinUnits", () => {
  it("keeps the timed-event floor at day scale", () => {
    expect(resolveTimelineBarMinUnits("day", 48)).toBe(0.25);
  });

  it("converts the eight-pixel minimum into whole day units", () => {
    expect(resolveTimelineBarMinUnits("year", 4)).toBe(2);
    expect(resolveTimelineBarMinUnits("quarter", 15)).toBe(1);
    expect(resolveTimelineBarMinUnits("week", 100)).toBe(1);
  });
});

describe("buildCalendarTimelineEvents bar metadata", () => {
  it("uses a due date as the start of a due-only bar", () => {
    const events = buildCalendarTimelineEvents(
      [row("due-only.md", { due: "2026-09-05" })],
      baseConfig,
      { startField: "start", endField: "due" },
    );
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      startDateKey: "2026-09-05",
      endDateKey: "2026-09-05",
      endIsDateOnly: true,
    });
    expect(collectUnscheduledTimelineRows([row("due-only.md", { due: "2026-09-05" })], baseConfig, "start")).toEqual([]);
  });

  it("carries milestone and clamped progress metadata into the bar model", () => {
    const events = buildCalendarTimelineEvents(
      [row("milestone.md", { start: "2026-09-05", due: "2026-09-05", type: "milestone", progress: "120" })],
      baseConfig,
      { startField: "start", endField: "due" },
    );
    expect(events[0]).toMatchObject({ isMilestone: true, progress: 100 });
  });
});

describe("resolveTimelineBarGeometry", () => {
  const base = {
    startDateKey: "2026-09-03",
    rangeStartDateKey: "2026-09-01",
    scale: "week" as const,
    unitWidth: 100,
  };

  it("renders a due-only event as a one-day bar ending the day after", () => {
    const bar = resolveTimelineBarGeometry(base);
    expect(bar.isDueOnly).toBe(true);
    expect(bar.startDateKey).toBe("2026-09-03");
    expect(bar.endDateKey).toBe("2026-09-04");
    expect(bar.durationDays).toBe(1);
    expect(bar.durationUnits).toBe(1);
    expect(bar.offsetUnits).toBe(2);
  });

  it("treats an inclusive date end as end-plus-one", () => {
    const bar = resolveTimelineBarGeometry({ ...base, endDateKey: "2026-09-05", endIsDateOnly: true });
    expect(bar.endDateKey).toBe("2026-09-06");
    expect(bar.durationDays).toBe(3);
    expect(bar.durationUnits).toBe(3);
  });

  it("keeps an exact end date when the end column carries a time", () => {
    const bar = resolveTimelineBarGeometry({ ...base, endDateKey: "2026-09-05", endIsDateOnly: false });
    expect(bar.endDateKey).toBe("2026-09-05");
    expect(bar.durationDays).toBe(2);
  });

  it("applies the eight-pixel minimum at coarse scales", () => {
    const bar = resolveTimelineBarGeometry({ ...base, scale: "year", unitWidth: 4 });
    expect(bar.durationUnits).toBe(2);
  });

  it("centers a milestone marker on its date", () => {
    const bar = resolveTimelineBarGeometry({ ...base, isMilestone: true });
    expect(bar.isMilestone).toBe(true);
    expect(bar.offsetUnits).toBe(2.5);
    expect(bar.durationUnits).toBe(1);
  });
});

describe("resolveTimelineProgressFillUnits", () => {
  it("scales the fill to the bar width", () => {
    expect(resolveTimelineProgressFillUnits(50, 4)).toBe(2);
    expect(resolveTimelineProgressFillUnits(100, 4)).toBe(4);
    expect(resolveTimelineProgressFillUnits(25, 4)).toBe(1);
  });

  it("renders no fill at zero progress", () => {
    expect(resolveTimelineProgressFillUnits(0, 4)).toBe(0);
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. SCALE-BOUNDARY TICKS
// ───────────────────────────────────────────────────────────────────

describe("buildTimelineTicks scale boundaries", () => {
  it("flags Monday ticks at week scale", () => {
    const ticks = buildTimelineTicks(
      { startDateKey: "2026-08-31", endDateKey: "2026-09-06", totalUnits: 7, unit: "day" },
      "week",
      baseConfig,
    );
    const monday = ticks.find((tick) => tick.dateKey === "2026-08-31");
    const tuesday = ticks.find((tick) => tick.dateKey === "2026-09-01");
    expect(monday?.isScaleBoundary).toBe(true);
    expect(tuesday?.isScaleBoundary).toBeFalsy();
  });

  it("flags the first of the month at month scale", () => {
    const ticks = buildTimelineTicks(
      { startDateKey: "2026-09-01", endDateKey: "2026-09-30", totalUnits: 30, unit: "day" },
      "month",
      baseConfig,
    );
    expect(ticks.find((tick) => tick.dateKey === "2026-09-01")?.isScaleBoundary).toBe(true);
    expect(ticks.find((tick) => tick.dateKey === "2026-09-02")?.isScaleBoundary).toBeFalsy();
  });

  it("emits quarter-start boundary ticks at quarter scale even off the weekly step", () => {
    const ticks = buildTimelineTicks(
      { startDateKey: "2026-09-27", endDateKey: "2027-01-08", totalUnits: 104, unit: "day" },
      "quarter",
      baseConfig,
    );
    const october = ticks.find((tick) => tick.dateKey === "2026-10-01");
    const january = ticks.find((tick) => tick.dateKey === "2027-01-01");
    expect(october).toMatchObject({ offsetUnits: 4, isScaleBoundary: true });
    expect(january).toMatchObject({ offsetUnits: 96, isScaleBoundary: true });
  });

  it("emits quarter-start boundary ticks at year scale", () => {
    const ticks = buildTimelineTicks(
      { startDateKey: "2026-01-01", endDateKey: "2026-12-31", totalUnits: 365, unit: "day" },
      "year",
      baseConfig,
    );
    expect(ticks.find((tick) => tick.dateKey === "2026-04-01")?.isScaleBoundary).toBe(true);
    expect(ticks.find((tick) => tick.dateKey === "2026-07-01")).toMatchObject({ offsetUnits: 181, isScaleBoundary: true });
    expect(ticks.find((tick) => tick.dateKey === "2026-10-01")).toMatchObject({ offsetUnits: 273, isScaleBoundary: true });
  });
});

// ───────────────────────────────────────────────────────────────────
// 7. TITLE WINDOW
// ───────────────────────────────────────────────────────────────────

describe("getTimelineTitleWindow describes the rendered window", () => {
  it("returns the viewport-centred window when a visible unit count is given", () => {
    const window = getTimelineTitleWindow({ ...baseConfig, timelineScale: "quarter" }, "2026-03-25", 93);
    expect(window.startDateKey).toBe("2026-02-07");
    expect(window.endDateKey).toBe("2026-05-10");
  });

  it("keeps the natural quarter for the no-viewport fallback path", () => {
    const window = getTimelineTitleWindow({ ...baseConfig, timelineScale: "quarter" }, "2026-03-25");
    expect(window.startDateKey).toBe("2026-01-01");
    expect(window.endDateKey).toBe("2026-03-31");
  });
});

// ───────────────────────────────────────────────────────────────────
// 8. MILESTONE LABEL PLACEMENT
// ───────────────────────────────────────────────────────────────────

describe("resolveTimelineMilestoneLabelPlacement", () => {
  function timelineEvent(over: Partial<CalendarTimelineEvent>): CalendarTimelineEvent {
    return {
      id: "e",
      title: "Event",
      filePath: "e.md",
      row: row("e.md", {}),
      startDateKey: "2026-03-25",
      endDateKey: "2026-03-25",
      offsetUnits: 0,
      durationUnits: 1,
      durationDays: 1,
      windowPosition: "visible",
      order: 0,
      ...over,
    };
  }

  it("places the label above when the next bar starts within the label span", () => {
    const milestoneEvent = timelineEvent({ id: "m", title: "Adobe CC", isMilestone: true });
    const next = timelineEvent({ id: "n", title: "Notion", startDateKey: "2026-03-26", endDateKey: "2026-03-31" });
    expect(resolveTimelineMilestoneLabelPlacement(milestoneEvent, [milestoneEvent, next], 15, "day")).toBe("above");
    expect(resolveTimelineMilestoneLabelPlacement(milestoneEvent, [milestoneEvent, next], 100, "day")).toBe("above");
  });

  it("keeps the label inline when the next bar starts beyond the label span", () => {
    const milestoneEvent = timelineEvent({ id: "m", title: "Adobe CC", isMilestone: true });
    const next = timelineEvent({ id: "n", title: "Later", startDateKey: "2026-05-20", endDateKey: "2026-05-25" });
    expect(resolveTimelineMilestoneLabelPlacement(milestoneEvent, [milestoneEvent, next], 15, "day")).toBe("inline");
  });

  it("reports inline for non-milestone events", () => {
    expect(resolveTimelineMilestoneLabelPlacement(timelineEvent({}), [timelineEvent({})], 15, "day")).toBe("inline");
  });
});

// ───────────────────────────────────────────────────────────────────
// 9. NARROW-VIEWPORT DAY SCALE
// ───────────────────────────────────────────────────────────────────

describe("resolveTimelineUnitWidth at narrow viewports", () => {
  it("narrows the day-scale unit width on a phone-width viewport", () => {
    expect(resolveTimelineUnitWidth({}, "day", 402)).toBe(32);
  });

  it("keeps the desktop day width and every other scale unchanged", () => {
    expect(resolveTimelineUnitWidth({}, "day", 1440)).toBe(60);
    expect(resolveTimelineUnitWidth({}, "day")).toBe(60);
    expect(resolveTimelineUnitWidth({}, "week", 402)).toBe(100);
    expect(resolveTimelineUnitWidth({}, "quarter", 402)).toBe(15);
  });

  it("respects a custom day width at narrow viewports", () => {
    expect(resolveTimelineUnitWidth({ timelineColumnSizeMode: "custom", timelineCustomUnitWidth: 90 }, "day", 402)).toBe(90);
  });
});

describe("resolveTimelineDayCentredStartMinutes", () => {
  it("centres the current hour in the middle of the visible window", () => {
    expect(resolveTimelineDayCentredStartMinutes(11, new Date(2026, 2, 25, 14, 30))).toBe(9 * 60);
    expect(resolveTimelineDayCentredStartMinutes(11, new Date(2026, 2, 25, 14, 45))).toBe(9 * 60);
  });

  it("clamps the window into the anchor day", () => {
    expect(resolveTimelineDayCentredStartMinutes(11, new Date(2026, 2, 25, 2, 0))).toBe(0);
    expect(resolveTimelineDayCentredStartMinutes(11, new Date(2026, 2, 25, 23, 0))).toBe(13 * 60);
  });
});

describe("getTimelineViewportWindow day scale centring", () => {
  it("centres the window on the current hour when no anchor time is configured", () => {
    const window = getTimelineViewportWindow({ ...baseConfig, timelineScale: "day" }, "2026-03-25", 11, undefined, new Date(2026, 2, 25, 14, 30));
    expect(window.startMinutes).toBe(9 * 60);
    expect(window.startDateKey).toBe("2026-03-25");
    expect(window.totalUnits).toBe(11);
  });

  it("keeps a configured anchor time as the window start", () => {
    const window = getTimelineViewportWindow(
      { ...baseConfig, timelineScale: "day", timelineAnchorTimeMinutes: 8 * 60 },
      "2026-03-25",
      11,
      undefined,
      new Date(2026, 2, 25, 14, 30),
    );
    expect(window.startMinutes).toBe(8 * 60);
  });
});
