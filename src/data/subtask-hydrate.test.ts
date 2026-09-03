// ───────────────────────────────────────────────────────────────────
// MODULE:    subtask-hydrate.test
// COMPONENT: frontmatter relation-field read/write contract — sanitized read,
//            lossless round-trip, non-mutating write
// ───────────────────────────────────────────────────────────────────
//
// Frontmatter is untrusted note data: a parentId that is not a non-empty
// string, ids that are not strings, duplicates, and non-boolean collapse
// flags are all normalized rather than propagated. The write path must
// return a new object so the caller's metadata-cache frontmatter is never
// aliased by an edit, and absent-vs-default must round-trip with no loss:
// a null parent, an empty child list and a missing rank all mean the same
// thing before and after a write.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & FIXTURES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { readRelationFields } from "./subtask-hydrate";
import { writeRelationFields } from "./subtask-serialize";

// ───────────────────────────────────────────────────────────────────
// 2. READ (SANITIZATION)
// ───────────────────────────────────────────────────────────────────

describe("readRelationFields", () => {
  it("reads all four fields from a well-formed frontmatter block", () => {
    expect(readRelationFields({
      parentId: "parent.md",
      subtaskIds: ["b.md", "c.md"],
      subtaskRank: "V",
      collapsed: true,
      unrelated: 1,
    })).toEqual({
      parentId: "parent.md",
      subtaskIds: ["b.md", "c.md"],
      subtaskRank: "V",
      collapsed: true,
    });
  });

  it("defaults every field when the keys are absent", () => {
    expect(readRelationFields({})).toEqual({
      parentId: null,
      subtaskIds: [],
      subtaskRank: null,
      collapsed: false,
    });
  });

  it("normalizes non-string parentId and empty strings to null", () => {
    for (const bad of [42, true, [], {}, ""]) {
      expect(readRelationFields({ parentId: bad }).parentId).toBeNull();
    }
  });

  it("drops non-string ids, empty strings and duplicates from subtaskIds, keeping first occurrence order", () => {
    expect(readRelationFields({ subtaskIds: ["b.md", 7, "", "b.md", "c.md", null] }).subtaskIds)
      .toEqual(["b.md", "c.md"]);
  });

  it("treats a non-string rank as absent", () => {
    expect(readRelationFields({ subtaskRank: 12 }).subtaskRank).toBeNull();
  });

  it("reads collapsed only when exactly true", () => {
    expect(readRelationFields({ collapsed: true }).collapsed).toBe(true);
    expect(readRelationFields({ collapsed: "yes" }).collapsed).toBe(false);
    expect(readRelationFields({ collapsed: 1 }).collapsed).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. WRITE (SERIALIZATION)
// ───────────────────────────────────────────────────────────────────

describe("writeRelationFields", () => {
  it("writes non-default fields and preserves unrelated keys", () => {
    const out = writeRelationFields({ title: "Keep", other: [1, 2] }, {
      parentId: "parent.md",
      subtaskIds: ["b.md", "c.md"],
      subtaskRank: "V",
      collapsed: true,
    });

    expect(out).toEqual({
      title: "Keep",
      other: [1, 2],
      parentId: "parent.md",
      subtaskIds: ["b.md", "c.md"],
      subtaskRank: "V",
      collapsed: true,
    });
  });

  it("omits default-valued keys instead of writing them", () => {
    expect(writeRelationFields({ title: "Keep" }, {
      parentId: null,
      subtaskIds: [],
      subtaskRank: null,
      collapsed: false,
    })).toEqual({ title: "Keep" });
  });

  it("returns a new object and never mutates the input frontmatter", () => {
    const input = { title: "Keep", parentId: "parent.md", subtaskIds: ["b.md"] };
    Object.freeze(input);

    const out = writeRelationFields(input, { parentId: null });
    expect(out).not.toBe(input);
    expect(input).toEqual({ title: "Keep", parentId: "parent.md", subtaskIds: ["b.md"] });
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. ROUND-TRIP
// ───────────────────────────────────────────────────────────────────

describe("relation field round-trip", () => {
  it.each([
    {
      name: "full tree node",
      frontmatter: {
        title: "T",
        parentId: "parent.md",
        subtaskIds: ["b.md", "c.md"],
        subtaskRank: "V",
        collapsed: true,
      },
    },
    {
      name: "root with children",
      frontmatter: { title: "T", subtaskIds: ["b.md"] },
    },
    {
      name: "bare root",
      frontmatter: { title: "T" },
    },
    {
      name: "explicit nulls and empty list",
      frontmatter: { title: "T", parentId: null, subtaskIds: [], subtaskRank: null, collapsed: false },
    },
  ])("reads, writes and re-reads $name with no field loss", ({ frontmatter }) => {
    const fields = readRelationFields(frontmatter);
    const written = writeRelationFields({ ...frontmatter }, fields);

    expect(readRelationFields(written)).toEqual(fields);
    expect(written.title).toBe("T");
  });
});
