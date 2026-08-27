import { describe, expect, it } from "vitest";
import {
  appendLeaf,
  buildViewFilterTree,
  evaluateViewFilterTree,
  flattenLeaves,
  getRequiredViewFilterLeaves,
  mapLeafAt,
  normalizeViewFilterTree,
  pruneViewFilterTree,
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

describe("pruneViewFilterTree collapses a fully-dead root but not a nested one", () => {
  it("collapses a root group whose leaves all die to a clean undefined result", () => {
    const tree: SourceRuleNode = {
      type: "group",
      logic: "and",
      rules: [leaf("gone-a", "1"), leaf("gone-b", "2")],
    };
    const allDead = () => false;

    const pruned = pruneViewFilterTree(tree, allDead);

    expect(pruned).toBeUndefined();
    expect(flattenLeaves(pruned)).toEqual([]);
    // An empty group and `undefined` are the same Kleene value everywhere
    // evaluateViewFilterTree is called, so collapsing the root cannot change
    // what any caller observes.
    expect(evaluateViewFilterTree(pruned, () => true)).toBe(
      evaluateViewFilterTree({ type: "group", logic: "and", rules: [] }, () => true),
    );
  });

  it("retains a nested all-dead-leaf group instead of collapsing it, so it keeps skipping rather than passing the AND", () => {
    const tree: SourceRuleNode = {
      type: "group",
      logic: "and",
      rules: [
        leaf("keep", "1"),
        { type: "group", logic: "or", rules: [leaf("gone", "x")] },
      ],
    };
    const survives = (rule: FilterRule) => rule.field !== "gone";

    const pruned = pruneViewFilterTree(tree, survives);

    // Splicing the empty OR branch out here would let a matching "keep" leaf
    // resolve the whole AND to true, when the doomed branch's outcome is
    // genuinely unknown rather than vacuously satisfied.
    expect(pruned).toEqual({
      type: "group",
      logic: "and",
      rules: [leaf("keep", "1"), { type: "group", logic: "or", rules: [] }],
    });
    expect(evaluateViewFilterTree(pruned, matcher(new Set(["keep:1"])))).toBe(null);
  });
});

// Column rename/delete/chip-delete mutate state.filterTree and the legacy flat state.filters
// side by side. These tests lock the property that both representations end up describing
// the same set of leaves after the pure helpers each call site delegates to are applied.
describe("dual-write coherence between filterTree and the flat filters array", () => {
  it("prunes a doomed field out of both the flat array and a nested OR group without poisoning the group", () => {
    const filters = [leaf("keep", "1"), leaf("doomed", "2"), leaf("also-keep", "3")];
    const tree: SourceRuleNode = {
      type: "group",
      logic: "and",
      rules: [
        leaf("keep", "1"),
        { type: "group", logic: "or", rules: [leaf("doomed", "2"), leaf("also-keep", "3")] },
      ],
    };
    const survives = (rule: FilterRule) => rule.field !== "doomed";

    const prunedFilters = filters.filter(survives);
    const prunedTree = pruneViewFilterTree(tree, survives);

    expect(prunedFilters).toEqual([leaf("keep", "1"), leaf("also-keep", "3")]);
    // Same predicate, same source data: the tree's surviving leaves must match the array exactly.
    expect(flattenLeaves(prunedTree)).toEqual(prunedFilters);
    // The OR branch keeps its remaining leaf as a real group instead of collapsing to an
    // always-true/always-false stand-in once its sibling is pruned.
    expect(prunedTree).toEqual({
      type: "group",
      logic: "and",
      rules: [
        leaf("keep", "1"),
        { type: "group", logic: "or", rules: [leaf("also-keep", "3")] },
      ],
    });
    expect(evaluateViewFilterTree(prunedTree, matcher(new Set(["keep:1"])))).toBe(false);
    expect(evaluateViewFilterTree(prunedTree, matcher(new Set(["keep:1", "also-keep:3"])))).toBe(true);
  });

  it("renames every leaf occurrence of a field by flattened position across nested AND/OR/NOT groups", () => {
    const tree: SourceRuleNode = {
      type: "group",
      logic: "and",
      rules: [
        leaf("old", "1"),
        { type: "group", logic: "or", rules: [leaf("old", "2"), leaf("untouched", "x")] },
        { type: "not", rule: leaf("old", "3") },
      ],
    };
    // Mirrors the column-rename call site: find every leaf with the old field key by its
    // flattened position, then remap each one in place without disturbing sibling leaves.
    let renamed: SourceRuleNode | undefined = tree;
    flattenLeaves(tree).forEach((current, index) => {
      if (current.field !== "old") return;
      renamed = mapLeafAt(renamed, index, (rule) => ({ ...rule, field: "new" }));
    });

    expect(flattenLeaves(renamed)).toEqual([
      leaf("new", "1"),
      leaf("new", "2"),
      leaf("untouched", "x"),
      leaf("new", "3"),
    ]);
    expect(renamed).toEqual({
      type: "group",
      logic: "and",
      rules: [
        leaf("new", "1"),
        { type: "group", logic: "or", rules: [leaf("new", "2"), leaf("untouched", "x")] },
        { type: "not", rule: leaf("new", "3") },
      ],
    });
  });

  it("excludes leaves nested two levels under an OR ancestor from the required frontmatter set", () => {
    const tree: SourceRuleNode = {
      type: "group",
      logic: "and",
      rules: [
        leaf("required", "yes"),
        {
          type: "group",
          logic: "or",
          rules: [
            { type: "group", logic: "and", rules: [leaf("nested-a", "1"), leaf("nested-b", "2")] },
            leaf("nested-c", "3"),
          ],
        },
      ],
    };
    // If nested-a/nested-b leaked into the required set, a newly created row would be
    // pre-populated with values that only satisfy one OR branch, poisoning it against
    // any row that should have matched through the nested-c branch instead.
    expect(getRequiredViewFilterLeaves(tree)).toEqual([leaf("required", "yes")]);
  });
});
