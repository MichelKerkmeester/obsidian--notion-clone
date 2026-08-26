import { isSourceRuleGroup, isSourceRuleLeaf } from "./SourceRules";
import type { FilterOperator, FilterRule, SourceRule, SourceRuleNode } from "./types";

const CONDITIONAL_FORMAT_OPERATORS: ReadonlySet<FilterOperator> = new Set([
  "eq",
  "neq",
  "contains",
  "hasTag",
  "gt",
  "lt",
  "gte",
  "lte",
  "empty",
  "notempty",
]);

export function isConditionalFormatOperator(value: SourceRule["op"]): value is FilterOperator {
  return CONDITIONAL_FORMAT_OPERATORS.has(value as FilterOperator);
}

export function createConditionalFormatLeaf(condition: FilterRule): SourceRule {
  const leaf: SourceRule = {
    field: condition.field,
    op: condition.op,
  };
  if (condition.value !== undefined) leaf.value = condition.value;
  return leaf;
}

export function getFirstConditionalFormatLeaf(node: SourceRuleNode | undefined): SourceRule | undefined {
  if (!node) return undefined;
  if (isSourceRuleLeaf(node)) return node;
  if (!isSourceRuleGroup(node)) return undefined;
  for (const child of node.rules) {
    const leaf = getFirstConditionalFormatLeaf(child);
    if (leaf) return leaf;
  }
  return undefined;
}

export function getConditionalFormatCondition(node: SourceRuleNode | undefined): FilterRule | undefined {
  const leaf = getFirstConditionalFormatLeaf(node);
  if (!leaf || !isConditionalFormatOperator(leaf.op)) return undefined;
  const condition: FilterRule = {
    field: leaf.field,
    op: leaf.op,
  };
  if (leaf.value !== undefined) condition.value = leaf.value;
  return condition;
}
