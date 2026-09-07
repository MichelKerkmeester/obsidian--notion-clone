// ───────────────────────────────────────────────────────────────────
// MODULE:    hidden-properties.test
// COMPONENT: The property-visibility group's Shown/Hidden split, count and refresh-survival
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import { createHiddenPropertiesGroup, type HiddenGroupRow } from "./hidden-properties";

vi.mock("obsidian", () => ({
  setIcon: vi.fn(),
}));

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURE
// ───────────────────────────────────────────────────────────────────

class MockElement {
  public tagName: string;
  public className: string;
  public textContent = "";
  public title = "";
  public disabled = false;
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

  createSpan(options: { cls?: string; text?: string } = {}): MockElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): MockElement {
    const el = new MockElement(tag, options.cls || "");
    if (options.text !== undefined) el.textContent = options.text;
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
    groupClass: "obnotion-hidden-group",
    toggleClass: "obnotion-hidden-toggle",
    fieldsClass: "obnotion-hidden-fields",
    expandedClass: "is-expanded",
    sectionClass: "obnotion-hidden-section",
    sectionHeaderClass: "obnotion-hidden-section-header",
    sectionTitleClass: "obnotion-hidden-section-title",
    bulkLinkClass: "obnotion-hidden-bulk-link",
    rowClass: "obnotion-hidden-row",
    dragHandleClass: "obnotion-hidden-drag",
    dragHandleTitle: "Drag to reorder",
    typeClass: "obnotion-hidden-type",
    nameWrapClass: "obnotion-hidden-name-wrap",
    nameClass: "obnotion-hidden-name",
    eyeClass: "obnotion-hidden-eye",
    chevronClass: "obnotion-hidden-chevron",
    shownSectionTitle: "Shown",
    hiddenSectionTitle: "Hidden",
    hideAllLabel: "Hide all",
    showAllLabel: "Show all",
    label: (count) => `Hidden properties (${count})`,
  });
}

function row(key: string, visible: boolean, eyeDisabled = false): HiddenGroupRow<string> {
  return { item: key, key, label: key, visible, eyeDisabled, renderTypeIcon: () => undefined };
}

// ───────────────────────────────────────────────────────────────────
// 3. CASES
// ───────────────────────────────────────────────────────────────────

describe("createHiddenPropertiesGroup", () => {
  it("renders the group even when nothing is hidden, and omits the Hidden section", () => {
    const parent = new MockElement();
    const group = makeGroup();
    group.render(parent as unknown as HTMLElement, [row("title", true, true), row("status", true)], [], vi.fn(), vi.fn());

    expect(parent.children).toHaveLength(1);
    const fields = parent.children[0].children[1];
    const sectionTitles = fields.children.map((section) => section.children[0].children[0].textContent);
    expect(sectionTitles).toEqual(["Shown"]);
  });

  it("carries the hidden count (not the shown count) in the entry row's label", () => {
    const parent = new MockElement();
    const group = makeGroup();
    group.render(parent as unknown as HTMLElement, [row("title", true, true)], [row("a", false), row("b", false)], vi.fn(), vi.fn());

    const toggle = parent.children[0].children[0];
    expect(toggle.textContent).toBe("Hidden properties (2)");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(group.isExpanded()).toBe(false);
  });

  it("renders both sections, the Hidden section only present once something is hidden", () => {
    const parent = new MockElement();
    const group = makeGroup();
    group.render(parent as unknown as HTMLElement, [row("title", true, true)], [row("a", false)], vi.fn(), vi.fn());

    const fields = parent.children[0].children[1];
    const sectionTitles = fields.children.map((section) => section.children[0].children[0].textContent);
    expect(sectionTitles).toEqual(["Shown", "Hidden"]);
  });

  it("disables the eye on a row marked eyeDisabled and wires every other row's click to onToggle", () => {
    const parent = new MockElement();
    const group = makeGroup();
    const onToggle = vi.fn();
    group.render(
      parent as unknown as HTMLElement,
      [row("title", true, true)],
      [row("a", false)],
      onToggle,
      vi.fn(),
    );

    const fields = parent.children[0].children[1];
    const shownSection = fields.children[0];
    const titleRow = shownSection.children[1]; // index 0 is the section header
    const titleEye = titleRow.children[3]; // handle, type, nameWrap, eye, chevron
    expect(titleEye.disabled).toBe(true);
    titleEye.fire("click");
    expect(onToggle).not.toHaveBeenCalled();

    const hiddenSection = fields.children[1];
    const hiddenRow = hiddenSection.children[1];
    const hiddenEye = hiddenRow.children[3];
    expect(hiddenEye.disabled).toBe(false);
    hiddenEye.fire("click");
    expect(onToggle).toHaveBeenCalledWith("a", true);
  });

  it("fires the bulk link for its own section only, with its own rows and target visibility", () => {
    const parent = new MockElement();
    const group = makeGroup();
    const onBulkToggle = vi.fn();
    group.render(
      parent as unknown as HTMLElement,
      [row("title", true, true), row("status", true)],
      [row("a", false), row("b", false)],
      vi.fn(),
      onBulkToggle,
    );

    const fields = parent.children[0].children[1];
    const hiddenBulk = fields.children[1].children[0].children[1];
    hiddenBulk.fire("click");
    expect(onBulkToggle).toHaveBeenCalledWith(["a", "b"], true);

    const shownBulk = fields.children[0].children[0].children[1];
    shownBulk.fire("click");
    expect(onBulkToggle).toHaveBeenLastCalledWith(["title", "status"], false);
  });

  it("survives a rebuild: toggling the disclosure once, then re-rendering, keeps it expanded", () => {
    const group = makeGroup();

    const first = new MockElement();
    group.render(first as unknown as HTMLElement, [row("title", true, true)], [row("a", false)], vi.fn(), vi.fn());
    const firstToggle = first.children[0].children[0];
    firstToggle.fire("click");
    expect(group.isExpanded()).toBe(true);

    // A fresh parent stands in for the panel's own `.empty()` + rebuild on refresh.
    const second = new MockElement();
    group.render(second as unknown as HTMLElement, [row("title", true, true)], [row("a", false), row("b", false)], vi.fn(), vi.fn());
    const secondGroup = second.children[0];
    const secondToggle = secondGroup.children[0];
    const secondFields = secondGroup.children[1];

    expect(group.isExpanded()).toBe(true);
    expect(secondGroup.hasClass("is-expanded")).toBe(true);
    expect(secondToggle.getAttribute("aria-expanded")).toBe("true");
    expect(secondFields.hasClass("is-hidden")).toBe(false);
  });
});
