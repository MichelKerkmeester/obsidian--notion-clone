// ───────────────────────────────────────────────────────────────────
// MODULE:    changelog-version-drift
// COMPONENT: keeps the release-notes modal from announcing a stale version
// ───────────────────────────────────────────────────────────────────
//
// The modal takes its title from the manifest but rendered a body string that
// carried its own hardcoded version. Those two drifted three releases apart —
// a 1.3.1 title above notes headed "What's new in 1.2.8" — and nothing failed,
// because nothing compared them.
//
// The version is now interpolated. This asserts that it stays that way in
// every locale, which is the only part a future release can get wrong: bumping
// the manifest is routine, remembering to edit three translation strings is
// not.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading the shipped source from disk needs the node builtins the plugin runtime rule forbids.
   Scoped to this suite, which never ships. */

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

// ───────────────────────────────────────────────────────────────────
// 2. SETUP
// ───────────────────────────────────────────────────────────────────

const i18nSource = readFileSync(resolve(__dirname, "./i18n.ts"), "utf-8");
const mainSource = readFileSync(resolve(__dirname, "./main.ts"), "utf-8");

const releaseNotes = i18nSource
  .split("\n")
  .filter((line) => line.trim().startsWith('"changelog.releaseNotes":'));

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

describe("release notes version", () => {
  it("is defined for every locale", () => {
    expect(releaseNotes).toHaveLength(3);
  });

  for (const [index, entry] of releaseNotes.entries()) {
    it(`locale ${index + 1} interpolates the version rather than hardcoding it`, () => {
      expect(entry).toContain("{version}");
      // A literal x.y or x.y.z in the notes is the defect: it cannot follow the manifest.
      const literal = entry.match(/\b\d+\.\d+(\.\d+)?\b/);
      expect(literal, `hardcoded version ${literal?.[0]} in locale ${index + 1}`).toBeNull();
    });
  }

  it("is rendered with the manifest version supplied", () => {
    expect(mainSource).toMatch(/t\("changelog\.releaseNotes",\s*\{\s*version:\s*this\.manifest\.version\s*\}\)/);
  });
});
