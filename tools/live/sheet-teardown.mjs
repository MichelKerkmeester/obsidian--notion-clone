// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-teardown
// COMPONENT: gate check that every sheet producer leaves the body clean on close
// ───────────────────────────────────────────────────────────────────
//
// The operator reported that the app sometimes freezes when a sheet closes. It is
// not a render cost: the backdrop a sheet mounts is a sibling on the body, and
// most producers remove their panel without taking it down. What is left is a
// full-screen element at `inset: 0` with `pointer-events: auto` covering the whole
// app, which is indistinguishable from a freeze to the person using it.
//
// The existing placement check does assert that a backdrop "arrives with the menu
// and leaves with it" — but only against the one producer that cleans up, and
// elsewhere it removes a leaked backdrop by hand so the next check can run. It
// tidied away the evidence of the defect in order to keep testing.
//
// This check compares every producer against that reference in one run. The
// asymmetry is the point: a pass for the reference and a failure for a leaker,
// from the same code path, is a result a harness cannot manufacture without
// giving two different wrong answers at once.
//
// Usage: node tools/live/sheet-teardown.mjs

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
const STAMP_PATH = "tools/live/sheet-teardown.json";

// The producer whose behaviour every other producer is compared against. Named here
// rather than inferred, so a run where the reference itself regresses is legible as
// "the reference broke" and not as "everything passes".
const REFERENCE = "owned menu (reference)";
const PRE_FIX_FAILURES = new Map([
  ["DbModal with a detached host wrapper", "1 backdrop(s) and 1 sheet(s) left after the host wrapper was removed"],
  ["attachSheetChromeToModal with a detached host wrapper", "1 backdrop(s) and 1 sheet(s) left after the host wrapper was removed"],
]);

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

const work = mkdtempSync(join(tmpdir(), "sheet-teardown-"));
const entry = join(work, "entry.ts");

writeFileSync(entry, `
import { installObsidianDomShim } from "${resolve(HERE, "../storybook/obsidian-dom-shim.mjs")}";
import { runSheetTeardownParity } from "${resolve(HERE, "sheet-teardown-harness")}";

installObsidianDomShim(window);
window.__sheetTeardown = () => runSheetTeardownParity(document);
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

// The chrome function must be the shipped one. A bundle that stopped importing it and
// exercised a copy would prove the copy.
const SOURCE = "src/views/mobile-bottom-sheet.ts";
if (!Object.keys(built.metafile.inputs).includes(SOURCE)) {
  console.error(`sheet-teardown: FAIL — the bundle no longer imports ${SOURCE}`);
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
  throw new Error("sheet-teardown: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

let results = null;
let browser;
const failures = [];
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);
  await page.evaluate(() => document.body.classList.add("is-phone"));
  results = await page.evaluate(() => window.__sheetTeardown());
  await page.close();
  for (const error of pageErrors) failures.push(`page error: ${error}`);
} catch (error) {
  failures.push(`harness run failed: ${error.message}`);
} finally {
  if (browser) await browser.close();
  rmSync(work, { recursive: true, force: true });
}

if (!results) {
  console.error(`\nsheet-teardown: FAIL — ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`sheet-teardown: ${results.length} sheet producers closed in headless Chrome\n`);
for (const r of results) {
  console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.producer.padEnd(44)} ${r.closeShape}`);
  console.log(`        ${r.detail}`);
  if (!r.pass) failures.push(`${r.producer}: ${r.detail}`);
}

// ───────────────────────────────────────────────────────────────────
// 4. THE PARITY VERDICT
// ───────────────────────────────────────────────────────────────────

const reference = results.find((r) => r.producer === REFERENCE);
if (!reference) {
  console.error("\nsheet-teardown: FAIL — the reference producer was not run, so nothing was compared");
  process.exit(1);
}

// A run where everything fails, the reference included, is a broken harness rather than
// a discovered defect, and must not read as a finding about the producers.
if (!reference.pass) {
  console.error("\nsheet-teardown: FAIL — the REFERENCE producer leaked, so this run compares nothing.");
  console.error("  Fix the harness or the reference before reading any other row.");
  process.exit(1);
}

console.log(`\nsheet-teardown: reference "${REFERENCE}" cleans up; every other producer is measured against it`);

if (failures.length > 0) {
  console.error(`\nsheet-teardown: FAIL — ${failures.length} producer(s) leave the body dirty`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error("  A backdrop left on the body covers the whole app and swallows every tap.");
  process.exit(1);
}

const checks = results.map(({ producer: name, pass, detail }) => ({
  name,
  pass,
  detail,
  preFixFailure: PRE_FIX_FAILURES.get(name) ?? null,
}));

stamp(STAMP_PATH, { producers: results.length, leaking: 0, checks }, [
  "tools/live/sheet-teardown.mjs",
  "tools/live/sheet-teardown-harness.ts",
  SOURCE,
  "src/views/popover-position.ts",
  "src/views/owned-menu.ts",
]);

console.log(`sheet-teardown: stamped at ${STAMP_PATH}`);
console.log("\nsheet-teardown: PASS — every producer took its backdrop down with its sheet");
console.log("  what this does not prove: no Obsidian host is constructed, so this measures the");
console.log("  chrome contract rather than any caller's lifecycle. A producer whose close path is");
console.log("  never reached on a device would pass here and still leak there.");
process.exit(0);
