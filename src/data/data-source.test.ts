// ───────────────────────────────────────────────────────────────────
// MODULE:    data-source.test
// COMPONENT: Coverage for view filter tree round-tripping through parseDatabaseConfig/toViewPayload
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & FIXTURES
// ───────────────────────────────────────────────────────────────────
import { describe, expect, it, vi } from "vitest";
import type { App } from "obsidian";
import { DataSource } from "./data-source";
import type { SourceRuleNode } from "./types";

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

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { activeDocument: { documentElement: { lang: "en" } } },
});

const tree: SourceRuleNode = {
  type: "group",
  logic: "or",
  rules: [
    { type: "group", logic: "and", rules: [{ field: "first", op: "eq", value: "one" }] },
    { type: "not", rule: { field: "second", op: "empty" } },
  ],
};

function source(): DataSource {
  return new DataSource({ vault: {}, metadataCache: {} } as App);
}

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────
describe("DataSource view filter tree persistence", () => {
  it("normalizes filter trees in both view formats and serializes them", () => {
    const dataSource = source();
    const parsed = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "table",
          sourceFolder: "",
          filterTree: tree,
        }],
      },
    });

    expect(parsed?.views[0].filterTree).toEqual(tree);
    const payload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload(parsed!.views[0]);
    expect(payload.filterTree).toEqual(tree);
    expect((dataSource as unknown as { legacyViewKeys(): string[] }).legacyViewKeys()).toContain("filterTree");

    const legacy = dataSource.parseDatabaseConfig({ database: { filterTree: tree, views: undefined } });
    expect(legacy?.views[0].filterTree).toEqual(tree);
  });

  it("rejects truncated filter tree roots", () => {
    const parsed = source().parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "table",
          sourceFolder: "",
          filterTree: { type: "group", logic: "or" },
        }],
      },
    });

    expect(parsed?.views[0].filterTree).toBeUndefined();
  });

  it("round-trips non-empty multi-field grouping and omits an empty array", () => {
    const dataSource = source();
    const parsed = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "table",
          sourceFolder: "",
          groupByFields: ["Category", 42, "Type"],
        }],
      },
    });
    const view = parsed!.views[0];
    const payload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload(view);

    expect(view.groupByFields).toEqual(["Category", "Type"]);
    expect(payload.groupByFields).toEqual(["Category", "Type"]);

    const emptyPayload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload({ ...view, groupByFields: [] });
    expect(emptyPayload.groupByFields).toBeUndefined();
  });

  it("round-trips timelineLocalExtensions and timelineWeekLabel through toViewPayload/parseViewConfig", () => {
    const dataSource = source();
    const parsed = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "timeline",
          sourceFolder: "",
          timelineLocalExtensions: true,
          timelineWeekLabel: "dateRange",
        }],
      },
    });
    const view = parsed!.views[0];
    expect(view.timelineLocalExtensions).toBe(true);
    expect(view.timelineWeekLabel).toBe("dateRange");

    const payload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload(view);
    expect(payload.timelineLocalExtensions).toBe(true);
    expect(payload.timelineWeekLabel).toBe("dateRange");

    const reparsed = dataSource.parseDatabaseConfig({
      database: { id: "database", views: [payload] },
    });
    expect(reparsed!.views[0].timelineLocalExtensions).toBe(true);
    expect(reparsed!.views[0].timelineWeekLabel).toBe("dateRange");
  });

  it("round-trips the per-view subtask collapse override and omits an empty map", () => {
    const dataSource = source();
    const parsed = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "board",
          sourceFolder: "",
          subtaskCollapsed: { "Tasks/Parent.md": true },
        }],
      },
    });
    const view = parsed!.views[0];
    expect(view.subtaskCollapsed).toEqual({ "Tasks/Parent.md": true });

    const payload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload(view);
    expect(payload.subtaskCollapsed).toEqual({ "Tasks/Parent.md": true });

    const emptyPayload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload({ ...view, subtaskCollapsed: {} });
    expect(emptyPayload.subtaskCollapsed).toBeUndefined();
  });
});
