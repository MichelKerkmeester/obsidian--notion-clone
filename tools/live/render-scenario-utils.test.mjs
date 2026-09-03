// ───────────────────────────────────────────────────────────────────
// MODULE:    render-scenario-utils.test
// COMPONENT: the two pure helpers the render-assertions runner uses
// ───────────────────────────────────────────────────────────────────
//
// The runner's printed label and its coverage count are the two numbers a reader
// of the lane output uses to distinguish scenarios from renderer implementations.
// Both are pure functions of the scenario list, so both are tested here rather
// than only inside the browser run.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { countConstructed, scenarioLabel } from "./render-scenario-utils.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. SCENARIO LABELS
// ───────────────────────────────────────────────────────────────────

describe("scenarioLabel", () => {
  it("prints the scale for a calendar scenario so week and day are distinct from month", () => {
    expect(scenarioLabel({ renderer: "calendar", bag: "file-view", scale: "week" }))
      .toBe("calendar:week/file-view");
    expect(scenarioLabel({ renderer: "calendar", bag: "embed", scale: "day" }))
      .toBe("calendar:day/embed");
  });

  it("prints renderer/bag for a non-calendar scenario", () => {
    expect(scenarioLabel({ renderer: "chart", bag: "file-view" })).toBe("chart/file-view");
    expect(scenarioLabel({ renderer: "list", bag: "embed" })).toBe("list/embed");
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. COVERAGE COUNT
// ───────────────────────────────────────────────────────────────────

describe("countConstructed", () => {
  it("counts a renderer once across its bags and calendar scales", () => {
    const scenarios = [
      { renderer: "calendar", bag: "file-view" },
      { renderer: "calendar", bag: "embed" },
      { renderer: "calendar", bag: "file-view", scale: "week" },
      { renderer: "calendar", bag: "file-view", scale: "day" },
    ];
    expect(countConstructed(scenarios)).toBe(1);
  });

  it("counts each distinct renderer once", () => {
    const scenarios = [
      { renderer: "list", bag: "file-view" },
      { renderer: "list", bag: "embed" },
      { renderer: "chart", bag: "file-view" },
    ];
    expect(countConstructed(scenarios)).toBe(2);
  });

  it("counts an empty scenario list as zero", () => {
    expect(countConstructed([])).toBe(0);
  });
});
