// ───────────────────────────────────────────────────────────────────
// MODULE:    markdown-file-suggest-modal
// COMPONENT: fuzzy-search picker over the vault's markdown files
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, FuzzySuggestModal, TFile } from "obsidian";
import { isTouchDevice } from "../data/touch-environment";
import { attachSheetChromeToModal } from "./mobile-bottom-sheet";

// ───────────────────────────────────────────────────────────────────
// 2. MODAL
// ───────────────────────────────────────────────────────────────────

export class MarkdownFileSuggestModal extends FuzzySuggestModal<TFile> {
  private releaseSheetChrome: (() => void) | undefined;

  constructor(
    app: App,
    private readonly onChoose: (file: TFile) => void,
    placeholder: string,
  ) {
    super(app);
    this.setPlaceholder(placeholder);
  }

  onOpen(): void {
    void super.onOpen();
    // The suggest behaviour is Obsidian's and stays; only the modal's own element wears the
    // sheet chrome, the same move the plugin's modal base makes for its own subclasses.
    this.releaseSheetChrome = attachSheetChromeToModal(
      this.modalEl,
      isTouchDevice(this.contentEl),
      () => this.close(),
    );
  }

  onClose(): void {
    this.releaseSheetChrome?.();
    this.releaseSheetChrome = undefined;
    super.onClose();
  }

  getItems(): TFile[] {
    return this.app.vault.getMarkdownFiles()
      .sort((left, right) => left.path.localeCompare(right.path));
  }

  getItemText(file: TFile): string {
    return file.path;
  }

  onChooseItem(file: TFile): void {
    this.onChoose(file);
  }
}
