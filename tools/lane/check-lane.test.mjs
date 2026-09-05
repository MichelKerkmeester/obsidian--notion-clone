// ───────────────────────────────────────────────────────────────────
// MODULE:    check-lane.test
// COMPONENT: the release that named nothing, and the one that named everything
// ───────────────────────────────────────────────────────────────────
//
// The lane's release refusal has to be demonstrated in both directions or it is not a
// rule: one that only ever refuses is one nobody can satisfy, and one that only ever
// passes is not a rule at all.
//
// The refusal itself is a pure decision over two inputs — what git says changed, and
// what the newest history entry says it reviewed — so it is drivable here without a
// repository, the same separation the live probe's exit codes already use.
//
// The cases that matter most are the ones that could plausibly be miscoded as a pass:
// a release carrying no `reviewed` key at all, and an entry that is not the release
// this rule is about.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import {
  changedCaptures,
  contentChangedCaptures,
  inScopeCaptures,
  isContentChange,
  reviewVerdict,
} from "./check-lane.mjs";

const BOARD = "screenshots/views/board-view-desktop-light.png";
const TIMELINE = "screenshots/views/timeline-view-desktop-dark.png";
const ANYTYPE = "screenshots/anytype/anytype-travel-itinerary-graph-light.png";
const IN_SCOPE_ROOTS = ["screenshots/notion-clone/", "screenshots/project-manager/"];

/** A release sitting on the stylesheet in the tree — the only entry whose review is still owed. */
function laneReleasing(reviewed) {
  const entry = { event: "release", phase: "visual-pass", at: "2026-09-02T07:40:00Z", hash: "92022f8399f1" };
  if (reviewed) entry.reviewed = reviewed;
  return { baselineHash: "92022f8399f1", history: [{ event: "acquire", hash: "aaaabbbbcccc" }, entry] };
}

// ───────────────────────────────────────────────────────────────────
// 2. WHAT GIT SAYS A RELEASE IS ABOUT TO COMMIT
// ───────────────────────────────────────────────────────────────────

describe("the changed set is the images, read from git", () => {
  it("counts a rewritten capture and one that did not exist before", () => {
    // Untracked matters more than modified, not less: a new surface arriving unlooked-at
    // is the likelier of the two, and reading only ` M` would let it through.
    const changed = changedCaptures(` M ${BOARD}\n?? ${TIMELINE}\n`);
    expect(changed).toEqual([BOARD, TIMELINE]);
  });

  it("ignores the manifest and the folder README, which no reviewer opens", () => {
    // Both move on every capture run. Counting them would let a release satisfy the rule
    // by naming files that carry nothing to look at.
    const changed = changedCaptures(` M screenshots/manifest.json\n M screenshots/README.md\n M ${BOARD}\n`);
    expect(changed).toEqual([BOARD]);
  });

  it("does not count a clean rename — a capture-root move — as a change owed a review", () => {
    // `git mv` with the bytes untouched reports status `R ` (no `M`), e.g. moving every capture
    // from screenshots/<group>/ to screenshots/notion-clone/<group>/ in one commit. Only a rename
    // that also edits the file (`RM`) should count.
    const renamedOnly = `R  screenshots/views/board-view-desktop-light.png -> screenshots/notion-clone/views/board-view-desktop-light.png\n`;
    expect(changedCaptures(renamedOnly)).toEqual([]);
  });

  it("counts a rename that also edited the file", () => {
    const renamedAndEdited = `RM screenshots/views/board-view-desktop-light.png -> screenshots/notion-clone/views/board-view-desktop-light.png\n`;
    expect(changedCaptures(renamedAndEdited)).toEqual([
      "screenshots/notion-clone/views/board-view-desktop-light.png",
    ]);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. A MOVED CAPTURE IS NOT EVIDENCE OF CHANGE
// ───────────────────────────────────────────────────────────────────

describe("isContentChange tells a byte move from a repaint", () => {
  it("is unchanged when pixelHash agrees before and after, even though git saw a move", () => {
    const before = { file: BOARD, pixelHash: "abc123abc123", layoutHash: "layout1" };
    const after = { file: BOARD, pixelHash: "abc123abc123", layoutHash: "layout9" };
    expect(isContentChange("M", after, before)).toBe(false);
  });

  it("is changed when pixelHash disagrees", () => {
    const before = { file: BOARD, pixelHash: "abc123abc123" };
    const after = { file: BOARD, pixelHash: "def456def456" };
    expect(isContentChange("M", after, before)).toBe(true);
  });

  it("falls back to layoutHash for an entry captured before pixelHash existed", () => {
    const before = { file: BOARD, layoutHash: "layout1" };
    const after = { file: BOARD, layoutHash: "layout1" };
    expect(isContentChange("M", after, before)).toBe(false);
  });

  it("falls back to layoutHash-vs-layoutHash, never pixelHash-vs-layoutHash, across the commit that introduced pixelHash", () => {
    // The "before" manifest predates this phase and carries no pixelHash at all; the "after"
    // manifest carries both. Comparing after.pixelHash to before.layoutHash would read every
    // capture as changed on the introducing commit, which is exactly the false-positive this
    // comparator exists to prevent.
    const before = { file: BOARD, layoutHash: "layout1" };
    const after = { file: BOARD, pixelHash: "pixel1", layoutHash: "layout1" };
    expect(isContentChange("M", after, before)).toBe(false);
  });

  it("is always changed for an untracked (new) capture — nothing to compare against", () => {
    expect(isContentChange("??", { file: BOARD, pixelHash: "x" }, null)).toBe(true);
  });

  it("is changed, conservatively, when neither side carries a comparable hash", () => {
    expect(isContentChange("M", { file: BOARD }, { file: BOARD })).toBe(true);
  });

  it("is changed when only the previous manifest is missing the entry", () => {
    expect(isContentChange("M", { file: BOARD, pixelHash: "x" }, null)).toBe(true);
  });
});

describe("contentChangedCaptures drops a git-reported move that changed no pixel", () => {
  const manifestOf = (entries) => ({ scenarios: entries });

  it("excludes a capture whose pixelHash is identical before and after", () => {
    const porcelain = ` M ${BOARD}\n M ${TIMELINE}\n`;
    const previous = manifestOf([
      { file: BOARD, pixelHash: "same-hash-1" },
      { file: TIMELINE, pixelHash: "old-hash-2" },
    ]);
    const current = manifestOf([
      { file: BOARD, pixelHash: "same-hash-1" },
      { file: TIMELINE, pixelHash: "new-hash-2" },
    ]);
    expect(contentChangedCaptures(porcelain, current, previous)).toEqual([TIMELINE]);
  });

  it("keeps an untracked capture even with no previous manifest at all", () => {
    const porcelain = `?? ${BOARD}\n`;
    expect(contentChangedCaptures(porcelain, manifestOf([{ file: BOARD, pixelHash: "x" }]), null))
      .toEqual([BOARD]);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE RELEASE THAT DID NOT LOOK
// ───────────────────────────────────────────────────────────────────

describe("a release must name every capture it moved", () => {
  it("refuses, and lists the file, when the release names nothing", () => {
    const verdict = reviewVerdict(laneReleasing(null), [BOARD]);
    expect(verdict.exit).toBe(1);
    expect(verdict.err.join("\n")).toContain("1 changed capture(s) this release does not name");
    expect(verdict.err.join("\n")).toContain(BOARD);
    expect(verdict.err.join("\n")).toContain("carries no reviewed list at all");
  });

  it("refuses the capture the release left out while naming the other", () => {
    const verdict = reviewVerdict(laneReleasing([BOARD]), [BOARD, TIMELINE]);
    expect(verdict.exit).toBe(1);
    expect(verdict.err.join("\n")).toContain(TIMELINE);
    expect(verdict.err.join("\n")).not.toContain(`  ${BOARD}`);
  });

  it("passes when the release names every changed capture", () => {
    const verdict = reviewVerdict(laneReleasing([BOARD, TIMELINE]), [BOARD, TIMELINE]);
    expect(verdict.exit).toBe(0);
    expect(verdict.out.join("\n")).toContain("names all 2 changed capture(s)");
  });

  it("passes a release that named nothing and moved nothing", () => {
    expect(reviewVerdict(laneReleasing(null), []).exit).toBe(0);
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. THE ENTRIES THIS RULE IS NOT ABOUT
// ───────────────────────────────────────────────────────────────────

describe("only the newest release, and only on the current stylesheet", () => {
  it("says nothing about a lane that is currently held", () => {
    // Mid-edit, the captures are expected to be moving and no review is owed yet.
    const lane = { baselineHash: "92022f8399f1", history: [{ event: "acquire", phase: "visual-pass", hash: "92022f8399f1" }] };
    expect(reviewVerdict(lane, [BOARD]).exit).toBe(0);
  });

  it("grandfathers a release recorded against an older stylesheet", () => {
    // Back-filling `reviewed` onto releases whose reviews nobody did would manufacture
    // exactly the evidence this rule exists to require.
    const lane = laneReleasing(null);
    lane.baselineHash = "ffff11112222";
    expect(reviewVerdict(lane, [BOARD]).exit).toBe(0);
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. A REFERENCE PHOTOGRAPH IS NOT A CAPTURE OF OUR STYLESHEET
// ───────────────────────────────────────────────────────────────────

describe("inScopeCaptures narrows the changed set to our own renders", () => {
  it("drops a competitor reference photograph the allowlist does not name", () => {
    expect(inScopeCaptures([ANYTYPE], IN_SCOPE_ROOTS)).toEqual([]);
  });

  it("keeps a capture under an allowlisted root", () => {
    const notionClone = "screenshots/notion-clone/views/board-view-desktop-light.png";
    const projectManager = "screenshots/project-manager/reference-kanban-desktop-dark.png";
    expect(inScopeCaptures([notionClone, projectManager], IN_SCOPE_ROOTS)).toEqual([
      notionClone,
      projectManager,
    ]);
  });

  it("keeps everything when the config carries no allowlist — narrowing scope is opt-in, not silent", () => {
    expect(inScopeCaptures([ANYTYPE, BOARD], undefined)).toEqual([ANYTYPE, BOARD]);
    expect(inScopeCaptures([ANYTYPE, BOARD], [])).toEqual([ANYTYPE, BOARD]);
  });

  it("sorts nothing and drops nothing that already matches — order and duplicates pass through", () => {
    const notionClone = "screenshots/notion-clone/views/board-view-desktop-light.png";
    expect(inScopeCaptures([ANYTYPE, notionClone, ANYTYPE], IN_SCOPE_ROOTS)).toEqual([notionClone]);
  });
});

describe("a competitor reference photograph never forces a release to name it", () => {
  it("before scoping, an unreviewed anytype capture fails the release the same as any other", () => {
    // Demonstrates the bug this scope fix closes: with no root filter applied, the review
    // gate cannot tell a photograph of a different application from a capture of our own —
    // it refuses on the unnamed file exactly as it would for a real regression.
    const verdict = reviewVerdict(laneReleasing(null), [ANYTYPE]);
    expect(verdict.exit).toBe(1);
    expect(verdict.err.join("\n")).toContain(ANYTYPE);
  });

  it("after scoping, the same anytype capture never reaches the review gate at all", () => {
    const scoped = inScopeCaptures([ANYTYPE], IN_SCOPE_ROOTS);
    const verdict = reviewVerdict(laneReleasing(null), scoped);
    expect(verdict.exit).toBe(0);
  });

  it("scoping never hides a real regression: an unreviewed notion-clone capture still fails", () => {
    const notionClone = "screenshots/notion-clone/views/board-view-desktop-light.png";
    const scoped = inScopeCaptures([ANYTYPE, notionClone], IN_SCOPE_ROOTS);
    const verdict = reviewVerdict(laneReleasing(null), scoped);
    expect(verdict.exit).toBe(1);
    expect(verdict.err.join("\n")).toContain(notionClone);
    expect(verdict.err.join("\n")).not.toContain(ANYTYPE);
  });
});
