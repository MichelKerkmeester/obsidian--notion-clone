// ───────────────────────────────────────────────────────────────────
// MODULE:    cascade-audit
// COMPONENT: finds where the stylesheet quietly contradicts itself
// ───────────────────────────────────────────────────────────────────
//
// The stylesheet declares many selectors more than once, and in places a later
// block reverses an earlier one with no warning of any kind. One rule hides a
// set of controls and a later rule shows them again, which is how a row came to
// emit more children than its grid declares tracks for.
//
// "Single-valued" has to mean one intentional winner per cascade context. It
// cannot mean one global declaration per selector, because the same selector
// legitimately differs by media query, theme and state. So a duplicate is only
// a duplicate when it appears twice in the SAME context — otherwise this would
// report hundreds of false positives and be ignored, which is worse than not
// running it.
//
// Every conflict is classified, and `unknown` is a blocker rather than
// permission to keep whichever declaration happens to come last. Choosing the
// last one is what the browser already does; the point of the audit is to
// decide whether that is what anyone intended.
//
// Usage: node tools/live/cascade-audit.mjs [--json] [--selector <name>]

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const CSS = join(REPO, "styles.css");
const OUT = join(REPO, "tools/live/cascade-audit.json");

// ───────────────────────────────────────────────────────────────────
// 3. PARSE
// ───────────────────────────────────────────────────────────────────

/**
 * Walk the sheet tracking at-rule nesting, so a rule's identity includes its context.
 *
 * A hand-rolled walk rather than a parser dependency: the only structure needed is brace depth plus
 * the enclosing at-rule chain, and adding a dependency to a plugin build for that is a poor trade.
 */
function parse(css) {
  const rules = [];
  const context = [];
  let i = 0;
  let buffer = "";
  let line = 1;

  while (i < css.length) {
    const ch = css[i];

    if (ch === "\n") line += 1;

    // Skip comments wholesale — a brace inside one would corrupt the depth count.
    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      const skipped = css.slice(i, end + 2);
      line += (skipped.match(/\n/g) || []).length;
      i = end + 2;
      continue;
    }

    if (ch === "{") {
      const prelude = buffer.trim();
      buffer = "";
      if (prelude.startsWith("@")) {
        context.push(prelude.replace(/\s+/g, " "));
        i += 1;
        continue;
      }
      // A declaration block: capture it whole.
      let depth = 1;
      let j = i + 1;
      while (j < css.length && depth > 0) {
        if (css[j] === "{") depth += 1;
        else if (css[j] === "}") depth -= 1;
        j += 1;
      }
      const body = css.slice(i + 1, j - 1);
      rules.push({ prelude: prelude.replace(/\s+/g, " "), context: [...context], body, line });
      line += (css.slice(i, j).match(/\n/g) || []).length;
      i = j;
      continue;
    }

    if (ch === "}") {
      context.pop();
      i += 1;
      continue;
    }

    buffer += ch;
    i += 1;
  }
  return rules;
}

/** Split a declaration body into property/value pairs, ignoring nested at-rule content. */
function declarations(body) {
  const out = [];
  for (const part of body.split(";")) {
    const idx = part.indexOf(":");
    if (idx < 0) continue;
    const prop = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!prop || prop.startsWith("@") || !value) continue;
    out.push({ prop, value });
  }
  return out;
}

// ───────────────────────────────────────────────────────────────────
// 4. AUDIT
// ───────────────────────────────────────────────────────────────────

const css = readFileSync(CSS, "utf8");
const rules = parse(css);

/**
 * Split a selector list on top-level commas only.
 *
 * A naive `split(",")` shreds `:is(a, b) .c` into fragments and then reports the fragments as
 * duplicates of unrelated rules. That inflated the first run of this audit to roughly three times
 * the real count, which would have made the report worthless — a number nobody trusts gets ignored,
 * and an ignored audit is the same as no audit.
 */
function splitSelectors(prelude) {
  const out = [];
  let depth = 0;
  let current = "";
  for (const ch of prelude) {
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      out.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) out.push(current.trim());
  return out.filter(Boolean);
}

/** Key a rule by selector AND context — the same selector under a different media query is not a duplicate. */
const byKey = new Map();
for (const rule of rules) {
  for (const selector of splitSelectors(rule.prelude)) {
    const key = `${rule.context.join(" | ")}##${selector}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(rule);
  }
}

const duplicated = [];
const conflicts = [];

for (const [key, group] of byKey) {
  if (group.length < 2) continue;
  const [context, selector] = key.split("##");
  duplicated.push({ selector, context, count: group.length, lines: group.map((g) => g.line) });

  // A conflict is one property given two different values in the same context. The later wins,
  // silently, and nothing in the file records whether that was the intent.
  const seen = new Map();
  for (const rule of group) {
    for (const { prop, value } of declarations(rule.body)) {
      if (seen.has(prop) && seen.get(prop).value !== value) {
        conflicts.push({
          selector,
          context,
          prop,
          from: seen.get(prop).value,
          fromLine: seen.get(prop).line,
          to: value,
          toLine: rule.line,
          classification: "unknown",
        });
      }
      seen.set(prop, { value, line: rule.line });
    }
  }
}

// ───────────────────────────────────────────────────────────────────
// 5. REPORT
// ───────────────────────────────────────────────────────────────────

const only = process.argv.includes("--selector")
  ? process.argv[process.argv.indexOf("--selector") + 1]
  : null;
const shown = only ? conflicts.filter((c) => c.selector.includes(only)) : conflicts;

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ duplicated, conflicts }, null, 2));
} else {
  console.log(`cascade audit — ${rules.length} rules parsed from a ${css.split("\n").length}-line sheet\n`);
  console.log(`  selectors declared twice or more in the same context   ${duplicated.length}`);
  console.log(`  property values silently overridden by a later block   ${conflicts.length}`);
  console.log(`  classified                                             0 (all unknown)\n`);
  console.log("  every conflict is UNKNOWN until someone decides it was intended.");
  console.log("  unknown blocks a release; it is not permission to keep the last declaration.\n");
  for (const c of shown.slice(0, 12)) {
    console.log(`    ${c.selector}`);
    console.log(`      ${c.prop}: ${c.from}  (line ${c.fromLine})`);
    console.log(`      ${c.prop}: ${c.to}  (line ${c.toLine})  <- wins`);
  }
  if (shown.length > 12) console.log(`\n    ... and ${shown.length - 12} more`);
}

writeFileSync(OUT, JSON.stringify({
  measuredAt: new Date().toISOString(),
  sheetLines: css.split("\n").length,
  totals: { rules: rules.length, duplicatedSelectors: duplicated.length, conflicts: conflicts.length },
  duplicated,
  conflicts,
}, null, 2));
console.log(`\nrecorded: ${OUT.replace(REPO + "/", "")}`);
