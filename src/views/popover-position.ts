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

// ───────────────────────────────────────────────────────────────────
// 4. TOOLBAR POPOVER POSITIONING
// ───────────────────────────────────────────────────────────────────

export function positionToolbarPopover(
  panel: HTMLElement,
  anchorEl?: HTMLElement,
  options: ToolbarPopoverPositionOptions = {}
): void {
  if (!anchorEl?.isConnected) return;

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
  // `applySheetChrome` gives every phone surface a grab bar, and until now only two of them — the
  // owned menu and the record panel — ever wired a gesture to it. Every one of the thirty-odd
  // surfaces that reach a sheet through this function drew a handle that advertised a drag nothing
  // implemented, which is worse than drawing none: a sheet that says it can be dragged down and
  // cannot is a surface with no visible way out.
  //
  // The overlay stack is what makes this reachable from here. This function has no close callback
  // and adding one would mean editing every call site; the stack already knows who owns each
  // panel's dismissal because they all register with it, so asking it to dismiss this panel is the
  // same close the backdrop and Escape already run through. A surface that never registered gets a
  // spring-back instead of being left parked below the screen with the gesture half-finished.
  let releaseSheetDrag: (() => void) | undefined;
  if (mobileSheet) {
    const handle = panel.querySelector<HTMLElement>(".db-mobile-bottom-sheet-handle");
    if (handle) {
      releaseSheetDrag = attachSheetDragToDismiss(panel, handle, () => {
        if (overlayStack.dismissPanel(panel, "programmatic")) return;
        panel.setCssProps({ transition: "", transform: "" });
      });
    }
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

  const place = () => {
    // Resolved once: the answer cannot change within a single placement, and calling it again after
    // the first setPosition has dirtied layout forces a second flush for a value already known.
    const containingBlock = fixedContainingBlock(panel);
    if (!panel.isConnected) return;
    // An anchor that has been removed cannot be measured, so there is no coordinate this function
    // could write that means anything. Returning quietly — which is what this used to do — leaves
    // the surface painted at wherever the anchor last was, over content that has since been
    // rebuilt underneath it, still focusable and still accepting input. The filter panel reaches
    // this: its date picker commits a draft on every segment edit, the commit refreshes the panel,
    // and the refresh destroys the trigger button while the picker itself is mounted on the
    // container and survives.
    //
    // Hiding is the same answer `openSurface`'s own `place()` already gives, and it is the
    // conservative one: `visibility: hidden` takes the surface out of hit-testing, out of the tab
    // order and out of the accessibility tree without deciding, on the owner's behalf, that the
    // surface should be destroyed. The reposition loop goes with it, because a removed node is
    // never reconnected here — a rebuild produces a new node, so this anchor is gone for good.
    if (!anchorEl.isConnected) {
      panel.setCssProps({ visibility: "hidden" });
      teardown?.();
      return;
    }

    const savedPanelScroll = panel.scrollTop;

    const bounds = getVisiblePopoverBounds(null);
    const anchorRect = anchorEl.getBoundingClientRect();
    const maxWidth = Math.max(minWidth, Math.min(maxPreferredWidth, bounds.width - margin * 2));
    const width = Math.min(preferredWidth, maxWidth);

    panel.setCssProps({
      width: `${width}px`,
      "max-width": `${maxWidth}px`,
      "max-height": "",
    });
    if (mobileSheet) {
      placeSheet(panel, { margin, bounds });
      panel.scrollTop = savedPanelScroll;
      return;
    }

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

// ───────────────────────────────────────────────────────────────────
// 5. PURE POSITIONING HELPERS
// ───────────────────────────────────────────────────────────────────

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
  const containerRect = container?.getBoundingClientRect() || viewport;
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
  const observed = visual && visual.scale <= 1.01
    ? Math.max(0, view.innerHeight - visual.height - visual.offsetTop)
    : 0;
  return Math.max(host, observed);
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
