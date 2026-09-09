#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    scan-deprecated-views
// COMPONENT: sk-code-obsidian source-gate — retired-view mention scanner
// ───────────────────────────────────────────────────────────────────
//
// The root README and the community-plugin description shipped describing
// views that are no longer in the bundle, so the docs told any new reader the
// plugin had five view types when it now has two. Until this scanner existed
// the only proof the copy was current was reading the prose by eye, and this
// leg caught the drift precisely because nobody had.
//
// The rule it enforces: outside the sanctioned "Deprecated views" note, the
// root README may carry zero mentions of the retired view names, and
// manifest.json may carry zero anywhere — its description field has no room
// for a note, so its copy must name only what still ships. The note itself is
// the pointer the operator asked for: it tells the reader where the removed
// code lives and how it comes back, so its own mentions are the point, not
// the drift, and they are counted but never enforced.
//
// Usage: node tools/naming/scan-deprecated-views.mjs
// Exit:  0 when the two files honour the rule; 1 otherwise.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ───────────────────────────────────────────────────────────────────
// 2. CONFIGURATION
// ───────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// One inclusive shape-list on purpose: the note names each retired surface in
// prose, and a narrower list would let a future edit reintroduce a name this
// lane was built to catch.
const KEYWORD_RE = /\b(?:calendar|timeline|gantt|chart|gallery|list views?)\b/gi;

const README_NAME = "README.md";
const MANIFEST_NAME = "manifest.json";
const NOTE_HEADING = "## Deprecated views";
const ARCHIVE_README = "archive/deprecated-views/README.md";

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

// Line indexes (0-based) inside a "Deprecated views" section. The section
// starts at its heading and ends at the next same-or-higher-level heading, so
// the note can grow without its exemption silently swallowing the section
// after it.
export function noteLineIndexes(lines) {
  const exempt = new Set();
  let inNote = false;
  for (let i = 0; i < lines.length; i++) {
    const heading = /^##\s+/.exec(lines[i].trim());
    if (heading) {
      inNote = lines[i].trim() === NOTE_HEADING;
      continue;
    }
    if (inNote) exempt.add(i);
  }
  return exempt;
}

function countMatches(text, skipLines) {
  let enforced = 0;
  let exempted = 0;
  const details = {};
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const match of lines[i].matchAll(KEYWORD_RE)) {
      const word = match[0].toLowerCase();
      details[word] = (details[word] ?? 0) + 1;
      if (skipLines?.has(i)) exempted += 1;
      else enforced += 1;
    }
  }
  return { enforced, exempted, details };
}

// The per-file decision, exported so a test can drive it over a fixture
// string without touching the real tree — everything above is pure
// text-in, verdict-out. Returns the match counts plus one list of concrete
// violations, empty when the file is clean.
export function scanText(text, filename) {
  const isManifest = path.basename(filename) === MANIFEST_NAME;
  const violations = [];

  if (isManifest) {
    const counts = countMatches(text);
    if (counts.enforced > 0) {
      violations.push(
        `${filename}: ${counts.enforced} retired-view mention(s) outside any note: ${JSON.stringify(counts.details)}`,
      );
    }
    return { counts, note: null, violations };
  }

  const lines = text.split("\n");
  const exempt = noteLineIndexes(lines);
  const counts = countMatches(text, exempt);
  const notePresent = lines.some((line) => line.trim() === NOTE_HEADING);
  const noteReferencesArchive = notePresent && lines.some((line) => line.includes(ARCHIVE_README));

  if (counts.enforced > 0) {
    violations.push(
      `${filename}: ${counts.enforced} retired-view mention(s) outside the note: ${JSON.stringify(counts.details)}`,
    );
  }
  if (!notePresent) violations.push(`${filename}: no "${NOTE_HEADING}" note`);
  if (notePresent && !noteReferencesArchive) {
    violations.push(`${filename}: the note does not point at ${ARCHIVE_README}`);
  }

  return {
    counts,
    note: { present: notePresent, referencesArchive: noteReferencesArchive },
    violations,
  };
}

function scan() {
  const results = [];
  for (const name of [README_NAME, MANIFEST_NAME]) {
    const abs = path.join(REPO_ROOT, name);
    const result = scanText(readFileSync(abs, "utf8"), name);
    results.push(result);
  }

  if (!existsSync(path.join(REPO_ROOT, ARCHIVE_README))) {
    results.push({ counts: null, note: null, violations: [`${ARCHIVE_README}: missing`] });
  }

  const violations = results.flatMap((r) => r.violations);
  return { results, violations };
}

// ───────────────────────────────────────────────────────────────────
// 4. REPORT
// ───────────────────────────────────────────────────────────────────

function main() {
  const { results, violations } = scan();

  for (const result of results) {
    if (!result.counts) continue;
    const scope = result.note
      ? `${result.counts.enforced} outside the note, ${result.counts.exempted} inside`
      : `${result.counts.enforced} total`;
    console.log(`scan-deprecated-views: ${scope} retired-view mention(s) — ${JSON.stringify(result.counts.details)}`);
  }
  for (const violation of violations) console.log(`scan-deprecated-views: ${violation}`);

  if (violations.length === 0) {
    console.log(`scan-deprecated-views: PASS — the copy ships what the bundle ships, and the note points at ${ARCHIVE_README}`);
  } else {
    console.log(`scan-deprecated-views: ${violations.length} violation(s)`);
  }

  process.exit(violations.length === 0 ? 0 : 1);
}

// Guarded so scanText() is importable for tests without triggering this CLI's own process.exit().
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) main();
