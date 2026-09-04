// ───────────────────────────────────────────────────────────────────
// MODULE:    board-card-fields
// COMPONENT: persisted card-field list parse — shared by vault and embed writers
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. PARSE
// ───────────────────────────────────────────────────────────────────

import type { BoardCardField } from "./types";

/** A missing or unreadable value means "derive". An empty array is a real list. */
export function parseBoardCardFields(value: unknown): BoardCardField[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result: BoardCardField[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const record = item as Record<string, unknown>;
    const key = typeof record.key === "string" ? record.key.trim() : "";
    if (!key) continue;
    result.push({ key, visible: record.visible !== false });
  }
  if (result.length === 0 && value.length > 0) return undefined;
  return result;
}
