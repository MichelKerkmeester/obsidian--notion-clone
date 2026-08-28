// ───────────────────────────────────────────────────────────────────
// MODULE:    date-picker-model
// COMPONENT: pure calendar-grid and month-navigation math for the date picker
// ───────────────────────────────────────────────────────────────────
//
// Keeps the picker's week layout, month arithmetic, and value parsing UTC-
// based and DOM-free, so date-value-picker.ts can render and drive it
// without having to reason about timezones itself.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { addUtcDays, dateKeyFromUtc, makeUtcDate, parseDateKeyToUtc } from "../data/calendar-date-time";
import { CalendarDayModel } from "../data/calendar-timeline-model";

// ───────────────────────────────────────────────────────────────────
// 2. WEEK GRID
// ───────────────────────────────────────────────────────────────────

export function buildDatePickerWeeks(year: number, monthIndex: number, weekStartsOn: number): CalendarDayModel[][] {
  const msPerWeek = 7 * 86400000;
  const firstOfMonth = makeUtcDate(year, monthIndex, 1);
  const lastOfMonth = makeUtcDate(year, monthIndex + 1, 0);
  const offset = (firstOfMonth.getUTCDay() - weekStartsOn + 7) % 7;
  const firstVisible = addUtcDays(firstOfMonth, -offset);
  const endOffset = (weekStartsOn + 6 - lastOfMonth.getUTCDay() + 7) % 7;
  const lastVisible = addUtcDays(lastOfMonth, endOffset);
  const weekCount = Math.max(1, Math.ceil((lastVisible.getTime() - firstVisible.getTime() + 1) / msPerWeek));
  const weeks: CalendarDayModel[][] = [];
  for (let week = 0; week < weekCount; week++) {
    const days: CalendarDayModel[] = [];
    for (let day = 0; day < 7; day++) {
      const date = addUtcDays(firstVisible, week * 7 + day);
      days.push({
        dateKey: dateKeyFromUtc(date),
        inCurrentMonth: date.getUTCFullYear() === year && date.getUTCMonth() === monthIndex,
        events: [],
      });
    }
    weeks.push(days);
  }
  return weeks;
}

// ───────────────────────────────────────────────────────────────────
// 3. MONTH NAVIGATION
// ───────────────────────────────────────────────────────────────────

export function shiftDatePickerMonth(monthKey: string, deltaMonths: number): string {
  const [ys, ms] = monthKey.split("-");
  const year = Number(ys);
  const monthIndex = Number(ms) - 1;
  const shifted = makeUtcDate(
    Number.isFinite(year) ? year : new Date().getFullYear(),
    Number.isFinite(monthIndex) ? monthIndex + deltaMonths : deltaMonths,
    1,
  );
  return dateKeyFromUtc(shifted).slice(0, 7);
}

export function getDatePickerYearRangeStart(year: number): number {
  const safeYear = Number.isFinite(year) ? year : new Date().getFullYear();
  return Math.floor(safeYear / 12) * 12;
}

export function formatDatePickerMonthTitle(year: number, monthIndex: number, locale: string): string {
  const safeYear = Number.isFinite(year) ? year : new Date().getFullYear();
  const safeMonth = Number.isFinite(monthIndex) ? monthIndex : new Date().getMonth();
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(safeYear, safeMonth, 1));
}

// ───────────────────────────────────────────────────────────────────
// 4. VALUE PARSING
// ───────────────────────────────────────────────────────────────────

export function normalizeDatePickerValue(value: string, includeTime: boolean): string {
  const raw = String(value || "").replace(" ", "T");
  const dateKey = raw.slice(0, 10);
  if (!parseDateKeyToUtc(dateKey)) return "";
  if (!includeTime) return dateKey;
  const match = raw.match(/^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})/);
  if (!match) return `${dateKey}T00:00`;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return `${dateKey}T00:00`;
  return `${dateKey}T${match[1]}:${match[2]}`;
}

export function composeDatePickerValue(
  dateKey: string,
  hourValue: string,
  minuteValue: string,
  includeTime: boolean,
): string | null {
  if (!parseDateKeyToUtc(dateKey)) return null;
  if (!includeTime) return dateKey;
  const rawHour = hourValue.replace(/\D/g, "");
  const rawMinute = minuteValue.replace(/\D/g, "");
  if (!rawHour && !rawMinute) return `${dateKey}T00:00`;
  const hour = rawHour ? Number(rawHour) : 0;
  const minute = rawMinute ? Number(rawMinute) : 0;
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 ||
    !Number.isInteger(minute) || minute < 0 || minute > 59) return null;
  return `${dateKey}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
