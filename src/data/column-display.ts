// ───────────────────────────────────────────────────────────────────
// MODULE:    column-display
// COMPONENT: resolves a column's effective display type (computed/rollup -> concrete)
// ───────────────────────────────────────────────────────────────────
//
// "computed" and "rollup" are storage-level column types, not display types —
// a computed column's real type lives in its ComputedFieldDef, and a rollup's
// real type is derived from its aggregation kind (earliest/latest -> date,
// sum/avg/etc -> number, else text). If the matching ComputedFieldDef can't
// be found (e.g. the field was deleted but the column reference lingers),
// getColumnDisplayType silently falls back to "text" rather than throwing.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { isNumericRollupKind } from "./aggregate";
import { ColumnDef, ComputedFieldDef, NumberDisplayStyle } from "./types";

export type ColumnDisplayType = Exclude<ColumnDef["type"], "computed" | "rollup">;

// ───────────────────────────────────────────────────────────────────
// 2. DISPLAY TYPE
// ───────────────────────────────────────────────────────────────────

export function getComputedFieldForColumn(
  col: ColumnDef,
  computedFields?: ComputedFieldDef[]
): ComputedFieldDef | undefined {
  if (col.type !== "computed") return undefined;
  const key = getComputedStorageKey(col);
  return computedFields?.find((field) => field.key === key);
}

export function getColumnDisplayType(
  col: ColumnDef,
  computedFields?: ComputedFieldDef[]
): ColumnDisplayType {
  if (col.type === "rollup") {
    const aggregation = col.rollupConfig?.aggregation ?? "";
    return aggregation === "earliest" || aggregation === "latest"
      ? "date"
      : isNumericRollupKind(aggregation) ? "number" : "text";
  }
  if (col.type !== "computed") return col.type;
  return getComputedFieldForColumn(col, computedFields)?.type || "text";
}

/** Number display style for a column; defaults to "plain" when unset. */
export function getNumberDisplayStyle(col: ColumnDef): NumberDisplayStyle {
  return col.numberDisplayStyle ?? "plain";
}

/** True when a column renders as a number — a plain number column, or a computed
 *  column whose formula result type is number. Used to gate the rating/progress
 *  display-style selector (currency is intentionally excluded). */
export function isNumberDisplayColumn(col: ColumnDef, computedFields?: ComputedFieldDef[]): boolean {
  return getColumnDisplayType(col, computedFields) === "number";
}

/** True when a column can serve as a numeric rollup target (sum/avg): number, currency,
 *  or a computed column whose formula result type is number. Unlike isNumberDisplayColumn
 *  this includes currency — rollup sum/avg over a currency column is meaningful (Bug T).
 *  Excludes text / date / checkbox / relation / multi-select etc. */
export function isRollupNumericTarget(col: ColumnDef, computedFields?: ComputedFieldDef[]): boolean {
  const displayType = getColumnDisplayType(col, computedFields);
  return displayType === "number" || displayType === "currency";
}

// ───────────────────────────────────────────────────────────────────
// 3. COLUMN KEYS & VALUES
// ───────────────────────────────────────────────────────────────────

export function getComputedStorageKey(col: Pick<ColumnDef, "key" | "type" | "computedKey">): string {
  if (col.type !== "computed") return col.key;
  return normalizeComputedStorageKey(col.computedKey || col.key);
}

export function normalizeComputedStorageKey(key: string): string {
  return key.startsWith("formula.") ? key.slice("formula.".length) : key;
}

export function isDerivedColumn(col: Pick<ColumnDef, "type">): boolean {
  return col.type === "computed" || col.type === "rollup";
}

export function getColumnValue(row: import("./types").RowData, col: ColumnDef): unknown {
  if (col.type === "computed") return row.computed[col.computedKey || col.key];
  if (col.type === "rollup") return row.computed[col.key];
  return row.frontmatter[col.key];
}

/** True when a cell value should be treated as empty for display purposes:
 *  null/undefined, an empty string, or an empty array (multi-select/relation/files). */
export function isEmptyValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length === 0;
  return value == null || value === "";
}
