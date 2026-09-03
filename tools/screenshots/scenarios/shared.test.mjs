// ───────────────────────────────────────────────────────────────────
// MODULE:    shared-board-parity
// COMPONENT: board fixture hierarchy parity with the renderer's DOM contract
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { ROWS, boardCard, boardColumn } from "./shared.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. MARKUP TREE
// ───────────────────────────────────────────────────────────────────

const VOID_TAGS = new Set(["input", "br", "img", "hr"]);

/**
 * Builds an element tree from the fixture markup so containment can be checked directly
 * instead of inferred from raw string position. A string-index comparison only proves a class
 * appears LATER in the document than another; it stays green even when a node is moved to a
 * different container entirely, as long as it lands after its old neighbour somewhere in the
 * string. Walking real open/close tag structure catches that move.
 *
 * There is no HTML parser among this repo's dependencies (vitest here runs with
 * `environment: "node"`, and nothing under tools/ or src/ pulls in jsdom/linkedom), so this
 * stays a minimal stack-based tag walker scoped to what the fixture markup actually uses:
 * open/close tag pairs, `/>`-self-closed tags (the inline svg glyphs), and the one HTML void
 * element the fixture writes without a trailing slash (`rowCheckbox`'s `<input>`).
 */
function parseMarkup(html) {
  const root = { tag: "#root", classes: [], children: [] };
  const stack = [root];
  const tagRe = /<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g;
  let match;
  while ((match = tagRe.exec(html))) {
    const [full, closing, rawTag] = match;
    const tag = rawTag.toLowerCase();
    if (closing) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    const classAttr = full.match(/class="([^"]*)"/);
    const node = { tag, classes: classAttr ? classAttr[1].split(/\s+/).filter(Boolean) : [], children: [] };
    stack[stack.length - 1].children.push(node);
    if (!full.endsWith("/>") && !VOID_TAGS.has(tag)) stack.push(node);
  }
  return root;
}

/** First descendant (depth-first) carrying `className`, or null. Does not match `node` itself. */
function findDescendant(node, className) {
  for (const child of node.children) {
    if (child.classes.includes(className)) return child;
    const found = findDescendant(child, className);
    if (found) return found;
  }
  return null;
}

/**
 * Asserts every class in `classNames` is a DIRECT child of `parent` -- not merely present
 * somewhere in its subtree -- and that they appear in the given order among `parent`'s
 * children. This is what catches a node being relocated to a different container: string
 * order alone cannot tell "later in the document" apart from "nested somewhere else".
 */
function expectDirectChildOrder(parent, classNames, label) {
  expect(parent, `${label} is present`).not.toBeNull();
  let previousIndex = -1;
  for (const className of classNames) {
    const index = parent.children.findIndex((child) => child.classes.includes(className));
    expect(index, `${className} is a direct child of ${label}`).toBeGreaterThan(-1);
    expect(index, `${className} follows the preceding node under ${label}`).toBeGreaterThan(previousIndex);
    previousIndex = index;
  }
}

// ───────────────────────────────────────────────────────────────────
// 3. STRUCTURE CHECKS
// ───────────────────────────────────────────────────────────────────

describe("board screenshot fixture parity", () => {
  it("nests the column's header controls under the containers the renderer puts them in", () => {
    const column = findDescendant(parseMarkup(boardColumn("Design", [ROWS[0]])), "db-board-column");
    expectDirectChildOrder(
      column,
      ["db-board-column-header", "db-board-column-resize-handle", "db-board-cards"],
      "the column",
    );
    const header = findDescendant(column, "db-board-column-header");
    expectDirectChildOrder(
      header,
      ["db-board-column-topbar", "db-board-group-toggle", "db-board-column-checkbox", "db-board-header-text"],
      "the column header",
    );
    const headerText = findDescendant(header, "db-board-header-text");
    expectDirectChildOrder(
      headerText,
      ["db-board-column-title", "db-board-count", "db-board-column-options"],
      "the header text",
    );
  });

  it("nests the card's controls and body content under the containers the renderer puts them in", () => {
    const markup = boardCard(ROWS[0], "pink");
    expect(markup).not.toContain('<div class="db-board-card-title">');
    const card = findDescendant(parseMarkup(markup), "db-board-card");
    expectDirectChildOrder(
      card,
      ["db-board-card-priority-strip", "db-board-card-controls", "db-board-card-body"],
      "the card",
    );
    const body = findDescendant(card, "db-board-card-body");
    expectDirectChildOrder(
      body,
      ["db-board-card-parent", "db-record-title-line", "db-board-card-meta"],
      "the card body",
    );
    const titleLine = findDescendant(body, "db-record-title-line");
    expectDirectChildOrder(titleLine, ["db-board-card-title", "db-board-card-chips"], "the title line");
  });

  it("omits the optional parent and priority nodes when the renderer has no value", () => {
    const card = boardCard(ROWS[0], null, "");
    expect(card).not.toContain("db-board-card-priority-strip");
    expect(card).not.toContain("db-board-card-parent");
    expect(card).toContain("db-file-title-prefix");
  });
});
