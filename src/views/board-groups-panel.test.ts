// ───────────────────────────────────────────────────────────────────
// MODULE:    board-groups-panel.test
// COMPONENT: the Groups panel's row list — every option, an orphan hidden
//            key, and the toggle/reorder wiring
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. CASES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import type { ViewConfig } from "../data/types";
import { renderBoardGroupsRows, resolveBoardGroupsPanelKeys } from "./board-groups-panel";

// Same reason board-card-properties-panel.test.ts mocks these: the shared checkbox row's own
// import chain reaches obsidian-dependent modules that only need to load, never to run for real.
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
  setTooltip: vi.fn(),
  debounce: (fn: unknown) => fn,
  getAllTags: vi.fn(() => []),
  normalizePath: (path: string) => path,
}));

class MockElement {
  public tagName: string;
  public className: string;
  public text: string | null = null;
  public textContent = "";
  public disabled = false;
  public checked = false;
  public draggable = false;
  public style: Record<string, string> = {};
  public onclick: ((event?: { preventDefault(): void; stopPropagation(): void }) => void) | null = null;
  public onchange: (() => void) | null = null;
  public ondragstart: ((event: Record<string, unknown>) => void) | null = null;
  public ondragover: ((event: Record<string, unknown>) => void) | null = null;
  public ondragleave: (() => void) | null = null;
  public ondrop: ((event: Record<string, unknown>) => void) | null = null;
  public ondragend: (() => void) | null = null;
  public attributes = new Map<string, string>();
  public children: MockElement[] = [];

  constructor(tagName = "div", className = "") {
    this.tagName = tagName.toUpperCase();
    this.className = className;
  }

  createDiv(options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string | string[]; text?: string; attr?: Record<string, string> } = {}): MockElement {
    const className = Array.isArray(options.cls) ? options.cls.filter(Boolean).join(" ") : (options.cls || "");
    const el = new MockElement(tag, className);
    if (options.text != null) {
      el.text = options.text;
      el.textContent = options.text;
    }
    if (options.attr) {
      for (const [key, value] of Object.entries(options.attr)) el.attributes.set(key, value);
    }
    this.children.push(el);
    return el;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  querySelectorAll(selector: string): MockElement[] {
    const out: MockElement[] = [];
    const visit = (node: MockElement) => {
      if (matches(node, selector)) out.push(node);
      for (const child of node.children) visit(child);
    };
    for (const child of this.children) visit(child);
    return out;
  }

  querySelector(selector: string): MockElement | null {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  addClass(cls: string): void {
    this.className = `${this.className} ${cls}`.trim();
  }

  removeClass(cls: string): void {
    this.className = this.className.split(/\s+/).filter((item) => item && item !== cls).join(" ");
  }

  hasClass(cls: string): boolean {
    return this.className.split(/\s+/).includes(cls);
  }

  empty(): void {
    this.children = [];
  }
}

function matches(node: MockElement, selector: string): boolean {
  const className = typeof node.className === "string" ? node.className : "";
  if (selector.startsWith(".")) return className.split(/\s+/).includes(selector.slice(1));
  if (selector.startsWith("[")) {
    const body = selector.slice(1, -1);
    const [key, raw] = body.split("=");
    if (!raw) return node.attributes.has(key);
    return node.attributes.get(key) === raw.replace(/['"]/g, "");
  }
  return node.tagName === selector.toUpperCase();
}

function baseConfig(overrides: Partial<ViewConfig> = {}): ViewConfig {
  return {
    name: "Board",
    viewType: "board",
    sourceFolder: "",
    boardGroupField: "status",
    schema: {
      columns: [
        { key: "status", label: "Status", type: "status", statusOptions: [
          { value: "To Do", color: "gray" },
          { value: "Doing", color: "blue" },
          { value: "Done", color: "green" },
        ] },
      ],
      computedFields: [],
    },
    ...overrides,
  };
}

describe("resolveBoardGroupsPanelKeys", () => {
  it("lists every schema option, visible and hidden", () => {
    const config = baseConfig({ boardHiddenGroups: { status: ["Done"] } });
    const keys = resolveBoardGroupsPanelKeys(config, "status", ["To Do", "Doing"]);
    expect(keys).toEqual(["To Do", "Doing", "Done"]);
  });

  it("lists a hidden key the schema no longer carries as an orphan, restorable rather than dropped", () => {
    const config = baseConfig({ boardHiddenGroups: { status: ["Retired"] } });
    const keys = resolveBoardGroupsPanelKeys(config, "status", ["To Do", "Doing", "Done"]);
    expect(keys).toContain("Retired");
  });
});

describe("renderBoardGroupsRows", () => {
  it("renders one row per key with a live visibility toggle, checked for a visible group and unchecked for a hidden one", () => {
    const body = new MockElement("div");
    const config = baseConfig();
    const keys = ["To Do", "Doing", "Done"];
    const hiddenKeys = new Set(["Done"]);

    renderBoardGroupsRows(body as unknown as HTMLElement, config, "status", keys, hiddenKeys, {
      hideGroup: vi.fn(),
      showGroup: vi.fn(),
    }, vi.fn());

    const rows = body.querySelectorAll(".obnotion-column-manager-row");
    expect(rows).toHaveLength(3);
    const checkboxes = body.querySelectorAll("input");
    expect(checkboxes.map((box) => box.checked)).toEqual([true, true, false]);
  });

  it("fires showGroup when an unchecked row is checked and hideGroup when a checked row is unchecked", () => {
    const body = new MockElement("div");
    const config = baseConfig();
    const hideGroup = vi.fn();
    const showGroup = vi.fn();

    renderBoardGroupsRows(body as unknown as HTMLElement, config, "status", ["To Do", "Done"], new Set(["Done"]), {
      hideGroup,
      showGroup,
    }, vi.fn());

    const [visibleCheckbox, hiddenCheckbox] = body.querySelectorAll("input");
    hiddenCheckbox.checked = true;
    hiddenCheckbox.onchange?.();
    expect(showGroup).toHaveBeenCalledWith("status", "Done");

    visibleCheckbox.checked = false;
    visibleCheckbox.onchange?.();
    expect(hideGroup).toHaveBeenCalledWith("status", "To Do");
  });

  it("fires the reorder callback with the dragged and target indexes on drop", () => {
    const body = new MockElement("div");
    const config = baseConfig();
    const onReorder = vi.fn();

    renderBoardGroupsRows(body as unknown as HTMLElement, config, "status", ["To Do", "Doing", "Done"], new Set(), {
      hideGroup: vi.fn(),
      showGroup: vi.fn(),
    }, onReorder);

    const rows = body.querySelectorAll(".obnotion-column-manager-row");
    rows[0].ondragstart?.({ dataTransfer: { setData: vi.fn() }, target: {} });
    rows[2].ondrop?.({ preventDefault() {}, target: {} });
    expect(onReorder).toHaveBeenCalledWith(0, 2);
  });

  it("fires the reorder callback from the phone move-down control", () => {
    const body = new MockElement("div");
    const config = baseConfig();
    const onReorder = vi.fn();

    renderBoardGroupsRows(body as unknown as HTMLElement, config, "status", ["To Do", "Doing"], new Set(), {
      hideGroup: vi.fn(),
      showGroup: vi.fn(),
    }, onReorder);

    const firstRow = body.querySelectorAll(".obnotion-column-manager-row")[0];
    const moveDown = firstRow.querySelectorAll("button")[1];
    moveDown.onclick?.({ preventDefault() {}, stopPropagation() {} });
    expect(onReorder).toHaveBeenCalledWith(0, 1);
  });
});
