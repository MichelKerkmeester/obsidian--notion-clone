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
      const classes = (el.className || "").toString().split(/\s+/).filter((c) => c.startsWith("obnotion-"));
      const surface = classes.find((c) => re.test(c));
      if (!surface) return;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      out.push({
        cls: surface,
        mountParent: (el.parentElement?.className || "").toString().split(/\s+/)[0] || "(body)",
        tokens: s.getPropertyValue("--obnotion-radius-sm").trim() !== "",
        role: el.getAttribute("data-obnotion-surface"),
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
  if (!text.includes("obnotion-")) continue;
  const rel = relative(REPO, file);
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  // TEMPLATE CHUNKS COUNT, AND LEAVING THEM OUT ACCUSED THE FIXTURES.
  //
  // This read plain strings and no-substitution templates only, so every class written as
  // `cls: `obnotion-dropdown-popover ${context}`` was invisible to it. The reconciliation below then
  // reported those classes as "rendered but not buildable — fixture-only markup", which is a
  // picture of something the plugin does not make. All seven it named were built by the plugin,
  // every one of them from a template literal.
  //
  // A chunk that runs into a substitution ends mid-token — `obnotion-option-color-` before `${color}` —
  // so the token touching the boundary is dropped rather than recorded. Recording it would trade
  // one wrong inventory for another, and a prefix is exactly the shape that looks like a real
  // class to a `obnotion-` test.
  const collect = (text, dropFirst, dropLast) => {
    const parts = text.split(/\s+/);
    if (dropFirst && parts.length) parts.shift();
    if (dropLast && parts.length) parts.pop();
    for (const cls of parts) {
      if (!cls.startsWith("obnotion-") || !SURFACE_WORDS.test(cls)) continue;
      if (!buildable.has(cls)) buildable.set(cls, rel);
    }
  };
  // Whether a substitution can extend the token that runs into it.
  //
  // `${disabled ? " is-disabled" : ""}` cannot: every value it produces is empty or starts with a
  // space, so `obnotion-chart-options-popover-entry` before it is a whole class. `${color}` can, so
  // `obnotion-option-color-` before it is a prefix and is dropped. Only literals are read — an identifier
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

// ───────────────────────────────────────────────────────────────────
// 6b. RECORD-SURFACE BUILDER CENSUS — source-level, not DOM
// ───────────────────────────────────────────────────────────────────
//
// The census the componentization goal asks for reads "one page rendering the same column through
// every consumer" — a DOM census. `buildPropertyRow` (`src/views/record-surface/property-row.ts`)
// takes its row and label classes from its caller by design, so a switching consumer keeps its own
// stylesheet rules and moves no capture; the side effect is that four consumers render four
// different class names off the one builder, and counting classes in the rendered DOM reads 4 for a
// convergence that already happened. This section counts the thing that actually converged instead:
// which function built the header or the row, read from each consumer's own source text, never from
// what class the result carries.
const RECORD_SURFACE_CONSUMERS = [
  "src/views/record-detail-panel.ts",
  "src/views/table-record-peek.ts",
  "src/views/board-card-properties-panel.ts",
];
const HEADER_BUILDER_NAMES = new Set(["buildDesktopRecordHeader", "buildPhoneRecordHeader"]);
const ROW_BUILDER_NAMES = new Set(["buildPropertyRow", "buildCheckboxPropertyRow", "renderCardField"]);
const BUILDER_NAMES = new Set([...HEADER_BUILDER_NAMES, ...ROW_BUILDER_NAMES]);
// The class name a primitive assigns its own header or row root when a caller does not override it.
// That string belongs in the primitive's own file or in a builder call's own class option; anywhere
// else in a consumer it names an element the consumer put that class on itself.
const HAND_BUILT_HEADER_CLASSES = new Set(["obnotion-record-detail-header", "obnotion-record-peek-header", "obnotion-panel-header"]);
const HAND_BUILT_ROW_CLASSES = new Set(["obnotion-record-detail-field", "obnotion-record-peek-field", "obnotion-column-manager-row"]);
// Reading only `createDiv({ cls })` was the earlier shape of this check and it could not see the
// bypasses these files have actually carried: the peek built its header and every field through a
// local `createChild(parent, tag, className)` helper that assigns `element.className`, and the board
// panel's rows were `createDiv` calls — one form visible, the other not. So the check no longer asks
// HOW an element got its class. Every string literal in the file is read, and a literal naming one
// of the classes above is a hand-built header or row unless it is one of the two shapes that legitimately
// carry it: a CSS selector (leading `.`, passed to a query/`closest`/`matches`), or a class option
// inside a call to one of the shared builders, which is exactly the caller-supplied-class design.
// That covers `cls:`, `createEl("div", { cls })`, a `className` assignment, `classList.add`,
// `addClass`, `setAttribute("class", …)` and any helper that forwards a class string, because it
// reads the literal rather than the call around it.
const SELECTOR_METHODS = new Set(["querySelector", "querySelectorAll", "closest", "matches", "getElementsByClassName"]);
// One documented reuse that is not a row: the peek's "no properties" notice borrows the field class
// for its styling and carries the empty marker beside it. It is a message, not a property row, so it
// is reported on its own line rather than counted against the zero threshold — and any OTHER literal
// carrying a row class still goes red, including a second notice that dropped the marker.
const NON_ROW_REUSE_MARKERS = new Set(["obnotion-record-peek-empty"]);

/** True when this literal is a CSS selector rather than a class being assigned. */
function isSelectorLiteral(node, text) {
  if (text.trim().startsWith(".")) return true;
  const call = node.parent;
  return Boolean(call && ts.isCallExpression(call) && ts.isPropertyAccessExpression(call.expression)
    && SELECTOR_METHODS.has(call.expression.name.text));
}

/** True when this literal is a class option handed to one of the shared builders by its caller. */
function isBuilderClassOption(node) {
  const prop = node.parent;
  if (!prop || !ts.isPropertyAssignment(prop)) return false;
  for (let n = prop.parent; n; n = n.parent) {
    if (ts.isCallExpression(n)) {
      return ts.isIdentifier(n.expression) && BUILDER_NAMES.has(n.expression.text);
    }
  }
  return false;
}

function censusRecordSurfaceFile(file) {
  const text = readFileSync(join(REPO, file), "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const result = { file, headerBuilderCalls: 0, rowBuilderCalls: 0, handBuiltHeaders: [], handBuiltRows: [], nonRowReuse: [] };
  const visit = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      if (HEADER_BUILDER_NAMES.has(node.expression.text)) result.headerBuilderCalls += 1;
      if (ROW_BUILDER_NAMES.has(node.expression.text)) result.rowBuilderCalls += 1;
    }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const tokens = node.text.split(/\s+/).filter(Boolean);
      const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
      const named = tokens.filter((t) => HAND_BUILT_HEADER_CLASSES.has(t) || HAND_BUILT_ROW_CLASSES.has(t));
      if (named.length && !isSelectorLiteral(node, node.text) && !isBuilderClassOption(node)) {
        const where = `${named.join("+")} (:${line})`;
        if (tokens.some((t) => NON_ROW_REUSE_MARKERS.has(t))) result.nonRowReuse.push(where);
        else if (named.some((t) => HAND_BUILT_HEADER_CLASSES.has(t))) result.handBuiltHeaders.push(where);
        else result.handBuiltRows.push(where);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return result;
}

const recordSurfaceCensus = RECORD_SURFACE_CONSUMERS.map(censusRecordSurfaceFile);
const handBuiltTotal = recordSurfaceCensus.reduce(
  (sum, r) => sum + r.handBuiltHeaders.length + r.handBuiltRows.length, 0,
);
const nonRowReuseTotal = recordSurfaceCensus.reduce((sum, r) => sum + r.nonRowReuse.length, 0);

console.log("record-surface builder census: source-level, not DOM\n");
for (const r of recordSurfaceCensus) {
  console.log(`  ${r.file}`);
  console.log(`    header builder calls   ${r.headerBuilderCalls}`);
  console.log(`    row builder calls      ${r.rowBuilderCalls}`);
  if (r.nonRowReuse.length) console.log(`    row class, not a row    ${r.nonRowReuse.join(", ")}`);
  if (r.handBuiltHeaders.length) console.log(`    HAND-BUILT HEADER       ${r.handBuiltHeaders.join(", ")}`);
  if (r.handBuiltRows.length) console.log(`    HAND-BUILT ROW          ${r.handBuiltRows.join(", ")}`);
}
console.log(`\n  hand-built headers/rows across the three surfaces: ${handBuiltTotal} (threshold: 0)`);
console.log(`  row classes reused by something that is not a row: ${nonRowReuseTotal} (documented, not counted)\n`);

stamp("tools/live/surface-census.json", {
  totals: {
    rendered: rendered.size,
    buildable: buildable.size,
    declared: declared.size,
    renderedOnly: renderedOnly.length,
    buildableNotRendered: buildableNotRendered.length,
    untokened: untokened.length,
    unroled: unroled.length,
    recordSurfaceHandBuilt: handBuiltTotal,
  },
  rendered: Object.fromEntries(rendered),
  buildableNotRendered,
  declared: [...declared],
  recordSurfaceCensus,
}, ["styles.css", "tools/live/surface-census.mjs", "src/views/surface-contract.ts", ...RECORD_SURFACE_CONSUMERS]);

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
if (handBuiltTotal > 0) {
  console.error(`surface-census: FAIL — ${handBuiltTotal} hand-built record-surface header(s)/row(s)`
    + " found across record-detail-panel.ts, table-record-peek.ts and board-card-properties-panel.ts."
    + " A consumer is constructing a header or row's own root element directly instead of calling"
    + " the shared record-surface builder for it — see the census above for which file and class.");
  process.exit(1);
}
console.log(`surface-census: PASS — every class a fixture renders can be built from the source `
  + `(${rendered.size} rendered, ${buildable.size} buildable, ${buildableNotRendered.length} awaiting a fixture);`
  + ` zero hand-built record-surface headers/rows across the three named consumers`);
console.log("  what this does not prove: a class that can be built is not a class that IS built on");
console.log("  any path a reader reaches, and 132 of them have no fixture at all.");
