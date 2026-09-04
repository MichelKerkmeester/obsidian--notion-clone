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
import type { RowData, ViewConfig, DatabaseConfig, SubtaskMoveRequest, SubtaskMovePlan } from "../data/types";
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
  refresh(options?: { viewport?: unknown }): void;
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
  activeDocument: { addEventListener: vi.fn(), removeEventListener: vi.fn() },
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

function createView(): { harness: DatabaseViewHarness; dataSource: FakeDataSource; viewConfig: ViewConfig } {
  const dbFile = new TFile();
  dbFile.path = "db.md";
  const viewConfig: ViewConfig = {
    name: "Board",
    sourceFolder: "Tasks",
    schema: { columns: [], computedFields: [] },
    viewType: "board",
    manualOrder: { ranks: {} },
  };
  const dbConfig: DatabaseConfig = {
    id: "db1",
    name: "Tasks",
    sourceFolder: "Tasks",
    schema: { columns: [], computedFields: [] },
    views: [viewConfig],
  };
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
  };
  const app = {
    vault: { getAbstractFileByPath: (path: string) => (path === dbFile.path ? dbFile : null) },
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
  harness.rows = treeFixture();
  return { harness, dataSource, viewConfig };
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
