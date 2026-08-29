// ───────────────────────────────────────────────────────────────────
// MODULE:    design-conformance
// COMPONENT: measures adherence to the design system, check by check
// ───────────────────────────────────────────────────────────────────
//
// The design system names six things CI should enforce. Some are enforced,
// some are half enforced, and some were never built — and until now there was no
// way to tell which from the outside, because a suite that runs four of six
// checks and passes looks exactly like one that runs all six.
//
// So this reports every check by name with its number, and says plainly which
// are enforced and which are only counted. A check that is only counted is
// reported as a gap, not folded into a pass.
//
// The point is a figure to drive to zero, not a verdict. "The design system is
// followed" is not a claim anyone can act on; "68 rendered surfaces carry no
// declared role" is.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { stamp } from "./evidence.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SURFACE_WORDS = /(^|-)(menu|popover|panel|sheet|modal|dropdown|picker|peek|tooltip)(-|$)/;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.ts$/.test(entry) && !/\.(test|stories)\.ts$/.test(entry)) out.push(abs);
  }
  return out;
}

const checks = [];
const record = (name, enforced, value, target, note) =>
  checks.push({ name, enforced, value, target, note, conforms: value === target });

// ───────────────────────────────────────────────────────────────────
// 3. CONTRACT SCAN — a floating surface created outside openSurface()
// ───────────────────────────────────────────────────────────────────

// Counted by finding element creations whose class is surface-shaped, then subtracting the ones
// that reach the factory. It is a count and not yet a gate: making it a gate means migrating every
// site, and a gate that fails on day one from known debt is one people learn to disable.
let rawSurfaceMounts = 0;
const rawSites = [];
for (const file of walk(join(REPO, "src"))) {
  const text = readFileSync(file, "utf8");
  if (!text.includes("db-")) continue;
  const rel = relative(REPO, file);
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      /^create(El|Div)$/.test(node.expression.name.getText(source))
    ) {
      const literal = node.arguments.find((a) => ts.isObjectLiteralExpression(a));
      if (literal) {
        for (const prop of literal.properties) {
          if (!ts.isPropertyAssignment(prop) || prop.name.getText(source) !== "cls") continue;
          if (!ts.isStringLiteral(prop.initializer)) continue;
          const surface = prop.initializer.text.split(/\s+/).find((c) => SURFACE_WORDS.test(c));
          if (!surface) continue;
          const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
          rawSurfaceMounts += 1;
          rawSites.push(`${rel}:${line + 1}  .${surface}`);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}
record("contract scan — surfaces created outside openSurface()", false, rawSurfaceMounts, 0,
  "counted, not gated: gating today would fail on known debt");

// ───────────────────────────────────────────────────────────────────
// 4. REGISTRY EQUALITY — observed roots against declared producers
// ───────────────────────────────────────────────────────────────────

const censusPath = join(REPO, "tools/live/surface-census.json");
if (existsSync(censusPath)) {
  const census = JSON.parse(readFileSync(censusPath, "utf8"));
  record("registry equality — rendered surfaces with no declared role", false,
    census.totals.unroled, 0, "the registry holds five producers; the rest are unmigrated");
  record("reachability — buildable surfaces no fixture renders", false,
    census.totals.buildableNotRendered, 0,
    "nothing photographs or measures these, so nothing would notice if they broke");
  record("token boundary — rendered surfaces without plugin tokens", true,
    census.totals.untokened, 0, "enforced by the token root; held through five later phases");
} else {
  record("registry equality", false, -1, 0, "no census on disk — run surface-census.mjs");
}

// ───────────────────────────────────────────────────────────────────
// 5. WIDTHS — a call site that types a number instead of naming a role
// ───────────────────────────────────────────────────────────────────

const positioner = readFileSync(join(REPO, "src/views/popover-position.ts"), "utf8");
let bespokeWidths = 0;
for (const file of walk(join(REPO, "src"))) {
  const text = readFileSync(file, "utf8");
  if (!text.includes("positionToolbarPopover")) continue;
  for (const m of text.matchAll(/positionToolbarPopover\([^;]*?\{([^}]*)\}/gs)) {
    if (/(preferredWidth|maxWidth|minWidth)\s*:\s*\d/.test(m[1])) bespokeWidths += 1;
  }
}
record("width policy — call sites typing a width instead of naming a role", false,
  bespokeWidths, 0, "the design system says a role owns its width");

const defaultWidth = positioner.match(/preferredWidth\s*=\s*options\.preferredWidth\s*\?\?\s*([^;]+);/);
record("width policy — the widthless default is a role width, not a literal", true,
  defaultWidth && /COMPACT_MENU_POPOVER/.test(defaultWidth[1]) ? 0 : 1, 0,
  "a caller stating nothing gets the compact role width");

// ───────────────────────────────────────────────────────────────────
// 6. DEAD MARKERS — a class in source that nothing styles
// ───────────────────────────────────────────────────────────────────

const css = readFileSync(join(REPO, "styles.css"), "utf8");
// A marker is dead only when NOTHING consumes it — no rule styles it and no code queries it.
//
// A first version checked the stylesheet alone and reported `db-list-row-checkbox` as dead. It is
// not: it appears in a selector list that drives keyboard navigation, so removing it would have
// broken roving tabindex to satisfy a checker. A class with a consumer is not dead just because the
// consumer is not CSS.
const deadMarkers = [];
for (const marker of ["db-anchored-popover", "db-list-row-checkbox"]) {
  const files = walk(join(REPO, "src"));
  const setBy = files.filter((f) => {
    const t = readFileSync(f, "utf8");
    return t.includes(`"${marker}"`) || t.includes(`cls: "${marker}`);
  });
  // Queried anywhere — a selector string, a closest(), a contains() — counts as a consumer.
  const queried = files.some((f) => readFileSync(f, "utf8").includes(`.${marker}`));
  const styled = css.includes(`.${marker}`);
  if (setBy.length > 0 && !styled && !queried) deadMarkers.push(marker);
}
record("dead markers — classes the source sets and no rule matches", false,
  deadMarkers.length, 0, deadMarkers.length ? deadMarkers.join(", ") : "none of the known two");

// ───────────────────────────────────────────────────────────────────
// 7. Z-INDEX LITERALS — raising a number instead of portalling
// ───────────────────────────────────────────────────────────────────

const zLiterals = [...css.matchAll(/^\s*z-index:\s*(-?\d+)\s*(!important)?;/gm)]
  .map((m) => Number(m[1]))
  .filter((n) => n > 110);
record("layering — z-index literals above the declared tiers", false, zLiterals.length, 0,
  zLiterals.length ? `highest ${Math.max(...zLiterals)}` : "every layer comes from a token");

// ───────────────────────────────────────────────────────────────────
// 8. CASCADE — duplicated selectors with an undecided winner
// ───────────────────────────────────────────────────────────────────

const cascadePath = join(REPO, "tools/live/cascade-audit.json");
if (existsSync(cascadePath)) {
  const cascade = JSON.parse(readFileSync(cascadePath, "utf8"));
  record("cascade — property values overridden by a later duplicate block", false,
    cascade.totals.conflicts, 0, "each needs a disposition: intended, or a defect");
}

// ───────────────────────────────────────────────────────────────────
// 9. GATED CHECKS — the ones that already fail the build
// ───────────────────────────────────────────────────────────────────

const gated = (name, cmd, args) => {
  try {
    execFileSync(cmd, args, { cwd: REPO, stdio: "pipe" });
    return { name, ok: true };
  } catch {
    return { name, ok: false };
  }
};
const gatedResults = [
  gated("placement geometry", "npm", ["run", "storybook:placement"]),
  gated("story coverage", "npm", ["run", "storybook:coverage"]),
  gated("handoff replay", "node", ["tools/live/replay.mjs"]),
];
for (const g of gatedResults) record(`gated — ${g.name}`, true, g.ok ? 0 : 1, 0, g.ok ? "passing" : "FAILING");

// ───────────────────────────────────────────────────────────────────
// 10. REPORT
// ───────────────────────────────────────────────────────────────────

const width = Math.max(...checks.map((c) => c.name.length));
const enforced = checks.filter((c) => c.enforced);
const counted = checks.filter((c) => !c.enforced);
const failing = checks.filter((c) => !c.conforms);

console.log("design-conformance: adherence to the design system, check by check\n");
console.log("  ENFORCED — these fail the build today");
for (const c of enforced) {
  console.log(`    ${c.conforms ? "ok  " : "FAIL"}  ${c.name.padEnd(width)}  ${c.value}/${c.target}`);
}
console.log("\n  COUNTED — measured, not yet gated");
for (const c of counted) {
  console.log(`    ${c.conforms ? "ok  " : "gap "}  ${c.name.padEnd(width)}  ${c.value}/${c.target}`);
  if (!c.conforms && c.note) console.log(`          ${c.note}`);
}

const gaps = counted.filter((c) => !c.conforms);
console.log(`\n  ${enforced.filter((c) => c.conforms).length}/${enforced.length} enforced checks conform`);
console.log(`  ${gaps.length} of ${counted.length} counted checks are gaps\n`);

if (rawSites.length) {
  console.log("Surfaces created without the factory, first ten:");
  for (const s of rawSites.slice(0, 10)) console.log(`  ${s}`);
  console.log(`  ... ${rawSites.length} in total\n`);
}

stamp("tools/live/design-conformance.json", { checks, rawSites }, [
  "styles.css",
  "tools/live/design-conformance.mjs",
  "src/views/popover-position.ts",
]);

// Only the enforced checks decide the exit code. A gap is a number to work down, and failing the
// build on known debt is how a check gets switched off.
process.exit(failing.some((c) => c.enforced) ? 1 : 0);
