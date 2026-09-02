// ───────────────────────────────────────────────────────────────────
// MODULE:    touch-environment.test
// COMPONENT: tests for touch/coarse-pointer device detection and the long-press gesture
// ───────────────────────────────────────────────────────────────────
//
// WHAT THE LONG-PRESS CASES DO NOT PROVE. There is no DOM here, so the element is a
// plain EventTarget with no tree and no hit-testing, and "capture" only means the
// gesture's own listeners were registered before the target's tap handler. That is the
// ordering the real capture phase guarantees, so it is the right shape to pin — but a
// browser also decides WHICH element the compatibility click is delivered to, and this
// cannot see that. WebKit delivers it to the original touch target, which is the case
// these tests model; Blink re-hit-tests and may deliver it elsewhere entirely.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => ({ Platform: { isMobile: false, isTablet: false } }));

import { Platform } from "obsidian";
import { attachLongPress, isTouchDevice } from "./touch-environment";

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("isTouchDevice", () => {
  it("recognizes Obsidian mobile and tablet platforms", () => {
    const platform = Platform as typeof Platform & { isMobile: boolean; isTablet: boolean };
    platform.isMobile = true;
    expect(isTouchDevice(undefined, undefined)).toBe(true);
    platform.isMobile = false;
    platform.isTablet = true;
    expect(isTouchDevice(undefined, undefined)).toBe(true);
    platform.isTablet = false;
  });

  it("recognizes coarse pointers and narrow split panes", () => {
    const view = { matchMedia: vi.fn(() => ({ matches: true })) } as unknown as Window;
    expect(isTouchDevice(undefined, view)).toBe(true);
    const container = { getBoundingClientRect: () => ({ width: 640 }) } as HTMLElement;
    const desktopView = { matchMedia: vi.fn(() => ({ matches: false })) } as unknown as Window;
    expect(isTouchDevice(container, desktopView)).toBe(true);
  });

  it("does not classify a normal desktop viewport as touch", () => {
    const container = { getBoundingClientRect: () => ({ width: 1200 }), clientWidth: 1200 } as HTMLElement;
    const view = { matchMedia: vi.fn(() => ({ matches: false })) } as unknown as Window;
    expect(isTouchDevice(container, view)).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. LONG PRESS
// ───────────────────────────────────────────────────────────────────

/** A phone-width element: narrow enough that the gesture's own touch check passes. */
class FakeTarget extends EventTarget {
  getBoundingClientRect(): { width: number } {
    return { width: 390 };
  }
}

function makeTarget(): { target: HTMLElement; taps: string[] } {
  const target = new FakeTarget() as unknown as HTMLElement;
  return { target, taps: [] };
}

/** The row's own tap action, bound after the gesture, exactly as a real caller binds it. */
function bindTapAction(target: HTMLElement, taps: string[]): void {
  for (const type of ["mousedown", "click"]) {
    target.addEventListener(type, () => taps.push(type));
  }
}

function press(target: HTMLElement, clientX = 10, clientY = 10): void {
  const event = new Event("pointerdown", { cancelable: true });
  Object.assign(event, { button: 0, pointerType: "touch", pointerId: 1, clientX, clientY });
  target.dispatchEvent(event);
}

function lift(target: HTMLElement): void {
  const event = new Event("pointerup", { cancelable: true });
  Object.assign(event, { button: 0, pointerType: "touch", pointerId: 1 });
  target.dispatchEvent(event);
}

/** The compatibility mouse events a browser sends after a touch that was not consumed. */
function compatibilityTap(target: HTMLElement): { mouseDown: Event; click: Event } {
  const mouseDown = new Event("mousedown", { cancelable: true });
  const click = new Event("click", { cancelable: true });
  target.dispatchEvent(mouseDown);
  target.dispatchEvent(click);
  return { mouseDown, click };
}

describe("attachLongPress", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("consumes the compatibility click of the press it completed", () => {
    vi.useFakeTimers();
    const { target, taps } = makeTarget();
    const held: string[] = [];
    const detach = attachLongPress(target, { delay: 450, onLongPress: () => held.push("long press") });
    bindTapAction(target, taps);

    press(target);
    vi.advanceTimersByTime(450);
    lift(target);
    const { mouseDown, click } = compatibilityTap(target);

    expect(held).toEqual(["long press"]);
    // One finger, one action: the hold opened the menu, so the row's tap must not also run.
    expect(taps).toEqual([]);
    expect(mouseDown.defaultPrevented).toBe(true);
    expect(click.defaultPrevented).toBe(true);
    detach();
  });

  it("leaves an ordinary tap alone", () => {
    vi.useFakeTimers();
    const { target, taps } = makeTarget();
    const held: string[] = [];
    const detach = attachLongPress(target, { delay: 450, onLongPress: () => held.push("long press") });
    bindTapAction(target, taps);

    press(target);
    vi.advanceTimersByTime(100);
    lift(target);
    compatibilityTap(target);

    expect(held).toEqual([]);
    expect(taps).toEqual(["mousedown", "click"]);
    detach();
  });

  it("does not carry an unspent swallow into the next press", () => {
    vi.useFakeTimers();
    const { target, taps } = makeTarget();
    const detach = attachLongPress(target, { delay: 450, onLongPress: () => undefined });
    bindTapAction(target, taps);

    // A completed hold whose compatibility events never arrived — the browser delivered
    // them elsewhere, or the surface the hold opened swallowed them first.
    press(target);
    vi.advanceTimersByTime(450);
    lift(target);

    // The next press is a real tap and must reach the row.
    press(target);
    vi.advanceTimersByTime(100);
    lift(target);
    compatibilityTap(target);

    expect(taps).toEqual(["mousedown", "click"]);
    detach();
  });
});
