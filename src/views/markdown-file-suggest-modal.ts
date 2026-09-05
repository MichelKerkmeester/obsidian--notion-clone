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
import { keepSheetPlaced, placeSheet } from "./popover-position";

// ───────────────────────────────────────────────────────────────────
// 2. MODAL
// ───────────────────────────────────────────────────────────────────

export class MarkdownFileSuggestModal extends FuzzySuggestModal<TFile> {
  private releaseSheetChrome: (() => void) | undefined;

  constructor(
    app: App,
    private readonly onChoose: (file: TFile) => void,
    private readonly placeholder: string,
  ) {
    super(app);
    this.setPlaceholder(placeholder);
  }

  onOpen(): void {
    void super.onOpen();
    const asSheet = isTouchDevice(this.contentEl);
    this.releaseSheetChrome = attachSheetChromeToModal(
      this.modalEl,
      asSheet,
      () => this.close(),
      {
        title: this.placeholder,
        getTitle: () => this.titleEl?.textContent?.trim() || this.placeholder,
      },
    );
    if (asSheet) {
      placeSheet(this.modalEl);
      this.releaseSheetPlacement = keepSheetPlaced(this.modalEl);
    }
  }

  onClose(): void {
    this.releaseSheetPlacement?.();
    this.releaseSheetPlacement = undefined;
    this.releaseSheetChrome?.();
    this.releaseSheetChrome = undefined;
    super.onClose();
  }

  private releaseSheetPlacement: (() => void) | undefined;

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
