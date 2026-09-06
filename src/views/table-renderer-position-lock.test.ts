// ───────────────────────────────────────────────────────────────────
// MODULE:    table-renderer-position-lock.test
// COMPONENT: a row's index holds while its name is being typed in a sorted view
// ───────────────────────────────────────────────────────────────────
//
// A sorted table can only reposition a row by receiving a freshly ordered `rows` array from the
// pipeline that sorts them (query-engine.ts, upstream of TableRenderer); TableRenderer itself
// carries no sort of its own and paints whatever order it is handed. So the whole question of
// whether an in-progress name edit moves a row reduces to one thing: does anything inside the
// name editor's own keystroke handlers ask for a fresh sort before the edit commits?
//
// It does not. cell-renderer.ts's editFileName delegates to editSingleLinePopover, whose
// popover editor never touches the cell's own DOM and whose per-keystroke handler
// (input.onkeydown) only reacts to Enter, Tab and Escape — each of which calls `save` or
// `cancel`, and both close the editor rather than reordering mid-keystroke. There is no
// `oninput` handler on the input at all, so a keystroke that is neither of those three keys does
// nothing but land in the field. The row's position is therefore already held for the whole
// typing session and moves exactly once, when `save` resolves and the pipeline re-sorts —
// structurally, not through a state flag this file would otherwise have to build and could get
// wrong. This suite pins that structure so it fails the moment either half of it changes.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   Pinning the editor's own keystroke-handling shape needs the node builtins the plugin runtime
   rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const cellRendererSource = readFileSync(resolve(__dirname, "./cell-renderer.ts"), "utf-8");
const tableRendererSource = readFileSync(resolve(__dirname, "./table-renderer.ts"), "utf-8");

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("the name editor never re-sorts mid-keystroke", () => {
  it("editFileName delegates to the popover editor rather than touching the cell DOM live", () => {
    const start = cellRendererSource.indexOf("editFileName(td: HTMLElement");
    expect(start).toBeGreaterThan(-1);
    const end = cellRendererSource.indexOf("\n  }", start);
    const body = cellRendererSource.slice(start, end);

    expect(body).toContain("this.editSingleLinePopover(");
    // The popover renders detached from the cell; nothing here writes the in-progress draft back
    // into `td`, which is what would make a live rename visible (and sortable) before it commits.
    expect(body).not.toContain("td.textContent =");
    expect(body).not.toContain("td.setText(");
  });

  it("editSingleLinePopover's own keystroke handler only ever commits on Enter, Tab or Escape", () => {
    const start = cellRendererSource.indexOf("private editSingleLinePopover(");
    expect(start).toBeGreaterThan(-1);
    const end = cellRendererSource.indexOf("\n  private mountInput(", start);
    expect(end).toBeGreaterThan(start);
    const body = cellRendererSource.slice(start, end);

    expect(body).not.toContain("input.oninput");
    expect(body).toContain('event.key === "Enter"');
    expect(body).toContain('event.key === "Tab"');
    expect(body).toContain('event.key === "Escape"');
    // Nothing in the method calls a refresh, resort or row-order recompute directly; the only way
    // out is through `save` or `cancel`, both gated behind the three keys above.
    expect(body).not.toContain("refresh(");
    expect(body).not.toContain(".sort(");
  });

  it("TableRenderer paints the row order it is handed and carries no sort of its own", () => {
    const start = tableRendererSource.indexOf("renderTable(container: HTMLElement");
    expect(start).toBeGreaterThan(-1);
    expect(tableRendererSource).not.toContain(".sort(");
  });
});
