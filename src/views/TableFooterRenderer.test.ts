import { describe, expect, it, vi } from "vitest";
import { calculateTableAggregate, getCalculationColumnIndex, normalizeCalculationKind } from "./TableFooterRenderer";
import type { ColumnDef } from "../data/types";

vi.mock("obsidian", () => ({
  App: class {},
  CachedMetadata: class {},
  TFile: class {},
  getAllTags: vi.fn(() => []),
  normalizePath: (path: string) => path,
}));

describe("TableFooterRenderer calculations", () => {
  it("maps a calculation to the stable visible column index", () => {
    const columns = [
      { key: "name", label: "Name", type: "text" },
      { key: "amount", label: "Amount", type: "number" },
    ] as ColumnDef[];
    expect(getCalculationColumnIndex(columns, "amount")).toBe(1);
    expect(getCalculationColumnIndex(columns, "missing")).toBe(-1);
  });

  it("calculates numeric, presence, and boolean summaries without mutating values", () => {
    const values = [1, 2, null, true, false];
    expect(calculateTableAggregate(values, "SUM")).toBe(3);
    expect(calculateTableAggregate(values, "average")).toBe(1.5);
    expect(calculateTableAggregate(values, "EMPTY")).toBe(1);
    expect(calculateTableAggregate(values, "CHECKED")).toBe(1);
    expect(values).toEqual([1, 2, null, true, false]);
  });

  it("normalizes legacy summary names", () => {
    expect(normalizeCalculationKind("standard-deviation")).toBe("STDDEV");
    expect(normalizeCalculationKind("count_empty")).toBe("EMPTY");
    expect(normalizeCalculationKind("unknown")).toBeNull();
  });
});
