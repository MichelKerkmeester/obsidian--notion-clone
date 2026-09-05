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

import { App, Notice, setIcon, setTooltip } from "obsidian";
import {
  getColumnOptions,
  getInvalidObsidianTagValues,
  normalizeValidObsidianTagValue,
  normalizeOptionValueForKey,
  resolveOptionDisplay,
  toBooleanValue,
  toMultiSelectValuesForKey,
  toValidObsidianTagValues,
} from "../data/column-types";
import { getColumnDisplayType, getNumberDisplayStyle, isEmptyValue } from "../data/column-display";
import { formatEuroCurrency } from "../data/euro-format";
import * as FilesColumn from "../data/files-column";
import { formatReportsNumber, isReportsComputedColumn } from "../data/reports-display";
import { parseRelationValues } from "../data/relation-links";
import { renderRelationValue } from "./relation-value-renderer";
import { renderRecordIcon } from "./record-icon-renderer";
import { DataSource } from "../data/data-source";
import { formatDateTimeValueDisplay, formatDateValueDisplay, parseDateTimeParts } from "../data/date-time-format";
import { isImeComposing } from "../data/keyboard-utils";
import { closeActiveOptionColorPicker, openOptionColorPicker } from "./option-color-picker";
import { normalizeExternalUrlTarget, parseTextLink } from "../data/text-link";
import { assembleSchemeLinkTarget, isTextLinkScheme } from "../data/text-link-scheme";
import { parseInlineMarkdown } from "../data/inline-markdown";
import { getFileFieldFixedType, getRowFileFieldValue, isFileFieldKey, isReadonlyFileField } from "../data/file-fields";
import { getRenamedMarkdownPath } from "../data/file-rename-plan";
import { ColumnDef, ComputedFieldDef, RowData, StatusOptionDef } from "../data/types";
import { getEffectiveLocale, t } from "../i18n";
import { clamp, getVisiblePopoverBounds, isMobileBottomSheet, resolveAnchoredPopoverTop, resolvePopoverHorizontalLeft, setPosition } from "./popover-position";
import { positionToolbarPopover } from "./popover-position";
import { claimBottomDock } from "./mobile-bottom-sheet";
import { createSheetHeader } from "./mobile-bottom-sheet";
import { openDropdownMenu } from "./dropdown-field";
import { installPopoverAutoClose } from "./popover-auto-close";
import { setFieldTooltip } from "./field-tooltip";
import { FileTitleDisplay, getFileTitleDisplay, renderInlineFileTitle } from "./file-title-display";
import { isHTMLElement } from "./dom-guards";
import { safeString } from "../data/safe-string";
import { confirmWithModal } from "./modals/confirm-modal";
import { renderSpecialFileFieldValue, shouldRenderSpecialFileField } from "./file-field-renderer";
import { createCheckbox } from "./checkbox";
import { renderRating, renderProgress, renderProgressRing } from "./number-display-renderer";
import { renderInlineMarkdown, resolveInlineImageSrc } from "./inline-markdown-renderer";
import { getLocaleWeekStartsOn, getLocalDateKey, getWeekdayLabels, parseDateKeyToUtc } from "../data/calendar-date-time";
import { MiniCalendarEventIndex, MiniCalendarMode, renderMiniCalendar } from "./calendar-mini-calendar-renderer";
import { buildDatePickerWeeks, formatDatePickerMonthTitle, getDatePickerYearRangeStart, shiftDatePickerMonth } from "./date-picker-model";
import { OPTION_REGISTRATION_COLORS as OPTION_COLORS } from "../data/option-registration";
import { shouldCommitEmptyBulkDateClear } from "../data/bulk-edit";
import { SerialTaskQueue } from "../data/serial-task-queue";
import type { TableCellNavigationIntent } from "../data/table-keyboard-navigation";
import { markNoteHoverLink } from "./hover-link-preview";
import { isTouchDevice } from "../data/touch-environment";
import { resolveCellTapAction, trackCellGesture } from "./table-cell-gesture";
import { openExternalUrl } from "./open-external";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

let nextRelationListId = 0;

export interface CellOptionTransaction {
  previousOptions?: StatusOptionDef[];
  nextOptions?: StatusOptionDef[];
  cleanupRemovedValues?: string[];
  renameValues?: Array<{ from: string; to: string }>;
  setValue?: boolean;
  value?: unknown;
}

export type CellEditCommitIntent = "replace" | "clear";
type EditorSaveResult = void | boolean | "validation" | { validationMessage: string };

export interface CellEditSession {
  mixed?: boolean;
  placeholder?: string;
  anchorEl?: () => HTMLElement | null;
  commitValue(value: unknown, intent?: CellEditCommitIntent): Promise<void>;
  commitOptionTransaction?(transaction: CellOptionTransaction): Promise<void>;
  onClose?(): void;
}

interface OptionDragPreview {
  preview: HTMLElement;
  offsetX: number;
  offsetY: number;
}

interface MetadataCacheWithTags {
  getTags?(): Record<string, number>;
}

// ───────────────────────────────────────────────────────────────────
// 3. PUBLIC API
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
// 4. RENDERER
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

  renderCell(td: HTMLElement, row: RowData, col: ColumnDef): void {
    td.addClass("db-cell");
    if (col.wrap) td.addClass("db-cell-wrap");
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
        this.editTextPopover(target, row, col, initial, session, placeholder);
      } else {
        this.editSingleLinePopover(
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

  private editRelationPopover(
    target: HTMLElement,
    row: RowData,
    col: ColumnDef,
    currentValue: unknown,
    session?: CellEditSession,
    initialSearch = "",
  ): void {
    this.closeActiveOptionPopover();
    const targetDatabaseId = col.relationConfig?.targetDatabaseId;
    const database = this.dataSource.getViewDefFiles()
      .map((entry) => entry.config)
      .find((candidate) => candidate.id === targetDatabaseId);
    if (!database) {
      new Notice(t("relation.targetDatabaseRequired"));
      return;
    }
    const records = this.dataSource.getRecordsForDatabase(database);
    const recordIconField = database.recordIconField &&
      database.schema.columns.some((candidate) =>
        candidate.key === database.recordIconField && candidate.type === "text"
      )
      ? database.recordIconField
      : undefined;
    const selectedPaths = new Set<string>();
    const selectedOrder: string[] = [];
    const existingRawByPath = new Map<string, string>();
    const unresolved: string[] = [];
    for (const link of parseRelationValues(currentValue)) {
      const resolved = this.app?.metadataCache.getFirstLinkpathDest(link.target, row.file.path);
      if (resolved && records.some((record) => record.file.path === resolved.path)) {
        if (!selectedPaths.has(resolved.path)) selectedOrder.push(resolved.path);
        selectedPaths.add(resolved.path);
        existingRawByPath.set(resolved.path, link.raw);
      }
      else unresolved.push(link.raw);
    }

    const host = window.activeDocument.body;
    const popover = host.createDiv({ cls: "db-cell-option-popover db-relation-popover" });
    popover.setAttr("role", "dialog");
    popover.setAttr("aria-label", col.label || col.key);
    let closed = false;
    let removeAutoClose: (() => void) | undefined;
    const close = () => {
      if (closed) return;
      closed = true;
      removeAutoClose?.();
      popover.remove();
      if (this.activeOptionPopoverClose === close) this.activeOptionPopoverClose = undefined;
      session?.onClose?.();
    };
    const phoneSheet = isMobileBottomSheet(host.ownerDocument);
    if (phoneSheet) createSheetHeader(popover, { title: col.label || col.key, onClose: close });
    const header = popover.createDiv({ cls: "db-relation-popover-header" });
    if (!phoneSheet) header.createDiv({ cls: "db-relation-popover-title", text: col.label || col.key });
    const search = header.createEl("input", {
      cls: "db-cell-option-search",
      attr: { type: "search", placeholder: t("relation.search"), "aria-label": t("relation.search"), "aria-autocomplete": "list" },
    });
    search.value = initialSearch;
    const list = popover.createDiv({ cls: "db-cell-option-list db-relation-option-list", attr: { role: "listbox", "aria-multiselectable": "true", "aria-label": col.label || col.key } });
    const listId = `db-relation-list-${++nextRelationListId}`;
    list.setAttr("id", listId);
    search.setAttr("aria-controls", listId);
    const footer = popover.createDiv({ cls: "db-relation-popover-footer" });
    const count = footer.createSpan({ cls: "db-relation-selected-count" });
    const clear = footer.createEl("button", { text: t("common.clear"), cls: "db-relation-clear", attr: { type: "button" } });
    const actions = footer.createDiv({ cls: "db-relation-footer-actions" });
    const apply = actions.createEl("button", { text: t("common.save"), cls: "mod-cta db-relation-footer-button", attr: { type: "button" } });
    let activeIndex = 0;
    const rowHeight = 34;
    const windowSize = 80;
    let scrollFrame: number | undefined;
    const getFilteredRecords = () => {
      const query = search.value.trim().toLowerCase();
      return records.filter((record) => {
        if (!query) return true;
        const title = record.file.basename || record.file.name.replace(/\.md$/i, "");
        return `${title} ${record.file.path}`.toLowerCase().includes(query);
      });
    };
    const renderList = (preserveScroll = true) => {
      const scrollTop = preserveScroll ? list.scrollTop : 0;
      const filtered = getFilteredRecords();
      if (activeIndex >= filtered.length) activeIndex = Math.max(0, filtered.length - 1);
      list.empty();
      const empty = list.createDiv({ cls: "db-dropdown-empty db-relation-empty", text: t("relation.noResults"), attr: { role: "status", hidden: filtered.length > 0 ? "true" : "false" } });
      if (!filtered.length) {
        empty.removeAttribute("hidden");
        count.textContent = t("relation.selectedCount", { count: selectedPaths.size });
        return;
      }
      const start = Math.max(0, Math.min(Math.max(0, filtered.length - windowSize), Math.floor(scrollTop / rowHeight) - 8));
      const end = Math.min(filtered.length, start + windowSize);
      if (start > 0) list.createDiv({ cls: "db-relation-list-spacer", attr: { "aria-hidden": "true", style: `height: ${start * rowHeight}px` } });
      for (let filteredIndex = start; filteredIndex < end; filteredIndex++) {
        const record = filtered[filteredIndex];
        const title = record.file.basename || record.file.name.replace(/\.md$/i, "");
        const option = list.createEl("button", {
          cls: `db-cell-option-item db-menu-item db-relation-option-item${selectedPaths.has(record.file.path) ? " is-selected" : ""}`,
          attr: { type: "button", role: "option", "aria-selected": selectedPaths.has(record.file.path) ? "true" : "false", tabindex: filteredIndex === activeIndex ? "0" : "-1", "data-index": String(filteredIndex) },
        });
        renderRecordIcon(option, recordIconField ? record.frontmatter[recordIconField] : undefined, {
          compact: true,
          defaultIcon: "file-text",
        }).addClass("db-relation-option-icon");
        option.createSpan({ cls: "db-dropdown-option-label db-menu-item-label", text: title });
        const check = option.createSpan({ cls: "db-option-check db-menu-item-check db-relation-option-check" });
        if (selectedPaths.has(record.file.path)) setIcon(check, "check");
        option.onclick = () => {
          if (selectedPaths.has(record.file.path)) {
            selectedPaths.delete(record.file.path);
            const index = selectedOrder.indexOf(record.file.path);
            if (index >= 0) selectedOrder.splice(index, 1);
          } else {
            selectedPaths.add(record.file.path);
            selectedOrder.push(record.file.path);
          }
          activeIndex = filteredIndex;
          renderList();
        };
      }
      if (end < filtered.length) list.createDiv({ cls: "db-relation-list-spacer", attr: { "aria-hidden": "true", style: `height: ${(filtered.length - end) * rowHeight}px` } });
      if (preserveScroll) list.scrollTop = scrollTop;
      count.textContent = t("relation.selectedCount", { count: selectedPaths.size });
    };
    const focusActive = () => {
      const active = list.querySelector<HTMLButtonElement>(`[data-index="${activeIndex}"]`);
      active?.focus({ preventScroll: true });
    };
    const moveActive = (delta: number) => {
      const filtered = getFilteredRecords();
      if (!filtered.length) return;
      activeIndex = Math.max(0, Math.min(filtered.length - 1, activeIndex + delta));
      const currentScroll = list.scrollTop;
      const nextTop = activeIndex * rowHeight;
      if (nextTop < currentScroll) list.scrollTop = nextTop;
      else if (nextTop + rowHeight > currentScroll + list.clientHeight) list.scrollTop = nextTop - list.clientHeight + rowHeight;
      renderList();
      window.requestAnimationFrame(focusActive);
    };
    search.oninput = () => { activeIndex = 0; renderList(false); };
    search.onkeydown = (event) => {
      if (isImeComposing(event)) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        list.focus();
        moveActive(0);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        list.querySelector<HTMLButtonElement>("[data-index=\"0\"]")?.click();
        return;
      }
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
    };
    list.onkeydown = (event) => {
      if (isImeComposing(event)) return;
      const option = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[role=option]");
      if (!option) return;
      const index = Number(option.getAttribute("data-index"));
      if (Number.isFinite(index)) activeIndex = index;
      if (event.key === "ArrowDown") { event.preventDefault(); moveActive(1); }
      else if (event.key === "ArrowUp") { event.preventDefault(); moveActive(-1); }
      else if (event.key === "Home") { event.preventDefault(); activeIndex = 0; renderList(false); window.requestAnimationFrame(focusActive); }
      else if (event.key === "End") { event.preventDefault(); activeIndex = Math.max(0, getFilteredRecords().length - 1); renderList(); window.requestAnimationFrame(focusActive); }
      else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); option.click(); }
    };
    list.onscroll = () => {
      if (getFilteredRecords().length <= windowSize || scrollFrame !== undefined) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = undefined;
        renderList();
      });
    };
    clear.onclick = () => {
      selectedPaths.clear();
      selectedOrder.splice(0, selectedOrder.length);
      unresolved.splice(0, unresolved.length);
      renderList();
    };
    apply.onclick = () => {
      const values = [
        ...unresolved,
        ...selectedOrder.map((path) => existingRawByPath.get(path) || `[[${path.replace(/\.md$/i, "")}]]`),
      ];
      void this.commitEditedValue(row, col, values, session, values.length ? "replace" : "clear")
        .then(() => {
          close();
          this.finishInlineEdit(row, col, session, "down");
        });
    };
    renderList(false);
    positionToolbarPopover(popover, target, { minWidth: 360, preferredWidth: 420, maxWidth: 520, gap: 4 });
    this.activeOptionPopoverClose = close;
    removeAutoClose = installPopoverAutoClose({ panel: popover, anchorEl: target, close });
    window.setTimeout(() => search.focus(), 0);
  }

  private selectCell(td: HTMLElement): void {
    td.focus();
  }

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
    this.closeActiveOptionPopover();
    const rawContainer = td.closest(".note-database-container");
    const container = isHTMLElement(rawContainer) ? rawContainer : null;
    const host = container || window.activeDocument.body;
    host.querySelectorAll(".db-cell-option-popover").forEach((el) => el.remove());
    const isFileTags = col.key === "file.tags";
    const optionKey = isFileTags ? "tags" : col.key;
    const originalValues = multiple
      ? (isFileTags ? toValidObsidianTagValues(currentValue) : toMultiSelectValuesForKey(optionKey, currentValue))
      : [normalizeOptionValueForKey(optionKey, currentValue)].filter(Boolean);
    const selected = new Set(originalValues);
    const popover = host.createDiv({ cls: "db-cell-option-popover" });
    let activeOptionIndex = 0;
    let closed = false;
    let sessionClose: (() => void) | undefined;
    let removeAutoClose: (() => void) | undefined;

    const close = (intent?: TableCellNavigationIntent) => {
      if (closed) return;
      // Esc ("stay"): if the option color picker is open, only close it (via the
      // shared closer that also cleans its listeners) and keep this option popover
      // open. This is the funnel point for BOTH Esc paths — the scope-registered
      // Esc (handleInlineEditorEscape → cancelActiveInlineEditor) and the document
      // keydown Esc — so guarding here covers both.
      if (intent === "stay" && closeActiveOptionColorPicker(window.activeDocument)) {
        return;
      }
      closed = true;
      if (this.activeOptionPopoverClose === closeFromKeyboard) this.activeOptionPopoverClose = undefined;
      if (this.activeInlineEditorCancel === closeFromKeyboard) this.activeInlineEditorCancel = undefined;
      if (sessionClose && this.activeTextEditClose === sessionClose) this.activeTextEditClose = undefined;
      removeAutoClose?.();
      popover.remove();
      // Clean up any leaked color picker popups on window.activeDocument.body
      window.activeDocument.body.querySelectorAll(".db-color-picker-popup").forEach(el => el.remove());
      window.activeDocument.removeEventListener("keydown", onKeydown, true);
      session?.onClose?.();
      if (intent) this.finishInlineEdit(row, col, session, intent);
    };
    const closeFromKeyboard = () => close("stay");
    this.activeOptionPopoverClose = closeFromKeyboard;
    this.activeInlineEditorCancel = closeFromKeyboard;
    if (session) {
      sessionClose = () => close();
      this.activeTextEditClose = sessionClose;
    }
    const onKeydown = (event: KeyboardEvent) => {
      if (isImeComposing(event)) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        close("stay");
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        close(event.shiftKey ? "previous" : "next");
        return;
      }
      if (isHTMLElement(event.target) && event.target.closest("input, textarea, select")) return;
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Enter") return;
      const items = Array.from(popover.querySelectorAll<HTMLButtonElement>(".db-cell-option-item"));
      if (!items.length) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (event.key === "ArrowDown") activeOptionIndex = Math.min(items.length - 1, activeOptionIndex + 1);
      if (event.key === "ArrowUp") activeOptionIndex = Math.max(0, activeOptionIndex - 1);
      const item = items[activeOptionIndex];
      if (event.key === "Enter") {
        item.click();
        if (!multiple) {
          void this.optionCommitQueue.enqueue(async () => undefined)
            .then(() => close("down"));
        }
      }
      else item.focus();
    };
    // Build option objects from column config (mutable copies)
    const optionDefs: StatusOptionDef[] = [];
    const registeredOptionValues = new Set<string>();
    if (isFileTags) {
      optionDefs.push(...this.getFileTagDraftOptions(col, originalValues));
    } else {
      const seenOptions = new Set<string>();
      for (const option of getColumnOptions(col)) {
        const value = normalizeOptionValueForKey(optionKey, option.value);
        if (!value || seenOptions.has(value)) continue;
        seenOptions.add(value);
        registeredOptionValues.add(value);
        optionDefs.push({ ...option, value });
      }
      for (const v of originalValues) {
        if (v && !optionDefs.find(o => o.value === v)) {
          optionDefs.push({ value: v, color: "gray" });
        }
      }
    }

    const cloneOptions = (options: StatusOptionDef[]) => options.map((option) => ({ ...option }));
    const getCommittedOptions = () => cloneOptions(col.statusOptions || []);
    const getDraftOptions = () => isFileTags
      ? this.persistFileTagColorOptions(optionDefs)
      : cloneOptions(optionDefs.filter((option) => registeredOptionValues.has(option.value)));
    const commitOptionTransaction = async (transaction: CellOptionTransaction) => {
      try {
        if (session?.commitOptionTransaction) {
          await session.commitOptionTransaction(transaction);
          return;
        }
        if (this.commitCellOptionTransaction) {
          await this.commitCellOptionTransaction(row, col, transaction);
          return;
        }
        if (transaction.nextOptions) {
          col.statusOptions = cloneOptions(transaction.nextOptions);
          col.statusPresetId = undefined;
        }
        if (transaction.setValue) await this.commitEditedValue(row, col, transaction.value, session);
        else await this.refreshAfterSave();
      } catch (err) {
        console.error("Note Database: failed to commit option edit", err);
        new Notice(t("errors.updateFailed", { error: String(err) }));
      }
    };
    const commitValue = (value: unknown) => {
      void this.optionCommitQueue.enqueue(() => commitOptionTransaction({
        setValue: true,
        value: this.normalizeCellValueForSave(col, value),
      }));
    };
    const commitOptions = (transaction: Omit<CellOptionTransaction, "previousOptions" | "nextOptions"> = {}) => {
      const nextOptions = getDraftOptions();
      void this.optionCommitQueue.enqueue(() => commitOptionTransaction({
        previousOptions: getCommittedOptions(),
        nextOptions,
        ...transaction,
      }));
    };

    const renderOptionList = () => {
      // Rebuild transient option rows and empty state from the current local selection set.
      popover.querySelectorAll(".db-cell-option-item, .db-panel-empty, .db-option-drop-line").forEach(el => el.remove());
      activeOptionIndex = 0;
      if (optionDefs.length === 0) {
        const empty = popover.createDiv({ cls: "db-panel-empty", text: t("cell.noOptions") });
        popover.insertBefore(empty, popover.querySelector(".db-cell-option-add"));
      }
      optionDefs.forEach((opt, idx) => {
        const isTransient = !isFileTags && !registeredOptionValues.has(opt.value);
        if (selected.has(opt.value)) activeOptionIndex = idx;
        const item = popover.createEl("button", { cls: "db-cell-option-item" });
        popover.insertBefore(item, popover.querySelector(".db-cell-option-add"));

        // Drag handle for reorder
        const handle = item.createSpan({ cls: "db-option-drag-handle", text: "⠿" });
        if (isFileTags || isTransient) handle.addClass("is-hidden");
        handle.onmousedown = (e) => {
          if (isFileTags || isTransient) return;
          e.stopPropagation();
          e.preventDefault();

          item.addClass("is-dragging");
          const dragPreview = this.createOptionDragPreview(item, e);
          let dropLine: HTMLElement | null = null;
          let lastTarget = idx;

          const removeDropLine = () => { dropLine?.remove(); dropLine = null; };

          const onMove = (ev: MouseEvent) => {
            this.updateOptionDragPreview(dragPreview, ev);
            // Find insert-before position in DOM
            const items = Array.from(popover.querySelectorAll<HTMLButtonElement>(".db-cell-option-item"));
            let insertBefore = items.length;
            for (let i = 0; i < items.length; i++) {
              const ir = items[i].getBoundingClientRect();
              if (ev.clientY < ir.top + ir.height / 2) {
                insertBefore = i;
                break;
              }
            }

            // Convert to target array index after removing dragged item
            const target = insertBefore <= idx ? insertBefore : insertBefore - 1;

            if (target !== idx) {
              removeDropLine();
              dropLine = popover.createDiv({ cls: "db-option-drop-line" });
              const ref = items[insertBefore];
              if (ref) popover.insertBefore(dropLine, ref);
              else popover.insertBefore(dropLine, popover.querySelector(".db-cell-option-add"));
              lastTarget = target;
            } else {
              removeDropLine();
              lastTarget = idx;
            }
          };

          const onUp = () => {
            removeDropLine();
            item.removeClass("is-dragging");
            this.removeOptionDragPreview(dragPreview);
            if (lastTarget !== idx && lastTarget >= 0 && lastTarget < optionDefs.length) {
              const [moved] = optionDefs.splice(idx, 1);
              optionDefs.splice(lastTarget, 0, moved);
              commitOptions();
              renderOptionList();
            }
            window.activeDocument.removeEventListener("mousemove", onMove);
            window.activeDocument.removeEventListener("mouseup", onUp);
          };

          window.activeDocument.addEventListener("mousemove", onMove);
          window.activeDocument.addEventListener("mouseup", onUp);
        };

        const moveControls = item.createSpan({ cls: "db-mobile-reorder-controls" });
        if (isFileTags || isTransient) moveControls.addClass("is-hidden");
        const upBtn = moveControls.createEl("button", {
          attr: { type: "button", title: t("menu.moveUp"), "aria-label": t("menu.moveUp") },
        });
        setIcon(upBtn, "arrow-up");
        upBtn.disabled = idx === 0;
        upBtn.onclick = (event) => {
          if (isFileTags) return;
          event.preventDefault();
          event.stopPropagation();
          const [moved] = optionDefs.splice(idx, 1);
          optionDefs.splice(idx - 1, 0, moved);
          commitOptions();
          renderOptionList();
        };
        const downBtn = moveControls.createEl("button", {
          attr: { type: "button", title: t("menu.moveDown"), "aria-label": t("menu.moveDown") },
        });
        setIcon(downBtn, "arrow-down");
        downBtn.disabled = idx >= optionDefs.length - 1;
        downBtn.onclick = (event) => {
          if (isFileTags) return;
          event.preventDefault();
          event.stopPropagation();
          const [moved] = optionDefs.splice(idx, 1);
          optionDefs.splice(idx + 1, 0, moved);
          commitOptions();
          renderOptionList();
        };

        // Color dot — opens color picker
        const dot = item.createSpan({ cls: "db-option-color-dot" });
        const updateDot = () => {
          dot.className = `db-option-color-dot db-option-color-${opt.color}`;
        };
        updateDot();
        dot.onclick = (e) => {
          if (isTransient) return;
          e.stopPropagation();
          e.preventDefault();
          showColorPicker(dot, opt, () => { commitOptions(); updateDot(); });
        };

        // Label — double-click to rename
        const label = item.createSpan({ text: opt.value, cls: "db-option-label" });
        label.ondblclick = (e) => {
          if (isFileTags || isTransient) return;
          e.stopPropagation();
          e.preventDefault();
          const input = window.activeDocument.createElement("input");
          input.type = "text";
          input.value = opt.value;
          input.className = "db-option-rename-input";
          label.replaceWith(input);
          input.focus();
          input.select();
          let finished = false;
          const finish = () => {
            if (finished) return;
            finished = true;
            const name = input.value.trim();
            if (name && name !== opt.value && !optionDefs.some(o => o !== opt && o.value === name)) {
              const oldValue = opt.value;
              opt.value = name;
              registeredOptionValues.delete(oldValue);
              registeredOptionValues.add(name);
              if (selected.has(oldValue)) {
                selected.delete(oldValue);
                selected.add(name);
              }
              commitOptions({ renameValues: [{ from: oldValue, to: name }] });
            }
            input.replaceWith(label);
            label.textContent = opt.value;
          };
          input.onblur = finish;
          input.onkeydown = (ev) => {
            if (isImeComposing(ev)) return;
            if (ev.key === "Enter") finish();
            if (ev.key === "Escape") { finished = true; input.replaceWith(label); }
          };
        };

        // Check mark
        const mark = item.createSpan({ text: selected.has(opt.value) ? "✓" : "", cls: "db-option-check" });
        const deleteButton = item.createEl("button", {
          cls: "db-option-delete",
          attr: {
            title: isTransient ? t("cell.addOption") : t("common.delete"),
            "aria-label": isTransient ? t("cell.addOption") : t("common.delete"),
          },
        });
        if (isFileTags) deleteButton.addClass("is-hidden");
        setIcon(deleteButton, isTransient ? "plus" : "trash");
        deleteButton.onmousedown = (event) => event.preventDefault();
        deleteButton.onclick = async (event) => {
          if (isFileTags) return;
          event.preventDefault();
          event.stopPropagation();
          if (isTransient) {
            registeredOptionValues.add(opt.value);
            opt.color = OPTION_COLORS[(registeredOptionValues.size - 1) % OPTION_COLORS.length];
            commitOptions();
            renderOptionList();
            return;
          }
          if (!this.app || !await confirmWithModal(this.app, {
            title: t("common.delete"),
            message: t("modal.confirmDeleteOption", { name: opt.value }),
            confirmText: t("common.delete"),
            danger: true,
          })) return;
          const removed = opt.value;
          optionDefs.splice(idx, 1);
          registeredOptionValues.delete(removed);
          const wasSelected = selected.delete(removed);
          commitOptions({
            cleanupRemovedValues: [removed],
            setValue: wasSelected,
            value: multiple ? this.normalizeCellValueForSave(col, Array.from(selected)) : null,
          });
          renderOptionList();
        };
        deleteButton.onkeydown = (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          deleteButton.click();
        };

        item.onmousedown = (event) => event.preventDefault();
        item.onkeydown = (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.stopPropagation();
          event.preventDefault();
        };
        item.onclick = () => {
          if (!multiple) {
            selected.clear();
            selected.add(opt.value);
            commitValue(opt.value);
            // Update check marks
            popover.querySelectorAll(".db-option-check").forEach(el => { el.textContent = ""; });
            mark.textContent = "✓";
            return;
          }
          if (selected.has(opt.value)) selected.delete(opt.value);
          else selected.add(opt.value);
          mark.textContent = selected.has(opt.value) ? "✓" : "";
          commitValue(Array.from(selected));
        };
      });
    };

    // Color picker popup — shared with board group creation and mounted on body.
    const showColorPicker = (anchor: HTMLElement, opt: StatusOptionDef, onUpdate: () => void) => {
      openOptionColorPicker(anchor, opt.color || "gray", (color) => {
        const oldColor = opt.color;
        opt.color = color;
        onUpdate();
        // Update visible cells in the table immediately
        if (container) {
          container.querySelectorAll(`.status-color-${oldColor}`).forEach((badge: Element) => {
            if (badge.textContent === opt.value) {
              badge.removeClass(`status-color-${oldColor}`);
              badge.addClass(`status-color-${color}`);
            }
          });
        }
      }, opt.value);
    };

    // New option input
    const addRow = popover.createDiv({ cls: "db-cell-option-add" });
    const addInput = addRow.createEl("input", {
      attr: { placeholder: t("cell.addOption"), type: "text" },
    });
    addInput.onkeydown = (e) => {
      if (isImeComposing(e)) return;
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (isFileTags) {
        const invalidTags = getInvalidObsidianTagValues([addInput.value]);
        if (invalidTags.length > 0) {
          new Notice(t("fileField.invalidTag", { tag: invalidTags[0] }));
          return;
        }
      }
      const name = isFileTags ? normalizeValidObsidianTagValue(addInput.value) : normalizeOptionValueForKey(optionKey, addInput.value);
      if (!name) return;
      const existing = optionDefs.find((option) => option.value === name);
      if (existing && !isFileTags && !registeredOptionValues.has(name)) {
        registeredOptionValues.add(name);
        existing.color = OPTION_COLORS[(registeredOptionValues.size - 1) % OPTION_COLORS.length];
        addInput.value = "";
        commitOptions({ setValue: true, value: multiple ? Array.from(selected.add(name)) : name });
        renderOptionList();
        return;
      }
      if (existing) {
        if (multiple) selected.add(name);
        else {
          selected.clear();
          selected.add(name);
        }
        commitValue(multiple ? Array.from(selected) : name);
        addInput.value = "";
        renderOptionList();
        if (!multiple) {
          void this.optionCommitQueue.enqueue(async () => undefined)
            .then(() => close("down"));
        }
        return;
      }
      optionDefs.push({ value: name, color: isFileTags ? "gray" : OPTION_COLORS[optionDefs.length % OPTION_COLORS.length] });
      if (!isFileTags) registeredOptionValues.add(name);
      addInput.value = "";
      if (!multiple) {
        selected.clear();
        selected.add(name);
        popover.querySelectorAll(".db-option-check").forEach(el => { el.textContent = ""; });
        if (isFileTags) commitValue(name);
        else commitOptions({ setValue: true, value: name });
      } else {
        selected.add(name);
        if (isFileTags) commitValue(Array.from(selected));
        else commitOptions({ setValue: true, value: Array.from(selected) });
      }
      renderOptionList();
    };

    // Clear button (at bottom)
    const actions = popover.createDiv({ cls: "db-panel-header-actions" });
    const clearBtn = actions.createEl("button", { cls: "db-panel-button", text: t("cell.clear") });
    clearBtn.onmousedown = (event) => event.preventDefault();
    clearBtn.onclick = () => {
      if (multiple) {
        selected.clear();
        commitValue([]);
        popover.querySelectorAll(".db-option-check").forEach(el => { el.textContent = ""; });
      } else {
        selected.clear();
        commitValue(null);
        popover.querySelectorAll(".db-option-check").forEach(el => { el.textContent = ""; });
      }
    };

    renderOptionList();
    this.positionOptionPopover(popover, td, container, anchorPoint, session);
    window.requestAnimationFrame(() => this.positionOptionPopover(popover, td, container, anchorPoint, session));
    if (initialSearch) {
      addInput.value = initialSearch;
      window.requestAnimationFrame(() => {
        addInput.focus();
        addInput.setSelectionRange(addInput.value.length, addInput.value.length);
      });
    }
    window.activeDocument.addEventListener("keydown", onKeydown, true);
    removeAutoClose = installPopoverAutoClose({ panel: popover, anchorEl: td, close: () => close(), closeOnEscape: false });
  }

  private editNumber(
    td: HTMLElement,
    row: RowData,
    col: ColumnDef,
    currentValue: unknown,
    session?: CellEditSession,
    initialDraft?: string,
  ): void {
    const placeholder = session?.mixed ? (session?.placeholder ?? "") : undefined;
    const initial = initialDraft ?? (session?.mixed ? "" : safeString(currentValue));
    this.editSingleLinePopover(td, row, col, initial, "number", async (inputValue) => {
      const raw = inputValue;
      const newVal = raw ? parseFloat(raw) : "";
      if (raw && (typeof newVal !== "number" || !Number.isFinite(newVal))) {
        this.showValidationError(td, t("validation.invalidNumber"));
        return "validation";
      }
      if (String(newVal) !== String(currentValue) || session?.mixed) {
        const success = await this.commitEditedValue(row, col, newVal, session, raw ? "replace" : "clear");
        if (!success) return false;
      } else {
        this.renderNumberValue(td, undefined, col, currentValue);
      }
      this.clearTransientClass(td, "db-cell-editing");
    }, () => {
      this.renderNumberValue(td, undefined, col, currentValue);
      this.clearTransientClass(td, "db-cell-editing");
    }, session, placeholder, initialDraft === undefined);
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
      this.showValidationError(focus, message);
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
        this.clearTransientClass(td, "db-cell-editing");
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
      this.clearTransientClass(td, "db-cell-editing");
    };

    const restore = () => {
      this.clearTransientClass(td, "db-cell-editing");
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

  private editDatePopover(
    td: HTMLElement,
    row: RowData,
    col: ColumnDef,
    currentValue: unknown,
    includeTime = false,
    session?: CellEditSession,
    initialDraft?: string,
  ): void {
    const rawContainer = td.closest(".note-database-container");
    const container = isHTMLElement(rawContainer) ? rawContainer : null;
    const isMobile = isTouchDevice(container || td);
    const host = isMobile ? null : (container || window.activeDocument.body);

    this.activeTextEditClose?.();
    td.addClass("db-cell-editing");

    const isMixed = !!session?.mixed;
    const dateParts = isMixed ? null : parseDateTimeParts(currentValue);
    const fallbackParts = isMixed ? [] : safeString(currentValue).substring(0, 10).split("-");
    const initYear = initialDraft ?? (dateParts ? String(dateParts.year) : fallbackParts[0] || "");
    const initMonth = initialDraft ? "" : dateParts?.month || fallbackParts[1] || "";
    const initDay = initialDraft ? "" : dateParts?.day || fallbackParts[2] || "";
    const initTime = initialDraft ? "" : dateParts?.time || "";
    const initHour = initTime.slice(0, 2);
    const initMinute = initTime.slice(3, 5);
    const rawInitialDateKey = dateParts?.dateKey || safeString(currentValue).substring(0, 10);
    const initialDateKey = parseDateKeyToUtc(rawInitialDateKey) ? rawInitialDateKey : getLocalDateKey();
    let pickerMonthKey = initialDateKey.slice(0, 7);
    let pickerMode: MiniCalendarMode = "day";

    let popover: HTMLElement;
    let closeBtn: HTMLButtonElement | undefined;
    let editScrollContainer: HTMLElement | null = null;
    let removeMobileViewportListeners = () => undefined;

    if (isMobile) {
      editScrollContainer = td.closest(".note-database-container")
        || td.closest(".markdown-preview-view")
        || window.activeDocument.body;

      popover = editScrollContainer.createDiv({ cls: "db-cell-edit-popover is-mobile is-inline-overlay db-date-edit-popover" });

      const containerRect = editScrollContainer.getBoundingClientRect();
      const tdRect = this.bulkAnchorRect(session) ?? td.getBoundingClientRect();
      const scrollTop = editScrollContainer.scrollTop || 0;
      const relativeTop = tdRect.top - containerRect.top + scrollTop;

      popover.setCssProps({ position: "absolute", left: "0", right: "0", top: `${relativeTop + tdRect.height + 2}px`, "z-index": "var(--db-layer-popover, 100)" });

      closeBtn = popover.createEl("button", {
        cls: "db-cell-edit-close",
        attr: { type: "button", title: t("common.cancel"), "aria-label": t("common.cancel") },
      });
      setIcon(closeBtn, "x");
    } else {
      popover = (host as HTMLElement).createDiv({ cls: "db-cell-edit-popover db-date-edit-popover" });
    }
    if (includeTime) popover.addClass("is-datetime");
    popover.dataset.noteDatabaseRowPath = row.file.path;
    popover.dataset.noteDatabaseColumnKey = col.key;
    popover.dataset.noteDatabaseEditorKind = "date";

    const segments = popover.createDiv({ cls: "db-date-segments" });
    const yearInp = segments.createEl("input", { cls: "db-date-seg", attr: { maxlength: "4", placeholder: "YYYY" } });
    segments.createSpan({ cls: "db-date-sep", text: "-" });
    const monthInp = segments.createEl("input", { cls: "db-date-seg", attr: { maxlength: "2", placeholder: "MM" } });
    segments.createSpan({ cls: "db-date-sep", text: "-" });
    const dayInp = segments.createEl("input", { cls: "db-date-seg", attr: { maxlength: "2", placeholder: "DD" } });
    let hourInp: HTMLInputElement | undefined;
    let minuteInp: HTMLInputElement | undefined;
    if (includeTime) {
      segments.createSpan({ cls: "db-date-sep db-time-sep", text: " " });
      hourInp = segments.createEl("input", { cls: "db-date-seg db-time-seg db-hour-seg", attr: { maxlength: "2", placeholder: "HH" } });
      segments.createSpan({ cls: "db-date-sep db-time-colon", text: ":" });
      const minutePlaceholder = "m" + "m";
      minuteInp = segments.createEl("input", { cls: "db-date-seg db-time-seg db-minute-seg", attr: { maxlength: "2", placeholder: minutePlaceholder } });
    }

    const inputs = [yearInp, monthInp, dayInp, hourInp, minuteInp].filter((input): input is HTMLInputElement => Boolean(input));
    let committed = false;

    const pad2 = (v: string) => v.length === 1 ? `0${v}` : v;
    const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    const daysInMonth = (y: number, m: number) => {
      if (m === 2) return isLeapYear(y) ? 29 : 28;
      if ([4, 6, 9, 11].includes(m)) return 30;
      return 31;
    };

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      removeMobileViewportListeners();
      popover.remove();
      td.removeClass("db-cell-editing");
      window.activeDocument.removeEventListener("mousedown", onOutside, true);
      window.activeDocument.removeEventListener("keydown", onDocumentKeydown, true);
      if (this.activeTextEditClose === close) this.activeTextEditClose = undefined;
      if (this.activeInlineEditorCancel === cancel) this.activeInlineEditorCancel = undefined;
      session?.onClose?.();
    };
    this.activeTextEditClose = close;

    const commit = async (intent?: TableCellNavigationIntent) => {
      if (committed) return;
      committed = true;
      const finish = () => {
        close();
        if (intent) this.finishInlineEdit(row, col, session, intent);
      };
      const y = yearInp.value;
      const rawM = monthInp.value;
      const rawD = dayInp.value;
      const allEmpty = !y && !rawM && !rawD;
      if (allEmpty) {
        if (shouldCommitEmptyBulkDateClear(Boolean(session?.mixed), currentValue)) {
          await this.commitEditedValue(row, col, null, session, "clear");
        }
        finish();
        return;
      }
      if (!y || !rawM || !rawD) {
        committed = false;
        const focus = inputs.find((input) => !input.value) || yearInp;
        this.showValidationError(focus, t("validation.invalidDate"));
        focus.focus();
        return;
      }
      const m = parseInt(rawM, 10);
      const d = parseInt(rawD, 10);
      const yr = parseInt(y, 10);
      if (isNaN(yr) || isNaN(m) || isNaN(d)) {
        committed = false;
        this.showValidationError(yearInp, t("validation.invalidDate"));
        yearInp.focus();
        return;
      }
      const clampedM = Math.min(Math.max(m, 1), 12);
      const maxD = daysInMonth(yr, clampedM);
      const clampedD = Math.min(Math.max(d, 1), maxD);
      if (m !== clampedM || d !== clampedD) {
        new Notice(t("cell.invalidDate"));
      }
      const dateKey = `${y}-${pad2(String(clampedM))}-${pad2(String(clampedD))}`;
      const newVal = includeTime ? `${dateKey}T${normalizeTimeForSave(hourInp?.value || "", minuteInp?.value || "")}` : dateKey;
      const currentNormalized = dateParts
        ? (includeTime ? `${dateParts.dateKey}T${dateParts.time || "00:00"}` : dateParts.dateKey)
        : safeString(currentValue).substring(0, includeTime ? 16 : 10).replace(" ", "T");
      if (newVal !== currentNormalized) {
        popover.addClass("db-editor-saving");
        const success = await this.commitEditedValue(row, col, newVal, session, "replace");
        popover.removeClass("db-editor-saving");
        if (!success) {
          committed = false;
          this.renderDraftFailure(popover, yearInp, () => { void commit(intent); }, () => cancel(intent));
          yearInp.focus();
          return;
        }
      }
      finish();
    };

    const cancel = (intent: TableCellNavigationIntent = "stay") => {
      if (committed) return;
      committed = true;
      close();
      this.finishInlineEdit(row, col, session, intent);
    };
    this.activeInlineEditorCancel = cancel;

    if (isMobile) {
      const actions = popover.createDiv({ cls: "db-cell-edit-mobile-actions" });
      const done = actions.createEl("button", { cls: "db-cell-edit-mobile-done", text: t("common.save"), attr: { type: "button" } });
      const cancelButton = actions.createEl("button", { cls: "db-cell-edit-mobile-cancel", text: t("common.cancel"), attr: { type: "button" } });
      done.onmousedown = (event) => event.preventDefault();
      cancelButton.onmousedown = (event) => event.preventDefault();
      done.onclick = () => { void commit(); };
      cancelButton.onclick = () => cancel("stay");
      popover.prepend(actions);
    }

    const onOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && (popover.contains(target) || td.contains(target))) return;
      void commit();
    };

    const onDocumentKeydown = (event: KeyboardEvent) => {
      if (isImeComposing(event)) return;
      if (event.key !== "Escape") return;
      event.preventDefault();
      cancel();
    };

    if (isMobile && editScrollContainer) {
      const view = editScrollContainer.ownerDocument.defaultView || window;
      const positionMobileEditor = () => {
        if (!popover.isConnected || !editScrollContainer) return;
        const viewport = view.visualViewport;
        const viewportTop = viewport?.offsetTop ?? 0;
        const viewportBottom = viewportTop + (viewport?.height ?? view.innerHeight);
        const editorRect = popover.getBoundingClientRect();
        if (editorRect.bottom > viewportBottom - 20 || editorRect.top < viewportTop + 20) {
          td.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        const containerRect = editScrollContainer.getBoundingClientRect();
        const tdRect = this.bulkAnchorRect(session) ?? td.getBoundingClientRect();
        const top = tdRect.bottom - containerRect.top + (editScrollContainer.scrollTop || 0) + 2;
        popover.style.top = `${top}px`;
      };
      const onViewportChange = () => positionMobileEditor();
      view.visualViewport?.addEventListener("resize", onViewportChange);
      view.visualViewport?.addEventListener("scroll", onViewportChange);
      removeMobileViewportListeners = () => {
        view.visualViewport?.removeEventListener("resize", onViewportChange);
        view.visualViewport?.removeEventListener("scroll", onViewportChange);
      };
      positionMobileEditor();
    }

    const isMovingWithinDatePopover = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      return Boolean(next && (inputs.includes(next as HTMLInputElement) || popover.contains(next)));
    };

    const handleSegmentKey = (
      event: KeyboardEvent,
      input: HTMLInputElement,
      prev?: HTMLInputElement,
    ) => {
      if (isImeComposing(event)) return;
      if (event.key === "Tab") {
        const isFirst = input === inputs[0];
        const isLast = input === inputs[inputs.length - 1];
        if ((!event.shiftKey && isLast) || (event.shiftKey && isFirst)) {
          event.preventDefault();
          event.stopPropagation();
          void commit(event.shiftKey ? "previous" : "next");
        }
        return;
      }
      if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        if (event.key === "Backspace" && input.value === "" && prev) {
          event.preventDefault();
          prev.focus();
        }
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        void commit(event.shiftKey ? "up" : "down");
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        cancel("stay");
        return;
      }
      if (!/^\d$/.test(event.key)) { event.preventDefault(); return; }
    };

    const normalizeTimeForSave = (hourValue: string, minuteValue: string) => {
      const hour = Number(hourValue.trim() || "0");
      const minute = Number(minuteValue.trim() || "0");
      if (!Number.isFinite(hour) || !Number.isFinite(minute)) return "00:00";
      const clampedHour = Math.min(Math.max(Math.trunc(hour), 0), 23);
      const clampedMinute = Math.min(Math.max(Math.trunc(minute), 0), 59);
      if (clampedHour !== hour || clampedMinute !== minute) new Notice(t("cell.invalidDate"));
      return `${pad2(String(clampedHour))}:${pad2(String(clampedMinute))}`;
    };

    const setDateInputs = (dateKey: string) => {
      const [year, month, day] = dateKey.split("-");
      yearInp.value = year || "";
      monthInp.value = month || "";
      dayInp.value = day || "";
    };

    const setCurrentTimeInputs = () => {
      if (!hourInp || !minuteInp) return;
      const now = new Date();
      hourInp.value = pad2(String(now.getHours()));
      minuteInp.value = pad2(String(now.getMinutes()));
    };

    const getDraftDateKey = (): string => {
      const year = yearInp.value;
      const month = monthInp.value;
      const day = dayInp.value;
      return /^\d{4}$/.test(year) && /^\d{2}$/.test(month) && /^\d{2}$/.test(day)
        ? `${year}-${month}-${day}`
        : initialDateKey;
    };

    const pickerEventIndex: MiniCalendarEventIndex = {
      dateKeys: new Set(),
      monthKeys: new Set(),
      yearKeys: new Set(),
    };

    const datePicker = popover.createDiv({ cls: "db-calendar-mini-popover db-cell-date-picker" });
    datePicker.addEventListener("mousedown", (event) => {
      event.preventDefault();
    });
    const renderDatePicker = () => {
      const [ys, ms] = pickerMonthKey.split("-");
      const year = Number(ys);
      const monthIndex = Number(ms) - 1;
      const weekStartsOn = getLocaleWeekStartsOn();
      renderMiniCalendar({
        popover: datePicker,
        mode: pickerMode,
        monthKey: pickerMonthKey,
        monthTitle: formatDatePickerMonthTitle(year, monthIndex, getEffectiveLocale()),
        visibleYear: year,
        yearRangeStart: getDatePickerYearRangeStart(year),
        weeks: buildDatePickerWeeks(year, monthIndex, weekStartsOn),
        weekdays: getWeekdayLabels(getEffectiveLocale(), weekStartsOn),
        todayKey: getLocalDateKey(),
        selectedKeys: new Set([getDraftDateKey()]),
        eventIndex: pickerEventIndex,
        onPrevious: () => {
          pickerMonthKey = shiftDatePickerMonth(pickerMonthKey, pickerMode === "day" ? -1 : pickerMode === "month" ? -12 : -144);
          renderDatePicker();
        },
        onNext: () => {
          pickerMonthKey = shiftDatePickerMonth(pickerMonthKey, pickerMode === "day" ? 1 : pickerMode === "month" ? 12 : 144);
          renderDatePicker();
        },
        onTitleClick: () => {
          if (pickerMode === "day") pickerMode = "month";
          else if (pickerMode === "month") pickerMode = "year";
          renderDatePicker();
        },
        onSelectDate: (dateKey) => {
          setDateInputs(dateKey);
          pickerMonthKey = dateKey.slice(0, 7);
          pickerMode = "day";
          renderDatePicker();
          (hourInp || dayInp).focus();
        },
        onSelectMonth: (monthKey) => {
          pickerMonthKey = monthKey;
          pickerMode = "day";
          renderDatePicker();
        },
        onSelectYear: (selectedYear) => {
          pickerMonthKey = `${String(selectedYear).padStart(4, "0")}-01`;
          pickerMode = "month";
          renderDatePicker();
        },
        onSelectToday: (dateKey) => {
          pickerMonthKey = dateKey.slice(0, 7);
          pickerMode = "day";
          setDateInputs(dateKey);
          setCurrentTimeInputs();
          renderDatePicker();
          (hourInp || dayInp).focus();
        },
      });
    };

    yearInp.value = initYear;
    yearInp.onkeydown = (e) => handleSegmentKey(e, yearInp, undefined);
    yearInp.oninput = () => {
      yearInp.value = yearInp.value.replace(/\D/g, "");
      if (yearInp.value.length === 4) { monthInp.focus(); monthInp.select(); }
    };
    yearInp.onblur = (e) => { if (!committed && !isMovingWithinDatePopover(e)) void commit(); };

    monthInp.value = initMonth;
    monthInp.onkeydown = (e) => handleSegmentKey(e, monthInp, yearInp);
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
    monthInp.onblur = (e) => { if (!committed && !isMovingWithinDatePopover(e)) void commit(); };

    dayInp.value = initDay;
    dayInp.onkeydown = (e) => handleSegmentKey(e, dayInp, monthInp);
    dayInp.oninput = () => {
      dayInp.value = dayInp.value.replace(/\D/g, "");
      const v = dayInp.value;
      if (v.length === 1 && /^[4-9]$/.test(v)) {
        dayInp.value = `0${v}`;
        if (hourInp) {
          hourInp.focus();
          hourInp.select();
        } else {
          void commit();
        }
      } else if (v.length === 2) {
        if (hourInp) {
          hourInp.focus();
          hourInp.select();
        } else {
          void commit();
        }
      }
    };
    dayInp.onblur = (e) => { if (!committed && !isMovingWithinDatePopover(e)) void commit(); };

    if (hourInp && minuteInp) {
      hourInp.value = initHour;
      hourInp.onkeydown = (e) => handleSegmentKey(e, hourInp, dayInp);
      hourInp.oninput = () => {
        hourInp.value = hourInp.value.replace(/\D/g, "");
        const v = hourInp.value;
        if (v.length === 1 && /^[3-9]$/.test(v)) {
          hourInp.value = `0${v}`;
          minuteInp.focus();
          minuteInp.select();
        } else if (v.length === 2) {
          minuteInp.focus();
          minuteInp.select();
        }
      };
      hourInp.onblur = (e) => { if (!committed && !isMovingWithinDatePopover(e)) void commit(); };

      minuteInp.value = initMinute;
      minuteInp.onkeydown = (e) => handleSegmentKey(e, minuteInp, hourInp);
      minuteInp.oninput = () => {
        minuteInp.value = minuteInp.value.replace(/\D/g, "");
        const v = minuteInp.value;
        if (v.length === 1 && /^[6-9]$/.test(v)) {
          minuteInp.value = `0${v}`;
          void commit();
        } else if (v.length === 2) {
          void commit();
        }
      };
      minuteInp.onblur = (e) => { if (!committed && !isMovingWithinDatePopover(e)) void commit(); };
    }

    renderDatePicker();

    if (closeBtn) {
      closeBtn.onmousedown = (event) => event.preventDefault();
      closeBtn.onclick = () => cancel("stay");
    }

    const focusYearInput = () => {
      yearInp.focus();
      if (initialDraft) yearInp.setSelectionRange(yearInp.value.length, yearInp.value.length);
      else yearInp.select();
    };

    if (!isMobile) {
      window.requestAnimationFrame(() => {
        this.positionDateEditPopover(popover, td, container, session);
        focusYearInput();
      });
    } else {
      window.setTimeout(() => {
        focusYearInput();
      }, 50);
    }

    window.setTimeout(() => {
      window.activeDocument.addEventListener("mousedown", onOutside, true);
      window.activeDocument.addEventListener("keydown", onDocumentKeydown, true);
    }, 0);
  }

  private positionDateEditPopover(popover: HTMLElement, td: HTMLElement, container: HTMLElement | null, session?: CellEditSession): void {
    const margin = 8;
    const popoverRect = popover.getBoundingClientRect();
    const bounds = getVisiblePopoverBounds(container);
    const width = Math.max(popoverRect.width || 170, 170);
    const height = popoverRect.height || 36;
    const a = this.bulkAnchorRect(session);
    const rect = a ?? td.getBoundingClientRect();
    const left = clamp(rect.left, bounds.left + margin, bounds.right - width - margin);
    let top: number;
    if (a) {
      top = resolveAnchoredPopoverTop(a, bounds, height, 4, margin).top;
    } else {
      const below = bounds.bottom - rect.top - margin;
      const above = rect.bottom - bounds.top - margin;
      const useAbove = above > below && below < height;
      top = useAbove ? rect.bottom - height : rect.top;
      top = clamp(top, bounds.top + margin, bounds.bottom - height - margin);
    }

    popover.setCssProps({ width: `${width}px` });
    setPosition(
      popover,
      left,
      top,
      container?.getBoundingClientRect(),
      container?.scrollLeft || 0,
      container?.scrollTop || 0
    );
  }

  private editText(
    td: HTMLElement,
    row: RowData,
    col: ColumnDef,
    currentValue: unknown,
    origText: string,
    session?: CellEditSession,
    initialDraft?: string,
  ): void {
    const valueText = safeString(currentValue);
    if (this.shouldUsePopoverEditor(td, col, valueText)) {
      this.editTextPopover(td, row, col, valueText, session, undefined, initialDraft);
      return;
    }
    const inp = window.activeDocument.createElement("input");
    inp.className = "db-cell-input";
    inp.type = "text";
    inp.value = initialDraft ?? valueText;
    this.mountInput(td, inp);

    let committed = false;

    const finish = (intent?: TableCellNavigationIntent) => {
      this.clearTransientClass(td, "db-cell-editing");
      if (this.activeInlineEditorCancel === cancel) this.activeInlineEditorCancel = undefined;
      if (intent) this.finishInlineEdit(row, col, session, intent);
    };

    const save = async (intent?: TableCellNavigationIntent) => {
      if (committed) return;
      committed = true;
      const newVal = inp.value;
      if (newVal !== safeString(currentValue)) {
        td.addClass("db-editor-saving");
        const success = await this.commitEditedValue(row, col, newVal, session, newVal ? "replace" : "clear");
        td.removeClass("db-editor-saving");
        if (!success) {
          committed = false;
          this.renderDraftFailure(td, inp, () => { void save(intent); }, () => cancel(intent));
          inp.focus();
          return;
        }
      } else {
        this.restoreTextDisplay(td, currentValue, origText);
      }
      finish(intent);
    };

    const cancel = (intent: TableCellNavigationIntent = "stay") => {
      if (committed) return;
      committed = true;
      this.restoreTextDisplay(td, currentValue, origText);
      finish(intent);
    };
    this.activeInlineEditorCancel = cancel;
    inp.onblur = () => { void save(); };
    inp.onkeydown = (event) => this.handleEditKey(event, save, cancel);
  }

  private editTextPopover(
    td: HTMLElement,
    row: RowData,
    col: ColumnDef,
    currentValue: string,
    session?: CellEditSession,
    placeholder?: string,
    initialDraft?: string,
  ): void {
    const rawContainer = td.closest(".note-database-container");
    const container = isHTMLElement(rawContainer) ? rawContainer : null;
    const isMobile = isTouchDevice(container || td);
    const host = isMobile ? null : (container || window.activeDocument.body);

    // 清理之前的编辑器
    this.activeTextEditClose?.();
    td.addClass("db-cell-editing");

    let popover: HTMLElement;
    let textarea: HTMLTextAreaElement;
    let closeBtn: HTMLButtonElement | undefined;
    let editScrollContainer: HTMLElement | null = null;
    let removeMobileViewportListeners = () => undefined;

    if (isMobile) {
      // ========== 移动端：Inline Overlay 方案 ==========
      // 在单元格所在的滚动容器内直接插入编辑器，不脱离文档流

      editScrollContainer = td.closest(".note-database-container")
        || td.closest(".markdown-preview-view")
        || window.activeDocument.body;
      
      // 创建内联编辑器包装器
      popover = editScrollContainer.createDiv({ cls: "db-cell-edit-popover is-mobile is-inline-overlay" });
      
      // 计算相对于滚动容器的位置
      const containerRect = editScrollContainer.getBoundingClientRect();
      const tdRect = this.bulkAnchorRect(session) ?? td.getBoundingClientRect();
      const scrollTop = editScrollContainer.scrollTop || 0;
      
      // 相对位置 = 单元格顶部 - 容器顶部 + 容器滚动偏移
      const relativeTop = tdRect.top - containerRect.top + scrollTop;
      
      // 定位在单元格正下方
      popover.setCssProps({ position: "absolute", left: "0", right: "0", top: `${relativeTop + tdRect.height + 2}px`, "z-index": "var(--db-layer-popover, 100)" });
      
      // 关闭按钮
      closeBtn = popover.createEl("button", {
        cls: "db-cell-edit-close",
        attr: { type: "button", title: t("common.cancel"), "aria-label": t("common.cancel") },
      });
      setIcon(closeBtn, "x");
      
      // 文本输入区
      textarea = window.activeDocument.createElement("textarea");
      textarea.className = "db-cell-textarea db-mobile-textarea";
      textarea.value = initialDraft ?? currentValue;
      if (placeholder) textarea.setAttr("placeholder", placeholder);
      popover.appendChild(textarea);
      
    } else {
      // ========== 桌面端：原有 Fixed Popover 方案 ==========
      popover = (host as HTMLElement).createDiv({ cls: "db-cell-edit-popover" });
      
      textarea = window.activeDocument.createElement("textarea");
      textarea.className = "db-cell-textarea";
      textarea.value = initialDraft ?? currentValue;
      if (placeholder) textarea.setAttr("placeholder", placeholder);
      textarea.rows = 1;
      popover.appendChild(textarea);
    }
    popover.dataset.noteDatabaseRowPath = row.file.path;
    popover.dataset.noteDatabaseColumnKey = col.key;
    popover.dataset.noteDatabaseEditorKind = "text";

    let committed = false;
    // Markdown-mode columns get a format toolbar above the textarea, plus
    // paste-URL-over-selection (wraps the selection into a [text](url) link).
    if (col.textRenderMode === "markdown" && !isFileFieldKey(col.key)) {
      this.buildMarkdownToolbar(popover, textarea);
      this.attachPasteUrlAsLink(textarea);
    }

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      removeMobileViewportListeners();
      popover.remove();
      td.removeClass("db-cell-editing");
      window.activeDocument.removeEventListener("mousedown", onOutside, true);
      window.activeDocument.removeEventListener("keydown", onDocumentKeydown, true);
      if (this.activeTextEditClose === close) this.activeTextEditClose = undefined;
      if (this.activeInlineEditorCancel === cancel) this.activeInlineEditorCancel = undefined;
      session?.onClose?.();
    };
    this.activeTextEditClose = close;

    const save = async (intent?: TableCellNavigationIntent) => {
      if (committed) return;
      committed = true;
      const newVal = textarea.value;
      if (newVal !== currentValue || session?.mixed) {
        popover.addClass("db-editor-saving");
        const success = await this.commitEditedValue(row, col, newVal, session, newVal ? "replace" : "clear");
        popover.removeClass("db-editor-saving");
        if (!success) {
          committed = false;
          this.renderDraftFailure(popover, textarea, () => { void save(intent); }, () => cancel(intent));
          textarea.focus();
          return;
        }
      }
      close();
      if (intent) this.finishInlineEdit(row, col, session, intent);
    };

    const cancel = (intent: TableCellNavigationIntent = "stay") => {
      if (committed) return;
      committed = true;
      close();
      this.finishInlineEdit(row, col, session, intent);
    };
    this.activeInlineEditorCancel = cancel;

    if (isMobile) {
      const actions = popover.createDiv({ cls: "db-cell-edit-mobile-actions" });
      const done = actions.createEl("button", { cls: "db-cell-edit-mobile-done", text: t("common.save"), attr: { type: "button" } });
      const cancelButton = actions.createEl("button", { cls: "db-cell-edit-mobile-cancel", text: t("common.cancel"), attr: { type: "button" } });
      done.onmousedown = (event) => event.preventDefault();
      cancelButton.onmousedown = (event) => event.preventDefault();
      done.onclick = () => { void save(); };
      cancelButton.onclick = () => cancel("stay");
      popover.prepend(actions);
    }

    const onOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && (popover.contains(target) || td.contains(target))) return;
      void save();
    };
    
    const onDocumentKeydown = (event: KeyboardEvent) => {
      if (isImeComposing(event)) return;
      if (event.key !== "Escape") return;
      event.preventDefault();
      cancel();
    };

    if (isMobile && editScrollContainer) {
      const view = editScrollContainer.ownerDocument.defaultView || window;
      const positionMobileEditor = () => {
        if (!popover.isConnected || !editScrollContainer) return;
        const viewport = view.visualViewport;
        const viewportTop = viewport?.offsetTop ?? 0;
        const viewportBottom = viewportTop + (viewport?.height ?? view.innerHeight);
        const editorRect = popover.getBoundingClientRect();
        if (editorRect.bottom > viewportBottom - 20 || editorRect.top < viewportTop + 20) {
          td.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        const containerRect = editScrollContainer.getBoundingClientRect();
        const tdRect = this.bulkAnchorRect(session) ?? td.getBoundingClientRect();
        const top = tdRect.bottom - containerRect.top + (editScrollContainer.scrollTop || 0) + 2;
        popover.style.top = `${top}px`;
      };
      const onViewportChange = () => positionMobileEditor();
      view.visualViewport?.addEventListener("resize", onViewportChange);
      view.visualViewport?.addEventListener("scroll", onViewportChange);
      removeMobileViewportListeners = () => {
        view.visualViewport?.removeEventListener("resize", onViewportChange);
        view.visualViewport?.removeEventListener("scroll", onViewportChange);
      };
      positionMobileEditor();
    }
    
    const resize = () => {
      this.autoGrowTextarea(textarea, isMobile ? 320 : 260);
      if (!isMobile) {
        this.positionTextEditPopover(popover, td, container, false, session);
      }
    };

    if (closeBtn) {
      closeBtn.onmousedown = (event) => event.preventDefault();
      closeBtn.onclick = () => cancel("stay");
    }
    
    textarea.addEventListener("input", resize);
    textarea.addEventListener("keydown", (event) => {
      if (isImeComposing(event)) return;
      if (event.key === "Enter" && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        event.stopPropagation();
        void save("down");
      }
      if (event.key === "Tab") {
        event.preventDefault();
        event.stopPropagation();
        void save(event.shiftKey ? "previous" : "next");
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        cancel("stay");
      }
    });

    if (isMobile) {
      this.autoGrowTextarea(textarea, 320);
      window.setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }, 50);
    } else {
      // 桌面端原有逻辑
      resize();
      window.requestAnimationFrame(resize);
      window.requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      });
    }

    // 绑定全局关闭事件
    window.setTimeout(() => {
      window.activeDocument.addEventListener("mousedown", onOutside, true);
      window.activeDocument.addEventListener("keydown", onDocumentKeydown, true);
    }, 0);
  }

  private restoreTextDisplay(td: HTMLElement, currentValue: unknown, origText: string): void {
    td.textContent = origText || safeString(currentValue);
  }

  private shouldUsePopoverEditor(_target: HTMLElement, col: ColumnDef, _value: string): boolean {
    return col.type === "text" || col.type === "files";
  }

  /** Build a format toolbar above the textarea for markdown-mode text columns.
   *  Each button wraps/inserts the matching marker around the current selection,
   *  then keeps focus in the textarea. */
  private buildMarkdownToolbar(popover: HTMLElement, textarea: HTMLTextAreaElement): void {
    const bar = createDiv({ cls: "db-md-toolbar" });
    // Insert before the textarea so the toolbar sits on top.
    textarea.parentElement?.insertBefore(bar, textarea);

    const buttons: { icon: string; title: string; run: () => void }[] = [
      { icon: "bold", title: t("mdToolbar.bold"), run: () => this.wrapSelection(textarea, "**", "**", t("mdToolbar.bold")) },
      { icon: "italic", title: t("mdToolbar.italic"), run: () => this.wrapSelection(textarea, "*", "*", t("mdToolbar.italic")) },
      { icon: "strikethrough", title: t("mdToolbar.strike"), run: () => this.wrapSelection(textarea, "~~", "~~", t("mdToolbar.strike")) },
      { icon: "highlighter", title: t("mdToolbar.highlight"), run: () => this.wrapSelection(textarea, "==", "==", t("mdToolbar.highlight")) },
      { icon: "code", title: t("mdToolbar.code"), run: () => this.wrapSelection(textarea, "`", "`", t("mdToolbar.code")) },
      { icon: "sigma", title: t("mdToolbar.math"), run: () => this.wrapSelection(textarea, "$", "$", "x^2") },
      { icon: "link", title: t("mdToolbar.link"), run: () => this.wrapSelection(textarea, "[", "](url)", t("mdToolbar.linkText")) },
      { icon: "file-symlink", title: t("mdToolbar.wikilink"), run: () => this.wrapSelection(textarea, "[[", "]]", t("mdToolbar.wikilinkText")) },
    ];

    for (const def of buttons) {
      const btn = bar.createEl("button", { cls: "db-md-toolbar-btn", attr: { type: "button" } });
      setIcon(btn, def.icon);
      setTooltip(btn, def.title, { delay: 100 });
      // mousedown would blur the textarea and lose the selection; prevent it.
      btn.addEventListener("mousedown", (event) => event.preventDefault());
      btn.addEventListener("click", (event) => { event.preventDefault(); def.run(); });
    }
  }

  /** Wrap the textarea's current selection with prefix/suffix. When nothing is
   *  selected, insert `placeholder` between the markers and select it. */
  private wrapSelection(textarea: HTMLTextAreaElement, prefix: string, suffix: string, placeholder: string): void {
    const value = textarea.value;
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const selected = value.slice(start, end);
    const inner = selected || placeholder;
    textarea.value = value.slice(0, start) + prefix + inner + suffix + value.slice(end);
    // Select the inner text so the user can keep typing / re-wrap.
    const innerStart = start + prefix.length;
    textarea.focus();
    textarea.setSelectionRange(innerStart, innerStart + inner.length);
    textarea.dispatchEvent(new Event("input"));
  }

  /** When text is selected and a web URL is pasted, wrap the selection into
   *  a normalized `[selection](url)` markdown link (Notion/editor-like behavior).
   *  Plain pastes, or pastes without a selection, fall through to default handling. */
  private attachPasteUrlAsLink(textarea: HTMLTextAreaElement): void {
    textarea.addEventListener("paste", (event: ClipboardEvent) => {
      const pasted = event.clipboardData?.getData("text/plain")?.trim();
      const normalizedUrl = pasted ? normalizeExternalUrlTarget(pasted) : null;
      if (!normalizedUrl) return;
      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? 0;
      if (start === end) return; // no selection → let the URL paste normally
      event.preventDefault();
      const value = textarea.value;
      const label = value.slice(start, end);
      textarea.value = `${value.slice(0, start)}[${label}](${normalizedUrl})${value.slice(end)}`;
      const caret = start + `[${label}](${normalizedUrl})`.length;
      textarea.focus();
      textarea.setSelectionRange(caret, caret);
      textarea.dispatchEvent(new Event("input"));
    });
  }

  private editSingleLinePopover(
    td: HTMLElement,
    row: RowData,
    col: ColumnDef,
    currentValue: string,
    inputType: "text" | "number",
    saveValue: (value: string) => Promise<EditorSaveResult>,
    restore: () => void,
    session?: CellEditSession,
    placeholder?: string,
    selectInitial = true,
  ): void {
    const rawContainer = td.closest(".note-database-container");
    const container = isHTMLElement(rawContainer) ? rawContainer : null;
    const host = container || window.activeDocument.body;
    this.activeTextEditClose?.();
    td.addClass("db-cell-popover-editing");
    // The editor is the active task, so it takes the bottom edge from the selection status bar for
    // as long as it is open. Without this the bar stays docked in the band the editor is placed in
    // and the two land on each other — the editor on top, with the bar's count chip clipped behind
    // it and two rows of actions stacked over the keyboard.
    claimBottomDock(td.ownerDocument, "cell-editor", true);

    const popover = host.createDiv({ cls: "db-cell-edit-popover db-cell-line-edit-popover" });
    popover.dataset.noteDatabaseRowPath = row.file.path;
    popover.dataset.noteDatabaseColumnKey = col.key;
    popover.dataset.noteDatabaseEditorKind = inputType === "number" ? "number" : "text";
    const input = popover.createEl("input", {
      cls: "db-cell-line-input",
      attr: { type: inputType },
    });
    if (inputType === "number") input.setAttr("step", "any");
    input.value = currentValue;
    if (placeholder) input.setAttr("placeholder", placeholder);

    let committed = false;
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      popover.remove();
      td.removeClass("db-cell-popover-editing");
      claimBottomDock(td.ownerDocument, "cell-editor", false);
      window.activeDocument.removeEventListener("mousedown", onOutside, true);
      window.activeDocument.removeEventListener("keydown", onDocumentKeydown, true);
      if (this.activeTextEditClose === close) this.activeTextEditClose = undefined;
      if (this.activeInlineEditorCancel === cancel) this.activeInlineEditorCancel = undefined;
      session?.onClose?.();
    };
    this.activeTextEditClose = close;

    const save = async (intent?: TableCellNavigationIntent) => {
      if (committed) return;
      committed = true;
      popover.addClass("db-editor-saving");
      const result = await saveValue(input.value);
      popover.removeClass("db-editor-saving");
      if (result === "validation") {
        committed = false;
        this.showValidationError(input, inputType === "number" ? t("validation.invalidNumber") : t("editor.saveFailed"));
        input.focus();
        return;
      }
      if (result && typeof result === "object") {
        committed = false;
        this.showValidationError(input, result.validationMessage);
        this.renderDraftFailure(popover, input, () => { void save(intent); }, () => cancel(intent));
        input.focus();
        return;
      }
      if (result === false) {
        committed = false;
        this.showValidationError(input, t("editor.saveFailed"));
        this.renderDraftFailure(popover, input, () => { void save(intent); }, () => cancel(intent));
        input.focus();
        return;
      }
      close();
      if (intent) this.finishInlineEdit(row, col, session, intent);
    };
    const cancel = (intent: TableCellNavigationIntent = "stay") => {
      if (committed) return;
      committed = true;
      restore();
      close();
      this.finishInlineEdit(row, col, session, intent);
    };
    this.activeInlineEditorCancel = cancel;
    const onOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && (popover.contains(target) || td.contains(target))) return;
      void save();
    };
    const onDocumentKeydown = (event: KeyboardEvent) => {
      if (isImeComposing(event)) return;
      if (event.key !== "Escape") return;
      event.preventDefault();
      cancel();
    };

    input.onkeydown = (event) => {
      if (isImeComposing(event)) return;
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        void save(event.shiftKey ? "up" : "down");
      }
      if (event.key === "Tab") {
        event.preventDefault();
        event.stopPropagation();
        void save(event.shiftKey ? "previous" : "next");
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        cancel("stay");
      }
    };
    this.positionTextEditPopover(popover, td, container, false, session);
    window.requestAnimationFrame(() => {
      this.positionTextEditPopover(popover, td, container, false, session);
      input.focus();
      if (selectInitial) input.select();
      else input.setSelectionRange(input.value.length, input.value.length);
    });
    window.setTimeout(() => {
      window.activeDocument.addEventListener("mousedown", onOutside, true);
      window.activeDocument.addEventListener("keydown", onDocumentKeydown, true);
    }, 0);
  }

  private mountInput(td: HTMLElement, input: HTMLInputElement): void {
    td.addClass("db-cell-editing");
    input.setCssProps({ width: "100%" });
    td.textContent = "";
    td.appendChild(input);
    input.focus();
    input.select();
  }

  private autoGrowTextarea(textarea: HTMLTextAreaElement, maxHeight: number): void {
    textarea.setCssProps({ height: "auto" });
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.setCssProps({ height: `${nextHeight}px`, "overflow-y": textarea.scrollHeight > maxHeight ? "auto" : "hidden" });
  }

  private positionTextEditPopover(popover: HTMLElement, td: HTMLElement, container: HTMLElement | null, isMobile = false, session?: CellEditSession): void {
    if (isMobile) {
      popover.setCssProps({ left: "10px", right: "10px", bottom: "calc(10px + env(safe-area-inset-bottom, 0px))", top: "", width: "auto" });
      return;
    }
    const margin = 8;
    const a = this.bulkAnchorRect(session);
    const rect = a ?? td.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const bounds = getVisiblePopoverBounds(container);
    const width = Math.min(Math.max(rect.width, popoverRect.width || 0, 220), Math.min(520, bounds.width - margin * 2));
    const left = clamp(rect.left, bounds.left + margin, bounds.right - width - margin);
    const height = Math.min(popover.scrollHeight || popoverRect.height || 0, bounds.height - margin * 2);
    let top: number;
    if (a) {
      top = resolveAnchoredPopoverTop(a, bounds, height, 4, margin).top;
    } else {
      const below = bounds.bottom - rect.top - margin;
      const above = rect.bottom - bounds.top - margin;
      const useAbove = above > below && below < height;
      top = useAbove ? rect.bottom - height : rect.top;
      top = clamp(top, bounds.top + margin, bounds.bottom - height - margin);
    }

    popover.setCssProps({ width: `${width}px` });
    setPosition(
      popover,
      left,
      top,
      container?.getBoundingClientRect(),
      container?.scrollLeft || 0,
      container?.scrollTop || 0
    );
  }

  private handleEditKey(
    event: KeyboardEvent,
    save: (intent?: TableCellNavigationIntent) => Promise<void>,
    cancel: (intent?: TableCellNavigationIntent) => void
  ): void {
    if (isImeComposing(event)) return;
    let intent: TableCellNavigationIntent | undefined;
    if (event.key === "Enter") intent = event.shiftKey ? "up" : "down";
    else if (event.key === "Tab") intent = event.shiftKey ? "previous" : "next";
    else if (event.key === "Escape") intent = "stay";
    if (!intent) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === "Escape") cancel(intent);
    else void save(intent);
  }

  private clearTransientClass(el: HTMLElement, className: string): void {
    el.removeClass(className);
  }

  private showValidationError(element: HTMLElement, message: string): void {
    element.setAttribute("aria-invalid", "true");
    element.title = message;
    element.removeClass("db-validation-error");
    void element.offsetWidth;
    element.addClass("db-validation-error");
    element.addEventListener("animationend", () => element.removeClass("db-validation-error"), { once: true });
  }

  private renderDraftFailure(
    host: HTMLElement,
    input: HTMLInputElement | HTMLTextAreaElement,
    retry: () => void,
    discard: () => void,
  ): void {
    host.querySelector<HTMLElement>(".db-draft-failure")?.remove();
    const failure = host.createDiv({ cls: "db-draft-failure", attr: { role: "alert" } });
    failure.createSpan({ cls: "db-draft-failure-text", text: t("editor.saveFailed") });
    const retryButton = failure.createEl("button", { cls: "db-draft-action", text: t("editor.retry"), attr: { type: "button" } });
    retryButton.onclick = (event) => {
      event.preventDefault();
      retry();
    };
    const discardButton = failure.createEl("button", { cls: "db-draft-action", text: t("editor.discard"), attr: { type: "button" } });
    discardButton.onclick = (event) => {
      event.preventDefault();
      discard();
    };
    input.setAttribute("aria-invalid", "true");
    input.title = t("editor.saveFailed");
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
      const normalizedValue = this.normalizeCellValueForSave(col, value);
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

  private normalizeCellValueForSave(col: ColumnDef, value: unknown): unknown {
    if (value == null) return value;
    if (col.type === "files") return FilesColumn.normalize(FilesColumn.parseEdit(value));
    if (col.key === "file.tags") return toValidObsidianTagValues(value);
    if (col.type === "multi-select") return toMultiSelectValuesForKey(col.key, value);
    if (col.type === "select" || col.type === "status") return normalizeOptionValueForKey(col.key, value);
    return value;
  }

  private getVaultTagOptionValues(): string[] {
    const metadataCache = this.app?.metadataCache as unknown as MetadataCacheWithTags | undefined;
    const tags = metadataCache?.getTags?.();
    if (!tags) return [];
    return Object.keys(tags)
      .map((tag) => normalizeValidObsidianTagValue(tag))
      .filter((tag): tag is string => Boolean(tag))
      .sort((a, b) => a.localeCompare(b));
  }

  private getFileTagDraftOptions(col: ColumnDef, currentValues: string[]): StatusOptionDef[] {
    const colorsByValue = new Map<string, StatusOptionDef["color"]>();
    for (const option of col.statusOptions || []) {
      const value = normalizeValidObsidianTagValue(option.value);
      if (!value) continue;
      colorsByValue.set(value, option.color || "gray");
    }

    const options: StatusOptionDef[] = [];
    const seen = new Set<string>();
    const add = (value: string) => {
      const normalized = normalizeValidObsidianTagValue(value);
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      options.push({ value: normalized, color: colorsByValue.get(normalized) || "gray" });
    };

    for (const value of this.getVaultTagOptionValues()) add(value);
    for (const value of currentValues) add(value);
    for (const value of colorsByValue.keys()) add(value);
    return options;
  }

  private persistFileTagColorOptions(options: StatusOptionDef[]): StatusOptionDef[] {
    const persisted: StatusOptionDef[] = [];
    const seen = new Set<string>();
    for (const option of options) {
      const value = normalizeValidObsidianTagValue(option.value);
      if (!value || seen.has(value)) continue;
      const color = option.color || "gray";
      if (color === "gray") continue;
      seen.add(value);
      persisted.push({ value, color });
    }
    return persisted;
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
    this.editSingleLinePopover(
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

  private createOptionDragPreview(item: HTMLElement, event: MouseEvent): OptionDragPreview {
    const rect = item.getBoundingClientRect();
    const preview = item.cloneNode(true) as HTMLElement;
    preview.addClass("db-cell-option-drag-preview");
    preview.addClass("db-cell-option-item");
    preview.removeClass("is-dragging");
    preview.setAttribute("aria-hidden", "true");
    preview.querySelectorAll(".db-mobile-reorder-controls").forEach((el) => el.remove());
    preview.setCssProps({
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    window.activeDocument.body.appendChild(preview);
    const state: OptionDragPreview = {
      preview,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    this.updateOptionDragPreview(state, event);
    return state;
  }

  private updateOptionDragPreview(state: OptionDragPreview, event: MouseEvent): void {
    state.preview.setCssProps({
      transform: `translate3d(${Math.round(event.clientX - state.offsetX)}px, ${Math.round(event.clientY - state.offsetY)}px, 0)`,
    });
  }

  private removeOptionDragPreview(state: OptionDragPreview): void {
    state.preview.remove();
  }

  private bulkAnchorRect(session: CellEditSession | undefined): DOMRect | null {
    const el = session?.anchorEl?.();
    return el?.isConnected ? el.getBoundingClientRect() : null;
  }

  // Coordinates are container-relative, matching the CSS. The popover mounts inside
  // `.note-database-container` (`position: relative`), and the stylesheet positions it `absolute`
  // there, so the numbers written here must be measured from that container — which is what
  // passing its rect and scroll offsets to `setPosition` does. This is the same convention the
  // date and text edit popovers use for the same host.
  //
  // The earlier version computed viewport coordinates and forced `position: fixed` inline to make
  // them land. That only worked because an inline declaration outranks the stylesheet rule, an
  // unstated coupling in a file that already re-declares these very selectors in an `!important`
  // tail. It also meant any ancestor gaining a containing block — including from Obsidian's own
  // CSS, which is not visible from this repo — would silently reinterpret those coordinates as
  // container-relative and shift the popover by the container's offset, which on a scrolled note
  // is hundreds of pixels. Agreeing with the CSS removes both failure modes.
  private positionOptionPopover(
    popover: HTMLElement,
    td: HTMLElement,
    container: HTMLElement | null,
    anchorPoint?: { x: number; y: number },
    session?: CellEditSession,
  ): void {
    const margin = 8;
    const gap = 4;
    const anchorRect = this.bulkAnchorRect(session);
    const rect = anchorRect ?? td.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const bounds = getVisiblePopoverBounds(container);

    const relationPopover = popover.hasClass("db-relation-popover");
    const minWidth = relationPopover ? 360 : 160;
    const maxWidth = relationPopover ? 520 : 260;
    const width = Math.min(
      Math.max(popoverRect.width || rect.width, rect.width, minWidth),
      maxWidth,
      Math.max(160, bounds.width - margin * 2)
    );
    const anchorX = anchorRect ? anchorRect.left : (anchorPoint?.x ?? rect.left);
    const anchorY = anchorRect ? anchorRect.bottom : (anchorPoint?.y ?? rect.bottom);
    const horizontalAnchor = {
      left: anchorX,
      right: anchorX + rect.width,
      width: rect.width,
    };
    const left = resolvePopoverHorizontalLeft(horizontalAnchor, bounds, width, gap, margin, "left");

    const below = bounds.bottom - anchorY - gap - margin;
    const above = anchorY - gap - margin;
    const useAbove = above > below && below < Math.min(popover.scrollHeight, 180);
    const availableHeight = Math.max(120, useAbove ? above : below);
    const maxHeight = Math.max(120, bounds.height - margin * 2);
    const height = Math.min(popover.scrollHeight || popoverRect.height || 0, availableHeight, maxHeight);

    const globalTop = useAbove ? anchorY - gap - height : anchorY + gap;
    const globalClampedTop = clamp(globalTop, bounds.top + margin, bounds.bottom - height - margin);

    // Without a container there is no positioned ancestor to measure from, so the viewport is the
    // only frame left and the coordinates below are already global.
    popover.setCssProps({
      width: `${width}px`,
      "max-height": `${Math.min(availableHeight, maxHeight)}px`,
      ...(container ? {} : { position: "fixed" as const }),
    });
    setPosition(
      popover,
      left,
      globalClampedTop,
      container?.getBoundingClientRect(),
      container?.scrollLeft || 0,
      container?.scrollTop || 0
    );
  }
}
