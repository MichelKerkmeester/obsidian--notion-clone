// ───────────────────────────────────────────────────────────────────
// MODULE:    relation-target-change
// COMPONENT: plans the rollup fallout when a relation's target database changes
// ───────────────────────────────────────────────────────────────────
//
// Repointing a relation to a different target database can silently orphan
// any rollup that reads through it, because the old targetField key may not
// exist on the new target's schema. This computes, per dependent rollup,
// whether its targetField still resolves on the new target (falling back to
// "file.name" for count/list aggregations where any target works) or must
// be flagged requiresReconfigure — so the caller can warn the user before
// committing the change instead of after rollups quietly start showing "-".

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { isRollupNumericTarget } from "./column-display";
import { ColumnDef, DatabaseConfig } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

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

// ───────────────────────────────────────────────────────────────────
// 3. PLAN CHANGE
// ───────────────────────────────────────────────────────────────────

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

// ───────────────────────────────────────────────────────────────────
// 4. HELPERS
// ───────────────────────────────────────────────────────────────────

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
