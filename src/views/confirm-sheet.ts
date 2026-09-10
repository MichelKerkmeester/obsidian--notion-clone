// ───────────────────────────────────────────────────────────────────
// MODULE:    confirm-sheet
// COMPONENT: the shared confirm body — title, message row and actions row
// ───────────────────────────────────────────────────────────────────
//
// `ConfirmModal` already gets its handle, header, placement, keyboard avoidance and
// stacked-over-parent behaviour from the shell (`createSurfaceShell`, composed through
// `DbModal`). What it built by hand was the content inside that chrome — a title, a
// message row and an actions row — and a live-lane probe that measures the same shape
// had to rebuild that markup itself, by hand, to stand in for a modal it cannot mount.
// Two hand-built copies of one dialog's body is the shape this module removes: one
// builder, read by the production modal and by the probe that measures it.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export interface ConfirmSheetSecondaryAction {
  text: string;
  value: string;
}

export interface ConfirmSheetBodyOptions {
  title: string;
  message: string;
  cancelText: string;
  confirmText: string;
  /** Styles the confirm action as the destructive one. */
  danger?: boolean;
  /** An optional third button between cancel and confirm. */
  secondaryButton?: ConfirmSheetSecondaryAction;
  /**
   * Stacks the actions row full width instead of the side-by-side, right-aligned row every other
   * modal footer keeps. Scoped to the confirm rather than to a platform: Notion's own
   * desktop confirm stacks too, while its non-confirm editors stay side-by-side.
   */
  stackedActions?: boolean;
  onCancel(): void;
  onConfirm(): void;
  onSecondary?(value: string): void;
}

// ───────────────────────────────────────────────────────────────────
// 1b. THE PRIMARY-ACTION PILL
// ───────────────────────────────────────────────────────────────────
//
// The full-width, disabled-until-valid commit row a phone form sheet ends with instead of a
// button row — measured at 341.7 x 50.0pt with ~21pt insets. One builder so the geometry, the
// class and the disabled styling live in one place a lane row can import and assert against,
// rather than each form re-declaring its own button and drifting from the measured shape.

export const SHELL_PRIMARY_PILL_CLASS = "obnotion-shell-primary-pill";

export interface PrimaryActionPillOptions {
  text: string;
  disabled?: boolean;
  onClick(): void;
}

/** Build the full-width primary-action pill into an already-chromed sheet body. */
export function buildPrimaryActionPill(container: HTMLElement, options: PrimaryActionPillOptions): HTMLButtonElement {
  const pill = container.createEl("button", {
    cls: SHELL_PRIMARY_PILL_CLASS,
    text: options.text,
    attr: { type: "button" },
  });
  pill.disabled = Boolean(options.disabled);
  pill.onclick = () => options.onClick();
  return pill;
}

// ───────────────────────────────────────────────────────────────────
// 2. BODY
// ───────────────────────────────────────────────────────────────────

/**
 * Build a confirm dialog's content into an already-chromed host: a declared title, the
 * message as a padded row, and an actions row. In the stacked variant the destructive
 * action leads and Cancel closes the column — the reading a phone reader gets, and the one
 * every captured stacked reference agrees on. The side-by-side variant keeps its
 * cancel-then-confirm reading, an optional secondary action sitting between the two.
 */
export function buildConfirmSheetBody(host: HTMLElement, options: ConfirmSheetBodyOptions): void {
  host.createEl("h3", { text: options.title });
  // obnotion-panel-row is the sheet grammar's shared row shape: on a phone, the shell marks
  // this modal's own root as the .obnotion-container the row's padding rule is scoped
  // under, so the confirm's body reads as a padded row like every other phone sheet's content
  // rather than as bare, unpadded text.
  host.createDiv({ cls: "obnotion-modal-help obnotion-panel-row", text: options.message });

  const actions = host.createDiv({
    cls: options.stackedActions ? "obnotion-modal-actions obnotion-confirm-stacked" : "obnotion-modal-actions",
  });
  const addCancel = (): void => {
    actions.createEl("button", {
      text: options.cancelText,
      attr: { type: "button" },
    }).onclick = () => options.onCancel();
  };
  const addSecondary = (): void => {
    if (!options.secondaryButton) return;
    const secondary = options.secondaryButton;
    actions.createEl("button", {
      text: secondary.text,
      attr: { type: "button" },
    }).onclick = () => options.onSecondary?.(secondary.value);
  };
  const addConfirm = (): void => {
    actions.createEl("button", {
      cls: options.danger ? "mod-warning" : "mod-cta",
      text: options.confirmText,
      attr: { type: "button" },
    }).onclick = () => options.onConfirm();
  };
  if (options.stackedActions) {
    // Every captured stacked confirm reads destructive-then-Cancel: the destructive action is
    // the card's first, most prominent row, and Cancel — the step backwards — sits beneath it.
    // The side-by-side footer below keeps its trailing-confirm reading; only the stacked
    // layout inverts.
    addConfirm();
    addSecondary();
    addCancel();
    return;
  }
  addCancel();
  addSecondary();
  addConfirm();
}
