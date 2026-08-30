// ───────────────────────────────────────────────────────────────────
// MODULE:    run-panel-refresh
// COMPONENT: drives the panel refresh-count bench in real Chrome
// ───────────────────────────────────────────────────────────────────
//
// Bundles the bench against the real DatabaseView routing methods and the real
// panel renderers, and runs it in the same headless Chrome the other harnesses
// use. Chrome rather than node because the panels build DOM, install an overlay
// registration and read layout while positioning themselves, and a hand-rolled
// element would decide the answer by what it chose not to implement.
//
// Two budgets, and both have to hold:
//
//   COUNT — a round trip may cost one full rebuild per change it makes. Anything
//   above that is repeated work the user waits through, and at the row counts
//   recorded in this program's measurements each extra rebuild is seconds, not
//   milliseconds. Each scenario declares its own budget beside the interaction it
//   drives, so the number and the reason for it cannot drift apart.
//
//   FRESHNESS — the last rebuild in a round trip must have observed the state
//   the round trip left behind. This budget exists because the cheapest way to
//   satisfy the first one is to drop the final update, which would trade a slow
//   view for a wrong one. A run that improves the count and fails this is worse
//   than no change at all, so it exits non-zero just the same.

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
// 2. BUDGETS
// ───────────────────────────────────────────────────────────────────

// Each scenario carries its own budget, declared beside the interaction it
// drives so the number and the reason for it cannot drift apart. A null budget
// means the scenario is reported rather than enforced, and says why in the bench.

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

mkdirSync(OUT, { recursive: true });

const entry = resolve(OUT, "panel-refresh-entry.ts");
writeFileSync(entry, `
import { installObsidianDomShim } from "${resolve(REPO, "tools/storybook/obsidian-dom-shim.mjs")}";
import { runPanelRefresh } from "${resolve(HERE, "panel-refresh-bench")}";
installObsidianDomShim(window);
window.__panelRefresh = () => runPanelRefresh(document.body);
`);

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  outfile: resolve(OUT, "panel-refresh.js"),
  plugins: [obsidianStubPlugin],
  logLevel: "warning",
  absWorkingDir: REPO,
});

writeFileSync(resolve(OUT, "panel-refresh.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${REPO}/styles.css"></head>
<body class="theme-dark"><script src="panel-refresh.js"></script></body></html>`);

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
let scenarios;
let pageError = null;
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", (error) => { pageError = error; });
  await page.goto(`file://${resolve(OUT, "panel-refresh.html")}`);
  await page.evaluate(() => document.body.classList.add("is-phone"));
  scenarios = await page.evaluate(async () => await window.__panelRefresh());
  await page.close();
} finally {
  await browser.close();
}

if (pageError) {
  console.error(`panel-refresh: the bench threw in the page — ${pageError.message}`);
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────
// 5. REPORT
// ───────────────────────────────────────────────────────────────────

console.log("\n=== full view rebuilds per panel round trip (390px phone width) ===");
console.log("  scenario                       open  change  dismiss   total  budget   paints-final");
const failures = [];
for (const s of scenarios) {
  const overBudget = s.budget !== null && s.renders > s.budget;
  const missingRebuild = Boolean(s.requiresRebuild) && s.renders < 1;
  const flag = !s.paintsFinalState ? "  STALE" : overBudget ? "  OVER" : missingRebuild ? "  SKIPPED" : "";
  console.log(
    `  ${s.name.padEnd(28)} ${String(s.legs.open).padStart(5)}`
    + ` ${String(s.legs.change).padStart(7)} ${String(s.legs.dismiss).padStart(8)}`
    + ` ${String(s.renders).padStart(7)} ${String(s.budget ?? "-").padStart(7)}`
    + `   ${s.paintsFinalState ? "yes" : "NO "}${flag}`,
  );
  if (overBudget) {
    failures.push(
      `${s.name}: ${s.renders} full rebuilds for ${s.changes} change(s), budget is ${s.budget}`,
    );
  }
  if (s.requiresRebuild && s.renders < 1) {
    failures.push(
      `${s.name}: dismissed without a rebuild, but this panel does not repaint its own changes`,
    );
  }
  if (!s.paintsFinalState) {
    failures.push(
      `${s.name}: the view was left painting ${s.lastRenderedState || "nothing"}`
      + ` but the state is ${s.finalState}`,
    );
  }
}

writeFileSync(resolve(OUT, "panel-refresh-samples.json"), `${JSON.stringify(scenarios, null, 2)}\n`);
console.log(`\nraw samples at ${resolve(OUT, "panel-refresh-samples.json")}`);

if (failures.length > 0) {
  console.error("\npanel-refresh: FAIL");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("\npanel-refresh: PASS");
