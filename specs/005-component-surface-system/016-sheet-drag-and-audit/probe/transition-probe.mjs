// ───────────────────────────────────────────────────────────────────
// MODULE:    transition-probe
// COMPONENT: reads what the sheet's transform is actually doing under a finger
// ───────────────────────────────────────────────────────────────────
//
// drag-probe showed the sheet tracking the first few pixels and then falling
// behind the finger. Two mechanisms produce that shape and they need opposite
// fixes, so this separates them:
//
//   a) the 120ms transform transition on .db-overlay-enter is still live
//      during the drag, so every move is animated toward the finger instead of
//      landing on it, or
//   b) the reads are racing the input pipeline and the drag is fine.
//
// It answers by sampling inside the page — from a pointermove listener and the
// frame after it — so no CDP round trip sits between the event and the number.

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
const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
].find(existsSync) || process.env.SCREENSHOT_CHROME;

// ───────────────────────────────────────────────────────────────────
// 3. BUNDLE
// ───────────────────────────────────────────────────────────────────

const work = mkdtempSync(join(tmpdir(), "transprobe-"));
const entry = join(work, "entry.ts");
const bundle = join(work, "bundle.js");
writeFileSync(entry, `
import { openRecordDetailPanel } from "${join(REPO, "src/views/record-detail-panel")}";
globalThis.__drag = { openRecordDetailPanel };
`);
execFileSync(join(REPO, "node_modules/.bin/esbuild"), [
  entry, "--bundle", "--format=iife", `--outfile=${bundle}`,
  `--alias:obsidian=${join(REPO, "tools/storybook/obsidian-stub.mjs")}`,
], { stdio: "pipe" });

const bundleJs = readFileSync(bundle, "utf8");
const shimJs = readFileSync(join(REPO, "tools/storybook/obsidian-dom-shim.mjs"), "utf8").replace(/^export /gm, "");
const productionSetCssProps = `
HTMLElement.prototype.setCssProps = function (props) {
  const style = this.style;
  for (const name in props) {
    if (Object.prototype.hasOwnProperty.call(props, name)) style.setProperty(name, props[name]);
  }
};
`;

const pageHtml = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; } body { margin: 0; }
  .app-container { display: flex; width: 100vw; height: 100vh; }
  .workspace { display: flex; width: 100%; }
  .workspace-split.mod-root { flex: 1 1 auto; position: relative; overflow: hidden; }
  .note-database-container { position: relative; height: 100%; padding: 40px; }
  .workspace-leaf { position: relative; contain: strict !important; overflow: hidden; isolation: isolate; }
  .workspace-leaf, .workspace-leaf-content, .view-content { height: 100%; }
  .anchor { width: 120px; height: 28px; background: #ccd; }
</style></head>
<body class="is-phone" style="--safe-area-inset-bottom: 34px; --background-modifier-border: #333333">
  <div class="app-container"><div class="workspace"><div class="workspace-split mod-root">
    <div class="workspace-leaf"><div class="workspace-leaf-content"><div class="view-content">
    <div class="note-database-container"><div class="anchor" id="anchor"></div></div>
    </div></div></div>
  </div></div></div>
</body></html>`;

// ───────────────────────────────────────────────────────────────────
// 4. MEASURE
// ───────────────────────────────────────────────────────────────────

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
await page.setContent(pageHtml);
await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await page.addScriptTag({ content: productionSetCssProps });
await page.addScriptTag({ content: bundleJs });

await page.evaluate(() => {
  globalThis.__drag.openRecordDetailPanel({
    anchorEl: document.getElementById("anchor"),
    host: document.querySelector(".note-database-container"),
    row: { file: { path: "33.md", basename: "33", name: "33.md" }, frontmatter: { income: 1 }, computed: {} },
    columns: [{ key: "file.name", label: "Name", type: "text" }, { key: "income", label: "Income", type: "number" }],
    config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
    app: {},
    actions: { editCell: () => {}, openRow: () => {}, editFileName: () => {}, isReadOnly: false },
  });
});
await page.waitForTimeout(300);

// Sample from inside the page: on each pointermove, read the transform now and on the next frame.
await page.evaluate(() => {
  const panel = document.querySelector(".db-record-detail-panel");
  const handle = panel.querySelector(".db-mobile-bottom-sheet-handle");
  globalThis.__s = [];
  const cs = () => getComputedStyle(panel);
  handle.addEventListener("pointerdown", () => {
    globalThis.__s.push({
      at: "pointerdown(after production handler)",
      inlineTransition: panel.style.transition || "(none)",
      computedDuration: cs().transitionDuration,
      computedProperty: cs().transitionProperty,
    });
  });
  handle.addEventListener("pointermove", (e) => {
    const now = cs().transform;
    globalThis.__s.push({ at: `move y=${Math.round(e.clientY)}`, sync: now, inlineTransform: panel.style.transform || "(none)", inlineTransition: panel.style.transition || "(none)", duration: cs().transitionDuration });
  });
});

const start = await page.evaluate(() => {
  const p = document.querySelector(".db-record-detail-panel").getBoundingClientRect();
  return { x: Math.round(p.left + p.width / 2), y: Math.round(p.top) + 16, top: Math.round(p.top) };
});

const cdp = await page.context().newCDPSession(page);
const touch = (type, x, y) => cdp.send("Input.dispatchTouchEvent", {
  type, touchPoints: type === "touchEnd" ? [] : [{ x, y, radiusX: 12, radiusY: 12, force: 1 }],
});

await touch("touchStart", start.x, start.y);
// One big move, the operator's "initial drag": thumb travels 60px in one go.
await touch("touchMove", start.x, start.y + 60);
const immediately = await page.evaluate(() => getComputedStyle(document.querySelector(".db-record-detail-panel")).transform);
await page.waitForTimeout(250); // well past a 120ms transition
const settled = await page.evaluate(() => getComputedStyle(document.querySelector(".db-record-detail-panel")).transform);
const samples = await page.evaluate(() => globalThis.__s.slice());
await touch("touchEnd", start.x, start.y + 60);
await browser.close();

const ty = (m) => {
  if (!m || m === "none") return 0;
  const g = m.match(/matrix(?:3d)?\(([^)]+)\)/);
  if (!g) return 0;
  const p = g[1].split(",").map((n) => parseFloat(n.trim()));
  return p.length === 6 ? p[5] : p[13];
};

console.log("\ntransition-probe — one 60px drag, sampled inside the page\n");
for (const s of samples) console.log(" ", JSON.stringify(s));
console.log(`\n  transform immediately after the move : ${immediately}  (translateY=${ty(immediately).toFixed(2)}px)`);
console.log(`  transform 250ms later                : ${settled}  (translateY=${ty(settled).toFixed(2)}px)`);
console.log(`\n  finger moved 60px.`);
console.log(`  VERDICT: the sheet ${Math.abs(ty(immediately) - 60) <= 1 ? "lands on the finger immediately" : `lags the finger by ${(60 - ty(immediately)).toFixed(1)}px at the moment of the move`}.`);
