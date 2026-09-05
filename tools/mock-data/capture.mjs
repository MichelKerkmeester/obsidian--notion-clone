// ───────────────────────────────────────────────────────────────────
// MODULE:    capture
// COMPONENT: mounts each generated database in the shipped table renderer and photographs it
// ───────────────────────────────────────────────────────────────────
//
// A generator that writes valid YAML has proved that it writes valid YAML. It
// has not proved that the plugin can open what it wrote, and those are
// different claims: a column type the schema allows, a display variant the
// renderer branches on, and an option value that matches nothing all parse
// cleanly and then paint wrong.
//
// So this drives the real TableRenderer and the real CellRenderer over the
// catalogue's own columns and rows, in the same headless Chrome and against
// the same three stylesheets the capture harness uses, and writes one PNG per
// database. It also prints the row and cell counts the renderer actually
// built, because the picture shows the top-left corner and the counts are what
// say the rest of the table exists.
//
// The bundle manifest is checked before anything is mounted. A bundle that
// stopped importing the shipped renderer would photograph something else and
// look identical; that check is why the picture is evidence rather than
// decoration.
//
// This deliberately does NOT register scenarios with the screenshot harness.
// These captures photograph data, not a surface: a registered scenario is
// re-verified against its declared sources on every future change, and the
// generated data is not a surface whose staleness anyone needs to be told
// about. The PNGs go to a scratch folder and are read once, here.
//
// Usage: node tools/mock-data/capture.mjs [--out <dir>] [--rows <n>]

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import esbuild from "esbuild";
import { chromium } from "playwright-core";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SHOTS = fileURLToPath(new URL("../screenshots/", import.meta.url));

// The two shipped modules the picture must have come from. Checked against the
// bundle's own input manifest, never assumed.
const REQUIRED_SOURCES = ["src/views/table-renderer.ts", "src/views/cell-renderer.ts"];

const DESKTOP = { width: 1440, height: 900 };

// ───────────────────────────────────────────────────────────────────
// 2. ARGUMENTS
// ───────────────────────────────────────────────────────────────────

const options = {
  out: join(REPO, "specs/005-component-surface-system/049-test-environments-and-mock-data/scratch/captures"),
  rows: 0,
  // Desktop width is the default because that is the width the captures are
  // taken at. It is overridable for one reason: 28 columns do not fit in 1440px,
  // and reading the right-hand half of a table needs a frame that holds it.
  width: DESKTOP.width,
};
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index];
  if (arg === "--out") { options.out = resolve(process.argv[++index] ?? ""); }
  else if (arg === "--rows") { options.rows = Number(process.argv[++index] ?? "0"); }
  else if (arg === "--width") { options.width = Number(process.argv[++index] ?? "0"); }
  else throw new Error(`capture: unknown argument "${arg}"`);
}

// ───────────────────────────────────────────────────────────────────
// 3. BUNDLE
// ───────────────────────────────────────────────────────────────────

// The entry mounts the shipped renderer over catalogue data. It is written as
// a string rather than a checked-in file because it exists only to be bundled,
// and a second file on disk would be one more thing to keep in step with the
// two imports above.
const ENTRY = `
import { installObsidianDomShim } from "${join(REPO, "tools/storybook/obsidian-dom-shim.mjs")}";
import { TableRenderer } from "${join(REPO, "src/views/table-renderer")}";
import { CellRenderer } from "${join(REPO, "src/views/cell-renderer")}";
import { setFrozenRenderNow } from "${join(REPO, "src/data/calendar-date-time")}";
import { buildCatalogue, ANCHOR } from "${join(HERE, "catalogue.ts")}";

installObsidianDomShim(window);

// The same instant the other constructed harnesses freeze to, so a date cell
// reads the same on any calendar day this runs.
setFrozenRenderNow(ANCHOR);

const catalogue = buildCatalogue();

function toColumnDefs(useCase) {
  return useCase.columns.map((column) => {
    const def = { key: column.key, label: column.label, type: column.columnType };
    if (column.options) def.statusOptions = column.options;
    if (column.facet === "computed") def.computedKey = column.key;
    if (column.facet === "notes") def.wrap = true;
    if (column.facet === "markdown") def.textRenderMode = "markdown";
    if (column.facet === "url") { def.textRenderMode = "link"; def.textLinkScheme = "https"; }
    if (column.facet === "email") { def.textRenderMode = "link"; def.textLinkScheme = "mailto"; }
    if (column.facet === "phone") { def.textRenderMode = "link"; def.textLinkScheme = "tel"; }
    if (column.facet === "rating") { def.numberDisplayStyle = "rating"; def.numberDisplayConfig = { ratingSymbol: "star", ratingMax: 5 }; }
    if (column.facet === "progress") { def.numberDisplayStyle = "progress"; def.numberDisplayConfig = { progressDivisor: 100, progressShowValue: true }; }
    if (column.facet === "ring") { def.numberDisplayStyle = "ring"; def.numberDisplayConfig = { progressDivisor: 100 }; }
    if (column.facet === "relation") def.relationConfig = { targetDatabaseId: useCase.id };
    if (column.facet === "rollup") def.rollupConfig = { relationField: "related", targetField: "file.name", aggregation: "count" };
    return def;
  });
}

function toRows(useCase, columns, limit) {
  const records = limit > 0 ? useCase.records.slice(0, limit) : useCase.records;
  return records.map((record, index) => {
    const frontmatter = {};
    for (const column of useCase.columns) {
      const value = record.values[column.facet];
      if (value === undefined) continue;
      frontmatter[column.key] = column.facet === "relation"
        ? value.map((id) => "[[" + id + "]]")
        : column.facet === "files"
          ? value.map((path) => "[[" + path + "]]")
          : value;
    }
    frontmatter["file.name"] = record.id;
    // The created and modified columns read file.stat, which a vault supplies
    // and this stub must too. Derived from the frozen anchor and the record's
    // ordinal so a re-run photographs the same two dates; in the vault these
    // are the real filesystem times, which is the one place the environments
    // legitimately differ.
    const created = ANCHOR.getTime() - (index + 1) * 86400000;
    return {
      file: {
        path: useCase.name + "/Records/" + record.id + ".md",
        basename: record.id,
        name: record.id + ".md",
        stat: { ctime: created, mtime: created + 43200000, size: 1024 },
      },
      frontmatter,
      computed: {},
    };
  });
}

window.__mountUseCase = (useCaseId, rowLimit) => {
  const useCase = catalogue.useCases.find((candidate) => candidate.id === useCaseId);
  if (!useCase) return null;
  const columns = toColumnDefs(useCase);
  const rows = toRows(useCase, columns, rowLimit);
  // The production cell renderer, constructed the way the assertion harness
  // constructs it: no DataSource and no writer, since nothing here edits.
  const cells = new CellRenderer(undefined, async () => undefined);
  const bag = {
    getVisibleColumns: () => columns,
    isRowSelected: () => false,
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: () => undefined,
    setupColumnHeader: (th, col) => { th.setText(col.label); },
    setupRow: () => undefined,
    renderCell: (td, row, col) => cells.renderCell(td, row, col),
    captureInteractionSnapshot: () => undefined,
    restoreInteractionSnapshot: () => undefined,
    renderRecordIcon: () => null,
    renderGroupSummaries: () => undefined,
    applyConditionalFormat: () => undefined,
    setupFillHandle: () => undefined,
    moveRowToPosition: () => undefined,
    moveRowsToGroup: () => undefined,
    moveRowToGroupAndPosition: () => undefined,
    createEntry: () => undefined,
    addColumn: () => undefined,
    showRowMenu: () => undefined,
    changeColumnCalculation: () => undefined,
    isGroupCollapsed: () => false,
    toggleGroupCollapsed: () => undefined,
    expandGroup: () => undefined,
    get hideCreateEntry() { return false; },
  };
  const config = {
    name: useCase.name,
    viewType: "table",
    sourceFolder: useCase.name + "/Records",
    schema: { columns, computedFields: [] },
  };

  const shot = document.getElementById("shot");
  shot.replaceChildren();
  const container = document.createElement("div");
  container.className = "note-database-container";
  shot.appendChild(container);
  new TableRenderer(bag).renderTable(container, config, rows);

  // Record rows are the ones carrying the path attribute renderRow sets. The
  // renderer also emits a db-row-insert-line between every pair, so a bare
  // "tbody tr" count reads exactly double and would have been accepted as the
  // row count by anyone who did not look.
  const body = container.querySelectorAll("tbody tr[data-note-database-row-path]");
  return {
    useCase: useCase.name,
    rows: body.length,
    headers: container.querySelectorAll("thead th").length,
    cells: container.querySelectorAll("tbody td").length,
    // The classes that only exist because a display variant was configured.
    links: container.querySelectorAll("a").length,
    checkboxes: container.querySelectorAll("input[type=checkbox]").length,
  };
};
`;

async function buildBundle(work) {
  const entry = join(work, "capture-entry.ts");
  writeFileSync(entry, ENTRY);
  const built = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    format: "iife",
    outfile: join(work, "capture-bundle.js"),
    plugins: [{
      name: "obsidian-stub",
      setup(build) {
        build.onResolve({ filter: /^obsidian$/ }, () => ({ path: join(REPO, "tools/storybook/obsidian-stub.mjs") }));
      },
    }],
    metafile: true,
    logLevel: "warning",
    absWorkingDir: REPO,
  });
  const inputs = Object.keys(built.metafile.inputs);
  const missing = REQUIRED_SOURCES.filter((source) => !inputs.includes(source));
  if (missing.length > 0) {
    throw new Error(`capture: the bundle no longer imports ${missing.join(", ")}, so the picture would not be of the shipped renderer`);
  }
}

// ───────────────────────────────────────────────────────────────────
// 4. HOST
// ───────────────────────────────────────────────────────────────────

function hostHtml() {
  return `<!doctype html>
<html class="theme-dark">
<head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="file://${join(SHOTS, "theme.css")}">
<link rel="stylesheet" href="file://${join(REPO, "styles.css")}">
<link rel="stylesheet" href="file://${join(SHOTS, "runtime-vars.css")}">
</head>
<body><div id="shot"></div><script src="capture-bundle.js"></script></body></html>`;
}

// ───────────────────────────────────────────────────────────────────
// 5. RUN
// ───────────────────────────────────────────────────────────────────

const work = mkdtempSync(join(tmpdir(), "mock-data-capture-"));
let failures = 0;
try {
  await buildBundle(work);
  const host = join(work, "host.html");
  writeFileSync(host, hostHtml());
  mkdirSync(options.out, { recursive: true });

  const browser = await chromium.launch({
    executablePath: process.env.SCREENSHOT_CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  try {
    const page = await browser.newPage({ viewport: { width: options.width, height: DESKTOP.height }, deviceScaleFactor: 2 });
    await page.goto(pathToFileURL(host).href, { waitUntil: "load" });

    const ids = await page.evaluate(() => window.__mountUseCase && true);
    if (!ids) throw new Error("capture: the bundle exposed no mount entry");

    const { readFileSync } = await import("node:fs");
    const catalogue = JSON.parse(readFileSync(join(HERE, "catalogue.json"), "utf8"));

    for (const useCase of catalogue.useCases) {
      const measured = await page.evaluate(
        ([id, limit]) => window.__mountUseCase(id, limit),
        [useCase.id, options.rows]
      );
      if (!measured || measured.rows === 0) {
        console.log(`  ${useCase.id.padEnd(22)} FAILED to mount`);
        failures += 1;
        continue;
      }
      const expectedRows = options.rows > 0 ? Math.min(options.rows, useCase.recordCount) : useCase.recordCount;
      const ok = measured.rows === expectedRows;
      if (!ok) failures += 1;
      const suffix = options.width === DESKTOP.width ? "desktop" : `w${options.width}`;
      const file = join(options.out, `${useCase.id}-table-${suffix}-dark.png`);
      await page.screenshot({ path: file });
      console.log(
        `  ${useCase.id.padEnd(22)} rows ${String(measured.rows).padStart(3)}/${String(expectedRows).padStart(3)} `
        + `headers ${measured.headers} cells ${measured.cells} links ${measured.links} checkboxes ${measured.checkboxes} `
        + `${ok ? "ok" : "ROW COUNT MISMATCH"}`
      );
    }
  } finally {
    await browser.close();
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

console.log(`captures written to ${options.out}`);
if (failures > 0) {
  console.error(`capture: ${failures} database(s) did not render as expected`);
  process.exit(1);
}
