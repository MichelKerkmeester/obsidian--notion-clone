// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-timeline-hour-column
// COMPONENT: unit test for the timeline grid's day-scale today highlight
// ───────────────────────────────────────────────────────────────────
//
// At the hour unit (the day-scale view rendered as 24 hourly columns), every
// column shares the same calendar date. Highlighting by date equality alone
// would tint the whole day at once instead of the one column standing in
// for the current clock hour. MockElement reimplements just enough of the
// Obsidian DOM helper surface to drive the renderer's private grid-column
// method without a mounted view.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & FIXTURES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { CalendarTimelineRenderer, CalendarTimelineRendererActions } from "./calendar-timeline-renderer";
import { getLocalDateKey } from "../data/calendar-date-time";

vi.mock("obsidian", () => ({
  Notice: class {},
  setIcon: vi.fn(),
  setTooltip: vi.fn(),
  TFile: class {},
}));

class MockElement {
  public tagName: string;
  public className: string;
  public attributes = new Map<string, string>();
  public dataset: Record<string, string> = {};
  public children: MockElement[] = [];
  public style: Record<string, string> & { setProperty: (k: string, v: string) => void };

  constructor(tagName = "div", className = "") {
    this.tagName = tagName.toUpperCase();
    this.className = className;
    const styles: Record<string, string> = {};
    this.style = Object.assign(styles, {
      setProperty: (k: string, v: string) => { styles[k] = v; },
    }) as Record<string, string> & { setProperty: (k: string, v: string) => void };
  }

  createDiv(options: { cls?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string; attr?: Record<string, string> } = {}): MockElement {
    const el = new MockElement(tag, options.cls || "");
    if (options.attr) {
      for (const [k, v] of Object.entries(options.attr)) el.attributes.set(k, v);
    }
    this.children.push(el);
    return el;
  }

  setCssProps(props: Record<string, string>): void {
    for (const [k, v] of Object.entries(props)) this.style.setProperty(k, v);
  }
}

type GridRenderer = { renderTimelineGridColumns(body: MockElement, model: Record<string, unknown>): void };

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("timeline day-scale grid today highlight", () => {
  const fixedNow = new Date(2026, 7, 26, 14, 30, 0);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("marks is-today on exactly the current hour column, not every hour of the date", () => {
    const renderer = new CalendarTimelineRenderer({} as CalendarTimelineRendererActions) as unknown as GridRenderer;
    const body = new MockElement("div");
    const model = {
      startDateKey: getLocalDateKey(fixedNow),
      startMinutes: 0,
      totalUnits: 24,
      unit: "hour",
    };

    renderer.renderTimelineGridColumns(body, model);

    const columns = body.children[0].children;
    expect(columns).toHaveLength(24);
    const todayColumns = columns.filter((column) => column.className.includes("is-today"));
    expect(todayColumns).toHaveLength(1);
    expect(todayColumns[0].attributes.get("data-date-key")).toBe(getLocalDateKey(fixedNow));

    const todayIndex = columns.findIndex((column) => column.className.includes("is-today"));
    expect(todayIndex).toBe(fixedNow.getHours());
  });
});
