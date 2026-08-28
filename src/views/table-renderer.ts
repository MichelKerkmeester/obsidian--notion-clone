// ───────────────────────────────────────────────────────────────────
// MODULE:    table-renderer
// COMPONENT: Table view DOM — header/colgroup/rows/footer, grouping, drag-drop reorder
// ───────────────────────────────────────────────────────────────────
//
// patchUngroupedRows/patchGroupedRows exist to update only the rows that
// changed (preserving focus, scroll, and selection) instead of rebuilding
// the table. Both refuse the patch the moment the rendered DOM doesn't
// exactly match what a fresh render would produce — path order, column
// schema, group headers/counts/collapsed state — and return false so the
// caller falls back to a full render rather than patching a guess.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { Menu, setIcon } from "obsidian";
import { ColumnDef, CreateEntryPosition, RowCreateContext, RowData, ViewConfig } from "../data/types";
import { isExplicitlySorted } from "../data/manual-order";
import { formatGroupKeyDisplay, isComputedGroupField, resolveGroupCreateDefaults } from "../data/group-display";
import { renderGroupLabel } from "./group-label-renderer";
import { t } from "../i18n";
import { DragDropFeedbackState, resolveDropPlacement } from "./drag-drop-feedback";
import { renderMobileMoveIcon } from "./mobile-move-icon";
import { renderPropertyTypeIcon } from "./property-type-icon";
import { getTableColumnStyle, getTableLayout, getTableMinWidth as calculateTableMinWidth } from "./table-layout";
import { renderGroupExpandControls } from "./group-expand-controls";
import { getGroupVisibleCount } from "../data/group-visibility";
import { getGroupHeaderClassName, getGroupHeaderDepthValue } from "../data/multi-group-display";
import { EmptyStateOptions, EmptyStateRenderer } from "./empty-state-renderer";
import { getSelectionState } from "../data/range-selection";
import { TableFooterRenderer } from "./table-footer-renderer";
import { EdgeAutoScroller } from "./edge-auto-scroller";
import { InteractionSnapshot } from "./interaction-snapshot";
import { isTouchDevice } from "../data/touch-environment";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const ROW_MIME = "application/x-note-database-row";
const ROW_FROM_GROUP_MIME = "application/x-note-database-row-from-group";

// ───────────────────────────────────────────────────────────────────
// 3. TYPES
// ───────────────────────────────────────────────────────────────────

export interface TableGroup {
  key: string;
  rows: RowData[];
  count: number;
  depth?: number;
  path?: string[];
  field?: string;
  collapseKey?: string;
  children?: TableGroup[];
}

interface RenderableTableGroup {
  group: TableGroup;
  depth: number;
  displayField?: string;
  collapseKey: string;
  collapsed: boolean;
  visibleRows: RowData[];
  groupPath: Array<{ field: string; key: string }>;
}

export interface TableRendererActions {
  getVisibleColumns(config: ViewConfig, rows: RowData[]): ColumnDef[];
  isRowSelected(row: RowData): boolean;
  toggleRowSelected(row: RowData, selected: boolean, event?: MouseEvent): void;
  areAllRowsSelected(rows: RowData[]): boolean;
  toggleRowsSelected(rows: RowData[], selected: boolean): void;
  setupColumnHeader(th: HTMLElement, col: ColumnDef): void;
  addColumn?(): void | Promise<void>;
  showRowMenu?(event: MouseEvent, row: RowData, context?: RowCreateContext, anchorEl?: HTMLElement): void;
  changeColumnCalculation?(columnKey: string, calculation: string | null): void;
  setupRow(tr: HTMLElement, row: RowData, context?: RowCreateContext): void;
  renderCell(td: HTMLElement, row: RowData, col: ColumnDef): void;
  renderRecordIcon?(parent: HTMLElement, row: RowData, config: ViewConfig, compact?: boolean): HTMLElement | null;
  renderGroupSummaries?(parent: HTMLElement, rows: RowData[], config: ViewConfig): void;
  applyConditionalFormat?(element: HTMLElement, row: RowData, config: ViewConfig, targetField?: string): void;
  setupFillHandle?(td: HTMLElement, row: RowData, col: ColumnDef): void;
  moveRowToPosition?(movedPath: string, beforePath?: string, afterPath?: string): void;
  moveRowsToGroup?(row: RowData, field: string, fromGroupKey: string, toGroupKey: string): void | Promise<void>;
  moveRowToGroupAndPosition?(
    row: RowData,
    field: string,
    fromGroupKey: string,
    toGroupKey: string,
    beforePath?: string,
    afterPath?: string
  ): void | Promise<void>;
  createEntry(defaults?: Record<string, unknown>, position?: CreateEntryPosition): void;
  isGroupCollapsed?(field: string, key: string): boolean;
  toggleGroupCollapsed?(field: string, key: string): void;
  expandGroup?(field: string, key: string, count: number): void;
  /** When true, the "+ 新建" row is not rendered */
  readonly hideCreateEntry?: boolean;
  /** When true, row-level data mutation controls are not rendered */
  readonly isReadOnly?: boolean;
  captureInteractionSnapshot?(): InteractionSnapshot;
  restoreInteractionSnapshot?(snapshot: InteractionSnapshot): void;
}

// ───────────────────────────────────────────────────────────────────
// 4. TABLE RENDERER
// ───────────────────────────────────────────────────────────────────

export class TableRenderer {
  private rowByPath = new Map<string, RowData>();
  private draggingPath: string | undefined;
  private rowDropFeedback = new DragDropFeedbackState();
  private rowAutoScroller?: EdgeAutoScroller;
  private emptyStateRenderer = new EmptyStateRenderer();
  private footerRenderer = new TableFooterRenderer();
  private renderContainer: HTMLElement | null = null;

  constructor(private actions: TableRendererActions) {}

  renderTable(container: HTMLElement, config: ViewConfig, rows: RowData[], emptyState?: EmptyStateOptions): void {
    this.clearTable(container);
    this.renderContainer = container;
    this.rowByPath = new Map(rows.map((row) => [row.file.path, row]));
    this.applyDensity(container, config);

    const visibleColumns = this.actions.getVisibleColumns(config, rows);
    const tableWrap = container.createDiv({ cls: "db-table-wrap" });
    const table = tableWrap.createEl("table", { cls: "db-table" });
    table.toggleClass("is-create-entry-hidden", Boolean(this.actions.hideCreateEntry));
    const availableWidth = this.getAvailableTableWidth(tableWrap);
    this.applyTableWidth(table, config, visibleColumns, availableWidth);
    this.renderColgroup(table, config, visibleColumns, availableWidth);
    this.renderHeader(table, config, visibleColumns, rows);
    const tbody = table.createEl("tbody");
    this.renderRows(tbody, config, rows, visibleColumns);
    if (rows.length === 0) {
      this.emptyStateRenderer.renderTableRow(
        tbody,
        visibleColumns.length + this.getUtilityColumnCount(config),
        emptyState || { reason: "no-matching-data" },
      );
    }
    if (!this.actions.hideCreateEntry) {
      this.renderNewRow(tbody, visibleColumns.length + this.getUtilityColumnCount(config), undefined, rows);
    }
    this.renderFooter(table, config, visibleColumns, rows);
    this.applyGridSemantics(table, config, visibleColumns, rows);
  }

  renderGroupedTable(
    containerEl: HTMLElement,
    config: ViewConfig,
    rows: RowData[],
    groups: TableGroup[],
    groupField?: string,
    emptyState?: EmptyStateOptions,
  ): void {
    this.clearTable(containerEl);
    this.renderContainer = containerEl;
    this.rowByPath = new Map(rows.map((row) => [row.file.path, row]));
    this.applyDensity(containerEl, config);

    const container = containerEl.createDiv({ cls: "db-grouped-table" });
    const visibleColumns = this.actions.getVisibleColumns(config, rows);
    const tableMinWidth = this.getTableMinWidth(config, visibleColumns);
    const tableWrap = container.createDiv({ cls: "db-table-wrap" });
    tableWrap.style.minWidth = `${tableMinWidth}px`;
    const table = tableWrap.createEl("table", { cls: "db-table" });
    table.toggleClass("is-create-entry-hidden", Boolean(this.actions.hideCreateEntry));
    const availableWidth = this.getAvailableTableWidth(tableWrap);
    this.applyTableWidth(table, config, visibleColumns, availableWidth);
    this.renderColgroup(table, config, visibleColumns, availableWidth);
    this.renderHeader(table, config, visibleColumns, rows);
    const tbody = table.createEl("tbody");
    const renderableGroups = this.getRenderableGroups(config, groups, groupField);
    if (renderableGroups.length === 0) {
      this.emptyStateRenderer.renderTableRow(
        tbody,
        visibleColumns.length + this.getUtilityColumnCount(config),
        emptyState || { reason: "no-matching-data" },
      );
    }
    let actionsRendered = false;
    for (const renderable of renderableGroups) {
      const group = renderable.group;
      const divider = this.renderGroupDividerRow(tbody, config, renderable, visibleColumns.length + this.getUtilityColumnCount(config));
      if (groupField && renderable.depth === 0) this.setupGroupDropTarget(divider, groupField, group.key);
      if (renderable.collapsed || group.children?.length) continue;

      const computedGroup = renderable.groupPath.some((pathGroup) => isComputedGroupField(config, pathGroup.field));
      const defaults = !computedGroup && renderable.groupPath.length > 0
        ? this.getGroupDefaults(config, renderable.groupPath)
        : undefined;
      const rowMoveGroups = renderable.depth === 0
        ? groups.filter((candidate) => (candidate.depth ?? 0) === 0)
        : undefined;
      this.renderRows(
        tbody,
        config,
        renderable.visibleRows,
        visibleColumns,
        groupField,
        group.key,
        rowMoveGroups,
        renderable.groupPath,
        renderable.depth === 0,
        defaults,
        computedGroup,
      );
      if (group.rows.length === 0) {
        const groupEmptyOptions: EmptyStateOptions = emptyState
          ? (actionsRendered && emptyState.actions
            ? { ...emptyState, actions: undefined }
            : emptyState)
          : { reason: "empty-group" };
        if (groupEmptyOptions.actions && groupEmptyOptions.actions.length > 0) {
          actionsRendered = true;
        }
        this.emptyStateRenderer.renderTableRow(
          tbody,
          visibleColumns.length + this.getUtilityColumnCount(config),
          groupEmptyOptions,
        );
      }
      if (!this.actions.hideCreateEntry) {
        this.renderNewRow(tbody, visibleColumns.length + this.getUtilityColumnCount(config), defaults, group.rows, computedGroup);
      }
      if (groupField) this.renderGroupExpandRow(
        tbody,
        config,
        groupField,
        renderable.collapseKey,
        group.rows.length,
        visibleColumns.length + this.getUtilityColumnCount(config),
      );
    }
    this.renderFooter(table, config, visibleColumns, rows);
    this.applyGridSemantics(table, config, visibleColumns, rows);
  }

  /**
   * Replace only changed rows in an ungrouped table. The caller must already
   * have rebuilt the row pipeline; this method refuses the patch unless the
   * rendered path order and visible column schema are unchanged.
   */
  patchUngroupedRows(
    container: HTMLElement,
    config: ViewConfig,
    rows: RowData[],
    changedPaths: ReadonlySet<string>
  ): boolean {
    const table = container.querySelector<HTMLElement>(":scope > .db-table-wrap > table.db-table");
    const tbody = table?.querySelector<HTMLElement>(":scope > tbody");
    if (!table || !tbody) return false;

    const renderedRows = Array.from(
      tbody.querySelectorAll<HTMLElement>(":scope > tr[data-note-database-row-path]")
    );
    const renderedPaths = renderedRows.map((row) => row.getAttribute("data-note-database-row-path") || "");
    const nextPaths = rows.map((row) => row.file.path);
    if (renderedPaths.length !== nextPaths.length ||
        renderedPaths.some((path, index) => path !== nextPaths[index])) {
      return false;
    }

    const visibleColumns = this.actions.getVisibleColumns(config, rows);
    const renderedColumnKeys = Array.from(
      table.querySelectorAll<HTMLElement>(":scope > thead [data-note-database-column-key]")
    ).map((header) => header.getAttribute("data-note-database-column-key") || "");
    if (renderedColumnKeys.length !== visibleColumns.length ||
        renderedColumnKeys.some((key, index) => key !== visibleColumns[index]?.key)) {
      return false;
    }

    this.rowByPath = new Map(rows.map((row) => [row.file.path, row]));
    const interaction = this.actions.captureInteractionSnapshot?.();
    const rowByPath = this.rowByPath;
    for (const oldRow of renderedRows) {
      const path = oldRow.getAttribute("data-note-database-row-path") || "";
      if (!changedPaths.has(path)) continue;
      const row = rowByPath.get(path);
      if (!row) return false;
      const replacement = this.renderRow(tbody, config, row, rows, visibleColumns);
      oldRow.replaceWith(replacement);
    }
    if (interaction) this.actions.restoreInteractionSnapshot?.(interaction);
    this.applyGridSemantics(table, config, visibleColumns, rows);
    return true;
  }

  /**
   * Replace only changed rows in a grouped table. Group headers, counts,
   * collapsed state, visible row order, and column schemas must all still
   * match. Any structural change falls back to the normal full render.
   */
  patchGroupedRows(
    container: HTMLElement,
    config: ViewConfig,
    rows: RowData[],
    groups: TableGroup[],
    groupField: string,
    changedPaths: ReadonlySet<string>
  ): boolean {
    const grouped = container.querySelector<HTMLElement>(":scope > .db-grouped-table");
    if (!grouped) return false;
    // Group summaries depend on every row in the group. Until their DOM has a
    // dedicated patch path, prefer the normal grouped render over stale totals.
    if (config.summaryRules && config.summaryRules.length > 0) return false;

    const visibleColumns = this.actions.getVisibleColumns(config, rows);
    const table = grouped.querySelector<HTMLElement>(":scope > .db-table-wrap > table.db-table");
    const tbody = table?.querySelector<HTMLElement>(":scope > tbody");
    const renderedHeaders = tbody
      ? Array.from(tbody.querySelectorAll<HTMLElement>(":scope > tr.db-group-divider-row"))
      : [];
    const renderableGroups = this.getRenderableGroups(config, groups, groupField);
    if (!table || !tbody || renderedHeaders.length !== renderableGroups.length) return false;
    const renderedColumnKeys = Array.from(
      table.querySelectorAll<HTMLElement>(":scope > thead [data-note-database-column-key]")
    ).map((header) => header.getAttribute("data-note-database-column-key") || "");
    if (renderedColumnKeys.length !== visibleColumns.length ||
        renderedColumnKeys.some((key, index) => key !== visibleColumns[index]?.key)) {
      return false;
    }

    const renderedRowsByGroup: Array<{
      tbody: HTMLElement;
      renderedRows: HTMLElement[];
      renderable: RenderableTableGroup;
      visibleRows: RowData[];
    }> = [];

    for (let index = 0; index < renderableGroups.length; index += 1) {
      const renderable = renderableGroups[index];
      const group = renderable.group;
      const header = renderedHeaders[index];
      if (header.getAttribute("data-note-database-group-key") !== group.key) return false;
      if (header.querySelector<HTMLElement>(".db-group-count")?.textContent !== String(group.count)) return false;

      const collapsed = renderable.collapsed;
      if (header.classList.contains("is-collapsed") !== collapsed) return false;
      const visibleRows = collapsed || group.children?.length ? [] : renderable.visibleRows;
      const renderedRows = Array.from(
        this.rowsBetweenGroupDividers(header, renderedHeaders[index + 1])
          .filter((rowEl) => rowEl.hasAttribute("data-note-database-row-path"))
      );
      const renderedPaths = renderedRows.map((rowEl) =>
        rowEl.getAttribute("data-note-database-row-path") || ""
      );
      const nextPaths = visibleRows.map((row) => row.file.path);
      if (renderedPaths.length !== nextPaths.length ||
          renderedPaths.some((path, rowIndex) => path !== nextPaths[rowIndex])) {
        return false;
      }
      renderedRowsByGroup.push({ tbody, renderedRows, renderable, visibleRows });
    }

    this.rowByPath = new Map(rows.map((row) => [row.file.path, row]));
    const interaction = this.actions.captureInteractionSnapshot?.();
    for (const { tbody, renderedRows, renderable, visibleRows } of renderedRowsByGroup) {
      const { group } = renderable;
      for (const oldRow of renderedRows) {
        const path = oldRow.getAttribute("data-note-database-row-path") || "";
        if (!changedPaths.has(path)) continue;
        const row = this.rowByPath.get(path);
        if (!row) return false;
        const replacement = this.renderRow(
          tbody,
          config,
          row,
          visibleRows,
          visibleColumns,
          groupField,
          group.key,
          groups,
          renderable.groupPath,
          renderable.depth === 0,
        );
        oldRow.replaceWith(replacement);
      }
    }
    if (interaction) this.actions.restoreInteractionSnapshot?.(interaction);
    this.applyGridSemantics(table, config, visibleColumns, rows);
    return true;
  }

  private rowsBetweenGroupDividers(current: HTMLElement, next?: HTMLElement): HTMLElement[] {
    const rows: HTMLElement[] = [];
    let sibling = current.nextElementSibling as HTMLElement | null;
    while (sibling && sibling !== next) {
      rows.push(sibling);
      sibling = sibling.nextElementSibling as HTMLElement | null;
    }
    return rows;
  }

  private clearTable(container: HTMLElement): void {
    this.rowDropFeedback.clear();
    container.querySelectorAll(".db-table-wrap, .db-grouped-table, .db-empty").forEach((el) => el.remove());
  }

  private renderColgroup(table: HTMLElement, config: ViewConfig, columns: ColumnDef[], availableWidth = 0): void {
    const colgroup = table.createEl("colgroup");
    const renderedWidths = this.getRenderedColumnWidths(config, columns, availableWidth);
    if (!this.actions.isReadOnly) {
      const selectionCol = colgroup.createEl("col");
      const selectionWidth = this.getSelectionColumnWidth();
      selectionCol.addClass("db-select-colgroup");
      selectionCol.setAttr("width", String(selectionWidth));
      selectionCol.style.width = `${selectionWidth}px`;
    }
    if (this.shouldRenderRecordIcon(config)) {
      const iconCol = colgroup.createEl("col");
      const iconWidth = this.getRecordIconColumnWidth();
      iconCol.addClass("db-record-icon-colgroup");
      iconCol.setAttr("width", String(iconWidth));
      iconCol.style.width = `${iconWidth}px`;
    }
    columns.forEach((col, index) => {
      const colEl = colgroup.createEl("col");
      colEl.setAttr("data-note-database-column-key", col.key);
      const style = getTableColumnStyle(renderedWidths[index], index, columns.length);
      if (style.width) colEl.style.width = style.width;
      if (style.minWidth) colEl.style.minWidth = style.minWidth;
    });
    const addColumn = colgroup.createEl("col", { cls: "db-add-column-colgroup" });
    addColumn.setAttr("width", String(this.getAddColumnWidth()));
    addColumn.style.width = `${this.getAddColumnWidth()}px`;
    addColumn.style.minWidth = `${this.getAddColumnWidth()}px`;
  }

  private getTableMinWidth(config: ViewConfig, columns: ColumnDef[]): number {
    return calculateTableMinWidth(this.getUtilityColumnsWidth(config), columns.map((col) => this.getColumnWidth(config, col)));
  }

  private getTableWidth(config: ViewConfig, columns: ColumnDef[], availableWidth = 0): number {
    return getTableLayout(this.getUtilityColumnsWidth(config), columns.map((col) => this.getColumnWidth(config, col)), availableWidth).tableWidth;
  }

  private applyTableWidth(table: HTMLElement, config: ViewConfig, columns: ColumnDef[], availableWidth = 0): void {
    const width = this.getTableWidth(config, columns, availableWidth);
    table.style.minWidth = `${width}px`;
    table.style.width = `${width}px`;
  }

  private getRenderedColumnWidths(config: ViewConfig, columns: ColumnDef[], availableWidth = 0): number[] {
    return getTableLayout(this.getUtilityColumnsWidth(config), columns.map((col) => this.getColumnWidth(config, col)), availableWidth).columnWidths;
  }

  private getColumnWidth(config: ViewConfig, col: ColumnDef): number {
    return config.columnWidths?.[col.key] || col.width || config.defaultColumnWidth || 150;
  }

  private getSelectionColumnWidth(): number {
    return isTouchDevice(this.renderContainer) ? 48 : 40;
  }

  private getRecordIconColumnWidth(): number {
    return 28;
  }

  private shouldRenderRecordIcon(config: ViewConfig): boolean {
    return config.showRecordIcon === true && typeof this.actions.renderRecordIcon === "function";
  }

  private getUtilityColumnsWidth(config: ViewConfig): number {
    return (this.actions.isReadOnly ? 0 : this.getSelectionColumnWidth())
      + (this.shouldRenderRecordIcon(config) ? this.getRecordIconColumnWidth() : 0)
      + this.getAddColumnWidth();
  }

  private getUtilityColumnCount(config: ViewConfig): number {
    return (this.actions.isReadOnly ? 0 : 1) + (this.shouldRenderRecordIcon(config) ? 1 : 0) + 1;
  }

  private getAddColumnWidth(): number {
    return 42;
  }

  private applyDensity(container: HTMLElement, config: ViewConfig): void {
    container.setAttribute("data-row-density", config.rowDensity || "default");
  }

  private getAvailableTableWidth(tableWrap: HTMLElement): number {
    const parent = tableWrap.parentElement;
    if (!parent) return 0;
    const cs = getComputedStyle(parent);
    const paddingLeft = parseFloat(cs.paddingLeft) || 0;
    const paddingRight = parseFloat(cs.paddingRight) || 0;
    return Math.max(0, Math.floor(parent.getBoundingClientRect().width - paddingLeft - paddingRight));
  }

  private renderHeader(table: HTMLElement, config: ViewConfig, columns: ColumnDef[], rows: RowData[]): void {
    const thead = table.createEl("thead");
    const headerRow = thead.createEl("tr", { attr: { role: "row", "aria-rowindex": "1" } });
    table.setAttr("role", "grid");
    table.setAttr("aria-label", t("table.ariaLabel"));
    if (!this.actions.isReadOnly) {
      const selectTh = headerRow.createEl("th", { cls: "db-select-col", attr: { role: "columnheader" } });
      const selectInner = selectTh.createDiv({ cls: "db-select-inner" });
      const selectAll = selectInner.createEl("input", { attr: { type: "checkbox" } });
      selectAll.checked = this.actions.areAllRowsSelected(rows);
      selectAll.onchange = () => {
        this.actions.toggleRowsSelected(rows, selectAll.checked);
      };
    }
    if (this.shouldRenderRecordIcon(config)) {
      headerRow.createEl("th", {
        cls: "db-record-icon-col",
        attr: { role: "columnheader", "aria-label": t("recordIcon.icons"), title: t("recordIcon.icons") },
      });
    }
    for (const col of columns) {
      const th = headerRow.createEl("th");
      th.setAttr("role", "columnheader");
      th.setAttr("aria-colindex", String(Array.from(headerRow.children).indexOf(th) + 1));
      th.setAttr("data-note-database-column-key", col.key);
      th.toggleClass("is-narrow", this.isHeaderNarrow(config, col));
      const content = th.createDiv({ cls: "db-th-content" });
      renderPropertyTypeIcon(content, col);
      content.createSpan({ cls: "db-th-label", text: col.label || col.key, attr: { title: col.label || col.key } });
      const sort = this.getColumnSortState(config, col);
      if (sort) {
        th.setAttr("aria-sort", sort.direction === "asc" ? "ascending" : "descending");
        const arrow = sort.direction === "asc" ? "▲" : "▼";
        const suffix = sort.total > 1 ? String(sort.index + 1) : "";
        content.createSpan({
          text: `${arrow}${suffix}`,
          cls: `sort-indicator sort-indicator-${sort.direction}`,
          attr: { title: sort.total > 1 ? `${sort.index + 1}. ${sort.direction}` : sort.direction },
        });
      }
      if (!sort) th.setAttr("aria-sort", "none");
      this.actions.setupColumnHeader(th, col);
    }
    const addTh = headerRow.createEl("th", { cls: "db-add-column-th", attr: { role: "columnheader" } });
    const addButton = addTh.createEl("button", {
      cls: "db-add-column-button",
      attr: { type: "button", "aria-label": t("table.addColumn"), title: t("table.addColumn") },
    });
    setIcon(addButton, "plus");
    if (this.actions.isReadOnly || !this.actions.addColumn) {
      addButton.disabled = true;
    } else {
      addButton.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        void this.actions.addColumn?.();
      };
    }
    Array.from(headerRow.children).forEach((header, index) => {
      (header as HTMLElement).setAttr("aria-colindex", String(index + 1));
    });
  }

  private getRenderableGroups(config: ViewConfig, groups: TableGroup[], groupField?: string): RenderableTableGroup[] {
    const result: RenderableTableGroup[] = [];
    const fieldsByDepth: string[] = [];
    let collapsedDepth: number | undefined;

    for (const group of groups) {
      const depth = Math.max(0, group.depth ?? 0);
      if (collapsedDepth != null) {
        if (depth > collapsedDepth) continue;
        collapsedDepth = undefined;
      }
      fieldsByDepth.length = depth + 1;
      const displayField = group.field ?? (depth === 0 ? groupField : fieldsByDepth[depth]);
      if (displayField) fieldsByDepth[depth] = displayField;
      const collapseKey = group.collapseKey ?? group.key;
      const collapsed = Boolean(groupField && this.actions.isGroupCollapsed?.(groupField, collapseKey));
      const visibleCount = groupField
        ? getGroupVisibleCount(config, groupField, collapseKey, group.rows.length)
        : group.rows.length;
      result.push({
        group,
        depth,
        displayField,
        collapseKey,
        collapsed,
        visibleRows: group.rows.slice(0, visibleCount),
        groupPath: this.getGroupPath(group, fieldsByDepth, groupField),
      });
      if (collapsed) collapsedDepth = depth;
    }
    return result;
  }

  private renderGroupDividerRow(
    tbody: HTMLElement,
    config: ViewConfig,
    renderable: RenderableTableGroup,
    colspan: number,
  ): HTMLElement {
    const { group, depth, displayField, collapseKey, collapsed } = renderable;
    const selectionRows = group.rows;
    const divider = tbody.createEl("tr", {
      cls: `db-group-divider-row ${getGroupHeaderClassName(depth)}${collapsed ? " is-collapsed" : ""}`,
      attr: {
        "data-note-database-group-key": group.key,
        "data-note-database-group-field": displayField || "",
        "data-note-database-group-paths": JSON.stringify(selectionRows.map((row) => row.file.path)),
      },
    });
    const sectionId = this.getGroupSectionId(displayField || "group", collapseKey);
    divider.setAttr("id", sectionId);
    const depthValue = getGroupHeaderDepthValue(depth);
    if (depthValue !== undefined) divider.style.setProperty("--db-group-depth", depthValue);
    const cell = divider.createEl("td", { attr: { colspan: String(Math.max(1, colspan)) } });
    const content = cell.createDiv({ cls: "db-group-divider-content" });
    if (!this.actions.isReadOnly) {
      const selectedIds = new Set(selectionRows.filter((row) => this.actions.isRowSelected(row)).map((row) => row.file.path));
      const selection = getSelectionState(selectionRows.map((row) => row.file.path), selectedIds);
      const checkbox = content.createEl("input", {
        cls: "db-group-divider-checkbox",
        attr: { type: "checkbox", "aria-label": t("group.selectRows") },
      });
      checkbox.checked = selection.checked;
      checkbox.indeterminate = selection.indeterminate;
      checkbox.onclick = (event) => event.stopPropagation();
      checkbox.onchange = () => this.actions.toggleRowsSelected(selectionRows, checkbox.checked);
    }
    const label = content.createSpan({ cls: "db-group-header-label" });
    if (displayField) {
      const toggle = label.createEl("button", {
        cls: `db-group-collapse-toggle${collapsed ? " is-collapsed" : ""}`,
        attr: {
          type: "button",
          "aria-label": collapsed ? t("group.expand") : t("group.collapse"),
          "aria-expanded": String(!collapsed),
          "aria-controls": sectionId,
        },
      });
      toggle.createSpan({ cls: "db-collapse-triangle" });
      toggle.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.actions.toggleGroupCollapsed?.(displayField, collapseKey);
      };
    }
    renderGroupLabel(label, config, displayField, group.key, "db-group-title-text");
    label.createSpan({ cls: "db-group-count", text: String(group.count) });
    const summaries = content.createDiv({ cls: "db-group-divider-summaries" });
    this.actions.renderGroupSummaries?.(summaries, group.rows, config);
    return divider;
  }

  private renderGroupExpandRow(
    tbody: HTMLElement,
    config: ViewConfig,
    field: string,
    key: string,
    totalCount: number,
    colspan: number,
  ): void {
    const row = tbody.createEl("tr", { cls: "db-group-expand-row" });
    const cell = row.createEl("td", { attr: { colspan: String(Math.max(1, colspan)) } });
    if (!renderGroupExpandControls(cell, config, field, key, totalCount, this.actions)) row.remove();
  }

  private renderRowInsertionLine(
    tbody: HTMLElement,
    config: ViewConfig,
    defaults: Record<string, unknown> | undefined,
    afterPath: string,
    beforePath: string,
    colspan: number,
  ): void {
    if (this.actions.isReadOnly || this.actions.hideCreateEntry || !this.actions.createEntry || isExplicitlySorted(config)) return;
    const line = tbody.createEl("tr", {
      cls: "db-row-insert-line",
      attr: { "data-before-path": beforePath, "data-after-path": afterPath },
    });
    const cell = line.createEl("td", { attr: { colspan: String(Math.max(1, colspan)) } });
    const button = cell.createEl("button", {
      cls: "db-row-insert-button",
      attr: { type: "button", "aria-label": t("table.insertRow") },
    });
    setIcon(button, "plus");
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.actions.createEntry?.(defaults, { beforePath, afterPath });
    };
  }

  private renderFooter(table: HTMLElement, config: ViewConfig, columns: ColumnDef[], rows: RowData[]): void {
    this.footerRenderer.renderFooter(table as HTMLTableElement, config, columns, rows, {
      isReadOnly: this.actions.isReadOnly,
      hasRecordIcon: this.shouldRenderRecordIcon(config),
      onCalculationChange: (columnKey, calculation) => {
        this.actions.changeColumnCalculation?.(columnKey, calculation);
      },
    });
  }

  private getColumnSortState(config: ViewConfig, col: ColumnDef): { direction: "asc" | "desc"; index: number; total: number } | null {
    const rules = (config.sortRules || []).filter((rule) => rule.field && rule.direction);
    const index = rules.findIndex((rule) => rule.field === col.key);
    if (index >= 0) return { direction: rules[index].direction, index, total: rules.length };
    if (rules.length === 0 && config.sortColumn === col.key) {
      return { direction: config.sortDirection || "asc", index: 0, total: 1 };
    }
    return null;
  }

  private isHeaderNarrow(config: ViewConfig, col: ColumnDef): boolean {
    const width = this.getColumnWidth(config, col);
    const labelLength = (col.label || col.key).length;
    return width < Math.min(180, Math.max(96, labelLength * 7 + 54));
  }

  private renderRows(
    tbody: HTMLElement,
    config: ViewConfig,
    rows: RowData[],
    columns: ColumnDef[],
    groupField?: string,
    groupKey?: string,
    groups?: TableGroup[],
    groupPath?: Array<{ field: string; key: string }>,
    allowGroupMove = true,
    insertDefaults?: Record<string, unknown>,
    computedGroup = false,
  ): void {
    rows.forEach((row, index) => {
      this.renderRow(tbody, config, row, rows, columns, groupField, groupKey, groups, groupPath, allowGroupMove);
      if (index < rows.length - 1 && !computedGroup) {
        this.renderRowInsertionLine(tbody, config, insertDefaults, rows[index].file.path, rows[index + 1].file.path, columns.length + this.getUtilityColumnCount(config));
      }
    });
  }

  private renderRow(
    tbody: HTMLElement,
    config: ViewConfig,
    row: RowData,
    rows: RowData[],
    columns: ColumnDef[],
    groupField?: string,
    groupKey?: string,
    groups?: TableGroup[],
    groupPath?: Array<{ field: string; key: string }>,
    allowGroupMove = true,
  ): HTMLElement {
    const tr = tbody.createEl("tr", {
      attr: { "data-note-database-row-path": row.file.path, role: "row" },
    });
    this.actions.applyConditionalFormat?.(tr, row, config);
    if (groupField && groupKey != null) {
      tr.setAttr("data-note-database-group-field", groupField);
      tr.setAttr("data-note-database-group-key", groupKey);
    }
    this.actions.setupRow(tr, row, {
      visibleRows: rows,
      groups: groupPath ?? (groupField && groupKey != null ? [{ field: groupField, key: groupKey }] : undefined),
    });
    if (!this.actions.isReadOnly) {
      const selectTd = tr.createEl("td", { cls: "db-select-col" });
      const selectInner = selectTd.createDiv({ cls: "db-select-inner" });
      // 拖拽手柄（左）与 checkbox（右）放入同一 flex 容器：先建手柄、再建 checkbox，
      // checkbox 用 margin-left:auto 贴右，使各行 checkbox 与表头 checkbox 上下对齐。
      const rowMoveField = allowGroupMove ? groupField : undefined;
      const rowMoveKey = allowGroupMove ? groupKey : undefined;
      this.setupRowDrag(selectInner, tr, row, rows, config, rowMoveField, rowMoveKey, {
        visibleRows: rows,
        groups: groupPath ?? (groupField && groupKey != null ? [{ field: groupField, key: groupKey }] : undefined),
      });
      if (isTouchDevice(this.renderContainer) && (this.canManualReorder(config) || Boolean(rowMoveField && groups?.length))) {
        this.renderMobileMoveButton(selectInner, config, row, rows, rowMoveField, rowMoveKey, groups);
      }
      const cb = selectInner.createEl("input", { attr: { type: "checkbox" } });
      cb.checked = this.actions.isRowSelected(row);
      cb.onclick = (event) => {
        event.stopPropagation();
        this.actions.toggleRowSelected(row, !this.actions.isRowSelected(row), event);
      };
    }
    if (this.shouldRenderRecordIcon(config)) {
      const iconTd = tr.createEl("td", { cls: "db-record-icon-col" });
      const icon = this.actions.renderRecordIcon?.(iconTd, row, config, true);
      // Keep spreadsheet roving-tabindex authoritative: the gutter is clickable,
      // but must not become an extra Tab stop between real data cells.
      icon?.setAttr("tabindex", "-1");
    }
    for (const col of columns) {
      const td = tr.createEl("td", {
        attr: {
          "data-note-database-row-path": row.file.path,
          "data-note-database-column-key": col.key,
        },
      });
      this.actions.renderCell(td, row, col);
      this.actions.applyConditionalFormat?.(td, row, config, col.key);
      if (!this.actions.isReadOnly) this.actions.setupFillHandle?.(td, row, col);
    }
    tr.createEl("td", { cls: "db-add-column-cell", attr: { "aria-hidden": "true" } });
    return tr;
  }

  /** Phone layouts use a compact menu instead of HTML drag and drop. */
  private renderMobileMoveButton(
    parent: HTMLElement,
    config: ViewConfig,
    row: RowData,
    rows: RowData[],
    groupField?: string,
    groupKey?: string,
    groups?: TableGroup[]
  ): void {
    const button = parent.createEl("button", {
      cls: "db-table-mobile-move-btn",
      attr: { type: "button", title: t("mobile.moveCard"), "aria-label": t("mobile.moveCard") },
    });
    renderMobileMoveIcon(button);
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const menu = new Menu();
      if (this.canManualReorder(config)) this.addMobilePositionItems(menu, row, rows);
      if (groupField && groupKey != null && groups?.length && this.actions.moveRowToGroupAndPosition) {
        if (this.canManualReorder(config)) menu.addSeparator();
        for (const group of groups) {
          if (group.key === groupKey) continue;
          const groupLabel = formatGroupKeyDisplay(config, groupField, group.key);
          menu.addItem((item) => item
            .setTitle(`${t("mobile.moveTo")} ${groupLabel}`)
            .setIcon("folder-input")
            .onClick(() => {
              const paths = group.rows.map((candidate) => candidate.file.path).filter((path) => path !== row.file.path);
              void this.actions.moveRowToGroupAndPosition?.(
                row,
                groupField,
                groupKey,
                group.key,
                paths[paths.length - 1],
                undefined
              );
            }));
        }
      }
      menu.showAtMouseEvent(event);
    };
  }

  /** Add local rank movement actions shared by grouped and ungrouped table rows. */
  private addMobilePositionItems(menu: Menu, row: RowData, rows: RowData[]): void {
    const paths = rows.map((candidate) => candidate.file.path);
    const index = paths.indexOf(row.file.path);
    const move = (targetIndex: number) => {
      const remaining = paths.filter((path) => path !== row.file.path);
      const boundedIndex = Math.max(0, Math.min(targetIndex, remaining.length));
      this.actions.moveRowToPosition?.(row.file.path, remaining[boundedIndex - 1], remaining[boundedIndex]);
    };
    menu.addItem((item) => item.setTitle(t("menu.moveUp")).setIcon("chevron-up").setDisabled(index <= 0).onClick(() => move(index - 1)));
    menu.addItem((item) => item.setTitle(t("menu.moveDown")).setIcon("chevron-down").setDisabled(index < 0 || index >= paths.length - 1).onClick(() => move(index + 1)));
    menu.addItem((item) => item.setTitle(t("mobile.moveTop")).setIcon("chevrons-up").setDisabled(index <= 0).onClick(() => move(0)));
    menu.addItem((item) => item.setTitle(t("mobile.moveBottom")).setIcon("chevrons-down").setDisabled(index < 0 || index >= paths.length - 1).onClick(() => move(paths.length - 1)));
  }

  private renderNewRow(tbody: HTMLElement, colspan: number, defaults?: Record<string, unknown>, rows: RowData[] = [], computedGroup = false): void {
    const tr = tbody.createEl("tr", { cls: "db-new-row" });
    const td = tr.createEl("td", { attr: { colspan: String(Math.max(colspan, 1)) } });
    if (computedGroup) {
      td.createEl("button", { cls: "db-new-row-button is-disabled", text: t("group.computedCreateDisabled"), attr: { disabled: "true" } });
      return;
    }
    const btn = td.createEl("button", { cls: "db-new-row-button", text: `+ ${t("toolbar.new")}` });
    btn.onclick = () => this.createEntryNearEnd(defaults, rows);
  }

  private createEntryNearEnd(defaults: Record<string, unknown> | undefined, rows: RowData[]): void {
    this.actions.createEntry(defaults, this.getCreatePosition(rows));
  }

  private getCreatePosition(rows: RowData[]): CreateEntryPosition | undefined {
    const last = rows[rows.length - 1];
    return last ? { afterPath: last.file.path } : undefined;
  }

  private setupRowDrag(
    handleParent: HTMLElement | undefined,
    tr: HTMLElement,
    row: RowData,
    rows: RowData[],
    config: ViewConfig,
    groupField?: string,
    groupKey?: string,
    context?: RowCreateContext,
  ): void {
    const canMoveGroup = Boolean(groupField && groupKey != null && typeof this.actions.moveRowsToGroup === "function");
    const canReorder = this.canManualReorder(config);
    if (this.actions.isReadOnly) return;
    if (isTouchDevice(this.renderContainer)) return;
    if (!handleParent) return;

    const handle = handleParent.createEl("button", {
      cls: "db-table-row-drag-handle",
      attr: { type: "button", title: t("panel.dragToSort"), "aria-label": t("panel.dragToSort") },
    });
    setIcon(handle, "grip-vertical");
    handle.draggable = canMoveGroup || canReorder;
    tr.addClass("is-manual-row-draggable");
    handle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.actions.showRowMenu?.(event, row, context, handle);
    });
    handle.addEventListener("dragstart", (event) => {
      if (!handle.draggable) {
        event.preventDefault();
        return;
      }
      event.stopPropagation();
      event.dataTransfer?.setData(ROW_MIME, row.file.path);
      event.dataTransfer?.setData("text/plain", row.file.path);
      if (groupKey != null) event.dataTransfer?.setData(ROW_FROM_GROUP_MIME, groupKey);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
      // 以整行作为拖拽预览（参考列管理面板拖拽整项），避免只看到一个手柄在飞；
      // 在加 is-dragging 之前截取，保证预览是不透明的完整行。
      if (event.dataTransfer) {
        const rect = tr.getBoundingClientRect();
        event.dataTransfer.setDragImage(tr, event.clientX - rect.left, event.clientY - rect.top);
      }
      this.draggingPath = row.file.path;
      this.rowDropFeedback.begin(row.file.path, [row.file.path]);
      this.rowAutoScroller = new EdgeAutoScroller(tr.closest<HTMLElement>(".db-table-wrap") || tr);
      this.setRowDraggingMode(tr, true);
      tr.addClass("is-dragging");
    });

    handle.addEventListener("dragend", () => {
      this.draggingPath = undefined;
      this.rowAutoScroller?.destroy();
      this.rowAutoScroller = undefined;
      this.setRowDraggingMode(tr, false);
      tr.removeClass("is-dragging");
      if (this.rowDropFeedback.getPhase() !== "pending") this.rowDropFeedback.clear();
    });

    if (!canReorder) return;

    tr.addEventListener("dragover", (event) => {
      const dragPath = this.draggingPath || event.dataTransfer?.getData(ROW_MIME);
      if (!dragPath || dragPath === row.file.path) return;
      if (!this.isRowDrag(event)) return;
      event.preventDefault();
      event.stopPropagation();
      this.rowAutoScroller?.update(event);
      this.rowDropFeedback.update(tr, resolveDropPlacement(tr, event, "vertical"));
    });

    tr.addEventListener("dragleave", () => {
      this.rowDropFeedback.clearTarget(tr);
    });

    tr.addEventListener("drop", (event) => {
      if (!this.isRowDrag(event)) return;
      const dragPath = this.draggingPath || event.dataTransfer?.getData(ROW_MIME) || event.dataTransfer?.getData("text/plain");
      const draggedRow = dragPath ? this.rowByPath.get(dragPath) : undefined;
      if (!dragPath || dragPath === row.file.path || !draggedRow) return;
      event.preventDefault();
      event.stopPropagation();
      this.draggingPath = undefined;
      this.rowAutoScroller?.destroy();
      this.rowAutoScroller = undefined;
      this.setRowDraggingMode(tr, false);

      const placement = this.rowDropFeedback.getPlacement(tr) || resolveDropPlacement(tr, event, "vertical");
      this.rowDropFeedback.setPending();
      const isAfter = placement === "after";
      const position = this.getDropPosition(rows, dragPath, row.file.path, isAfter);
      void this.moveRowToDropPosition(draggedRow, dragPath, groupField, groupKey, event, position.beforePath, position.afterPath)
        .then(() => this.rowDropFeedback.commit())
        .catch((error) => this.rowDropFeedback.fail(error));
    });
  }

  private setupGroupDropTarget(target: HTMLElement, groupField: string, groupKey: string): void {
    if (this.actions.isReadOnly || !this.actions.moveRowsToGroup) return;
    target.addEventListener("dragover", (event) => {
      if (!this.isRowDrag(event)) return;
      event.preventDefault();
      this.setGroupDropTarget(target, true);
    });
    target.addEventListener("dragleave", () => this.setGroupDropTarget(target, false));
    target.addEventListener("drop", (event) => {
      if (!this.isRowDrag(event)) return;
      const path = event.dataTransfer?.getData(ROW_MIME) || event.dataTransfer?.getData("text/plain");
      const row = path ? this.rowByPath.get(path) : undefined;
      if (!row || !path) return;
      event.preventDefault();
      event.stopPropagation();
      this.setGroupDropTarget(target, false);
      const fromGroupKey = event.dataTransfer?.getData(ROW_FROM_GROUP_MIME) || "";
      this.rowDropFeedback.begin(path, [path], groupKey);
      this.rowDropFeedback.setPending();
      void Promise.resolve(this.actions.moveRowsToGroup?.(row, groupField, fromGroupKey, groupKey))
        .then(() => this.rowDropFeedback.commit())
        .catch((error) => this.rowDropFeedback.fail(error));
    });
  }

  private setGroupDropTarget(target: HTMLElement, active: boolean): void {
    target.toggleClass("is-drop-target", active);
    const tableWrap = target.closest<HTMLElement>(".db-table-wrap");
    if (tableWrap && target !== tableWrap) tableWrap.toggleClass("is-drop-target", active);
  }

  private isRowDrag(event: DragEvent): boolean {
    return Boolean(this.draggingPath) || Array.from(event.dataTransfer?.types || []).includes(ROW_MIME);
  }

  private canManualReorder(config: ViewConfig): boolean {
    if (!this.actions.moveRowToPosition) return false;
    return !isExplicitlySorted(config);
  }

  private getDropPosition(
    rows: RowData[],
    dragPath: string,
    targetPath: string,
    isAfter: boolean
  ): { beforePath?: string; afterPath?: string } {
    const paths = rows.map((candidate) => candidate.file.path).filter((path) => path !== dragPath);
    const targetIndex = paths.indexOf(targetPath);
    if (targetIndex < 0) return {};
    if (isAfter) {
      return {
        beforePath: targetPath,
        afterPath: targetIndex < paths.length - 1 ? paths[targetIndex + 1] : undefined,
      };
    }
    return {
      beforePath: targetIndex > 0 ? paths[targetIndex - 1] : undefined,
      afterPath: targetPath,
    };
  }

  private async moveRowToDropPosition(
    row: RowData,
    dragPath: string,
    groupField: string | undefined,
    groupKey: string | undefined,
    event: DragEvent,
    beforePath?: string,
    afterPath?: string
  ): Promise<void> {
    const fromGroupKey = event.dataTransfer?.getData(ROW_FROM_GROUP_MIME) || "";
    if (groupField && groupKey != null && fromGroupKey !== groupKey) {
      if (this.actions.moveRowToGroupAndPosition) {
        await this.actions.moveRowToGroupAndPosition(row, groupField, fromGroupKey, groupKey, beforePath, afterPath);
        return;
      }
      await this.actions.moveRowsToGroup?.(row, groupField, fromGroupKey, groupKey);
    }
    this.actions.moveRowToPosition?.(dragPath, beforePath, afterPath);
  }

  private setRowDraggingMode(rowEl: HTMLElement, active: boolean): void {
    const container = rowEl.closest<HTMLElement>(".note-database-container");
    container?.toggleClass("is-row-dragging", active);
    if (!active) {
      container?.querySelectorAll(".db-table th.db-drop-target, .db-table th.db-dragging").forEach((el) => {
        el.classList.remove("db-drop-target", "db-dragging");
      });
    }
  }

  private getGroupSectionId(field: string, key: string): string {
    return `group-section-${encodeURIComponent(`${field}:${key}`)}`;
  }

  private applyGridSemantics(table: HTMLElement, config: ViewConfig, columns: ColumnDef[], rows: RowData[]): void {
    const rowCount = table.querySelectorAll<HTMLElement>("tbody > tr[data-note-database-row-path]").length;
    table.setAttr("aria-rowcount", String(Math.max(1, rowCount + 1)));
    table.setAttr("aria-colcount", String(columns.length + this.getUtilityColumnCount(config)));
    table.querySelectorAll<HTMLElement>("tbody > tr[data-note-database-row-path]").forEach((row, index) => {
      row.setAttr("role", "row");
      row.setAttr("aria-rowindex", String(index + 2));
      const dataRow = rows.find((candidate) => candidate.file.path === row.dataset.noteDatabaseRowPath);
      const selected = dataRow ? this.actions.isRowSelected(dataRow) : false;
      row.setAttr("aria-selected", String(Boolean(selected)));
      Array.from(row.children).forEach((cell) => {
        const element = cell as HTMLElement;
        element.setAttr("role", "gridcell");
        element.setAttr("aria-colindex", String(Array.from(row.children).indexOf(cell) + 1));
        element.setAttr("aria-selected", String(Boolean(selected) || element.hasClass("db-cell-range-selected")));
      });
    });
  }

  private getGroupPath(
    group: TableGroup,
    fieldsByDepth: readonly string[],
    groupField?: string,
  ): Array<{ field: string; key: string }> {
    const keys = group.path?.length ? group.path : [group.key];
    return keys
      .map((key, index) => ({
        field: fieldsByDepth[index] || (index === 0 ? groupField : index === keys.length - 1 ? group.field : undefined),
        key,
      }))
      .filter((pathGroup): pathGroup is { field: string; key: string } => Boolean(pathGroup.field));
  }

  private getGroupDefaults(
    config: ViewConfig,
    groupPath: Array<{ field: string; key: string }>,
  ): Record<string, unknown> {
    const defaults: Record<string, unknown> = {};
    for (const { field, key } of groupPath) {
      if (isComputedGroupField(config, field)) continue;
      const groupDefaults = resolveGroupCreateDefaults(config, field, key);
      for (const [defaultKey, value] of Object.entries(groupDefaults)) defaults[defaultKey] = value;
    }
    return defaults;
  }

}
