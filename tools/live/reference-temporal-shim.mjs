// ───────────────────────────────────────────────────────────────────
// MODULE:    reference-temporal-shim
// COMPONENT: the Temporal subset the vendored reference plugin renders with
// ───────────────────────────────────────────────────────────────────
//
// The vendored reference plugin (specs/context/obsidian-pm-main) builds every date on
// `temporal-polyfill`'s Temporal. This repository carries no Temporal dependency, so the
// reference bundle aliases `temporal-polyfill` to this module: the subset the reference's
// kanban/gantt render path actually calls, implemented over Date and Intl, which the
// browser and node both provide. Anything outside the subset throws rather than silently
// producing a wrong date, so a future reference version reaching past it fails loudly
// instead of rendering a shifted timeline.
//
// `Now.plainDateISO` reads renderNow() rather than `new Date()` directly: the reference
// gantt's task bars come from the same timeline bench our own gantt does (both anchor
// "today" through renderNow()), and the vendored view's own today-line/diamond call this
// function for its own idea of "today" — without this seam the two would draw the bars at
// the frozen capture instant and the today-marker at the real one, agreeing on nothing.
//

// The subset, traced from the reference's render-path call sites (dates.ts, TimelineConfig,
// GanttHeaderRenderer, GanttRenderer, TaskFilter): `Now.plainDateISO`, `PlainDate.from`
// (string and object forms), `compare`, `add`/`subtract` with day/month/year amounts,
// `since`/`until` in days, `with({ day })`, the calendar fields `year`/`month`/`day`/
// `dayOfWeek` (Monday=1) and `weekOfYear` (ISO 8601), and `toLocaleString` over the host
// Intl. The day arithmetic carries real month lengths and leap years, and `add({ months })`
// clamps to the target month's length the way Temporal's overflow-constrain default does.

// ───────────────────────────────────────────────────────────────────
// 1. DATE MATH
// ───────────────────────────────────────────────────────────────────

import { renderNow } from "../../src/data/calendar-date-time.ts";

const DAY_MS = 86400000;

function daysInMonth(year, month) {
  // month is 1-based; day 0 of the next month is the last day of this one.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function utcDays(y, m, d) {
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
}

function fromUtcDays(days) {
  const date = new Date(days * DAY_MS);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

// ───────────────────────────────────────────────────────────────────
// 2. PLAIN DATE
// ───────────────────────────────────────────────────────────────────

class PlainDate {
  constructor(year, month, day) {
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      throw new RangeError(`invalid plain date ${year}-${month}-${day}`);
    }
    if (month < 1 || month > 12) throw new RangeError(`invalid month ${month}`);
    if (day < 1 || day > daysInMonth(year, month)) throw new RangeError(`invalid day ${day}`);
    this.year = year;
    this.month = month;
    this.day = day;
  }

  static from(input) {
    if (typeof input === "string") {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
      if (!match) throw new RangeError(`invalid ISO date ${input}`);
      return new PlainDate(Number(match[1]), Number(match[2]), Number(match[3]));
    }
    return new PlainDate(input.year, input.month, input.day);
  }

  static compare(a, b) {
    return utcDays(a.year, a.month, a.day) - utcDays(b.year, b.month, b.day);
  }

  /** Monday = 1 through Sunday = 7, the ISO numbering the reference's weekend checks use. */
  get dayOfWeek() {
    return new Date(Date.UTC(this.year, this.month - 1, this.day)).getUTCDay() || 7;
  }

  /** The ISO 8601 week number: the week of the year containing this date's Thursday. */
  get weekOfYear() {
    const thursday = utcDays(this.year, this.month, this.day) + (4 - this.dayOfWeek);
    const thursdayDate = fromUtcDays(thursday);
    const jan4 = new Date(Date.UTC(thursdayDate.year, 0, 4));
    const jan4Weekday = jan4.getUTCDay() || 7;
    const firstThursday = utcDays(thursdayDate.year, 1, 4) + (4 - jan4Weekday);
    return 1 + Math.round((thursday - firstThursday) / 7);
  }

  add(amount) {
    if (amount.days) {
      const shifted = fromUtcDays(utcDays(this.year, this.month, this.day) + amount.days);
      return new PlainDate(shifted.year, shifted.month, shifted.day);
    }
    if (amount.months) {
      const total = this.year * 12 + (this.month - 1) + amount.months;
      const year = Math.floor(total / 12);
      const month = (total % 12) + 1;
      return new PlainDate(year, month, Math.min(this.day, daysInMonth(year, month)));
    }
    if (amount.years) {
      const year = this.year + amount.years;
      return new PlainDate(year, this.month, Math.min(this.day, daysInMonth(year, this.month)));
    }
    return new PlainDate(this.year, this.month, this.day);
  }

  subtract(amount) {
    return this.add(
      Object.fromEntries(Object.entries(amount).map(([unit, value]) => [unit, -value])),
    );
  }

  /** Signed day difference, `this - other`, the semantics `since` carries. */
  since(other, options) {
    const largest = options?.largestUnit ?? "days";
    if (largest !== "days" && largest !== "day") {
      throw new RangeError(`reference-temporal-shim: unsupported largestUnit ${largest}`);
    }
    return new Duration(utcDays(this.year, this.month, this.day) - utcDays(other.year, other.month, other.day));
  }

  until(other, options) {
    return other.since(this, options);
  }

  with(fields) {
    return new PlainDate(
      fields.year ?? this.year,
      fields.month ?? this.month,
      fields.day ?? this.day,
    );
  }

  toString() {
    return `${String(this.year).padStart(4, "0")}-${String(this.month).padStart(2, "0")}-${String(this.day).padStart(2, "0")}`;
  }

  toLocaleString(locale, options) {
    // The reference asks for calendar fields only (month short, year 2-digit), and a date
    // must not shift by the host timezone, so the formatter runs over a UTC noon.
    return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" })
      .format(new Date(Date.UTC(this.year, this.month - 1, this.day, 12)));
  }
}

class Duration {
  constructor(days) {
    this.days = days;
    this.months = 0;
    this.years = 0;
  }
}

export const Temporal = {
  PlainDate,
  Now: {
    plainDateISO() {
      const now = renderNow();
      return new PlainDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
    },
  },
};
