import { formatEuroNumber } from "./EuroFormat";
import { REPORTS_REMAINING_KEY, REPORTS_SAVED_KEY } from "./ReportsComputedConfig";
import type { ColumnDef } from "./types";

export function toReportsDisplayNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(number) ? number : null;
}

export function formatReportsNumber(value: unknown): string {
  const number = toReportsDisplayNumber(value);
  return number === null ? "-" : formatEuroNumber(number);
}

/** True for the Reports Remaining/Saved computed columns specifically (not
 *  any other computed column, rollup, or plain number field). An empty result
 *  on these two is an expected fail-closed formula outcome, so the cell should
 *  show the "-" glyph via renderNumberValue rather than the generic "Empty"
 *  placeholder + formula-edit affordance every other computed column gets. */
export function isReportsComputedColumn(col: Pick<ColumnDef, "type" | "computedKey" | "key">): boolean {
  if (col.type !== "computed") return false;
  const storageKey = col.computedKey || col.key;
  return storageKey === REPORTS_REMAINING_KEY || storageKey === REPORTS_SAVED_KEY;
}
