// ───────────────────────────────────────────────────────────────────
// MODULE:    multi-select
// COMPONENT: Deterministic ordering and group-membership helpers for multi-select values
// ───────────────────────────────────────────────────────────────────
//
// Multi-select tags have no inherent order once stored, so `compareMultiSelect`
// and `sortMultiSelectValues` rank tags by their position in the column's
// configured global options (falling back to alphabetical for unranked tags)
// — this keeps board/list grouping stable across renders instead of drifting
// with raw frontmatter array order. `LEGACY_EMPTY_GROUP_KEYS` recognizes older
// localized "uncategorized" group ids so boards saved before EMPTY_GROUP_ID
// existed still resolve to the empty group instead of becoming a stray tag.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { toMultiSelectValues } from "./column-types";
import { stringifyValue } from "./stringify";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

export const EMPTY_GROUP_ID = "EMPTY_GROUP";

export type MultiSelectGlobalOption = string | { value?: unknown; label?: unknown; name?: unknown };

const LEGACY_EMPTY_GROUP_KEYS = new Set(["未分类", "未分類", "Uncategorized"]);

// ───────────────────────────────────────────────────────────────────
// 3. PUBLIC API
// ───────────────────────────────────────────────────────────────────

export function isEmptyGroupId(value: unknown): boolean {
  const key = stringifyValue(value).trim();
  return key.length === 0 || key === EMPTY_GROUP_ID || LEGACY_EMPTY_GROUP_KEYS.has(key);
}

export function compareMultiSelect(
  itemA: unknown,
  itemB: unknown,
  globalOptions: readonly MultiSelectGlobalOption[] = []
): number {
  const ranks = createOptionRanks(globalOptions);
  // Normalize each item first so pairwise comparison is deterministic regardless of raw tag order.
  const a = normalizeMultiSelectForCompare(itemA, ranks);
  const b = normalizeMultiSelectForCompare(itemB, ranks);
  const length = Math.min(a.length, b.length);

  for (let i = 0; i < length; i++) {
    const cmp = compareTag(a[i], b[i], ranks);
    if (cmp !== 0) return cmp;
  }
  return a.length - b.length;
}

export function sortMultiSelectValues(
  value: unknown,
  globalOptions: readonly MultiSelectGlobalOption[] = []
): string[] {
  const ranks = createOptionRanks(globalOptions);
  return normalizeMultiSelectForCompare(value, ranks);
}

export function moveMultiSelectGroupValue(
  currentValue: unknown,
  fromGroupId: string | undefined,
  toGroupId: string,
  globalOptions: readonly MultiSelectGlobalOption[] = []
): string[] {
  // Empty target means the card moved into the no-tag group, so all tags are cleared.
  if (isEmptyGroupId(toGroupId)) return [];

  const target = stringifyValue(toGroupId).trim();
  if (!target) return [];

  if (isEmptyGroupId(fromGroupId)) {
    // Moving out of the empty group creates a single-tag value instead of merging stale tags.
    return sortMultiSelectValues([target], globalOptions);
  }

  const source = stringifyValue(fromGroupId).trim();
  const next = toMultiSelectValues(currentValue).filter((tag) => tag !== source);
  if (!next.includes(target)) next.push(target);
  return sortMultiSelectValues(next, globalOptions);
}

// ───────────────────────────────────────────────────────────────────
// 4. HELPERS
// ───────────────────────────────────────────────────────────────────

function normalizeMultiSelectForCompare(value: unknown, ranks: Map<string, number>): string[] {
  const seen = new Set<string>();
  const values: string[] = [];
  for (const tag of toMultiSelectValues(value)) {
    if (seen.has(tag)) continue;
    seen.add(tag);
    values.push(tag);
  }
  return values.sort((a, b) => compareTag(a, b, ranks));
}

function compareTag(a: string, b: string, ranks: Map<string, number>): number {
  const ar = ranks.get(a) ?? Number.MAX_SAFE_INTEGER;
  const br = ranks.get(b) ?? Number.MAX_SAFE_INTEGER;
  if (ar !== br) return ar - br;
  return a.localeCompare(b);
}

function createOptionRanks(options: readonly MultiSelectGlobalOption[]): Map<string, number> {
  const ranks = new Map<string, number>();
  for (const option of options) {
    const value = getOptionValue(option);
    if (!value || ranks.has(value)) continue;
    ranks.set(value, ranks.size);
  }
  return ranks;
}

function getOptionValue(option: MultiSelectGlobalOption): string {
  if (typeof option === "string") return option.trim();
  const raw = option.value ?? option.label ?? option.name;
  return stringifyValue(raw).trim();
}
