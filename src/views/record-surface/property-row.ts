// ───────────────────────────────────────────────────────────────────
// MODULE:    property-row
// COMPONENT: the property row — display value renderer, row shell, and the
//            corrected option-value split
// ───────────────────────────────────────────────────────────────────
//
// `renderPropertyValue` is `card-field-renderer.ts`'s value-rendering body, moved here
// unchanged so the record sheet, the board card, the gallery card and the list card keep
// exactly what they render today; `renderCardFieldValue` becomes a one-line call into it.
//
// `buildPropertyRow` and `renderOptionValue` are the row this family converged on — label, then
// value, value left-aligned, one type size for both with colour carrying the hierarchy, no format
// icon, and single-select drawn as text while multi-select stays a filled chip. The record sheet
// and the board card opt into the split through `renderPropertyValue`'s `splitOptionValue` flag;
// the gallery and list cards leave it unset and keep drawing the filled badge both kinds always
// have.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon, setTooltip, type App } from "obsidian";
import { isObsidianTagsKey, resolveOptionDisplay, toBooleanValue, toMultiSelectValuesForKey } from "../../data/column-types";
import { formatDateTimeValueDisplay, formatDateValueDisplay } from "../../data/date-time-format";
import { isFileFieldKey } from "../../data/file-fields";
import { getNumberDisplayStyle } from "../../data/column-display";
import { formatEuroCurrency, formatEuroNumber } from "../../data/euro-format";
import { parseInlineMarkdown } from "../../data/inline-markdown";
import { assembleSchemeLinkTarget, isTextLinkScheme } from "../../data/text-link-scheme";
import { parseTextLink } from "../../data/text-link";
import { ColumnDef, RowData } from "../../data/types";
import { t } from "../../i18n";
import { setFieldTooltip } from "../field-tooltip";
import { renderSpecialFileFieldValue, shouldRenderSpecialFileField } from "../file-field-renderer";
import { renderInlineMarkdown, resolveInlineImageSrc, valueToTooltip } from "../inline-markdown-renderer";
import { renderDelayedExternalLink } from "../cell-renderer";
import { renderProgress, renderProgressRing, renderRating } from "../number-display-renderer";
import { createCheckbox } from "../checkbox";
import { renderRelationValue } from "../relation-value-renderer";
import { openExternalUrl } from "../open-external";

// ───────────────────────────────────────────────────────────────────
// 2. DISPLAY VALUE — the shim target, unchanged from today's renderer
// ───────────────────────────────────────────────────────────────────

export interface PropertyValueRenderOptions {
  app: App;
  row: RowData;
  col: ColumnDef;
  badgesClass: string;
  linkClass: string;
  readOnly?: boolean;
  /**
   * Opts an option value into the corrected split — single-select as coloured text, multi-select
   * still a filled chip — instead of the filled badge both kinds draw by default. Scoped to the
   * callers that asked for it rather than made the default, so the gallery and list cards this
   * function also serves keep drawing exactly what they draw today.
   */
  splitOptionValue?: boolean;
  onEdit?: (target: HTMLElement, row: RowData, col: ColumnDef, event?: MouseEvent) => void;
  onEditFormula?: (col: ColumnDef) => void;
  onOpenTarget?: (row: RowData, target: string, external: boolean) => void | Promise<void>;
  onNumberChange?: (row: RowData, col: ColumnDef, value: number) => void | Promise<void | boolean>;
}

/**
 * Today's property-value anatomy, verbatim: option values as filled badges regardless of
 * single- or multi-select, values right or left aligned by whichever stylesheet rule reaches
 * the caller's class names. `card-field-renderer.ts` calls this instead of keeping its own copy.
 */
export function renderPropertyValue(
  valueEl: HTMLElement,
  value: unknown,
  displayType: ColumnDef["type"],
  options: PropertyValueRenderOptions,
): void {
  const { app, row, col } = options;

  if (displayType === "checkbox") {
    valueEl.addClass("db-checkbox-cell");
    const checkbox = createCheckbox(valueEl, { role: "field" });
    checkbox.checked = toBooleanValue(value);
    // `readOnly` here means "the card's click opens the record, not this control" — every
    // board/gallery/list card field is read-only in exactly that sense, not "unavailable to the
    // user". Native `disabled` says the second thing: `input[type="checkbox"].db-checkbox:disabled`
    // halves opacity and drops the border to --background-modifier-border, which measured a
    // #EEEEEE border on a #EEEEEE checked glyph in the default light theme — checked and unchecked
    // read as the same picture. The value stays legible if the toggle is blocked at the click
    // instead of by graying out the control that shows it.
    if (options.readOnly) {
      checkbox.tabIndex = -1;
      checkbox.setAttribute("aria-disabled", "true");
    }
    checkbox.onclick = (event) => {
      event.stopPropagation();
      if (options.readOnly) {
        event.preventDefault();
        return;
      }
      if (col.type === "computed") {
        event.preventDefault();
        options.onEditFormula?.(col);
      }
    };
    if (col.type !== "computed" && !options.readOnly) {
      checkbox.onchange = () => void options.onEdit?.(valueEl, row, col);
    }
    setFieldTooltip(valueEl, checkbox.checked ? t("common.true") : t("common.false"));
    return;
  }

  if (shouldRenderSpecialFileField(col) && renderSpecialFileFieldValue(valueEl, app, row, col, value, {
    tagsContainerClass: options.badgesClass,
    linkItemClass: options.linkClass,
  })) return;

  if (col.type === "select" || col.type === "status") {
    if (options.splitOptionValue) {
      renderOptionValue(valueEl, false, [String(value)], splitOptionValueClasses(col));
      return;
    }
    const resolved = resolveOptionDisplay(col, String(value));
    const badge = valueEl.createSpan({ cls: "status-badge", text: resolved.value || t("common.empty") });
    badge.title = resolved.value || t("common.empty");
    badge.addClass(`status-color-${resolved.option?.color || "gray"}`);
    return;
  }
  if (col.type === "multi-select" || isObsidianTagsKey(col.key)) {
    const values = toMultiSelectValuesForKey(col.key, value);
    const badges = valueEl.createDiv({ cls: options.badgesClass });
    badges.addClass("has-badges");
    setFieldTooltip(badges, values);
    if (options.splitOptionValue) {
      renderOptionValue(badges, true, values, splitOptionValueClasses(col));
      return;
    }
    for (const entry of values) {
      const resolved = resolveOptionDisplay(col, entry);
      const badge = badges.createSpan({ cls: "status-badge", text: resolved.value || t("common.empty") });
      badge.title = resolved.value || t("common.empty");
      badge.addClass(`status-color-${resolved.option?.color || "gray"}`);
    }
    return;
  }
  if (col.type === "relation" && renderRelationValue(valueEl, app, row, value, true)) {
    valueEl.addClass("has-badges");
    return;
  }
  if (displayType === "date" || displayType === "datetime") {
    valueEl.addClass("db-date-value");
    valueEl.textContent = displayType === "datetime"
      ? formatDateTimeValueDisplay(value, { mode: "full", showTimeWhenMissing: true })
      : formatDateValueDisplay(value);
    return;
  }
  if (displayType === "number" || displayType === "currency") {
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(numeric) && displayType === "number") {
      const style = getNumberDisplayStyle(col);
      const interaction = !options.readOnly && options.onNumberChange
        ? { onChange: (next: number) => options.onNumberChange?.(row, col, next) }
        : undefined;
      if (style === "rating") { renderRating(valueEl, numeric, col.numberDisplayConfig, interaction); return; }
      if (style === "progress") { renderProgress(valueEl, numeric, col.numberDisplayConfig, interaction); return; }
      if (style === "ring") { renderProgressRing(valueEl, numeric, col.numberDisplayConfig, interaction); return; }
    }
    valueEl.addClass("db-card-field-number");
    if (Number.isFinite(numeric)) {
      valueEl.textContent = displayType === "currency" ? formatEuroCurrency(numeric) : formatEuroNumber(numeric);
      return;
    }
  }

  const schemeTarget = col.type === "text" && !isFileFieldKey(col.key) && isTextLinkScheme(col.textLinkScheme)
    ? assembleSchemeLinkTarget(col.textLinkScheme, value)
    : null;
  if (schemeTarget !== null) {
    renderDelayedExternalLink(valueEl, row, { label: String(value), target: schemeTarget, external: true });
    return;
  }
  if (col.textRenderMode === "markdown" && !isFileFieldKey(col.key)) {
    const values = Array.isArray(value) ? value : [value];
    const parsed = values.map((entry) => parseInlineMarkdown(entry));
    if (parsed.some((nodes) => nodes !== null)) {
      valueEl.empty();
      const onOpenLink = (target: string, external: boolean): void => {
        void (options.onOpenTarget?.(row, target, external) || (external ? Promise.resolve(openExternalUrl(target)) : app.workspace.openLinkText(target, row.file.path)));
      };
      const onResolveImage = (target: string, external: boolean): string | null => resolveInlineImageSrc(app, row, target, external);
      parsed.forEach((nodes, index) => {
        if (index > 0) valueEl.appendText(", ");
        if (nodes) renderInlineMarkdown(valueEl, nodes, { onOpenLink, onResolveImage, sourcePath: row.file.path });
        else valueEl.appendText(String(values[index]));
      });
      setFieldTooltip(valueEl, valueToTooltip(value));
      return;
    }
  }
  if (col.textRenderMode === "link") {
    const values = Array.isArray(value) ? value : [value];
    const links = values.map((entry) => parseTextLink(entry)).filter((entry) => entry !== null);
    for (const link of links) {
      const anchor = valueEl.createEl("a", { cls: options.linkClass, text: link.label, attr: { href: "#", title: link.label } });
      anchor.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        void (options.onOpenTarget?.(row, link.target, link.external) || (link.external ? Promise.resolve(openExternalUrl(link.target)) : app.workspace.openLinkText(link.target, row.file.path)));
      };
    }
    if (links.length > 0) return;
  }
  // `card-field-renderer.ts`'s own `formatCardNumber`, inlined rather than imported back — this
  // module is the one it now calls, and importing the other way would cycle the two files.
  valueEl.textContent = typeof value === "number" && Number.isFinite(value)
    ? String(value)
    : Array.isArray(value) ? value.join(", ") : String(value ?? "");
}

// ───────────────────────────────────────────────────────────────────
// 3. ROW SHELL — the trued-up anatomy, not yet consumed
// ───────────────────────────────────────────────────────────────────

export interface PropertyRowOptions {
  parent: HTMLElement;
  rowClass: string;
  labelClass: string;
  valueClass: string;
  label: string;
  renderValue: (valueEl: HTMLElement) => void;
}

export interface PropertyRowHandle {
  row: HTMLElement;
  labelEl: HTMLElement;
  valueEl: HTMLElement;
}

/**
 * Label, then value, value left-aligned. No format icon is drawn: neither platform puts one on a
 * value row, only on a picker or on the type's own property editor, so a row that grows a third
 * child has drifted.
 */
export function buildPropertyRow(options: PropertyRowOptions): PropertyRowHandle {
  const row = options.parent.createDiv({ cls: options.rowClass });
  const labelEl = row.createSpan({ cls: options.labelClass, text: options.label });
  const valueEl = row.createDiv({ cls: options.valueClass });
  options.renderValue(valueEl);
  return { row, labelEl, valueEl };
}

// ───────────────────────────────────────────────────────────────────
// 4. OPTION VALUE — the corrected single-select / multi-select split
// ───────────────────────────────────────────────────────────────────

export interface OptionValueRenderOptions {
  col: ColumnDef;
  /** Multi-select's filled, tinted chip — the shape today's badge already has. */
  chipClass: string;
  /** Single-select's coloured text, carrying no chip at all. */
  textClass: string;
}

/** The production class pair `renderPropertyValue`'s split reaches for: multi-select's chip
 *  stays the existing filled badge so it draws pixel-identically to before, and single-select's
 *  text carries no rule of its own — the colour comes entirely from the `status-color-text-*`
 *  class `renderOptionValue` already adds beside it. */
function splitOptionValueClasses(col: ColumnDef): OptionValueRenderOptions {
  return { col, chipClass: "status-badge", textClass: "db-option-value-text" };
}

/**
 * Single-select renders as coloured text with no chip; multi-select stays a filled chip. Today
 * both still render through the same filled badge everywhere a value is drawn, which is what
 * makes the two formats unreadable from each other at a glance. The colours stay ours, and every
 * option pair owes 4.5:1 against its own background; only the fill-versus-text split is adopted.
 */
export function renderOptionValue(
  valueEl: HTMLElement,
  isMulti: boolean,
  values: readonly string[],
  options: OptionValueRenderOptions,
): void {
  if (!isMulti) {
    const [first] = values;
    if (first === undefined) return;
    const resolved = resolveOptionDisplay(options.col, first);
    const text = valueEl.createSpan({ cls: options.textClass, text: resolved.value || t("common.empty") });
    text.addClass(resolved.option ? `status-color-text-${resolved.option.color}` : "status-color-text-gray");
    return;
  }
  for (const entry of values) {
    const resolved = resolveOptionDisplay(options.col, entry);
    const chip = valueEl.createSpan({ cls: options.chipClass, text: resolved.value || t("common.empty") });
    chip.addClass(resolved.option ? `status-color-${resolved.option.color}` : "status-color-gray");
  }
}

// ───────────────────────────────────────────────────────────────────
// 5. EMPTY-VALUE PROMPT — a format-specific action, never the word "Empty"
// ───────────────────────────────────────────────────────────────────

/**
 * The prompt an empty field with an editor shows in place of "Empty" — naming the action rather
 * than the absence. Every format that opens an editor gets one; a format with no editor of its
 * own (e.g. a computed value) returns `null` and keeps whatever its caller already renders. A
 * table cell (denser than a property row) renders nothing for an empty value on either platform,
 * so this is never called there.
 */
export function getPropertyEmptyPrompt(displayType: ColumnDef["type"]): string | null {
  if (displayType === "select") return t("field.emptySelectPrompt");
  if (displayType === "multi-select") return t("field.emptyMultiSelectPrompt");
  if (displayType === "relation") return t("field.emptyRelationPrompt");
  if (displayType === "number") return t("field.emptyNumberPrompt");
  if (displayType === "date") return t("field.emptyDatePrompt");
  if (displayType === "datetime") return t("field.emptyDatetimePrompt");
  if (displayType === "currency") return t("field.emptyCurrencyPrompt");
  if (displayType === "text") return t("field.emptyTextPrompt");
  if (displayType === "files") return t("field.emptyFilesPrompt");
  return null;
}

// ───────────────────────────────────────────────────────────────────
// 6. CHECKBOX ROW — the properties-panel row shell shared by the desktop
//    properties panel and the board-card properties panel
// ───────────────────────────────────────────────────────────────────
//
// Both panels drew the same row by hand — drag handle, move buttons, a visibility checkbox, the
// type icon, the name — and each carried its own copy of the drag-ignore check. Reorder state
// (which key is being dragged, where it lands) stays with the caller, since the two panels persist
// a reorder through entirely different paths (range-selection-aware column visibility versus a
// plain splice); only the row's DOM and its per-row event wiring move here.

export interface CheckboxPropertyRowDrag {
  onDragStart: (event: DragEvent) => void;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent) => void;
  onDragEnd: () => void;
}

export interface CheckboxPropertyRowMove {
  canMoveUp: boolean;
  canMoveDown: boolean;
  moveUpLabel: string;
  moveDownLabel: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export interface CheckboxPropertyRowOptions {
  parent: HTMLElement;
  rowClass: string;
  dataColumnKey: string;
  /** Drag reorder is off entirely (no handle, no move buttons) when false — the read-only case. */
  draggable: boolean;
  dragHandleClass: string;
  dragHandleTitle: string;
  moveControlsClass: string;
  drag?: CheckboxPropertyRowDrag;
  move?: CheckboxPropertyRowMove;
  checked: boolean;
  checkboxDisabled?: boolean;
  /** Column-manager's shift-range visibility toggle reads the native click event; wire this for it. */
  onCheckboxClick?: (event: MouseEvent, checkbox: HTMLInputElement) => void;
  /** The board-card panel's plain persist-on-toggle path; wire this instead of (or beside) the click. */
  onCheckboxChange?: (checked: boolean) => void;
  typeClass: string;
  typeTitle?: string;
  renderTypeIcon: (parent: HTMLElement) => void;
  nameWrapClass: string;
  nameClass: string;
  nameText: string;
}

export interface CheckboxPropertyRowHandle {
  row: HTMLElement;
  checkbox: HTMLInputElement;
  nameWrap: HTMLElement;
  nameEl: HTMLElement;
}

export function buildCheckboxPropertyRow(options: CheckboxPropertyRowOptions): CheckboxPropertyRowHandle {
  const row = options.parent.createDiv({ cls: options.rowClass });
  row.setAttribute("data-note-database-column-key", options.dataColumnKey);

  if (options.draggable) {
    row.draggable = true;
    if (options.drag) {
      row.ondragstart = options.drag.onDragStart;
      row.ondragover = options.drag.onDragOver;
      row.ondragleave = options.drag.onDragLeave;
      row.ondrop = options.drag.onDrop;
      row.ondragend = options.drag.onDragEnd;
    }

    const dragHandle = row.createSpan({ cls: options.dragHandleClass, text: "⋮⋮" });
    dragHandle.title = options.dragHandleTitle;

    if (options.move) {
      const move = options.move;
      const moveControls = row.createSpan({ cls: options.moveControlsClass });
      const upBtn = moveControls.createEl("button", { attr: { type: "button" } });
      setIcon(upBtn, "arrow-up");
      setTooltip(upBtn, move.moveUpLabel, { delay: 100 });
      upBtn.disabled = !move.canMoveUp;
      upBtn.onclick = (event) => { event.preventDefault(); event.stopPropagation(); move.onMoveUp(); };
      const downBtn = moveControls.createEl("button", { attr: { type: "button" } });
      setIcon(downBtn, "arrow-down");
      setTooltip(downBtn, move.moveDownLabel, { delay: 100 });
      downBtn.disabled = !move.canMoveDown;
      downBtn.onclick = (event) => { event.preventDefault(); event.stopPropagation(); move.onMoveDown(); };
    }
  }

  const checkbox = createCheckbox(row, { role: "field" });
  checkbox.checked = options.checked;
  checkbox.disabled = Boolean(options.checkboxDisabled);
  if (options.onCheckboxClick) {
    const onCheckboxClick = options.onCheckboxClick;
    checkbox.onclick = (event) => onCheckboxClick(event, checkbox);
  }
  if (options.onCheckboxChange) {
    const onCheckboxChange = options.onCheckboxChange;
    checkbox.onchange = () => onCheckboxChange(checkbox.checked);
  }

  const typeEl = row.createSpan({
    cls: options.typeClass,
    ...(options.typeTitle !== undefined ? { attr: { title: options.typeTitle } } : {}),
  });
  options.renderTypeIcon(typeEl);

  const nameWrap = row.createDiv({ cls: options.nameWrapClass });
  const nameEl = nameWrap.createSpan({ text: options.nameText, cls: options.nameClass });

  return { row, checkbox, nameWrap, nameEl };
}

/** The drag-ignore check both properties panels carried a copy of: a drag starting on a control
 *  inside the row (a button, an input, the move controls) is that control's click, not a reorder. */
export function shouldIgnorePropertyRowDrag(event: DragEvent): boolean {
  const target = event.target as { closest?: (selector: string) => unknown } | null;
  return Boolean(target && typeof target === "object" && typeof target.closest === "function"
    && target.closest("input, select, textarea, button, .db-dropdown-field, .db-mobile-reorder-controls"));
}
