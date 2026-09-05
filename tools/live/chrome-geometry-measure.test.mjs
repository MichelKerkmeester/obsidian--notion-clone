// ───────────────────────────────────────────────────────────────────
// MODULE:    chrome-geometry-measure.test
// COMPONENT: the pure verdict unstyled-links.mjs applies to a chrome-geometry reading
// ───────────────────────────────────────────────────────────────────
//
// The reading itself needs a browser; the judgement does not, and it is the half that decides
// whether the gate goes red. Pinning it here means the two thresholds and the overflow guard can be
// changed on purpose rather than by accident, and that a passing reading is provably a passing one
// rather than an empty one.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { judgeChromeGeometry } from "./chrome-geometry-measure.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURES
// ───────────────────────────────────────────────────────────────────

/** A split button that matches the toolbar icon buttons on every axis the report named. */
function healthySplitButton(overrides = {}) {
  return {
    primaryHeight: 28,
    dropdownHeight: 28,
    iconHeight: 28,
    outerRadius: "8px",
    innerRadius: "0px",
    iconRadius: "8px",
    primaryRest: "rgba(0, 0, 0, 0)",
    dropdownRest: "rgba(0, 0, 0, 0)",
    ...overrides,
  };
}

function healthyRuleRow(overrides = {}) {
  return {
    panel: "filter",
    panelWidth: 552,
    propertyWidth: 140,
    operatorWidth: 140,
    valueWidth: 120,
    overflow: 0,
    ...overrides,
  };
}

const reasons = (rows) => rows.map((row) => row.what);

// ───────────────────────────────────────────────────────────────────
// 3. THE SPLIT BUTTON
// ───────────────────────────────────────────────────────────────────

describe("judgeChromeGeometry, split button", () => {
  it("passes a split button that agrees with the icon buttons", () => {
    expect(judgeChromeGeometry({ splitButton: healthySplitButton(), ruleRows: [] })).toEqual([]);
  });

  it("catches the two halves disagreeing, which is the host sizing the one that states no height", () => {
    const rows = judgeChromeGeometry({ splitButton: healthySplitButton({ dropdownHeight: 30 }), ruleRows: [] });
    expect(reasons(rows)).toContain("split-button halves disagree in height");
    expect(rows[0].detail).toContain("dropdown 30px");
  });

  it("allows one pixel of slack between the halves and against the icon buttons", () => {
    const rows = judgeChromeGeometry({
      splitButton: healthySplitButton({ dropdownHeight: 29, iconHeight: 27 }),
      ruleRows: [],
    });
    expect(rows).toEqual([]);
  });

  it("catches the split button standing taller than the row it sits in", () => {
    const rows = judgeChromeGeometry({ splitButton: healthySplitButton({ iconHeight: 24 }), ruleRows: [] });
    expect(reasons(rows)).toContain("the split button does not match the toolbar icon buttons' height");
  });

  it("catches an outer radius that does not match the icon buttons", () => {
    const rows = judgeChromeGeometry({ splitButton: healthySplitButton({ outerRadius: "6px" }), ruleRows: [] });
    expect(reasons(rows)).toContain("the split button's outer radius does not match the toolbar icon buttons'");
  });

  it("catches a rounded inner edge, which splits the pill into two buttons", () => {
    const rows = judgeChromeGeometry({ splitButton: healthySplitButton({ innerRadius: "6px" }), ruleRows: [] });
    expect(reasons(rows)).toContain("the split button's inner edges are rounded");
  });

  it("catches a resting fill on either half, and names which", () => {
    const rows = judgeChromeGeometry({
      splitButton: healthySplitButton({ primaryRest: "rgb(107, 116, 224)", dropdownRest: "rgb(107, 116, 224)" }),
      ruleRows: [],
    });
    expect(reasons(rows)).toEqual([
      "the split button's primary half paints a fill at rest",
      "the split button's dropdown half paints a fill at rest",
    ]);
  });

  it("reads the keyword and the zero-alpha notations as the same transparency", () => {
    const rows = judgeChromeGeometry({
      splitButton: healthySplitButton({ primaryRest: "transparent", dropdownRest: "rgba(0,0,0,0)" }),
      ruleRows: [],
    });
    expect(rows).toEqual([]);
  });

  it("skips a scenario that built no split button rather than inventing a verdict for it", () => {
    expect(judgeChromeGeometry({ splitButton: null, ruleRows: [] })).toEqual([]);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE CONDITION ROWS
// ───────────────────────────────────────────────────────────────────

describe("judgeChromeGeometry, condition rows", () => {
  it("passes a row sitting exactly on its floors with no overflow", () => {
    expect(judgeChromeGeometry({ splitButton: null, ruleRows: [healthyRuleRow()] })).toEqual([]);
  });

  it("catches each crushed control separately and quotes the measurement", () => {
    const rows = judgeChromeGeometry({
      splitButton: null,
      ruleRows: [healthyRuleRow({ panelWidth: 360, propertyWidth: 82, operatorWidth: 110, valueWidth: 17 })],
    });
    expect(reasons(rows)).toEqual([
      "a filter condition row crushed its property control",
      "a filter condition row crushed its operator control",
      "a filter condition row crushed its value control",
    ]);
    expect(rows[2].detail).toBe("17px against a 120px floor, in a 360px panel");
  });

  it("says nothing about a rule whose operator takes no value", () => {
    const rows = judgeChromeGeometry({ splitButton: null, ruleRows: [healthyRuleRow({ valueWidth: null })] });
    expect(rows).toEqual([]);
  });

  it("says nothing about a sort row's absent operator control", () => {
    const rows = judgeChromeGeometry({
      splitButton: null,
      ruleRows: [healthyRuleRow({ panel: "sort", operatorWidth: null, valueWidth: null, propertyWidth: 346 })],
    });
    expect(rows).toEqual([]);
  });

  it("catches floors that hold by overrunning the panel instead of fitting inside it", () => {
    const rows = judgeChromeGeometry({ splitButton: null, ruleRows: [healthyRuleRow({ overflow: 17 })] });
    expect(reasons(rows)).toEqual(["a filter condition row overflows its panel"]);
    expect(rows[0].detail).toBe("17px past a 552px panel");
  });

  it("tolerates a single pixel of overflow as sub-pixel rounding rather than a squeeze", () => {
    expect(judgeChromeGeometry({ splitButton: null, ruleRows: [healthyRuleRow({ overflow: 1 })] })).toEqual([]);
  });
});
