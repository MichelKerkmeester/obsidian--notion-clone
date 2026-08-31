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
//   - Setup runs in the CONSTRUCTOR, not `onOpen`. StatusPresetManagerModal
//     calls its own `onOpen()` as a re-render, so anything placed there runs
//     several times per interaction.
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
import { applySheetChrome, attachSheetDragToDismiss } from "../mobile-bottom-sheet";

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
  private releaseSheetDrag?: () => void;

  constructor(app: App, private readonly presentation: DbModalPresentation = "sheet") {
    super(app);
    // Obsidian builds containerEl/modalEl/contentEl during super(), so the nodes exist here. Doing
    // this now rather than in onOpen is deliberate — see the note at the top of the file.
    this.contentEl.addClass(DB_MODAL_HOST_CLASS);
    this.applyPresentation();
  }

  /** Re-apply after a layout change, such as rotation moving the surface across the touch boundary. */
  protected applyPresentation(): void {
    const touch = isTouchDevice(this.contentEl);
    const asSheet = touch && this.presentation === "sheet";
    const asFullscreen = touch && this.presentation === "fullscreen";

    applySheetChrome(this.modalEl, asSheet);
    this.modalEl.toggleClass(DB_MODAL_FULLSCREEN_CLASS, asFullscreen);

    // Wire the bar the line above just drew, because until now nothing did.
    //
    // Asking for `sheet` gave a modal a grab bar and no gesture, on every one of the surfaces that
    // present this way — an affordance that says the sheet can be pulled down and then ignores the
    // thumb. That is worse than drawing no bar at all: a dead control reads as a frozen app rather
    // than as a missing feature.
    //
    // `this.close()` rather than `super.close()` on purpose. One modal here overrides `close()` to
    // raise a confirm dialog before discarding edits, and a drag has to go through that override
    // for the same reason the button does — otherwise the gesture becomes the one way to lose work
    // silently.
    this.releaseSheetDrag?.();
    this.releaseSheetDrag = undefined;
    if (!asSheet) return;
    const handle = this.modalEl.querySelector<HTMLElement>(".db-mobile-bottom-sheet-handle");
    if (handle) this.releaseSheetDrag = attachSheetDragToDismiss(this.modalEl, handle, () => this.close());
  }
}
