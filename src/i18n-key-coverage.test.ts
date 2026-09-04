// ───────────────────────────────────────────────────────────────────
// MODULE:    i18n-key-coverage.test
// COMPONENT: every literal t() key resolves in the shipped dictionary
// ───────────────────────────────────────────────────────────────────
//
// t() takes `key: string`, so a key that was never defined type-checks
// cleanly and then renders its own name to the user. That is not a
// hypothetical: `calendar.unscheduled` shipped that way and surfaced on a
// phone as the literal text "calendar.unscheduled (4)". Only a scan of the
// call sites against the dictionary can catch the class, so this suite walks
// the source for literal keys and fails on any the English dictionary lacks.
//
// Dynamic keys — template literals, variables, computed lookups — are out of
// reach here and are deliberately skipped rather than guessed at.

/* eslint-disable import/no-nodejs-modules, no-undef --
   Walking the source tree means reading it from disk, which needs the node
   builtins the plugin runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { describe, expect, it } from "vitest";

// ───────────────────────────────────────────────────────────────────
// 1. SOURCE COLLECTION
// ───────────────────────────────────────────────────────────────────

const SRC_ROOT = resolve(__dirname, ".");

/** Every .ts file under src/, excluding the suites themselves. */
const collectSources = (dir: string, found: string[] = []): string[] => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectSources(full, found);
      continue;
    }
    if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) found.push(full);
  }
  return found;
};

const sourceFiles = collectSources(SRC_ROOT);

// ───────────────────────────────────────────────────────────────────
// 2. KEY EXTRACTION
// ───────────────────────────────────────────────────────────────────

/** Literal first arguments to t(), as `key -> the files that ask for it`. */
const collectRequestedKeys = (): Map<string, string[]> => {
  const requested = new Map<string, string[]>();
  const call = /\bt\(\s*"([^"]+)"/g;
  for (const file of sourceFiles) {
    const source = readFileSync(file, "utf-8");
    let match = call.exec(source);
    while (match) {
      const key = match[1];
      const seen = requested.get(key) || [];
      const short = file.slice(SRC_ROOT.length + 1);
      if (!seen.includes(short)) seen.push(short);
      requested.set(key, seen);
      match = call.exec(source);
    }
  }
  return requested;
};

/** Keys the English dictionary defines. English is the fallback locale, so it is the contract. */
const collectDefinedKeys = (): Set<string> => {
  const dictionary = readFileSync(join(SRC_ROOT, "i18n.ts"), "utf-8");
  const englishBlock = dictionary.slice(
    dictionary.indexOf("const en: Dictionary = {"),
    dictionary.indexOf("const zhCN: Dictionary = {"),
  );
  const defined = new Set<string>();
  const entry = /^\s*"([^"]+)":/gm;
  let match = entry.exec(englishBlock);
  while (match) {
    defined.add(match[1]);
    match = entry.exec(englishBlock);
  }
  return defined;
};

// ───────────────────────────────────────────────────────────────────
// 3. ASSERTIONS
// ───────────────────────────────────────────────────────────────────

describe("i18n key coverage", () => {
  it("finds call sites and a dictionary to compare", () => {
    expect(sourceFiles.length).toBeGreaterThan(100);
    expect(collectRequestedKeys().size).toBeGreaterThan(100);
    expect(collectDefinedKeys().size).toBeGreaterThan(100);
  });

  it("defines every literal key the source asks for", () => {
    const defined = collectDefinedKeys();
    const missing: string[] = [];
    for (const [key, files] of collectRequestedKeys()) {
      if (!defined.has(key)) missing.push(`${key} <- ${files.join(", ")}`);
    }
    expect(missing).toEqual([]);
  });

  it("resolves the key whose absence motivated this suite", () => {
    expect(collectDefinedKeys().has("calendar.unscheduled")).toBe(true);
  });

  it("defines the list-retirement notice in all three locales", () => {
    const source = readFileSync(join(SRC_ROOT, "i18n.ts"), "utf-8");
    const english = source.slice(source.indexOf("const en: Dictionary = {"), source.indexOf("const zhCN: Dictionary = {"));
    const simplified = source.slice(source.indexOf("const zhCN: Dictionary = {"), source.indexOf("const zhTW: Dictionary = {"));
    const traditional = source.slice(source.indexOf("const zhTW: Dictionary = {"));
    for (const block of [english, simplified, traditional]) {
      expect(block).toMatch(/^\s*"notice\.listMigrated":/m);
    }
  });
});
