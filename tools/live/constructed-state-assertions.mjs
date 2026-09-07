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
    subtaskToggle: !!container.querySelector(".obnotion-subtask-toggle, .obnotion-subtask-event-toggle, .pm-collapse-toggle"),
    subtaskProgress: !!container.querySelector(".obnotion-subtask-progress, .obnotion-timeline-subtask-progress")
      // The timeline bench's own per-row fixture gives every fourth row a genuine progress
      // value (60%) independent of subtaskTree, so ".pm-gantt-label-progress" alone is not
      // specific to a subtask; applyCaptureSubtaskTree overwrites that same row to 62%, a
      // value the bench fixture never produces on its own.
      || Array.from(container.querySelectorAll(".pm-gantt-label-progress")).some((el) => el.textContent === "62%"),
    subtaskDepthChild: !!container.querySelector('[data-subtask-depth="1"]')
      || (() => {
        const rows = Array.from(container.querySelectorAll(".pm-gantt-label-row[data-task-id]"));
        const indents = rows.map((row) => parseInt(row.style.paddingLeft || "0", 10));
        return indents.length > 1 && Math.max(...indents) > Math.min(...indents);
      })(),
    emptyDateReason: !!container.querySelector('[data-empty-reason="no-date-field"]'),
    calendarGrid: !!container.querySelector(".obnotion-calendar"),
    chartNumber: !!container.querySelector(".obnotion-chart-number"),
    chartEmpty: !!container.querySelector(".obnotion-chart-empty"),
    chartCanvas: !!container.querySelector(".obnotion-chart-canvas"),
    calendarOptionsPopover: !!container.querySelector(".obnotion-calendar-options-popover"),
    timelineOptionsPopover: !!container.querySelector(".obnotion-calendar-timeline-options-popover"),
    chartOptionsPopover: !!container.querySelector(".obnotion-chart-options-popover"),
    toolbar: !!container.querySelector(".obnotion-toolbar .obnotion-view-tab"),
    toolbarSearchActive: !!container.querySelector(".obnotion-search-control.is-active"),
    toolbarUtilitiesPopover: !!container.querySelector(".obnotion-toolbar-utilities-popover"),
    toolbarAddViewPopover: !!container.querySelector(".obnotion-add-view-popover"),
    activeViewControls: !!container.querySelector(".obnotion-active-view-controls .obnotion-active-control-chip"),
    activeRulePopover: !!container.querySelector(".obnotion-active-rule-popover"),
    filterPanel: !!container.querySelector(".obnotion-filter-panel .obnotion-source-rule-node"),
    filterPanelNested: !!container.querySelector(".obnotion-filter-panel .obnotion-source-rule-not"),
    sortPanel: !!container.querySelector(".obnotion-sort-panel .obnotion-sort-rule-row"),
    sortPanelCalendarHint: !!container.querySelector(".obnotion-sort-panel .obnotion-panel-hint"),
    viewConfigPanel: !!container.querySelector(".obnotion-view-config-panel"),
    boardCardPropertiesPanel: !!container.querySelector(".obnotion-view-config-panel .obnotion-column-manager-row"),
    boardCardPropertiesListsEveryField: container.querySelectorAll(".obnotion-view-config-panel .obnotion-column-manager-row").length === 4,
    boardCardPropertiesTagsUnchecked: (() => {
      const cb = container.querySelector('.obnotion-view-config-panel [data-obnotion-column-key="tags"] input[type="checkbox"]');
      return cb !== null && cb.checked === false;
    })(),
    boardCardPropertiesVisibleFieldsChecked: (() => {
      const hours = container.querySelector('.obnotion-view-config-panel [data-obnotion-column-key="hours"] input[type="checkbox"]');
      const due = container.querySelector('.obnotion-view-config-panel [data-obnotion-column-key="due"] input[type="checkbox"]');
      return !!hours && hours.checked === true && !!due && due.checked === true;
    })(),
    columnManager: !!container.querySelector(".obnotion-column-manager .obnotion-column-manager-row"),
    recordDetailPanel: !!container.querySelector(".obnotion-record-detail-panel"),
    recordDetailHeader: !!container.querySelector(".obnotion-record-detail-panel .obnotion-record-detail-header"),
    recordDetailBodyEditing: !!container.querySelector(".obnotion-record-detail-body.is-editing .obnotion-record-detail-body-editor"),
    recordDetailBodyEmpty: !!container.querySelector(".obnotion-record-detail-body .obnotion-record-detail-body-rendered.is-empty"),
    recordPeekPanel: !!container.querySelector(".obnotion-record-peek-panel"),
    tableFooterCalculations: !!container.querySelector("tfoot.obnotion-table-footer .obnotion-table-footer-trigger.has-calculation"),
    tableGrouped: !!container.querySelector(".obnotion-grouped-table tr.obnotion-group-divider-row"),
    summaryRow: !!container.querySelector(".obnotion-summary .obnotion-summary-item"),
    ownedMenu: !!doc.querySelector(".obnotion-owned-menu .obnotion-menu-item"),
    cardCovers: !!container.querySelector(".obnotion-board-card-cover.is-empty .obnotion-board-card-cover-placeholder"),
    cellEditorText: !!container.querySelector('.obnotion-cell-edit-popover[data-obnotion-editor-kind="text"] .obnotion-md-toolbar'),
    cellEditorSelect: !!container.querySelector(".obnotion-cell-option-popover .obnotion-cell-option-item"),
    datePicker: !!container.querySelector(".obnotion-date-value-popover .obnotion-calendar-mini-grid"),
    datePickerDatetime: !!container.querySelector(".obnotion-date-value-popover.is-datetime .obnotion-hour-seg"),
    iconPicker: !!doc.querySelector(".obnotion-icon-picker-popover .obnotion-icon-picker-colors"),
    // A labelled list, not a swatch grid — the current row carries the trailing check.
    colorPicker: !!doc.querySelector(".obnotion-color-picker-popup .obnotion-dropdown-option.is-selected .obnotion-dropdown-option-check"),
    relationValues: !container.querySelector("table")
      && container.querySelectorAll(".obnotion-relation-values .obnotion-relation-link").length >= 2,
    fileFields: !!container.querySelector(".obnotion-file-tags .obnotion-file-tag-badge")
      && !!container.querySelector(".obnotion-file-link-list .internal-link"),
    numberDisplays: !!container.querySelector(".obnotion-cell-rating")
      && !!container.querySelector(".obnotion-cell-progress")
      && !!container.querySelector(".obnotion-cell-progress-ring"),
    recordIconColumn: !!container.querySelector(".obnotion-record-icon-emoji")
      && !!container.querySelector(".obnotion-record-icon.is-default"),
    statusColors: statusColors.size >= 16,
    dropdownPopover: !!container.querySelector(".obnotion-dropdown-popover .obnotion-dropdown-option.is-disabled")
      // The selected row's own check must be present AND trailing — lastElementChild === check
      // fails both for a row with no check at all (negative control: a checkless row cannot pass by
      // matching nothing) and for a row whose check still renders first.
      && (() => {
        const selectedRow = container.querySelector(".obnotion-dropdown-popover .obnotion-dropdown-option.is-selected");
        const check = selectedRow?.querySelector(".obnotion-dropdown-option-check") ?? null;
        return !!check && selectedRow?.lastElementChild === check;
      })(),
    emptyStateCard: !!container.querySelector(".obnotion-empty-card .obnotion-empty-card-title"),
    columnHeaderTriggers: !!container.querySelector(".obnotion-column-menu-trigger")
      && !!container.querySelector(".obnotion-resize-handle"),
    boardEmptyColumn: Array.from(container.querySelectorAll(".obnotion-kanban-col"))
      .some((col) => col.querySelectorAll(".obnotion-kanban-card").length === 0),
    // The kanban card names its parent instead of drawing a tree: a child card carries the
    // parent's title in its own type line, and a card with no parent has no such line at all.
    boardSubtaskParentTitle: !!container.querySelector(".obnotion-kanban-card-type"),
    migratedListAsTable: !!container.querySelector("table.obnotion-table")
      && !container.querySelector(".obnotion-list-row"),
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
    // The kanban card the board reproduces has no collapse toggle and no progress bar; a child
    // card announces its parent by name in its own type line, so that line is what the option
    // turns on and its absence is what the off side proves.
    on: { renderer: "board", bag: "file-view", captureData: true, subtaskTree: true },
    onMarkers: ["boardSubtaskParentTitle"],
  },
  {
    id: "constructed-timeline-subtask",
    off: { renderer: "timeline", bag: "file-view", captureData: true },
    on: { renderer: "timeline", bag: "file-view", captureData: true, subtaskTree: true },
    onMarkers: ["subtaskToggle", "subtaskProgress", "subtaskDepthChild"],
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
  {
    // The "off" side is the harness's existing view-config scenario — a table view, which never
    // reaches renderBoardSettings and therefore never mounts a single .obnotion-column-manager-row. The
    // "on" side is the same panel host for a board view instead, so the only variable this pair
    // isolates is which view type the panel is configuring — not a hand-toggled boolean.
    id: "constructed-board-card-properties",
    off: { renderer: "view-config", bag: "file-view", captureData: true },
    on: { renderer: "view-config", bag: "file-view", viewConfigVariant: "board" },
    onMarkers: [
      "boardCardPropertiesPanel",
      "boardCardPropertiesListsEveryField",
      "boardCardPropertiesTagsUnchecked",
      "boardCardPropertiesVisibleFieldsChecked",
    ],
  },
  {
    // openTableRecordPeek's own touch branch, proven both ways: the harness's positioning
    // anchor is a 1px span, so `isTouchDevice` reads it as narrow regardless of the page's real
    // viewport and the touch hand-off fires by default — which is the production shape a phone
    // gets. The "off" side asks the harness not to wire that hand-off at all, exercising
    // `openTableRecordPeek`'s own documented fallback for an absent callback: the docked rail,
    // the surface a mouse still gets.
    id: "constructed-record-peek",
    off: { renderer: "record-peek", bag: "file-view", captureData: true, recordPeekTouch: false },
    on: { renderer: "record-peek", bag: "file-view", captureData: true },
    onMarkers: ["recordDetailPanel", "recordDetailHeader"],
    offOnlyMarkers: ["recordPeekPanel"],
  },
];

// Single-mount cases: brand-new `renderer` values with no boolean to pair against. Their own "off"
// state is a pre-`043` harness where the renderer value does not exist and the scenario never
// mounts — which is exactly the run that established this file's own red, before these branches
// existed.
const SINGLE_CASES = [
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
    // A config built as `viewType: "list"`, run through the real `planListMigration`/
    // `applyListMigration` before the harness ever hands it to `TableRenderer` — not a config
    // authored as a table from the start. The marker requires both a real `table.obnotion-table` and
    // the absence of any `.obnotion-list-row`, so a regression that left the config half-migrated
    // fails here instead of only showing up as a visual diff nobody was looking for.
    id: "constructed-list-migrated",
    spec: { renderer: "table", bag: "file-view", captureData: true, migratedFromList: true },
    marker: "migratedListAsTable",
  },
];

// The priority-tier count case that lived here (a card-top strip painted for every tier except
// the two lowest) is retired along with the strip itself: the board's Anytype-shaped rebuild has
// no counterpart for it, and priority now renders as an ordinary property row like any other,
// with no tier-based visibility split for this harness to distinguish. Left empty rather than
// removed so a future count case has somewhere to land without re-adding the loop it feeds below.
const COUNT_CASES = [];

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

  for (const { id, spec, marker, want, totalMarker, wantTotal } of COUNT_CASES) {
    const markers = await page.evaluate((scenario) => window.__stateMarkers(scenario), spec);
    console.log(`constructed-state-assertions: ${id} mounted once — a per-row value distributed across four tiers\n`);
    if (!markers.mounted) {
      failures.push(`${id}: did not mount`);
      console.log(`  FAIL  ${id} — did not mount`);
    } else {
      const barOk = markers[marker] === want;
      const totalOk = markers[totalMarker] === wantTotal;
      if (!barOk) failures.push(`${id}: ${marker} was ${markers[marker]}, wanted ${want} (five urgent + five high rows of eighteen)`);
      if (!totalOk) failures.push(`${id}: ${totalMarker} was ${markers[totalMarker]}, wanted ${wantTotal}`);
      console.log(`  ${barOk ? "PASS" : "FAIL"}  ${id} — ${marker}: ${markers[marker]}`);
      console.log(`  ${totalOk ? "PASS" : "FAIL"}  ${id} — ${totalMarker}: ${markers[totalMarker]}`);
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
