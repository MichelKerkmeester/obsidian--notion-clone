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

import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
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
    // disowns all of them on purpose. In every worktree this program creates, specs/context
    // is itself a symlink (back to the main checkout's own specs/context), which is exactly
    // the case a naive `git check-ignore` call cannot see through — see the symlink describe
    // block below for the isolated regression coverage of that specific failure mode.
    expect(isGitIgnored("specs/context/obsidian-pm-main/src/views/KanbanView.ts")).toBe(true);
    expect(isGitIgnored("specs/context/obsidian-pm-main/src/styles/variables.css")).toBe(true);
  });

  it("does not call a normal tracked source git-ignored", () => {
    expect(isGitIgnored("tools/screenshots/verify.mjs")).toBe(false);
    expect(isGitIgnored("package.json")).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. ISGITIGNORED ACROSS A SYMLINK — the failure a plain git check-ignore call cannot see
// ───────────────────────────────────────────────────────────────────
//
// git itself refuses to reason about a directory-only ignore rule against a path that crosses
// a symlink: naming anything beyond the link is a hard "fatal: pathspec ... is beyond a
// symbolic link" (git check-ignore -q -- specs/context/foo.css), and naming the link itself
// doesn't crash but doesn't tell the truth either — git classifies a path's directory-ness
// from its own lstat type, and a symlink's type is never "directory", so a trailing-slash
// rule silently never matches it (git check-ignore -q -- specs/context, no trailing slash,
// exits 1 as "not ignored" even though the .gitignore rule was written to disown exactly
// this). This is what turned "every worktree with the symlink present" red while "a clean
// checkout with no specs/context at all" stayed green: the real project's tests above only
// exercise the *real* worktree, which git happens to answer correctly for as long as the
// vendored file is physically present (see the "present" branch in classifySource) — the bug
// is only visible once the source is missing behind the symlink, which this synthetic repo
// forces without needing to delete anything from the real vendored tree.

describe("isGitIgnored across a symlinked ancestor", () => {
  let scratchRoot;

  afterEach(() => {
    if (scratchRoot) {
      rmSync(scratchRoot, { recursive: true, force: true });
      scratchRoot = undefined;
    }
  });

  it("classifies a path beneath a symlinked, gitignored directory as ignored", () => {
    scratchRoot = mkdtempSync(join(tmpdir(), "verify-symlink-repo-"));
    const repoDir = join(scratchRoot, "repo");
    // "pointing outside": the symlink's target lives entirely outside this synthetic repo,
    // and outside any git repository at all — the case a fix that merely re-resolves the
    // symlink into another git worktree would not cover.
    const vendorDir = join(scratchRoot, "vendor-outside-any-repo");

    mkdirSync(join(vendorDir, "sub"), { recursive: true });
    writeFileSync(join(vendorDir, "sub", "file.css"), "body { color: red; }\n");

    mkdirSync(join(repoDir, "specs"), { recursive: true });
    writeFileSync(join(repoDir, ".gitignore"), "specs/**/context/\n");
    execFileSync("git", ["-c", "core.excludesFile=/dev/null", "init", "-q"], { cwd: repoDir });
    symlinkSync(vendorDir, join(repoDir, "specs", "context"));

    expect(isGitIgnored("specs/context/sub/file.css", { repoRoot: repoDir })).toBe(true);
  });

  it("still reports a real MISSING SOURCE when the symlinked path is not covered by any rule", () => {
    scratchRoot = mkdtempSync(join(tmpdir(), "verify-symlink-repo-"));
    const repoDir = join(scratchRoot, "repo");
    const vendorDir = join(scratchRoot, "vendor-outside-any-repo");

    mkdirSync(join(vendorDir, "sub"), { recursive: true });
    writeFileSync(join(vendorDir, "sub", "file.css"), "body { color: red; }\n");

    mkdirSync(join(repoDir, "specs"), { recursive: true });
    // Deliberately no .gitignore rule for "elsewhere/" — a symlinked ancestor is not, by
    // itself, a reason to call something ignored.
    writeFileSync(join(repoDir, ".gitignore"), "specs/**/context/\n");
    execFileSync("git", ["-c", "core.excludesFile=/dev/null", "init", "-q"], { cwd: repoDir });
    symlinkSync(vendorDir, join(repoDir, "specs", "elsewhere"));

    expect(isGitIgnored("specs/elsewhere/sub/file.css", { repoRoot: repoDir })).toBe(false);
  });
});
