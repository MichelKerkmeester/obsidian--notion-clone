// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-title-formatter.test
// COMPONENT: title text for calendar/timeline headers, per scale
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { formatCalendarTitleParts } from "./calendar-title-formatter";

// ───────────────────────────────────────────────────────────────────
// 2. YEAR-SCALE TITLES
// ───────────────────────────────────────────────────────────────────

describe("formatCalendarTitleParts year scale", () => {
  it("names the year span of the rendered window when it crosses years", () => {
    const parts = formatCalendarTitleParts({
      scale: "year",
      startDateKey: "2025-10-04",
      endDateKey: "2026-09-21",
      locale: "en",
    });
    expect(parts.main).toBe("2025 — 2026");
    expect(parts.year).toBe("");
  });

  it("keeps a single year for a window inside one year", () => {
    const parts = formatCalendarTitleParts({
      scale: "year",
      startDateKey: "2026-02-09",
      endDateKey: "2026-05-08",
      locale: "en",
    });
    expect(parts.main).toBe("2026");
    expect(parts.year).toBe("");
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. UNCHANGED SCALES (regression pin)
// ───────────────────────────────────────────────────────────────────

describe("formatCalendarTitleParts other scales stay as they are", () => {
  it("keeps the quarter month pair and the month/week/day forms", () => {
    expect(formatCalendarTitleParts({ scale: "quarter", startDateKey: "2026-01-01", endDateKey: "2026-03-31", locale: "en" }).main)
      .toBe("January — March");
    expect(formatCalendarTitleParts({ scale: "month", startDateKey: "2026-03-01", endDateKey: "2026-03-31", locale: "en" }).main)
      .toBe("March");
    expect(formatCalendarTitleParts({ scale: "week", startDateKey: "2026-03-23", endDateKey: "2026-04-05", locale: "en" }).main)
      .toBe("March 23 — April 5");
    expect(formatCalendarTitleParts({ scale: "day", startDateKey: "2026-03-25", endDateKey: "2026-03-25", locale: "en" }).main)
      .toBe("March 25");
  });
});
