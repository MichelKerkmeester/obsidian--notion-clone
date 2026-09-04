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
