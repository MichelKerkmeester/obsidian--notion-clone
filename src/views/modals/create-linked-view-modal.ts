// ───────────────────────────────────────────────────────────────────
// MODULE:    create-linked-view-modal
// COMPONENT: pick a source database, a view type and a name, then insert a fence
// ───────────────────────────────────────────────────────────────────
//
// A linked view is a new view on an existing database plus a fenced block
// that points at it. The phone layout uses the same sheet header and
// dropdown rows as the add-view sheet so the two pickers stay one grammar.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, Notice, TFile } from "obsidian";
import type { DataSource } from "../../data/data-source";
import type { DatabaseViewType } from "../../data/types";
import { t } from "../../i18n";
import { createDropdownField } from "../dropdown-field";
import { getViewTypeOptions } from "../toolbar-renderer";
import type { EmbeddedDatabaseEntry } from "../embedded-database-renderer";
import {
  appendLinkedViewToDatabase,
  buildLinkedViewFence,
  insertLinkedViewIntoFile,
  insertTextAtCursor,
  vaultFilesAdapter,
} from "./linked-view-block";
import { DbModal } from "./db-modal";

// ───────────────────────────────────────────────────────────────────
// 2. MODAL
// ───────────────────────────────────────────────────────────────────

export class CreateLinkedViewModal extends DbModal {
  private selectedPath = "";
  private selectedType: DatabaseViewType = "table";
  private name = "";

  constructor(
    app: App,
    private readonly dataSource: DataSource,
    private readonly entries: EmbeddedDatabaseEntry[],
    private readonly editor?: { replaceSelection(text: string): void } | null,
    private readonly destFile?: TFile | null,
  ) {
    super(app, "sheet");
    this.selectedPath = entries[0]?.sourcePath ?? "";
  }

  onOpen(): void {
    super.onOpen();
    this.renderForm();
  }

  protected getSheetTitle(): string {
    return t("linkedView.title");
  }

  private renderForm(): void {
    const { contentEl } = this;
    contentEl.empty();

    const dbRow = contentEl.createDiv({ cls: "db-panel-row" });
    createDropdownField({
      parent: dbRow,
      label: t("linkedView.sourceDatabase"),
      options: this.entries.map((entry) => ({
        value: entry.sourcePath,
        text: entry.config.name || entry.sourcePath,
      })),
      value: this.selectedPath,
      onChange: (value) => { this.selectedPath = value; },
    });

    const typeRow = contentEl.createDiv({ cls: "db-panel-row" });
    createDropdownField({
      parent: typeRow,
      label: t("linkedView.viewType"),
      options: getViewTypeOptions().map((option) => ({
        value: option.value,
        text: option.text,
        icon: option.icon,
      })),
      value: this.selectedType,
      onChange: (value) => { this.selectedType = value as DatabaseViewType; },
    });

    const nameRow = contentEl.createDiv({ cls: "db-panel-row" });
    nameRow.createEl("label", { text: t("linkedView.name") });
    const input = nameRow.createEl("input", {
      attr: { type: "text", placeholder: t("linkedView.namePlaceholder") },
    });
    input.oninput = () => { this.name = input.value; };

    const actions = contentEl.createDiv({ cls: "db-modal-actions" });
    actions.createEl("button", { text: t("common.cancel") }).onclick = () => this.close();
    actions.createEl("button", {
      cls: "mod-cta",
      text: t("linkedView.create"),
      attr: { type: "button" },
    }).onclick = () => { void this.submit(); };
  }

  private async submit(): Promise<void> {
    const entry = this.entries.find((candidate) => candidate.sourcePath === this.selectedPath);
    if (!entry) {
      new Notice(t("notice.linkedViewNoDatabase"));
      return;
    }
    const view = appendLinkedViewToDatabase(entry.config, this.selectedType, this.name);
    const file = this.app.vault.getAbstractFileByPath(entry.sourcePath);
    if (!(file instanceof TFile)) {
      new Notice(t("notice.linkedViewNoDatabase"));
      return;
    }
    try {
      await this.dataSource.updateViewDefFile(file, entry.config);
      const fence = buildLinkedViewFence(entry.config, view, entry.sourcePath);
      const inserted = insertTextAtCursor(this.editor, fence);
      if (!inserted && this.destFile) {
        await insertLinkedViewIntoFile(vaultFilesAdapter(this.app), this.destFile.path, fence);
      } else if (!inserted) {
        new Notice(t("notice.linkedViewNoEditor"));
        return;
      }
      new Notice(t("notice.linkedViewCreated"));
      this.close();
    } catch (err) {
      new Notice(t("errors.updateFailed", { error: String(err) }));
    }
  }
}

export function openCreateLinkedViewModal(
  app: App,
  dataSource: DataSource,
  entries: EmbeddedDatabaseEntry[],
  editor?: { replaceSelection(text: string): void } | null,
  destFile?: TFile | null,
): void {
  new CreateLinkedViewModal(app, dataSource, entries, editor, destFile).open();
}
