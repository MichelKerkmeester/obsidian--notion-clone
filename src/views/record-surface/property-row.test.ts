// ───────────────────────────────────────────────────────────────────
// MODULE:    property-row.test
// COMPONENT: The trued-up row shell and the single-select / multi-select split
// ───────────────────────────────────────────────────────────────────
//
// These two builders are the corrected anatomy, and nothing renders through them yet — no
// capture and no consumer test can catch a regression in either. That is exactly why they are
// pinned here: the row's order (label, then value) and its lack of a format icon, and the split
// that draws a single-select as coloured text while a multi-select stays a filled chip.
//
// The display-value renderer beside them keeps its coverage where its callers are, in
// `card-field-renderer.test.ts`, because that path is reached through the shim rather than
// directly.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import { buildPropertyRow, renderOptionValue } from "./property-row";
import type { ColumnDef } from "../../data/types";

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURES
// ───────────────────────────────────────────────────────────────────

class MockElement {
  public tagName: string;
  public className: string;
  public text: string | null = null;
  public children: MockElement[] = [];

  constructor(tagName = "div", className = "") {
    this.tagName = tagName.toUpperCase();
    this.className = className;
  }

  createDiv(options: { cls?: string; text?: string } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string; text?: string } = {}): MockElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string; text?: string } = {}): MockElement {
    const el = new MockElement(tag, options.cls || "");
    if (options.text !== undefined) el.text = options.text;
    this.children.push(el);
    return el;
  }

  addClass(cls: string): void {
    if (!this.hasClass(cls)) this.className = `${this.className} ${cls}`.trim();
  }

  hasClass(cls: string): boolean {
    return this.className.split(/\s+/).includes(cls);
  }
}

const asHTMLElement = (el: MockElement): HTMLElement => el as unknown as HTMLElement;

function optionColumn(statusOptions: Array<{ value: string; color: string }>): ColumnDef {
  return { key: "stage", label: "Stage", type: "select", statusOptions } as unknown as ColumnDef;
}

const OPTION_CLASSES = { chipClass: "db-option-chip", textClass: "db-option-text" };

// ───────────────────────────────────────────────────────────────────
// 3. CASES — THE ROW SHELL
// ───────────────────────────────────────────────────────────────────

describe("buildPropertyRow", () => {
  it("draws the label first and the value after it, and nothing else", () => {
    const parent = new MockElement();
    const handle = buildPropertyRow({
      parent: asHTMLElement(parent),
      rowClass: "db-property-row",
      labelClass: "db-property-label",
      valueClass: "db-property-value",
      label: "Stage",
      renderValue: (valueEl) => { (valueEl as unknown as MockElement).text = "Backlog"; },
    });

    const row = handle.row as unknown as MockElement;
    expect(parent.children).toHaveLength(1);
    expect(row.className).toBe("db-property-row");

    // Two children and no third: a value row draws no format icon on either platform, so an icon
    // element appearing here is the regression this assertion exists to catch.
    expect(row.children).toHaveLength(2);
    expect(row.children[0].tagName).toBe("SPAN");
    expect(row.children[0].className).toBe("db-property-label");
    expect(row.children[0].text).toBe("Stage");
    expect(row.children[1].className).toBe("db-property-value");
  });

  it("hands the value element to the caller exactly once, even when it renders nothing", () => {
    const parent = new MockElement();
    const renderValue = vi.fn();

    const handle = buildPropertyRow({
      parent: asHTMLElement(parent),
      rowClass: "row",
      labelClass: "label",
      valueClass: "value",
      label: "",
      renderValue,
    });

    expect(renderValue).toHaveBeenCalledTimes(1);
    expect(renderValue).toHaveBeenCalledWith(handle.valueEl);
    expect((handle.valueEl as unknown as MockElement).children).toHaveLength(0);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. CASES — THE OPTION SPLIT
// ───────────────────────────────────────────────────────────────────

describe("renderOptionValue", () => {
  const col = optionColumn([
    { value: "Backlog", color: "gray" },
    { value: "Review", color: "purple" },
  ]);

  it("draws a single-select as coloured text carrying no chip", () => {
    const valueEl = new MockElement();
    renderOptionValue(asHTMLElement(valueEl), false, ["Review"], { col, ...OPTION_CLASSES });

    expect(valueEl.children).toHaveLength(1);
    const [text] = valueEl.children;
    expect(text.text).toBe("Review");
    expect(text.hasClass("db-option-text")).toBe(true);
    expect(text.hasClass("status-color-text-purple")).toBe(true);
    // The whole point of the split: no chip class reaches a single-select value.
    expect(text.hasClass("db-option-chip")).toBe(false);
  });

  it("draws a multi-select as one filled chip per value", () => {
    const valueEl = new MockElement();
    renderOptionValue(asHTMLElement(valueEl), true, ["Backlog", "Review"], { col, ...OPTION_CLASSES });

    expect(valueEl.children.map((child) => child.text)).toEqual(["Backlog", "Review"]);
    for (const chip of valueEl.children) {
      expect(chip.hasClass("db-option-chip")).toBe(true);
      expect(chip.hasClass("db-option-text")).toBe(false);
    }
    expect(valueEl.children[0].hasClass("status-color-gray")).toBe(true);
    expect(valueEl.children[1].hasClass("status-color-purple")).toBe(true);
  });

  it("falls back to gray for a value the column does not define, in either mode", () => {
    const single = new MockElement();
    renderOptionValue(asHTMLElement(single), false, ["Unlisted"], { col, ...OPTION_CLASSES });
    expect(single.children[0].hasClass("status-color-text-gray")).toBe(true);

    const multi = new MockElement();
    renderOptionValue(asHTMLElement(multi), true, ["Unlisted"], { col, ...OPTION_CLASSES });
    expect(multi.children[0].hasClass("status-color-gray")).toBe(true);
  });

  it("renders nothing when a single-select has no value", () => {
    const valueEl = new MockElement();
    renderOptionValue(asHTMLElement(valueEl), false, [], { col, ...OPTION_CLASSES });
    expect(valueEl.children).toHaveLength(0);
  });
});
