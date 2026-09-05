// ───────────────────────────────────────────────────────────────────
// MODULE:    emit-portable
// COMPONENT: catalogue to the two product-neutral outputs, JSON and CSV
// ───────────────────────────────────────────────────────────────────
//
// Anytype is loaded over its object API by an agent driving the app, and the
// CSV export exists for any tool whose only intake is a CSV import. Neither
// can read an Obsidian note, so both read from here, and both read the SAME
// record set the vault got. That is the whole mechanism behind the "same
// records in all three" criterion: one build, three translations, no second
// source.
//
// The JSON carries a neutral type per column so a loader picks its own native
// field rather than guessing from the value. The CSV cannot carry a type at
// all — it is a grid of strings — so the JSON is the schema and the CSV is the
// rows, and a loader that has both should read the types from the JSON.
//
// Neither output invents a created or modified timestamp. Those two columns
// are declared with `source: "file"` and carry no value, because in the vault
// they come from the filesystem; a synthesized timestamp would be the one
// field where the three environments silently disagree.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Catalogue, CatalogueColumn, CatalogueUseCase } from "./catalogue.ts";

// ───────────────────────────────────────────────────────────────────
// 2. JSON
// ───────────────────────────────────────────────────────────────────

interface PortableColumn {
  key: string;
  label: string;
  type: string;
  /** Present when the value is not carried per record. */
  source?: "file" | "formula" | "rollup" | "filename";
  options?: string[];
  expression?: string;
  unit?: "percent";
}

function portableColumn(column: CatalogueColumn): PortableColumn {
  const portable: PortableColumn = {
    key: column.key,
    label: column.label,
    type: column.neutral,
  };
  if (column.options) portable.options = column.options.map((option) => option.value);
  if (column.expression) portable.expression = column.expression;
  if (column.unit) portable.unit = column.unit;
  if (column.facet === "title") portable.source = "filename";
  if (column.facet === "computed") portable.source = "formula";
  if (column.facet === "rollup") portable.source = "rollup";
  if (column.facet === "created" || column.facet === "modified") portable.source = "file";
  return portable;
}

export function emitJson(catalogue: Catalogue): string {
  const document = {
    schemaVersion: catalogue.schemaVersion,
    seed: catalogue.seed,
    anchor: catalogue.anchor,
    note: "Deterministic mock data. Regenerating with the same seed produces the same bytes. "
      + "Created and modified columns carry no value: the host product supplies them.",
    useCases: catalogue.useCases.map((useCase) => ({
      id: useCase.id,
      name: useCase.name,
      icon: useCase.icon,
      description: useCase.description,
      recordCount: useCase.records.length,
      columns: useCase.columns.map(portableColumn),
      views: useCase.views,
      records: useCase.records.map((record) => {
        const values: Record<string, unknown> = {};
        for (const column of useCase.columns) {
          const value = record.values[column.facet];
          if (value === undefined || value === null) continue;
          if (Array.isArray(value) && value.length === 0) continue;
          values[column.key] = value;
        }
        return { id: record.id, title: record.title, values };
      }),
    })),
  };
  return `${JSON.stringify(document, null, 2)}\n`;
}

// ───────────────────────────────────────────────────────────────────
// 3. CSV
// ───────────────────────────────────────────────────────────────────

/** RFC 4180. Quote when the value holds a comma, a quote, or a line break, and
 *  double an embedded quote. A field with a newline stays one field, which is
 *  what keeps a wrapped note from becoming three rows on import. */
function csvField(value: string): string {
  if (!/[",\r\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

function csvValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

/** One CSV per use case. The first column is the record title, because a CSV
 *  import has no other way to name a row. */
export function emitCsv(useCase: CatalogueUseCase): string {
  const valued = useCase.columns.filter((column) => column.facet !== "title");
  const header = ["Title", ...valued.map((column) => column.label)];
  const rows = useCase.records.map((record) => [
    record.title,
    ...valued.map((column) => csvValue(record.values[column.facet])),
  ]);
  return [header, ...rows]
    .map((row) => row.map(csvField).join(","))
    .join("\n")
    .concat("\n");
}

export function emitAllCsv(catalogue: Catalogue): Array<{ id: string; content: string }> {
  return catalogue.useCases.map((useCase) => ({ id: useCase.id, content: emitCsv(useCase) }));
}
