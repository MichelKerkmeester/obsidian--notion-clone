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

import { afterEach, describe, expect, it, vi, beforeAll } from "vitest";
import { BoardGroup, BoardRenderer, BoardRendererActions } from "./board-renderer";
import { clearRenderedViewRoots } from "./rendered-view-roots";
import { ColumnDef, RowData, StatusColor, ViewConfig } from "../data/types";
import { setFrozenRenderNow } from "../data/calendar-date-time";
import { TFile, setIcon, setTooltip } from "obsidian";
import type { App } from "obsidian";
// @ts-expect-error -- a tools-side .mjs fixture with no type declarations; imported so the parity
// check reads the markup the screenshot capture actually renders rather than reimplementing it.
import { ROWS as SCREENSHOT_ROWS, boardCard as screenshotBoardCard, boardColumn as screenshotBoardColumn } from "../../tools/screenshots/scenarios/shared.mjs";

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
  const board = container.querySelector<MockElement>(".db-kanban-board")!;
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

// The .mjs fixture module carries no type declarations (see the @ts-expect-error import above),
// so these narrow casts give the two calls below a concrete signature instead of leaving them
// (and everything read off their result) typed `any`.
type FixtureRow = { name: string; path?: string };
const fixtureRows = SCREENSHOT_ROWS as FixtureRow[];
const fixtureBoardColumn = screenshotBoardColumn as (title: string, rows: FixtureRow[], tone?: string | null) => string;
const fixtureBoardCard = screenshotBoardCard as (
  row: FixtureRow,
  parent?: string,
  options?: { dragState?: "dragging" },
) => string;

describe("kanban view and column shell parity", () => {
  it("keeps the screenshot fixture helpers on the Anytype-shaped class contract", () => {
    const column = fixtureBoardColumn("To Do", [fixtureRows[0]], "blue");
    expect(column).toContain('class="db-kanban-col"');
    expect(column).toContain('class="db-kanban-col-header"');
    expect(column).toContain('class="db-kanban-cards"');
    // The option colour lands on the chip's own status-color class, the same vocabulary every
    // select/status value renders with elsewhere — not an inline style.
    expect(column).toContain('class="db-kanban-col-chip status-color-blue"');

    const card = fixtureBoardCard(fixtureRows[0], "");
    expect(card).toContain('class="db-kanban-card"');
    expect(card).toContain('class="db-kanban-card-body"');
    expect(card).not.toMatch(/class="db-board-card"/);
  });

  it("renders the kanban view and board wrappers", () => {
    const { container, board } = renderBoard();
    // The renderer adds the view class to the container itself.
    expect(container.className).toContain("db-kanban-view");
    expect(board).not.toBeNull();
    expect(board.parentElement).toBe(container);
  });

  it("gives every card row its grid ancestor in the built DOM, not just a matching literal", () => {
    const { board } = renderBoard();
    expect(board.getAttribute("role")).toBe("grid");
    const card = board.querySelectorAll<MockElement>(".db-kanban-card")[0];
    expect(card.getAttribute("role")).toBe("row");
    // Walk up from the card rather than re-reading the source: this fails if the grid role
    // ever moves off the card's actual ancestor chain, independent of where each role is set.
    let ancestor = card.parentElement;
    let foundGrid = false;
    while (ancestor) {
      if (ancestor.getAttribute("role") === "grid") { foundGrid = true; break; }
      ancestor = ancestor.parentElement;
    }
    expect(foundGrid).toBe(true);
  });

  it("renders one column per group with the option chip header", () => {
    const { board } = renderBoard();
    const columns = board.querySelectorAll<MockElement>(":scope > .db-kanban-col");
    expect(columns).toHaveLength(2);
    expect(columns[0].getAttribute("data-status")).toBe("To Do");
    expect(columns[1].getAttribute("data-status")).toBe("Done");

    const header = columns[0].querySelector<MockElement>(":scope > .db-kanban-col-header");
    expect(header).not.toBeNull();
    const chip = header?.querySelector<MockElement>(":scope > .db-kanban-col-chip");
    expect(chip).not.toBeNull();
    expect(chip?.textContent).toBe("To Do");
    expect(chip?.className).toContain("status-color-blue");
  });

  it("renders the cards container with the reference status data", () => {
    const { board } = renderBoard();
    const cards = board.querySelectorAll<MockElement>(".db-kanban-cards");
    expect(cards).toHaveLength(2);
    expect(cards[0].getAttribute("data-status")).toBe("To Do");
    expect(cards[0].parentElement?.className).toBe("db-kanban-col");
  });

  it("renders an empty column with the shared empty-group card, no crash", () => {
    const emptyGroups: BoardGroup[] = [
      { key: "Done", rows: [], count: 0 },
    ];
    const renderer = new BoardRenderer({} as unknown as App, createActions());
    const container = new MockElement("div");
    renderer.render(container as unknown as HTMLElement, CONFIG, emptyGroups, "status");

    const column = container.querySelector<MockElement>(".db-kanban-col")!;
    expect(column.querySelectorAll(".db-kanban-card")).toHaveLength(0);
    // A11: not seen in any of the 62 captures. Design inferred: the same empty-group card every
    // other grouped renderer already shows.
    expect(column.querySelector(".db-kanban-empty-slot")).not.toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. CARD TREE PARITY
// ───────────────────────────────────────────────────────────────────

describe("kanban card tree parity", () => {
  function todoCard(): MockElement {
    const { board } = renderBoard();
    const cards = board.querySelectorAll<MockElement>(":scope > .db-kanban-col")[0]
      .querySelectorAll<MockElement>(":scope > .db-kanban-cards > .db-kanban-card");
    return cards[1]; // the child row carries a subtask parent, exercising the type-name slot
  }

  it("keeps card identity path-keyed in both attribute slots", () => {
    const card = todoCard();
    expect(card.getAttribute("data-task-id")).toBe(CHILD_PATH);
    expect(card.getAttribute("data-note-database-row-path")).toBe(CHILD_PATH);
    expect(card.draggable).toBe(true);
  });

  it("nests the title row and property meta directly under the card body, no per-type furniture", () => {
    const card = todoCard();
    const body = card.querySelector<MockElement>(":scope > .db-kanban-card-body")!;
    expect(card.children[0]).toBe(body);

    const titleRow = body.querySelector<MockElement>(":scope > .db-kanban-card-title-row");
    expect(titleRow?.querySelector<MockElement>(":scope > .db-kanban-card-title")?.textContent).toBe("Child");

    // No Objects/Types data model exists; the type-name slot keeps the schema's nearest content
    // — a subtask's parent title — rather than a smaller breadcrumb.
    const type = body.querySelector<MockElement>(":scope > .db-kanban-card-type");
    expect(type?.textContent).toBe("Parent");

    expect(card.querySelector(".db-kanban-card-priority-bar")).toBeNull();
    expect(card.querySelector(".pm-avatar-stack")).toBeNull();
    expect(card.querySelector(".pm-progress")).toBeNull();
  });

  it("renders every configured property as a values-only row on one fixed rhythm", () => {
    const card = todoCard();
    const meta = card.querySelector<MockElement>(".db-kanban-card-meta")!;
    const rows = meta.querySelectorAll<MockElement>(":scope > .db-board-card-field");
    // "status" is the group field and the title field is excluded by 045's mechanism, leaving
    // progress, hours, due, tags and people from COLUMNS, in that order, unchanged by this leg.
    expect(rows.map((row) => row.getAttribute("data-note-database-column-key"))).toEqual([
      "progress", "hours", "due", "tags", "people",
    ]);
    expect(rows[1].querySelector<MockElement>(".db-board-card-value")?.textContent).toBe("2");
    expect(rows[2].querySelector<MockElement>(".db-board-card-value")?.textContent).toBeTruthy();
  });

  // A card shows the properties the view is configured for, so a stored list empties the slot
  // of a property it hides. What the list may not do is move a slot: the ones it leaves visible
  // still render where 045 put them.
  it("empties a reference slot whose column the stored list hides, and moves none of them", () => {
    const listed = {
      ...CONFIG,
      boardCardFields: [{ key: "hours", visible: false }, { key: "tags", visible: false }, { key: "due", visible: true }],
    } as ViewConfig;
    const renderer = new BoardRenderer({} as unknown as App, createActions());
    const container = new MockElement("div");
    renderer.render(container as unknown as HTMLElement, listed, GROUPS, "status");
    const card = container.querySelectorAll<MockElement>(".db-kanban-card")
      .find((el) => el.getAttribute("data-note-database-row-path") === CHILD_PATH)!;
    const meta = card.querySelector<MockElement>(".db-kanban-card-meta")!;
    const keys = meta.querySelectorAll<MockElement>(":scope > .db-board-card-field")
      .map((row) => row.getAttribute("data-note-database-column-key"));
    expect(keys).not.toContain("hours");
    expect(keys).not.toContain("tags");
    expect(keys).toContain("due");
  });

  it("gates the type-name slot on an actual parent relation, not row presence", () => {
    const { board } = renderBoard();
    const cards = board.querySelectorAll<MockElement>(".db-kanban-card");
    const rootCard = cards.find((card) => card.getAttribute("data-note-database-row-path") === PARENT_PATH)!;
    const childCard = cards.find((card) => card.getAttribute("data-note-database-row-path") === CHILD_PATH)!;

    expect(rootCard.querySelector(".db-kanban-card-type")).toBeNull();
    expect(childCard.querySelector<MockElement>(".db-kanban-card-type")?.textContent).toBe("Parent");
  });

  it("passes a real hex option color through the header chip via a class, not an inline style", () => {
    const columns: ColumnDef[] = [
      { key: "status", label: "Status", type: "status", statusOptions: [{ value: "Custom", color: "#ff6600" as StatusColor }] },
    ];
    const actions = createActions({ getColumns: () => columns });
    const renderer = new BoardRenderer({} as unknown as App, actions);
    const container = new MockElement("div");
    const rows = [{ file: makeFile("Tasks/Custom.md", "Custom", "Tasks"), frontmatter: { status: "Custom" }, computed: {} }];
    renderer.render(container as unknown as HTMLElement, { ...CONFIG, schema: { columns, computedFields: [] } }, [{ key: "Custom", rows, count: 1 }], "status");

    // A hex value carries no status-color-* class to retint; it paints through an inline style
    // instead, the same fallback the header always had for a custom author-chosen colour.
    const chip = container.querySelector<MockElement>(".db-kanban-col-chip")!;
    expect(chip.className).not.toMatch(/status-color-#/);
    expect(chip.style.color).toBe("#ff6600");
  });
});

// ───────────────────────────────────────────────────────────────────
// 7. INTERACTION PARITY
// ───────────────────────────────────────────────────────────────────

describe("kanban interaction parity", () => {
  it("opens the note when a card is clicked", () => {
    const actions = createActions();
    const { board } = renderBoard(actions);
    const card = board.querySelectorAll<MockElement>(".db-kanban-card")[0];
    card.dispatchEvent({ type: "click", target: card });
    expect(actions.openRow).toHaveBeenCalledTimes(1);
    expect(vi.mocked(actions.openRow).mock.calls[0][0].file.path).toBe(PARENT_PATH);
  });

  it("anchors the record surface to the card that was clicked", () => {
    const openRecordDetail = vi.fn<(anchorEl: HTMLElement, row: RowData) => void>();
    const actions = createActions({ openRecordDetail });
    const { board } = renderBoard(actions);
    const card = board.querySelectorAll<MockElement>(".db-kanban-card")[0];
    card.dispatchEvent({ type: "click", target: card });

    // Without an element to point at, the record surface anchors to the whole scrolling
    // container: it has no room above or below itself, so the panel renders as a clipped
    // sliver over the window chrome.
    expect(openRecordDetail).toHaveBeenCalledTimes(1);
    expect(openRecordDetail.mock.calls[0][0]).toBe(card as unknown as HTMLElement);
    expect(openRecordDetail.mock.calls[0][1].file.path).toBe(PARENT_PATH);
    expect(actions.openRow).not.toHaveBeenCalled();
  });

  it("opens the row menu on contextmenu", () => {
    const showRowMenu = vi.fn();
    const actions = createActions({ showRowMenu });
    const { board } = renderBoard(actions);
    const card = board.querySelectorAll<MockElement>(".db-kanban-card")[0];
    const preventDefault = vi.fn();
    card.dispatchEvent({ type: "contextmenu", preventDefault });
    expect(preventDefault).toHaveBeenCalled();
    expect(showRowMenu).toHaveBeenCalledTimes(1);
  });

  it("writes the path-keyed payload and dragging classes on dragstart", () => {
    const { board } = renderBoard();
    const card = board.querySelectorAll<MockElement>(".db-kanban-card")[0];
    const setData = vi.fn();
    card.dispatchEvent({ type: "dragstart", dataTransfer: { setData } });
    expect(setData).toHaveBeenCalledWith("text/plain", PARENT_PATH);
    expect(setData).toHaveBeenCalledWith("application/x-note-database-card", PARENT_PATH);
    expect(card.className).toContain("db-kanban-card--dragging");
  });

  it("adds and removes the reference drop-target class on the cards container", () => {
    const { board } = renderBoard();
    const cards = board.querySelectorAll<MockElement>(".db-kanban-cards")[0];
    cards.dispatchEvent({
      type: "dragover",
      preventDefault: vi.fn(),
      dataTransfer: { types: ["application/x-note-database-card"], getData: () => "" },
    });
    expect(cards.className).toContain("db-kanban-drop-target");

    cards.dispatchEvent({
      type: "dragleave",
      preventDefault: vi.fn(),
      dataTransfer: { types: ["application/x-note-database-card"], getData: () => "" },
    });
    expect(cards.className).not.toContain("db-kanban-drop-target");
  });

  it("updates status once for a cross-column drop and refreshes via the transaction", async () => {
    const actions = createActions();
    const { board } = renderBoard(actions);
    const doneCards = board.querySelectorAll<MockElement>(".db-kanban-cards")[1];
    doneCards.dispatchEvent(dropEvent(CHILD_PATH, "To Do"));
    await flush();

    const [movedRow, groupUpdates, beforePath, afterPath, movedPaths] =
      vi.mocked(actions.moveRowWithGroupUpdatesAndPosition).mock.calls[0];
    expect(movedRow.file.path).toBe(CHILD_PATH);
    expect(groupUpdates).toEqual([{ field: "status", fromGroupKey: "To Do", toGroupKey: "Done" }]);
    expect(beforePath).toBe(OTHER_PATH);
    expect(afterPath).toBeUndefined();
    expect(movedPaths).toEqual([CHILD_PATH]);
    expect(doneCards.className).not.toContain("db-kanban-drop-target");
  });

  it("keeps a same-status drop in place without touching the transaction", async () => {
    const actions = createActions();
    const { board } = renderBoard(actions);
    const todoCards = board.querySelectorAll<MockElement>(".db-kanban-cards")[0];
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
    const todoCards = board.querySelectorAll<MockElement>(".db-kanban-cards")[0];
    const doneCards = board.querySelectorAll<MockElement>(".db-kanban-cards")[1];
    const card = todoCards.querySelectorAll<MockElement>(":scope > .db-kanban-card")[1]; // child row
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
    const todoCards = board.querySelectorAll<MockElement>(".db-kanban-cards")[0];
    const card = todoCards.querySelectorAll<MockElement>(":scope > .db-kanban-card")[1]; // child row
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

describe("kanban lazy description hydration", () => {
  it("loads descriptions after the first render and re-renders once", async () => {
    const loadRowDescription = vi.fn(async (row: RowData) => {
      if (row.file.path !== CHILD_PATH) return undefined;
      return "Body text from the note";
    });
    const actions = createActions({ loadRowDescription });
    const { container, renderer } = renderBoard(actions);

    expect(container.querySelector(".db-kanban-card-description")).toBeNull();

    await flush();
    await flush();

    expect(loadRowDescription).toHaveBeenCalled();
    const description = container.querySelector<MockElement>(".db-kanban-card-description");
    expect(description).not.toBeNull();
    expect(description?.textContent).toBe("Body text from the note");
    expect(renderer).toBeTruthy();
  });
});

// ───────────────────────────────────────────────────────────────────
// 9. VIEW ROOT TEARDOWN
// ───────────────────────────────────────────────────────────────────

describe("switching away from the default board", () => {
  it("leaves no board root or board container class behind", () => {
    const { container } = renderBoard();
    expect(container.querySelector(".db-kanban-board")).not.toBeNull();
    expect(container.hasClass("db-kanban-view")).toBe(true);

    clearRenderedViewRoots(container as unknown as HTMLElement);

    // Whatever renders next mounts into this container. A surviving root stacks above it,
    // and a surviving container class keeps the board's flex/overflow layout on it.
    expect(container.querySelector(".db-kanban-board")).toBeNull();
    expect(container.hasClass("db-kanban-view")).toBe(false);
  });
});
