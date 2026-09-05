// ───────────────────────────────────────────────────────────────────
// MODULE:    record-header.test
// COMPONENT: Header block primitive — desktop and phone variants
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. CASES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import { buildDesktopRecordHeader, buildPhoneRecordHeader } from "./record-header";

vi.mock("obsidian", () => ({
  setIcon: vi.fn(),
  setTooltip: vi.fn(),
}));

class MockElement {
  public tagName: string;
  public className: string;
  public text: string | null = null;
  public textContent = "";
  public attributes = new Map<string, string>();
  public children: MockElement[] = [];
  private listeners = new Map<string, Array<(event: { stopPropagation(): void; preventDefault(): void }) => void>>();

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
    if (options.attr) for (const [key, value] of Object.entries(options.attr)) el.attributes.set(key, value);
    this.children.push(el);
    return el;
  }

  addEventListener(type: string, handler: (event: { stopPropagation(): void; preventDefault(): void }) => void): void {
    const list = this.listeners.get(type) ?? [];
    list.push(handler);
    this.listeners.set(type, list);
  }

  fire(type: string): void {
    for (const handler of this.listeners.get(type) ?? []) handler({ stopPropagation() {}, preventDefault() {} });
  }

  addClass(cls: string): void {
    this.className = `${this.className} ${cls}`.trim();
  }

  hasClass(cls: string): boolean {
    return this.className.split(/\s+/).includes(cls);
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
}

function matches(node: MockElement, selector: string): boolean {
  if (selector.startsWith(".")) return node.className.split(/\s+/).includes(selector.slice(1));
  return node.tagName === selector.toUpperCase();
}

describe("buildDesktopRecordHeader", () => {
  it("reproduces the record sheet's icon + title + open + close DOM", () => {
    const parent = new MockElement();
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const handle = buildDesktopRecordHeader({
      parent: parent as unknown as HTMLElement,
      title: "My Record",
      titleIsEmpty: false,
      onOpen,
      onClose,
    });

    expect(handle.header.hasClass("db-record-detail-header")).toBe(true);
    expect(handle.titleEl.hasClass("db-record-detail-title")).toBe(true);
    expect(handle.titleEl.textContent).toBe("My Record");
    expect(handle.openButton?.hasClass("db-board-card-open")).toBe(true);
    expect(handle.closeButton?.hasClass("db-cell-edit-close")).toBe(true);
  });

  it("marks an empty title and never wires a rename unless one is supplied", () => {
    const parent = new MockElement();
    const handle = buildDesktopRecordHeader({
      parent: parent as unknown as HTMLElement,
      title: "",
      titleIsEmpty: true,
      onOpen: vi.fn(),
      onClose: vi.fn(),
    });

    expect(handle.titleEl.hasClass("is-empty-title")).toBe(true);
    const onRename = vi.fn();
    (handle.titleEl as unknown as MockElement).fire("dblclick");
    expect(onRename).not.toHaveBeenCalled();
  });

  it("wires rename only when the caller opts in, and open/close to their own actions", () => {
    const parent = new MockElement();
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onRename = vi.fn();
    const handle = buildDesktopRecordHeader({
      parent: parent as unknown as HTMLElement,
      title: "Renamable",
      titleIsEmpty: false,
      rename: { onRename },
      onOpen,
      onClose,
    });

    (handle.titleEl as unknown as MockElement).fire("dblclick");
    expect(onRename).toHaveBeenCalledWith(handle.titleEl);

    (handle.openButton as unknown as MockElement).fire("click");
    expect(onOpen).toHaveBeenCalledTimes(1);

    (handle.closeButton as unknown as MockElement).fire("click");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("draws no open/close button when the caller omits them, for a display-only rail", () => {
    const parent = new MockElement();
    const handle = buildDesktopRecordHeader({
      parent: parent as unknown as HTMLElement,
      title: "Rail Title",
      titleIsEmpty: false,
      headerClass: "db-record-peek-header",
      titleClass: "db-record-peek-title",
    });

    expect(handle.header.hasClass("db-record-peek-header")).toBe(true);
    expect(handle.titleEl.hasClass("db-record-peek-title")).toBe(true);
    expect(handle.openButton).toBeNull();
    expect(handle.closeButton).toBeNull();
  });
});

describe("buildPhoneRecordHeader", () => {
  it("delegates to the shared sheet header rather than drawing its own DOM", () => {
    const parent = new MockElement();
    const onClose = vi.fn();
    const handle = buildPhoneRecordHeader({
      parent: parent as unknown as HTMLElement,
      title: "Sheet Title",
      onClose,
    });

    expect(handle.header.hasClass("db-panel-header")).toBe(true);
    expect(handle.titleEl.hasClass("db-panel-title")).toBe(true);
    expect(handle.titleEl.textContent).toBe("Sheet Title");
    expect(handle.closeButton.hasClass("db-sheet-close")).toBe(true);
  });
});
