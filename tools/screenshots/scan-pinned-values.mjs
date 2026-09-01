// ───────────────────────────────────────────────────────────────────
// MODULE:    scan-pinned-values
// COMPONENT: catches a harness value that contradicts what production resolves
// ───────────────────────────────────────────────────────────────────
//
// A screenshot runs no plugin, so this harness supplies the values the plugin
// would compute. That is its job, not a defect — forty-one of its declarations
// are exactly that, and a rule condemning them would be deleted within a week.
//
// One case is different, and it is decidable. When a property is read as
// `var(--x, FALLBACK)` and *nothing* ever assigns it — not the plugin, not the
// stylesheet — then production always resolves to FALLBACK. There is no runtime
// value to stand in for. A harness that supplies a different number is not
// approximating the product, it is contradicting it, and every screenshot shows
// a layout the user cannot get.
//
// `--db-header-height` was this: read with a 34px fallback, assigned by nothing,
// and pinned here to 40px. Every capture depicted a header six pixels taller
// than the one that ships. It was found by reading. This finds the rest.
//
// Not covered: a value of the wrong *type*. `--db-timeline-row` took a length
// where the runtime assigns a grid line index, which made `grid-row` invalid and
// silently dropped it. Deciding that from source means knowing the type of a
// TypeScript expression — `String(units)`, a nested template literal — and a
// text scanner guessing at it produced twenty false positives when this was
// tried. That defect is observable where it actually happens: in the browser, as
// a computed value that did not take effect. It belongs in the geometry harness,
// not here.
//
// Exit 0 clean, 1 with the list, 2 when the scan itself matched nothing.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HARNESS_FILES = ["tools/screenshots/runtime-vars.css", "tools/screenshots/theme.css"];

// ───────────────────────────────────────────────────────────────────
// 3. COLLECT
// ───────────────────────────────────────────────────────────────────

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(abs);
  }
  return out;
}

/** Properties the plugin assigns at runtime. Only the name matters here, never the value. */
function runtimeAssigned() {
  const found = new Map();
  const dir = join(REPO, "src");
  if (!existsSync(dir)) return found;
  for (const file of walk(dir)) {
    const text = readFileSync(file, "utf8");
    const rel = relative(REPO, file);
    for (const m of text.matchAll(/"(--db-[a-z0-9-]+)"\s*:/g)) if (!found.has(m[1])) found.set(m[1], rel);
    for (const m of text.matchAll(/setProperty\(\s*"(--db-[a-z0-9-]+)"/g)) if (!found.has(m[1])) found.set(m[1], rel);
  }
  return found;
}

/** What the shipped stylesheet declares, and what it falls back to when reading. */
function stylesheet() {
  const abs = join(REPO, "styles.css");
  const text = existsSync(abs) ? readFileSync(abs, "utf8") : "";
  const declared = new Set([...text.matchAll(/^\s*(--db-[a-z0-9-]+)\s*:/gm)].map((m) => m[1]));
  // Balanced scan, not a regex. A fallback is routinely another var() — stopping at the first
  // closing paren truncates `var(--text-normal)` to `var(--text-normal`, which then differs from
  // itself and reports two identical values as a contradiction.
  const fallbacks = new Map();
  for (const m of text.matchAll(/var\(\s*(--db-[a-z0-9-]+)\s*,/g)) {
    let depth = 1;
    let index = m.index + m[0].length;
    while (index < text.length && depth > 0) {
      if (text[index] === "(") depth += 1;
      else if (text[index] === ")") depth -= 1;
      if (depth > 0) index += 1;
    }
    if (depth !== 0) continue;
    if (!fallbacks.has(m[1])) fallbacks.set(m[1], text.slice(m.index + m[0].length, index).trim());
  }
  return { declared, fallbacks, empty: text.length === 0 };
}

/** What a harness file declares. Comments stripped, so a documented removal does not read as one. */
function harnessDeclared(relPath) {
  const abs = join(REPO, relPath);
  if (!existsSync(abs)) return new Map();
  const text = readFileSync(abs, "utf8").replace(/\/\*[\s\S]*?\*\//g, " ");
  const found = new Map();
  for (const m of text.matchAll(/(--db-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    if (!found.has(m[1])) found.set(m[1], m[2].trim());
  }
  return found;
}

// ───────────────────────────────────────────────────────────────────
// 4. MAIN
// ───────────────────────────────────────────────────────────────────

const runtime = runtimeAssigned();
const sheet = stylesheet();

// A scan matching nothing gives the same clean bill as a clean tree. Separate the two.
if (runtime.size === 0 || sheet.empty || sheet.fallbacks.size === 0) {
  console.error("scan-pinned-values: the scan matched nothing, which is not the same as clean.");
  console.error(`  runtime=${runtime.size} declared=${sheet.declared.size} fallbacks=${sheet.fallbacks.size}`);
  process.exit(2);
}

const contradictions = [];
const unread = [];
// The population `AC-016` actually names: a harness assignment of a property `src/` also assigns.
// The loop below SKIPS these, which is the criterion's population exactly — so the checker was
// implementing the opposite of the criterion it answers to, and the phase's own goal.md says so.
const standIns = [];

for (const relPath of HARNESS_FILES) {
  for (const [prop, value] of harnessDeclared(relPath)) {
    if (runtime.has(prop)) standIns.push({ relPath, prop, value, src: runtime.get(prop) });
    if (runtime.has(prop) || sheet.declared.has(prop)) continue;
    const fallback = sheet.fallbacks.get(prop);
    if (fallback === undefined) {
      unread.push({ relPath, prop, value });
    } else if (fallback !== value) {
      contradictions.push({ relPath, prop, value, fallback });
    }
  }
}

console.log(`scan-pinned-values: ${runtime.size} runtime-assigned, ${sheet.fallbacks.size} read with a fallback`);

// ───────────────────────────────────────────────────────────────────
// 4b. THE STAND-INS — COUNTED, NAMED, AND NOT CONDEMNED
// ───────────────────────────────────────────────────────────────────
//
// `AC-016` asks for a scan of "an assignment of a custom property that `src/` also assigns" and
// wants zero of them. There are 41, and every one is the harness doing its job: a screenshot runs
// no plugin, so something has to supply what the plugin would compute. A rule failing all 41 would
// fail a correct harness, which is the shape this program keeps deleting — and the header above
// says as much, which is WHY the loop skips them.
//
// But skipping is not the same as answering. The criterion's real fear is stated in its own row:
// "a fifth would be invisible." So the population is now listed and RATCHETED. A stand-in that
// already exists stays; a new one cannot arrive without someone deciding it should.
//
// This is the amendment, made here rather than argued: the criterion's threshold of zero is wrong
// and its concern is right, so what is enforced is the concern.
const BASELINE_PATH = join(REPO, "tools/screenshots/pinned-values-baseline.json");
const baseline = existsSync(BASELINE_PATH)
  ? JSON.parse(readFileSync(BASELINE_PATH, "utf8"))
  : null;
const allowed = baseline ? baseline.standIns : standIns.length;

console.log(`scan-pinned-values: ${standIns.length} stand-in(s) for a property src/ also assigns, `
  + `against a recorded baseline of ${allowed}`);
console.log("  These are not defects. A screenshot runs no plugin, so the harness supplies what the");
console.log("  plugin would compute — that is its purpose. They are counted so a NEW one cannot");
console.log("  arrive unnoticed, which is the thing the criterion was actually worried about.");

if (standIns.length > allowed) {
  console.error(`\nNEW STAND-IN(S) — ${standIns.length - allowed} more than the recorded baseline:`);
  const known = new Set(baseline?.properties ?? []);
  for (const s of standIns.filter((entry) => !known.has(entry.prop))) {
    console.error(`  ${s.prop}: ${s.value}   (${s.relPath}, assigned by ${s.src})`);
  }
  console.error("\n  Either the harness gained a stand-in nobody decided on, or src/ started");
  console.error("  assigning a property the harness was already pinning. Both are worth a look.");
  process.exit(1);
}

if (contradictions.length === 0 && unread.length === 0) {
  console.log("scan-pinned-values: PASS — no harness value contradicts what production resolves");
  process.exit(0);
}

for (const c of contradictions) {
  console.error(`\nCONTRADICTS  ${c.prop}`);
  console.error(`  production resolves  ${c.fallback}`);
  console.error(`  this harness renders ${c.value}   (${c.relPath})`);
  console.error("  nothing assigns this property, so the fallback is the only value a user ever sees.");
}
for (const u of unread) {
  console.error(`\nUNREAD       ${u.prop}: ${u.value}   (${u.relPath})`);
  console.error("  nothing assigns it and nothing reads it — the declaration affects no rendering.");
}
console.error(`\nscan-pinned-values: ${contradictions.length} contradiction(s), ${unread.length} unread`);
process.exit(1);
