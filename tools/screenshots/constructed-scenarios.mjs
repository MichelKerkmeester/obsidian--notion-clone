// ───────────────────────────────────────────────────────────────────
// MODULE:    constructed-scenarios
// COMPONENT: constructed screenshot scenario registry and its mount driver
// ───────────────────────────────────────────────────────────────────
//
// The capture pipeline used to photograph only hand-written fixture markup. A fixture proves
// what the stylesheet does to the class structure the renderers emit; it never runs the
// renderers, so a regression in the shipped code that the fixture mirrors loosely can stay
// green. These scenarios mount the real renderers through the shared render-assertion bundle
// — the same esbuild step and mount path the assertion, touch-target and unstyled-links lanes
// use — so the picture is of the renderer itself.
//
// A constructed scenario's `mount(page, device, theme)` navigates a page to a host document
// that loads the bundle, then resolves with the mounted container ONLY when the renderer has
// signalled ready: the harness's onMounted hook fired and its production-render marker is on
// the DOM — the same readiness the assertion lanes check before they measure anything. A mount
// that resolves without that signal is refused; a capture cannot photograph a renderer that
// never mounted.
//
// The bundle is built once per capture run by the caller and disposed when the run ends, so
// the esbuild step is never repeated per scenario and never leaks a temp directory.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildRenderAssertionBundle } from "../live/render-assertion-bundle.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HERE = fileURLToPath(new URL(".", import.meta.url));

// ───────────────────────────────────────────────────────────────────
// 2. BUNDLE
// ───────────────────────────────────────────────────────────────────

// The entry body the capture run appends to the shared preamble. It mounts the scenario
// through runRenderAssertions and keeps the container the renderer built; the harness removes
// the container after its onMounted hook, so the hook's job here is to capture it and the
// body's job is to put it back where the capture measures it.
const CONSTRUCTED_ENTRY_BODY = `
window.__mountConstructed = (spec) => {
  // #shot carries theme.css's fixture-path sizing (height: 100%, resolved against the
  // viewport) so a fixture painted straight into it fills the pane the way the real app
  // does. Mounting a renderer as #shot's sibling-after inherits that as a phantom full
  // viewport height sitting above the container the instant it is created — before this
  // function ever moves it into #shot — because #shot is still empty and already that
  // tall. A renderer that reads its own offset from the page during that first render
  // (the list view windows against it) sees itself starting one viewport-height down and
  // computes its visible rows from there. Detaching #shot for the render keeps the
  // container's initial position where a real pane's content starts: flush at zero, as
  // body's only child, with nothing already occupying the space above it — while it is
  // still body's DIRECT child, which is what lets its own height: 100% keep resolving
  // against the viewport the same way it did before this fix.
  const shot = document.getElementById("shot");
  const shotNextSibling = shot.nextSibling;
  shot.remove();
  let container = null;
  let provenance = false;
  runRenderAssertions(document.body, spec, "", (mounted, results) => {
    container = mounted;
    provenance = results.length > 0 && results[0].pass;
  });
  document.body.insertBefore(shot, shotNextSibling);
  if (!container || !provenance) return false;
  shot.appendChild(container);
  return true;
};
`;

let constructedBundle = null;

export async function prepareConstructedBundle() {
  if (constructedBundle) return constructedBundle;
  const built = await buildRenderAssertionBundle(CONSTRUCTED_ENTRY_BODY);
  if (built.missingSources.length > 0) {
    throw new Error("constructed capture: the bundle no longer imports "
      + `${built.missingSources.join(", ")} — a capture that does not bundle the shipped `
      + "renderer photographs nothing about it");
  }
  constructedBundle = { work: built.work, bundlePath: built.bundlePath };
  return constructedBundle;
}

export function disposeConstructedBundle() {
  if (!constructedBundle) return;
  rmSync(constructedBundle.work, { recursive: true, force: true });
  constructedBundle = null;
}

// ───────────────────────────────────────────────────────────────────
// 3. MOUNT DRIVER
// ───────────────────────────────────────────────────────────────────

// The host mirrors the fixture page's framing: the theme class on <html> and the device's
// body class. Obsidian marks phones with `is-phone`, and a large part of the responsive CSS
// keys off it, so a narrow viewport without the class is only a cramped desktop. The viewport
// meta keeps a phone layout from collapsing to a 980px desktop one, and the three stylesheets
// load in the same order the fixture page inlines them. The bundle loads from the work
// directory the capture run built it into.
function constructedHostHtml(device, theme) {
  return `<!doctype html>
<html class="${theme === "dark" ? "theme-dark" : "theme-light"}">
<head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="file://${join(HERE, "theme.css")}">
<link rel="stylesheet" href="file://${join(REPO, "styles.css")}">
<link rel="stylesheet" href="file://${join(HERE, "runtime-vars.css")}">
</head>
<body class="${device.bodyClass}"><div id="shot"></div><script src="render-bundle.js"></script></body></html>`;
}

export async function mountConstructed(page, device, theme, spec) {
  if (!constructedBundle) {
    throw new Error("constructed capture: no bundle prepared — build it before mounting");
  }
  const host = join(constructedBundle.work, `host-${spec.renderer}-${device.id}-${theme}.html`);
  writeFileSync(host, constructedHostHtml(device, theme));
  await page.goto(pathToFileURL(host).href, { waitUntil: "load" });
  const ready = await page.evaluate((s) => window.__mountConstructed(s), spec);
  if (!ready) return null;
  return page.$("#shot > .note-database-container");
}

// ───────────────────────────────────────────────────────────────────
// 4. THE CONSTRUCTED SCENARIO CONTRACT
// ───────────────────────────────────────────────────────────────────

// A constructed scenario without an async mount carries no readiness signal: the capture can
// only wait on a promise, and a mount that returns synchronously resolves before the renderer
// has signalled ready, so the screenshot would photograph an unmounted view and every check
// would stay green. The refusal is a startup error naming the scenario, never a silent run.
export function validateConstructedScenario(scenario) {
  if (!scenario || typeof scenario !== "object") {
    throw new Error("constructed scenario is not an object");
  }
  const id = scenario.id ?? "?";
  if (typeof scenario.mount !== "function") {
    throw new Error(`constructed scenario "${id}" declares no mount`);
  }
  if (scenario.mount.constructor.name !== "AsyncFunction") {
    throw new Error(`constructed scenario "${id}" declares a mount with no readiness signal: `
      + "mount must be async and resolve only once the renderer has signalled ready, "
      + "so the capture has something to wait on before it screenshots");
  }
}

// ───────────────────────────────────────────────────────────────────
// 5. REGISTRY
// ───────────────────────────────────────────────────────────────────

// The files a constructed capture depicts. The shared set shapes how any constructed render
// mounts (the bundle's build and entry, the harness's mount and benches, the DOM shims the
// renderers call); the per-view pair is the renderer photographed and the bench whose data
// shape the picture shows. Together they decide which captures a source change invalidates.
const SHARED_CONSTRUCTED_SOURCES = [
  "tools/live/render-assertion-harness.ts",
  "tools/live/render-assertion-bundle.mjs",
  "tools/screenshots/constructed-scenarios.mjs",
  "tools/storybook/obsidian-stub.mjs",
  "tools/storybook/obsidian-dom-shim.mjs",
];

function constructedSources(rendererFile, benchFile) {
  return [rendererFile, benchFile, ...SHARED_CONSTRUCTED_SOURCES];
}

// The harness's own ScenarioSpec options a capture may declare, passed through unchanged. Each
// is additive and off by default; the harness branch that reads it is the only consumer, so a
// scenario that declares an option a branch does not know about would be caught by the state
// assertions rather than silently ignored.
const SPEC_OPTIONS = [
  "subtaskTree", "sparseFields", "emptyState", "chartVariant", "miniCalendar",
  "toolbarPopover", "searchText", "rules", "ruleKind", "filterDepth", "calendarHint",
  "recordBodyVariant", "editorKind", "includeTime", "boardExtensions", "boardImageField",
  "boardEmptyColumn", "galleryImageField", "tableGroups", "tableFooter", "fullStatusPalette",
  "recordIconColumn", "columnHeaderController", "longHeaderLabel", "migratedFromList",
];

function constructedScenario(view, opts) {
  // captureData is the harness's own opt-in (render-assertion-harness.ts's ScenarioSpec): a
  // small "mixed"-type dataset sized like the hand-written fixtures rather than the 1600-2000-row
  // structural-cost shape the assertion/touch-target/unstyled-links lanes measure. A capture
  // exists to show what the shipped types render as, so it is the one caller that turns this on.
  // The other options in SPEC_OPTIONS are the same harness's own per-surface state options —
  // additive, opt-in, and passed through unchanged when a scenario declares one.
  const spec = {
    renderer: opts.renderer,
    bag: "file-view",
    ...(opts.scale ? { scale: opts.scale } : {}),
    ...(opts.captureData === false ? {} : { captureData: true }),
    ...Object.fromEntries(SPEC_OPTIONS
      .filter((key) => opts[key] !== undefined)
      .map((key) => [key, opts[key]])),
  };
  return {
    id: `constructed-${view}`,
    title: opts.title,
    // Component-grouped captures (the toolbar popovers, the anchored panels and the field
    // editors) open a real, JS-positioned surface — `position: fixed` panels escape `#shot`'s own
    // flow-based bounding box, phone sheets portal to the body, and the menu/picker mounts on
    // document.body by design — so those declare "viewport" to photograph the full page the
    // surface actually paints onto (capture.mjs's own `page.screenshot()` branch for non-element
    // modes) rather than an "element" crop that would clip it to nothing.
    group: opts.group || "views",
    ...(opts.capture ? { capture: opts.capture } : {}),
    sources: opts.sources,
    renderer: opts.renderer,
    bag: "file-view",
    ...(opts.scale ? { scale: opts.scale } : {}),
    // The fixture this constructed capture supersedes as the authority for the state it
    // photographs; the fixture side declares the same relationship, so the manifest records it
    // on both entries.
    ...(opts.fixtureOf ? { fixtureOf: opts.fixtureOf } : {}),
    note: opts.note,
    mount: async (page, device, theme) => mountConstructed(page, device, theme, spec),
  };
}

export const CONSTRUCTED_SCENARIOS = [
  constructedScenario("list", {
    renderer: "list",
    title: "List view (constructed)",
    sources: constructedSources("src/views/list-renderer.ts", "tools/bench/list-render-bench.ts"),
    note: "The shipped list renderer at the harness's bench shape (1600 rows, 30% fill), windowed to the viewport.",
  }),
  constructedScenario("table", {
    renderer: "table",
    title: "Table view (constructed)",
    sources: constructedSources("src/views/table-renderer.ts", "tools/bench/table-render-bench.ts"),
    note: "The shipped table renderer at the bench's sixteen-column shape, over the capture-sized "
      + "row set captureData selects.",
  }),
  constructedScenario("board", {
    renderer: "board",
    title: "Board view (constructed)",
    sources: constructedSources("src/views/board-renderer.ts", "tools/bench/board-render-bench.ts"),
    note: "The shipped board renderer at the bench shape: 1600 rows into five status columns.",
  }),
  constructedScenario("gallery", {
    renderer: "gallery",
    title: "Gallery view (constructed)",
    sources: constructedSources("src/views/gallery-renderer.ts", "tools/bench/gallery-render-bench.ts"),
    note: "The shipped gallery renderer at the bench shape: 1600 cards in a responsive grid.",
  }),
  constructedScenario("calendar-month", {
    renderer: "calendar",
    scale: "month",
    title: "Calendar month view (constructed)",
    sources: constructedSources("src/views/calendar-renderer.ts", "tools/bench/calendar-render-bench.ts"),
    note: "The shipped month grid anchored on the bench's event dates, with its unscheduled backlog.",
  }),
  constructedScenario("calendar-week", {
    renderer: "calendar",
    scale: "week",
    title: "Calendar week view (constructed)",
    sources: constructedSources("src/views/calendar-renderer.ts", "tools/bench/calendar-render-bench.ts"),
    note: "The shipped week time grid, scrolled to the workday by the renderer's own post-render correction.",
  }),
  constructedScenario("calendar-day", {
    renderer: "calendar",
    scale: "day",
    title: "Calendar day view (constructed)",
    sources: constructedSources("src/views/calendar-renderer.ts", "tools/bench/calendar-render-bench.ts"),
    note: "The shipped day time grid, scrolled to the workday by the renderer's own post-render correction.",
  }),
  constructedScenario("timeline", {
    renderer: "timeline",
    title: "Timeline view (constructed)",
    sources: constructedSources("src/views/calendar-timeline-renderer.ts", "tools/bench/timeline-render-bench.ts"),
    note: "The shipped week-scale timeline at the bench shape, with the renderer's own group-width correction applied.",
  }),
  constructedScenario("chart", {
    renderer: "chart",
    title: "Chart view (constructed)",
    sources: constructedSources("src/views/chart-renderer.ts", "tools/bench/board-render-bench.ts"),
    note: "The shipped chart renderer over the board bench's five status groups, summing a "
      + "per-row currency/number column into each bar rather than only counting rows.",
  }),

  // ── 043's thirteen fixture-only scenarios: per-view state variants, chart chrome and toolbar
  // popovers, constructed through the same renderers and — for the popovers — the same real
  // togglePopover() their production toolbars call, never a hand-applied class. Declared with
  // fixtureOf from the fixture side (tools/screenshots/scenarios/*.mjs).

  constructedScenario("board-subtask", {
    renderer: "board",
    subtaskTree: true,
    title: "Board view — subtask tree (constructed)",
    sources: constructedSources("src/views/board-renderer.ts", "tools/bench/board-render-bench.ts")
      .concat(["src/data/subtask-relation.ts", "src/data/subtask-serialize.ts", "src/i18n.ts"]),
    note: "The shipped board renderer with the first capture-sized row wired into a parent (two "
      + "children, explicit progress, expanded) via buildSubtaskRelation's own frontmatter keys.",
  }),
  constructedScenario("timeline-subtask", {
    renderer: "timeline",
    subtaskTree: true,
    title: "Timeline view — subtask tree (constructed)",
    sources: constructedSources("src/views/calendar-timeline-renderer.ts", "tools/bench/timeline-render-bench.ts")
      .concat(["src/data/subtask-relation.ts", "src/data/subtask-serialize.ts", "src/i18n.ts"]),
    note: "The shipped week-scale timeline with the first capture-sized row wired into the same "
      + "parent/two-children relation the board's constructed subtask tree uses.",
  }),
  constructedScenario("list-sparse", {
    renderer: "list",
    sparseFields: true,
    title: "List view — sparse fields (constructed)",
    sources: constructedSources("src/views/list-renderer.ts", "tools/bench/list-render-bench.ts"),
    note: "The shipped list renderer with a deterministic, spread subset of frontmatter keys "
      + "blanked per row, so renderRowFieldPlaceholder's real reservation decision is measured "
      + "rather than a fixture's static every-field-present shape.",
  }),
  constructedScenario("calendar-mini", {
    renderer: "calendar",
    miniCalendar: true,
    title: "Calendar view — mini date-picker popover (constructed)",
    sources: constructedSources("src/views/calendar-renderer.ts", "tools/bench/calendar-render-bench.ts")
      .concat(["src/views/calendar-mini-calendar-renderer.ts"]),
    note: "The shipped month calendar with its own mini date-picker trigger clicked, opening "
      + "renderMiniCalendar's real popover rather than a hand-applied class.",
  }),
  constructedScenario("calendar-empty", {
    renderer: "calendar",
    emptyState: true,
    title: "Calendar view — no date property (constructed)",
    sources: constructedSources("src/views/calendar-renderer.ts", "tools/bench/calendar-render-bench.ts")
      .concat(["src/views/empty-state-renderer.ts"]),
    note: "The shipped calendar renderer with every date-typed column removed from its schema, "
      + "reproducing renderMonth's real no-date-field early return.",
  }),
  constructedScenario("chart-number", {
    renderer: "chart",
    chartVariant: "number",
    title: "Chart view — single number (constructed)",
    sources: constructedSources("src/views/chart-renderer.ts", "tools/bench/board-render-bench.ts"),
    note: "The shipped chart renderer's renderNumber branch (chartType: \"number\"), the one chart "
      + "type drawn as three divs instead of a Chart.js canvas.",
  }),
  constructedScenario("chart-empty", {
    renderer: "chart",
    chartVariant: "empty",
    title: "Chart view — empty state (constructed)",
    sources: constructedSources("src/views/chart-renderer.ts", "tools/bench/board-render-bench.ts"),
    note: "The shipped chart renderer's allGroupsHidden empty state, reached by hiding every "
      + "group value the board bench's group field actually produced.",
  }),
  constructedScenario("calendar-toolbar-options", {
    renderer: "calendar-toolbar",
    group: "components",
    capture: "viewport",
    title: "Calendar settings popover (constructed)",
    sources: constructedSources("src/views/calendar-toolbar-renderer.ts", "tools/bench/calendar-render-bench.ts")
      .concat(["src/views/dropdown-field.ts", "src/views/popover-position.ts"]),
    note: "CalendarToolbarRenderer's own togglePopover(), opened at week scale so the Time section "
      + "(week/day only) is in frame; captured full-page because the popover positions itself with "
      + "position: fixed, escaping an element-scoped #shot crop.",
  }),
  constructedScenario("timeline-toolbar-options", {
    renderer: "timeline-toolbar",
    group: "components",
    capture: "viewport",
    title: "Timeline settings popover (constructed)",
    sources: constructedSources("src/views/calendar-timeline-toolbar-renderer.ts", "tools/bench/timeline-render-bench.ts")
      .concat(["src/views/dropdown-field.ts", "src/views/popover-position.ts"]),
    note: "CalendarTimelineToolbarRenderer's own togglePopover(); captured full-page for the same "
      + "position: fixed reason as the calendar settings popover.",
  }),
  constructedScenario("chart-toolbar-options", {
    renderer: "chart-toolbar",
    group: "components",
    capture: "viewport",
    title: "Chart options popover (constructed)",
    sources: constructedSources("src/views/chart-toolbar-renderer.ts", "tools/bench/board-render-bench.ts")
      .concat(["src/views/popover-position.ts"]),
    note: "ChartToolbarRenderer's own togglePopover(); captured full-page for the same "
      + "position: fixed reason as the other two settings popovers.",
  }),

  // ── The toolbar and the surfaces its own buttons open: the plain toolbar, the search control
  // widened by its state's text, and the two popovers reached by clicking the toolbar's own
  // trigger buttons — the same anchors a device tap reaches, never a hand-applied class.

  constructedScenario("toolbar", {
    renderer: "toolbar",
    group: "components",
    title: "Main toolbar (constructed)",
    fixtureOf: "chrome-toolbar",
    sources: constructedSources("src/views/toolbar-renderer.ts", "tools/bench/table-render-bench.ts"),
    note: "ToolbarRenderer's own render over a one-view database: heading, view tabs, and the "
      + "query, properties, utilities and creation clusters. The view-switcher fixture this also "
      + "supersedes showed the tabs alone; here they sit in the header that owns them.",
  }),
  constructedScenario("toolbar-search", {
    renderer: "toolbar",
    searchText: "notion",
    group: "components",
    title: "Toolbar search, active (constructed)",
    fixtureOf: "chrome-toolbar-search",
    sources: constructedSources("src/views/toolbar-renderer.ts", "tools/bench/table-render-bench.ts"),
    note: "The same toolbar with the view state's search text set, which is the real input that "
      + "widens the collapsed wrap and reveals the clear button. The collapsed wrap is in frame "
      + "in the plain toolbar capture.",
  }),
  constructedScenario("toolbar-utilities", {
    renderer: "toolbar",
    toolbarPopover: "utilities",
    group: "components",
    capture: "viewport",
    title: "More-tools dropdown (constructed)",
    fixtureOf: "chrome-utilities-popover",
    sources: constructedSources("src/views/toolbar-renderer.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/views/menu-row.ts", "src/views/popover-position.ts"]),
    note: "The toolbar's More-tools button clicked, opening the utilities popover through "
      + "renderUtilitiesOverflowButton's own onclick; captured full-page because the popover "
      + "positions itself with position: fixed.",
  }),
  constructedScenario("toolbar-add-view", {
    renderer: "toolbar",
    toolbarPopover: "add-view",
    group: "components",
    capture: "viewport",
    title: "Add view popover (constructed)",
    fixtureOf: "add-view-popover",
    sources: constructedSources("src/views/toolbar-renderer.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/views/menu-row.ts", "src/views/popover-position.ts"]),
    note: "The view-tab plus button clicked, opening the add-view popover through showAddViewMenu's "
      + "own onclick; captured full-page for the same position: fixed reason as the utilities popover.",
  }),
  constructedScenario("active-view-controls", {
    renderer: "active-view-controls",
    group: "components",
    title: "Active filter and sort chips (constructed)",
    fixtureOf: "chrome-active-view-controls",
    sources: constructedSources("src/views/active-view-controls-renderer.ts", "tools/bench/list-render-bench.ts")
      .concat(["src/views/filter-panel-renderer.ts"]),
    note: "ActiveViewControlsRenderer's own render over a state with two effective filters and "
      + "two sorts, so the AND logic button sits between the groups exactly as the chip row draws it.",
  }),
  constructedScenario("active-rule-filter", {
    renderer: "active-rule-popover",
    ruleKind: "filter",
    group: "components",
    capture: "viewport",
    title: "Active rule popover — filter (constructed)",
    fixtureOf: "chrome-active-rule-popover-filter",
    sources: constructedSources("src/views/active-rule-popover-renderer.ts", "tools/bench/list-render-bench.ts")
      .concat(["src/views/filter-panel-renderer.ts", "src/views/dropdown-field.ts", "src/views/popover-position.ts"]),
    note: "ActiveRulePopoverRenderer's own toggleFilter against a real anchor, with the panel "
      + "built by FilterPanelRenderer's renderSingleRuleEditor; captured full-page for its "
      + "position: fixed placement.",
  }),
  constructedScenario("active-rule-sort", {
    renderer: "active-rule-popover",
    ruleKind: "sort",
    group: "components",
    capture: "viewport",
    title: "Active rule popover — sort (constructed)",
    fixtureOf: "chrome-active-rule-popover-sort",
    sources: constructedSources("src/views/active-rule-popover-renderer.ts", "tools/bench/list-render-bench.ts")
      .concat(["src/views/sort-panel-renderer.ts", "src/views/dropdown-field.ts", "src/views/popover-position.ts"]),
    note: "The sort twin of the filter popover: toggleSort against a real anchor with "
      + "SortPanelRenderer's renderSingleRuleEditor; captured full-page for the same reason.",
  }),

  // ── The anchored panels, each opened through its own renderer's public render entry against a
  // real anchor. All of them position themselves with position: fixed (or portal to the body as
  // a phone sheet), so every one is captured full-page.

  constructedScenario("filter-panel", {
    renderer: "filter-panel",
    group: "panels",
    capture: "viewport",
    title: "Filter panel with active conditions (constructed)",
    fixtureOf: "panel-filter-conditions",
    sources: constructedSources("src/views/filter-panel-renderer.ts", "tools/bench/list-render-bench.ts")
      .concat(["src/views/dropdown-field.ts", "src/views/date-value-picker.ts", "src/data/view-filter-tree.ts"]),
    note: "FilterPanelRenderer's own render over a flat AND group of three rules, so the panel "
      + "header defers its logic button to the group's own dropdown.",
  }),
  constructedScenario("filter-panel-nested", {
    renderer: "filter-panel",
    filterDepth: "nested",
    group: "panels",
    capture: "viewport",
    title: "Filter panel with a nested group and a NOT (constructed)",
    fixtureOf: "panel-filter-nested-group",
    sources: constructedSources("src/views/filter-panel-renderer.ts", "tools/bench/list-render-bench.ts")
      .concat(["src/views/dropdown-field.ts", "src/data/view-filter-tree.ts"]),
    note: "The same renderer over a tree that holds a NOT node and an inner OR group — the "
      + "nesting depth the panel's own wrap rules allow for a wrapped subtree.",
  }),
  constructedScenario("sort-panel", {
    renderer: "sort-panel",
    group: "panels",
    capture: "viewport",
    title: "Sort panel with two rules (constructed)",
    fixtureOf: "panel-sort-rules",
    sources: constructedSources("src/views/sort-panel-renderer.ts", "tools/bench/list-render-bench.ts")
      .concat(["src/views/dropdown-field.ts"]),
    note: "SortPanelRenderer's own render over two real rules, with the first rule's move-up and "
      + "the last rule's move-down disabled by the renderer itself.",
  }),
  constructedScenario("sort-panel-calendar", {
    renderer: "sort-panel",
    calendarHint: true,
    group: "panels",
    capture: "viewport",
    title: "Sort panel with no rules, calendar hint (constructed)",
    fixtureOf: "panel-sort-calendar-empty",
    sources: constructedSources("src/views/sort-panel-renderer.ts", "tools/bench/list-render-bench.ts"),
    note: "The calendar view's sort panel: the renderer reads config.viewType === \"calendar\" "
      + "and draws its layout hint above the empty state — the only state the hint appears in.",
  }),
  constructedScenario("view-config", {
    renderer: "view-config",
    group: "panels",
    capture: "viewport",
    title: "View configuration panel (constructed)",
    fixtureOf: "panel-view-config",
    sources: constructedSources("src/views/view-config-panel-renderer.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/views/dropdown-field.ts"]),
    note: "ViewConfigPanelRenderer's own render for a table view with a one-view database, so "
      + "both the database-scoped and the view-scoped sections draw.",
  }),
  constructedScenario("column-manager", {
    renderer: "column-manager",
    group: "panels",
    capture: "viewport",
    title: "Column manager (constructed)",
    fixtureOf: "panel-column-manager",
    sources: constructedSources("src/views/column-manager-renderer.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/views/property-type-icon.ts", "src/views/checkbox.ts"]),
    note: "ColumnManagerRenderer's own render over the table bench's sixteen columns with one "
      + "hidden, so the select-all checkbox sits in its real indeterminate state.",
  }),
  constructedScenario("column-width-adjuster", {
    renderer: "column-width-adjuster",
    group: "panels",
    capture: "viewport",
    title: "Column width adjuster (constructed)",
    fixtureOf: "panel-column-width-sheet",
    sources: constructedSources("src/views/column-width.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/views/mobile-bottom-sheet.ts", "src/views/popover-position.ts", "src/views/popover-auto-close.ts"]),
    note: "openColumnWidthAdjuster's own module entry over a real currency column from the table "
      + "bench. On the phone device isMobileBottomSheet's own check turns it into the shared "
      + "bottom sheet (chrome, placement, entrance, drag-to-dismiss); on desktop it stays the "
      + "fixed panel it has always been. Both presentations share the panel-family body markup "
      + "photographed here, not a bespoke strip.",
  }),
  constructedScenario("record-detail", {
    renderer: "record-detail",
    group: "panels",
    capture: "viewport",
    title: "Record detail panel (constructed)",
    fixtureOf: "panel-record-detail",
    sources: constructedSources("src/views/record-detail-panel.ts", "tools/bench/board-render-bench.ts")
      .concat(["src/views/card-field-renderer.ts", "src/views/popover-position.ts", "src/views/mobile-bottom-sheet.ts"]),
    note: "openRecordDetailPanel's own entry against a real anchor over a capture-sized board "
      + "row: the panel chrome and its typed fields. The note body is absent — mounting it needs "
      + "a live MarkdownRenderer — and the phone device pass becomes the bottom sheet through "
      + "positionToolbarPopover's own is-phone branch. Supersedes the desktop panel and the phone "
      + "sheet fixtures together.",
  }),
  constructedScenario("record-detail-body-editing", {
    renderer: "record-detail-body",
    recordBodyVariant: "editing",
    group: "panels",
    capture: "viewport",
    title: "Record detail — note body being typed (constructed)",
    fixtureOf: "panel-record-detail-sheet-body-editing",
    sources: constructedSources("src/views/note-body-region.ts", "tools/bench/board-render-bench.ts"),
    note: "mountNoteBodyRegion's own entry with beginEdit called, swapping the rendered body for "
      + "its textarea. The markdown-to-DOM renderer is the injected one the module's contract "
      + "requires — the real MarkdownRenderer has no standalone build — so the region's modes are "
      + "production and the content inside them is not. The editor's blur-commits contract means "
      + "the mount re-enters edit mode after its teardown, so the picture shows the textarea "
      + "rather than the body it would fall back to.",
  }),
  constructedScenario("record-detail-body-empty", {
    renderer: "record-detail-body",
    recordBodyVariant: "empty",
    group: "panels",
    capture: "viewport",
    title: "Record detail — note body not written yet (constructed)",
    fixtureOf: "panel-record-detail-sheet-body-empty",
    sources: constructedSources("src/views/note-body-region.ts", "tools/bench/board-render-bench.ts"),
    note: "The same region over an empty body, drawing the placeholder line the module writes "
      + "when a note has frontmatter and nothing else.",
  }),
  constructedScenario("record-peek", {
    renderer: "record-peek",
    group: "panels",
    capture: "viewport",
    title: "Table record peek (constructed)",
    fixtureOf: "panel-record-peek",
    sources: constructedSources("src/views/table-record-peek.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/views/table-renderer.ts", "src/views/cell-renderer.ts"]),
    note: "openTableRecordPeek's own entry docked beside the real table it opens from, with the "
      + "row's typed values rendered through the peek's own property renderer.",
  }),

  // ── The chrome surfaces that ride a real table or row.

  constructedScenario("table-footer", {
    renderer: "table",
    tableFooter: true,
    group: "components",
    title: "Table footer aggregates (constructed)",
    fixtureOf: "chrome-table-footer",
    sources: constructedSources("src/views/table-renderer.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/views/table-footer-renderer.ts", "src/views/cell-renderer.ts"]),
    note: "The constructed table with summary rules configured on a currency, a date and a select "
      + "column, so the footer the table renders stacks real calculated results.",
  }),
  constructedScenario("table-grouped", {
    renderer: "table",
    tableGroups: true,
    group: "components",
    title: "Grouped table header rows (constructed)",
    fixtureOf: "chrome-group-header-row",
    sources: constructedSources("src/views/table-renderer.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/views/group-label-renderer.ts", "src/views/summary-renderer.ts"]),
    note: "renderGroupedTable's own entry over a two-level group tree with summary rules, so the "
      + "divider rows carry their coloured badges at both depths and their computed totals.",
  }),
  constructedScenario("list-migrated", {
    renderer: "table",
    migratedFromList: true,
    group: "components",
    title: "A migrated list view (constructed)",
    sources: constructedSources("src/views/table-renderer.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/data/list-migration.ts", "src/views/list-renderer.ts"]),
    note: "A config built as viewType: \"list\" (listCompactFields included, the real Punch List "
      + "shape 006 migrates), run through the production planListMigration/applyListMigration, "
      + "then forked on the migrated viewType the same way database-view.ts's render() does — "
      + "ListRenderer if it stayed \"list\", TableRenderer otherwise. Photographs a real table, "
      + "not a hand-authored one.",
  }),
  constructedScenario("summary", {
    renderer: "summary",
    group: "components",
    title: "Summary row (constructed)",
    fixtureOf: "chrome-summary-row",
    sources: constructedSources("src/views/summary-renderer.ts", "tools/bench/list-render-bench.ts"),
    note: "SummaryRenderer's own render with the onChange hook that makes the rule items "
      + "draggable and clickable, over the same three rule kinds the grouped table uses.",
  }),
  constructedScenario("owned-menu", {
    renderer: "owned-menu",
    group: "components",
    capture: "viewport",
    title: "Owned menu — the shell every context menu uses (constructed)",
    fixtureOf: "chrome-owned-menu",
    sources: constructedSources("src/views/owned-menu.ts", "tools/bench/list-render-bench.ts")
      .concat(["src/views/menu-row.ts", "src/views/mobile-bottom-sheet.ts"]),
    note: "createOwnedMenu's own entry with rows built through the handle's addRow the way "
      + "ColumnMenu builds them. The menu mounts on document.body by design, so the capture is "
      + "full-page; the phone device pass becomes the bottom-sheet presentation through the "
      + "module's own showAt placement. Supersedes the desktop menu and the phone sheet fixtures "
      + "together.",
  }),
  constructedScenario("group-selection-controls", {
    renderer: "group-selection-controls",
    group: "components",
    title: "Group selection controls (constructed)",
    fixtureOf: "chrome-group-selection-controls",
    sources: constructedSources("src/views/list-renderer.ts", "tools/bench/board-render-bench.ts")
      .concat(["src/views/gallery-renderer.ts", "src/views/board-renderer.ts", "src/views/group-label-renderer.ts"]),
    note: "One role, three views: the whole-group selection box from the list, the gallery and "
      + "the extensions board's column header, each through its renderer's own grouped entry. The "
      + "fixture's board-subgroup box no longer exists on the shipped board — the subgroup surface "
      + "is the swimlane lane header, which carries no box. Framing bound: three real grouped "
      + "renders do not fit one viewport, and an element capture crops to it, so the picture holds "
      + "the list host and as much of the next as fits; the gallery and board boxes are asserted "
      + "by constructed-state-assertions rather than photographed here.",
  }),
  constructedScenario("card-covers", {
    renderer: "card-covers",
    group: "components",
    title: "Card covers, board and gallery (constructed)",
    fixtureOf: "card-cover-states",
    sources: constructedSources("src/views/board-renderer.ts", "tools/bench/board-render-bench.ts")
      .concat(["src/views/gallery-renderer.ts"]),
    note: "The empty cover in both card views: each renderer with an image field the rows resolve "
      + "nothing for, which is the only cover state a capture without a vault can show. Framing "
      + "bound: a board of covered cards already fills the viewport an element capture crops to, "
      + "so the picture holds the board host; the gallery's empty cover is asserted by "
      + "constructed-state-assertions rather than photographed here.",
  }),

  // ── The field editors, pickers and value renderers.

  constructedScenario("cell-editor-text", {
    renderer: "cell-editors",
    editorKind: "text",
    group: "fields",
    capture: "viewport",
    title: "Text cell in edit state (constructed)",
    fixtureOf: "field-cell-edit-text",
    sources: constructedSources("src/views/cell-renderer.ts", "tools/bench/table-render-bench.ts"),
    note: "CellRenderer's own startEdit — the entry database-view.ts wires into its editCell "
      + "action — opened on a markdown text cell (toolbar and textarea) and on a number cell "
      + "(single-line editor). Captured full-page because the editors position themselves "
      + "against the cell.",
  }),
  constructedScenario("cell-editor-select", {
    renderer: "cell-editors",
    editorKind: "select",
    group: "fields",
    capture: "viewport",
    title: "Select cell in edit state (constructed)",
    fixtureOf: "field-cell-edit-select",
    sources: constructedSources("src/views/cell-renderer.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/data/column-types.ts"]),
    note: "The same startEdit entry on a select cell, opening the option-list editor over the "
      + "column's own configured options. Captured full-page for the same positioning reason.",
  }),
  constructedScenario("date-picker", {
    renderer: "date-picker",
    group: "fields",
    capture: "viewport",
    title: "Date value picker (constructed)",
    fixtureOf: "field-date-value-picker",
    sources: constructedSources("src/views/date-value-picker.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/views/calendar-mini-calendar-renderer.ts"]),
    note: "renderDateValuePicker's own trigger clicked, opening the popover through the module's "
      + "own open handler with its presets, segments and the flat mini calendar.",
  }),
  constructedScenario("date-picker-datetime", {
    renderer: "date-picker",
    includeTime: true,
    group: "fields",
    capture: "viewport",
    title: "Date value picker with time (constructed)",
    fixtureOf: "field-date-value-picker-datetime",
    sources: constructedSources("src/views/date-value-picker.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/views/calendar-mini-calendar-renderer.ts"]),
    note: "The datetime twin: the same trigger with the includeTime flag, adding the hour and "
      + "minute segments and the clock icon.",
  }),
  constructedScenario("icon-picker", {
    renderer: "icon-picker",
    group: "fields",
    capture: "viewport",
    title: "Icon picker popover (constructed)",
    fixtureOf: "field-icon-picker",
    sources: constructedSources("src/views/icon-picker-popover.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/views/record-icon-renderer.ts"]),
    note: "openIconPickerPopover's own entry with a lucide current token, which is what the "
      + "module reads to open its Icons tab with the colour strip. The panel mounts on "
      + "document.body, so the capture is full-page.",
  }),
  constructedScenario("option-color-picker", {
    renderer: "color-picker",
    group: "fields",
    capture: "viewport",
    title: "Option colour picker (constructed)",
    fixtureOf: "field-option-color-picker",
    sources: constructedSources("src/views/option-color-picker.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/data/status-colors.ts"]),
    note: "openOptionColorPicker's own entry with the current colour that rings the matching "
      + "swatch. Mounts on document.body like the icon picker, so the capture is full-page.",
  }),
  constructedScenario("relation-values", {
    renderer: "relation-values",
    group: "fields",
    title: "Relation values (constructed)",
    fixtureOf: "field-relation-values",
    sources: constructedSources("src/views/relation-value-renderer.ts", "tools/bench/board-render-bench.ts"),
    note: "renderRelationValue's own entry with no App, the module's documented no-vault mode in "
      + "which every target renders as resolved — the unresolved state needs a live metadata "
      + "cache and stays fixture-only.",
  }),
  constructedScenario("file-fields", {
    renderer: "file-fields",
    group: "fields",
    title: "File fields (constructed)",
    fixtureOf: "field-file-fields",
    sources: constructedSources("src/views/file-field-renderer.ts", "tools/bench/table-render-bench.ts"),
    note: "renderSpecialFileFieldValue's own dispatch for the file.tags badges and the link-list "
      + "column, with the per-tag remove buttons the writable-cell context draws.",
  }),
  constructedScenario("number-displays", {
    renderer: "number-display",
    group: "fields",
    title: "Number display styles (constructed)",
    fixtureOf: "field-number-displays",
    sources: constructedSources("src/views/number-display-renderer.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/data/number-display.ts"]),
    note: "renderRating, renderProgress and renderProgressRing's own entries, one style per row "
      + "including the tinted variants that paint through the db-num-color-* classes.",
  }),
  constructedScenario("record-icon", {
    renderer: "record-icon",
    group: "fields",
    title: "Record icon (constructed)",
    fixtureOf: "field-record-icon",
    sources: constructedSources("src/views/record-icon-renderer.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/views/table-renderer.ts", "src/views/cell-renderer.ts", "src/data/record-icon.ts"]),
    note: "The table's 28px icon gutter with a real renderRecordIcon bag member and an emoji "
      + "token on one row. Coloured lucide tokens need Obsidian's getIconIds and degrade to the "
      + "default fallback here, which is also what unparsed values draw.",
  }),
  constructedScenario("status-colors", {
    renderer: "table",
    fullStatusPalette: true,
    group: "fields",
    title: "Status colour range (constructed)",
    fixtureOf: "field-status-colors",
    sources: constructedSources("src/views/table-renderer.ts", "tools/bench/table-render-bench.ts")
      .concat(["src/views/cell-renderer.ts", "src/data/status-colors.ts"]),
    note: "A configured table whose option columns carry one value per status colour, with a "
      + "multi-select row holding all sixteen, so the whole vocabulary renders as the renderer "
      + "paints it.",
  }),

  // ── The core components.

  constructedScenario("dropdown", {
    renderer: "dropdown",
    group: "components",
    capture: "viewport",
    title: "Dropdown with disabled option (constructed)",
    fixtureOf: "dropdown-field",
    sources: constructedSources("src/views/dropdown-field.ts", "tools/bench/table-render-bench.ts"),
    note: "openDropdownMenu's own entry with a selected option, a plain one and a disabled one "
      + "carrying the reason its tooltip exists to surface.",
  }),
  constructedScenario("empty-state", {
    renderer: "empty-state",
    group: "states",
    title: "Empty state (constructed)",
    fixtureOf: "empty-state",
    sources: constructedSources("src/views/empty-state-renderer.ts", "tools/bench/table-render-bench.ts"),
    note: "EmptyStateRenderer's renderCard entry for the no-columns reason with the fixture's "
      + "copy. The fixture it supersedes wrapped the card vocabulary in the hero's wrapper — a "
      + "composite no single renderer emits — so the constructed picture is the real card shape.",
  }),
  constructedScenario("column-header", {
    renderer: "column-header",
    group: "components",
    title: "Column header affordances (constructed)",
    fixtureOf: "table-column-header",
    sources: constructedSources("src/views/column-header-controller.ts", "tools/bench/table-render-bench.ts"),
    note: "The header cell the table renderer builds with ColumnHeaderController.setup applied — "
      + "the call database-view.ts wires into its setupColumnHeader action — with one label long "
      + "enough to truncate.",
  }),

  // ── The board state variants and the remaining timeline scales.

  constructedScenario("board-empty-column", {
    renderer: "board",
    boardEmptyColumn: true,
    group: "components",
    title: "Board view — empty column (constructed)",
    fixtureOf: "board-empty-column",
    sources: constructedSources("src/views/board-renderer.ts", "tools/bench/board-render-bench.ts")
      .concat(["src/data/group-visibility.ts"]),
    note: "The reference board with one configured select option no row carries, backfilled as a "
      + "zero-row column through the same withEmptyOptionGroups call the hosts make.",
  }),
  constructedScenario("board-extensions", {
    renderer: "board",
    boardExtensions: true,
    group: "components",
    title: "Board extensions selection controls (constructed)",
    fixtureOf: "chrome-board-extensions-selection",
    sources: constructedSources("src/views/board-renderer.ts", "tools/bench/board-render-bench.ts"),
    note: "The extensions board (boardExtensionsEnabled), which is the only surface that draws "
      + "the column-header and card selection boxes; the default board reproduces the reference "
      + "kanban card, which has none.",
  }),
  constructedScenario("timeline-day", {
    renderer: "timeline",
    scale: "day",
    title: "Timeline day scale (constructed)",
    fixtureOf: "timeline-view-day",
    sources: constructedSources("src/views/calendar-timeline-renderer.ts", "tools/bench/timeline-render-bench.ts"),
    note: "The shipped timeline renderer at its day scale, the scale the fixture this supersedes "
      + "photographed as hand-written markup.",
  }),
  constructedScenario("timeline-month", {
    renderer: "timeline",
    scale: "month",
    title: "Timeline month scale (constructed)",
    fixtureOf: "timeline-view-month",
    sources: constructedSources("src/views/calendar-timeline-renderer.ts", "tools/bench/timeline-render-bench.ts"),
    note: "The shipped timeline renderer at its month scale.",
  }),
  constructedScenario("timeline-quarter", {
    renderer: "timeline",
    scale: "quarter",
    title: "Timeline quarter scale (constructed)",
    fixtureOf: "timeline-view-quarter",
    sources: constructedSources("src/views/calendar-timeline-renderer.ts", "tools/bench/timeline-render-bench.ts"),
    note: "The shipped timeline renderer at its quarter scale.",
  }),
  constructedScenario("timeline-year", {
    renderer: "timeline",
    scale: "year",
    title: "Timeline year scale (constructed)",
    fixtureOf: "timeline-view-year",
    sources: constructedSources("src/views/calendar-timeline-renderer.ts", "tools/bench/timeline-render-bench.ts"),
    note: "The shipped timeline renderer at its year scale.",
  }),
];

// Two scenarios sharing an id would silently overwrite one another's PNG and leave the manifest
// describing whichever ran last — the same refusal the fixture registry already carries.
const seen = new Set();
for (const scenario of CONSTRUCTED_SCENARIOS) {
  if (seen.has(scenario.id)) throw new Error(`Duplicate constructed scenario id: ${scenario.id}`);
  seen.add(scenario.id);
  validateConstructedScenario(scenario);
}
