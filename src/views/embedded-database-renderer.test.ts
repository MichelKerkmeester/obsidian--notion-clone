// ───────────────────────────────────────────────────────────────────
// MODULE:    embedded-database-renderer.test
// COMPONENT: host-binding seam — subtask move/reorder and collapse actions
//            reach the frontmatter writer and the view-def writer
// ───────────────────────────────────────────────────────────────────
//
// The full EmbeddedDatabaseRenderer needs a live Obsidian App, so this
// harness is the smallest test double the bindings need: a fake
// app/data source, a minimal element double for the read-only embed's
// render path, seeded rows and config, and a window stub. It drives the
// real action-bag closures the constructor binds —
// boardRenderer.actions.moveRowToPosition / moveSubtask /
// toggleSubtaskCollapsed — and asserts what they reach: per-note
// frontmatter updates through dataSource.updateFrontmatter and the
// view-def write through dataSource.updateViewDefFile.

// ───────────────────────────────────────────────────────────────────
// 1. MOCKS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi, beforeAll, type Mock } from "vitest";
import { TFile } from "obsidian";
import type { RowData, ViewConfig, DatabaseConfig, SubtaskMoveRequest, SubtaskMovePlan } from "../data/types";
import type { DataSource, DataWriteContext } from "../data/data-source";
import type { App } from "obsidian";
import { EmbeddedDatabaseRenderer } from "./embedded-database-renderer";
import { planSubtaskMove, toFrontmatterUpdates } from "../data/subtask-serialize";
import type { BoardRendererActions, BoardSubtaskMove } from "./board-renderer";

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
    FileView: class {},
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

interface EmbeddedHarness {
  boardRenderer: { actions: BoardRendererActions };
  rows: RowData[];
  config: ViewConfig | undefined;
  currentDbConfig: DatabaseConfig | undefined;
  currentSourcePath: string;
  instanceId: string;
}

interface FakeDataSource {
  updateFrontmatter: Mock<(file: TFile, updates: Record<string, unknown>, context?: DataWriteContext) => Promise<void>>;
  updateViewDefFile: Mock<(file: TFile, config: DatabaseConfig, mutation?: unknown) => Promise<void>>;
  onDataChanged(): () => void;
  onViewConfigChanged(): () => void;
  notifyViewConfigChanged(): void;
  invalidateRecordCache(): void;
  mutateFrontmatter(): Promise<void>;
  getRecordsForConfig(): unknown[];
  openNote(): void;
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

/** Minimal DOM double for the embed's render path: element creation,
 *  class toggling and selector queries return empty results, which is all
 *  the read-only embed's empty-state render exercises. */
class FakeElement {
  children: FakeElement[] = [];
  className = "";
  scrollTop = 0;
  scrollLeft = 0;
  textContent = "";
  isConnected = false;
  ownerDocument = { defaultView: null };
  onclick: (() => void) | null = null;

  createDiv(options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): FakeElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): FakeElement {
    return this.createEl("span", options);
  }

  createEl(_tag: string, options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): FakeElement {
    const el = new FakeElement();
    el.className = Array.isArray(options.cls) ? options.cls.filter(Boolean).join(" ") : options.cls || "";
    el.textContent = options.text ?? "";
    this.children.push(el);
    return el;
  }

  toggleClass(_name: string, _on: boolean): void {}

  addClass(_name: string): void {}

  removeClass(_name: string): void {}

  querySelectorAll(): FakeElement[] {
    return [];
  }

  querySelector(): FakeElement | null {
    return null;
  }

  closest(): FakeElement | null {
    return null;
  }

  getBoundingClientRect(): { top: number; left: number; right: number; bottom: number } {
    return { top: 0, left: 0, right: 0, bottom: 0 };
  }

  remove(): void {
    this.children = [];
  }
}

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

function createRenderer(): { harness: EmbeddedHarness; dataSource: FakeDataSource; viewConfig: ViewConfig } {
  const sourceFile = new TFile();
  sourceFile.path = "source.md";
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
    updateFrontmatter: vi.fn(async () => {}),
    updateViewDefFile: vi.fn(async () => {}),
    onDataChanged: () => () => {},
    onViewConfigChanged: () => () => {},
    notifyViewConfigChanged: vi.fn(),
    invalidateRecordCache: vi.fn(),
    mutateFrontmatter: vi.fn(async () => {}),
    getRecordsForConfig: () => [],
    openNote: vi.fn(),
  };
  const app = {
    vault: {
      getAbstractFileByPath: (path: string) => {
        if (path === sourceFile.path) return sourceFile;
        if (path === dbFile.path) return dbFile;
        return null;
      },
    },
    metadataCache: {},
    workspace: {},
    fileManager: {},
  };
  const containerEl = new FakeElement();
  const renderer = new EmbeddedDatabaseRenderer(
    app as unknown as App,
    containerEl as unknown as HTMLElement,
    dataSource as unknown as DataSource,
    () => [],
    sourceFile.path,
    sourceFile.path,
    () => null,
    async () => {},
    "codeblock",
  );
  const harness = renderer as unknown as EmbeddedHarness;
  harness.rows = treeFixture();
  harness.config = viewConfig;
  harness.currentDbConfig = dbConfig;
  harness.currentSourcePath = dbFile.path;
  return { harness, dataSource, viewConfig };
}

function planFor(request: SubtaskMoveRequest, rows: RowData[]): { request: SubtaskMoveRequest; plan: SubtaskMovePlan } {
  const plan = planSubtaskMove(rows, request);
  if (!plan.ok) throw new Error(`fixture move rejected: ${plan.error.message}`);
  return { request, plan };
}

function flushBackgroundSave(): Promise<void> {
  // The view-def write is fire-and-forget; one macrotask lets its promise chain settle.
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

beforeAll(() => {
  vi.stubGlobal("window", windowStub);
});

// ───────────────────────────────────────────────────────────────────
// 3. SUBTASK MOVE THROUGH THE HOST BINDINGS
// ───────────────────────────────────────────────────────────────────

describe("EmbeddedDatabaseRenderer subtask host bindings", () => {
  it("moveRowToPosition applies the planned subtask writes when given a subtaskMove", async () => {
    const { harness, dataSource } = createRenderer();
    const rows = harness.rows;
    const subtaskMove: BoardSubtaskMove = planFor({ childPath: "b.md", newParentPath: "root.md", beforePath: "a.md" }, rows);
    const fileByPath = new Map(rows.map((row) => [row.file.path, row.file]));

    // The binding applies the plan and the rank change as one asynchronous
    // move; the frontmatter writes are recorded as soon as the handler starts.
    harness.boardRenderer.actions.moveRowToPosition("b.md", "a.md", undefined, subtaskMove);
    await flushBackgroundSave();

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

    // The rank change lands in the same transaction: the background view-def
    // write carries a rank for the moved row, never a second frontmatter write.
    expect(dataSource.updateViewDefFile).toHaveBeenCalledTimes(1);
    const writtenDb = dataSource.updateViewDefFile.mock.calls[0][1];
    expect(writtenDb.views[0].manualOrder?.ranks?.["b.md"]).toBeTruthy();
  });

  it("moveSubtask routes the planned writes through updateFrontmatter", async () => {
    const { harness, dataSource } = createRenderer();
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
    const { harness, dataSource, viewConfig } = createRenderer();
    const row = harness.rows[1];

    void harness.boardRenderer.actions.toggleSubtaskCollapsed?.(row, true);

    expect(viewConfig.subtaskCollapsed).toEqual({ "a.md": true });
    await flushBackgroundSave();
    expect(dataSource.updateViewDefFile).toHaveBeenCalledTimes(1);
    const writtenDb = dataSource.updateViewDefFile.mock.calls[0][1];
    expect(writtenDb.views[0].subtaskCollapsed).toEqual({ "a.md": true });
  });
});
