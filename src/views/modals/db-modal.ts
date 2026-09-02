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
    this.contentEl.addClass(DB_MODAL_HOST_CLASS);
  }

  onOpen(): void {
    this.applyPresentation();
  }

  onClose(): void {
    this.releaseSheetDrag?.();
    this.releaseSheetDrag = undefined;
    applySheetChrome(this.modalEl, false);
  }

  /** Re-apply after a layout change, such as rotation moving the surface across the touch boundary. */
  protected applyPresentation(): void {
    const touch = isTouchDevice(this.contentEl);
    const asSheet = touch && this.presentation === "sheet";
    const asFullscreen = touch && this.presentation === "fullscreen";

    applySheetChrome(this.modalEl, asSheet);
    this.modalEl.toggleClass(DB_MODAL_FULLSCREEN_CLASS, asFullscreen);

    // This call is what draws the grab bar, and that ordering is the point.
    //
    // Asking for `sheet` used to give a modal a bar and no gesture, on every one of the surfaces
    // that present this way — an affordance that says the sheet can be pulled down and then ignores
    // the thumb, which reads as a frozen app rather than a missing feature. The bar now comes from
    // the gesture, so a modal that skipped this line would get no bar rather than a dead one.
    //
    // `this.close()` rather than `super.close()` on purpose. One modal here overrides `close()` to
    // raise a confirm dialog before discarding edits, and a drag has to go through that override
    // for the same reason the button does — otherwise the gesture becomes the one way to lose work
    // silently.
    this.releaseSheetDrag?.();
    this.releaseSheetDrag = undefined;
    if (!asSheet) return;
    this.releaseSheetDrag = attachSheetDragToDismiss(this.modalEl, () => this.close());
  }
}
