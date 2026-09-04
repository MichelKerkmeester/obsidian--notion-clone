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
import type { CalendarEventDateChange } from "../data/calendar-interaction-model";
import type { GanttWeekLabel, RowData, TimelineScale, ViewConfig } from "../data/types";
import { t } from "../i18n";

/** Menu instances the renderer created, for the depends-elsewhere chip assertions. */
const mockMenus: Array<{
  items: Array<{ setTitle: (title: string) => unknown; setIcon: (icon: string) => unknown; onClick: (handler: () => void) => unknown; title: string; icon: string; handler: () => void }>;
  showAtMouseEvent: ReturnType<typeof vi.fn>;
}> = [];

vi.mock("obsidian", () => ({
  Notice: class {},
  setIcon: vi.fn(),
  setTooltip: vi.fn(),
  TFile: class {},
  Platform: { isMobile: false, isTablet: false },
  Menu: class {
    public items: Array<{ setTitle: (title: string) => unknown; setIcon: (icon: string) => unknown; onClick: (handler: () => void) => unknown; title: string; icon: string; handler: () => void }> = [];
    public showAtMouseEvent = vi.fn();
    constructor() {
      mockMenus.push(this);
    }
    addItem(callback: (item: {
      setTitle: (title: string) => unknown;
      setIcon: (icon: string) => unknown;
      onClick: (handler: () => void) => unknown;
    }) => void): unknown {
      const item = {
        setTitle: (title: string) => { item.title = title; return item; },
        setIcon: (icon: string) => { item.icon = icon; return item; },
        onClick: (handler: () => void) => { item.handler = handler; return item; },
        title: "",
        icon: "",
        handler: () => {},
      };
      this.items.push(item);
      callback(item);
      return this;
    }
  },
}));

/** Test-only event dispatch surface for the interaction tests: the renderer binds
 *  document-level listeners (drag move/up, Escape) that a real DOM would deliver. */
class MockDocument {
  public listeners: Record<string, Array<(event: unknown) => void>> = {};
  public defaultView: { requestAnimationFrame?: (callback: () => void) => number } | undefined;

  createElementNS(_namespace: string, tag: string): MockElement {
    return new MockElement(tag);
  }

  addEventListener(type: string, handler: (event: unknown) => void): void {
    (this.listeners[type] ??= []).push(handler);
  }

  removeEventListener(type: string, handler: (event: unknown) => void): void {
    const list = this.listeners[type];
    if (!list) return;
    const index = list.indexOf(handler);
    if (index >= 0) list.splice(index, 1);
  }

  dispatch(type: string, event: unknown): void {
    for (const handler of [...(this.listeners[type] ?? [])]) handler(event);
  }
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
  public offsetHeight: number | undefined;
  public clientHeight: number | undefined;
  public text: string | null = null;
  public style: Record<string, string> & { setProperty: (k: string, v: string) => void };
  public listeners: Record<string, Array<(event: unknown) => void>> = {};
  public pointerCaptures: number[] = [];
  public classList: { contains: (cls: string) => boolean };

  constructor(tagName = "div", className = "") {
    this.tagName = tagName.toUpperCase();
    this.className = className;
    const styles: Record<string, string> = {};
    this.style = Object.assign(styles, {
      setProperty: (k: string, v: string) => { styles[k] = v; },
    });
    this.classList = { contains: (cls) => this.className.split(/\s+/).includes(cls) };
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

  addEventListener(type: string, handler: (event: unknown) => void, _options?: unknown): void {
    (this.listeners[type] ??= []).push(handler);
  }

  removeEventListener(type: string, handler: (event: unknown) => void): void {
    const list = this.listeners[type];
    if (!list) return;
    const index = list.indexOf(handler);
    if (index >= 0) list.splice(index, 1);
  }

  dispatch(type: string, event: unknown): void {
    for (const handler of [...(this.listeners[type] ?? [])]) handler(event);
    // The controls bar wires its buttons through the .onclick property, which a real
    // DOM invokes on click; the mock mirrors that for the property-assigned handlers.
    const propertyHandler = (this as unknown as Record<string, unknown>)[`on${type}`];
    if (typeof propertyHandler === "function") (propertyHandler as (e: unknown) => void)(event);
  }

  hasListener(type: string): boolean {
    return (this.listeners[type] ?? []).length > 0;
  }

  setPointerCapture(pointerId: number): void {
    this.pointerCaptures.push(pointerId);
  }

  getBoundingClientRect(): { width: number; height: number; top: number; left: number } {
    return { width: this.clientWidth, height: 0, top: 0, left: 0 };
  }

  querySelector(_selector: string): MockElement | null {
    return null;
  }

  querySelectorAll(_selector: string): MockElement[] {
    return [];
  }

  closest(selector: string): MockElement | null {
    const cls = selector.startsWith(".") ? selector.slice(1) : "";
    if (cls && this.classList.contains(cls)) return this;
    return this.parentElement ? this.parentElement.closest(selector) : null;
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

/** Records updateEventDates changes the way updateCalendarTimelineDates gates them:
 *  changedEdge "start" writes the start cell only, "end" the end cell only, "both" both. */
function makeDateWriteSpy(): { actions: MockActions; writes: Array<{ row: RowData; cell: "start" | "end"; change: CalendarEventDateChange }> } {
  const writes: Array<{ row: RowData; cell: "start" | "end"; change: CalendarEventDateChange }> = [];
  const actions = makeActions();
  actions.updateEventDates = (row, change) => {
    if (change.changedEdge !== "end") writes.push({ row, cell: "start", change });
    if (change.changedEdge !== "start" && change.endDateKey) writes.push({ row, cell: "end", change });
  };
  return { actions, writes };
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

function makeConfig(scale: TimelineScale): ViewConfig {
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
    // Both dates present so the milestone anchor (due preferred) is observable.
    makeRow("Gamma.md", { milestone: "milestone", start: day(9), due: day(11) }),
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

/** ISO-8601 week number, mirroring the renderer's ganttWeekNumber (Temporal weekOfYear equivalent). */
function isoWeekNumber(date: Date): number {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / 604800000);
}

/** Reference week label in one of the three modes: W{n}, the date range, or both
 *  (GanttHeaderRenderer.formatWeekLabel / formatDateRange; same-month uses an en
 *  dash, cross-month a spaced en dash). */
function referenceWeekLabel(weekStart: Date, days: number, mode: GanttWeekLabel): string {
  const weekNum = isoWeekNumber(weekStart);
  if (mode === "weekNumber") return `W${weekNum}`;
  const end = addUtcDays(weekStart, days - 1);
  const startMonth = monthShort(weekStart);
  const range = weekStart.getUTCMonth() === end.getUTCMonth()
    ? `${startMonth} ${weekStart.getUTCDate()}–${end.getUTCDate()}`
    : `${startMonth} ${weekStart.getUTCDate()} – ${monthShort(end)} ${end.getUTCDate()}`;
  if (mode === "dateRange") return range;
  return `W${weekNum}: ${range}`;
}

/** Reference week-header labels in render order (GanttHeaderRenderer.renderWeekHeader loop). */
function referenceWeekLabels(cfg: RangeLike, mode: GanttWeekLabel): string[] {
  const labels: string[] = [];
  const start = new Date(`${cfg.startDateKey}T00:00:00Z`);
  const dow = start.getUTCDay() === 0 ? 7 : start.getUTCDay();
  const offsetToMonday = dow === 1 ? 0 : 8 - dow;
  if (offsetToMonday > 0) {
    labels.push(referenceWeekLabel(start, offsetToMonday, mode));
  }
  for (let i = offsetToMonday; i < cfg.totalDays; i += 7) {
    const date = addUtcDays(start, i);
    const daysInWeek = Math.min(7, cfg.totalDays - i);
    labels.push(referenceWeekLabel(date, daysInWeek, mode));
  }
  return labels;
}

// ───────────────────────────────────────────────────────────────────
// 5. TESTS
// ───────────────────────────────────────────────────────────────────

describe("timeline gantt DOM-structure parity", () => {
  const rows = makeFixtureRows();

  // The renderer measures the viewport through window.getComputedStyle, binds document-level
  // listeners (drag move/up, Escape) and reads body classes (is-phone, pm-resize-active); the
  // node test environment has no window, so the tests provide the minimum surface that keeps
  // those paths alive, with dispatch/listener recording for the interaction tests.
  const testBodyClasses = new Set<string>();
  const testDocumentListeners: Record<string, Array<(event: unknown) => void>> = {};
  const testWindow = {
    getComputedStyle: () => ({ paddingLeft: "0px", paddingRight: "0px" }),
    requestAnimationFrame: (_callback: () => void) => 1,
    activeDocument: {
      body: {
        addClass: (cls: string) => { testBodyClasses.add(cls); },
        removeClass: (cls: string) => { testBodyClasses.delete(cls); },
        classList: { contains: (cls: string) => testBodyClasses.has(cls) },
      },
      addEventListener: (type: string, handler: (event: unknown) => void) => {
        (testDocumentListeners[type] ??= []).push(handler);
      },
      removeEventListener: (type: string, handler: (event: unknown) => void) => {
        const list = testDocumentListeners[type];
        if (!list) return;
        const index = list.indexOf(handler);
        if (index >= 0) list.splice(index, 1);
      },
      dispatch: (type: string, event: unknown) => {
        for (const handler of [...(testDocumentListeners[type] ?? [])]) handler(event);
      },
      listenerCount: (type: string) => (testDocumentListeners[type] ?? []).length,
    },
  };

  beforeAll(() => {
    // eslint-disable-next-line obsidianmd/no-global-this -- test-only shim; product code keeps window.
    (globalThis as Record<string, unknown>).window = testWindow;
  });

  afterAll(() => {
    // eslint-disable-next-line obsidianmd/no-global-this -- test-only shim teardown.
    delete (globalThis as Record<string, unknown>).window;
  });

  function renderGantt(scale: TimelineScale, actions: MockActions = makeActions()): { tree: string; container: MockElement; config: ViewConfig } {
    const config = makeConfig(scale);
    const container = new MockElement("div");
    const renderer = new CalendarTimelineRenderer(actions);
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
      `      button[${t("timeline.scaleDay")}]`,
      `      button[${t("timeline.scaleWeek")}]`,
      `      button.mod-cta[${t("timeline.scaleMonth")}]`,
      `      button[${t("timeline.scaleQuarter")}]`,
      `      button[${t("timeline.scaleYear")}]`,
      "    span.pm-gantt-sep",
      `    button[${t("timeline.today")}]`,
      `    button[${t("timeline.expandAll")}]`,
      `    button[${t("timeline.collapseAll")}]`,
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
      "          div.clickable-icon.extra-setting-button.pm-icon-btn.pm-icon-btn--hover-only",
      "        div.pm-gantt-label-row",
      "          span.pm-gantt-label-spacer",
      "          span.pm-gantt-label-dot",
      "          span.pm-gantt-label-title[Epsilon]",
      "          div.clickable-icon.extra-setting-button.pm-icon-btn.pm-icon-btn--hover-only",
      "        div.pm-gantt-label-row",
      "          span.pm-gantt-label-spacer",
      "          span.pm-gantt-label-dot",
      "          span.pm-gantt-label-title[Beta]",
      "          div.clickable-icon.extra-setting-button.pm-icon-btn.pm-icon-btn--hover-only",
      "        div.pm-gantt-label-row",
      "          span.pm-gantt-label-spacer",
      "          span.pm-gantt-label-dot",
      "          span.pm-gantt-label-title[Gamma]",
      "          div.clickable-icon.extra-setting-button.pm-icon-btn.pm-icon-btn--hover-only",
      "        div.pm-gantt-label-row",
      "          span.pm-gantt-label-spacer",
      "          span.pm-gantt-label-dot",
      "          span.pm-gantt-label-title[Delta]",
      "          div.clickable-icon.extra-setting-button.pm-icon-btn.pm-icon-btn--hover-only",
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

  // ─────────────────────────────────────────────────────────────────
  // 6. INTERACTION PARITY (reference GanttLinkHandler / GanttView / GanttDragHandler)
  // ─────────────────────────────────────────────────────────────────

  function ganttBarGroups(container: MockElement): MockElement[] {
    const svg = container.children[1].children[2].children[1].children[0];
    return svg.children[3].children.filter((child) => child.className === "pm-gantt-bar-group");
  }

  function ganttSvg(container: MockElement): MockElement {
    return container.children[1].children[2].children[1].children[0];
  }

  /** Link dots are appended left then right; the last dot child is the right (output) dot. */
  function ganttDots(barGroup: MockElement): { left: MockElement; right: MockElement } {
    const dots = barGroup.children.filter((child) => child.className === "pm-gantt-link-dot");
    return { left: dots[0], right: dots[dots.length - 1] };
  }

  const clickEvent = () => ({ stopPropagation: () => undefined, preventDefault: () => undefined });

  it("keeps the first link dot armed when the second click is same-side, like the reference", () => {
    const { container } = renderGantt("month");
    const barGroups = ganttBarGroups(container);
    const alphaRight = ganttDots(barGroups[0]).right;
    const beta = ganttDots(barGroups[2]);

    alphaRight.dispatch("click", clickEvent());
    expect(alphaRight.className).toContain("pm-gantt-link-dot--active");

    // Same-side rejection: the reference returns with the first dot still armed.
    beta.right.dispatch("click", clickEvent());
    expect(alphaRight.className).toContain("pm-gantt-link-dot--active");

    // A real second click still commits and clears the selection.
    beta.left.dispatch("click", clickEvent());
    expect(alphaRight.className).not.toContain("pm-gantt-link-dot--active");
  });

  it("writes only the reference's own dot-highlight class on the pm-gantt tree, not the local-extension is-active/is-linking pair, matching GanttLinkHandler.ts", () => {
    const { container } = renderGantt("month");
    const barGroups = ganttBarGroups(container);
    const alphaRight = ganttDots(barGroups[0]).right;

    alphaRight.dispatch("click", clickEvent());

    // GanttLinkHandler.ts toggles only pm-gantt-link-dot--active on the dot itself; it
    // never touches a root-level "linking" class. Both is-active (styles.css scopes it
    // to .db-timeline-link-dot) and is-linking (scoped to .db-timeline) are local-
    // extension classes with no matching rule on the pm-gantt-view tree.
    expect(alphaRight.className).toContain("pm-gantt-link-dot--active");
    expect(alphaRight.className).not.toContain("is-active");
    expect(container.className).not.toContain("is-linking");
  });

  it("cancels an in-progress link with Escape from the document, like the reference", () => {
    const container = new MockElement("div", "workspace-leaf mod-active");
    const renderer = new CalendarTimelineRenderer(makeActions());
    renderer.renderTimeline(container as unknown as HTMLElement, makeConfig("month"), rows);
    const alphaRight = ganttDots(ganttBarGroups(container.children[0])[0]).right;
    alphaRight.dispatch("click", clickEvent());
    expect(alphaRight.className).toContain("pm-gantt-link-dot--active");

    testWindow.activeDocument.dispatch("keydown", { key: "Escape", preventDefault: () => undefined });
    expect(alphaRight.className).not.toContain("pm-gantt-link-dot--active");
  });

  it("removes the document keydown listener on teardown", () => {
    const before = testWindow.activeDocument.listenerCount("keydown");
    const container = new MockElement("div", "workspace-leaf mod-active");
    const renderer = new CalendarTimelineRenderer(makeActions());
    renderer.renderTimeline(container as unknown as HTMLElement, makeConfig("month"), rows);
    expect(testWindow.activeDocument.listenerCount("keydown")).toBe(before + 1);
    renderer.destroy();
    expect(testWindow.activeDocument.listenerCount("keydown")).toBe(before);
  });

  it("defers the left spacer sync to the post-layout frame, like the reference", () => {
    const config = makeConfig("month");
    const container = new MockElement("div");
    let queued: (() => void) | null = null;
    container.ownerDocument.defaultView = {
      requestAnimationFrame: (callback: () => void) => {
        queued = callback;
        return 1;
      },
    };
    const renderer = new CalendarTimelineRenderer(makeActions());
    renderer.renderTimeline(container as unknown as HTMLElement, config, rows);
    const wrapper = container.children[0].children[1];
    const leftBody = wrapper.children[0].children[1];
    const spacer = leftBody.children[leftBody.children.length - 1];
    const rightPanel = wrapper.children[2];
    rightPanel.offsetHeight = 100;
    rightPanel.clientHeight = 90;

    // Before the frame runs the spacer must not have been measured yet.
    expect(spacer.style.height).toBeUndefined();
    expect(queued).not.toBeNull();
    queued!();
    expect(spacer.style.height).toBe("10px");
  });

  it("passes wheel events from the whole left panel to the chart, like the reference", () => {
    const { container } = renderGantt("month");
    const wrapper = container.children[1];
    const leftPanel = wrapper.children[0];
    const leftBody = leftPanel.children[1];
    expect(leftPanel.hasListener("wheel")).toBe(true);
    expect(leftBody.hasListener("wheel")).toBe(false);
  });

  it("patches only the due date when the right edge is dragged, like the reference", () => {
    const { actions, writes } = makeDateWriteSpy();
    const config = makeConfig("month");
    const container = new MockElement("div");
    const renderer = new CalendarTimelineRenderer(actions);
    renderer.renderTimeline(container as unknown as HTMLElement, config, rows);

    const alphaHandles = ganttBarGroups(container.children[0])[0].children.filter((child) => child.className === "pm-gantt-drag-handle");
    alphaHandles[1].dispatch("mousedown", { button: 0, clientX: 500, stopPropagation: () => undefined, preventDefault: () => undefined });
    testWindow.activeDocument.dispatch("mousemove", { clientX: 509 });
    testWindow.activeDocument.dispatch("mouseup", {});

    expect(writes).toHaveLength(1);
    expect(writes[0].cell).toBe("end");
    const change = writes[0].change;
    expect(change.changedEdge).toBe("end");
    // The reference patch is { due } only: the start carried in the payload is the bar's
    // own unchanged start, never a value the drag produced.
    expect(change.startDateKey).toBe(addDateKeyDays(getLocalDateKey(new Date()), -3));
    expect(change.endDateKey).toBeDefined();
  });

  it("patches only the start date when the left edge is dragged, like the reference", () => {
    const { actions, writes } = makeDateWriteSpy();
    const config = makeConfig("month");
    const container = new MockElement("div");
    const renderer = new CalendarTimelineRenderer(actions);
    renderer.renderTimeline(container as unknown as HTMLElement, config, rows);

    const alphaHandles = ganttBarGroups(container.children[0])[0].children.filter((child) => child.className === "pm-gantt-drag-handle");
    alphaHandles[0].dispatch("mousedown", { button: 0, clientX: 500, stopPropagation: () => undefined, preventDefault: () => undefined });
    testWindow.activeDocument.dispatch("mousemove", { clientX: 491 });
    testWindow.activeDocument.dispatch("mouseup", {});

    expect(writes).toHaveLength(1);
    expect(writes[0].cell).toBe("start");
    expect(writes[0].change.changedEdge).toBe("start");
    expect(writes[0].change.endDateKey).toBeUndefined();
  });

  it("restores the bar to its pre-drag position when the date save is rejected, matching GanttDragHandler.ts's restore()", async () => {
    const actions = makeActions();
    actions.updateEventDates = () => Promise.reject(new Error("save failed"));
    const config = makeConfig("month");
    const container = new MockElement("div");
    const renderer = new CalendarTimelineRenderer(actions);
    renderer.renderTimeline(container as unknown as HTMLElement, config, rows);

    const barGroup = ganttBarGroups(container.children[0])[0];
    const bar = barGroup.children[0];
    const initialX = bar.getAttribute("x");
    const initialWidth = bar.getAttribute("width");
    const handles = barGroup.children.filter((child) => child.className === "pm-gantt-drag-handle");

    handles[0].dispatch("mousedown", { button: 0, clientX: 500, stopPropagation: () => undefined, preventDefault: () => undefined });
    testWindow.activeDocument.dispatch("mousemove", { clientX: 491 });
    // Mid-drag the bar tracks the pointer, away from where it started.
    expect(bar.getAttribute("x")).not.toBe(initialX);
    testWindow.activeDocument.dispatch("mouseup", {});

    // Let the rejected updateEventDates promise's .catch() run.
    await Promise.resolve();
    await Promise.resolve();

    expect(bar.getAttribute("x")).toBe(initialX);
    expect(bar.getAttribute("width")).toBe(initialWidth);
  });

  it("batches expand/collapse all through one persistence call when the view offers it", () => {
    const batchCalls: Array<{ rows: RowData[]; collapsed: boolean }> = [];
    const actions = makeActions();
    let rowToggles = 0;
    actions.toggleSubtaskCollapsed = () => { rowToggles += 1; };
    (actions as unknown as Record<string, unknown>).setSubtaskCollapsedMany = (rowsToSet: RowData[], collapsed: boolean) => {
      batchCalls.push({ rows: rowsToSet, collapsed });
    };

    const config = makeConfig("month");
    const container = new MockElement("div");
    const renderer = new CalendarTimelineRenderer(actions);
    renderer.renderTimeline(container as unknown as HTMLElement, config, rows);

    const controls = container.children[0].children[0];
    const collapseAll = controls.children.find((child) => child.text === t("timeline.collapseAll"));
    expect(collapseAll).toBeDefined();
    collapseAll!.dispatch("click", clickEvent());

    expect(batchCalls).toHaveLength(1);
    expect(batchCalls[0].collapsed).toBe(true);
    expect(batchCalls[0].rows.map((row) => row.file.path)).toEqual(["Alpha.md"]);
    expect(rowToggles).toBe(0);
  });

  it("starts the label column at 160px on phone and 280px on desktop", () => {
    const { container } = renderGantt("month");
    const left = container.children[1].children[0];
    expect(left.style.width).toBe("280px");
    expect(left.style.minWidth).toBe("280px");

    testBodyClasses.add("is-phone");
    try {
      const config = makeConfig("month");
      const phoneContainer = new MockElement("div");
      const renderer = new CalendarTimelineRenderer(makeActions());
      renderer.renderTimeline(phoneContainer as unknown as HTMLElement, config, rows);
      const phoneLeft = phoneContainer.children[0].children[1].children[0];
      expect(phoneLeft.style.width).toBe("160px");
      expect(phoneLeft.style.minWidth).toBe("160px");
    } finally {
      testBodyClasses.delete("is-phone");
    }
  });

  it("resizes the label column through pointer events with capture", () => {
    const config = makeConfig("month");
    const container = new MockElement("div");
    const renderer = new CalendarTimelineRenderer(makeActions());
    renderer.renderTimeline(container as unknown as HTMLElement, config, rows);
    const wrapper = container.children[0].children[1];
    const leftPanel = wrapper.children[0];
    const handle = wrapper.children[1];
    expect(handle.className).toContain("pm-gantt-resize-handle");

    handle.dispatch("pointerdown", { pointerId: 7, clientX: 300, preventDefault: () => undefined });
    expect(handle.pointerCaptures).toContain(7);
    expect(testBodyClasses.has("pm-resize-active")).toBe(true);

    handle.dispatch("pointermove", { pointerId: 7, clientX: 360 });
    expect(leftPanel.style.width).toBe("340px");
    expect(leftPanel.style.minWidth).toBe("340px");

    handle.dispatch("pointerup", { pointerId: 7 });
    expect(testBodyClasses.has("pm-resize-active")).toBe(false);
  });

  it("anchors the milestone on the due date when both dates exist, like the reference", () => {
    const config = makeConfig("month");
    const range = buildTimelineRangeGeometry(rows, config, "month");
    const dayWidth = range.dayWidth;
    const dueX = dateToX({ startDateKey: range.startDateKey, endDateKey: range.endDateKey, dayWidth, totalDays: range.totalDays }, addDateKeyDays(getLocalDateKey(new Date()), 11));
    const expectedCx = dueX + dayWidth / 2;

    const { container } = renderGantt("month");
    const svg = ganttSvg(container);
    const milestone = svg.children[3].children.find((child) => child.className === "pm-gantt-milestone");
    expect(milestone).toBeDefined();
    expect(milestone!.getAttribute("points")).toContain(`${expectedCx},`);

    const guide = svg.children[5].children.find((child) => child.tagName === "LINE");
    expect(guide?.getAttribute("x1")).toBe(String(expectedCx));

    const headerSvg = container.children[1].children[2].children[0].children[0];
    const label = headerSvg.children.find((child) => child.className === "pm-gantt-milestone-label");
    expect(label?.getAttribute("x")).toBe(String(expectedCx));
  });

  // ─────────────────────────────────────────────────────────────────
  // 7. WEEK-LABEL MODES (reference GanttHeaderRenderer.formatWeekLabel)
  // ─────────────────────────────────────────────────────────────────

  it("renders the three reference week-label modes in the week header, defaulting to week number", () => {
    // Fixed dates so the formats are deterministic: the padded/min-spanned week
    // range always contains both a same-month week (en dash) and a cross-month
    // week (spaced en dash), and the today-anchored range keeps the today line.
    const fixedRows = [
      makeRow("Alpha.md", { start: "2026-03-28", due: "2026-04-02" }),
      makeRow("Beta.md", { start: "2026-04-10", due: "2026-04-12" }),
    ];
    const config = makeConfig("week");
    const range = buildTimelineRangeGeometry(fixedRows, config, "week");

    const weekLabels = (container: MockElement): string[] => {
      const headerSvg = container.children[1].children[2].children[0].children[0];
      return headerSvg.children[0].children
        .filter((child) => child.className === "pm-gantt-header-week")
        .map((child) => child.text ?? "");
    };

    const renderMode = (mode: GanttWeekLabel): MockElement => {
      const modeConfig = makeConfig("week");
      modeConfig.timelineWeekLabel = mode;
      const container = new MockElement("div");
      const renderer = new CalendarTimelineRenderer(makeActions());
      renderer.renderTimeline(container as unknown as HTMLElement, modeConfig, fixedRows);
      return container.children[0];
    };

    // An unset config renders the reference default: week numbers only.
    const defaultContainer = new MockElement("div");
    new CalendarTimelineRenderer(makeActions()).renderTimeline(defaultContainer as unknown as HTMLElement, config, fixedRows);
    expect(weekLabels(defaultContainer.children[0])).toEqual(referenceWeekLabels(range, "weekNumber"));

    const dateRangeContainer = renderMode("dateRange");
    expect(weekLabels(dateRangeContainer)).toEqual(referenceWeekLabels(range, "dateRange"));
    // The two reference formats both occur: same-month "Mar 21–22" and cross-month "Mar 30 – Apr 5".
    const renderedDateRanges = weekLabels(dateRangeContainer);
    expect(renderedDateRanges.some((label) => /^[A-Z][a-z]{2} \d+–\d+$/.test(label))).toBe(true);
    expect(renderedDateRanges.some((label) => /^[A-Z][a-z]{2} \d+ – [A-Z][a-z]{2} \d+$/.test(label))).toBe(true);

    expect(weekLabels(renderMode("both"))).toEqual(referenceWeekLabels(range, "both"));
    expect(weekLabels(renderMode("both"))[0]).toMatch(/^W\d+: /);
  });

  // ─────────────────────────────────────────────────────────────────
  // 8. DEPENDS-ELSEWHERE MENU (reference TaskLabelRenderer chip menu)
  // ─────────────────────────────────────────────────────────────────

  it("opens the reference dependency menu from the depends-elsewhere chip, opening each file on click", () => {
    const rowsWithElsewhere = makeFixtureRows().map((row) => ({ ...row }));
    // Alpha depends on Beta (in view, draws an arrow) plus two files outside the view.
    rowsWithElsewhere[0].frontmatter = {
      ...rowsWithElsewhere[0].frontmatter,
      dependencies: ["Beta.md", "Projects/Outside.md", "AlsoOutside.md"],
    };
    const opened: string[] = [];
    const actions = makeActions();
    actions.openDependencyFile = (path) => { opened.push(path); };
    const config = makeConfig("month");
    const container = new MockElement("div");
    const renderer = new CalendarTimelineRenderer(actions);
    renderer.renderTimeline(container as unknown as HTMLElement, config, rowsWithElsewhere);

    const leftBody = container.children[0].children[1].children[0].children[1];
    const alphaRow = leftBody.children[0];
    const chip = alphaRow.children.find((child) => child.className.includes("pm-chip"));
    expect(chip).toBeDefined();

    mockMenus.length = 0;
    chip!.dispatch("click", clickEvent());

    expect(mockMenus).toHaveLength(1);
    const menu = mockMenus[0];
    expect(menu.items).toHaveLength(2);
    expect(menu.items.map((item) => item.title)).toEqual(["Projects/Outside", "AlsoOutside"]);
    expect(menu.items.every((item) => item.icon === "link-2")).toBe(true);
    expect(menu.showAtMouseEvent).toHaveBeenCalledTimes(1);

    menu.items[0].handler();
    menu.items[1].handler();
    expect(opened).toEqual(["Projects/Outside.md", "AlsoOutside.md"]);
  });

  it("orders the depends-elsewhere chip before the progress span, matching TaskLabelRenderer.ts's child order", () => {
    const rowsWithElsewhere = makeFixtureRows().map((row) => ({ ...row }));
    // Alpha already carries progress: 40; add one dependency outside the view so the
    // label row renders both the chip and the progress span in the same pass.
    rowsWithElsewhere[0].frontmatter = {
      ...rowsWithElsewhere[0].frontmatter,
      dependencies: ["Beta.md", "Projects/Outside.md"],
    };
    const config = makeConfig("month");
    const container = new MockElement("div");
    const renderer = new CalendarTimelineRenderer(makeActions());
    renderer.renderTimeline(container as unknown as HTMLElement, config, rowsWithElsewhere);

    const leftBody = container.children[0].children[1].children[0].children[1];
    const alphaRow = leftBody.children[0];
    const chipIndex = alphaRow.children.findIndex((child) => child.className.includes("pm-chip"));
    const progressIndex = alphaRow.children.findIndex((child) => child.className.includes("pm-gantt-label-progress"));
    expect(chipIndex).toBeGreaterThanOrEqual(0);
    expect(progressIndex).toBeGreaterThanOrEqual(0);
    expect(chipIndex).toBeLessThan(progressIndex);
  });

  // ─────────────────────────────────────────────────────────────────
  // 9. ADD-SUBTASK SEAM (reference TaskLabelRenderer add-subtask button)
  // ─────────────────────────────────────────────────────────────────

  it("routes the label-row plus button to the create-subtask seam with the parent row", () => {
    const created: RowData[] = [];
    const actions = makeActions();
    actions.createSubtaskRecord = (row) => { created.push(row); };
    let rowMenus = 0;
    actions.showRowMenu = () => { rowMenus += 1; };

    const { container } = renderGantt("month", actions);
    const leftBody = container.children[1].children[0].children[1];
    const alphaRow = leftBody.children[0];
    const plus = alphaRow.children.find((child) => child.className.includes("pm-icon-btn"));
    expect(plus).toBeDefined();
    plus!.dispatch("click", clickEvent());

    expect(created.map((row) => row.file.path)).toEqual(["Alpha.md"]);
    expect(rowMenus).toBe(0);
  });

  it("keeps the row menu as the plus-button fallback when no create-subtask seam exists", () => {
    let rowMenus = 0;
    const actions = makeActions();
    actions.showRowMenu = () => { rowMenus += 1; };

    const { container } = renderGantt("month", actions);
    const leftBody = container.children[1].children[0].children[1];
    const alphaRow = leftBody.children[0];
    const plus = alphaRow.children.find((child) => child.className.includes("pm-icon-btn"));
    plus!.dispatch("click", clickEvent());

    expect(rowMenus).toBe(1);
  });

  // ─────────────────────────────────────────────────────────────────
  // 10. UNDO/REDO KEYS (reference GanttView onKeyDown)
  // ─────────────────────────────────────────────────────────────────

  it("routes Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y to the host history stack through the actions seam", () => {
    const calls: Array<"undo" | "redo"> = [];
    const actions = makeActions();
    actions.undoGanttEdit = (direction) => { calls.push(direction); };
    const container = new MockElement("div", "workspace-leaf mod-active");
    const renderer = new CalendarTimelineRenderer(actions);
    renderer.renderTimeline(container as unknown as HTMLElement, makeConfig("month"), rows);

    const keydown = (event: Record<string, unknown>) => testWindow.activeDocument.dispatch("keydown", event);
    keydown({ key: "z", ctrlKey: true, preventDefault: () => undefined });
    keydown({ key: "z", ctrlKey: true, shiftKey: true, preventDefault: () => undefined });
    keydown({ key: "y", metaKey: true, preventDefault: () => undefined });
    expect(calls).toEqual(["undo", "redo", "redo"]);

    // Without a mod key the handler leaves the event alone.
    keydown({ key: "z", preventDefault: () => undefined });
    keydown({ key: "y", preventDefault: () => undefined });
    expect(calls).toEqual(["undo", "redo", "redo"]);
  });

  it("ignores the undo/redo keys outside the active leaf and while a drag is in progress, like the reference", () => {
    const calls: Array<"undo" | "redo"> = [];
    const actions = makeActions();
    actions.undoGanttEdit = (direction) => { calls.push(direction); };

    // No mod-active leaf: nothing reaches the seam.
    const inactiveContainer = new MockElement("div");
    const inactiveRenderer = new CalendarTimelineRenderer(actions);
    inactiveRenderer.renderTimeline(inactiveContainer as unknown as HTMLElement, makeConfig("month"), rows);
    testWindow.activeDocument.dispatch("keydown", { key: "z", ctrlKey: true, preventDefault: () => undefined });
    expect(calls).toHaveLength(0);

    // A drag in progress suppresses the keys, matching the reference's drag guard.
    const container = new MockElement("div", "workspace-leaf mod-active");
    const renderer = new CalendarTimelineRenderer(actions);
    renderer.renderTimeline(container as unknown as HTMLElement, makeConfig("month"), rows);
    const alphaHandles = ganttBarGroups(container.children[0])[0].children.filter((child) => child.className === "pm-gantt-drag-handle");
    alphaHandles[1].dispatch("mousedown", { button: 0, clientX: 500, stopPropagation: () => undefined, preventDefault: () => undefined });
    testWindow.activeDocument.dispatch("keydown", { key: "z", ctrlKey: true, preventDefault: () => undefined });
    expect(calls).toHaveLength(0);
    testWindow.activeDocument.dispatch("mouseup", {});
  });

  it("does not hijack the undo/redo keys while an input, inline editor or modal has focus", () => {
    const calls: Array<"undo" | "redo"> = [];
    const actions = makeActions();
    actions.undoGanttEdit = (direction) => { calls.push(direction); };
    const container = new MockElement("div", "workspace-leaf mod-active");
    const renderer = new CalendarTimelineRenderer(actions);
    renderer.renderTimeline(container as unknown as HTMLElement, makeConfig("month"), rows);

    const documentWithFocus = testWindow.activeDocument as { activeElement?: unknown };
    const previous = documentWithFocus.activeElement;
    documentWithFocus.activeElement = { closest: () => ({}) };
    try {
      testWindow.activeDocument.dispatch("keydown", { key: "z", ctrlKey: true, preventDefault: () => undefined });
      expect(calls).toHaveLength(0);
    } finally {
      documentWithFocus.activeElement = previous;
    }
  });
});
