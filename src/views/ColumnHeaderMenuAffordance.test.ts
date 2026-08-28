/* eslint-disable import/no-nodejs-modules, no-undef --
   Asserting on the shipped stylesheet means reading it from disk, which needs the node
   builtins the plugin runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const stylesContent = readFileSync(resolve(__dirname, "../../styles.css"), "utf-8");
const columnHeaderSource = readFileSync(resolve(__dirname, "./ColumnHeaderController.ts"), "utf-8");
const boardSource = readFileSync(resolve(__dirname, "./BoardRenderer.ts"), "utf-8");

interface CssRule {
  selectors: string[];
  body: string;
}

// Comments are stripped first so a prose comma inside one cannot masquerade as a selector
// separator. Rule bodies never nest, so this also walks correctly into @media blocks.
const cssRules: CssRule[] = Array.from(
  stylesContent.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g),
).map((match) => ({
  selectors: match[1].split(",").map((selector) => selector.trim()).filter(Boolean),
  body: match[2],
}));

function rulesFor(selector: string): CssRule[] {
  const found = cssRules.filter((rule) => rule.selectors.includes(selector));
  if (found.length === 0) throw new Error(`No rule declares the selector \`${selector}\``);
  return found;
}

function declaration(rule: CssRule, property: string): string | undefined {
  const found = new RegExp(`;\\s*${property}\\s*:\\s*([^;]+)`).exec(`;${rule.body}`);
  return found ? found[1].trim() : undefined;
}

function declaredIn(selector: string, property: string): string | undefined {
  for (const rule of rulesFor(selector)) {
    const value = declaration(rule, property);
    if (value !== undefined) return value;
  }
  return undefined;
}

describe("table column header menu trigger sits inline after the name", () => {
  it("keeps the trigger in flow instead of positioning it out of the header row", () => {
    // Absolute positioning is what let a later blanket `position: relative` touch-target
    // rule win on specificity and drop the button onto a line of its own.
    const trigger = rulesFor(".note-database-container .db-column-menu-trigger");
    expect(trigger).toHaveLength(1);
    expect(declaration(trigger[0], "position")).not.toBe("absolute");
    expect(declaration(trigger[0], "display")).toBe("inline-flex");
  });

  it("declares the trigger's position exactly once so no later rule can silently override it", () => {
    const positioning = cssRules.filter(
      (rule) =>
        rule.selectors.some((selector) => selector.endsWith(".db-column-menu-trigger"))
        && declaration(rule, "position") !== undefined,
    );
    expect(positioning).toHaveLength(1);
    expect(declaration(positioning[0], "position")).toBe("relative");
  });

  it("makes the trigger a fixed, non-shrinking sibling 2px after the name", () => {
    const trigger = rulesFor(".note-database-container .db-column-menu-trigger")[0];
    expect(declaration(trigger, "flex")).toBe("0 0 auto");
    expect(declaration(trigger, "margin-left")).toBe("2px");
  });

  it("keeps the trigger's hit halo off the name it now sits beside", () => {
    const halo = cssRules.filter(
      (rule) =>
        rule.selectors.includes(".note-database-container .db-column-menu-trigger::before")
        && declaration(rule, "inset") !== undefined,
    );
    expect(halo).toHaveLength(1);
    // A symmetric halo would reach back over the label and swallow click-to-sort.
    expect(declaration(halo[0], "inset")).toBe("-8px -8px -8px 0");
  });

  it("lets only the column name shrink, so a narrow column ellipsises the name", () => {
    const label = rulesFor(".note-database-container .db-th-label")[0];
    expect(declaration(label, "flex")).toBe("0 1 auto");
    expect(declaration(label, "min-width")).toBe("0");
    expect(declaration(label, "overflow")).toBe("hidden");
    expect(declaration(label, "text-overflow")).toBe("ellipsis");
    expect(declaration(label, "white-space")).toBe("nowrap");
  });

  it("mounts the trigger inside the header's flex row rather than on the cell", () => {
    expect(columnHeaderSource).toContain('th.querySelector<HTMLElement>(".db-th-content")');
    expect(columnHeaderSource).toContain('row.createEl("button"');
  });

  it("uses the vertical ellipsis icon", () => {
    expect(columnHeaderSource).toContain('setIcon(button, "more-vertical")');
    expect(columnHeaderSource).not.toContain("more-horizontal");
  });
});

describe("board column header options button mirrors the table trigger", () => {
  it("gives the options button an inline, non-shrinking box", () => {
    const options = rulesFor(".note-database-container .db-board-column-options")[0];
    expect(declaration(options, "display")).toBe("inline-flex");
    expect(declaration(options, "flex")).toBe("0 0 auto");
    expect(declaration(options, "margin-left")).toBe("2px");
    expect(declaration(options, "position")).not.toBe("absolute");
  });

  it("lets only the group name shrink inside the header text row", () => {
    const row = rulesFor(".note-database-container .db-board-header-text")[0];
    expect(declaration(row, "display")).toBe("flex");
    expect(declaration(row, "flex")).toBe("0 1 auto");
    expect(declaration(row, "min-width")).toBe("0");

    const title = rulesFor(".note-database-container .db-board-header-text > .db-board-column-title")[0];
    expect(declaration(title, "flex")).toBe("0 1 auto");
    expect(declaration(title, "overflow")).toBe("hidden");
    expect(declaration(title, "text-overflow")).toBe("ellipsis");

    for (const fixed of [".note-database-container .db-board-count", ".note-database-container .db-board-header-summaries"]) {
      expect(declaredIn(fixed, "flex")).toBe("0 0 auto");
    }
  });

  it("mounts the options button in the name row instead of the header edge", () => {
    expect(boardSource).toContain("this.renderBoardGroupOptions(title, config, groupField, group)");
    expect(boardSource).toContain("this.renderBoardGroupOptions(headerText, config, groupField, group)");
    expect(boardSource).not.toMatch(/renderBoardGroupOptions\(header,/);
  });

  it("uses the vertical ellipsis icon", () => {
    expect(boardSource).toContain('setIcon(button, "more-vertical")');
    expect(boardSource).not.toContain("more-horizontal");
  });
});

describe("drag cursor is scoped to the column header background", () => {
  it("shows grab only on draggable property cells, never on the fixed table columns", () => {
    expect(declaredIn(".note-database-container .db-table th[data-note-database-column-key]", "cursor")).toBe("grab");
    // The select / record-icon / add-column cells are not draggable, so the base cell rule
    // must stay on the pointer rather than promising a drag that never starts.
    expect(declaredIn(".note-database-container .db-table th", "cursor")).toBe("pointer");
  });

  it("returns the pointer over the name and the menu button", () => {
    expect(declaredIn(".note-database-container .db-table th .db-th-label", "cursor")).toBe("pointer");
    expect(declaredIn(".note-database-container .db-column-menu-trigger", "cursor")).toBe("pointer");
  });

  it("keeps the board header background on grab while its name row takes the pointer", () => {
    expect(declaredIn(".note-database-container .db-board-column-header", "cursor")).toBe("grab");
    expect(declaredIn(".note-database-container .db-board-column-header .db-board-header-text", "cursor")).toBe("pointer");
    expect(declaredIn(".note-database-container .db-board-column-options", "cursor")).toBe("pointer");
  });
});
