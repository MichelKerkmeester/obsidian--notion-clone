// ───────────────────────────────────────────────────────────────────
// MODULE:    list-row-contracts.test
// COMPONENT: what row drag, range selection and group collapse require of the DOM today
// ───────────────────────────────────────────────────────────────────
//
// Recorded BEFORE the list is windowed, which is the only time it can be recorded honestly. Once
// only some rows exist in the DOM, "this is how it behaved before" is a memory rather than a
// measurement, and the three contracts below are exactly the ones windowing is expected to break.
//
// The question each asks is the same: does this behaviour derive from the DATA (every row, whether
// or not it is on screen) or from the DOM (only the rows currently rendered)? Anything in the
// second group breaks the moment a row can be absent, and one of them is.
//
// An off-window row is simulated by leaving it out of the ordered list a rendered DOM would have
// produced. That is precisely what windowing will do to these inputs.

/* eslint-disable import/no-nodejs-modules, no-undef --
   The last suite reads source to pin where an ordering comes from. Scoped to this test, which
   never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
import { applyRowSelectionPress } from "./table-cell-gesture";

// ───────────────────────────────────────────────────────────────────
// 1. SHAPES
// ───────────────────────────────────────────────────────────────────

const ALL_ROWS = Array.from({ length: 20 }, (_, index) => `row-${index}.md`);

/** What a windowed list would hand the selection: a contiguous slice, not the whole list. */
const WINDOW = ALL_ROWS.slice(0, 5);

// ───────────────────────────────────────────────────────────────────
// 2. RANGE SELECTION — the one that breaks
// ───────────────────────────────────────────────────────────────────

describe("range selection: ordered from the DOM, so windowing truncates it", () => {
  it("selects the whole range when every row is present, which is today's behaviour", () => {
    const selected = new Set<string>([ALL_ROWS[0]]);

    applyRowSelectionPress({
      orderedIds: ALL_ROWS,
      selectedIds: selected,
      anchorId: ALL_ROWS[0],
      targetId: ALL_ROWS[15],
      selected: true,
      shiftKey: true,
      heldPress: false,
    });

    // Sixteen rows, anchor through target inclusive.
    expect(selected.size).toBe(16);
    expect(selected.has(ALL_ROWS[15])).toBe(true);
  });

  it("silently selects a fraction of the range when the off-window rows are absent", () => {
    const selected = new Set<string>([ALL_ROWS[0]]);

    // The target is a real row the user can see and shift-click after scrolling. It is simply not
    // in the ordered list, because that list was built from the rows currently in the DOM.
    applyRowSelectionPress({
      orderedIds: WINDOW,
      selectedIds: selected,
      anchorId: ALL_ROWS[0],
      targetId: ALL_ROWS[15],
      selected: true,
      shiftKey: true,
      heldPress: false,
    });

    // Measured, not predicted: the range does not shorten, it COLLAPSES. Only the anchor and the
    // target survive and all fourteen rows between them are dropped, because the range walk needs
    // both ends in the ordered list and falls back to toggling the target alone when it cannot
    // find them. Shift-click silently degrades into an ordinary click.
    //
    // The first draft of this test asserted the target would be missing too. It is not — which is
    // what makes the failure quiet: the row the user actually clicked does get selected, so the
    // gesture looks like it worked.
    expect([...selected].sort()).toEqual([ALL_ROWS[0], ALL_ROWS[15]].sort());
    expect(selected.size).toBe(2);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. WHERE THAT ORDER COMES FROM
// ───────────────────────────────────────────────────────────────────

describe("the ordering source", () => {
  // The suite above proves the consequence given a truncated list. This proves the list really is
  // built that way — otherwise the consequence is hypothetical.
  it("getRenderedSelectionRows builds the order by querying the DOM", () => {
    const source = readFileSync(resolve(__dirname, "database-view.ts"), "utf-8");
    const body = source.slice(source.indexOf("private getRenderedSelectionRows"));
    const fn = body.slice(0, body.indexOf("\n  }"));

    expect(fn).toContain("querySelectorAll");
    expect(fn).toContain("data-note-database-row-path");
  });

  it("falls back to the full row list only when the DOM yields nothing at all", () => {
    const source = readFileSync(resolve(__dirname, "database-view.ts"), "utf-8");
    const body = source.slice(source.indexOf("private getOrderedSelectionRowPaths"));
    const fn = body.slice(0, body.indexOf("\n  }"));

    // This is why windowing breaks it QUIETLY rather than loudly. The fallback to `this.rows`
    // fires on an empty list; a windowed list is never empty, only incomplete, so the safety net
    // never catches anything and the truncated order is used as if it were the whole thing.
    expect(fn).toContain("ordered.length > 0 ? ordered : this.rows");
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE TWO THAT SURVIVE
// ───────────────────────────────────────────────────────────────────

describe("drag and group collapse do not depend on a row being rendered", () => {
  it("a drag batch is filtered through every row the renderer was given, not through the DOM", () => {
    const source = readFileSync(resolve(__dirname, "list-renderer.ts"), "utf-8");
    const body = source.slice(source.indexOf("private getDragPaths"));
    const fn = body.slice(0, body.indexOf("\n  }"));

    // `rowByPath` is built from the rows passed to render, so it holds every row whether or not
    // one was drawn. A windowed list keeps that map whole, and the batch keeps working.
    expect(fn).toContain("this.rowByPath.has(path)");
    expect(fn).not.toContain("querySelector");
  });

  it("group collapse is a config question, so a collapsed group has no rendered rows by design", () => {
    const source = readFileSync(resolve(__dirname, "list-renderer.ts"), "utf-8");

    // The renderer asks an action, which reads config. Nothing measures the DOM to decide it, and
    // a group whose rows are absent is the normal collapsed state rather than a windowing edge.
    expect(source).toContain("this.actions.isGroupCollapsed?.(groupField, group.key)");
  });
});
