// ───────────────────────────────────────────────────────────────────
// MODULE:    touch-target-measure.test
// COMPONENT: the pure floor-classification helpers touch-targets.mjs applies to a rendered box
// ───────────────────────────────────────────────────────────────────
//
// `classifyBox` and `findDeclaredExcuse` decide the touch-targets verdict for every element in
// both the fixture pass and the constructed-renderer pass, so a wrong boundary here is wrong in
// both. Both classifiers used to be inline in the page.evaluate() closure and untestable without a
// browser; extracting them makes the boundary itself provable without one.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { classifyBox, findDeclaredExcuse } from "./touch-target-measure.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. classifyBox
// ───────────────────────────────────────────────────────────────────

describe("classifyBox", () => {
  it("returns null once the short side clears the enhanced (44px) threshold", () => {
    expect(classifyBox(44, 44, 28, 44)).toBeNull();
    expect(classifyBox(200, 44, 28, 44)).toBeNull();
  });

  it("reports belowFloor: false for a box between the floor and the enhanced threshold", () => {
    expect(classifyBox(30, 30, 28, 44)).toEqual({ belowFloor: false });
    expect(classifyBox(28, 40, 28, 44)).toEqual({ belowFloor: false });
  });

  it("reports belowFloor: true for a box under the floor", () => {
    expect(classifyBox(27, 40, 28, 44)).toEqual({ belowFloor: true });
    expect(classifyBox(10, 14, 28, 44)).toEqual({ belowFloor: true });
  });

  it("takes the shorter side, not the longer one, so a thin wide bar still fails", () => {
    // A 300px-wide, 4px-tall grab bar reads as a 4px control, not a 300px one.
    expect(classifyBox(300, 4, 28, 44)).toEqual({ belowFloor: true });
  });

  it("is exact at the floor boundary: 28 clears the floor, 27 does not", () => {
    expect(classifyBox(28, 28, 28, 44)).toEqual({ belowFloor: false });
    expect(classifyBox(27, 27, 28, 44)).toEqual({ belowFloor: true });
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. findDeclaredExcuse
// ───────────────────────────────────────────────────────────────────

describe("findDeclaredExcuse", () => {
  const declared = [
    { match: "internal-link", reason: "inline text link" },
    { match: "db-checkbox", reason: "measured directly by the checkbox tool" },
  ];

  it("finds the declared entry whose class fragment appears in the element's class list", () => {
    expect(findDeclaredExcuse("db-list-row-title internal-link", declared))
      .toEqual({ match: "internal-link", reason: "inline text link" });
  });

  it("returns null when no declared fragment matches", () => {
    expect(findDeclaredExcuse("db-list-row-open", declared)).toBeNull();
  });

  it("returns null for an empty class list", () => {
    expect(findDeclaredExcuse("", declared)).toBeNull();
  });
});
