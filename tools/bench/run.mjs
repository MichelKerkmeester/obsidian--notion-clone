// ───────────────────────────────────────────────────────────────────
// MODULE:    run
// COMPONENT: drives the table render bench in real Chrome and reports scaling
// ───────────────────────────────────────────────────────────────────
//
// Bundles the bench against the real renderer, runs it in the same headless
// Chrome the other harnesses use, and prints per-row cost so the shape of the
// scaling is visible rather than inferred.
//
// The reported verdict is deliberately narrow. Linear per-row cost means row
// count is a multiplier, not a cliff, and windowing buys proportional work
// rather than fixing an asymptote. Rising per-row cost means the opposite.
// Either way this is one input to the windowing decision, not the decision:
// it excludes row preparation, the metadata cache, computed fields and
// rollups, all of which need a live vault.

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

const entry = resolve(OUT, "entry.ts");
writeFileSync(entry, `
import { installObsidianDomShim } from "../../storybook/obsidian-dom-shim.mjs";
import { runBench } from "../table-render-bench";

installObsidianDomShim(window);
window.__bench = (detached) => runBench(document.body, detached);
`);

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  outfile: resolve(OUT, "bench.js"),
  plugins: [obsidianStubPlugin],
  logLevel: "warning",
  absWorkingDir: REPO,
});

writeFileSync(resolve(OUT, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="../../../styles.css"></head>
<body class="theme-dark"><script src="bench.js"></script></body></html>`);

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

const browser = await chromium.launch({ executablePath: findChrome() });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto(`file://${resolve(OUT, "index.html")}`);

  const samples = await page.evaluate(() => window.__bench(false));
  const detachedSamples = await page.evaluate(() => window.__bench(true));
  for (const err of errors) console.error(`  page error: ${err}`);
  if (errors.length) {
    console.error("bench: FAIL — the bench threw");
    process.exit(1);
  }

  console.log("bench: real TableRenderer, structural cost only (no vault, cells constant-time)\n");
  console.log("  cols  rows   median   p95   layout   nodes   ms/row");
  for (const s of samples) {
    console.log(
      `  ${String(s.columns).padStart(4)}  ${String(s.rows).padStart(4)}`
      + `  ${s.renderMs.toFixed(1).padStart(7)}  ${s.p95Ms.toFixed(1).padStart(5)}`
      + `  ${s.layoutMs.toFixed(1).padStart(6)}  ${String(s.domNodes).padStart(6)}`
      + `  ${s.msPerRow.toFixed(4).padStart(7)}`,
    );
  }

  // Per-row cost is the shape that matters. Flat means row count multiplies known work; rising
  // means something superlinear is hiding in the loop.
  for (const cols of [...new Set(samples.map((s) => s.columns))]) {
    const forCols = samples.filter((s) => s.columns === cols);
    const first = forCols[0];
    const last = forCols[forCols.length - 1];
    const drift = last.msPerRow / first.msPerRow;
    const shape = drift > 1.5 ? "SUPERLINEAR — cost per row rises with row count"
      : drift < 0.67 ? "SUBLINEAR — per-row cost falls, fixed overhead dominates at small counts"
      : "LINEAR — row count multiplies a constant per-row cost";
    console.log(`\n  ${cols} columns: ${shape} (${first.rows}→${last.rows} rows, per-row ×${drift.toFixed(2)})`);
  }

  console.log("\n  DETACHED (built off-document, attached once):");
  console.log("  cols  rows   median   ms/row");
  for (const s of detachedSamples) {
    console.log(`  ${String(s.columns).padStart(4)}  ${String(s.rows).padStart(4)}  ${s.renderMs.toFixed(1).padStart(7)}  ${s.msPerRow.toFixed(4).padStart(7)}`);
  }
  for (const cols of [...new Set(detachedSamples.map((s) => s.columns))]) {
    const f = detachedSamples.filter((s) => s.columns === cols);
    const drift = f[f.length - 1].msPerRow / f[0].msPerRow;
    console.log(`  ${cols} columns detached: per-row \u00d7${drift.toFixed(2)}`);
  }
  writeFileSync(resolve(OUT, "samples.json"), `${JSON.stringify({ attached: samples, detached: detachedSamples }, null, 2)}\n`);
  console.log(`\nbench: PASS — raw samples at ${resolve(OUT, "samples.json")}`);
} finally {
  await browser.close();
}
