// ───────────────────────────────────────────────────────────────────
// MODULE:    run-phone-toolbar-scroll
// COMPONENT: drives the full phone toolbar's labelled-row measurement in real Chrome
// ───────────────────────────────────────────────────────────────────
//
// Bundles phone-toolbar-scroll.ts against the real ToolbarRenderer and runs it in the
// same headless Chrome the other live harnesses use, at a fixed 402px viewport — the
// width the packet's acceptance criterion names. The bundle lives in a temp directory
// and is removed when done, matching run-toolbar-collapse-sweep.mjs's own build.
//
// Usage: node tools/live/run-phone-toolbar-scroll.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import esbuild from "esbuild";
import { chromium } from "playwright-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const VIEWPORT_WIDTH = 402;

// ───────────────────────────────────────────────────────────────────
// 2. BUNDLE
// ───────────────────────────────────────────────────────────────────

const obsidianStubPlugin = {
  name: "obsidian-stub",
  setup(build) {
    build.onResolve({ filter: /^obsidian$/ }, () => ({
      path: resolve(REPO, "tools/storybook/obsidian-stub.mjs"),
    }));
  },
};

const work = mkdtempSync(join(tmpdir(), "phone-toolbar-scroll-"));
const entry = join(work, "measure-entry.ts");
const bundlePath = join(work, "measure-bundle.js");

writeFileSync(entry, `
import { installObsidianDomShim } from "${resolve(REPO, "tools/storybook/obsidian-dom-shim.mjs")}";
import { measurePhoneToolbarScroll } from "${resolve(HERE, "phone-toolbar-scroll")}";
installObsidianDomShim(window);
window.__measurePhoneToolbarScroll = () => measurePhoneToolbarScroll(document.body);
`);

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  outfile: bundlePath,
  plugins: [obsidianStubPlugin],
  logLevel: "warning",
  absWorkingDir: REPO,
});

// Playwright's `isMobile` emulation defaults to the classic 980px layout viewport absent a
// `<meta name="viewport">` tag — the same fallback a real mobile browser applies to a page that
// never declares one. Without this tag the page measured a 976-980px-wide row regardless of the
// requested viewport, which is not what any phone renders; the meta tag is what makes the 402px
// viewport this runner opens the actual CSS layout viewport, matching a real device.
writeFileSync(join(work, "measure.html"), `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="file://${REPO}/styles.css"></head>
<body class="theme-dark"><script src="measure-bundle.js"></script></body></html>`);

// ───────────────────────────────────────────────────────────────────
// 3. RUN
// ───────────────────────────────────────────────────────────────────

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  for (const candidate of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ]) if (existsSync(candidate)) return candidate;
  throw new Error("No Chrome found. Set SCREENSHOT_CHROME to a Chrome or Chromium binary.");
}

const browser = await chromium.launch({ executablePath: findChrome() });
let reading;
let pageError = null;
try {
  const page = await browser.newPage({
    viewport: { width: VIEWPORT_WIDTH, height: 860 },
    hasTouch: true,
    isMobile: true,
  });
  page.on("pageerror", (error) => { pageError = error; });
  await page.goto(`file://${join(work, "measure.html")}`);
  reading = await page.evaluate(() => window.__measurePhoneToolbarScroll());
  await page.close();
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}

if (pageError) {
  console.error(`phone-toolbar-scroll: the measurement threw in the page — ${pageError.message}`);
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────
// 4. REPORT
// ───────────────────────────────────────────────────────────────────

console.log(`\n=== phone toolbar labelled row, ${VIEWPORT_WIDTH}px viewport ===`);
console.log(`  Row height:              ${reading.rowHeight}px`);
console.log(`  Single line:             ${reading.singleLine}`);
console.log(`  scrollWidth / clientWidth: ${reading.scrollWidth} / ${reading.clientWidth}`);
console.log(`  Overflows horizontally:  ${reading.overflowsHorizontally}`);
console.log(`  Last control reachable:  ${reading.lastControlReachable}`);
console.log(`  Every control labelled:  ${reading.everyControlLabelled}`);
console.log(`  Every control >= 44px:   ${reading.everyControlAtLeast44}`);
console.log(`  Scrollbar hidden:        ${reading.scrollbarWidthNone}`);
console.log(`  Vertical overflow:       ${reading.verticalOverflowPx}px`);
console.log(`  overflow-y / touch-action: ${reading.overflowYComputed} / ${reading.touchActionComputed}`);
console.log(`  overscroll-behavior-x:   ${reading.overscrollBehaviorXComputed}`);
console.log(`  scrollTop after forced 40px: ${reading.scrollTopAfterProgrammatic}`);
console.log(`  Every control inside strip: ${reading.everyControlInsideStrip}`);

let failed = false;

if (!reading.everyControlLabelled) {
  failed = true;
  console.error(`\nFAIL — controls missing a visible label: ${reading.missingLabels.join(" | ") || "(none reported)"}`);
}

if (!reading.singleLine) {
  failed = true;
  console.error("\nFAIL — the row is not a single line; a control wrapped to a second line instead of scrolling.");
}

if (!reading.overflowsHorizontally) {
  failed = true;
  console.error(`\nFAIL — the labelled row does not overflow at ${VIEWPORT_WIDTH}px (scrollWidth ${reading.scrollWidth} <= clientWidth ${reading.clientWidth}); the scroll behaviour this lane exists to prove never engages.`);
}

if (!reading.lastControlReachable) {
  failed = true;
  console.error("\nFAIL — the last control is not reachable by scrolling to the row's end.");
}

if (!reading.everyControlAtLeast44) {
  failed = true;
  console.error(`\nFAIL — control(s) under the 44px floor: ${JSON.stringify(reading.shortControls)}`);
}

if (!reading.scrollbarWidthNone) {
  failed = true;
  console.error("\nFAIL — the row's scrollbar is not hidden (scrollbarWidth !== none), against the existing edge-only scrollbar ruling.");
}

if (reading.verticalOverflowPx !== 0) {
  failed = true;
  console.error(`\nFAIL — the strip is taller inside than it renders: scrollHeight - clientHeight = ${reading.verticalOverflowPx}px, so its bottom edge clips the controls instead of sizing to them.`);
}

if (reading.overflowYComputed !== "hidden") {
  failed = true;
  console.error(`\nFAIL — computed overflow-y is ${reading.overflowYComputed}, not hidden; the strip is a two-axis scroller.`);
}

if (!reading.touchActionComputed.includes("pan-x") || reading.touchActionComputed.includes("pan-y")) {
  failed = true;
  console.error(`\nFAIL — computed touch-action is ${reading.touchActionComputed}; a vertical gesture on the strip is the strip's to move, not the page's.`);
}

if (reading.overscrollBehaviorXComputed !== "contain") {
  failed = true;
  console.error(`\nFAIL — computed overscroll-behavior-x is ${reading.overscrollBehaviorXComputed}, not contain; the strip's horizontal pan chains into the page's own scroll.`);
}

if (reading.scrollTopAfterProgrammatic !== 0) {
  failed = true;
  console.error(`\nFAIL — forcing the strip 40px down reads back scrollTop ${reading.scrollTopAfterProgrammatic}; the horizontal strip moves vertically.`);
}

if (!reading.everyControlInsideStrip) {
  failed = true;
  console.error(`\nFAIL — control(s) clipped by the strip's box: ${reading.controlsOutsideStrip.join(" | ") || "(none reported)"}`);
}

if (failed) process.exit(1);

console.log("\nphone-toolbar-scroll: PASS — single-line labelled row, scrolls horizontally, last control reachable, every control >= 44px, scrollbar hidden");
