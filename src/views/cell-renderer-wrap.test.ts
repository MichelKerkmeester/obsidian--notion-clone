// ───────────────────────────────────────────────────────────────────
// MODULE:    cell-renderer-wrap.test
// COMPONENT: unit coverage for the one place a cell's wrap state is resolved
// ───────────────────────────────────────────────────────────────────
//
// `renderCell` reads the view's wrap default only when the column carries no
// override of its own, and `.db-cell-wrap` is the single class that decision
// produces — everything downstream (the stylesheet's `white-space`, and the
// `td:not(.db-cell-wrap)` rule that keeps the four value containers on one
// line) hangs off it. A wiring mistake at any of the four call sites reads as
// a table that quietly ignores the setting, which no type check catches
// because the parameter is optional.
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
  title = "";
  tabIndex = 0;

  addClass(...names: string[]): void {
    for (const name of names) this.classes.add(name);
  }

  createSpan(): MockElement {
    return new MockElement();
  }

  addEventListener(): void {
    /* no listener is exercised on the empty-value path */
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

describe("CellRenderer wrap resolution", () => {
  it("lets a column's own choice win over the view default in both directions", () => {
    expect(wrapsWith(false, true)).toBe(false);
    expect(wrapsWith(true, false)).toBe(true);
  });

  it("follows the view default only when the column carries no override", () => {
    expect(wrapsWith(undefined, true)).toBe(true);
    expect(wrapsWith(undefined, false)).toBe(false);
  });

  it("clips when neither side asks for wrapping, which is what an upgraded vault has", () => {
    expect(wrapsWith(undefined, undefined)).toBe(false);
  });
});
