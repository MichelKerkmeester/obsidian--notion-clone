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
// `buildPropertyRow` and `renderOptionValue` are the row this family is converging on —
// label, then value, value left-aligned, one type size for both with colour carrying the
// hierarchy, no format icon, and single-select drawn as text while multi-select stays a
// filled chip. Nothing calls them yet: the desktop record sheet still right-aligns through
// the board card's own stylesheet rule, and a later leg is what switches a consumer onto
// this shape (and brings the CSS that makes it visible) — building it beside the still-live
// display path is what keeps every existing capture unmoved.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { App } from "obsidian";
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
    checkbox.disabled = !!options.readOnly;
    checkbox.onclick = (event) => {
      event.stopPropagation();
      if (col.type === "computed") {
        event.preventDefault();
        if (!options.readOnly) options.onEditFormula?.(col);
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
