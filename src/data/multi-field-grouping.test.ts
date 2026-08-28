// ───────────────────────────────────────────────────────────────────
// MODULE:    multi-field-grouping.test
// COMPONENT: Tests for nested multi-field group-tree building and flattening
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. SETUP
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import {
  buildGroupTree,
  dropComputedGroupFields,
  effectiveGroupFields,
  flattenGroupTree,
  type GroupTreeFn,
} from "./multi-field-grouping";
import type { RowData, ViewConfig } from "./types";

type TestRow = RowData & {
  Category: string;
  Type: string;
  Owner: string;
};

function config(overrides: Partial<ViewConfig> = {}): ViewConfig {
  return {
    name: "Grouping test",
    sourceFolder: "",
    schema: { columns: [], computedFields: [] },
    ...overrides,
  };
}

function testRows(): TestRow[] {
  return [
    { Category: "A", Type: "X", Owner: "I" },
    { Category: "A", Type: "Y", Owner: "J" },
    { Category: "B", Type: "X", Owner: "I" },
  ] as TestRow[];
}

function groupingFn(): GroupTreeFn {
  return (_config, field, inputRows) => {
    const groups = new Map<string, RowData[]>();
    for (const row of inputRows) {
      const key = (row as unknown as Record<string, string>)[field];
      const groupRows = groups.get(key) || [];
      groupRows.push(row);
      groups.set(key, groupRows);
    }
    return Array.from(groups, ([key, groupRows]) => ({ key, rows: groupRows, count: groupRows.length }));
  };
}

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("multi-field grouping", () => {
  it("keeps the configured fields and falls back to the state or legacy field", () => {
    expect(effectiveGroupFields(config({ groupByField: "Legacy" }), { groupByField: "State" })).toEqual(["State"]);
    expect(effectiveGroupFields(config({ groupByField: "Legacy", groupByFields: [] }), { groupByField: "" })).toEqual(["Legacy"]);
    expect(effectiveGroupFields(config({ groupByFields: ["Category", "Type"] }), { groupByField: "State" })).toEqual(["Category", "Type"]);
    expect(effectiveGroupFields(config(), { groupByField: "" })).toEqual([]);
  });

  it("recurses through every configured field and flattens in preorder", () => {
    const rows = testRows();
    const tree = buildGroupTree(rows, ["Category", "Type", "Owner"], config(), groupingFn());

    expect(tree.map((node) => node.key)).toEqual(["A", "B"]);
    expect(tree[0].children.map((node) => node.key)).toEqual(["X", "Y"]);
    expect(tree[0].children[0].children[0].field).toBe("Owner");

    const flattened = flattenGroupTree(tree);
    expect(flattened.map((node) => [node.key, node.depth, node.path, node.collapseKey])).toEqual([
      ["A", 0, ["A"], "A"],
      ["X", 1, ["A", "X"], "A::X"],
      ["I", 2, ["A", "X", "I"], "A::X::I"],
      ["Y", 1, ["A", "Y"], "A::Y"],
      ["J", 2, ["A", "Y", "J"], "A::Y::J"],
      ["B", 0, ["B"], "B"],
      ["X", 1, ["B", "X"], "B::X"],
      ["I", 2, ["B", "X", "I"], "B::X::I"],
    ]);
    expect(flattened[0].children).toBe(tree[0].children);
  });

  it("drops computed and rollup fields with one warning", () => {
    const view = config({
      schema: {
        columns: [{ key: "rollupValue", label: "Rollup", type: "rollup" }],
        computedFields: [],
      },
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(dropComputedGroupFields(view, ["formula.total", "rollupValue", "Category"])).toEqual(["Category"]);
    expect(warn).toHaveBeenCalledTimes(1);

    const groupFn = vi.fn(groupingFn());
    const tree = buildGroupTree(testRows(), ["formula.total", "Category"], view, groupFn);
    expect(tree.every((node) => node.field === "Category")).toBe(true);
    expect(groupFn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(2);

    warn.mockRestore();
  });
});
