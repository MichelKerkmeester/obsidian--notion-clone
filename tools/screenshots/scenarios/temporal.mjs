// ───────────────────────────────────────────────────────────────────
// MODULE:    temporal
// COMPONENT: screenshot scenarios for the calendar month/week/mini grids and the timeline, pinned to one fictional "now"
// ───────────────────────────────────────────────────────────────────

/**
 * Temporal surfaces: the calendar month grid, the week time grid, the mini calendar
 * picker, the timeline, and the two settings popovers that configure them.
 *
 * These are the surfaces most dependent on geometry the plugin measures at runtime, so the
 * fixtures below set the per-element custom properties the renderers set — segment lane and
 * span in the month grid, exact offset and width on a timeline bar, top/height on a timed
 * event — exactly where the renderer sets them. `runtime-vars.css` only stands in for the
 * container-level values (unit width, row height, column count); anything the renderer
 * writes onto an individual element has to be written onto the individual element here too,
 * or every event stacks in one place.
 *
 * Every capture is pinned to one fictional "now": Wednesday 25 March 2026, 13:45. That is
 * what `is-today`, `is-current-date-tick` and the current-time ruler are placed against.
 *
 * These surfaces are laid out by date rather than by row, and the five shared `ROWS` renew
 * across three different years — dropped onto one month they would leave every week empty
 * but two. The mock data below therefore keeps the shared subscriptions (their names, and
 * the Business/Personal split that colours them) but re-dates them into one window, so the
 * captures still read as the same dataset as the table and board shots.
 */

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { glyph } from "./shared.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. ICONS
// ───────────────────────────────────────────────────────────────────

/* Lucide path data for the icons the plugin injects with setIcon() at runtime. */
const ICON = {
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronsLeft: '<path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/>',
  chevronsRight: '<path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  calendarDays:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>' +
    '<path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
  // The plain calendar, which is not the dotted one. Year display takes this and the event start
  // date takes `calendarDays`; drawing both with `calendarDays` gave two different settings the
  // same glyph in a menu where the glyph is the only thing distinguishing them at a glance.
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  calendarRange:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M17 14h-6M13 18H7"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  ruler: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M7 6v4M11 6v6M15 6v4M19 6v6"/>',
  palette:
    '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="15.5" cy="10" r="1"/>',
  layoutGrid:
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>' +
    '<rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  columns: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/>',
  rows: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18"/>',
  textCursor: '<path d="M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1M7 22h1a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4H7"/>',
  smilePlus:
    '<path d="M22 11v1a10 10 0 1 1-9-10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01M16 5h6"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  // setIcon(button, "arrow-left"/"arrow-right") on the timeline's window-jump indicator
  // (calendar-timeline-renderer.ts:1024).
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  // renderEmpty()'s reason-specific glyphs and its "select date property" action
  // (empty-state-renderer.ts EMPTY_STATE_COPY/renderCard).
  calendarPlus:
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/>' +
    '<path d="M3 10h18"/><path d="M10 16h4"/><path d="M12 14v4"/>',
  calendarOff:
    '<path d="M16 2v4"/><path d="M3 10h5"/><path d="M21 10h-5.5"/>' +
    '<path d="M21 15.5V6a2 2 0 0 0-2-2H9.5"/>' +
    '<path d="M4.2 4.2A2 2 0 0 0 3 6v14a2 2 0 0 0 2 2h14c.55 0 1.05-.22 1.41-.59"/>' +
    '<path d="m2 2 20 20"/>',
  settings2: '<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
};

/* Mirrors applyEventColor()/applyCalendarEventColor(): both write the accent and the tint
   as the two status-colour variables onto the event element itself. */
const eventColor = (tone) =>
  `--db-calendar-event-accent: var(--status-color-fg-${tone}); --db-calendar-event-bg: var(--status-color-bg-${tone});`;

// ───────────────────────────────────────────────────────────────────
// 3. SHARED TOOLBAR-POPOVER ROWS
// ───────────────────────────────────────────────────────────────────

// The calendar and timeline settings popovers are built by the same three helpers in both
// renderers (createDropdownField, renderSwitch, renderRange), so the fixtures share them too.

const dropdownRow = (icon, label, value) => `
  <button type="button" class="db-dropdown-field db-chart-options-dropdown has-current-icon"
    aria-haspopup="listbox" aria-expanded="false">
    <span class="db-dropdown-field-icon">${glyph(icon)}</span>
    <div class="db-dropdown-field-text">
      <span class="db-dropdown-field-label">${label}</span>
      <span class="db-dropdown-field-value">${value}</span>
    </div>
    <span class="db-dropdown-field-chevron">${glyph(ICON.chevronDown)}</span>
  </button>`;

const switchRow = (icon, label, on) => `
  <label class="db-chart-options-row db-chart-options-switch-row">
    <span class="db-chart-options-row-icon">${glyph(icon)}</span>
    <div class="db-chart-options-row-text"><span class="db-chart-options-label">${label}</span></div>
    <input type="checkbox" role="switch" class="db-toggle-switch"${on ? " checked" : ""}>
  </label>`;

const rangeRow = (label, value, min, max, step, extraClass) => `
  <div class="db-chart-options-row db-calendar-range-row ${extraClass || ""}">
    <span class="db-chart-options-row-icon">${glyph(ICON.ruler)}</span>
    <div class="db-chart-options-row-text"><span class="db-chart-options-label">${label}</span></div>
    <div class="db-view-config-range">
      <input type="range" min="${min}" max="${max}" step="${step}" value="${value}">
      <input type="number" class="db-view-config-number" min="${min}" max="${max}" step="${step}" value="${value}">
    </div>
  </div>`;

const section = (title, body) => `
  <div class="db-chart-options-section">
    <div class="db-chart-options-section-title">${title}</div>
    ${body}
  </div>`;

/**
 * Popovers anchor themselves under the toolbar button that opened them, and cap their height
 * against the viewport before scrolling the overflow. With no anchor and no scroll position
 * that photographs as a clipped, empty box, so the anchoring and the cap are lifted. The
 * width is left alone — that rule needs no anchor and is part of what is being documented.
 */
const STATIC_POPOVER = `position: static !important; top: auto !important; right: auto !important;
  left: auto !important; max-height: none !important;`;

// ───────────────────────────────────────────────────────────────────
// 4. CALENDAR HEADER
// ───────────────────────────────────────────────────────────────────

const navButton = (icon, label) =>
  icon
    ? `<button type="button" class="db-calendar-nav-button is-icon" title="${label}" aria-label="${label}">
        <span class="db-calendar-nav-icon">${glyph(icon)}</span></button>`
    : `<button type="button" class="db-calendar-nav-button is-text" title="${label}" aria-label="${label}">${label}</button>`;

const scaleControl = (active) => `
  <div class="db-calendar-scale-control" role="group">
    <div class="db-calendar-scale-segment">
      ${["Day", "Week", "Month"].map((s) => `
        <button type="button" class="db-calendar-scale-button ${s === active ? "is-active" : ""}"
          aria-pressed="${s === active ? "true" : "false"}">${s}</button>`).join("")}
    </div>
    <button type="button" class="db-calendar-scale-menu db-calendar-nav-button is-text" aria-haspopup="listbox">
      <span class="db-calendar-scale-menu-label">${active}</span>
      <span class="db-calendar-nav-icon db-calendar-scale-menu-chevron">${glyph(ICON.chevronDown)}</span>
    </button>
  </div>`;

const calendarHeader = (main, year, activeScale, prev, next) => `
  <div class="db-calendar-header">
    <div class="db-calendar-title" title="${main} ${year}" aria-label="${main} ${year}">
      <span class="db-calendar-title-main">${main}</span>
      <span class="db-calendar-title-year">${year}</span>
    </div>
    <div class="db-calendar-controls">
      ${scaleControl(activeScale)}
      ${navButton(ICON.chevronLeft, prev)}
      ${navButton(null, "Today")}
      ${navButton(ICON.chevronRight, next)}
      <button type="button" class="db-calendar-nav-button is-icon" title="Pick a date" aria-label="Pick a date">
        <span class="db-calendar-nav-icon">${glyph(ICON.calendarDays)}</span>
      </button>
    </div>
  </div>`;

// ───────────────────────────────────────────────────────────────────
// 5. MONTH GRID
// ───────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const calendarIsWeekendDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekday === 0 || weekday === 6;
};

export const calendarWeekdayMarkup = (name, index) => `
  <div class="db-calendar-weekday ${index === 0 || index === 6 ? "is-weekend" : ""}" role="columnheader"><span>${name}</span>
    <div class="db-calendar-col-resize-handle"></div></div>`;

export const calendarBacklogEmptyMarkup = () => `
  <div class="db-calendar-backlog">
    <div class="db-calendar-backlog-header">
      <button type="button" class="db-calendar-backlog-toggle" aria-expanded="true">Unscheduled (0)</button>
    </div>
    <div class="db-calendar-backlog-list">
      <div class="db-calendar-backlog-empty">Nothing unscheduled.</div>
    </div>
  </div>`;

/* Mirrors EmptyStateRenderer.renderCard() (empty-state-renderer.ts:262-295) class-for-class, for
   the two reasons calendar-renderer.ts's renderEmpty() ever passes it (:248-268, :631-667):
   "no-date-field" (no calendarStartDateField resolved) and "no-events" (a date field exists but
   nothing in it falls in view). renderEmpty() calls renderCard(container, ...) directly — no
   .db-calendar wrapper is ever created on this path — so the card lands as a direct child of
   .note-database-container, which is what styles.css:16849-16864's density rule keys off. Only
   "no-date-field" carries an action (this.actions.openDateConfig is always present in the real
   app); copy is EMPTY_STATE_COPY's real English strings (empty-state-renderer.ts:179-188), not
   placeholder text, so the capture reads as the real card, not a stand-in for it. */
const CALENDAR_EMPTY_STATE_COPY = {
  "no-date-field": { title: "No date property", message: "Select the property that supplies dates for this view.", icon: ICON.calendarPlus },
  "no-events": { title: "No events", message: "Records with a value in the selected date property will appear here.", icon: ICON.calendarOff },
};

export const calendarEmptyStateMarkup = (reason) => {
  const copy = CALENDAR_EMPTY_STATE_COPY[reason];
  const actions = reason === "no-date-field" ? `
      <div class="db-empty-action-group">
        <button type="button" class="db-empty-action mod-cta" aria-label="Select date property">
          <span class="db-empty-action-icon" aria-hidden="true">${glyph(ICON.settings2)}</span>
          <span>Select date property</span>
        </button>
      </div>` : "";
  return `
  <div class="db-empty db-empty-card" data-empty-reason="${reason}">
    <div class="db-empty-card-icon" aria-hidden="true">${glyph(copy.icon)}</div>
    <div class="db-empty-card-content">
      <h3 class="db-empty-card-title">${copy.title}</h3>
      <div class="db-empty-card-message">${copy.message}</div>${actions}
    </div>
  </div>`;
};

export const monthDayCell = (day, column) => `
  <div class="db-calendar-day ${day.outside ? "is-outside-month" : ""} ${day.today ? "is-today" : ""} ${calendarIsWeekendDateKey(day.key) ? "is-weekend" : ""}"
    data-date-key="${day.key}" role="gridcell" tabindex="${day.today ? "0" : "-1"}" aria-label="${day.key}"
    style="grid-column: ${column}">
    <div class="db-calendar-day-heading">
      <span class="db-calendar-day-number">${day.n}</span>
      <button type="button" class="db-calendar-add-button" title="New" aria-label="New">+</button>
    </div>
  </div>`;

/**
 * One month segment. `lane` is the zero-based event lane; the renderer offsets it by two —
 * one for the heading row, one because grid lines are 1-based — before writing the variable.
 */
export const monthSegment = (seg) => {
  const edges = `${seg.start ? "is-start" : "is-continuation"} ${seg.end ? "is-end" : "continues-after"}`;
  const geometry =
    `--db-calendar-segment-start: ${seg.column}; --db-calendar-segment-span: ${seg.span};` +
    ` --db-calendar-segment-lane: ${seg.lane + 2}; ${eventColor(seg.tone)}`;
  return `
    <button type="button" class="db-calendar-month-segment ${seg.timed ? "is-timed" : "is-all-day"} ${edges}${seg.completed ? " is-completed" : ""}"
      title="${seg.title}" data-note-database-row-path="Subscriptions/${seg.title}.md" style="${geometry}">
      ${seg.timed ? `<span class="db-calendar-month-timed-dot"></span>
      <span class="db-calendar-month-time">${seg.time}</span>` : ""}
      <span class="db-calendar-month-title">${seg.title}</span>
      ${seg.dates ? `<span class="db-calendar-month-dates">${seg.dates}</span>` : ""}
    </button>`;
};

/**
 * A week row. The renderer sizes the row from JavaScript: a 28px heading band, one 22px
 * track per visible lane plus one more for the "+N" affordance when the week overflows,
 * and a filler track that absorbs the spare height so a sparse week does not stretch its
 * event spacing.
 */
const monthWeek = (week) => {
  const laneRows = week.lanes + (week.overflow ? 1 : 0);
  const rows = `grid-template-rows: 28px repeat(${laneRows}, 22px) minmax(0, 1fr);`;
  return `
    <div class="db-calendar-month-week" role="row" data-week-index="${week.index}"
      data-calendar-visible-lanes="${week.lanes}"
      style="${rows} --db-calendar-month-week-min-height: 112px">
      ${week.days.map((day, i) => monthDayCell(day, i + 1)).join("")}
      ${week.segments.map(monthSegment).join("")}
      ${week.overflow ? `<button type="button" class="db-calendar-more-events" aria-haspopup="dialog"
        aria-expanded="false" aria-label="${week.overflow.label}"
        style="grid-column: ${week.overflow.column}; grid-row: ${laneRows + 1}">${week.overflow.label}</button>` : ""}
    </div>`;
};

/** March 2026 laid out Sunday-first: five rows, the last spilling into April. */
const MARCH_WEEKS = [
  {
    index: 0,
    lanes: 2,
    days: [1, 2, 3, 4, 5, 6, 7].map((n) => ({ n, key: `2026-03-0${n}` })),
    segments: [
      { column: 2, span: 1, lane: 0, timed: true, time: "09:00", title: "iCloud", tone: "green", start: true, end: true },
      { column: 3, span: 3, lane: 0, title: "Figma", tone: "blue", dates: "Mar 3 – 5", start: true, end: true },
      { column: 4, span: 1, lane: 1, timed: true, time: "14:00", title: "Notion sync", tone: "blue", start: true, end: true },
    ],
  },
  {
    index: 1,
    lanes: 2,
    overflow: { column: 4, label: "+2 more" },
    days: [8, 9, 10, 11, 12, 13, 14].map((n) => ({ n, key: `2026-03-${String(n).padStart(2, "0")}` })),
    segments: [
      { column: 2, span: 5, lane: 0, title: "Notion", tone: "blue", dates: "Mar 9 – 13", start: true, end: true },
      { column: 4, span: 1, lane: 1, timed: true, time: "11:30", title: "Adobe CC", tone: "blue", start: true, end: true },
      { column: 5, span: 1, lane: 1, timed: true, time: "16:00", title: "Spotify", tone: "green", start: true, end: true },
    ],
  },
  {
    index: 2,
    lanes: 2,
    days: [15, 16, 17, 18, 19, 20, 21].map((n) => ({ n, key: `2026-03-${n}` })),
    segments: [
      { column: 2, span: 5, lane: 0, title: "Adobe CC audit", tone: "blue", dates: "Mar 16 – 20", start: true, end: true },
      { column: 4, span: 1, lane: 1, timed: true, time: "10:15", title: "Spotify family", tone: "green", start: true, end: true },
    ],
  },
  {
    index: 3,
    lanes: 1,
    days: [22, 23, 24, 25, 26, 27, 28].map((n) => ({ n, key: `2026-03-${n}`, today: n === 25 })),
    segments: [
      { column: 3, span: 1, lane: 0, timed: true, time: "08:45", title: "iCloud", tone: "green", start: true, end: true },
      { column: 5, span: 3, lane: 0, title: "Q1 renewals sweep", tone: "orange", dates: "Mar 26 – Apr 1", completed: true, start: true, end: false },
    ],
  },
  {
    index: 4,
    lanes: 1,
    days: [
      { n: 29, key: "2026-03-29" }, { n: 30, key: "2026-03-30" }, { n: 31, key: "2026-03-31" },
      { n: 1, key: "2026-04-01", outside: true }, { n: 2, key: "2026-04-02", outside: true },
      { n: 3, key: "2026-04-03", outside: true }, { n: 4, key: "2026-04-04", outside: true },
    ],
    segments: [
      { column: 1, span: 4, lane: 0, title: "Q1 renewals sweep", tone: "orange", dates: "Mar 26 – Apr 1", completed: true, start: false, end: true },
    ],
  },
];

// ───────────────────────────────────────────────────────────────────
// 6. WEEK TIME GRID
// ───────────────────────────────────────────────────────────────────

const WEEK_START_HOUR = 8;
const WEEK_END_HOUR = 16;
const HOUR_HEIGHT = 56; // HOUR_HEIGHT_MIN from CalendarLayoutModel
const GRID_HEIGHT = (WEEK_END_HOUR - WEEK_START_HOUR) * HOUR_HEIGHT;
const offsetOf = (minutes) => ((minutes - WEEK_START_HOUR * 60) / 60) * HOUR_HEIGHT;

const WEEK_DAYS = [22, 23, 24, 25, 26, 27, 28].map((n, i) => ({
  n,
  key: `2026-03-${n}`,
  name: WEEKDAYS[i],
  today: n === 25,
  weekend: calendarIsWeekendDateKey(`2026-03-${n}`),
}));

/** A timed card. Under 42px the renderer drops the time range and keeps the title. */
export const timedEvent = (event) => {
  const top = offsetOf(event.from);
  const height = Math.max(14, ((event.to - event.from) / 60) * HOUR_HEIGHT);
  const compact = height < 42;
  const columns = event.columns || 1;
  const left = ((event.column || 0) / columns) * 100;
  const width = 100 / columns;
  const range = `${String(Math.floor(event.from / 60)).padStart(2, "0")}:${String(event.from % 60).padStart(2, "0")}`
    + ` - ${String(Math.floor(event.to / 60)).padStart(2, "0")}:${String(event.to % 60).padStart(2, "0")}`;
  return `
    <button type="button" class="db-calendar-week-timed-event ${compact ? "is-compact" : ""}${event.completed ? " is-completed" : ""}"
      title="${range} ${event.title}" aria-label="${range} ${event.title}"
      data-note-database-row-path="Subscriptions/${event.title}.md"
      style="top: ${top}px; height: ${height}px; left: calc(${left}% + 4px); width: calc(${width}% - 8px); ${eventColor(event.tone)}">
      <div class="db-calendar-week-event-content">
        <div class="db-calendar-week-event-title">${event.title}</div>
        ${compact ? "" : `<div class="db-calendar-week-event-time">${range}</div>`}
      </div>
    </button>`;
};

const WEEK_EVENTS = {
  "2026-03-23": [{ title: "Figma sync", from: 540, to: 630, tone: "blue" }],
  "2026-03-24": [{ title: "Notion review", from: 660, to: 720, tone: "blue" }],
  "2026-03-25": [
    { title: "Spotify billing", from: 780, to: 840, tone: "green", completed: true },
    { title: "iCloud", from: 915, to: 945, tone: "green" },
  ],
  "2026-03-26": [{ title: "Adobe CC renewal", from: 600, to: 750, tone: "blue" }],
  "2026-03-27": [
    { title: "Design review", from: 840, to: 930, tone: "orange", column: 0, columns: 2 },
    { title: "1:1", from: 870, to: 900, tone: "blue", column: 1, columns: 2 },
  ],
};

const hourLabels = () => {
  const out = [];
  for (let hour = WEEK_START_HOUR; hour <= WEEK_END_HOUR; hour++) {
    const current = hour === 13; // 13:45 on the pinned "now"
    out.push(`<div class="db-calendar-week-hour-label ${current ? "is-current-time-tick" : ""}"
      style="top: ${offsetOf(hour * 60)}px">${String(hour).padStart(2, "0")}</div>`);
  }
  return out.join("");
};

const slotLines = () => {
  const out = [];
  for (let minute = WEEK_START_HOUR * 60; minute < WEEK_END_HOUR * 60; minute += 30) {
    out.push(`<div class="db-calendar-week-slot-line ${minute % 60 === 0 ? "is-hour" : ""}"
      aria-hidden="true" style="top: ${offsetOf(minute)}px"></div>`);
  }
  return out.join("");
};

// ───────────────────────────────────────────────────────────────────
// 7. MINI CALENDAR
// ───────────────────────────────────────────────────────────────────

const MINI_WEEKS = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, 1, 2, 3, 4],
];
const MINI_EVENT_DAYS = new Set([2, 3, 4, 5, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 24, 26, 27, 28]);
const MINI_SELECTED = new Set([22, 23, 24, 25, 26, 27, 28]);

const miniDay = (n, weekIndex) => {
  const outside = weekIndex === 4 && n < 10;
  const today = !outside && n === 25;
  const key = outside ? `2026-04-0${n}` : `2026-03-${String(n).padStart(2, "0")}`;
  const mods = [
    outside ? "is-outside" : "",
    today ? "is-today" : "",
    !outside && MINI_SELECTED.has(n) ? "is-selected" : "",
    !outside && MINI_EVENT_DAYS.has(n) ? "has-events" : "",
  ].filter(Boolean).join(" ");
  return `
    <button type="button" class="db-calendar-mini-day ${mods}" role="gridcell" data-date-key="${key}"
      title="${key}" aria-selected="${!outside && MINI_SELECTED.has(n) ? "true" : "false"}" tabindex="-1">
      <span class="db-calendar-mini-day-num">${n}</span>
      <span class="db-calendar-mini-day-dot"></span>
    </button>`;
};

// ───────────────────────────────────────────────────────────────────
// 8. TIMELINE
// ───────────────────────────────────────────────────────────────────

/* A two-week window, 23 March – 5 April 2026, one column per day. The unit width is the
   week scale's resolveTimelineUnitWidth() default (100px), asserted against the real
   export in temporal-tick-parity.test.mjs. */
const TL_UNITS = 14;
const TL_UNIT_WIDTH = 100;

const TL_MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Mar 24 – 27" within one month, "Mar 26 – Apr 1" across a month boundary. Decorative label
    only; the offset/span below are what has to match the renderer, and do. */
const timelineEventMeta = (event) => {
  const start = new Date(`${event.start}T00:00:00Z`);
  const end = new Date(`${event.end}T00:00:00Z`);
  const startText = `${TL_MONTH_ABBR[start.getUTCMonth()]} ${start.getUTCDate()}`;
  const endText = start.getUTCMonth() === end.getUTCMonth()
    ? String(end.getUTCDate())
    : `${TL_MONTH_ABBR[end.getUTCMonth()]} ${end.getUTCDate()}`;
  return event.start === event.end ? startText : `${startText} – ${endText}`;
};

const MINUTES_PER_DAY = 1440;
const MINUTES_PER_HOUR = 60;

/* Mirrors resolveEventAbsoluteScale() (calendar-timeline-model.ts:1294-1311): absolute minutes
   from the window's own start date. Every event here is date-only, so the end is always
   "the day after the end date at minute 0" — an inclusive end day with an exclusive boundary.
   Exported so temporal-tick-parity.test.mjs asserts this against the real export instead of
   re-deriving its own copy of the same date arithmetic. */
export const timelineEventAbsoluteScale = (event, windowStartKey) => {
  const rangeStart = new Date(`${windowStartKey}T00:00:00Z`);
  const start = timelineDaysBetween(rangeStart, new Date(`${event.start}T00:00:00Z`)) * MINUTES_PER_DAY;
  const endDayOffset = timelineDaysBetween(rangeStart, new Date(`${event.end}T00:00:00Z`));
  return { start, end: (endDayOffset + 1) * MINUTES_PER_DAY };
};

/* Mirrors the render loop's own per-event visibility decision (calendar-timeline-renderer.ts:
   450-476), NOT assignEventUnits() — that function clamps every event's offset/duration into the
   visible unit count no matter how far outside the window it starts, which is what the bar
   actually painted on screen does not do. The render loop instead clamps [scale.start, scale.end]
   against the visible window and only draws a bar where positive width survives the clamp
   (renderStart < renderEnd); a side that falls outside the window gets a
   .db-timeline-window-jump indicator instead, never a bar dragged to the window's edge. Exported
   so the parity test can assert this decision, not just the tick/band math, against a real
   export (resolveEventAbsoluteScale). */
export const timelineEventVisibility = (event, fixture) => {
  const scale = timelineEventAbsoluteScale(event, fixture.start);
  // Day scale's visible window opens at the fixture's own startMinutes (TL_DAY_START_MINUTES by
  // default, 0 — midnight), so visibility stays aligned with the tick, band, grid and today-line
  // calculations that use the same start. This keeps an all-day event at the visible boundary
  // from receiving a false leading jump and keeps later events out of a window they do not reach.
  const dayStartMinutes = fixture.startMinutes ?? TL_DAY_START_MINUTES;
  const visible = fixture.scale === "day"
    ? { start: dayStartMinutes, end: dayStartMinutes + fixture.units * MINUTES_PER_HOUR }
    : { start: 0, end: fixture.units * MINUTES_PER_DAY };
  const renderStart = Math.max(scale.start, visible.start);
  const renderEnd = Math.min(scale.end, visible.end);
  const isClippedStart = scale.start < visible.start;
  const isClippedEnd = scale.end > visible.end;
  const isOverEvent = renderStart < renderEnd;
  if (!isOverEvent) return { bar: null, isClippedStart, isClippedEnd, isOverEvent };
  const minutesPerUnit = fixture.scale === "day" ? MINUTES_PER_HOUR : MINUTES_PER_DAY;
  return {
    bar: {
      offset: Math.max(0, (renderStart - visible.start) / minutesPerUnit),
      span: Math.max(fixture.scale === "day" ? 0.25 : 1, (renderEnd - renderStart) / minutesPerUnit),
    },
    isClippedStart,
    isClippedEnd,
    isOverEvent,
  };
};

/* Mirrors renderTimelineJumpIndicator() (calendar-timeline-renderer.ts:1004-1025): the arrow
   button a clipped side gets instead of (or alongside) a bar, pointed at the row's own
   `--db-timeline-row` lane. */
const timelineJumpIndicator = (event, direction, isOverEvent) => {
  const dateKey = direction === "after" ? event.end : event.start;
  const label = `Jump to ${event.title} on ${dateKey}`;
  return `
    <button type="button" class="db-timeline-window-jump is-${direction === "after" ? "after" : "before"}${isOverEvent ? " is-over-event" : ""}"
      aria-label="${label}" data-note-database-row-path="Subscriptions/${event.title}.md"
      style="--db-timeline-row: ${event.row}">
      ${glyph(direction === "after" ? ICON.arrowRight : ICON.arrowLeft)}
    </button>`;
};

export const timelineEvent = (event, fixture, laneEvents = [event]) => {
  const visibility = timelineEventVisibility(event, fixture);
  const meta = timelineEventMeta(event);
  const eventPath = `Subscriptions/${event.title}.md`;
  const eventDetails = [event.title, meta].filter(Boolean).join(" · ");
  const eventLabel = `Open note: ${eventDetails}`;
  const milestoneLabelPlacement = timelineMilestoneLabelPlacement(
    event,
    laneEvents,
    fixture.width,
    fixture.scale === "day" ? "hour" : "day",
  );
  const jumpBefore = visibility.isClippedStart ? timelineJumpIndicator(event, "before", visibility.isOverEvent) : "";
  const jumpAfter = visibility.isClippedEnd ? timelineJumpIndicator(event, "after", visibility.isOverEvent) : "";
  if (!visibility.bar) return `${jumpBefore}${jumpAfter}`;
  const { offset, span } = visibility.bar;
  const geometry =
    `--db-timeline-row: ${event.row};` +
    ` --db-timeline-exact-offset: calc(var(--db-timeline-unit-width) * ${offset});` +
    ` --db-timeline-exact-width: calc(var(--db-timeline-unit-width) * ${span});` +
    ` ${eventColor(event.tone)}`;
  const subtask = event.subtask || { depth: 0, visible: true, children: false, collapsed: false, source: "none" };
  // A relation node exists for every row, so only a row with children or an actual
  // parent (depth > 0) is a real subtask-tree participant — mirrors the renderer's
  // hasSubtaskRelation gate rather than styling every event.
  const hasSubtaskRelation = Boolean(subtask.children || subtask.depth > 0);
  const classes = [
    "db-timeline-event",
    hasSubtaskRelation ? "db-subtask-event" : "",
    subtask.children ? "has-subtask-children" : "",
    event.milestone ? "is-milestone" : "",
    milestoneLabelPlacement === "above" ? "is-label-above" : "",
    event.progress > 0 ? "is-progressing" : "",
    visibility.isClippedStart ? "is-clipped-start" : "",
    visibility.isClippedEnd ? "is-clipped-end" : "",
  ].filter(Boolean).join(" ");
  const subtaskToggle = subtask.children
    ? `<button type="button" class="db-subtask-toggle db-subtask-event-toggle${subtask.collapsed ? " is-collapsed" : ""}" aria-label="${subtask.collapsed ? "Expand subtasks" : "Collapse subtasks"}" aria-expanded="${subtask.collapsed ? "false" : "true"}"><span class="db-collapse-triangle" aria-hidden="true"></span></button>`
    : "";
  const subtaskProgress = subtask.progress
    ? `<span class="db-timeline-subtask-progress" aria-label="${[subtask.progress.summary, subtask.progress.explicit].filter(Boolean).join(" · ")}">${subtask.progress.summary ? `<span class="db-subtask-progress-derived">${subtask.progress.summary}</span>` : ""}${subtask.progress.summary && subtask.progress.explicit ? `<span aria-hidden="true"> · </span>` : ""}${subtask.progress.explicit ? `<span class="db-subtask-progress-explicit">${subtask.progress.explicit}</span>` : ""}</span>`
    : "";
  const progress = event.progress > 0
    ? `<span class="db-timeline-event-progress" style="--db-timeline-progress-width: calc(var(--db-timeline-unit-width) * ${span * event.progress / 100})" aria-hidden="true"></span>`
    : "";
  const milestone = event.milestone
    ? `<span class="db-timeline-milestone-diamond" aria-hidden="true"></span>`
    : "";
  return `${jumpBefore}
    <div class="${classes}" role="group" aria-label="${eventDetails}" title="${eventDetails} · ${eventPath}"
      data-note-database-row-path="${eventPath}" data-timeline-event-id="${eventPath}"
      ${hasSubtaskRelation ? `data-subtask-depth="${subtask.depth}" data-subtask-visible="${subtask.visible}" data-subtask-progress-source="${subtask.source}"` : ""}
      ${event.progress > 0 ? `data-timeline-progress="${event.progress}"` : ""}
      ${event.milestone ? `data-timeline-milestone="true"` : ""} style="${geometry}${hasSubtaskRelation ? ` --db-subtask-depth: ${subtask.depth};` : ""}">
      ${milestone}${progress}
      ${subtaskToggle}
      <button type="button" class="db-timeline-event-trigger" aria-label="${eventLabel}">
        <span class="db-timeline-event-content">
        <span class="db-timeline-event-title">${event.title}</span>
        <span class="db-timeline-event-meta">${meta}</span>
        ${subtaskProgress}
        </span>
      </button>
      <button type="button" class="db-timeline-link-dot is-left" aria-keyshortcuts="Enter Space" aria-label="Dependency input: ${event.title}" data-timeline-link-side="left"></button>
      <button type="button" class="db-timeline-link-dot is-right" aria-keyshortcuts="Enter Space" aria-label="Dependency output: ${event.title}" data-timeline-link-side="right"></button>
    </div>${jumpAfter}`;
};

const timelineLane = (lane, fixture) => `
  <div class="db-timeline-group" data-timeline-lane-key="${lane.key}" id="group-section-${lane.key}">
    <div class="db-timeline-group-header">
      <div class="db-timeline-group-header-label">
        <button type="button" class="db-timeline-group-toggle" aria-expanded="true"
          aria-controls="group-section-${lane.key}" aria-label="Collapse">
          <span class="db-collapse-triangle"></span>
        </button>
        <span class="db-timeline-group-tag status-color-${lane.tone}"
          style="--db-timeline-group-tag-bg: var(--status-color-bg-${lane.tone}); --db-timeline-group-tag-fg: var(--status-color-fg-${lane.tone})">
          <span class="db-timeline-group-title">${lane.label}</span>
          <span class="db-timeline-group-count">${lane.events.length}</span>
        </span>
      </div>
      <div class="db-timeline-group-header-grid"></div>
    </div>
    <div class="db-timeline-events" data-timeline-lane-key="${lane.key}"
      style="--db-timeline-event-rows: ${lane.rows}">
      ${lane.events.map((event) => timelineEvent(event, fixture, lane.events)).join("")}
    </div>
    <div class="db-timeline-create-row">
      <button type="button" class="db-timeline-create-button"
        style="--db-timeline-create-offset: 1; --db-timeline-create-span: ${fixture.units}; --db-timeline-create-left: 0px; --db-timeline-create-width: calc(var(--db-timeline-unit-width) * ${fixture.units})">
        <span class="db-timeline-create-content">
          <span class="db-timeline-create-icon">${glyph(ICON.plus)}</span>
          <span class="db-timeline-create-label">New</span>
        </span>
      </button>
    </div>
  </div>`;

/* Every event carries its actual `start`/`end` date keys, once, and every scale derives its own
   visibility (bar, jump indicator, or both) from those same two dates through
   `timelineEventVisibility()` (mirroring the render loop's own clip decision in
   calendar-timeline-renderer.ts, not the separately-clamped assignEventUnits()) rather than
   reusing one scale's unit offsets on the other four fixtures' windows. A bar drawn at "Mar 24 –
   27" now sits at Mar 24-27 on every scale's own date axis, not wherever offset:1 span:4 happens
   to fall in that scale's unit width — and an event whose dates never reach a given scale's
   window draws no bar there at all, matching the renderer instead of a clamp that faked one.
   Adobe CC is a single day (Mar 25) rather than the review-flagged Apr 1-3: a milestone that
   review found unreachable at day/month/quarter scale under the old clamp, moved to the one date
   every scale's window actually contains. It shares Notion's row rather than Figma's because
   Figma's Mar 24-27 span already covers Mar 25. */
export const TL_LANES = [
  {
    key: "business",
    label: "Business",
    tone: "blue",
    rows: 2,
    events: [
      { title: "Figma", start: "2026-03-24", end: "2026-03-27", row: 1, tone: "blue", progress: 62 },
      { title: "Adobe CC", start: "2026-03-25", end: "2026-03-25", row: 2, tone: "blue", milestone: true },
      { title: "Notion", start: "2026-03-26", end: "2026-03-31", row: 2, tone: "blue" },
    ],
  },
  {
    key: "personal",
    label: "Personal",
    tone: "green",
    rows: 2,
    events: [
      { title: "Spotify", start: "2026-03-23", end: "2026-03-25", row: 1, tone: "green" },
      { title: "iCloud", start: "2026-03-24", end: "2026-04-02", row: 2, tone: "green" },
    ],
  },
];

/* The same two lanes and the same bar geometry as TL_LANES, with the business lane's three events
   re-read as one expanded parent and its two children. It is a separate lane set rather than a
   subtask field on TL_LANES itself because every ordinary timeline capture renders those lanes:
   marking them there would have put an indent, a toggle and a progress label into all five scales
   on both devices, and the ordinary un-related bar is exactly what those captures exist to show.
   Reusing the geometry verbatim keeps the tree state free of invented dates and widths. */
export const TL_SUBTASK_LANES = TL_LANES.map((lane) => lane.key !== "business" ? lane : {
  ...lane,
  events: [
    {
      ...lane.events[0],
      subtask: {
        depth: 0, visible: true, children: true, collapsed: false, source: "explicit",
        progress: { summary: "1/2 subtasks complete", explicit: "Explicit progress: 62%" },
      },
    },
    { ...lane.events[1], subtask: { depth: 1, visible: true, children: false, collapsed: false, source: "none" } },
    { ...lane.events[2], subtask: { depth: 1, visible: true, children: false, collapsed: false, source: "none" } },
  ],
});

const timelineNav = (icon, label) =>
  icon
    ? `<button type="button" class="db-timeline-nav-button is-icon" aria-label="${label}">
        <span class="db-timeline-nav-icon">${glyph(icon)}</span></button>`
    : `<button type="button" class="db-timeline-nav-button is-text" aria-label="${label}">${label}</button>`;

export const TIMELINE_FIXTURES = {
  /* These natural windows keep the date arithmetic used by the standalone tick/band mirrors.
     Each screenshot scenario replaces the window, title and unit width with the mounted
     viewport's values before rendering, so the header and body describe one window. */
  day: { scale: "day", label: "Day", units: 12, width: 60, start: "2026-03-25", slot: "30", title: "March 25" },
  week: { scale: "week", label: "Week", units: TL_UNITS, width: TL_UNIT_WIDTH, start: "2026-03-23", slot: "30", title: "March 23 — April 5" },
  month: { scale: "month", label: "Month", units: 31, width: 80, start: "2026-03-01", slot: "30", title: "March" },
  quarter: { scale: "quarter", label: "Quarter", units: 91, width: 15, start: "2026-01-01", slot: "30", title: "January — March" },
  year: { scale: "year", label: "Year", units: 365, width: 4, start: "2026-01-01", slot: "30", title: "2026" },
};

const timelineDateKey = (start, offset) => {
  const date = new Date(`${start}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

const timelineWeekend = (dateKey) => {
  const day = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
};

const EN_WEEKDAY_TICKS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const timelineAddUtcDays = (date, days) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const timelineDaysBetween = (a, b) => Math.round((b.getTime() - a.getTime()) / 86400000);

/* Mirrors the label span and successor check used by the timeline model. Keeping this decision in
   the fixture makes the photographed milestone use the same lane geometry as the live renderer. */
export const timelineMilestoneLabelPlacement = (event, laneEvents, unitWidth, unit) => {
  if (!event.milestone) return "inline";
  const next = laneEvents.find((candidate) => candidate !== event && (
    candidate.start > event.start
    || (candidate.start === event.start && (candidate.startMinutes ?? 0) > (event.startMinutes ?? 0))
  ));
  if (!next) return "inline";
  const gapMinutes = timelineDaysBetween(
    new Date(`${event.start}T00:00:00Z`),
    new Date(`${next.start}T00:00:00Z`),
  ) * MINUTES_PER_DAY + (next.startMinutes ?? 0) - (event.startMinutes ?? 0);
  const gapUnits = unit === "hour" ? gapMinutes / MINUTES_PER_HOUR : gapMinutes / MINUTES_PER_DAY;
  const safeUnitWidth = Number.isFinite(unitWidth) && unitWidth > 0 ? unitWidth : 1;
  const labelWidthUnits = (safeUnitWidth / 2 + 14 + Math.max(0, event.title.length) * 7) / safeUnitWidth;
  return gapUnits < labelWidthUnits ? "above" : "inline";
};

/* Mirrors formatTimelineTickLabel() (calendar-timeline-model.ts:1093-1108) exactly: day/month/
   quarter labels are the unpadded day-of-month, week pairs the weekday with the unpadded day, and
   year steps a label per month. The fixture cannot import that function directly — this bundle
   runs under plain node (`node tools/screenshots/capture.mjs`), with no ts-node/tsx step, and no
   other scenario file imports from src/ — so the rule is mirrored here instead, and
   temporal-tick-parity.test.mjs asserts this mirror against the real export for all five scales. */
export const timelineFormatTickLabel = (date, scale) => {
  if (scale === "week") return `${EN_WEEKDAY_TICKS[date.getUTCDay()]} ${date.getUTCDate()}`;
  if (scale === "year") return String(date.getUTCMonth() + 1);
  return String(date.getUTCDate());
};

/* Mirrors buildTimelineTicks() (calendar-timeline-model.ts:845-915) for every scale but day, which
   stays its own simple hourly branch below. stepDays (quarter 7, year 30, month/week 1) and the
   quarter-start boundary sweep are the two rules the old step-5/30/31 table and the
   boundary:true-on-every-tick shortcut both got wrong — every offset, label and boundary flag here
   comes from the same date arithmetic the model runs, not a hand-picked approximation. */
export const timelineTicksForDateRange = (fixture) => {
  const start = new Date(`${fixture.start}T00:00:00Z`);
  const end = timelineAddUtcDays(start, fixture.units - 1);
  const stepDays = fixture.scale === "quarter" ? 7 : fixture.scale === "year" ? 30 : 1;
  const ticks = [];
  const boundaryOffsets = new Map();
  if (fixture.scale === "quarter" || fixture.scale === "year") {
    for (
      let monthStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
      monthStart.getTime() <= end.getTime();
      monthStart = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1))
    ) {
      if (monthStart.getUTCMonth() % 3 === 0 && monthStart.getTime() >= start.getTime()) {
        boundaryOffsets.set(timelineDaysBetween(start, monthStart), monthStart);
      }
    }
  }
  for (let tick = start; tick.getTime() <= end.getTime(); tick = timelineAddUtcDays(tick, stepDays)) {
    const offset = timelineDaysBetween(start, tick);
    const boundary = boundaryOffsets.get(offset);
    if (boundary) boundaryOffsets.delete(offset);
    const isScaleBoundary = fixture.scale === "week"
      ? tick.getUTCDay() === 1
      : fixture.scale === "month"
        ? tick.getUTCDate() === 1
        : Boolean(boundary);
    ticks.push({
      key: tick.toISOString().slice(0, 10),
      label: timelineFormatTickLabel(tick, fixture.scale),
      offset,
      boundary: isScaleBoundary,
    });
  }
  for (const [offset, boundary] of boundaryOffsets) {
    ticks.push({ key: boundary.toISOString().slice(0, 10), label: timelineFormatTickLabel(boundary, fixture.scale), offset, boundary: true });
  }
  ticks.sort((a, b) => a.offset - b.offset);
  return ticks;
};

/* Every tick carries the same `offset` field the renderer's buildTimelineTicks() computes
   (dates or hours from the fixture's window start) — that offset, not the tick's position in
   the array, is what --db-timeline-tick-offset must render, or every scale's header collapses
   onto the left edge instead of spanning the visible window. */
const timelineTicksFor = (fixture) => {
  if (fixture.scale === "day") {
    const startHour = (fixture.startMinutes ?? TL_DAY_START_MINUTES) / 60;
    return Array.from({ length: fixture.units }, (_, index) => ({
      label: `${String((startHour + index) % 24).padStart(2, "0")}:00`,
      key: fixture.start,
      boundary: index === 0,
      offset: index,
    }));
  }
  return timelineTicksForDateRange(fixture);
};

/* Mirrors renderTimelineTickLabel(): the week scale splits "Wed 25" into a weekday span and a
   date span so the 22px today pill only ever sizes against the date, never the whole label. */
export const timelineTickLabel = (tick, scale, isFirstTick = false) => {
  const anchorStyle = isFirstTick ? ' style="transform: none"' : "";
  if (scale === "week") {
    const separator = tick.label.lastIndexOf(" ");
    if (separator > 0 && separator < tick.label.length - 1) {
      return `<span class="db-timeline-tick-label"${anchorStyle}><span class="db-timeline-tick-weekday">${tick.label.slice(0, separator)}</span><span class="db-timeline-tick-date">${tick.label.slice(separator + 1)}</span></span>`;
    }
  }
  return `<span class="db-timeline-tick-label"${anchorStyle}><span class="db-timeline-tick-date">${tick.label}</span></span>`;
};

/* Bare English month names, matching calendar-title-formatter.ts's own EN_MONTHS (:64-76) exactly
   — the axis band label is the plain month name with no year, never the "March 2026"/"Q1 2026"
   style the day/month fixture bands below still use out of this round's scope. */
const EN_MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* The pinned "now" (13:45) as minutes-of-day and as a day fraction — the same two numbers
   getTimelineTodayPositionStyle() derives from `now` (calendar-timeline-renderer.ts:103-133) to
   place the today-line and the current-time/current-date tick. Every scale's today offset below
   is built from one of these, not a per-scale hand-picked constant. */
const TL_PINNED_NOW_MINUTES = 13 * 60 + 45;
const TL_PINNED_DAY_FRACTION = TL_PINNED_NOW_MINUTES / MINUTES_PER_DAY;
/* The standalone scenario has no calendarStartHour override, so the visible day begins at
   midnight. Keeping this explicit lets the tick, band, grid and visibility mirrors share the
   renderer's start while only the number of visible hours varies by device. */
const TL_DAY_START_MINUTES = 0;

/* Mirrors resolveTimelineViewportUnitCount() (calendar-timeline-model.ts:233-238) exactly,
   including the parameter the earlier pass of this fixture dropped: day scale floors (a partial
   trailing hour is not a visible whole column), every other scale ceils (a partial trailing day
   still shows a clipped column, same as the real render). Exported so the parity test asserts it
   against the real function for all five scales. */
export const timelineResolveViewportUnitCount = (width, unitWidth, scale) => {
  const raw = width / unitWidth;
  return Math.max(1, scale === "day" ? Math.floor(raw) : Math.ceil(raw));
};

/* Mirrors getTimelineViewportWindow() for all five scales —
   the renderer's live "pseudo-infinite" mode, entered whenever buildTimelineModel() is passed a
   visibleUnitCount (calendar-timeline-model.ts:649-651), which the renderer always has: a live
   mounted container always reports a width to getTimelineViewportUnitCount()
   (calendar-timeline-renderer.ts:2419-2426). Day scale never centres — it always opens at the
   anchor date and TL_DAY_START_MINUTES, only totalUnits (hours) changes with device width, per
   the real branch's own shape. Every other scale centres totalUnits on the anchor date, replacing
   the scale's calendar-boundary window getTimelineWindow() uses. todayOffsetUnits mirrors
   getTimelineTodayPositionStyle()'s own offset formula (:103-133), not a separate guess, so the
   today-line this fixture draws lands where the real one would. Exported so the parity test
   asserts start/units against the real function for all five scales. */
export const timelineViewportWindow = (scale, anchorKey, totalUnits) => {
  if (scale === "day") {
    const endOffset = Math.floor((TL_DAY_START_MINUTES + totalUnits * MINUTES_PER_HOUR - 1) / MINUTES_PER_DAY);
    return {
      start: anchorKey,
      end: timelineDateKey(anchorKey, endOffset),
      units: totalUnits,
      startMinutes: TL_DAY_START_MINUTES,
      todayOffsetUnits: (TL_PINNED_NOW_MINUTES - TL_DAY_START_MINUTES) / 60,
    };
  }
  const before = Math.floor((totalUnits - 1) / 2);
  const start = timelineAddUtcDays(new Date(`${anchorKey}T00:00:00Z`), -before);
  return {
    start: start.toISOString().slice(0, 10),
    end: timelineDateKey(start.toISOString().slice(0, 10), totalUnits - 1),
    units: totalUnits,
    todayOffsetUnits: before + TL_PINNED_DAY_FRACTION,
  };
};

const timelineTitleParts = (scale, startKey, endKey) => {
  const start = new Date(`${startKey}T00:00:00Z`);
  const end = new Date(`${endKey}T00:00:00Z`);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();
  const startMonth = EN_MONTHS_FULL[start.getUTCMonth()];
  const endMonth = EN_MONTHS_FULL[end.getUTCMonth()];
  let main;
  if (scale === "day" && startKey === endKey) main = `${startMonth} ${start.getUTCDate()}`;
  else if (scale === "month" && sameMonth) main = startMonth;
  else if (scale === "month" || scale === "quarter") main = `${startMonth} — ${endMonth}`;
  else if (scale === "year") main = sameYear ? String(start.getUTCFullYear()) : `${start.getUTCFullYear()} — ${end.getUTCFullYear()}`;
  else if (sameMonth) main = `${startMonth} ${start.getUTCDate()} — ${end.getUTCDate()}`;
  else main = `${startMonth} ${start.getUTCDate()} — ${endMonth} ${end.getUTCDate()}`;
  const year = scale === "year"
    ? ""
    : sameYear
      ? String(start.getUTCFullYear())
      : `${start.getUTCFullYear()} — ${end.getUTCFullYear()}`;
  return { main, year };
};

/* Mirrors buildTimelineMonthBoundaryBands(input, true) (calendar-title-formatter.ts:150-172) in
   full — one band per calendar month the window crosses, labelled with the bare month name.
   Every non-day scale goes through this same real function (buildTimelineAxisBands() only
   special-cases day, calendar-title-formatter.ts:145-148), so week/month/quarter/year all call
   this one mirror rather than each carrying its own shortcut. */
export const timelineMonthBoundaryBands = (startKey, endKey) => {
  const start = new Date(`${startKey}T00:00:00Z`);
  const end = new Date(`${endKey}T00:00:00Z`);
  const bands = [];
  let groupStart = start.getUTCDate() === 1
    ? new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))
    : new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  while (groupStart.getTime() <= end.getTime()) {
    const monthEnd = new Date(Date.UTC(groupStart.getUTCFullYear(), groupStart.getUTCMonth() + 1, 0));
    const groupEnd = monthEnd.getTime() < end.getTime() ? monthEnd : end;
    bands.push({
      label: EN_MONTHS_FULL[groupStart.getUTCMonth()],
      span: timelineDaysBetween(groupStart, groupEnd) + 1,
      offset: timelineDaysBetween(start, groupStart),
    });
    groupStart = timelineAddUtcDays(groupEnd, 1);
  }
  return bands;
};

const timelinePositiveModulo = (value, modulus) => ((value % modulus) + modulus) % modulus;

/* Mirrors buildTimelineDayBoundaryBands() (calendar-title-formatter.ts:174-193): day scale bands
   by calendar-day crossing, not by month — a band starts only where the window crosses an actual
   midnight, so the day already open when the window starts gets no band of its own (only the day
   it turns into does). TL_DAY_START_MINUTES is 0 (midnight), so offset 0 is itself a boundary and
   always gets a band; a fixture.startMinutes that were not a multiple of 60 (never the case here)
   could still open on a short device window that crosses no further midnight at all, in which
   case the real function returns zero bands beyond that first one, same as here. */
const timelineDayBoundaryBands = (fixture) => {
  const start = new Date(`${fixture.start}T00:00:00Z`);
  const startMinutes = fixture.startMinutes ?? TL_DAY_START_MINUTES;
  const bands = [];
  for (let offset = 0; offset < fixture.units; offset++) {
    const absoluteMinutes = startMinutes + offset * 60;
    if (timelinePositiveModulo(absoluteMinutes, MINUTES_PER_DAY) !== 0) continue;
    const dayOffset = Math.floor(absoluteMinutes / MINUTES_PER_DAY);
    const date = timelineAddUtcDays(start, dayOffset);
    let nextOffset = fixture.units;
    for (let probe = offset + 1; probe < fixture.units; probe++) {
      if (timelinePositiveModulo(startMinutes + probe * 60, MINUTES_PER_DAY) === 0) { nextOffset = probe; break; }
    }
    bands.push({ label: `${EN_MONTHS_FULL[date.getUTCMonth()]} ${date.getUTCDate()}`, span: Math.max(1, nextOffset - offset), offset });
  }
  return bands;
};

/* Mirrors buildTimelineAxisBands() (calendar-title-formatter.ts:145-148) exactly: day scale bands
   by midnight crossing, every other scale by calendar-month crossing — the same real function for
   all four of week/month/quarter/year, not a per-scale shortcut. */
export const timelineAxisBands = (fixture) => {
  if (fixture.scale === "day") return timelineDayBoundaryBands(fixture);
  return timelineMonthBoundaryBands(fixture.start, timelineDateKey(fixture.start, fixture.units - 1));
};

/* Mirrors renderTimelineGridColumns() (calendar-timeline-renderer.ts): every hour column shares
   the fixture's single day, so date equality alone would mark all twelve is-today at once and
   the highlight would say nothing. Only the column standing in for the pinned "now" hour (13:00)
   carries it; the rest still get their weekend/date bookkeeping from the real date offset. */
const timelineGridColumns = (fixture) => Array.from({ length: fixture.units }, (_, index) => {
  const key = timelineDateKey(fixture.start, fixture.scale === "day" ? 0 : index);
  const isCurrentHourColumn = fixture.scale === "day" && (fixture.startMinutes ?? TL_DAY_START_MINUTES) / 60 + index === 13;
  const modifiers = [
    timelineWeekend(key) ? "is-weekend" : "",
    fixture.scale === "day" ? (isCurrentHourColumn ? "is-today" : "") : (key === "2026-03-25" ? "is-today" : ""),
  ].filter(Boolean).join(" ");
  return `<span class="db-timeline-grid-column ${modifiers}" data-date-key="${key}"
    style="--db-timeline-grid-column-offset: ${index}; --db-timeline-grid-column-span: 1"></span>`;
}).join("");

/* Desktop/mobile widths the capture harness actually opens the page at (tools/screenshots/
   capture.mjs's own DEVICES table, :88-91) — the closest available proxy for the "container"
   getTimelineViewportUnitCount() measures (calendar-timeline-renderer.ts:2419-2426), since a
   "viewport" capture (capture.mjs:96-98, every scenario in this group) fills #shot to the full
   device width with no side margin, and there is no live container here to measure directly. */
const TL_DEVICE_WIDTH = { desktop: 1440, mobile: 402 };
const TL_PHONE_VIEWPORT_WIDTH = 560;
const TL_DAY_PHONE_UNIT_WIDTH = 32;

/* Mirrors the viewport-aware unit-width branch used by the live renderer. */
export const timelineResolveUnitWidth = (scale, viewportWidth) => {
  const baseWidth = TIMELINE_FIXTURES[scale].width;
  if (scale === "day" && Number.isFinite(viewportWidth) && viewportWidth > 0 && viewportWidth < TL_PHONE_VIEWPORT_WIDTH) {
    return TL_DAY_PHONE_UNIT_WIDTH;
  }
  return baseWidth;
};

/* .note-database-container's own padding: `padding: 0 var(--db-space-8) var(--db-space-8)`
   (styles.css:809), and --db-space-8 is 24px (styles.css:52) — left and right are both the one
   `var(--db-space-8)` value, 24px each. getTimelineViewportUnitCount() (calendar-timeline-
   renderer.ts:2419-2426) measures the outer container's own rect width, then
   getTimelineViewportContentWidth() (calendar-timeline-model.ts:245-250) subtracts exactly this
   padding — never the sticky group-label column. That column (--db-timeline-group-width, 160px
   here, set by fitTimelineGroupHeaderWidth() :877-896 flooring at 160 since "Business 3"/
   "Personal 2" never need more) overlays the day grid rather than shrinking the measured
   container, so production's own unit count is never reduced by it: the label sits on top of
   however many columns its 160px happens to cover, occluding them rather than the grid never
   drawing them. */
const TL_CONTAINER_PADDING_PX = 24;

/* Mirrors getTimelineViewportContentWidth() (calendar-timeline-model.ts:245-250) exactly: the
   container's own rect width minus its own left/right CSS padding, floored at 0. Exported so the
   parity test asserts it against the real function. */
export const timelineViewportContentWidth = (width, paddingLeft, paddingRight) =>
  Math.max(0, (Number.isFinite(width) && width > 0 ? width : 0) - (paddingLeft || 0) - (paddingRight || 0));

export const timelineDynamicFixture = (scale, device) => {
  const base = TIMELINE_FIXTURES[scale];
  const deviceWidth = TL_DEVICE_WIDTH[device?.id === "mobile" ? "mobile" : "desktop"];
  const contentWidth = timelineViewportContentWidth(deviceWidth, TL_CONTAINER_PADDING_PX, TL_CONTAINER_PADDING_PX);
  const width = timelineResolveUnitWidth(scale, deviceWidth);
  const units = timelineResolveViewportUnitCount(contentWidth, width, scale);
  // The anchor is always the pinned "now" date. The title follows this same viewport window,
  // including a range that crosses month or year boundaries.
  const window = timelineViewportWindow(scale, "2026-03-25", units);
  const title = timelineTitleParts(scale, window.start, window.end);
  return {
    ...base,
    width,
    start: window.start,
    end: window.end,
    units: window.units,
    startMinutes: window.startMinutes,
    todayOffsetUnits: window.todayOffsetUnits,
    title: title.main,
    titleYear: title.year,
  };
};

const timelineScaleScenario = (scale, overrides = {}) => {
  const lanes = overrides.lanes || TL_LANES;
  const renderBody = (fixture, ticks, todayOffset) => {
    const title = [fixture.title, fixture.titleYear].filter(Boolean).join(" ");
    return `
      <div class="note-database-container db-view-timeline">
        <div class="db-timeline is-scale-${fixture.scale} is-slot-${fixture.slot}"
          data-timeline-scale="${fixture.scale}" data-timeline-unit="${fixture.scale === "day" ? "hour" : "day"}"
          style="--db-timeline-units: ${fixture.units}; --db-timeline-unit-width: ${fixture.width}px; --db-timeline-group-width: 160px">
          <div class="db-timeline-header">
            <div class="db-timeline-title" title="${title}" aria-label="${title}">
              <span class="db-timeline-title-main">${fixture.title}</span>
              ${fixture.titleYear ? `<span class="db-timeline-title-year">${fixture.titleYear}</span>` : ""}
            </div>
            <div class="db-timeline-controls">
              <div class="db-timeline-scale-control" role="group" aria-label="Timeline scale">
                <div class="db-timeline-scale-segment">
                  ${Object.values(TIMELINE_FIXTURES).map((option) => `
                    <button type="button" class="db-timeline-scale-button ${option.scale === fixture.scale ? "is-active" : ""}"
                      data-timeline-scale="${option.scale}" aria-label="${option.label}" aria-pressed="${option.scale === fixture.scale ? "true" : "false"}">${option.label}</button>`).join("")}
                </div>
                <button type="button" class="db-timeline-scale-menu db-timeline-nav-button is-text" aria-haspopup="listbox">
                  <span class="db-timeline-scale-menu-label">${fixture.label}</span>
                  <span class="db-timeline-nav-icon db-timeline-scale-menu-chevron">${glyph(ICON.chevronDown)}</span>
                </button>
              </div>
              ${timelineNav(ICON.chevronsLeft, "Previous window")}
              ${timelineNav(ICON.chevronLeft, "Previous column")}
              ${timelineNav(null, "Today")}
              ${timelineNav(ICON.chevronRight, "Next column")}
              ${timelineNav(ICON.chevronsRight, "Next window")}
              ${timelineNav(ICON.calendarDays, "Pick a date")}
            </div>
          </div>
          <div class="db-timeline-scroll">
            <div class="db-timeline-axis">
              <div class="db-timeline-ticks-band">
                ${timelineAxisBands(fixture).map((band) => `
                  <div class="db-timeline-band-item"
                    style="--db-timeline-band-start: ${band.offset + 1}; --db-timeline-band-span: ${band.span}">${band.label}</div>`).join("")}
              </div>
              <div class="db-timeline-ticks">
                ${ticks.map((tick) => {
                  /* isCurrentTimelineTick()/isCurrentTimelineDateTick(): the day scale marks the one
                     hour tick matching "now" (13:00) as is-current-time-tick and never applies
                     is-current-date-tick (every hour shares the same date); every other scale marks
                     the single tick whose date is today's as is-current-date-tick. */
                  const isCurrentTimeTick = fixture.scale === "day" && tick.label === "13:00";
                  const isCurrentDateTick = fixture.scale !== "day" && tick.key === "2026-03-25";
                  return `
                  <div class="db-timeline-tick ${tick.boundary ? "is-scale-boundary" : ""} ${timelineWeekend(tick.key) ? "is-weekend" : ""} ${isCurrentTimeTick ? "is-current-time-tick" : ""} ${isCurrentDateTick ? "is-current-date-tick" : ""}"
                    title="${tick.key}" data-date-key="${tick.key}" data-timeline-boundary="${tick.boundary ? "true" : "false"}" style="--db-timeline-tick-offset: ${tick.offset + 1}">
                    ${timelineTickLabel(tick, fixture.scale, tick.offset === 0)}
                  </div>`;
                }).join("")}
              </div>
            </div>
            <div class="db-timeline-body" style="--db-timeline-today-offset-units: ${todayOffset}; --db-timeline-today-offset-px: ${(todayOffset * fixture.width).toFixed(2)}px">
              <div class="db-timeline-grid-columns" aria-hidden="true">${timelineGridColumns(fixture)}</div>
              ${lanes.map((lane) => timelineLane(lane, fixture)).join("")}
              <div class="db-timeline-today-line" title="2026-03-25"></div>
            </div>
          </div>
        </div>
      </div>`;
  };
  const label = TIMELINE_FIXTURES[scale].label;
  return {
    id: overrides.id || (scale === "week" ? "timeline-view" : `timeline-view-${scale}`),
    title: overrides.title || `Timeline view — ${label}`,
    group: "views",
    width: 1100,
    sources: overrides.sources || ["src/views/calendar-timeline-renderer.ts"],
    note: overrides.note || (`${label} scale with boundary ticks, weekend fills, progress, milestone and dependency-line affordances. `
      + `Window and title both follow the live viewport-centred range (getTimelineViewportWindow() and getTimelineTitleWindow(), as production does whenever a real container is mounted), sized per device width after the container's own left/right padding so today, the bars and the milestone stay in frame.`),
    html: (device) => {
      const fixture = timelineDynamicFixture(scale, device);
      return renderBody(fixture, timelineTicksFor(fixture), fixture.todayOffsetUnits);
    },
  };
};

const TIMELINE_SCALE_SCENARIOS = Object.keys(TIMELINE_FIXTURES).map((scale) => timelineScaleScenario(scale));

const TIMELINE_SUBTASK_SCENARIO = timelineScaleScenario("week", {
  lanes: TL_SUBTASK_LANES,
  id: "timeline-subtask-tree",
  title: "Timeline view — subtask tree",
  sources: ["src/views/calendar-timeline-renderer.ts", "src/data/subtask-relation.ts", "src/data/subtask-serialize.ts", "src/i18n.ts"],
  note: "The week scale's own bars re-read as a tree: the parent keeps its collapse affordance and the done/total count beside its explicit percentage inside the bar, its two children indent by one depth step, and the second lane stays un-related so the ordinary bar is still in frame beside them.",
});

// ───────────────────────────────────────────────────────────────────
// 9. SCENARIOS
// ───────────────────────────────────────────────────────────────────

export const TEMPORAL_SCENARIOS = [
  {
    id: "calendar-month-view",
    title: "Calendar month view",
    group: "views",
    width: 1100,
    sources: ["src/views/calendar-renderer.ts"],
    /* The wrapper carries --db-calendar-day-min-height because applyMonthSizingVars() writes it
       there on every month render, from config.calendarCellMinHeight ?? 112 clamped to 72-400
       (calendar-renderer.ts:2165-2199). Nothing in that renderer measures the pane, so 112px is
       the product's row height at any viewport; runtime-vars.css derives this one variable from
       viewport height instead, and without the renderer's own write mirrored here the grid would
       photograph a denser month than the product draws. */
    note: "Multi-day all-day bars, timed events, weekend headers, a completed milestone treatment, an overflow week and a calm unscheduled empty line.",
    html: () => `
      <div class="note-database-container">
        <div class="db-calendar db-calendar-month" style="--db-calendar-day-min-height: 112px">
          ${calendarHeader("March", "2026", "Month", "Previous month", "Next month")}
          ${calendarBacklogEmptyMarkup()}
          <div class="db-calendar-weekdays" role="row">
            ${WEEKDAYS.map(calendarWeekdayMarkup).join("")}
          </div>
          <div class="db-calendar-grid db-calendar-month-grid" role="grid" aria-label="March 2026">
            ${MARCH_WEEKS.map(monthWeek).join("")}
          </div>
        </div>
      </div>`,
  },
  {
    id: "calendar-week-time-grid",
    title: "Calendar week time grid",
    group: "views",
    width: 1100,
    sources: ["src/views/calendar-renderer.ts"],
    note: "Sticky day header and all-day strip over the 08–16 time grid; weekend columns, a completed milestone treatment, a calm unscheduled empty line and the current-time ruler sit in frame.",
    html: () => `
      <div class="note-database-container">
        <div class="db-calendar db-calendar-week">
          ${calendarHeader("Mar 22 – 28", "2026", "Week", "Previous week", "Next week")}
          ${calendarBacklogEmptyMarkup()}
          <div class="db-calendar-week-sticky">
            <div class="db-calendar-time-header-row" role="row">
              <div class="db-calendar-time-header-gutter"></div>
              <div class="db-calendar-time-header-days" style="--db-calendar-time-day-count: 7">
                ${WEEK_DAYS.map((day) => `
                  <button type="button" class="db-calendar-time-header-day ${day.today ? "is-today" : ""} ${day.weekend ? "is-weekend" : ""}"
                    title="${day.key}" data-date-key="${day.key}" role="columnheader">
                    <span class="db-calendar-week-day-name">${day.name}</span>
                    <div class="db-calendar-col-resize-handle"></div>
                  </button>`).join("")}
              </div>
            </div>
            <div class="db-calendar-week-allday" style="--db-calendar-allday-rows: 1">
              <div class="db-calendar-week-allday-gutter"></div>
              <div class="db-calendar-week-allday-cols" data-calendar-visible-lanes="1"
                style="--db-calendar-time-day-count: 7; grid-template-rows: 28px repeat(1, 22px)">
                ${WEEK_DAYS.map((day, i) => `
                  <div class="db-calendar-week-allday-col ${day.today ? "is-today" : ""} ${day.weekend ? "is-weekend" : ""} ${i === 6 ? "is-last-col" : ""}"
                    data-date-key="${day.key}" style="grid-column: ${i + 1}"></div>`).join("")}
                ${WEEK_DAYS.map((day, i) => `
                  <button type="button" class="db-calendar-week-allday-date ${day.today ? "is-today" : ""} ${day.weekend ? "is-weekend" : ""}"
                    title="${day.key}" aria-label="${day.key}" style="grid-column: ${i + 1}">${day.n}</button>`).join("")}
                <button type="button" class="db-calendar-month-segment db-calendar-week-allday-segment is-all-day is-start is-end is-completed"
                  title="Q1 renewals sweep" data-note-database-row-path="Subscriptions/Q1.md"
                  style="--db-calendar-segment-start: 3; --db-calendar-segment-span: 3; --db-calendar-segment-lane: 2; ${eventColor("orange")}">
                  <span class="db-calendar-week-allday-content">
                    <span class="db-calendar-month-title">Q1 renewals sweep</span>
                    <span class="db-calendar-month-dates">Mar 24 – 26</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div class="db-calendar-week-scroll">
            <div class="db-calendar-week-time-gutter" style="height: ${GRID_HEIGHT}px">${hourLabels()}</div>
            <div class="db-calendar-week-body" role="grid" aria-label="Week"
              style="height: ${GRID_HEIGHT}px; --db-calendar-time-day-count: 7">
              ${slotLines()}
              <div class="db-calendar-time-columns" role="row" style="--db-calendar-time-day-count: 7">
                ${WEEK_DAYS.map((day) => `
                  <div class="db-calendar-week-day-col ${day.today ? "is-today" : ""} ${day.weekend ? "is-weekend" : ""}" data-date-key="${day.key}"
                    role="gridcell" tabindex="${day.today ? "0" : "-1"}" aria-label="${day.key}">
                    ${(WEEK_EVENTS[day.key] || []).map(timedEvent).join("")}
                    ${day.today ? `<div class="db-calendar-timed-current-line" aria-hidden="true"
                      style="top: ${offsetOf(13 * 60 + 45)}px"></div>` : ""}
                  </div>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>`,
  },
  {
    id: "calendar-mini-calendar",
    title: "Mini calendar date picker",
    group: "views",
    width: 340,
    sources: ["src/views/calendar-mini-calendar-renderer.ts", "src/views/calendar-renderer.ts"],
    note: "Days with events carry a short accent underline; the visible week reads as the selected pill run.",
    // Anchored absolutely under the calendar header, so with no header to hang from it leaves
    // the flow and the capture box collapses. Put back in flow to photograph it.
    captureCss: `.note-database-container .db-calendar-mini-popover {
      position: static !important; top: auto !important; right: auto !important; margin-top: 0 !important;
    }`,
    html: () => `
      <div class="note-database-container">
        <div class="db-calendar-mini-popover">
          <div class="db-calendar-mini-head">
            <button type="button" class="db-calendar-mini-nav" aria-label="Previous month">${glyph(ICON.chevronLeft)}</button>
            <button type="button" class="db-calendar-mini-title db-calendar-mini-title-button">March 2026</button>
            <button type="button" class="db-calendar-mini-nav" aria-label="Next month">${glyph(ICON.chevronRight)}</button>
          </div>
          <div class="db-calendar-mini-weekdays" role="row">
            ${WEEKDAYS.map((d) => `<div class="db-calendar-mini-weekday" role="columnheader">${d}</div>`).join("")}
          </div>
          <div class="db-calendar-mini-grid" role="grid" aria-label="March 2026">
            ${MINI_WEEKS.map((week, weekIndex) => `
              <div class="db-calendar-mini-week" role="row">
                ${week.map((n) => miniDay(n, weekIndex)).join("")}
              </div>`).join("")}
          </div>
          <div class="db-calendar-mini-footer">
            <button type="button" class="db-calendar-mini-footer-action">This week</button>
            <button type="button" class="db-calendar-mini-today">Today</button>
          </div>
        </div>
      </div>`,
  },
  {
    id: "calendar-empty-state",
    title: "Calendar empty state — no date property",
    group: "views",
    width: 1100,
    sources: ["src/views/calendar-renderer.ts", "src/views/empty-state-renderer.ts"],
    note: "renderEmpty() returns before .db-calendar is ever created, so the card lands as a "
      + "direct child of .note-database-container — the density rule (styles.css:16849-16864) has "
      + "to key off that same container, not a .db-calendar descendant, or it never applies.",
    html: () => `
      <div class="note-database-container">
        ${calendarEmptyStateMarkup("no-date-field")}
      </div>`,
  },
  {
    id: "calendar-toolbar-options",
    title: "Calendar settings popover",
    group: "views",
    width: 640,
    sources: ["src/views/calendar-toolbar-renderer.ts", "src/views/dropdown-field.ts"],
    note: "The Time section only exists in week and day scale; the setup preview card below Data carries no stylesheet rules.",
    captureCss: `.note-database-container .db-calendar-options-popover { ${STATIC_POPOVER} }`,
    html: () => `
      <div class="note-database-container">
        <div class="db-calendar-options-popover db-chart-options-popover">
          <div class="db-panel-header"><div class="db-panel-title">Calendar options</div></div>
          <div class="db-calendar-options-content">
            ${section("Data", `
              ${dropdownRow(ICON.calendarDays, "Event start date", "Next Renewal")}
              ${dropdownRow(ICON.calendarRange, "Event end date", "Not set")}
              ${dropdownRow(ICON.textCursor, "Event title", "Name")}
              ${dropdownRow(ICON.layoutGrid, "Calendar scale", "Week")}
              ${switchRow(ICON.rows, "Show empty fields", false)}
              <div class="db-calendar-setup-preview">
                <div class="db-calendar-setup-preview-label">Preview</div>
                <div class="db-calendar-preview-card">
                  <div class="db-calendar-preview-title">Name</div>
                  <div class="db-calendar-preview-date">Next Renewal → End date</div>
                  <div class="db-calendar-preview-color" aria-label="Category" title="Category"></div>
                </div>
              </div>`)}
            ${section("Layout", `
              ${dropdownRow(ICON.columns, "Column width", "Adaptive")}
              ${dropdownRow(ICON.calendarDays, "First day of the week", "Sunday")}`)}
            ${section("Time", `
              ${rangeRow("Start hour", 8, 0, 23, 1)}
              ${rangeRow("End hour", 16, 1, 24, 1)}
              ${rangeRow("Hour height", 56, 56, 96, 2)}
              ${dropdownRow(ICON.clock, "Slot duration", "30 minutes")}`)}
            ${section("Appearance", `
              ${dropdownRow(ICON.palette, "Event colour", "Category")}
              ${switchRow(ICON.smilePlus, "Show record icon", true)}`)}
          </div>
        </div>
      </div>`,
  },
  ...TIMELINE_SCALE_SCENARIOS,
  TIMELINE_SUBTASK_SCENARIO,
  {
    id: "timeline-toolbar-options",
    title: "Timeline settings popover",
    group: "views",
    width: 640,
    sources: ["src/views/calendar-timeline-toolbar-renderer.ts", "src/views/dropdown-field.ts"],
    note: "Column width is a switch plus a slider here, not the calendar's mode dropdown; the slider only appears once the switch is on.",
    captureCss: `.note-database-container .db-calendar-timeline-options-popover { ${STATIC_POPOVER} }`,
    html: () => `
      <div class="note-database-container">
        <div class="db-calendar-timeline-options-popover db-chart-options-popover">
          <div class="db-panel-header"><div class="db-panel-title">Timeline options</div></div>
          <div class="db-calendar-timeline-options-content">
            ${section("Data", `
              ${dropdownRow(ICON.calendarDays, "Event start date", "Next Renewal")}
              ${dropdownRow(ICON.calendarRange, "Event end date", "Ends")}
              ${dropdownRow(ICON.textCursor, "Event title", "Name")}
              ${dropdownRow(ICON.layoutGrid, "Timeline scale", "Week")}
              ${dropdownRow(ICON.calendar, "Year display", "Smart")}
              ${switchRow(ICON.rows, "Show empty fields", false)}`)}
            ${section("Layout", `
              ${switchRow(ICON.columns, "Custom column width", true)}
              ${rangeRow("Column width", 72, 24, 240, 1, "db-calendar-timeline-range-row")}
              ${dropdownRow(ICON.clock, "Slot duration", "30 minutes")}`)}
            ${section("Style", `
              ${dropdownRow(ICON.palette, "Event colour", "Category")}
              ${switchRow(ICON.smilePlus, "Show record icon", true)}`)}
          </div>
        </div>
      </div>`,
  },
];
