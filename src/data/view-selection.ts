// ───────────────────────────────────────────────────────────────────
// MODULE:    view-selection
// COMPONENT: restore the selected database/view tab by stable id after entries reorder
// ───────────────────────────────────────────────────────────────────
//
// Numeric database/view indexes shift whenever entries are reordered,
// renamed, or rebuilt, so the stable sourcePath/viewId identity is always
// tried first — the caller-supplied numeric fallback only applies once the
// previously selected database or view no longer exists at all.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export interface ViewSelectionEntry {
  sourcePath: string;
  viewIds: readonly (string | undefined)[];
}

export interface ViewSelectionIdentity {
  sourcePath?: string;
  viewId?: string;
}

export interface ResolvedViewSelection {
  databaseIndex: number;
  viewIndex: number;
}

// ───────────────────────────────────────────────────────────────────
// 2. RESOLVE VIEW SELECTION
// ───────────────────────────────────────────────────────────────────

/**
 * Restore a database/view selection by stable identity after entries are
 * reordered or rebuilt. Numeric indexes are only a fallback when the selected
 * database or view no longer exists.
 */
export function resolveViewSelection(
  entries: readonly ViewSelectionEntry[],
  identity: ViewSelectionIdentity,
  fallbackDatabaseIndex: number,
  fallbackViewIndex: number,
): ResolvedViewSelection {
  if (entries.length === 0) return { databaseIndex: 0, viewIndex: 0 };

  const identityDatabaseIndex = identity.sourcePath
    ? entries.findIndex((entry) => entry.sourcePath === identity.sourcePath)
    : -1;
  const databaseIndex = identityDatabaseIndex >= 0
    ? identityDatabaseIndex
    : clampIndex(fallbackDatabaseIndex, entries.length);

  const viewIds = entries[databaseIndex]?.viewIds || [];
  if (viewIds.length === 0) return { databaseIndex, viewIndex: 0 };

  const viewIndex = resolveViewIndex(viewIds, identity.viewId, fallbackViewIndex);
  return { databaseIndex, viewIndex };
}

/** Resolve a tab selection at the moment it is activated, after the view list
 * may have been reordered or refreshed. */
export function resolveViewIndex(
  viewIds: readonly (string | undefined)[],
  viewId: string | undefined,
  fallbackIndex = 0,
): number {
  const identityIndex = viewId ? viewIds.indexOf(viewId) : -1;
  return identityIndex >= 0 ? identityIndex : clampIndex(fallbackIndex, viewIds.length);
}

function clampIndex(index: number, length: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(Math.trunc(index), length - 1));
}
