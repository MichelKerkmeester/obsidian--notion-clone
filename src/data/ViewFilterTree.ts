import { isEffectiveFilterRule } from "./FilterRules";
import type { FilterOperator, FilterRule, SourceRule, SourceRuleNode } from "./types";

type KleeneValue = boolean | null;
type ViewFilterLeaf = SourceRule & { op: FilterOperator };
type LeafMatcher = (leaf: ViewFilterLeaf) => KleeneValue;
type LeafMapper = (leaf: ViewFilterLeaf) => FilterRule | undefined;

const VIEW_FILTER_OPERATORS = new Set<FilterOperator>([
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasType(value: unknown, type: string): boolean {
  return isRecord(value) && value.type === type;
}

function isGroup(node: SourceRuleNode): node is Extract<SourceRuleNode, { type: "group" }> {
  return hasType(node, "group");
}

function isNot(node: SourceRuleNode): node is Extract<SourceRuleNode, { type: "not" }> {
  return hasType(node, "not");
}

function isExpression(node: SourceRuleNode): node is Extract<SourceRuleNode, { type: "expression" }> {
  return hasType(node, "expression");
}

function isLeaf(node: SourceRuleNode): node is ViewFilterLeaf {
  return isRecord(node) && !Object.prototype.hasOwnProperty.call(node, "type");
}

function copyLeaf(leaf: ViewFilterLeaf): FilterRule {
  return leaf.value === undefined
    ? { field: leaf.field, op: leaf.op }
    : { field: leaf.field, op: leaf.op, value: leaf.value };
}

function isViewFilterOperator(value: unknown): value is FilterOperator {
  return typeof value === "string" && VIEW_FILTER_OPERATORS.has(value as FilterOperator);
}

function warnInvalidNode(): void {
  console.warn("Ignoring invalid view filter node");
}

function normalizeNode(value: unknown, seen: WeakSet<object>): SourceRuleNode | undefined {
  if (!isRecord(value)) {
    warnInvalidNode();
    return undefined;
  }
  if (seen.has(value)) {
    warnInvalidNode();
    return undefined;
  }
  seen.add(value);

  const kind = value.type;
  let normalized: SourceRuleNode | undefined;
  if (kind === undefined) {
    const field = value.field;
    const op = value.op;
    const rawValue = value.value;
    if (
      typeof field !== "string" ||
      field.trim().length === 0 ||
      !isViewFilterOperator(op) ||
      (rawValue !== undefined && typeof rawValue !== "string")
    ) {
      warnInvalidNode();
    } else {
      normalized = rawValue === undefined
        ? { field, op }
        : { field, op, value: rawValue };
    }
  } else if (kind === "group") {
    if ((value.logic !== "and" && value.logic !== "or") || !Array.isArray(value.rules)) {
      warnInvalidNode();
    } else {
      const rules: SourceRuleNode[] = [];
      for (const child of value.rules) {
        const childNode = normalizeNode(child, seen);
        if (childNode) rules.push(childNode);
      }
      normalized = { type: "group", logic: value.logic, rules };
    }
  } else if (kind === "not") {
    const rule = normalizeNode(value.rule, seen);
    if (rule) normalized = { type: "not", rule };
  } else if (kind === "expression") {
    if (typeof value.expression === "string") {
      normalized = { type: "expression", expression: value.expression };
    } else {
      warnInvalidNode();
    }
  } else {
    warnInvalidNode();
  }

  seen.delete(value);
  return normalized;
}

export function buildViewFilterTree(
  filters: readonly FilterRule[] | undefined,
  logic: "and" | "or" = "and",
): SourceRuleNode | undefined {
  if (!filters?.length) return undefined;
  const rules = filters.map((filter) => copyLeaf(filter));
  if (rules.length === 1) return rules[0];
  return {
    type: "group",
    logic: logic === "or" ? "or" : "and",
    rules,
  };
}

export function normalizeViewFilterTree(value: unknown): SourceRuleNode | undefined {
  if (value == null) return undefined;
  return normalizeNode(value, new WeakSet<object>());
}

export function pruneViewFilterTree(
  tree: SourceRuleNode | null | undefined,
  effective: (rule: ViewFilterLeaf) => boolean = isEffectiveFilterRule,
): SourceRuleNode | undefined {
  if (!tree) return undefined;
  if (isLeaf(tree)) return effective(tree) ? tree : undefined;
  if (isExpression(tree)) return { type: "expression", expression: tree.expression };
  if (isNot(tree)) {
    const rule = pruneViewFilterTree(tree.rule, effective);
    return rule ? { type: "not", rule } : undefined;
  }
  if (isGroup(tree)) {
    const rules = tree.rules
      .map((rule) => pruneViewFilterTree(rule, effective))
      .filter((rule): rule is SourceRuleNode => rule !== undefined);
    return { type: "group", logic: tree.logic, rules };
  }
  return undefined;
}

export function evaluateViewFilterTree(
  tree: SourceRuleNode | null | undefined,
  matchesLeaf: LeafMatcher,
): KleeneValue {
  if (!tree) return null;
  if (isLeaf(tree)) return matchesLeaf(tree);
  if (isExpression(tree)) return false;
  if (isNot(tree)) {
    const value = evaluateViewFilterTree(tree.rule, matchesLeaf);
    return value === null ? null : !value;
  }
  if (!isGroup(tree) || tree.rules.length === 0) return null;

  let hasUnknown = false;
  if (tree.logic === "and") {
    for (const rule of tree.rules) {
      const value = evaluateViewFilterTree(rule, matchesLeaf);
      if (value === false) return false;
      if (value === null) hasUnknown = true;
    }
    return hasUnknown ? null : true;
  }

  for (const rule of tree.rules) {
    const value = evaluateViewFilterTree(rule, matchesLeaf);
    if (value === true) return true;
    if (value === null) hasUnknown = true;
  }
  return hasUnknown ? null : false;
}

export function serializeViewFilterTree(tree: SourceRuleNode): string;
export function serializeViewFilterTree(tree: null | undefined): undefined;
export function serializeViewFilterTree(tree: SourceRuleNode | null | undefined): string | undefined {
  if (!tree) return undefined;
  return JSON.stringify(serializeNode(tree));
}

function serializeNode(node: SourceRuleNode): unknown {
  if (isLeaf(node)) return copyLeaf(node);
  if (isExpression(node)) return { type: "expression", expression: node.expression };
  if (isNot(node)) return { type: "not", rule: serializeNode(node.rule) };
  if (isGroup(node)) {
    return {
      type: "group",
      logic: node.logic,
      rules: node.rules.map((rule) => serializeNode(rule)),
    };
  }
  return undefined;
}

export function flattenLeaves(tree: SourceRuleNode | null | undefined): FilterRule[] {
  if (!tree) return [];
  if (isLeaf(tree)) return [tree];
  if (isExpression(tree)) return [];
  if (isNot(tree)) return flattenLeaves(tree.rule);
  if (isGroup(tree)) return tree.rules.flatMap((rule) => flattenLeaves(rule));
  return [];
}

export function mapLeafAt(
  tree: SourceRuleNode | null | undefined,
  index: number,
  mapper: LeafMapper,
): SourceRuleNode | undefined {
  if (!tree || !Number.isInteger(index) || index < 0) return tree ?? undefined;
  let leafIndex = 0;

  const mapNode = (node: SourceRuleNode): SourceRuleNode | undefined => {
    if (isLeaf(node)) {
      if (leafIndex++ !== index) return node;
      const mapped = mapper(node);
      return mapped ? copyLeaf(mapped) : undefined;
    }
    if (isExpression(node)) return { type: "expression", expression: node.expression };
    if (isNot(node)) {
      const rule = mapNode(node.rule);
      return rule ? { type: "not", rule } : undefined;
    }
    if (isGroup(node)) {
      const rules = node.rules
        .map((rule) => mapNode(rule))
        .filter((rule): rule is SourceRuleNode => rule !== undefined);
      return { type: "group", logic: node.logic, rules };
    }
    return undefined;
  };

  return mapNode(tree);
}

export function removeLeafAt(tree: SourceRuleNode | null | undefined, index: number): SourceRuleNode | undefined {
  return mapLeafAt(tree, index, () => undefined);
}

export function appendLeaf(
  tree: SourceRuleNode | null | undefined,
  leaf: FilterRule,
  logic: "and" | "or" = "and",
): SourceRuleNode {
  const nextLeaf = copyLeaf(leaf);
  if (!tree) return nextLeaf;
  if (isGroup(tree)) {
    return { type: "group", logic: tree.logic, rules: [...tree.rules, nextLeaf] };
  }
  return { type: "group", logic, rules: [tree, nextLeaf] };
}

export function getRequiredViewFilterLeaves(tree: SourceRuleNode | null | undefined): FilterRule[] {
  if (!tree) return [];
  if (isLeaf(tree)) return [tree];
  if (isExpression(tree) || isNot(tree)) return [];
  if (isGroup(tree)) {
    if (tree.logic === "or") return [];
    return tree.rules.flatMap((rule) => getRequiredViewFilterLeaves(rule));
  }
  return [];
}
