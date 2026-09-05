// ───────────────────────────────────────────────────────────────────
// MODULE:    timeline-render-bench.test
// COMPONENT: eventDateFrom's day-of-month rollover, and the fixture's determinism under a frozen clock
// ───────────────────────────────────────────────────────────────────
//
// The fixture anchors on "today" (eventStart(), addDateKeyDays(getLocalDateKey(renderNow()),
// -4)) so the bench's bars sit inside the gantt's scroll-to-today window; eventDateFrom then
// spreads EVENT_WINDOW_DAYS worth of rows across that span. Naive day-of-month string
// arithmetic (`Number(start.slice(8,10)) + offset`) was silently wrong whenever the anchor
// landed in the last EVENT_WINDOW_DAYS days of a month: adding the offset overflowed the
// day-of-month (August 31 + 1 becomes the non-existent "2026-08-32"), the date failed to parse,
// and buildCalendarTimelineEvents dropped that row's event entirely — no bar, no milestone
// diamond, no dependency arrow, exactly the affordances the constructed captures exist to
// prove. Section 2 pins eventDateFrom's month/year rollover directly, independent of whatever
// "today" happens to be when the suite runs; section 3 pins that the anchor itself stays fixed
// once the render clock is frozen, independent of which real day the process happens to start on.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { afterEach, describe, expect, it, vi } from "vitest";
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

// ───────────────────────────────────────────────────────────────────
// 3. FROZEN-CLOCK DETERMINISM
// ───────────────────────────────────────────────────────────────────

// EVENT_START used to anchor on `new Date()` directly, read once at module-load time — whatever
// real moment the capture process happened to start. Calling the bench twice inside one already-
// running process could not see that (the constant is already cached), so this forces a fresh
// module instance per simulated day, the same way two separate `npm run screenshots` invocations
// on two different real calendar days each get one fresh read of the clock. The bench now reads
// "today" through renderNow() (calendar-date-time.ts), the same seam the render-assertion
// harness freezes for capture and gate runs; freezing it here on both fresh instances proves the
// seam reaches the fixture regardless of which day the real (faked) clock reads.
describe("makeRows under a frozen render clock", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  async function rowsAfterFreshImport(systemTime, frozen) {
    vi.setSystemTime(systemTime);
    vi.resetModules();
    const clock = await import("../../src/data/calendar-date-time.ts");
    clock.setFrozenRenderNow(frozen);
    const bench = await import("./timeline-render-bench.ts");
    return bench.makeRows(20, bench.makeColumns(4, "text"), 1);
  }

  it("produces identical rows on two different real days once the render clock is frozen", async () => {
    vi.useFakeTimers();
    const frozen = new Date(2026, 2, 25, 13, 45, 0, 0);

    const rowsDayOne = await rowsAfterFreshImport(new Date(2026, 8, 3, 9, 0, 0, 0), frozen);
    // A calendar day later on the real (faked) clock; the freeze is unchanged.
    const rowsDayTwo = await rowsAfterFreshImport(new Date(2026, 8, 4, 9, 0, 0, 0), frozen);

    expect(rowsDayTwo).toEqual(rowsDayOne);
  });
});
