// ───────────────────────────────────────────────────────────────────
// MODULE:    popover-position
// COMPONENT: anchored viewport-aware positioning for toolbar popovers,
//            with a phone bottom-sheet mode and continuous re-placement
// ───────────────────────────────────────────────────────────────────
//
// `place()` re-measures and re-applies position/size on every call
// instead of computing once, because the panel's own content can change
// its natural height after open (e.g. a filtered list), and the anchor,
// viewport or scroll container can all move independently of each
// other. On phones the popover switches to a full-width bottom sheet
// instead of anchored placement, since a narrow anchored panel is
// unusable at that width. The pure math (`resolvePopoverHorizontalLeft`,
// `resolveAnchoredPopoverTop`, `clamp`) is split out from the DOM-facing
// code so it can be unit-tested without a browser.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { isHTMLElement } from "./dom-guards";
import { applySheetChrome, attachSheetDragToDismiss, playSheetEntrance } from "./mobile-bottom-sheet";
import { overlayStack } from "./overlay-stack";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface ToolbarPopoverPositionOptions {
  minWidth?: number;
  preferredWidth?: number;
  maxWidth?: number;
  margin?: number;
  gap?: number;
  align?: "left" | "center" | "right";
  preferredSide?: "left" | "right";
}

/**
 * Sizing for menu-shaped popovers: one compact column of rows.
 *
 * 292px is the width the column menu asks for explicitly, and that is the one menu surface in the
 * plugin that reads correctly today. Editors that genuinely need room — relation pickers, chart
 * toolbars — keep passing their own numbers.
 */
export const COMPACT_MENU_POPOVER: ToolbarPopoverPositionOptions = {
  minWidth: 220,
  preferredWidth: 292,
  maxWidth: 320,
};

/**
 * Sizing for panel-shaped popovers: a working surface the user adjusts before closing.
 *
 * Filter, Sort and Column Manager are these. All three passed no options at all and were handed
 * the raw default, so three panels that sit next to each other in the same toolbar arrived at their
 * width by accident rather than by asking for one — which is most of why they look unrelated.
 *
 * Wider than a menu because these hold labelled controls in rows, not a single column of items.
 *
 * The numbers are not chosen here. They are the panel role's declared width, and a first version
 * of this preset invented its own — below the role's floor and disagreeing with the contract that
 * names it. Two definitions of "how wide is a panel" in one repository is how thirteen call sites
 * came to hold nine different answers.
 */
export const PANEL_POPOVER: ToolbarPopoverPositionOptions = {
  minWidth: 292,
  preferredWidth: 360,
  maxWidth: 360,
};

// ───────────────────────────────────────────────────────────────────
// 3. STATE
// ───────────────────────────────────────────────────────────────────

const positionCleanups = new WeakMap<HTMLElement, () => void>();

/**
 * Release a panel's reposition loop and its viewport subscriptions, now rather than eventually.
 *
 * The loop tears itself down lazily: `schedule` notices a disconnected panel and cleans up. That is
 * correct and it is late. Nothing schedules on a close, so between a sheet closing and the next
 * resize or scroll the panel's `resize` and `scroll` handlers are still registered on
 * `window.visualViewport` — one pair per closed surface, all firing on the event that finally clears
 * them. It is bounded and self-healing, which is why it went unnoticed; it is still a subscription
 * outliving the thing it was for, and the inset those handlers write belongs to a panel that is gone.
 *
 * Idempotent, and safe on a panel that was never positioned.
 */
export function releasePopoverPosition(panel: HTMLElement): void {
  positionCleanups.get(panel)?.();
}

// ───────────────────────────────────────────────────────────────────
// 4. TOOLBAR POPOVER POSITIONING
// ───────────────────────────────────────────────────────────────────

export function positionToolbarPopover(
  panel: HTMLElement,
  anchorEl?: HTMLElement,
  options: ToolbarPopoverPositionOptions = {}
): void {
  // Only the anchored branch measures the anchor, so only the anchored branch may refuse without
  // one. A sheet is docked to the viewport edge and full width; it reads the anchor for nothing.
  //
  // Gating both on a live anchor is what made a phone sheet depend on a toolbar button it never
  // touches. Rebuilding the toolbar behind an open sheet — which the view does on roughly two dozen
  // paths, most of them background refreshes nobody is watching — left the panel's owner holding a
  // detached button, and the next rebuild of the panel handed that dead node back to this function.
  // It returned here, so the replacement panel never became a sheet at all: no portal onto the body,
  // no backdrop, no placement. The surface the operator was looking at simply stopped existing, and
  // the control they had just tapped had done nothing they could see.
  if (!isMobileBottomSheet(panel.ownerDocument) && !anchorEl?.isConnected) return;

  const margin = options.margin ?? 12;
  const gap = options.gap ?? 6;
  const minWidth = options.minWidth ?? 160;
  // A caller that states no width gets the compact width, not a wide one.
  //
  // The old default was 520px, which suits a wide editor and makes a four-item menu absurd — and
  // the stylesheet caps these only with a max-width, so it cannot rescue one. Three panels reached
  // production on it. Defaulting narrow means an undeclared caller is merely plain rather than
  // broken, and anything that genuinely needs room asks for it.
  const preferredWidth = options.preferredWidth ?? COMPACT_MENU_POPOVER.preferredWidth ?? 292;
  const maxPreferredWidth = options.maxWidth ?? preferredWidth;
  const ownerDocument = panel.ownerDocument;
  const view = ownerDocument.defaultView || window;
  const mobileSheet = isMobileBottomSheet(ownerDocument);
  positionCleanups.get(panel)?.();

  panel.addClass("db-anchored-popover");

  // Presentation now lives in the sheet module so surfaces without an anchor — modals — can reach
  // it too. This function keeps placement, which is the part that genuinely needs an anchor.
  applySheetChrome(panel, mobileSheet);
  if (mobileSheet) {
    // The sheet commits its start state before flipping, so the rise actually runs. The anchored
    // branch keeps the frame-scheduled flip it has always had: on that path the entrance has never
    // run either, but a desktop popover that starts animating for the first time is a change to a
    // surface nobody reported, and this phase is not the place to make it.
    playSheetEntrance(panel);
  } else if (!panel.hasClass("is-visible")) {
    panel.addClass("db-overlay-enter");
    view.requestAnimationFrame(() => {
      if (panel.isConnected) panel.addClass("is-visible");
    });
  }

  // Drag-to-dismiss belongs to the sheet, not to the caller.
  //
  // The bar is drawn by this call, not by the chrome above it. Chrome used to draw it for every
  // phone surface while only two of them — the owned menu and the record panel — ever wired a
  // gesture, so thirty-odd surfaces advertised a drag nothing implemented. A sheet that says it can
  // be pulled down and cannot is worse than one with no bar at all, so the gesture now owns the
  // affordance and an unwired bar has nowhere to come from.
  //
  // The overlay stack is what makes this reachable from here. This function has no close callback
  // and adding one would mean editing every call site; the stack already knows who owns each
  // panel's dismissal because they all register with it, so asking it to dismiss this panel is the
  // same close the backdrop and Escape already run through. A surface that never registered gets a
  // spring-back instead of being left parked below the screen with the gesture half-finished.
  let releaseSheetDrag: (() => void) | undefined;
  if (mobileSheet) {
    releaseSheetDrag = attachSheetDragToDismiss(panel, () => {
      if (overlayStack.dismissPanel(panel, "programmatic")) return;
      panel.setCssProps({ transition: "", transform: "" });
    });
  }
  panel.setCssProps({
    position: "fixed",
    right: "auto",
    bottom: "auto",
    "box-sizing": "border-box",
    "overflow-y": "auto",
    "overscroll-behavior": "contain",
    // Cleared on every open, because a surface hidden for a dead anchor (see `place`) is reopened
    // against a live one and must come back. This is the setup path, so it runs once per open
    // rather than once per animation frame.
    visibility: "",
  });

  // Assigned to `cleanup` once that exists. `place` runs synchronously below, before the
  // `const cleanup` binding is initialised, so naming `cleanup` directly inside `place` would
  // throw on the very first call.
  let teardown: (() => void) | undefined;
  let anchorRecoveryFrame: number | undefined;

  // Hiding is the conservative answer: `visibility: hidden` takes the surface out of hit-testing,
  // out of the tab order and out of the accessibility tree without deciding, on the owner's behalf,
  // that the surface should be destroyed.
  //
  // The chrome comes down with it. A sheet's backdrop is a body-level sibling, not a child, so
  // hiding the panel alone leaves a full-screen scrim swallowing every tap with nothing visible
  // above it — a frozen app, not a conservative outcome. This decides that an unreachable surface
  // stops blocking the app, not that the owner's surface is destroyed behind its back.
  //
  // A surface presenting AS a sheet no longer arrives here at all: `place` answers from the viewport
  // and returns above. The chrome call remains for the surface that carries sheet chrome without
  // being placed as one — a panel opened on a phone and still open at tablet width — which would
  // otherwise leave that same backdrop behind.
  const hideForDisconnectedAnchor = (): void => {
    panel.setCssProps({ visibility: "hidden" });
    applySheetChrome(panel, false);
    teardown?.();
  };

  const place = () => {
    // Resolved once: the answer cannot change within a single placement, and calling it again after
    // the first setPosition has dirtied layout forces a second flush for a value already known.
    const containingBlock = fixedContainingBlock(panel);
    if (!panel.isConnected) return;

    // The sheet places itself from the viewport, ahead of every question about the anchor, because
    // none of those questions have an answer it uses.
    //
    // This used to sit below the disconnected-anchor branch, and a sheet therefore inherited a rule
    // written for a surface that hangs off a button: anchor gone, hide the surface. The hide takes
    // the sheet chrome down with it, so a full-screen docked panel un-portalled itself back into the
    // container and its backdrop went with it. The trigger was ordinary — any toolbar rebuild behind
    // an open sheet, then any viewport event at all, which on a phone means a scroll, a rotation, or
    // the keyboard appearing. Nothing about the sheet had changed and nothing about it was
    // unmeasurable; it was answering a question asked on another surface's behalf.
    if (mobileSheet) {
      const sheetScroll = panel.scrollTop;
      placeSheet(panel, { margin });
      panel.scrollTop = sheetScroll;
      return;
    }

    // An anchor that has been removed cannot be measured, so there is no coordinate this function
    // could write that means anything. Returning quietly — which is what this used to do — leaves
    // the surface painted at wherever the anchor last was, over content that has since been
    // rebuilt underneath it, still focusable and still accepting input. The filter panel reaches
    // this: its date picker commits a draft on every segment edit, the commit refreshes the panel,
    // and the refresh destroys the trigger button while the picker itself is mounted on the
    // container and survives.
    //
    // A disconnected anchor is given one frame to come back before the surface goes. Opening
    // schedules a placement and then a second one on the next frame, and a re-render landing
    // between the two took an anchored sheet down the instant it appeared — open, vanish, and a
    // scrim left over the app. One frame is enough to tell a detach-and-reattach apart from a
    // removal, because the reattach happens within the render that caused it.
    //
    // It is deliberately only a delay, not a recovery. The anchor arrives as a node, not as
    // something re-resolvable, so a re-render that builds a *new* button is still a dead anchor
    // here and still hides — a frame later than before, which costs nothing and is the price of
    // not destroying the surfaces that were only ever moved.
    const anchor = anchorEl;
    if (!anchor?.isConnected) {
      if (anchorRecoveryFrame !== undefined) return;
      anchorRecoveryFrame = view.requestAnimationFrame(() => {
        anchorRecoveryFrame = undefined;
        if (anchor?.isConnected) {
          place();
          return;
        }
        hideForDisconnectedAnchor();
      });
      return;
    }

    const savedPanelScroll = panel.scrollTop;

    const bounds = getVisiblePopoverBounds(null);
    const anchorRect = anchor.getBoundingClientRect();
    const maxWidth = Math.max(minWidth, Math.min(maxPreferredWidth, bounds.width - margin * 2));
    const width = Math.min(preferredWidth, maxWidth);

    panel.setCssProps({
      width: `${width}px`,
      "max-width": `${maxWidth}px`,
      "max-height": "",
    });

    setPosition(panel, bounds.left + margin, bounds.top + margin, containingBlock, 0, 0);
    const panelRect = panel.getBoundingClientRect();
    const measuredWidth = Math.min(panelRect.width || width, maxWidth);
    const naturalHeight = Math.max(panel.scrollHeight, panelRect.height || 0);
    const belowSpace = Math.max(0, bounds.bottom - anchorRect.bottom - gap - margin);
    const aboveSpace = Math.max(0, anchorRect.top - bounds.top - gap - margin);
    const useAbove = aboveSpace > belowSpace && belowSpace < Math.min(naturalHeight, 240);
    const availableHeight = useAbove ? aboveSpace : belowSpace;
    const anchorLeft = resolvePopoverHorizontalLeft(
      anchorRect,
      bounds,
      measuredWidth,
      gap,
      margin,
      options.align ?? "right",
      options.preferredSide,
    );

    if (availableHeight <= 0) {
      const fallbackHeight = Math.max(0, bounds.height - margin * 2);
      setPosition(
        panel,
        anchorLeft,
        bounds.top + margin,
        containingBlock,
        0,
        0
      );
      panel.style.maxHeight = `${fallbackHeight}px`;
      panel.scrollTop = savedPanelScroll;
      return;
    }

    const renderedHeight = Math.min(naturalHeight, availableHeight);
    const top = useAbove
      ? anchorRect.top - gap - renderedHeight
      : anchorRect.bottom + gap;
    setPosition(
      panel,
      anchorLeft,
      clamp(top, bounds.top + margin, bounds.bottom - renderedHeight - margin),
      containingBlock,
      0,
      0
    );
    panel.style.maxHeight = `${availableHeight}px`;
    panel.scrollTop = savedPanelScroll;
  };

  place();
  view.requestAnimationFrame(place);

  let frame: number | undefined;
  const schedule = () => {
    if (!panel.isConnected) {
      cleanup();
      return;
    }
    if (frame !== undefined) return;
    frame = view.requestAnimationFrame(() => {
      frame = undefined;
      place();
    });
  };
  const visualViewport = view.visualViewport;
  const cleanup = () => {
    releaseSheetDrag?.();
    releaseSheetDrag = undefined;
    if (anchorRecoveryFrame !== undefined) view.cancelAnimationFrame(anchorRecoveryFrame);
    anchorRecoveryFrame = undefined;
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    view.removeEventListener("resize", schedule);
    ownerDocument.removeEventListener("scroll", schedule, true);
    visualViewport?.removeEventListener("resize", schedule);
    visualViewport?.removeEventListener("scroll", schedule);
    if (positionCleanups.get(panel) === cleanup) positionCleanups.delete(panel);
  };
  teardown = cleanup;
  view.addEventListener("resize", schedule);
  ownerDocument.addEventListener("scroll", schedule, true);
  visualViewport?.addEventListener("resize", schedule);
  visualViewport?.addEventListener("scroll", schedule);
  positionCleanups.set(panel, cleanup);
}

// ───────────────────────────────────────────────────────────────────
// 4b. SHEET PLACEMENT
// ───────────────────────────────────────────────────────────────────

/**
 * Dock a surface to the bottom of the phone screen, full width, capped in height.
 *
 * Lives here rather than inside the anchored positioner because two families of surface present as
 * this sheet and only one of them has an anchor. Panels reach it through `positionToolbarPopover`;
 * menus place themselves from a point and cannot call that function at all. While the arithmetic
 * sat inside the anchored branch, the menus had no way to reach it, which is the whole reason a
 * phone menu rendered as a desktop dropdown running off both edges of the screen. Copying the six
 * lines into the menu would have made two answers to "where does a sheet sit", and this program has
 * already paid for that once.
 *
 * A sheet sits on the viewport floor, covering the host's bottom navigation bar. `bottom` used to
 * be `innerHeight - bounds.bottom`, and the bounds this reads deliberately subtract the navigation
 * bar and the safe-area inset — right for an anchored popover, which must stay clear of both, and
 * wrong for a sheet, whose whole purpose is to cover them. On a phone that arithmetic came to
 * 106px, so the sheet was parked that far above the bottom edge.
 *
 * The height cap is 90% of the space the sheet can occupy. `svh` is the viewport with the browser
 * chrome shown, which is the height a sheet actually gets. Capping is also what makes a tall menu
 * scroll inside the sheet instead of growing past the screen, so the scroll properties belong to
 * the same statement rather than to whichever caller remembers them.
 *
 * Two ceilings are stated, here and in the stylesheet, and the stylesheet's is the one that binds.
 * An author `!important` outranks an author inline declaration, so `90svh !important` wins over
 * anything written to `panel.style` — measured at 759.6px computed against 714px inline on a 844px
 * screen, and asserted in `verify-placement` so the pair cannot silently drift apart. This is worth
 * stating plainly because it reads backwards: inline usually wins, and a reader who assumes it does
 * will conclude that lowering the cap for a keyboard has to happen here, when in fact only the
 * stylesheet's `calc` can lower it.
 */
export function placeSheet(
  panel: HTMLElement,
  options: { margin?: number; bounds?: DOMRect } = {},
): void {
  const margin = options.margin ?? 12;
  const view = panel.ownerDocument.defaultView || window;
  const bounds = options.bounds ?? getVisiblePopoverBounds(null);
  // Zero in every case the previous hardcoded "0px" covered, so the floor behaviour is unchanged
  // whenever no keyboard is open. The stylesheet's `bottom` rule reads this variable and carries
  // `!important`, so the lever was already wired — it was simply always written zero, and the
  // re-placement that a visual-viewport event triggers recomputed the same zero every time.
  const keyboard = keyboardInset(view, panel.ownerDocument);
  panel.style.setProperty("--db-mobile-sheet-bottom", `${keyboard}px`);
  panel.setCssProps({
    position: "fixed",
    left: "0px",
    right: "0px",
    top: "auto",
    bottom: `${keyboard}px`,
    width: "100%",
    "max-width": "100%",
    "box-sizing": "border-box",
    "overflow-y": "auto",
    "overscroll-behavior": "contain",
    // Less whatever the keyboard covers: raising the bottom edge without lowering the cap pushes a
    // tall sheet off the top of the screen instead of clearing the keyboard.
    "max-height": `${Math.min(Math.max(160, bounds.height - margin * 2), (view.innerHeight - keyboard) * 0.9)}px`,
  });
}

/**
 * Keep a sheet placed while it is open, rather than only at the moment it opened.
 *
 * `placeSheet` is a single placement. The anchored panel path re-runs it from its own reposition
 * loop, so a panel sheet lifts when a keyboard opens and settles when it closes. A surface that
 * calls `placeSheet` once keeps whatever inset happened to be true at open time for its whole life —
 * measured as a menu sheet sitting at `bottom 844 -> 844 -> 844` beside a panel sheet going
 * `844 -> 508 -> 844` under the same declared keyboard. Two sheets on one screen answering the same
 * signal differently is the defect, whichever of them is right.
 *
 * This is the panel loop's subscription set without the anchor arithmetic, because a menu on a phone
 * has no anchor: the sheet is full width and docked, so there is nothing to re-measure but the
 * viewport. Coalesced onto a frame for the reason the panel loop is — the read forces a style flush,
 * and two sheets publishing on different schedules visibly lead one another.
 *
 * Returns its teardown and the caller owns it. Nothing here is tied to the element's lifetime, so a
 * caller that drops the handle leaves viewport listeners alive for as long as the window lives.
 */
export function keepSheetPlaced(
  panel: HTMLElement,
  options: { margin?: number } = {},
): () => void {
  const view = panel.ownerDocument.defaultView || window;
  const visual = view.visualViewport;
  let frame: number | undefined;
  const replace = () => {
    frame = undefined;
    if (!panel.isConnected) return;
    placeSheet(panel, options);
  };
  const schedule = () => {
    if (frame !== undefined) return;
    frame = view.requestAnimationFrame(replace);
  };
  view.addEventListener("resize", schedule);
  visual?.addEventListener("resize", schedule);
  visual?.addEventListener("scroll", schedule);
  return () => {
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    view.removeEventListener("resize", schedule);
    visual?.removeEventListener("resize", schedule);
    visual?.removeEventListener("scroll", schedule);
  };
}

// ───────────────────────────────────────────────────────────────────
// 5. PURE POSITIONING HELPERS
// ───────────────────────────────────────────────────────────────────

/**
 * Where the calendar/timeline search-results panel goes, given its anchor and the bounds it must
 * stay inside.
 *
 * Lifted out of two private methods that held byte-identical copies of it. That duplication was not
 * the reason to move it — the reason is that both copies needed a live Obsidian `App` to reach, so
 * every check of this arithmetic was a TRANSCRIPTION into a probe. A transcribed check answers a
 * question about the copy: this folder measured the consequence in both directions and found that
 * reverting the *source* to `window.innerWidth` left the run at exit 0, while reverting the
 * *transcription* turned it red. A check that cannot fail when the code it names regresses is
 * evidence about the harness, not about the panel.
 *
 * `bounds` is a parameter rather than a call, so the caller decides which surface it is clamping
 * against and this stays drivable. Both callers pass `getVisiblePopoverBounds(null)`: the panel is
 * created on `window.activeDocument.body` to escape the view, so a container would narrow it.
 */
export function calendarSearchResultsPlacement(
  anchor: Pick<DOMRect, "left" | "bottom">,
  bounds: Pick<DOMRect, "left" | "right" | "bottom" | "width">,
): { left: number; top: number; width: number } {
  const width = Math.max(320, Math.min(480, bounds.width - 16));
  return {
    width,
    // The left floor is `bounds.left + 8`, not `8`. A window-relative margin permits x=8, which is
    // underneath an open LEFT sidebar — the same class of error as clamping the right edge to
    // `innerWidth`, in the other direction and easier to miss because it only shows with a sidebar.
    left: Math.max(bounds.left + 8, Math.min(anchor.left, bounds.right - width - 8)),
    top: Math.min(anchor.bottom + 6, bounds.bottom - 80),
  };
}

/**
 * Where an ANCHORLESS column submenu goes: the branch that runs when the row that opened it has
 * already left the document, so there is a click point and nothing to hang off.
 *
 * Lifted for the same reason as `calendarSearchResultsPlacement` above, and `001` named this one as
 * still owed after that lift: the arithmetic lived in a private method on a renderer that needs a
 * live Obsidian `App`, so the only way to check it was to copy the expression into a probe. The
 * harness said so in its own comment — "transcribed from the current source ... copying means this
 * can go stale". A transcribed check answers a question about the copy, and it goes on passing
 * while the source it names regresses.
 *
 * `bounds` is a parameter, not a call, so the caller decides which surface it is clamping against.
 * The shipped caller passes `getVisiblePopoverBounds(panel)` — the editing area, never the window,
 * which is the whole point of this branch: clamping to `innerWidth` placed the submenu 188px
 * underneath an open right sidebar.
 */
export function anchorlessSubmenuPlacement(
  point: { x: number; y: number },
  bounds: Pick<DOMRect, "left" | "right" | "top" | "bottom">,
  size: { width: number; height: number },
): { left: number; top: number } {
  // The source carried `Math.max(lower, upper)` around both upper bounds. It is redundant: `clamp`
  // already answers an inverted range with its lower bound (`if (max < min) return min`), which is
  // the same result. Kept out rather than kept in, because a guard that cannot change an outcome
  // reads as protection and is one more thing to keep true. Removing it was verified by the two
  // narrow-bounds cases in `submenu-placement.test.ts`, which pin the outcome either way — and
  // that is what those cases are actually pinning, so they say so rather than claiming a guard.
  return {
    left: clamp(point.x + 8, bounds.left + 8, bounds.right - size.width - 8),
    top: clamp(point.y - 8, bounds.top + 8, bounds.bottom - size.height - 8),
  };
}

export function resolvePopoverHorizontalLeft(
  anchor: Pick<DOMRect, "left" | "right" | "width">,
  bounds: Pick<DOMRect, "left" | "right">,
  width: number,
  gap: number,
  margin: number,
  align: "left" | "center" | "right" = "right",
  preferredSide?: "left" | "right",
): number {
  const minLeft = bounds.left + margin;
  const maxLeft = Math.max(minLeft, bounds.right - width - margin);
  const aligned = align === "left"
    ? anchor.left
    : align === "center"
      ? anchor.left + anchor.width / 2 - width / 2
      : anchor.right - width;
  if (preferredSide === "right") {
    const right = anchor.right + gap;
    if (right <= maxLeft) return right;
    const left = anchor.left - gap - width;
    if (left >= minLeft) return left;
  } else if (preferredSide === "left") {
    const left = anchor.left - gap - width;
    if (left >= minLeft) return left;
    const right = anchor.right + gap;
    if (right <= maxLeft) return right;
  } else {
    const alignedFits = aligned >= minLeft && aligned <= maxLeft;
    if (alignedFits) return aligned;
    const right = anchor.right + gap;
    if (right <= maxLeft) return right;
    const left = anchor.left - gap - width;
    if (left >= minLeft) return left;
  }
  return clamp(aligned, minLeft, maxLeft);
}

/**
 * The rect a `position: fixed` descendant of `el` is laid out against.
 *
 * Normally that is the viewport, which is why the four callers outside this module hand
 * `setPosition` a container rect of their own and this one historically passed `undefined`.
 * Obsidian breaks the assumption: `.workspace-leaf` carries `contain: strict`, and paint
 * containment makes an element the containing block for its fixed descendants. A popover mounted
 * inside the leaf and given a viewport coordinate is then displaced by the leaf's own origin —
 * measured at 244px outside the editing area with one sidebar open.
 *
 * `offsetParent` cannot answer this: the spec has it return null for a fixed-position element. So
 * the ancestors are walked for the properties that establish such a containing block. The list was
 * checked against the browser rather than against documentation — every property below was
 * confirmed to establish one, and `contain: size`, `contain: style`, `overflow`, `isolation` and
 * `opacity` were confirmed not to. `container-type` does not establish one in Chromium, which is
 * what Obsidian ships, so it is deliberately absent.
 *
 * The walk returns the first match. A property missing from the list under-corrects, which is the
 * safe direction. Overshooting is possible and has one known cause, handled below: the root element
 * is exempt from the filter family, and matching it there displaces a surface by the document's
 * scroll offset in the wrong direction. Two more would overshoot if they were ever reachable — an
 * inline non-replaced box and a table row do not become containing blocks however they are styled,
 * and this reads computed style without checking the box type. No current mount point puts a
 * surface under either.
 *
 * It does not follow that a body-mounted surface takes an untouched path. Obsidian sets
 * `contain: strict` on `body` as well as on the leaf, so this returns body's rect rather than
 * undefined for every portalled surface. That is a numeric no-op only because body sits at the
 * origin with no border, which is worth knowing before anyone gives body a margin.
 *
 * It stops at a shadow boundary, because `parentElement` does. A surface mounted inside a shadow
 * root would under-correct by the host's offset; the surface vocabulary already names `shadowRoot`
 * as a mount, so that is a gap waiting rather than a hypothetical.
 *
 * Scroll offsets are not passed to `setPosition` here. The leaf does not scroll, so the correction
 * is exact today; the first time a match is a scrolling container it will be wrong by its scroll
 * position, and that is what the two unused parameters are for.
 */
function fixedContainingBlock(el: HTMLElement): DOMRect | undefined {
  const view = el.ownerDocument.defaultView;
  if (!view?.getComputedStyle) return undefined;
  for (let node = el.parentElement; node; node = node.parentElement) {
    const style = view.getComputedStyle(node);
    // The root element is exempt from the filter family: a filter on `<html>` applies to the canvas
    // and does not make the root a containing block, while `contain` and `transform` on it still do.
    // Without the exemption a themed `html { filter: invert(1) }` displaces every surface by the
    // document's scroll offset — measured at 300px, and in the wrong direction, which is the one
    // outcome this walk is supposed to be unable to produce.
    const isRoot = node === el.ownerDocument.documentElement;
    const filterish = !isRoot && (style.filter !== "none" || style.backdropFilter !== "none");
    const willChange = isRoot
      ? /\b(transform|translate|rotate|scale|perspective|contain)\b/.test(style.willChange || "")
      : /\b(transform|translate|rotate|scale|perspective|filter|backdrop-filter|contain)\b/.test(style.willChange || "");
    const establishes =
      style.transform !== "none" ||
      // The individual transform properties are not folded into `transform`, so each has to be read.
      style.translate !== "none" ||
      style.rotate !== "none" ||
      style.scale !== "none" ||
      style.perspective !== "none" ||
      // `filter` is not covered by `backdrop-filter` and this stylesheet puts both on popovers, but
      // neither counts on the root — see above.
      filterish ||
      style.contentVisibility === "auto" ||
      style.contentVisibility === "hidden" ||
      willChange ||
      /\b(paint|layout|strict|content)\b/.test(style.contain || "");
    if (!establishes) continue;
    // The containing block is the padding box; getBoundingClientRect gives the border box. Vanilla
    // Obsidian draws no border on the leaf, but themes do, and the difference is a silent offset of
    // exactly the border width that reads as sloppiness rather than as a bug.
    const rect = node.getBoundingClientRect();
    const left = rect.left + parseFloat(style.borderLeftWidth || "0");
    const top = rect.top + parseFloat(style.borderTopWidth || "0");
    return new DOMRect(left, top, rect.width, rect.height);
  }
  return undefined;
}

export function setPosition(
  panel: HTMLElement,
  globalLeft: number,
  globalTop: number,
  containerRect: DOMRect | undefined,
  scrollLeft: number,
  scrollTop: number
): void {
  if (!containerRect) {
    panel.setCssProps({ left: `${globalLeft}px`, top: `${globalTop}px` });
    return;
  }
  panel.setCssProps({
    left: `${globalLeft - containerRect.left + scrollLeft}px`,
    top: `${globalTop - containerRect.top + scrollTop}px`,
  });
}

export function getVisiblePopoverBounds(container: HTMLElement | null): DOMRect {
  const doc = container?.ownerDocument || window.activeDocument;
  const view = doc.defaultView || window;
  const viewport = getVisualViewportBounds(view);
  // Prefer the root split — the editing area between the sidebars. `.workspace` and
  // `.app-container` both span the sidebars too, so clamping to either lets a popover slide
  // underneath an open right sidebar and still be "in bounds". Both remain as fallbacks for
  // layouts where the root split is absent, such as a popped-out window.
  const app = doc.querySelector(".workspace-split.mod-root")
    || doc.querySelector(".app-container")
    || doc.querySelector(".workspace");
  const appRect = isHTMLElement(app) ? app.getBoundingClientRect() : viewport;
  // A container that has not laid out yet says nothing about where a surface may go.
  //
  // A body-portalled fixed panel reports a zero rect until its first layout, and intersecting that
  // with the editing area produces `right <= left` — which trips the degenerate guard below and
  // hands back the WHOLE viewport, the exact bound this function exists to narrow. The column
  // submenu passes its own panel here, so it was clamped against the window and could sit under an
  // open right sidebar. Measured: `.right` came back 1440 where the editing area ends at 1140.
  //
  // An empty rect is missing information, not a constraint of zero width, so it is ignored rather
  // than intersected.
  const measured = container?.getBoundingClientRect();
  const containerRect = measured && measured.width > 0 && measured.height > 0 ? measured : viewport;
  const left = Math.max(viewport.left, appRect.left, containerRect.left);
  const top = Math.max(viewport.top, appRect.top, containerRect.top);
  const right = Math.min(viewport.right, appRect.right, containerRect.right);
  let bottom = Math.min(viewport.bottom, appRect.bottom, containerRect.bottom);
  // 移动端底部导航栏留空：手机 Obsidian 有固定底部 tab bar，popover 底部按钮需避让
  if (doc.body.classList.contains("is-phone")) {
    const navbar = doc.querySelector(".mobile-navbar");
    const navbarHeight = isHTMLElement(navbar) ? navbar.getBoundingClientRect().height : 50;
    const safeBottom = parseFloat(getComputedStyle(doc.body).getPropertyValue("--safe-area-inset-bottom") || "0");
    bottom = Math.min(bottom, viewport.bottom - navbarHeight - safeBottom);
  }
  if (right <= left || bottom <= top) return viewport;
  return new DOMRect(left, top, right - left, bottom - top);
}

/**
 * How much of the layout viewport a software keyboard is covering, in CSS pixels.
 *
 * The host is the primary source and this is not a preference. Obsidian listens to the platform's
 * own keyboard events and publishes the height as `--keyboard-height` on the document element, then
 * places its own mobile toolbar and shrinks its app container from that same number. A surface that
 * measured the keyboard some other way would sit on a different figure from the host chrome beside
 * it, and the two would visibly disagree for the length of the keyboard animation.
 *
 * It also explains why a sheet never moved. The host does not resize the WebView — `body` stays at
 * `100vh` and `.app-container` is capped instead. A sheet portalled to `body` is that container's
 * sibling, so it inherits none of the shrink and stays docked to a floor that is now behind the
 * keyboard.
 *
 * The visual viewport is a fallback rather than a replacement, for the frame before the variable is
 * written and for any host that never writes one. The two are combined with `max` because they are
 * observations of a single physical thing, so whichever notices first is the right answer.
 *
 * The visual viewport also shrinks under pinch-zoom, which is not a keyboard. `scale` separates the
 * two cases; without that guard, zooming lifts the sheet off the floor for no reason.
 */
function keyboardInset(view: Window, doc: Document): number {
  let host = 0;
  if (view.getComputedStyle) {
    const declared = parseFloat(
      view.getComputedStyle(doc.documentElement).getPropertyValue("--keyboard-height") || "0",
    );
    if (Number.isFinite(declared)) host = Math.max(0, declared);
  }
  const visual = view.visualViewport;
  return resolveKeyboardInset(
    host,
    view.innerHeight,
    visual ? { height: visual.height, offsetTop: visual.offsetTop, scale: visual.scale } : null,
  );
}

/**
 * The inset decision itself, with the DOM reading left to the caller above.
 *
 * Split out because the pinch-zoom guard could not otherwise be checked. The browser check that
 * claimed to cover it evaluated `visualViewport.scale <= 1.01 && zoomed <= 1` against the harness's
 * own untouched viewport, where `scale` is always 1 and the visual height always equals
 * `innerHeight` — so it read `1 <= 1.01 && 0 <= 1`, two constants, true on every run for ever. It
 * measured the harness's viewport identity, never the guard, and its own comment conceded that a
 * viewport cannot be pinched from script. A guard that is a decision over three numbers is checked
 * as one.
 *
 * `MAX_UNZOOMED_SCALE` is 1.01 rather than 1 because a resting viewport does not always report
 * exactly 1: browser zoom, device pixel ratio rounding and the keyboard animation's own frames can
 * put it a hair either side, and a strict comparison would read those as a pinch and switch the
 * fallback off on a real keyboard.
 */
export const MAX_UNZOOMED_SCALE = 1.01;

export function resolveKeyboardInset(
  hostDeclared: number,
  layoutHeight: number,
  visual: { height: number; offsetTop: number; scale: number } | null,
): number {
  // A pinch shrinks the visual viewport exactly as a keyboard does, and reading one as the other
  // lifts the sheet off the floor for no reason. Scale is what separates them.
  const observed = visual && visual.scale <= MAX_UNZOOMED_SCALE
    ? Math.max(0, layoutHeight - visual.height - visual.offsetTop)
    : 0;
  // `max`, not a preference: the two are observations of one physical thing, so whichever notices
  // first is the right answer.
  return Math.max(Math.max(0, hostDeclared), observed);
}

/**
 * Publish a container's keyboard inset as `--db-keyboard-inset`, and keep it current.
 *
 * A phone surface that docks to the bottom of the screen has to know how much of that screen the
 * software keyboard is covering, and `--keyboard-height` cannot be asked on its own. That variable
 * belongs to the host: only Obsidian ever writes it, and on a host that does not — an older
 * release, a platform whose keyboard plugin is absent, a desktop build in a phone-shaped window —
 * every CSS rule reading it resolves to its fallback forever. Such a rule does not fail loudly. It
 * silently never moves, which is how a status bar came to sit under an open keyboard while the
 * sheet beside it lifted correctly: the sheet asked the function below, the bar asked the host.
 *
 * `keyboardInset` is the answer to the question, combining the host's report with the visual
 * viewport's own shrink so whichever notices first wins. It was reachable from one caller and wrote
 * a per-panel variable, so exactly one surface benefited. This writes the same number where any
 * descendant of the container can read it, which is what makes it a property of the surface rather
 * than of one panel.
 *
 * On the container rather than the document element deliberately. `--keyboard-height` is the host's
 * namespace and a plugin has no business writing beside it, where one view's measurement would sit
 * in front of every other view and of the host's own chrome. Custom properties inherit through the
 * DOM and not through layout, so a `position: fixed` child of the container still reads this.
 *
 * Coalesced onto a frame for the two reasons the reposition loop above is: the read forces a style
 * flush, and the sheet moves on that same schedule — a bar that published a frame earlier would
 * visibly lead the sheet sitting beside it.
 *
 * Returns its own teardown, and the caller owns it. Nothing here is tied to the container's
 * lifetime, so a caller that drops the handle leaves a viewport listener alive for as long as the
 * window lives.
 */
export function publishKeyboardInset(container: HTMLElement): () => void {
  const doc = container.ownerDocument;
  const view = doc.defaultView || window;
  const visual = view.visualViewport;
  let frame: number | undefined;
  const publish = () => {
    frame = undefined;
    container.style.setProperty("--db-keyboard-inset", `${keyboardInset(view, doc)}px`);
  };
  const schedule = () => {
    if (frame !== undefined) return;
    frame = view.requestAnimationFrame(publish);
  };
  view.addEventListener("resize", schedule);
  visual?.addEventListener("resize", schedule);
  visual?.addEventListener("scroll", schedule);
  publish();
  return () => {
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    view.removeEventListener("resize", schedule);
    visual?.removeEventListener("resize", schedule);
    visual?.removeEventListener("scroll", schedule);
    container.style.removeProperty("--db-keyboard-inset");
  };
}

/**
 * Does this document present overlays as phone bottom sheets?
 *
 * Exported so the menu path asks the same question the panel path does. A second predicate would
 * drift from this one, and the two families would disagree about what a phone is on exactly the
 * devices nobody tests.
 */
export function isMobileBottomSheet(doc: Document): boolean {
  if (doc.body.classList.contains("is-phone")) return true;
  const view = doc.defaultView;
  const touchPoints = typeof navigator !== "undefined" ? navigator.maxTouchPoints : 0;
  const coarsePointer = Boolean(view?.matchMedia?.("(pointer: coarse)").matches);
  return Boolean(view && view.innerWidth <= 600 && (touchPoints > 0 || coarsePointer));
}

function getVisualViewportBounds(view: Window): DOMRect {
  const visual = view.visualViewport;
  if (!visual) return new DOMRect(0, 0, view.innerWidth, view.innerHeight);
  return new DOMRect(visual.offsetLeft, visual.offsetTop, visual.width, visual.height);
}

export function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

// ───────────────────────────────────────────────────────────────────
// 6. BULK EDITOR POPOVER TOP
// ───────────────────────────────────────────────────────────────────

// Bulk editor popovers anchor under the selection status bar (not over the representative
// cell). Pure data-in/data-out so it can be unit-tested in Node and shared by the text/date
// editors. Prefer "below anchor" (top = anchor.bottom + gap); flip above only when below can't
// fit and above has more room. clamp keeps the result inside bounds (margin-respected); when the
// popover is taller than the visible area, clamp falls back to the top edge (stable).
export function resolveAnchoredPopoverTop(
  anchor: { top: number; bottom: number },
  bounds: { top: number; bottom: number },
  height: number,
  gap: number,
  margin: number,
): { top: number; useAbove: boolean } {
  const below = bounds.bottom - anchor.bottom - gap;
  const above = anchor.top - bounds.top - gap;
  const useAbove = above > below && below < height;
  const raw = useAbove ? anchor.top - gap - height : anchor.bottom + gap;
  return { top: clamp(raw, bounds.top + margin, bounds.bottom - height - margin), useAbove };
}
