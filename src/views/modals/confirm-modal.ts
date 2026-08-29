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

import { App } from "obsidian";
import { t } from "../../i18n";
import { DbModal } from "./db-modal";

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

class ConfirmModal extends DbModal {
  private resolve?: (result: boolean | string) => void;

  constructor(
    app: App,
    private options: ConfirmModalOptions
  ) {
    super(app, "sheet");
  }

  openAndWait(): Promise<boolean | string> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      super.open();
    });
  }

  onOpen(): void {
    this.contentEl.empty();
    this.contentEl.addClass("note-database-modal");
    this.contentEl.createEl("h3", { text: this.options.title });
    this.contentEl.createDiv({ cls: "db-modal-help", text: this.options.message });

    const actions = this.contentEl.createDiv({ cls: "db-modal-actions" });
    actions.createEl("button", {
      text: t("common.cancel"),
      attr: { type: "button" },
    }).onclick = () => this.finish(false);

    if (this.options.secondaryButton) {
      actions.createEl("button", {
        text: this.options.secondaryButton.text,
        attr: { type: "button" },
      }).onclick = () => this.finish(this.options.secondaryButton!.value);
    }

    actions.createEl("button", {
      cls: this.options.danger ? "mod-warning" : "mod-cta",
      text: this.options.confirmText || t("common.delete"),
      attr: { type: "button" },
    }).onclick = () => this.finish(true);
  }

  onClose(): void {
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
