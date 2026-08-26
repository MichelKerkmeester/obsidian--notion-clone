import { describe, expect, it } from "vitest";
import {
  appendLeaf,
  buildViewFilterTree,
  evaluateViewFilterTree,
  flattenLeaves,
  getRequiredViewFilterLeaves,
  mapLeafAt,
  normalizeViewFilterTree,
  removeLeafAt,
  serializeViewFilterTree,
} from "../ViewFilterTree";
import type { FilterRule, SourceRuleNode } from "../types";

const leaf = (field: string, value: string): FilterRule => ({ field, op: "eq", value });

function matcher(values: Set<string>): (rule: FilterRule) => boolean {
  return (rule) => values.has(`${rule.field}:${rule.value}`);
}

describe("view filter tree evaluation", () => {
  it("evaluates nested AND and OR groups", () => {
    const tree: SourceRuleNode = {
      type: "group",
      logic: "or",
      rules: [
        { type: "group", logic: "and", rules: [leaf("a", "1"), leaf("b", "1")] },
        leaf("c", "1"),
      ],
    };

    expect(evaluateViewFilterTree(tree, matcher(new Set(["a:1", "b:1"])))).toBe(true);
    expect(evaluateViewFilterTree(tree, matcher(new Set(["a:1", "c:1"])))).toBe(true);
    expect(evaluateViewFilterTree(tree, matcher(new Set(["a:1"])))).toBe(false);
    expect(evaluateViewFilterTree(tree, matcher(new Set(["b:1"])))).toBe(false);
  });

  it("keeps unknown values as skips through not", () => {
    const tree: SourceRuleNode = {
      type: "not",
      rule: { type: "group", logic: "and", rules: [] },
    };
    expect(evaluateViewFilterTree(tree, () => false)).toBe(null);
    expect(evaluateViewFilterTree({ type: "not", rule: leaf("a", "1") }, () => true)).toBe(false);
  });

  it("treats an empty root as visible and expressions as false", () => {
    const empty: SourceRuleNode = { type: "group", logic: "or", rules: [] };
    expect(evaluateViewFilterTree(empty, () => true)).toBe(null);
    expect(evaluateViewFilterTree({ type: "expression", expression: "a" }, () => true)).toBe(false);
  });

  it("skips an empty branch instead of making an OR match everything", () => {
    // Empty groups are unknown values so they cannot widen or suppress neighboring branches.
    const tree: SourceRuleNode = {
      type: "group",
      logic: "or",
      rules: [
        { type: "group", logic: "and", rules: [] },
        leaf("c", "1"),
      ],
    };
    expect(evaluateViewFilterTree(tree, () => false)).toBe(null);
    expect(evaluateViewFilterTree(tree, matcher(new Set(["c:1"])))).toBe(true);
  });

  it("promotes flat rules and preserves their matching order", () => {
    const rules = [leaf("a", "1"), leaf("b", "1")];
    const tree = buildViewFilterTree(rules, "and");
    expect(flattenLeaves(tree)).toEqual(rules);
    expect(evaluateViewFilterTree(tree, matcher(new Set(["a:1", "b:1"])))).toBe(true);
    expect(evaluateViewFilterTree(buildViewFilterTree([rules[0]], "or"), matcher(new Set(["a:1"])))).toBe(true);
    expect(buildViewFilterTree([], "or")).toBeUndefined();
    expect(evaluateViewFilterTree(undefined, () => true)).toBe(null);
  });

  it("round-trips a normalized tree and drops truncated roots", () => {
    const tree: SourceRuleNode = {
      type: "group",
      logic: "and",
      rules: [leaf("a", "1"), { type: "not", rule: leaf("b", "2") }],
    };
    const serialized = serializeViewFilterTree(tree);
    expect(normalizeViewFilterTree(JSON.parse(serialized))).toEqual(tree);
    expect(normalizeViewFilterTree({ type: "group", logic: "or" })).toBeUndefined();
    expect(normalizeViewFilterTree(null)).toBeUndefined();
  });

  it("keeps only AND-required leaves", () => {
    const required: SourceRuleNode = {
      type: "group",
      logic: "and",
      rules: [
        leaf("required", "yes"),
        { type: "group", logic: "or", rules: [leaf("optional-a", "a"), leaf("optional-b", "b")] },
        { type: "not", rule: leaf("negated", "no") },
      ],
    };
    expect(getRequiredViewFilterLeaves(required)).toEqual([leaf("required", "yes")]);
  });

  it("supports positional leaf mapping, removal, and append", () => {
    const tree = buildViewFilterTree([leaf("a", "1"), leaf("b", "2")], "and");
    const mapped = mapLeafAt(tree, 1, (rule) => ({ ...rule, value: "3" }));
    expect(flattenLeaves(mapped)).toEqual([leaf("a", "1"), leaf("b", "3")]);
    expect(flattenLeaves(removeLeafAt(mapped, 0))).toEqual([leaf("b", "3")]);
    expect(flattenLeaves(appendLeaf(mapped, leaf("c", "4")))).toEqual([
      leaf("a", "1"),
      leaf("b", "3"),
      leaf("c", "4"),
    ]);
  });
});
