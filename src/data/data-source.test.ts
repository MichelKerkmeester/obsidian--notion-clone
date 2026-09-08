// ───────────────────────────────────────────────────────────────────
// MODULE:    data-source.test
// COMPONENT: Coverage for view filter tree round-tripping through parseDatabaseConfig/toViewPayload
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & FIXTURES
// ───────────────────────────────────────────────────────────────────
import { describe, expect, it, vi } from "vitest";
import type { App } from "obsidian";
import { TFile } from "obsidian";
import { DataSource } from "./data-source";
import type { SourceRuleNode } from "./types";

vi.mock("obsidian", () => ({
  App: class {},
  EventRef: class {},
  MetadataCache: class {},
  // Real enough for `instanceof TFile` and the path-derived fields DataSource itself reads
  // (extension, basename) — no other test in this file constructs one, so this is safe to widen.
  TFile: class {
    path: string;
    name: string;
    basename: string;
    extension: string;
    constructor(path: string) {
      this.path = path;
      const slash = path.lastIndexOf("/");
      this.name = slash >= 0 ? path.slice(slash + 1) : path;
      const dot = this.name.lastIndexOf(".");
      this.basename = dot > 0 ? this.name.slice(0, dot) : this.name;
      this.extension = dot > 0 ? this.name.slice(dot + 1) : "";
    }
  },
  Vault: class {},
  getAllTags: vi.fn(),
  normalizePath: (path: string) => path,
  parseYaml: vi.fn(),
  stringifyYaml: vi.fn(),
}));

/** A minimal, controllable event bus matching the `.on()`/`.trigger()` shape DataSource expects
 *  off both `app.vault` and `app.metadataCache`. */
class FakeEventBus {
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  on(name: string, cb: (...args: unknown[]) => void) {
    const set = this.listeners.get(name) ?? new Set();
    set.add(cb);
    this.listeners.set(name, set);
    return { offref: () => set.delete(cb) };
  }
  trigger(name: string, ...args: unknown[]) {
    for (const cb of this.listeners.get(name) ?? []) cb(...args);
  }
}

Object.defineProperty(globalThis, "window", {
  configurable: true,
  // setTimeout/clearTimeout are real (delegated to the global ones) because scheduleNotify's
  // debounce and the cold-cache recovery test below both need a timer that actually fires.
  value: {
    activeDocument: { documentElement: { lang: "en" } },
    setTimeout: (...args: Parameters<typeof setTimeout>) => setTimeout(...args),
    clearTimeout: (...args: Parameters<typeof clearTimeout>) => clearTimeout(...args),
  },
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

  it("round-trips titleFormat through toViewPayload/parseViewConfig, both the new and the legacy flat format", () => {
    const dataSource = source();
    const parsed = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "board",
          sourceFolder: "",
          titleFormat: "currency-eur",
        }],
      },
    });
    const view = parsed!.views[0];
    expect(view.titleFormat).toBe("currency-eur");

    const payload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload(view);
    expect(payload.titleFormat).toBe("currency-eur");

    const reparsed = dataSource.parseDatabaseConfig({
      database: { id: "database", views: [payload] },
    });
    expect(reparsed!.views[0].titleFormat).toBe("currency-eur");

    // The legacy flat-format path (old vaults with no database.views array) goes through a
    // different parse function than the one above and needed the identical fix.
    const legacyParsed = dataSource.parseDatabaseConfig({
      viewType: "board",
      sourceFolder: "",
      titleFormat: "date",
    });
    expect(legacyParsed!.views[0].titleFormat).toBe("date");

    // An unrecognized value must not survive the round trip as a stray string.
    const invalid = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        views: [{ id: "view", name: "View", viewType: "board", sourceFolder: "", titleFormat: "not-a-real-format" }],
      },
    });
    expect(invalid!.views[0].titleFormat).toBeUndefined();
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

  it("round-trips frozenColumnKeys, showVerticalLines and addRowNoun through parseViewConfig and toViewPayload", () => {
    const dataSource = source();
    const parsed = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "table",
          sourceFolder: "",
          frozenColumnKeys: ["title", "status"],
          showVerticalLines: false,
          addRowNoun: "task",
        }],
      },
    });
    expect(parsed!.views[0].frozenColumnKeys).toEqual(["title", "status"]);
    expect(parsed!.views[0].showVerticalLines).toBe(false);
    expect(parsed!.views[0].addRowNoun).toBe("task");
    const payload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload(parsed!.views[0]);
    expect(payload.frozenColumnKeys).toEqual(["title", "status"]);
    expect(payload.showVerticalLines).toBe(false);
    expect(payload.addRowNoun).toBe("task");
    const reparsed = dataSource.parseDatabaseConfig({
      database: { id: "database", views: [payload] },
    });
    expect(reparsed!.views[0].frozenColumnKeys).toEqual(["title", "status"]);
    expect(reparsed!.views[0].showVerticalLines).toBe(false);
    expect(reparsed!.views[0].addRowNoun).toBe("task");
  });

  it("preserves an unknown frozenColumnKeys entry rather than dropping it, and treats unset as vertical lines on", () => {
    const dataSource = source();
    const parsed = dataSource.parseDatabaseConfig({
      database: {
        id: "database",
        views: [{
          id: "view",
          name: "View",
          viewType: "table",
          sourceFolder: "",
          frozenColumnKeys: ["a-column-from-a-newer-version"],
        }],
      },
    });
    // A downgrade must not destroy the setting: the key survives even though nothing in this
    // parse knows what column it names. Whether it does anything is a render-time question
    // (table-renderer.ts only sums a frozen key that also names a visible column), not a
    // parse-time one.
    expect(parsed!.views[0].frozenColumnKeys).toEqual(["a-column-from-a-newer-version"]);
    expect(parsed!.views[0].showVerticalLines).toBeUndefined();
    const payload = (dataSource as unknown as {
      toViewPayload(view: NonNullable<typeof parsed>["views"][number]): Record<string, unknown>;
    }).toViewPayload(parsed!.views[0]);
    // Undefined round-trips to "true" on the wire (vertical lines on is today's unchanged
    // behavior) rather than an absent field a future parse would have to special-case.
    expect(payload.showVerticalLines).toBe(true);
    expect(payload.frozenColumnKeys).toEqual(["a-column-from-a-newer-version"]);
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

// ───────────────────────────────────────────────────────────────────
// 3. COLD-CACHE RECORD RECOVERY
// ───────────────────────────────────────────────────────────────────
//
// getViewDefFiles() seeds the whole-vault record cache the first time it runs (to know every
// file's frontmatter while scanning for db_view notes), using whatever the metadata cache reports
// AT THAT MOMENT. If that first scan runs before the vault finishes resolving — the exact shape of
// a view opened at first load — every record's frontmatter is cached as {} and getCachedRecords'
// own "only build once" guard never rebuilds it. Reverting the "resolved" listener in
// startListening() (data-source.ts) reproduces the reported defect: this test goes red without it.

class FakeVault extends FakeEventBus {
  constructor(private readonly fileList: InstanceType<typeof TFile>[]) {
    super();
  }
  getMarkdownFiles() {
    return this.fileList;
  }
  getAbstractFileByPath(path: string) {
    return this.fileList.find((f) => f.path === path) ?? null;
  }
}

class FakeMetadataCache extends FakeEventBus {
  private frontmatterByPath = new Map<string, Record<string, unknown>>();
  private resolvedPaths = new Set<string>();
  seed(path: string, frontmatter: Record<string, unknown>) {
    this.frontmatterByPath.set(path, frontmatter);
  }
  resolveAll(paths: Iterable<string>) {
    for (const path of paths) this.resolvedPaths.add(path);
  }
  getFileCache(file: { path: string }) {
    if (!this.resolvedPaths.has(file.path)) return undefined;
    return { frontmatter: this.frontmatterByPath.get(file.path) ?? {} };
  }
}

/** The real TFile's ambient type has no public constructor; the mocked one above takes a path. */
function fakeFile(path: string): TFile {
  return new (TFile as unknown as new (path: string) => TFile)(path);
}

describe("DataSource cold-cache record recovery", () => {
  it("recovers a record cache poisoned by a view-def scan that ran before the vault resolved", () => {
    const dbFile = fakeFile("Finance/Finance Reports.md");
    const recordFile = fakeFile("Finance/Reports/01 - Jan.md");
    const vault = new FakeVault([dbFile, recordFile]);
    const metadataCache = new FakeMetadataCache();
    metadataCache.seed(dbFile.path, {
      db_view: true,
      database: {
        id: "fixture",
        sourceFolder: "Finance/Reports",
        columns: [
          { key: "file.name", label: "Month", type: "text" },
          { key: "income", label: "Income", type: "currency" },
        ],
        views: [{ id: "view-all", name: "All", viewType: "table", sourceFolder: "" }],
      },
    });
    metadataCache.seed(recordFile.path, { income: 1000 });

    const dataSource = new DataSource({ vault, metadataCache } as unknown as App);
    dataSource.startListening();

    // Early, cold scan: no file has resolved yet, so no db_view note is recognized — but every
    // vault file's frontmatter is still seeded into the record cache at this moment ({} for both).
    expect(dataSource.getViewDefFiles()).toEqual([]);

    // The vault finishes resolving moments later, the way it does in the real app.
    metadataCache.resolveAll([dbFile.path, recordFile.path]);

    const defFiles = dataSource.getViewDefFiles();
    expect(defFiles).toHaveLength(1);
    const config = defFiles[0].config;

    const beforeRecovery = dataSource.getRecordsForDatabase(config)
      .find((record) => record.file.path === recordFile.path);
    expect(beforeRecovery?.frontmatter).toEqual({});

    // Obsidian's own guarantee that every file's cache is now current.
    metadataCache.trigger("resolved");

    const afterRecovery = dataSource.getRecordsForDatabase(config)
      .find((record) => record.file.path === recordFile.path);
    expect(afterRecovery?.frontmatter).toEqual({ income: 1000 });
  });
});
