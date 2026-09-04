#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    constructed-state-assertions
// COMPONENT: gate check that the harness's per-view state options render real per-state markers
// ───────────────────────────────────────────────────────────────────
//
// `043`'s own audit left thirteen fixture-only scenarios open because the harness had no way to
// construct the states they depict: a subtask tree, sparse fields, a no-date-field empty state, a
// chart drawn as a single number or as its all-groups-hidden empty state, and three settings
// popovers opened through their own toolbar renderer's real `togglePopover`. This check is the red
// half of building that: each state below is asserted by its own DOM marker, mounted through
// `runRenderAssertions` exactly as `capture.mjs`'s constructed pass will mount it, so a marker that
// never appears fails loudly instead of shipping a capture of an unmounted or wrong-shaped view.
//
// The boolean-option states (subtask tree, sparse fields, empty state, chart variant) are proven
// the same way `typed-data-assertions.mjs` proves `captureData`: mounted twice, option off and
// option on, and the marker is required to appear ONLY on the "on" side — a marker that also
// showed up off would prove nothing about the option. The three toolbar-popover renderers are new
// `ScenarioSpec.renderer` values rather than a boolean on an existing one, so their own "off" state
// is simply that the renderer value does not exist yet, which is what a run against pre-`043`
// `render-assertion-harness.ts` demonstrates directly (the scenario never mounts).
//
// Usage: node tools/live/constructed-state-assertions.mjs

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

// Mounts the given scenario and reads its markers off the DOM before the harness removes the
// container. Every marker is a real class or attribute a production renderer writes — see
// render-assertion-harness.ts's own per-branch assertions for the same selectors.
const { work, missingSources } = await buildRenderAssertionBundle(`
window.__stateMarkers = (scenario) => {
  let container = null;
  runRenderAssertions(document.body, scenario, "", (mounted) => { container = mounted; });
  if (!container) return { mounted: false };
  return {
    mounted: true,
    subtaskToggle: !!container.querySelector(".db-subtask-toggle, .db-subtask-event-toggle"),
    subtaskProgress: !!container.querySelector(".db-subtask-progress, .db-timeline-subtask-progress"),
    subtaskDepthChild: !!container.querySelector('[data-subtask-depth="1"]'),
    placeholderField: !!container.querySelector(".db-list-field.is-placeholder"),
    emptyDateReason: !!container.querySelector('[data-empty-reason="no-date-field"]'),
    calendarGrid: !!container.querySelector(".db-calendar"),
    chartNumber: !!container.querySelector(".db-chart-number"),
    chartEmpty: !!container.querySelector(".db-chart-empty"),
    chartCanvas: !!container.querySelector(".db-chart-canvas"),
    miniCalendarPopover: !!container.querySelector(".db-calendar-mini-popover .db-calendar-mini-grid"),
    calendarOptionsPopover: !!container.querySelector(".db-calendar-options-popover"),
    timelineOptionsPopover: !!container.querySelector(".db-calendar-timeline-options-popover"),
    chartOptionsPopover: !!container.querySelector(".db-chart-options-popover"),
  };
};
`);

if (missingSources.length > 0) {
  console.error(`constructed-state-assertions: FAIL — the bundle no longer imports ${missingSources.join(", ")}`);
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
  throw new Error("constructed-state-assertions: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

// Paired cases: [id, "off" spec, "on" spec, marker keys that must flip, unaffected marker keys
// that must stay false on both sides (a marker from an unrelated state that a broken branch could
// accidentally trip)].
const PAIRED_CASES = [
  {
    id: "constructed-board-subtask",
    off: { renderer: "board", bag: "file-view", captureData: true },
    on: { renderer: "board", bag: "file-view", captureData: true, subtaskTree: true },
    onMarkers: ["subtaskToggle", "subtaskProgress", "subtaskDepthChild"],
  },
  {
    id: "constructed-timeline-subtask",
    off: { renderer: "timeline", bag: "file-view", captureData: true },
    on: { renderer: "timeline", bag: "file-view", captureData: true, subtaskTree: true },
    onMarkers: ["subtaskToggle", "subtaskProgress", "subtaskDepthChild"],
  },
  {
    id: "constructed-list-sparse",
    off: { renderer: "list", bag: "file-view", captureData: true },
    on: { renderer: "list", bag: "file-view", captureData: true, sparseFields: true },
    onMarkers: ["placeholderField"],
  },
  {
    id: "constructed-calendar-empty",
    off: { renderer: "calendar", bag: "file-view", captureData: true },
    on: { renderer: "calendar", bag: "file-view", captureData: true, emptyState: true },
    onMarkers: ["emptyDateReason"],
    offOnlyMarkers: ["calendarGrid"],
  },
  {
    id: "constructed-chart-number",
    off: { renderer: "chart", bag: "file-view", captureData: true },
    on: { renderer: "chart", bag: "file-view", captureData: true, chartVariant: "number" },
    onMarkers: ["chartNumber"],
    offOnlyMarkers: ["chartCanvas"],
  },
  {
    id: "constructed-chart-empty",
    off: { renderer: "chart", bag: "file-view", captureData: true },
    on: { renderer: "chart", bag: "file-view", captureData: true, chartVariant: "empty" },
    onMarkers: ["chartEmpty"],
    offOnlyMarkers: ["chartCanvas"],
  },
];

// Single-mount cases: brand-new `renderer` values with no boolean to pair against. Their own "off"
// state is a pre-`043` harness where the renderer value does not exist and the scenario never
// mounts — which is exactly the run that established this file's own red, before these branches
// existed.
const SINGLE_CASES = [
  {
    id: "constructed-calendar-mini",
    spec: { renderer: "calendar", bag: "file-view", captureData: true, miniCalendar: true },
    marker: "miniCalendarPopover",
  },
  {
    id: "constructed-calendar-toolbar-options",
    spec: { renderer: "calendar-toolbar", bag: "file-view" },
    marker: "calendarOptionsPopover",
  },
  {
    id: "constructed-timeline-toolbar-options",
    spec: { renderer: "timeline-toolbar", bag: "file-view" },
    marker: "timelineOptionsPopover",
  },
  {
    id: "constructed-chart-toolbar-options",
    spec: { renderer: "chart-toolbar", bag: "file-view" },
    marker: "chartOptionsPopover",
  },
];

const failures = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);

  for (const { id, off, on, onMarkers, offOnlyMarkers } of PAIRED_CASES) {
    const offMarkers = await page.evaluate((scenario) => window.__stateMarkers(scenario), off);
    const onMarkersResult = await page.evaluate((scenario) => window.__stateMarkers(scenario), on);
    console.log(`constructed-state-assertions: ${id} mounted twice — option off and option on\n`);

    for (const [label, markers] of [["off", offMarkers], ["on", onMarkersResult]]) {
      if (!markers.mounted) {
        failures.push(`${id} — ${label}: did not mount`);
        console.log(`  FAIL  ${id} — ${label} — did not mount`);
      }
    }
    if (offMarkers.mounted && onMarkersResult.mounted) {
      for (const marker of onMarkers) {
        const offOk = offMarkers[marker] === false;
        const onOk = onMarkersResult[marker] === true;
        if (!offOk) failures.push(`${id} — off: ${marker} was true, wanted false (proves nothing about the option)`);
        if (!onOk) failures.push(`${id} — on: ${marker} was false, wanted true`);
        console.log(`  ${offOk ? "PASS" : "FAIL"}  ${id} — off — ${marker}: ${offMarkers[marker]}`);
        console.log(`  ${onOk ? "PASS" : "FAIL"}  ${id} — on — ${marker}: ${onMarkersResult[marker]}`);
      }
      for (const marker of offOnlyMarkers || []) {
        const offOk = offMarkers[marker] === true;
        const onOk = onMarkersResult[marker] === false;
        if (!offOk) failures.push(`${id} — off: ${marker} was false, wanted true (the default shape)`);
        if (!onOk) failures.push(`${id} — on: ${marker} was true, wanted false (the state it was replaced by)`);
        console.log(`  ${offOk ? "PASS" : "FAIL"}  ${id} — off — ${marker}: ${offMarkers[marker]}`);
        console.log(`  ${onOk ? "PASS" : "FAIL"}  ${id} — on — ${marker}: ${onMarkersResult[marker]}`);
      }
    }
    console.log("");
  }

  for (const { id, spec, marker } of SINGLE_CASES) {
    const markers = await page.evaluate((scenario) => window.__stateMarkers(scenario), spec);
    console.log(`constructed-state-assertions: ${id} mounted once — a new renderer value with no boolean pair\n`);
    if (!markers.mounted) {
      failures.push(`${id}: did not mount`);
      console.log(`  FAIL  ${id} — did not mount`);
    } else {
      const ok = markers[marker] === true;
      if (!ok) failures.push(`${id}: ${marker} was ${markers[marker]}, wanted true`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${id} — ${marker}: ${markers[marker]}`);
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
  console.error(`\nconstructed-state-assertions: FAIL — ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("\nconstructed-state-assertions: PASS — every per-view state option renders its marker only");
console.log("  when the option is on, and every new toolbar-popover renderer opens its real production");
console.log("  popover through togglePopover().");
process.exit(0);
