// ───────────────────────────────────────────────────────────────────
// MODULE:    card-bench-driver
// COMPONENT: shared bundle/run/verdict machinery for the card-view render benches
// ───────────────────────────────────────────────────────────────────
//
// The board and the gallery are the same measurement: build one card per row in
// a loop that appends to a single container, then read what the browser had to
// do about it. Only the renderer under test and its fixture differ, so the
// bundling, the two surfaces, the table of samples and the verdict live here
// once. A second copy of this file would be a second set of thresholds to keep
// in step, and they would not stay in step.
//
// The budget is on render plus forced layout, not on render alone. Nothing the
// user experiences distinguishes the two: both are synchronous work in the same
// task, and the app is equally unusable for the sum of them. Budgeting render
// alone would also reward moving a forced layout out of the card loop while
// leaving the same total cost behind — the cost simply leaves `render` and
// arrives in `layout`.
//
// Beside the budget, this reports an EXPONENT rather than a pair of timings. A
// ratio between two row counts answers "how much slower", which a reader can
// always explain away as a bigger tree. An exponent answers the question that
// decides whether a defect is present at all: fitting t ∝ n^k, linear work sits
// near k=1 and a forced layout per card sits near k=2. One number, and it does
// not move when the absolute timings do.

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
// 2. THRESHOLDS
// ───────────────────────────────────────────────────────────────────

/** A single render that blocks this long is not slow, it is the freeze the operator reported. */
export const BUDGET_MS = 2000;

/**
 * The exponent k in t ∝ n^k, fitted across the whole row ladder.
 *
 * Anything at or above this is the signature of per-item work that reads layout. It is set below
 * 2 on purpose: a real render never fits a clean quadratic, because the linear term is still
 * there and the ladder is finite, so demanding k>=2 would let a genuine defect pass.
 */
const SUPERLINEAR_K = 1.35;

/**
 * The same judgement applied to the steepest single segment of the ladder.
 *
 * A fitted exponent averages straight across the bend, which is the one feature being looked for.
 * Measured on the defective board, the phone surface fitted k=1.33 — under the threshold above,
 * reported LINEAR — while its 3,200→6,400 segment was 1.74. The fit alone would have cleared the
 * very defect this harness exists to catch, so the steepest segment is judged too, at a looser
 * bar because a single segment is noisier than a fit over the whole ladder.
 */
const SUPERLINEAR_SEGMENT_K = 1.5;

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

/** What the operator's main thread actually loses: the render, plus the layout it forced. */
export const blockedMs = (sample) => Number((sample.renderMs + sample.layoutMs).toFixed(1));

/** Least-squares fit of log(blocked) against log(rows). Two points reduce to the plain ratio. */
function fitExponent(points) {
  if (points.length < 2) return null;
  const xs = points.map((p) => Math.log(p.rows));
  const ys = points.map((p) => Math.log(Math.max(blockedMs(p), 1e-6)));
  const xMean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const yMean = ys.reduce((a, b) => a + b, 0) / ys.length;
  let num = 0;
  let den = 0;
  for (let i = 0; i < xs.length; i += 1) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  return den === 0 ? null : num / den;
}

/** Shared argument grammar, so the two benches cannot drift into different flag names. */
export function parseArgs(argv, name) {
  const options = {};
  let controlMode = false;
  // 1 = the development machine. The operator's device is not this machine, and a render that is
  // comfortable here can be a freeze there, so the ceiling question is asked with a multiplier.
  let throttle = 1;
  for (const arg of argv) {
    const [key, value] = arg.replace(/^--/, "").split("=");
    if (key === "rows") options.rowCounts = value.split(",").map(Number);
    else if (key === "cols") options.columnCounts = value.split(",").map(Number);
    else if (key === "fill") options.fillRates = value.split(",").map(Number);
    else if (key === "groups") options.groupCount = Number(value);
    else if (key === "repeats") options.repeats = Number(value);
    else if (key === "kind") options.columnKind = value;
    else if (key === "throttle") throttle = Number(value);
    // Names the run in the output only. A control is a real edit to the renderer; this flag
    // exists so a control run cannot be mistaken for a normal one when reading scrollback later.
    else if (key === "control") controlMode = true;
    else throw new Error(`${name}: unknown argument "${arg}"`);
  }
  return { options, controlMode, throttle };
}

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

// ───────────────────────────────────────────────────────────────────
// 4. DRIVER
// ───────────────────────────────────────────────────────────────────

/**
 * @param name      short bench id, used for output filenames and messages
 * @param benchModule  path (relative to tools/bench) of the module exporting the bench function
 * @param benchExport  the exported function's name
 * @param label     what the table header calls the renderer under test
 */
export async function runCardBench({ name, benchModule, benchExport, label, options, controlMode, throttle = 1 }) {
  const obsidianStubPlugin = {
    name: "obsidian-stub",
    setup(build) {
      build.onResolve({ filter: /^obsidian$/ }, () => ({
        path: resolve(HERE, "../storybook/obsidian-stub.mjs"),
      }));
    },
  };

  mkdirSync(OUT, { recursive: true });

  const globalName = `__${name}Bench`;
  const entry = resolve(OUT, `${name}-entry.ts`);
  writeFileSync(entry, `
import { installObsidianDomShim } from "../../storybook/obsidian-dom-shim.mjs";
import { ${benchExport} } from "../${benchModule}";

installObsidianDomShim(window);
window.${globalName} = (options) => ${benchExport}(document.body, options);
`);

  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    format: "iife",
    outfile: resolve(OUT, `${name}-bench.js`),
    plugins: [obsidianStubPlugin],
    logLevel: "warning",
    absWorkingDir: REPO,
  });

  writeFileSync(resolve(OUT, `${name}-index.html`), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="../../../styles.css"></head>
<body class="theme-dark"><script src="${name}-bench.js"></script></body></html>`);

  const browser = await chromium.launch({ executablePath: findChrome() });
  const collected = {};
  const verdicts = [];
  let worst = { renderMs: 0, layoutMs: 0 };
  try {
    for (const surface of SURFACES) {
      const page = await browser.newPage({ viewport: surface.viewport });
      const errors = [];
      page.on("pageerror", (err) => errors.push(err.message));
      // Throttling is applied through CDP before navigation so the measured render pays it.
      // It slows the CPU, not layout in isolation, which is what a slower device actually does.
      if (throttle > 1) {
        const client = await page.context().newCDPSession(page);
        await client.send("Emulation.setCPUThrottlingRate", { rate: throttle });
      }
      await page.goto(`file://${resolve(OUT, `${name}-index.html`)}`);
      if (surface.phone) await page.evaluate(() => document.body.classList.add("is-phone"));

      const samples = await page.evaluate(
        ([global, opts]) => window[global](opts),
        [globalName, options],
      );
      for (const err of errors) console.error(`  page error: ${err}`);
      if (errors.length) {
        console.error(`${name}-bench: FAIL — the bench threw`);
        process.exit(1);
      }
      collected[surface.name] = samples;

      console.log(`\n${surface.name} (${surface.viewport.width}px): ${label}`
        + `${throttle > 1 ? ` — ${throttle}x CPU throttle` : ""}${controlMode ? " — CONTROL RUN" : ""}\n`);
      console.log("  fill  cols  rows   median   p95   layout  blocked   nodes   cards  fields   ms/row");
      for (const s of samples) {
        if (blockedMs(s) > blockedMs(worst)) worst = { ...s, surface: surface.name };
        console.log(
          `  ${`${Math.round(s.fillRate * 100)}%`.padStart(4)}  ${String(s.columns).padStart(4)}  ${String(s.rows).padStart(4)}`
          + `  ${s.renderMs.toFixed(1).padStart(7)}  ${s.p95Ms.toFixed(1).padStart(5)}`
          + `  ${s.layoutMs.toFixed(1).padStart(6)}  ${blockedMs(s).toFixed(1).padStart(7)}`
          + `  ${String(s.domNodes).padStart(6)}  ${String(s.cardNodes).padStart(6)}`
          + `  ${String(s.fieldNodes).padStart(6)}  ${s.msPerRow.toFixed(4).padStart(7)}`,
        );
      }

      // The shape, read within one fill rate and column count so the comparison holds everything
      // but row count still.
      for (const fillRate of [...new Set(samples.map((s) => s.fillRate))]) {
        for (const cols of [...new Set(samples.map((s) => s.columns))]) {
          const forShape = samples.filter((s) => s.columns === cols && s.fillRate === fillRate)
            .sort((a, b) => a.rows - b.rows);
          const lbl = `  ${Math.round(fillRate * 100)}% fill, ${cols} cols`;
          // Two row counts or no verdict. A slope needs two points, and a single sample divides a
          // number by itself and reports a clean LINEAR next to whatever the timing actually was.
          if (forShape.length < 2) {
            console.log(`${lbl}: NO VERDICT — a slope needs two row counts and this run measured ${forShape.length}`);
            continue;
          }
          const k = fitExponent(forShape);
          const first = forShape[0];
          const last = forShape[forShape.length - 1];
          const segmentKs = forShape.slice(1).map((s, i) => {
            const prev = forShape[i];
            return { from: prev.rows, to: s.rows, k: Math.log(blockedMs(s) / blockedMs(prev)) / Math.log(s.rows / prev.rows) };
          });
          const steepest = segmentKs.reduce((acc, s) => (acc === null || s.k > acc.k ? s : acc), null);
          const shape = k >= SUPERLINEAR_K || (steepest && steepest.k >= SUPERLINEAR_SEGMENT_K) ? "SUPERLINEAR" : "LINEAR";
          verdicts.push({ surface: surface.name, fillRate, cols, k, steepest, shape, first, last });
          console.log(`${lbl}: ${shape} — fitted k=${k.toFixed(2)}`
            + ` (${first.rows} rows ${blockedMs(first)}ms → ${last.rows} rows ${blockedMs(last)}ms)`);
          console.log(`${" ".repeat(lbl.length)}  segments: ${segmentKs.map((s) => `${s.from}→${s.to} k=${s.k.toFixed(2)}`).join("  ")}`);
        }
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }

  const samplesPath = resolve(OUT, controlMode ? `${name}-samples-control.json` : `${name}-samples.json`);
  writeFileSync(samplesPath, `${JSON.stringify(collected, null, 2)}\n`);

  console.log(`\nraw samples at ${samplesPath}`);
  const blocked = blockedMs(worst);
  console.log(`worst: ${worst.surface} ${worst.columns} cols x ${worst.rows} rows at ${Math.round(worst.fillRate * 100)}% fill`
    + ` = ${blocked}ms blocked (${worst.renderMs}ms render + ${worst.layoutMs}ms layout)`);

  const superlinear = verdicts.filter((v) => v.shape === "SUPERLINEAR");
  const worstK = verdicts.reduce((acc, v) => (acc === null || v.k > acc.k ? v : acc), null);
  if (worstK) console.log(`steepest shape: k=${worstK.k.toFixed(2)} at ${worstK.surface} ${worstK.cols} cols, ${Math.round(worstK.fillRate * 100)}% fill`);

  // Two independent failures, reported separately. A view can sit inside the budget at the sizes
  // measured and still carry the defect, and saying only "over budget" would let the repair be
  // judged by a number that a faster machine moves.
  const failures = [];
  if (blocked > BUDGET_MS) {
    failures.push(`${blocked}ms of blocked main thread`
      + ` (${worst.renderMs}ms render + ${worst.layoutMs}ms layout) exceeds the ${BUDGET_MS}ms budget`);
  }
  if (superlinear.length > 0) {
    const detail = superlinear
      .map((v) => `${v.surface} ${v.cols}c/${Math.round(v.fillRate * 100)}% fitted k=${v.k.toFixed(2)}`
        + (v.steepest ? `, steepest segment ${v.steepest.from}→${v.steepest.to} k=${v.steepest.k.toFixed(2)}` : ""))
      .join("; ");
    failures.push(`${superlinear.length} shape(s) superlinear`
      + ` (fitted k >= ${SUPERLINEAR_K} or a segment k >= ${SUPERLINEAR_SEGMENT_K}),`
      + ` the signature of per-card work that reads layout — ${detail}`);
  }
  if (failures.length > 0) {
    for (const f of failures) console.log(`${name}-bench: FAIL — ${f}`);
    process.exit(1);
  }
  console.log(`${name}-bench: PASS — worst blocked main thread ${blocked}ms within the ${BUDGET_MS}ms budget,`
    + ` and every shape fits k < ${SUPERLINEAR_K} with no segment >= ${SUPERLINEAR_SEGMENT_K}`);
}
