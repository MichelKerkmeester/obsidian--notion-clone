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

/** Adds a touch/pen context-menu gesture without changing the native click path. */
export function attachLongPress(target: HTMLElement, options: LongPressOptions): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let startX = 0;
  let startY = 0;
  let activePointerId: number | undefined;

  const clear = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    activePointerId = undefined;
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
      event.preventDefault();
      event.stopPropagation();
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

  target.addEventListener("pointerdown", onPointerDown);
  target.addEventListener("pointermove", onPointerMove);
  target.addEventListener("pointerup", onPointerEnd);
  target.addEventListener("pointercancel", onPointerEnd);
  target.addEventListener("pointerleave", onPointerEnd);
  return () => {
    clear();
    target.removeEventListener("pointerdown", onPointerDown);
    target.removeEventListener("pointermove", onPointerMove);
    target.removeEventListener("pointerup", onPointerEnd);
    target.removeEventListener("pointercancel", onPointerEnd);
    target.removeEventListener("pointerleave", onPointerEnd);
  };
}
