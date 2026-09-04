// ───────────────────────────────────────────────────────────────────
// MODULE:    unstyled-links-measure
// COMPONENT: the user-agent-default classification unstyled-links.mjs applies to a rendered link
// ───────────────────────────────────────────────────────────────────
//
// Extracted for the same reason as touch-target-measure.mjs: the fixture pass and the
// constructed-renderer pass must classify a computed colour identically, and the two passes run in
// different realms (a Playwright-stringified function versus an esbuild-compiled bundle) that a
// single shared function serves without becoming two functions that could disagree.
//
// `classifyLinkColour` is the pure part and carries its own tests. The walk in
// `measureLinkColours` needs a live `document` and `getComputedStyle`, so it is exercised by the
// real browser run instead.

// ───────────────────────────────────────────────────────────────────
// 1. PURE CLASSIFICATION
// ───────────────────────────────────────────────────────────────────

/** `null` when the colour is not one of the tracked user-agent defaults. */
export function classifyLinkColour(colour, defaults) {
  return defaults[colour] || null;
}

// ───────────────────────────────────────────────────────────────────
// 2. DOM WALK (browser-only)
// ───────────────────────────────────────────────────────────────────

/**
 * Measures every link-like element's computed colour against the tracked user-agent defaults.
 * `source` tags each row so a caller mixing fixture and constructed-renderer measurements in one
 * report can tell them apart without re-deriving it from context.
 */
export function measureLinkColours({ id, themeName, defaults, source }) {
  const rows = [];
  let seen = 0;
  for (const el of document.querySelectorAll("a, [href], .internal-link")) {
    const box = el.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) continue;
    seen += 1;
    const colour = getComputedStyle(el).color;
    const why = classifyLinkColour(colour, defaults);
    if (!why) continue;
    rows.push({
      scenario: id,
      source,
      theme: themeName,
      colour,
      why,
      cls: String(el.className).slice(0, 60) || el.tagName.toLowerCase(),
      text: (el.textContent || "").trim().slice(0, 24),
    });
  }
  return { rows, seen };
}
