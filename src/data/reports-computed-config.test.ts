// ───────────────────────────────────────────────────────────────────
// MODULE:    reports-computed-config.test
// COMPONENT: regression suite for the Reports Remaining/Saved computed-field writer
// ───────────────────────────────────────────────────────────────────
//
// Pins that applying the config never mutates the input DatabaseConfig
// (`before` snapshot equality), that Saved is only written when a Sales
// rollup is supplied (and cleanly removed, including its column, when it
// isn't), and that an inspect record from another database is rejected
// rather than silently applied to the wrong config.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { inspectReportsConfig } from "./reports-inspector";
import { applyReportsComputedConfig, autoDetectReportsFields } from "./reports-computed-config";
import type { ColumnDef, ComputedFieldDef, DatabaseConfig, RollupConfig } from "./types";

function createConfig(includeSaved = false): DatabaseConfig {
  const columns: ColumnDef[] = [
    {
      key: "gross_income",
      label: "Monthly income",
      type: "rollup",
      rollupConfig: { relationField: "month", targetField: "amount", aggregation: "sum" },
    },
    {
      key: "operating_costs",
      label: "Operating costs",
      type: "rollup",
      rollupConfig: { relationField: "month", targetField: "amount", aggregation: "sum" },
    },
    { key: "month", label: "Month", type: "text" },
  ];
  const computedFields: ComputedFieldDef[] = [{
    key: "existing_formula",
    label: "Existing formula",
    expression: "1 + 1",
    type: "number",
  }];
  if (includeSaved) {
    columns.push({ key: "saved", label: "Old Saved", type: "text" });
    computedFields.push({ key: "saved", label: "Old Saved", expression: "old", type: "text" });
  }
  const schema = { columns, computedFields };
  return {
    id: "reports-db",
    name: "Reports",
    sourceFolder: "Finance",
    computedSyncMode: "display-only",
    schema,
    views: [{
      id: "table-view",
      name: "Table",
      sourceFolder: "Finance",
      schema,
      columnOrder: includeSaved
        ? ["operating_costs", "month", "gross_income", "saved"]
        : ["operating_costs", "month", "gross_income"],
      hiddenColumns: includeSaved ? ["saved", "internal"] : ["internal"],
    }],
  };
}

describe("ReportsComputedConfig", () => {
  it("adds null-guarded Remaining as a display-only config", () => {
    const config = createConfig();
    const record = inspectReportsConfig(config, "Finance/Reports.md", "outflow");
    const before = JSON.stringify(config);

    const result = applyReportsComputedConfig(config, record, {
      income: "Monthly income",
      expenses: { key: "operating_costs", label: "Operating costs" },
    });

    expect(result.config.computedSyncMode).toBe("display-only");
    expect(result.lock.remaining).toBe(
      "IF(OR([Monthly income] == null, [Operating costs] == null), null, [Monthly income] - [Operating costs])",
    );
    expect(result.lock.saved).toBeNull();
    expect(result.config.schema.computedFields).toEqual([
      {
        key: "existing_formula",
        label: "Existing formula",
        expression: "1 + 1",
        type: "number",
      },
      {
        key: "remaining",
        label: "Remaining",
        expression: "IF(OR([Monthly income] == null, [Operating costs] == null), null, [Monthly income] - [Operating costs])",
        type: "number",
      },
    ]);
    expect(result.config.schema.columns.find((column) => column.key === "remaining")).toMatchObject({
      key: "remaining",
      label: "Remaining",
      type: "computed",
      computedKey: "remaining",
    });
    expect(result.config.views[0].columnOrder).toEqual([
      "gross_income",
      "operating_costs",
      "remaining",
      "month",
    ]);
    expect(result.config.views[0].hiddenColumns).toEqual(["internal"]);
    expect(result.config.views[0].schema).toBe(result.config.schema);
    expect(JSON.stringify(config)).toBe(before);
  });

  it("ships Saved only for a Sales outflow and removes stale duplicate config when skipped", () => {
    const config = createConfig(true);
    const record = inspectReportsConfig(config, "Finance/Reports.md", "income-side");

    const result = applyReportsComputedConfig(config, record, {
      income: "gross_income",
      expenses: "operating_costs",
    });

    expect(result.lock.saved).toBeNull();
    expect(result.lock.savedSkipReason).toBe("sales-income-side");
    expect(result.config.schema.computedFields.some((field) => field.key === "saved")).toBe(false);
    expect(result.config.schema.columns.some((column) => column.key === "saved")).toBe(false);
    expect(result.config.views[0].columnOrder).toEqual([
      "gross_income",
      "operating_costs",
      "remaining",
      "month",
    ]);
    expect(result.config.views[0].hiddenColumns).toEqual(["internal"]);
  });

  it("writes the distinct Saved formula and preserves unrelated fields", () => {
    const config = createConfig();
    config.schema.columns.push({
      key: "sales_outflow",
      label: "Sales outflow",
      type: "rollup",
      rollupConfig: { relationField: "month", targetField: "amount", aggregation: "sum" },
    });
    const record = inspectReportsConfig(config, "Finance/Reports.md", "outflow");

    const result = applyReportsComputedConfig(config, record, {
      income: "gross_income",
      expenses: "operating_costs",
      sales: "Sales outflow",
    });

    expect(result.lock.saved).toBe(
      "IF(OR([gross_income] == null, [operating_costs] == null, [Sales outflow] == null), null, [gross_income] - [operating_costs] - [Sales outflow])",
    );
    expect(result.config.schema.computedFields).toContainEqual({
      key: "saved",
      label: "Saved",
      expression: result.lock.saved,
      type: "number",
    });
    expect(result.config.schema.columns.find((column) => column.key === "saved")).toMatchObject({
      key: "saved",
      label: "Saved",
      type: "computed",
      computedKey: "saved",
    });
    expect(result.config.schema.columns.some((column) => column.key === "month")).toBe(true);
    expect(result.config.views[0].columnOrder).toEqual([
      "gross_income",
      "operating_costs",
      "remaining",
      "saved",
      "month",
      "sales_outflow",
    ]);
  });

  it("fails closed for an inspect record from another database", () => {
    const config = createConfig();
    const record = inspectReportsConfig({ ...config, id: "other-db" }, "Other.md", "outflow");

    expect(() => applyReportsComputedConfig(config, record, {
      income: "gross_income",
      expenses: "operating_costs",
    })).toThrow("other-db");
  });
});

/** Builds a minimal Reports-shaped config with configurable rollup labels/aggregations,
 *  for exercising the "Configure Reports computed fields" command's auto-detection. */
function createLabeledConfig(
  rollups: Array<{ key: string; label: string; aggregation: RollupConfig["aggregation"] }>,
): DatabaseConfig {
  const columns: ColumnDef[] = rollups.map((rollup) => ({
    key: rollup.key,
    label: rollup.label,
    type: "rollup",
    rollupConfig: { relationField: "month", targetField: "amount", aggregation: rollup.aggregation },
  }));
  const schema = { columns, computedFields: [] };
  return {
    id: "reports-db",
    name: "Reports",
    sourceFolder: "Finance",
    computedSyncMode: "display-only",
    schema,
    views: [{ id: "table-view", name: "Table", sourceFolder: "Finance", schema, columnOrder: [], hiddenColumns: [] }],
  };
}

describe("autoDetectReportsFields", () => {
  it("finds Income and Expenses SUM rollups by exact label", () => {
    const config = createLabeledConfig([
      { key: "col_income", label: "Income", aggregation: "sum" },
      { key: "col_expenses", label: "Expenses", aggregation: "sum" },
    ]);
    const record = inspectReportsConfig(config, "Finance/Reports.md");

    const detected = autoDetectReportsFields(record);

    expect(detected).not.toBeNull();
    expect(detected?.income.key).toBe("col_income");
    expect(detected?.expenses.key).toBe("col_expenses");
  });

  it("matches labels case-insensitively", () => {
    const config = createLabeledConfig([
      { key: "col_income", label: "income", aggregation: "sum" },
      { key: "col_expenses", label: "EXPENSES", aggregation: "sum" },
    ]);
    const record = inspectReportsConfig(config, "Finance/Reports.md");

    expect(autoDetectReportsFields(record)).not.toBeNull();
  });

  it("returns null when Expenses is missing", () => {
    const config = createLabeledConfig([{ key: "col_income", label: "Income", aggregation: "sum" }]);
    const record = inspectReportsConfig(config, "Finance/Reports.md");

    expect(autoDetectReportsFields(record)).toBeNull();
  });

  it("returns null when a matching label is not a SUM rollup", () => {
    const config = createLabeledConfig([
      { key: "col_income", label: "Income", aggregation: "avg" },
      { key: "col_expenses", label: "Expenses", aggregation: "sum" },
    ]);
    const record = inspectReportsConfig(config, "Finance/Reports.md");

    expect(autoDetectReportsFields(record)).toBeNull();
  });

  it("returns null when there are no rollup columns at all", () => {
    const config = createLabeledConfig([]);
    const record = inspectReportsConfig(config, "Finance/Reports.md");

    expect(autoDetectReportsFields(record)).toBeNull();
  });
});
