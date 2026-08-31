// ───────────────────────────────────────────────────────────────────
// MODULE:    formula-suggestion-placement.test
// COMPONENT: the suggestion box's clamp and its suppression, driven not copied
// ───────────────────────────────────────────────────────────────────
//
// These two pieces of arithmetic used to sit inline in private methods on a modal that needs a live
// Obsidian `App`, so every check of them was a TRANSCRIPTION — the expression copied into a probe.
// A transcribed check answers a question about the copy. The copy matched its source, which was
// verified by reading both, and it would have gone on passing if the source lost the clamp
// entirely. That is the whole cost, and it is why these are imported here rather than restated.

import { describe, expect, it } from "vitest";
import {
  clampSuggestionLeft,
  suppressesInlineSuggestions,
  INLINE_SUGGESTION_MIN_WIDTH,
} from "./formula-modal";

// ───────────────────────────────────────────────────────────────────
// 1. THE CLAMP
// ───────────────────────────────────────────────────────────────────

describe("the suggestion box stays inside its container", () => {
  it("pulls the box back when the caret would push its right edge past the field", () => {
    // The reported defect: caret at 700 in an 800px field with a 270px box. Unclamped the box
    // would end at 970 — 170px past its container, which is the overhang this phase recorded.
    expect(clampSuggestionLeft(700, 800, 270)).toBe(530);
    // And 530 + 270 lands exactly on the container's edge, which is the point.
    expect(530 + 270).toBe(800);
  });

  it("leaves the caret position alone when the box already fits", () => {
    // A clamp that moved a box which already fitted would be a placement bug of its own.
    expect(clampSuggestionLeft(100, 800, 270)).toBe(100);
  });

  it("never returns a negative left, even when the box is wider than the field", () => {
    // `available - boxWidth` goes negative here. Without the lower bound the box would be placed
    // off the left edge — trading one overhang for the opposite one.
    expect(clampSuggestionLeft(50, 200, 270)).toBe(0);
  });
});

// ───────────────────────────────────────────────────────────────────
// 2. THE SUPPRESSION
// ───────────────────────────────────────────────────────────────────

describe("a narrow modal suppresses the inline box rather than clamping it", () => {
  it("suppresses below the threshold and allows at it", () => {
    expect(suppressesInlineSuggestions(INLINE_SUGGESTION_MIN_WIDTH - 1, false)).toBe(true);
    // The boundary belongs to the allowed side; a check that only tested well inside each range
    // would pass on an off-by-one either way.
    expect(suppressesInlineSuggestions(INLINE_SUGGESTION_MIN_WIDTH, false)).toBe(false);
  });

  it("suppresses on a phone whatever the width says", () => {
    expect(suppressesInlineSuggestions(1200, true)).toBe(true);
  });

  it("treats an unmeasured modal as allowed, not as narrow", () => {
    // Width 0 means nothing was measured — a modal that has not laid out. Reading that as "narrow"
    // would suppress the box on every surface for the first frame.
    expect(suppressesInlineSuggestions(0, false)).toBe(false);
  });
});
