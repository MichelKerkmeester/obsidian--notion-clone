// ───────────────────────────────────────────────────────────────────
// MODULE:    dom-guards
// COMPONENT: cross-window-safe type guards for DOM Node/Element/HTMLElement
// ───────────────────────────────────────────────────────────────────
//
// Obsidian extends DOM prototypes with an `.instanceOf()` method that stays
// correct across popout windows, where a plain `instanceof Node` fails
// because each window has its own global constructors. These guards prefer
// that extension and fall back to `instanceof` so callers get one
// cross-window-safe check.

// ───────────────────────────────────────────────────────────────────
// 1. GUARDS
// ───────────────────────────────────────────────────────────────────

function hasInstanceOf(value: unknown): value is Node {
  return (typeof Node !== "undefined" && value instanceof Node) || (typeof value === "object" && value !== null && "instanceOf" in value);
}

export function isElement(value: unknown): value is Element {
  return hasInstanceOf(value) && value.instanceOf(Element);
}

export function isHTMLElement(value: unknown): value is HTMLElement {
  return hasInstanceOf(value) && value.instanceOf(HTMLElement);
}
