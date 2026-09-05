// ───────────────────────────────────────────────────────────────────
// MODULE:    render-assertion-bundle
// COMPONENT: the one esbuild step that turns the shipped renderers into a browser-runnable bundle
// ───────────────────────────────────────────────────────────────────
//
// Three checks need a real constructed renderer inside headless Chrome: render-assertions (which
// asserts structural facts about it), and touch-targets/unstyled-links (which measure it). All
// three must be looking at the identical bundle — the same obsidian stub, the same DOM shim, the
// same renderer sources — because a check that built its own copy could drift from what the others
// construct and would prove nothing about the shipped path. This module is that one build step,
// called once per check with the entry code each one needs on top of the shared preamble.
//
// The scenario list lives here too, for the same reason: three checks iterating a list that could
// silently diverge would each claim to cover "every scenario the harness knows" while covering a
// different set.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HERE = fileURLToPath(new URL(".", import.meta.url));

// ───────────────────────────────────────────────────────────────────
// 2. THE SHARED SCENARIO LIST
// ───────────────────────────────────────────────────────────────────

// The row counts and column shapes the benches already measure — the operator's
// twenty-one-column database at thirty percent fill, and the table bench's
// sixteen-column table. Sampling above the bend matters for timing budgets;
// here it matters that the row count is the count the freeze was measured at.
export const SCENARIOS = [
  { name: "table/file-view", renderer: "table", bag: "file-view" },
  { name: "table/embed", renderer: "table", bag: "embed" },
  { name: "board/file-view", renderer: "board", bag: "file-view" },
  { name: "board/embed", renderer: "board", bag: "embed" },
  { name: "gallery/file-view", renderer: "gallery", bag: "file-view" },
  { name: "gallery/embed", renderer: "gallery", bag: "embed" },
  { name: "calendar/file-view", renderer: "calendar", bag: "file-view" },
  { name: "calendar/embed", renderer: "calendar", bag: "embed" },
  { name: "calendar-week/file-view", renderer: "calendar", bag: "file-view", scale: "week" },
  { name: "calendar-week/embed", renderer: "calendar", bag: "embed", scale: "week" },
  { name: "calendar-day/file-view", renderer: "calendar", bag: "file-view", scale: "day" },
  { name: "calendar-day/embed", renderer: "calendar", bag: "embed", scale: "day" },
  { name: "timeline/file-view", renderer: "timeline", bag: "file-view" },
  { name: "timeline/embed", renderer: "timeline", bag: "embed" },
  // The remaining four scales the timeline ships. "week" is already covered by the implicit
  // entry above (ScenarioSpec.scale defaults to "week"), so this is the other four, not five.
  { name: "timeline-day/file-view", renderer: "timeline", bag: "file-view", scale: "day" },
  { name: "timeline-month/file-view", renderer: "timeline", bag: "file-view", scale: "month" },
  { name: "timeline-quarter/file-view", renderer: "timeline", bag: "file-view", scale: "quarter" },
  { name: "timeline-year/file-view", renderer: "timeline", bag: "file-view", scale: "year" },
  { name: "chart/file-view", renderer: "chart", bag: "file-view" },
];

// The per-view state variants and the non-renderer surfaces: the same ScenarioSpec fields
// constructed-state-assertions.mjs proves mount a real per-state marker (a subtask tree, sparse
// fields, a no-date-field empty state, the two non-bar chart variants, the mini-calendar popover,
// the three toolbar settings popovers, the toolbar and its popovers, the anchored panels, the
// field editors and pickers, and the value renderers). Exported separately from SCENARIOS rather
// than merged into it: render-assertions.mjs also reads SCENARIOS, and its BAGS table has no
// entry for the non-renderer `renderer` values these add (or for the renderer/bag pairs they
// reuse under state options), so merging them there would look up an undefined bag shape and
// throw. touch-targets.mjs and unstyled-links.mjs measure DOM geometry and link colour, not
// action-bag membership, so that constraint does not apply to them.
export const STATE_SCENARIOS = [
  { name: "board-subtask-tree/file-view", renderer: "board", bag: "file-view", captureData: true, subtaskTree: true },
  { name: "timeline-subtask-tree/file-view", renderer: "timeline", bag: "file-view", captureData: true, subtaskTree: true },
  { name: "calendar-mini-calendar/file-view", renderer: "calendar", bag: "file-view", captureData: true, miniCalendar: true },
  { name: "calendar-empty-state/file-view", renderer: "calendar", bag: "file-view", captureData: true, emptyState: true },
  { name: "chrome-chart-number/file-view", renderer: "chart", bag: "file-view", captureData: true, chartVariant: "number" },
  { name: "chrome-chart-empty/file-view", renderer: "chart", bag: "file-view", captureData: true, chartVariant: "empty" },
  { name: "calendar-toolbar-options/file-view", renderer: "calendar-toolbar", bag: "file-view" },
  { name: "timeline-toolbar-options/file-view", renderer: "timeline-toolbar", bag: "file-view" },
  { name: "chrome-chart-options-popover/file-view", renderer: "chart-toolbar", bag: "file-view" },
  // The toolbar and its popovers.
  { name: "chrome-toolbar/file-view", renderer: "toolbar", bag: "file-view", captureData: true },
  { name: "chrome-toolbar-search/file-view", renderer: "toolbar", bag: "file-view", captureData: true, searchText: "notion" },
  { name: "chrome-toolbar-utilities/file-view", renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" },
  { name: "chrome-toolbar-add-view/file-view", renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "add-view" },
  { name: "chrome-active-view-controls/file-view", renderer: "active-view-controls", bag: "file-view", captureData: true },
  { name: "chrome-active-rule-filter/file-view", renderer: "active-rule-popover", bag: "file-view", captureData: true, ruleKind: "filter" },
  { name: "chrome-active-rule-sort/file-view", renderer: "active-rule-popover", bag: "file-view", captureData: true, ruleKind: "sort" },
  // The anchored panels.
  { name: "panel-filter-conditions/file-view", renderer: "filter-panel", bag: "file-view", captureData: true },
  { name: "panel-filter-nested/file-view", renderer: "filter-panel", bag: "file-view", captureData: true, filterDepth: "nested" },
  { name: "panel-sort-rules/file-view", renderer: "sort-panel", bag: "file-view", captureData: true },
  { name: "panel-sort-calendar-empty/file-view", renderer: "sort-panel", bag: "file-view", captureData: true, calendarHint: true },
  { name: "panel-view-config/file-view", renderer: "view-config", bag: "file-view", captureData: true },
  { name: "panel-column-manager/file-view", renderer: "column-manager", bag: "file-view", captureData: true },
  { name: "panel-record-detail/file-view", renderer: "record-detail", bag: "file-view", captureData: true },
  { name: "panel-record-detail-docked/file-view", renderer: "record-detail", bag: "file-view", captureData: true, recordPlacement: "docked" },
  { name: "panel-record-detail-body-editing/file-view", renderer: "record-detail-body", bag: "file-view", recordBodyVariant: "editing" },
  { name: "panel-record-detail-body-empty/file-view", renderer: "record-detail-body", bag: "file-view", recordBodyVariant: "empty" },
  { name: "panel-record-peek/file-view", renderer: "record-peek", bag: "file-view", captureData: true },
  // The chrome surfaces.
  { name: "chrome-table-footer/file-view", renderer: "table", bag: "file-view", captureData: true, tableFooter: true },
  { name: "chrome-table-grouped/file-view", renderer: "table", bag: "file-view", captureData: true, tableGroups: true },
  { name: "chrome-summary/file-view", renderer: "summary", bag: "file-view", captureData: true },
  { name: "chrome-owned-menu/file-view", renderer: "owned-menu", bag: "file-view" },
  { name: "chrome-group-selection-controls/file-view", renderer: "group-selection-controls", bag: "file-view", captureData: true },
  { name: "chrome-card-covers/file-view", renderer: "card-covers", bag: "file-view", captureData: true },
  // The field editors, pickers and value renderers.
  { name: "field-cell-editors-text/file-view", renderer: "cell-editors", bag: "file-view", captureData: true },
  { name: "field-cell-editors-select/file-view", renderer: "cell-editors", bag: "file-view", captureData: true, editorKind: "select" },
  { name: "field-date-picker/file-view", renderer: "date-picker", bag: "file-view" },
  { name: "field-date-picker-datetime/file-view", renderer: "date-picker", bag: "file-view", includeTime: true },
  { name: "field-icon-picker/file-view", renderer: "icon-picker", bag: "file-view" },
  { name: "field-option-color-picker/file-view", renderer: "color-picker", bag: "file-view" },
  { name: "field-relation-values/file-view", renderer: "relation-values", bag: "file-view", captureData: true },
  { name: "field-file-fields/file-view", renderer: "file-fields", bag: "file-view", captureData: true },
  { name: "field-number-displays/file-view", renderer: "number-display", bag: "file-view" },
  { name: "field-record-icon/file-view", renderer: "record-icon", bag: "file-view", captureData: true },
  { name: "field-status-colors/file-view", renderer: "table", bag: "file-view", captureData: true, fullStatusPalette: true },
  // The core components.
  { name: "core-dropdown-field/file-view", renderer: "dropdown", bag: "file-view" },
  { name: "core-empty-state/file-view", renderer: "empty-state", bag: "file-view" },
  { name: "core-column-header/file-view", renderer: "column-header", bag: "file-view", captureData: true },
  { name: "table-column-headers/file-view", renderer: "table", bag: "file-view", captureData: true, columnHeaderController: true, longHeaderLabel: true },
  // The board/gallery state variants.
  { name: "board-empty-column/file-view", renderer: "board", bag: "file-view", captureData: true, boardEmptyColumn: true },
  { name: "board-extensions-selection/file-view", renderer: "board", bag: "file-view", captureData: true, boardExtensions: true },
  { name: "board-covers/file-view", renderer: "board", bag: "file-view", captureData: true, boardExtensions: true, boardImageField: true },
  { name: "gallery-covers/file-view", renderer: "gallery", bag: "file-view", captureData: true, galleryImageField: true },
];

// touch-targets.mjs and unstyled-links.mjs's own constructed pass: every scenario SCENARIOS
// carries, plus the ten state variants above — the list those two lanes' internal fixture-vs-
// constructed cross-check reads instead of SCENARIOS alone.
export const SCENARIOS_WITH_STATES = [...SCENARIOS, ...STATE_SCENARIOS];

export const RENDERER_SOURCES = [
  "src/views/table-renderer.ts",
  "src/views/board-renderer.ts",
  "src/views/gallery-renderer.ts",
  "src/views/calendar-renderer.ts",
  "src/views/calendar-timeline-renderer.ts",
  "src/views/chart-renderer.ts",
];

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

/**
 * Builds the shared render-assertion bundle. The preamble installs the obsidian DOM shim and
 * imports `runRenderAssertions`; the caller's `entryBody` is appended verbatim underneath it and
 * decides what the bundle exposes on `window` for the page to call.
 *
 * Returns the temp work directory (the caller writes its own `index.html` beside the bundle, since
 * the body class and stylesheet set differ per check, and removes the directory when done),
 * the bundle path, and `missingSources` — non-empty when the bundle stopped importing a shipped
 * renderer, which every caller must treat as a hard failure rather than asserting or measuring
 * DOM that does not prove what it claims to.
 */
export async function buildRenderAssertionBundle(entryBody) {
  const work = mkdtempSync(join(tmpdir(), "render-assertions-"));
  const entry = join(work, "render-entry.ts");
  const bundlePath = join(work, "render-bundle.js");

  writeFileSync(entry, `
import { installObsidianDomShim } from "${resolve(HERE, "../storybook/obsidian-dom-shim.mjs")}";
import { runRenderAssertions } from "${resolve(HERE, "render-assertion-harness")}";

installObsidianDomShim(window);
${entryBody}
`);

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

  // The bundle must have been built from the shipped sources. A bundle that
  // stopped importing a renderer and rendered a copy instead would prove the
  // copy, so the manifest is checked rather than assumed.
  const bundleInputs = Object.keys(built.metafile.inputs);
  const missingSources = RENDERER_SOURCES.filter((source) => !bundleInputs.includes(source));

  return { work, bundlePath, missingSources };
}
