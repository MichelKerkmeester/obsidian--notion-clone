#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    unstyled-links
// COMPONENT: catches a capture painting the browser's default link blue
// ───────────────────────────────────────────────────────────────────
//
// A capture reviewer reported the file-field links rendering at #0000EE on a dark row — 1.78:1, and
// unreadable. The plugin does style them: `color: var(--link-color)`. What it does not do is DEFINE
// that token, because `--link-color` is the HOST's, and the capture harness's stand-in stylesheet
// never supplied one. So the declaration resolved to nothing, the user agent's default won, and
// every capture of that surface showed a colour no reader will ever see.
//
// That is the same shape the pinned-values scanner exists for, arriving from the opposite side: not
// a harness value contradicting production, but a harness SILENCE letting the browser answer. Both
// produce a picture of a surface the plugin does not render.
//
// So: render every scenario, find every element whose colour is a user-agent default, and name it.
// The defaults are few and specific — link blue, visited purple, and the active red — which is what
// makes this decidable rather than a taste question.
//
// A HAND-WRITTEN FIXTURE IS NOT THE ONLY SURFACE THIS CHECKS. `scenarios.mjs` depicts what a
// renderer builds, but depicting is not building — a link the renderer emits that no fixture
// mirrors is invisible to the fixture pass alone. So after every fixture scenario, this also mounts
// every production renderer scenario the render-assertion harness knows — the same bundle, the same
// scenario list, esbuild and a real src/views module rather than hand-written markup — and scans
// that DOM too. Every row records a `source` field (`fixture` or `constructed`); both passes fail
// the same zero-tolerance check, since a colour no reader will see is exactly as wrong regardless of
// which pass caught it.
//
// Exit 0 when nothing paints a UA default in either pass, 1 with the list, 2 when the scan rendered nothing.

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

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HERE = fileURLToPath(new URL(".", import.meta.url));

/** Chrome's own link colours. Nothing in a themed plugin should ever resolve to one of these. */
const UA_DEFAULTS = new Map([
  ["rgb(0, 0, 238)", "the user agent's unvisited link blue"],
  ["rgb(85, 26, 139)", "the user agent's visited link purple"],
  ["rgb(255, 0, 0)", "the user agent's active link red"],
]);

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
  throw new Error("unstyled-links: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });

const styles = readFileSync(join(REPO, "styles.css"), "utf8");
const theme = readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8");
const runtime = readFileSync(join(REPO, "tools/screenshots/runtime-vars.css"), "utf8");
const measureScript = asPageScript(join(HERE, "unstyled-links-measure.mjs"));

// ─── PASS 1: FIXTURES ────────────────────────────────────────────────

const findings = [];
let scenariosRendered = 0;
let elementsSeen = 0;

for (const scenario of SCENARIOS) {
  let html;
  try {
    html = scenario.html();
  } catch {
    continue;
  }
  for (const themeClass of ["theme-dark", "theme-light"]) {
    await page.setContent(`<body class="${themeClass}"><div id="shot">${html}</div></body>`);
    for (const content of [styles, theme, runtime]) await page.addStyleTag({ content });
    await page.addScriptTag({ content: measureScript });
    const found = await page.evaluate(
      (opts) => window.measureLinkColours(opts),
      { id: scenario.id, themeName: themeClass, defaults: Object.fromEntries(UA_DEFAULTS), source: "fixture" },
    );
    elementsSeen += found.seen;
    findings.push(...found.rows);
  }
  scenariosRendered += 1;
}

// ─── PASS 2: CONSTRUCTED RENDERERS ──────────────────────────────────
// Every scenario render-assertions.mjs knows, mounted through the identical bundle and the
// identical runRenderAssertions() mount path — no mount logic duplicated here, only the
// measurement applied to the container while it is still attached, via the onMounted hook.

const constructedFindings = [];
let constructedScenariosRendered = 0;
let constructedElementsSeen = 0;
const provenanceFailures = [];

const { work, missingSources } = await buildRenderAssertionBundle(`
import { measureLinkColours } from "${resolve(HERE, "unstyled-links-measure.mjs")}";
window.__measureConstructedLinks = (scenario, control, defaults) => {
  const perTheme = [];
  let provenance = false;
  runRenderAssertions(document.body, scenario, control, (container, results) => {
    provenance = results.length > 0 && results[0].pass;
    for (const themeName of ["theme-dark", "theme-light"]) {
      document.body.classList.remove("theme-dark", "theme-light");
      document.body.classList.add(themeName);
      perTheme.push(measureLinkColours({ id: scenario.name, themeName, defaults, source: "constructed" }));
    }
    document.body.classList.remove("theme-light");
    document.body.classList.add("theme-dark");
  });
  return { perTheme, provenance };
};
`);

if (missingSources.length > 0) {
  console.error(`unstyled-links: FAIL — the constructed bundle no longer imports ${missingSources.join(", ")}`);
  console.error("  a check that does not bundle the shipped renderer scans nothing about it");
  await browser.close();
  process.exit(1);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body class="theme-dark"><script src="render-bundle.js"></script></body></html>`);

await page.goto(`file://${join(work, "index.html")}`);
for (const content of [styles, theme, runtime]) await page.addStyleTag({ content });

for (const scenario of RENDERER_SCENARIOS) {
  const label = scenarioLabel(scenario);
  const { perTheme, provenance } = await page.evaluate(
    ({ scenario, defaults }) => window.__measureConstructedLinks(scenario, "", defaults),
    { scenario, defaults: Object.fromEntries(UA_DEFAULTS) },
  );
  if (!provenance) {
    provenanceFailures.push(label);
    continue;
  }
  constructedScenariosRendered += 1;
  for (const found of perTheme) {
    constructedElementsSeen += found.seen;
    constructedFindings.push(...found.rows);
  }
}

rmSync(work, { recursive: true, force: true });
await browser.close();

if (provenanceFailures.length > 0) {
  console.error(`unstyled-links: FAIL — ${provenanceFailures.length} constructed scenario(s) did not carry the `
    + `production-render marker: ${provenanceFailures.join(", ")}`);
  console.error("  scanning DOM without the marker would prove nothing about the shipped renderer");
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────
// 4. VERDICT
// ───────────────────────────────────────────────────────────────────

const totalScenarios = scenariosRendered + constructedScenariosRendered;
const totalElements = elementsSeen + constructedElementsSeen;
const totalFindings = findings.length + constructedFindings.length;

if (totalScenarios === 0 || totalElements === 0) {
  console.error("unstyled-links: rendered no link to inspect, which is not the same as clean.");
  console.error(`  scenarios=${totalScenarios} links=${totalElements}`);
  process.exit(2);
}

console.log(`unstyled-links: [fixture] ${elementsSeen} link(s) across ${scenariosRendered} scenario(s), both themes`);
console.log(`unstyled-links: [constructed] ${constructedElementsSeen} link(s) across `
  + `${constructedScenariosRendered} production-renderer scenario(s), both themes`);
if (constructedElementsSeen === 0) {
  // A pass on an empty set proves nothing: every render-assertion-harness scenario builds its
  // columns as `"text"` type (LIST_COLUMNS/TABLE_COLUMNS/BOARD_COLUMNS/etc., all `"text"`), so no
  // relation or file-type field is ever constructed and `.internal-link`/`a[href]` markup — built
  // by relation-value-renderer.ts, file-field-renderer.ts, inline-markdown-renderer.ts and
  // cell-renderer.ts, none of it needing a live App to build the DOM — never appears regardless of
  // this pass's own fix. Link colour on those field types stays covered only by the fixture pass's
  // hand-written markup until the harness's own scenario columns carry a relation or file field.
  console.log("  [constructed] 0 links is an EMPTY-SAMPLE result, not evidence of anything: the bench");
  console.log("  columns behind every scenario are text-only, so no relation/file-type field, and no");
  console.log("  .internal-link markup, is ever built here — this pass proves nothing about them.");
}

if (totalFindings > 0) {
  console.error(`\nunstyled-links: FAIL — ${totalFindings} element(s) painted a user-agent default `
    + `(${findings.length} fixture, ${constructedFindings.length} constructed)\n`);
  for (const f of [...findings, ...constructedFindings].slice(0, 12)) {
    console.error(`  [${f.source}] ${f.scenario} (${f.theme})  .${f.cls}  "${f.text}"`);
    console.error(`    ${f.colour} — ${f.why}`);
  }
  if (totalFindings > 12) console.error(`  ...and ${totalFindings - 12} more`);
  console.error("\n  A declaration reading a HOST token the harness never defines resolves to nothing,");
  console.error("  and the browser answers instead. The capture then shows a colour no reader sees.");
  process.exit(1);
}

stamp("tools/live/unstyled-links.json", {
  fixture: { links: elementsSeen, scenarios: scenariosRendered },
  constructed: { links: constructedElementsSeen, scenarios: constructedScenariosRendered },
}, [
  "styles.css",
  "tools/screenshots/theme.css",
  "tools/live/unstyled-links.mjs",
  "tools/live/unstyled-links-measure.mjs",
  "tools/live/render-assertion-bundle.mjs",
  "tools/live/render-assertion-harness.ts",
]);
console.log("unstyled-links: PASS — nothing resolves to a user-agent link colour in either pass");
console.log("  what this does not prove: a colour the harness supplies is the colour the host does.");
console.log("  This catches silence, not disagreement — the pinned-values scan is the other half.");
process.exit(0);
