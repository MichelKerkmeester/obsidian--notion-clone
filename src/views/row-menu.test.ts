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
