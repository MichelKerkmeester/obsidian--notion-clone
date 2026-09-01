// ───────────────────────────────────────────────────────────────────
// MODULE:    scan-failing-values
// COMPONENT: how many ticked criteria record the number they moved from
// ───────────────────────────────────────────────────────────────────
//
// `000` asks that every criterion be "proven to fail on today's tree with the number recorded", and
// its own row says why that is still open: `012` machine-checks it for one section, "that mechanism
// is per-phase; program-wide, several packets still carry criteria with no recorded failing value,
// and this row is the one that says so."
//
// Saying so was the whole job and nothing computed it. This does.
//
// WHY THIS IS A RATCHET AND NOT A FLOOR. A criterion that was never broken has no failing value to
// record, and demanding one would be demanding fiction — the same mistake as `AC-016`'s threshold
// of zero, which failed a correct harness for doing its job. Several rows here are honestly in that
// state: they measured a property that already held. So the count is recorded and may not GROW. A
// new tick has to bring its evidence. The existing set gets converted deliberately, or argued down
// one row at a time by someone who reads it.
//
// WHAT COUNTS AS EVIDENCE is the vocabulary this corpus already uses, not a convention invented
// here and imposed on 216 rows: a watched red, a "was N", a "recorded N", a "Today: N", a named
// pre-fix state. Widening the pattern from a first narrow guess moved the count by five, which is
// how it is known the number is about the rows rather than about the regex.
//
// Exit 0 when the unmarked count is at or below its baseline, 1 when it grows, 2 when the scan
// matched nothing — a scan that found no criteria would otherwise report a clean tree.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const PROGRAM = join(REPO, "specs/005-component-surface-system");
const BASELINE_PATH = join(REPO, "tools/naming/failing-values-baseline.json");

/** The evidence vocabulary the packets already write in. */
const RECORDS_A_FAILURE = new RegExp(
  [
    "watched (?:it )?red", "observed red", "red under", "red with", "red on", "red again",
    "red before green", "went red", "goes red", "reports? red", "\\bred:\\b",
    "failing (?:value|number|pair)", "\\bwas \\d", "recorded \\d",
    "today[:*\\s]+\\d", "today[:*\\s]+the", "pre-fix", "before the fix", "reverting",
  ].join("|"),
  "i",
);

// ───────────────────────────────────────────────────────────────────
// 3. COLLECT
// ───────────────────────────────────────────────────────────────────

/** Each `- [x]` row with the indented prose that belongs to it. */
function tickedRows(text) {
  const lines = text.split("\n");
  const rows = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].startsWith("- [x]")) continue;
    const block = [lines[i]];
    let j = i + 1;
    while (j < lines.length && !lines[j].startsWith("- [")) {
      block.push(lines[j]);
      j += 1;
    }
    rows.push({ title: lines[i].slice(6).trim(), body: block.join("\n") });
    i = j - 1;
  }
  return rows;
}

const phases = existsSync(PROGRAM)
  ? readdirSync(PROGRAM).filter((name) => /^\d/.test(name)).sort()
  : [];

let ticked = 0;
const bare = [];
for (const phase of phases) {
  const goal = join(PROGRAM, phase, "goal.md");
  if (!existsSync(goal)) continue;
  for (const row of tickedRows(readFileSync(goal, "utf8"))) {
    ticked += 1;
    if (!RECORDS_A_FAILURE.test(row.body)) bare.push({ phase, title: row.title.slice(0, 64) });
  }
}

// ───────────────────────────────────────────────────────────────────
// 4. VERDICT
// ───────────────────────────────────────────────────────────────────

if (ticked === 0) {
  console.error("scan-failing-values: no ticked criteria found, which is not the same as clean.");
  console.error(`  phases=${phases.length} program=${PROGRAM}`);
  process.exit(2);
}

const baseline = existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, "utf8")) : null;
const allowed = baseline ? baseline.bare : bare.length;
const carrying = ticked - bare.length;

console.log(`scan-failing-values: ${ticked} ticked criteria across ${phases.length} phases`);
console.log(`  ${carrying} record the number they moved from (${Math.round((carrying / ticked) * 100)}%)`);
console.log(`  ${bare.length} do not, against a recorded baseline of ${allowed}`);

const byPhase = new Map();
for (const row of bare) byPhase.set(row.phase, (byPhase.get(row.phase) ?? 0) + 1);
for (const [phase, n] of [...byPhase].sort((a, b) => b[1] - a[1]).slice(0, 6)) {
  console.log(`    ${String(n).padStart(3)}  ${phase}`);
}

if (bare.length > allowed) {
  console.error(`\nscan-failing-values: FAIL — ${bare.length - allowed} newly ticked criterion(s) `
    + "record no failing value.");
  const known = new Set(baseline?.titles ?? []);
  for (const row of bare.filter((r) => !known.has(r.title))) {
    console.error(`  ${row.phase}: ${row.title}`);
  }
  console.error("\n  A tick asserts a number moved. Without the value it moved FROM, it asserts");
  console.error("  only that a number is within a threshold today, which is a weaker claim and");
  console.error("  is not what these rows say.");
  process.exit(1);
}

console.log("\nscan-failing-values: PASS — no newly ticked criterion arrived without its failing value");
console.log("  what this does not prove: the criteria in the baseline are still unproven. A row that");
console.log("  was never broken has no red to record and is honestly bare; the rest are a debt this");
console.log("  ratchet keeps from growing rather than one it collects.");
process.exit(0);
