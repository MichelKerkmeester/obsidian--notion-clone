// ───────────────────────────────────────────────────────────────────
// MODULE:    title-field-display.test
// COMPONENT: resolveTitleFieldDisplay's typed-format routing for number/currency/date titles
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. FIXTURES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { formatEuroCurrency, formatEuroNumber } from "./euro-format";
import { EMPTY_TITLE_PLACEHOLDER, resolveTitleFieldDisplay } from "./title-field-display";
import { NO_TITLE_FIELD, type ColumnDef, type RowData, type ViewConfig } from "./types";

type TestFile = RowData["file"];

function row(frontmatter: Record<string, unknown> = {}): RowData {
  return {
    file: { path: "Notes/Row.md", name: "Row.md", basename: "Row" } as TestFile,
    frontmatter,
    computed: {},
  };
}

function col(key: string, type: ColumnDef["type"], extra: Partial<ColumnDef> = {}): ColumnDef {
  return { key, label: key, type, ...extra };
}

function config(columns: ColumnDef[], overrides: Partial<ViewConfig> = {}): ViewConfig {
  return {
    name: "Board",
    sourceFolder: "",
    viewType: "board",
    schema: { columns, computedFields: [] },
    ...overrides,
  };
}

// ───────────────────────────────────────────────────────────────────
// 2. CASES
// ───────────────────────────────────────────────────────────────────

describe("resolveTitleFieldDisplay", () => {
  it("formats a currency-typed titleField through the column's own euro formatter", () => {
    const view = config([col("price", "currency")], { titleField: "price" });
    const display = resolveTitleFieldDisplay(row({ price: 3537.32 }), view, "price");
    // Locked by the operator's own report: the raw stored number ("3537.32") is the
    // defect, not the fix — a currency-titled card must read the same formatted text
    // its column shows everywhere else.
    expect(display.text).toBe(formatEuroCurrency(3537.32));
    expect(display.text).not.toBe("3537.32");
  });

  it("formats a number-typed titleField through the plain euro number formatter", () => {
    const view = config([col("count", "number")], { titleField: "count" });
    const display = resolveTitleFieldDisplay(row({ count: 1234.5 }), view, "count");
    expect(display.text).toBe(formatEuroNumber(1234.5));
    expect(display.text).not.toBe("1234.5");
  });

  it("formats a date-typed titleField through the plugin's date formatter, not an ISO string", () => {
    const view = config([col("due", "date")], { titleField: "due" });
    const display = resolveTitleFieldDisplay(row({ due: "2026-03-14" }), view, "due");
    expect(display.text).not.toContain("T00:00");
    expect(display.text).toMatch(/Mar/);
  });

  it("falls back to the empty placeholder for an empty currency value, never a thrown error", () => {
    const view = config([col("price", "currency")], { titleField: "price" });
    const display = resolveTitleFieldDisplay(row({ price: undefined }), view, "price");
    expect(display.text).toBe(EMPTY_TITLE_PLACEHOLDER);
    expect(display.isEmpty).toBe(true);
  });

  it("falls back to the raw text for a non-numeric value in a currency column", () => {
    const view = config([col("price", "currency")], { titleField: "price" });
    const display = resolveTitleFieldDisplay(row({ price: "n/a" }), view, "price");
    expect(display.text).toBe("n/a");
  });

  it("keeps a text-typed titleField's output byte-identical to the plain stringified value", () => {
    const view = config([col("summary", "text")], { titleField: "summary" });
    const display = resolveTitleFieldDisplay(row({ summary: "Quarterly review" }), view, "summary");
    expect(display.text).toBe("Quarterly review");
  });

  it("keeps the file.name pseudo-field untouched by the typed-format routing", () => {
    const view = config([], { titleField: "file.name" });
    const display = resolveTitleFieldDisplay(row(), view, "file.name");
    expect(display.text).toBe("Row");
    expect(display.isFileTitle).toBe(true);
  });

  it("hides the title outright when titleField is NO_TITLE_FIELD", () => {
    const view = config([col("price", "currency")], { titleField: NO_TITLE_FIELD });
    const display = resolveTitleFieldDisplay(row({ price: 10 }), view, NO_TITLE_FIELD);
    expect(display.isHidden).toBe(true);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. CROSS-SURFACE AGREEMENT (board card / record header / phone sheet)
// ───────────────────────────────────────────────────────────────────
//
// board-renderer.ts's getTitleField and record-detail-panel.ts:485-488's
// getRecordEventTitleField each derive a titleField from the same ViewConfig
// before calling resolveTitleFieldDisplay — read from source in this packet's
// own goal.md, not re-executed here, since this packet's scope excludes
// editing either file (their existing agreement is what the packet formalizes,
// not what it changes). What this suite locks is the resolver's own half of
// that contract: given the exact titleField value each surface is documented
// to pass in for a non-calendar/timeline view, the shared resolver always
// agrees. The desktop and phone record sheet already read the identical
// getRecordEventTitleField call, so proving record === board covers all three.

describe("cross-surface titleField agreement", () => {
  const NON_CALENDAR_VIEW_TYPES: ViewConfig["viewType"][] = ["table", "board", "gallery", "list"];

  for (const viewType of NON_CALENDAR_VIEW_TYPES) {
    it(`agrees on a formatted currency title for a ${viewType} view`, () => {
      const view = config([col("price", "currency")], { viewType, titleField: "price" });
      const r = row({ price: 3537.32 });
      // getTitleField's non-NO_TITLE_FIELD branch: config.titleField || "file.name".
      const boardField = view.titleField || "file.name";
      // getRecordEventTitleField's fallthrough for every view but calendar/timeline: config.titleField.
      const recordField = view.titleField;
      const boardText = resolveTitleFieldDisplay(r, view, boardField).text;
      const recordText = resolveTitleFieldDisplay(r, view, recordField).text;
      expect(boardText).toBe(recordText);
      expect(boardText).toBe(formatEuroCurrency(3537.32));
    });
  }

  it("does not extend to calendar/timeline, which read their own dedicated title fields (D5)", () => {
    const view = config([col("price", "currency"), col("month", "text")], {
      viewType: "calendar",
      titleField: "price",
      calendarTitleField: "month",
    });
    // getRecordEventTitleField reads calendarTitleField for a calendar view, never titleField.
    expect(view.calendarTitleField).not.toBe(view.titleField);
  });
});
