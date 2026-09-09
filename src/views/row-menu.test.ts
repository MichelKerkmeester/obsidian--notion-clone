// ───────────────────────────────────────────────────────────────────
// MODULE:    row-menu.test
// COMPONENT: the row context menu's never-empty guarantee
// ───────────────────────────────────────────────────────────────────
//
// RowMenu.show constructs its menu against Obsidian's real Menu class and a document it reads
// off this.actions.app.workspace.containerEl, both of which this suite has no fixture for. The
// guarantee this file protects — the menu's first row is added before any capability check runs,
// so no combination of actions ever opens empty — is a source shape rather than a runtime value,
// so it is checked the way this codebase already checks shared shapes it cannot mount
// (toolbar-surface-contract.test.ts): read the method's own text and pin the ordering.

/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading the method's own source needs the node builtins the plugin runtime rule forbids.
   Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "./row-menu.ts"), "utf-8");

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("RowMenu.show's first row", () => {
  it("adds the open-note row before any capability check runs", () => {
    const showStart = source.indexOf("show(\n");
    expect(showStart).toBeGreaterThan(-1);
    const menuCreated = source.indexOf("createOwnedMenu(", showStart);
    expect(menuCreated).toBeGreaterThan(showStart);
    const firstAddRow = source.indexOf("menu.addRow(", menuCreated);
    expect(firstAddRow).toBeGreaterThan(menuCreated);

    // Nothing conditional sits between the menu's construction and its first row: no `if (`
    // guards the open-note row, so the menu can never open with zero rows.
    const between = source.slice(menuCreated, firstAddRow);
    expect(between).not.toContain("if (");
    expect(source.slice(firstAddRow, firstAddRow + 200)).toContain('t("menu.openNote")');
  });
});

// The board card menu is the entry point for the settings sheet's title rows: the operator asked
// where a board's card name and its number format are set on a build that already shipped both.
// The path this suite pins is two taps — open the card menu, tap the entry — because those are
// the only two taps a thumb is already making; the rows themselves sit mid-sheet behind the
// generic Settings entry, where the operator did not think to scroll. OwnedMenu needs a real
// document this suite does not have, so the path is pinned the way the guarantee above is: by
// reading the shipped source, here across both files the path lives in.
describe("the two-tap path from a board card to the title rows", () => {
  const databaseViewSource = readFileSync(resolve(__dirname, "./database-view.ts"), "utf-8");

  it("the card menu offers Card title on a board, wired to the one settings-jump action", () => {
    const show = source.slice(source.indexOf("show(\n"));
    const entry = show.indexOf('t("menu.cardTitle")');
    expect(entry, "the card menu carries no Card title row").toBeGreaterThan(-1);
    // Board-only: the row names the board's card, and the action it calls must be the settings
    // jump, not a second picker built into the menu.
    const guardStart = show.lastIndexOf("viewType", entry);
    expect(guardStart).toBeGreaterThan(-1);
    expect(show.slice(guardStart, entry)).toContain('"board"');
    const untilNextSeparator = show.indexOf("menu.addSeparator", entry);
    expect(show.slice(entry, untilNextSeparator === -1 ? undefined : untilNextSeparator)).toContain("openCardTitleSettings");
  });

  it("the settings jump opens the settings sheet itself and scrolls to the title-field row", () => {
    const implementation = databaseViewSource.indexOf("private openCardTitleSettings");
    expect(implementation, "DatabaseView has no openCardTitleSettings implementation").toBeGreaterThan(-1);
    const method = databaseViewSource.slice(implementation, databaseViewSource.indexOf("\n  private ", implementation + 1));
    // Opens the panel it already renders — the one canonical settings surface — rather than
    // cloning the picker, and reaches the rows by the same marker the Properties sheet's
    // own Title slot jumps to.
    expect(method).toContain('toggleHeaderPopover("view"');
    expect(method).toContain('[data-config-row="title-field"]');
    expect(method).toContain("scrollIntoView");
    expect(method).not.toContain("createDiv");
  });
});
