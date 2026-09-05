// ───────────────────────────────────────────────────────────────────
// MODULE:    view-config-panel-renderer.test
// COMPONENT: phone body grammar for the settings sheet
// ───────────────────────────────────────────────────────────────────
//
// The settings sheet already wore shared chrome. Its body still drew the
// desktop two-column grid, a native radio group, and a switch that is not
// the shared checkbox. This suite mounts the real renderer on a hand-built
// tree (no jsdom) and asks describeSheetGrammar the structural questions it
// can still answer without a CSS engine (dropdown, segmented), plus the
// desktop path that must stay the grid. `rows` reads computed padding now
// (sheet-grammar.ts) and is proven by the real browser lane instead.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { App } from "obsidian";
import type { DatabaseConfig, ViewConfig } from "../data/types";
import { __resetVaultPropertiesCacheForTests } from "../data/vault-properties";
import { setLocale } from "../i18n";
import { describeSheetGrammar } from "./sheet-grammar";
import { ViewConfigPanelRenderer, type ViewConfigPanelActions } from "./view-config-panel-renderer";

vi.mock("obsidian", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    setIcon: vi.fn(),
    setTooltip: vi.fn(),
    Notice: class {
      constructor(_message?: string) {}
    },
  };
});

vi.mock("./image-file-suggest-modal", () => ({ ImageFileSuggestModal: class {} }));
vi.mock("./markdown-file-suggest-modal", () => ({ MarkdownFileSuggestModal: class {} }));

vi.mock("./popover-position", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./popover-position")>();
  return {
    ...actual,
    isMobileBottomSheet: (doc: { body?: { hasClass?: (cls: string) => boolean } }) => Boolean(doc.body?.hasClass?.("is-phone")),
    positionToolbarPopover: vi.fn(),
  };
});

vi.mock("./date-value-picker", () => ({
  closeActiveDateValuePicker: vi.fn(),
  renderDateValuePicker: vi.fn(),
}));

vi.mock("./modals/confirm-modal", () => ({
  confirmWithModal: vi.fn(async () => true),
}));

// ───────────────────────────────────────────────────────────────────
// 2. FAKE DOM
// ───────────────────────────────────────────────────────────────────

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
  checked = false;
  value = "";
  onclick: ((event?: unknown) => void) | null = null;
  onchange: ((event?: unknown) => void) | null = null;
  oninput: ((event?: unknown) => void) | null = null;
  scrollHeight = 0;
  clientHeight = 0;
  scrollTop = 0;
  style: { display: string; getPropertyValue: (name: string) => string; setProperty: (name: string, value: string) => void };

  constructor(tagName = "div", className = "", ownerDocument?: FakeElement["ownerDocument"]) {
    this.tagName = tagName.toUpperCase();
    this.className = className;
    const styles: Record<string, string> = {};
    this.style = {
      display: "",
      getPropertyValue: (name: string) => styles[name] ?? "",
      setProperty: (name: string, value: string) => {
        styles[name] = value;
      },
    };
    const doc: FakeElement["ownerDocument"] = {
      body: this,
      querySelector: (selector: string) => this.querySelector(selector),
    };
    this.ownerDocument = ownerDocument ?? doc;
  }

  get classList() {
    return {
      contains: (cls: string) => this.hasClass(cls),
      add: (cls: string) => this.addClass(cls),
      remove: (cls: string) => this.removeClass(cls),
    };
  }

  hasClass(cls: string): boolean {
    return this.className.split(/\s+/).includes(cls);
  }

  addClass(cls: string): void {
    if (this.hasClass(cls)) return;
    this.className = [this.className, cls].filter(Boolean).join(" ");
  }

  removeClass(cls: string): void {
    this.className = this.className.split(/\s+/).filter((entry) => entry && entry !== cls).join(" ");
  }

  toggleClass(cls: string, force?: boolean): void {
    const shouldAdd = force === undefined ? !this.hasClass(cls) : force;
    if (shouldAdd) this.addClass(cls);
    else this.removeClass(cls);
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

  querySelector(selector: string): FakeElement | null {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector: string): FakeElement[] {
    if (selector.includes(",")) {
      const seen = new Set<FakeElement>();
      const out: FakeElement[] = [];
      for (const part of selector.split(",")) {
        for (const match of this.querySelectorAll(part.trim())) {
          if (seen.has(match)) continue;
          seen.add(match);
          out.push(match);
        }
      }
      return out;
    }
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
  const attr = selector.match(/^(\w+)\[([^=]+)=['"]([^'"]+)['"]\]$/);
  if (attr) {
    return el.tagName === attr[1].toUpperCase() && el.getAttribute(attr[2]) === attr[3];
  }
  if (selector.startsWith(".")) return el.hasClass(selector.slice(1));
  if (/^[a-zA-Z][\w-]*$/.test(selector)) return el.tagName === selector.toUpperCase();
  return false;
}

// ───────────────────────────────────────────────────────────────────
// 3. FIXTURES
// ───────────────────────────────────────────────────────────────────

function makeDoc(phone: boolean): { body: FakeElement; container: FakeElement } {
  const body = new FakeElement("body", phone ? "is-phone" : "");
  const doc = {
    body,
    querySelector: (selector: string) => body.querySelector(selector),
  };
  body.ownerDocument = doc;
  const container = body.createDiv({ cls: "note-database-container" });
  return { body, container };
}

function makeConfig(): ViewConfig {
  return {
    id: "view-1",
    name: "Table",
    viewType: "table",
    sourceFolder: "notes",
    schema: {
      columns: [{ key: "file.name", label: "Name", type: "text" }],
      computedFields: [],
    },
  };
}

function makeDatabase(config: ViewConfig): DatabaseConfig {
  return {
    id: "db-1",
    name: "Notes",
    sourceFolder: "notes",
    schema: config.schema,
    views: [config],
    computedSyncMode: "display-only",
  };
}

function makeActions(database: DatabaseConfig): ViewConfigPanelActions {
  return {
    app: {
      vault: { getMarkdownFiles: () => [] },
      metadataCache: { getFileCache: () => null },
    } as unknown as App,
    onChange: () => undefined,
    onDatabaseChange: () => undefined,
    database,
  };
}

function mount(phone: boolean): { panel: FakeElement; database: DatabaseConfig } {
  const { container } = makeDoc(phone);
  const config = makeConfig();
  const database = makeDatabase(config);
  new ViewConfigPanelRenderer().render(
    container as unknown as HTMLElement,
    true,
    config,
    makeActions(database),
  );
  const panel = container.querySelector(".db-view-config-panel");
  if (!panel) throw new Error("settings panel did not mount");
  return { panel, database };
}

// ───────────────────────────────────────────────────────────────────
// 4. TESTS
// ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  setLocale("en");
  __resetVaultPropertiesCacheForTests();
});

describe("settings sheet body grammar", () => {
  it("on phone, describeSheetGrammar accepts the body elements", () => {
    const { panel } = mount(true);
    const report = describeSheetGrammar(panel as unknown as HTMLElement);
    // `rows` now reads getComputedStyle padding (sheet-grammar.ts), which this hand-built tree has
    // no CSS engine to answer — the real browser lane (tools/live/sheet-grammar.mjs, "settings" row)
    // is what proves the measurement; this suite keeps the structural half that this tree can still
    // answer honestly.
    expect(panel.querySelector(".db-panel-row")).not.toBeNull();
    expect(report.dropdown).toBe(true);
    expect(report.segmented).toBe(true);
    expect(panel.querySelector(".db-view-config-row")).toBeNull();
    expect(panel.querySelector("select")).toBeNull();
    expect(panel.querySelector("input[type='radio']")).toBeNull();
    expect(panel.querySelector(".db-new-placement")).not.toBeNull();
    expect(panel.querySelector(".db-panel-hint")).not.toBeNull();
    const checkboxes = panel.querySelectorAll("input[type='checkbox']");
    expect(checkboxes.length).toBeGreaterThan(0);
    for (const input of checkboxes) expect(input.classList.contains("db-checkbox")).toBe(true);
  });

  it("on desktop, keeps the two-column grid, radios and switch", () => {
    const { panel } = mount(false);
    expect(panel.querySelector(".db-view-config-row")).not.toBeNull();
    expect(panel.querySelector(".db-panel-row")).toBeNull();
    expect(panel.querySelector("input[type='radio']")).not.toBeNull();
    expect(panel.querySelector(".db-toggle-switch")).not.toBeNull();
    expect(panel.querySelector(".db-new-placement")).toBeNull();
    // `rows` is not asked here for the same reason noted above; `.db-panel-row`'s absence is
    // already asserted two lines up, which is the structural half this tree can answer.
    const report = describeSheetGrammar(panel as unknown as HTMLElement);
    expect(report.segmented).toBe(false);
  });

  it("keeps computed-sync persistence when the phone segmented control is used", () => {
    const { panel, database } = mount(true);
    const buttons = panel.querySelectorAll(".db-new-placement-option");
    expect(buttons).toHaveLength(3);
    expect(database.computedSyncMode).toBe("display-only");
    buttons[1].onclick?.();
    expect(database.computedSyncMode).toBe("manual");
  });
});
