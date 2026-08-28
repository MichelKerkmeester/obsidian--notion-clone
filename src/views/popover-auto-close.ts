// ───────────────────────────────────────────────────────────────────
// MODULE:    popover-auto-close
// COMPONENT: legacy adapter registering a popover with the overlay stack
// ───────────────────────────────────────────────────────────────────
//
// Callers still pass `delayMs` and `isActiveTarget` from when this
// installed its own idle-timeout close logic; both are now no-ops kept
// only so existing call sites do not need a signature change, since
// dismissal has fully moved to overlay-stack's LIFO Escape/outside-click
// handling.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { overlayStack } from "./overlay-stack";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface PopoverAutoCloseOptions {
  panel: HTMLElement;
  anchorEl?: HTMLElement;
  close: () => void;
  parentId?: string;
  delayMs?: number;
  closeOnOutsidePointerDown?: boolean;
  closeOnEscape?: boolean;
  isActiveTarget?(target: EventTarget | null): boolean;
}

// ───────────────────────────────────────────────────────────────────
// 3. PUBLIC API
// ───────────────────────────────────────────────────────────────────

export function installPopoverAutoClose(options: PopoverAutoCloseOptions): () => void {
  // Kept for source compatibility with callers that used to pass a timeout.
  // Dismissal is now owned by the shared stack and never depends on elapsed time.
  void options.delayMs;
  void options.isActiveTarget;
  const registration = overlayStack.register({
    panel: options.panel,
    anchor: options.anchorEl,
    parentId: options.parentId,
    close: options.close,
    closeOnOutsidePointerDown: options.closeOnOutsidePointerDown,
    closeOnEscape: options.closeOnEscape,
  });
  let cleaned = false;
  return () => {
    if (cleaned) return;
    cleaned = true;
    registration.unregister();
  };
}
