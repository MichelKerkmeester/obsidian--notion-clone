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

/**
 * `startEdit`'s own body, sliced off the shipped source. Reading the whole file instead lets a
 * needle from a different method — `startEditSession`'s bulk branch tests the same column types —
 * stand in for a dispatch branch that has been deleted, which is the one regression this pin
 * exists to catch.
 */
function startEditBody(source: string): string {
  const start = source.indexOf("\n  startEdit(");
  const end = source.indexOf("\n  startEditSession(", start);
  if (start < 0 || end < 0) throw new Error("startEdit / startEditSession no longer bound the dispatch");
  return source.slice(start, end);
}

const startEditSource = startEditBody(cellRendererSource);

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
};

// ───────────────────────────────────────────────────────────────────
// 3. CASES
// ───────────────────────────────────────────────────────────────────

describe("CELL_EDITOR_DISPATCH_CONTRACT", () => {
  it("covers every column type exactly once", () => {
    expect(Object.keys(CELL_EDITOR_DISPATCH_CONTRACT).sort()).toEqual([...ALL_COLUMN_TYPES].sort());
  });

  it("pins today's dispatch: each guarded type's branch still calls the method this contract names", () => {
    for (const [type, method] of Object.entries(TODAY_DISPATCH_METHOD)) {
      const branch = startEditSource.indexOf(`col.type === "${type}"`);
      expect(branch, `dispatch branch for "${type}" moved out of startEdit or was removed`).toBeGreaterThan(-1);
      const untilNextBranch = startEditSource.slice(branch, branch + 400);
      expect(untilNextBranch, `"${type}" no longer dispatches to ${method}`).toContain(`this.${method}(`);
    }
  });

  it("an unguarded text column falls through to the text editor", () => {
    // `text` carries no branch of its own; it is what `startEdit` reaches when nothing else matched,
    // so the pin is the closing statement rather than a `col.type` needle.
    expect(startEditSource.trimEnd()).toMatch(/this\.editText\([^;]*\);\s*\}\s*$/);
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

  it("green after extraction: every named editor module exists and exports the name it declares", () => {
    const missing: string[] = [];
    for (const [type, shell] of Object.entries(CELL_EDITOR_DISPATCH_CONTRACT)) {
      if (shell.kind !== "extracted-module") continue;
      const modulePath = resolve(__dirname, `${shell.module}.ts`);
      if (!existsSync(modulePath)) {
        missing.push(type);
        continue;
      }
      // A file on disk is not an editor. The contract names the export each type resolves to, and
      // the class has to reach it — otherwise the module can exist beside a dispatch that still
      // runs its own private copy.
      const moduleSource = readFileSync(modulePath, "utf-8");
      if (!new RegExp(`export function ${shell.export}\\b`).test(moduleSource)) missing.push(`${type} (export)`);
      if (!cellRendererSource.includes(`${shell.export}(`)) missing.push(`${type} (unreached)`);
    }
    // Was every module-backed type before the extraction landed — the designed red this contract
    // pins ahead of any body moving. Every type now resolves to its extracted module, so `missing`
    // is empty — never widened back to hide a regression if a future edit deletes one.
    expect(missing.sort()).toEqual([]);
  });
});
