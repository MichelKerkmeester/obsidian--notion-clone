// ───────────────────────────────────────────────────────────────────
// MODULE:    group-display
// COMPONENT: format and default-generate group keys/labels for grouped views
// ───────────────────────────────────────────────────────────────────
//
// The empty group label is ambiguous by construction: the query engine
// already localizes ungrouped rows to `t("common.uncategorized")` before
// this module sees them, so isUncategorizedGroupKey must treat both the raw
// empty string and that localized label as "uncategorized" — checking only
// one would leave rows stuck under an unlabeled group in one of the two
// paths.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { t } from "../i18n";
import { getColumnDisplayType } from "./column-display";
import { formatDateTimeValueDisplay, formatDateValueDisplay } from "./date-time-format";
import { stringifyValue } from "./stringify";
import { toBooleanValue } from "./column-types";
import { DateGroupMode, ViewConfig } from "./types";
import { getRelationDisplayLabel, parseRelationLink } from "./relation-links";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface GroupDisplayOptions {
  uncategorizedLabel?: string;
  uncategorizedKeys?: string[];
}

// ───────────────────────────────────────────────────────────────────
// 3. GROUP KEY DISPLAY
// ───────────────────────────────────────────────────────────────────

/** Date grouping mode for a field; defaults to "exact". */
export function getDateGroupMode(config: ViewConfig, field: string | undefined): DateGroupMode {
  return (field && config.dateGroupModes?.[field]) || "exact";
}

/** Whether a group key represents the empty "uncategorized" group.
 *  QueryEngine emits `t("common.uncategorized")` for records whose group field has
 *  no value, so both the empty string and the localized label must be treated as
 *  uncategorized. */
export function isUncategorizedGroupKey(groupKey: unknown): boolean {
  const key = stringifyValue(groupKey).trim();
  return !key || key === t("common.uncategorized");
}

export function formatGroupKeyDisplay(
  config: ViewConfig,
  groupField: string | undefined,
  groupKey: string,
  options: GroupDisplayOptions = {}
): string {
  const key = stringifyValue(groupKey).trim();
  const uncategorizedLabel = options.uncategorizedLabel || t("common.uncategorized");
  if (isUncategorizedGroupKey(groupKey) || options.uncategorizedKeys?.includes(key)) return uncategorizedLabel;

  const column = groupField ? config.schema.columns.find((candidate) => candidate.key === groupField) : undefined;
  const displayType = column ? getColumnDisplayType(column, config.schema.computedFields) : undefined;
  if (displayType === "date") return formatDateValueDisplay(key);
  if (displayType === "datetime") {
    // "date" mode groups by dateKey (time ignored) → show as a date, not a datetime.
    if (getDateGroupMode(config, groupField) === "date") return formatDateValueDisplay(key);
    return formatDateTimeValueDisplay(key, { mode: "full", showTimeWhenMissing: true });
  }
  if (displayType === "checkbox") return toBooleanValue(key) ? t("common.true") : t("common.false");
  if (displayType === "relation") {
    const link = parseRelationLink(key);
    return link ? getRelationDisplayLabel(link, key) : key;
  }
  return key;
}

// ───────────────────────────────────────────────────────────────────
// 4. GROUP CREATE DEFAULTS
// ───────────────────────────────────────────────────────────────────

/** Build create-entry defaults for a group key, matching the query/groupBy口径. */
export function resolveGroupCreateDefaults(config: ViewConfig, groupField: string, groupKey: string): Record<string, unknown> {
  if (groupKey === t("common.uncategorized")) return { [groupField]: "" };
  const col = config.schema.columns.find((candidate) => candidate.key === groupField);
  if (col?.type === "multi-select" || col?.type === "relation") return { [groupField]: [groupKey] };
  if (col?.type === "checkbox") return { [groupField]: toBooleanValue(groupKey) };
  return { [groupField]: groupKey };
}

/** Whether the group field is formula-driven (computed) and thus not directly writable. */
export function isComputedGroupField(config: ViewConfig, field: string | undefined): boolean {
  if (!field) return false;
  if (field.startsWith("formula.")) return true;
  const col = config.schema.columns.find((candidate) => candidate.key === field);
  return col?.type === "computed" || col?.type === "rollup";
}
