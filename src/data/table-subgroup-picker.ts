// ───────────────────────────────────────────────────────────────────
// MODULE:    table-subgroup-picker
// COMPONENT: Selection rules for the table's single subgroup field, independent of toolbar/view lifecycle.
// ───────────────────────────────────────────────────────────────────
//
// The view owns persistence (`groupByFields`); this module only decides which
// column is a VALID subgroup candidate and limits the selection to one
// subgroup — file.name, the primary group field, and any computed group field
// are excluded from the candidate list.

import { isComputedGroupField } from "./group-display";
import type { ColumnDef, ViewConfig } from "./types";

// ───────────────────────────────────────────────────────────────────
// 1. SUBGROUP SELECTION
// ───────────────────────────────────────────────────────────────────

export function getTableSubgroupCandidates(config: ViewConfig, primaryField: string): ColumnDef[] {
  return config.schema.columns.filter((column) =>
    column.key !== "file.name" &&
    column.key !== primaryField &&
    !isComputedGroupField(config, column.key),
  );
}

export function getTableSubgroupField(config: Pick<ViewConfig, "groupByFields">): string {
  return config.groupByFields?.[1] || "";
}

export function resolveTableSubgroupField(
  config: ViewConfig,
  primaryField: string,
  requestedField: string,
): string | undefined {
  if (!requestedField) return undefined;
  return getTableSubgroupCandidates(config, primaryField).some((column) => column.key === requestedField)
    ? requestedField
    : undefined;
}
