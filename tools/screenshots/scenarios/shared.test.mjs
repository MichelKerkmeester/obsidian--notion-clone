// ───────────────────────────────────────────────────────────────────
// MODULE:    shared-board-parity
// COMPONENT: board fixture hierarchy parity with the renderer's DOM contract
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { ROWS, SUBTASK_FIXTURE_ROWS, boardCard, boardColumn, subtaskBoardCard } from "./shared.mjs";
import { CORE_SCENARIOS } from "./core.mjs";

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
  it("nests the Anytype column header under the containers the renderer puts it in", () => {
    const column = findDescendant(parseMarkup(boardColumn("Design", [ROWS[0]])), "obnotion-kanban-col");
    expectDirectChildOrder(
      column,
      ["obnotion-kanban-col-header", "obnotion-kanban-cards"],
      "the column",
    );
    const header = findDescendant(column, "obnotion-kanban-col-header");
    expectDirectChildOrder(header, ["obnotion-kanban-col-chip"], "the column header");
  });

  it("nests the card's title row and property meta under the card body", () => {
    const markup = boardCard(ROWS[0], "");
    // The property rows still share `card-field-renderer.ts`'s `obnotion-board-card-field`/`-value`
    // primitive (the same one gallery and list cards use) — only the card's own wrapper classes
    // are Anytype-shaped.
    expect(markup).not.toMatch(/class="obnotion-board-card"/);
    const card = findDescendant(parseMarkup(markup), "obnotion-kanban-card");
    expectDirectChildOrder(card, ["obnotion-kanban-card-body"], "the card");
    const body = findDescendant(card, "obnotion-kanban-card-body");
    expectDirectChildOrder(body, ["obnotion-kanban-card-title-row", "obnotion-kanban-card-meta"], "the card body");
    const titleRow = findDescendant(body, "obnotion-kanban-card-title-row");
    expectDirectChildOrder(titleRow, ["obnotion-kanban-card-title"], "the title row");
  });

  it("renders every configured property as a values-only row, no type-specific card furniture", () => {
    // Retired with the Project Manager card this fixture used to mirror: the priority strip, the
    // milestone/subtask/recurrence chips, the avatar stack and the due chip. Every property is an
    // ordinary row in `obnotion-kanban-card-meta` now, values only.
    const card = boardCard(ROWS[0], "");
    for (const retired of ["priority-bar", "pm-chip", "pm-avatar", "pm-progress", "card-footer", "card-tags"]) {
      expect(card).not.toContain(retired);
    }
    const meta = findDescendant(parseMarkup(card), "obnotion-kanban-card-meta");
    expect(meta.children.every((row) => row.classes.includes("obnotion-board-card-field"))).toBe(true);
    expect(card).toContain(">Cost<");
    expect(card).toContain("status-badge status-color-purple\">Yearly<");
  });

  it("keeps an empty column as a hollow cards container", () => {
    const column = findDescendant(parseMarkup(boardColumn("Personal", [])), "obnotion-kanban-col");
    const cards = findDescendant(column, "obnotion-kanban-cards");
    expect(findDescendant(cards, "obnotion-kanban-card"), "the empty column draws no card").toBeNull();
    expect(cards.children).toHaveLength(0);
    expect(boardColumn("Design", [ROWS[0]])).toContain("obnotion-kanban-card");
    expect(boardColumn("Personal", [])).not.toContain("obnotion-board-empty-slot");
  });

  it("puts the column-level dragover class on the cards container", () => {
    const plain = findDescendant(parseMarkup(boardColumn("Design", [ROWS[0]])), "obnotion-kanban-cards");
    expect(plain.classes).not.toContain("obnotion-kanban-drop-target");
    const highlighted = findDescendant(
      parseMarkup(boardColumn("Design", [ROWS[0]], "pink", { columnClass: "is-drop-target" })),
      "obnotion-kanban-cards",
    );
    expect(highlighted.classes).toContain("obnotion-kanban-drop-target");
    expect(findDescendant(parseMarkup(boardColumn("Design", [ROWS[0]], "pink", { columnClass: "is-drop-target" })), "obnotion-kanban-col").classes)
      .not.toContain("obnotion-kanban-drop-target");
  });

  it("puts the card-level dragstart class on the card root, raised above its neighbours", () => {
    const dragging = findDescendant(parseMarkup(boardCard(ROWS[0], "", { dragState: "dragging" })), "obnotion-kanban-card");
    expect(dragging.classes).toContain("obnotion-kanban-card--dragging");
    expect(dragging.classes).not.toContain("obnotion-kanban-drop-target");
  });
});

describe("subtask screenshot fixture parity", () => {
  const boardRenderer = readFileSync(new URL("../../../src/views/board-renderer.ts", import.meta.url), "utf8");
  const styles = readFileSync(new URL("../../../styles.css", import.meta.url), "utf8");

  it("keeps the board hierarchy helper in the renderer's child order", () => {
    const markup = subtaskBoardCard(SUBTASK_FIXTURE_ROWS.parent, { depth: 0 });
    const card = findDescendant(parseMarkup(markup), "obnotion-kanban-card");
    const body = findDescendant(card, "obnotion-kanban-card-body");
    expectDirectChildOrder(card, ["obnotion-kanban-card-body"], "the subtask card");
    expectDirectChildOrder(body, ["obnotion-kanban-card-title-row", "obnotion-kanban-card-meta"], "the subtask card body");
    const childMarkup = subtaskBoardCard(SUBTASK_FIXTURE_ROWS.copy, { depth: 1, parent: SUBTASK_FIXTURE_ROWS.parent.name });
    expect(childMarkup).toContain("obnotion-kanban-card-type");
    expect(childMarkup).not.toMatch(/class="obnotion-board-card"/);
  });

  it("gates the type-name slot on an actual child depth, not on the card being the subtask helper's output", () => {
    // No Objects/Types data model exists; the type-name slot keeps the schema's own nearest
    // content — a subtask's parent title — and only a child (depth > 0) has one to show.
    const rootCard = findDescendant(parseMarkup(subtaskBoardCard(SUBTASK_FIXTURE_ROWS.parent, { depth: 0 })), "obnotion-kanban-card");
    expect(findDescendant(rootCard, "obnotion-kanban-card-type")).toBeNull();

    const childCard = findDescendant(
      parseMarkup(subtaskBoardCard(SUBTASK_FIXTURE_ROWS.copy, { depth: 1, parent: SUBTASK_FIXTURE_ROWS.parent.name })),
      "obnotion-kanban-card",
    );
    expect(findDescendant(childCard, "obnotion-kanban-card-type")).not.toBeNull();
  });

  it("prints the parent card's title on the child card's type line, not the enclosing column's name", () => {
    // The renderer prints the parent TASK's title (getReferenceRowTitle on subtaskNode.parentId),
    // not the group/column the board-subtask-tree scenario's own lane happens to share a name
    // with ("Projects" is this scenario's column label, coincidentally also the old default).
    const scenario = CORE_SCENARIOS.find((s) => s.id === "board-subtask-tree");
    const html = scenario.html();
    expect(html).toContain(`class="obnotion-kanban-card-type">${SUBTASK_FIXTURE_ROWS.parent.name}</div>`);
    expect(html).not.toContain('class="obnotion-kanban-card-type">Projects</div>');
  });

  it("keeps every new class in the hand-written board state styled and sourced", () => {
    const boardMarkup = subtaskBoardCard(SUBTASK_FIXTURE_ROWS.parent, { depth: 0 });
    const contracts = [
      ["obnotion-kanban-card", boardRenderer, boardMarkup],
      ["obnotion-kanban-card-body", boardRenderer, boardMarkup],
      ["obnotion-kanban-card-title-row", boardRenderer, boardMarkup],
      ["obnotion-kanban-card-title", boardRenderer, boardMarkup],
      ["obnotion-kanban-card-meta", boardRenderer, boardMarkup],
    ];
    for (const [className, source, markup] of contracts) {
      expect(markup, `${className} is in its fixture`).toContain(className);
      expect(source, `${className} is emitted by its renderer`).toContain(className);
      expect(styles, `${className} has a stylesheet rule`).toContain(`.${className}`);
    }
  });

  it("scopes the view-level flex/overflow height chain to the compound container+view selector", () => {
    // board-renderer.ts's renderReferenceBoard adds `obnotion-kanban-view` to the same element that
    // database-view.ts / embedded-database-renderer.ts already classed `obnotion-container`
    // — never a descendant — so a descendant-only selector never matches, and the board's own
    // `flex-shrink: 0` has no flex parent to hold it against.
    expect(boardRenderer).toMatch(/container\.addClass\("obnotion-kanban-view"\)/);
    expect(styles).toMatch(/\.obnotion-container\.obnotion-kanban-view\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;[^}]*height:\s*100%;/);
    // A solo descendant-only selector for this rule (no compound alternative) would silently
    // reintroduce the dead rule; it must not stand alone as its own rule opener anywhere.
    expect(styles).not.toMatch(/(?:^|\n)\.obnotion-container \.obnotion-kanban-view\s*\{/);
  });

  it("cancels the host's inline padding through the same token the mobile breakpoint overrides", () => {
    // `.obnotion-kanban-board`'s negative margin has to cancel whatever `.obnotion-container`'s
    // own left/right padding actually is, not a value assumed to always be 24px: a hardcoded
    // `--obnotion-space-8` margin against the 760px breakpoint's narrower padding over-cancelled it by
    // 12px, pulling the board 12px past the container's own edge (measured as a 4px phone inset
    // against the reference's 16px, and a clipped right edge). Routing both through one custom
    // property — inherited by the board from its `.obnotion-container` ancestor — keeps
    // them paired at every breakpoint instead of relying on two literals staying in sync by hand.
    const kanbanBoardRule = styles.match(/\.obnotion-container \.obnotion-kanban-board\s*\{[^}]*\}/)?.[0] ?? "";
    expect(kanbanBoardRule).toMatch(/margin-left:\s*calc\(-1 \* var\(--obnotion-container-padding-inline\)\)/);
    expect(kanbanBoardRule).toMatch(/margin-right:\s*calc\(-1 \* var\(--obnotion-container-padding-inline\)\)/);
    expect(styles).toMatch(/\.obnotion-container\s*\{[^}]*--obnotion-container-padding-inline:\s*var\(--obnotion-space-8\)/);
    expect(styles).toMatch(/@media \(max-width: 760px\)\s*\{\s*\.obnotion-container\s*\{[^}]*--obnotion-container-padding-inline:\s*12px;/);
  });

  it("resets the inherited container line-height on the kanban block", () => {
    // `.obnotion-container` sets `line-height: var(--obnotion-font-md-line-height)` (1.45) for
    // this plugin's own UI; the kanban block resets it once at the view root so nothing in it
    // grows 2-3px taller than its capture-measured rhythm by inheriting that value.
    const kanbanViewRules = [...styles.matchAll(/\.obnotion-container\.obnotion-kanban-view\s*\{[^}]*\}/g)].map((m) => m[0]);
    expect(kanbanViewRules.some((rule) => /line-height:\s*normal;/.test(rule))).toBe(true);
    // The shared `pm-chip` primitive the gantt still constructs keeps its own explicit
    // line-height regardless of the kanban reset.
    expect(styles).toMatch(/\.obnotion-container \.pm-chip\s*\{[^}]*line-height:\s*1\.5;/);
  });

  it("lets a linked database own the reading host width without card furniture", () => {
    const linkedSurface = styles.match(/\.obnotion-embed\.obnotion-embed-linked\.obnotion-container\s*\{[^}]*\}/)?.[0] ?? "";
    expect(linkedSurface).toMatch(/width:\s*100%;/);
    expect(linkedSurface).toMatch(/padding:\s*0;/);
    expect(linkedSurface).toMatch(/border:\s*0;/);
    expect(linkedSurface).toMatch(/border-radius:\s*0;/);
    expect(styles).toMatch(/\.is-phone \.obnotion-embed\.obnotion-embed-linked \.obnotion-linked-view-drag-handle\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;/s);
  });

});

// ───────────────────────────────────────────────────────────────────
// 4. LIST-VIEW STYLESHEET REACHABILITY
// ───────────────────────────────────────────────────────────────────

// src/views/list-renderer.ts is retired, and nothing else builds `obnotion-list*` markup except
// tools/live/view-census.mjs's row-rhythm matrix -- a reproduction kept on purpose to measure the
// stylesheet's row layout independent of a live view. Every `obnotion-list*` class the stylesheet still
// selects on has to be one that fixture actually mounts, together with only the wrapper classes it
// puts around that markup (`obnotion-container`, `is-phone`, `is-mobile`); anything else is a
// selector no producer can ever satisfy.
describe("list retirement leaves no unreachable obnotion-list selector", () => {
  const styles = readFileSync(new URL("../../../styles.css", import.meta.url), "utf8");
  const viewCensus = readFileSync(new URL("../../live/view-census.mjs", import.meta.url), "utf8");

  const WRAPPER_CLASSES = new Set(["obnotion-container", "is-phone", "is-mobile"]);

  /** Every class the row-rhythm fixture's own markup strings mount, `obnotion-list*` or not. */
  function fixtureClasses(source) {
    const classes = new Set();
    for (const match of source.matchAll(/class="([^"]*)"/g)) {
      for (const cls of match[1].split(/\s+/).filter(Boolean)) classes.add(cls);
    }
    return classes;
  }

  /** One rule's selector text, paired with its declaration body -- ignores at-rule nesting
   *  (`@media` etc.), which changes when a rule applies, not what elements can satisfy it. */
  function ruleSelectors(css) {
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    return [...withoutComments.matchAll(/([^{}]+)\{[^{}]*\}/g)]
      .flatMap((m) => m[1].split(","))
      .map((arm) => arm.trim())
      .filter(Boolean);
  }

  it("keeps every obnotion-list selector arm inside the classes the row-rhythm fixture mounts", () => {
    const mounted = fixtureClasses(viewCensus);
    const listMounted = [...mounted].filter((cls) => cls.startsWith("obnotion-list"));
    // A regression in the fixture itself (nothing left mounting obnotion-list markup) would silently
    // pass every check below by having nothing left to disagree with -- guard against that first.
    expect(listMounted.length).toBeGreaterThan(0);

    const unreachable = [];
    for (const arm of ruleSelectors(styles)) {
      const classes = [...arm.matchAll(/\.([a-zA-Z0-9_-]+)/g)].map((m) => m[1]);
      if (!classes.some((cls) => cls.startsWith("obnotion-list"))) continue;
      const unknown = classes.filter((cls) => !mounted.has(cls) && !WRAPPER_CLASSES.has(cls));
      if (unknown.length > 0) unreachable.push(`${arm}  [${unknown.join(", ")}]`);
    }
    expect(unreachable, `selector arms no producer can satisfy:\n${unreachable.join("\n")}`).toEqual([]);
  });
});
