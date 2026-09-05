// ───────────────────────────────────────────────────────────────────
// MODULE:    catalogue
// COMPONENT: one schema shape, ten vocabularies, one deterministic record set
// ───────────────────────────────────────────────────────────────────
//
// The acceptance question this file answers is "do the three environments hold
// the same thing", and the only way to answer it cheaply is to build all three
// from one structure. So the catalogue is the product-neutral truth: facets
// with a neutral type and a plugin column type, records with values keyed by
// facet, and views declared once. Each emitter then translates, and none of
// them invents.
//
// The facet list is derived from what the plugin can actually do, read out of
// src/data/types.ts and src/data/column-types.ts, not from a wish list. Every
// one of the thirteen ColumnDef types appears at least once, and the four
// display variants that are not types — link scheme, markdown render, rating,
// progress and ring number styles — appear as their own facets because a
// renderer treats them as different cells even though the type is the same.
//
// Two facets have no exact plugin type and are mapped to the nearest real one
// rather than invented: a person is a select over a fixed roster, since the
// plugin has no person column, and a tag is the `tags` key, which
// column-types.ts special-cases as an Obsidian tag list rather than a plain
// multi-select. Both are named honestly in the neutral type so a loader for
// another product can pick its own native shape.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { ColumnDef, DatabaseViewType, StatusOptionDef } from "../../src/data/types";
import { SeededRandom } from "./random.ts";
import { USE_CASES, type UseCaseVocabulary } from "./use-cases.ts";

// ───────────────────────────────────────────────────────────────────
// 2. THE DATE ANCHOR
// ───────────────────────────────────────────────────────────────────

// The same instant every other constructed harness in this repository freezes
// its clock to, so a generated database's events land inside the window a
// timeline or calendar draws when it is captured. Two independent clock reads
// already moved every timeline picture once a day before that instant existed;
// a data set with its own second anchor would reintroduce the same drift from
// the other side.
export const ANCHOR = new Date(2026, 2, 25, 13, 45, 0, 0);

/** Day-only arithmetic in UTC so a date key is the same string on every machine.
 *  Frontmatter dates are plain YYYY-MM-DD, so no local offset ever applies. */
const ANCHOR_DAY_UTC = Date.UTC(2026, 2, 25);
const MS_PER_DAY = 86400000;

function dateKey(offsetDays: number): string {
  return new Date(ANCHOR_DAY_UTC + offsetDays * MS_PER_DAY).toISOString().slice(0, 10);
}

function dateTimeKey(offsetDays: number, hour: number, minute: number): string {
  return `${dateKey(offsetDays)}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// ───────────────────────────────────────────────────────────────────
// 3. FACETS
// ───────────────────────────────────────────────────────────────────

export const FACETS = [
  "title", "summary", "notes", "markdown", "url", "email", "phone",
  "number", "rating", "progress", "ring", "currency",
  "select", "person", "multiSelect", "tags", "status", "checkbox",
  "date", "rangeStart", "rangeEnd", "datetime",
  "computed", "relation", "rollup", "files", "created", "modified",
] as const;

export type Facet = (typeof FACETS)[number];

/** The product-neutral type a loader for Anytype, or any tool reading the CSV
 *  export, reads. It says what the value means, never which Obsidian column
 *  type carries it. */
export type NeutralType =
  | "title" | "text" | "richText" | "url" | "email" | "phone"
  | "number" | "rating" | "percent" | "money"
  | "select" | "person" | "multiSelect" | "tag" | "status" | "checkbox"
  | "date" | "dateTime" | "formula" | "relation" | "rollup" | "file"
  | "createdTime" | "modifiedTime";

interface FacetShape {
  /** Frontmatter key, or the built-in field key for the two file facets. */
  key: string;
  neutral: NeutralType;
  columnType: ColumnDef["type"];
  defaultLabel: string;
  /** True when the value lives on the file rather than in frontmatter. */
  derived?: boolean;
}

// Key order here is the column order every database gets, so a reader comparing
// two use cases side by side compares like with like.
const FACET_SHAPES: Record<Facet, FacetShape> = {
  title: { key: "file.name", neutral: "title", columnType: "text", defaultLabel: "Title", derived: true },
  summary: { key: "summary", neutral: "text", columnType: "text", defaultLabel: "Summary" },
  notes: { key: "notes", neutral: "text", columnType: "text", defaultLabel: "Notes" },
  markdown: { key: "headline", neutral: "richText", columnType: "text", defaultLabel: "Headline" },
  url: { key: "link", neutral: "url", columnType: "text", defaultLabel: "Link" },
  email: { key: "contact_email", neutral: "email", columnType: "text", defaultLabel: "Email" },
  phone: { key: "contact_phone", neutral: "phone", columnType: "text", defaultLabel: "Phone" },
  number: { key: "amount", neutral: "number", columnType: "number", defaultLabel: "Amount" },
  rating: { key: "rating", neutral: "rating", columnType: "number", defaultLabel: "Rating" },
  progress: { key: "progress", neutral: "percent", columnType: "number", defaultLabel: "Progress" },
  ring: { key: "attainment", neutral: "percent", columnType: "number", defaultLabel: "Attainment" },
  currency: { key: "budget", neutral: "money", columnType: "currency", defaultLabel: "Budget" },
  select: { key: "priority", neutral: "select", columnType: "select", defaultLabel: "Priority" },
  person: { key: "owner", neutral: "person", columnType: "select", defaultLabel: "Owner" },
  multiSelect: { key: "labels", neutral: "multiSelect", columnType: "multi-select", defaultLabel: "Labels" },
  tags: { key: "tags", neutral: "tag", columnType: "multi-select", defaultLabel: "Tags" },
  status: { key: "status", neutral: "status", columnType: "status", defaultLabel: "Status" },
  checkbox: { key: "pinned", neutral: "checkbox", columnType: "checkbox", defaultLabel: "Pinned" },
  date: { key: "due", neutral: "date", columnType: "date", defaultLabel: "Due" },
  rangeStart: { key: "starts", neutral: "date", columnType: "date", defaultLabel: "Starts" },
  rangeEnd: { key: "ends", neutral: "date", columnType: "date", defaultLabel: "Ends" },
  datetime: { key: "reviewed_at", neutral: "dateTime", columnType: "datetime", defaultLabel: "Reviewed" },
  computed: { key: "", neutral: "formula", columnType: "computed", defaultLabel: "Computed", derived: true },
  relation: { key: "related", neutral: "relation", columnType: "relation", defaultLabel: "Related" },
  rollup: { key: "related_count", neutral: "rollup", columnType: "rollup", defaultLabel: "Related count", derived: true },
  files: { key: "attachments", neutral: "file", columnType: "files", defaultLabel: "Attachments" },
  created: { key: "file.ctime", neutral: "createdTime", columnType: "date", defaultLabel: "Created", derived: true },
  modified: { key: "file.mtime", neutral: "modifiedTime", columnType: "date", defaultLabel: "Modified", derived: true },
};

/** The frontmatter facets, in write order. Excludes everything the file or the
 *  view derives, since writing those into frontmatter would create a second,
 *  disagreeing source for the same cell. */
export const WRITTEN_FACETS: Facet[] = FACETS.filter((facet) => !FACET_SHAPES[facet].derived);

// ───────────────────────────────────────────────────────────────────
// 4. CATALOGUE SHAPES
// ───────────────────────────────────────────────────────────────────

export interface CatalogueColumn {
  facet: Facet;
  key: string;
  label: string;
  neutral: NeutralType;
  columnType: ColumnDef["type"];
  options?: StatusOptionDef[];
  /** Present on the computed facet only. */
  expression?: string;
  /** "percent" marks a computed or number column whose unit is a percentage. */
  unit?: "percent";
}

export interface CatalogueRecord {
  /** Stable across runs and unique inside its use case. Also the note filename. */
  id: string;
  title: string;
  /** Keyed by facet. A missing facet is a deliberately empty cell. Relation
   *  values are the `id` of another record in the same use case, never its
   *  title: the id is what every emitter can resolve to a link, a filename or
   *  a foreign key without guessing. */
  values: Partial<Record<Facet, unknown>>;
}

export interface CatalogueView {
  id: string;
  name: string;
  type: DatabaseViewType;
  groupField?: string;
  startField?: string;
  endField?: string;
  titleField?: string;
  colorField?: string;
  chartValueField?: string;
}

export interface CatalogueUseCase {
  id: string;
  name: string;
  icon: string;
  description: string;
  columns: CatalogueColumn[];
  views: CatalogueView[];
  records: CatalogueRecord[];
}

export interface Catalogue {
  schemaVersion: number;
  seed: string;
  anchor: string;
  useCases: CatalogueUseCase[];
}

export const SCHEMA_VERSION = 1;
export const DEFAULT_SEED = "note-database-testbed";

// The two attachments that exist in the vault today. Pointing at a file that is
// not there would exercise the unresolved-link path, which is a real state worth
// covering, but it would also make the vault write self-inconsistent, and an
// environment nobody can trust to be complete cannot answer "are all three the
// same".
const ATTACHMENTS = [
  "Database Testbed/Attachments/audit-checklist.md",
  "Database Testbed/Attachments/release-notes.txt",
];

// ───────────────────────────────────────────────────────────────────
// 5. SCHEMA
// ───────────────────────────────────────────────────────────────────

function buildColumns(vocabulary: UseCaseVocabulary): CatalogueColumn[] {
  return FACETS.map((facet) => {
    const shape = FACET_SHAPES[facet];
    const column: CatalogueColumn = {
      facet,
      key: facet === "computed" ? vocabulary.computed.key : shape.key,
      label: vocabulary.labels[facet] || shape.defaultLabel,
      neutral: shape.neutral,
      columnType: shape.columnType,
    };
    if (facet === "status") column.options = vocabulary.status;
    if (facet === "select") column.options = vocabulary.select;
    if (facet === "multiSelect") column.options = vocabulary.multiSelect;
    if (facet === "person") {
      column.options = vocabulary.people.map((person, index) => ({
        value: person,
        color: vocabulary.select[index % vocabulary.select.length].color,
      }));
    }
    if (facet === "tags") {
      column.options = vocabulary.tags.map((tag, index) => ({
        value: tag,
        color: vocabulary.multiSelect[index % vocabulary.multiSelect.length].color,
      }));
    }
    if (facet === "computed") {
      // The vocabulary writes its formula against the two shared numeric facets
      // by name; the schema is what knows their real keys.
      column.expression = vocabulary.computed.expression
        .replaceAll("[number]", `[${FACET_SHAPES.number.key}]`)
        .replaceAll("[currency]", `[${FACET_SHAPES.currency.key}]`);
      column.label = vocabulary.computed.label;
      if (vocabulary.computed.unit === "percent") column.unit = "percent";
    }
    if (facet === "progress" || facet === "ring") column.unit = "percent";
    return column;
  });
}

function buildViews(vocabulary: UseCaseVocabulary): CatalogueView[] {
  const prefix = vocabulary.id;
  // Table, board, calendar, timeline and chart are the view types the plugin
  // ships and keeps. List has already been removed from the tree and gallery is
  // being withdrawn, so a generated gallery view would be new configuration for
  // a surface whose migration path is the work in progress.
  return [
    { id: `${prefix}-table`, name: "All records", type: "table" },
    { id: `${prefix}-board`, name: "By status", type: "board", groupField: FACET_SHAPES.status.key },
    {
      id: `${prefix}-calendar`, name: "Calendar", type: "calendar",
      startField: FACET_SHAPES.rangeStart.key, endField: FACET_SHAPES.rangeEnd.key,
      titleField: "file.name", colorField: FACET_SHAPES.status.key,
    },
    {
      id: `${prefix}-timeline`, name: "Timeline", type: "timeline",
      startField: FACET_SHAPES.rangeStart.key, endField: FACET_SHAPES.rangeEnd.key,
      groupField: FACET_SHAPES.status.key, titleField: "file.name",
      colorField: FACET_SHAPES.status.key,
    },
    {
      id: `${prefix}-chart`, name: "By status", type: "chart",
      groupField: FACET_SHAPES.status.key, chartValueField: FACET_SHAPES.currency.key,
    },
  ];
}

// ───────────────────────────────────────────────────────────────────
// 6. RECORDS
// ───────────────────────────────────────────────────────────────────

/** The record's display name and its note filename, in the form the existing
 *  testbed already uses: a two-digit ordinal, an em dash, then the title as
 *  written. The title is kept readable rather than slugged, because it IS the
 *  title column — a slug there would remove the one value a reader uses to tell
 *  two rows apart, and would quietly retire the long-title truncation case.
 *  Only the characters a filesystem or a wikilink cannot carry are replaced,
 *  and the ordinal is what keeps two identical titles from colliding. */
function recordId(index: number, title: string): string {
  const safe = title
    .replace(/[\\/:*?"<>|[\]#^]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${String(index + 1).padStart(2, "0")} — ${safe}`;
}

function buildRecords(vocabulary: UseCaseVocabulary, seed: string): CatalogueRecord[] {
  if (vocabulary.titles.length < vocabulary.recordCount) {
    throw new Error(`${vocabulary.id}: ${vocabulary.titles.length} titles for ${vocabulary.recordCount} records`);
  }
  const random = new SeededRandom(`${seed}:${vocabulary.id}`);
  const titles = vocabulary.titles.slice(0, vocabulary.recordCount);
  const records: CatalogueRecord[] = titles.map((title, index) => ({
    id: recordId(index, title),
    title,
    values: {},
  }));

  records.forEach((record, index) => {
    // The last record of every use case is left entirely empty. An environment
    // with no empty row cannot answer what an empty cell renders as, and a row
    // that is empty by accident is indistinguishable from a generator bug.
    if (index === records.length - 1) return;

    const optional = (chance: number): boolean => random.chance(chance);
    const startOffset = random.int(-58, 58);
    const spanDays = random.int(1, 21);

    record.values.summary = random.pick(vocabulary.summaries);
    // A wrapped multi-line cell is its own renderer path, and it is the one that
    // has to survive a narrow column. Left empty on some rows so the wrapped and
    // the empty case both appear in every environment.
    if (optional(0.7)) record.values.notes = random.pick(vocabulary.notes);
    if (optional(0.85)) record.values.markdown = random.pick(vocabulary.markdown);
    if (optional(0.8)) {
      const slug = record.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
      record.values.url = `${vocabulary.urlHost}/${slug}`;
    }
    if (optional(0.75)) {
      const person = random.pick(vocabulary.people);
      const local = person.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]+/g, ".");
      record.values.email = `${local}@${vocabulary.emailDomain}`;
    }
    if (optional(0.6)) record.values.phone = `+31 20 ${random.int(100, 999)} ${random.int(1000, 9999)}`;

    record.values.number = random.amount(vocabulary.number[0], vocabulary.number[1], vocabulary.number[2]);
    if (optional(0.9)) record.values.rating = random.int(1, 5);
    if (optional(0.9)) record.values.progress = random.int(0, 100);
    if (optional(0.8)) record.values.ring = random.int(0, 100);
    if (optional(0.92)) record.values.currency = random.amount(vocabulary.currency[0], vocabulary.currency[1], 2);

    record.values.status = random.pick(vocabulary.status).value;
    if (optional(0.9)) record.values.select = random.pick(vocabulary.select).value;
    if (optional(0.85)) record.values.person = random.pick(vocabulary.people);
    // One value on some rows and six on others is what makes a wrapping bug
    // visible; a fixed count never wraps or always does.
    if (optional(0.9)) {
      record.values.multiSelect = random.sample(vocabulary.multiSelect, random.int(1, Math.min(6, vocabulary.multiSelect.length)))
        .map((option) => option.value);
    }
    if (optional(0.7)) record.values.tags = random.sample(vocabulary.tags, random.int(1, 2));
    record.values.checkbox = random.chance(0.3);

    if (optional(0.9)) record.values.date = dateKey(startOffset + spanDays);
    record.values.rangeStart = dateKey(startOffset);
    record.values.rangeEnd = dateKey(startOffset + spanDays);
    if (optional(0.8)) record.values.datetime = dateTimeKey(startOffset - random.int(0, 12), random.int(7, 19), random.pick([0, 15, 30, 45]));
    if (optional(0.55)) record.values.files = random.sample(ATTACHMENTS, random.int(1, 2));
  });

  // Relations are wired after every record exists, so a link can point forwards
  // as well as backwards and the graph is not accidentally a chain.
  const linkable = records.slice(0, -1);
  records.forEach((record, index) => {
    if (index === records.length - 1) return;
    if (!random.chance(0.6)) return;
    const others = linkable.filter((candidate) => candidate.id !== record.id);
    record.values.relation = random.sample(others, random.int(1, 2)).map((target) => target.id);
  });

  return records;
}

// ───────────────────────────────────────────────────────────────────
// 7. BUILD
// ───────────────────────────────────────────────────────────────────

export function buildCatalogue(seed: string = DEFAULT_SEED): Catalogue {
  return {
    schemaVersion: SCHEMA_VERSION,
    seed,
    // Local wall-clock components of the shared anchor, written as a literal so
    // the file does not carry a machine's timezone into its own output.
    anchor: `${dateKey(0)}T13:45`,
    useCases: USE_CASES.map((vocabulary) => ({
      id: vocabulary.id,
      name: vocabulary.name,
      icon: vocabulary.icon,
      description: vocabulary.description,
      columns: buildColumns(vocabulary),
      views: buildViews(vocabulary),
      records: buildRecords(vocabulary, seed),
    })),
  };
}

/** Which plugin column types and neutral types a use case actually puts a value
 *  into. Used by the coverage assertion, which is the reason the acceptance
 *  criterion is checkable rather than asserted. */
export function coverageOf(useCase: CatalogueUseCase): { columnTypes: Set<string>; neutralTypes: Set<string> } {
  const columnTypes = new Set<string>();
  const neutralTypes = new Set<string>();
  const byFacet = new Map(useCase.columns.map((column) => [column.facet, column]));

  for (const column of useCase.columns) {
    const shape = FACET_SHAPES[column.facet];
    // A derived column carries no per-record value, and it is covered by being
    // configured: the file supplies created and modified, the view evaluates the
    // formula and the rollup, and the title is the filename.
    if (shape.derived) {
      columnTypes.add(column.columnType);
      neutralTypes.add(column.neutral);
    }
  }
  for (const record of useCase.records) {
    for (const facet of Object.keys(record.values) as Facet[]) {
      const column = byFacet.get(facet);
      if (!column) continue;
      const value = record.values[facet];
      if (value === undefined || value === null) continue;
      if (Array.isArray(value) && value.length === 0) continue;
      columnTypes.add(column.columnType);
      neutralTypes.add(column.neutral);
    }
  }
  return { columnTypes, neutralTypes };
}
