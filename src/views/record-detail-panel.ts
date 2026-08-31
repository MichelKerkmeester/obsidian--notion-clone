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

import { App, Component, MarkdownRenderer, setIcon, setTooltip } from "obsidian";
import { isObsidianTagsKey, resolveOptionDisplay, toBooleanValue, toMultiSelectValuesForKey } from "../data/column-types";
import { getColumnDisplayType, getNumberDisplayStyle } from "../data/column-display";
import { formatDateValueDisplay, formatDateTimeValueDisplay } from "../data/date-time-format";
import { getFileFieldFixedType, getRowFileFieldValue, isFileFieldKey, isReadonlyFileField } from "../data/file-fields";
import { isImeComposing } from "../data/keyboard-utils";
import { safeString } from "../data/safe-string";
import { parseTextLink } from "../data/text-link";
import { assembleSchemeLinkTarget, isTextLinkScheme } from "../data/text-link-scheme";
import { ColumnDef, RowData, ViewConfig } from "../data/types";
import { resolveTitleFieldDisplay } from "../data/title-field-display";
import { t } from "../i18n";
import { isElement, isHTMLElement } from "./dom-guards";
import { setFieldTooltip } from "./field-tooltip";
import { renderSpecialFileFieldValue, shouldRenderSpecialFileField } from "./file-field-renderer";
import { renderProgress, renderProgressRing, renderRating } from "./number-display-renderer";
import { renderRelationValue } from "./relation-value-renderer";
import { getFieldWidth } from "./column-width";
import { parseInlineMarkdown } from "../data/inline-markdown";
import { renderInlineMarkdown, resolveInlineImageSrc, valueToTooltip } from "./inline-markdown-renderer";
import { markNoteHoverLink } from "./hover-link-preview";
import { positionToolbarPopover } from "./popover-position";
import { renderDelayedExternalLink } from "./cell-renderer";
import { renderCardField } from "./card-field-renderer";
import { createCheckbox } from "./checkbox";
import { applySheetChrome, attachSheetDragToDismiss } from "./mobile-bottom-sheet";
import { mountNoteBodyRegion } from "./note-body-region";
import type { NoteBodyRegion } from "./note-body-region";
import { trapFocus } from "./interaction-scope";
import { openExternalUrl } from "./open-external";

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
 *   关闭按钮（复用 db-cell-edit-close）。桌面端保持锚定面板不变。
 * - 面板挂在 .note-database-container 内且不加 transform/filter，确保字段编辑时子气泡
 *   （db-cell-option-popover 等）相对同一容器 absolute 定位正确。
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
  isReadOnly?: boolean;
}

export interface OpenRecordDetailOptions {
  /** 被点击的事件卡片，作为定位锚点。 */
  anchorEl: HTMLElement;
  /** 面板挂载宿主（传容器的 note-database-container 元素）。 */
  host: HTMLElement;
  row: RowData;
  /** 调用方算好的可见列。 */
  columns: ColumnDef[];
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
  ".db-cell-edit-popover",
  ".db-cell-option-popover",
  ".db-cell-date-popover",
  ".db-color-picker-popup",
  ".db-dropdown-popover",
  ".db-icon-picker-popover",
].join(", ");

function isRecordDetailChildPopoverTarget(target: EventTarget | null): boolean {
  return isElement(target) && Boolean(target.closest(RECORD_DETAIL_CHILD_POPOVER_SELECTOR));
}

function isBodyEditorTarget(target: EventTarget | null): boolean {
  return isElement(target) && Boolean(target.closest(".db-record-detail-body-editor"));
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

  const { anchorEl, host, row, columns, config, app, actions } = opts;

  // 记录从日历 overflow popover 打开时，定位必须先使用仍连接且可见的事件锚点。
  // 定位完成后只隐藏 overflow，不能 remove：CalendarRenderer 会保留节点引用供
  // “还有 N 条”再次打开；remove 会留下 detached 引用，使后续 hover/click 无响应。
  const calendarPopovers = Array.from(
    host.querySelectorAll<HTMLElement>(".db-calendar-day-popover, .db-calendar-week-allday-popover")
  );

  const panel = host.createDiv({ cls: "db-record-detail-panel" });
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
      if (window.activeDocument.querySelector(".db-icon-picker-popover, .db-color-picker-popup")) return;
      event.preventDefault();
      close();
    }
  };
  const onResize = (): void => {
    // A software keyboard appearing resizes the window on some platforms, and this listener's job
    // is to dismiss a panel whose anchor has moved out from under it. Those two collide the moment
    // the body becomes editable: the sheet would close on the first tap into the editor, on exactly
    // the surface the editor exists for. The sheet re-places itself against the keyboard inset
    // already, so there is nothing here for it to escape.
    if (bodyRegion?.isEditing()) return;
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

  /** Mount the body under the properties, resuming an interrupted edit where it left off. */
  const mountBody = (r: RowData): void => {
    const save = actions.saveNoteBody;
    if (bodyText === null || closed || !bodyLifetime) return;
    bodyRegion = mountNoteBodyRegion({
      parent: panel,
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
      console.error("Note Database: failed to read the record's note body", err);
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
    if (panel.hasClass("db-mobile-bottom-sheet")) applySheetChrome(panel, true);
    const explicitTitleField = getRecordEventTitleField(config);
    const title = resolveTitleFieldDisplay(r, config, explicitTitleField);
    panel.setAttribute("aria-label", title.text || r.file.basename);
    const titleField = title.field || "file.name";
    // 标题区（对齐事件卡片标题）+ 右上角「打开笔记」按钮（复用看板卡片 db-board-card-open 样式）
    const header = panel.createDiv({ cls: "db-record-detail-header" });
    actions.renderRecordIcon?.(header, r, config);
    const titleEl = header.createDiv({ cls: "db-record-detail-title", text: title.text });
    markNoteHoverLink(titleEl, r.file.path, r.file.path);
    actions.applyConditionalFormat?.(titleEl, r, config, titleField);
    if (title.isEmpty) titleEl.addClass("is-empty-title");
    // 仅 file.name 标题可双击重命名；其它字段标题只读（用字段编辑改值）
    const editFileName = titleField === "file.name" ? actions.editFileName : undefined;
    if (editFileName && !actions.isReadOnly) {
      titleEl.addEventListener("dblclick", (event) => {
        event.stopPropagation();
        editFileName(titleEl, r, title.text);
      });
      setFieldTooltip(titleEl, title.text, t("cell.doubleClickRename"));
    } else {
      setFieldTooltip(titleEl, title.isEmpty ? "" : title.text);
    }
    const openBtn = header.createEl("button", {
      cls: "db-board-card-open",
      attr: { type: "button", "aria-label": t("menu.openNote") },
    });
    setIcon(openBtn, "maximize-2");
    setTooltip(openBtn, t("menu.openNote"), { delay: 100 });
    openBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      actions.openRow(r);
      close();
    });
    // 常驻关闭按钮：桌面端 CSS 隐藏（保持锚定面板原貌），移动端底部抽屉显示，触摸可点关闭。
    const closeBtn = header.createEl("button", {
      cls: "db-cell-edit-close",
      attr: { type: "button", "aria-label": t("common.close") },
    });
    setIcon(closeBtn, "x");
    setTooltip(closeBtn, t("common.close"), { delay: 100 });
    closeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      close();
    });
    // 字段列表（跳过 titleField；空字段按 showEmptyFields 过滤，对齐看板卡片）
    const fieldsEl = panel.createDiv({ cls: "db-record-detail-fields" });
    for (const col of columns) {
      if (col.key === titleField) continue;
      const value = getRecordCellValue(r, col);
      const displayType = getRecordDisplayType(config, col);
      const empty = isEmptyValue(value) && displayType !== "checkbox";
      if (empty && config.showEmptyFields !== true) continue;
      renderRecordField(fieldsEl, r, col, config, app, actions);
    }
    // Last, so the body reads as the note under its properties rather than as another property.
    mountBody(r);
  };

  renderContent(row);
  loadBody(row);
  removeFocusTrap = trapFocus(panel);
  panel.focus?.({ preventScroll: true });
  // 定位（复用 positionToolbarPopover：挂载点选择 / 视口夹取 / 翻转 / 移动端留白）
  positionToolbarPopover(panel, anchorEl, { minWidth: 240, preferredWidth: 360, maxWidth: 420, align: "center" });
  // 移动端底部抽屉：positionToolbarPopover 已加 .db-mobile-bottom-sheet 与抓手；接上向下拖拽关闭手势。
  if (panel.hasClass("db-mobile-bottom-sheet")) {
    const handle = panel.querySelector<HTMLElement>(".db-mobile-bottom-sheet-handle");
    if (handle) removeSheetDrag = attachSheetDragToDismiss(panel, handle, close);
  }
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
    fieldClass: "db-record-detail-field", valueClass: "db-board-card-value", labelClass: "db-record-detail-field-label",
    badgesClass: "db-board-card-badges", linkClass: "db-board-card-link", fieldWidth: getFieldWidth(config, col),
    wrap: col.wrap, readOnly: actions.isReadOnly || isReadonlyFileField(col.key),
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

/** 渲染字段值展示（移植自 BoardRenderer.renderPreviewValue 的展示分支，markdown/link/image 首版降级为文本）。 */
function renderRecordValue(
  valueEl: HTMLElement,
  row: RowData,
  col: ColumnDef,
  value: unknown,
  displayType: ColumnDef["type"],
  app: App,
  actions: RecordDetailActions,
): void {
  // checkbox
  if (displayType === "checkbox") {
    valueEl.addClass("db-checkbox-cell");
    const cb = createCheckbox(valueEl, { role: "field" });
    cb.checked = toBooleanValue(value);
    cb.onclick = (event) => event.stopPropagation();
    cb.disabled = !!actions.isReadOnly;
    if (!actions.isReadOnly) {
      cb.onchange = () => {
        void actions.editCell(valueEl, row, col);
      };
    }
    setFieldTooltip(valueEl, cb.checked ? t("common.true") : t("common.false"));
    return;
  }

  // file 特殊字段（file.tags / file 链接字段）
  if (shouldRenderSpecialFileField(col) && renderSpecialFileFieldValue(valueEl, app, row, col, value, {
    tagsContainerClass: "db-board-card-badges",
    linkItemClass: "db-board-card-link",
  })) {
    valueEl.addClass("has-badges");
    return;
  }

  // select / status
  if (col.type === "select" || col.type === "status") {
    renderBadge(valueEl, col, String(value));
    return;
  }

  // multi-select
  if (col.type === "multi-select") {
    const values = toMultiSelectValuesForKey(col.key, value);
    valueEl.addClass("has-badges");
    const wrap = valueEl.createDiv({ cls: "db-board-card-badges" });
    setFieldTooltip(wrap, values);
    for (const entry of values) renderBadge(wrap, col, entry);
    return;
  }
  if (col.type === "relation" && renderRelationValue(valueEl, app, row, value, true)) {
    valueEl.addClass("has-badges");
    return;
  }

  // date / datetime
  if (displayType === "date" || displayType === "datetime") {
    valueEl.addClass("db-date-value");
    valueEl.textContent = displayType === "datetime"
      ? formatDateTimeValueDisplay(value, { mode: "full", showTimeWhenMissing: true })
      : formatDateValueDisplay(value);
    setFieldTooltip(valueEl, valueEl.textContent);
    return;
  }

  // number（rating / progress / ring）
  if (displayType === "number") {
    const num = typeof value === "number" ? value : parseFloat(String(value));
    if (!isNaN(num)) {
      const style = getNumberDisplayStyle(col);
      if (style === "rating") { renderRating(valueEl, num, col.numberDisplayConfig); return; }
      if (style === "progress") { renderProgress(valueEl, num, col.numberDisplayConfig); return; }
      if (style === "ring") { renderProgressRing(valueEl, num, col.numberDisplayConfig); return; }
    }
  }

  const schemeTarget = col.type === "text" && !isFileFieldKey(col.key) && isTextLinkScheme(col.textLinkScheme)
    ? assembleSchemeLinkTarget(col.textLinkScheme, value)
    : null;
  if (schemeTarget !== null) {
    renderDelayedExternalLink(valueEl, row, {
      label: String(value),
      target: schemeTarget,
      external: true,
    });
    return;
  }

  // markdown 内联（text 字段 textRenderMode === "markdown"）：对齐看板卡片渲染，
  // 链接点击 stopPropagation 立即打开（renderInlineMarkdown 默认 card 策略，与面板"单击=编辑"共存）
  if (col.textRenderMode === "markdown" && !isFileFieldKey(col.key)) {
    const mdValues = Array.isArray(value) ? value : [value];
    const parsed = mdValues.map((entry) => parseInlineMarkdown(entry));
    if (parsed.some((nodes) => nodes !== null)) {
      valueEl.empty();
      const onOpenLink = (target: string, external: boolean): void => {
        openTarget(app, row, target, external);
      };
      const onResolveImage = (target: string, external: boolean): string | null =>
        resolveInlineImageSrc(app, row, target, external);
      parsed.forEach((nodes, idx) => {
        if (idx > 0) valueEl.appendText(", ");
        if (nodes) {
          if (parsed.length === 1) renderInlineMarkdown(valueEl, nodes, { onOpenLink, onResolveImage, sourcePath: row.file.path });
          else renderInlineMarkdown(valueEl.createSpan(), nodes, { onOpenLink, onResolveImage, sourcePath: row.file.path });
        } else {
          valueEl.appendText(safeString(mdValues[idx]));
        }
      });
      setFieldTooltip(valueEl, valueToTooltip(value));
      return;
    }
  }

  // text link（textRenderMode === "link"）：值显示为可点击链接，对齐看板/列表/画廊
  if (col.textRenderMode === "link" && !isFileFieldKey(col.key)) {
    const linkValues = Array.isArray(value) ? value : [value];
    const links = linkValues
      .map((entry) => parseTextLink(entry))
      .filter((entry): entry is ParsedLink => entry !== null);
    if (links.length > 0) {
      for (const link of links) renderLink(valueEl, link, app, row);
      return;
    }
  }

  // 默认文本
  valueEl.textContent = Array.isArray(value) ? value.join(", ") : safeString(value);
  setFieldTooltip(valueEl, valueEl.textContent);
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

function getEmptyDisplayValue(displayType: ColumnDef["type"]): unknown {
  if (displayType === "multi-select") return [t("common.empty")];
  if (displayType === "checkbox") return false;
  return t("common.empty");
}

function renderBadge(parent: HTMLElement, col: ColumnDef, value: string): void {
  const resolved = resolveOptionDisplay(col, value);
  const display = resolved.value || t("common.empty");
  const badge = parent.createSpan({ cls: "status-badge", text: display });
  badge.title = display;
  badge.addClass(resolved.option ? `status-color-${resolved.option.color}` : "status-color-gray");
}

/** 打开内部 / 外部链接（markdown 内联链接 / 图片点击复用）。 */
function openTarget(app: App, row: RowData, target: string, external: boolean): void {
  if (external) {
    openExternalUrl(target);
    return;
  }
  void app.workspace.openLinkText(target, row.file.path);
}

interface ParsedLink {
  label: string;
  target: string;
  external: boolean;
}

/** text link 模式：值渲染为可点击链接（复刻 BoardRenderer.renderLink）。 */
function renderLink(parent: HTMLElement, link: ParsedLink, app: App, row: RowData): void {
  const anchor = parent.createEl("a", { cls: "db-board-card-link", text: link.label, attr: { title: link.label } });
  anchor.href = link.external ? link.target : "#";
  if (!link.external) markNoteHoverLink(anchor, link.target, row.file.path);
  anchor.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    openTarget(app, row, link.target, link.external);
  };
}
