// ───────────────────────────────────────────────────────────────────
// MODULE:    story-coverage
// COMPONENT: requires a co-located story for every renderable module
// ───────────────────────────────────────────────────────────────────
//
// A catalogue is only useful while it is complete. Without a gate, the next
// person adds a renderer, nobody adds a story, and within a few months the
// catalogue documents a subset nobody can identify — which is how the previous
// central story file drifted.
//
// "Renderable" here means a module under src/views that exports a create* or
// render* function: those take a parent element and data, which is exactly
// what a story can supply. Everything else — classes needing a vault, panels
// needing an app — is exempt, but each exemption carries a written reason.
//
// Stale allowlist entries fail the gate. An exemption that outlives its
// module, or survives after a story is finally written, is worse than no
// allowlist: it hides a gap while looking deliberate.
//
// Usage: node tools/storybook/story-coverage.mjs [--json]

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const VIEWS = join(REPO, "src", "views");
const ALLOWLIST = join(REPO, "tools", "storybook", "story-coverage-allowlist.json");
const jsonMode = process.argv.includes("--json");

/**
 * A module is renderable when it exports a create or render function that takes a parent element,
 * either directly or through an options object carrying `parent`.
 *
 * The name alone is not enough: `createStarterViewConfig` returns a config object and has no DOM
 * to show, so a name-only rule demanded a story that could not meaningfully exist and pushed
 * people toward writing a fake one.
 */
const EXPORTED = /^export function ((?:create|render)\w+)\s*\(([^)]*)/gms;

function isRenderable(source) {
  for (const [, , params] of source.matchAll(EXPORTED)) {
    if (params.includes("HTMLElement")) return true;
    const options = /:\s*(\w+Options)/.exec(params);
    if (!options) continue;
    const shape = new RegExp(`interface ${options[1]}\\s*\\{([^}]*)\\}`, "s").exec(source);
    if (shape && /\bparent\b\s*[?:]/.test(shape[1])) return true;
  }
  return false;
}

// ───────────────────────────────────────────────────────────────────
// 3. CORE LOGIC
// ───────────────────────────────────────────────────────────────────

const modules = readdirSync(VIEWS)
  .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts") && !f.endsWith(".stories.ts"))
  .filter((f) => isRenderable(readFileSync(join(VIEWS, f), "utf8")));

const hasStory = (file) => existsSync(join(VIEWS, `${basename(file, ".ts")}.stories.ts`));

const allow = JSON.parse(readFileSync(ALLOWLIST, "utf8")).allow;
const allowMap = new Map(allow.map((a) => [a.path, a.reason]));

const covered = modules.filter(hasStory);
const exempt = modules.filter((m) => !hasStory(m) && allowMap.has(m));
const missing = modules.filter((m) => !hasStory(m) && !allowMap.has(m));

// An exemption for a module that is gone, or that now has a story, must be pruned.
const stale = allow
  .map((a) => a.path)
  .filter((p) => !existsSync(join(VIEWS, p)) || hasStory(p));

const unreasoned = allow.filter((a) => !a.reason || a.reason.trim().length < 12).map((a) => a.path);

// ───────────────────────────────────────────────────────────────────
// 4. REPORT
// ───────────────────────────────────────────────────────────────────

if (jsonMode) {
  console.log(JSON.stringify({ covered, exempt, missing, stale, unreasoned }, null, 2));
} else {
  console.log(`story coverage: ${covered.length}/${modules.length} renderable modules`);
  console.log(`  with stories : ${covered.length}`);
  console.log(`  exempt       : ${exempt.length}`);
  if (missing.length) {
    console.error(`\nMISSING a co-located story (${missing.length}):`);
    for (const m of missing) console.error(`  src/views/${m}  ->  src/views/${basename(m, ".ts")}.stories.ts`);
    console.error("\nWrite one with: npm run story:new src/views/<module>.ts");
    console.error("Or add it to tools/storybook/story-coverage-allowlist.json with a reason.");
  }
  if (stale.length) {
    console.error(`\nSTALE allowlist entries (${stale.length}) — prune these:`);
    for (const p of stale) console.error(`  ${p}`);
  }
  if (unreasoned.length) {
    console.error(`\nAllowlist entries without a real reason (${unreasoned.length}):`);
    for (const p of unreasoned) console.error(`  ${p}`);
  }
}

process.exit(missing.length || stale.length || unreasoned.length ? 1 : 0);
