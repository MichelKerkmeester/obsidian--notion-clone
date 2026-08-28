// ───────────────────────────────────────────────────────────────────
// MODULE:    multi-group-display.test
// COMPONENT: Tests for display-field resolution and group-header class/depth logic
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. SETUP
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import { getDisplayGroupFields, getGroupHeaderClassName, getGroupHeaderDepthValue } from "./multi-group-display";
import type { ViewConfig } from "./types";

function config(overrides: Partial<ViewConfig> = {}): ViewConfig {
  return {
    name: "Display proof",
    sourceFolder: "",
    schema: { columns: [], computedFields: [] },
    ...overrides,
  };
}

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("multi-group display", () => {
  it("resolves the configured fields and removes computed leftovers", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(getDisplayGroupFields(
      config({ groupByFields: ["formula.total", "Category"] }),
      { groupByField: "" },
    )).toEqual(["Category"]);
    expect(warn).toHaveBeenCalledTimes(1);

    warn.mockRestore();
  });

  it("falls back to the legacy field when no field list is configured", () => {
    expect(getDisplayGroupFields(config({ groupByField: "Category" }), { groupByField: "" })).toEqual(["Category"]);
  });

  it("preserves the depth-zero header shape and scopes depth styling to nested headers", () => {
    expect(getGroupHeaderClassName(0)).toBe("db-group-header");
    expect(getGroupHeaderDepthValue(0)).toBeUndefined();
    expect(getGroupHeaderClassName(1)).toBe("db-group-header db-group-header--depth-1");
    expect(getGroupHeaderDepthValue(1)).toBe("1");
  });
});
