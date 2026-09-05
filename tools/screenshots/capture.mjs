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
import {
  CONSTRUCTED_SCENARIOS,
  disposeConstructedBundle,
  prepareConstructedBundle,
  validateConstructedScenario,
} from "./constructed-scenarios.mjs";
import {
  REFERENCE_SCENARIOS,
  disposeReferenceBundle,
  prepareReferenceBundle,
} from "./reference-scenarios.mjs";
import { captureRootFor, validateManifestEntry } from "./manifest-schema.mjs";
import { pixelHash } from "./pixel-hash.mjs";

// This page does not reproduce the workspace leaf, and unlike the placement harness it does not
// need to. The leaf's `contain: strict` matters to anything positioned against the viewport, and
// only three of these scenarios contain a `position: fixed` element at all: the record-detail
// sheet, the icon picker and the colour picker. Measured inside a contained leaf offset from the
// origin, all three shift by that offset and all three stay painted — and every shot is cropped to
// its subject, so the shift does not reach the image. Adding containment here would rewrite the
// corpus to show the same pictures. If a scenario ever renders a surface whose placement is the
// subject, that stops being true and this page needs the leaf.
//
// Paths are repo-relative because that is what `fingerprint` and the freshness check both expect.
const CAPTURE_INPUTS = [
  "styles.css",
  "tools/screenshots/theme.css",
  "tools/screenshots/runtime-vars.css",
  "tools/screenshots/scenarios.mjs",
  "tools/screenshots/capture.mjs",
];

// ───────────────────────────────────────────────────────────────────
// 2. CONFIGURATION
// ───────────────────────────────────────────────────────────────────

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..", "..");
const OUT = join(REPO, "screenshots");
const TMP = join(HERE, ".tmp");
const LANE_PATH = join(REPO, "tools/lane/css-lane.json");

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
  { id: "mobile", width: 402, height: 874, bodyClass: "is-mobile is-phone" },
];

// The constructed scenarios photograph the shipped renderers, which register their own
// scenarios with an async `mount` instead of `html`; the reference scenarios photograph
// the vendored Project Manager plugin's own views the same way.
const ALL_SCENARIOS = [...SCENARIOS, ...CONSTRUCTED_SCENARIOS, ...REFERENCE_SCENARIOS];

// How many animation frames a constructed capture waits after the renderer signals ready.
// The calendar week/day host scrolls its time grid to the workday one frame after render
// returns (measured: scrollTop moves 0 -> 376 at the bench shape), and a screenshot cannot
// catch that pre-correction frame — the capture command itself runs pending animation frames
// before rasterising. The wait exists for the measurements taken before the screenshot: the
// layout hash must not race the correction, or it nondeterministically describes a layout
// that differs from the pixels. Two frames: one lets the scheduled correction run, one lets
// the corrected frame be painted.
const READY_ANIMATION_FRAMES = 2;

async function waitForConstructedLayout(page) {
  await page.evaluate((frames) => new Promise((resolve) => {
    let remaining = frames;
    const tick = () => {
      if (remaining <= 0) resolve();
      else {
        remaining -= 1;
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }), READY_ANIMATION_FRAMES);
}

/* A full view is documented inside a device frame; a component is documented on its own,
   sized to itself on a transparent ground so it can sit on any background. Scenarios may
   override with an explicit `capture` field. */
function captureMode(scenario) {
  return scenario.capture || (scenario.group === "views" ? "viewport" : "element");
}

// The declared width frames the DESKTOP shot only.
//
// A phone capture exists to show what the phone's own width does to a surface, so a scenario's
// declared width must not reach it. `panel-record-detail` declares 392 against a 402px phone: apply
// it to both and the two captures become the same layout, which is how honouring this field first
// erased a real responsive difference. The parity ratchet caught it as "newly identical", which is
// exactly the reading that rule exists for.
function buildPage(scenario, theme, styles, themeCss, runtimeCss, device) {
  // captureCss lands after the plugin stylesheet so a scenario can undo the parts of a
  // rule that only make sense against a live anchor — an overlay positioned absolutely
  // against a toolbar contributes no height here and would photograph as an empty box.
  // It must never restyle what is being photographed, only make it visible.
  const overrides = scenario.captureCss ? `<style>${scenario.captureCss}</style>` : "";
  // The device reaches the fixture, because some markup is device-dependent in the product and no
  // stylesheet rule carries it. The invalid-events modal toggles two layout classes from a
  // ResizeObserver on its own width; a fixture with no observer can only be told which frame it is
  // being photographed in. Every other fixture ignores the argument.
  return `<!doctype html>
<html class="${[theme === "dark" ? "theme-dark" : "theme-light", captureMode(scenario) === "element" ? "capture-element" : ""].filter(Boolean).join(" ")}" style="--capture-max-width: ${device.width}px${scenario.width && !device.bodyClass ? `; --capture-scenario-width: ${Math.min(scenario.width, device.width)}px` : ""}">
<head><meta charset="utf-8">
<!-- Without this the layout viewport is 980px whatever device is emulated, and the page is then
     zoomed down to fit the frame. Every "mobile" capture ever taken was a desktop layout at 0.41
     scale, and \`@media (max-width: 760px)\` — the only responsive breakpoint this plugin has, and
     where its entire mobile panel behaviour lives — never matched in a single screenshot. The
     is-phone class applied, so class-based rules fired and the images looked plausible. -->
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${themeCss}</style>
<style>${styles}</style>
<style>${runtimeCss}</style>
${overrides}
</head>
<body class="${device.bodyClass}"><div id="shot">${scenario.html(device)}</div></body></html>`;
}

// ───────────────────────────────────────────────────────────────────
// 4. README
// ───────────────────────────────────────────────────────────────────

// The two roots screenshots/ carries beside our own scenario groups: one is a render this repo
// produces from a vendored plugin, the other is a photograph of a third-party app this repo
// never renders. Neither reads as a manifest group the way our own scenarios do — a reference
// entry's own group already surfaces above as "project-manager", and anytype carries no
// manifest entries at all — so a reader who only opens this file would not otherwise know
// anytype exists. Lane coverage is looked up rather than stated per-root here, so a change to
// css-lane.json's `inScopeCaptureRoots` moves this note in the same run instead of drifting
// from it.
const REFERENCE_ROOTS = [
  {
    root: "screenshots/project-manager/",
    kind: "our render",
    detail: "reference renders of the vendored Project Manager plugin, produced by " +
      "`tools/screenshots/reference-scenarios.mjs`",
    index: "indexed above under the `project-manager` group",
  },
  {
    root: "screenshots/anytype/",
    kind: "photograph",
    detail: "photographs of the third-party Anytype app; never produced by this repo",
    index: "its own index at `screenshots/anytype/README.md`",
  },
];

/** Builds the generated README's text from a capture manifest and the css-lane in-scope root
 * list. Pure and Chrome-free, so the README's shape — including the Reference roots section —
 * is testable without a capture run. */
export function buildReadme(manifest, laneInScopeRoots) {
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

  const laneRoots = new Set(laneInScopeRoots || []);
  lines.push("## Reference roots", "");
  lines.push("Two roots under `screenshots/` are not one of the scenario groups above:", "");
  for (const r of REFERENCE_ROOTS) {
    const scoped = laneRoots.has(r.root) ? "in scope" : "not in scope";
    lines.push(
      `- \`${r.root}\` — ${r.kind}. ${r.detail}. Lane scope: ${scoped} ` +
        `(css-lane \`inScopeCaptureRoots\` in \`tools/lane/css-lane.json\`). Index: ${r.index}.`
    );
  }
  lines.push("");

  return lines.join("\n");
}

// ───────────────────────────────────────────────────────────────────
// 5. MAIN
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
  const list = only ? ALL_SCENARIOS.filter((s) => s.id === only) : ALL_SCENARIOS;
  if (!list.length) {
    console.error(`No scenario matched --only ${only}`);
    process.exit(1);
  }

  // A constructed scenario must carry a readiness signal before it is allowed to run at all:
  // without an async mount there is nothing for the capture to wait on, and a screenshot taken
  // before the renderer mounted photographs an empty box while every check stays green.
  for (const scenario of list) {
    if (scenario.mount) validateConstructedScenario(scenario);
  }

  // The constructed scenarios share one esbuild step with the assertion lanes, and the
  // reference scenarios a second one over the vendored views. Each is built here, before
  // any scenario of its kind runs, so a fixture-only run never pays either build and a
  // constructed run never pays the reference's.
  let constructedBundleBuilt = false;
  let referenceBundleBuilt = false;
  if (list.some((scenario) => scenario.mount && scenario.kind !== "reference")) {
    await prepareConstructedBundle();
    constructedBundleBuilt = true;
  }
  if (list.some((scenario) => scenario.kind === "reference")) {
    await prepareReferenceBundle();
    referenceBundleBuilt = true;
  }

  // Fingerprint every file a scenario depicts. The freshness check compares these against
  // the working tree, which is what lets a code change flag its own screenshots as stale.
  const fingerprint = (rel) => {
    const abs = join(REPO, rel);
    if (!existsSync(abs)) return null;
    return createHash("sha256").update(readFileSync(abs)).digest("hex").slice(0, 12);
  };

  // Every file that shapes what a capture looks like, so that changing one of them marks the
  // screenshots stale. Before this list existed only `styles.css` was recorded, which meant the
  // harness could be rewritten — a pinned custom property, a different device metric, a changed
  // scenario — and every screenshot still reported fresh while depicting a rendering that no
  // longer existed.
  //
  // Deliberately NOT here: the Storybook preview and the geometry harness. Neither is read by this
  // file, so listing them would invalidate 196 screenshots whenever an unrelated harness changed,
  // and a staleness gate that cries wolf gets regenerated past without being read.

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
      // Which top-level directory this scenario's captures land under — our own fixtures and
      // constructed renders under notion-clone/<group>/; a reference capture's group IS
      // project-manager, already its own directory, so it takes no further root prefix.
      const root = captureRootFor(scenario);
      const relFor = (deviceId, theme) => {
        const base = `${scenario.group}/${scenario.id}-${deviceId}-${theme}.png`;
        return root ? `${root}/${base}` : base;
      };
      // A surface that only exists on one device gets photographed on that device only.
      //
      // Both mobile bottom sheets were captured on a 1440px desktop frame as well, where the sheet
      // spans the full width of a window no phone has. That image is not a weaker picture of the
      // surface, it is a picture of a surface the plugin never presents — and a corpus read to
      // judge the sheet contained one. Naming the devices is narrower than skipping the capture
      // wholesale: the scenario stays registered, stays fresh-checked, and stays in the index.
      const wanted = scenario.devices
        ? devices.filter((d) => scenario.devices.includes(d.id))
        : devices;
      for (const device of wanted) {
      for (const theme of themes) {
        // Reduced motion is emulated, not incidental. Several plugin properties are transitioned,
        // so a capture taken before they settle records an animation frame — and the same page
        // captured twice then produces two different images. The stylesheet already disables
        // transitions under prefers-reduced-motion, so asking for it makes every shot deterministic.
        const page = await browser.newPage({
          reducedMotion: "reduce",
          viewport: { width: device.width, height: device.height },
          deviceScaleFactor: 2,
          isMobile: device.id === "mobile",
          hasTouch: device.id === "mobile",
        });
        if (scenario.mount) {
          // The mount resolves with the mounted container only when the renderer signalled
          // ready; anything else means the renderer never mounted, and photographing that
          // would record an empty box as a successful capture.
          const mounted = await scenario.mount(page, device, theme);
          if (!mounted) {
            failures.push(`${relFor(device.id, theme)}: `
              + "renderer never signalled ready — refusing to photograph an unmounted view");
            console.log(`  NOTREADY ${scenario.id}-${device.id}-${theme}`);
            await page.close();
            continue;
          }
          await waitForConstructedLayout(page);
        } else {
          const html = buildPage(scenario, theme, styles, themeCss, runtimeCss, device);
          const tmpFile = join(TMP, `${scenario.id}-${device.id}-${theme}.html`);
          writeFileSync(tmpFile, html, "utf8");
          await page.goto(pathToFileURL(tmpFile).href, { waitUntil: "load" });
        }

        const target = await page.$("#shot");

        // Measure before capturing. A fixture that resolves to an absurd size takes the
        // whole browser down with it, which reads as an unexplained crash; measuring first
        // turns that into a number naming the scenario and its dimensions.
        const box = await target.boundingBox();
        const LIMIT = 12000;
        if (!box || box.width > LIMIT || box.height > LIMIT) {
          const size = box ? `${Math.round(box.width)}x${Math.round(box.height)}` : "unmeasurable";
          failures.push(`${relFor(device.id, theme)}: refused, renders ${size}px (limit ${LIMIT})`);
          console.log(`  OVERSIZE ${scenario.id}-${device.id}-${theme}: ${size}px`);
          await page.close();
          continue;
        }
        const rel = relFor(device.id, theme);
        const dest = join(OUT, rel);
        mkdirSync(dirname(dest), { recursive: true });
        let layout = null;
        try {
          // A scenario whose markup never settles - a running animation, a zero-size box -
          // would otherwise wait forever and take the whole run down with it, leaving the
          // manifest unwritten and every later surface unphotographed. Bound it, record the
          // failure, and keep going so one bad fixture costs one screenshot.
          // Capture the viewport, not the element. An element shot grows to its own content,
          // so a wide table photographed on a phone viewport comes back full desktop width
          // and the responsive layout never appears. A viewport shot is exactly the device
          // frame the surface would occupy, and content wider than it scrolls as it would.
          // A fingerprint of the layout, not the pixels.
          //
          // These captures are not byte-reproducible and cannot be made so: the same fixture, with
          // identical geometry to the hundredth of a pixel, rasterises differently between runs.
          // So a byte diff cannot distinguish a surface that changed from one the GPU drew
          // slightly differently, and a review that asks a person to open every changed image
          // spends most of its attention on noise.
          //
          // The geometry is stable. Recording it means "which surfaces actually moved" is
          // answerable, and the sign-off list can be the short one.
          layout = await page.evaluate(() => {
            const shot = document.getElementById("shot");
            if (!shot) return null;
            const parts = [];
            shot.querySelectorAll("*").forEach((el) => {
              const r = el.getBoundingClientRect();
              parts.push(
                `${el.tagName}.${el.className}` +
                `:${Math.round(r.x * 10)},${Math.round(r.y * 10)},` +
                `${Math.round(r.width * 10)},${Math.round(r.height * 10)}`
              );
            });
            return parts.join("|");
          });

          // A declared width has to FRAME the surface, not crop it.
          //
          // `#shot` is `overflow: hidden`, so a surface wider than the box is silently cut at the
          // edge and the PNG still looks like a finished picture. Two were: the add-view popover
          // takes 360px from `width: min(360px, 100vw - 24px)` and was declared at 292, and the
          // sort popover takes 538px from the filter panel's `min(520px, ...)` plus its frame and
          // was declared at 480. Both lost their right-hand controls — "Descending" read "Des" —
          // and both are element captures nothing measured.
          //
          // Scoped to the surfaces the declared width is meant to frame: the shot's own children
          // and the children of the plugin container it usually wraps them in. Anything deeper is
          // content INSIDE a surface, and content that overflows its surface scrolls in the product
          // too — a table on a phone is the honest example, and failing it would be failing the
          // product's own behaviour. Scoped to captures where a width was actually applied, which
          // by the rule above is the desktop pass of a scenario that declared one.
          if (captureMode(scenario) === "element" && scenario.width && !device.bodyClass) {
            const clipped = await page.evaluate(() => {
              const shot = document.getElementById("shot");
              const edge = shot.getBoundingClientRect().right;
              let worst = null;
              shot.querySelectorAll("#shot > *, #shot > * > *").forEach((el) => {
                const r = el.getBoundingClientRect();
                if (r.width === 0 || r.height === 0) return;
                const over = Math.round(r.right - edge);
                if (over > 1 && (!worst || over > worst.over)) {
                  worst = { over, cls: `${el.tagName.toLowerCase()}.${el.className}`, width: Math.round(r.width) };
                }
              });
              return worst;
            });
            if (clipped) {
              failures.push(`${rel}: declared width ${scenario.width} crops the surface — `
                + `${clipped.cls} renders ${clipped.width}px and loses ${clipped.over}px at the right edge`);
              console.log(`  CLIPPED ${scenario.id}-${device.id}-${theme}: ${clipped.over}px lost`);
            }
          }

          // Wait for fonts before painting. Without this the same fixture photographed twice comes
          // back with two different byte streams, because a shot taken before the face resolves
          // measures fallback metrics and one taken after measures the real ones. It alternated
          // run to run, which is worse than being wrong consistently: a diff then means nothing.
          await page.evaluate(() => document.fonts.ready);
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
          layoutHash: layout
            ? createHash("sha256").update(layout).digest("hex").slice(0, 12)
            : null,
          // A coarse hash of the decoded pixels, tolerant to the encoder and antialiasing jitter
          // that moves a capture's file bytes between two runs of the identical page (see
          // pixel-hash.mjs). This is what a release compares changed captures by; bytes below
          // stays for information only.
          pixelHash: pixelHash(bytes),
          sourceHashes: Object.fromEntries(
            [...scenario.sources, ...CAPTURE_INPUTS].map((s) => [s, fingerprint(s)])
          ),
          note: scenario.note || null,
          capture: captureMode(scenario),
          bytes: bytes.length,
          // Constructed captures name the renderer they photographed; reference captures
          // name the vendored view they photographed and the constructed scenario they
          // mirror; fixtures that a constructed capture supersedes declare it, so the
          // manifest can tell the authorities apart.
          ...(scenario.kind === "reference"
            ? { source: "reference", renderer: scenario.renderer, ...(scenario.referenceOf ? { referenceOf: scenario.referenceOf } : {}) }
            : scenario.mount
              ? { source: "constructed", renderer: scenario.renderer, bag: scenario.bag, ...(scenario.scale ? { scale: scenario.scale } : {}) }
              : {}),
          ...(scenario.fixtureOf ? { fixtureOf: scenario.fixtureOf } : {}),
        });
        count += 1;
        console.log(`  captured ${rel} (${bytes.length} bytes)`);
        await page.close();
      }
      }
    }
  } finally {
    await browser.close();
    if (constructedBundleBuilt) disposeConstructedBundle();
    if (referenceBundleBuilt) disposeReferenceBundle();
    rmSync(TMP, { recursive: true, force: true });
  }

  // Only rewrite the manifest on a full run; a --only run would otherwise drop every
  // scenario it did not capture and make the freshness check read as complete.
  if (!only && themeArg === "both" && deviceArg === "both") {
    // An entry the schema rejects is a capture that cannot be told apart from what it is not,
    // so the run fails instead of publishing a manifest that lies about its own record.
    for (const entry of manifest) {
      const verdict = validateManifestEntry(entry);
      if (!verdict.ok) {
        throw new Error(`manifest schema rejects an entry this run captured: ${verdict.problems.join("; ")}`);
      }
    }
    const payload = {
      generatedFrom: { stylesheet: `styles.css@${stylesHash}` },
      scenarios: manifest.sort((a, b) => a.file.localeCompare(b.file)),
    };
    writeFileSync(join(OUT, "manifest.json"), JSON.stringify(payload, null, 2) + "\n", "utf8");
    console.log(`  manifest updated: ${manifest.length} entries`);

    const laneRoots = JSON.parse(readFileSync(LANE_PATH, "utf8")).inScopeCaptureRoots;
    writeFileSync(join(OUT, "README.md"), buildReadme(manifest, laneRoots), "utf8");
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
