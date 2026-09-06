// ───────────────────────────────────────────────────────────────────
// MODULE:    cell-renderer
// COMPONENT: table cell display and inline-edit lifecycle for every column type
// ───────────────────────────────────────────────────────────────────
//
// One class owns both read-mode rendering and the edit session for every
// column type (text, date, options, relation, number styles, file fields)
// because the two are tightly coupled: starting an edit has to know how
// the cell is currently displayed to restore it correctly on cancel, and
// only one inline editor/option popover may be active at a time across
// the whole table. Option value changes (rename/remove a status) commit
// through a serial task queue rather than firing independently, since two
// overlapping option-set writes racing to the same frontmatter key would
// silently drop one of them.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, Notice, setIcon } from "obsidian";
import {
  resolveOptionDisplay,
  toBooleanValue,
  toMultiSelectValuesForKey,
  toValidObsidianTagValues,
} from "../data/column-types";
import { getColumnDisplayType, getNumberDisplayStyle, isEmptyValue } from "../data/column-display";
import { formatEuroCurrency } from "../data/euro-format";
import * as FilesColumn from "../data/files-column";
import { formatReportsNumber, isReportsComputedColumn } from "../data/reports-display";
import { renderRelationValue } from "./relation-value-renderer";
import { isImeComposing } from "../data/keyboard-utils";
import { openDropdownMenu } from "./dropdown-field";
import { isHTMLElement } from "./dom-guards";
import { DataSource } from "../data/data-source";
import { formatDateTimeValueDisplay, formatDateValueDisplay } from "../data/date-time-format";
import { parseTextLink } from "../data/text-link";
import { assembleSchemeLinkTarget, isTextLinkScheme } from "../data/text-link-scheme";
import { parseInlineMarkdown } from "../data/inline-markdown";
import { getFileFieldFixedType, getRowFileFieldValue, isFileFieldKey, isReadonlyFileField } from "../data/file-fields";
import { getRenamedMarkdownPath } from "../data/file-rename-plan";
import { ColumnDef, ComputedFieldDef, RowData } from "../data/types";
import { t } from "../i18n";
import { setFieldTooltip } from "./field-tooltip";
import { FileTitleDisplay, getFileTitleDisplay, renderInlineFileTitle } from "./file-title-display";
import { safeString } from "../data/safe-string";
import { renderSpecialFileFieldValue, shouldRenderSpecialFileField } from "./file-field-renderer";
import { createCheckbox } from "./checkbox";
import { renderRating, renderProgress, renderProgressRing } from "./number-display-renderer";
import { renderInlineMarkdown, resolveInlineImageSrc } from "./inline-markdown-renderer";
import { SerialTaskQueue } from "../data/serial-task-queue";
import type { TableCellNavigationIntent } from "../data/table-keyboard-navigation";
import { markNoteHoverLink } from "./hover-link-preview";
import { resolveCellTapAction, trackCellGesture } from "./table-cell-gesture";
import { openExternalUrl } from "./open-external";
import {
  CellEditCommitIntent,
  CellEditorContext,
  CellEditSession,
  CellOptionTransaction,
  clearTransientClass,
  normalizeCellValueForSave,
  showValidationError,
} from "./record-surface/cell-editor-shared";
import { openOptionEditor } from "./record-surface/cell-editor-option";
import { openRelationEditor } from "./record-surface/cell-editor-relation";
import { openDateEditor } from "./record-surface/cell-editor-date";
import { openSingleLineEditor, openTextEditor, openTextPopoverEditor, type EditorSaveResult } from "./record-surface/cell-editor-text";
import { openNumberEditor } from "./record-surface/cell-editor-number";

export type { CellEditCommitIntent, CellEditSession, CellOptionTransaction };

// ───────────────────────────────────────────────────────────────────
// 2. PUBLIC API
// ───────────────────────────────────────────────────────────────────

export function renderDelayedExternalLink(
  td: HTMLElement,
  row: RowData,
  link: { label: string; target: string; external?: boolean },
  app?: App,
): void {
  const external = link.external ?? true;
  const anchor = td.createEl("a", {
    cls: `db-text-link ${external ? "external-link" : "internal-link"}`,
    text: link.label,
    attr: { title: link.target, href: external ? link.target : "#" },
  });
  if (!external) markNoteHoverLink(anchor, link.target, row.file.path);

  if (external) {
    const actions = td.createSpan({ cls: "db-inline-link-actions" });
    const open = actions.createEl("button", {
      cls: "db-inline-link-action",
      attr: { type: "button", "aria-label": t("link.open"), title: t("link.open") },
    });
    setIcon(open, "external-link");
    open.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      openExternalUrl(link.target);
    };
    const copy = actions.createEl("button", {
      cls: "db-inline-link-action",
      attr: { type: "button", "aria-label": t("link.copy"), title: t("link.copy") },
    });
    setIcon(copy, "copy");
    copy.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const clipboard = navigator.clipboard;
      if (!clipboard?.writeText) {
        new Notice(t("errors.clipboardFailed"));
        return;
      }
      void clipboard.writeText(link.target)
        .then(() => new Notice(t("link.copied")))
        .catch(() => new Notice(t("errors.clipboardFailed")));
    };
  }

  let openTimer: number | undefined;
  anchor.addEventListener("click", (event) => {
    event.preventDefault();
    if (event.detail > 1) {
      if (openTimer !== undefined) { window.clearTimeout(openTimer); openTimer = undefined; }
      return;
    }
    openTimer = window.setTimeout(() => {
      openTimer = undefined;
      if (external) openExternalUrl(link.target);
      else void app?.workspace.openLinkText(link.target, row.file.path);
    }, 280);
  });
}

// ───────────────────────────────────────────────────────────────────
// 3. RENDERER
// ───────────────────────────────────────────────────────────────────

export class CellRenderer {
  private activeTextEditClose?: () => void;
  private activeOptionPopoverClose?: () => void;
  private activeInlineEditorCancel?: () => void;
  private optionCommitQueue = new SerialTaskQueue();
  private editorCommitInProgress = false;

  constructor(
    private dataSource: DataSource,
    private refreshAfterSave: () => Promise<void>,
    private openNote: (row: RowData) => void | Promise<void> = (row) => this.dataSource.openNote(row.file),
    private manageOptions?: (col: ColumnDef) => void,
    private editFormula?: (col: ColumnDef, row: RowData) => void,
    private isReadOnly = false,
    private commitCellOptionTransaction?: (row: RowData, col: ColumnDef, transaction: CellOptionTransaction) => Promise<void>,
    private saveCellValue?: (row: RowData, col: ColumnDef, value: unknown) => Promise<void | boolean>,
    private getFileTitleInfo: (row: RowData) => FileTitleDisplay = (row) => getFileTitleDisplay(row, [row]),
    private getComputedFields: () => ComputedFieldDef[] = () => [],
    private app?: App,
    private finishTableCellEdit?: (row: RowData, col: ColumnDef, intent: TableCellNavigationIntent) => void,
    private renameFile?: (row: RowData, newName: string) => Promise<boolean | string>,
    private sourceInstanceId?: string,
    private editRelationRollup?: (col: ColumnDef, row: RowData) => void,
    /** Whether a column carries the row's main item. Absent means "this host has no main item
     *  concept", which is the honest answer for a surface that renders cells outside a table. */
    private isMainItemColumn?: (col: ColumnDef) => boolean,
  ) {}

  private finishInlineEdit(
    row: RowData,
    col: ColumnDef,
    session: CellEditSession | undefined,
    intent: TableCellNavigationIntent,
  ): void {
    if (!session) this.finishTableCellEdit?.(row, col, intent);
  }

  // Built fresh per editor open rather than cached: the closures below read `this`'s current
  // private fields at call time, which is what every consumer of this context expects — the same
  // way the un-extracted methods read `this.activeOptionPopoverClose` fresh on every access rather
  // than a value captured once at construction.
  private buildCellEditorContext(): CellEditorContext {
    return {
      app: this.app,
      dataSource: this.dataSource,
      commitEditedValue: (row, col, value, session, intent) => this.commitEditedValue(row, col, value, session, intent),
      refreshAfterSave: () => this.refreshAfterSave(),
      finishInlineEdit: (row, col, session, intent) => this.finishInlineEdit(row, col, session, intent),
      commitCellOptionTransaction: this.commitCellOptionTransaction
        ? (row, col, transaction) => this.commitCellOptionTransaction!(row, col, transaction)
        : undefined,
      enqueueOptionCommit: (task) => this.optionCommitQueue.enqueue(task),
      getActiveOptionPopoverClose: () => this.activeOptionPopoverClose,
      setActiveOptionPopoverClose: (close) => { this.activeOptionPopoverClose = close; },
      getActiveInlineEditorCancel: () => this.activeInlineEditorCancel,
      setActiveInlineEditorCancel: (cancel) => { this.activeInlineEditorCancel = cancel; },
      getActiveTextEditClose: () => this.activeTextEditClose,
      setActiveTextEditClose: (close) => { this.activeTextEditClose = close; },
      closeActiveOptionPopover: () => this.closeActiveOptionPopover(),
      renderNumberValue: (td, row, col, value) => this.renderNumberValue(td, row, col, value),
    };
  }

  /** `viewWrapDefault` is the view's own `wrapText` setting, read only when the column carries no
   *  wrap override of its own (`col.wrap === undefined`) — a column's explicit choice always wins. */
  renderCell(td: HTMLElement, row: RowData, col: ColumnDef, viewWrapDefault?: boolean): void {
    td.addClass("db-cell");
    const isWrapping = Boolean(col.wrap ?? viewWrapDefault);
    if (isWrapping) td.addClass("db-cell-wrap");
    let value: unknown;

    if (col.type === "computed" || col.type === "rollup") {
      value = row.computed[col.type === "computed" ? col.computedKey || col.key : col.key];
    } else if (col.key === "file.name") {
      td.addClass("db-title-cell");
      const displayInfo = this.getFileTitleInfo(row);
      const link = td.createEl("a", {
        cls: "internal-link",
        attr: { title: displayInfo.fullPath },
      });
      markNoteHoverLink(link, row.file.path, row.file.path);
      renderInlineFileTitle(link, displayInfo, true);
      link.addEventListener("click", (event) => {
        event.preventDefault();
        void this.openNote(row);
      });
      setFieldTooltip(td, displayInfo.fullPath);
      if (!this.isReadOnly) {
        td.addClass("db-editable-cell");
        setFieldTooltip(td, displayInfo.fullPath, t("cell.doubleClickRename"));
        td.tabIndex = 0;
        td.addEventListener("dblclick", (event) => {
          event.stopPropagation();
          this.editFileName(td, row, displayInfo.name);
        });
      }
      return;
    } else {
      value = isFileFieldKey(col.key) ? getRowFileFieldValue(row, col.key) : row.frontmatter[col.key];
    }

    const displayType = this.getEffectiveDisplayType(col);
    const computedKey = col.type === "computed" ? col.computedKey || col.key : undefined;
    const computedError = computedKey ? row.computedErrors?.[computedKey] : undefined;
    if (computedError) {
      const badge = td.createSpan({
        cls: "db-formula-error-badge",
        text: "#ERROR!",
        attr: { role: "img", "aria-label": t("formula.errorBadge") },
      });
      setFieldTooltip(td, computedError.message, t("formula.errorHint"));
      if (!this.isReadOnly && col.type === "computed") this.makeComputedEditable(td, row, col);
      badge.title = computedError.message;
      return;
    }
    if (displayType === "checkbox") {
      this.renderCheckbox(td, row, col, value);
      return;
    }

    if (isEmptyValue(value) && !isReportsComputedColumn(col)) {
      td.createSpan({ cls: "db-empty-value" });
      if (!this.isReadOnly && col.type === "computed") {
        this.makeComputedEditable(td, row, col);
        setFieldTooltip(td, t("common.empty"), t("cell.doubleClickEditFormula"));
      }
      if (!this.isReadOnly && col.type === "rollup") {
        this.makeRollupConfigurable(td, row, col);
        setFieldTooltip(td, t("common.empty"), t("cell.doubleClickConfigureRollup"));
      }
      if (!this.isReadOnly && this.isEditableCellColumn(col)) {
        td.addClass("db-editable-cell");
        this.makeEditable(td, row, col, "");
        setFieldTooltip(td, t("common.empty"), this.getEditHint(col));
      } else if (!this.isReadOnly && isReadonlyFileField(col.key)) {
        this.makeReadonlyFileFieldNotice(td, col);
      }
      if (this.isReadOnly) {
        setFieldTooltip(td, t("common.empty"));
      }
      return;
    }

    if (shouldRenderSpecialFileField(col) && renderSpecialFileFieldValue(td, this.app, row, col, value, {
      onRemoveTag: col.key === "file.tags" && !this.isReadOnly
        ? (tag) => {
          const next = toValidObsidianTagValues(value).filter((candidate) => candidate !== tag);
          void this.saveValue(row, col, next);
        }
        : undefined,
    })) {
      if (!this.isReadOnly && this.isEditableCellColumn(col)) {
        td.addClass("db-editable-cell");
        this.makeEditable(td, row, col, value);
        setFieldTooltip(td, this.getTooltipValue(col, value), this.getEditHint(col));
      } else {
        setFieldTooltip(td, this.getTooltipValue(col, value));
      }
      return;
    }

    switch (displayType) {
      case "status":
      case "select":
        this.renderStatus(td, col, String(value));
        break;
      case "multi-select":
        this.renderMultiSelect(td, row, col, value);
        break;
      case "relation":
        this.renderRelation(td, row, value);
        break;
      case "files":
        FilesColumn.renderChips(td, this.app, row, FilesColumn.parseEdit(value));
        break;
      case "currency": {
        const num = this.toDisplayNumber(value);
        td.addClass("db-numeric-value");
        td.textContent = isNaN(num) ? this.nonNumericText(value) : formatEuroCurrency(num);
        break;
      }
      case "number": {
        this.renderNumberValue(td, row, col, value);
        break;
      }
      case "date":
        this.renderDate(td, row, col, value, false);
        break;
      case "datetime":
        this.renderDate(td, row, col, value, true);
        break;
      default: {
        const schemeTarget = !isFileFieldKey(col.key) && isTextLinkScheme(col.textLinkScheme)
          ? assembleSchemeLinkTarget(col.textLinkScheme, value)
          : null;
        if (schemeTarget !== null) {
          renderDelayedExternalLink(td, row, {
            label: String(value),
            target: schemeTarget,
            external: true,
          });
        } else if (col.textRenderMode === "markdown" && !isFileFieldKey(col.key)) {
          const nodes = parseInlineMarkdown(value);
          if (nodes) {
            td.empty();
            renderInlineMarkdown(td, nodes, {
              sourcePath: row.file.path,
              linkClickStrategy: "table",
              // A clipped cell's `white-space: nowrap` stops text from wrapping, but a `<br>`
              // forces its line break regardless — the one way a markdown value ignored the row
              // floor. Collapsing each line break to a space keeps the clip whole and matches how
              // the same value already reads as plain text, which the browser's own whitespace
              // collapsing already does for a literal newline outside markdown.
              collapseBreaks: !isWrapping,
              onOpenLink: (target, external) => {
                if (external) openExternalUrl(target);
                else void this.app?.workspace.openLinkText(target, row.file.path);
              },
              onResolveImage: (target, external) =>
                this.app ? resolveInlineImageSrc(this.app, row, target, external) : null,
            });
          } else {
            td.textContent = String(value);
          }
        } else if (col.textRenderMode === "link" && !isFileFieldKey(col.key)) {
          this.renderTextLink(td, row, value);
        } else {
          td.textContent = String(value);
        }
        break;
      }
    }

    if (!this.isReadOnly && col.type === "computed") {
      this.makeComputedEditable(td, row, col);
      setFieldTooltip(td, this.getTooltipValue(col, value), t("cell.doubleClickEditFormula"));
    } else if (!this.isReadOnly && col.type === "rollup") {
      this.makeRollupConfigurable(td, row, col);
      setFieldTooltip(td, this.getTooltipValue(col, value), t("cell.doubleClickConfigureRollup"));
    } else if (!this.isReadOnly && this.isEditableCellColumn(col)) {
      td.addClass("db-editable-cell");
      this.makeEditable(td, row, col, value);
      setFieldTooltip(td, this.getTooltipValue(col, value), this.getEditHint(col));
    } else if (!this.isReadOnly && isReadonlyFileField(col.key)) {
      this.makeReadonlyFileFieldNotice(td, col);
      setFieldTooltip(td, this.getTooltipValue(col, value), t("fileField.readonly", { label: col.label || col.key }));
    } else {
      setFieldTooltip(td, this.getTooltipValue(col, value));
    }
  }

  /** Read a stored value as a number for display, taking the whole value or none of it.
   *  Parsing only the leading digits turns the Dutch text 1.000,24 into 1 and 1000,24 into
   *  1.000 — figures that look right and are not what the note holds — so a value the column
   *  cannot read whole stays text rather than becoming a plausible wrong number. A value with
   *  nothing to print stays non-numeric, which is what keeps a formula with no result on its
   *  placeholder instead of on a zero. */
  private toDisplayNumber(value: unknown): number {
    if (typeof value === "number") return value;
    return this.hasNothingToPrint(value) ? Number.NaN : Number(value);
  }

  /** What a numeric cell prints when the value is not a number: the value itself, so a row
   *  reads the same as the card over the same record, and the placeholder only when there is
   *  genuinely nothing to read. */
  private nonNumericText(value: unknown): string {
    if (this.hasNothingToPrint(value)) return "-";
    return Array.isArray(value) ? value.join(", ") : String(value);
  }

  private hasNothingToPrint(value: unknown): boolean {
    return isEmptyValue(value) || String(value).trim() === "";
  }

  /** Render a number cell value, honoring the column's numberDisplayStyle (plain/rating/progress). */
  private renderNumberValue(td: HTMLElement, row: RowData | undefined, col: ColumnDef, value: unknown): void {
    td.addClass("db-numeric-value");
    const num = this.toDisplayNumber(value);
    if (isNaN(num)) { td.textContent = this.nonNumericText(value); return; }
    const style = getNumberDisplayStyle(col);
    const interaction = row && !this.isReadOnly && this.isEditableCellColumn(col)
      ? { onChange: (next: number) => this.saveValue(row, col, next) }
      : undefined;
    if (style === "rating") { td.empty(); renderRating(td, num, col.numberDisplayConfig, interaction); return; }
    if (style === "progress") { td.empty(); renderProgress(td, num, col.numberDisplayConfig, interaction); return; }
    if (style === "ring") { td.empty(); renderProgressRing(td, num, col.numberDisplayConfig, interaction); return; }
    td.textContent = this.formatNumber(num);
  }

  /** Render a link-mode text value as a styled link. A single click opens it
   *  after a short delay so a double-click can still enter the inline editor
   *  (makeEditable's dblclick); the second click of a dblclick cancels the open.
   *  This coexists with the cell's inline-edit interaction. */
  private renderTextLink(td: HTMLElement, row: RowData, value: unknown): void {
    const link = parseTextLink(value);
    if (!link) { td.textContent = String(value); return; }
    renderDelayedExternalLink(td, row, link, this.app);
  }

  private getEffectiveDisplayType(col: ColumnDef): ColumnDef["type"] {
    if (isFileFieldKey(col.key)) return getFileFieldFixedType(col.key);
    return getColumnDisplayType(col, this.getComputedFields());
  }

  private isEditableCellColumn(col: ColumnDef): boolean {
    if (col.type === "computed" || col.type === "rollup") return false;
    if (!isFileFieldKey(col.key)) return true;
    return col.key === "file.tags" || col.key === "file.name";
  }

  private renderStatus(td: HTMLElement, col: ColumnDef, status: string): void {
    const resolved = resolveOptionDisplay(col, status);
    if (!resolved.value) {
      td.createSpan({ cls: "db-empty-value" });
      return;
    }
    const badge = td.createSpan({ cls: "status-badge" });
    badge.textContent = resolved.value;
    badge.title = resolved.value;
    badge.setAttribute("data-status-color", resolved.option?.color || "gray");
    if (resolved.option) {
      badge.addClass(`status-color-${resolved.option.color}`);
    } else {
      badge.addClass("status-color-gray");
    }
  }

  private renderMultiSelect(td: HTMLElement, row: RowData, col: ColumnDef, value: unknown): void {
    const values = toMultiSelectValuesForKey(col.key, value);
    const wrap = td.createDiv({ cls: "db-multi-select-values" });
    setFieldTooltip(wrap, values);
    for (const item of values) {
      const resolved = resolveOptionDisplay(col, item);
      const badge = wrap.createSpan({ cls: "status-badge db-multi-select-badge" });
      badge.createSpan({ cls: "db-multi-select-label", text: resolved.value || item });
      badge.title = resolved.value || item;
      badge.addClass(`status-color-${resolved.option?.color || "gray"}`);
      const remove = badge.createEl("button", {
        cls: "db-multi-select-remove",
        text: "×",
        attr: { type: "button", "aria-label": t("tag.remove", { tag: item }), title: t("tag.remove", { tag: item }) },
      });
      remove.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        badge.addClass("is-removing");
        remove.disabled = true;
        void this.saveValue(row, col, values.filter((candidate) => candidate !== item)).then((success) => {
          if (!success) {
            badge.removeClass("is-removing");
            remove.disabled = false;
          }
        });
      };
    }
  }

  private renderRelation(td: HTMLElement, row: RowData, value: unknown): void {
    renderRelationValue(td, this.app, row, value);
  }

  private getTooltipValue(col: ColumnDef, value: unknown): unknown {
    if (col.key === "file.tags") return toValidObsidianTagValues(value);
    const displayType = this.getEffectiveDisplayType(col);
    if (displayType === "multi-select") return toMultiSelectValuesForKey(col.key, value);
    if (displayType === "select" || displayType === "status") {
      return resolveOptionDisplay(col, value).value || t("common.empty");
    }
    return value;
  }

  private renderCheckbox(td: HTMLElement, row: RowData, col: ColumnDef, value: unknown): void {
    td.addClass("db-checkbox-cell");
    setFieldTooltip(td, toBooleanValue(value) ? t("common.true") : t("common.false"));
    const checkbox = createCheckbox(td, { role: "field" });
    checkbox.checked = toBooleanValue(value);
    if (this.isReadOnly) {
      checkbox.disabled = true;
    } else if (col.type === "computed") {
      // Keep events bubbling to the cell so computed checkbox formulas are editable.
      checkbox.addClass("db-computed-checkbox-preview");
      this.makeComputedEditable(td, row, col);
      return;
    }
    checkbox.onclick = (event) => {
      if (!this.isReadOnly) this.selectCell(td);
      event.stopPropagation();
    };
    if (this.isReadOnly) return;
    checkbox.onchange = () => {
      void this.saveValue(row, col, checkbox.checked);
    };
  }

  private renderDate(td: HTMLElement, row: RowData, col: ColumnDef, value: unknown, includeTime: boolean): void {
    td.addClass("db-date-value");
    td.textContent = includeTime
      ? formatDateTimeValueDisplay(value, { mode: "full", showTimeWhenMissing: true })
      : formatDateValueDisplay(value);

    if (!col.urgency?.enabled) return;
    const daysKey =
      col.computedKey ||
      (col.key === "next_billing" ? "renewal_days" : "days_to_eol");
    const days = row.computed[daysKey];
    if (typeof days !== "number") return;
    if (days < 0) td.addClass("urgency-red");
    else if (days <= 7) td.addClass("urgency-red");
    else if (days <= col.urgency.thresholdDays) td.addClass("urgency-orange");
    else td.addClass("urgency-green");
  }

  private makeEditable(td: HTMLElement, row: RowData, col: ColumnDef, currentValue: unknown): void {
    const opensOnClick = this.opensPickerOnClick(col);
    td.title = this.getEditHint(col);
    td.tabIndex = 0;

    const startEdit = (event?: MouseEvent) => {
      td.removeClass("db-cell-selected");
      this.startEdit(td, row, col, event, currentValue);
    };

    // A tap opens the editor for every editable type, not only the four that already open on a
    // click. The rest were reachable through `dblclick` alone, and a phone has no second click to
    // give — which left a tap on most of the table doing nothing a user could name.
    //
    // Routed through the shared resolver rather than a device check, so a mouse in a narrow split
    // pane keeps the click-selects, double-click-edits grammar it has on any other desktop window.
    const cellGesture = trackCellGesture(td);
    td.addEventListener("click", (event) => {
      event.stopPropagation();
      if (this.focusExistingEditor(td, event, false)) return;
      const tapAction = resolveCellTapAction({
        gesture: cellGesture(),
        // Asked, not assumed. This read `false` unconditionally, which is only true while the note
        // name is visible — hide that column and the first visible one becomes the row's main item,
        // so a tap on it opened this editor while the cell's own handler opened the record sheet.
        // One press, two surfaces.
        isTitleCell: this.isMainItemColumn?.(col) ?? false,
        // True by construction: this path only runs for a cell that has an editor to open.
        isEditable: true,
      });
      // The main item opens the record, and exactly one handler does that — the capture-phase one
      // the host binds on this same cell. Deferring here is what keeps the sheet's single path.
      if (tapAction === "open-record") return;
      if (opensOnClick || tapAction === "edit-cell") {
        this.selectCell(td);
        startEdit(event);
        return;
      }
      this.selectCell(td);
    });
    td.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      if (this.focusExistingEditor(td, event)) return;
      startEdit(event);
    });
    // Enter on a cell is handled at the document level (handleDatabaseKeydown → editAtCellSelection)
    // so that a multi-cell selection routes to bulk edit, not just editing the focus cell.
  }

  private opensPickerOnClick(col: ColumnDef): boolean {
    return col.type === "select" || col.type === "status" || col.type === "date" || col.type === "datetime";
  }

  private getEditHint(col: ColumnDef): string {
    return this.opensPickerOnClick(col) ? t("cell.clickToEdit") : t("cell.doubleClickEdit");
  }

  private makeReadonlyFileFieldNotice(td: HTMLElement, col: ColumnDef): void {
    td.tabIndex = 0;
    const showNotice = () => new Notice(t("fileField.readonly", { label: col.label || col.key }));
    td.addEventListener("dblclick", (event) => {
      event.preventDefault();
      event.stopPropagation();
      showNotice();
    });
  }

  private makeComputedEditable(td: HTMLElement, row: RowData, col: ColumnDef): void {
    td.addClass("db-formula-cell");
    td.addEventListener("dblclick", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.editFormula?.(col, row);
    });
  }

  private makeRollupConfigurable(td: HTMLElement, row: RowData, col: ColumnDef): void {
    td.addClass("db-rollup-cell");
    td.addEventListener("dblclick", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.editRelationRollup) this.editRelationRollup(col, row);
      else new Notice(t("cell.rollupReadonly"));
    });
  }

  startEdit(
    target: HTMLElement,
    row: RowData,
    col: ColumnDef,
    event?: MouseEvent,
    currentValue = this.getCurrentValue(row, col),
    session?: CellEditSession,
    checkboxFinishIntent: TableCellNavigationIntent = "down",
  ): void {
    if (isReadonlyFileField(col.key)) {
      new Notice(t("fileField.readonly", { label: col.label || col.key }));
      return;
    }

    if (col.type === "checkbox") {
      if (session) {
        this.openBulkCheckboxEditor(target, row, col, currentValue, session);
        return;
      }
      void this.commitEditedValue(row, col, !toBooleanValue(currentValue), session)
        .then(() => this.finishInlineEdit(row, col, session, checkboxFinishIntent));
      return;
    }

    if (!session && this.focusExistingEditor(target, event)) return;
    if (col.type === "rollup") {
      // Table keyboard entry (Enter/F2) has no MouseEvent. Card/detail renderers call
      // startEdit from a single click and must keep the existing read-only behavior;
      // Table mouse double-click is handled by makeRollupConfigurable above.
      if (!event && this.editRelationRollup) this.editRelationRollup(col, row);
      else new Notice(t("cell.rollupReadonly"));
      return;
    }
    if (col.type === "computed") {
      this.editFormula?.(col, row);
      return;
    }
    if (col.key === "file.name") {
      this.editFileName(target, row, row.file.basename);
      return;
    }
    const origText = target.textContent || "";
    const anchorPoint = event ? { x: event.clientX, y: event.clientY } : undefined;

    if (col.type === "status" || col.type === "select") {
      this.editOptionPopover(target, row, col, currentValue, false, anchorPoint, session);
      return;
    }

    if (col.type === "multi-select") {
      this.editOptionPopover(target, row, col, currentValue, true, anchorPoint, session);
      return;
    }
    if (col.type === "relation") {
      this.editRelationPopover(target, row, col, currentValue, session);
      return;
    }

    if (col.type === "number" || col.type === "currency") {
      this.editNumber(target, row, col, currentValue, session);
      return;
    }

    if (col.type === "date" || col.type === "datetime") {
      this.editDatePopover(target, row, col, currentValue, col.type === "datetime", session);
      return;
    }

    if (col.type === "files") {
      this.editText(target, row, col, FilesColumn.formatForEdit(currentValue), origText, session);
      return;
    }

    if (session) {
      const initial = session.mixed ? "" : safeString(currentValue);
      const placeholder = session.mixed ? (session.placeholder ?? "") : undefined;
      if (col.textRenderMode === "markdown" && !isFileFieldKey(col.key)) {
        openTextPopoverEditor(this.buildCellEditorContext(), target, row, col, initial, session, placeholder);
      } else {
        openSingleLineEditor(
          this.buildCellEditorContext(),
          target,
          row,
          col,
          initial,
          "text",
          async (v) => this.commitEditedValue(row, col, v, session, v ? "replace" : "clear"),
          () => {},
          session,
          placeholder,
        );
      }
      return;
    }

    this.editText(target, row, col, currentValue, origText, session);
  }

  startEditSession(
    target: HTMLElement,
    row: RowData,
    col: ColumnDef,
    currentValue: unknown,
    session: CellEditSession,
    event?: MouseEvent,
  ): void {
    this.startEdit(target, row, col, event, currentValue, session);
  }

  isEditorCommitInProgress(): boolean {
    return this.editorCommitInProgress;
  }

  restoreDraft(target: HTMLElement, row: RowData, col: ColumnDef, draft: string): boolean {
    if (this.isReadOnly || isReadonlyFileField(col.key)) return false;
    this.activeTextEditClose?.();
    const currentValue = this.getCurrentValue(row, col);
    if (col.type === "number" || col.type === "currency") {
      this.editNumber(target, row, col, currentValue, undefined, draft);
      return true;
    }
    if (col.type === "date" || col.type === "datetime") {
      this.editDatePopover(target, row, col, currentValue, col.type === "datetime", undefined, draft);
      return true;
    }
    if (col.type === "text" || col.type === "files") {
      const value = col.type === "files" ? FilesColumn.formatForEdit(currentValue) : currentValue;
      this.editText(target, row, col, value, target.textContent || "", undefined, draft);
      return true;
    }
    return false;
  }

  startReplaceEdit(target: HTMLElement, row: RowData, col: ColumnDef, initialText: string): boolean {
    if (isReadonlyFileField(col.key) || col.type === "computed" || col.type === "rollup" || col.type === "checkbox") return false;
    if (col.type === "relation") {
      this.editRelationPopover(target, row, col, this.getCurrentValue(row, col), undefined, initialText);
      return true;
    }
    if (col.type === "date" || col.type === "datetime") {
      if (!/^\d$/.test(initialText)) return false;
      this.editDatePopover(
        target,
        row,
        col,
        this.getCurrentValue(row, col),
        col.type === "datetime",
        undefined,
        initialText,
      );
      return true;
    }
    if (col.type === "select" || col.type === "status" || col.type === "multi-select") {
      this.editOptionPopover(
        target,
        row,
        col,
        this.getCurrentValue(row, col),
        col.type === "multi-select",
        undefined,
        undefined,
        initialText,
      );
      return true;
    }
    if (col.key === "file.name") {
      this.editFileName(target, row, row.file.basename, initialText);
      return true;
    }
    const currentValue = this.getCurrentValue(row, col);
    if (col.type === "number" || col.type === "currency") {
      if (!/^[+\-.\d]$/.test(initialText)) return false;
      this.editNumber(target, row, col, currentValue, undefined, initialText);
      return true;
    }
    this.editText(target, row, col, currentValue, target.textContent || "", undefined, initialText);
    return true;
  }

  // Close whatever bulk editor (text/date/single-line/option/checkbox) is currently open. Used by
  // DatabaseView when the user clicks the field chip to switch fields. Idempotent.
  closeActiveBulkEditor(): void {
    this.activeTextEditClose?.();
    this.activeTextEditClose = undefined;
  }

  closeActiveOptionPopover(): boolean {
    const close = this.activeOptionPopoverClose;
    if (!close) return false;
    close();
    return true;
  }

  cancelActiveInlineEditor(): boolean {
    const cancel = this.activeInlineEditorCancel;
    if (!cancel) return false;
    cancel();
    return true;
  }

  hasActiveEditor(container?: HTMLElement | null): boolean {
    if (!this.activeInlineEditorCancel && !this.activeOptionPopoverClose && !this.activeTextEditClose) return false;
    const root = container || window.activeDocument;
    return Boolean(root.querySelector(
      ".db-cell-edit-popover, .db-cell-option-popover, .db-dropdown-popover, " +
      ".db-cell-editing input, .db-cell-editing textarea, input.db-cell-input"
    ));
  }

  private openBulkCheckboxEditor(
    target: HTMLElement,
    row: RowData,
    col: ColumnDef,
    currentValue: unknown,
    session: CellEditSession,
  ): void {
    let closeMenu: (() => void) | undefined;
    const trackedClose = () => closeMenu?.();
    closeMenu = openDropdownMenu({
      anchor: target,
      label: col.label || col.key,
      value: "",
      options: [
        { value: "true", text: t("bulkEdit.checked") },
        { value: "false", text: t("bulkEdit.unchecked") },
      ],
      onChange: (value) => {
        void this.commitEditedValue(row, col, value === "true", session);
      },
      onClose: () => {
        if (this.activeTextEditClose === trackedClose) this.activeTextEditClose = undefined;
        session.onClose?.();
      },
    });
    this.activeTextEditClose = trackedClose;
  }

  private focusExistingEditor(target: HTMLElement, event?: Event, preventDefault = true): boolean {
    const eventTarget = isHTMLElement(event?.target) ? event.target : null;
    const existingEditor =
      eventTarget?.closest<HTMLInputElement | HTMLTextAreaElement>("input, textarea") ||
      target.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
    if (!existingEditor) return false;
    if (preventDefault) event?.preventDefault();
    event?.stopPropagation();
    existingEditor.focus();
    return true;
  }

  private getCurrentValue(row: RowData, col: ColumnDef): unknown {
    if (col.type === "computed" && col.computedKey) return row.computed[col.computedKey];
    if (col.type === "rollup") return row.computed[col.key];
    if (isFileFieldKey(col.key)) return getRowFileFieldValue(row, col.key);
    return row.frontmatter[col.key];
  }

  /** Body moved to `record-surface/cell-editor-relation.ts`'s `openRelationEditor`, unchanged, so
   *  the record sheet and board cards keep this one entry point without constructing the class. */
  private editRelationPopover(
    target: HTMLElement,
    row: RowData,
    col: ColumnDef,
    currentValue: unknown,
    session?: CellEditSession,
    initialSearch = "",
  ): void {
    openRelationEditor(this.buildCellEditorContext(), target, row, col, currentValue, session, initialSearch);
  }

  private selectCell(td: HTMLElement): void {
    td.focus();
  }

  /** Body moved to `record-surface/cell-editor-option.ts`'s `openOptionEditor`, unchanged, so
   *  the record sheet and board cards keep this one entry point without constructing the class. */
  private editOptionPopover(
    td: HTMLElement,
    row: RowData,
    col: ColumnDef,
    currentValue: unknown,
    multiple: boolean,
    anchorPoint?: { x: number; y: number },
    session?: CellEditSession,
    initialSearch?: string,
  ): void {
    openOptionEditor(this.buildCellEditorContext(), td, row, col, currentValue, multiple, anchorPoint, session, initialSearch);
  }

  /** Body moved to `record-surface/cell-editor-number.ts`'s `openNumberEditor`, unchanged, so
   *  the record sheet and board cards keep this one entry point without constructing the class. */
  private editNumber(
    td: HTMLElement,
    row: RowData,
    col: ColumnDef,
    currentValue: unknown,
    session?: CellEditSession,
    initialDraft?: string,
  ): void {
    openNumberEditor(this.buildCellEditorContext(), td, row, col, currentValue, session, initialDraft);
  }

  private editDate(
    td: HTMLElement,
    row: RowData,
    col: ColumnDef,
    currentValue: unknown,
    origText: string
  ): void {
    td.addClass("db-cell-editing");
    td.textContent = "";

    const parts = safeString(currentValue).substring(0, 10).split("-");
    const initYear = parts[0] || "";
    const initMonth = parts[1] || "";
    const initDay = parts[2] || "";

    const container = td.createDiv({ cls: "db-date-segments" });
    const yearInp = container.createEl("input", { cls: "db-date-seg", attr: { maxlength: "4", placeholder: "YYYY" } });
    container.createSpan({ cls: "db-date-sep", text: "-" });
    const monthInp = container.createEl("input", { cls: "db-date-seg", attr: { maxlength: "2", placeholder: "MM" } });
    container.createSpan({ cls: "db-date-sep", text: "-" });
    const dayInp = container.createEl("input", { cls: "db-date-seg", attr: { maxlength: "2", placeholder: "DD" } });

    const inputs = [yearInp, monthInp, dayInp];
    let committed = false;

    const pad2 = (v: string) => v.length === 1 ? `0${v}` : v;

    const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    const daysInMonth = (y: number, m: number) => {
      if (m === 2) return isLeapYear(y) ? 29 : 28;
      if ([4, 6, 9, 11].includes(m)) return 30;
      return 31;
    };
    const keepDateEditorOpen = (message: string, focus: HTMLInputElement = yearInp): void => {
      committed = false;
      showValidationError(focus, message);
      focus.focus();
      focus.select();
    };

    const commit = async () => {
      if (committed) return;
      committed = true;
      const y = yearInp.value;
      const rawM = monthInp.value;
      const rawD = dayInp.value;
      const allEmpty = !y && !rawM && !rawD;
      if (allEmpty) {
        if (safeString(currentValue).substring(0, 10)) {
          if (!await this.saveValue(row, col, null)) {
            keepDateEditorOpen(t("editor.saveFailed"));
            return;
          }
        } else {
          restore();
        }
        clearTransientClass(td, "db-cell-editing");
        return;
      }
      if (!y || !rawM || !rawD) {
        keepDateEditorOpen(t("validation.invalidDate"));
        return;
      }
      const m = parseInt(rawM, 10);
      const d = parseInt(rawD, 10);
      const yr = parseInt(y, 10);
      if (isNaN(yr) || isNaN(m) || isNaN(d) || m < 1 || m > 12) {
        keepDateEditorOpen(t("validation.invalidDate"), !y ? yearInp : !rawM ? monthInp : dayInp);
        return;
      }
      const maxD = daysInMonth(yr, m);
      const clampedD = Math.min(Math.max(d, 1), maxD);
      const newVal = `${y}-${pad2(String(m))}-${pad2(String(clampedD))}`;
      if (newVal !== safeString(currentValue).substring(0, 10)) {
        if (!await this.saveValue(row, col, newVal)) {
          keepDateEditorOpen(t("editor.saveFailed"));
          return;
        }
      } else {
        restore();
      }
      clearTransientClass(td, "db-cell-editing");
    };

    const restore = () => {
      clearTransientClass(td, "db-cell-editing");
      td.textContent = origText;
    };

    // Use relatedTarget to detect if focus is moving to another segment.
    // During blur, window.activeDocument.activeElement hasn't updated yet, so isInternalFocus()
    // using activeElement would fail for user-initiated focus changes (clicks).
    const isMovingToSegment = (e: FocusEvent) =>
      inputs.includes(e.relatedTarget as HTMLInputElement);

    const handleSegmentKey = (
      event: KeyboardEvent,
      input: HTMLInputElement,
      prev?: HTMLInputElement,
      _next?: HTMLInputElement,
    ) => {
      if (isImeComposing(event)) return;
      // Allow navigation and control keys
      if (["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        if (event.key === "Backspace" && input.value === "" && prev) {
          event.preventDefault();
          prev.focus();
        }
        return;
      }
      if (event.key === "Enter") { event.preventDefault(); void commit(); return; }
      if (event.key === "Escape") { committed = true; restore(); return; }
      // Block non-digits
      if (!/^\d$/.test(event.key)) { event.preventDefault(); return; }
    };

    // Year: auto-advance when 4 digits
    yearInp.value = initYear;
    yearInp.onkeydown = (e) => handleSegmentKey(e, yearInp, undefined, monthInp);
    yearInp.oninput = () => {
      yearInp.value = yearInp.value.replace(/\D/g, "");
      if (yearInp.value.length === 4) { monthInp.focus(); monthInp.select(); }
    };
    yearInp.onblur = (e) => { if (!committed && !isMovingToSegment(e)) void commit(); };

    // Month: smart auto-advance
    monthInp.value = initMonth;
    monthInp.onkeydown = (e) => handleSegmentKey(e, monthInp, yearInp, dayInp);
    monthInp.oninput = () => {
      monthInp.value = monthInp.value.replace(/\D/g, "");
      const v = monthInp.value;
      if (v.length === 1 && /^[2-9]$/.test(v)) {
        monthInp.value = `0${v}`;
        dayInp.focus();
        dayInp.select();
      } else if (v.length === 2) {
        dayInp.focus();
        dayInp.select();
      }
    };
    monthInp.onblur = (e) => { if (!committed && !isMovingToSegment(e)) void commit(); };

    // Day: auto-advance → commit
    dayInp.value = initDay;
    dayInp.onkeydown = (e) => handleSegmentKey(e, dayInp, monthInp);
    dayInp.oninput = () => {
      dayInp.value = dayInp.value.replace(/\D/g, "");
      const v = dayInp.value;
      if (v.length === 1 && /^[3-9]$/.test(v)) {
        dayInp.value = `0${v}`;
        void commit();
      } else if (v.length === 2) {
        void commit();
      }
    };
    dayInp.onblur = (e) => { if (!committed && !isMovingToSegment(e)) void commit(); };

    yearInp.focus();
    yearInp.select();
  }

  /** Body moved to `record-surface/cell-editor-date.ts`'s `openDateEditor`, unchanged, so
   *  the record sheet and board cards keep this one entry point without constructing the class. */
  private editDatePopover(
    td: HTMLElement,
    row: RowData,
    col: ColumnDef,
    currentValue: unknown,
    includeTime = false,
    session?: CellEditSession,
    initialDraft?: string,
  ): void {
    openDateEditor(this.buildCellEditorContext(), td, row, col, currentValue, includeTime, session, initialDraft);
  }

  /** Body moved to `record-surface/cell-editor-text.ts`'s `openTextEditor`, unchanged, so
   *  the record sheet and board cards keep this one entry point without constructing the class. */
  private editText(
    td: HTMLElement,
    row: RowData,
    col: ColumnDef,
    currentValue: unknown,
    origText: string,
    session?: CellEditSession,
    initialDraft?: string,
  ): void {
    openTextEditor(this.buildCellEditorContext(), td, row, col, currentValue, origText, session, initialDraft);
  }

  private async commitEditedValue(
    row: RowData,
    col: ColumnDef,
    value: unknown,
    session: CellEditSession | undefined,
    intent: CellEditCommitIntent = "replace",
  ): Promise<boolean> {
    this.editorCommitInProgress = true;
    try {
      if (session) {
        try {
          await session.commitValue(value, intent);
          return true;
        } catch (error) {
          new Notice(t("editor.saveFailed"));
          console.error("Note Database: inline editor commit failed", error);
          return false;
        }
      }
      return this.saveValue(row, col, value);
    } finally {
      this.editorCommitInProgress = false;
    }
  }

  private async saveValue(row: RowData, col: ColumnDef, value: unknown): Promise<boolean> {
    try {
      const normalizedValue = normalizeCellValueForSave(col, value);
      if (this.saveCellValue) {
        return (await this.saveCellValue(row, col, normalizedValue)) !== false;
      }
      await this.dataSource.updateFrontmatter(
        row.file,
        { [col.key]: normalizedValue },
        { sourceInstanceId: this.sourceInstanceId }
      );
      await this.refreshAfterSave();
      return true;
    } catch (err) {
      new Notice(t("errors.updateFailed", { error: String(err) }));
      return false;
    }
  }

  editFileName(td: HTMLElement, row: RowData, currentName: string, initialDraft = currentName): void {
    const save = async (value: string): Promise<EditorSaveResult> => {
      const newName = value.trim();
      if (!newName) return false;
      if (newName === currentName) return true;
      if (this.renameFile) {
        const result = await this.renameFile(row, newName);
        return result === true
          ? true
          : typeof result === "string" ? { validationMessage: result } : false;
      }
      const newPath = getRenamedMarkdownPath(row.file.path, newName);
      if (!newPath) return false;
      if (
        this.dataSource.fileExists(newPath) &&
        newPath.normalize("NFC").toLowerCase() !== row.file.path.normalize("NFC").toLowerCase()
      ) {
        new Notice(t("errors.fileExists", { name: newName }));
        return { validationMessage: t("errors.fileExists", { name: newName }) };
      }
      try {
        await this.dataSource.renameNote(
          row.file,
          newPath,
          { sourceInstanceId: this.sourceInstanceId }
        );
        await this.refreshAfterSave();
        return true;
      } catch (err) {
        new Notice(t("errors.renameFailed", { error: String(err) }));
        return { validationMessage: t("errors.renameFailed", { error: String(err) }) };
      }
    };
    // Popover editor does not touch the title DOM, so cancel needs no restore.
    const fileNameColumn: ColumnDef = { key: "file.name", label: "file.name", type: "text" };
    openSingleLineEditor(
      this.buildCellEditorContext(),
      td,
      row,
      fileNameColumn,
      initialDraft,
      "text",
      save,
      () => {},
      undefined,
      undefined,
      initialDraft === currentName,
    );
  }

  private formatNumber(value: number): string {
    return formatReportsNumber(value);
  }
}
