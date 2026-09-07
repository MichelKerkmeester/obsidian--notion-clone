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

  it("round-trips newRowPresets through parseViewConfig and toViewPayload", () => {
    const dataSource = source();
    const presets = { status: "Open", cost: "12" };
    const parsed = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "table",
          sourceFolder: "",
          newRowPresets: presets,
        }],
      },
    });
    expect(parsed!.views[0].newRowPresets).toEqual(presets);
    const payload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload(parsed!.views[0]);
    expect(payload.newRowPresets).toEqual(presets);
    const reparsed = dataSource.parseDatabaseConfig({
      database: { id: "database", views: [payload] },
    });
    expect(reparsed!.views[0].newRowPresets).toEqual(presets);
  });

  it("round-trips boardCardFields through parseViewConfig, toViewPayload, and the legacy flat path", () => {
    const dataSource = source();
    const fields = [
      { key: "hours", visible: true },
      { key: "tags", visible: false },
    ];
    const parsed = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "board",
          sourceFolder: "",
          boardCardFields: fields,
        }],
      },
    });
    const view = parsed!.views[0];
    expect(view.boardCardFields).toEqual(fields);

    const payload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload(view);
    expect(payload.boardCardFields).toEqual(fields);
    expect((dataSource as unknown as { legacyViewKeys(): string[] }).legacyViewKeys()).toContain("boardCardFields");

    const reparsed = dataSource.parseDatabaseConfig({
      database: { id: "database", views: [payload] },
    });
    expect(reparsed!.views[0].boardCardFields).toEqual(fields);

    const legacy = dataSource.parseDatabaseConfig({
      database: { viewType: "board", boardCardFields: fields, views: undefined },
    });
    expect(legacy?.views[0].boardCardFields).toEqual(fields);
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

  // A vault written by an older release can still carry the board-extension keys. The reader is
  // an explicit per-key allowlist, so a key it does not name is dropped rather than surfaced —
  // which is what keeps the retired extensions layout unreachable from stored config, not just
  // from the settings UI. A reader that started passing unknown keys through would hand the
  // board renderer back its retired branch with no other symptom.
  it("drops the retired board-extension flag from a stored view and parses the rest without error", () => {
    const dataSource = source();
    const parsed = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "board",
          sourceFolder: "",
          boardExtensionsEnabled: true,
          boardSubgroupEnabled: true,
          boardSubgroupField: "Owner",
          summaryRules: [],
        }],
      },
    });
    const view = parsed!.views[0];

    // The sibling keys prove the drop is selective rather than a parse that returned nothing.
    expect(view.boardSubgroupField).toBe("Owner");
    expect(view.boardSubgroupEnabled).toBe(true);
    expect((view as unknown as Record<string, unknown>).boardExtensionsEnabled).toBeUndefined();

    const payload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload(view);
    expect(payload.boardExtensionsEnabled).toBeUndefined();
  });
  // The view's wrap default has to survive a reload, and both halves of that are easy to get
  // wrong in opposite directions: the reader is a per-key allowlist, so an unnamed key is dropped
  // on load, and the writer is a per-key literal, so an unnamed key never reaches disk at all.
  // The unknown sibling is the negative control — without it a green assertion would only prove
  // that some key survived, not that the allowlist is what let this one through.
  it("round-trips the view wrap default and drops a key the allowlist does not name", () => {
    const dataSource = source();
    const parsed = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "table",
          sourceFolder: "",
          wrapText: true,
          wrapTextDefault: true,
        }],
      },
    });
    const view = parsed!.views[0];

    expect(view.wrapText).toBe(true);
    expect((view as unknown as Record<string, unknown>).wrapTextDefault).toBeUndefined();

    const payload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload(view);
    expect(payload.wrapText).toBe(true);
    expect(payload.wrapTextDefault).toBeUndefined();

    // Second pass: a view written by this release reads back the same way, which is the reload
    // the operator actually performs.
    const reparsed = dataSource.parseDatabaseConfig({ database: { id: "database", views: [payload] } });
    expect(reparsed!.views[0].wrapText).toBe(true);

    // A vault written before this release carries no key at all, and must come back clipped —
    // the whole point of defaulting off is that no existing table changes on upgrade.
    const legacy = dataSource.parseDatabaseConfig({
      database: { id: "database", views: [{ id: "view", name: "View", viewType: "table", sourceFolder: "" }] },
    });
    expect(legacy!.views[0].wrapText).toBe(false);
  });

  // The board's "hide empty groups" flag is tri-state rather than cast to a boolean at this
  // layer: a vault with no key at all must come back `undefined` so the board can tell "never
  // configured" from "explicitly shown", the distinction the empty-column capture fixtures pin.
  it("round-trips boardHideEmptyGroups explicitly and leaves an unconfigured vault undefined", () => {
    const dataSource = source();
    const parsed = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "board",
          sourceFolder: "",
          boardHideEmptyGroups: false,
        }],
      },
    });
    const view = parsed!.views[0];
    expect(view.boardHideEmptyGroups).toBe(false);

    const payload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload(view);
    expect(payload.boardHideEmptyGroups).toBe(false);

    const reparsed = dataSource.parseDatabaseConfig({ database: { id: "database", views: [payload] } });
    expect(reparsed!.views[0].boardHideEmptyGroups).toBe(false);

    const legacy = dataSource.parseDatabaseConfig({
      database: { id: "database", views: [{ id: "view", name: "View", viewType: "board", sourceFolder: "" }] },
    });
    expect(legacy!.views[0].boardHideEmptyGroups).toBeUndefined();

    // The round-trip above reads and writes inside the `database` object; the legacy strip is a
    // separate list, and a key missing from it survives at the frontmatter top level as a stale
    // duplicate of the one the view now owns. Locked the same way `filterTree` and
    // `boardCardFields` already are.
    expect((dataSource as unknown as { legacyViewKeys(): string[] }).legacyViewKeys())
      .toContain("boardHideEmptyGroups");
  });

  // A column's wrap is tri-state now, and `false` is a real state rather than a synonym for
  // absent. Columns pass through the schema uncast, so the risk is not a per-key allowlist but a
  // normalizer that folds falsy to undefined somewhere on the way back out.
  it("keeps an explicit per-column clip through a config round-trip", () => {
    const dataSource = source();
    const columns = [
      { key: "Clipped", label: "Clipped", type: "text", wrap: false },
      { key: "Wrapped", label: "Wrapped", type: "text", wrap: true },
      { key: "Follows", label: "Follows", type: "text" },
    ];
    const parsed = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        columns,
        views: [{ id: "view", name: "View", viewType: "table", sourceFolder: "" }],
      },
    });
    const schemaColumns = parsed!.views[0].schema.columns;

    expect(schemaColumns.map((col) => col.wrap)).toEqual([false, true, undefined]);
  });
});
