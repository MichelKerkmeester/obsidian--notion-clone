// ───────────────────────────────────────────────────────────────────
// MODULE:    csv-markdown-export-modal
// COMPONENT: export-options prompt for the CSV+Markdown zip export
// ───────────────────────────────────────────────────────────────────
//
// Resolves to `null` on close-without-confirming (rather than throwing),
// so callers can treat a dismissed modal the same as an explicit cancel.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { t } from "../../i18n";
import { CsvMarkdownExportOptions } from "../../data/csv-markdown-zip-export";
import { DbModal } from "./db-modal";
import { createCheckbox } from "../checkbox";

// ───────────────────────────────────────────────────────────────────
// 2. MODAL
// ───────────────────────────────────────────────────────────────────

export class CsvMarkdownExportModal extends DbModal {
  private resolve?: (options: CsvMarkdownExportOptions | null) => void;
  private includeFrontmatter = true;

  openAndWait(): Promise<CsvMarkdownExportOptions | null> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      super.open();
    });
  }

  onOpen(): void {
    this.contentEl.empty();
    this.contentEl.addClass("note-database-modal");
    this.contentEl.createEl("h3", { text: t("csvMarkdownExport.title") });
    this.contentEl.createDiv({ cls: "db-panel-empty", text: t("csvMarkdownExport.desc") });

    this.renderCheckboxOption(t("csvMarkdownExport.includeFrontmatter"), this.includeFrontmatter, (value) => {
      this.includeFrontmatter = value;
    });

    const actions = this.contentEl.createDiv({ cls: "db-modal-actions" });
    actions.createEl("button", { text: t("common.cancel") }).onclick = () => this.close();
    actions.createEl("button", {
      cls: "mod-cta",
      text: t("csvMarkdownExport.export"),
      attr: { type: "button" },
    }).onclick = () => {
      const resolve = this.resolve;
      this.resolve = undefined;
      this.close();
      resolve?.({
        includeFrontmatter: this.includeFrontmatter,
      });
    };
  }

  private renderCheckboxOption(text: string, checked: boolean, onChange: (value: boolean) => void): void {
    const row = this.contentEl.createDiv({ cls: "db-csv-markdown-option-row" });
    const label = row.createEl("label", { cls: "db-csv-markdown-option-label" });
    const checkbox = createCheckbox(label, { role: "field" });
    checkbox.checked = checked;
    checkbox.onchange = () => onChange(checkbox.checked);
    label.createSpan({ text });
  }

  onClose(): void {
    this.contentEl.empty();
    this.resolve?.(null);
    this.resolve = undefined;
  }
}
