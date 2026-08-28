// ───────────────────────────────────────────────────────────────────
// MODULE:    aggregate
// COMPONENT: pure numeric/date aggregation helpers for display-only rollups
// ───────────────────────────────────────────────────────────────────
//
// Values are coerced at the call sites so this module stays independent from
// the rendering and rollup implementations. Every aggregate filters to
// finite numbers first, so a NaN/Infinity/missing value in the source data
// is treated as absent rather than poisoning the whole rollup.

// ───────────────────────────────────────────────────────────────────
// 1. ROLLUP KIND REGISTRY
// ───────────────────────────────────────────────────────────────────

const NUMERIC_ROLLUP_KINDS = new Set([
  "count",
  "sum",
  "avg",
  "min",
  "max",
  "median",
  "range",
  "percentEmpty",
  "percentFilled",
]);

export function isNumericRollupKind(id: string): boolean {
  return NUMERIC_ROLLUP_KINDS.has(id);
}

// ───────────────────────────────────────────────────────────────────
// 2. AGGREGATES
// ───────────────────────────────────────────────────────────────────

export function min(numbers: readonly number[]): number | null {
  const finite = finiteNumbers(numbers);
  return finite.length > 0 ? Math.min(...finite) : null;
}

export function max(numbers: readonly number[]): number | null {
  const finite = finiteNumbers(numbers);
  return finite.length > 0 ? Math.max(...finite) : null;
}

export function median(numbers: readonly number[]): number | null {
  const finite = finiteNumbers(numbers);
  if (finite.length === 0) return null;
  const sorted = [...finite].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function range(numbers: readonly number[]): number | null {
  const finite = finiteNumbers(numbers);
  if (finite.length === 0) return null;
  return Math.max(...finite) - Math.min(...finite);
}

export function earliest(timestamps: readonly number[]): Date | null {
  const finite = finiteNumbers(timestamps);
  return finite.length > 0 ? new Date(Math.min(...finite)) : null;
}

export function latest(timestamps: readonly number[]): Date | null {
  const finite = finiteNumbers(timestamps);
  return finite.length > 0 ? new Date(Math.max(...finite)) : null;
}

export function percentEmpty(total: number, emptyCount: number): number {
  return total === 0 ? 0 : (emptyCount / total) * 100;
}

export function percentFilled(total: number, emptyCount: number): number {
  return total === 0 ? 0 : 100 - percentEmpty(total, emptyCount);
}

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

function finiteNumbers(numbers: readonly number[]): number[] {
  return numbers.filter((value) => Number.isFinite(value));
}
