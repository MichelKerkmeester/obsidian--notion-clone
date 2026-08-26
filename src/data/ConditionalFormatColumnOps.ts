import { getConditionalFormatCondition } from "./ConditionalFormatEditor";
import type { FilterRule, SourceRuleNode } from "./types";

// Delegates to the editor's first-leaf depth-first search so a pruned tree
// (after a column delete removes some but not all leaves) still resolves to a
// surviving leaf instead of silently keeping a stale condition. Column-ops and
// the editor must derive `condition` from a tree the same way, or the two
// call sites drift and a rule can point at a field that no longer exists.
export function getConditionalFormatConditionFromTree(
  tree: SourceRuleNode | undefined,
): FilterRule | undefined {
  return getConditionalFormatCondition(tree);
}
