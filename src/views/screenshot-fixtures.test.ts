// ───────────────────────────────────────────────────────────────────
// MODULE:    screenshot-fixtures.test
// COMPONENT: guards the screenshot scenario registry against fixtures
//            that photograph classes the plugin never actually emits
// ───────────────────────────────────────────────────────────────────
//
// A fixture class that exists in no stylesheet and no source file is
// invented markup: the capture would show unstyled DOM while looking
// like a successful screenshot of a real surface. Reading the whole
// `src` tree (not just a class registry) is required because plugin
// classes are applied inline with `createDiv({ cls: ... })` rather than
// declared in one central list.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & FIXTURES
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading the stylesheet, the renderers and the scenario registry from disk needs the node
   builtins the plugin runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { describe, expect, it } from "vitest";

const REPO = resolve(__dirname, "..", "..");

/**
 * Shipped source only.
 *
 * Suites and stories were in here, and a suite that *names* a class in prose made that class
 * "exist" for the substring test below — this file's own comment about three invented classes was
 * enough to make the guard against them pass. Evidence that a class is real has to come from the
 * code that ships it.
 */
function collectSources(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectSources(full, acc);
    else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts") && !entry.endsWith(".stories.ts")) {
      acc.push(readFileSync(full, "utf8"));
    }
  }
  return acc;
}

/**
 * A class is real when something builds it or styles it, matched whole.
 *
 * Substring matching alone says `db-list-row-field` exists because `db-list-row-field-label` does,
 * and both of those were invented — so a family of invented names vouched for itself.
 */
const isRealClass = (cls: string, stylesheetText: string, source: string): boolean => {
  const whole = new RegExp(`(^|[^\\w-])${cls.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}(?![\\w-])`);
  return whole.test(stylesheetText) || whole.test(source);
};

// Scenario markup lives in one module per surface family, so the guard has to read the
// whole directory; reading only the aggregator would scan no markup and pass vacuously.
const scenarioDir = join(REPO, "tools/screenshots/scenarios");
const scenarios = readdirSync(scenarioDir)
  .filter((f) => f.endsWith(".mjs"))
  .map((f) => readFileSync(join(scenarioDir, f), "utf8"))
  .join("\n");
const stylesheet = readFileSync(join(REPO, "styles.css"), "utf8");
const sourceText = collectSources(join(REPO, "src")).join("\n");

/**
 * The measuring tools build their own markup too, and it rots the same way.
 *
 * The row-rhythm matrix in view-census.mjs synthesised rows from `db-list-row-field`,
 * `db-list-row-field-label` and `db-list-row-field-value`. Each has zero rules in the stylesheet
 * and zero creation sites in the source, so every height, deviation and spill count it reported was
 * a measurement of unstyled divs — a check that could not fail whatever the product did. The
 * fixtures had a guard for exactly this and the tools did not, which is the only reason it survived.
 */
const toolDirs = ["tools/live", "tools/storybook"];
const toolMarkup = toolDirs
  .flatMap((dir) => readdirSync(join(REPO, dir))
    .filter((f) => f.endsWith(".mjs"))
    .map((f) => readFileSync(join(REPO, dir, f), "utf8")))
  .join("\n");

/** Every plugin-ish class hand-written markup puts in the DOM, ignoring interpolated names. */
function markupClasses(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(/class="([^"]+)"/g)) {
    for (const cls of match[1].split(/\s+/)) {
      if (!cls || cls.includes("${")) continue;
      if (cls.startsWith("db-") || cls.startsWith("note-database") || cls.startsWith("status-")) {
        found.add(cls);
      }
    }
  }
  return [...found].sort();
}

const fixtureClasses = (): string[] => markupClasses(scenarios);

// ───────────────────────────────────────────────────────────────────
// 2. MANIFEST TYPES
// ───────────────────────────────────────────────────────────────────

interface ManifestEntry {
  id: string;
  sources: string[];
  sourceHashes: Record<string, string | null>;
}

interface Manifest {
  scenarios: ManifestEntry[];
}

function readManifest(): Manifest {
  return JSON.parse(readFileSync(join(REPO, "screenshots/manifest.json"), "utf8")) as Manifest;
}

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

describe("screenshot fixtures describe the real plugin", () => {
  it("uses no class the plugin does not actually emit or style", () => {
    // A fixture class that exists nowhere else is styled by nothing, so the capture shows
    // unstyled markup while looking like a successful screenshot. That is worse than no
    // screenshot: it documents a surface that does not exist.
    const invented = fixtureClasses().filter((cls) => !isRealClass(cls, stylesheet, sourceText));
    expect(invented).toEqual([]);
  });

  it("measures no class the plugin does not actually emit or style", () => {
    // Same rule, applied to the markup the measuring tools synthesise. A tool that measures a class
    // nothing builds produces numbers about nothing, and reports them in the same format as numbers
    // about the product.
    const invented = markupClasses(toolMarkup).filter((cls) => !isRealClass(cls, stylesheet, sourceText));
    expect(
      invented,
      `these are synthesised by a measuring tool and exist in neither the stylesheet nor the `
        + `source, so whatever it measured was unstyled markup: ${invented.join(", ")}`
    ).toEqual([]);
  });

  it("photographs every scenario the registry declares", () => {
    const manifest = readManifest();
    const ids = new Set<string>(manifest.scenarios.map((s) => s.id));
    const declared = [...scenarios.matchAll(/^\s{4}id: "([a-z0-9-]+)",$/gm)].map((m) => m[1]);
    expect(declared.length).toBeGreaterThan(0);
    for (const id of declared) expect(ids.has(id)).toBe(true);
  });

  it("records a source list for every captured shot", () => {
    const manifest = readManifest();
    for (const entry of manifest.scenarios) {
      // Without sources a shot can never be reported stale, so it would silently rot.
      expect(Array.isArray(entry.sources)).toBe(true);
      expect(entry.sources.length).toBeGreaterThan(0);
      expect(Object.keys(entry.sourceHashes || {}).length).toBeGreaterThan(0);
    }
  });
});
