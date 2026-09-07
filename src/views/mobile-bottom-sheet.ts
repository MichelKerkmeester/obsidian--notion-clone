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
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon, setTooltip } from "obsidian";
import { t } from "../i18n";
import { isElement } from "./dom-guards";
import { overlayStack, type OverlayCloseReason } from "./overlay-stack";
import { beginSheetGeneration, isSheetTraceEnabled, traceSheet } from "./sheet-trace";

// ───────────────────────────────────────────────────────────────────
// 2. SHEET CHROME
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
  /** Close callback used by sheets that do not install the popover adapter. */
  close?(reason: OverlayCloseReason): void;
  /** Whether the shared stack may route outside presses to this sheet. */
  closeOnOutsidePointerDown?: boolean;
  /** Whether the shared stack may route Escape to this sheet. */
  closeOnEscape?: boolean;
  /**
   * A third, DECLARED frame shape beside the floating/flush split `classifySheetFrameShape`
   * infers from height: a small, margined, centred card. Never derived from a
   * measurement — a surface that wants the card says so up front, and keeps it regardless of
   * how its own content resizes.
   */
  frameRole?: "card";
  /**
   * Accept a would-be third stacked sheet as a replacement of this sheet's own content.
   *
   * Threaded straight through to `overlayStack.register` — see its own doc for what sets this
   * and why a surface that never does is exactly the surface the depth cap does not govern.
   */
  replace?(childPanel: HTMLElement): boolean;
  /**
   * Which of the two measured phone frame shapes this surface is, declared rather than left to
   * the `ResizeObserver` classifier's own midpoint guess (`design-trueup.md` C10).
   *
   * `floating` narrows the sheet by the phone insets and caps its height for a short, form-like
   * surface; `flush` spans the viewport for a near-full-height picker or search surface. Omitted,
   * the classifier stays the documented fallback for a surface that has not declared one — nothing
   * about an undeclared surface's behaviour changes.
   */
  heightRole?: "floating" | "flush";
  /**
   * Present as a `menu`-role, handle-less anchored card rather than an ordinary sheet
   * (`design-trueup.md` row 26): no grab handle, and the shared backdrop dims to the measured
   * menu band instead of the sheet band. The 44px close is unaffected either way.
   */
  menuCard?: boolean;
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
): boolean {
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
  //
  // The class carries every one of the sheet's own layout rules — fixed position, the height cap,
  // the frame-shape classifier's own measurement — so it has to be on the element before
  // `setSheetMount` ever measures anything, exactly as it was before this function had a reason
  // to take it back off again. A panel the depth cap absorbs into its parent's own body
  // (`setSheetMount` returning `false`) never becomes an independent sheet, so that one case
  // reverses the class rather than never having applied it.
  panel.toggleClass("db-mobile-bottom-sheet", isSheet);
  const stayedIndependent = setSheetMount(panel, isSheet, options);
  if (isSheet && !stayedIndependent) {
    panel.removeClass("db-mobile-bottom-sheet");
    return false;
  }
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
  // A `menu`-role card never grows a handle back, rebuild or not (`design-trueup.md` row 26):
  // it advertises a tap, not a drag, and re-asserting chrome on it must not undo that.
  if (isSheet && !existingHandle && activeSheetDrag.has(panel) && !panel.hasClass("db-mobile-menu-card")) {
    createSheetHandle(panel);
    return true;
  }
  if (!isSheet) existingHandle?.remove();
  return true;
}

const SHEET_SURFACE_ID_ATTR = "data-db-sheet-surface-id";
let nextSheetSurfaceId = 0;

function getSheetSurfaceId(panel: HTMLElement): string {
  const existing = panel.getAttribute(SHEET_SURFACE_ID_ATTR);
  if (existing) return existing;
  const id = panel.id ? `db-sheet-${panel.id}` : `db-sheet-surface-${++nextSheetSurfaceId}`;
  panel.setAttribute(SHEET_SURFACE_ID_ATTR, id);
  return id;
}

function invokeSheetClose(panel: HTMLElement): void {
  const closeButton = panel.querySelector<HTMLElement>(".db-sheet-close, .db-cell-edit-close");
  closeButton?.click();
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
// 2a. THE HEADER
// ───────────────────────────────────────────────────────────────────

export interface SheetHeaderOptions {
  /** The sheet's title, rendered into the header's title slot. */
  title: string;
  /**
   * Dismissal fallback, used only when the sheet is not registered with the overlay stack.
   *
   * The close button asks the stack first because the stack owns dismissal: a registered sheet
   * closes through the same path the backdrop and Escape use, and a second, parallel close would
   * fight it. An unregistered sheet — a mounted surface in a harness, or a producer that never
   * wired auto-close — needs this to do anything at all.
   */
  onClose?: () => void;
  /**
   * Build right-side header controls, before the close button is appended.
   *
   * The close button is always the last element in the header so it sits at the far edge
   * whatever the surface adds beside the title.
   */
  beforeClose?(header: HTMLElement): void;
}

export interface SheetHeaderHandle {
  header: HTMLElement;
  titleEl: HTMLElement;
  closeButton: HTMLButtonElement;
}

/**
 * The shared sheet header: title, any surface-owned right-side controls, and the close button.
 *
 * One builder so every sheet carries the same header shape and the same close affordance — the
 * affordance that was missing or hand-built per surface is exactly what the reports named. The
 * close's 44px target is a stylesheet fact and the touch-target ratchet's to enforce; this
 * builder only guarantees the control exists and dismisses through the shared path.
 */
export function createSheetHeader(panel: HTMLElement, options: SheetHeaderOptions): SheetHeaderHandle {
  const header = panel.createDiv({ cls: "db-panel-header" });
  const titleEl = header.createSpan({ cls: "db-panel-title", text: options.title });
  options.beforeClose?.(header);
  const closeButton = header.createEl("button", {
    cls: "db-sheet-close",
    attr: { type: "button", "aria-label": t("common.close") },
  });
  setIcon(closeButton, "x");
  setTooltip(closeButton, t("common.close"), { delay: 100 });
  closeButton.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!overlayStack.dismissPanel(panel, "programmatic")) options.onClose?.();
  };
  return { header, titleEl, closeButton };
}

// ───────────────────────────────────────────────────────────────────
// 2b. THE KEYBOARD INSET VARIABLE
// ───────────────────────────────────────────────────────────────────

/**
 * The variable the placement loop publishes the keyboard figure to, per open sheet.
 *
 * One number per sheet, written on the sheet's own node, so the sheet's CSS and the grammar
 * contract read a single published value instead of each computing the keyboard itself. The
 * value is the same figure the host and the visual viewport drive; publishing it on the sheet
 * does not add a second source of truth, only a second reader.
 */
export const SHEET_KEYBOARD_INSET_VAR = "--db-keyboard-inset";

// ───────────────────────────────────────────────────────────────────
// 2c. HOST MODALS
// ───────────────────────────────────────────────────────────────────

export interface SheetModalChromeOptions {
  title?: string;
  getTitle?(): string | undefined;
  closeOnOutsidePointerDown?: boolean;
  closeOnEscape?: boolean;
  /** Forwarded to `applySheetChrome` — see `SheetChromeOptions.frameRole`. */
  frameRole?: "card";
  /**
   * Build the header instead of this module's own two-slot builder, for a caller that owns a
   * richer header shape. Omit this and nothing changes: every existing caller gets exactly
   * the header it always did.
   */
  buildHeader?(panel: HTMLElement, title: string, onClose: () => void): SheetHeaderHandle;
  /** Accept a would-be third stacked sheet as a replacement of this modal's own content. */
  replace?(childPanel: HTMLElement): boolean;
  /** Which of the two measured phone frame shapes this surface is. See `SheetChromeOptions`. */
  heightRole?: "floating" | "flush";
  /** Present as a `menu`-role, handle-less anchored card. See `SheetChromeOptions`. */
  menuCard?: boolean;
}

/**
 * Present a host modal inside the shared sheet chrome, and take the chrome down again.
 *
 * Obsidian's own modal classes (Modal, FuzzySuggestModal) carry no plugin chrome, so a phone
 * user gets a centred dialog while every plugin surface beside it is a sheet. The modal element
 * is a normal element once Obsidian has opened it, so it can wear the sheet chrome like any
 * other surface — the same move the modal base class already makes for its own subclasses. The
 * host still owns the modal's contents and lifecycle; this only dresses the element.
 *
 * The returned teardown MUST run before Obsidian's own `close()` detaches the host's container —
 * the caller's `onClose` runs it ahead of `super.onClose()` for exactly that reason. `applySheetChrome`
 * is what the sheet variant needs: a modal wearing the chrome was portalled to `document.body` out
 * of the host's `containerEl`, so the host's own teardown no longer holds it, and skipping this call
 * strands the modal element on the body with the backdrop pinned behind it — `DbModal.onClose` hit
 * the identical failure and this mirrors that fix rather than reinventing it.
 */
export function attachSheetChromeToModal(
  modalEl: HTMLElement,
  isSheet: boolean,
  close: () => void,
  options: SheetModalChromeOptions = {},
): () => void {
  // The host's own chrome, captured before `applySheetChrome` moves `modalEl` out of it. Every
  // `Modal` carries a title element and a close button of its own (`titleEl`, and an unexposed
  // close button beside it) whether or not a subclass ever uses them, and the container that
  // wraps `modalEl` on the way in is left behind, empty, once the sheet portal takes `modalEl`
  // to the body — still on the body, still painting its own backdrop, over whatever the stack
  // dims. A CSS selector hiding these depends on guessing their exact nesting; finding the real
  // elements here and hiding them by reference does not.
  //
  // The container is only ever the host's own `.modal-container`. Not every caller is a modal:
  // the shell presents panels that live in the view tree, and their parent is somebody else's
  // element entirely — writing or clearing an inline `display` on that would reach outside this
  // function's subject and, on a parent that legitimately carries one, silently change a layout
  // this call knows nothing about.
  const hostParent = modalEl.parentElement;
  const nativeContainer = hostParent?.classList.contains("modal-container") ? hostParent : null;
  const nativeTitle = modalEl.querySelector<HTMLElement>(".modal-title");
  const nativeClose = modalEl.querySelector<HTMLElement>(".modal-close-button");
  const stayedIndependent = applySheetChrome(modalEl, isSheet, {
    close: isSheet ? () => close() : undefined,
    closeOnOutsidePointerDown: isSheet ? options.closeOnOutsidePointerDown ?? true : false,
    closeOnEscape: isSheet ? options.closeOnEscape ?? true : false,
    frameRole: isSheet ? options.frameRole : undefined,
    replace: isSheet ? options.replace : undefined,
    heightRole: isSheet ? options.heightRole : undefined,
    menuCard: isSheet ? options.menuCard : undefined,
  });
  // The depth cap absorbed this element into another shell's own body instead of letting it
  // present on its own — `attemptReplace` (surface-shell.ts) already hid whatever host container
  // it arrived in. Nothing below applies to an element that never became an independent sheet.
  const asSheet = isSheet && stayedIndependent;
  if (asSheet) {
    // Hidden, not removed: `applyPresentation` re-runs on a layout change (a rotation moving the
    // surface back across the touch boundary), and the desktop presentation that returns wants
    // its own close button and whatever title a subclass set back exactly as they were.
    nativeClose?.style.setProperty("display", "none");
    if (nativeTitle && !nativeTitle.textContent?.trim()) nativeTitle.style.setProperty("display", "none");
    nativeContainer?.style.setProperty("display", "none");
  } else if (!isSheet) {
    nativeClose?.style.removeProperty("display");
    nativeTitle?.style.removeProperty("display");
    nativeContainer?.style.removeProperty("display");
  }
  const releaseDrag = asSheet ? attachSheetDragToDismiss(modalEl, close) : undefined;
  let header: SheetHeaderHandle | undefined;
  if (asSheet) {
    // The one surviving scrape chain is `DbModal.getSheetTitle` (a heading scrape of its own),
    // reached through `options.getTitle` before this ever runs — every caller of this function
    // supplies one, all the way down to its own last-resort default, so a second heading scrape
    // here duplicated a fallback that already always answers rather than adding one of its own.
    const resolveTitle = (): string => options.getTitle?.()?.trim() || options.title?.trim() || t("menu.title");
    const buildHeader = options.buildHeader
      ?? ((panel: HTMLElement, title: string, onClose: () => void) => createSheetHeader(panel, { title, onClose }));
    header = buildHeader(modalEl, resolveTitle(), close);
    header.header.addClass("db-sheet-modal-header");
    let contentRoot = modalEl.querySelector<HTMLElement>(".note-database-modal");
    while (contentRoot?.parentElement && contentRoot.parentElement !== modalEl) {
      contentRoot = contentRoot.parentElement;
    }
    modalEl.insertBefore(header.header, contentRoot || modalEl.firstElementChild);
    // Modal subclasses populate their content after calling the base lifecycle, and their own
    // declared title can depend on state set up during that same open — a role picked in the
    // constructor, a record loaded async. Re-resolving on the next microtask still catches that
    // without needing a second, DOM-scraping source of truth to do it.
    void Promise.resolve().then(() => {
      if (!modalEl.isConnected || !header) return;
      header.titleEl.setText(resolveTitle());
      for (const heading of Array.from(modalEl.querySelectorAll<HTMLElement>(".note-database-modal h1, .note-database-modal h2, .note-database-modal h3"))) {
        if (!heading.closest(".db-sheet-modal-header")) heading.addClass("db-sheet-original-title");
      }
    });
  }
  return () => {
    releaseDrag?.();
    const releasedHeader = header;
    header = undefined;
    releasedHeader?.header.remove();
    modalEl.querySelectorAll<HTMLElement>(".db-sheet-original-title").forEach((heading) => heading.removeClass("db-sheet-original-title"));
    nativeClose?.style.removeProperty("display");
    nativeTitle?.style.removeProperty("display");
    nativeContainer?.style.removeProperty("display");
    applySheetChrome(modalEl, false);
  };
}

// ───────────────────────────────────────────────────────────────────
// 2d. THE FRAME SHAPE
// ───────────────────────────────────────────────────────────────────

// Anytype ships two phone sheet frames, not one. Every
// floating sheet the capture set measured put its top edge at >=299pt of an 874pt screen; every
// flush sheet at <=198pt. Nothing was captured in between, so the split below sits at the
// midpoint of that unobserved gap rather than inventing a boundary either capture set would
// contradict — a value pinned to either observed edge would misclassify the first surface whose
// natural height lands on the other side of it.
//
// Stated as a height ratio rather than the two pt figures directly, because a sheet's own
// natural height is measured against whatever viewport it is actually on, not against 874pt.
const FLOATING_HEIGHT_RATIO_MAX = ((1 - 299 / 874) + (1 - 198 / 874)) / 2;

// The shape this module toggles is also one of the shape's own inputs: floating narrows the sheet
// by two insets and caps its height differently, and a condition row sized for the flush width can
// wrap onto a second line at the narrower one — which changes the SAME rendered height this
// function reads next time `ResizeObserver` calls it. Measured directly on the filter sheet's
// `add-condition` scenario: classifying it floating narrows it, the row wraps, the taller wrapped
// height reads back above the cutoff, the very next observation classifies it flush again, flush
// widens it back, the row unwraps, and the shorter height reads below the cutoff once more — an
// oscillation with no settled state, each leg of it a real layout change a concurrent placement
// pass can land in the middle of. A single cutoff cannot both classify a genuinely tall surface
// and refuse to answer its own footprint; two cutoffs with a gap between them can, because leaving
// the sheet's CURRENT shape alone inside that gap is a legitimate third answer a plain `<=` never
// had. The gap is 3% of viewport height (≈25px on an 874pt screen) — wider than the wrap this
// leg measured (≈20px, one condition row's line-height) and narrower than the unobserved span
// between the two captured shapes described above, so it absorbs the feedback without blurring the
// boundary the captures actually drew.
const FLOATING_HYSTERESIS_RATIO = 0.03;

// How long the observer waits for its own wakes to stop before classifying.
const FRAME_SHAPE_DEBOUNCE_MS = 80;
const FLUSH_HEIGHT_RATIO_MIN = FLOATING_HEIGHT_RATIO_MAX + FLOATING_HYSTERESIS_RATIO;

const frameShapeObservers = new WeakMap<HTMLElement, { disconnect(): void }>();

/**
 * Surfaces whose height role was declared rather than left to this classifier.
 *
 * The classifier is the documented fallback (`design-trueup.md` C10) for a surface that never
 * declares one — a declared surface's shape is a fact about the surface, not a measurement of it,
 * so the `ResizeObserver` below must never overwrite it with a guess at its own midpoint.
 */
const declaredFrameShapes = new WeakSet<HTMLElement>();

// How many classifications are queued behind a debounce right now, and how many have run since
// this module loaded. Together they are the classifier's own settle signal: a reader that sees no
// queued work AND an unchanged classification count across two consecutive frames is looking at a
// sheet whose shape has stopped moving. A reader outside this module cannot derive that — the
// class it would watch is toggled in the MIDDLE of the sequence, not at the end of it, and the
// wake that the toggle itself provokes has not been delivered yet at that moment. Published
// rather than left private because the alternative every caller reaches for otherwise is a fixed
// sleep long enough to cover the worst host, which is a timing guess that goes quiet exactly when
// the machine is slow enough to need it.
let frameShapeQueued = 0;
let frameShapeClassifications = 0;

/** The classifier's settle signal: queued work outstanding, and classifications run so far. */
export function readSheetFrameShapeActivity(): { queued: number; classifications: number } {
  return { queued: frameShapeQueued, classifications: frameShapeClassifications };
}

/** Read the sheet's own rendered height against the viewport and toggle the floating class. */
function classifySheetFrameShape(panel: HTMLElement): void {
  frameShapeClassifications += 1;
  // The card is declared, never inferred: a surface that asked for it keeps it
  // regardless of its own rendered height, the same way the hysteresis gap below leaves a
  // sheet's CURRENT shape alone rather than answering from a height that shape itself produced.
  if (panel.hasClass("db-sheet-card")) return;
  const view = panel.ownerDocument.defaultView;
  const viewportHeight = view?.visualViewport?.height ?? view?.innerHeight;
  const height = panel.getBoundingClientRect().height;
  if (!viewportHeight || !height) return;
  const ratio = height / viewportHeight;
  if (ratio <= FLOATING_HEIGHT_RATIO_MAX) panel.addClass("db-sheet-floating");
  else if (ratio >= FLUSH_HEIGHT_RATIO_MIN) panel.removeClass("db-sheet-floating");
  // Between the two: neither cutoff is crossed, so the sheet keeps whatever shape it already had
  // rather than a `<=` deciding on a height this same class may have produced.
}

/**
 * Keep a sheet's frame shape current as its natural height changes.
 *
 * A one-off measurement at mount would freeze the sheet's shape at whatever height it opened
 * with — wrong the moment a filter panel goes from no rules to three, or a sub-page swaps in
 * taller content. `ResizeObserver` is the one signal that fires for both, without this module
 * having to know which of its many callers changed the content or why.
 */
function watchSheetFrameShape(panel: HTMLElement): void {
  if (declaredFrameShapes.has(panel)) return;
  if (frameShapeObservers.has(panel)) return;
  classifySheetFrameShape(panel);
  const ResizeObserverCtor = panel.ownerDocument.defaultView?.ResizeObserver;
  if (!ResizeObserverCtor) return;
  // Debounced rather than deferred by one frame: the class this toggles changes `max-height` and
  // the floating insets, which on a sheet whose content was up against that ceiling — or whose
  // narrower floating width wraps a row onto a second line — changes the panel's own rendered
  // height again, waking this same observer a second time. A single deferred frame still landed
  // inside that second wake on a loaded machine (two browser engines driving one host, `sheet-
  // rebuild.mjs`'s own toolbar-rebuild section), so a probe reading the panel between the first
  // and second classification measured a shape already mid-reclassification rather than settled —
  // and a control whose on-screen position just moved under a thumb already resting on it is
  // exactly the defect the shared grab band and this frame geometry both exist to prevent.
  // Debouncing collapses however many of these self-answering wakes a given layout produces into
  // the one classification taken after they stop, rather than acting on each in turn.
  let debounce: number | undefined;
  const observer = new ResizeObserverCtor(() => {
    const view = panel.ownerDocument.defaultView;
    if (!view) {
      classifySheetFrameShape(panel);
      return;
    }
    if (debounce !== undefined) view.clearTimeout(debounce);
    else frameShapeQueued += 1;
    debounce = view.setTimeout(() => {
      debounce = undefined;
      frameShapeQueued -= 1;
      classifySheetFrameShape(panel);
    }, FRAME_SHAPE_DEBOUNCE_MS);
  });
  observer.observe(panel);
  frameShapeObservers.set(panel, {
    disconnect: () => {
      observer.disconnect();
      // A pending debounce outlives `disconnect()` otherwise — the timer is not owned by the
      // observer, so stopping observation does not stop it, and it would still fire the
      // classifier on a panel this module has already stopped tracking as a sheet.
      const view = panel.ownerDocument.defaultView;
      if (debounce !== undefined) {
        view?.clearTimeout(debounce);
        debounce = undefined;
        frameShapeQueued -= 1;
      }
    },
  });
}

function unwatchSheetFrameShape(panel: HTMLElement): void {
  frameShapeObservers.get(panel)?.disconnect();
  frameShapeObservers.delete(panel);
  panel.removeClass("db-sheet-floating");
}

// ───────────────────────────────────────────────────────────────────
// 3. THE ENTRANCE
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

/**
 * Adopt a replacement node into a surface that is already on screen, so its entrance does not run
 * a second time.
 *
 * The entrance above is keyed to the NODE: a panel without `is-visible` has not entered, so it
 * plays. Four header panels rebuild by removing their node outright and building a fresh one — on
 * every add, remove, toggle, and on any background refresh that lands while they are open — and a
 * fresh node has never entered. So editing inside an open sheet replayed the whole rise from below
 * the fold. Measured on a 390x844 phone page: the top edge went 708 to 844 and back over ~280ms,
 * and a second tap aimed at the same button landed on whatever the slide had put under the thumb.
 * Five taps at one coordinate added two rules; with the transition disabled the same five taps
 * added five, which is what isolates this from anything else on the tree.
 *
 * Only the owner knows that a replacement is a rebuild rather than an opening, so the owner says
 * so. The classes are the pair `playSheetEntrance` finishes with rather than a third state of this
 * function's own: a rebuilt sheet then ends up in the same state an opened one is in, and a later
 * entrance on the same node is a no-op for the same reason it already was.
 */
export function carrySheetEntrance(panel: HTMLElement): void {
  panel.addClass("db-overlay-enter");
  panel.addClass("is-visible");
}

/**
 * Start a sheet's own descent, the mirror of `playSheetEntrance`.
 *
 * A caller that keeps the node mounted across the resulting delay sees the surface actually leave
 * rather than vanish; a caller whose host (Obsidian's own `Modal.close()`, for one) detaches the
 * node synchronously right after gets the same instant removal it always had; this toggle costs it
 * nothing either way. `db-overlay-exit` is a distinct class from the entrance's own start state so
 * the two transitions — sliding in, sliding out — never collide on the same selector.
 */
export function playSheetExit(panel: HTMLElement): void {
  panel.removeClass("is-visible");
  panel.addClass("db-overlay-exit");
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
function setSheetMount(panel: HTMLElement, isSheet: boolean, options: SheetChromeOptions = {}): boolean {
  const doc = panel.ownerDocument;
  const remembered = originalMount.get(panel);

  if (isSheet) {
    const alreadyRegistered = overlayStack.hasPanel(panel);
    // The trigger that opened this sheet, so dismissal has somewhere to hand focus back to.
    // Captured only on a genuinely new registration: on a rebuild the active element is already
    // inside the sheet itself, which would make the sheet its own anchor.
    const activeElement = doc.activeElement;
    const trigger = !alreadyRegistered && activeElement instanceof HTMLElement && !panel.contains(activeElement)
      ? activeElement
      : undefined;
    const registration = overlayStack.register({
      panel,
      id: getSheetSurfaceId(panel),
      isSheet: true,
      replace: options.replace,
      ...(trigger ? { anchor: trigger } : {}),
      ...(options.close || !alreadyRegistered ? { close: options.close || (() => invokeSheetClose(panel)) } : {}),
      ...(options.closeOnOutsidePointerDown !== undefined || !alreadyRegistered
        ? { closeOnOutsidePointerDown: options.closeOnOutsidePointerDown ?? false }
        : {}),
      ...(options.closeOnEscape !== undefined || !alreadyRegistered
        ? { closeOnEscape: options.closeOnEscape ?? false }
        : {}),
    });
    // The depth cap (`overlay-stack.ts`, `register`): a parent two deep absorbed this panel as a
    // replacement of its own content rather than letting it stack a third sheet. It must never
    // become an independent sheet — no portal, no scrim, no handle, no frame-shape watcher.
    if (registration.replaced) return false;
    // Registered before either branch returns. A surface that already lives on the body takes an
    // early exit below, and registering only after the move would leave exactly those sheets
    // unknown to the watcher — so the backdrop could be taken down while one was still open.
    sheetsFor(doc).add(panel);
    sheetPointerCapture.set(panel, options.scrimCapturesPointer);
    panel.toggleClass("db-mobile-menu-card", Boolean(options.menuCard));
    if (options.heightRole) {
      // A declared shape wins outright: it is the documented fallback the classifier itself now
      // defers to, so an undeclared surface's behaviour is unchanged and a declared one stops
      // waiting on a `ResizeObserver` guess of its own height.
      panel.toggleClass("db-sheet-floating", options.heightRole === "floating");
      declaredFrameShapes.add(panel);
    } else {
      declaredFrameShapes.delete(panel);
    }
    // A generation begins when a surface mounts, so a device trace reads as one sheet's whole life
    // rather than as a stream to be correlated by timestamp afterwards.
    if (isSheetTraceEnabled()) beginSheetGeneration(panel.className);
    panel.toggleClass("db-sheet-card", options.frameRole === "card");
    claimBottomDock(doc, "sheet", true);
    watchForSheetRemoval(doc);
    watchSheetFrameShape(panel);
    // A surface built on the body is already where a sheet has to be, so there is nothing to move
    // and nothing to remember. It still needs the backdrop, which is why that is settled above
    // rather than inside the move: an owned menu mounts itself on the body, and returning here
    // before the backdrop existed left it dimming nothing and leaked the node on the next open.
    //
    // It still needs the container-scoped rules the move branch below carries for exactly the
    // reason documented there — most of this plugin's rules read `.note-database-container .db-
    // thing`, and a self-mounted surface that skips this class never matches them. The owned menu
    // measured its own close button at 30x23 instead of the 44px `.note-database-container .db-
    // sheet-close` declares until this was added: the early return meant the header this phase
    // gave it never had the container ancestor that rule needs.
    //
    // `db-surface` is not added here: the owned menu already carries it from its own creation
    // call, and a placement check caught the duplicate the moment this class started adding
    // `note-database-container` beside it — both names sit in the same shared selector list, so
    // adding a class the surface already has changes nothing but reads, to that check, as a class
    // whose own removal changes nothing either. A future self-mounted consumer with no `db-surface`
    // of its own would need it re-added here; none exists today.
    if (panel.parentElement === doc.body) {
      panel.addClass("note-database-container");
      panel.setCssProps({ "--db-mobile-sheet-bottom": "0px" });
      syncSheetStack(doc);
      return true;
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
    syncSheetStack(doc);
    return true;
  }

  if (sheetsFor(doc).has(panel) && panel.isConnected) playSheetExit(panel);
  const wasSheet = sheetsFor(doc).delete(panel);
  sheetPointerCapture.delete(panel);
  declaredFrameShapes.delete(panel);
  unwatchSheetFrameShape(panel);
  if (wasSheet) overlayStack.unregisterPanel(panel, false);
  panel.style.removeProperty("--db-sheet-depth");
  panel.style.removeProperty("--db-sheet-z-index");
  panel.removeClass("is-stack-parent");
  panel.removeClass("db-sheet-card");
  panel.removeClass("db-mobile-menu-card");
  syncSheetStack(doc);
  // After the stack has been resynchronized, a document that still holds another sheet keeps the claim.
  claimBottomDock(doc, "sheet", sheetsFor(doc).size > 0);
  if (!remembered) {
    if (isSheetTraceEnabled()) traceSheet("sheet-unmount", panel.className);
    panel.style.removeProperty("--db-mobile-sheet-bottom");
    return true;
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
    return true;
  }
  remembered.parent.insertBefore(panel, remembered.before);
  return true;
}

/**
 * Did this press land inside a surface that is currently mounted as a phone sheet?
 *
 * Exists because the portal above breaks the one test every "was that press outside me?" check in
 * this plugin is written as. A view asks whether its own container contains the pressed node — and
 * a sheet is deliberately moved OUT of that container, onto the body, so the answer is no for a
 * thumb sitting on the sheet's own button. The owner then reads its own surface as somewhere else
 * entirely and dismisses.
 *
 * That single wrong answer presents as two separate complaints, which is why it survived three
 * fixes aimed at one of them: the dismissal runs on the `mousedown` a tap produces, so the surface
 * is already gone when the `click` arrives — the control does nothing AND the sheet closes, from
 * one cause. It is invisible on desktop for the only reason that matters here: a desktop panel is
 * never portalled, so containment still answers correctly there.
 *
 * The live registry, not the class, is what makes this an answer rather than a selector guess. A
 * node matches only while the sheet module is actually holding it as a mounted sheet, so chrome
 * left on a detached or demoted node cannot turn a genuine outside press into an inside one.
 */
export function isInsideOpenSheet(target: Node | null | undefined): boolean {
  if (!target) return false;
  const element = isElement(target) ? target : target.parentElement;
  const sheet = element?.closest<HTMLElement>(".db-mobile-bottom-sheet");
  if (!sheet) return false;
  return sheetsFor(sheet.ownerDocument).has(sheet);
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
const sheetPointerCapture = new WeakMap<HTMLElement, boolean | undefined>();
export const SHEET_STACK_CHANGE_EVENT = "db-sheet-stack-change";

// ───────────────────────────────────────────────────────────────────
// 1c. WHO OWNS THE BOTTOM EDGE
// ───────────────────────────────────────────────────────────────────

/**
 * The surfaces currently claiming the bottom of the screen, by name, per document.
 *
 * Three things dock there on a phone — a sheet, an inline cell editor, and the selection status bar
 * — and each of them used to decide on its own that it belonged. Nothing arbitrated, so whichever
 * painted last won: the bar stayed drawn under an open sheet, and an editor for a row in the bar's
 * band landed on top of it and clipped the count chip.
 *
 * A set of names rather than a boolean, because two claimants can overlap — an editor opened inside
 * a sheet is the ordinary case — and a boolean would have the first one to close release the edge
 * while the second is still using it.
 *
 * The claim is a class on the body rather than a callback, so the surfaces that yield do not have
 * to subscribe to the ones that claim, and a surface added later yields by matching a selector
 * instead of by remembering to register.
 */
const dockClaims = new WeakMap<Document, Set<string>>();

/** Take or release the bottom edge for a named owner. */
export function claimBottomDock(doc: Document, owner: string, claimed: boolean): void {
  const existing = dockClaims.get(doc);
  const claims = existing ?? new Set<string>();
  if (!existing) dockClaims.set(doc, claims);
  if (claimed) claims.add(owner);
  else claims.delete(owner);
  doc.body?.toggleClass("db-bottom-dock-taken", claims.size > 0);
}

function sheetsFor(doc: Document): Set<HTMLElement> {
  const existing = liveSheets.get(doc);
  if (existing) return existing;
  const created = new Set<HTMLElement>();
  liveSheets.set(doc, created);
  return created;
}

function surfacePanel(surface: { panel: HTMLElement; getPanel?: () => HTMLElement | null }): HTMLElement {
  return surface.getPanel?.() || surface.panel;
}

/** Drop anything no longer in the document and release its stack registration. */
function pruneSheets(doc: Document): Set<HTMLElement> {
  const sheets = sheetsFor(doc);
  for (const sheet of Array.from(sheets)) {
    if (sheet.isConnected) continue;
    sheets.delete(sheet);
    sheetPointerCapture.delete(sheet);
    overlayStack.unregisterPanel(sheet, false);
  }
  return sheets;
}

function stopWatching(doc: Document): void {
  sheetWatchers.get(doc)?.disconnect();
  sheetWatchers.delete(doc);
}

function watchForSheetRemoval(doc: Document): void {
  if (sheetWatchers.has(doc)) return;
  if (typeof MutationObserver === "undefined") return;
  const observer = new MutationObserver(() => {
    syncSheetStack(doc);
    if (sheetsFor(doc).size === 0) stopWatching(doc);
  });
  observer.observe(doc.body, { childList: true, subtree: true });
  sheetWatchers.set(doc, observer);
}

function baseSheetZIndex(doc: Document, reference?: HTMLElement): number {
  const declared = reference
    ? doc.defaultView?.getComputedStyle(reference).getPropertyValue("--db-layer-modal")
    : doc.defaultView?.getComputedStyle(doc.documentElement).getPropertyValue("--db-layer-modal");
  const parsed = Number.parseFloat(declared || "");
  return Number.isFinite(parsed) ? parsed : 1000;
}

function setScrim(doc: Document, wanted: boolean, capturesPointer: boolean | undefined): void {
  const scrims = Array.from(doc.body.querySelectorAll<HTMLElement>(".db-mobile-sheet-scrim"));
  const existing = scrims.shift();
  for (const duplicate of scrims) duplicate.remove();
  if (!wanted) {
    // Removed synchronously, not deferred for the exit animation to finish: teardown elsewhere in
    // this plugin — the caller's own close(), a host that detaches its container the instant it
    // takes a surface down — already assumes the backdrop is gone the moment a dismissal returns,
    // and a scrim left behind for a fade is exactly the frozen-app shape this module exists to
    // prevent. `--db-sheet-exit` stays a real, asserted token for whatever CAN afford to wait on
    // it (the sheet's own transform, which a caller that keeps the node mounted still sees).
    existing?.remove();
    stopWatching(doc);
    return;
  }
  const scrim = existing ?? doc.createElement("div");
  if (!existing) {
    scrim.className = "db-mobile-sheet-scrim";
    scrim.setAttribute("aria-hidden", "true");
  }
  // Opt out, not opt in: the stylesheet makes the backdrop modal and a producer that needs a
  // permeable one says so. The previous default let every sheet leak presses to the view behind.
  scrim.style.pointerEvents = capturesPointer === false ? "none" : "";
  const top = overlayStack.getTopSurfaceForDocument(doc, { sheetsOnly: true });
  const topPanel = top ? surfacePanel(top) : undefined;
  const depth = topPanel ? overlayStack.getDepth(topPanel) : 1;
  const topZ = baseSheetZIndex(doc, topPanel) + Math.max(0, depth - 1) * 2;
  scrim.style.setProperty("--db-sheet-scrim-z-index", String(topZ - 1));
  // A `menu`-role top dims its parent to the Notion-measured band (≈0.39), distinct from an
  // ordinary sheet's own band — the same shared backdrop, a different strength, rather than a
  // second element. `role="menu"` is `owned-menu.ts`'s own pre-existing ARIA attribute, read here
  // rather than duplicated as a second marker.
  const menuTop = Boolean(topPanel && (topPanel.hasClass("db-mobile-menu-card") || topPanel.getAttribute("role") === "menu"));
  // Three bands, one element: the page under a first sheet is dimmed hardest, a sheet that is
  // itself the parent of a stacked child holds the weaker, already-measured band (unchanged, so
  // the stacked composite is not regressed by the page band's own increase), and a `menu`-role
  // top uses its own Notion-measured band. `depth` here is the TOP surface's own depth — 1 means
  // the scrim sits directly on the page, 2+ means it sits on a sheet that is itself a parent.
  const scrimAlphaToken = menuTop
    ? "var(--db-sheet-scrim-alpha-menu)"
    : depth > 1
      ? "var(--db-sheet-scrim-alpha-stack)"
      : "var(--db-sheet-scrim-alpha-page)";
  scrim.style.setProperty("--db-sheet-scrim-alpha", scrimAlphaToken);
  // Move it only when it is not already there. The watcher below reacts to childList changes on the
  // body, and re-inserting a node at the position it already occupies still emits a mutation record,
  // so an unconditional move would wake the watcher, which would call back here, forever.
  if (topPanel?.parentElement === doc.body) {
    if (scrim.parentElement !== doc.body || scrim.nextElementSibling !== topPanel) doc.body.insertBefore(scrim, topPanel);
  } else if (!scrim.isConnected) doc.body.appendChild(scrim);
}

function syncSheetStack(doc: Document): void {
  const sheets = pruneSheets(doc);
  if (sheets.size === 0) {
    setScrim(doc, false, undefined);
    claimBottomDock(doc, "sheet", false);
    return;
  }

  const topSurface = overlayStack.getTopSurfaceForDocument(doc, { sheetsOnly: true });
  const top = topSurface ? surfacePanel(topSurface) : Array.from(sheets).at(-1);
  const baseZ = baseSheetZIndex(doc);
  for (const sheet of sheets) {
    const depth = overlayStack.getDepth(sheet);
    sheet.style.setProperty("--db-sheet-depth", String(depth));
    sheet.style.setProperty("--db-sheet-z-index", String(baseZ + Math.max(0, depth - 1) * 2));
    // Every surface under the top is pushed back, not only the one directly beneath it. A three-deep
    // chain leaves the outermost sheet visible past the edges of the two above it, so marking only
    // the middle one would leave a sheet on screen at full strength while the person is two levels
    // away from it.
    sheet.classList.toggle("is-stack-parent", sheet !== top);
    if (sheet !== top) {
      sheet.style.setProperty("--db-mobile-sheet-bottom", "0px");
      sheet.style.setProperty(SHEET_KEYBOARD_INSET_VAR, "0px");
    }
  }
  setScrim(doc, true, top ? sheetPointerCapture.get(top) : undefined);
  for (const sheet of sheets) sheet.dispatchEvent(new Event(SHEET_STACK_CHANGE_EVENT));
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
  // A cancelled gesture is not a release, and must never be judged as one.
  //
  // The system takes the pointer away mid-drag — a scroll wins the gesture, a call arrives, the
  // finger leaves the digitiser. The last move sample is still sitting there looking like a flick,
  // so sharing the release handler closes a sheet on a gesture the thumb never finished. Springing
  // back is the only honest answer to a gesture that was taken away.
  //
  // Clearing the pointer id here matters as much as not closing: a cancel that left it set would
  // make every later press fail the "already tracking" guard, which is a permanently dead grab
  // handle rather than an unwanted close.
  const onCancel = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    pointerId = undefined;
    reset();
  };
  panel.addEventListener("pointerdown", onDown);
  panel.addEventListener("pointermove", onMove);
  panel.addEventListener("pointerup", onUp);
  panel.addEventListener("pointercancel", onCancel);
  const release = () => {
    panel.removeEventListener("pointerdown", onDown);
    panel.removeEventListener("pointermove", onMove);
    panel.removeEventListener("pointerup", onUp);
    panel.removeEventListener("pointercancel", onCancel);
    if (activeSheetDrag.get(panel) === release) activeSheetDrag.delete(panel);
    reset();
  };
  activeSheetDrag.set(panel, release);
  return release;
}
