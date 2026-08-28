// ───────────────────────────────────────────────────────────────────
// MODULE:    table-column-layout-sync
// COMPONENT: Re-applies computed column widths to an already-rendered table
// ───────────────────────────────────────────────────────────────────
//
// A targeted DOM patch, not a re-render: it walks existing col/th elements
// and rewrites their widths from the current schema, so a width or column
// change doesn't force rebuilding the whole table. Column keys are matched
// through CSS.escape since a key can contain characters an unescaped
// attribute selector would treat as syntax; the CSS.escape guard also makes
// this a no-op in environments (tests) that lack it, instead of throwing.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ColumnDef, ViewConfig } from "../data/types";
import { getTableColumnStyle, getTableLayout } from "./table-layout";

// ───────────────────────────────────────────────────────────────────
// 2. SYNC TABLE COLUMN LAYOUTS
// ───────────────────────────────────────────────────────────────────

export function syncTableColumnLayouts(root: ParentNode, config: ViewConfig): void {
  if (typeof CSS === "undefined" || !CSS.escape) return;

  const columnByKey = new Map(config.schema.columns.map((column) => [column.key, column]));
  root.querySelectorAll<HTMLTableElement>("table.db-table").forEach((table) => {
    const colgroup = table.querySelector("colgroup");
    if (!colgroup) return;

    const dataCols = Array.from(colgroup.querySelectorAll<HTMLElement>("col[data-note-database-column-key]"));
    if (dataCols.length === 0) return;

    const keys = dataCols.map((colEl) => colEl.getAttribute("data-note-database-column-key") || "");
    const baseWidths = keys.map((key) => getColumnWidth(columnByKey.get(key), config));
    const selectionCol = colgroup.querySelector<HTMLElement>("col.db-select-colgroup");
    const selectionWidth = selectionCol ? getSelectionColumnWidth(selectionCol) : 0;
    const recordIconWidth = colgroup.querySelector("col.db-record-icon-colgroup") ? 28 : 0;
    const addColumnWidth = colgroup.querySelector("col.db-add-column-colgroup") ? 42 : 0;
    const layout = getTableLayout(selectionWidth + recordIconWidth + addColumnWidth, baseWidths, getAvailableTableWidth(table));

    table.style.width = `${layout.tableWidth}px`;
    table.style.minWidth = `${layout.tableWidth}px`;
    const tableWrap = table.closest<HTMLElement>(".db-table-wrap");
    if (tableWrap) tableWrap.style.minWidth = `${layout.tableWidth}px`;

    if (selectionCol) {
      selectionCol.setAttr("width", String(selectionWidth));
      selectionCol.setCssProps({ width: `${selectionWidth}px` });
    }

    dataCols.forEach((colEl, index) => {
      const style = getTableColumnStyle(layout.columnWidths[index], index, dataCols.length);
      colEl.style.width = style.width || "";
      colEl.style.minWidth = style.minWidth || "";
    });
  });

  for (const col of columnByKey.values()) {
    const escaped = CSS.escape(col.key);
    root.querySelectorAll<HTMLElement>(`th[data-note-database-column-key="${escaped}"]`).forEach((el) => {
      const renderedWidth = getRenderedHeaderWidth(el, col, config);
      el.style.width = `${renderedWidth}px`;
      el.toggleClass("is-narrow", isHeaderNarrow(renderedWidth, col));
    });
  }
}

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

function getColumnWidth(col: ColumnDef | undefined, config: ViewConfig): number {
  return (col ? config.columnWidths?.[col.key] : undefined) || col?.width || config.defaultColumnWidth || 150;
}

function getRenderedHeaderWidth(th: HTMLElement, col: ColumnDef, config: ViewConfig): number {
  const table = th.closest("table.db-table");
  const colEl = table?.querySelector<HTMLElement>(`col[data-note-database-column-key="${CSS.escape(col.key)}"]`);
  const parsedWidth = colEl ? parseFloat(colEl.style.width || "") : Number.NaN;
  return Number.isFinite(parsedWidth) && parsedWidth > 0 ? parsedWidth : getColumnWidth(col, config);
}

function isHeaderNarrow(width: number, col: ColumnDef): boolean {
  const labelLength = (col.label || col.key).length;
  return width < Math.min(180, Math.max(96, labelLength * 7 + 54));
}

function getAvailableTableWidth(table: HTMLTableElement): number {
  const wrap = table.closest(".db-table-wrap");
  const parent = wrap?.parentElement;
  if (!parent) return 0;
  const cs = getComputedStyle(parent);
  const paddingLeft = parseFloat(cs.paddingLeft) || 0;
  const paddingRight = parseFloat(cs.paddingRight) || 0;
  return Math.max(0, Math.floor(parent.getBoundingClientRect().width - paddingLeft - paddingRight));
}

function getSelectionColumnWidth(selectionCol: HTMLElement): number {
  const styleWidth = parseFloat(selectionCol.style.width || "");
  if (Number.isFinite(styleWidth) && styleWidth > 0) return styleWidth;
  const attrWidth = Number(selectionCol.getAttribute("width"));
  if (Number.isFinite(attrWidth) && attrWidth > 0) return attrWidth;
  return 40;
}
