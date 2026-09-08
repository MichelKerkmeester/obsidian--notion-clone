// ───────────────────────────────────────────────────────────────────
// MODULE:    consolidation.test
// COMPONENT: the registry that keeps the harnesses on one fixture dataset
// ───────────────────────────────────────────────────────────────────
//
// Ten generated databases, each with its own use-case id, was how the
// environments grew; every new lane mounted whichever of the ten it liked, and
// nothing checked that the mounts agreed. The consolidated rule is the
// opposite: the catalogue builds ONE testbed database, the render-assertion
// registries mount that one, and the cold-cache Finance fixture stands
// alongside as the second, operator-shaped dataset. This file is the check
// that keeps it that way — each assertion here is the answer to "which
// dataset does this lane read", written down where the next new lane will
// trip over it.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { buildCatalogue, WRITTEN_FACETS } from "./catalogue.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const LIVE = join(HERE, "..", "live");

/** Every lane that names the use case it mounts, by file. A new registry that
 *  mounts catalogue data joins this list, or this suite cannot see it. */
const REGISTRIES = [
  "render-assertions.mjs",
  "render-assertion-bundle.mjs",
].map((name) => join(LIVE, name));

const COLD_CACHE = join(LIVE, "database-cold-cache-property-read.mjs");

/** The view types the plugin still renders. List and gallery were removed from
 *  the tree (src/data/list-migration.ts, src/data/gallery-migration.ts), so a
 *  fixture view of either would be configuration for a surface nothing paints. */
const SURVIVING_VIEW_TYPES = ["table", "board", "calendar", "timeline", "chart"];

/** Everything a record note's frontmatter can carry — the facets the catalogue
 *  does not derive from the file itself. */
const NON_DERIVED_FACETS = WRITTEN_FACETS;

const catalogue = buildCatalogue();

// ───────────────────────────────────────────────────────────────────
// 2. THE ONE DATASET
// ───────────────────────────────────────────────────────────────────

describe("one consolidated fixture dataset", () => {
  it("is the only database the catalogue builds, and it is the testbed", () => {
    expect(catalogue.useCases).toHaveLength(1);
    expect(catalogue.useCases[0].id).toBe("testbed");
  });

  it("is the only use case the assertion registries mount", () => {
    for (const file of REGISTRIES) {
      const text = readFileSync(file, "utf8");
      const mounts = [...text.matchAll(/catalogueUseCase:\s*"([^"]+)"/g)].map((match) => match[1]);
      expect(mounts.length, `${file} never names its mount, so this suite cannot police it`).toBeGreaterThan(0);
      for (const id of mounts) {
        expect(id, `${file} mounts the use case "${id}"`).toBe("testbed");
      }
    }
  });

  it("keeps the cold-cache Finance fixture as the second, kept dataset", () => {
    const text = readFileSync(COLD_CACHE, "utf8");
    expect(text, "the Finance-shaped database note is gone from the cold-cache fixture").toContain('id: "finance-reports-fixture"');
    expect(text, "the Testbed-shaped board note is gone from the cold-cache fixture").toContain('id: "testbed-fixture"');
    expect((text.match(/Finance\/Reports\//g) ?? []).length, "the Finance report rows are gone").toBeGreaterThanOrEqual(6);
    expect((text.match(/Testbed\/Cards\//g) ?? []).length, "the Testbed card rows are gone").toBeGreaterThanOrEqual(4);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. WHAT THE ONE DATASET COVERS
// ───────────────────────────────────────────────────────────────────

describe("the consolidated testbed covers the surfaces", () => {
  const testbed = catalogue.useCases[0];

  it("declares only surviving view types, with a second, filtered and sorted table", () => {
    expect(testbed.views.map((view) => view.type)).toEqual(
      ["table", "board", "calendar", "timeline", "chart", "table"],
    );
    for (const view of testbed.views) {
      expect(SURVIVING_VIEW_TYPES, `${view.name} is of type "${view.type}"`).toContain(view.type);
    }
    const sorted = testbed.views.find((view) => view.sort);
    expect(sorted, "no view carries a sort").toBeTruthy();
    expect(sorted?.filter, "the sorted view carries no filter").toBeTruthy();
  });

  it("fills every non-derived facet on its deliberately full record", () => {
    const full = testbed.records[0];
    for (const facet of NON_DERIVED_FACETS) {
      const value = full.values[facet];
      const filled = value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0);
      expect(filled, `facet "${facet}" is empty on the full record "${full.id}"`).toBe(true);
    }
  });

  it("keeps exactly one record deliberately sparse", () => {
    const sparse = testbed.records.filter((record) => Object.keys(record.values).length === 0);
    expect(sparse, "the deliberately sparse record is missing or no longer alone").toHaveLength(1);
  });
});
