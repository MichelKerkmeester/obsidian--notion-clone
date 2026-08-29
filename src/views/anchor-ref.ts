// ───────────────────────────────────────────────────────────────────
// MODULE:    anchor-ref
// COMPONENT: logical anchor lease with a bounded render-epoch cache
// ───────────────────────────────────────────────────────────────────
//
// A renderer may replace the element that represents a row or event without
// changing the thing a surface belongs to. The lease keeps that logical
// identity stable and asks its resolver for the current element whenever a
// placement or renderer commit needs one.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { SurfaceRole } from "./surface-contract";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export type AnchorState = "open" | "anchored" | "anchor-missing" | "closed";

export type AnchorResolver = () => HTMLElement | null;

export type AnchorTimeoutHandle = number | ReturnType<typeof setTimeout>;

export interface AnchorTimer {
  setTimeout(callback: () => void, delayMs: number): AnchorTimeoutHandle;
  clearTimeout(handle: AnchorTimeoutHandle): void;
}

export interface AnchorStateChange {
  readonly from: AnchorState;
  readonly to: AnchorState;
}

export interface AnchorRefOptions {
  readonly scope: string;
  readonly rowPath?: string;
  readonly rowKey?: string;
  readonly cellKey?: string;
  readonly eventKey?: string;
  readonly role: SurfaceRole;
  readonly recordId?: string;
  readonly recordIdentity?: string;
  readonly resolver: AnchorResolver;
  readonly pendingTimeoutMs?: number;
  readonly fallback?: "close" | (() => void);
  readonly timer?: AnchorTimer;
  readonly onStateChange?: (change: AnchorStateChange) => void;
}

export const DEFAULT_ANCHOR_PENDING_TIMEOUT_MS = 250;

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

const defaultAnchorTimer: AnchorTimer = {
  setTimeout(callback, delayMs) {
    // eslint-disable-next-line obsidianmd/no-global-this
    return typeof window === "undefined" ? globalThis.setTimeout(callback, delayMs) : window.setTimeout(callback, delayMs);
  },
  clearTimeout(handle) {
    // eslint-disable-next-line obsidianmd/no-global-this
    if (typeof window === "undefined") globalThis.clearTimeout(handle);
    else window.clearTimeout(handle as number);
  },
};

function isLiveElement(element: HTMLElement | null): element is HTMLElement {
  return element !== null && element.isConnected !== false;
}

// ───────────────────────────────────────────────────────────────────
// 4. ANCHOR LEASE
// ───────────────────────────────────────────────────────────────────

export class AnchorRef {
  readonly scope: string;
  readonly rowPath?: string;
  readonly rowKey?: string;
  readonly cellKey?: string;
  readonly eventKey?: string;
  readonly role: SurfaceRole;
  readonly recordId?: string;
  readonly recordIdentity?: string;

  private readonly resolver: AnchorResolver;
  private readonly pendingTimeoutMs: number;
  private readonly fallback: "close" | (() => void);
  private readonly timer: AnchorTimer;
  private readonly stateListeners = new Set<(change: AnchorStateChange) => void>();
  private currentElement: HTMLElement | null = null;
  private currentState: AnchorState = "open";
  private pendingTimer: AnchorTimeoutHandle | undefined;

  constructor(options: AnchorRefOptions) {
    this.scope = options.scope;
    this.rowPath = options.rowPath;
    this.rowKey = options.rowKey;
    this.cellKey = options.cellKey;
    this.eventKey = options.eventKey;
    this.role = options.role;
    this.recordId = options.recordId ?? options.recordIdentity;
    this.recordIdentity = options.recordIdentity ?? options.recordId;
    this.resolver = options.resolver;
    this.pendingTimeoutMs = options.pendingTimeoutMs ?? DEFAULT_ANCHOR_PENDING_TIMEOUT_MS;
    if (!Number.isFinite(this.pendingTimeoutMs) || this.pendingTimeoutMs <= 0) {
      throw new RangeError("Anchor pending timeout must be a finite positive number");
    }
    this.fallback = options.fallback ?? "close";
    this.timer = options.timer ?? defaultAnchorTimer;
    if (options.onStateChange) this.stateListeners.add(options.onStateChange);
  }

  get state(): AnchorState {
    return this.currentState;
  }

  get element(): HTMLElement | null {
    return this.currentElement;
  }

  get pendingTimeout(): number {
    return this.pendingTimeoutMs;
  }

  resolve(): HTMLElement | null {
    if (this.currentState === "closed") return null;
    const nextElement = this.resolver();
    if (isLiveElement(nextElement)) {
      this.currentElement = nextElement;
      this.clearPendingTimer();
      if (this.currentState !== "anchored") this.transition("anchored");
      return nextElement;
    }

    this.currentElement = null;
    if (this.currentState !== "anchor-missing") {
      this.transition("anchor-missing");
      this.startPendingTimer();
    }
    return null;
  }

  refresh(): HTMLElement | null {
    return this.resolve();
  }

  onStateChange(listener: (change: AnchorStateChange) => void): () => void {
    if (this.currentState === "closed") return () => undefined;
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  release(): void {
    if (this.currentState === "closed") return;
    this.clearPendingTimer();
    this.currentElement = null;
    this.transition("closed");
    this.stateListeners.clear();
  }

  private transition(nextState: AnchorState): void {
    const previousState = this.currentState;
    if (previousState === nextState) return;
    this.currentState = nextState;
    const change = { from: previousState, to: nextState } as const;
    for (const listener of this.stateListeners) listener(change);
  }

  private startPendingTimer(): void {
    this.clearPendingTimer();
    this.pendingTimer = this.timer.setTimeout(() => {
      this.pendingTimer = undefined;
      if (this.currentState !== "anchor-missing") return;
      if (this.fallback === "close") this.release();
      else this.fallback();
    }, this.pendingTimeoutMs);
  }

  private clearPendingTimer(): void {
    if (this.pendingTimer === undefined) return;
    this.timer.clearTimeout(this.pendingTimer);
    this.pendingTimer = undefined;
  }
}

export function createAnchorRef(options: AnchorRefOptions): AnchorRef {
  return new AnchorRef(options);
}
