// ───────────────────────────────────────────────────────────────────
// MODULE:    board-renderer
// COMPONENT: Kanban board view — columns, swimlanes, drag/drop reordering
// ───────────────────────────────────────────────────────────────────
//
// Drag-and-drop here has two independent fallback layers: per-card handlers
// for precise before/after placement, and container-level hit-testing
// (collectBoardDropTargets / resolveBoardColumnByPoint) so dropping on the
// blank space below a column, or on a column with no cards, still resolves
// to the right group. Every drag path also re-renders mid-gesture-safe:
// dragend can fail to fire if a drop triggers a re-render that replaces
// the dragged DOM out from under the browser, so cleanup (drag preview,
// dragover listener, drop-target highlight) is idempotent and re-run
// defensively at the top of `render`.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, setIcon, setTooltip } from "obsidian";
import { isObsidianTagsKey, toMultiSelectValuesForKey } from "../data/column-types";
import { OPTION_REGISTRATION_COLORS } from "../data/option-registration";
import { isExplicitlySorted } from "../data/manual-order";
import { getColumnDisplayType } from "../data/column-display";
import { getFileFieldFixedType, getRowFileFieldValue, isFileFieldKey } from "../data/file-fields";
import { isCoverImageBlocked, resolveCoverImage } from "../data/cover-image";
import { markCoverImageLoadError } from "../data/cover-wiring";
import { formatGroupKeyDisplay, isComputedGroupField } from "../data/group-display";
import { renderGroupLabel } from "./group-label-renderer";
import { markNoteHoverLink } from "./hover-link-preview";
import { ColumnDef, CreateEntryPosition, NO_TITLE_FIELD, RowCreateContext, RowData, StatusColor, ViewConfig } from "../data/types";
import { t } from "../i18n";
import { isHTMLElement } from "./dom-guards";
import { setFieldTooltip } from "./field-tooltip";
import { EMPTY_ROWS, buildDuplicateNameIndex, getFileTitleDisplay, renderStackedFileTitle } from "./file-title-display";
import { renderMobileMoveIcon } from "./mobile-move-icon";
import { clampCardFieldWidth, getFieldWidth } from "./column-width";
import { renderGroupExpandControls } from "./group-expand-controls";
import { getGroupVisibleCount } from "../data/group-visibility";
import { isSameBoardGroup, resolveBoardCardDropIntent, resolveBoardColumnByPoint, resolveBoardContainerDropOrder, type BoardDropCandidate } from "../data/board-container-drop";
import { resolveTitleFieldDisplay } from "../data/title-field-display";
import { isImeComposing } from "../data/keyboard-utils";
import { openOptionColorPicker } from "./option-color-picker";
import { EmptyStateOptions, EmptyStateRenderer } from "./empty-state-renderer";
import { renderCardField } from "./card-field-renderer";
import { createCheckbox } from "./checkbox";
import { EdgeAutoScroller } from "./edge-auto-scroller";
import { DragDropFeedbackState, resolveDropPlacement } from "./drag-drop-feedback";
import { attachLongPress, isTouchDevice } from "../data/touch-environment";
import { CardRovingController, syncCardRoving, wireCardKeyboard } from "./card-roving-tabindex";
import { createOwnedMenuForEvent } from "./owned-menu";
import { openExternalUrl } from "./open-external";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const CARD_MIME = "application/x-note-database-card";
const CARD_FROM_GROUP_MIME = "application/x-note-database-card-from-group";
const CARD_FROM_SUBGROUP_MIME = "application/x-note-database-card-from-subgroup";
const GROUP_MIME = "application/x-note-database-group";
const ROW_BATCH_MIME = "application/x-note-database-row-batch";

// ───────────────────────────────────────────────────────────────────
// 3. TYPES
// ───────────────────────────────────────────────────────────────────

export interface BoardGroup {
  key: string;
  rows: RowData[];
  count: number;
  subgroups?: BoardSubgroup[];
}

export interface BoardSubgroup {
  key: string;
  rows: RowData[];
  count: number;
}

export interface BoardRendererActions {
  openRow(row: RowData): void;
  openRecordDetail?(anchorEl: HTMLElement, row: RowData): void;
  createEntry(defaults?: Record<string, unknown>, position?: CreateEntryPosition): void;
  createGroup?(field: string, name: string, color: StatusColor): Promise<boolean>;
  updateGroup(row: RowData, field: string, value: string, fromValue?: string): Promise<void>;
  updateGroupOrder(field: string, order: string[]): void;
  hideGroup?(field: string, key: string): void;
  deleteGroup?(field: string, key: string): void;
  updateCardOrder(field: string, groupKey: string, paths: string[]): void;
  moveRowToPosition(movedPath: string, beforePath?: string, afterPath?: string): void;
  moveRowWithGroupUpdatesAndPosition?(
    row: RowData,
    updates: Array<{ field: string; fromGroupKey: string; toGroupKey: string }>,
    beforePath?: string,
    afterPath?: string,
    movedPaths?: string[],
  ): void | Promise<void>;
  moveRowsToPosition?(movedPaths: string[], beforePath?: string, afterPath?: string): void;
  getSelectedRows?(): RowData[];
  updateColumnWidth(width: number): void;
  isRowSelected(row: RowData): boolean;
  toggleRowSelected(row: RowData, selected: boolean, event?: MouseEvent): void;
  areAllRowsSelected(rows: RowData[]): boolean;
  toggleRowsSelected(rows: RowData[], selected: boolean): void;
  editCell(target: HTMLElement, row: RowData, col: ColumnDef, event?: MouseEvent): void;
  saveCellValue?(row: RowData, col: ColumnDef, value: number): void | Promise<void | boolean>;
  editFileName?(target: HTMLElement, row: RowData, currentName: string): void;
  getColumns(config: ViewConfig): ColumnDef[];
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
  readonly canReorderGroups?: boolean;
}

interface ParsedLink {
  label: string;
  target: string;
  external: boolean;
}

// ───────────────────────────────────────────────────────────────────
// 4. RENDERER
// ───────────────────────────────────────────────────────────────────

export class BoardRenderer {
  private rowByPath = new Map<string, RowData>();
  /** Basenames shared by more than one row, rebuilt whenever the row set is. */
  private duplicateNames: ReadonlySet<string> = new Set<string>();
  private dragEnterCount = new WeakMap<HTMLElement, number>();
  // .db-board 兜底拖拽落点: the highlighted zone is owned by the current gesture.
  private currentBoardDropZone: HTMLElement | null = null;
  private resizeState?: { startX: number; startWidth: number; board: HTMLElement };
  private draggingCardPath?: string;
  private draggingCardPaths: string[] = [];
  private cardAutoScroller?: EdgeAutoScroller;
  private rowDropFeedback = new DragDropFeedbackState();
  // 当前渲染的看板与分组元数据，供拖拽期间实时列命中（方案 A/B）复用。
  private boardEl: HTMLElement | null = null;
  private boardGroups: BoardGroup[] = [];
  private boardGroupField = "";
  private boardSubgroupField?: string;
  // 方案 B：鼠标附近浮动列名 preview（单例，dragstart 建 / dragend 删）。
  private boardDragPreview: HTMLElement | null = null;
  private boardDragCount = 1;
  private boardDragLabelByKey = new Map<string, string>();
  private boundBoardDragOver?: (event: DragEvent) => void;
  private emptyStateRenderer = new EmptyStateRenderer();
  private rovingController = new CardRovingController();
  /**
   * Whether this surface takes touch input, answered once per render.
   *
   * Every column and every card asks, and the answer cannot change part-way through a synchronous
   * render: the platform flags are constant, the pointer type is constant, and the pane cannot be
   * resized while the loop that fills it is still running. Asking per card made it a forced layout
   * inside a loop appending to the same container, so the browser reflowed the tree built so far
   * once per card and the total became superlinear in card count.
   *
   * It is measured on the container, not on `.db-board`. That element is `width: max-content`, so
   * it grows as each column is appended and a width read from it is a different number on the
   * first card than on the last — there is no single value to hoist. The container is the pane,
   * which is the width the touch threshold was written about.
   */
  private touchMode = false;

  constructor(private app: App, private actions: BoardRendererActions) {}

  render(container: HTMLElement, config: ViewConfig, groups: BoardGroup[], groupField: string, emptyState?: EmptyStateOptions): void {
    this.clear(container);
    this.touchMode = isTouchDevice(container);
    // 幂等清理：拖拽中途若触发 re-render 导致 board DOM 被替换，dragend 可能不再触发，
    // 这里兜底移除残留的浮动列名 preview 与 dragover 监听，避免孤儿元素与监听器泄漏。
    this.endBoardDragPreview();
    this.rowByPath = new Map(groups.flatMap((group) => group.rows.map((row) => [row.file.path, row] as const)));
    this.duplicateNames = buildDuplicateNameIndex([...this.rowByPath.values()]);
    const hiddenGroups = new Set(config.boardHiddenGroups?.[groupField] || []);
    groups = groups.filter((group) => !hiddenGroups.has(group.key));
    const board = container.createDiv({ cls: "db-board", attr: { role: "grid" } });
    // 缓存当前看板与分组元数据，供拖拽期间实时列命中（方案 A/B）复用。
    this.boardEl = board;
    this.boardGroups = groups;
    this.boardGroupField = groupField;
    this.boardSubgroupField = config.boardSubgroupEnabled !== false && config.boardSubgroupField && config.boardSubgroupField !== groupField
      ? config.boardSubgroupField
      : undefined;
    board.style.setProperty("--db-board-column-width", `${this.getBoardColumnWidth(config)}px`);
    this.attachBoardContainerDropHandlers(board, groupField);
    const emptyStateTracker = { actionsRendered: false };
    if (this.boardSubgroupField && groups.some((group) => (group.subgroups?.length || 0) > 0)) {
      this.renderSwimlaneBoard(board, config, groups, groupField, this.boardSubgroupField, emptyState, emptyStateTracker);
    } else {
      for (const group of groups) this.renderColumn(board, config, groups, group, groupField, emptyState, emptyStateTracker);
      this.renderBoardPagination(board);
    }
    if (groups.length === 0) {
      const empty = this.emptyStateRenderer.renderCard(board, emptyState || { reason: "no-matching-data" });
      empty.addClass("db-board-empty-slot");
    }
    if (
      !this.actions.isReadOnly
      && !this.actions.hideCreateEntry
      && this.actions.createGroup
      && this.canCreateGroup(config, groupField)
    ) {
      this.renderAddGroupControl(board, config, groupField);
    }
    const cardEls = Array.from(board.querySelectorAll<HTMLElement>(".db-board-card"));
    let columnIndices: number[][] | undefined;
    const swimlaneEl = board.querySelector<HTMLElement>(":scope > .db-board-swimlane-board");
    if (swimlaneEl) {
      const lanes = Array.from(swimlaneEl.querySelectorAll<HTMLElement>(":scope > .db-board-swimlane"));
      const groupCount = Math.max(1, groups.length);
      const columnCardLists: HTMLElement[][] = Array.from({ length: groupCount }, () => []);
      for (const lane of lanes) {
        const cells = Array.from(lane.querySelectorAll<HTMLElement>(":scope > .db-board-swimlane-columns > .db-board-swimlane-column"));
        cells.forEach((cell, gIdx) => {
          const cards = Array.from(cell.querySelectorAll<HTMLElement>(".db-board-card"));
          if (columnCardLists[gIdx]) {
            columnCardLists[gIdx].push(...cards);
          }
        });
      }
      const derived = columnCardLists
        .map((colCards) => colCards.map((c) => cardEls.indexOf(c)).filter((i) => i >= 0))
        .filter((col) => col.length > 0);
      if (derived.length > 0) columnIndices = derived;
    } else {
      const columnEls = Array.from(board.querySelectorAll<HTMLElement>(":scope > .db-board-column"));
      const derived = columnEls
        .map((colEl) => {
          const colCards = Array.from(colEl.querySelectorAll<HTMLElement>(".db-board-card"));
          return colCards.map((c) => cardEls.indexOf(c)).filter((i) => i >= 0);
        })
        .filter((col) => col.length > 0);
      if (derived.length > 0) columnIndices = derived;
    }
    syncCardRoving(board, this.rovingController, ".db-board-card", columnIndices);
  }

  private canCreateGroup(config: ViewConfig, groupField: string): boolean {
    const column = config.schema.columns.find((candidate) => candidate.key === groupField);
    if (!column || column.type === "computed" || column.type === "rollup" || isObsidianTagsKey(column.key)) return false;
    const displayType = getColumnDisplayType(column, config.schema.computedFields);
    return displayType === "status" || displayType === "select" || displayType === "multi-select";
  }

  // `parent` is the header's name row, not the header itself: mounting the button beside the
  // group name keeps it inline with the text instead of parked at the far header edge.
  private renderBoardGroupOptions(parent: HTMLElement, config: ViewConfig, field: string, group: BoardGroup): void {
    const button = parent.createEl("button", {
      cls: "db-board-column-options",
      attr: { type: "button", "aria-label": t("board.columnOptions"), title: t("board.columnOptions") },
    });
    setIcon(button, "more-vertical");
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const menu = createOwnedMenuForEvent(event);
      menu.addRow({ icon: "arrow-up-a-z", label: t("board.sortAscending"), onClick: () => {
        this.actions.updateCardOrder(field, group.key, group.rows.map((row) => row.file.path).slice().sort());
      } });
      menu.addRow({ icon: "arrow-down-a-z", label: t("board.sortDescending"), onClick: () => {
        this.actions.updateCardOrder(field, group.key, group.rows.map((row) => row.file.path).slice().sort().reverse());
      } });
      menu.addSeparator();
      menu.addRow({ icon: "fold-vertical", label: t("board.collapseGroup"), onClick: () => this.actions.toggleGroupCollapsed?.(field, group.key) });
      if (this.actions.hideGroup) menu.addRow({ icon: "eye-off", label: t("board.hideColumn"), onClick: () => this.actions.hideGroup?.(field, group.key) });
      if (this.actions.deleteGroup) menu.addRow({ icon: "trash-2", label: t("board.deleteGroup"), onClick: () => this.actions.deleteGroup?.(field, group.key) });
      menu.showAt({ x: event.clientX, y: event.clientY });
    };
  }

  private renderSwimlaneBoard(
    board: HTMLElement,
    config: ViewConfig,
    groups: BoardGroup[],
    groupField: string,
    subgroupField: string,
    emptyState?: EmptyStateOptions,
    emptyStateTracker?: { actionsRendered: boolean },
  ): void {
    const shell = board.createDiv({ cls: "db-board-swimlane-board" });
    shell.style.setProperty("--db-board-swimlane-column-count", String(Math.max(1, groups.length)));
    const headers = shell.createDiv({ cls: "db-board-swimlane-column-headers" });
    headers.createDiv({ cls: "db-board-swimlane-label-spacer" });
    for (const group of groups) {
      const header = headers.createDiv({ cls: "db-board-column-header db-board-swimlane-primary-header" });
      const collapsed = Boolean(this.actions.isGroupCollapsed?.(groupField, group.key));
      const groupId = this.getGroupSectionId(groupField, group.key);
      header.setAttr("id", groupId);
      const toggle = header.createEl("button", { cls: `db-board-group-toggle${collapsed ? " is-collapsed" : ""}`, attr: { type: "button", "aria-label": collapsed ? t("group.expand") : t("group.collapse"), "aria-expanded": String(!collapsed), "aria-controls": groupId } });
      toggle.createSpan({ cls: "db-collapse-triangle" });
      toggle.onclick = (event) => { event.preventDefault(); event.stopPropagation(); this.actions.toggleGroupCollapsed?.(groupField, group.key); };
      if (!this.actions.isReadOnly) {
        const checkbox = createCheckbox(header, {
          role: "row",
          cls: "db-board-column-checkbox",
          attr: { "aria-label": group.key || t("common.noGroup") },
        });
        checkbox.checked = this.actions.areAllRowsSelected(group.rows);
        checkbox.indeterminate = group.rows.some((row) => this.actions.isRowSelected(row)) && !checkbox.checked;
        checkbox.onclick = (event) => event.stopPropagation();
        checkbox.onchange = () => this.actions.toggleRowsSelected(group.rows, checkbox.checked);
      }
      const title = header.createDiv({ cls: "db-board-header-text" });
      renderGroupLabel(title, config, groupField, group.key, "db-board-column-title");
      title.createSpan({ cls: "db-board-count", text: String(group.count) });
      this.renderBoardGroupOptions(title, config, groupField, group);
    }

    const laneKeys: string[] = [];
    const seen = new Set<string>();
    for (const group of groups) for (const subgroup of group.subgroups || []) {
      if (seen.has(subgroup.key)) continue;
      seen.add(subgroup.key);
      laneKeys.push(subgroup.key);
    }
    for (const laneKey of laneKeys) {
      const lane = shell.createDiv({ cls: "db-board-swimlane" });
      const laneHeader = lane.createDiv({ cls: "db-board-swimlane-header" });
      renderGroupLabel(laneHeader, config, subgroupField, laneKey, "db-board-subgroup-title");
      const laneCount = groups.reduce((sum, group) => sum + (group.subgroups?.find((subgroup) => subgroup.key === laneKey)?.count || 0), 0);
      laneHeader.createSpan({ cls: "db-board-subgroup-count", text: String(laneCount) });
      const cells = lane.createDiv({ cls: "db-board-swimlane-columns" });
      for (const group of groups) {
        const subgroup = group.subgroups?.find((candidate) => candidate.key === laneKey);
        const cell = cells.createDiv({ cls: "db-board-swimlane-column" });
        const collapsed = Boolean(this.actions.isGroupCollapsed?.(groupField, group.key)) || Boolean(this.actions.isGroupCollapsed?.(subgroupField, laneKey));
        cell.toggleClass("is-collapsed", collapsed);
        if (collapsed) continue;
        const currentSubgroup = subgroup || { key: laneKey, rows: [], count: 0 };
        const cards = this.createCardsContainer(cell, config, group, groupField, subgroupField, currentSubgroup);
        const visibleCount = getGroupVisibleCount(config, subgroupField, currentSubgroup.key, currentSubgroup.rows.length);
        if (visibleCount === 0) {
          const groupEmptyOptions: EmptyStateOptions = emptyState
            ? (emptyStateTracker?.actionsRendered && emptyState.actions
              ? { ...emptyState, actions: undefined }
              : emptyState)
            : { reason: "empty-group" };
          if (groupEmptyOptions.actions && groupEmptyOptions.actions.length > 0 && emptyStateTracker) {
            emptyStateTracker.actionsRendered = true;
          }
          const empty = this.emptyStateRenderer.renderCard(cards, groupEmptyOptions);
          empty.addClass("db-board-empty-slot");
        }
        for (const row of currentSubgroup.rows.slice(0, visibleCount)) this.renderCard(cards, config, groups, group, row, groupField, subgroupField, currentSubgroup.key, currentSubgroup.rows);
        renderGroupExpandControls(cards, config, subgroupField, currentSubgroup.key, currentSubgroup.rows.length, this.actions);
        if (!this.actions.isReadOnly && !this.actions.hideCreateEntry) {
          if (isComputedGroupField(config, groupField) || isComputedGroupField(config, subgroupField)) {
            cards.createEl("button", { cls: "db-board-new-card is-disabled", text: t("group.computedCreateDisabled"), attr: { type: "button", disabled: "true" } });
          } else {
            cards.createEl("button", { cls: "db-board-new-card", text: `+ ${t("toolbar.new")}`, attr: { type: "button" } }).onclick = () => this.createEntryNearEnd({ [groupField]: group.key || "", [subgroupField]: laneKey }, currentSubgroup.rows);
          }
        }
      }
    }
  }

  private renderAddGroupControl(board: HTMLElement, config: ViewConfig, groupField: string): void {
    const column = config?.schema.columns.find((candidate) => candidate.key === groupField);
    let selectedColor: StatusColor = OPTION_REGISTRATION_COLORS[
      (column?.statusOptions?.length || 0) % OPTION_REGISTRATION_COLORS.length
    ];
    const addGroup = board.createDiv({ cls: "db-board-add-column" });
    const trigger = addGroup.createEl("button", {
      cls: "db-board-add-group-trigger",
      text: `+ ${t("board.newGroup")}`,
      attr: { type: "button" },
    });
    trigger.onclick = () => {
      trigger.remove();
      const editor = addGroup.createDiv({ cls: "db-board-add-group-editor" });
      const input = editor.createEl("input", {
        cls: "db-board-add-group-input",
        attr: {
          type: "text",
          placeholder: t("board.groupNamePlaceholder"),
          "aria-label": t("board.groupNamePlaceholder"),
        },
      });
      const confirm = editor.createEl("button", {
        cls: "db-board-add-group-confirm",
        attr: { type: "button", title: t("common.save"), "aria-label": t("common.save") },
      });
      setIcon(confirm, "check");
      const cancel = editor.createEl("button", {
        cls: "db-board-add-group-cancel",
        attr: { type: "button", title: t("common.cancel"), "aria-label": t("common.cancel") },
      });
      setIcon(cancel, "x");
      const colorPreview = editor.createSpan({
        cls: `db-board-add-group-color-preview db-option-color-${selectedColor}`,
        attr: {
          role: "button",
          tabindex: "0",
          "aria-label": t("board.groupColor"),
          title: t("board.groupColor"),
        },
      });
      let closeColorPicker: (() => void) | undefined;
      const openColorPicker = () => {
        closeColorPicker = openOptionColorPicker(colorPreview, selectedColor, (color) => {
          colorPreview.removeClass(`db-option-color-${selectedColor}`);
          selectedColor = color;
          colorPreview.addClass(`db-option-color-${selectedColor}`);
        });
      };
      colorPreview.onclick = (event) => {
        event.stopPropagation();
        openColorPicker();
      };
      colorPreview.onkeydown = (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openColorPicker();
      };
      let submitting = false;
      const close = () => {
        closeColorPicker?.();
        editor.remove();
        addGroup.remove();
        this.renderAddGroupControl(board, config, groupField);
      };
      const submit = async () => {
        const name = input.value.trim();
        if (!name || submitting || !this.actions.createGroup) return;
        submitting = true;
        closeColorPicker?.();
        input.disabled = true;
        confirm.disabled = true;
        const created = await this.actions.createGroup(groupField, name, selectedColor);
        if (created) return;
        submitting = false;
        input.disabled = false;
        confirm.disabled = false;
        input.focus();
        input.select();
      };
      confirm.onclick = () => { void submit(); };
      cancel.onclick = close;
      input.onkeydown = (event) => {
        if (isImeComposing(event)) return;
        if (event.key === "Enter") {
          event.preventDefault();
          void submit();
        } else if (event.key === "Escape") {
          event.preventDefault();
          close();
        }
      };
      input.focus();
    };
  }

  private renderColumn(
    board: HTMLElement,
    config: ViewConfig,
    groups: BoardGroup[],
    group: BoardGroup,
    groupField: string,
    emptyState?: EmptyStateOptions,
    emptyStateTracker?: { actionsRendered: boolean },
  ): void {
    const column = board.createDiv({ cls: "db-board-column" });
    column.setAttr("id", this.getGroupSectionId(groupField, group.key));
    const subgroupField = config.boardSubgroupEnabled !== false && config.boardSubgroupField && config.boardSubgroupField !== groupField
      ? config.boardSubgroupField
      : undefined;
    column.addEventListener("dragover", (event) => {
      if (this.isGroupDrag(event)) {
        if (!this.canReorderGroups()) return;
      } else if (this.isCardDrag(event)) {
        // 跨组移动只改分组值、与排序无关，不再受 canReorderCards 约束；
        // 有子分组时列级不接 card drop（应落到 subgroup 容器）。
        if (this.actions.isReadOnly || subgroupField) return;
      } else {
        return;
      }
      event.preventDefault();
      column.addClass("is-drop-target");
    });
    column.addEventListener("dragleave", () => this.clearTransientClass(column, "is-drop-target"));
    column.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.clearTransientClass(column, "is-drop-target");
      const groupKey = event.dataTransfer?.getData(GROUP_MIME);
      if (groupKey && this.canReorderGroups()) {
        this.dropGroup(groups, groupField, groupKey, group.key, event, column);
        return;
      }
      if (this.actions.isReadOnly) return;
      const paths = this.getDraggedPaths(event);
      const path = paths[0];
      const row = path ? this.rowByPath.get(path) : undefined;
      const fromGroup = event.dataTransfer?.getData(CARD_FROM_GROUP_MIME) || undefined;
      if (row) {
        // 拖到列空白区：同列保持原位，跨列才追加到目标列末尾。
        const drop = resolveBoardContainerDropOrder({
          rows: group.rows,
          draggedPath: row.file.path,
          fromGroup,
          groupKey: group.key,
          fromSubgroup: undefined,
          subgroupKey: undefined,
        });
        if (drop.keepInPlace) return;
        this.rowDropFeedback.begin(row.file.path, paths, group.key);
        this.rowDropFeedback.setPending();
        void this.moveCardAndOrder(
          row,
          groupField,
          group.key,
          fromGroup,
          row.file.path,
          drop.order,
          undefined,
          undefined,
          undefined,
          paths
        ).then(() => this.rowDropFeedback.commit()).catch((error) => this.rowDropFeedback.fail(error));
      }
    });

    const header = column.createDiv({ cls: "db-board-column-header" });
    const columnCollapsed = Boolean(this.actions.isGroupCollapsed?.(groupField, group.key));
    column.toggleClass("is-collapsed", columnCollapsed);
    if (this.canReorderGroups() && !this.touchMode) {
      header.draggable = true;
      header.addEventListener("dragstart", (event) => {
        event.dataTransfer?.setData(GROUP_MIME, group.key);
        event.dataTransfer?.setData("text/plain", group.key);
        column.addClass("is-dragging");
      });
      header.addEventListener("dragend", () => this.clearTransientClass(column, "is-dragging"));
    }
    const toggle = header.createEl("button", {
      cls: `db-board-group-toggle${columnCollapsed ? " is-collapsed" : ""}`,
      attr: { type: "button", "aria-label": columnCollapsed ? t("group.expand") : t("group.collapse"), "aria-expanded": String(!columnCollapsed), "aria-controls": column.id || this.getGroupSectionId(groupField, group.key) },
    });
    toggle.createSpan({ cls: "db-collapse-triangle" });
    toggle.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.actions.toggleGroupCollapsed?.(groupField, group.key);
    };
    if (!this.actions.isReadOnly) {
      const checkbox = createCheckbox(header, {
        role: "row",
        cls: "db-board-column-checkbox",
        attr: { "aria-label": group.key || t("common.noGroup") },
      });
      checkbox.checked = this.actions.areAllRowsSelected(group.rows);
      checkbox.indeterminate = group.rows.some((row) => this.actions.isRowSelected(row)) && !checkbox.checked;
      checkbox.onclick = (event) => event.stopPropagation();
      checkbox.onchange = () => this.actions.toggleRowsSelected(group.rows, checkbox.checked);
    }
    const headerText = header.createDiv({ cls: "db-board-header-text" });
    renderGroupLabel(headerText, config, groupField, group.key, "db-board-column-title");
    headerText.createSpan({ cls: "db-board-count", text: String(group.count) });
    if (config.summaryRules?.length) {
      const summaries = headerText.createSpan({ cls: "db-board-header-summaries" });
      this.actions.renderGroupSummaries?.(summaries, group.rows, config);
    }
    this.renderBoardGroupOptions(headerText, config, groupField, group);
    if (!this.touchMode) {
      const resizeHandle = column.createDiv({ cls: "db-board-column-resize-handle" });
      resizeHandle.addEventListener("mousedown", (event) => this.startColumnResize(event, board, config));
    }
    if (columnCollapsed) return;

    if (subgroupField && group.subgroups?.length) {
      const subgroups = column.createDiv({ cls: "db-board-subgroups" });
      for (const subgroup of group.subgroups) {
        this.renderSubgroup(subgroups, config, groups, group, subgroup, groupField, subgroupField, emptyState, emptyStateTracker);
      }
      return;
    }

    const cards = this.createCardsContainer(column, config, group, groupField);
    const visibleCount = getGroupVisibleCount(config, groupField, group.key, group.rows.length);
    if (visibleCount === 0) {
      const groupEmptyOptions: EmptyStateOptions = emptyState
        ? (emptyStateTracker?.actionsRendered && emptyState.actions
          ? { ...emptyState, actions: undefined }
          : emptyState)
        : { reason: "empty-group" };
      if (groupEmptyOptions.actions && groupEmptyOptions.actions.length > 0 && emptyStateTracker) {
        emptyStateTracker.actionsRendered = true;
      }
      const empty = this.emptyStateRenderer.renderCard(cards, groupEmptyOptions);
      empty.addClass("db-board-empty-slot");
    }
    for (const row of group.rows.slice(0, visibleCount)) {
      this.renderCard(cards, config, groups, group, row, groupField, undefined, undefined, group.rows);
    }
    renderGroupExpandControls(cards, config, groupField, group.key, group.rows.length, this.actions);
    if (!this.actions.isReadOnly && !this.actions.hideCreateEntry) {
      if (isComputedGroupField(config, groupField)) {
        cards.createEl("button", { cls: "db-board-new-card is-disabled", text: t("group.computedCreateDisabled"), attr: { disabled: "true" } });
      } else {
        cards.createEl("button", { cls: "db-board-new-card", text: `+ ${t("toolbar.new")}` }).onclick =
          () => this.createEntryNearEnd({ [groupField]: group.key || "" }, group.rows);
      }
    }
  }

  private renderSubgroup(
    parent: HTMLElement,
    config: ViewConfig,
    groups: BoardGroup[],
    group: BoardGroup,
    subgroup: BoardSubgroup,
    groupField: string,
    subgroupField: string,
    emptyState?: EmptyStateOptions,
    emptyStateTracker?: { actionsRendered: boolean },
  ): void {
    const section = parent.createDiv({ cls: "db-board-subgroup" });
    section.setAttr("id", this.getGroupSectionId(subgroupField, subgroup.key));
    const header = section.createDiv({ cls: "db-board-subgroup-header" });
    const collapsed = Boolean(this.actions.isGroupCollapsed?.(subgroupField, subgroup.key));
    section.toggleClass("is-collapsed", collapsed);
    const toggle = header.createEl("button", {
      cls: `db-board-subgroup-toggle${collapsed ? " is-collapsed" : ""}`,
      attr: { type: "button", "aria-label": collapsed ? t("group.expand") : t("group.collapse"), "aria-expanded": String(!collapsed), "aria-controls": section.id || this.getGroupSectionId(subgroupField, subgroup.key) },
    });
    toggle.createSpan({ cls: "db-collapse-triangle" });
    toggle.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.actions.toggleGroupCollapsed?.(subgroupField, subgroup.key);
    };
    if (!this.actions.isReadOnly) {
      const checkbox = createCheckbox(header, {
        role: "row",
        cls: "db-board-subgroup-checkbox",
        attr: { "aria-label": subgroup.key || t("common.noGroup") },
      });
      checkbox.checked = this.actions.areAllRowsSelected(subgroup.rows);
      checkbox.indeterminate = subgroup.rows.some((row) => this.actions.isRowSelected(row)) && !checkbox.checked;
      checkbox.onclick = (event) => event.stopPropagation();
      checkbox.onchange = () => this.actions.toggleRowsSelected(subgroup.rows, checkbox.checked);
    }
    const headerText = header.createDiv({ cls: "db-board-header-text" });
    renderGroupLabel(headerText, config, subgroupField, subgroup.key, "db-board-subgroup-title");
    headerText.createSpan({ cls: "db-board-subgroup-count", text: String(subgroup.count) });
    if (config.summaryRules?.length) {
      const summaries = headerText.createSpan({ cls: "db-board-header-summaries" });
      this.actions.renderGroupSummaries?.(summaries, subgroup.rows, config);
    }
    if (collapsed) return;

    const cards = this.createCardsContainer(section, config, group, groupField, subgroupField, subgroup);
    const visibleCount = getGroupVisibleCount(config, subgroupField, subgroup.key, subgroup.rows.length);
    if (visibleCount === 0) {
      const groupEmptyOptions: EmptyStateOptions = emptyState
        ? (emptyStateTracker?.actionsRendered && emptyState.actions
          ? { ...emptyState, actions: undefined }
          : emptyState)
        : { reason: "empty-group" };
      if (groupEmptyOptions.actions && groupEmptyOptions.actions.length > 0 && emptyStateTracker) {
        emptyStateTracker.actionsRendered = true;
      }
      const empty = this.emptyStateRenderer.renderCard(cards, groupEmptyOptions);
      empty.addClass("db-board-empty-slot");
    }
    for (const row of subgroup.rows.slice(0, visibleCount)) {
      this.renderCard(cards, config, groups, group, row, groupField, subgroupField, subgroup.key, subgroup.rows);
    }
    renderGroupExpandControls(cards, config, subgroupField, subgroup.key, subgroup.rows.length, this.actions);
    if (!this.actions.isReadOnly && !this.actions.hideCreateEntry) {
      if (isComputedGroupField(config, groupField) || isComputedGroupField(config, subgroupField)) {
        cards.createEl("button", { cls: "db-board-new-card is-disabled", text: t("group.computedCreateDisabled"), attr: { disabled: "true" } });
      } else {
        cards.createEl("button", { cls: "db-board-new-card", text: `+ ${t("toolbar.new")}` }).onclick =
          () => this.createEntryNearEnd({ [groupField]: group.key || "", [subgroupField]: subgroup.key || "" }, subgroup.rows);
      }
    }
  }

  private createCardsContainer(
    parent: HTMLElement,
    config: ViewConfig,
    group: BoardGroup,
    groupField: string,
    subgroupField?: string,
    subgroup?: BoardSubgroup
  ): HTMLElement {
    // Board cards sit two levels below the grid (column, then this container),
    // unlike gallery and list where they are direct children. Without an explicit
    // owning rowgroup the cards' row role has no valid parent in the a11y tree.
    const cards = parent.createDiv({ cls: "db-board-cards", attr: { role: "rowgroup" } });
    cards.addEventListener("dragover", (event) => {
      if (this.actions.isReadOnly) return;
      if (!this.isCardDrag(event)) return;
      // 跨组移动不受排序约束：非只读一律允许 drop，落点由 resolveBoardContainerDropOrder 决定。
      event.preventDefault();
      this.cardAutoScroller?.update(event);
      this.highlightCardDropZone(cards);
    });
    cards.addEventListener("drop", (event) => {
      if (this.actions.isReadOnly) return;
      const paths = this.getDraggedPaths(event);
      const path = paths[0];
      if (!path) return;
      const row = this.rowByPath.get(path);
      if (!row) return;
      event.preventDefault();
      event.stopPropagation();
      this.clearCardDropZone(cards);
      const fromGroup = event.dataTransfer?.getData(CARD_FROM_GROUP_MIME) || undefined;
      const fromSubgroup = event.dataTransfer?.getData(CARD_FROM_SUBGROUP_MIME) || undefined;
      // 拖到卡片容器空白区：同分组保持原位，跨分组才追加到目标分组末尾。
      const drop = resolveBoardContainerDropOrder({
        rows: subgroup?.rows ?? group.rows,
        draggedPath: path,
        fromGroup,
        groupKey: group.key,
        fromSubgroup,
        subgroupKey: subgroup?.key,
      });
      if (drop.keepInPlace) return;
      this.rowDropFeedback.begin(path, paths, group.key);
      this.rowDropFeedback.setPending();
      void this.moveCardAndOrder(row, groupField, group.key, fromGroup, path, drop.order, subgroupField, subgroup?.key, fromSubgroup, paths)
        .then(() => this.rowDropFeedback.commit())
        .catch((error) => this.rowDropFeedback.fail(error));
    });
    return cards;
  }

  private createEntryNearEnd(defaults: Record<string, unknown> | undefined, rows: RowData[]): void {
    this.actions.createEntry(defaults, this.getCreatePosition(rows));
  }

  private getCreatePosition(rows: RowData[]): CreateEntryPosition | undefined {
    const last = rows[rows.length - 1];
    return last ? { afterPath: last.file.path } : undefined;
  }

  private renderCard(
    cards: HTMLElement,
    config: ViewConfig,
    groups: BoardGroup[],
    group: BoardGroup,
    row: RowData,
    groupField: string,
    subgroupField?: string,
    subgroupKey?: string,
    visibleRows: RowData[] = group.rows
  ): void {
    const card = cards.createDiv({
      cls: "db-board-card",
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
      ignoreSelector: "a, button, input, select, textarea, .db-cell-editing, .db-board-card-cover-button",
    });
    if (this.actions.openRecordDetail) {
      card.addEventListener("click", (event) => {
        if (isHTMLElement(event.target) && event.target.closest("a, button, input, select, textarea, .db-cell-editing, .db-board-card-cover-button")) return;
        this.actions.openRecordDetail?.(card, row);
      });
    }
    this.actions.applyConditionalFormat?.(card, row, config);
    this.attachRowContextMenu(card, row, {
      visibleRows,
      groups: [
        { field: groupField, key: group.key },
        ...(subgroupField && subgroupKey != null ? [{ field: subgroupField, key: subgroupKey }] : []),
      ],
    });
    if (!this.actions.isReadOnly && !this.touchMode) {
      card.draggable = true;
      card.addEventListener("dragstart", (event) => {
        if (isHTMLElement(event.target) && event.target.closest("input, select, textarea, button")) {
          event.preventDefault();
          return;
        }
        const dragPaths = this.getDragPaths(row);
        event.dataTransfer?.setData(CARD_MIME, row.file.path);
        event.dataTransfer?.setData(ROW_BATCH_MIME, JSON.stringify(dragPaths));
        event.dataTransfer?.setData("text/plain", row.file.path);
        event.dataTransfer?.setData(CARD_FROM_GROUP_MIME, group.key);
        if (subgroupKey != null) event.dataTransfer?.setData(CARD_FROM_SUBGROUP_MIME, subgroupKey);
        this.draggingCardPath = row.file.path;
        this.draggingCardPaths = dragPaths;
        this.rowDropFeedback.begin(row.file.path, dragPaths);
        card.addClass("is-dragging");
        // 方案 A：拖拽期间让列等高（align-items: stretch），使每个列标题的 sticky 失效点推迟到看板底部；
        // 方案 B：启动鼠标附近浮动列名 preview。
        this.boardEl?.addClass("is-card-dragging");
        this.beginBoardDragPreview(config, dragPaths.length);
        this.cardAutoScroller = new EdgeAutoScroller(this.boardEl || card);
      });
      card.addEventListener("dragover", (event) => {
        if (!this.isCardDrag(event)) return;
        const path = this.draggingCardPath || event.dataTransfer?.getData(CARD_MIME);
        if (!path || path === row.file.path || !this.rowByPath.has(path)) return;
        event.preventDefault();
        this.cardAutoScroller?.update(event);
        // before/after 精确插入指示线在未显式排序时显示（同组重排或跨组移动到目标卡片位置
        // 都按鼠标位置精确插入）；显式排序下位置由排序规则决定、精确插入无意义，故不显示，
        // 但 drop 仍被允许以支持跨组移动。
        if (this.canReorderCards(config)) {
          this.updateCardDropIndicator(card, resolveDropPlacement(card, event, "vertical"));
        } else {
          this.clearCardDropIndicator(card);
        }
        card.addClass("is-drop-target");
        this.highlightCardDropZone(card);
      });
      card.addEventListener("dragenter", (event) => {
        if (!event.dataTransfer?.types.includes(CARD_MIME)) return;
        const count = (this.dragEnterCount.get(card) || 0) + 1;
        this.dragEnterCount.set(card, count);
      });
      card.addEventListener("dragleave", () => {
        const count = (this.dragEnterCount.get(card) || 1) - 1;
        this.dragEnterCount.set(card, count);
        window.setTimeout(() => {
          if ((this.dragEnterCount.get(card) || 0) <= 0) {
            this.clearCardDropTarget(card);
          }
        }, 0);
      });
      card.addEventListener("drop", (event) => {
        const paths = this.getDraggedPaths(event);
        const path = paths[0];
        const dragged = path ? this.rowByPath.get(path) : undefined;
        if (!path || !dragged) return;
        if (path === row.file.path) return;
        event.preventDefault();
        event.stopPropagation();
        this.clearCardDropTarget(card);
        const fromGroup = event.dataTransfer?.getData(CARD_FROM_GROUP_MIME) || undefined;
        const fromSubgroup = event.dataTransfer?.getData(CARD_FROM_SUBGROUP_MIME) || undefined;
        // 跨组移动只改分组值、不受排序约束；同组重排序在显式排序下忽略（manual order 被覆盖）。
        const intent = resolveBoardCardDropIntent({
          fromGroup,
          targetGroupKey: group.key,
          fromSubgroup,
          targetSubgroupKey: subgroupKey,
          explicitlySorted: isExplicitlySorted(config),
        });
        if (intent === "ignore") return;
        this.rowDropFeedback.setPending();
        void this.moveCardAndOrder(dragged, groupField, group.key, fromGroup, path, this.getCardDropOrder(visibleRows, paths, row.file.path, event, card), subgroupField, subgroupKey, fromSubgroup, paths)
          .then(() => this.rowDropFeedback.commit())
          .catch((error) => this.rowDropFeedback.fail(error));
      });
      card.addEventListener("dragend", () => {
        this.clearTransientClass(card, "is-dragging");
        this.cardAutoScroller?.destroy();
        this.cardAutoScroller = undefined;
        this.clearCardDropTarget(card);
        this.draggingCardPath = undefined;
        this.draggingCardPaths = [];
        // 方案 A/B 收尾：恢复列等高状态，移除浮动列名 preview。
        this.boardEl?.removeClass("is-card-dragging");
        this.endBoardDragPreview();
        if (this.rowDropFeedback.getPhase() !== "pending") this.rowDropFeedback.clear();
      });
    }

    if (config.boardImageField) this.renderCover(card, config, row);

    const controls = card.createDiv({ cls: "db-board-card-controls" });
    if (!this.actions.isReadOnly) {
      const checkbox = createCheckbox(controls, {
        role: "row",
        cls: "db-board-card-checkbox",
        attr: { "aria-label": row.file.basename || row.file.path },
      });
      checkbox.checked = this.actions.isRowSelected(row);
      checkbox.onclick = (event) => {
        event.stopPropagation();
        this.actions.toggleRowSelected(row, !this.actions.isRowSelected(row), event);
      };
    }
    const openBtn = controls.createEl("button", {
      cls: "db-board-card-open",
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
    if (!this.actions.isReadOnly) {
      this.renderMobileMoveButton(controls, config, groups, group, row, groupField, subgroupField, subgroupKey);
    }
    const columns = this.actions.getColumns(config);
    const titleField = this.getTitleField(config);
    const title = titleField ? resolveTitleFieldDisplay(row, config, titleField) : undefined;
    if (title && !title.isHidden) {
      const titleLine = card.createDiv({ cls: "db-record-title-line" });
      this.actions.renderRecordIcon?.(titleLine, row, config);
      const titleEl = titleLine.createDiv({
        cls: "db-board-card-title",
        attr: { title: title.isFileTitle ? row.file.path : title.isEmpty ? "" : title.text },
      });
      markNoteHoverLink(titleEl, row.file.path, row.file.path);
      if (title.isFileTitle) {
        renderStackedFileTitle(titleEl, getFileTitleDisplay(row, EMPTY_ROWS, this.duplicateNames), true);
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
    const meta = card.createDiv({ cls: "db-board-card-meta" });
    const groupedFields = new Set([groupField, ...(subgroupField ? [subgroupField] : [])]);
    const fields = columns.filter((col) => col.key !== titleField && !groupedFields.has(col.key));
    for (const col of fields) {
      const value = this.getCellValue(row, col);
      const displayType = this.getDisplayType(config, col);
      const empty = this.isEmptyValue(value) && displayType !== "checkbox";
      if (empty && !this.shouldShowEmptyField(config, col)) continue;
      const displayValue = empty ? this.getEmptyDisplayValue(col, displayType) : value;
      meta.appendChild(this.renderCardFieldContent(row, col, config, displayValue, displayType, empty));
    }
  }

  private renderCover(card: HTMLElement, config: ViewConfig, row: RowData): void {
    const cover = card.createDiv({ cls: "db-board-card-cover" });
    const ratio = Math.max(0.35, Math.min(2.5, config.boardImageAspectRatio ?? 0.75));
    cover.style.aspectRatio = String(ratio);
    cover.style.setProperty("--db-board-image-fit", config.boardImageFit || "cover");
    const image = resolveCoverImage(config.boardImageField, row, this.app);
    const coverColumn = config.schema.columns.find((col) => col.key === config.boardImageField);
    if (!image || isCoverImageBlocked(image, coverColumn?.type)) {
      cover.addClass("is-empty");
      setIcon(cover.createSpan({ cls: "db-board-card-cover-placeholder" }), "image");
      return;
    }
    const coverLink = cover.createEl("div", {
      cls: "db-board-card-cover-button",
      attr: { role: "button", tabindex: "0", "aria-label": image.label },
    });
    setTooltip(coverLink, image.label, { delay: 100 });
    const openCover = (): void => {
      if (image.external) {
        openExternalUrl(image.target);
        return;
      }
      void this.app.workspace.openLinkText(image.target, row.file.path);
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
    imageEl.onerror = () => markCoverImageLoadError(cover, coverLink, "db-board-card-cover-placeholder");
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

  private renderMobileMoveButton(
    card: HTMLElement,
    config: ViewConfig,
    groups: BoardGroup[],
    currentGroup: BoardGroup,
    row: RowData,
    groupField: string,
    subgroupField?: string,
    subgroupKey?: string
  ): void {
    // 手机移动菜单支持跨组移动（与排序状态无关）；只读视图由调用方 renderCard 守卫，不会进入此处。
    const button = card.createEl("button", {
      cls: "db-card-mobile-move-btn",
      attr: { type: "button", title: t("mobile.moveCard"), "aria-label": t("mobile.moveCard") },
    });
    renderMobileMoveIcon(button);
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.showMobileBoardMoveMenu(event, config, groups, currentGroup, row, groupField, subgroupField, subgroupKey);
    };
  }

  private showMobileBoardMoveMenu(
    event: MouseEvent,
    config: ViewConfig,
    groups: BoardGroup[],
    currentGroup: BoardGroup,
    row: RowData,
    groupField: string,
    subgroupField?: string,
    subgroupKey?: string
  ): void {
    const menu = createOwnedMenuForEvent(event);
    const currentRows = subgroupField
      ? currentGroup.subgroups?.find((subgroup) => subgroup.key === subgroupKey)?.rows || []
      : currentGroup.rows;
    const applyOrder = (targetGroup: BoardGroup, targetSubgroupKey: string | undefined, placement: "top" | "bottom" | "before" | "after", targetPath?: string) => {
      void this.moveCardAndOrder(
        row,
        groupField,
        targetGroup.key,
        currentGroup.key,
        row.file.path,
        this.getMobileTargetOrder(targetGroup, row.file.path, placement, targetPath, subgroupField, targetSubgroupKey),
        subgroupField,
        targetSubgroupKey,
        subgroupKey
      );
    };

    menu.addRow({ icon: "chevrons-up", label: t("mobile.moveTop"), onClick: () => applyOrder(currentGroup, subgroupKey, "top") });
    menu.addRow({ icon: "chevrons-down", label: t("mobile.moveBottom"), onClick: () => applyOrder(currentGroup, subgroupKey, "bottom") });
    for (const target of currentRows.filter((candidate) => candidate.file.path !== row.file.path)) {
      const label = this.getMobileRowLabel(config, target);
      menu.addRow({ icon: "corner-up-left", label: `${t("mobile.moveBefore")} ${label}`, onClick: () => applyOrder(currentGroup, subgroupKey, "before", target.file.path) });
      menu.addRow({ icon: "corner-down-left", label: `${t("mobile.moveAfter")} ${label}`, onClick: () => applyOrder(currentGroup, subgroupKey, "after", target.file.path) });
    }

    const targetGroups = subgroupField
      ? groups.flatMap((group) => (group.subgroups || []).map((subgroup) => ({ group, subgroupKey: subgroup.key })))
      : groups.map((group) => ({ group, subgroupKey: undefined as string | undefined }));
    if (targetGroups.length) menu.addSeparator();
    for (const target of targetGroups) {
      const isCurrent = target.group.key === currentGroup.key && target.subgroupKey === subgroupKey;
      if (isCurrent) continue;
      const groupLabel = formatGroupKeyDisplay(config, groupField, target.group.key);
      const subgroupLabel = target.subgroupKey == null
        ? undefined
        : formatGroupKeyDisplay(config, subgroupField, target.subgroupKey);
      const label = subgroupField
        ? `${groupLabel} / ${subgroupLabel || t("common.uncategorized")}`
        : groupLabel;
      menu.addRow({ icon: "folder-input", label: `${t("mobile.moveTo")} ${label}`, onClick: () => applyOrder(target.group, target.subgroupKey, "bottom") });
    }
    menu.showAt({ x: event.clientX, y: event.clientY });
  }

  private getMobileTargetOrder(
    group: BoardGroup,
    draggedPath: string,
    placement: "top" | "bottom" | "before" | "after",
    targetPath?: string,
    subgroupField?: string,
    subgroupKey?: string
  ): string[] {
    const targetRows = subgroupField && subgroupKey != null
      ? group.subgroups?.find((subgroup) => subgroup.key === subgroupKey)?.rows || []
      : group.rows;
    const order = targetRows.map((candidate) => candidate.file.path).filter((path) => path !== draggedPath);
    if (placement === "top") return [draggedPath, ...order];
    if (placement === "bottom" || !targetPath) return [...order, draggedPath];
    const targetIndex = order.indexOf(targetPath);
    if (targetIndex < 0) return [...order, draggedPath];
    order.splice(placement === "after" ? targetIndex + 1 : targetIndex, 0, draggedPath);
    return order;
  }

  private getMobileRowLabel(config: ViewConfig, row: RowData): string {
    const titleField = this.getTitleField(config);
    const title = titleField ? resolveTitleFieldDisplay(row, config, titleField) : undefined;
    return title && !title.isHidden ? title.text : row.file.name.replace(/\.md$/, "");
  }

  private dropGroup(
    groups: BoardGroup[],
    groupField: string,
    draggedKey: string,
    targetKey: string,
    event: DragEvent,
    column: HTMLElement
  ): void {
    if (draggedKey === targetKey) return;
    const order = groups.map((group) => group.key);
    const from = order.indexOf(draggedKey);
    const target = order.indexOf(targetKey);
    if (from < 0 || target < 0) return;
    const rect = column.getBoundingClientRect();
    let insertIndex = event.clientX > rect.left + rect.width / 2 ? target + 1 : target;
    const [item] = order.splice(from, 1);
    if (from < insertIndex) insertIndex -= 1;
    order.splice(insertIndex, 0, item);
    this.actions.updateGroupOrder(groupField, order);
  }

  private getCardDropOrder(
    rows: RowData[],
    draggedPaths: string[],
    targetPath: string,
    event: DragEvent,
    card: HTMLElement
  ): string[] {
    const moving = new Set(draggedPaths);
    const order = rows.map((row) => row.file.path).filter((path) => !moving.has(path));
    const target = order.indexOf(targetPath);
    if (moving.has(targetPath) || target < 0) return order;
    const rect = card.getBoundingClientRect();
    let insertIndex = event.clientY > rect.top + rect.height / 2 ? target + 1 : target;
    order.splice(insertIndex, 0, ...rows.map((row) => row.file.path).filter((path) => moving.has(path)));
    return order;
  }

  private async moveCardAndOrder(
    row: RowData,
    groupField: string,
    groupKey: string,
    fromGroup: string | undefined,
    draggedPath: string,
    order: string[],
    subgroupField?: string,
    subgroupKey?: string,
    fromSubgroup?: string,
    draggedPaths: string[] = [draggedPath],
  ): Promise<void> {
    const movingPaths = Array.from(new Set(draggedPaths.filter((path) => this.rowByPath.has(path))));
    if (!movingPaths.length) movingPaths.push(draggedPath);
    const missingPaths = movingPaths.filter((path) => !order.includes(path));
    if (missingPaths.length) order = [...order, ...missingPaths];
    const position = this.getDropPositionFromOrder(order, movingPaths);
    const groupUpdates: Array<{ field: string; fromGroupKey: string; toGroupKey: string }> = [];
    if (fromGroup != null && !isSameBoardGroup(fromGroup, groupKey)) {
      groupUpdates.push({ field: groupField, fromGroupKey: fromGroup, toGroupKey: groupKey });
    }
    if (subgroupField && subgroupKey != null && fromSubgroup != null && !isSameBoardGroup(fromSubgroup, subgroupKey)) {
      groupUpdates.push({ field: subgroupField, fromGroupKey: fromSubgroup, toGroupKey: subgroupKey });
    }
    if (groupUpdates.length > 0 && this.actions.moveRowWithGroupUpdatesAndPosition) {
      await this.actions.moveRowWithGroupUpdatesAndPosition(row, groupUpdates, position.before, position.after, movingPaths);
      return;
    }
    if (movingPaths.length > 1 && this.actions.moveRowsToPosition) {
      this.actions.moveRowsToPosition(movingPaths, position.before, position.after);
      return;
    }
    for (const update of groupUpdates) {
      await this.actions.updateGroup(row, update.field, update.toGroupKey, update.fromGroupKey);
    }
    this.actions.moveRowToPosition(draggedPath, position.before, position.after);
  }

  private updateCardOrder(groupField: string, groupKey: string, paths: string[]): void {
    this.actions.updateCardOrder(groupField, groupKey, paths);
  }

  private getDropPositionFromOrder(order: string[], movedPaths: string[]): { before?: string; after?: string } {
    const moving = new Set(movedPaths);
    const indexes = movedPaths.map((path) => order.indexOf(path)).filter((index) => index >= 0);
    if (indexes.length === 0) return {};
    const first = Math.min(...indexes);
    const last = Math.max(...indexes);
    return {
      before: first > 0 && !moving.has(order[first - 1]) ? order[first - 1] : undefined,
      after: last < order.length - 1 && !moving.has(order[last + 1]) ? order[last + 1] : undefined,
    };
  }

  private canReorderCards(config: ViewConfig): boolean {
    return !isExplicitlySorted(config);
  }

  private canReorderGroups(): boolean {
    return !this.actions.isReadOnly || this.actions.canReorderGroups === true;
  }

  private isCardDrag(event: DragEvent): boolean {
    return Array.from(event.dataTransfer?.types || []).includes(CARD_MIME);
  }

  private isGroupDrag(event: DragEvent): boolean {
    return Array.from(event.dataTransfer?.types || []).includes(GROUP_MIME);
  }

  private getGroupSectionId(field: string, key: string): string {
    return `group-section-${encodeURIComponent(`${field}:${key}`)}`;
  }

  private renderBoardPagination(board: HTMLElement): void {
    const columns = Array.from(board.querySelectorAll<HTMLElement>(":scope > .db-board-column"));
    if (columns.length < 2) return;
    const pagination = board.createDiv({
      cls: "db-board-pagination",
      attr: { role: "tablist", "aria-label": t("common.boardView") },
    });
    const setActive = (activeIndex: number) => {
      pagination.querySelectorAll<HTMLElement>("button").forEach((button, index) => {
        button.setAttr("aria-selected", String(index === activeIndex));
      });
    };
    columns.forEach((column, index) => {
      const button = pagination.createEl("button", {
        cls: `db-board-pagination-dot${index === 0 ? " is-active" : ""}`,
        attr: { type: "button", role: "tab", "aria-selected": String(index === 0), "aria-label": `${index + 1} / ${columns.length}` },
      });
      button.onclick = () => {
        column.scrollIntoView?.({ behavior: "smooth", block: "nearest", inline: "center" });
        setActive(index);
      };
    });
    board.insertBefore(pagination, board.firstChild);
    board.addEventListener("scroll", () => {
      const left = board.getBoundingClientRect().left;
      let closest = 0;
      let distance = Number.POSITIVE_INFINITY;
      columns.forEach((column, index) => {
        const nextDistance = Math.abs(column.getBoundingClientRect().left - left);
        if (nextDistance < distance) { distance = nextDistance; closest = index; }
      });
      setActive(closest);
    }, { passive: true });
  }

  private highlightCardDropZone(source: HTMLElement): void {
    const zone = source.closest<HTMLElement>(".db-board-subgroup") || source.closest<HTMLElement>(".db-board-column");
    if (zone) zone.addClass("is-drop-target");
  }

  private clearCardDropZone(source: HTMLElement): void {
    const zone = source.closest<HTMLElement>(".db-board-subgroup") || source.closest<HTMLElement>(".db-board-column");
    if (zone) this.clearTransientClass(zone, "is-drop-target");
  }

  private clearTransientClass(el: HTMLElement, className: string): void {
    el.removeClass(className);
  }

  private clearCardDropTarget(card: HTMLElement): void {
    this.clearTransientClass(card, "is-drop-target");
    this.clearCardDropIndicator(card);
  }

  private updateCardDropIndicator(card: HTMLElement, placement: "before" | "after"): void {
    const indicator = card.querySelector<HTMLElement>(".db-board-drop-indicator")
      || card.createSpan({ cls: "db-board-drop-indicator" });
    indicator.toggleClass("is-before", placement === "before");
    indicator.toggleClass("is-after", placement === "after");
  }

  private clearCardDropIndicator(card: HTMLElement): void {
    card.querySelector<HTMLElement>(".db-board-drop-indicator")?.remove();
  }

  private getDragPaths(row: RowData): string[] {
    const selected = this.actions.getSelectedRows?.()
      ?.map((candidate) => candidate.file.path)
      .filter((path) => this.rowByPath.has(path)) || [];
    return selected.includes(row.file.path) ? selected : [row.file.path];
  }

  private getDraggedPaths(event: DragEvent): string[] {
    if (this.draggingCardPaths.length) return this.draggingCardPaths;
    const raw = event.dataTransfer?.getData(ROW_BATCH_MIME);
    if (raw) {
      try {
        const paths = JSON.parse(raw);
        if (Array.isArray(paths)) {
          const valid = paths.filter((path): path is string => typeof path === "string" && this.rowByPath.has(path));
          if (valid.length) return valid;
        }
      } catch {
        // A foreign drag source may provide malformed optional batch data.
      }
    }
    const path = event.dataTransfer?.getData(CARD_MIME) || event.dataTransfer?.getData("text/plain");
    return path ? [path] : [];
  }

  private getCellValue(row: RowData, col: ColumnDef): unknown {
    if (col.key === "file.name") return getFileTitleDisplay(row, EMPTY_ROWS, this.duplicateNames).displayPath;
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
      fieldClass: "db-board-card-field", valueClass: "db-board-card-value", labelClass: "db-board-card-field-label",
      badgesClass: "db-board-card-badges", linkClass: "db-board-card-link", fieldWidth: this.getCardFieldWidth(config, col),
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

  private startColumnResize(event: MouseEvent, board: HTMLElement, config: ViewConfig): void {
    event.preventDefault();
    event.stopPropagation();
    this.resizeState = {
      startX: event.clientX,
      startWidth: this.getBoardColumnWidth(config),
      board,
    };
    window.activeDocument.addEventListener("mousemove", this.handleColumnResize);
    window.activeDocument.addEventListener("mouseup", this.finishColumnResize);
  }

  private readonly handleColumnResize = (event: MouseEvent): void => {
    if (!this.resizeState) return;
    const width = this.clampBoardColumnWidth(this.resizeState.startWidth + event.clientX - this.resizeState.startX);
    this.resizeState.board.style.setProperty("--db-board-column-width", `${width}px`);
  };

  private readonly finishColumnResize = (event: MouseEvent): void => {
    if (!this.resizeState) return;
    const width = this.clampBoardColumnWidth(this.resizeState.startWidth + event.clientX - this.resizeState.startX);
    window.activeDocument.removeEventListener("mousemove", this.handleColumnResize);
    window.activeDocument.removeEventListener("mouseup", this.finishColumnResize);
    this.resizeState = undefined;
    this.actions.updateColumnWidth(width);
  };

  private getBoardColumnWidth(config: ViewConfig): number {
    return this.clampBoardColumnWidth(config.boardColumnWidth || 280);
  }

  private getCardFieldWidth(config: ViewConfig, col: ColumnDef): number {
    return clampCardFieldWidth(getFieldWidth(config, col), this.getBoardColumnWidth(config));
  }

  private getDisplayType(config: ViewConfig, col: ColumnDef): ColumnDef["type"] {
    if (isFileFieldKey(col.key)) return getFileFieldFixedType(col.key);
    return getColumnDisplayType(col, config.schema.computedFields);
  }

  private clampBoardColumnWidth(width: number): number {
    return Math.max(220, Math.min(520, Math.round(width)));
  }

  private async openTarget(row: RowData, target: string, external: boolean): Promise<void> {
    if (external) {
      openExternalUrl(target);
      return;
    }
    await this.app.workspace.openLinkText(target, row.file.path);
  }

  // 实时收集看板列/子分组候选 rect 与 zone 映射，供容器兜底 drop 与拖拽列命中（方案 B）共用。
  // getBoundingClientRect 实时取，列宽/滚动/折叠变化都能正确命中。
  private collectBoardDropTargets(): {
    candidates: BoardDropCandidate[];
    zones: Map<string, { group: BoardGroup; subgroup?: BoardSubgroup; cardsEl: HTMLElement }>;
  } {
    const candidates: BoardDropCandidate[] = [];
    const zones = new Map<string, { group: BoardGroup; subgroup?: BoardSubgroup; cardsEl: HTMLElement }>();
    const board = this.boardEl;
    if (!board) return { candidates, zones };
    const groups = this.boardGroups;
    const subgroupField = this.boardSubgroupField;
    const columnEls = Array.from(board.querySelectorAll<HTMLElement>(":scope > .db-board-column"));
    columnEls.forEach((colEl, i) => {
      const group = groups[i];
      if (!group) return;
      if (subgroupField && group.subgroups?.length) {
        const subEls = Array.from(colEl.querySelectorAll<HTMLElement>(":scope > .db-board-subgroups > .db-board-subgroup"));
        subEls.forEach((subEl, j) => {
          const subgroup = group.subgroups?.[j];
          if (!subgroup) return;
          const cardsEl = subEl.querySelector<HTMLElement>(":scope > .db-board-cards");
          if (!cardsEl) return;
          const r = subEl.getBoundingClientRect();
          const key = `${group.key}::${subgroup.key}`;
          candidates.push({ key, rect: { left: r.left, right: r.right, top: r.top, bottom: r.bottom } });
          zones.set(key, { group, subgroup, cardsEl });
        });
      } else {
        const cardsEl = colEl.querySelector<HTMLElement>(":scope > .db-board-cards");
        if (!cardsEl) return;
        const r = colEl.getBoundingClientRect();
        candidates.push({ key: group.key, rect: { left: r.left, right: r.right, top: r.top, bottom: r.bottom } });
        zones.set(group.key, { group, cardsEl });
      }
    });
    return { candidates, zones };
  }

  // 看板容器空白（列下方/上方 board 区域）的兜底拖拽落点。两列间水平 gap 不处理。
  private attachBoardContainerDropHandlers(board: HTMLElement, groupField: string): void {
    if (this.actions.isReadOnly) return;
    const subgroupField = this.boardSubgroupField;

    // 候选与 zone 收集已提取为 this.collectBoardDropTargets()，供此处与拖拽列命中（方案 B）共用。

    board.addEventListener("dragover", (event) => {
      if (this.actions.isReadOnly) return;
      if (!this.isCardDrag(event)) {
        this.detachBoardDropHighlight();
        return;
      }
      const target = event.target;
      // 冒泡隔离：target 已在列内 → 交给列/cards/card handler，清除 board 兜底反馈。
      if (isHTMLElement(target) && target.closest(".db-board-column")) {
        this.detachBoardDropHighlight();
        return;
      }
      const { candidates, zones } = this.collectBoardDropTargets();
      const key = resolveBoardColumnByPoint(candidates, event.clientX, event.clientY);
      const zone = key ? zones.get(key) : undefined;
      if (!zone) {
        // 两列间 gap 或无候选：不 preventDefault（gap 不可 drop），清除反馈。
        this.detachBoardDropHighlight();
        return;
      }
      event.preventDefault();
      this.showBoardDropHighlight(zone);
    });

    board.addEventListener("dragleave", () => this.detachBoardDropHighlight());

    board.addEventListener("drop", (event) => {
      if (this.actions.isReadOnly) return;
      const path = event.dataTransfer?.getData(CARD_MIME) || event.dataTransfer?.getData("text/plain");
      const row = path ? this.rowByPath.get(path) : undefined;
      if (!row) {
        this.detachBoardDropHighlight();
        return;
      }
      const { candidates, zones } = this.collectBoardDropTargets();
      const key = resolveBoardColumnByPoint(candidates, event.clientX, event.clientY);
      const zone = key ? zones.get(key) : undefined;
      if (!zone) {
        this.detachBoardDropHighlight();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.detachBoardDropHighlight();
      const fromGroup = event.dataTransfer?.getData(CARD_FROM_GROUP_MIME) || undefined;
      const fromSubgroup = event.dataTransfer?.getData(CARD_FROM_SUBGROUP_MIME) || undefined;
      // 拖到列下方空白：同分组保持原位，跨分组追加到目标分组末尾。
      const drop = resolveBoardContainerDropOrder({
        rows: zone.subgroup?.rows ?? zone.group.rows,
        draggedPath: row.file.path,
        fromGroup,
        groupKey: zone.group.key,
        fromSubgroup,
        subgroupKey: zone.subgroup?.key,
      });
      if (drop.keepInPlace) return;
      void this.moveCardAndOrder(
        row,
        groupField,
        zone.group.key,
        fromGroup,
        row.file.path,
        drop.order,
        subgroupField,
        zone.subgroup?.key,
        fromSubgroup
      );
    });
  }

  // Display the current target zone while the drag gesture is active.
  private showBoardDropHighlight(zone: { cardsEl: HTMLElement }): void {
    const highlightEl = zone.cardsEl.closest<HTMLElement>(".db-board-subgroup")
      || zone.cardsEl.closest<HTMLElement>(".db-board-column");
    // 同一 zone：仅刷新淡出 timer，不动 DOM。
    if (this.currentBoardDropZone === highlightEl) return;
    this.detachBoardDropHighlight();
    if (highlightEl) highlightEl.addClass("is-drop-target");
    this.currentBoardDropZone = highlightEl;
  }

  private detachBoardDropHighlight(): void {
    this.currentBoardDropZone?.removeClass("is-drop-target");
    this.currentBoardDropZone = null;
  }

  // 方案 B：拖拽开始时构建列名映射并创建跟随鼠标的浮动 preview。preview 与 dragover 监听
  // 全部走 window.activeDocument 以兼容 popout window；preview 是 renderer 级单例。
  private beginBoardDragPreview(config: ViewConfig, count = 1): void {
    // 兜底：若上一次拖拽异常残留（如 re-render 中途未触发 dragend），先清理。
    this.endBoardDragPreview();
    // 列名映射：key（group.key 或 group::subgroup）→ 该列显示名；子分组也映射到所属列名。
    const labels = new Map<string, string>();
    for (const group of this.boardGroups) {
      const label = formatGroupKeyDisplay(config, this.boardGroupField, group.key);
      labels.set(group.key, label);
      if (group.subgroups?.length) {
        for (const subgroup of group.subgroups) {
          labels.set(`${group.key}::${subgroup.key}`, label);
        }
      }
    }
    this.boardDragLabelByKey = labels;
    this.boardDragCount = Math.max(1, count);
    // Keep the preview in the database container so its styles and lifecycle stay scoped to this view.
    const previewHost = this.boardEl?.closest<HTMLElement>(".note-database-container") || window.activeDocument.body;
    this.boardDragPreview = previewHost.createDiv({ cls: "db-board-drag-group-preview is-hidden" });
    const stack = this.boardDragPreview.createSpan({ cls: "db-board-drag-stack", attr: { "aria-hidden": "true" } });
    for (let index = 0; index < Math.min(3, this.boardDragCount); index++) {
      stack.createSpan({ cls: "db-board-drag-stack-card" });
    }
    this.boardDragPreview.createSpan({ cls: "db-board-drag-count", text: t("drag.movingItems", { count }) });
    this.boundBoardDragOver = (event) => this.onBoardCardDragOver(event);
    window.activeDocument.addEventListener("dragover", this.boundBoardDragOver);
  }

  // 方案 B 热路径：实时命中当前列，更新 preview 文本与位置；未命中（gap / 光标不在本 board /
  // 同页其它数据库拖拽）隐藏，避免多实例 preview 同时显示串扰。始终显示当前命中列名（含同组）。
  private onBoardCardDragOver(event: DragEvent): void {
    const preview = this.boardDragPreview;
    if (!preview) return;
    const { candidates } = this.collectBoardDropTargets();
    const key = resolveBoardColumnByPoint(candidates, event.clientX, event.clientY);
    const label = key ? this.boardDragLabelByKey.get(key) : undefined;
    if (!label) {
      preview.addClass("is-hidden");
      return;
    }
    preview.removeClass("is-hidden");
    preview.empty();
    const stack = preview.createSpan({ cls: "db-board-drag-stack", attr: { "aria-hidden": "true" } });
    for (let index = 0; index < Math.min(3, this.boardDragCount); index++) {
      stack.createSpan({ cls: "db-board-drag-stack-card" });
    }
    preview.createSpan({ cls: "db-board-drag-label", text: label });
    preview.createSpan({ cls: "db-board-drag-count", text: t("drag.movingItems", { count: this.boardDragCount }) });
    // 跟随鼠标并偏移避开浏览器原生 drag ghost，夹取到视口内避免越界裁切。
    const offset = 16;
    const doc = window.activeDocument.documentElement;
    const maxX = doc.clientWidth - preview.offsetWidth - 8;
    const maxY = doc.clientHeight - preview.offsetHeight - 8;
    preview.setCssProps({
      left: `${Math.min(event.clientX + offset, Math.max(maxX, 0))}px`,
      top: `${Math.min(event.clientY + offset, Math.max(maxY, 0))}px`,
    });
  }

  // 方案 B：拖拽结束（dragend）或 render 幂等兜底时移除 preview 与 dragover 监听，防泄漏。
  private endBoardDragPreview(): void {
    if (this.boundBoardDragOver) {
      window.activeDocument.removeEventListener("dragover", this.boundBoardDragOver);
      this.boundBoardDragOver = undefined;
    }
    this.boardDragPreview?.remove();
    this.boardDragPreview = null;
    this.boardDragLabelByKey = new Map();
  }

  private clear(container: HTMLElement): void {
    container.querySelectorAll(".db-board").forEach((el) => el.remove());
    this.detachBoardDropHighlight();
  }
}
