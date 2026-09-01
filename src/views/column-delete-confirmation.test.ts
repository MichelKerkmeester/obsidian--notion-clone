// ───────────────────────────────────────────────────────────────────
// MODULE:    column-delete-confirmation.test
// COMPONENT: what a single click on the properties row's trash actually costs
// ───────────────────────────────────────────────────────────────────
//
// The packet recorded this as failing — "`db-column-delete-btn` deletes on one click from the row
// itself" — and that assessment came from reading the button, which is wired
// `deleteBtn.onclick = () => actions.deleteColumn(col)`. One click, straight to a delete. Reading
// stops there; the criterion is about what the click COSTS, and that is decided one call deeper.
//
// So this drives it. Every branch of `deleteColumn` is entered and the model is read at three
// moments: while the answer is still pending, after a refusal, and after consent. The claim being
// tested is an ORDERING — that nothing is mutated before the operator has answered — and an
// ordering cannot be established by reading a call site.
//
// THE CONSENT CASE IS NOT DECORATION. Without it, a `deleteColumn` that had been broken into doing
// nothing at all would pass both of the other two: the model is unchanged after a refusal, and
// unchanged while pending, because it is unchanged always. It is the third case that makes the
// first two mean something.

import { beforeEach, describe, expect, it, vi } from "vitest";

// `Notice` is the vault-facing surface the catalogue stub refuses to build, and `deleteColumn`
// raises one on its way out — after the schema is already changed. Left unstubbed it throws inside
// the operation's own catch, which then raises a second one; the delete has happened either way, so
// what the throw removes is the assertion, not the mutation. Only this one export is replaced.
vi.mock("obsidian", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  Notice: class { constructor(readonly message: string) {} },
}));

// The confirmation is the thing under test, so it is the one thing replaced: this controls the
// ANSWER and nothing else. The mutation, its ordering and the branch that reached it all stay the
// shipped code's. A stub that also skipped the await would be testing itself.
let answer: (value: boolean | string) => void = () => undefined;
let pending: Promise<boolean | string>;
let asked: Array<{ title: string; message: string }> = [];

vi.mock("./modals/confirm-modal", () => ({
  confirmWithModal: vi.fn((_app: unknown, options: { title: string; message: string }) => {
    asked.push({ title: options.title, message: options.message });
    pending = new Promise<boolean | string>((resolve) => { answer = resolve; });
    return pending;
  }),
}));

import { ColumnOperations } from "./column-operations";
import type { ColumnDef, DatabaseConfig, ViewConfig } from "../data/types";

// ───────────────────────────────────────────────────────────────────
// 1. A DATABASE THE OPERATION CAN ACTUALLY WALK
// ───────────────────────────────────────────────────────────────────

const columnFor = (type: string): ColumnDef => {
  if (type === "computed") return { key: "total", label: "Total", type: "computed" } as ColumnDef;
  if (type === "rollup") return { key: "sum", label: "Sum", type: "rollup" } as ColumnDef;
  if (type === "virtual") return { key: "aliases", label: "Aliases", type: "text" } as ColumnDef;
  return { key: "status", label: "Status", type: "text" } as ColumnDef;
};

function build(type: string) {
  const target = columnFor(type);
  const keep: ColumnDef = { key: "file.name", label: "Name", type: "text" } as ColumnDef;
  const schema = { columns: [keep, target], computedFields: [] };
  const config = { schema, viewType: "table", columnOrder: ["file.name", target.key] } as unknown as ViewConfig;
  const db = { id: "db", schema, views: [config], sourceRules: [] } as unknown as DatabaseConfig;
  const state = {
    hiddenColumns: new Set<string>(), filters: [], sortRules: [],
    filterTree: undefined, sortColumn: undefined, sortDirection: "asc",
  };

  const saves: string[] = [];
  const ops = new ColumnOperations({
    app: {} as never,
    dataSource: { getRecordsForConfig: () => [] } as never,
    propertyService: { deleteKey: async () => ({ changed: 0, skipped: 0 }) } as never,
    viewStateStore: { persist: () => undefined, clear: () => undefined } as never,
    getConfig: () => config,
    getMutableConfig: () => config,
    getActiveDb: () => db,
    getState: () => state as never,
    getFilesForConfig: () => [],
    saveConfigImmediately: async () => { saves.push("config"); },
    saveCurrentViewConfig: async () => undefined,
    scheduleConfigSave: () => saves.push("scheduled"),
    refresh: () => undefined,
    refreshSchemaChanged: () => undefined,
    refreshAfterSave: async () => undefined,
    markPendingColumn: () => undefined,
    refreshColumnManager: () => undefined,
    setPendingUndoLabel: () => undefined,
    setPendingConfigCellChanges: () => undefined,
    getDefaultStatusOptions: () => [],
    getDefaultStatusPresetId: () => undefined,
  });

  const keys = () => schema.columns.map((column) => column.key);
  return { ops, target, keys, saves };
}

const settle = async () => { await Promise.resolve(); await Promise.resolve(); };

beforeEach(() => {
  asked = [];
  answer = () => undefined;
});

// ───────────────────────────────────────────────────────────────────
// 2. NOTHING MOVES BEFORE THE OPERATOR ANSWERS
// ───────────────────────────────────────────────────────────────────

describe("a single click on the row's trash does not delete a property", () => {
  for (const type of ["text", "computed", "rollup", "virtual"]) {
    it(`interposes a confirmation on a ${type} column and leaves the schema untouched while it is open`, async () => {
      const { ops, target, keys } = build(type);
      const before = keys();

      const run = ops.deleteColumn(target);
      await settle();

      // The click has happened. The property is still there, and something is on screen asking.
      expect(asked.length).toBeGreaterThan(0);
      expect(keys()).toEqual(before);
      expect(keys()).toContain(target.key);

      answer(false);
      await run;

      // And a refusal is a zero delta, not a delayed delete.
      expect(keys()).toEqual(before);
    });
  }
});

// ───────────────────────────────────────────────────────────────────
// 3. THE CONSENT CASE — what makes the two above mean anything
// ───────────────────────────────────────────────────────────────────

describe("consenting to the confirmation does delete the property", () => {
  for (const [type, reply] of [["text", "column-only"], ["computed", true], ["rollup", true], ["virtual", true]] as const) {
    it(`removes a ${type} column from the schema once the operator agrees`, async () => {
      const { ops, target, keys } = build(type);
      expect(keys()).toContain(target.key);

      const run = ops.deleteColumn(target);
      await settle();
      answer(reply);
      await run;

      expect(keys()).not.toContain(target.key);
    });
  }
});

// ───────────────────────────────────────────────────────────────────
// 4. THE ONE ROW THAT CANNOT BE DELETED AT ALL
// ───────────────────────────────────────────────────────────────────

describe("the title column has no delete path", () => {
  it("returns without asking, rather than asking and then refusing", async () => {
    const { ops, keys } = build("text");
    const before = keys();

    await ops.deleteColumn({ key: "file.name", label: "Name", type: "text" } as ColumnDef);

    // Asking about something that cannot be deleted is its own defect: the operator answers a
    // question whose answer is ignored either way.
    expect(asked).toEqual([]);
    expect(keys()).toEqual(before);
  });
});
