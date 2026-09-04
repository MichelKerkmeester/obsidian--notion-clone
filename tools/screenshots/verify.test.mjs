// ───────────────────────────────────────────────────────────────────
// MODULE:    verify.test
// COMPONENT: coverage for the staleness gate's vendor/repo classification
// ───────────────────────────────────────────────────────────────────
//
// The Gates "Capture staleness" step (npm run screenshots:verify) failed on every push once
// the project-manager reference group's sourceHashes started naming files under
// specs/context/ — gitignored on purpose, so a fresh checkout (CI, or any clone that never
// vendored the comparison plugin) never has them and every one of those sources reported
// MISSING SOURCE. classifySource() is the fix: it tells "the repo is broken" apart from
// "this checkout was never going to have this file" by asking git's own ignore rules,
// which is the one thing that already knows the difference.
//
// This suite is deliberately red-first: before verify.mjs exported classifySource() and
// isGitIgnored(), this import failed outright. Both cases below are what a regression here
// would break — the injectable branch logic, and the real .gitignore rule it depends on.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { classifySource, isGitIgnored } from "./verify.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. CLASSIFYSOURCE — the injectable branch logic
// ───────────────────────────────────────────────────────────────────

describe("classifySource", () => {
  it("reports a source as present when it can be read, carrying its current hash", () => {
    const result = classifySource("anything.ts", {
      readHash: () => "abc123",
      checkIgnored: () => {
        throw new Error("must not consult git when the file was read successfully");
      },
    });
    expect(result).toEqual({ status: "present", hash: "abc123" });
  });

  it("reports a missing, git-tracked source as a real break", () => {
    const result = classifySource("src/still-tracked.ts", {
      readHash: () => null,
      checkIgnored: () => false,
    });
    expect(result).toEqual({ status: "missing" });
  });

  it("reports a missing, git-ignored source as vendor-unavailable rather than missing", () => {
    const result = classifySource("specs/context/obsidian-pm-main/src/views/KanbanView.ts", {
      readHash: () => null,
      checkIgnored: () => true,
    });
    expect(result).toEqual({ status: "vendor-unavailable" });
  });

  it("fails closed to missing when it cannot ask git at all", () => {
    // isGitIgnored() itself never throws (it catches internally), but classifySource()'s
    // contract is that any checkIgnored() answer other than true keeps the source a real
    // MISSING SOURCE — the fail-closed default the check already had.
    const result = classifySource("unreadable-path", {
      readHash: () => null,
      checkIgnored: () => false,
    });
    expect(result.status).toBe("missing");
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. ISGITIGNORED — the real .gitignore rule this fix depends on
// ───────────────────────────────────────────────────────────────────

describe("isGitIgnored", () => {
  it("confirms the vendored reference plugin's tree is git-ignored", () => {
    // This is the exact path class that broke Gates: the reference-capture group's
    // sourceHashes name files here, and this repo's .gitignore (`specs/**/context/`)
    // disowns all of them on purpose.
    expect(isGitIgnored("specs/context/obsidian-pm-main/src/views/KanbanView.ts")).toBe(true);
    expect(isGitIgnored("specs/context/obsidian-pm-main/src/styles/variables.css")).toBe(true);
  });

  it("does not call a normal tracked source git-ignored", () => {
    expect(isGitIgnored("tools/screenshots/verify.mjs")).toBe(false);
    expect(isGitIgnored("package.json")).toBe(false);
  });
});
