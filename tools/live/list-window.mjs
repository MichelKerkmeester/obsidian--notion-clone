// ───────────────────────────────────────────────────────────────────
// MODULE:    list-window
// COMPONENT: gate check that the windowed list keeps the contracts recorded before it existed
// ───────────────────────────────────────────────────────────────────
//
// The list renders only the rows near the viewport, so most rows have no DOM
// element. Range selection used to derive its order by querying the DOM and
// fell back to the full row list only when that query returned nothing — a
// windowed list is never empty, only incomplete, so a shift-click collapsed to
// the two rows at its ends and said nothing about it.
//
// This drives the real ListRenderer at 2,000 rows and measures the three
// contracts against a row the renderer itself declined to mount.
//
// Usage: node tools/live/list-window.mjs

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
const STAMP_PATH = "tools/live/list-window.json";

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

const work = mkdtempSync(join(tmpdir(), "list-window-"));
const entry = join(work, "entry.ts");
writeFileSync(entry, `
import { installObsidianDomShim } from "${resolve(HERE, "../storybook/obsidian-dom-shim.mjs")}";
import { runListWindowChecks } from "${resolve(HERE, "list-window-harness")}";

installObsidianDomShim(window);
window.__listWindow = () => runListWindowChecks(document);
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

// The renderer under test must be the shipped one.
const SOURCES = ["src/views/list-renderer.ts", "src/views/table-renderer.ts"];
const missing = SOURCES.filter((src) => !Object.keys(built.metafile.inputs).includes(src));
if (missing.length > 0) {
  console.error(`list-window: FAIL — the bundle no longer imports ${missing.join(", ")}`);
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
  throw new Error("list-window: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

let results = null;
let browser;
const failures = [];
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);
  results = await page.evaluate(() => window.__listWindow());
  await page.close();
  for (const error of pageErrors) failures.push(`page error: ${error}`);
} catch (error) {
  failures.push(`harness run failed: ${error.message}`);
} finally {
  if (browser) await browser.close();
  rmSync(work, { recursive: true, force: true });
}

if (!results) {
  console.error(`\nlist-window: FAIL — ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────
// 4. VERDICT
// ───────────────────────────────────────────────────────────────────

console.log(`list-window: ${results.length} check(s) against a real windowed list\n`);
for (const r of results) {
  console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.check.padEnd(52)} ${r.detail}`);
  if (!r.pass) failures.push(`${r.check}: ${r.detail}`);
}

if (failures.length > 0) {
  console.error(`\nlist-window: FAIL — ${failures.length} check(s) failed`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

stamp(STAMP_PATH, { checks: results.length }, [
  "tools/live/list-window.mjs",
  "tools/live/list-window-harness.ts",
  ...SOURCES,
]);

console.log(`\nlist-window: stamped at ${STAMP_PATH}`);
console.log("list-window: PASS — the window holds, and the contracts hold across it");
console.log("  what this does not prove: no Obsidian host is constructed, so the list is rendered");
console.log("  directly rather than through a view. The window itself is real.");
process.exit(0);
