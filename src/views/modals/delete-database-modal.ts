// ───────────────────────────────────────────────────────────────────
// MODULE:    delete-database-modal
// COMPONENT: destructive-action prompt distinguishing plugin-trash from system-trash deletion
// ───────────────────────────────────────────────────────────────────
//
// Two distinct destinations (plugin trash vs. OS trash) are surfaced as
// separate buttons rather than one delete action, because the plugin
// trash is recoverable from inside the vault and the system trash is
// not — collapsing them would hide which path is reversible.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, Setting } from "obsidian";
import { t } from "../../i18n";
import { DbModal } from "./db-modal";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface DeleteDatabaseModalResult {
  /** "plugin-trash" = 移至插件回收站；"system-trash" = 移至系统回收站 */
  action: "plugin-trash" | "system-trash";
  deleteFiles: boolean;
}

// ───────────────────────────────────────────────────────────────────
// 3. MODAL
// ───────────────────────────────────────────────────────────────────

export class DeleteDatabaseModal extends DbModal {
  private resolve?: (result: DeleteDatabaseModalResult | null) => void;
  private deleteFiles = false;

  constructor(
    app: App,
    private dbName: string,
    private fileCount: number
  ) {
    super(app, "sheet");
  }

  openAndWait(): Promise<DeleteDatabaseModalResult | null> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      super.open();
    });
  }

  onOpen(): void {
    super.onOpen();
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("note-database-modal");
    contentEl.addClass("db-delete-database-modal");
    contentEl.createEl("h3", { text: t("deleteDatabase.title", { name: this.dbName }) });

    contentEl.createDiv({
      cls: "db-delete-modal-info",
      text: t("deleteDatabase.info", { count: this.fileCount }),
    });

    if (this.fileCount > 0) {
      new Setting(contentEl)
        .setName(t("deleteDatabase.deleteFiles"))
        .setDesc(t("deleteDatabase.deleteFilesDesc", { count: this.fileCount }))
        .addToggle((toggle) => {
          toggle.setValue(this.deleteFiles);
          toggle.onChange((v) => { this.deleteFiles = v; });
        });
    }

    const btnRow = contentEl.createDiv({ cls: "db-delete-modal-buttons db-delete-modal-danger-row" });
    const primaryActions = btnRow.createDiv({ cls: "db-delete-modal-primary-actions" });

    primaryActions.createEl("button", { text: t("common.cancel") }).onclick = () => {
      this.resolve?.(null);
      this.close();
    };

    // 移至插件回收站（主操作）
    const pluginTrashBtn = primaryActions.createEl("button", {
      cls: "mod-cta",
      text: t("deleteDatabase.moveToPluginTrash"),
    });
    pluginTrashBtn.onclick = () => {
      this.resolve?.({ action: "plugin-trash", deleteFiles: this.deleteFiles });
      this.close();
    };

    // 移至系统回收站（危险操作）
    const systemTrashBtn = btnRow.createEl("button", {
      cls: "mod-warning",
      text: t("deleteDatabase.moveToSystemTrash"),
    });
    systemTrashBtn.onclick = () => {
      this.resolve?.({ action: "system-trash", deleteFiles: this.deleteFiles });
      this.close();
    };
  }

  onClose(): void {
    super.onClose();
    this.resolve?.(null);
    this.contentEl.empty();
  }
}
