// ───────────────────────────────────────────────────────────────────
// MODULE:    legacy-plugin-data-migration
// COMPONENT: carries settings from the plugin's old vault folder to its new one
// ───────────────────────────────────────────────────────────────────
//
// The plugin id is part of a vault's on-disk path (`.obsidian/plugins/<id>/`), so renaming the
// id starts every existing install over with an empty folder and default settings unless
// something bridges the two. This is that bridge, and it is a COPY, never a move: the old
// folder is a second, independent plugin install as far as the vault adapter is concerned, and
// leaving its `data.json` in place is what lets a user run both the old and new id side by side,
// or revert the id change later, with nothing to restore.
//
// The whole decision is "does the new folder already have data, and does the old one have any to
// give" — nothing here reads the JSON or knows what a setting is, so an unparseable legacy file
// is copied verbatim rather than silently dropped; the plugin's own `loadData()` fallback is what
// decides what to do with bytes that turn out not to parse.
//
// PURE-ish ON PURPOSE: the three adapter calls are the only I/O, expressed through a two-method
// interface a test can satisfy with a plain object instead of a real vault.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

/** The slice of Obsidian's `DataAdapter` this migration needs. */
export interface LegacyMigrationAdapter {
  exists(path: string): Promise<boolean>;
  read(path: string): Promise<string>;
  write(path: string, data: string): Promise<void>;
}

export interface LegacyDataMigrationResult {
  /** True only when bytes were actually copied this call. */
  copied: boolean;
  reason: "copied" | "already-present" | "no-legacy-data";
}

// ───────────────────────────────────────────────────────────────────
// 2. THE MIGRATION
// ───────────────────────────────────────────────────────────────────

/**
 * Copies `data.json` from the old plugin folder to the new one, once.
 *
 * - New folder already has data (or a prior run already copied it): does nothing, reports
 *   `already-present`. This is also why nothing here needs its own "already ran" flag — the
 *   copied file's own existence is the record.
 * - Old folder has nothing to copy: does nothing, reports `no-legacy-data`.
 * - Otherwise: reads the old file's exact bytes and writes them to the new path unchanged. The
 *   old file is never opened for anything but a read, and this function never deletes, renames
 *   or moves it.
 */
export async function migrateLegacyPluginData(
  adapter: LegacyMigrationAdapter,
  oldDataPath: string,
  newDataPath: string,
): Promise<LegacyDataMigrationResult> {
  if (await adapter.exists(newDataPath)) return { copied: false, reason: "already-present" };
  if (!(await adapter.exists(oldDataPath))) return { copied: false, reason: "no-legacy-data" };
  const legacy = await adapter.read(oldDataPath);
  await adapter.write(newDataPath, legacy);
  return { copied: true, reason: "copied" };
}
