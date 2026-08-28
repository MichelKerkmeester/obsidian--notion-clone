/* eslint-disable import/no-nodejs-modules, no-undef --
   Asserting on the shipped stylesheet means reading it from disk, which needs the node
   builtins the plugin runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const stylesContent = readFileSync(resolve(__dirname, "../../styles.css"), "utf-8");
const toolbarSource = readFileSync(resolve(__dirname, "./ToolbarRenderer.ts"), "utf-8");

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

describe("add-view popover layout", () => {
  it("keeps the duplicate checkbox at its native size instead of stretching it to the form width", () => {
    // The form's full-bleed sizing exists for the text fields; a bare `input` selector also
    // catches the checkbox and flattens it into a form-wide pill with no visible caption.
    const stretchedSelectors = stylesContent.match(/\.db-add-view-form input[^,{\n]*/g) ?? [];
    expect(stretchedSelectors.length).toBeGreaterThan(0);
    for (const selector of stretchedSelectors) {
      expect(selector).toContain(':not([type="checkbox"])');
    }

    const checkbox = declarationsFor(".note-database-container .db-add-view-duplicate input");
    expect(checkbox).toMatch(/flex:\s*0 0 auto/);
    expect(checkbox).not.toMatch(/width:\s*100%/);
  });

  it("lays the view-type cards out as vertical tiles rather than single-line menu rows", () => {
    const card = declarationsFor(".note-database-container .db-add-view-card");
    // A bare <button> is pinned to the app's single-line input height, so without an explicit
    // reset the preview and caption paint outside the tile and over its neighbours.
    expect(card).toMatch(/height:\s*auto/);
    expect(card).toMatch(/display:\s*grid/);
    expect(card).toMatch(/grid-template-columns:\s*minmax\(0, 1fr\)/);
    // Buttons inherit nowrap from the same place; captions have to be allowed to wrap.
    expect(card).toMatch(/white-space:\s*normal/);
  });

  it("does not tag the cards with the shared menu-row class that owns the horizontal row box", () => {
    expect(toolbarSource).toContain('cls: "db-add-view-card"');
    expect(toolbarSource).not.toContain("db-add-view-card db-menu-item");
    // Keyboard navigation keys off the role, not the class, so dropping the class is safe.
    expect(toolbarSource).toContain('role: "menuitem", "aria-label": text');
  });

  it("leaves the shared menu-row rule intact for the menus that are actually rows", () => {
    expect(declarationsFor(".db-menu-item")).toMatch(/min-height:\s*30px/);
    expect(toolbarSource).toContain('cls: "db-add-view-duplicate-action db-menu-item"');
  });

  it("gives every card a caption that fits inside the tile", () => {
    const label = declarationsFor(".note-database-container .db-add-view-card-label");
    expect(label).toMatch(/min-width:\s*0/);
    expect(label).toMatch(/overflow-wrap:\s*anywhere/);
  });

  it("sizes the tiles uniformly and keeps the grid inside the popover width", () => {
    const cards = declarationsFor(".note-database-container .db-add-view-cards");
    expect(cards).toMatch(/grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
    expect(cards).toMatch(/grid-auto-rows:\s*1fr/);

    // The viewport clamp on the popover only holds if its frame counts toward the width.
    expect(declarationsFor(".note-database-container .db-add-view-popover")).toMatch(
      /box-sizing:\s*border-box/
    );
  });

  it("keeps the duplicate action on its own full-width row under the grid", () => {
    const action = declarationsFor(".note-database-container .db-add-view-duplicate-action");
    expect(action).toMatch(/width:\s*100%/);
    expect(action).toMatch(/height:\s*auto/);
    expect(action).toMatch(/border-top:\s*1px solid/);
  });
});
