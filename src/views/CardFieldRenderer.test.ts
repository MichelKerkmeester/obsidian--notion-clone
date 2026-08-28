import { describe, expect, it, vi } from "vitest";
import { classifyCardField, formatCardNumber, getCardRatingValue, isCardFieldEmpty, renderCardField } from "./CardFieldRenderer";
import type { ColumnDef, RowData, ViewConfig } from "../data/types";
import type { App } from "obsidian";

// The helpers under test are pure, but this module's import chain reaches the
// obsidian runtime package, which has no resolvable entry outside the app. Stub
// it the same way the other suites do so the chain loads under the test runner.
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
  debounce: (fn: unknown) => fn,
  getAllTags: vi.fn(() => []),
  normalizePath: (path: string) => path,
}));

vi.mock("../i18n", () => ({
  t: (key: string) => key,
}));

class MockElement {
  public className = "";
  public textContent = "";
  public title = "";
  public tabIndex = -1;
  public checked = false;
  public disabled = false;
  public style = { setProperty: vi.fn() };
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  private attributes = new Map<string, string>();
  private listeners = new Map<string, Set<(event: unknown) => void>>();

  constructor(public tagName = "div") {}

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
    if (name === "tabindex") {
      this.tabIndex = parseInt(value, 10);
    }
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  hasAttribute(name: string): boolean {
    return this.attributes.has(name);
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
    if (name === "tabindex") {
      this.tabIndex = -1;
    }
  }

  addClass(cls: string): void {
    const set = new Set(this.className.split(" ").filter(Boolean));
    set.add(cls);
    this.className = Array.from(set).join(" ");
  }

  hasClass(cls: string): boolean {
    return this.className.split(" ").includes(cls);
  }

  createSpan(options: { cls?: string; text?: string } = {}): MockElement {
    const el = new MockElement("span");
    el.parentElement = this;
    if (options.cls) el.className = options.cls;
    if (options.text) el.textContent = options.text;
    this.children.push(el);
    return el;
  }

  createDiv(options: { cls?: string; text?: string } = {}): MockElement {
    const el = new MockElement("div");
    el.parentElement = this;
    if (options.cls) el.className = options.cls;
    if (options.text) el.textContent = options.text;
    this.children.push(el);
    return el;
  }

  createEl(tagName: string, options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): MockElement {
    const el = new MockElement(tagName);
    el.parentElement = this;
    if (options.cls) el.className = options.cls;
    if (options.text) el.textContent = options.text;
    if (options.attr) {
      for (const [k, v] of Object.entries(options.attr)) {
        el.setAttribute(k, v);
      }
    }
    this.children.push(el);
    return el;
  }

  appendChild(child: MockElement): MockElement {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  empty(): void {
    this.children = [];
    this.textContent = "";
  }

  appendText(text: string): void {
    this.textContent += text;
  }

  addEventListener(type: string, handler: (event: unknown) => void): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
  }

  removeEventListener(type: string, handler: (event: unknown) => void): void {
    this.listeners.get(type)?.delete(handler);
  }

  dispatchEvent(event: { type: string; [key: string]: unknown }): boolean {
    const set = this.listeners.get(event.type);
    if (set) {
      for (const handler of set) handler(event);
    }
    return true;
  }

  matches(selector: string): boolean {
    const selectors = selector.split(",").map((s) => s.trim());
    return selectors.some((s) => {
      if (s.startsWith(".")) {
        return this.hasClass(s.slice(1));
      }
      if (s.startsWith("[") && s.endsWith("]")) {
        const attrExpr = s.slice(1, -1);
        if (attrExpr.includes("=")) {
          const [attrName, attrVal] = attrExpr.split("=");
          const cleanVal = attrVal.replace(/['"]/g, "");
          return this.getAttribute(attrName) === cleanVal;
        }
        return this.hasAttribute(attrExpr);
      }
      if (s.toLowerCase() === this.tagName.toLowerCase()) {
        return true;
      }
      return false;
    });
  }

  closest(selector: string): MockElement | null {
    if (this.matches(selector)) return this;
    return this.parentElement ? this.parentElement.closest(selector) : null;
  }

  querySelector(selector: string): MockElement | null {
    for (const child of this.children) {
      if (child.matches(selector)) return child;
      const found = child.querySelector(selector);
      if (found) return found;
    }
    return null;
  }

  querySelectorAll(selector: string): MockElement[] {
    const results: MockElement[] = [];
    for (const child of this.children) {
      if (child.matches(selector)) results.push(child);
      results.push(...child.querySelectorAll(selector));
    }
    return results;
  }

  focus = vi.fn();
}

const column = (type: ColumnDef["type"], key = "value"): ColumnDef => ({ key, label: key, type });

describe("CardFieldRenderer presentation helpers", () => {
  it("classifies the shared card field display families", () => {
    expect(classifyCardField(column("select"), "select")).toBe("badge");
    expect(classifyCardField(column("multi-select"), "multi-select")).toBe("badges");
    expect(classifyCardField(column("relation"), "relation")).toBe("relation");
    expect(classifyCardField(column("number"), "number")).toBe("number");
    expect(classifyCardField(column("date"), "date")).toBe("date");
    expect(classifyCardField(column("checkbox"), "checkbox")).toBe("checkbox");
  });

  it("normalizes empty values and tabular number text without mutating data", () => {
    expect(isCardFieldEmpty(undefined)).toBe(true);
    expect(isCardFieldEmpty([])).toBe(true);
    expect(isCardFieldEmpty("0")).toBe(false);
    expect(formatCardNumber(12.5)).toBe("12.5");
    expect(formatCardNumber(["one", "two"])).toBe("one, two");
  });

  it("clamps rating values to the configured range", () => {
    expect(getCardRatingValue(-2)).toBe(0);
    expect(getCardRatingValue(3)).toBe(3);
    expect(getCardRatingValue(12, 5)).toBe(5);
    expect(getCardRatingValue("not a number")).toBeNull();
  });
});

describe("CardFieldRenderer keyboard accessibility", () => {
  it("renders editable field with gridcell role, tabindex=-1, and Enter/Space keyboard trigger", () => {
    const origWindow = globalThis.window;
    (globalThis as unknown as { window: { activeDocument: { createElement: (tag: string) => MockElement } } }).window = {
      activeDocument: {
        createElement: (tag: string) => new MockElement(tag),
      },
    };

    try {
      const onEdit = vi.fn();
      const row: RowData = { file: { path: "notes/test.md" } as never, frontmatter: {}, computed: {} };
      const col = column("text", "status");
      const config = { schema: { columns: [col] }, views: [] } as unknown as ViewConfig;

      const fieldEl = renderCardField({
        app: {} as App,
        row,
        col,
        config,
        value: "Active",
        displayType: "text",
        fieldClass: "db-card-field",
        valueClass: "db-card-value",
        labelClass: "db-card-label",
        badgesClass: "db-card-badges",
        linkClass: "db-card-link",
        onEdit,
      }) as unknown as MockElement;

      expect(fieldEl.tabIndex).toBe(-1);
      expect(fieldEl.getAttribute("role")).toBe("gridcell");

      // Enter key triggers edit and prevents default
      const enterPreventDefault = vi.fn();
      fieldEl.dispatchEvent({
        type: "keydown",
        key: "Enter",
        isComposing: false,
        preventDefault: enterPreventDefault,
        stopPropagation: vi.fn(),
        target: fieldEl,
      });
      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(enterPreventDefault).toHaveBeenCalled();

      // Space key triggers edit and asserts preventDefault
      const spacePreventDefault = vi.fn();
      fieldEl.dispatchEvent({
        type: "keydown",
        key: " ",
        isComposing: false,
        preventDefault: spacePreventDefault,
        stopPropagation: vi.fn(),
        target: fieldEl,
      });
      expect(onEdit).toHaveBeenCalledTimes(2);
      expect(spacePreventDefault).toHaveBeenCalled();

      // IME composition is ignored
      fieldEl.dispatchEvent({
        type: "keydown",
        key: "Enter",
        isComposing: true,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        target: fieldEl,
      });
      expect(onEdit).toHaveBeenCalledTimes(2);
    } finally {
      globalThis.window = origWindow;
    }
  });

  it("proves Enter on an anchor or checkbox does NOT trigger field edit", () => {
    const origWindow = globalThis.window;
    (globalThis as unknown as { window: { activeDocument: { createElement: (tag: string) => MockElement } } }).window = {
      activeDocument: {
        createElement: (tag: string) => new MockElement(tag),
      },
    };

    try {
      const onEdit = vi.fn();
      const row: RowData = { file: { path: "notes/test.md" } as never, frontmatter: {}, computed: {} };
      const col = column("checkbox", "done");
      const config = { schema: { columns: [col] }, views: [] } as unknown as ViewConfig;

      const fieldEl = renderCardField({
        app: {} as App,
        row,
        col,
        config,
        value: true,
        displayType: "checkbox",
        fieldClass: "db-card-field",
        valueClass: "db-card-value",
        labelClass: "db-card-label",
        badgesClass: "db-card-badges",
        linkClass: "db-card-link",
        onEdit,
      }) as unknown as MockElement;

      const checkboxEl = fieldEl.querySelector("input");
      expect(checkboxEl).not.toBeNull();

      // Enter key dispatched directly on the checkbox descendant must NOT trigger field edit
      const preventDefault = vi.fn();
      fieldEl.dispatchEvent({
        type: "keydown",
        key: "Enter",
        isComposing: false,
        preventDefault,
        stopPropagation: vi.fn(),
        target: checkboxEl,
      });
      expect(onEdit).not.toHaveBeenCalled();
    } finally {
      globalThis.window = origWindow;
    }
  });

  it("ensures read-only fields are not focusable and do not attach edit handlers", () => {
    const origWindow = globalThis.window;
    (globalThis as unknown as { window: { activeDocument: { createElement: (tag: string) => MockElement } } }).window = {
      activeDocument: {
        createElement: (tag: string) => new MockElement(tag),
      },
    };

    try {
      const onEdit = vi.fn();
      const row: RowData = { file: { path: "notes/test.md" } as never, frontmatter: {}, computed: {} };
      const col = column("text", "status");
      const config = { schema: { columns: [col] }, views: [] } as unknown as ViewConfig;

      const fieldEl = renderCardField({
        app: {} as App,
        row,
        col,
        config,
        value: "Active",
        displayType: "text",
        fieldClass: "db-card-field",
        valueClass: "db-card-value",
        labelClass: "db-card-label",
        badgesClass: "db-card-badges",
        linkClass: "db-card-link",
        readOnly: true,
        onEdit,
      }) as unknown as MockElement;

      // Read-only fields should not have tabindex attribute set (not focusable as roving targets)
      expect(fieldEl.hasAttribute("tabindex")).toBe(false);
      expect(fieldEl.getAttribute("role")).toBe("gridcell");

      // Keydown on read-only field does not trigger edit
      fieldEl.dispatchEvent({
        type: "keydown",
        key: "Enter",
        isComposing: false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        target: fieldEl,
      });
      expect(onEdit).not.toHaveBeenCalled();
    } finally {
      globalThis.window = origWindow;
    }
  });

  it("attaches accessible keyboard trigger for column menu with tabindex=-1 and no role=button on label", () => {
    const origWindow = globalThis.window;
    (globalThis as unknown as { window: { activeDocument: { createElement: (tag: string) => MockElement } } }).window = {
      activeDocument: {
        createElement: (tag: string) => new MockElement(tag),
      },
    };

    try {
      const onShowColumnMenu = vi.fn();
      const row: RowData = { file: { path: "notes/test.md" } as never, frontmatter: {}, computed: {} };
      const col = column("text", "status");
      const config = { schema: { columns: [col] }, views: [] } as unknown as ViewConfig;

      const fieldEl = renderCardField({
        app: {} as App,
        row,
        col,
        config,
        value: "Active",
        displayType: "text",
        fieldClass: "db-card-field",
        valueClass: "db-card-value",
        labelClass: "db-card-label",
        badgesClass: "db-card-badges",
        linkClass: "db-card-link",
        onShowColumnMenu,
      }) as unknown as MockElement;

      const labelEl = fieldEl.children.find((c) => c.className === "db-card-label");
      expect(labelEl).toBeDefined();
      expect(labelEl?.tabIndex).toBe(-1);
      expect(labelEl?.getAttribute("role")).toBeNull();
      expect(labelEl?.getAttribute("aria-haspopup")).toBe("menu");

      // Enter key on label opens column menu
      labelEl?.dispatchEvent({
        type: "keydown",
        key: "Enter",
        isComposing: false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        target: labelEl,
      });
      expect(onShowColumnMenu).toHaveBeenCalledTimes(1);

      // ContextMenu key on label opens column menu
      labelEl?.dispatchEvent({
        type: "keydown",
        key: "ContextMenu",
        isComposing: false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        target: labelEl,
      });
      expect(onShowColumnMenu).toHaveBeenCalledTimes(2);

      // Shift+F10 on label opens column menu
      labelEl?.dispatchEvent({
        type: "keydown",
        key: "F10",
        shiftKey: true,
        isComposing: false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        target: labelEl,
      });
      expect(onShowColumnMenu).toHaveBeenCalledTimes(3);
    } finally {
      globalThis.window = origWindow;
    }
  });
});
