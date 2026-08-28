// ───────────────────────────────────────────────────────────────────
// MODULE:    computed-cleanup
// COMPONENT: finds computed columns whose values still linger in note frontmatter
// ───────────────────────────────────────────────────────────────────
//
// Computed columns are meant to be derived at read time, never written to
// frontmatter — but a column can end up with stale computed-value keys still
// sitting in notes (e.g. it was a plain column before becoming computed).
// This builds the option list for a bulk cleanup action; when `rows` is
// passed, options with zero matching records are dropped so the cleanup UI
// never offers to "clean" a key that isn't actually present anywhere.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { getComputedStorageKey } from "./column-display";
import { ColumnDef } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

interface FrontmatterRecord {
  frontmatter: Record<string, unknown>;
}

export interface ComputedFrontmatterCleanupOption {
  key: string;
  label: string;
  columnKey: string;
  recordCount: number;
}

// ───────────────────────────────────────────────────────────────────
// 3. CLEANUP OPTIONS
// ───────────────────────────────────────────────────────────────────

export function getComputedFrontmatterCleanupOptions(columns: ColumnDef[], rows?: FrontmatterRecord[]): ComputedFrontmatterCleanupOption[] {
  const seen = new Set<string>();
  const options: ComputedFrontmatterCleanupOption[] = [];
  const shouldFilterByFrontmatter = Array.isArray(rows);
  for (const col of columns) {
    if (col.type !== "computed") continue;
    const key = getComputedStorageKey(col).trim();
    if (!key || seen.has(key)) continue;
    const recordCount = (rows ?? []).filter((row) => Object.prototype.hasOwnProperty.call(row.frontmatter, key)).length;
    if (shouldFilterByFrontmatter && recordCount === 0) continue;
    seen.add(key);
    options.push({
      key,
      label: col.label || key,
      columnKey: col.key,
      recordCount,
    });
  }
  return options;
}
