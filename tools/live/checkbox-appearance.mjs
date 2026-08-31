// ───────────────────────────────────────────────────────────────────
// MODULE:    checkbox-appearance
// COMPONENT: reads what each checkbox actually computes, in a browser
// ───────────────────────────────────────────────────────────────────
//
// The operator's report is "the checkboxes are round". That is a computed
// value, and no amount of reading CSS settles it: whether a given input gets
// `appearance: none` depends on which selectors match it, under which
// ancestors, in what cascade order. The static inventory can say where every
// checkbox is and which classes could reach it. Only a browser can say what
// each one becomes.
//
// The cases are generated from the inventory rather than written by hand. A
// hand-written list is a list of the checkboxes somebody remembered, which is
// the failure mode that shipped a fix for the boolean cell and left eleven
// families round. Every site the parser found gets measured, including the ones
// nobody would have thought to include.
//
// Each site is rendered the way its call site builds it: inside the plugin
// container, inside the parent class it borrows if it has no class of its own,
// carrying whatever classes it declares. Then the computed values are read.
//
// This produces the "measured today" numbers the checkbox phase cannot start
// without. It asserts nothing — it is an instrument, and the phase's criteria
// are what compare its output to a threshold.

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
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find(existsSync) || process.env.SCREENSHOT_CHROME;

// ───────────────────────────────────────────────────────────────────
// 3. THE TREES TO MEASURE IN
// ───────────────────────────────────────────────────────────────────

// Measure inside the capture fixtures rather than a tree rebuilt from source.
//
// Three attempts were made at reconstructing each checkbox's ancestry by parsing the code, and each
// was approximately wrong: a line window credited a neighbour's class, the parser read the nested
// `attr` literal instead of the element's own, and following receiver variables collided on names
// reused across an eight-thousand-line file. The last of those rendered the table's select-all
// checkbox two ancestors short of the four its rule needs, so the rule never matched, stripping the
// parent changed nothing, and the site read as safe when it had simply been measured wrong.
//
// The fixtures already contain the real ancestry, written out and reviewed, and every screenshot in
// the repository is taken from them. Reading the chain off a rendered DOM is exact where inferring
// it from source was not.
//
// What this is NOT: the running app. These are a faithful reproduction, and the live probe remains
// the instrument that decides whether the reproduction is faithful.

const scenarios = SCENARIOS.filter((s) => typeof s.html === "function");

if (!CHROME) {
  console.error("checkbox-appearance: no Chrome found. Set SCREENSHOT_CHROME.");
  process.exit(2);
}

// ───────────────────────────────────────────────────────────────────
// 4. MEASURE
// ───────────────────────────────────────────────────────────────────

const browser = await chromium.launch({ executablePath: CHROME });
// Without reducedMotion, a checked checkbox read during its 120ms transition reports a background
// that is almost transparent — which looks exactly like a control that never got its style.
//
// TWO pages, because pointer type changes the answer and this measured only one of them.
//
// The stylesheet raises every checkbox to a 28px minimum under `@media (pointer: coarse)`, and
// `min-width` beats `width` — so a phone checkbox is 28x28 where a desktop one is 16x16. Measuring
// every fixture on a single fine-pointer page reported 16x16 for `list-mobile`, which is a surface
// no phone renders, and made the 28px floor invisible to the one instrument that exists to see it.
//
// It also explains a contradiction that had been recorded as unresolved: the switch measured
// 34x18 here and 34x28 in the roadmap. Same control, two pointer modes, both readings correct.
const desktopPage = await browser.newPage({ viewport: { width: 1200, height: 900 }, reducedMotion: "reduce" });
const touchPage = await browser.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
  hasTouch: true,
  isMobile: true,
});
/** A fixture named for the phone is measured as the phone. */
const pageFor = (scenarioId) => (/mobile|phone/i.test(scenarioId) ? touchPage : desktopPage);
const styles = readFileSync(join(REPO, "styles.css"), "utf8");
const theme = readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8");
const runtime = readFileSync(join(REPO, "tools/screenshots/runtime-vars.css"), "utf8");

const rows = [];
for (const scenario of scenarios) {
  let html;
  try {
    html = scenario.html();
  } catch {
    // A fixture that cannot render is a gap in coverage, not a checkbox result. Record it as such.
    rows.push({ scenario: scenario.id, error: "fixture did not render" });
    continue;
  }
  const page = pageFor(scenario.id);
  await page.setContent(`<body><div id="shot">${html}</div></body>`);
  await page.addStyleTag({ content: styles });
  await page.addStyleTag({ content: theme });
  await page.addStyleTag({ content: runtime });

  const found = await page.evaluate((scenarioId) => {
    const read = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        appearance: style.appearance || style.webkitAppearance || "",
        radius: style.borderRadius,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
      };
    };

    /** The chain as the browser has it — no inference, and therefore no chance of being short. */
    const chainOf = (el) => {
      const out = [];
      for (let node = el.parentElement; node && node.id !== "shot"; node = node.parentElement) {
        if (node.className && typeof node.className === "string") out.unshift(node.className.trim());
      }
      return out;
    };

    return Array.from(document.querySelectorAll('input[type="checkbox"]')).map((input, index) => {
      const before = read(input);

      // The two-sided control, on the real chain — but asking two different questions, because
      // conflating them once reported a correct fix as still broken.
      //
      // `appearanceOwnedBy` is the defect: an ancestor whose removal makes the checkbox fall back to
      // the platform box. That is the fragility this phase exists to remove.
      //
      // `tokensFrom` is not a defect. Design tokens are declared on a root and inherit, so a
      // checkbox lifted out of every plugin ancestor loses its radius by design — and regains it
      // when the surface it is mounted in is marked as a token root. Reporting that as
      // ancestor-styling condemns the intended architecture.
      let appearanceOwnedBy = null;
      let tokensFrom = null;
      for (let node = input.parentElement; node && node.id !== "shot"; node = node.parentElement) {
        const saved = node.className;
        if (!saved) continue;
        node.className = "";
        const after = read(input);
        node.className = saved;
        if (!appearanceOwnedBy && after.appearance !== before.appearance) appearanceOwnedBy = saved;
        if (!tokensFrom && (after.radius !== before.radius || after.width !== before.width ||
            after.height !== before.height)) tokensFrom = saved;
      }

      return {
        scenario: scenarioId,
        index,
        classes: (input.className || "").split(/\s+/).filter(Boolean),
        chain: chainOf(input),
        measured: before,
        appearanceOwnedBy,
        tokensFrom,
      };
    });
  }, scenario.id);

  rows.push(...found);
}

// ───────────────────────────────────────────────────────────────────
// 5. REPORT
// ───────────────────────────────────────────────────────────────────

const boxes = rows.filter((r) => r.measured);
const owned = boxes.filter((r) => r.measured.appearance === "none");
const platform = boxes.filter((r) => r.measured.appearance !== "none");
const ancestorOwned = owned.filter((r) => r.appearanceOwnedBy);
const selfOwned = owned.filter((r) => !r.appearanceOwnedBy);
const tokenDependent = owned.filter((r) => r.tokensFrom);

const shapes = new Map();
for (const r of owned) {
  const key = `${r.measured.width}x${r.measured.height} r=${r.measured.radius}`;
  shapes.set(key, (shapes.get(key) || 0) + 1);
}

console.log(`checkbox-appearance: ${boxes.length} checkboxes across ${scenarios.length} fixtures\n`);
console.log(`  own their appearance                   ${owned.length}/${boxes.length}`);
console.log(`    lose it if an ancestor class goes    ${ancestorOwned.length}`);
console.log(`    keep it wherever they are mounted    ${selfOwned.length}`);
console.log(`  fall back to the platform box          ${platform.length}/${boxes.length}`);
console.log(`  take geometry from a token root        ${tokenDependent.length}  (by design — a`);
console.log(`                                          portalled surface marked .db-surface keeps it)\n`);
console.log("  shapes among the owned:");
for (const [shape, count] of [...shapes].sort((a, b) => b[1] - a[1])) {
  console.log(`    ${shape.padEnd(28)} ${count}`);
}
console.log("");

if (platform.length) {
  console.log("PLATFORM BOX — round on iOS:");
  for (const r of platform) {
    console.log(`  ${r.scenario.padEnd(24)} .${r.classes.join(".") || "(classless)"}`);
    console.log(`    in: ${r.chain.join(" > ") || "(no classed ancestor)"}`);
  }
  console.log("");
}
if (ancestorOwned.length) {
  console.log("APPEARANCE OWNED BY AN ANCESTOR — reverts to the platform box if that class goes:");
  for (const r of ancestorOwned) {
    console.log(`  ${r.scenario.padEnd(24)} .${r.classes.join(".") || "(classless)"}  <- .${r.appearanceOwnedBy}`);
  }
  console.log("");
}

// ───────────────────────────────────────────────────────────────────
// STATES: does each one look different, per family
// ───────────────────────────────────────────────────────────────────
//
// Everything above measures a checkbox at rest. A box that owns its appearance, clears the touch
// floor and shares a shape with its family can still be indistinguishable once it is checked — and
// a control whose states look the same is a control that reports nothing, which no capture catches
// because a capture shows one state at a time.
//
// One representative per SHAPE, not per scenario. The shape is what the family shares, so a state
// difference established on one 16x16 box holds for the other 139; running all 223 would report the
// same four answers 223 times and hide which four they were.
//
// The signature is deliberately wide — background, border, image, shadow, opacity — because a state
// may be drawn any of those ways and this asks whether it is drawn AT ALL, not how. `indeterminate`
// is compared against checked as well as against rest: a build that drew them identically would
// satisfy "differs from rest" twice while showing the reader one thing for two states.
const stateFamilies = new Map();
for (const r of owned) {
  const key = `${r.measured.width}x${r.measured.height} r=${r.measured.radius}`;
  if (!stateFamilies.has(key)) stateFamilies.set(key, r);
}

const statePage = await browser.newPage({ viewport: { width: 1200, height: 900 }, reducedMotion: "reduce" });
// The theme class matters here and nowhere above: the resting measurements read `appearance`,
// radius and size, none of which touch a host variable, while every state rule is written in terms
// of `--interactive-accent`. On a page with no theme root those resolve to nothing, every state
// computes the resting value, and this pass reports four families with no visible states — a
// harness gap wearing the costume of the exact defect it was built to find.
await statePage.setContent('<html class="theme-light"><body class="theme-light"><div id="shot"></div></body></html>');
for (const content of [styles, theme, runtime]) await statePage.addStyleTag({ content });
// Transitions off, and this is not tidiness. The switch declares
// `transition: background-color 0.15s, border-color 0.15s`, so a signature read in the same tick as
// `checked = true` reports the RESTING colours — and the pass then says a switch has no checked
// state at all. It said exactly that, and the claim survived a theme root, a `:checked` match and a
// pseudo-element read before the transition turned out to be the cause. The other three families
// change `background-image` instead, which has no transition, which is why only one family lied.
//
// Reading the settled value is the right answer rather than waiting 150ms per state: what a reader
// sees is where the state lands, not the frames on the way.
await statePage.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });

const stateResults = await statePage.evaluate((families) => {
  const host = document.getElementById("shot");
  const signature = (el) => {
    const s = getComputedStyle(el);
    return [s.backgroundColor, s.borderColor, s.backgroundImage, s.boxShadow, s.opacity].join(" | ");
  };
  return families.map((family) => {
    const wrap = document.createElement("div");
    wrap.className = family.chainClass;
    host.appendChild(wrap);
    const box = document.createElement("input");
    box.type = "checkbox";
    box.className = family.classes.join(" ");
    wrap.appendChild(box);
    const rest = signature(box);
    box.checked = true;
    const checked = signature(box);
    box.checked = false;
    box.indeterminate = true;
    const indeterminate = signature(box);
    box.indeterminate = false;
    box.disabled = true;
    const disabled = signature(box);
    box.disabled = false;
    box.focus();
    const focused = signature(box);
    box.blur();
    wrap.remove();
    return {
      shape: family.shape,
      classes: family.classes,
      checkedDiffers: checked !== rest,
      indeterminateDiffers: indeterminate !== rest && indeterminate !== checked,
      disabledDiffers: disabled !== rest,
      focusDiffers: focused !== rest,
      rest,
    };
  });
}, [...stateFamilies].map(([shape, r]) => ({
  shape,
  classes: r.classes,
  chainClass: r.chain[r.chain.length - 1] || "note-database-container",
})));
await statePage.close();
await browser.close();

/**
 * A switch has no indeterminate state, and that is a fact about the control rather than a gap.
 *
 * Declared the way the touch-target census declares its exempt controls: named, with the reason,
 * rather than filtered out by a predicate wide enough to hide the next real one. `indeterminate` is
 * a checkbox's third value; a toggle is binary by construction and drawing a third state on it would
 * be inventing an affordance nothing sets.
 */
const NO_INDETERMINATE = ["db-toggle-switch"];
const exemptFromIndeterminate = (r) => r.classes.some((c) => NO_INDETERMINATE.includes(c));

const stateFailures = stateResults.filter((r) =>
  !r.checkedDiffers || !r.disabledDiffers || !r.focusDiffers
  || (!r.indeterminateDiffers && !exemptFromIndeterminate(r)));

console.log(`  states, one representative per shape (${stateResults.length} families):`);
for (const r of stateResults) {
  const mark = (ok) => (ok ? "yes" : "NO ");
  console.log(`    ${r.shape.padEnd(28)} checked ${mark(r.checkedDiffers)}`
    + `  indeterminate ${exemptFromIndeterminate(r) ? "n/a" : mark(r.indeterminateDiffers)}`
    + `  disabled ${mark(r.disabledDiffers)}`
    + `  focus ${mark(r.focusDiffers)}`);
}
if (stateFailures.length) {
  console.log("  A STATE THAT LOOKS LIKE ANOTHER STATE reports nothing to the reader, and no capture");
  console.log("  catches it, because a capture shows one state at a time.\n");
}
console.log("");

stamp("tools/live/checkbox-appearance.json", {
  totals: {
    checkboxes: boxes.length,
    fixtures: scenarios.length,
    owned: owned.length,
    appearanceOwnedByAncestor: ancestorOwned.length,
    appearanceSelfOwned: selfOwned.length,
    tokenDependent: tokenDependent.length,
    platformBox: platform.length,
    distinctShapes: shapes.size,
    stateFamilies: stateResults.length,
    stateFailures: stateFailures.length,
  },
  shapes: Object.fromEntries(shapes),
  states: stateResults,
  rows,
}, ["styles.css", "tools/live/checkbox-appearance.mjs", "tools/screenshots/scenarios.mjs"]);
