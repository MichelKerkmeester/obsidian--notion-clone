// ───────────────────────────────────────────────────────────────────
// MODULE:    database-view.test
// COMPONENT: host-binding seam — subtask move/reorder actions reach the
//            frontmatter writer and the view-def writer
// ───────────────────────────────────────────────────────────────────
//
// The full DatabaseView needs a live Obsidian App, workspace and metadata
// cache, so this harness is the smallest test double the bindings need: a
// fake leaf/app/data source, seeded rows and view entries, and a window
// stub for the debounced config writer. It drives the real action-bag
// closures the constructor binds — boardRenderer.actions.moveRowToPosition
// / moveSubtask / toggleSubtaskCollapsed — and asserts what they reach:
// per-note frontmatter updates through dataSource.updateFrontmatter and
// the view-def write through dataSource.updateViewDefFile.

// ───────────────────────────────────────────────────────────────────
// 1. MOCKS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi, beforeAll, type Mock } from "vitest";
import { TFile } from "obsidian";
import type { ColumnDef, RowData, ViewConfig, DatabaseConfig, SubtaskMoveRequest, SubtaskMovePlan } from "../data/types";
import type { DataSource, DataWriteContext } from "../data/data-source";
import type { WorkspaceLeaf } from "obsidian";
import { DatabaseView } from "./database-view";
import { planSubtaskMove, toFrontmatterUpdates } from "../data/subtask-serialize";
import type { BoardRendererActions, BoardSubtaskMove } from "./board-renderer";
import type { CalendarTimelineRendererActions } from "./calendar-timeline-renderer";

vi.mock("obsidian", () => {
  class TFileMock {
    path = "";
    name = "";
    basename = "";
    extension = "md";
  }
  class Component {
    register(): void {}
    registerDomEvent(): void {}
    registerEvent(): void {}
  }
  class FileView extends Component {
    leaf: unknown;
    app: unknown;
    containerEl: unknown;
    contentEl: unknown;
    constructor(leaf: { app?: unknown; containerEl?: unknown }) {
      super();
      this.leaf = leaf;
      this.app = leaf?.app;
      this.containerEl = leaf?.containerEl;
      this.contentEl = leaf?.containerEl;
    }
  }
  class MarkdownRenderChild extends Component {
    containerEl: unknown;
    constructor(containerEl: unknown) {
      super();
      this.containerEl = containerEl;
    }
  }
  return {
    App: class {},
    CachedMetadata: class {},
    Component,
    EventRef: class {},
    FileSystemAdapter: class {},
    FileView,
    FuzzySuggestModal: class {},
    HoverPopover: class {},
    MarkdownRenderChild,
    MarkdownRenderer: { render: vi.fn() },
    MarkdownSectionInformation: class {},
    MarkdownView: class {},
    MetadataCache: class {},
    Modal: class {},
    Notice: class {},
    Platform: { isMobile: false, isTablet: false, isDesktop: true },
    Plugin: class {},
    PluginSettingTab: class {},
    Scope: class {},
    Setting: class {},
    TFile: TFileMock,
    Vault: class {},
    ViewStateResult: class {},
    WorkspaceLeaf: class {},
    finishRenderMath: vi.fn(),
    getAllTags: vi.fn(),
    getIconIds: vi.fn(),
    loadMathJax: vi.fn(),
    normalizePath: (path: string) => path,
    parseYaml: vi.fn(),
    renderMath: vi.fn(),
    setIcon: vi.fn(),
    setTooltip: vi.fn(),
    stringifyYaml: vi.fn(),
  };
});

vi.mock("../i18n", () => ({
  t: (key: string, vars?: Record<string, string | number>) => {
    if (!vars) return key;
    return key.replace(/\{(\w+)\}/g, (_match: string, k: string) => String(vars[k] ?? ""));
  },
  getEffectiveLocale: () => "en",
}));

// ───────────────────────────────────────────────────────────────────
// 2. HARNESS
// ───────────────────────────────────────────────────────────────────

interface TestHistoryEntry {
  type: string;
  label: string;
  changes?: Array<{ file: TFile; path: string; key: string; oldValue: unknown; oldExists: boolean; newValue: unknown }>;
  createdFiles?: Array<{ path: string }>;
}

interface DatabaseViewHarness {
  boardRenderer: { actions: BoardRendererActions };
  calendarTimelineRenderer: { actions: CalendarTimelineRendererActions };
  rows: RowData[];
  instanceId: string;
  historyStack: TestHistoryEntry[];
  currentViewIndex: number;
  currentDbIndex: number;
  viewEntries: { config: DatabaseConfig; sourcePath: string }[];
  refresh(options?: { viewport?: unknown }): void;
  deleteView(viewIndex: number): void;
  undoLastEdit(): Promise<void>;
}

interface FakeDataSource {
  getViewDefFiles(): { file: TFile; config: DatabaseConfig }[];
  updateFrontmatter: Mock<(file: TFile, updates: Record<string, unknown>, context?: DataWriteContext) => Promise<void>>;
  updateViewDefFile: Mock<(file: TFile, config: DatabaseConfig, mutation?: unknown) => Promise<void>>;
  createNote: Mock<(folder: string, filename: string, frontmatter: Record<string, unknown>, context?: DataWriteContext, body?: string) => Promise<TFile>>;
  trashNote: Mock<(file: TFile, context?: DataWriteContext) => Promise<void>>;
  onDataChanged(): () => void;
  onViewConfigChanged(): () => void;
  invalidateRecordCache(): void;
  mutateFrontmatter(): Promise<void>;
  getFrontmatterSnapshot: Mock<(file: TFile) => Record<string, unknown>>;
}

// The stub is what `window` points at once installed, so its timers cannot
// call window.* without recursing into themselves; binding the real globals
// by name (member references, so no bare timer call site) is the loop-free
// delegation.
const nodeSetTimeout = setTimeout.bind(null);
const nodeClearTimeout = clearTimeout.bind(null);

const windowStub = {
  setTimeout: nodeSetTimeout,
  clearTimeout: nodeClearTimeout,
  requestAnimationFrame: (callback: FrameRequestCallback): number => {
    nodeSetTimeout(() => callback(Date.now()), 0);
    return 0;
  },
  // querySelectorAll is here for closeUtilitiesPopover's fallback (no toolbarRoot exists in
  // this harness, since no test mounts the real toolbar renderer): config-history undo/redo
  // closes toolbar popovers on the way out, and needs something iterable to call it on.
  activeDocument: { addEventListener: vi.fn(), removeEventListener: vi.fn(), querySelectorAll: () => [] },
};

function makeRow(path: string, frontmatter: Record<string, unknown> = {}): RowData {
  const file = new TFile();
  file.path = path;
  file.name = path.split("/").pop() ?? path;
  file.basename = file.name.replace(/\.md$/, "");
  return { file, frontmatter, computed: {} };
}

function treeFixture(): RowData[] {
  return [
    makeRow("root.md", { subtaskIds: ["a.md", "b.md"] }),
    makeRow("a.md", { parentId: "root.md", subtaskIds: ["a1.md"], subtaskRank: "V" }),
    makeRow("a1.md", { parentId: "a.md", subtaskRank: "5" }),
    makeRow("b.md", { parentId: "root.md", subtaskRank: "Z" }),
    makeRow("c.md", { subtaskIds: ["c1.md"] }),
    makeRow("c1.md", { parentId: "c.md", subtaskRank: "5" }),
  ];
}

function createView(extraViews: ViewConfig[] = [], columns: ColumnDef[] = []): { harness: DatabaseViewHarness; dataSource: FakeDataSource; viewConfig: ViewConfig; dbConfig: DatabaseConfig } {
  const dbFile = new TFile();
  dbFile.path = "db.md";
  const viewConfig: ViewConfig = {
    name: "Board",
    sourceFolder: "Tasks",
    schema: { columns, computedFields: [] },
    viewType: "board",
    manualOrder: { ranks: {} },
  };
  const dbConfig: DatabaseConfig = {
    id: "db1",
    name: "Tasks",
    sourceFolder: "Tasks",
    schema: { columns, computedFields: [] },
    views: [viewConfig, ...extraViews],
  };
  // Built before `dataSource`/`app` so both can resolve a row's own file and frontmatter by
  // path — `commitConfigAndCellChanges` (the config-transaction path a cross-group board move
  // takes) looks a changed row's file back up through `app.vault.getAbstractFileByPath` and reads
  // its current frontmatter through `dataSource.getFrontmatterSnapshot` before diffing against it,
  // neither of which the subtask-move bindings above ever needed.
  const rows = treeFixture();
  const dataSource: FakeDataSource = {
    getViewDefFiles: () => [{ file: dbFile, config: dbConfig }],
    updateFrontmatter: vi.fn(async () => {}),
    updateViewDefFile: vi.fn(async () => {}),
    createNote: vi.fn(async (_folder: string, _filename: string, _frontmatter: Record<string, unknown>, _context?: DataWriteContext, _body?: string) => {
      const file = new TFile();
      file.path = "Tasks/new-child.md";
      file.name = "new-child.md";
      file.basename = "new-child";
      return file;
    }),
    trashNote: vi.fn(async () => {}),
    onDataChanged: () => () => {},
    onViewConfigChanged: () => () => {},
    invalidateRecordCache: vi.fn(),
    mutateFrontmatter: vi.fn(async () => {}),
    getFrontmatterSnapshot: vi.fn((file: TFile) => rows.find((row) => row.file.path === file.path)?.frontmatter ?? {}),
  };
  const app = {
    vault: {
      getAbstractFileByPath: (path: string) =>
        path === dbFile.path ? dbFile : rows.find((row) => row.file.path === path)?.file ?? null,
    },
    metadataCache: {},
    workspace: {},
    fileManager: {},
  };
  const view = new DatabaseView(
    { app } as unknown as WorkspaceLeaf,
    dataSource as unknown as DataSource,
    [],
    "Tasks",
    [],
    undefined,
  );
  const harness = view as unknown as DatabaseViewHarness;
  harness.rows = rows;
  // `getCurrentEntry()` reads this rather than `dataSource.getViewDefFiles()` directly — unset,
  // it leaves every action that needs the entry's own `DatabaseConfig` (a cross-group board move
  // among them) silently returning early rather than reaching the data source at all.
  harness.viewEntries = [{ config: dbConfig, sourcePath: dbFile.path }];
  harness.currentDbIndex = 0;
  return { harness, dataSource, viewConfig, dbConfig };
}

function planFor(request: SubtaskMoveRequest, rows: RowData[]): { request: SubtaskMoveRequest; plan: SubtaskMovePlan } {
  const plan = planSubtaskMove(rows, request);
  if (!plan.ok) throw new Error(`fixture move rejected: ${plan.error.message}`);
  return { request, plan };
}

function flushConfigWrite(): Promise<void> {
  // The view-config write is debounced by 300ms; give the real timer time to fire.
  return new Promise((resolve) => window.setTimeout(resolve, 350));
}

beforeAll(() => {
  vi.stubGlobal("window", windowStub);
});

// ───────────────────────────────────────────────────────────────────
// 3. SUBTASK MOVE THROUGH THE HOST BINDINGS
// ───────────────────────────────────────────────────────────────────

describe("DatabaseView subtask host bindings", () => {
  it("moveRowToPosition applies the planned subtask writes when given a subtaskMove", async () => {
    const { harness, dataSource } = createView();
    const rows = harness.rows;
    const subtaskMove: BoardSubtaskMove = planFor({ childPath: "b.md", newParentPath: "root.md", beforePath: "a.md" }, rows);
    const fileByPath = new Map(rows.map((row) => [row.file.path, row.file]));

    // The binding applies the plan and the rank change as one asynchronous
    // move; the frontmatter writes are recorded as soon as the handler starts.
    harness.boardRenderer.actions.moveRowToPosition("b.md", "a.md", undefined, subtaskMove);
    await flushConfigWrite();

    expect(subtaskMove.plan.ok).toBe(true);
    if (!subtaskMove.plan.ok) return;
    expect(dataSource.updateFrontmatter).toHaveBeenCalledTimes(subtaskMove.plan.writes.length);
    for (const write of subtaskMove.plan.writes) {
      expect(dataSource.updateFrontmatter).toHaveBeenCalledWith(
        fileByPath.get(write.path),
        toFrontmatterUpdates(write),
        { sourceInstanceId: harness.instanceId },
      );
    }

    // The rank change lands in the same transaction: the debounced view-def
    // write carries a rank for the moved row, never a second frontmatter write.
    expect(dataSource.updateViewDefFile).toHaveBeenCalledTimes(1);
    const writtenDb = dataSource.updateViewDefFile.mock.calls[0][1];
    expect(writtenDb.views[0].manualOrder?.ranks?.["b.md"]).toBeTruthy();
  });

  it("moveSubtask routes the planned writes through updateFrontmatter", async () => {
    const { harness, dataSource } = createView();
    const rows = harness.rows;
    const { request, plan } = planFor({ childPath: "a1.md", newParentPath: "c.md" }, rows);
    const fileByPath = new Map(rows.map((row) => [row.file.path, row.file]));

    await harness.boardRenderer.actions.moveSubtask?.(request, plan);

    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(dataSource.updateFrontmatter).toHaveBeenCalledTimes(plan.writes.length);
    for (const write of plan.writes) {
      expect(dataSource.updateFrontmatter).toHaveBeenCalledWith(
        fileByPath.get(write.path),
        toFrontmatterUpdates(write),
        { sourceInstanceId: harness.instanceId },
      );
    }
  });

  it("toggleSubtaskCollapsed persists the per-view collapse override through the view-def writer", async () => {
    const { harness, dataSource, viewConfig } = createView();
    const row = harness.rows[1];

    void harness.boardRenderer.actions.toggleSubtaskCollapsed?.(row, true);

    expect(viewConfig.subtaskCollapsed).toEqual({ "a.md": true });
    await flushConfigWrite();
    expect(dataSource.updateViewDefFile).toHaveBeenCalledTimes(1);
    const writtenDb = dataSource.updateViewDefFile.mock.calls[0][1];
    expect(writtenDb.views[0].subtaskCollapsed).toEqual({ "a.md": true });
  });

  it("setSubtaskCollapsedMany writes every row in one mutation and renders once, unlike N toggleSubtaskCollapsed calls", async () => {
    const { harness, dataSource, viewConfig } = createView();
    const parents = [harness.rows[0], harness.rows[1]]; // root.md, a.md
    const refreshSpy = vi.spyOn(harness, "refresh");

    void harness.calendarTimelineRenderer.actions.setSubtaskCollapsedMany?.(parents, true);

    expect(viewConfig.subtaskCollapsed).toEqual({ "root.md": true, "a.md": true });
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    await flushConfigWrite();
    expect(dataSource.updateViewDefFile).toHaveBeenCalledTimes(1);
    const writtenDb = dataSource.updateViewDefFile.mock.calls[0][1];
    expect(writtenDb.views[0].subtaskCollapsed).toEqual({ "root.md": true, "a.md": true });
  });

  it("createSubtaskRecord creates the child note pre-linked and appends it to the parent's subtaskIds", async () => {
    const { harness, dataSource } = createView();
    const parent = harness.rows[0]; // root.md, subtaskIds ["a.md", "b.md"]

    await harness.calendarTimelineRenderer.actions.createSubtaskRecord?.(parent);

    expect(dataSource.createNote).toHaveBeenCalledTimes(1);
    const createdFrontmatter = dataSource.createNote.mock.calls[0][2];
    expect(createdFrontmatter.parentId).toBe("root.md");
    expect(createdFrontmatter.subtaskRank).toBeTruthy();

    // The parent's list gains the created child through the relation write path —
    // the null-deletes shape for the relation keys the parent does not carry —
    // never a second create and never a guessed path.
    expect(dataSource.updateFrontmatter).toHaveBeenCalledTimes(1);
    const [parentFile, updates] = dataSource.updateFrontmatter.mock.calls[0];
    expect(parentFile.path).toBe("root.md");
    expect(updates).toEqual({
      parentId: null,
      subtaskIds: ["a.md", "b.md", "Tasks/new-child.md"],
      subtaskRank: null,
      collapsed: null,
    });
  });

  it("createSubtaskRecord folds the parent's subtaskIds write into the same history entry as the file creation, so one undo reverts both", async () => {
    const { harness } = createView();
    const parent = harness.rows[0]; // root.md, subtaskIds ["a.md", "b.md"]

    await harness.calendarTimelineRenderer.actions.createSubtaskRecord?.(parent);

    // A separate, untracked parent write here would let Ctrl+Z delete the created
    // child while leaving its path stranded in the parent's subtaskIds — one undo
    // step must revert the file creation and the parent's list together.
    expect(harness.historyStack).toHaveLength(1);
    const entry = harness.historyStack[0];
    expect(entry.type).toBe("cells");
    expect(entry.createdFiles).toEqual([{ path: "Tasks/new-child.md" }]);
    expect(entry.changes).toEqual([{
      file: parent.file,
      path: "root.md",
      key: "subtaskIds",
      oldValue: ["a.md", "b.md"],
      oldExists: true,
      newValue: ["a.md", "b.md", "Tasks/new-child.md"],
    }]);
  });

  it("createSubtaskRecord rolls back the created child and reports the failure when the parent link write throws, instead of orphaning it", async () => {
    const { harness, dataSource } = createView();
    const parent = harness.rows[0]; // root.md, subtaskIds ["a.md", "b.md"]
    dataSource.updateFrontmatter.mockRejectedValueOnce(new Error("disk full"));

    // The child file creation itself must not throw back at the caller —
    // the failure is a parent-link write, handled inside createSubtaskRecord.
    await expect(harness.calendarTimelineRenderer.actions.createSubtaskRecord?.(parent)).resolves.toBeUndefined();

    // Revert: the just-created child is trashed rather than left dangling
    // with a parentId pointing at a parent that never listed it back.
    expect(dataSource.trashNote).toHaveBeenCalledTimes(1);
    expect(dataSource.trashNote.mock.calls[0][0].path).toBe("Tasks/new-child.md");

    // No stray "created" undo entry survives for a file that no longer exists.
    expect(harness.historyStack).toHaveLength(0);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. BOARD GROUP VISIBILITY HOST BINDINGS
// ───────────────────────────────────────────────────────────────────
//
// `hideGroup` and `deleteGroup` were declared on `BoardRendererActions` with neither host
// ever supplying them, so the two column-menu rows guarded on them never built. This host now
// wires `hideGroup`/`showGroup` for real and carries no `deleteGroup` at all — the fixture below
// is what locks that shape so it cannot silently regress to "declared, unimplemented" again.

describe("DatabaseView board group visibility host bindings", () => {
  it("supplies showGroup and hideGroup, and carries no deleteGroup", () => {
    const { harness } = createView();

    expect(typeof harness.boardRenderer.actions.showGroup).toBe("function");
    expect(typeof harness.boardRenderer.actions.hideGroup).toBe("function");
    expect((harness.boardRenderer.actions as unknown as Record<string, unknown>).deleteGroup).toBeUndefined();
  });

  it("hideGroup persists the key and showGroup removes it, through the view-def writer", async () => {
    const { harness, dataSource, viewConfig } = createView();

    harness.boardRenderer.actions.hideGroup?.("status", "Done");
    expect(viewConfig.boardHiddenGroups).toEqual({ status: ["Done"] });
    await flushConfigWrite();
    expect(dataSource.updateViewDefFile).toHaveBeenCalledTimes(1);
    expect(dataSource.updateViewDefFile.mock.calls[0][1].views[0].boardHiddenGroups).toEqual({ status: ["Done"] });

    harness.boardRenderer.actions.showGroup("status", "Done");
    expect(viewConfig.boardHiddenGroups).toEqual({});
  });

  it("setBoardHideEmptyGroups persists the flag through the view-def writer", async () => {
    const { harness, dataSource, viewConfig } = createView();

    harness.boardRenderer.actions.setBoardHideEmptyGroups(false);

    expect(viewConfig.boardHideEmptyGroups).toBe(false);
    await flushConfigWrite();
    expect(dataSource.updateViewDefFile).toHaveBeenCalledTimes(1);
    expect(dataSource.updateViewDefFile.mock.calls[0][1].views[0].boardHideEmptyGroups).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4b. BOARD CROSS-GROUP MOVE — DESKTOP AND TOUCH SHARE ONE HOST BINDING
// ───────────────────────────────────────────────────────────────────
//
// `board-renderer.ts`'s `moveCardAndOrder` reaches `moveRowWithGroupUpdatesAndPosition` whether
// the drag started from a `dragstart` (desktop) or a long-press lift (phone) — this host's
// implementation of that binding cannot tell which pointer moved the card, so one test here
// stands for both. The Undo affordance itself is `showOperationResult`'s own toast, skipped in
// this harness for the same reason `deleteView`'s is (no `containerEl_`, so `showToast` never
// mounts) — what this pins is the undo path underneath it: the same generic config-history
// mechanism `deleteView` above already proves reverses a view deletion, reversing a cross-group
// frontmatter write instead.

describe("DatabaseView board cross-group move host binding", () => {
  it("writes the grouped field through updateFrontmatter and undoes back to the source group", async () => {
    const { harness, dataSource } = createView([], [{ key: "status", label: "Status", type: "select" }]);
    const row = harness.rows.find((candidate) => candidate.file.path === "root.md")!;
    row.frontmatter.status = "Open";

    await harness.boardRenderer.actions.moveRowWithGroupUpdatesAndPosition?.(
      row,
      [{ field: "status", fromGroupKey: "Open", toGroupKey: "In Progress" }],
      undefined,
      undefined,
    );

    expect(dataSource.updateFrontmatter).toHaveBeenCalledWith(
      row.file,
      { status: "In Progress" },
      expect.anything(),
    );
    expect(harness.historyStack).toHaveLength(1);

    await harness.undoLastEdit();
    expect(dataSource.updateFrontmatter).toHaveBeenLastCalledWith(row.file, { status: "Open" }, expect.anything());
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. DELETE VIEW — NO CONFIRM, AN EXISTING UNDO PATH ALREADY COVERS IT
// ───────────────────────────────────────────────────────────────────
//
// The persistence layer already answers whether a deleted view is recoverable: deleteView saves
// through saveCurrentViewConfigInBackground -> saveViewEntryConfig -> recordConfigHistory, the
// same generic before/after snapshot every other view mutation here takes, and that already
// pushes an undoable "config" history entry. So no confirm is needed — an Undo toast instead —
// and this suite pins the undo path itself: the deletion is folded into the same history stack
// addView/renameView/moveView already use, and undoLastEdit() reverses it.

describe("DatabaseView deleteView (no confirm — an existing undo path already covers it)", () => {
  it("deletes exactly one view, with no confirm, and folds the deletion into the generic config-history undo path", async () => {
    const secondView: ViewConfig = {
      name: "Table",
      sourceFolder: "Tasks",
      schema: { columns: [], computedFields: [] },
      viewType: "table",
    };
    const { harness, dataSource, dbConfig } = createView([secondView]);
    expect(dbConfig.views).toHaveLength(2);

    harness.deleteView(1);
    await flushConfigWrite();

    // The view is gone and the save reached the writer — no dialog stood in front of it.
    expect(dbConfig.views).toHaveLength(1);
    expect(dbConfig.views[0].name).toBe("Board");
    expect(dataSource.updateViewDefFile).toHaveBeenCalled();

    // The generic config-history path recorded it, labeled as a view deletion rather than the
    // catch-all "view configuration" every other unlabeled config write falls back to.
    expect(harness.historyStack).toHaveLength(1);
    expect(harness.historyStack[0].type).toBe("config");
    expect(harness.historyStack[0].label).toBe("undo.deleteViewConfig");

    // The toolbar's own Undo action reaches this entry: undoing restores the deleted view.
    await harness.undoLastEdit();
    expect(dbConfig.views).toHaveLength(2);
    expect(dbConfig.views.map((view) => view.name)).toEqual(["Board", "Table"]);
  });

  it("restores the selected tab, not just the view list, when undo brings a deleted view back", async () => {
    // Red before this fix: recordConfigHistory fell back to the CURRENT view's id
    // (this.getConfig()?.id) when no viewId was given, and deleteView already moved
    // currentViewIndex onto the neighbour by the time that fallback ran — so the history entry
    // named the surviving view, and undo restored the deleted view into the strip without ever
    // moving the selection back onto it.
    const secondView: ViewConfig = {
      id: "view-2", name: "Table", sourceFolder: "Tasks", schema: { columns: [], computedFields: [] }, viewType: "table",
    };
    const { harness, dbConfig } = createView([secondView]);
    expect(dbConfig.views).toHaveLength(2);

    // Select the view being deleted — it is also the last one, so the delete forces
    // currentViewIndex back onto its neighbour (Board, index 0) the same way the toolbar's own
    // tab-close does. Deleting an inactive, non-last view never moves currentViewIndex at all,
    // so the bug only shows on this exact shape.
    harness.currentViewIndex = 1;
    harness.deleteView(1);
    await flushConfigWrite();

    expect(dbConfig.views.map((view) => view.name)).toEqual(["Board"]);
    expect(harness.currentViewIndex).toBe(0);

    await harness.undoLastEdit();
    expect(dbConfig.views.map((view) => view.name)).toEqual(["Board", "Table"]);
    // The restored "Table" view is back at its original index (1) — the selection must follow
    // it there, not stay on "Board", the neighbour the delete moved it to.
    expect(harness.currentViewIndex).toBe(1);
  });

  it("raises no confirm and pushes no history entry for the one-view guard — a delete that cannot happen asks nothing", async () => {
    const { harness, dataSource, dbConfig } = createView();
    expect(dbConfig.views).toHaveLength(1);

    harness.deleteView(0);
    await flushConfigWrite();

    expect(dbConfig.views).toHaveLength(1);
    expect(harness.historyStack).toHaveLength(0);
    expect(dataSource.updateViewDefFile).not.toHaveBeenCalled();
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. VIEW-SWITCH TEARDOWN
// ───────────────────────────────────────────────────────────────────
//
// `render()` reused the container across a view-type switch but only ever tore the outgoing
// renderer down when it happened to be chart (a check inline in `setViewType`, not `render()`
// itself). Switching away from timeline or calendar left that renderer's resize observer,
// gantt listeners and current-time interval running against a container the next view had
// already taken over — see `rendered-view-roots.ts` and `tools/live/render-assertions.mjs`'s
// "view-switch residue" checks for what that left behind in the DOM itself. This covers the
// half a DOM check cannot reach: that leaving a view type actually calls that renderer's own
// `destroy()`, and only when the type is really changing.

interface ViewSwitchHarness {
  lastRenderedViewType: string | null;
  render(): void;
  calendarTimelineRenderer: { destroy: () => void };
  calendarRenderer: { destroy: () => void };
}

describe("DatabaseView view-switch teardown", () => {
  it("switching away from timeline calls the timeline renderer's destroy", () => {
    const { harness, viewConfig } = createView();
    const target = harness as unknown as ViewSwitchHarness;
    const destroySpy = vi.spyOn(target.calendarTimelineRenderer, "destroy");

    target.lastRenderedViewType = "timeline";
    viewConfig.viewType = "table";
    target.render();

    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  it("switching away from calendar calls the calendar renderer's destroy", () => {
    const { harness, viewConfig } = createView();
    const target = harness as unknown as ViewSwitchHarness;
    const destroySpy = vi.spyOn(target.calendarRenderer, "destroy");

    target.lastRenderedViewType = "calendar";
    viewConfig.viewType = "table";
    target.render();

    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  it("negative control: re-rendering the same view type skips the teardown", () => {
    // Proves the guard actually gates on a real type change rather than firing on every
    // render — without it, this call would also destroy a timeline the user never left.
    const { harness, viewConfig } = createView();
    const target = harness as unknown as ViewSwitchHarness;
    const destroySpy = vi.spyOn(target.calendarTimelineRenderer, "destroy");

    target.lastRenderedViewType = "timeline";
    viewConfig.viewType = "timeline";
    target.render();

    expect(destroySpy).not.toHaveBeenCalled();
  });
});
