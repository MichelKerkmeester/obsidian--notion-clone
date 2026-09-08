// ───────────────────────────────────────────────────────────────────
// MODULE:    chart-migration.test
// COMPONENT: what opening an existing chart view does to it, and what it must not do
// ───────────────────────────────────────────────────────────────────
//
// Chart's target equals the unknown-type fallback, so this migration is a plain type-string
// rewrite with nothing to carry — the same shape `list-migration.test.ts` already proves for
// list. What is worth testing is exactly that: every chart-only field survives untouched, and
// every non-chart view plans nothing.

// ───────────────────────────────────────────────────────────────────
// 1. THE FIXTURE
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { applyChartMigration, planChartMigration } from "./chart-migration";
import type { ViewConfig } from "./types";

const chart = (extra: Partial<ViewConfig> = {}): ViewConfig => ({
  id: "v1",
  name: "Budget by Status",
  viewType: "chart",
  chartAggregation: "sum",
  ...extra,
} as ViewConfig);

// ───────────────────────────────────────────────────────────────────
// 2. WHAT MIGRATES
// ───────────────────────────────────────────────────────────────────

describe("an existing chart becomes a table", () => {
  it("plans the move", () => {
    const plan = planChartMigration(chart());
    expect(plan).toEqual({ from: "chart", to: "table" });
  });

  it("applies once and reports that it did", () => {
    const view = chart();
    const plan = planChartMigration(view)!;
    expect(applyChartMigration(view, plan)).toBe(true);
    expect(view.viewType).toBe("table");
  });

  it("refuses to apply a second time, so a re-render cannot re-migrate", () => {
    const view = chart();
    const plan = planChartMigration(view)!;
    applyChartMigration(view, plan);
    expect(applyChartMigration(view, plan)).toBe(false);
    expect(view.viewType).toBe("table");
  });

  it("plans nothing for every view that is not a chart", () => {
    for (const viewType of ["table", "board", "gallery", "list", "calendar", "timeline"] as const) {
      expect(planChartMigration({ ...chart(), viewType } as ViewConfig)).toBeNull();
    }
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. WHAT IS LEFT ALONE, WHICH IS WHAT MAKES IT REVERSIBLE
// ───────────────────────────────────────────────────────────────────

describe("the migration leaves the way back intact", () => {
  it("keeps the chart's own fields on the view, undeleted", () => {
    const view = chart({ chartAggregation: "sum", chartValueAxisMin: 0 } as Partial<ViewConfig>);
    applyChartMigration(view, planChartMigration(view)!);
    expect((view as { chartAggregation?: string }).chartAggregation).toBe("sum");
    expect((view as { chartValueAxisMin?: number }).chartValueAxisMin).toBe(0);
  });
});
