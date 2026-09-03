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

describe("subtask screenshot fixture parity", () => {
  const boardRenderer = readFileSync(new URL("../../../src/views/board-renderer.ts", import.meta.url), "utf8");
  const timelineRenderer = readFileSync(new URL("../../../src/views/calendar-timeline-renderer.ts", import.meta.url), "utf8");
  const styles = readFileSync(new URL("../../../styles.css", import.meta.url), "utf8");

  it("keeps the board hierarchy helper in the renderer's child order", () => {
    const markup = subtaskBoardCard(SUBTASK_FIXTURE_ROWS.parent, { children: true, done: 1, total: 2, explicit: 62, value: 62 });
    const card = findDescendant(parseMarkup(markup), "db-board-card");
    const controls = findDescendant(card, "db-board-card-controls");
    const body = findDescendant(card, "db-board-card-body");
    expectDirectChildOrder(controls, ["db-board-card-checkbox", "db-board-card-open", "db-card-mobile-move-btn", "db-subtask-toggle"], "the subtask card controls");
    expectDirectChildOrder(body, ["db-board-card-parent", "db-record-title-line", "db-board-card-meta", "db-subtask-progress", "db-subtask-add-row"], "the subtask card body");
    const childMarkup = subtaskBoardCard(SUBTASK_FIXTURE_ROWS.copy, { depth: 1 });
    expect(childMarkup).toContain('data-subtask-depth="1"');
    expect(childMarkup).toContain("--db-subtask-depth: 1;");
    expect(boardRenderer).toContain("db-subtask-toggle");
    expect(boardRenderer).toContain("db-subtask-progress-derived");
    expect(boardRenderer).toContain("db-subtask-progress-explicit");
    expect(boardRenderer).toContain("db-subtask-add-input");
  });

  it("keeps every new class in the hand-written board and timeline states styled and sourced", () => {
    const boardMarkup = subtaskBoardCard(SUBTASK_FIXTURE_ROWS.parent, { children: true, done: 1, total: 2, explicit: 62, value: 62 });
    const treeParent = TL_SUBTASK_LANES.find((lane) => lane.key === "business").events[0];
    const timelineMarkup = timelineEvent(treeParent, TIMELINE_FIXTURES.week);
    const contracts = [
      ["db-subtask-toggle", boardRenderer, boardMarkup],
      ["db-subtask-progress", boardRenderer, boardMarkup],
      ["db-subtask-progress-track", boardRenderer, boardMarkup],
      ["db-subtask-progress-fill", boardRenderer, boardMarkup],
      ["db-subtask-progress-label", boardRenderer, boardMarkup],
      ["db-subtask-progress-derived", boardRenderer, boardMarkup],
      ["db-subtask-progress-explicit", boardRenderer, boardMarkup],
      ["db-subtask-add-row", boardRenderer, boardMarkup],
      ["db-subtask-add-input", boardRenderer, boardMarkup],
      ["db-subtask-event", timelineRenderer, timelineMarkup],
      ["has-subtask-children", timelineRenderer, timelineMarkup],
      ["db-subtask-event-toggle", timelineRenderer, timelineMarkup],
      ["db-timeline-subtask-progress", timelineRenderer, timelineMarkup],
    ];
    for (const [className, source, markup] of contracts) {
      expect(markup, `${className} is in its fixture`).toContain(className);
      expect(source, `${className} is emitted by its renderer`).toContain(className);
      expect(styles, `${className} has a stylesheet rule`).toContain(`.${className}`);
    }
  });

  it("keeps the tree out of the lanes every ordinary timeline capture renders", () => {
    // The five scale captures exist to show an un-related bar; the tree has its own scenario.
    for (const lane of TL_LANES) {
      for (const event of lane.events) {
        expect(event.subtask, `${lane.key}/${event.title} carries no subtask state`).toBeUndefined();
        expect(timelineEvent(event, TIMELINE_FIXTURES.week)).not.toContain("db-subtask-event");
      }
    }
    const treeLane = TL_SUBTASK_LANES.find((lane) => lane.key === "business");
    expect(treeLane.events.map((event) => event.subtask?.depth)).toEqual([0, 1, 1]);
    expect(treeLane.events[0].subtask.children).toBe(true);
    expect(TL_SUBTASK_LANES.find((lane) => lane.key === "personal").events.every((event) => !event.subtask)).toBe(true);
  });
});
