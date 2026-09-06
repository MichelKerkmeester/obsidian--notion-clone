// ───────────────────────────────────────────────────────────────────
// MODULE:    database-view-settings-landing
// COMPONENT: wall-clock proof that creating or duplicating a view lands in
//            its settings panel inside the landing budget
// ───────────────────────────────────────────────────────────────────
//
// The synchronous-call structure already proves there is no setTimeout or
// promise gap between the mutation and the settings panel opening; this
// file adds the one thing that structure alone cannot: a measured
// performance.now() reading around the real, shipped call chain —
// DatabaseView.addView/duplicateView -> openViewSettingsAfterMutation ->
// toggleHeaderPopover -> the real ViewConfigPanelRenderer — on a
// constructed mount, so the number is a measurement rather than an
// assumption.
//
// The instance is built with Object.create rather than `new`, mirroring
// tools/bench/panel-refresh-bench.ts: the constructor reaches Obsidian's
// FileView, a vault and a metadata cache, none of which exist here. Every
// method under test is the shipped prototype method; the toolbar tab-strip
// rebuild (a separately measured, already-covered surface) and the
// post-landing data refresh are the two collaborators stubbed out, so the
// clock only runs under the settings-landing path itself.

// ───────────────────────────────────────────────────────────────────
// 1. MOCKS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi, beforeAll } from "vitest";
import { DatabaseView } from "./database-view";
import { ViewConfigPanelRenderer } from "./view-config-panel-renderer";
import type { ColumnDef, DatabaseConfig, ViewConfig } from "../data/types";

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
    Menu: class {},
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
// 2. MOCK DOM
// ───────────────────────────────────────────────────────────────────
//
// Just enough of the Obsidian DOM helper surface for the real
// ViewConfigPanelRenderer to build and position its panel, mirroring the
// harness in table-renderer-sort-conflict.test.ts.

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width?: number;
  height?: number;
}

class MockElement {
  public tagName: string;
  public className: string;
  public textContent = "";
  public title = "";
  public disabled = false;
  public attributes = new Map<string, string>();
  public style: Record<string, string> & { setProperty: (k: string, v: string) => void };
  public dataset: Record<string, string> = {};
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  public isConnected = true;
  public rect: Rect = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
  public onclick: ((event: unknown) => void) | null = null;
  public onchange: ((event: unknown) => void) | null = null;
  public value = "";
  private listeners = new Map<string, Set<(event: Record<string, unknown>) => void>>();

  constructor(tagName = "div", className = "") {
    this.tagName = tagName.toUpperCase();
    this.className = className;
    const styles: Record<string, string> = {};
    this.style = Object.assign(styles, {
      setProperty: (k: string, v: string) => { styles[k] = v; },
      removeProperty: (k: string) => { delete styles[k]; },
    }) as Record<string, string> & { setProperty: (k: string, v: string) => void; removeProperty: (k: string) => void };
  }

  classList = {
    add: (...classes: string[]) => { for (const cls of classes) this.addClass(cls); },
    remove: (...classes: string[]) => { for (const cls of classes) this.removeClass(cls); },
    toggle: (cls: string, force?: boolean) => { this.toggleClass(cls, force); },
    contains: (cls: string) => this.hasClass(cls),
  };

  get ownerDocument(): FakeDoc {
    return globalActiveDocument();
  }

  createDiv(options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): MockElement {
    const cls = Array.isArray(options.cls) ? options.cls.join(" ") : options.cls || "";
    const el = new MockElement(tag, cls);
    if (options.text) el.textContent = options.text;
    if (options.attr) {
      for (const [k, v] of Object.entries(options.attr)) el.setAttribute(k, v);
    }
    this.appendChild(el);
    return el;
  }

  appendChild(child: MockElement): MockElement {
    if (child.parentElement) {
      const index = child.parentElement.children.indexOf(child);
      if (index >= 0) child.parentElement.children.splice(index, 1);
    }
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  // `buildShellHeader` moves its own leading/trailing slots — and whatever a caller's
  // `beforeClose` built — into position rather than only ever appending a fresh node, so this
  // mock needs the same move semantics `appendChild` above got for the same reason.
  insertBefore(newNode: MockElement, referenceNode: MockElement | null): MockElement {
    if (newNode.parentElement) {
      const index = newNode.parentElement.children.indexOf(newNode);
      if (index >= 0) newNode.parentElement.children.splice(index, 1);
    }
    newNode.parentElement = this;
    const at = referenceNode ? this.children.indexOf(referenceNode) : -1;
    this.children.splice(at === -1 ? this.children.length : at, 0, newNode);
    return newNode;
  }

  remove(): void {
    this.isConnected = false;
    if (this.parentElement) {
      const index = this.parentElement.children.indexOf(this);
      if (index >= 0) this.parentElement.children.splice(index, 1);
    }
  }

  empty(): void {
    for (const child of this.children) child.isConnected = false;
    this.children = [];
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  setAttr(name: string, value: string): void {
    this.setAttribute(name, value);
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  hasClass(cls: string): boolean {
    return this.className.split(/\s+/).filter(Boolean).includes(cls);
  }

  addClass(cls: string): void {
    const classes = new Set(this.className.split(/\s+/).filter(Boolean));
    classes.add(cls);
    this.className = Array.from(classes).join(" ");
  }

  removeClass(cls: string): void {
    const classes = new Set(this.className.split(/\s+/).filter(Boolean));
    classes.delete(cls);
    this.className = Array.from(classes).join(" ");
  }

  toggleClass(cls: string, force?: boolean): void {
    const classes = new Set(this.className.split(/\s+/).filter(Boolean));
    const shouldAdd = force !== undefined ? force : !classes.has(cls);
    if (shouldAdd) classes.add(cls);
    else classes.delete(cls);
    this.className = Array.from(classes).join(" ");
  }

  setText(text: string): void {
    this.textContent = text;
  }

  setCssProps(props: Record<string, string>): void {
    Object.assign(this.style, props);
  }

  setCssStyles(props: Record<string, string>): void {
    Object.assign(this.style, props);
  }

  addEventListener(type: string, handler: (event: Record<string, unknown>) => void): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
  }

  removeEventListener(type: string, handler: (event: Record<string, unknown>) => void): void {
    this.listeners.get(type)?.delete(handler);
  }

  dispatchEvent(event: Record<string, unknown>): boolean {
    const set = this.listeners.get(event.type as string);
    if (set) for (const handler of set) handler(event);
    return true;
  }

  getBoundingClientRect(): Rect {
    return this.rect;
  }

  querySelector<T = MockElement>(selector: string): T | null {
    return (this.querySelectorAll<T>(selector))[0] ?? null;
  }

  querySelectorAll<T = MockElement>(selector: string): T[] {
    const cls = selector.startsWith(".") ? selector.slice(1) : null;
    const results: MockElement[] = [];
    const walk = (node: MockElement) => {
      for (const child of node.children) {
        if (cls ? child.hasClass(cls) : false) results.push(child);
        walk(child);
      }
    };
    walk(this);
    return results as unknown as T[];
  }

  closest<T = MockElement>(selector: string): T | null {
    const cls = selector.startsWith(".") ? selector.slice(1) : selector;
    let current: MockElement | null = this;
    while (current) {
      if (current.hasClass(cls)) return current as unknown as T;
      current = current.parentElement;
    }
    return null;
  }
}

interface FakeDoc {
  body: MockElement;
  defaultView: FakeWindow;
  createElement: (tag: string) => MockElement;
  querySelector: <T = MockElement>(selector: string) => T | null;
  querySelectorAll: <T = MockElement>(selector: string) => T[];
}

interface FakeWindow {
  matchMedia?: (query: string) => { matches: boolean };
  innerWidth: number;
  innerHeight: number;
  visualViewport: undefined;
  getComputedStyle: (el: MockElement) => Record<string, string>;
  requestAnimationFrame: (cb: () => void) => number;
  cancelAnimationFrame: (handle: number) => void;
  addEventListener: (type: string, handler: (event: unknown) => void) => void;
  removeEventListener: (type: string, handler: (event: unknown) => void) => void;
}

let activeDoc: FakeDoc;

function globalActiveDocument(): FakeDoc {
  return activeDoc;
}

beforeAll(() => {
  const testWindow: FakeWindow = {
    innerWidth: 1440,
    innerHeight: 900,
    visualViewport: undefined,
    getComputedStyle: () => ({ paddingLeft: "0px", paddingRight: "0px" }),
    requestAnimationFrame: (cb: () => void) => setTimeout(cb, 0) as unknown as number,
    cancelAnimationFrame: (handle: number) => clearTimeout(handle),
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  };
  const body = new MockElement("body");
  activeDoc = {
    body,
    defaultView: testWindow,
    createElement: (tag: string) => new MockElement(tag),
    querySelector: (selector: string) => body.querySelector(selector),
    querySelectorAll: (selector: string) => body.querySelectorAll(selector),
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  } as unknown as FakeDoc;
  (globalThis as unknown as { getComputedStyle: unknown }).getComputedStyle = testWindow.getComputedStyle;
  (globalThis as unknown as { window: unknown }).window = {
    ...testWindow,
    activeDocument: activeDoc,
  };
  if (typeof (globalThis as unknown as { DOMRect?: unknown }).DOMRect === "undefined") {
    (globalThis as unknown as { DOMRect: unknown }).DOMRect = class {
      left: number;
      top: number;
      width: number;
      height: number;
      constructor(left = 0, top = 0, width = 0, height = 0) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
      }
    };
  }
});

// ───────────────────────────────────────────────────────────────────
// 3. FIXTURES
// ───────────────────────────────────────────────────────────────────

const COLUMNS: ColumnDef[] = [
  { key: "file.name", label: "Name", type: "text" },
  { key: "status", label: "Status", type: "select" },
];

function makeDb(): DatabaseConfig {
  const view: ViewConfig = {
    id: "view-1",
    name: "Table",
    sourceFolder: "Tasks",
    viewType: "table",
    schema: { columns: COLUMNS, computedFields: [] },
  };
  return {
    id: "db-1",
    name: "Tasks",
    sourceFolder: "Tasks",
    schema: { columns: COLUMNS, computedFields: [] },
    views: [view],
  } as DatabaseConfig;
}

interface Harness {
  view: DatabaseView;
  container: MockElement;
  db: DatabaseConfig;
  landedAt: number;
  viewConfigPanelRenderer: ViewConfigPanelRenderer;
}

/** A DatabaseView whose settings-landing path is the shipped prototype chain
 *  and whose toolbar rebuild and post-landing refresh are stubbed — the two
 *  collaborators that are not what this file measures. */
function makeHarness(): Harness {
  const container = new MockElement("div", "note-database-container");
  const toolbar = container.createDiv({ cls: "db-toolbar" });
  toolbar.createEl("button", { cls: "db-view-config-btn", attr: { type: "button" } });

  const db = makeDb();
  const view = Object.create(DatabaseView.prototype) as DatabaseView;
  const state = { landedAt: 0 };
  const viewConfigPanelRenderer = new ViewConfigPanelRenderer();

  Object.assign(view, {
    // ── Under test: left as the shipped prototype methods ──
    // addView, duplicateView, openViewSettingsAfterMutation,
    // toggleHeaderPopover, isHeaderPopoverVisible,
    // installHeaderPopoverAutoClose, renderViewConfigPanel,
    // getDefaultViewName, getUniqueDuplicatedViewName, clearViewStateCache.

    // ── Real collaborator: the actual settings surface ──
    viewConfigPanelRenderer,

    // ── State the routing methods read ──
    containerEl_: container,
    app: {},
    currentViewIndex: 0,
    showFilterPanel: false,
    showSortPanel: false,
    showColumnManager: false,
    showViewConfigPanel: false,
    activeHeaderPopover: undefined,
    headerPopoverAnchorEl: undefined,
    removeHeaderPopoverAutoClose: undefined,
    configSaveTimer: null,
    pendingUndoLabel: "",

    // ── Stubs: reached by the methods under test, never a landing decision ──
    getActiveDb: () => db,
    getConfig: () => db.views[(view as unknown as { currentViewIndex: number }).currentViewIndex] ?? db.views[0],
    vs: () => ({ filters: [], sortRules: [], sortColumn: undefined, hiddenColumns: new Set<string>() }),
    viewStateStore: { clear: () => undefined },
    saveCurrentViewConfigInBackground: () => undefined,
    getCurrentDatabaseMutationTarget: () => undefined,
    // The tab-strip rebuild is a separately measured, already-covered
    // surface (the toolbar family's own gate rows); stubbed so this clock
    // times the settings landing alone.
    rerenderToolbar: () => undefined,
    // The very next call the shipped path makes once landing has already
    // happened — capturing performance.now() here marks "landed" without
    // also charging this measurement for a full data refresh.
    refresh: () => { state.landedAt = performance.now(); },
    activeRulePopoverRenderer: { close: () => undefined },
    chartToolbarRenderer: { closePopover: () => undefined },
    calendarToolbarRenderer: { closePopover: () => undefined },
    filterPanelRenderer: { getPanel: () => null },
    sortPanelRenderer: { getPanel: () => null },
    columnManagerRenderer: { getPanel: () => null },
    renderFilterPanel: () => undefined,
    renderSortPanel: () => undefined,
    renderColumnManager: () => undefined,
    updateToolbarIndicators: () => undefined,
    persistVisibleHeaderPopoverState: () => undefined,
    dismissalNeedsRebuild: () => false,
    saveConfigImmediatelyInBackground: () => undefined,
  });

  return {
    view,
    container,
    db,
    get landedAt() { return state.landedAt; },
    viewConfigPanelRenderer,
  } as unknown as Harness;
}

type Routing = {
  addView(viewType: string, options?: Record<string, unknown>): void;
  duplicateView(viewIndex?: number): void;
};

const routing = (view: DatabaseView): Routing => view as unknown as Routing;

const LANDING_BUDGET_MS = 100;

// ───────────────────────────────────────────────────────────────────
// 4. MEASURED LANDING
// ───────────────────────────────────────────────────────────────────

describe("view settings landing", () => {
  it("lands in view settings inside the budget after creating a view", () => {
    const harness = makeHarness();

    const t0 = performance.now();
    routing(harness.view).addView("table");
    const elapsedMs = harness.landedAt - t0;

    const panel = harness.viewConfigPanelRenderer.getPanel();
    expect(panel).not.toBeNull();
    expect(panel?.isConnected).toBe(true);
    expect(elapsedMs).toBeGreaterThanOrEqual(0);
    expect(elapsedMs).toBeLessThanOrEqual(LANDING_BUDGET_MS);
    // eslint-disable-next-line no-console
    console.log(`view settings landing (create): ${elapsedMs.toFixed(3)}ms, budget ${LANDING_BUDGET_MS}ms`);
  });

  it("lands in view settings inside the budget after duplicating a view", () => {
    const harness = makeHarness();

    const t0 = performance.now();
    routing(harness.view).duplicateView(0);
    const elapsedMs = harness.landedAt - t0;

    const panel = harness.viewConfigPanelRenderer.getPanel();
    expect(panel).not.toBeNull();
    expect(panel?.isConnected).toBe(true);
    expect(elapsedMs).toBeGreaterThanOrEqual(0);
    expect(elapsedMs).toBeLessThanOrEqual(LANDING_BUDGET_MS);
    // eslint-disable-next-line no-console
    console.log(`view settings landing (duplicate): ${elapsedMs.toFixed(3)}ms, budget ${LANDING_BUDGET_MS}ms`);
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. DUPLICATE CONFIG EQUALITY
// ───────────────────────────────────────────────────────────────────

describe("view duplication", () => {
  it("copies every field except id and name, and never reuses the source id", () => {
    const harness = makeHarness();
    const source = harness.db.views[0];

    routing(harness.view).duplicateView(0);

    expect(harness.db.views).toHaveLength(2);
    const duplicate = harness.db.views[1];

    expect(duplicate.id).not.toBe(source.id);
    expect(duplicate.name).not.toBe(source.name);
    expect(duplicate.sourceFolder).toBe(source.sourceFolder);
    expect(duplicate.viewType).toBe(source.viewType);
    expect(duplicate.schema).toEqual(source.schema);

    const { id: _sourceId, name: _sourceName, ...sourceRest } = source;
    const { id: _duplicateId, name: _duplicateName, ...duplicateRest } = duplicate;
    expect(duplicateRest).toEqual(sourceRest);
  });
});
