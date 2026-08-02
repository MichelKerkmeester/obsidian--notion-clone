import { isRollupNumericTarget } from "./ColumnDisplay";
import { ColumnDef, DatabaseConfig } from "./types";

export interface RelationTargetRollupChange {
  columnKey: string;
  columnLabel: string;
  previousTargetField: string;
  nextTargetField: string;
  requiresReconfigure: boolean;
}

export interface RelationTargetChangePlan {
  rollupChanges: RelationTargetRollupChange[];
  dependentRollupCount: number;
  invalidatedRollupLabels: string[];
}

export function hasRelationValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value != null && value !== "";
}

export function planRelationTargetChange(
  sourceDatabase: DatabaseConfig,
  relationField: string,
  targetDatabase: DatabaseConfig,
): RelationTargetChangePlan {
  const rollupChanges: RelationTargetRollupChange[] = [];
  for (const column of sourceDatabase.schema.columns) {
    if (column.type !== "rollup" || column.rollupConfig?.relationField !== relationField) continue;
    const previousTargetField = column.rollupConfig.targetField;
    const nextTargetField = resolveRollupTargetField(column, targetDatabase);
    const requiresReconfigure = nextTargetField === "";
    rollupChanges.push({
      columnKey: column.key,
      columnLabel: column.label || column.key,
      previousTargetField,
      nextTargetField,
      requiresReconfigure,
    });
  }
  return {
    rollupChanges,
    dependentRollupCount: rollupChanges.length,
    invalidatedRollupLabels: rollupChanges
      .filter((change) => change.requiresReconfigure)
      .map((change) => change.columnLabel),
  };
}

function resolveRollupTargetField(rollup: ColumnDef, targetDatabase: DatabaseConfig): string {
  const config = rollup.rollupConfig;
  if (!config) return "";
  if (config.aggregation === "count") return "file.name";
  const target = targetDatabase.schema.columns.find((column) => column.key === config.targetField);
  if (config.aggregation === "list") {
    if (config.targetField === "file.name") return "file.name";
    return target && target.type !== "rollup" ? config.targetField : "file.name";
  }
  return target && isRollupNumericTarget(target, targetDatabase.schema.computedFields)
    ? config.targetField
    : "";
}
