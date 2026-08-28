// ───────────────────────────────────────────────────────────────────
// MODULE:    view-state-store
// COMPONENT: Per-(database,view) session cache bridging legacy and current persisted shapes
// ───────────────────────────────────────────────────────────────────
//
// Bridges two persisted-shape generations both ways: a legacy singular
// sortColumn is promoted into sortRules[0] on first load, and a flat
// filters+filterLogic pair is only ever rewritten as a filterTree when
// shouldPersistFilterTree() finds tree-only structure (group/not/
// expression) — plain flat filters keep round-tripping through the old
// keys so they stay readable by anything still expecting them. get() also
// re-prunes hidden columns/filters/sortRules/groupByField against the
// current schema on every fetch, not just on first creation, since the
// schema can change under an already-open view. searchText is
// intentionally never hydrated from persisted config: it is a transient
// in-session filter, not part of the saved view definition.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { buildViewFilterTree, normalizeViewFilterTree, pruneViewFilterTree } from "../data/view-filter-tree";
import type { FilterRule, SortRule, SourceRuleNode, ViewConfig } from "../data/types";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const BUILTIN_VIEW_FIELDS = new Set([
  "file.name",
  "file.path",
  "file.folder",
  "file.ext",
  "file.extension",
  "file.ctime",
  "file.created",
  "file.mtime",
  "file.modified",
  "file.size",
]);

// ───────────────────────────────────────────────────────────────────
// 3. TYPES
// ───────────────────────────────────────────────────────────────────

export interface DatabaseViewState {
  searchText: string;
  statusFilter: string;
  groupByField: string;
  filters: FilterRule[];
  hiddenColumns: Set<string>;
  filterLogic: "and" | "or";
  filterTree?: SourceRuleNode;
  sortColumn?: string;
  sortDirection: "asc" | "desc";
  sortRules: SortRule[];
}

// ───────────────────────────────────────────────────────────────────
// 4. VIEW STATE STORE
// ───────────────────────────────────────────────────────────────────

export class ViewStateStore {
  private states = new Map<string, DatabaseViewState>();

  /** Get or create state for a specific view within a database */
  get(dbIndex: number, viewIndex: number, viewConfig?: ViewConfig): DatabaseViewState {
    const key = this.getKey(dbIndex, viewIndex);
    let state = this.states.get(key);
    if (!state) {
      state = this.create(viewConfig);
      this.states.set(key, state);
    }
    // Prune hidden columns that no longer exist in current schema
    if (state && viewConfig) {
      const validKeys = new Set(viewConfig.schema.columns.map(c => c.key));
      for (const key of BUILTIN_VIEW_FIELDS) validKeys.add(key);
      for (const key of state.hiddenColumns) {
        if (!validKeys.has(key)) state.hiddenColumns.delete(key);
      }
      state.filters = state.filters.filter((rule) => validKeys.has(rule.field));
      state.filterTree = pruneViewFilterTree(state.filterTree, (rule) => validKeys.has(rule.field));
      state.sortRules = state.sortRules.filter((rule) => validKeys.has(rule.field));
      if (state.sortColumn && !validKeys.has(state.sortColumn)) {
        state.sortColumn = undefined;
        state.sortDirection = "asc";
      }
      if (state.groupByField && !validKeys.has(state.groupByField)) {
        state.groupByField = "";
      }
    }
    return state;
  }

  /** Remove all cached states */
  clear(): void {
    this.states.clear();
  }

  /** Remove cached state for a specific database+view */
  delete(dbIndex: number, viewIndex: number): void {
    this.states.delete(this.getKey(dbIndex, viewIndex));
  }

  persist(viewConfig: ViewConfig, state: DatabaseViewState): void {
    const persisted = this.toPersistedState(state);
    viewConfig.viewStates = { ...(viewConfig.viewStates || {}) };
    // Store under current viewType key for backwards compat
    const mode = viewConfig.viewType || "table";
    viewConfig.viewStates[mode] = persisted;
    // Also write to top-level for legacy access
    viewConfig.hiddenColumns = persisted.hiddenColumns;
    viewConfig.statusFilter = persisted.statusFilter;
    viewConfig.groupByField = persisted.groupByField;
    viewConfig.filterLogic = persisted.filterLogic;
    viewConfig.filters = persisted.filters;
    viewConfig.filterTree = persisted.filterTree;
    viewConfig.sortColumn = persisted.sortColumn;
    viewConfig.sortDirection = persisted.sortDirection;
    viewConfig.sortRules = persisted.sortRules;
  }

  private create(viewConfig: ViewConfig | undefined): DatabaseViewState {
    const mode = viewConfig?.viewType || "table";
    const modeState = viewConfig?.viewStates?.[mode];
    const persisted = modeState ?? viewConfig;
    const sortRules = this.copySortRules(persisted?.sortRules);
    const legacySortColumn = persisted?.sortColumn;
    if (sortRules.length === 0 && legacySortColumn) {
      sortRules.push({
        field: legacySortColumn,
        direction: persisted?.sortDirection ?? "asc",
      });
    }
    const filterTree = normalizeViewFilterTree(persisted?.filterTree)
      ?? buildViewFilterTree(persisted?.filters, persisted?.filterLogic);
    return {
      // searchText is intentionally transient: never read back from persisted
      // config. Search is a quick in-session filter, not part of the view
      // definition (filters/sort/group/hidden-columns are). See
      // search-transient.test.ts and VIEW_REGRESSION_MATRIX.md.
      searchText: "",
      statusFilter: persisted?.statusFilter ?? "",
      groupByField: persisted?.groupByField ?? "",
      filters: this.copyFilters(persisted?.filters),
      hiddenColumns: new Set(persisted?.hiddenColumns ?? []),
      filterLogic: persisted?.filterLogic ?? "and",
      filterTree,
      sortColumn: sortRules.length > 0 ? undefined : legacySortColumn,
      sortDirection: sortRules.length > 0 ? "asc" : persisted?.sortDirection ?? "asc",
      sortRules,
    };
  }

  private toPersistedState(state: DatabaseViewState): import("../data/types").ViewModeStateDef {
    const hiddenColumns = Array.from(state.hiddenColumns);
    const filterTree = shouldPersistFilterTree(state.filterTree) ? state.filterTree : undefined;
    return {
      hiddenColumns: hiddenColumns.length > 0 ? hiddenColumns : undefined,
      statusFilter: state.statusFilter || undefined,
      groupByField: state.groupByField || undefined,
      filterLogic: state.filterLogic === "or" ? "or" : undefined,
      filters: state.filters.length > 0 ? this.copyFilters(state.filters) : undefined,
      ...(filterTree ? { filterTree } : {}),
      sortColumn: state.sortColumn || undefined,
      sortDirection: state.sortColumn ? state.sortDirection : undefined,
      sortRules: state.sortRules.length > 0 ? this.copySortRules(state.sortRules) : undefined,
    };
  }

  private copyFilters(filters: FilterRule[] | undefined): FilterRule[] {
    return filters ? filters.map((filter) => ({ ...filter })) : [];
  }

  private copySortRules(rules: SortRule[] | undefined): SortRule[] {
    return rules ? rules.map((rule) => ({ ...rule })) : [];
  }

  private getKey(dbIndex: number, viewIndex: number): string {
    return `${dbIndex}:${viewIndex}`;
  }
}

// ───────────────────────────────────────────────────────────────────
// 5. HELPERS
// ───────────────────────────────────────────────────────────────────

function shouldPersistFilterTree(tree: SourceRuleNode | undefined): boolean {
  if (!tree || !("type" in tree)) return false;
  if (tree.type === "not" || tree.type === "expression") return true;
  if (tree.type !== "group") return false;
  return tree.rules.some((rule) => "type" in rule);
}
