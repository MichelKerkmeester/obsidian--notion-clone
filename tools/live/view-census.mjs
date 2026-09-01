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
        // Is this inside the header, and does it reach past the HEADER's content box rather than
        // its immediate parent's? `005` states that separately, and it is a different question: a
        // control can sit neatly inside its own wrapper while the wrapper itself hangs off the
        // header's edge, so measuring parent-by-parent reports the chain as clean and the header as
        // ragged. The header is the box a reader sees.
        const header = el.closest(".db-header");
        let pastHeader = 0;
        if (header && header !== el) {
          const hs = getComputedStyle(header);
          const hr = header.getBoundingClientRect();
          const headerContentRight = hr.right - (parseFloat(hs.paddingRight) || 0)
            - (parseFloat(hs.borderRightWidth) || 0);
          if (er.right > headerContentRight + tolerance) {
            pastHeader = Math.round((er.right - headerContentRight) * 10) / 10;
          }
        }
        escaping.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().split(/\s+/).slice(0, 2).join("."),
          parentCls: (parent.className || "").toString().split(/\s+/).slice(0, 2).join("."),
          by: Math.round((er.right - contentRight) * 10) / 10,
          scrolls,
          pastHeader,
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
// field counts the criteria name.
//
// The markup mirrors what the list renderer builds. It is a reproduction and is labelled as one;
// if it disagrees with the running app, the app wins.
//
// It did disagree, silently, for as long as this matrix has existed. It emitted
// `db-list-row-field`, `db-list-row-field-label` and `db-list-row-field-value`, and each of those
// three has zero rules in the stylesheet and zero creation sites in the source. Every row it
// measured was a stack of unstyled divs: no track width, no grid column, no padding. The heights,
// the standard deviations and the spill counts were all real measurements of markup the plugin does
// not build, which is a check that cannot fail whatever the product does. The names below are the
// ones list-renderer.ts actually creates, and the title sits inside the line wrapper it is built in.
//
// The second axis was inert for the same reason. It toggled an inline `flex-wrap` on the meta row,
// which has been a grid since the column fix landed and ignores the property outright. The axis
// that does change the layout regime is the device: the desktop lays these rows out on a grid and
// the phone on a wrapping flex line, and the phone is where a column claimed by index has nothing
// to claim it with.

const FIELD_COUNTS = [1, 6, 20];
const matrix = [];

const rowMatrixPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
for (const width of WIDTHS) {
  await rowMatrixPage.setViewportSize({ width, height: 900 });
  for (const fields of FIELD_COUNTS) {
    for (const phone of [false, true]) {
      const template = Array.from({ length: fields }, () => "150px").join(" ");
      const html = Array.from({ length: 20 }, (_, r) => {
        // CONTENT LENGTH VARIES PER ROW, and that is the whole point of the standard deviation.
        //
        // Every row used to carry the same string, so a spread of zero was guaranteed by
        // construction: twenty identical rows are the same height however the row is laid out, and
        // the criterion this answers — "20 rows, wrapping off: standard deviation of row heights is
        // 0" — was reading its own fixture back to itself. This packet's own audit says so, and it
        // is the reason that bullet stayed open while a green number sat beside it.
        //
        // The lengths run from a single character to a paragraph, so a row that WRAPS is a taller
        // row and the deviation moves. Zero now means the values truncate as the stylesheet says
        // they do, which is a claim about the product rather than about the input.
        const filler = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod ";
        const cells = Array.from({ length: fields }, (_, f) =>
          `<div class="db-list-field" style="grid-column: ${f + 1}"><span class="db-list-field-label">Field ${f}</span>` +
          `<div class="db-list-field-value">${"x".repeat(r % 3) || ""}Value ${r}-${f} ` +
          `${filler.repeat(r % 5)}</div></div>`
        ).join("");
        return `<div class="db-list-row" role="row"><div class="db-list-row-controls">` +
          `<input type="checkbox" class="db-checkbox db-checkbox-row db-list-row-checkbox"></div>` +
          `<div class="db-list-row-main"><div class="db-record-title-line">` +
          `<span class="db-list-row-title">Row ${r}</span></div>` +
          `<div class="db-list-row-meta" style="grid-template-columns: ${template}">${cells}</div></div></div>`;
      }).join("");
      // --capture-max-width bounds the container the way the capture harness does. Without it the
      // container sized itself to content and measured 948px inside a 402px viewport, so every
      // phone number taken from this page described a width no phone has.
      await rowMatrixPage.setContent(
        `<html style="--capture-max-width: ${width}px"><body class="${phone ? "is-mobile is-phone" : ""}">`
        + `<div id="shot"><div class="note-database-container"><div class="db-list">${html}</div></div></div></body></html>`
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
      matrix.push({ width, fields, phone, ...r });
    }
  }
}
await rowMatrixPage.close();

// ───────────────────────────────────────────────────────────────────
// 3c. THE RAIL
// ───────────────────────────────────────────────────────────────────

// The view-controls rail is a child of the header and renders in every view, not just the calendar.
// Two things about it were never asserted.
//
// It must scroll rather than grow: its own width stays inside the container while its scrollWidth
// exceeds its clientWidth. A rail that grows pushes the whole header wider and the controls end up
// off-screen, which is what an overflowing row of filter bubbles looks like.
//
// And its fade is a three-act cascade — a gradient, then `none`, then the gradient again under
// `.is-overflowing`. The renderer computes that class from scrollWidth against clientWidth, so in a
// static fixture it is never present and the third act never runs. Applying it by hand is the only
// way to assert that the act which the renderer depends on still wins.

const rail = [];
const railPage = await browser.newPage({ viewport: { width: 402, height: 900 }, reducedMotion: "reduce" });
for (const width of WIDTHS) {
  await railPage.setViewportSize({ width, height: 900 });
  for (const fixture of fixtures) {
    let html;
    try { html = fixture.html(); } catch { continue; }
    if (!html.includes("db-active-view-controls-scroll")) continue;
    await railPage.setContent(`<body><div id="shot">${html}</div></body>`);
    await railPage.addStyleTag({ content: css });
    await railPage.addStyleTag({ content: theme });
    await railPage.addStyleTag({ content: runtime });
    await railPage.evaluate(() => document.fonts.ready);
    rail.push({
      width,
      fixture: fixture.id,
      ...(await railPage.evaluate(() => {
        const el = document.querySelector(".db-active-view-controls-scroll");
        const container = document.querySelector(".note-database-container");
        const mask = (n) => {
          const s = getComputedStyle(n);
          return (s.maskImage && s.maskImage !== "none" ? s.maskImage : s.webkitMaskImage) || "none";
        };
        const before = mask(el);
        el.classList.add("is-overflowing");
        const after = mask(el);
        el.classList.remove("is-overflowing");
        return {
          scrolls: getComputedStyle(el).overflowX === "auto" || getComputedStyle(el).overflowX === "scroll",
          overflowing: el.scrollWidth > el.clientWidth + 1,
          growsContainer: el.getBoundingClientRect().width > container.getBoundingClientRect().width + 1,
          fadeAppears: after !== before && after !== "none",
        };
      })),
    });
  }
}
await railPage.close();

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
// `005`: no descendant of `.db-header` has a right edge beyond the header's content box. A
// descendant that scrolls is still inside a scroller, and a scroller inside the header is the
// header's own decision — so the count that matters is the one that neither scrolls nor fits.
const headerSpill = escaping.filter((r) => r.pastHeader > 0 && !r.scrolls);
console.log(`  header descendants past the header's content box  ${headerSpill.length}`);
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

if (headerSpill.length) {
  console.log("\nPAST THE HEADER'S CONTENT BOX — widest first:");
  for (const r of [...headerSpill].sort((a, b) => b.pastHeader - a.pastHeader).slice(0, 10)) {
    console.log(`  ${String(r.width).padStart(5)}px  ${(r.fixture || "").padEnd(24)} .${r.cls} by ${r.pastHeader}px`);
  }
  console.log("");
}

console.log("ROW RHYTHM — 20 synthesised rows, height spread:");
console.log("  width  fields  device   mean     sd   content escaping the row");
for (const m of matrix) {
  const flag = m.spilling > 0 ? `  ${m.spilling} spilling, worst ${m.worstSpill}px` : "";
  console.log(`  ${String(m.width).padStart(5)}  ${String(m.fields).padStart(6)}  ${m.phone ? "phone  " : "desktop"}  ${String(m.mean).padStart(6)}  ${String(m.sd).padStart(5)}${flag}`);
}
console.log("");

const railGrows = rail.filter((r) => r.growsContainer);
const railNoFade = rail.filter((r) => r.overflowing && !r.fadeAppears);
console.log("RAIL — scroll-versus-grow, and the fade the renderer depends on:");
console.log(`  measured                              ${rail.length}`);
console.log(`  growing their container (the defect)  ${railGrows.length}`);
console.log(`  overflowing without a working fade    ${railNoFade.length}\n`);

stamp("tools/live/view-census.json", {
  widths: WIDTHS,
  rail,
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
