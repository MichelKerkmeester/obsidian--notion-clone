/**
 * European (nl-NL) number formatting override.
 *
 * The stock renderer prints integers with String() (no thousands grouping) and
 * decimals in the runtime's default locale. This forces a consistent Dutch style
 * everywhere numbers surface: "." groups thousands, "," is the decimal separator,
 * and currency columns carry a euro sign — e.g. 1.000.000,25 / 4.429 / € 34,21.
 *
 * Local fork override. Kept in one module so it stays a small, rebasable diff.
 */

const nlNumber = new Intl.NumberFormat("nl-NL", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 6,
});

const nlNumber2 = new Intl.NumberFormat("nl-NL", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const nlEuro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Grouped decimal, up to 6 fraction digits (plain number cells). */
export function formatEuroNumber(value: number): string {
  return Number.isFinite(value) ? nlNumber.format(value) : "-";
}

/** Grouped decimal, up to 2 fraction digits (footer summaries). */
export function formatEuroNumber2(value: number): string {
  return Number.isFinite(value) ? nlNumber2.format(value) : "-";
}

/** Grouped euro currency, up to 2 fraction digits (currency cells). */
export function formatEuroCurrency(value: number): string {
  return Number.isFinite(value) ? nlEuro.format(value) : "-";
}
