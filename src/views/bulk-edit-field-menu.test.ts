// ───────────────────────────────────────────────────────────────────
// MODULE:    bulk-edit-field-menu.test
// COMPONENT: the never-empty floor on the property-first bulk edit picker
// ───────────────────────────────────────────────────────────────────
//
// openBulkEditFieldMenu used to map getBulkEditableColumns(...) straight into the dropdown's
// option list with no floor, so a column set with nothing bulk-editable opened an empty dropdown.
// This mocks the shared dropdown host so the assertion reads the exact option list the picker
// builds, rather than reimplementing dropdown-field.ts's own rendering.

// ───────────────────────────────────────────────────────────────────
// 1. MOCKS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import type { ColumnDef } from "../data/types";

const { openDropdownMenu } = vi.hoisted(() => ({ openDropdownMenu: vi.fn((_options: unknown) => () => undefined) }));

vi.mock("./dropdown-field", () => ({ openDropdownMenu }));
vi.mock("../i18n", () => ({
  t: (key: string) => key,
}));

import { openBulkEditFieldMenu } from "./bulk-edit-field-menu";

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("openBulkEditFieldMenu", () => {
  const anchor = {} as HTMLElement;

  it("renders the shared no-actions row when nothing in the column set is bulk-editable", () => {
    const columns: ColumnDef[] = [
      { key: "file.name", label: "Name", type: "text" },
      { key: "total", label: "Total", type: "computed" },
      { key: "rollupCount", label: "Count", type: "rollup" },
    ];

    openBulkEditFieldMenu({ anchor, columns, computedFields: [], onSelect: vi.fn() });

    expect(openDropdownMenu).toHaveBeenCalledTimes(1);
    const call = openDropdownMenu.mock.calls.at(-1)?.[0] as unknown as { options: unknown[]; searchable: boolean };
    expect(call.options).toEqual([{ value: "", text: "menu.noActions", disabled: true }]);
    expect(call.searchable).toBe(false);
  });

  it("lists the bulk-editable columns unchanged when at least one exists", () => {
    const columns: ColumnDef[] = [
      { key: "file.name", label: "Name", type: "text" },
      { key: "status", label: "Status", type: "status" },
    ];

    openBulkEditFieldMenu({ anchor, columns, computedFields: [], onSelect: vi.fn() });

    const call = openDropdownMenu.mock.calls.at(-1)?.[0] as unknown as {
      options: { value: string; text: string; disabled?: boolean }[];
      searchable: boolean;
    };
    expect(call.options).toHaveLength(1);
    expect(call.options[0]).toMatchObject({ value: "status", text: "Status" });
    expect(call.options[0].disabled).toBeUndefined();
    expect(call.searchable).toBe(true);
  });
});
