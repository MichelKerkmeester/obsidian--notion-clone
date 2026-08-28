// ───────────────────────────────────────────────────────────────────
// MODULE:    edge-auto-scroller.test
// COMPONENT: unit tests for pointer-proximity autoscroll velocity and clamping
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { EdgeAutoScroller, calculateEdgeVelocity, getEdgeScrollVelocity } from "./edge-auto-scroller";

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("EdgeAutoScroller", () => {
  const bounds = { left: 100, top: 50, right: 500, bottom: 450 };

  it("starts scrolling inside the configured edge threshold", () => {
    expect(calculateEdgeVelocity(120, 100, 500, 40, 20)).toBeLessThan(0);
    expect(calculateEdgeVelocity(480, 100, 500, 40, 20)).toBeGreaterThan(0);
    expect(calculateEdgeVelocity(300, 100, 500, 40, 20)).toBe(0);
  });

  it("accelerates toward the edge while clamping at the maximum speed", () => {
    expect(calculateEdgeVelocity(100, 100, 500, 40, 20)).toBe(-20);
    expect(calculateEdgeVelocity(500, 100, 500, 40, 20)).toBe(20);
    expect(calculateEdgeVelocity(110, 100, 500, 40, 20)).toBe(-11.25);
  });

  it("calculates both axes independently", () => {
    expect(getEdgeScrollVelocity(110, 440, bounds, { edgeSize: 40, maxSpeed: 16 })).toEqual({ x: -9, y: 9 });
  });

  it("clamps animation-frame scrolling to the container bounds", () => {
    let frame: FrameRequestCallback | undefined;
    const container = {
      scrollLeft: 298,
      scrollTop: 0,
      scrollWidth: 500,
      scrollHeight: 200,
      clientWidth: 200,
      clientHeight: 200,
      getBoundingClientRect: () => ({ left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200, x: 0, y: 0, toJSON: () => ({}) }),
    } as unknown as HTMLElement;
    const scroller = new EdgeAutoScroller(container, {
      edgeSize: 40,
      maxSpeed: 18,
      requestAnimationFrame: (callback: FrameRequestCallback) => { frame = callback; return 1; },
      cancelAnimationFrame: () => undefined,
    });
    scroller.updatePointer(200, 100);
    frame?.(0);
    frame?.(0);
    expect(container.scrollLeft).toBe(300);
    expect(scroller.isRunning()).toBe(false);
  });
});
