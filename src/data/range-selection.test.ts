// ───────────────────────────────────────────────────────────────────
// MODULE:    range-selection.test
// COMPONENT: regression suite for checkbox-column selection state
// ───────────────────────────────────────────────────────────────────
//
// Pins that an empty group ("no rows visible") reports checked: false rather
// than vacuously true, and that a partial selection reports indeterminate
// instead of checked — both are easy off-by-one traps for the header
// checkbox's tri-state.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { getSelectionState } from "./range-selection";

describe("getSelectionState", () => {
  it("reports the all-selected state", () => {
    expect(getSelectionState(["a", "b"], new Set(["a", "b"]))).toEqual({
      checked: true,
      indeterminate: false,
    });
  });

  it("reports a partial selection without treating an empty group as checked", () => {
    expect(getSelectionState(["a", "b"], new Set(["a"]))).toEqual({
      checked: false,
      indeterminate: true,
    });
    expect(getSelectionState([], new Set())).toEqual({
      checked: false,
      indeterminate: false,
    });
  });
});
