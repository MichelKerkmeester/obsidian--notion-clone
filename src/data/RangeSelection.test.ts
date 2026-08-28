import { describe, expect, it } from "vitest";
import { getSelectionState } from "./RangeSelection";

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
