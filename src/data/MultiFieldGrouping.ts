/**
 * Display-only helpers for grouping rows by more than one property.
 *
 * The grouping callback is injected so this module can share the view's
 * empty-group and ordering semantics without depending on a renderer.
 */

import { isComputedGroupField } from "./GroupDisplay";
import type { RowData, ViewConfig, ViewModeStateDef } from "./types";

export interface GroupTreeGroup {
  key: string;
  rows: RowData[];
  count: number;
}

export interface GroupTreeNode extends GroupTreeGroup {
  field: string;
  children: GroupTreeNode[];
}

export interface FlatGroupNode extends GroupTreeNode {
  depth: number;
  path: string[];
  collapseKey: string;
}

export type GroupTreeFn = (config: ViewConfig, field: string, rows: RowData[]) => readonly GroupTreeGroup[] | undefined;

export function effectiveGroupFields(
  config: Pick<ViewConfig, "groupByFields" | "groupByField">,
  state: Pick<ViewModeStateDef, "groupByField">,
): string[] {
  if (config.groupByFields?.length) return config.groupByFields;
  const field = state.groupByField || config.groupByField;
  return field ? [field] : [];
}

export function dropComputedGroupFields(fields: readonly string[], config: ViewConfig): string[];
export function dropComputedGroupFields(config: ViewConfig, fields: readonly string[]): string[];
export function dropComputedGroupFields(
  fieldsOrConfig: readonly string[] | ViewConfig,
  configOrFields: ViewConfig | readonly string[],
): string[] {
  let fields: readonly string[];
  let config: ViewConfig;
  if (Array.isArray(fieldsOrConfig)) {
    fields = fieldsOrConfig as readonly string[];
    config = configOrFields as ViewConfig;
  } else {
    fields = configOrFields as readonly string[];
    config = fieldsOrConfig as ViewConfig;
  }
  const remaining = fields.filter((field) => !isComputedGroupField(config, field));
  if (remaining.length !== fields.length) {
    console.warn("Ignoring computed or rollup fields in multi-field grouping.");
  }
  return [...remaining];
}

export function buildGroupTree(
  rows: RowData[],
  fields: readonly string[],
  config: ViewConfig,
  groupFn: GroupTreeFn,
): GroupTreeNode[] {
  const groupFields = dropComputedGroupFields(fields, config);

  const buildLevel = (levelRows: RowData[], remainingFields: readonly string[]): GroupTreeNode[] => {
    const field = remainingFields[0];
    if (!field) return [];

    return (groupFn(config, field, levelRows) ?? []).map((group) => ({
      key: group.key,
      rows: group.rows,
      count: group.count,
      field,
      children: buildLevel(group.rows, remainingFields.slice(1)),
    }));
  };

  return buildLevel(rows, groupFields);
}

export function flattenGroupTree(tree: readonly GroupTreeNode[]): FlatGroupNode[] {
  const flattened: FlatGroupNode[] = [];

  const visit = (nodes: readonly GroupTreeNode[], parentPath: readonly string[], depth: number): void => {
    for (const node of nodes) {
      const path = [...parentPath, node.key];
      flattened.push({
        ...node,
        depth,
        path,
        collapseKey: depth === 0 ? node.key : path.join("::"),
      });
      visit(node.children, path, depth + 1);
    }
  };

  visit(tree, [], 0);
  return flattened;
}
