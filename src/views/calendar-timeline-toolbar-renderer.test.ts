// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-timeline-toolbar-renderer.test
// COMPONENT: coverage for the timeline options popover's local-extension gating
// ───────────────────────────────────────────────────────────────────
//
// The "Slot duration" row's only reader is getTimelineSlotDuration inside
// renderTimelineLocal (calendar-timeline-renderer.ts), the local-extensions
// render path. Rendering the control while extensions are off offers a
// setting the default (reference) render never consults.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & MOCKS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import { CalendarTimelineToolbarRenderer, CalendarTimelineToolbarActions } from "./calendar-timeline-toolbar-renderer";
import type { ViewConfig } from "../data/types";
import { t } from "../i18n";

vi.mock("obsidian", () => ({
  setIcon: vi.fn(),
}));

/** Minimal Obsidian-DOM-helper surface: just enough to drive renderLayoutContent
 *  (createDropdownField's button/icon/label/value spans, the switch row's
 *  label/input, and the range row this scenario never reaches). */
class MockElement {
  public tagName: string;
  public className: string;
  public text: string | null = null;
  public disabled = false;
  public checked = false;
  public onclick: (() => void) | null = null;
  public onchange: (() => void) | null = null;
  public attributes = new Map<string, string>();
  public children: MockElement[] = [];

  constructor(tagName = "div", className = "") {
    this.tagName = tagName.toUpperCase();
    this.className = className;
  }

  createDiv(options: { cls?: string; text?: string } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string; text?: string } = {}): MockElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): MockElement {
    const el = new MockElement(tag, options.cls || "");
    if (options.text != null) el.text = options.text;
    if (options.attr) for (const [k, v] of Object.entries(options.attr)) el.attributes.set(k, v);
    this.children.push(el);
    return el;
  }

  empty(): void {
    this.children = [];
  }

  setAttr(key: string, value: string): void {
    this.attributes.set(key, value);
  }

  addClass(cls: string): void { this.className = `${this.className} ${cls}`.trim(); }
  removeClass(_cls: string): void { /* not needed for this scenario */ }
  toggleClass(cls: string, on: boolean): void { if (on) this.addClass(cls); }

  /** Recursively collects every rendered text node, for a coarse "row present" check. */
  allText(): string[] {
    const out: string[] = [];
    if (this.text != null) out.push(this.text);
    for (const child of this.children) out.push(...child.allText());
    return out;
  }
}

function baseConfig(overrides: Partial<ViewConfig> = {}): ViewConfig {
  return {
    name: "Timeline",
    viewType: "timeline",
    sourceFolder: "",
    schema: { columns: [], computedFields: [] },
    timelineScale: "day",
    ...overrides,
  };
}

function baseActions(): CalendarTimelineToolbarActions {
  return { onChange: vi.fn() };
}

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────
describe("CalendarTimelineToolbarRenderer layout section — slot-duration gating", () => {
  it("hides the Slot duration row at day scale when local extensions are off", () => {
    const renderer = new CalendarTimelineToolbarRenderer();
    const layout = new MockElement("div", "layout-section");
    const config = baseConfig({ timelineLocalExtensions: undefined });

    (renderer as unknown as {
      renderLayoutContent(layout: MockElement, config: ViewConfig, actions: CalendarTimelineToolbarActions): void;
    }).renderLayoutContent(layout, config, baseActions());

    expect(layout.allText()).not.toContain(t("viewConfig.calendarWeekSlotDuration"));
  });

  it("shows the Slot duration row at day scale once local extensions are on", () => {
    const renderer = new CalendarTimelineToolbarRenderer();
    const layout = new MockElement("div", "layout-section");
    const config = baseConfig({ timelineLocalExtensions: true });

    (renderer as unknown as {
      renderLayoutContent(layout: MockElement, config: ViewConfig, actions: CalendarTimelineToolbarActions): void;
    }).renderLayoutContent(layout, config, baseActions());

    expect(layout.allText()).toContain(t("viewConfig.calendarWeekSlotDuration"));
  });
});

describe("CalendarTimelineToolbarRenderer popover — Layout section heading", () => {
  it("keeps the Layout heading after renderLayoutContent's own empty()/rebuild", () => {
    const renderer = new CalendarTimelineToolbarRenderer();
    const panel = new MockElement("div", "popover-content");
    const config = baseConfig();

    (renderer as unknown as {
      renderTimelineOptions(panel: MockElement, config: ViewConfig, actions: CalendarTimelineToolbarActions): void;
    }).renderTimelineOptions(panel, config, baseActions());

    expect(panel.allText()).toContain(t("timeline.layoutSection"));
  });
});
