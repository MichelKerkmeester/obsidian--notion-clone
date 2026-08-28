// ───────────────────────────────────────────────────────────────────
// MODULE:    option-registration
// COMPONENT: Computes the option-list mutation needed when a select/status/multi-select
//            value introduces a value not yet in the column's known options
// ───────────────────────────────────────────────────────────────────
//
// Returns a plan rather than mutating the column directly, so callers can
// apply it inside their own undo/transaction boundary. Deliberately excludes
// Obsidian's built-in tags key (`isObsidianTagsKey` / `file.tags`) — that
// field's options come from the vault-wide tag index, not per-column
// `statusOptions`, so auto-registering here would create options nothing
// ever reads.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import {
  isObsidianTagsKey,
  isOptionColumnType,
  normalizeOptionValueForKey,
  toMultiSelectValuesForKey,
} from "./column-types";
import { STATUS_COLORS } from "./status-colors";
import { ColumnDef, StatusColor, StatusOptionDef } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export const OPTION_REGISTRATION_COLORS: StatusColor[] = [...STATUS_COLORS];

export interface OptionRegistrationPlan {
  participates: boolean;
  value: unknown;
  options: StatusOptionDef[];
  addedOptions: StatusOptionDef[];
  clearPresetId: boolean;
}

// ───────────────────────────────────────────────────────────────────
// 3. PLAN OPTION REGISTRATION
// ───────────────────────────────────────────────────────────────────

export function planOptionRegistration(col: ColumnDef, candidate: unknown): OptionRegistrationPlan {
  const options = (col.statusOptions || []).map((option) => ({ ...option }));
  if (!isOptionColumnType(col.type) || isObsidianTagsKey(col.key) || col.key === "file.tags") {
    return { participates: false, value: candidate, options, addedOptions: [], clearPresetId: false };
  }

  const values = col.type === "multi-select"
    ? toMultiSelectValuesForKey(col.key, candidate)
    : [normalizeOptionValueForKey(col.key, candidate)].filter(Boolean);
  const normalized: string[] = [];
  const seenValues = new Set<string>();
  for (const value of values) {
    if (!value || seenValues.has(value)) continue;
    seenValues.add(value);
    normalized.push(value);
  }

  const known = new Set(options.map((option) => option.value));
  const addedOptions: StatusOptionDef[] = [];
  for (const value of normalized) {
    if (known.has(value)) continue;
    const option: StatusOptionDef = {
      value,
      color: OPTION_REGISTRATION_COLORS[options.length % OPTION_REGISTRATION_COLORS.length],
    };
    options.push(option);
    addedOptions.push(option);
    known.add(value);
  }

  return {
    participates: true,
    value: col.type === "multi-select" ? normalized : (normalized[0] || ""),
    options,
    addedOptions,
    clearPresetId: col.type === "status" && addedOptions.length > 0,
  };
}
