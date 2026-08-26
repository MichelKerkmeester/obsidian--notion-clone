/**
 * Read-only inspection and expression-lock helpers for live Reports db_views.
 *
 * The module deliberately has no Obsidian or persistence dependencies. It captures
 * the parsed payload and builds native formulas only after callers provide the
 * inspected column references, keeping the operation display-only and rebase-safe.
 */

import type { ColumnDef, ComputedFieldDef, ComputedSyncMode, DatabaseConfig } from "./types";

type RollupAggregation = NonNullable<ColumnDef["rollupConfig"]>["aggregation"];

export type ReportsSalesMeaning = "outflow" | "income-side" | "unused" | "unknown";
export type ReportsBlankVsZeroMode = "null-guard" | "bare-subtraction";
export type ReportsFieldReference = string | Pick<ReportsRollupColumn, "key" | "label">;
export type ReportsSavedSkipReason =
  | "sales-meaning-unknown"
  | "sales-unused"
  | "sales-income-side"
  | "sales-field-missing";

export interface ReportsRollupColumn {
  key: string;
  label: string;
  aggregation?: RollupAggregation;
  relationField?: string;
  targetField?: string;
}

export interface ReportsViewInspection {
  id?: string;
  name: string;
  columnOrder: readonly string[];
  hiddenColumns: readonly string[];
}

export interface ReportsInspectRecord {
  notePath: string;
  databaseId: string;
  databaseName: string;
  computedSyncMode: ComputedSyncMode;
  columns: readonly ColumnDef[];
  computedFields: readonly ComputedFieldDef[];
  views: readonly ReportsViewInspection[];
  rollupColumns: readonly ReportsRollupColumn[];
  sumRollupKeys: readonly string[];
  hasSumAggregation: boolean;
  allRollupsUseSum: boolean;
  salesMeaning: ReportsSalesMeaning;
}

export interface ReportsExpressionLockOptions {
  income: ReportsFieldReference;
  expenses: ReportsFieldReference;
  sales?: ReportsFieldReference;
  salesMeaning?: ReportsSalesMeaning;
  blankVsZero?: ReportsBlankVsZeroMode;
  /** Required to intentionally retain a Saved column that duplicates Remaining. */
  allowDuplicateSaved?: boolean;
}

export interface ReportsExpressionLock {
  remaining: string;
  saved: string | null;
  savedSkipReason?: ReportsSavedSkipReason;
  blankVsZero: ReportsBlankVsZeroMode;
  salesMeaning: ReportsSalesMeaning;
  computedSyncMode: "display-only";
}

export function inspectReportsConfig(
  config: DatabaseConfig,
  notePath: string,
  salesMeaning: ReportsSalesMeaning = "unknown",
): ReportsInspectRecord {
  const sourceColumns = Array.isArray(config.schema?.columns) ? config.schema.columns : [];
  const columns = sourceColumns.map(copyColumn);
  const rollupColumns = columns
    .filter((column) => column.type === "rollup")
    .map((column): ReportsRollupColumn => ({
      key: column.key,
      label: column.label,
      aggregation: column.rollupConfig?.aggregation,
      relationField: column.rollupConfig?.relationField,
      targetField: column.rollupConfig?.targetField,
    }));
  const sumRollupKeys = rollupColumns
    .filter((column) => column.aggregation === "sum")
    .map((column) => column.key);
  const views = (config.views || []).map((view): ReportsViewInspection => {
    const inspected: ReportsViewInspection = {
      name: view.name,
      columnOrder: [...(view.columnOrder || [])],
      hiddenColumns: [...(view.hiddenColumns || [])],
    };
    if (view.id !== undefined) inspected.id = view.id;
    return inspected;
  });

  return {
    notePath,
    databaseId: config.id,
    databaseName: config.name,
    computedSyncMode: normalizeComputedSyncMode(config.computedSyncMode),
    columns,
    computedFields: (config.schema?.computedFields || []).map((field) => ({ ...field })),
    views,
    rollupColumns,
    sumRollupKeys,
    hasSumAggregation: sumRollupKeys.length > 0,
    allRollupsUseSum: rollupColumns.length > 0 && sumRollupKeys.length === rollupColumns.length,
    salesMeaning,
  };
}

export const inspectLiveReports = inspectReportsConfig;

export function findInspectedRollup(
  record: ReportsInspectRecord,
  reference: ReportsFieldReference,
): ReportsRollupColumn | undefined {
  const name = getReferenceName(reference);
  return record.rollupColumns.find((column) => column.key === name || column.label === name);
}

export function buildReportsRemainingExpression(
  incomeField: string,
  expensesField: string,
  blankVsZero: ReportsBlankVsZeroMode = "null-guard",
): string {
  const mode = validateBlankVsZeroMode(blankVsZero);
  const income = validateFieldName(incomeField);
  const expenses = validateFieldName(expensesField);
  const body = `[${income}] - [${expenses}]`;
  return mode === "null-guard"
    ? `IF(OR([${income}] == null, [${expenses}] == null), null, ${body})`
    : body;
}

export function buildReportsSavedExpression(
  incomeField: string,
  expensesField: string,
  salesField: string,
  blankVsZero: ReportsBlankVsZeroMode = "null-guard",
): string {
  const mode = validateBlankVsZeroMode(blankVsZero);
  const income = validateFieldName(incomeField);
  const expenses = validateFieldName(expensesField);
  const sales = validateFieldName(salesField);
  const body = `[${income}] - [${expenses}] - [${sales}]`;
  return mode === "null-guard"
    ? `IF(OR([${income}] == null, [${expenses}] == null, [${sales}] == null), null, ${body})`
    : body;
}

export function lockReportsExpressions(
  record: ReportsInspectRecord,
  options: ReportsExpressionLockOptions,
): ReportsExpressionLock {
  if (record.computedSyncMode !== "display-only") {
    throw new Error("Reports computed expressions require display-only sync mode");
  }
  const blankVsZero = validateBlankVsZeroMode(options.blankVsZero || "null-guard");

  const income = requireSumRollup(record, options.income, "Income");
  const expenses = requireSumRollup(record, options.expenses, "Expenses");
  const remaining = buildReportsRemainingExpression(income, expenses, blankVsZero);
  const salesMeaning = options.salesMeaning || record.salesMeaning;
  let saved: string | null = null;
  let savedSkipReason: ReportsSavedSkipReason | undefined;

  if (salesMeaning === "outflow") {
    if (options.sales == null) {
      savedSkipReason = "sales-field-missing";
    } else {
      const sales = requireSumRollup(record, options.sales, "Sales");
      saved = buildReportsSavedExpression(income, expenses, sales, blankVsZero);
    }
  } else if (salesMeaning === "unused") {
    savedSkipReason = options.allowDuplicateSaved ? undefined : "sales-unused";
    if (options.allowDuplicateSaved) saved = remaining;
  } else if (salesMeaning === "income-side") {
    savedSkipReason = options.allowDuplicateSaved ? undefined : "sales-income-side";
    if (options.allowDuplicateSaved) saved = remaining;
  } else {
    savedSkipReason = "sales-meaning-unknown";
  }

  return {
    remaining,
    saved,
    savedSkipReason,
    blankVsZero,
    salesMeaning,
    computedSyncMode: "display-only",
  };
}

function requireSumRollup(
  record: ReportsInspectRecord,
  reference: ReportsFieldReference,
  role: string,
): string {
  const name = validateFieldName(getReferenceName(reference));
  const column = findInspectedRollup(record, name);
  if (!column) throw new Error(`${role} field "${name}" is not an inspected rollup`);
  if (column.aggregation !== "sum") {
    throw new Error(`${role} field "${name}" is not a SUM rollup`);
  }
  return name;
}

function getReferenceName(reference: ReportsFieldReference): string {
  return typeof reference === "string" ? reference.trim() : (reference.label || reference.key).trim();
}

function validateFieldName(value: string): string {
  const name = value.trim();
  if (!name || name.includes("[") || name.includes("]")) {
    throw new Error("A formula field reference must be a non-empty name without brackets");
  }
  return name;
}

function validateBlankVsZeroMode(value: ReportsBlankVsZeroMode): ReportsBlankVsZeroMode {
  if (value === "null-guard" || value === "bare-subtraction") return value;
  throw new Error("Unknown blank-vs-zero mode: " + String(value));
}

function normalizeComputedSyncMode(value: unknown): ComputedSyncMode {
  return value === "automatic" || value === "manual" || value === "display-only"
    ? value
    : "display-only";
}

function copyColumn(column: ColumnDef): ColumnDef {
  const copy = { ...column };
  if (column.relationConfig) copy.relationConfig = { ...column.relationConfig };
  if (column.rollupConfig) copy.rollupConfig = { ...column.rollupConfig };
  if (column.numberDisplayConfig) copy.numberDisplayConfig = { ...column.numberDisplayConfig };
  if (column.statusOptions) copy.statusOptions = column.statusOptions.map((option) => ({ ...option }));
  return copy;
}
