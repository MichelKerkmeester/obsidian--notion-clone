#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-grammar
// COMPONENT: gate check that every registered phone sheet surface satisfies all seven grammar elements
// ───────────────────────────────────────────────────────────────────
//
// The phone's sheets used to be aligned by hand and verified by eye, and the
// operator found three non-conforming surfaces in one evening. The grammar
// now lives as predicates in `src/views/sheet-grammar.ts`; this lane mounts
// every surface that must conform — through the same constructed seam the
// other renderer lanes use, on a phone page so the surfaces present as the
// sheets the operator sees — and reports one row per surface per element.
// A surface that loses an element fails here instead of on a device.
//
// A check that has never been observed red is not evidence, so the lane also
// runs its own negative control: it removes one element from one conforming
// surface, requires the row for that surface and element to go red while
// every other row stays green, then re-mounts clean and requires green
// again. A control that fails to go red fails the lane.
//
// The registry is deliberate: only surfaces this phase guarantees. The two
// legs that re-dress the column-width adjuster and the settings sheet land
// their own surfaces here when they land; a surface is added when it
// conforms, not when it is hoped to.
//
// Usage: node tools/live/sheet-grammar.mjs

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
// 2. THE REGISTRY
// ───────────────────────────────────────────────────────────────────

// Each entry mounts through the harness's constructed seam on a phone page and must satisfy
// every grammar element. The specs are the same shapes the capture pipeline already constructs.
const REGISTERED_SURFACES = [
  { name: "sort-panel", spec: { renderer: "sort-panel", bag: "file-view", captureData: true } },
  { name: "filter-panel", spec: { renderer: "filter-panel", bag: "file-view", captureData: true } },
  { name: "add-view", spec: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "add-view" } },
  { name: "record-detail", spec: { renderer: "record-detail", bag: "file-view", captureData: true } },
  // On a touch mount the peek hands off to the record sheet, so this row asserts the sheet a
  // phone actually gets rather than the rail a phone cannot use.
  { name: "record-peek", spec: { renderer: "record-peek", bag: "file-view", captureData: true } },
  // The column-width leg landed on main with its own header/close and conforms outright: all
  // seven elements measured green against the real `openColumnWidthAdjuster` module entry.
  { name: "column-width", spec: { renderer: "column-width-adjuster", bag: "file-view", captureData: true } },
  { name: "settings", spec: { renderer: "view-config", bag: "file-view", captureData: true } },
  // The board's own Properties section (`renderBoardCardProperties`), reached through the same
  // `view-config` sheet body as `settings` but with `viewConfigVariant: "board"` so the board
  // branch — cover/title fixed rows plus the reorderable field list — mounts instead of the
  // table branch. Measured 5/7 at `7b976e28` (rows/segmented red on the shared settings-body
  // markup this section does not own); the settings-body grammar landing carried both the fixed
  // rows (`asSheet`) and the shared body onto the grammar, so this row now measures the same
  // shared markup this section always depended on.
  { name: "board-card-properties", spec: { renderer: "view-config", bag: "file-view", captureData: true, viewConfigVariant: "board" } },
];

// The element removed by the negative control: the grab handle, whose loss is exactly the
// "drag handler doesnt work" shape the operator reported.
const NEGATIVE_CONTROL = { surface: "sort-panel", element: "handle" };

// ───────────────────────────────────────────────────────────────────
// 3. BUNDLE
// ───────────────────────────────────────────────────────────────────

const { work, missingSources } = await buildRenderAssertionBundle(`
import { t, setLocale } from "${fileURLToPath(new URL("../../src/i18n.ts", import.meta.url)).replace(/\\/g, "/")}";
import { describeSheetGrammar } from "${fileURLToPath(new URL("../../src/views/sheet-grammar.ts", import.meta.url)).replace(/\\/g, "/")}";

setLocale("en");

const mountedSheet = () => document.body.querySelector(".db-mobile-bottom-sheet");

window.__sheetGrammar = (scenario) => {
  let report = { mounted: false, sheetFound: false, grammar: null, listViewRow: null };
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    report = {
      mounted: true,
      sheetFound: Boolean(sheet),
      grammar: sheet ? describeSheetGrammar(sheet) : null,
      listViewRow: sheet ? Array.from(sheet.querySelectorAll(".db-menu-item-label"))
        .some((el) => el.textContent?.trim() === t("common.listView")) : null,
    };
  });
  return report;
};

window.__sheetGrammarNegativeControl = () => {
  const scenario = ${JSON.stringify(REGISTERED_SURFACES.find((s) => s.name === NEGATIVE_CONTROL.surface).spec)};
  let removed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    if (!sheet) { removed = { mounted: true, error: "no sheet mounted" }; return; }
    const before = describeSheetGrammar(sheet);
    sheet.querySelector(".db-mobile-bottom-sheet-handle")?.remove();
    removed = { mounted: true, before, after: describeSheetGrammar(sheet) };
  });
  let restored = null;
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    restored = sheet ? describeSheetGrammar(sheet) : null;
  });
  return { removed, restored };
};
`);

if (missingSources.length > 0) {
  console.error(`sheet-grammar: FAIL — the bundle no longer imports ${missingSources.join(", ")}`);
  console.error("  a check that does not bundle the shipped renderer proves nothing about it");
  process.exit(1);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${REPO}styles.css"></head>
<body class="is-phone theme-dark"><script src="render-bundle.js"></script></body></html>`);

// ───────────────────────────────────────────────────────────────────
// 4. RUN
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
  throw new Error("sheet-grammar: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

const failures = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);

  for (const { name, spec } of REGISTERED_SURFACES) {
    const report = await page.evaluate((scenario) => window.__sheetGrammar(scenario), spec);
    console.log(`sheet-grammar: ${name}\n`);
    if (!report.mounted) {
      failures.push(`${name}: did not mount`);
      console.log(`  FAIL  ${name} — did not mount`);
      continue;
    }
    if (!report.sheetFound) {
      failures.push(`${name}: mounted without a sheet surface on the body`);
      console.log(`  FAIL  ${name} — mounted without a sheet surface on the body`);
      continue;
    }
    // The report is keyed by the contract's element keys, in the contract's order, so the rows
    // printed here are the grammar's own list rather than a copy that could drift from it.
    for (const key of Object.keys(report.grammar)) {
      const ok = report.grammar[key] === true;
      if (!ok) failures.push(`${name}: ${key} was ${report.grammar[key]}, wanted true`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${name} — ${key}: ${report.grammar[key]}`);
    }
    if (name === "add-view") {
      const ok = report.listViewRow === false;
      if (!ok) failures.push(`add-view: offered a List view row, wanted none`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  add-view — no List view row: ${report.listViewRow === false}`);
    }
    console.log("");
  }

  // Negative control: one element removed from one conforming surface must go red there alone.
  const control = await page.evaluate(() => window.__sheetGrammarNegativeControl());
  const { surface, element } = NEGATIVE_CONTROL;
  console.log(`sheet-grammar: negative control — ${element} removed from ${surface}\n`);
  if (!control.removed?.mounted || control.removed.error) {
    failures.push(`negative control: ${control.removed?.error || "did not mount"}`);
    console.log(`  FAIL  negative control — ${control.removed?.error || "did not mount"}`);
  } else {
    const before = control.removed.before;
    const after = control.removed.after;
    const wentRed = before[element] === true && after[element] === false;
    const othersStayedGreen = Object.keys(after)
      .filter((key) => key !== element)
      .every((key) => after[key] === true);
    const allGreenBefore = Object.values(before).every(Boolean);
    if (!allGreenBefore) failures.push(`negative control: the control surface was not fully green before the removal`);
    if (!wentRed) failures.push(`negative control: ${element} did not go red on ${surface} when removed`);
    if (!othersStayedGreen) failures.push(`negative control: a second surface/element went red with the removal`);
    console.log(`  ${allGreenBefore ? "PASS" : "FAIL"}  ${surface} green before the removal`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  ${element} red on ${surface} after the removal`);
    console.log(`  ${othersStayedGreen ? "PASS" : "FAIL"}  every other row still green`);
    if (!control.restored) {
      failures.push(`negative control: the clean re-mount produced no sheet`);
      console.log(`  FAIL  re-mount clean — no sheet`);
    } else {
      const restoredGreen = Object.values(control.restored).every(Boolean);
      if (!restoredGreen) failures.push(`negative control: the clean re-mount did not restore green`);
      console.log(`  ${restoredGreen ? "PASS" : "FAIL"}  re-mount clean — ${element} green again`);
    }
  }
  console.log("");

  await page.close();
  for (const error of pageErrors) failures.push(`page error: ${error}`);
} catch (error) {
  failures.push(`harness run failed: ${error.message}`);
} finally {
  if (browser) await browser.close();
  rmSync(work, { recursive: true, force: true });
}

// ───────────────────────────────────────────────────────────────────
// 5. VERDICT
// ───────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(`\nsheet-grammar: FAIL — ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("\nsheet-grammar: PASS — every registered surface satisfies all seven grammar elements,");
console.log("  the Add view picker carries no List view row, and the negative control went red on");
console.log("  the removed element alone and green again on re-mount.");
process.exit(0);
