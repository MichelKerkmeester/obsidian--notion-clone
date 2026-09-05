// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-timeline-model
// COMPONENT: timeline/calendar window resolution, event building, and lane assignment
// ───────────────────────────────────────────────────────────────────
//
// The model keeps every dated row in memory regardless of the visible
// window (windowPosition: before/visible/after) instead of filtering rows
// out, so paging the timeline doesn't change row counts out from under the
// renderer and off-window events can still render as jump indicators.
// isInvalidEventRange exists because a negative-interval event (start >=
// end) must be hidden from the timeline rather than rendered nonsensically,
// while still being surfaced elsewhere for the user to repair. Field-value
// extraction (getRowFieldValue/getTimelineFileFieldValue) is centralized
// here so the calendar's own event-timing logic (calendar-layout-model.ts)
// and the timeline's grouping logic can't independently diverge on how a
// date-like column's value is read.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { getColumnDisplayType } from "./column-display";
import { toBooleanValue } from "./column-types";
import { isDateLikeColumnType, parseDateTimeParts } from "./date-time-format";
import { getDefaultGroupOrder, getEffectiveGroupOrder } from "./group-order";
import { formatGroupKeyDisplay, getDateGroupMode } from "./group-display";
import { isEmptyGroupVisibilityColumn, shouldShowEmptyGroups } from "./group-visibility";
import { stringifyValue } from "./stringify";
import { resolveTitleFieldDisplay } from "./title-field-display";
import type { LocaleCode } from "../i18n";
import { ColumnDef, RowData, TimelineScale, ViewConfig } from "./types";
import {
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
  addDateKeyDays,
  addUtcDays,
  dateKeyDaysBetween,
  dateKeyFromUtc,
  makeUtcDate,
  minuteOfDay,
  parseDateKeyToUtc as parseDateKey,
  renderNow,
} from "./calendar-date-time";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES & CONSTANTS
// ───────────────────────────────────────────────────────────────────

export const UNCATEGORIZED_TIMELINE_LANE = "__uncategorized__";

export interface CalendarTimelineEvent {
  id: string;
  title: string;
  titleIsEmpty?: boolean;
  filePath: string;
  row: RowData;
  startDateKey: string;
  endDateKey: string;
  /** Column-unit offset from the visible window start (day scale uses hours; other scales use days). */
  offsetUnits: number;
  /** Number of column units the event spans on screen. */
  durationUnits: number;
  /** Integer grid-line offset for CSS grid placement when the visual offset is fractional. */
  gridOffsetUnits?: number;
  /** Integer grid span that contains the precise visual duration. */
  gridDurationUnits?: number;
  /** Whole-day span (daysBetween(start,end)+1); kept for drag end-date math. */
  durationDays: number;
  timelineRow?: number;
  /** Manual-order rank for same-startDate tiebreaking on a same-day reorder. */
  manualRank?: string;
  /** Day-scale start time in minutes from midnight (when a time component exists). */
  startMinutes?: number;
  /** Day-scale end time in minutes from midnight. */
  endMinutes?: number;
  /** 结束字段是否为纯 date 列（含末天：渲染结束端按 +1 天）；datetime 列为精确结束时刻。 */
  endIsDateOnly?: boolean;
  /** Presentation metadata read from the row for the timeline bar treatment. */
  isMilestone?: boolean;
  progress?: number;
  color?: string;
  /** Position relative to the currently rendered timeline window. */
  windowPosition: "before" | "visible" | "after";
  /** Index of the row in the incoming (already view-sorted) rows array. */
  order: number;
  /** True when start datetime >= end datetime (negative or zero interval); hidden from timeline, surfaced for repair. */
  isInvalid?: boolean;
}

export interface BuildCalendarTimelineEventsOptions {
  startField: string | undefined;
  endField?: string;
  titleField?: string;
  colorField?: string;
}

/**
 * 检测事件是否为「无效时间区间」——开始 datetime >= 结束 datetime。
 * 同天且 startMinutes >= endMinutes、或结束日期早于开始日期时为无效；无结束时间/全天/跨天合法。
 * 无效事件在时间线隐藏，并通过设置面板提示用户修复。
 */
export function isInvalidEventRange(event: Pick<
  CalendarTimelineEvent, "startDateKey" | "endDateKey" | "startMinutes" | "endMinutes"
>): boolean {
  // 跨天反向（结束日期早于开始日期）即为无效——含纯 date 列（无时间分量也会命中）。
  if (event.startDateKey > event.endDateKey) return true;
  if (event.startDateKey < event.endDateKey) return false;
  // 同一天：需要时间分量比较；无时间（纯 date 同天）是合法的 1 天事件。
  const { startMinutes, endMinutes } = event;
  if (startMinutes == null || endMinutes == null) return false;
  return endMinutes <= startMinutes;
}

export interface CalendarDayModel {
  dateKey: string;
  inCurrentMonth: boolean;
  events: CalendarTimelineEvent[];
}

export interface CalendarMonthModel {
  year: number;
  monthIndex: number;
  weeks: CalendarDayModel[][];
  days: CalendarDayModel[];
}

export interface CalendarMonthModelOptions {
  weekStartsOn?: number;
}

/** Column granularity of a timeline scale: day-scale uses hours; all other scales use days. */
export type TimelineUnit = "hour" | "day";

export interface TimelineLaneModel {
  key: string;
  label: string;
  color?: string;
  events: CalendarTimelineEvent[];
  rowCount: number;
}

export interface TimelineModel {
  lanes: TimelineLaneModel[];
  startDateKey?: string;
  endDateKey?: string;
  /** Day-scale window start minute from startDateKey midnight. */
  startMinutes?: number;
  /** Number of records that have a usable start date before window filtering. */
  eventCount: number;
  /** Number of date records that intersect the current visible window. */
  visibleEventCount: number;
  /** Number of dated records rendered as jump indicators outside the visible window. */
  offWindowEventCount: number;
  /** Number of records before and after the visible window, respectively. */
  eventsBeforeWindow: number;
  eventsAfterWindow: number;
  /** Number of negative-interval (start > end) events hidden from the timeline. */
  invalidEventCount: number;
  /** Plain-text summary consumed by the timeline's live region. */
  accessibilityLabel: string;
  /** Number of column units in the visible window. */
  totalUnits: number;
  unit: TimelineUnit;
  scale: TimelineScale;
}

export interface TimelineTickModel {
  dateKey: string;
  label: string;
  /** Column-unit offset of the tick from the window start. */
  offsetUnits: number;
  /** True when the tick sits on a scale boundary line (Monday at week scale, month start at month scale, quarter start at quarter/year scale). */
  isScaleBoundary?: boolean;
}

type EffectiveLocale = Exclude<LocaleCode, "system">;

export interface TimelineColumnWidthSpec {
  defaultWidth: number;
  min: number;
  max: number;
}

export function getTimelineColumnWidthSpec(scale: TimelineScale): TimelineColumnWidthSpec {
  switch (scale) {
    case "day":
      return { defaultWidth: 48, min: 60, max: 180 };
    case "week":
      return { defaultWidth: 100, min: 100, max: 360 };
    case "month":
      return { defaultWidth: 80, min: 48, max: 360 };
    case "quarter":
      return { defaultWidth: 15, min: 15, max: 40 };
    case "year":
      // Year spans a full year of day-wide units, so the per-unit width has to be an order
      // of magnitude smaller than the coarser scales to keep the whole year within a screen
      // or two. Day granularity is retained because events are positioned by day offset.
      return { defaultWidth: 4, min: 3, max: 24 };
    default:
      return assertNever(scale);
  }
}

/** Measured container width below which the day scale drops to the phone column width. */
export const TIMELINE_PHONE_VIEWPORT_WIDTH_PX = 560;
/** Day-scale column width at phone width: more hour columns fit on screen than at the desktop minimum. */
export const TIMELINE_DAY_PHONE_UNIT_WIDTH_PX = 32;

export function resolveTimelineUnitWidth(
  config: Pick<ViewConfig, "timelineColumnSizeMode" | "timelineCustomUnitWidth">,
  scale: TimelineScale,
  viewportWidth?: number,
): number {
  const spec = getTimelineColumnWidthSpec(scale);
  const configured = config.timelineColumnSizeMode === "custom" ? Number(config.timelineCustomUnitWidth) : NaN;
  const baseWidth = Number.isFinite(configured) && configured > 0 ? configured : spec.defaultWidth;
  if (
    scale === "day" &&
    !Number.isFinite(configured) &&
    viewportWidth != null &&
    Number.isFinite(viewportWidth) &&
    viewportWidth > 0 &&
    viewportWidth < TIMELINE_PHONE_VIEWPORT_WIDTH_PX
  ) {
    return TIMELINE_DAY_PHONE_UNIT_WIDTH_PX;
  }
  return Math.max(spec.min, Math.min(spec.max, baseWidth));
}

/** Days of padding added before the earliest task date when building the full range. */
export const TIMELINE_RANGE_PADDING_BEFORE_DAYS = 7;
/** Days of padding added after the latest task date when building the full range. */
export const TIMELINE_RANGE_PADDING_AFTER_DAYS = 14;
/** Per-scale minimum range span in days; a shorter task range is expanded to this floor. */
export const TIMELINE_MIN_RANGE_DAYS: Record<TimelineScale, number> = {
  day: 30,
  week: 90,
  month: 365,
  quarter: 365,
  year: 1095,
};
/** Per-scale day width in px. Rendering uses the local column widths; this keeps the reference's relative scale geometry. */
export const TIMELINE_RANGE_DAY_WIDTH: Record<TimelineScale, number> = {
  day: 44,
  week: 22,
  month: 9,
  quarter: 5,
  year: 2,
};
/** Reference gantt row height in px, adopted as the 1:1 default. */
export const TIMELINE_REFERENCE_ROW_HEIGHT = 44;
/** Reference gantt header band height in px, adopted as the 1:1 default. */
export const TIMELINE_REFERENCE_HEADER_HEIGHT = 56;
/** Reference gantt label column width in px, adopted as the 1:1 default. */
export const TIMELINE_REFERENCE_LABEL_WIDTH = 280;
/** Smallest rendered bar width in px; a whole day narrower than this is widened to stay visible and grabbable. */
export const TIMELINE_BAR_MIN_WIDTH_PX = 8;

export function resolveTimelineViewportUnitCount(width: number, unitWidth: number, scale: TimelineScale): number | undefined {
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(unitWidth) || unitWidth <= 0) return undefined;
  const raw = width / unitWidth;
  const count = scale === "day" ? Math.floor(raw) : Math.ceil(raw);
  return Math.max(1, count);
}

export function resolveTimelineViewportUnitSpan(width: number, unitWidth: number): number | undefined {
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(unitWidth) || unitWidth <= 0) return undefined;
  return width / unitWidth;
}

export function getTimelineViewportContentWidth(width: number, paddingLeft: number, paddingRight: number): number {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 0;
  const left = Number.isFinite(paddingLeft) && paddingLeft > 0 ? paddingLeft : 0;
  const right = Number.isFinite(paddingRight) && paddingRight > 0 ? paddingRight : 0;
  return Math.max(0, safeWidth - left - right);
}

/** The visible window a timeline renders: a date range plus its column unit and unit count. */
export interface TimelineWindow {
  startDateKey: string;
  endDateKey: string;
  totalUnits: number;
  /** Real viewport span in column units; may be fractional when the viewport ends mid-column. */
  viewportUnitSpan?: number;
  unit: TimelineUnit;
  /** Day-scale window start minute from startDateKey midnight. */
  startMinutes?: number;
}

export interface TimelineJumpAnchorInput {
  event: Pick<CalendarTimelineEvent, "startDateKey" | "endDateKey" | "startMinutes" | "endMinutes">;
  target: "start" | "end";
  scale: TimelineScale;
  totalUnits: number;
}

export interface TimelineJumpAnchor {
  dateKey: string;
  timeMinutes?: number;
}

export interface TimelineModelOptions {
  uncategorizedLabel?: string;
  /** Number of day/hour units visible in the rendered viewport. When set, the
   *  timeline window centers around the anchor instead of snapping to a natural
   *  week/month/quarter period. */
  visibleUnitCount?: number;
  /** Real viewport span in day/hour units. May be fractional; used for clipping
   *  and day-scale visibility without adding extra ticks/grid columns. */
  visibleUnitSpan?: number;
  /** Clock for centring the day-scale window on the current hour. Omit to keep the
   *  window at the configured (or visible-range) start time. */
  now?: Date;
}

// ───────────────────────────────────────────────────────────────────
// 3. WINDOW & ANCHOR RESOLUTION
// ───────────────────────────────────────────────────────────────────

export function getDefaultEventDateField(config: ViewConfig): string | undefined {
  return config.schema.columns.find((column) => isDateLikeColumn(column, config))?.key;
}

export function getTimelineDayNonDateTimeColumns(config: ViewConfig): ColumnDef[] {
  const fields = [
    config.timelineStartDateField || config.calendarStartDateField || getDefaultEventDateField(config),
    config.timelineEndDateField || config.calendarEndDateField,
  ];
  const columns: ColumnDef[] = [];
  for (const field of fields) {
    if (!field || columns.some((column) => column.key === field)) continue;
    const column = config.schema.columns.find((candidate) => candidate.key === field);
    if (!column) continue;
    const displayType = getColumnDisplayType(column, config.schema.computedFields);
    if (isDateLikeColumnType(displayType) && displayType !== "datetime") columns.push(column);
  }
  return columns;
}

export function normalizeTimelineDayScale(config: ViewConfig): boolean {
  if ((config.timelineScale || "week") !== "day") return false;
  if (getTimelineDayNonDateTimeColumns(config).length === 0) return false;
  config.timelineScale = "week";
  config.timelineAnchorTimeMinutes = undefined;
  return true;
}

export function getCalendarAnchorMonth(
  rows: RowData[],
  config: ViewConfig,
  startField: string | undefined = config.calendarStartDateField || getDefaultEventDateField(config),
  fallbackDate = new Date(),
): { year: number; monthIndex: number } {
  const configured = parseCalendarMonth(config.calendarMonth);
  if (configured) return configured;
  const firstEvent = buildCalendarTimelineEvents(rows, config, {
    startField,
    endField: config.calendarEndDateField,
    titleField: config.calendarTitleField,
    colorField: config.calendarColorField,
  })[0];
  if (firstEvent) return { year: Number(firstEvent.startDateKey.slice(0, 4)), monthIndex: Number(firstEvent.startDateKey.slice(5, 7)) - 1 };
  return { year: fallbackDate.getFullYear(), monthIndex: fallbackDate.getMonth() };
}

export function shiftCalendarMonth(month: string, delta: number): string {
  const parsed = parseCalendarMonth(month) || { year: new Date().getFullYear(), monthIndex: new Date().getMonth() };
  return calendarMonthKey(makeUtcDate(parsed.year, parsed.monthIndex + delta, 1));
}

/** Resolve the timeline anchor date (YYYY-MM-DD): configured value wins, otherwise today. */
export function getTimelineAnchor(config: ViewConfig, fallbackDate: Date = new Date()): string {
  const configured = config.timelineAnchor;
  if (configured && parseDateKey(configured)) return configured;
  return dateKeyFromUtc(makeUtcDate(fallbackDate.getFullYear(), fallbackDate.getMonth(), fallbackDate.getDate()));
}

/** Shift a timeline anchor by `delta` windows of the given scale (day=±1 day, week=±7, month=±1 month, quarter=±3 months). */
export function shiftTimelineAnchor(anchor: string, scale: TimelineScale, delta: number): string {
  const base = parseDateKey(anchor);
  if (!base) return anchor;
  switch (scale) {
    case "day":
      return dateKeyFromUtc(addUtcDays(base, delta));
    case "week":
      return dateKeyFromUtc(addUtcDays(base, delta * 7));
    case "month":
      return dateKeyFromUtc(makeUtcDate(base.getUTCFullYear(), base.getUTCMonth() + delta, base.getUTCDate()));
    case "quarter":
      return dateKeyFromUtc(makeUtcDate(base.getUTCFullYear(), base.getUTCMonth() + delta * 3, base.getUTCDate()));
    case "year":
      return dateKeyFromUtc(makeUtcDate(base.getUTCFullYear() + delta, base.getUTCMonth(), base.getUTCDate()));
    default:
      return assertNever(scale);
  }
}

/** Compute the visible window for a scale anchored at `anchor`. The window aligns to natural
 *  periods (week/month/quarter boundaries; day-scale spans one day) and reports its column unit
 *  (hour/day) so the renderer can lay events out uniformly. */
export function getTimelineWindow(config: ViewConfig, anchor: string): TimelineWindow {
  const scale = config.timelineScale || "week";
  const base = parseDateKey(anchor) || startOfTodayUtc();
  switch (scale) {
    case "day": {
      const { startHour, endHour } = getTimelineVisibleHourRange(config);
      return { startDateKey: anchor, endDateKey: anchor, totalUnits: Math.max(1, endHour - startHour), unit: "hour", startMinutes: startHour * MINUTES_PER_HOUR };
    }
    case "week": {
      const gridStart = addUtcDays(base, -daysSinceMonday(base.getUTCDay()));
      return { startDateKey: dateKeyFromUtc(gridStart), endDateKey: dateKeyFromUtc(addUtcDays(gridStart, 6)), totalUnits: 7, unit: "day" };
    }
    case "month": {
      const first = makeUtcDate(base.getUTCFullYear(), base.getUTCMonth(), 1);
      const last = makeUtcDate(base.getUTCFullYear(), base.getUTCMonth() + 1, 0);
      return { startDateKey: dateKeyFromUtc(first), endDateKey: dateKeyFromUtc(last), totalUnits: last.getUTCDate(), unit: "day" };
    }
    case "quarter": {
      const quarterStartMonth = Math.floor(base.getUTCMonth() / 3) * 3;
      const first = makeUtcDate(base.getUTCFullYear(), quarterStartMonth, 1);
      const last = makeUtcDate(base.getUTCFullYear(), quarterStartMonth + 3, 0);
      // Quarter still shows weekly ticks, but event layout and interactions stay on daily columns.
      const gridStart = addUtcDays(first, -daysSinceMonday(first.getUTCDay()));
      return {
        startDateKey: dateKeyFromUtc(gridStart),
        endDateKey: dateKeyFromUtc(last),
        totalUnits: Math.max(1, daysBetweenDate(gridStart, last) + 1),
        unit: "day",
      };
    }
    case "year": {
      const first = makeUtcDate(base.getUTCFullYear(), 0, 1);
      const last = makeUtcDate(base.getUTCFullYear(), 12, 0);
      return {
        startDateKey: dateKeyFromUtc(first),
        endDateKey: dateKeyFromUtc(last),
        totalUnits: Math.max(1, daysBetweenDate(first, last) + 1),
        unit: "day",
      };
    }
    default:
      return assertNever(scale);
  }
}

/** Day-scale window start (minutes from midnight) that puts the current hour in the middle of
 *  the visible window, clamped so the window stays on the anchor day. */
export function resolveTimelineDayCentredStartMinutes(totalUnits: number, now: Date): number {
  const units = Math.max(1, Math.round(totalUnits));
  const centred = now.getHours() * MINUTES_PER_HOUR - Math.floor(units / 2) * MINUTES_PER_HOUR;
  return Math.max(0, Math.min(MINUTES_PER_DAY - units * MINUTES_PER_HOUR, centred));
}

/** Compute a viewport-sized timeline window centered on the anchor. This is used
 *  by the renderer's pseudo-infinite mode: column width is fixed in pixels, and
 *  the number of visible columns comes from the current viewport width. */
export function getTimelineViewportWindow(config: ViewConfig, anchor: string, visibleUnitCount: number, visibleUnitSpan?: number, now?: Date): TimelineWindow {
  const scale = config.timelineScale || "week";
  const base = parseDateKey(anchor) || startOfTodayUtc();
  const totalUnits = Math.max(1, Math.round(visibleUnitCount));
  if (scale === "day") {
    // Centring needs a clock; without one the window keeps the legacy fixed start so
    // callers that only care about geometry stay deterministic.
    const startMinutes = getTimelineAnchorStartMinutes(config, now != null ? totalUnits : undefined, now);
    const lastVisibleMinute = startMinutes + (totalUnits * MINUTES_PER_HOUR) - 1;
    const end = addUtcDays(base, Math.max(0, Math.floor(lastVisibleMinute / MINUTES_PER_DAY)));
    return {
      startDateKey: dateKeyFromUtc(base),
      endDateKey: dateKeyFromUtc(end),
      totalUnits,
      viewportUnitSpan: visibleUnitSpan,
      unit: "hour",
      startMinutes,
    };
  }
  const before = Math.floor((totalUnits - 1) / 2);
  const start = addUtcDays(base, -before);
  const end = addUtcDays(start, totalUnits - 1);
  return {
    startDateKey: dateKeyFromUtc(start),
    endDateKey: dateKeyFromUtc(end),
    totalUnits,
    unit: "day",
  };
}

export function getTimelineViewportStartAnchor(config: ViewConfig, startDateKey: string, visibleUnitCount: number, startMinutes?: number): TimelineJumpAnchor {
  const scale = config.timelineScale || "week";
  if (scale === "day") {
    const timeMinutes = typeof startMinutes === "number" && Number.isFinite(startMinutes)
      ? normalizeTimelineHourStart(Math.max(0, Math.min(MINUTES_PER_DAY - 1, Math.round(startMinutes))))
      : getTimelineAnchorStartMinutes(config);
    return { dateKey: startDateKey, timeMinutes };
  }
  const totalUnits = Math.max(1, Math.round(visibleUnitCount));
  const before = Math.floor((totalUnits - 1) / 2);
  return { dateKey: addDateKeyDays(startDateKey, before) };
}

export function getTimelineNavigationShiftUnits(totalUnits: number): number {
  const safeUnits = Math.max(1, Math.round(totalUnits));
  if (safeUnits === 1) return 1;
  return Math.max(1, Math.min(safeUnits - 1, Math.ceil(safeUnits * 0.75)));
}

export function getTimelineShortNavigationShiftUnits(scale: TimelineScale): number {
  return scale === "quarter" ? 7 : scale === "year" ? 30 : 1;
}

export function resolveTimelineJumpAnchor(input: TimelineJumpAnchorInput): TimelineJumpAnchor {
  const totalUnits = Math.max(1, Math.round(input.totalUnits));
  if (input.target === "start") {
    if (input.scale === "day") {
      return { dateKey: input.event.startDateKey, timeMinutes: input.event.startMinutes ?? 0 };
    }
    return { dateKey: input.event.startDateKey };
  }

  const target = resolveEventAbsoluteScale(input.event, input.event.startDateKey).end;
  if (input.scale === "day") {
    const desiredOffsetMinutes = Math.max(0, totalUnits - 1) * MINUTES_PER_HOUR;
    return dateTimeFromAbsoluteMinutes(input.event.startDateKey, target - desiredOffsetMinutes);
  }

  const targetDayOffset = Math.floor(target / MINUTES_PER_DAY);
  const before = Math.floor((totalUnits - 1) / 2);
  const desiredIndex = Math.max(0, totalUnits - 2);
  return { dateKey: addDateKeyDays(input.event.startDateKey, targetDayOffset - desiredIndex + before) };
}

/** The human-facing title range. With a visible unit count the title describes the same
 * viewport-centred window the body renders; without one it falls back to the natural calendar
 * period (quarter layout may extend backward to the week start, but the title should describe
 * the natural quarter itself). */
export function getTimelineTitleWindow(config: ViewConfig, anchor: string, visibleUnitCount?: number): Pick<TimelineWindow, "startDateKey" | "endDateKey"> {
  const scale = config.timelineScale || "week";
  if (visibleUnitCount != null) {
    const window = getTimelineViewportWindow(config, anchor, visibleUnitCount);
    return { startDateKey: window.startDateKey, endDateKey: window.endDateKey };
  }
  if (scale !== "quarter") {
    const window = getTimelineWindow(config, anchor);
    return { startDateKey: window.startDateKey, endDateKey: window.endDateKey };
  }
  const base = parseDateKey(anchor) || startOfTodayUtc();
  const quarterStartMonth = Math.floor(base.getUTCMonth() / 3) * 3;
  const first = makeUtcDate(base.getUTCFullYear(), quarterStartMonth, 1);
  const last = makeUtcDate(base.getUTCFullYear(), quarterStartMonth + 3, 0);
  return { startDateKey: dateKeyFromUtc(first), endDateKey: dateKeyFromUtc(last) };
}

/** Extract HH:MM as minutes-from-midnight for timeline endpoints.
 * Datetime fields treat date-only values as 00:00; date fields only do that
 * when paired with a datetime endpoint so mixed endpoints stay renderable and
 * invalid zero-width ranges can be surfaced. */
export function extractTimelineEndpointMinutes(
  value: unknown,
  options: { includeDateObjectTime: boolean; dateOnlyAsMidnight: boolean },
): number | undefined {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    if (options.includeDateObjectTime) return value.getUTCHours() * 60 + value.getUTCMinutes();
    return options.dateOnlyAsMidnight ? 0 : undefined;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return undefined;
    // 毫秒时间戳（如 file.ctime/file.mtime）是绝对时间，按本地墙上时间取分量，与
    // parseDateTimeParts(number) 口径一致；避免模型对 number 返回 undefined 而与 scanner 判定分裂。
    if (options.includeDateObjectTime) {
      const date = new Date(value);
      return date.getHours() * 60 + date.getMinutes();
    }
    return options.dateOnlyAsMidnight ? 0 : undefined;
  }
  if (typeof value !== "string") return undefined;
  const match = value.match(/[T ](\d{1,2}):(\d{2})/);
  if (!match && options.dateOnlyAsMidnight && /^\d{4}-\d{1,2}-\d{1,2}$/.test(value.trim())) return 0;
  if (!match) return undefined;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return undefined;
  }
  return hour * 60 + minute;
}

/** Visible hour range for day-scale (reuses calendarStartHour/calendarEndHour, defaults 0–24). */
function getTimelineVisibleHourRange(config: ViewConfig): { startHour: number; endHour: number } {
  const startHour = clampHour(config.calendarStartHour, 0);
  let endHour = clampHour(config.calendarEndHour, 24);
  if (endHour <= startHour) endHour = Math.min(24, startHour + 1);
  return { startHour, endHour };
}

function clampHour(value: unknown, fallback: number): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(24, Math.round(numeric)));
}

function startOfTodayUtc(): Date {
  const now = renderNow();
  return makeUtcDate(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Days since Monday for week alignment (JS getDay: Sun=0..Sat=6 → Monday-based offset). */
function daysSinceMonday(dayOfWeek: number): number {
  return (dayOfWeek + 6) % 7;
}

function daysBetweenDate(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

// ───────────────────────────────────────────────────────────────────
// 4. MODEL BUILDERS
// ───────────────────────────────────────────────────────────────────

export function buildCalendarMonthModel(
  rows: RowData[],
  config: ViewConfig,
  month: { year: number; monthIndex: number },
  options: CalendarMonthModelOptions = {},
): CalendarMonthModel {
  const startField = config.calendarStartDateField || getDefaultEventDateField(config);
  const events = buildCalendarTimelineEvents(rows, config, {
    startField,
    endField: config.calendarEndDateField,
    titleField: config.calendarTitleField,
    colorField: config.calendarColorField,
  });
  // 兑现 durationDays 契约（daysBetween(start,end)+1）：buildEvents 默认为 1，月视图模型必须
  // 按真实跨度重算（与 buildTimelineModel:550 一致），否则 move 拖拽算 endDateKey 会塌缩成单天。
  for (const event of events) {
    event.durationDays = Math.max(1, (dateKeyDaysBetween(event.startDateKey, event.endDateKey) ?? 0) + 1);
  }
  const firstOfMonth = makeUtcDate(month.year, month.monthIndex, 1);
  const lastOfMonth = makeUtcDate(month.year, month.monthIndex + 1, 0);
  const weekStartsOn = normalizeWeekStartsOn(options.weekStartsOn);
  const gridStart = addUtcDays(firstOfMonth, -getDaysSinceWeekStart(firstOfMonth.getUTCDay(), weekStartsOn));
  const gridEnd = addUtcDays(lastOfMonth, getDaysUntilWeekEnd(lastOfMonth.getUTCDay(), weekStartsOn));
  const days: CalendarDayModel[] = [];

  for (let day = gridStart; day.getTime() <= gridEnd.getTime(); day = addUtcDays(day, 1)) {
    const dateKey = dateKeyFromUtc(day);
    days.push({
      dateKey,
      inCurrentMonth: day.getUTCMonth() === month.monthIndex,
      events: events.filter((event) => {
        // 过滤无效事件（对齐时间线行为）
        if (event.isInvalid) return false;
        // 事件必须在当前日期开始之前或当天开始
        if (event.startDateKey > dateKey) return false;
        // 结束判定：date 列按含末天（inclusive），datetime 列按精确时刻
        if (event.endIsDateOnly) {
          // date 列：endDateKey 是最后一天，inclusive
          return event.endDateKey >= dateKey;
        }
        // datetime 列：精确结束时刻
        // - endDateKey > dateKey：结束日期在当前日期之后，一定包含
        // - endDateKey === dateKey && endMinutes > 0：结束在当前日期的某个时刻，包含
        // - endDateKey === dateKey && endMinutes === 0：结束在当前日期的午夜 00:00，不包含当前日期
        return event.endDateKey > dateKey || (event.endDateKey === dateKey && (event.endMinutes ?? 0) > 0);
      }),
    });
  }

  const weeks: CalendarDayModel[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return { year: month.year, monthIndex: month.monthIndex, weeks, days };
}

function parseCalendarMonth(value: string | undefined): { year: number; monthIndex: number } | null {
  const match = value?.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return null;
  return { year, monthIndex };
}

export function buildTimelineModel(rows: RowData[], config: ViewConfig, options: TimelineModelOptions = {}): TimelineModel {
  const startField = config.timelineStartDateField || config.calendarStartDateField || getDefaultEventDateField(config);
  const endField = config.timelineEndDateField || config.calendarEndDateField;
  const events = buildCalendarTimelineEvents(rows, config, {
    startField,
    endField,
    titleField: config.timelineTitleField,
    colorField: config.timelineColorField || config.calendarColorField,
  });
  const scale = config.timelineScale || "week";
  const anchor = getTimelineAnchor(config);
  const window = options.visibleUnitCount != null
    ? getTimelineViewportWindow(config, anchor, options.visibleUnitCount, options.visibleUnitSpan, options.now)
    : getTimelineWindow(config, anchor);

  // Keep all dated events in the model so row count stays stable while paging.
  // Events outside the current window render as jump indicators instead of bars.
  let visibleEventCount = 0;
  for (const event of events) {
    event.durationDays = Math.max(1, daysBetween(event.startDateKey, event.endDateKey) + 1);
    event.windowPosition = getTimelineWindowPosition(event, window);
    if (event.windowPosition === "visible") {
      visibleEventCount++;
      assignEventUnits(event, window, scale, config);
    } else {
      assignOffWindowEventUnits(event, window);
    }
  }

  const eventsBeforeWindow = events.filter((event) => event.windowPosition === "before").length;
  const eventsAfterWindow = events.filter((event) => event.windowPosition === "after").length;
  const offWindowEventCount = eventsBeforeWindow + eventsAfterWindow;

  const visibleGroupKeys = getVisibleTimelineGroupKeys(events, config, options.uncategorizedLabel || "Uncategorized");
  const lanes = new Map<string, TimelineLaneModel>();
  for (const seed of getTimelineSeedLanes(config, options.uncategorizedLabel || "Uncategorized", visibleGroupKeys)) {
    lanes.set(seed.key, createTimelineLane(seed.key, seed.label, seed.color));
  }
  for (const event of events) {
    if (event.isInvalid) continue; // 无效事件不进 lane：隐藏、不计行、不参与重排
    const groups = getTimelineGroupKeys(event.row, config, options.uncategorizedLabel || "Uncategorized");
    for (const group of groups) {
      let lane = lanes.get(group.key);
      if (!lane) {
        lane = createTimelineLane(group.key, group.label, getTimelineGroupColor(config, group.key));
        lanes.set(group.key, lane);
      }
      lane.events.push({ ...event });
    }
  }

  const sortedLanes = Array.from(lanes.values());
  const useRowPipelineOrder = hasActiveTimelineSort(config);
  for (const lane of sortedLanes) {
    lane.events.sort(useRowPipelineOrder ? compareTimelineEventOrder : compareTimelineManualOrder);
    lane.rowCount = assignTimelineRows(lane.events);
  }
  const laneOrder = getTimelineLaneOrder(config, sortedLanes);
  const laneOrderMap = new Map(laneOrder.map((key, index) => [key, index]));
  sortedLanes.sort((a, b) => {
    const orderA = laneOrderMap.get(a.key);
    const orderB = laneOrderMap.get(b.key);
    if (orderA != null && orderB != null) return orderA - orderB;
    if (orderA != null) return -1;
    if (orderB != null) return 1;
    const firstA = a.events[0]?.startDateKey || "";
    const firstB = b.events[0]?.startDateKey || "";
    return firstA.localeCompare(firstB) || a.label.localeCompare(b.label);
  });

  return {
    lanes: sortedLanes,
    startDateKey: window.startDateKey,
    endDateKey: window.endDateKey,
    startMinutes: window.startMinutes,
    eventCount: events.length,
    visibleEventCount,
    offWindowEventCount,
    eventsBeforeWindow,
    eventsAfterWindow,
    invalidEventCount: events.filter((event) => event.isInvalid).length,
    accessibilityLabel: formatTimelineAccessibilityLabel(window.startDateKey, window.endDateKey, visibleEventCount, offWindowEventCount, eventsBeforeWindow, eventsAfterWindow),
    totalUnits: window.totalUnits,
    unit: window.unit,
    scale,
  };
}

export function formatTimelineAccessibilityLabel(
  startDateKey: string,
  endDateKey: string,
  visibleEventCount: number,
  offWindowEventCount: number,
  eventsBeforeWindow: number,
  eventsAfterWindow: number,
): string {
  return `Timeline ${startDateKey} to ${endDateKey}. ${visibleEventCount} events in the visible range; ${offWindowEventCount} outside the range (${eventsBeforeWindow} before and ${eventsAfterWindow} after).`;
}

/** Rows without a usable start date stay available to calendar/timeline backlog drawers. */
export function collectUnscheduledTimelineRows(rows: RowData[], config: ViewConfig, startField?: string): RowData[] {
  const field = startField || config.timelineStartDateField || config.calendarStartDateField || getDefaultEventDateField(config);
  if (!field) return rows.slice();
  const endField = config.timelineEndDateField || config.calendarEndDateField;
  return rows.filter((row) => {
    if (normalizeDateKey(getRowFieldValue(row, field, config)) != null) return false;
    return !endField || normalizeDateKey(getRowFieldValue(row, endField, config)) == null;
  });
}

function createTimelineLane(key: string, label: string, color?: string): TimelineLaneModel {
  return { key, label, color, events: [], rowCount: 1 };
}

function getTimelineSeedLanes(config: ViewConfig, uncategorizedLabel: string, actualKeys: string[]): Array<{ key: string; label: string; color?: string }> {
  const field = config.timelineGroupField;
  if (!field) return [];
  const configuredOrder = config.groupOrders?.[field] || [];
  const defaultOrder = getDefaultGroupOrder(config, field);
  const actualSet = new Set(actualKeys);
  const column = config.schema.columns.find((col) => col.key === field);
  const displayType = column ? getColumnDisplayType(column, config.schema.computedFields) : undefined;
  if (displayType === "checkbox") {
    return getEffectiveGroupOrder(config, field, actualKeys)
      .filter((key) => actualSet.has(key))
      .map((key) => ({
        key,
        label: formatGroupKeyDisplay(config, field, key),
        color: getTimelineGroupColor(config, key),
      }));
  }
  const showEmptyOptionGroups = isEmptyGroupVisibilityColumn(config, column) && shouldShowEmptyGroups(config, field);
  const shouldIncludeDefaultLanes = actualKeys.length === 0 || defaultOrder.some((key) => actualSet.has(key));
  const visibleConfiguredOrder = shouldShowEmptyGroups(config, field)
    ? configuredOrder
    : configuredOrder.filter((key) => actualSet.has(key));
  const visibleDefaultOrder = showEmptyOptionGroups
    ? defaultOrder
    : defaultOrder.filter((key) => actualSet.has(key));
  const seedKeys = mergeUnique(visibleConfiguredOrder, shouldIncludeDefaultLanes ? visibleDefaultOrder : []);
  return seedKeys.map((key) => ({
    key,
    label: formatGroupKeyDisplay(config, field, key, {
      uncategorizedLabel,
      uncategorizedKeys: [UNCATEGORIZED_TIMELINE_LANE],
    }),
    color: getTimelineGroupColor(config, key),
  }));
}

function getVisibleTimelineGroupKeys(events: CalendarTimelineEvent[], config: ViewConfig, uncategorizedLabel: string): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const event of events) {
    for (const group of getTimelineGroupKeys(event.row, config, uncategorizedLabel)) {
      if (seen.has(group.key)) continue;
      seen.add(group.key);
      keys.push(group.key);
    }
  }
  return keys;
}

function getTimelineGroupColor(config: ViewConfig, groupKey: string): string | undefined {
  const field = config.timelineGroupField;
  if (!field) return undefined;
  const column = config.schema.columns.find((col) => col.key === field);
  const displayType = column ? getColumnDisplayType(column, config.schema.computedFields) : undefined;
  if (!column?.statusOptions?.length || !displayType || !["status", "select", "multi-select"].includes(displayType)) return undefined;
  return column.statusOptions.find((option) => stringifyValue(option.value).trim() === groupKey)?.color;
}

function mergeUnique(...orders: string[][]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const order of orders) {
    for (const key of order) {
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(key);
    }
  }
  return result;
}

function getTimelineLaneOrder(config: ViewConfig, lanes: TimelineLaneModel[]): string[] {
  const field = config.timelineGroupField;
  if (!field) return [];
  const hasConfiguredOrder = (config.groupOrders?.[field] || []).length > 0 || getDefaultGroupOrder(config, field).length > 0;
  if (!hasConfiguredOrder) return [];
  return getEffectiveGroupOrder(config, field, lanes.map((lane) => lane.key));
}

/** Notion-style timeline rows: every event owns a stable row; rows are never
 *  reused for adjacent or non-overlapping events. */
function assignTimelineRows(events: CalendarTimelineEvent[]): number {
  events.forEach((event, index) => {
    event.timelineRow = index + 1;
  });
  return events.length;
}

/** Estimated horizontal span of a milestone's inline label in column units: the diamond offset
 *  plus the title text at the bar's label font size. */
export function getTimelineMilestoneLabelWidthUnits(title: string, unitWidth: number, charWidthPx = 7): number {
  const safeUnitWidth = Number.isFinite(unitWidth) && unitWidth > 0 ? unitWidth : 1;
  const textWidthPx = Math.max(0, title.length) * charWidthPx;
  return (safeUnitWidth / 2 + 14 + textWidthPx) / safeUnitWidth;
}

/** Where a milestone's label should render: "above" when the next bar in the lane starts within
 *  the label's span (an inline label would be painted over), "inline" otherwise. */
export function resolveTimelineMilestoneLabelPlacement(
  event: CalendarTimelineEvent,
  laneEvents: CalendarTimelineEvent[],
  unitWidth: number,
  unit: TimelineUnit,
): "inline" | "above" {
  if (!event.isMilestone) return "inline";
  const next = laneEvents.find((candidate) => candidate.id !== event.id && timelineEventStartsAfter(candidate, event));
  if (!next) return "inline";
  const gapMinutes = (dateKeyDaysBetween(event.startDateKey, next.startDateKey) ?? 0) * MINUTES_PER_DAY
    + (next.startMinutes ?? 0) - (event.startMinutes ?? 0);
  const gapUnits = unit === "hour" ? gapMinutes / MINUTES_PER_HOUR : gapMinutes / MINUTES_PER_DAY;
  return gapUnits < getTimelineMilestoneLabelWidthUnits(event.title, unitWidth) ? "above" : "inline";
}

function timelineEventStartsAfter(a: CalendarTimelineEvent, b: CalendarTimelineEvent): boolean {
  if (a.startDateKey !== b.startDateKey) return a.startDateKey > b.startDateKey;
  return (a.startMinutes ?? 0) > (b.startMinutes ?? 0);
}

// ───────────────────────────────────────────────────────────────────
// 5. EVENT LAYOUT & TICKS
// ───────────────────────────────────────────────────────────────────

export function buildTimelineTicks(window: TimelineWindow, scale: TimelineScale, config: ViewConfig, locale: EffectiveLocale = "en"): TimelineTickModel[] {
  if (scale === "day") {
    // Hourly ticks across the visible hour range. The viewport may cross midnight.
    const start = parseDateKey(window.startDateKey);
    if (!start) return [];
    const startMinutes = window.startMinutes ?? getTimelineVisibleHourRange(config).startHour * MINUTES_PER_HOUR;
    const ticks: TimelineTickModel[] = [];
    for (let hour = 0; hour < window.totalUnits; hour++) {
      const absoluteMinutes = startMinutes + hour * MINUTES_PER_HOUR;
      const date = addUtcDays(start, Math.floor(absoluteMinutes / MINUTES_PER_DAY));
      const hourOfDay = Math.floor(minuteOfDay(absoluteMinutes) / MINUTES_PER_HOUR);
      ticks.push({
        dateKey: dateKeyFromUtc(date),
        label: String(hourOfDay).padStart(2, "0"),
        offsetUnits: hour,
      });
    }
    return ticks;
  }
  const start = parseDateKey(window.startDateKey);
  const end = parseDateKey(window.endDateKey);
  if (!start || !end || start.getTime() > end.getTime()) return [];
  // Event layout uses daily columns outside day-scale. Coarser scales reduce
  // axis noise while preserving daily placement for event bars.
  const stepDays = scale === "quarter" ? 7 : scale === "year" ? 30 : 1;
  const ticks: TimelineTickModel[] = [];
  // Quarter-start lines (1st of Jan/Apr/Jul/Oct) may fall between the stepped
  // ticks, so boundary dates are collected by month iteration, not by the step.
  const boundaryOffsets = new Map<number, Date>();
  if (scale === "quarter" || scale === "year") {
    for (
      let monthStart = makeUtcDate(start.getUTCFullYear(), start.getUTCMonth(), 1);
      monthStart.getTime() <= end.getTime();
      monthStart = makeUtcDate(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1)
    ) {
      if (monthStart.getUTCMonth() % 3 === 0 && monthStart.getTime() >= start.getTime()) {
        boundaryOffsets.set(daysBetweenDate(start, monthStart), monthStart);
      }
    }
  }
  for (let tick = start; tick.getTime() <= end.getTime(); tick = addUtcDays(tick, stepDays)) {
    const offset = daysBetweenDate(start, tick);
    const boundary = boundaryOffsets.get(offset);
    if (boundary) boundaryOffsets.delete(offset);
    const isScaleBoundary = scale === "week"
      ? tick.getUTCDay() === 1
      : scale === "month"
        ? tick.getUTCDate() === 1
        : Boolean(boundary);
    ticks.push({
      dateKey: dateKeyFromUtc(tick),
      label: formatTimelineTickLabel(tick, scale, locale),
      offsetUnits: offset,
      ...(isScaleBoundary ? { isScaleBoundary: true } : {}),
    });
  }
  // Boundary dates that fell between stepped ticks get their own tick so the
  // quarter-start gridline exists at coarse scales.
  for (const [offset, boundary] of boundaryOffsets) {
    ticks.push({
      dateKey: dateKeyFromUtc(boundary),
      label: formatTimelineTickLabel(boundary, scale, locale),
      offsetUnits: offset,
      isScaleBoundary: true,
    });
  }
  ticks.sort((a, b) => a.offsetUnits - b.offsetUnits);
  if (ticks.length === 0) {
    ticks.push({ dateKey: window.startDateKey, label: formatTimelineTickLabel(start, scale, locale), offsetUnits: 0 });
  }
  return ticks;
}

export function buildCalendarTimelineEvents(
  rows: RowData[],
  config: ViewConfig,
  options: BuildCalendarTimelineEventsOptions,
): CalendarTimelineEvent[] {
  const { startField, endField, titleField, colorField } = options;
  if (!startField) return [];
  const events: CalendarTimelineEvent[] = [];
  const startIncludesTime = getFieldDisplayType(config, startField) === "datetime";
  const endIncludesTime = endField ? getFieldDisplayType(config, endField) === "datetime" : false;
  const coerceDateOnlyEndpoints = startIncludesTime || endIncludesTime;
  let order = 0;
  for (const row of rows) {
    const startValue = getRowFieldValue(row, startField, config);
    const endValue = endField ? getRowFieldValue(row, endField, config) : undefined;
    const parsedStartDateKey = normalizeDateKey(startValue);
    const parsedEndDateKey = endField ? normalizeDateKey(endValue) : null;
    // A row with only a due date still has a useful one-day bar, matching the
    // timeline's due-only treatment instead of sending it to the unscheduled backlog.
    const startDateKey = parsedStartDateKey || parsedEndDateKey;
    if (!startDateKey) continue;
    const endDateKey = parsedEndDateKey && parsedEndDateKey >= startDateKey ? parsedEndDateKey : startDateKey;
    const title = resolveTitleFieldDisplay(row, config, titleField);
    const milestoneValue = row.frontmatter.milestone ?? row.frontmatter.type;
    const milestoneText = typeof milestoneValue === "string" ? milestoneValue.trim().toLowerCase() : "";
    const isMilestone = milestoneValue === true || milestoneText === "milestone" || milestoneText === "true" || milestoneText === "yes";
    const rawProgress = row.frontmatter.progress ?? row.computed.progress;
    const parsedProgress = typeof rawProgress === "number"
      ? rawProgress
      : typeof rawProgress === "string" && rawProgress.trim() !== ""
        ? Number(rawProgress)
        : Number.NaN;
    const progress = Number.isFinite(parsedProgress) ? Math.max(0, Math.min(100, parsedProgress)) : undefined;
    events.push({
      id: row.file.path,
      title: title.text,
      titleIsEmpty: title.isEmpty || undefined,
      color: getEventColor(row, config, colorField),
      filePath: row.file.path,
      row,
      startDateKey,
      endDateKey,
      offsetUnits: 0,
      durationUnits: 1,
      durationDays: 1,
      // Day-scale time resolution (minutes from midnight); undefined when no time component.
      startMinutes: extractTimelineEndpointMinutes(startValue, { includeDateObjectTime: startIncludesTime, dateOnlyAsMidnight: coerceDateOnlyEndpoints }),
      endMinutes: endField ? extractTimelineEndpointMinutes(endValue, { includeDateObjectTime: endIncludesTime, dateOnlyAsMidnight: coerceDateOnlyEndpoints }) : undefined,
      // 结束端是否按「含末天 +1 天」渲染：取决于结束值是否有显式时间分量（不 coerce 的原始抽取）。
      // 纯日期值→含末天 +1 天；带时间值（含 date 列里的脏时间字符串、datetime 列）→精确结束时刻。
      endIsDateOnly: endField
        ? extractTimelineEndpointMinutes(endValue, { includeDateObjectTime: endIncludesTime, dateOnlyAsMidnight: false }) == null
        : true,
      isMilestone: isMilestone || undefined,
      progress,
      windowPosition: "visible",
      // Preserve the incoming (view-sorted) order so calendar honors the active sort
      order: order++,
      // Manual-order rank for same-day stack reorder (only matters when start dates tie).
      manualRank: config.manualOrder?.ranks?.[row.file.path],
    });
    // 标记负区间事件：用原始 parsedEndDateKey（fallback 前）判定，否则「结束日期 < 开始日期」会被
    // 上面的 endDateKey fallback 折叠成同天，当结束时间恰好 ≥ 开始时间时就误判合法（与 collectInvalidTimelineEvents 不一致）。
    const last = events[events.length - 1];
    if (last && endField && parsedEndDateKey != null && isInvalidEventRange({
      startDateKey: last.startDateKey,
      endDateKey: parsedEndDateKey,
      startMinutes: last.startMinutes,
      endMinutes: last.endMinutes,
    })) {
      last.isInvalid = true;
    }
  }
  return events;
}

function getEventColor(row: RowData, config: ViewConfig, colorField: string | undefined): string | undefined {
  if (!colorField) return undefined;
  const column = config.schema.columns.find((col) => col.key === colorField);
  if (!column?.statusOptions?.length) return undefined;
  const raw = getRowFieldValue(row, colorField, config);
  const values = (Array.isArray(raw) ? raw : [raw])
    .map((item) => stringifyValue(item).trim())
    .filter(Boolean);
  for (const value of values) {
    const option = column.statusOptions.find((candidate) => candidate.value === value);
    if (option?.color) return option.color;
  }
  return undefined;
}

/** Position an event within the visible window in column units (hour/day depending on scale).
 *  Day-scale events without a time component (or multi-day events crossing the day) become all-day. */
export function assignEventUnits(event: CalendarTimelineEvent, window: TimelineWindow, scale: TimelineScale, config: ViewConfig): void {
  if (scale === "day") {
    // day scale：统一按绝对刻度定位（resolveEventAbsoluteScale），不再 isAllDay 双轨。
    const scaleRange = resolveEventAbsoluteScale(event, window.startDateKey);
    const windowStart = window.startMinutes ?? getTimelineVisibleHourRange(config).startHour * MINUTES_PER_HOUR;
    const visibleUnits = Math.max(1, window.viewportUnitSpan ?? window.totalUnits);
    const startUnit = (scaleRange.start - windowStart) / MINUTES_PER_HOUR;
    const endUnit = Math.max(startUnit + 0.25, (scaleRange.end - windowStart) / MINUTES_PER_HOUR);
    const offset = Math.max(0, Math.min(visibleUnits, startUnit));
    const endUnitClamped = Math.max(offset + 0.25, Math.min(visibleUnits, endUnit));
    event.offsetUnits = offset;
    event.durationUnits = Math.max(0.25, endUnitClamped - offset);
    event.gridOffsetUnits = Math.max(0, Math.min(window.totalUnits - 1, Math.floor(offset)));
    event.gridDurationUnits = Math.max(1, Math.ceil(endUnitClamped) - event.gridOffsetUnits);
    return;
  }
  const offset = clampUnit(daysBetween(window.startDateKey, event.startDateKey), window.totalUnits);
  const endOffset = clampUnit(daysBetween(window.startDateKey, event.endDateKey), window.totalUnits);
  event.offsetUnits = offset;
  event.durationUnits = Math.max(1, endOffset - offset + 1);
}

function getTimelineWindowPosition(event: CalendarTimelineEvent, window: TimelineWindow): "before" | "visible" | "after" {
  if (window.unit === "hour" && window.startMinutes != null && event.startMinutes != null && event.startDateKey === event.endDateKey) {
    const windowStart = window.startMinutes;
    const windowEnd = windowStart + Math.max(1, window.viewportUnitSpan ?? window.totalUnits) * MINUTES_PER_HOUR;
    const eventStart = dateMinuteOffset(window.startDateKey, event.startDateKey, event.startMinutes);
    const fallbackEnd = event.startMinutes + MINUTES_PER_HOUR;
    const endMinutes = event.endMinutes != null && event.endMinutes > event.startMinutes ? event.endMinutes : fallbackEnd;
    const eventEnd = Math.max(eventStart + 15, dateMinuteOffset(window.startDateKey, event.endDateKey, endMinutes));
    if (eventEnd <= windowStart) return "before";
    if (eventStart >= windowEnd) return "after";
    return "visible";
  }
  if (event.endDateKey < window.startDateKey) return "before";
  if (event.startDateKey > window.endDateKey) return "after";
  return "visible";
}

function assignOffWindowEventUnits(event: CalendarTimelineEvent, window: TimelineWindow): void {
  const offset = event.windowPosition === "after" ? Math.max(0, window.totalUnits - 1) : 0;
  event.offsetUnits = offset;
  event.durationUnits = 1;
  event.gridOffsetUnits = offset;
  event.gridDurationUnits = 1;
}

function clampUnit(value: number, totalUnits: number): number {
  return Math.max(0, Math.min(totalUnits - 1, value));
}

function daysBetween(startDateKey: string, endDateKey: string): number {
  return dateKeyDaysBetween(startDateKey, endDateKey) ?? 0;
}

function dateMinuteOffset(windowStartDateKey: string, dateKey: string, minutes: number): number {
  return daysBetween(windowStartDateKey, dateKey) * MINUTES_PER_DAY + minutes;
}

function dateTimeFromAbsoluteMinutes(startDateKey: string, absoluteMinutes: number): TimelineJumpAnchor {
  const dayOffset = Math.floor(absoluteMinutes / MINUTES_PER_DAY);
  return {
    dateKey: addDateKeyDays(startDateKey, dayOffset),
    timeMinutes: minuteOfDay(absoluteMinutes),
  };
}

function getTimelineAnchorStartMinutes(config: ViewConfig, totalUnits?: number, now?: Date): number {
  const configured = config.timelineAnchorTimeMinutes;
  if (typeof configured === "number" && Number.isFinite(configured)) {
    return normalizeTimelineHourStart(Math.max(0, Math.min(MINUTES_PER_DAY - 1, Math.round(configured))));
  }
  if (totalUnits != null) {
    // A viewport-sized day window with no navigated anchor time opens centred on the current
    // hour so "now" is in frame at mount instead of sitting far off the window's start.
    return resolveTimelineDayCentredStartMinutes(totalUnits, now ?? new Date());
  }
  return getTimelineVisibleHourRange(config).startHour * MINUTES_PER_HOUR;
}

function normalizeTimelineHourStart(minutes: number): number {
  return Math.floor(minutes / MINUTES_PER_HOUR) * MINUTES_PER_HOUR;
}

const EN_WEEKDAY_TICKS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ZH_WEEKDAY_TICKS = ["日", "一", "二", "三", "四", "五", "六"];

function formatTimelineTickLabel(date: Date, scale: TimelineScale, locale: EffectiveLocale): string {
  switch (scale) {
    case "day":
    case "month":
    case "quarter":
      return String(date.getUTCDate());
    case "week":
      return `${formatTimelineWeekday(date, locale)} ${date.getUTCDate()}`;
    case "year":
      // Year-scale ticks step roughly a month at a time, so the month reads as a
      // useful axis label where a day-of-month number would look arbitrary.
      return String(date.getUTCMonth() + 1);
    default:
      return assertNever(scale);
  }
}

function formatTimelineWeekday(date: Date, locale: EffectiveLocale): string {
  const labels = locale === "en" ? EN_WEEKDAY_TICKS : ZH_WEEKDAY_TICKS;
  return labels[date.getUTCDay()];
}

function normalizeWeekStartsOn(day: number | undefined): number {
  return typeof day === "number" && Number.isInteger(day) && day >= 0 && day <= 6 ? day : 0;
}

function getDaysSinceWeekStart(dayOfWeek: number, weekStartsOn: number): number {
  return (dayOfWeek - weekStartsOn + 7) % 7;
}

function getDaysUntilWeekEnd(dayOfWeek: number, weekStartsOn: number): number {
  return 6 - getDaysSinceWeekStart(dayOfWeek, weekStartsOn);
}

function assertNever(value: never): never {
  throw new Error(`Unsupported timeline scale: ${String(value)}`);
}

// ───────────────────────────────────────────────────────────────────
// 6. GROUPING, ORDER & SCALE HELPERS
// ───────────────────────────────────────────────────────────────────

function getTimelineGroupKeys(row: RowData, config: ViewConfig, uncategorizedLabel: string): { key: string; label: string }[] {
  const field = config.timelineGroupField;
  if (!field) return [{ key: UNCATEGORIZED_TIMELINE_LANE, label: uncategorizedLabel }];
  const column = config.schema.columns.find((col) => col.key === field);
  const displayType = column ? getColumnDisplayType(column, config.schema.computedFields) : undefined;
  // datetime 列在 "date" 模式按 dateKey 分组（忽略时刻），与 QueryEngine.getGroupKeys 口径一致。
  const useDateKey = column?.type === "datetime" && getDateGroupMode(config, field) === "date";
  const value = getRowFieldValue(row, field, config);
  if (displayType === "checkbox") {
    const key = toBooleanValue(value) ? "true" : "false";
    return [{ key, label: formatGroupKeyDisplay(config, field, key) }];
  }
  const values = Array.isArray(value) ? value : [value];
  const groups: { key: string; label: string }[] = [];
  for (const item of values) {
    const trimmed = stringifyValue(item).trim();
    if (!trimmed) continue;
    if (useDateKey) {
      const parts = parseDateTimeParts(item);
      if (parts) {
        groups.push({ key: parts.dateKey, label: formatGroupKeyDisplay(config, field, parts.dateKey) });
        continue;
      }
    }
    groups.push({ key: trimmed, label: trimmed });
  }
  if (groups.length === 0) return [{ key: UNCATEGORIZED_TIMELINE_LANE, label: uncategorizedLabel }];
  return groups;
}

function getRowFieldValue(row: RowData, field: string, config: ViewConfig): unknown {
  const fileValue = getTimelineFileFieldValue(row, field);
  if (fileValue !== undefined) return fileValue;
  const column = config.schema.columns.find((col) => col.key === field);
  if (column?.type === "computed" || column?.type === "rollup") {
    return row.computed[column.type === "computed" ? column.computedKey || column.key : column.key];
  }
  return row.frontmatter[field];
}

function getTimelineFileFieldValue(row: RowData, field: string): unknown {
  switch (field) {
    case "file.name":
      return row.file.basename || row.file.name.replace(/\.md$/i, "");
    case "file.basename":
      return row.file.basename || row.file.name.replace(/\.md$/i, "");
    case "file.file":
    case "file.path":
      return row.file.path;
    case "file.folder":
      return row.file.parent?.path || "";
    case "file.ext":
    case "file.extension":
      return row.file.extension;
    case "file.ctime":
    case "file.created":
      return row.file.stat.ctime;
    case "file.mtime":
    case "file.modified":
      return row.file.stat.mtime;
    case "file.size":
      return row.file.stat.size;
    default:
      return undefined;
  }
}

function isDateLikeColumn(column: ColumnDef, config: ViewConfig): boolean {
  return isDateLikeColumnType(getColumnDisplayType(column, config.schema.computedFields));
}

function getFieldDisplayType(config: ViewConfig, field: string): ColumnDef["type"] | undefined {
  const column = config.schema.columns.find((candidate) => candidate.key === field);
  return column ? getColumnDisplayType(column, config.schema.computedFields) : undefined;
}

function normalizeDateKey(value: unknown): string | null {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return dateKeyFromUtc(makeUtcDate(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  const dateOnly = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const monthIndex = Number(dateOnly[2]) - 1;
    const day = Number(dateOnly[3]);
    const date = makeUtcDate(year, monthIndex, day);
    if (date.getUTCFullYear() === year && date.getUTCMonth() === monthIndex && date.getUTCDate() === day) {
      return dateKeyFromUtc(date);
    }
    return null;
  }
  const parsed = new Date(raw);
  if (!Number.isFinite(parsed.getTime())) return null;
  return dateKeyFromUtc(makeUtcDate(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

/**
 * 方案 B：lane 默认排序——manual order 主导。两个事件都有 rank 时按 rank 排（支持任意重排），
 * 否则回退到 rows 顺序（order 字段）。不再按日期序；用户需要日期序时在排序选项显式选择
 * （走 hasActiveTimelineSort → compareTimelineEventOrder）。
 */
export function compareTimelineManualOrder(a: CalendarTimelineEvent, b: CalendarTimelineEvent): number {
  const rankCmp = compareManualRank(a.manualRank, b.manualRank);
  if (rankCmp !== 0) return rankCmp;
  return a.order - b.order;
}

/** Compare manual-order ranks (ASCII byte order, matching ManualOrder's LexoRank); returns 0 unless both have a rank. */
function compareManualRank(a: string | undefined, b: string | undefined): number {
  // LexoRank 用 ASCII 字节序（0-9 < A-Z < a-z），必须用 </> 比较；localeCompare 会不区分大小写，
  // 把 'Ma' 排到 'MM' 前，导致 lane 排序与 sortByManualRank 不一致、拖拽后视图不刷新。
  if (a && b) return a < b ? -1 : a > b ? 1 : 0;
  return 0;
}

/**
 * jump 修复：基于完整 lane 顺序（含 jump 事件）计算重排的 before/after 邻居。
 * jump 事件不在 visible DOM（它是 .db-timeline-window-jump 而非 .db-timeline-event），
 * 若用 visible DOM 算邻居会跨越 jump，导致拖入事件不紧贴目标。
 */
export function resolveTimelineReorderNeighbors(
  targetPath: string,
  placeBefore: boolean,
  fullPath: string[]
): { beforePath?: string; afterPath?: string } {
  const idx = fullPath.indexOf(targetPath);
  if (idx < 0) return {};
  if (placeBefore) {
    return { beforePath: idx > 0 ? fullPath[idx - 1] : undefined, afterPath: targetPath };
  }
  return { beforePath: targetPath, afterPath: idx < fullPath.length - 1 ? fullPath[idx + 1] : undefined };
}

function compareTimelineEventOrder(a: CalendarTimelineEvent, b: CalendarTimelineEvent): number {
  return a.order - b.order ||
    a.startDateKey.localeCompare(b.startDateKey) ||
    a.title.localeCompare(b.title) ||
    a.filePath.localeCompare(b.filePath);
}

function hasActiveTimelineSort(config: ViewConfig): boolean {
  if (config.sortColumn) return true;
  return (config.sortRules || []).some((rule) => rule.field && rule.direction);
}

function calendarMonthKey(date: Date): string {
  return [
    String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
  ].join("-");
}

/**
 * 统一事件两端绝对刻度（相对 windowStartKey 的分钟，可跨天）。取代 isAllDay 双轨定位：
 * 有 time → 真实 start–end 区间；无 time → [startDateKey 0:00, endDateKey 次日 0:00]（覆盖
 * 整段日期范围，单天=24h、跨天=多天长条）。渲染时再夹取到可见窗口（裁切 + jump）。
 */
export function resolveEventAbsoluteScale(
  event: Pick<CalendarTimelineEvent, "startDateKey" | "endDateKey" | "startMinutes" | "endMinutes" | "endIsDateOnly">,
  windowStartKey: string,
): { start: number; end: number } {
  const startDayOffset = dateKeyDaysBetween(windowStartKey, event.startDateKey) ?? 0;
  const startMin = event.startMinutes ?? 0;
  const start = startDayOffset * MINUTES_PER_DAY + startMin;
  const endDayOffset = dateKeyDaysBetween(windowStartKey, event.endDateKey) ?? 0;
  // 结束端是否按「含末天 +1 天」处理：显式 endIsDateOnly 优先；未提供时回退到「两端都无时间分量」。
  // 不能只用整体 hasTime：mixed date/datetime 下 date 端被 coerce 成 minutes=0 会使 hasTime=true，
  // 把 date 末天误当精确结束，丢掉最后一天（Q2：静态 1 格 vs 拖拽 2 格）。
  const treatEndAsDateOnly = event.endIsDateOnly ?? (event.startMinutes == null && event.endMinutes == null);
  if (treatEndAsDateOnly) {
    return { start, end: (endDayOffset + 1) * MINUTES_PER_DAY };
  }
  const endMin = event.endMinutes ?? (startMin + 60);
  return { start, end: endDayOffset * MINUTES_PER_DAY + endMin };
}

// ───────────────────────────────────────────────────────────────────
// 7. RANGE & BAR GEOMETRY
// ───────────────────────────────────────────────────────────────────
//
// The full task-driven range (earliest start/due minus padding, latest plus
// padding, expanded to a per-scale minimum span) is the reference's
// TimelineConfig geometry, kept separate from the visible window so
// virtualization can stay window-based while the range semantics stay
// pinned by tests.

export interface TimelineRangeGeometry {
  scale: TimelineScale;
  startDateKey: string;
  endDateKey: string;
  /** Whole days from startDateKey to endDateKey (exclusive end). */
  totalDays: number;
  /** Reference day width in px at this scale. */
  dayWidth: number;
}

export interface TimelineRangeGeometryOptions {
  /** Overrides "today" for deterministic range building; defaults to the local date. */
  todayDateKey?: string;
}

export function buildTimelineRangeGeometry(
  rows: RowData[],
  config: ViewConfig,
  scale: TimelineScale,
  options: TimelineRangeGeometryOptions = {},
): TimelineRangeGeometry {
  const startField = config.timelineStartDateField || config.calendarStartDateField || getDefaultEventDateField(config);
  const endField = config.timelineEndDateField || config.calendarEndDateField;
  const todayKey = options.todayDateKey || dateKeyFromUtc(startOfTodayUtc());
  const events = startField ? buildCalendarTimelineEvents(rows, config, { startField, endField }) : [];

  let minKey = todayKey;
  let maxKey = todayKey;
  for (const event of events) {
    if (event.startDateKey < minKey) minKey = event.startDateKey;
    if (event.startDateKey > maxKey) maxKey = event.startDateKey;
    if (event.endDateKey < minKey) minKey = event.endDateKey;
    if (event.endDateKey > maxKey) maxKey = event.endDateKey;
  }

  let startKey = addDateKeyDays(minKey, -TIMELINE_RANGE_PADDING_BEFORE_DAYS);
  let endKey = addDateKeyDays(maxKey, TIMELINE_RANGE_PADDING_AFTER_DAYS);

  const span = dateKeyDaysBetween(startKey, endKey) ?? 0;
  const minSpan = TIMELINE_MIN_RANGE_DAYS[scale];
  if (span < minSpan) {
    const extra = Math.ceil((minSpan - span) / 2);
    startKey = addDateKeyDays(startKey, -extra);
    endKey = addDateKeyDays(endKey, extra);
  }

  // Coarse scales align the range start to a natural period so bands and grid
  // boundaries land on real month edges; day scale keeps the exact date.
  if (scale !== "day") {
    const start = parseDateKey(startKey);
    if (start) startKey = dateKeyFromUtc(makeUtcDate(start.getUTCFullYear(), start.getUTCMonth(), 1));
  }

  return {
    scale,
    startDateKey: startKey,
    endDateKey: endKey,
    totalDays: dateKeyDaysBetween(startKey, endKey) ?? 0,
    dayWidth: TIMELINE_RANGE_DAY_WIDTH[scale],
  };
}

export interface TimelineBarGeometryInput {
  startDateKey: string;
  /** Missing means the row has no end date: the bar occupies the start day only. */
  endDateKey?: string;
  /** True when the end column is date-only: the bar's right edge sits at end+1. */
  endIsDateOnly?: boolean;
  rangeStartDateKey: string;
  scale: TimelineScale;
  /** px per column unit (local column width). */
  unitWidth: number;
  /** Render a centered point marker (milestone) instead of a span bar. */
  isMilestone?: boolean;
}

export interface TimelineBarGeometry {
  startDateKey: string;
  endDateKey: string;
  /** Column-unit offset of the bar start from the range start (>= 0). */
  offsetUnits: number;
  /** Column units the bar spans on screen (never below the bar minimum). */
  durationUnits: number;
  durationDays: number;
  isDueOnly: boolean;
  isMilestone: boolean;
}

export function resolveTimelineBarMinUnits(scale: TimelineScale, unitWidth: number): number {
  // Day scale columns are hours (timed events snap at 15 minutes); the
  // eight-pixel bar minimum applies to the day-unit scales where a whole day
  // can render narrower than the minimum.
  if (scale === "day") return 0.25;
  if (!Number.isFinite(unitWidth) || unitWidth <= 0) return 1;
  return Math.max(1, Math.ceil(TIMELINE_BAR_MIN_WIDTH_PX / unitWidth));
}

export function resolveTimelineBarGeometry(input: TimelineBarGeometryInput): TimelineBarGeometry {
  const isDueOnly = !input.endDateKey;
  // A date-only end occupies its day, so the right edge sits at end+1; a
  // due-only row occupies its single day the same way.
  const endIsDateOnly = input.endIsDateOnly ?? true;
  const endDateKey = endIsDateOnly ? addDateKeyDays(input.endDateKey ?? input.startDateKey, 1) : input.endDateKey!;
  const offset = Math.max(0, dateKeyDaysBetween(input.rangeStartDateKey, input.startDateKey) ?? 0);

  if (input.isMilestone) {
    // Milestone markers center on their date and occupy one column unit.
    return {
      startDateKey: input.startDateKey,
      endDateKey,
      offsetUnits: offset + 0.5,
      durationUnits: 1,
      durationDays: 1,
      isDueOnly,
      isMilestone: true,
    };
  }

  const durationDays = Math.max(1, dateKeyDaysBetween(input.startDateKey, endDateKey) ?? 1);
  return {
    startDateKey: input.startDateKey,
    endDateKey,
    offsetUnits: offset,
    durationUnits: Math.max(durationDays, resolveTimelineBarMinUnits(input.scale, input.unitWidth)),
    durationDays,
    isDueOnly,
    isMilestone: false,
  };
}

export function resolveTimelineProgressFillUnits(progress: number, barDurationUnits: number): number {
  if (!Number.isFinite(progress) || progress <= 0) return 0;
  if (!Number.isFinite(barDurationUnits) || barDurationUnits <= 0) return 0;
  return (progress / 100) * barDurationUnits;
}
