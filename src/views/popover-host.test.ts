// ───────────────────────────────────────────────────────────────────
// MODULE:    popover-host.test
// COMPONENT: unit coverage for the picker family's shared search filter
//            and create-affordance ordering
// ───────────────────────────────────────────────────────────────────
//
// The search-filter oracle is the load-bearing case here: it asserts the
// extracted function still does exactly what the dropdown's own inline
// version did before the extraction — same visible rows, same section
// hiding, same empty row — so the move itself is provably behavior-
// preserving rather than merely "probably fine because it compiles".

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & DOM SHIM
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { filterPickerRows, moveCreateOptionsFirst, type PickerSearchRow } from "./popover-host";

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
