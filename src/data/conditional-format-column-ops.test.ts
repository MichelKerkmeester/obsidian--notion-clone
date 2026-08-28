// ───────────────────────────────────────────────────────────────────
// MODULE:    conditional-format-column-ops.test
// COMPONENT: Column-delete prune-then-derive coverage for getConditionalFormatConditionFromTree
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────
import { describe, expect, it, vi } from "vitest";
import { getConditionalFormatConditionFromTree } from "./conditional-format-column-ops";
import { removeSourceRuleTreeReferences } from "./source-rules";
import type { ConditionalFormatRule, SourceRuleNode } from "./types";

vi.mock("obsidian", () => ({
  normalizePath: (path: string) => path,
}));

// Mirrors the column-delete prune-then-derive step in ColumnOperations.ts: strip every
// leaf referencing a deleted column out of the tree, then recompute the legacy `condition`
// leaf from what remains. Returns undefined when the rule has no leaves left, matching the
// real delete path dropping the rule entirely in that case.
function pruneAndDeriveCondition(
  rule: ConditionalFormatRule,
  deletedKeys: string[],
): ConditionalFormatRule | undefined {
  let conditionTree: SourceRuleNode | undefined = rule.conditionTree;
  for (const key of deletedKeys) {
    conditionTree = removeSourceRuleTreeReferences(conditionTree, key);
    if (!conditionTree) return undefined;
  }
  const next: ConditionalFormatRule = { ...rule, conditionTree };
  const condition = getConditionalFormatConditionFromTree(conditionTree);
  if (condition) next.condition = condition;
  return next;
}

function fieldTargetRule(conditionTree: SourceRuleNode): ConditionalFormatRule {
  return {
    id: "rule-1",
    condition: { field: "status", op: "eq", value: "ready" },
    conditionTree,
    target: "field",
  };
}

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────
describe("getConditionalFormatConditionFromTree", () => {
  it("re-anchors to a surviving leaf when the deleted column was the tree's first leaf", () => {
    const tree: SourceRuleNode = {
      type: "group",
      logic: "and",
      rules: [
        { field: "status", op: "eq", value: "ready" },
        { field: "priority", op: "eq", value: "high" },
        { field: "due", op: "notempty" },
      ],
    };

    const survivor = pruneAndDeriveCondition(fieldTargetRule(tree), ["status"]);

    expect(survivor).toBeDefined();
    expect(survivor?.condition.field).not.toBe("status");
    expect(survivor?.condition).toEqual({ field: "priority", op: "eq", value: "high" });
  });

  it("keeps resolving a condition once pruning collapses the tree to a single leaf", () => {
    const tree: SourceRuleNode = {
      type: "group",
      logic: "and",
      rules: [
        { field: "status", op: "eq", value: "ready" },
        { field: "priority", op: "eq", value: "high" },
      ],
    };

    const survivor = pruneAndDeriveCondition(fieldTargetRule(tree), ["status"]);

    expect(survivor?.conditionTree).toEqual({ field: "priority", op: "eq", value: "high" });
    expect(survivor?.condition).toEqual({ field: "priority", op: "eq", value: "high" });
  });

  it("drops the rule once pruning removes every leaf, and the helper stays a no-op on an empty tree", () => {
    const tree: SourceRuleNode = { field: "status", op: "eq", value: "ready" };

    const survivor = pruneAndDeriveCondition(fieldTargetRule(tree), ["status"]);

    expect(survivor).toBeUndefined();
    expect(getConditionalFormatConditionFromTree(undefined)).toBeUndefined();
  });
});
