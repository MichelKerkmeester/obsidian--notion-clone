// ───────────────────────────────────────────────────────────────────
// MODULE:    active-view-controls-renderer.test
// COMPONENT: the chip rail's per-group add control
// ───────────────────────────────────────────────────────────────────
//
// Was a source grep asserting the strings `obnotion-active-control-add`, `actions.addFilter` and
// `actions.addSort` appeared somewhere in the file — true regardless of whether the control is
// ever actually wired to those actions or reachable from a click. This suite mounts the real
// renderer on a hand-built tree instead (the renderer's own dependencies are plain data helpers
// and `obsidian`'s `setIcon`, so nothing here needs mocking beyond that) and drives the add
// control's click through to the action it promises.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ViewConfig } from "../data/types";
import { setLocale } from "../i18n";
import { ActiveViewControlsRenderer, type ActiveViewControlsActions } from "./active-view-controls-renderer";
import type { DatabaseViewState } from "./view-state-store";

vi.mock("obsidian", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, setIcon: vi.fn() };
});

// ───────────────────────────────────────────────────────────────────
// 2. FAKE DOM
// ───────────────────────────────────────────────────────────────────
//
// Extends the hand-built element `view-config-panel-renderer.test.ts` mounts on with what this
// renderer additionally reads: `:scope > X` child-combinator lookups (`containerEl.querySelector(
// ":scope > .obnotion-header > .obnotion-active-view-controls")`), `dataset`, and `setText`. `window` is
// stubbed with the timer/rAF surface `render()` calls unconditionally once a rail draws.

class FakeElement {
  tagName: string;
  className: string;
  textContent = "";
  parentElement: FakeElement | null = null;
  children: FakeElement[] = [];
  attributes = new Map<string, string>();
  dataset: Record<string, string> = {};
  ownerDocument: { body: FakeElement; querySelector: (selector: string) => FakeElement | null };
  isConnected = true;
  scrollLeft = 0;
  scrollWidth = 0;
  clientWidth = 0;
  onclick: ((event: { preventDefault(): void; stopPropagation(): void }) => void) | null = null;

  constructor(tagName = "div", className = "", ownerDocument?: FakeElement["ownerDocument"]) {
    this.tagName = tagName.toUpperCase();
    this.className = className;
    const doc: FakeElement["ownerDocument"] = {
      body: this,
      querySelector: (selector: string) => this.querySelector(selector),
    };
    this.ownerDocument = ownerDocument ?? doc;
  }

  hasClass(cls: string): boolean {
    return this.className.split(/\s+/).includes(cls);
  }

  addClass(cls: string): void {
    if (this.hasClass(cls)) return;
    this.className = [this.className, cls].filter(Boolean).join(" ");
  }

  toggleClass(cls: string, force?: boolean): void {
    const shouldAdd = force === undefined ? !this.hasClass(cls) : force;
    if (shouldAdd) this.addClass(cls);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  setText(text: string): void {
    this.textContent = text;
  }

  createDiv(options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): FakeElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): FakeElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string | string[]; text?: string; attr?: Record<string, string | number | boolean | null> } = {}): FakeElement {
    const className = Array.isArray(options.cls) ? options.cls.filter(Boolean).join(" ") : (options.cls || "");
    const el = new FakeElement(tag, className, this.ownerDocument);
    if (options.text != null) el.textContent = String(options.text);
    if (options.attr) {
      for (const [key, value] of Object.entries(options.attr)) {
        if (value == null) continue;
        el.setAttribute(key, String(value));
      }
    }
    this.appendChild(el);
    return el;
  }

  appendChild(child: FakeElement): FakeElement {
    child.parentElement = this;
    child.ownerDocument = this.ownerDocument;
    this.children.push(child);
    return child;
  }

  remove(): void {
    this.isConnected = false;
    if (!this.parentElement) return;
    const index = this.parentElement.children.indexOf(this);
    if (index >= 0) this.parentElement.children.splice(index, 1);
    this.parentElement = null;
  }

  addEventListener(): void {}
  removeEventListener(): void {}

  querySelector(selector: string): FakeElement | null {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector: string): FakeElement[] {
    if (selector.includes(">")) {
      const chain = selector.split(">").map((part) => part.trim());
      let contexts: FakeElement[] = [this];
      for (const part of chain) {
        if (part === ":scope") continue;
        const next: FakeElement[] = [];
        for (const ctx of contexts) {
          for (const child of ctx.children) {
            if (matchesSimple(child, part)) next.push(child);
          }
        }
        contexts = next;
      }
      return contexts;
    }
    const out: FakeElement[] = [];
    const visit = (node: FakeElement) => {
      for (const child of node.children) {
        if (matchesSimple(child, selector)) out.push(child);
        visit(child);
      }
    };
    visit(this);
    return out;
  }
}

function matchesSimple(el: FakeElement, selector: string): boolean {
  if (selector.startsWith(".")) {
    // Compound class selectors (`.a.b`) require every class to be present.
    return selector.slice(1).split(".").every((cls) => el.hasClass(cls));
  }
  if (/^[a-zA-Z][\w-]*$/.test(selector)) return el.tagName === selector.toUpperCase();
  return false;
}

// ───────────────────────────────────────────────────────────────────
// 3. FIXTURES
// ───────────────────────────────────────────────────────────────────

function makeContainer(): FakeElement {
  const body = new FakeElement("body");
  const doc = { body, querySelector: (selector: string) => body.querySelector(selector) };
  body.ownerDocument = doc;
  const container = body.createDiv({ cls: "obnotion-container" });
  container.createDiv({ cls: "obnotion-header" });
  return container;
}

function makeConfig(): ViewConfig {
  return {
    id: "view-1",
    name: "Table",
    viewType: "table",
    sourceFolder: "notes",
    schema: {
      columns: [
        { key: "file.name", label: "Name", type: "text" },
        { key: "colA", label: "Alpha", type: "text" },
      ],
      computedFields: [],
    },
  };
}

function makeState(): DatabaseViewState {
  return {
    searchText: "",
    statusFilter: "",
    groupByField: "",
    filters: [{ field: "colA", op: "contains", value: "x" }],
    hiddenColumns: new Set(),
    filterLogic: "and",
    sortDirection: "asc",
    sortRules: [{ field: "colA", direction: "asc" }],
  };
}

function makeActions(overrides: Partial<ActiveViewControlsActions> = {}): ActiveViewControlsActions {
  return {
    editFilter: vi.fn(),
    editSort: vi.fn(),
    removeFilter: vi.fn(),
    removeSort: vi.fn(),
    toggleFilterLogic: vi.fn(),
    clearAll: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  setLocale("en");
  vi.stubGlobal("window", {
    setTimeout: (...args: Parameters<typeof setTimeout>) => globalThis.setTimeout(...args),
    clearTimeout: (...args: Parameters<typeof clearTimeout>) => globalThis.clearTimeout(...args),
    requestAnimationFrame: (cb: () => void) => cb(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ───────────────────────────────────────────────────────────────────
// 4. ADD CONTROL — mounted
// ───────────────────────────────────────────────────────────────────

describe("ActiveViewControlsRenderer chip rail add control (mounted)", () => {
  it("draws one add control per rule group, reachable only when the host supplies the action", () => {
    const container = makeContainer();
    const actions = makeActions({ addFilter: vi.fn(), addSort: vi.fn() });
    new ActiveViewControlsRenderer().render(container as unknown as HTMLElement, makeConfig(), makeState(), actions);

    const rail = container.querySelector(".obnotion-active-view-controls");
    expect(rail).not.toBeNull();
    const addButtons = rail?.querySelectorAll(".obnotion-active-control-add") ?? [];
    expect(addButtons).toHaveLength(2);
  });

  it("wires the filter group's add control to actions.addFilter, passing the button as the anchor", () => {
    const container = makeContainer();
    const addFilter = vi.fn();
    const actions = makeActions({ addFilter, addSort: vi.fn() });
    new ActiveViewControlsRenderer().render(container as unknown as HTMLElement, makeConfig(), makeState(), actions);

    const filterGroup = container.querySelector(".obnotion-active-control-group.is-filter");
    const addButton = filterGroup?.querySelector(".obnotion-active-control-add");
    expect(addButton).not.toBeNull();
    addButton?.onclick?.({ preventDefault: () => {}, stopPropagation: () => {} });
    expect(addFilter).toHaveBeenCalledTimes(1);
    expect(addFilter).toHaveBeenCalledWith(addButton);
  });

  it("wires the sort group's add control to actions.addSort", () => {
    const container = makeContainer();
    const addSort = vi.fn();
    const actions = makeActions({ addFilter: vi.fn(), addSort });
    new ActiveViewControlsRenderer().render(container as unknown as HTMLElement, makeConfig(), makeState(), actions);

    const sortGroup = container.querySelector(".obnotion-active-control-group.is-sort");
    const addButton = sortGroup?.querySelector(".obnotion-active-control-add");
    addButton?.onclick?.({ preventDefault: () => {}, stopPropagation: () => {} });
    expect(addSort).toHaveBeenCalledTimes(1);
    expect(addSort).toHaveBeenCalledWith(addButton);
  });

  it("gates each add control on its own group's presence — a host that omits the action keeps the rail exactly as it drew before the control existed", () => {
    const container = makeContainer();
    const actions = makeActions();
    new ActiveViewControlsRenderer().render(container as unknown as HTMLElement, makeConfig(), makeState(), actions);

    const rail = container.querySelector(".obnotion-active-view-controls");
    expect(rail).not.toBeNull();
    expect(rail?.querySelectorAll(".obnotion-active-control-add")).toHaveLength(0);
  });
});
