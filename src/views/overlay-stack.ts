// ───────────────────────────────────────────────────────────────────
// MODULE:    overlay-stack
// COMPONENT: single shared registry that decides which floating surface
//            (popover, panel, menu) owns Escape and outside-pointerdown
// ───────────────────────────────────────────────────────────────────
//
// Every popover/panel/menu in the plugin used to wire its own document
// listeners for Escape and outside-click, which meant nested surfaces
// (a color picker opened from a record detail panel, say) fought over
// the same event: both closed at once, or the wrong one did. Routing
// dismissal through one LIFO stack per document means only the topmost
// registered surface ever reacts, and closing it deterministically
// hands focus back to the surface (or trigger) beneath it.

// ───────────────────────────────────────────────────────────────────
// 0. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { isSheetTraceEnabled, traceSheet } from "./sheet-trace";

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export type OverlayCloseReason =
  | "escape"
  | "outside-pointerdown"
  | "action"
  | "programmatic";

export interface OverlaySurfaceOptions {
  id?: string;
  panel: HTMLElement;
  /**
   * Resolve the live panel node at check time instead of trusting the one captured at register().
   *
   * A surface whose owner rebuilds its panel in place (remove + recreate, as the sort and filter
   * panels do on every add/toggle/remove) leaves `panel` pointing at a detached node the moment it
   * rebuilds. Every dismissal check below prefers this resolver when it is supplied, so a tap
   * inside whatever the owner currently considers "the panel" is tested against that node, not the
   * one that existed when the surface first opened.
   */
  getPanel?: () => HTMLElement | null;
  anchor?: HTMLElement;
  getAnchor?: () => HTMLElement | null;
  parentId?: string;
  isSheet?: boolean;
  close?(reason: OverlayCloseReason): void;
  closeOnOutsidePointerDown?: boolean;
  closeOnEscape?: boolean;
}

export interface OverlaySurface {
  id: string;
  panel: HTMLElement;
  close(reason: OverlayCloseReason): void;
  getPanel?: () => HTMLElement | null;
  anchor?: HTMLElement;
  getAnchor?: () => HTMLElement | null;
  parentId?: string;
  isSheet: boolean;
  closeOnOutsidePointerDown: boolean;
  closeOnEscape: boolean;
}

interface DocumentListeners {
  keydown: (event: KeyboardEvent) => void;
  pointerdown: (event: PointerEvent) => void;
}

// ───────────────────────────────────────────────────────────────────
// 2. STATE
// ───────────────────────────────────────────────────────────────────

let nextOverlayId = 0;

// ───────────────────────────────────────────────────────────────────
// 3. OVERLAY STACK
// ───────────────────────────────────────────────────────────────────

/** Coordinates dismissal and focus for the small set of floating surfaces in a document. */
export class OverlayStack {
  private readonly surfaces: OverlaySurface[] = [];
  private readonly listeners = new WeakMap<Document, DocumentListeners>();

  register(options: OverlaySurfaceOptions): { id: string; unregister(restoreFocus?: boolean): void } {
    const doc = options.panel.ownerDocument;
    const existingIndex = this.surfaces.findIndex((surface) =>
      surface.panel.ownerDocument === doc
      && (surface.panel === options.panel || (options.id !== undefined && surface.id === options.id)));
    const existing = existingIndex >= 0 ? this.surfaces[existingIndex] : undefined;
    const id = options.id || existing?.id || `db-overlay-${++nextOverlayId}`;

    const parentId = existing
      ? options.parentId ?? existing.parentId
      : options.parentId ?? this.getTopSurfaceForDocument(doc, { sheetsOnly: true })?.id;
    const safeParentId = parentId === id ? undefined : parentId;
    const surface: OverlaySurface = {
      id,
      panel: options.panel,
      getPanel: options.getPanel,
      anchor: options.anchor,
      getAnchor: options.getAnchor,
      // Re-registering a rebuilt panel must not make it its own parent. An omitted parent on an
      // existing surface means "keep the relationship this owner already established"; a new
      // sheet derives its parent from the top sheet that was open before it mounted.
      parentId: safeParentId,
      isSheet: options.isSheet ?? existing?.isSheet ?? false,
      close: options.close ? (reason) => options.close?.(reason) : existing?.close ?? (() => undefined),
      closeOnOutsidePointerDown: options.closeOnOutsidePointerDown === undefined
        ? existing?.closeOnOutsidePointerDown ?? true
        : options.closeOnOutsidePointerDown,
      closeOnEscape: options.closeOnEscape === undefined
        ? existing?.closeOnEscape ?? true
        : options.closeOnEscape,
    };
    if (existingIndex >= 0) this.surfaces[existingIndex] = surface;
    else this.surfaces.push(surface);
    this.ensureDocumentListeners(doc);

    return {
      id,
      unregister: (restoreFocus = true) => this.unregister(id, restoreFocus, doc),
    };
  }

  unregister(id: string, restoreFocus = true, ownerDocument?: Document): boolean {
    const index = this.surfaces.findIndex((surface) =>
      surface.id === id && (!ownerDocument || surface.panel.ownerDocument === ownerDocument));
    if (index < 0) return false;
    const [surface] = this.surfaces.splice(index, 1);
    if (restoreFocus) this.restoreFocus(surface);
    this.removeDocumentListenersIfIdle(surface.panel.ownerDocument);
    return true;
  }

  /** Remove the surface represented by a live or previously registered panel node. */
  unregisterPanel(panel: HTMLElement, restoreFocus = false): boolean {
    const index = this.surfaces.findIndex((surface) =>
      surface.panel === panel || this.livePanel(surface) === panel);
    if (index < 0) return false;
    const [surface] = this.surfaces.splice(index, 1);
    if (restoreFocus) this.restoreFocus(surface);
    this.removeDocumentListenersIfIdle(surface.panel.ownerDocument);
    return true;
  }

  dismissTop(reason: OverlayCloseReason = "programmatic"): boolean {
    const surface = this.getTopSurface();
    if (!surface) return false;
    this.removeSurface(surface, false);
    surface.close(reason);
    if (reason !== "action") this.restoreFocus(surface);
    return true;
  }

  dismissPanel(panel: HTMLElement, reason: OverlayCloseReason = "programmatic"): boolean {
    const surface = this.surfaces.find((candidate) => this.livePanel(candidate) === panel);
    if (!surface) return false;
    this.removeSurface(surface, false);
    surface.close(reason);
    if (reason !== "action") this.restoreFocus(surface);
    return true;
  }

  getTopSurface(): OverlaySurface | undefined {
    return this.surfaces[this.surfaces.length - 1];
  }

  getTopSurfaceForDocument(doc: Document, options: { sheetsOnly?: boolean } = {}): OverlaySurface | undefined {
    for (let index = this.surfaces.length - 1; index >= 0; index -= 1) {
      const surface = this.surfaces[index];
      if (surface.panel.ownerDocument !== doc) continue;
      if (options.sheetsOnly && !surface.isSheet) continue;
      return surface;
    }
    return undefined;
  }

  /** Return the registered surface immediately beneath a panel in the same document. */
  getSurfaceBelow(panel: HTMLElement, options: { sheetsOnly?: boolean } = {}): OverlaySurface | undefined {
    const index = this.surfaces.findIndex((surface) => this.livePanel(surface) === panel);
    if (index < 0) return undefined;
    for (let candidateIndex = index - 1; candidateIndex >= 0; candidateIndex -= 1) {
      const candidate = this.surfaces[candidateIndex];
      if (candidate.panel.ownerDocument !== panel.ownerDocument) continue;
      if (options.sheetsOnly && !candidate.isSheet) continue;
      return candidate;
    }
    return undefined;
  }

  /** Resolve a panel's nesting depth by following its registered parent chain. */
  getDepth(panel: HTMLElement): number {
    const surface = this.surfaces.find((candidate) => this.livePanel(candidate) === panel);
    if (!surface) return 1;
    let depth = 1;
    let current = surface;
    const visited = new Set<string>();
    while (current.parentId && !visited.has(current.id)) {
      visited.add(current.id);
      const parent = this.surfaces.find((candidate) =>
        candidate.panel.ownerDocument === panel.ownerDocument && candidate.id === current.parentId);
      if (!parent) break;
      depth += 1;
      current = parent;
    }
    return depth;
  }

  /**
   * True when a node lies inside a surface stacked above this one.
   *
   * A surface that closes on an outside press needs to know that a press landing in its own child
   * is not outside it. Answering that from a hand-kept list of child surface classes means every
   * new child has to be remembered by every parent, and the one nobody remembered is the one that
   * closes the parent under the person's thumb. The stack already knows what is above what.
   */
  isInsideSurfaceAbove(panel: HTMLElement, target: Node | null | undefined): boolean {
    if (!target) return false;
    const index = this.surfaces.findIndex((surface) => this.livePanel(surface) === panel);
    if (index < 0) return false;
    for (let above = index + 1; above < this.surfaces.length; above += 1) {
      const candidate = this.surfaces[above];
      if (candidate.panel.ownerDocument !== panel.ownerDocument) continue;
      if (this.livePanel(candidate).contains(target)) return true;
    }
    return false;
  }

  isTopSheet(panel: HTMLElement): boolean {
    const top = this.getTopSurfaceForDocument(panel.ownerDocument, { sheetsOnly: true });
    return top !== undefined && this.livePanel(top) === panel;
  }

  hasPanel(panel: HTMLElement): boolean {
    return this.surfaces.some((surface) => this.livePanel(surface) === panel || surface.panel === panel);
  }

  isTopSurface(panel: HTMLElement): boolean {
    const top = this.getTopSurface();
    return top !== undefined && this.livePanel(top) === panel;
  }

  /** The node this surface currently considers its panel, resolved fresh so a rebuilt owner is not stale. */
  private livePanel(surface: OverlaySurface): HTMLElement {
    return surface.getPanel?.() || surface.panel;
  }

  size(): number {
    return this.surfaces.length;
  }

  clear(): void {
    while (this.dismissTop("programmatic")) {
      // Each close callback is allowed to unregister its own surface.
    }
  }

  private ensureDocumentListeners(doc: Document): void {
    if (this.listeners.has(doc)) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") this.handleEscape(doc, event);
    };
    const pointerdown = (event: PointerEvent) => this.handlePointerDown(doc, event);
    doc.addEventListener("keydown", keydown, true);
    doc.addEventListener("pointerdown", pointerdown, true);
    this.listeners.set(doc, { keydown, pointerdown });
  }

  private handleEscape(doc: Document, event: KeyboardEvent): void {
    const surface = this.getTopSurfaceForDocument(doc);
    if (!surface?.closeOnEscape) return;
    event.preventDefault();
    event.stopPropagation();
    this.dismissSurface(surface, "escape");
  }

  private handlePointerDown(doc: Document, event: PointerEvent): void {
    const surface = this.getTopSurfaceForDocument(doc);
    if (!surface?.closeOnOutsidePointerDown) return;
    const target = event.target;
    const NodeConstructor = doc.defaultView?.Node;
    const isNode = typeof NodeConstructor === "function" && target instanceof NodeConstructor;
    const anchor = surface.getAnchor?.() || surface.anchor;
    if (isNode && (this.livePanel(surface).contains(target) || anchor?.contains(target))) return;
    this.dismissSurface(surface, "outside-pointerdown");
  }

  private dismissSurface(surface: OverlaySurface, reason: OverlayCloseReason): void {
    // Why a surface went is the fork a device trace exists to settle: a tap that never reached the
    // control and a tap that reached it and was then undone look identical afterwards.
    if (isSheetTraceEnabled()) traceSheet("dismiss", `${reason} ${this.livePanel(surface).className}`);
    this.removeSurface(surface, false);
    surface.close(reason);
    if (reason !== "action") this.restoreFocus(surface);
  }

  private removeSurface(surface: OverlaySurface, restoreFocus: boolean): void {
    const index = this.surfaces.indexOf(surface);
    if (index < 0) return;
    this.surfaces.splice(index, 1);
    if (restoreFocus) this.restoreFocus(surface);
    this.removeDocumentListenersIfIdle(surface.panel.ownerDocument);
  }

  private restoreFocus(surface: OverlaySurface): void {
    const anchor = surface.getAnchor?.() || surface.anchor;
    if (!anchor?.isConnected || typeof anchor.focus !== "function") return;
    anchor.focus({ preventScroll: true });
  }

  private removeDocumentListenersIfIdle(doc: Document): void {
    if (this.surfaces.some((surface) => surface.panel.ownerDocument === doc)) return;
    const listeners = this.listeners.get(doc);
    if (!listeners) return;
    doc.removeEventListener("keydown", listeners.keydown, true);
    doc.removeEventListener("pointerdown", listeners.pointerdown, true);
    this.listeners.delete(doc);
  }
}

// ───────────────────────────────────────────────────────────────────
// 4. SINGLETON
// ───────────────────────────────────────────────────────────────────

export const overlayStack = new OverlayStack();
