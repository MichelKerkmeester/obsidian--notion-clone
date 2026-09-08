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
import { estimateAutoColumnWidth, getFieldWidth } from "./column-width";
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
// 4. AUTO-FIT READS THE SAME WRAP STATE THE CELL PAINTS
// ───────────────────────────────────────────────────────────────────
//
// A wrapping column is sized to its header and left to spend the height; a clipped one is sized to
// its widest value. Reading the column's mode alone made auto-fit answer that question differently
// from the cell renderer as soon as the view's switch was off, and a long-text column arrived
// header-narrow in a table that clips it — the widths and the paint disagreeing about the same
// cell. The value here is long enough that the two answers cannot be confused.

const longRows = [{ file: { path: "n.md" }, frontmatter: {}, computed: {} }] as unknown as Parameters<typeof estimateAutoColumnWidth>[1];
const longText = "A journal entry long enough that a column sized to its widest value cannot be mistaken for one sized to its header";

function autoWidth(wrap: boolean | undefined, viewWrapText: boolean | undefined): number {
  const column = { key: "notes", label: "Journal", type: "text", wrap } as ColumnDef;
  return estimateAutoColumnWidth(column, longRows, () => longText, undefined, viewWrapText);
}

describe("estimateAutoColumnWidth resolves wrap the way the cell renderer does", () => {
  it("sizes a Wrap column to its value while the view switch is off", () => {
    expect(autoWidth(true, false)).toBeGreaterThan(autoWidth(true, true));
  });

  it("sizes Wrap and Follow columns alike once the switch is on", () => {
    expect(autoWidth(true, true)).toBe(autoWidth(undefined, true));
  });

  it("keeps a Clip column sized to its value with the switch on", () => {
    expect(autoWidth(false, true)).toBe(autoWidth(true, false));
  });
});

// ───────────────────────────────────────────────────────────────────
// 4a. THE MULTI-SELECT CHIP MEASURER'S CAP
// ───────────────────────────────────────────────────────────────────
//
// estimateCellContentWidth's multi-select branch mins the badge sum against 560, so a column
// carrying dozens of long option values never grows past a table anybody could still use.
// Nothing asserted this before: removing the cap left vitest and render-assertions both green.
// The two cases bound it from both sides — a short chip set sizes to its own content, well under
// 560, and a long one collapses to exactly 560 rather than growing further — so a cap widened,
// dropped, or never applied goes red against either row.

const multiSelectRows = (values: string[]) =>
  [{ file: { path: "n.md" }, frontmatter: { categories: values }, computed: {} }] as unknown as
    Parameters<typeof estimateAutoColumnWidth>[1];

function multiSelectWidth(values: string[]): number {
  const column = { key: "categories", label: "Tags", type: "multi-select" } as ColumnDef;
  return estimateAutoColumnWidth(column, multiSelectRows(values), () => "");
}

describe("estimateAutoColumnWidth caps the multi-select chip measurer at 560", () => {
  it("sizes a short chip set to its own content, well under the cap", () => {
    const width = multiSelectWidth(["ok", "done"]);
    expect(width).toBeGreaterThan(36);
    expect(width).toBeLessThan(560);
  });

  it("caps a long chip set at 560 rather than growing with every added value", () => {
    const manyLongValues = Array.from({ length: 20 }, (_unused, i) =>
      `option-value-number-${i}-long-enough-to-matter`);
    expect(multiSelectWidth(manyLongValues)).toBe(560);
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

  it("routes its header through the shell's three-slot builder rather than drawing its own", () => {
    expect(columnWidthSource).toContain("buildShellHeader(panel");
    expect(columnWidthSource).toContain('t("columnWidth.adjustTitle"');
    expect(columnWidthSource).not.toContain('cls: "obnotion-panel-header"');
    expect(columnWidthSource).not.toContain('cls: "obnotion-cell-edit-close"');
  });

  it("puts the slider and the typed value in one shared range row, not a floating pill", () => {
    expect(columnWidthSource).toContain('cls: "obnotion-panel-row"');
    expect(columnWidthSource).toContain('cls: "obnotion-view-config-range"');
    expect(columnWidthSource).toContain('cls: "obnotion-view-config-number"');
    // The bare strip's own vocabulary is gone from both files; the shared range control replaced
    // the custom slider, value pill and title.
    expect(columnWidthSource).not.toContain("obnotion-mobile-column-width-title");
    expect(columnWidthSource).not.toContain("obnotion-mobile-column-width-slider");
    expect(columnWidthSource).not.toContain("obnotion-mobile-column-width-value-row");
    expect(databaseViewSource).not.toContain("obnotion-mobile-column-width-title");
    expect(databaseViewSource).not.toContain("obnotion-mobile-column-width-value-row");
  });

  it("renders the four presets as the shared exclusive-choice group with a selected state", () => {
    // The same single-select group the new-record placement uses: equal options, one selected,
    // the exclusivity carried by the group's behaviour rather than the control type.
    expect(columnWidthSource).toContain('cls: "obnotion-new-placement"');
    expect(columnWidthSource).toContain('"obnotion-new-placement-option"');
    expect(columnWidthSource).toContain('role: "checkbox"');
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
    expect(columnWidthSource).toContain('cls: "obnotion-mobile-column-width-backdrop"');
    expect(columnWidthSource).toContain('cls: "obnotion-mobile-column-width-panel"');
  });

  it("gives the panel the container class its shared classes need to match", () => {
    // The panel is created on doc.body directly and never takes setSheetMount's move branch on
    // either presentation, so without this the obnotion-panel-header/obnotion-panel-row/obnotion-view-config-*/
    // obnotion-new-placement rules above match nothing — every one of them is written
    // ".obnotion-container .obnotion-thing" — and the shared body would render unstyled.
    expect(columnWidthSource).toContain('panel.addClass("obnotion-container")');
  });
});
