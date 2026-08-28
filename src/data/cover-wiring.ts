// ───────────────────────────────────────────────────────────────────
// MODULE:    cover-wiring
// COMPONENT: Display-only cover failure handling shared by gallery and board renderers
// ───────────────────────────────────────────────────────────────────
//
// CoverImage remains the parser and resolver. This module only restores the
// existing empty-cover presentation when a browser cannot decode an image.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────
import { setIcon } from "obsidian";

// ───────────────────────────────────────────────────────────────────
// 2. MARK COVER IMAGE LOAD ERROR
// ───────────────────────────────────────────────────────────────────
/** Replace a failed cover image with the renderer's normal empty placeholder. */
export function markCoverImageLoadError(
  cover: HTMLElement,
  coverLink: HTMLElement,
  placeholderClass: string,
): void {
  coverLink.remove();
  cover.addClass("is-empty");
  setIcon(cover.createSpan({ cls: placeholderClass }), "image");
}
