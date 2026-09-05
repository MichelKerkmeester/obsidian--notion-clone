#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    capture
// COMPONENT: photographs every set in every layout, in both themes
// ───────────────────────────────────────────────────────────────────
//
// Page.captureScreenshot renders from the page itself, independent of window
// position, focus or visibility, so this never activates the Anytype window or
// disturbs whatever its operator is doing.
//
// The theme is switched through the same main-process bridge the Settings UI
// calls, which needs no navigation and no native menu accelerator. The app is
// left on the theme it was found on.
//
// Usage: node tools/mock-data/anytype/capture.mjs --target <cdpTargetId> --out <dir>
// Exit:  0 once the sweep finishes; per-capture failures are recorded, not fatal.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Driver, sleep } from './driver.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const log = (...a) => console.log(...a);
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : undefined; };

/** Theme ids as Action.themeSet uses them: '' is light, 'dark' is dark. */
// ───────────────────────────────────────────────────────────────────
// 2. THEMES
// ───────────────────────────────────────────────────────────────────

const THEMES = { light: '', dark: 'dark' };

async function setTheme(d, id) {
  await d.eval(`window.Electron.Api(window.Electron.winId(), 'setTheme', [${JSON.stringify(id)}])`);
  await sleep(2500);
  return d.eval(`document.body.className`);
}

// ───────────────────────────────────────────────────────────────────
// 3. NAVIGATION
// ───────────────────────────────────────────────────────────────────

/**
 * Prefer the tab's name, fall back to its position. A view rename can fail
 * silently in this app, and a sweep that then photographs tab one six times
 * produces six plausible files of the wrong thing — the failure mode worth
 * engineering against here, since nothing downstream would catch it.
 */
async function selectView(d, name, index) {
  const r = await d.eval(`(() => {
    const tabs = Array.from(document.querySelectorAll('#views .viewItem'));
    const byName = tabs.find(e => (e.innerText || '').trim() === ${JSON.stringify(name)});
    const el = byName || tabs[${index}];
    if (!el) return 'MISSING:' + JSON.stringify(tabs.map(e => (e.innerText||'').trim()));
    el.click();
    return byName ? 'ok' : 'ok-by-index';
  })()`);
  if (!r.startsWith('ok')) throw new Error(`view "${name}" -> ${r}`);
  // Kanban and Calendar rebuild their whole grid on switch; Graph runs a
  // force-directed layout that keeps moving for a beat after it mounts.
  await sleep(name === 'Graph' ? 5000 : 3000);
  if (name === 'Calendar') await backToRecords(d);
}

/**
 * The calendar opens on the current month, and the catalogue's dates are months
 * behind it, so a capture taken as found photographs an empty grid that is
 * correct and shows nothing. Step back a month at a time until records appear.
 *
 * Every day cell holds a drop target whether or not it has records, so presence
 * is counted by text: an empty day's item has none.
 */
async function backToRecords(d, maxMonths = 18) {
  for (let i = 0; i < maxMonths; i += 1) {
    const items = await d.eval(`Array.from(document.querySelectorAll('.viewContent .day .items > *')).filter(e => (e.innerText || '').trim()).length`);
    if (items > 0) return true;
    const r = await d.eval(`(() => {
      const prev = document.querySelector('.dateSelect .side.right .icon.arrow.left');
      if (!prev) return 'MISSING';
      prev.click();
      return 'ok';
    })()`);
    if (r !== 'ok') return false;
    await sleep(1400);
  }
  return false;
}

// ───────────────────────────────────────────────────────────────────
// 4. MAIN
// ───────────────────────────────────────────────────────────────────

async function main() {
  const report = JSON.parse(await readFile(join(HERE, 'load-report.json'), 'utf8'));
  const views = JSON.parse(await readFile(join(HERE, 'views-report.json'), 'utf8'));
  const outDir = arg('--out') ?? join(HERE, 'captures');
  await mkdir(outDir, { recursive: true });

  const d = await Driver.attach(arg('--target'));
  const only = arg('--only');
  const sets = report.sets.filter((s) => !only || s.id === only);
  const index = [];

  for (const [theme, id] of Object.entries(THEMES)) {
    const cls = await setTheme(d, id);
    log(`\n##### theme ${theme} (body class "${cls.trim()}") #####`);
    for (const set of sets) {
      const built = views.find((v) => v.id === set.id);
      if (!built) { log(`  ${set.id}: no views built, skipped`); continue; }
      await d.escape();
      await d.openCollection(set.collectionId, report.space);
      for (const [i, v] of built.views.entries()) {
        try {
          await selectView(d, v.name, i);
          const file = `anytype-${set.id}-${v.layout.toLowerCase()}-${theme}.png`;
          await d.c.screenshot(join(outDir, file));
          const rows = await d.rowCount();
          const shown = await d.eval(`(() => { const e = document.querySelector('#dataviewControls'); return e ? String(e.className) : ''; })()`);
          index.push({ file, set: set.id, setName: set.name, layout: v.layout, theme, rows, controlsClass: shown.trim(), ...v });
          log(`  ${file} (rows in DOM: ${rows})`);
        } catch (e) {
          log(`  FAILED ${set.id}/${v.layout}/${theme}: ${e.message.slice(0, 120)}`);
          index.push({ set: set.id, layout: v.layout, theme, error: e.message.slice(0, 200) });
        }
      }
    }
  }

  // Leave the app as it was found.
  await setTheme(d, 'dark');
  await writeFile(join(HERE, 'capture-report.json'), JSON.stringify(index, null, 2));
  log(`\n${index.filter((i) => i.file).length} captures -> ${outDir}`);
  d.close();
}

await main();
process.exit(0);
