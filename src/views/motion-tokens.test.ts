// ───────────────────────────────────────────────────────────────────
// MODULE:    motion-tokens
// COMPONENT: census of the named `--db-motion-*` duration/easing tokens
// ───────────────────────────────────────────────────────────────────
//
// Reads the shipped stylesheet the way `mobile-table-and-panel-ux.test.ts` does, because the
// fact under test is a property of the file the plugin ships, not of a rendered surface. Before
// this change none of the four counts below existed as tokens at all: every duration this suite
// pins was a hand-typed literal, repeated at every call site that needed it.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   Asserting on the shipped stylesheet means reading it from disk, which needs the node builtins
   the plugin runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const stylesContent = readFileSync(resolve(__dirname, "../../styles.css"), "utf-8");

/** `transition:` declaration lines, comments removed, so a prose mention of a duration never counts. */
const transitionDeclarationLines = (): string[] =>
  stylesContent
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((line) => /^\s*transition:/.test(line));

// ───────────────────────────────────────────────────────────────────
// 2. CENSUS
// ───────────────────────────────────────────────────────────────────

describe("motion tokens", () => {
  it("declares all five named tokens beside the established --db-transition-fast", () => {
    expect(stylesContent).toContain("--db-motion-fast: var(--db-transition-fast);");
    expect(stylesContent).toContain("--db-motion-surface: 200ms ease-out;");
    expect(stylesContent).toContain("--db-motion-sheet: var(--db-sheet-enter) ease-out;");
    expect(stylesContent).toContain("--db-motion-emphatic: 1.1s ease-in-out infinite;");
    expect(stylesContent).toContain("--db-motion-scale-from: 0.98;");
  });

  it("migrates every plain-ease 120ms transition to the fast token, leaving no plain-ease literal behind", () => {
    const plainEase = transitionDeclarationLines().filter((line) => /\b120ms ease\b(?!-out)/.test(line));
    expect(plainEase).toEqual([]);
  });

  it("keeps exactly the four 120ms ease-out declarations untouched — a directional entrance curve the fast token does not carry", () => {
    // db-overlay-enter's popover entrance and three ease-out hover transitions predate this
    // change and stay literal on purpose: --db-motion-fast resolves to plain `ease`, and
    // substituting it here would silently swap their curve rather than only naming it.
    const easeOut = transitionDeclarationLines().filter((line) => /\b120ms ease-out\b/.test(line));
    expect(easeOut).toHaveLength(4);
  });

  it("retires every 180ms surface literal in favour of the measured 200ms token", () => {
    expect(stylesContent.replace(/\/\*[\s\S]*?\*\//g, "")).not.toMatch(/\b180ms\b/);
  });

  it("routes the skeleton shimmer's loop through the emphatic token instead of a hand-typed duration", () => {
    expect(stylesContent).toContain("animation: db-skeleton-shimmer var(--db-motion-emphatic);");
  });

  it("routes the popover entrance's scale through the shared token so it cannot drift from the toast's", () => {
    expect(stylesContent).toContain("scale(var(--db-motion-scale-from))");
  });

  it("leaves the five existing --db-transition-fast call sites unchanged, at their own declaration lines", () => {
    // Counted by declaration line, not by substring occurrence: several of the five lines name
    // the token more than once (one property per comma-separated transition), so a raw substring
    // count reads far higher than the number of call sites the true-up measured. Two of the
    // original seven lived on the board's retired extensions-mode column and card hover-lift
    // rules and were removed with that dead markup, not edited in place.
    const callSites = transitionDeclarationLines().filter((line) => line.includes("var(--db-transition-fast)"));
    expect(callSites).toHaveLength(5);
  });
});
