// ───────────────────────────────────────────────────────────────────
// MODULE:    dropdown-field.test
// COMPONENT: unit coverage for the shared dropdown popover's anchoring
//            and its search-mode combobox semantics
// ───────────────────────────────────────────────────────────────────
//
// Drives the real `createDropdownField`/`openDropdownMenu` against a mock DOM, the same way
// `owned-menu.test.ts` drives `createOwnedMenu` — `MockElement` reimplements just enough of the
// Obsidian DOM helper surface (createDiv/createEl, class list, attributes, focus, event dispatch,
// a settable `getBoundingClientRect`) to open the popover and read where it landed, without a
// mounted view.
//
// `getVisiblePopoverBounds` is stubbed to a fixed viewport, the one production function this file
// replaces rather than drives, for the same reason `owned-menu.test.ts` replaces it: it measures the
// real workspace split, which does not exist in this test's Node environment. `resolvePopoverHorizontalLeft`,
// `clamp`, `setPosition` and `positionToolbarPopover` itself stay real — the anchoring fix IS what
// this file proves.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & DOM SHIM
// ───────────────────────────────────────────────────────────────────

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => ({
  setIcon: vi.fn(),
  setTooltip: vi.fn(),
  Platform: { isMobile: false, isTablet: false },
}));

// `popover-position` is left entirely real, deliberately: the anchoring fix under test lives inside
// `positionToolbarPopover`, and its own calls to `isMobileBottomSheet`/`getVisiblePopoverBounds` are
// same-module references that a `vi.mock` of this module's exports would never intercept anyway. The
// mock DOM below answers both honestly instead — no `is-phone` class, a fixed
// `window.innerWidth`/`innerHeight`, and `window.activeDocument` set to the test's own document,
// which is what `getVisiblePopoverBounds(null)` resolves against.

// Dismissal (outside-pointerdown, Escape) is `overlay-stack`'s own concern and is exercised there;
// this suite only needs the popover to open and measure correctly, so registration is a no-op.
vi.mock("./popover-auto-close", () => ({
  installPopoverAutoClose: () => () => {},
}));

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

/** Reimplements just enough of the Obsidian DOM helper surface to drive `openDropdownPopover`. */
class MockElement {
  tagName: string;
  parentElement: MockElement | null = null;
  children: MockElement[] = [];
  classes = new Set<string>();
  attributes = new Map<string, string>();
  disabled = false;
  value = "";
  onclick: ((event: MockEvent) => void) | null = null;
  oninput: ((event: MockEvent) => void) | null = null;
  onkeydown: ((event: MockEvent) => void) | null = null;
  scrollHeight = 0;
  clientHeight = 0;
  scrollTop = 0;
  removed = false;
  ownerDocument: unknown;
  private rect: Rect = ZERO_RECT;
  private listeners = new Map<string, Set<Listener>>();
  style: Record<string, unknown> & { removeProperty: (name: string) => void };

  constructor(tagName = "div", cls = "") {
    this.tagName = tagName.toUpperCase();
    if (cls) for (const part of cls.split(/\s+/).filter(Boolean)) this.classes.add(part);
    this.style = { removeProperty: (name: string) => { delete this.style[name]; } };
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
    el.ownerDocument = this.ownerDocument;
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

  toggleAttribute(name: string, force: boolean): void {
    if (force) this.attributes.set(name, "");
    else this.attributes.delete(name);
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

  replaceChildren(): void {
    this.children = [];
  }

  setText(text: string): void {
    this.attributes.set("data-text", text);
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

  scrollIntoView(): void {}

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
    if (type === "input") this.oninput?.(event);
    if (type === "keydown") this.onkeydown?.(event);
    return event;
  }
}

const activeElementRef: { value: MockElement | null } = { value: null };

/** Builds a fresh mock `Document` and a container it and every anchor mount under. */
function createMockDoc(): { doc: Document; body: MockElement; container: MockElement } {
  const body = new MockElement("body");
  const docListeners = new Map<string, Set<Listener>>();
  activeElementRef.value = null;

  const doc = {
    body,
    get activeElement() {
      return activeElementRef.value;
    },
    defaultView: {
      matchMedia: () => ({ matches: false }),
      requestAnimationFrame: () => 0,
      cancelAnimationFrame: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      visualViewport: undefined,
      innerWidth: 1200,
      innerHeight: 800,
    },
    addEventListener: (type: string, listener: Listener) => {
      if (!docListeners.has(type)) docListeners.set(type, new Set());
      docListeners.get(type)!.add(listener);
    },
    removeEventListener: (type: string, listener: Listener) => {
      docListeners.get(type)?.delete(listener);
    },
    querySelector: () => null,
    createElement: (tag: string) => {
      const el = new MockElement(tag);
      el.ownerDocument = doc;
      return el;
    },
  } as unknown as Document;

  body.ownerDocument = doc;
  const container = body.createDiv({ cls: "note-database-container" });
  (globalThis as unknown as { window: { activeDocument: unknown } }).window.activeDocument = doc;
  return { doc, body, container: container as unknown as MockElement };
}

(globalThis as unknown as { Node: unknown }).Node = MockElement;
(globalThis as unknown as { HTMLElement: unknown }).HTMLElement = MockElement;
(globalThis as unknown as { window: unknown }).window = {
  setTimeout: (fn: (...args: unknown[]) => void, ms?: number) => setTimeout(fn, ms),
  clearTimeout: (id: unknown) => clearTimeout(id as NodeJS.Timeout),
  activeDocument: undefined,
};
// `getVisiblePopoverBounds` constructs its answer with `new DOMRect(...)`, which only exists in a
// browser's DOM lib — this suite runs under vitest's plain `node` environment (see
// `vitest.config.ts`), so the constructor is polyfilled with the one shape that function reads.
(globalThis as unknown as { DOMRect: unknown }).DOMRect = class {
  constructor(public left = 0, public top = 0, public width = 0, public height = 0) {}
  get right() { return this.left + this.width; }
  get bottom() { return this.top + this.height; }
};

function makeOptions(count: number): { value: string; text: string }[] {
  return Array.from({ length: count }, (_, index) => ({ value: `v${index}`, text: `Option ${index}` }));
}

// ───────────────────────────────────────────────────────────────────
// 2. TESTS — ANCHORING
// ───────────────────────────────────────────────────────────────────

describe("dropdown popover — anchoring", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("left-aligns the popover under a trigger narrower than the panel, not right-aligned", async () => {
    const { doc, container } = createMockDoc();
    const { openDropdownMenu } = await import("./dropdown-field");
    const anchor = container.createEl("button", { cls: "db-filter-operator-dropdown" }) as unknown as HTMLElement;
    (anchor as unknown as MockElement).ownerDocument = doc;
    // The operator's screenshot: a ~190px-wide trigger, a popover measuring wider than it once
    // its rows are laid out. Anchor left 290, right 480 — matching `.operator-dropdown-report.png`.
    (anchor as unknown as MockElement).setRect({ left: 290, top: 100, right: 480, bottom: 130, width: 190, height: 30 });

    openDropdownMenu({
      anchor,
      label: "Operator",
      options: [
        { value: "eq", text: "equals" },
        { value: "neq", text: "does not equal" },
        { value: "contains", text: "contains" },
        { value: "empty", text: "is empty" },
        { value: "notempty", text: "is not empty" },
      ],
      value: "contains",
      onChange: () => {},
    });

    const panel = container.querySelector<MockElement>(".db-dropdown-popover");
    expect(panel).not.toBeNull();
    // Left-aligned: the panel's left edge sits at the trigger's left edge (290), not at
    // `anchor.right - width` (480 - 280 = 200), which is the pre-fix, right-aligned defect.
    expect(panel!.style.left).toBe("290px");
  });

  it("clamps into the viewport instead of running past the right edge when left-aligning would overflow", async () => {
    const { doc, container } = createMockDoc();
    const { openDropdownMenu } = await import("./dropdown-field");
    const anchor = container.createEl("button", {}) as unknown as HTMLElement;
    (anchor as unknown as MockElement).ownerDocument = doc;
    // A trigger hard against the right edge of a 1200px viewport: left-aligning a 280px panel here
    // (1150 + 280 = 1430) would run 230px past the bounds this suite fixes at 1200.
    (anchor as unknown as MockElement).setRect({ left: 1150, top: 100, right: 1190, bottom: 130, width: 40, height: 30 });

    openDropdownMenu({
      anchor,
      label: "Operator",
      options: [{ value: "a", text: "A" }, { value: "b", text: "B" }],
      value: "a",
      onChange: () => {},
    });

    const panel = container.querySelector<MockElement>(".db-dropdown-popover");
    const left = Number.parseFloat(String(panel!.style.left));
    // `margin: 12` in `positionToolbarPopover`'s default; the panel's right edge must not pass
    // the 1200px bound, and its left edge must not pass 0 either.
    expect(left).toBeGreaterThanOrEqual(0);
    expect(left + 280).toBeLessThanOrEqual(1200);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. TESTS — SEARCH THRESHOLD
// ───────────────────────────────────────────────────────────────────

describe("dropdown popover — search threshold", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("renders no search field for a searchable dropdown at or under the threshold", async () => {
    const { doc, container } = createMockDoc();
    const { openDropdownMenu } = await import("./dropdown-field");
    const anchor = container.createEl("button", {}) as unknown as HTMLElement;
    (anchor as unknown as MockElement).ownerDocument = doc;
    (anchor as unknown as MockElement).setRect({ left: 0, top: 0, right: 100, bottom: 30, width: 100, height: 30 });

    openDropdownMenu({
      anchor,
      label: "Operator",
      options: makeOptions(8),
      value: "v0",
      searchable: true,
      onChange: () => {},
    });

    const panel = container.querySelector<MockElement>(".db-dropdown-popover");
    expect(panel!.hasClass("is-searchable")).toBe(false);
    expect(panel!.querySelector(".db-dropdown-search")).toBeNull();
  });

  it("renders a focused, filterable search field above the threshold", async () => {
    const { doc, container } = createMockDoc();
    const { openDropdownMenu } = await import("./dropdown-field");
    const anchor = container.createEl("button", {}) as unknown as HTMLElement;
    (anchor as unknown as MockElement).ownerDocument = doc;
    (anchor as unknown as MockElement).setRect({ left: 0, top: 0, right: 100, bottom: 30, width: 100, height: 30 });

    openDropdownMenu({
      anchor,
      label: "Property",
      options: makeOptions(9),
      value: "v0",
      searchable: true,
      onChange: () => {},
    });

    const panel = container.querySelector<MockElement>(".db-dropdown-popover");
    expect(panel!.hasClass("is-searchable")).toBe(true);
    const input = panel!.querySelector<MockElement>(".db-dropdown-search")?.children[0];
    expect(input).toBeTruthy();
    expect(input!.getAttribute("role")).toBe("combobox");
    expect(input!.getAttribute("aria-expanded")).toBe("true");

    // Typing filters the list live, case-insensitive substring.
    input!.value = "OPTION 3";
    input!.dispatch("input");
    const visible = panel!
      .querySelectorAll<MockElement>(".db-dropdown-option")
      .filter((row) => !row.hasClass("is-hidden"));
    expect(visible.map((row) => row.getAttribute("data-value"))).toEqual(["v3"]);
    expect(input!.getAttribute("aria-activedescendant")).toBe(visible[0].getAttribute("id"));
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. TESTS — KEYBOARD CONTRACT
// ───────────────────────────────────────────────────────────────────

describe("dropdown popover — search-field keyboard contract", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("Tab commits the highlighted row instead of leaving the popover open uncommitted", async () => {
    const { doc, container } = createMockDoc();
    const { openDropdownMenu } = await import("./dropdown-field");
    const anchor = container.createEl("button", {}) as unknown as HTMLElement;
    (anchor as unknown as MockElement).ownerDocument = doc;
    (anchor as unknown as MockElement).setRect({ left: 0, top: 0, right: 100, bottom: 30, width: 100, height: 30 });

    let picked: string | undefined;
    openDropdownMenu({
      anchor,
      label: "Property",
      options: makeOptions(9),
      value: "v0",
      searchable: true,
      onChange: (value) => { picked = value; },
    });

    const panel = container.querySelector<MockElement>(".db-dropdown-popover");
    const input = panel!.querySelector<MockElement>(".db-dropdown-search")!.children[0];
    const rows = panel!.querySelectorAll<MockElement>(".db-dropdown-option");
    // The first ArrowDown hands focus from the search input to the currently active row (`v0`,
    // matching `value`) rather than advancing it — a real browser then routes every further
    // keydown through whichever row now has focus, which is the panel's own listener, not the
    // input's. The test drives that same handoff explicitly rather than assuming it.
    input.dispatch("keydown", { key: "ArrowDown" });
    panel!.dispatch("keydown", { key: "ArrowDown", target: rows[0] });
    panel!.dispatch("keydown", { key: "ArrowDown", target: rows[1] });
    const event = panel!.dispatch("keydown", { key: "Tab", target: rows[2] });

    expect(picked).toBe("v2");
    expect(event.defaultPrevented).toBe(true);
  });

  it("Escape leaves the value unchanged — nothing commits before an explicit choice", async () => {
    const { doc, container } = createMockDoc();
    const { openDropdownMenu } = await import("./dropdown-field");
    const anchor = container.createEl("button", {}) as unknown as HTMLElement;
    (anchor as unknown as MockElement).ownerDocument = doc;
    (anchor as unknown as MockElement).setRect({ left: 0, top: 0, right: 100, bottom: 30, width: 100, height: 30 });

    const onChange = vi.fn();
    openDropdownMenu({
      anchor,
      label: "Property",
      options: makeOptions(9),
      value: "v0",
      searchable: true,
      onChange,
    });

    const panel = container.querySelector<MockElement>(".db-dropdown-popover");
    const input = panel!.querySelector<MockElement>(".db-dropdown-search")!.children[0];
    input.dispatch("keydown", { key: "ArrowDown" });
    input.dispatch("keydown", { key: "ArrowDown" });
    // Typing and arrowing never call `onChange` on their own — only a row's own selection does, so
    // there is nothing for Escape to revert. `installPopoverAutoClose` (mocked here) owns the close.
    expect(onChange).not.toHaveBeenCalled();
  });
});
