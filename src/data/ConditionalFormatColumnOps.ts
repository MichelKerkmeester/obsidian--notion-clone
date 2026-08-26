import { isSourceRuleLeaf } from "./SourceRules";
import type { FilterRule, SourceRuleNode } from "./types";

export function getConditionalFormatConditionFromTree(
  tree: SourceRuleNode | undefined,
): FilterRule | undefined {
  if (!tree || !isSourceRuleLeaf(tree)) return undefined;

  const condition: FilterRule = {
    field: tree.field,
    op: tree.op as FilterRule["op"],
  };
  if (tree.value !== undefined) condition.value = tree.value;
  return condition;
}
