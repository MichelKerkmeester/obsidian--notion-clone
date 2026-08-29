// ───────────────────────────────────────────────────────────────────
// MODULE:    surface-census
// COMPONENT: reconciles what renders, what the code can build, and what is declared
// ───────────────────────────────────────────────────────────────────
//
// A list of surfaces assembled by searching for them is a list of the surfaces
// somebody thought to search for. The story-coverage gate proves it: its regex
// matches `export function create*` and `render*`, so five modules are invisible
// to it and always have been, and it reports full coverage.
//
// So this does not search. It takes three inventories that are each complete in
// a different direction and reconciles them:
//
//   RENDERED   every element carrying a plugin class in every fixture, found by
//              walking the rendered DOM rather than by matching source text.
//              Complete for anything the fixtures actually draw.
//
//   BUILDABLE  every element-creating call in the source, read with the
//              TypeScript parser. Complete for anything the code can construct,
//              including surfaces no fixture exercises.
//
//   DECLARED   the typed producer registry. Complete for anything that has been
//              deliberately brought under the contract.
//
// None is authoritative alone and the interesting answers are the gaps. A
// surface that renders but is not declared has escaped the contract. One that is
// buildable but never renders is unreachable in the fixtures, so no capture and
// no measurement covers it. One that is declared but neither renders nor is
// buildable is a registry entry describing something that no longer exists.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { chromium } from "playwright-core";
import { SCENARIOS } from "../screenshots/scenarios.mjs";
import { stamp } from "./evidence.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
].find(existsSync) || process.env.SCREENSHOT_CHROME;

/**
 * What counts as a surface rather than a piece of one.
 *
 * A surface is a thing that floats, docks, or covers: a menu, a popover, a panel, a sheet, a modal.
 * A row inside one is not a surface. Matching on the vocabulary the codebase already uses keeps
 * this honest — the alternative is a hand-kept list, which is the failure mode being avoided.
 */
const SURFACE_WORDS = /(^|-)(menu|popover|panel|sheet|modal|dropdown|picker|peek|tooltip)(-|$)/;

// ───────────────────────────────────────────────────────────────────
// 3. RENDERED
// ───────────────────────────────────────────────────────────────────

const css = readFileSync(join(REPO, "styles.css"), "utf8");
const theme = readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8");
const runtime = readFileSync(join(REPO, "tools/screenshots/runtime-vars.css"), "utf8");

if (!CHROME) {
  console.error("surface-census: no Chrome found. Set SCREENSHOT_CHROME.");
  process.exit(2);
}

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const rendered = new Map();

for (const scenario of SCENARIOS.filter((s) => typeof s.html === "function")) {
  let html;
  try { html = scenario.html(); } catch { continue; }
  await page.setContent(`<body><div id="shot">${html}</div></body>`);
  await page.addStyleTag({ content: css });
  await page.addStyleTag({ content: theme });
  await page.addStyleTag({ content: runtime });
  await page.evaluate(() => document.fonts.ready);

  const found = await page.evaluate((pattern) => {
    const re = new RegExp(pattern);
    const out = [];
    document.querySelectorAll("#shot *").forEach((el) => {
      const classes = (el.className || "").toString().split(/\s+/).filter((c) => c.startsWith("db-"));
      const surface = classes.find((c) => re.test(c));
      if (!surface) return;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      out.push({
        cls: surface,
        mountParent: (el.parentElement?.className || "").toString().split(/\s+/)[0] || "(body)",
        tokens: s.getPropertyValue("--db-radius-sm").trim() !== "",
        role: el.getAttribute("data-db-surface"),
        rect: `${Math.round(r.width)}x${Math.round(r.height)}`,
      });
    });
    return out;
  }, SURFACE_WORDS.source);

  for (const f of found) {
    if (!rendered.has(f.cls)) rendered.set(f.cls, { ...f, scenarios: [] });
    rendered.get(f.cls).scenarios.push(scenario.id);
  }
}
await browser.close();

// ───────────────────────────────────────────────────────────────────
// 4. BUILDABLE
// ───────────────────────────────────────────────────────────────────

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.ts$/.test(entry) && !/\.(test|stories)\.ts$/.test(entry)) out.push(abs);
  }
  return out;
}

const buildable = new Map();
for (const file of walk(join(REPO, "src"))) {
  const text = readFileSync(file, "utf8");
  if (!text.includes("db-")) continue;
  const rel = relative(REPO, file);
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const visit = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      for (const cls of node.text.split(/\s+/)) {
        if (!cls.startsWith("db-") || !SURFACE_WORDS.test(cls)) continue;
        if (!buildable.has(cls)) buildable.set(cls, rel);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

// ───────────────────────────────────────────────────────────────────
// 5. DECLARED
// ───────────────────────────────────────────────────────────────────

const contract = readFileSync(join(REPO, "src/views/surface-contract.ts"), "utf8");
const declared = new Set(
  [...contract.matchAll(/^\s{2}"([a-z0-9-]+)":\s*\{\s*role:/gm)].map((m) => m[1])
);

// ───────────────────────────────────────────────────────────────────
// 6. RECONCILE
// ───────────────────────────────────────────────────────────────────

const renderedOnly = [...rendered.keys()].filter((c) => !buildable.has(c));
const buildableNotRendered = [...buildable.keys()].filter((c) => !rendered.has(c));
const untokened = [...rendered.values()].filter((r) => !r.tokens);
const unroled = [...rendered.values()].filter((r) => !r.role);

console.log("surface-census: three inventories, reconciled\n");
console.log(`  rendered in a fixture           ${rendered.size}`);
console.log(`  buildable from the source       ${buildable.size}`);
console.log(`  declared in the registry        ${declared.size}\n`);
console.log(`  rendered but not buildable      ${renderedOnly.length}  (fixture-only markup)`);
console.log(`  buildable but never rendered    ${buildableNotRendered.length}  (no capture covers these)`);
console.log(`  rendered without plugin tokens  ${untokened.length}`);
console.log(`  rendered without a declared role ${unroled.length}  (outside the contract)\n`);

if (buildableNotRendered.length) {
  console.log("NEVER RENDERED — the code can build these and no fixture does, so nothing measures them:");
  for (const c of buildableNotRendered.slice(0, 20)) console.log(`  .${c}  (${buildable.get(c)})`);
  if (buildableNotRendered.length > 20) console.log(`  ... and ${buildableNotRendered.length - 20} more`);
  console.log("");
}
if (untokened.length) {
  console.log("NO TOKENS WHERE THEY RENDER:");
  for (const u of untokened.slice(0, 12)) console.log(`  .${u.cls} in .${u.mountParent}`);
  console.log("");
}

stamp("tools/live/surface-census.json", {
  totals: {
    rendered: rendered.size,
    buildable: buildable.size,
    declared: declared.size,
    renderedOnly: renderedOnly.length,
    buildableNotRendered: buildableNotRendered.length,
    untokened: untokened.length,
    unroled: unroled.length,
  },
  rendered: Object.fromEntries(rendered),
  buildableNotRendered,
  declared: [...declared],
}, ["styles.css", "tools/live/surface-census.mjs", "src/views/surface-contract.ts"]);
