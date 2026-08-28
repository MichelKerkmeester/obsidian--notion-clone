// ───────────────────────────────────────────────────────────────────
// MODULE:    view-rule-operations
// COMPONENT: Shared filter/sort rule-list mutations for DatabaseViewState
// ───────────────────────────────────────────────────────────────────
//
// removeFilterRuleAt removes from both state.filters (the flat legacy list)
// and state.filterTree (the nested and/or source of truth) in one call so
// the two never drift apart; a rule removed from only one would leave the
// filter panel and the actually-applied logic disagreeing about what's set.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ColumnDef, ViewConfig } from "../data/types";
import { removeLeafAt } from "../data/view-filter-tree";
import { t } from "../i18n";
import { DatabaseViewState } from "./view-state-store";

// ───────────────────────────────────────────────────────────────────
// 2. RULE OPERATIONS
// ───────────────────────────────────────────────────────────────────

/** Canonical property list shared by the filter panel, sort panel and active rail. */
export function getViewRuleColumns(config: ViewConfig): ColumnDef[] {
  const columns = config.schema?.columns || [];
  if (columns.some((column) => column.key === "file.name")) return columns;
  return [{ key: "file.name", label: t("defaults.nameColumn"), type: "text" }, ...columns];
}

export function removeFilterRuleAt(state: DatabaseViewState, index: number): boolean {
  if (index < 0 || index >= state.filters.length) return false;
  state.filters.splice(index, 1);
  state.filterTree = removeLeafAt(state.filterTree, index);
  return true;
}

export function removeSortRuleAt(state: DatabaseViewState, index: number): boolean {
  if (index < 0 || index >= state.sortRules.length) return false;
  state.sortRules.splice(index, 1);
  if (state.sortRules.length === 0) {
    state.sortColumn = undefined;
    state.sortDirection = "asc";
  }
  return true;
}
