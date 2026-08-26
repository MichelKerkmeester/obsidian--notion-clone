import { describe, expect, it } from "vitest";
import {
  findInspectedRollup,
  inspectReportsConfig,
  lockReportsExpressions,
} from "./ReportsInspector";
import type { ColumnDef, DatabaseConfig } from "./types";

function createConfig(): DatabaseConfig {
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
    {
      key: "sales_outflow",
      label: "Sales outflow",
      type: "rollup",
      rollupConfig: { relationField: "month", targetField: "amount", aggregation: "sum" },
    },
  ];
  const computedFields = [{
    key: "existing_formula",
    label: "Existing formula",
    expression: "1 + 1",
    type: "number" as const,
  }];
  return {
    id: "reports-db",
    name: "Reports",
    sourceFolder: "Finance",
    computedSyncMode: "display-only",
    schema: { columns, computedFields },
    views: [{
      id: "table-view",
      name: "Table",
      sourceFolder: "Finance",
      schema: { columns, computedFields },
      columnOrder: ["gross_income", "operating_costs", "sales_outflow"],
      hiddenColumns: ["internal"],
    }],
  };
}

describe("ReportsInspector", () => {
  it("captures the parsed payload and live SUM rollup metadata without mutation", () => {
    const config = createConfig();
    const before = JSON.stringify(config);

    const record = inspectReportsConfig(config, "Finance/Reports.md", "outflow");

    expect(record.notePath).toBe("Finance/Reports.md");
    expect(record.databaseId).toBe("reports-db");
    expect(record.databaseName).toBe("Reports");
    expect(record.computedSyncMode).toBe("display-only");
    expect(record.columns).toEqual(config.schema.columns);
    expect(record.computedFields).toEqual(config.schema.computedFields);
    expect(record.views).toEqual([{
      id: "table-view",
      name: "Table",
      columnOrder: ["gross_income", "operating_costs", "sales_outflow"],
      hiddenColumns: ["internal"],
    }]);
    expect(record.rollupColumns).toEqual([
      {
        key: "gross_income",
        label: "Monthly income",
        aggregation: "sum",
        relationField: "month",
        targetField: "amount",
      },
      {
        key: "operating_costs",
        label: "Operating costs",
        aggregation: "sum",
        relationField: "month",
        targetField: "amount",
      },
      {
        key: "sales_outflow",
        label: "Sales outflow",
        aggregation: "sum",
        relationField: "month",
        targetField: "amount",
      },
    ]);
    expect(record.sumRollupKeys).toEqual(["gross_income", "operating_costs", "sales_outflow"]);
    expect(record.hasSumAggregation).toBe(true);
    expect(record.allRollupsUseSum).toBe(true);
    expect(record.salesMeaning).toBe("outflow");
    expect(findInspectedRollup(record, "Monthly income")?.key).toBe("gross_income");
    expect(findInspectedRollup(record, "operating_costs")?.label).toBe("Operating costs");
    expect(JSON.stringify(config)).toBe(before);
  });

  it("locks null-guarded expressions using the inspected labels and keys", () => {
    const record = inspectReportsConfig(createConfig(), "Reports.md", "outflow");

    const lock = lockReportsExpressions(record, {
      income: "Monthly income",
      expenses: { key: "operating_costs", label: "Operating costs" },
      sales: "sales_outflow",
    });

    expect(lock.remaining).toBe(
      "IF(OR([Monthly income] == null, [Operating costs] == null), null, [Monthly income] - [Operating costs])",
    );
    expect(lock.saved).toBe(
      "IF(OR([Monthly income] == null, [Operating costs] == null, [sales_outflow] == null), null, [Monthly income] - [Operating costs] - [sales_outflow])",
    );
    expect(lock.blankVsZero).toBe("null-guard");
    expect(lock.salesMeaning).toBe("outflow");
    expect(lock.computedSyncMode).toBe("display-only");
    expect(lock.remaining).not.toContain("IFERROR");
    expect(lock.saved).not.toContain("IFERROR");
  });

  it("supports the explicit bare-subtraction zero mode", () => {
    const record = inspectReportsConfig(createConfig(), "Reports.md", "outflow");

    const lock = lockReportsExpressions(record, {
      income: "gross_income",
      expenses: "operating_costs",
      sales: "sales_outflow",
      blankVsZero: "bare-subtraction",
    });

    expect(lock.remaining).toBe("[gross_income] - [operating_costs]");
    expect(lock.saved).toBe("[gross_income] - [operating_costs] - [sales_outflow]");
    expect(lock.blankVsZero).toBe("bare-subtraction");
  });

  it("skips duplicate Saved unless the operator explicitly allows it", () => {
    const record = inspectReportsConfig(createConfig(), "Reports.md", "income-side");
    const options = { income: "gross_income", expenses: "operating_costs" };

    const skipped = lockReportsExpressions(record, options);
    expect(skipped.saved).toBeNull();
    expect(skipped.savedSkipReason).toBe("sales-income-side");

    const deliberate = lockReportsExpressions(record, { ...options, allowDuplicateSaved: true });
    expect(deliberate.saved).toBe(deliberate.remaining);
    expect(deliberate.savedSkipReason).toBeUndefined();
  });

  it("fails closed when sync is not display-only or an input is not SUM", () => {
    const automaticConfig = { ...createConfig(), computedSyncMode: "automatic" as const };
    const automatic = inspectReportsConfig(automaticConfig, "Reports.md", "outflow");
    expect(() => lockReportsExpressions(automatic, {
      income: "gross_income",
      expenses: "operating_costs",
    })).toThrow("display-only");

    const nonSumConfig = createConfig();
    nonSumConfig.schema.columns[1].rollupConfig!.aggregation = "avg";
    const nonSum = inspectReportsConfig(nonSumConfig, "Reports.md", "outflow");
    expect(() => lockReportsExpressions(nonSum, {
      income: "gross_income",
      expenses: "operating_costs",
    })).toThrow("SUM rollup");
  });
});
