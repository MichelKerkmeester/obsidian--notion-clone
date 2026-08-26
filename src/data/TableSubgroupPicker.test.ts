import { describe, expect, it } from "vitest";
import {
  getTableSubgroupCandidates,
  getTableSubgroupField,
  resolveTableSubgroupField,
} from "./TableSubgroupPicker";
import type { ViewConfig } from "./types";

function config(overrides: Partial<ViewConfig> = {}): ViewConfig {
  return {
    name: "Table subgroup test",
    sourceFolder: "",
    schema: {
      columns: [
        { key: "file.name", label: "Name", type: "text" },
        { key: "category", label: "Category", type: "select" },
        { key: "type", label: "Type", type: "text" },
        { key: "formula.total", label: "Formula", type: "computed" },
        { key: "rollup.total", label: "Rollup", type: "rollup" },
      ],
      computedFields: [],
    },
    ...overrides,
  };
}

describe("table subgroup picker", () => {
  it("excludes the file name, primary field, and computed columns", () => {
    const candidates = getTableSubgroupCandidates(config(), "category");

    expect(candidates.map((column) => column.key)).toEqual(["type"]);
  });

  it("reads only the single subgroup slot and validates requested fields", () => {
    const view = config({ groupByFields: ["category", "type", "extra"] });

    expect(getTableSubgroupField(view)).toBe("type");
    expect(resolveTableSubgroupField(view, "category", "type")).toBe("type");
    expect(resolveTableSubgroupField(view, "category", "category")).toBeUndefined();
    expect(resolveTableSubgroupField(view, "category", "formula.total")).toBeUndefined();
  });
});
