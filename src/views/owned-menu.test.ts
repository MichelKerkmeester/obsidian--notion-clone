// ───────────────────────────────────────────────────────────────────
// MODULE:    owned-menu.test
// COMPONENT: unit coverage for the primitive's submenu handle and its
//            never-empty fallback row
// ───────────────────────────────────────────────────────────────────
//
// Drives the real `createOwnedMenu` against a mock DOM, the way
// board-renderer-hierarchy.test.ts and calendar-timeline-tick-label.test.ts
// already drive their own renderers — MockElement reimplements just enough
// of the Obsidian DOM helper surface (createDiv/createEl, class list,
// attributes, focus, event dispatch) to open a menu, click a submenu row,
// and read the child menu it produces, without a mounted view.
//
// `getVisiblePopoverBounds` is the one production function this file
// replaces rather than drives: it measures the real workspace split and
// constructs a `DOMRect`, neither of which exists in this test's Node
// environment, and its own arithmetic is not what a submenu test is
// proving. `resolvePopoverHorizontalLeft`, `clamp` and `setPosition` stay
// real, since the flush-beside-parent placement IS what this leg adds.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & DOM SHIM
// ───────────────────────────────────────────────────────────────────

import { beforeEach, describe, expect, it, vi } from "vitest";

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

/** Reimplements just enough of Obsidian's element helper surface to drive `createOwnedMenu`. */
class MockElement {
  tagName: string;
  parentElement: MockElement | null = null;
  children: MockElement[] = [];
  classes = new Set<string>();
  attributes = new Map<string, string>();
  style: Record<string, string> = {};
  onclick: ((event: MockEvent) => void) | null = null;
  removed = false;
  private rect: Rect = ZERO_RECT;
  private listeners = new Map<string, Set<Listener>>();

  constructor(tagName = "div", cls = "") {
    this.tagName = tagName.toUpperCase();
    if (cls) for (const part of cls.split(/\s+/).filter(Boolean)) this.classes.add(part);
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

  removeAttribute(name: string): void {
    this.attributes.delete(name);
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

  contains(other: unknown): boolean {
    let current = other instanceof MockElement ? other : null;
    while (current) {
      if (current === this) return true;
      current = current.parentElement;
    }
    return false;
  }

  querySelectorAll<T = MockElement>(selector: string): T[] {
    // Only the one compound selector `rows()` actually issues: a class plus an optional
    // `:not([attr])` guard. Nothing on the desktop path this suite exercises asks for more.
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

// A single mutable box so `focus()` (called on whatever row instance is live at the time) and the
// document's own `activeElement` getter agree without either side holding a stale reference.
const activeElementRef: { value: MockElement | null } = { value: null };

/** Builds a fresh mock `Document`, wired for `createOwnedMenu`'s desktop code path only. */
function createMockDoc(options: { hoverCapable?: boolean } = {}): {
  doc: Document;
  body: MockElement;
  dispatchDocument(type: string, props?: Record<string, unknown>): MockEvent;
} {
  const body = new MockElement("body");
  const docListeners = new Map<string, Set<Listener>>();
  const hoverCapable = options.hoverCapable ?? false;
  activeElementRef.value = null;

  const doc = {
    body,
    get activeElement() {
      return activeElementRef.value;
    },
    defaultView: {
      matchMedia: (_query: string) => ({ matches: hoverCapable }),
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

  const dispatchDocument = (type: string, props: Record<string, unknown> = {}): MockEvent => {
    const event = new MockEvent(type, props);
    for (const listener of docListeners.get(type) ?? []) listener(event as unknown as never);
    return event;
  };

  return { doc, body, dispatchDocument };
}

// `event.target instanceof Node` and `doc.activeElement instanceof HTMLElement` both read these
// globals at call time, not at import time, so assigning MockElement to both before the suite runs
// is enough for every `instanceof` check `owned-menu.ts` makes.
(globalThis as unknown as { Node: unknown }).Node = MockElement;
(globalThis as unknown as { HTMLElement: unknown }).HTMLElement = MockElement;

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("owned menu — submenu handle", () => {
  let doc: Document;
  let body: MockElement;
  let dispatchDocument: (type: string, props?: Record<string, unknown>) => MockEvent;

  beforeEach(async () => {
    vi.resetModules();
    const mock = createMockDoc();
    doc = mock.doc;
    body = mock.body;
    dispatchDocument = mock.dispatchDocument;
  });

  it("opens a real nested menu through the same factory on click, registers it, and does not close the parent", async () => {
    const { createOwnedMenu } = await import("./owned-menu");
    const parent = createOwnedMenu(doc);
    const row = parent.addRow({
      label: "More",
      submenu: true,
      buildSubmenu: (child) => child.addRow({ label: "Child action" }),
    }) as unknown as MockElement;
    parent.showAt({ x: 0, y: 0 });

    expect(body.children.filter((el) => el.hasClass("db-owned-menu")).length).toBe(1);

    row.dispatch("click");

    const menus = body.children.filter((el) => el.hasClass("db-owned-menu"));
    expect(menus.length).toBe(2);
    expect(row.hasClass("is-submenu-open")).toBe(true);
    expect(row.getAttribute("aria-expanded")).toBe("true");
  });

  it("opens on ArrowRight and on Enter, the same way click does", async () => {
    for (const key of ["ArrowRight", "Enter"]) {
      const mock = createMockDoc();
      const { createOwnedMenu } = await import("./owned-menu");
      const parent = createOwnedMenu(mock.doc);
      const row = parent.addRow({
        label: "More",
        submenu: true,
        buildSubmenu: (child) => child.addRow({ label: "Child action" }),
      }) as unknown as MockElement;
      parent.showAt({ x: 0, y: 0 });

      row.dispatch("keydown", { key });

      const menus = mock.body.children.filter((el) => el.hasClass("db-owned-menu"));
      expect(menus.length, `key=${key}`).toBe(2);
    }
  });

  it("opens on hover behind a hover-capable pointer, and not on a coarse one", async () => {
    const hoverCapable = createMockDoc({ hoverCapable: true });
    const { createOwnedMenu } = await import("./owned-menu");
    const hoverMenu = createOwnedMenu(hoverCapable.doc);
    const hoverRow = hoverMenu.addRow({
      label: "More",
      submenu: true,
      buildSubmenu: (child) => child.addRow({ label: "Child action" }),
    }) as unknown as MockElement;
    hoverMenu.showAt({ x: 0, y: 0 });
    hoverRow.dispatch("pointerenter", { pointerType: "mouse" });
    expect(hoverCapable.body.children.filter((el) => el.hasClass("db-owned-menu")).length).toBe(2);

    const coarse = createMockDoc({ hoverCapable: false });
    const coarseMenu = createOwnedMenu(coarse.doc);
    const coarseRow = coarseMenu.addRow({
      label: "More",
      submenu: true,
      buildSubmenu: (child) => child.addRow({ label: "Child action" }),
    }) as unknown as MockElement;
    coarseMenu.showAt({ x: 0, y: 0 });
    coarseRow.dispatch("pointerenter", { pointerType: "touch" });
    expect(coarse.body.children.filter((el) => el.hasClass("db-owned-menu")).length).toBe(1);
  });

  it("closes only the innermost menu on Escape, leaving the parent open", async () => {
    const { createOwnedMenu } = await import("./owned-menu");
    const parent = createOwnedMenu(doc);
    const row = parent.addRow({
      label: "More",
      submenu: true,
      buildSubmenu: (child) => child.addRow({ label: "Child action" }),
    }) as unknown as MockElement;
    parent.showAt({ x: 0, y: 0 });
    row.dispatch("click");
    expect(body.children.filter((el) => el.hasClass("db-owned-menu")).length).toBe(2);

    dispatchDocument("keydown", { key: "Escape" });
    expect(body.children.filter((el) => el.hasClass("db-owned-menu")).length).toBe(1);
    expect(row.hasClass("is-submenu-open")).toBe(false);
    expect(body.children.some((el) => el.hasClass("db-owned-menu"))).toBe(true);

    dispatchDocument("keydown", { key: "Escape" });
    expect(body.children.filter((el) => el.hasClass("db-owned-menu")).length).toBe(0);
  });

  it("dismisses only the child on an outside pointerdown, leaving the parent for a second press", async () => {
    const { createOwnedMenu } = await import("./owned-menu");
    const parent = createOwnedMenu(doc);
    const row = parent.addRow({
      label: "More",
      submenu: true,
      buildSubmenu: (child) => child.addRow({ label: "Child action" }),
    }) as unknown as MockElement;
    parent.showAt({ x: 0, y: 0 });
    row.dispatch("click");
    expect(body.children.filter((el) => el.hasClass("db-owned-menu")).length).toBe(2);

    const outside = new MockElement("div");
    dispatchDocument("pointerdown", { target: outside });
    expect(body.children.filter((el) => el.hasClass("db-owned-menu")).length).toBe(1);

    dispatchDocument("pointerdown", { target: outside });
    expect(body.children.filter((el) => el.hasClass("db-owned-menu")).length).toBe(0);
  });
});

describe("owned menu — never-empty fallback", () => {
  it("renders one instructional row when the caller added none", async () => {
    vi.resetModules();
    const { createOwnedMenu } = await import("./owned-menu");
    const { doc, body } = createMockDoc();
    const menu = createOwnedMenu(doc);
    menu.showAt({ x: 0, y: 0 });

    const rows = body.querySelectorAll<MockElement>(".db-menu-item");
    expect(rows.length).toBe(1);
    expect(rows[0].hasAttribute("disabled")).toBe(true);
  });

  it("does not add a fallback row when the caller added at least one", async () => {
    vi.resetModules();
    const { createOwnedMenu } = await import("./owned-menu");
    const { doc, body } = createMockDoc();
    const menu = createOwnedMenu(doc);
    menu.addRow({ label: "Only action" });
    menu.showAt({ x: 0, y: 0 });

    const rows = body.querySelectorAll<MockElement>(".db-menu-item");
    expect(rows.length).toBe(1);
    expect(rows[0].hasAttribute("disabled")).toBe(false);
  });
});
