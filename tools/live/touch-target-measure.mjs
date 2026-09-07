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

/**
 * The first raised-floor entry whose class fragment appears in the element's class list, if any.
 * `DECLARED` lowers the bar for a control this project accepts under 28px; this is the opposite
 * shape — a control whose phone height is an operator-ruled fixed number rather than "clears the
 * floor", so the generic 28px sweep would let a regression back to 29px pass silently.
 */
export function findRaisedFloor(classes, raised) {
  const hit = raised.find((entry) => classes.includes(entry.match));
  return hit ? hit.floor : null;
}

// ───────────────────────────────────────────────────────────────────
// 2. DOM WALK (browser-only)
// ───────────────────────────────────────────────────────────────────

/**
 * Measures every interactive element the selector matches against the floor. `source` tags each
 * row so a caller mixing fixture and constructed-renderer measurements in one report can tell them
 * apart without re-deriving it from context.
 */
export function measureInteractiveBoxes({ selector, floor, enhanced, declared, raised = [], id, source }) {
  const rows = [];
  let seen = 0;
  for (const el of document.querySelectorAll(selector)) {
    const rect = el.getBoundingClientRect();
    // A control with no box is not rendered on this surface; it is not a small target.
    if (rect.width === 0 || rect.height === 0) continue;
    seen += 1;
    const classes = el.className && typeof el.className === "string" ? el.className : "";
    const raisedFloor = findRaisedFloor(classes, raised);
    const box = classifyBox(rect.width, rect.height, raisedFloor ?? floor, enhanced);
    if (!box) continue;
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
      // Set only when a RAISED entry matched. A raised-floor miss is never baseline-tolerated —
      // the ratchet exists for the 28px shortfall this project accepts and triages deliberately,
      // and folding a named 44px control into that same count would let it hide in headroom the
      // ratchet happens to have that day, the exact way a first pass of this check did.
      raisedFloor,
    });
  }
  return { rows, seen };
}
