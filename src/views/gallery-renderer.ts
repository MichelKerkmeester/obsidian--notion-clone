// ───────────────────────────────────────────────────────────────────
// MODULE:    gallery-renderer
// COMPONENT: card-grid database view (grouped/ungrouped) with drag reorder,
//            drag-to-recategorize, and inline card editing
// ───────────────────────────────────────────────────────────────────
//
// Two drag codepaths coexist per card: setupReorderDrag (same-group manual
// ranking) is gated on canManualReorder because ranking is meaningless once a
// view is explicitly sorted, while setupGroupedCardDrag (drag to a different
// group) stays available regardless, since recategorizing a row is still a
// valid action on a sorted view. Drops resolve through DragDropFeedbackState
// so an async move (moveRowToPosition can return a promise) shows optimistic
// placement and reverts cleanly on failure.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, setIcon, setTooltip } from "obsidian";
import { isObsidianTagsKey, toMultiSelectValuesForKey } from "../data/column-types";
import { isExplicitlySorted } from "../data/manual-order";
import { getColumnDisplayType } from "../data/column-display";
import { getFileFieldFixedType, getRowFileFieldValue, isFileFieldKey } from "../data/file-fields";
import { isCoverImageBlocked, resolveCoverImage } from "../data/cover-image";
import { markCoverImageLoadError } from "../data/cover-wiring";
import { formatGroupKeyDisplay, isComputedGroupField } from "../data/group-display";
import { renderGroupLabel } from "./group-label-renderer";
import { markNoteHoverLink } from "./hover-link-preview";
import { ColumnDef, CreateEntryPosition, NO_TITLE_FIELD, RowCreateContext, RowData, ViewConfig } from "../data/types";
import { t } from "../i18n";
import { isHTMLElement } from "./dom-guards";
import { setFieldTooltip } from "./field-tooltip";
import { getFileTitleDisplay, renderStackedFileTitle } from "./file-title-display";
import { renderMobileMoveIcon } from "./mobile-move-icon";
import { clampCardFieldWidth, getFieldWidth } from "./column-width";
import { renderGroupExpandControls } from "./group-expand-controls";
import { getGroupVisibleCount } from "../data/group-visibility";
import { DragDropFeedbackState, resolveDropPlacement } from "./drag-drop-feedback";
import { resolveTitleFieldDisplay } from "../data/title-field-display";
import { EmptyStateOptions, EmptyStateRenderer } from "./empty-state-renderer";
import { renderCardField } from "./card-field-renderer";
import { createCheckbox } from "./checkbox";
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

export interface GalleryGroup {
  key: string;
  rows: RowData[];
  count: number;
}

export interface GalleryRendererActions {
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
  updateCardSize(width: number): void;
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
// 4. GALLERY RENDERER
// ───────────────────────────────────────────────────────────────────

export class GalleryRenderer {
  private resizeState?: { startX: number; startWidth: number };
  private container: HTMLElement | null = null;
  private rowByPath = new Map<string, RowData>();
  private draggingPath: string | undefined;
  private rowDropFeedback = new DragDropFeedbackState();
  private draggingPaths: string[] = [];
  private emptyStateRenderer = new EmptyStateRenderer();
  private rovingController = new CardRovingController();
  /**
   * Whether this surface takes touch input, answered once per render.
   *
   * Three separate decisions per card asked this — the resize handle, the grouped drag setup and
   * the reorder drag setup — and answering it reads the container's box, which forces the browser
   * to lay out every card appended so far. Inside a loop appending to that same container the
   * total becomes superlinear in card count. The answer cannot change part-way through a
   * synchronous render, so it is taken once, off the same container the per-card calls used.
   */
  private touchMode = false;

  constructor(private app: App, private actions: GalleryRendererActions) {}

  render(container: HTMLElement, config: ViewConfig, rows: RowData[], emptyState?: EmptyStateOptions): void {
    this.clear(container);
    this.container = container;
    this.touchMode = isTouchDevice(container);
    container.style.setProperty("--db-gallery-card-width", `${this.getCardSize(config)}px`);
    this.rowByPath = new Map(rows.map((row) => [row.file.path, row]));
    if (rows.length > 0) this.renderTotalHeader(container, rows);
    const gallery = this.createGallery(container, config);
    if (rows.length === 0) {
      this.emptyStateRenderer.renderCard(gallery, emptyState || { reason: "no-matching-data" });
    }
    for (const row of rows) this.renderCard(gallery, config, row, undefined, undefined, undefined, rows);
    this.renderNewCard(gallery, undefined, rows);
    syncCardRoving(container, this.rovingController, ".db-gallery-card");
  }

  renderGrouped(
    container: HTMLElement,
    config: ViewConfig,
    groups: GalleryGroup[],
    groupField: string,
    emptyState?: EmptyStateOptions,
  ): void {
    this.clear(container);
    this.container = container;
    this.touchMode = isTouchDevice(container);
    container.style.setProperty("--db-gallery-card-width", `${this.getCardSize(config)}px`);
    this.rowByPath = new Map(groups.flatMap((group) => group.rows.map((row) => [row.file.path, row] as const)));
    const grouped = container.createDiv({ cls: "db-gallery-grouped" });
    let actionsRendered = false;
    for (const group of groups) {
      const section = grouped.createDiv({ cls: "db-gallery-group" });
      const sectionId = `group-section-${encodeURIComponent(`${groupField}:${group.key}`)}`;
      section.setAttr("id", sectionId);
      const header = section.createDiv({ cls: "db-gallery-group-header" });
      this.setupGroupDropTarget(header, groupField, group.key);
      const collapsed = Boolean(this.actions.isGroupCollapsed?.(groupField, group.key));
      section.toggleClass("is-collapsed", collapsed);
      const toggle = header.createEl("button", {
        cls: `db-gallery-group-toggle${collapsed ? " is-collapsed" : ""}`,
        attr: { type: "button", "aria-label": collapsed ? t("group.expand") : t("group.collapse"), "aria-expanded": String(!collapsed), "aria-controls": sectionId },
      });
      toggle.createSpan({ cls: "db-collapse-triangle" });
      toggle.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.actions.toggleGroupCollapsed?.(groupField, group.key);
      };
      this.renderGroupCheckbox(header, group.rows, group.key || t("common.noGroup"));
      renderGroupLabel(header, config, groupField, group.key, "db-gallery-group-title");
      header.createSpan({ cls: "db-gallery-group-count", text: String(group.count) });
      this.actions.renderGroupSummaries?.(header, group.rows, config);
      if (!collapsed && !this.actions.isReadOnly && !this.actions.hideCreateEntry) {
        const newButton = header.createEl("button", {
          cls: "db-gallery-group-new",
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
      const gallery = this.createGallery(section, config);
      this.setupGroupDropTarget(gallery, groupField, group.key);
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
          gallery,
          groupEmptyOptions,
        );
        empty.addClass("db-gallery-empty-group");
      }
      for (const row of group.rows.slice(0, visibleCount)) this.renderCard(gallery, config, row, groupField, group.key, groups, group.rows);
      const footer = gallery.createDiv({ cls: "db-gallery-group-footer" });
      const computedGroup = isComputedGroupField(config, groupField);
      this.renderNewCard(footer, computedGroup ? undefined : { [groupField]: group.key || "" }, group.rows, computedGroup);
      renderGroupExpandControls(footer, config, groupField, group.key, group.rows.length, this.actions);
    }
    syncCardRoving(container, this.rovingController, ".db-gallery-card");
  }

  private renderTotalHeader(container: HTMLElement, rows: RowData[]): void {
    const header = container.createDiv({ cls: "db-gallery-total-header" });
    this.renderGroupCheckbox(header, rows, t("common.total"));
    header.createSpan({ cls: "db-gallery-group-title", text: t("common.total") });
    header.createSpan({ cls: "db-gallery-group-count", text: String(rows.length) });
  }

  private renderGroupCheckbox(parent: HTMLElement, rows: RowData[], label?: string): void {
    if (this.actions.isReadOnly) return;
    const checkbox = createCheckbox(parent, {
      role: "row",
      cls: "db-gallery-group-checkbox",
      attr: { "aria-label": label || t("common.total") },
    });
    checkbox.checked = this.actions.areAllRowsSelected(rows);
    checkbox.indeterminate = rows.some((row) => this.actions.isRowSelected(row)) && !checkbox.checked;
    checkbox.onclick = (event) => event.stopPropagation();
    checkbox.onchange = () => this.actions.toggleRowsSelected(rows, checkbox.checked);
  }

  private createGallery(container: HTMLElement, config: ViewConfig): HTMLElement {
    const gallery = container.createDiv({ cls: "db-gallery", attr: { role: "grid" } });
    // --db-gallery-card-width 由 container 级设置，所有分组 gallery inherit，
    // 拖动调整时联动更新（对齐 Board 的容器级 --db-board-column-width）。
    gallery.style.setProperty("--db-gallery-cover-ratio", String(this.getCoverRatio(config)));
    return gallery;
  }

  private renderCard(gallery: HTMLElement, config: ViewConfig, row: RowData, groupField?: string, groupKey?: string, groups?: GalleryGroup[], allRows?: RowData[]): void {
    const card = gallery.createDiv({
      cls: "db-gallery-card",
      attr: {
        "data-note-database-row-path": row.file.path,
        title: row.file.path,
        role: "row",
        "aria-keyshortcuts": "Enter Space F2",
      },
    });
    wireCardKeyboard({
      card,
      rovingController: this.rovingController,
      onActivate: this.actions.openRecordDetail ? () => this.actions.openRecordDetail?.(card, row) : undefined,
      ignoreSelector: "a, button, input, select, textarea, .db-cell-editing, .db-gallery-cover-button",
    });
    if (this.actions.openRecordDetail) {
      card.addEventListener("click", (event) => {
        if (isHTMLElement(event.target) && event.target.closest("a, button, input, select, textarea, .db-cell-editing, .db-gallery-cover-button")) return;
        this.actions.openRecordDetail?.(card, row);
      });
    }
    this.actions.applyConditionalFormat?.(card, row, config);
    this.attachRowContextMenu(card, row, {
      visibleRows: allRows,
      groups: groupField && groupKey != null ? [{ field: groupField, key: groupKey }] : undefined,
    });
    if (allRows) {
      if (this.canManualReorder(config)) this.setupReorderDrag(card, config, row, allRows, groupField, groupKey);
      else this.setupGroupedCardDrag(card, row, groupField, groupKey);
    }
    if (!this.touchMode) {
      const resizeHandle = card.createDiv({ cls: "db-gallery-card-resize-handle" });
      resizeHandle.addEventListener("mousedown", (event) => this.startCardResize(event, config));
      resizeHandle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
    }
    if (config.galleryImageField) this.renderCover(card, config, row);

    const body = card.createDiv({ cls: "db-gallery-card-body" });
    const controls = body.createDiv({ cls: "db-gallery-card-controls" });
    if (!this.actions.isReadOnly) {
      const checkbox = createCheckbox(controls, {
        role: "row",
        cls: "db-gallery-card-checkbox",
        attr: { "aria-label": row.file.basename || row.file.path },
      });
      checkbox.checked = this.actions.isRowSelected(row);
      checkbox.onclick = (event) => {
        event.stopPropagation();
        this.actions.toggleRowSelected(row, !this.actions.isRowSelected(row), event);
      };
    }
    const openBtn = controls.createEl("button", {
      cls: "db-gallery-card-open",
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
    const titleField = this.getTitleField(config);
    const title = titleField ? resolveTitleFieldDisplay(row, config, titleField) : undefined;
    if (title && !title.isHidden) {
      const titleLine = body.createDiv({ cls: "db-record-title-line" });
      this.actions.renderRecordIcon?.(titleLine, row, config);
      const titleEl = titleLine.createDiv({
        cls: "db-gallery-card-title",
        attr: { title: title.isFileTitle ? row.file.path : title.isEmpty ? "" : title.text },
      });
      markNoteHoverLink(titleEl, row.file.path, row.file.path);
      if (title.isFileTitle) {
        renderStackedFileTitle(titleEl, getFileTitleDisplay(row, Array.from(this.rowByPath.values())), true);
        if (!this.actions.isReadOnly && this.actions.editFileName) {
          titleEl.addClass("db-editable-cell");
          setFieldTooltip(titleEl, row.file.path, t("cell.doubleClickRename"));
          titleEl.addEventListener("dblclick", (event) => {
            event.stopPropagation();
            this.actions.editFileName?.(titleEl, row, row.file.basename);
          });
        }
      } else {
        titleEl.textContent = title.text;
        if (title.isEmpty) titleEl.addClass("is-empty-title");
      }
    }
    const meta = body.createDiv({ cls: "db-gallery-meta" });
    const fields = columns.filter((col) => col.key !== titleField);
    for (const col of fields) {
      const value = this.getCellValue(row, col);
      const displayType = this.getDisplayType(config, col);
      const empty = this.isEmptyValue(value) && displayType !== "checkbox";
      if (empty && !this.shouldShowEmptyField(config, col)) continue;
      const displayValue = empty ? this.getEmptyDisplayValue(col, displayType) : value;
      meta.appendChild(this.renderCardFieldContent(row, col, config, displayValue, displayType, empty));
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
    card: HTMLElement,
    config: ViewConfig,
    row: RowData,
    rows: RowData[],
    groupField?: string,
    groupKey?: string,
    groups?: GalleryGroup[]
  ): void {
    const button = card.createEl("button", {
      cls: "db-card-mobile-move-btn",
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

  /** Add local rank movement actions shared by grouped and ungrouped cards. */
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

  private setupGroupedCardDrag(card: HTMLElement, row: RowData, groupField?: string, groupKey?: string): void {
    if (!groupField || groupKey == null || this.actions.isReadOnly || !this.actions.moveRowsToGroup) return;
    if (this.touchMode) return;
    card.draggable = true;
    card.addEventListener("dragstart", (event) => {
      if (isHTMLElement(event.target) && event.target.closest("input, select, textarea, button, .db-gallery-card-resize-handle")) {
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
      card.addClass("is-dragging");
      this.showDragCountBadge(card, dragPaths.length);
    });
    card.addEventListener("dragend", () => {
      card.removeClass("is-dragging");
      card.querySelector<HTMLElement>(".db-drag-count-badge")?.remove();
      this.draggingPaths = [];
    });
  }

  private setupReorderDrag(card: HTMLElement, config: ViewConfig, row: RowData, rows: RowData[], groupField?: string, groupKey?: string): void {
    if (this.actions.isReadOnly || this.touchMode || !this.canManualReorder(config)) return;
    card.draggable = true;
    card.addEventListener("dragstart", (event) => {
      if (isHTMLElement(event.target) && event.target.closest("input, select, textarea, button, .db-gallery-card-resize-handle")) {
        event.preventDefault();
        return;
      }
      event.dataTransfer?.setData(ROW_MIME, row.file.path);
      event.dataTransfer?.setData("text/plain", row.file.path);
      if (groupKey != null) event.dataTransfer?.setData(ROW_FROM_GROUP_MIME, groupKey);
      this.draggingPath = row.file.path;
      const dragPaths = this.getDragPaths(row);
      this.draggingPaths = dragPaths;
      this.rowDropFeedback.begin(row.file.path, dragPaths);
      event.dataTransfer?.setData(ROW_BATCH_MIME, JSON.stringify(dragPaths));
      card.addClass("is-dragging");
      this.showDragCountBadge(card, dragPaths.length);
    });
    card.addEventListener("dragend", () => {
      this.draggingPath = undefined;
      this.draggingPaths = [];
      card.removeClass("is-dragging");
      card.querySelector<HTMLElement>(".db-drag-count-badge")?.remove();
      if (this.rowDropFeedback.getPhase() !== "pending") this.rowDropFeedback.clear();
    });
    card.addEventListener("dragover", (event) => {
      const dragPath = this.draggingPath;
      if (!dragPath || dragPath === row.file.path) return;
      if (!this.isRowDrag(event)) return;
      event.preventDefault();
      this.rowDropFeedback.update(card, resolveDropPlacement(card, event, "horizontal"));
    });
    card.addEventListener("dragleave", () => {
      this.rowDropFeedback.clearTarget(card);
    });
    card.addEventListener("drop", (event) => {
      if (!this.isRowDrag(event)) return;
      const dragPaths = this.getDraggedPaths(event);
      const dragPath = this.draggingPath || dragPaths[0];
      if (!dragPath || dragPath === row.file.path) return;
      if (!this.rowByPath.has(dragPath)) return;
      event.preventDefault();
      event.stopPropagation();
      this.draggingPath = undefined;
      const placement = this.rowDropFeedback.getPlacement(card) || resolveDropPlacement(card, event, "horizontal");
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
      this.rowDropFeedback.begin(path, paths, groupKey);
      this.rowDropFeedback.setPending();
      void Promise.resolve(this.actions.moveRowToGroupAndPosition
        ? this.actions.moveRowToGroupAndPosition(row, groupField, fromGroupKey, groupKey, undefined, undefined, paths)
        : this.actions.moveRowsToGroup?.(row, groupField, fromGroupKey, groupKey))
        .then(() => this.rowDropFeedback.commit())
        .catch((error) => this.rowDropFeedback.fail(error));
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

  private showDragCountBadge(card: HTMLElement, count: number): void {
    card.querySelector<HTMLElement>(".db-drag-count-badge")?.remove();
    if (count < 2) return;
    card.createSpan({ cls: "db-drag-count-badge", text: t("drag.movingItems", { count }) });
  }

  private canManualReorder(config: ViewConfig): boolean {
    return !isExplicitlySorted(config);
  }

  private renderCover(card: HTMLElement, config: ViewConfig, row: RowData): void {
    const cover = card.createDiv({ cls: "db-gallery-cover" });
    cover.style.setProperty("--db-gallery-image-fit", config.galleryImageFit || "cover");
    const image = resolveCoverImage(config.galleryImageField, row, this.app);
    const coverColumn = config.schema.columns.find((col) => col.key === config.galleryImageField);
    if (!image || isCoverImageBlocked(image, coverColumn?.type)) {
      cover.addClass("is-empty");
      setIcon(cover.createSpan({ cls: "db-gallery-cover-placeholder" }), "image");
      return;
    }
    const coverLink = cover.createEl("div", {
      cls: "db-gallery-cover-button",
      attr: { role: "button", tabindex: "0", "aria-label": image.label },
    });
    setTooltip(coverLink, image.label, { delay: 100 });
    const openCover = (): void => {
      void this.openTarget(row, image.target, image.external);
    };
    coverLink.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      openCover();
    };
    coverLink.onkeydown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        openCover();
      }
    };
    const imageEl = coverLink.createEl("img", { attr: { src: image.src, alt: image.alt, draggable: "false" } });
    imageEl.onerror = () => markCoverImageLoadError(cover, coverLink, "db-gallery-cover-placeholder");
  }

  private renderNewCard(gallery: HTMLElement, defaults?: Record<string, unknown>, rows: RowData[] = [], computedGroup = false): void {
    if (this.actions.isReadOnly || this.actions.hideCreateEntry) return;
    if (computedGroup) {
      gallery.createEl("button", { cls: "db-gallery-new-card is-disabled", text: t("group.computedCreateDisabled"), attr: { disabled: "true" } });
      return;
    }
    const button = gallery.createEl("button", { cls: "db-gallery-new-card", text: `+ ${t("toolbar.new")}` });
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

  renderCardFieldContent(
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
      fieldClass: "db-gallery-field", valueClass: "db-gallery-field-value", labelClass: "db-gallery-field-label",
      badgesClass: "db-gallery-badges", linkClass: "db-gallery-link", fieldWidth: this.getCardFieldWidth(config, col),
      wrap: col.wrap, readOnly: this.actions.isReadOnly, applyConditionalFormat: this.actions.applyConditionalFormat,
      onEdit: (target, editRow, editCol, event) => this.actions.editCell(target, editRow, editCol, event),
      onEditFormula: (editCol) => this.actions.editFormula?.(editCol),
      onOpenTarget: (targetRow, target, external) => this.openTarget(targetRow, target, external),
      onNumberChange: (targetRow, targetCol, next) => this.actions.saveCellValue?.(targetRow, targetCol, next),
      onShowColumnMenu: this.actions.showColumnMenu,
    });
  }

  private isEmptyValue(value: unknown): boolean {
    return value == null || value === "" || (Array.isArray(value) && value.length === 0);
  }

  private shouldShowEmptyField(config: ViewConfig, col: ColumnDef): boolean {
    return config.showEmptyFields === true;
  }

  private getEmptyDisplayValue(col: ColumnDef, displayType: ColumnDef["type"] = col.type): unknown {
    if (displayType === "multi-select") return [t("common.empty")];
    if (displayType === "checkbox") return false;
    return t("common.empty");
  }

  private async openTarget(row: RowData, target: string, external: boolean): Promise<void> {
    if (external) {
      window.open(target);
      return;
    }
    await this.app.workspace.openLinkText(target, row.file.path);
  }

  private getCardSize(config: ViewConfig): number {
    const presetSize = config.galleryCardSizePreset === "small" ? 180 : config.galleryCardSizePreset === "large" ? 360 : config.galleryCardSizePreset === "medium" ? 260 : undefined;
    return Math.max(160, Math.min(420, Math.round(presetSize || config.galleryCardSize || 250)));
  }

  private startCardResize(event: MouseEvent, config: ViewConfig): void {
    event.preventDefault();
    event.stopPropagation();
    this.resizeState = {
      startX: event.clientX,
      startWidth: this.getCardSize(config),
    };
    window.activeDocument.addEventListener("mousemove", this.handleCardResize);
    window.activeDocument.addEventListener("mouseup", this.finishCardResize);
  }

  private readonly handleCardResize = (event: MouseEvent): void => {
    if (!this.resizeState) return;
    event.preventDefault();
    event.stopPropagation();
    const width = this.clampCardSize(this.resizeState.startWidth + event.clientX - this.resizeState.startX);
    // 设 container 级变量，所有分组 gallery 联动更新（而非仅当前 gallery）。
    this.container?.style.setProperty("--db-gallery-card-width", `${width}px`);
  };

  private readonly finishCardResize = (event: MouseEvent): void => {
    if (!this.resizeState) return;
    event.preventDefault();
    event.stopPropagation();
    const width = this.clampCardSize(this.resizeState.startWidth + event.clientX - this.resizeState.startX);
    window.activeDocument.removeEventListener("mousemove", this.handleCardResize);
    window.activeDocument.removeEventListener("mouseup", this.finishCardResize);
    this.resizeState = undefined;
    this.actions.updateCardSize(width);
  };

  private clampCardSize(width: number): number {
    return Math.max(160, Math.min(420, Math.round(width)));
  }

  private getCoverRatio(config: ViewConfig): number {
    const presetRatio = config.galleryImageAspectRatioPreset === "square" ? 1
      : config.galleryImageAspectRatioPreset === "banner" ? 1.777
        : config.galleryImageAspectRatioPreset === "portrait" ? 0.75
          : config.galleryImageAspectRatioPreset === "landscape" ? 1.333 : undefined;
    return Math.max(0.35, Math.min(2.5, presetRatio || config.galleryImageAspectRatio || 0.75));
  }

  private getCardFieldWidth(config: ViewConfig, col: ColumnDef): number {
    return clampCardFieldWidth(getFieldWidth(config, col), this.getCardSize(config));
  }

  private getDisplayType(config: ViewConfig, col: ColumnDef): ColumnDef["type"] {
    if (isFileFieldKey(col.key)) return getFileFieldFixedType(col.key);
    return getColumnDisplayType(col, config.schema.computedFields);
  }

  private clear(container: HTMLElement): void {
    this.rowDropFeedback.clear();
    container.querySelectorAll(".db-gallery, .db-gallery-grouped, .db-gallery-total-header").forEach((el) => el.remove());
  }
}
