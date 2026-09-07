// ───────────────────────────────────────────────────────────────────
// MODULE:    board-renderer-hierarchy
// COMPONENT: card information hierarchy and column contract for the board renderer
// ───────────────────────────────────────────────────────────────────
//
// Drives the real BoardRenderer against a mock DOM and asserts the ported
// hierarchy: a colored column topbar, a per-card priority strip, a parent
// chip above the title, select/status values as title-row chips, and the
// meta grid holding time/tags/progress/people/due fields. The drop
// assertions pin the path-keyed transaction (cross-group, same-group
// keep-in-place, blank-space fallback) so the visual rewrite cannot narrow
// it silently.
//
// MockElement reimplements just enough of the Obsidian DOM helper surface
// (createDiv/createEl, class list, querySelector, listeners) to drive the
// renderer without a real DOM, mirroring calendar-renderer.test.ts.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi, beforeAll } from "vitest";
import { BoardGroup, BoardRenderer, BoardRendererActions } from "./board-renderer";
import { ColumnDef, RowData, ViewConfig } from "../data/types";
import type { EmptyStateOptions } from "./empty-state-renderer";
import type { App, TFile } from "obsidian";

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
}

type Listener = (event: Record<string, unknown>) => void;

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
  public title = "";
  public draggable = false;
  public tabIndex = 0;
  public attributes = new Map<string, string>();
  public style: Record<string, string> & { setProperty: (k: string, v: string) => void };
  public dataset: Record<string, string> = {};
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  public isConnected = true;
  public rect: Rect = { left: 0, right: 0, top: 0, bottom: 0 };
  public onclick: ((event: unknown) => void) | null = null;
  public ondblclick: ((event: unknown) => void) | null = null;
  public onkeydown: ((event: unknown) => void) | null = null;
  public oncontextmenu: ((event: unknown) => void) | null = null;
  public onchange: ((event: unknown) => void) | null = null;
  private listeners = new Map<string, Set<Listener>>();
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

  instanceOf(): boolean {
    return true;
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

  insertBefore(child: MockElement, ref: MockElement | null): void {
    child.parentElement = this;
    const index = ref ? this.children.indexOf(ref) : -1;
    if (index >= 0) this.children.splice(index, 0, child);
    else this.children.push(child);
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

  setCssProps(props: Record<string, string>): void {
    Object.assign(this.style, props);
  }

  setCssStyles(props: Record<string, string>): void {
    Object.assign(this.style, props);
  }

  getContext(): null {
    return null;
  }

  addEventListener(type: string, handler: Listener, _capture?: boolean): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
  }

  removeEventListener(type: string, handler: Listener, _capture?: boolean): void {
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
    // Roving focus target; nothing to do in the mock.
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

  contains(other: MockElement): boolean {
    let current: MockElement | null = other;
    while (current) {
      if (current === this) return true;
      current = current.parentElement;
    }
    return false;
  }
}

// ───────────────────────────────────────────────────────────────────
// 3. GLOBALS
// ───────────────────────────────────────────────────────────────────

beforeAll(() => {
  const fakeDoc = {
    body: new MockElement("body"),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    createElement: () => new MockElement(),
    createElementNS: (_ns: string, tag: string) => new MockElement(tag),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
  };
  (globalThis as unknown as { activeDocument: unknown }).activeDocument = fakeDoc;
  (globalThis as unknown as { window: unknown }).window = {
    activeDocument: fakeDoc,
    requestAnimationFrame: (cb: () => void) => setTimeout(cb, 0) as unknown as number,
    cancelAnimationFrame: (handle: number) => clearTimeout(handle),
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    setInterval: globalThis.setInterval.bind(globalThis),
    clearInterval: globalThis.clearInterval.bind(globalThis),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
});

// ───────────────────────────────────────────────────────────────────
// 4. FIXTURES
// ───────────────────────────────────────────────────────────────────

const COLUMNS: ColumnDef[] = [
  {
    key: "status",
    label: "Status",
    type: "status",
    statusOptions: [
      { value: "To Do", color: "gray" },
      { value: "In Progress", color: "blue" },
      { value: "Done", color: "green" },
    ],
  },
  {
    key: "priority",
    label: "Priority",
    type: "select",
    statusOptions: [
      { value: "P1", color: "red" },
      { value: "P2", color: "orange" },
      { value: "P3", color: "gray" },
    ],
  },
  { key: "hours", label: "Hours", type: "number" },
  { key: "tags", label: "Tags", type: "multi-select" },
  { key: "people", label: "People", type: "multi-select" },
  { key: "due", label: "Due", type: "date" },
  { key: "notes", label: "Notes", type: "text" },
];

const CONFIG: ViewConfig = {
  name: "Board",
  sourceFolder: "Tasks",
  viewType: "board",
  boardGroupField: "status",
  // The db-board-* vocabulary these assertions pin is the local-extension
  // layout; the default board renders the reference kanban structure
  // (covered by board-renderer-parity.test.ts).
  boardExtensionsEnabled: true,
  schema: { columns: COLUMNS, computedFields: [] },
};

function makeFile(path: string, basename: string, parentPath: string): TFile {
  return {
    path,
    name: `${basename}.md`,
    basename,
    parent: { path: parentPath },
    extension: "md",
    stat: { ctime: 0, mtime: 0, size: 0 },
  } as unknown as TFile;
}

const TODO_PATH = "Tasks/Backlog/To Do Note.md";
const DOING_PATH = "Tasks/Active/Doing Note.md";

const todoRow: RowData = {
  file: makeFile(TODO_PATH, "To Do Note", "Tasks/Backlog"),
  frontmatter: {
    status: "To Do",
    priority: "P1",
    hours: 2,
    tags: ["idea"],
    people: ["Ann"],
    due: "2026-09-05",
    notes: "Backlog note body",
  },
  computed: {},
};

const doingRow: RowData = {
  file: makeFile(DOING_PATH, "Doing Note", "Tasks/Active"),
  frontmatter: {
    status: "In Progress",
    priority: "P2",
    hours: 4,
    tags: ["wip", "deep"],
    people: ["Ann", "Bo"],
    due: "2026-09-10",
    notes: "Active note body",
  },
  computed: {},
};

const GROUPS: BoardGroup[] = [
  { key: "To Do", rows: [todoRow], count: 1 },
  { key: "In Progress", rows: [doingRow], count: 1 },
];

function createActions(overrides: Partial<BoardRendererActions> = {}): BoardRendererActions {
  return {
    openRow: vi.fn(),
    createEntry: vi.fn(),
    updateGroup: vi.fn(),
    updateGroupOrder: vi.fn(),
    updateCardOrder: vi.fn(),
    moveRowToPosition: vi.fn(),
    moveRowWithGroupUpdatesAndPosition: vi.fn(),
    updateColumnWidth: vi.fn(),
    isRowSelected: () => false,
    toggleRowSelected: vi.fn(),
    areAllRowsSelected: () => false,
    toggleRowsSelected: vi.fn(),
    editCell: vi.fn(),
    getColumns: (cfg) => COLUMNS.filter((column) => !(cfg.hiddenColumns ?? []).includes(column.key)),
    ...overrides,
  };
}

// ───────────────────────────────────────────────────────────────────
// 9. DEFAULT BOARD CARD PROPERTIES
// ───────────────────────────────────────────────────────────────────
//
// The default board renders the reference kanban card. These assertions cover
// which properties that card shows: the reference's own five slots are filled
// from the configured field list, and every other configured property renders
// beside them in the panel's order.

describe("default board card properties", () => {
  const REFERENCE_CONFIG: ViewConfig = { ...CONFIG, boardExtensionsEnabled: undefined };

  function renderReference(config: ViewConfig = REFERENCE_CONFIG): MockElement {
    const container = new MockElement("div");
    new BoardRenderer({} as unknown as App, createActions())
      .render(container as unknown as HTMLElement, config, GROUPS, "status");
    return container;
  }

  function todoCard(container: MockElement): MockElement {
    return container.querySelectorAll<MockElement>(".db-kanban-card")
      .find((card) => card.getAttribute("data-note-database-row-path") === TODO_PATH)!;
  }

  function fieldKeys(card: MockElement): Array<string | null> {
    return card.querySelectorAll<MockElement>(".db-kanban-card-meta .db-board-card-field")
      .map((field) => field.getAttribute("data-note-database-column-key"));
  }

  it("renders a configured property that fills no reference slot", () => {
    const card = todoCard(renderReference());
    expect(fieldKeys(card)).toContain("notes");
  });

  it("renders configured properties in the stored order", () => {
    const card = todoCard(renderReference({
      ...REFERENCE_CONFIG,
      boardCardFields: [
        { key: "notes", visible: true },
        { key: "priority", visible: true },
      ],
    } as ViewConfig));
    expect(fieldKeys(card)).toEqual(["notes", "priority"]);
  });

  // No dedicated slots survive the Anytype retarget: every configured property, "hours"
  // included, is an ordinary row in `db-kanban-card-meta` now, so hiding one is the same
  // stored-list mechanism every other property already goes through.
  it("drops a configured property from the row list when the stored list hides its column", () => {
    expect(fieldKeys(todoCard(renderReference()))).toContain("hours");

    const withoutHours = todoCard(renderReference({
      ...REFERENCE_CONFIG,
      boardCardFields: [
        { key: "hours", visible: false },
        { key: "tags", visible: true },
        { key: "people", visible: true },
        { key: "due", visible: true },
      ],
    } as ViewConfig));
    expect(fieldKeys(withoutHours)).not.toContain("hours");
    expect(fieldKeys(withoutHours)).toContain("tags");
  });

  it("still renders the card title with every configured property hidden", () => {
    const card = todoCard(renderReference({
      ...REFERENCE_CONFIG,
      boardCardFields: COLUMNS.map((column) => ({ key: column.key, visible: false })),
    } as ViewConfig));
    expect(card.querySelector<MockElement>(".db-kanban-card-title")?.textContent).toBe("To Do Note");
    expect(card.querySelectorAll(".db-kanban-card-meta .db-board-card-field")).toHaveLength(0);
  });

  // The reference reserves the title icon slot on every card, not only when a record-icon field
  // is mapped — the host's own gate lives in renderRowRecordIcon/renderEmbeddedRecordIcon, so the
  // renderer's own contract is that it always asks with force, and always ahead of the title.
  it("asks the host to render the title icon unconditionally, forcing past the host's own showRecordIcon gate", () => {
    const renderRecordIcon = vi.fn();
    const container = new MockElement("div");
    new BoardRenderer({} as unknown as App, createActions({ renderRecordIcon }))
      .render(container as unknown as HTMLElement, REFERENCE_CONFIG, GROUPS, "status");
    const card = todoCard(container);
    const titleRow = card.querySelector<MockElement>(".db-kanban-card-title-row");
    expect(renderRecordIcon).toHaveBeenCalledWith(titleRow, expect.anything(), REFERENCE_CONFIG, true, true);
  });
});

// ───────────────────────────────────────────────────────────────────
// 10. THE STALE-RELATION BOARD
// ───────────────────────────────────────────────────────────────────
//
// A board grouped by a property the schema no longer carries has no column to
// draw, so the view hands the renderer a reason instead of groups. These pin
// that the renderer actually renders it: the parameter was accepted and
// dropped, which left a deleted relation answered by a blank strip.

describe("board renderer stale-relation empty state", () => {
  const REFERENCE_CONFIG: ViewConfig = { ...CONFIG, boardExtensionsEnabled: undefined };

  function renderWith(groups: BoardGroup[], emptyState?: EmptyStateOptions): MockElement {
    const container = new MockElement("div");
    new BoardRenderer({} as unknown as App, createActions())
      .render(container as unknown as HTMLElement, REFERENCE_CONFIG, groups, "status", emptyState);
    return container;
  }

  const staleRelation = (onClick = () => {}): EmptyStateOptions => ({
    reason: "group-relation-deleted",
    actions: [{ label: "Open view settings", icon: "settings", primary: true, onClick }],
  });

  it("renders the inline chip when the group field's relation is gone", () => {
    const chip = renderWith([], staleRelation()).querySelector<MockElement>(".db-inline-chip");
    expect(chip).not.toBeNull();
    expect(chip?.getAttribute("data-empty-reason")).toBe("group-relation-deleted");
    expect(chip?.getAttribute("aria-live")).toBe("polite");
  });

  it("wires the chip's chevron to the reason's own action", () => {
    let opened = 0;
    const container = renderWith([], staleRelation(() => { opened += 1; }));
    const action = container.querySelector<MockElement>(".db-inline-chip-action");
    expect(action).not.toBeNull();
    action?.onclick?.({});
    expect(opened).toBe(1);
  });

  it("leaves an ordinary empty result to the card, never the chip", () => {
    const container = renderWith([], { reason: "search-empty" });
    expect(container.querySelector(".db-inline-chip")).toBeNull();
  });

  it("renders no chip while the board still has a column to draw", () => {
    const container = renderWith(GROUPS, staleRelation());
    expect(container.querySelector(".db-inline-chip")).toBeNull();
  });
});
