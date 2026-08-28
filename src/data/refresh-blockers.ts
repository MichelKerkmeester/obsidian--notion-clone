// ───────────────────────────────────────────────────────────────────
// MODULE:    refresh-blockers
// COMPONENT: view-level predicate that suppresses refresh while a drag is in flight
// ───────────────────────────────────────────────────────────────────
//
// Drag renderers own their own `.is-dragging` cleanup, but a browser or
// window-focus interruption can occasionally swallow the dragend event and
// leave that class stuck. A refresh callback that checks isRefreshBlockedByDrag
// must never be blocked forever because of it, so a WeakMap tracks per-
// container drag start time and self-expires the block after staleAfterMs.

// ───────────────────────────────────────────────────────────────────
// 1. DRAG BLOCK
// ───────────────────────────────────────────────────────────────────

const dragStartedAt = new WeakMap<HTMLElement, number>();

/**
 * Drag renderers own their CSS cleanup, but a browser/window interruption can
 * occasionally swallow dragend. Never let a stale class block refresh forever.
 */
export function isRefreshBlockedByDrag(
  container: HTMLElement | null | undefined,
  now = Date.now(),
  staleAfterMs = 10_000
): boolean {
  if (!container?.querySelector(".is-dragging")) {
    if (container) dragStartedAt.delete(container);
    return false;
  }
  const startedAt = dragStartedAt.get(container) ?? now;
  dragStartedAt.set(container, startedAt);
  if (now - startedAt < staleAfterMs) return true;
  dragStartedAt.delete(container);
  return false;
}
