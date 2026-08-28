import { setIcon } from "obsidian";
import { addDateKeyDays, dateKeyDaysBetween } from "../data/CalendarDateTime";
import { buildCalendarTimelineEvents, CalendarDayModel, CalendarTimelineEvent } from "../data/CalendarTimelineModel";
import { RowData, ViewConfig } from "../data/types";
import { getEffectiveLocale, t } from "../i18n";
import { isImeComposing } from "../data/KeyboardUtils";

export type MiniCalendarMode = "day" | "month" | "year";

export interface MiniCalendarEventIndex {
  dateKeys: Set<string>;
  monthKeys: Set<string>;
  yearKeys: Set<string>;
}

export interface MiniCalendarEventIndexOptions {
  rows: RowData[];
  config: ViewConfig;
  startField: string;
  endField?: string;
}

export interface MiniCalendarOptions {
  popover: HTMLElement;
  mode: MiniCalendarMode;
  monthKey: string;
  monthTitle: string;
  visibleYear: number;
  yearRangeStart: number;
  weeks: CalendarDayModel[][];
  weekdays: string[];
  todayKey: string;
  selectedKeys: Set<string>;
  eventIndex: MiniCalendarEventIndex;
  onPrevious(): void;
  onNext(): void;
  onTitleClick(): void;
  onSelectDate(dateKey: string): void;
  onNavigateDate?(dateKey: string): void;
  onSelectMonth(monthKey: string): void;
  onSelectYear(year: number): void;
  onSelectToday(todayKey: string): void;
  footerAction?: {
    label: string;
    onSelect(): void;
  };
}

export function buildMiniCalendarEventIndex(options: MiniCalendarEventIndexOptions): MiniCalendarEventIndex {
  const index: MiniCalendarEventIndex = {
    dateKeys: new Set(),
    monthKeys: new Set(),
    yearKeys: new Set(),
  };
  if (!options.startField) return index;
  const events = buildCalendarTimelineEvents(options.rows, options.config, {
    startField: options.startField,
    endField: options.endField,
    titleField: undefined,
    colorField: undefined,
  });
  for (const event of events) {
    if (event.isInvalid) continue;
    addDateRangeToIndex(index, event.startDateKey, getMiniCalendarEventIndexEndDate(event));
  }
  return index;
}

export function renderMiniCalendar(options: MiniCalendarOptions): void {
  const { popover } = options;
  popover.empty();

  const head = popover.createDiv({ cls: "db-calendar-mini-head" });
  const prevBtn = head.createEl("button", {
    cls: "db-calendar-mini-nav",
    attr: { type: "button", "aria-label": getPreviousLabel(options.mode) },
  });
  setIcon(prevBtn, "chevron-left");
  prevBtn.onclick = (event) => {
    event.stopPropagation();
    options.onPrevious();
  };

  const title = head.createEl("button", {
    cls: "db-calendar-mini-title db-calendar-mini-title-button",
    text: getMiniCalendarTitle(options),
    attr: { type: "button" },
  });
  title.onclick = (event) => {
    event.stopPropagation();
    options.onTitleClick();
  };

  const nextBtn = head.createEl("button", {
    cls: "db-calendar-mini-nav",
    attr: { type: "button", "aria-label": getNextLabel(options.mode) },
  });
  setIcon(nextBtn, "chevron-right");
  nextBtn.onclick = (event) => {
    event.stopPropagation();
    options.onNext();
  };

  if (options.mode === "day") {
    renderMiniCalendarDayGrid(options);
  } else if (options.mode === "month") {
    renderMiniCalendarMonthGrid(options);
  } else {
    renderMiniCalendarYearGrid(options);
  }

  const footer = popover.createDiv({ cls: "db-calendar-mini-footer" });
  if (options.footerAction) {
    const action = footer.createEl("button", {
      cls: "db-calendar-mini-footer-action",
      text: options.footerAction.label,
      attr: { type: "button" },
    });
    action.onclick = (event) => {
      event.stopPropagation();
      options.footerAction?.onSelect();
    };
  }
  const todayKey = options.todayKey;
  const today = footer.createEl("button", {
    cls: "db-calendar-mini-today",
    text: t("calendar.today"),
    attr: { type: "button" },
  });
  today.onclick = (event) => {
    event.stopPropagation();
    options.onSelectToday(todayKey);
  };
}

function renderMiniCalendarDayGrid(options: MiniCalendarOptions): void {
  const weekdayRow = options.popover.createDiv({ cls: "db-calendar-mini-weekdays" });
  weekdayRow.setAttr("role", "row");
  for (const label of options.weekdays) {
    weekdayRow.createDiv({ cls: "db-calendar-mini-weekday", text: label, attr: { role: "columnheader" } });
  }

  const grid = options.popover.createDiv({ cls: "db-calendar-mini-grid" });
  grid.setAttr("role", "grid");
  grid.setAttr("aria-label", options.monthTitle);
  const selectedDate = getFirstSelectedDate(options);
  const focusIndex = Math.max(0, options.weeks.flat().findIndex((day) => day.dateKey === selectedDate || day.dateKey === options.todayKey));
  const rows = options.weeks.flat();
  for (const week of options.weeks) {
    const row = grid.createDiv({ cls: "db-calendar-mini-week", attr: { role: "row" } });
    for (const day of week) {
      const dayIndex = rows.findIndex((candidate) => candidate.dateKey === day.dateKey);
      const hasEvents = options.eventIndex.dateKeys.has(day.dateKey) || day.events.length > 0;
      const cell = row.createEl("button", {
        cls: [
          "db-calendar-mini-day",
          day.inCurrentMonth ? "" : "is-outside",
          day.dateKey === options.todayKey ? "is-today" : "",
          options.selectedKeys.has(day.dateKey) ? "is-selected" : "",
          hasEvents ? "has-events" : "",
        ].filter(Boolean).join(" "),
        attr: {
          type: "button",
          role: "gridcell",
          "data-date-key": day.dateKey,
          title: day.dateKey,
          "aria-selected": options.selectedKeys.has(day.dateKey) ? "true" : "false",
          ...(day.dateKey === options.todayKey ? { "aria-current": "date" } : {}),
          tabindex: dayIndex === focusIndex ? "0" : "-1",
        },
      });
      cell.createSpan({ cls: "db-calendar-mini-day-num", text: String(Number(day.dateKey.slice(8, 10))) });
      cell.createSpan({ cls: "db-calendar-mini-day-dot" });
      cell.onclick = (event) => {
        event.stopPropagation();
        options.onSelectDate(day.dateKey);
      };
    }
  }
  grid.onkeydown = (event) => {
    if (isImeComposing(event)) return;
    const target = event.target as HTMLElement | null;
    const cells = Array.from(grid.querySelectorAll<HTMLButtonElement>("[role=gridcell]"));
    const index = target ? cells.indexOf(target as HTMLButtonElement) : -1;
    if (index < 0) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      cells[index].click();
      return;
    }
    let nextIndex: number | undefined;
    if (event.key === "ArrowLeft") nextIndex = index - 1;
    if (event.key === "ArrowRight") nextIndex = index + 1;
    if (event.key === "ArrowUp") nextIndex = index - 7;
    if (event.key === "ArrowDown") nextIndex = index + 7;
    if (event.key === "Home") nextIndex = index - (index % 7);
    if (event.key === "End") nextIndex = index + (6 - (index % 7));
    if (event.key === "PageUp") {
      event.preventDefault();
      options.onPrevious();
      return;
    }
    if (event.key === "PageDown") {
      event.preventDefault();
      options.onNext();
      return;
    }
    if (nextIndex == null || nextIndex < 0 || nextIndex >= cells.length) return;
    event.preventDefault();
    const next = cells[nextIndex];
    const dateKey = next.getAttribute("data-date-key");
    if (dateKey && next.hasClass("is-outside")) {
      options.onNavigateDate?.(dateKey);
      return;
    }
    focusCalendarCell(cells, nextIndex);
  };
}

function renderMiniCalendarMonthGrid(options: MiniCalendarOptions): void {
  const grid = options.popover.createDiv({ cls: "db-calendar-mini-view-grid is-month-grid" });
  grid.setAttr("role", "grid");
  grid.setAttr("aria-label", getMiniCalendarTitle(options));
  const eventIndex = options.eventIndex;
  const selectedMonth = getSelectedMonthKey(options);
  for (let month = 0; month < 12; month++) {
    const monthKey = `${String(options.visibleYear).padStart(4, "0")}-${String(month + 1).padStart(2, "0")}`;
    const hasEvents = eventIndex.monthKeys.has(monthKey);
    const cell = grid.createEl("button", {
      cls: [
        "db-calendar-mini-view-cell",
        selectedMonth === monthKey ? "is-selected" : "",
        options.todayKey.startsWith(monthKey) ? "is-today" : "",
        hasEvents ? "has-events" : "",
      ].filter(Boolean).join(" "),
      attr: {
        type: "button",
        role: "gridcell",
        "data-month-key": monthKey,
        title: monthKey,
        "aria-selected": selectedMonth === monthKey ? "true" : "false",
        ...(options.todayKey.startsWith(monthKey) ? { "aria-current": "date" } : {}),
        tabindex: selectedMonth === monthKey ? "0" : "-1",
      },
    });
    cell.createSpan({ cls: "db-calendar-mini-view-label", text: getMonthLabel(options.visibleYear, month) });
    cell.createSpan({ cls: "db-calendar-mini-view-dot" });
    cell.onclick = (event) => {
      event.stopPropagation();
      options.onSelectMonth(monthKey);
    };
  }
  addCalendarGridNavigation(grid, 4, options.onPrevious, options.onNext);
}

function renderMiniCalendarYearGrid(options: MiniCalendarOptions): void {
  const grid = options.popover.createDiv({ cls: "db-calendar-mini-view-grid is-year-grid" });
  grid.setAttr("role", "grid");
  grid.setAttr("aria-label", getMiniCalendarTitle(options));
  const eventIndex = options.eventIndex;
  const selectedYear = getSelectedYear(options);
  for (let offset = 0; offset < 12; offset++) {
    const year = options.yearRangeStart + offset;
    const yearKey = String(year);
    const hasEvents = eventIndex.yearKeys.has(String(year));
    const cell = grid.createEl("button", {
      cls: [
        "db-calendar-mini-view-cell",
        selectedYear === year ? "is-selected" : "",
        options.todayKey.startsWith(yearKey) ? "is-today" : "",
        hasEvents ? "has-events" : "",
      ].filter(Boolean).join(" "),
      attr: {
        type: "button",
        role: "gridcell",
        "data-year": yearKey,
        title: yearKey,
        "aria-selected": selectedYear === year ? "true" : "false",
        ...(options.todayKey.startsWith(yearKey) ? { "aria-current": "date" } : {}),
        tabindex: selectedYear === year ? "0" : "-1",
      },
    });
    cell.createSpan({ cls: "db-calendar-mini-view-label", text: yearKey });
    cell.createSpan({ cls: "db-calendar-mini-view-dot" });
    cell.onclick = (event) => {
      event.stopPropagation();
      options.onSelectYear(year);
    };
  }
  addCalendarGridNavigation(grid, 4, options.onPrevious, options.onNext);
}

function addCalendarGridNavigation(
  grid: HTMLElement,
  columns: number,
  onPrevious: () => void,
  onNext: () => void,
): void {
  grid.onkeydown = (event) => {
    if (isImeComposing(event)) return;
    const target = event.target as HTMLElement | null;
    const cells = Array.from(grid.querySelectorAll<HTMLButtonElement>("[role=gridcell]"));
    const index = target ? cells.indexOf(target as HTMLButtonElement) : -1;
    if (index < 0) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      cells[index].click();
      return;
    }
    let nextIndex: number | undefined;
    if (event.key === "ArrowLeft") nextIndex = index - 1;
    if (event.key === "ArrowRight") nextIndex = index + 1;
    if (event.key === "ArrowUp") nextIndex = index - columns;
    if (event.key === "ArrowDown") nextIndex = index + columns;
    if (event.key === "Home") nextIndex = index - (index % columns);
    if (event.key === "End") nextIndex = index + (columns - 1 - (index % columns));
    if (event.key === "PageUp") { event.preventDefault(); onPrevious(); return; }
    if (event.key === "PageDown") { event.preventDefault(); onNext(); return; }
    if (nextIndex == null || nextIndex < 0 || nextIndex >= cells.length) return;
    event.preventDefault();
    focusCalendarCell(cells, nextIndex);
  };
}

function focusCalendarCell(cells: HTMLButtonElement[], index: number): void {
  cells.forEach((cell, cellIndex) => cell.setAttr("tabindex", cellIndex === index ? "0" : "-1"));
  cells[index]?.focus();
  cells[index]?.scrollIntoView?.({ block: "nearest" });
}

function getFirstSelectedDate(options: MiniCalendarOptions): string | undefined {
  return Array.from(options.selectedKeys)[0];
}

function addDateRangeToIndex(index: MiniCalendarEventIndex, start: string, end: string): void {
  const span = dateKeyDaysBetween(start, end);
  const totalDays = span == null ? 0 : Math.max(0, Math.min(span, 3660));
  for (let offset = 0; offset <= totalDays; offset++) {
    const dateKey = addDateKeyDays(start, offset);
    addDateKeyToIndex(index, dateKey);
  }
  if (span != null && span > totalDays) addDateKeyToIndex(index, end);
}

function getMiniCalendarEventIndexEndDate(event: CalendarTimelineEvent): string {
  if (event.endIsDateOnly) return event.endDateKey;
  if (event.endDateKey <= event.startDateKey) return event.endDateKey;
  return (event.endMinutes ?? 0) <= 0 ? addDateKeyDays(event.endDateKey, -1) : event.endDateKey;
}

function addDateKeyToIndex(index: MiniCalendarEventIndex, dateKey: string): void {
  index.dateKeys.add(dateKey);
  index.monthKeys.add(dateKey.slice(0, 7));
  index.yearKeys.add(dateKey.slice(0, 4));
}

function getMiniCalendarTitle(options: MiniCalendarOptions): string {
  if (options.mode === "month") return String(options.visibleYear);
  if (options.mode === "year") return `${options.yearRangeStart}–${options.yearRangeStart + 11}`;
  return options.monthTitle;
}

function getSelectedMonthKey(options: MiniCalendarOptions): string {
  const selected = Array.from(options.selectedKeys)[0];
  return selected?.slice(0, 7) || options.monthKey;
}

function getSelectedYear(options: MiniCalendarOptions): number {
  const selected = Array.from(options.selectedKeys)[0];
  const year = Number(selected?.slice(0, 4));
  return Number.isFinite(year) ? year : options.visibleYear;
}

function getMonthLabel(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat(getEffectiveLocale(), { month: "short" }).format(new Date(year, monthIndex, 1));
}

function getPreviousLabel(mode: MiniCalendarMode): string {
  if (mode === "month") return t("calendar.prevYear");
  if (mode === "year") return t("calendar.prevYearRange");
  return t("calendar.prevMonth");
}

function getNextLabel(mode: MiniCalendarMode): string {
  if (mode === "month") return t("calendar.nextYear");
  if (mode === "year") return t("calendar.nextYearRange");
  return t("calendar.nextMonth");
}
