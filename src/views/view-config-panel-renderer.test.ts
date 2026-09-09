// ───────────────────────────────────────────────────────────────────
// MODULE:    view-config-panel-renderer.test
// COMPONENT: phone body grammar for the settings sheet
// ───────────────────────────────────────────────────────────────────
//
// The settings sheet already wore shared chrome. Its body still drew the
// desktop two-column grid, a native radio group (the computed-sync cards, since
// converted to the shared checkbox), and a switch that is not
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
import { setLocale, t } from "../i18n";
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
  ownerDocument: {
    body: FakeElement;
    querySelector: (selector: string) => FakeElement | null;
    createElementNS: (namespace: string, tagName: string) => FakeElement;
  };
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
      // A schema column's dropdown option renders a property-type SVG glyph (property-type-icon.ts)
      // regardless of the column's own type — this fake DOM has no SVG namespace of its own, so a
      // detached FakeElement stands in: setAttribute/classList.add/appendChild all already exist on
      // it, which is everything renderPropertyTypeIcon calls on the node it builds.
      createElementNS: (_namespace: string, tagName: string) => new FakeElement(tagName, ""),
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

  // No-ops: this tree asserts structure, not keyboard behaviour. `trapFocus`
  // (interaction-scope.ts) only needs these two to exist to attach and, on teardown, detach
  // without throwing — the real Tab/Escape cycling is proven by the live browser lane instead.
  addEventListener(): void {}
  removeEventListener(): void {}

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
  const doc: FakeElement["ownerDocument"] = {
    body,
    querySelector: (selector: string) => body.querySelector(selector),
    createElementNS: (_namespace: string, tagName: string) => new FakeElement(tagName, ""),
  };
  body.ownerDocument = doc;
  const container = body.createDiv({ cls: "obnotion-container" });
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
    id: "obnotion-1",
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
  const panel = container.querySelector(".obnotion-view-config-panel");
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
    expect(panel.querySelector(".obnotion-panel-row")).not.toBeNull();
    expect(report.dropdown).toBe(true);
    expect(report.segmented).toBe(true);
    expect(panel.querySelector(".obnotion-view-config-row")).toBeNull();
    expect(panel.querySelector("select")).toBeNull();
    expect(panel.querySelector("input[type='radio']")).toBeNull();
    expect(panel.querySelector(".obnotion-new-placement")).not.toBeNull();
    expect(panel.querySelector(".obnotion-panel-hint")).not.toBeNull();
    const checkboxes = panel.querySelectorAll("input[type='checkbox']");
    expect(checkboxes.length).toBeGreaterThan(0);
    for (const input of checkboxes) expect(input.classList.contains("obnotion-checkbox")).toBe(true);
  });

  it("on desktop, keeps the two-column grid, the computed-sync checkbox cards and the switch", () => {
    const { panel } = mount(false);
    expect(panel.querySelector(".obnotion-view-config-row")).not.toBeNull();
    expect(panel.querySelector(".obnotion-panel-row")).toBeNull();
    // No radio of either spelling is left: the cards' boxes are the shared factory's, and the
    // choice's exclusivity lives in the group's behaviour, not in the control type. (The harness
    // here matches single simple selectors, so the cards are found by class and their box
    // asked for directly.)
    expect(panel.querySelector("input[type='radio']")).toBeNull();
    const syncCards = panel.querySelectorAll(".obnotion-computed-sync-card");
    expect(syncCards.length).toBeGreaterThan(0);
    for (const cardEl of syncCards) {
      const box = cardEl.querySelector(".obnotion-checkbox");
      expect(box).not.toBeNull();
      expect(box!.tagName).toBe("INPUT");
    }
    expect(syncCards.filter((cardEl) => cardEl.hasClass("is-active")).length).toBe(1);
    expect(panel.querySelector(".obnotion-toggle-switch")).not.toBeNull();
    expect(panel.querySelector(".obnotion-new-placement")).toBeNull();
    // `rows` is not asked here for the same reason noted above; `.obnotion-panel-row`'s absence is
    // already asserted two lines up, which is the structural half this tree can answer.
    const report = describeSheetGrammar(panel as unknown as HTMLElement);
    // With the native radios gone, the predicate now recognizes the shared `obnotion-toggle-switch`
    // class as a conforming choice control alongside `obnotion-checkbox` — the group sheet's own
    // toggle rows carry that class rather than the checkbox one, and a predicate that rejected it
    // would fail the one surface that actually has switches instead of measuring its vocabulary.
    // The desktop switch here carries the same class, so it no longer disqualifies the panel; the
    // desktop panel is still not a registered grammar surface, so nothing live reads this verdict.
    expect(report.segmented).toBe(true);
  });

  it("on desktop, presents as the side sheet rather than the anchored dropdown", () => {
    // Red before this leg: `obnotion-shell-side-sheet` did not exist anywhere in this file, so the
    // desktop panel had no marker distinguishing it from every other anchored popover — it read
    // identically to `.obnotion-view-config-panel` alone. The operator's report, 2026-09-06: "this
    // dropdown on desktop is horrible".
    const { panel } = mount(false);
    expect(panel.hasClass("obnotion-shell-side-sheet")).toBe(true);
  });

  it("on phone, keeps the existing bottom sheet — no side-sheet marker", () => {
    const { panel } = mount(true);
    expect(panel.hasClass("obnotion-shell-side-sheet")).toBe(false);
  });

  it("keeps computed-sync persistence when the phone segmented control is used", () => {
    const { panel, database } = mount(true);
    const buttons = panel.querySelectorAll(".obnotion-new-placement-option");
    expect(buttons).toHaveLength(3);
    expect(database.computedSyncMode).toBe("display-only");
    buttons[1].onclick?.();
    expect(database.computedSyncMode).toBe("manual");
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. TITLE FORMAT ROW (file-name-only format choice, next to the existing titleField picker)
// ───────────────────────────────────────────────────────────────────
//
// The operator's own board showed a raw stored number as the card title because the default
// title source (file.name) has no ColumnDef to inherit a format from — a real column already
// carries one. This row is the file-name-only escape hatch; it must appear only while the title
// actually reads the file name, never once a real column is chosen, since a column's format
// setting already lives on the column itself.

function mountTitleFormatPanel(overrides: Partial<ViewConfig> = {}): { panel: FakeElement } {
  const { container } = makeDoc(false);
  const config: ViewConfig = {
    ...makeConfig(),
    viewType: "board",
    schema: {
      columns: [
        { key: "file.name", label: "Name", type: "text" },
        { key: "price", label: "Price", type: "currency" },
      ],
      computedFields: [],
    },
    ...overrides,
  };
  const database = makeDatabase(config);
  new ViewConfigPanelRenderer().render(container as unknown as HTMLElement, true, config, makeActions(database));
  const panel = container.querySelector(".obnotion-view-config-panel");
  if (!panel) throw new Error("settings panel did not mount");
  return { panel };
}

describe("title format row", () => {
  it("shows the Title format row when the title reads the file name (the unset default)", () => {
    const { panel } = mountTitleFormatPanel();
    const labels = panel.querySelectorAll(".obnotion-view-config-label").map((row) => row.textContent);
    expect(labels).toContain(t("viewConfig.titleFormat"));
  });

  it("defaults the shown value to Plain text when titleFormat is unset", () => {
    const { panel } = mountTitleFormatPanel();
    const values = panel.querySelectorAll(".obnotion-dropdown-field-value").map((row) => row.textContent);
    expect(values).toContain(t("viewConfig.titleFormat.text"));
  });

  it("shows the persisted format's own label once one is set", () => {
    const { panel } = mountTitleFormatPanel({ titleFormat: "currency-eur" });
    const values = panel.querySelectorAll(".obnotion-dropdown-field-value").map((row) => row.textContent);
    expect(values).toContain(t("viewConfig.titleFormat.currencyEur"));
  });

  it("hides the Title format row once titleField points at a real column — the column keeps its own format", () => {
    // Negative control: with titleField pointed at a typed column, the file-name-only row has
    // nothing to affect and must not render at all.
    const { panel } = mountTitleFormatPanel({ titleField: "price" });
    const labels = panel.querySelectorAll(".obnotion-view-config-label").map((row) => row.textContent);
    expect(labels).not.toContain(t("viewConfig.titleFormat"));
  });

  it("keeps rendering the row when titleField is explicitly file.name", () => {
    const { panel } = mountTitleFormatPanel({ titleField: "file.name" });
    const labels = panel.querySelectorAll(".obnotion-view-config-label").map((row) => row.textContent);
    expect(labels).toContain(t("viewConfig.titleFormat"));
  });
});

describe("conditional-colour summary row", () => {
  it("adds a fourth named row beside Properties/Filters/Sorts, with an explainer and the rule count", () => {
    // Red before this leg: renderAppliedSummaries made exactly 3 calls to renderAppliedSummary —
    // Properties, Filters, Sorts — and none named conditional colour.
    const { panel } = mount(false);
    const rows = panel.querySelectorAll(".obnotion-view-config-summary-row");
    expect(rows).toHaveLength(4);
    const labels = rows.map((row) => row.querySelector(".obnotion-view-config-label")?.textContent);
    expect(labels).toEqual(["Properties", "Filters", "Sorts", "Conditional color"]);
    const colorRow = rows[3];
    expect(colorRow.querySelector(".obnotion-view-config-summary")?.textContent).toBe("No color rules");
    // hintClass() resolves to obnotion-view-config-help on desktop, obnotion-panel-hint on a phone sheet —
    // this mount is desktop, so the explainer carries the desktop class.
    expect(colorRow.querySelector(".obnotion-view-config-help")).not.toBeNull();
  });

  it("opens the existing conditional-formatting section rather than a second editor", () => {
    const { panel } = mount(false);
    const rows = panel.querySelectorAll(".obnotion-view-config-summary-row");
    const colorRow = rows[3];
    expect(colorRow.hasClass("obnotion-view-config-row-clickable")).toBe(true);
    const section = panel.querySelector(".obnotion-conditional-format-settings");
    expect(section).not.toBeNull();
    // No throw: scrollIntoView is guarded for the fake DOM this suite mounts on, and the real
    // click handler resolves the same section the row promises rather than building another.
    expect(() => colorRow.onclick?.()).not.toThrow();
    // Exactly one conditional-formatting section exists — the row opens it, it does not clone it.
    expect(panel.querySelectorAll(".obnotion-conditional-format-settings")).toHaveLength(1);
  });

  it("renders no row for a chart view, whose own guard mounts no conditional-formatting section — the negative control", () => {
    const { container } = makeDoc(false);
    const config: ViewConfig = { ...makeConfig(), viewType: "chart" };
    const database = makeDatabase(config);
    new ViewConfigPanelRenderer().render(container as unknown as HTMLElement, true, config, makeActions(database));
    const panel = container.querySelector(".obnotion-view-config-panel");
    if (!panel) throw new Error("settings panel did not mount");
    const rows = panel.querySelectorAll(".obnotion-view-config-summary-row");
    expect(rows).toHaveLength(3);
    expect(panel.querySelector(".obnotion-conditional-format-settings")).toBeNull();
  });
});
