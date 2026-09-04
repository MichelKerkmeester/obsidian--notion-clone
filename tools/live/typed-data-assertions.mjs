#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    typed-data-assertions
// COMPONENT: gate check that the harness's capture-sized data option renders real typed states
// ───────────────────────────────────────────────────────────────────
//
// The constructed captures used to mount every bench at its "text" structural-cost shape: every
// column typed "text", every value a placeholder string. A select column rendered as a grey
// no-match badge, a checkbox column never existed, and a currency column printed a raw number —
// so the fixtures stayed the only evidence anyone could point to for what a select pill, a
// checked checkbox or a formatted currency figure actually look like. `ScenarioSpec.captureData`
// (render-assertion-harness.ts) is the fix: opt-in "mixed" columns at a fixture-sized row count,
// with select columns pointed at named, coloured options instead of the bench's placeholder value.
//
// This check proves the option does something, the same way the readiness wait's negative
// control does: it mounts the identical list scenario twice, once with `captureData` on and once
// without, and asserts the markers appear ONLY on the "on" side. A check that only asserted the
// "on" side could pass by coincidence — a stray grey badge, an unrelated checkbox — with no proof
// the OPTION is what produced it.
//
// Usage: node tools/live/typed-data-assertions.mjs
// Exit:  0 when captureData:true shows every typed marker and captureData:false shows none.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { buildRenderAssertionBundle } from "./render-assertion-bundle.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));

// ───────────────────────────────────────────────────────────────────
// 2. BUNDLE
// ───────────────────────────────────────────────────────────────────

// Mounts the given scenario, reads the three markers off the DOM before the harness removes the
// container, and reports which were present. A checked checkbox is asked for directly rather than
// counted, because the assertion is "at least one renders checked", not "every checkbox is".
const { work, missingSources } = await buildRenderAssertionBundle(`
window.__typedMarkers = (scenario) => {
  let container = null;
  runRenderAssertions(document.body, scenario, "", (mounted) => { container = mounted; });
  if (!container) return { mounted: false };
  return {
    mounted: true,
    namedSelectPill: !!container.querySelector(".status-badge:not(.status-color-gray)"),
    checkedCheckbox: !!container.querySelector(".db-checkbox-field:checked"),
    currency: Array.from(container.querySelectorAll(".db-card-field-number"))
      .some((el) => el.textContent.includes("\\u20ac")),
  };
};
`);

if (missingSources.length > 0) {
  console.error(`typed-data-assertions: FAIL — the bundle no longer imports ${missingSources.join(", ")}`);
  console.error("  a check that does not bundle the shipped renderer proves nothing about it");
  process.exit(1);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${REPO}styles.css"></head>
<body class="theme-dark"><script src="render-bundle.js"></script></body></html>`);

// ───────────────────────────────────────────────────────────────────
// 3. RUN
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
  throw new Error("typed-data-assertions: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

const failures = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);

  const withoutCaptureData = await page.evaluate((scenario) => window.__typedMarkers(scenario), {
    renderer: "list", bag: "file-view",
  });
  const withCaptureData = await page.evaluate((scenario) => window.__typedMarkers(scenario), {
    renderer: "list", bag: "file-view", captureData: true,
  });
  await page.close();
  for (const error of pageErrors) failures.push(`page error: ${error}`);

  console.log("typed-data-assertions: constructed-list mounted twice — the default shape and the capture-sized one\n");

  const cases = [
    { label: "captureData: false (default, unchanged)", markers: withoutCaptureData, wantMarkers: false },
    { label: "captureData: true (constructed captures)", markers: withCaptureData, wantMarkers: true },
  ];
  for (const { label, markers, wantMarkers } of cases) {
    if (!markers.mounted) {
      failures.push(`${label}: did not mount`);
      console.log(`  FAIL  ${label} — did not mount`);
      continue;
    }
    for (const [marker, present] of Object.entries(markers)) {
      if (marker === "mounted") continue;
      const ok = present === wantMarkers;
      if (!ok) failures.push(`${label}: ${marker} was ${present}, wanted ${wantMarkers}`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${label} — ${marker}: ${present}`);
    }
  }
} catch (error) {
  failures.push(`harness run failed: ${error.message}`);
} finally {
  if (browser) await browser.close();
  rmSync(work, { recursive: true, force: true });
}

// ───────────────────────────────────────────────────────────────────
// 4. VERDICT
// ───────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(`\ntyped-data-assertions: FAIL — ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("\ntyped-data-assertions: PASS — captureData:true renders a named select pill, a checked");
console.log("  checkbox and a formatted currency figure; captureData:false renders none of them,");
console.log("  which is the negative control proving the markers come from the option, not chance.");
process.exit(0);
