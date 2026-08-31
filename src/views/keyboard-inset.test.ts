// ───────────────────────────────────────────────────────────────────
// MODULE:    keyboard-inset.test
// COMPONENT: the software-keyboard inset, and the pinch it must not mistake for one
// ───────────────────────────────────────────────────────────────────
//
// The browser check that claimed to cover the pinch-zoom guard evaluated
// `visualViewport.scale <= 1.01 && zoomed <= 1` against the harness's own untouched viewport, where
// `scale` is always 1 and the visual height always equals `innerHeight`. That is `1 <= 1.01 && 0 <= 1`
// — two constants, true by construction, on every run for ever. It measured the harness's viewport
// identity rather than the guard, and its own comment conceded that a viewport cannot be pinched
// from script.
//
// A viewport still cannot be pinched from script. The decision, though, is three numbers in and one
// out, so it is checked as one.

// ───────────────────────────────────────────────────────────────────
// 1. THE FIXTURE
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { MAX_UNZOOMED_SCALE, resolveKeyboardInset } from "./popover-position";

/** An 844px phone whose software keyboard covers 336px, seen through the visual viewport. */
const LAYOUT = 844;
const COVERED = 336;
const keyboardOpen = (scale: number) => ({ height: LAYOUT - COVERED, offsetTop: 0, scale });

// ───────────────────────────────────────────────────────────────────
// 2. THE PINCH GUARD
// ───────────────────────────────────────────────────────────────────

describe("a pinch is not a keyboard", () => {
  it("takes the shrink at rest", () => {
    expect(resolveKeyboardInset(0, LAYOUT, keyboardOpen(1))).toBe(COVERED);
  });

  it("ignores an identical shrink while the viewport is zoomed", () => {
    // Same numbers, one difference. Without the guard a pinch lifts the sheet off the floor by a
    // third of the screen for no reason at all.
    expect(resolveKeyboardInset(0, LAYOUT, keyboardOpen(2))).toBe(0);
  });

  it("still takes the shrink at the top of the resting band, and not a hair above it", () => {
    // The boundary belongs to the keyboard side: a resting viewport does not always report exactly
    // 1, and a strict comparison would switch the fallback off on a real keyboard.
    expect(resolveKeyboardInset(0, LAYOUT, keyboardOpen(MAX_UNZOOMED_SCALE))).toBe(COVERED);
    expect(resolveKeyboardInset(0, LAYOUT, keyboardOpen(MAX_UNZOOMED_SCALE + 0.001))).toBe(0);
  });

  it("does not let a zoom suppress what the host itself declared", () => {
    // The guard belongs to the OBSERVED term only. A host that says a keyboard is open is not
    // contradicted by the viewport being zoomed at the same time.
    expect(resolveKeyboardInset(COVERED, LAYOUT, keyboardOpen(2))).toBe(COVERED);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. THE TWO ARMS
// ───────────────────────────────────────────────────────────────────

describe("the host's report and the viewport's shrink are one thing observed twice", () => {
  it("takes whichever noticed first", () => {
    // The host lags the platform by a frame or two, and sometimes leads it. Neither arm is the
    // preference; `max` is what makes the answer independent of which one arrived.
    expect(resolveKeyboardInset(100, LAYOUT, keyboardOpen(1))).toBe(COVERED);
    expect(resolveKeyboardInset(COVERED, LAYOUT, { height: LAYOUT, offsetTop: 0, scale: 1 })).toBe(COVERED);
  });

  it("reports nothing when neither arm sees anything", () => {
    expect(resolveKeyboardInset(0, LAYOUT, { height: LAYOUT, offsetTop: 0, scale: 1 })).toBe(0);
  });

  it("works on a host with no visual viewport at all", () => {
    // An older WebView reports none. The host arm has to carry the surface alone there.
    expect(resolveKeyboardInset(COVERED, LAYOUT, null)).toBe(COVERED);
    expect(resolveKeyboardInset(0, LAYOUT, null)).toBe(0);
  });

  it("never returns a negative inset from either arm", () => {
    // A visual viewport TALLER than the layout viewport is reported during some overscroll and
    // toolbar-collapse states. Read as an inset it would push the sheet below the floor.
    expect(resolveKeyboardInset(0, LAYOUT, { height: LAYOUT + 60, offsetTop: 0, scale: 1 })).toBe(0);
    expect(resolveKeyboardInset(-40, LAYOUT, null)).toBe(0);
  });

  it("subtracts the visual viewport's own offset, so a scrolled viewport is not read as a keyboard", () => {
    // `offsetTop` is how far the visual viewport has been scrolled inside the layout viewport. Left
    // in, a viewport pushed down by 100px would report a 100px keyboard.
    expect(resolveKeyboardInset(0, LAYOUT, { height: LAYOUT - 100, offsetTop: 100, scale: 1 })).toBe(0);
  });
});
