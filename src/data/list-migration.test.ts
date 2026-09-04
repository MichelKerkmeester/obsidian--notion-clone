// ───────────────────────────────────────────────────────────────────
// MODULE:    list-migration.test
// COMPONENT: what opening an existing list view does to it, and what it must not do
// ───────────────────────────────────────────────────────────────────
//
// The list is withdrawn from every picker, which does nothing for the views already written into
// vault files. Migrating on open rewrites only the type string: the list derives its tracks from
// the table's column widths, so every field the view carries is already a table's field and the
// plan has nothing to map. What it must NOT do is the load-bearing half — the column set, the
// filters, the sorts and the grouping all survive untouched, and the list's own fields stay on the
// view, inert, rather than being stripped on the way past.

// ───────────────────────────────────────────────────────────────────
// 1. THE FIXTURE
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { applyListMigration, planListMigration } from "./list-migration";
import type { ViewConfig } from "./types";

const list = (extra: Partial<ViewConfig> = {}): ViewConfig => ({
  id: "v1",
  name: "Punch List",
  viewType: "list",
  ...extra,
} as ViewConfig);

// ───────────────────────────────────────────────────────────────────
// 2. WHAT MIGRATES
// ───────────────────────────────────────────────────────────────────

describe("an existing list becomes a table", () => {
  it("plans the move", () => {
    const plan = planListMigration(list());
    expect(plan).toEqual({ from: "list", to: "table" });
  });

  it("applies once and reports that it did", () => {
    const view = list();
    const plan = planListMigration(view)!;
    expect(applyListMigration(view, plan)).toBe(true);
    expect(view.viewType).toBe("table");
  });

  it("refuses to apply a second time, so a re-render cannot re-migrate", () => {
    const view = list();
    const plan = planListMigration(view)!;
    applyListMigration(view, plan);
    expect(applyListMigration(view, plan)).toBe(false);
    expect(view.viewType).toBe("table");
  });

  it("plans nothing for every view that is not a list", () => {
    for (const viewType of ["table", "board", "gallery", "chart", "calendar", "timeline"] as const) {
      expect(planListMigration({ ...list(), viewType })).toBeNull();
    }
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. WHAT IS CARRIED ACROSS, WHICH IS THE WHOLE MIGRATION
// ───────────────────────────────────────────────────────────────────

describe("the migration preserves the view, not just the type", () => {
  const carried: Partial<ViewConfig> = {
    columnOrder: ["file.name", "cost", "status"],
    columnWidths: { "file.name": 220, cost: 120 },
    hiddenColumns: ["notes"],
    filters: [{ field: "status", op: "eq", value: "open" }],
    filterLogic: "and",
    sortRules: [{ field: "cost", direction: "desc" }],
    sortColumn: "cost",
    sortDirection: "desc",
    groupByField: "status",
    groupOrders: { open: ["a", "b"] },
  };

  it("carries the column set, filters, sorts and grouping unchanged", () => {
    const view = list(carried);
    applyListMigration(view, planListMigration(view)!);
    for (const [key, value] of Object.entries(carried)) {
      expect((view as unknown as Record<string, unknown>)[key]).toEqual(value);
    }
  });

  it("leaves listCompactFields on the view, inert, rather than stripping it", () => {
    const view = list({ listCompactFields: true });
    applyListMigration(view, planListMigration(view)!);
    expect(view.listCompactFields).toBe(true);
    expect(view.viewType).toBe("table");
  });

  it("does not repair a corrupt column set, so the table's schema-order fallback still applies", () => {
    const view = list({ columnOrder: ["ghost-column", "cost"], columnWidths: { ghost: 99 } });
    applyListMigration(view, planListMigration(view)!);
    expect(view.columnOrder).toEqual(["ghost-column", "cost"]);
    expect(view.columnWidths).toEqual({ ghost: 99 });
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. FAILURE LEAVES THE VIEW AS IT WAS
// ───────────────────────────────────────────────────────────────────

describe("a migration that cannot apply does not force the view", () => {
  it("refuses when the view is no longer a list, leaving it exactly as it is", () => {
    const view = list();
    const plan = planListMigration(view)!;
    applyListMigration(view, plan);
    const after = JSON.stringify(view);
    // A stale plan — one planned against the view's earlier state — must not re-fire on a view
    // that has already moved on, and must not move a view that was never a list in the first place.
    expect(applyListMigration(view, plan)).toBe(false);
    expect(applyListMigration({ ...list(), viewType: "table" }, plan)).toBe(false);
    expect(JSON.stringify(view)).toBe(after);
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. A CONFIG THE PLUGIN DID NOT WRITE
// ───────────────────────────────────────────────────────────────────

describe("a list this plugin did not author", () => {
  it("migrates a hand-written view that carries none of the fields the plugin emits", () => {
    const foreign = {
      viewType: "list",
      sortBy: "created",
      "x-made-by": "some other tool",
    } as unknown as ViewConfig;

    const plan = planListMigration(foreign);
    expect(plan).toEqual({ from: "list", to: "table" });
    expect(applyListMigration(foreign, plan!)).toBe(true);
    expect(foreign.viewType).toBe("table");
    // The unknown key survives: a migration that dropped what it did not recognise would quietly
    // discard another tool's data on the way past.
    expect((foreign as unknown as Record<string, unknown>)["x-made-by"]).toBe("some other tool");
  });

  it("leaves a hand-written view of another type completely alone", () => {
    const foreign = { viewType: "kanban-from-another-plugin" } as unknown as ViewConfig;
    const before = JSON.stringify(foreign);
    expect(planListMigration(foreign)).toBeNull();
    expect(JSON.stringify(foreign)).toBe(before);
  });
});
