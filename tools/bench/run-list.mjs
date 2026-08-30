// ───────────────────────────────────────────────────────────────────
// MODULE:    run-list
// COMPONENT: drives the list render bench in real Chrome, at both widths
// ───────────────────────────────────────────────────────────────────
//
// Bundles the bench against the real ListRenderer and runs it in the same
// headless Chrome the other harnesses use. It runs twice, once at desktop width
// and once at phone width with the phone class the plugin's own stylesheet keys
// its mobile arm to, because the two are different layouts: the desktop row is
// a grid where an empty column costs a track, and the phone row is a wrapping
// flex line where a hidden field still takes a full slot and still wraps.
//
// A threshold is declared rather than eyeballed. The operator's report is a
// freeze, and a freeze is a budget question — a render that blocks the main
// thread past a couple of hundred milliseconds is a stutter, past a few seconds
// it is the app hanging. So the bench fails when the reported shape exceeds the
// budget, and the number that matters is per-row cost: flat means row count
// multiplies known work, rising means something superlinear is in the loop.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import esbuild from "esbuild";
import { chromium } from "playwright-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const OUT = resolve(HERE, "dist");

// A single render that blocks this long is not slow, it is the freeze the operator reported.
const BUDGET_MS = 2000;

/** Shape overrides, so row counts and column types can be pushed without editing the bench. */
const OPTIONS = {};
for (const arg of process.argv.slice(2)) {
  const [key, value] = arg.replace(/^--/, "").split("=");
  if (key === "rows") OPTIONS.rowCounts = value.split(",").map(Number);
  else if (key === "cols") OPTIONS.columnCounts = value.split(",").map(Number);
  else if (key === "fill") OPTIONS.fillRates = value.split(",").map(Number);
  else if (key === "repeats") OPTIONS.repeats = Number(value);
  else if (key === "kind") OPTIONS.columnKind = value;
  else throw new Error(`run-list: unknown argument "${arg}"`);
}

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

mkdirSync(OUT, { recursive: true });

const entry = resolve(OUT, "list-entry.ts");
writeFileSync(entry, `
import { installObsidianDomShim } from "../../storybook/obsidian-dom-shim.mjs";
import { runListBench } from "../list-render-bench";

installObsidianDomShim(window);
window.__listBench = (options) => runListBench(document.body, options);
`);

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  outfile: resolve(OUT, "list-bench.js"),
  plugins: [obsidianStubPlugin],
  logLevel: "warning",
  absWorkingDir: REPO,
});

writeFileSync(resolve(OUT, "list-index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="../../../styles.css"></head>
<body class="theme-dark"><script src="list-bench.js"></script></body></html>`);

// ───────────────────────────────────────────────────────────────────
// 3. RUN
// ───────────────────────────────────────────────────────────────────

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  for (const c of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ]) if (existsSync(c)) return c;
  throw new Error("No Chrome/Chromium found. Set SCREENSHOT_CHROME to a browser executable.");
}

const SURFACES = [
  { name: "desktop", viewport: { width: 1100, height: 900 }, phone: false },
  { name: "phone", viewport: { width: 390, height: 844 }, phone: true },
];

const browser = await chromium.launch({ executablePath: findChrome() });
const collected = {};
let worst = { renderMs: 0 };
try {
  for (const surface of SURFACES) {
    const page = await browser.newPage({ viewport: surface.viewport });
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto(`file://${resolve(OUT, "list-index.html")}`);
    if (surface.phone) await page.evaluate(() => document.body.classList.add("is-phone"));

    const samples = await page.evaluate((options) => window.__listBench(options), OPTIONS);
    for (const err of errors) console.error(`  page error: ${err}`);
    if (errors.length) {
      console.error("list-bench: FAIL — the bench threw");
      process.exit(1);
    }
    collected[surface.name] = samples;

    console.log(`\n${surface.name} (${surface.viewport.width}px): real ListRenderer, text fields only\n`);
    console.log("  fill  cols  rows   median   p95   layout   nodes  fields  blanks   ms/row");
    for (const s of samples) {
      if (s.renderMs > worst.renderMs) worst = { ...s, surface: surface.name };
      console.log(
        `  ${`${Math.round(s.fillRate * 100)}%`.padStart(4)}  ${String(s.columns).padStart(4)}  ${String(s.rows).padStart(4)}`
        + `  ${s.renderMs.toFixed(1).padStart(7)}  ${s.p95Ms.toFixed(1).padStart(5)}`
        + `  ${s.layoutMs.toFixed(1).padStart(6)}  ${String(s.domNodes).padStart(6)}`
        + `  ${String(s.fieldNodes).padStart(6)}  ${String(s.placeholderNodes).padStart(6)}`
        + `  ${s.msPerRow.toFixed(4).padStart(7)}`,
      );
    }

    // Per-row cost is the shape that matters, read within one fill rate and column count so the
    // comparison holds everything but row count still.
    for (const fillRate of [...new Set(samples.map((s) => s.fillRate))]) {
      for (const cols of [...new Set(samples.map((s) => s.columns))]) {
        const forShape = samples.filter((s) => s.columns === cols && s.fillRate === fillRate);
        const drift = forShape[forShape.length - 1].msPerRow / forShape[0].msPerRow;
        const shape = drift > 1.5 ? "SUPERLINEAR" : drift < 0.67 ? "SUBLINEAR" : "LINEAR";
        console.log(`  ${Math.round(fillRate * 100)}% fill, ${cols} cols: ${shape} (per-row ×${drift.toFixed(2)})`);
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}

writeFileSync(resolve(OUT, "list-samples.json"), `${JSON.stringify(collected, null, 2)}\n`);

// ───────────────────────────────────────────────────────────────────
// 4. VERDICT
// ───────────────────────────────────────────────────────────────────

console.log(`\nraw samples at ${resolve(OUT, "list-samples.json")}`);
console.log(`worst: ${worst.surface} ${worst.columns} cols x ${worst.rows} rows at ${Math.round(worst.fillRate * 100)}% fill = ${worst.renderMs}ms`);
if (worst.renderMs > BUDGET_MS) {
  console.log(`list-bench: FAIL — ${worst.renderMs}ms exceeds the ${BUDGET_MS}ms budget for a single render`);
  process.exit(1);
}
console.log(`list-bench: PASS — worst render ${worst.renderMs}ms is within the ${BUDGET_MS}ms budget`);
