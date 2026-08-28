// ───────────────────────────────────────────────────────────────────
// MODULE:    view-state-store.test
// COMPONENT: Unit tests for ViewStateStore's filter-tree hydrate/persist/reload cycle
// ───────────────────────────────────────────────────────────────────
//
// Covers the legacy-flat-to-tree promotion, the tree-only persistence guard
// (shouldPersistFilterTree), and recursive pruning of leaves whose field no
// longer exists in the schema.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { ViewStateStore } from "./view-state-store";
import type { FilterRule, SourceRuleNode, ViewConfig } from "../data/types";

// ───────────────────────────────────────────────────────────────────
// 2. TEST HELPERS
// ───────────────────────────────────────────────────────────────────

const filter = (field: string, value: string): FilterRule => ({ field, op: "eq", value });

function viewConfig(overrides: Partial<ViewConfig> = {}): ViewConfig {
  const schema = {
    columns: ["first", "second", "third"].map((key) => ({ key, label: key, type: "text" as const })),
    computedFields: [],
  };
  return {
    id: "view",
    name: "View",
    sourceFolder: "",
    viewType: "table",
    schema,
    ...overrides,
  };
}

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

describe("ViewStateStore filter tree persistence", () => {
  it("hydrates, persists, and reloads nested trees", () => {
    const filterTree: SourceRuleNode = {
      type: "group",
      logic: "or",
      rules: [
        { type: "group", logic: "and", rules: [filter("first", "one"), filter("second", "two")] },
        { type: "not", rule: filter("third", "three") },
      ],
    };
    const config = viewConfig({
      filters: [filter("first", "one"), filter("second", "two"), filter("third", "three")],
      filterLogic: "or",
      viewStates: { table: { filterTree } },
    });
    const store = new ViewStateStore();

    const state = store.get(0, 0, config);
    expect(state.filterTree).toEqual(filterTree);

    store.persist(config, state);
    expect(config.viewStates?.table?.filterTree).toEqual(filterTree);

    const reloaded = new ViewStateStore().get(0, 0, config);
    expect(reloaded.filterTree).toEqual(filterTree);
  });

  it("promotes legacy flat filters without persisting a filter tree key", () => {
    const config = viewConfig({
      filters: [filter("first", "one"), filter("second", "two")],
      filterLogic: "or",
    });
    const store = new ViewStateStore();
    const state = store.get(0, 0, config);

    expect(state.filterTree).toEqual({
      type: "group",
      logic: "or",
      rules: [filter("first", "one"), filter("second", "two")],
    });

    store.persist(config, state);
    const persisted = config.viewStates?.table;
    expect(persisted && Object.prototype.hasOwnProperty.call(persisted, "filterTree")).toBe(false);
    expect(persisted?.filters).toEqual(config.filters);
  });

  it("drops malformed trees instead of creating an empty group", () => {
    const config = viewConfig({
      filterTree: { type: "group", logic: "or" } as unknown as SourceRuleNode,
    });
    const state = new ViewStateStore().get(0, 0, config);

    expect(state.filterTree).toBeUndefined();
  });

  it("prunes dead leaves recursively while retaining emptied groups", () => {
    const filterTree: SourceRuleNode = {
      type: "group",
      logic: "and",
      rules: [
        filter("first", "one"),
        { type: "group", logic: "or", rules: [filter("missing", "gone")] },
        { type: "not", rule: filter("missing", "also-gone") },
      ],
    };
    const config = viewConfig({ filterTree });
    const state = new ViewStateStore().get(0, 0, config);

    expect(state.filterTree).toEqual({
      type: "group",
      logic: "and",
      rules: [
        filter("first", "one"),
        { type: "group", logic: "or", rules: [] },
      ],
    });
  });
});
