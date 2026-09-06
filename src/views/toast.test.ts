// ───────────────────────────────────────────────────────────────────
// MODULE:    toast
// COMPONENT: source assertions plus a driven dwell matrix for the shared feedback surface
// ───────────────────────────────────────────────────────────────────
//
// Vitest runs this suite under a plain Node environment with no real browser `document`, so most
// of the component's markup is asserted against source text rather than rendered output, and the
// placement and capture-based checks stay with the browser-backed harnesses. The dwell budget is
// different: it is a duration, not a shape, so section 3 drives the production `showToast` against
// a minimal DOM double built for exactly this measurement, under fake timers so a 5000ms wait
// costs nothing real.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => ({ setIcon: vi.fn() }));
vi.mock("../i18n", () => ({ t: (key: string) => key }));

import { showToast, type ToastOptions } from "./toast";

const toastSource = readFileSync(resolve(__dirname, "./toast.ts"), "utf-8");

// ───────────────────────────────────────────────────────────────────
// 2. STRUCTURE ASSERTIONS
// ───────────────────────────────────────────────────────────────────

describe("toast", () => {
  it("exports the constructor every owned call site now migrates through", () => {
    expect(toastSource).toContain("export function showToast(");
  });

  it("pairs each severity with its own icon rather than colour alone", () => {
    expect(toastSource).toContain('options.severity === "success" ? "check" : "alert-triangle"');
    expect(toastSource).toContain("cls: `db-toast is-${options.severity}${options.container ? \" is-inline\" : \"\"}`");
  });

  it("gives a plain success its existing 2200ms budget and a longer one when an action is attached", () => {
    expect(toastSource).toMatch(/const AUTO_DISMISS_MS = 2200;/);
    expect(toastSource).toMatch(/const ACTION_DISMISS_MS = 5000;/);
    expect(toastSource).toMatch(/timer = window\.setTimeout\(close, options\.action \? ACTION_DISMISS_MS : AUTO_DISMISS_MS\);/);
  });

  it("never schedules a timer outside the success branch, so an error toast never times out", () => {
    expect(toastSource).not.toMatch(/severity === "error"[\s\S]{0,80}setTimeout/);
  });

  it("announces itself as a live status region", () => {
    expect(toastSource).toContain('role: "status"');
    expect(toastSource).toContain('"aria-live": "polite"');
    expect(toastSource).toContain('"aria-atomic": "true"');
  });

  it("gives the close control a real, keyboard-reachable button with an accessible name", () => {
    expect(toastSource).toMatch(/closeBtn = header\.createEl\("button",/);
    expect(toastSource).toContain('attr: { type: "button", "aria-label": t("common.close") }');
    expect(toastSource).toContain('setIcon(closeBtn, "x");');
  });

  it("wires the action's callback and closes on the click that triggered it", () => {
    expect(toastSource).toContain("void options.action?.onClick();\n      close();");
  });

  it("mounts on a db-surface stack so the token scale and reduced-motion reset both reach it", () => {
    expect(toastSource).toContain('cls: "db-surface db-toast-stack"');
  });

  it("mounts into a caller-supplied container as a single-slot placement instead of the shared stack", () => {
    expect(toastSource).toContain("const stack = options.container ?? getStack(doc);");
    expect(toastSource).toContain("if (options.container) stack.empty();");
  });

  it("stacks the newest toast in front rather than queuing it behind the visible one", () => {
    expect(toastSource).toContain("stack.prepend(card);");
  });

  it("clears its own timer on close so a dismissed toast cannot fire a stray auto-close later", () => {
    expect(toastSource).toMatch(/const close = \(\) => \{\s*\n\s*clearAutoDismiss\(\);\s*\n\s*card\.remove\(\);\s*\n\s*\};/);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. DWELL MATRIX — severity × action, driven against the production module
// ───────────────────────────────────────────────────────────────────

/** Reimplements just enough of Obsidian's element helper surface for `showToast` to mount into:
 *  element creation, class membership, and the connectedness check the stack cache reads. */
class FakeElement {
  tagName: string;
  children: FakeElement[] = [];
  parentElement: FakeElement | null = null;
  classes = new Set<string>();
  attributes = new Map<string, string>();

  constructor(tagName = "div", cls = "") {
    this.tagName = tagName.toUpperCase();
    if (cls) for (const part of cls.split(/\s+/).filter(Boolean)) this.classes.add(part);
  }

  createDiv(options: { cls?: string; attr?: Record<string, string> } = {}): FakeElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string; attr?: Record<string, string>; text?: string } = {}): FakeElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string; attr?: Record<string, string>; text?: string } = {}): FakeElement {
    const el = new FakeElement(tag, options.cls || "");
    if (options.attr) for (const [key, value] of Object.entries(options.attr)) el.attributes.set(key, value);
    el.parentElement = this;
    this.children.push(el);
    return el;
  }

  addClass(name: string): void {
    this.classes.add(name);
  }

  prepend(child: FakeElement): void {
    const index = this.children.indexOf(child);
    if (index >= 0) this.children.splice(index, 1);
    child.parentElement = this;
    this.children.unshift(child);
  }

  empty(): void {
    for (const child of this.children) child.parentElement = null;
    this.children = [];
  }

  remove(): void {
    if (!this.parentElement) return;
    const index = this.parentElement.children.indexOf(this);
    if (index >= 0) this.parentElement.children.splice(index, 1);
    this.parentElement = null;
  }

  get isConnected(): boolean {
    if (!this.parentElement) return this.tagName === "BODY";
    return this.parentElement.isConnected;
  }
}

function createFakeDoc(): { doc: Document; body: FakeElement } {
  const body = new FakeElement("body");
  return { doc: { body } as unknown as Document, body };
}

// A bare passthrough resolved at call time, not bound at module load: fake timers replace
// `globalThis.setTimeout` after this file evaluates, so capturing a reference up front would
// freeze on the real implementation instead of the one the matrix below advances.
const windowStub = {
  setTimeout: (...args: Parameters<typeof setTimeout>) => globalThis.setTimeout(...args),
  clearTimeout: (...args: Parameters<typeof clearTimeout>) => globalThis.clearTimeout(...args),
};

describe("toast dwell matrix", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("window", windowStub);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function mount(options: ToastOptions): FakeElement {
    const { doc, body } = createFakeDoc();
    showToast(doc, options);
    return body.children[0]; // the db-toast-stack
  }

  it("keeps a success toast carrying an action connected at 3000ms", () => {
    const stack = mount({ severity: "success", message: "Row deleted", action: { label: "Undo", onClick: () => {} } });
    vi.advanceTimersByTime(3000);
    expect(stack.children.length).toBe(1);
  });

  it("clears a plain success toast by 2500ms, unchanged from before the split", () => {
    const stack = mount({ severity: "success", message: "Saved" });
    vi.advanceTimersByTime(2500);
    expect(stack.children.length).toBe(0);
  });

  it("still clears a success toast carrying an action once its longer budget elapses", () => {
    const stack = mount({ severity: "success", message: "Row deleted", action: { label: "Undo", onClick: () => {} } });
    vi.advanceTimersByTime(5001);
    expect(stack.children.length).toBe(0);
  });

  it("never auto-dismisses an error toast, with or without an action", () => {
    const withAction = mount({ severity: "error", message: "Delete failed", action: { label: "Retry", onClick: () => {} } });
    const withoutAction = mount({ severity: "error", message: "Delete failed" });
    vi.advanceTimersByTime(20000);
    expect(withAction.children.length).toBe(1);
    expect(withoutAction.children.length).toBe(1);
  });
});
