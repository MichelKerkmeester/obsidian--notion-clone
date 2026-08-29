// ───────────────────────────────────────────────────────────────────
// MODULE:    list-renderer
// COMPONENT: renders the list view's rows and groups, and owns their
//            drag-reorder, drag-to-group and mobile move-menu behavior
// ───────────────────────────────────────────────────────────────────
//
// Manual reordering and cross-group moves share one drag payload format
// (path + batch + from-group MIME types) so a single drop handler can
// serve both plain reordering and grouped-row moves without guessing
// which case it is from the event alone. The desktop path is native HTML
// drag-and-drop; touch devices fall back to the mobile move menu instead,
// since dragover/drop never fire reliably on touch there.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, setIcon, setTooltip } from "obsidian";
import { isObsidianTagsKey, toMultiSelectValuesForKey } from "../data/column-types";
import { isExplicitlySorted } from "../data/manual-order";
import { getColumnDisplayType } from "../data/column-display";
import { getFileFieldFixedType, getRowFileFieldValue, isFileFieldKey } from "../data/file-fields";
import { formatGroupKeyDisplay, isComputedGroupField } from "../data/group-display";
import { renderGroupLabel } from "./group-label-renderer";
import { markNoteHoverLink } from "./hover-link-preview";
import { ColumnDef, CreateEntryPosition, NO_TITLE_FIELD, RowCreateContext, RowData, ViewConfig } from "../data/types";
import { t } from "../i18n";
import { setFieldTooltip } from "./field-tooltip";
import { getFileTitleDisplay, renderStackedFileTitle } from "./file-title-display";
import { isHTMLElement } from "./dom-guards";
import { renderMobileMoveIcon } from "./mobile-move-icon";
import { getFieldWidth } from "./column-width";
import { renderGroupExpandControls } from "./group-expand-controls";
import { getGroupVisibleCount } from "../data/group-visibility";
import { DragDropFeedbackState, resolveDropPlacement } from "./drag-drop-feedback";
import { resolveTitleFieldDisplay } from "../data/title-field-display";
import { EmptyStateOptions, EmptyStateRenderer } from "./empty-state-renderer";
import { renderCardField } from "./card-field-renderer";
import { attachLongPress, isTouchDevice } from "../data/touch-environment";
import { CardRovingController, syncCardRoving, wireCardKeyboard } from "./card-roving-tabindex";
import { isImeComposing } from "../data/keyboard-utils";
import { createOwnedMenuForEvent, OwnedMenuHandle } from "./owned-menu";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const ROW_MIME = "application/x-note-database-row";
const ROW_FROM_GROUP_MIME = "application/x-note-database-row-from-group";
const ROW_BATCH_MIME = "application/x-note-database-row-batch";

// ───────────────────────────────────────────────────────────────────
// 3. TYPES
// ───────────────────────────────────────────────────────────────────

export interface ListGroup {
  key: string;
  rows: RowData[];
  count: number;
}

export interface ListRendererActions {
  openRow(row: RowData): void;
  openRecordDetail?(anchorEl: HTMLElement, row: RowData): void;
  createEntry(defaults?: Record<string, unknown>, position?: CreateEntryPosition): void;
  isRowSelected(row: RowData): boolean;
  toggleRowSelected(row: RowData, selected: boolean, event?: MouseEvent): void;
  areAllRowsSelected(rows: RowData[]): boolean;
  toggleRowsSelected(rows: RowData[], selected: boolean): void;
  editCell(target: HTMLElement, row: RowData, col: ColumnDef, event?: MouseEvent): void;
  saveCellValue?(row: RowData, col: ColumnDef, value: number): void | Promise<void | boolean>;
  editFileName?(target: HTMLElement, row: RowData, currentName: string): void;
  getColumns(config: ViewConfig): ColumnDef[];
  moveRowToPosition(movedPath: string, beforePath?: string, afterPath?: string): void;
  moveRowsToGroup?(row: RowData, field: string, fromGroupKey: string, toGroupKey: string): void | Promise<void>;
  moveRowToGroupAndPosition?(
    row: RowData,
    field: string,
    fromGroupKey: string,
    toGroupKey: string,
    beforePath?: string,
    afterPath?: string,
    movedPaths?: string[],
  ): void | Promise<void>;
  moveRowsToPosition?(movedPaths: string[], beforePath?: string, afterPath?: string): void;
  getSelectedRows?(): RowData[];
  isGroupCollapsed?(field: string, key: string): boolean;
  toggleGroupCollapsed?(field: string, key: string): void;
  expandGroup?(field: string, key: string, count: number): void;
  showRowMenu?(event: MouseEvent, row: RowData, context?: RowCreateContext): void;
  showColumnMenu?(event: MouseEvent, col: ColumnDef, anchorEl?: HTMLElement): void;
  editFormula?(col: ColumnDef): void;
  renderRecordIcon?(parent: HTMLElement, row: RowData, config: ViewConfig, compact?: boolean): HTMLElement | null;
  renderGroupSummaries?(parent: HTMLElement, rows: RowData[], config: ViewConfig): void;
  applyConditionalFormat?(element: HTMLElement, row: RowData, config: ViewConfig, targetField?: string): void;
  readonly isReadOnly?: boolean;
  readonly hideCreateEntry?: boolean;
}

interface ParsedLink {
  label: string;
  target: string;
  external: boolean;
}

// ───────────────────────────────────────────────────────────────────
// 4. LIST RENDERER
// ───────────────────────────────────────────────────────────────────

export class ListRenderer {
  private container: HTMLElement | null = null;
  private rowByPath = new Map<string, RowData>();
  private draggingPath: string | undefined;
  private draggingPaths: string[] = [];
  private rowDropFeedback = new DragDropFeedbackState();
  private emptyStateRenderer = new EmptyStateRenderer();
  private rovingController = new CardRovingController();

  constructor(private app: App, private actions: ListRendererActions) {}

  render(container: HTMLElement, config: ViewConfig, rows: RowData[], emptyState?: EmptyStateOptions): void {
    this.clear(container);
    this.container = container;
    this.rowByPath = new Map(rows.map((row) => [row.file.path, row]));
    if (rows.length > 0) this.renderTotalHeader(container, rows);
    const list = this.createList(container, config);
    if (rows.length === 0) {
      this.emptyStateRenderer.renderCard(list, emptyState || { reason: "no-matching-data" });
    }
    for (const row of rows) this.renderRow(list, config, row, undefined, undefined, undefined, rows);
    this.renderNewRow(list, undefined, rows);
    syncCardRoving(container, this.rovingController, ".db-list-row");
  }

  renderGrouped(
    container: HTMLElement,
    config: ViewConfig,
    groups: ListGroup[],
    groupField: string,
    emptyState?: EmptyStateOptions,
  ): void {
    this.clear(container);
    this.container = container;
    this.rowByPath = new Map(groups.flatMap((group) => group.rows.map((row) => [row.file.path, row] as const)));
    const grouped = container.createDiv({ cls: "db-list-grouped" });
    let actionsRendered = false;
    for (const group of groups) {
      const section = grouped.createDiv({ cls: "db-list-group" });
      const sectionId = `group-section-${encodeURIComponent(`${groupField}:${group.key}`)}`;
      section.setAttr("id", sectionId);
      const header = section.createDiv({ cls: "db-list-group-header" });
      this.setupGroupDropTarget(header, groupField, group.key);
      const collapsed = Boolean(this.actions.isGroupCollapsed?.(groupField, group.key));
      section.toggleClass("is-collapsed", collapsed);
      const label = header.createSpan({ cls: "db-list-group-header-label" });
      const toggle = label.createEl("button", {
        cls: `db-list-group-toggle${collapsed ? " is-collapsed" : ""}`,
        attr: { type: "button", "aria-label": collapsed ? t("group.expand") : t("group.collapse"), "aria-expanded": String(!collapsed), "aria-controls": sectionId },
      });
      toggle.createSpan({ cls: "db-collapse-triangle" });
      toggle.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.actions.toggleGroupCollapsed?.(groupField, group.key);
      };
      this.renderGroupCheckbox(label, group.rows, group.key || t("common.noGroup"));
      renderGroupLabel(label, config, groupField, group.key, "db-list-group-title");
      label.createSpan({ cls: "db-list-group-count", text: String(group.count) });
      this.actions.renderGroupSummaries?.(label, group.rows, config);
      if (!collapsed && !this.actions.isReadOnly && !this.actions.hideCreateEntry) {
        const newButton = header.createEl("button", {
          cls: "db-list-group-new",
          text: `+ ${t("toolbar.new")}`,
          attr: { type: "button" },
        });
        newButton.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (isComputedGroupField(config, groupField)) return;
          this.createEntryNearEnd({ [groupField]: group.key || "" }, group.rows);
        };
      }
      if (collapsed) continue;
      const list = this.createList(section, config);
      this.setupGroupDropTarget(list, groupField, group.key);
      const visibleCount = getGroupVisibleCount(config, groupField, group.key, group.rows.length);
      if (visibleCount === 0) {
        const groupEmptyOptions: EmptyStateOptions = emptyState
          ? (actionsRendered && emptyState.actions
            ? { ...emptyState, actions: undefined }
            : emptyState)
          : { reason: "empty-group" };
        if (groupEmptyOptions.actions && groupEmptyOptions.actions.length > 0) {
          actionsRendered = true;
        }
        const empty = this.emptyStateRenderer.renderCard(
          list,
          groupEmptyOptions,
        );
        empty.addClass("db-list-empty-group");
      }
      for (const row of group.rows.slice(0, visibleCount)) this.renderRow(list, config, row, groupField, group.key, groups, group.rows);
      const computedGroup = isComputedGroupField(config, groupField);
      this.renderNewRow(list, computedGroup ? undefined : { [groupField]: group.key || "" }, group.rows, computedGroup);
      renderGroupExpandControls(list, config, groupField, group.key, group.rows.length, this.actions);
    }
    syncCardRoving(container, this.rovingController, ".db-list-row");
  }

  private renderTotalHeader(container: HTMLElement, rows: RowData[]): void {
    const header = container.createDiv({ cls: "db-list-total-header" });
    const label = header.createSpan({ cls: "db-list-group-header-label" });
    this.renderGroupCheckbox(label, rows, t("common.total"));
    label.createSpan({ cls: "db-list-group-title", text: t("common.total") });
    label.createSpan({ cls: "db-list-group-count", text: String(rows.length) });
  }

  private renderGroupCheckbox(parent: HTMLElement, rows: RowData[], label?: string): void {
    if (this.actions.isReadOnly) return;
    const checkbox = parent.createEl("input", {
      cls: "db-list-group-checkbox",
      attr: { type: "checkbox", "aria-label": label || t("common.total") },
    });
    checkbox.checked = this.actions.areAllRowsSelected(rows);
    checkbox.indeterminate = rows.some((row) => this.actions.isRowSelected(row)) && !checkbox.checked;
    checkbox.onclick = (event) => event.stopPropagation();
    checkbox.onchange = () => this.actions.toggleRowsSelected(rows, checkbox.checked);
  }

  private createList(parent: HTMLElement, config: ViewConfig): HTMLElement {
    const list = parent.createDiv({ cls: "db-list", attr: { role: "grid" } });
    if (config.listCompactFields === true) list.addClass("is-compact-fields");
    return list;
  }

  private renderRow(list: HTMLElement, config: ViewConfig, row: RowData, groupField?: string, groupKey?: string, groups?: ListGroup[], allRows?: RowData[]): void {
    const item = list.createDiv({
      cls: "db-list-row",
      attr: {
        "data-note-database-row-path": row.file.path,
        title: row.file.path,
        role: "row",
        "aria-keyshortcuts": "Enter Space F2",
      },
    });
    wireCardKeyboard({
      card: item,
      rovingController: this.rovingController,
      onActivate: this.actions.openRecordDetail ? () => this.actions.openRecordDetail?.(item, row) : undefined,
      ignoreSelector: "a, button, input, select, textarea, .db-cell-editing",
    });
    if (this.actions.openRecordDetail) {
      item.addEventListener("click", (event) => {
        if (isHTMLElement(event.target) && event.target.closest("a, button, input, select, textarea, .db-cell-editing")) return;
        this.actions.openRecordDetail?.(item, row);
      });
    }
    this.actions.applyConditionalFormat?.(item, row, config);
    this.attachRowContextMenu(item, row, {
      visibleRows: allRows,
      groups: groupField && groupKey != null ? [{ field: groupField, key: groupKey }] : undefined,
    });
    if (allRows) {
      if (this.canManualReorder(config)) this.setupReorderDrag(item, config, row, allRows, groupField, groupKey);
      else this.setupGroupedRowDrag(item, row, groupField, groupKey);
    }
    const controls = item.createDiv({ cls: "db-list-row-controls" });
    if (!this.actions.isReadOnly) {
      const checkbox = controls.createEl("input", {
        cls: "db-list-row-checkbox",
        attr: { type: "checkbox", "aria-label": row.file.basename || row.file.path },
      });
      checkbox.checked = this.actions.isRowSelected(row);
      checkbox.onclick = (event) => {
        event.stopPropagation();
        this.actions.toggleRowSelected(row, !this.actions.isRowSelected(row), event);
      };
    }
    const openBtn = controls.createEl("button", {
      cls: "db-list-row-open",
      attr: { type: "button", "aria-label": t("menu.openNote") },
    });
    setIcon(openBtn, "maximize-2");
    setTooltip(openBtn, t("menu.openNote"), { delay: 100 });
    openBtn.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.actions.openRow(row);
    };
    // The move menu is the only reorder path that does not require dragging, so it
    // stays available on every pointer type rather than touch alone.
    if (!this.actions.isReadOnly && (this.canManualReorder(config) || Boolean(groupField && groups?.length))) {
      this.renderMobileMoveButton(controls, config, row, allRows || [], groupField, groupKey, groups);
    }

    const columns = this.actions.getColumns(config);
    const main = item.createDiv({ cls: "db-list-row-main" });
    const titleField = this.getTitleField(config);
    const titleCol = titleField ? config.schema.columns.find((col) => col.key === titleField) : undefined;
    const titleDisplay = titleField ? resolveTitleFieldDisplay(row, config, titleField) : undefined;
    if (titleDisplay && !titleDisplay.isHidden) {
      const titleLine = main.createDiv({ cls: "db-record-title-line" });
      this.actions.renderRecordIcon?.(titleLine, row, config);
      const title = titleLine.createDiv({
        cls: "db-list-row-title",
        attr: { title: titleDisplay.isFileTitle ? row.file.path : titleDisplay.isEmpty ? "" : titleDisplay.text },
      });
      markNoteHoverLink(title, row.file.path, row.file.path);
      if (titleDisplay.isFileTitle) {
        renderStackedFileTitle(title, getFileTitleDisplay(row, Array.from(this.rowByPath.values())), true);
      } else {
        title.textContent = titleDisplay.text;
        if (titleDisplay.isEmpty) title.addClass("is-empty-title");
      }
      if (titleCol) {
        if (titleCol.key === "file.name" && this.actions.editFileName) {
          if (!this.actions.isReadOnly) {
            title.addClass("db-editable-cell");
            setFieldTooltip(title, row.file.path, t("cell.doubleClickRename"));
            title.addEventListener("dblclick", (event) => {
              if (this.actions.isReadOnly) return;
              event.stopPropagation();
              this.actions.editFileName?.(title, row, row.file.basename);
            });
          }
        } else {
          title.onclick = (event) => {
            if (this.actions.isReadOnly) return;
            event.stopPropagation();
            this.actions.editCell(title, row, titleCol, event);
          };
        }
      }
    }

    const meta = main.createDiv({ cls: "db-list-row-meta" });
    const fields = columns.filter((col) => col.key !== titleField);
    for (const col of fields) {
      const value = this.getCellValue(row, col);
      const displayType = this.getDisplayType(config, col);
      const empty = this.isEmptyValue(value) && displayType !== "checkbox";
      if (empty && config.showEmptyFields !== true) continue;
      const displayValue = empty ? this.getEmptyDisplayValue(col, displayType) : value;
      meta.appendChild(this.renderRowFieldContent(row, col, config, displayValue, displayType, empty));
    }
  }

  private attachRowContextMenu(el: HTMLElement, row: RowData, context?: RowCreateContext): void {
    el.addEventListener("contextmenu", (event) => {
      if (isHTMLElement(event.target) && event.target.closest("input, select, textarea, button")) return;
      this.actions.showRowMenu?.(event, row, context);
    });
    attachLongPress(el, {
      ignoreTarget: (event) => isHTMLElement(event.target) && Boolean(event.target.closest("input, select, textarea, button, a")),
      onLongPress: (event) => this.actions.showRowMenu?.(event as unknown as MouseEvent, row, context),
    });
  }

  /** Phone layouts use a compact menu instead of HTML drag and drop. */
  private renderMobileMoveButton(
    item: HTMLElement,
    config: ViewConfig,
    row: RowData,
    rows: RowData[],
    groupField?: string,
    groupKey?: string,
    groups?: ListGroup[]
  ): void {
    const button = item.createEl("button", {
      cls: "db-list-mobile-move-btn",
      attr: { type: "button", title: t("mobile.moveCard"), "aria-label": t("mobile.moveCard") },
    });
    renderMobileMoveIcon(button);
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const menu = createOwnedMenuForEvent(event);
      if (this.canManualReorder(config)) this.addMobilePositionItems(menu, row, rows);
      if (groupField && groupKey != null && groups?.length) {
        if (this.canManualReorder(config)) menu.addSeparator();
        for (const group of groups) {
          if (group.key === groupKey) continue;
          const groupLabel = formatGroupKeyDisplay(config, groupField, group.key);
          menu.addRow({ icon: "folder-input", label: `${t("mobile.moveTo")} ${groupLabel}`, onClick: () => {
              const paths = group.rows.map((candidate) => candidate.file.path).filter((path) => path !== row.file.path);
              if (this.actions.moveRowToGroupAndPosition) {
                void this.actions.moveRowToGroupAndPosition(row, groupField, groupKey, group.key, paths[paths.length - 1], undefined);
              } else {
                void this.actions.moveRowsToGroup?.(row, groupField, groupKey, group.key);
              }
            } });
        }
      }
      menu.showAt({ x: event.clientX, y: event.clientY });
    };
  }

  /** Add local rank movement actions shared by grouped and ungrouped list rows. */
  private addMobilePositionItems(menu: OwnedMenuHandle, row: RowData, rows: RowData[]): void {
    const paths = rows.map((candidate) => candidate.file.path);
    const index = paths.indexOf(row.file.path);
    const move = (targetIndex: number) => {
      const remaining = paths.filter((path) => path !== row.file.path);
      const boundedIndex = Math.max(0, Math.min(targetIndex, remaining.length));
      this.actions.moveRowToPosition(row.file.path, remaining[boundedIndex - 1], remaining[boundedIndex]);
    };
    menu.addRow({ icon: "chevron-up", label: t("menu.moveUp"), disabled: index <= 0, onClick: () => move(index - 1) });
    menu.addRow({ icon: "chevron-down", label: t("menu.moveDown"), disabled: index < 0 || index >= paths.length - 1, onClick: () => move(index + 1) });
    menu.addRow({ icon: "chevrons-up", label: t("mobile.moveTop"), disabled: index <= 0, onClick: () => move(0) });
    menu.addRow({ icon: "chevrons-down", label: t("mobile.moveBottom"), disabled: index < 0 || index >= paths.length - 1, onClick: () => move(paths.length - 1) });
  }

  private setupGroupedRowDrag(item: HTMLElement, row: RowData, groupField?: string, groupKey?: string): void {
    if (!groupField || groupKey == null || this.actions.isReadOnly || !this.actions.moveRowsToGroup) return;
    if (isTouchDevice(this.container)) return;
    item.draggable = true;
    item.addEventListener("dragstart", (event) => {
      if (isHTMLElement(event.target) && event.target.closest("input, select, textarea, button")) {
        event.preventDefault();
        return;
      }
      const dragPaths = this.getDragPaths(row);
      event.dataTransfer?.setData(ROW_MIME, row.file.path);
      event.dataTransfer?.setData(ROW_BATCH_MIME, JSON.stringify(dragPaths));
      event.dataTransfer?.setData("text/plain", row.file.path);
      event.dataTransfer?.setData(ROW_FROM_GROUP_MIME, groupKey);
      this.draggingPaths = dragPaths;
      this.rowDropFeedback.begin(row.file.path, dragPaths);
      item.addClass("is-dragging");
    });
    item.addEventListener("dragend", () => {
      item.removeClass("is-dragging");
      this.draggingPaths = [];
    });
  }

  private setupReorderDrag(item: HTMLElement, config: ViewConfig, row: RowData, rows: RowData[], groupField?: string, groupKey?: string): void {
    if (this.actions.isReadOnly || isTouchDevice(this.container) || !this.canManualReorder(config)) return;
    item.draggable = true;
    item.addEventListener("dragstart", (event) => {
      if (isHTMLElement(event.target) && event.target.closest("input, select, textarea, button")) {
        event.preventDefault();
        return;
      }
      const dragPaths = this.getDragPaths(row);
      event.dataTransfer?.setData(ROW_MIME, row.file.path);
      event.dataTransfer?.setData(ROW_BATCH_MIME, JSON.stringify(dragPaths));
      event.dataTransfer?.setData("text/plain", row.file.path);
      if (groupKey != null) event.dataTransfer?.setData(ROW_FROM_GROUP_MIME, groupKey);
      this.draggingPath = row.file.path;
      this.draggingPaths = dragPaths;
      this.rowDropFeedback.begin(row.file.path, dragPaths);
      item.addClass("is-dragging");
    });
    item.addEventListener("dragend", () => {
      this.draggingPath = undefined;
      this.draggingPaths = [];
      item.removeClass("is-dragging");
      if (this.rowDropFeedback.getPhase() !== "pending") this.rowDropFeedback.clear();
    });
    item.addEventListener("dragover", (event) => {
      const dragPath = this.draggingPath;
      if (!dragPath || dragPath === row.file.path) return;
      if (!this.isRowDrag(event)) return;
      event.preventDefault();
      this.rowDropFeedback.update(item, resolveDropPlacement(item, event, "vertical"));
    });
    item.addEventListener("dragleave", () => {
      this.rowDropFeedback.clearTarget(item);
    });
    item.addEventListener("drop", (event) => {
      if (!this.isRowDrag(event)) return;
      const dragPaths = this.getDraggedPaths(event);
      const dragPath = this.draggingPath || dragPaths[0];
      if (!dragPath || dragPath === row.file.path) return;
      if (!this.rowByPath.has(dragPath)) return;
      event.preventDefault();
      event.stopPropagation();
      this.draggingPath = undefined;
      const placement = this.rowDropFeedback.getPlacement(item) || resolveDropPlacement(item, event, "vertical");
      this.rowDropFeedback.setPending();
      const isAfter = placement === "after";
      const moving = new Set(dragPaths);
      const currentPaths = rows.map((r) => r.file.path).filter((path) => !moving.has(path));
      const targetIndex = currentPaths.indexOf(row.file.path);
      const beforePath = isAfter ? row.file.path : (targetIndex > 0 ? currentPaths[targetIndex - 1] : undefined);
      const afterPath = isAfter ? (targetIndex < currentPaths.length - 1 ? currentPaths[targetIndex + 1] : undefined) : row.file.path;
      const fromGroupKey = event.dataTransfer?.getData(ROW_FROM_GROUP_MIME) || "";
      const draggedRow = this.rowByPath.get(dragPath);
      if (groupField && groupKey != null && fromGroupKey !== groupKey && draggedRow) {
        if (this.actions.moveRowToGroupAndPosition) {
          void Promise.resolve(this.actions.moveRowToGroupAndPosition(draggedRow, groupField, fromGroupKey, groupKey, beforePath, afterPath, dragPaths))
            .then(() => this.rowDropFeedback.commit())
            .catch((error) => this.rowDropFeedback.fail(error));
        } else {
          void Promise.resolve(this.actions.moveRowsToGroup?.(draggedRow, groupField, fromGroupKey, groupKey))
            .then(() => this.actions.moveRowToPosition(dragPath, beforePath, afterPath))
            .then(() => this.rowDropFeedback.commit())
            .catch((error) => this.rowDropFeedback.fail(error));
        }
      } else {
        if (dragPaths.length > 1 && this.actions.moveRowsToPosition) {
          void Promise.resolve(this.actions.moveRowsToPosition(dragPaths, beforePath, afterPath))
            .then(() => this.rowDropFeedback.commit())
            .catch((error) => this.rowDropFeedback.fail(error));
        } else {
          void Promise.resolve(this.actions.moveRowToPosition(dragPath, beforePath, afterPath))
            .then(() => this.rowDropFeedback.commit())
            .catch((error) => this.rowDropFeedback.fail(error));
        }
      }
    });
  }

  private setupGroupDropTarget(target: HTMLElement, groupField: string, groupKey: string): void {
    if (this.actions.isReadOnly || !this.actions.moveRowsToGroup) return;
    target.addEventListener("dragover", (event) => {
      if (!this.isRowDrag(event)) return;
      event.preventDefault();
      target.addClass("is-drop-target");
    });
    target.addEventListener("dragleave", () => target.removeClass("is-drop-target"));
    target.addEventListener("drop", (event) => {
      if (!this.isRowDrag(event)) return;
      const paths = this.getDraggedPaths(event);
      const path = paths[0];
      const row = path ? this.rowByPath.get(path) : undefined;
      if (!row) return;
      event.preventDefault();
      event.stopPropagation();
      target.removeClass("is-drop-target");
      const fromGroupKey = event.dataTransfer?.getData(ROW_FROM_GROUP_MIME) || "";
      void this.actions.moveRowsToGroup?.(row, groupField, fromGroupKey, groupKey);
    });
  }

  private isRowDrag(event: DragEvent): boolean {
    return Boolean(this.draggingPath) || Array.from(event.dataTransfer?.types || []).includes(ROW_MIME);
  }

  private getDragPaths(row: RowData): string[] {
    const selected = this.actions.getSelectedRows?.()
      ?.map((candidate) => candidate.file.path)
      .filter((path) => this.rowByPath.has(path)) || [];
    return selected.includes(row.file.path) ? selected : [row.file.path];
  }

  private getDraggedPaths(event: DragEvent): string[] {
    if (this.draggingPaths.length) return this.draggingPaths;
    const raw = event.dataTransfer?.getData(ROW_BATCH_MIME);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const paths = parsed.filter((path): path is string => typeof path === "string" && this.rowByPath.has(path));
          if (paths.length) return paths;
        }
      } catch {
        // Optional metadata is ignored when a different drag source supplies invalid data.
      }
    }
    const path = event.dataTransfer?.getData(ROW_MIME) || event.dataTransfer?.getData("text/plain");
    return path ? [path] : [];
  }

  private canManualReorder(config: ViewConfig): boolean {
    return !isExplicitlySorted(config);
  }

  private renderNewRow(list: HTMLElement, defaults?: Record<string, unknown>, rows: RowData[] = [], computedGroup = false): void {
    if (this.actions.isReadOnly || this.actions.hideCreateEntry) return;
    if (computedGroup) {
      list.createEl("button", { cls: "db-list-new-row is-disabled", text: t("group.computedCreateDisabled"), attr: { disabled: "true" } });
      return;
    }
    const button = list.createEl("button", { cls: "db-list-new-row", text: `+ ${t("toolbar.new")}` });
    button.onclick = () => this.createEntryNearEnd(defaults, rows);
  }

  private createEntryNearEnd(defaults: Record<string, unknown> | undefined, rows: RowData[]): void {
    this.actions.createEntry(defaults, this.getCreatePosition(rows));
  }

  private getCreatePosition(rows: RowData[]): CreateEntryPosition | undefined {
    const last = rows[rows.length - 1];
    return last ? { afterPath: last.file.path } : undefined;
  }

  private getCellValue(row: RowData, col: ColumnDef): unknown {
    if (col.key === "file.name") return getFileTitleDisplay(row, Array.from(this.rowByPath.values())).displayPath;
    if (isFileFieldKey(col.key)) return getRowFileFieldValue(row, col.key);
    if (col.type === "computed" || col.type === "rollup") {
      return row.computed[col.type === "computed" ? col.computedKey || col.key : col.key];
    }
    if (isObsidianTagsKey(col.key)) return toMultiSelectValuesForKey(col.key, row.frontmatter[col.key]);
    return row.frontmatter[col.key];
  }

  private getTitleField(config: ViewConfig): string | undefined {
    if (config.titleField === NO_TITLE_FIELD) return undefined;
    return config.titleField || "file.name";
  }

  renderRowFieldContent(
    row: RowData,
    col: ColumnDef,
    config: ViewConfig,
    resolvedValue?: unknown,
    resolvedDisplayType?: ColumnDef["type"],
    resolvedEmpty?: boolean,
  ): HTMLElement {
    const value = this.getCellValue(row, col);
    const displayType = resolvedDisplayType || this.getDisplayType(config, col);
    const empty = resolvedEmpty ?? (this.isEmptyValue(value) && displayType !== "checkbox");
    const displayValue = resolvedValue ?? (empty ? this.getEmptyDisplayValue(col, displayType) : value);
    return renderCardField({
      app: this.app, row, col, config, value: displayValue, displayType, empty,
      fieldClass: "db-list-field", valueClass: "db-list-field-value", labelClass: "db-list-field-label",
      badgesClass: "db-list-badges", linkClass: "db-list-link", fieldWidth: col.wrap ? undefined : getFieldWidth(config, col),
      wrap: col.wrap, readOnly: this.actions.isReadOnly, applyConditionalFormat: this.actions.applyConditionalFormat,
      onEdit: (target, editRow, editCol, event) => this.actions.editCell(target, editRow, editCol, event),
      onEditFormula: (editCol) => this.actions.editFormula?.(editCol),
      onOpenTarget: (targetRow, target, external) => this.openTarget(targetRow, target, external),
      onNumberChange: (targetRow, targetCol, next) => this.actions.saveCellValue?.(targetRow, targetCol, next),
      onShowColumnMenu: this.actions.showColumnMenu,
    });
  }

  private async openTarget(row: RowData, target: string, external: boolean): Promise<void> {
    if (external) {
      window.open(target);
      return;
    }
    await this.app.workspace.openLinkText(target, row.file.path);
  }

  private clear(container: HTMLElement): void {
    this.rowDropFeedback.clear();
    container.querySelectorAll(".db-list, .db-list-grouped, .db-list-total-header").forEach((el) => el.remove());
  }

  private getDisplayType(config: ViewConfig, col: ColumnDef): ColumnDef["type"] {
    if (isFileFieldKey(col.key)) return getFileFieldFixedType(col.key);
    return getColumnDisplayType(col, config.schema.computedFields);
  }

  private isEmptyValue(value: unknown): boolean {
    return value == null || value === "" || (Array.isArray(value) && value.length === 0);
  }

  private getEmptyDisplayValue(col: ColumnDef, displayType: ColumnDef["type"] = col.type): unknown {
    if (displayType === "multi-select") return [t("common.empty")];
    if (displayType === "checkbox") return false;
    return t("common.empty");
  }
}
