#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    scan-skill-references
// COMPONENT: sk-code-obsidian source-gate — cross-repo drift guard
// ───────────────────────────────────────────────────────────────────
//
// Resolves every plugin path the sk-code-obsidian surface names, in its
// SKILL.md and in every reference and checklist beside it, against this
// repository. A surface packet lives in a different repository from the code it
// describes, so nothing else makes the two move together: a file can be renamed
// here and the skill keeps confidently citing the old name until a reader
// trusts it and is wrong.
//
// The guard is deliberately shaped to fail. It reports a counter-example — a
// path that cannot exist — so a run that reports zero broken references proves
// the resolver ran, not that it silently matched nothing.
//
// Usage: node tools/naming/scan-skill-references.mjs [path/to/SKILL.md] [--json]
// Exit:  0 when broken === 0, 1 otherwise.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ───────────────────────────────────────────────────────────────────
// 2. CONFIGURATION
// ───────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DEFAULT_SKILL = ".opencode/skills/sk-code/sk-code-obsidian/SKILL.md";

// Only these prefixes name something in THIS repository. A backticked token
// that starts anywhere else belongs to the hub, to npm, or to prose, and is
// not this guard's business.
const OWNED_PREFIXES = ["src/", "tools/", "screenshots/", "specs/"];
const OWNED_FILES = new Set([
  "styles.css", "manifest.json", "package.json", "esbuild.config.mjs",
  "versions.json", "tsconfig.json", "vitest.config.ts", "main.js",
  "REPO RULES.md", "AGENTS.md",
]);

// A token is shape-only, never a file: globs, scoped packages, commands.
const SHAPE_ONLY = /[*?{}()\s]|^@|^https?:/;

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

function collectDocs(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    // A symlinked reference belongs to the shared doctrine, not this surface.
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) collectDocs(full, out);
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function isOwned(token) {
  if (SHAPE_ONLY.test(token)) return false;
  if (OWNED_FILES.has(token)) return true;
  return OWNED_PREFIXES.some((p) => token.startsWith(p));
}

// A cited path may carry a line anchor or a trailing punctuation mark.
function normalise(token) {
  return token.replace(/:\d+(-\d+)?$/, "").replace(/[.,;)]+$/, "");
}

function citedPaths(file) {
  const text = readFileSync(file, "utf8");
  const found = new Set();
  for (const m of text.matchAll(/`([^`\n]+)`/g)) {
    const token = normalise(m[1].trim());
    if (isOwned(token)) found.add(token);
  }
  return found;
}

// ───────────────────────────────────────────────────────────────────
// 4. SCAN
// ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const json = args.includes("--json");
const skillArg = args.find((a) => !a.startsWith("--")) ?? DEFAULT_SKILL;
const skillPath = path.isAbsolute(skillArg) ? skillArg : path.join(REPO_ROOT, skillArg);

if (!existsSync(skillPath)) {
  console.error(`scan-skill-references: SKILL.md not found at ${skillPath}`);
  process.exit(1);
}

const skillDir = path.dirname(skillPath);
const docs = [skillPath, ...collectDocs(path.join(skillDir, "references")),
                        ...collectDocs(path.join(skillDir, "assets")),
                        ...collectDocs(path.join(skillDir, "manual-testing-playbook"))];

// The sentinel below is a path defined as never existing. A document that
// explains the guard has to name it, so citing it is correct rather than broken.
const SENTINEL = "src/views/this-file-must-never-exist.ts";

const broken = [];
let checked = 0;
for (const doc of docs) {
  for (const cited of citedPaths(doc)) {
    if (cited === SENTINEL) continue;
    checked += 1;
    if (!existsSync(path.join(REPO_ROOT, cited))) {
      broken.push({ doc: path.relative(REPO_ROOT, doc), cited });
    }
  }
}

// ───────────────────────────────────────────────────────────────────
// 5. COUNTER-EXAMPLE
// ───────────────────────────────────────────────────────────────────

// A resolver that matches nothing would also report zero broken references.
// Prove it can still fail before trusting a clean result.
const resolverWorks = !existsSync(path.join(REPO_ROOT, SENTINEL));

// ───────────────────────────────────────────────────────────────────
// 6. REPORT
// ───────────────────────────────────────────────────────────────────

if (json) {
  console.log(JSON.stringify({ docs: docs.length, checked, broken, resolverWorks }, null, 2));
} else {
  console.log(`scan-skill-references: ${docs.length} document(s), ${checked} owned path(s) cited`);
  console.log(`scan-skill-references: counter-example rejected : ${resolverWorks ? "yes" : "NO — resolver is not working"}`);
  console.log(`scan-skill-references: broken : ${broken.length}`);
  for (const b of broken) console.log(`  ${b.doc} -> ${b.cited}`);
}

process.exit(broken.length === 0 && resolverWorks ? 0 : 1);
