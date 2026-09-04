#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    constructed-state-assertions
// COMPONENT: gate check that the harness's per-view state options render real per-state markers
// ───────────────────────────────────────────────────────────────────
//
// `043`'s own audit left thirteen fixture-only scenarios open because the harness had no way to
// construct the states they depict: a subtask tree, sparse fields, a no-date-field empty state, a
// chart drawn as a single number or as its all-groups-hidden empty state, and three settings
// popovers opened through their own toolbar renderer's real `togglePopover`. This check is the red
// half of building that: each state below is asserted by its own DOM marker, mounted through
// `runRenderAssertions` exactly as `capture.mjs`'s constructed pass will mount it, so a marker that
// never appears fails loudly instead of shipping a capture of an unmounted or wrong-shaped view.
//
// The boolean-option states (subtask tree, sparse fields, empty state, chart variant) are proven
// the same way `typed-data-assertions.mjs` proves `captureData`: mounted twice, option off and
// option on, and the marker is required to appear ONLY on the "on" side — a marker that also
// showed up off would prove nothing about the option. The three toolbar-popover renderers are new
// `ScenarioSpec.renderer` values rather than a boolean on an existing one, so their own "off" state
// is simply that the renderer value does not exist yet, which is what a run against pre-`043`
// `render-assertion-harness.ts` demonstrates directly (the scenario never mounts).
//
// Usage: node tools/live/constructed-state-assertions.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { buildRenderAssertionBundle } from "./render-assertion-bundle.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));

// ───────────────────────────────────────────────────────────────────
// 2. BUNDLE
// ───────────────────────────────────────────────────────────────────

// Mounts the given scenario and reads its markers off the DOM before the harness removes the
// container. Every marker is a real class or attribute a production renderer writes — see
// render-assertion-harness.ts's own per-branch assertions for the same selectors.
const { work, missingSources } = await buildRenderAssertionBundle(`
window.__stateMarkers = (scenario) => {
  let result = { mounted: false };
  runRenderAssertions(document.body, scenario, "", (container) => {
    const doc = container.ownerDocument;
    const statusColors = new Set(Array.from(container.querySelectorAll(".status-badge"))
      .map((el) => [...el.classList].find((cls) => cls.startsWith("status-color-")) || ""));
    result = {
    mounted: true,
    subtaskToggle: !!container.querySelector(".db-subtask-toggle, .db-subtask-event-toggle, .pm-collapse-toggle"),
    subtaskProgress: !!container.querySelector(".db-subtask-progress, .db-timeline-subtask-progress, .pm-gantt-label-progress"),
    subtaskDepthChild: !!container.querySelector('[data-subtask-depth="1"]')
      || (() => {
        const rows = Array.from(container.querySelectorAll(".pm-gantt-label-row[data-task-id]"));
        const indents = rows.map((row) => parseInt(row.style.paddingLeft || "0", 10));
        return indents.length > 1 && Math.max(...indents) > Math.min(...indents);
      })(),
    placeholderField: !!container.querySelector(".db-list-field.is-placeholder"),
    emptyDateReason: !!container.querySelector('[data-empty-reason="no-date-field"]'),
    calendarGrid: !!container.querySelector(".db-calendar"),
    chartNumber: !!container.querySelector(".db-chart-number"),
    chartEmpty: !!container.querySelector(".db-chart-empty"),
    chartCanvas: !!container.querySelector(".db-chart-canvas"),
    miniCalendarPopover: !!container.querySelector(".db-calendar-mini-popover .db-calendar-mini-grid"),
    calendarOptionsPopover: !!container.querySelector(".db-calendar-options-popover"),
    timelineOptionsPopover: !!container.querySelector(".db-calendar-timeline-options-popover"),
    chartOptionsPopover: !!container.querySelector(".db-chart-options-popover"),
    toolbar: !!container.querySelector(".db-toolbar .db-view-tab"),
    toolbarSearchActive: !!container.querySelector(".db-search-control.is-active"),
    toolbarUtilitiesPopover: !!container.querySelector(".db-toolbar-utilities-popover"),
    toolbarAddViewPopover: !!container.querySelector(".db-add-view-popover"),
    activeViewControls: !!container.querySelector(".db-active-view-controls .db-active-control-chip"),
    activeRulePopover: !!container.querySelector(".db-active-rule-popover"),
    filterPanel: !!container.querySelector(".db-filter-panel .db-source-rule-node"),
    filterPanelNested: !!container.querySelector(".db-filter-panel .db-source-rule-not"),
    sortPanel: !!container.querySelector(".db-sort-panel .db-sort-rule-row"),
    sortPanelCalendarHint: !!container.querySelector(".db-sort-panel .db-panel-hint"),
    viewConfigPanel: !!container.querySelector(".db-view-config-panel"),
    columnManager: !!container.querySelector(".db-column-manager .db-column-manager-row"),
    recordDetailPanel: !!container.querySelector(".db-record-detail-panel"),
    recordDetailBodyEditing: !!container.querySelector(".db-record-detail-body.is-editing .db-record-detail-body-editor"),
    recordDetailBodyEmpty: !!container.querySelector(".db-record-detail-body .db-record-detail-body-rendered.is-empty"),
    recordPeekPanel: !!container.querySelector(".db-record-peek-panel"),
    tableFooterCalculations: !!container.querySelector("tfoot.db-table-footer .db-table-footer-trigger.has-calculation"),
    tableGrouped: !!container.querySelector(".db-grouped-table tr.db-group-divider-row"),
    summaryRow: !!container.querySelector(".db-summary .db-summary-item"),
    ownedMenu: !!doc.querySelector(".db-owned-menu .db-menu-item"),
    groupSelectionBoxes: !!container.querySelector(".db-list-group-checkbox")
      && !!container.querySelector(".db-gallery-group-checkbox")
      && !!container.querySelector(".db-board-column-checkbox"),
    cardCovers: !!container.querySelector(".db-board-card-cover.is-empty .db-board-card-cover-placeholder")
      && !!container.querySelector(".db-gallery-cover.is-empty .db-gallery-cover-placeholder"),
    cellEditorText: !!container.querySelector('.db-cell-edit-popover[data-note-database-editor-kind="text"] .db-md-toolbar'),
    cellEditorSelect: !!container.querySelector(".db-cell-option-popover .db-cell-option-item"),
    datePicker: !!container.querySelector(".db-date-value-popover .db-calendar-mini-grid"),
    datePickerDatetime: !!container.querySelector(".db-date-value-popover.is-datetime .db-hour-seg"),
    iconPicker: !!doc.querySelector(".db-icon-picker-popover .db-icon-picker-colors"),
    colorPicker: !!doc.querySelector(".db-color-picker-popup .db-color-picker-swatch.is-selected"),
    relationValues: !container.querySelector("table")
      && container.querySelectorAll(".db-relation-values .db-relation-link").length >= 2,
    fileFields: !!container.querySelector(".db-file-tags .db-file-tag-badge")
      && !!container.querySelector(".db-file-link-list .internal-link"),
    numberDisplays: !!container.querySelector(".db-cell-rating")
      && !!container.querySelector(".db-cell-progress")
      && !!container.querySelector(".db-cell-progress-ring"),
    recordIconColumn: !!container.querySelector(".db-record-icon-emoji")
      && !!container.querySelector(".db-record-icon.is-default"),
    statusColors: statusColors.size >= 16,
    dropdownPopover: !!container.querySelector(".db-dropdown-popover .db-dropdown-option.is-disabled"),
    emptyStateCard: !!container.querySelector(".db-empty-card .db-empty-card-title"),
    columnHeaderTriggers: !!container.querySelector(".db-column-menu-trigger")
      && !!container.querySelector(".db-resize-handle"),
    boardEmptyColumn: Array.from(container.querySelectorAll(".pm-kanban-col"))
      .some((col) => col.querySelectorAll(".pm-kanban-card").length === 0),
    boardExtensions: !!container.querySelector(".db-board-column-checkbox")
      && !!container.querySelector(".db-board-card-checkbox"),
    };
  });
  return result;
};
`);

if (missingSources.length > 0) {
  console.error(`constructed-state-assertions: FAIL — the bundle no longer imports ${missingSources.join(", ")}`);
  console.error("  a check that does not bundle the shipped renderer proves nothing about it");
  process.exit(1);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${REPO}styles.css"></head>
<body class="theme-dark"><script src="render-bundle.js"></script></body></html>`);

// ───────────────────────────────────────────────────────────────────
// 3. RUN
// ───────────────────────────────────────────────────────────────────

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  for (const candidate of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ]) if (existsSync(candidate)) return candidate;
  throw new Error("constructed-state-assertions: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

// Paired cases: [id, "off" spec, "on" spec, marker keys that must flip, unaffected marker keys
// that must stay false on both sides (a marker from an unrelated state that a broken branch could
// accidentally trip)].
const PAIRED_CASES = [
  {
    id: "constructed-board-subtask",
    off: { renderer: "board", bag: "file-view", captureData: true },
    // The reference kanban card the default board reproduces has no subtask tree by design; the
    // tree's markers live on the extensions card path, so the option side constructs the board
    // the product actually draws them on.
    on: { renderer: "board", bag: "file-view", captureData: true, subtaskTree: true, boardExtensions: true },
    onMarkers: ["subtaskToggle", "subtaskProgress", "subtaskDepthChild"],
  },
  {
    id: "constructed-timeline-subtask",
    off: { renderer: "timeline", bag: "file-view", captureData: true },
    on: { renderer: "timeline", bag: "file-view", captureData: true, subtaskTree: true },
    onMarkers: ["subtaskToggle", "subtaskProgress", "subtaskDepthChild"],
  },
  {
    id: "constructed-list-sparse",
    off: { renderer: "list", bag: "file-view", captureData: true },
    on: { renderer: "list", bag: "file-view", captureData: true, sparseFields: true },
    onMarkers: ["placeholderField"],
  },
  {
    id: "constructed-calendar-empty",
    off: { renderer: "calendar", bag: "file-view", captureData: true },
    on: { renderer: "calendar", bag: "file-view", captureData: true, emptyState: true },
    onMarkers: ["emptyDateReason"],
    offOnlyMarkers: ["calendarGrid"],
  },
  {
    id: "constructed-chart-number",
    off: { renderer: "chart", bag: "file-view", captureData: true },
    on: { renderer: "chart", bag: "file-view", captureData: true, chartVariant: "number" },
    onMarkers: ["chartNumber"],
    offOnlyMarkers: ["chartCanvas"],
  },
  {
    id: "constructed-chart-empty",
    off: { renderer: "chart", bag: "file-view", captureData: true },
    on: { renderer: "chart", bag: "file-view", captureData: true, chartVariant: "empty" },
    onMarkers: ["chartEmpty"],
    offOnlyMarkers: ["chartCanvas"],
  },
];

// Single-mount cases: brand-new `renderer` values with no boolean to pair against. Their own "off"
// state is a pre-`043` harness where the renderer value does not exist and the scenario never
// mounts — which is exactly the run that established this file's own red, before these branches
// existed.
const SINGLE_CASES = [
  {
    id: "constructed-calendar-mini",
    spec: { renderer: "calendar", bag: "file-view", captureData: true, miniCalendar: true },
    marker: "miniCalendarPopover",
  },
  {
    id: "constructed-calendar-toolbar-options",
    spec: { renderer: "calendar-toolbar", bag: "file-view" },
    marker: "calendarOptionsPopover",
  },
  {
    id: "constructed-timeline-toolbar-options",
    spec: { renderer: "timeline-toolbar", bag: "file-view" },
    marker: "timelineOptionsPopover",
  },
  {
    id: "constructed-chart-toolbar-options",
    spec: { renderer: "chart-toolbar", bag: "file-view" },
    marker: "chartOptionsPopover",
  },
  {
    id: "constructed-toolbar",
    spec: { renderer: "toolbar", bag: "file-view", captureData: true },
    marker: "toolbar",
  },
  {
    id: "constructed-toolbar-search",
    spec: { renderer: "toolbar", bag: "file-view", captureData: true, searchText: "notion" },
    marker: "toolbarSearchActive",
  },
  {
    id: "constructed-toolbar-utilities",
    spec: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" },
    marker: "toolbarUtilitiesPopover",
  },
  {
    id: "constructed-toolbar-add-view",
    spec: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "add-view" },
    marker: "toolbarAddViewPopover",
  },
  {
    id: "constructed-active-view-controls",
    spec: { renderer: "active-view-controls", bag: "file-view", captureData: true },
    marker: "activeViewControls",
  },
  {
    id: "constructed-active-rule-filter",
    spec: { renderer: "active-rule-popover", bag: "file-view", captureData: true, ruleKind: "filter" },
    marker: "activeRulePopover",
  },
  {
    id: "constructed-active-rule-sort",
    spec: { renderer: "active-rule-popover", bag: "file-view", captureData: true, ruleKind: "sort" },
    marker: "activeRulePopover",
  },
  {
    id: "constructed-filter-panel",
    spec: { renderer: "filter-panel", bag: "file-view", captureData: true },
    marker: "filterPanel",
  },
  {
    id: "constructed-filter-panel-nested",
    spec: { renderer: "filter-panel", bag: "file-view", captureData: true, filterDepth: "nested" },
    marker: "filterPanelNested",
  },
  {
    id: "constructed-sort-panel",
    spec: { renderer: "sort-panel", bag: "file-view", captureData: true },
    marker: "sortPanel",
  },
  {
    id: "constructed-sort-panel-calendar",
    spec: { renderer: "sort-panel", bag: "file-view", captureData: true, calendarHint: true },
    marker: "sortPanelCalendarHint",
  },
  {
    id: "constructed-view-config",
    spec: { renderer: "view-config", bag: "file-view", captureData: true },
    marker: "viewConfigPanel",
  },
  {
    id: "constructed-column-manager",
    spec: { renderer: "column-manager", bag: "file-view", captureData: true },
    marker: "columnManager",
  },
  {
    id: "constructed-record-detail",
    spec: { renderer: "record-detail", bag: "file-view", captureData: true },
    marker: "recordDetailPanel",
  },
  {
    id: "constructed-record-detail-body-editing",
    spec: { renderer: "record-detail-body", bag: "file-view", recordBodyVariant: "editing" },
    marker: "recordDetailBodyEditing",
  },
  {
    id: "constructed-record-detail-body-empty",
    spec: { renderer: "record-detail-body", bag: "file-view", recordBodyVariant: "empty" },
    marker: "recordDetailBodyEmpty",
  },
  {
    id: "constructed-record-peek",
    spec: { renderer: "record-peek", bag: "file-view", captureData: true },
    marker: "recordPeekPanel",
  },
  {
    id: "constructed-table-footer",
    spec: { renderer: "table", bag: "file-view", captureData: true, tableFooter: true },
    marker: "tableFooterCalculations",
  },
  {
    id: "constructed-table-grouped",
    spec: { renderer: "table", bag: "file-view", captureData: true, tableGroups: true },
    marker: "tableGrouped",
  },
  {
    id: "constructed-summary",
    spec: { renderer: "summary", bag: "file-view", captureData: true },
    marker: "summaryRow",
  },
  {
    id: "constructed-owned-menu",
    spec: { renderer: "owned-menu", bag: "file-view" },
    marker: "ownedMenu",
  },
  {
    id: "constructed-group-selection-controls",
    spec: { renderer: "group-selection-controls", bag: "file-view", captureData: true },
    marker: "groupSelectionBoxes",
  },
  {
    id: "constructed-card-covers",
    spec: { renderer: "card-covers", bag: "file-view", captureData: true },
    marker: "cardCovers",
  },
  {
    id: "constructed-cell-editor-text",
    spec: { renderer: "cell-editors", bag: "file-view", captureData: true },
    marker: "cellEditorText",
  },
  {
    id: "constructed-cell-editor-select",
    spec: { renderer: "cell-editors", bag: "file-view", captureData: true, editorKind: "select" },
    marker: "cellEditorSelect",
  },
  {
    id: "constructed-date-picker",
    spec: { renderer: "date-picker", bag: "file-view" },
    marker: "datePicker",
  },
  {
    id: "constructed-date-picker-datetime",
    spec: { renderer: "date-picker", bag: "file-view", includeTime: true },
    marker: "datePickerDatetime",
  },
  {
    id: "constructed-icon-picker",
    spec: { renderer: "icon-picker", bag: "file-view" },
    marker: "iconPicker",
  },
  {
    id: "constructed-option-color-picker",
    spec: { renderer: "color-picker", bag: "file-view" },
    marker: "colorPicker",
  },
  {
    id: "constructed-relation-values",
    spec: { renderer: "relation-values", bag: "file-view", captureData: true },
    marker: "relationValues",
  },
  {
    id: "constructed-file-fields",
    spec: { renderer: "file-fields", bag: "file-view", captureData: true },
    marker: "fileFields",
  },
  {
    id: "constructed-number-displays",
    spec: { renderer: "number-display", bag: "file-view" },
    marker: "numberDisplays",
  },
  {
    id: "constructed-record-icon",
    spec: { renderer: "record-icon", bag: "file-view", captureData: true },
    marker: "recordIconColumn",
  },
  {
    id: "constructed-status-colors",
    spec: { renderer: "table", bag: "file-view", captureData: true, fullStatusPalette: true },
    marker: "statusColors",
  },
  {
    id: "constructed-dropdown",
    spec: { renderer: "dropdown", bag: "file-view" },
    marker: "dropdownPopover",
  },
  {
    id: "constructed-empty-state",
    spec: { renderer: "empty-state", bag: "file-view" },
    marker: "emptyStateCard",
  },
  {
    id: "constructed-column-header",
    spec: { renderer: "column-header", bag: "file-view", captureData: true },
    marker: "columnHeaderTriggers",
  },
  {
    id: "constructed-board-empty-column",
    spec: { renderer: "board", bag: "file-view", captureData: true, boardEmptyColumn: true },
    marker: "boardEmptyColumn",
  },
  {
    id: "constructed-board-extensions",
    spec: { renderer: "board", bag: "file-view", captureData: true, boardExtensions: true },
    marker: "boardExtensions",
  },
];

const failures = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);

  for (const { id, off, on, onMarkers, offOnlyMarkers } of PAIRED_CASES) {
    const offMarkers = await page.evaluate((scenario) => window.__stateMarkers(scenario), off);
    const onMarkersResult = await page.evaluate((scenario) => window.__stateMarkers(scenario), on);
    console.log(`constructed-state-assertions: ${id} mounted twice — option off and option on\n`);

    for (const [label, markers] of [["off", offMarkers], ["on", onMarkersResult]]) {
      if (!markers.mounted) {
        failures.push(`${id} — ${label}: did not mount`);
        console.log(`  FAIL  ${id} — ${label} — did not mount`);
      }
    }
    if (offMarkers.mounted && onMarkersResult.mounted) {
      for (const marker of onMarkers) {
        const offOk = offMarkers[marker] === false;
        const onOk = onMarkersResult[marker] === true;
        if (!offOk) failures.push(`${id} — off: ${marker} was true, wanted false (proves nothing about the option)`);
        if (!onOk) failures.push(`${id} — on: ${marker} was false, wanted true`);
        console.log(`  ${offOk ? "PASS" : "FAIL"}  ${id} — off — ${marker}: ${offMarkers[marker]}`);
        console.log(`  ${onOk ? "PASS" : "FAIL"}  ${id} — on — ${marker}: ${onMarkersResult[marker]}`);
      }
      for (const marker of offOnlyMarkers || []) {
        const offOk = offMarkers[marker] === true;
        const onOk = onMarkersResult[marker] === false;
        if (!offOk) failures.push(`${id} — off: ${marker} was false, wanted true (the default shape)`);
        if (!onOk) failures.push(`${id} — on: ${marker} was true, wanted false (the state it was replaced by)`);
        console.log(`  ${offOk ? "PASS" : "FAIL"}  ${id} — off — ${marker}: ${offMarkers[marker]}`);
        console.log(`  ${onOk ? "PASS" : "FAIL"}  ${id} — on — ${marker}: ${onMarkersResult[marker]}`);
      }
    }
    console.log("");
  }

  for (const { id, spec, marker } of SINGLE_CASES) {
    const markers = await page.evaluate((scenario) => window.__stateMarkers(scenario), spec);
    console.log(`constructed-state-assertions: ${id} mounted once — a new renderer value with no boolean pair\n`);
    if (!markers.mounted) {
      failures.push(`${id}: did not mount`);
      console.log(`  FAIL  ${id} — did not mount`);
    } else {
      const ok = markers[marker] === true;
      if (!ok) failures.push(`${id}: ${marker} was ${markers[marker]}, wanted true`);

      console.log(`  ${ok ? "PASS" : "FAIL"}  ${id} — ${marker}: ${markers[marker]}`);
    }
    console.log("");
  }

  await page.close();
  for (const error of pageErrors) failures.push(`page error: ${error}`);
} catch (error) {
  failures.push(`harness run failed: ${error.message}`);
} finally {
  if (browser) await browser.close();
  rmSync(work, { recursive: true, force: true });
}

// ───────────────────────────────────────────────────────────────────
// 4. VERDICT
// ───────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(`\nconstructed-state-assertions: FAIL — ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("\nconstructed-state-assertions: PASS — every per-view state option renders its marker only");
console.log("  when the option is on, and every new toolbar-popover renderer opens its real production");
console.log("  popover through togglePopover().");
process.exit(0);
