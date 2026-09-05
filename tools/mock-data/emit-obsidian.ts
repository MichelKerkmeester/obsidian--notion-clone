// ───────────────────────────────────────────────────────────────────
// MODULE:    emit-obsidian
// COMPONENT: catalogue to vault files — one database note and its records
// ───────────────────────────────────────────────────────────────────
//
// The shape written here is the shape the vault already holds, read out of
// the existing Testbed database file rather than derived from the parser: a
// `db_view: true` note whose `database` block carries columns, computedFields
// and views, beside a folder of record notes whose frontmatter keys are the
// column keys. Copying the on-disk form matters more than copying the parser,
// because `parseDatabaseConfig` absorbs several older schema generations and
// would happily accept a file no version of the plugin ever wrote.
//
// YAML is emitted by hand. The plugin's own `stringifyYaml` comes from the
// `obsidian` module, which only exists inside the app, and adding a YAML
// dependency to write four scalar shapes would be the costliest move on the
// ladder for the smallest possible gain. What the hand serializer must get
// right is quoting, and it errs toward quoting: an unquoted `2026-03-25` is a
// date to a YAML parser and a string to this plugin, and that difference is
// invisible until a cell renders wrong.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Catalogue, CatalogueColumn, CatalogueRecord, CatalogueUseCase } from "./catalogue.ts";

// ───────────────────────────────────────────────────────────────────
// 2. YAML
// ───────────────────────────────────────────────────────────────────

type YamlValue = string | number | boolean | null | YamlValue[] | { [key: string]: YamlValue };

/** Double-quoted, with the escapes a YAML flow scalar needs. Every string the
 *  emitter writes goes through this, so nothing is left to a bare-scalar rule. */
function quote(value: string): string {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
  return `"${escaped}"`;
}

function scalar(value: string | number | boolean | null): string {
  if (value === null) return '""';
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return quote(value);
}

function isScalar(value: YamlValue): value is string | number | boolean | null {
  return value === null || typeof value !== "object";
}

/** Block-style YAML at `indent` spaces. Returns lines without a trailing newline. */
function emitYaml(value: YamlValue, indent: number): string[] {
  const pad = " ".repeat(indent);

  if (isScalar(value)) return [`${pad}${scalar(value)}`];

  if (Array.isArray(value)) {
    if (value.length === 0) return [`${pad}[]`];
    const lines: string[] = [];
    for (const item of value) {
      if (isScalar(item)) {
        lines.push(`${pad}- ${scalar(item)}`);
        continue;
      }
      const nested = emitYaml(item, indent + 2);
      // The first nested line carries the dash; the rest keep their own indent.
      lines.push(`${pad}- ${nested[0].slice(indent + 2)}`);
      lines.push(...nested.slice(1));
    }
    return lines;
  }

  const entries = Object.entries(value);
  if (entries.length === 0) return [`${pad}{}`];
  const lines: string[] = [];
  for (const [key, child] of entries) {
    if (isScalar(child)) {
      lines.push(`${pad}${key}: ${scalar(child)}`);
      continue;
    }
    if (Array.isArray(child) && child.length === 0) {
      lines.push(`${pad}${key}: []`);
      continue;
    }
    if (!Array.isArray(child) && Object.keys(child).length === 0) {
      lines.push(`${pad}${key}: {}`);
      continue;
    }
    lines.push(`${pad}${key}:`);
    lines.push(...emitYaml(child, indent + 2));
  }
  return lines;
}

// ───────────────────────────────────────────────────────────────────
// 3. VAULT PATHS
// ───────────────────────────────────────────────────────────────────

export interface VaultFile {
  /** Vault-relative, forward-slashed, always under the testbed root. */
  path: string;
  content: string;
}

/** The folder the generated databases live in, beside the existing Testbed. */
export const TESTBED_ROOT = "Database Testbed";

export function useCaseFolder(useCase: CatalogueUseCase): string {
  return `${TESTBED_ROOT}/${useCase.name}`;
}

function recordFolder(useCase: CatalogueUseCase): string {
  return `${useCaseFolder(useCase)}/Records`;
}

// ───────────────────────────────────────────────────────────────────
// 4. COLUMNS
// ───────────────────────────────────────────────────────────────────

// The display variants that are not column types. Each is one property on the
// ColumnDef the renderer branches on, and each is the reason its facet exists.
function columnDisplay(column: CatalogueColumn): Record<string, YamlValue> {
  switch (column.facet) {
    case "notes":
      return { wrap: true };
    case "markdown":
      return { textRenderMode: "markdown" };
    case "url":
      return { textRenderMode: "link", textLinkScheme: "https" };
    case "email":
      return { textRenderMode: "link", textLinkScheme: "mailto" };
    case "phone":
      return { textRenderMode: "link", textLinkScheme: "tel" };
    case "rating":
      return { numberDisplayStyle: "rating", numberDisplayConfig: { ratingSymbol: "star", ratingMax: 5 } };
    case "progress":
      return { numberDisplayStyle: "progress", numberDisplayConfig: { progressDivisor: 100, progressShowValue: true } };
    case "ring":
      return { numberDisplayStyle: "ring", numberDisplayConfig: { progressDivisor: 100 } };
    default:
      return {};
  }
}

function columnBlock(useCase: CatalogueUseCase, column: CatalogueColumn): Record<string, YamlValue> {
  const block: Record<string, YamlValue> = {
    key: column.key,
    label: column.label,
    type: column.columnType,
  };

  if (column.options) {
    block.statusOptions = column.options.map((option) => ({ value: option.value, color: option.color }));
  }
  if (column.facet === "computed") {
    block.computedKey = column.key;
  }
  if (column.facet === "relation") {
    block.relationConfig = { targetDatabaseId: useCase.id };
  }
  if (column.facet === "rollup") {
    const relation = useCase.columns.find((candidate) => candidate.facet === "relation");
    block.rollupConfig = {
      relationField: relation ? relation.key : "related",
      targetField: "file.name",
      aggregation: "count",
    };
  }
  return { ...block, ...columnDisplay(column) };
}

// ───────────────────────────────────────────────────────────────────
// 5. VIEWS
// ───────────────────────────────────────────────────────────────────

function keyOf(useCase: CatalogueUseCase, facet: string): string {
  const column = useCase.columns.find((candidate) => candidate.facet === facet);
  return column ? column.key : "";
}

function viewBlock(useCase: CatalogueUseCase, view: CatalogueUseCase["views"][number]): Record<string, YamlValue> {
  const columnOrder = useCase.columns.map((column) => column.key);
  const block: Record<string, YamlValue> = {
    id: view.id,
    name: view.name,
    viewType: view.type,
    sourceFolder: "",
    sourceRules: [],
    sourceLogic: "and",
    showRecordIcon: false,
    recordIconFieldOverrideEnabled: false,
    recordIconField: "",
    newRecordFolder: "",
    displayWidth: "wide",
    sortColumn: "",
    sortDirection: "asc",
    sortRules: [{ field: "file.name", direction: "asc" }],
    columnOrder,
    hiddenColumns: [],
    columnWidths: {},
    groupByField: "",
    filterLogic: "and",
    filters: [],
    summaryRules: [],
    conditionalFormats: [],
  };

  if (view.type === "board") {
    block.boardGroupField = view.groupField || "";
    block.boardHiddenGroups = {};
  }
  if (view.type === "calendar") {
    block.calendarStartDateField = view.startField || "";
    block.calendarEndDateField = view.endField || "";
    block.calendarTitleField = view.titleField || "";
    block.calendarColorField = view.colorField || "";
    block.calendarScale = "month";
  }
  if (view.type === "timeline") {
    block.timelineStartDateField = view.startField || "";
    block.timelineEndDateField = view.endField || "";
    block.timelineGroupField = view.groupField || "";
    block.timelineTitleField = view.titleField || "";
    block.timelineColorField = view.colorField || "";
    block.timelineScale = "week";
  }
  if (view.type === "chart") {
    block.chartType = "bar";
    block.chartGroupField = view.groupField || "";
    block.chartAggregation = "sum";
    block.chartValueField = view.chartValueField || "";
    block.chartShowTitle = true;
    block.chartTitle = `${useCase.name} by ${keyOf(useCase, "status")}`;
  }
  return block;
}

// ───────────────────────────────────────────────────────────────────
// 6. THE DATABASE NOTE
// ───────────────────────────────────────────────────────────────────

function databaseNote(useCase: CatalogueUseCase): VaultFile {
  const computed = useCase.columns.find((column) => column.facet === "computed");
  const database: Record<string, YamlValue> = {
    id: useCase.id,
    name: useCase.name,
    icon: useCase.icon,
    coverImage: "",
    coverImagePositionY: 50,
    description: useCase.description,
    sourceFolder: recordFolder(useCase),
    sourceRules: [],
    sourceLogic: "and",
    newRecordFolder: recordFolder(useCase),
    recordIconField: "",
    computedSyncMode: "display-only",
    summaryFormulas: {},
    columns: useCase.columns.map((column) => columnBlock(useCase, column)),
    computedFields: computed
      ? [{ key: computed.key, label: computed.label, expression: computed.expression || "", type: "number" }]
      : [],
    statusPresets: [],
    defaultStatusPresetId: "",
    views: useCase.views.map((view) => viewBlock(useCase, view)),
  };

  const lines = [
    "---",
    "db_view: true",
    "database:",
    ...emitYaml(database, 2),
    "---",
    "",
    `> Generated test database. Records live in \`${recordFolder(useCase)}\`.`,
    "",
  ];
  return { path: `${useCaseFolder(useCase)}/${useCase.name}.md`, content: lines.join("\n") };
}

// ───────────────────────────────────────────────────────────────────
// 7. RECORD NOTES
// ───────────────────────────────────────────────────────────────────

function frontmatterValue(useCase: CatalogueUseCase, column: CatalogueColumn, value: unknown): YamlValue {
  if (column.facet === "relation") {
    return (value as string[]).map((id) => `[[${id}]]`);
  }
  if (column.facet === "files") {
    return (value as string[]).map((path) => `[[${path}]]`);
  }
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "number" || typeof value === "boolean") return value;
  return String(value);
}

function recordNote(useCase: CatalogueUseCase, record: CatalogueRecord): VaultFile {
  const body: Record<string, YamlValue> = {};
  for (const column of useCase.columns) {
    const value = record.values[column.facet];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    body[column.key] = frontmatterValue(useCase, column, value);
  }

  const frontmatter = Object.keys(body).length === 0
    ? ["---", "---"]
    : ["---", ...emitYaml(body, 0), "---"];

  const lines = [
    ...frontmatter,
    "",
    `# ${record.id}`,
    "",
    `${record.title}. Generated record for the ${useCase.name} database. Not real data.`,
    "",
  ];
  return { path: `${recordFolder(useCase)}/${record.id}.md`, content: lines.join("\n") };
}

// ───────────────────────────────────────────────────────────────────
// 8. EMIT
// ───────────────────────────────────────────────────────────────────

/** Every file the vault write produces, in a stable order. The caller decides
 *  where the vault root is; nothing here reaches the filesystem, which is what
 *  lets the unit tests assert the bytes without a vault. */
export function emitObsidian(catalogue: Catalogue): VaultFile[] {
  const files: VaultFile[] = [];
  for (const useCase of catalogue.useCases) {
    files.push(databaseNote(useCase));
    for (const record of useCase.records) {
      files.push(recordNote(useCase, record));
    }
  }
  return files;
}
