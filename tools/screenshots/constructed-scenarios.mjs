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

function constructedScenario(view, opts) {
  // captureData is the harness's own opt-in (render-assertion-harness.ts's ScenarioSpec): a
  // small "mixed"-type dataset sized like the hand-written fixtures rather than the 1600-2000-row
  // structural-cost shape the assertion/touch-target/unstyled-links lanes measure. A capture
  // exists to show what the shipped types render as, so it is the one caller that turns this on.
  const spec = {
    renderer: opts.renderer,
    bag: "file-view",
    ...(opts.scale ? { scale: opts.scale } : {}),
    captureData: true,
  };
  return {
    id: `constructed-${view}`,
    title: opts.title,
    group: "views",
    sources: opts.sources,
    renderer: opts.renderer,
    bag: "file-view",
    ...(opts.scale ? { scale: opts.scale } : {}),
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
    note: "The shipped table renderer at the bench's sixteen-column, 2000-row shape.",
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
];

// Two scenarios sharing an id would silently overwrite one another's PNG and leave the manifest
// describing whichever ran last — the same refusal the fixture registry already carries.
const seen = new Set();
for (const scenario of CONSTRUCTED_SCENARIOS) {
  if (seen.has(scenario.id)) throw new Error(`Duplicate constructed scenario id: ${scenario.id}`);
  seen.add(scenario.id);
  validateConstructedScenario(scenario);
}
