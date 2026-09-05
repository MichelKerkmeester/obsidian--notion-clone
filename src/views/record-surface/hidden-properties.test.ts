// ───────────────────────────────────────────────────────────────────
// MODULE:    hidden-properties.test
// COMPONENT: The collapsed group's count and refresh-survival contract
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. CASES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { createHiddenPropertiesGroup } from "./hidden-properties";

class MockElement {
  public tagName: string;
  public className: string;
  public textContent = "";
  public attributes = new Map<string, string>();
  public children: MockElement[] = [];
  private listeners = new Map<string, Array<(event: { preventDefault(): void; stopPropagation(): void }) => void>>();
  public classList = {
    toggle: (cls: string, force?: boolean): void => {
      const has = this.hasClass(cls);
      const next = force ?? !has;
      if (next && !has) this.addClass(cls);
      if (!next && has) this.removeClass(cls);
    },
  };

  constructor(tagName = "div", className = "") {
    this.tagName = tagName.toUpperCase();
    this.className = className;
  }

  createDiv(options: { cls?: string } = {}): MockElement {
    return this.createEl("div", options);
  }

  createEl(tag: string, options: { cls?: string; attr?: Record<string, string> } = {}): MockElement {
    const el = new MockElement(tag, options.cls || "");
    if (options.attr) for (const [key, value] of Object.entries(options.attr)) el.attributes.set(key, value);
    this.children.push(el);
    return el;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type: string, handler: (event: { preventDefault(): void; stopPropagation(): void }) => void): void {
    const list = this.listeners.get(type) ?? [];
    list.push(handler);
    this.listeners.set(type, list);
  }

  fire(type: string): void {
    for (const handler of this.listeners.get(type) ?? []) handler({ preventDefault() {}, stopPropagation() {} });
  }

  addClass(cls: string): void {
    if (!this.hasClass(cls)) this.className = `${this.className} ${cls}`.trim();
  }

  removeClass(cls: string): void {
    this.className = this.className.split(/\s+/).filter((item) => item && item !== cls).join(" ");
  }

  hasClass(cls: string): boolean {
    return this.className.split(/\s+/).includes(cls);
  }
}

function makeGroup() {
  return createHiddenPropertiesGroup({
    groupClass: "db-hidden-group",
    toggleClass: "db-hidden-toggle",
    fieldsClass: "db-hidden-fields",
    expandedClass: "is-expanded",
    label: (count) => `Hidden properties (${count})`,
  });
}

describe("createHiddenPropertiesGroup", () => {
  it("renders nothing for an empty hidden set", () => {
    const parent = new MockElement();
    const group = makeGroup();
    group.render(parent as unknown as HTMLElement, [], () => undefined);
    expect(parent.children).toHaveLength(0);
  });

  it("carries a count in the toggle label and starts collapsed", () => {
    const parent = new MockElement();
    const group = makeGroup();
    group.render(parent as unknown as HTMLElement, ["a", "b", "c"], () => undefined);

    const toggle = parent.children[0].children[0];
    expect(toggle.textContent).toBe("Hidden properties (3)");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(group.isExpanded()).toBe(false);
  });

  it("calls the row renderer once per hidden item", () => {
    const parent = new MockElement();
    const group = makeGroup();
    const rendered: string[] = [];
    group.render(parent as unknown as HTMLElement, ["a", "b"], (fieldsParent, item) => {
      rendered.push(item);
      fieldsParent.createDiv({ cls: `field-${item}` });
    });
    expect(rendered).toEqual(["a", "b"]);
    const fields = parent.children[0].children[1];
    expect(fields.children.map((c) => c.className)).toEqual(["field-a", "field-b"]);
  });

  it("survives a rebuild: toggling once, then re-rendering, keeps it expanded", () => {
    const group = makeGroup();

    const first = new MockElement();
    group.render(first as unknown as HTMLElement, ["a"], () => undefined);
    const firstToggle = first.children[0].children[0];
    firstToggle.fire("click");
    expect(group.isExpanded()).toBe(true);

    // A fresh parent stands in for the panel's own `.empty()` + rebuild on refresh.
    const second = new MockElement();
    group.render(second as unknown as HTMLElement, ["a", "b"], () => undefined);
    const secondGroup = second.children[0];
    const secondToggle = secondGroup.children[0];
    const secondFields = secondGroup.children[1];

    expect(group.isExpanded()).toBe(true);
    expect(secondGroup.hasClass("is-expanded")).toBe(true);
    expect(secondToggle.getAttribute("aria-expanded")).toBe("true");
    expect(secondFields.hasClass("is-hidden")).toBe(false);
  });
});
