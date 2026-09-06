// ───────────────────────────────────────────────────────────────────
// MODULE:    deletion-undo
// COMPONENT: the row-deletion history entry and the Undo/Redo it makes honest
// ───────────────────────────────────────────────────────────────────
//
// A deletion toast may offer Undo only when that press restores the note the row pointed at, and
// never when it would trash a different one. Constructing a real DatabaseView or
// EmbeddedDatabaseRenderer needs a live Obsidian App, workspace and metadata cache; driving the
// real prototype methods against an object whose prototype IS the class does not, and it exercises
// the whole chain — deleteRow, pushHistory, undoLastEdit, replayHistory, the deleted-entry apply
// pair and the restore/remove helpers it delegates to — against a vault double that actually holds
// bytes. Only the DOM-touching leaves (toolbar rerender, refresh) are stubbed.

// ───────────────────────────────────────────────────────────────────
// 1. MOCKS
// ───────────────────────────────────────────────────────────────────

import { beforeEach, describe, expect, it, vi } from "vitest";
import { TFile } from "obsidian";
import type { RowData } from "../data/types";
import type { ToastOptions } from "./toast";
import { DatabaseView } from "./database-view";
import { EmbeddedDatabaseRenderer } from "./embedded-database-renderer";

const notices = vi.hoisted(() => [] as string[]);

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
    Notice: class {
      constructor(message: string) {
        notices.push(message);
      }
    },
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

const raisedToasts = vi.hoisted(() => [] as ToastOptions[]);

vi.mock("./toast", () => ({
  showToast: (_doc: unknown, options: ToastOptions) => {
    raisedToasts.push(options);
    return { close: () => {} };
  },
}));

vi.mock("./modals/confirm-modal", () => ({
  confirmWithModal: vi.fn(async () => true),
}));

// ───────────────────────────────────────────────────────────────────
// 2. HARNESS
// ───────────────────────────────────────────────────────────────────

/** A vault that actually holds bytes, so "the same content came back" is a real assertion. */
class FakeVault {
  readonly files = new Map<string, string>();

  seed(path: string, content: string): TFile {
    this.files.set(path, content);
    return this.fileAt(path) as TFile;
  }

  private fileAt(path: string): TFile | null {
    if (!this.files.has(path)) return null;
    const file = new TFile();
    file.path = path;
    file.name = path.split("/").pop() ?? path;
    file.basename = file.name.replace(/\.md$/, "");
    return file;
  }

  getAbstractFileByPath(path: string): TFile | null {
    return this.fileAt(path);
  }

  async cachedRead(file: TFile): Promise<string> {
    const content = this.files.get(file.path);
    if (content === undefined) throw new Error(`no such file: ${file.path}`);
    return content;
  }

  async create(path: string, content: string): Promise<TFile> {
    if (this.files.has(path)) throw new Error(`already exists: ${path}`);
    this.files.set(path, content);
    return this.fileAt(path) as TFile;
  }
}

interface Harness {
  self: Record<string, unknown>;
  vault: FakeVault;
  trashed: string[];
  history: Array<{ type: string; file?: { path: string } }>;
}

function rowFor(vault: FakeVault, path: string): RowData {
  return { file: vault.getAbstractFileByPath(path) as TFile, frontmatter: {}, computed: {} };
}

function makeDataSource(vault: FakeVault, trashed: string[]) {
  return {
    trashNote: async (file: TFile) => {
      trashed.push(file.path);
      vault.files.delete(file.path);
    },
    markPluginWrite: vi.fn(),
  };
}

/** An object whose prototype is the real class, so every method under test is the shipped one. */
function makeStandalone(): Harness {
  const vault = new FakeVault();
  const trashed: string[] = [];
  const self = Object.create(DatabaseView.prototype) as Record<string, unknown>;
  Object.assign(self, {
    app: { vault },
    dataSource: makeDataSource(vault, trashed),
    instanceId: "test-view",
    containerEl_: { ownerDocument: {} },
    historyStack: [],
    redoStack: [],
    applyingHistory: false,
    rows: [],
    selectedRows: new Set<string>(),
    lastSelectedRowPath: null,
    pendingNewRecords: new Map<string, unknown>(),
    pendingNewFilePath: undefined,
    clearPendingNewRow: () => {},
    updateUndoAction: () => {},
    cancelPendingCellCut: () => {},
    refreshAfterSave: async () => {},
    rerenderToolbar: () => {},
  });
  return { self, vault, trashed, history: self.historyStack as Harness["history"] };
}

function makeEmbed(): Harness {
  const vault = new FakeVault();
  const trashed: string[] = [];
  const self = Object.create(EmbeddedDatabaseRenderer.prototype) as Record<string, unknown>;
  Object.assign(self, {
    app: { vault },
    dataSource: makeDataSource(vault, trashed),
    instanceId: "test-embed",
    containerEl: { ownerDocument: {} },
    historyStack: [],
    config: undefined,
    isViewReadOnly: () => false,
    renderResults: () => {},
    undoLastConfigEdit: async () => {},
  });
  return { self, vault, trashed, history: self.historyStack as Harness["history"] };
}

function invoke(self: Record<string, unknown>, name: string, ...args: unknown[]): Promise<void> {
  const fn = Object.getPrototypeOf(self)[name] as (this: unknown, ...rest: unknown[]) => Promise<void>;
  return fn.apply(self, args);
}

function pressToastUndo(): Promise<void> {
  const latest = raisedToasts[raisedToasts.length - 1];
  expect(latest?.action).toBeDefined();
  return Promise.resolve(latest.action?.onClick());
}

beforeEach(() => {
  notices.length = 0;
  raisedToasts.length = 0;
});

// ───────────────────────────────────────────────────────────────────
// 3. STANDALONE VIEW
// ───────────────────────────────────────────────────────────────────

describe("database-view row deletion", () => {
  it("restores the same path with the same bytes when Undo is pressed", async () => {
    const { self, vault, trashed } = makeStandalone();
    vault.seed("Tasks/alpha.md", "---\ntitle: alpha\n---\nbody\n");
    vault.seed("Tasks/beta.md", "beta content");

    await invoke(self, "deleteRow", rowFor(vault, "Tasks/alpha.md"));
    expect(trashed).toEqual(["Tasks/alpha.md"]);
    expect(vault.files.has("Tasks/alpha.md")).toBe(false);

    await pressToastUndo();
    expect(vault.files.get("Tasks/alpha.md")).toBe("---\ntitle: alpha\n---\nbody\n");
    expect(vault.files.get("Tasks/beta.md")).toBe("beta content");
  });

  it("offers Undo only alongside the entry it replays", async () => {
    const { self, vault, history } = makeStandalone();
    vault.seed("Tasks/alpha.md", "alpha");
    await invoke(self, "deleteRow", rowFor(vault, "Tasks/alpha.md"));
    expect(history[0]?.type).toBe("deleted");
    expect(history[0]?.file?.path).toBe("Tasks/alpha.md");
    expect(raisedToasts[raisedToasts.length - 1]?.action?.label).toBe("toolbar.undo");
  });

  it("refuses to overwrite a new file that has taken the original path, and keeps the entry", async () => {
    const { self, vault, history } = makeStandalone();
    vault.seed("Tasks/alpha.md", "the deleted one");
    await invoke(self, "deleteRow", rowFor(vault, "Tasks/alpha.md"));
    vault.seed("Tasks/alpha.md", "a different note now lives here");

    await pressToastUndo();
    expect(vault.files.get("Tasks/alpha.md")).toBe("a different note now lives here");
    expect(notices.some((message) => message.startsWith("errors.updateFailed"))).toBe(true);
    expect(history[0]?.type).toBe("deleted");
  });

  it("does not trash an unrelated note when an edit lands on top of the deletion", async () => {
    const { self, vault, trashed } = makeStandalone();
    vault.seed("Tasks/created.md", "created");
    vault.seed("Tasks/alpha.md", "alpha");
    invoke(self, "pushHistory", { type: "created", label: "undo.createRow", file: { path: "Tasks/created.md" } });
    await invoke(self, "deleteRow", rowFor(vault, "Tasks/alpha.md"));

    await invoke(self, "undoLastEdit");
    expect(vault.files.get("Tasks/alpha.md")).toBe("alpha");
    expect(vault.files.has("Tasks/created.md")).toBe(true);
    expect(trashed).toEqual(["Tasks/alpha.md"]);

    await invoke(self, "undoLastEdit");
    expect(vault.files.has("Tasks/created.md")).toBe(false);
  });

  it("declines the toast's Undo once a later entry has covered the deletion", async () => {
    const { self, vault } = makeStandalone();
    vault.seed("Tasks/alpha.md", "alpha");
    await invoke(self, "deleteRow", rowFor(vault, "Tasks/alpha.md"));
    vault.seed("Tasks/created.md", "created");
    invoke(self, "pushHistory", { type: "created", label: "undo.createRow", file: { path: "Tasks/created.md" } });

    await pressToastUndo();
    expect(vault.files.has("Tasks/created.md")).toBe(true);
    expect(vault.files.has("Tasks/alpha.md")).toBe(false);
    expect(notices).toContain("notice.undoSuperseded");
  });

  it("re-trashes exactly the restored file on Redo, and restores it again after that", async () => {
    const { self, vault, trashed } = makeStandalone();
    vault.seed("Tasks/alpha.md", "alpha");
    vault.seed("Tasks/beta.md", "beta");
    await invoke(self, "deleteRow", rowFor(vault, "Tasks/alpha.md"));
    await pressToastUndo();

    await invoke(self, "redoLastEdit");
    expect(vault.files.has("Tasks/alpha.md")).toBe(false);
    expect(vault.files.get("Tasks/beta.md")).toBe("beta");
    expect(trashed).toEqual(["Tasks/alpha.md", "Tasks/alpha.md"]);

    await invoke(self, "undoLastEdit");
    expect(vault.files.get("Tasks/alpha.md")).toBe("alpha");
  });

  it("records nothing for a multi-row delete, so no Undo is offered for one", async () => {
    const { self, vault, history } = makeStandalone();
    vault.seed("Tasks/alpha.md", "alpha");
    vault.seed("Tasks/beta.md", "beta");
    Object.assign(self, {
      rows: [rowFor(vault, "Tasks/alpha.md"), rowFor(vault, "Tasks/beta.md")],
      selectedRows: new Set(["Tasks/alpha.md", "Tasks/beta.md"]),
    });

    await invoke(self, "deleteSelectedRows");
    expect(vault.files.size).toBe(0);
    expect(history).toHaveLength(0);
    expect(raisedToasts).toHaveLength(0);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. EMBED
// ───────────────────────────────────────────────────────────────────

describe("embedded-database-renderer row deletion", () => {
  it("restores the same path with the same bytes when Undo is pressed", async () => {
    const { self, vault, trashed } = makeEmbed();
    vault.seed("Tasks/alpha.md", "alpha body");

    await invoke(self, "deleteRow", rowFor(vault, "Tasks/alpha.md"));
    expect(trashed).toEqual(["Tasks/alpha.md"]);

    await pressToastUndo();
    expect(vault.files.get("Tasks/alpha.md")).toBe("alpha body");
  });

  it("refuses to overwrite a new file that has taken the original path", async () => {
    const { self, vault, history } = makeEmbed();
    vault.seed("Tasks/alpha.md", "the deleted one");
    await invoke(self, "deleteRow", rowFor(vault, "Tasks/alpha.md"));
    vault.seed("Tasks/alpha.md", "a different note now lives here");

    await pressToastUndo();
    expect(vault.files.get("Tasks/alpha.md")).toBe("a different note now lives here");
    expect(notices.some((message) => message.startsWith("errors.updateFailed"))).toBe(true);
    expect(history[0]?.type).toBe("deleted");
  });

  it("does not trash an unrelated note when an edit lands on top of the deletion", async () => {
    const { self, vault } = makeEmbed();
    vault.seed("Tasks/created.md", "created");
    vault.seed("Tasks/alpha.md", "alpha");
    invoke(self, "pushHistory", { type: "created", label: "undo.createRow", file: { path: "Tasks/created.md" } });
    await invoke(self, "deleteRow", rowFor(vault, "Tasks/alpha.md"));

    await invoke(self, "undoLastEdit");
    expect(vault.files.get("Tasks/alpha.md")).toBe("alpha");
    expect(vault.files.has("Tasks/created.md")).toBe(true);
  });

  it("declines the toast's Undo once a later entry has covered the deletion", async () => {
    const { self, vault } = makeEmbed();
    vault.seed("Tasks/alpha.md", "alpha");
    await invoke(self, "deleteRow", rowFor(vault, "Tasks/alpha.md"));
    vault.seed("Tasks/created.md", "created");
    invoke(self, "pushHistory", { type: "created", label: "undo.createRow", file: { path: "Tasks/created.md" } });

    await pressToastUndo();
    expect(vault.files.has("Tasks/created.md")).toBe(true);
    expect(vault.files.has("Tasks/alpha.md")).toBe(false);
    expect(notices).toContain("notice.undoSuperseded");
  });
});
