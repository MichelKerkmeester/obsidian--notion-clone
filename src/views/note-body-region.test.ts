// ───────────────────────────────────────────────────────────────────
// MODULE:    note-body-region.test
// COMPONENT: the region's mode machinery, minus the rendering
// ───────────────────────────────────────────────────────────────────
//
// What is asserted here is structure and behaviour: the region mounts under the
// properties, a tap swaps it for a focused editor, typing debounces into one
// commit rather than one per keystroke, and every exit path flushes.
//
// What is NOT asserted here is the rendering. Obsidian's `MarkdownRenderer` has
// no standalone build — the storybook stub declares it out of scope, which is
// why `inline-markdown-renderer.ts` carries a story-coverage exemption for the
// same reason. The renderer is injected, so these tests pass a recording stand-
// in and check only that the region asked it for the right markdown. That the
// markdown then renders as links, embeds and task checkboxes is device-verified
// and cannot be established from here.
//
// Runs against a hand-built fake DOM rather than jsdom, since this project's
// vitest environment is "node" — the same approach `table-record-peek.test.ts`
// takes for the other phone sheet.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { beforeEach, describe, expect, it, vi } from "vitest";
import { mountNoteBodyRegion } from "./note-body-region";

// ───────────────────────────────────────────────────────────────────
// 2. FAKE DOM
// ───────────────────────────────────────────────────────────────────

type Handler = (event: unknown) => void;

class FakeElement {
  children: FakeElement[] = [];
  parent: FakeElement | null = null;
  className = "";
  textContent = "";
  tabIndex = -1;
  value = "";
  placeholder = "";
  rows = 0;
  style: Record<string, string> = {};
  scrollHeight = 120;
  selectionStart = 0;
  focused = false;
  readonly listeners = new Map<string, Set<Handler>>();

  constructor(readonly tagName: string, readonly ownerDocument: FakeDocument) {}

  get classList() {
    return {
      add: (name: string) => {
        if (!this.className.split(" ").includes(name)) {
          this.className = `${this.className} ${name}`.trim();
        }
      },
      remove: (name: string) => {
        this.className = this.className.split(" ").filter((entry) => entry !== name).join(" ");
      },
      contains: (name: string) => this.className.split(" ").includes(name),
    };
  }

  appendChild(child: FakeElement): FakeElement {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  replaceChildren(): void {
    for (const child of this.children) child.parent = null;
    this.children = [];
  }

  remove(): void {
    if (!this.parent) return;
    this.parent.children = this.parent.children.filter((child) => child !== this);
    this.parent = null;
  }

  addEventListener(type: string, handler: Handler): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
  }

  dispatch(type: string, event: Record<string, unknown> = {}): void {
    for (const handler of this.listeners.get(type) ?? []) {
      handler({ preventDefault: () => undefined, stopPropagation: () => undefined, ...event });
    }
  }

  focus(): void {
    this.focused = true;
  }

  setSelectionRange(start: number): void {
    this.selectionStart = start;
  }

  /** Depth-first search by class name, for asserting what the region built. */
  find(className: string): FakeElement | null {
    if (this.classList.contains(className)) return this;
    for (const child of this.children) {
      const hit = child.find(className);
      if (hit) return hit;
    }
    return null;
  }
}

class FakeDocument {
  defaultView = {
    setTimeout: (fn: () => void, ms?: number) => setTimeout(fn, ms) as unknown as number,
    clearTimeout: (id: number) => clearTimeout(id as unknown as NodeJS.Timeout),
  };

  createElement(tagName: string): FakeElement {
    return new FakeElement(tagName, this);
  }
}

function makePanel(): FakeElement {
  const doc = new FakeDocument();
  const panel = new FakeElement("div", doc);
  // Stand in for the properties the region has to sit under.
  panel.appendChild(doc.createElement("div")).className = "db-record-detail-fields";
  return panel;
}

interface Harness {
  panel: FakeElement;
  commits: string[];
  rendered: string[];
}

function mount(body: string, overrides: Record<string, unknown> = {}) {
  const panel = makePanel();
  const harness: Harness = { panel, commits: [], rendered: [] };
  const region = mountNoteBodyRegion({
    parent: panel as unknown as HTMLElement,
    body,
    placeholder: "Write a note…",
    commitDelayMs: 5,
    renderMarkdown: (target, markdown) => {
      harness.rendered.push(markdown);
      (target as unknown as FakeElement).textContent = markdown;
    },
    onCommit: (next) => harness.commits.push(next),
    ...overrides,
  });
  return { ...harness, region };
}

// ───────────────────────────────────────────────────────────────────
// 3. PLACEMENT AND READ MODE
// ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useRealTimers();
});

describe("the body region in read mode", () => {
  it("mounts as the last child, under the properties", () => {
    const { panel } = mount("# Notes\n");
    expect(panel.children.at(-1)?.className).toBe("db-record-detail-body");
    expect(panel.children.at(0)?.className).toBe("db-record-detail-fields");
  });

  it("hands the body to the renderer rather than printing it", () => {
    const { rendered } = mount("# Notes\n\n[[A link]]\n");
    expect(rendered).toEqual(["# Notes\n\n[[A link]]\n"]);
  });

  it("shows a placeholder, and asks the renderer for nothing, when there is no body", () => {
    const { panel, rendered } = mount("");
    const content = panel.find("db-record-detail-body-rendered");
    expect(rendered).toEqual([]);
    expect(content?.classList.contains("is-empty")).toBe(true);
    expect(content?.textContent).toBe("Write a note…");
  });

  it("is reachable by keyboard as well as by tap", () => {
    const { panel } = mount("Body");
    expect(panel.find("db-record-detail-body-rendered")?.tabIndex).toBe(0);
  });

  it("offers no way in when the surface is read-only", () => {
    const { panel, region } = mount("Body", { readOnly: true });
    const content = panel.find("db-record-detail-body-rendered");
    expect(content?.tabIndex).toBe(-1);
    content?.dispatch("click");
    region.beginEdit();
    expect(region.isEditing()).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE SWAP
// ───────────────────────────────────────────────────────────────────

describe("swapping into the editor", () => {
  it("replaces the rendered body with a focused textarea on tap", () => {
    const { panel, region } = mount("Body text");
    panel.find("db-record-detail-body-rendered")?.dispatch("click");

    const editor = panel.find("db-record-detail-body-editor");
    expect(region.isEditing()).toBe(true);
    expect(editor?.tagName).toBe("textarea");
    expect(editor?.value).toBe("Body text");
    expect(editor?.focused).toBe(true);
    expect(panel.find("db-record-detail-body-rendered")).toBeNull();
  });

  it("opens on Enter from the keyboard", () => {
    const { panel, region } = mount("Body text");
    panel.find("db-record-detail-body-rendered")?.dispatch("keydown", { key: "Enter" });
    expect(region.isEditing()).toBe(true);
  });

  it("puts the caret where it was asked to", () => {
    const { panel, region } = mount("Body text");
    region.beginEdit(4);
    expect(panel.find("db-record-detail-body-editor")?.selectionStart).toBe(4);
  });

  it("grows to its content instead of scrolling inside itself", () => {
    const { panel, region } = mount("Body text");
    region.beginEdit();
    expect(panel.find("db-record-detail-body-editor")?.style.height).toBe("120px");
  });

  it("returns to the rendered body on blur", () => {
    const { panel, region } = mount("Body text");
    region.beginEdit();
    panel.find("db-record-detail-body-editor")?.dispatch("blur");
    expect(region.isEditing()).toBe(false);
    expect(panel.find("db-record-detail-body-rendered")).not.toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. COMMITTING
// ───────────────────────────────────────────────────────────────────

describe("committing the draft", () => {
  const type = (panel: FakeElement, text: string): void => {
    const editor = panel.find("db-record-detail-body-editor");
    if (!editor) throw new Error("no editor mounted");
    editor.value = text;
    editor.dispatch("input");
  };

  it("writes once for a burst of keystrokes, not once per keystroke", async () => {
    const { panel, region, commits } = mount("");
    region.beginEdit();
    type(panel, "H");
    type(panel, "He");
    type(panel, "Hel");
    type(panel, "Hello");
    expect(commits).toEqual([]);

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(commits).toEqual(["Hello"]);
  });

  it("flushes on blur without waiting for the timer", () => {
    const { panel, region, commits } = mount("");
    region.beginEdit();
    type(panel, "Typed");
    panel.find("db-record-detail-body-editor")?.dispatch("blur");
    expect(commits).toEqual(["Typed"]);
  });

  it("flushes on Escape and leaves the region open", () => {
    const { panel, region, commits } = mount("");
    region.beginEdit();
    type(panel, "Typed");
    panel.find("db-record-detail-body-editor")?.dispatch("keydown", { key: "Escape" });
    expect(commits).toEqual(["Typed"]);
    expect(region.isEditing()).toBe(false);
    expect(panel.find("db-record-detail-body-rendered")).not.toBeNull();
  });

  it("flushes on destroy, so a panel rebuild cannot drop the draft", () => {
    const { panel, region, commits } = mount("");
    region.beginEdit();
    type(panel, "Half a sen");
    region.destroy();
    expect(commits).toEqual(["Half a sen"]);
  });

  it("carries the uncommitted draft and the caret out of a teardown", () => {
    const { panel, region } = mount("");
    region.beginEdit();
    type(panel, "Half a sen");
    const editor = panel.find("db-record-detail-body-editor");
    if (editor) editor.selectionStart = 6;

    expect(region.isEditing()).toBe(true);
    expect(region.draft()).toBe("Half a sen");
    expect(region.caret()).toBe(6);
  });

  it("writes nothing when the text comes back to what it already was", async () => {
    const { panel, region, commits } = mount("Original");
    region.beginEdit();
    type(panel, "Original edited");
    type(panel, "Original");
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(commits).toEqual([]);
  });

  it("takes the region out of the panel on destroy", () => {
    const { panel, region } = mount("Body");
    region.destroy();
    expect(panel.find("db-record-detail-body")).toBeNull();
  });
});
