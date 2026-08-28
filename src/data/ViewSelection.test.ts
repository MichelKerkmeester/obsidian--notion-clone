import { describe, expect, it } from "vitest";
import { resolveViewIndex, resolveViewSelection } from "./ViewSelection";

describe("ViewSelection", () => {
  it("prefers a stable view id when indexes have moved", () => {
    expect(resolveViewIndex(["view-b", "view-a"], "view-a", 0)).toBe(1);
  });

  it("falls back to a clamped index when the stable view no longer exists", () => {
    expect(resolveViewIndex(["view-a", "view-b"], "missing", 8)).toBe(1);
    expect(resolveViewSelection([
      { sourcePath: "db.md", viewIds: ["view-a", "view-b"] },
    ], { sourcePath: "db.md", viewId: "missing" }, 0, 1)).toEqual({ databaseIndex: 0, viewIndex: 1 });
  });
});
