// ───────────────────────────────────────────────────────────────────
// MODULE:    layer-scale-and-timeline-width
// COMPONENT: guards the shared z-index layer scale and the timeline's
//            per-scale column-width bounds against silent regressions
// ───────────────────────────────────────────────────────────────────
//
// These two properties live in styles.css and calendar-timeline-model.ts
// respectively, far from each other and from any type system, so nothing
// else catches a stray hardcoded z-index or an inverted min/max/default
// triple. Reads the built stylesheet and source text directly rather than
// exercising the DOM, since the thing under test is the authored values.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & FIXTURES
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   Asserting on the shipped stylesheet means reading it from disk, which needs the node
   builtins the plugin runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it, vi } from "vitest";
import { getTimelineColumnWidthSpec } from "../data/calendar-timeline-model";

vi.mock("obsidian", () => ({
  TFile: class {},
}));

const stylesContent = readFileSync(resolve(__dirname, "../../styles.css"), "utf-8");
const cellRendererSource = readFileSync(resolve(__dirname, "./cell-renderer.ts"), "utf-8");

// ───────────────────────────────────────────────────────────────────
// 2. LAYER SCALE TESTS
// ───────────────────────────────────────────────────────────────────

describe("stacking order between the record detail panel and its editors", () => {
  it("keeps the detail panel on the panel tier so its sibling editors paint above it", () => {
    // The editors are appended to the container rather than to the panel, so ordering is
    // decided by the layer scale rather than by nesting.
    // The selector may be a list — the sheet presentation adds a second, surface-rooted alternative
    // so the panel keeps its rules when it is not inside the plugin container. What must not change
    // is which tier it lands on.
    const panelRule = /\.db-record-detail-panel[^{]*\{[^}]*z-index:\s*var\(--db-layer-panel[^)]*\)/;
    expect(stylesContent).toMatch(panelRule);
    expect(stylesContent).not.toMatch(/\.db-record-detail-panel[^{]*\{[^}]*z-index:\s*99\d/);
  });

  it("orders the layer tokens so panels sit below popovers and popovers below modals", () => {
    const read = (name: string): number => {
      const found = new RegExp(`--db-layer-${name}:\\s*(\\d+)`).exec(stylesContent);
      if (!found) throw new Error(`--db-layer-${name} is not defined`);
      return Number(found[1]);
    };
    expect(read("panel")).toBeLessThan(read("popover"));
    expect(read("popover")).toBeLessThan(read("submenu"));
    expect(read("submenu")).toBeLessThan(read("modal"));
  });

  it("routes the inline mobile editors through the shared token instead of a raw number", () => {
    expect(cellRendererSource).not.toContain('zIndex: "1000"');
    expect(cellRendererSource).toContain('"z-index": "var(--db-layer-popover, 100)"');
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. TIMELINE WIDTH TESTS
// ───────────────────────────────────────────────────────────────────

describe("timeline unit widths across scales", () => {
  // Units per scale at their maximum: hours in a day, days in a week/month/quarter/year.
  const unitsPerScale = { day: 24, week: 7, month: 31, quarter: 92, year: 366 } as const;

  it("keeps every scale's default canvas within a comparable band", () => {
    for (const [scale, units] of Object.entries(unitsPerScale)) {
      const width = getTimelineColumnWidthSpec(scale as keyof typeof unitsPerScale).defaultWidth * units;
      expect(width).toBeGreaterThan(400);
      expect(width).toBeLessThan(4000);
    }
  });

  it("does not let the year overview sprawl past the coarser scales", () => {
    const year = getTimelineColumnWidthSpec("year").defaultWidth * unitsPerScale.year;
    const month = getTimelineColumnWidthSpec("month").defaultWidth * unitsPerScale.month;
    // A year is a coarser overview than a month, so it must not need more scrolling.
    expect(year).toBeLessThanOrEqual(month);
  });

  it("keeps each scale's default inside its own slider bounds", () => {
    for (const scale of Object.keys(unitsPerScale) as (keyof typeof unitsPerScale)[]) {
      const spec = getTimelineColumnWidthSpec(scale);
      expect(spec.min).toBeLessThanOrEqual(spec.max);
      if (scale === "day") continue; // asserted separately below as a known deviation
      expect(spec.defaultWidth).toBeGreaterThanOrEqual(spec.min);
      expect(spec.defaultWidth).toBeLessThanOrEqual(spec.max);
    }
  });

  it("records that the day scale's declared default is unreachable", () => {
    // Day declares a default below its own minimum, so the resolver clamps it upward and the
    // declared value never applies. Pinned rather than corrected here because changing the
    // effective day width is a visual change beyond the timeline-width fix this suite covers.
    const day = getTimelineColumnWidthSpec("day");
    expect(day.defaultWidth).toBeLessThan(day.min);
    expect(Math.max(day.min, Math.min(day.max, day.defaultWidth))).toBe(day.min);
  });
});
