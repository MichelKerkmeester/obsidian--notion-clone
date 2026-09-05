// ───────────────────────────────────────────────────────────────────
// MODULE:    list-migration-real-data.test
// COMPONENT: the migration run against an actual vault's list view, not a synthetic one
// ───────────────────────────────────────────────────────────────────
//
// `list-migration.test.ts` proves the plan/apply contract against hand-built fixtures.
// This file proves the same contract against real data: the "Punch List" view frontmatter
// copied verbatim from the operator's own vault (`Database Testbed/Testbed.md`, `db_view: true`,
// view id `tb-list`, lines 443-587 at the point this test was written), fed through the
// production parser (`DataSource.parseDatabaseConfig`) exactly the way Obsidian's metadata
// cache would hand it in. The 18 columns and their real types/labels/options are transcribed
// from the same file's `database.columns` block (lines 17-118) — the schema the view's
// `columnOrder` actually references, not a shorter stand-in.
//
// Board/gallery/chart/calendar/timeline fields and the 27-entry `manualOrder.ranks` map are
// left out: they are untouched by `applyListMigration` and their real values (mostly empty
// defaults) would only pad the fixture without changing what any assertion here checks.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & THE REAL FIXTURE
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import type { App } from "obsidian";
import { DataSource } from "./data-source";
import { applyListMigration, planListMigration } from "./list-migration";
import type { ViewConfig } from "./types";

vi.mock("obsidian", () => ({
  App: class {},
  EventRef: class {},
  MetadataCache: class {},
  TFile: class {},
  Vault: class {},
  getAllTags: vi.fn(),
  normalizePath: (path: string) => path,
  parseYaml: vi.fn(),
  stringifyYaml: vi.fn(),
}));

const source = (): DataSource => new DataSource({ vault: {}, metadataCache: {} } as App);

/** `database.columns`, transcribed from Testbed.md:17-118. */
const TESTBED_COLUMNS = [
  { key: "file.name", label: "Title", type: "text" },
  { key: "summary", label: "Summary", type: "text" },
  {
    key: "status", label: "Status", type: "status",
    statusOptions: [
      { value: "Backlog", color: "gray" },
      { value: "In Progress", color: "blue" },
      { value: "Blocked", color: "red" },
      { value: "In Review", color: "orange" },
      { value: "Done", color: "green" },
      { value: "Archived", color: "purple" },
    ],
  },
  {
    key: "priority", label: "Priority", type: "select",
    statusOptions: [
      { value: "Low", color: "slate" },
      { value: "Medium", color: "yellow" },
      { value: "High", color: "orange" },
      { value: "Critical", color: "rose" },
    ],
  },
  {
    key: "labels", label: "Labels", type: "multi-select",
    statusOptions: [
      { value: "research", color: "cyan" },
      { value: "design", color: "violet" },
      { value: "urgent", color: "red" },
      { value: "mobile", color: "teal" },
      { value: "backend", color: "indigo" },
      { value: "docs", color: "brown" },
      { value: "infra", color: "lime" },
    ],
  },
  { key: "amount", label: "Amount", type: "number" },
  { key: "budget", label: "Budget", type: "currency" },
  { key: "net", label: "Net", type: "computed", computedKey: "net" },
  { key: "margin", label: "Margin %", type: "computed", computedKey: "margin" },
  { key: "due", label: "Due", type: "date" },
  { key: "reviewed_at", label: "Reviewed", type: "datetime" },
  { key: "pinned", label: "Pinned", type: "checkbox" },
  { key: "related", label: "Related", type: "relation", relationConfig: { targetDatabaseId: "testbed-db" } },
  {
    key: "related_count", label: "Related #", type: "rollup",
    rollupConfig: { relationField: "related", targetField: "file.name", aggregation: "count" },
  },
  { key: "attachments", label: "Files", type: "files" },
  { key: "link", label: "Link", type: "text", textRenderMode: "link" },
  { key: "notes", label: "Notes", type: "text", wrap: true },
  { key: "year", label: "Year", type: "text" },
];

/** `database.computedFields`, transcribed from Testbed.md:119-127. */
const TESTBED_COMPUTED_FIELDS = [
  {
    key: "net", label: "Net", type: "number",
    expression: "IF(OR([budget] == null, [amount] == null), null, [budget] - [amount])",
  },
  {
    key: "margin", label: "Margin %", type: "number",
    expression: "IF(OR([budget] == null, [amount] == null, [budget] == 0), null, ([budget] - [amount]) / [budget] * 100)",
  },
];

/** The real column order the "Punch List" view carries — same 18 keys, same order, as `TESTBED_COLUMNS`. */
const PUNCH_LIST_COLUMN_ORDER = [
  "file.name", "summary", "status", "priority", "labels", "amount", "budget",
  "net", "margin", "due", "reviewed_at", "pinned", "related", "related_count",
  "attachments", "link", "notes", "year",
];

/** `database.views[]`'s "Punch List" entry (id `tb-list`), transcribed from Testbed.md:443-587. */
const PUNCH_LIST_VIEW_FRONTMATTER = {
  id: "tb-list",
  name: "Punch List",
  viewType: "list",
  sourceFolder: "",
  sourceRules: [],
  sourceLogic: "and",
  displayWidth: "wide",
  sortColumn: "priority",
  sortDirection: "asc",
  sortRules: [],
  columnOrder: PUNCH_LIST_COLUMN_ORDER,
  columnWidths: {},
  hiddenColumns: [],
  groupByField: "",
  groupOrders: {},
  filterLogic: "and",
  filters: [{ field: "pinned", op: "eq", value: "true" }],
};

const TESTBED_FRONTMATTER = {
  database: {
    id: "testbed-db",
    name: "Testbed",
    sourceFolder: "Database Testbed/Records",
    columns: TESTBED_COLUMNS,
    computedFields: TESTBED_COMPUTED_FIELDS,
    views: [PUNCH_LIST_VIEW_FRONTMATTER],
  },
};

/** Casts around the private serializer, the same way `data-source.test.ts` already does. */
const toViewPayload = (dataSource: DataSource, view: ViewConfig): Record<string, unknown> =>
  (dataSource as unknown as { toViewPayload(view: ViewConfig): Record<string, unknown> }).toViewPayload(view);

// ───────────────────────────────────────────────────────────────────
// 2. THE PARSE
// ───────────────────────────────────────────────────────────────────

describe("the operator's real Punch List view", () => {
  it("parses as a list, carrying its real columns, filter and sort", () => {
    const parsed = source().parseDatabaseConfig(TESTBED_FRONTMATTER);
    const view = parsed!.views.find((v) => v.name === "Punch List")!;

    expect(view.viewType).toBe("list");
    expect(view.columnOrder).toEqual(PUNCH_LIST_COLUMN_ORDER);
    expect(view.filters).toEqual([{ field: "pinned", op: "eq", value: "true" }]);
    expect(view.filterLogic).toBe("and");
    expect(view.sortColumn).toBe("priority");
    expect(view.sortDirection).toBe("asc");
    expect(view.groupByField).toBeUndefined();
    expect(parsed!.schema.columns).toHaveLength(18);
  });

  // ───────────────────────────────────────────────────────────────────
  // 3. THE MIGRATION
  // ───────────────────────────────────────────────────────────────────

  it("migrates to a table with the same columns, filter, sort and (absent) group", () => {
    const parsed = source().parseDatabaseConfig(TESTBED_FRONTMATTER);
    const view = parsed!.views.find((v) => v.name === "Punch List")!;
    type BeforeSnapshot = Pick<
      ViewConfig,
      "columnOrder" | "columnWidths" | "hiddenColumns" | "filters" | "filterLogic" | "sortColumn" | "sortDirection" | "sortRules" | "groupByField"
    >;
    const before = JSON.parse(JSON.stringify({
      columnOrder: view.columnOrder,
      columnWidths: view.columnWidths,
      hiddenColumns: view.hiddenColumns,
      filters: view.filters,
      filterLogic: view.filterLogic,
      sortColumn: view.sortColumn,
      sortDirection: view.sortDirection,
      sortRules: view.sortRules,
      groupByField: view.groupByField,
    })) as BeforeSnapshot;

    const plan = planListMigration(view)!;
    expect(applyListMigration(view, plan)).toBe(true);

    expect(view.viewType).toBe("table");
    expect(view.columnOrder).toEqual(before.columnOrder);
    expect(view.columnWidths).toEqual(before.columnWidths);
    expect(view.hiddenColumns).toEqual(before.hiddenColumns);
    expect(view.filters).toEqual(before.filters);
    expect(view.filterLogic).toBe(before.filterLogic);
    expect(view.sortColumn).toBe(before.sortColumn);
    expect(view.sortDirection).toBe(before.sortDirection);
    expect(view.sortRules).toEqual(before.sortRules);
    expect(view.groupByField).toBe(before.groupByField);
  });

  // ───────────────────────────────────────────────────────────────────
  // 4. THE ROUND TRIP
  // ───────────────────────────────────────────────────────────────────

  it("round-trips the migrated view through toViewPayload and back into parseDatabaseConfig", () => {
    const dataSource = source();
    const parsed = dataSource.parseDatabaseConfig(TESTBED_FRONTMATTER);
    const view = parsed!.views.find((v) => v.name === "Punch List")!;
    applyListMigration(view, planListMigration(view)!);

    const payload = toViewPayload(dataSource, view);
    const reparsed = dataSource.parseDatabaseConfig({
      database: { id: "testbed-db", columns: TESTBED_COLUMNS, computedFields: TESTBED_COMPUTED_FIELDS, views: [payload] },
    });
    const reparsedView = reparsed!.views[0];

    expect(reparsedView.viewType).toBe("table");
    expect(reparsedView.columnOrder).toEqual(view.columnOrder);
    expect(reparsedView.filters).toEqual(view.filters);
    expect(reparsedView.filterLogic).toBe(view.filterLogic);
    expect(reparsedView.sortColumn).toBe(view.sortColumn);
    expect(reparsedView.sortDirection).toBe(view.sortDirection);
    expect(reparsedView.groupByField).toBe(view.groupByField);
  });

  // ───────────────────────────────────────────────────────────────────
  // 5. THE SECOND LOAD
  // ───────────────────────────────────────────────────────────────────

  it("does not plan a second migration once the reparsed view already reads as a table", () => {
    // `migrateListViewOnOpen` (database-view.ts / embedded-database-renderer.ts) only writes and
    // only notifies when `planListMigration` returns a plan; a `null` here is what keeps a second
    // open of the same database from rewriting the view again or firing the notice again.
    const dataSource = source();
    const parsed = dataSource.parseDatabaseConfig(TESTBED_FRONTMATTER);
    const view = parsed!.views.find((v) => v.name === "Punch List")!;
    applyListMigration(view, planListMigration(view)!);
    const payload = toViewPayload(dataSource, view);
    const reparsed = dataSource.parseDatabaseConfig({
      database: { id: "testbed-db", columns: TESTBED_COLUMNS, computedFields: TESTBED_COMPUTED_FIELDS, views: [payload] },
    });

    expect(planListMigration(reparsed!.views[0])).toBeNull();
  });
});
