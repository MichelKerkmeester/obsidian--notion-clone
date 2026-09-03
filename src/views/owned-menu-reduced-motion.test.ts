// ───────────────────────────────────────────────────────────────────
// MODULE:    owned-menu-reduced-motion
// COMPONENT: reduced-motion coverage for a body-portalled owned menu
// ───────────────────────────────────────────────────────────────────
//
// createOwnedMenu mounts its surface directly on `doc.body` (owned-menu.ts) and never adds
// `.note-database-container`, so the container-wide reduced-motion reset — which resets every
// descendant of that container — never matches a menu descendant. The reset has to name the
// `.db-surface` marker the menu already carries, or a menu row that later gains a transition
// keeps moving for a reader who asked for none.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

// ───────────────────────────────────────────────────────────────────
// 2. COVERAGE TEST
// ───────────────────────────────────────────────────────────────────

describe("Owned menu reduced-motion coverage", () => {
  const stylesPath = resolve(__dirname, "../../styles.css");
  const stylesContent = readFileSync(stylesPath, "utf-8");

  it("the container-wide reduced-motion reset also names .db-surface, the marker an owned menu carries instead of the container class", () => {
    const anchor = "which then keeps its own transitions for a reader who asked for none.";
    const anchorIndex = stylesContent.indexOf(anchor);
    expect(anchorIndex).toBeGreaterThan(-1);

    const commentEnd = stylesContent.indexOf("*/", anchorIndex) + 2;
    const ruleOpen = stylesContent.indexOf("{", commentEnd);
    const selectorList = stylesContent.slice(commentEnd, ruleOpen);

    expect(selectorList).toContain(".db-surface");
  });
});
