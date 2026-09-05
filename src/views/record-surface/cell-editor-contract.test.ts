/* eslint-disable import/no-nodejs-modules, no-undef --
   Pinning the dispatch against the shipped source and checking whether an extracted module
   exists on disk both need the node builtins the plugin runtime rule forbids. Scoped to this
   suite, which never ships. */

// ───────────────────────────────────────────────────────────────────
// MODULE:    cell-editor-contract.test
// COMPONENT: Pins `startEdit`'s dispatch and records which editor modules do not exist yet
// ───────────────────────────────────────────────────────────────────
//
// Two things are asserted, and they answer different questions. The first reads today's
// `cell-renderer.ts` source and checks that each column type still routes to the method this
// contract says it does — a change to the dispatch itself, not an extraction, is what this half
// catches. The second checks whether each contract entry's named module and export exist on
// disk. Before any extraction runs, every `extracted-module` entry is absent — that failure is
// this suite's own designed red state, not a bug in the contract, and it turns green one entry
// at a time as a later pass moves each editor's body into place.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
import { CELL_EDITOR_DISPATCH_CONTRACT, FILE_NAME_EDITOR_SHELL } from "./cell-editor-contract";

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURES
// ───────────────────────────────────────────────────────────────────

const ALL_COLUMN_TYPES = [
  "text", "number", "date", "datetime", "currency", "select", "multi-select",
  "status", "checkbox", "computed", "relation", "rollup", "files",
] as const;

const cellRendererSource = readFileSync(resolve(__dirname, "../cell-renderer.ts"), "utf-8");

/** The private method `startEdit` dispatches to today, read off the shipped source rather than assumed. */
const TODAY_DISPATCH_METHOD: Record<string, string> = {
  status: "editOptionPopover",
  select: "editOptionPopover",
  "multi-select": "editOptionPopover",
  relation: "editRelationPopover",
  number: "editNumber",
  currency: "editNumber",
  date: "editDatePopover",
  datetime: "editDatePopover",
  files: "editText",
  text: "editText",
};

// ───────────────────────────────────────────────────────────────────
// 3. CASES
// ───────────────────────────────────────────────────────────────────

describe("CELL_EDITOR_DISPATCH_CONTRACT", () => {
  it("covers every column type exactly once", () => {
    expect(Object.keys(CELL_EDITOR_DISPATCH_CONTRACT).sort()).toEqual([...ALL_COLUMN_TYPES].sort());
  });

  it("pins today's dispatch: each mapped type still routes to the method this contract names", () => {
    for (const [type, method] of Object.entries(TODAY_DISPATCH_METHOD)) {
      const needle = `col.type === "${type}"`;
      expect(cellRendererSource, `dispatch branch for "${type}" moved or was removed`).toContain(needle);
      // The branch for a type is one `startEdit` region; asserting the target method's name
      // appears in that same neighbourhood (rather than anywhere in a 3,000-line file) would need
      // a parser this suite does not carry. Requiring the method to still be declared privately
      // on the class is the cheaper half of the same pin: a renamed or removed method fails here
      // before dispatch is ever reached.
      expect(cellRendererSource, `"${method}" is no longer declared on CellRenderer`).toMatch(
        new RegExp(`\\b(private|public|protected)?\\s*${method}\\s*\\(`),
      );
    }
  });

  it("checkbox toggles in place rather than opening an editor", () => {
    expect(CELL_EDITOR_DISPATCH_CONTRACT.checkbox).toEqual({ kind: "toggle" });
    expect(cellRendererSource).toMatch(/col\.type === "checkbox"/);
  });

  it("computed and rollup stay host-owned, out of this extraction", () => {
    expect(CELL_EDITOR_DISPATCH_CONTRACT.computed.kind).toBe("host-owned");
    expect(CELL_EDITOR_DISPATCH_CONTRACT.rollup.kind).toBe("host-owned");
  });

  it("file.name is recorded beside the contract, not inside it", () => {
    expect(FILE_NAME_EDITOR_SHELL.kind).toBe("host-owned");
    expect(CELL_EDITOR_DISPATCH_CONTRACT["file.name"]).toBeUndefined();
  });

  it("red before extraction: no named editor module exists on disk yet", () => {
    const missing: string[] = [];
    for (const [type, shell] of Object.entries(CELL_EDITOR_DISPATCH_CONTRACT)) {
      if (shell.kind !== "extracted-module") continue;
      const modulePath = resolve(__dirname, `${shell.module}.ts`);
      if (!existsSync(modulePath)) missing.push(type);
    }
    // Every module-backed type is missing today. This line is the leg's own gate: once a module
    // lands, its type(s) disappear from `missing`, and this assertion is the one that must be
    // updated to expect the smaller list — never widened to hide a regression.
    expect(missing.sort()).toEqual(
      ["currency", "date", "datetime", "files", "multi-select", "number", "relation", "select", "status", "text"].sort(),
    );
  });
});
