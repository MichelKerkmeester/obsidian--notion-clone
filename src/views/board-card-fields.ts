// ───────────────────────────────────────────────────────────────────
// MODULE:    board-card-fields
// COMPONENT: which fields a board card body shows, and in what order
// ───────────────────────────────────────────────────────────────────
//
// The board used to read the table's visible-column set and then drop the
// title, the grouped field, and every select/status column. That made
// hiding a table column silently edit every card. This resolver is the
// only decision now: no stored list reproduces those three rules (plus
// persisted hidden columns); a stored list is the operator's order and
// visibility, and new schema keys append hidden.

// ───────────────────────────────────────────────────────────────────
// 1. RESOLVE
// ───────────────────────────────────────────────────────────────────

import { parseBoardCardFields } from "../data/board-card-fields";
import { NO_TITLE_FIELD, type BoardCardField, type ColumnDef, type ViewConfig } from "../data/types";

export { parseBoardCardFields };

export interface BoardCardFieldContext {
  groupField?: string;
  subgroupField?: string;
  /** The pre-change visible-column set (table hidden state plus the empty-value
   *  auto-hide), for the derived (list-absent) path only. Omitted, the derivation
   *  falls back to the static `hiddenColumns` check, which is what every existing
   *  differential test exercises. */
  visibleKeys?: Set<string>;
}

export interface BoardCardFieldEntry {
  column: ColumnDef;
  visible: boolean;
}

export function boardCardTitleKey(config: ViewConfig): string | undefined {
  if (config.titleField === NO_TITLE_FIELD) return undefined;
  return config.titleField || "file.name";
}

export function boardCardCoverKey(config: ViewConfig): string | undefined {
  return config.boardImageField || undefined;
}

export function groupedBoardCardKeys(config: ViewConfig, context?: BoardCardFieldContext): Set<string> {
  const groupField = context?.groupField || config.boardGroupField || config.groupByField || "";
  const subgroupField = context?.subgroupField !== undefined
    ? context.subgroupField
    : config.boardSubgroupEnabled !== false && config.boardSubgroupField && config.boardSubgroupField !== groupField
      ? config.boardSubgroupField
      : undefined;
  return new Set([groupField, ...(subgroupField ? [subgroupField] : [])].filter(Boolean));
}

function reservedKeys(config: ViewConfig): Set<string> {
  return new Set([boardCardTitleKey(config), boardCardCoverKey(config)].filter((key): key is string => Boolean(key)));
}

function isDerivedVisible(column: ColumnDef, config: ViewConfig, context?: BoardCardFieldContext): boolean {
  if (column.key === boardCardTitleKey(config)) return false;
  if (groupedBoardCardKeys(config, context).has(column.key)) return false;
  if (column.type === "select" || column.type === "status") return false;
  if (context?.visibleKeys) return context.visibleKeys.has(column.key);
  return !(config.hiddenColumns ?? []).includes(column.key);
}

function listableColumns(columns: ColumnDef[], config: ViewConfig): ColumnDef[] {
  const reserved = reservedKeys(config);
  return columns.filter((column) => !reserved.has(column.key));
}

export function listBoardCardFields(
  config: ViewConfig,
  columns: ColumnDef[],
  context?: BoardCardFieldContext,
): BoardCardFieldEntry[] {
  const stored = parseBoardCardFields(config.boardCardFields);
  const listable = listableColumns(columns, config);
  if (stored === undefined) {
    return listable.map((column) => ({
      column,
      visible: isDerivedVisible(column, config, context),
    }));
  }
  const byKey = new Map(listable.map((column) => [column.key, column]));
  const seen = new Set<string>();
  const entries: BoardCardFieldEntry[] = [];
  for (const item of stored) {
    const column = byKey.get(item.key);
    if (!column || seen.has(item.key)) continue;
    seen.add(item.key);
    entries.push({ column, visible: item.visible });
  }
  for (const column of listable) {
    if (seen.has(column.key)) continue;
    entries.push({ column, visible: false });
  }
  return entries;
}

export function resolveBoardCardFields(
  config: ViewConfig,
  columns: ColumnDef[],
  context?: BoardCardFieldContext,
): ColumnDef[] {
  const stored = parseBoardCardFields(config.boardCardFields);
  if (stored === undefined) {
    return columns.filter((column) => isDerivedVisible(column, config, context));
  }
  return listBoardCardFields(config, columns, context)
    .filter((entry) => entry.visible)
    .map((entry) => entry.column);
}

export function toBoardCardFieldList(entries: BoardCardFieldEntry[]): BoardCardField[] {
  return entries.map((entry) => ({ key: entry.column.key, visible: entry.visible }));
}
