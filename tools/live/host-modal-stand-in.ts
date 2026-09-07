// ───────────────────────────────────────────────────────────────────
// MODULE:    host-modal-stand-in
// COMPONENT: the faithful Obsidian-modal DOM shape this repository's harnesses mount against
// ───────────────────────────────────────────────────────────────────
//
// Obsidian's real `Modal` wraps its own `modalEl` (`.modal`) in a `.modal-container` it appends
// to the body directly, with a `.modal-bg` backdrop beside it — and every `Modal` carries a
// title element and a close button of its own inside `modalEl`, whether or not a subclass ever
// uses them. `attachSheetChromeToModal` (`mobile-bottom-sheet.ts`) has to find and neutralise
// both, so a stand-in missing either would pass a check whether or not that neutralising code
// does anything at all — this is the one place that shape is built, so every caller measures
// the same chrome the production function actually has to hide.
//
// This module builds the shape only. It wires no close handler and attaches no sheet chrome —
// each caller does that with whatever body and close behaviour it needs, exactly as a real
// `Modal` subclass's own `onOpen` would.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export interface HostModalStandIn {
  /** The `.modal-container` Obsidian appends to `document.body` directly. */
  container: HTMLElement;
  /** The `.modal` element a real `Modal` calls `modalEl`. */
  modalEl: HTMLElement;
  /** The native, empty `.modal-title` every `Modal` carries whether or not a subclass sets one. */
  titleEl: HTMLElement;
  /** The `.modal-content` element a real `Modal` calls `contentEl` — where a subclass's own body goes. */
  contentEl: HTMLElement;
  /** The native `.modal-close-button`, unexposed by name in `obsidian.d.ts` but always present. */
  closeButton: HTMLElement;
}

// ───────────────────────────────────────────────────────────────────
// 2. THE STAND-IN
// ───────────────────────────────────────────────────────────────────

/**
 * Builds the faithful host-modal shape and appends it to `document.body` — always a direct
 * child of the body, never of whatever sheet happens to be open, which is where Obsidian's own
 * `Modal.open()` puts `containerEl` independent of any surface already on screen.
 *
 * Neither `modalEl` nor `titleEl`/`closeButton` carry plugin or theme styling of their own —
 * production leaves them sized and painted by Obsidian's own host CSS, which this repository
 * does not vendor. The explicit sizes below stand in for that, approximated rather than
 * measured, so each element renders as the present, non-collapsing thing it is on a device
 * instead of the zero-height, zero-width div a bare unstyled element would otherwise be.
 */
export function createHostModalStandIn(): HostModalStandIn {
  const container = document.createElement("div");
  container.className = "modal-container";

  const bg = document.createElement("div");
  bg.className = "modal-bg";
  container.appendChild(bg);

  const modalEl = document.createElement("div");
  modalEl.className = "modal";
  container.appendChild(modalEl);

  const titleEl = document.createElement("div");
  titleEl.className = "modal-title";
  titleEl.style.cssText = "display: block; height: 40px;";
  modalEl.appendChild(titleEl);

  const contentEl = document.createElement("div");
  contentEl.className = "modal-content obnotion-modal";
  modalEl.appendChild(contentEl);

  const closeButton = document.createElement("div");
  closeButton.className = "modal-close-button";
  closeButton.style.cssText = "display: block; width: 32px; height: 32px;";
  modalEl.appendChild(closeButton);

  document.body.appendChild(container);

  return { container, modalEl, titleEl, contentEl, closeButton };
}
