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
// The header block — including the close button's class — moved into the shared header primitive
// (`record-surface/record-header.ts`) when the record sheet switched onto it; the sheet-dismiss
// assertions below read both sources rather than assuming everything is still one file.
const recordHeaderSource = readFileSync(resolve(__dirname, "./record-surface/record-header.ts"), "utf-8");

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
    // 4px, not the 6px this pinned when the cell held one control. The cell also holds a 28px
    // reorder button in flow, and in a 64px column 6px left a 2px seam between the two targets
    // where 4px leaves a 4px gap. The pin itself is what this test is for; the inset is the part
    // the column's arithmetic decides.
    expect(checkbox).toMatch(/right:\s*4px/);
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

  it("guards the load-bearing hover states behind @media (hover: hover) so a tap leaves nothing stuck", () => {
    const hover = hoverHoverBlocks();
    expect(hover).toContain(".note-database-container .db-table tr:hover td");
    expect(hover).toContain(".note-database-container .db-table td:hover");
    expect(hover).toContain(".note-database-container .db-list-row:hover");
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
    expect(recordHeaderSource).toContain('cls: "db-cell-edit-close"');
    expect(recordPanelSource).toContain('hasClass("db-mobile-bottom-sheet")');
    expect(recordPanelSource).toContain("attachSheetDragToDismiss");
  });

  it("raises the hidden-properties disclosure and its eye button to a 44px hit box on the sheet, leaving the anchored desktop popover and the row pitch alone", () => {
    // The disclosure toggle: a standalone tappable control, the same reasoning the table's
    // load-more button and footer trigger already raise on. Sheet-only, so the anchored desktop
    // popover (no `.db-mobile-bottom-sheet` ancestor) keeps its compact height.
    expect(declarationsFor(".db-mobile-bottom-sheet .db-record-detail-hidden-toggle")).toMatch(/min-height:\s*44px/);
    expect(declarationsFor(".note-database-container .db-record-detail-hidden-toggle")).not.toMatch(/min-height/);

    // The per-row eye button: fills the 44px the row's own `--db-sheet-row-min-height` already
    // reserves per row on the sheet, rather than growing the row.
    expect(declarationsFor(".db-mobile-bottom-sheet .db-record-detail-hidden-eye")).toMatch(/min-width:\s*44px/);
    expect(declarationsFor(".db-mobile-bottom-sheet .db-record-detail-hidden-eye")).toMatch(/min-height:\s*44px/);

    // Negative control: the row pitch itself is untouched by this fix, and neither the chevron nor
    // the drag handle — decorative spans with no click handler — gained a hit box they cannot use.
    expect(declarationsFor(".db-mobile-bottom-sheet .db-record-detail-hidden-row")).toMatch(
      /min-height:\s*var\(--db-sheet-row-min-height,\s*30px\)/
    );
    expect(declarationsFor(".db-mobile-bottom-sheet .db-record-detail-hidden-chevron")).not.toMatch(/min-width|min-height/);
    expect(declarationsFor(".db-mobile-bottom-sheet .db-record-detail-hidden-drag")).not.toMatch(/min-width|min-height/);
  });
});
