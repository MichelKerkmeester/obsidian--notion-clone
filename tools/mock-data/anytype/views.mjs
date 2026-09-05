#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    views
// COMPONENT: gives every loaded collection its six layouts, a sort and a filter
// ───────────────────────────────────────────────────────────────────
//
// The local HTTP API cannot create views, so this leg drives the renderer's own
// menus. It never moves the pointer or takes focus.
//
// Property additions are paid once per set rather than once per view: the six
// layouts are built by duplicating the configured Grid view, which carries its
// relation list across, and then changing the duplicate's layout.
//
// Usage: node tools/mock-data/anytype/views.mjs --target <cdpTargetId> [--only <setId>]
// Exit:  0 when every set built; non-zero on the first menu that did not open.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Driver, sleep } from './driver.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const log = (...a) => console.log(...a);

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : undefined;
};

// ───────────────────────────────────────────────────────────────────
// 2. VIEW BUILDER
// ───────────────────────────────────────────────────────────────────

class ViewBuilder {
  constructor(d) { this.d = d; }

  /**
   * Anytype opens a row's sub-picker on mouseenter and explicitly no-ops its
   * onClick, so these rows cannot be reached with a click. The app also latches
   * `keyboard.isMouseDisabled` after any key press and only clears it on a
   * mousemove, which is why one is dispatched on the document first.
   */
  async hover(selector) {
    const r = await this.d.eval(`(() => {
      const e = document.querySelector(${JSON.stringify(selector)});
      if (!e) return 'MISSING';
      const b = e.getBoundingClientRect();
      const at = { clientX: Math.round(b.left + b.width / 2), clientY: Math.round(b.top + b.height / 2), bubbles: true, cancelable: true, view: window };
      document.dispatchEvent(new MouseEvent('mousemove', at));
      e.dispatchEvent(new MouseEvent('mouseover', { ...at, relatedTarget: document.body }));
      e.dispatchEvent(new MouseEvent('mouseenter', at));
      return 'ok';
    })()`);
    if (r !== 'ok') throw new Error(`hover ${selector} -> ${r}`);
    await sleep(900);
  }

  openViewSettings() { return this.d.click('#dataviewControls .btn-settings', { wait: 1100 }); }

  /** The "+" creates the view and auto-opens its settings after a 50ms timer. */
  async addView() {
    await this.d.click('#dataviewControls #views .plus', { wait: 1500 });
    await this.d.waitFor('#menuDataviewViewSettings');
  }

  /**
   * Only Enter commits a view name. Blurring the input leaves the typed text
   * visible in the field and silently discards it, which is a rename that looks
   * like it worked in the DOM and is gone the moment the menu closes. Enter also
   * closes the settings menu, so a caller that needs it open must reopen it.
   */
  async renameView(name) {
    const sel = '#menuDataviewViewSettings input.input-text';
    await this.d.eval(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (e) { e.focus(); e.setSelectionRange(0, e.value.length); } })()`);
    await sleep(250);
    await this.d.typeInto(sel, name);
    await this.d.key('Enter', 'Enter', 13);
    await sleep(1000);
  }

  /** The layout a view is actually rendering, read off the controls bar. */
  async currentLayout() {
    const cls = await this.d.eval(`(() => { const e = document.querySelector('#dataviewControls'); return e ? String(e.className) : ''; })()`);
    const hit = Object.entries(CONTROLS_CLASS).find(([c]) => cls.split(/\s+/).includes(c));
    return hit ? hit[1] : null;
  }

  /** Select a view tab by position; the tabs render in creation order. */
  async selectTab(index) {
    const r = await this.d.eval(`(() => {
      const tabs = document.querySelectorAll('#views .viewItem');
      if (!tabs[${index}]) return 'MISSING:' + tabs.length;
      tabs[${index}].click();
      return 'ok';
    })()`);
    if (r !== 'ok') throw new Error(`selectTab(${index}) -> ${r}`);
    await sleep(2200);
  }

  /** Layout tiles carry no id; they are identified by their icon class. */
  async setLayout(iconClass) {
    await this.d.click('#menuDataviewViewSettings #item-layout', { wait: 1000 });
    await this.d.waitFor('#menuDataviewViewLayout');
    const r = await this.d.eval(`(() => {
      const i = document.querySelector('#menuDataviewViewLayout .layouts .icon.${iconClass}');
      if (!i) return 'MISSING';
      (i.closest('.layout') || i).click();
      return 'ok';
    })()`);
    if (r !== 'ok') throw new Error(`layout ${iconClass} -> ${r}`);
    await sleep(2200);
  }

  /** Kanban's group-by and Calendar's date row share the id; only the label differs. */
  async setGroupRelation(propertyName) {
    await this.hover('#menuDataviewViewLayout #item-groupRelationKey');
    await this.d.waitFor('#menuSelect', 6000);
    const r = await this.d.eval(`(() => {
      const m = document.querySelector('#menuSelect');
      const want = ${JSON.stringify(propertyName)};
      const el = Array.from(m.querySelectorAll('.item')).find(i => (i.innerText || '').trim().split('\\n')[0].trim() === want);
      if (!el) return 'NOOPT:' + JSON.stringify(Array.from(m.querySelectorAll('.item')).map(i => (i.innerText||'').trim().split('\\n')[0]).slice(0, 25));
      el.click();
      return 'ok';
    })()`);
    if (r !== 'ok') throw new Error(`group ${propertyName} -> ${r}`);
    await sleep(2000);
  }

  /**
   * Names already shown by the current Grid view. Read off the grid header, not
   * the relation-list menu: that menu is virtualised, so it renders only the
   * rows in view and reports properties as missing that are already there.
   */
  async viewProperties() {
    return JSON.parse(await this.d.eval(`JSON.stringify(Array.from(document.querySelectorAll('.viewContent .cellHead'))
      .map(h => (h.innerText || '').trim()).filter(Boolean))`));
  }

  /** Add one property to the current view's relation list. */
  async addProperty(name) {
    await this.d.click('#menuDataviewRelationList #item-add', { wait: 900 });
    await this.d.waitFor('#menuRelationSuggest', 6000);
    await this.d.typeInto('#menuRelationSuggest input', name);
    await sleep(700);
    const r = await this.d.eval(`(() => {
      const m = document.querySelector('#menuRelationSuggest');
      if (!m) return 'GONE';
      const want = ${JSON.stringify(name)};
      const el = Array.from(m.querySelectorAll('.item'))
        .find(i => (i.innerText || '').trim().split('\\n')[0].trim() === want);
      if (!el) return 'NOITEM:' + JSON.stringify(Array.from(m.querySelectorAll('.item')).map(i => (i.innerText||'').trim().split('\\n')[0]).slice(0, 8));
      el.click();
      return 'ok';
    })()`);
    await sleep(700);
    return r;
  }

  /** Sort and filter share one helper menu, differing only in the row that opens it. */
  async addRule(kind, propertyName) {
    const item = kind === 'sort' ? '#item-sort' : '#item-filter';
    const menu = kind === 'sort' ? '#menuDataviewSort' : '#menuDataviewFilterList';
    await this.openViewSettings();
    await this.d.waitFor('#menuDataviewViewSettings');
    await this.d.click(`#menuDataviewViewSettings ${item}`, { wait: 1100 });
    await this.d.waitFor(menu, 6000);
    await this.d.click(`${menu} #item-add`, { wait: 1200 });
    await this.d.waitFor('#menuSelect', 6000);
    const r = await this.d.eval(`(() => {
      const m = document.querySelector('#menuSelect');
      const want = ${JSON.stringify(propertyName)};
      const el = Array.from(m.querySelectorAll('.item')).find(i => (i.innerText || '').trim().split('\\n')[0].trim() === want);
      if (!el) return 'NOOPT:' + JSON.stringify(Array.from(m.querySelectorAll('.item')).map(i => (i.innerText||'').trim().split('\\n')[0]).slice(0, 30));
      el.click();
      return 'ok';
    })()`);
    if (r !== 'ok') throw new Error(`${kind} ${propertyName} -> ${r}`);
    await sleep(1800);
    await this.d.escape();
    return r;
  }
}

// ───────────────────────────────────────────────────────────────────
// 3. LAYOUTS
// ───────────────────────────────────────────────────────────────────

// The controls bar carries the active view's layout as a class, which is the
// only place the rendered layout can be read back rather than assumed.
const CONTROLS_CLASS = {
  viewGrid: 'Grid',
  viewGallery: 'Gallery',
  viewList: 'List',
  viewBoard: 'Kanban',
  viewKanban: 'Kanban',
  viewCalendar: 'Calendar',
  viewGraph: 'Graph',
};

const LAYOUT_ICON = {
  Grid: 'dataviewViewGrid',
  Gallery: 'dataviewViewGallery',
  List: 'dataviewViewList',
  Kanban: 'dataviewViewKanban',
  Calendar: 'dataviewViewCalendar',
  Graph: 'dataviewViewGraph',
};

// ───────────────────────────────────────────────────────────────────
// 4. BUILD
// ───────────────────────────────────────────────────────────────────

async function buildSet(vb, d, set, spaceId) {
  const result = { id: set.id, views: [], properties: { added: 0, failed: [] } };
  await d.openCollection(set.collectionId, spaceId);
  log(`  rows in UI: ${await d.rowCount()}`);

  // 1. Every catalogue column onto the default view, so the grid actually shows
  //    them — and so Kanban's group-by and the sort/filter pickers can see them.
  const already = new Set(await vb.viewProperties());
  await vb.openViewSettings();
  await d.waitFor('#menuDataviewViewSettings');
  await vb.renameView('Grid');
  await vb.openViewSettings();
  await d.waitFor('#menuDataviewViewSettings');
  await d.click('#menuDataviewViewSettings #item-relations', { wait: 1200 });
  await d.waitFor('#menuDataviewRelationList', 6000);
  for (const p of set.properties) {
    const shown = p.propertyName ?? p.label;
    if (already.has(shown)) { result.properties.added += 1; continue; }
    const r = await vb.addProperty(shown);
    if (r === 'ok') result.properties.added += 1;
    else result.properties.failed.push({ label: shown, reason: String(r).slice(0, 120) });
  }
  await d.escape();
  await sleep(1200);
  // The authoritative count is what the grid actually renders.
  const shown = new Set(await vb.viewProperties());
  result.properties.onGrid = set.properties.filter((p) => shown.has(p.propertyName ?? p.label)).length;
  result.properties.failed = result.properties.failed.filter((f) => !shown.has(f.label));
  log(`  properties on grid: ${result.properties.onGrid}/${set.properties.length}`);
  if (result.properties.failed.length) {
    log(`  FAILED: ${result.properties.failed.map((f) => `${f.label} -> ${f.reason}`).join(' ;; ')}`);
  }

  const byNeutral = (t) => set.properties.find((p) => p.neutralType === t);
  const statusProp = byNeutral('status');
  const dateProp = byNeutral('date');

  // 2. A sort on the Grid view.
  await vb.addRule('sort', dateProp.propertyName ?? dateProp.label);
  result.views.push({ name: 'Grid', layout: 'Grid', sort: dateProp.label });

  // 3. The other five layouts. Duplicating carries the relation list across, so
  //    the 27 property additions above are paid once per set rather than per view.
  for (const name of ['Gallery', 'List', 'Kanban', 'Calendar', 'Graph']) {
    await vb.openViewSettings();
    await d.waitFor('#menuDataviewViewSettings');
    await d.click('#menuDataviewViewSettings #item-copy', { wait: 2500 });
    await vb.openViewSettings();
    await d.waitFor('#menuDataviewViewSettings');
    await vb.renameView(name);
    await vb.openViewSettings();
    await d.waitFor('#menuDataviewViewSettings');
    await vb.setLayout(LAYOUT_ICON[name]);

    const entry = { name, layout: name };
    if (name === 'Kanban') {
      await vb.setGroupRelation(statusProp.propertyName ?? statusProp.label);
      entry.groupedBy = statusProp.label;
    }
    if (name === 'Calendar') {
      await vb.setGroupRelation(dateProp.propertyName ?? dateProp.label);
      entry.dateProperty = dateProp.label;
    }
    await d.escape();

    if (name === 'List') {
      await vb.addRule('filter', statusProp.propertyName ?? statusProp.label);
      entry.filter = statusProp.label;
    }
    result.views.push(entry);
    log(`  view ${name}${entry.groupedBy ? ` grouped by ${entry.groupedBy}` : ''}${entry.dateProperty ? ` on ${entry.dateProperty}` : ''}${entry.filter ? ` filtered on ${entry.filter}` : ''}`);
  }

  result.viewNames = await d.viewNames();
  return result;
}

// ───────────────────────────────────────────────────────────────────
// 5. MAIN
// ───────────────────────────────────────────────────────────────────

/**
 * Name each existing view tab after the layout it is actually rendering, read
 * off the controls bar rather than assumed from creation order. Used to repair
 * a build whose renames did not commit, without rebuilding sixty views.
 */
async function nameViews(vb, d, set, spaceId) {
  await d.openCollection(set.collectionId, spaceId);
  const count = (await d.viewNames()).length;
  const named = [];
  for (let i = 0; i < count; i += 1) {
    await vb.selectTab(i);
    const layout = await vb.currentLayout();
    if (!layout) { named.push({ index: i, layout: null, error: 'layout class not recognised' }); continue; }
    await vb.openViewSettings();
    await d.waitFor('#menuDataviewViewSettings');
    await vb.renameView(layout);
    named.push({ index: i, layout, name: layout });
  }
  const after = await d.viewNames();
  log(`  ${set.id.padEnd(22)} ${JSON.stringify(after)}`);
  return { id: set.id, viewNames: after, named };
}

async function main() {
  const report = JSON.parse(await readFile(join(HERE, 'load-report.json'), 'utf8'));
  const only = arg('--only');
  const sets = only ? report.sets.filter((s) => s.id === only) : report.sets;
  const d = await Driver.attach(arg('--target'));
  const vb = new ViewBuilder(d);

  if (process.argv.includes('--names')) {
    const outPath = join(HERE, 'views-report.json');
    const existing = JSON.parse(await readFile(outPath, 'utf8'));
    for (const set of sets) {
      await d.escape();
      const r = await nameViews(vb, d, set, report.space);
      const e = existing.find((x) => x.id === set.id);
      if (e) {
        e.viewNames = r.viewNames;
        // Re-key each recorded view to the layout the tab actually renders.
        e.views = r.named.map((n, i) => ({ ...(e.views[i] ?? {}), name: n.name ?? e.views[i]?.name, layout: n.layout ?? e.views[i]?.layout }));
      }
      await writeFile(outPath, JSON.stringify(existing, null, 2));
    }
    d.close();
    return;
  }

  const outPath = join(HERE, 'views-report.json');
  // Merge into whatever is already on disk, and write after every set: a run
  // that dies on set eight must not throw away the seven it finished.
  let out = [];
  try { out = JSON.parse(await readFile(outPath, 'utf8')); } catch { /* first run */ }

  for (const set of sets) {
    log(`\n=== ${set.name} ===`);
    await d.escape();
    const built = await buildSet(vb, d, set, report.space);
    out = out.filter((o) => o.id !== built.id).concat(built);
    await writeFile(outPath, JSON.stringify(out, null, 2));
  }
  log(`\nreport -> ${outPath}`);
  d.close();
}

await main();
process.exit(0);
