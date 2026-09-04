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
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  rows: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18"/>',
  textCursor: '<path d="M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1M7 22h1a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4H7"/>',
  smilePlus:
    '<path d="M22 11v1a10 10 0 1 1-9-10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01M16 5h6"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  // The timeline's week-label select (renderGanttWeekHeader's ganttWeekLabel setting).
  hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  // Reserved for calendar controls that use the same directional glyphs.
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

/* A two-week window, 23 March – 5 April 2026, one column per day. The unit widths in
   TIMELINE_FIXTURES are the reference gantt's fixed day widths (44/22/9/5/2), asserted
   against TIMELINE_RANGE_DAY_WIDTH in temporal-tick-parity.test.mjs. */

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

/* Mirrors the model's per-event visibility decision. The Gantt bar helper keeps source dates
   available for clipped SVG geometry while this exported mirror records whether the event
   intersects the mounted window. Every scale is one column per day, so the visible window is
   always day units from the fixture start (the day scale draws the reference gantt's day
   columns, not hour columns). */
export const timelineEventVisibility = (event, fixture) => {
  const scale = timelineEventAbsoluteScale(event, fixture.start);
  const visible = { start: 0, end: fixture.units * MINUTES_PER_DAY };
  const renderStart = Math.max(scale.start, visible.start);
  const renderEnd = Math.min(scale.end, visible.end);
  const isClippedStart = scale.start < visible.start;
  const isClippedEnd = scale.end > visible.end;
  const isOverEvent = renderStart < renderEnd;
  if (!isOverEvent) return { bar: null, isClippedStart, isClippedEnd, isOverEvent };
  return {
    bar: {
      offset: Math.max(0, (renderStart - visible.start) / MINUTES_PER_DAY),
      span: Math.max(1, (renderEnd - renderStart) / MINUTES_PER_DAY),
    },
    isClippedStart,
    isClippedEnd,
    isOverEvent,
  };
};

const escapeMarkup = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const timelineGanttSvg = (tag, attrs = {}, body = "") => {
  const attributes = Object.entries(attrs)
    .map(([name, value]) => " " + name + "=\"" + String(value) + "\"")
    .join("");
  return "<" + tag + attributes + ">" + body + "</" + tag + ">";
};

const timelineGanttBarX = (event, fixture) => {
  const start = new Date(fixture.start + "T00:00:00Z");
  const eventStart = new Date(event.start + "T00:00:00Z");
  return timelineDaysBetween(start, eventStart) * fixture.width;
};

const timelineGanttBarEndX = (event, fixture) => {
  const start = new Date(fixture.start + "T00:00:00Z");
  const eventEnd = new Date(event.end + "T00:00:00Z");
  return (timelineDaysBetween(start, eventEnd) + 1) * fixture.width;
};

// laneEvents is a 3rd positional slot some callers rely on to reach rowIndex as the 4th; the
// milestone-arrow markup this fixture renders derives its link target from the lane data at
// fixture build time, not here.
// eslint-disable-next-line no-unused-vars
export const timelineEvent = (event, fixture, laneEvents = [event], rowIndex = 0) => {
  const totalWidth = fixture.units * fixture.width;
  const x = Math.max(0, Math.min(totalWidth, timelineGanttBarX(event, fixture)));
  const xEnd = Math.max(0, Math.min(totalWidth, timelineGanttBarEndX(event, fixture)));
  const width = Math.max(8, xEnd - x);
  const rowY = 56 + rowIndex * 44;
  const y = rowY + 8;
  const height = 28;
  const color = "var(--status-color-fg-" + (event.tone || "blue") + ")";
  const meta = timelineEventMeta(event);

  if (event.milestone) {
    const cx = Math.max(0, Math.min(totalWidth, x + Math.min(fixture.width, width) / 2));
    const cy = rowY + 22;
    const size = 12;
    const points = [
      cx + "," + (cy - size),
      cx + size + "," + cy,
      cx + "," + (cy + size),
      cx - size + "," + cy,
    ].join(" ");
    return timelineGanttSvg("polygon", {
      points,
      fill: color,
      opacity: 0.8,
      class: "pm-gantt-milestone",
      cursor: "pointer",
    }, timelineGanttSvg("title", {}, "Milestone: " + escapeMarkup(event.title) + " on " + event.start));
  }

  const children = [];
  const barAttrs = {
    x,
    y,
    width,
    height,
    rx: 7,
    ry: 7,
    fill: color,
    opacity: 0.4,
    class: "pm-gantt-bar",
    cursor: "grab",
  };
  children.push(timelineGanttSvg("rect", barAttrs, timelineGanttSvg("title", {},
    escapeMarkup(event.title) + "\n" + escapeMarkup(meta) + "\nProgress: " + (event.progress || 0) + "%")));
  if (event.progress > 0) {
    children.push(timelineGanttSvg("rect", {
      x,
      y,
      width: (event.progress / 100) * width,
      height,
      rx: 7,
      ry: 7,
      fill: color,
      opacity: 0.9,
      class: "pm-gantt-bar-progress",
    }));
  }
  if (event.recurrence) {
    children.push(timelineGanttSvg("text", {
      x: x + width + 4,
      y: y + height / 2 + 5,
      class: "pm-gantt-bar-icon",
    }, "R"));
  }
  if (width > 55) {
    const maxChars = Math.max(4, Math.floor((width - 16) / 7.5));
    const label = event.title.length > maxChars ? event.title.slice(0, maxChars - 1) + "\u2026" : event.title;
    children.push(timelineGanttSvg("text", {
      x: x + 8,
      y: y + height / 2 + 5,
      class: "pm-gantt-bar-label",
    }, escapeMarkup(label)));
  }
  for (const side of ["left", "right"]) {
    children.push(timelineGanttSvg("rect", {
      x: side === "left" ? x : x + width - 8,
      y,
      width: 8,
      height,
      rx: 3,
      ry: 3,
      class: "pm-gantt-drag-handle",
      cursor: "ew-resize",
    }));
  }
  for (const side of ["left", "right"]) {
    children.push(timelineGanttSvg("circle", {
      cx: side === "left" ? x - 8 : x + width + 8,
      cy: y + height / 2,
      r: 4,
      class: "pm-gantt-link-dot",
      cursor: "crosshair",
    }));
  }
  return timelineGanttSvg("g", { class: "pm-gantt-bar-group" }, children.join(""));
};

const timelineGanttRows = (lanes) => [
  ...lanes.flatMap((lane) => lane.events.map((event) => ({ ...event, laneKey: lane.key }))),
  { title: "Delta", tone: "slate", empty: true, laneKey: "empty" },
];

const timelineGanttLabelRow = (event) => {
  const subtask = event.subtask || {};
  const rowPath = "Subscriptions/" + event.title + ".md";
  const leading = subtask.children
    ? '<div class="tree-item-icon collapse-icon pm-collapse-toggle" aria-label="Collapse">' + glyph(ICON.chevronRight) + "</div>"
    : '<span class="pm-gantt-label-spacer"></span>';
  const progress = event.progress > 0
    ? '<span class="pm-gantt-label-progress">' + Math.round(event.progress) + "%</span>"
    : "";
  const title = escapeMarkup(event.title);
  return '<div class="pm-gantt-label-row" data-task-id="' + rowPath + '" draggable="true" style="height: 44px; padding-left: ' + (subtask.depth ? subtask.depth * 18 + 8 : 8) + 'px">'
    + leading
    + '<span class="pm-gantt-label-dot" style="background: var(--status-color-fg-' + (event.tone || "blue") + ')"></span>'
    + '<span class="pm-gantt-label-title">' + title + "</span>"
    + progress
    + '<div class="clickable-icon extra-setting-button pm-icon-btn pm-icon-btn--hover-only" aria-label="Add subtask">' + glyph(ICON.plus) + "</div>"
    + "</div>";
};

const timelineGanttRowMarkup = (event, fixture, rowIndex) => {
  const rowY = 56 + rowIndex * 44;
  if (event.empty) {
    return timelineGanttSvg("rect", {
      x: 0,
      y: rowY,
      width: fixture.units * fixture.width,
      height: 44,
      fill: "transparent",
      cursor: "cell",
      class: "pm-gantt-empty-row-hit",
    }, timelineGanttSvg("title", {}, "Click to set dates"))
      + timelineGanttSvg("rect", {
        x: 0,
        y: rowY + 8,
        width: Math.max(fixture.width, 8),
        height: 28,
        rx: 7,
        ry: 7,
        class: "pm-gantt-empty-row-preview pm-hidden",
        "pointer-events": "none",
      });
  }
  const hover = timelineGanttSvg("rect", {
    x: 0,
    y: rowY,
    width: fixture.units * fixture.width,
    height: 44,
    class: "pm-gantt-row-hover",
  });
  return hover + timelineEvent(event, fixture, undefined, rowIndex);
};
/* Every event carries its actual start/end date keys once. Each scale converts those dates into
   the clipped SVG coordinates the Gantt renderer uses, keeping a short bar at the edge when an
   event extends beyond the mounted range. The milestone stays on the date shared by every
   scale, while the remaining rows keep their original spans. */
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

export const TIMELINE_FIXTURES = {
  /* These natural windows keep the date arithmetic used by the standalone tick/band mirrors.
     Each screenshot scenario replaces the window, title and unit width with the mounted
     viewport's values before rendering, so the header and body describe one window. The
     widths are the reference gantt's fixed per-scale day widths (TimelineConfig's DAY_WIDTH:
     44/22/9/5/2), which TIMELINE_RANGE_DAY_WIDTH mirrors. */
  day: { scale: "day", label: "Day", units: 12, width: 44, start: "2026-03-25", slot: "30", title: "March 25" },
  week: { scale: "week", label: "Week", units: 14, width: 22, start: "2026-03-23", slot: "30", title: "March 23 — April 5" },
  month: { scale: "month", label: "Month", units: 31, width: 9, start: "2026-03-01", slot: "30", title: "March" },
  quarter: { scale: "quarter", label: "Quarter", units: 91, width: 5, start: "2026-01-01", slot: "30", title: "January — March" },
  year: { scale: "year", label: "Year", units: 365, width: 2, start: "2026-01-01", slot: "30", title: "2026" },
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

/* Every tick carries the same offset the renderer computes from the window start. The SVG header
   uses that offset to span the visible range rather than placing every label at the left edge. */
export const timelineTicksFor = (fixture) => {
  if (fixture.scale === "day") {
    // The reference gantt's day scale is one column per day with an unpadded day-of-month
    // label (GanttHeaderRenderer.renderDayHeader's String(d.day)); the grid marks Mondays.
    return Array.from({ length: fixture.units }, (_, index) => {
      const date = timelineAddUtcDays(new Date(`${fixture.start}T00:00:00Z`), index);
      return {
        label: String(date.getUTCDate()),
        key: date.toISOString().slice(0, 10),
        boundary: date.getUTCDay() === 1,
        offset: index,
      };
    });
  }
  return timelineTicksForDateRange(fixture);
};

/* Mirrors the SVG text node used by the Gantt header. */
export const timelineTickLabel = (tick, scale, isFirstTick = false) => {
  const className = scale === "day"
    ? "pm-gantt-header-day"
    : scale === "week"
      ? "pm-gantt-header-week"
      : scale === "month"
        ? "pm-gantt-header-month"
        : "pm-gantt-header-quarter";
  const attrs = { class: className };
  if (isFirstTick) attrs["data-first-tick"] = "true";
  return timelineGanttSvg("text", attrs, escapeMarkup(tick.label));
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

/* Mirrors resolveTimelineViewportUnitCount() (calendar-timeline-model.ts:233-238) exactly,
   including the parameter the earlier pass of this fixture dropped: day scale floors (a partial
   trailing hour is not a visible whole column), every other scale ceils (a partial trailing day
   still shows a clipped column, same as the real render). Exported so the parity test asserts it
   against the real function for all five scales. */
export const timelineResolveViewportUnitCount = (width, unitWidth, scale) => {
  const raw = width / unitWidth;
  return Math.max(1, scale === "day" ? Math.floor(raw) : Math.ceil(raw));
};

/* The fixture's mounted window: totalUnits day columns centred on the anchor date, for every
   scale including day (the reference gantt draws one column per day at every scale; the local
   viewport-centred hour window is a gated extension, not the photographed default). The anchor
   centring keeps today, the bars and the milestone inside the photographed range.
   todayOffsetUnits mirrors getTimelineTodayPositionStyle()'s own offset formula
   (calendar-timeline-renderer.ts:103-133), not a separate guess, so the today-line this fixture
   draws lands where the real one would. Exported so the parity test asserts start/units for all
   five scales. */
export const timelineViewportWindow = (anchorKey, totalUnits) => {
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
export const timelineMonthBoundaryBands = (startKey, endKey) => {
  const start = new Date(startKey + "T00:00:00Z");
  const end = new Date(endKey + "T00:00:00Z");
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

const timelineGanttDateX = (fixture, dateKey) => {
  const offset = timelineDaysBetween(new Date(fixture.start + "T00:00:00Z"), new Date(dateKey + "T00:00:00Z"));
  return Math.max(0, Math.min(fixture.units * fixture.width, offset * fixture.width));
};

const timelineGanttYearBands = (fixture) => {
  const start = new Date(fixture.start + "T00:00:00Z");
  const end = new Date(fixture.end + "T00:00:00Z");
  const bands = [];
  for (let year = start.getUTCFullYear(); year <= end.getUTCFullYear(); year++) {
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const nextStart = new Date(Date.UTC(year + 1, 0, 1));
    const x1 = Math.max(0, timelineDaysBetween(start, yearStart) * fixture.width);
    const x2 = Math.min(fixture.units * fixture.width, timelineDaysBetween(start, nextStart) * fixture.width);
    if (x2 <= 0 || x1 >= fixture.units * fixture.width) continue;
    bands.push({ x: Math.max(0, x1), width: Math.max(0, x2 - x1), label: String(year), year });
  }
  return bands;
};

const timelineGanttMonthSegments = (fixture) => {
  const start = new Date(fixture.start + "T00:00:00Z");
  const end = new Date(fixture.end + "T00:00:00Z");
  const segments = [];
  let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  while (cursor.getTime() <= end.getTime()) {
    const next = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
    const x1 = Math.max(0, timelineDaysBetween(start, cursor) * fixture.width);
    const x2 = Math.min(fixture.units * fixture.width, timelineDaysBetween(start, next) * fixture.width);
    if (x2 > 0 && x1 < fixture.units * fixture.width) {
      segments.push({ x: Math.max(0, x1), width: Math.max(0, x2 - x1), label: TL_MONTH_ABBR[cursor.getUTCMonth()] });
    }
    cursor = next;
  }
  return segments;
};

const timelineGanttQuarterSegments = (fixture) => {
  const start = new Date(fixture.start + "T00:00:00Z");
  const end = new Date(fixture.end + "T00:00:00Z");
  const segments = [];
  let cursor = new Date(Date.UTC(start.getUTCFullYear(), Math.floor(start.getUTCMonth() / 3) * 3, 1));
  while (cursor.getTime() <= end.getTime()) {
    const next = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 3, 1));
    const x1 = Math.max(0, timelineDaysBetween(start, cursor) * fixture.width);
    const x2 = Math.min(fixture.units * fixture.width, timelineDaysBetween(start, next) * fixture.width);
    if (x2 > 0 && x1 < fixture.units * fixture.width) {
      const quarter = Math.floor(cursor.getUTCMonth() / 3) + 1;
      segments.push({
        x: Math.max(0, x1),
        width: Math.max(0, x2 - x1),
        label: "Q" + quarter + (fixture.scale === "quarter" ? " " + cursor.getUTCFullYear() : ""),
      });
    }
    cursor = next;
  }
  return segments;
};

const timelineGanttWeekNumber = (date) => {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);
  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86400000));
};

const timelineGanttHeaderText = (className, x, y, value) =>
  timelineGanttSvg("text", { x, y, class: className }, escapeMarkup(value));

export const timelineGanttHeader = (fixture) => {
  const totalWidth = fixture.units * fixture.width;
  const children = [
    timelineGanttSvg("rect", { x: 0, y: 0, width: totalWidth, height: 56, class: "pm-gantt-header-bg" }),
  ];
  const isMonthBandScale = fixture.scale === "day" || fixture.scale === "week";
  const bands = isMonthBandScale
    ? timelineAxisBands(fixture).map((band) => {
      // band.offset is the day count from the window's own start to this band's own
      // month-start (renderGanttMonthBands, calendar-timeline-renderer.ts:1192-1210
      // walks the same monthStart forward one band at a time) — reconstructing that date
      // per band, rather than reusing the window's own start month for every band, is
      // what keeps a month-crossing window's later bands labelled correctly.
      const bandDate = timelineAddUtcDays(new Date(fixture.start + "T00:00:00Z"), band.offset);
      return {
        x: band.offset * fixture.width,
        width: band.span * fixture.width,
        label: band.label,
        month: bandDate.getUTCMonth(),
        year: bandDate.getUTCFullYear(),
      };
    })
    : timelineGanttYearBands(fixture);
  bands.forEach((band, index) => {
    children.push(timelineGanttSvg("rect", {
      x: band.x,
      y: 0,
      width: band.width,
      height: 24,
      class: (isMonthBandScale ? band.month % 2 === 0 : index % 2 === 0) ? "pm-gantt-band-even" : "pm-gantt-band-odd",
    }));
    children.push(timelineGanttHeaderText(
      isMonthBandScale ? "pm-gantt-header-month-top" : "pm-gantt-header-year",
      band.x + 6,
      18,
      isMonthBandScale
        ? TL_MONTH_ABBR[band.month] + " " + String(band.year).slice(-2)
        : band.label,
    ));
  });

  if (fixture.scale === "day") {
    timelineTicksFor(fixture).forEach((tick, index) => {
      const key = tick.key;
      if (timelineWeekend(key)) {
        children.push(timelineGanttSvg("rect", {
          x: index * fixture.width,
          y: 24,
          width: fixture.width,
          height: 32,
          class: "pm-gantt-weekend-header",
        }));
      }
      children.push(timelineGanttHeaderText("pm-gantt-header-day", index * fixture.width + fixture.width / 2, 42, tick.label));
    });
  } else if (fixture.scale === "week") {
    const start = new Date(fixture.start + "T00:00:00Z");
    const dow = start.getUTCDay() === 0 ? 7 : start.getUTCDay();
    const firstWeek = dow === 1 ? 0 : 8 - dow;
    if (firstWeek > 0) {
      children.push(timelineGanttHeaderText("pm-gantt-header-week", firstWeek * fixture.width / 2, 44, "W" + timelineGanttWeekNumber(start)));
    }
    for (let i = firstWeek; i < fixture.units; i += 7) {
      const date = new Date(start);
      date.setUTCDate(date.getUTCDate() + i);
      const width = Math.min(7, fixture.units - i) * fixture.width;
      children.push(timelineGanttHeaderText("pm-gantt-header-week", i * fixture.width + width / 2, 44, "W" + timelineGanttWeekNumber(date)));
      children.push(timelineGanttSvg("line", {
        x1: i * fixture.width,
        y1: 24,
        x2: i * fixture.width,
        y2: 56,
        class: "pm-gantt-header-tick",
      }));
    }
  } else if (fixture.scale === "month") {
    for (const segment of timelineGanttMonthSegments(fixture)) {
      children.push(timelineGanttHeaderText("pm-gantt-header-month", segment.x + segment.width / 2, 44, segment.label));
      children.push(timelineGanttSvg("line", { x1: segment.x, y1: 24, x2: segment.x, y2: 56, class: "pm-gantt-header-tick" }));
    }
  } else {
    for (const segment of timelineGanttQuarterSegments(fixture)) {
      children.push(timelineGanttHeaderText("pm-gantt-header-quarter", segment.x + segment.width / 2, 44, segment.label));
      if (fixture.scale === "year") {
        children.push(timelineGanttSvg("line", { x1: segment.x, y1: 24, x2: segment.x, y2: 56, class: "pm-gantt-header-tick" }));
      }
    }
  }
  return timelineGanttSvg("g", { class: "pm-gantt-header" }, children.join(""));
};

export const timelineGanttGrid = (fixture, totalRows) => {
  const totalWidth = fixture.units * fixture.width;
  const totalHeight = 56 + totalRows * 44;
  const children = [];
  for (let index = 0; index < fixture.units; index++) {
    const key = timelineDateKey(fixture.start, index);
    const date = new Date(key + "T00:00:00Z");
    if (fixture.scale === "day" && timelineWeekend(key)) {
      children.push(timelineGanttSvg("rect", {
        x: index * fixture.width,
        y: 56,
        width: fixture.width,
        height: totalHeight - 56,
        class: "pm-gantt-weekend",
      }));
    }
    const boundary = fixture.scale === "day"
      ? date.getUTCDay() === 1
      : fixture.scale === "week"
        ? date.getUTCDay() === 1
        : fixture.scale === "month"
          ? date.getUTCDate() === 1
          : date.getUTCDate() === 1 && date.getUTCMonth() % 3 === 0;
    if (boundary) {
      children.push(timelineGanttSvg("line", {
        x1: index * fixture.width,
        y1: 56,
        x2: index * fixture.width,
        y2: totalHeight,
        class: "pm-gantt-gridline-v",
      }));
    }
  }
  for (let row = 0; row <= totalRows; row++) {
    const y = 56 + row * 44;
    children.push(timelineGanttSvg("line", {
      x1: 0,
      y1: y,
      x2: totalWidth,
      y2: y,
      class: "pm-gantt-gridline-h",
    }));
  }
  return timelineGanttSvg("g", { class: "pm-gantt-grid" }, children.join(""));
};
/* Mirrors buildTimelineAxisBands() (calendar-title-formatter.ts:145-148) for the scales the
   gantt header draws month bands on: calendar-month crossing for every scale, including day —
   the reference gantt's day and week headers share the same month-top band
   (GanttHeaderRenderer.renderMonthBands). */
export const timelineAxisBands = (fixture) =>
  timelineMonthBoundaryBands(fixture.start, timelineDateKey(fixture.start, fixture.units - 1));

/* Desktop/mobile widths the capture harness actually opens the page at (tools/screenshots/
   capture.mjs's own DEVICES table, :88-91) — the closest available proxy for the "container"
   getTimelineViewportUnitCount() measures (calendar-timeline-renderer.ts:2419-2426), since a
   "viewport" capture (capture.mjs:96-98, every scenario in this group) fills #shot to the full
   device width with no side margin, and there is no live container here to measure directly. */
const TL_DEVICE_WIDTH = { desktop: 1440, mobile: 402 };

/* Mirrors GANTT_LABEL_WIDTH / GANTT_LABEL_PHONE_WIDTH (calendar-timeline-renderer.ts:66-71):
   the reference's 280px default leaves only ~110px of chart at the 402px mobile capture
   width, so the label column starts narrower on the phone fixture, same as production. */
const TL_LABEL_WIDTH = 280;
const TL_LABEL_WIDTH_PHONE = 160;

/* The reference gantt's day width is fixed per scale (TimelineConfig DAY_WIDTH), with no
   phone branch — the local path's viewport-aware column widths are gated behind
   timelineLocalExtensions and are not what these fixtures photograph. */
export const timelineResolveUnitWidth = (scale) => TIMELINE_FIXTURES[scale].width;

/* The capture harness opens the outer surface at a fixed device width. Its 24px side padding
   matches the shipped container rhythm, so the fixture uses the same content width when it
   derives the number of visible columns. */
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
  const width = timelineResolveUnitWidth(scale);
  const units = timelineResolveViewportUnitCount(contentWidth, width, scale);
  // The anchor is always the pinned "now" date. The title follows this same centred window,
  // including a range that crosses month or year boundaries.
  const window = timelineViewportWindow("2026-03-25", units);
  const title = timelineTitleParts(scale, window.start, window.end);
  return {
    ...base,
    width,
    start: window.start,
    end: window.end,
    units: window.units,
    todayOffsetUnits: window.todayOffsetUnits,
    title: title.main,
    titleYear: title.year,
    isMobile: device?.id === "mobile",
  };
};

const timelineScaleScenario = (scale, overrides = {}) => {
  const lanes = overrides.lanes || TL_LANES;
  const renderBody = (fixture, _ticks, todayOffset) => {
    const rows = timelineGanttRows(lanes);
    const totalWidth = fixture.units * fixture.width;
    const totalRows = rows.length;
    const svgHeight = 56 + (totalRows + 1) * 44;
    const controls = [
      '<div class="pm-gantt-controls">',
      '<div class="pm-segmented">',
      Object.values(TIMELINE_FIXTURES).map((option) => '<button type="button"'
        + (option.scale === fixture.scale ? ' class="mod-cta"' : "") + '>' + option.label + "</button>").join(""),
      "</div>",
      '<span class="pm-gantt-sep"></span>',
      '<button type="button">Today</button>',
      '<button type="button">Expand all</button>',
      '<button type="button">Collapse all</button>',
      "</div>",
    ].join("");

    const todayX = Math.max(0, Math.min(totalWidth, todayOffset * fixture.width));
    const headerExtras = [];
    if (todayOffset >= 0 && todayOffset <= fixture.units) {
      headerExtras.push(timelineGanttSvg("polygon", {
        points: todayX + ",40 " + (todayX + 6) + ",48 " + todayX + ",56 " + (todayX - 6) + ",48",
        class: "pm-gantt-today-diamond",
      }));
    }
    const milestoneIndex = rows.findIndex((row) => row.milestone);
    const milestone = milestoneIndex >= 0 ? rows[milestoneIndex] : null;
    const milestoneX = milestone ? timelineGanttDateX(fixture, milestone.start) + fixture.width / 2 : 0;
    if (milestone) {
      headerExtras.push(timelineGanttSvg("text", {
        x: milestoneX,
        y: 14,
        "text-anchor": "middle",
        class: "pm-gantt-milestone-label",
        fill: "var(--status-color-fg-" + milestone.tone + ")",
      }, escapeMarkup(milestone.title)));
    }

    const regularRows = rows.filter((row) => !row.empty);
    const arrow = regularRows.length >= 3
      ? timelineGanttSvg("path", {
        d: "M " + timelineGanttBarEndX(regularRows[0], fixture) + " 78 C "
          + ((timelineGanttBarEndX(regularRows[0], fixture) + timelineGanttBarX(regularRows[2], fixture)) / 2)
          + " 78, "
          + ((timelineGanttBarEndX(regularRows[0], fixture) + timelineGanttBarX(regularRows[2], fixture)) / 2)
          + " 166, " + timelineGanttBarX(regularRows[2], fixture) + " 166",
        class: "pm-gantt-arrow",
        "marker-end": "url(#pm-arrowhead)",
      })
      : "";
    const milestoneLine = milestone
      ? timelineGanttSvg("line", {
        x1: milestoneX,
        y1: 56,
        x2: milestoneX,
        y2: 56 + totalRows * 44,
        stroke: "var(--status-color-fg-" + milestone.tone + ")",
        "stroke-width": 1,
        "stroke-dasharray": "4 4",
        opacity: 0.4,
      })
      : "";

    return [
      '<div class="note-database-container">',
      '<div class="pm-gantt-view">',
      controls,
      '<div class="pm-gantt-wrapper">',
      '<div class="pm-gantt-left" style="width: ' + (fixture.isMobile ? TL_LABEL_WIDTH_PHONE : TL_LABEL_WIDTH)
        + 'px; min-width: ' + (fixture.isMobile ? TL_LABEL_WIDTH_PHONE : TL_LABEL_WIDTH) + 'px">',
      '<div class="pm-gantt-left-header" style="height: 56px"><span class="pm-gantt-left-header-label">Task</span></div>',
      '<div class="pm-gantt-left-body">',
      rows.map((row) => timelineGanttLabelRow(row)).join(""),
      '<div class="pm-gantt-label-row pm-gantt-add-row" style="height: 44px"><button type="button" class="pm-prop-add"><span class="pm-glyph-icon">'
        + glyph(ICON.plus) + '</span><span class="pm-prop-add-label">Add task</span></button></div>',
      '<div class="pm-no-shrink"></div>',
      "</div>",
      "</div>",
      '<div class="pm-gantt-resize-handle"></div>',
      '<div class="pm-gantt-right">',
      '<div class="pm-gantt-header-sticky" style="width: ' + totalWidth + 'px; height: 56px"><svg width="'
        + totalWidth + '" height="56" class="pm-gantt-header-svg">'
        + timelineGanttHeader(fixture) + headerExtras.join("") + "</svg></div>",
      '<div class="pm-gantt-svg-container" style="width: ' + totalWidth + 'px; margin-top: -56px">',
      '<svg width="' + totalWidth + '" height="' + svgHeight + '" class="pm-gantt-svg">',
      '<defs><marker id="pm-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">'
        + '<path d="M0,0 L0,6 L8,3 z" class="pm-gantt-arrowhead"></path></marker></defs>',
      timelineGanttGrid(fixture, totalRows),
      timelineGanttSvg("line", {
        x1: todayX,
        y1: 48,
        x2: todayX,
        y2: svgHeight,
        class: "pm-gantt-today-line",
      }),
      '<g class="pm-gantt-bars">',
      rows.map((row, index) => timelineGanttRowMarkup(row, fixture, index)).join(""),
      "</g>",
      '<g class="pm-gantt-arrows">' + arrow + "</g>",
      '<g class="pm-gantt-milestone-labels">' + milestoneLine + "</g>",
      "</svg>",
      "</div>",
      "</div>",
      "</div>",
      "</div>",
    ].join("");
  };
  const label = TIMELINE_FIXTURES[scale].label;
  return {
    id: overrides.id || (scale === "week" ? "timeline-view" : `timeline-view-${scale}`),
    title: overrides.title || `Timeline view — ${label}`,
    group: "views",
    width: 1100,
    sources: overrides.sources || ["src/views/calendar-timeline-renderer.ts"],
    // Every scale has a constructed counterpart now: the week-scale fixture maps to the plain
    // constructed timeline capture, the other four scales to their own constructed captures.
    fixtureOf: overrides.fixtureOf || (scale === "week" ? "constructed-timeline" : `constructed-timeline-${scale}`),
    note: overrides.note || (`${label} scale with boundary ticks, weekend fills, progress, milestone and dependency-line affordances. `
      + `The window is fixture geometry centred on the pinned date, sized per device width after the container's own left/right padding so today, the bars and the milestone stay in frame — the production default's range is task-driven (buildTimelineRangeGeometry), and the viewport-centred window this fixture used to mirror is a local-extension behaviour gated behind timelineLocalExtensions.`),
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
  fixtureOf: "constructed-timeline-subtask",
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
    fixtureOf: "constructed-calendar-month",
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
    fixtureOf: "constructed-calendar-week",
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
    fixtureOf: "constructed-calendar-mini",
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
    fixtureOf: "constructed-calendar-empty",
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
    fixtureOf: "constructed-calendar-toolbar-options",
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
    fixtureOf: "constructed-timeline-toolbar-options",
    note: "The layout section gates the local-extension column widths: the custom column width switch and its slider only appear once the local-extensions toggle is on (the default render is the reference gantt and ignores them). The week-label select stays visible regardless of scale, matching the reference's always-visible plugin setting. The day-scale slot-duration select is gated behind local extensions AND day scale together, so this fixture — depicted at Week scale — omits it even with extensions on.",
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
              ${switchRow(ICON.code, "Local extensions", true)}
              ${switchRow(ICON.columns, "Custom column width", true)}
              ${rangeRow("Column width", 72, 24, 240, 1, "db-calendar-timeline-range-row")}
              ${dropdownRow(ICON.hash, "Week label", "Week number")}`)}
            ${section("Style", `
              ${dropdownRow(ICON.palette, "Event colour", "Category")}
              ${switchRow(ICON.smilePlus, "Show record icon", true)}`)}
          </div>
        </div>
      </div>`,
  },
];
