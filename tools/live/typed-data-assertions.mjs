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
// The table branch reads the same option for its cell renderer rather than its row shape, and the
// chart branch reads it to pick a per-row value column instead of a plain row count.
//
// This check proves the option does something, the same way the readiness wait's negative
// control does: it mounts each scenario below twice, once with `captureData` on and once
// without, and asserts the markers appear ONLY on the "on" side. A check that only asserted the
// "on" side could pass by coincidence — a stray grey badge, an unrelated checkbox — with no proof
// the OPTION is what produced it.
//
// Usage: node tools/live/typed-data-assertions.mjs
// Exit:  0 when captureData:true shows every typed marker for every scenario below and
//        captureData:false shows none of them.

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

// Mounts the given scenario and reads its markers off the DOM (or, for the chart, off the
// harness's own return value — Chart.js draws to a canvas, which a DOM query cannot read) before
// the harness removes the container. A checked checkbox is asked for directly rather than
// counted, because the assertion is "at least one renders checked", not "every checkbox is".
//
// List and table share the select/checkbox/currency shape but not the class names: the card-based
// list renders through card-field-renderer.ts (".db-card-field-number"), the table through
// cell-renderer.ts's own numeric-cell class (".db-numeric-value"). The table adds a date marker
// (no date column exists at the "text" shape, so its class only appears here) and a relation-icon
// marker — the SVG the stub's real-icon table draws inside a relation chip, not the placeholder
// "◆" text an untraced icon name would leave, which is what proves the chip's icon is real rather
// than merely present.
//
// The chart has no per-item DOM at all: a bar chart's marks live inside a <canvas>. Its marker is
// therefore the harness's own `chartValueField` field on the return value — the per-row column key
// the render branch resolved before calling Chart.js — rather than anything read off the page.
const { work, missingSources } = await buildRenderAssertionBundle(`
window.__typedMarkers = (scenario) => {
  let container = null;
  const outcome = runRenderAssertions(document.body, scenario, "", (mounted) => { container = mounted; });
  if (!container) return { mounted: false };
  if (scenario.renderer === "chart") {
    return { mounted: true, perRowValueField: !!outcome.chartValueField };
  }
  if (scenario.renderer === "table") {
    return {
      mounted: true,
      namedSelectPill: !!container.querySelector(".status-badge:not(.status-color-gray)"),
      checkedCheckbox: !!container.querySelector(".db-checkbox-field:checked"),
      currency: Array.from(container.querySelectorAll(".db-numeric-value"))
        .some((el) => el.textContent.includes("\\u20ac")),
      dateValue: !!container.querySelector(".db-date-value"),
      relationIcon: !!container.querySelector(".db-relation-link-icon svg"),
    };
  }
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

// Every renderer this program's own DONE row 6 still names as untyped: list already proved the
// option (kept here as the original negative control), table just gained the production
// CellRenderer, and chart just gained a per-row value column.
const SCENARIOS_UNDER_TEST = [
  { id: "constructed-list", renderer: "list", bag: "file-view" },
  { id: "constructed-table", renderer: "table", bag: "file-view" },
  { id: "constructed-chart", renderer: "chart", bag: "file-view" },
];

const failures = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);

  for (const { id, renderer, bag } of SCENARIOS_UNDER_TEST) {
    const withoutCaptureData = await page.evaluate((scenario) => window.__typedMarkers(scenario), {
      renderer, bag,
    });
    const withCaptureData = await page.evaluate((scenario) => window.__typedMarkers(scenario), {
      renderer, bag, captureData: true,
    });

    console.log(`typed-data-assertions: ${id} mounted twice — the default shape and the capture-sized one\n`);

    const cases = [
      { label: "captureData: false (default, unchanged)", markers: withoutCaptureData, wantMarkers: false },
      { label: "captureData: true (constructed captures)", markers: withCaptureData, wantMarkers: true },
    ];
    for (const { label, markers, wantMarkers } of cases) {
      if (!markers.mounted) {
        failures.push(`${id} — ${label}: did not mount`);
        console.log(`  FAIL  ${id} — ${label} — did not mount`);
        continue;
      }
      for (const [marker, present] of Object.entries(markers)) {
        if (marker === "mounted") continue;
        const ok = present === wantMarkers;
        if (!ok) failures.push(`${id} — ${label}: ${marker} was ${present}, wanted ${wantMarkers}`);
        console.log(`  ${ok ? "PASS" : "FAIL"}  ${id} — ${label} — ${marker}: ${present}`);
      }
    }
    console.log("");
  }
  await page.close();
  for (const error of pageErrors) failures.push(`page error: ${error}`);
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

console.log("\ntyped-data-assertions: PASS — captureData:true renders every typed marker for list, table");
console.log("  and chart (select pill, checkbox, currency, date, relation icon, per-row chart value");
console.log("  field); captureData:false renders none of them, which is the negative control proving");
console.log("  the markers come from the option, not chance.");
process.exit(0);
