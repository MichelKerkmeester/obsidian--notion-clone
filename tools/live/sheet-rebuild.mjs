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
// The last section runs in Chrome AND WebKit, on an emulated iPhone. Everything
// above it is Chrome only, which is how a fix could be called proven under phone
// emulation while the device — WebKit — still showed the defect. Section 3b says
// what the two engines actually do rather than leaving it assumed.
//
// Usage: node tools/live/sheet-rebuild.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";
import { chromium, devices, webkit } from "playwright-core";
import { stamp } from "./evidence.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HERE = fileURLToPath(new URL(".", import.meta.url));
const STAMP_PATH = "tools/live/sheet-rebuild.json";
const PRE_FIX_FAILURES = new Map([
  ["a tap that never moves", "dismissed the sheet — the press is not reaching the bar, and every gesture above is passing for that reason rather than its own"],
  ["sort sheet (real SortPanelRenderer, add-sort)", "a tap inside the panel the rebuild just created read as OUTSIDE"],
  ["filter sheet (real FilterPanelRenderer, add-condition)", "a tap inside the panel the rebuild just created read as OUTSIDE"],
  ["embedded filter sheet (real FilterPanelRenderer, portalled on phone)", "a tap inside the panel the rebuild just created read as OUTSIDE"],
  ["the sort sheet holds still while it rebuilds", "settled at top 708 and the rebuild dropped it to 844 on an 844px screen"],
  ["the filter sheet holds still while it rebuilds", "settled at top 701 and the rebuild dropped it to 844 on an 844px screen"],
  ["five taps on the sort sheet's add control", "2 of 5 taps reached it; the other three landed on a rule row and on two icons"],
  ["five taps on the filter sheet's add control", "2 of 5 taps reached it; one of the strays opened a field dropdown"],
  ["Chrome: a toolbar rebuild behind the open sort sheet", "the sheet went with the anchor (sheet: false, on the body: false, visibility: hidden, sheets: 0, backdrops: 0)"],
  ["Chrome: a toolbar rebuild behind the open filter sheet", "the sheet went with the anchor (sheet: false, on the body: false, visibility: hidden, sheets: 0, backdrops: 0)"],
  ["Chrome: the sort sheet's add control after a toolbar rebuild", "0 rule(s) after the tap (open: false, sheet: false) — the control does nothing"],
  ["Chrome: the filter sheet's add control after a toolbar rebuild", "0 rule(s) after the tap (open: false, sheet: false) — the control does nothing"],
  ["WebKit: a toolbar rebuild behind the open sort sheet", "the sheet went with the anchor (sheet: false, on the body: false, visibility: hidden, sheets: 0, backdrops: 0)"],
  ["WebKit: a toolbar rebuild behind the open filter sheet", "the sheet went with the anchor (sheet: false, on the body: false, visibility: hidden, sheets: 0, backdrops: 0)"],
  ["WebKit: the sort sheet's add control after a toolbar rebuild", "0 rule(s) after the tap (open: false, sheet: false) — the control does nothing"],
  ["WebKit: the filter sheet's add control after a toolbar rebuild", "0 rule(s) after the tap (open: false, sheet: false) — the control does nothing"],
]);

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
import { runSheetRebuildParity, openGroupSheetForDrag, openHeaderSheetForAddRow, openHeaderSheetTracked, readAddRowProbe, rebuildToolbarBehindSheet, trackSheetTop, readSheetTrack } from "${resolve(HERE, "sheet-rebuild-harness")}";
import { shouldFlickDismiss, FLICK_PX_PER_MS, FLICK_MIN_PX, STALE_SAMPLE_MS } from "${resolve(HERE, "../../src/views/mobile-bottom-sheet")}";

installObsidianDomShim(window);
window.__sheetRebuild = () => runSheetRebuildParity(document);
window.__openGroupSheetForDrag = () => openGroupSheetForDrag(document);
window.__openAddRowSheet = (kind) => openHeaderSheetForAddRow(document, kind);
window.__openAddRowSheetTracked = (kind, ms) => openHeaderSheetTracked(document, kind, ms);
window.__addRowProbe = () => readAddRowProbe(document);
window.__rebuildToolbarBehindSheet = () => rebuildToolbarBehindSheet(document);
window.__trackSheetTop = (ms) => trackSheetTop(document, ms);
window.__sheetTrack = () => readSheetTrack();
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
  "src/views/sort-panel-renderer.ts",
  "src/views/filter-panel-renderer.ts",
  "src/views/overlay-stack.ts",
  "src/views/popover-auto-close.ts",
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

// A second page for the two-engine section, carrying the same bundle and the same stylesheet with
// nothing loaded across a directory boundary. WebKit is stricter than Chrome about what a `file://`
// document may fetch, and a stylesheet that silently fails to load would report every measurement
// below as an engine disagreement rather than as the missing file it is.
writeFileSync(join(work, "parity.html"), `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>${readFileSync(join(REPO, "styles.css"), "utf8")}</style></head>
<body class="theme-dark"><script>${readFileSync(join(work, "bundle.js"), "utf8")}</script></body></html>`);

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

// ───────────────────────────────────────────────────────────────────
// 3b. A TOOLBAR REBUILD BEHIND AN OPEN SHEET, IN BOTH ENGINES
// ───────────────────────────────────────────────────────────────────
//
// Every case above runs in Chrome, and the device runs WebKit. The operator reported these same
// controls still dead on iOS after a fix that Chrome's touch emulation had called green, so the
// first question was whether the two engines disagree. They do not — measured, identically, on the
// case below both before and after the fix — and that answer is worth keeping rather than
// re-deriving, because "proven under phone emulation" quietly meant "proven in one engine".
//
// What the emulation was missing was not the engine. It was the event: nothing in a harness rebuilds
// the toolbar behind an open sheet, and on a device the view does it constantly. The panel's owner
// is then holding a button that has left the document, and the next placement — a scroll, a
// rotation, the keyboard — read that dead anchor and took the sheet down: un-portalled from the
// body, backdrop removed, `visibility: hidden`. The control the operator was aiming at was on a
// surface that no longer existed.
//
// The negative control is the desktop half. An anchored popover has no answer without its anchor and
// must still hide; deleting that rule would pass everything above and would be a different defect.

const IPHONE = devices["iPhone 14 Pro"];

/** Settle the sheet, then report where "+ Add" ended up — the coordinate a thumb would aim at. */
async function settledAddButton(page) {
  await page.waitForFunction(() => {
    const probe = window.__addRowProbe();
    const last = window.__paritySettleTop;
    window.__paritySettleTop = probe.panelTop;
    return probe.panelTop !== null
      && probe.panelTop < window.innerHeight - 1
      && last !== undefined
      && Math.abs(last - probe.panelTop) < 0.5;
  }, null, { timeout: 4000, polling: "raf" });
  await page.evaluate(() => { delete window.__paritySettleTop; });
  return page.evaluate(() => window.__addRowProbe());
}

/** Give the placement its recovery frame, then let the rebuild that follows it finish. */
async function afterPlacementSettles(page) {
  await page.evaluate(() => new Promise((done) => {
    requestAnimationFrame(() => requestAnimationFrame(() => done(undefined)));
  }));
  await page.waitForTimeout(120);
}

async function measureToolbarRebuild(engine, launchOptions, pageUrl, engineName) {
  const checks = [];
  const browserForEngine = await engine.launch(launchOptions);
  try {
    // --- the phone half ---
    const phone = await browserForEngine.newContext({ ...IPHONE });
    const phonePage = await phone.newPage();
    const engineErrors = [];
    phonePage.on("pageerror", (error) => engineErrors.push(error.message));
    await phonePage.goto(pageUrl);
    await phonePage.evaluate(() => document.body.classList.add("is-phone"));

    for (const kind of ["sort", "filter"]) {
      const setup = await phonePage.evaluate((k) => window.__openAddRowSheet(k), kind);
      if (!setup.ready) {
        checks.push({ name: `${engineName}: a toolbar rebuild behind the open ${kind} sheet`, pass: false, detail: `could not stage: ${setup.detail}` });
        continue;
      }
      const opened = await settledAddButton(phonePage);
      if (!opened.addButton || !opened.isSheet) {
        checks.push({ name: `${engineName}: a toolbar rebuild behind the open ${kind} sheet`, pass: false, detail: "could not stage: the sheet never opened with an add control on screen" });
        continue;
      }

      const rebuilt = await phonePage.evaluate(() => window.__rebuildToolbarBehindSheet());
      await afterPlacementSettles(phonePage);
      const survived = await phonePage.evaluate(() => window.__addRowProbe());
      const intact = rebuilt && survived.isSheet && survived.onBody
        && survived.visibility !== "hidden" && survived.sheets === 1 && survived.scrims === 1;
      checks.push({
        name: `${engineName}: a toolbar rebuild behind the open ${kind} sheet`,
        pass: intact,
        detail: !rebuilt ? "could not stage: no sheet was open to rebuild behind"
          : intact
            ? "the sheet is still a sheet, still on the body, still visible, and still has its backdrop"
            : `the sheet went with the anchor (sheet: ${survived.isSheet}, on the body: ${survived.onBody},`
              + ` visibility: ${survived.visibility}, sheets: ${survived.sheets}, backdrops: ${survived.scrims})`
              + " — a button it never measures took the surface down",
      });

      // The consequence, at the coordinate the thumb is already on.
      await phonePage.touchscreen.tap(opened.addButton.x, opened.addButton.y);
      await phonePage.waitForTimeout(500);
      const tapped = await phonePage.evaluate(() => window.__addRowProbe());
      const landed = tapped.rules === opened.rules + 1 && tapped.open && tapped.isSheet;
      checks.push({
        name: `${engineName}: the ${kind} sheet's add control after a toolbar rebuild`,
        pass: landed,
        detail: landed
          ? `the tap reached it: ${tapped.rules} rule(s), sheet still open and still a sheet`
          : `${tapped.rules} rule(s) after the tap (open: ${tapped.open}, sheet: ${tapped.isSheet})`
            + " — the control does nothing, which is what the operator reported",
      });
    }
    await phonePage.close();
    for (const error of engineErrors) {
      checks.push({ name: `${engineName}: the phone page raised no error`, pass: false, detail: `page error: ${error}` });
    }
    await phone.close();

    // --- the negative control, on a desktop viewport ---
    const desk = await browserForEngine.newContext({ viewport: { width: 1200, height: 900 } });
    const deskPage = await desk.newPage();
    await deskPage.goto(pageUrl);
    const deskSetup = await deskPage.evaluate(() => window.__openAddRowSheet("sort"));
    if (!deskSetup.ready) {
      checks.push({ name: `${engineName}: an anchored popover still goes when its anchor does`, pass: false, detail: `could not stage: ${deskSetup.detail}` });
    } else {
      const before = await deskPage.evaluate(() => window.__addRowProbe());
      const rebuilt = await deskPage.evaluate(() => window.__rebuildToolbarBehindSheet());
      await afterPlacementSettles(deskPage);
      const after = await deskPage.evaluate(() => window.__addRowProbe());
      const stillHides = rebuilt && !before.isSheet && after.visibility === "hidden";
      checks.push({
        name: `${engineName}: an anchored popover still goes when its anchor does`,
        pass: stillHides,
        detail: !rebuilt ? "could not stage: nothing was open to rebuild behind"
          : before.isSheet ? "the desktop page presented a sheet, so this control measured the wrong surface"
            : stillHides
              ? "hidden, as a surface with no anchor left to sit beside should be"
              : `still showing (visibility: ${after.visibility}) — the dead-anchor rule has been deleted`
                + " rather than narrowed, and an anchored popover now floats over rebuilt content",
      });
    }
    await deskPage.close();
    await desk.close();
  } finally {
    await browserForEngine.close();
  }
  return checks;
}

async function runToolbarRebuildParity(htmlPath) {
  const url = `file://${htmlPath}`;
  return [
    ...await measureToolbarRebuild(chromium, { executablePath: findChrome() }, url, "Chrome"),
    ...await measureToolbarRebuild(webkit, {}, url, "WebKit"),
  ];
}

let results = null;
let dragResult = null;
let addRowResult = null;
let parityResult = null;
let browser;
const failures = [];
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
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

  // ─────────────────────────────────────────────────────────────────
  // AN EDIT INSIDE AN OPEN SHEET
  // ─────────────────────────────────────────────────────────────────
  //
  // The parity cases above dispatch `click()` on a node they looked up after the rebuild. A thumb
  // aims at a screen COORDINATE, before the rebuild, and lands on whatever is there when the tap
  // arrives — so a sheet that moves between two taps sends the second one somewhere the operator
  // never aimed. That is a different question, and nothing here asked it until now.

  /** Open the sheet, let the entrance finish, and report where "+ Add" ended up. */
  const openSettled = async (kind) => {
    const setup = await page.evaluate((k) => window.__openAddRowSheet(k), kind);
    if (!setup.ready) return null;
    // Past the 260ms entrance with room to spare, and confirmed settled rather than assumed: the
    // coordinate is only meaningful once the surface has stopped moving.
    // Unmoving is not enough. The entrance holds its start state for a frame or two before it
    // begins interpolating, so two identical samples are also what the BEGINNING of a rise looks
    // like — and a coordinate taken there is a coordinate on a sheet that is about to leave. The
    // surface must have stopped moving AND be on screen.
    await page.waitForFunction(() => {
      const probe = window.__addRowProbe();
      const last = window.__settleTop;
      window.__settleTop = probe.panelTop;
      return probe.panelTop !== null
        && probe.panelTop < window.innerHeight - 1
        && last !== undefined
        && Math.abs(last - probe.panelTop) < 0.5;
    }, null, { timeout: 4000, polling: "raf" });
    await page.evaluate(() => { delete window.__settleTop; });
    return page.evaluate(() => window.__addRowProbe());
  };

  addRowResult = [];
  for (const kind of ["sort", "filter"]) {
    const settled = await openSettled(kind);
    if (!settled?.addButton) {
      addRowResult.push({
        name: `the ${kind} sheet holds still while it rebuilds`,
        pass: false,
        detail: "could not stage: the sheet never opened with an add control on screen",
      });
      addRowResult.push({
        name: `five taps on the ${kind} sheet's add control`,
        pass: false,
        detail: "could not stage: the sheet never opened with an add control on screen",
      });
      continue;
    }

    // 1. THE MECHANISM. One tap, and the sheet's own top edge sampled every frame for 500ms after
    //    it. A rebuild replaces the panel node; if the replacement is treated as an opening, the
    //    surface drops the full height of itself and slides back over the entrance duration.
    const settledTop = settled.panelTop;
    await page.evaluate(() => window.__trackSheetTop(500));
    await page.touchscreen.tap(settled.addButton.x, settled.addButton.y);
    await page.waitForTimeout(600);
    const track = await page.evaluate(() => window.__sheetTrack());
    const deepest = track.length > 0 ? Math.max(...track) : Number.NaN;
    // Downward only. Adding a row makes the sheet taller and its top edge legitimately rises, so
    // the floor is the settled top and the ceiling is nothing.
    const held = Number.isFinite(deepest) && deepest <= settledTop + 4;
    addRowResult.push({
      name: `the ${kind} sheet holds still while it rebuilds`,
      pass: held,
      detail: !Number.isFinite(deepest)
        ? "the sheet was never sampled, so this run proves nothing"
        : held
          ? `settled at top ${settledTop.toFixed(0)}; the deepest point during the rebuild was ${deepest.toFixed(0)}`
          : `settled at top ${settledTop.toFixed(0)} and the rebuild dropped it to ${deepest.toFixed(0)}`
            + " — the surface replayed its entrance, so it is moving under the finger",
    });

    // 2. THE CONSEQUENCE. Five taps at ONE coordinate, at a rate a person actually taps. Every one
    //    of them must reach the control the operator is aiming at.
    const restaged = await openSettled(kind);
    if (!restaged?.addButton) {
      addRowResult.push({
        name: `five taps on the ${kind} sheet's add control`,
        pass: false,
        detail: "could not stage: the sheet never reopened",
      });
      continue;
    }
    const TAPS = 5;
    for (let tap = 0; tap < TAPS; tap += 1) {
      await page.touchscreen.tap(restaged.addButton.x, restaged.addButton.y);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(600);
    const after = await page.evaluate(() => window.__addRowProbe());
    const landed = after.rules === TAPS && after.open && after.sheets === 1 && after.scrims === 1;
    addRowResult.push({
      name: `five taps on the ${kind} sheet's add control`,
      pass: landed,
      detail: landed
        ? `all ${TAPS} taps reached it: ${after.rules} rule(s), sheet still open, 1 sheet and 1 backdrop`
        : `${after.rules} of ${TAPS} taps reached it (open: ${after.open}, sheets: ${after.sheets},`
          + ` backdrops: ${after.scrims}) — the rest landed on whatever the moving sheet put under the thumb`,
    });
  }

  // 3. THE CONTROL. Deleting the entrance would pass both checks above and would be wrong: the
  //    sheet is supposed to rise when it OPENS. This is the case that keeps the fix honest, so it
  //    asserts the opposite of the two above on the one path where movement is correct.
  await page.evaluate(() => window.__openAddRowSheetTracked("sort", 500));
  await page.waitForTimeout(600);
  const openTrack = await page.evaluate(() => window.__sheetTrack());
  const openProbe = await page.evaluate(() => window.__addRowProbe());
  const floor = await page.evaluate(() => window.innerHeight);
  const startedBelow = openTrack.length > 0 && Math.max(...openTrack) >= floor - 1;
  const settledAbove = openProbe.panelTop !== null && openProbe.panelTop < floor - 1;
  addRowResult.push({
    name: "a sheet that is genuinely opening still rises",
    pass: startedBelow && settledAbove,
    detail: openTrack.length === 0
      ? "the sheet was never sampled, so this run proves nothing"
      : startedBelow && settledAbove
        ? `the entrance still runs: first seen at ${Math.max(...openTrack).toFixed(0)} on a ${floor}px screen,`
          + ` settled at ${openProbe.panelTop.toFixed(0)}`
        : `the entrance no longer runs on an open (deepest ${Math.max(...openTrack).toFixed(0)},`
          + ` settled ${openProbe.panelTop === null ? "nothing" : openProbe.panelTop.toFixed(0)}, screen ${floor}px)`
          + " — a sheet that appears instantly is not the fix this lane is asking for",
  });

  await page.close();
  for (const error of pageErrors) failures.push(`page error: ${error}`);

  parityResult = await runToolbarRebuildParity(join(work, "parity.html"));
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

console.log(`sheet-rebuild: ${results.length} case(s) rebuilt in headless Chrome, and the toolbar-rebuild case in Chrome and WebKit\n`);
for (const r of results) {
  console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.surface.padEnd(44)} ${r.rebuildShape}`);
  console.log(`        bar before: ${r.barBeforeRebuild}, after: ${r.barAfterRebuild} — ${r.detail}`);
  if (!r.pass) failures.push(`${r.surface}: ${r.detail}`);
}

if (addRowResult) {
  for (const a of addRowResult) {
    console.log(`  ${a.pass ? "PASS" : "FAIL"}  ${a.name.padEnd(44)} real touch`);
    console.log(`        ${a.detail}`);
    if (!a.pass) failures.push(`${a.name}: ${a.detail}`);
  }
} else {
  failures.push("the add-row cases never ran, so an edit inside an open sheet is unmeasured");
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

if (parityResult) {
  for (const p of parityResult) {
    console.log(`  ${p.pass ? "PASS" : "FAIL"}  ${p.name.padEnd(58)} both engines`);
    console.log(`        ${p.detail}`);
    if (!p.pass) failures.push(`${p.name}: ${p.detail}`);
  }
} else {
  failures.push("the two-engine cases never ran, so the sheet is unmeasured in the engine the device uses");
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

const checks = [
  ...results.map(({ surface: name, pass, detail }) => ({
    name,
    pass,
    detail,
    preFixFailure: PRE_FIX_FAILURES.get(name) ?? null,
  })),
  ...dragResult.map(({ name, pass, detail }) => ({
    name,
    pass,
    detail,
    preFixFailure: PRE_FIX_FAILURES.get(name) ?? null,
  })),
  ...addRowResult.map(({ name, pass, detail }) => ({
    name,
    pass,
    detail,
    preFixFailure: PRE_FIX_FAILURES.get(name) ?? null,
  })),
  ...parityResult.map(({ name, pass, detail }) => ({
    name,
    pass,
    detail,
    preFixFailure: PRE_FIX_FAILURES.get(name) ?? null,
  })),
];

stamp(STAMP_PATH, {
  cases: results.length + dragResult.length + addRowResult.length + parityResult.length,
  barsLost: 0,
  gesturesMeasured: dragResult.length,
  enginesMeasured: ["Chrome", "WebKit"],
  checks,
}, [
  "tools/live/sheet-rebuild.mjs",
  "tools/live/sheet-rebuild-harness.ts",
  ...REQUIRED,
]);

console.log(`\nsheet-rebuild: stamped at ${STAMP_PATH}`);
console.log("sheet-rebuild: PASS — every rebuilt sheet still has the bar it opened with");
console.log("  what this does not prove: no Obsidian host is constructed, so the surface is opened");
console.log("  directly rather than through a real toolbar click. A rebuild path reached on a device");
console.log("  by some route not modelled here is not covered — and neither is anything WebKit");
console.log("  paints rather than computes, or anything only a real iOS keyboard produces.");
process.exit(0);
