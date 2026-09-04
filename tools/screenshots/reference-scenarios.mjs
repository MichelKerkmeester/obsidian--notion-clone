// ───────────────────────────────────────────────────────────────────
// MODULE:    reference-scenarios
// COMPONENT: reference screenshot scenario registry and its mount driver
// ───────────────────────────────────────────────────────────────────
//
// The constructed captures photograph OUR renderers; these scenarios photograph the
// vendored Project Manager plugin (specs/context/obsidian-pm-main) rendering the same
// project, so a fresh reviewer can read a one-to-one copy of the surface we ported
// beside our own. The mount works exactly like the constructed path: a bundle built once
// per run from the vendored views (through the shared obsidian stub and the Temporal
// stand-in), a host page carrying the theme class and the reference's own stylesheets,
// and a readiness signal that only resolves when the mounted view's own class is on the
// DOM. The reference CSS is concatenated at capture time — the six sheets the kanban and
// gantt actually style against, in the order the reference's own index.css loads them —
// so a stylesheet edit marks its captures stale through the scenario's sources.
//
// Each scenario declares `referenceOf`, naming the constructed scenario it pairs with,
// so the manifest can record which constructed capture each reference picture is the
// mirror of: constructed-board <-> reference-kanban, constructed-timeline <->
// reference-gantt, and the two subtask variants.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildReferenceBundle } from "../live/reference-assertion-bundle.mjs";
import { CONSTRUCTED_SCENARIOS } from "./constructed-scenarios.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HERE = fileURLToPath(new URL(".", import.meta.url));

// ───────────────────────────────────────────────────────────────────
// 2. BUNDLE
// ───────────────────────────────────────────────────────────────────

// The entry body the capture run appends to the shared preamble. It mounts the requested
// view into #shot and returns the mounted root only when the view's own class is present.
const REFERENCE_ENTRY_BODY = `
window.__mountReference = (spec) => mountReferenceView(document.getElementById("shot"), spec);
`;

let referenceBundle = null;

export async function prepareReferenceBundle() {
  if (referenceBundle) return referenceBundle;
  const built = await buildReferenceBundle(REFERENCE_ENTRY_BODY);
  if (built.missingSources.length > 0) {
    throw new Error("reference capture: the bundle no longer imports "
      + `${built.missingSources.join(", ")} — a capture that does not bundle the vendored `
      + "views photographs nothing about them");
  }
  referenceBundle = { work: built.work, bundlePath: built.bundlePath };
  return referenceBundle;
}

export function disposeReferenceBundle() {
  if (!referenceBundle) return;
  rmSync(referenceBundle.work, { recursive: true, force: true });
  referenceBundle = null;
}

// ───────────────────────────────────────────────────────────────────
// 3. MOUNT DRIVER
// ───────────────────────────────────────────────────────────────────

// The reference's own stylesheets, in the order its index.css imports them, restricted to
// the sheets the kanban and gantt actually style against. Held as repo-relative paths
// because that is the form the manifest's freshness check resolves: an absolute path makes
// `verify.mjs` join it onto the repo root, find nothing, and report the source as gone.
const REFERENCE_CSS_RELATIVE = [
  "variables.css",
  "chrome.css",
  "table.css",
  "gantt.css",
  "kanban.css",
  "widgets.css",
  "utilities.css",
].map((file) => `specs/context/obsidian-pm-main/src/styles/${file}`);

const REFERENCE_CSS_FILES = REFERENCE_CSS_RELATIVE.map((relative) => join(REPO, relative));

// The host mirrors the constructed host's framing — the theme class on <html> (the
// reference's own `.theme-dark` selectors key off it), the device's body class, the
// viewport meta — and loads the capture theme's stand-in variables, then the reference's
// own stylesheets. Our plugin's stylesheet deliberately does not load: this page
// photographs the reference, and a stray rule of ours would contaminate the picture.
function referenceHostHtml(device, theme, referenceCss) {
  return `<!doctype html>
<html class="${theme === "dark" ? "theme-dark" : "theme-light"}">
<head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="file://${join(HERE, "theme.css")}">
<style>${referenceCss}</style>
</head>
<body class="${device.bodyClass}"><div id="shot"></div><script src="render-bundle.js"></script></body></html>`;
}

export async function mountReference(page, device, theme, spec) {
  if (!referenceBundle) {
    throw new Error("reference capture: no bundle prepared — build it before mounting");
  }
  const referenceCss = REFERENCE_CSS_FILES.map((file) => readFileSync(file, "utf8")).join("\n");
  const host = join(referenceBundle.work, `host-${spec.view}-${device.id}-${theme}.html`);
  writeFileSync(host, referenceHostHtml(device, theme, referenceCss));
  await page.goto(pathToFileURL(host).href, { waitUntil: "load" });
  const ready = await page.evaluate((mountSpec) => window.__mountReference(mountSpec), spec);
  if (!ready) return null;
  return page.$("#shot > .pm-root");
}

// ───────────────────────────────────────────────────────────────────
// 4. REGISTRY
// ───────────────────────────────────────────────────────────────────

// The files a reference capture depicts: the vendored view modules and their stylesheets,
// the fixture that converts our bench rows into the reference's shape, and the stand-ins
// that make the vendored tree bundleable. Together they decide which captures a source
// change invalidates.
const REFERENCE_SHARED_SOURCES = [
  "tools/live/reference-assertion-bundle.mjs",
  "tools/live/reference-mount.ts",
  "tools/live/reference-temporal-shim.mjs",
  "tools/screenshots/reference-scenarios.mjs",
  "tools/storybook/obsidian-stub.mjs",
  "tools/storybook/obsidian-dom-shim.mjs",
  "tools/bench/reference-fixture.ts",
  "src/data/calendar-date-time.ts",
  ...REFERENCE_CSS_RELATIVE,
];

const KANBAN_SOURCES = [
  "specs/context/obsidian-pm-main/src/views/KanbanView.ts",
  "specs/context/obsidian-pm-main/src/ui/composites/KanbanColumn.ts",
  "specs/context/obsidian-pm-main/src/ui/composites/KanbanCard.ts",
  "tools/bench/board-render-bench.ts",
];

const GANTT_SOURCES = [
  "specs/context/obsidian-pm-main/src/views/gantt/GanttView.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/GanttHeaderRenderer.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/GanttRenderer.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/GanttTaskBarRenderer.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/GanttDragHandler.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/GanttLinkHandler.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/TaskLabelRenderer.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/TimelineConfig.ts",
  "tools/bench/timeline-render-bench.ts",
];

function referenceScenario(view, opts) {
  return {
    id: `reference-${view}`,
    title: opts.title,
    // The group names the output directory (screenshots/project-manager/, after the plugin
    // being photographed rather than the role it plays here) and the README section; the
    // explicit viewport capture keeps the full view inside the device frame instead of
    // cropping to content, the same choice the constructed views make.
    group: "project-manager",
    capture: "viewport",
    kind: "reference",
    renderer: opts.renderer,
    // The constructed scenario this reference picture is the mirror of, so the manifest
    // records the pairing a reviewer is meant to read.
    referenceOf: opts.referenceOf,
    sources: opts.sources,
    note: opts.note,
    mount: async (page, device, theme) =>
      mountReference(page, device, theme, { view: opts.view, subtask: Boolean(opts.subtask) }),
  };
}

export const REFERENCE_SCENARIOS = [
  referenceScenario("kanban", {
    view: "kanban",
    renderer: "pm-kanban",
    referenceOf: "constructed-board",
    title: "Project Manager kanban (reference)",
    sources: [...KANBAN_SOURCES, ...REFERENCE_SHARED_SOURCES],
    note: "The vendored Project Manager plugin's own KanbanView, mounted through the shared "
      + "obsidian stub over the board bench's rows converted into its Task shape. Read beside "
      + "constructed-board: the same titles, statuses, dates, priority tiers, hours and "
      + "assignees. The tag row stays empty on both sides — our card matches a tags column by "
      + "name and the bench carries none.",
  }),
  referenceScenario("gantt", {
    view: "gantt",
    renderer: "pm-gantt",
    referenceOf: "constructed-timeline",
    title: "Project Manager gantt (reference)",
    sources: [...GANTT_SOURCES, ...REFERENCE_SHARED_SOURCES],
    note: "The vendored GanttView at its week scale over the timeline bench's rows converted "
      + "into its Task shape: bars, the milestone diamond, dependency arrows and the today "
      + "line. Read beside constructed-timeline.",
  }),
  referenceScenario("kanban-subtask", {
    view: "kanban",
    subtask: true,
    renderer: "pm-kanban",
    referenceOf: "constructed-board-subtask",
    title: "Project Manager kanban — subtask tree (reference)",
    sources: [...KANBAN_SOURCES, ...REFERENCE_SHARED_SOURCES],
    note: "The same kanban with the first three rows wired into a parent with two children "
      + "and the config's kanbanShowSubtasks on, so the subtask cards carry the parent chip "
      + "the way constructed-board-subtask draws its tree.",
  }),
  referenceScenario("gantt-subtask", {
    view: "gantt",
    subtask: true,
    renderer: "pm-gantt",
    referenceOf: "constructed-timeline-subtask",
    title: "Project Manager gantt — subtask tree (reference)",
    sources: [...GANTT_SOURCES, ...REFERENCE_SHARED_SOURCES],
    note: "The same gantt over the tree-wired rows: the nested children render as indented "
      + "label rows with collapse toggles, beside constructed-timeline-subtask.",
  }),
];

// Every referenceOf must name a constructed scenario that actually exists, or the pair a
// reviewer is told to read falls apart silently. Two scenarios sharing an id would
// silently overwrite one another's PNG, the same refusal the other registries carry.
const constructedIds = new Set(CONSTRUCTED_SCENARIOS.map((scenario) => scenario.id));
const seen = new Set();
for (const scenario of REFERENCE_SCENARIOS) {
  if (seen.has(scenario.id)) throw new Error(`Duplicate reference scenario id: ${scenario.id}`);
  seen.add(scenario.id);
  if (!constructedIds.has(scenario.referenceOf)) {
    throw new Error(`reference scenario "${scenario.id}" declares referenceOf `
      + `"${scenario.referenceOf}" — no constructed scenario carries that id`);
  }
}
