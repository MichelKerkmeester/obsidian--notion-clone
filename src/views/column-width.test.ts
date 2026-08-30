// ───────────────────────────────────────────────────────────────────
// MODULE:    column-width
// COMPONENT: the track list a list row's field area is laid out on
// ───────────────────────────────────────────────────────────────────
//
// The list renderer omits a field whose value is empty. Before these tracks
// existed the surviving fields flowed, so the first slot held whichever
// property happened to survive and no column could be read down a list.
//
// The track list is built from every column rather than from the survivors,
// and that distinction is the whole fix — a version built from the survivors
// renders identically wherever the data is complete, which is every fixture
// that existed when the defect was found.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   The placeholder is a renderer decision rather than a return value, so reading the shipped file
   needs the node builtins the plugin runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
import { getFieldWidth, listFieldTrackTemplate } from "./column-width";
import type { ColumnDef, ViewConfig } from "../data/types";

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURES
// ───────────────────────────────────────────────────────────────────

const col = (key: string, width?: number): ColumnDef =>
  ({ key, label: key, type: "text", ...(width == null ? {} : { width }) }) as ColumnDef;

const config = (over: Partial<ViewConfig> = {}): ViewConfig => ({ ...over }) as ViewConfig;

// ───────────────────────────────────────────────────────────────────
// 3. TRACK TESTS
// ───────────────────────────────────────────────────────────────────

describe("list field tracks", () => {
  it("gives every column its own track, in declaration order", () => {
    const fields = [col("cost"), col("renew"), col("payment")];
    expect(listFieldTrackTemplate(config(), fields)).toBe("150px 150px 150px");
  });

  it("carries each column's own width rather than one width for all of them", () => {
    // The defect this replaced sized every track from a single container-level value, so a resized
    // column overflowed the slot it was given while its neighbours kept the default.
    const fields = [col("cost", 110), col("renew", 190), col("payment")];
    expect(listFieldTrackTemplate(config(), fields)).toBe("110px 190px 150px");
  });

  it("prefers a per-view stored width over the column's own", () => {
    const fields = [col("cost", 110)];
    expect(listFieldTrackTemplate(config({ columnWidths: { cost: 240 } }), fields)).toBe("240px");
    expect(getFieldWidth(config({ columnWidths: { cost: 240 } }), fields[0])).toBe(240);
  });

  it("emits a track for a column the renderer will skip", () => {
    // A row whose second value is empty renders two fields against three tracks. Building the list
    // from the rendered fields instead would pull every later column one slot left on that row.
    const declared = [col("cost"), col("renew"), col("payment")];
    const rendered = [declared[0], declared[2]];
    expect(listFieldTrackTemplate(config(), declared).split(" ")).toHaveLength(3);
    expect(listFieldTrackTemplate(config(), rendered).split(" ")).toHaveLength(2);
  });

  it("has nothing to lay out when a view shows only its title", () => {
    expect(listFieldTrackTemplate(config(), [])).toBe("");
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE TRACK LIST IS ONLY HALF OF IT
// ───────────────────────────────────────────────────────────────────

describe("an empty property holds its column instead of leaving the row", () => {
  // A grid track only decides anything where the row is a grid. On a phone the same element is a
  // wrapping flex line, and `grid-column` means nothing there, so an omitted property pulls every
  // later one left. The renderer therefore reserves the column instead of skipping it — a decision
  // no track list can express.
  //
  // These read the source, which is the weaker half. The property itself is measured on the
  // renderer's own output in verify-placement, which renders the real thing in a browser and reads
  // back x-positions; that is what would catch this changing, and these would not.
  const renderer = readFileSync(resolve(__dirname, "./list-renderer.ts"), "utf8");
  const fixtures = readFileSync(
    resolve(__dirname, "../../tools/screenshots/scenarios/core.mjs"), "utf8"
  );

  it("reserves the column instead of skipping it", () => {
    expect(renderer, "an empty property still produces an element that can claim a column")
      .toContain("is-placeholder");
    expect(
      /if \(empty && config\.showEmptyFields !== true\) continue;/.test(renderer),
      "the old skip is gone — with it the field never exists and has no column to claim"
    ).toBe(false);
  });


  it("keeps the sparse fixture rendering what the renderer renders", () => {
    // The fixture is the only place a row missing a subset of its properties is photographed or
    // measured. A fixture that still drops the field would show a row the renderer stopped
    // building, and would take the phone defect out of reach of every check.
    expect(fixtures).toContain("is-placeholder");
  });
});
