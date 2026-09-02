// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-flick.test
// COMPONENT: the velocity half of dismissal, asked rather than produced
// ───────────────────────────────────────────────────────────────────
//
// Two lanes drove a 40px gesture "as fast as possible" and asserted it dismissed. On a quiet machine
// that delivers roughly 2 px/ms and passes; on a loaded one it delivers under 0.8 and the same tree
// reports a working flick as broken. The check was measuring how fast the harness could talk to the
// browser, which is not a property of the plugin.
//
// The distance path is untouched and still driven by a real pointer in those lanes: 120px is 120px
// however slowly it arrives. Only the velocity clause moved here.

// ───────────────────────────────────────────────────────────────────
// 1. THE THRESHOLD
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import {
  FLICK_MIN_PX,
  FLICK_PX_PER_MS,
  STALE_SAMPLE_MS,
  attachSheetDragToDismiss,
  shouldFlickDismiss,
} from "./mobile-bottom-sheet";

describe("a flick dismisses on speed where a drag would not", () => {
  it("takes a genuine flick", () => {
    // 1.18 px/ms is the measured speed of a real flick, recorded beside the constant.
    expect(shouldFlickDismiss(40, 1.18, 8)).toBe(true);
  });

  it("refuses a brisk drag aiming for the distance threshold", () => {
    // 0.5 px/ms is a brisk 96px-scale drag at frame pace. It falls short of the distance threshold
    // and must spring back rather than close — the case that made the first version of this feature
    // get reverted.
    expect(shouldFlickDismiss(80, 0.5, 8)).toBe(false);
  });

  it("puts the boundary on the dismissing side", () => {
    expect(shouldFlickDismiss(40, FLICK_PX_PER_MS, 8)).toBe(true);
    expect(shouldFlickDismiss(40, FLICK_PX_PER_MS - 0.001, 8)).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────
// 2. THE TWO GUARDS
// ───────────────────────────────────────────────────────────────────

describe("the guards that keep a tap and a rest from reading as a flick", () => {
  it("refuses a fast tap that travelled nowhere", () => {
    // A press and release in one spot produces a large ratio over a tiny interval — an infinitely
    // fast flick, without the distance floor.
    expect(shouldFlickDismiss(FLICK_MIN_PX - 1, 50, 1)).toBe(false);
    expect(shouldFlickDismiss(FLICK_MIN_PX, 50, 1)).toBe(true);
  });

  it("refuses a finger that arrived fast and then rested before lifting", () => {
    // Velocity is carried from the move stream, so a hand that stops at the bottom of its travel
    // still holds the speed it arrived at. Resting is not flicking, however fast it got there.
    expect(shouldFlickDismiss(40, 2, STALE_SAMPLE_MS + 1)).toBe(false);
    expect(shouldFlickDismiss(40, 2, STALE_SAMPLE_MS)).toBe(true);
  });

  it("refuses a gesture with no measured velocity at all", () => {
    // The first move of a stream has nothing to differentiate against.
    expect(shouldFlickDismiss(40, 0, 8)).toBe(false);
  });
});

describe("pointer cancellation", () => {
  it("does not dismiss after a fast move is cancelled", () => {
    const listeners = new Map<string, (event: PointerEvent) => void>();
    const handle = {} as HTMLElement;
    const panel = {
      querySelector: () => handle,
      addEventListener: (type: string, listener: EventListener) => {
        listeners.set(type, listener as unknown as (event: PointerEvent) => void);
      },
      removeEventListener: (type: string) => {
        listeners.delete(type);
      },
      setCssProps: () => undefined,
      setPointerCapture: () => undefined,
    } as unknown as HTMLElement;
    let dismissed = 0;
    const release = attachSheetDragToDismiss(panel, () => { dismissed++; });
    const event = (type: string, clientY: number, timeStamp: number): PointerEvent => {
      const listener = listeners.get(type);
      if (!listener) throw new Error(`missing ${type} listener`);
      return {
        button: 0,
        clientY,
        pointerId: 1,
        target: handle,
        timeStamp,
      } as unknown as PointerEvent;
    };

    listeners.get("pointerdown")?.(event("pointerdown", 0, 0));
    listeners.get("pointermove")?.(event("pointermove", 40, 10));
    listeners.get("pointercancel")?.(event("pointercancel", 40, 11));

    expect(dismissed).toBe(0);

    // The handle has to survive the cancellation. A cancel that stopped dismissing but left the
    // gesture marked as still tracking would refuse this second drag outright, which is the dead
    // grab band the operator reported rather than the unwanted close.
    listeners.get("pointerdown")?.(event("pointerdown", 0, 20));
    listeners.get("pointermove")?.(event("pointermove", 40, 30));
    listeners.get("pointerup")?.(event("pointerup", 40, 31));
    expect(dismissed).toBe(1);

    release();
  });
});
