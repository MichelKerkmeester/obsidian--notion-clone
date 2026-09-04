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

function renderBoard(actions: BoardRendererActions = createActions()): {
  container: MockElement;
  board: MockElement;
  renderer: BoardRenderer;
  actions: BoardRendererActions;
} {
  const renderer = new BoardRenderer({} as unknown as App, actions);
  const container = new MockElement("div");
  renderer.render(container as unknown as HTMLElement, CONFIG, GROUPS, "status");
  const board = container.querySelector<MockElement>(".db-board")!;
  return { container, board, renderer, actions };
}

function dropEvent(path: string, fromGroup: string | undefined, x = 0, y = 0): Record<string, unknown> {
  const types = [CARD_MIME, ...(fromGroup !== undefined ? [CARD_FROM_GROUP_MIME] : [])];
  return {
    type: "drop",
    clientX: x,
    clientY: y,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: {
      types,
      getData: (mime: string) =>
        mime === CARD_MIME ? path
          : mime === CARD_FROM_GROUP_MIME && fromGroup !== undefined ? fromGroup
          : "",
    },
  };
}

// Mirror the renderer's MIME constants so the payload assertions read as
// the wire contract rather than magic strings.
const CARD_MIME = "application/x-note-database-card";
const CARD_FROM_GROUP_MIME = "application/x-note-database-card-from-group";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// ───────────────────────────────────────────────────────────────────
// 5. COLUMN CONTRACT
// ───────────────────────────────────────────────────────────────────

describe("board column contract", () => {
  it("renders one column per group with a colored topbar, title badge, count and cards container", () => {
    const { board } = renderBoard();

    const columns = board.querySelectorAll<MockElement>(":scope > .db-board-column");
    expect(columns).toHaveLength(2);

    const todoColumn = columns[0];
    const topbar = todoColumn.querySelector<MockElement>(".db-board-column-topbar");
    expect(topbar).not.toBeNull();
    expect(topbar?.className).toContain("status-color-gray");
    expect(topbar?.getAttribute("data-status-color")).toBe("gray");

    const inProgressColumn = columns[1];
    const inProgressTopbar = inProgressColumn.querySelector<MockElement>(".db-board-column-topbar");
    expect(inProgressTopbar?.className).toContain("status-color-blue");

    const headerText = todoColumn.querySelector<MockElement>(".db-board-header-text");
    expect(headerText).not.toBeNull();
    expect(headerText?.querySelector<MockElement>(".status-badge")?.textContent).toBe("To Do");
    expect(todoColumn.querySelector<MockElement>(".db-board-count")?.textContent).toBe("1");

    const cards = todoColumn.querySelector<MockElement>(".db-board-cards");
    expect(cards).not.toBeNull();
    expect(cards?.getAttribute("role")).toBe("rowgroup");
  });

  it("highlights the column as a drop target when a card is dragged over its cards container", () => {
    const { board } = renderBoard();
    const todoColumn = board.querySelectorAll<MockElement>(":scope > .db-board-column")[0];
    const cards = todoColumn.querySelector<MockElement>(".db-board-cards")!;
    const preventDefault = vi.fn();

    cards.dispatchEvent({
      type: "dragover",
      preventDefault,
      dataTransfer: { types: [CARD_MIME], getData: () => "" },
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(todoColumn.className).toContain("is-drop-target");
  });

  it("keeps every card path-keyed and roving-enabled inside the cards container", () => {
    const { board } = renderBoard();
    const cards = board.querySelectorAll<MockElement>(".db-board-card");
    expect(cards).toHaveLength(2);
    expect(cards[0].getAttribute("data-note-database-row-path")).toBe(TODO_PATH);
    expect(cards[1].getAttribute("data-note-database-row-path")).toBe(DOING_PATH);
    expect(cards[0].getAttribute("tabindex")).toBe("0");
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. CARD INFORMATION HIERARCHY
// ───────────────────────────────────────────────────────────────────

describe("board card information hierarchy", () => {
  it("lays out priority strip, parent chip, title, chips and meta in the card body", () => {
    const { board } = renderBoard();
    const card = board.querySelectorAll<MockElement>(".db-board-card")[0];

    const strip = card.querySelector<MockElement>(".db-board-card-priority-strip");
    expect(strip).not.toBeNull();
    expect(strip?.className).toContain("status-color-gray");
    expect(strip?.getAttribute("data-status-color")).toBe("gray");

    const body = card.querySelector<MockElement>(".db-board-card-body");
    expect(body).not.toBeNull();

    const parent = body?.querySelector<MockElement>(".db-board-card-parent");
    expect(parent).not.toBeNull();
    expect(parent?.textContent).toBe("Backlog");
    expect(parent?.title).toBe("Tasks/Backlog");

    const titleLine = body?.querySelector<MockElement>(".db-record-title-line");
    expect(titleLine).not.toBeNull();
    expect(titleLine?.querySelector<MockElement>(".db-board-card-title")).not.toBeNull();
    expect(titleLine?.querySelector<MockElement>(".db-file-title-name")?.textContent).toBe("To Do Note");

    const chips = titleLine?.querySelector<MockElement>(".db-board-card-chips");
    expect(chips).not.toBeNull();
    const chipBadge = chips?.querySelector<MockElement>(".status-badge");
    expect(chipBadge?.textContent).toBe("P1");
    expect(chipBadge?.className).toContain("status-color-red");
  });

  it("renders time, tags, progress, people and due fields through the meta grid", () => {
    const { board } = renderBoard();
    const card = board.querySelectorAll<MockElement>(".db-board-card")[1];
    const body = card.querySelector<MockElement>(".db-board-card-body")!;
    const meta = body.querySelector<MockElement>(".db-board-card-meta");
    expect(meta).not.toBeNull();

    for (const key of ["hours", "tags", "people", "due", "notes"]) {
      const field = meta?.querySelector<MockElement>(`[data-note-database-column-key='${key}']`);
      expect(field).not.toBeNull();
    }
    expect(meta?.querySelector<MockElement>(".db-board-card-badges .status-badge")).not.toBeNull();
  });

  it("keeps select/status values in the title-row chips instead of duplicating them in the meta grid", () => {
    const { board } = renderBoard();
    const card = board.querySelectorAll<MockElement>(".db-board-card")[0];
    const meta = card.querySelector<MockElement>(".db-board-card-meta");

    expect(meta?.querySelector<MockElement>("[data-note-database-column-key='priority']")).toBeNull();
  });

  it("builds the meta grid from getColumns minus title, grouped, and select/status", () => {
    const { board } = renderBoard();
    const card = board.querySelectorAll<MockElement>(".db-board-card")[0];
    const meta = card.querySelector<MockElement>(".db-board-card-meta");
    const keys = (meta?.querySelectorAll<MockElement>("[data-note-database-column-key]") ?? [])
      .map((el) => el.getAttribute("data-note-database-column-key"));

    expect(keys).not.toContain("file.name");
    expect(keys).not.toContain("status");
    expect(keys).not.toContain("priority");
    expect(keys).toEqual(["hours", "tags", "people", "due", "notes"]);
  });

  it("omits a persisted hidden column from the derived card field set", () => {
    const renderer = new BoardRenderer({} as unknown as App, createActions());
    const container = new MockElement("div");
    renderer.render(container as unknown as HTMLElement, { ...CONFIG, hiddenColumns: ["notes"] }, GROUPS, "status");
    const card = container.querySelectorAll<MockElement>(".db-board-card")[0];
    const meta = card.querySelector<MockElement>(".db-board-card-meta");

    expect(meta?.querySelector<MockElement>("[data-note-database-column-key='notes']")).toBeNull();
    expect(meta?.querySelector<MockElement>("[data-note-database-column-key='hours']")).not.toBeNull();
  });

  it("with the list absent, omits a column the host's getColumns already dropped for having no value on any row", () => {
    // getColumns() is the host's getVisibleColumns() in production, which also drops a column
    // that is empty on every row — something config.hiddenColumns alone cannot see. The derived
    // path must defer to that result rather than only checking hiddenColumns, or an upgraded
    // view with showEmptyFields on would suddenly render a field it never rendered before.
    const actions = createActions({
      getColumns: (cfg) => COLUMNS.filter((column) => column.key !== "due" && !(cfg.hiddenColumns ?? []).includes(column.key)),
    });
    const renderer = new BoardRenderer({} as unknown as App, actions);
    const container = new MockElement("div");
    renderer.render(container as unknown as HTMLElement, { ...CONFIG, showEmptyFields: true }, GROUPS, "status");
    const card = container.querySelectorAll<MockElement>(".db-board-card")[0];
    const meta = card.querySelector<MockElement>(".db-board-card-meta");

    expect(meta?.querySelector<MockElement>("[data-note-database-column-key='due']")).toBeNull();
    expect(meta?.querySelector<MockElement>("[data-note-database-column-key='hours']")).not.toBeNull();
  });

  it("renders a status column in the meta grid when the stored list makes it visible", () => {
    const config: ViewConfig = {
      ...CONFIG,
      hiddenColumns: ["notes"],
      boardCardFields: [
        { key: "status", visible: true },
        { key: "notes", visible: true },
        { key: "hours", visible: false },
      ],
    };
    const renderer = new BoardRenderer({} as unknown as App, createActions());
    const container = new MockElement("div");
    renderer.render(container as unknown as HTMLElement, config, GROUPS, "status");
    const card = container.querySelectorAll<MockElement>(".db-board-card")[0];
    const meta = card.querySelector<MockElement>(".db-board-card-meta");
    const keys = (meta?.querySelectorAll<MockElement>("[data-note-database-column-key]") ?? [])
      .map((el) => el.getAttribute("data-note-database-column-key"));

    expect(keys).toContain("status");
    expect(keys).toContain("notes");
    expect(keys).not.toContain("hours");
  });

  it("still renders a title with every stored field toggled off", () => {
    const config: ViewConfig = {
      ...CONFIG,
      boardCardFields: [
        { key: "hours", visible: false },
        { key: "tags", visible: false },
        { key: "people", visible: false },
        { key: "due", visible: false },
        { key: "notes", visible: false },
      ],
    };
    const renderer = new BoardRenderer({} as unknown as App, createActions());
    const container = new MockElement("div");
    renderer.render(container as unknown as HTMLElement, config, GROUPS, "status");
    const card = container.querySelectorAll<MockElement>(".db-board-card")[0];
    const meta = card.querySelector<MockElement>(".db-board-card-meta");

    expect(meta?.querySelectorAll<MockElement>("[data-note-database-column-key]")).toHaveLength(0);
    expect(card.querySelector<MockElement>(".db-board-card-title")).not.toBeNull();
  });

  it("omits the parent chip for a note at the vault root", () => {
    const rootRow: RowData = {
      file: makeFile("Root Note.md", "Root Note", "/"),
      frontmatter: { status: "Done", priority: "P3", hours: 0, tags: [], people: [], due: "", notes: "" },
      computed: {},
    };
    const rootGroup: BoardGroup = { key: "Done", rows: [rootRow], count: 1 };
    const renderer = new BoardRenderer({} as unknown as App, createActions());
    const rootContainer = new MockElement("div");
    renderer.render(rootContainer as unknown as HTMLElement, CONFIG, [rootGroup], "status");

    const card = rootContainer.querySelectorAll<MockElement>(".db-board-card")[0];
    expect(card.querySelector<MockElement>(".db-board-card-parent")).toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────────
// 7. DROP MATRIX (path-keyed transaction)
// ───────────────────────────────────────────────────────────────────

describe("board drop matrix stays path-keyed", () => {
  it("moves a cross-group card to the target column with its file path", async () => {
    const actions = createActions();
    const { board } = renderBoard(actions);
    const doingColumn = board.querySelectorAll<MockElement>(":scope > .db-board-column")[1];
    const doingCards = doingColumn.querySelector<MockElement>(".db-board-cards")!;

    doingCards.dispatchEvent(dropEvent(TODO_PATH, "To Do"));
    await flush();

    expect(actions.moveRowWithGroupUpdatesAndPosition).toHaveBeenCalledWith(
      expect.objectContaining({ file: expect.objectContaining({ path: TODO_PATH }) }),
      [{ field: "status", fromGroupKey: "To Do", toGroupKey: "In Progress" }],
      DOING_PATH,
      undefined,
      [TODO_PATH],
    );
  });

  it("keeps a same-group blank-space drop in place without touching the order transaction", async () => {
    const actions = createActions();
    const { board } = renderBoard(actions);
    const todoColumn = board.querySelectorAll<MockElement>(":scope > .db-board-column")[0];
    const todoCards = todoColumn.querySelector<MockElement>(".db-board-cards")!;

    todoCards.dispatchEvent(dropEvent(TODO_PATH, "To Do"));
    await flush();

    expect(actions.moveRowWithGroupUpdatesAndPosition).not.toHaveBeenCalled();
    expect(actions.moveRowToPosition).not.toHaveBeenCalled();
  });

  it("resolves a board blank-space drop to the nearest column under the pointer", async () => {
    const actions = createActions();
    const { board } = renderBoard(actions);
    const columns = board.querySelectorAll<MockElement>(":scope > .db-board-column");
    columns[0].rect = { left: 0, right: 280, top: 0, bottom: 600 };
    columns[1].rect = { left: 292, right: 572, top: 0, bottom: 600 };

    board.dispatchEvent(dropEvent(TODO_PATH, "To Do", 400, 500));
    await flush();

    expect(actions.moveRowWithGroupUpdatesAndPosition).toHaveBeenCalledWith(
      expect.objectContaining({ file: expect.objectContaining({ path: TODO_PATH }) }),
      [{ field: "status", fromGroupKey: "To Do", toGroupKey: "In Progress" }],
      DOING_PATH,
      undefined,
      [TODO_PATH],
    );
  });
});

// ───────────────────────────────────────────────────────────────────
// 7. SUBTASK HOST ACTION CONTRACT
// ───────────────────────────────────────────────────────────────────
//
// Proves the wiring contract a host implementor (database-view.ts,
// embedded-database-renderer.ts) relies on: the collapse toggle calls
// toggleSubtaskCollapsed with the row and the next state, and a host's
// isSubtaskCollapsed override actually changes what the relation renders —
// not just what it returns. The host handlers' own frontmatter-write bodies
// have no reachable test harness here (DatabaseView/EmbeddedDatabaseRenderer
// have no existing unit test file in this codebase to extend; both are
// thin compositions of already-tested primitives: toFrontmatterUpdates,
// covered in subtask-serialize.test.ts, and the plain config-object mutation
// toggleGroupCollapsed already ships untested for the same reason).

describe("board subtask host action contract", () => {
  const PARENT_PATH = "Tasks/Backlog/Parent.md";
  const CHILD_PATH = "Tasks/Backlog/Child.md";

  const parentRow: RowData = {
    file: makeFile(PARENT_PATH, "Parent", "Tasks/Backlog"),
    frontmatter: { status: "To Do", subtaskIds: [CHILD_PATH] },
    computed: {},
  };
  const childRow: RowData = {
    file: makeFile(CHILD_PATH, "Child", "Tasks/Backlog"),
    frontmatter: { status: "To Do", parentId: PARENT_PATH },
    computed: {},
  };
  const SUBTASK_GROUPS: BoardGroup[] = [{ key: "To Do", rows: [parentRow, childRow], count: 2 }];

  it("calls toggleSubtaskCollapsed with the row and the next collapsed state when the chevron is clicked", () => {
    const toggleSubtaskCollapsed = vi.fn<(row: RowData, collapsed: boolean) => void>();
    const actions = createActions({ toggleSubtaskCollapsed });
    const renderer = new BoardRenderer({} as unknown as App, actions);
    const container = new MockElement("div");
    renderer.render(container as unknown as HTMLElement, CONFIG, SUBTASK_GROUPS, "status");

    const toggle = container.querySelector<MockElement>(".db-subtask-toggle")!;
    expect(toggle).toBeTruthy();
    toggle.onclick!({ preventDefault: vi.fn(), stopPropagation: vi.fn() });

    expect(toggleSubtaskCollapsed).toHaveBeenCalledTimes(1);
    const [movedRow, nextCollapsed] = toggleSubtaskCollapsed.mock.calls[0];
    expect(movedRow.file.path).toBe(PARENT_PATH);
    expect(nextCollapsed).toBe(true);
  });

  function renderSubtaskBoard(isSubtaskCollapsed: BoardRendererActions["isSubtaskCollapsed"]): MockElement {
    const container = new MockElement("div");
    const actions = createActions({ isSubtaskCollapsed });
    new BoardRenderer({} as unknown as App, actions)
      .render(container as unknown as HTMLElement, CONFIG, SUBTASK_GROUPS, "status");
    return container;
  }

  function cardPaths(container: MockElement): Array<string | null> {
    return container
      .querySelectorAll<MockElement>(".db-board-card")
      .map((card) => card.getAttribute("data-note-database-row-path"));
  }

  it("keeps the child card visible with no collapse override", () => {
    expect(cardPaths(renderSubtaskBoard(() => undefined))).toContain(CHILD_PATH);
  });

  it("hides the child card once isSubtaskCollapsed overrides the parent to collapsed", () => {
    const paths = cardPaths(renderSubtaskBoard((row) => (row.file.path === PARENT_PATH ? true : undefined)));
    expect(paths).toContain(PARENT_PATH);
    expect(paths).not.toContain(CHILD_PATH);
  });
});
