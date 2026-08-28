// ───────────────────────────────────────────────────────────────────
// MODULE:    image-file-suggest-modal
// COMPONENT: fuzzy-search modal limited to vault image files
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, FuzzySuggestModal, TFile } from "obsidian";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const IMAGE_EXTENSION_RE = /^(?:png|jpe?g|gif|webp|svg|avif|bmp)$/i;

// ───────────────────────────────────────────────────────────────────
// 3. IMAGE FILE SUGGEST MODAL
// ───────────────────────────────────────────────────────────────────

export class ImageFileSuggestModal extends FuzzySuggestModal<TFile> {
  constructor(
    app: App,
    private readonly onChoose: (file: TFile) => void,
    placeholder: string,
  ) {
    super(app);
    this.setPlaceholder(placeholder);
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
