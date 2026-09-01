// ───────────────────────────────────────────────────────────────────
// MODULE:    drag-probe
// COMPONENT: drives the shipped sheet drag through a real touch stream
// ───────────────────────────────────────────────────────────────────
//
// The drag has been "fixed" three times and reported broken three times. Every
// existing check on it is a string match against the source, and the placement
// harness imports applySheetChrome but never attachSheetDragToDismiss — so no
// check in this repository has ever moved a finger across the grab bar.
//
// This one does. It bundles the shipped modules, loads the shipped stylesheet,
// opens the record sheet through openRecordDetailPanel exactly as the table
// does, then dispatches a genuine touch sequence through the browser's input
// pipeline and reads the panel's computed transform after every move.
//
// Two things it refuses to fake:
//
//   1. setCssProps. Obsidian installs `style.setProperty(name, value)`, which
//      by CSSOM ignores any name that is not a hyphenated CSS property. The
//      repo's harness shim uses `style[name] = value`, which accepts camelCase.
//      A probe on the shim measures declarations the phone never receives, so
//      this file installs the shipped implementation and can run either.
//
//   2. The gesture. Synthesised PointerEvents bypass hit-testing and
//      touch-action entirely, so a hand-dispatched event proves only that the
//      handler is callable. Input.dispatchTouchEvent enters where a thumb does.
//
// Usage: node <this file> [--shim]   (--shim uses the repo shim, for contrast)

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../../../../..", import.meta.url));
const USE_REPO_SHIM = process.argv.includes("--shim");

const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find(existsSync) || process.env.SCREENSHOT_CHROME;

// ───────────────────────────────────────────────────────────────────
// 3. BUNDLE WHAT SHIPS
// ───────────────────────────────────────────────────────────────────

const work = mkdtempSync(join(tmpdir(), "dragprobe-"));
const entry = join(work, "entry.ts");
const bundle = join(work, "bundle.js");

writeFileSync(entry, `
import { positionToolbarPopover } from "${join(REPO, "src/views/popover-position")}";
import { applySheetChrome, attachSheetDragToDismiss } from "${join(REPO, "src/views/mobile-bottom-sheet")}";
import { openRecordDetailPanel, refreshRecordDetailPanel, closeRecordDetailPanel } from "${join(REPO, "src/views/record-detail-panel")}";
import { createOwnedMenu } from "${join(REPO, "src/views/owned-menu")}";
globalThis.__drag = { positionToolbarPopover, applySheetChrome, attachSheetDragToDismiss, openRecordDetailPanel, refreshRecordDetailPanel, closeRecordDetailPanel, createOwnedMenu };
`);

execFileSync(join(REPO, "node_modules/.bin/esbuild"), [
  entry, "--bundle", "--format=iife", `--outfile=${bundle}`,
  `--alias:obsidian=${join(REPO, "tools/storybook/obsidian-stub.mjs")}`,
], { stdio: "pipe" });

const bundleJs = readFileSync(bundle, "utf8");
const shimJs = readFileSync(join(REPO, "tools/storybook/obsidian-dom-shim.mjs"), "utf8")
  .replace(/^export /gm, "");

// The shipped setCssProps, transcribed from the runtime that is actually on the phone:
//   function p(t){var e=this.style;for(var n in t)t.hasOwnProperty(n)&&e.setProperty(n,t[n])}
// Installed after the repo shim so it wins, unless --shim asks for the permissive one.
const productionSetCssProps = `
HTMLElement.prototype.setCssProps = function (props) {
  const style = this.style;
  for (const name in props) {
    if (Object.prototype.hasOwnProperty.call(props, name)) style.setProperty(name, props[name]);
  }
};
`;

// ───────────────────────────────────────────────────────────────────
// 4. THE PAGE — Obsidian's phone workspace
// ───────────────────────────────────────────────────────────────────

const pageHtml = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; }
  .app-container { display: flex; width: 100vw; height: 100vh; }
  .workspace { display: flex; width: 100%; }
  .workspace-split.mod-root { flex: 1 1 auto; position: relative; overflow: hidden; }
  .note-database-container { position: relative; height: 100%; padding: 40px; }
  .workspace-leaf { position: relative; contain: strict !important; overflow: hidden; isolation: isolate; }
  .workspace-leaf, .workspace-leaf-content, .view-content { height: 100%; }
  .app-container.mod-static-nav .workspace { height: calc(100% - 80px); }
  .anchor { width: 120px; height: 28px; background: #ccd; }
</style></head>
<body class="is-phone" style="--safe-area-inset-bottom: 34px; --background-modifier-border: #333333">
  <div class="mobile-navbar" style="position:fixed;left:0;right:0;bottom:0;height:72px;background:#222;z-index:100"></div>
  <div class="app-container mod-static-nav"><div class="workspace">
    <div class="workspace-split mod-root">
      <div class="workspace-leaf"><div class="workspace-leaf-content"><div class="view-content">
      <div class="note-database-container"><div class="anchor" id="anchor"></div></div>
      </div></div></div>
    </div>
  </div></div>
</body></html>`;

// ───────────────────────────────────────────────────────────────────
// 5. HARNESS
// ───────────────────────────────────────────────────────────────────

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
await page.setContent(pageHtml);
await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
if (!USE_REPO_SHIM) await page.addScriptTag({ content: productionSetCssProps });
await page.addScriptTag({ content: bundleJs });

const cdp = await page.context().newCDPSession(page);
const touch = async (type, x, y) => {
  await cdp.send("Input.dispatchTouchEvent", {
    type,
    touchPoints: type === "touchEnd" ? [] : [{ x, y, radiusX: 12, radiusY: 12, force: 1 }],
  });
};

const results = [];
const record = (name, pass, detail) => results.push({ name, pass, detail });

// ── Open the record sheet through the shipped entry point ─────────────
await page.evaluate(() => {
  const { openRecordDetailPanel } = globalThis.__drag;
  globalThis.__log = [];
  for (const type of ["pointerdown", "pointermove", "pointerup", "pointercancel", "lostpointercapture", "touchstart", "touchmove"]) {
    document.addEventListener(type, (e) => {
      globalThis.__log.push({
        type: e.type,
        target: e.target?.className || e.target?.tagName || "?",
        button: e.button,
        pointerType: e.pointerType,
        clientY: Math.round(e.clientY ?? -1),
        defaultPrevented: e.defaultPrevented,
      });
    }, true);
  }
  openRecordDetailPanel({
    anchorEl: document.getElementById("anchor"),
    host: document.querySelector(".note-database-container"),
    row: { file: { path: "33.md", basename: "33", name: "33.md" }, frontmatter: { income: 1 }, computed: {} },
    columns: [
      { key: "file.name", label: "Name", type: "text" },
      { key: "income", label: "Income", type: "number" },
      { key: "status", label: "Status", type: "text" },
    ],
    config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
    app: {},
    actions: { editCell: () => {}, openRow: () => {}, editFileName: () => {}, isReadOnly: false },
  });
});
// The positioner re-measures on the next frame; measure after it settles.
await page.waitForTimeout(120);

// ── 1. GEOMETRY: where the grab band actually answers ────────────────
const geometry = await page.evaluate(() => {
  const panel = document.querySelector(".db-record-detail-panel");
  const handle = panel?.querySelector(".db-mobile-bottom-sheet-handle");
  if (!panel || !handle) return { error: "no panel or no handle", hasPanel: !!panel, hasHandle: !!handle };
  const pr = panel.getBoundingClientRect();
  const hr = handle.getBoundingClientRect();
  const cx = Math.round(pr.left + pr.width / 2);
  // Walk down the sheet's own coordinate space and ask the document who answers.
  const column = [];
  for (let dy = 0; dy <= 60; dy += 1) {
    const el = document.elementFromPoint(cx, Math.round(pr.top) + dy);
    column.push(el === handle ? "H" : panel.contains(el) ? "p" : el ? "x" : "-");
  }
  // And across the full width at the band's vertical middle.
  const bandRows = column.map((c, i) => (c === "H" ? i : -1)).filter((i) => i >= 0);
  const midY = bandRows.length ? Math.round(pr.top) + bandRows[Math.floor(bandRows.length / 2)] : Math.round(hr.top + 2);
  let leftMost = null; let rightMost = null;
  for (let x = Math.round(pr.left); x <= Math.round(pr.right); x += 2) {
    if (document.elementFromPoint(x, midY) === handle) { if (leftMost === null) leftMost = x; rightMost = x; }
  }
  return {
    panel: { top: Math.round(pr.top), bottom: Math.round(pr.bottom), left: Math.round(pr.left), right: Math.round(pr.right), width: Math.round(pr.width), height: Math.round(pr.height) },
    handleBar: { top: Math.round(hr.top), height: Math.round(hr.height), width: Math.round(hr.width) },
    column: column.join(""),
    bandTop: bandRows.length ? bandRows[0] : null,
    bandBottom: bandRows.length ? bandRows[bandRows.length - 1] : null,
    bandHeight: bandRows.length,
    bandLeft: leftMost === null ? null : leftMost - Math.round(pr.left),
    bandRight: rightMost === null ? null : rightMost - Math.round(pr.left),
    bandWidth: leftMost === null ? 0 : rightMost - leftMost,
    midY,
    handleTouchAction: getComputedStyle(handle).touchAction,
    panelTouchAction: getComputedStyle(panel).touchAction,
    panelOverflowY: getComputedStyle(panel).overflowY,
    panelInlineOverflowY: panel.style.overflowY || "(unset)",
    panelInlineBoxSizing: panel.style.boxSizing || "(unset)",
    panelTransformAtRest: getComputedStyle(panel).transform,
    scrimPointerEvents: getComputedStyle(document.querySelector(".db-mobile-sheet-scrim")).pointerEvents,
  };
});
record(
  "the grab band answers presses at the top of the sheet",
  geometry.bandHeight > 0,
  `band occupies y=${geometry.bandTop}..${geometry.bandBottom} of the sheet (${geometry.bandHeight}px tall); hit column from sheet top: ${geometry.column}`,
);
record(
  "the grab band spans the full sheet width",
  geometry.bandWidth >= geometry.panel.width - 4,
  `band x=${geometry.bandLeft}..${geometry.bandRight} of a ${geometry.panel.width}px sheet (${geometry.bandWidth}px wide)`,
);
record(
  "the handle keeps touch-action: none so the browser cannot claim the drag",
  geometry.handleTouchAction === "none",
  `handle touch-action=${geometry.handleTouchAction}, panel touch-action=${geometry.panelTouchAction}`,
);

// ── 2. THE GESTURE: a real thumb, from the very first move ───────────
const startX = Math.round(geometry.panel.left + geometry.panel.width / 2);
const startY = geometry.midY;
const samples = [];
await touch("touchStart", startX, startY);
for (const dy of [1, 2, 4, 8, 16, 32, 64, 95]) {
  await touch("touchMove", startX, startY + dy);
  const t = await page.evaluate(() => {
    const p = document.querySelector(".db-record-detail-panel");
    return p ? { computed: getComputedStyle(p).transform, inline: p.style.transform || "(none)" } : null;
  });
  samples.push({ dy, ...t });
}
const log = await page.evaluate(() => globalThis.__log.slice());
await touch("touchEnd", startX, startY + 95);
await page.waitForTimeout(60);

const translateY = (m) => {
  if (!m || m === "none") return 0;
  const nums = m.match(/matrix(?:3d)?\(([^)]+)\)/);
  if (!nums) return 0;
  const parts = nums[1].split(",").map((n) => parseFloat(n.trim()));
  return parts.length === 6 ? parts[5] : parts[13];
};
const firstMove = samples[0];
const moved = samples.filter((s) => Math.abs(translateY(s.computed) - s.dy) <= 1.5);
record(
  "the sheet follows the finger from the very first movement",
  Math.abs(translateY(firstMove.computed) - firstMove.dy) <= 1.5,
  `after a ${firstMove.dy}px move the panel's computed transform is ${firstMove.computed} (translateY=${translateY(firstMove.computed)}px, want ${firstMove.dy}px); inline=${firstMove.inline}`,
);
record(
  "the sheet tracks the finger 1:1 across the whole drag",
  moved.length === samples.length,
  samples.map((s) => `${s.dy}->${Math.round(translateY(s.computed))}`).join(" "),
);
const downs = log.filter((e) => e.type === "pointerdown");
record(
  "pointerdown reaches the handle with button 0",
  downs.length > 0 && downs[0].target.includes("handle") && downs[0].button === 0,
  downs.length ? `pointerdown target=${downs[0].target} button=${downs[0].button} pointerType=${downs[0].pointerType}` : "no pointerdown observed at all",
);
record(
  "the pointer stream is never cancelled mid-drag",
  !log.some((e) => e.type === "pointercancel"),
  `${log.filter((e) => e.type === "pointermove").length} pointermove, ${log.filter((e) => e.type === "pointercancel").length} pointercancel, ${log.filter((e) => e.type === "lostpointercapture").length} lostpointercapture`,
);

// ── 3. THE REBUILD: does a field commit take the handle away? ────────
const afterRefresh = await page.evaluate(() => {
  const { refreshRecordDetailPanel } = globalThis.__drag;
  refreshRecordDetailPanel({ file: { path: "33.md", basename: "33", name: "33.md" }, frontmatter: { income: 2 }, computed: {} });
  const panel = document.querySelector(".db-record-detail-panel");
  return {
    hasPanel: !!panel,
    hasHandle: !!panel?.querySelector(".db-mobile-bottom-sheet-handle"),
    firstChild: panel?.firstElementChild?.className || "(none)",
  };
});
record(
  "the grab handle survives a field refresh",
  afterRefresh.hasHandle,
  `after refreshRecordDetailPanel the sheet's first child is "${afterRefresh.firstChild}"; handle present=${afterRefresh.hasHandle}`,
);

// A second real drag, after the refresh, is the operator's "barely works" case.
if (afterRefresh.hasPanel) {
  const g2 = await page.evaluate(() => {
    const p = document.querySelector(".db-record-detail-panel");
    const r = p.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top) + 8 };
  });
  await touch("touchStart", g2.x, g2.y);
  await touch("touchMove", g2.x, g2.y + 40);
  const t2 = await page.evaluate(() => getComputedStyle(document.querySelector(".db-record-detail-panel")).transform);
  await touch("touchEnd", g2.x, g2.y + 40);
  record(
    "a drag still works after the sheet has refreshed its fields",
    Math.abs(translateY(t2) - 40) <= 1.5,
    `after a 40px drag on the refreshed sheet, transform=${t2} (translateY=${Math.round(translateY(t2))}px, want 40px)`,
  );
}

// ── 4. THE PROPERTY NAMES the positioner writes ──────────────────────
record(
  "every declaration the positioner writes actually lands on the sheet",
  geometry.panelInlineOverflowY !== "(unset)",
  `positioner asked for overflowY:auto and boxSizing:border-box; the panel's inline style holds overflow-y=${geometry.panelInlineOverflowY}, box-sizing=${geometry.panelInlineBoxSizing} (setCssProps=${USE_REPO_SHIM ? "repo shim" : "shipped"})`,
);

await browser.close();

// ───────────────────────────────────────────────────────────────────
// 6. REPORT
// ───────────────────────────────────────────────────────────────────

console.log(`\ndrag-probe — setCssProps: ${USE_REPO_SHIM ? "REPO SHIM (permissive)" : "SHIPPED (style.setProperty)"}\n`);
for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}\n      ${r.detail}`);
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} passing\n`);
console.log("pointer log:");
for (const e of log.slice(0, 14)) console.log(`  ${e.type} target=${e.target} button=${e.button} type=${e.pointerType} y=${e.clientY}`);
process.exit(failed === 0 ? 0 : 1);
