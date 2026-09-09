// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-timeline-tick-label
// COMPONENT: unit test for the timeline axis tick label edge anchoring
// ───────────────────────────────────────────────────────────────────
//
// Every tick label is centred on its tick's left boundary via a CSS
// translateX(-50%). The first tick's boundary is the viewport's left
// edge, so its label extends past the edge and is clipped there ("00:00"
// reads "0:00", "Tue 24" reads "ue 24" on phone-width captures). The
// renderer must anchor that one label at the edge instead of centring
// it. MockElement reimplements just enough of the Obsidian DOM helper
// surface to drive the renderer's private label method without a
// mounted view.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & FIXTURES
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import { CalendarTimelineRenderer, CalendarTimelineRendererActions } from "./calendar-timeline-renderer";

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
    });
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

type TickLabelRenderer = {
  renderTimelineTickLabel(tickEl: MockElement, label: string, scale: string, isFirstTick: boolean): void;
};

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("timeline tick label edge anchoring", () => {
  it("anchors the first tick's label at the viewport edge so it is never clipped", () => {
    const renderer = new CalendarTimelineRenderer({} as CalendarTimelineRendererActions) as unknown as TickLabelRenderer;
    const tickEl = new MockElement("div");
    renderer.renderTimelineTickLabel(tickEl, "00:00", "day", true);
    expect(tickEl.children[0].style.transform).toBe("none");
  });

  it("keeps interior tick labels centred on their boundary", () => {
    const renderer = new CalendarTimelineRenderer({} as CalendarTimelineRendererActions) as unknown as TickLabelRenderer;
    const tickEl = new MockElement("div");
    renderer.renderTimelineTickLabel(tickEl, "01:00", "day", false);
    expect(tickEl.children[0].style.transform).toBeUndefined();
  });
});
