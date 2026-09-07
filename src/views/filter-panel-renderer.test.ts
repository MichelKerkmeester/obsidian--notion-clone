// ───────────────────────────────────────────────────────────────────
// MODULE:    filter-panel-renderer.test
// COMPONENT: zero-rule entry tier and searchable condition dropdowns
// ───────────────────────────────────────────────────────────────────
//
// The filter panel builds real DOM against Obsidian's `createDiv`/`createEl` helpers, which this
// suite's `node` test environment does not provide — the same reason `toolbar-renderer.test.ts`
// pins its markup contract by reading the renderer's own source rather than mounting it. This
// suite follows the same idiom: it reads the shipped source and asserts on the structure the
// packet's acceptance criteria name, with the exact counts `tasks.md`'s red-first probes cite.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading the renderer source from disk needs the node builtins the plugin
   runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "filter-panel-renderer.ts"), "utf-8");

// ───────────────────────────────────────────────────────────────────
// 2. ZERO-RULE ENTRY TIER
// ───────────────────────────────────────────────────────────────────

describe("FilterPanelRenderer zero-rule entry tier", () => {
  it("renders a searchable property list, built from the same vocabulary the tree already uses", () => {
    expect(source).toContain("renderEntryTier(panel, containerEl, state, config, actions)");
    expect(source).toContain("db-dropdown-search");
    expect(source).toContain("db-dropdown-options");
    expect(source).toContain("toPropertyDropdownOption(col)");
    expect(source).toContain("filterPickerRows(rows, search.value)");
  });

  it("creates the first leaf through createDefaultFilterRule and appendLeaf, never a second rule factory", () => {
    expect(source).toMatch(/const rule = createDefaultFilterRule\(config\);\s*\n\s*rule\.field = field;/);
    expect(source).toContain("appendLeaf(state.filterTree, rule, state.filterLogic)");
  });

  it("falls back to the plain hint when there is nothing to list, rather than an empty search box", () => {
    expect(source).toMatch(/if \(columns\.length === 0\) \{\s*\n\s*panel\.createDiv\(\{ cls: "db-panel-empty", text: t\("panel\.emptyFilters"\) \}\);/);
  });

  it("gives the entry tier its own advanced-filter footer, distinct from the tree's + Add condition button", () => {
    expect(source).toContain('t("panel.addAdvancedFilter")');
    // The tree branch keeps its own, unrelated button — both wordings exist, and each is scoped
    // to its own branch rather than one label doing double duty.
    expect(source).toContain('`+ ${t("panel.addCondition")}`');
    expect(source).toContain('`+ ${t("panel.addAdvancedFilter")}`');
  });

  it("keeps the ≥1-rule branch's + Add condition button inside the tree branch, unmoved — the negative control", () => {
    const treeBranchStart = source.indexOf("this.renderFilterTreeNode(");
    const addConditionIndex = source.indexOf('`+ ${t("panel.addCondition")}`');
    expect(treeBranchStart).toBeGreaterThan(0);
    expect(addConditionIndex).toBeGreaterThan(treeBranchStart);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. SEARCHABLE CONDITION DROPDOWNS
// ───────────────────────────────────────────────────────────────────

describe("FilterPanelRenderer searchable condition dropdowns", () => {
  it("passes searchable: true on the field dropdown and the select/status value dropdown", () => {
    const occurrences = source.match(/searchable: true,/g) || [];
    // Exactly two sites in this file: the field dropdown and the select/status value dropdown.
    // Red before this leg: `grep -c searchable src/views/filter-panel-renderer.ts` read 0.
    expect(occurrences.length).toBe(2);
  });

  it("leaves the gate itself inside the dropdown primitive — no second count check here", () => {
    expect(source).not.toContain("options.length > 8");
  });
});
