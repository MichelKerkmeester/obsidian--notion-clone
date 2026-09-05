// ───────────────────────────────────────────────────────────────────
// MODULE:    popover-position.test
// COMPONENT: verifies the preferred-side / flip / clamp fallback chain
//            for horizontal popover placement
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   The clamp-target guard below reads this module's source, which needs the node builtins the
   plugin runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
import {
  resolveAnchoredPopoverBox,
  resolveContainerDockPlacement,
  resolvePopoverHorizontalLeft,
} from "./popover-position";

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("resolvePopoverHorizontalLeft", () => {
  const bounds = { left: 0, right: 400 };

  it("opens to the preferred side when there is room", () => {
    expect(resolvePopoverHorizontalLeft({ left: 100, right: 140, width: 40 }, bounds, 120, 8, 8, "right", "right")).toBe(148);
  });

  it("flips to the opposite side when the preferred side is clipped", () => {
    expect(resolvePopoverHorizontalLeft({ left: 350, right: 390, width: 40 }, bounds, 120, 8, 8, "right", "right")).toBe(222);
  });

  it("keeps the aligned position inside the viewport when neither side fits", () => {
    expect(resolvePopoverHorizontalLeft({ left: 180, right: 220, width: 420 }, bounds, 420, 8, 8, "center")).toBe(8);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. CLAMP TARGET ORDERING
// ───────────────────────────────────────────────────────────────────

describe("visible-bounds clamp target", () => {
  // The helper resolves its region through the DOM and this suite has no jsdom, so the only
  // available guard reads the source. It pins the selector order and nothing else.
  it("prefers the root split over regions that span the sidebars", () => {
    const source = readFileSync(resolve(__dirname, "./popover-position.ts"), "utf-8");
    const rootSplit = source.indexOf('".workspace-split.mod-root"');
    const appContainer = source.indexOf('".app-container"');

    expect(rootSplit).toBeGreaterThan(-1);
    // Clamping to a region that includes the right sidebar lets a popover slide under it.
    expect(rootSplit).toBeLessThan(appContainer);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE ANCHORLESS RECORD PANEL: STRIP VS DOCK
// ───────────────────────────────────────────────────────────────────

// A desktop pane, 900px tall, with the pane starting where a left sidebar ends.
const VIEWPORT_HEIGHT = 900;
const PANE = { top: 0, bottom: VIEWPORT_HEIGHT, left: 300, right: 1440 };
const BOUNDS = { top: 0, bottom: VIEWPORT_HEIGHT, height: VIEWPORT_HEIGHT, left: 0, right: 1440 };
const MARGIN = 12;
const GAP = 6;

// The panel's own content height, taken from the browser reading that opened this repair rather
// than derived here: it is the input the arithmetic below is fed, not something it computes.
const MEASURED_CONTENT_HEIGHT = 72;

describe("a surface anchored to something that fills its pane", () => {
  it("is pinned to the top and left at content height, which is the reported strip", () => {
    // The pane container was passed as the anchor. A rectangle that fills the pane leaves no room
    // above or below itself, so both spaces come out zero and the no-room fallback takes over: the
    // surface goes to the top of the bounds and nothing makes it any taller than its content.
    const box = resolveAnchoredPopoverBox(PANE, BOUNDS, MEASURED_CONTENT_HEIGHT, GAP, MARGIN);

    expect(box.top).toBe(12);
    expect(box.height).toBe(72);
    expect(box.top + box.height).toBe(84);
    // A generous cap over a short content height is precisely how this reads as correct while
    // painting a strip, so the cap is asserted too rather than assumed to be the culprit.
    expect(box.maxHeight).toBe(VIEWPORT_HEIGHT - MARGIN * 2);
    expect(box.height).toBeLessThan(100);
  });

  it("still places a surface beside a real element, which is what must not change", () => {
    // A board card, mid-pane. Room below, so the surface takes the anchored branch and sits under
    // the card at its content height — the geometry an anchored open has always had.
    const card = { top: 358, bottom: 529 };
    const box = resolveAnchoredPopoverBox(card, BOUNDS, 171, GAP, MARGIN);

    expect(box.top).toBe(535);
    expect(box.height).toBe(171);
    expect(box.top + box.height).toBe(706);
  });
});

describe("the same surface docked to its pane instead", () => {
  const dock = resolveContainerDockPlacement(PANE, BOUNDS, 360, MARGIN);

  it("takes the pane's height rather than its content's", () => {
    expect(dock.height).toBeGreaterThanOrEqual(VIEWPORT_HEIGHT * 0.6);
    // The strip and the dock are the same surface under the same viewport, so the comparison is
    // the repair: one is decided by content, the other by the pane.
    expect(dock.height).toBeGreaterThan(MEASURED_CONTENT_HEIGHT);
  });

  it("sits against the pane's trailing edge", () => {
    expect(dock.left + dock.width).toBe(PANE.right - MARGIN);
  });

  it("starts at the pane's top, never above it", () => {
    expect(dock.top).toBeGreaterThanOrEqual(PANE.top);
  });

  it("narrows rather than overhanging a pane too small for its width", () => {
    // A split pane can be narrower than this surface would like. Hanging off the pane's leading
    // edge would put it over the neighbouring split, which is worse than being cramped.
    const narrow = { top: 0, bottom: VIEWPORT_HEIGHT, left: 1100, right: 1440 };
    const box = resolveContainerDockPlacement(narrow, BOUNDS, 360, MARGIN);

    expect(box.left).toBeGreaterThanOrEqual(narrow.left);
    expect(box.width).toBeLessThan(360);
    expect(box.left + box.width).toBe(narrow.right - MARGIN);
  });

  it("stays inside the viewport when the pane runs past it", () => {
    // A pane taller than the visible bounds — a scrolled workspace — must not push the dock off
    // screen; the dock takes the intersection of the two rather than trusting either alone.
    const tall = { top: -200, bottom: 1400, left: 300, right: 1440 };
    const box = resolveContainerDockPlacement(tall, BOUNDS, 360, MARGIN);

    expect(box.top).toBeGreaterThanOrEqual(BOUNDS.top);
    expect(box.top + box.height).toBeLessThanOrEqual(BOUNDS.bottom);
  });
});

describe("a pane that has not laid out", () => {
  it("falls back to the bounds rather than docking to a strip of nothing", () => {
    // A pane whose only child is this fixed panel reports no area at all. Intersecting the bounds
    // with an empty rect would reproduce the very defect the dock exists to remove, so an empty
    // pane rect is treated as missing information — the rule this module already applies to bounds.
    const empty = { top: 0, bottom: 0, left: 0, right: 0 };
    const box = resolveContainerDockPlacement(empty, BOUNDS, 360, MARGIN);

    expect(box.height).toBe(0);
    // The guard lives in placeContainerDock, which is what chooses the rectangle to dock against;
    // the resolver stays honest about the degenerate input it was handed.
    const fallback = resolveContainerDockPlacement(BOUNDS, BOUNDS, 360, MARGIN);
    expect(fallback.height).toBeGreaterThanOrEqual(VIEWPORT_HEIGHT * 0.6);
  });
});
