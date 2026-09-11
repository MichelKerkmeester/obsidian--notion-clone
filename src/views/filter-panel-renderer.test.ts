// ───────────────────────────────────────────────────────────────────
// MODULE:    filter-panel-renderer.test
// COMPONENT: zero-rule entry tier and searchable condition dropdowns
// ───────────────────────────────────────────────────────────────────
//
// The zero-rule entry tier's own DOM and click behaviour mount on a hand-built tree, the same
// idiom `view-config-panel-renderer.test.ts` uses, in place of the source-grep this suite used to
// run: reading the shipped source proved every assertion could stay green while every property row
// filed its rule on the first property (`addFirstLeaf(columns[0].key)` for `addFirstLeaf(col.key)`
// at filter-panel-renderer.ts:275) — a real defect no test here saw. Section 3 mounts the entry
// tier for real and drives a click to prove the field a row files against is that row's own field.
//
// The ≥1-rule tree branch stays a source pin: its rows go through
// `createConditionRow`/`createDropdownField` (toolbar-primitives.ts, dropdown-field.ts), and
// `toolbar-primitives.ts`'s `appendConditionPart` guards its min-width floor behind
// `child instanceof HTMLElement` — this suite's `node` environment has no global `HTMLElement`, so
// mounting a non-compact condition row throws before any assertion runs. Giving this environment
// that global is a separate, larger change than this follow-up's scope.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading the renderer source from disk needs the node builtins the plugin
   runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ViewConfig } from "../data/types";
import { setLocale } from "../i18n";
import { FilterPanelRenderer, type FilterPanelActions } from "./filter-panel-renderer";
import type { DatabaseViewState } from "./view-state-store";

const source = readFileSync(resolve(__dirname, "filter-panel-renderer.ts"), "utf-8");

vi.mock("obsidian", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, setIcon: vi.fn(), setTooltip: vi.fn() };
});

vi.mock("./date-value-picker", () => ({
  closeActiveDateValuePicker: vi.fn(),
  renderDateValuePicker: vi.fn(),
}));

vi.mock("./popover-position", () => ({
  PANEL_POPOVER: {},
  positionToolbarPopover: vi.fn(),
  isMobileBottomSheet: () => false,
}));

vi.mock("./property-type-icon", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./property-type-icon")>();
  return { ...actual, renderDropdownPropertyTypeIcon: vi.fn() };
});

// ───────────────────────────────────────────────────────────────────
// 2. FAKE DOM
// ───────────────────────────────────────────────────────────────────
//
// The same hand-built element `view-config-panel-renderer.test.ts` mounts on, trimmed to what the
// entry tier and its shell header touch: creation, class membership, attributes, sibling-aware
// insertion (the panel repositions itself after `.obnotion-header` via `insertBefore`/`nextSibling`).

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
  value = "";
  onclick: (() => void) | null = null;
  oninput: (() => void) | null = null;
  scrollTop = 0;
  tabIndex = 0;

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

  removeClass(cls: string): void {
    this.className = this.className.split(/\s+/).filter((entry) => entry && entry !== cls).join(" ");
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
  if (selector.startsWith(".")) return el.hasClass(selector.slice(1));
  if (/^[a-zA-Z][\w-]*$/.test(selector)) return el.tagName === selector.toUpperCase();
  return false;
}

// ───────────────────────────────────────────────────────────────────
// 3. ZERO-RULE ENTRY TIER — mounted
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
        { key: "colB", label: "Beta", type: "text" },
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
    filterTree: undefined,
    sortDirection: "asc",
    sortRules: [],
  };
}

function makeActions(): FilterPanelActions {
  return { saveState: vi.fn(), refresh: vi.fn(), close: vi.fn() };
}

beforeEach(() => {
  setLocale("en");
});

describe("FilterPanelRenderer zero-rule entry tier (mounted)", () => {
  it("renders one searchable option row per rule-eligible property", () => {
    const container = makeContainer();
    const renderer = new FilterPanelRenderer();
    renderer.render(container as unknown as HTMLElement, true, makeState(), makeConfig(), makeActions());

    const panel = container.querySelector(".obnotion-filter-panel");
    expect(panel).not.toBeNull();
    expect(panel?.querySelector(".obnotion-dropdown-search")).not.toBeNull();
    const rows = panel?.querySelectorAll(".obnotion-dropdown-option") ?? [];
    // file.name, colA, colB — the entry tier's own vocabulary is getViewRuleColumns(config).
    expect(rows).toHaveLength(3);
    const labels = rows.map((row) => row.querySelector(".obnotion-dropdown-option-label")?.textContent);
    expect(labels).toEqual(["Name", "Alpha", "Beta"]);
  });

  it("gives the entry tier its own advanced-filter footer, distinct from the tree branch's + Add condition", () => {
    const container = makeContainer();
    const renderer = new FilterPanelRenderer();
    renderer.render(container as unknown as HTMLElement, true, makeState(), makeConfig(), makeActions());

    const panel = container.querySelector(".obnotion-filter-panel");
    const buttons = panel?.querySelectorAll("button") ?? [];
    const footer = buttons.find((button) => button.hasClass("obnotion-panel-button") && button.textContent.includes("Add"));
    expect(footer?.textContent).toBe("+ Add advanced filter");
  });

  it("files the clicked row's own field, not always the first — the addFirstLeaf mutant", () => {
    // Red before this fix: mutating filter-panel-renderer.ts:275 from
    // `row.onclick = () => addFirstLeaf(col.key);` to `addFirstLeaf(columns[0].key)` (every row
    // filing against the first property) left every assertion in this file green, because none of
    // them drove a click. This test drives the SECOND row's click and reads which field the new
    // rule actually carries.
    const container = makeContainer();
    const renderer = new FilterPanelRenderer();
    const state = makeState();
    const config = makeConfig();
    const actions = makeActions();
    renderer.render(container as unknown as HTMLElement, true, state, config, actions);

    const panel = container.querySelector(".obnotion-filter-panel");
    const rows = panel?.querySelectorAll(".obnotion-dropdown-option") ?? [];
    expect(rows).toHaveLength(3);

    // Swallow the re-render `addFirstLeaf` triggers on commit: it re-enters the public `render()`
    // method, which for a now-non-empty tree walks the ≥1-rule tree branch — out of reach in this
    // suite for the reason recorded in this file's header comment. The state mutation this test
    // reads happens synchronously before that re-render call, so intercepting it changes nothing
    // this test asserts.
    vi.spyOn(renderer, "render").mockImplementation(() => {});

    // Click the THIRD row (index 2, field "colB") — not the first — so a mutant that always files
    // against columns[0] ("file.name") is distinguishable from the real behaviour.
    rows[2].onclick?.();

    expect(state.filters).toHaveLength(1);
    expect(state.filters[0].field).toBe("colB");
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. ≥1-RULE TREE BRANCH AND SEARCHABLE CONDITION DROPDOWNS — source pin
// ───────────────────────────────────────────────────────────────────
//
// See this file's header comment: mounting a non-compact `createConditionRow` throws in this
// suite's `node` environment (no global `HTMLElement`), so the tree branch and its dropdowns stay
// pinned by source here.

describe("FilterPanelRenderer searchable condition dropdowns", () => {
  it("passes searchable: true on the field dropdown and the select/status value dropdown", () => {
    const occurrences = source.match(/searchable: true,/g) || [];
    // Exactly two sites in this file: the field dropdown and the select/status value dropdown.
    expect(occurrences.length).toBe(2);
  });

  it("leaves the gate itself inside the dropdown primitive — no second count check here", () => {
    expect(source).not.toContain("options.length > 8");
  });
});

describe("FilterPanelRenderer ≥1-rule tree branch", () => {
  it("falls back to the plain hint when there is nothing to list, rather than an empty search box", () => {
    expect(source).toMatch(/if \(columns\.length === 0\) \{\s*\n\s*panel\.createDiv\(\{ cls: "obnotion-panel-empty", text: t\("panel\.emptyFilters"\) \}\);/);
  });

  it("keeps the ≥1-rule branch's + Add condition button inside the tree branch, unmoved — the negative control", () => {
    const treeBranchStart = source.indexOf("this.renderFilterTreeNode(");
    const addConditionIndex = source.indexOf('`+ ${t("panel.addCondition")}`');
    expect(treeBranchStart).toBeGreaterThan(0);
    expect(addConditionIndex).toBeGreaterThan(treeBranchStart);
  });
});

// The sheet condition rule's own class and marker contract. This suite's fake DOM cannot mount the
// phone branch (see this file's header comment), so the contract is pinned against the source the
// way the two suites above already do: a caller that reaches for the old single-row
// `createConditionRow` call on the phone branch, or drops the `.obnotion-filter-condition-row`
// class the lane's row-inset clause keys on, or stops marking the summary row and the detail group
// the presentation clauses read, fails this test before it ever reaches the lane. Reverted (the
// sheet-rule branch and its markers deleted, `createConditionRow` called unconditionally) this test
// fails on its assertions; restored, they pass — checked by hand against a working copy of this
// diff, not asserted here since a revert-and-restore inside the suite would just describe the same
// source string twice.
describe("FilterPanelRenderer sheet condition rule (phone sheet and companion)", () => {
  it("routes every phone condition through its own summary-and-detail builder, gated on the sheet presentation", () => {
    expect(source).toContain("isMobileBottomSheet(containerEl.ownerDocument)");
    expect(source).toContain("this.renderSheetConditionRule(panel, {");
  });

  it("builds a one-line summary row over a marked detail group on the shared row grammar the lane measures", () => {
    const sheetRuleMethodStart = source.indexOf("private renderSheetConditionRule(");
    expect(sheetRuleMethodStart).toBeGreaterThan(0);
    const sheetRuleMethodBody = source.slice(sheetRuleMethodStart);
    expect(sheetRuleMethodBody).toContain('"data-filter-summary-row"');
    expect(sheetRuleMethodBody).toContain('"data-filter-detail-group"');
    expect(sheetRuleMethodBody).toContain('cls: "obnotion-panel-row obnotion-filter-condition-row obnotion-filter-detail-row"');
    expect(sheetRuleMethodBody).toContain("appendConditionRow(parts.buildField)");
    expect(sheetRuleMethodBody).toContain("appendConditionRow(parts.buildOperator)");
  });

  it("renders the rule's own actions as labelled rows inside their own group, remove carrying the destructive treatment", () => {
    const sheetRuleMethodStart = source.indexOf("private renderSheetConditionRule(");
    const sheetRuleMethodBody = source.slice(sheetRuleMethodStart);
    expect(sheetRuleMethodBody).not.toContain("createFilterTreeIconButton(panel");
    expect(sheetRuleMethodBody).toContain('"data-filter-action-group"');
    expect(sheetRuleMethodBody).toContain('icon: "trash-2"');
    expect(sheetRuleMethodBody).toContain("warning: true");
  });
});
