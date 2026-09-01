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
  // TEMPLATE CHUNKS COUNT, AND LEAVING THEM OUT ACCUSED THE FIXTURES.
  //
  // This read plain strings and no-substitution templates only, so every class written as
  // `cls: `db-dropdown-popover ${context}`` was invisible to it. The reconciliation below then
  // reported those classes as "rendered but not buildable — fixture-only markup", which is a
  // picture of something the plugin does not make. All seven it named were built by the plugin,
  // every one of them from a template literal.
  //
  // A chunk that runs into a substitution ends mid-token — `db-option-color-` before `${color}` —
  // so the token touching the boundary is dropped rather than recorded. Recording it would trade
  // one wrong inventory for another, and a prefix is exactly the shape that looks like a real
  // class to a `db-` test.
  const collect = (text, dropFirst, dropLast) => {
    const parts = text.split(/\s+/);
    if (dropFirst && parts.length) parts.shift();
    if (dropLast && parts.length) parts.pop();
    for (const cls of parts) {
      if (!cls.startsWith("db-") || !SURFACE_WORDS.test(cls)) continue;
      if (!buildable.has(cls)) buildable.set(cls, rel);
    }
  };
  // Whether a substitution can extend the token that runs into it.
  //
  // `${disabled ? " is-disabled" : ""}` cannot: every value it produces is empty or starts with a
  // space, so `db-chart-options-popover-entry` before it is a whole class. `${color}` can, so
  // `db-option-color-` before it is a prefix and is dropped. Only literals are read — an identifier
  // or a call is unknown, and unknown drops, because a prefix recorded as a class is a wrong
  // inventory in the direction that is hardest to notice.
  const cannotExtend = (expr) => {
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
      return expr.text === "" || /^\s/.test(expr.text);
    }
    if (ts.isConditionalExpression(expr)) {
      return cannotExtend(expr.whenTrue) && cannotExtend(expr.whenFalse);
    }
    if (ts.isParenthesizedExpression(expr)) return cannotExtend(expr.expression);
    return false;
  };
  const visit = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      collect(node.text, false, false);
    } else if (ts.isTemplateExpression(node)) {
      // Read the whole template at once, because whether a chunk's edge token is complete is
      // decided by the substitution beside it, and a chunk on its own cannot see that.
      let dropFirst = false;
      collect(node.head.text, false, !/\s$/.test(node.head.text) && !cannotExtend(node.templateSpans[0].expression));
      for (let i = 0; i < node.templateSpans.length; i += 1) {
        const span = node.templateSpans[i];
        const next = node.templateSpans[i + 1];
        const text = span.literal.text;
        const cutLast = !/\s$/.test(text) && Boolean(next) && !cannotExtend(next.expression);
        collect(text, dropFirst && !/^\s/.test(text), cutLast);
        // A span whose own text does not start with whitespace continues the token its expression
        // produced, so that token is a fragment on this side too.
        dropFirst = true;
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

// FIXTURE-ONLY MARKUP IS A FIDELITY DEFECT, AND IT WAS COUNTED WITHOUT BEING NAMED.
//
// `008` asks for "registry equality between source census and runtime census" and recorded it as
// computable and uncomputed: this number was published in the stamp and printed as a total, and
// nothing said which classes it was or refused to let it grow.
//
// A class that renders in a fixture and cannot be built from the source is a picture of something
// the plugin does not make. Every measurement taken against it — geometry, tokens, touch targets —
// is a measurement of the fixture. That is the failure `020` exists for, arriving from the other
// direction.
if (renderedOnly.length) {
  console.log("FIXTURE-ONLY — a capture draws these and no source file builds them, so anything");
  console.log("measured on them is a measurement of the fixture:");
  for (const c of renderedOnly.slice(0, 20)) {
    console.log(`  .${c}  in .${rendered.get(c).mountParent}  (${rendered.get(c).scenarios[0]})`);
  }
  if (renderedOnly.length > 20) console.log(`  ... and ${renderedOnly.length - 20} more`);
  console.log("");
}
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

// ───────────────────────────────────────────────────────────────────
// 7. THE EQUALITY, ASSERTED
// ───────────────────────────────────────────────────────────────────
//
// `008` asked for "registry equality between source census and runtime census" and recorded it as
// computable and uncomputed — the number was in the stamp and nothing compared it to anything.
//
// It holds in one direction and not the other, and only one of those is an equality this run can
// enforce. `renderedOnly` must be zero: a class a capture draws and the source cannot build is a
// picture of something the plugin does not make, and every measurement taken on it — geometry,
// tokens, touch targets — measures the fixture. That is enforced.
//
// `buildableNotRendered` is 132 and is NOT enforced, because it is a coverage debt rather than a
// falsehood: those classes exist, the plugin builds them, and no fixture has been written yet.
// Failing on it would fail a correct tree, which is the shape this program keeps deleting.
if (renderedOnly.length > 0) {
  console.error(`surface-census: FAIL — ${renderedOnly.length} class(es) render in a fixture that no`
    + " source file builds. Either the fixture is drawing markup the plugin does not make, or this"
    + " scanner cannot see how it is built — check the second before changing the first: all seven"
    + " it named on 2026-09-01 were built from template literals it could not read.");
  process.exit(1);
}
console.log(`surface-census: PASS — every class a fixture renders can be built from the source `
  + `(${rendered.size} rendered, ${buildable.size} buildable, ${buildableNotRendered.length} awaiting a fixture)`);
console.log("  what this does not prove: a class that can be built is not a class that IS built on");
console.log("  any path a reader reaches, and 132 of them have no fixture at all.");
