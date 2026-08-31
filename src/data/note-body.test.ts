// ───────────────────────────────────────────────────────────────────
// MODULE:    note-body.test
// COMPONENT: the frontmatter a body write must not touch
// ───────────────────────────────────────────────────────────────────
//
// Editing a body rewrites the whole file, frontmatter included. The only thing
// standing between that and a damaged note is the split being the exact inverse
// of the join, so these are byte-equality assertions rather than shape checks.
//
// The fixtures that matter are the ones the plugin did not author: comments,
// unusual key order, a key it has no schema for, CRLF from another editor, and
// a `---` line inside the body. Frontmatter this plugin wrote itself round-trips
// trivially, because the same serializer is on both ends, and proves nothing.
//
// Pure string logic, so it runs in this project's node environment with no DOM.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & FIXTURES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { composeNoteContent, splitNoteContent } from "./note-body";

/** A well-formed block opens with a `---` line and closes with one, terminator included. */
const WELL_FORMED_BLOCK = /^---\r?\n[\s\S]*\r?\n---\r?\n$/;

const FIXTURES: Record<string, string> = {
  plain: "---\ntitle: A\nkeep: [1, 2]\n---\n\n# Heading\n\nBody text.\n",
  noFrontmatter: "# Just a note\n\nNo properties here.\n",
  frontmatterOnly: "---\ntitle: A\n---\n",
  emptyBodyWithGap: "---\ntitle: A\n---\n\n",
  crlf: "---\r\ntitle: A\r\n---\r\n\r\nBody line.\r\n",
  ruleInsideBody: "---\ntitle: A\n---\n\nBefore\n\n---\n\nAfter\n",
  unicode: "---\ntitle: 标题\n---\n\n# 中文标题\n\n正文 — em dash, emoji 🎯\n",
  noTrailingNewline: "---\ntitle: A\n---\n\nLast line without a newline",
  extraBlankLines: "---\ntitle: A\n---\n\n\n\nBody after three blank lines\n",
  foreignFrontmatter:
    "---\n# a comment this plugin never writes\nzeta: last\nalpha: first\nno-schema-for-this: { nested: true }\n---\n\nBody.\n",
  emptyFile: "",
  bodyOnlyNoNewline: "one line",
};

/** Opens with dashes but the first line is not a fence, so there is no frontmatter to find. */
const FOUR_DASH_OPENER = "----\ntitle: A\n---\n\nBody\n";
/** Opens with a fence that never closes on a `---` line of its own. */
const LONGER_CLOSING_RULE = "---\ntitle: A\n-----\n\nBody\n";
const NEVER_CLOSED = "---\ntitle: A\n\nBody with no closing fence\n";

// ───────────────────────────────────────────────────────────────────
// 2. THE SPLIT IS TOTAL
// ───────────────────────────────────────────────────────────────────

describe("splitNoteContent", () => {
  it.each(Object.keys(FIXTURES))("reassembles %s byte for byte", (name) => {
    const content = FIXTURES[name];
    const parts = splitNoteContent(content);
    expect(parts.frontmatter + parts.gap + parts.body).toBe(content);
  });

  it.each(Object.keys(FIXTURES))("returns a well-formed frontmatter block for %s", (name) => {
    const { frontmatter } = splitNoteContent(FIXTURES[name]);
    if (frontmatter === "") return;
    expect(frontmatter).toMatch(WELL_FORMED_BLOCK);
  });

  it("keeps a body-level rule in the body", () => {
    const parts = splitNoteContent(FIXTURES.ruleInsideBody);
    expect(parts.frontmatter).toBe("---\ntitle: A\n---\n");
    expect(parts.body).toBe("Before\n\n---\n\nAfter\n");
  });

  it("carries the closing fence's own line terminator", () => {
    expect(splitNoteContent(FIXTURES.plain).frontmatter).toBe("---\ntitle: A\nkeep: [1, 2]\n---\n");
    expect(splitNoteContent(FIXTURES.crlf).frontmatter).toBe("---\r\ntitle: A\r\n---\r\n");
  });

  it("preserves every blank line between the fence and the body", () => {
    const parts = splitNoteContent(FIXTURES.extraBlankLines);
    expect(parts.gap).toBe("\n\n\n");
    expect(parts.body).toBe("Body after three blank lines\n");
  });

  it("finds no frontmatter when the opening line is not a fence", () => {
    const parts = splitNoteContent(FOUR_DASH_OPENER);
    expect(parts.frontmatter).toBe("");
    expect(parts.body).toBe(FOUR_DASH_OPENER);
  });

  it("finds no frontmatter when no line is exactly a closing fence", () => {
    for (const content of [LONGER_CLOSING_RULE, NEVER_CLOSED]) {
      const parts = splitNoteContent(content);
      expect(parts.frontmatter).toBe("");
      expect(parts.body).toBe(content);
    }
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. THE JOIN IS THE SPLIT'S INVERSE
// ───────────────────────────────────────────────────────────────────

describe("composeNoteContent", () => {
  it.each(Object.keys(FIXTURES))("rewriting %s with its own body changes nothing", (name) => {
    const content = FIXTURES[name];
    const parts = splitNoteContent(content);
    expect(composeNoteContent(parts, parts.body)).toBe(content);
  });

  it.each(Object.keys(FIXTURES))("leaves %s's frontmatter untouched by a new body", (name) => {
    const content = FIXTURES[name];
    const before = splitNoteContent(content);
    const rewritten = composeNoteContent(before, "REPLACED BODY\n");
    expect(rewritten.startsWith(before.frontmatter)).toBe(true);
    const after = splitNoteContent(rewritten);
    expect(after.frontmatter).toBe(before.frontmatter);
    expect(after.body).toBe("REPLACED BODY\n");
    if (after.frontmatter !== "") expect(after.frontmatter).toMatch(WELL_FORMED_BLOCK);
  });

  // The blank line under the fence is kept rather than trimmed. Tidying it away would mean a note
  // whose body is cleared and retyped does not come back to the shape its author left it in.
  it("clearing the body leaves the frontmatter and its blank line, and no prose", () => {
    const parts = splitNoteContent(FIXTURES.foreignFrontmatter);
    const cleared = composeNoteContent(parts, "");
    expect(cleared).toBe(parts.frontmatter + parts.gap);
    expect(splitNoteContent(cleared).body).toBe("");
    expect(splitNoteContent(cleared).frontmatter).toBe(parts.frontmatter);
  });

  it("tolerates a closing fence at end of file with no terminator", () => {
    const content = "---\ntitle: A\n---";
    const parts = splitNoteContent(content);
    expect(parts.frontmatter).toBe(content);
    expect(parts.gap).toBe("");
    expect(parts.body).toBe("");
    expect(composeNoteContent(parts, parts.body)).toBe(content);
    expect(composeNoteContent(parts, "Body\n")).toBe("---\ntitle: A\n---\n\nBody\n");
  });

  it("separates the first body from the fence on a note that had none", () => {
    const parts = splitNoteContent(FIXTURES.frontmatterOnly);
    expect(composeNoteContent(parts, "First words.\n")).toBe(
      "---\ntitle: A\n---\n\nFirst words.\n",
    );
  });

  it("uses the note's own line ending when it separates the first body", () => {
    const parts = splitNoteContent("---\r\ntitle: A\r\n---\r\n");
    expect(composeNoteContent(parts, "First words.\r\n")).toBe(
      "---\r\ntitle: A\r\n---\r\n\r\nFirst words.\r\n",
    );
  });

  it("adds no fence to a note that never had frontmatter", () => {
    const parts = splitNoteContent(FIXTURES.noFrontmatter);
    expect(composeNoteContent(parts, "new text")).toBe("new text");
  });
});
