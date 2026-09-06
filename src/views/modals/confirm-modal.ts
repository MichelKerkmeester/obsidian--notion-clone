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

class ConfirmModal extends DbModal {
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

  openAndWait(): Promise<boolean | string> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      super.open();
    });
  }

  onOpen(): void {
    // Content is built BEFORE the base class presents the shell, not after: on a phone,
    // DbModal's shell (createSurfaceShell) scrapes the first heading in contentEl to title
    // the header it builds inside super.onOpen() itself — 044's grammar, carried through the
    // shared createSheetHeader machinery every phone sheet already reads rather than a second,
    // parallel header this modal would otherwise have to build and deduplicate against it.
    // Building afterward left the scrape empty on its first pass and the correct title arriving
    // only on the next microtask, a visible flash this ordering removes.
    this.contentEl.empty();
    this.contentEl.addClass("note-database-modal");
    this.contentEl.createEl("h3", { text: this.options.title });
    // db-panel-row is the sheet grammar's shared row shape (044): on a phone, the shell marks
    // this modal's own root as the .note-database-container the row's padding rule is scoped
    // under, so the confirm's body reads as a padded row like every other phone sheet's content
    // rather than as bare, unpadded text.
    this.contentEl.createDiv({ cls: "db-modal-help db-panel-row", text: this.options.message });

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
