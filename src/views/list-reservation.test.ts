// ───────────────────────────────────────────────────────────────────
// MODULE:    list-reservation.test
// COMPONENT: whether two properties can share a line, and the band where the answer is generous
// ───────────────────────────────────────────────────────────────────
//
// This decision was a private method needing a rendered element, so the width sweep that checks it
// could only compare its own arithmetic against the renderer's. A sweep built that way passes a
// renderer that reserves at every width, because both sides move together — measured, before the
// decision was lifted out.
//
// The browser sweep now calls this function to pick which arm applies. What it cannot reach is the
// boundary, because a real field area lands where the layout puts it.

// ───────────────────────────────────────────────────────────────────
// 1. THE FIXTURE
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { reservesColumnsOnWrappingLine } from "./list-renderer";

/** The four unequal widths the placement sweep renders, in declaration order. */
const WIDTHS = [110, 190, 150, 130];
const GAP = 12;

// ───────────────────────────────────────────────────────────────────
// 2. THE DECISION
// ───────────────────────────────────────────────────────────────────

describe("two properties share a line when the narrowest pair fits", () => {
  it("reserves where the narrowest pair plus the gap fits exactly", () => {
    // 110 + 12 + 130 = 252. The boundary belongs to the reserving side.
    expect(reservesColumnsOnWrappingLine(WIDTHS, GAP, 252)).toBe(true);
    expect(reservesColumnsOnWrappingLine(WIDTHS, GAP, 251)).toBe(false);
  });

  it("takes the two narrowest, not the first two declared", () => {
    // Declaration order starts 110, 190 — a decision reading those would want 312 and refuse at 268,
    // where the shipped one reserves. This is the difference the sweep's 430px width lands on.
    expect(reservesColumnsOnWrappingLine(WIDTHS, GAP, 268)).toBe(true);
  });

  it("counts the gap, so a wide gap can be the thing that does not fit", () => {
    expect(reservesColumnsOnWrappingLine(WIDTHS, 0, 240)).toBe(true);
    expect(reservesColumnsOnWrappingLine(WIDTHS, 40, 240)).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. THE CASES THAT CANNOT BE DECIDED
// ───────────────────────────────────────────────────────────────────

describe("a field area that cannot be judged reserves rather than skips", () => {
  it("reserves when there is nothing to pair", () => {
    // Fewer than two widths: no pair exists to test, and the uncertain cases resolve toward
    // reserving because a needless reservation costs height while a needless skip costs alignment.
    expect(reservesColumnsOnWrappingLine([110], GAP, 40)).toBe(true);
    expect(reservesColumnsOnWrappingLine([], GAP, 0)).toBe(true);
  });

  it("refuses a field area of zero when a pair does exist", () => {
    // Zero width is a real state during layout, and reserving on it would put boxes on every card
    // of a surface that has not measured yet.
    expect(reservesColumnsOnWrappingLine(WIDTHS, GAP, 0)).toBe(false);
  });
});
