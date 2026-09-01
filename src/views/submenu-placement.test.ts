// ───────────────────────────────────────────────────────────────────
// MODULE:    submenu-placement.test
// COMPONENT: the anchorless column submenu's clamp, called rather than copied
// ───────────────────────────────────────────────────────────────────
//
// This arithmetic used to live in a private method on a renderer that needs a live Obsidian `App`,
// so every check of it was a TRANSCRIPTION — the expression copied into a probe, with the harness
// saying so in its own comment: "copying means this can go stale". The cost is not staleness. A
// transcribed check answers a question about the copy, so it goes on passing while the source it
// names regresses, which is what `001` recorded as still owed here.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & FIXTURES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { anchorlessSubmenuPlacement } from "./popover-position";

// The editing area with a right sidebar open: the window is 1440 wide and the surface a submenu
// may occupy stops at 1140. Clamping to the window is what put it 188px underneath that sidebar.
const EDITING_AREA = { left: 300, right: 1140, top: 0, bottom: 900 };
const SUBMENU = { width: 292, height: 320 };

// ───────────────────────────────────────────────────────────────────
// 2. THE HORIZONTAL CLAMP
// ───────────────────────────────────────────────────────────────────

describe("an anchorless submenu is clamped to the editing area, not the window", () => {
  it("pulls a click near the right edge back so the panel ends inside the bounds", () => {
    const { left } = anchorlessSubmenuPlacement({ x: 1080, y: 200 }, EDITING_AREA, SUBMENU);
    expect(left + SUBMENU.width).toBeLessThanOrEqual(EDITING_AREA.right - 8);
    // The number, not just the relation: 1140 - 292 - 8. A relation alone is satisfied by pinning
    // every submenu to the left edge, which is the opposite defect.
    expect(left).toBe(840);
  });

  it("leaves a click with room where it was asked for, offset by the 8px it always takes", () => {
    expect(anchorlessSubmenuPlacement({ x: 400, y: 200 }, EDITING_AREA, SUBMENU).left).toBe(408);
  });

  it("keeps the panel off an open LEFT sidebar", () => {
    // x=0 is a real click point when the pointer is over the sidebar, and a window-relative floor
    // of 8 permits it. The floor is `bounds.left + 8`.
    expect(anchorlessSubmenuPlacement({ x: 0, y: 200 }, EDITING_AREA, SUBMENU).left).toBe(308);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. THE VERTICAL CLAMP
// ───────────────────────────────────────────────────────────────────

describe("the vertical clamp answers the same two questions", () => {
  it("lifts a panel whose bottom would fall past the bounds", () => {
    const { top } = anchorlessSubmenuPlacement({ x: 400, y: 800 }, EDITING_AREA, SUBMENU);
    expect(top + SUBMENU.height).toBeLessThanOrEqual(EDITING_AREA.bottom - 8);
    expect(top).toBe(572);
  });

  it("measures the height rather than assuming one, so a short panel is not lifted", () => {
    // The source used a hardcoded 320 here before it measured. A 100px submenu at y=800 fits
    // without lifting, and a check that passed a fixed 320 could not tell the two apart.
    const { top } = anchorlessSubmenuPlacement({ x: 400, y: 800 }, EDITING_AREA, { width: 292, height: 100 });
    expect(top).toBe(792);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. AN INVERTED RANGE
// ───────────────────────────────────────────────────────────────────

describe("a visible area narrower than the submenu itself", () => {
  it("pins to the left edge rather than off it", () => {
    // `bounds.right - width - 8` is 108 here, BELOW the floor of 308 — an inverted range. Resolving
    // it toward the UPPER bound would hang the panel off the left edge to keep it off the right
    // one, trading one overhang for its mirror image. `clamp` resolves toward the lower bound, and
    // this is the case that pins that choice rather than leaving it to a reading of `clamp`.
    const narrow = { left: 300, right: 500, top: 0, bottom: 900 };
    expect(anchorlessSubmenuPlacement({ x: 400, y: 200 }, narrow, SUBMENU).left).toBe(308);
  });

  it("does the same vertically", () => {
    const short = { left: 300, right: 1140, top: 0, bottom: 200 };
    expect(anchorlessSubmenuPlacement({ x: 400, y: 100 }, short, SUBMENU).top).toBe(8);
  });
});
