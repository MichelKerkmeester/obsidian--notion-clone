#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    unstyled-links
// COMPONENT: catches a capture painting the browser's default link blue
// ───────────────────────────────────────────────────────────────────
//
// A capture reviewer reported the file-field links rendering at #0000EE on a dark row — 1.78:1, and
// unreadable. The plugin does style them: `color: var(--link-color)`. What it does not do is DEFINE
// that token, because `--link-color` is the HOST's, and the capture harness's stand-in stylesheet
// never supplied one. So the declaration resolved to nothing, the user agent's default won, and
// every capture of that surface showed a colour no reader will ever see.
//
// That is the same shape the pinned-values scanner exists for, arriving from the opposite side: not
// a harness value contradicting production, but a harness SILENCE letting the browser answer. Both
// produce a picture of a surface the plugin does not render.
//
// So: render every scenario, find every element whose colour is a user-agent default, and name it.
// The defaults are few and specific — link blue, visited purple, and the active red — which is what
// makes this decidable rather than a taste question.
//
// Exit 0 when nothing paints a UA default, 1 with the list, 2 when the scan rendered nothing.

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

/** Chrome's own link colours. Nothing in a themed plugin should ever resolve to one of these. */
const UA_DEFAULTS = new Map([
  ["rgb(0, 0, 238)", "the user agent's unvisited link blue"],
  ["rgb(85, 26, 139)", "the user agent's visited link purple"],
  ["rgb(255, 0, 0)", "the user agent's active link red"],
]);

// ───────────────────────────────────────────────────────────────────
// 3. MEASURE
// ───────────────────────────────────────────────────────────────────

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  for (const candidate of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ]) if (existsSync(candidate)) return candidate;
  throw new Error("unstyled-links: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });

const styles = readFileSync(join(REPO, "styles.css"), "utf8");
const theme = readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8");
const runtime = readFileSync(join(REPO, "tools/screenshots/runtime-vars.css"), "utf8");

const findings = [];
let scenariosRendered = 0;
let elementsSeen = 0;

for (const scenario of SCENARIOS) {
  let html;
  try {
    html = scenario.html();
  } catch {
    continue;
  }
  for (const themeClass of ["theme-dark", "theme-light"]) {
    await page.setContent(`<body class="${themeClass}"><div id="shot">${html}</div></body>`);
    for (const content of [styles, theme, runtime]) await page.addStyleTag({ content });
    const found = await page.evaluate(({ id, themeName, defaults }) => {
      const rows = [];
      let seen = 0;
      for (const el of document.querySelectorAll("a, [href], .internal-link")) {
        const box = el.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        seen += 1;
        const colour = getComputedStyle(el).color;
        const why = defaults[colour];
        if (!why) continue;
        rows.push({
          scenario: id,
          theme: themeName,
          colour,
          why,
          cls: String(el.className).slice(0, 60) || el.tagName.toLowerCase(),
          text: (el.textContent || "").trim().slice(0, 24),
        });
      }
      return { rows, seen };
    }, { id: scenario.id, themeName: themeClass, defaults: Object.fromEntries(UA_DEFAULTS) });
    elementsSeen += found.seen;
    findings.push(...found.rows);
  }
  scenariosRendered += 1;
}

await browser.close();

// ───────────────────────────────────────────────────────────────────
// 4. VERDICT
// ───────────────────────────────────────────────────────────────────

if (scenariosRendered === 0 || elementsSeen === 0) {
  console.error("unstyled-links: rendered no link to inspect, which is not the same as clean.");
  console.error(`  scenarios=${scenariosRendered} links=${elementsSeen}`);
  process.exit(2);
}

console.log(`unstyled-links: ${elementsSeen} link(s) across ${scenariosRendered} scenario(s), both themes`);

if (findings.length > 0) {
  console.error(`\nunstyled-links: FAIL — ${findings.length} element(s) painted a user-agent default\n`);
  for (const f of findings.slice(0, 12)) {
    console.error(`  ${f.scenario} (${f.theme})  .${f.cls}  "${f.text}"`);
    console.error(`    ${f.colour} — ${f.why}`);
  }
  if (findings.length > 12) console.error(`  ...and ${findings.length - 12} more`);
  console.error("\n  A declaration reading a HOST token the harness never defines resolves to nothing,");
  console.error("  and the browser answers instead. The capture then shows a colour no reader sees.");
  process.exit(1);
}

stamp("tools/live/unstyled-links.json", {
  links: elementsSeen,
  scenarios: scenariosRendered,
}, ["styles.css", "tools/screenshots/theme.css", "tools/live/unstyled-links.mjs"]);
console.log("unstyled-links: PASS — nothing resolves to a user-agent link colour");
console.log("  what this does not prove: a colour the harness supplies is the colour the host does.");
console.log("  This catches silence, not disagreement — the pinned-values scan is the other half.");
process.exit(0);
