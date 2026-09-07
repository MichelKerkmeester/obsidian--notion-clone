// ───────────────────────────────────────────────────────────────────
// MODULE:    image-file-suggest-modal
// COMPONENT: fuzzy-search modal limited to vault image files
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, FuzzySuggestModal, TFile } from "obsidian";
import { createSurfaceShell, type SurfaceShellHandle } from "./surface-shell";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const IMAGE_EXTENSION_RE = /^(?:png|jpe?g|gif|webp|svg|avif|bmp)$/i;

// ───────────────────────────────────────────────────────────────────
// 3. IMAGE FILE SUGGEST MODAL
// ───────────────────────────────────────────────────────────────────

export class ImageFileSuggestModal extends FuzzySuggestModal<TFile> {
  private shell: SurfaceShellHandle | undefined;

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
    this.shell = createSurfaceShell({
      presentation: "sheet",
      element: this.modalEl,
      close: () => this.close(),
      title: this.placeholder,
      role: "panel",
    });
    this.shell.apply();
  }

  onClose(): void {
    this.shell?.destroy();
    this.shell = undefined;
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
