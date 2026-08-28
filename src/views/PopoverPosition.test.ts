import { describe, expect, it } from "vitest";
import { resolvePopoverHorizontalLeft } from "./PopoverPosition";

describe("resolvePopoverHorizontalLeft", () => {
  const bounds = { left: 0, right: 400 };

  it("opens to the preferred side when there is room", () => {
    expect(resolvePopoverHorizontalLeft({ left: 100, right: 140, width: 40 }, bounds, 120, 8, 8, "right", "right")).toBe(148);
  });

  it("flips to the opposite side when the preferred side is clipped", () => {
    expect(resolvePopoverHorizontalLeft({ left: 350, right: 390, width: 40 }, bounds, 120, 8, 8, "right", "right")).toBe(222);
  });

  it("keeps the aligned position inside the viewport when neither side fits", () => {
    expect(resolvePopoverHorizontalLeft({ left: 180, right: 220, width: 420 }, bounds, 420, 8, 8, "center")).toBe(8);
  });
});
