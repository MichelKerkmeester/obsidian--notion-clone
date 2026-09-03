// ───────────────────────────────────────────────────────────────────
// MODULE:    subtask-hydrate
// COMPONENT: frontmatter relation-field read — sanitized normalization of
//            the four per-note subtask fields before any relation or write
//            logic sees them
// ───────────────────────────────────────────────────────────────────
//
// Frontmatter is untrusted note data, so read normalization is the single
// gate every other module in this feature relies on: a malformed value
// becomes its default instead of propagating into the relation. The write
// path mirrors these defaults (defaults are omitted, never written), so a
// read -> write -> read cycle is lossless.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { SubtaskRelationFields } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. READ
// ───────────────────────────────────────────────────────────────────

/** The four relation keys, shared with the write path so omit-on-default
 *  stays in lockstep with normalize-on-read. */
export const RELATION_KEYS = ["parentId", "subtaskIds", "subtaskRank", "collapsed"] as const;

export function readRelationFields(frontmatter: Record<string, unknown>): SubtaskRelationFields {
  return {
    parentId: readNullableString(frontmatter["parentId"]),
    subtaskIds: readStringList(frontmatter["subtaskIds"]),
    subtaskRank: readNullableString(frontmatter["subtaskRank"]),
    collapsed: frontmatter["collapsed"] === true,
  };
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || item.length === 0 || seen.has(item)) continue;
    seen.add(item);
    result.push(item);
  }
  return result;
}
