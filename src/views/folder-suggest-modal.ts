// ───────────────────────────────────────────────────────────────────
// MODULE:    folder-suggest-modal
// COMPONENT: fuzzy-search picker over the vault's folders
// ───────────────────────────────────────────────────────────────────
//
// The settings sheet's source-folder and new-note-folder rows read and write a plain string
// today, typed by hand into a text box — there is no picker anywhere in this plugin that lists
// the vault's own folders. This is that picker, built the same way `markdown-file-suggest-modal.ts`
// and `image-file-suggest-modal.ts` already pick a file: a `FuzzySuggestModal` over the vault's
// tree, phone-chromed through the shared surface shell.
//
// The vault root is `TFolder.path === ""` in Obsidian's own model; every caller of `onChoose`
// gets that empty string back for the root rather than a synthetic `"/"`, so the value it writes
// matches what an empty source-folder setting already meant before this picker existed.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, FuzzySuggestModal, TFolder } from "obsidian";
import { t } from "../i18n";
import { createSurfaceShell, type SurfaceShellHandle } from "./surface-shell";

// ───────────────────────────────────────────────────────────────────
// 2. MODAL
// ───────────────────────────────────────────────────────────────────

export class FolderSuggestModal extends FuzzySuggestModal<TFolder> {
  private shell: SurfaceShellHandle | undefined;

  constructor(
    app: App,
    private readonly onChoose: (folder: TFolder) => void,
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

  getItems(): TFolder[] {
    const root = this.app.vault.getRoot();
    const folders: TFolder[] = [root];
    const walk = (folder: TFolder) => {
      for (const child of folder.children) {
        if (child instanceof TFolder) {
          folders.push(child);
          walk(child);
        }
      }
    };
    walk(root);
    return folders.sort((left, right) => left.path.localeCompare(right.path));
  }

  getItemText(folder: TFolder): string {
    return folder.path === "" ? t("common.vaultRoot") : folder.path;
  }

  onChooseItem(folder: TFolder): void {
    this.onChoose(folder);
  }
}
