// ───────────────────────────────────────────────────────────────────
// MODULE:    stringify
// COMPONENT: Unconditional unknown-to-string conversion for comparison, search, and display text.
// ───────────────────────────────────────────────────────────────────
//
// Unlike safe-string.ts's safeString, which returns a caller-chosen fallback
// for non-primitives, this always returns some string. Arrays join with a
// comma and space, Error values return their message, and a JSON.stringify
// failure on a circular value falls back to Object.prototype.toString rather
// than throwing. Callers building searchable or comparable text from
// arbitrary frontmatter values need that unconditional guarantee.

// ───────────────────────────────────────────────────────────────────
// 1. STRINGIFY
// ───────────────────────────────────────────────────────────────────

export function stringifyValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean" || typeof value === "bigint") return String(value);
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) return value.message;
  if (Array.isArray(value)) return value.map((item) => stringifyValue(item)).join(", ");
  try {
    return JSON.stringify(value) || "";
  } catch {
    return Object.prototype.toString.call(value);
  }
}

export function stringifyOptional(value: unknown): string | undefined {
  return value == null ? undefined : stringifyValue(value);
}
