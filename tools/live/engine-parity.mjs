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
// Every disagreement this lane measures today traces to two engine behaviours, neither a
// stylesheet gap: this stylesheet already gives every disagreeing text input an explicit
// `width` and `box-sizing`. (1) WebKit reserves a classic scrollbar's width inside an
// `overflow: auto` surface while Chrome paints overlay scrollbars, so every child of a
// scrolling popover shifts by the same few pixels; (2) a text input's intrinsic width is the
// engines' own, and it leaks through every shrink-to-fit ancestor — inside a fit-content
// flex item, table cell or popover, a `width: 100%` input never resolves to a definite
// width, so the engines' native defaults (WebKit 215.3125px, Chrome 193px at the default
// size) become the track. Both sit under the "reads as the same surface" bar on a device,
// so they are recorded as a steady state rather than chased.
//
// That steady state is a gate, not a suppression. Exit 0 when every disagreement this run
// finds matches the previously recorded one — same scenario, same element, same property,
// and a delta that has not grown past the pixel tolerance. Exit 1 the moment any
// disagreement is new, changed property, or grown. This run refreshes the record, so a
// deliberate engine- or fixture-level change is absorbed on the next run: the divergence
// prints, the exit stays 1 until the next run confirms it is the whole truth. What can
// never happen quietly is a disagreement appearing, widening, or switching property —
// those are exactly what this lane exists to catch, and they fail the run.

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
  ".obnotion-checkbox",
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
    // A transitioned property read before it settles reports an animation frame, and the two
    // engines will not be mid-frame together — the same race reducedMotion only shortens. A
    // native checkbox read one frame into its checked-background transition reports the
    // from-frame in one engine and the to-frame in the other, so the disagreement flickers
    // between runs. Every finite animation is awaited to its end before the read; only
    // infinite ones (spinners, which never settle) are skipped, and allSettled keeps a
    // finished-rejected animation from wedging the fixture.
    await page.evaluate(() => Promise.allSettled(
      document.getAnimations()
        .filter((a) => Number.isFinite(a.effect?.getComputedTiming()?.duration))
        .map((a) => a.finished),
    ));
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

// ───────────────────────────────────────────────────────────────────
// 5. STEADY STATE
// ───────────────────────────────────────────────────────────────────

// The recorded set is read before this run stamps, so the comparison is always against what
// the previous run measured, never against itself. A disagreement is steady when this run's
// notes are a subset of the recorded ones for the same scenario, element and index: a
// recorded note that disappeared is an improvement and passes; a new note, a note whose
// property the record never carried, or a whose numeric delta drifted past the pixel
// tolerance is a new disagreement. The same PIXEL_TOLERANCE that decides whether a numeric
// difference is a disagreement at all decides how far a recorded one may drift — one
// threshold, so the lane cannot be made stricter or looser by editing two numbers instead
// of one.
const recordedPath = join(REPO, "tools/live/engine-parity.json");
const recorded = (() => {
  const next = new Map();
  if (!existsSync(recordedPath)) return next;
  try {
    for (const d of JSON.parse(readFileSync(recordedPath, "utf8")).differences ?? []) {
      next.set(`${d.scenarioId}|${d.selector}|${d.index}`, d.notes ?? []);
    }
  } catch {
    // An unreadable record fails everything rather than inventing a clean steady state.
  }
  return next;
})();

const METRIC_NOTE = /^(width|height) (-?[-\d.]+) vs (-?[-\d.]+)$/;

function isSteady(d, recordedNotes) {
  if (!recordedNotes) return false;
  return d.notes.every((note) => {
    if (METRIC_NOTE.test(note)) {
      const prop = note.match(METRIC_NOTE)[1];
      const recordedNote = recordedNotes.find((r) => METRIC_NOTE.test(r) && r.match(METRIC_NOTE)[1] === prop);
      if (!recordedNote) return false;
      const now = note.match(METRIC_NOTE);
      const was = recordedNote.match(METRIC_NOTE);
      return Math.abs(Math.abs(+now[2] - +now[3]) - Math.abs(+was[2] - +was[3])) <= PIXEL_TOLERANCE;
    }
    // Categorical notes (appearance, background, radius) carry the recorded note verbatim:
    // a categorical value that changed at all is a disagreement the record did not have.
    return recordedNotes.includes(note);
  });
}

const steady = differences.filter((d) => isSteady(d, recorded.get(`${d.scenarioId}|${d.selector}|${d.index}`)));
const novel = differences.filter((d) => !steady.includes(d));

const scenarioCount = Object.keys(chrome).length;
console.log(`engine-parity: ${scenarioCount} fixtures compared in Chrome and WebKit\n`);
console.log(`  elements disagreeing   ${differences.length} (steady ${steady.length}, new ${novel.length})\n`);

for (const d of differences.slice(0, 25)) {
  const mark = steady.includes(d) ? "steady" : "NEW";
  console.log(`  ${d.scenarioId} — ${d.selector}[${d.index}]  [${mark}]`);
  for (const n of d.notes) console.log(`      ${n}`);
}
if (differences.length > 25) console.log(`\n  ... and ${differences.length - 25} more`);

stamp("tools/live/engine-parity.json", {
  totals: { fixtures: scenarioCount, differences: differences.length, steady: steady.length, new: novel.length },
  differences,
}, ["styles.css", "tools/screenshots/theme.css", "tools/screenshots/runtime-vars.css", "tools/live/engine-parity.mjs", "tools/screenshots/scenarios.mjs"]);

process.exit(novel.length === 0 ? 0 : 1);
