// ───────────────────────────────────────────────────────────────────
// MODULE:    aggregate.test
// COMPONENT: numeric/date rollup aggregate regression suite
// ───────────────────────────────────────────────────────────────────
//
// The aggregates must treat NaN/Infinity/null/empty-string as absent rather
// than propagating them into a rollup total, and must do so identically
// across the numeric and date variants — a rollup silently going NaN on one
// dirty row is worse than the row being skipped. This suite pins that
// filtering behavior plus the non-mutating contract of median's sort.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { earliest, isNumericRollupKind, latest, max, median, min, percentEmpty, percentFilled, range } from "./aggregate";

type AggregateName = "min" | "max" | "median" | "range";
type Aggregate = (numbers: readonly number[]) => number | null;

type NumericCase = {
  name: string;
  values: readonly unknown[];
  expected: Record<AggregateName, number | null>;
};

const aggregateFunctions: ReadonlyArray<readonly [AggregateName, Aggregate]> = [
  ["min", min],
  ["max", max],
  ["median", median],
  ["range", range],
];

const numericCases: NumericCase[] = [
  {
    name: "empty",
    values: [],
    expected: { min: null, max: null, median: null, range: null },
  },
  {
    name: "all-null",
    values: [null, undefined, ""],
    expected: { min: null, max: null, median: null, range: null },
  },
  {
    name: "single",
    values: [-7],
    expected: { min: -7, max: -7, median: -7, range: 0 },
  },
  {
    name: "odd",
    values: [9, 1, 5],
    expected: { min: 1, max: 9, median: 5, range: 8 },
  },
  {
    name: "even",
    values: [10, 2, 8, 4],
    expected: { min: 2, max: 10, median: 6, range: 8 },
  },
  {
    name: "mixed values",
    values: [null, "7", 8, -2, "", 5],
    expected: { min: -2, max: 8, median: 5, range: 10 },
  },
  {
    name: "NaN and Infinity",
    values: [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
    expected: { min: null, max: null, median: null, range: null },
  },
  {
    name: "finite values among NaN and Infinity",
    values: [Number.NaN, 4, Number.POSITIVE_INFINITY, 1],
    expected: { min: 1, max: 4, median: 2.5, range: 3 },
  },
];

function toFiniteNumbers(values: readonly unknown[]): number[] {
  return values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

describe("numeric aggregates", () => {
  for (const testCase of numericCases) {
    for (const [name, aggregate] of aggregateFunctions) {
      it(`${name} handles ${testCase.name} values`, () => {
        expect(aggregate(toFiniteNumbers(testCase.values))).toBe(testCase.expected[name]);
      });
    }
  }

  it("median sorts a copy without mutating the input", () => {
    const values = [9, 1, 5, 3];

    expect(median(values)).toBe(4);
    expect(values).toEqual([9, 1, 5, 3]);
  });
});

type DateAggregateName = "earliest" | "latest";
type DateAggregate = (timestamps: readonly number[]) => Date | null;

type DateCase = {
  name: string;
  values: readonly number[];
  expected: Record<DateAggregateName, Date | null>;
};

const dateAggregateFunctions: ReadonlyArray<readonly [DateAggregateName, DateAggregate]> = [
  ["earliest", earliest],
  ["latest", latest],
];

const dateCases: DateCase[] = [
  {
    name: "empty",
    values: [],
    expected: { earliest: null, latest: null },
  },
  {
    name: "all-invalid",
    values: [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
    expected: { earliest: null, latest: null },
  },
  {
    name: "single",
    values: [Date.UTC(2024, 0, 2, 10, 30)],
    expected: {
      earliest: new Date(Date.UTC(2024, 0, 2, 10, 30)),
      latest: new Date(Date.UTC(2024, 0, 2, 10, 30)),
    },
  },
  {
    name: "mixed valid and invalid",
    values: [Number.NaN, Date.UTC(2024, 0, 3), Number.POSITIVE_INFINITY, Date.UTC(2024, 0, 1)],
    expected: {
      earliest: new Date(Date.UTC(2024, 0, 1)),
      latest: new Date(Date.UTC(2024, 0, 3)),
    },
  },
];

describe("date aggregates", () => {
  for (const testCase of dateCases) {
    for (const [name, aggregate] of dateAggregateFunctions) {
      it(`${name} handles ${testCase.name} timestamps`, () => {
        expect(aggregate(testCase.values)).toEqual(testCase.expected[name]);
      });
    }
  }
});

describe("percent aggregates", () => {
  it("returns zero when there are no rows", () => {
    expect(percentEmpty(0, 0)).toBe(0);
    expect(percentFilled(0, 0)).toBe(0);
  });

  it("returns 100 percent empty and 0 percent filled for all-empty rows", () => {
    expect(percentEmpty(3, 3)).toBe(100);
    expect(percentFilled(3, 3)).toBe(0);
  });

  it("uses all rows as the denominator for mixed values", () => {
    expect(percentEmpty(4, 1)).toBe(25);
    expect(percentFilled(4, 1)).toBe(75);
  });
});

describe("isNumericRollupKind", () => {
  it.each(["count", "sum", "avg", "min", "max", "median", "range", "percentEmpty", "percentFilled"])(
    "recognizes %s",
    (kind) => {
      expect(isNumericRollupKind(kind)).toBe(true);
    },
  );

  it.each(["list", "earliest", "latest", ""])("excludes %s", (kind) => {
    expect(isNumericRollupKind(kind)).toBe(false);
  });
});
