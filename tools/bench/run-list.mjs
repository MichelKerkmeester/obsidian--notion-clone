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
// freeze, and a freeze is a budget question — blocking the main thread past a
// couple of hundred milliseconds is a stutter, past a few seconds it is the app
// hanging.
//
// The budget is on render plus forced layout, not on render alone. Nothing the
// user experiences distinguishes the two: both are synchronous work in the same
// task, and the app is equally unusable for the sum of them. Budgeting render
// alone would also have rewarded the exact repair this harness was built to
// verify, which works by moving a forced layout out of the row loop — cost that
// leaves `render` and arrives in `layout`. A tree that renders in 100ms and then
// lays out for five seconds is the freeze, and would have passed.
//
// Beside the budget, per-row cost carries the shape: flat means row count
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

/** What the operator's main thread actually loses: the render, plus the layout it forced. */
const blockedMs = (sample) => Number((sample.renderMs + sample.layoutMs).toFixed(1));

/** Shape overrides, so row counts and column types can be pushed without editing the bench. */
const OPTIONS = {};
// 1 = the development machine. The budget this bench enforces was written about a phone, and a
// render that is comfortable on a laptop can be a freeze on the device that reported it, so the
// ceiling question has to be askable with a multiplier. Without this the pass is about this Mac.
let throttle = 1;
for (const arg of process.argv.slice(2)) {
  const [key, value] = arg.replace(/^--/, "").split("=");
  if (key === "rows") OPTIONS.rowCounts = value.split(",").map(Number);
  else if (key === "cols") OPTIONS.columnCounts = value.split(",").map(Number);
  else if (key === "fill") OPTIONS.fillRates = value.split(",").map(Number);
  else if (key === "repeats") OPTIONS.repeats = Number(value);
  else if (key === "kind") OPTIONS.columnKind = value;
  else if (key === "throttle") throttle = Number(value);
  else throw new Error(`run-list: unknown argument "${arg}"`);
}
if (!Number.isFinite(throttle) || throttle < 1) {
  throw new Error(`run-list: --throttle must be a number >= 1, got "${throttle}"`);
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
let worst = { renderMs: 0, layoutMs: 0 };
try {
  for (const surface of SURFACES) {
    const page = await browser.newPage({ viewport: surface.viewport });
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    // Applied through CDP before navigation so the measured render pays it. It slows the CPU
    // rather than layout in isolation, which is what a slower device actually does.
    if (throttle > 1) {
      const client = await page.context().newCDPSession(page);
      await client.send("Emulation.setCPUThrottlingRate", { rate: throttle });
    }
    await page.goto(`file://${resolve(OUT, "list-index.html")}`);
    if (surface.phone) await page.evaluate(() => document.body.classList.add("is-phone"));

    const samples = await page.evaluate((options) => window.__listBench(options), OPTIONS);
    for (const err of errors) console.error(`  page error: ${err}`);
    if (errors.length) {
      console.error("list-bench: FAIL — the bench threw");
      process.exit(1);
    }
    collected[surface.name] = samples;

    console.log(`\n${surface.name} (${surface.viewport.width}px): real ListRenderer, text fields only`
      + `${throttle > 1 ? ` — ${throttle}x CPU throttle` : ""}\n`);
    console.log("  fill  cols  rows   median   p95   layout  blocked   nodes  fields  blanks   ms/row");
    for (const s of samples) {
      if (blockedMs(s) > blockedMs(worst)) worst = { ...s, surface: surface.name };
      console.log(
        `  ${`${Math.round(s.fillRate * 100)}%`.padStart(4)}  ${String(s.columns).padStart(4)}  ${String(s.rows).padStart(4)}`
        + `  ${s.renderMs.toFixed(1).padStart(7)}  ${s.p95Ms.toFixed(1).padStart(5)}`
        + `  ${s.layoutMs.toFixed(1).padStart(6)}  ${blockedMs(s).toFixed(1).padStart(7)}`
        + `  ${String(s.domNodes).padStart(6)}`
        + `  ${String(s.fieldNodes).padStart(6)}  ${String(s.placeholderNodes).padStart(6)}`
        + `  ${s.msPerRow.toFixed(4).padStart(7)}`,
      );
    }

    // Per-row cost is the shape that matters, read within one fill rate and column count so the
    // comparison holds everything but row count still.
    for (const fillRate of [...new Set(samples.map((s) => s.fillRate))]) {
      for (const cols of [...new Set(samples.map((s) => s.columns))]) {
        const forShape = samples.filter((s) => s.columns === cols && s.fillRate === fillRate);
        // Two row counts or no verdict. The drift is last-over-first, so a single sample divides a
        // number by itself and reports LINEAR ×1.00 — printed next to a seven-second render, which
        // is what it did. A green that arithmetic guarantees is worse than no line at all.
        if (forShape.length < 2) {
          console.log(`  ${Math.round(fillRate * 100)}% fill, ${cols} cols: NO VERDICT`
            + ` — a slope needs two row counts and this run measured ${forShape.length}`);
          continue;
        }
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
const blocked = blockedMs(worst);
console.log(`worst: ${worst.surface} ${worst.columns} cols x ${worst.rows} rows at ${Math.round(worst.fillRate * 100)}% fill`
  + ` = ${blocked}ms blocked (${worst.renderMs}ms render + ${worst.layoutMs}ms layout)`);
if (blocked > BUDGET_MS) {
  console.log(`list-bench: FAIL — ${blocked}ms of blocked main thread`
    + ` (${worst.renderMs}ms render + ${worst.layoutMs}ms layout) exceeds the ${BUDGET_MS}ms budget`);
  process.exit(1);
}
console.log(`list-bench: PASS — worst blocked main thread ${blocked}ms`
  + ` (${worst.renderMs}ms render + ${worst.layoutMs}ms layout) is within the ${BUDGET_MS}ms budget`);
