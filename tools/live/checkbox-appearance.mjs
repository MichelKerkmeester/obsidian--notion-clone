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

const INVENTORY = join(REPO, "tools/live/checkbox-inventory.json");

// ───────────────────────────────────────────────────────────────────
// 3. CASES
// ───────────────────────────────────────────────────────────────────

if (!existsSync(INVENTORY)) {
  console.error("checkbox-appearance: no inventory. Run tools/live/checkbox-inventory.mjs first.");
  process.exit(2);
}

const inventory = JSON.parse(readFileSync(INVENTORY, "utf8"));

/**
 * One case per creation site.
 *
 * `wrapper` is the class the input is styled through when it declares none of its own. Rendering it
 * is the difference between measuring the checkbox as it ships and measuring a bare input — and the
 * bare input would compute the platform default for every site, reporting uniform breakage that
 * tells nobody anything.
 */
const cases = inventory.sites.map((site) => ({
  id: `${site.file.replace(/^src\/views\//, "")}:${site.line}`,
  classes: site.classes,
  wrapper: site.classes.length === 0 ? site.borrowed?.cls ?? null : null,
}));

// The modal root is a second token root in this codebase, and two of the four rules that remove the
// native appearance live under it rather than under the container. Measuring everything under one
// root would report those as broken when they are merely elsewhere.
const ROOTS = [
  { id: "container", cls: "note-database-container" },
  { id: "modal", cls: "note-database-modal" },
  { id: "body", cls: null },
];

// ───────────────────────────────────────────────────────────────────
// 4. MEASURE
// ───────────────────────────────────────────────────────────────────

if (!CHROME) {
  console.error("checkbox-appearance: no Chrome found. Set SCREENSHOT_CHROME.");
  process.exit(2);
}

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.setContent("<body></body>");
await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });

const rows = await page.evaluate(
  ({ cases, roots }) => {
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

    const out = [];
    for (const c of cases) {
      const measured = {};
      for (const root of roots) {
        const host = document.createElement("div");
        if (root.cls) host.className = root.cls;
        document.body.appendChild(host);

        let parent = host;
        if (c.wrapper) {
          const wrap = document.createElement("div");
          wrap.className = c.wrapper;
          host.appendChild(wrap);
          parent = wrap;
        }
        const input = document.createElement("input");
        input.type = "checkbox";
        if (c.classes.length) input.className = c.classes.join(" ");
        parent.appendChild(input);

        measured[root.id] = read(input);
        host.remove();
      }
      out.push({ ...c, measured });
    }
    return out;
  },
  { cases, roots: ROOTS }
);

await browser.close();

// ───────────────────────────────────────────────────────────────────
// 5. REPORT
// ───────────────────────────────────────────────────────────────────

const owned = (row, root) => row.measured[root].appearance === "none";
const ownedAnywhere = rows.filter((r) => ROOTS.some((root) => owned(r, root.id)));
const ownedInContainer = rows.filter((r) => owned(r, "container"));
const platformBox = rows.filter((r) => !ROOTS.some((root) => owned(r, root.id)));

const radii = new Set();
const sizes = new Set();
for (const r of ownedAnywhere) {
  const root = ROOTS.find((x) => owned(r, x.id)).id;
  radii.add(r.measured[root].radius);
  sizes.add(`${r.measured[root].width}x${r.measured[root].height}`);
}

console.log(`checkbox-appearance: ${rows.length} sites measured at ${ROOTS.length} mount points\n`);
console.log(`  compute appearance:none somewhere      ${ownedAnywhere.length}/${rows.length}`);
console.log(`  compute appearance:none in container   ${ownedInContainer.length}/${rows.length}`);
console.log(`  fall back to the platform box          ${platformBox.length}/${rows.length}`);
console.log(`  distinct radii among the owned         ${radii.size}  [${[...radii].join(", ")}]`);
console.log(`  distinct box sizes among the owned     ${sizes.size}  [${[...sizes].join(", ")}]\n`);

if (platformBox.length) {
  console.log("PLATFORM BOX — round on iOS, at every mount point tried:");
  for (const r of platformBox) {
    const m = r.measured.container;
    console.log(`  ${r.id.padEnd(46)} ${m.width}x${m.height} r=${m.radius} .${r.classes.join(".") || "(classless)"}`);
  }
  console.log("");
}

// A site whose appearance depends on where it is mounted is the ancestor-scoped defect, measured.
const mountDependent = rows.filter(
  (r) => new Set(ROOTS.map((root) => r.measured[root.id].appearance)).size > 1
);
console.log(`  appearance changes with mount point     ${mountDependent.length}/${rows.length}`);
console.log("  (a checkbox whose look depends on where it sits is styled through an ancestor)\n");

stamp("tools/live/checkbox-appearance.json", {
  roots: ROOTS.map((r) => r.id),
  totals: {
    sites: rows.length,
    ownedAnywhere: ownedAnywhere.length,
    ownedInContainer: ownedInContainer.length,
    platformBox: platformBox.length,
    distinctRadii: radii.size,
    distinctSizes: sizes.size,
    mountDependent: mountDependent.length,
  },
  rows,
}, ["styles.css", "tools/live/checkbox-appearance.mjs", "tools/live/checkbox-inventory.json"]);
