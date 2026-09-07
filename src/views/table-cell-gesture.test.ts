// ───────────────────────────────────────────────────────────────────
// MODULE:    table-cell-gesture.test
// COMPONENT: tests for the shared cell-vs-row-chrome target predicate
// ───────────────────────────────────────────────────────────────────
//
// `isTableCellTarget` is what keeps the row's own long-press-for-menu gesture and a cell's
// long-press-for-selection gesture from both firing on the same hold. This suite runs with no
// jsdom (this project's vitest environment is "node", and neither jsdom nor happy-dom is an
// installed dependency — checked directly, not assumed), so the stand-in below is a small real
// element tree: actual parent links and a `closest()` that walks them and evaluates the selector
// text against each ancestor, rather than a fake that returns a fixed answer regardless of what it
// is asked. That is the property this suite needs — a wrong attribute in the source selector, a
// wrong tag, or a dropped `isHTMLElement` guard all have to change the answer, not be absorbed by
// the stand-in.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
// The global `isHTMLElement` read (`dom-guards.ts`) needs `HTMLElement` to resolve as a bare
// identifier; `RealElement.instanceOf` below checks identity against this same reference, the way
// Obsidian's real `instanceOf` extension checks identity against the real constructor.
const HTMLElementStub = ((globalThis as unknown as { HTMLElement: unknown }).HTMLElement ??=
  class {}) as new () => object;
import { isTableCellTarget } from "./table-cell-gesture";

// ───────────────────────────────────────────────────────────────────
// 2. A REAL, MINIMAL ELEMENT TREE
// ───────────────────────────────────────────────────────────────────

/** An element with a real parent chain and a `closest()` that actually walks it, evaluating a
 *  compound selector — an optional tag name plus any number of `[attr]` presence clauses — against
 *  each ancestor in turn. Narrow on purpose: it matches exactly the shape `isTableCellTarget`'s own
 *  selector takes, parsed independently of that selector's text rather than assuming it. */
class RealElement {
  readonly tagName: string;
  readonly parentElement: RealElement | null;
  private readonly attrNames: Set<string>;

  constructor(tagName: string, attrNames: string[] = [], parent: RealElement | null = null) {
    this.tagName = tagName.toUpperCase();
    this.attrNames = new Set(attrNames);
    this.parentElement = parent;
  }

  /** Mirrors Obsidian's real `Node.prototype.instanceOf` extension: identity against the actual
   *  constructor, not a stub that agrees with whatever it is asked. */
  instanceOf(ctor: unknown): boolean {
    return ctor === HTMLElementStub;
  }

  private matches(selector: string): boolean {
    const attrClause = /\[([^\]=]+)\]/g;
    const tag = selector.replace(attrClause, "").trim();
    if (tag && this.tagName !== tag.toUpperCase()) return false;
    let match: RegExpExecArray | null;
    attrClause.lastIndex = 0;
    while ((match = attrClause.exec(selector))) {
      if (!this.attrNames.has(match[1])) return false;
    }
    return true;
  }

  closest(selector: string): RealElement | null {
    let node: RealElement | null = this;
    while (node) {
      if (node.matches(selector)) return node;
      node = node.parentElement;
    }
    return null;
  }
}

const ROW_ATTR = "data-note-database-row-path";
const COL_ATTR = "data-note-database-column-key";

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

describe("isTableCellTarget", () => {
  it("is true for a press several ancestors below a database table cell", () => {
    const td = new RealElement("td", [ROW_ATTR, COL_ATTR]);
    const wrap = new RealElement("div", [], td);
    const label = new RealElement("span", [], wrap);
    expect(isTableCellTarget(label as unknown as EventTarget)).toBe(true);
  });

  it("is false for a press outside any table cell", () => {
    const row = new RealElement("tr", []);
    const button = new RealElement("button", [], row);
    expect(isTableCellTarget(button as unknown as EventTarget)).toBe(false);
  });

  it("is false for a null target", () => {
    expect(isTableCellTarget(null)).toBe(false);
  });

  it("is false when only one of the two required attributes is present", () => {
    // Catches a mutant that drops one attribute clause from the selector — a fake `closest()`
    // that ignores its argument cannot fail this the way a real one, evaluated per-attribute, does.
    const td = new RealElement("td", [ROW_ATTR]);
    expect(isTableCellTarget(td as unknown as EventTarget)).toBe(false);
  });

  it("is false when both attributes sit on the wrong tag", () => {
    // Catches a mutant that drops or changes the tag qualifier — the attributes alone are not
    // enough, the selector also requires `td` specifically.
    const row = new RealElement("tr", [ROW_ATTR, COL_ATTR]);
    const cell = new RealElement("span", [], row);
    expect(isTableCellTarget(cell as unknown as EventTarget)).toBe(false);
  });

  it("is false for a target that exposes a matching closest() but is not a real element", () => {
    // Catches a dropped `isHTMLElement` guard: this object has no `instanceOf`, so the guard must
    // reject it before its `closest()` — which would otherwise answer `true` — is ever called.
    const td = new RealElement("td", [ROW_ATTR, COL_ATTR]);
    const impostor = { closest: () => td } as unknown as EventTarget;
    expect(isTableCellTarget(impostor)).toBe(false);
  });
});
