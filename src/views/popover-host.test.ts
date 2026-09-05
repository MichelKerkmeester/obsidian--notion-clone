// ───────────────────────────────────────────────────────────────────
// MODULE:    popover-host.test
// COMPONENT: unit coverage for the picker family's shared search filter,
//            create-affordance ordering, and geometric grid navigation
// ───────────────────────────────────────────────────────────────────
//
// The search-filter oracle is the load-bearing case here: it asserts the
// extracted function still does exactly what the dropdown's own inline
// version did before the extraction — same visible rows, same section
// hiding, same empty row — so the move itself is provably behavior-
// preserving rather than merely "probably fine because it compiles".
//
// The grid-navigation oracle plays the same role for `getGridNavigationTarget`: the colour and icon
// pickers each measured their own grid before this leg, on a fixed-column grid and a variable-column
// one respectively. These cases reproduce both grid shapes against the unified function.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & DOM SHIM
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { filterPickerRows, getGridNavigationTarget, moveCreateOptionsFirst, type PickerSearchRow } from "./popover-host";

class MockElement {
  classes = new Set<string>();
  attributes = new Map<string, string>();
  disabled = false;

  hasClass(name: string): boolean {
    return this.classes.has(name);
  }

  toggleClass(name: string, force: boolean): void {
    if (force) this.classes.add(name);
    else this.classes.delete(name);
  }

  setAttr(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  hasAttribute(name: string): boolean {
    return this.attributes.has(name);
  }

  toggleAttribute(name: string, force: boolean): void {
    if (force) this.attributes.set(name, "true");
    else this.attributes.delete(name);
  }
}

interface Row extends PickerSearchRow {
  row: MockElement & HTMLElement;
  section?: MockElement & HTMLElement;
  value: string;
}

function row(searchText: string, section?: MockElement): Row {
  const el = new MockElement();
  el.setAttr("data-search-text", searchText);
  return { row: el as unknown as MockElement & HTMLElement, section: section as (MockElement & HTMLElement) | undefined, value: searchText };
}

// ───────────────────────────────────────────────────────────────────
// 2. SEARCH FILTER — ORACLE PARITY
// ───────────────────────────────────────────────────────────────────

describe("popover host — search filter", () => {
  it("keeps every row visible and the empty row hidden for a blank query", () => {
    const emptyRow = new MockElement();
    const rows = [row("apple"), row("banana"), row("cherry")];
    const visible = filterPickerRows(rows, "", emptyRow as unknown as HTMLElement);

    expect(visible.length).toBe(3);
    expect(rows.every((r) => !r.row.hasClass("is-hidden"))).toBe(true);
    // The placeholder is hidden precisely because there is no shortage of results to explain.
    expect(emptyRow.hasAttribute("hidden")).toBe(true);
  });

  it("hides non-matching rows and shows the empty row when nothing matches", () => {
    const emptyRow = new MockElement();
    const rows = [row("apple"), row("banana")];
    const visible = filterPickerRows(rows, "zzz", emptyRow as unknown as HTMLElement);

    expect(visible.length).toBe(0);
    expect(rows.every((r) => r.row.hasClass("is-hidden"))).toBe(true);
    expect(emptyRow.hasAttribute("hidden")).toBe(false);
  });

  it("hides a section once every row under it is filtered out, keeps it once one survives", () => {
    const sectionA = new MockElement();
    const sectionB = new MockElement();
    const rows = [
      row("alpha one", sectionA),
      row("alpha two", sectionA),
      row("beta one", sectionB),
    ];
    filterPickerRows(rows, "alpha", undefined);

    expect(sectionA.hasClass("is-hidden")).toBe(false);
    expect(sectionB.hasClass("is-hidden")).toBe(true);
  });

  it("excludes an already-disabled row from the visible set even when it matches", () => {
    const rows = [row("apple")];
    rows[0].row.disabled = true;
    const visible = filterPickerRows(rows, "apple", undefined);
    expect(visible.length).toBe(0);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. CREATE-AFFORDANCE ORDERING
// ───────────────────────────────────────────────────────────────────

describe("popover host — create-affordance ordering", () => {
  it("moves an unsectioned create row from the end to directly after the search, ahead of results", () => {
    const options = [
      { value: "a", preserveValueOnSelect: false },
      { value: "b", preserveValueOnSelect: false },
      { value: "create", preserveValueOnSelect: true },
    ];
    const ordered = moveCreateOptionsFirst(options);
    expect(ordered.map((o) => o.value)).toEqual(["create", "a", "b"]);
  });

  it("leaves a sectioned create row in place, since pulling it forward would split its section", () => {
    const options = [
      { value: "create-a", preserveValueOnSelect: true, section: "A" },
      { value: "a1", section: "A" },
      { value: "create-b", preserveValueOnSelect: true, section: "B" },
      { value: "b1", section: "B" },
    ];
    const ordered = moveCreateOptionsFirst(options);
    expect(ordered.map((o) => o.value)).toEqual(["create-a", "a1", "create-b", "b1"]);
  });

  it("returns the same array reference when nothing needs to move", () => {
    const options = [
      { value: "a", preserveValueOnSelect: false },
      { value: "b", preserveValueOnSelect: false },
    ];
    expect(moveCreateOptionsFirst(options)).toBe(options);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. GEOMETRIC GRID NAVIGATION — ORACLE PARITY
// ───────────────────────────────────────────────────────────────────

/** A grid cell at a fixed screen position — enough for `getBoundingClientRect()`, nothing else. */
function cell(x: number, y: number, size = 20): HTMLElement {
  const rect = { left: x, top: y, right: x + size, bottom: y + size, width: size, height: size, x, y, toJSON: () => ({}) };
  return { getBoundingClientRect: () => rect } as unknown as HTMLElement;
}

describe("popover host — geometric grid navigation", () => {
  it("moves within a row and does not wrap at its edge, on a fixed-column grid (the colour picker's shape)", () => {
    // A 3-column, 2-row grid with a 4px gap between rows — the swatch grid's own layout.
    const items = [
      cell(0, 0), cell(20, 0), cell(40, 0),
      cell(0, 24), cell(20, 24), cell(40, 24),
    ];
    expect(getGridNavigationTarget(items, 0, "ArrowRight")).toBe(1);
    expect(getGridNavigationTarget(items, 2, "ArrowRight")).toBeUndefined();
    expect(getGridNavigationTarget(items, 0, "ArrowLeft")).toBeUndefined();
    expect(getGridNavigationTarget(items, 1, "ArrowDown")).toBe(4);
    expect(getGridNavigationTarget(items, 4, "ArrowUp")).toBe(1);
  });

  it("finds the nearest item by x when rows hold a different number of items (the icon picker's shape)", () => {
    // Row 1 holds four items; row 2 holds two, starting under the row's own first column rather
    // than under the last one — exactly what a search or a category change leaves behind.
    const items = [
      cell(0, 0), cell(20, 0), cell(40, 0), cell(60, 0),
      cell(0, 24), cell(20, 24),
    ];
    // From the last item of the long row, the nearest item below by centre-x is the short row's
    // second item (x 20), not its first (x 0) and not an out-of-bounds index.
    expect(getGridNavigationTarget(items, 3, "ArrowDown")).toBe(5);
    // And back up from there lands on whichever item sits closest by x, not on where it came from —
    // the short row's second item sits directly under the long row's second item (x 20 both).
    expect(getGridNavigationTarget(items, 5, "ArrowUp")).toBe(1);
  });

  it("returns undefined off the grid's edges and for a key it does not handle", () => {
    const items = [cell(0, 0), cell(20, 0)];
    expect(getGridNavigationTarget(items, 0, "ArrowUp")).toBeUndefined();
    expect(getGridNavigationTarget(items, 1, "ArrowDown")).toBeUndefined();
    expect(getGridNavigationTarget(items, 0, "Enter")).toBeUndefined();
    expect(getGridNavigationTarget([], 0, "ArrowRight")).toBeUndefined();
  });
});
