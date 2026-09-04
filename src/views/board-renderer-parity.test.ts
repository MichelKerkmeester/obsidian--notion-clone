// ───────────────────────────────────────────────────────────────────
// MODULE:    board-renderer-parity
// COMPONENT: DOM-structure parity against obsidian-pm's kanban board output
// ───────────────────────────────────────────────────────────────────
//
// Walks the reference's board output shape — the element tree and class
// vocabulary produced by KanbanView.renderBoard, KanbanColumn and
// KanbanCard, plus the primitives those cards compose (Chip, AvatarStack,
// Avatar, ProgressBar, timeChip, tagChip, dueChip) — and asserts our
// renderer produces the same structure for an equivalent RowData set.
// Card identity stays path-keyed here (data-note-database-row-path), the
// one deliberate addition to the reference vocabulary; the reference's
// data-task-id slot carries the same path.
//
// The structure below was taken from the reference sources, not invented:
//   src/views/KanbanView.ts:29-61        view/board/column lifecycle
//   src/ui/composites/KanbanColumn.ts:40-66, 87-114  column shell, drop language
//   src/ui/composites/KanbanCard.ts:32-99 card tree
//   src/ui/primitives/Chip.ts, AvatarStack.ts, Avatar.ts, ProgressBar.ts
//   src/ui/composites/timeChip.ts, tagChip.ts, dueChip.ts
//
// MockElement reimplements just enough of the Obsidian DOM helper surface
// to drive the renderer without a real DOM, mirroring the other renderer
// test files.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi, beforeAll } from "vitest";
import { BoardGroup, BoardRenderer, BoardRendererActions } from "./board-renderer";
import { ColumnDef, RowData, ViewConfig } from "../data/types";
import { TFile } from "obsidian";
import type { App } from "obsidian";

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
    const values = vars;
    return key.replace(/\{(\w+)\}/g, (_match: string, k: string) => String(values[k] ?? ""));
  },
  getEffectiveLocale: () => "en",
}));

// ───────────────────────────────────────────────────────────────────
// 2. MOCK DOM
// ───────────────────────────────────────────────────────────────────

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
  public attributes = new Map<string, string>();
  public style: Record<string, string> & { setProperty: (k: string, v: string) => void };
  public dataset: Record<string, string> = {};
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  public rect = { left: 0, right: 0, top: 0, bottom: 0 };
  private listeners = new Map<string, Set<Listener>>();

  constructor(tagName = "div", className = "") {
    this.tagName = tagName.toUpperCase();
    this.className = className;
    const styles: Record<string, string> = {};
    this.style = Object.assign(styles, {
      setProperty: (k: string, v: string) => { styles[k] = v; },
    });
  }

  classList = {
    add: (...classes: string[]) => { for (const cls of classes) this.addClass(cls); },
    remove: (...classes: string[]) => { for (const cls of classes) this.removeClass(cls); },
    toggle: (cls: string, force?: boolean) => { this.toggleClass(cls, force); },
    contains: (cls: string) => this.className.split(/\s+/).includes(cls),
  };

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
    if (this.parentElement) {
      const index = this.parentElement.children.indexOf(this);
      if (index >= 0) this.parentElement.children.splice(index, 1);
    }
  }

  empty(): void {
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

  getBoundingClientRect(): { left: number; right: number; top: number; bottom: number } {
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
    const walk = (node: MockElement | null): T | null => {
      if (!node) return null;
      if (matchesPart(node, selector)) return node as unknown as T;
      return walk(node.parentElement);
    };
    return walk(this);
  }
}

// ───────────────────────────────────────────────────────────────────
// 3. GLOBALS
// ───────────────────────────────────────────────────────────────────

// The node timers, captured before the fake window stands in for Obsidian's
// own; the renderer's drag handlers schedule through `window.setTimeout`.
const originalSetTimeout = setTimeout;
const originalClearTimeout = clearTimeout;

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
  vi.stubGlobal("activeDocument", fakeDoc);
  vi.stubGlobal("window", {
    activeDocument: fakeDoc,
    setTimeout: originalSetTimeout,
    clearTimeout: originalClearTimeout,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. FIXTURES
// ───────────────────────────────────────────────────────────────────

// The reference card renders: parent title, title row with type chips,
// description, time chip, tag chips, progress bar, footer with avatar
// stack and due chip. The columns below map each slot from RowData by
// column convention: progress/time from number keys, due from a date
// key, tags from the Obsidian "tags" key, people from a people key.
const COLUMNS: ColumnDef[] = [
  {
    key: "status",
    label: "Status",
    type: "status",
    statusOptions: [
      { value: "To Do", color: "blue" },
      { value: "Done", color: "green" },
    ],
  },
  { key: "progress", label: "Progress", type: "number" },
  { key: "hours", label: "Hours", type: "number" },
  { key: "due", label: "Due", type: "date" },
  { key: "tags", label: "Tags", type: "multi-select" },
  { key: "people", label: "People", type: "multi-select" },
];

const CONFIG: ViewConfig = {
  name: "Board",
  sourceFolder: "Tasks",
  viewType: "board",
  boardGroupField: "status",
  schema: { columns: COLUMNS, computedFields: [] },
};

function makeFile(path: string, basename: string, parentPath: string): TFile {
  return Object.assign(new TFile(), {
    path,
    name: `${basename}.md`,
    basename,
    parent: { path: parentPath },
    extension: "md",
    stat: { ctime: 0, mtime: 0, size: 0 },
  });
}

const PARENT_PATH = "Tasks/Parent.md";
const CHILD_PATH = "Tasks/Child.md";
const OTHER_PATH = "Tasks/Other.md";

const parentRow: RowData = {
  file: makeFile(PARENT_PATH, "Parent", "Tasks"),
  frontmatter: { status: "To Do", subtaskIds: [CHILD_PATH] },
  computed: {},
};

const childRow: RowData = {
  file: makeFile(CHILD_PATH, "Child", "Tasks"),
  frontmatter: {
    status: "To Do",
    parentId: PARENT_PATH,
    progress: 40,
    hours: 2,
    due: "2020-01-01",
    tags: ["idea"],
    people: ["Ann Bo"],
  },
  computed: {},
};

const otherRow: RowData = {
  file: makeFile(OTHER_PATH, "Other", "Tasks"),
  frontmatter: { status: "Done", due: "2099-01-01" },
  computed: {},
};

const GROUPS: BoardGroup[] = [
  { key: "To Do", rows: [parentRow, childRow], count: 2 },
  { key: "Done", rows: [otherRow], count: 1 },
];

function createActions(overrides: Partial<BoardRendererActions> = {}) {
  return {
    openRow: vi.fn<(row: RowData) => void>(),
    createEntry: vi.fn(),
    updateGroup: vi.fn(),
    updateGroupOrder: vi.fn(),
    updateCardOrder: vi.fn(),
    moveRowToPosition: vi.fn(),
    moveRowWithGroupUpdatesAndPosition: vi.fn<(row: RowData, updates: Array<{ field: string; fromGroupKey: string; toGroupKey: string }>, beforePath?: string, afterPath?: string, movedPaths?: string[]) => void | Promise<void>>(),
    updateColumnWidth: vi.fn(),
    isRowSelected: () => false,
    toggleRowSelected: vi.fn(),
    areAllRowsSelected: () => false,
    toggleRowsSelected: vi.fn(),
    editCell: vi.fn(),
    getColumns: () => COLUMNS,
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
  const board = container.querySelector<MockElement>(".pm-kanban-board")!;
  return { container, board, renderer, actions };
}

function dropEvent(path: string, fromGroup: string | undefined): Record<string, unknown> {
  return {
    type: "drop",
    clientX: 0,
    clientY: 0,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: {
      types: ["application/x-note-database-card"],
      getData: (mime: string) =>
        mime === "application/x-note-database-card" ? path
          : mime === "application/x-note-database-card-from-group" && fromGroup !== undefined ? fromGroup
          : "",
    },
  };
}

const flush = () => new Promise((resolve) => window.setTimeout(resolve, 0));

// ───────────────────────────────────────────────────────────────────
// 5. VIEW / COLUMN SHELL PARITY
// ───────────────────────────────────────────────────────────────────

describe("pm-kanban view and column shell parity", () => {
  it("renders the reference view and board wrappers", () => {
    const { container, board } = renderBoard();
    // The reference adds the view class to the container itself.
    expect(container.className).toContain("pm-kanban-view");
    expect(board).not.toBeNull();
    expect(board.parentElement).toBe(container);
  });

  it("renders one reference column per group with status data and header hierarchy", () => {
    const { board } = renderBoard();
    const columns = board.querySelectorAll<MockElement>(":scope > .pm-kanban-col");
    expect(columns).toHaveLength(2);
    expect(columns[0].getAttribute("data-status")).toBe("To Do");
    expect(columns[1].getAttribute("data-status")).toBe("Done");

    const header = columns[0].querySelector<MockElement>(":scope > .pm-kanban-col-header");
    expect(header).not.toBeNull();
    expect(header?.style["--col-color"]).toBe("blue");

    const topbar = header?.querySelector<MockElement>(":scope > .pm-kanban-col-topbar");
    expect(topbar).not.toBeNull();
    expect(topbar?.style.background).toBe("blue");

    const titleRow = header?.querySelector<MockElement>(":scope > .pm-kanban-col-title-row");
    expect(titleRow).not.toBeNull();

    const badge = titleRow?.querySelector<MockElement>(":scope > .pm-kanban-col-badge");
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toBe("To Do");
    expect(badge?.style.color).toBe("blue");
    // The reference renders no badge icon when the status has no icon.
    expect(badge?.querySelector(".pm-kanban-col-badge-icon")).toBeNull();

    const headerRight = titleRow?.querySelector<MockElement>(":scope > .pm-kanban-col-header-right");
    expect(headerRight).not.toBeNull();
    const count = headerRight?.querySelector<MockElement>(":scope > .pm-kanban-col-count");
    expect(count).not.toBeNull();
    expect(count?.textContent).toBe("2");
  });

  it("renders the cards container with the reference status data", () => {
    const { board } = renderBoard();
    const cards = board.querySelectorAll<MockElement>(".pm-kanban-cards");
    expect(cards).toHaveLength(2);
    expect(cards[0].getAttribute("data-status")).toBe("To Do");
    expect(cards[0].parentElement?.className).toBe("pm-kanban-col");
  });

  it("renders an empty column without local empty-state markup", () => {
    const emptyGroups: BoardGroup[] = [
      { key: "Done", rows: [], count: 0 },
    ];
    const renderer = new BoardRenderer({} as unknown as App, createActions());
    const container = new MockElement("div");
    renderer.render(container as unknown as HTMLElement, CONFIG, emptyGroups, "status");

    const column = container.querySelector<MockElement>(".pm-kanban-col")!;
    expect(column.querySelectorAll(".pm-kanban-card")).toHaveLength(0);
    expect(column.querySelector(".db-board-empty-slot")).toBeNull();
    const count = column.querySelector<MockElement>(".pm-kanban-col-count");
    expect(count?.textContent).toBe("0");
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. CARD TREE PARITY
// ───────────────────────────────────────────────────────────────────

describe("pm-kanban card tree parity", () => {
  function todoCard(): MockElement {
    const { board } = renderBoard();
    const cards = board.querySelectorAll<MockElement>(":scope > .pm-kanban-col")[0]
      .querySelectorAll<MockElement>(":scope > .pm-kanban-cards > .pm-kanban-card");
    return cards[1]; // the subtask row exercises every mapped slot
  }

  it("keeps card identity path-keyed in both attribute slots", () => {
    const card = todoCard();
    expect(card.getAttribute("data-task-id")).toBe(CHILD_PATH);
    expect(card.getAttribute("data-note-database-row-path")).toBe(CHILD_PATH);
    expect(card.draggable).toBe(true);
  });

  it("renders the priority bar and card body in reference order", () => {
    const card = todoCard();
    const priorityBar = card.querySelector<MockElement>(":scope > .pm-kanban-card-priority-bar");
    expect(priorityBar).not.toBeNull();
    expect(priorityBar?.style.background).toBe("blue");

    const body = card.querySelector<MockElement>(":scope > .pm-kanban-card-body");
    expect(body).not.toBeNull();
    expect(card.children.indexOf(priorityBar!)).toBeLessThan(card.children.indexOf(body!));
  });

  it("renders parent, title row, time, tags, progress and footer in body order", () => {
    const card = todoCard();
    const body = card.querySelector<MockElement>(".pm-kanban-card-body")!;

    const parent = body.querySelector<MockElement>(":scope > .pm-kanban-card-parent");
    expect(parent).not.toBeNull();
    expect(parent?.textContent).toBe("Parent");

    const titleRow = body.querySelector<MockElement>(":scope > .pm-kanban-card-title-row");
    expect(titleRow).not.toBeNull();
    const title = titleRow?.querySelector<MockElement>(":scope > .pm-kanban-card-title");
    expect(title?.textContent).toBe("Child");

    const timeChip = body.querySelector<MockElement>(":scope > .pm-chip.pm-chip--sm");
    expect(timeChip?.querySelector<MockElement>(".pm-chip-label")?.textContent).toBe("2h");

    const tags = body.querySelector<MockElement>(":scope > .pm-kanban-card-tags");
    expect(tags).not.toBeNull();

    const progress = body.querySelector<MockElement>(".pm-progress.pm-progress--sm");
    expect(progress).not.toBeNull();
    expect(progress?.querySelector(".pm-progress-track .pm-progress-fill")?.style.width).toBe("40%");

    const footer = body.querySelector<MockElement>(":scope > .pm-kanban-card-footer");
    expect(footer).not.toBeNull();

    const order = [
      parent, titleRow, timeChip, tags, progress, footer,
    ].map((el) => body.children.indexOf(el!));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("renders the subtask type chip with the reference chip vocabulary", () => {
    const card = todoCard();
    const chip = card.querySelector<MockElement>(".pm-kanban-card-title-row .pm-chip");
    expect(chip?.className).toContain("pm-chip--solid");
    expect(chip?.className).toContain("pm-chip--sm");
    expect(chip?.style["--pm-chip-color"]).toBe("var(--color-green)");
    expect(chip?.querySelector<MockElement>(".pm-chip-label")?.textContent).toBe("Sub");
  });

  it("renders tag chips with the reference outline/tag vocabulary and no dot for freeform tags", () => {
    const card = todoCard();
    const tag = card.querySelector<MockElement>(".pm-kanban-card-tags .pm-chip");
    expect(tag?.className).toContain("pm-chip--outline");
    expect(tag?.className).toContain("pm-chip--tag");
    expect(tag?.querySelector(".pm-chip-dot")).toBeNull();
    expect(tag?.querySelector<MockElement>(".pm-chip-label")?.textContent).toBe("idea");
  });

  it("renders the footer avatar stack and overdue due chip", () => {
    const card = todoCard();
    const footer = card.querySelector<MockElement>(".pm-kanban-card-footer")!;
    const stack = footer.querySelector<MockElement>(":scope > .pm-avatar-stack");
    expect(stack).not.toBeNull();
    const avatar = stack?.querySelector<MockElement>(":scope > .pm-avatar.pm-avatar--sm");
    expect(avatar).not.toBeNull();
    expect(avatar?.textContent).toBe("AB");
    expect(avatar?.style.background).toBeTruthy();

    const dueChip = footer.querySelector<MockElement>(":scope > .pm-chip");
    expect(dueChip?.className).toContain("pm-chip--solid");
    expect(dueChip?.className).toContain("pm-chip--strong");
    expect(dueChip?.style["--pm-chip-color"]).toBe("var(--color-red)");
    expect(dueChip?.querySelector<MockElement>(".pm-chip-label")?.textContent).toBeTruthy();
  });

  it("renders a plain due chip for a future date", () => {
    const { board } = renderBoard();
    const card = board.querySelectorAll<MockElement>(":scope > .pm-kanban-col")[1]
      .querySelector<MockElement>(":scope > .pm-kanban-cards > .pm-kanban-card")!;
    const dueChip = card.querySelector<MockElement>(".pm-kanban-card-footer .pm-chip")!;
    expect(dueChip.className).not.toContain("pm-chip--solid");
  });
});

// ───────────────────────────────────────────────────────────────────
// 7. INTERACTION PARITY
// ───────────────────────────────────────────────────────────────────

describe("pm-kanban interaction parity", () => {
  it("opens the note when a card is clicked", () => {
    const actions = createActions();
    const { board } = renderBoard(actions);
    const card = board.querySelectorAll<MockElement>(".pm-kanban-card")[0];
    card.dispatchEvent({ type: "click", target: card });
    expect(actions.openRow).toHaveBeenCalledTimes(1);
    expect(vi.mocked(actions.openRow).mock.calls[0][0].file.path).toBe(PARENT_PATH);
  });

  it("opens the row menu on contextmenu", () => {
    const showRowMenu = vi.fn();
    const actions = createActions({ showRowMenu });
    const { board } = renderBoard(actions);
    const card = board.querySelectorAll<MockElement>(".pm-kanban-card")[0];
    const preventDefault = vi.fn();
    card.dispatchEvent({ type: "contextmenu", preventDefault });
    expect(preventDefault).toHaveBeenCalled();
    expect(showRowMenu).toHaveBeenCalledTimes(1);
  });

  it("writes the path-keyed payload and dragging classes on dragstart", () => {
    const { board } = renderBoard();
    const card = board.querySelectorAll<MockElement>(".pm-kanban-card")[0];
    const setData = vi.fn();
    card.dispatchEvent({ type: "dragstart", dataTransfer: { setData } });
    expect(setData).toHaveBeenCalledWith("text/plain", PARENT_PATH);
    expect(setData).toHaveBeenCalledWith("application/x-note-database-card", PARENT_PATH);
    expect(card.className).toContain("pm-kanban-card--dragging");
  });

  it("adds and removes the reference drop-target class on the cards container", () => {
    const { board } = renderBoard();
    const cards = board.querySelectorAll<MockElement>(".pm-kanban-cards")[0];
    cards.dispatchEvent({
      type: "dragover",
      preventDefault: vi.fn(),
      dataTransfer: { types: ["application/x-note-database-card"], getData: () => "" },
    });
    expect(cards.className).toContain("pm-kanban-drop-target");

    cards.dispatchEvent({
      type: "dragleave",
      preventDefault: vi.fn(),
      dataTransfer: { types: ["application/x-note-database-card"], getData: () => "" },
    });
    expect(cards.className).not.toContain("pm-kanban-drop-target");
  });

  it("updates status once for a cross-column drop and refreshes via the transaction", async () => {
    const actions = createActions();
    const { board } = renderBoard(actions);
    const doneCards = board.querySelectorAll<MockElement>(".pm-kanban-cards")[1];
    doneCards.dispatchEvent(dropEvent(CHILD_PATH, "To Do"));
    await flush();

    const [movedRow, groupUpdates, beforePath, afterPath, movedPaths] =
      vi.mocked(actions.moveRowWithGroupUpdatesAndPosition).mock.calls[0];
    expect(movedRow.file.path).toBe(CHILD_PATH);
    expect(groupUpdates).toEqual([{ field: "status", fromGroupKey: "To Do", toGroupKey: "Done" }]);
    expect(beforePath).toBe(OTHER_PATH);
    expect(afterPath).toBeUndefined();
    expect(movedPaths).toEqual([CHILD_PATH]);
    expect(doneCards.className).not.toContain("pm-kanban-drop-target");
  });

  it("keeps a same-status drop in place without touching the transaction", async () => {
    const actions = createActions();
    const { board } = renderBoard(actions);
    const todoCards = board.querySelectorAll<MockElement>(".pm-kanban-cards")[0];
    todoCards.dispatchEvent(dropEvent(CHILD_PATH, "To Do"));
    await flush();

    expect(actions.moveRowWithGroupUpdatesAndPosition).not.toHaveBeenCalled();
    expect(actions.moveRowToPosition).not.toHaveBeenCalled();
  });

  // The two tests above inject `fromGroup` straight into a synthetic drop
  // event, bypassing dragstart entirely. A real drag carries one DataTransfer
  // instance from dragstart through drop, so the two tests below replay that
  // full lifecycle on one shared instance instead of a canned event.
  function realDrag(): { data: Map<string, string>; types: string[] } & Record<string, unknown> {
    const store = new Map<string, string>();
    return {
      get types() {
        return Array.from(store.keys());
      },
      setData: (mime: string, value: string) => {
        store.set(mime, value);
      },
      getData: (mime: string) => store.get(mime) ?? "",
    } as unknown as { data: Map<string, string>; types: string[] } & Record<string, unknown>;
  }

  it("moves the card across columns through a real dragstart-to-drop cycle", async () => {
    const actions = createActions();
    const { board } = renderBoard(actions);
    const todoCards = board.querySelectorAll<MockElement>(".pm-kanban-cards")[0];
    const doneCards = board.querySelectorAll<MockElement>(".pm-kanban-cards")[1];
    const card = todoCards.querySelectorAll<MockElement>(":scope > .pm-kanban-card")[1]; // child row
    const dataTransfer = realDrag();

    card.dispatchEvent({ type: "dragstart", dataTransfer });
    doneCards.dispatchEvent({ type: "drop", preventDefault: vi.fn(), dataTransfer });
    await flush();

    expect(actions.moveRowWithGroupUpdatesAndPosition).toHaveBeenCalledTimes(1);
    const [movedRow, groupUpdates] = vi.mocked(actions.moveRowWithGroupUpdatesAndPosition).mock.calls[0];
    expect(movedRow.file.path).toBe(CHILD_PATH);
    expect(groupUpdates).toEqual([{ field: "status", fromGroupKey: "To Do", toGroupKey: "Done" }]);
  });

  it("keeps a real same-column drag in place without a spurious reorder", async () => {
    const actions = createActions();
    const { board } = renderBoard(actions);
    const todoCards = board.querySelectorAll<MockElement>(".pm-kanban-cards")[0];
    const card = todoCards.querySelectorAll<MockElement>(":scope > .pm-kanban-card")[1]; // child row
    const dataTransfer = realDrag();

    card.dispatchEvent({ type: "dragstart", dataTransfer });
    todoCards.dispatchEvent({ type: "drop", preventDefault: vi.fn(), dataTransfer });
    await flush();

    expect(actions.moveRowWithGroupUpdatesAndPosition).not.toHaveBeenCalled();
    expect(actions.moveRowToPosition).not.toHaveBeenCalled();
  });
});

// ───────────────────────────────────────────────────────────────────
// 8. LAZY DESCRIPTION HYDRATION PARITY
// ───────────────────────────────────────────────────────────────────

describe("pm-kanban lazy description hydration", () => {
  it("loads descriptions after the first render and re-renders once", async () => {
    const loadRowDescription = vi.fn(async (row: RowData) => {
      if (row.file.path !== CHILD_PATH) return undefined;
      return "Body text from the note";
    });
    const actions = createActions({ loadRowDescription });
    const { container, renderer } = renderBoard(actions);

    expect(container.querySelector(".pm-kanban-card-description")).toBeNull();

    await flush();
    await flush();

    expect(loadRowDescription).toHaveBeenCalled();
    const description = container.querySelector<MockElement>(".pm-kanban-card-description");
    expect(description).not.toBeNull();
    expect(description?.textContent).toBe("Body text from the note");
    expect(renderer).toBeTruthy();
  });
});
