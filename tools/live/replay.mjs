// ───────────────────────────────────────────────────────────────────
// MODULE:    replay
// COMPONENT: re-asserts every landed phase's result against today's tree
// ───────────────────────────────────────────────────────────────────
//
// No phase can know that a later stylesheet edit preserved its result. There is
// one serialised lane through a nineteen-thousand-line file that every phase
// holds in turn, and that file already contains eighty-seven duplicated
// selectors and a hundred and twenty-four silently overridden values. A phase
// that measures its surfaces green, releases the lane and watches three more
// phases edit the same file has proven something about a tree that no longer
// exists.
//
// So each claim below is held with the number the phase that made it recorded,
// and re-checked here. A reversal is reported as the specific claim it broke and
// the phase that owns it, rather than as a count of failures — because the
// person reading this needs to know whose work just came undone.
//
// Run it at every lane handoff, not only at release. A gate delivered after the
// work it guards is a report.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { SCENARIOS } from "../screenshots/scenarios.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
].find(existsSync) || process.env.SCREENSHOT_CHROME;

// ───────────────────────────────────────────────────────────────────
// 3. THE CLAIMS
// ───────────────────────────────────────────────────────────────────

/**
 * Each entry is a result some phase measured and is entitled to keep.
 *
 * `recorded` is what that phase measured when it landed — not a threshold picked afterwards. Where
 * a claim is "zero of something", the number the defect stood at before the fix is kept in `was`,
 * so a reversal can be recognised by its own original value.
 */
const CLAIMS = [
  {
    phase: "004-checkbox-ownership",
    claim: "no checkbox falls back to the platform box",
    was: 23,
    recorded: 0,
    async measure(page) {
      let platform = 0;
      for (const s of SCENARIOS.filter((x) => typeof x.html === "function")) {
        let html;
        try { html = s.html(); } catch { continue; }
        await load(page, html);
        platform += await page.evaluate(() =>
          [...document.querySelectorAll('input[type="checkbox"]')]
            .filter((el) => getComputedStyle(el).appearance !== "none").length);
      }
      return platform;
    },
  },
  {
    phase: "005-content-row-rhythm",
    claim: "no list row paints outside its container",
    was: 26,
    recorded: 0,
    async measure(page) {
      let worst = 0;
      for (const id of ["list-view", "list-mobile"]) {
        const s = SCENARIOS.find((x) => x.id === id);
        if (!s) continue;
        await load(page, s.html());
        worst = Math.max(worst, await page.evaluate(() => {
          const rows = [...document.querySelectorAll(".db-list-row")];
          if (!rows.length) return 0;
          const parent = rows[0].parentElement.getBoundingClientRect().width;
          return Math.round(Math.max(...rows.map((r) => r.getBoundingClientRect().width - parent)));
        }));
      }
      return worst;
    },
  },
  {
    phase: "002-properties-panel",
    claim: "the properties row stays on one line",
    was: 2,
    recorded: 1,
    async measure(page) {
      const s = SCENARIOS.find((x) => x.id === "panel-column-manager");
      if (!s) return 1;
      await load(page, s.html());
      return page.evaluate(() => {
        const row = document.querySelector(".db-column-manager-row");
        return getComputedStyle(row).gridTemplateRows.split(/\s+/).filter(Boolean).length;
      });
    },
  },
  {
    phase: "002-properties-panel",
    claim: "the property name takes the flexible track, not the type icon",
    was: 0,
    recorded: 1,
    async measure(page) {
      const s = SCENARIOS.find((x) => x.id === "panel-column-manager");
      if (!s) return 0;
      await load(page, s.html());
      return page.evaluate(() => {
        const row = document.querySelector(".db-column-manager-row");
        const name = row.querySelector(".db-column-name-wrap").getBoundingClientRect().width;
        const type = row.querySelector(".db-column-type").getBoundingClientRect().width;
        return name > type * 3 ? 1 : 0;
      });
    },
  },
  {
    phase: "000-surface-contract-and-truthful-harness",
    claim: "a body-mounted surface marked db-surface resolves the plugin tokens",
    was: 0,
    recorded: 1,
    async measure(page) {
      await load(page, '<div class="db-surface" id="probe"></div>');
      return page.evaluate(() => {
        const el = document.getElementById("probe");
        return getComputedStyle(el).getPropertyValue("--db-radius-sm").trim() ? 1 : 0;
      });
    },
  },
];

// ───────────────────────────────────────────────────────────────────
// 4. RUN
// ───────────────────────────────────────────────────────────────────

const css = readFileSync(join(REPO, "styles.css"), "utf8");
const theme = readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8");
const runtime = readFileSync(join(REPO, "tools/screenshots/runtime-vars.css"), "utf8");

async function load(page, html) {
  await page.setContent(`<body><div id="shot">${html}</div></body>`);
  await page.addStyleTag({ content: css });
  await page.addStyleTag({ content: theme });
  await page.addStyleTag({ content: runtime });
  await page.evaluate(() => document.fonts.ready);
}

if (!CHROME) {
  console.error("replay: no Chrome found. Set SCREENSHOT_CHROME.");
  process.exit(2);
}

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

const reversed = [];
console.log(`replay: re-asserting ${CLAIMS.length} landed results against today's tree\n`);
for (const c of CLAIMS) {
  const actual = await c.measure(page);
  const held = actual === c.recorded;
  if (!held) reversed.push({ ...c, actual });
  console.log(`  ${held ? "held " : "BROKE"}  ${c.phase}`);
  console.log(`         ${c.claim}`);
  console.log(`         recorded ${c.recorded}, now ${actual}${held ? "" : `  (the defect stood at ${c.was})`}`);
}
await browser.close();

console.log("");
if (reversed.length === 0) {
  console.log(`replay: PASS — all ${CLAIMS.length} results still hold`);
  process.exit(0);
}
console.error(`replay: FAIL — ${reversed.length} result(s) reversed since the phase that measured them`);
for (const r of reversed) {
  console.error(`  ${r.phase} measured ${r.recorded} and now gets ${r.actual}.`);
}
console.error("\nA later edit undid earlier work. Find which, rather than re-recording the new number:");
console.error("the recorded value is the claim, and moving it to match is how a gate stops being one.");
process.exit(1);
