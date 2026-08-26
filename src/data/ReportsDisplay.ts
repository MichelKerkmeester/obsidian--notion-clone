import { formatEuroNumber } from "./EuroFormat";

export function toReportsDisplayNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(number) ? number : null;
}

export function formatReportsNumber(value: unknown): string {
  const number = toReportsDisplayNumber(value);
  return number === null ? "-" : formatEuroNumber(number);
}
