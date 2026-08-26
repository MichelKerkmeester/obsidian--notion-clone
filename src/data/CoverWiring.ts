/**
 * Display-only cover failure handling shared by gallery and board renderers.
 *
 * CoverImage remains the parser and resolver.  This module only restores the
 * existing empty-cover presentation when a browser cannot decode an image.
 */

import { setIcon } from "obsidian";

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
