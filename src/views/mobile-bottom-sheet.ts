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

export interface SheetChromeOptions {
  /**
   * Let the backdrop take the tap instead of passing it through to the app underneath.
   *
   * The backdrop is inert by default because the panels that introduced it own no outside-press
   * dismissal — making it solid there would leave them with no way to close. A surface that DOES
   * dismiss on an outside press wants the opposite: inert, the tap reaches the table beneath and
   * edits a cell on the way out, so dismissing a menu also does something the user did not ask for.
   */
  scrimCapturesPointer?: boolean;
}

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
export function applySheetChrome(
  panel: HTMLElement,
  isSheet: boolean,
  options: SheetChromeOptions = {},
): void {
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
  setSheetMount(panel, isSheet, options);
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
function setSheetMount(panel: HTMLElement, isSheet: boolean, options: SheetChromeOptions = {}): void {
  const doc = panel.ownerDocument;
  const remembered = originalMount.get(panel);

  if (isSheet) {
    setScrim(doc, true, options.scrimCapturesPointer);
    // A surface built on the body is already where a sheet has to be, so there is nothing to move
    // and nothing to remember. It still needs the backdrop, which is why that is settled above
    // rather than inside the move: an owned menu mounts itself on the body, and returning here
    // before the backdrop existed left it dimming nothing and leaked the node on the next open.
    if (panel.parentElement === doc.body) {
      panel.setCssProps({ "--db-mobile-sheet-bottom": "0px" });
      return;
    }
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
    // The sheet covers the navbar rather than sitting above it. The positioner writes this variable
    // in its anchored branch to hold a popover clear of the navbar, which is right for a popover
    // and wrong for a sheet, so the sheet states its own value rather than inheriting that one.
    panel.setCssProps({ "--db-mobile-sheet-bottom": "0px" });
    doc.body.appendChild(panel);
    return;
  }

  setScrim(doc, false, false);
  if (!remembered) {
    panel.style.removeProperty("--db-mobile-sheet-bottom");
    return;
  }
  originalMount.delete(panel);
  panel.removeClass("db-surface");
  panel.removeClass("note-database-container");
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

/**
 * Create or remove the dimmed backdrop that sits behind every open sheet.
 *
 * A sibling of the sheet on the body, not a pseudo-element. It used to be `::before` with
 * `z-index: -1`, which cannot paint behind its own host once that host establishes a stacking
 * context — and this one does, twice over, from an isolation property and from the transform its
 * entrance animation applies. The result was a sheet rendered at 58% grey instead of a white sheet
 * over a dimmed app: the backdrop tinted the surface it was supposed to sit behind.
 *
 * One backdrop is shared by however many sheets are open, so it is only taken away once the last
 * one has gone. Removing it with the first close left the remaining sheet floating on an undimmed
 * app, which reads as a surface that has lost its modality rather than as a missing rectangle.
 *
 * Whether it takes the tap is the caller's to declare, because the two kinds of sheet want opposite
 * answers and the stylesheet can only state one. Inert is the default and the safer of the two: a
 * surface with no outside-press dismissal would otherwise have no way to close at all.
 */
function setScrim(doc: Document, wanted: boolean, capturesPointer: boolean | undefined): void {
  const existing = doc.body.querySelector<HTMLElement>(".db-mobile-sheet-scrim");
  if (wanted) {
    const scrim = existing ?? doc.createElement("div");
    if (!existing) {
      scrim.className = "db-mobile-sheet-scrim";
      scrim.setAttribute("aria-hidden", "true");
      doc.body.appendChild(scrim);
    }
    // Opt out, not opt in: the stylesheet makes the backdrop modal and a producer that needs a
    // permeable one says so. The previous default let every sheet leak presses to the view behind.
    scrim.style.pointerEvents = capturesPointer === false ? "none" : "";
    return;
  }
  if (doc.body.querySelector(".db-mobile-bottom-sheet")) return;
  existing?.remove();
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
 *
 * The listeners live on the PANEL, not on the grab bar, and that is the whole
 * reason this gesture survives. The bar is a child of the panel, and the panel's
 * own content render empties itself — so every view re-render replaced the node
 * these listeners were bound to and the drag went dead with it, silently, while
 * still looking correctly wired in the source. A sheet that had been open long
 * enough for one metadata resolve could no longer be dragged at all, which is
 * what "it barely works" describes. The panel outlives every rebuild, so binding
 * there outlives them too.
 *
 * The bar still decides where the gesture may START: the press has to land on
 * the current handle, which is what the full-width band hit-tests as. That is
 * resolved at pointerdown rather than captured here, because after a rebuild the
 * handle passed in is a detached node that no press can ever match again.
 */
export function attachSheetDragToDismiss(panel: HTMLElement, handle: HTMLElement, close: () => void): () => void {
  const DISMISS_PX = 96;
  let startY = 0;
  let pointerId: number | undefined;

  const reset = (): void => {
    panel.setCssProps({ transition: "", transform: "" });
  };
  const grabTarget = (): HTMLElement =>
    panel.querySelector<HTMLElement>(".db-mobile-bottom-sheet-handle") ?? handle;
  const distance = (event: PointerEvent): number => Math.max(0, event.clientY - startY);
  const onDown = (event: PointerEvent): void => {
    if (event.button !== 0 || pointerId !== undefined) return;
    if (event.target !== grabTarget()) return;
    pointerId = event.pointerId;
    startY = event.clientY;
    panel.setCssProps({ transition: "none" });
    panel.setPointerCapture?.(event.pointerId);
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

  panel.addEventListener("pointerdown", onDown);
  panel.addEventListener("pointermove", onMove);
  panel.addEventListener("pointerup", onUp);
  panel.addEventListener("pointercancel", onUp);
  return () => {
    panel.removeEventListener("pointerdown", onDown);
    panel.removeEventListener("pointermove", onMove);
    panel.removeEventListener("pointerup", onUp);
    panel.removeEventListener("pointercancel", onUp);
    reset();
  };
}
