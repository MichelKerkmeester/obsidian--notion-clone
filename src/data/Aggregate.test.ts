import { describe, expect, it } from "vitest";
import { isNumericRollupKind, max, median, min, range } from "./Aggregate";

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
