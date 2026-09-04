// ───────────────────────────────────────────────────────────────────
// MODULE:    board-card-fields.test
// COMPONENT: resolver, parse, and derived card-field list
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. CASES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { NO_TITLE_FIELD, type ColumnDef, type ViewConfig } from "../data/types";
import {
  listBoardCardFields,
  parseBoardCardFields,
  resolveBoardCardFields,
} from "./board-card-fields";

function col(key: string, type: ColumnDef["type"] = "text"): ColumnDef {
  return { key, label: key, type };
}

function config(overrides: Partial<ViewConfig> = {}): ViewConfig {
  return {
    name: "Board",
    sourceFolder: "",
    viewType: "board",
    schema: { columns: [], computedFields: [] },
    ...overrides,
  };
}

function preChangeFilter(
  columns: ColumnDef[],
  view: ViewConfig,
  groupField: string,
  subgroupField?: string,
): ColumnDef[] {
  const titleField = view.titleField === NO_TITLE_FIELD ? undefined : (view.titleField || "file.name");
  const groupedFields = new Set([groupField, ...(subgroupField ? [subgroupField] : [])]);
  return columns.filter(
    (candidate) =>
      candidate.key !== titleField
      && !groupedFields.has(candidate.key)
      && candidate.type !== "select"
      && candidate.type !== "status",
  );
}

const SCHEMA_SHAPES: Array<{ name: string; columns: ColumnDef[]; groupField: string; subgroupField?: string; hidden?: string[] }> = [
  {
    name: "title + status group + select + body fields",
    columns: [
      col("file.name"),
      col("status", "status"),
      col("priority", "select"),
      col("hours", "number"),
      col("tags", "multi-select"),
      col("due", "date"),
      col("notes"),
    ],
    groupField: "status",
  },
  {
    name: "custom title and a subgroup",
    columns: [
      col("file.name"),
      col("title"),
      col("status", "status"),
      col("lane", "select"),
      col("owner", "multi-select"),
    ],
    groupField: "status",
    subgroupField: "lane",
  },
  {
    name: "no title field and only body columns",
    columns: [col("notes"), col("hours", "number")],
    groupField: "missing",
  },
  {
    name: "hidden table columns still drop from the derived set",
    columns: [col("file.name"), col("hours", "number"), col("secret")],
    groupField: "status",
    hidden: ["secret"],
  },
  {
    name: "the title field is the only column in the schema",
    columns: [col("file.name")],
    groupField: "missing",
  },
];

describe("parseBoardCardFields", () => {
  it("returns undefined for a missing or malformed value", () => {
    expect(parseBoardCardFields(undefined)).toBeUndefined();
    expect(parseBoardCardFields("hours")).toBeUndefined();
    expect(parseBoardCardFields({ key: "hours", visible: true })).toBeUndefined();
  });

  it("keeps an empty array so every field can be hidden", () => {
    expect(parseBoardCardFields([])).toEqual([]);
  });

  it("drops entries without a string key and treats a missing visible flag as shown", () => {
    expect(parseBoardCardFields([
      { key: "hours", visible: false },
      { key: "", visible: true },
      { visible: true },
      { key: "tags" },
      "notes",
    ])).toEqual([
      { key: "hours", visible: false },
      { key: "tags", visible: true },
    ]);
  });
});

describe("resolveBoardCardFields", () => {
  it.each(SCHEMA_SHAPES)("reproduces the pre-change filter when the list is absent: $name", (shape) => {
    const view = config({
      titleField: shape.columns.some((candidate) => candidate.key === "title") ? "title" : undefined,
      hiddenColumns: shape.hidden,
      schema: { columns: shape.columns, computedFields: [] },
    });
    if (shape.columns.every((candidate) => candidate.key !== "file.name") && !view.titleField) {
      view.titleField = NO_TITLE_FIELD;
    }
    const visibleInput = shape.columns.filter((candidate) => !(shape.hidden ?? []).includes(candidate.key));
    const expected = preChangeFilter(visibleInput, view, shape.groupField, shape.subgroupField);
    expect(resolveBoardCardFields(view, shape.columns, {
      groupField: shape.groupField,
      subgroupField: shape.subgroupField,
    }).map((candidate) => candidate.key)).toEqual(expected.map((candidate) => candidate.key));
  });

  it("uses stored order and visibility, drops unknown keys, and appends new columns hidden", () => {
    const columns = [
      col("file.name"),
      col("hours", "number"),
      col("tags", "multi-select"),
      col("new-field"),
    ];
    const view = config({
      boardCardFields: [
        { key: "tags", visible: true },
        { key: "gone", visible: true },
        { key: "hours", visible: false },
      ],
    });
    expect(resolveBoardCardFields(view, columns, { groupField: "status" }).map((candidate) => candidate.key))
      .toEqual(["tags"]);
    expect(listBoardCardFields(view, columns, { groupField: "status" }).map((entry) => ({
      key: entry.column.key,
      visible: entry.visible,
    }))).toEqual([
      { key: "tags", visible: true },
      { key: "hours", visible: false },
      { key: "new-field", visible: false },
    ]);
  });

  it("gives two views over the same database different card fields without touching either's hiddenColumns", () => {
    const columns = [col("file.name"), col("hours", "number"), col("tags", "multi-select"), col("notes")];
    const sharedHidden = ["notes"];
    const viewA = config({
      hiddenColumns: sharedHidden,
      boardCardFields: [{ key: "hours", visible: true }, { key: "tags", visible: false }],
    });
    const viewB = config({
      hiddenColumns: sharedHidden,
      boardCardFields: [{ key: "tags", visible: true }, { key: "notes", visible: true }],
    });
    const fieldsA = resolveBoardCardFields(viewA, columns, { groupField: "status" }).map((c) => c.key);
    const fieldsB = resolveBoardCardFields(viewB, columns, { groupField: "status" }).map((c) => c.key);
    expect(fieldsA).toEqual(["hours"]);
    expect(fieldsB).toEqual(["tags", "notes"]);
    expect(fieldsA).not.toEqual(fieldsB);
    expect(viewA.hiddenColumns).toEqual(sharedHidden);
    expect(viewB.hiddenColumns).toEqual(sharedHidden);
  });

  it("ignores table hiddenColumns once a list is stored", () => {
    const columns = [col("file.name"), col("hours", "number"), col("notes")];
    const view = config({
      hiddenColumns: ["notes"],
      boardCardFields: [
        { key: "notes", visible: true },
        { key: "hours", visible: true },
      ],
    });
    expect(resolveBoardCardFields(view, columns, { groupField: "status" }).map((candidate) => candidate.key))
      .toEqual(["notes", "hours"]);
  });

  it("with the list absent, drops a column the caller reports as pre-change-invisible even though hiddenColumns does not name it", () => {
    // `visibleKeys` stands in for the caller's own getColumns()/getVisibleColumns() result,
    // which also drops a column that has no value on any current row. hiddenColumns alone
    // cannot see that case, so a caller supplying visibleKeys must win over it.
    const columns = [col("file.name"), col("hours", "number"), col("blank-forever")];
    const view = config({ hiddenColumns: [] });
    expect(resolveBoardCardFields(view, columns, {
      groupField: "status",
      visibleKeys: new Set(["file.name", "hours"]),
    }).map((candidate) => candidate.key)).toEqual(["hours"]);
  });

  it("with the list absent, keeps a column the caller reports as pre-change-visible", () => {
    const columns = [col("file.name"), col("hours", "number"), col("notes")];
    const view = config({ hiddenColumns: ["notes"] });
    expect(resolveBoardCardFields(view, columns, {
      groupField: "status",
      visibleKeys: new Set(["file.name", "hours", "notes"]),
    }).map((candidate) => candidate.key)).toEqual(["hours", "notes"]);
  });
});
