// ───────────────────────────────────────────────────────────────────
// MODULE:    computed-sync
// COMPONENT: Coalesces delayed automatic-computed-sync writes into one queued batch per drain
// ───────────────────────────────────────────────────────────────────
//
// A queued database-wide sync request dominates later row-only requests until
// drained, rather than merging scopes, because a partial row-scope write after
// a database-wide one was requested would leave some rows stale relative to
// the intent that triggered the wider sync.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────
import { ComputedSyncMode } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES & CONSTANTS
// ───────────────────────────────────────────────────────────────────
export const DEFAULT_COMPUTED_SYNC_MODE: ComputedSyncMode = "display-only";
export type ComputedSyncScope = "database" | "rows";

export interface ComputedSyncQueueItem {
  file: { path: string };
}

// ───────────────────────────────────────────────────────────────────
// 3. COMPUTED SYNC QUEUE
// ───────────────────────────────────────────────────────────────────
/**
 * Coalesces delayed automatic-computed-sync work by file identity. A queued
 * database-wide request dominates later row-only requests until drained.
 */
export class ComputedSyncQueue<T extends ComputedSyncQueueItem> {
  private rows = new Map<string, T>();
  private scope: ComputedSyncScope = "rows";

  merge(rows: Iterable<T>, scope: ComputedSyncScope): void {
    if (scope === "database") {
      this.rows = new Map(Array.from(rows, (row) => [row.file.path, row]));
      this.scope = "database";
      return;
    }
    for (const row of rows) this.rows.set(row.file.path, row);
  }

  drain(): { rows: T[]; scope: ComputedSyncScope } {
    const result = {
      rows: Array.from(this.rows.values()),
      scope: this.scope,
    };
    this.clear();
    return result;
  }

  clear(): void {
    this.rows.clear();
    this.scope = "rows";
  }
}

// ───────────────────────────────────────────────────────────────────
// 4. NORMALIZE COMPUTED SYNC MODE
// ───────────────────────────────────────────────────────────────────
export function normalizeComputedSyncMode(value: unknown): ComputedSyncMode {
  if (value === "automatic" || value === "manual") return value;
  return DEFAULT_COMPUTED_SYNC_MODE;
}
