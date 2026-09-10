// ───────────────────────────────────────────────────────────────────
// MODULE:    column-manager-renderer.test
// COMPONENT: the add-property picker's query-forwarding wiring
// ───────────────────────────────────────────────────────────────────
//
// Only the picker wiring is exercised here, through the private opener directly rather than
// through `render()` — the panel's header, checkbox and drag machinery are unrelated to what a
// typed name does on selection, and driving them through a mock DOM would test that scaffolding
// instead of the fix.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import type { ColumnManagerActions } from "./column-manager-renderer";
import { ColumnManagerRenderer } from "./column-manager-renderer";
import type { ColumnDef } from "../data/types";

vi.mock("obsidian", () => ({
  App: class {},
  CachedMetadata: class {},
  TFile: class {},
  TFolder: class {},
  Modal: class {},
  Menu: class {},
  Notice: class {},
  Component: class {},
  Setting: class {},
  Platform: { isMobile: false },
  MarkdownRenderer: { render: vi.fn(), renderMarkdown: vi.fn() },
  setIcon: vi.fn(),
  setTooltip: vi.fn(),
  debounce: (fn: unknown) => fn,
  getAllTags: vi.fn(() => []),
  normalizePath: (path: string) => path,
}));

vi.mock("./popover-position", () => ({
  isMobileBottomSheet: () => false,
  PANEL_POPOVER: {},
  positionToolbarPopover: vi.fn(),
  releasePopoverPosition: vi.fn(),
}));

vi.mock("./popover-auto-close", () => ({
  installPopoverAutoClose: () => vi.fn(),
}));

vi.mock("./property-type-icon", () => ({
  getPropertyDropdownIcon: () => "",
  renderPropertyTypeIcon: vi.fn(),
}));

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURE
// ───────────────────────────────────────────────────────────────────

class MockElement {
  public tagName: string;
  public className: string;
  public value = "";
  public textContent = "";
  public children: MockElement[] = [];
  public ownerDocument: { body: MockElement };
  private attrs = new Map<string, string>();
  private listeners = new Map<string, Array<(event: { preventDefault(): void; stopPropagation(): void }) => void>>();

  constructor(tagName = "div", ownerDocument?: { body: MockElement }) {
    this.tagName = tagName.toUpperCase();
    this.className = "";
    this.ownerDocument = ownerDocument ?? { body: this };
  }

  setAttribute(name: string, value: string): void {
    this.attrs.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this.attrs.get(name) ?? null;
  }

  createDiv(options: { cls?: string | string[]; text?: string } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string | string[]; text?: string } = {}): MockElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): MockElement {
    const el = new MockElement(tag, this.ownerDocument);
    el.className = (Array.isArray(options.cls) ? options.cls.join(" ") : options.cls) || "";
    if (options.text !== undefined) el.textContent = options.text;
    for (const [name, attrValue] of Object.entries(options.attr ?? {})) el.setAttribute(name, String(attrValue));
    this.children.push(el);
    return el;
  }

  addEventListener(type: string, handler: (event: { preventDefault(): void; stopPropagation(): void }) => void): void {
    const list = this.listeners.get(type) ?? [];
    list.push(handler);
    this.listeners.set(type, list);
  }

  fire(type: string): void {
    for (const handler of this.listeners.get(type) ?? []) handler({ preventDefault() {}, stopPropagation() {} });
  }

  focus(): void {}
  remove(): void {}
  empty(): void {
    this.children = [];
  }

  hasClass(cls: string): boolean {
    return this.className.split(/\s+/).includes(cls);
  }

  addClass(cls: string): void {
    if (!this.hasClass(cls)) this.className = `${this.className} ${cls}`.trim();
  }

  removeClass(cls: string): void {
    this.className = this.className.split(/\s+/).filter((item) => item && item !== cls).join(" ");
  }

  get classList() {
    return {
      toggle: (cls: string, force?: boolean): void => {
        const has = this.hasClass(cls);
        const next = force ?? !has;
        if (next && !has) this.addClass(cls);
        if (!next && has) this.removeClass(cls);
      },
    };
  }
}

function makeActions(overrides: Partial<ColumnManagerActions> = {}): ColumnManagerActions {
  return {
    close: vi.fn(),
    setColumnVisible: vi.fn(),
    setAllColumnsVisible: vi.fn(),
    moveColumn: vi.fn(),
    moveColumnTo: vi.fn(),
    toggleColumnWrap: vi.fn(),
    editColumn: vi.fn(),
    addColumn: vi.fn(),
    deleteColumn: vi.fn(),
    ...overrides,
  };
}

// ───────────────────────────────────────────────────────────────────
// 3. CASES
// ───────────────────────────────────────────────────────────────────

function openPicker(createPropertyOfType = vi.fn()) {
  const anchor = new MockElement("button");
  const actions = makeActions({ createPropertyOfType });
  const renderer = new ColumnManagerRenderer();
  (renderer as unknown as { openAddPropertyPicker(anchorEl: HTMLElement, actions: ColumnManagerActions): void })
    .openAddPropertyPicker(anchor as unknown as HTMLElement, actions);
  const popover = anchor.ownerDocument.body.children[0];
  const root = popover.children[0];
  return { searchInput: root.children[0], list: root.children[1], createPropertyOfType };
}

describe("ColumnManagerRenderer add-property picker", () => {
  it("forwards the typed name to the chosen format in one pass", () => {
    // PROPERTY_TYPES (type-picker.ts) lists "date" third — index 2 — in the unfiltered list.
    const { searchInput, list, createPropertyOfType } = openPicker();

    searchInput.value = "Due Date";
    const dateOption = list.children[2];
    dateOption.fire("click");

    expect(createPropertyOfType).toHaveBeenCalledTimes(1);
    expect(createPropertyOfType).toHaveBeenCalledWith("date", "Due Date");
  });

  it("leaves the create fall-through's own label untouched", () => {
    const { searchInput, list, createPropertyOfType } = openPicker();

    searchInput.value = "Not A Real Format";
    searchInput.fire("input"); // buildAddPropertyRow re-renders its list on the search input's own event
    const createRow = list.children.find((row) => row.className.includes("obnotion-add-property-create"));
    expect(createRow).toBeDefined();
    createRow!.fire("click");

    expect(createPropertyOfType).toHaveBeenCalledWith("text", "Not A Real Format");
  });
});

describe("ColumnManagerRenderer visibility search", () => {
  function col(key: string, label: string): ColumnDef {
    return { key, label, type: "text" };
  }

  it("filters rows to name matches and leaves untouched rows alone", () => {
    const panel = new MockElement("div");
    const renderer = new ColumnManagerRenderer() as unknown as {
      renderSearchRow(panel: HTMLElement): HTMLInputElement;
      wireVisibilitySearch(searchInput: HTMLInputElement, columns: ColumnDef[], rowsByKey: Map<string, HTMLElement>): void;
    };
    const searchInput = renderer.renderSearchRow(panel as unknown as HTMLElement) as unknown as MockElement;
    const columns = [col("status", "Status"), col("due", "Due Date"), col("priority", "Priority")];
    const rowsByKey = new Map<string, HTMLElement>(columns.map((c) => [c.key, new MockElement("div") as unknown as HTMLElement]));
    renderer.wireVisibilitySearch(searchInput as unknown as HTMLInputElement, columns, rowsByKey);

    searchInput.value = "due";
    searchInput.fire("input");

    const hidden = (key: string) => (rowsByKey.get(key) as unknown as MockElement).className.includes("obnotion-column-manager-row-search-hidden");
    expect(hidden("due")).toBe(false);
    expect(hidden("status")).toBe(true);
    expect(hidden("priority")).toBe(true);
  });

  it("restores every row once the query is cleared", () => {
    const panel = new MockElement("div");
    const renderer = new ColumnManagerRenderer() as unknown as {
      renderSearchRow(panel: HTMLElement): HTMLInputElement;
      wireVisibilitySearch(searchInput: HTMLInputElement, columns: ColumnDef[], rowsByKey: Map<string, HTMLElement>): void;
    };
    const searchInput = renderer.renderSearchRow(panel as unknown as HTMLElement) as unknown as MockElement;
    const columns = [col("status", "Status"), col("due", "Due Date")];
    const rowsByKey = new Map<string, HTMLElement>(columns.map((c) => [c.key, new MockElement("div") as unknown as HTMLElement]));
    renderer.wireVisibilitySearch(searchInput as unknown as HTMLInputElement, columns, rowsByKey);

    searchInput.value = "due";
    searchInput.fire("input");
    searchInput.value = "";
    searchInput.fire("input");

    const hidden = (key: string) => (rowsByKey.get(key) as unknown as MockElement).className.includes("obnotion-column-manager-row-search-hidden");
    expect(hidden("status")).toBe(false);
    expect(hidden("due")).toBe(false);
  });
});

describe("ColumnManagerRenderer property row contract", () => {
  function renderRow() {
    const panel = new MockElement("div");
    const renderer = new ColumnManagerRenderer() as unknown as {
      renderColumnRow(
        panel: HTMLElement,
        col: ColumnDef,
        config: unknown,
        state: unknown,
        actions: ColumnManagerActions,
        columns: ColumnDef[],
        index: number,
        total: number
      ): HTMLElement;
    };
    const col: ColumnDef = { key: "status", label: "Status", type: "text" };
    const state = { hiddenColumns: new Set<string>() };
    const actions = makeActions();
    const row = renderer.renderColumnRow(
      panel as unknown as HTMLElement,
      col,
      { viewType: "table" },
      state,
      actions,
      [col],
      0,
      1
    ) as unknown as MockElement;
    return { row, col, actions };
  }

  function countInteractive(el: MockElement): number {
    let count = 0;
    if (el.tagName === "BUTTON" || (el.tagName === "INPUT" && el.getAttribute("type") !== "hidden")) count += 1;
    for (const child of el.children) count += countInteractive(child);
    return count;
  }

  function findByName(el: MockElement): MockElement | undefined {
    if (el.className.includes("obnotion-column-name ") || el.className.trim() === "obnotion-column-name") return el;
    for (const child of el.children) {
      const hit = findByName(child);
      if (hit) return hit;
    }
    return undefined;
  }

  it("labels the row with the column name alone, printing no storage key", () => {
    const { row, col } = renderRow();
    const nameEl = findByName(row);
    expect(nameEl).toBeDefined();
    expect(nameEl!.textContent).toBe(col.label);
    expect(nameEl!.textContent).not.toMatch(/\[[^\]\n]+\]/);
  });

  it("carries three interactive controls: two reorder buttons and the trailing eye toggle", () => {
    const { row } = renderRow();
    expect(countInteractive(row)).toBe(3);
  });

  it("opens the edit-property surface on a single name tap", () => {
    const { row, col, actions } = renderRow();
    findByName(row)!.fire("click");
    expect(actions.editColumn).toHaveBeenCalledTimes(1);
    expect(actions.editColumn).toHaveBeenCalledWith(col);
  });
});
