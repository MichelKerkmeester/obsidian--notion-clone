// ───────────────────────────────────────────────────────────────────
// MODULE:    column-width
// COMPONENT: the track list a list row's field area is laid out on, and
//            the width-adjuster sheet that resizes a table column
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
//
// The adjuster half of this suite asserts against source text rather than a
// rendered DOM because the real renderer needs a live Obsidian App, vault
// and metadata cache. That buys a cheap regression guard and nothing more:
// a rule can satisfy every check here and still look wrong on a device.

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

// ───────────────────────────────────────────────────────────────────
// 5. THE WIDTH ADJUSTER IS A SHARED SHEET ON A PHONE
// ───────────────────────────────────────────────────────────────────

const columnWidthSource = readFileSync(resolve(__dirname, "./column-width.ts"), "utf8");
const databaseViewSource = readFileSync(resolve(__dirname, "./database-view.ts"), "utf8");

describe("the column-width adjuster presents as a shared bottom sheet on a phone", () => {
  it("lives in the column-width module with the rest of the width logic", () => {
    expect(columnWidthSource).toContain("export function openColumnWidthAdjuster");
  });

  it("routes the phone presentation through the shared sheet host lifecycle", () => {
    // The sheet chrome, its placement and its entrance are the same calls the owned menus make,
    // so a phone adjuster cannot drift from the other sheets about what a sheet is.
    expect(columnWidthSource).toMatch(/applySheetChrome\(panel, true/);
    expect(columnWidthSource).toContain("placeSheet(panel)");
    expect(columnWidthSource).toContain("keepSheetPlaced(panel)");
    expect(columnWidthSource).toContain("playSheetEntrance(panel)");
    expect(columnWidthSource).toContain("attachSheetDragToDismiss(panel, close)");
    // The overlay stack owns dismissal: Escape and a tap on the scrim both close through it.
    expect(columnWidthSource).toContain("installPopoverAutoClose");
  });

  it("emits the shared sheet header: title row and a close control with the shared glyph", () => {
    expect(columnWidthSource).toContain('cls: "db-panel-header"');
    expect(columnWidthSource).toContain('cls: "db-panel-title"');
    expect(columnWidthSource).toContain('t("columnWidth.adjustTitle"');
    expect(columnWidthSource).toContain('cls: "db-cell-edit-close"');
    expect(columnWidthSource).toContain('setIcon(closeBtn, "x")');
    expect(columnWidthSource).toContain('"aria-label": t("common.close")');
  });

  it("puts the slider and the typed value in one shared range row, not a floating pill", () => {
    expect(columnWidthSource).toContain('cls: "db-panel-row"');
    expect(columnWidthSource).toContain('cls: "db-view-config-range"');
    expect(columnWidthSource).toContain('cls: "db-view-config-number"');
    // The bare strip's own vocabulary is gone from both files; the shared range control replaced
    // the custom slider, value pill and title.
    expect(columnWidthSource).not.toContain("db-mobile-column-width-title");
    expect(columnWidthSource).not.toContain("db-mobile-column-width-slider");
    expect(columnWidthSource).not.toContain("db-mobile-column-width-value-row");
    expect(databaseViewSource).not.toContain("db-mobile-column-width-title");
    expect(databaseViewSource).not.toContain("db-mobile-column-width-value-row");
  });

  it("renders the four presets as the shared exclusive-choice group with a selected state", () => {
    // The same radio group the new-record placement uses: equal options, one selected.
    expect(columnWidthSource).toContain('cls: "db-new-placement"');
    expect(columnWidthSource).toContain('"db-new-placement-option"');
    expect(columnWidthSource).toContain('role: "radio"');
    expect(columnWidthSource).toContain('"aria-checked"');
    expect(columnWidthSource).toContain('"is-active"');
    for (const key of ["auto", "narrow", "medium", "wide"]) {
      expect(columnWidthSource).toContain(`columnWidth.${key}`);
    }
  });

  it("keeps the behaviours: presets pin a width, Auto clears it, the slider live-resizes", () => {
    expect(columnWidthSource).toContain("syncTableColumnLayouts");
    expect(columnWidthSource).toMatch(/delete\s+next\[col\.key\]/);
    expect(columnWidthSource).toMatch(/slider\.oninput/);
  });

  it("keeps the desktop presentation on the same body markup", () => {
    expect(columnWidthSource).toContain('cls: "db-mobile-column-width-backdrop"');
    expect(columnWidthSource).toContain('cls: "db-mobile-column-width-panel"');
  });

  it("gives the panel the container class its shared classes need to match", () => {
    // The panel is created on doc.body directly and never takes setSheetMount's move branch on
    // either presentation, so without this the db-panel-header/db-panel-row/db-view-config-*/
    // db-new-placement rules above match nothing — every one of them is written
    // ".note-database-container .db-thing" — and the shared body would render unstyled.
    expect(columnWidthSource).toContain('panel.addClass("note-database-container")');
  });
});
