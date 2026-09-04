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
import { TIMELINE_FIXTURES, TL_LANES, TL_SUBTASK_LANES, timelineEvent } from "./temporal.mjs";
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
  it("nests the reference column header under the containers the renderer puts it in", () => {
    const column = findDescendant(parseMarkup(boardColumn("Design", [ROWS[0]])), "pm-kanban-col");
    expectDirectChildOrder(
      column,
      ["pm-kanban-col-header", "pm-kanban-cards"],
      "the column",
    );
    const header = findDescendant(column, "pm-kanban-col-header");
    expectDirectChildOrder(
      header,
      ["pm-kanban-col-topbar", "pm-kanban-col-title-row"],
      "the column header",
    );
    const titleRow = findDescendant(header, "pm-kanban-col-title-row");
    expectDirectChildOrder(titleRow, ["pm-kanban-col-badge", "pm-kanban-col-header-right"], "the title row");
    const headerRight = findDescendant(titleRow, "pm-kanban-col-header-right");
    expectDirectChildOrder(headerRight, ["pm-kanban-col-count"], "the header right area");
  });

  it("nests the card's priority bar and body content under the reference card", () => {
    // The strip is per-card, from a mapped priority column — not from the group tone — so a
    // priority-bearing state has to be requested explicitly to exercise this order.
    const markup = boardCard(ROWS[0], "", { priorityColor: "red" });
    expect(markup).not.toContain("db-board-");
    const card = findDescendant(parseMarkup(markup), "pm-kanban-card");
    expectDirectChildOrder(
      card,
      ["pm-kanban-card-priority-bar", "pm-kanban-card-body"],
      "the card",
    );
    const body = findDescendant(card, "pm-kanban-card-body");
    expectDirectChildOrder(
      body,
      ["pm-kanban-card-title-row", "pm-chip", "pm-kanban-card-tags", "pm-kanban-card-footer"],
      "the card body",
    );
    const titleRow = findDescendant(body, "pm-kanban-card-title-row");
    expectDirectChildOrder(titleRow, ["pm-kanban-card-title"], "the title row");
  });

  it("omits the priority bar by default and the parent node without a parent title", () => {
    const card = boardCard(ROWS[0], "");
    expect(card).not.toContain("pm-kanban-card-priority-bar");
    expect(card).not.toContain("pm-kanban-card-parent");
    expect(card).toContain("pm-kanban-card-title");
  });

  it("renders the milestone and recurrence type chips in the reference's fixed order, omitted by default", () => {
    // board-renderer.ts's fixed order is milestone, subtask, recurrence (`:448-476`); boardCard
    // never builds a subtask node, so only the two boolean-row-field chips apply here.
    const plain = boardCard(ROWS[0], "");
    expect(plain).not.toContain("--pm-chip-color: var(--color-purple)");
    expect(plain).not.toContain("--pm-chip-color: var(--color-blue)");

    const both = boardCard({ ...ROWS[0], milestone: true, recurring: true }, "");
    const titleRow = findDescendant(parseMarkup(both), "pm-kanban-card-title-row");
    const chipChildren = titleRow.children.filter((child) => child.classes.includes("pm-chip"));
    expect(chipChildren, "exactly the milestone and recurrence chips are direct children").toHaveLength(2);
    // Two identical "pm-chip" classes can't be told apart by class alone, so the order proof
    // reads the actual rendered markup instead: the milestone chip's own colour-and-label
    // sequence has to appear before the recurrence chip's.
    const milestoneMarkup = '--pm-chip-color: var(--color-purple);"><span class="pm-chip-label">M</span>';
    const recurrenceMarkup = '--pm-chip-color: var(--color-blue);"><span class="pm-chip-label">R</span>';
    expect(both).toContain(milestoneMarkup);
    expect(both).toContain(recurrenceMarkup);
    expect(both.indexOf(milestoneMarkup)).toBeLessThan(both.indexOf(recurrenceMarkup));

    const milestoneOnly = boardCard({ ...ROWS[0], milestone: true }, "");
    expect(milestoneOnly).toContain("--pm-chip-color: var(--color-purple)");
    expect(milestoneOnly).not.toContain("--pm-chip-color: var(--color-blue)");
  });

  it("builds an initialed avatar per person plus an overflow slot past three, empty without a people column", () => {
    const empty = boardCard(ROWS[0], "");
    expect(findDescendant(parseMarkup(empty), "pm-avatar-stack").children).toHaveLength(0);

    const twoPeople = boardCard({ ...ROWS[0], people: ["Alice Kim", "Bob Diaz"] }, "");
    const stack = findDescendant(parseMarkup(twoPeople), "pm-avatar-stack");
    expect(stack.children).toHaveLength(2);
    expect(stack.children.every((avatar) => avatar.classes.includes("pm-avatar") && avatar.classes.includes("pm-avatar--sm"))).toBe(true);
    expect(twoPeople).toContain(">AK<");
    expect(twoPeople).toContain(">BD<");
    expect(twoPeople).not.toContain("pm-avatar--more");

    const fourPeople = boardCard({ ...ROWS[0], people: ["Alice Kim", "Bob Diaz", "Cy Chen", "Dana Lee"] }, "");
    const overflowStack = findDescendant(parseMarkup(fourPeople), "pm-avatar-stack");
    expect(overflowStack.children).toHaveLength(4);
    const overflowAvatar = overflowStack.children[3];
    expect(overflowAvatar.classes).toContain("pm-avatar--more");
    expect(fourPeople).toContain(">+1<");
  });

  it("formats the due chip through the renderer's short-date conversion, not the fixture's long literal", () => {
    // ROWS/SUBTASK_FIXTURE_ROWS keep long literals ("January 4, 2027") for readability; the
    // renderer's own referenceFormatDateShort (`board-renderer.ts:2491-2496`) always emits a
    // short month-day form. Its exact characters are locale-dependent (this suite's own
    // `board-renderer-parity.test.ts:692` checks the same renderer's due-chip label with
    // `toBeTruthy()` rather than pinning one locale's text), so this proves the conversion ran —
    // the long literal is gone and the due chip's label is materially shorter — instead of
    // asserting one locale's exact output. The due chip is always the last `pm-chip-label` in
    // the card: `pmCardFooter` renders it after the avatar stack, and the footer is the card
    // body's last block.
    expect(ROWS[0].renew).toBe("January 4, 2027");
    const card = boardCard(ROWS[0], "");
    expect(card).not.toContain("January 4, 2027");
    const labels = [...card.matchAll(/class="pm-chip-label">([^<]*)<\/span>/g)].map((m) => m[1]);
    const dueLabel = labels[labels.length - 1];
    expect(dueLabel).not.toBe("January 4, 2027");
    expect(dueLabel.length).toBeLessThan("January 4, 2027".length);
  });

  it("keeps an empty reference column as a hollow cards container", () => {
    const column = findDescendant(parseMarkup(boardColumn("Personal", [])), "pm-kanban-col");
    const cards = findDescendant(column, "pm-kanban-cards");
    expect(findDescendant(cards, "pm-kanban-card"), "the empty column draws no card").toBeNull();
    expect(cards.children).toHaveLength(0);
    expect(boardColumn("Design", [ROWS[0]])).toContain("pm-kanban-card");
    expect(boardColumn("Personal", [])).not.toContain("db-board-empty-slot");
  });

  it("puts the column-level dragover class on the cards container", () => {
    const plain = findDescendant(parseMarkup(boardColumn("Design", [ROWS[0]])), "pm-kanban-cards");
    expect(plain.classes).not.toContain("pm-kanban-drop-target");
    const highlighted = findDescendant(
      parseMarkup(boardColumn("Design", [ROWS[0]], "pink", { columnClass: "is-drop-target" })),
      "pm-kanban-cards",
    );
    expect(highlighted.classes).toContain("pm-kanban-drop-target");
    expect(findDescendant(parseMarkup(boardColumn("Design", [ROWS[0]], "pink", { columnClass: "is-drop-target" })), "pm-kanban-col").classes)
      .not.toContain("pm-kanban-drop-target");
  });

  it("puts the card-level dragstart class on the card root, raised above its neighbours", () => {
    const dragging = findDescendant(parseMarkup(boardCard(ROWS[0], "", { dragState: "dragging" })), "pm-kanban-card");
    expect(dragging.classes).toContain("pm-kanban-card--dragging");
    expect(dragging.classes).not.toContain("pm-kanban-drop-target");
  });

  it("keeps insertion feedback on the reference container rather than inventing a card node", () => {
    const markup = boardCard(ROWS[0], "", { dragState: "drop-target", dropPlacement: "before" });
    expect(markup).not.toContain("pm-kanban-drop-target");
    expect(markup).not.toContain("db-board-drop-indicator");
  });
});

describe("subtask screenshot fixture parity", () => {
  const boardRenderer = readFileSync(new URL("../../../src/views/board-renderer.ts", import.meta.url), "utf8");
  const timelineRenderer = readFileSync(new URL("../../../src/views/calendar-timeline-renderer.ts", import.meta.url), "utf8");
  const styles = readFileSync(new URL("../../../styles.css", import.meta.url), "utf8");

  it("keeps the board hierarchy helper in the renderer's child order", () => {
    // priorityColor is opt-in like the ordinary board card's — forced here so the strip's child
    // order still has a documented, exercised path even though no fixture row maps a priority.
    const markup = subtaskBoardCard(SUBTASK_FIXTURE_ROWS.parent, { children: true, done: 1, total: 2, explicit: 62, value: 62, priorityColor: "purple" });
    const card = findDescendant(parseMarkup(markup), "pm-kanban-card");
    const body = findDescendant(card, "pm-kanban-card-body");
    expectDirectChildOrder(card, ["pm-kanban-card-priority-bar", "pm-kanban-card-body"], "the subtask card");
    expectDirectChildOrder(body, ["pm-kanban-card-title-row", "pm-chip", "pm-kanban-card-tags", "pm-progress", "pm-kanban-card-footer"], "the subtask card body");
    const childMarkup = subtaskBoardCard(SUBTASK_FIXTURE_ROWS.copy, { depth: 1, parent: SUBTASK_FIXTURE_ROWS.parent.name });
    expect(childMarkup).toContain("pm-kanban-card-parent");
    expect(childMarkup).not.toContain("db-board-");
    expect(boardRenderer).toContain("db-subtask-toggle");
    expect(boardRenderer).toContain("db-subtask-progress-derived");
    expect(boardRenderer).toContain("db-subtask-progress-explicit");
    expect(boardRenderer).toContain("db-subtask-add-input");
  });

  it("gates the Sub chip on an actual child depth, not on the card being the subtask helper's output", () => {
    // The reference only renders the Sub chip for `task.type === 'subtask'` (KanbanCard.ts:60-67);
    // the parent/root card the helper also draws (depth 0) must not carry it.
    const rootCard = findDescendant(parseMarkup(subtaskBoardCard(SUBTASK_FIXTURE_ROWS.parent, { depth: 0 })), "pm-kanban-card");
    const rootTitleRow = findDescendant(rootCard, "pm-kanban-card-title-row");
    expect(findDescendant(rootTitleRow, "pm-chip")).toBeNull();

    const childCard = findDescendant(
      parseMarkup(subtaskBoardCard(SUBTASK_FIXTURE_ROWS.copy, { depth: 1, parent: SUBTASK_FIXTURE_ROWS.parent.name })),
      "pm-kanban-card",
    );
    const childTitleRow = findDescendant(childCard, "pm-kanban-card-title-row");
    expect(findDescendant(childTitleRow, "pm-chip")).not.toBeNull();
  });

  it("prints the parent card's title on the child card's parent line, not the enclosing column's name", () => {
    // The reference prints the parent TASK's title (KanbanCard.ts:44-46 `props.parentTitle`),
    // not the group/column the board-subtask-tree scenario's own lane happens to share a name
    // with ("Projects" is this scenario's column label, coincidentally also the old default).
    const scenario = CORE_SCENARIOS.find((s) => s.id === "board-subtask-tree");
    const html = scenario.html();
    expect(html).toContain(`class="pm-kanban-card-parent">${SUBTASK_FIXTURE_ROWS.parent.name}</span>`);
    expect(html).not.toContain('class="pm-kanban-card-parent">Projects</span>');
  });

  it("keeps every new class in the hand-written board and timeline states styled and sourced", () => {
    const boardMarkup = subtaskBoardCard(SUBTASK_FIXTURE_ROWS.parent, { children: true, done: 1, total: 2, explicit: 62, value: 62, priorityColor: "purple" });
    const peopleMarkup = boardCard({ ...ROWS[0], people: ["Alice Kim", "Bob Diaz", "Cy Chen", "Dana Lee"], milestone: true, recurring: true });
    const treeParent = TL_SUBTASK_LANES.find((lane) => lane.key === "business").events[0];
    const timelineMarkup = timelineEvent(treeParent, TIMELINE_FIXTURES.week);
    const contracts = [
      ["pm-kanban-card", boardRenderer, boardMarkup],
      ["pm-kanban-card-priority-bar", boardRenderer, boardMarkup],
      ["pm-kanban-card-body", boardRenderer, boardMarkup],
      ["pm-kanban-card-title-row", boardRenderer, boardMarkup],
      ["pm-kanban-card-title", boardRenderer, boardMarkup],
      ["pm-chip", boardRenderer, boardMarkup],
      ["pm-kanban-card-tags", boardRenderer, boardMarkup],
      ["pm-progress", boardRenderer, boardMarkup],
      ["pm-progress-track", boardRenderer, boardMarkup],
      ["pm-progress-fill", boardRenderer, boardMarkup],
      ["pm-kanban-card-footer", boardRenderer, boardMarkup],
      ["pm-avatar-stack", boardRenderer, peopleMarkup],
      ["pm-avatar", boardRenderer, peopleMarkup],
      ["pm-avatar--sm", boardRenderer, peopleMarkup],
      ["pm-avatar--more", boardRenderer, peopleMarkup],
      ["pm-gantt-bar-group", timelineRenderer, timelineMarkup],
      ["pm-gantt-bar", timelineRenderer, timelineMarkup],
      ["pm-gantt-bar-progress", timelineRenderer, timelineMarkup],
      ["pm-gantt-drag-handle", timelineRenderer, timelineMarkup],
      ["pm-gantt-link-dot", timelineRenderer, timelineMarkup],
    ];
    for (const [className, source, markup] of contracts) {
      expect(markup, `${className} is in its fixture`).toContain(className);
      expect(source, `${className} is emitted by its renderer`).toContain(className);
      expect(styles, `${className} has a stylesheet rule`).toContain(`.${className}`);
    }
    expect(boardRenderer).toContain("db-subtask-toggle");
    expect(boardRenderer).toContain("db-subtask-progress-derived");
    expect(boardRenderer).toContain("db-subtask-progress-explicit");
    expect(boardRenderer).toContain("db-subtask-add-input");
  });

  it("scopes the view-level flex/overflow height chain to the compound container+view selector", () => {
    // board-renderer.ts's renderReferenceBoard adds `pm-kanban-view` to the same element that
    // database-view.ts / embedded-database-renderer.ts already classed `note-database-container`
    // — never a descendant — so a descendant-only selector never matches and `.pm-kanban-board`'s
    // `flex: 1; min-height: 0` has no flex parent to size against.
    expect(boardRenderer).toMatch(/container\.addClass\("pm-kanban-view"\)/);
    expect(styles).toMatch(/\.note-database-container\.pm-kanban-view\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;[^}]*height:\s*100%;/);
    // A solo descendant-only selector for this rule (no compound alternative) would silently
    // reintroduce the dead rule; it must not stand alone as its own rule opener anywhere.
    expect(styles).not.toMatch(/(?:^|\n)\.note-database-container \.pm-kanban-view\s*\{/);
  });

  it("cancels the host's inline padding through the same token the mobile breakpoint overrides", () => {
    // `.pm-kanban-board`'s negative margin has to cancel whatever `.note-database-container`'s
    // own left/right padding actually is, not a value assumed to always be 24px: a hardcoded
    // `--db-space-8` margin against the 760px breakpoint's narrower padding over-cancelled it by
    // 12px, pulling the board 12px past the container's own edge (measured as a 4px phone inset
    // against the reference's 16px, and a clipped right edge). Routing both through one custom
    // property — inherited by the board from its `.note-database-container` ancestor — keeps
    // them paired at every breakpoint instead of relying on two literals staying in sync by hand.
    const kanbanBoardRule = styles.match(/\.note-database-container \.pm-kanban-board\s*\{[^}]*\}/)?.[0] ?? "";
    expect(kanbanBoardRule).toMatch(/margin-left:\s*calc\(-1 \* var\(--db-container-padding-inline\)\)/);
    expect(kanbanBoardRule).toMatch(/margin-right:\s*calc\(-1 \* var\(--db-container-padding-inline\)\)/);
    expect(styles).toMatch(/\.note-database-container\s*\{[^}]*--db-container-padding-inline:\s*var\(--db-space-8\)/);
    expect(styles).toMatch(/@media \(max-width: 760px\)\s*\{\s*\.note-database-container\s*\{[^}]*--db-container-padding-inline:\s*12px;/);
  });

  it("keeps the tree out of the lanes every ordinary timeline capture renders", () => {
    // The five scale captures exist to show an un-related bar; the tree has its own scenario.
    for (const lane of TL_LANES) {
      for (const event of lane.events) {
        expect(event.subtask, `${lane.key}/${event.title} carries no subtask state`).toBeUndefined();
        expect(timelineEvent(event, TIMELINE_FIXTURES.week)).not.toContain("pm-collapse-toggle");
      }
    }
    const treeLane = TL_SUBTASK_LANES.find((lane) => lane.key === "business");
    expect(treeLane.events.map((event) => event.subtask?.depth)).toEqual([0, 1, 1]);
    expect(treeLane.events[0].subtask.children).toBe(true);
    expect(TL_SUBTASK_LANES.find((lane) => lane.key === "personal").events.every((event) => !event.subtask)).toBe(true);
  });
});
