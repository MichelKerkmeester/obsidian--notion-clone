// ───────────────────────────────────────────────────────────────────
// MODULE:    timeline-render-bench.test
// COMPONENT: eventDate's day-of-month rollover, and the fixture rows it feeds
// ───────────────────────────────────────────────────────────────────
//
// EVENT_START anchors on today (addDateKeyDays(getLocalDateKey(new Date()), -4)) so the
// bench's bars sit inside the gantt's scroll-to-today window. eventDate(i) then spreads
// EVENT_WINDOW_DAYS worth of rows across that span. Naive day-of-month string arithmetic
// (`Number(start.slice(8,10)) + offset`) is silently wrong whenever the anchor lands in the
// last EVENT_WINDOW_DAYS days of a month: adding the offset overflows the day-of-month
// (August 31 + 1 becomes the non-existent "2026-08-32"), the date fails to parse, and
// buildCalendarTimelineEvents drops that row's event entirely — no bar, no milestone
// diamond, no dependency arrow, exactly the affordances the constructed captures exist to
// prove. This suite pins eventDateFrom's month/year rollover directly, independent of
// whatever "today" happens to be when the suite runs.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { eventDateFrom, EVENT_WINDOW_DAYS } from "./timeline-render-bench.ts";

// ───────────────────────────────────────────────────────────────────
// 2. MONTH/YEAR ROLLOVER
// ───────────────────────────────────────────────────────────────────

describe("eventDateFrom", () => {
  it("rolls into the next month instead of an out-of-range day-of-month", () => {
    // August has 31 days: day 31 + 1 must become September 1, not "2026-08-32".
    expect(eventDateFrom("2026-08-31", 1)).toBe("2026-09-01");
    expect(eventDateFrom("2026-08-31", 9)).toBe("2026-09-09");
  });

  it("rolls into the next year at a December anchor", () => {
    expect(eventDateFrom("2026-12-28", 9)).toBe("2027-01-06");
  });

  it("stays on the same day at offset 0", () => {
    expect(eventDateFrom("2026-08-31", 0)).toBe("2026-08-31");
  });

  it("produces a real, round-trippable calendar date for every offset in the window, anchored on the worst-case (month-end) start date", () => {
    expect(EVENT_WINDOW_DAYS).toBeGreaterThan(0);
    for (let i = 0; i < EVENT_WINDOW_DAYS; i++) {
      const key = eventDateFrom("2026-08-31", i);
      expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const [y, m, d] = key.split("-").map(Number);
      const reparsed = new Date(Date.UTC(y, m - 1, d));
      // An out-of-range day (e.g. "2026-08-32") rolls forward silently in JS's own Date
      // constructor rather than throwing, so the round-trip catches what a try/catch would not.
      expect(reparsed.getUTCFullYear()).toBe(y);
      expect(reparsed.getUTCMonth() + 1).toBe(m);
      expect(reparsed.getUTCDate()).toBe(d);
    }
  });
});
