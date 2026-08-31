// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-rebuild
// COMPONENT: gate check that a sheet refreshing itself keeps its grab bar
// ───────────────────────────────────────────────────────────────────
//
// The grab bar is a child of the sheet panel, and a surface that refreshes by
// emptying that panel throws the bar away without knowing it exists. The sheet
// stays open, still covering the screen, with no visible way out.
//
// The group sheet was the case that mattered: changing the group field IS its
// rebuild, so using the surface for its one purpose stripped its own bar.
//
// This drives the real ToolbarRenderer rather than reading its source. Every
// other renderer check in this repo greps a file, and a grep cannot tell a call
// that runs from a call behind a condition that is never true.
//
// Usage: node tools/live/sheet-rebuild.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";
import { chromium } from "playwright-core";
import { stamp } from "./evidence.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HERE = fileURLToPath(new URL(".", import.meta.url));
const STAMP_PATH = "tools/live/sheet-rebuild.json";

// ───────────────────────────────────────────────────────────────────
// 2. BUNDLE
// ───────────────────────────────────────────────────────────────────

const obsidianStubPlugin = {
  name: "obsidian-stub",
  setup(build) {
    build.onResolve({ filter: /^obsidian$/ }, () => ({
      path: resolve(HERE, "../storybook/obsidian-stub.mjs"),
    }));
  },
};

const work = mkdtempSync(join(tmpdir(), "sheet-rebuild-"));
const entry = join(work, "entry.ts");

writeFileSync(entry, `
import { installObsidianDomShim } from "${resolve(HERE, "../storybook/obsidian-dom-shim.mjs")}";
import { runSheetRebuildParity, openGroupSheetForDrag } from "${resolve(HERE, "sheet-rebuild-harness")}";

installObsidianDomShim(window);
window.__sheetRebuild = () => runSheetRebuildParity(document);
window.__openGroupSheetForDrag = () => openGroupSheetForDrag(document);
`);

const built = await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  outfile: join(work, "bundle.js"),
  plugins: [obsidianStubPlugin],
  metafile: true,
  logLevel: "warning",
  absWorkingDir: REPO,
});

// The renderer under test must be the shipped one. A bundle that stopped importing it
// and exercised a copy would prove the copy.
const REQUIRED = [
  "src/views/toolbar-renderer.ts",
  "src/views/popover-position.ts",
  "src/views/mobile-bottom-sheet.ts",
];
const bundled = Object.keys(built.metafile.inputs);
const missing = REQUIRED.filter((source) => !bundled.includes(source));
if (missing.length > 0) {
  console.error(`sheet-rebuild: FAIL — the bundle no longer imports ${missing.join(", ")}`);
  process.exit(1);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${REPO}styles.css"></head>
<body class="theme-dark"><script src="bundle.js"></script></body></html>`);

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
  throw new Error("sheet-rebuild: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

// Past the gesture's own 96px dismissal threshold, with room to spare.
const DRAG_PX = 120;

let results = null;
let dragResult = null;
let browser;
const failures = [];
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);
  await page.evaluate(() => document.body.classList.add("is-phone"));
  results = await page.evaluate(() => window.__sheetRebuild());

  // The bar existing is not the claim. The claim is that the sheet can still be dragged away
  // after it rebuilt itself, which is what the operator does — and a restored-but-inert bar
  // would pass a presence check and fail this one. Driven with a real pointer because the
  // gesture calls setPointerCapture, which rejects any pointer id no real device owns.
  const setup = await page.evaluate(() => window.__openGroupSheetForDrag());
  if (!setup.ready) {
    dragResult = { pass: false, detail: `could not stage the drag: ${setup.detail}` };
  } else {
    const centreX = setup.handleBox.x + setup.handleBox.width / 2;
    const centreY = setup.handleBox.y + setup.handleBox.height / 2;
    await page.mouse.move(centreX, centreY);
    await page.mouse.down();
    // Past the 96px dismissal threshold, in steps, the way a thumb travels.
    await page.mouse.move(centreX, centreY + DRAG_PX, { steps: 12 });
    await page.mouse.up();
    const closed = await page.evaluate(() => window.__sheetClosed === true);
    dragResult = {
      pass: closed,
      detail: closed
        ? `a ${DRAG_PX}px drag on the rebuilt sheet dismissed it`
        : `a ${DRAG_PX}px drag on the rebuilt sheet did nothing — the bar is back but inert`,
    };
  }

  await page.close();
  for (const error of pageErrors) failures.push(`page error: ${error}`);
} catch (error) {
  failures.push(`harness run failed: ${error.message}`);
} finally {
  if (browser) await browser.close();
  rmSync(work, { recursive: true, force: true });
}

if (!results) {
  console.error(`\nsheet-rebuild: FAIL — ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`sheet-rebuild: ${results.length} case(s) rebuilt in headless Chrome\n`);
for (const r of results) {
  console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.surface.padEnd(44)} ${r.rebuildShape}`);
  console.log(`        bar before: ${r.barBeforeRebuild}, after: ${r.barAfterRebuild} — ${r.detail}`);
  if (!r.pass) failures.push(`${r.surface}: ${r.detail}`);
}

if (dragResult) {
  console.log(`  ${dragResult.pass ? "PASS" : "FAIL"}  ${"drag to dismiss after a rebuild".padEnd(44)} real pointer`);
  console.log(`        ${dragResult.detail}`);
  if (!dragResult.pass) failures.push(`drag to dismiss after a rebuild: ${dragResult.detail}`);
} else {
  failures.push("the drag case never ran, so the gesture is unmeasured");
}

// ───────────────────────────────────────────────────────────────────
// 4. VERDICT
// ───────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(`\nsheet-rebuild: FAIL — ${failures.length} case(s) failed`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error("  A sheet with no grab bar is an open surface with no visible way out.");
  process.exit(1);
}

stamp(STAMP_PATH, { cases: results.length + 1, barsLost: 0, dragDismissed: true }, [
  "tools/live/sheet-rebuild.mjs",
  "tools/live/sheet-rebuild-harness.ts",
  ...REQUIRED,
]);

console.log(`\nsheet-rebuild: stamped at ${STAMP_PATH}`);
console.log("sheet-rebuild: PASS — every rebuilt sheet still has the bar it opened with");
console.log("  what this does not prove: no Obsidian host is constructed, so the surface is opened");
console.log("  directly rather than through a real toolbar click. A rebuild path reached on a device");
console.log("  by some route not modelled here is not covered.");
process.exit(0);
