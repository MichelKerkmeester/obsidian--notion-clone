// ───────────────────────────────────────────────────────────────────
// MODULE:    card-field-renderer
// COMPONENT: shared per-field renderer for Board/Gallery/List card layouts
// ───────────────────────────────────────────────────────────────────
//
// One field renderer backs all three card-based views so a display-type
// change (badges, dates, ratings, markdown links) only has to be taught
// once instead of three times. The field wrapper is only made keyboard-
// interactive (tabIndex, click/keydown handlers) when onEdit is supplied
// and the field is not read-only or a readonly file field, so a card in a
// read-only view never exposes an edit affordance it can't act on.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { App } from "obsidian";
import { isObsidianTagsKey, resolveOptionDisplay, toBooleanValue, toMultiSelectValuesForKey } from "../data/column-types";
import { formatDateTimeValueDisplay, formatDateValueDisplay } from "../data/date-time-format";
import { getFileFieldFixedType, isFileFieldKey, isReadonlyFileField } from "../data/file-fields";
import { getNumberDisplayStyle } from "../data/column-display";
import { parseInlineMarkdown } from "../data/inline-markdown";
import { isImeComposing } from "../data/keyboard-utils";
import { assembleSchemeLinkTarget, isTextLinkScheme } from "../data/text-link-scheme";
import { parseTextLink } from "../data/text-link";
import { ColumnDef, RowData, ViewConfig } from "../data/types";
import { t } from "../i18n";
import { isHTMLElement } from "./dom-guards";
import { setFieldTooltip } from "./field-tooltip";
import { renderSpecialFileFieldValue, shouldRenderSpecialFileField } from "./file-field-renderer";
import { renderInlineMarkdown, resolveInlineImageSrc, valueToTooltip } from "./inline-markdown-renderer";
import { renderDelayedExternalLink } from "./cell-renderer";
import { renderProgress, renderProgressRing, renderRating } from "./number-display-renderer";
import { createCheckbox } from "./checkbox";
import { renderRelationValue } from "./relation-value-renderer";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface CardFieldRendererOptions {
  app: App;
  row: RowData;
  col: ColumnDef;
  config: ViewConfig;
  value: unknown;
  displayType: ColumnDef["type"];
  empty?: boolean;
  fieldClass: string;
  valueClass: string;
  labelClass: string;
  badgesClass: string;
  linkClass: string;
  fieldWidth?: number;
  wrap?: boolean;
  readOnly?: boolean;
  applyConditionalFormat?: (element: HTMLElement, row: RowData, config: ViewConfig, targetField?: string) => void;
  onEdit?: (target: HTMLElement, row: RowData, col: ColumnDef, event?: MouseEvent) => void;
  onEditFormula?: (col: ColumnDef) => void;
  onOpenTarget?: (row: RowData, target: string, external: boolean) => void | Promise<void>;
  onNumberChange?: (row: RowData, col: ColumnDef, value: number) => void | Promise<void | boolean>;
  onShowColumnMenu?: (event: MouseEvent, col: ColumnDef, anchorEl?: HTMLElement) => void;
}

export type CardFieldPresentation = "checkbox" | "badge" | "badges" | "relation" | "date" | "number" | "text";

// ───────────────────────────────────────────────────────────────────
// 3. CLASSIFICATION HELPERS
// ───────────────────────────────────────────────────────────────────

export function isCardFieldEmpty(value: unknown): boolean {
  return value == null || value === "" || (Array.isArray(value) && value.length === 0);
}

export function classifyCardField(col: ColumnDef, displayType: ColumnDef["type"]): CardFieldPresentation {
  if (displayType === "checkbox") return "checkbox";
  if (col.type === "select" || col.type === "status") return "badge";
  if (col.type === "multi-select" || isObsidianTagsKey(col.key)) return "badges";
  if (col.type === "relation") return "relation";
  if (displayType === "date" || displayType === "datetime") return "date";
  if (displayType === "number" || displayType === "currency") return "number";
  return "text";
}

export function formatCardNumber(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return Array.isArray(value) ? value.join(", ") : String(value ?? "");
}

export function getCardRatingValue(value: unknown, max = 5): number | null {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(max, numeric));
}

// ───────────────────────────────────────────────────────────────────
// 4. PUBLIC API
// ───────────────────────────────────────────────────────────────────

export function renderCardField(options: CardFieldRendererOptions): HTMLElement {
  const {
    app, row, col, config, value, displayType, fieldClass, valueClass, labelClass, badgesClass, linkClass,
  } = options;
  const field = window.activeDocument.createElement("div");
  field.className = fieldClass;
  field.setAttribute("data-note-database-column-key", col.key);
  field.setAttribute("role", "gridcell");
  options.applyConditionalFormat?.(field, row, config, col.key);
  if (options.fieldWidth != null) field.style.setProperty("--db-card-field-width", `${options.fieldWidth}px`);
  if (options.wrap || col.wrap) field.addClass(`${fieldClass}-wrap`);
  if (options.empty) field.addClass("is-empty-field");
  if (displayType === "checkbox") field.addClass("is-checkbox-field");
  setFieldTooltip(field, options.empty ? value : value, col.label);

  const label = field.createSpan({ cls: labelClass, text: col.label });
  options.onShowColumnMenu && attachColumnMenu(field, label, col, options.onShowColumnMenu);
  const valueEl = field.createDiv({ cls: valueClass });
  if (options.empty) valueEl.addClass("db-card-empty-placeholder");
  renderCardFieldValue(valueEl, app, row, col, value, displayType, {
    badgesClass,
    linkClass,
    readOnly: options.readOnly,
    onEdit: options.onEdit,
    onEditFormula: options.onEditFormula,
    onOpenTarget: options.onOpenTarget,
    onNumberChange: options.onNumberChange,
  });
  setFieldTooltip(valueEl, value);

  if (options.onEdit && !options.readOnly && !isReadonlyFileField(col.key)) {
    field.tabIndex = -1;
    field.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      if (target && typeof target === "object" && typeof target.closest === "function" && target.closest("a, button, input, textarea, .db-cell-editing")) return;
      event.stopPropagation();
      options.onEdit?.(valueEl, row, col, event);
    });
    field.addEventListener("keydown", (event) => {
      if (isImeComposing(event)) return;
      if (event.key === "Enter" || event.key === " ") {
        const target = event.target as HTMLElement | null;
        if (target && typeof target === "object" && typeof target.closest === "function" && target.closest("a, button, input, textarea, .db-cell-editing")) return;
        event.preventDefault();
        event.stopPropagation();
        options.onEdit?.(valueEl, row, col);
        return;
      }
      if ((event.shiftKey && event.key === "F10") || event.key === "ContextMenu") {
        const target = event.target as HTMLElement | null;
        if (target && typeof target === "object" && typeof target.closest === "function" && target.closest("a, button, input, textarea, .db-cell-editing")) return;
        event.preventDefault();
        event.stopPropagation();
        options.onShowColumnMenu?.(createContextMenuEvent(), col, field);
      }
    });
  }
  return field;
}

// ───────────────────────────────────────────────────────────────────
// 5. VALUE RENDERING
// ───────────────────────────────────────────────────────────────────

interface CardFieldValueOptions {
  badgesClass: string;
  linkClass: string;
  readOnly?: boolean;
  onEdit?: (target: HTMLElement, row: RowData, col: ColumnDef, event?: MouseEvent) => void;
  onEditFormula?: (col: ColumnDef) => void;
  onOpenTarget?: (row: RowData, target: string, external: boolean) => void | Promise<void>;
  onNumberChange?: (row: RowData, col: ColumnDef, value: number) => void | Promise<void | boolean>;
}

export function renderCardFieldValue(
  valueEl: HTMLElement,
  app: App,
  row: RowData,
  col: ColumnDef,
  value: unknown,
  displayType: ColumnDef["type"],
  options: CardFieldValueOptions,
): void {
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
        void (options.onOpenTarget?.(row, target, external) || (external ? Promise.resolve(window.open(target)) : app.workspace.openLinkText(target, row.file.path)));
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
        void (options.onOpenTarget?.(row, link.target, link.external) || (link.external ? Promise.resolve(window.open(link.target)) : app.workspace.openLinkText(link.target, row.file.path)));
      };
    }
    if (links.length > 0) return;
  }
  valueEl.textContent = formatCardNumber(value);
}

// ───────────────────────────────────────────────────────────────────
// 6. HELPERS
// ───────────────────────────────────────────────────────────────────

function createContextMenuEvent(): MouseEvent {
  if (typeof MouseEvent !== "undefined") {
    return new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
  }
  return {
    preventDefault: () => undefined,
    stopPropagation: () => undefined,
  } as unknown as MouseEvent;
}

function attachColumnMenu(
  field: HTMLElement,
  label: HTMLElement,
  col: ColumnDef,
  showColumnMenu: (event: MouseEvent, col: ColumnDef, anchorEl?: HTMLElement) => void,
): void {
  const handler = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    if (target && typeof target === "object" && typeof target.closest === "function" && target.closest("input, select, textarea, button, a")) return;
    event.preventDefault();
    event.stopPropagation();
    showColumnMenu(event, col, field);
  };
  field.addEventListener("contextmenu", handler);
  label.addEventListener("contextmenu", handler);
  label.tabIndex = -1;
  label.setAttribute("aria-haspopup", "menu");
  label.addEventListener("keydown", (event: KeyboardEvent) => {
    if (isImeComposing(event)) return;
    if (event.key === "Enter" || event.key === " " || event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
      event.preventDefault();
      event.stopPropagation();
      showColumnMenu(createContextMenuEvent(), col, label);
    }
  });
}

export function getDisplayTypeForCard(config: ViewConfig, col: ColumnDef): ColumnDef["type"] {
  if (isFileFieldKey(col.key)) return getFileFieldFixedType(col.key);
  return col.type;
}
