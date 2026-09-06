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

/* eslint-disable import/no-nodejs-modules, no-undef --
   The source-contract check at the bottom of this file reads database-view.ts's own text, which
   needs the node builtins the plugin runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
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

// ───────────────────────────────────────────────────────────────────
// 4. PER-VIEW SCROLL POSITION
// ───────────────────────────────────────────────────────────────────

describe("ViewStateStore viewport", () => {
  it("remembers a view's scroll snapshot independently of every other view", () => {
    const store = new ViewStateStore();
    const snapshotA = { top: 240, left: 0 };
    const snapshotB = { top: 60, left: 12 };

    store.setViewport(0, 0, snapshotA);
    store.setViewport(0, 1, snapshotB);

    expect(store.getViewport(0, 0)).toEqual(snapshotA);
    expect(store.getViewport(0, 1)).toEqual(snapshotB);
    expect(store.getViewport(0, 0)).not.toBe(store.getViewport(0, 1));
  });

  it("has never been visited until a snapshot is stored", () => {
    expect(new ViewStateStore().getViewport(0, 0)).toBeUndefined();
  });

  it("drops a view's remembered position along with the rest of its cached state", () => {
    const store = new ViewStateStore();
    store.setViewport(0, 0, { top: 100, left: 0 });

    store.delete(0, 0);

    expect(store.getViewport(0, 0)).toBeUndefined();
  });

  it("clears every remembered position along with every cached state", () => {
    const store = new ViewStateStore();
    store.setViewport(0, 0, { top: 100, left: 0 });
    store.setViewport(1, 0, { top: 50, left: 0 });

    store.clear();

    expect(store.getViewport(0, 0)).toBeUndefined();
    expect(store.getViewport(1, 0)).toBeUndefined();
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. ONE SNAPSHOT MECHANISM, NOT TWO
// ───────────────────────────────────────────────────────────────────

describe("view switching wires the existing viewport snapshot", () => {
  it("captures and restores through database-viewport.ts's own functions, not a second mechanism", () => {
    const source = readFileSync(resolve(__dirname, "./database-view.ts"), "utf-8");
    const switchViewStart = source.indexOf("private switchView(");
    expect(switchViewStart).toBeGreaterThan(-1);
    const switchViewEnd = source.indexOf("\n  }", switchViewStart);
    const body = source.slice(switchViewStart, switchViewEnd);

    expect(body).toContain("captureDatabaseViewport(this.containerEl_)");
    expect(body).toContain("this.viewStateStore.setViewport(");
    expect(body).toContain("this.viewStateStore.getViewport(");
    expect(body).toContain("restoreDatabaseViewport(this.containerEl_, restoreViewport)");
  });
});
