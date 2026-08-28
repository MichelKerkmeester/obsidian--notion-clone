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
  const preferredWidth = options.preferredWidth ?? 520;
  const maxPreferredWidth = options.maxWidth ?? preferredWidth;
  const ownerDocument = panel.ownerDocument;
  const view = ownerDocument.defaultView || window;
  const mobileSheet = isMobileBottomSheet(ownerDocument);
  positionCleanups.get(panel)?.();

  panel.addClass("db-anchored-popover");
  panel.toggleClass("db-mobile-bottom-sheet", mobileSheet);
  const existingHandle = panel.querySelector<HTMLElement>(".db-mobile-bottom-sheet-handle");
  if (mobileSheet && !existingHandle) {
    const handle = ownerDocument.createElement("div");
    handle.className = "db-mobile-bottom-sheet-handle";
    handle.setAttribute("aria-hidden", "true");
    panel.prepend(handle);
  } else if (!mobileSheet) {
    existingHandle?.remove();
  }
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
      panel.style.setProperty("--db-mobile-sheet-bottom", `${Math.max(0, view.innerHeight - bounds.bottom)}px`);
      panel.setCssProps({
        left: "0px",
        right: "0px",
        top: "auto",
        bottom: `${Math.max(0, view.innerHeight - bounds.bottom)}px`,
        width: "100%",
        maxWidth: "100%",
        maxHeight: `${Math.max(160, bounds.height - margin * 2)}px`,
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
  const app = doc.querySelector(".app-container") || doc.querySelector(".workspace");
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
