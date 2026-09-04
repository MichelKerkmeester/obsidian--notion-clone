#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    touch-targets
// COMPONENT: every interactive element measured against the touch floor
// ───────────────────────────────────────────────────────────────────
//
// Reading captures catches what a person notices. It does not catch a control
// that is four pixels short of a thumb, because four pixels is invisible in a
// picture and decisive under a finger.
//
// So this measures instead of looking: every scenario is rendered at phone width
// with a coarse pointer, every interactive element is measured, and anything
// below the floor is reported with the selector that produced it.
//
// THE POINTER MODE IS THE POINT. The stylesheet raises controls under
// `@media (pointer: coarse)`, and a page opened without touch emulation never
// applies those rules — a sibling tool measured 53 checkboxes at 16x16 that a
// phone paints at 28x28, and reported a surface no device renders.
//
// So the mode is forced at the engine and then PROVEN before every scenario is
// measured, rather than asked for once and assumed. `hasTouch` does produce a
// coarse pointer, but one gate run reported 198 controls newly under the floor
// that eleven later runs could not reproduce, and the premise check added with
// this comment caught the same page answering `pointer: coarse` with false.
// Losing the mode does not shrink these numbers, it inflates them — so a run
// that cannot establish its own premise now refuses and names the scenario
// instead of publishing a count that accuses the product.
//
// THE FLOOR IS THIS PROJECT'S, NOT THE ONE I WOULD PICK. WCAG 2.5.5 Enhanced is
// 44px, and measuring against it reports 784 controls short — but the packet
// declares 28px as the control minimum under a coarse pointer, and separately
// records the 48dp handle standard as an accepted operator shortfall that is not
// to be reopened. A check that fails 784 controls against a standard the project
// examined and did not adopt is not a finding, it is a disagreement wearing a
// number.
//
// So the floor is 28. Controls between 28 and 44 are counted and reported as
// informational, because that gap is a live question someone may want to revisit
// — but it does not fail a run, and nothing here decides it on their behalf.
// Rows and action bars ARE held to 44 elsewhere, by the placement lane, which is
// the right place for a per-surface rule.
//
// A HAND-WRITTEN FIXTURE IS NOT THE ONLY SURFACE THIS MEASURES. `scenarios.mjs`
// depicts what a renderer builds, but depicting is not building — a control the
// renderer emits that no fixture mirrors is invisible to the fixture pass alone.
// So after every fixture scenario, this also mounts every production renderer
// scenario the render-assertion harness knows — the same bundle, the same
// scenario list, esbuild and a real src/views module rather than hand-written
// markup — and measures that DOM too. Both passes record every row with a
// `source` field (`fixture` or `constructed`) rather than merging silently,
// because a control invisible to one pass and caught by the other is exactly
// the gap this second pass exists to close.
//
// Usage: node tools/live/touch-targets.mjs [--json]
// Exit:  0 when every undeclared interactive element clears the floor, in both passes.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { buildRenderAssertionBundle, SCENARIOS_WITH_STATES as RENDERER_SCENARIOS } from "./render-assertion-bundle.mjs";
import { scenarioLabel } from "./render-scenario-utils.mjs";
import { SCENARIOS } from "../screenshots/scenarios.mjs";
import { asPageScript } from "./page-module-script.mjs";
import { stamp } from "./evidence.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HERE = fileURLToPath(new URL(".", import.meta.url));
const STAMP_PATH = "tools/live/touch-targets.json";
const FLOOR = 28;
/** Reported, never enforced: the gap between this project's floor and WCAG 2.5.5 Enhanced. */
const ENHANCED = 44;

// ───────────────────────────────────────────────────────────────────
// 2. WHAT COUNTS, AND WHAT IS ALLOWED TO BE SMALL
// ───────────────────────────────────────────────────────────────────

const INTERACTIVE = [
  "button",
  "a[href]",
  "input:not([type=hidden])",
  "select",
  "textarea",
  '[role="button"]',
  '[role="menuitem"]',
  '[role="tab"]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Controls that sit below the floor on purpose.
 *
 * Each carries its reason. A declaration is a claim someone has to defend, which is why these are
 * listed rather than filtered out by a broad selector — a selector wide enough to hide these would
 * hide the next regression with them. Shared by both passes: the reason a checkbox's bounding box
 * misses its real hit area does not change depending on whether a fixture or a real renderer drew it.
 */
const DECLARED = [
  {
    match: "internal-link",
    reason: "an inline text link inside a paragraph; target-size rules exempt inline text, and"
      + " padding one out would break the line box it sits in",
  },
  {
    match: "db-checkbox",
    reason: "the checkbox paints at 28px and takes its touch area from a ::before inset, which a"
      + " bounding box does not include; the checkbox tool measures that surface directly",
  },
  {
    match: "db-mobile-bottom-sheet-handle",
    reason: "the grab bar is 4px tall by design and hit-tests as a full-width band above it",
  },
  {
    match: "db-board-pagination-dot",
    reason: "the dot paints at 12px and takes its touch area from a ::before inset of -16px on"
      + " every side (styles.css's coarse-pointer board-pagination block), a 44px effective hit"
      + " area a bounding box does not include — the same shape as the checkbox exemption above."
      + " Found by the constructed-renderer pass: no fixture mounts the board's pagination dots.",
  },
];

// ───────────────────────────────────────────────────────────────────
// 3. MEASURE
// ───────────────────────────────────────────────────────────────────

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  for (const candidate of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ]) if (existsSync(candidate)) return candidate;
  throw new Error("touch-targets: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

// The coarse pointer is forced at the engine, not asked for at the context.
//
// `hasTouch` does give `pointer: coarse` — measured, three ways — but not reliably for the whole
// life of a run: one gate run measured 198 controls that no later run could reproduce, and the
// premise check below caught the same page reporting `pointer: coarse` as false. Blink's own
// setting cannot drift the way a context flag did: 2 is COARSE and 1 is NONE-hover in its pointer
// and hover enums, which is what a phone reports.
const browser = await chromium.launch({
  executablePath: findChrome(),
  args: ["--blink-settings=primaryPointerType=2,availablePointerTypes=2,primaryHoverType=1,availableHoverTypes=1"],
});
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  reducedMotion: "reduce",
});

const styles = readFileSync(join(REPO, "styles.css"), "utf8");
const theme = readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8");
const runtime = readFileSync(join(REPO, "tools/screenshots/runtime-vars.css"), "utf8");

// THE RUN HAS TO PROVE ITS OWN PREMISE BEFORE IT MEASURES ANYTHING.
//
// Everything below is measured through two conditions: that the page reports a coarse pointer, and
// that the plugin's stylesheet is actually attached. Lose either and the numbers do not shrink —
// they GROW, because the coarse rules are what raise these controls, so a broken run looks exactly
// like a tree that regressed 198 controls at once. That reading appeared in one gate run and could
// not be reproduced in eleven, which is the worst shape a check can have: an unexplained number
// that accuses the product.
//
// So the premise is asserted rather than assumed, and a run that cannot establish it exits with a
// message naming what was missing instead of a count. A wrong number is worse than no number.
async function assertPremise(page, scenarioId) {
  const state = await page.evaluate(() => ({
    coarse: window.matchMedia("(pointer: coarse)").matches,
    // A control the coarse rules raise, built here rather than borrowed from a scenario so the
    // canary cannot go missing when a fixture changes.
    canary: (() => {
      const probe = document.createElement("input");
      probe.type = "checkbox";
      probe.className = "db-checkbox db-checkbox-row";
      document.body.appendChild(probe);
      const box = probe.getBoundingClientRect();
      probe.remove();
      return { width: Math.round(box.width), height: Math.round(box.height) };
    })(),
  }));
  if (!state.coarse) {
    console.error(`touch-targets: REFUSED on scenario "${scenarioId}" — the page does not report a coarse pointer, so none of the`
      + " rules that raise these controls applied. Every measurement would be of a surface no device"
      + " renders, and the count would be far too high rather than too low.");
    return false;
  }
  if (state.canary.width < FLOOR || state.canary.height < FLOOR) {
    console.error(`touch-targets: REFUSED on scenario "${scenarioId}" — the coarse-pointer canary measured `
      + `${state.canary.width}x${state.canary.height}, under the ${FLOOR}px floor it is raised to.`
      + " The stylesheet is not attached, or the rule that raises it is gone. Either way the run"
      + " would report a number about a page the plugin did not style.");
    return false;
  }
  return true;
}

// ─── PASS 1: FIXTURES ────────────────────────────────────────────────
// scenarios.mjs's hand-written markup, as before: fast, and covers every scenario the screenshot
// corpus depicts. What it cannot prove is bounded in tasks.md's fixture-lane provability record.

const measureScript = asPageScript(join(HERE, "touch-target-measure.mjs"));

const findings = [];
let measured = 0;
let scenariosRendered = 0;

for (const scenario of SCENARIOS) {
  let html;
  try {
    html = scenario.html();
  } catch {
    continue;
  }
  await page.setContent(`<body class="is-phone theme-dark"><div id="shot">${html}</div></body>`);
  for (const content of [styles, theme, runtime]) await page.addStyleTag({ content });
  // `setContent` replaces the document, so both the stylesheets and the measurement script are
  // re-attached every scenario — a premise or a function established before the loop says nothing
  // about the page any particular scenario was measured on.
  await page.addScriptTag({ content: measureScript });
  if (!(await assertPremise(page, scenario.id))) {
    await browser.close();
    process.exit(1);
  }
  scenariosRendered += 1;

  const result = await page.evaluate(
    (opts) => window.measureInteractiveBoxes(opts),
    {
      selector: INTERACTIVE, floor: FLOOR, enhanced: ENHANCED, declared: DECLARED,
      id: scenario.id, source: "fixture",
    },
  );

  measured += result.seen;
  findings.push(...result.rows);
}

// ─── PASS 2: CONSTRUCTED RENDERERS ──────────────────────────────────
// Every scenario render-assertions.mjs knows, mounted through the identical bundle and the
// identical runRenderAssertions() mount path — no mount logic duplicated here, only the
// measurement applied to the container while it is still attached, via the onMounted hook.

const constructedFindings = [];
let constructedMeasured = 0;
let constructedScenariosRendered = 0;
const provenanceFailures = [];

const { work, missingSources } = await buildRenderAssertionBundle(`
import { measureInteractiveBoxes } from "${resolve(HERE, "touch-target-measure.mjs")}";
window.__measureConstructedTouch = (scenario, opts) => {
  let measurement = null;
  let provenance = false;
  runRenderAssertions(document.body, scenario, "", (container, results) => {
    provenance = results.length > 0 && results[0].pass;
    measurement = measureInteractiveBoxes(opts);
  });
  return { measurement, provenance };
};
`);

if (missingSources.length > 0) {
  console.error(`touch-targets: FAIL — the constructed bundle no longer imports ${missingSources.join(", ")}`);
  console.error("  a check that does not bundle the shipped renderer measures nothing about it");
  await browser.close();
  process.exit(1);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body class="is-phone theme-dark"><script src="render-bundle.js"></script></body></html>`);

await page.goto(`file://${join(work, "index.html")}`);
for (const content of [styles, theme, runtime]) await page.addStyleTag({ content });

// The bundle's page is navigated once and every scenario mounts and unmounts inside it — unlike
// the fixture loop, nothing here calls setContent per scenario, so one premise check after the
// stylesheets attach covers every scenario that follows.
if (!(await assertPremise(page, "constructed-renderer bundle"))) {
  rmSync(work, { recursive: true, force: true });
  await browser.close();
  process.exit(1);
}

for (const scenario of RENDERER_SCENARIOS) {
  const label = scenarioLabel(scenario);
  const { measurement, provenance } = await page.evaluate(
    ({ scenario, opts }) => window.__measureConstructedTouch(scenario, opts),
    {
      scenario,
      opts: {
        selector: INTERACTIVE, floor: FLOOR, enhanced: ENHANCED, declared: DECLARED,
        id: label, source: "constructed",
      },
    },
  );
  if (!provenance) {
    provenanceFailures.push(label);
    continue;
  }
  constructedScenariosRendered += 1;
  constructedMeasured += measurement.seen;
  constructedFindings.push(...measurement.rows);
}

rmSync(work, { recursive: true, force: true });
await browser.close();

if (provenanceFailures.length > 0) {
  console.error(`touch-targets: FAIL — ${provenanceFailures.length} constructed scenario(s) did not carry the `
    + `production-render marker: ${provenanceFailures.join(", ")}`);
  console.error("  measuring DOM without the marker would prove nothing about the shipped renderer");
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────
// 4. VERDICT
// ───────────────────────────────────────────────────────────────────

const undeclared = findings.filter((f) => !f.declared && f.belowFloor);
const declaredHits = findings.filter((f) => f.declared);
// Between this project's 28px floor and WCAG 2.5.5's 44px. Counted, not enforced.
const betweenFloors = findings.filter((f) => !f.declared && !f.belowFloor);

const constructedUndeclared = constructedFindings.filter((f) => !f.declared && f.belowFloor);
const constructedDeclaredHits = constructedFindings.filter((f) => f.declared);
const constructedBetweenFloors = constructedFindings.filter((f) => !f.declared && !f.belowFloor);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({
    fixture: { measured, scenariosRendered, undeclared, declaredHits },
    constructed: {
      measured: constructedMeasured, scenariosRendered: constructedScenariosRendered,
      undeclared: constructedUndeclared, declaredHits: constructedDeclaredHits,
    },
  }, null, 2));
  process.exit(undeclared.length === 0 && constructedUndeclared.length === 0 ? 0 : 1);
}

// A RATCHET, NOT A CLIFF. 331 controls sit below this project's own 28px floor today — a real
// finding, and not one a single pass should silently mass-edit: it spans twenty control classes,
// several of which would change every capture and some of which are inline by nature. Resizing
// them is an operator-scale decision about how the plugin feels, not a repair.
//
// So the baseline is recorded and the count may not grow. That prevents the next control from
// arriving under the floor while leaving the existing set to be triaged deliberately. A lane that
// simply reported would never fail, and one that failed on all 331 would be switched off within a
// day — neither protects anything. The constructed pass gets its own baseline file rather than
// sharing the fixture one, because the two passes measure different DOM and a control invisible to
// fixtures needs its own recorded number rather than inflating (or silently padding) the fixture
// count.
const BASELINE_PATH = join(REPO, "tools/live/touch-targets-baseline.json");
const baseline = existsSync(BASELINE_PATH)
  ? JSON.parse(readFileSync(BASELINE_PATH, "utf8"))
  : null;
const CONSTRUCTED_BASELINE_PATH = join(REPO, "tools/live/touch-targets-constructed-baseline.json");
const constructedBaseline = existsSync(CONSTRUCTED_BASELINE_PATH)
  ? JSON.parse(readFileSync(CONSTRUCTED_BASELINE_PATH, "utf8"))
  : null;

// The count is always printed: a run that measured nothing would satisfy "no control is too small"
// without looking at anything, which is the emptiest possible pass.
console.log(`touch-targets: [fixture] ${measured} interactive element(s) across ${scenariosRendered} scenario(s), floor ${FLOOR}px, coarse pointer`);
console.log(`touch-targets: [fixture] ${betweenFloors.length} between ${FLOOR}px and WCAG 2.5.5's ${ENHANCED}px — reported, not enforced\n`);

for (const hit of declaredHits.slice(0, 6)) {
  console.log(`  declared  ${hit.scenario} ${hit.tag}.${hit.classes.split(" ")[0]} ${hit.width}x${hit.height}`);
}
if (declaredHits.length > 6) console.log(`  declared  ...and ${declaredHits.length - 6} more`);

const allowed = baseline ? baseline.under : undeclared.length;

console.log(`  ${undeclared.length} control(s) under ${FLOOR}px, against a recorded baseline of ${allowed}`);
const classes = [...new Set(undeclared.map((f) => f.classes.split(" ")[0]))].sort();
for (const name of classes.slice(0, 12)) {
  const worst = undeclared.filter((f) => f.classes.startsWith(name))
    .sort((a, b) => Math.min(a.width, a.height) - Math.min(b.width, b.height))[0];
  console.log(`    ${name.padEnd(34)} smallest ${worst.width}x${worst.height}`);
}
if (classes.length > 12) console.log(`    ...and ${classes.length - 12} more classes`);

console.log(`\ntouch-targets: [constructed] ${constructedMeasured} interactive element(s) across `
  + `${constructedScenariosRendered} production-renderer scenario(s), floor ${FLOOR}px, coarse pointer`);
console.log(`touch-targets: [constructed] ${constructedBetweenFloors.length} between ${FLOOR}px and `
  + `WCAG 2.5.5's ${ENHANCED}px — reported, not enforced\n`);

for (const hit of constructedDeclaredHits.slice(0, 6)) {
  console.log(`  declared  ${hit.scenario} ${hit.tag}.${hit.classes.split(" ")[0]} ${hit.width}x${hit.height}`);
}
if (constructedDeclaredHits.length > 6) console.log(`  declared  ...and ${constructedDeclaredHits.length - 6} more`);

const constructedAllowed = constructedBaseline ? constructedBaseline.under : constructedUndeclared.length;

console.log(`  ${constructedUndeclared.length} control(s) under ${FLOOR}px, against a recorded baseline of ${constructedAllowed}`);
const constructedClasses = [...new Set(constructedUndeclared.map((f) => f.classes.split(" ")[0]))].sort();
for (const name of constructedClasses.slice(0, 12)) {
  const worst = constructedUndeclared.filter((f) => f.classes.startsWith(name))
    .sort((a, b) => Math.min(a.width, a.height) - Math.min(b.width, b.height))[0];
  console.log(`    ${name.padEnd(34)} smallest ${worst.width}x${worst.height}`);
}
if (constructedClasses.length > 12) console.log(`    ...and ${constructedClasses.length - 12} more classes`);

const fixtureFailed = undeclared.length > allowed;
const constructedFailed = constructedUndeclared.length > constructedAllowed;

if (fixtureFailed || constructedFailed) {
  if (fixtureFailed) {
    console.error(`\ntouch-targets: FAIL [fixture] — ${undeclared.length - allowed} control(s) newly under ${FLOOR}px`);
  }
  if (constructedFailed) {
    console.error(`\ntouch-targets: FAIL [constructed] — ${constructedUndeclared.length - constructedAllowed} `
      + `control(s) newly under ${FLOOR}px`);
  }
  console.error("  Each recorded baseline is awaiting triage; this is about the ones that just arrived.");
  process.exit(1);
}

stamp(STAMP_PATH, {
  fixture: {
    measured, scenarios: scenariosRendered, under: undeclared.length,
    betweenFloors: betweenFloors.length, classes: classes.length,
  },
  constructed: {
    measured: constructedMeasured, scenarios: constructedScenariosRendered, under: constructedUndeclared.length,
    betweenFloors: constructedBetweenFloors.length, classes: constructedClasses.length,
  },
}, [
  "tools/live/touch-targets.mjs",
  "tools/live/touch-target-measure.mjs",
  "tools/live/render-assertion-bundle.mjs",
  "tools/live/render-assertion-harness.ts",
  "tools/screenshots/scenarios.mjs",
  "styles.css",
]);
console.log(`\ntouch-targets: PASS — nothing newly under ${FLOOR}px in either pass `
  + `(fixture baseline ${allowed}, constructed baseline ${constructedAllowed})`);
console.log("  what this does not prove: a bounding box is not a hit area. A control that clears");
console.log("  the floor here can still be hard to hit if something overlaps it, and one that fails");
console.log("  can still be comfortable if its parent carries the press.");
process.exit(0);
