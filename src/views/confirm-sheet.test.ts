// ───────────────────────────────────────────────────────────────────
// MODULE:    confirm-sheet.test
// COMPONENT: unit coverage for the shared confirm body's action order
// ───────────────────────────────────────────────────────────────────
//
// Drives the real `buildConfirmSheetBody` against a minimal element shim —
// the builder needs only the Obsidian DOM helper surface (`createEl`/`createDiv`,
// plain properties, no_obsidian import), the same way owned-menu.test.ts drives
// its renderer. What it proves: the stacked confirm leads with the destructive
// action and leaves Cancel as its final row, while the side-by-side variant
// every other modal footer shares keeps Cancel first and the confirm last —
// so a future reorder that fixes one reading cannot silently flip the other.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & DOM SHIM
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";

import { buildConfirmSheetBody } from "./confirm-sheet";

/** Just the helper surface `buildConfirmSheetBody` draws on — no DOM beyond it. */
class MiniElement {
  tag: string;
  className = "";
  text = "";
  attributes: Record<string, string> = {};
  children: MiniElement[] = [];

  constructor(tag: string) {
    this.tag = tag;
  }

  get textContent(): string {
    return this.text !== "" ? this.text : this.children.map((child) => child.textContent).join("");
  }

  createEl(tag: string, options: { cls?: string; attr?: Record<string, string>; text?: string } = {}): MiniElement {
    const el = new MiniElement(tag);
    if (options.cls) el.className = options.cls;
    if (options.text !== undefined) el.text = options.text;
    if (options.attr) for (const [name, value] of Object.entries(options.attr)) el.attributes[name] = value;
    this.children.push(el);
    return el;
  }

  createDiv(options: { cls?: string; attr?: Record<string, string>; text?: string } = {}): MiniElement {
    return this.createEl("div", options);
  }
}

type MiniButton = MiniElement & { onclick: (() => void) | null };

const actionButtonsOf = (stacked: boolean): MiniElement[] => {
  const host = new MiniElement("div");
  buildConfirmSheetBody(host as unknown as HTMLElement, {
    title: "Delete this row?",
    message: "This action cannot be undone.",
    cancelText: "Cancel",
    confirmText: "Delete",
    danger: true,
    stackedActions: stacked,
    onCancel: () => undefined,
    onConfirm: () => undefined,
  });
  const actions = host.children.find((child) => child.className.includes("obnotion-modal-actions"));
  return (actions?.children ?? []).filter((child) => child.tag === "button");
};

// ───────────────────────────────────────────────────────────────────
// 2. ORDER
// ───────────────────────────────────────────────────────────────────

describe("confirm sheet action order", () => {
  it("stacked: the destructive action is the first child, Cancel the last", () => {
    const buttons = actionButtonsOf(true);
    expect(buttons).toHaveLength(2);
    expect(buttons[0].className).toContain("mod-warning");
    expect(buttons[0].textContent).toBe("Delete");
    expect(buttons[buttons.length - 1].textContent).toBe("Cancel");
    expect(buttons[buttons.length - 1].className).not.toContain("mod-warning");
  });

  it("side-by-side: Cancel stays first and the confirm carries the danger styling at the end", () => {
    const buttons = actionButtonsOf(false);
    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent).toBe("Cancel");
    expect(buttons[buttons.length - 1].textContent).toBe("Delete");
    expect(buttons[buttons.length - 1].className).toContain("mod-warning");
  });

  it("stacked with a secondary action: the destructive action still leads, Cancel still closes", () => {
    const host = new MiniElement("div");
    buildConfirmSheetBody(host as unknown as HTMLElement, {
      title: "Replace?",
      message: "The existing note will be overwritten.",
      cancelText: "Cancel",
      confirmText: "Replace",
      danger: true,
      secondaryButton: { text: "Append", value: "append" },
      stackedActions: true,
      onCancel: () => undefined,
      onConfirm: () => undefined,
      onSecondary: () => undefined,
    });
    const actions = host.children.find((child) => child.className.includes("obnotion-modal-actions"));
    const texts = (actions?.children ?? []).map((child) => child.textContent);
    expect(texts).toEqual(["Replace", "Append", "Cancel"]);
  });
});
