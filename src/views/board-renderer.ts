// ───────────────────────────────────────────────────────────────────
// MODULE:    board-renderer
// COMPONENT: Kanban board view — columns, swimlanes, drag/drop reordering
// ───────────────────────────────────────────────────────────────────
//
// The board's own drag reordering resolves a drop through the shared
// resolveBoardContainerDropOrder helper, keeping same-group placement and
// cross-group moves on one code path rather than two.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, setIcon, setTooltip } from "obsidian";
import { isObsidianTagsKey, resolveOptionDisplay, toMultiSelectValuesForKey } from "../data/column-types";
import { STATUS_COLORS } from "../data/status-colors";
import { getColumnsInOrder } from "../data/column-config";
import { isExplicitlySorted } from "../data/manual-order";
import { getColumnDisplayType } from "../data/column-display";
import { getFileFieldFixedType, getRowFileFieldValue, isFileFieldKey } from "../data/file-fields";
import { isCoverImageBlocked, resolveCoverImage } from "../data/cover-image";
import { markCoverImageLoadError } from "../data/cover-wiring";
import { formatGroupKeyDisplay, isComputedGroupField, isUncategorizedGroupKey } from "../data/group-display";
import { renderGroupLabel } from "./group-label-renderer";
import { markNoteHoverLink } from "./hover-link-preview";
import { ColumnDef, CreateEntryPosition, NO_TITLE_FIELD, RowCreateContext, RowData, StatusColor, ViewConfig } from "../data/types";
import { t } from "../i18n";
import { isHTMLElement } from "./dom-guards";
import { setFieldTooltip } from "./field-tooltip";
import { EMPTY_ROWS, buildDuplicateNameIndex, getFileTitleDisplay } from "./file-title-display";
import { clampCardFieldWidth, getFieldWidth } from "./column-width";
import { renderGroupExpandControls } from "./group-expand-controls";
import { getGroupVisibleCount } from "../data/group-visibility";
import { isSameBoardGroup, resolveBoardContainerDropOrder } from "../data/board-container-drop";
import { resolveBoardCardFields } from "./board-card-fields";
import { resolveTitleFieldDisplay } from "../data/title-field-display";
import { isImeComposing } from "../data/keyboard-utils";
import { EmptyStateOptions, EmptyStateRenderer } from "./empty-state-renderer";
import { renderCardField, renderCardFieldValue } from "./card-field-renderer";
import { createCheckbox } from "./checkbox";
import { isTouchDevice } from "../data/touch-environment";
import { createOwnedMenuForEvent } from "./owned-menu";
import { openExternalUrl } from "./open-external";
import { buildSubtaskRelation } from "../data/subtask-relation";
import { planSubtaskMove } from "../data/subtask-serialize";
import type { SubtaskMovePlan, SubtaskMoveRequest, SubtaskRelation } from "../data/types";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const CARD_MIME = "application/x-note-database-card";
const CARD_FROM_GROUP_MIME = "application/x-note-database-card-from-group";
/** How close the pointer must sit to the container's scrollbar edge, in pixels, before the
 *  desktop scrollbar reveals from a hover. Anywhere else in the pane leaves it hidden — a reader
 *  scanning cards should not have a bar paint under their pointer just for being on the page. */
const SCROLLBAR_EDGE_HOVER_PX = 16;

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

export interface BoardSubtaskMove {
  request: SubtaskMoveRequest;
  plan: SubtaskMovePlan;
}

export interface BoardRendererActions {
  openRow(row: RowData): void;
  openRecordDetail?(anchorEl: HTMLElement, row: RowData): void;
  createEntry(defaults?: Record<string, unknown>, position?: CreateEntryPosition, context?: RowCreateContext): void;
  createGroup?(field: string, name: string, color: StatusColor): Promise<boolean>;
  updateGroup(row: RowData, field: string, value: string, fromValue?: string): Promise<void>;
  updateGroupOrder(field: string, order: string[]): void;
  hideGroup?(field: string, key: string): void;
  deleteGroup?(field: string, key: string): void;
  updateCardOrder(field: string, groupKey: string, paths: string[]): void;
  moveRowToPosition(movedPath: string, beforePath?: string, afterPath?: string, subtaskMove?: BoardSubtaskMove): void;
  moveRowWithGroupUpdatesAndPosition?(
    row: RowData,
    updates: Array<{ field: string; fromGroupKey: string; toGroupKey: string }>,
    beforePath?: string,
    afterPath?: string,
    movedPaths?: string[],
    subtaskMove?: BoardSubtaskMove,
  ): void | Promise<void>;
  moveRowsToPosition?(movedPaths: string[], beforePath?: string, afterPath?: string, subtaskMove?: BoardSubtaskMove): void;
  moveSubtask?(request: SubtaskMoveRequest, plan: SubtaskMovePlan): void | Promise<void>;
  /** Per-view collapse override for a row, layered over its own `collapsed` frontmatter default
   *  by `buildSubtaskRelation`. Returns `undefined` for a row the view has no override for. */
  isSubtaskCollapsed?(row: RowData): boolean | undefined;
  toggleSubtaskCollapsed?(row: RowData, collapsed: boolean): void | Promise<void>;
  getSelectedRows?(): RowData[];
  /** Lazy description source for the reference card layout: called after render,
   *  never during it, and the board re-renders once a body arrives. Absent in
   *  hosts that keep descriptions out of the row pipeline, which leaves the
   *  description slot empty — the same shape as the reference view's optional
   *  preview setting. */
  loadRowDescription?(row: RowData): Promise<string | undefined>;
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
  renderRecordIcon?(parent: HTMLElement, row: RowData, config: ViewConfig, compact?: boolean, force?: boolean): HTMLElement | null;
  renderGroupSummaries?(parent: HTMLElement, rows: RowData[], config: ViewConfig): void;
  applyConditionalFormat?(element: HTMLElement, row: RowData, config: ViewConfig, targetField?: string): void;
  readonly isReadOnly?: boolean;
  readonly hideCreateEntry?: boolean;
  readonly canReorderGroups?: boolean;
  confirmSortConflict?(): Promise<boolean>;
  clearSort?(): void;
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
  private subtaskRelation: SubtaskRelation | null = null;
  /** Basenames shared by more than one row, rebuilt whenever the row set is. */
  private duplicateNames: ReadonlySet<string> = new Set<string>();
  private emptyStateRenderer = new EmptyStateRenderer();
  /**
   * Whether this surface takes touch input, answered once per render.
   *
   * Every column and every card asks, and the answer cannot change part-way through a synchronous
   * render: the platform flags are constant, the pointer type is constant, and the pane cannot be
   * resized while the loop that fills it is still running. Asking per card made it a forced layout
   * inside a loop appending to the same container, so the browser reflowed the tree built so far
   * once per card and the total became superlinear in card count.
   *
   * It is measured on the container, not on `.db-kanban-board`. That element is `width:
   * max-content`, so it grows as each column is appended and a width read from it is a different
   * number on the first card than on the last — there is no single value to hoist. The container
   * is the pane, which is the width the touch threshold was written about.
   */
  private touchMode = false;
  /** The pre-change visible-column set (table hidden state plus the empty-value auto-hide),
   *  captured once per render so a view with no stored field list keeps rendering the same
   *  cards it did before the list existed, without re-scanning every row per card. Unset once
   *  a list is stored — the operator's list is the only input from then on. */
  private legacyVisibleColumnKeys?: Set<string>;
  /** Bodies hydrated lazily after the first render, keyed by row path. */
  private hydratedDescriptions = new Map<string, string>();
  /** Render arguments replayed once when a lazy description load lands. */
  private referenceRenderArgs?: { container: HTMLElement; config: ViewConfig; groups: BoardGroup[]; groupField: string };
  /** The scroll listener that reveals the horizontal bar, kept so a re-render can detach the
   *  previous one. The container outlives a render — every render would otherwise leave its
   *  listener behind and stack another timer on the same element. */
  private scrollbarRevealTeardown?: () => void;
  /** The view's visible card fields in the order the properties panel shows them,
   *  resolved once per render and shared by every card. */
  private referenceCardFields: ColumnDef[] = [];

  constructor(private app: App, private actions: BoardRendererActions) {}

  render(container: HTMLElement, config: ViewConfig, groups: BoardGroup[], groupField: string, emptyState?: EmptyStateOptions): void {
    this.clear(container);
    this.touchMode = isTouchDevice(container);
    this.rowByPath = new Map(groups.flatMap((group) => group.rows.map((row) => [row.file.path, row] as const)));
    this.subtaskRelation = buildSubtaskRelation([...this.rowByPath.values()], {
      isCollapsed: (row) => this.actions.isSubtaskCollapsed?.(row),
    });
    this.duplicateNames = buildDuplicateNameIndex([...this.rowByPath.values()]);
    const hiddenGroups = new Set(config.boardHiddenGroups?.[groupField] || []);
    groups = groups.filter((group) => !hiddenGroups.has(group.key));
    this.legacyVisibleColumnKeys = config.boardCardFields === undefined
      ? new Set(this.actions.getColumns(config).map((col) => col.key))
      : undefined;
    this.renderReferenceBoard(container, config, groups, groupField);
  }

  // ───────────────────────────────────────────────────────────────────
  // 4b. ANYTYPE KANBAN LAYOUT
  // ───────────────────────────────────────────────────────────────────
  //
  // The board matches Anytype's kanban element by element rather than
  // Project Manager's: a column strip with no background panel, a bordered
  // option chip for a header whose "..." and "+" controls reveal on hover
  // and stay permanent on touch, a card with property rows on one fixed
  // rhythm (no per-type dedicated slots), and a bordered "+" control below
  // the last card. The view's own configured card-field list still decides which properties
  // appear and in what order; this layout only decides how a row reads.

  private renderReferenceBoard(
    container: HTMLElement,
    config: ViewConfig,
    groups: BoardGroup[],
    groupField: string,
  ): void {
    this.referenceRenderArgs = { container, config, groups, groupField };
    // Resolved once per render, not per card: the card field list is a property of the view.
    this.referenceCardFields = resolveBoardCardFields(config, getColumnsInOrder(config), {
      groupField,
      subgroupField: config.boardSubgroupEnabled !== false && config.boardSubgroupField && config.boardSubgroupField !== groupField
        ? config.boardSubgroupField
        : undefined,
      visibleKeys: this.legacyVisibleColumnKeys,
    });
    container.addClass("db-kanban-view");
    // The card carries role="row" below; without a role="grid" ancestor that role has no grid to
    // pair with, which is an ARIA relationship the browser and assistive tech both expect intact.
    const board = container.createDiv({ cls: "db-kanban-board", attr: { role: "grid" } });
    // The column header shows its "..." and "+" only on hover on desktop and permanently on
    // touch, where there is no hover to reveal them from.
    board.toggleClass("is-touch", this.touchMode);
    // The scrollbars paint on three cues: an active scroll, or the pointer sitting over either
    // bar's own edge — not anywhere else in the pane, which would paint a bar under a reader who
    // is simply looking at cards. "While scrolling" needs a class an event can toggle, cleared a
    // moment after the last scroll so the bar does not linger once the reader has stopped; the
    // edge cue needs the same kind of class, since CSS alone cannot tell a bare `:hover` apart
    // from one confined to a 16px band along the container's own right and bottom edges. Both
    // listen on the container rather than the board: the container is the element that scrolls
    // and carries the bars, so the board never fires a scroll event to hear and is never the
    // element the pointer needs to be near. Touch has no such bar to reveal; it keeps the
    // platform's own overlay indicator.
    this.scrollbarRevealTeardown?.();
    this.scrollbarRevealTeardown = undefined;
    if (!this.touchMode) {
      let hideScrollbarTimer: number | undefined;
      const onScroll = () => {
        container.addClass("is-scrolling");
        window.clearTimeout(hideScrollbarTimer);
        hideScrollbarTimer = window.setTimeout(() => container.removeClass("is-scrolling"), 600);
      };
      container.addEventListener("scroll", onScroll, { passive: true });
      const onPointerMove = (event: Event) => {
        const { clientX, clientY } = event as PointerEvent;
        const rect = container.getBoundingClientRect();
        const nearRightEdge = rect.right - clientX <= SCROLLBAR_EDGE_HOVER_PX;
        const nearBottomEdge = rect.bottom - clientY <= SCROLLBAR_EDGE_HOVER_PX;
        container.toggleClass("is-edge-hover", nearRightEdge || nearBottomEdge);
      };
      const onPointerLeave = () => container.removeClass("is-edge-hover");
      container.addEventListener("pointermove", onPointerMove);
      container.addEventListener("pointerleave", onPointerLeave);
      this.scrollbarRevealTeardown = () => {
        container.removeEventListener("scroll", onScroll);
        container.removeEventListener("pointermove", onPointerMove);
        container.removeEventListener("pointerleave", onPointerLeave);
        window.clearTimeout(hideScrollbarTimer);
        container.removeClass("is-scrolling");
        container.removeClass("is-edge-hover");
      };
    }
    const rows: RowData[] = [];
    for (const group of groups) {
      this.renderReferenceColumn(board, config, group, groupField, rows);
    }
    void this.hydrateReferenceDescriptions(rows);
  }

  private renderReferenceColumn(
    board: HTMLElement,
    config: ViewConfig,
    group: BoardGroup,
    groupField: string,
    allRows: RowData[],
  ): void {
    const color = this.getReferenceGroupColor(config, groupField, group.key);
    const visibleRows = this.getVisibleSubtaskRows(group.rows);
    allRows.push(...visibleRows);

    const col = board.createDiv({ cls: "db-kanban-col", attr: { "data-status": group.key } });
    const header = col.createDiv({ cls: "db-kanban-col-header" });
    // At rest the header carries the option chip alone — a 1px border, the option's own tint
    // fill and darkened text. The chip reuses the same status-color vocabulary every option value
    // renders with elsewhere; only its hex pair is retinted, scoped to this view, because the
    // raw hue fails WCAG 1.4.3 as bare text in light theme.
    const chip = header.createSpan({ cls: "db-kanban-col-chip" });
    // A palette name paints through the retinted status-color class below; any other authored
    // color string (a custom hex/rgb value) has no bucket to retint, so it paints as an inline
    // style instead of a malformed class name.
    if (color) {
      if (STATUS_COLORS.includes(color as StatusColor)) chip.addClass(`status-color-${color}`);
      else chip.style.color = color;
    }
    chip.appendText(formatGroupKeyDisplay(config, groupField, group.key, { uncategorizedLabel: t("board.noValue") }));

    const controls = header.createDiv({ cls: "db-kanban-col-controls" });
    // Folds the "WIP counts" extension: the desktop header carries no record count, but the
    // phone board always shows one as plain text beside the label.
    if (this.touchMode) {
      controls.createSpan({ cls: "db-kanban-col-count", text: String(visibleRows.length) });
    }
    // Folds "group controls" and "touch menus": the same sort/hide/delete menu the extensions
    // layout already ships opens from this affordance, hover-revealed on desktop and permanent
    // on touch, matching the capture's own visibility split rather than a separate component.
    if (!this.actions.isReadOnly) {
      this.renderBoardGroupOptions(controls, config, groupField, group, "more-horizontal");
    }
    if (!this.actions.isReadOnly && !this.actions.hideCreateEntry && !isComputedGroupField(config, groupField)) {
      const addCard = controls.createEl("button", {
        cls: "db-kanban-col-add",
        attr: { type: "button", "aria-label": t("board.addCard"), title: t("board.addCard") },
      });
      setIcon(addCard, "plus");
      addCard.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.createEntryNearEnd({ [groupField]: group.key || "" }, visibleRows);
      };
    }

    const cardsEl = col.createDiv({ cls: "db-kanban-cards", attr: { "data-status": group.key } });
    this.attachReferenceDropHandlers(cardsEl, group, groupField);
    // The kanban page limit is 10, distinct from every other layout's own default; applied
    // locally rather than through the shared unlimited-by-default config field so no other
    // view's row limit moves.
    const boardConfig = config.groupRowLimit && config.groupRowLimit > 0 ? config : { ...config, groupRowLimit: 10 };
    const visibleCount = getGroupVisibleCount(boardConfig, groupField, group.key, visibleRows.length);
    if (visibleCount === 0) {
      // No reference capture holds an empty column. Design inferred: the shared empty-group
      // card the rest of the app already uses.
      const empty = this.emptyStateRenderer.renderCard(cardsEl, { reason: "empty-group" });
      empty.addClass("db-kanban-empty-slot");
    }
    for (const row of visibleRows.slice(0, visibleCount)) {
      this.renderReferenceCard(cardsEl, config, group, row, groupField);
    }
    renderGroupExpandControls(cardsEl, boardConfig, groupField, group.key, visibleRows.length, this.actions);
    if (!this.actions.isReadOnly && !this.actions.hideCreateEntry && !isComputedGroupField(config, groupField)) {
      // The "+ New" control sits 8px below the last card, in the same flex rhythm as the
      // inter-card gap — a bare "+" on desktop, a labelled row on touch.
      const newRecord = cardsEl.createEl("button", {
        cls: "db-kanban-new",
        attr: { type: "button", "aria-label": t("toolbar.new") },
      });
      setIcon(newRecord.createSpan({ cls: "db-kanban-new-icon" }), "plus");
      newRecord.createSpan({ cls: "db-kanban-new-label", text: t("toolbar.new") });
      newRecord.onclick = () => this.createEntryNearEnd({ [groupField]: group.key || "" }, visibleRows);
    }
  }

  /** Drag language copied from the reference column: a tint on the cards
   *  container, a live before/after preview while dragging, and a drop that
   *  resolves through the local path-keyed transaction (status once, then the
   *  host refreshes) instead of the reference's bare task id. */
  private attachReferenceDropHandlers(cardsEl: HTMLElement, group: BoardGroup, groupField: string): void {
    cardsEl.addEventListener("dragover", (event) => {
      if (this.actions.isReadOnly) return;
      if (!this.isCardDrag(event)) return;
      event.preventDefault();
      cardsEl.addClass("db-kanban-drop-target");
      const afterEl = getReferenceDragAfterElement(cardsEl, event.clientY);
      const dragging = cardsEl.querySelector(".db-kanban-card--dragging");
      if (dragging) {
        if (afterEl) cardsEl.insertBefore(dragging, afterEl);
        else cardsEl.appendChild(dragging);
      }
    });
    cardsEl.addEventListener("dragleave", () => {
      cardsEl.removeClass("db-kanban-drop-target");
    });
    cardsEl.addEventListener("drop", (event) => {
      if (this.actions.isReadOnly) return;
      event.preventDefault();
      cardsEl.removeClass("db-kanban-drop-target");
      const path = event.dataTransfer?.getData(CARD_MIME) || event.dataTransfer?.getData("text/plain") || "";
      if (!path) return;
      const row = this.rowByPath.get(path);
      if (!row) return;
      const fromGroup = event.dataTransfer?.getData(CARD_FROM_GROUP_MIME) || undefined;
      const drop = resolveBoardContainerDropOrder({
        rows: group.rows,
        draggedPath: path,
        fromGroup,
        groupKey: group.key,
        fromSubgroup: undefined,
        subgroupKey: undefined,
      });
      if (drop.keepInPlace) return;
      void this.moveCardAndOrder(row, groupField, group.key, fromGroup, path, drop.order);
    });
  }

  private renderReferenceCard(
    cards: HTMLElement,
    config: ViewConfig,
    group: BoardGroup,
    row: RowData,
    groupField: string,
  ): void {
    const subtaskNode = this.subtaskRelation?.nodes.get(row.file.path);

    const card = cards.createDiv({
      cls: "db-kanban-card",
      attr: {
        "data-task-id": row.file.path,
        "data-note-database-row-path": row.file.path,
        role: "row",
      },
    });
    card.draggable = !this.actions.isReadOnly && !this.touchMode;
    // The card, not the row alone: the record surface is placed against the element it was
    // opened from. Handed nothing to point at, the host falls back to the whole scrolling
    // container, which has no room above or below itself — so the panel renders as a clipped
    // sliver at the top of the window instead of beside the card.
    card.addEventListener("click", (event) => {
      // A property value can be a link or a checkbox; those act for themselves rather than
      // opening the record behind them.
      if (isHTMLElement(event.target) && event.target.closest("a, button, input, select, textarea")) return;
      if (this.actions.openRecordDetail) this.actions.openRecordDetail(card, row);
      else this.actions.openRow(row);
    });
    card.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      this.actions.showRowMenu?.(event, row);
    });
    if (card.draggable) {
      card.addEventListener("dragstart", (event) => {
        event.dataTransfer?.setData(CARD_MIME, row.file.path);
        event.dataTransfer?.setData(CARD_FROM_GROUP_MIME, group.key);
        event.dataTransfer?.setData("text/plain", row.file.path);
        card.addClass("db-kanban-card--dragging");
        // Not seen in any capture — no card mid-drag exists in the sweep. Design inferred: the
        // raised state paints first, then the card itself fades a tick later.
        window.setTimeout(() => card.addClass("db-kanban-card--drag-fade"), 0);
      });
      card.addEventListener("dragend", () => {
        card.removeClass("db-kanban-card--dragging");
        card.removeClass("db-kanban-card--drag-fade");
      });
    }

    // Folds the "covers" extension: the control (Cover: Select) is Anytype's, and it is off by
    // default, same as this — a mapped image field is the only way a cover renders.
    if (config.boardImageField) this.renderCover(card, config, row);

    const body = card.createDiv({ cls: "db-kanban-card-body" });

    // No Objects/Types data model exists here, so there is no literal "type name" to show in the
    // slot Anytype uses for one. The nearest thing this schema already tracks in that position —
    // a subtask's parent title — keeps its content and moves to the ordinary secondary rhythm
    // rather than a smaller breadcrumb.
    const parentTitle = subtaskNode && subtaskNode.parentId
      ? this.getReferenceRowTitle(config, this.rowByPath.get(subtaskNode.parentId))
      : undefined;

    const titleRow = body.createDiv({ cls: "db-kanban-card-title-row" });
    // The reference reserves the icon slot on every card, not only when a record-icon field is
    // mapped — `force` skips that gate here, so an unmapped card still gets the default glyph
    // renderRecordIcon already falls back to, rather than starting the title flush left.
    this.actions.renderRecordIcon?.(titleRow, row, config, true, true);
    titleRow.createSpan({ cls: "db-kanban-card-title", text: this.getReferenceRowTitle(config, row) });

    if (parentTitle) body.createDiv({ cls: "db-kanban-card-type", text: parentTitle });

    // Folded into the property rhythm rather than a dedicated clamped block: one line among the
    // rest, same pitch, same secondary grey, truncated to one line by CSS.
    const description = this.hydratedDescriptions.get(row.file.path);
    if (description) body.createDiv({ cls: "db-kanban-card-description", text: description });

    this.renderReferenceCardMeta(body, config, row, this.referenceCardFields);
  }

  /** The view's configured card fields, rendered values-only on one fixed rhythm — no per-type
   *  dedicated slots (time chip, avatar stack, progress bar, due chip) the way the Project
   *  Manager card carried them; every property is an ordinary row in the same order the
   *  properties panel lists them. */
  private renderReferenceCardMeta(body: HTMLElement, config: ViewConfig, row: RowData, columns: ColumnDef[]): void {
    if (columns.length === 0) return;
    const entries: HTMLElement[] = [];
    for (const col of columns) {
      const value = this.getCellValue(row, col);
      const displayType = this.getDisplayType(config, col);
      const empty = this.isEmptyValue(value) && displayType !== "checkbox";
      if (empty && !this.shouldShowEmptyField(config, col)) continue;
      const displayValue = empty ? this.getEmptyDisplayValue(col, displayType) : value;
      // Display-only: a click anywhere on this card opens the record, and an editable field
      // would swallow that click to start an inline edit instead.
      entries.push(this.renderCardFieldContent(row, col, config, displayValue, displayType, empty, true));
    }
    if (entries.length === 0) return;
    const meta = body.createDiv({ cls: "db-kanban-card-meta" });
    for (const entry of entries) meta.appendChild(entry);
  }

  private getReferenceRowTitle(config: ViewConfig, row: RowData | undefined): string {
    if (!row) return "";
    const titleField = this.getTitleField(config);
    const title = titleField ? resolveTitleFieldDisplay(row, config, titleField) : undefined;
    if (title && !title.isHidden) {
      return title.isFileTitle ? row.file.basename : title.text;
    }
    return row.file.basename;
  }

  /** The group's option color as a CSS value; undefined for uncategorized
   *  groups, which have no option to color from. */
  private getReferenceGroupColor(config: ViewConfig, field: string, key: string): string | undefined {
    const column = config.schema.columns.find((candidate) => candidate.key === field);
    const displayType = column ? getColumnDisplayType(column, config.schema.computedFields) : undefined;
    if (displayType !== "status" && displayType !== "select" && displayType !== "multi-select") return undefined;
    if (isUncategorizedGroupKey(key)) return undefined;
    return column ? resolveOptionDisplay(column, key).option?.color : undefined;
  }

  /** Lazy description hydration: bodies load after the first render, and the
   *  board re-renders once any of them arrive — the reference view's preview
   *  contract, driven by whatever host supplies the optional loader. */
  private async hydrateReferenceDescriptions(rows: RowData[]): Promise<void> {
    const actions = this.actions;
    if (!actions.loadRowDescription) return;
    const pending = rows.filter((row) => !this.hydratedDescriptions.has(row.file.path));
    if (pending.length === 0) return;
    let changed = false;
    await Promise.all(
      pending.map(async (row) => {
        const description = await actions.loadRowDescription?.(row);
        if (description && !this.hydratedDescriptions.has(row.file.path)) {
          this.hydratedDescriptions.set(row.file.path, description);
          changed = true;
        }
      }),
    );
    const args = this.referenceRenderArgs;
    if (changed && args) this.render(args.container, args.config, args.groups, args.groupField);
  }

  private canCreateGroup(config: ViewConfig, groupField: string): boolean {
    const column = config.schema.columns.find((candidate) => candidate.key === groupField);
    if (!column || column.type === "computed" || column.type === "rollup" || isObsidianTagsKey(column.key)) return false;
    const displayType = getColumnDisplayType(column, config.schema.computedFields);
    return displayType === "status" || displayType === "select" || displayType === "multi-select";
  }

  // `parent` is the header's name row, not the header itself: mounting the button beside the
  // group name keeps it inline with the text instead of parked at the far header edge.
  private renderBoardGroupOptions(parent: HTMLElement, config: ViewConfig, field: string, group: BoardGroup, icon = "more-vertical"): void {
    const button = parent.createEl("button", {
      cls: "db-board-column-options",
      attr: { type: "button", "aria-label": t("board.columnOptions"), title: t("board.columnOptions") },
    });
    setIcon(button, icon);
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


  private createEntryNearEnd(defaults: Record<string, unknown> | undefined, rows: RowData[]): void {
    this.actions.createEntry(defaults, this.getCreatePosition(rows));
  }

  private getVisibleSubtaskRows(rows: RowData[]): RowData[] {
    return rows.filter((row) => this.subtaskRelation?.nodes.get(row.file.path)?.visible !== false);
  }

  private getCreatePosition(rows: RowData[]): CreateEntryPosition | undefined {
    const last = rows[rows.length - 1];
    return last ? { afterPath: last.file.path } : undefined;
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
    const subtaskMove = this.getSubtaskMoveContext(movingPaths, position);
    if (groupUpdates.length > 0 && this.actions.moveRowWithGroupUpdatesAndPosition) {
      if (subtaskMove) {
        await this.actions.moveRowWithGroupUpdatesAndPosition(row, groupUpdates, position.before, position.after, movingPaths, subtaskMove);
      } else {
        await this.actions.moveRowWithGroupUpdatesAndPosition(row, groupUpdates, position.before, position.after, movingPaths);
      }
      return;
    }
    if (movingPaths.length > 1 && this.actions.moveRowsToPosition) {
      if (subtaskMove) this.actions.moveRowsToPosition(movingPaths, position.before, position.after, subtaskMove);
      else this.actions.moveRowsToPosition(movingPaths, position.before, position.after);
      return;
    }
    for (const update of groupUpdates) {
      await this.actions.updateGroup(row, update.field, update.toGroupKey, update.fromGroupKey);
    }
    if (subtaskMove) this.actions.moveRowToPosition(draggedPath, position.before, position.after, subtaskMove);
    else this.actions.moveRowToPosition(draggedPath, position.before, position.after);
  }

  private getSubtaskMoveContext(
    movingPaths: string[],
    position: { before?: string; after?: string },
  ): BoardSubtaskMove | undefined {
    if (movingPaths.length !== 1 || !this.actions.moveSubtask) return undefined;
    const childPath = movingPaths[0];
    const node = this.subtaskRelation?.nodes.get(childPath);
    if (!node || node.parentId === null || node.orphanParent) return undefined;
    const request: SubtaskMoveRequest = {
      childPath,
      newParentPath: node.parentId,
      beforePath: position.before,
      afterPath: position.after,
    };
    const plan = planSubtaskMove([...this.rowByPath.values()], request);
    return plan.ok ? { request, plan } : undefined;
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


  private isCardDrag(event: DragEvent): boolean {
    return Array.from(event.dataTransfer?.types || []).includes(CARD_MIME);
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
    displayOnly?: boolean,
  ): HTMLElement {
    const value = this.getCellValue(row, col);
    const displayType = resolvedDisplayType || this.getDisplayType(config, col);
    const empty = resolvedEmpty ?? (this.isEmptyValue(value) && displayType !== "checkbox");
    const displayValue = resolvedValue ?? (empty ? this.getEmptyDisplayValue(col, displayType) : value);
    return renderCardField({
      app: this.app, row, col, config, value: displayValue, displayType, empty,
      fieldClass: "db-board-card-field", valueClass: "db-board-card-value", labelClass: "db-board-card-field-label",
      badgesClass: "db-board-card-badges", linkClass: "db-board-card-link", fieldWidth: this.getCardFieldWidth(config, col),
      wrap: col.wrap, readOnly: displayOnly || this.actions.isReadOnly, applyConditionalFormat: this.actions.applyConditionalFormat,
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

  private clear(container: HTMLElement): void {
    container.querySelectorAll(".db-kanban-board").forEach((el) => el.remove());
    container.removeClass("db-kanban-view");
    // The container is the host's, not the board's — a listener left on it would keep firing for
    // whichever view takes the pane next.
    this.scrollbarRevealTeardown?.();
    this.scrollbarRevealTeardown = undefined;
  }
}

// ───────────────────────────────────────────────────────────────────
// 5. REFERENCE HELPERS (verbatim)
// ───────────────────────────────────────────────────────────────────
//
// The blocks below are copied from obsidian-pm's kanban sources. They carry
// the MIT license notice of that project:
//
// MIT License
// Copyright (c) 2026 Stepan Kropachev and dotpm contributors
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

/** Adapted from obsidian-pm KanbanColumn.ts:118-131 (MIT, notice above) for the Anytype card
 *  class names this board now constructs. */
function getReferenceDragAfterElement(container: HTMLElement, y: number): Element | null {
  const cards = Array.from(container.querySelectorAll(".db-kanban-card:not(.db-kanban-card--dragging)"));
  let closest: Element | null = null;
  let closestOffset = Number.NEGATIVE_INFINITY;
  for (const card of cards) {
    const box = card.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closest = card;
    }
  }
  return closest;
}
