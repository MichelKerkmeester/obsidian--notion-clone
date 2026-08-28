// ───────────────────────────────────────────────────────────────────
// MODULE:    view-rule-operations.test
// COMPONENT: Unit tests for removeFilterRuleAt's flat/tree coherence
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { removeFilterRuleAt } from "./view-rule-operations";
import { buildViewFilterTree, flattenLeaves } from "../data/view-filter-tree";
import type { DatabaseViewState } from "./view-state-store";
import type { FilterRule } from "../data/types";

// ───────────────────────────────────────────────────────────────────
// 2. TEST HELPERS
// ───────────────────────────────────────────────────────────────────

const leaf = (field: string, value: string): FilterRule => ({ field, op: "eq", value });

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
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

// Deleting a filter chip is one of the "non-panel" mutation sites that must keep
// state.filterTree coherent with the legacy flat state.filters array.
describe("removeFilterRuleAt keeps filters and filterTree coherent", () => {
  it("removes the chip at the given index from both the flat filters array and the nested filter tree", () => {
    const filters = [leaf("a", "1"), leaf("b", "2"), leaf("c", "3")];
    const state = viewState({ filters: [...filters], filterTree: buildViewFilterTree(filters, "or") });

    const removed = removeFilterRuleAt(state, 1);

    expect(removed).toBe(true);
    expect(state.filters).toEqual([leaf("a", "1"), leaf("c", "3")]);
    expect(flattenLeaves(state.filterTree)).toEqual(state.filters);
  });

  it("leaves both representations untouched when the index is out of range", () => {
    const filters = [leaf("a", "1")];
    const filterTree = buildViewFilterTree(filters, "and");
    const state = viewState({ filters: [...filters], filterTree });

    expect(removeFilterRuleAt(state, 5)).toBe(false);
    expect(removeFilterRuleAt(state, -1)).toBe(false);
    expect(state.filters).toEqual(filters);
    expect(state.filterTree).toEqual(filterTree);
  });

  it("collapses the tree back to undefined once the last chip is removed, matching the emptied flat array", () => {
    const filters = [leaf("only", "1")];
    const state = viewState({ filters: [...filters], filterTree: buildViewFilterTree(filters, "and") });

    const removed = removeFilterRuleAt(state, 0);

    expect(removed).toBe(true);
    expect(state.filters).toEqual([]);
    expect(state.filterTree).toBeUndefined();
  });
});
