// ───────────────────────────────────────────────────────────────────
// MODULE:    column-config.test
// COMPONENT: locks column-rename coherence and auto-hide-vs-narrowing behavior
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import { getVisibleColumns, updateColumnKeyReferences } from "./column-config";
import { flattenLeaves } from "./view-filter-tree";
import type { DatabaseViewState } from "../views/view-state-store";
import type { FilterRule, SourceRuleNode, ViewConfig } from "./types";

// ColumnConfig.ts transitively imports FileFields.ts, which calls real obsidian
// runtime helpers (getAllTags/normalizePath). The "obsidian" package ships types
// only, so it must be stubbed the same way DataSource.test.ts does for its own
// obsidian-touching import chain.
vi.mock("obsidian", () => ({
  App: class {},
  CachedMetadata: class {},
  TFile: class {},
  getAllTags: vi.fn(() => []),
  normalizePath: (path: string) => path,
}));

const leaf = (field: string, value: string): FilterRule => ({ field, op: "eq", value });

function viewConfig(overrides: Partial<ViewConfig> = {}): ViewConfig {
  return {
    name: "View",
    sourceFolder: "",
    schema: { columns: [], computedFields: [] },
    ...overrides,
  };
}

function viewState(overrides: Partial<DatabaseViewState> = {}): DatabaseViewState {
  return {
    searchText: "",
    statusFilter: "",
    groupByField: "",
    filters: [],
    hiddenColumns: new Set<string>(),
    filterLogic: "and",
    sortDirection: "asc",
    sortRules: [],
    ...overrides,
  };
}

// ───────────────────────────────────────────────────────────────────
// 1. COLUMN RENAME COHERENCE
// ───────────────────────────────────────────────────────────────────

// Column rename is one of the "non-panel" mutation sites that must keep state.filterTree
// coherent with the legacy flat filters array. These tests exercise the real exported
// dual-write function rather than re-implementing its logic.
describe("updateColumnKeyReferences keeps filters and filterTree coherent", () => {
  it("renames a column across the flat filters array and the nested filter tree together, at config, per-view-mode, and state level", () => {
    const filterTree: SourceRuleNode = {
      type: "group",
      logic: "and",
      rules: [
        leaf("price", "10"),
        { type: "group", logic: "or", rules: [leaf("price", "20"), leaf("status", "done")] },
      ],
    };
    const config = viewConfig({
      filters: [leaf("price", "10"), leaf("price", "20"), leaf("status", "done")],
      filterTree,
      viewStates: {
        table: {
          filters: [leaf("price", "10")],
          filterTree: { type: "group", logic: "and", rules: [leaf("price", "10")] },
        },
      },
    });
    const state = viewState({
      filters: [leaf("price", "10"), leaf("price", "20"), leaf("status", "done")],
      filterTree,
    });

    const changed = updateColumnKeyReferences(config, state, "price", "cost");

    expect(changed).toBe(true);

    // Config level: no "price" leaf survives in either representation, and they still agree.
    expect(config.filters).toEqual([leaf("cost", "10"), leaf("cost", "20"), leaf("status", "done")]);
    expect(flattenLeaves(config.filterTree)).toEqual(config.filters);

    // View-state level: same coherence property, independently maintained.
    expect(state.filters).toEqual([leaf("cost", "10"), leaf("cost", "20"), leaf("status", "done")]);
    expect(flattenLeaves(state.filterTree)).toEqual(state.filters);

    // Per-view-mode saved state (config.viewStates) is renamed too.
    expect(config.viewStates?.table?.filters).toEqual([leaf("cost", "10")]);
    expect(flattenLeaves(config.viewStates?.table?.filterTree)).toEqual(config.viewStates?.table?.filters);
  });

  it("still rewrites a tree-only leaf that has no counterpart in the flat filters array, and reports it as a change", () => {
    const config = viewConfig({
      filters: [],
      filterTree: leaf("price", "10"),
    });

    const changed = updateColumnKeyReferences(config, undefined, "price", "cost");

    expect(changed).toBe(true);
    expect(config.filterTree).toEqual(leaf("cost", "10"));
    expect(config.filters).toEqual([]);
  });

  it("leaves the flat filters and filter tree untouched when the renamed key isn't referenced anywhere", () => {
    const filterTree: SourceRuleNode = leaf("keep", "1");
    const config = viewConfig({ filters: [leaf("keep", "1")], filterTree });
    const state = viewState({ filters: [leaf("keep", "1")], filterTree: leaf("keep", "1") });

    const changed = updateColumnKeyReferences(config, state, "missing", "renamed");

    expect(changed).toBe(false);
    expect(config.filters).toEqual([leaf("keep", "1")]);
    expect(config.filterTree).toEqual(filterTree);
    expect(state.filters).toEqual([leaf("keep", "1")]);
    expect(state.filterTree).toEqual(filterTree);
  });
});

// ───────────────────────────────────────────────────────────────────
// 2. AUTO-HIDE VS NARROWING
// ───────────────────────────────────────────────────────────────────

describe("getVisibleColumns keeps the table schema stable for narrowed results", () => {
  it("does not auto-hide a property just because the filtered rows have no value", () => {
    const config = viewConfig({
      schema: {
        columns: [{ key: "category", label: "Category", type: "text" }],
        computedFields: [],
      },
    });
    const row = { file: { path: "one.md" }, frontmatter: {}, computed: {} } as never;
    const state = viewState({ filters: [leaf("category", "missing")] });

    expect(getVisibleColumns(config, [row], state, new Set())).toHaveLength(1);
  });

  it("still auto-hides an unused property before any narrowing is active", () => {
    const config = viewConfig({
      schema: {
        columns: [{ key: "category", label: "Category", type: "text" }],
        computedFields: [],
      },
    });
    const row = { file: { path: "one.md" }, frontmatter: {}, computed: {} } as never;

    expect(getVisibleColumns(config, [row], viewState(), new Set())).toHaveLength(0);
  });
});
