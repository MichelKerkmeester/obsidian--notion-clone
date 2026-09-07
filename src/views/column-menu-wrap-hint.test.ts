// ───────────────────────────────────────────────────────────────────
// MODULE:    column-menu-wrap-hint.test
// COMPONENT: the column menu's Wrap submenu, and the view-switch hint
//            its "Wrap" option carries when the view's own switch is off
// ───────────────────────────────────────────────────────────────────
//
// Drives the real `ColumnMenu.show` against a mock DOM, the same way `owned-menu.test.ts` drives
// `createOwnedMenu` — `MockElement` reimplements just enough of the Obsidian DOM helper surface
// (createDiv/createEl, class list, attributes, event dispatch) to open the column menu, click its
// "Wrap text" row, and read the submenu it builds, without a mounted view. Unlike that file's copy,
// this one also stores the `text` a `createSpan({ text })` call carries, since the assertions here
// are about label and hint *text*, not only classes and counts.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & DOM SHIM
// ───────────────────────────────────────────────────────────────────

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ColumnDef } from "../data/types";
import type { ColumnMenuActions } from "./column-menu";
import { t } from "../i18n";

vi.mock("obsidian", () => ({
  setIcon: vi.fn(),
  setTooltip: vi.fn(),
  Platform: { isMobile: false, isTablet: false },
}));

vi.mock("./popover-position", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./popover-position")>();
  return {
    ...actual,
    isMobileBottomSheet: () => false,
    getVisiblePopoverBounds: () => ({ left: 0, top: 0, right: 1200, bottom: 800, width: 1200, height: 800 }),
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
}

/** Reimplements just enough of the Obsidian DOM helper surface to drive `ColumnMenu.show`. */
class MockElement {
  tagName: string;
  parentElement: MockElement | null = null;
  children: MockElement[] = [];
  classes = new Set<string>();
  attributes = new Map<string, string>();
  text = "";
  onclick: ((event: MockEvent) => void) | null = null;
  removed = false;
  private rect: Rect = ZERO_RECT;
  private listeners = new Map<string, Set<Listener>>();

  constructor(tagName = "div", cls = "") {
    this.tagName = tagName.toUpperCase();
    if (cls) for (const part of cls.split(/\s+/).filter(Boolean)) this.classes.add(part);
  }

  createDiv(options: { cls?: string; text?: string } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string; attr?: Record<string, string>; text?: string } = {}): MockElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string; attr?: Record<string, string>; text?: string } = {}): MockElement {
    const el = new MockElement(tag, options.cls || "");
    if (options.attr) for (const [key, value] of Object.entries(options.attr)) el.attributes.set(key, value);
    if (options.text !== undefined) el.text = options.text;
    el.parentElement = this;
    this.children.push(el);
    return el;
  }

  setAttr(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  hasAttribute(name: string): boolean {
    return this.attributes.has(name);
  }

  setText(text: string): void {
    this.text = text;
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

  toggleClass(name: string, force: boolean): void {
    if (force) this.classes.add(name);
    else this.classes.delete(name);
  }

  setCssProps(_props: Record<string, string>): void {}

  getBoundingClientRect(): Rect {
    return this.rect;
  }

  get isConnected(): boolean {
    if (!this.parentElement) return this.tagName === "BODY";
    return this.parentElement.isConnected;
  }

  contains(other: unknown): boolean {
    let current = other instanceof MockElement ? other : null;
    while (current) {
      if (current === this) return true;
      current = current.parentElement;
    }
    return false;
  }

  querySelectorAll<T = MockElement>(selector: string): T[] {
    const match = /^\.([\w-]+)(?::not\(\[([\w-]+)\]\))?$/.exec(selector.trim());
    if (!match) throw new Error(`MockElement.querySelectorAll: unsupported selector "${selector}"`);
    const [, className, notAttr] = match;
    const results: MockElement[] = [];
    const walk = (node: MockElement) => {
      for (const child of node.children) {
        const matches = child.classes.has(className) && (!notAttr || !child.attributes.has(notAttr));
        if (matches) results.push(child);
        walk(child);
      }
    };
    walk(this);
    return results as unknown as T[];
  }

  querySelector<T = MockElement>(selector: string): T | null {
    return (this.querySelectorAll<T>(selector)[0] as T) ?? null;
  }

  remove(): void {
    this.removed = true;
    if (this.parentElement) {
      const index = this.parentElement.children.indexOf(this);
      if (index >= 0) this.parentElement.children.splice(index, 1);
    }
    this.parentElement = null;
  }

  focus(): void {
    activeElementRef.value = this;
  }

  addEventListener(type: string, listener: Listener): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: Listener): void {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type: string, props: Record<string, unknown> = {}): MockEvent {
    const event = new MockEvent(type, { target: this, ...props });
    for (const listener of this.listeners.get(type) ?? []) listener(event);
    if (type === "click") this.onclick?.(event);
    return event;
  }
}

const activeElementRef: { value: MockElement | null } = { value: null };

function createMockDoc(): { doc: Document; body: MockElement } {
  const body = new MockElement("body");
  const docListeners = new Map<string, Set<Listener>>();
  activeElementRef.value = null;

  const doc = {
    body,
    get activeElement() {
      return activeElementRef.value;
    },
    defaultView: {
      matchMedia: (_query: string) => ({ matches: false }),
    },
    addEventListener: (type: string, listener: Listener) => {
      if (!docListeners.has(type)) docListeners.set(type, new Set());
      docListeners.get(type)!.add(listener);
    },
    removeEventListener: (type: string, listener: Listener) => {
      docListeners.get(type)?.delete(listener);
    },
    querySelector: () => null,
  } as unknown as Document;

  return { doc, body };
}

(globalThis as unknown as { Node: unknown }).Node = MockElement;
(globalThis as unknown as { HTMLElement: unknown }).HTMLElement = MockElement;

function createColumnMenuEvent(doc: Document): MouseEvent {
  return {
    clientX: 0,
    clientY: 0,
    view: { document: doc },
    target: null,
    preventDefault: () => undefined,
    stopPropagation: () => undefined,
    stopImmediatePropagation: () => undefined,
  } as unknown as MouseEvent;
}

function createActions(): ColumnMenuActions {
  return {
    editColumn: vi.fn(),
    editFormula: vi.fn(),
    editStatusOptions: vi.fn(),
    showOptionsEditor: vi.fn(),
    changeColumnType: vi.fn(),
    insertColumn: vi.fn(),
    duplicateColumn: vi.fn(),
    moveColumn: vi.fn(),
    hideColumn: vi.fn(),
    setColumnWrap: vi.fn(),
    setTextRenderMode: vi.fn(),
    setTextLinkScheme: vi.fn(),
    setNumberDisplayStyle: vi.fn(),
    updateNumberDisplayConfig: vi.fn(),
    sortByColumn: vi.fn(),
    deleteColumn: vi.fn(),
  };
}

function createCol(): ColumnDef {
  return { key: "myDate", label: "My Date", type: "date" };
}

/** Finds a `.obnotion-menu-item` row anywhere under `root` whose label span carries this exact text. */
function findRowByLabel(root: MockElement, label: string): MockElement | undefined {
  const stack = [...root.children];
  while (stack.length) {
    const node = stack.shift()!;
    if (node.classes.has("obnotion-menu-item")) {
      const labelEl = node.children.find((child) => child.classes.has("obnotion-menu-item-label"));
      if (labelEl?.text === label) return node;
    }
    stack.push(...node.children);
  }
  return undefined;
}

function hintTextOf(row: MockElement): string | undefined {
  return row.children.find((child) => child.classes.has("obnotion-menu-item-current"))?.text;
}

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("column menu — Wrap submenu view-switch hint", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("shows the view-switch hint on the Wrap option when the view's switch is off", async () => {
    const { doc, body } = createMockDoc();
    const { ColumnMenu } = await import("./column-menu");
    const actions = createActions();
    const col = createCol();
    const menu = new ColumnMenu(actions);
    const event = createColumnMenuEvent(doc);

    menu.show(event, col, undefined, { viewWrapText: false });

    const wrapRow = findRowByLabel(body, t("menu.columnWrap"));
    expect(wrapRow).toBeDefined();
    wrapRow!.dispatch("click");

    const wrapOption = findRowByLabel(body, t("menu.columnWrapOn"));
    expect(wrapOption).toBeDefined();
    expect(hintTextOf(wrapOption!)).toBe(t("menu.columnWrapNeedsViewSwitch"));

    // The option stays selectable: the row carries no disabled state, and choosing it still
    // reaches the action — the choice persists and applies once the switch is turned on.
    expect(wrapOption!.hasAttribute("disabled")).toBe(false);
    wrapOption!.dispatch("click");
    expect(actions.setColumnWrap).toHaveBeenCalledWith(col, true);
  });

  it("shows no hint on the Wrap option once the view's switch is on", async () => {
    const { doc, body } = createMockDoc();
    const { ColumnMenu } = await import("./column-menu");
    const menu = new ColumnMenu(createActions());
    const event = createColumnMenuEvent(doc);

    menu.show(event, createCol(), undefined, { viewWrapText: true });

    const wrapRow = findRowByLabel(body, t("menu.columnWrap"));
    wrapRow!.dispatch("click");

    const wrapOption = findRowByLabel(body, t("menu.columnWrapOn"));
    expect(wrapOption).toBeDefined();
    expect(hintTextOf(wrapOption!)).toBeUndefined();
  });

  it("never hints the Clip or Follow view options, switch on or off", async () => {
    for (const viewWrapText of [true, false]) {
      const { doc, body } = createMockDoc();
      const { ColumnMenu } = await import("./column-menu");
      const menu = new ColumnMenu(createActions());
      const event = createColumnMenuEvent(doc);

      menu.show(event, createCol(), undefined, { viewWrapText });
      findRowByLabel(body, t("menu.columnWrap"))!.dispatch("click");

      for (const key of ["menu.columnWrapOff", "menu.columnWrapFollow"] as const) {
        const row = findRowByLabel(body, t(key));
        expect(row, `${key} viewWrapText=${viewWrapText}`).toBeDefined();
        expect(hintTextOf(row!), `${key} viewWrapText=${viewWrapText}`).toBeUndefined();
      }
    }
  });
});
