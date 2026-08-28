// ───────────────────────────────────────────────────────────────────
// MODULE:    computed-formulas.test
// COMPONENT: locked-semantics regression suite for the IFS/SWITCH/math formula wrappers
// ───────────────────────────────────────────────────────────────────
//
// These wrappers intentionally diverge from native JS/Math semantics — SWITCH
// is case-sensitive, LOG defaults to base 10 instead of Math.log's base e,
// and domain errors (SQRT(-1), LN(0)) resolve quietly to NaN/-Infinity
// instead of throwing or warning. That divergence is the point (it matches
// user-facing spreadsheet-formula expectations), so this suite pins it down.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import { formulaIfsSwitchMath } from "../formula-ifs-switch-math";

describe("computed formula logic wrappers", () => {
  it("selects the first matching IFS tax bracket at each boundary", () => {
    const taxRate = (income: number) => formulaIfsSwitchMath.IFS(
      income <= 69715,
      0.14,
      income <= 150000,
      0.3,
      0.36,
    );

    expect(taxRate(69715)).toBe(0.14);
    expect(taxRate(69716)).toBe(0.3);
    expect(taxRate(150000)).toBe(0.3);
    expect(taxRate(150001)).toBe(0.36);
  });

  it("uses strict case-sensitive SWITCH matching", () => {
    expect(formulaIfsSwitchMath.SWITCH("Month", "Month", "matched")).toBe("matched");
    expect(formulaIfsSwitchMath.SWITCH("Month", "month", "not matched")).toBeNull();
  });

  it("returns null for empty, incomplete, and unmatched branches", () => {
    expect(formulaIfsSwitchMath.IFS()).toBeNull();
    expect(formulaIfsSwitchMath.IFS(true)).toBeNull();
    expect(formulaIfsSwitchMath.IFS(false, "not matched")).toBeNull();
    expect(formulaIfsSwitchMath.SWITCH()).toBeNull();
    expect(formulaIfsSwitchMath.SWITCH("Month")).toBeNull();
    expect(formulaIfsSwitchMath.SWITCH("Month", "month", "not matched")).toBeNull();
  });

  it("uses trailing defaults for IFS and SWITCH", () => {
    expect(formulaIfsSwitchMath.IFS(false, "not matched", "fallback")).toBe("fallback");
    expect(formulaIfsSwitchMath.SWITCH("Month", "month", "not matched", "fallback")).toBe("fallback");
  });
});

describe("computed formula math wrappers", () => {
  it("matches the locked math semantics", () => {
    expect(formulaIfsSwitchMath.SQRT(9)).toBe(3);
    expect(formulaIfsSwitchMath.LN(Math.E)).toBeCloseTo(1);

    expect(formulaIfsSwitchMath.LOG(100)).toBe(2);
    expect(formulaIfsSwitchMath.LOG(100)).not.toBe(Math.log(100));
    expect(formulaIfsSwitchMath.LOG(8, 2)).toBe(3);

    expect(formulaIfsSwitchMath.LOG10(1000)).toBe(Math.log10(1000));
    expect(formulaIfsSwitchMath.EXP(2)).toBe(Math.exp(2));
    expect(formulaIfsSwitchMath.CBRT(-27)).toBe(Math.cbrt(-27));
  });

  it("preserves IEEE domain results", () => {
    expect(formulaIfsSwitchMath.SQRT(-1)).toBeNaN();
    expect(formulaIfsSwitchMath.LN(0)).toBe(-Infinity);
    expect(Number.isFinite(formulaIfsSwitchMath.LOG(10, 1))).toBe(false);
  });

  it("does not warn for wrapper edge cases", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    try {
      formulaIfsSwitchMath.IFS(false, "not matched");
      formulaIfsSwitchMath.SWITCH("Month", "month", "not matched");
      formulaIfsSwitchMath.SQRT(-1);
      formulaIfsSwitchMath.LN(0);
      formulaIfsSwitchMath.LOG(10, 1);
      formulaIfsSwitchMath.LOG10(0);
      formulaIfsSwitchMath.EXP(1);
      formulaIfsSwitchMath.CBRT(-8);

      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});
