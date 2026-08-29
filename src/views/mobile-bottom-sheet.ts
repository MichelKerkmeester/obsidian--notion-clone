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
  // The portal is back on, and it is the only mechanism that works.
  //
  // Obsidian's workspace leaf carries `contain: strict`, which makes it the containing block for
  // fixed-position descendants and clips them. A sheet inside it resolves `bottom: 0` against the
  // leaf, not the screen, and lands 72 to 80px short of the bottom depending on whether the host's
  // navigation bar is floating. No z-index escapes that; two independent reviews measured a sheet
  // losing the hit test at the maximum integer.
  //
  // The first attempt at this shipped broken because the sheet left the subtree its rules are
  // written against. It now carries that root with it, so the rules still match.
  setSheetMount(panel, isSheet);
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
// 1b. THE MOUNT POINT
// ───────────────────────────────────────────────────────────────────

/** Where a panel lived before it became a sheet, so it can be put back. */
const originalMount = new WeakMap<HTMLElement, { parent: HTMLElement; before: ChildNode | null }>();

/**
 * Move a sheet to the document body, and put it back when it stops being one.
 *
 * A sheet must cover Obsidian's bottom navigation bar, and no z-index achieves that. The navbar is
 * a fixed child of the app container; a panel inside the plugin's own container is in a different
 * part of the tree, and hit-testing a point over the navbar returns the navbar even at z-index
 * 9999. Move the same node to the body and the point returns the sheet. It is a question of where
 * the node is, not what number it carries.
 *
 * The panel is marked as a surface on the way out, because leaving the container also leaves the
 * subtree where the design tokens are declared — without that mark a sheet inherits none of the
 * scale and silently falls back to whatever the host theme supplies.
 *
 * The original position is remembered rather than assumed. Appending it back to the container on
 * close would reorder it against its siblings, and the sheet's owner may well be relying on that
 * order for anything from focus sequence to a nth-child rule.
 */
function setSheetMount(panel: HTMLElement, isSheet: boolean): void {
  const doc = panel.ownerDocument;
  const remembered = originalMount.get(panel);

  if (isSheet) {
    if (panel.parentElement === doc.body) return;
    if (panel.parentElement) {
      originalMount.set(panel, { parent: panel.parentElement, before: panel.nextSibling });
    }
    // Carry the plugin's own scope with it, not just the tokens.
    //
    // Most of this plugin's rules are written `.note-database-container .db-thing`, so a surface
    // that leaves the container stops matching them and renders as unstyled text on top of the
    // view — which is exactly what shipped when this portal was added with only the token class.
    // Marking the portalled root as a container root as well means every ancestor-scoped rule
    // still applies, because the sheet now IS the ancestor those rules name.
    //
    // The right long-term answer is to re-key those rules to the surface itself so no stand-in is
    // needed. Until that lands, this keeps the portal from costing the sheet its appearance.
    panel.addClass("db-surface");
    panel.addClass("note-database-container");
    // The dimmed backdrop is a sibling, not a pseudo-element on the sheet.
    //
    // It used to be `::before` with `z-index: -1`, which cannot paint behind its own host once that
    // host establishes a stacking context — and this one does, twice over, from an isolation
    // property and from the transform its entrance animation applies. The result was a sheet
    // rendered at 58% grey instead of a white sheet over a dimmed app: the scrim tinted the surface
    // it was supposed to sit behind.
    if (!doc.body.querySelector(".db-mobile-sheet-scrim")) {
      const scrim = doc.createElement("div");
      scrim.className = "db-mobile-sheet-scrim";
      scrim.setAttribute("aria-hidden", "true");
      doc.body.appendChild(scrim);
    }
    // The sheet covers the navbar rather than sitting above it. The positioner writes this variable
    // in its anchored branch to hold a popover clear of the navbar, which is right for a popover
    // and wrong for a sheet, so the sheet states its own value rather than inheriting that one.
    panel.setCssProps({ "--db-mobile-sheet-bottom": "0px" });
    doc.body.appendChild(panel);
    return;
  }

  if (!remembered) return;
  originalMount.delete(panel);
  panel.removeClass("db-surface");
  panel.removeClass("note-database-container");
  doc.body.querySelector(".db-mobile-sheet-scrim")?.remove();
  panel.style.removeProperty("--db-mobile-sheet-bottom");
  // A view rebuild can destroy the parent while the sheet is open. Putting the node back into a
  // detached tree would hide it with no way to reach it, so it is removed instead — a closed
  // surface is recoverable, an invisible one is not.
  if (!remembered.parent.isConnected) {
    panel.remove();
    return;
  }
  remembered.parent.insertBefore(panel, remembered.before);
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
