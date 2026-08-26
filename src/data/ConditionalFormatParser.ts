import { OPTION_COLORS } from "./ColumnTypes";
import { safeString } from "./SafeString";
import { normalizeViewFilterTree } from "./ViewFilterTree";
import { generateId } from "./types";
import type { ConditionalFormatRule, FilterOperator } from "./types";

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
const CONDITIONAL_FORMAT_COLORS = new Set<string>(OPTION_COLORS);
const MAX_CONDITIONAL_FORMAT_ICON_LENGTH = 64;

export function parseConditionalFormats(value: unknown): ConditionalFormatRule[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const rules: ConditionalFormatRule[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const source = item as Record<string, unknown>;
    const condition = source["condition"];
    if (!condition || typeof condition !== "object" || Array.isArray(condition)) continue;

    const conditionSource = condition as Record<string, unknown>;
    const field = safeString(conditionSource["field"]).trim();
    const op = safeString(conditionSource["op"]);
    const target = source["target"] === "field" ? "field" : source["target"] === "record" ? "record" : null;
    const hasColor = Object.prototype.hasOwnProperty.call(source, "color");
    const color = safeString(source["color"]);
    if (!field || !CONDITIONAL_FORMAT_OPERATORS.has(op as FilterOperator) || !target) continue;
    if (hasColor && !CONDITIONAL_FORMAT_COLORS.has(color)) continue;

    const rule: ConditionalFormatRule = {
      id: safeString(source["id"]).trim() || generateId(),
      condition: {
        field,
        op: op as ConditionalFormatRule["condition"]["op"],
        value: safeString(conditionSource["value"]) || undefined,
      },
      valueSource: source["valueSource"] === "today" ? "today" : "literal",
      target,
    };

    const conditionTree = normalizeViewFilterTree(source["conditionTree"]);
    if (conditionTree) rule.conditionTree = conditionTree;

    if (typeof source["icon"] === "string") {
      rule.icon = source["icon"].slice(0, MAX_CONDITIONAL_FORMAT_ICON_LENGTH);
    }
    if (typeof source["bold"] === "boolean") rule.bold = source["bold"];
    if (hasColor) rule.color = color as ConditionalFormatRule["color"];

    rules.push(rule);
  }
  return rules.length > 0 ? rules : undefined;
}
