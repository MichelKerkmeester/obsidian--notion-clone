// ───────────────────────────────────────────────────────────────────
// MODULE:    add-property-row.test
// COMPONENT: Search filter and create-new fall-through
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. CASES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import { buildAddPropertyRow } from "./add-property-row";

class MockElement {
  public tagName: string;
  public className: string;
  public textContent = "";
  public value = "";
  public attributes = new Map<string, string>();
  public children: MockElement[] = [];
  private listeners = new Map<string, Array<(event: { preventDefault(): void; stopPropagation(): void }) => void>>();

  constructor(tagName = "div", className = "") {
    this.tagName = tagName.toUpperCase();
    this.className = className;
  }

  createDiv(options: { cls?: string } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string; text?: string } = {}): MockElement {
    const el = this.createEl("span", options);
    if (options.text != null) el.textContent = options.text;
    return el;
  }

  createEl(tag: string, options: { cls?: string; attr?: Record<string, string> } = {}): MockElement {
    const el = new MockElement(tag, options.cls || "");
    if (options.attr) for (const [key, value] of Object.entries(options.attr)) el.attributes.set(key, value);
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

  empty(): void {
    this.children = [];
  }
}

const FORMATS = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "multi-select", label: "Multi-select" },
];

function makeRow(overrides: Partial<Parameters<typeof buildAddPropertyRow>[0]> = {}) {
  const parent = new MockElement();
  const onSelect = vi.fn();
  const onCreateNew = vi.fn();
  const handle = buildAddPropertyRow({
    parent: parent as unknown as HTMLElement,
    rootClass: "obnotion-add-property-row",
    searchClass: "obnotion-add-property-search",
    optionListClass: "obnotion-add-property-options",
    optionClass: "obnotion-add-property-option",
    createRowClass: "obnotion-add-property-create",
    options: FORMATS,
    searchPlaceholder: "Search or create new",
    createLabel: (query) => `Create "${query}"`,
    onSelect,
    onCreateNew,
    ...overrides,
  });
  return { parent, handle, onSelect, onCreateNew };
}

describe("buildAddPropertyRow", () => {
  it("lists every format with an empty query", () => {
    const { handle } = makeRow();
    expect(handle.visibleOptions().map((o) => o.value)).toEqual(["text", "number", "select", "multi-select"]);
    expect(handle.hasExactMatch()).toBe(false);
  });

  it("filters the list as the query narrows, case-insensitively", () => {
    const { handle } = makeRow();
    handle.setQuery("sel");
    expect(handle.visibleOptions().map((o) => o.value)).toEqual(["select", "multi-select"]);
  });

  it("recognizes an exact label match and withholds the create fall-through", () => {
    const { handle } = makeRow();
    handle.setQuery("Select");
    expect(handle.hasExactMatch()).toBe(true);
    expect(handle.visibleOptions().map((o) => o.value)).toEqual(["select", "multi-select"]);
  });

  it("falls through to create-new when nothing matches", () => {
    const { handle, onCreateNew, onSelect } = makeRow();
    handle.setQuery("Formula Score");
    expect(handle.visibleOptions()).toHaveLength(0);
    expect(handle.hasExactMatch()).toBe(false);
    expect(onCreateNew).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("wires the create row's click to onCreateNew with the typed text", () => {
    const parent = new MockElement();
    const onSelect = vi.fn();
    const onCreateNew = vi.fn();
    buildAddPropertyRow({
      parent: parent as unknown as HTMLElement,
      rootClass: "obnotion-add-property-row",
      searchClass: "obnotion-add-property-search",
      optionListClass: "obnotion-add-property-options",
      optionClass: "obnotion-add-property-option",
      createRowClass: "obnotion-add-property-create",
      options: FORMATS,
      searchPlaceholder: "Search or create new",
      createLabel: (query) => `Create "${query}"`,
      onSelect,
      onCreateNew,
    });

    const root = parent.children[0] as unknown as MockElement;
    const searchInput = root.children[0] as unknown as MockElement;
    const list = root.children[1] as unknown as MockElement;
    searchInput.value = "Formula Score";
    searchInput.fire("input");

    const createRow = list.children[0];
    expect(createRow.textContent).toBe('Create "Formula Score"');
    createRow.fire("click");
    expect(onCreateNew).toHaveBeenCalledWith("Formula Score");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("wires an option row's click to onSelect with its value", () => {
    const parent = new MockElement();
    const onSelect = vi.fn();
    buildAddPropertyRow({
      parent: parent as unknown as HTMLElement,
      rootClass: "obnotion-add-property-row",
      searchClass: "obnotion-add-property-search",
      optionListClass: "obnotion-add-property-options",
      optionClass: "obnotion-add-property-option",
      createRowClass: "obnotion-add-property-create",
      options: FORMATS,
      searchPlaceholder: "Search or create new",
      createLabel: (query) => `Create "${query}"`,
      onSelect,
      onCreateNew: vi.fn(),
    });

    const root = parent.children[0] as unknown as MockElement;
    const list = root.children[1] as unknown as MockElement;
    const selectRow = list.children[2]; // text, number, select, multi-select — "select" is index 2
    selectRow.fire("click");
    expect(onSelect).toHaveBeenCalledWith("select");
  });
});
