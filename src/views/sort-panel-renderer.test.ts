// ───────────────────────────────────────────────────────────────────
// MODULE:    sort-panel-renderer.test
// COMPONENT: searchable sort field dropdown
// ───────────────────────────────────────────────────────────────────
//
// Same idiom as filter-panel-renderer.test.ts and toolbar-renderer.test.ts: the sort panel
// builds real DOM through Obsidian's helpers, which this suite's `node` environment does not
// provide, so the contract is pinned by reading the shipped source.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading the renderer source from disk needs the node builtins the plugin
   runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "sort-panel-renderer.ts"), "utf-8");

// ───────────────────────────────────────────────────────────────────
// 2. SEARCHABLE FIELD DROPDOWN
// ───────────────────────────────────────────────────────────────────

describe("SortPanelRenderer searchable field dropdown", () => {
  it("passes searchable: true on the sort field dropdown, and nowhere else", () => {
    const occurrences = source.match(/searchable: true,/g) || [];
    // Red before this leg: `grep -c searchable src/views/sort-panel-renderer.ts` read 0.
    expect(occurrences.length).toBe(1);
  });

  it("does not touch the direction dropdown beside it", () => {
    const fieldIndex = source.indexOf("db-sort-field-dropdown");
    const searchableIndex = source.indexOf("searchable: true,");
    const directionIndex = source.indexOf("db-sort-direction-dropdown");
    expect(fieldIndex).toBeGreaterThan(0);
    expect(searchableIndex).toBeGreaterThan(fieldIndex);
    // The direction dropdown, if it exists past the field one, must sit after the searchable
    // flag rather than swallow it into its own options block.
    if (directionIndex >= 0) expect(directionIndex).toBeGreaterThan(searchableIndex);
  });
});
