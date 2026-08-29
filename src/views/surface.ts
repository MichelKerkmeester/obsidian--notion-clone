// ───────────────────────────────────────────────────────────────────
// MODULE:    surface
// COMPONENT: explicit surface factory with owned mounting, tokens,
//            placement and shared interaction ownership
// ───────────────────────────────────────────────────────────────────
//
// A surface writes only to its own root. In particular, the body is a mount
// target, never a token or identity boundary, so opening and closing a portal
// cannot leave host-application state behind.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { AnchorRef } from "./anchor-ref";
import { InteractionScopeRegistry, trapFocus } from "./interaction-scope";
import { overlayStack } from "./overlay-stack";
import type { OverlayCloseReason } from "./overlay-stack";
import { positionToolbarPopover } from "./popover-position";
import type { ToolbarPopoverPositionOptions } from "./popover-position";
import {
  getSurfaceProducerDefinition,
  getSurfaceRoleDefaults,
  SURFACE_REGISTRY,
  SURFACE_TOKEN_KEYS,
  SURFACE_TOKEN_SNAPSHOT_VERSION,
} from "./surface-contract";
import type {
  ImplementedMount,
  SurfaceDismissal,
  SurfaceProducerId,
  SurfaceRole,
  SurfaceTokenKey,
  SurfaceTokenSnapshot,
} from "./surface-contract";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface SurfaceScope {
  readonly registry: InteractionScopeRegistry;
  readonly id: string;
}

export interface SurfaceDeclaration {
  // eslint-disable-next-line obsidianmd/prefer-active-doc
  readonly document: Document;
  readonly container: HTMLElement;
  readonly role: SurfaceRole;
  readonly producer: SurfaceProducerId;
  readonly mount: ImplementedMount;
  readonly anchor: AnchorRef;
  readonly scope: SurfaceScope;
  readonly parentId?: string;
  readonly className?: string;
  readonly id?: string;
}

export interface SurfaceHandle {
  readonly el: HTMLElement;
  readonly id: string;
  readonly role: SurfaceRole;
  readonly producer: SurfaceProducerId;
  readonly mount: ImplementedMount;
  readonly anchor: AnchorRef;
  readonly scope: SurfaceScope;
  place(): void;
  close(reason?: OverlayCloseReason): void;
  isOpen(): boolean;
  refreshTokens(): void;
  dispose(): void;
}

// ───────────────────────────────────────────────────────────────────
// 3. STATE
// ───────────────────────────────────────────────────────────────────

let nextSurfaceId = 0;

const ROLE_CLASSES: Readonly<Record<SurfaceRole, string>> = {
  menu: "db-menu",
  panel: "db-panel",
  dialog: "db-dialog",
  sheet: "db-sheet",
  submenu: "db-submenu",
};

const PRODUCER_CLASSES: Readonly<Record<SurfaceProducerId, string>> = {
  "column-menu": "db-owned-menu",
  "owned-menu": "db-owned-menu",
  "record-detail-panel": "db-record-detail-panel",
  "filter-panel": "db-filter-panel",
  "date-value-picker": "db-cell-edit-popover db-date-edit-popover db-date-value-popover",
};

interface TokenRefreshState {
  readonly refreshers: Set<() => void>;
  observer?: MutationObserver;
}

const tokenRefreshStates = new WeakMap<Document, TokenRefreshState>();

// ───────────────────────────────────────────────────────────────────
// 4. TOKEN SNAPSHOT
// ───────────────────────────────────────────────────────────────────

export function readSurfaceTokenSnapshot(container: HTMLElement): SurfaceTokenSnapshot {
  const view = container.ownerDocument.defaultView;
  if (!view?.getComputedStyle) throw new Error("A surface token snapshot requires a document window");
  const computed = view.getComputedStyle(container);
  const values: Partial<Record<SurfaceTokenKey, string>> = {};
  for (const key of SURFACE_TOKEN_KEYS) {
    const value = computed.getPropertyValue(key).trim();
    if (value) values[key] = value;
  }
  return {
    version: SURFACE_TOKEN_SNAPSHOT_VERSION,
    values,
  };
}

export function applySurfaceTokenSnapshot(root: HTMLElement, snapshot: SurfaceTokenSnapshot): void {
  root.setAttribute("data-db-surface-token-version", String(snapshot.version));
  for (const key of SURFACE_TOKEN_KEYS) {
    const value = snapshot.values[key];
    if (value) root.style.setProperty(key, value);
    else root.style.removeProperty(key);
  }
}

function subscribeToThemeChanges(doc: Document, refresh: () => void): () => void {
  let state = tokenRefreshStates.get(doc);
  if (!state) {
    state = { refreshers: new Set() };
    tokenRefreshStates.set(doc, state);
  }
  state.refreshers.add(refresh);

  const MutationObserverConstructor = doc.defaultView?.MutationObserver;
  if (!state.observer && MutationObserverConstructor) {
    state.observer = new MutationObserverConstructor(() => {
      for (const refresher of state?.refreshers || []) refresher();
    });
    const attributes = { attributes: true, attributeFilter: ["class", "style", "data-theme"] };
    if (doc.documentElement) state.observer.observe(doc.documentElement, attributes);
    if (doc.body) state.observer.observe(doc.body, attributes);
  }

  return () => {
    const current = tokenRefreshStates.get(doc);
    if (!current) return;
    current.refreshers.delete(refresh);
    if (current.refreshers.size > 0) return;
    current.observer?.disconnect();
    tokenRefreshStates.delete(doc);
  };
}

// ───────────────────────────────────────────────────────────────────
// 5. MOUNT AND PLACEMENT HELPERS
// ───────────────────────────────────────────────────────────────────

function assertImplementedMount(mount: string): asserts mount is ImplementedMount {
  if (mount === "shadowRoot") {
    throw new Error("The shadowRoot surface mount is declared but not implemented yet");
  }
  if (mount === "topLayer") {
    // Top-layer adoption changes stacking, light-dismiss, focus and event semantics at once, so it
    // is opt-in per role behind its own accessibility and fallback proof.
    throw new Error("The topLayer surface mount is capability-gated and not implemented yet");
  }
  if (mount !== "local" && mount !== "bodyPortal") {
    throw new Error(`Unsupported surface mount: ${mount}`);
  }
}

function getPlacementOptions(role: SurfaceRole): ToolbarPopoverPositionOptions | undefined {
  const width = getSurfaceRoleDefaults(role).width;
  if (width.kind === "fixed" || width.kind === "bounded") {
    return {
      minWidth: width.minWidth,
      preferredWidth: width.preferredWidth,
      maxWidth: width.maxWidth,
    };
  }
  return undefined;
}

function hasDismissal(role: SurfaceRole, dismissal: SurfaceDismissal): boolean {
  return getSurfaceRoleDefaults(role).dismissal.includes(dismissal);
}

function createSurfaceRoot(doc: Document, declaration: SurfaceDeclaration): HTMLElement {
  const root = doc.createElement("div");
  root.className = ["db-surface", ROLE_CLASSES[declaration.role], PRODUCER_CLASSES[declaration.producer], declaration.className]
    .filter((value): value is string => Boolean(value))
    .join(" ");
  root.setAttribute("data-db-surface", declaration.role);
  root.setAttribute("data-db-surface-producer", declaration.producer);
  root.setAttribute("role", declaration.role === "menu" || declaration.role === "submenu" ? "menu" : "dialog");
  root.tabIndex = -1;
  return root;
}

// ───────────────────────────────────────────────────────────────────
// 6. SURFACE FACTORY
// ───────────────────────────────────────────────────────────────────

export function openSurface(declaration: SurfaceDeclaration): SurfaceHandle {
  assertImplementedMount(declaration.mount);
  if (!Object.prototype.hasOwnProperty.call(SURFACE_REGISTRY, declaration.producer)) {
    throw new Error(`Unregistered surface producer: ${String(declaration.producer)}`);
  }
  const registryDefinition = getSurfaceProducerDefinition(declaration.producer);
  if (registryDefinition.role !== declaration.role) {
    throw new Error(`Surface producer ${declaration.producer} must use role ${registryDefinition.role}`);
  }
  if (registryDefinition.mount !== declaration.mount) {
    throw new Error(`Surface producer ${declaration.producer} must use mount ${registryDefinition.mount}`);
  }
  if (declaration.container.ownerDocument !== declaration.document) {
    throw new Error("Surface container and document must belong to the same window");
  }

  const id = declaration.id ?? `db-surface-${++nextSurfaceId}`;
  const root = createSurfaceRoot(declaration.document, declaration);
  const isPortal = declaration.mount === "bodyPortal";
  const tokenSource = declaration.container;
  const suppliedScope = declaration.scope;
  const scopeRegistry = suppliedScope.registry;
  const scopeId = suppliedScope.id;

  let open = true;
  let tokenSnapshot: SurfaceTokenSnapshot | undefined;
  let removeFocusTrap: (() => void) | undefined;
  let removeAnchorListener: () => void = () => undefined;
  let removeThemeListener: () => void = () => undefined;
  let portalRegistered = false;
  let overlayRegistration: { unregister(restoreFocus?: boolean): void } | undefined;

  const refreshTokens = (): void => {
    if (!isPortal || !open) return;
    tokenSnapshot = readSurfaceTokenSnapshot(tokenSource);
    applySurfaceTokenSnapshot(root, tokenSnapshot);
  };

  const close = (reason: OverlayCloseReason = "programmatic"): void => {
    if (!open) return;
    open = false;
    void reason;
    overlayRegistration?.unregister();
    removeFocusTrap?.();
    removeFocusTrap = undefined;
    removeThemeListener();
    removeAnchorListener();
    declaration.anchor.release();
    if (portalRegistered) {
      scopeRegistry.removePortal(scopeId, root);
      portalRegistered = false;
    }
    root.remove();
  };

  const place = (): void => {
    if (!open) return;
    const anchorElement = declaration.anchor.resolve();
    if (!anchorElement) {
      root.setCssProps({ visibility: "hidden" });
      return;
    }
    root.setCssProps({ visibility: "" });
    positionToolbarPopover(root, anchorElement, getPlacementOptions(declaration.role));
  };

  if (isPortal) {
    refreshTokens();
    declaration.document.body.appendChild(root);
    scopeRegistry.addPortal(scopeId, root);
    portalRegistered = true;
    removeThemeListener = subscribeToThemeChanges(declaration.document, refreshTokens);
  } else {
    declaration.container.appendChild(root);
  }

  overlayRegistration = overlayStack.register({
    id,
    panel: root,
    anchor: declaration.anchor.element ?? undefined,
    getAnchor: () => declaration.anchor.resolve(),
    parentId: declaration.parentId,
    close,
    closeOnOutsidePointerDown: hasDismissal(declaration.role, "outside-pointerdown") || hasDismissal(declaration.role, "scrim-tap"),
    closeOnEscape: hasDismissal(declaration.role, "escape"),
  });

  removeAnchorListener = declaration.anchor.onStateChange(({ to }) => {
    if (to === "closed" && open) close("programmatic");
  });
  if (getSurfaceRoleDefaults(declaration.role).focusMode === "trapped") {
    removeFocusTrap = trapFocus(root, { onEscape: () => close("escape") });
  }
  place();

  return {
    el: root,
    id,
    role: declaration.role,
    producer: declaration.producer,
    mount: declaration.mount,
    anchor: declaration.anchor,
    scope: suppliedScope,
    place,
    close,
    isOpen: () => open,
    refreshTokens,
    dispose: () => close("programmatic"),
  };
}
