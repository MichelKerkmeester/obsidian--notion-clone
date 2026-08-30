// ───────────────────────────────────────────────────────────────────
// MODULE:    portal-safety
// COMPONENT: what a surface loses when it is moved out of the container
// ───────────────────────────────────────────────────────────────────
//
// Portalling a surface to the body is the only way to escape the leaf's paint
// containment — no coordinate does it. It has been attempted twice here and
// both times it shipped a surface rendering as unstyled text, because most of
// this stylesheet is written `.note-database-container .db-thing` and a node
// that leaves the container stops matching those rules.
//
// Both attempts were reasoned about rather than measured. This measures. For a
// surface rendered where it really mounts, it snapshots every computed property
// of the whole subtree, moves it to the body with the marker classes the sheet
// uses, and reports every property that changed.
//
// A clean report is the evidence a portal is safe for that surface. A dirty one
// names the rules to re-key first, which is the work the sheet's own comment
// says is the right long-term answer.
//
// The imposed half is NOT fixed by guarding the container's own box with
// `:not(.db-surface)`. That was tried and reverted: the guard raises specificity
// from (0,1,0) to (0,2,0), which wins fights `.is-phone .note-database-container`
// used to win on order alone, and it moved 34 captures. Neutralise per surface,
// the way the sheet does with its own height override, or match the original
// specificity exactly.
//
// Position is excluded on purpose: a portal is meant to change where a fixed
// element resolves against, so reporting that would bury the signal in the one
// difference that is intended.
//
// Usage:
//   node tools/live/portal-safety.mjs               all surface scenarios
//   node tools/live/portal-safety.mjs db-filter-panel   one class

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SCENARIOS } from "../screenshots/scenarios.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/** The surfaces that would have to move for Live Preview to stop clipping them. */
const SURFACE_CLASSES = [
  "db-filter-panel",
  "db-sort-panel",
  "db-column-manager",
  "db-view-config-panel",
  "db-record-detail-panel",
  "db-cell-edit-popover",
  "db-dropdown-popover",
];

/**
 * Properties whose change is the portal working rather than the portal breaking.
 *
 * Everything else is compared, including the ones the two failed attempts actually lost — colour,
 * font, padding, border, radius, background and the box metrics.
 */
const EXPECTED_TO_MOVE = new Set([
  "top", "left", "right", "bottom", "position", "inset-block-start", "inset-block-end",
  "inset-inline-start", "inset-inline-end", "z-index", "transform",
]);

// ───────────────────────────────────────────────────────────────────
// 3. MEASURE
// ───────────────────────────────────────────────────────────────────

const wanted = process.argv[2] ? [process.argv[2]] : SURFACE_CLASSES;
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const styles = readFileSync(join(REPO, "styles.css"), "utf8");
const theme = readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8");

const findings = [];

for (const scenario of SCENARIOS.filter((s) => typeof s.html === "function")) {
  let html;
  try { html = scenario.html(); } catch { continue; }
  if (!wanted.some((cls) => html.includes(cls))) continue;

  await page.setContent(`<body><div id="shot">${html}</div></body>`);
  await page.addStyleTag({ content: styles });
  await page.addStyleTag({ content: theme });
  await page.evaluate(() => document.fonts.ready);

  const result = await page.evaluate(({ classes, expected }) => {
    const snapshot = (root) => {
      const nodes = [root, ...root.querySelectorAll("*")];
      return nodes.map((el) => {
        const style = getComputedStyle(el);
        // Carried alongside the properties so a finding names the element to go and look at, not an
        // index into a list nobody else can reconstruct.
        // classList, not className: on an SVG element className is an SVGAnimatedString and has no
        // split, which crashes the whole run on the first icon.
        const out = { __where: el === root ? "(the surface)" : (el.classList[0] ? `.${el.classList[0]}` : `<${el.tagName.toLowerCase()}>`) };
        for (const prop of style) out[prop] = style.getPropertyValue(prop);
        return out;
      });
    };

    const changed = [];
    for (const cls of classes) {
      for (const surface of document.querySelectorAll(`.${cls}`)) {
        const before = snapshot(surface);
        const home = { parent: surface.parentElement, next: surface.nextSibling };

        // Three states, because "it changed" is not yet a work item. Bare on the body says what the
        // container was giving the subtree; with the marker classes says what carrying them back
        // recovers. A property that is still wrong with the markers on is a rule keyed to the
        // surface ITSELF through an ancestor — and a descendant combinator never matches the
        // element carrying the class, so no marker can ever recover those. Those are the rules that
        // have to be re-keyed before this surface can move.
        document.body.appendChild(surface);
        const bare = snapshot(surface);
        surface.classList.add("db-surface", "note-database-container");
        const marked = snapshot(surface);
        surface.classList.remove("db-surface", "note-database-container");
        home.parent.insertBefore(surface, home.next);

        const diffs = [];
        for (let i = 0; i < before.length; i += 1) {
          for (const prop of Object.keys(before[i])) {
            if (prop === "__where" || expected.includes(prop)) continue;
            const home_v = before[i][prop];
            if (home_v === marked[i][prop]) continue;
            diffs.push({
              node: i, where: before[i].__where, prop, from: home_v, to: marked[i][prop],
              // Recovered by nothing the markers can do, so the rule names an ancestor this surface
              // can never be. Imposed means the markers themselves changed it.
              cause: bare[i][prop] === marked[i][prop] ? "unrecoverable" : "imposed",
            });
          }
        }
        if (diffs.length) changed.push({ cls, nodes: before.length, diffs });
      }
    }
    return changed;
  }, { classes: wanted, expected: [...EXPECTED_TO_MOVE] });

  for (const r of result) findings.push({ scenario: scenario.id, ...r });
}

await browser.close();

// ───────────────────────────────────────────────────────────────────
// 4. REPORT
// ───────────────────────────────────────────────────────────────────

console.log(`portal-safety: ${wanted.length} surface classes across the fixtures\n`);

if (findings.length === 0) {
  console.log("  every measured surface keeps all of its computed styling on the body.");
  console.log("  the marker classes carry the whole cascade; a portal is safe for these.");
} else {
  for (const f of findings) {
    // One line per property, not per node: the same rule failing on forty children is one defect.
    const byProp = new Map();
    for (const d of f.diffs) {
      const key = `${d.where} ${d.prop}`;
      if (!byProp.has(key)) byProp.set(key, { count: 0, from: d.from, to: d.to, cause: d.cause });
      byProp.get(key).count += 1;
    }
    const unrecoverable = f.diffs.filter((d) => d.cause === "unrecoverable").length;
    console.log(`  ${f.scenario} — .${f.cls} (${f.nodes} nodes): `
      + `${unrecoverable} unrecoverable, ${f.diffs.length - unrecoverable} imposed by the markers`);
    // Unrecoverable first, always: those are the rules to re-key. The imposed ones are a cap on how
    // much the marker classes have to be neutralised, and are only interesting once the list is clean.
    const ordered = [...byProp].sort((a, b) =>
      (a[1].cause === b[1].cause ? b[1].count - a[1].count : a[1].cause === "unrecoverable" ? -1 : 1));
    for (const [prop, v] of ordered.slice(0, 8)) {
      console.log(`      ${v.cause === "unrecoverable" ? "LOST " : "     "}${prop}: ${v.from} -> ${v.to}`
        + `   (${v.count} node${v.count === 1 ? "" : "s"})`);
    }
  }
}

const total = findings.reduce((n, f) => n + f.diffs.length, 0);
const lost = findings.reduce((n, f) => n + f.diffs.filter((d) => d.cause === "unrecoverable").length, 0);
console.log(`\nportal-safety: ${total} computed properties would change, `
  + `${lost} of them beyond what the marker classes can recover`);
console.log(lost
  ? "  those are rules keyed to an ancestor the surface can never be. Re-key them to the surface\n"
    + "  itself — the way the toggle switch was — and this number goes to zero."
  : "  every difference is one the marker classes impose and can be neutralised per surface.");
process.exit(0);
