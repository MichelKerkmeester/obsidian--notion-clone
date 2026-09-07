// ───────────────────────────────────────────────────────────────────
// MODULE:    date-time-format
// COMPONENT: the date-range display form, including its malformed inputs
// ───────────────────────────────────────────────────────────────────
//
// formatDateRangeDisplay ships wired into the table cell and the date editor's popover, and no
// test named it before this file: removing the whole function left vitest and render-assertions
// both green. The three malformed cases below are the ones the picker has to survive without
// throwing — an absent end, an end that does not parse as a date at all, and an end that parses
// but sits before the start — plus the ordinary two-end range the function exists for.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { formatDateRangeDisplay } from "./date-time-format";
import { getDateEndFieldKey } from "./column-types";
import type { ColumnDef } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. THE ORDINARY RANGE
// ───────────────────────────────────────────────────────────────────

describe("formatDateRangeDisplay renders both ends in one string", () => {
  it("joins two distinct dates with a dash", () => {
    expect(formatDateRangeDisplay("2026-06-04", "2026-06-06")).toBe("June 4, 2026 - June 6, 2026");
  });

  it("collapses to one date when both ends land on the same day", () => {
    expect(formatDateRangeDisplay("2026-06-04", "2026-06-04")).toBe("June 4, 2026");
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. THE THREE MALFORMED CASES — none of them may throw
// ───────────────────────────────────────────────────────────────────

describe("formatDateRangeDisplay tolerates every malformed case the date-range picker can hand it", () => {
  it("renders the start alone when the end is absent", () => {
    expect(formatDateRangeDisplay("2026-06-04", undefined)).toBe(formatDateRangeDisplay("2026-06-04", "2026-06-04"));
    expect(formatDateRangeDisplay("2026-06-04", "")).toBe(formatDateRangeDisplay("2026-06-04", "2026-06-04"));
  });

  it("falls back to the start alone when the end does not parse as a date at all", () => {
    expect(() => formatDateRangeDisplay("2026-06-04", "not-a-date")).not.toThrow();
    expect(formatDateRangeDisplay("2026-06-04", "not-a-date")).toBe(formatDateRangeDisplay("2026-06-04", "2026-06-04"));
  });

  it("renders an end that sits before the start without throwing or swapping the pair", () => {
    // No ordering validation happens here — the picker itself is what states which value it
    // treats as authoritative; this call only has to survive the pair, in the order it was given.
    expect(() => formatDateRangeDisplay("2026-06-10", "2026-06-01")).not.toThrow();
    expect(formatDateRangeDisplay("2026-06-10", "2026-06-01")).toBe("June 10, 2026 - June 1, 2026");
  });

  it("renders empty when both ends are absent", () => {
    expect(formatDateRangeDisplay(undefined, undefined)).toBe("");
    expect(formatDateRangeDisplay("", "")).toBe("");
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE DERIVED END-FIELD KEY
// ───────────────────────────────────────────────────────────────────

describe("getDateEndFieldKey", () => {
  it("derives the companion key from the column's own key", () => {
    const col = { key: "dueDate" } as ColumnDef;
    expect(getDateEndFieldKey(col)).toBe("dueDate::end");
  });
});
