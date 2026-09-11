// ───────────────────────────────────────────────────────────────────
// MODULE:    filter-parity-clauses.test
// COMPONENT: the verdict the six filter-sheet presentation numbers carry
// ───────────────────────────────────────────────────────────────────
//
// The measurement itself runs inside the grammar lane, against the mounted
// sheet, because the numbers only mean something next to the markup they came
// from. What this file pins is the decision on top of them: which measured
// numbers are allowed to read as conforming — five ceilings, and one presence
// where zero is the failure rather than the target.

import { describe, expect, it } from "vitest";
import {
  FILTER_PARITY_TARGET,
  filterClauseFailures,
  formatFilterClause,
} from "./filter-parity-clauses.mjs";

// ───────────────────────────────────────────────────────────────────
// 1. FIXTURES
// ───────────────────────────────────────────────────────────────────

/** A measured sheet: five ceilings and the one presence, given per rule. */
function measured({ L1 = [0], L2 = [1], L3 = [1], L4 = [0], L5 = [0], L6 = [0] } = {}) {
  const summarise = (values) => ({
    perLeaf: values,
    max: values.length ? Math.max(...values) : 0,
    min: values.length ? Math.min(...values) : 0,
    total: values.reduce((sum, value) => sum + value, 0),
  });
  return { rules: L2.length, marked: true, clauses: { L1: summarise(L1), L2: summarise(L2), L3: summarise(L3), L4: summarise(L4), L5: summarise(L5), L6: summarise(L6) } };
}

// ───────────────────────────────────────────────────────────────────
// 2. THE VERDICT
// ───────────────────────────────────────────────────────────────────

describe("filter sheet presentation verdict", () => {
  it("accepts a sheet that shows one summary row, one detail group and grouped actions", () => {
    expect(filterClauseFailures(measured())).toEqual([]);
  });

  it("fails the three stacked condition rows the sheet shipped before the detail group", () => {
    const failures = filterClauseFailures(measured({ L2: [3, 3, 3], L3: [0, 0, 0], L5: [1, 1, 1], L6: [3, 3, 3] }));
    expect(failures.map((failure) => failure.slice(0, 2))).toEqual(["L2", "L3", "L5", "L6"]);
  });

  it("treats a missing detail group as the failure and an extra one as well", () => {
    expect(filterClauseFailures(measured({ L3: [1, 0, 1] }))).toHaveLength(1);
    expect(filterClauseFailures(measured({ L3: [1, 2, 1] }))).toEqual([]);
  });

  it("fails a rule edited across three controls at once, an unlabelled nested icon and a stray action row", () => {
    const failures = filterClauseFailures(measured({ L1: [1], L4: [2], L6: [1] }));
    expect(failures.map((failure) => failure.slice(0, 2))).toEqual(["L1", "L4", "L6"]);
  });

  it("names the measured number and the shape it came from", () => {
    const [failure] = filterClauseFailures(measured({ L2: [3] }));
    expect(failure).toContain("L2=3");
    expect(failure).toContain("stacked per rule");
  });

  it("keeps the target in one place, so a lane never restates a number", () => {
    expect(FILTER_PARITY_TARGET).toEqual({ L1: 0, L2: 1, L3: 1, L4: 0, L5: 0, L6: 0 });
    expect(formatFilterClause(measured({ L2: [3, 3] }), "L2")).toContain("perRule=[3,3]");
  });
});
