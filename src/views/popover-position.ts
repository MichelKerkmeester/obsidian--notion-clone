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
import { applySheetChrome } from "./mobile-bottom-sheet";

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
  if (!panel.hasClass("is-visible")) {
    panel.addClass("db-overlay-enter");
    view.requestAnimationFrame(() => {
      if (panel.isConnected) panel.addClass("is-visible");
    });
  }
  panel.setCssProps({
    position: "fixed",
    right: "auto",
    bottom: "auto",
    boxSizing: "border-box",
    overflowY: "auto",
    overscrollBehavior: "contain",
  });

  const place = () => {
    if (!panel.isConnected || !anchorEl.isConnected) return;

    const savedPanelScroll = panel.scrollTop;

    const bounds = getVisiblePopoverBounds(null);
    const anchorRect = anchorEl.getBoundingClientRect();
    const maxWidth = Math.max(minWidth, Math.min(maxPreferredWidth, bounds.width - margin * 2));
    const width = Math.min(preferredWidth, maxWidth);

    panel.setCssProps({
      width: `${width}px`,
      maxWidth: `${maxWidth}px`,
      maxHeight: "",
    });
    if (mobileSheet) {
      // A sheet sits on the viewport floor, covering the host's bottom navigation bar.
      //
      // These two lines used to be `innerHeight - bounds.bottom`, and the bounds this reads
      // deliberately subtract the navigation bar and the safe-area inset — right for an anchored
      // popover, which must stay clear of both, and wrong for a sheet, whose whole purpose is to
      // cover them. On a phone that arithmetic came to 106px, so the sheet was parked that far
      // above the bottom edge and appeared to start above the bar.
      //
      // No portal and no z-index is involved: `position: fixed` is resolved against the viewport,
      // and the host bar declares no stacking order of its own.
      panel.style.setProperty("--db-mobile-sheet-bottom", "0px");
      panel.setCssProps({
        left: "0px",
        right: "0px",
        top: "auto",
        bottom: "0px",
        width: "100%",
        maxWidth: "100%",
        // Cap at 90% of the small viewport. The stylesheet asks for 90svh, but this inline value
        // wins, so the ceiling has to be applied here too or the rule never takes effect. `svh`
        // is the viewport with the browser chrome shown, which is the height a sheet actually gets.
        maxHeight: `${Math.min(Math.max(160, bounds.height - margin * 2), view.innerHeight * 0.9)}px`,
      });
      panel.scrollTop = savedPanelScroll;
      return;
    }

    setPosition(panel, bounds.left + margin, bounds.top + margin, undefined, 0, 0);
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
        undefined,
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
      undefined,
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
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    view.removeEventListener("resize", schedule);
    ownerDocument.removeEventListener("scroll", schedule, true);
    visualViewport?.removeEventListener("resize", schedule);
    visualViewport?.removeEventListener("scroll", schedule);
    if (positionCleanups.get(panel) === cleanup) positionCleanups.delete(panel);
  };
  view.addEventListener("resize", schedule);
  ownerDocument.addEventListener("scroll", schedule, true);
  visualViewport?.addEventListener("resize", schedule);
  visualViewport?.addEventListener("scroll", schedule);
  positionCleanups.set(panel, cleanup);
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

function isMobileBottomSheet(doc: Document): boolean {
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
