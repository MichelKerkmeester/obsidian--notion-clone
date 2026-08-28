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

function collectSources(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectSources(full, acc);
    else if (entry.endsWith(".ts")) acc.push(readFileSync(full, "utf8"));
  }
  return acc;
}

// Scenario markup lives in one module per surface family, so the guard has to read the
// whole directory; reading only the aggregator would scan no markup and pass vacuously.
const scenarioDir = join(REPO, "tools/screenshots/scenarios");
const scenarios = readdirSync(scenarioDir)
  .filter((f) => f.endsWith(".mjs"))
  .map((f) => readFileSync(join(scenarioDir, f), "utf8"))
  .join("\n");
const stylesheet = readFileSync(join(REPO, "styles.css"), "utf8");
const sourceText = collectSources(join(REPO, "src")).join("\n");

/** Every plugin-ish class the fixtures put in the DOM, ignoring interpolated names. */
function fixtureClasses(): string[] {
  const found = new Set<string>();
  for (const match of scenarios.matchAll(/class="([^"]+)"/g)) {
    for (const cls of match[1].split(/\s+/)) {
      if (!cls || cls.includes("${")) continue;
      if (cls.startsWith("db-") || cls.startsWith("note-database") || cls.startsWith("status-")) {
        found.add(cls);
      }
    }
  }
  return [...found].sort();
}

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
    const invented = fixtureClasses().filter(
      (cls) => !stylesheet.includes(`.${cls}`) && !sourceText.includes(cls)
    );
    expect(invented).toEqual([]);
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
