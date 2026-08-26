import { getColumnValue, isDerivedColumn } from "../data/ColumnDisplay";
import { isReadonlyFileField } from "../data/FileFields";
import { isImeComposing } from "../data/KeyboardUtils";
import type { ColumnDef, RowData, ViewConfig } from "../data/types";
import { stringifyValue } from "../data/Stringify";
import { t } from "../i18n";

export interface TitleOpenAffordanceDeps {
  open: (row: RowData) => void;
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

let activePeek: ActiveTableRecordPeek | null = null;

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
  if (td.querySelector(".db-record-open-btn")) return;

  const button = td.ownerDocument.createElement("button");
  button.type = "button";
  button.className = "db-record-open-btn";
  button.setAttribute("tabindex", "-1");
  button.setAttribute("aria-label", t("panel.open"));
  button.textContent = t("panel.open");
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    deps.open(row);
  });
  td.appendChild(button);
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
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("data-note-database-row-path", row.file.path);
  container.appendChild(panel);

  let closed = false;
  let outsideClickTimer: number | undefined;

  function closePanel(): void {
    if (closed) return;
    closed = true;
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
      renderProperty(properties, currentRow, column);
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
      renderProperty(hiddenFields, currentRow, column);
    }
  };

  renderContent(row);
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

function renderProperty(parent: HTMLElement, row: RowData, column: ColumnDef): void {
  const field = createChild(parent, "div", "db-record-peek-field");
  field.setAttribute("data-note-database-column-key", column.key);

  const label = createChild(field, "span", "db-record-peek-field-label");
  label.textContent = column.label || column.key;

  const value = createChild(field, "span", "db-record-peek-field-value");
  value.textContent = stringifyValue(getColumnValue(row, column));
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
