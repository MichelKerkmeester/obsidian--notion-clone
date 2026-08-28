export type OverlayCloseReason =
  | "escape"
  | "outside-pointerdown"
  | "action"
  | "programmatic";

export interface OverlaySurfaceOptions {
  id?: string;
  panel: HTMLElement;
  anchor?: HTMLElement;
  parentId?: string;
  close(reason: OverlayCloseReason): void;
  closeOnOutsidePointerDown?: boolean;
  closeOnEscape?: boolean;
}

interface OverlaySurface extends Required<Pick<OverlaySurfaceOptions, "panel" | "close">> {
  id: string;
  anchor?: HTMLElement;
  parentId?: string;
  closeOnOutsidePointerDown: boolean;
  closeOnEscape: boolean;
}

interface DocumentListeners {
  keydown: (event: KeyboardEvent) => void;
  pointerdown: (event: PointerEvent) => void;
}

let nextOverlayId = 0;

/** Coordinates dismissal and focus for the small set of floating surfaces in a document. */
export class OverlayStack {
  private readonly surfaces: OverlaySurface[] = [];
  private readonly listeners = new WeakMap<Document, DocumentListeners>();

  register(options: OverlaySurfaceOptions): { id: string; unregister(): void } {
    const doc = options.panel.ownerDocument;
    const id = options.id || `db-overlay-${++nextOverlayId}`;
    this.unregister(id, false);

    const surface: OverlaySurface = {
      id,
      panel: options.panel,
      anchor: options.anchor,
      parentId: options.parentId,
      close: options.close,
      closeOnOutsidePointerDown: options.closeOnOutsidePointerDown !== false,
      closeOnEscape: options.closeOnEscape !== false,
    };
    this.surfaces.push(surface);
    this.ensureDocumentListeners(doc);

    return {
      id,
      unregister: () => this.unregister(id),
    };
  }

  unregister(id: string, restoreFocus = true): boolean {
    const index = this.surfaces.findIndex((surface) => surface.id === id);
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
    const surface = this.surfaces.find((candidate) => candidate.panel === panel);
    if (!surface) return false;
    this.removeSurface(surface, false);
    surface.close(reason);
    if (reason !== "action") this.restoreFocus(surface);
    return true;
  }

  getTopSurface(): OverlaySurface | undefined {
    return this.surfaces[this.surfaces.length - 1];
  }

  isTopSurface(panel: HTMLElement): boolean {
    return this.getTopSurface()?.panel === panel;
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
    if (isNode && (surface.panel.contains(target) || surface.anchor?.contains(target))) return;
    this.dismissSurface(surface, "outside-pointerdown");
  }

  private getTopSurfaceForDocument(doc: Document): OverlaySurface | undefined {
    for (let index = this.surfaces.length - 1; index >= 0; index -= 1) {
      const surface = this.surfaces[index];
      if (surface.panel.ownerDocument === doc) return surface;
    }
    return undefined;
  }

  private dismissSurface(surface: OverlaySurface, reason: OverlayCloseReason): void {
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
    if (!surface.anchor?.isConnected || typeof surface.anchor.focus !== "function") return;
    surface.anchor.focus({ preventScroll: true });
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

export const overlayStack = new OverlayStack();
