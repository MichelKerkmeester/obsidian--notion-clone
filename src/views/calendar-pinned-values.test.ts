// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-pinned-values
// COMPONENT: pins the calendar's own measured values so a stylesheet edit that
//            changes one fails here, not just as "styles.css moved" in a lane
// ───────────────────────────────────────────────────────────────────
//
// The CSS lane that guards styles.css detects that the file changed and asks
// a reader to recapture and review — it has no opinion on WHAT changed. That
// is the right division of labour for most of a nineteen-thousand-line
// stylesheet, but a handful of the calendar's own values were each measured
// against a reference capture at a specific number (a row height, a rule
// colour, a chip's height and radius, the today marker's size) and are cheap
// to pin directly: read the rule's own text out of styles.css and assert the
// value literally, so a future edit that quietly widens a chip or drops a
// rule colour turns this file red at `npm test` speed, before anyone opens an
// image.
//
// Deliberately narrow: this is not a CSS parser, and does not try to be one.
// Each assertion locates one named selector's own `{ ... }` block by a plain
// string search and reads the one declaration it cares about out of that
// block — enough to catch the value moving, not enough to be a general
// stylesheet test harness.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & HELPERS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getLocaleWeekStartsOn } from "../data/calendar-date-time";

const STYLES = readFileSync(resolve(__dirname, "../../styles.css"), "utf-8");

/** The declaration block for the first selector whose text matches `selector`
 *  exactly (as it appears in the stylesheet, including combinators), or
 *  throws — a selector that no longer exists is exactly the drift this file
 *  exists to catch, so a missing match must fail loudly rather than pass an
 *  empty string through every downstream `toContain`. */
function ruleBody(selector: string): string {
  const start = STYLES.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`calendar-pinned-values: selector not found verbatim: ${selector}`);
  const braceOpen = STYLES.indexOf("{", start);
  const braceClose = STYLES.indexOf("}", braceOpen);
  return STYLES.slice(braceOpen + 1, braceClose);
}

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("calendar pinned values — measured against the Anytype month grid capture", () => {
  it("pins the month row's default height at 136px", () => {
    const body = ruleBody(".note-database-container .db-calendar-month-week");
    expect(body).toContain("var(--db-calendar-day-min-height, 136px)");
  });

  it("pins the day-cell rule to the shared --db-calendar-rule token, not a literal per theme", () => {
    const body = ruleBody(".note-database-container .db-calendar-month-week > .db-calendar-day");
    expect(body).toContain("border-right: 1px solid var(--db-calendar-rule)");
    expect(body).toContain("border-bottom: 1px solid var(--db-calendar-rule)");
    // The token itself reproduces the measured #292929-on-#171717 / #EBEBEB-on-#FFFFFF pair
    // via color-mix toward --text-normal, which is theme-adaptive by construction — no
    // per-theme override survives on this selector. `.note-database-container .db-calendar {`
    // is declared more than once (the main container block, then this state-token block), so
    // this greps the raw text for the declaration rather than using ruleBody, which would
    // return the first (unrelated) block's body.
    expect(STYLES).toContain("--db-calendar-rule: color-mix(in srgb, var(--background-primary) 92%, var(--text-normal))");
  });

  it("pins the flat chip's 20px desktop pitch and square corners", () => {
    const body = ruleBody(".note-database-container .db-calendar-month-segment");
    expect(body).toContain("height: 20px");
    expect(body).toContain("border-radius: 0");
    expect(body).toContain("background: none");
  });

  it("pins the phone chip's 44px touch-floor override", () => {
    const body = ruleBody(".is-phone .note-database-container .db-calendar-month-segment");
    expect(body.replace(/\s+/g, " ").trim()).toBe("height: 44px;");
  });

  it("pins the today marker's 26x24px size and #216DFA fill", () => {
    const body = ruleBody(".note-database-container .db-calendar-day.is-today .db-calendar-day-number");
    expect(body).toContain("width: 26px");
    expect(body).toContain("height: 24px");
    expect(body).toContain("background: #216DFA");
  });

  it("pins the unscheduled surface to a header chip: no band rule survives in styles.css", () => {
    // The band's own rule (a bordered, always-laid-out drawer above the grid) is gone, not just
    // unreferenced — this greps the raw stylesheet text rather than one selector's block, so a
    // rule reintroduced under a new selector name would still be caught by its class name.
    expect(STYLES).not.toContain(".db-calendar-backlog");
    // The selector carries the shared control classes deliberately: the Today-label rule matches
    // `.is-text` at the same weight, so the chip class alone would lose the cascade and paint the
    // normal ink while this pin still read green. The rendered pair is compared in the browser
    // harness's own calendar assertions; this pin holds the declaration it depends on.
    const body = ruleBody(".note-database-container .db-calendar-nav-button.is-text.db-calendar-unscheduled-chip");
    expect(body).toContain("color: var(--text-muted)");
  });

  it("pins a multi-day chip's date range to sit right after its title, not stranded at the segment's far edge", () => {
    // The title's own flex-grow (below) fills a multi-day segment's whole grid-column span when
    // nothing bounds it, so a segment carrying a date range zeroes its title's grow — the fix for
    // an operator report of a multi-day chip's range reading as centred, detached text.
    const title = ruleBody(".note-database-container .db-calendar-month-title");
    expect(title).toContain("flex: 1 0 min(8ch, 100%)");
    const bounded = ruleBody(".note-database-container .db-calendar-month-segment:has(> .db-calendar-month-dates) > .db-calendar-month-title");
    expect(bounded.replace(/\s+/g, " ").trim()).toBe("flex-grow: 0;");
  });

  it("pins the week/day timed block to the month chip's flat ink: no fill, no accent bar, no radius", () => {
    const body = ruleBody(".note-database-container .db-calendar-week-timed-event");
    expect(body).toContain("background: none");
    expect(body).not.toContain("border-left");
    expect(body).toContain("border-radius: 0");
    expect(body).toContain("color: #292929");

    const dark = ruleBody(".theme-dark .note-database-container .db-calendar-week-timed-event");
    expect(dark.replace(/\s+/g, " ").trim()).toBe("color: #DDDDDD;");
  });

  it("pins the Monday default: unset reads Monday regardless of locale, an explicit override still wins", () => {
    // Negative control: before this ruling, an unset config fell through to the
    // host locale's own week start (en-US → Sunday, 0) — this is exactly the
    // value that must NOT come back, since the operator's override text names
    // the locale reflection as the defect all twenty Anytype captures disagree with.
    expect(getLocaleWeekStartsOn(undefined)).toBe(1);
    expect(getLocaleWeekStartsOn({ calendarFirstDayOfWeek: undefined })).toBe(1);
    // The setting stays an override in either direction.
    expect(getLocaleWeekStartsOn({ calendarFirstDayOfWeek: 0 })).toBe(0);
    expect(getLocaleWeekStartsOn({ calendarFirstDayOfWeek: 6 })).toBe(6);
  });

  it("pins the weekend tint token: one color-mix expression, no per-theme literal override", () => {
    expect(STYLES).toContain("--db-calendar-weekend-bg: color-mix(in srgb, var(--background-primary) 97%, var(--text-normal))");
    // Negative control: the tree used to carry a literal light value and a
    // `.theme-dark` override with a DIFFERENT literal — neither survives.
    expect(STYLES).not.toContain("--db-calendar-weekend-bg: #F7F7F7");
    expect(STYLES).not.toContain("--db-calendar-weekend-bg: #1E1E1E");
  });

  it("pins the month grid to seven fluid columns regardless of a custom column width", () => {
    // The month week row and the weekday label row never read the custom-width
    // var — only week/day's own time-grid tracks do (applyTimeGridSizingVars).
    const monthWeek = ruleBody(".note-database-container .db-calendar[style*=\"--db-calendar-col-width\"] .db-calendar-month-week");
    expect(monthWeek).toContain("repeat(7, var(--db-calendar-col-width))");
    const weekdays = ruleBody(".note-database-container .db-calendar-weekdays");
    expect(weekdays).toContain("repeat(7, minmax(0, 1fr))");
  });

  it("pins the \"+N more\" affordance to a reset button — no fill, no border, no centred text", () => {
    const body = ruleBody(".note-database-container .db-calendar-more-events");
    expect(body).toContain("background: none");
    expect(body).toContain("border: 0");
    expect(body).toContain("box-shadow: none");
    expect(body).toContain("text-align: left");
    expect(body).toContain("padding: 0 0 0 10px");
    expect(body).toContain("color: var(--db-calendar-muted-ink)");
  });

  it("pins the timed dot's removal: no chip carries a coloured dot", () => {
    expect(STYLES).not.toContain(".db-calendar-month-timed-dot");
  });

  it("pins the phone week/day time grid's minimum column width at 45px, the phone month grid's own cell", () => {
    const body = ruleBody(".is-phone .note-database-container .db-calendar.db-calendar-week");
    expect(body.replace(/\s+/g, " ").trim()).toBe("--db-calendar-phone-week-col-min: 45px;");

    // Both synchronised in-flow tracks read the same token, so a future edit that widens one
    // without the other silently un-syncs the header from the columns beneath it.
    const headerDays = ruleBody(".is-phone .note-database-container .db-calendar-time-header-days");
    const alldayCols = ruleBody(".is-phone .note-database-container .db-calendar-week-allday-cols");
    for (const track of [headerDays, alldayCols]) {
      expect(track).toContain("minmax(var(--db-calendar-phone-week-col-min, 45px), 1fr)");
      expect(track).toContain("overflow-x: auto");
    }

    const timeColumns = ruleBody(".is-phone .note-database-container .db-calendar-time-columns");
    expect(timeColumns).toContain("minmax(var(--db-calendar-phone-week-col-min, 45px), 1fr)");
  });

  it("pins the overlap stagger: an overlapping timed block insets by a fixed step and keeps the column's remaining width, not an equal N-way split", () => {
    const source = readFileSync(resolve(__dirname, "calendar-renderer.ts"), "utf-8");
    expect(source).toContain("const CALENDAR_TIMED_STAGGER_STEP = 10;");
    // Negative control: the old equal-split formula must not survive — it is
    // exactly what made a two-way overlap unreadable at a narrow column width.
    expect(source).not.toContain("(layout.columnIndex / layout.columnCount) * 100");
  });
});
