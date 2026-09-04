// ───────────────────────────────────────────────────────────────────
// MODULE:    touch-target-measure
// COMPONENT: the floor-classification measurement touch-targets.mjs applies to a rendered box
// ───────────────────────────────────────────────────────────────────
//
// Extracted so the fixture pass and the constructed-renderer pass measure identically: one
// function, run in the browser both ways — Playwright stringifies it into the fixture page, and
// esbuild compiles it into the constructed-renderer bundle. A copy of this in each pass could
// silently drift into two different floors; a shared function cannot.
//
// `classifyBox` and `findDeclaredExcuse` are the pure parts and carry their own tests. The walk in
// `measureInteractiveBoxes` needs a live `document`, so it is exercised by the real browser run
// instead.

// ───────────────────────────────────────────────────────────────────
// 1. PURE CLASSIFICATION
// ───────────────────────────────────────────────────────────────────

/** `null` when the box clears WCAG 2.5.5 Enhanced outright — nothing to report either way. */
export function classifyBox(width, height, floor, enhanced) {
  const short = Math.min(width, height);
  if (short >= enhanced) return null;
  return { belowFloor: short < floor };
}

/** The first declared exemption whose class fragment appears in the element's class list, if any. */
export function findDeclaredExcuse(classes, declared) {
  return declared.find((entry) => classes.includes(entry.match)) || null;
}

// ───────────────────────────────────────────────────────────────────
// 2. DOM WALK (browser-only)
// ───────────────────────────────────────────────────────────────────

/**
 * Measures every interactive element the selector matches against the floor. `source` tags each
 * row so a caller mixing fixture and constructed-renderer measurements in one report can tell them
 * apart without re-deriving it from context.
 */
export function measureInteractiveBoxes({ selector, floor, enhanced, declared, id, source }) {
  const rows = [];
  let seen = 0;
  for (const el of document.querySelectorAll(selector)) {
    const rect = el.getBoundingClientRect();
    // A control with no box is not rendered on this surface; it is not a small target.
    if (rect.width === 0 || rect.height === 0) continue;
    seen += 1;
    const box = classifyBox(rect.width, rect.height, floor, enhanced);
    if (!box) continue;
    const classes = el.className && typeof el.className === "string" ? el.className : "";
    const excuse = findDeclaredExcuse(classes, declared);
    rows.push({
      scenario: id,
      source,
      tag: el.tagName.toLowerCase(),
      classes: classes.slice(0, 90),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      declared: excuse ? excuse.reason : null,
      belowFloor: box.belowFloor,
    });
  }
  return { rows, seen };
}
