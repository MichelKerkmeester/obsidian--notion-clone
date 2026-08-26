import { describe, expect, it } from "vitest";
import { getColumnDisplayType, isEmptyValue } from "./ColumnDisplay";
import { isReportsComputedColumn } from "./ReportsDisplay";
import type { ColumnDef } from "./types";

describe("isEmptyValue", () => {
  it("treats null, undefined, and empty string as empty", () => {
    expect(isEmptyValue(null)).toBe(true);
    expect(isEmptyValue(undefined)).toBe(true);
    expect(isEmptyValue("")).toBe(true);
  });

  it("treats an empty array as empty but a non-empty array as not empty", () => {
    expect(isEmptyValue([])).toBe(true);
    expect(isEmptyValue(["a"])).toBe(false);
  });

  it("treats 0, false, and non-empty strings as not empty", () => {
    expect(isEmptyValue(0)).toBe(false);
    expect(isEmptyValue(false)).toBe(false);
    expect(isEmptyValue("0")).toBe(false);
  });
});

/**
 * Locks CellRenderer.renderCell's empty-value guard: `isEmptyValue(value) && !isReportsComputedColumn(col)`.
 * A plain empty numeric column must still take the placeholder branch (db-empty-value + editable),
 * exactly as it did before the Reports feature shipped. Only the two Reports computed columns
 * (Remaining/Saved) are allowed to skip the placeholder and fall through to the numeric "-" glyph.
 */
describe("CellRenderer empty-value placeholder guard", () => {
  function shouldShowEmptyPlaceholder(col: ColumnDef, value: unknown): boolean {
    return isEmptyValue(value) && !isReportsComputedColumn(col);
  }

  it("shows the placeholder for a plain empty numeric frontmatter column", () => {
    const col: ColumnDef = { key: "score", label: "Score", type: "number" };
    expect(getColumnDisplayType(col)).toBe("number");
    // Negative control: the defect this locks was `isEmptyValue(value) && displayType !== "number"`.
    // For this column displayType IS "number", so the old guard evaluated to `true && false` = false —
    // the placeholder was skipped and the cell rendered a bare "-" with no db-empty-value class/tooltip/
    // edit affordance. The fixed guard must evaluate to true here.
    expect(shouldShowEmptyPlaceholder(col, null)).toBe(true);
    expect(shouldShowEmptyPlaceholder(col, undefined)).toBe(true);
    expect(shouldShowEmptyPlaceholder(col, "")).toBe(true);
  });

  it("shows the placeholder for a numeric SUM rollup column when empty", () => {
    const col: ColumnDef = {
      key: "income",
      label: "Income",
      type: "rollup",
      rollupConfig: { relationField: "month", targetField: "amount", aggregation: "sum" },
    };
    expect(getColumnDisplayType(col)).toBe("number");
    expect(shouldShowEmptyPlaceholder(col, null)).toBe(true);
  });

  it("shows the placeholder for an unrelated user-defined computed number column when empty", () => {
    const col: ColumnDef = { key: "total_score", label: "Total score", type: "computed", computedKey: "total_score" };
    const computedFields = [{ key: "total_score", label: "Total score", expression: "1+1", type: "number" as const }];
    expect(getColumnDisplayType(col, computedFields)).toBe("number");
    expect(shouldShowEmptyPlaceholder(col, null)).toBe(true);
  });

  it("skips the placeholder only for the Reports Remaining/Saved computed columns", () => {
    const remaining: ColumnDef = { key: "remaining", label: "Remaining", type: "computed", computedKey: "remaining" };
    const saved: ColumnDef = { key: "saved", label: "Saved", type: "computed", computedKey: "saved" };
    expect(shouldShowEmptyPlaceholder(remaining, null)).toBe(false);
    expect(shouldShowEmptyPlaceholder(saved, null)).toBe(false);
  });

  it("never shows the placeholder for a non-empty value regardless of column", () => {
    const col: ColumnDef = { key: "score", label: "Score", type: "number" };
    expect(shouldShowEmptyPlaceholder(col, 0)).toBe(false);
    expect(shouldShowEmptyPlaceholder(col, 600)).toBe(false);
  });
});
