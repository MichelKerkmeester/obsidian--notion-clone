// ───────────────────────────────────────────────────────────────────
// MODULE:    conditional-format-editor
// COMPONENT: Derives the legacy single-condition shape from a conditional format rule's tree
// ───────────────────────────────────────────────────────────────────
//
// Conditional format rules store both a modern condition tree and a legacy
// flat `condition` for older render paths that never learned trees. This
// module is the single source of truth for collapsing a tree to that legacy
// leaf (first depth-first leaf whose operator the legacy shape can express),
// so callers never hand-roll their own tree-walk and risk picking a different
// leaf than another call site.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────
import { isSourceRuleGroup, isSourceRuleLeaf } from "./source-rules";
import type { FilterOperator, FilterRule, SourceRule, SourceRuleNode } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────
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

// ───────────────────────────────────────────────────────────────────
// 3. OPERATOR HELPERS
// ───────────────────────────────────────────────────────────────────
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

// ───────────────────────────────────────────────────────────────────
// 4. DERIVE LEGACY CONDITION FROM TREE
// ───────────────────────────────────────────────────────────────────
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
