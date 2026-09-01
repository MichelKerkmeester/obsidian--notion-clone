// ───────────────────────────────────────────────────────────────────
// MODULE:    table-record-peek
// COMPONENT: Display-only "peek" panel docked beside a table row
// ───────────────────────────────────────────────────────────────────
//
// Module-level activePeek is a deliberate singleton: opening a peek on any
// row anywhere always closes the previous one first, so only one panel can
// be docked at a time. The outside-click listener is attached one tick
// after open (setTimeout 0) so the click that opened the panel does not
// also register as the outside click that closes it.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon } from "obsidian";
import { getColumnDisplayType, getColumnValue, isDerivedColumn } from "../data/column-display";
import { resolveOptionDisplay } from "../data/column-types";
import { isReadonlyFileField } from "../data/file-fields";
import { isImeComposing } from "../data/keyboard-utils";
import { isTouchDevice } from "../data/touch-environment";
import type { ColumnDef, RowData, ViewConfig } from "../data/types";
import { stringifyValue } from "../data/stringify";
import { t } from "../i18n";
import { isHTMLElement } from "./dom-guards";
import { trapFocus } from "./interaction-scope";
import { resolveCellTapAction, trackCellGesture } from "./table-cell-gesture";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface TitleOpenAffordanceDeps {
  open: (row: RowData) => void;
}

export interface TitleCellTapDeps {
  openRecord: (anchorEl: HTMLElement, row: RowData) => void;
}

export interface OpenTableRecordPeekOptions {
  anchor: HTMLElement;
  row: RowData;
  config: ViewConfig;
  visibleColumns: readonly ColumnDef[];
  allColumns: readonly ColumnDef[];
  container: HTMLElement;
  returnFocus?: () => void;
  renderRecordIcon?: (parent: HTMLElement, row: RowData, config: ViewConfig) => HTMLElement | null | void;
}

interface ActiveTableRecordPeek {
  filePath: string;
  element: HTMLElement;
  close: () => void;
  refresh: (row: RowData) => void;
}

// ───────────────────────────────────────────────────────────────────
// 3. STATE
// ───────────────────────────────────────────────────────────────────

let activePeek: ActiveTableRecordPeek | null = null;

// ───────────────────────────────────────────────────────────────────
// 4. RECORD PEEK
// ───────────────────────────────────────────────────────────────────

/**
 * Add the table's record-open control without changing the title link.
 *
 * The control is deliberately appended to the cell rather than placed in the
 * anchor, so title navigation and link previews keep their existing behavior.
 */
export function attachTitleOpenAffordance(
  td: HTMLElement,
  row: RowData,
  deps: TitleOpenAffordanceDeps,
): void {
  td.classList.add("db-record-open-host");
  if (td.querySelector(".db-record-open-btn")) return;

  const button = td.ownerDocument.createElement("button");
  button.type = "button";
  button.className = "db-record-open-btn";
  button.setAttribute("aria-label", t("panel.open"));
  // On touch the affordance is always visible and shares the title cell, where a text
  // label steals width the note name needs; a compact icon carries the same meaning and
  // stays announced through the aria-label. On desktop it only appears on hover, so the
  // clearer text label is kept.
  if (isTouchDevice(td)) {
    button.classList.add("db-record-open-btn-icon");
    setIcon(button, "maximize-2");
  } else {
    button.textContent = t("panel.open");
  }
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    deps.open(row);
  });
  td.appendChild(button);
}

/**
 * Give the whole main-item cell the meaning its 24px icon carried alone.
 *
 * A thumb aiming at a 24 by 24 button inside a 34px row is asking for a miss, and the rest of the
 * cell did something else again — the note link navigated away, the empty space painted a range.
 * One cell, one meaning.
 *
 * Bound in the capture phase because the note link's handler sits on a descendant: capture reaches
 * this cell first, so stopping here is what keeps a tap from both opening the sheet and navigating
 * away from it. A mouse falls straight through and the link keeps opening the note.
 *
 * Shared rather than owned by one view. The full table view bound this and the embedded renderer
 * did not, so the same table in a note and in its own tab answered the same tap differently: one
 * opened the record, the other followed the link. A behaviour two hosts must agree on belongs to
 * neither of them.
 */
export function setupTitleCellTap(td: HTMLElement, row: RowData, deps: TitleCellTapDeps): void {
  // Bind once per cell, the way the affordance beside it does. A re-render that reuses the node
  // would otherwise stack a second reader and a second handler on it.
  if (td.dataset.noteDatabaseTitleTap === "1") return;
  td.dataset.noteDatabaseTitleTap = "1";
  const cellGesture = trackCellGesture(td);
  td.addEventListener("click", (event) => {
    const action = resolveCellTapAction({ gesture: cellGesture(), isTitleCell: true, isEditable: true });
    if (action !== "open-record") return;
    // The affordance button opens the record already. Letting it through keeps one path to the
    // sheet instead of two that can drift apart.
    if (isHTMLElement(event.target) && event.target.closest(".db-record-open-btn")) return;
    event.preventDefault();
    event.stopPropagation();
    deps.openRecord(td, row);
  }, true);
}

/** Close the one active table record peek, if any. */
export function closeTableRecordPeek(): void {
  activePeek?.close();
}

/**
 * Mount a display-only, CSS-docked record peek for a table row.
 *
 * Opening a second row always replaces the first panel. The panel keeps its
 * own DOM and event lifecycle so it can be dismissed safely by its host.
 */
export function openTableRecordPeek(options: OpenTableRecordPeekOptions): void {
  closeTableRecordPeek();

  const {
    anchor,
    row,
    config,
    visibleColumns,
    allColumns,
    container,
    returnFocus,
    renderRecordIcon,
  } = options;
  const ownerDocument = container.ownerDocument;
  const ownerWindow = ownerDocument.defaultView || window;
  const panel = ownerDocument.createElement("div");
  panel.className = "db-record-peek-panel";
  panel.tabIndex = -1;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("data-note-database-row-path", row.file.path);
  container.appendChild(panel);

  let closed = false;
  let outsideClickTimer: number | undefined;
  let removeFocusTrap: () => void = () => undefined;

  function closePanel(): void {
    if (closed) return;
    closed = true;
    removeFocusTrap();
    if (outsideClickTimer !== undefined) {
      ownerWindow.clearTimeout(outsideClickTimer);
      outsideClickTimer = undefined;
    }
    ownerDocument.removeEventListener("mousedown", onOutside, true);
    ownerDocument.removeEventListener("keydown", onKeydown, true);
    container.removeEventListener("scroll", onDismiss);
    ownerWindow.removeEventListener("resize", onDismiss);
    panel.remove();
    if (activePeek?.close === closePanel) activePeek = null;
    returnFocus?.();
  }

  function onOutside(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (target && (panel.contains(target) || anchor.contains(target))) return;
    closePanel();
  }

  function onKeydown(event: KeyboardEvent): void {
    if (isImeComposing(event)) return;
    if (event.key !== "Escape") return;
    event.preventDefault();
    closePanel();
  }

  function onDismiss(): void {
    closePanel();
  }

  const renderContent = (currentRow: RowData): void => {
    while (panel.firstChild) panel.removeChild(panel.firstChild);
    panel.setAttribute("aria-label", currentRow.file.basename);

    const header = createChild(panel, "div", "db-record-peek-header");
    renderRecordIcon?.(header, currentRow, config);
    const title = createChild(header, "span", "db-record-peek-title");
    title.textContent = currentRow.file.basename;

    const visibleProperties = visibleColumns.filter((column) => column.key !== "file.name");
    const visibleKeys = new Set(visibleColumns.map((column) => column.key));
    const hiddenProperties = allColumns.filter((column) => {
      if (column.key === "file.name" || visibleKeys.has(column.key)) return false;
      const value = getColumnValue(currentRow, column);
      return !(isEmptyValue(value) && (isReadonlyFileField(column.key) || isDerivedColumn(column)));
    });

    const properties = createChild(panel, "div", "db-record-peek-properties");
    if (visibleProperties.length === 0 && hiddenProperties.length === 0) {
      const empty = createChild(properties, "div", "db-record-peek-field db-record-peek-empty is-muted");
      empty.textContent = t("panel.noProperties");
      return;
    }

    for (const column of visibleProperties) {
      renderProperty(properties, currentRow, column, config);
    }

    if (hiddenProperties.length === 0) return;

    const hiddenGroup = createChild(panel, "div", "db-record-peek-hidden-group");
    const hiddenToggle = createChild(hiddenGroup, "button", "db-record-peek-hidden-toggle");
    hiddenToggle.type = "button";
    hiddenToggle.setAttribute("aria-expanded", "false");
    hiddenToggle.textContent = t("panel.hiddenProperties");

    const hiddenFields = createChild(hiddenGroup, "div", "db-record-peek-hidden-fields is-hidden");
    hiddenFields.setAttribute("aria-hidden", "true");
    hiddenToggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const expanded = hiddenToggle.getAttribute("aria-expanded") === "true";
      hiddenToggle.setAttribute("aria-expanded", String(!expanded));
      hiddenFields.classList.toggle("is-hidden", expanded);
      hiddenFields.setAttribute("aria-hidden", String(expanded));
      hiddenGroup.classList.toggle("is-expanded", !expanded);
    });

    for (const column of hiddenProperties) {
      renderProperty(hiddenFields, currentRow, column, config);
    }
  };

  renderContent(row);
  removeFocusTrap = trapFocus(panel);
  panel.focus?.({ preventScroll: true });
  ownerDocument.addEventListener("keydown", onKeydown, true);
  container.addEventListener("scroll", onDismiss);
  ownerWindow.addEventListener("resize", onDismiss);
  outsideClickTimer = ownerWindow.setTimeout(() => {
    outsideClickTimer = undefined;
    if (!closed) ownerDocument.addEventListener("mousedown", onOutside, true);
  }, 0);

  activePeek = {
    filePath: row.file.path,
    element: panel,
    close: closePanel,
    refresh: renderContent,
  };
}

/**
 * Refresh the open panel from the current row set, or close it when its row
 * is no longer present in the table.
 */
export function syncTableRecordPeek(rows: readonly RowData[]): void {
  if (!activePeek) return;
  const current = activePeek;
  const row = rows.find((candidate) => candidate.file.path === current.filePath);
  if (!row || !current.element.isConnected) {
    closeTableRecordPeek();
    return;
  }
  current.refresh(row);
  current.element.setAttribute("data-note-database-row-path", row.file.path);
}

// ───────────────────────────────────────────────────────────────────
// 5. HELPERS
// ───────────────────────────────────────────────────────────────────

/**
 * A property row: label, then the value in the form the rest of the plugin gives it.
 *
 * An option-typed value is a badge coloured from its own option, which is what the table cell, the
 * card field, the record detail panel and every group header build for the same value. This panel
 * used to write `textContent` for everything, so a select value docked beside the table lost the
 * colour the cell two hundred pixels to its left was showing it in — the same record, the same
 * column, on one screen, saying the plugin colours by surface. It does not; the colour is the
 * option's and follows the value.
 *
 * An unregistered value keeps the grey badge rather than falling back to text, because grey is what
 * every other surface gives it and "no option matched" is a state worth looking the same everywhere.
 */
function renderProperty(
  parent: HTMLElement,
  row: RowData,
  column: ColumnDef,
  config: ViewConfig,
): void {
  const field = createChild(parent, "div", "db-record-peek-field");
  field.setAttribute("data-note-database-column-key", column.key);

  const label = createChild(field, "span", "db-record-peek-field-label");
  label.textContent = column.label || column.key;

  const value = createChild(field, "span", "db-record-peek-field-value");
  const text = stringifyValue(getColumnValue(row, column));

  const displayType = getColumnDisplayType(column, config.schema.computedFields);
  const isOption = displayType === "status" || displayType === "select" || displayType === "multi-select";
  if (!isOption || !text) {
    value.textContent = text;
    return;
  }

  // Multi-select stringifies to a comma-joined list, and one badge around the whole list would be a
  // chip that reads as a single option. Each value gets its own, in the container the cell uses.
  const values = displayType === "multi-select"
    ? text.split(",").map((item) => item.trim()).filter(Boolean)
    : [text];
  const host = displayType === "multi-select"
    ? createChild(value, "div", "db-multi-select-values")
    : value;
  for (const item of values) {
    const { option } = resolveOptionDisplay(column, item);
    const badge = createChild(host, "span", `status-badge status-color-${option?.color || "gray"}`);
    badge.textContent = item;
    badge.title = item;
    badge.setAttribute("data-status-color", option?.color || "gray");
  }
}

function isEmptyValue(value: unknown): boolean {
  return value == null || value === "" || (Array.isArray(value) && value.length === 0);
}

function createChild<K extends keyof HTMLElementTagNameMap>(
  parent: HTMLElement,
  tagName: K,
  className: string,
): HTMLElementTagNameMap[K] {
  const child = parent.ownerDocument.createElement(tagName);
  child.className = className;
  parent.appendChild(child);
  return child;
}
