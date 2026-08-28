// ───────────────────────────────────────────────────────────────────
// MODULE:    field-tooltip
// COMPONENT: title-attribute tooltip text for cell/field values
// ───────────────────────────────────────────────────────────────────
//
// Objects prefer JSON.stringify so nested structure stays visible in the
// tooltip; the stringifyValue fallback only kicks in when JSON.stringify
// throws (e.g. a circular reference), so the tooltip never disappears.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { stringifyValue } from "../data/stringify";

// ───────────────────────────────────────────────────────────────────
// 2. TOOLTIP FORMATTING
// ───────────────────────────────────────────────────────────────────

export function formatFieldTooltipValue(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) {
    return value.map((entry) => formatFieldTooltipValue(entry)).filter(Boolean).join(", ");
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return stringifyValue(value);
    }
  }
  return stringifyValue(value);
}

export function setFieldTooltip(el: HTMLElement, value: unknown, prefix?: string): void {
  const text = formatFieldTooltipValue(value).trim();
  if (!text) return;
  el.title = prefix ? `${prefix}\n${text}` : text;
}
