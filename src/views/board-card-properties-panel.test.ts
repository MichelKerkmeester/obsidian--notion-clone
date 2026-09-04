// ───────────────────────────────────────────────────────────────────
// MODULE:    board-card-properties-panel.test
// COMPONENT: Properties rows in the board options popover / phone sheet
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. CASES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import type { ViewConfig } from "../data/types";
import { t, setLocale } from "../i18n";
import { renderBoardCardProperties } from "./board-card-properties-panel";

vi.mock("obsidian", () => ({
  setIcon: vi.fn(),
  setTooltip: vi.fn(),
}));

vi.mock("./property-type-icon", () => ({
  renderPropertyTypeIcon: (parent: { createSpan: (options: { cls?: string }) => unknown }) =>
    parent.createSpan({ cls: "db-property-icon" }),
}));

class MockElement {
  public tagName: string;
  public className: string;
  public text: string | null = null;
  public textContent = "";
  public disabled = false;
  public checked = false;
  public draggable = false;
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

  createDiv(options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): MockElement {
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
      if (!(node instanceof MockElement)) return;
      if (matches(node, selector)) out.push(node);
      for (const child of node.children ?? []) visit(child);
    };
    for (const child of this.children) visit(child);
    return out;
  }

  querySelector(selector: string): MockElement | null {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  closest(selector: string): MockElement | null {
    return matches(this, selector) ? this : null;
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

  allText(): string[] {
    const out: string[] = [];
    if (this.text != null) out.push(this.text);
    if (this.textContent && this.textContent !== this.text) out.push(this.textContent);
    for (const child of this.children) out.push(...child.allText());
    return out;
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
    boardExtensionsEnabled: true,
    boardGroupField: "status",
    schema: {
      columns: [
        { key: "file.name", label: "Name", type: "text" },
        { key: "status", label: "Status", type: "status" },
        { key: "hours", label: "Hours", type: "number" },
        { key: "notes", label: "Notes", type: "text" },
      ],
      computedFields: [],
    },
    ...overrides,
  };
}

describe("renderBoardCardProperties", () => {
  it("renders fixed Cover and Title rows above one reorderable row per field", () => {
    const panel = new MockElement("div", "db-view-config-panel");
    const onChange = vi.fn();
    renderBoardCardProperties(panel as unknown as HTMLElement, baseConfig(), {
      onChange,
      readOnly: false,
    });

    const text = panel.allText();
    expect(text).toContain(t("viewConfig.cardProperties"));
    expect(text).toContain(t("viewConfig.cover"));
    expect(text).toContain(t("viewConfig.titleField"));
    expect(panel.querySelectorAll(".db-column-manager-row")).toHaveLength(3);
    expect(panel.querySelectorAll(".db-column-drag")).toHaveLength(3);
    expect(panel.querySelectorAll(".db-mobile-reorder-controls")).toHaveLength(3);
    expect(panel.querySelector("[data-note-database-column-key='file.name']")).toBeNull();
    expect(panel.querySelector("[data-note-database-column-key='hours']")).not.toBeNull();
  });

  it("persists a reorder through the view config callback", () => {
    const panel = new MockElement("div", "db-view-config-panel");
    const view = baseConfig();
    const onChange = vi.fn();
    renderBoardCardProperties(panel as unknown as HTMLElement, view, { onChange, readOnly: false });

    const hours = panel.querySelector("[data-note-database-column-key='hours']")!;
    const down = hours.querySelectorAll("button")[1];
    down.onclick?.({ preventDefault() {}, stopPropagation() {} });

    expect(view.boardCardFields?.map((entry) => entry.key)).toEqual(["status", "notes", "hours"]);
    expect(onChange).toHaveBeenCalled();
  });

  it("shows the list and blocks edits when read-only", () => {
    const panel = new MockElement("div", "db-view-config-panel");
    const view = baseConfig();
    const onChange = vi.fn();
    renderBoardCardProperties(panel as unknown as HTMLElement, view, { onChange, readOnly: true });

    expect(panel.querySelectorAll(".db-column-manager-row")).toHaveLength(3);
    expect(panel.querySelectorAll(".db-column-drag")).toHaveLength(0);
    expect(panel.querySelectorAll(".db-mobile-reorder-controls")).toHaveLength(0);
    const checkbox = panel.querySelector("[data-note-database-column-key='hours']")?.querySelector("input");
    expect(checkbox?.disabled).toBe(true);
    checkbox?.onchange?.();
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("card property labels", () => {
  it("resolves in English, Simplified Chinese, and Traditional Chinese", () => {
    for (const locale of ["en", "zh-CN", "zh-TW"] as const) {
      setLocale(locale);
      expect(t("viewConfig.cardProperties")).not.toBe("viewConfig.cardProperties");
      expect(t("undo.boardCardFieldsConfig")).not.toBe("undo.boardCardFieldsConfig");
    }
    setLocale("en");
  });
});
