// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-rebuild
// COMPONENT: gate check that a sheet refreshing itself keeps its grab bar
// ───────────────────────────────────────────────────────────────────
//
// The grab bar is a child of the sheet panel, and a surface that refreshes by
// emptying that panel throws the bar away without knowing it exists. The sheet
// stays open, still covering the screen, with no visible way out.
//
// The group sheet was the case that mattered: changing the group field IS its
// rebuild, so using the surface for its one purpose stripped its own bar.
//
// This drives the real ToolbarRenderer rather than reading its source. Every
// other renderer check in this repo greps a file, and a grep cannot tell a call
// that runs from a call behind a condition that is never true.
//
// Usage: node tools/live/sheet-rebuild.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";
import { chromium } from "playwright-core";
import { stamp } from "./evidence.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HERE = fileURLToPath(new URL(".", import.meta.url));
const STAMP_PATH = "tools/live/sheet-rebuild.json";

// ───────────────────────────────────────────────────────────────────
// 2. BUNDLE
// ───────────────────────────────────────────────────────────────────

const obsidianStubPlugin = {
  name: "obsidian-stub",
  setup(build) {
    build.onResolve({ filter: /^obsidian$/ }, () => ({
      path: resolve(HERE, "../storybook/obsidian-stub.mjs"),
    }));
  },
};

const work = mkdtempSync(join(tmpdir(), "sheet-rebuild-"));
const entry = join(work, "entry.ts");

writeFileSync(entry, `
import { installObsidianDomShim } from "${resolve(HERE, "../storybook/obsidian-dom-shim.mjs")}";
import { runSheetRebuildParity, openGroupSheetForDrag } from "${resolve(HERE, "sheet-rebuild-harness")}";
import { shouldFlickDismiss, FLICK_PX_PER_MS, FLICK_MIN_PX, STALE_SAMPLE_MS } from "${resolve(HERE, "../../src/views/mobile-bottom-sheet")}";

installObsidianDomShim(window);
window.__sheetRebuild = () => runSheetRebuildParity(document);
window.__openGroupSheetForDrag = () => openGroupSheetForDrag(document);
// The speed rule, exported so this lane can ask it rather than race to produce it.
window.__sheet = { shouldFlickDismiss, FLICK_PX_PER_MS, FLICK_MIN_PX, STALE_SAMPLE_MS };
`);

const built = await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  outfile: join(work, "bundle.js"),
  plugins: [obsidianStubPlugin],
  metafile: true,
  logLevel: "warning",
  absWorkingDir: REPO,
});

// The renderer under test must be the shipped one. A bundle that stopped importing it
// and exercised a copy would prove the copy.
const REQUIRED = [
  "src/views/toolbar-renderer.ts",
  "src/views/popover-position.ts",
  "src/views/mobile-bottom-sheet.ts",
];
const bundled = Object.keys(built.metafile.inputs);
const missing = REQUIRED.filter((source) => !bundled.includes(source));
if (missing.length > 0) {
  console.error(`sheet-rebuild: FAIL — the bundle no longer imports ${missing.join(", ")}`);
  process.exit(1);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${REPO}styles.css"></head>
<body class="theme-dark"><script src="bundle.js"></script></body></html>`);

// ───────────────────────────────────────────────────────────────────
// 3. RUN
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
  throw new Error("sheet-rebuild: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

// Past the gesture's own 96px dismissal threshold, with room to spare.
const DRAG_PX = 120;
// Well UNDER the distance threshold, so only velocity can dismiss at this distance. The same
// number is used for both the flick and its slow control, because the pair is only meaningful if
// the distance is identical and speed is the single thing that differs.
const SHORT_PX = 40;

let results = null;
let dragResult = null;
let browser;
const failures = [];
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);
  await page.evaluate(() => document.body.classList.add("is-phone"));
  results = await page.evaluate(() => window.__sheetRebuild());

  // The bar existing is not the claim. The claim is that the sheet can still be dragged away
  // after it rebuilt itself, which is what the operator does — and a restored-but-inert bar
  // would pass a presence check and fail this one. Driven with a real pointer because the
  // gesture calls setPointerCapture, which rejects any pointer id no real device owns.
  /** Drive one real gesture on a freshly opened, freshly rebuilt sheet. */
  const gesture = async ({ distance, steps, pauseMs }) => {
    const setup = await page.evaluate(() => window.__openGroupSheetForDrag());
    if (!setup.ready) return { staged: false, closed: false, detail: setup.detail };

    // Wait for the sheet to finish rising before touching it, and then prove the bar is actually
    // under the cursor.
    //
    // The entrance animates from below the fold, so a box measured the instant the sheet opens
    // puts the grab bar at y=860 in an 844px viewport — off-screen. Every press then landed on
    // nothing, the overlay stack dismissed it as an OUTSIDE press, and the sheet closed. Which
    // looked exactly like a working drag: the gesture ran, the sheet went away, the case passed.
    // A zero-distance tap "passing" is what exposed it.
    //
    // So the hit test is the gate, not the wait. A bar that is not under the cursor is refused
    // rather than pressed, because a press that misses can still close the sheet for the wrong
    // reason and there is no way to tell that apart from the outside.
    //
    // AND IT HAS TO HAVE STOPPED MOVING. Hit-testable is true on the first frame of the entrance
    // as well as the last, and the coordinate is read here while the press lands a few milliseconds
    // later — by which time a rising sheet has carried the bar further up. The press then hits the
    // panel instead of the bar, `onDown` refuses it because it checks `event.target`, and the
    // gesture is inert. That reported as "the bar is back but inert" on two runs in three, on a
    // tree that had not touched the sheet: a flake that accuses the product.
    //
    // So the position must be unchanged across two consecutive frames before the coordinate is
    // taken. Same gate, one more condition, and the condition is the one the race lives in.
    const hit = await page
      .waitForFunction(() => {
        const handle = document.querySelector(".db-mobile-bottom-sheet-handle");
        if (!handle) return null;
        const box = handle.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return null;
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        if (y < 0 || y > window.innerHeight || x < 0 || x > window.innerWidth) return null;
        if (document.elementFromPoint(x, y) !== handle) return null;
        const settled = window.__lastHandleY !== undefined
          && Math.abs(window.__lastHandleY - y) < 0.5;
        window.__lastHandleY = y;
        return settled ? { x, y } : null;
      }, null, { timeout: 4000, polling: "raf" })
      .then((handleResult) => handleResult.jsonValue())
      .catch(() => null);
    await page.evaluate(() => { delete window.__lastHandleY; });

    if (!hit) {
      return { staged: false, closed: false, detail: "the grab bar never became hit-testable, so no press could reach it" };
    }

    const centreX = hit.x;
    const centreY = hit.y;
    await page.mouse.move(centreX, centreY);
    // The last thing checked before the press is the thing the press depends on. Everything above
    // is about a moment that has already passed by the time the cursor is actually here.
    const onBar = await page.evaluate(([x, y]) => {
      const el = document.elementFromPoint(x, y);
      return Boolean(el && el.classList.contains("db-mobile-bottom-sheet-handle"));
    }, [centreX, centreY]);
    if (!onBar) {
      return { staged: false, closed: false, detail: "the bar moved out from under the cursor between the hit test and the press" };
    }
    await page.mouse.down();
    for (let step = 1; step <= steps; step += 1) {
      await page.mouse.move(centreX, centreY + (distance * step) / steps);
      if (pauseMs) await page.waitForTimeout(pauseMs);
    }
    await page.mouse.up();
    return { staged: true, closed: await page.evaluate(() => window.__sheetClosed === true), detail: "" };
  };

  // 1. Past the distance threshold. The original path, and the one that always worked.
  const longDrag = await gesture({ distance: DRAG_PX, steps: 12, pauseMs: 0 });
  // 2. A short flick, under the distance threshold. This is what did nothing before velocity
  //    dismissal existed — and its VELOCITY is asked of the shipped decision rather than produced by
  //    the harness, because a harness cannot control how fast its own events arrive.
  //
  //    Driving it "as fast as possible" delivered roughly 2 px/ms on a quiet machine and under 0.8
  //    on a loaded one, so the same tree reported a working flick as broken depending on what else
  //    was running. Both this lane and the placement lane failed that way, on a commit that touched
  //    neither the gesture nor its constants.
  //
  //    What is still driven here is that the gesture REACHES the handler after a rebuild, which is
  //    this lane's whole subject: the drag is staged on a rebuilt bar and the pointer is real. The
  //    speed threshold is a decision over three numbers and is asked as one.
  const flick = await gesture({ distance: SHORT_PX, steps: 4, pauseMs: 0 });
  const flickDecision = await page.evaluate(() => {
    const { shouldFlickDismiss, FLICK_PX_PER_MS, FLICK_MIN_PX, STALE_SAMPLE_MS } = globalThis.__sheet;
    return {
      // A genuine flick: measured at 1.18 px/ms on real pointer input.
      genuine: shouldFlickDismiss(40, 1.18, 8),
      // A brisk drag aiming for the distance threshold: 0.5 px/ms. It must spring back.
      brisk: shouldFlickDismiss(80, 0.5, 8),
      // A tap that travelled nowhere, and a finger that rested before lifting.
      tap: shouldFlickDismiss(FLICK_MIN_PX - 1, 50, 1),
      rested: shouldFlickDismiss(40, 2, STALE_SAMPLE_MS + 1),
      threshold: FLICK_PX_PER_MS,
    };
  });
  // 3. The SAME distance delivered slowly. It must NOT dismiss, or the velocity rule has become
  //    "any gesture closes the sheet" and the threshold means nothing.
  const slowDrag = await gesture({ distance: SHORT_PX, steps: 4, pauseMs: 120 });
  // 4. A press and release that never moves. This is the control that caught the harness pressing
  //    an off-screen bar: with the sheet still below the fold every press missed, the overlay stack
  //    dismissed it as an OUTSIDE press, and all three gestures above "passed" without the drag
  //    doing anything. A tap closing the sheet is the one result that cannot be explained by the
  //    gesture working, which is why it stays.
  const tap = await gesture({ distance: 0, steps: 1, pauseMs: 0 });

  dragResult = [
    {
      name: `a ${DRAG_PX}px drag after a rebuild`,
      pass: longDrag.staged && longDrag.closed,
      detail: !longDrag.staged ? `could not stage: ${longDrag.detail}`
        : longDrag.closed ? "dismissed, as the distance threshold requires"
          : "did nothing — the bar is back but inert",
    },
    {
      name: `a ${SHORT_PX}px flick reaches the handler, and the speed rule decides it`,
      pass: flick.staged && flickDecision.genuine && !flickDecision.brisk
        && !flickDecision.tap && !flickDecision.rested,
      detail: !flick.staged ? `could not stage: ${flick.detail}`
        : `the gesture staged on a rebuilt bar and the pointer is real; the shipped decision takes a`
          + ` genuine flick at 1.18 px/ms (${flickDecision.genuine}), refuses a brisk drag at 0.5`
          + ` (${flickDecision.brisk}), refuses a tap that travelled nowhere (${flickDecision.tap})`
          + ` and refuses a finger that rested before lifting (${flickDecision.rested}), against a`
          + ` ${flickDecision.threshold} px/ms threshold. Whether THIS gesture closed the sheet`
          + ` (${flick.closed}) is not asserted: the harness cannot control how fast its own events`
          + ` arrive, and that number moved with machine load rather than with the tree`,
    },
    {
      name: `a slow ${SHORT_PX}px drag`,
      pass: slowDrag.staged && !slowDrag.closed,
      detail: !slowDrag.staged ? `could not stage: ${slowDrag.detail}`
        : slowDrag.closed ? "dismissed, so the velocity rule fires on any gesture and means nothing"
          : "sprang back, as a slow gesture short of the threshold should",
    },
    {
      name: "a tap that never moves",
      pass: tap.staged && !tap.closed,
      detail: !tap.staged ? `could not stage: ${tap.detail}`
        : tap.closed ? "dismissed the sheet — the press is not reaching the bar, and every gesture above is passing for that reason rather than its own"
          : "left the sheet open, so the presses above are landing on the bar",
    },
  ];

  await page.close();
  for (const error of pageErrors) failures.push(`page error: ${error}`);
} catch (error) {
  failures.push(`harness run failed: ${error.message}`);
} finally {
  if (browser) await browser.close();
  rmSync(work, { recursive: true, force: true });
}

if (!results) {
  console.error(`\nsheet-rebuild: FAIL — ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`sheet-rebuild: ${results.length} case(s) rebuilt in headless Chrome\n`);
for (const r of results) {
  console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.surface.padEnd(44)} ${r.rebuildShape}`);
  console.log(`        bar before: ${r.barBeforeRebuild}, after: ${r.barAfterRebuild} — ${r.detail}`);
  if (!r.pass) failures.push(`${r.surface}: ${r.detail}`);
}

if (dragResult) {
  for (const g of dragResult) {
    console.log(`  ${g.pass ? "PASS" : "FAIL"}  ${g.name.padEnd(44)} real pointer`);
    console.log(`        ${g.detail}`);
    if (!g.pass) failures.push(`${g.name}: ${g.detail}`);
  }
} else {
  failures.push("the gesture cases never ran, so the drag is unmeasured");
}

// ───────────────────────────────────────────────────────────────────
// 4. VERDICT
// ───────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(`\nsheet-rebuild: FAIL — ${failures.length} case(s) failed`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error("  A sheet with no grab bar is an open surface with no visible way out.");
  process.exit(1);
}

stamp(STAMP_PATH, { cases: results.length + dragResult.length, barsLost: 0, gesturesMeasured: dragResult.length }, [
  "tools/live/sheet-rebuild.mjs",
  "tools/live/sheet-rebuild-harness.ts",
  ...REQUIRED,
]);

console.log(`\nsheet-rebuild: stamped at ${STAMP_PATH}`);
console.log("sheet-rebuild: PASS — every rebuilt sheet still has the bar it opened with");
console.log("  what this does not prove: no Obsidian host is constructed, so the surface is opened");
console.log("  directly rather than through a real toolbar click. A rebuild path reached on a device");
console.log("  by some route not modelled here is not covered.");
process.exit(0);
