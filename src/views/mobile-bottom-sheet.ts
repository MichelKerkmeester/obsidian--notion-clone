// ───────────────────────────────────────────────────────────────────
// MODULE:    mobile-bottom-sheet
// COMPONENT: shared drag-to-dismiss gesture for phone bottom sheets
// ───────────────────────────────────────────────────────────────────
//
// Two independent surfaces present as the same phone bottom sheet — the
// calendar/timeline record detail panel and the table row peek — and both
// need identical "drag the grab handle down to close" behaviour. The gesture
// lives here so the two callers share one implementation instead of drifting
// apart. The pointer model matches attachLongPress (pointerdown → move →
// up/cancel) so mouse and touch both drive it, and the panel follows the
// finger only downward; releasing past the threshold closes, otherwise it
// springs back.

// ───────────────────────────────────────────────────────────────────
// 1. SHEET CHROME
// ───────────────────────────────────────────────────────────────────

/**
 * Apply or remove the phone bottom-sheet chrome: the sheet class and the grab handle.
 *
 * This is presentation, deliberately separated from placement. The anchored positioner used to own
 * both, which is why no modal could ever present as a sheet: a modal has no anchor element, so it
 * could not call the positioner at all, and the chrome was only reachable through it. Splitting the
 * two means a caller declares "this is a sheet" and supplies its own placement — or lets Obsidian
 * place it, as a modal does.
 *
 * Idempotent: re-applying will not stack handles, and turning the sheet off removes the handle it
 * added rather than leaving an orphan behind.
 */
export function applySheetChrome(panel: HTMLElement, isSheet: boolean): void {
  panel.toggleClass("db-mobile-bottom-sheet", isSheet);
  const existingHandle = panel.querySelector<HTMLElement>(".db-mobile-bottom-sheet-handle");
  if (isSheet && !existingHandle) {
    const handle = panel.ownerDocument.createElement("div");
    handle.className = "db-mobile-bottom-sheet-handle";
    handle.setAttribute("aria-hidden", "true");
    panel.prepend(handle);
    return;
  }
  if (!isSheet) existingHandle?.remove();
}

// ───────────────────────────────────────────────────────────────────
// 2. BOTTOM SHEET GESTURE
// ───────────────────────────────────────────────────────────────────

/**
 * Wire "drag the grab handle down to dismiss" onto a phone bottom sheet.
 *
 * Only attach this once the panel has actually been rendered as a sheet (it
 * carries `db-mobile-bottom-sheet` and a `db-mobile-bottom-sheet-handle`);
 * the desktop anchored panel has no handle and must never reach here.
 * Returns a disposer that removes the listeners and clears any drag offset.
 */
export function attachSheetDragToDismiss(panel: HTMLElement, handle: HTMLElement, close: () => void): () => void {
  const DISMISS_PX = 96;
  let startY = 0;
  let pointerId: number | undefined;

  const reset = (): void => {
    panel.setCssProps({ transition: "", transform: "" });
  };
  const distance = (event: PointerEvent): number => Math.max(0, event.clientY - startY);
  const onDown = (event: PointerEvent): void => {
    if (event.button !== 0 || pointerId !== undefined) return;
    pointerId = event.pointerId;
    startY = event.clientY;
    panel.setCssProps({ transition: "none" });
    handle.setPointerCapture?.(event.pointerId);
  };
  const onMove = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    const dy = distance(event);
    panel.setCssProps({ transform: dy > 0 ? `translateY(${dy}px)` : "" });
  };
  const onUp = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    const dy = distance(event);
    pointerId = undefined;
    if (dy >= DISMISS_PX) {
      close();
      return;
    }
    reset();
  };

  handle.addEventListener("pointerdown", onDown);
  handle.addEventListener("pointermove", onMove);
  handle.addEventListener("pointerup", onUp);
  handle.addEventListener("pointercancel", onUp);
  return () => {
    handle.removeEventListener("pointerdown", onDown);
    handle.removeEventListener("pointermove", onMove);
    handle.removeEventListener("pointerup", onUp);
    handle.removeEventListener("pointercancel", onUp);
    reset();
  };
}
