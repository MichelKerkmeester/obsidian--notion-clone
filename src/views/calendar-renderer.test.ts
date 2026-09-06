// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-renderer.test
// COMPONENT: unit tests for CalendarRenderer's grid, accessibility and error paths
// ───────────────────────────────────────────────────────────────────
//
// MockElement reimplements just enough of the Obsidian DOM helper surface
// (createDiv/createEl, class list, querySelector) to drive CalendarRenderer
// without a real DOM, since the renderer is exercised directly rather than
// through a mounted view.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi, beforeAll } from "vitest";
import { CalendarRenderer, CalendarRendererActions } from "./calendar-renderer";
import { ViewConfig, RowData, ColumnDef } from "../data/types";
import { TFile } from "obsidian";
/* eslint-disable-next-line import/no-nodejs-modules --
   Asserting the phone month-chip title's flex rule means reading the stylesheet from disk —
   vitest runs `environment: "node"` here with no layout engine, so a rendered box's edges can't
   be measured; the shape of the CSS declaration is the closest in-suite proof available. */
import { readFileSync } from "fs";
import { resolve } from "path";

vi.mock("obsidian", () => ({
  setIcon: vi.fn(),
  Menu: class {
    addItem = vi.fn();
    showAtMouseEvent = vi.fn();
  },
  TFile: class {},
}));

// The day cell's create menu is the phone add path, so a test has to see the rows it
// registers. Only that one factory is replaced; everything else in the module stays real,
// because other modules in this graph import it too.
const ownedMenuRows: { icon: string; label: string; onClick: () => void }[] = [];
let ownedMenuShownAt: { x: number; y: number } | null = null;
vi.mock("./owned-menu", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./owned-menu")>()),
  createOwnedMenuForEvent: () => ({
    addRow: (row: { icon: string; label: string; onClick: () => void }) => { ownedMenuRows.push(row); },
    addSeparator: () => undefined,
    showAt: (at: { x: number; y: number }) => { ownedMenuShownAt = at; },
    close: () => undefined,
  }),
}));

vi.mock("../i18n", () => ({
  t: (key: string, vars?: Record<string, string | number>) => {
    const messages: Record<string, string> = {
      "calendar.month": "Month",
      "calendar.week": "Week",
      "calendar.day": "Day",
      "calendar.untitled": "Untitled",
      "calendar.unscheduledEmpty": "Nothing unscheduled.",
      "timeline.invalidEventsTitle": "Invalid time events",
      "timeline.invalidEventsConflictNotice": "{count} event(s) with time conflict (end ≤ start)",
      "emptyState.selectDateProperty": "Select date property",
      "emptyState.noDateFieldTitle": "No date property",
      "emptyState.noEventsTitle": "No events",
      "emptyState.noEventsMessage": "Records with a value in the selected date property will appear here.",
      "emptyState.readFailedTitle": "Failed to read calendar data",
    };
    const template = messages[key] || key;
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
  },
  getEffectiveLocale: () => "en",
}));

// ───────────────────────────────────────────────────────────────────
// 2. TEST FIXTURE
// ───────────────────────────────────────────────────────────────────

class MockElement {
  public tagName: string;
  public className: string;
  public textContent: string = "";
  public attributes = new Map<string, string>();
  public style: Record<string, string> & { setProperty: (k: string, v: string) => void };
  public dataset: Record<string, string> = {};
  public children: MockElement[] = [];
  public parentElement: MockElement | null = null;
  public isConnected = true;
  public onclick: ((e: unknown) => void) | null = null;
  public ondblclick: ((e: unknown) => void) | null = null;
  public onkeydown: ((e: unknown) => void) | null = null;
  public oncontextmenu: ((e: unknown) => void) | null = null;
  private listeners = new Map<string, Set<(e: unknown) => void>>();

  constructor(tagName = "div", className = "") {
    this.tagName = tagName.toUpperCase();
    this.className = className;
    const styles: Record<string, string> = {};
    this.style = Object.assign(styles, {
      setProperty: (k: string, v: string) => { styles[k] = v; },
    }) as Record<string, string> & { setProperty: (k: string, v: string) => void };
  }

  createDiv(options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): MockElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): MockElement {
    const el = new MockElement(tag, options.cls || "");
    if (options.text) el.textContent = options.text;
    if (options.attr) {
      for (const [k, v] of Object.entries(options.attr)) {
        el.setAttribute(k, v);
      }
    }
    this.appendChild(el);
    return el;
  }

  appendChild(child: MockElement): void {
    child.parentElement = this;
    this.children.push(child);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  setAttr(name: string, value: string): void {
    this.setAttribute(name, value);
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  addClass(cls: string): void {
    const classes = new Set(this.className.split(/\s+/).filter(Boolean));
    classes.add(cls);
    this.className = Array.from(classes).join(" ");
  }

  removeClass(cls: string): void {
    const classes = new Set(this.className.split(/\s+/).filter(Boolean));
    classes.delete(cls);
    this.className = Array.from(classes).join(" ");
  }

  toggleClass(cls: string, force?: boolean): void {
    const classes = new Set(this.className.split(/\s+/).filter(Boolean));
    const shouldAdd = force !== undefined ? force : !classes.has(cls);
    if (shouldAdd) classes.add(cls);
    else classes.delete(cls);
    this.className = Array.from(classes).join(" ");
  }

  setText(text: string): void {
    this.textContent = text;
  }

  setCssProps(props: Record<string, string>): void {
    Object.assign(this.style, props);
  }

  remove(): void {
    this.isConnected = false;
    if (this.parentElement) {
      const idx = this.parentElement.children.indexOf(this);
      if (idx >= 0) this.parentElement.children.splice(idx, 1);
    }
  }

  addEventListener(type: string, handler: (e: unknown) => void): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
  }

  removeEventListener(type: string, handler: (e: unknown) => void): void {
    this.listeners.get(type)?.delete(handler);
  }

  dispatchEvent(event: { type: string; [key: string]: unknown }): boolean {
    const set = this.listeners.get(event.type);
    if (set) {
      for (const h of set) h(event);
    }
    return true;
  }

  querySelector<T = MockElement>(selector: string): T | null {
    const results = this.querySelectorAll<T>(selector);
    return results[0] ?? null;
  }

  querySelectorAll<T = MockElement>(selector: string): T[] {
    const results: MockElement[] = [];
    const check = (node: MockElement) => {
      for (const child of node.children) {
        if (matches(child, selector)) results.push(child);
        check(child);
      }
    };
    check(this);
    return results as unknown as T[];
  }

  closest<T = MockElement>(selector: string): T | null {
    let curr: MockElement | null = this;
    while (curr) {
      if (matches(curr, selector)) return curr as unknown as T;
      curr = curr.parentElement;
    }
    return null;
  }
}

function matches(el: MockElement, selector: string): boolean {
  if (selector.startsWith(".")) {
    const cls = selector.slice(1).split("[")[0];
    const matchCls = el.className.split(/\s+/).includes(cls);
    if (!matchCls) return false;
    if (selector.includes("[role=")) {
      const roleMatch = selector.match(/\[role=([^\]]+)\]/);
      if (roleMatch && el.getAttribute("role") !== roleMatch[1]) return false;
    }
    return true;
  }
  if (selector === "button" || selector === "BUTTON") return el.tagName === "BUTTON";
  if (selector.includes("[role=")) {
    const roleMatch = selector.match(/\[role=([^\]]+)\]/);
    return el.getAttribute("role") === roleMatch?.[1];
  }
  return false;
}

beforeAll(() => {
  const fakeDoc = {
    body: new MockElement("body"),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
  };
  (globalThis as unknown as { activeDocument: unknown }).activeDocument = fakeDoc;
  (globalThis as unknown as { window: unknown }).window = {
    activeDocument: fakeDoc,
    requestAnimationFrame: (cb: () => void) => setTimeout(cb, 0) as unknown as number,
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    setInterval: globalThis.setInterval.bind(globalThis),
    clearInterval: globalThis.clearInterval.bind(globalThis),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
});

// ───────────────────────────────────────────────────────────────────
// 3. TESTS
// ───────────────────────────────────────────────────────────────────

const createMockActions = (overrides?: Partial<CalendarRendererActions>): CalendarRendererActions => ({
  openRow: vi.fn(),
  getColumns: vi.fn((): ColumnDef[] => [
    { key: "due", label: "Due Date", type: "date" as const },
    { key: "name", label: "Name", type: "text" as const },
  ]),
  ...overrides,
});

describe("CalendarRenderer Unit Tests", () => {
  const baseConfig: ViewConfig = {
    id: "calendar-view-1",
    name: "Calendar",
    sourceFolder: "notes",
    calendarStartDateField: "due",
    calendarMonth: "2026-08",
    calendarScale: "month",
    schema: {
      columns: [
        { key: "due", label: "Due Date", type: "date" as const },
        { key: "dueEnd", label: "Due End", type: "date" as const },
        { key: "name", label: "Name", type: "text" as const },
      ],
      computedFields: [],
    },
  };

  it("sets accessible title and aria-label on warning button at creation", () => {
    const actions = createMockActions({
      getCalendarInvalidEventCount: () => Promise.resolve(3),
      openCalendarInvalidEvents: vi.fn(),
    });
    const renderer = new CalendarRenderer(actions);
    const container = new MockElement("div") as unknown as HTMLElement;

    renderer.render(container, baseConfig, []);

    const warningBtn = (container as unknown as MockElement).querySelector(".db-calendar-invalid-toggle");
    expect(warningBtn).not.toBeNull();
    // Default label is set immediately at creation time
    expect(warningBtn?.getAttribute("aria-label")).toBe("Invalid time events");
    expect(warningBtn?.getAttribute("title")).toBe("Invalid time events");
  });

  it("makes renderEmpty reason-aware: only offers date config for no-date-field", () => {
    const openDateConfig = vi.fn();
    const actions = createMockActions({
      openDateConfig,
    });
    const renderer = new CalendarRenderer(actions);

    // Call render with a config that has no date field
    const container = new MockElement("div") as unknown as HTMLElement;
    const configNoDateField: ViewConfig = {
      ...baseConfig,
      calendarStartDateField: undefined,
      schema: {
        columns: [{ key: "name", label: "Name", type: "text" as const }],
        computedFields: [],
      },
    };

    renderer.render(container, configNoDateField, []);
    const actionBtn = (container as unknown as MockElement).querySelector(".db-empty-action");
    expect(actionBtn).not.toBeNull();

    // Now render with date field but no events (and no calendarMonth set)
    const container2 = new MockElement("div") as unknown as HTMLElement;
    const configNoEvents: ViewConfig = {
      ...baseConfig,
      calendarMonth: undefined,
    };
    renderer.render(container2, configNoEvents, []);
    const actionBtn2 = (container2 as unknown as MockElement).querySelector(".db-empty-action");
    // For no-events, the date property is already configured, so no action button is offered
    expect(actionBtn2).toBeNull();
  });

  it("renders month grid with grid and columnheader roles and roving tabindex", () => {
    const actions = createMockActions();
    const renderer = new CalendarRenderer(actions);
    const container = new MockElement("div") as unknown as HTMLElement;

    const sampleRow: RowData = {
      file: { path: "note1.md", name: "note1" } as unknown as TFile,
      frontmatter: { due: "2026-08-15" },
      computed: {},
    };

    renderer.render(container, baseConfig, [sampleRow]);

    const mockRoot = container as unknown as MockElement;
    const grid = mockRoot.querySelector(".db-calendar-month-grid");
    expect(grid).not.toBeNull();
    expect(grid?.getAttribute("role")).toBe("grid");

    const weekdayHeaders = mockRoot.querySelectorAll(".db-calendar-weekday");
    expect(weekdayHeaders.length).toBeGreaterThan(0);
    expect(weekdayHeaders[0].getAttribute("role")).toBe("columnheader");

    const cells = mockRoot.querySelectorAll(".db-calendar-day");
    expect(cells.length).toBeGreaterThan(0);
    expect(cells[0].getAttribute("role")).toBe("gridcell");
    // At least one cell should have tabindex="0" for roving focus
    const focusableCells = cells.filter((c) => c.getAttribute("tabindex") === "0");
    expect(focusableCells.length).toBe(1);
  });

  it("renders timed events as buttons with accessible aria-label", () => {
    const actions = createMockActions();
    const renderer = new CalendarRenderer(actions);
    const container = new MockElement("div") as unknown as HTMLElement;

    const timedConfig: ViewConfig = {
      ...baseConfig,
      calendarScale: "week",
      calendarStartDateField: "due",
      calendarEndDateField: "dueEnd",
      calendarWeekStart: "2026-08-10",
      schema: {
        columns: [
          { key: "due", label: "Due", type: "datetime" as const },
          { key: "dueEnd", label: "Due End", type: "datetime" as const },
        ],
        computedFields: [],
      },
    };

    const timedRow: RowData = {
      file: { path: "meeting.md", name: "meeting" } as unknown as TFile,
      frontmatter: { due: "2026-08-12 10:00", dueEnd: "2026-08-12 11:30" },
      computed: {},
    };

    renderer.render(container, timedConfig, [timedRow]);

    const mockRoot = container as unknown as MockElement;
    const timedEvent = mockRoot.querySelector(".db-calendar-week-timed-event");
    expect(timedEvent).not.toBeNull();
    expect(timedEvent?.tagName).toBe("BUTTON");
    expect(timedEvent?.getAttribute("type")).toBe("button");
    expect(timedEvent?.getAttribute("aria-label")).toContain("10:00");
    expect(timedEvent?.getAttribute("aria-label")).toContain("11:30");
  });

  it("handles updateEventDates failure with rollback callback and surfaces error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const updateEventDates = vi.fn().mockRejectedValue(new Error("Write failed"));
    const actions = createMockActions({ updateEventDates });
    const renderer = new CalendarRenderer(actions);

    const onRevert = vi.fn();
    const sampleRow: RowData = {
      file: { path: "note1.md", name: "note1" } as unknown as TFile,
      frontmatter: { due: "2026-08-15" },
      computed: {},
    };

    (renderer as unknown as {
      safeUpdateEventDates: (row: RowData, change: unknown, onRevert?: () => void) => void;
    }).safeUpdateEventDates(sampleRow, { startField: "due", startDateKey: "2026-08-20", changedEdge: "both" }, onRevert);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(updateEventDates).toHaveBeenCalled();
    expect(onRevert).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("reports read-failed empty state when renderEmpty is called with read-failed", () => {
    const actions = createMockActions();
    const renderer = new CalendarRenderer(actions);
    const container = new MockElement("div") as unknown as HTMLElement;

    (renderer as unknown as { renderEmpty: (container: HTMLElement, reason: string) => void })
      .renderEmpty(container, "read-failed");

    const mockRoot = container as unknown as MockElement;
    const emptyCard = mockRoot.querySelector(".db-empty-card");
    expect(emptyCard).not.toBeNull();
    expect(emptyCard?.getAttribute("data-empty-reason")).toBe("read-failed");
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. PARITY BEHAVIOURS (completion-aware marking, weekend headers, calm empty copy)
// ───────────────────────────────────────────────────────────────────

describe("Calendar parity behaviours", () => {
  const parityConfig: ViewConfig = {
    id: "calendar-view-parity",
    name: "Calendar",
    sourceFolder: "notes",
    calendarStartDateField: "due",
    calendarMonth: "2026-08",
    calendarScale: "month",
    schema: {
      columns: [
        { key: "due", label: "Due Date", type: "date" as const },
        { key: "done", label: "Done", type: "checkbox" as const },
      ],
      computedFields: [],
    },
  };

  const makeRow = (path: string, frontmatter: Record<string, unknown>): RowData => ({
    file: Object.assign(new TFile(), { path, name: path.replace(/\.md$/, "") }),
    frontmatter,
    computed: {},
  });

  const eventForPath = (root: MockElement, selector: string, path: string): MockElement | undefined =>
    root.querySelectorAll(selector).find((el) => el.getAttribute("data-note-database-row-path") === path);

  const isWeekendKey = (dateKey: string): boolean => {
    const dow = new Date(Date.UTC(Number(dateKey.slice(0, 4)), Number(dateKey.slice(5, 7)) - 1, Number(dateKey.slice(8, 10)))).getUTCDay();
    return dow === 0 || dow === 6;
  };

  it("marks a completed-row event distinctly from an open one in the month grid", () => {
    const renderer = new CalendarRenderer(createMockActions());
    const container = new MockElement("div") as unknown as HTMLElement;

    renderer.render(container, parityConfig, [
      makeRow("done-note.md", { due: "2026-08-15", done: true }),
      makeRow("open-note.md", { due: "2026-08-16", done: false }),
    ]);

    const root = container as unknown as MockElement;
    const doneSegment = eventForPath(root, ".db-calendar-month-segment", "done-note.md");
    const openSegment = eventForPath(root, ".db-calendar-month-segment", "open-note.md");
    expect(doneSegment).toBeDefined();
    expect(openSegment).toBeDefined();
    expect(doneSegment?.className.split(/\s+/)).toContain("is-completed");
    expect(openSegment?.className.split(/\s+/)).not.toContain("is-completed");
  });

  it("marks a completed-row event in the week all-day strip", () => {
    const renderer = new CalendarRenderer(createMockActions());
    const container = new MockElement("div") as unknown as HTMLElement;
    const allDayConfig: ViewConfig = {
      ...parityConfig,
      calendarScale: "week",
      calendarWeekStart: "2026-08-10",
    };

    renderer.render(container, allDayConfig, [
      makeRow("done-week.md", { due: "2026-08-11", dueEnd: "2026-08-12", done: true }),
      makeRow("open-week.md", { due: "2026-08-13", done: false }),
    ]);

    const root = container as unknown as MockElement;
    const doneSegment = eventForPath(root, ".db-calendar-week-allday-segment", "done-week.md");
    const openSegment = eventForPath(root, ".db-calendar-week-allday-segment", "open-week.md");
    expect(doneSegment).toBeDefined();
    expect(openSegment).toBeDefined();
    expect(doneSegment?.className.split(/\s+/)).toContain("is-completed");
    expect(openSegment?.className.split(/\s+/)).not.toContain("is-completed");
  });

  it("marks a completed-row event on timed week events", () => {
    const renderer = new CalendarRenderer(createMockActions());
    const container = new MockElement("div") as unknown as HTMLElement;
    const timedConfig: ViewConfig = {
      ...parityConfig,
      calendarScale: "week",
      calendarWeekStart: "2026-08-10",
      calendarEndDateField: "dueEnd",
      schema: {
        columns: [
          { key: "due", label: "Due", type: "datetime" as const },
          { key: "dueEnd", label: "Due End", type: "datetime" as const },
          { key: "done", label: "Done", type: "checkbox" as const },
        ],
        computedFields: [],
      },
    };

    renderer.render(container, timedConfig, [
      makeRow("meeting-done.md", { due: "2026-08-12 10:00", dueEnd: "2026-08-12 11:00", done: true }),
      makeRow("meeting-open.md", { due: "2026-08-12 14:00", dueEnd: "2026-08-12 15:00", done: false }),
    ]);

    const root = container as unknown as MockElement;
    const doneEvent = eventForPath(root, ".db-calendar-week-timed-event", "meeting-done.md");
    const openEvent = eventForPath(root, ".db-calendar-week-timed-event", "meeting-open.md");
    expect(doneEvent).toBeDefined();
    expect(openEvent).toBeDefined();
    expect(doneEvent?.className.split(/\s+/)).toContain("is-completed");
    expect(openEvent?.className.split(/\s+/)).not.toContain("is-completed");
  });

  it("identifies completed vs open rows for the unscheduled popover", () => {
    // The popover itself opens through the shared owned-menu primitive, which needs a real
    // document this lightweight harness does not provide (see owned-menu.test.ts for that
    // coverage). What is calendar-specific is which rows the popover marks completed, and that
    // is `isRowCompleted` — the same call `openUnscheduledMenu` makes per row.
    const renderer = new CalendarRenderer(createMockActions()) as unknown as {
      isRowCompleted(row: RowData, config: ViewConfig): boolean;
    };
    const doneRow = makeRow("unscheduled-done.md", { done: true });
    const openRow = makeRow("unscheduled-open.md", { done: false });
    expect(renderer.isRowCompleted(doneRow, parityConfig)).toBe(true);
    expect(renderer.isRowCompleted(openRow, parityConfig)).toBe(false);
  });

  it("marks weekend day cells and matching header labels in the month grid", () => {
    const renderer = new CalendarRenderer(createMockActions());
    const container = new MockElement("div") as unknown as HTMLElement;

    renderer.render(container, parityConfig, []);

    const root = container as unknown as MockElement;
    const cells = root.querySelectorAll(".db-calendar-day");
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      const dateKey = cell.getAttribute("data-date-key") || "";
      const hasWeekend = cell.className.split(/\s+/).includes("is-weekend");
      expect(hasWeekend).toBe(isWeekendKey(dateKey));
    }

    // The weekday label row marks the same columns as the first grid week.
    const weekdays = root.querySelectorAll(".db-calendar-weekday");
    const firstWeekCells = cells.slice(0, 7);
    expect(weekdays.length).toBe(7);
    firstWeekCells.forEach((cell, index) => {
      const cellIsWeekend = cell.className.split(/\s+/).includes("is-weekend");
      expect(weekdays[index].className.split(/\s+/).includes("is-weekend")).toBe(cellIsWeekend);
    });
  });

  it("marks weekend day headers in the week view", () => {
    const renderer = new CalendarRenderer(createMockActions());
    const container = new MockElement("div") as unknown as HTMLElement;
    const weekConfig: ViewConfig = {
      ...parityConfig,
      calendarScale: "week",
      calendarWeekStart: "2026-08-10",
    };

    renderer.render(container, weekConfig, []);

    const root = container as unknown as MockElement;
    const headers = root.querySelectorAll(".db-calendar-time-header-day");
    expect(headers.length).toBe(7);
    for (const header of headers) {
      const dateKey = header.getAttribute("data-date-key") || "";
      expect(header.className.split(/\s+/).includes("is-weekend")).toBe(isWeekendKey(dateKey));
    }
  });

  it("renders no unscheduled chip, and no band of any kind, when nothing is unscheduled", () => {
    const renderer = new CalendarRenderer(createMockActions());
    const container = new MockElement("div") as unknown as HTMLElement;

    renderer.render(container, parityConfig, [makeRow("scheduled.md", { due: "2026-08-15", done: false })]);

    const root = container as unknown as MockElement;
    expect(root.querySelector(".db-calendar-unscheduled-chip")).toBeNull();
    expect(root.querySelector(".db-calendar-backlog")).toBeNull();
  });

  it("renders the unscheduled chip beside the title, and no band, once an unscheduled row exists", () => {
    const renderer = new CalendarRenderer(createMockActions());
    const container = new MockElement("div") as unknown as HTMLElement;

    renderer.render(container, parityConfig, [makeRow("unscheduled.md", { done: false })]);

    const root = container as unknown as MockElement;
    const chip = root.querySelector(".db-calendar-unscheduled-chip");
    expect(chip).not.toBeNull();
    expect(chip?.textContent).toContain("1");
    // Beside the title, not a sibling band: the chip is a child of .db-calendar-title.
    expect(chip?.parentElement?.className.split(/\s+/)).toContain("db-calendar-title");
    expect(root.querySelector(".db-calendar-backlog")).toBeNull();
  });

  it("keeps a create path on every day cell for pointers that have no + glyph", () => {
    // The + is hidden on coarse pointers, so the day cell itself has to carry the
    // add path or a phone operator loses the affordance outright. Long-press
    // arrives as contextmenu; the menu it opens is what this asserts.
    ownedMenuRows.length = 0;
    ownedMenuShownAt = null;
    const createEntryForDate = vi.fn();
    const renderer = new CalendarRenderer(createMockActions({ createEntryForDate }));
    const container = new MockElement("div") as unknown as HTMLElement;

    renderer.render(container, parityConfig, [makeRow("scheduled.md", { due: "2026-08-15", done: false })]);

    const root = container as unknown as MockElement;
    const cells = root.querySelectorAll(".db-calendar-day");
    expect(cells.length).toBeGreaterThan(0);
    const cell = cells.find((el) => typeof el.oncontextmenu === "function");
    expect(cell).toBeDefined();

    cell?.oncontextmenu?.({ preventDefault: () => undefined, stopPropagation: () => undefined, clientX: 12, clientY: 34 });

    expect(ownedMenuShownAt).toEqual({ x: 12, y: 34 });
    const createRow = ownedMenuRows.find((row) => row.icon === "plus");
    expect(createRow).toBeDefined();
    createRow?.onClick();
    expect(createEntryForDate).toHaveBeenCalledTimes(1);
    expect(createEntryForDate.mock.calls[0][1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Negative control: a read-only view offers no create path at all, so a passing
    // assertion above is the affordance and not an always-present handler.
    const readOnly = new CalendarRenderer(createMockActions({ createEntryForDate, isReadOnly: true }));
    const roContainer = new MockElement("div") as unknown as HTMLElement;
    readOnly.render(roContainer, parityConfig, [makeRow("scheduled.md", { due: "2026-08-15", done: false })]);
    ownedMenuRows.length = 0;
    const roCell = (roContainer as unknown as MockElement).querySelectorAll(".db-calendar-day").find((el) => typeof el.oncontextmenu === "function");
    roCell?.oncontextmenu?.({ preventDefault: () => undefined, stopPropagation: () => undefined, clientX: 1, clientY: 1 });
    expect(ownedMenuRows.find((row) => row.icon === "plus")).toBeUndefined();
  });

  it("renders the calm empty-state title for no-events through the renderer", () => {
    const renderer = new CalendarRenderer(createMockActions());
    const container = new MockElement("div") as unknown as HTMLElement;

    renderer.render(container, { ...parityConfig, calendarMonth: undefined }, []);

    const root = container as unknown as MockElement;
    const title = root.querySelector(".db-empty-card-title");
    expect(title?.textContent).toBe("No events");
  });

  it("reads the calm empty-state copy from the real dictionary", async () => {
    const actual = await vi.importActual<typeof import("../i18n")>("../i18n");
    expect(actual.t("emptyState.noEventsTitle")).toBe("No events");
    expect(actual.t("emptyState.noEventsMessage")).toBe("Records with a value in the selected date property will appear here.");
    expect(actual.t("calendar.unscheduledEmpty")).toBe("Nothing unscheduled.");
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. PHONE MONTH-CHIP TITLE: ELLIPSIS STAYS INSIDE THE CELL
// ───────────────────────────────────────────────────────────────────
//
// A flat month-grid chip's title carries `flex: 1 0 min(8ch, 100%)`: shrink
// disabled, floored at an 8-character basis. On a wide desktop column that
// floor never binds, but on a narrow phone day cell the title's box holds
// that basis regardless of how little room the cell actually has — its own
// right edge lands past the cell, and the segment's `overflow: hidden` (the
// phone-only touch-floor rule) then hard-clips the title mid-glyph instead of
// showing the ellipsis its own `text-overflow` would otherwise paint.
//
// vitest runs `environment: "node"` here (see vitest.config.ts) — no jsdom,
// no layout engine — so there is no rendered box to call getBoundingClientRect
// on. The stylesheet declaration is what actually decides whether the title's
// box can shrink to fit, so this suite reads it and asserts on its shape
// instead, mirroring cell-popover-coordinate-space.test.ts's same reasoning.

describe("phone month-chip title ellipsis", () => {
  const stylesContent = readFileSync(resolve(__dirname, "../../styles.css"), "utf-8");

  /** The first `{ ... }` block whose selector line matches `selectorPattern`. */
  function ruleBody(selectorPattern: RegExp): string {
    const match = selectorPattern.exec(stylesContent);
    expect(match, `expected a rule for ${selectorPattern}`).not.toBeNull();
    const braceStart = stylesContent.indexOf("{", match!.index);
    const braceEnd = stylesContent.indexOf("}", braceStart);
    return stylesContent.slice(braceStart + 1, braceEnd);
  }

  it("lets the phone month-grid chip title shrink to the cell's own width", () => {
    // This is the exact chip renderMonthSegments draws (calendar-renderer.ts) — the
    // week-all-day strip and the day-popover copy have their own title rules and are
    // not what this selector matches.
    const body = ruleBody(
      /\.is-phone \.note-database-container \.db-calendar-month-week > \.db-calendar-month-segment > \.db-calendar-month-title \{/
    );
    // flex-shrink 1 (not 0) with a 0 basis: the title's box is bounded by whatever
    // space the segment actually has, so its right edge can never sit past the
    // cell's — which is what makes the ellipsis land inside the cell instead of
    // past it once the segment clips the box.
    expect(body).toMatch(/flex:\s*1 1 0;/);
    expect(body).toMatch(/min-width:\s*0;/);
    expect(body).toMatch(/overflow:\s*hidden;/);
    expect(body).toMatch(/text-overflow:\s*ellipsis;/);
    expect(body).toMatch(/white-space:\s*nowrap;/);
  });

  it("leaves the desktop month-chip title's shrink-disabled floor untouched", () => {
    // Negative control: the base (unscoped) rule is what every month chip falls
    // back to without the phone override above. It still floors the title at an
    // 8-character basis with shrink disabled — reverting the phone rule (deleting
    // it, or widening its selector off `.is-phone`) leaves exactly this shape in
    // effect, which is the state that produced the overflow this suite guards.
    const body = ruleBody(/\.note-database-container \.db-calendar-month-title \{/);
    expect(body).toMatch(/flex:\s*1 0 min\(8ch, 100%\);/);
  });

  it("scopes the shrink relaxation to .is-phone, not a bare width breakpoint", () => {
    // Desktop must be unaffected: the shrink override selector should appear exactly
    // once in the whole stylesheet, and only prefixed with `.is-phone` — never as a
    // plain `@media` width query, which would also catch a narrow desktop window
    // that was never flagged as a phone.
    const selector = ".db-calendar-month-week > .db-calendar-month-segment > .db-calendar-month-title {";
    const occurrences = stylesContent.split(selector).length - 1;
    expect(occurrences).toBe(1);
    const selectorIndex = stylesContent.indexOf(selector);
    const linesBefore = stylesContent.slice(0, selectorIndex).split("\n");
    expect(linesBefore[linesBefore.length - 1]).toContain(".is-phone ");
  });
});
