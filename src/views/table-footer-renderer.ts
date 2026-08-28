// ───────────────────────────────────────────────────────────────────
// MODULE:    table-footer-renderer
// COMPONENT: Table tfoot — per-column calculation triggers and their menu
// ───────────────────────────────────────────────────────────────────
//
// normalizeCalculationKind maps legacy/alias summary names (e.g. "stdev",
// "count_empty") onto the current TableCalculationKind so config saved under
// an older name still resolves to a real label instead of falling through
// to the raw string.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ColumnDef, RowData, TableCalculationKind, ViewConfig } from "../data/types";
import { toChartNumber } from "../data/chart-aggregation";
import { isDateLikeColumnType, parseDateTimeParts, toDateTimestamp } from "../data/date-time-format";
import { formatEuroNumber2 } from "../data/euro-format";
import { getRowFileFieldValue, isBaseFileField } from "../data/file-fields";
import { stringifyValue } from "../data/stringify";
import { earliest, isNumericRollupKind, latest, max, median, min, range } from "../data/aggregate";
import { t } from "../i18n";
import { DropdownOption, openDropdownMenu } from "./dropdown-field";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface TableFooterOptions {
  onCalculationChange(columnKey: string, calculation: TableCalculationKind | null): void;
  isReadOnly?: boolean;
  hasRecordIcon?: boolean;
}

// ───────────────────────────────────────────────────────────────────
// 3. CALCULATIONS
// ───────────────────────────────────────────────────────────────────

export function getCalculationColumnIndex(columns: readonly ColumnDef[], columnKey: string): number {
  return columns.findIndex((column) => column.key === columnKey);
}

export function calculateTableAggregate(values: readonly unknown[], summaryName: string): unknown {
  const nonEmpty = values.filter((value) => !isEmpty(value));
  const numbers = nonEmpty.map((value) => toChartNumber(value)).filter((value): value is number => value != null);
  const dates = nonEmpty.map((value) => toDateTimestamp(value)).filter((value): value is number => value != null);
  const booleans = nonEmpty.filter((value) => typeof value === "boolean");
  const kind = normalizeCalculationKind(summaryName);
  switch (kind) {
    case "SUM": return numbers.length ? sum(numbers) : null;
    case "AVERAGE": return numbers.length ? sum(numbers) / numbers.length : null;
    case "MEDIAN": return median(numbers);
    case "MIN": return min(numbers);
    case "MAX": return max(numbers);
    case "RANGE": {
      const numericRange = range(numbers);
      return numericRange ?? (dates.length > 1 ? Math.max(...dates) - Math.min(...dates) : null);
    }
    case "STDDEV": return numbers.length ? standardDeviation(numbers) : null;
    case "COUNT":
    case "FILLED": return nonEmpty.length;
    case "UNIQUE": return new Set(nonEmpty.map((value) => JSON.stringify(value))).size;
    case "EMPTY": return values.filter(isEmpty).length;
    case "CHECKED": return booleans.filter(Boolean).length;
    case "UNCHECKED": return booleans.filter((value) => !value).length;
    case "EARLIEST": return earliest(dates);
    case "LATEST": return latest(dates);
    default: return null;
  }
}

export function normalizeCalculationKind(summaryName: string): TableCalculationKind | null {
  const compact = summaryName.trim().toUpperCase().replace(/[\s_-]+/g, "");
  switch (compact) {
    case "SUM": return "SUM";
    case "AVG":
    case "AVERAGE":
    case "MEAN": return "AVERAGE";
    case "MEDIAN": return "MEDIAN";
    case "MIN": return "MIN";
    case "MAX": return "MAX";
    case "RANGE": return "RANGE";
    case "STDDEV":
    case "STDEV":
    case "STANDARDDEVIATION": return "STDDEV";
    case "COUNT":
    case "COUNTFILLED":
    case "COUNTNONEMPTY": return "COUNT";
    case "FILLED": return "FILLED";
    case "UNIQUE":
    case "COUNTUNIQUE": return "UNIQUE";
    case "EMPTY":
    case "COUNTEMPTY": return "EMPTY";
    case "CHECKED": return "CHECKED";
    case "UNCHECKED": return "UNCHECKED";
    case "EARLIEST": return "EARLIEST";
    case "LATEST": return "LATEST";
    default: return null;
  }
}

export function getCalculationKindsForColumn(config: ViewConfig, column: ColumnDef): TableCalculationKind[] {
  const computedType = column.type === "computed"
    ? config.schema.computedFields.find((field) => field.key === (column.computedKey || column.key))?.type
    : undefined;
  const type = computedType || column.type;
  const common: TableCalculationKind[] = ["COUNT", "UNIQUE", "EMPTY", "FILLED"];
  if (type === "number" || type === "currency") return ["SUM", "AVERAGE", "MEDIAN", "MIN", "MAX", "RANGE", "STDDEV", ...common];
  if (column.type === "rollup" && isNumericRollupKind(column.rollupConfig?.aggregation ?? "")) {
    return ["SUM", "AVERAGE", "MEDIAN", "MIN", "MAX", "RANGE", "STDDEV", ...common];
  }
  if (isDateLikeColumnType(type)) return ["EARLIEST", "LATEST", "RANGE", ...common];
  if (type === "checkbox") return ["CHECKED", "UNCHECKED", ...common];
  return common;
}

// ───────────────────────────────────────────────────────────────────
// 4. TABLE FOOTER RENDERER
// ───────────────────────────────────────────────────────────────────

export class TableFooterRenderer {
  renderFooter(
    table: HTMLTableElement,
    config: ViewConfig,
    columns: ColumnDef[],
    rows: RowData[],
    options: TableFooterOptions,
  ): HTMLElement {
    table.querySelector(":scope > tfoot")?.remove();
    const footer = table.createEl("tfoot", { cls: "db-table-footer" });
    const footerRow = footer.createEl("tr", { cls: "db-table-footer-row" });
    if (!options.isReadOnly) footerRow.createEl("td", { cls: "db-table-footer-utility" });
    if (options.hasRecordIcon) footerRow.createEl("td", { cls: "db-table-footer-utility" });
    for (const column of columns) {
      const cell = footerRow.createEl("td", {
        cls: "db-table-footer-cell",
        attr: { "data-note-database-column-key": column.key },
      });
      const rules = (config.summaryRules || []).filter((rule) => rule.field === column.key);
      const values = rules
        .map((rule) => ({ kind: normalizeCalculationKind(rule.summary), rawKind: rule.summary }))
        .map(({ kind, rawKind }) => ({ kind, rawKind, value: calculateTableAggregate(rows.map((row) => getRowValue(row, column)), rawKind) }))
        .filter(({ value }) => value != null && value !== "");
      const trigger = cell.createEl("button", {
        cls: `db-table-footer-trigger${values.length ? " has-calculation" : ""}`,
        attr: { type: "button", "aria-label": t("table.calculateFor", { name: column.label || column.key }) },
      });
      if (values.length > 0) {
        for (const { kind, rawKind, value } of values) {
          const item = trigger.createSpan({ cls: "db-table-footer-value" });
          item.createSpan({ cls: "db-table-footer-kind", text: kind ? getCalculationLabel(kind) : rawKind });
          item.createSpan({ cls: "db-table-footer-result", text: formatCalculationValue(value) });
        }
      } else {
        trigger.createSpan({ cls: "db-table-footer-calculate-hint", text: t("table.calculate") });
      }
      if (options.isReadOnly) {
        trigger.disabled = true;
      } else {
        trigger.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.openCalculationMenu(trigger, config, column, values[0]?.kind || null, options);
        };
      }
    }
    footerRow.createEl("td", { cls: "db-table-footer-add-column" });
    return footer;
  }

  private openCalculationMenu(
    anchor: HTMLElement,
    config: ViewConfig,
    column: ColumnDef,
    current: TableCalculationKind | null,
    options: TableFooterOptions,
  ): void {
    const choices: DropdownOption[] = [
      { value: "", text: t("table.calculation.none") },
      ...getCalculationKindsForColumn(config, column).map((kind) => ({ value: kind, text: getCalculationLabel(kind) })),
    ];
    openDropdownMenu({
      anchor,
      label: t("table.calculation.label", { name: column.label || column.key }),
      value: current || "",
      options: choices,
      popoverClassName: "db-table-calculation-popover",
      onChange: (value) => {
        const kind = normalizeCalculationKind(value);
        if (!kind && value !== "") return;
        options.onCalculationChange(column.key, kind);
      },
    });
  }
}

// ───────────────────────────────────────────────────────────────────
// 5. HELPERS
// ───────────────────────────────────────────────────────────────────

function getRowValue(row: RowData, column: ColumnDef): unknown {
  if (column.type === "computed" || column.type === "rollup") {
    return row.computed[column.type === "computed" ? column.computedKey || column.key : column.key];
  }
  if (isBaseFileField(column.key)) return getRowFileFieldValue(row, column.key);
  return row.frontmatter[column.key];
}

function getCalculationLabel(kind: TableCalculationKind): string {
  return t(`table.calculation.${kind.toLowerCase()}`);
}

function formatCalculationValue(value: unknown): string {
  if (value instanceof Date) return parseDateTimeParts(value)?.dateKey || value.toISOString().slice(0, 10);
  if (typeof value === "number") return formatEuroNumber2(value);
  return stringifyValue(value);
}

function isEmpty(value: unknown): boolean {
  return value == null || value === "" || (Array.isArray(value) && value.length === 0);
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function standardDeviation(values: readonly number[]): number {
  const average = sum(values) / values.length;
  return Math.sqrt(sum(values.map((value) => (value - average) ** 2)) / values.length);
}
