// ───────────────────────────────────────────────────────────────────
// MODULE:    gallery-hide-and-migrate.test
// COMPONENT: the retirement's remaining host wiring — what still accepts a persisted gallery on
//            purpose, what no longer re-blesses one on settings load, and where an existing one is
//            redirected on open in both render hosts
// ───────────────────────────────────────────────────────────────────
//
// The gallery renderer needs a live Obsidian App, so the surfaces that host it are asserted on the
// source they ship, the same way the list retirement's equivalent suite keeps the picker and its
// fixture in step. Two of the pins below are NEGATIVE on purpose: the two pickers already withdrew
// gallery before this phase started, and the parser that reads a vault file's frontmatter must keep
// accepting the value so the on-open migration below ever gets a view to convert — closing it would
// coerce a persisted gallery straight to a table before either host had a chance to carry the cover.

/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading the shipped source from disk needs the node builtins the plugin runtime rule forbids.
   Scoped to this suite, which never ships. */

// ───────────────────────────────────────────────────────────────────
// 1. SOURCE COLLECTION
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const read = (relative: string): string => readFileSync(resolve(__dirname, relative), "utf-8");

const mainSource = read("../main.ts");
const toolbarSource = read("./toolbar-renderer.ts");
const viewConfigPanelSource = read("./view-config-panel-renderer.ts");
const dataSourceSource = read("../data/data-source.ts");
const databaseViewSource = read("./database-view.ts");
const embeddedSource = read("./embedded-database-renderer.ts");

// ───────────────────────────────────────────────────────────────────
// 2. THE PICKERS — ALREADY CLOSED, PINNED HERE
// ───────────────────────────────────────────────────────────────────

describe("no picker offers gallery", () => {
  it("withdraws gallery from the add-view and view-type menus, with the escape hatch", () => {
    expect(toolbarSource).toContain('option.value !== "gallery" || current === "gallery"');
  });

  it("withdraws gallery from the view-config panel's type picker, with the escape hatch", () => {
    expect(viewConfigPanelSource).toContain('option.value !== "gallery" || config.viewType === "gallery"');
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. THE SETTINGS-LOAD SANITIZER NO LONGER RE-BLESSES A PERSISTED GALLERY
// ───────────────────────────────────────────────────────────────────

describe("the settings-load sanitizer stops exempting gallery", () => {
  it("no longer leaves a loaded gallery view as a gallery", () => {
    // The exemption used to read: v.viewType !== "board" && v.viewType !== "gallery" && ... — a
    // gallery survived settings load unchanged. It must not any more, in either sanitizer site.
    const sanitizerLines = mainSource.split("\n").filter((line) => line.includes('viewType !== "board"') && line.includes('!== "chart"'));
    expect(sanitizerLines.length).toBeGreaterThanOrEqual(2);
    for (const line of sanitizerLines) {
      expect(line).not.toContain('!== "gallery"');
    }
  });

  it("converts a loaded gallery to a board through the real migration rather than the bare unknown-type fallback", () => {
    // Closing the exemption the way list's was closed would coerce straight to "table" and strand
    // the cover field before the on-open migration ever ran. The sanitizer must call the same
    // plan/apply pair the render hosts use, not merely stop special-casing the string.
    expect(mainSource).toContain("planGalleryMigration");
    expect(mainSource).toContain("applyGalleryMigration");
  });
});

// ───────────────────────────────────────────────────────────────────
// 3B. THE .BASE IMPORTER — ALREADY FIXED, PINNED AGAINST A SILENT REGRESSION
// ───────────────────────────────────────────────────────────────────

describe("the .base importer keeps landing a cards view on board", () => {
  it("still maps a .base cards view to board rather than reintroducing a gallery landing", () => {
    const viewTypeLine = mainSource.split("\n").find((line) => line.includes('bv.type === "cards" ? "board"'));
    expect(viewTypeLine).toBeDefined();
    expect(viewTypeLine).toContain('? "board" : "table"');
  });

  it("still carries the imported image field onto the board's own field through the schema guard", () => {
    expect(mainSource).toContain("view.boardImageField = importedGalleryImageField");
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE SECOND ACCEPTING SURFACE STAYS OPEN, ON PURPOSE
// ───────────────────────────────────────────────────────────────────

describe("the frontmatter parser keeps accepting a persisted gallery", () => {
  it("still parses viewType: gallery from a db_view file rather than coercing it at read time", () => {
    // 001's audit found this as the second accepting surface and recommended it stay open: closing
    // it here would strand the cover the same way closing the sanitizer naively would. The on-open
    // migration in both hosts is what actually redirects it.
    const parseViewTypeStart = dataSourceSource.indexOf("private parseViewType(");
    expect(parseViewTypeStart).toBeGreaterThanOrEqual(0);
    const parseViewTypeEnd = dataSourceSource.indexOf("\n  private ", parseViewTypeStart + 1);
    const body = parseViewTypeEnd === -1 ? dataSourceSource.slice(parseViewTypeStart) : dataSourceSource.slice(parseViewTypeStart, parseViewTypeEnd);
    expect(body).toContain('"gallery"');
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. THE MIGRATION HOOKS RUN IN BOTH HOSTS
// ───────────────────────────────────────────────────────────────────

describe("the migration runs on open in both hosts, once, with a notice", () => {
  it("imports and runs the gallery migration in the file view, keyed by database so the notice can persist", () => {
    expect(databaseViewSource).toContain("planGalleryMigration");
    expect(databaseViewSource).toContain("migrateGalleryViewOnOpen");
    expect(databaseViewSource).toContain("galleryMigrationNotices");
  });

  it("imports and runs the gallery migration on the embed path, the host that has never had it", () => {
    expect(embeddedSource).toContain("planGalleryMigration");
    expect(embeddedSource).toContain("migrateGalleryViewOnOpen");
    expect(embeddedSource).toContain("galleryMigrationNotices");
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. THE RENDERER ITSELF IS UNTOUCHED — 003'S JOB, NOT THIS PHASE'S
// ───────────────────────────────────────────────────────────────────

describe("the gallery renderer keeps working for a view not yet migrated", () => {
  it("still dispatches to the gallery renderer in the file view", () => {
    expect(databaseViewSource).toMatch(/viewType === "gallery"/);
  });

  it("still dispatches to the gallery renderer on the embed path", () => {
    expect(embeddedSource).toMatch(/viewType === "gallery"/);
  });
});
