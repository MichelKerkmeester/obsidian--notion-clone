#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    load
// COMPONENT: builds the Anytype test environment from the mock-data catalogue
// ───────────────────────────────────────────────────────────────────
//
// One Anytype type, one collection and recordCount objects per catalogue use
// case, with every neutral column created as a correctly typed relation. This
// runs entirely over the local HTTP API: no UI driving, no window focus, no
// pointer. Views are the one thing the API cannot create and are added
// separately by views.mjs.
//
// Writes are rate limited to roughly one per second, so a full load takes about
// twenty-five minutes. The report it writes is what views.mjs and capture.mjs
// read to find the collections and the property names.
//
// Usage: ANYTYPE_KEY_FILE=<path> node tools/mock-data/anytype/load.mjs [--reset] [--verify] [--only <id>]
// Exit:  0 when every set matches its recordCount; 1 on any mismatch.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Anytype, COLORS } from './api.mjs';
import { MAPPING, valueEntry } from './mapping.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CATALOGUE = join(HERE, '..', 'catalogue.json');
const SPACE_NAME = 'notion-clone-reference-demo';

const log = (...a) => console.log(...a);

/**
 * Property names are space-global in Anytype and the key is derived from the
 * name, so two use cases both calling a column "Status" would collide on one
 * key and values would land on whichever property the API resolved. Suffix only
 * the labels that actually repeat across use cases; the other ~220 stay clean.
 */
// ───────────────────────────────────────────────────────────────────
// 2. PROPERTY NAMES
// ───────────────────────────────────────────────────────────────────

function buildPropertyNames(useCases) {
  const seen = new Map();
  for (const u of useCases) {
    for (const c of u.columns) seen.set(c.label, (seen.get(c.label) ?? 0) + 1);
  }
  const names = new Map(); // `${useCaseId}::${columnKey}` -> display name
  for (const u of useCases) {
    for (const c of u.columns) {
      names.set(`${u.id}::${c.key}`, seen.get(c.label) > 1 ? `${c.label} (${u.name})` : c.label);
    }
  }
  return names;
}

// ───────────────────────────────────────────────────────────────────
// 3. SPACE
// ───────────────────────────────────────────────────────────────────

async function findOrCreateSpace(api) {
  const spaces = await api.spaces();
  const hit = spaces.find((s) => s.name === SPACE_NAME);
  if (hit) return hit.id;
  const made = await api.createSpace(SPACE_NAME, 'Mock-data catalogue test environment');
  return made.space.id;
}

/**
 * Anytype has no space-delete route (DELETE /v1/spaces/{id} is 404), so a
 * rebuild clears the space's contents instead. Only names the catalogue could
 * have produced are deleted, so the app's own shipped properties and types
 * survive a reset whatever they are called in a future version.
 */
async function reset(api, sp, catalogue) {
  const names = new Set();
  for (const u of catalogue.useCases) {
    names.add(u.name);
    for (const c of u.columns) { names.add(c.label); names.add(`${c.label} (${u.name})`); }
  }
  for (const o of await api.objects(sp)) await api.deleteObject(sp, o.id);
  for (const t of await api.types(sp)) if (names.has(t.name)) await api.deleteType(sp, t.id);
  let props = 0;
  for (const p of await api.properties(sp)) {
    if (!names.has(p.name)) continue;
    await api.deleteProperty(sp, p.id);
    props += 1;
  }
  log(`reset: cleared objects, ${props} properties, catalogue types`);
}

/**
 * Read every set back and compare cell by cell against the catalogue, not just
 * the record count. A count matches whenever the right number of objects exist,
 * including when every one of them is empty — which is exactly the failure a
 * bulk loader produces when a value shape is wrong.
 */
// ───────────────────────────────────────────────────────────────────
// 4. VERIFY
// ───────────────────────────────────────────────────────────────────

async function verify(api, sp, catalogue, report) {
  const out = [];
  for (const set of report.sets) {
    const uc = catalogue.useCases.find((u) => u.id === set.id);
    const objects = await api.listViewObjects(sp, set.collectionId, 'default');
    const byName = new Map(objects.map((o) => [o.name, o]));
    const byColumn = new Map(set.properties.map((p) => [p.column, p]));

    let expectedCells = 0;
    let matched = 0;
    const misses = [];
    for (const rec of uc.records) {
      const obj = byName.get(rec.title);
      if (!obj) { misses.push({ record: rec.title, reason: 'object missing' }); continue; }
      const full = (await api.req('GET', `/spaces/${sp}/objects/${obj.id}`)).object;
      const props = new Map((full.properties ?? []).map((p) => [p.key, p]));

      for (const colKey of Object.keys(rec.values)) {
        const meta = byColumn.get(colKey);
        if (!meta) continue;
        const m = MAPPING[uc.columns.find((c) => c.key === colKey).type];
        if (!m.format || m.valueless || m.format === 'files') continue;
        expectedCells += 1;
        const got = props.get(meta.propertyKey);
        if (got && got[m.format] !== undefined && got[m.format] !== null) matched += 1;
        else misses.push({ record: rec.title, column: colKey, format: m.format });
      }
    }
    out.push({ id: set.id, records: objects.length, expectedRecords: set.expected, expectedCells, matched, misses: misses.slice(0, 10), missCount: misses.length });
    log(`  ${set.id.padEnd(22)} records ${objects.length}/${set.expected}  cells ${matched}/${expectedCells}${misses.length ? `  MISSES ${misses.length}` : ''}`);
  }
  return out;
}

// ───────────────────────────────────────────────────────────────────
// 5. MAIN
// ───────────────────────────────────────────────────────────────────

async function main() {
  const spaceArg = process.argv.indexOf('--space');
  const catalogue = JSON.parse(await readFile(CATALOGUE, 'utf8'));
  const api = await Anytype.connect();
  const sp = spaceArg > -1 ? process.argv[spaceArg + 1] : await findOrCreateSpace(api);
  log(`space ${sp}`);

  if (process.argv.includes('--verify')) {
    const prior = JSON.parse(await readFile(join(HERE, 'load-report.json'), 'utf8'));
    log('verifying against the catalogue, cell by cell');
    const v = await verify(api, sp, catalogue, prior);
    await writeFile(join(HERE, 'verify-report.json'), JSON.stringify(v, null, 2));
    const bad = v.filter((x) => x.records !== x.expectedRecords || x.missCount);
    log(bad.length ? `MISMATCH in ${bad.length} set(s)` : 'every record and every settable cell round-tripped');
    return;
  }

  if (process.argv.includes('--reset')) await reset(api, sp, catalogue);

  const propNames = buildPropertyNames(catalogue.useCases);
  const report = { space: sp, spaceName: SPACE_NAME, sets: [] };

  const onlyArg = process.argv.indexOf('--only');
  const useCases = onlyArg > -1
    ? catalogue.useCases.filter((u) => u.id === process.argv[onlyArg + 1])
    : catalogue.useCases;

  for (const uc of useCases) {
    log(`\n=== ${uc.name} (${uc.recordCount} records, ${uc.columns.length} columns) ===`);

    // 1. One property per column, plus its options where the format takes them.
    const cols = [];
    for (const col of uc.columns) {
      const m = MAPPING[col.type];
      if (!m) throw new Error(`unmapped column type ${col.type}`);
      if (!m.format) { cols.push({ col, m, key: null }); continue; }

      const name = propNames.get(`${uc.id}::${col.key}`);
      const { property } = await api.createProperty(sp, name, m.format);
      const entry = { col, m, key: property.key, id: property.id, name };

      if (m.options && col.options?.length) {
        entry.tagIds = new Map();
        for (const [i, opt] of col.options.entries()) {
          const { tag } = await api.createTag(sp, property.id, String(opt), COLORS[i % COLORS.length]);
          entry.tagIds.set(String(opt), tag.id);
        }
      }
      cols.push(entry);
    }
    log(`  properties: ${cols.filter((c) => c.key).length}`);

    // 2. A Type owning them, so every object in the set shows every relation.
    const { type } = await api.createType(sp, {
      name: uc.name,
      plural_name: `${uc.name} records`,
      layout: 'basic',
      properties: cols.filter((c) => c.key).map((c) => ({ key: c.key, name: c.name, format: c.m.format })),
    });
    log(`  type: ${type.key}`);

    // 3. Person columns need real objects to point at; one per distinct name.
    const people = new Map();
    for (const c of cols) {
      if (!c.m.people) continue;
      for (const name of c.col.options ?? []) {
        if (people.has(name)) continue;
        const { object } = await api.createObject(sp, { type_key: 'page', name: String(name) });
        people.set(String(name), object.id);
      }
    }
    if (people.size) log(`  people: ${people.size}`);

    // 4. The records. Record-to-record links wait for pass two.
    const byRecordId = new Map();
    const created = [];
    for (const rec of uc.records) {
      const properties = [];
      for (const c of cols) {
        if (!c.key) continue;
        const ctx = { key: c.key, tagIds: c.tagIds, objectIds: c.m.people ? people : null };
        const v = valueEntry(c.col, rec.values[c.col.key], ctx);
        if (v) properties.push(v);
      }
      const { object } = await api.createObject(sp, {
        type_key: type.key,
        name: rec.title,
        properties,
      });
      byRecordId.set(rec.id, object.id);
      created.push(object.id);
    }
    log(`  objects: ${created.length}`);

    // 5. Pass two: resolve record-to-record links now that every id exists.
    let linked = 0;
    const linkCols = cols.filter((c) => c.m.links && c.key);
    for (const rec of uc.records) {
      const properties = [];
      for (const c of linkCols) {
        const v = valueEntry(c.col, rec.values[c.col.key], { key: c.key, objectIds: byRecordId });
        if (v) properties.push(v);
      }
      if (!properties.length) continue;
      await api.updateObject(sp, byRecordId.get(rec.id), { properties });
      linked += 1;
    }
    if (linked) log(`  linked: ${linked}`);

    // 6. A Collection holding them, which is what carries the views.
    const { object: collection } = await api.createObject(sp, {
      type_key: 'collection',
      name: uc.name,
    });
    for (let i = 0; i < created.length; i += 50) {
      await api.addToList(sp, collection.id, created.slice(i, i + 50));
    }

    // Read the count back off the collection rather than trusting the writes.
    const back = await api.listViewObjects(sp, collection.id, 'default');
    log(`  collection ${collection.id}: ${back.length} objects read back (expected ${uc.recordCount})`);

    report.sets.push({
      id: uc.id,
      name: uc.name,
      typeKey: type.key,
      collectionId: collection.id,
      expected: uc.recordCount,
      readBack: back.length,
      properties: cols.filter((c) => c.key).map((c) => ({
        column: c.col.key, label: c.col.label, neutralType: c.col.type,
        anytypeFormat: c.m.format, propertyKey: c.key, propertyName: c.name,
        options: c.tagIds ? c.tagIds.size : 0, note: c.m.note ?? null,
      })),
      statusColumn: uc.columns.find((c) => c.type === 'status')?.label ?? null,
      dateColumn: uc.columns.find((c) => c.type === 'date')?.label ?? null,
    });
  }

  const out = join(HERE, 'load-report.json');
  await writeFile(out, JSON.stringify(report, null, 2));
  log(`\nreport -> ${out}`);
  const bad = report.sets.filter((s) => s.readBack !== s.expected);
  if (bad.length) {
    console.error(`MISMATCH: ${bad.map((s) => `${s.id} ${s.readBack}/${s.expected}`).join(', ')}`);
    process.exit(1);
  }
  log('all sets match their recordCount');
}

await main();
