// ───────────────────────────────────────────────────────────────────
// MODULE:    db-modal
// COMPONENT: shared modal base — host class and phone presentation
// ───────────────────────────────────────────────────────────────────
//
// Every modal in this plugin is a centred desktop dialog on a phone, because
// the sheet chrome used to be reachable only through the anchored positioner
// and a modal has no anchor to give it. That chrome now lives in the sheet
// module, so a modal can declare a presentation and get it.
//
// Three constraints shaped this, each learned from a real modal here:
//
//   - Presentation runs in `onOpen`, not the CONSTRUCTOR. A modal can be built
//     and never opened, so building it must not portal a panel or create a scrim.
//   - `close()` is NOT wrapped. FormulaModal overrides it to raise a confirm
//     dialog and defers `super.close()` until that resolves; a wrapper would
//     break the deferral.
//   - Presentation is DECLARED, never inferred. A workbench at 1,240px wide
//     crammed into a bottom sheet is worse than a full-screen dialog, so the
//     three large surfaces ask for `fullscreen` and the short ones ask for
//     `sheet`.
//
// It also fixes existing drift: the host class was copy-pasted onto thirteen
// modals and missing from four, so styling silently skipped those.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, Modal } from "obsidian";
import { isTouchDevice } from "../../data/touch-environment";
import { t } from "../../i18n";
import { applySheetChrome, attachSheetChromeToModal } from "../mobile-bottom-sheet";
import { keepSheetPlaced, placeSheet } from "../popover-position";
import { overlayStack } from "../overlay-stack";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

/**
 * How a modal presents on a touch surface. Desktop is unaffected by all three.
 *
 * `sheet` — short, form-like surfaces: confirmations, pickers, single-field editors.
 * `fullscreen` — workbenches whose desktop width is 860px or more. A sheet would crush them.
 * `dialog` — opt out; stays a centred dialog everywhere.
 */
export type DbModalPresentation = "sheet" | "fullscreen" | "dialog";

export const DB_MODAL_HOST_CLASS = "note-database-modal";
export const DB_MODAL_FULLSCREEN_CLASS = "db-modal-fullscreen";

// ───────────────────────────────────────────────────────────────────
// 3. BASE MODAL
// ───────────────────────────────────────────────────────────────────

export class DbModal extends Modal {
  private releaseSheetChrome?: () => void;
  private releaseSheetPlacement?: () => void;

  constructor(app: App, private readonly presentation: DbModalPresentation = "sheet") {
    super(app);
    this.contentEl.addClass(DB_MODAL_HOST_CLASS);
  }

  onOpen(): void {
    this.applyPresentation();
  }

  onClose(): void {
    this.releaseSheetPlacement?.();
    this.releaseSheetPlacement = undefined;
    this.releaseSheetChrome?.();
    this.releaseSheetChrome = undefined;
    // Take the chrome down whether or not a handle was held. The backdrop is a body sibling, so a
    // modal that closes by a path which never stored a teardown strands it over the whole app,
    // where it swallows every tap. `applySheetChrome` is idempotent, so asserting the off state
    // costs nothing on the ordinary path and is the only thing that runs on the unusual one.
    applySheetChrome(this.modalEl, false);
  }

  protected getSheetTitle(): string {
    const heading = Array.from(this.contentEl.querySelectorAll<HTMLElement>("h1, h2, h3"))
      .find((candidate) => !candidate.closest(".db-sheet-modal-header"))
      ?.textContent?.trim();
    return heading || t("menu.title");
  }

  /** Re-apply after a layout change, such as rotation moving the surface across the touch boundary. */
  protected applyPresentation(): void {
    const touch = isTouchDevice(this.contentEl);
    const hasSheetParent = Boolean(overlayStack.getTopSurfaceForDocument(this.modalEl.ownerDocument, { sheetsOnly: true }));
    const asSheet = touch && (this.presentation === "sheet" || hasSheetParent);
    const asFullscreen = touch && this.presentation === "fullscreen" && !hasSheetParent;

    this.modalEl.toggleClass(DB_MODAL_FULLSCREEN_CLASS, asFullscreen);
    this.releaseSheetPlacement?.();
    this.releaseSheetPlacement = undefined;
    this.releaseSheetChrome?.();
    this.releaseSheetChrome = undefined;
    if (!asSheet) {
      applySheetChrome(this.modalEl, false);
      return;
    }
    this.releaseSheetChrome = attachSheetChromeToModal(
      this.modalEl,
      true,
      () => this.close(),
      { getTitle: () => this.getSheetTitle() },
    );
    placeSheet(this.modalEl);
    this.releaseSheetPlacement = keepSheetPlaced(this.modalEl);
  }
}
