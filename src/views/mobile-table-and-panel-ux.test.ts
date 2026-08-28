// ───────────────────────────────────────────────────────────────────
// MODULE:    mobile-table-and-panel-ux.test
// COMPONENT: source assertions for the phone-layout repairs
// ───────────────────────────────────────────────────────────────────
//
// These assert against source text rather than a rendered DOM because the
// real renderers need a live Obsidian App, vault and metadata cache. That
// buys a cheap regression guard and nothing more: a rule can satisfy every
// check here and still look wrong on a device.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   Asserting on the shipped stylesheet means reading it from disk, which needs the node
   builtins the plugin runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const stylesContent = readFileSync(resolve(__dirname, "../../styles.css"), "utf-8");
const recordPanelSource = readFileSync(resolve(__dirname, "./record-detail-panel.ts"), "utf-8");

/** Declaration blocks whose selector list contains the exact selector, comments removed. */
const declarationsFor = (selector: string): string => {
  const withoutComments = stylesContent.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: string[] = [];
  const rule = /([^{}]+)\{([^{}]*)\}/g;
  let match = rule.exec(withoutComments);
  while (match) {
    const selectors = match[1].split(",").map((entry) => entry.trim());
    if (selectors.includes(selector)) blocks.push(match[2]);
    match = rule.exec(withoutComments);
  }
  return blocks.join("\n");
};

/** The concatenated bodies of every `@media (hover: hover)` block (balanced braces). */
const hoverHoverBlocks = (): string => {
  const blocks: string[] = [];
  const open = /@media \(hover: hover\)\s*\{/g;
  let match = open.exec(stylesContent);
  while (match) {
    let depth = 1;
    let i = match.index + match[0].length;
    const start = i;
    while (i < stylesContent.length && depth > 0) {
      const ch = stylesContent[i];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      i++;
    }
    blocks.push(stylesContent.slice(start, i - 1));
    match = open.exec(stylesContent);
  }
  return blocks.join("\n");
};

describe("mobile table and panel UX", () => {
  it("resets the desktop centring container so overflow is not thrown off-screen on a phone", () => {
    // db-width-default centres the view in a ~760px column via auto side margins; on a phone
    // that pushes any wider child's left edge past the viewport.
    const container = declarationsFor(".is-phone .note-database-container.db-width-default");
    expect(container).toMatch(/max-width:\s*none/);
    expect(container).toMatch(/margin-left:\s*0/);
    expect(container).toMatch(/margin-right:\s*0/);
  });

  it("drops the scroll-area fade mask on the phone table so the select column is not clipped", () => {
    const wrap = declarationsFor(".is-phone .note-database-container .db-table-wrap");
    expect(wrap).toMatch(/mask-image:\s*none/);
    expect(wrap).toMatch(/-webkit-mask-image:\s*none/);
  });

  it("pins the select checkbox to the right on the phone so header and rows line up", () => {
    const checkbox = declarationsFor(
      '.is-phone .note-database-container .db-table .db-select-col .db-select-inner input[type="checkbox"]'
    );
    expect(checkbox).toMatch(/position:\s*absolute/);
    expect(checkbox).toMatch(/right:\s*6px/);
  });

  it("auto-fits phone table columns to content and bounds them so they cannot run away", () => {
    const table = declarationsFor(".is-phone .note-database-container .db-table");
    expect(table).toMatch(/table-layout:\s*auto/);
    // The table/col widths are inline (JS-set); releasing them needs !important.
    expect(table).toMatch(/width:\s*auto\s*!important/);
    expect(table).toMatch(/min-width:\s*0\s*!important/);
    expect(declarationsFor(".is-phone .note-database-container .db-table col[data-note-database-column-key]")).toMatch(
      /width:\s*auto\s*!important/
    );
    // Data cells hug content on one line but are capped so a pathological value cannot
    // stretch a column without bound.
    const cell = declarationsFor(".is-phone .note-database-container .db-table th[data-note-database-column-key]");
    expect(cell).toMatch(/max-width:\s*60vw/);
    expect(cell).toMatch(/white-space:\s*nowrap/);
  });

  it("makes phone list cards fill the viewport and wrap their fields inside the border", () => {
    const row = declarationsFor(".is-phone .note-database-container .db-list-row");
    expect(row).toMatch(/width:\s*100%/);
    expect(row).toMatch(/grid-template-columns:\s*auto minmax\(0, 1fr\)/);
    expect(declarationsFor(".is-phone .note-database-container .db-list-row-meta")).toMatch(/flex-wrap:\s*wrap/);
    const field = declarationsFor(".is-phone .note-database-container .db-list-field");
    expect(field).toMatch(/flex:\s*1 1/);
    expect(field).toMatch(/min-width:\s*0/);
  });

  it("takes the board group header out of sticky flow on the phone so it cannot float over cards", () => {
    const header = declarationsFor(".is-phone .note-database-container .db-board-column-header");
    expect(header).toMatch(/position:\s*relative/);
    expect(header).toMatch(/top:\s*auto/);
  });

  it("guards the load-bearing hover states behind @media (hover: hover) so a tap leaves nothing stuck", () => {
    const hover = hoverHoverBlocks();
    expect(hover).toContain(".note-database-container .db-table tr:hover td");
    expect(hover).toContain(".note-database-container .db-table td:hover");
    expect(hover).toContain(".note-database-container .db-list-row:hover");
    expect(hover).toContain(".note-database-container .db-board-card:hover");
    expect(hover).toContain(".note-database-container .db-board-card-field:hover");
    expect(hover).toContain(".note-database-container .db-record-detail-field:hover");
  });

  it("shows a close button only in the record-detail bottom sheet, keeping the desktop panel unchanged", () => {
    expect(declarationsFor(".note-database-container .db-record-detail-panel .db-cell-edit-close")).toMatch(
      /display:\s*none/
    );
    expect(
      declarationsFor(".note-database-container .db-record-detail-panel.db-mobile-bottom-sheet .db-cell-edit-close")
    ).toMatch(/display:\s*inline-flex/);
  });

  it("makes the mobile bottom sheet border-box so its own padding does not overflow the viewport", () => {
    expect(declarationsFor(".db-mobile-bottom-sheet")).toMatch(/box-sizing:\s*border-box/);
  });

  it("dismisses the record panel via pointer events and the sheet affordances, not a mouse-only handler", () => {
    // pointerdown fires for both mouse and touch; the old mousedown handler never fired on a phone.
    expect(recordPanelSource).toContain('addEventListener("pointerdown", onOutside, true)');
    expect(recordPanelSource).not.toContain('addEventListener("mousedown", onOutside');
    // A permanent close control (reusing the existing close class) and a drag-to-dismiss gesture.
    expect(recordPanelSource).toContain('cls: "db-cell-edit-close"');
    expect(recordPanelSource).toContain('hasClass("db-mobile-bottom-sheet")');
    expect(recordPanelSource).toContain("attachSheetDragToDismiss");
  });
});
