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

const monthDayCell = (day, column) => `
  <div class="db-calendar-day ${day.outside ? "is-outside-month" : ""} ${day.today ? "is-today" : ""}"
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
const monthSegment = (seg) => {
  const edges = `${seg.start ? "is-start" : "is-continuation"} ${seg.end ? "is-end" : "continues-after"}`;
  const geometry =
    `--db-calendar-segment-start: ${seg.column}; --db-calendar-segment-span: ${seg.span};` +
    ` --db-calendar-segment-lane: ${seg.lane + 2}; ${eventColor(seg.tone)}`;
  return `
    <button type="button" class="db-calendar-month-segment ${seg.timed ? "is-timed" : "is-all-day"} ${edges}"
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
      { column: 5, span: 3, lane: 0, title: "Q1 renewals sweep", tone: "orange", dates: "Mar 26 – Apr 1", start: true, end: false },
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
      { column: 1, span: 4, lane: 0, title: "Q1 renewals sweep", tone: "orange", dates: "Mar 26 – Apr 1", start: false, end: true },
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
}));

/** A timed card. Under 42px the renderer drops the time range and keeps the title. */
const timedEvent = (event) => {
  const top = offsetOf(event.from);
  const height = Math.max(14, ((event.to - event.from) / 60) * HOUR_HEIGHT);
  const compact = height < 42;
  const columns = event.columns || 1;
  const left = ((event.column || 0) / columns) * 100;
  const width = 100 / columns;
  const range = `${String(Math.floor(event.from / 60)).padStart(2, "0")}:${String(event.from % 60).padStart(2, "0")}`
    + ` - ${String(Math.floor(event.to / 60)).padStart(2, "0")}:${String(event.to % 60).padStart(2, "0")}`;
  return `
    <button type="button" class="db-calendar-week-timed-event ${compact ? "is-compact" : ""}"
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
    { title: "Spotify billing", from: 780, to: 840, tone: "green" },
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

/* A two-week window, 23 March – 5 April 2026, one column per day. The renderer measures the
   unit width from the viewport; 72px is what a full-width desktop pane resolves to. */
const TL_UNITS = 14;
const TL_UNIT_WIDTH = 72;
const TL_TICKS = [
  ["Mon", 23, "2026-03-23"], ["Tue", 24, "2026-03-24"], ["Wed", 25, "2026-03-25"],
  ["Thu", 26, "2026-03-26"], ["Fri", 27, "2026-03-27"], ["Sat", 28, "2026-03-28"],
  ["Sun", 29, "2026-03-29"], ["Mon", 30, "2026-03-30"], ["Tue", 31, "2026-03-31"],
  ["Wed", 1, "2026-04-01"], ["Thu", 2, "2026-04-02"], ["Fri", 3, "2026-04-03"],
  ["Sat", 4, "2026-04-04"], ["Sun", 5, "2026-04-05"],
];

const timelineEvent = (event) => {
  const geometry =
    `--db-timeline-row: ${event.row};` +
    ` --db-timeline-exact-offset: calc(var(--db-timeline-unit-width) * ${event.offset});` +
    ` --db-timeline-exact-width: calc(var(--db-timeline-unit-width) * ${event.span});` +
    ` ${eventColor(event.tone)}`;
  return `
    <button type="button" class="db-timeline-event" title="${event.title} · ${event.meta}"
      data-note-database-row-path="Subscriptions/${event.title}.md" style="${geometry}">
      <span class="db-timeline-event-content">
        <span class="db-timeline-event-title">${event.title}</span>
        <span class="db-timeline-event-meta">${event.meta}</span>
      </span>
    </button>`;
};

const timelineLane = (lane) => `
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
      ${lane.events.map(timelineEvent).join("")}
    </div>
    <div class="db-timeline-create-row">
      <button type="button" class="db-timeline-create-button"
        style="--db-timeline-create-offset: 1; --db-timeline-create-span: ${TL_UNITS}; --db-timeline-create-left: 0px; --db-timeline-create-width: calc(var(--db-timeline-unit-width) * ${TL_UNITS})">
        <span class="db-timeline-create-content">
          <span class="db-timeline-create-icon">${glyph(ICON.plus)}</span>
          <span class="db-timeline-create-label">New</span>
        </span>
      </button>
    </div>
  </div>`;

const TL_LANES = [
  {
    key: "business",
    label: "Business",
    tone: "blue",
    rows: 2,
    events: [
      { title: "Figma", offset: 1, span: 4, row: 1, tone: "blue", meta: "Mar 24 – 27" },
      { title: "Adobe CC", offset: 9, span: 3, row: 1, tone: "blue", meta: "Apr 1 – 3" },
      { title: "Notion", offset: 3, span: 6, row: 2, tone: "blue", meta: "Mar 26 – 31" },
    ],
  },
  {
    key: "personal",
    label: "Personal",
    tone: "green",
    rows: 2,
    events: [
      { title: "Spotify", offset: 0, span: 3, row: 1, tone: "green", meta: "Mar 23 – 25" },
      { title: "iCloud", offset: 1, span: 10, row: 2, tone: "green", meta: "Mar 24 – Apr 2" },
    ],
  },
];

const timelineNav = (icon, label) =>
  icon
    ? `<button type="button" class="db-timeline-nav-button is-icon" aria-label="${label}">
        <span class="db-timeline-nav-icon">${glyph(icon)}</span></button>`
    : `<button type="button" class="db-timeline-nav-button is-text" aria-label="${label}">${label}</button>`;

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
    note: "Multi-day all-day bars, timed events, an overflow week and one event carried across the week boundary.",
    html: () => `
      <div class="note-database-container">
        <div class="db-calendar db-calendar-month">
          ${calendarHeader("March", "2026", "Month", "Previous month", "Next month")}
          <div class="db-calendar-weekdays" role="row">
            ${WEEKDAYS.map((d) => `<div class="db-calendar-weekday" role="columnheader"><span>${d}</span>
              <div class="db-calendar-col-resize-handle"></div></div>`).join("")}
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
    note: "Sticky day header and all-day strip over the 08–16 time grid; the current-time ruler sits on Wednesday at 13:45.",
    html: () => `
      <div class="note-database-container">
        <div class="db-calendar db-calendar-week">
          ${calendarHeader("Mar 22 – 28", "2026", "Week", "Previous week", "Next week")}
          <div class="db-calendar-week-sticky">
            <div class="db-calendar-time-header-row" role="row">
              <div class="db-calendar-time-header-gutter"></div>
              <div class="db-calendar-time-header-days" style="--db-calendar-time-day-count: 7">
                ${WEEK_DAYS.map((day) => `
                  <button type="button" class="db-calendar-time-header-day ${day.today ? "is-today" : ""}"
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
                  <div class="db-calendar-week-allday-col ${day.today ? "is-today" : ""} ${i === 6 ? "is-last-col" : ""}"
                    data-date-key="${day.key}" style="grid-column: ${i + 1}"></div>`).join("")}
                ${WEEK_DAYS.map((day, i) => `
                  <button type="button" class="db-calendar-week-allday-date ${day.today ? "is-today" : ""}"
                    title="${day.key}" aria-label="${day.key}" style="grid-column: ${i + 1}">${day.n}</button>`).join("")}
                <button type="button" class="db-calendar-month-segment db-calendar-week-allday-segment is-all-day is-start is-end"
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
                  <div class="db-calendar-week-day-col ${day.today ? "is-today" : ""}" data-date-key="${day.key}"
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
  {
    id: "timeline-view",
    title: "Timeline view",
    group: "views",
    width: 1100,
    sources: ["src/views/calendar-timeline-renderer.ts"],
    note: "Two weeks at one column per day; the April band marks the month boundary and the today line sits at 25 March 13:45.",
    html: () => `
      <div class="note-database-container db-view-timeline">
        <div class="db-timeline is-scale-week is-slot-30"
          style="--db-timeline-units: ${TL_UNITS}; --db-timeline-unit-width: ${TL_UNIT_WIDTH}px; --db-timeline-group-width: 160px">
          <div class="db-timeline-header">
            <div class="db-timeline-title" title="Mar 23 – Apr 5, 2026" aria-label="Mar 23 – Apr 5, 2026">
              <span class="db-timeline-title-main">Mar 23 – Apr 5</span>
              <span class="db-timeline-title-year">2026</span>
            </div>
            <div class="db-timeline-controls">
              <div class="db-timeline-scale-control" role="group">
                <div class="db-timeline-scale-segment">
                  ${["Day", "Week", "Month", "Quarter", "Year"].map((s) => `
                    <button type="button" class="db-timeline-scale-button ${s === "Week" ? "is-active" : ""}"
                      aria-pressed="${s === "Week" ? "true" : "false"}">${s}</button>`).join("")}
                </div>
                <button type="button" class="db-timeline-scale-menu db-timeline-nav-button is-text" aria-haspopup="listbox">
                  <span class="db-timeline-scale-menu-label">Week</span>
                  <span class="db-timeline-nav-icon db-timeline-scale-menu-chevron">${glyph(ICON.chevronDown)}</span>
                </button>
              </div>
              ${timelineNav(ICON.chevronsLeft, "Previous month")}
              ${timelineNav(ICON.chevronLeft, "Previous week")}
              ${timelineNav(null, "Today")}
              ${timelineNav(ICON.chevronRight, "Next week")}
              ${timelineNav(ICON.chevronsRight, "Next month")}
              ${timelineNav(ICON.calendarDays, "Pick a date")}
            </div>
          </div>
          <div class="db-timeline-scroll">
            <div class="db-timeline-axis">
              <div class="db-timeline-ticks-band">
                <div class="db-timeline-band-item"
                  style="--db-timeline-band-start: 10; --db-timeline-band-span: 5">April</div>
              </div>
              <div class="db-timeline-ticks">
                ${TL_TICKS.map(([weekday, date, key], i) => `
                  <div class="db-timeline-tick ${key === "2026-03-25" ? "is-current-date-tick" : ""}"
                    title="${key}" data-date-key="${key}" style="--db-timeline-tick-offset: ${i + 1}">
                    <span class="db-timeline-tick-label">
                      <span class="db-timeline-tick-weekday">${weekday}</span>
                      <span class="db-timeline-tick-date">${date}</span>
                    </span>
                  </div>`).join("")}
              </div>
            </div>
            <div class="db-timeline-body"
              style="--db-timeline-today-offset-units: 2.57; --db-timeline-today-offset-px: ${(2.57 * TL_UNIT_WIDTH).toFixed(2)}px">
              ${TL_LANES.map(timelineLane).join("")}
              <div class="db-timeline-today-line" title="2026-03-25"></div>
            </div>
          </div>
        </div>
      </div>`,
  },
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
              ${dropdownRow(ICON.calendarDays, "Year display", "Smart")}
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
