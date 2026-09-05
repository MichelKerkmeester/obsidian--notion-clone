// ───────────────────────────────────────────────────────────────────
// MODULE:    type-picker.test
// COMPONENT: P7's one type list, its icons and its disabled-not-omitted gating
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import {
  buildTypePickerOptions, conflictWriterGate, PROPERTY_TYPES, rollupNeedsRelationGate,
} from "./type-picker";

// ───────────────────────────────────────────────────────────────────
// 2. CASES — THE ONE LIST
// ───────────────────────────────────────────────────────────────────

describe("PROPERTY_TYPES", () => {
  it("is the thirteen formats every site declared separately before this", () => {
    expect(PROPERTY_TYPES).toEqual([
      "text", "number", "date", "datetime", "currency", "checkbox",
      "select", "multi-select", "status",
      "computed", "relation", "rollup", "files",
    ]);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. CASES — OPTIONS AND ICONS
// ───────────────────────────────────────────────────────────────────

describe("buildTypePickerOptions", () => {
  it("returns one option per format, each carrying a property: icon and no disabled flag by default", () => {
    const options = buildTypePickerOptions();
    expect(options).toHaveLength(13);
    expect(options.map((option) => option.value)).toEqual(PROPERTY_TYPES);
    for (const option of options) {
      expect(option.icon).toBe(`property:${option.value}`);
      expect(option.disabled).toBeUndefined();
    }
  });

  it("never omits a format — the census threshold this replaces a filtered subset with", () => {
    const options = buildTypePickerOptions(() => ({ disabled: true, reason: "unavailable" }));
    expect(options).toHaveLength(13);
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
