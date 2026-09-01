// ───────────────────────────────────────────────────────────────────
// MODULE:    scan-option-tones
// COMPONENT: refuses a fixture that photographs two distinct option values as the same chip
// ───────────────────────────────────────────────────────────────────
//
// `renderGroupLabel` and the select cell renderer both colour a `.status-badge` from the matching
// option's own colour, so in the product two different values of one column look different. The
// fixtures painted whole columns instead: every payment grey, both billing values orange, three of
// the four categories green. The capture that came out is a table where Yearly and Monthly are the
// same chip — a picture of a "states with no visible difference" defect the renderer does not have,
// sitting in the corpus a visual pass reads to decide whether the product has one.
//
// Two things were wrong and only one was the colours. The group-header helpers wrote their title as
// bare text, which is a branch `renderGroupLabel` reaches only for a non-option field or the empty
// group — while the titles passed were option values. A badge is taller and wider than the text it
// replaced, so the header height every control in that row is aligned against was wrong too.
//
// Three questions, each decidable from the fixture source alone:
//
//   1. Does one column map two distinct values onto one tone?
//   2. Does a fixture hand-pick a tone per row instead of asking for the value's own?
//   3. Does a group-header helper render an option value as bare text?
//
// What this does NOT check: whether a fixture tone equals the option colour a real vault configures.
// It cannot — the colours live in a user's schema, not in this repository. The property that holds
// without a vault is that distinct values are distinguishable, which is the one the capture is read
// for.
//
// Exit 0 clean, 1 with the list, 2 when the scan found no fixtures — an empty scan is not a pass.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  OPTION_TONES, ROWS, boardSubgroupHeader, galleryGroupHeader, listGroupHeader, optionPill,
} from "./scenarios/shared.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SCENARIO_DIR = join(REPO, "tools", "screenshots", "scenarios");

/** The fixture row fields that stand for option-typed columns — the three with a `circle-dot` header. */
const OPTION_FIELDS = ["cycle", "payment", "category"];

/**
 * Two shapes that pick a tone at the call site instead of from the value.
 *
 * `pill(r.field, ...)` is the one that flattened the table columns. The ternary is the same mistake
 * written inline — `status-color-${r.category === "Business" ? "blue" : "green"}` never went through
 * `pill` at all, so a rule that only watched that helper reported the multi-select badge clean while
 * it painted three categories one colour.
 */
const HAND_PICKED = [
  { why: "pill(r.FIELD, ...)", pattern: /\bpill\(\s*r\.(\w+)/g },
  { why: "an inline tone ternary", pattern: /\br\.(\w+)\s*===\s*"[^"]*"\s*\?\s*"[a-z]+"\s*:\s*"[a-z]+"/g },
];

const TONE = /status-color-([a-z]+)/;

// ───────────────────────────────────────────────────────────────────
// 3. CHECKS
// ───────────────────────────────────────────────────────────────────

const collisions = [];
for (const field of OPTION_FIELDS) {
  const byTone = new Map();
  for (const value of [...new Set(ROWS.map((row) => row[field]))]) {
    const tone = (optionPill(value).match(TONE) || [])[1] || "(none)";
    if (!byTone.has(tone)) byTone.set(tone, []);
    byTone.get(tone).push(value);
  }
  for (const [tone, values] of byTone) {
    if (values.length > 1) collisions.push({ field, tone, values });
  }
}

const handPicked = [];
const scenarioFiles = readdirSync(SCENARIO_DIR).filter((name) => name.endsWith(".mjs"));
for (const name of scenarioFiles) {
  const source = readFileSync(join(SCENARIO_DIR, name), "utf8");
  for (const rule of HAND_PICKED) {
    for (const match of source.matchAll(rule.pattern)) {
      if (OPTION_FIELDS.includes(match[1])) {
        handPicked.push({ file: `scenarios/${name}`, field: match[1], why: rule.why });
      }
    }
  }
}

// A group title that is a configured option value has to come out as a badge, because that is the
// only thing the renderer builds for one. Each helper is called with a value drawn from the fixture
// rows, so a helper that stopped badging is caught with its own data rather than a chosen constant.
const bareTitles = [];
const HEADERS = [
  ["listGroupHeader", listGroupHeader, ROWS[0].category],
  ["galleryGroupHeader", galleryGroupHeader, ROWS[4].category],
  ["boardSubgroupHeader", boardSubgroupHeader, ROWS[2].cycle],
];
for (const [name, helper, title] of HEADERS) {
  if (!OPTION_TONES[title]) {
    bareTitles.push({ name, title, why: "no tone is registered for this value, so the check is blind" });
    continue;
  }
  if (!helper(title, 4).includes(`status-color-${OPTION_TONES[title]}`)) {
    bareTitles.push({ name, title, why: "renders the option value as bare text; renderGroupLabel badges it" });
  }
}

// ───────────────────────────────────────────────────────────────────
// 4. REPORT
// ───────────────────────────────────────────────────────────────────

if (scenarioFiles.length === 0 || ROWS.length === 0) {
  console.error("scan-option-tones: FAIL — nothing to scan.");
  console.error(`  ${scenarioFiles.length} scenario file(s) under ${SCENARIO_DIR}, ${ROWS.length} fixture row(s).`);
  console.error("  A scan that reaches no fixtures cannot report them clean.");
  process.exit(2);
}

if (collisions.length === 0 && handPicked.length === 0 && bareTitles.length === 0) {
  console.log(`scan-option-tones: PASS — ${OPTION_FIELDS.length} option columns, `
    + `${scenarioFiles.length} scenario files, every distinct value its own chip`);
  process.exit(0);
}

for (const c of collisions) {
  console.error(`\nFLATTENED    ${c.field}`);
  console.error(`  ${c.values.join(", ")} all render status-color-${c.tone}`);
  console.error("  The capture shows one chip where the product shows several. Give each value a tone");
  console.error("  in OPTION_TONES, or say in the packet why this column is deliberately uniform.");
}
for (const h of handPicked) {
  console.error(`\nHAND-PICKED  ${h.file}: ${h.why}, on r.${h.field}`);
  console.error("  The tone is chosen at the call site, so it cannot vary with the value. Use optionPill.");
}
for (const b of bareTitles) {
  console.error(`\nBARE TITLE   ${b.name}("${b.title}")`);
  console.error(`  ${b.why}`);
}
console.error(`\nscan-option-tones: ${collisions.length} flattened, ${handPicked.length} hand-picked, `
  + `${bareTitles.length} bare`);
process.exit(1);
