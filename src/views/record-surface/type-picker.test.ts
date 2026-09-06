// ───────────────────────────────────────────────────────────────────
// MODULE:    type-picker.test
// COMPONENT: the one property-format list, its icons and its disabled-not-omitted gating
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import {
  buildTypePickerOptions, conflictWriterGate, PROPERTY_TYPES, rollupNeedsRelationGate,
} from "./type-picker";
import { COLUMN_TYPE_LABELS, isColumnType } from "../../data/column-types";
import { PROPERTY_TYPE_ICON_NAMES } from "../property-type-icon";

// ───────────────────────────────────────────────────────────────────
// 2. CASES — THE ONE LIST
// ───────────────────────────────────────────────────────────────────

describe("PROPERTY_TYPES", () => {
  it("is the twenty-one formats the four registries agree on, grouped Basic/Options/Advanced", () => {
    expect(PROPERTY_TYPES).toEqual([
      "text", "number", "date", "datetime", "currency", "checkbox",
      "url", "email", "phone", "person",
      "select", "multi-select", "status",
      "computed", "relation", "rollup", "files",
      "created-time", "created-by", "last-edited-time", "last-edited-by",
    ]);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. CASES — OPTIONS AND ICONS
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 2a. CASES — THE FOUR REGISTRIES AGREE
// ───────────────────────────────────────────────────────────────────

describe("the four type registries", () => {
  it("carry the same twenty-one members as PROPERTY_TYPES, the union included", () => {
    const wanted = [...PROPERTY_TYPES].sort();
    expect(wanted).toHaveLength(21);
    expect(Object.keys(PROPERTY_TYPE_ICON_NAMES).sort()).toEqual(wanted);
    expect(Object.keys(COLUMN_TYPE_LABELS()).sort()).toEqual(wanted);
    // isColumnType restates the ColumnDef["type"] union member-for-member, so this goes red the
    // moment a type is added to one but not the other — a value-level guard a bare TypeScript
    // check cannot stand in for.
    for (const type of PROPERTY_TYPES) expect(isColumnType(type)).toBe(true);
    expect(isColumnType("not-a-real-type")).toBe(false);
  });
});

describe("buildTypePickerOptions", () => {
  it("returns one option per format, each carrying a property: icon and no disabled flag by default", () => {
    const options = buildTypePickerOptions();
    expect(options).toHaveLength(21);
    expect(options.map((option) => option.value)).toEqual(PROPERTY_TYPES);
    for (const option of options) {
      expect(option.icon).toBe(`property:${option.value}`);
      expect(option.disabled).toBeUndefined();
    }
  });

  it("never omits a format — the census threshold this replaces a filtered subset with", () => {
    const options = buildTypePickerOptions(() => ({ disabled: true, reason: "unavailable" }));
    expect(options).toHaveLength(21);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. CASES — GATING
// ───────────────────────────────────────────────────────────────────

describe("rollupNeedsRelationGate", () => {
  it("disables rollup, with its reason, when the schema has no relation column yet", () => {
    const options = buildTypePickerOptions(rollupNeedsRelationGate(false, "Add a relation first"));
    const rollup = options.find((option) => option.value === "rollup")!;
    expect(rollup.disabled).toBe(true);
    expect(rollup.disabledReason).toBe("Add a relation first");
    const text = options.find((option) => option.value === "text")!;
    expect(text.disabled).toBeUndefined();
  });

  it("leaves rollup selectable once a relation column exists", () => {
    const options = buildTypePickerOptions(rollupNeedsRelationGate(true, "Add a relation first"));
    expect(options.find((option) => option.value === "rollup")!.disabled).toBeUndefined();
  });
});

describe("conflictWriterGate", () => {
  const reasons = {
    notAWriterTarget: "Not available for a frontmatter property",
    computedOnlyPlainTypes: "A computed field can only resolve to a plain type",
  };

  it("disables computed/relation/rollup/files for a normal column writer, with a shared reason", () => {
    const options = buildTypePickerOptions(conflictWriterGate("column", reasons));
    for (const value of ["computed", "relation", "rollup", "files"] as const) {
      const option = options.find((candidate) => candidate.value === value)!;
      expect(option.disabled).toBe(true);
      expect(option.disabledReason).toBe(reasons.notAWriterTarget);
    }
    for (const value of ["text", "number", "date", "datetime", "currency", "select", "multi-select", "status", "checkbox"] as const) {
      expect(options.find((candidate) => candidate.value === value)!.disabled).toBeUndefined();
    }
  });

  it("narrows a computed writer to its five plain types, disabling every option-and-relation format", () => {
    const options = buildTypePickerOptions(conflictWriterGate("computed", reasons));
    for (const value of ["text", "number", "date", "datetime", "checkbox"] as const) {
      expect(options.find((candidate) => candidate.value === value)!.disabled).toBeUndefined();
    }
    for (const value of ["currency", "select", "multi-select", "status", "computed", "relation", "rollup", "files"] as const) {
      const option = options.find((candidate) => candidate.value === value)!;
      expect(option.disabled).toBe(true);
    }
  });
});
