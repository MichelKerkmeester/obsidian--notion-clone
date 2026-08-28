// ───────────────────────────────────────────────────────────────────
// MODULE:    reports-display
// COMPONENT: Number formatting and computed-column detection for the Reports Remaining/Saved cells.
// ───────────────────────────────────────────────────────────────────
//
// Reports Remaining/Saved are formula-derived, display-only numbers: they need
// Euro-formatted text like any other number cell, but must NOT get the generic
// computed-column affordances (formula-edit UI, "Empty" placeholder) every other
// computed column gets on an empty result — see isReportsComputedColumn below.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { formatEuroNumber } from "./euro-format";
import { REPORTS_REMAINING_KEY, REPORTS_SAVED_KEY } from "./reports-computed-config";
import type { ColumnDef } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. FORMATTING
// ───────────────────────────────────────────────────────────────────

export function toReportsDisplayNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(number) ? number : null;
}

export function formatReportsNumber(value: unknown): string {
  const number = toReportsDisplayNumber(value);
  return number === null ? "-" : formatEuroNumber(number);
}

// ───────────────────────────────────────────────────────────────────
// 3. COLUMN DETECTION
// ───────────────────────────────────────────────────────────────────

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
