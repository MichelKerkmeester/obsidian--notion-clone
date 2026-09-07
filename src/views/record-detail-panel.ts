// ───────────────────────────────────────────────────────────────────
// MODULE:    record-detail-panel
// COMPONENT: floating editable panel that expands a calendar/timeline
//            event card into its full field list
// ───────────────────────────────────────────────────────────────────
//
// Only one panel may be open at a time (module-level `currentPanel`),
// closed and reopened rather than reused, since each open call can
// target a different row and reusing DOM risks stale listeners. Uses a
// lightweight close scheme (deferred outside-mousedown + Escape + resize)
// instead of `installPopoverAutoClose`, because that helper's semantics
// are "close after idle timeout," which does not fit a panel meant to
// stay open indefinitely for inline editing.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, Component, MarkdownRenderer } from "obsidian";
import { isObsidianTagsKey, toMultiSelectValuesForKey } from "../data/column-types";
import { getColumnDisplayType, isDerivedColumn } from "../data/column-display";
import { getFileFieldFixedType, getRowFileFieldValue, isFileFieldKey, isReadonlyFileField } from "../data/file-fields";
import { isImeComposing } from "../data/keyboard-utils";
import { ColumnDef, RowData, ViewConfig } from "../data/types";
import { resolveTitleFieldDisplay } from "../data/title-field-display";
import { t } from "../i18n";
import { isElement } from "./dom-guards";
import { setFieldTooltip } from "./field-tooltip";
import { getFieldWidth } from "./column-width";
import { markNoteHoverLink } from "./hover-link-preview";
import { isMobileBottomSheet, positionToolbarPopover, releasePopoverPosition } from "./popover-position";
import type { RecordSurfacePlacement } from "./record-open-target";
import { renderCardField } from "./card-field-renderer";
import { applySheetChrome, attachSheetDragToDismiss } from "./mobile-bottom-sheet";
import { overlayStack } from "./overlay-stack";
import { mountNoteBodyRegion } from "./note-body-region";
import type { NoteBodyRegion } from "./note-body-region";
import { trapFocus } from "./interaction-scope";
import { openExternalUrl } from "./open-external";
import { buildDesktopRecordHeader } from "./record-surface/record-header";
import { getPropertyEmptyPrompt } from "./record-surface/property-row";
import { createHiddenPropertiesGroup, type HiddenGroupRow, type HiddenPropertiesGroupHandle } from "./record-surface/hidden-properties";
import { renderPropertyTypeIcon } from "./property-type-icon";

/**
 * 日历 / 时间线事件卡片「展开为可编辑浮动面板」。
 *
 * 点击事件卡片时，在卡片附近浮出一个记录详情面板：列出该记录的全部可见列，
 * 每个字段点击进入内联编辑（与看板卡片点击字段编辑同款体验，复用 CellRenderer.startEdit）。
 * 面板底部提供「打开笔记」按钮；原打开文件入口保留在右键菜单与面板按钮。
 *
 * 设计要点：
 * - 定位复用 positionToolbarPopover（视口夹取 / 翻转 / 容器内随滚动）。
 * - 关闭采用轻量模式（仿 CellRenderer.editOptionPopover）：延后注册的 outside-pointerdown +
 *   Esc + 容器滚动/视口 resize 即关。pointerdown 同时覆盖鼠标与触摸，手机端点击外部才能关闭
 *   （mousedown 在触摸屏不触发）。不用 installPopoverAutoClose（其为「空闲超时关」语义）。
 * - 移动端（is-phone）由 positionToolbarPopover 转为底部抽屉：抓手可向下拖拽关闭，标题栏常驻
 *   关闭按钮（复用 obnotion-cell-edit-close）。桌面端保持锚定面板不变。
 * - 面板挂在 .obnotion-container 内且不加 transform/filter，确保字段编辑时子气泡
 *   （obnotion-cell-option-popover 等）相对同一容器 absolute 定位正确。
 * - z-index 999：低于子编辑气泡（1000–1002），子气泡浮在面板之上。
 */

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface RecordDetailActions {
  editCell: (target: HTMLElement, row: RowData, col: ColumnDef, event?: MouseEvent) => void;
  saveCellValue?: (row: RowData, col: ColumnDef, value: number) => void | Promise<void | boolean>;
  editFileName?: (target: HTMLElement, row: RowData, currentName: string) => void;
  showColumnMenu?: (event: MouseEvent, col: ColumnDef, anchorEl: HTMLElement) => void;
  openRow: (row: RowData) => void;
  renderRecordIcon?(parent: HTMLElement, row: RowData, config: ViewConfig, compact?: boolean): HTMLElement | null;
  applyConditionalFormat?(element: HTMLElement, row: RowData, config: ViewConfig, targetField?: string): void;
  /** The record's markdown body. Absent means the panel shows properties only, as it always did. */
  readNoteBody?: (row: RowData) => Promise<string>;
  /** Persist a new body. Serialization against the frontmatter writes is the implementer's job. */
  saveNoteBody?: (row: RowData, body: string) => void | Promise<void>;
  /** Backs the hidden-properties group's eye toggle. Absent (the embedded read-only preview) means
   *  the toggle stays inert — there is no view-config mutation a read-only surface may make. */
  setColumnVisible?: (col: ColumnDef, visible: boolean) => void;
  /** Backs a section's bulk link. Falls back to one `setColumnVisible` call per column when absent. */
  setColumnsVisible?: (changes: Array<{ col: ColumnDef; visible: boolean }>) => void;
  /** Opens the add-property picker, anchored on the trailing row. Absent means no row is drawn —
   *  the affordance needs a picker host to open onto. */
  addProperty?: (anchorEl: HTMLElement) => void;
  isReadOnly?: boolean;
}

export interface OpenRecordDetailOptions {
  /** 被点击的事件卡片，作为定位锚点。 */
  anchorEl: HTMLElement;
  /** 面板挂载宿主（传容器的 obnotion-container 元素）。 */
  host: HTMLElement;
  /**
   * How the panel takes its position. Defaults to `anchored`, which is what every affordance with
   * an element to point at wants.
   *
   * `docked` is for the affordances that have no such element — a menu item, a card's open button,
   * an open action inside the panel itself. They used to pass the host container as the anchor, and
   * a container fills its pane, so the anchored arithmetic found no room beside it and pinned a
   * content-height panel to the top of the viewport. The anchor is still passed for focus return
   * and outside-press containment; only the placement changes.
   */
  placement?: RecordSurfacePlacement;
  row: RowData;
  /** 调用方算好的可见列。 */
  columns: ColumnDef[];
  /** The view's full column set, order included — the peek's own `allColumns`, same shape. The
   *  hidden group's population is this set's complement against `columns`, not an empty-value
   *  scan, so the caller must pass every column the view knows about rather than only the ones
   *  it currently shows. */
  allColumns: ColumnDef[];
  config: ViewConfig;
  app: App;
  actions: RecordDetailActions;
}

interface ActivePanel {
  filePath: string;
  close: () => void;
  refreshFields: (row: RowData) => void;
}

// ───────────────────────────────────────────────────────────────────
// 3. STATE
// ───────────────────────────────────────────────────────────────────

let currentPanel: ActivePanel | null = null;

const RECORD_DETAIL_CHILD_POPOVER_SELECTOR = [
  ".obnotion-cell-edit-popover",
  ".obnotion-cell-option-popover",
  ".obnotion-cell-date-popover",
  ".obnotion-color-picker-popup",
  ".obnotion-dropdown-popover",
  ".obnotion-icon-picker-popover",
].join(", ");

function isRecordDetailChildPopoverTarget(target: EventTarget | null): boolean {
  return isElement(target) && Boolean(target.closest(RECORD_DETAIL_CHILD_POPOVER_SELECTOR));
}

function isBodyEditorTarget(target: EventTarget | null): boolean {
  return isElement(target) && Boolean(target.closest(".obnotion-record-detail-body-editor"));
}

// ───────────────────────────────────────────────────────────────────
// 4. PUBLIC API
// ───────────────────────────────────────────────────────────────────

/** 关闭当前展开的记录详情面板（若存在）。供切库 / 视图 re-render 调用，避免孤儿 listener。 */
export function closeRecordDetailPanel(): void {
  currentPanel?.close();
}

/** 当前展开面板的记录路径（无则 null）。 */
export function getOpenRecordDetailPath(): string | null {
  return currentPanel?.filePath ?? null;
}

/** 视图 re-render 后刷新面板：同记录则局部刷新字段（常驻编辑），否则（记录被筛掉/切换）关闭。 */
export function refreshRecordDetailPanel(newRow: RowData): void {
  if (currentPanel && currentPanel.filePath === newRow.file.path) {
    currentPanel.refreshFields(newRow);
  } else {
    closeRecordDetailPanel();
  }
}

export function openRecordDetailPanel(opts: OpenRecordDetailOptions): void {
  // 互斥：先关旧面板
  closeRecordDetailPanel();

  const { anchorEl, host, row, columns, allColumns, config, app, actions, placement = "anchored" } = opts;

  // 记录从日历 overflow popover 打开时，定位必须先使用仍连接且可见的事件锚点。
  // 定位完成后只隐藏 overflow，不能 remove：CalendarRenderer 会保留节点引用供
  // “还有 N 条”再次打开；remove 会留下 detached 引用，使后续 hover/click 无响应。
  const calendarPopovers = Array.from(
    host.querySelectorAll<HTMLElement>(".obnotion-calendar-day-popover, .obnotion-calendar-week-allday-popover")
  );

  const panel = host.createDiv({ cls: "obnotion-record-detail-panel" });
  panel.tabIndex = -1;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");

  // 关闭逻辑（先定义，renderContent 的「打开笔记」按钮复用 close）
  let closed = false;
  let removeFocusTrap: () => void = () => undefined;
  let removeSheetDrag: () => void = () => undefined;
  // The body is read once for the record that was opened, never for the rows merely listed behind
  // it, so a file read never lands in the row pipeline.
  let bodyRegion: NoteBodyRegion | null = null;
  let bodyText: string | null = null;
  let resumeCaret: number | null = null;
  // Loaded, not merely constructed. `MarkdownRenderer.render` hangs the render children that drive
  // embeds and transclusions off this component, and an unloaded parent never loads them.
  const bodyLifetime = actions.readNoteBody ? new Component() : null;
  bodyLifetime?.load();
  // Outlives renderContent the same way bodyText does: a field-commit refresh rebuilds every
  // field, and a toggle held only in the DOM would collapse itself back on the very next one.
  const hiddenPropertiesGroup: HiddenPropertiesGroupHandle = createHiddenPropertiesGroup({
    groupClass: "obnotion-record-detail-hidden-group",
    toggleClass: "obnotion-record-detail-hidden-toggle",
    fieldsClass: "obnotion-record-detail-hidden-fields",
    expandedClass: "is-expanded",
    sectionClass: "obnotion-record-detail-hidden-section",
    sectionHeaderClass: "obnotion-record-detail-hidden-section-header",
    sectionTitleClass: "obnotion-record-detail-hidden-section-title",
    bulkLinkClass: "obnotion-record-detail-hidden-bulk-link",
    rowClass: "obnotion-record-detail-hidden-row",
    dragHandleClass: "obnotion-record-detail-hidden-drag",
    dragHandleTitle: t("panel.dragToSort"),
    typeClass: "obnotion-record-detail-hidden-type",
    nameWrapClass: "obnotion-record-detail-hidden-name-wrap",
    nameClass: "obnotion-record-detail-hidden-name",
    eyeClass: "obnotion-record-detail-hidden-eye",
    chevronClass: "obnotion-record-detail-hidden-chevron",
    shownSectionTitle: t("panel.shownSection"),
    hiddenSectionTitle: t("panel.hiddenSection"),
    hideAllLabel: t("panel.hideAllProperties"),
    showAllLabel: t("panel.showAllProperties"),
    label: (count) => t("panel.hiddenProperties", { count: String(count) }),
  });
  // Local, mutable membership — updated the instant an eye toggles, independent of the outer
  // view's own refresh cycle (which arrives later, through `refreshFields`, and re-derives the
  // same state from `opts.columns`/`opts.allColumns`; those two stay static for this panel's
  // whole lifetime, and are read only to seed this set once).
  const localVisibleKeys = new Set(columns.map((col) => col.key));
  const close = (): void => {
    if (closed) return;
    closed = true;
    bodyRegion?.destroy();
    bodyRegion = null;
    bodyLifetime?.unload();
    removeFocusTrap();
    removeSheetDrag();
    // Unwind the sheet before dropping the node. The backdrop is a body-level sibling, not a child,
    // so removing the panel alone leaves the whole app dimmed with nothing on top of it — the
    // chrome has to be taken off the way it was put on.
    applySheetChrome(panel, false);
    // Before the node goes, not after: the reposition loop only notices a disconnected panel when it
    // next runs, so a close with no resize behind it leaves this sheet's viewport handlers
    // registered until some unrelated event fires them.
    releasePopoverPosition(panel);
    panel.remove();
    window.activeDocument.removeEventListener("pointerdown", onOutside, true);
    window.activeDocument.removeEventListener("keydown", onKeydown, true);
    window.removeEventListener("resize", onResize);
    if (currentPanel?.close === close) currentPanel = null;
    if (anchorEl.isConnected) anchorEl.focus({ preventScroll: true });
  };
  const onOutside = (event: PointerEvent): void => {
    const target = event.target as Node | null;
    if (target && (panel.contains(target) || anchorEl.contains(target))) return;
    // 字段编辑器挂在 host/body，而不是详情 panel 内；它们属于详情面板的子交互，
    // 不能被误判成 outside click。该集合必须覆盖所有 CellRenderer 编辑表面。
    if (isRecordDetailChildPopoverTarget(event.target)) return;
    // A press inside a sheet stacked above this panel belongs to that sheet, not to the app behind
    // it. The named set above predates the stack and can only cover the children someone listed;
    // asking the stack covers every child, including the ones added after this line was written.
    if (overlayStack.isInsideSurfaceAbove(panel, target)) return;
    close();
  };
  const onKeydown = (event: KeyboardEvent): void => {
    if (isImeComposing(event)) return;
    if (event.key === "Escape") {
      // 嵌套编辑器拥有第一层 Escape：先关闭/取消编辑器，详情面板继续保留。
      if (isRecordDetailChildPopoverTarget(event.target)) return;
      // The body editor is a child of the panel rather than a popover beside it, so it needs
      // naming here too. This listener is registered in the capture phase, which runs before the
      // textarea's own handler — stopping propagation down there could never have reached it.
      if (isBodyEditorTarget(event.target)) return;
      // 焦点留在触发按钮时（如记录图标按钮打开 IconPickerPopover），event.target 不在白名单内。
      // 收窄到图标/颜色选择器（会留焦点的嵌套浮层），避免其他位置同类浮窗误命中。
      if (window.activeDocument.querySelector(".obnotion-icon-picker-popover, .obnotion-color-picker-popup")) return;
      event.preventDefault();
      close();
    }
  };
  // The viewport this panel was placed against. A resize is only worth escaping if the geometry
  // the placement depended on actually changed, and this is what that is compared to.
  let placedWidth = window.innerWidth;

  const onResize = (): void => {
    // A software keyboard appearing resizes the window on some platforms, and this listener's job
    // is to dismiss a panel whose anchor has moved out from under it. Those two collide the moment
    // the body becomes editable: the sheet would close on the first tap into the editor, on exactly
    // the surface the editor exists for. The sheet re-places itself against the keyboard inset
    // already, so there is nothing here for it to escape.
    if (bodyRegion?.isEditing()) return;

    // The same collision, one layer wider. Guarding only the body editor left every OTHER way a
    // keyboard opens — a field editor, a rename, a search box — closing the sheet on the platforms
    // that report a keyboard as a window resize. The two events are told apart by what changed
    // rather than by which surface has focus: a software keyboard takes height and leaves the width
    // alone, while a rotation or a window drag moves the width. So on a phone sheet a
    // width-preserving resize is a keyboard, and the sheet stays and re-places itself against the
    // inset; anything that moves the width is a real reflow the panel cannot survive anchored.
    //
    // Restricted to the sheet presentation deliberately. A desktop panel is anchored to an element
    // rather than to the floor, and a vertical-only window drag genuinely does move its anchor out
    // from under it — there, closing is still the right answer.
    if (isMobileBottomSheet(window.activeDocument) && window.innerWidth === placedWidth) return;
    placedWidth = window.innerWidth;
    close();
  };

  /**
   * Take the body region down, keeping whatever is in it.
   *
   * A view re-render empties the panel, which would otherwise destroy a textarea the user is
   * typing into — losing the uncommitted text and the caret with it. That is the same defect the
   * grab bar and the drag gesture were both fixed for on this surface: a child destroyed by a
   * refresh that does not know it is there. Here the draft outlives the node.
   */
  const teardownBody = (): void => {
    if (!bodyRegion) return;
    if (bodyRegion.isEditing()) resumeCaret = bodyRegion.caret();
    bodyText = bodyRegion.draft();
    bodyRegion.destroy();
    bodyRegion = null;
  };

  /**
   * Where the properties and the body live.
   *
   * A region rather than the panel, because on a phone the panel must not be the thing that
   * scrolls: the grab bar and the header are its children, and a panel that scrolls carries both
   * off the screen on any record taller than the sheet's cap. Resolved on each call instead of
   * captured, since a view re-render rebuilds this node while the closures around it survive.
   */
  const contentHost = (): HTMLElement =>
    panel.querySelector<HTMLElement>(".obnotion-record-detail-scroll") ?? panel;

  /** Mount the body under the properties, resuming an interrupted edit where it left off. */
  const mountBody = (r: RowData): void => {
    const save = actions.saveNoteBody;
    if (bodyText === null || closed || !bodyLifetime) return;
    bodyRegion = mountNoteBodyRegion({
      parent: contentHost(),
      body: bodyText,
      readOnly: actions.isReadOnly || !save,
      placeholder: t("panel.noteBodyPlaceholder"),
      renderMarkdown: (target, markdown) => {
        void MarkdownRenderer.render(app, markdown, target, r.file.path, bodyLifetime);
      },
      onCommit: (next) => {
        bodyText = next;
        void save?.(r, next);
      },
    });
    if (resumeCaret === null) return;
    bodyRegion.beginEdit(resumeCaret);
    resumeCaret = null;
  };

  /** Read the body for the opened record. Skipped while editing, so a refresh cannot clobber a draft. */
  const loadBody = (r: RowData): void => {
    const read = actions.readNoteBody;
    if (!read || bodyRegion?.isEditing()) return;
    void read(r).then((text) => {
      if (closed || bodyRegion?.isEditing() || text === bodyText) return;
      // Teardown first. It carries the mounted region's own draft back into bodyText, so assigning
      // the freshly read text before it would hand the file's contents straight back to the value
      // it was meant to replace.
      teardownBody();
      bodyText = text;
      mountBody(r);
    }).catch((err) => {
      console.error("Obnotion: failed to read the record's note body", err);
    });
  };

  // 渲染面板内容（title + fields + footer）；抽成函数以支持 re-render 后局部刷新（常驻编辑）
  const renderContent = (r: RowData): void => {
    teardownBody();
    panel.empty();
    // Put the sheet's grab bar back, because emptying the panel just threw it away.
    //
    // The bar is chrome, added as a child of this panel by the sheet module, and this function
    // owns the panel's children — so a refresh destroys a node it did not create and cannot see.
    // Every view re-render calls this, which means a metadata resolve or a single field edit was
    // enough to leave the sheet with no bar to grab and no visible affordance to aim at.
    // Re-applying is idempotent and only fires once the surface is already a sheet, so the first
    // render and every desktop render are untouched.
    if (panel.hasClass("obnotion-mobile-bottom-sheet")) applySheetChrome(panel, true);
    const explicitTitleField = getRecordEventTitleField(config);
    const title = resolveTitleFieldDisplay(r, config, explicitTitleField);
    panel.setAttribute("aria-label", title.text || r.file.basename);
    const titleField = title.field || "file.name";
    // 标题区（对齐事件卡片标题）+ 右上角「打开笔记」按钮（复用看板卡片 obnotion-board-card-open 样式）
    const editFileName = titleField === "file.name" ? actions.editFileName : undefined;
    buildDesktopRecordHeader({
      parent: panel,
      title: title.text,
      titleIsEmpty: title.isEmpty,
      renderIcon: (headerEl) => actions.renderRecordIcon?.(headerEl, r, config),
      decorateTitle: (titleEl) => {
        markNoteHoverLink(titleEl, r.file.path, r.file.path);
        actions.applyConditionalFormat?.(titleEl, r, config, titleField);
      },
      // 仅 file.name 标题可双击重命名；其它字段标题只读（用字段编辑改值）
      rename: editFileName && !actions.isReadOnly ? { onRename: (titleEl) => editFileName(titleEl, r, title.text) } : undefined,
      onOpen: () => {
        actions.openRow(r);
        close();
      },
      // 常驻关闭按钮：桌面端 CSS 隐藏（保持锚定面板原貌），移动端底部抽屉显示，触摸可点关闭。
      onClose: () => close(),
    });
    // 字段列表（跳过 titleField；空的可见字段按 showEmptyFields 决定是否渲染，不再归入隐藏分组——
    // 该分组现在持有的是视图中被隐藏的列，与看板卡片、peek 一致）
    // The scroll region, holding everything below the header. See `contentHost`.
    const scrollEl = panel.createDiv({ cls: "obnotion-record-detail-scroll" });
    const fieldsEl = scrollEl.createDiv({ cls: "obnotion-record-detail-fields" });
    // `allColumns` filtered through the live, locally-owned membership rather than through
    // `columns` itself — the eye toggle below mutates this set directly, so a field it just
    // moved shows up here on the very next `renderContent` call rather than waiting on whatever
    // the outer view's own refresh cycle recomputes later.
    const shownColumns = allColumns.filter((col) => col.key !== titleField && localVisibleKeys.has(col.key));
    // The peek's own complement (`table-record-peek.ts`'s `hiddenProperties`): every column the
    // view does not currently show, minus a derived or read-only column with nothing in it — an
    // empty rollup hidden from view is not a field worth recovering, on either surface.
    const hiddenFieldColumns: ColumnDef[] = allColumns.filter((col) => {
      if (col.key === titleField || localVisibleKeys.has(col.key)) return false;
      const value = getRecordCellValue(r, col);
      return !(isEmptyValue(value) && (isReadonlyFileField(col.key) || isDerivedColumn(col)));
    });
    for (const col of shownColumns) {
      const value = getRecordCellValue(r, col);
      const displayType = getRecordDisplayType(config, col);
      const empty = isEmptyValue(value) && displayType !== "checkbox";
      // An empty visible field without the switch on: the board card's own rule for the same
      // state is to skip the field rather than park it — the hidden group holds a different
      // population now, not a second home for this one.
      if (empty && config.showEmptyFields !== true) continue;
      renderRecordField(fieldsEl, r, col, config, app, actions);
    }
    if (actions.addProperty) {
      const addProperty = actions.addProperty;
      const addRow = scrollEl.createDiv({ cls: "obnotion-record-detail-add-row" });
      const addButton = addRow.createEl("button", { cls: "obnotion-record-detail-add-button", attr: { type: "button" } });
      addButton.createSpan({ text: `+ ${t("panel.addColumn")}` });
      addButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        addProperty(addButton);
      });
    }
    const toggleColumnVisible = (col: ColumnDef, visible: boolean): void => {
      if (visible) localVisibleKeys.add(col.key); else localVisibleKeys.delete(col.key);
      actions.setColumnVisible?.(col, visible);
      renderContent(r);
    };
    const bulkToggle = (cols: readonly ColumnDef[], visible: boolean): void => {
      for (const col of cols) {
        if (visible) localVisibleKeys.add(col.key); else localVisibleKeys.delete(col.key);
      }
      if (actions.setColumnsVisible) actions.setColumnsVisible(cols.map((col) => ({ col, visible })));
      else for (const col of cols) actions.setColumnVisible?.(col, visible);
      renderContent(r);
    };
    // The title's own column, if the schema carries one (most do — the title field is usually a
    // real column, just rendered in the header rather than the field list). A title field with no
    // matching column entry falls back to its key, the same way every other unlabelled row would.
    const titleColumn: ColumnDef = allColumns.find((col) => col.key === titleField) ?? { key: titleField, label: titleField, type: "text" };
    const shownRows: HiddenGroupRow<ColumnDef>[] = [
      { item: titleColumn, key: titleColumn.key, label: titleColumn.label || titleColumn.key, visible: true, eyeDisabled: true, renderTypeIcon: (parent) => renderPropertyTypeIcon(parent, titleColumn, "obnotion-record-detail-hidden-type-icon") },
      ...shownColumns.map((col): HiddenGroupRow<ColumnDef> => ({
        item: col, key: col.key, label: col.label || col.key, visible: true,
        renderTypeIcon: (parent) => renderPropertyTypeIcon(parent, col, "obnotion-record-detail-hidden-type-icon"),
      })),
    ];
    const hiddenRows: HiddenGroupRow<ColumnDef>[] = hiddenFieldColumns.map((col) => ({
      item: col, key: col.key, label: col.label || col.key, visible: false,
      renderTypeIcon: (parent) => renderPropertyTypeIcon(parent, col, "obnotion-record-detail-hidden-type-icon"),
    }));
    hiddenPropertiesGroup.render(scrollEl, shownRows, hiddenRows, toggleColumnVisible, bulkToggle);
    // Last, so the body reads as the note under its properties rather than as another property.
    mountBody(r);
  };

  renderContent(row);
  loadBody(row);
  removeFocusTrap = trapFocus(panel);
  panel.focus?.({ preventScroll: true });
  // 定位（复用 positionToolbarPopover：挂载点选择 / 视口夹取 / 翻转 / 移动端留白）
  positionToolbarPopover(panel, anchorEl, {
    minWidth: 240,
    preferredWidth: 360,
    maxWidth: 420,
    align: "center",
    // The host, not the anchor: a dock is measured from the pane the panel belongs to.
    dockTo: placement === "docked" ? host : undefined,
  });
  // 移动端底部抽屉：positionToolbarPopover 已加 .obnotion-mobile-bottom-sheet 与抓手；接上向下拖拽关闭手势。
  if (panel.hasClass("obnotion-mobile-bottom-sheet")) removeSheetDrag = attachSheetDragToDismiss(panel, close);
  // positionToolbarPopover 会在下一帧复测一次；按注册顺序在其复测之后隐藏来源
  // overflow，既保留正确锚点位置，也避免详情面板与事件列表继续层叠显示。
  window.requestAnimationFrame(() => {
    calendarPopovers.forEach((popover) => {
      if (popover.isConnected) popover.addClass("is-hidden");
    });
  });

  // 延后注册 pointerdown，避免触发打开的那次点击冒泡立即关闭面板。pointerdown 覆盖鼠标与触摸。
  window.setTimeout(() => window.activeDocument.addEventListener("pointerdown", onOutside, true), 0);
  window.activeDocument.addEventListener("keydown", onKeydown, true);
  // 不监听滚动：面板 fixed，滚动视图不关闭；仅 resize 关闭（视口变化重定位不划算）
  window.addEventListener("resize", onResize);

  currentPanel = {
    filePath: row.file.path,
    close,
    refreshFields: (newRow: RowData) => {
      renderContent(newRow);
      // Picks up a body edited in Obsidian while the panel was open. `loadBody` declines while the
      // editor is active, so a refresh arriving mid-sentence does not overwrite what is being typed.
      loadBody(newRow);
    },
  };
}

// ───────────────────────────────────────────────────────────────────
// 5. FIELD RENDERING
// ───────────────────────────────────────────────────────────────────

/** 渲染单个字段行（label + 值 + 点击编辑绑定）。 */
function renderRecordField(
  parent: HTMLElement,
  row: RowData,
  col: ColumnDef,
  config: ViewConfig,
  app: App,
  actions: RecordDetailActions,
): void {
  const value = getRecordCellValue(row, col);
  const displayType = getRecordDisplayType(config, col);
  const empty = isEmptyValue(value) && displayType !== "checkbox";
  const displayValue = empty ? getEmptyDisplayValue(displayType) : value;

  const field = renderCardField({
    app, row, col, config, value: displayValue, displayType, empty,
    fieldClass: "obnotion-record-detail-field", valueClass: "obnotion-board-card-value", labelClass: "obnotion-record-detail-field-label",
    badgesClass: "obnotion-board-card-badges", linkClass: "obnotion-board-card-link", fieldWidth: getFieldWidth(config, col),
    wrap: col.wrap, readOnly: actions.isReadOnly || isReadonlyFileField(col.key), splitOptionValue: true,
    applyConditionalFormat: actions.applyConditionalFormat,
    onEdit: (target, editRow, editCol, event) => actions.editCell(target, editRow, editCol, event),
    onNumberChange: (targetRow, targetCol, next) => actions.saveCellValue?.(targetRow, targetCol, next),
    onOpenTarget: (targetRow, target, external) => openTarget(app, targetRow, target, external),
    onShowColumnMenu: actions.showColumnMenu
      ? (event, menuCol, anchorEl) => actions.showColumnMenu?.(event, menuCol, anchorEl || fieldPlaceholder())
      : undefined,
  });
  if (actions.isReadOnly || isReadonlyFileField(col.key)) field.addClass("is-readonly");
  parent.appendChild(field);
}

function fieldPlaceholder(): HTMLElement {
  return window.activeDocument.body;
}

// ───────────────────────────────────────────────────────────────────
// 6. HELPERS
// ───────────────────────────────────────────────────────────────────

/** 事件标题字段：日历用 calendarTitleField，时间线用 timelineTitleField，对齐事件卡片。 */
function getRecordEventTitleField(config: ViewConfig): string | undefined {
  if (config.viewType === "calendar") return config.calendarTitleField;
  if (config.viewType === "timeline") return config.timelineTitleField;
  return config.titleField;
}

function getRecordCellValue(row: RowData, col: ColumnDef): unknown {
  if (isFileFieldKey(col.key)) return getRowFileFieldValue(row, col.key);
  if (col.type === "computed" || col.type === "rollup") {
    return row.computed[col.type === "computed" ? col.computedKey || col.key : col.key];
  }
  if (isObsidianTagsKey(col.key)) return toMultiSelectValuesForKey(col.key, row.frontmatter[col.key]);
  return row.frontmatter[col.key];
}

function getRecordDisplayType(config: ViewConfig, col: ColumnDef): ColumnDef["type"] {
  if (isFileFieldKey(col.key)) return getFileFieldFixedType(col.key);
  return getColumnDisplayType(col, config.schema.computedFields);
}

function isEmptyValue(value: unknown): boolean {
  return value == null || value === "" || (Array.isArray(value) && value.length === 0);
}

/**
 * A relation, select or multi-select field with no value gets a prompt naming the action
 * ("Select option", not "Empty"). Every other empty format keeps the plain word, since
 * clicking it still opens the same editor an occupied row opens; only what it reads changes.
 */
function getEmptyDisplayValue(displayType: ColumnDef["type"]): unknown {
  const prompt = getPropertyEmptyPrompt(displayType);
  if (prompt !== null) return displayType === "multi-select" ? [prompt] : prompt;
  if (displayType === "checkbox") return false;
  return t("common.empty");
}

/** 打开内部 / 外部链接（markdown 内联链接 / 图片点击复用）。 */
function openTarget(app: App, row: RowData, target: string, external: boolean): void {
  if (external) {
    openExternalUrl(target);
    return;
  }
  void app.workspace.openLinkText(target, row.file.path);
}
