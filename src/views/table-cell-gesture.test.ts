// ───────────────────────────────────────────────────────────────────
// MODULE:    table-cell-gesture.test
// COMPONENT: tests for the shared cell-vs-row-chrome target predicate
// ───────────────────────────────────────────────────────────────────
//
// `isTableCellTarget` is what keeps the row's own long-press-for-menu gesture and a cell's
// new long-press-for-selection gesture from both firing on the same hold. Exercised with a
// minimal stand-in rather than a real DOM node: this suite runs with no jsdom, so `isHTMLElement`
// has to be satisfied through Obsidian's own `instanceOf` extension point instead of a real
// `instanceof Node`, the same seam `dom-guards.ts` reads.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
// This suite runs with `environment: "node"` (vitest.config.ts) — no jsdom, so the global
// `isHTMLElement` reads (`dom-guards.ts`) needs to resolve `HTMLElement` as a bare identifier
// falls back to. The stand-in below never inspects it; only its existence is required.
(globalThis as unknown as { HTMLElement: unknown }).HTMLElement ??= class {};
import { isTableCellTarget } from "./table-cell-gesture";

// ───────────────────────────────────────────────────────────────────
// 2. STAND-IN TARGET
// ───────────────────────────────────────────────────────────────────

/** A press target that answers `closest()` the way a real node would, without needing a DOM. */
class FakeTarget {
  constructor(private readonly closestMatch: unknown) {}
  instanceOf(): boolean {
    return true;
  }
  closest(): unknown {
    return this.closestMatch;
  }
}

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

describe("isTableCellTarget", () => {
  it("is true for a press inside a database table cell", () => {
    const target = new FakeTarget({}) as unknown as EventTarget;
    expect(isTableCellTarget(target)).toBe(true);
  });

  it("is false for a press outside any table cell", () => {
    const target = new FakeTarget(null) as unknown as EventTarget;
    expect(isTableCellTarget(target)).toBe(false);
  });

  it("is false for a null target", () => {
    expect(isTableCellTarget(null)).toBe(false);
  });
});
