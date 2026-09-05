// ───────────────────────────────────────────────────────────────────
// MODULE:    image-file-suggest-modal
// COMPONENT: fuzzy-search modal limited to vault image files
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, FuzzySuggestModal, TFile } from "obsidian";
import { isTouchDevice } from "../data/touch-environment";
import { attachSheetChromeToModal } from "./mobile-bottom-sheet";
import { keepSheetPlaced, placeSheet } from "./popover-position";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const IMAGE_EXTENSION_RE = /^(?:png|jpe?g|gif|webp|svg|avif|bmp)$/i;

// ───────────────────────────────────────────────────────────────────
// 3. IMAGE FILE SUGGEST MODAL
// ───────────────────────────────────────────────────────────────────

export class ImageFileSuggestModal extends FuzzySuggestModal<TFile> {
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
    return this.app.vault.getFiles()
      .filter((file) => IMAGE_EXTENSION_RE.test(file.extension))
      .sort((left, right) => left.path.localeCompare(right.path));
  }

  getItemText(file: TFile): string {
    return file.path;
  }

  onChooseItem(file: TFile): void {
    this.onChoose(file);
  }
}
