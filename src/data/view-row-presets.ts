// ───────────────────────────────────────────────────────────────────
// MODULE:    view-row-presets
// COMPONENT: apply a view's new-row defaults, skipping keys the schema no longer has
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { ColumnDef, RecordSchema } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. PRESETS
// ───────────────────────────────────────────────────────────────────

/** Columns a new row can receive a typed default for. */
export function writablePresetColumns(schema: RecordSchema | undefined): ColumnDef[] {
  return (schema?.columns || []).filter((column) => column.key !== "file.name" && column.type !== "computed");
}

/**
 * Turn stored string defaults into the map `createEntry` already accepts.
 *
 * Missing or empty maps return `undefined` so the no-preset path stays
 * the same call as a view that never stored defaults.
 */
export function applyViewRowPresets(
  presets: Record<string, string> | undefined,
  schema: RecordSchema | undefined,
): Record<string, unknown> | undefined {
  if (!presets || !schema) return undefined;
  const keys = new Set(schema.columns.map((column) => column.key));
  const applied: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(presets)) {
    if (keys.has(key) && value !== "") applied[key] = value;
  }
  return Object.keys(applied).length ? applied : undefined;
}
