// ───────────────────────────────────────────────────────────────────
// MODULE:    hover-link-preview
// COMPONENT: delegates internal-link hover to Obsidian's native Page Preview
// ───────────────────────────────────────────────────────────────────
//
// markNoteHoverLink tags elements with data attributes instead of relying on
// a real `<a href>`, so Page Preview's hover-link event can be triggered from
// arbitrary non-anchor elements (spans, table cells, card titles).

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { App, Component, HoverParent } from "obsidian";
import { isElement, isHTMLElement } from "./dom-guards";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

export const NOTE_DATABASE_HOVER_LINK_SOURCE = "note-database";

const HOVER_LINK_SELECTOR = "[data-note-database-hover-link]";

// ───────────────────────────────────────────────────────────────────
// 3. HOVER LINK DELEGATION
// ───────────────────────────────────────────────────────────────────

/** Mark an element as an Obsidian-internal note link for delegated Page Preview. */
export function markNoteHoverLink(
  element: HTMLElement,
  linktext: string,
  sourcePath: string,
): void {
  element.setAttribute("data-note-database-hover-link", "true");
  element.setAttribute("data-note-database-linktext", linktext);
  element.setAttribute("data-note-database-source-path", sourcePath);
}

/**
 * Delegate internal-link hover events to Obsidian's native Page Preview plugin.
 * Modifier-key policy is intentionally owned by registerHoverLinkSource/Page Preview.
 */
export function installNoteHoverPreview(
  component: Component,
  container: HTMLElement,
  app: App,
  hoverParent: HoverParent,
): void {
  component.registerDomEvent(container, "mouseover", (event: MouseEvent) => {
    if (!isElement(event.target)) return;
    const targetEl = event.target.closest(HOVER_LINK_SELECTOR);
    if (!isHTMLElement(targetEl) || !container.contains(targetEl)) return;

    if (isElement(event.relatedTarget) && targetEl.contains(event.relatedTarget)) return;

    const linktext = targetEl.getAttribute("data-note-database-linktext");
    if (!linktext) return;
    app.workspace.trigger("hover-link", {
      event,
      source: NOTE_DATABASE_HOVER_LINK_SOURCE,
      hoverParent,
      targetEl,
      linktext,
      sourcePath: targetEl.getAttribute("data-note-database-source-path") || "",
    });
  });
}
