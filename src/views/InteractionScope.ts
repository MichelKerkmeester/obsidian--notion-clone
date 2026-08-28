export interface InteractionScopeOptions {
  portals?: HTMLElement[];
  portalSelectors?: string[];
}

interface ScopeRecord {
  root: HTMLElement;
  portals: Set<HTMLElement>;
  portalSelectors: string[];
  paused: boolean;
  returnFocus: HTMLElement | null;
}

function asElement(value: EventTarget | null): HTMLElement | null {
  if (typeof HTMLElement !== "undefined" && value instanceof HTMLElement) return value;
  if (value && typeof value === "object" && typeof (value as { contains?: unknown }).contains === "function") {
    return value as HTMLElement;
  }
  return null;
}

function eventTargets(eventOrTarget: Event | EventTarget | null): HTMLElement[] {
  if (typeof Event !== "undefined" && eventOrTarget instanceof Event) {
    const path = typeof eventOrTarget.composedPath === "function" ? eventOrTarget.composedPath() : [eventOrTarget.target];
    return path.map((value) => asElement(value as EventTarget | null)).filter((element): element is HTMLElement => Boolean(element));
  }
  const element = asElement(eventOrTarget as EventTarget | null);
  return element ? [element] : [];
}

export class InteractionScopeRegistry {
  private readonly scopes = new Map<string, ScopeRecord>();

  register(id: string, root: HTMLElement, options: InteractionScopeOptions = {}): () => void {
    this.release(id);
    this.scopes.set(id, {
      root,
      portals: new Set(options.portals || []),
      portalSelectors: options.portalSelectors || [],
      paused: false,
      returnFocus: null,
    });
    return () => this.release(id);
  }

  addPortal(id: string, portal: HTMLElement): void {
    this.scopes.get(id)?.portals.add(portal);
  }

  setPaused(id: string, paused: boolean): void {
    const scope = this.scopes.get(id);
    if (!scope || scope.paused === paused) return;
    scope.paused = paused;
    if (paused) {
      const active = scope.root.ownerDocument.activeElement;
      const activeElement = asElement(active);
      scope.returnFocus = activeElement && this.ownsElement(scope, activeElement) ? activeElement : null;
    }
  }

  release(id: string): void {
    this.scopes.delete(id);
  }

  owns(id: string, eventOrTarget: Event | EventTarget | null): boolean {
    const scope = this.scopes.get(id);
    if (!scope || scope.paused) return false;
    return eventTargets(eventOrTarget).some((target) => this.ownsElement(scope, target));
  }

  isActive(id: string, event?: Event): boolean {
    const scope = this.scopes.get(id);
    if (!scope || scope.paused) return false;
    if (event && this.owns(id, event)) return true;
    return this.ownsElement(scope, scope.root.ownerDocument.activeElement as HTMLElement | null);
  }

  getActiveScope(event?: Event): string | null {
    const ids = Array.from(this.scopes.keys()).reverse();
    return ids.find((id) => this.isActive(id, event)) || null;
  }

  restoreFocus(id: string): void {
    const scope = this.scopes.get(id);
    const target = scope?.returnFocus;
    scope && (scope.returnFocus = null);
    if (target?.isConnected) target.focus({ preventScroll: true });
  }

  private ownsElement(scope: ScopeRecord, target: HTMLElement | null): boolean {
    if (!target) return false;
    if (scope.root.contains(target) || Array.from(scope.portals).some((portal) => portal.contains(target))) return true;
    return scope.portalSelectors.some((selector) => Boolean(target.closest(selector)));
  }
}

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  if (typeof root.querySelectorAll !== "function") return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
    if (element.getAttribute("aria-hidden") === "true") return false;
    return element.getClientRects().length > 0 || element.offsetParent !== null || element === root.ownerDocument.activeElement;
  });
}

export interface FocusTrapOptions {
  onEscape?: () => void;
  returnFocus?: HTMLElement | null;
  restoreFocusOnCleanup?: boolean;
}

export function trapFocus(root: HTMLElement, options: FocusTrapOptions = {}): () => void {
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      options.onEscape?.();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = getFocusableElements(root);
    if (focusable.length === 0) {
      event.preventDefault();
      root.focus({ preventScroll: true });
      return;
    }
    const current = root.ownerDocument.activeElement as HTMLElement | null;
    const index = current ? focusable.indexOf(current) : -1;
    const nextIndex = event.shiftKey
      ? index <= 0 ? focusable.length - 1 : index - 1
      : index === focusable.length - 1 ? 0 : index + 1;
    event.preventDefault();
    focusable[nextIndex].focus({ preventScroll: true });
  };
  root.addEventListener("keydown", onKeydown, true);
  return () => {
    root.removeEventListener("keydown", onKeydown, true);
    if (options.restoreFocusOnCleanup && options.returnFocus?.isConnected) {
      options.returnFocus.focus({ preventScroll: true });
    }
  };
}
