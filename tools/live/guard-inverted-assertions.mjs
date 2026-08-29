// ───────────────────────────────────────────────────────────────────
// MODULE:    guard-inverted-assertions
// COMPONENT: refuses a check that certifies a defect instead of catching it
// ───────────────────────────────────────────────────────────────────
//
// A geometry check once required a caller that states no width to render WIDER
// than 320px. It was green, it ran on every push, and it certified the very
// behaviour the work was meant to remove. Any correct fix would have turned the
// pipeline red, and the cheapest response to a red pipeline is to revert the
// fix — so the check actively defended the bug it was written beside.
//
// That assertion has been inverted. This guard exists because the inversion is
// four lines in a file several later stages all edit, and a conflict resolution
// reverts exactly that kind of change without anyone noticing. A guard is
// cheaper than rediscovering the same trap in three months.
//
// Exit 0 when no banned predicate is present, 1 when one returns.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

// ───────────────────────────────────────────────────────────────────
// 2. BANNED PREDICATES
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));

/**
 * Each entry is a predicate that asserts a known defect is present.
 *
 * `why` is the durable part: without it, a future reader sees a rule with no reason and deletes it.
 */
const BANNED = [
  {
    file: "tools/storybook/verify-placement.mjs",
    pattern: /pass:\s*wr\.width\s*>\s*320/,
    why: "requires a widthless caller to render at the 520px default — it certifies the defect, "
      + "so a correct width policy would turn CI red and invite a revert",
  },
];

// ───────────────────────────────────────────────────────────────────
// 3. CHECK
// ───────────────────────────────────────────────────────────────────

const violations = [];
for (const rule of BANNED) {
  let source;
  try {
    source = readFileSync(join(REPO, rule.file), "utf8");
  } catch {
    violations.push({ ...rule, note: "file missing — the guard cannot confirm the fix is intact" });
    continue;
  }
  if (rule.pattern.test(source)) violations.push(rule);
}

if (violations.length) {
  console.error("guard: FAIL — a check that certifies a defect has returned\n");
  for (const v of violations) {
    console.error(`  ${v.file}`);
    console.error(`    predicate: ${v.pattern}`);
    console.error(`    why banned: ${v.why}`);
    if (v.note) console.error(`    note: ${v.note}`);
  }
  console.error("\nIf a rebase reintroduced this, re-apply the inversion rather than relaxing the guard.");
  process.exit(1);
}

console.log(`guard: PASS — ${BANNED.length} banned predicate(s) absent`);
