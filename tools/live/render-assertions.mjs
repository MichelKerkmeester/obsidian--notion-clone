// ───────────────────────────────────────────────────────────────────
// MODULE:    render-assertions
// COMPONENT: gate check that asserts what the shipped renderers build
// ───────────────────────────────────────────────────────────────────
//
// Fourteen gate checks used to run and none of them built a renderer the
// plugin ships: the unit suite has no DOM, the captures photograph hand-written
// markup, and the placement check bundles production code but no renderer. A
// row loop that forced a synchronous layout per row shipped through all of
// them and froze the app on a real device.
//
// This check bundles the shipped renderers with esbuild and drives them in the
// same headless Chrome the other harnesses use, then asserts structural facts
// about the DOM they build — counts, affordances, column alignment, and the
// absence of per-row forced layout. Structural facts with thresholds, not
// snapshots and not timings: a count moves when the renderer changes shape and
// is stable when it does not, and the timing budget the benches own stays with
// the benches.
//
// It also refuses to assert on DOM that did not come from a bundled src/views
// module. Hand-written fixture markup resembles renderer output closely enough
// to satisfy any DOM-shaped check — the capture harness is built on exactly
// that resemblance — so the render entry tags what the real render call built,
// the assertions require the tag, and the bundle manifest must name the
// renderer sources.
//
// What a green run does NOT prove: no Obsidian host is constructed (the hosts
// need a live App, workspace and metadata cache; the renderers tolerate their
// absence), no device is involved, and App is undefined here, so vault-resolving
// fields render unresolved — a real database pays more per field, never less.
//
// `RENDER_READ_CONTROL=per-item` arms the owned negative control for the card
// and row renderers: the harness reintroduces one forced layout read per item,
// so each scenario's count exceeds its bound and this check fails naming the
// scenario. Board and gallery read 1 against a bound of 8 and have no shipped
// defect on this tree — a bound that was never observed failing is not
// evidence — and the table's per-row bound (measured 3, same bound of 8) has
// the same need. Disarmed is the default; the gate never arms it.
//
// Usage: node tools/live/render-assertions.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";
import { chromium } from "playwright-core";
import { stamp } from "./evidence.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. THE CHECKED SHAPES
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HERE = fileURLToPath(new URL(".", import.meta.url));

// The row counts and column shapes the benches already measure — the operator's
// twenty-one-column database at thirty percent fill, and the table bench's
// sixteen-column table. Sampling above the bend matters for timing budgets;
// here it matters that the row count is the count the freeze was measured at.
const SCENARIOS = [
  { name: "list/file-view", renderer: "list", bag: "file-view" },
  { name: "list/embed", renderer: "list", bag: "embed" },
  { name: "table/file-view", renderer: "table", bag: "file-view" },
  { name: "table/embed", renderer: "table", bag: "embed" },
  { name: "board/file-view", renderer: "board", bag: "file-view" },
  { name: "board/embed", renderer: "board", bag: "embed" },
  { name: "gallery/file-view", renderer: "gallery", bag: "file-view" },
  { name: "gallery/embed", renderer: "gallery", bag: "embed" },
  { name: "calendar/file-view", renderer: "calendar", bag: "file-view" },
  { name: "calendar/embed", renderer: "calendar", bag: "embed" },
  { name: "timeline/file-view", renderer: "timeline", bag: "file-view" },
  { name: "timeline/embed", renderer: "timeline", bag: "embed" },
];

const RENDERER_SOURCES = [
  "src/views/list-renderer.ts",
  "src/views/table-renderer.ts",
  "src/views/board-renderer.ts",
  "src/views/gallery-renderer.ts",
  "src/views/calendar-renderer.ts",
  "src/views/calendar-timeline-renderer.ts",
];

// The action bags the two hosts build, measured at the two construction sites
// and pinned here as data. The harness builds its own bags; this comparison is
// what makes a bag change visible — a member the renderer calls disappearing
// from a bag must fail rather than being silently tolerated.
const BAGS = {
  "list/file-view": [
    "applyConditionalFormat", "areAllRowsSelected", "createEntry", "editCell", "editFileName",
    "editFormula", "expandGroup", "getColumns", "getSelectedRows", "hideCreateEntry",
    "isGroupCollapsed", "isRowSelected", "moveRowToGroupAndPosition", "moveRowToPosition",
    "moveRowsToGroup", "moveRowsToPosition", "openRecordDetail", "openRow",
    "renderGroupSummaries", "renderRecordIcon", "saveCellValue", "showColumnMenu", "showRowMenu",
    "toggleGroupCollapsed", "toggleRowSelected", "toggleRowsSelected",
  ],
  "list/embed": [
    "applyConditionalFormat", "areAllRowsSelected", "createEntry", "editCell", "expandGroup",
    "getColumns", "hideCreateEntry", "isGroupCollapsed", "isReadOnly", "isRowSelected",
    "moveRowToPosition", "openRow", "renderGroupSummaries", "renderRecordIcon", "showColumnMenu",
    "showRowMenu", "toggleGroupCollapsed", "toggleRowSelected", "toggleRowsSelected",
  ],
  "table/file-view": [
    "addColumn", "applyConditionalFormat", "areAllRowsSelected", "captureInteractionSnapshot",
    "changeColumnCalculation", "createEntry", "expandGroup", "getVisibleColumns",
    "hideCreateEntry", "isGroupCollapsed", "isRowSelected", "moveRowToGroupAndPosition",
    "moveRowToPosition", "moveRowsToGroup", "renderCell", "renderGroupSummaries",
    "renderRecordIcon", "restoreInteractionSnapshot", "setupColumnHeader", "setupFillHandle",
    "setupRow", "showRowMenu", "toggleGroupCollapsed", "toggleRowSelected", "toggleRowsSelected",
  ],
  "table/embed": [
    "addColumn", "applyConditionalFormat", "areAllRowsSelected", "changeColumnCalculation",
    "createEntry", "expandGroup", "getVisibleColumns", "hideCreateEntry", "isGroupCollapsed",
    "isReadOnly", "isRowSelected", "moveRowToPosition", "renderCell", "renderGroupSummaries",
    "renderRecordIcon", "setupColumnHeader", "setupRow", "showRowMenu", "toggleGroupCollapsed",
    "toggleRowSelected", "toggleRowsSelected",
  ],
  "board/file-view": [
    "applyConditionalFormat", "areAllRowsSelected", "createEntry", "createGroup", "editCell",
    "editFileName", "editFormula", "expandGroup", "getColumns", "getSelectedRows",
    "hideCreateEntry", "isGroupCollapsed", "isRowSelected", "moveRowToPosition",
    "moveRowWithGroupUpdatesAndPosition", "moveRowsToPosition", "openRecordDetail", "openRow",
    "renderGroupSummaries", "renderRecordIcon", "saveCellValue", "showColumnMenu", "showRowMenu",
    "toggleGroupCollapsed", "toggleRowSelected", "toggleRowsSelected", "updateCardOrder",
    "updateColumnWidth", "updateGroup", "updateGroupOrder",
  ],
  "board/embed": [
    "applyConditionalFormat", "areAllRowsSelected", "canReorderGroups", "createEntry",
    "editCell", "expandGroup", "getColumns", "hideCreateEntry", "isGroupCollapsed", "isReadOnly",
    "isRowSelected", "moveRowToPosition", "openRow", "renderGroupSummaries", "renderRecordIcon",
    "showColumnMenu", "showRowMenu", "toggleGroupCollapsed", "toggleRowSelected",
    "toggleRowsSelected", "updateCardOrder", "updateColumnWidth", "updateGroup",
    "updateGroupOrder",
  ],
  "gallery/file-view": [
    "applyConditionalFormat", "areAllRowsSelected", "createEntry", "editCell", "editFileName",
    "editFormula", "expandGroup", "getColumns", "getSelectedRows", "hideCreateEntry",
    "isGroupCollapsed", "isRowSelected", "moveRowToGroupAndPosition", "moveRowToPosition",
    "moveRowsToGroup", "moveRowsToPosition", "openRecordDetail", "openRow",
    "renderGroupSummaries", "renderRecordIcon", "saveCellValue", "showColumnMenu", "showRowMenu",
    "toggleGroupCollapsed", "toggleRowSelected", "toggleRowsSelected", "updateCardSize",
  ],
  "gallery/embed": [
    "applyConditionalFormat", "areAllRowsSelected", "createEntry", "editCell", "expandGroup",
    "getColumns", "hideCreateEntry", "isGroupCollapsed", "isReadOnly", "isRowSelected",
    "moveRowToPosition", "openRow", "renderGroupSummaries", "renderRecordIcon", "showColumnMenu",
    "showRowMenu", "toggleGroupCollapsed", "toggleRowSelected", "toggleRowsSelected",
    "updateCardSize",
  ],
  "calendar/file-view": [
    "applyConditionalFormat", "createEntryForDate", "getCalendarInvalidEventCount", "getColumns",
    "onConfigChange", "openCalendarInvalidEvents", "openDateConfig", "openRecordDetail", "openRow",
    "renderRecordIcon", "showRowMenu", "updateCalendarScale", "updateEventDates",
  ],
  "calendar/embed": [
    "applyConditionalFormat", "getCalendarInvalidEventCount", "getColumns", "isReadOnly",
    "onConfigChange", "openCalendarInvalidEvents", "openDateConfig", "openRecordDetail", "openRow",
    "renderRecordIcon",
  ],
  "timeline/file-view": [
    "applyConditionalFormat", "createEntryForDate", "expandGroup", "getTimelineInvalidEventCount",
    "isGroupCollapsed", "moveTimelineEventToGroup", "onConfigChange", "openDateConfig",
    "openRecordDetail", "openRow", "openTimelineInvalidEvents", "renderGroupSummaries",
    "renderRecordIcon", "reorderTimelineEvent", "showRowMenu", "toggleGroupCollapsed",
    "updateEventDates", "updateTimelineAnchor", "updateTimelineScale",
  ],
  "timeline/embed": [
    "applyConditionalFormat", "expandGroup", "getTimelineInvalidEventCount", "isGroupCollapsed",
    "isReadOnly", "onConfigChange", "openDateConfig", "openRecordDetail", "openRow",
    "openTimelineInvalidEvents", "renderGroupSummaries", "renderRecordIcon",
    "toggleGroupCollapsed", "updateTimelineAnchor", "updateTimelineScale",
  ],
};

const FILE_VIEW_ONLY = [
  "openRecordDetail", "saveCellValue", "editFileName", "editFormula", "getSelectedRows",
  "moveRowToGroupAndPosition", "moveRowsToGroup", "moveRowsToPosition",
];

const STAMP_PATH = "tools/live/renderer-coverage.json";

// Read in the runner and passed into the bundle, matching the other controls in
// this lane (SELECTION_BAR_CONTROL, PLACEMENT_SECTION_CONTROL): an armed value
// makes the harness reintroduce one per-item layout read, and the bound failing
// names the scenario.
const READ_CONTROL = process.env.RENDER_READ_CONTROL || "";

// ───────────────────────────────────────────────────────────────────
// 3. BUNDLE
// ───────────────────────────────────────────────────────────────────

const obsidianStubPlugin = {
  name: "obsidian-stub",
  setup(build) {
    build.onResolve({ filter: /^obsidian$/ }, () => ({
      path: resolve(HERE, "../storybook/obsidian-stub.mjs"),
    }));
  },
};

const work = mkdtempSync(join(tmpdir(), "render-assertions-"));
const entry = join(work, "render-entry.ts");
const bundle = join(work, "render-bundle.js");

writeFileSync(entry, `
import { installObsidianDomShim } from "${resolve(HERE, "../storybook/obsidian-dom-shim.mjs")}";
import { runRenderAssertions } from "${resolve(HERE, "render-assertion-harness")}";

installObsidianDomShim(window);
window.__renderAssertions = (scenario) => runRenderAssertions(document.body, scenario, ${JSON.stringify(READ_CONTROL)});
`);

const built = await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  outfile: bundle,
  plugins: [obsidianStubPlugin],
  metafile: true,
  logLevel: "warning",
  absWorkingDir: REPO,
});

// The bundle must have been built from the shipped sources. A bundle that
// stopped importing a renderer and rendered a copy instead would prove the
// copy, so the manifest is checked rather than assumed.
const bundleInputs = Object.keys(built.metafile.inputs);
const missingSources = RENDERER_SOURCES.filter((source) => !bundleInputs.includes(source));
if (missingSources.length > 0) {
  console.error(`render-assertions: FAIL — the bundle no longer imports ${missingSources.join(", ")}`);
  console.error("  a check that does not bundle the shipped renderer asserts nothing about them");
  process.exit(1);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${REPO}styles.css"></head>
<body class="theme-dark"><script src="render-bundle.js"></script></body></html>`);

// ───────────────────────────────────────────────────────────────────
// 4. RUN
// ───────────────────────────────────────────────────────────────────

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
  throw new Error("render-assertions: no Chrome/Chromium found. Set SCREENSHOT_CHROME to a browser executable.");
}

const failures = [];
let browser;
let outcomes = null;
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);
  outcomes = await page.evaluate((scenarios) => scenarios.map((scenario) => window.__renderAssertions(scenario)), SCENARIOS);
  await page.close();
  for (const error of pageErrors) {
    failures.push(`page error: ${error}`);
  }

  console.log(`render-assertions: ${SCENARIOS.length} scenarios x ${outcomes[0]?.results.length ?? 0} assertions in headless Chrome\n`);

  // The shape numbers this check exists to keep visible, printed whether they
  // pass or fail: layout reads must not scale with rows, and data rows must not
  // be appended to a table that is already in the document.
  // Every shape number, not the first one found. The table carries two — where its rows are
  // attached, and how many of its reads land on a connected node — and they answer different
  // questions: a `find` printed whichever was pushed first and silently hid the other.
  for (const outcome of outcomes) {
    const shapes = outcome.results.filter((result) =>
      result.name === "no forced layout inside the row loop"
      || result.name === "no forced layout inside the card loop"
      || result.name === "no forced layout inside the segment loop"
      || result.name === "no forced layout inside the event loop"
      || result.name === "no per-row layout read"
      || result.name === "no row appended to a connected table");
    for (const shape of shapes) {
      console.log(`  shape  ${`${outcome.scenario.renderer}/${outcome.scenario.bag}`.padEnd(20)} ${shape.detail}`);
    }
  }
  console.log("");

  for (const outcome of outcomes) {
    const label = outcome.scenario.renderer + "/" + outcome.scenario.bag;
    for (const result of outcome.results) {
      const mark = result.pass ? "PASS" : "FAIL";
      if (!result.pass) failures.push(`${label}: ${result.name} — ${result.detail}`);
      console.log(`  ${mark}  ${label.padEnd(20)} ${result.name}`);
      if (!result.pass) console.log(`       ${result.detail}`);
    }
  }
} catch (error) {
  failures.push(`harness run failed: ${error.message}`);
} finally {
  if (browser) await browser.close();
  rmSync(work, { recursive: true, force: true });
}

if (!outcomes) {
  console.error(`\nrender-assertions: FAIL — ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────
// 5. BAG SHAPE COMPARISON
// ───────────────────────────────────────────────────────────────────

console.log("\nrender-assertions: bag shapes against the measured host construction sites");
for (const outcome of outcomes) {
  const key = `${outcome.scenario.renderer}/${outcome.scenario.bag}`;
  const expected = BAGS[key];
  const actual = outcome.bagKeys;
  const missing = expected.filter((member) => !actual.includes(member));
  const extra = actual.filter((member) => !expected.includes(member));
  const ok = missing.length === 0 && extra.length === 0;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${key.padEnd(20)} ${actual.length}/${expected.length} members`
    + (missing.length ? `; MISSING: ${missing.join(", ")}` : "")
    + (extra.length ? `; UNEXPECTED: ${extra.join(", ")}` : ""));
  if (!ok) failures.push(`bag shape ${key}: ${missing.length ? `missing ${missing.join(", ")}` : `unexpected ${extra.join(", ")}`}`);
}

console.log(`  file-view-only members (${FILE_VIEW_ONLY.length}): ${FILE_VIEW_ONLY.join(", ")}`);
console.log("  embed-only member: isReadOnly");
console.log("  note: the embed omits openRecordDetail, so an embedded row cannot open the record panel;");
console.log("        this check asserts the difference exists, not that it is intended");

// ───────────────────────────────────────────────────────────────────
// 6. COVERAGE RATCHET
// ───────────────────────────────────────────────────────────────────

const constructed = new Set(SCENARIOS.map((scenario) => scenario.renderer)).size;
const viewFiles = readdirSync(join(REPO, "src/views"))
  .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts") && !name.endsWith(".stories.ts"));
const total = viewFiles.filter((name) =>
  /export class \w*Renderer/.test(readFileSync(join(REPO, "src/views", name), "utf8"))).length;

let published = 0;
if (existsSync(join(REPO, STAMP_PATH))) {
  const record = JSON.parse(readFileSync(join(REPO, STAMP_PATH), "utf8"));
  published = Number(record.constructed) || 0;
}
console.log(`\nrender-assertions: coverage ${constructed} of ${total} renderers exercised by this check`
  + ` (published ${published})`);
if (constructed < published) {
  console.error(`render-assertions: FAIL — coverage cannot decrease: ${published} published, `
    + `this check constructs ${constructed}`);
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────
// 7. VERDICT
// ───────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(`\nrender-assertions: FAIL — ${failures.length} assertion(s) failed`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

stamp(
  STAMP_PATH,
  { constructed, total },
  [
    "tools/live/render-assertions.mjs",
    "tools/live/render-assertion-harness.ts",
    ...RENDERER_SOURCES,
    "tools/bench/list-render-bench.ts",
    "tools/bench/table-render-bench.ts",
    "tools/bench/board-render-bench.ts",
    "tools/bench/gallery-render-bench.ts",
    "tools/bench/calendar-render-bench.ts",
    "tools/bench/timeline-render-bench.ts",
    "src/views/database-view.ts",
    "src/views/embedded-database-renderer.ts",
  ],
);
console.log(`render-assertions: coverage stamped at ${STAMP_PATH}`);

console.log("\nrender-assertions: PASS — the shipped renderers built the asserted structure in headless Chrome");
console.log("  what this does not prove: no Obsidian host is constructed (DatabaseView and the embed");
console.log("  need a live App, workspace and metadata cache); no device is involved; App is undefined,");
console.log("  so vault-resolving fields render unresolved — a real database pays more per field, never less.");
process.exit(0);
