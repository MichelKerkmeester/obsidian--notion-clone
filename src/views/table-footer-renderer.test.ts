// ───────────────────────────────────────────────────────────────────
// MODULE:    table-footer-renderer.test
// COMPONENT: Unit tests for table footer calculation helpers
// ───────────────────────────────────────────────────────────────────
//
// Covers column-index mapping, aggregate math, and legacy summary-name
// normalization. The mutation check exists because these values arrays are
// the same references the live table renders from — calculating an
// aggregate must never sort or filter them in place.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import { calculateTableAggregate, getCalculationColumnIndex, normalizeCalculationKind } from "./table-footer-renderer";
import type { ColumnDef } from "../data/types";

// ───────────────────────────────────────────────────────────────────
// 2. MOCKS
// ───────────────────────────────────────────────────────────────────

vi.mock("obsidian", () => ({
  App: class {},
  CachedMetadata: class {},
  TFile: class {},
  getAllTags: vi.fn(() => []),
  normalizePath: (path: string) => path,
}));

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

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
