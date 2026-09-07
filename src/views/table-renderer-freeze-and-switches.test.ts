// ───────────────────────────────────────────────────────────────────
// MODULE:    table-renderer-freeze-and-switches
// COMPONENT: per-column freeze, the vertical-lines switch, and the add-row noun
// ───────────────────────────────────────────────────────────────────
//
// Drives the real TableRenderer against a mock DOM, the same harness
// table-renderer-footer-visibility.test.ts uses. Three behaviours land here because none of them
// needs a real browser to prove: computeFrozenLayout's own arithmetic, the scroll-listener wiring
// that toggles is-scrolled-x (including the grouped path, whose listener has to bind to the
// element that actually scrolls rather than to the outer container), the vertical-lines class
// gate, and the add-row button's per-view noun. The frozen column's *visual* claims — the
// position: sticky computed style and the shadow's contrast in each theme — need real CSS and
// stay with render-assertions.mjs, which runs in a real browser.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & MOCK DOM
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi, beforeAll } from "vitest";
import { TableRenderer, TableRendererActions, TableGroup } from "./table-renderer";
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

class MockElement {
  public tagName: string;
  public className: string;
  public textContent = "";
  public attributes = new Map<string, string>();
  public style: Record<string, string> & { setProperty: (k: string, v: string) => void };
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  public isConnected = true;
  public rect = { left: 0, right: 0, top: 0, bottom: 0 };
  public onclick: ((event: unknown) => void) | null = null;
  // The one property this suite's own freeze scenario needs beyond footer-visibility's copy: the
  // scroll listener setupFrozenScrollTracking binds reads this directly, and a real element's own
  // scrollLeft is exactly the thing under test here.
  public scrollLeft = 0;
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
      for (const [k, v] of Object.entries(options.attr)) el.setAttribute(k, v);
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

  /** Fires the same "scroll" listener a real scroll would — this suite's stand-in for a browser
   *  actually moving the scrollbar and dispatching the event itself. */
  fireScroll(): void {
    this.dispatchEvent({ type: "scroll" });
  }

  getBoundingClientRect() {
    return this.rect;
  }

  querySelectorAll<T = MockElement>(selector: string): T[] {
    const out: MockElement[] = [];
    const parts = selector.split(",").map((part) => part.trim());
    const walk = (node: MockElement) => {
      for (const child of node.children) {
        for (const part of parts) {
          const cls = part.startsWith(".") ? part.slice(1) : null;
          if (cls ? child.hasClass(cls) : child.tagName === part.toUpperCase()) {
            out.push(child);
            break;
          }
        }
        walk(child);
      }
    };
    walk(this);
    return out as unknown as T[];
  }

  querySelector<T = MockElement>(selector: string): T | null {
    return this.querySelectorAll<T>(selector)[0] ?? null;
  }
}

// ───────────────────────────────────────────────────────────────────
// 2. GLOBALS
// ───────────────────────────────────────────────────────────────────

beforeAll(() => {
  const getComputedStyleStub = () => ({ paddingLeft: "0px", paddingRight: "0px", overflowY: "visible" });
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
// 3. FIXTURES
// ───────────────────────────────────────────────────────────────────

const COLUMNS: ColumnDef[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "cost", label: "Cost", type: "text" },
  { key: "billing", label: "Billing", type: "text" },
];

function makeFile(path: string, basename: string): TFile {
  return { path, name: `${basename}.md`, basename, parent: { path: "Subs" }, extension: "md", stat: { ctime: 0, mtime: 0, size: 0 } } as unknown as TFile;
}

const ROWS: RowData[] = [
  { file: makeFile("Subs/Adobe.md", "Adobe"), frontmatter: { name: "Adobe", cost: "55", billing: "Monthly" }, computed: {} },
  { file: makeFile("Subs/Figma.md", "Figma"), frontmatter: { name: "Figma", cost: "15", billing: "Monthly" }, computed: {} },
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

function config(over: Partial<ViewConfig> = {}): ViewConfig {
  return {
    name: "Subscriptions",
    sourceFolder: "Subs",
    viewType: "table",
    schema: { columns: COLUMNS, computedFields: [] },
    ...over,
  } as ViewConfig;
}

// ───────────────────────────────────────────────────────────────────
// 4. PER-COLUMN FREEZE — LEFT OFFSET AND THE UNFREEZE CONTROL
// ───────────────────────────────────────────────────────────────────

describe("TableRenderer per-column freeze", () => {
  it("computes the frozen offset from the preceding frozen columns' real widths, within 1px", () => {
    const container = new MockElement("div");
    const renderer = new TableRenderer(createActions());
    // The menu freezes "up to and including" a column (column-menu.ts), so the second column being
    // frozen always carries the first with it — this is the case that exercises the offset math,
    // since a lone middle column would never accumulate any preceding width to sum.
    renderer.renderTable(container as unknown as HTMLElement, config({ columnWidths: { name: 180 }, frozenColumnKeys: ["name", "cost"] }), ROWS);

    const frozen = container.querySelectorAll(".obnotion-frozen-col");
    // Two th plus two td per row (name, cost): the header cells and both body rows' two cells.
    expect(frozen.length).toBe(2 + 2 * ROWS.length);
    const nameCells = frozen.filter((el) => el.getAttribute("data-obnotion-column-key") === "name");
    expect(nameCells).toHaveLength(1 + ROWS.length);
    for (const cell of nameCells) {
      expect(cell.style["--obnotion-frozen-left"]).toBe("0px");
      expect(cell.hasClass("obnotion-frozen-col-last")).toBe(false);
    }
    const costTh = container.querySelectorAll("th").find((el) => el.getAttribute("data-obnotion-column-key") === "cost")!;
    expect(costTh.hasClass("obnotion-frozen-col")).toBe(true);
    // The last frozen column's own left is the sum of the preceding frozen columns — "name" alone
    // here — read off the real column width the config carries, not a hardcoded value.
    expect(costTh.style["--obnotion-frozen-left"]).toBe("180px");
    expect(costTh.hasClass("obnotion-frozen-col-last")).toBe(true);
  });

  it("collapses the offset to 0 once the column is unfrozen", () => {
    const container = new MockElement("div");
    const renderer = new TableRenderer(createActions());
    renderer.renderTable(container as unknown as HTMLElement, config({ columnWidths: { name: 180 }, frozenColumnKeys: ["name", "cost"] }), ROWS);
    expect(container.querySelectorAll(".obnotion-frozen-col").length).toBeGreaterThan(0);

    renderer.renderTable(container as unknown as HTMLElement, config({ columnWidths: { name: 180 }, frozenColumnKeys: [] }), ROWS);
    expect(container.querySelectorAll(".obnotion-frozen-col")).toHaveLength(0);
  });

  it("leaves a stale frozen key inert rather than fatal when the column no longer exists", () => {
    const container = new MockElement("div");
    const renderer = new TableRenderer(createActions());
    expect(() => renderer.renderTable(
      container as unknown as HTMLElement,
      config({ frozenColumnKeys: ["retired-column"] }),
      ROWS,
    )).not.toThrow();
    expect(container.querySelectorAll(".obnotion-frozen-col")).toHaveLength(0);
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. is-scrolled-x — UNGROUPED AND GROUPED
// ───────────────────────────────────────────────────────────────────

describe("TableRenderer toggles is-scrolled-x on the element that actually scrolls", () => {
  it("binds the scroll listener to the container itself in the ungrouped table", () => {
    const container = new MockElement("div");
    const renderer = new TableRenderer(createActions());
    renderer.renderTable(container as unknown as HTMLElement, config({ frozenColumnKeys: ["cost"] }), ROWS);

    expect(container.hasClass("is-scrolled-x")).toBe(false);
    container.scrollLeft = 40;
    container.fireScroll();
    expect(container.hasClass("is-scrolled-x")).toBe(true);
    container.scrollLeft = 0;
    container.fireScroll();
    expect(container.hasClass("is-scrolled-x")).toBe(false);
  });

  it("binds the scroll listener to .obnotion-grouped-table, the element with the overflow, not the outer container", () => {
    const outer = new MockElement("div");
    const renderer = new TableRenderer(createActions());
    const groups: TableGroup[] = [{ key: "all", rows: ROWS, count: ROWS.length, depth: 0, field: "billing" }];
    renderer.renderGroupedTable(outer as unknown as HTMLElement, config({ frozenColumnKeys: ["cost"] }), ROWS, groups, "billing");

    const grouped = outer.querySelectorAll(".obnotion-grouped-table")[0]!;
    // The regression this pins: scroll does not bubble, so a listener left on `outer` would never
    // see this and the class would never move — which is exactly the defect the grouped path
    // shipped with (the listener bound to the outer container instead of .obnotion-grouped-table).
    grouped.scrollLeft = 40;
    grouped.fireScroll();
    expect(outer.hasClass("is-scrolled-x")).toBe(true);
    expect(grouped.hasClass("is-scrolled-x")).toBe(false);

    grouped.scrollLeft = 0;
    grouped.fireScroll();
    expect(outer.hasClass("is-scrolled-x")).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. SHOW VERTICAL LINES
// ───────────────────────────────────────────────────────────────────

describe("TableRenderer's obnotion-no-vertical-lines gate", () => {
  it("adds the class when the view switch is off", () => {
    const container = new MockElement("div");
    new TableRenderer(createActions()).renderTable(container as unknown as HTMLElement, config({ showVerticalLines: false }), ROWS);
    expect(container.querySelectorAll("table")[0]!.hasClass("obnotion-no-vertical-lines")).toBe(true);
  });

  it("leaves the class off when the switch is on or unset", () => {
    const onContainer = new MockElement("div");
    new TableRenderer(createActions()).renderTable(onContainer as unknown as HTMLElement, config({ showVerticalLines: true }), ROWS);
    expect(onContainer.querySelectorAll("table")[0]!.hasClass("obnotion-no-vertical-lines")).toBe(false);

    const unsetContainer = new MockElement("div");
    new TableRenderer(createActions()).renderTable(unsetContainer as unknown as HTMLElement, config(), ROWS);
    expect(unsetContainer.querySelectorAll("table")[0]!.hasClass("obnotion-no-vertical-lines")).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────
// 7. THE PER-VIEW ADD-ROW NOUN
// ───────────────────────────────────────────────────────────────────

describe("TableRenderer's add-row button text", () => {
  function buttonText(addRowNoun?: string): string {
    const container = new MockElement("div");
    new TableRenderer(createActions()).renderTable(container as unknown as HTMLElement, config({ addRowNoun }), ROWS);
    return container.querySelectorAll(".obnotion-new-row-button")[0]!.textContent;
  }

  it("reads '+ New <noun>' when the view configures one", () => {
    expect(buttonText("Subscription")).toBe("+ toolbar.newNoun");
  });

  it("falls back to today's string when the noun is unset, empty, or whitespace-only", () => {
    expect(buttonText(undefined)).toBe("+ toolbar.new");
    expect(buttonText("")).toBe("+ toolbar.new");
    expect(buttonText("   ")).toBe("+ toolbar.new");
    // No trailing space in the fallback — "+ toolbar.new " would be the un-trimmed defect.
    expect(buttonText(undefined).endsWith(" ")).toBe(false);
  });
});
