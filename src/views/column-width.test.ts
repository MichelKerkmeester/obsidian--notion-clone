// ───────────────────────────────────────────────────────────────────
// MODULE:    column-width
// COMPONENT: the width-adjuster sheet that resizes a table column
// ───────────────────────────────────────────────────────────────────
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
import { getFieldWidth } from "./column-width";
import type { ColumnDef, ViewConfig } from "../data/types";

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURES
// ───────────────────────────────────────────────────────────────────

const col = (key: string, width?: number): ColumnDef =>
  ({ key, label: key, type: "text", ...(width == null ? {} : { width }) }) as ColumnDef;

const config = (over: Partial<ViewConfig> = {}): ViewConfig => ({ ...over }) as ViewConfig;

// ───────────────────────────────────────────────────────────────────
// 3. STORED WIDTHS
// ───────────────────────────────────────────────────────────────────

describe("getFieldWidth", () => {
  it("prefers a per-view stored width over the column's own", () => {
    const fields = [col("cost", 110)];
    expect(getFieldWidth(config({ columnWidths: { cost: 240 } }), fields[0])).toBe(240);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE WIDTH ADJUSTER IS A SHARED SHEET ON A PHONE
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
