#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-inventory
// COMPONENT: regenerates the packet's sheet/panel/popover coverage inventory
// ───────────────────────────────────────────────────────────────────
//
// The coverage audit went stale the moment it was written by hand: a renderer
// gains a surface, nobody edits the table, and the next phase claims coverage
// that no row substantiates. This script re-derives every row from the things
// that actually change — the sheet-grammar registries, the modal producer
// classes in src/, the story-coverage census and the screenshot manifest — so
// the table can be regenerated, not remembered.
//
// What it reads:
//   - tools/live/sheet-grammar.mjs: REGISTERED_SURFACES, REGISTERED_STACKED_PAIRS
//     and OVERFLOW_ONLY_SURFACES, parsed from source. That lane runs its whole
//     Playwright pass on import, so importing it here would launch a browser;
//     the array literals are plain data, so they are read as text instead.
//   - src/**: the DbModal and FuzzySuggestModal subclasses (the modal producers
//     no registry names) plus the curated producer call sites below.
//   - tools/storybook/story-coverage.mjs --json: the renderable-module census.
//     Spawned rather than imported for the same import-runs-everything reason;
//     the numbers therefore can never disagree with the gate itself.
//   - screenshots/manifest.json: which capture ids exist and which sources
//     produced them.
//   - screenshots/notion/** and screenshots/anytype/**: the reference captures,
//     matched at filename level. Nobody has eyes on these here — the reference
//     columns are filename matches, never visual judgements, and the gap notes
//     say so.
//
// What it writes: the rows between the ANCHOR:rows markers and the counts
// between the ANCHOR:summary markers of the packet's inventory.md. Nothing
// outside those markers is touched — the how-to-read preamble and the
// operator-evidence section are hand-maintained.
//
// Usage: node tools/storybook/sheet-inventory.mjs [--check]
//   --check  regenerate and compare; exit 1 when the file would change.

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const DEFAULT_OUT = "specs/005-component-surface-system/071-sheet-notion-anytype-alignment/001-sheet-story-coverage-audit/inventory.md";
const checkMode = process.argv.includes("--check");
const outPath = (() => {
  const flag = process.argv.indexOf("--out");
  return flag >= 0 ? process.argv[flag + 1] : DEFAULT_OUT;
})();

// ───────────────────────────────────────────────────────────────────
// 1. THE SHEET-GRAMMAR REGISTRIES, READ AS DATA
// ───────────────────────────────────────────────────────────────────

function readGrammarArray(name) {
  const source = readFileSync(join(REPO, "tools/live/sheet-grammar.mjs"), "utf8");
  const match = source.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\n\\]);`));
  if (!match) throw new Error(`sheet-inventory: could not extract ${name} from sheet-grammar.mjs — has its declaration moved?`);
  // The literals are commented data with no // inside their strings, so line
  // comments peel off cleanly and what remains evaluates as plain values.
  return Function(`"use strict"; return ${match[1].replace(/\/\/[^\n]*/g, "")};`)();
}

const REGISTERED = readGrammarArray("REGISTERED_SURFACES");
const STACKED = readGrammarArray("REGISTERED_STACKED_PAIRS");
const OVERFLOW_ONLY = readGrammarArray("OVERFLOW_ONLY_SURFACES");

// ───────────────────────────────────────────────────────────────────
// 2. THE STORY-COVERAGE CENSUS, FROM THE GATE ITSELF
// ───────────────────────────────────────────────────────────────────

function readStoryCoverage() {
  const stdout = execFileSync(
    process.execPath,
    [join(REPO, "tools/storybook/story-coverage.mjs"), "--json"],
    { cwd: REPO, encoding: "utf8" },
  );
  const parsed = JSON.parse(stdout);
  const basenames = (paths) => new Set(paths.map((p) => basename(p)));
  return { covered: basenames(parsed.covered), exempt: basenames(parsed.exempt), exemptList: parsed.exempt.map((p) => basename(p)) };
}

// ───────────────────────────────────────────────────────────────────
// 3. PRODUCERS
// ───────────────────────────────────────────────────────────────────

/** Resolve a curated producer hint to a concrete file:line, at generation time. */
function resolveProducer(relFile, hints) {
  const abs = join(REPO, relFile);
  if (!existsSync(abs)) return { ref: `${relFile}:?`, note: "file not found" };
  const lines = readFileSync(abs, "utf8").split("\n");
  for (const hint of hints) {
    const re = new RegExp(hint);
    const idx = lines.findIndex((l) => re.test(l));
    if (idx >= 0) return { ref: `${relFile}:${idx + 1}` };
  }
  return { ref: `${relFile}:?`, note: "hint unmatched" };
}

/** Every DbModal / FuzzySuggestModal subclass in src/, with its own line. */
function scanModalProducers() {
  const results = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) { walk(p); continue; }
      if (!/\.ts$/.test(entry.name) || /\.test\.ts$|\.stories\.ts$/.test(entry.name)) continue;
      const lines = readFileSync(p, "utf8").split("\n");
      lines.forEach((line, i) => {
        const modal = /class (\w+) extends DbModal/.exec(line);
        const fuzzy = /class (\w+) extends FuzzySuggestModal/.exec(line);
        if (modal) results.push({ kind: "DbModal", name: modal[1], ref: `${rel(p)}:${i + 1}` });
        if (fuzzy) results.push({ kind: "FuzzySuggestModal", name: fuzzy[1], ref: `${rel(p)}:${i + 1}` });
      });
    }
  };
  const rel = (p) => p.startsWith(REPO) ? p.slice(REPO.length).replace(/^\//, "") : p;
  walk(join(REPO, "src"));
  return results;
}

// Which scanned classes a registry row already covers — these are the same
// surfaces wearing their production class, so they get no second row.
const CLASS_FOLDS_INTO_REGISTRY = {
  ConfirmModal: "confirm",
  BaseFileSuggestModal: "base-file-suggest",
  ImageFileSuggestModal: "image-file-suggest",
  MarkdownFileSuggestModal: "markdown-file-suggest",
  CreatePropertyModal: "add-property",
};

// ───────────────────────────────────────────────────────────────────
// 4. CURATED FACTS THE REGISTRIES DO NOT CARRY
// ───────────────────────────────────────────────────────────────────

// The opener, not the DOM builder: which call site puts the surface on screen.
const PRODUCERS = {
  settings: () => resolveProducer("src/views/database-view.ts", [/private renderViewConfigPanel/]),
  "add-property": () => resolveProducer("src/views/database-view.ts", [/openCreatePropertyModal/]),
  "sort-panel": () => resolveProducer("src/views/database-view.ts", [/private renderSortPanel/]),
  "filter-panel": () => resolveProducer("src/views/database-view.ts", [/private renderFilterPanel/]),
  group: () => resolveProducer("src/views/toolbar-renderer.ts", [/private renderGroupPopover/]),
  "add-view": () => resolveProducer("src/views/toolbar-renderer.ts", [/class ToolbarRenderer/]),
  "record-detail": () => resolveProducer("src/views/record-detail-panel.ts", [/export function openRecordDetailPanel/]),
  "record-peek": () => resolveProducer("src/views/table-record-peek.ts", [/export function openTableRecordPeek/]),
  "column-width": () => resolveProducer("src/views/column-width.ts", [/export function openColumnWidthAdjuster/]),
  "column-manager": () => resolveProducer("src/views/database-view.ts", [/private renderColumnManager/]),
  "board-card-properties": () => resolveProducer("src/views/board-card-properties-panel.ts", [/export function renderBoardCardProperties/]),
  "owned-menu": () => resolveProducer("src/views/owned-menu.ts", [/OwnedMenu/]),
  "date-picker": () => resolveProducer("src/views/date-value-picker.ts", [/export function renderDateValuePicker/]),
  "icon-picker": () => resolveProducer("src/views/icon-picker-popover.ts", [/export function openIconPickerPopover/]),
  "option-color-picker": () => resolveProducer("src/views/option-color-picker.ts", [/export function openOptionColorPicker/]),
  confirm: () => resolveProducer("src/views/confirm-sheet.ts", [/export function buildConfirmSheetBody/]),
  "base-file-suggest": () => resolveProducer("src/main.ts", [/class BaseFileSuggestModal/]),
  "image-file-suggest": () => resolveProducer("src/views/image-file-suggest-modal.ts", [/class ImageFileSuggestModal/]),
  "markdown-file-suggest": () => resolveProducer("src/views/markdown-file-suggest-modal.ts", [/class MarkdownFileSuggestModal/]),
  "toolbar-utilities": () => resolveProducer("src/views/toolbar-renderer.ts", [/class ToolbarRenderer/]),
  "toolbar-tab-menu": () => resolveProducer("src/views/toolbar-renderer.ts", [/class ToolbarRenderer/]),
  "filter-panel-nested": () => resolveProducer("src/views/filter-panel-renderer.ts", [/class FilterPanelRenderer/]),
  "sort-panel-calendar-hint": () => resolveProducer("src/views/sort-panel-renderer.ts", [/class SortPanelRenderer/]),
  "record-detail-docked": () => resolveProducer("src/views/record-detail-panel.ts", [/export function openRecordDetailPanel/]),
  "active-rule-filter": () => resolveProducer("src/views/active-rule-popover-renderer.ts", [/class ActiveRulePopoverRenderer/]),
  "active-rule-sort": () => resolveProducer("src/views/active-rule-popover-renderer.ts", [/class ActiveRulePopoverRenderer/]),
  "cell-editor-text": () => resolveProducer("src/views/cell-renderer.ts", [/startEdit/]),
  "cell-editor-select": () => resolveProducer("src/views/cell-renderer.ts", [/startEdit/]),
  "date-picker-datetime": () => resolveProducer("src/views/date-value-picker.ts", [/export function renderDateValuePicker/]),
  dropdown: () => resolveProducer("src/views/dropdown-field.ts", [/export function openDropdownMenu/]),
  "calendar-toolbar-options": () => resolveProducer("src/views/calendar-toolbar-renderer.ts", [/class CalendarToolbarRenderer/]),
  "timeline-toolbar-options": () => resolveProducer("src/views/calendar-timeline-toolbar-renderer.ts", [/class CalendarTimelineToolbarRenderer/]),
  "chart-toolbar-options": () => resolveProducer("src/views/chart-toolbar-renderer.ts", [/class ChartToolbarRenderer/]),
  "mini-calendar-popover": () => resolveProducer("src/views/calendar-mini-calendar-renderer.ts", [/export function renderMiniCalendar/]),
  toast: () => resolveProducer("src/views/toast.ts", [/export function showToast/]),
  "column-menu": () => resolveProducer("src/views/column-menu.ts", [/class ColumnMenu/]),
  "bulk-edit-field-menu": () => resolveProducer("src/views/bulk-edit-field-menu.ts", [/export function openBulkEditFieldMenu/]),
  "trash-restore": () => resolveProducer("src/settings.ts", [/restoreModal = new class/]),
  "chart-drilldown": () => resolveProducer("archive/deprecated-views/chart/chart-renderer.ts", [/class ChartDrilldownModal/]),
  "csv-markdown-import": () => resolveProducer("src/main.ts", [/class CsvMarkdownImportModal/]),
};

// Which scenario ids in the screenshot manifest count as this surface's
// captures. A token that matches nothing falls back to the manifest's own
// source lists before the row records "none".
const CAPTURE_TOKENS = {
  settings: [/^panel-view-config/],
  "add-property": [/property-type/],
  "sort-panel": [/^panel-sort/],
  "filter-panel": [/^panel-filter/],
  "add-view": [/^add-view-popover/, /add-view$/],
  "record-detail": [/^panel-record-detail/],
  "record-peek": [/^panel-record-peek/],
  "column-width": [/column-width/],
  "column-manager": [/^panel-column-manager/],
  "board-card-properties": [/board-card-properties/],
  "owned-menu": [/owned-menu/],
  "date-picker": [/^field-date-picker(?!-datetime)/],
  "icon-picker": [/^field-icon-picker/],
  "option-color-picker": [/option-color-picker/],
  confirm: [/confirm/],
  "toolbar-utilities": [/utilities/],
  "toolbar-tab-menu": [/tab-menu/],
  "active-rule-filter": [/active-rule-(popover-)?filter/],
  "active-rule-sort": [/active-rule-(popover-)?sort/],
  "cell-editor-text": [/cell-editors-text/],
  "cell-editor-select": [/cell-editors-select/],
  "date-picker-datetime": [/date-picker-datetime/],
  dropdown: [/^core-dropdown|^constructed-dropdown/],
  "calendar-toolbar-options": [/calendar-toolbar-options/],
  "timeline-toolbar-options": [/timeline-toolbar-options/],
  "chart-toolbar-options": [/chart-(toolbar-)?options-popover|chart-toolbar-options/],
  "mini-calendar-popover": [/mini-calendar/],
  toast: [/^chrome-toast/],
};

// Filename-level reference matches. Each entry lists reference directories and
// the filename families inside them that plausibly show this surface. These are
// name matches, not image reads — the gap column says what that can and cannot
// support.
const REFERENCES = {
  settings: {
    notion: [
      { root: "notion/ios", dir: "settings", re: /settings/ },
      { root: "notion/web", dir: "settings", re: /settings/ },
    ],
    anytype: [
      { root: "anytype/mobile", dir: "sheets", re: /app-settings|appearance/ },
      { root: "anytype/desktop", dir: "app", re: /settings-account|view-settings/ },
    ],
  },
  "add-property": {
    notion: [{ root: "notion/ios", dir: "database", re: /propert/ }],
    anytype: [
      { root: "anytype/desktop", dir: "app", re: /newobject-type-picker|filter-property|type-collections/ },
      { root: "anytype/mobile", dir: "app", re: /typeslist|type-collections/ },
    ],
  },
  "sort-panel": {
    notion: [{ root: "notion/ios", dir: "database", re: /sort|condition/ }, { root: "notion/ios", dir: "states", re: /group-by/ }],
    anytype: [{ root: "anytype/desktop", dir: "app", re: /view-settings/ }],
  },
  "filter-panel": {
    notion: [{ root: "notion/ios", dir: "menus", re: /filters/ }, { root: "notion/ios", dir: "database", re: /filter|condition/ }],
    anytype: [{ root: "anytype/desktop", dir: "app", re: /filter-(property|tag)-picker/ }],
  },
  "record-detail": {
    notion: [{ root: "notion/ios", dir: "database", re: /propert|row-page/ }],
    anytype: [{ root: "anytype/mobile", dir: "sheets", re: /cell-(date|number|multiselect|object-|email)/ }],
  },
  "record-peek": {
    notion: [{ root: "notion/ios", dir: "database", re: /row-page/ }],
    anytype: [],
  },
  "filter-panel-nested": {
    notion: [{ root: "notion/ios", dir: "menus", re: /filters/ }],
    anytype: [{ root: "anytype/desktop", dir: "app", re: /filter-(property|tag)-picker/ }],
  },
  "sort-panel-calendar-hint": {
    notion: [{ root: "notion/ios", dir: "sheets", re: /calendar/ }],
    anytype: [{ root: "anytype/desktop", dir: "menus", re: /calendar-(day|month|year)-select/ }],
  },
  "record-detail-docked": {
    notion: [{ root: "notion/ios", dir: "database", re: /row-page/ }],
    anytype: [],
  },
  "column-manager": {
    notion: [{ root: "notion/ios", dir: "database", re: /propert/ }],
    anytype: [{ root: "anytype/mobile", dir: "app", re: /typeslist|type-collections/ }],
  },
  "board-card-properties": {
    notion: [{ root: "notion/ios", dir: "database", re: /board|propert/ }],
    anytype: [],
  },
  "owned-menu": {
    notion: [{ root: "notion/ios", dir: "menus", re: /context-menu|menu/ }],
    anytype: [{ root: "anytype/desktop", dir: "app", re: /object-more-menu/ }],
  },
  "date-picker": {
    notion: [{ root: "notion/ios", dir: "sheets", re: /calendar/ }],
    anytype: [
      { root: "anytype/mobile", dir: "sheets", re: /cell-date/ },
      { root: "anytype/desktop", dir: "menus", re: /calendar-(day|month|year)-select/ },
    ],
  },
  "icon-picker": {
    notion: [{ root: "notion/ios", dir: "sheets", re: /cover-icon/ }],
    anytype: [],
  },
  "option-color-picker": {
    notion: [],
    anytype: [{ root: "anytype/mobile", dir: "sheets", re: /multiselect/ }],
  },
  confirm: { notion: [], anytype: [] },
  "base-file-suggest": { notion: [], anytype: [{ root: "anytype/desktop", dir: "app", re: /search-palette/ }] },
  "image-file-suggest": { notion: [], anytype: [{ root: "anytype/desktop", dir: "app", re: /search-palette/ }] },
  "markdown-file-suggest": { notion: [], anytype: [{ root: "anytype/desktop", dir: "app", re: /search-palette/ }] },
  "toolbar-utilities": {
    notion: [{ root: "notion/ios", dir: "menus", re: /menu/ }],
    anytype: [{ root: "anytype/desktop", dir: "app", re: /object-more-menu/ }],
  },
  "toolbar-tab-menu": { notion: [], anytype: [] },
  "active-rule-filter": {
    notion: [{ root: "notion/ios", dir: "menus", re: /filters/ }],
    anytype: [{ root: "anytype/desktop", dir: "app", re: /filter-(property|tag)-picker/ }],
  },
  "active-rule-sort": {
    notion: [{ root: "notion/ios", dir: "states", re: /group-by/ }],
    anytype: [{ root: "anytype/desktop", dir: "app", re: /view-settings/ }],
  },
  "cell-editor-text": {
    notion: [],
    anytype: [{ root: "anytype/mobile", dir: "sheets", re: /cell-(number|email)/ }],
  },
  "cell-editor-select": {
    notion: [],
    anytype: [{ root: "anytype/mobile", dir: "sheets", re: /cell-(multiselect|object-)/ }],
  },
  dropdown: {
    notion: [],
    anytype: [{ root: "anytype/desktop", dir: "menus", re: /cell-(multiselect|checkbox)/ }],
  },
  "calendar-toolbar-options": {
    notion: [{ root: "notion/ios", dir: "database", re: /calendar/ }],
    anytype: [{ root: "anytype/desktop", dir: "menus", re: /calendar-(item|day)-menu/ }],
  },
  "timeline-toolbar-options": {
    notion: [],
    anytype: [],
  },
  "chart-toolbar-options": { notion: [], anytype: [] },
  "mini-calendar-popover": {
    notion: [{ root: "notion/ios", dir: "sheets", re: /calendar/ }],
    anytype: [{ root: "anytype/desktop", dir: "menus", re: /calendar-(month|year)-select/ }],
  },
  toast: { notion: [], anytype: [] },
  "column-menu": {
    notion: [{ root: "notion/ios", dir: "database", re: /block-menu/ }],
    anytype: [],
  },
  "bulk-edit-field-menu": { notion: [], anytype: [] },
};

// Reference matches for stacked-pair children, keyed by pair name. Pairs not
// listed here record "none" on both sides — recorded, not skipped.
const STACKED_REFERENCES = {
  "settings icon picker": [{ root: "notion/ios", dir: "sheets", re: /cover-icon/ }],
  "settings cover image picker": [{ root: "notion/ios", dir: "sheets", re: /cover-icon/ }],
  "record select value menu": [
    { root: "anytype/mobile", dir: "sheets", re: /cell-(multiselect|object-)/ },
  ],
  "record date editor": [{ root: "anytype/mobile", dir: "sheets", re: /cell-date/ }],
  "record relation editor": [
    { root: "anytype/desktop", dir: "app", re: /relation-editor/ },
    { root: "anytype/mobile", dir: "sheets", re: /object-assignee/ },
  ],
  "record option colour picker": [{ root: "anytype/mobile", dir: "sheets", re: /multiselect/ }],
  "filter property picker": [{ root: "anytype/desktop", dir: "app", re: /filter-(property|tag)-picker/ }],
  "filter select value picker": [{ root: "anytype/desktop", dir: "app", re: /filter-tag-value-picker/ }],
  "filter checkbox value picker": [{ root: "anytype/desktop", dir: "app", re: /filter-tag-value-picker/ }],
  "sort field picker": [{ root: "anytype/desktop", dir: "app", re: /view-settings/ }],
  "sort direction picker": [{ root: "anytype/desktop", dir: "app", re: /view-settings/ }],
  "add view property picker": [{ root: "anytype/desktop", dir: "app", re: /layout-picker/ }],
  "all views overflow menu": [{ root: "anytype/desktop", dir: "app", re: /object-more-menu/ }],
};

// First-read notes. Written at filename level against the reference trees, not
// from像素 comparison — no human eyes were on the captures when this was generated.
const GAP_NOTES = {
  settings:
    "Notion's settings references are full-height iOS pushes; our settings sheet is a 90svH-capped flush bottom sheet. Direction holds, but the two shapes have never been put side by side — filename read only.",
  "add-property":
    "Notion iOS opens the type picker as a second surface after the name step; our landed shape is replace-in-place — the type-picker dropdown is absorbed into the create panel, never a third sheet. Anytype keeps a modal type grid. Ours is deliberately shallower than both; no pixel reference covers the absorbed shape.",
  "sort-panel":
    "Anytype exposes sort inside its view-settings panel; ours is a dedicated floating sheet. The calendar-hint variant (empty-date column guidance) has no reference either side.",
  "filter-panel":
    "Anytype's filter property and tag-value pickers are their own reference captures; our equivalents are stacked listbox children of the panel, not separately captured references.",
  "record-detail":
    "Anytype's mobile cell sheets (date, number, multiselect, assignee) are the closest reference family for per-property editing inside a record surface; ours edits in place within one sheet. The docked placement variant has no reference either side.",
  "record-peek":
    "No reference shows a peek-to-sheet handoff; on touch we mount the record sheet, so the row's grammar asserts the sheet a phone actually gets.",
  "owned-menu":
    "Notion's iOS context menus and Anytype's object more-menu both keep menus as cards; ours presents as a titled sheet on the phone. Header-bearing since the header-everywhere decision.",
  "date-picker":
    "Anytype carries day, month and year select references plus a mobile cell-date sheet; ours is one calendar sheet with a time toggle. Month/year steppers, not separate month-picker surfaces.",
  "icon-picker":
    "Notion's cover-icon references are the only family; Anytype carries none, and our picker's vault-file backed icons (vault-internal) have no reference at all.",
  "option-color-picker":
    "Anytype's multiselect cell sheets are the colour+label reference; our picker is a popover with the live document auto-close, which no reference shows.",
  confirm: "Neither reference tree names a confirm/thantrast capture — none, recorded; the confirm card's 16px inset floor is our own adopted shape, not a sampled value.",
  "toolbar-utilities":
    "Anytype's object more-menu is the closest reference; our utilities popover additionally carries view actions (duplicate, export, chart) that reference set does not.",
  "active-rule-filter":
    "Anytype's filter pickers show the value-selection states our stacked listbox children own; the chip-anchored rule popover itself has no reference.",
  "cell-editor-text": "Anytype's number/email cell sheets are the closest named family; our editors are inline popovers, not sheets, on the touch boundary.",
  dropdown: "Anytype's desktop menu cards correspond to our listbox; the desktop-variant-presented-as-sheet has no reference.",
  toast: "Neither reference tree carries a toast capture — none, recorded; alignment therefore rests entirely on our own chrome-toast captures.",
  "column-menu": "Notion's database block-menu captures are the nearest family for per-column actions; ours reuses the owned-menu grammar.",
};

const DEFAULT_GAP = "none at filename level — no reference family maps to this surface; our own captures are the only alignment evidence.";

// ───────────────────────────────────────────────────────────────────
// 5. ROW ASSEMBLY
// ───────────────────────────────────────────────────────────────────

function referenceCell(refs, side, listFn) {
  const spec = (refs && refs[side]) || [];
  if (!spec || spec.length === 0) return "none";
  const parts = [];
  for (const entry of spec) {
    const found = listFn(join(REPO, "screenshots", entry.root, entry.dir), entry.re);
    if (found.count === 0) continue;
    parts.push(`${entry.root}/${entry.dir} (${found.count}: ${found.sample})`);
  }
  return parts.length ? parts.join("; ") : "none";
}

function listMatches(dir, re) {
  if (!existsSync(dir)) return { count: 0, sample: "" };
  const files = readdirSync(dir).filter((f) => /\.(png|webp|jpg|jpeg)$/.test(f) && re.test(f)).sort();
  if (files.length === 0) return { count: 0, sample: "" };
  const sample = files.slice(0, 2).join(", ") + (files.length > 2 ? ` +${files.length - 2}` : "");
  return { count: files.length, sample };
}

function escapeCell(s) {
  return s.replace(/\|/g, "\\|");
}

function buildInventory() {
  const coverage = readStoryCoverage();
  const modalProducers = scanModalProducers();
  const manifest = JSON.parse(readFileSync(join(REPO, "screenshots/manifest.json"), "utf8"));
  const scenarioIds = [...new Set(manifest.scenarios.map((s) => s.id))];
  const sourcesById = new Map();
  for (const s of manifest.scenarios) {
    if (!sourcesById.has(s.id)) sourcesById.set(s.id, []);
    sourcesById.get(s.id).push(...(s.sources || []));
  }

  const capturesFor = (key, producerFiles) => {
    const tokens = CAPTURE_TOKENS[key] || [];
    let ids = scenarioIds.filter((id) => tokens.some((re) => re.test(id)));
    if (ids.length === 0 && producerFiles) {
      ids = scenarioIds.filter((id) => (sourcesById.get(id) || []).some((src) => producerFiles.some((p) => src.endsWith(p))));
    }
    return ids;
  };

  const storyCellFor = (module, extraNote) => {
    if (module && coverage.covered.has(module)) return "yes";
    if (module && coverage.exempt.has(module)) return "allowlisted";
    return extraNote || "no (untracked — not one of the 40 renderable modules; covered by captures, not stories)";
  };

  const producerCellFor = (key) => {
    const fn = PRODUCERS[key];
    if (!fn) return { ref: "unresolved (no curated producer)", note: true };
    return fn();
  };

  const primaryRows = [];
  // Rows without a curated reference map still carry the two-sided shape, so
  // no consumer of a row ever distinguishes "none" from "absent".
  const asRefMap = (refs) => (refs && refs.notion ? refs : { notion: [], anytype: [] });
  const addRow = (key, title, presentation, producer, captures, refs, gap, story) => {
    primaryRows.push({ key, title, presentation, producer, captures, refs: asRefMap(refs), gap, story });
  };

  // 5a. The two rows the packet gates everything else on, in this order.
  const settingsProducer = producerCellFor("settings");
  addRow(
    "settings",
    "Settings sheet (view-config; the settings leg's surface)",
    "sheet (flush frame)",
    settingsProducer.ref,
    capturesFor("settings"),
    REFERENCES.settings,
    GAP_NOTES.settings,
    "no (untracked — the view-config sheet is covered by the panel-view-config captures, not a story)",
  );
  const addPropertyProducer = producerCellFor("add-property");
  addRow(
    "add-property",
    "Add-property / property-type picker sheet (CreatePropertyModal, with the absorbed type-picker dropdown)",
    "modal → sheet (replace-in-place panel; the type-picker dropdown never becomes a third sheet)",
    addPropertyProducer.ref,
    capturesFor("add-property"),
    REFERENCES["add-property"],
    GAP_NOTES["add-property"],
    "no (untracked — the grammar's replace-in-place shape is exercised by the properties pair rows, not a story)",
  );

  // 5b. Every remaining registered surface, in registry order.
  for (const s of REGISTERED) {
    if (s.name === "settings") continue;
    const key = s.name;
    const producer = producerCellFor(key);
    const module = producer.ref.split(":")[0].split("/").pop();
    const presentation =
      s.name === "add-view" || s.name === "date-picker" || s.name === "icon-picker" || s.name === "option-color-picker"
        ? "sheet on phone (one of the four dropdown families the grammar presents as sheets)"
        : s.name === "owned-menu"
          ? "sheet (owned menu card, titled for its row/column/field)"
          : s.spec.renderer === "fuzzy-suggest"
            ? "modal (FuzzySuggestModal; sheet chrome on the phone)"
            : s.name === "confirm"
              ? "modal (ConfirmModal; the body is the shared confirm-sheet primitive, presented as a card)"
              : "sheet";
    const story =
      s.name === "confirm"
        ? "yes (confirm-sheet.ts — the primitive; the ConfirmModal wrapper extends DbModal)"
        : s.spec.renderer === "fuzzy-suggest"
          ? "no (untracked — the suggest modals route through createSurfaceShell; coverage comes from the grammar's fuzzy rows)"
          : storyCellFor(module);
    const note =
      s.name === "confirm" ? " — wrapped by src/views/modals/confirm-modal.ts (ConfirmModal extends DbModal)" : "";
    addRow(
      key,
      `${s.name} (registered)${note}`,
      presentation,
      producer.ref,
      capturesFor(key, [producer.ref.split(":")[0]]),
      REFERENCES[key],
      GAP_NOTES[key] || DEFAULT_GAP,
      story,
    );
  }

  // 5c. The overflow-only variants — the same producers, other presentations.
  for (const s of OVERFLOW_ONLY) {
    const key = s.name;
    const producer = producerCellFor(key);
    const presentation = key.startsWith("toolbar-")
      ? "popover (toolbar)"
      : key.startsWith("active-rule")
        ? "popover (anchored rule editor)"
        : key.startsWith("cell-editor")
          ? "inline editor popover"
          : key === "dropdown"
            ? "listbox popover (earns the bottom-sheet class on the phone)"
            : key === "record-detail-docked"
              ? "docked panel (not a sheet)"
              : "sheet (variant of its registered parent surface)";
    addRow(
      key,
      `${key} (overflow-only variant)`,
      presentation,
      producer.ref,
      capturesFor(key, [producer.ref.split(":")[0]]),
      REFERENCES[key],
      GAP_NOTES[key] || DEFAULT_GAP,
      key.startsWith("cell-editor")
        ? "allowlisted (cell-renderer.ts — its only parent-taking export needs the vault; the field-cell-editors captures cover the states)"
        : key === "dropdown"
          ? "yes (dropdown-field.ts)"
          : key.startsWith("date-picker")
            ? "yes (date-value-picker.ts)"
            : key.startsWith("toolbar") || key.startsWith("active-rule")
              ? "no (untracked — the toolbar renders through the shell; its primitives carry their own story, the popover states carry captures)"
              : key.startsWith("record-detail") || key.startsWith("filter") || key.startsWith("sort")
                ? "no (untracked — opened through the shell; covered by captures)"
                : "no (untracked)",
    );
  }

  // 5d. The view-anchored option popovers the registries mount through the
  // toolbar scenarios but name as their own producers.
  for (const key of ["calendar-toolbar-options", "timeline-toolbar-options", "chart-toolbar-options", "mini-calendar-popover"]) {
    const producer = producerCellFor(key);
    addRow(
      key,
      `${key} (view toolbar)`,
      key === "mini-calendar-popover" ? "popover (mini calendar)" : "popover (view toolbar options)",
      producer.ref,
      capturesFor(key, [producer.ref.split(":")[0]]),
      REFERENCES[key],
      GAP_NOTES[key] || DEFAULT_GAP,
      "no (untracked — the view toolbars render through the shell; the constructed options captures are their coverage)",
    );
  }

  // 5e. The modal producers no registry names.
  const foldedNames = new Set(Object.keys(CLASS_FOLDS_INTO_REGISTRY));
  for (const p of modalProducers) {
    if (p.kind === "FuzzySuggestModal") continue; // registered as the three fuzzy rows above
    if (foldedNames.has(p.name)) continue;
    const key =
      p.name === "CsvMarkdownImportModal" ? "csv-markdown-import"
        : p.name === "ChartDrilldownModal" ? "chart-drilldown"
          : p.name;
    const producer = key === "csv-markdown-import" ? producerCellFor(key)
      : key === "chart-drilldown" ? { ref: p.ref }
        : key === "TrashManagerModal" ? { ref: p.ref }
          : key === "TrashRestoreModal" || key === "restoreModal" ? producerCellFor("trash-restore")
            : { ref: p.ref };
    const displayName =
      p.name === "CsvMarkdownImportModal" ? "CsvMarkdownImportModal (import choice)"
        : p.name === "TrashManagerModal" ? "TrashManagerModal (plugin settings)"
          : key === "chart-drilldown" ? "ChartDrilldownModal (chart drill-down)"
            : key === "trash-restore" ? "Trash restore-confirm (anonymous DbModal in settings.ts)"
              : `${p.name} (DbModal)`;
    addRow(
      key,
      displayName,
      "modal → sheet (DbModal's declared presentation; the shell re-applies it when the touch boundary moves)",
      producer.ref,
      capturesFor(key, [p.ref.split(":")[0]]),
      [],
      DEFAULT_GAP,
      "no (untracked — Obsidian Modal subclasses are outside the bundle's stub, so the coverage catalogue deliberately excludes them)",
    );
  }
  // The settings tree's anonymous restore modal and the chart drill-down never
  // appear in a named-class scan; they are producers all the same.
  for (const key of ["trash-restore", "chart-drilldown"]) {
    if (primaryRows.some((r) => r.key === key)) continue;
    const producer = producerCellFor(key);
    addRow(
      key,
      key === "trash-restore" ? "Trash restore-confirm (anonymous DbModal in settings.ts)" : "ChartDrilldownModal (chart drill-down)",
      "modal → sheet (DbModal's declared presentation)",
      producer.ref,
      capturesFor(key),
      [],
      DEFAULT_GAP,
      "no (untracked — Obsidian Modal subclasses are outside the coverage catalogue's renderable shape)",
    );
  }

  // 5f. The floating helpers.
  for (const key of ["toast", "column-menu", "bulk-edit-field-menu"]) {
    const producer = producerCellFor(key);
    const module = producer.ref.split(":")[0].split("/").pop();
    addRow(
      key,
      key === "toast" ? "Toast" : key === "column-menu" ? "ColumnMenu (per-column actions)" : "Bulk-edit field menu",
      key === "toast" ? "toast" : "popover (menu)",
      producer.ref,
      capturesFor(key, [producer.ref.split(":")[0]]),
      REFERENCES[key],
      GAP_NOTES[key] || DEFAULT_GAP,
      key === "column-menu"
        ? "no (untracked — the menu builds listbox submenus through the shared positioner; the grammar's record submenu pair exercises it)"
        : storyCellFor(module),
    );
  }

  // 5g. The stacked-pair children — surfaces that only exist over a parent.
  const stackedRows = STACKED.map((pair) => {
    const kindPresentation = {
      dropdown: "popover (listbox; earns the bottom-sheet class on the phone)",
      menu: "popover (menu card)",
      date: "popover (date picker)",
      icon: "popover (icon picker)",
      color: "popover (colour picker)",
      fuzzy: "modal (FuzzySuggestModal)",
      modal: "modal (DbModal)",
    };
    const refs = STACKED_REFERENCES[pair.name] || [];
    return {
      pair,
      title: `${pair.name} — stacked over ${pair.parent.renderer}`,
      presentation: kindPresentation[pair.child.kind] || pair.child.kind,
      producer: `${pair.parent.renderer} + ${pair.child.kind} child (see the sheet-grammar pair registry)`,
      captures: scenarioIds.filter((id) => /depth3|stacked|pair/i.test(id)),
      // Same two-sided shape as a primary row, split by the reference root, so
      // the reference counts read stacked children exactly as they read rows.
      refs: {
        notion: refs.filter((e) => e.root.startsWith("notion")),
        anytype: refs.filter((e) => e.root.startsWith("anytype")),
      },
      gap: STACKED_REFERENCES[pair.name] ? "see the parent surface's note — the reference family it cites carries this child's state" : DEFAULT_GAP,
    };
  });

  // ───────────────────────────────────────────────────────────────────
  // 6. COUNTS
  // ───────────────────────────────────────────────────────────────────

  const allRows = [...primaryRows, ...stackedRows];
  const count = (pred) => allRows.filter(pred).length;
  const counts = {
    total: allRows.length,
    primary: primaryRows.length,
    stacked: stackedRows.length,
    registered: REGISTERED.length,
    overflowOnly: OVERFLOW_ONLY.length,
    stackedPairs: STACKED.length,
    coverageStories: coverage.covered.size,
    coverageExempt: coverage.exempt.size,
    coverageRenderable: coverage.covered.size + coverage.exempt.size,
    yes: count((r) => r.story && /^yes/.test(r.story)),
    allowlisted: count((r) => /^allowlisted/.test(r.story)),
    withCaptures: count((r) => Array.isArray(r.captures) && r.captures.length > 0),
    withNotion: count((r) => (r.refs ? !/^none$/.test(notionCellOf(r)) : false)),
    withAnytype: count((r) => (r.refs ? !/^none$/.test(anytypeCellOf(r)) : false)),
    withoutReference: 0,
  };
  counts.withoutReference = allRows.filter((r) => {
    const n = notionCellOf(r);
    const a = anytypeCellOf(r);
    return /^none$/.test(n) && /^none$/.test(a);
  }).length;

  function notionCellOf(r) { return r.refs ? referenceCell(r.refs, "notion", listMatches) : "none"; }
  function anytypeCellOf(r) { return r.refs ? referenceCell(r.refs, "anytype", listMatches) : "none"; }

  return { primaryRows, stackedRows, counts, coverage };
}

// ───────────────────────────────────────────────────────────────────
// 7. RENDER
// ───────────────────────────────────────────────────────────────────

function renderRows({ primaryRows, stackedRows }) {
  const lines = [];
  lines.push("### Primary surfaces (openable directly)");
  lines.push("");
  lines.push("| Surface | Producer file:line | Phone presentation | Story? | Captures | Notion ref | Anytype ref | First-read gap |");
  lines.push("|---------|--------------------|--------------------|--------|----------|------------|-------------|----------------|");
  for (const r of primaryRows) {
    const captures = Array.isArray(r.captures) && r.captures.length
      ? `${r.captures.slice(0, 4).join("; ")}${r.captures.length > 4 ? `; +${r.captures.length - 4} more` : ""}`
      : "none";
    const refs = r.refs
      ? `${referenceCell(r.refs, "notion", listMatches)} / ${referenceCell(r.refs, "anytype", listMatches)}`
      : "none / none";
    const gap = r.gap.replace(/\n/g, " ");
    lines.push(`| ${escapeCell(r.title)} | ${escapeCell(r.producer)} | ${escapeCell(r.presentation)} | ${escapeCell(r.story)} | ${escapeCell(captures)} | ${escapeCell(refs)} | ${escapeCell(gap)} |`);
  }
  lines.push("");
  lines.push("### Stacked / paired children (only over their parent)");
  lines.push("");
  lines.push("The stacked mounts share their capture evidence — the depth-3 and stacked constructed ids: " +
    (stackedRows[0].captures.length ? stackedRows[0].captures.join("; ") : "none") +
    ". Each mount is exercised by the sheet-grammar lane, not by an individually named capture.");
  lines.push("");
  lines.push("| Surface | Produced by | Phone presentation | Story? | Captures | Notion / Anytype refs | First-read gap |");
  lines.push("|---------|-------------|--------------------|--------|----------|------------------------|----------------|");
  for (const r of stackedRows) {
    const refs = (r.refs.notion.length || r.refs.anytype.length)
      ? [...r.refs.notion, ...r.refs.anytype].map((e) => {
          const found = listMatches(join(REPO, "screenshots", e.root, e.dir), e.re);
          return found.count ? `${e.root}/${e.dir} (${found.count}: ${found.sample})` : null;
        }).filter(Boolean).join("; ") || "none"
      : "none";
    lines.push(`| ${escapeCell(r.title)} | ${escapeCell(r.producer)} | ${escapeCell(r.presentation)} | — (see parent) | shared depth-3 / stacked ids (note above) | ${escapeCell(refs)} | ${escapeCell(r.gap)} |`);
  }
  return lines.join("\n");
}

function renderSummary(counts) {
  return [
    "| Count | Value |",
    "|-------|-------|",
    `| Total surfaces (primary + stacked) | ${counts.total} |`,
    `| Primary | ${counts.primary} |`,
    `| Stacked children | ${counts.stacked} |`,
    `| Grammar registries (registered / overflow-only / stacked pairs) | ${counts.registered} / ${counts.overflowOnly} / ${counts.stackedPairs} |`,
    `| Coverage gate: renderable = stories + exempt | ${counts.coverageRenderable} = ${counts.coverageStories} + ${counts.coverageExempt} |`,
    `| Rows with stories | ${counts.yes} |`,
    `| Rows allowlisted (exempt with a written reason) | ${counts.allowlisted} |`,
    `| Rows with a manifest capture | ${counts.withCaptures} |`,
    `| Rows with a Notion reference | ${counts.withNotion} |`,
    `| Rows with an Anytype reference | ${counts.withAnytype} |`,
    `| Rows with no reference at all | ${counts.withoutReference} |`,
  ].join("\n");
}

function regenerate() {
  const inventory = buildInventory();
  return { inventory, rowsMarkdown: renderRows(inventory), summaryMarkdown: renderSummary(inventory.counts) };
}

function spliceAnchors(doc, name, replacement) {
  const open = `<!-- ANCHOR:${name} -->`;
  const close = `<!-- /ANCHOR:${name} -->`;
  const start = doc.indexOf(open);
  const end = doc.indexOf(close);
  if (start < 0 || end < 0 || end < start) {
    throw new Error(`sheet-inventory: the ${open} … ${close} markers are missing from the target document`);
  }
  return doc.slice(0, start + open.length) + "\n" + replacement + "\n" + doc.slice(end);
}

function main() {
  const { inventory, rowsMarkdown, summaryMarkdown } = regenerate();
  if (checkMode) {
    const doc = readFileSync(join(REPO, outPath), "utf8");
    const expected = spliceAnchors(spliceAnchors(doc, "rows", rowsMarkdown), "summary", summaryMarkdown);
    if (expected === doc) {
      console.log(`sheet-inventory: --check clean (${inventory.counts.total} rows)`);
      return;
    }
    console.error("sheet-inventory: --check FAILED — the committed inventory does not match what the registries produce now");
    process.exit(1);
  }
  const doc = readFileSync(join(REPO, outPath), "utf8");
  const updated = spliceAnchors(spliceAnchors(doc, "rows", rowsMarkdown), "summary", summaryMarkdown);
  writeFileSync(join(REPO, outPath), updated);
  const c = inventory.counts;
  console.log(`sheet-inventory: wrote ${outPath}`);
  console.log(`  surfaces: ${c.total} (${c.primary} primary + ${c.stacked} stacked)`);
  console.log(`  coverage gate: ${c.coverageRenderable} = ${c.coverageStories} stories + ${c.coverageExempt} exempt`);
  console.log(`  rows: stories ${c.yes}, allowlisted ${c.allowlisted}, with captures ${c.withCaptures}, no reference ${c.withoutReference}`);
}

export { buildInventory, regenerate, spliceAnchors, readGrammarArray };

if (process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]))) main();
