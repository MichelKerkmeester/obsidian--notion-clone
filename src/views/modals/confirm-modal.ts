// ───────────────────────────────────────────────────────────────────
// MODULE:    confirm-modal
// COMPONENT: generic yes/no/secondary-action confirmation dialog
// ───────────────────────────────────────────────────────────────────
//
// `openAndWait` resolves to `false` on dismissal (backdrop click, Esc)
// as well as on explicit Cancel, so every caller can treat "no answer"
// and "said no" identically without a separate dismissal branch.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, TFile } from "obsidian";
import { t } from "../../i18n";
import { buildConfirmSheetBody } from "../confirm-sheet";
import { DbModal } from "./obnotion-modal";
import type { SurfaceShellRole } from "../surface-shell";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
  /** Optional secondary action button. When clicked, confirmWithModal returns its `value` string. */
  secondaryButton?: { text: string; value: string };
}

// ───────────────────────────────────────────────────────────────────
// 3. MODAL
// ───────────────────────────────────────────────────────────────────

export class ConfirmModal extends DbModal {
  private resolve?: (result: boolean | string) => void;

  constructor(
    app: App,
    private options: ConfirmModalOptions
  ) {
    super(app, "sheet");
  }

  protected getDeclaredTitle(): string {
    return this.options.title;
  }

  protected getShellRole(): SurfaceShellRole {
    return "dialog";
  }

  protected getFrameRole(): "card" {
    return "card";
  }

  openAndWait(): Promise<boolean | string> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      super.open();
    });
  }

  onOpen(): void {
    // Content is built before the base class presents the shell (super.onOpen(), below): the
    // title comes from getDeclaredTitle() above rather than a scrape of contentEl, so the
    // shell's phone header never has to wait on this body existing — the order is simply the
    // simpler one to read, not load-bearing the way it was before the title was declared.
    this.contentEl.empty();
    this.contentEl.addClass("obnotion-modal");
    buildConfirmSheetBody(this.contentEl, {
      title: this.options.title,
      message: this.options.message,
      cancelText: t("common.cancel"),
      confirmText: this.options.confirmText || t("common.delete"),
      danger: this.options.danger,
      secondaryButton: this.options.secondaryButton,
      stackedActions: true,
      onCancel: () => this.finish(false),
      onConfirm: () => this.finish(true),
      onSecondary: (value) => this.finish(value),
    });

    super.onOpen();
  }

  onClose(): void {
    super.onClose();
    this.contentEl.empty();
    this.finish(false);
  }

  private finish(result: boolean | string): void {
    const resolve = this.resolve;
    this.resolve = undefined;
    if (this.modalEl.isShown()) this.close();
    resolve?.(result);
  }
}

// ───────────────────────────────────────────────────────────────────
// 4. PUBLIC API
// ───────────────────────────────────────────────────────────────────

export function confirmWithModal(app: App, options: ConfirmModalOptions): Promise<boolean | string> {
  return new ConfirmModal(app, options).openAndWait();
}

/**
 * Whether a single-row delete can skip the confirm: only when its content can be read before the
 * file is trashed, so the toast's Undo has something to restore. Returns the snapshot itself on
 * success (the caller needs it for the history entry anyway) and `false` when the read fails,
 * which is the one case a single delete still asks the operator to confirm — a bulk delete or any
 * other destructive action that cannot be undone asks regardless of this predicate.
 */
export async function canUndoDeletion(app: App, file: TFile): Promise<string | false> {
  try {
    return await app.vault.cachedRead(file);
  } catch {
    return false;
  }
}
