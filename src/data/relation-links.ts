// ───────────────────────────────────────────────────────────────────
// MODULE:    relation-links
// COMPONENT: parses a stored relation value into a wikilink target/alias
// ───────────────────────────────────────────────────────────────────
//
// The target is taken before any `#` subpath (heading/block ref) so a link
// into a specific section of a note still resolves to that note's file for
// relation matching — a relation compares whole notes, not note sections.

// ───────────────────────────────────────────────────────────────────
// 1. PARSE
// ───────────────────────────────────────────────────────────────────

export interface ParsedRelationLink {
  raw: string;
  target: string;
  alias?: string;
}

const WIKILINK_PATTERN = /^\s*\[\[([\s\S]+?)\]\]\s*$/;

export function parseRelationLink(value: unknown): ParsedRelationLink | null {
  if (typeof value !== "string") return null;
  const match = value.match(WIKILINK_PATTERN);
  if (!match) return null;
  const body = match[1].trim();
  if (!body) return null;
  const separator = body.indexOf("|");
  const targetWithSubpath = (separator >= 0 ? body.slice(0, separator) : body).trim();
  const target = targetWithSubpath.split("#", 1)[0].trim();
  if (!target) return null;
  const alias = separator >= 0 ? body.slice(separator + 1).trim() : undefined;
  return { raw: value, target, alias: alias || undefined };
}

export function parseRelationValues(value: unknown): ParsedRelationLink[] {
  const values = Array.isArray(value) ? value : value == null || value === "" ? [] : [value];
  return values.map(parseRelationLink).filter((link): link is ParsedRelationLink => link != null);
}

/** Text shown for a Relation link across cells, groups, and width measurement. */
export function getRelationDisplayLabel(link: ParsedRelationLink, fallback = link.target): string {
  return link.alias || link.target.split("/").pop() || fallback;
}
