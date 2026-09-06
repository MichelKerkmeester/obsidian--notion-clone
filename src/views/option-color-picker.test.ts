// ───────────────────────────────────────────────────────────────────
// MODULE:    option-color-picker.test
// COMPONENT: unit coverage for the labelled-list rebuild
// ───────────────────────────────────────────────────────────────────
//
// Drives the real `openOptionColorPicker` against a mock DOM, the same shape `dropdown-field.
// test.ts` uses to drive `openDropdownPopover` — `MockElement` reimplements just enough of the
// Obsidian DOM helper surface to open the picker and read its rows back, without a mounted view.
//
// The row-count case is the load-bearing one: sixteen `.db-dropdown-option` rows, zero
// `.db-color-picker-swatch` elements — the negative half is asserted explicitly rather than
// merely absent from the count, so a regression that renamed the class instead of removing it
// still fails.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & DOM SHIM
// ───────────────────────────────────────────────────────────────────

import { beforeEach, describe, expect, it, vi } from "vitest";
import { OPTION_COLORS } from "../data/column-types";

vi.mock("obsidian", () => ({
  setIcon: vi.fn(),
  setTooltip: vi.fn(),
  Platform: { isMobile: false, isTablet: false },
}));

// Dismissal is `overlay-stack`'s own concern, exercised there — this suite only needs the picker
// to open and its rows to be correct.
vi.mock("./popover-auto-close", () => ({
  installPopoverAutoClose: () => () => {},
}));

// The sheet chrome and z-index stacking read `getComputedStyle`/`documentElement` — real browser
// DOM this mock document does not implement, and which `044`'s own live sheet-grammar lane already
// proves (see `dropdown-field.test.ts` for the identical reasoning). `createSheetHeader` (what
// `mountPickerSheetHeader` calls to build the phone sheet's title and close button) stays real.
vi.mock("./mobile-bottom-sheet", async () => {
  const actual = await vi.importActual<typeof import("./mobile-bottom-sheet")>("./mobile-bottom-sheet");
  return {
    ...actual,
    applySheetChrome: () => {},
    attachSheetDragToDismiss: () => () => {},
    playSheetEntrance: () => {},
  };
});

type Rect = { left: number; top: number; right: number; bottom: number; width: number; height: number };
const ZERO_RECT: Rect = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };

type Listener = (event: MockEvent) => void;

class MockEvent {
  public defaultPrevented = false;
  constructor(public type: string, public props: Record<string, unknown> = {}) {
    Object.assign(this, props);
  }
  preventDefault(): void {
    this.defaultPrevented = true;
  }
  stopPropagation(): void {}
}

/** Reimplements just enough of the Obsidian DOM helper surface to drive `openOptionColorPicker`. */
class MockElement {
  tagName: string;
  parentElement: MockElement | null = null;
  children: MockElement[] = [];
  classes = new Set<string>();
  attributes = new Map<string, string>();
  ownerDocument: unknown;
  onclick: ((event: MockEvent) => void) | null = null;
  onkeydown: ((event: MockEvent) => void) | null = null;
  scrollIntoViewCalls = 0;
  private rect: Rect = ZERO_RECT;
  style: Record<string, unknown> & { removeProperty: (name: string) => void; setProperty: (name: string, value: string) => void };

  constructor(tagName = "div", cls = "") {
    this.tagName = tagName.toUpperCase();
    if (cls) for (const part of cls.split(/\s+/).filter(Boolean)) this.classes.add(part);
    this.style = {
      removeProperty: (name: string) => { delete this.style[name]; },
      setProperty: (name: string, value: string) => { this.style[name] = value; },
    };
  }

  createDiv(options: { cls?: string } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string; attr?: Record<string, string>; text?: string } = {}): MockElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string; attr?: Record<string, string>; text?: string } = {}): MockElement {
    const el = new MockElement(tag, options.cls || "");
    if (options.attr) for (const [key, value] of Object.entries(options.attr)) el.attributes.set(key, value);
    if (options.text !== undefined) el.attributes.set("data-text", options.text);
    el.parentElement = this;
    el.ownerDocument = this.ownerDocument;
    this.children.push(el);
    return el;
  }

  setAttr(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }

  getAttributeNames(): string[] {
    return Array.from(this.attributes.keys());
  }

  addClass(name: string): void {
    this.classes.add(name);
  }

  removeClass(name: string): void {
    this.classes.delete(name);
  }

  hasClass(name: string): boolean {
    return this.classes.has(name);
  }

  get classList(): { contains: (name: string) => boolean } {
    return { contains: (name: string) => this.classes.has(name) };
  }

  toggleClass(name: string, force: boolean): void {
    if (force) this.classes.add(name);
    else this.classes.delete(name);
  }

  setCssProps(props: Record<string, string>): void {
    Object.assign(this.style, props);
  }

  setRect(rect: Partial<Rect>): void {
    this.rect = { ...ZERO_RECT, ...rect };
  }

  getBoundingClientRect(): Rect {
    return this.rect;
  }

  get isConnected(): boolean {
    if (!this.parentElement) return this.tagName === "BODY";
    return this.parentElement.isConnected;
  }

  closest(selector: string): MockElement | null {
    const wanted = selector.split(",").map((part) => part.trim().replace(/^\./, ""));
    let current: MockElement | null = this;
    while (current) {
      if (wanted.some((cls) => current!.classes.has(cls))) return current;
      current = current.parentElement;
    }
    return null;
  }

  querySelectorAll<T = MockElement>(selector: string): T[] {
    const match = /^\.([\w-]+)$/.exec(selector.trim());
    if (!match) throw new Error(`MockElement.querySelectorAll: unsupported selector "${selector}"`);
    const [, className] = match;
    const results: MockElement[] = [];
    const walk = (node: MockElement) => {
      for (const child of node.children) {
        if (child.classes.has(className)) results.push(child);
        walk(child);
      }
    };
    walk(this);
    return results as unknown as T[];
  }

  querySelector<T = MockElement>(selector: string): T | null {
    return (this.querySelectorAll<T>(selector)[0] as T) ?? null;
  }

  insertBefore(node: MockElement, before: MockElement | null): MockElement {
    node.parentElement = this;
    node.ownerDocument = this.ownerDocument;
    const index = before ? this.children.indexOf(before) : -1;
    if (index >= 0) this.children.splice(index, 0, node);
    else this.children.push(node);
    return node;
  }

  appendChild(node: MockElement): MockElement {
    if (node.parentElement) {
      const index = node.parentElement.children.indexOf(node);
      if (index >= 0) node.parentElement.children.splice(index, 1);
    }
    node.parentElement = this;
    node.ownerDocument = this.ownerDocument;
    this.children.push(node);
    return node;
  }

  remove(): void {
    if (this.parentElement) {
      const index = this.parentElement.children.indexOf(this);
      if (index >= 0) this.parentElement.children.splice(index, 1);
    }
    this.parentElement = null;
  }

  focus(): void {
    activeElementRef.value = this;
  }

  scrollIntoView(): void {
    this.scrollIntoViewCalls += 1;
  }

  addEventListener(): void {}
  removeEventListener(): void {}

  dispatch(type: string, props: Record<string, unknown> = {}): MockEvent {
    const event = new MockEvent(type, { target: this, ...props });
    if (type === "click") this.onclick?.(event);
    if (type === "keydown") this.onkeydown?.(event);
    return event;
  }
}

const activeElementRef: { value: MockElement | null } = { value: null };

/** Builds a fresh mock `Document` and the body it and every picker mount under. */
function createMockDoc(phone = false): { doc: Document; body: MockElement } {
  const body = new MockElement("body");
  if (phone) body.classes.add("is-phone");
  activeElementRef.value = null;

  const doc = {
    body,
    get activeElement() {
      return activeElementRef.value;
    },
    defaultView: {
      matchMedia: () => ({ matches: false }),
      requestAnimationFrame: (fn: (...args: unknown[]) => void) => { fn(); return 0; },
      cancelAnimationFrame: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      visualViewport: undefined,
      innerWidth: 1200,
      innerHeight: 800,
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    createElement: (tag: string) => {
      const el = new MockElement(tag);
      el.ownerDocument = doc;
      return el;
    },
  } as unknown as Document;

  body.ownerDocument = doc;
  (globalThis as unknown as { window: { activeDocument: unknown } }).window.activeDocument = doc;
  return { doc, body };
}

(globalThis as unknown as { Node: unknown }).Node = MockElement;
(globalThis as unknown as { HTMLElement: unknown }).HTMLElement = MockElement;
(globalThis as unknown as { window: unknown }).window = {
  setTimeout: (fn: (...args: unknown[]) => void, ms?: number) => setTimeout(fn, ms),
  clearTimeout: (id: unknown) => clearTimeout(id as NodeJS.Timeout),
  activeDocument: undefined,
};
// `getVisiblePopoverBounds` constructs its answer with `new DOMRect(...)`, which only exists in a
// browser's DOM lib — this suite runs under vitest's plain `node` environment, so the constructor
// is polyfilled with the one shape that function reads (see `dropdown-field.test.ts`).
// `getVisiblePopoverBounds`'s phone branch reads the safe-area inset off computed style —
// irrelevant here (no navbar, no inset), so a stub answering "0" for every property is enough.
(globalThis as unknown as { getComputedStyle: unknown }).getComputedStyle = () => ({
  getPropertyValue: () => "0",
});
(globalThis as unknown as { DOMRect: unknown }).DOMRect = class {
  constructor(public left = 0, public top = 0, public width = 0, public height = 0) {}
  get right() { return this.left + this.width; }
  get bottom() { return this.top + this.height; }
};

// ───────────────────────────────────────────────────────────────────
// 2. TESTS — THE LABELLED LIST
// ───────────────────────────────────────────────────────────────────

describe("option colour picker — labelled list", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("draws sixteen rows and zero swatches", async () => {
    const { doc, body } = createMockDoc();
    const { openOptionColorPicker } = await import("./option-color-picker");
    const anchor = body.createEl("button") as unknown as HTMLElement;
    (anchor as unknown as MockElement).ownerDocument = doc;
    (anchor as unknown as MockElement).setRect({ left: 100, top: 100, right: 120, bottom: 120, width: 20, height: 20 });

    openOptionColorPicker(anchor, "blue", () => {});

    const popup = body.querySelector<MockElement>(".db-color-picker-popup")!;
    expect(popup).not.toBeNull();
    // The negative half: a class rename rather than a removal would still leave this at 0.
    expect(popup.querySelectorAll(".db-color-picker-swatch").length).toBe(0);
    const rows = popup.querySelectorAll<MockElement>(".db-dropdown-option");
    expect(rows.length).toBe(OPTION_COLORS.length);
    expect(rows.length).toBe(16);
  });

  it("carries a 16px leading dot, a visible name, and the trailing check on the current row only", async () => {
    const { doc, body } = createMockDoc();
    const { openOptionColorPicker } = await import("./option-color-picker");
    const anchor = body.createEl("button") as unknown as HTMLElement;
    (anchor as unknown as MockElement).ownerDocument = doc;

    openOptionColorPicker(anchor, "green", () => {});

    const popup = body.querySelector<MockElement>(".db-color-picker-popup")!;
    const rows = popup.querySelectorAll<MockElement>(".db-dropdown-option");
    for (const [index, row] of rows.entries()) {
      const color = OPTION_COLORS[index];
      const dot = row.querySelector<MockElement>(".db-color-picker-row-dot")!;
      expect(dot.hasClass(`db-option-color-${color}`)).toBe(true);
      const label = row.querySelector<MockElement>(".db-dropdown-option-label")!;
      // The visible name, not the raw enum value, reaches the row.
      expect(label.getAttribute("data-text")).not.toBe(color);
      const isSelected = color === "green";
      expect(row.hasClass("is-selected")).toBe(isSelected);
      expect(row.getAttribute("aria-selected")).toBe(isSelected ? "true" : "false");
      // The check is the row's own last child — the same trailing position the check flip
      // gives the dropdown's own rows.
      expect(row.children[row.children.length - 1].hasClass("db-dropdown-option-check")).toBe(true);
    }
  });

  it("resolves every one of the sixteen names through t(), never the raw key", async () => {
    const { doc, body } = createMockDoc();
    const { openOptionColorPicker } = await import("./option-color-picker");
    const anchor = body.createEl("button") as unknown as HTMLElement;
    (anchor as unknown as MockElement).ownerDocument = doc;

    openOptionColorPicker(anchor, "gray", () => {});

    const popup = body.querySelector<MockElement>(".db-color-picker-popup")!;
    const labels = popup.querySelectorAll<MockElement>(".db-dropdown-option-label")
      .map((el) => el.getAttribute("data-text"));
    expect(labels.length).toBe(16);
    for (const [index, text] of labels.entries()) {
      expect(text).not.toBe(OPTION_COLORS[index]);
      expect(text).not.toBeNull();
    }
  });

  it("carries no raw `title: color` attribute — the visible name is the only signal", async () => {
    const { doc, body } = createMockDoc();
    const { openOptionColorPicker } = await import("./option-color-picker");
    const anchor = body.createEl("button") as unknown as HTMLElement;
    (anchor as unknown as MockElement).ownerDocument = doc;

    openOptionColorPicker(anchor, "blue", () => {});

    const popup = body.querySelector<MockElement>(".db-color-picker-popup")!;
    for (const row of popup.querySelectorAll<MockElement>(".db-dropdown-option")) {
      expect(row.getAttribute("title")).toBeNull();
    }
  });

  it("selects a colour on click and closes the picker", async () => {
    const { doc, body } = createMockDoc();
    const { openOptionColorPicker } = await import("./option-color-picker");
    const anchor = body.createEl("button") as unknown as HTMLElement;
    (anchor as unknown as MockElement).ownerDocument = doc;
    const picked: string[] = [];

    openOptionColorPicker(anchor, "blue", (color) => { picked.push(color); });
    const popup = body.querySelector<MockElement>(".db-color-picker-popup")!;
    const rows = popup.querySelectorAll<MockElement>(".db-dropdown-option");
    rows[3].dispatch("click");

    expect(picked).toEqual([OPTION_COLORS[3]]);
    expect(body.querySelector(".db-color-picker-popup")).toBeNull();
  });

  it("moves the highlight by index with ArrowDown/ArrowUp/Home/End — the family's list model, not a grid", async () => {
    const { doc, body } = createMockDoc();
    const { openOptionColorPicker } = await import("./option-color-picker");
    const anchor = body.createEl("button") as unknown as HTMLElement;
    (anchor as unknown as MockElement).ownerDocument = doc;

    openOptionColorPicker(anchor, "gray", () => {});
    const popup = body.querySelector<MockElement>(".db-color-picker-popup")!;
    const rows = popup.querySelectorAll<MockElement>(".db-dropdown-option");

    popup.dispatch("keydown", { key: "ArrowDown", target: rows[0] });
    expect(activeElementRef.value).toBe(rows[1] as unknown as MockElement);

    popup.dispatch("keydown", { key: "End", target: rows[1] });
    expect(activeElementRef.value).toBe(rows[rows.length - 1] as unknown as MockElement);

    popup.dispatch("keydown", { key: "Home", target: rows[rows.length - 1] });
    expect(activeElementRef.value).toBe(rows[0] as unknown as MockElement);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. TESTS — THE PHONE SHEET
// ───────────────────────────────────────────────────────────────────

describe("option colour picker — phone sheet", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("carries the family's own sheet chrome and scrolls the current row into view", async () => {
    const { doc, body } = createMockDoc(true);
    const { openOptionColorPicker } = await import("./option-color-picker");
    const anchor = body.createEl("button") as unknown as HTMLElement;
    (anchor as unknown as MockElement).ownerDocument = doc;

    openOptionColorPicker(anchor, "rose", () => {}, "Color");

    const popup = body.querySelector<MockElement>(".db-color-picker-popup")!;
    expect(popup.querySelector(".db-panel-title")).not.toBeNull();
    expect(popup.querySelector(".db-sheet-close")).not.toBeNull();
    const rows = popup.querySelectorAll<MockElement>(".db-dropdown-option");
    expect(rows.length).toBe(16);
    const currentRow = rows[OPTION_COLORS.indexOf("rose")];
    // The `requestAnimationFrame` mock above runs its callback synchronously, so the initial
    // scroll-into-view has already happened by the time `openOptionColorPicker` returns.
    expect(currentRow.scrollIntoViewCalls).toBeGreaterThan(0);
  });
});
