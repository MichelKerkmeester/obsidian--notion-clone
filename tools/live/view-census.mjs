// ───────────────────────────────────────────────────────────────────
// MODULE:    view-census
// COMPONENT: measures row rhythm and containment across every view and width
// ───────────────────────────────────────────────────────────────────
//
// Two reported defects, one question. List rows are ragged; calendar filter
// bubbles overflow their container. Both ask whether the container owns the size
// or the child does, and one sizing decision answers both.
//
// Neither has ever been measured. The geometry harness renders no view at all,
// and the capture set has only two widths, so a layout that breaks at 320 or 768
// is outside everything this repository can see. This renders every view fixture
// at four widths and records what actually happens.
//
// It answers, per view and width:
//
//   CONTAINMENT  every element whose right edge passes its parent's content box.
//                Legitimate overflow scrolls — the parent's width is unchanged
//                and its scrollWidth exceeds its clientWidth. Overflow that
//                *grows* the parent is the defect, and the two are only
//                distinguishable by measuring both.
//
//   RHYTHM       the spread of sibling row heights. Ragged means the standard
//                deviation is not zero, and saying so needs the population, not
//                an eyeball.
//
//   PROBE        a value that cannot exist unless the stylesheet loaded. The
//                desktop geometry page rendered without it for a long time and
//                reported green throughout — every number taken there described
//                a document nobody ships. This refuses to report anything else
//                until the probe says the cascade is present.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
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

/** Two of these are new. The capture set only ever rendered 402 and 1440. */
const WIDTHS = [320, 402, 768, 1440];

/** Sub-pixel bleed is rounding, not a defect. A whole pixel is a layout error. */
const OVERFLOW_TOLERANCE = 1;

// ───────────────────────────────────────────────────────────────────
// 3. MEASURE
// ───────────────────────────────────────────────────────────────────

if (!CHROME) {
  console.error("view-census: no Chrome found. Set SCREENSHOT_CHROME.");
  process.exit(2);
}

const css = readFileSync(join(REPO, "styles.css"), "utf8");
const theme = readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8");
const runtime = readFileSync(join(REPO, "tools/screenshots/runtime-vars.css"), "utf8");
const fixtures = SCENARIOS.filter((s) => typeof s.html === "function");

const browser = await chromium.launch({ executablePath: CHROME });
const rows = [];
const probes = [];

for (const width of WIDTHS) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    reducedMotion: "reduce",
  });

  for (const fixture of fixtures) {
    let html;
    try {
      html = fixture.html();
    } catch {
      continue;
    }
    await page.setContent(`<body><div id="shot">${html}</div></body>`);
    await page.addStyleTag({ content: css });
    await page.addStyleTag({ content: theme });
    await page.addStyleTag({ content: runtime });
    await page.evaluate(() => document.fonts.ready);

    const result = await page.evaluate(({ tolerance }) => {
      const shot = document.getElementById("shot");

      // The probe. A plugin token resolving to a real value is only possible with the stylesheet
      // present, so this separates "measured and clean" from "measured nothing".
      const probeEl = shot.querySelector("[class*='db-']") || shot;
      const probe = getComputedStyle(probeEl).getPropertyValue("--db-radius-sm").trim();

      const escaping = [];
      shot.querySelectorAll("*").forEach((el) => {
        const parent = el.parentElement;
        if (!parent || parent === shot) return;
        const pr = parent.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        if (er.width === 0 || pr.width === 0) return;
        const ps = getComputedStyle(parent);
        const padRight = parseFloat(ps.paddingRight) || 0;
        const contentRight = pr.right - padRight - (parseFloat(ps.borderRightWidth) || 0);
        if (er.right <= contentRight + tolerance) return;

        // Overflow that scrolls is a design decision; overflow that grows the parent is the bug.
        //
        // The scroller need not be the immediate parent — a wide axis inside a wrapper inside a
        // scroller is contained. Walk up until one is found. Note that a class named "-scroll" is
        // not evidence of one: this codebase has a `.db-timeline-scroll` declaring
        // `overflow-x: visible`, which is exactly why this asks the computed style instead.
        let scrolls = false;
        for (let a = el.parentElement; a && a !== shot; a = a.parentElement) {
          const as = getComputedStyle(a);
          if (!["auto", "scroll"].includes(as.overflowX)) continue;
          scrolls = a.scrollWidth > a.clientWidth + 1;
          break;
        }
        escaping.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().split(/\s+/).slice(0, 2).join("."),
          parentCls: (parent.className || "").toString().split(/\s+/).slice(0, 2).join("."),
          by: Math.round((er.right - contentRight) * 10) / 10,
          scrolls,
        });
      });

      // Row rhythm, restricted to things that are actually rows.
      //
      // A first pass measured every group of same-classed siblings and reported board *columns* as
      // ragged, which they are meant to be — they hold different numbers of cards. Raggedness is a
      // claim about rows in a list or table, so that is what gets measured.
      const rhythms = [];
      shot.querySelectorAll("*").forEach((parent) => {
        const kids = [...parent.children];
        if (kids.length < 3) return;
        const first = (kids[0].className || "").toString().trim();
        if (!first || !kids.every((k) => (k.className || "").toString().trim() === first)) return;
        if (!/(^|[\s-])(row|item|entry)([\s-]|$)/.test(first) && !/-row\b/.test(first)) return;
        const heights = kids.map((k) => Math.round(k.getBoundingClientRect().height * 10) / 10);
        const mean = heights.reduce((a, b) => a + b, 0) / heights.length;
        const sd = Math.sqrt(heights.reduce((a, h) => a + (h - mean) ** 2, 0) / heights.length);
        rhythms.push({
          cls: first.split(/\s+/)[0],
          count: heights.length,
          mean: Math.round(mean * 10) / 10,
          sd: Math.round(sd * 100) / 100,
          distinct: new Set(heights).size,
        });
      });

      return { probe, escaping, rhythms };
    }, { tolerance: OVERFLOW_TOLERANCE });

    probes.push({ width, fixture: fixture.id, probe: result.probe });
    for (const e of result.escaping) rows.push({ width, fixture: fixture.id, kind: "escaping", ...e });
    for (const r of result.rhythms) rows.push({ width, fixture: fixture.id, kind: "rhythm", ...r });
  }
  await page.close();
}


// ───────────────────────────────────────────────────────────────────
// 3b. THE ROW-RHYTHM MATRIX
// ───────────────────────────────────────────────────────────────────

// The fixtures carry one field count each, and the reported defect is about rows that disagree in
// height — which is a function of how much each row has to fit. So rows are synthesised at the
// field counts the criteria name, with wrapping both on and off, because the report says the
// raggedness appears in one of those states and not the other.
//
// The markup mirrors what the list renderer builds. It is a reproduction and is labelled as one;
// if it disagrees with the running app, the app wins.

const FIELD_COUNTS = [1, 6, 20];
const matrix = [];

const rowMatrixPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
for (const width of WIDTHS) {
  await rowMatrixPage.setViewportSize({ width, height: 900 });
  for (const fields of FIELD_COUNTS) {
    for (const wrap of [false, true]) {
      const html = Array.from({ length: 20 }, (_, r) => {
        const cells = Array.from({ length: fields }, (_, f) =>
          `<div class="db-list-row-field"><span class="db-list-row-field-label">Field ${f}</span>` +
          `<span class="db-list-row-field-value">Value ${r}-${f} some longer text</span></div>`
        ).join("");
        return `<div class="db-list-row"><div class="db-list-row-controls">` +
          `<input type="checkbox" class="db-checkbox db-checkbox-row"></div>` +
          `<div class="db-list-row-main"><div class="db-list-row-title">Row ${r}</div>` +
          `<div class="db-list-row-meta"${wrap ? ' style="flex-wrap: wrap"' : ""}>${cells}</div></div></div>`;
      }).join("");
      await rowMatrixPage.setContent(
        `<body><div id="shot"><div class="note-database-container"><div class="db-list">${html}</div></div></div></body>`
      );
      await rowMatrixPage.addStyleTag({ content: css });
      await rowMatrixPage.addStyleTag({ content: theme });
      await rowMatrixPage.addStyleTag({ content: runtime });
      await rowMatrixPage.evaluate(() => document.fonts.ready);
      const r = await rowMatrixPage.evaluate(() => {
        const rowsEl = [...document.querySelectorAll(".db-list-row")];
        const heights = rowsEl.map((e) => Math.round(e.getBoundingClientRect().height * 10) / 10);
        const mean = heights.reduce((a, b) => a + b, 0) / heights.length;
        const sd = Math.sqrt(heights.reduce((a, h) => a + (h - mean) ** 2, 0) / heights.length);
        const line = parseFloat(getComputedStyle(rowsEl[0]).lineHeight) || 0;

        // A row that never changes height however much it is given is not well-behaved, it is
        // rigid — the content has to go somewhere, and "somewhere" is outside the row. Count it.
        let spilling = 0;
        let worstSpill = 0;
        for (const row of rowsEl) {
          const rr = row.getBoundingClientRect();
          row.querySelectorAll("*").forEach((el) => {
            const er = el.getBoundingClientRect();
            if (er.width === 0) return;
            const over = Math.max(er.right - rr.right, er.bottom - rr.bottom);
            if (over > 1) {
              spilling += 1;
              worstSpill = Math.max(worstSpill, Math.round(over * 10) / 10);
            }
          });
        }
        return {
          spilling,
          worstSpill,
          mean: Math.round(mean * 10) / 10,
          sd: Math.round(sd * 100) / 100,
          distinct: new Set(heights).size,
          min: Math.min(...heights),
          max: Math.max(...heights),
          lineBox: Math.round(line * 10) / 10,
        };
      });
      matrix.push({ width, fields, wrap, ...r });
    }
  }
}
await rowMatrixPage.close();

// ───────────────────────────────────────────────────────────────────
// 4. THE PROBE GATE
// ───────────────────────────────────────────────────────────────────

const blind = probes.filter((p) => !p.probe);
console.log(`view-census: ${fixtures.length} fixtures x ${WIDTHS.length} widths\n`);
console.log(`  probe returned a stylesheet value  ${probes.length - blind.length}/${probes.length}`);

if (blind.length === probes.length) {
  console.error("\nview-census: the probe found no plugin token anywhere.");
  console.error("Every number below would describe a document rendered without the stylesheet,");
  console.error("which is the substitution this phase exists to catch. Refusing to report.");
  process.exit(2);
}

// ───────────────────────────────────────────────────────────────────
// 5. REPORT
// ───────────────────────────────────────────────────────────────────

const escaping = rows.filter((r) => r.kind === "escaping");
const grows = escaping.filter((r) => !r.scrolls);
const scrolls = escaping.filter((r) => r.scrolls);
const rhythms = rows.filter((r) => r.kind === "rhythm");
const ragged = rhythms.filter((r) => r.sd > 0);

console.log(`  elements past their container      ${escaping.length}`);
console.log(`    scrolling (a decision)           ${scrolls.length}`);
console.log(`    growing the parent (the defect)  ${grows.length}`);
console.log(`  sibling groups measured            ${rhythms.length}`);
console.log(`    ragged (height sd > 0)           ${ragged.length}\n`);

const worst = [...grows].sort((a, b) => b.by - a.by).slice(0, 12);
if (worst.length) {
  console.log("GROWING THEIR CONTAINER — widest first:");
  for (const w of worst) {
    console.log(`  ${String(w.width).padStart(4)}px  ${w.fixture.padEnd(24)} .${w.cls || w.tag} past .${w.parentCls} by ${w.by}px`);
  }
  console.log("");
}
const worstRagged = [...ragged].sort((a, b) => b.sd - a.sd).slice(0, 10);
if (worstRagged.length) {
  console.log("RAGGED ROWS — largest spread first:");
  for (const r of worstRagged) {
    console.log(`  ${String(r.width).padStart(4)}px  ${r.fixture.padEnd(24)} .${r.cls} n=${r.count} mean=${r.mean} sd=${r.sd} distinct=${r.distinct}`);
  }
  console.log("");
}

await browser.close();

console.log("ROW RHYTHM — 20 synthesised rows, height spread:");
console.log("  width  fields  wrap   mean     sd   content escaping the row");
for (const m of matrix) {
  const flag = m.spilling > 0 ? `  ${m.spilling} spilling, worst ${m.worstSpill}px` : "";
  console.log(`  ${String(m.width).padStart(5)}  ${String(m.fields).padStart(6)}  ${m.wrap ? "on " : "off"}  ${String(m.mean).padStart(6)}  ${String(m.sd).padStart(5)}${flag}`);
}
console.log("");

stamp("tools/live/view-census.json", {
  widths: WIDTHS,
  rowMatrix: matrix,
  totals: {
    fixtures: fixtures.length,
    escaping: escaping.length,
    growing: grows.length,
    scrolling: scrolls.length,
    rhythmGroups: rhythms.length,
    ragged: ragged.length,
    probeBlind: blind.length,
  },
  rows,
  probes,
}, ["styles.css", "tools/live/view-census.mjs", "tools/screenshots/scenarios.mjs"]);
