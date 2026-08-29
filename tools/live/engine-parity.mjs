// ───────────────────────────────────────────────────────────────────
// MODULE:    engine-parity
// COMPONENT: finds where WebKit and Chrome disagree about the same markup
// ───────────────────────────────────────────────────────────────────
//
// Every screenshot in this repository is rendered by Chrome. Obsidian on iOS and
// iPadOS renders with WebKit. So a defect that only exists in WebKit is invisible
// to the entire capture set by construction — and one shipped: while every
// checkbox in the plugin was falling back to the platform default, the captures
// showed neat square boxes and the user saw circles on their phone.
//
// Doubling 196 screenshots would make that visible and cost a second full set to
// review. This is the cheaper instrument: render each fixture in both engines and
// compare computed values on the elements most likely to diverge. Numbers, not
// pictures — so it can run unattended and name the property that disagrees.
//
// What it cannot see: anything the platform paints rather than computes. A native
// checkbox reports border-radius 0 in both engines and is drawn round in one of
// them. For that class the answer is to own the property outright, which is what
// makes it engine-independent, or to look at the device.
//
// Exit 0 when the engines agree within the declared tolerances, 1 when they do not.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright-core";
import { SCENARIOS } from "../screenshots/scenarios.mjs";
import { stamp } from "./evidence.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
].find(existsSync) || process.env.SCREENSHOT_CHROME;

/**
 * The elements worth comparing.
 *
 * Form controls first, because that is where the engines' platform defaults differ most and where
 * the one shipped defect lived. A full DOM diff would drown the signal in sub-pixel text metrics.
 */
const SUBJECTS = [
  'input[type="checkbox"]',
  'input[type="text"]',
  "select",
  "button",
  ".db-checkbox",
];

/** Sub-pixel disagreement is normal between engines; a whole pixel is a layout difference. */
const PIXEL_TOLERANCE = 1.5;

// ───────────────────────────────────────────────────────────────────
// 3. MEASURE
// ───────────────────────────────────────────────────────────────────

if (!CHROME) {
  console.error("engine-parity: no Chrome found. Set SCREENSHOT_CHROME.");
  process.exit(2);
}

const css = readFileSync(join(REPO, "styles.css"), "utf8");
const theme = readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8");
const runtime = readFileSync(join(REPO, "tools/screenshots/runtime-vars.css"), "utf8");
const scenarios = SCENARIOS.filter((s) => typeof s.html === "function");

async function measure(engine, launchOptions) {
  const browser = await engine.launch(launchOptions);
  // Reduced motion for the same reason the capture harness needs it: a transitioned property read
  // before it settles reports an animation frame, and the two engines will not be mid-frame together.
  const page = await browser.newPage({
    viewport: { width: 1200, height: 900 },
    reducedMotion: "reduce",
  });
  const out = {};
  for (const scenario of scenarios) {
    let html;
    try {
      html = scenario.html();
    } catch {
      continue;
    }
    await page.setContent(`<body><div id="shot">${html}</div></body>`);
    await page.addStyleTag({ content: css });
    await page.addStyleTag({ content: theme });
    await page.addStyleTag({ content: runtime });
    await page.evaluate(() => document.fonts.ready);
    out[scenario.id] = await page.evaluate((subjects) => {
      const rows = [];
      for (const selector of subjects) {
        document.querySelectorAll(selector).forEach((el, index) => {
          const s = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          rows.push({
            selector,
            index,
            appearance: s.appearance || s.webkitAppearance || "",
            radius: s.borderRadius,
            background: s.backgroundColor,
            width: Math.round(r.width * 100) / 100,
            height: Math.round(r.height * 100) / 100,
          });
        });
      }
      return rows;
    }, subjects);
  }
  await browser.close();
  return out;
}

const subjects = SUBJECTS;
const chrome = await measure(chromium, { executablePath: CHROME });
const safari = await measure(webkit, {});

// ───────────────────────────────────────────────────────────────────
// 4. COMPARE
// ───────────────────────────────────────────────────────────────────

const differences = [];
for (const [scenarioId, chromeRows] of Object.entries(chrome)) {
  const safariRows = safari[scenarioId] || [];
  chromeRows.forEach((c, i) => {
    const w = safariRows[i];
    if (!w) return;
    const notes = [];
    if (c.appearance !== w.appearance) notes.push(`appearance ${c.appearance} vs ${w.appearance}`);
    if (c.background !== w.background) notes.push(`background ${c.background} vs ${w.background}`);
    if (c.radius !== w.radius) notes.push(`radius ${c.radius} vs ${w.radius}`);
    if (Math.abs(c.width - w.width) > PIXEL_TOLERANCE) notes.push(`width ${c.width} vs ${w.width}`);
    if (Math.abs(c.height - w.height) > PIXEL_TOLERANCE) notes.push(`height ${c.height} vs ${w.height}`);
    if (notes.length) differences.push({ scenarioId, selector: c.selector, index: c.index, notes });
  });
}

const scenarioCount = Object.keys(chrome).length;
console.log(`engine-parity: ${scenarioCount} fixtures compared in Chrome and WebKit\n`);
console.log(`  elements disagreeing   ${differences.length}\n`);

for (const d of differences.slice(0, 25)) {
  console.log(`  ${d.scenarioId} — ${d.selector}[${d.index}]`);
  for (const n of d.notes) console.log(`      ${n}`);
}
if (differences.length > 25) console.log(`\n  ... and ${differences.length - 25} more`);

stamp("tools/live/engine-parity.json", {
  totals: { fixtures: scenarioCount, differences: differences.length },
  differences,
}, ["styles.css", "tools/live/engine-parity.mjs", "tools/screenshots/scenarios.mjs"]);

process.exit(differences.length === 0 ? 0 : 1);
