// ───────────────────────────────────────────────────────────────────
// MODULE:    catalogue-scenario
// COMPONENT: turns a mock-data use case into renderer input
// ───────────────────────────────────────────────────────────────────
//
// The generated fixtures the other scenarios use are shaped for cost: every row
// carries the same field count and the same value lengths, because a bench
// measuring structural cost wants the rows identical. That shape hides every
// defect whose cause is one row holding more than its neighbours — a cell that
// grows, a column that wraps, a row that stops matching the rhythm.
//
// The mock-data catalogue is the opposite: it varies per record on purpose, and
// it is the data the operator actually looks at on a device. So this converts a
// use case into the `ColumnDef`/`RowData` pair the renderers take, and a lane
// that mounts it measures the same population the operator photographed.
//
// THE CONVERSION IS THE EMITTER'S, NOT A SECOND COPY OF IT. `columnDisplay` and
// `frontmatterValue` are imported from `emit-obsidian` rather than reimplemented,
// because a column property this file guessed differently from the vault writer
// would make the lane measure a database nobody has. `wrap: true` on the notes
// facet is exactly such a property, and it is load-bearing for row height.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { ColumnDef, RowData, StatusOptionDef, ViewConfig } from "../../src/data/types";
import { ANCHOR, buildCatalogue, type CatalogueColumn, type CatalogueUseCase } from "../mock-data/catalogue";
import { columnDisplay, frontmatterValue, useCaseFolder } from "../mock-data/emit-obsidian";

// ───────────────────────────────────────────────────────────────────
// 2. CONVERSION
// ───────────────────────────────────────────────────────────────────

const catalogue = buildCatalogue();

export function catalogueUseCases(): string[] {
  return catalogue.useCases.map((useCase) => useCase.id);
}

function findUseCase(id: string): CatalogueUseCase {
  const useCase = catalogue.useCases.find((candidate) => candidate.id === id);
  if (!useCase) throw new Error(`catalogue-scenario: no use case "${id}"`);
  return useCase;
}

function toColumnDef(useCase: CatalogueUseCase, column: CatalogueColumn): ColumnDef {
  const def: ColumnDef = {
    key: column.key,
    label: column.label,
    type: column.columnType,
    ...(columnDisplay(column) as Partial<ColumnDef>),
  };
  if (column.options) def.statusOptions = column.options as StatusOptionDef[];
  if (column.facet === "computed") def.computedKey = column.key;
  if (column.facet === "relation") def.relationConfig = { targetDatabaseId: useCase.id } as ColumnDef["relationConfig"];
  if (column.facet === "rollup") {
    const relation = useCase.columns.find((candidate) => candidate.facet === "relation");
    def.rollupConfig = {
      relationField: relation ? relation.key : "related",
      targetField: "file.name",
      aggregation: "count",
    };
  }
  return def;
}

/** The columns and rows a use case's table view renders, in the catalogue's own order. */
export function catalogueTableData(id: string): { columns: ColumnDef[]; rows: RowData[]; config: ViewConfig } {
  const useCase = findUseCase(id);
  const columns = useCase.columns.map((column) => toColumnDef(useCase, column));
  const folder = `${useCaseFolder(useCase)}/Records`;

  // The created/modified columns read `file.stat`, which a vault supplies and a fixture must. The
  // anchor the catalogue already generates its dates from is used here too, so the two agree and a
  // rerun a day later measures the same table.
  const anchor = ANCHOR.getTime();
  const rows = useCase.records.map((record, index) => {
    const frontmatter: Record<string, unknown> = {};
    for (const column of useCase.columns) {
      const value = record.values[column.facet];
      if (value === undefined || value === null) continue;
      if (Array.isArray(value) && value.length === 0) continue;
      frontmatter[column.key] = frontmatterValue(useCase, column, value);
    }
    return {
      file: {
        path: `${folder}/${record.id}.md`,
        basename: record.id,
        name: `${record.id}.md`,
        extension: "md",
        stat: { ctime: anchor - (index + 1) * 86_400_000, mtime: anchor - index * 3_600_000, size: 1024 },
      },
      frontmatter,
      computed: {},
    } as unknown as RowData;
  });

  const config = {
    name: useCase.name,
    sourceFolder: folder,
    schema: { columns, computedFields: [] },
  } as unknown as ViewConfig;

  return { columns, rows, config };
}
