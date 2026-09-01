// ───────────────────────────────────────────────────────────────────
// MODULE:    table-record-peek.test
// COMPONENT: Unit tests for the table record-peek panel
// ───────────────────────────────────────────────────────────────────
//
// Runs against a hand-built fake DOM (see FAKE DOM below) rather than jsdom,
// since this suite's vitest environment is "node" and the module drives raw
// Element/Document/Window APIs directly.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import type { ColumnDef, RowData, ViewConfig } from "../data/types";
import {
  attachTitleOpenAffordance,
  closeTableRecordPeek,
  openTableRecordPeek,
  syncTableRecordPeek,
} from "./table-record-peek";

// ───────────────────────────────────────────────────────────────────
// 2. MOCKS
// ───────────────────────────────────────────────────────────────────

// TableRecordPeek imports FileFields, which imports obsidian for types only,
// but the real module is still resolved at runtime. Platform drives touch
// detection (isTouchDevice) and is mutable so a test can flip the affordance
// between its desktop text label and its touch icon; setIcon records the glyph
// it was asked to render.
const { platform, setIconMock } = vi.hoisted(() => ({
  platform: { isMobile: false, isTablet: false },
  setIconMock: vi.fn((el: { setAttribute(name: string, value: string): void }, icon: string) => {
    el.setAttribute("data-icon", icon);
  }),
}));
vi.mock("obsidian", () => ({
  TFile: class {},
  Platform: platform,
  setIcon: setIconMock,
}));

// i18n's t() resolves the active locale through `window`, which does not
// exist in this suite's node test environment. Identity-mapping keys keeps
// assertions readable (e.g. "panel.hiddenProperties") without pulling in a
// window/navigator stub the production code has no other reason to need.
vi.mock("../i18n", () => ({
  t: (key: string) => key,
}));

// ───────────────────────────────────────────────────────────────────
// 3. FAKE DOM
// ───────────────────────────────────────────────────────────────────

/**
 * Minimal fake DOM: TableRecordPeek drives raw Element/Document/Window APIs
 * directly (not Obsidian's createDiv-style helpers), and this project's
 * vitest environment is "node" (no jsdom). Listener registration/dispatch is
 * modeled directly rather than simulating real event bubbling, since the
 * module only ever calls its own handlers back through these targets.
 */
class FakeEventTarget {
  private listeners = new Map<string, Set<(event: unknown) => void>>();

  addEventListener(type: string, handler: (event: unknown) => void): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
  }

  removeEventListener(type: string, handler: (event: unknown) => void): void {
    this.listeners.get(type)?.delete(handler);
  }

  dispatch(type: string, event: unknown): void {
    for (const handler of [...(this.listeners.get(type) ?? [])]) handler(event);
  }

  hasListener(type: string): boolean {
    return (this.listeners.get(type)?.size ?? 0) > 0;
  }
}

class FakeElement extends FakeEventTarget {
  ownerDocument!: FakeDocument;
  parent: FakeElement | null = null;
  readonly children: FakeElement[] = [];
  type = "";
  private classes = new Set<string>();
  private attrs = new Map<string, string>();
  private text = "";

  constructor(public readonly tagName: string) {
    super();
  }

  get className(): string {
    return [...this.classes].join(" ");
  }

  set className(value: string) {
    this.classes = new Set(value.split(/\s+/).filter(Boolean));
  }

  get classList() {
    const classes = this.classes;
    return {
      add(...names: string[]): void {
        for (const name of names) classes.add(name);
      },
      toggle(name: string, force?: boolean): boolean {
        const next = force === undefined ? !classes.has(name) : force;
        if (next) classes.add(name); else classes.delete(name);
        return next;
      },
      contains(name: string): boolean {
        return classes.has(name);
      },
    };
  }

  get textContent(): string {
    return this.text;
  }

  set textContent(value: string) {
    this.text = value;
  }

  get isConnected(): boolean {
    return this.parent !== null;
  }

  get firstChild(): FakeElement | null {
    return this.children[0] ?? null;
  }

  setAttribute(name: string, value: string): void {
    this.attrs.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this.attrs.has(name) ? this.attrs.get(name)! : null;
  }

  appendChild(child: FakeElement): FakeElement {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  removeChild(child: FakeElement): void {
    const index = this.children.indexOf(child);
    if (index >= 0) this.children.splice(index, 1);
    child.parent = null;
  }

  remove(): void {
    this.parent?.removeChild(this);
  }

  contains(node: unknown): boolean {
    if (node === this) return true;
    return this.children.some((child) => child.contains(node));
  }

  querySelector(selector: string): FakeElement | null {
    const className = selector.startsWith(".") ? selector.slice(1) : selector;
    for (const child of this.children) {
      if (child.classes.has(className)) return child;
      const nested = child.querySelector(selector);
      if (nested) return nested;
    }
    return null;
  }
}

class FakeWindow extends FakeEventTarget {
  setTimeout(fn: () => void): number {
    fn();
    return 1;
  }
  clearTimeout(_id: number): void {}
}

class FakeDocument extends FakeEventTarget {
  readonly defaultView: FakeWindow;

  constructor(win: FakeWindow) {
    super();
    this.defaultView = win;
  }

  createElement(tagName: string): FakeElement {
    const element = new FakeElement(tagName);
    element.ownerDocument = this;
    return element;
  }
}

// ───────────────────────────────────────────────────────────────────
// 4. TEST HELPERS
// ───────────────────────────────────────────────────────────────────

function makeContainer(): { container: FakeElement; document: FakeDocument; win: FakeWindow } {
  const win = new FakeWindow();
  const document = new FakeDocument(win);
  const container = document.createElement("div");
  return { container, document, win };
}

function row(overrides: { path?: string; basename?: string; frontmatter?: Record<string, unknown>; computed?: Record<string, unknown> } = {}): RowData {
  return {
    file: { path: overrides.path ?? "Notes/Row.md", basename: overrides.basename ?? "Row" } as unknown as RowData["file"],
    frontmatter: overrides.frontmatter ?? {},
    computed: overrides.computed ?? {},
  };
}

/**
 * A minimal but REAL config, not `{}`.
 *
 * It was an empty object, which every test passed and no caller ever does — the panel only had to
 * survive it because nothing in the panel read the config. The first thing that needed one (the
 * display type of a column, so an option value can be badged the way every other surface badges it)
 * turned all six of these red with `Cannot read properties of undefined`. The fixture was the wrong
 * shape and the tests were agreeing with it.
 */
const config = {
  schema: { columns: [], computedFields: [] },
} as unknown as ViewConfig;

function col(overrides: Partial<ColumnDef> & Pick<ColumnDef, "key" | "label">): ColumnDef {
  return { type: "text", ...overrides } as ColumnDef;
}

function findByClass(root: FakeElement, className: string): FakeElement[] {
  const matches: FakeElement[] = [];
  for (const child of root.children) {
    if (child.className.split(/\s+/).includes(className)) matches.push(child);
    matches.push(...findByClass(child, className));
  }
  return matches;
}

// ───────────────────────────────────────────────────────────────────
// 5. TESTS
// ───────────────────────────────────────────────────────────────────

describe("TableRecordPeek visible/hidden column split", () => {
  it("keeps visible columns (minus file.name), and among hidden candidates drops only readonly/derived empty ones", () => {
    const { container } = makeContainer();
    const anchor = container.appendChild(container.ownerDocument.createElement("span"));

    const visibleColumns: ColumnDef[] = [
      col({ key: "file.name", label: "Name" }),
      col({ key: "status", label: "Status" }),
    ];
    const allColumns: ColumnDef[] = [
      ...visibleColumns,
      col({ key: "regular-empty", label: "Regular Empty" }), // not readonly/derived: always shown
      col({ key: "file.ctime", label: "Created" }), // readonly file field, empty -> dropped
      col({ key: "file.size", label: "Size" }), // readonly file field, non-empty -> shown
      col({ key: "calc-empty", label: "Calc Empty", type: "computed", computedKey: "calcEmpty" }), // derived, empty -> dropped
      col({ key: "calc-filled", label: "Calc Filled", type: "computed", computedKey: "calcFilled" }), // derived, non-empty -> shown
    ];

    const testRow = row({
      frontmatter: { status: "Open", "regular-empty": "", "file.size": 1024 },
      computed: { calcFilled: 42 },
    });

    openTableRecordPeek({
      anchor: anchor as unknown as HTMLElement,
      row: testRow,
      config,
      visibleColumns,
      allColumns,
      container: container as unknown as HTMLElement,
    });

    const panel = container.children.find((child) => child.className.includes("db-record-peek-panel"))!;
    expect(panel.getAttribute("role")).toBe("dialog");
    expect(panel.getAttribute("aria-modal")).toBe("true");

    const properties = findByClass(container, "db-record-peek-properties")[0];
    const visibleLabels = findByClass(properties, "db-record-peek-field-label").map((el) => el.textContent);
    // file.name is excluded from the visible section even though it was in visibleColumns.
    expect(visibleLabels).toEqual(["Status"]);

    const hiddenFields = findByClass(container, "db-record-peek-hidden-fields")[0];
    const hiddenLabels = findByClass(hiddenFields, "db-record-peek-field-label").map((el) => el.textContent);
    expect(hiddenLabels).toEqual(["Regular Empty", "Size", "Calc Filled"]);
    expect(hiddenLabels).not.toContain("Created");
    expect(hiddenLabels).not.toContain("Calc Empty");

    closeTableRecordPeek();
  });

  it("shows the no-properties message and skips the hidden group when nothing qualifies", () => {
    const { container } = makeContainer();
    const anchor = container.appendChild(container.ownerDocument.createElement("span"));

    openTableRecordPeek({
      anchor: anchor as unknown as HTMLElement,
      row: row(),
      config,
      visibleColumns: [col({ key: "file.name", label: "Name" })],
      allColumns: [
        col({ key: "file.name", label: "Name" }),
        col({ key: "file.ctime", label: "Created" }), // readonly + empty -> dropped
      ],
      container: container as unknown as HTMLElement,
    });

    expect(findByClass(container, "db-record-peek-empty")).toHaveLength(1);
    expect(findByClass(container, "db-record-peek-hidden-group")).toHaveLength(0);

    closeTableRecordPeek();
  });
});

describe("TableRecordPeek option values", () => {
  // The peek docks BESIDE the table, so its properties and the cells they mirror are on screen at
  // once. Writing textContent here while the cell two hundred pixels away drew a coloured badge is
  // the same record, the same column, disagreeing with itself in one glance.
  const options = [
    { value: "Design", color: "pink" },
    { value: "Business", color: "blue" },
  ];

  function openWith(column: ColumnDef, frontmatter: Record<string, unknown>) {
    const { container } = makeContainer();
    const anchor = container.appendChild(container.ownerDocument.createElement("span"));
    openTableRecordPeek({
      anchor: anchor as unknown as HTMLElement,
      row: row({ frontmatter }),
      config,
      visibleColumns: [col({ key: "file.name", label: "Name" }), column],
      allColumns: [col({ key: "file.name", label: "Name" }), column],
      container: container as unknown as HTMLElement,
    });
    return container;
  }

  it("gives a select value the badge and the colour its own option carries", () => {
    const container = openWith(
      col({ key: "category", label: "Category", type: "select", statusOptions: options } as Partial<ColumnDef> & Pick<ColumnDef, "key" | "label">),
      { category: "Design" },
    );
    const badges = findByClass(container, "status-badge");
    expect(badges).toHaveLength(1);
    expect(badges[0].textContent).toBe("Design");
    expect(badges[0].className).toContain("status-color-pink");
    expect(badges[0].getAttribute("data-status-color")).toBe("pink");
    closeTableRecordPeek();
  });

  it("falls back to grey for a value no option matches, rather than back to plain text", () => {
    // Grey is what the cell, the card and the group header all give an unregistered value. Falling
    // back to text instead would make "no option matched" look different in this one panel, which
    // is the divergence this whole change removes.
    const container = openWith(
      col({ key: "category", label: "Category", type: "select", statusOptions: options } as Partial<ColumnDef> & Pick<ColumnDef, "key" | "label">),
      { category: "Archived" },
    );
    const badges = findByClass(container, "status-badge");
    expect(badges).toHaveLength(1);
    expect(badges[0].className).toContain("status-color-gray");
    closeTableRecordPeek();
  });

  it("gives a multi-select one badge per value rather than one chip around the list", () => {
    const container = openWith(
      col({ key: "tags", label: "Tags", type: "multi-select", statusOptions: options } as Partial<ColumnDef> & Pick<ColumnDef, "key" | "label">),
      { tags: ["Design", "Business"] },
    );
    const badges = findByClass(container, "status-badge");
    expect(badges.map((b) => b.textContent)).toEqual(["Design", "Business"]);
    expect(badges[0].className).toContain("status-color-pink");
    expect(badges[1].className).toContain("status-color-blue");
    expect(findByClass(container, "db-multi-select-values")).toHaveLength(1);
    closeTableRecordPeek();
  });

  it("leaves a non-option column as text, so only option types gain a chip", () => {
    const container = openWith(col({ key: "cost", label: "Cost" }), { cost: "€ 18,75" });
    expect(findByClass(container, "status-badge")).toHaveLength(0);
    expect(findByClass(container, "db-record-peek-field-value")[0].textContent).toBe("€ 18,75");
    closeTableRecordPeek();
  });
});

describe("TableRecordPeek open/close and hidden-toggle state", () => {
  function open(overrides: { returnFocus?: () => void } = {}) {
    const { container, document, win } = makeContainer();
    const anchor = container.appendChild(container.ownerDocument.createElement("span"));
    const visibleColumns: ColumnDef[] = [col({ key: "status", label: "Status" })];
    const allColumns: ColumnDef[] = [
      ...visibleColumns,
      col({ key: "notes", label: "Notes" }),
    ];

    openTableRecordPeek({
      anchor: anchor as unknown as HTMLElement,
      row: row({ frontmatter: { status: "Open", notes: "hi" } }),
      config,
      visibleColumns,
      allColumns,
      container: container as unknown as HTMLElement,
      returnFocus: overrides.returnFocus,
    });

    const panel = container.children.find((child) => child.className.includes("db-record-peek-panel"))!;
    return { container, document, win, anchor, panel };
  }

  it("toggles the hidden-fields group open and closed on click", () => {
    const { panel } = open();
    const toggle = findByClass(panel, "db-record-peek-hidden-toggle")[0];
    const hiddenFields = findByClass(panel, "db-record-peek-hidden-fields")[0];
    const hiddenGroup = findByClass(panel, "db-record-peek-hidden-group")[0];

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(hiddenFields.classList.contains("is-hidden")).toBe(true);

    toggle.dispatch("click", { preventDefault: vi.fn(), stopPropagation: vi.fn() });
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(hiddenFields.classList.contains("is-hidden")).toBe(false);
    expect(hiddenFields.getAttribute("aria-hidden")).toBe("false");
    expect(hiddenGroup.classList.contains("is-expanded")).toBe(true);

    toggle.dispatch("click", { preventDefault: vi.fn(), stopPropagation: vi.fn() });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(hiddenFields.classList.contains("is-hidden")).toBe(true);

    closeTableRecordPeek();
  });

  it("closes on Escape (but not while IME composing) and calls returnFocus", () => {
    const returnFocus = vi.fn();
    const { document, panel, container } = open({ returnFocus });

    document.dispatch("keydown", { key: "Escape", isComposing: true, preventDefault: vi.fn() });
    expect(container.contains(panel)).toBe(true);
    expect(returnFocus).not.toHaveBeenCalled();

    document.dispatch("keydown", { key: "Escape", isComposing: false, preventDefault: vi.fn() });
    expect(container.contains(panel)).toBe(false);
    expect(panel.isConnected).toBe(false);
    expect(returnFocus).toHaveBeenCalledTimes(1);
  });

  it("closes on an outside mousedown, but not on a click inside the panel or the anchor", () => {
    const { document, panel, anchor, container } = open();
    const outsideNode = document.createElement("div");

    document.dispatch("mousedown", { target: panel.children[0] ?? panel });
    expect(container.contains(panel)).toBe(true);

    document.dispatch("mousedown", { target: anchor });
    expect(container.contains(panel)).toBe(true);

    document.dispatch("mousedown", { target: outsideNode });
    expect(container.contains(panel)).toBe(false);
  });

  it("opening a second peek replaces the first one", () => {
    const { panel: firstPanel, container: firstContainer } = open();
    const { panel: secondPanel, container: secondContainer } = open();

    expect(firstContainer.contains(firstPanel)).toBe(false);
    expect(secondContainer.contains(secondPanel)).toBe(true);

    closeTableRecordPeek();
  });
});

describe("TableRecordPeek row sync", () => {
  it("refreshes the title when the row is still present, and closes when it disappears", () => {
    const { container, document } = makeContainer();
    const anchor = container.appendChild(document.createElement("span"));
    const visibleColumns: ColumnDef[] = [col({ key: "status", label: "Status" })];
    const trackedRow = row({ path: "Notes/Tracked.md", basename: "Original" });

    openTableRecordPeek({
      anchor: anchor as unknown as HTMLElement,
      row: trackedRow,
      config,
      visibleColumns,
      allColumns: visibleColumns,
      container: container as unknown as HTMLElement,
    });

    const panel = container.children.find((child) => child.className.includes("db-record-peek-panel"))!;
    const renamedRow = row({ path: "Notes/Tracked.md", basename: "Renamed" });

    syncTableRecordPeek([renamedRow]);
    const title = findByClass(panel, "db-record-peek-title")[0];
    expect(title.textContent).toBe("Renamed");
    expect(panel.getAttribute("data-note-database-row-path")).toBe("Notes/Tracked.md");

    syncTableRecordPeek([]);
    expect(panel.isConnected).toBe(false);
  });
});

describe("attachTitleOpenAffordance", () => {
  it("marks a fallback host cell for the title-hidden path and wires one open button", () => {
    const { document } = makeContainer();
    const td = document.createElement("td");
    const open = vi.fn();
    const testRow = row();

    attachTitleOpenAffordance(td as unknown as HTMLElement, testRow, { open });
    attachTitleOpenAffordance(td as unknown as HTMLElement, testRow, { open });

    const buttons = findByClass(td, "db-record-open-btn");
    expect(buttons).toHaveLength(1);
    expect(td.classList.contains("db-record-open-host")).toBe(true);
    expect(buttons[0].getAttribute("tabindex")).toBeNull();
    expect(buttons[0].getAttribute("aria-label")).toBe("panel.open");

    buttons[0].dispatch("click", { preventDefault: vi.fn(), stopPropagation: vi.fn() });
    expect(open).toHaveBeenCalledWith(testRow);
  });

  it("renders the open affordance as a compact icon on touch, keeping the aria-label", () => {
    const { document } = makeContainer();
    const td = document.createElement("td");
    platform.isMobile = true;
    try {
      attachTitleOpenAffordance(td as unknown as HTMLElement, row(), { open: vi.fn() });
    } finally {
      platform.isMobile = false;
    }

    const button = findByClass(td, "db-record-open-btn")[0];
    expect(button.classList.contains("db-record-open-btn-icon")).toBe(true);
    expect(button.getAttribute("data-icon")).toBe("maximize-2");
    expect(button.getAttribute("aria-label")).toBe("panel.open");
    // The text label is what stole the column width on the phone; the icon must not carry it.
    expect(button.textContent).toBe("");
  });
});
