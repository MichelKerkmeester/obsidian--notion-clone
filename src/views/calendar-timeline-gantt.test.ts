// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-timeline-gantt
// COMPONENT: DOM-structure parity test — the timeline's default render is a
//            one-to-one copy of obsidian-pm's GanttView output shape
// ───────────────────────────────────────────────────────────────────
//
// The default timeline renders the reference gantt's element tree and class
// vocabulary (pm-gantt-*), mapped onto this repo's RowData. That shape is a
// contract, so the expected tree below is derived from the reference source,
// never from our renderer: GanttView.ts (controls, wrapper, left/right
// panels, label rows), GanttHeaderRenderer.ts (header svg, bands, per-scale
// labels), GanttTaskBarRenderer.ts (bar group, progress, handles, link dots,
// milestone, empty-row target, arrows), GanttRenderer.ts (grid, today line),
// and TimelineConfig.ts (row/header/label defaults). The MIT notice for the
// copied structure lives beside the renderer blocks; this file's expected
// tree mirrors that structure for a fixed RowData fixture.
//
// MockElement reimplements just enough of the Obsidian DOM helper surface to
// drive the full renderTimeline entry without a mounted view, so the parity
// check runs in the plain-node vitest environment.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & MOCKS
// ───────────────────────────────────────────────────────────────────

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { CalendarTimelineRenderer, CalendarTimelineRendererActions } from "./calendar-timeline-renderer";
import { buildTimelineRangeGeometry } from "../data/calendar-timeline-model";
import { addDateKeyDays, getLocalDateKey } from "../data/calendar-date-time";
import type { RowData, ViewConfig } from "../data/types";
import { t } from "../i18n";

vi.mock("obsidian", () => ({
  Notice: class {},
  setIcon: vi.fn(),
  setTooltip: vi.fn(),
  TFile: class {},
  Platform: { isMobile: false, isTablet: false },
}));

class MockDocument {
  createElementNS(_namespace: string, tag: string): MockElement {
    return new MockElement(tag);
  }
  defaultView: undefined;
}

class MockElement {
  public tagName: string;
  public className: string;
  public id = "";
  public attributes = new Map<string, string>();
  public dataset: Record<string, string> = {};
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  public ownerDocument = new MockDocument();
  public isConnected = true;
  public clientWidth = 800;
  public scrollTop = 0;
  public scrollLeft = 0;
  public text: string | null = null;
  public style: Record<string, string> & { setProperty: (k: string, v: string) => void };

  constructor(tagName = "div", className = "") {
    this.tagName = tagName.toUpperCase();
    this.className = className;
    const styles: Record<string, string> = {};
    this.style = Object.assign(styles, {
      setProperty: (k: string, v: string) => { styles[k] = v; },
    });
  }

  createDiv(options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): MockElement {
    const el = new MockElement(tag, options.cls || "");
    el.parentElement = this;
    if (options.text != null) el.setText(options.text);
    if (options.attr) {
      for (const [k, v] of Object.entries(options.attr)) el.setAttribute(k, v);
    }
    this.children.push(el);
    return el;
  }

  appendChild(child: MockElement): void {
    child.parentElement = this;
    this.children.push(child);
  }

  insertBefore(child: MockElement, _before: MockElement | null): void {
    child.parentElement = this;
    this.children.unshift(child);
  }

  prepend(child: MockElement): void {
    child.parentElement = this;
    this.children.unshift(child);
  }

  remove(): void {
    if (this.parentElement) {
      const index = this.parentElement.children.indexOf(this);
      if (index >= 0) this.parentElement.children.splice(index, 1);
    }
    this.isConnected = false;
    this.parentElement = null;
  }

  empty(): void {
    this.children = [];
  }

  setText(text: string): void {
    this.text = text;
  }

  setAttr(key: string, value: string): void {
    this.setAttribute(key, value);
  }

  setAttribute(key: string, value: string): void {
    this.attributes.set(key, value);
    if (key === "id") this.id = value;
    if (key === "class") this.className = value;
    if (key.startsWith("data-")) this.dataset[key.slice(5).replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase())] = value;
  }

  getAttribute(key: string): string | null {
    return this.attributes.get(key) ?? null;
  }

  removeAttribute(key: string): void {
    this.attributes.delete(key);
  }

  setCssProps(props: Record<string, string>): void {
    for (const [k, v] of Object.entries(props)) this.style.setProperty(k, v);
  }

  addClass(...classes: string[]): void {
    const set = new Set(this.className.split(/\s+/).filter(Boolean));
    for (const cls of classes) set.add(cls);
    this.className = Array.from(set).join(" ");
  }

  removeClass(...classes: string[]): void {
    const set = new Set(this.className.split(/\s+/).filter(Boolean));
    for (const cls of classes) set.delete(cls);
    this.className = Array.from(set).join(" ");
  }

  toggleClass(cls: string, on: boolean): void {
    if (on) this.addClass(cls);
    else this.removeClass(cls);
  }

  hasClass(cls: string): boolean {
    return this.className.split(/\s+/).includes(cls);
  }

  addEventListener(): void {}
  removeEventListener(): void {}

  getBoundingClientRect(): { width: number; height: number; top: number; left: number } {
    return { width: this.clientWidth, height: 0, top: 0, left: 0 };
  }

  querySelector(_selector: string): MockElement | null {
    return null;
  }

  querySelectorAll(_selector: string): MockElement[] {
    return [];
  }

  closest(_selector: string): MockElement | null {
    return null;
  }
}

// ───────────────────────────────────────────────────────────────────
// 2. FIXTURE
// ───────────────────────────────────────────────────────────────────

type MockActions = CalendarTimelineRendererActions;

function makeActions(): MockActions {
  return {
    openRow: () => undefined,
    updateEventDates: () => undefined,
    updateTimelineDependency: () => undefined,
    toggleSubtaskCollapsed: () => undefined,
    reorderTimelineEvent: () => undefined,
    isGroupCollapsed: () => false,
  };
}

function makeRow(path: string, frontmatter: Record<string, unknown>): RowData {
  return {
    file: {
      path,
      basename: path.replace(/\.md$/i, ""),
      name: path,
      parent: null,
      stat: { ctime: 0, mtime: 0, size: 0 },
    } as unknown as RowData["file"],
    frontmatter,
    computed: {},
  };
}

function makeConfig(scale: "day" | "month"): ViewConfig {
  return {
    schema: {
      columns: [
        { key: "start", type: "date", name: "Start" },
        { key: "due", type: "date", name: "Due" },
        { key: "color", type: "select", name: "Color", statusOptions: [{ value: "green", label: "Green", color: "green" }] },
      ],
      computedFields: [],
    },
    timelineStartDateField: "start",
    timelineEndDateField: "due",
    timelineColorField: "color",
    timelineScale: scale,
  } as unknown as ViewConfig;
}

/** Fixture rows anchored to the runtime today so the range always contains the today line. */
function makeFixtureRows(): RowData[] {
  const todayKey = getLocalDateKey(new Date());
  const day = (offset: number): string => addDateKeyDays(todayKey, offset);
  return [
    makeRow("Alpha.md", {
      start: day(-3),
      due: day(1),
      progress: 40,
      color: "green",
      subtaskIds: ["Epsilon.md"],
      dependencies: ["Beta.md"],
    }),
    makeRow("Epsilon.md", {
      parentId: "Alpha.md",
      start: day(-1),
      due: day(0),
      recurrence: "weekly",
    }),
    makeRow("Beta.md", { due: day(6) }),
    makeRow("Gamma.md", { milestone: "milestone", due: day(11) }),
    makeRow("Delta.md", {}),
  ];
}

// ───────────────────────────────────────────────────────────────────
// 3. REFERENCE-SHAPE SERIALIZATION
// ───────────────────────────────────────────────────────────────────

/** Serialize one element and its subtree as indented `tag#id.cls[text]` lines. */
function serializeElement(el: MockElement, depth: number, lines: string[]): void {
  const tag = el.tagName.toLowerCase();
  const classes = el.className.replace(/\s+/g, ".").replace(/\.$/, "");
  let text = el.text ?? "";
  if (tag === "title") text = "tooltip";
  const label = `${tag}${el.id ? `#${el.id}` : ""}${classes ? `.${classes}` : ""}${text ? `[${text.replace(/\n/g, "⏎")}]` : ""}`;
  lines.push(`${"  ".repeat(depth)}${label}`);
  for (const child of el.children) serializeElement(child, depth + 1, lines);
}

function serializeTree(root: MockElement): string {
  const lines: string[] = [];
  serializeElement(root, 0, lines);
  return lines.join("\n");
}

// ───────────────────────────────────────────────────────────────────
// 4. EXPECTED TREE BUILDERS (reference-derived, not renderer-derived)
// ───────────────────────────────────────────────────────────────────

interface RangeLike {
  startDateKey: string;
  endDateKey: string;
  dayWidth: number;
  totalDays: number;
}

const dateKeyOf = (date: Date): string =>
  `${String(date.getUTCFullYear()).padStart(4, "0")}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

const addUtcDays = (date: Date, days: number): Date => {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

const daysBetweenKeys = (startKey: string, endKey: string): number =>
  Math.round((Date.parse(`${endKey}T00:00:00Z`) - Date.parse(`${startKey}T00:00:00Z`)) / 86400000);

const dateToX = (cfg: RangeLike, dateKey: string): number => daysBetweenKeys(cfg.startDateKey, dateKey) * cfg.dayWidth;

const monthShort = (date: Date): string => new Intl.DateTimeFormat("en", { month: "short" }).format(date);
const monthShortYear2 = (date: Date): string => new Intl.DateTimeFormat("en", { month: "short", year: "2-digit" }).format(date);

/** Reference month bands: per month from start-of-month(start) while < end (header renderer loop). */
function referenceMonthBands(cfg: RangeLike): Array<{ cls: string; label: string }> {
  const bands: Array<{ cls: string; label: string }> = [];
  const start = new Date(`${cfg.startDateKey}T00:00:00Z`);
  let monthStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  while (dateKeyOf(monthStart) < cfg.endDateKey) {
    bands.push({
      cls: (monthStart.getUTCMonth() + 1 - 1) % 2 === 0 ? "pm-gantt-band-even" : "pm-gantt-band-odd",
      label: monthShortYear2(monthStart),
    });
    monthStart = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1));
  }
  return bands;
}

/** Reference year bands: per year from Jan 1 of start.year while < end (header renderer loop). */
function referenceYearBands(cfg: RangeLike): Array<{ cls: string; label: string }> {
  const bands: Array<{ cls: string; label: string }> = [];
  const startYear = Number(cfg.startDateKey.slice(0, 4));
  let year = startYear;
  while (dateKeyOf(new Date(Date.UTC(year, 0, 1))) < cfg.endDateKey) {
    bands.push({ cls: year % 2 === 0 ? "pm-gantt-band-even" : "pm-gantt-band-odd", label: String(year) });
    year += 1;
  }
  return bands;
}

/** Reference month header: per month from start-of-month(start) while < end (header renderer loop). */
function referenceMonths(cfg: RangeLike): string[] {
  const months: string[] = [];
  const start = new Date(`${cfg.startDateKey}T00:00:00Z`);
  let monthStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  while (dateKeyOf(monthStart) < cfg.endDateKey) {
    months.push(monthShort(monthStart));
    monthStart = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1));
  }
  return months;
}

/** Reference vertical gridlines: first-of-month at month scale, Mondays at day scale (grid renderer loop). */
function referenceVerticalGridlines(cfg: RangeLike, scale: "day" | "month"): number {
  let count = 0;
  const start = new Date(`${cfg.startDateKey}T00:00:00Z`);
  for (let i = 0; i < cfg.totalDays; i++) {
    const date = addUtcDays(start, i);
    const isMonday = date.getUTCDay() === 1;
    const isFirst = date.getUTCDate() === 1;
    if ((scale === "day" && isMonday) || (scale === "month" && isFirst)) count += 1;
  }
  return count;
}

// ───────────────────────────────────────────────────────────────────
// 5. TESTS
// ───────────────────────────────────────────────────────────────────

describe("timeline gantt DOM-structure parity", () => {
  const rows = makeFixtureRows();

  beforeAll(() => {
    // The renderer measures the viewport through window.getComputedStyle; the node
    // test environment has no window, so the parity check provides the minimum
    // surface that keeps the measurement path alive.
    // eslint-disable-next-line obsidianmd/no-global-this -- test-only shim; product code keeps window.
    (globalThis as Record<string, unknown>).window = {
      getComputedStyle: () => ({ paddingLeft: "0px", paddingRight: "0px" }),
      activeDocument: {
        body: { addClass: () => undefined, removeClass: () => undefined },
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      },
    };
  });

  afterAll(() => {
    // eslint-disable-next-line obsidianmd/no-global-this -- test-only shim teardown.
    delete (globalThis as Record<string, unknown>).window;
  });

  function renderGantt(scale: "day" | "month"): { tree: string; container: MockElement; config: ViewConfig } {
    const config = makeConfig(scale);
    const container = new MockElement("div");
    const renderer = new CalendarTimelineRenderer(makeActions());
    renderer.renderTimeline(container as unknown as HTMLElement, config, rows);
    const root = container.children[0];
    return { tree: serializeTree(root), container: root, config };
  }

  it("renders the reference gantt element tree and class vocabulary at month scale", () => {
    const config = makeConfig("month");
    const range = buildTimelineRangeGeometry(rows, config, "month");
    const cfg: RangeLike = {
      startDateKey: range.startDateKey,
      endDateKey: range.endDateKey,
      dayWidth: range.dayWidth,
      totalDays: range.totalDays,
    };
    const todayKey = getLocalDateKey(new Date());

    const yearBands = referenceYearBands(cfg);
    const months = referenceMonths(cfg);
    const verticals = referenceVerticalGridlines(cfg, "month");
    const horizontalLines = rows.length + 1;

    const barGroup = (withProgress: boolean, withRecurrence: boolean): string[] => {
      const children = [
        "rect.pm-gantt-bar",
        "  title[tooltip]",
        ...(withProgress ? ["rect.pm-gantt-bar-progress"] : []),
        ...(withRecurrence ? ["text.pm-gantt-bar-icon[R]"] : []),
        "rect.pm-gantt-drag-handle",
        "rect.pm-gantt-drag-handle",
        "circle.pm-gantt-link-dot",
        "circle.pm-gantt-link-dot",
      ];
      return ["g.pm-gantt-bar-group", ...children.map((child) => `  ${child}`)];
    };

    const expected = [
      "div.pm-gantt-view",
      "  div.pm-gantt-controls",
      "    div.pm-segmented",
      `      button.clickable-icon[${t("timeline.scaleDay")}]`,
      `      button.clickable-icon[${t("timeline.scaleWeek")}]`,
      `      button.clickable-icon.mod-cta[${t("timeline.scaleMonth")}]`,
      `      button.clickable-icon[${t("timeline.scaleQuarter")}]`,
      `      button.clickable-icon[${t("timeline.scaleYear")}]`,
      "    span.pm-gantt-sep",
      `    button.clickable-icon[${t("timeline.today")}]`,
      `    button.clickable-icon[${t("timeline.expandAll")}]`,
      `    button.clickable-icon[${t("timeline.collapseAll")}]`,
      "  div.pm-gantt-wrapper",
      "    div.pm-gantt-left",
      "      div.pm-gantt-left-header",
      `        span.pm-gantt-left-header-label[${t("timeline.taskColumn")}]`,
      "      div.pm-gantt-left-body",
      "        div.pm-gantt-label-row",
      "          div.tree-item-icon.collapse-icon.pm-collapse-toggle",
      "          span.pm-gantt-label-dot",
      "          span.pm-gantt-label-title[Alpha]",
      "          span.pm-gantt-label-progress[40%]",
      "          button.clickable-icon.pm-icon-btn.pm-icon-btn--hover-only",
      "        div.pm-gantt-label-row",
      "          span.pm-gantt-label-spacer",
      "          span.pm-gantt-label-dot",
      "          span.pm-gantt-label-title[Epsilon]",
      "          button.clickable-icon.pm-icon-btn.pm-icon-btn--hover-only",
      "        div.pm-gantt-label-row",
      "          span.pm-gantt-label-spacer",
      "          span.pm-gantt-label-dot",
      "          span.pm-gantt-label-title[Beta]",
      "          button.clickable-icon.pm-icon-btn.pm-icon-btn--hover-only",
      "        div.pm-gantt-label-row",
      "          span.pm-gantt-label-spacer",
      "          span.pm-gantt-label-dot",
      "          span.pm-gantt-label-title[Gamma]",
      "          button.clickable-icon.pm-icon-btn.pm-icon-btn--hover-only",
      "        div.pm-gantt-label-row",
      "          span.pm-gantt-label-spacer",
      "          span.pm-gantt-label-dot",
      "          span.pm-gantt-label-title[Delta]",
      "          button.clickable-icon.pm-icon-btn.pm-icon-btn--hover-only",
      "        div.pm-gantt-label-row.pm-gantt-add-row",
      "          button.pm-prop-add",
      "            span.pm-glyph-icon",
      `            span.pm-prop-add-label[${t("timeline.addTask")}]`,
      "        div.pm-no-shrink",
      "    div.pm-gantt-resize-handle",
      "    div.pm-gantt-right",
      "      div.pm-gantt-header-sticky",
      "        svg.pm-gantt-header-svg",
      "          g.pm-gantt-header",
      "            rect.pm-gantt-header-bg",
      ...yearBands.flatMap((band) => [
        `            rect.${band.cls}`,
        `            text.pm-gantt-header-year[${band.label}]`,
      ]),
      ...months.flatMap((month) => [
        `            text.pm-gantt-header-month[${month}]`,
        "            line.pm-gantt-header-tick",
      ]),
      "          polygon.pm-gantt-today-diamond",
      "          text.pm-gantt-milestone-label[Gamma]",
      "      div.pm-gantt-svg-container",
      "        svg.pm-gantt-svg",
      "          defs",
      "            marker#pm-arrowhead",
      "              path.pm-gantt-arrowhead",
      "          g.pm-gantt-grid",
      ...Array.from({ length: verticals }, () => "            line.pm-gantt-gridline-v"),
      ...Array.from({ length: horizontalLines }, () => "            line.pm-gantt-gridline-h"),
      "          line.pm-gantt-today-line",
      "          g.pm-gantt-bars",
      "            rect.pm-gantt-row-hover",
      ...barGroup(true, false).map((line) => `            ${line}`),
      "            rect.pm-gantt-row-hover",
      ...barGroup(false, true).map((line) => `            ${line}`),
      "            rect.pm-gantt-row-hover",
      ...barGroup(false, false).map((line) => `            ${line}`),
      "            rect.pm-gantt-row-hover",
      "            polygon.pm-gantt-milestone",
      "              title[tooltip]",
      "            rect.pm-gantt-empty-row-hit",
      "              title[tooltip]",
      "            rect.pm-gantt-empty-row-preview.pm-hidden",
      "          g.pm-gantt-arrows",
      "            path.pm-gantt-arrow",
      "          g.pm-gantt-milestone-labels",
      "            line",
    ].join("\n");

    const { tree, container } = renderGantt("month");

    expect(tree).toBe(expected);

    // Reference defaults: label width, header height, row height.
    const wrapper = container.children[1];
    const left = wrapper.children[0];
    expect(left.style.width).toBe("280px");
    expect(left.style.minWidth).toBe("280px");
    expect(left.children[0].style.height).toBe("56px");
    expect(left.children[1].children[0].style.height).toBe("44px");
    expect(wrapper.children[2].children[0].style.height).toBe("56px");
    // Subtask depth indents the label row.
    expect(left.children[1].children[1].style.paddingLeft).toBe("26px");
    // Row identity is carried on the label row.
    expect(left.children[1].children[0].dataset.taskId).toBe("Alpha.md");
    // The today line sits inside the range and the bar widths use the reference day width.
    expect(dateToX(cfg, todayKey)).toBeGreaterThanOrEqual(0);
    expect(dateToX(cfg, todayKey)).toBeLessThanOrEqual(range.totalDays * range.dayWidth);
  });

  it("renders the reference day-scale header and grid vocabulary", () => {
    const config = makeConfig("day");
    const range = buildTimelineRangeGeometry(rows, config, "day");
    const cfg: RangeLike = {
      startDateKey: range.startDateKey,
      endDateKey: range.endDateKey,
      dayWidth: range.dayWidth,
      totalDays: range.totalDays,
    };

    const monthBands = referenceMonthBands(cfg);
    const totalDays = range.totalDays;
    const horizontalLines = rows.length + 1;

    const { tree } = renderGantt("day");

    // Header: month-top bands, then per day (reference loop order): weekend fill
    // before the day label. Grid: per day (reference loop order): weekend fill
    // before the Monday line; horizontal lines after.
    const start = new Date(`${cfg.startDateKey}T00:00:00Z`);
    const dayLines: string[] = [];
    const gridDayLines: string[] = [];
    for (let i = 0; i < totalDays; i++) {
      const date = addUtcDays(start, i);
      const day = date.getUTCDay();
      const isWeekend = day === 0 || day === 6;
      if (isWeekend) {
        dayLines.push("            rect.pm-gantt-weekend-header");
        gridDayLines.push("            rect.pm-gantt-weekend");
      }
      dayLines.push(`            text.pm-gantt-header-day[${date.getUTCDate()}]`);
      if (day === 1) gridDayLines.push("            line.pm-gantt-gridline-v");
    }
    const headerLines = [
      "          g.pm-gantt-header",
      "            rect.pm-gantt-header-bg",
      ...monthBands.flatMap((band) => [
        `            rect.${band.cls}`,
        `            text.pm-gantt-header-month-top[${band.label}]`,
      ]),
      ...dayLines,
    ];
    const gridLines = [
      "          g.pm-gantt-grid",
      ...gridDayLines,
      ...Array.from({ length: horizontalLines }, () => "            line.pm-gantt-gridline-h"),
    ];

    const lines = tree.split("\n");
    const headerStart = lines.indexOf("          g.pm-gantt-header");
    expect(lines.slice(headerStart, headerStart + headerLines.length).join("\n")).toBe(headerLines.join("\n"));
    const gridStart = lines.indexOf("          g.pm-gantt-grid");
    expect(lines.slice(gridStart, gridStart + gridLines.length).join("\n")).toBe(gridLines.join("\n"));

    // Day scale bars are wide enough for labels (220px for a five-day span).
    const hasLabel = (title: string): boolean => lines.some((line) => line.includes(`text.pm-gantt-bar-label[${title}]`));
    expect(hasLabel("Alpha")).toBe(true);
    expect(hasLabel("Epsilon")).toBe(true);
    expect(hasLabel("Beta")).toBe(false);
  });

  it("keeps the reference bar geometry defaults", () => {
    const config = makeConfig("month");
    const container = new MockElement("div");
    const renderer = new CalendarTimelineRenderer(makeActions());
    renderer.renderTimeline(container as unknown as HTMLElement, config, rows);
    const root = container.children[0];

    const svg = root.children[1].children[2].children[1].children[0];
    const barsGroup = svg.children[3];
    const barGroups = barsGroup.children.filter((child) => child.className === "pm-gantt-bar-group");
    expect(barGroups).toHaveLength(3);

    // Bar rects: y = header + row * rowHeight + 8, height = 44 - 16.
    const firstBar = barGroups[0].children[0];
    expect(firstBar.getAttribute("height")).toBe("28");
    expect(firstBar.getAttribute("y")).toBe("64");
    expect(firstBar.getAttribute("rx")).toBe("7");

    // Progress fill rides the bar.
    const progress = barGroups[0].children.find((child) => child.className === "pm-gantt-bar-progress");
    expect(progress).toBeDefined();

    // Resize handles are 8px wide, link dots present on both edges.
    const handles = barGroups[0].children.filter((child) => child.className === "pm-gantt-drag-handle");
    expect(handles).toHaveLength(2);
    for (const handle of handles) expect(handle.getAttribute("width")).toBe("8");
    const dots = barGroups[0].children.filter((child) => child.className === "pm-gantt-link-dot");
    expect(dots).toHaveLength(2);

    // Milestone diamond + empty-row target render per row type.
    const milestone = barsGroup.children.find((child) => child.className === "pm-gantt-milestone");
    expect(milestone?.tagName).toBe("POLYGON");
    const emptyHit = barsGroup.children.find((child) => child.className === "pm-gantt-empty-row-hit");
    expect(emptyHit).toBeDefined();
    const preview = barsGroup.children.find((child) => child.className.includes("pm-gantt-empty-row-preview"));
    expect(preview?.className).toContain("pm-hidden");

    // One dependency arrow and one milestone guide line.
    const arrows = svg.children[4].children.filter((child) => child.className === "pm-gantt-arrow");
    expect(arrows).toHaveLength(1);
    const guides = svg.children[5].children.filter((child) => child.tagName === "LINE");
    expect(guides).toHaveLength(1);

    // Arrowhead marker def.
    const defs = svg.children[0];
    expect(defs.tagName).toBe("DEFS");
    expect(defs.children[0].id).toBe("pm-arrowhead");
  });
});
