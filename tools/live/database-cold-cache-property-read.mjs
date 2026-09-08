#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    database-cold-cache-property-read
// COMPONENT: live headless-Chrome proof of the metadata-cache-cold property read
// ───────────────────────────────────────────────────────────────────
//
// Mounts the real `DataSource`, `RowPipeline`, `TableRenderer`, `CellRenderer` and
// `BoardRenderer` in real headless Chrome, at the 402x874 phone viewport, against a fixture
// mirroring the operator's own Finance-Reports-shaped table and Testbed-shaped board (synthetic
// values). `render-assertion-bundle.mjs`'s shared builder resolves "obsidian" to a stub that
// deliberately throws for TFile/Vault/MetadataCache/App — out of scope for a presentational
// catalogue that never mounts a data source — so this script bundles its own entry with
// `vault-read-obsidian-stub.mjs` instead, which gives those five a small, honest, in-memory
// implementation this script drives directly: a vault of TFile-backed fixture notes and a
// metadata cache whose readiness (`getFileCache` cold vs warm, and which events fire when) the
// scenario controls exactly, rather than waiting on a real vault's own timing.
//
// What this proves: the real read path (`DataSource.getViewDefFiles`/`getRecordsForDatabase`,
// `RowPipeline.build`) into the real paint path (`TableRenderer`/`CellRenderer`,
// `BoardRenderer`) under a metadata cache that is cold when first read, matching Obsidian's own
// first-load timing. What this does NOT prove: no real vault, real Obsidian host, or real device
// is involved — see `board-cross-group-drag.mjs`'s own header for the same boundary this
// project already draws between a live-Chrome DOM/timing proof and the vitest suite's host-
// binding proofs.
//
// Usage: node tools/live/database-cold-cache-property-read.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import esbuild from "esbuild";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HERE = fileURLToPath(new URL(".", import.meta.url));

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  for (const candidate of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ]) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error("database-cold-cache-property-read: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

// ───────────────────────────────────────────────────────────────────
// 2. BUNDLE — own esbuild step, own "obsidian" resolution
// ───────────────────────────────────────────────────────────────────

const obsidianStubPlugin = {
  name: "vault-read-obsidian-stub",
  setup(build) {
    build.onResolve({ filter: /^obsidian$/ }, () => ({
      path: resolve(HERE, "vault-read-obsidian-stub.mjs"),
    }));
  },
};

const RENDERER_SOURCES = [
  "src/data/data-source.ts",
  "src/data/row-pipeline.ts",
  "src/views/table-renderer.ts",
  "src/views/cell-renderer.ts",
  "src/views/board-renderer.ts",
];

const entryBody = `
import { installObsidianDomShim } from "${resolve(HERE, "../storybook/obsidian-dom-shim.mjs")}";
import { App, MetadataCache, TFile, Vault } from "obsidian";
import { DataSource } from "${join(REPO, "src/data/data-source")}";
import { RowPipeline } from "${join(REPO, "src/data/row-pipeline")}";
import { TableRenderer } from "${join(REPO, "src/views/table-renderer")}";
import { CellRenderer } from "${join(REPO, "src/views/cell-renderer")}";
import { BoardRenderer } from "${join(REPO, "src/views/board-renderer")}";

installObsidianDomShim(window);

// ── Fixtures ──────────────────────────────────────────────────────
// Finance-shaped table: a db_view note over a currency/text/date-sort-key folder, mirroring
// Finance/Finance Reports.md's own column list (synthetic values, never the operator's own).
const FINANCE_DB_PATH = "Finance/Finance Reports.md";
const FINANCE_DB_FRONTMATTER = {
  db_view: true,
  database: {
    id: "finance-reports-fixture",
    name: "Reports",
    sourceFolder: "Finance/Reports",
    columns: [
      { key: "file.name", label: "Month", type: "text" },
      { key: "income", label: "Income", type: "currency" },
      { key: "expenses", label: "Expenses", type: "currency" },
      { key: "year", label: "Year", type: "text" },
    ],
    views: [
      { id: "view-all", name: "All", viewType: "table", sourceFolder: "", sortColumn: "file.name", sortDirection: "desc" },
      {
        id: "view-2026", name: "2026", viewType: "table", sourceFolder: "",
        sortColumn: "file.name", sortDirection: "desc",
        filters: [{ field: "year", op: "eq", value: "2026" }],
      },
    ],
  },
};
const FINANCE_RECORDS = [
  { path: "Finance/Reports/01 - Jan.md", frontmatter: { income: 1000, expenses: 400, year: "2026" } },
  { path: "Finance/Reports/02 - Feb.md", frontmatter: { income: 1200, expenses: 500, year: "2026" } },
  { path: "Finance/Reports/03 - Mar.md", frontmatter: { income: 900, expenses: 300, year: "2026" } },
  { path: "Finance/Reports/04 - Apr.md", frontmatter: { income: 1100, expenses: 450, year: "2026" } },
  // Two prior-year rows exist so a cold read of the "2026" filter's own effect is observable —
  // this fixture never asserts on them directly, only on whether the 2026 rows paint and sort.
  { path: "Finance/Reports/05 - Dec-2025.md", frontmatter: { income: 700, expenses: 200, year: "2025" } },
  { path: "Finance/Reports/06 - Nov-2025.md", frontmatter: { income: 650, expenses: 180, year: "2025" } },
];

// Testbed-shaped board: checkbox + number, mirroring the Database Testbed board's own columns.
const TESTBED_DB_PATH = "Testbed/Testbed Board.md";
const TESTBED_DB_FRONTMATTER = {
  db_view: true,
  database: {
    id: "testbed-fixture",
    name: "Testbed",
    sourceFolder: "Testbed/Cards",
    columns: [
      { key: "name", label: "Name", type: "text" },
      { key: "pinned", label: "Pinned", type: "checkbox" },
      { key: "priority", label: "Priority", type: "number" },
    ],
    views: [{ id: "view-board", name: "Board view", viewType: "board", boardGroupField: "priority", titleField: "name" }],
  },
};
const TESTBED_RECORDS = [
  { path: "Testbed/Cards/card-a.md", frontmatter: { name: "Card A", pinned: true, priority: 1 } },
  { path: "Testbed/Cards/card-b.md", frontmatter: { name: "Card B", pinned: false, priority: 2 } },
  { path: "Testbed/Cards/card-c.md", frontmatter: { name: "Card C", pinned: true, priority: 1 } },
  { path: "Testbed/Cards/card-d.md", frontmatter: { name: "Card D", pinned: false, priority: 2 } },
];

function buildFixture(dbPath, dbFrontmatter, records) {
  const files = [new TFile({ path: dbPath }), ...records.map((r) => new TFile({ path: r.path }))];
  const vault = new Vault(files);
  const metadataCache = new MetadataCache();
  metadataCache.seed(dbPath, dbFrontmatter);
  for (const r of records) metadataCache.seed(r.path, r.frontmatter);
  const app = new App(vault, metadataCache);
  const dataSource = new DataSource(app);
  dataSource.startListening();
  return { files, vault, metadataCache, app, dataSource, dbPath, dbFile: files[0] };
}

function warmAll(fixture) {
  for (const file of fixture.files) fixture.metadataCache.resolveFile(file, fixture.vault, "__seed-only__");
}

// ── Real read path, exactly what rebuildViewEntries()/getRecordsForDatabase() call ──
function readView(fixture, viewId) {
  const defFiles = fixture.dataSource.getViewDefFiles();
  const entry = defFiles.find((d) => d.file.path === fixture.dbPath);
  if (!entry) return { config: null, view: null, rows: [] };
  const view = entry.config.views.find((v) => v.id === viewId) || entry.config.views[0];
  const records = fixture.dataSource.getRecordsForDatabase(entry.config);
  const state = {
    searchText: "", statusFilter: "", groupByField: view.boardGroupField || view.groupByField || "",
    filters: view.filters || [], hiddenColumns: new Set(view.hiddenColumns || []),
    filterLogic: view.filterLogic || "and", sortColumn: view.sortColumn, sortDirection: view.sortDirection || "asc",
    sortRules: view.sortRules || [], filterTree: view.filterTree,
  };
  const rows = new RowPipeline().build(records, view, state, fixture.app);
  return { config: entry.config, view, rows };
}

// ── Real paint path ──
function makeTableBag(columns) {
  const cellRenderer = new CellRenderer(undefined, async () => undefined);
  return {
    getVisibleColumns: () => columns,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    setupColumnHeader: (th, col) => { th.setText(col.label); },
    setupRow: () => undefined,
    renderCell: (td, row, col) => cellRenderer.renderCell(td, row, col, false),
    renderRecordIcon: () => null,
    renderGroupSummaries: () => undefined,
    applyConditionalFormat: () => undefined,
    createEntry: () => undefined,
    isGroupCollapsed: () => false,
    toggleGroupCollapsed: () => undefined,
    expandGroup: () => undefined,
    get hideCreateEntry() { return true; },
  };
}

function makeBoardBag(columns) {
  const cellRenderer = new CellRenderer(undefined, async () => undefined);
  return {
    openRow: () => undefined,
    createEntry: () => undefined,
    updateGroup: async () => undefined,
    updateGroupOrder: () => undefined,
    showGroup: () => undefined,
    setBoardHideEmptyGroups: () => undefined,
    updateCardOrder: () => undefined,
    moveRowToPosition: () => undefined,
    getSelectedRows: () => [],
    updateColumnWidth: () => undefined,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    editCell: (target, row, col) => cellRenderer.renderCell(target, row, col, false),
    getColumns: () => columns,
    isReadOnly: true,
  };
}

function groupByField(rows, field) {
  const order = [];
  const byKey = new Map();
  for (const row of rows) {
    const raw = row.frontmatter[field];
    const key = raw === undefined || raw === null || raw === "" ? "__no_value__" : String(raw);
    if (!byKey.has(key)) { byKey.set(key, []); order.push(key); }
    byKey.get(key).push(row);
  }
  return order.map((key) => ({ key, rows: byKey.get(key), count: byKey.get(key).length }));
}

// ── Assertion helpers: count populated property cells against the fixture's own record shape ──
function countPopulatedPropertyCells(rows, propertyKeys) {
  let populated = 0;
  let total = 0;
  for (const row of rows) {
    for (const key of propertyKeys) {
      total += 1;
      const value = row.frontmatter[key];
      if (value !== undefined && value !== null && value !== "") populated += 1;
    }
  }
  return { populated, total };
}

window.__scenario = (name) => {
  document.body.innerHTML = "";
  document.body.className = "obnotion-container";

  if (name === "table-cold-never-resolves") {
    const fixture = buildFixture(FINANCE_DB_PATH, FINANCE_DB_FRONTMATTER, FINANCE_RECORDS);
    const { config, view, rows } = readView(fixture, "view-all");
    const columns = config ? config.schema.columns : [];
    const container = document.body.createDiv();
    new TableRenderer(makeTableBag(columns)).renderTable(container, view || {}, rows);
    const propertyKeys = columns.filter((c) => c.key !== "file.name").map((c) => c.key);
    return { configFound: Boolean(config), rowCount: rows.length, ...countPopulatedPropertyCells(rows, propertyKeys) };
  }

  if (name === "table-warm-from-start") {
    const fixture = buildFixture(FINANCE_DB_PATH, FINANCE_DB_FRONTMATTER, FINANCE_RECORDS);
    warmAll(fixture);
    const { config, view, rows } = readView(fixture, "view-all");
    const columns = config ? config.schema.columns : [];
    const container = document.body.createDiv();
    new TableRenderer(makeTableBag(columns)).renderTable(container, view || {}, rows);
    const propertyKeys = columns.filter((c) => c.key !== "file.name").map((c) => c.key);
    return { configFound: Boolean(config), rowCount: rows.length, ...countPopulatedPropertyCells(rows, propertyKeys) };
  }

  if (name === "table-poisoned-by-early-view-def-scan") {
    // Reproduces the operator's exact shape: the FIRST scan runs while everything is cold (finds
    // no usable database yet, since the db-view note's own frontmatter is not yet resolved either
    // — matching data-source.ts's own db_view check), which seeds the record cache with every
    // vault file's frontmatter AT THAT MOMENT. Only afterwards does the vault resolve — the db-view
    // note now parses correctly (headers/columns show up, matching the operator's screenshot), but
    // the earlier scan already poisoned the record snapshot every record read since draws from.
    const fixture = buildFixture(FINANCE_DB_PATH, FINANCE_DB_FRONTMATTER, FINANCE_RECORDS);
    fixture.dataSource.getViewDefFiles(); // early, cold scan — the poisoning call
    warmAll(fixture); // the vault finishes resolving, moments later
    const { config, view, rows } = readView(fixture, "view-all");
    const columns = config ? config.schema.columns : [];
    const container = document.body.createDiv();
    new TableRenderer(makeTableBag(columns)).renderTable(container, view || {}, rows);
    const propertyKeys = columns.filter((c) => c.key !== "file.name").map((c) => c.key);
    const order = rows.map((r) => r.file.name);
    return { configFound: Boolean(config), rowCount: rows.length, order, ...countPopulatedPropertyCells(rows, propertyKeys) };
  }

  if (name === "table-cold-then-resolved-event") {
    // Same poisoning as above, but this time the fix under test is armed: fires Obsidian's
    // "resolved" event (identity-less bulk-load-finished signal) after the vault warms, the way
    // the real metadata cache would once its initial resolve queue empties.
    const fixture = buildFixture(FINANCE_DB_PATH, FINANCE_DB_FRONTMATTER, FINANCE_RECORDS);
    fixture.dataSource.getViewDefFiles();
    warmAll(fixture);
    fixture.metadataCache.fireResolved();
    const { config, view, rows } = readView(fixture, "view-all");
    const columns = config ? config.schema.columns : [];
    const container = document.body.createDiv();
    new TableRenderer(makeTableBag(columns)).renderTable(container, view || {}, rows);
    const propertyKeys = columns.filter((c) => c.key !== "file.name").map((c) => c.key);
    const order = rows.map((r) => r.file.name);
    return { configFound: Boolean(config), rowCount: rows.length, order, ...countPopulatedPropertyCells(rows, propertyKeys) };
  }

  if (name === "table-cold-then-per-file-changed") {
    // Isolates the mechanism further: no "resolved" handling at all, but every record file's own
    // "changed" event fires individually (the assumption data-source.ts's own comment states).
    // If this scenario reads green while the early-scan one above reads red, the defect is
    // specifically the missing catch-all, not a totally inert cache.
    const fixture = buildFixture(FINANCE_DB_PATH, FINANCE_DB_FRONTMATTER, FINANCE_RECORDS);
    fixture.dataSource.getViewDefFiles();
    for (const file of fixture.files) {
      fixture.metadataCache.frontmatterByPath.set(
        file.path,
        file.path === FINANCE_DB_PATH ? FINANCE_DB_FRONTMATTER : FINANCE_RECORDS.find((r) => r.path === file.path).frontmatter,
      );
      fixture.metadataCache.resolveFile(file, fixture.metadataCache, "changed");
    }
    const { config, view, rows } = readView(fixture, "view-all");
    const columns = config ? config.schema.columns : [];
    const container = document.body.createDiv();
    new TableRenderer(makeTableBag(columns)).renderTable(container, view || {}, rows);
    const propertyKeys = columns.filter((c) => c.key !== "file.name").map((c) => c.key);
    const order = rows.map((r) => r.file.name);
    return { configFound: Boolean(config), rowCount: rows.length, order, ...countPopulatedPropertyCells(rows, propertyKeys) };
  }

  if (name === "board-cold-then-resolved-event") {
    const fixture = buildFixture(TESTBED_DB_PATH, TESTBED_DB_FRONTMATTER, TESTBED_RECORDS);
    fixture.dataSource.getViewDefFiles();
    warmAll(fixture);
    fixture.metadataCache.fireResolved();
    const { config, view, rows } = readView(fixture, "view-board");
    const columns = config ? config.schema.columns : [];
    const groups = groupByField(rows, view.boardGroupField);
    const container = document.body.createDiv();
    new BoardRenderer(undefined, makeBoardBag(columns)).render(container, view, groups, view.boardGroupField);
    const propertyKeys = columns.filter((c) => c.key !== "name").map((c) => c.key);
    return {
      configFound: Boolean(config), rowCount: rows.length,
      groupKeys: groups.map((g) => g.key),
      ...countPopulatedPropertyCells(rows, propertyKeys),
    };
  }

  if (name === "board-poisoned-by-early-view-def-scan") {
    const fixture = buildFixture(TESTBED_DB_PATH, TESTBED_DB_FRONTMATTER, TESTBED_RECORDS);
    fixture.dataSource.getViewDefFiles();
    warmAll(fixture);
    const { config, view, rows } = readView(fixture, "view-board");
    const columns = config ? config.schema.columns : [];
    const groups = groupByField(rows, view.boardGroupField);
    const container = document.body.createDiv();
    new BoardRenderer(undefined, makeBoardBag(columns)).render(container, view, groups, view.boardGroupField);
    const propertyKeys = columns.filter((c) => c.key !== "name").map((c) => c.key);
    return {
      configFound: Boolean(config), rowCount: rows.length,
      groupKeys: groups.map((g) => g.key),
      ...countPopulatedPropertyCells(rows, propertyKeys),
    };
  }

  throw new Error("database-cold-cache-property-read: unknown scenario " + name);
};
`;

// ───────────────────────────────────────────────────────────────────
// 3. RUN
// ───────────────────────────────────────────────────────────────────

const work = (await import("node:fs")).mkdtempSync(join((await import("node:os")).tmpdir(), "cold-cache-read-"));
const entry = join(work, "entry.ts");
const bundlePath = join(work, "bundle.js");
writeFileSync(entry, entryBody);

const failures = [];
let browser;
try {
  const built = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    format: "iife",
    outfile: bundlePath,
    plugins: [obsidianStubPlugin],
    metafile: true,
    logLevel: "warning",
    absWorkingDir: REPO,
  });
  const bundleInputs = Object.keys(built.metafile.inputs);
  const missingSources = RENDERER_SOURCES.filter((source) => !bundleInputs.includes(source));
  if (missingSources.length > 0) {
    console.error("database-cold-cache-property-read: bundle did not import " + missingSources.join(", ") + " — refusing to assert on a copy");
    process.exit(3);
  }

  writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${REPO}styles.css"></head>
<body class="obnotion-container"><script src="bundle.js"></script></body></html>`);

  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 402, height: 874 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);

  const scenarios = [
    "table-cold-never-resolves",
    "table-warm-from-start",
    "table-poisoned-by-early-view-def-scan",
    "table-cold-then-resolved-event",
    "table-cold-then-per-file-changed",
    "board-poisoned-by-early-view-def-scan",
    "board-cold-then-resolved-event",
  ];
  const results = {};
  for (const name of scenarios) {
    results[name] = await page.evaluate((n) => window.__scenario(n), name);
    console.log(name + ": " + JSON.stringify(results[name]));
  }
  for (const error of pageErrors) failures.push(`page error: ${error}`);

  // ── Assertions ──
  const r = results;

  // Negative control: a cache that never resolves must never fabricate values.
  if (r["table-cold-never-resolves"].populated !== 0) {
    failures.push(`table-cold-never-resolves: expected 0 populated cells, got ${r["table-cold-never-resolves"].populated}`);
  }
  // Positive control: the pipeline itself must be able to paint every cell when warm from the start.
  if (r["table-warm-from-start"].populated !== r["table-warm-from-start"].total || r["table-warm-from-start"].total === 0) {
    failures.push(`table-warm-from-start: expected every property cell populated, got ${JSON.stringify(r["table-warm-from-start"])}`);
  }

  // THE RED: the operator's exact shape — an early view-def scan while cold, the vault warming
  // moments later, no catch-all recovery. Columns are found (config resolves once warm), but the
  // record cache stays poisoned from the earlier scan.
  const poisoned = r["table-poisoned-by-early-view-def-scan"];
  const poisonedIsRed = poisoned.configFound && poisoned.populated === 0 && poisoned.total > 0;

  // THE GREEN this fix must produce: firing "resolved" after the vault warms recovers every cell.
  const recovered = r["table-cold-then-resolved-event"];
  const recoveredIsGreen = recovered.configFound && recovered.populated === recovered.total && recovered.total > 0;

  // Isolates the mechanism: per-file "changed" alone (no early scan) already recovers, proving the
  // defect is specifically the missing catch-all for a scan that ran before any per-file event did.
  const perFileChanged = r["table-cold-then-per-file-changed"];
  const perFileChangedIsGreen = perFileChanged.populated === perFileChanged.total && perFileChanged.total > 0;

  // Sort order: the "2026" view sorts file.name desc — must hold once cells are populated.
  const expectedOrderDesc = [
    "06 - Nov-2025.md", "05 - Dec-2025.md", "04 - Apr.md", "03 - Mar.md", "02 - Feb.md", "01 - Jan.md",
  ];
  const orderMatchesRecovered = JSON.stringify(recovered.order) === JSON.stringify(expectedOrderDesc);

  const boardPoisoned = r["board-poisoned-by-early-view-def-scan"];
  const boardPoisonedIsRed = boardPoisoned.configFound && boardPoisoned.populated === 0 && boardPoisoned.total > 0
    && boardPoisoned.groupKeys.length === 1 && boardPoisoned.groupKeys[0] === "__no_value__";
  const boardRecovered = r["board-cold-then-resolved-event"];
  const boardRecoveredIsGreen = boardRecovered.populated === boardRecovered.total && boardRecovered.total > 0;

  console.log(`\ntable-poisoned-by-early-view-def-scan reproduces the reported defect (RED expected pre-fix): ${poisonedIsRed}`);
  console.log(`table-cold-then-resolved-event recovers (GREEN expected post-fix): ${recoveredIsGreen}`);
  console.log(`table-cold-then-per-file-changed recovers regardless (isolation control): ${perFileChangedIsGreen}`);
  console.log(`recovered row order matches the view's sort (file.name desc): ${orderMatchesRecovered} — ${JSON.stringify(recovered.order)}`);
  console.log(`board-poisoned-by-early-view-def-scan reproduces the defect (RED expected pre-fix): ${boardPoisonedIsRed}`);
  console.log(`board-cold-then-resolved-event recovers (GREEN expected post-fix): ${boardRecoveredIsGreen}`);

  if (!perFileChangedIsGreen) failures.push("table-cold-then-per-file-changed: expected full recovery, the isolation control itself is broken");
  if (!orderMatchesRecovered) failures.push(`recovered row order mismatch: ${JSON.stringify(recovered.order)}`);

  const mode = process.env.COLD_CACHE_EXPECT || "post-fix";
  if (mode === "post-fix") {
    if (!recoveredIsGreen) failures.push(`table-cold-then-resolved-event: expected full recovery post-fix, got ${JSON.stringify(recovered)}`);
    if (!boardRecoveredIsGreen) failures.push(`board-cold-then-resolved-event: expected full recovery post-fix, got ${JSON.stringify(boardRecovered)}`);
  } else if (mode === "pre-fix-red") {
    if (!poisonedIsRed) failures.push(`table-poisoned-by-early-view-def-scan: expected the reported defect (RED), got ${JSON.stringify(poisoned)}`);
    if (!boardPoisonedIsRed) failures.push(`board-poisoned-by-early-view-def-scan: expected the reported defect (RED), got ${JSON.stringify(boardPoisoned)}`);
  }

  await page.close();
} finally {
  await browser?.close();
  rmSync(work, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(`\ndatabase-cold-cache-property-read: ${failures.length} FAILURE(S)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("\nRESULT: PASSED");
