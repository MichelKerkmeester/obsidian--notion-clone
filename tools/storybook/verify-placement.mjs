// ───────────────────────────────────────────────────────────────────
// MODULE:    verify-placement
// COMPONENT: measures popover geometry against a real Obsidian layout
// ───────────────────────────────────────────────────────────────────
//
// Every other check on the positioner is a string match, because vitest runs
// without a DOM here. String matches cannot answer the question that actually
// matters: does the popover land where a person would want it.
//
// So this builds the workspace Obsidian builds — an app container, a root
// split holding the editor, and a right sidebar beside it — puts the plugin's
// container inside the root split, and runs the shipped positioner against it
// in a real browser. Then it measures the resulting rectangle.
//
// It cannot replace opening Obsidian; the real app has themes, its own CSS,
// and a workspace this only approximates. What it can do is fail when the
// popover slides under the sidebar or renders four times wider than its
// contents, which are the two defects that were reported and are otherwise
// invisible until someone looks.
//
// Usage: node tools/storybook/verify-placement.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SIDEBAR = 300;
const VIEWPORT = { width: 1440, height: 900 };

const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find(existsSync) || process.env.SCREENSHOT_CHROME;

// ───────────────────────────────────────────────────────────────────
// 3. BUNDLE THE SHIPPED POSITIONER
// ───────────────────────────────────────────────────────────────────

const work = mkdtempSync(join(tmpdir(), "placement-"));
const entry = join(work, "entry.ts");
const bundle = join(work, "bundle.js");

// Re-export exactly what ships. Bundling rather than reimplementing is the point: a hand-copied
// positioner would prove the copy.
import { writeFileSync } from "node:fs";
writeFileSync(entry, `
import { positionToolbarPopover, getVisiblePopoverBounds, COMPACT_MENU_POPOVER } from "${join(REPO, "src/views/popover-position")}";
import { applySheetChrome } from "${join(REPO, "src/views/mobile-bottom-sheet")}";
globalThis.__place = { positionToolbarPopover, getVisiblePopoverBounds, COMPACT_MENU_POPOVER, applySheetChrome };
`);

execFileSync(join(REPO, "node_modules/.bin/esbuild"), [
  entry, "--bundle", "--format=iife", `--outfile=${bundle}`,
  `--alias:obsidian=${join(REPO, "tools/storybook/obsidian-stub.mjs")}`,
], { stdio: "pipe" });

const positionerJs = readFileSync(bundle, "utf8");
const shimJs = readFileSync(join(REPO, "tools/storybook/obsidian-dom-shim.mjs"), "utf8")
  .replace(/^export /gm, "");

// ───────────────────────────────────────────────────────────────────
// 4. THE PAGE — Obsidian's workspace shape
// ───────────────────────────────────────────────────────────────────

const page_html = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; }
  .app-container { display: flex; width: 100vw; height: 100vh; }
  .workspace { display: flex; width: 100%; }
  .workspace-split.mod-root { flex: 1 1 auto; position: relative; overflow: hidden; }
  .workspace-split.mod-right-split { width: ${SIDEBAR}px; flex: 0 0 ${SIDEBAR}px; background: #eee; }
  .note-database-container { position: relative; height: 100%; padding: 40px; }
  .anchor { width: 120px; height: 28px; background: #ccd; }
  .panel { position: absolute; background: #fff; border: 1px solid #999; }
  .panel .row { height: 30px; }
</style></head><body>
  <div class="app-container"><div class="workspace">
    <div class="workspace-split mod-root">
      <div class="note-database-container"><div class="anchor" id="anchor"></div></div>
    </div>
    <div class="workspace-split mod-right-split"></div>
  </div></div>
</body></html>`;

// ───────────────────────────────────────────────────────────────────
// 5. MEASURE
// ───────────────────────────────────────────────────────────────────

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: VIEWPORT });
await page.setContent(page_html);
// The desktop checks used to run against a page with no stylesheet, so they measured a document
// that does not contain the cascade the defects live in — the same structural blindness as
// wrapping a story in the one container that supplies its tokens. Every desktop number taken
// before this line was loaded described a rendering nobody ships.
await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await page.addScriptTag({ content: positionerJs });

const results = await page.evaluate(({ sidebar }) => {
  const out = [];
  const { positionToolbarPopover, getVisiblePopoverBounds, COMPACT_MENU_POPOVER } = globalThis.__place;
  const container = document.querySelector(".note-database-container");
  const rootSplit = document.querySelector(".workspace-split.mod-root");

  const build = (rows) => {
    const p = container.createDiv({ cls: "panel" });
    for (let i = 0; i < rows; i += 1) p.createDiv({ cls: "row", text: `Item ${i}` });
    return p;
  };

  const split = rootSplit.getBoundingClientRect();

  // 1. The clamp target, isolated.
  //
  // Passing a container does NOT test this: bounds are the intersection of viewport, app element
  // and container, and a container living inside the root split constrains the result on its own —
  // so the check passes even with the clamp reverted, which is exactly what an earlier version of
  // this file did. Null is the honest input, and it is what owned menus actually pass.
  const bounds = getVisiblePopoverBounds(null);
  out.push({
    name: "clamp target is the editing area, not the window (container=null)",
    pass: Math.round(bounds.right) <= Math.round(split.right) + 1,
    detail: `bounds.right=${Math.round(bounds.right)} rootSplit.right=${Math.round(split.right)} window=${window.innerWidth}`,
  });

  // 2. With a container, the intersection must still hold.
  const withContainer = getVisiblePopoverBounds(container);
  out.push({
    name: "container-scoped bounds stay within the editing area",
    pass: Math.round(withContainer.right) <= Math.round(split.right) + 1,
    detail: `bounds.right=${Math.round(withContainer.right)}`,
  });

  // 2. A compact menu must not be pushed to the default 520.
  const compact = build(5);
  positionToolbarPopover(compact, document.getElementById("anchor"), COMPACT_MENU_POPOVER);
  const cr = compact.getBoundingClientRect();
  out.push({
    name: "compact preset stays narrow",
    pass: cr.width <= 320 && cr.width >= 220,
    detail: `width=${Math.round(cr.width)}px (preset 220..320, default would be 520)`,
  });

  // 3. It must sit inside the editing area, never under the sidebar.
  out.push({
    name: "compact menu clears the sidebar",
    pass: Math.round(cr.right) <= Math.round(split.right) + 1,
    detail: `panel.right=${Math.round(cr.right)} sidebar starts at ${Math.round(split.right)}`,
  });
  compact.remove();

  // 4. A caller that states no width must not be handed an absurd one.
  //
  // This assertion used to require the opposite — that a widthless caller render WIDER than 320px —
  // and it was green, and it ran on every push. It certified the defect: a four-item menu rendered
  // at the 520px default, and any fix would have turned the pipeline red. The cheapest response to
  // a red pipeline is to revert the fix, which is how a check like this quietly defends a bug.
  //
  // It now asserts the behaviour we want, so it is EXPECTED TO FAIL until the width policy lands.
  // A red result here is the check working. Do not "fix" it by widening the threshold.
  const wide = build(5);
  positionToolbarPopover(wide, document.getElementById("anchor"), {});
  const wr = wide.getBoundingClientRect();
  out.push({
    name: "widthless caller is not handed an absurd default width",
    pass: wr.width <= 320,
    detail: `width=${Math.round(wr.width)}px (want <=320; the 520 default is the defect)`,
  });
  out.push({
    name: "even the wide default clears the sidebar",
    pass: Math.round(wr.right) <= Math.round(split.right) + 1,
    detail: `panel.right=${Math.round(wr.right)} sidebar starts at ${Math.round(split.right)}`,
  });
  wide.remove();

  // 5. An anchor near the right edge must flip rather than overflow.
  const anchor = document.getElementById("anchor");
  anchor.style.marginLeft = `${split.width - 200}px`;
  const edge = build(5);
  positionToolbarPopover(edge, anchor, COMPACT_MENU_POPOVER);
  const er = edge.getBoundingClientRect();
  out.push({
    name: "anchored at the right edge, stays inside",
    pass: Math.round(er.right) <= Math.round(split.right) + 1 && er.left >= split.left - 1,
    detail: `panel=[${Math.round(er.left)}..${Math.round(er.right)}] split=[${Math.round(split.left)}..${Math.round(split.right)}]`,
  });
  edge.remove();

  // 6. A tall menu must be capped, not run off the bottom.
  anchor.style.marginLeft = "0px";
  const tall = build(60);
  positionToolbarPopover(tall, anchor, COMPACT_MENU_POPOVER);
  const tr = tall.getBoundingClientRect();
  out.push({
    name: "tall menu is capped within the viewport",
    pass: Math.round(tr.bottom) <= window.innerHeight + 1,
    detail: `panel.bottom=${Math.round(tr.bottom)} viewport=${window.innerHeight}`,
  });
  tall.remove();

  return out;
}, { sidebar: SIDEBAR });

await page.close();

// ───────────────────────────────────────────────────────────────────
// 5b. PHONE — the sheet presentation
// ───────────────────────────────────────────────────────────────────

const phone = await browser.newPage({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
// Obsidian draws a fixed bottom navigation bar on a phone. No harness contained one, so the
// positioner's phone branch always fell back to a hardcoded 50px and the harness agreed with the
// device for the wrong reason. A safe-area inset is supplied for the same reason.
const phoneBody = '<body class="is-phone" style="--safe-area-inset-bottom: 34px">'
  + '<div class="mobile-navbar" style="position:fixed;left:0;right:0;bottom:0;height:72px;'
  + 'background:#222;z-index:100"></div>';
await phone.setContent(page_html.replace("<body>", phoneBody));
await phone.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await phone.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await phone.addScriptTag({ content: positionerJs });

const phoneResults = await phone.evaluate(() => {
  const out = [];
  const { applySheetChrome, positionToolbarPopover, getVisiblePopoverBounds } = globalThis.__place;

  // Drive the positioner, not only the chrome helper.
  //
  // The phone checks used to call applySheetChrome alone, which toggles a class and adds a grab
  // handle. The offset arithmetic that reads the navbar lives in the positioner, so it was never
  // executed here — which is why adding a navbar to the page changed no asserted number and the
  // harness agreed with the device for the wrong reason.
  const anchoredHost = document.body.createDiv({ cls: "note-database-container" });
  const anchor = anchoredHost.createDiv({ cls: "anchor" });
  const anchored = anchoredHost.createDiv({ cls: "panel" });
  for (let i = 0; i < 6; i += 1) anchored.createDiv({ cls: "row", text: `Row ${i}` });
  positionToolbarPopover(anchored, anchor, {});
  const bounds = getVisiblePopoverBounds(null);
  const navbar = document.querySelector(".mobile-navbar");
  const navRect = navbar ? navbar.getBoundingClientRect() : null;

  // The bound must be derived from the navbar that is actually on the page, not from the
  // positioner's hardcoded fallback. The harness navbar is deliberately 72px: a height close to
  // that fallback makes present and absent produce nearly the same number, which is a check that
  // cannot tell the two apart while appearing to pass.
  // The current branch subtracts BOTH the navbar height and the safe-area inset, so the expected
  // bound is viewport - navbar - inset. Asserting the navbar alone was wrong about the code, which
  // is worth recording: the harness caught a naive assertion before it could certify anything.
  //
  // This measures the behaviour as it stands today. A later phase deletes this subtraction outright,
  // because the sheet is supposed to COVER the navbar rather than avoid it; when that lands, this
  // expectation changes with it and the change should be deliberate and visible here.
  const inset = parseFloat(
    getComputedStyle(document.body).getPropertyValue("--safe-area-inset-bottom") || "0",
  ) || 0;
  const expected = navRect ? window.innerHeight - navRect.height - inset : null;
  const fallbackBound = window.innerHeight - 50;
  out.push({
    name: "phone bounds are derived from the navbar on the page, not the hardcoded fallback",
    pass: expected !== null && Math.abs(bounds.bottom - expected) <= 1,
    detail: navRect
      ? `bounds.bottom=${Math.round(bounds.bottom)} expected=${Math.round(expected)} `
        + `(viewport ${window.innerHeight} - navbar ${Math.round(navRect.height)} - inset ${inset}); `
        + `a fallback-derived bound would sit near ${fallbackBound}`
      : "no .mobile-navbar in the page — the harness cannot observe this at all",
  });
  anchoredHost.remove();
  const panel = document.body.createDiv({ cls: "note-database-container" });
  for (let i = 0; i < 40; i += 1) panel.createDiv({ text: `Row ${i}` });

  applySheetChrome(panel, true);
  const r = panel.getBoundingClientRect();
  const style = getComputedStyle(panel);

  out.push({
    name: "sheet docks to the bottom of the screen",
    pass: Math.abs(r.bottom - window.innerHeight) <= 1,
    detail: `panel.bottom=${Math.round(r.bottom)} viewport=${window.innerHeight}`,
  });
  out.push({
    name: "sheet spans the full width",
    pass: Math.round(r.width) >= window.innerWidth - 1,
    detail: `width=${Math.round(r.width)} viewport=${window.innerWidth}`,
  });
  out.push({
    name: "sheet height is capped, not full-screen",
    pass: r.height <= window.innerHeight * 0.9 + 2,
    detail: `height=${Math.round(r.height)} cap=${Math.round(window.innerHeight * 0.9)} (90svh)`,
  });
  out.push({
    name: "sheet declares a max-height rather than relying on content",
    pass: /svh|vh|px/.test(style.maxHeight) && style.maxHeight !== "none",
    detail: `max-height: ${style.maxHeight}`,
  });

  // Chrome off again must not leave the surface stuck bottom-docked.
  applySheetChrome(panel, false);
  const after = getComputedStyle(panel);
  out.push({
    name: "chrome is reversible (desktop presentation restored)",
    pass: after.position !== "fixed" || after.bottom === "auto",
    detail: `position=${after.position} bottom=${after.bottom}`,
  });
  return out;
});

results.push(...phoneResults);
await browser.close();
rmSync(work, { recursive: true, force: true });

// ───────────────────────────────────────────────────────────────────
// 6. REPORT
// ───────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.name}\n        ${r.detail}`);
}
console.log(`\nverify-placement: ${results.length - failed.length}/${results.length} geometry checks passed`);
process.exit(failed.length ? 1 : 0);
