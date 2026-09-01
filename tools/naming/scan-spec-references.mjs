#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    scan-spec-references
// COMPONENT: spec docs that point at source files which no longer exist
// ───────────────────────────────────────────────────────────────────
//
// A deep review returned eleven documentation-drift findings inside one packet,
// and every one of them was true when it was written. They rotted because the
// tree moved underneath them and nobody re-derived them.
//
// Most of that class cannot be automated: whether a paragraph still describes
// how something works is a reading question. But one slice is decidable, and it
// is the slice that produced three of the eleven — a document naming a source
// file that has since been deleted or moved. `src/views/surface.ts` was removed,
// and the packet went on citing it as the create path in two places, with a code
// comment citing its export in a third.
//
// So this checks exactly that and nothing else: every repo-relative source path
// a spec document mentions must exist on disk. It cannot tell you a description
// is stale. It can tell you it describes a file that is gone, which is the
// cheapest possible proof that nobody re-read it.
//
// NOT A GATE LANE, deliberately. See the packet note under T4: a spec document
// names a path for two different reasons — describing what IS, and specifying
// what WILL BE — and the path alone cannot tell them apart. Measured across this
// tree: 3,597 hits, of which 3,569 sit in completed packets and 26 of the
// remaining 28 are `tasks.md` and `plan.md` rows naming artefacts still to be
// built. Wiring that into the gate would train people to ignore it.
//
// It earns its place as an on-demand tool scoped to the packet being worked.
//
// Usage: node tools/naming/scan-spec-references.mjs [--json] [--path=specs/<packet>]
// Exit:  0 when every source path referenced by a spec doc exists; 1 otherwise.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
// Scoped by default to everything, but a packet is the useful unit: an old packet's dead paths are
// a historical record, and only the packet under active work is making a claim about today.
const scopeArg = process.argv.find((arg) => arg.startsWith("--path="));
const SPEC_ROOT = scopeArg ? resolve(REPO, scopeArg.slice("--path=".length)) : join(REPO, "specs");

// ───────────────────────────────────────────────────────────────────
// 2. WHAT COUNTS AS A REFERENCE
// ───────────────────────────────────────────────────────────────────

// Only paths rooted at a real source directory, so prose like "the views layer"
// is never mistaken for a claim about a file. A trailing `:123` is stripped: the
// line number is exactly the part that cannot be verified, and demanding it be
// right would make this scanner wrong more often than the docs are.
const REFERENCE_RE = /`((?:src|tools)\/[A-Za-z0-9._/-]+\.[A-Za-z0-9]+)(?::\d+(?:-\d+)?)?`/g;

/**
 * Paths that name something deliberately absent.
 *
 * A packet is allowed to say a file was deleted — that is the correction, not the defect. Without
 * this the scanner would fight exactly the sentences that fix the drift it exists to find.
 */
const DELETION_CONTEXT = /\b(deleted|removed|gone|no longer|superseded|used to|gutted|gone for good)\b/i;

/**
 * The canonical spec documents, and only those.
 *
 * Scoped deliberately. Run across every markdown file under `specs/`, this reports 5,526 dead
 * paths — and almost none of them are drift. Research and synthesis documents PROPOSE files that
 * were never built, compare against other codebases entirely, and quote paths out of other
 * projects; a resource map lists candidates. Those are doing their job. A scanner that shouts at
 * them is one nobody runs, which is worse than no scanner.
 *
 * These six are the documents a reader treats as a description of what IS. When one of them names
 * a file, it is making a claim about this tree.
 */
const CANONICAL_DOCS = new Set([
  "spec.md",
  "plan.md",
  "tasks.md",
  "goal.md",
  "checklist.md",
  "implementation-summary.md",
]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "lineages" || entry.name === "_archive" || entry.name === "review") continue;
      if (entry.name === "research" || entry.name === "build") continue;
      walk(path, out);
      continue;
    }
    if (CANONICAL_DOCS.has(entry.name)) out.push(path);
  }
  return out;
}

// ───────────────────────────────────────────────────────────────────
// 3. SCAN
// ───────────────────────────────────────────────────────────────────

if (!existsSync(SPEC_ROOT) || !statSync(SPEC_ROOT).isDirectory()) {
  console.log("scan-spec-references: no specs/ directory; nothing to check");
  process.exit(0);
}

const findings = [];
let referencesChecked = 0;

for (const file of walk(SPEC_ROOT)) {
  const lines = readFileSync(file, "utf-8").split("\n");
  lines.forEach((line, index) => {
    for (const match of line.matchAll(REFERENCE_RE)) {
      const path = match[1];
      referencesChecked += 1;
      if (existsSync(join(REPO, path))) continue;
      // A sentence that says the file is gone is the fix, not the fault.
      if (DELETION_CONTEXT.test(line)) continue;
      findings.push({ doc: relative(REPO, file), line: index + 1, path });
    }
  });
}

// ───────────────────────────────────────────────────────────────────
// 4. VERDICT
// ───────────────────────────────────────────────────────────────────

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ referencesChecked, findings }, null, 2));
  process.exit(findings.length === 0 ? 0 : 1);
}

// An empty-set pass proves nothing, so the count is always printed: a run that
// matched no references at all is a broken pattern, not a clean tree.
console.log(`scan-spec-references: ${referencesChecked} source reference(s) checked across ${relative(REPO, SPEC_ROOT) || "specs"}`);

if (findings.length === 0) {
  console.log("scan-spec-references: PASS — every referenced source path exists");
  process.exit(0);
}

console.error(`\nscan-spec-references: FAIL — ${findings.length} reference(s) point at files that do not exist\n`);
for (const finding of findings) {
  console.error(`  ${finding.doc}:${finding.line}`);
  console.error(`    ${finding.path}`);
}
console.error("\n  Either the path moved and the document was not re-read, or the file was deleted and");
console.error("  the sentence should say so — a sentence naming a deletion is allowed and skipped.");
process.exit(1);
