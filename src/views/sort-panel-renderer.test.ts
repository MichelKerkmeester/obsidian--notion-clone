// ───────────────────────────────────────────────────────────────────
// MODULE:    sort-panel-renderer.test
// COMPONENT: searchable sort field dropdown
// ───────────────────────────────────────────────────────────────────
//
// Was a source grep asserting `searchable: true` appeared exactly once in the file — a claim that
// stays true no matter which call site carries the flag, so a wiring mistake that moved it onto the
// direction dropdown (or duplicated it) would read as green as long as the total count held. This
// suite mounts the real renderer instead and reads which `createDropdownField` call — field or
// direction — the flag actually reached, `./dropdown-field`'s own contract mocked out since it
// carries its own suite (`dropdown-field.test.ts`) and this file's concern is the caller's wiring,
// not the popover it drives.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ViewConfig } from "../data/types";
import { setLocale } from "../i18n";
import { SortPanelRenderer, type SortPanelActions } from "./sort-panel-renderer";
import type { DatabaseViewState } from "./view-state-store";

vi.mock("obsidian", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, setIcon: vi.fn(), setTooltip: vi.fn() };
});

vi.mock("./popover-position", () => ({
  PANEL_POPOVER: {},
  positionToolbarPopover: vi.fn(),
}));

interface RecordedDropdownCall {
  className?: string;
  value: string;
  searchable?: boolean;
}

const dropdownCalls: RecordedDropdownCall[] = [];

vi.mock("./dropdown-field", () => ({
  createDropdownField: vi.fn((options: { parent: { createEl: (tag: string, opts: unknown) => unknown }; className?: string; value: string; searchable?: boolean }) => {
    dropdownCalls.push({ className: options.className, value: options.value, searchable: options.searchable });
    const button = options.parent.createEl("button", { cls: options.className });
    return { button, valueEl: button, close: () => {} };
  }),
}));

// ───────────────────────────────────────────────────────────────────
// 2. FAKE DOM
// ───────────────────────────────────────────────────────────────────
//
// `renderRule` builds its row through `createConditionRow` (toolbar-primitives.ts), whose
// `appendConditionPart` measures a min-width floor on every appended child via
// `child instanceof HTMLElement` — absent in this suite's `node` environment. `HTMLElement` is
// stubbed onto `globalThis` as this same class for the span of this file's tests, restored after
// each one, so that one structural check does not need a browser to answer.

class FakeElement {
  tagName: string;
  className: string;
  textContent = "";
  parentElement: FakeElement | null = null;
  children: FakeElement[] = [];
  attributes = new Map<string, string>();
  ownerDocument: { body: FakeElement; querySelector: (selector: string) => FakeElement | null };
  isConnected = true;
  disabled = false;
  style: Record<string, string> = {};
  onclick: (() => void) | null = null;
  tabIndex = 0;
  title = "";

  constructor(tagName = "div", className = "", ownerDocument?: FakeElement["ownerDocument"]) {
    this.tagName = tagName.toUpperCase();
    this.className = className;
    const doc: FakeElement["ownerDocument"] = {
      body: this,
      querySelector: (selector: string) => this.querySelector(selector),
    };
    this.ownerDocument = ownerDocument ?? doc;
  }

  get nextSibling(): FakeElement | null {
    if (!this.parentElement) return null;
    const index = this.parentElement.children.indexOf(this);
    return index >= 0 ? this.parentElement.children[index + 1] ?? null : null;
  }

  hasClass(cls: string): boolean {
    return this.className.split(/\s+/).includes(cls);
  }

  addClass(cls: string): void {
    if (this.hasClass(cls)) return;
    this.className = [this.className, cls].filter(Boolean).join(" ");
  }

  removeClass(...classes: string[]): void {
    const drop = new Set(classes);
    this.className = this.className.split(/\s+/).filter((entry) => entry && !drop.has(entry)).join(" ");
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  setAttr(name: string, value: string): void {
    this.setAttribute(name, value);
  }

  focus(): void {}

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

  insertBefore(node: FakeElement, ref: FakeElement | null): FakeElement {
    node.parentElement?.children.splice(node.parentElement.children.indexOf(node), 1);
    node.parentElement = this;
    node.ownerDocument = this.ownerDocument;
    const index = ref ? this.children.indexOf(ref) : -1;
    if (index >= 0) this.children.splice(index, 0, node);
    else this.children.push(node);
    return node;
  }

  empty(): void {
    for (const child of this.children) child.parentElement = null;
    this.children = [];
    this.textContent = "";
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
    const out: FakeElement[] = [];
    const visit = (node: FakeElement) => {
      for (const child of node.children) {
        if (matches(child, selector)) out.push(child);
        visit(child);
      }
    };
    visit(this);
    return out;
  }
}

function matches(el: FakeElement, selector: string): boolean {
  if (selector.startsWith(".")) return el.hasClass(selector.slice(1));
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
    filters: [],
    hiddenColumns: new Set(),
    filterLogic: "and",
    sortDirection: "asc",
    sortRules: [{ field: "colA", direction: "asc" }],
  };
}

function makeActions(): SortPanelActions {
  return { save: vi.fn(), refresh: vi.fn(), close: vi.fn() };
}

beforeEach(() => {
  setLocale("en");
  dropdownCalls.length = 0;
  vi.stubGlobal("HTMLElement", FakeElement);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ───────────────────────────────────────────────────────────────────
// 4. SEARCHABLE FIELD DROPDOWN — mounted
// ───────────────────────────────────────────────────────────────────

describe("SortPanelRenderer searchable field dropdown (mounted)", () => {
  it("passes searchable: true on the sort field dropdown, and not on the direction dropdown beside it", () => {
    const container = makeContainer();
    const renderer = new SortPanelRenderer();
    renderer.render(container as unknown as HTMLElement, true, makeConfig(), makeState(), makeActions());

    const field = dropdownCalls.find((call) => call.className?.includes("obnotion-sort-field-dropdown"));
    const direction = dropdownCalls.find((call) => call.className?.includes("obnotion-sort-direction-dropdown"));
    expect(field).toBeDefined();
    expect(direction).toBeDefined();
    expect(field?.searchable).toBe(true);
    expect(direction?.searchable).toBeUndefined();
  });

  it("mounts exactly one field dropdown and one direction dropdown per rule", () => {
    const container = makeContainer();
    const renderer = new SortPanelRenderer();
    const state = makeState();
    state.sortRules = [{ field: "colA", direction: "asc" }, { field: "file.name", direction: "desc" }];
    renderer.render(container as unknown as HTMLElement, true, makeConfig(), state, makeActions());

    const fieldCalls = dropdownCalls.filter((call) => call.className?.includes("obnotion-sort-field-dropdown"));
    const directionCalls = dropdownCalls.filter((call) => call.className?.includes("obnotion-sort-direction-dropdown"));
    expect(fieldCalls).toHaveLength(2);
    expect(directionCalls).toHaveLength(2);
    expect(fieldCalls.every((call) => call.searchable === true)).toBe(true);
    expect(directionCalls.every((call) => call.searchable === undefined)).toBe(true);
  });
});
