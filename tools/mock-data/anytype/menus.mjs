#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    menus
// COMPONENT: crawls every menu, dropdown, popover and inline editor the
//            Anytype desktop app can open, and photographs each one
// ───────────────────────────────────────────────────────────────────
//
// Everything runs through the renderer over CDP, exactly as capture.mjs does:
// Runtime.evaluate dispatches the app's own DOM events and Page.captureScreenshot
// renders from the page. Nothing here moves the OS pointer, activates the window
// or takes keyboard focus, so it is safe to run while the machine is in use.
//
// Two shots are taken per menu: one clipped to the menu's bounding box, which is
// the design reference, and one of the whole window, which shows where the menu
// sits relative to the surface that opened it.
//
// Usage:
//   node tools/mock-data/anytype/menus.mjs --target <cdpTargetId> --out <dir>
//                                          [--theme light|dark] [--only <context>]
// Exit: 0 once the sweep finishes; a menu that will not open is recorded, not fatal.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Driver, sleep } from './driver.mjs';
import { CDP, listTargets } from './cdp.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const log = (...a) => console.log(...a);
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : undefined; };

// ───────────────────────────────────────────────────────────────────
// 2. WHAT MUST NEVER BE CLICKED
// ───────────────────────────────────────────────────────────────────
//
// The demo space is a persistent reference environment, so the crawler opens
// menus and never commits them. Two classes of control are refused outright.
//
// `DESTRUCTIVE` covers rows that delete, duplicate, move or export. `MUTATING`
// covers rows that quietly write to the space — creating a view, a filter, an
// option or an object. Both lists are matched against an item's id and its first
// line of text, and the auto-submenu walker consults them before every hover.

const DESTRUCTIVE = [
  'item-remove', 'item-delete', 'item-archive', 'item-copy', 'item-duplicate',
  'item-moveToBin', 'item-export', 'item-print', 'item-fav', 'item-unfav',
  'item-pin', 'item-unpin', 'item-lock', 'item-unlock', 'item-createWidget',
  'item-removeWidget', 'item-leaveSpace', 'item-deleteSpace', 'item-logout',
];

const DESTRUCTIVE_TEXT = [
  'move to bin', 'delete', 'remove', 'duplicate', 'archive', 'export', 'print',
  'leave space', 'delete space', 'log out', 'reset', 'uninstall', 'unlink',
];

// A view is created by the "+" in the view bar and by "Add a view" in the view
// list. Both are refused during the crawl; the one scratch view this script
// needs is created explicitly by `withScratchView`, which also removes it.
const MUTATING_TEXT = ['add a view', 'new view', 'create object', 'create from clipboard'];

const isForbidden = (id, text) => {
  const t = (text || '').trim().toLowerCase();
  if (DESTRUCTIVE.includes(id)) return 'destructive-id';
  if (DESTRUCTIVE_TEXT.some((w) => t.startsWith(w))) return 'destructive-text';
  if (MUTATING_TEXT.some((w) => t.startsWith(w))) return 'mutating-text';
  return null;
};

// ───────────────────────────────────────────────────────────────────
// 3. THEME
// ───────────────────────────────────────────────────────────────────
//
// The same main-process bridge the Settings UI's own handler calls. No menu
// accelerator and no navigation, so it works with the window unfocused.

const THEMES = { light: '', dark: 'dark' };

async function setTheme(d, id) {
  await d.eval(`window.Electron.Api(window.Electron.winId(), 'setTheme', [${JSON.stringify(id)}])`);
  await sleep(2200);
  // Anytype stamps the theme on <html> (`themeDark`), not on <body>, which stays
  // empty in every theme — reading body reports the same string for both.
  return (await d.eval('document.documentElement.className')).trim();
}

// ───────────────────────────────────────────────────────────────────
// 3b. THE TAB GUARD
// ───────────────────────────────────────────────────────────────────
//
// Anytype is a tabbed shell, and several of its menus open a new tab — a space
// row in the vault rail, an object opened from a widget. A new tab makes ours a
// background tab, and Chromium then reports `visibilityState: "hidden"` for it:
// Runtime.evaluate still answers, but the layout is stale and
// Page.captureScreenshot returns the frame of a page nobody is looking at. The
// symptom is a whole context reporting "no element" for selectors that are
// plainly in the DOM, and it cost two full sweeps before it was understood.
//
// The tab strip is its own CDP target (`dist/tabs.html`) whose rows carry
// `.clickable` to activate and `.icon.close` to close, so the guard can undo a
// stray tab and re-activate ours entirely inside the renderer — no window
// activation, no pointer, nothing the operator would see move.

class TabGuard {
  constructor(c) { this.c = c; this.baseline = []; this.ours = null; this.repairs = []; }

  static async attach() {
    const t = (await listTargets()).find((x) => x.url.includes('/dist/tabs.html'));
    if (!t) return null;
    return new TabGuard(await CDP.attach(t.webSocketDebuggerUrl));
  }

  list() {
    return this.c.eval(`JSON.stringify(Array.from(document.querySelectorAll('#tabs .tab'))
      .filter(e => e.dataset.id)
      .map(e => ({ id: e.dataset.id, name: (e.querySelector('.name') || {}).innerText || '', active: e.classList.contains('active') })))`)
      .then(JSON.parse);
  }

  async init() {
    const tabs = await this.list();
    this.baseline = tabs.map((t) => t.id);
    this.ours = (tabs.find((t) => t.active) ?? tabs[0])?.id ?? null;
    return tabs;
  }

  /** Close every tab the sweep opened, then make ours the active one again. */
  async enforce() {
    let tabs = await this.list();
    const strays = tabs.filter((t) => !this.baseline.includes(t.id));
    for (const t of strays) {
      await this.c.eval(`(() => { const e = document.querySelector('[data-id="' + ${JSON.stringify(t.id)} + '"] .icon.close'); if (e) e.click(); })()`);
      this.repairs.push({ closed: t.name });
      await sleep(1200);
    }
    if (!strays.length) {
      const active = tabs.find((t) => t.active);
      if (!active || active.id === this.ours) return false;
    }
    tabs = await this.list();
    const ours = tabs.find((t) => t.id === this.ours);
    if (!ours) { this.repairs.push({ lost: this.ours }); return true; }
    if (!ours.active) {
      await this.c.eval(`(() => { const e = document.querySelector('[data-id="' + ${JSON.stringify(this.ours)} + '"] .clickable'); if (e) e.click(); })()`);
      this.repairs.push({ reactivated: ours.name });
      await sleep(1600);
    }
    return true;
  }

  close() { this.c.close(); }
}

// ───────────────────────────────────────────────────────────────────
// 4. THE CRAWLER
// ───────────────────────────────────────────────────────────────────

class Crawler {
  constructor(d, outDir, index, misses) {
    this.d = d;
    this.out = outDir;
    this.index = index;
    this.misses = misses;
    this.theme = 'dark';
    this.context = '';
    this.seen = new Set();
  }

  // ── 4.1 menu state ────────────────────────────────────────────────

  /**
   * Every menu Anytype has open, outermost first. Menus mount into `.menus`
   * with a semantic id (`menuDataviewViewSettings`, `menuSelect`, …) and only
   * carry `.show` once they have finished animating in.
   */
  menus() {
    return this.d.eval(`JSON.stringify(Array.from(document.querySelectorAll('.menu.show')).map(m => {
      const r = m.getBoundingClientRect();
      return { id: m.id, cls: String(m.className),
               rect: { x: r.x, y: r.y, w: r.width, h: r.height },
               items: Array.from(m.querySelectorAll('.item')).map(e => ({
                 id: e.id || null,
                 text: (e.innerText || '').trim().split('\\n')[0].slice(0, 60),
                 arrow: !!e.querySelector('.icon.arrow'),
               })) };
    }))`).then(JSON.parse);
  }

  /** Wait until a menu appears that was not already open when the action fired. */
  async waitNewMenu(before, timeoutMs = 6000) {
    const had = new Set(before.map((m) => m.id));
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const now = await this.menus();
      const fresh = now.filter((m) => !had.has(m.id) && m.rect.w > 0);
      if (fresh.length) { await sleep(500); return { all: await this.menus(), fresh }; }
      await sleep(200);
    }
    return null;
  }

  async escape(times = 4) {
    for (let i = 0; i < times; i += 1) {
      await this.d.key('Escape', 'Escape', 27);
      await sleep(220);
    }
    if (this.tabs) await this.tabs.enforce();
    // A cell editor closes on Escape but leaves the row selected; clearing the
    // selection keeps the next context's first shot clean.
    await sleep(300);
  }

  // ── 4.2 capture ───────────────────────────────────────────────────

  /**
   * Two files per menu. The clip is the union of every open menu, because a
   * submenu is only legible next to the parent row that opened it, and a shot of
   * the submenu alone loses which row that was.
   */
  async shot(name, rects, how) {
    const file = `anytype-menu-${name}-${this.theme}.png`;
    const full = `anytype-menu-${name}-${this.theme}-full.png`;
    if (this.seen.has(file)) return null;
    this.seen.add(file);

    const pad = 12;
    const x = Math.max(0, Math.floor(Math.min(...rects.map((r) => r.x)) - pad));
    const y = Math.max(0, Math.floor(Math.min(...rects.map((r) => r.y)) - pad));
    const x2 = Math.ceil(Math.max(...rects.map((r) => r.x + r.w)) + pad);
    const y2 = Math.ceil(Math.max(...rects.map((r) => r.y + r.h)) + pad);
    const vp = await this.d.eval('JSON.stringify({w:innerWidth,h:innerHeight})').then(JSON.parse);
    const clip = { x, y, width: Math.min(x2, vp.w) - x, height: Math.min(y2, vp.h) - y, scale: 1 };
    // A menu that measured zero — the usual sign that this tab went to the
    // background — would crash Page.captureScreenshot with "Invalid parameters".
    if (!(clip.width >= 8 && clip.height >= 8)) {
      this.seen.delete(file);
      this.miss(name, how, `menu measured ${clip.width}x${clip.height}; the page is probably not the visible tab`);
      return null;
    }

    const { data } = await this.d.c.send('Page.captureScreenshot', { format: 'png', clip, captureBeyondViewport: false });
    await writeFile(join(this.out, file), Buffer.from(data, 'base64'));
    await this.d.c.screenshot(join(this.out, full));

    this.index.push({ file, full, context: this.context, menu: name, theme: this.theme, how, clip });
    log(`    ${file}`);
    return file;
  }

  /** Record a menu that would not open, with the reason the page gave. */
  miss(name, how, reason) {
    this.misses.push({ context: this.context, menu: name, theme: this.theme, how, reason: String(reason).slice(0, 240) });
    log(`    MISS ${name}: ${String(reason).slice(0, 110)}`);
  }

  // ── 4.3 interaction ───────────────────────────────────────────────

  async clickSel(sel) {
    return this.d.eval(`(() => {
      const e = document.querySelector(${JSON.stringify(sel)});
      if (!e) return 'MISSING';
      e.click();
      return 'ok';
    })()`);
  }

  /**
   * Rows carrying `arrow: true` open a sub-picker on mouseenter and their
   * onClick returns early, so a click on them does nothing at all. The app also
   * latches a mouse-disabled flag after any key press and clears it only on a
   * mousemove, which is why one is dispatched on the document first.
   */
  async hoverSel(sel) {
    return this.d.eval(`(() => {
      const e = document.querySelector(${JSON.stringify(sel)});
      if (!e) return 'MISSING';
      const b = e.getBoundingClientRect();
      const at = { clientX: Math.round(b.left + b.width / 2), clientY: Math.round(b.top + b.height / 2), bubbles: true, cancelable: true, view: window };
      document.dispatchEvent(new MouseEvent('mousemove', at));
      e.dispatchEvent(new MouseEvent('mouseover', { ...at, relatedTarget: document.body }));
      e.dispatchEvent(new MouseEvent('mouseenter', at));
      e.dispatchEvent(new MouseEvent('mousemove', at));
      return 'ok';
    })()`);
  }

  /**
   * Open one menu and photograph it, then walk one level into every submenu row
   * it offers. `how` is the selector path recorded in the README so a later
   * reader can reach the same menu by hand.
   */
  async capture(name, how, open, { submenus = true, extraRects = [] } = {}) {
    await this.escape();
    const before = await this.menus();
    let r;
    try { r = await open(); } catch (e) { this.miss(name, how, e.message); return null; }
    if (r === 'MISSING') { this.miss(name, how, 'no element for the opener selector'); return null; }
    const appeared = await this.waitNewMenu(before);
    if (!appeared) { this.miss(name, how, 'opener fired but no .menu.show appeared'); return null; }

    const rects = appeared.all.map((m) => m.rect).concat(extraRects);
    await this.shot(name, rects, how);
    if (submenus) await this.walkSubmenus(name, how, appeared.fresh[appeared.fresh.length - 1]);
    return appeared;
  }

  /**
   * Every `withArrow` row of `menu`, hovered in turn. Forbidden rows are skipped
   * with the reason recorded rather than silently dropped, so the report can say
   * what was deliberately not opened.
   */
  async walkSubmenus(name, how, menu) {
    if (!menu) return;
    const arrows = menu.items.filter((i) => i.arrow && i.id);
    for (const item of arrows) {
      const bad = isForbidden(item.id, item.text);
      if (bad) { this.misses.push({ context: this.context, menu: `${name}-${slug(item.text)}`, theme: this.theme, how, reason: `refused: ${bad}` }); continue; }
      const before = await this.menus();
      const sel = `#${menu.id} #${item.id}`;
      const r = await this.hoverSel(sel);
      if (r !== 'ok') { this.miss(`${name}-${slug(item.text)}`, `${how} > hover ${sel}`, r); continue; }
      let appeared = await this.waitNewMenu(before, 4500);
      if (!appeared) {
        // Some arrow rows replace the menu on click instead of opening a side
        // panel on hover; the two behaviours are not distinguishable from the
        // markup, so an unresponsive hover is retried as a click.
        await this.clickSel(sel);
        await sleep(1400);
        appeared = await this.waitNewMenu(before, 3000);
      }
      if (!appeared) { this.miss(`${name}-${slug(item.text)}`, `${how} > hover ${sel}`, 'neither hover nor click opened a submenu'); continue; }
      await this.shot(`${name}-${slug(item.text)}`, appeared.all.map((m) => m.rect), `${how} > hover "${item.text}"`);
      // One Escape closes just this submenu and leaves its parent open. Without
      // it the next row is hovered while the previous submenu still covers the
      // menu, and the app ignores the hover — which reads exactly like a row
      // that has no submenu at all.
      await this.d.key('Escape', 'Escape', 27);
      await sleep(600);
    }
  }

  /**
   * Anything inside `scope` that looks like it opens a menu and was not already
   * reached. This is the crawler's discovery leg: the seed list says what to
   * look for, this says what was there that the seed list did not name.
   */
  async discover(scope) {
    const found = await this.d.eval(`JSON.stringify((() => {
      const root = document.querySelector(${JSON.stringify(scope)});
      if (!root) return [];
      const sel = '.icon.more, .icon.commonOptions, .icon.plusMenu, .icon.arrowSelect, .select, .withSelect, [class*="btn-"], .icon.commonSettings';
      return Array.from(root.querySelectorAll(sel)).map(e => ({
        cls: String(e.className).trim(),
        text: (e.innerText || '').trim().split('\\n')[0].slice(0, 30),
      }));
    })())`).then(JSON.parse);
    return found;
  }
}

const slug = (s) => (s || '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'item';

export { Crawler, THEMES, setTheme, slug, isForbidden };

// ───────────────────────────────────────────────────────────────────
// 5. CHAINED CAPTURE HELPERS
// ───────────────────────────────────────────────────────────────────
//
// `capture` above covers the common shape — one opener, one menu, its submenus.
// Several of Anytype's menus are only reachable through a chain (settings ▸
// Filter ▸ New filter ▸ a property ▸ its condition), so the scenarios below drive
// those step by step and photograph whatever is open at each step.

Object.assign(Crawler.prototype, {
  /** Photograph every menu currently open, under one name. */
  async snap(name, how) {
    const open = await this.menus();
    if (!open.length) { this.miss(name, how, 'nothing open to photograph'); return false; }
    await this.shot(name, open.map((m) => m.rect), how);
    return true;
  },

  /** Click and wait for the menu stack to change. */
  async open(sel, { wait = 1400 } = {}) {
    const r = await this.clickSel(sel);
    if (r !== 'ok') return r;
    await sleep(wait);
    return 'ok';
  },

  async hover(sel, { wait = 1200 } = {}) {
    const r = await this.hoverSel(sel);
    if (r !== 'ok') return r;
    await sleep(wait);
    return 'ok';
  },

  /** Click the row of the outermost-last open menu whose first line starts with `text`. */
  async clickRow(text, { wait = 1500, menuId = null } = {}) {
    const r = await this.d.eval(`(() => {
      const ms = Array.from(document.querySelectorAll('.menu.show'));
      const m = ${menuId ? `document.querySelector('#' + ${JSON.stringify(menuId)})` : 'ms[ms.length - 1]'};
      if (!m) return 'NOMENU';
      const want = ${JSON.stringify(text)}.toLowerCase();
      const el = Array.from(m.querySelectorAll('.item')).find(e => (e.innerText || '').trim().toLowerCase().split('\\n')[0].startsWith(want));
      if (!el) return 'NOROW:' + JSON.stringify(Array.from(m.querySelectorAll('.item')).map(e => (e.innerText||'').trim().split('\\n')[0]).slice(0, 25));
      el.click();
      return 'ok';
    })()`);
    if (r === 'ok') await sleep(wait);
    return r;
  },
});

// ───────────────────────────────────────────────────────────────────
// 6. THE SCRATCH VIEW
// ───────────────────────────────────────────────────────────────────
//
// Two of the app's behaviours make it unsafe to photograph the view-settings
// menu on a view the demo space actually uses:
//
//   1. Opening `#menuDataviewViewSettings` clears its name input and commits the
//      empty value, so the view is renamed to "Untitled" simply by looking at it.
//   2. Adding a filter, a sort or a group-by writes to the view.
//
// So every mutating capture happens on one throwaway view created for the sweep
// and removed at the end, and the six real views are only ever read.

async function createScratchView(d) {
  const before = (await d.viewNames()).length;
  await d.eval(`document.querySelector('#dataviewControls #views .plus').click()`);
  await sleep(2600);
  await d.waitFor('#menuDataviewViewSettings', 10000);
  const after = await d.viewNames();
  if (after.length !== before + 1) throw new Error(`scratch view not created: ${before} -> ${after.length}`);
  return after.length - 1;
}

async function removeScratchView(d, index) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const names = await d.viewNames();
    if (names.length <= index) return names;
    await d.escape(4);
    await d.eval(`document.querySelectorAll('#views .viewItem')[${index}].click()`);
    await sleep(2400);
    await d.waitFor('#dataviewControls .btn-settings', 10000);
    await d.eval(`document.querySelector('#dataviewControls .btn-settings').click()`);
    await sleep(1400);
    const r = await d.eval(`(() => { const e = document.querySelector('#menuDataviewViewSettings #item-remove'); if (!e) return 'MISSING'; e.click(); return 'ok'; })()`);
    if (r === 'ok') await sleep(2600);
  }
  await d.escape(4);
  return d.viewNames();
}

/** The six real views must read back exactly as views-report.json recorded them. */
async function assertViews(d, expected) {
  const got = await d.viewNames();
  const ok = expected.every((n, i) => got[i] === n) && got.length === expected.length;
  return { ok, got, expected };
}

// ───────────────────────────────────────────────────────────────────
// 7. CONTEXT 1 — THE SET'S CONTROLS BAR
// ───────────────────────────────────────────────────────────────────
//
// The view-settings menu's arrow rows behave differently from a menu's usual
// submenu rows: they replace the menu in place on click rather than opening a
// side panel on hover, so each one is reached by reopening settings first.

const SETTINGS_ROWS = [
  ['item-layout', 'layout'],
  ['item-relations', 'properties'],
  ['item-filter', 'filter'],
  ['item-sort', 'sort'],
];

/** One filter per relation format, named by the property that carries it. */
const FILTER_PROPERTIES = [
  ['text-short', 'Name'],
  ['text-long', 'Working notes'],
  ['number', 'Estimate (pts)'],
  ['select', 'Status (Project Tracker)'],
  ['multiselect', 'Team'],
  ['date', 'Starts'],
  ['checkbox', 'Blocked'],
  ['url', 'Ticket'],
  ['email', 'Owner email'],
  ['phone', 'Escalation line'],
  ['object', 'Depends on'],
  ['file', 'Attachments'],
];

/** The picker renders one `.layout` tile per layout, labelled in plain text. */
const LAYOUTS = ['Grid', 'Gallery', 'List', 'Kanban', 'Calendar', 'Graph'];

async function openSettings(cw) {
  await cw.escape();
  await cw.d.waitFor('#dataviewControls .btn-settings', 8000);
  const r = await cw.open('#dataviewControls .btn-settings');
  if (r !== 'ok') return r;
  await cw.d.waitFor('#menuDataviewViewSettings', 6000);
  return 'ok';
}

async function ctxSetControls(cw, d) {
  cw.context = 'set';

  // ── read-only menus, taken on the real Grid view ──────────────────
  await cw.capture('set-viewlist', '#dataviewControls .viewSelect',
    () => cw.clickSel('#dataviewControls .viewSelect'));

  await cw.capture('set-sort-list', '#dataviewControls .btn-sort',
    () => cw.clickSel('#dataviewControls .btn-sort'));

  await cw.capture('set-filter-property-picker', '#dataviewControls .btn-filter',
    () => cw.clickSel('#dataviewControls .btn-filter'));

  await cw.capture('set-new-object', '#dataviewControls .buttonWrap.withSelect .button.isArrow',
    () => cw.clickSel('#dataviewControls .buttonWrap.withSelect .button.isArrow'));

  // The grid's own column header menu — rename, format, sort, insert, hide.
  await cw.capture('set-column-header', '.viewContent .cellHead:nth-child(2)',
    () => cw.clickSel('.viewContent .cellHead:nth-child(2)'));

  // ── everything that writes, on the scratch view ───────────────────
  let scratch = null;
  try {
    scratch = await createScratchView(d);
    log(`  scratch view at index ${scratch}`);
  } catch (e) {
    cw.miss('set-view-settings', '#dataviewControls #views .plus', `scratch view: ${e.message}`);
    return;
  }

  try {
    // The settings menu itself, then each of its four arrow rows.
    if (await openSettings(cw) === 'ok') await cw.snap('set-view-settings', '.btn-settings');
    for (const [id, label] of SETTINGS_ROWS) {
      if (await openSettings(cw) !== 'ok') { cw.miss(`set-view-${label}`, '.btn-settings', 'settings menu did not open'); continue; }
      const r = await cw.open(`#menuDataviewViewSettings #${id}`);
      if (r !== 'ok') { cw.miss(`set-view-${label}`, `.btn-settings > #${id}`, r); continue; }
      await cw.snap(`set-view-${label}`, `.btn-settings > click #${id}`);
      const open = await cw.menus();
      await cw.walkSubmenus(`set-view-${label}`, `.btn-settings > click #${id}`, open[open.length - 1]);
    }

    await ctxLayoutSettings(cw, d);
    // The layout sweep leaves the scratch view on Graph, which renders no grid
    // and no filterable rows; the filter and sort work needs it back on Grid.
    await setScratchLayout(cw, d, 'Grid');
    await ctxFilters(cw, d);
    await ctxSorts(cw, d);
  } finally {
    await cw.escape();
    const left = await removeScratchView(d, scratch);
    log(`  scratch view removed, tabs now ${JSON.stringify(left)}`);
  }
}

/** Put the scratch view on one named layout, used to reset it between sweeps. */
async function setScratchLayout(cw, d, label) {
  if (await openSettings(cw) !== 'ok') return false;
  if (await cw.open('#menuDataviewViewSettings #item-layout') !== 'ok') return false;
  const r = await d.eval(`(() => {
    const t = Array.from(document.querySelectorAll('#menuDataviewViewLayout .layouts .layout'))
      .find(e => (e.innerText || '').trim() === ${JSON.stringify(label)});
    if (!t) return 'MISSING';
    t.click();
    return 'ok';
  })()`);
  await sleep(2600);
  await cw.escape();
  return r === 'ok';
}

/**
 * The layout picker's own settings differ per layout — a Kanban has a group-by,
 * a Calendar has a date property, a Gallery has card size, cover and fit. The
 * scratch view is switched through all six so each variant is photographed
 * without touching a view the space uses.
 */
async function ctxLayoutSettings(cw, d) {
  for (const label of LAYOUTS) {
    const name = label.toLowerCase();
    if (await openSettings(cw) !== 'ok') { cw.miss(`set-layout-${name}`, '.btn-settings', 'settings did not open'); continue; }
    if (await cw.open('#menuDataviewViewSettings #item-layout') !== 'ok') { cw.miss(`set-layout-${name}`, '.btn-settings > #item-layout', 'layout row did not open'); continue; }
    const r = await d.eval(`(() => {
      const t = Array.from(document.querySelectorAll('#menuDataviewViewLayout .layouts .layout'))
        .find(e => (e.innerText || '').trim() === ${JSON.stringify(label)});
      if (!t) return 'MISSING';
      t.click();
      return 'ok';
    })()`);
    if (r !== 'ok') { cw.miss(`set-layout-${name}`, `#menuDataviewViewLayout .layout "${label}"`, r); continue; }
    await sleep(2600);
    // Selecting a layout keeps the picker open, and it now shows that layout's
    // own settings rows.
    await cw.snap(`set-layout-${name}`, `.btn-settings > Layout > "${label}"`);
    const open = await cw.menus();
    await cw.walkSubmenus(`set-layout-${name}`, `.btn-settings > Layout > "${label}"`, open[open.length - 1]);
  }
}

/**
 * A filter per relation format. Each one is created on the scratch view, its
 * value editor photographed, then its condition list opened — the condition set
 * is what actually differs between a date, a checkbox and a select.
 */
async function ctxFilters(cw, d) {
  for (const [format, property] of FILTER_PROPERTIES) {
    if (await openSettings(cw) !== 'ok') { cw.miss(`set-filter-${format}`, '.btn-settings', 'settings did not open'); continue; }
    if (await cw.open('#menuDataviewViewSettings #item-filter') !== 'ok') { cw.miss(`set-filter-${format}`, '> Filter', 'filter row did not open'); continue; }
    const add = await cw.open('#menuDataviewFilterList #item-add');
    if (add !== 'ok') { cw.miss(`set-filter-${format}`, '> Filter > New filter', add); continue; }
    const pick = await cw.clickRow(property);
    if (pick !== 'ok') { cw.miss(`set-filter-${format}`, `> Filter > New filter > "${property}"`, pick); continue; }
    await cw.snap(`set-filter-${format}`, `.btn-settings > Filter > New filter > "${property}"`);

    // The condition row is the first item of the value menu; clicking it swaps
    // in the list of conditions this format supports.
    const cond = await d.eval(`(() => {
      const m = document.querySelector('#menuDataviewFilterValues');
      if (!m) return 'NOVALUES';
      const first = m.querySelector('.item');
      if (!first) return 'NOITEM';
      first.click();
      return 'ok';
    })()`);
    if (cond !== 'ok') { cw.miss(`set-filter-${format}-condition`, `> "${property}" > condition`, cond); continue; }
    await sleep(1400);
    await cw.snap(`set-filter-${format}-condition`, `.btn-settings > Filter > "${property}" > condition row`);
  }

  // The date filter's value side is its own surface: the value menu renders an
  // Exact/Relative switch and a month calendar inline, so there is no separate
  // date-picker menu to open. The second surface worth having is the Relative
  // tab, whose options replace the calendar.
  if (await openSettings(cw) === 'ok' && await cw.open('#menuDataviewViewSettings #item-filter') === 'ok') {
    const r = await cw.clickRow('Starts', { menuId: 'menuDataviewFilterList' });
    if (r === 'ok') {
      await cw.snap('set-filter-date-picker', '.btn-settings > Filter > "Starts" (Exact tab, calendar)');
      const rel = await cw.d.eval(`(() => {
        const m = document.querySelector('#menuDataviewFilterValues');
        if (!m) return 'NOVALUES';
        const el = Array.from(m.querySelectorAll('*')).find(e => e.children.length === 0 && (e.textContent || '').trim() === 'Relative');
        if (!el) return 'NORELATIVE';
        (el.closest('.item') || el).click();
        return 'ok';
      })()`);
      if (rel === 'ok') { await sleep(1500); await cw.snap('set-filter-date-relative', '.btn-settings > Filter > "Starts" > Relative tab'); }
      else cw.miss('set-filter-date-relative', '> "Starts" > Relative', rel);
    } else cw.miss('set-filter-date-picker', '> Filter > "Starts"', r);
  }
}

/**
 * A sort, its property picker and its ascending/descending picker.
 *
 * The controls bar's own sort icon (`.btn-sort`) is a state indicator, not an
 * opener: it dispatches no menu on `el.click()` and none on a real CDP
 * `Input.dispatchMouseEvent` either, so the sort surface is reached through view
 * settings instead. The menu's id is `menuDataviewSort`, not the `…SortList`
 * that the filter menu's naming suggests.
 */
async function ctxSorts(cw, d) {
  if (await openSettings(cw) !== 'ok') { cw.miss('set-sort', '.btn-settings', 'settings did not open'); return; }
  if (await cw.open('#menuDataviewViewSettings #item-sort') !== 'ok') { cw.miss('set-sort', '> Sort', 'sort row did not open'); return; }
  await cw.snap('set-sort-empty', '.btn-settings > Sort');

  // A fresh view is created with one sort already on it, so the row reads
  // "Add sort" rather than the filter menu's "New filter".
  let add = await cw.clickRow('Add sort');
  if (add !== 'ok') add = await cw.clickRow('New sort');
  if (add !== 'ok') { cw.miss('set-sort-property-picker', '> Sort > Add sort', add); return; }
  await cw.snap('set-sort-property-picker', '.btn-settings > Sort > Add sort');

  const pick = await cw.clickRow('Estimate (pts)');
  if (pick !== 'ok') { cw.miss('set-sort-added', '> Sort > Add sort > "Estimate (pts)"', pick); return; }
  await cw.snap('set-sort-added', '.btn-settings > Sort > Add sort > "Estimate (pts)"');

  // The direction sits on the sort row itself, as a select rather than an arrow
  // submenu, so it is opened by clicking the row's right-hand side.
  const dir = await d.eval(`(() => {
    const m = document.querySelector('#menuDataviewSort');
    if (!m) return 'NOLIST';
    const el = m.querySelector('.item .side.right, .item .order, .item .select, .item .icon.arrowSelect');
    if (!el) return 'NODIR:' + JSON.stringify(Array.from(m.querySelectorAll('.item')).map(e => String(e.className)).slice(0, 10));
    el.click();
    return 'ok';
  })()`);
  if (dir === 'ok') { await sleep(1400); await cw.snap('set-sort-direction', '.btn-settings > Sort > sort row > direction select'); }
  else cw.miss('set-sort-direction', '> Sort > direction', dir);
}

/**
 * The four layout sub-pickers a scratch view cannot show.
 *
 * A freshly created view carries only the three default columns, and the Kanban
 * group-by and Gallery cover pickers offer nothing and therefore do not open at
 * all — the failure looks identical to a hover the app ignored. The six real
 * views carry all twenty-seven properties, so these are taken there instead.
 *
 * That costs one write: opening the view-settings menu blanks the view's name
 * (see the scratch-view note above), so each view's name is typed back and
 * committed with Enter before moving on, and `main` re-checks every name against
 * views-report.json at the end.
 */
async function ctxRealLayouts(cw, d, selectView, expected) {
  cw.context = 'set';
  for (const [i, label] of expected.entries()) {
    if (!await selectView(label.toLowerCase())) { cw.miss(`set-layout-${label.toLowerCase()}-populated`, `view tab "${label}"`, 'view tab not found'); continue; }
    if (await openSettings(cw) !== 'ok') { cw.miss(`set-layout-${label.toLowerCase()}-populated`, '.btn-settings', 'settings did not open'); continue; }
    if (await cw.open('#menuDataviewViewSettings #item-layout') === 'ok') {
      const open = await cw.menus();
      await cw.walkSubmenus(`set-layout-${label.toLowerCase()}`, `view "${label}" ▸ .btn-settings ▸ Layout`, open[open.length - 1]);
    } else cw.miss(`set-layout-${label.toLowerCase()}-populated`, '> Layout', 'layout row did not open');

    // Put the name back, whatever the menu did to it.
    await cw.escape();
    if (await openSettings(cw) === 'ok') {
      const sel = '#menuDataviewViewSettings input.input-text';
      await d.eval(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (e) { e.focus(); e.setSelectionRange(0, e.value.length); } })()`);
      await sleep(250);
      await d.typeInto(sel, label);
      await d.key('Enter', 'Enter', 13);
      await sleep(1600);
    }
    const names = await d.viewNames();
    if (names[i] !== label) cw.misses.push({ context: 'set', menu: `set-layout-${label.toLowerCase()}-populated`, theme: cw.theme, how: 'name repair', reason: `VIEW NAME NOT RESTORED: index ${i} reads ${JSON.stringify(names[i])}, expected ${JSON.stringify(label)}` });
  }
  await cw.escape();
}

// ───────────────────────────────────────────────────────────────────
// 8. CONTEXT 2 — GRID CELL INLINE EDITORS
// ───────────────────────────────────────────────────────────────────
//
// Not every format opens a menu. A text, number, url, email or phone cell edits
// in place, so those are clipped to the cell itself rather than to a popover,
// and a checkbox has no editor at all — clicking it toggles the value, so it is
// toggled, photographed and toggled back with the value checked both times.

Object.assign(Crawler.prototype, {
  /** Clip to one element rather than to a menu, for editors that render in place. */
  async snapEl(name, sel, how, { pad = 24 } = {}) {
    const rect = await this.d.eval(`(() => {
      const e = document.querySelector(${JSON.stringify(sel)});
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return JSON.stringify({ x: r.x, y: r.y, w: r.width, h: r.height });
    })()`);
    if (!rect) { this.miss(name, how, `no element for ${sel}`); return false; }
    const r = JSON.parse(rect);
    const open = await this.menus();
    await this.shot(name, [{ x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2 }, ...open.map((m) => m.rect)], how);
    return true;
  },
});

// The Name cell is deliberately absent: clicking it opens the object rather
// than editing in place, and the navigation empties the grid for every format
// that follows. Its editor is the object page's title, captured in `object`.
const CELL_FORMATS = [
  ['text', '.viewContent .row .cell.c-longText', 'inline'],
  ['url', '.viewContent .row .cell.c-url', 'inline'],
  ['email', '.viewContent .row .cell.c-email', 'inline'],
  ['phone', '.viewContent .row .cell.c-phone', 'inline'],
  ['number', '.viewContent .row .cell.c-number', 'inline'],
  ['select', '.viewContent .row .cell.c-select.isSelect', 'menu'],
  ['multiselect', '.viewContent .row .cell.c-select.isMultiSelect', 'menu'],
  ['date', '.viewContent .row .cell.c-date', 'menu'],
  ['object', '.viewContent .row .cell.c-object:not(.cell-key-type)', 'menu'],
  ['file', '.viewContent .row .cell.c-file', 'menu'],
  ['type', '.viewContent .row .cell.cell-key-type', 'menu'],
];

async function ctxCells(cw, d, onGrid) {
  cw.context = 'cell';
  await cw.escape();

  for (const [format, sel, kind] of CELL_FORMATS) {
    await cw.escape();
    if (!await onGrid()) { cw.miss(`cell-${format}`, sel, 'the grid could not be re-established'); continue; }
    const before = await d.eval(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); return e ? (e.innerText || '') : null; })()`);
    if (before === null) { cw.miss(`cell-${format}`, sel, 'no cell of this format on the grid'); continue; }
    const menusBefore = await cw.menus();
    const r = await cw.clickSel(sel);
    if (r !== 'ok') { cw.miss(`cell-${format}`, sel, r); continue; }
    await sleep(1500);
    if (kind === 'menu') {
      const appeared = await cw.waitNewMenu(menusBefore, 4000);
      if (appeared) await cw.shot(`cell-${format}`, appeared.all.map((m) => m.rect), `grid row ▸ click ${sel}`);
      else await cw.snapEl(`cell-${format}`, sel, `grid row ▸ click ${sel} (edits in place)`);
    } else {
      await cw.snapEl(`cell-${format}`, sel, `grid row ▸ click ${sel} (edits in place)`);
    }
    await cw.escape();
    const after = await d.eval(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); return e ? (e.innerText || '') : null; })()`);
    if (after !== before) cw.misses.push({ context: 'cell', menu: `cell-${format}`, theme: cw.theme, how: sel, reason: `VALUE CHANGED: ${JSON.stringify(before)} -> ${JSON.stringify(after)}` });
  }

  // A checkbox has no popover: the click is the edit. Toggle, photograph,
  // toggle back, and read the value at both ends so a stuck toggle is visible.
  await onGrid();
  const cbSel = '.viewContent .row .cell.c-checkbox';
  const state = () => d.eval(`(() => { const e = document.querySelector('${cbSel} .icon'); return e ? String(e.className) : null; })()`);
  const start = await state();
  if (start === null) cw.miss('cell-checkbox', cbSel, 'no checkbox cell on the grid');
  else {
    await cw.clickSel(cbSel); await sleep(900);
    await cw.snapEl('cell-checkbox', cbSel, `grid row ▸ click ${cbSel} (toggles in place, toggled back after)`);
    await cw.clickSel(cbSel); await sleep(900);
    const end = await state();
    if (end !== start) cw.misses.push({ context: 'cell', menu: 'cell-checkbox', theme: cw.theme, how: cbSel, reason: `CHECKBOX NOT RESTORED: ${start} -> ${end}` });
  }
  await cw.escape();
}

// ───────────────────────────────────────────────────────────────────
// 9. GENERIC OPENER SWEEP
// ───────────────────────────────────────────────────────────────────
//
// Contexts 3 to 5 are surfaces whose controls are not documented anywhere, so
// each is driven by a candidate list and whatever does not open is reported with
// the reason rather than quietly dropped.

async function sweep(cw, openers, reset = null) {
  for (const o of openers) {
    const { name, sel, mode = 'click', setup, submenus = true, fallback = null } = o;
    await cw.escape();
    // Openers that navigate — a space row, the graph icon, the gallery — leave
    // the next opener's surface unmounted. The reset puts it back.
    if (reset) { try { await reset(); } catch { /* the opener reports it */ } }
    if (setup) {
      try { await setup(); } catch (e) { cw.miss(name, sel, `setup: ${e.message}`); continue; }
    }
    const got = await cw.capture(name, sel, () => (mode === 'hover' ? cw.hoverSel(sel) : mode === 'context' ? cw.contextMenu(sel) : cw.clickSel(sel)), { submenus });
    // Several sidebar and header controls open a page or a docked panel rather
    // than a popover. `fallback` names what to clip when no menu appeared, and a
    // fallback that lands replaces the "no menu appeared" miss rather than
    // sitting next to it.
    if (!got && fallback) {
      const shot = await cw.snapEl(name, fallback, `${sel} (opens a page or panel, not a menu)`, { pad: 0 });
      if (shot) {
        const i = cw.misses.findIndex((m) => m.menu === name && m.theme === cw.theme);
        if (i > -1) cw.misses.splice(i, 1);
      }
    }
  }
}

Object.assign(Crawler.prototype, {
  /** Sidebar rows open their menu on a real contextmenu event, not on a click. */
  contextMenu(sel) {
    return this.d.eval(`(() => {
      const e = document.querySelector(${JSON.stringify(sel)});
      if (!e) return 'MISSING';
      const b = e.getBoundingClientRect();
      const at = { clientX: Math.round(b.left + b.width / 2), clientY: Math.round(b.top + b.height / 2), bubbles: true, cancelable: true, view: window, button: 2 };
      document.dispatchEvent(new MouseEvent('mousemove', at));
      e.dispatchEvent(new MouseEvent('mouseover', { ...at, relatedTarget: document.body }));
      e.dispatchEvent(new MouseEvent('contextmenu', at));
      return 'ok';
    })()`);
  },
});

// ───────────────────────────────────────────────────────────────────
// 10. CONTEXT 3 — AN OBJECT PAGE
// ───────────────────────────────────────────────────────────────────
//
// The properties panel is a docked sidebar rather than a popover, so it is
// clipped to itself; everything else on this surface is a real menu.

async function ctxObject(cw, d, onGrid) {
  cw.context = 'object';
  await cw.escape();
  const opened = await d.eval(`(() => { const e = document.querySelector('.viewContent .row .icon.commonExpand'); if (!e) return 'MISSING'; e.click(); return 'ok'; })()`);
  if (opened !== 'ok') { cw.miss('object-*', '.viewContent .row .icon.commonExpand', 'could not open a record page'); return; }
  await sleep(3500);

  await sweep(cw, [
    { name: 'object-more', sel: '#header .icon.commonMore' },
    { name: 'object-icon-picker', sel: '.editorControls .btn .icon.controlEditorIcon' },
    { name: 'object-cover-picker', sel: '.editorControls .btn .icon.controlEditorCover' },
    { name: 'object-layout-picker', sel: '.editorControls .btn .icon.controlEditorLayout' },
    { name: 'object-type-picker', sel: '.blockFeatured .cellContent.type' },
    { name: 'object-featured-tag', sel: '.blockFeatured .cellContent.c-tag' },
    { name: 'object-block-add', sel: '.icon.plusBlockAdd' },
    { name: 'object-block-menu', sel: '.blockFeatured .icon.blockMenu' },
  ]);

  // The properties panel and its own controls.
  await cw.escape();
  const panelOpen = await d.eval("!!document.querySelector('#sidebarRight .section.objectRelation')");
  const toggled = panelOpen || await cw.clickSel('#header .icon.headerRelation') === 'ok';
  if (toggled) {
    await sleep(1600);
    await cw.snapEl('object-properties-panel', '#sidebarRight', '#header ▸ relations icon', { pad: 8 });
    // Escape closes the docked panel and, pressed enough times, leaves the
    // object page as well — so this loop presses it once and puts both the page
    // and the panel back before each relation rather than going through `sweep`.
    const RELATIONS = [
      ['select', '#sidebarRight .section.objectRelation.c-select.isSelect .cellContent'],
      ['multiselect', '#sidebarRight .section.objectRelation.c-select.isMultiSelect .cellContent'],
      ['date', '#sidebarRight .section.objectRelation.c-date .cellContent'],
      ['object', '#sidebarRight .section.objectRelation.c-object .cellContent'],
      ['file', '#sidebarRight .section.objectRelation.c-file .cellContent'],
      ['number', '#sidebarRight .section.objectRelation.c-number .cellContent'],
      ['checkbox', '#sidebarRight .section.objectRelation.c-checkbox .cellContent'],
      ['url', '#sidebarRight .section.objectRelation.c-url .cellContent'],
    ];
    const panel = async () => {
      if (await d.eval("!!document.querySelector('#sidebarRight .section.objectRelation')")) return true;
      if (!await d.eval("!!document.querySelector('#header .icon.headerRelation')")) {
        if (!await onGrid()) return false;
        if (await d.eval("(() => { const e = document.querySelector('.viewContent .row .icon.commonExpand'); if (!e) return false; e.click(); return true; })()") !== true) return false;
        await sleep(3200);
      }
      await cw.clickSel('#header .icon.headerRelation');
      await sleep(1600);
      return d.eval("!!document.querySelector('#sidebarRight .section.objectRelation')");
    };

    for (const [format, sel] of RELATIONS) {
      await cw.d.key('Escape', 'Escape', 27);
      await sleep(400);
      if (!await panel()) { cw.miss(`object-relation-${format}`, sel, 'the properties panel could not be reopened'); continue; }
      const before = await cw.menus();
      if (await cw.clickSel(sel) !== 'ok') { cw.miss(`object-relation-${format}`, sel, 'no relation of this format on the panel'); continue; }
      await sleep(1400);
      const appeared = await cw.waitNewMenu(before, 4000);
      if (appeared) await cw.shot(`object-relation-${format}`, appeared.all.map((m) => m.rect), `#header ▸ relations ▸ ${sel}`);
      else await cw.snapEl(`object-relation-${format}`, sel, `#header ▸ relations ▸ ${sel} (edits in place)`);
    }

    // A relation's own settings — rename, change format, remove from object.
    await cw.d.key('Escape', 'Escape', 27);
    await sleep(400);
    if (await panel()) {
      const before = await cw.menus();
      const r = await cw.contextMenu('#sidebarRight .section.objectRelation .name');
      if (r === 'ok') {
        await sleep(1300);
        const appeared = await cw.waitNewMenu(before, 4000);
        if (appeared) await cw.shot('object-relation-settings', appeared.all.map((m) => m.rect), '#header ▸ relations ▸ right-click a property name');
        else cw.miss('object-relation-settings', '#sidebarRight .section.objectRelation .name', 'a contextmenu on a property row opened no menu');
      } else cw.miss('object-relation-settings', '#sidebarRight .section.objectRelation .name', r);
    } else cw.miss('object-relation-settings', '#sidebarRight', 'the properties panel could not be reopened');

    await cw.escape();
  } else cw.miss('object-properties-panel', '#header .icon.headerRelation', 'relations icon missing');

  await cw.escape();
  await d.eval(`(() => { const e = document.querySelector('#header .icon.commonBack'); if (e) e.click(); })()`);
  await sleep(2600);
}

// ───────────────────────────────────────────────────────────────────
// 11. CONTEXT 4 — NAVIGATION, AND CONTEXT 5 — CARD SURFACES
// ───────────────────────────────────────────────────────────────────

/**
 * The left sidebar is two stacked pages: a vault rail (`.pageVault`) listing the
 * spaces, and the space's own widget page (`.pageWidget`). Some of what it opens
 * is a menu; the settings entry and the widget toggle open panels instead, and
 * those are clipped to the panel.
 */
async function ctxNav(cw, d, onGrid) {
  cw.context = 'nav';
  await sweep(cw, [
    { name: 'nav-create-object', sel: '.sidebar.left .pageVault .head .icon.plusMenu' },
    { name: 'nav-vault-space-item', sel: '.sidebar.left .pageVault .body .item', mode: 'context' },
    { name: 'nav-vault-gallery', sel: '.sidebar.left .icon.vaultGallery', fallback: '#page' },
    { name: 'nav-help', sel: '.sidebar.left .button.help' },
    { name: 'nav-space-widget', sel: '.sidebar.left .widget.widgetSpace', fallback: '#page' },
    { name: 'nav-space-name', sel: '.sidebar.left .spaceName', fallback: '#page' },
    { name: 'nav-members', sel: '.sidebar.left .icon.widgetMember', fallback: '#page' },
    { name: 'nav-sync', sel: '.sidebar.left .sync' },
    { name: 'nav-widget-section-recent', sel: '.sidebar.left .widgetSection.section-recentedit .nameWrap', mode: 'context' },
    { name: 'nav-widget-section-types', sel: '.sidebar.left .widgetSection.section-type .nameWrap', mode: 'context' },
    { name: 'nav-widget-item', sel: '.sidebar.left .widgetSection.section-recentedit .items .item', mode: 'context' },
    { name: 'nav-widget-bin', sel: '.sidebar.left .widgetSection.section-bin .items .item', mode: 'context' },
    { name: 'nav-history', sel: '#header .icon.commonClock' },
    { name: 'nav-graph', sel: '#header .icon.headerGraph', fallback: '#page' },
  ], onGrid);

  // The vault's search box is an input rather than a popover, so it is clipped
  // to itself once focused.
  await cw.escape();
  if (await cw.clickSel('.sidebar.left .pageVault .filter') === 'ok') {
    await sleep(900);
    await cw.snapEl('nav-vault-search', '.sidebar.left .pageVault .filterWrapper', '.sidebar.left ▸ vault filter input');
  } else cw.miss('nav-vault-search', '.sidebar.left .pageVault .filter', 'no vault filter input');

  // Settings opens a page, not a menu, and its own navigation is the left
  // sidebar rather than anything inside the page. Escape leaves settings
  // entirely, so each entry re-enters rather than assuming it is still there.
  const enterSettings = async () => {
    if (await d.eval("!!document.querySelector('#settingsPageContainer')")) return true;
    if (await cw.clickSel('.sidebar.left .appSettings') !== 'ok') return false;
    await sleep(2600);
    return d.eval("!!document.querySelector('#settingsPageContainer')");
  };

  await cw.escape();
  if (!await enterSettings()) {
    cw.miss('nav-settings', '.sidebar.left .appSettings', 'settings entry missing');
    return;
  }
  await cw.snapEl('nav-settings', '#settingsPageContainer', '.sidebar.left ▸ account name', { pad: 0 });

  const SETTINGS_PAGES = ['Preferences', 'Language & Region', 'Pin Code', 'Login Key', 'Membership', 'Local storage', 'Channels', 'My Sites', 'API Keys'];
  for (const page of SETTINGS_PAGES) {
    if (!await enterSettings()) { cw.miss(`nav-settings-${slug(page)}`, `settings ▸ "${page}"`, 'settings page could not be re-entered'); continue; }
    const r = await d.eval(`(() => {
      const el = Array.from(document.querySelectorAll('.sidebar.left .item'))
        .find(e => (e.innerText || '').trim() === ${JSON.stringify(page)});
      if (!el) return 'MISSING';
      el.click();
      return 'ok';
    })()`);
    if (r !== 'ok') { cw.miss(`nav-settings-${slug(page)}`, `settings ▸ "${page}"`, 'no such entry in the settings sidebar'); continue; }
    await sleep(1900);
    await cw.snapEl(`nav-settings-${slug(page)}`, '#settingsPageContainer', `settings ▸ "${page}"`, { pad: 0 });

    // Any select the page carries, opened in turn. `capture` escapes first, and
    // Escape exits settings, so the page is re-entered and re-selected each time.
    const selects = await d.eval("document.querySelectorAll('#settingsPageContainer .select').length");
    for (let i = 0; i < Math.min(selects, 4); i += 1) {
      await cw.capture(`nav-settings-${slug(page)}-select-${i + 1}`,
        `settings ▸ "${page}" ▸ select #${i + 1}`,
        async () => {
          if (!await enterSettings()) return 'MISSING';
          await d.eval(`(() => {
            const el = Array.from(document.querySelectorAll('.sidebar.left .item')).find(e => (e.innerText || '').trim() === ${JSON.stringify(page)});
            if (el) el.click();
          })()`);
          await sleep(1600);
          return d.eval(`(() => {
            const el = document.querySelectorAll('#settingsPageContainer .select')[${i}];
            if (!el) return 'MISSING';
            el.click();
            return 'ok';
          })()`);
        },
        { submenus: false });
    }
  }
  await cw.escape();
  await onGrid();
}

/**
 * Kanban columns and cards, calendar days and their date selects, gallery cards
 * and list rows. Card menus open on a contextmenu event rather than a click; the
 * "+" affordances on a column head and a calendar day create an object, so they
 * are refused rather than opened.
 */
async function ctxCards(cw, d, selectView, reopen) {
  const surfaces = {
    kanban: [
      { name: 'kanban-column-menu', sel: '.viewContent .column .head .icon.commonMore' },
      { name: 'kanban-card-menu', sel: '.viewContent .column .card.isPage', mode: 'context' },
    ],
    calendar: [
      { name: 'calendar-month-select', sel: '.dateSelect .select.month' },
      { name: 'calendar-year-select', sel: '.dateSelect .select.year' },
      { name: 'calendar-item-menu', sel: '.viewContent .day .items > div', mode: 'context' },
      { name: 'calendar-day-menu', sel: '.viewContent .day .head', mode: 'context' },
    ],
    gallery: [
      { name: 'gallery-card-menu', sel: '.viewContent .card.isPage', mode: 'context' },
    ],
    list: [
      { name: 'list-row-menu', sel: '.viewContent .row .dropTarget', mode: 'context' },
    ],
  };
  for (const [layout, openers] of Object.entries(surfaces)) {
    cw.context = layout;
    await reopen();
    const ok = await selectView(layout);
    if (!ok) { cw.miss(`${layout}-*`, `view tab "${layout}"`, 'view tab not found on the controls bar'); continue; }
    await sweep(cw, openers);
  }
}

// ───────────────────────────────────────────────────────────────────
// 12. THE DISCOVERY PASS
// ───────────────────────────────────────────────────────────────────
//
// The seed lists above say what to look for. This says what was there that they
// did not name: every control on the current surface that carries one of the
// classes Anytype gives a menu opener, minus the ones already captured.

const OPENER_SELECTOR = [
  '.icon.more', '.icon.commonMore', '.icon.commonOptions', '.icon.plusMenu',
  '.icon.arrowSelect', '.select', '.withSelect', '.icon.commonSettings',
  '[class*="btn-"]', '.icon.controlDataviewFilter', '.icon.commonSort',
].join(', ');

async function discoverSurface(cw, d, surface, scope) {
  const found = await d.eval(`JSON.stringify((() => {
    const root = document.querySelector(${JSON.stringify(scope)});
    if (!root) return null;
    const seen = new Set();
    return Array.from(root.querySelectorAll(${JSON.stringify(OPENER_SELECTOR)})).map(e => {
      const r = e.getBoundingClientRect();
      return { cls: String(e.className).trim().split(/\\s+/).slice(0, 4).join('.'),
               text: (e.innerText || '').trim().split('\\n')[0].slice(0, 28),
               visible: r.width > 0 && r.height > 0 };
    }).filter(x => x.visible && !seen.has(x.cls + x.text) && seen.add(x.cls + x.text));
  })())`).then(JSON.parse);
  return { surface, scope, found: found ?? [], missing: found === null };
}

// ───────────────────────────────────────────────────────────────────
// 13. MAIN
// ───────────────────────────────────────────────────────────────────

async function main() {
  const load = JSON.parse(await readFile(join(HERE, 'load-report.json'), 'utf8'));
  const views = JSON.parse(await readFile(join(HERE, 'views-report.json'), 'utf8'));
  const set = load.sets.find((s) => s.id === (arg('--set') ?? 'project-tracker'));
  const expected = views.find((v) => v.id === set.id).viewNames;
  const outDir = arg('--out') ?? join(HERE, 'menu-captures');
  await mkdir(outDir, { recursive: true });

  const d = await Driver.attach(arg('--target'));
  const index = [];
  const misses = [];
  const discovery = [];
  const cw = new Crawler(d, outDir, index, misses);

  // The tab this sweep drives has to stay the visible one; see the tab guard.
  const visible = await d.eval("document.visibilityState");
  if (visible !== 'visible') throw new Error(`the target tab is "${visible}", not the visible one — activate it before running`);
  cw.tabs = await TabGuard.attach();
  const startTabs = cw.tabs ? await cw.tabs.init() : [];
  log(`tabs: ${JSON.stringify(startTabs.map((t) => t.name))}${cw.tabs ? '' : '  (no tab strip target; guard disabled)'}`);
  const only = arg('--only');
  const wanted = (c) => !only || only.split(',').includes(c);

  const selectView = async (label) => {
    await cw.escape();
    const r = await d.eval(`(() => {
      const t = Array.from(document.querySelectorAll('#views .viewItem')).find(e => (e.innerText || '').trim().toLowerCase() === ${JSON.stringify(label)});
      if (!t) return 'MISSING';
      t.click();
      return 'ok';
    })()`);
    if (r !== 'ok') return false;
    await sleep(label === 'graph' ? 5000 : 3200);
    return true;
  };

  const before = await assertViews(d, expected);
  log(`views before: ${JSON.stringify(before.got)}${before.ok ? '' : '  ← DOES NOT MATCH views-report.json'}`);

  const themes = arg('--theme') ? { [arg('--theme')]: THEMES[arg('--theme')] } : THEMES;
  for (const [theme, id] of Object.entries(themes)) {
    cw.theme = theme;
    const cls = await setTheme(d, id);
    log(`\n##### theme ${theme} (body class "${cls}") #####`);
    await d.openCollection(set.collectionId, load.space);
    await selectView('grid');

    // Every context re-navigates first. A menu left open, a sidebar toggled or a
    // record page pushed onto the history all survive into the next context
    // otherwise, and the symptom is a whole context reporting "no element" for
    // selectors that are demonstrably there.
    const onGrid = async () => {
      if (await d.eval("document.querySelectorAll('.viewContent .row').length") > 0) return true;
      await cw.escape();
      await d.openCollection(set.collectionId, load.space);
      await selectView('grid');
      try { await d.waitFor('.viewContent .row', 12000); return true; } catch { return false; }
    };

    if (wanted('set')) { log('  context: set'); await onGrid(); await ctxSetControls(cw, d); }
    if (wanted('reallayouts')) { log('  context: set (populated layouts)'); await onGrid(); await ctxRealLayouts(cw, d, selectView, expected); }
    if (wanted('cell')) { log('  context: cell'); await onGrid(); await ctxCells(cw, d, onGrid); }
    if (wanted('object')) { log('  context: object'); await onGrid(); await ctxObject(cw, d, onGrid); }
    if (wanted('nav')) { log('  context: nav'); await onGrid(); await ctxNav(cw, d, onGrid); }
    if (wanted('cards')) { log('  context: cards'); await ctxCards(cw, d, selectView, onGrid); }

    // Discovery runs once, on the theme that happens to be active last.
    await cw.escape();
    await d.openCollection(set.collectionId, load.space);
    await selectView('grid');
    discovery.length = 0;
    for (const [surface, scope] of [['controls', '#dataviewControls'], ['sidebar', '.sidebar.left'], ['header', '#header'], ['grid', '.viewContent']]) {
      discovery.push(await discoverSurface(cw, d, surface, scope));
    }
  }

  await setTheme(d, 'dark');
  await cw.escape();
  const after = await assertViews(d, expected);
  log(`\nviews after: ${JSON.stringify(after.got)}${after.ok ? '  (unchanged)' : '  ← REPAIR NEEDED'}`);

  const endTabs = cw.tabs ? await cw.tabs.list() : [];
  await writeFile(join(HERE, 'menus-report.json'), JSON.stringify({
    set: set.id, space: load.space, viewsBefore: before, viewsAfter: after,
    tabsBefore: startTabs.map((t) => t.name), tabsAfter: endTabs.map((t) => t.name),
    tabRepairs: cw.tabs ? cw.tabs.repairs : [],
    captures: index, misses, discovery,
  }, null, 2));
  cw.tabs?.close();
  log(`\n${index.length} captures -> ${outDir}`);
  log(`${misses.length} not captured`);
  d.close();
}

await main();
process.exit(0);
