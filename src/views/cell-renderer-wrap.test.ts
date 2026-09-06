// ───────────────────────────────────────────────────────────────────
// MODULE:    cell-renderer-wrap.test
// COMPONENT: unit coverage for the one place a cell's wrap state is resolved
// ───────────────────────────────────────────────────────────────────
//
// `renderCell` resolves the view's wrap switch against the column's own mode:
// the switch gates, the mode refines. `.db-cell-wrap` is the single class that
// decision produces, and everything downstream hangs off it — the stylesheet's
// `white-space`, the `td:not(.db-cell-wrap)` rule that keeps the four value
// containers on one line, and the phone rule that no longer outranks it. A
// wiring mistake at any of the four call sites reads as a table that quietly
// ignores the setting, which no type check catches because the parameter is
// optional.
//
// The mock element reimplements only the two Obsidian DOM helpers this path
// touches before it returns, the way owned-menu.test.ts drives the real menu
// against a hand-built element rather than a mounted view. The column is left
// empty on purpose: `renderCell` decides wrap in its first two lines and the
// empty-value branch is the shortest way back out, so the assertion is about
// the decision and nothing else.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & DOM SHIM
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";

// The catalogue stub the resolver already aliases `obsidian` to carries every class this module
// graph constructs at import time; only the two DOM helpers used on this path are replaced.
vi.mock("obsidian", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  setIcon: vi.fn(),
  setTooltip: vi.fn(),
}));

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { activeDocument: { documentElement: { lang: "en" } } },
});

import { CellRenderer } from "./cell-renderer";
import type { DataSource } from "../data/data-source";
import type { ColumnDef, RowData } from "../data/types";

class MockElement {
  readonly classes = new Set<string>();
  // One ordered list rather than separate text/element arrays, so the markdown-branch tests can
  // tell a collapsed line break (no child, an inline space) from a real one (a <br> child between
  // two text nodes) without a real DOM's textContent.
  readonly nodes: (string | MockElement)[] = [];
  tagName = "DIV";
  title = "";
  tabIndex = 0;

  addClass(...names: string[]): void {
    for (const name of names) this.classes.add(name);
  }

  createSpan(): MockElement {
    const child = new MockElement();
    this.nodes.push(child);
    return child;
  }

  createEl(tag: string): MockElement {
    const child = new MockElement();
    child.tagName = tag.toUpperCase();
    this.nodes.push(child);
    return child;
  }

  appendText(text: string): void {
    this.nodes.push(text);
  }

  empty(): void {
    this.nodes.length = 0;
  }

  addEventListener(): void {
    /* no listener is exercised on the empty-value or read-only display paths */
  }

  hasChildTag(tag: string): boolean {
    return this.nodes.some((node) => typeof node !== "string" && node.tagName === tag.toUpperCase());
  }

  get textContent(): string {
    return this.nodes.map((node) => (typeof node === "string" ? node : node.textContent)).join("");
  }
}

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURES
// ───────────────────────────────────────────────────────────────────

function renderer(): CellRenderer {
  // Read-only, so the empty-value branch returns before it reaches any editor.
  return new CellRenderer(
    undefined as unknown as DataSource,
    async () => undefined,
    () => undefined,
    undefined,
    undefined,
    true,
  );
}

const row = { file: { path: "Notes/One.md" }, frontmatter: {}, computed: {} } as unknown as RowData;

function wrapsWith(colWrap: boolean | undefined, viewDefault: boolean | undefined): boolean {
  const td = new MockElement();
  const col = { key: "Notes", label: "Notes", type: "text", wrap: colWrap } as ColumnDef;
  renderer().renderCell(td as unknown as HTMLElement, row, col, viewDefault);
  return td.classes.has("db-cell-wrap");
}

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

// The whole matrix, both axes, one case per cell. The column's three modes are Wrap (`true`),
// Clip (`false`) and Follow (`undefined`); the view's switch is on, off, or absent from a config
// written before it existed, which reads as off.
describe("CellRenderer wrap resolution", () => {
  it("clips every column mode while the view switch is off", () => {
    expect(wrapsWith(true, false)).toBe(false);
    expect(wrapsWith(false, false)).toBe(false);
    expect(wrapsWith(undefined, false)).toBe(false);
  });

  it("wraps Wrap and Follow while the view switch is on, and leaves Clip clipped", () => {
    expect(wrapsWith(true, true)).toBe(true);
    expect(wrapsWith(undefined, true)).toBe(true);
    expect(wrapsWith(false, true)).toBe(false);
  });

  // A vault written before the switch existed carries no `wrapText` at all, and the switch is off
  // until someone turns it on — so the column mode waits with it rather than acting alone.
  it("treats an absent view switch as off, whatever the column asks for", () => {
    expect(wrapsWith(undefined, undefined)).toBe(false);
    expect(wrapsWith(true, undefined)).toBe(false);
    expect(wrapsWith(false, undefined)).toBe(false);
  });
});

// A markdown-render column's own line breaks travel through `renderInlineMarkdown` as `<br>`
// elements, which force their break under any `white-space` value — including the `nowrap` a
// clipped cell relies on. Resolving to clip has to reach that render call too, or a long-text
// value with its own line breaks reopens the row-height defect through a door the wrap toggle
// never touches.
describe("CellRenderer markdown wrap: line-break collapse", () => {
  const value = "Line one\nLine two";

  function renderMarkdown(colWrap: boolean | undefined, viewDefault: boolean | undefined): MockElement {
    const td = new MockElement();
    const col = { key: "Journal", label: "Journal", type: "text", textRenderMode: "markdown", wrap: colWrap } as ColumnDef;
    const markdownRow = { file: { path: "Notes/One.md" }, frontmatter: { Journal: value }, computed: {} } as unknown as RowData;
    renderer().renderCell(td as unknown as HTMLElement, markdownRow, col, viewDefault);
    return td;
  }

  it("collapses the line break to a space when the resolved state clips", () => {
    const td = renderMarkdown(false, true);
    expect(td.hasChildTag("br")).toBe(false);
    expect(td.textContent).toBe("Line one Line two");
  });

  it("keeps the line break when the switch is on and the column asks to wrap", () => {
    const td = renderMarkdown(true, true);
    expect(td.hasChildTag("br")).toBe(true);
  });

  it("keeps the line break when the switch is on and the column names no mode", () => {
    const td = renderMarkdown(undefined, true);
    expect(td.hasChildTag("br")).toBe(true);
  });

  // The narrower producer under the switch that governs it: a column asking to wrap does not
  // escape a clipped table through markdown any more than through its own class.
  it("collapses the line break when the switch is off even though the column asks to wrap", () => {
    const td = renderMarkdown(true, false);
    expect(td.hasChildTag("br")).toBe(false);
    expect(td.textContent).toBe("Line one Line two");
  });
});
