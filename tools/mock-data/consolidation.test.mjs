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

/** No lane mounts a view of these types from the catalogue any more: the
 *  testbed's view set is a table and a board, and a lane that wants another
 *  surface builds its own view config rather than borrowing one from the
 *  fixture. */
const RETIRED_VIEW_TYPES = ["list", "gallery", "calendar", "timeline", "chart"];

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

  it("carries no view of a retired type and no second table", () => {
    for (const view of catalogue.useCases[0].views) {
      expect(RETIRED_VIEW_TYPES, `${view.name} is of type "${view.type}"`).not.toContain(view.type);
    }
    expect(catalogue.useCases[0].views.filter((view) => view.type === "table"), "exactly one table view").toHaveLength(1);
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

  it("declares exactly one table view and one board view, and nothing else", () => {
    // The operator's ruling: the testbed database is a table and a board. The
    // other view types still render elsewhere, but the fixture the harnesses
    // mount no longer configures them, so a lane that wants a calendar or a
    // chart mounts its own view rather than borrowing one from this dataset.
    expect(testbed.views.map((view) => view.type)).toEqual(["table", "board"]);
  });

  it("keeps the table the everything-shown default and the board grouped by status", () => {
    expect(testbed.views[0].type).toBe("table");
    expect(testbed.views[0].sort, "the table carries a sort").toBeUndefined();
    expect(testbed.views[0].filter, "the table carries a filter").toBeUndefined();
    expect(testbed.views[1].type).toBe("board");
    expect(testbed.views[1].groupField, "the board groups by status").toBe("status");
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
