// ───────────────────────────────────────────────────────────────────
// MODULE:    linked-view-block-aliases.test
// COMPONENT: the permanent backward-compat surface the rename must never break
// ───────────────────────────────────────────────────────────────────
//
// A note written before the rename holds a `note-database` fence and, if it opened a view type
// tab, a `note-database-view` / `note-database-file-view` string in the vault's own
// `workspace.json`. None of the three is ever removed, so this asserts each one keeps resolving
// exactly the way it did the day it was written — including round-tripping the fence byte for
// byte, since a "helpful" upgrade to the new language on every parse/serialise would silently
// rewrite content in someone else's file the first time they moved or edited the block.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { formatLinkedViewFence, parseLinkedViewFence, linkedViewBlockCount } from "./linked-view-block";
import { DATABASE_VIEW_TYPE, LEGACY_DATABASE_VIEW_TYPE } from "../database-view";
import { DATABASE_FILE_VIEW_TYPE, LEGACY_DATABASE_FILE_VIEW_TYPE } from "../database-file-view";

// ───────────────────────────────────────────────────────────────────
// 2. THE CODE-BLOCK LANGUAGE ALIAS
// ───────────────────────────────────────────────────────────────────

describe("the note-database code-block language, aliased forever", () => {
  it("parses a pre-rename fence as language note-database, not the new canonical one", () => {
    const fence = "```note-database\ndbId: abc123\nviewId: v1\n```";

    const parsed = parseLinkedViewFence(fence);

    expect(parsed.language).toBe("note-database");
    expect(parsed.dbId).toBe("abc123");
  });

  it("round-trips a pre-rename fence byte-for-byte rather than upgrading its language", () => {
    const fence = "```note-database\ndbId: abc123\nviewId: v1\n```";

    const roundTripped = formatLinkedViewFence(parseLinkedViewFence(fence));

    expect(roundTripped).toBe(fence);
  });

  it("still counts a note-database fence when scanning a file for linked-view blocks", () => {
    const content = "Some text\n\n```note-database\ndbId: abc123\n```\n\nmore text";

    expect(linkedViewBlockCount(content)).toBe(1);
  });

  it("a brand-new fence still defaults to the new canonical language, not the alias", () => {
    const parsed = parseLinkedViewFence("```obnotion\ndbId: xyz\n```");

    expect(parsed.language).toBe("obnotion");
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. THE VIEW-TYPE ALIASES
// ───────────────────────────────────────────────────────────────────

describe("the view-type strings a pre-rename workspace.json stores", () => {
  it("keeps the exact pre-rename database-view type string available as an alias", () => {
    expect(LEGACY_DATABASE_VIEW_TYPE).toBe("note-database-view");
    expect(LEGACY_DATABASE_VIEW_TYPE).not.toBe(DATABASE_VIEW_TYPE);
  });

  it("keeps the exact pre-rename database-file-view type string available as an alias", () => {
    expect(LEGACY_DATABASE_FILE_VIEW_TYPE).toBe("note-database-file-view");
    expect(LEGACY_DATABASE_FILE_VIEW_TYPE).not.toBe(DATABASE_FILE_VIEW_TYPE);
  });
});
