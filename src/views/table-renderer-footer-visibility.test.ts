// ───────────────────────────────────────────────────────────────────
// MODULE:    table-renderer-footer-visibility
// COMPONENT: the summary footer's presence, gated on row count
// ───────────────────────────────────────────────────────────────────
//
// Drives the real TableRenderer against a mock DOM, the same harness
// table-renderer-sort-conflict.test.ts uses: a hand-built element carrying
// just enough of the Obsidian DOM helper surface for renderTable to run to
// completion without a real document.
//
// A table with no rows has nothing to summarize, so the footer should not
// render at all rather than render a row of "+ Calculate" triggers over an
// empty body. Once a row exists, the same config renders the footer again —
// the summary configuration itself is never touched by this gate, only
// whether it is drawn.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi, beforeAll } from "vitest";
import { TableRenderer, TableRendererActions } from "./table-renderer";
import { ColumnDef, RowData, ViewConfig } from "../data/types";
import type { TFile } from "obsidian";

vi.mock("obsidian", () => ({
  setIcon: vi.fn(),
  setTooltip: vi.fn(),
  Platform: { isMobile: false, isTablet: false },
  TFile: class {},
  TFolder: class {},
  Menu: class {},
  Modal: class {},
  Notice: class {},
  Component: class {},
  Plugin: class {},
  MarkdownRenderer: { render: vi.fn() },
  normalizePath: (path: string) => path,
}));

vi.mock("../i18n", () => ({
  t: (key: string, vars?: Record<string, string | number>) => {
    if (!vars) return key;
    return key.replace(/\{(\w+)\}/g, (_match, k) => String(vars[k] ?? ""));
  },
  getEffectiveLocale: () => "en",
}));

// ───────────────────────────────────────────────────────────────────
// 2. MOCK DOM
// ───────────────────────────────────────────────────────────────────

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  height?: number;
}

interface SelectorSegment {
  part: string;
  child: boolean;
}

function parseSelector(selector: string): SelectorSegment[] {
  const tokens = selector.split(/\s+/).filter(Boolean);
  const segments: SelectorSegment[] = [];
  for (const token of tokens) {
    if (token === ">") {
      if (segments.length > 0) segments[segments.length - 1].child = true;
      continue;
    }
    segments.push({ part: token, child: false });
  }
  return segments;
}

function flattenDescendants(node: MockElement): MockElement[] {
  const out: MockElement[] = [];
  const walk = (current: MockElement) => {
    for (const child of current.children) {
      out.push(child);
      walk(child);
    }
  };
  walk(node);
  return out;
}

function matchesPart(el: MockElement, part: string): boolean {
  let rest = part;
  const tagMatch = /^[a-z][a-z0-9-]*/i.exec(rest);
  if (tagMatch) {
    if (el.tagName !== tagMatch[0].toUpperCase()) return false;
    rest = rest.slice(tagMatch[0].length);
  }
  const classRe = /\.([a-zA-Z0-9_-]+)/g;
  let classHit: RegExpExecArray | null;
  const classes = new Set(el.className.split(/\s+/).filter(Boolean));
  while ((classHit = classRe.exec(rest)) !== null) {
    if (!classes.has(classHit[1])) return false;
  }
  rest = rest.replace(classRe, "");
  const attrRe = /\[([a-zA-Z0-9_-]+)(?:='([^']*)')?\]/g;
  let attrHit: RegExpExecArray | null;
  while ((attrHit = attrRe.exec(rest)) !== null) {
    const attr = el.getAttribute(attrHit[1]);
    if (attrHit[2] === undefined) {
      if (attr === null) return false;
    } else if (attr !== attrHit[2]) {
      return false;
    }
  }
  rest = rest.replace(attrRe, "");
  return rest.trim() === "";
}

class MockElement {
  public tagName: string;
  public className: string;
  public textContent = "";
  public draggable = false;
  public disabled = false;
  public attributes = new Map<string, string>();
  public style: Record<string, string> & { setProperty: (k: string, v: string) => void };
  public dataset: Record<string, string> = {};
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  public isConnected = true;
  public rect: Rect = { left: 0, right: 0, top: 0, bottom: 0 };
  public onclick: ((event: unknown) => void) | null = null;
  public onchange: ((event: unknown) => void) | null = null;
  private listeners = new Map<string, Set<(event: Record<string, unknown>) => void>>();
  private readonly root: MockElement;

  constructor(tagName = "div", className = "", root?: MockElement) {
    this.tagName = tagName.toUpperCase();
    this.className = className;
    this.root = root ?? this;
    const styles: Record<string, string> = {};
    this.style = Object.assign(styles, {
      setProperty: (k: string, v: string) => { styles[k] = v; },
    }) as Record<string, string> & { setProperty: (k: string, v: string) => void };
  }

  classList = {
    add: (...classes: string[]) => { for (const cls of classes) this.addClass(cls); },
    remove: (...classes: string[]) => { for (const cls of classes) this.removeClass(cls); },
    toggle: (cls: string, force?: boolean) => { this.toggleClass(cls, force); },
    contains: (cls: string) => this.className.split(/\s+/).includes(cls),
  };

  get ownerDocument(): { createElement: (tag: string) => MockElement; createElementNS: (ns: string, tag: string) => MockElement; body: MockElement; defaultView: unknown } {
    return (globalThis as unknown as { activeDocument: { createElement: (tag: string) => MockElement; createElementNS: (ns: string, tag: string) => MockElement; body: MockElement; defaultView: unknown } }).activeDocument;
  }

  get firstChild(): MockElement | null {
    return this.children[0] ?? null;
  }

  createDiv(options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): MockElement {
    const cls = Array.isArray(options.cls) ? options.cls.join(" ") : options.cls || "";
    const el = new MockElement(tag, cls, this.root);
    if (options.text) el.textContent = options.text;
    if (options.attr) {
      for (const [k, v] of Object.entries(options.attr)) {
        el.setAttribute(k, v);
      }
    }
    this.appendChild(el);
    return el;
  }

  appendText(text: string): void {
    this.textContent += text;
  }

  appendChild(child: MockElement): void {
    child.parentElement = this;
    this.children.push(child);
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

  hasAttribute(name: string): boolean {
    return this.attributes.has(name);
  }

  hasClass(cls: string): boolean {
    return this.className.split(/\s+/).includes(cls);
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

  addEventListener(type: string, handler: (event: Record<string, unknown>) => void, _capture?: boolean): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
  }

  removeEventListener(type: string, handler: (event: Record<string, unknown>) => void, _capture?: boolean): void {
    this.listeners.get(type)?.delete(handler);
  }

  dispatchEvent(event: Record<string, unknown>): boolean {
    const set = this.listeners.get(event.type as string);
    if (set) {
      for (const handler of set) handler(event);
    }
    return true;
  }

  focus(): void {
    // No roving focus target exercised on this path.
  }

  getBoundingClientRect(): Rect {
    return this.rect;
  }

  querySelector<T = MockElement>(selector: string): T | null {
    const results = this.querySelectorAll<T>(selector);
    return results[0] ?? null;
  }

  querySelectorAll<T = MockElement>(selector: string): T[] {
    let scoped = false;
    let normalized = selector;
    if (normalized.startsWith(":scope > ")) {
      scoped = true;
      normalized = normalized.slice(":scope > ".length);
    }
    const segments = parseSelector(normalized);
    const results: MockElement[] = [];
    const collect = (node: MockElement, depth: number) => {
      const segment = segments[depth];
      const candidates = depth === 0 && scoped
        ? node.children
        : segment.child ? node.children : flattenDescendants(node);
      for (const el of candidates) {
        if (matchesPart(el, segment.part)) {
          if (depth === segments.length - 1) results.push(el);
          else collect(el, depth + 1);
        }
      }
    };
    collect(this, 0);
    return results as unknown as T[];
  }

  closest<T = MockElement>(selector: string): T | null {
    let current: MockElement | null = this;
    while (current) {
      if (matchesPart(current, selector)) return current as unknown as T;
      current = current.parentElement;
    }
    return null;
  }
}

// ───────────────────────────────────────────────────────────────────
// 3. GLOBALS
// ───────────────────────────────────────────────────────────────────

beforeAll(() => {
  const getComputedStyleStub = () => ({
    paddingLeft: "0px",
    paddingRight: "0px",
    overflowY: "visible",
  });
  (globalThis as unknown as { getComputedStyle: unknown }).getComputedStyle = getComputedStyleStub;
  const fakeDoc = {
    body: new MockElement("body"),
    createElement: (tag: string) => new MockElement(tag),
    createElementNS: (_ns: string, tag: string) => new MockElement(tag),
    defaultView: undefined as unknown,
  };
  const testWindow = {
    activeDocument: fakeDoc,
    getComputedStyle: getComputedStyleStub,
    requestAnimationFrame: (cb: () => void) => setTimeout(cb, 0) as unknown as number,
    cancelAnimationFrame: (handle: number) => clearTimeout(handle),
    matchMedia: undefined,
  };
  fakeDoc.defaultView = testWindow;
  (globalThis as unknown as { activeDocument: unknown }).activeDocument = fakeDoc;
  (globalThis as unknown as { window: unknown }).window = testWindow;
});

// ───────────────────────────────────────────────────────────────────
// 4. FIXTURES
// ───────────────────────────────────────────────────────────────────

const COLUMNS: ColumnDef[] = [
  { key: "priority", label: "Priority", type: "select" },
  { key: "notes", label: "Notes", type: "text" },
];

const CONFIG: ViewConfig = {
  name: "Table",
  sourceFolder: "Tasks",
  viewType: "table",
  schema: { columns: COLUMNS, computedFields: [] },
  // A real calculation, so the round trip proves the configuration survived the skip rather than
  // only that some footer came back: an empty render that dropped this rule would come back with a
  // bare "+ Calculate" hint instead of a result.
  summaryRules: [{ field: "priority", summary: "COUNT" }],
};

function makeFile(path: string, basename: string): TFile {
  return {
    path,
    name: `${basename}.md`,
    basename,
    parent: { path: "Tasks" },
    extension: "md",
    stat: { ctime: 0, mtime: 0, size: 0 },
  } as unknown as TFile;
}

const ONE_ROW: RowData[] = [
  { file: makeFile("Tasks/First.md", "First"), frontmatter: { priority: "P1", notes: "first" }, computed: {} },
];

function createActions(overrides: Partial<TableRendererActions> = {}): TableRendererActions {
  return {
    getVisibleColumns: () => COLUMNS,
    isRowSelected: () => false,
    toggleRowSelected: vi.fn(),
    areAllRowsSelected: () => false,
    toggleRowsSelected: vi.fn(),
    setupColumnHeader: vi.fn(),
    setupRow: vi.fn(),
    renderCell: vi.fn(),
    createEntry: vi.fn(),
    ...overrides,
  };
}

function renderTable(rows: RowData[], renderer = new TableRenderer(createActions())): MockElement {
  const container = new MockElement("div");
  renderer.renderTable(container as unknown as HTMLElement, CONFIG, rows);
  return container;
}

// ───────────────────────────────────────────────────────────────────
// 5. FOOTER PRESENCE GATED ON ROW COUNT
// ───────────────────────────────────────────────────────────────────

describe("table footer presence, gated on row count", () => {
  it("renders no footer over an empty table", () => {
    const container = renderTable([]);
    expect(container.querySelectorAll(".obnotion-table-footer")).toHaveLength(0);
    expect(container.querySelectorAll(".obnotion-table-footer-trigger")).toHaveLength(0);
    // The empty-state card takes the space the footer used to occupy, so the table is not left
    // with a band of controls over nothing.
    expect(container.querySelectorAll(".obnotion-empty").length).toBeGreaterThan(0);
  });

  it("renders the footer once a row exists", () => {
    const container = renderTable(ONE_ROW);
    expect(container.querySelectorAll(".obnotion-table-footer")).toHaveLength(1);
    expect(container.querySelectorAll(".obnotion-table-footer-trigger").length).toBe(COLUMNS.length);
  });

  it("brings the footer back with its calculation intact after an empty render", () => {
    const renderer = new TableRenderer(createActions());
    expect(renderTable([], renderer).querySelectorAll(".obnotion-table-footer")).toHaveLength(0);

    const container = renderTable(ONE_ROW, renderer);
    expect(container.querySelectorAll(".obnotion-table-footer")).toHaveLength(1);
    const calculated = container.querySelectorAll(".obnotion-table-footer-trigger.has-calculation");
    expect(calculated).toHaveLength(1);
    expect(container.querySelectorAll(".obnotion-table-footer-result")[0].textContent).toBe("1");
    expect(CONFIG.summaryRules).toEqual([{ field: "priority", summary: "COUNT" }]);
  });
});
