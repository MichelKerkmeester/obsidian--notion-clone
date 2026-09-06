// ───────────────────────────────────────────────────────────────────
// MODULE:    toast
// COMPONENT: the shared feedback surface for a completed or failed operation
// ───────────────────────────────────────────────────────────────────
//
// Every operation notice in this plugin used to raise a bare `Notice`, which cannot carry a
// button — so a message promising "Undo to keep it a gallery" had nowhere to put the Undo. This
// gives every owned call site one surface: a severity icon paired with colour (never colour
// alone), an optional inline action, and a close control a keyboard can reach.
//
// Multiple toasts share one stack, anchored at the same corner. Only the frontmost card renders
// its content; the rest wait behind it in DOM order, so an operation that fires twice in quick
// succession does not tile two full cards on screen. A success toast clears itself; an error one
// waits for the reader to act or dismiss it, because a failure that vanishes on its own is a
// failure nobody had to see.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon } from "obsidian";
import { t } from "../i18n";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export type ToastSeverity = "success" | "error";

export interface ToastAction {
  /** Visible label. Also the accessible name, so it must say what the action does. */
  label: string;
  /** Lucide icon id for the action's leading glyph. Omit for a text-only action. */
  icon?: string;
  onClick(): void | Promise<void>;
}

export interface ToastOptions {
  severity: ToastSeverity;
  message: string;
  /** Omit for a plain notice with no inline action. */
  action?: ToastAction;
  /**
   * Mount the card here instead of the shared body-anchored stack, as a single-slot host the
   * caller positions itself — the per-view operation-result rail's own fixed corner, kept where
   * it always sat rather than moved to the shared stack's. Omit for the floating stack every
   * other owned site uses.
   */
  container?: HTMLElement;
}

export interface ToastHandle {
  /** Dismiss this toast. Safe to call after it has already closed on its own. */
  close(): void;
}

// ───────────────────────────────────────────────────────────────────
// 3. STACK
// ───────────────────────────────────────────────────────────────────

/** A plain success toast — no action attached — clears itself after this long: the budget the
 *  operation-result rail already runs. */
const AUTO_DISMISS_MS = 2200;

/**
 * A success toast that carries an action (an Undo, a Retry) stays connected this much longer
 * instead: an affordance the reader has not yet had time to reach for is not one they can act on.
 * Inferred rather than measured — the shortest window that comfortably covers reading the
 * message, aiming for the button and pressing it, without claiming parity with any reference.
 */
const ACTION_DISMISS_MS = 5000;

const stacks = new WeakMap<Document, HTMLElement>();

/**
 * The one stack element a document mounts its toasts into, created on first use.
 *
 * Held per-document rather than as a single module-level singleton so a popout window gets its
 * own anchored corner instead of reaching back into the main window's body.
 */
function getStack(doc: Document): HTMLElement {
  const existing = stacks.get(doc);
  if (existing?.isConnected) return existing;
  const stack = doc.body.createDiv({ cls: "db-surface db-toast-stack" });
  stacks.set(doc, stack);
  return stack;
}

// ───────────────────────────────────────────────────────────────────
// 4. TOAST
// ───────────────────────────────────────────────────────────────────

/** Raise a severity toast on `doc`'s stack, with an optional clickable action. */
export function showToast(doc: Document, options: ToastOptions): ToastHandle {
  const stack = options.container ?? getStack(doc);
  // A caller-supplied container is a single-slot placement, not a stack: clear whatever it held
  // before, rather than layer a second card the collapsed-stack trick below was never meant for.
  if (options.container) stack.empty();
  const card = stack.createDiv({
    cls: `db-toast is-${options.severity}${options.container ? " is-inline" : ""}`,
    attr: { role: "status", "aria-live": "polite", "aria-atomic": "true" },
  });
  // Prepended, not appended: the stack renders only its first child, so the newest toast has to
  // become that first child rather than queue behind whatever is already showing. Harmless on a
  // single-slot container, which was just emptied above and so has only this one child anyway.
  stack.prepend(card);

  const header = card.createDiv({ cls: "db-toast-header" });
  setIcon(header.createDiv({ cls: "db-toast-icon" }), options.severity === "success" ? "check" : "alert-triangle");
  header.createDiv({ cls: "db-toast-message", text: options.message });
  const closeBtn = header.createEl("button", {
    cls: "db-toast-close",
    attr: { type: "button", "aria-label": t("common.close") },
  });
  setIcon(closeBtn, "x");

  const actions = card.createDiv({ cls: "db-toast-actions" });

  let timer: number | null = null;
  const clearAutoDismiss = () => {
    if (timer === null) return;
    window.clearTimeout(timer);
    timer = null;
  };
  const close = () => {
    clearAutoDismiss();
    card.remove();
  };
  closeBtn.onclick = () => close();

  if (options.action) {
    const actionBtn = actions.createEl("button", {
      cls: "db-toast-action",
      attr: { type: "button" },
    });
    if (options.action.icon) setIcon(actionBtn.createSpan(), options.action.icon);
    actionBtn.createSpan({ text: options.action.label });
    actionBtn.onclick = () => {
      // Fire-and-forget, matching the operation-result rail's own Undo/Retry handler: the toast
      // closes on the click that triggered the action, not on the action's own completion.
      void options.action?.onClick();
      close();
    };
  }

  if (options.severity === "success") {
    timer = window.setTimeout(close, options.action ? ACTION_DISMISS_MS : AUTO_DISMISS_MS);
  }

  return { close };
}
