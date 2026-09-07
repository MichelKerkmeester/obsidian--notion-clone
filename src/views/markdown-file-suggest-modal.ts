// ───────────────────────────────────────────────────────────────────
// MODULE:    markdown-file-suggest-modal
// COMPONENT: fuzzy-search picker over the vault's markdown files
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, FuzzySuggestModal, TFile } from "obsidian";
import { createSurfaceShell, type SurfaceShellHandle } from "./surface-shell";

// ───────────────────────────────────────────────────────────────────
// 2. MODAL
// ───────────────────────────────────────────────────────────────────

export class MarkdownFileSuggestModal extends FuzzySuggestModal<TFile> {
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
