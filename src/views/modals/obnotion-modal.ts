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
import { t } from "../../i18n";
import { applySheetChrome } from "../mobile-bottom-sheet";
import {
  createSurfaceShell,
  type SurfaceShellHandle,
  type SurfaceShellPresentation,
  type SurfaceShellRole,
} from "../surface-shell";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

/**
 * How a modal presents on a touch surface. Desktop is unaffected by all three.
 *
 * `sheet` — short, form-like surfaces: confirmations, pickers, single-field editors.
 * `fullscreen` — workbenches whose desktop width is 860px or more. A sheet would crush them.
 * `dialog` — opt out; stays a centred dialog everywhere.
 *
 * This is the shell's own presentation type, named for this call site rather than copied: the
 * two cannot drift apart because there is only one definition.
 */
export type DbModalPresentation = SurfaceShellPresentation;

export const DB_MODAL_HOST_CLASS = "note-database-modal";
export const DB_MODAL_FULLSCREEN_CLASS = "db-modal-fullscreen";

// ───────────────────────────────────────────────────────────────────
// 3. BASE MODAL
// ───────────────────────────────────────────────────────────────────

export class DbModal extends Modal {
  private shell?: SurfaceShellHandle;

  constructor(app: App, private readonly presentation: DbModalPresentation = "sheet") {
    super(app);
    this.contentEl.addClass(DB_MODAL_HOST_CLASS);
  }

  onOpen(): void {
    this.applyPresentation();
  }

  onClose(): void {
    this.shell?.destroy();
    this.shell = undefined;
    // Take the chrome down whether or not a handle was held. The backdrop is a body sibling, so a
    // modal that closes by a path which never stored a teardown strands it over the whole app,
    // where it swallows every tap. `applySheetChrome` is idempotent, so asserting the off state
    // costs nothing on the ordinary path and is the only thing that runs on the unusual one.
    applySheetChrome(this.modalEl, false);
  }

  /**
   * Recover a title from the content when the surface declares none of its own.
   *
   * This is the shell's counted fallback, not its own titling mechanism: a surface that wants
   * to be counted as declared supplies its own title to the shell instead of relying on this.
   */
  protected getSheetTitle(): string {
    const heading = Array.from(this.contentEl.querySelectorAll<HTMLElement>("h1, h2, h3"))
      .find((candidate) => !candidate.closest(".db-sheet-modal-header"))
      ?.textContent?.trim();
    return heading || t("menu.title");
  }

  /**
   * A surface's own title, declared rather than scraped.
   *
   * The default answers with nothing, which routes every undeclared surface through the
   * counted scrape fallback above. A subclass that knows its own title overrides this
   * instead of `getSheetTitle`, so the shell never has to ask the DOM for it.
   */
  protected getDeclaredTitle(): string | undefined {
    return undefined;
  }

  /**
   * What kind of surface this is, declared rather than left unset.
   *
   * The default answers with nothing: an undeclared role is a fact the shell carries, not a
   * guess it makes from the presentation.
   */
  protected getShellRole(): SurfaceShellRole | undefined {
    return undefined;
  }

  /**
   * A declared phone frame shape beside the floating/flush split, for a surface that wants the
   * card shape rather than the shell's own height inference. The default answers with
   * nothing, which keeps every existing modal on the inferred split.
   */
  protected getFrameRole(): "card" | undefined {
    return undefined;
  }

  /** Re-apply after a layout change, such as rotation moving the surface across the touch boundary. */
  protected applyPresentation(): void {
    if (!this.shell) {
      this.shell = createSurfaceShell({
        presentation: this.presentation,
        element: this.modalEl,
        close: () => this.close(),
        title: this.getDeclaredTitle(),
        role: this.getShellRole(),
        frameRole: this.getFrameRole(),
        getFallbackTitle: () => this.getSheetTitle(),
      });
    }
    this.shell.apply();
    this.modalEl.toggleClass(DB_MODAL_FULLSCREEN_CLASS, this.shell.isFullscreen);
  }
}
