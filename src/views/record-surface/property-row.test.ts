// ───────────────────────────────────────────────────────────────────
// MODULE:    property-row.test
// COMPONENT: The trued-up row shell and the single-select / multi-select split
// ───────────────────────────────────────────────────────────────────
//
// These two builders are the corrected anatomy, and nothing renders through them yet — no
// capture and no consumer test can catch a regression in either. That is exactly why they are
// pinned here: the row's order (label, then value) and its lack of a format icon, and the split
// that draws a single-select as coloured text while a multi-select stays a filled chip.
//
// The display-value renderer beside them keeps its coverage where its callers are, in
// `card-field-renderer.test.ts`, because that path is reached through the shim rather than
// directly.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import {
  buildCheckboxPropertyRow, buildPropertyRow, getPropertyEmptyPrompt, renderOptionValue,
  shouldIgnorePropertyRowDrag,
} from "./property-row";
import type { ColumnDef } from "../../data/types";

// This module's import chain reaches obsidian-dependent modals (card-field-renderer.ts's own
// suite hits the same chain) — the entries beyond setIcon/setTooltip exist only so that chain
// loads under the test runner, not because property-row.ts's own exports touch them.
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

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURES
// ───────────────────────────────────────────────────────────────────

class MockElement {
  public tagName: string;
  public className: string;
  public text: string | null = null;
  public children: MockElement[] = [];
  public attributes = new Map<string, string>();
  public draggable = false;
  public disabled = false;
  public checked = false;
  public title = "";
  public onclick: ((event: { preventDefault(): void; stopPropagation(): void }) => void) | null = null;
  public onchange: (() => void) | null = null;
  public ondragstart: ((event: unknown) => void) | null = null;
  public ondragover: ((event: unknown) => void) | null = null;
  public ondragleave: (() => void) | null = null;
  public ondrop: ((event: unknown) => void) | null = null;
  public ondragend: (() => void) | null = null;

  constructor(tagName = "div", className = "") {
    this.tagName = tagName.toUpperCase();
    this.className = className;
  }

  createDiv(options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): MockElement {
    const className = Array.isArray(options.cls) ? options.cls.filter(Boolean).join(" ") : (options.cls || "");
    const el = new MockElement(tag, className);
    if (options.text !== undefined) el.text = options.text;
    if (options.attr) for (const [key, value] of Object.entries(options.attr)) el.attributes.set(key, value);
    this.children.push(el);
    return el;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  addClass(cls: string): void {
    if (!this.hasClass(cls)) this.className = `${this.className} ${cls}`.trim();
  }

  hasClass(cls: string): boolean {
    return this.className.split(/\s+/).includes(cls);
  }

  /** Stands in for Obsidian's cross-window `.instanceOf()` extension so `isHTMLElement` passes. */
  instanceOf(): boolean {
    return true;
  }

  closest(selector: string): MockElement | null {
    return matchesSelector(this, selector) ? this : null;
  }
}

function matchesSelector(node: MockElement, selector: string): boolean {
  return selector.split(",").some((part) => {
    const trimmed = part.trim();
    if (trimmed.startsWith(".")) return node.hasClass(trimmed.slice(1));
    return node.tagName === trimmed.toUpperCase();
  });
}

const asHTMLElement = (el: MockElement): HTMLElement => el as unknown as HTMLElement;

function optionColumn(statusOptions: Array<{ value: string; color: string }>): ColumnDef {
  return { key: "stage", label: "Stage", type: "select", statusOptions } as unknown as ColumnDef;
}

const OPTION_CLASSES = { chipClass: "db-option-chip", textClass: "db-option-text" };

// ───────────────────────────────────────────────────────────────────
// 3. CASES — THE ROW SHELL
// ───────────────────────────────────────────────────────────────────

describe("buildPropertyRow", () => {
  it("draws the label first and the value after it, and nothing else", () => {
    const parent = new MockElement();
    const handle = buildPropertyRow({
      parent: asHTMLElement(parent),
      rowClass: "db-property-row",
      labelClass: "db-property-label",
      valueClass: "db-property-value",
      label: "Stage",
      renderValue: (valueEl) => { (valueEl as unknown as MockElement).text = "Backlog"; },
    });

    const row = handle.row as unknown as MockElement;
    expect(parent.children).toHaveLength(1);
    expect(row.className).toBe("db-property-row");

    // Two children and no third: a value row draws no format icon on either platform, so an icon
    // element appearing here is the regression this assertion exists to catch.
    expect(row.children).toHaveLength(2);
    expect(row.children[0].tagName).toBe("SPAN");
    expect(row.children[0].className).toBe("db-property-label");
    expect(row.children[0].text).toBe("Stage");
    expect(row.children[1].className).toBe("db-property-value");
  });

  it("hands the value element to the caller exactly once, even when it renders nothing", () => {
    const parent = new MockElement();
    const renderValue = vi.fn();

    const handle = buildPropertyRow({
      parent: asHTMLElement(parent),
      rowClass: "row",
      labelClass: "label",
      valueClass: "value",
      label: "",
      renderValue,
    });

    expect(renderValue).toHaveBeenCalledTimes(1);
    expect(renderValue).toHaveBeenCalledWith(handle.valueEl);
    expect((handle.valueEl as unknown as MockElement).children).toHaveLength(0);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. CASES — THE OPTION SPLIT
// ───────────────────────────────────────────────────────────────────

describe("renderOptionValue", () => {
  const col = optionColumn([
    { value: "Backlog", color: "gray" },
    { value: "Review", color: "purple" },
  ]);

  it("draws a single-select as coloured text carrying no chip", () => {
    const valueEl = new MockElement();
    renderOptionValue(asHTMLElement(valueEl), false, ["Review"], { col, ...OPTION_CLASSES });

    expect(valueEl.children).toHaveLength(1);
    const [text] = valueEl.children;
    expect(text.text).toBe("Review");
    expect(text.hasClass("db-option-text")).toBe(true);
    expect(text.hasClass("status-color-text-purple")).toBe(true);
    // The whole point of the split: no chip class reaches a single-select value.
    expect(text.hasClass("db-option-chip")).toBe(false);
  });

  it("draws a multi-select as one filled chip per value", () => {
    const valueEl = new MockElement();
    renderOptionValue(asHTMLElement(valueEl), true, ["Backlog", "Review"], { col, ...OPTION_CLASSES });

    expect(valueEl.children.map((child) => child.text)).toEqual(["Backlog", "Review"]);
    for (const chip of valueEl.children) {
      expect(chip.hasClass("db-option-chip")).toBe(true);
      expect(chip.hasClass("db-option-text")).toBe(false);
    }
    expect(valueEl.children[0].hasClass("status-color-gray")).toBe(true);
    expect(valueEl.children[1].hasClass("status-color-purple")).toBe(true);
  });

  it("falls back to gray for a value the column does not define, in either mode", () => {
    const single = new MockElement();
    renderOptionValue(asHTMLElement(single), false, ["Unlisted"], { col, ...OPTION_CLASSES });
    expect(single.children[0].hasClass("status-color-text-gray")).toBe(true);

    const multi = new MockElement();
    renderOptionValue(asHTMLElement(multi), true, ["Unlisted"], { col, ...OPTION_CLASSES });
    expect(multi.children[0].hasClass("status-color-gray")).toBe(true);
  });

  it("renders nothing when a single-select has no value", () => {
    const valueEl = new MockElement();
    renderOptionValue(asHTMLElement(valueEl), false, [], { col, ...OPTION_CLASSES });
    expect(valueEl.children).toHaveLength(0);
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. CASES — THE EMPTY-VALUE PROMPT
// ───────────────────────────────────────────────────────────────────

describe("getPropertyEmptyPrompt", () => {
  it("names the action for select, multi-select and relation, never the word Empty", () => {
    expect(getPropertyEmptyPrompt("select")).toBe("Select option");
    expect(getPropertyEmptyPrompt("multi-select")).toBe("Select options");
    expect(getPropertyEmptyPrompt("relation")).toBe("Select options");
    expect(getPropertyEmptyPrompt("status")).toBe("Select option");
  });

  it("names the action for every other format with an editor", () => {
    expect(getPropertyEmptyPrompt("number")).toBe("Enter number");
    expect(getPropertyEmptyPrompt("date")).toBe("Select date");
    expect(getPropertyEmptyPrompt("datetime")).toBe("Select date and time");
    expect(getPropertyEmptyPrompt("currency")).toBe("Enter amount");
    expect(getPropertyEmptyPrompt("text")).toBe("Enter text");
    expect(getPropertyEmptyPrompt("files")).toBe("Add file");
  });

  it("leaves a format with no editor of its own alone", () => {
    expect(getPropertyEmptyPrompt("checkbox")).toBeNull();
    expect(getPropertyEmptyPrompt("computed")).toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. CASES — THE CHECKBOX ROW SHELL
// ───────────────────────────────────────────────────────────────────

describe("buildCheckboxPropertyRow", () => {
  const baseOptions = {
    rowClass: "db-column-manager-row",
    dataColumnKey: "status",
    dragHandleClass: "db-column-drag",
    dragHandleTitle: "Drag to sort",
    moveControlsClass: "db-mobile-reorder-controls",
    checked: true,
    typeClass: "db-column-type",
    renderTypeIcon: vi.fn(),
    nameWrapClass: "db-column-name-wrap",
    nameClass: "db-column-name",
    nameText: "Status [status]",
  };

  it("draws drag handle, move controls, checkbox, type icon and name when draggable", () => {
    const parent = new MockElement();
    const handle = buildCheckboxPropertyRow({
      parent: asHTMLElement(parent),
      ...baseOptions,
      draggable: true,
      move: {
        canMoveUp: false, canMoveDown: true,
        moveUpLabel: "Move up", moveDownLabel: "Move down",
        onMoveUp: vi.fn(), onMoveDown: vi.fn(),
      },
    });

    const row = handle.row as unknown as MockElement;
    expect(row.draggable).toBe(true);
    expect(row.attributes.get("data-note-database-column-key")).toBe("status");
    expect(row.children.map((child) => child.className)).toEqual([
      "db-column-drag", "db-mobile-reorder-controls", "db-checkbox db-checkbox-field",
      "db-column-type", "db-column-name-wrap",
    ]);
    expect(handle.checkbox.checked).toBe(true);
    expect((handle.nameEl as unknown as MockElement).text).toBe("Status [status]");
  });

  it("draws no drag handle or move controls when not draggable — the read-only case", () => {
    const parent = new MockElement();
    const handle = buildCheckboxPropertyRow({
      parent: asHTMLElement(parent),
      ...baseOptions,
      draggable: false,
      checkboxDisabled: true,
    });

    const row = handle.row as unknown as MockElement;
    expect(row.draggable).toBe(false);
    expect(row.children.some((child) => child.hasClass("db-column-drag"))).toBe(false);
    expect(row.children.some((child) => child.hasClass("db-mobile-reorder-controls"))).toBe(false);
    expect(handle.checkbox.disabled).toBe(true);
  });

  it("wires the click handler for a shift-range toggle and the change handler for a plain persist, independently", () => {
    const onCheckboxClick = vi.fn();
    const onCheckboxChange = vi.fn();
    const parent = new MockElement();
    const handle = buildCheckboxPropertyRow({
      parent: asHTMLElement(parent),
      ...baseOptions,
      draggable: false,
      onCheckboxClick,
      onCheckboxChange,
    });

    const fakeEvent = { preventDefault() {}, stopPropagation() {}, shiftKey: false };
    (handle.checkbox as unknown as { onclick: (event: unknown) => void }).onclick(fakeEvent);
    expect(onCheckboxClick).toHaveBeenCalledWith(fakeEvent, handle.checkbox);

    (handle.checkbox as unknown as { onchange: () => void }).onchange();
    expect(onCheckboxChange).toHaveBeenCalledWith(true);
  });
});

describe("shouldIgnorePropertyRowDrag", () => {
  it("ignores a drag starting on a control inside the row", () => {
    const button = new MockElement("button");
    expect(shouldIgnorePropertyRowDrag({ target: button } as unknown as DragEvent)).toBe(true);
  });

  it("allows a drag starting on the row itself", () => {
    const row = new MockElement("div", "db-column-manager-row");
    expect(shouldIgnorePropertyRowDrag({ target: row } as unknown as DragEvent)).toBe(false);
  });
});
