#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    capture
// COMPONENT: headless-Chrome screenshot capture — renders each scenario, writes PNGs + manifest + README
// ───────────────────────────────────────────────────────────────────

/**
 * Captures one PNG per scenario per theme into screenshots/.
 *
 * Drives the system Chrome through playwright-core rather than a bundled browser, so the
 * repo does not carry a ~150MB download for a capture step. That trades reproducibility
 * across machines for install weight: a different Chrome version can shift antialiasing by
 * a pixel, which is why the freshness check compares manifest entries and not image bytes.
 *
 * Usage: node tools/screenshots/capture.mjs [--only <id>] [--theme dark|light|both]
 */

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SCENARIOS } from "./scenarios.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. CONFIGURATION
// ───────────────────────────────────────────────────────────────────

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..", "..");
const OUT = join(REPO, "screenshots");
const TMP = join(HERE, ".tmp");

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      "No Chrome/Chromium found. Set SCREENSHOT_CHROME to a browser executable, or install Chrome."
    );
  }
  return found;
}

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

/* Obsidian marks phone layouts with `is-phone` on the body, and a large part of the
   plugin's responsive CSS keys off it. Without the class a narrow viewport is just a
   cramped desktop, so the mobile capture would not show the mobile design at all. */
const DEVICES = [
  { id: "desktop", width: 1440, height: 900, bodyClass: "" },
  { id: "mobile", width: 402, height: 874, bodyClass: "is-phone" },
];

/* A full view is documented inside a device frame; a component is documented on its own,
   sized to itself on a transparent ground so it can sit on any background. Scenarios may
   override with an explicit `capture` field. */
function captureMode(scenario) {
  return scenario.capture || (scenario.group === "views" ? "viewport" : "element");
}

function buildPage(scenario, theme, styles, themeCss, runtimeCss, device) {
  // captureCss lands after the plugin stylesheet so a scenario can undo the parts of a
  // rule that only make sense against a live anchor — an overlay positioned absolutely
  // against a toolbar contributes no height here and would photograph as an empty box.
  // It must never restyle what is being photographed, only make it visible.
  const overrides = scenario.captureCss ? `<style>${scenario.captureCss}</style>` : "";
  return `<!doctype html>
<html class="${[theme === "dark" ? "theme-dark" : "theme-light", captureMode(scenario) === "element" ? "capture-element" : ""].filter(Boolean).join(" ")}">
<head><meta charset="utf-8">
<style>${themeCss}</style>
<style>${styles}</style>
<style>${runtimeCss}</style>
${overrides}
</head>
<body class="${device.bodyClass}"><div id="shot">${scenario.html()}</div></body></html>`;
}

// ───────────────────────────────────────────────────────────────────
// 4. MAIN
// ───────────────────────────────────────────────────────────────────

async function main() {
  const only = arg("--only", null);
  const themeArg = arg("--theme", "both");
  const themes = themeArg === "both" ? ["dark", "light"] : [themeArg];
  const deviceArg = arg("--device", "both");
  const devices = deviceArg === "both" ? DEVICES : DEVICES.filter((d) => d.id === deviceArg);
  if (!devices.length) {
    console.error(`No device matched --device ${deviceArg} (expected desktop or mobile)`);
    process.exit(1);
  }
  const list = only ? SCENARIOS.filter((s) => s.id === only) : SCENARIOS;
  if (!list.length) {
    console.error(`No scenario matched --only ${only}`);
    process.exit(1);
  }

  // Fingerprint every file a scenario depicts. The freshness check compares these against
  // the working tree, which is what lets a code change flag its own screenshots as stale.
  const fingerprint = (rel) => {
    const abs = join(REPO, rel);
    if (!existsSync(abs)) return null;
    return createHash("sha256").update(readFileSync(abs)).digest("hex").slice(0, 12);
  };

  const styles = readFileSync(join(REPO, "styles.css"), "utf8");
  const themeCss = readFileSync(join(HERE, "theme.css"), "utf8");
  const runtimeCss = readFileSync(join(HERE, "runtime-vars.css"), "utf8");
  const stylesHash = createHash("sha256").update(styles).digest("hex").slice(0, 12);

  mkdirSync(OUT, { recursive: true });
  mkdirSync(TMP, { recursive: true });

  const browser = await chromium.launch({ executablePath: findChrome() });
  const manifest = [];
  const failures = [];
  let count = 0;

  try {
    for (const scenario of list) {
      for (const device of devices) {
      for (const theme of themes) {
        const page = await browser.newPage({
          viewport: { width: device.width, height: device.height },
          deviceScaleFactor: 2,
          isMobile: device.id === "mobile",
          hasTouch: device.id === "mobile",
        });
        const html = buildPage(scenario, theme, styles, themeCss, runtimeCss, device);
        const tmpFile = join(TMP, `${scenario.id}-${device.id}-${theme}.html`);
        writeFileSync(tmpFile, html, "utf8");
        await page.goto(pathToFileURL(tmpFile).href, { waitUntil: "load" });

        const target = await page.$("#shot");

        // Measure before capturing. A fixture that resolves to an absurd size takes the
        // whole browser down with it, which reads as an unexplained crash; measuring first
        // turns that into a number naming the scenario and its dimensions.
        const box = await target.boundingBox();
        const LIMIT = 12000;
        if (!box || box.width > LIMIT || box.height > LIMIT) {
          const size = box ? `${Math.round(box.width)}x${Math.round(box.height)}` : "unmeasurable";
          failures.push(`${scenario.group}/${scenario.id}-${device.id}-${theme}.png: refused, renders ${size}px (limit ${LIMIT})`);
          console.log(`  OVERSIZE ${scenario.id}-${device.id}-${theme}: ${size}px`);
          await page.close();
          continue;
        }
        const rel = `${scenario.group}/${scenario.id}-${device.id}-${theme}.png`;
        const dest = join(OUT, rel);
        mkdirSync(dirname(dest), { recursive: true });
        try {
          // A scenario whose markup never settles - a running animation, a zero-size box -
          // would otherwise wait forever and take the whole run down with it, leaving the
          // manifest unwritten and every later surface unphotographed. Bound it, record the
          // failure, and keep going so one bad fixture costs one screenshot.
          // Capture the viewport, not the element. An element shot grows to its own content,
          // so a wide table photographed on a phone viewport comes back full desktop width
          // and the responsive layout never appears. A viewport shot is exactly the device
          // frame the surface would occupy, and content wider than it scrolls as it would.
          if (captureMode(scenario) === "element") {
            await target.screenshot({
              path: dest, timeout: 15000, animations: "disabled", omitBackground: true,
            });
          } else {
            await page.screenshot({ path: dest, timeout: 15000, animations: "disabled" });
          }
        } catch (err) {
          failures.push(`${rel}: ${err.message.split("\n")[0]}`);
          console.log(`  FAILED ${rel}`);
          await page.close();
          continue;
        }

        const bytes = readFileSync(dest);
        manifest.push({
          id: scenario.id,
          title: scenario.title,
          group: scenario.group,
          theme,
          device: device.id,
          file: `screenshots/${rel}`,
          sources: scenario.sources,
          sourceHashes: Object.fromEntries(
            [...scenario.sources, "styles.css"].map((s) => [s, fingerprint(s)])
          ),
          note: scenario.note || null,
          capture: captureMode(scenario),
          bytes: bytes.length,
        });
        count += 1;
        console.log(`  captured ${rel} (${bytes.length} bytes)`);
        await page.close();
      }
      }
    }
  } finally {
    await browser.close();
    rmSync(TMP, { recursive: true, force: true });
  }

  // Only rewrite the manifest on a full run; a --only run would otherwise drop every
  // scenario it did not capture and make the freshness check read as complete.
  if (!only && themeArg === "both" && deviceArg === "both") {
    const payload = {
      generatedFrom: { stylesheet: `styles.css@${stylesHash}` },
      scenarios: manifest.sort((a, b) => a.file.localeCompare(b.file)),
    };
    writeFileSync(join(OUT, "manifest.json"), JSON.stringify(payload, null, 2) + "\n", "utf8");
    console.log(`  manifest updated: ${manifest.length} entries`);

    // The index is generated rather than hand-written so it cannot fall behind the manifest.
    const byGroup = new Map();
    for (const e of manifest) {
      if (!byGroup.has(e.group)) byGroup.set(e.group, new Map());
      const g = byGroup.get(e.group);
      if (!g.has(e.id)) g.set(e.id, { title: e.title, note: e.note, sources: e.sources, shots: {} });
      g.get(e.id).shots[e.theme] = e.file.replace(/^screenshots\//, "");
    }
    const lines = [
      "# Screenshots",
      "",
      "Generated by `npm run screenshots`. Do not edit by hand — this file and every image",
      "below are rewritten on each capture.",
      "",
      "Each shot renders the shipped `styles.css` against mock data in headless Chrome, so it",
      "shows what the stylesheet produces rather than a live vault. `npm run screenshots:verify`",
      "fails when a source file listed under a shot has changed since it was captured.",
      "",
    ];
    for (const [group, items] of [...byGroup.entries()].sort()) {
      lines.push(`## ${group}`, "");
      for (const [id, info] of [...items.entries()].sort()) {
        lines.push(`### ${info.title}`, "");
        if (info.note) lines.push(info.note, "");
        lines.push("| dark | light |", "|---|---|",
          `| ![${id} dark](${info.shots.dark || ""}) | ![${id} light](${info.shots.light || ""}) |`, "");
        lines.push(`Sources: ${info.sources.map((s) => "`" + s + "`").join(", ")}`, "");
      }
    }
    writeFileSync(join(OUT, "README.md"), lines.join("\n"), "utf8");
    console.log("  index written: screenshots/README.md");
  } else {
    console.log("  partial run: manifest left unchanged");
  }
  if (failures.length) {
    console.log(`  ${failures.length} capture(s) FAILED:`);
    for (const f of failures) console.log(`    ${f}`);
  }
  console.log(`  done: ${count} screenshots`);
  if (failures.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
