import { describe, expect, it } from "vitest";
import { formatReportsNumber, isReportsComputedColumn } from "./ReportsDisplay";
import type { ColumnDef } from "./types";

describe("isReportsComputedColumn", () => {
  it("is true for the Remaining computed column", () => {
    const col: ColumnDef = { key: "remaining", label: "Remaining", type: "computed", computedKey: "remaining" };
    expect(isReportsComputedColumn(col)).toBe(true);
  });

  it("is true for the Saved computed column", () => {
    const col: ColumnDef = { key: "saved", label: "Saved", type: "computed", computedKey: "saved" };
    expect(isReportsComputedColumn(col)).toBe(true);
  });

  it("is true when the storage key falls back to col.key (no computedKey set)", () => {
    const col: ColumnDef = { key: "remaining", label: "Remaining", type: "computed" };
    expect(isReportsComputedColumn(col)).toBe(true);
  });

  it("is false for a plain frontmatter number column", () => {
    const col: ColumnDef = { key: "score", label: "Score", type: "number" };
    expect(isReportsComputedColumn(col)).toBe(false);
  });

  it("is false for a numeric SUM rollup column", () => {
    const col: ColumnDef = {
      key: "income",
      label: "Income",
      type: "rollup",
      rollupConfig: { relationField: "month", targetField: "amount", aggregation: "sum" },
    };
    expect(isReportsComputedColumn(col)).toBe(false);
  });

  it("is false for an unrelated user-defined computed number column", () => {
    const col: ColumnDef = { key: "total_score", label: "Total score", type: "computed", computedKey: "total_score" };
    expect(isReportsComputedColumn(col)).toBe(false);
  });
});

describe("Reports display values", () => {
  it("formats the known remaining value", () => {
    expect(formatReportsNumber(1000 - 400)).toBe("600");
  });

  it("uses Dutch grouping for larger values", () => {
    expect(formatReportsNumber(1000)).toBe("1.000");
  });

  it("keeps a real zero numeric", () => {
    expect(formatReportsNumber(0)).toBe("0");
  });

  it.each([null, undefined, "", "not a formula result", Number.NaN, Number.POSITIVE_INFINITY])(
    "fails closed for %s",
    (value) => {
      expect(formatReportsNumber(value)).toBe("-");
    },
  );
});
