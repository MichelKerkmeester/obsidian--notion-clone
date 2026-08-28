// ───────────────────────────────────────────────────────────────────
// MODULE:    filter-rules
// COMPONENT: decide which stored filter rules actually take effect
// ───────────────────────────────────────────────────────────────────
//
// Unary operators ("empty"/"notempty") are exempt from the usual
// non-blank-value requirement — a rule using them is effective with no
// value at all, since the operator itself is the whole condition.

import { FilterRule } from "./types";

// ───────────────────────────────────────────────────────────────────
// 1. EFFECTIVE RULES
// ───────────────────────────────────────────────────────────────────

export function isEffectiveFilterRule(rule: FilterRule, validFields?: Set<string>): boolean {
  if (!rule?.field) return false;
  if (validFields && !validFields.has(rule.field)) return false;
  if (rule.op === "empty" || rule.op === "notempty") return true;
  return String(rule.value ?? "").trim().length > 0;
}

export function getEffectiveFilterRules(rules: FilterRule[] | undefined, validFields?: Set<string>): FilterRule[] {
  return (rules || []).filter((rule) => isEffectiveFilterRule(rule, validFields));
}
