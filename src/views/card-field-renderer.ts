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
import { isObsidianTagsKey } from "../data/column-types";
import { getFileFieldFixedType, isFileFieldKey, isReadonlyFileField } from "../data/file-fields";
import { isImeComposing } from "../data/keyboard-utils";
import { ColumnDef, RowData, ViewConfig } from "../data/types";
import { setFieldTooltip } from "./field-tooltip";
import { renderPropertyValue } from "./record-surface/property-row";

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
  /** Draws the property's type icon into the label's own leading edge. The icon lives inside the
   *  existing label box rather than beside it, so the row's inner geometry — the 96px label
   *  column, the value's left edge, the 44px pitch — does not move for callers that opt in. */
  renderLabelTypeIcon?: (label: HTMLElement) => void;
  fieldWidth?: number;
  wrap?: boolean;
  readOnly?: boolean;
  /** Forwarded to `renderPropertyValue` — see its own doc for what the split changes. */
  splitOptionValue?: boolean;
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
  field.setAttribute("data-obnotion-column-key", col.key);
  field.setAttribute("role", "gridcell");
  options.applyConditionalFormat?.(field, row, config, col.key);
  if (options.fieldWidth != null) field.style.setProperty("--obnotion-card-field-width", `${options.fieldWidth}px`);
  if (options.wrap || col.wrap) field.addClass(`${fieldClass}-wrap`);
  if (options.empty) field.addClass("is-empty-field");
  if (displayType === "checkbox") field.addClass("is-checkbox-field");
  setFieldTooltip(field, options.empty ? value : value, col.label);

  const label = field.createSpan({ cls: labelClass, text: col.label });
  options.renderLabelTypeIcon?.(label);
  options.onShowColumnMenu && attachColumnMenu(field, label, col, options.onShowColumnMenu);
  const valueEl = field.createDiv({ cls: valueClass });
  if (options.empty) valueEl.addClass("obnotion-card-empty-placeholder");
  renderCardFieldValue(valueEl, app, row, col, value, displayType, {
    badgesClass,
    linkClass,
    readOnly: options.readOnly,
    splitOptionValue: options.splitOptionValue,
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
      if (target && typeof target === "object" && typeof target.closest === "function" && target.closest("a, button, input, textarea, .obnotion-cell-editing")) return;
      event.stopPropagation();
      options.onEdit?.(valueEl, row, col, event);
    });
    field.addEventListener("keydown", (event) => {
      if (isImeComposing(event)) return;
      if (event.key === "Enter" || event.key === " ") {
        const target = event.target as HTMLElement | null;
        if (target && typeof target === "object" && typeof target.closest === "function" && target.closest("a, button, input, textarea, .obnotion-cell-editing")) return;
        event.preventDefault();
        event.stopPropagation();
        options.onEdit?.(valueEl, row, col);
        return;
      }
      if ((event.shiftKey && event.key === "F10") || event.key === "ContextMenu") {
        const target = event.target as HTMLElement | null;
        if (target && typeof target === "object" && typeof target.closest === "function" && target.closest("a, button, input, textarea, .obnotion-cell-editing")) return;
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
  splitOptionValue?: boolean;
  onEdit?: (target: HTMLElement, row: RowData, col: ColumnDef, event?: MouseEvent) => void;
  onEditFormula?: (col: ColumnDef) => void;
  onOpenTarget?: (row: RowData, target: string, external: boolean) => void | Promise<void>;
  onNumberChange?: (row: RowData, col: ColumnDef, value: number) => void | Promise<void | boolean>;
}

/**
 * A re-export shim. The value-rendering body that used to live here moved to
 * `record-surface/property-row.ts` unchanged, so board, gallery, list and record-sheet cards
 * keep rendering exactly what they render today; this call is the entire difference.
 */
export function renderCardFieldValue(
  valueEl: HTMLElement,
  app: App,
  row: RowData,
  col: ColumnDef,
  value: unknown,
  displayType: ColumnDef["type"],
  options: CardFieldValueOptions,
): void {
  renderPropertyValue(valueEl, value, displayType, { app, row, col, ...options });
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
