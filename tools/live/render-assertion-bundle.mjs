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
  { name: "calendar-week/file-view", renderer: "calendar", bag: "file-view", scale: "week" },
  { name: "calendar-week/embed", renderer: "calendar", bag: "embed", scale: "week" },
  { name: "calendar-day/file-view", renderer: "calendar", bag: "file-view", scale: "day" },
  { name: "calendar-day/embed", renderer: "calendar", bag: "embed", scale: "day" },
  { name: "timeline/file-view", renderer: "timeline", bag: "file-view" },
  { name: "timeline/embed", renderer: "timeline", bag: "embed" },
  { name: "chart/file-view", renderer: "chart", bag: "file-view" },
];

export const RENDERER_SOURCES = [
  "src/views/list-renderer.ts",
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
