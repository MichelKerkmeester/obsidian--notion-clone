// Drives the comparative bench in headless Chrome, at 1x and at CPU throttling
// rates that stand in for a phone, because the operator interacts through sheets
// and a desktop Chrome on an M-series Mac is not the device that froze.

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
const require_ = createRequire("/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/package.json");
const esbuild = require_("esbuild");
const { chromium } = require_("playwright-core");

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = "/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin";
const OUT = resolve(HERE, "dist");

const THROTTLE = process.argv.includes("--throttle");

const obsidianStubPlugin = {
  name: "obsidian-stub",
  setup(build) {
    build.onResolve({ filter: /^obsidian$/ }, () => ({
      path: resolve(REPO, "tools/storybook/obsidian-stub.mjs"),
    }));
  },
};

mkdirSync(OUT, { recursive: true });

const entry = resolve(OUT, "entry.ts");
writeFileSync(entry, `
import { installObsidianDomShim } from "${resolve(REPO, "tools/storybook/obsidian-dom-shim.mjs")}";
import { runCompare } from "${resolve(HERE, "compare-bench")}";
installObsidianDomShim(window);
window.__compare = (o) => runCompare(document.body, o);
`);

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  outfile: resolve(OUT, "compare.js"),
  plugins: [obsidianStubPlugin],
  logLevel: "warning",
  absWorkingDir: REPO,
});

writeFileSync(resolve(OUT, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${REPO}/styles.css"></head>
<body class="theme-dark"><script src="compare.js"></script></body></html>`);

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  for (const c of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ]) if (existsSync(c)) return c;
  throw new Error("No Chrome found");
}

const RATES = THROTTLE ? [1, 4, 6] : [1];
const browser = await chromium.launch({ executablePath: findChrome() });
const all = {};
try {
  for (const rate of RATES) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`file://${resolve(OUT, "index.html")}`);
    await page.evaluate(() => document.body.classList.add("is-phone"));

    if (rate > 1) {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate });
    }

    const opts = THROTTLE
      ? { rowCounts: [400, 1600, 3200], columnCount: 21, fillRate: 0.3, repeats: 3 }
      : { rowCounts: [400, 1600, 3200, 6400, 12800], columnCount: 21, fillRate: 0.3, repeats: 3 };

    const samples = await page.evaluate((o) => window.__compare(o), opts);
    all[`${rate}x`] = samples;

    console.log(`\n=== CPU throttle ${rate}x (390px phone width, 21 cols, 30% fill) ===`);
    console.log("  view    rows    render   layout  blocked    nodes  nodes/row   ms/row");
    for (const s of samples) {
      console.log(
        `  ${s.view.padEnd(6)} ${String(s.rows).padStart(6)}`
        + `  ${s.renderMs.toFixed(1).padStart(8)} ${s.layoutMs.toFixed(1).padStart(8)} ${s.blockedMs.toFixed(1).padStart(8)}`
        + `  ${String(s.domNodes).padStart(7)}  ${s.nodesPerRow.toFixed(1).padStart(9)}  ${s.msPerRow.toFixed(4).padStart(7)}`,
      );
    }
    // Ratio at each row count, the number the "table works" report predicts.
    for (const rows of [...new Set(samples.map((s) => s.rows))]) {
      const l = samples.find((s) => s.rows === rows && s.view === "list");
      const t = samples.find((s) => s.rows === rows && s.view === "table");
      if (l && t) {
        console.log(`  ${rows} rows: list is ${(l.blockedMs / t.blockedMs).toFixed(1)}x the table's blocked time`
          + ` and builds ${(l.domNodes / t.domNodes).toFixed(1)}x the nodes`);
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}

writeFileSync(resolve(OUT, "compare-samples.json"), `${JSON.stringify(all, null, 2)}\n`);
console.log(`\nraw samples at ${resolve(OUT, "compare-samples.json")}`);
