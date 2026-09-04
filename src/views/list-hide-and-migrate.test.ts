// ───────────────────────────────────────────────────────────────────
// MODULE:    list-hide-and-migrate.test
// COMPONENT: the retirement's host wiring — what no longer offers a list, what no longer
//            produces one, and where an existing one is redirected on open
// ───────────────────────────────────────────────────────────────────
//
// The list renderer needs a live Obsidian App, so the surfaces that host it are asserted on the
// source they ship, the same way the add-view suite already keeps the picker and its fixture in
// step. Each assertion pins the concrete seam the retirement moves: the two pickers' filter lines
// (with the escape hatch that keeps a list view's own control honest), the two load-time minters,
// and the two render dispatches that redirect a list-configured view to the table.

/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading the shipped source from disk needs the node builtins the plugin runtime rule forbids.
   Scoped to this suite, which never ships. */

// ───────────────────────────────────────────────────────────────────
// 1. SOURCE COLLECTION
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const read = (relative: string): string => readFileSync(resolve(__dirname, relative), "utf-8");

const mainSource = read("../main.ts");
const toolbarSource = read("./toolbar-renderer.ts");
const viewConfigPanelSource = read("./view-config-panel-renderer.ts");
const databaseViewSource = read("./database-view.ts");
const embeddedSource = read("./embedded-database-renderer.ts");

/** A method body: from its signature to the next sibling at the same indent. */
const methodBody = (source: string, signature: string): string => {
  const start = source.indexOf(signature);
  expect(start).toBeGreaterThanOrEqual(0);
  const end = source.indexOf("\n  private ", start);
  return end === -1 ? source.slice(start) : source.slice(start, end);
};

// ───────────────────────────────────────────────────────────────────
// 2. THE PICKERS
// ───────────────────────────────────────────────────────────────────

describe("no picker offers list", () => {
  it("withdraws list from the add-view and view-type menus beside gallery, with the escape hatch", () => {
    expect(toolbarSource).toContain('option.value !== "list" || current === "list"');
  });

  it("withdraws list from the view-config panel's type picker, with the escape hatch", () => {
    expect(viewConfigPanelSource).toContain('option.value !== "list" || config.viewType === "list"');
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. THE MINTERS
// ───────────────────────────────────────────────────────────────────

describe("nothing mints a list anymore", () => {
  it("no longer treats list as a valid persisted type in the settings-load sanitizer", () => {
    const sanitizerLines = mainSource.split("\n").filter((line) => line.includes('viewType !== "board"'));
    expect(sanitizerLines.length).toBeGreaterThanOrEqual(2);
    for (const line of sanitizerLines) {
      expect(line).not.toContain('"list"');
    }
  });

  it("maps a .base list view to a table instead of carrying the type through", () => {
    // The import filter still ACCEPTS list views — an existing .base must not stop importing —
    // so the seam to pin is the mapping line, not the filter: the type derivation may no longer
    // produce a list.
    const viewTypeLine = mainSource.split("\n").find((line) => line.includes('bv.type === "cards" ? "board"'));
    expect(viewTypeLine).toBeDefined();
    expect(viewTypeLine).not.toContain('"list"');
    expect(viewTypeLine).toContain('? "board" : "table"');
  });

  it("names an imported list view as a table view rather than as a list view", () => {
    const nameLine = mainSource.split("\n").find((line) => line.includes("name: bv.name ||"));
    expect(nameLine).toBeDefined();
    expect(nameLine).not.toContain("common.listView");
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE DISPATCHES
// ───────────────────────────────────────────────────────────────────

describe("an existing list is redirected to the table renderer", () => {
  it("no longer dispatches list to the list renderer in the file view", () => {
    const renderBody = methodBody(databaseViewSource, "private render(): void {");
    expect(renderBody).not.toMatch(/viewType === "list"/);
  });

  it("no longer dispatches list to the list renderer on the embed path", () => {
    const renderResultsBody = methodBody(embeddedSource, "private renderResults(config: ViewConfig");
    expect(renderResultsBody).not.toMatch(/viewType === "list"/);
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. THE MIGRATION HOOKS
// ───────────────────────────────────────────────────────────────────

describe("the migration runs on open in both hosts", () => {
  it("imports and runs the list migration in the file view", () => {
    expect(databaseViewSource).toContain("planListMigration");
    expect(databaseViewSource).toContain("migrateListViewOnOpen");
  });

  it("imports and runs the list migration on the embed path", () => {
    expect(embeddedSource).toContain("planListMigration");
    expect(embeddedSource).toContain("migrateListViewOnOpen");
  });
});
