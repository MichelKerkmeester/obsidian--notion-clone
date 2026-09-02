// ───────────────────────────────────────────────────────────────────
// MODULE:    touch-environment
// COMPONENT: touch/coarse-pointer detection and a long-press gesture for database views
// ───────────────────────────────────────────────────────────────────
//
// isTouchDevice combines three independent signals — Obsidian's native
// mobile/tablet platform flags, CSS coarse-pointer media query, and
// container width — because container width alone must still flip a
// split pane to touch mode on a wide desktop window, and platform flags
// alone would miss touch laptops/tablets running the desktop app.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { Platform } from "obsidian";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS & WINDOW/CONTAINER HELPERS
// ───────────────────────────────────────────────────────────────────

export const TOUCH_LAYOUT_MAX_WIDTH = 760;

function getDefaultWindow(): Window | undefined {
  return typeof window === "undefined" ? undefined : window;
}

function getContainerWidth(container: HTMLElement | null | undefined): number | undefined {
  if (!container) return undefined;
  const rectWidth = container.getBoundingClientRect?.().width;
  if (Number.isFinite(rectWidth) && rectWidth > 0) return rectWidth;
  const clientWidth = container.clientWidth;
  return Number.isFinite(clientWidth) && clientWidth > 0 ? clientWidth : undefined;
}

/**
 * Returns the interaction mode used by database views. Obsidian's platform
 * flags cover native mobile, coarse-pointer detection covers tablets and
 * touch laptops, and the container width keeps split panes usable when the
 * window itself is still wide.
 */
// ───────────────────────────────────────────────────────────────────
// 3. TOUCH DETECTION
// ───────────────────────────────────────────────────────────────────

export function isTouchDevice(
  container?: HTMLElement | null,
  ownerWindow: Window | undefined = getDefaultWindow(),
): boolean {
  const platformTouch = Boolean(Platform.isMobile || Platform.isTablet);
  const coarsePointer = Boolean(ownerWindow?.matchMedia?.("(pointer: coarse)").matches);
  const width = getContainerWidth(container);
  const narrowContainer = width != null && width <= TOUCH_LAYOUT_MAX_WIDTH;
  return platformTouch || coarsePointer || narrowContainer;
}

export function observeTouchEnvironment(
  container: HTMLElement,
  onChange: (touch: boolean) => void,
  ownerWindow: Window | undefined = container.ownerDocument.defaultView || getDefaultWindow(),
): () => void {
  const update = () => onChange(isTouchDevice(container, ownerWindow));
  update();
  if (typeof ResizeObserver === "undefined") return () => undefined;
  const observer = new ResizeObserver(update);
  observer.observe(container);
  return () => observer.disconnect();
}

// ───────────────────────────────────────────────────────────────────
// 4. LONG PRESS GESTURE
// ───────────────────────────────────────────────────────────────────

export interface LongPressOptions {
  onLongPress: (event: PointerEvent) => void;
  delay?: number;
  moveTolerance?: number;
  ignoreTarget?: (event: PointerEvent) => boolean;
}

/**
 * Adds a touch/pen context-menu gesture that consumes the press it completed.
 *
 * A completed hold has to end the gesture, not merely add to it. Calling
 * `preventDefault()` when the timer fires cannot do that: the timer runs long after
 * `pointerdown` finished dispatching, and an event that has finished dispatching has no
 * default left to prevent. So the press stayed live, the browser sent its compatibility
 * `mousedown` and `click` when the finger lifted, and the target's own tap handler ran on
 * top of whatever the hold had just opened — one finger, two actions.
 *
 * The consuming is therefore done forward, on the events that have not happened yet: the
 * next `mousedown` and the next `click` on this target are swallowed in the capture phase,
 * once each, before any handler below can see them. Both are needed — a tap handler bound
 * to either one would otherwise still fire.
 *
 * The flags clear on the next `pointerdown`, which is the one event guaranteed to precede a
 * genuine later click, so a swallow that is never spent cannot carry over and eat an
 * unrelated tap.
 */
export function attachLongPress(target: HTMLElement, options: LongPressOptions): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let startX = 0;
  let startY = 0;
  let activePointerId: number | undefined;
  let swallowClick = false;
  let swallowMouseDown = false;

  const clear = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    activePointerId = undefined;
  };

  const onPointerDownCapture = () => {
    swallowClick = false;
    swallowMouseDown = false;
  };
  const onMouseDownCapture = (event: Event) => {
    if (!swallowMouseDown) return;
    swallowMouseDown = false;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  };
  const onClickCapture = (event: Event) => {
    if (!swallowClick) return;
    swallowClick = false;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || (event.pointerType && event.pointerType !== "touch" && event.pointerType !== "pen")) return;
    if (!isTouchDevice(target) || options.ignoreTarget?.(event)) return;
    clear();
    activePointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    timer = setTimeout(() => {
      timer = undefined;
      swallowClick = true;
      swallowMouseDown = true;
      if (typeof navigator !== "undefined") navigator.vibrate?.(20);
      options.onLongPress(event);
    }, options.delay ?? 450);
  };
  const onPointerMove = (event: PointerEvent) => {
    if (activePointerId !== event.pointerId) return;
    const tolerance = options.moveTolerance ?? 10;
    if (Math.hypot(event.clientX - startX, event.clientY - startY) > tolerance) clear();
  };
  const onPointerEnd = (event: PointerEvent) => {
    if (activePointerId === event.pointerId) clear();
  };

  target.addEventListener("pointerdown", onPointerDownCapture, true);
  target.addEventListener("mousedown", onMouseDownCapture, true);
  target.addEventListener("click", onClickCapture, true);
  target.addEventListener("pointerdown", onPointerDown);
  target.addEventListener("pointermove", onPointerMove);
  target.addEventListener("pointerup", onPointerEnd);
  target.addEventListener("pointercancel", onPointerEnd);
  target.addEventListener("pointerleave", onPointerEnd);
  return () => {
    clear();
    target.removeEventListener("pointerdown", onPointerDownCapture, true);
    target.removeEventListener("mousedown", onMouseDownCapture, true);
    target.removeEventListener("click", onClickCapture, true);
    target.removeEventListener("pointerdown", onPointerDown);
    target.removeEventListener("pointermove", onPointerMove);
    target.removeEventListener("pointerup", onPointerEnd);
    target.removeEventListener("pointercancel", onPointerEnd);
    target.removeEventListener("pointerleave", onPointerEnd);
  };
}
