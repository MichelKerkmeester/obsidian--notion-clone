// ───────────────────────────────────────────────────────────────────
// MODULE:    note-body
// COMPONENT: splits a note into its frontmatter block and its markdown body
// ───────────────────────────────────────────────────────────────────
//
// A record is a note, and the properties the plugin renders are that note's
// frontmatter. Showing the body means separating the two; letting anyone edit
// the body means putting them back together without touching the half that was
// not edited.
//
// The frontmatter is carried as an opaque run of characters rather than parsed
// and re-serialized. Round-tripping through a YAML serializer would rewrite
// comments, key order and quoting style — all of which belong to whoever wrote
// the note, not to this plugin. Keeping the block verbatim makes preservation a
// property of the data structure instead of a property of a serializer's
// fidelity, so `frontmatter + gap + body` reproduces the input exactly.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export interface NoteContentParts {
  /** The frontmatter block including both fences, verbatim. Empty when the note has none. */
  frontmatter: string;
  /** Whatever separates the closing fence from the body — normally one blank line. */
  gap: string;
  /** Everything after the gap, verbatim. */
  body: string;
}

// ───────────────────────────────────────────────────────────────────
// 2. FENCE SCANNING
// ───────────────────────────────────────────────────────────────────

const FENCE = "---";

/**
 * A fence is a line of exactly three dashes, and the whole line.
 *
 * Substring matching is the trap here. Searching for "\n---" also finds `-----`, `---foo` and any
 * other line that merely opens with three dashes, and a longer rule inside a note is ordinary
 * markdown. Accepting one as the closing fence takes a prefix that is not a frontmatter block,
 * and writing a body back after it merges the dashes into the first line of prose.
 */
function isFence(line: string): boolean {
  return line === FENCE || line === FENCE + "\r";
}

/** Index just past the closing fence's line terminator, or -1 when there is no frontmatter. */
function findFrontmatterEnd(content: string): number {
  let lineEnd = content.indexOf("\n");
  // A single line cannot hold both fences, so there is nothing to close.
  if (lineEnd < 0) return -1;
  if (!isFence(content.slice(0, lineEnd))) return -1;
  let cursor = lineEnd + 1;
  while (cursor <= content.length) {
    lineEnd = content.indexOf("\n", cursor);
    const line = lineEnd < 0 ? content.slice(cursor) : content.slice(cursor, lineEnd);
    // A fence on the last line with no terminator still closes the block; there is simply no
    // terminator to take with it.
    if (isFence(line)) return lineEnd < 0 ? content.length : lineEnd + 1;
    if (lineEnd < 0) return -1;
    cursor = lineEnd + 1;
  }
  return -1;
}

// ───────────────────────────────────────────────────────────────────
// 3. SPLIT
// ───────────────────────────────────────────────────────────────────

/**
 * Separate a note into its frontmatter block, the blank run beneath it, and its body.
 *
 * `frontmatter + gap + body` is always the input, unchanged, for every input — including one with
 * no frontmatter, an empty one, and one that only looks like it has some.
 */
export function splitNoteContent(content: string): NoteContentParts {
  const end = findFrontmatterEnd(content);
  if (end < 0) return { frontmatter: "", gap: "", body: content };
  const rest = content.slice(end);
  // Blank lines belong to neither side. Holding them separately means a body rewrite can put back
  // exactly the spacing it found rather than normalising somebody's file on their behalf.
  const gap = /^(?:[ \t]*\r?\n)*/.exec(rest)?.[0] ?? "";
  return { frontmatter: content.slice(0, end), gap, body: rest.slice(gap.length) };
}

// ───────────────────────────────────────────────────────────────────
// 4. COMPOSE
// ───────────────────────────────────────────────────────────────────

/** Whatever the note already uses, so a file written on Windows stays written on Windows. */
function lineEnding(frontmatter: string): string {
  return frontmatter.includes("\r\n") ? "\r\n" : "\n";
}

/**
 * Put a body back under a frontmatter block that never had one.
 *
 * Obsidian's own convention, and this plugin's on the create path, is a blank line between the
 * closing fence and the first line of prose. A fence sitting at end of file without a terminator
 * needs that terminator too, or the body would begin on the fence's own line and break it.
 */
function separatorForFirstBody(frontmatter: string): string {
  const eol = lineEnding(frontmatter);
  return frontmatter.endsWith("\n") ? eol : eol + eol;
}

/**
 * Rebuild a note with a different body, leaving the frontmatter block untouched.
 *
 * Feeding a note's own body back through this returns the note unchanged, byte for byte, which is
 * what makes an edit that changes nothing write nothing.
 */
export function composeNoteContent(parts: NoteContentParts, nextBody: string): string {
  if (parts.frontmatter === "") return nextBody;
  if (parts.gap !== "" || parts.body !== "") return parts.frontmatter + parts.gap + nextBody;
  if (nextBody === "") return parts.frontmatter;
  return parts.frontmatter + separatorForFirstBody(parts.frontmatter) + nextBody;
}
