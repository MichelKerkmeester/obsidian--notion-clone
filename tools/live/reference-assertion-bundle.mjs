// ───────────────────────────────────────────────────────────────────
// MODULE:    reference-assertion-bundle
// COMPONENT: the esbuild step that turns the vendored reference views into a browser bundle
// ───────────────────────────────────────────────────────────────────
//
// The reference captures photograph the vendored Project Manager plugin
// (specs/context/obsidian-pm-main), whose views were never built to run outside Obsidian.
// This is the one build step that makes them: the same obsidian stub and DOM shim the
// plugin-under-test's own bundles use (so the two sides of a comparison stand on the same
// stand-in), plus a stand-in for `temporal-polyfill`, the reference's one external
// dependency, which this repository does not install. The mount driver lives in
// reference-mount.ts; the caller's entry body is appended underneath the shared preamble
// and decides what the bundle exposes on `window`.
//
// The vendored tree is read-only: nothing here patches it, and the build fails rather
// than proceeding if the bundle stopped importing a view module — a capture that
// photographs a copy instead of the vendored renderer would prove the copy.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { mkdtempSync, writeFileSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const HERE = fileURLToPath(new URL(".", import.meta.url));

// ───────────────────────────────────────────────────────────────────
// 2. THE VENDORED SOURCES THE CAPTURE MUST HAVE BEEN BUILT FROM
// ───────────────────────────────────────────────────────────────────

// Every reference view module the capture's picture depends on, in the built bundle's own
// path form. The metafile is checked against this list so a refactor of the vendored tree
// that stops a module from being imported fails the capture run instead of silently
// photographing whatever the tree still builds.
export const REFERENCE_RENDERER_SOURCES = [
  "specs/context/obsidian-pm-main/src/views/KanbanView.ts",
  "specs/context/obsidian-pm-main/src/ui/composites/KanbanColumn.ts",
  "specs/context/obsidian-pm-main/src/ui/composites/KanbanCard.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/GanttView.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/GanttHeaderRenderer.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/GanttRenderer.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/GanttTaskBarRenderer.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/GanttDragHandler.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/GanttLinkHandler.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/TaskLabelRenderer.ts",
  "specs/context/obsidian-pm-main/src/views/gantt/TimelineConfig.ts",
];

// ───────────────────────────────────────────────────────────────────
// 3. BUNDLE
// ───────────────────────────────────────────────────────────────────

// The obsidian resolution is the same plugin the assertion lanes' bundle uses; the
// temporal-polyfill alias points at the subset shim in this directory.
const referencePlugins = [
  {
    name: "obsidian-stub",
    setup(build) {
      build.onResolve({ filter: /^obsidian$/ }, () => ({
        path: resolve(HERE, "../storybook/obsidian-stub.mjs"),
      }));
    },
  },
  {
    name: "temporal-polyfill-stub",
    setup(build) {
      build.onResolve({ filter: /^temporal-polyfill$/ }, () => ({
        path: resolve(HERE, "reference-temporal-shim.mjs"),
      }));
    },
  },
];

/**
 * Builds the reference bundle. The preamble installs the DOM shim and imports the mount
 * driver; the caller's `entryBody` is appended underneath and decides what the bundle
 * exposes on `window` for the page to call.
 *
 * Returns the temp work directory, the bundle path, and `missingSources` — non-empty when
 * the bundle stopped importing a vendored view, which every caller must treat as a hard
 * failure rather than mounting DOM that does not prove what it claims to.
 */
export async function buildReferenceBundle(entryBody) {
  const work = mkdtempSync(join(tmpdir(), "reference-views-"));
  const entry = join(work, "reference-entry.ts");
  const bundlePath = join(work, "render-bundle.js");

  writeFileSync(entry, `
import { installObsidianDomShim } from "${resolve(HERE, "../storybook/obsidian-dom-shim.mjs")}";
import { mountReferenceView } from "${resolve(HERE, "reference-mount")}";

installObsidianDomShim(window);
${entryBody}
`);

  const built = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    format: "iife",
    outfile: bundlePath,
    plugins: referencePlugins,
    metafile: true,
    logLevel: "warning",
    absWorkingDir: REPO,
    // One tsconfig for the whole graph. Without this esbuild discovers the vendored tree's
    // own tsconfig.json, whose `extends` target is not installed here, and prints a warning
    // per file; our own config carries the module settings the whole graph shares anyway.
    tsconfig: join(REPO, "tsconfig.json"),
  });

  // The entry lives in a tmp directory, so esbuild renders every repo file through a path
  // that climbs out of the work tree; comparing realpaths keeps the check honest on both
  // symlinked mounts and plain directories.
  const bundleInputs = new Set(
    Object.keys(built.metafile.inputs)
      .map((input) => {
        try {
          return realpathSync(join(REPO, input));
        } catch {
          return null;
        }
      })
      .filter(Boolean),
  );
  const missingSources = REFERENCE_RENDERER_SOURCES.filter((source) => {
    try {
      return !bundleInputs.has(realpathSync(join(REPO, source)));
    } catch {
      return true;
    }
  });

  return { work, bundlePath, missingSources };
}
