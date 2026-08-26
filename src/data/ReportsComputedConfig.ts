import type { ColumnDef, ComputedFieldDef, DatabaseConfig, RecordSchema, ViewConfig } from "./types";
import { findInspectedRollup, lockReportsExpressions } from "./ReportsInspector";
import type {
  ReportsExpressionLock,
  ReportsExpressionLockOptions,
  ReportsFieldReference,
  ReportsInspectRecord,
} from "./ReportsInspector";

export const REPORTS_REMAINING_KEY = "remaining";
export const REPORTS_SAVED_KEY = "saved";

export interface ReportsComputedConfigOptions extends ReportsExpressionLockOptions {
  viewId?: string;
}

export interface ReportsComputedConfigResult {
  config: DatabaseConfig;
  lock: ReportsExpressionLock;
}

export function applyReportsComputedConfig(
  config: DatabaseConfig,
  record: ReportsInspectRecord,
  options: ReportsComputedConfigOptions,
): ReportsComputedConfigResult {
  if (config.id !== record.databaseId) {
    throw new Error(`Reports inspect record is for database "${record.databaseId}"`);
  }
  if (config.views.length === 0) {
    throw new Error("Reports computed config requires a target view");
  }

  const lock = lockReportsExpressions(record, options);
  const incomeKey = requireSumRollupKey(record, options.income, "Income");
  const expensesKey = requireSumRollupKey(record, options.expenses, "Expenses");
  const managedKeys = new Set([REPORTS_REMAINING_KEY, REPORTS_SAVED_KEY]);
  let columns = (config.schema.columns || []).map(cloneColumn);
  let computedFields = (config.schema.computedFields || []).map((field) => ({ ...field }));

  columns = upsertComputedColumn(columns, REPORTS_REMAINING_KEY, "Remaining");
  computedFields = upsertComputedField(
    computedFields,
    REPORTS_REMAINING_KEY,
    "Remaining",
    lock.remaining,
  );

  if (lock.saved !== null) {
    columns = upsertComputedColumn(columns, REPORTS_SAVED_KEY, "Saved");
    computedFields = upsertComputedField(computedFields, REPORTS_SAVED_KEY, "Saved", lock.saved);
  } else {
    columns = removeComputedColumn(columns, REPORTS_SAVED_KEY);
    computedFields = computedFields.filter((field) => field.key !== REPORTS_SAVED_KEY);
  }

  const schema: RecordSchema = { ...config.schema, columns, computedFields };
  const targetViewIndex = findTargetViewIndex(config.views, options.viewId);
  const orderedKeys = uniqueKeys([
    incomeKey,
    expensesKey,
    REPORTS_REMAINING_KEY,
    ...(lock.saved !== null ? [REPORTS_SAVED_KEY] : []),
  ]);
  const views = config.views.map((view, index): ViewConfig => {
    const nextView: ViewConfig = { ...view, schema };
    if (index === targetViewIndex) {
      nextView.columnOrder = buildColumnOrder(view, schema, orderedKeys, managedKeys);
      nextView.hiddenColumns = (view.hiddenColumns || []).filter((key) => !managedKeys.has(key));
    }
    return nextView;
  });

  return {
    config: {
      ...config,
      computedSyncMode: "display-only",
      schema,
      views,
    },
    lock,
  };
}

function requireSumRollupKey(
  record: ReportsInspectRecord,
  reference: ReportsFieldReference,
  role: string,
): string {
  const column = findInspectedRollup(record, reference);
  if (!column) {
    const name = typeof reference === "string" ? reference.trim() : (reference.label || reference.key).trim();
    throw new Error(`${role} field "${name}" is not an inspected rollup`);
  }
  if (column.aggregation !== "sum") {
    throw new Error(`${role} field "${column.key}" is not a SUM rollup`);
  }
  return column.key;
}

function findTargetViewIndex(views: ViewConfig[], viewId?: string): number {
  if (!viewId) return 0;
  const index = views.findIndex((view) => view.id === viewId);
  if (index < 0) throw new Error(`Reports view "${viewId}" was not found`);
  return index;
}

function buildColumnOrder(
  view: ViewConfig,
  schema: RecordSchema,
  orderedKeys: string[],
  removedKeys: Set<string>,
): string[] {
  const validKeys = new Set(schema.columns.map((column) => column.key));
  const seen = new Set(orderedKeys);
  const rest: string[] = [];
  const sourceOrder = view.columnOrder || schema.columns.map((column) => column.key);
  for (const key of sourceOrder) {
    if (!validKeys.has(key) || removedKeys.has(key) || seen.has(key)) continue;
    seen.add(key);
    rest.push(key);
  }
  for (const column of schema.columns) {
    if (removedKeys.has(column.key) || seen.has(column.key)) continue;
    seen.add(column.key);
    rest.push(column.key);
  }
  return [...orderedKeys, ...rest];
}

function upsertComputedField(
  fields: ComputedFieldDef[],
  key: string,
  label: string,
  expression: string,
): ComputedFieldDef[] {
  const replacement: ComputedFieldDef = { key, label, expression, type: "number" };
  const next: ComputedFieldDef[] = [];
  let replaced = false;
  for (const field of fields) {
    if (field.key !== key) {
      next.push(field);
    } else if (!replaced) {
      next.push(replacement);
      replaced = true;
    }
  }
  if (!replaced) next.push(replacement);
  return next;
}

function upsertComputedColumn(columns: ColumnDef[], key: string, label: string): ColumnDef[] {
  const next: ColumnDef[] = [];
  let replaced = false;
  for (const column of columns) {
    if (!isComputedColumnForKey(column, key)) {
      next.push(column);
      continue;
    }
    if (replaced) continue;
    const replacement = {
      ...column,
      key,
      label,
      type: "computed" as const,
      computedKey: key,
    };
    delete replacement.relationConfig;
    delete replacement.rollupConfig;
    next.push(replacement);
    replaced = true;
  }
  if (!replaced) next.push({ key, label, type: "computed", computedKey: key });
  return next;
}

function removeComputedColumn(columns: ColumnDef[], key: string): ColumnDef[] {
  return columns.filter((column) => !isComputedColumnForKey(column, key));
}

function isComputedColumnForKey(column: ColumnDef, key: string): boolean {
  return column.key === key || (column.type === "computed" && column.computedKey === key);
}

function uniqueKeys(keys: string[]): string[] {
  return keys.filter((key, index) => keys.indexOf(key) === index);
}

function cloneColumn(column: ColumnDef): ColumnDef {
  const copy = { ...column };
  if (column.relationConfig) copy.relationConfig = { ...column.relationConfig };
  if (column.rollupConfig) copy.rollupConfig = { ...column.rollupConfig };
  if (column.numberDisplayConfig) copy.numberDisplayConfig = { ...column.numberDisplayConfig };
  if (column.statusOptions) copy.statusOptions = column.statusOptions.map((option) => ({ ...option }));
  return copy;
}
