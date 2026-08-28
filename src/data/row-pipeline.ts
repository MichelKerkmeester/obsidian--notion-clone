// ───────────────────────────────────────────────────────────────────
// MODULE:    row-pipeline
// COMPONENT: Turns raw NoteRecord[] into the rows a view renders — search, filter, sort, limit.
// ───────────────────────────────────────────────────────────────────
//
// Runs the four stages in a fixed order (search → filter → sort/manual-order →
// limit) and records a count after each one, so the UI can explain a zero-row
// result (hidden by a filter vs genuinely no matches) without re-running the
// pipeline. Calendar/timeline views hide the property panel, so their search
// widens the "hidden" column set to everything except start/end/title instead
// of trusting the view's own hiddenColumns.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, TFile } from "obsidian";
import { evaluateComputedFields } from "./computed-evaluator";
import { NoteRecord } from "./data-source";
import { QueryEngine } from "./query-engine";
import { ColumnDef, RowData, ViewConfig } from "./types";
import { DatabaseViewState } from "../views/view-state-store";
import { getEffectiveFilterRules, isEffectiveFilterRule } from "./filter-rules";
import { sortByManualRank } from "./manual-order";
import { stringifyValue } from "./stringify";
import { isFileFieldKey, getFileFieldFixedType, getRowFileFieldValue } from "./file-fields";
import { parseDateTimeParts } from "./date-time-format";
import { getDefaultEventDateField } from "./calendar-timeline-model";
import { getColumnDisplayType } from "./column-display";
import { isNumericRollupKind } from "./aggregate";
import { getDateSearchDisplayText, isDateSearchColumn, matchesDateSearch, normalizeSearchQuery } from "./search";
import { resolveTitleFieldDisplay } from "./title-field-display";
import { buildViewFilterTree, pruneViewFilterTree } from "./view-filter-tree";
import type { SourceRuleNode, ViewModeStateDef } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface RowPipelineDiagnostics {
  sourceCount: number;
  postSearchCount: number;
  postFilterCount: number;
  postLimitCount: number;
  visibleCount: number;
  hasActiveSearch: boolean;
  hasActiveFilters: boolean;
  hasActiveLimit: boolean;
}

export interface RowPipelineOutput {
  rows: RowData[];
  diagnostics: RowPipelineDiagnostics;
}

// ───────────────────────────────────────────────────────────────────
// 3. DIAGNOSTICS
// ───────────────────────────────────────────────────────────────────

/** Return a detached diagnostics snapshot suitable for display decisions. */
export function getRowPipelineDiagnostics(output: RowPipelineOutput | RowPipelineDiagnostics): RowPipelineDiagnostics {
  const diagnostics = "diagnostics" in output ? output.diagnostics : output;
  return { ...diagnostics };
}

// ───────────────────────────────────────────────────────────────────
// 4. ROW PIPELINE
// ───────────────────────────────────────────────────────────────────

export class RowPipeline {
  private queryEngine = new QueryEngine();

  build(
    records: NoteRecord[],
    config: ViewConfig,
    state: DatabaseViewState & Pick<ViewModeStateDef, "filterTree">,
    app?: App,
    derivedValues?: ReadonlyMap<string, Record<string, unknown>>,
  ): RowData[] {
    return this.buildWithDiagnostics(records, config, state, app, derivedValues).rows;
  }

  buildWithDiagnostics(
    records: NoteRecord[],
    config: ViewConfig,
    state: DatabaseViewState & Pick<ViewModeStateDef, "filterTree">,
    app?: App,
    derivedValues?: ReadonlyMap<string, Record<string, unknown>>,
  ): RowPipelineOutput {
    let rows = this.buildRows(records, config, app, derivedValues);
    const sourceCount = rows.length;
    const queryColumns = this.withComputedResultTypes(config);

    if (state.sortRules.length > 0) {
      rows = this.queryEngine.sortByRules(rows, queryColumns, state.sortRules);
    } else if (state.sortColumn) {
      const col = queryColumns.find((c) => c.key === state.sortColumn);
      if (col) rows = this.queryEngine.sort(rows, col, state.sortDirection || "asc");
    } else if (config.manualOrder?.ranks && Object.keys(config.manualOrder.ranks).length > 0) {
      rows = sortByManualRank(rows, config.manualOrder.ranks);
    }

    const q = normalizeSearchQuery(state.searchText);
    if (q) {
      // Calendar/timeline hide the property panel — event cards only show start/end/title.
      // Treat all other columns as hidden for search by expanding the hidden set inline.
      const isCalendarTimeline = config.viewType === "calendar" || config.viewType === "timeline";
      const hidden = new Set(state.hiddenColumns);
      if (isCalendarTimeline) {
        const titleField = this.getCalendarTimelineTitleField(config);
        const visibleKeys = new Set([
          config.timelineStartDateField || config.calendarStartDateField || getDefaultEventDateField(config),
          config.timelineEndDateField || config.calendarEndDateField,
          titleField,
        ].filter(Boolean) as string[]);
        for (const col of config.schema.columns) {
          if (!visibleKeys.has(col.key)) hidden.add(col.key);
        }
      }
      const searchCols = config.schema.columns.filter((col) => !hidden.has(col.key));
      rows = rows.filter((row) => {
        if (isCalendarTimeline) {
          const title = this.getCalendarTimelineSearchTitle(row, config);
          if (title.toLowerCase().includes(q)) return true;
        } else if (row.file.name.toLowerCase().includes(q)) {
          return true;
        }
        for (const col of searchCols) {
          const displayType = this.getSearchDisplayType(config, col);
          const val = col.type === "computed" || col.type === "rollup"
            ? row.computed[col.type === "computed" ? col.computedKey || col.key : col.key]
            : isFileFieldKey(col.key)
              ? getRowFileFieldValue(row, col.key)
              : row.frontmatter[col.key];
          if (val == null || val === "") continue;
          // Date values (from Obsidian's YAML parser) or date/datetime columns:
          // search visible display text plus explicit date forms only. NEVER
          // stringify Date objects — toISOString() may contain timezone-shifted
          // digits the user never sees (e.g., local midnight in UTC-X → T10:00Z).
          if (isDateSearchColumn(displayType, val)) {
            const parts = parseDateTimeParts(val);
            const display = getDateSearchDisplayText(val, displayType);
            if (display.toLowerCase().includes(q)) return true;
            if (matchesDateSearch(parts, q)) return true;
            continue;
          }
          if (stringifyValue(val).toLowerCase().includes(q)) return true;
        }
        return false;
      });
    }
    const postSearchCount = rows.length;

    if (state.statusFilter) {
      rows = rows.filter((row) => row.frontmatter["status"] === state.statusFilter);
    }

    const validFields = new Set(config.schema.columns.map((col) => col.key));
    const effectiveFilters = getEffectiveFilterRules(state.filters, validFields);
    const tree: SourceRuleNode | undefined = state.filterTree
      ? pruneViewFilterTree(state.filterTree, (rule) => isEffectiveFilterRule(rule, validFields))
      : buildViewFilterTree(effectiveFilters, state.filterLogic);
    if (tree) {
      rows = this.queryEngine.applyFilterTree(rows, tree, queryColumns);
    } else {
      rows = this.queryEngine.applyFilters(rows, effectiveFilters, state.filterLogic, queryColumns);
    }
    const postFilterCount = rows.length;
    const hasActiveFilters = Boolean(state.statusFilter) || Boolean(tree);
    const hasActiveLimit = typeof config.resultLimit === "number" &&
      Number.isFinite(config.resultLimit) && config.resultLimit >= 0;
    const postLimitCount = rows.length;

    if (hasActiveLimit) {
      rows = rows.slice(0, Math.floor(config.resultLimit ?? 0));
    }

    return {
      rows,
      diagnostics: {
        sourceCount,
        postSearchCount,
        postFilterCount,
        postLimitCount,
        visibleCount: rows.length,
        hasActiveSearch: Boolean(q),
        hasActiveFilters,
        hasActiveLimit,
      },
    };
  }

  private buildRows(
    records: NoteRecord[],
    config: ViewConfig,
    app?: App,
    derivedValues?: ReadonlyMap<string, Record<string, unknown>>,
  ): RowData[] {
    const thisFile = app && config.baseThisFilePath
      ? app.vault.getAbstractFileByPath(config.baseThisFilePath)
      : null;
    const thisFrontmatter = thisFile instanceof TFile
      ? app?.metadataCache.getFileCache(thisFile)?.frontmatter
      : undefined;
    return records.map((record) => {
      const derived = derivedValues?.get(record.file.path) || {};
      const computedErrors: NonNullable<RowData["computedErrors"]> = {};
      return {
        app,
        file: record.file,
        frontmatter: record.frontmatter,
        cache: app?.metadataCache.getFileCache(record.file) ?? null,
        computed: {
          ...evaluateComputedFields(config.schema.computedFields, config.schema.columns, record.frontmatter, {
            app,
            file: record.file,
            thisFile: thisFile instanceof TFile ? thisFile : undefined,
            thisFrontmatter,
            derivedValues: derived,
            diagnostics: computedErrors,
          }),
          // Rollup columns stay authoritative if a malformed schema reuses a key.
          ...derived,
        },
        computedErrors,
      };
    });
  }

  private withComputedResultTypes(config: ViewConfig): ColumnDef[] {
    return config.schema.columns.map((col) => {
      if (col.type === "rollup") {
        const aggregation = col.rollupConfig?.aggregation ?? "";
        const type = aggregation === "earliest" || aggregation === "latest"
          ? "date"
          : isNumericRollupKind(aggregation) ? "number" : "text";
        return { ...col, type };
      }
      if (col.type !== "computed") return col;
      const computedKey = col.computedKey || col.key;
      const computedType = config.schema.computedFields.find((field) => field.key === computedKey)?.type;
      return computedType ? { ...col, type: computedType } : col;
    });
  }

  private getSearchDisplayType(config: ViewConfig, col: ColumnDef): ColumnDef["type"] {
    if (isFileFieldKey(col.key)) return getFileFieldFixedType(col.key);
    return getColumnDisplayType(col, config.schema.computedFields);
  }

  private getCalendarTimelineTitleField(config: ViewConfig): string | undefined {
    if (config.viewType === "timeline") {
      return config.timelineTitleField;
    }
    return config.calendarTitleField;
  }

  private getCalendarTimelineSearchTitle(row: RowData, config: ViewConfig): string {
    const display = resolveTitleFieldDisplay(row, config, this.getCalendarTimelineTitleField(config));
    return display.isEmpty || display.isHidden ? "" : display.text;
  }

  private getSearchFieldValue(row: RowData, config: ViewConfig, field: string): unknown {
    const column = config.schema.columns.find((col) => col.key === field);
    if (column?.type === "computed" || column?.type === "rollup") {
      return row.computed[column.type === "computed" ? column.computedKey || column.key : column.key];
    }
    if (isFileFieldKey(field)) {
      if (field === "file.name" || field === "file.basename") {
        return row.file.basename || row.file.name.replace(/\.md$/i, "");
      }
      return getRowFileFieldValue(row, field);
    }
    return row.frontmatter[field];
  }
}
