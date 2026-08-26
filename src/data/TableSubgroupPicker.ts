/**
 * Keeps table subgroup selection rules independent from toolbar DOM and view lifecycle.
 * The view owns persistence while this module limits the selection to one subgroup.
 */

import { isComputedGroupField } from "./GroupDisplay";
import type { ColumnDef, ViewConfig } from "./types";

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
