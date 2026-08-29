// ───────────────────────────────────────────────────────────────────
// MODULE:    token-census
// COMPONENT: measures what a surface looks like at each mount point
// ───────────────────────────────────────────────────────────────────
//
// Design tokens are declared on a fixed list of selectors. A surface mounted
// inside one of them inherits the whole scale; a surface mounted on the body
// inherits none of it and silently falls back to whatever the browser and the
// host theme supply. Menus mount on the body.
//
// This measures the gap directly: every overlay class the stylesheet mentions
// is rendered twice, once inside the plugin container and once on the body, and
// the computed values are compared. It records the number a later phase has to
// move, which is the only kind of number worth asserting against.
//
// It runs in a real browser against the shipped stylesheet, because the whole
// point is that the cascade decides the answer and no static reading of the
// file can predict it.
//
// Usage: node tools/live/token-census.mjs [--json]

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync } from "node:fs";
import { stamp } from "./evidence.mjs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const OUT = join(REPO, "tools/live/token-census.json");

const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find(existsSync) || process.env.SCREENSHOT_CHROME;

/** The properties a surface visibly loses when the token scale does not reach it. */
const PROPS = ["borderRadius", "padding", "fontSize", "boxShadow", "backgroundColor", "color"];

// ───────────────────────────────────────────────────────────────────
// 3. INPUT
// ───────────────────────────────────────────────────────────────────

const css = readFileSync(join(REPO, "styles.css"), "utf8");

/** Every overlay-shaped class the stylesheet mentions — the population, not a sample. */
const classes = [...new Set(
  (css.match(/\.db-[a-z0-9-]*(?:popover|dropdown|panel|menu|picker|sheet)\b/g) || [])
    .map((c) => c.slice(1)),
)].sort();

/**
 * The selectors that declare the token scale, read from the file rather than assumed.
 *
 * Taking everything before the first brace also swallows the file header, which reported fifteen
 * roots where there are nine. A wrong number in a baseline report is precisely the failure this
 * census exists to catch, so the rule is anchored on the declaration it actually contains.
 */
const tokenRoots = (() => {
  const match = css.match(/((?:^\s*\.[a-z0-9-]+,\s*\n)+\s*\.[a-z0-9-]+\s*\{[^}]*--db-space-1)/m);
  if (!match) return [];
  return match[1]
    .slice(0, match[1].indexOf("{"))
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("."));
})();

// ───────────────────────────────────────────────────────────────────
// 4. MEASURE
// ───────────────────────────────────────────────────────────────────

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.setContent(
  '<!doctype html><html><head><meta name="viewport" content="width=device-width">'
  + '</head><body><div class="note-database-container" id="host"></div></body></html>',
);
await page.addStyleTag({ content: css });

const rows = await page.evaluate(({ classes, props }) => {
  const host = document.getElementById("host");
  const read = (parent, cls) => {
    const el = document.createElement("div");
    el.className = cls;
    parent.appendChild(el);
    const cs = getComputedStyle(el);
    const out = {};
    for (const p of props) out[p] = cs[p];
    out.__radiusToken = cs.getPropertyValue("--db-radius-lg").trim();
    out.__spaceToken = cs.getPropertyValue("--db-space-4").trim();
    el.remove();
    return out;
  };

  return classes.map((cls) => {
    const inside = read(host, cls);
    const onBody = read(document.body, cls);
    // What the class computes once it also carries the surface marker — the state a migrated
    // call site reaches. Recording it beside the other two is what makes the delta legible.
    const marked = read(document.body, `db-surface ${cls}`);
    const differing = props.filter((p) => inside[p] !== onBody[p]);
    return {
      cls,
      differing,
      tokensInside: Boolean(inside.__radiusToken),
      tokensOnBody: Boolean(onBody.__radiusToken),
      tokensWhenMarked: Boolean(marked.__radiusToken),
      inside: { radius: inside.borderRadius, font: inside.fontSize, token: inside.__radiusToken },
      onBody: { radius: onBody.borderRadius, font: onBody.fontSize, token: onBody.__radiusToken },
      marked: { radius: marked.borderRadius, font: marked.fontSize, token: marked.__radiusToken },
    };
  });
}, { classes, props: PROPS });

await browser.close();

// ───────────────────────────────────────────────────────────────────
// 5. REPORT
// ───────────────────────────────────────────────────────────────────

const differ = rows.filter((r) => r.differing.length > 0);
const tokenless = rows.filter((r) => !r.tokensOnBody);
const inRoot = new Set(tokenRoots.map((s) => s.replace(/^\./, "")));
const bodyMountedMissing = rows.filter((r) => !inRoot.has(r.cls) && !r.tokensOnBody);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ tokenRoots, rows }, null, 2));
} else {
  console.log(`token census — ${rows.length} overlay classes, measured in a real browser\n`);
  console.log(`  token-root selectors           ${tokenRoots.length}`);
  console.log(`  compute differently on body    ${differ.length}/${rows.length}`);
  console.log(`  carry NO tokens on body        ${tokenless.length}/${rows.length}`);
  console.log(`  not in the root, tokenless     ${bodyMountedMissing.length}`);
  console.log(`  regain tokens when marked      ${rows.filter((r) => !r.tokensOnBody && r.tokensWhenMarked).length}/${tokenless.length}`);
  console.log(`  STILL wrong when marked        ${rows.filter((r) => r.tokensWhenMarked && r.marked.radius !== r.inside.radius).length} (the rule is ancestor-scoped, not a token problem)\n`);
  console.log("  worst offenders (radius inside -> on body):");
  for (const r of differ.filter((x) => x.inside.radius !== x.onBody.radius).slice(0, 8)) {
    console.log(`    ${r.cls.padEnd(34)} ${r.inside.radius} -> ${r.onBody.radius}`);
  }
}

// Stamped with the fingerprints of what it was measured from. A later phase editing the stylesheet
// falsifies these numbers, and a stale census is worse than none: it looks like evidence.
stamp("tools/live/token-census.json", {
  tokenRoots,
  totals: {
    classes: rows.length,
    differOnBody: differ.length,
    tokenlessOnBody: tokenless.length,
  },
  rows,
}, ["styles.css", "tools/live/token-census.mjs"]);
console.log(`\nrecorded: ${OUT.replace(REPO + "/", "")}`);
