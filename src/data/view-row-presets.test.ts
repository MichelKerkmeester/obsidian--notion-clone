// ───────────────────────────────────────────────────────────────────
// MODULE:    view-row-presets.test
// COMPONENT: creation-path defaults skip missing columns and stay undefined when empty
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { applyViewRowPresets, writablePresetColumns } from "./view-row-presets";
import type { RecordSchema } from "./types";

const schema: RecordSchema = {
  columns: [
    { key: "file.name", label: "Name", type: "text" },
    { key: "status", label: "Status", type: "select" },
    { key: "cost", label: "Cost", type: "number" },
    { key: "score", label: "Score", type: "computed" },
  ],
  computedFields: [],
};

// ───────────────────────────────────────────────────────────────────
// 2. CREATION PATH
// ───────────────────────────────────────────────────────────────────

describe("view row presets", () => {
  it("applies stored values and skips keys the schema no longer has", () => {
    expect(applyViewRowPresets({ status: "Open", gone: "x", cost: "" }, schema)).toEqual({
      status: "Open",
    });
  });

  it("returns undefined when nothing would be applied so creation stays identical", () => {
    expect(applyViewRowPresets(undefined, schema)).toBeUndefined();
    expect(applyViewRowPresets({}, schema)).toBeUndefined();
    expect(applyViewRowPresets({ gone: "x" }, schema)).toBeUndefined();
  });

  it("omits file name and computed columns from the settings list", () => {
    expect(writablePresetColumns(schema).map((column) => column.key)).toEqual(["status", "cost"]);
  });
});
