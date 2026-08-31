// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-search-placement.test
// COMPONENT: the search-results panel's clamp, driven not transcribed
// ───────────────────────────────────────────────────────────────────
//
// This arithmetic used to sit inline in two private methods on renderers that need a live Obsidian
// `App`, so every check of it was a copy. That copy was measured failing in the way that matters:
// reverting the SOURCE left the run green while reverting the COPY turned it red.
//
// The placement lane now calls the real function, at two anchors, in a real browser. What it does
// NOT assert is the left floor or either end of the width clamp — it only measures the right edge
// against the sidebar. These are the cases nothing else covers.

// ───────────────────────────────────────────────────────────────────
// 1. THE FIXTURE
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { calendarSearchResultsPlacement } from "./popover-position";

/** An editing area between two open sidebars: 300px in, 1140px out, on a 1440px window. */
const BETWEEN_SIDEBARS = { left: 300, right: 1140, bottom: 900, width: 840 };

// ───────────────────────────────────────────────────────────────────
// 2. THE HORIZONTAL CLAMP
// ───────────────────────────────────────────────────────────────────

describe("the search-results panel stays inside the editing area", () => {
  it("clamps its right edge to the bounds, not to the window", () => {
    const far = calendarSearchResultsPlacement({ left: 1000, bottom: 40 }, BETWEEN_SIDEBARS);
    expect(far.left + far.width).toBe(1132);
    // 8px of margin inside the editing area's right edge, which is the whole point of the clamp.
    expect(BETWEEN_SIDEBARS.right - (far.left + far.width)).toBe(8);
  });

  it("floors the left edge inside the editing area rather than at the window's edge", () => {
    // The half that is easy to miss, because it only shows with a LEFT sidebar open. A window
    // relative floor of 8 puts the panel underneath it while the right edge still looks correct.
    const nearLeft = calendarSearchResultsPlacement({ left: -200, bottom: 40 }, BETWEEN_SIDEBARS);
    expect(nearLeft.left).toBe(308);
    expect(nearLeft.left).toBeGreaterThan(8);
  });

  it("follows the anchor when the anchor is already inside both floors", () => {
    // Without this the two clamps above are satisfied by a function that ignores the anchor.
    expect(calendarSearchResultsPlacement({ left: 500, bottom: 40 }, BETWEEN_SIDEBARS).left).toBe(500);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. THE WIDTH
// ───────────────────────────────────────────────────────────────────

describe("the panel's width is clamped at both ends", () => {
  it("caps at 480 in a wide editing area", () => {
    expect(calendarSearchResultsPlacement({ left: 400, bottom: 0 }, BETWEEN_SIDEBARS).width).toBe(480);
  });

  it("floors at 320 in an editing area too narrow to hold it", () => {
    // A 200px column would otherwise produce a 184px panel; the floor lets it overhang rather than
    // shrink to unreadable, which is the trade this number encodes.
    const narrow = { left: 0, right: 200, bottom: 900, width: 200 };
    expect(calendarSearchResultsPlacement({ left: 0, bottom: 0 }, narrow).width).toBe(320);
  });

  it("takes the editing area's width minus its margins in between", () => {
    const mid = { left: 0, right: 400, bottom: 900, width: 400 };
    expect(calendarSearchResultsPlacement({ left: 0, bottom: 0 }, mid).width).toBe(384);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE VERTICAL PLACEMENT
// ───────────────────────────────────────────────────────────────────

describe("the panel's top", () => {
  it("sits 6px below the anchor when there is room", () => {
    expect(calendarSearchResultsPlacement({ left: 400, bottom: 40 }, BETWEEN_SIDEBARS).top).toBe(46);
  });

  it("stops 80px above the bottom rather than following an anchor near the floor", () => {
    // An anchor at the very bottom would otherwise place the panel off screen entirely.
    expect(calendarSearchResultsPlacement({ left: 400, bottom: 890 }, BETWEEN_SIDEBARS).top).toBe(820);
  });
});
