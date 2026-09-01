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
  // A grab bar is drawn by the GESTURE, never by the chrome — so one cannot exist unwired.
  //
  // This used to draw the bar here, which meant a producer got the affordance for free and had to
  // remember to wire it. Sixteen modal sheets did not, and a bar that says the sheet can be pulled
  // down and then ignores the thumb reads as a frozen app rather than a missing feature. Moving
  // creation into `attachSheetDragToDismiss` makes the unwired bar unrepresentable instead of
  // merely discouraged.
  //
  // The one case that still creates it here is a REBUILD: a panel that empties itself destroys the
  // bar while the gesture — bound to the panel, not the bar — survives. Re-asserting chrome then
  // legitimately restores it, and the `hasSheetDrag` guard is what distinguishes that from a
  // producer that never wired anything.
  if (isSheet && !existingHandle && activeSheetDrag.has(panel)) {
    createSheetHandle(panel);
    return;
  }
  if (!isSheet) existingHandle?.remove();
}

/** The bar itself. One place, so its shape and its aria treatment cannot drift between callers. */
function createSheetHandle(panel: HTMLElement): HTMLElement {
  const handle = panel.ownerDocument.createElement("div");
  handle.className = "db-mobile-bottom-sheet-handle";
  handle.setAttribute("aria-hidden", "true");
  panel.prepend(handle);
  return handle;
}

// ───────────────────────────────────────────────────────────────────
// 1a. THE ENTRANCE
// ───────────────────────────────────────────────────────────────────

/**
 * Start the sheet's rise from the bottom edge.
 *
 * Both callers used to add the start class and then flip to the end class inside a single
 * `requestAnimationFrame`, and on that path the entrance never ran at all — measured, across the
 * whole window: identity transform at 12ms and no running animation at any point. A rAF callback
 * fires BEFORE the frame's style recalculation, so a node created, inserted and flipped within it
 * gets exactly one style resolution, already carrying the end state. A transition needs two
 * different computed values across two resolutions; with only one there is nothing to interpolate
 * and the surface simply appears. That is the whole of "the sheet appears instantly" — not the
 * duration, and not the distance. Retuning either without this would have changed nothing.
 *
 * Reading a layout property commits the start state synchronously, so the flip that follows is the
 * second resolution. A second animation frame would also work and is the more familiar idiom, but
 * it postpones the sheet by a frame — and the drag gesture binds on this same surface, so a frame
 * spent waiting is a frame in which a thumb already on the glass is being ignored.
 */
export function playSheetEntrance(panel: HTMLElement): void {
  if (panel.hasClass("is-visible")) return;
  panel.addClass("db-overlay-enter");
  panel.getBoundingClientRect();
  panel.addClass("is-visible");
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
    // Registered before either branch returns. A surface that already lives on the body takes an
    // early exit below, and registering only after the move would leave exactly those sheets
    // unknown to the watcher — so the backdrop could be taken down while one was still open.
    sheetsFor(doc).add(panel);
    watchForSheetRemoval(doc);
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

  sheetsFor(doc).delete(panel);
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
/**
 * The sheets currently on the body, and the watcher that notices when one leaves.
 *
 * Taking the chrome down is a second call the mounting producer has to remember to make, and most
 * of them never do — they remove their panel and stop. The backdrop is a body SIBLING rather than
 * a child, so it survives that, and what is left is a full-screen element at `inset: 0` with
 * `pointer-events: auto` over the whole app. The person using it cannot click anything and calls
 * it a freeze.
 *
 * Rather than ask every producer to remember, the backdrop is made a property of whether any sheet
 * is still on the body. A removal the watcher sees prunes the set, and the last one out takes the
 * backdrop with it — so a caller that only calls `.remove()` is correct by construction rather
 * than by discipline.
 *
 * Per document, because Obsidian opens surfaces in detached windows and a watcher on the wrong
 * body would never fire. Disconnected as soon as the last sheet goes, so an idle document carries
 * no observer.
 */
const liveSheets = new WeakMap<Document, Set<HTMLElement>>();
const sheetWatchers = new WeakMap<Document, MutationObserver>();

function sheetsFor(doc: Document): Set<HTMLElement> {
  const existing = liveSheets.get(doc);
  if (existing) return existing;
  const created = new Set<HTMLElement>();
  liveSheets.set(doc, created);
  return created;
}

/** Drop anything no longer in the document, and report whether any sheet remains. */
function pruneSheets(doc: Document): boolean {
  const sheets = sheetsFor(doc);
  for (const sheet of Array.from(sheets)) {
    if (!sheet.isConnected) sheets.delete(sheet);
  }
  return sheets.size > 0;
}

function stopWatching(doc: Document): void {
  sheetWatchers.get(doc)?.disconnect();
  sheetWatchers.delete(doc);
}

function watchForSheetRemoval(doc: Document): void {
  if (sheetWatchers.has(doc)) return;
  if (typeof MutationObserver === "undefined") return;
  const observer = new MutationObserver(() => {
    if (pruneSheets(doc)) return;
    // The last sheet has gone, however it went. Remove the backdrop and stop watching:
    // an idle document should not carry an observer waiting for a sheet that may never open.
    doc.body.querySelector<HTMLElement>(".db-mobile-sheet-scrim")?.remove();
    stopWatching(doc);
  });
  observer.observe(doc.body, { childList: true, subtree: true });
  sheetWatchers.set(doc, observer);
}

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
  // Only a sheet still IN the document holds the backdrop up. Testing the DOM directly counted a
  // panel that had been detached without taking its chrome down, so one producer's leak pinned the
  // backdrop permanently and disabled cleanup for every producer after it.
  if (pruneSheets(doc)) return;
  existing?.remove();
  stopWatching(doc);
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
 *
 * One gesture per panel, and the last caller wins. The positioner now wires a
 * generic dismissal onto every sheet it presents, so a surface that also wires
 * its own — the record panel does, because its close does more than take the
 * overlay down — would otherwise carry two, and one drag would answer with two
 * closes. Last wins rather than first because the specific close is always the
 * one registered after the generic one, and it is the one that should run.
 */
const activeSheetDrag = new WeakMap<HTMLElement, () => void>();

/**
 * Whether this panel currently has a dismissal gesture attached.
 *
 * Exists so the invariant in D4 — never draw a grab bar without wiring it — can be MEASURED rather
 * than eyeballed. Nothing in the product reads this; a bar and its gesture are otherwise invisible
 * to each other from the outside, so without it a check could only grep for the call and a grep
 * cannot tell a call that runs from one behind a condition that is never true.
 */
export function hasSheetDrag(panel: HTMLElement): boolean {
  return activeSheetDrag.has(panel);
}

/**
 * Velocity thresholds for a flick, measured on real pointer input rather than estimated.
 *
 * A deliberate slow drag runs about 0.08 px/ms, a genuine flick about 1.18, and a brisk 96px-scale
 * drag delivered at frame pace lands near 0.5. The line at 0.8 leaves the flick clearly above it and
 * the brisk drag clearly below, so a gesture aiming for the distance threshold that falls a little
 * short still springs back instead of closing.
 */
export const FLICK_PX_PER_MS = 0.8;
/**
 * A floor on distance, which keeps the velocity path off a tap: a press and release in one spot can
 * produce a large ratio over a tiny interval, which without this reads as an infinitely fast flick.
 */
export const FLICK_MIN_PX = 24;
/** A finger resting before it lifts is not flicking, however fast it arrived. */
export const STALE_SAMPLE_MS = 100;

/**
 * Does this release dismiss on velocity alone?
 *
 * Lifted out of the pointerup handler so a check can ask the decision instead of trying to produce
 * it. A harness driving a real pointer cannot control how fast its own events arrive: the placement
 * and sheet-rebuild lanes drove a 40px gesture "as fast as possible" and got roughly 2 px/ms on a
 * quiet machine and under 0.8 on a loaded one — so the same tree reported a working flick as broken
 * depending on what else was running. That is a value the harness supplies, which is the shape this
 * program has repaired three times elsewhere.
 *
 * The distance path is not affected and stays driven by a real pointer: 120px is 120px however
 * slowly it arrives.
 */
export function shouldFlickDismiss(
  distancePx: number,
  velocityPxPerMs: number,
  msSinceLastSample: number,
): boolean {
  if (msSinceLastSample > STALE_SAMPLE_MS) return false;
  return distancePx >= FLICK_MIN_PX && velocityPxPerMs >= FLICK_PX_PER_MS;
}

export function attachSheetDragToDismiss(panel: HTMLElement, close: () => void): () => void {
  activeSheetDrag.get(panel)?.();
  // Drawn here, because this is the only place that can promise it does something.
  const handle = panel.querySelector<HTMLElement>(".db-mobile-bottom-sheet-handle") ?? createSheetHandle(panel);

  const DISMISS_PX = 96;
  // A flick dismisses too, and these numbers are measured rather than chosen.
  //
  // Distance alone meant the sheet could only be closed by dragging it most of the way down — the
  // slow, deliberate gesture — while the fast short pull every phone user already has did nothing.
  // The operator reported that as the drag being unreliable, because whether it worked depended on
  // a distance they were not thinking about.
  //
  // The threshold sits where it does because the speeds were measured on real pointer input, not
  // estimated: a deliberate slow drag runs about 0.08 px/ms, a genuine flick about 1.18, and a
  // brisk 96px-scale drag delivered at frame pace lands near 0.5. Putting the line at 0.8 leaves
  // the flick clearly above it and the brisk drag clearly below, so a gesture that was aiming for
  // the distance threshold and fell a little short still springs back instead of closing.
  //
  // FLICK_MIN_PX keeps the velocity path off a tap: a press and release in one spot can produce a
  // large ratio over a tiny interval, which without a floor reads as an infinitely fast flick.

  let startY = 0;
  let pointerId: number | undefined;
  // Velocity is carried from the MOVE stream, never measured against the release. A pointerup
  // arrives at the position the last move already reported, so a velocity computed across it is
  // almost always exactly zero — the flick would read as a dead stop and could never fire.
  let lastY = 0;
  let lastAt = 0;
  let lastVelocity = 0;

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
    lastY = event.clientY;
    lastAt = event.timeStamp;
    lastVelocity = 0;
    panel.setCssProps({ transition: "none" });
    panel.setPointerCapture?.(event.pointerId);
  };
  const onMove = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    const dy = distance(event);
    panel.setCssProps({ transform: dy > 0 ? `translateY(${dy}px)` : "" });
    const elapsed = event.timeStamp - lastAt;
    // Only over a real interval. Two moves in the same millisecond divide into infinity and would
    // report a flick on a gesture that has barely moved — which is what synthetic events look like.
    if (elapsed > 0) lastVelocity = (event.clientY - lastY) / elapsed;
    lastY = event.clientY;
    lastAt = event.timeStamp;
  };
  const onUp = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    const dy = distance(event);
    pointerId = undefined;
    // A finger resting before it lifts is not flicking, however fast it arrived.
    const flicked = shouldFlickDismiss(dy, lastVelocity, event.timeStamp - lastAt);
    if (dy >= DISMISS_PX || flicked) {
      close();
      return;
    }
    reset();
  };

  panel.addEventListener("pointerdown", onDown);
  panel.addEventListener("pointermove", onMove);
  panel.addEventListener("pointerup", onUp);
  panel.addEventListener("pointercancel", onUp);
  const release = () => {
    panel.removeEventListener("pointerdown", onDown);
    panel.removeEventListener("pointermove", onMove);
    panel.removeEventListener("pointerup", onUp);
    panel.removeEventListener("pointercancel", onUp);
    if (activeSheetDrag.get(panel) === release) activeSheetDrag.delete(panel);
    reset();
  };
  activeSheetDrag.set(panel, release);
  return release;
}
