// ───────────────────────────────────────────────────────────────────
// MODULE:    run-toolbar-collapse-sweep
// COMPONENT: drives the embedded toolbar's width sweep in real Chrome
// ───────────────────────────────────────────────────────────────────
//
// Bundles the sweep against the real ToolbarRenderer and runs it in the
// same headless Chrome the other live harnesses use, stepping the embed
// container's width upward from 250px. Two things have to hold at every
// width: the toolbar never overflows its own container, and the sweep's
// own switch points — where each control drops and where the tab row
// itself becomes a dropdown — get printed, so the ladder is read rather
// than assumed. The bundle lives in a temp directory and is removed when
// done, matching render-assertion-bundle.mjs's own build rather than
// leaving a dist/ folder in the tree.
//
// Usage: node tools/live/run-toolbar-collapse-sweep.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import esbuild from "esbuild";
import { chromium } from "playwright-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");

// ───────────────────────────────────────────────────────────────────
// 2. SWEEP WIDTHS
// ───────────────────────────────────────────────────────────────────

// 250px is the sweep floor `047` §8's `isNarrow` reads; 10px steps are fine enough to name
// each rung's switch point to within a pixel-visible amount without the sweep taking seconds.
const WIDTHS = [];
for (let w = 250; w <= 900; w += 10) WIDTHS.push(w);

// Below the documented floor, informational only: this fixture's single truncated tab (capped
// at 22ch) already fits inside 250px once the four chrome controls collapse, so the dropdown
// rung never fires within the required range. Reading narrower widths confirms the rung actually
// engages rather than being dead code, without gating the required sweep on a width nobody
// promised zero overflow at.
const BELOW_FLOOR_WIDTHS = [100, 120, 140, 160, 180, 200, 220, 240];

// ───────────────────────────────────────────────────────────────────
// 3. BUNDLE
// ───────────────────────────────────────────────────────────────────

const obsidianStubPlugin = {
  name: "obsidian-stub",
  setup(build) {
    build.onResolve({ filter: /^obsidian$/ }, () => ({
      path: resolve(REPO, "tools/storybook/obsidian-stub.mjs"),
    }));
  },
};

const work = mkdtempSync(join(tmpdir(), "toolbar-collapse-sweep-"));
const entry = join(work, "sweep-entry.ts");
const bundlePath = join(work, "sweep-bundle.js");

writeFileSync(entry, `
import { installObsidianDomShim } from "${resolve(REPO, "tools/storybook/obsidian-dom-shim.mjs")}";
import { runToolbarCollapseSweep } from "${resolve(HERE, "toolbar-collapse-sweep")}";
installObsidianDomShim(window);
window.__toolbarCollapseSweep = (widths) => runToolbarCollapseSweep(document.body, widths);
`);

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  outfile: bundlePath,
  plugins: [obsidianStubPlugin],
  logLevel: "warning",
  absWorkingDir: REPO,
});

writeFileSync(join(work, "sweep.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${REPO}/styles.css"></head>
<body class="theme-dark"><script src="sweep-bundle.js"></script></body></html>`);

// ───────────────────────────────────────────────────────────────────
// 4. RUN
// ───────────────────────────────────────────────────────────────────

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  for (const candidate of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ]) if (existsSync(candidate)) return candidate;
  throw new Error("No Chrome found. Set SCREENSHOT_CHROME to a Chrome or Chromium binary.");
}

const browser = await chromium.launch({ executablePath: findChrome() });
let readings;
let belowFloorReadings;
let pageError = null;
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  page.on("pageerror", (error) => { pageError = error; });
  await page.goto(`file://${join(work, "sweep.html")}`);
  readings = await page.evaluate((widths) => window.__toolbarCollapseSweep(widths), WIDTHS);
  // A fresh page for the second probe. Reloading is what guarantees a clean mount: the sweep
  // leaves its container and its live ResizeObserver behind, and a second sweep in the same
  // document would measure against the first one's collapse decisions.
  await page.goto(`file://${join(work, "sweep.html")}`);
  belowFloorReadings = await page.evaluate((widths) => window.__toolbarCollapseSweep(widths), BELOW_FLOOR_WIDTHS);
  await page.close();
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}

if (pageError) {
  console.error(`toolbar-collapse-sweep: the sweep threw in the page — ${pageError.message}`);
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────
// 5. REPORT
// ───────────────────────────────────────────────────────────────────

// A rung's switch point is the first width in the sweep, read ascending, whose reading no
// longer shows that rung's control.
function firstDropWidth(rows, key) {
  const dropped = rows.find((r) => r[key] === false);
  return dropped ? dropped.width : null;
}
/**
 * The WIDEST probed width at which the tab row is already a dropdown, not the first one read.
 *
 * Both probes step upward from their narrowest width, so reading the first match returns that
 * narrowest width whenever the rung is engaged there — which says nothing about where the rung
 * switches, and reads as a measured switch point to anyone quoting it. The widest engaged width
 * is the one the probe can actually resolve: the rung holds at it and at every narrower step.
 */
function widestDropdownWidth(rows) {
  const engaged = rows.filter((r) => r.tabRowIsDropdown === true);
  return engaged.length ? engaged[engaged.length - 1].width : null;
}

function px(width) {
  return width === null ? "never in range" : `${width}px`;
}

const switchPoints = {
  newClusterDropsAt: firstDropWidth(readings, "newClusterVisible"),
  queryClusterDropsAt: firstDropWidth(readings, "queryClusterVisible"),
  propertiesClusterDropsAt: firstDropWidth(readings, "propertiesClusterVisible"),
  addTabDropsAt: firstDropWidth(readings, "addTabVisible"),
  tabRowBecomesDropdownAt: widestDropdownWidth(readings),
};

console.log("\n=== embedded toolbar collapse ladder, 250px-900px sweep, 10px steps ===");
console.log(`  New button drops at:        ${px(switchPoints.newClusterDropsAt)}`);
console.log(`  Icon cluster (query) drops: ${px(switchPoints.queryClusterDropsAt)}`);
console.log(`  Icon cluster (props) drops: ${px(switchPoints.propertiesClusterDropsAt)}`);
console.log(`  Add-view "+" drops at:      ${px(switchPoints.addTabDropsAt)}`);
console.log(`  Tab row becomes dropdown:   ${px(switchPoints.tabRowBecomesDropdownAt)}`);

const belowFloorDropdownAt = widestDropdownWidth(belowFloorReadings);
console.log("\n=== below the 250px floor, informational only — confirms the rung engages ===");
console.log(`  Tab row is a dropdown at and below: ${px(belowFloorDropdownAt)}`);
console.log("  (not gated: nothing promises zero overflow below the documented floor)");

const overflowing = readings.filter((r) => r.overflow);
if (overflowing.length > 0) {
  console.error(`\ntoolbar-collapse-sweep: FAIL — overflow at ${overflowing.length} width(s):`);
  for (const r of overflowing.slice(0, 10)) {
    console.error(`  - ${r.width}px: scrollWidth ${r.scrollWidth} > clientWidth ${r.clientWidth}`);
  }
  process.exit(1);
}
console.log("\ntoolbar-collapse-sweep: PASS — zero overflow across the sweep");
