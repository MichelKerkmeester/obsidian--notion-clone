import { getLocalDateKey } from "./CalendarDateTime";
import { getColumnDisplayType } from "./ColumnDisplay";
import { getFileFieldFixedType } from "./FileFields";
import { QueryEngine } from "./QueryEngine";
import { normalizeViewFilterTree } from "./ViewFilterTree";
import { getValidRecordIconIds, renderRecordIcon } from "../views/RecordIconRenderer";
import { parseRecordIconToken } from "./RecordIcon";
import { ConditionalFormatRule, DatabaseConfig, RowData, SourceRule, SourceRuleNode, StatusColor, ViewConfig } from "./types";

export interface ConditionalFormatMatch {
  color?: StatusColor;
  icon?: string;
  bold?: boolean;
  ruleId: string;
}

const queryEngine = new QueryEngine();
const conditionalIcons = new WeakMap<HTMLElement, HTMLElement>();
const DATE_COMPARISON_OPERATORS = new Set<SourceRule["op"]>(["eq", "neq", "gt", "gte", "lt", "lte"]);

function resolveRule(rule: ConditionalFormatRule): ConditionalFormatRule {
  if (rule.valueSource !== "today") return rule;
  return {
    ...rule,
    condition: {
      ...rule.condition,
      value: getLocalDateKey(new Date()),
    },
  };
}

function getTreeFieldType(field: string, config: ViewConfig): string | undefined {
  if (field.startsWith("file.")) return getFileFieldFixedType(field);
  const column = config.schema.columns.find((candidate) => candidate.key === field);
  if (column) return getColumnDisplayType(column, config.schema.computedFields);
  const computedKey = field.startsWith("formula.") ? field.slice("formula.".length) : field;
  return config.schema.computedFields.find((candidate) => candidate.key === computedKey)?.type;
}

function isTreeFieldAvailable(field: string, row: RowData, config: ViewConfig): boolean {
  if (config.schema.columns.some((column) => column.key === field)) return true;
  if (field.startsWith("file.")) return true;
  if (field in row.computed) return true;
  const computedKey = field.startsWith("formula.") ? field.slice("formula.".length) : field;
  return config.schema.computedFields.some((candidate) => candidate.key === computedKey);
}

function shouldResolveToday(leaf: SourceRule, config: ViewConfig): boolean {
  const fieldType = getTreeFieldType(leaf.field, config);
  return DATE_COMPARISON_OPERATORS.has(leaf.op) &&
    (leaf.value === undefined || leaf.value.trim().length === 0) &&
    (fieldType === "date" || fieldType === "datetime");
}

function prepareTree(
  node: SourceRuleNode,
  row: RowData,
  config: ViewConfig,
  today: string | undefined,
): SourceRuleNode {
  if (!("type" in node)) {
    if (!isTreeFieldAvailable(node.field, row, config)) {
      return { type: "expression", expression: "false" };
    }
    if (today !== undefined && shouldResolveToday(node, config)) {
      return { ...node, value: today };
    }
    return node;
  }
  if (node.type === "group") {
    return { ...node, rules: node.rules.map((child) => prepareTree(child, row, config, today)) };
  }
  if (node.type === "not") {
    return { ...node, rule: prepareTree(node.rule, row, config, today) };
  }
  return node;
}

function toConditionalFormatMatch(rule: ConditionalFormatRule): ConditionalFormatMatch {
  const match: ConditionalFormatMatch = { ruleId: rule.id };
  if (rule.color) match.color = rule.color;
  if (rule.icon !== undefined) match.icon = rule.icon;
  if (rule.bold !== undefined) match.bold = rule.bold;
  return match;
}

function clearConditionalIcon(element: HTMLElement): void {
  conditionalIcons.get(element)?.remove();
  conditionalIcons.delete(element);
}

function paintConditionalIcon(element: HTMLElement, token: string): void {
  const parsed = parseRecordIconToken(token, new Set(getValidRecordIconIds()));
  if (!parsed) return;
  const host: HTMLElement | null = element.tagName.toUpperCase() === "TR"
    ? element.querySelector<HTMLElement>("td:not(.db-select-col)")
    : element;
  if (!host) return;
  const icon = renderRecordIcon(host, token);
  icon.addClass("db-conditional-format-icon");
  conditionalIcons.set(element, icon);
}

export function getConditionalFormatMatch(
  row: RowData,
  config: ViewConfig,
  database: DatabaseConfig | undefined,
  targetField?: string,
): ConditionalFormatMatch | null {
  const rules = config.conditionalFormats || [];
  for (const rawRule of rules) {
    const conditionField = rawRule?.condition?.field;
    const rawTree = rawRule?.conditionTree;
    const hasConditionTree = rawTree !== undefined;
    if (!rawRule?.id || (!conditionField && !hasConditionTree)) continue;
    if (targetField) {
      if (rawRule.target !== "field" || conditionField !== targetField) continue;
    } else if (rawRule.target !== "record") {
      continue;
    }
    if (hasConditionTree) {
      const tree = normalizeViewFilterTree(rawTree);
      if (!tree) continue;
      const preparedTree = prepareTree(tree, row, config, rawRule.valueSource === "today" ? getLocalDateKey(new Date()) : undefined);
      if (queryEngine.evaluateFilterTree(row, preparedTree, config.schema.columns) !== true) continue;
      return toConditionalFormatMatch(rawRule);
    }
    const rule = resolveRule(rawRule);
    if (queryEngine.applyFilters([row], [rule.condition], "and", config.schema.columns).length === 0) continue;
    return toConditionalFormatMatch(rule);
  }
  return null;
}

export function applyConditionalFormat(
  element: HTMLElement,
  row: RowData,
  config: ViewConfig,
  database: DatabaseConfig | undefined,
  targetField?: string,
): void {
  element.removeClass("db-conditional-format");
  element.removeClass("db-conditional-format-bold");
  element.style.removeProperty("--db-conditional-format-bg");
  element.style.removeProperty("--db-conditional-format-fg");
  element.style.removeProperty("--card-bg");
  element.style.removeProperty("--card-accent");
  element.style.removeProperty("--db-calendar-event-bg");
  element.style.removeProperty("--db-calendar-event-accent");
  element.removeAttribute("data-note-database-conditional-rule");
  element.removeAttribute("data-note-database-conditional-icon");
  clearConditionalIcon(element);
  const match = getConditionalFormatMatch(row, config, database, targetField);
  if (!match) return;
  element.addClass("db-conditional-format");
  if (match.color) {
    element.style.setProperty("--db-conditional-format-bg", `var(--status-color-bg-${match.color})`);
    element.style.setProperty("--db-conditional-format-fg", `var(--status-color-fg-${match.color})`);
    element.style.setProperty("--card-bg", `var(--status-color-bg-${match.color})`);
    element.style.setProperty("--card-accent", `var(--status-color-fg-${match.color})`);
    element.style.setProperty("--db-calendar-event-bg", `var(--status-color-bg-${match.color})`);
    element.style.setProperty("--db-calendar-event-accent", `var(--status-color-fg-${match.color})`);
  }
  element.setAttribute("data-note-database-conditional-rule", match.ruleId);
  if (match.bold) element.addClass("db-conditional-format-bold");
  if (match.icon) {
    element.setAttribute("data-note-database-conditional-icon", match.icon);
    paintConditionalIcon(element, match.icon);
  }
}
