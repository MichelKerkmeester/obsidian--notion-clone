// ───────────────────────────────────────────────────────────────────
// MODULE:    table-layout
// COMPONENT: Pixel column-width math shared by the table renderer and its column-sync pass
// ───────────────────────────────────────────────────────────────────
//
// Leftover container width beyond the columns' base widths is added to the
// last column only, not distributed proportionally — this is what keeps a
// narrow table's rightmost column filling the remaining space instead of
// every column growing slightly.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export interface TableColumnStyle {
  width?: string;
  minWidth?: string;
}

export interface TableLayout {
  tableWidth: number;
  columnWidths: number[];
}

// ───────────────────────────────────────────────────────────────────
// 2. LAYOUT
// ───────────────────────────────────────────────────────────────────

export function getTableMinWidth(selectionWidth: number, columnWidths: number[]): number {
  return selectionWidth + columnWidths.reduce((total, width) => total + width, 0);
}

export function getTableLayout(selectionWidth: number, columnWidths: number[], availableWidth = 0): TableLayout {
  const baseWidth = getTableMinWidth(selectionWidth, columnWidths);
  const rendered = [...columnWidths];
  const extra = Math.max(0, Math.floor(availableWidth) - baseWidth);
  if (extra > 0 && rendered.length > 0) {
    rendered[rendered.length - 1] += extra;
  }
  return {
    tableWidth: baseWidth + extra,
    columnWidths: rendered,
  };
}

export function getTableColumnStyle(width: number, _index: number, _total: number): TableColumnStyle {
  return { width: `${width}px` };
}
