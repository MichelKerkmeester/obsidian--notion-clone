// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-audit
// COMPONENT: measures the operator's eight sheet asks against the shipped code
// ───────────────────────────────────────────────────────────────────
//
// The eight asks were fixed across several phases by several agents and never
// checked together. This checks them together, and it checks them the only way
// that has ever caught anything here: by running the shipped functions.
//
// Two rules it keeps:
//
//   * Nothing is hand-written markup. Every surface is produced by the code
//     that produces it on the phone — openRecordDetailPanel, createOwnedMenu,
//     applySheetChrome — so a check cannot pass against a rendering nobody
//     ships. The ~204 screenshot captures do the opposite, which is how three
//     green sheet checks accompanied two broken releases.
//
//   * setCssProps is the shipped one. Obsidian installs
//     `style.setProperty(name, value)`, which by CSSOM drops any name that is
//     not hyphenated. The repo shim assigns `style[name]`, which accepts
//     camelCase — so the shim applies declarations the phone never receives.
//
// Usage: node <this file>

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

// Every surface that carries its own desktop background and can become a sheet.
// The single-fill rule is the last background declaration in the stylesheet, so
// anything with `!important` or a heavier selector still wins over it.
const SHEET_SURFACES = [
  "db-record-detail-panel",
  "db-owned-menu",
  "db-dropdown-popover",
  "db-cell-option-popover",
  "db-cell-edit-popover",
  "db-date-value-popover",
  "db-icon-picker-popover",
  "db-color-picker-popup",
  "db-relation-popover",
];

// ───────────────────────────────────────────────────────────────────
// 3. BUNDLE WHAT SHIPS
// ───────────────────────────────────────────────────────────────────

const work = mkdtempSync(join(tmpdir(), "sheetaudit-"));
const entry = join(work, "entry.ts");
const bundle = join(work, "bundle.js");
writeFileSync(entry, `
import { positionToolbarPopover, placeSheet } from "${join(REPO, "src/views/popover-position")}";
import { applySheetChrome, attachSheetDragToDismiss } from "${join(REPO, "src/views/mobile-bottom-sheet")}";
import { openRecordDetailPanel, refreshRecordDetailPanel, closeRecordDetailPanel } from "${join(REPO, "src/views/record-detail-panel")}";
import { createOwnedMenu } from "${join(REPO, "src/views/owned-menu")}";
import { createMenuRow } from "${join(REPO, "src/views/menu-row")}";
globalThis.__a = { positionToolbarPopover, placeSheet, applySheetChrome, attachSheetDragToDismiss, openRecordDetailPanel, refreshRecordDetailPanel, closeRecordDetailPanel, createOwnedMenu, createMenuRow };
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
  .app-container.mod-static-nav .workspace { height: calc(100% - 80px); }
  .anchor { width: 120px; height: 28px; background: #ccd; }
</style></head>
<body class="is-phone theme-light" style="--safe-area-inset-bottom: 34px; --background-modifier-border: #333333; --background-primary: #ffffff">
  <div class="mobile-navbar" style="position:fixed;left:0;right:0;bottom:0;height:72px;background:#222;z-index:100"></div>
  <div class="app-container mod-static-nav"><div class="workspace"><div class="workspace-split mod-root">
    <div class="workspace-leaf"><div class="workspace-leaf-content"><div class="view-content">
    <div class="note-database-container"><div class="anchor" id="anchor"></div></div>
    </div></div></div>
  </div></div></div>
</body></html>`;

// ───────────────────────────────────────────────────────────────────
// 4. HARNESS
// ───────────────────────────────────────────────────────────────────

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
await page.setContent(pageHtml);
await page.addStyleTag({ content: readFileSync(join(REPO, "styles.css"), "utf8") });
await page.addScriptTag({ content: shimJs + "\ninstallObsidianDomShim(globalThis);" });
await page.addScriptTag({ content: productionSetCssProps });
await page.addScriptTag({ content: bundleJs });

const cdp = await page.context().newCDPSession(page);
const touch = (type, x, y) => cdp.send("Input.dispatchTouchEvent", {
  type, touchPoints: type === "touchEnd" ? [] : [{ x, y, radiusX: 12, radiusY: 12, force: 1 }],
});

const results = [];
const record = (ask, name, pass, detail) => results.push({ ask, name, pass, detail });

const openSheet = () => page.evaluate(() => {
  globalThis.__a.closeRecordDetailPanel();
  globalThis.__a.openRecordDetailPanel({
    anchorEl: document.getElementById("anchor"),
    host: document.querySelector(".note-database-container"),
    row: { file: { path: "33.md", basename: "Quarterly review", name: "33.md" }, frontmatter: { income: 1200, status: "Active", owner: "Michel" }, computed: {} },
    columns: [
      { key: "file.name", label: "Name", type: "text" },
      { key: "income", label: "Income", type: "number" },
      { key: "status", label: "Status", type: "text" },
      { key: "owner", label: "Owner", type: "text" },
    ],
    config: { viewType: "table", schema: { computedFields: [] }, titleField: "file.name" },
    app: {},
    actions: { editCell: () => {}, openRow: () => {}, editFileName: () => {}, isReadOnly: false },
  });
});

await openSheet();
await page.waitForTimeout(250);

// ── ASK 1 — the drag ──────────────────────────────────────────────────
const geom = await page.evaluate(() => {
  const panel = document.querySelector(".db-record-detail-panel");
  const handle = panel.querySelector(".db-mobile-bottom-sheet-handle");
  const pr = panel.getBoundingClientRect();
  const cx = Math.round(pr.left + pr.width / 2);
  const rows = [];
  for (let dy = 0; dy <= 70; dy += 1) if (document.elementFromPoint(cx, Math.round(pr.top) + dy) === handle) rows.push(dy);
  let l = null; let r = null;
  const midY = Math.round(pr.top) + rows[Math.floor(rows.length / 2)];
  for (let x = Math.round(pr.left); x <= Math.round(pr.right); x += 1) {
    if (document.elementFromPoint(x, midY) === handle) { if (l === null) l = x; r = x; }
  }
  return {
    panelTop: Math.round(pr.top), panelLeft: Math.round(pr.left), panelWidth: Math.round(pr.width),
    bandTop: rows[0], bandBottom: rows[rows.length - 1], bandRows: rows.length,
    bandLeft: l - Math.round(pr.left), bandRight: r - Math.round(pr.left), bandWidth: r - l + 1,
    midY, cx,
  };
});

const dragOnce = async (x, y, dy) => {
  await touch("touchStart", x, y);
  await touch("touchMove", x, y + dy);
  await page.waitForTimeout(160); // outlive the 120ms overlay transition before reading
  const t = await page.evaluate(() => {
    const p = document.querySelector(".db-record-detail-panel");
    return p ? getComputedStyle(p).transform : "gone";
  });
  await touch("touchEnd", x, y + dy);
  await page.waitForTimeout(200);
  return t;
};
const ty = (m) => {
  if (!m || m === "none" || m === "gone") return 0;
  const g = m.match(/matrix(?:3d)?\(([^)]+)\)/);
  if (!g) return 0;
  const p = g[1].split(",").map((n) => parseFloat(n.trim()));
  return p.length === 6 ? p[5] : p[13];
};

const freshDrag = await dragOnce(geom.cx, geom.midY, 60);
record(1, "a fresh sheet follows the finger 1:1", Math.abs(ty(freshDrag) - 60) <= 1,
  `60px drag on a just-opened sheet moved it ${ty(freshDrag).toFixed(1)}px`);

// The operator's case: the view re-renders while the sheet is open, which every
// edit, metadata resolve and computed sync does.
const afterRefresh = await page.evaluate(() => {
  globalThis.__a.refreshRecordDetailPanel({ file: { path: "33.md", basename: "Quarterly review", name: "33.md" }, frontmatter: { income: 1300, status: "Active", owner: "Michel" }, computed: {} });
  const panel = document.querySelector(".db-record-detail-panel");
  return { hasHandle: !!panel.querySelector(".db-mobile-bottom-sheet-handle"), firstChild: panel.firstElementChild?.className || "(none)" };
});
record(1, "the grab bar survives a view re-render", afterRefresh.hasHandle,
  `after one refresh the sheet's first child is "${afterRefresh.firstChild}"; grab bar present=${afterRefresh.hasHandle}`);

const staleDrag = await dragOnce(geom.cx, geom.midY, 60);
record(1, "a re-rendered sheet still follows the finger 1:1", Math.abs(ty(staleDrag) - 60) <= 1,
  `60px drag after a re-render moved it ${ty(staleDrag).toFixed(1)}px`);

// ── ASK 2 — header actions aligned, 44x44 ─────────────────────────────
await openSheet();
await page.waitForTimeout(200);
const header = await page.evaluate(() => {
  const panel = document.querySelector(".db-record-detail-panel");
  const open = panel.querySelector(".db-board-card-open");
  const close = panel.querySelector(".db-cell-edit-close");
  const box = (el) => { const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(1), h: +r.height.toFixed(1), cy: +(r.top + r.height / 2).toFixed(1), top: +r.top.toFixed(1), right: +r.right.toFixed(1) }; };
  return { open: box(open), close: box(close) };
});
record(2, "expand and close are both 44x44 on the record sheet",
  header.open.w >= 44 && header.open.h >= 44 && header.close.w >= 44 && header.close.h >= 44,
  `expand ${header.open.w}x${header.open.h}, close ${header.close.w}x${header.close.h}`);
record(2, "expand and close share one centre line",
  Math.abs(header.open.cy - header.close.cy) <= 0.5,
  `centres differ by ${Math.abs(header.open.cy - header.close.cy).toFixed(2)}px (expand cy=${header.open.cy}, close cy=${header.close.cy})`);

// ── ASK 3 — Notion-like rows: no gap, bigger text, a divider ──────────
const rows = await page.evaluate(() => {
  const panel = document.querySelector(".db-record-detail-panel");
  const fields = panel.querySelectorAll(".db-record-detail-field");
  const list = panel.querySelector(".db-record-detail-fields");
  const a = fields[0].getBoundingClientRect();
  const b = fields[1].getBoundingClientRect();
  const label = fields[0].querySelector(".db-record-detail-field-label");
  const value = fields[0].querySelector(".db-board-card-value");
  const cs = (el) => getComputedStyle(el);
  return {
    count: fields.length,
    gap: +(b.top - a.bottom).toFixed(2),
    listGap: cs(list).rowGap,
    labelSize: cs(label).fontSize,
    valueSize: value ? cs(value).fontSize : "(none)",
    dividerWidth: cs(fields[0]).borderBottomWidth,
    dividerColor: cs(fields[0]).borderBottomColor,
    rowHeight: +a.height.toFixed(2),
  };
});
record(3, "no gap between rows", rows.gap <= 0.5, `measured gap between adjacent rows = ${rows.gap}px (row-gap token ${rows.listGap})`);
record(3, "the row's value text is larger than the caption default",
  parseFloat(rows.valueSize) >= 16,
  `value ${rows.valueSize} (was em-derived caption size), row height ${rows.rowHeight}px`);
// 12 14 16 18 20 24 ... is the type scale. 13 is not on it, and an off-scale size is the defect
// a scale exists to prevent: it reads as "not quite 14" rather than as a decision.
record(3, "the row's label size is on the type scale",
  [12, 14, 16, 18, 20, 24].includes(parseFloat(rows.labelSize)),
  `label ${rows.labelSize}; nearest scale steps are 12px and 14px`);
record(3, "a light divider separates each row",
  parseFloat(rows.dividerWidth) > 0 && rows.dividerColor !== "rgba(0, 0, 0, 0)",
  `border-bottom ${rows.dividerWidth} ${rows.dividerColor}`);

// ── ASK 5 — the grab band, as accepted: 35px, full width ──────────────
// The 48px ask was closed: the band gets the chrome above the header and no more, which is
// --db-space-6 (16) + the handle's 8px top margin + its 4px bar + its 4px bottom reach = 32px.
// That clears WCAG 2.5.8's 24px AA target and falls short of 2.5.5's 44px AAA one, knowingly.
// The prose record says 35px; the stylesheet's own arithmetic says 32px, and this is the number.
record(5, "the grab band takes all the chrome above the header", geom.bandRows >= 32 && geom.bandTop <= 1,
  `band answers presses over y=${geom.bandTop}..${geom.bandBottom} of the sheet = ${geom.bandRows}px (>= the 24px WCAG 2.5.8 AA target; the written record's "35px" is 3px optimistic)`);
// Full width less the sheet's own border and scroll gutter, which clip the band's box.
record(5, "the grab band spans the full sheet width", geom.bandWidth >= geom.panelWidth - 4,
  `band x=${geom.bandLeft}..${geom.bandRight} = ${geom.bandWidth}px of a ${geom.panelWidth}px sheet`);

// ── ASK 6 — one fill for every sheet surface ──────────────────────────
// Each surface is built where its owner builds it. A panel is created inside the plugin's
// container and portalled out by applySheetChrome, which is what hands it `db-surface` and the
// token scope; a bare div parked on the body instead takes applySheetChrome's already-on-the-body
// early return, never receives that class, and measures transparent for a reason that has nothing
// to do with the fill under test. The owned menu is measured through its own constructor, since it
// is the one surface that really does mount itself on the body.
const fills = await page.evaluate((classes) => {
  const { applySheetChrome, createOwnedMenu } = globalThis.__a;
  const host = document.querySelector(".note-database-container");
  const out = {};
  for (const cls of classes) {
    if (cls === "db-owned-menu") continue;
    const el = host.createDiv({ cls });
    applySheetChrome(el, true);
    out[cls] = getComputedStyle(el).backgroundColor;
    applySheetChrome(el, false);
    el.remove();
  }
  const menu = createOwnedMenu(document);
  applySheetChrome(menu.el, true);
  out["db-owned-menu"] = getComputedStyle(menu.el).backgroundColor;
  applySheetChrome(menu.el, false);
  menu.el.remove();
  return out;
}, SHEET_SURFACES);
const distinct = [...new Set(Object.values(fills))];
record(6, "every sheet surface paints the same fill", distinct.length === 1,
  distinct.length === 1
    ? `all ${SHEET_SURFACES.length} surfaces measure ${distinct[0]}`
    : `${distinct.length} different fills: ` + Object.entries(fills).map(([k, v]) => `${k}=${v}`).join("  "));

// ── ASK 7 — the scrim: modal, 25% black, and out of the drag's way ────
await openSheet();
await page.waitForTimeout(200);
const scrim = await page.evaluate(() => {
  const s = document.querySelector(".db-mobile-sheet-scrim");
  const panel = document.querySelector(".db-record-detail-panel");
  const handle = panel.querySelector(".db-mobile-bottom-sheet-handle");
  const cs = getComputedStyle(s);
  const pr = panel.getBoundingClientRect();
  // Behind the sheet: does the scrim take the press instead of the table?
  const behind = document.elementFromPoint(Math.round(pr.left + pr.width / 2), Math.round(pr.top) - 120);
  // On the grab band: does the scrim steal it?
  const onBand = document.elementFromPoint(Math.round(pr.left + pr.width / 2), Math.round(pr.top) + 12);
  return {
    background: cs.backgroundColor,
    pointerEvents: cs.pointerEvents,
    scrimZ: cs.zIndex,
    sheetZ: getComputedStyle(panel).zIndex,
    behind: behind?.className || behind?.tagName || "(nothing)",
    behindIsScrim: behind === s,
    onBandIsHandle: onBand === handle,
  };
});
record(7, "the scrim is a 25% black modal layer", scrim.background === "rgba(0, 0, 0, 0.25)" && scrim.pointerEvents === "auto",
  `background ${scrim.background}, pointer-events ${scrim.pointerEvents}`);
record(7, "the scrim blocks the app behind the sheet", scrim.behindIsScrim,
  `a press 120px above the sheet lands on "${scrim.behind}"`);
record(7, "the scrim does not steal the grab band", scrim.onBandIsHandle,
  `a press on the band lands on the ${scrim.onBandIsHandle ? "grab handle" : "scrim"}; sheet z=${scrim.sheetZ}, scrim z=${scrim.scrimZ}`);

// ── ASK 4 — the keyboard inset, driven through the shipped lever ──────
//
// Two host signals announce a software keyboard and they do not behave the same.
// iOS shrinks visualViewport and leaves window.innerHeight alone; Android fires a
// window resize as well. The sheet reacts to both, and it reacts to them in
// opposite directions, so each is driven separately.
await openSheet();
await page.waitForTimeout(200);
const kbVisual = await page.evaluate(async () => {
  const panel = document.querySelector(".db-record-detail-panel");
  const before = Math.round(panel.getBoundingClientRect().bottom);
  document.documentElement.style.setProperty("--keyboard-height", "336px");
  // The iOS-shaped signal: visualViewport changes, window does not.
  window.visualViewport?.dispatchEvent(new Event("resize"));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const live = document.querySelector(".db-record-detail-panel");
  const out = live
    ? { survived: true, before, bottom: Math.round(live.getBoundingClientRect().bottom), top: Math.round(live.getBoundingClientRect().top), varValue: live.style.getPropertyValue("--db-mobile-sheet-bottom"), maxH: getComputedStyle(live).maxHeight }
    : { survived: false, before };
  document.documentElement.style.removeProperty("--keyboard-height");
  window.visualViewport?.dispatchEvent(new Event("resize"));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const back = document.querySelector(".db-record-detail-panel");
  return { ...out, restored: back ? Math.round(back.getBoundingClientRect().bottom) : null, viewport: window.innerHeight };
});
record(4, "a declared keyboard height lifts the sheet clear of it",
  kbVisual.survived && kbVisual.viewport - kbVisual.bottom >= 330,
  kbVisual.survived
    ? `--keyboard-height:336px moved the sheet's bottom edge ${kbVisual.before} -> ${kbVisual.bottom} on an ${kbVisual.viewport}px screen (clearance ${kbVisual.viewport - kbVisual.bottom}px); lever var=${kbVisual.varValue}`
    : "the sheet was destroyed before any inset could be applied");
record(4, "lifting the sheet does not push its top off the screen",
  kbVisual.survived && kbVisual.top >= 0,
  kbVisual.survived ? `top edge at y=${kbVisual.top}, max-height ${kbVisual.maxH}` : "n/a — sheet gone");
record(4, "the sheet returns to the floor when the keyboard closes",
  kbVisual.restored !== null && Math.abs(kbVisual.restored - kbVisual.viewport) <= 1,
  kbVisual.restored === null ? "n/a — sheet gone" : `bottom edge back at ${kbVisual.restored} of ${kbVisual.viewport}`);

await openSheet();
await page.waitForTimeout(200);
const kbWindow = await page.evaluate(async () => {
  document.documentElement.style.setProperty("--keyboard-height", "336px");
  // The Android-shaped signal: the window itself resizes.
  window.dispatchEvent(new Event("resize"));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const live = document.querySelector(".db-record-detail-panel");
  document.documentElement.style.removeProperty("--keyboard-height");
  return { survived: !!live, bottom: live ? Math.round(live.getBoundingClientRect().bottom) : null, viewport: window.innerHeight };
});
record(4, "the sheet survives the window resize a keyboard causes",
  kbWindow.survived,
  kbWindow.survived
    ? `sheet still open, bottom edge ${kbWindow.bottom}`
    : "one window resize closed the record sheet outright — openRecordDetailPanel registers onResize = close(), so on a host that resizes the window for its keyboard the sheet is gone before any inset can be applied");

// ── ASK 8 — one row grammar across sheets ─────────────────────────────
const grammar = await page.evaluate(() => {
  const { createOwnedMenu, createMenuRow, applySheetChrome } = globalThis.__a;
  const measure = (host) => {
    const row = createMenuRow(host, { label: "Duplicate", icon: "copy" }).row;
    const cs = getComputedStyle(row);
    const r = row.getBoundingClientRect();
    return { minHeight: cs.minHeight, padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`, height: +r.height.toFixed(1), cls: row.className };
  };
  const menu = createOwnedMenu(document);
  const menuEl = menu.el || menu.dom || menu.containerEl;
  document.body.appendChild(menuEl);
  applySheetChrome(menuEl, true);
  const inMenuSheet = measure(menuEl);
  const bare = document.body.createDiv({ cls: "db-record-detail-panel" });
  applySheetChrome(bare, true);
  const inPanelSheet = measure(bare);
  applySheetChrome(menuEl, false); applySheetChrome(bare, false);
  menuEl.remove(); bare.remove();
  return { inMenuSheet, inPanelSheet };
});
record(8, "a menu row lays out identically in any sheet",
  grammar.inMenuSheet.minHeight === grammar.inPanelSheet.minHeight
  && grammar.inMenuSheet.padding === grammar.inPanelSheet.padding
  && Math.abs(grammar.inMenuSheet.height - grammar.inPanelSheet.height) <= 0.5,
  `owned-menu sheet: min-height ${grammar.inMenuSheet.minHeight}, padding ${grammar.inMenuSheet.padding}, height ${grammar.inMenuSheet.height}px | panel sheet: min-height ${grammar.inPanelSheet.minHeight}, padding ${grammar.inPanelSheet.padding}, height ${grammar.inPanelSheet.height}px`);
record(8, "a sheet row meets the 44px thumb floor",
  grammar.inMenuSheet.height >= 44 && grammar.inPanelSheet.height >= 44,
  `owned-menu row ${grammar.inMenuSheet.height}px, panel row ${grammar.inPanelSheet.height}px`);

// ── The declarations the positioner writes but the phone never gets ───
await openSheet();
await page.waitForTimeout(200);
const dropped = await page.evaluate(() => {
  const panel = document.querySelector(".db-record-detail-panel");
  return {
    overflowY: panel.style.getPropertyValue("overflow-y") || "(unset)",
    overscroll: panel.style.getPropertyValue("overscroll-behavior") || "(unset)",
    computedOverflowY: getComputedStyle(panel).overflowY,
  };
});
record(0, "every declaration placeSheet writes reaches the sheet",
  dropped.overflowY !== "(unset)",
  `placeSheet asks for overflowY:auto and overscrollBehavior:contain; inline holds overflow-y=${dropped.overflowY}, overscroll-behavior=${dropped.overscroll}; computed overflow-y=${dropped.computedOverflowY}`);

await browser.close();

// ───────────────────────────────────────────────────────────────────
// 5. REPORT
// ───────────────────────────────────────────────────────────────────

console.log("\nsheet-audit — the operator's eight asks, measured on the shipped code\n");
for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"}  [ask ${r.ask || "-"}] ${r.name}\n        ${r.detail}`);
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passing\n`);
process.exit(failed.length === 0 ? 0 : 1);
