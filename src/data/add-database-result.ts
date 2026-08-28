// ───────────────────────────────────────────────────────────────────
// MODULE:    add-database-result
// COMPONENT: new-database modal result type and its apply-to-config step
// ───────────────────────────────────────────────────────────────────
//
// Every optional field here means "inherit the default / leave unset" when
// undefined, matching an empty settings-popover field — applyAddDatabaseResult
// relies on that convention to avoid clobbering inherited values. It
// deliberately does not set `name`: uniqueness is the caller's job
// (getUniqueDatabaseName) before the unique name reaches
// buildDatabaseWithInferredColumns, the shared scan-infer-confirm
// orchestrator used by both creation entry points.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { DatabaseConfig, SourceRule, SourceRuleNode, StatusPresetDef } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

/** Globals collected by the new-database modal. The creation flow applies these to the
 *  freshly built DatabaseConfig via `applyAddDatabaseResult`. Source rules, new-record
 *  folder, description and status presets are optional — `undefined` means "inherit the
 *  default / leave unset", same as leaving the field empty in the settings popover. */
export interface AddDatabaseModalResult {
  name: string;
  description?: string;
  sourceFolder: string;
  sourceRules?: SourceRule[];
  sourceLogic?: "and" | "or";
  sourceRuleTree?: SourceRuleNode;
  newRecordFolder?: string;
  /** Per-database status presets. `undefined` = inherit global presets. */
  statusPresets?: StatusPresetDef[];
  /** Default status preset id. `undefined` = inherit the global default. */
  defaultStatusPresetId?: string;
}

// ───────────────────────────────────────────────────────────────────
// 3. APPLY ADD DATABASE RESULT
// ───────────────────────────────────────────────────────────────────

/** Apply the modal's collected globals onto a freshly built DatabaseConfig. Called by
 *  `buildDatabaseWithInferredColumns` (the shared scan→infer→confirm orchestrator used by
 *  both creation entry points: DatabaseView.addDatabase and the settings panel). Does NOT
 *  set `name` — uniqueness is the caller's job (getUniqueDatabaseName), so the caller
 *  passes the unique name into `buildDatabaseWithInferredColumns`. */
export function applyAddDatabaseResult(db: DatabaseConfig, result: AddDatabaseModalResult): void {
  db.description = result.description || undefined;
  db.sourceFolder = result.sourceFolder;
  db.sourceRules = result.sourceRules;
  db.sourceLogic = result.sourceLogic;
  db.sourceRuleTree = result.sourceRuleTree;
  db.newRecordFolder = result.newRecordFolder;
  db.statusPresets = result.statusPresets;
  db.defaultStatusPresetId = result.defaultStatusPresetId;
}
