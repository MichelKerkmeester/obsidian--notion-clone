// Comparative bench: the real ListRenderer (card pipeline) against the real
// TableRenderer (structural only), at one matched shape, so "table works and
// list freezes" can be read as a number rather than asserted.

import { ListRenderer, type ListRendererActions } from "/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/list-renderer";
import { TableRenderer, type TableRendererActions } from "/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/table-renderer";
import type { App } from "obsidian";
import type { ColumnDef, RowData, ViewConfig } from "/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/types";

const REPORTED_COLUMNS = [
  "notion_id", "month", "sort_key", "purchases", "subscriptions", "done", "added_to",
  "stocks", "date", "p_", "withdrawn", "balance", "category", "account", "note",
  "cleared", "transfer", "tag", "amount", "currency", "source",
];

function makeColumns(count: number): ColumnDef[] {
  return Array.from({ length: count }, (_u, i) => ({
    key: i === 0 ? "file.name" : REPORTED_COLUMNS[i % REPORTED_COLUMNS.length] + (i >= REPORTED_COLUMNS.length ? String(i) : ""),
    label: i === 0 ? "Name" : REPORTED_COLUMNS[i % REPORTED_COLUMNS.length],
    type: "text",
  })) as ColumnDef[];
}

function makeRows(count: number, columns: ColumnDef[], fillRate: number): RowData[] {
  return Array.from({ length: count }, (_u, i) => {
    const frontmatter: Record<string, unknown> = {};
    columns.forEach((col, colIndex) => {
      const filled = fillRate >= 1 || ((i * 7 + colIndex * 3) % 10) < fillRate * 10;
      if (filled) frontmatter[col.key] = `${col.key}-${i}`;
    });
    return {
      file: { path: `notes/row-${i}.md`, basename: `row-${i}`, name: `row-${i}.md` },
      frontmatter,
      computed: {},
    } as unknown as RowData;
  });
}

function listActions(columns: ColumnDef[]): ListRendererActions {
  return {
    openRow: () => undefined,
    createEntry: () => undefined,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    editCell: () => undefined,
    getColumns: () => columns,
    moveRowToPosition: () => undefined,
    isReadOnly: false,
  };
}

function tableActions(columns: ColumnDef[]): TableRendererActions {
  return {
    getVisibleColumns: () => columns,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    setupColumnHeader: (th, col) => { th.setText(col.label); },
    setupRow: () => undefined,
    renderCell: (td, row, col) => { td.setText(String(row.frontmatter[col.key] ?? "")); },
    createEntry: () => undefined,
  };
}

export interface Sample {
  view: string;
  columns: number;
  rows: number;
  fillRate: number;
  renderMs: number;
  layoutMs: number;
  blockedMs: number;
  domNodes: number;
  nodesPerRow: number;
  msPerRow: number;
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

export function runCompare(
  host: HTMLElement,
  options: { rowCounts?: number[]; columnCount?: number; fillRate?: number; repeats?: number } = {},
): Sample[] {
  const rowCounts = options.rowCounts ?? [400, 1600, 3200, 6400];
  const columnCount = options.columnCount ?? 21;
  const fillRate = options.fillRate ?? 0.3;
  const repeats = options.repeats ?? 3;

  const app = undefined as unknown as App;
  const columns = makeColumns(columnCount);
  const config = { name: "Bench", sourceFolder: "notes", schema: { columns, computedFields: [] }, columns } as unknown as ViewConfig;
  const lActions = listActions(columns);
  const tActions = tableActions(columns);
  const samples: Sample[] = [];

  for (const rowCount of rowCounts) {
    const rows = makeRows(rowCount, columns, fillRate);

    for (const view of ["list", "table"] as const) {
      const renderTimes: number[] = [];
      const layoutTimes: number[] = [];
      let domNodes = 0;

      for (let run = 0; run <= repeats; run += 1) {
        const container = host.createDiv({ cls: "note-database-container" });
        const start = performance.now();
        if (view === "list") new ListRenderer(app, lActions).render(container, config, rows);
        else new TableRenderer(tActions).renderTable(container, config, rows);
        const rendered = performance.now();

        const layoutStart = performance.now();
        void container.offsetHeight;
        const layoutEnd = performance.now();

        if (run > 0) {
          renderTimes.push(rendered - start);
          layoutTimes.push(layoutEnd - layoutStart);
          domNodes = container.querySelectorAll("*").length;
        }
        container.remove();
      }

      const r = median(renderTimes);
      const l = median(layoutTimes);
      samples.push({
        view,
        columns: columnCount,
        rows: rowCount,
        fillRate,
        renderMs: Number(r.toFixed(1)),
        layoutMs: Number(l.toFixed(1)),
        blockedMs: Number((r + l).toFixed(1)),
        domNodes,
        nodesPerRow: Number((domNodes / rowCount).toFixed(1)),
        msPerRow: Number((r / rowCount).toFixed(4)),
      });
    }
  }
  return samples;
}
