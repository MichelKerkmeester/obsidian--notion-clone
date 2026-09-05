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
import type { CalendarTimelineRendererActions } from "./calendar-timeline-renderer";
import { getViewTypeOptions } from "./toolbar-renderer";
import {
  applyLinkedViewMove,
  appendLinkedViewToDatabase,
  buildLinkedViewFence,
  formatLinkedViewFence,
  linkedViewBlockCount,
  parseLinkedViewFence,
  roundTripLinkedViewFence,
  serializeLinkedViewSource,
  undoLinkedViewMove,
} from "./modals/linked-view-block";

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
  tableRenderer: { actions: { isReadOnly?: boolean; createEntry?: (defaults?: Record<string, unknown>) => void } };
  calendarTimelineRenderer: { actions: CalendarTimelineRendererActions };
  rows: RowData[];
  config: ViewConfig | undefined;
  currentDbConfig: DatabaseConfig | undefined;
  currentSourcePath: string;
  instanceId: string;
  renderResults(config: ViewConfig, options?: { viewport?: unknown }): void;
  isViewReadOnly?(): boolean;
  undoLastEdit?(): Promise<void>;
  historyStack?: Array<{ type: string; label: string }>;
}

interface FakeDataSource {
  updateFrontmatter: Mock<(file: TFile, updates: Record<string, unknown>, context?: DataWriteContext) => Promise<void>>;
  updateViewDefFile: Mock<(file: TFile, config: DatabaseConfig, mutation?: unknown) => Promise<void>>;
  createNote: Mock<(folder: string, filename: string, frontmatter: Record<string, unknown>, context?: DataWriteContext) => Promise<TFile>>;
  trashNote: Mock<(file: TFile, context?: DataWriteContext) => Promise<void>>;
  onDataChanged(): () => void;
  onViewConfigChanged(): () => void;
  notifyViewConfigChanged(): void;
  invalidateRecordCache(): void;
  mutateFrontmatter(): Promise<void>;
  getRecordsForConfig(): unknown[];
  openNote: Mock<(file: TFile) => void>;
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
  parentElement: FakeElement | null = null;
  className = "";
  scrollTop = 0;
  scrollLeft = 0;
  textContent = "";
  isConnected = false;
  ownerDocument = { defaultView: null };
  onclick: (() => void) | null = null;
  draggable = false;
  style: { width?: string; maxWidth?: string; overflowX?: string } = {};
  private classes = new Set<string>();
  private listeners = new Map<string, Set<(event: unknown) => void>>();

  instanceOf(constructor: unknown): boolean {
    return typeof HTMLElement !== "undefined" && constructor === HTMLElement;
  }

  createDiv(options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): FakeElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): FakeElement {
    return this.createEl("span", options);
  }

  createEl(_tag: string, options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): FakeElement {
    const el = new FakeElement();
    el.parentElement = this;
    const cls = Array.isArray(options.cls) ? options.cls.filter(Boolean).join(" ") : options.cls || "";
    el.className = cls;
    for (const name of cls.split(/\s+/).filter(Boolean)) el.classes.add(name);
    el.textContent = options.text ?? "";
    this.children.push(el);
    return el;
  }

  toggleClass(name: string, on: boolean): void {
    if (on) this.addClass(name);
    else this.removeClass(name);
  }

  addClass(name: string): void {
    this.classes.add(name);
    this.className = [...this.classes].join(" ");
  }

  removeClass(name: string): void {
    this.classes.delete(name);
    this.className = [...this.classes].join(" ");
  }

  hasClass(name: string): boolean {
    return this.classes.has(name);
  }

  querySelectorAll(selector?: string): FakeElement[] {
    const found: FakeElement[] = [];
    const walk = (node: FakeElement) => {
      for (const child of node.children) {
        if (!selector || child.matchesSelector(selector)) found.push(child);
        walk(child);
      }
    };
    walk(this);
    return found;
  }

  querySelector(selector?: string): FakeElement | null {
    if (selector?.startsWith(":scope > ")) {
      const rest = selector.slice(":scope > ".length);
      const [directSelector, ...descendantSelectors] = rest.split(/\s+/);
      const direct = this.children.find((child) => child.matchesSelector(directSelector)) ?? null;
      return descendantSelectors.length > 0
        ? direct?.querySelector(descendantSelectors.join(" ")) ?? null
        : direct;
    }
    return this.querySelectorAll(selector)[0] ?? null;
  }

  closest(selector: string): FakeElement | null {
    let current: FakeElement | null = this;
    while (current) {
      if (current.matchesSelector(selector)) return current;
      current = current.parentElement;
    }
    return null;
  }

  addEventListener(type: string, listener: (event: unknown) => void): void {
    const listeners = this.listeners.get(type) ?? new Set<(event: unknown) => void>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: (event: unknown) => void): void {
    this.listeners.get(type)?.delete(listener);
  }

  dispatchEvent(event: { type: string; bubbles?: boolean }): void {
    if (event.type === "click") this.onclick?.();
    for (const listener of this.listeners.get(event.type) ?? []) listener(event);
    if (event.bubbles) this.parentElement?.dispatchEvent(event);
  }

  matchesSelector(selector: string): boolean {
    const classes = selector.split(".").filter(Boolean);
    if (classes.length === 0) return true;
    return classes.every((name) => this.classes.has(name) || this.className.split(/\s+/).includes(name));
  }

  getBoundingClientRect(): { top: number; left: number; right: number; bottom: number } {
    return { top: 0, left: 0, right: 0, bottom: 0 };
  }

  empty(): void {
    this.children = [];
  }

  remove(): void {
    this.children = [];
    this.parentElement = null;
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
  const created = new TFile();
  created.path = "Tasks/Untitled.md";
  const dataSource: FakeDataSource = {
    updateFrontmatter: vi.fn(async () => {}),
    updateViewDefFile: vi.fn(async () => {}),
    createNote: vi.fn(async () => created),
    trashNote: vi.fn(async () => {}),
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

/** Nothing in this harness is a real DOM node, so every `instanceof HTMLElement`
 *  branch must answer no rather than throw for the global being absent. */
class NoDomElement {}

beforeAll(() => {
  vi.stubGlobal("window", windowStub);
  vi.stubGlobal("HTMLElement", NoDomElement);
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

  it("setSubtaskCollapsedMany writes every row in one mutation and renders once, unlike N toggleSubtaskCollapsed calls", async () => {
    const { harness, dataSource, viewConfig } = createRenderer();
    const parents = [harness.rows[0], harness.rows[1]]; // root.md, a.md
    const renderSpy = vi.spyOn(harness, "renderResults");

    void harness.calendarTimelineRenderer.actions.setSubtaskCollapsedMany?.(parents, true);

    expect(viewConfig.subtaskCollapsed).toEqual({ "root.md": true, "a.md": true });
    expect(renderSpy).toHaveBeenCalledTimes(1);
    await flushBackgroundSave();
    expect(dataSource.updateViewDefFile).toHaveBeenCalledTimes(1);
    const writtenDb = dataSource.updateViewDefFile.mock.calls[0][1];
    expect(writtenDb.views[0].subtaskCollapsed).toEqual({ "root.md": true, "a.md": true });
  });

  it("copies boardCardFields from the local config into the view-def writer", async () => {
    const { harness, dataSource, viewConfig } = createRenderer();
    const localConfig: ViewConfig = {
      ...viewConfig,
      boardCardFields: [{ key: "hours", visible: false }, { key: "tags", visible: true }],
    };
    harness.config = localConfig;

    (harness as unknown as { saveEmbeddedConfigInBackground(): void }).saveEmbeddedConfigInBackground();
    await flushBackgroundSave();

    expect(dataSource.updateViewDefFile).toHaveBeenCalledTimes(1);
    const writtenDb = dataSource.updateViewDefFile.mock.calls[0][1];
    expect(writtenDb.views[0]).toBe(viewConfig);
    expect(writtenDb.views[0].boardCardFields).toEqual(localConfig.boardCardFields);
  });

  it("openDependencyFile opens the dependency note through the embed's open-note path", () => {
    const { harness, dataSource } = createRenderer();

    void harness.calendarTimelineRenderer.actions.openDependencyFile?.("db.md");

    const openNote = vi.mocked(dataSource).openNote;
    expect(openNote).toHaveBeenCalledTimes(1);
    expect(openNote).toHaveBeenCalledWith(expect.objectContaining({ path: "db.md" }));
  });
});

describe("linked embed chrome", () => {
  it("asks the toolbar for a headerless embed and offers the move action", () => {
    const { harness, viewConfig } = createRenderer();
    let actions: Record<string, unknown> | undefined;
    (harness as unknown as { toolbarRenderer: unknown }).toolbarRenderer = {
      render: (...args: unknown[]) => { actions = args[5] as Record<string, unknown>; },
      closePopovers: () => {},
    };
    (harness as unknown as { renderActiveViewControls: (config: ViewConfig) => void }).renderActiveViewControls = () => {};
    (harness as unknown as { updateStickyOffsets: () => void }).updateStickyOffsets = () => {};
    (harness as unknown as { renderToolbar: (config: ViewConfig) => void }).renderToolbar(viewConfig);

    // The duplicate title and the collapse chevron both hang off the title row,
    // so withdrawing the row is what removes the block furniture.
    expect(actions?.hideDatabaseTitle).toBe(true);
    expect(typeof actions?.moveLinkedView).toBe("function");
    expect(actions?.showChartOptions).toBe(true);
  });

  it("builds the title row only for a surface that did not withdraw it", async () => {
    const { readFileSync } = await import("fs");
    const { resolve } = await import("path");
    const toolbar = readFileSync(resolve(__dirname, "toolbar-renderer.ts"), "utf-8");
    expect(toolbar).toContain("!actions.showDatabaseChrome && !actions.hideDatabaseTitle");
    expect(toolbar).toContain("hideDatabaseTitle?: boolean");
  });

  it("starts a move from the handle but not from a toolbar button", () => {
    const { harness } = createRenderer();
    const container = (harness as unknown as { containerEl: FakeElement }).containerEl;
    const header = new FakeElement();
    header.addClass("db-header");
    const handle = new FakeElement();
    handle.addClass("db-linked-view-drag-handle");
    handle.parentElement = header;
    const button = new FakeElement();
    button.addClass("db-toolbar-icon-button");
    button.parentElement = header;
    header.children.push(handle, button);
    header.parentElement = container;
    container.children.push(header);

    const startDrag = vi.spyOn(harness as unknown as { onLinkedViewDragStart: (event: unknown) => void }, "onLinkedViewDragStart");
    (harness as unknown as { bindLinkedViewMoveAffordance(): void }).bindLinkedViewMoveAffordance();

    expect(handle.draggable).toBe(true);
    expect(header.draggable).toBe(false);
    // The drag bubbles from the button through the header, so a listener left on the header
    // would still fire here. It is the negative control for the handle-only binding below.
    button.dispatchEvent({ type: "dragstart", bubbles: true });
    expect(startDrag).not.toHaveBeenCalled();
    handle.dispatchEvent({ type: "dragstart", bubbles: true });
    expect(startDrag).toHaveBeenCalledTimes(1);
  });
});

describe("linked embed writes", () => {
  it("creates a row on a resolved codeblock embed and records undo.createRow", async () => {
    const { harness, dataSource } = createRenderer();
    expect(harness.tableRenderer.actions.isReadOnly).toBe(false);
    harness.tableRenderer.actions.createEntry?.({ status: "Open" });
    await flushBackgroundSave();
    expect(dataSource.createNote).toHaveBeenCalled();
    expect(harness.historyStack?.[0]?.label).toBe("undo.createRow");
  });

  it("is read-only only when the source database cannot be resolved", () => {
    const { harness } = createRenderer();
    harness.currentDbConfig = undefined;
    harness.currentSourcePath = "missing.md";
    expect(harness.isViewReadOnly?.()).toBe(true);
  });
});

describe("moving a linked view", () => {
  const movedFiles = () => new Map<string, string>([
    ["from.md", "intro\n```note-database\ndbId: db1\n```\nend\n"],
    ["to.md", "other\n"],
  ]);
  const moveRequest = {
    sourcePath: "from.md",
    destPath: "to.md",
    sourceLineStart: 1,
    sourceLineEnd: 3,
    block: "```note-database\ndbId: db1\n```",
  };

  it("writes the destination first and leaves exactly one block", async () => {
    const files = movedFiles();
    const order: string[] = [];
    const adapter = {
      read: async (path: string) => files.get(path) ?? "",
      write: async (path: string, content: string) => {
        order.push(path);
        files.set(path, content);
      },
    };
    const result = await applyLinkedViewMove(adapter, moveRequest);
    expect(order[0]).toBe("to.md");
    expect(order[1]).toBe("from.md");
    expect(linkedViewBlockCount(result.sourceAfter, result.destAfter)).toBe(1);
    expect(result.destAfter).toContain("dbId: db1");
    expect(result.sourceAfter).not.toContain("```note-database");
    await undoLinkedViewMove(adapter, { ...result, sourcePath: "from.md", destPath: "to.md" });
    expect(files.get("from.md")).toBe(result.sourceBefore);
    expect(files.get("to.md")).toBe(result.destBefore);
  });

  it("re-reads both vault-shaped pages with the same linked view after moving it", async () => {
    const files = new Map<string, string>([
      ["pages/overview.md", [
        "---",
        "cssclasses: overview",
        "---",
        "# Overview",
        "",
        "The source page keeps its ordinary prose.",
        "```database-view",
        "dbPath: Databases/Tasks:2026.md",
        "viewId: board-view",
        "hideHeader: true",
        "```",
        "",
        "Source page footer.",
        "",
      ].join("\n")],
      ["pages/archive.md", [
        "---",
        "cssclasses: archive",
        "---",
        "# Archive",
        "",
        "Destination page content.",
        "",
      ].join("\n")],
    ]);
    const adapter = {
      read: async (path: string) => files.get(path) ?? "",
      write: async (path: string, content: string) => { files.set(path, content); },
    };
    await applyLinkedViewMove(adapter, {
      sourcePath: "pages/overview.md",
      destPath: "pages/archive.md",
      sourceLineStart: 6,
      sourceLineEnd: 10,
      block: "```database-view\ndbPath: Databases/Tasks:2026.md\nviewId: board-view\nhideHeader: true\n```",
      destInsertLine: 6,
    });

    const sourceAfter = await adapter.read("pages/overview.md");
    const destAfter = await adapter.read("pages/archive.md");
    const movedFence = destAfter.match(/```(?:note-database|database-view)\n[\s\S]*?\n```/);
    expect(movedFence).not.toBeNull();
    if (!movedFence) return;
    const parsed = parseLinkedViewFence(movedFence[0]);

    expect(parsed.dbPath).toBe("Databases/Tasks:2026.md");
    expect(parsed.dbId).toBeUndefined();
    expect(parsed.viewId).toBe("board-view");
    expect(parsed.viewIdPresent).toBe(true);
    expect(parsed.hideHeader).toBe(true);
    expect(sourceAfter).toContain("# Overview");
    expect(destAfter).toContain("# Archive");
    expect(linkedViewBlockCount(sourceAfter, destAfter)).toBe(1);
  });

  it("leaves a recoverable duplicate, never a loss, when the second write fails", async () => {
    const files = movedFiles();
    const before = new Map(files);
    const adapter = {
      read: async (path: string) => files.get(path) ?? "",
      write: async (path: string, content: string) => {
        if (path === "from.md") throw new Error("interrupted");
        files.set(path, content);
      },
    };
    await expect(applyLinkedViewMove(adapter, moveRequest)).rejects.toThrow("interrupted");
    expect(files.get("to.md")).toContain("dbId: db1");
    expect(files.get("from.md")).toBe(before.get("from.md"));
    expect(linkedViewBlockCount(files.get("from.md") ?? "", files.get("to.md") ?? "")).toBe(2);
  });
});

describe("creating a linked view", () => {
  it("builds a note-database fence for a newly appended view without List", () => {
    const types = getViewTypeOptions().map((option) => option.value);
    expect(types).not.toContain("list");
    expect(types).toContain("table");
    const db: DatabaseConfig = {
      id: "db1",
      name: "Tasks",
      sourceFolder: "Tasks",
      schema: { columns: [], computedFields: [] },
      views: [],
    };
    const view = appendLinkedViewToDatabase(db, "board", "By status");
    expect(db.views).toHaveLength(1);
    const fence = buildLinkedViewFence(db, view, "db.md");
    expect(fence).toContain("```note-database");
    expect(fence).toContain("dbId: db1");
    expect(fence).toContain(`viewId: ${view.id}`);
    expect(fence).not.toContain("dbPath:");
  });

  it("writes a fence the embed's own option parser reads back", () => {
    // The serialiser and the reader are separate functions, so a key renamed on
    // one side would place blocks that render as an unresolved database.
    const db: DatabaseConfig = {
      id: "db1",
      name: "Tasks",
      sourceFolder: "Tasks",
      schema: { columns: [], computedFields: [] },
      views: [],
    };
    const view = appendLinkedViewToDatabase(db, "table", "All");
    const body = buildLinkedViewFence(db, view, "db.md").split("\n").slice(1, -1).join("\n");

    const { harness } = createRenderer();
    (harness as unknown as { source: string }).source = body;
    const reference = (harness as unknown as { parseEmbeddedReference(): { dbId?: string; dbPath?: string; viewId?: string } })
      .parseEmbeddedReference();
    expect(reference.dbId).toBe("db1");
    expect(reference.viewId).toBe(view.id);
    expect(reference.dbPath).toBeUndefined();
  });
});

describe("linked-view fence round trip", () => {
  const locators = [
    { dbId: "db1" },
    { dbPath: "folder/db.md" },
  ] as const;
  const viewIds = [
    { viewId: "view-1", viewIdPresent: true },
    {},
  ] as const;
  const headers = [
    { hideHeader: true as const },
    {},
  ] as const;
  const languages = ["note-database", "database-view"] as const;

  it("round-trips the 16 canonical rows byte-identically", () => {
    let count = 0;
    for (const locator of locators) {
      for (const view of viewIds) {
        for (const header of headers) {
          for (const language of languages) {
            const fence = formatLinkedViewFence({ language, ...locator, ...view, ...header });
            expect(roundTripLinkedViewFence(fence)).toBe(fence);
            count += 1;
          }
        }
      }
    }
    expect(count).toBe(16);
  });

  it("parses a dbPath that contains a colon and keeps the locator kind", () => {
    const parsed = parseLinkedViewFence("```note-database\ndbPath: folder/db:name.md\n```");
    expect(parsed.dbPath).toBe("folder/db:name.md");
    expect(serializeLinkedViewSource(parsed)).toBe("dbPath: folder/db:name.md");
  });

  it("keeps an empty viewId key that copyCurrentViewCode writes", () => {
    const parsed = parseLinkedViewFence("```note-database\ndbId: db1\nviewId: \n```");
    expect(parsed.viewIdPresent).toBe(true);
    expect(parsed.viewId).toBe("");
    expect(roundTripLinkedViewFence("```note-database\ndbId: db1\nviewId: \n```")).toBe(
      "```note-database\ndbId: db1\nviewId: \n```",
    );
  });

  it("strips trailing whitespace on serialise", () => {
    const fence = "```database-view\ndbId: db1  \n\n```\n";
    expect(roundTripLinkedViewFence(fence)).toBe("```database-view\ndbId: db1\n```");
  });
});
