// ───────────────────────────────────────────────────────────────────
// MODULE:    settings-sub-sheet-modal
// COMPONENT: generic phone-chromed drill-in for a settings-sheet navigation row
// ───────────────────────────────────────────────────────────────────
//
// Turning an inline box into a navigation row that opens its own surface is the same shape every
// time — a title and a body-building callback — so rather than one bespoke modal class per row
// this is the single shell they all present through, following the same
// `createSurfaceShell`-backed `DbModal` pattern `confirm-modal.ts` already uses.
//
// The caller's `build` callback still runs as a closure over the `ViewConfigPanelRenderer`
// instance that opened it, so the existing row/tree-editor methods that closure calls keep
// working unchanged — this class owns presentation only, never the content.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App } from "obsidian";
import { DbModal } from "./obnotion-modal";

// ───────────────────────────────────────────────────────────────────
// 2. MODAL
// ───────────────────────────────────────────────────────────────────

export class SettingsSubSheetModal extends DbModal {
  constructor(
    app: App,
    private readonly title: string,
    private readonly build: (contentEl: HTMLElement) => void,
  ) {
    super(app, "sheet");
  }

  protected getDeclaredTitle(): string {
    return this.title;
  }

  onOpen(): void {
    this.contentEl.empty();
    this.contentEl.addClass("obnotion-modal");
    // The row/tree-editor methods this hosts render through the scoped `.obnotion-view-config-*`
    // and `.obnotion-source-rule-*` selectors, which `add-database-modal.ts` already proved need
    // an `.obnotion-container` ancestor to read at all outside the sheet those selectors were
    // written for.
    const host = this.contentEl.createDiv({ cls: "obnotion-container obnotion-settings-sub-sheet-body" });
    this.build(host);
    super.onOpen();
  }

  onClose(): void {
    super.onClose();
    this.contentEl.empty();
  }
}
