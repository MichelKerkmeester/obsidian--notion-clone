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
  OPTION_TONES, ROWS, boardSubgroupHeader, galleryGroupHeader, groupTitle,
  optionPill, tableGroupTitle,
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
 * The first rule is not keyed to `pill`, deliberately. Naming that one helper is how the record
 * detail panel kept its own `badge(row.cycle, "orange")` for three surfaces after the table was
 * fixed — so the same value was purple in a capture of a table and orange in a capture of the panel
 * beside it, which says the plugin colours by surface. It does not: the colour is the option's and
 * follows the value everywhere. Any two-argument call taking a row field and a literal tone is the
 * shape, whatever the helper is called.
 *
 * The ternary is the same mistake written inline — `status-color-${r.category === "Business" ?
 * "blue" : "green"}` went through no helper at all, so a rule watching call names alone reported
 * the multi-select badge clean while it painted three categories one colour.
 */
const HAND_PICKED = [
  { why: "a row field with a literal tone", pattern: /\b\w+\(\s*\w+\.(\w+)\s*,\s*"[a-z]+"\s*\)/g },
  { why: "an inline tone ternary", pattern: /\b\w+\.(\w+)\s*===\s*"[^"]*"\s*\?\s*"[a-z]+"\s*:\s*"[a-z]+"/g },
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
// Every helper that builds a group title, not the three that were wrong first. The board lane was
// the fourth and it was missed: the extensions-mode board (boardExtensionsEnabled) writes
// `db-board-column-title` through the same `renderGroupLabel` call as the other three, and the
// first version of this check did not know it existed — so the board view kept photographing a
// bare lane title while the check reported the family clean. The reference (default) board's own
// `pm-kanban-col-badge` colours by inline style, not a `status-color-*` class — a different, real
// contract this check does not model — so `db-board-column-title` is exercised directly through
// `groupTitle`, the same badge-or-text primitive `galleryGroupHeader`/
// `boardSubgroupHeader` already call, rather than through a fixture that no longer builds this class.
const HEADERS = [
  ["galleryGroupHeader", galleryGroupHeader, ROWS[4].category, "db-gallery-group-title"],
  ["boardSubgroupHeader", boardSubgroupHeader, ROWS[2].cycle, "db-board-subgroup-title"],
  ["db-board-column-title", (title) => groupTitle("db-board-column-title", title, OPTION_TONES[title]),
    ROWS[11].category, "db-board-column-title"],
  ["tableGroupTitle", (title) => tableGroupTitle(title), ROWS[18].category, "db-group-title-text"],
];
for (const [name, helper, title, cls] of HEADERS) {
  if (!OPTION_TONES[title]) {
    bareTitles.push({ name, title, why: "no tone is registered for this value, so the check is blind" });
    continue;
  }
  const built = helper(title, 4);
  if (!built.includes(`status-color-${OPTION_TONES[title]}`)) {
    bareTitles.push({ name, title, why: "renders the option value as bare text; renderGroupLabel badges it" });
  } else if (!built.includes(cls)) {
    bareTitles.push({ name, title, why: `no longer writes ${cls}, so the class this rule is keyed to is gone` });
  }
}

// Which title classes does the renderer actually badge? Read them off its own call sites rather
// than listing them here, so a fifth grouped view fails this check on the day it is written and not
// on the day somebody happens to look at its fixture. The board lane was exactly that miss: a
// fourth `renderGroupLabel` call with its own title class, absent from a list written by hand from
// the three helpers that were already known to be wrong.
const RENDER_GROUP_LABEL = /renderGroupLabel\([^)]*?"([a-z-]+)"\s*\)/gs;
const covered = new Set(HEADERS.map(([, , , cls]) => cls));
const uncovered = new Set();
const viewsDir = join(REPO, "src", "views");
for (const name of readdirSync(viewsDir).filter((file) => file.endsWith(".ts"))) {
  const source = readFileSync(join(viewsDir, name), "utf8");
  for (const match of source.matchAll(RENDER_GROUP_LABEL)) {
    if (!covered.has(match[1])) uncovered.add(`${match[1]} (src/views/${name})`);
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

if (collisions.length === 0 && handPicked.length === 0 && bareTitles.length === 0
    && uncovered.size === 0) {
  console.log(`scan-option-tones: PASS — ${OPTION_FIELDS.length} option columns, `
    + `${scenarioFiles.length} scenario files, ${covered.size} badged group titles, `
    + "every distinct value its own chip");
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
for (const u of uncovered) {
  console.error(`\nUNCOVERED    ${u}`);
  console.error("  renderGroupLabel badges this title class and no fixture helper here is checked for it.");
  console.error("  Add the helper that builds it to HEADERS, or write one if no fixture photographs it yet.");
}
console.error(`\nscan-option-tones: ${collisions.length} flattened, ${handPicked.length} hand-picked, `
  + `${bareTitles.length} bare, ${uncovered.size} uncovered`);
process.exit(1);
