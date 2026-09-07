// ───────────────────────────────────────────────────────────────────
// MODULE:    fields
// COMPONENT: screenshot scenarios for in-cell field editors, pickers, and value renderers
// ───────────────────────────────────────────────────────────────────

/**
 * Field and cell surfaces: the editors, pickers and value renderers that live inside a
 * single cell rather than around the grid.
 *
 * Every class here was read off the renderer that emits it. Where a renderer writes into a
 * `<td>` the fixture puts it in a real `obnotion-table` row, because the shipped rules for those
 * values are scoped through `.obnotion-container` and, for numbers and badges, read
 * custom properties that only the container (or a picker root listed alongside it) declares.
 *
 * Two roots are deliberately NOT wrapped in `.obnotion-container`: the icon picker and
 * the option colour picker. Both are created on `document.body` at runtime, and the
 * stylesheet names them alongside the container when it declares the design tokens, so the
 * faithful fixture is a top-level element rather than a nested one.
 */

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ROWS, ICONS, dots, glyph, optionPill, optionTone, pill } from "./shared.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. ICONS
// ───────────────────────────────────────────────────────────────────

/* Icons the plugin injects through Obsidian's `setIcon`, which is not available here.
   Only the path data is invented; every class around them comes from a renderer. */
const I = {
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrowUp: '<path d="m5 12 7-7 7 7M12 19V5"/>',
  arrowDown: '<path d="M19 12l-7 7-7-7M12 5v14"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  calendarDays: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"/>',
  calendarClock: '<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6M16 2v4M8 2v4M3 10h18"/><circle cx="18" cy="18" r="4"/><path d="M18 16.5V18l1 1"/>',
  alertTriangle: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/>',
  shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  settings: '<path d="M20 7h-9M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  bold: '<path d="M6 12h8a4 4 0 0 0 0-8H6v8ZM6 12h9a4 4 0 0 1 0 8H6v-8Z"/>',
  italic: '<path d="M19 4h-9M14 20H5M15 4 9 20"/>',
  strike: '<path d="M16 4H9a3 3 0 0 0-2.83 4M14 12a4 4 0 0 1 0 8H6M4 12h16"/>',
  highlighter: '<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  sigma: '<path d="M18 7V4H6l6 8-6 8h12v-3"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  fileSymlink: '<path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="m10 18 3-3-3-3M4 15h9"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
  folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  bookmark: '<path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"/><circle cx="12" cy="13" r="3"/>',
  zap: '<path d="M4 14h7l-2 8 11-12h-7l2-8Z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2c0 .5.2 1 .6 1.4l8.8 8.8a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8Z"/><path d="M7 7h.01"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1Z"/><path d="M4 22v-7"/>',
  home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  trophy: '<path d="M6 4h12v5a6 6 0 0 1-12 0Z"/><path d="M6 6H3v2a3 3 0 0 0 3 3M18 6h3v2a3 3 0 0 1-3 3M9 20h6M12 15v5"/>',
  plane: '<path d="M17.8 19.2 16 11l4.5-4.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a1 1 0 0 0-.9 1.7l4.6 3.3-2.3 2.3H3.5l-1 1 3.5 1.5L7.5 20l1-1v-2.7l2.3-2.3 3.3 4.6a1 1 0 0 0 1.7-.9Z"/>',
  lightbulb: '<path d="M9 18h6M10 22h4"/><path d="M15.1 14a5 5 0 1 0-6.2 0c.6.5 1.1 1.3 1.1 2h4c0-.7.5-1.5 1.1-2Z"/>',
  badge: '<path d="m12 2 2.4 2.1 3.1-.4 1 3 2.8 1.4-1 3 1 3-2.8 1.4-1 3-3.1-.4L12 22l-2.4-2.1-3.1.4-1-3L2.7 16l1-3-1-3 2.8-1.4 1-3 3.1.4Z"/><path d="m9 12 2 2 4-4"/>',
};

// ───────────────────────────────────────────────────────────────────
// 3. CONSTANTS
// ───────────────────────────────────────────────────────────────────

/** The persisted colour vocabulary, in the order `STATUS_COLORS` declares it. */
const COLORS = [
  "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink",
  "red", "slate", "cyan", "teal", "lime", "indigo", "violet", "rose",
];

/* `.obnotion-cell-edit-popover`, `.obnotion-cell-option-popover` and the date popover are all placed
   absolutely against the cell they belong to. Nothing anchors them in a capture, so they
   leave the flow and the shot collapses to the table alone. The margin only separates two
   distinct surfaces sharing one frame; nothing inside either popover is restyled. */
const STATIC_POPOVERS = `.obnotion-container .obnotion-cell-edit-popover,
.obnotion-container .obnotion-cell-option-popover {
  position: static !important; top: auto !important; left: auto !important;
  margin-top: 12px !important;
}`;

const STATIC_DATE_POPOVER = `.obnotion-container .obnotion-cell-edit-popover {
  position: static !important; top: auto !important; left: auto !important;
  margin-top: 12px !important;
}`;

// ───────────────────────────────────────────────────────────────────
// 4. HELPERS
// ───────────────────────────────────────────────────────────────────

/** A `<th>` built the way ColumnHeaderController builds one. */
const th = (label, icon) => `
  <th data-obnotion-column-key="${label.toLowerCase()}"><div class="obnotion-th-content">
    <span class="obnotion-property-icon">${ICONS[icon] || ""}</span>
    <span class="obnotion-th-label">${label}</span>
    <button type="button" class="obnotion-column-menu-trigger" aria-label="Open ${label} menu">${dots}</button>
  </div></th>`;

/** One rating slot: a faint base glyph with an accent overlay clipped to `fill`. */
const ratingStar = (fill, symbol = I.star) => `
  <span class="obnotion-rating-star">
    <span class="obnotion-rating-star-bg">${glyph(symbol)}</span>
    <span class="obnotion-rating-star-fg" style="width:${fill}%">${glyph(symbol)}</span>
  </span>`;

const ratingEmojiStar = (fill, emoji) => `
  <span class="obnotion-rating-star">
    <span class="obnotion-rating-star-bg"><span class="obnotion-rating-emoji">${emoji}</span></span>
    <span class="obnotion-rating-star-fg" style="width:${fill}%"><span class="obnotion-rating-emoji">${emoji}</span></span>
  </span>`;

const rating = (slots, extra = "", symbol) => `
  <span class="obnotion-cell-rating obnotion-numeric-value${extra}">${slots.map((s) => ratingStar(s, symbol)).join("")}</span>`;

const progress = (percent, text, color) => `
  <div class="obnotion-cell-progress obnotion-numeric-value${color ? ` obnotion-num-color-${color}` : ""}">
    <div class="obnotion-cell-progress-track"><div class="obnotion-cell-progress-fill" style="width:${percent}%"></div></div>
    <span class="obnotion-cell-progress-text">${text}</span>
  </div>`;

/* r=9 → circumference 2πr = 56.549; the dash offset hides the unfilled remainder. */
const RING_CIRCUMFERENCE = 56.549;
const ring = (percent, text, color) => `
  <span class="obnotion-cell-progress-ring obnotion-numeric-value${color ? ` obnotion-num-color-${color}` : ""}">
    <svg viewBox="0 0 24 24" width="20" height="20">
      <circle class="obnotion-progress-ring-track" cx="12" cy="12" r="9" fill="none" stroke-width="4"></circle>
      <circle class="obnotion-progress-ring-arc" cx="12" cy="12" r="9" fill="none" stroke-width="4" stroke-linecap="round"
        stroke-dasharray="${RING_CIRCUMFERENCE}" stroke-dashoffset="${(RING_CIRCUMFERENCE * (1 - percent / 100)).toFixed(3)}"
        transform="rotate(-90 12 12)"></circle>
    </svg>
    <span class="obnotion-progress-ring-text">${text}</span>
  </span>`;

/** A relation chip. Resolved targets get `file-text`; unresolved ones get `alert-triangle`. */
const relationLink = (label, resolved) => `
  <a href="#" class="obnotion-relation-link internal-link${resolved ? "" : " is-unresolved"}"
     title="${resolved ? label : "Note not found in vault"}">
    <span class="obnotion-relation-link-icon">${glyph(resolved ? '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>' : I.alertTriangle)}</span>
    <span class="obnotion-relation-link-label">${label}</span>
  </a>`;

/* One option row in the select editor, in the order CellRenderer builds it.
   The renderer builds the row as a <button> and puts the reorder and delete controls
   inside it as <button>s too. The DOM API allows that nesting; the HTML parser does not —
   a nested <button> start tag closes the outer one, which would split the row into two
   siblings. The inner controls are therefore spans here. Every rule that paints them
   (`.obnotion-option-delete`, `.obnotion-mobile-reorder-controls`) selects on class alone, so the
   capture is unchanged; only the tag names differ from the live DOM.

   The row shell is `menu-row.ts`'s: `obnotion-menu-item` alongside the editor's own class, the
   checkable role and state on the row rather than on the check glyph, and the label carrying
   the builder's class as well as the editor's. That class list is not cosmetic here — the
   icon-slot spacer keyed to `.obnotion-menu-item` with no icon child paints in this row, so a
   fixture that omits the class photographs a row the plugin no longer builds. */
const optionRow = (value, color, checked, transient) => `
  <button type="button" class="obnotion-menu-item obnotion-cell-option-item${checked ? " is-selected" : ""}"
    role="menuitemcheckbox" aria-checked="${checked ? "true" : "false"}">
    <span class="obnotion-option-drag-handle${transient ? " is-hidden" : ""}">⠿</span>
    <span class="obnotion-mobile-reorder-controls${transient ? " is-hidden" : ""}">
      <span aria-label="Move up">${glyph(I.arrowUp)}</span>
      <span aria-label="Move down">${glyph(I.arrowDown)}</span>
    </span>
    <span class="obnotion-option-color-dot obnotion-option-color-${color}"></span>
    <span class="obnotion-menu-item-label obnotion-option-label">${value}</span>
    <span class="obnotion-option-check">${checked ? glyph(I.check) : ""}</span>
    <span class="obnotion-option-delete" role="button" aria-label="${transient ? "Add option" : "Delete"}"
      >${glyph(transient ? I.plus : I.trash)}</span>
  </button>`;

/* August 2026, weeks starting Monday: Aug 1 falls on a Saturday, so the grid opens on
   Jul 27 and closes on Sep 6. `21` is the selected value, `28` stands in for today. */
const AUGUST_2026 = [
  [[27, 1], [28, 1], [29, 1], [30, 1], [31, 1], [1, 0], [2, 0]],
  [[3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0]],
  [[10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0]],
  [[17, 0], [18, 0], [19, 0], [20, 0], [21, 0], [22, 0], [23, 0]],
  [[24, 0], [25, 0], [26, 0], [27, 0], [28, 0], [29, 0], [30, 0]],
  [[31, 0], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1]],
];

function miniCalendarDays() {
  return AUGUST_2026.map((week) => `
    <div class="obnotion-calendar-mini-week" role="row">${week.map(([day, outside]) => {
      const selected = !outside && day === 21;
      const today = !outside && day === 28;
      const cls = ["obnotion-calendar-mini-day", outside ? "is-outside" : "", today ? "is-today" : "", selected ? "is-selected" : ""]
        .filter(Boolean).join(" ");
      return `
      <button type="button" role="gridcell" class="${cls}" aria-selected="${selected}"${today ? ' aria-current="date"' : ""}>
        <span class="obnotion-calendar-mini-day-num">${day}</span>
        <span class="obnotion-calendar-mini-day-dot"></span>
      </button>`;
    }).join("")}</div>`).join("");
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ───────────────────────────────────────────────────────────────────
// 5. SCENARIOS
// ───────────────────────────────────────────────────────────────────

export const FIELDS_SCENARIOS = [
  {
    id: "field-cell-edit-text",
    title: "Text cell in edit state",
    group: "fields",
    width: 560,
    fixtureOf: "constructed-cell-editor-text",
    sources: ["src/views/cell-renderer.ts", "src/views/record-surface/cell-editor-text.ts", "src/views/record-surface/cell-editor-number.ts"],
    note: "Both editors keep the cell's rendered value visible underneath. The multi-line editor marks its cell with obnotion-cell-editing (the accent inset); the single-line one marks its cell with obnotion-cell-popover-editing, which the stylesheet declares no rule for, so that cell shows no edit affordance. Markdown columns gain the format toolbar.",
    captureCss: STATIC_POPOVERS,
    html: () => `
      <div class="obnotion-container">
        <table class="obnotion-table">
          <thead><tr>${th("Name", "file-text")}${th("Notes", "file-text")}${th("Cost", "hash")}</tr></thead>
          <tbody><tr>
            <td class="obnotion-cell obnotion-title-cell obnotion-editable-cell"><a class="internal-link" href="#"><span class="obnotion-file-title-inline"><span class="obnotion-file-title-name">Figma</span></span></a></td>
            <td class="obnotion-cell obnotion-editable-cell obnotion-cell-editing">Team seat, annual plan.</td>
            <td class="obnotion-cell obnotion-editable-cell obnotion-numeric-value obnotion-cell-popover-editing">18.75</td>
          </tr></tbody>
        </table>

        <div class="obnotion-cell-edit-popover" data-obnotion-editor-kind="text">
          <div class="obnotion-md-toolbar">
            ${[I.bold, I.italic, I.strike, I.highlighter, I.code, I.sigma, I.link, I.fileSymlink]
              .map((d) => `<button type="button" class="obnotion-md-toolbar-btn"><svg class="svg-icon" viewBox="0 0 24 24" width="16" height="16"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg></button>`).join("")}
          </div>
          <textarea class="obnotion-cell-textarea" rows="2">Team seat, **annual** plan. Renews with the [[Design tooling]] budget.</textarea>
        </div>

        <div class="obnotion-cell-edit-popover obnotion-cell-line-edit-popover" data-obnotion-editor-kind="number">
          <input type="number" step="any" class="obnotion-cell-line-input" value="18.75">
        </div>
      </div>`,
  },
  {
    id: "field-cell-edit-select",
    title: "Select cell in edit state",
    group: "fields",
    width: 460,
    fixtureOf: "constructed-cell-editor-select",
    sources: ["src/views/cell-renderer.ts", "src/views/record-surface/cell-editor-option.ts", "src/data/column-types.ts"],
    note: "Each row carries a drag handle, a colour dot that opens the colour picker, the check mark and a delete button. An unregistered value offers a plus instead of a trash icon.",
    captureCss: STATIC_POPOVERS,
    html: () => `
      <div class="obnotion-container">
        <table class="obnotion-table">
          <thead><tr>${th("Name", "file-text")}${th("Category", "circle-dot")}</tr></thead>
          <tbody><tr>
            <td class="obnotion-cell obnotion-title-cell obnotion-editable-cell"><a class="internal-link" href="#"><span class="obnotion-file-title-inline"><span class="obnotion-file-title-name">Adobe CC</span></span></a></td>
            <td class="obnotion-cell obnotion-editable-cell obnotion-cell-editing">${optionPill("Business")}</td>
          </tr></tbody>
        </table>

        <div class="obnotion-cell-option-popover">
          ${optionRow("Business", "blue", true, false)}
          ${optionRow("Personal", "green", false, false)}
          ${optionRow("Shared", "orange", false, false)}
          ${optionRow("Archive", "gray", false, true)}
          <div class="obnotion-cell-option-add"><input type="text" placeholder="Add option"></div>
          <div class="obnotion-panel-header-actions"><button type="button" class="obnotion-panel-button">Clear</button></div>
        </div>
      </div>`,
  },
  {
    id: "field-date-value-picker",
    title: "Date value picker",
    group: "fields",
    width: 320,
    fixtureOf: "constructed-date-picker",
    sources: ["src/views/date-value-picker.ts", "src/views/calendar-mini-calendar-renderer.ts"],
    note: "The trigger shows the committed value; the popover stacks quick dates, the three segment inputs and the mini calendar, which renders flat inside the date popover rather than as its own floating surface.",
    captureCss: STATIC_DATE_POPOVER,
    html: () => `
      <div class="obnotion-container">
        <button type="button" class="obnotion-date-value-field" aria-haspopup="dialog" aria-expanded="true" aria-label="Value">
          <span class="obnotion-date-value-field-icon">${glyph(I.calendarDays)}</span>
          <span class="obnotion-date-value-field-text">2026-08-21</span>
        </button>

        <div class="obnotion-cell-edit-popover obnotion-date-edit-popover obnotion-date-value-popover" role="dialog" aria-label="Value">
          <div class="obnotion-date-presets" role="group" aria-label="Quick dates">
            <button type="button" class="obnotion-date-preset"><span class="obnotion-date-preset-label">Today</span><span class="obnotion-date-preset-subline">August 21</span></button>
            <button type="button" class="obnotion-date-preset"><span class="obnotion-date-preset-label">Tomorrow</span><span class="obnotion-date-preset-subline">August 22</span></button>
            <button type="button" class="obnotion-date-preset"><span class="obnotion-date-preset-label">Next week</span><span class="obnotion-date-preset-subline">August 28</span></button>
            <button type="button" class="obnotion-date-preset"><span class="obnotion-date-preset-label">Clear</span></button>
          </div>
          <div class="obnotion-date-segments">
            <input class="obnotion-date-seg" maxlength="4" inputmode="numeric" placeholder="YYYY" aria-label="YYYY" value="2026">
            <span class="obnotion-date-sep">-</span>
            <input class="obnotion-date-seg" maxlength="2" inputmode="numeric" placeholder="MM" aria-label="MM" value="08">
            <span class="obnotion-date-sep">-</span>
            <input class="obnotion-date-seg" maxlength="2" inputmode="numeric" placeholder="DD" aria-label="DD" value="21">
          </div>
          <div class="obnotion-calendar-mini-popover obnotion-cell-date-picker">
            <div class="obnotion-calendar-mini-head">
              <button type="button" class="obnotion-calendar-mini-nav" aria-label="Previous month">${glyph(I.chevronLeft)}</button>
              <button type="button" class="obnotion-calendar-mini-title obnotion-calendar-mini-title-button">August 2026</button>
              <button type="button" class="obnotion-calendar-mini-nav" aria-label="Next month">${glyph(I.chevronRight)}</button>
            </div>
            <div class="obnotion-calendar-mini-weekdays" role="row">
              ${WEEKDAYS.map((d) => `<div class="obnotion-calendar-mini-weekday" role="columnheader">${d}</div>`).join("")}
            </div>
            <div class="obnotion-calendar-mini-grid" role="grid" aria-label="August 2026">${miniCalendarDays()}</div>
            <div class="obnotion-calendar-mini-footer">
              <button type="button" class="obnotion-calendar-mini-today">Today</button>
            </div>
          </div>
        </div>
      </div>`,
  },
  {
    id: "field-date-value-picker-datetime",
    title: "Date value picker with time",
    group: "fields",
    width: 320,
    fixtureOf: "constructed-date-picker-datetime",
    sources: ["src/views/date-value-picker.ts", "src/views/calendar-mini-calendar-renderer.ts"],
    note: "A datetime column adds hour and minute segments after the date, and the trigger swaps calendar-days for calendar-clock.",
    captureCss: STATIC_DATE_POPOVER,
    html: () => `
      <div class="obnotion-container">
        <button type="button" class="obnotion-date-value-field" aria-haspopup="dialog" aria-expanded="true" aria-label="Value">
          <span class="obnotion-date-value-field-icon">${glyph(I.calendarClock)}</span>
          <span class="obnotion-date-value-field-text">2026-08-21 09:30</span>
        </button>

        <div class="obnotion-cell-edit-popover obnotion-date-edit-popover obnotion-date-value-popover is-datetime" role="dialog" aria-label="Value">
          <div class="obnotion-date-presets" role="group" aria-label="Quick dates">
            <button type="button" class="obnotion-date-preset"><span class="obnotion-date-preset-label">Today</span><span class="obnotion-date-preset-subline">August 21</span></button>
            <button type="button" class="obnotion-date-preset"><span class="obnotion-date-preset-label">Tomorrow</span><span class="obnotion-date-preset-subline">August 22</span></button>
            <button type="button" class="obnotion-date-preset"><span class="obnotion-date-preset-label">Next week</span><span class="obnotion-date-preset-subline">August 28</span></button>
            <button type="button" class="obnotion-date-preset"><span class="obnotion-date-preset-label">Clear</span></button>
          </div>
          <div class="obnotion-date-segments">
            <input class="obnotion-date-seg" maxlength="4" inputmode="numeric" placeholder="YYYY" aria-label="YYYY" value="2026">
            <span class="obnotion-date-sep">-</span>
            <input class="obnotion-date-seg" maxlength="2" inputmode="numeric" placeholder="MM" aria-label="MM" value="08">
            <span class="obnotion-date-sep">-</span>
            <input class="obnotion-date-seg" maxlength="2" inputmode="numeric" placeholder="DD" aria-label="DD" value="21">
            <span class="obnotion-date-sep obnotion-time-sep"> </span>
            <input class="obnotion-date-seg obnotion-time-seg obnotion-hour-seg" maxlength="2" inputmode="numeric" placeholder="HH" aria-label="HH" value="09">
            <span class="obnotion-date-sep obnotion-time-colon">:</span>
            <input class="obnotion-date-seg obnotion-time-seg obnotion-minute-seg" maxlength="2" inputmode="numeric" placeholder="mm" aria-label="Minute" value="30">
          </div>
          <div class="obnotion-calendar-mini-popover obnotion-cell-date-picker">
            <div class="obnotion-calendar-mini-head">
              <button type="button" class="obnotion-calendar-mini-nav" aria-label="Previous month">${glyph(I.chevronLeft)}</button>
              <button type="button" class="obnotion-calendar-mini-title obnotion-calendar-mini-title-button">August 2026</button>
              <button type="button" class="obnotion-calendar-mini-nav" aria-label="Next month">${glyph(I.chevronRight)}</button>
            </div>
            <div class="obnotion-calendar-mini-weekdays" role="row">
              ${WEEKDAYS.map((d) => `<div class="obnotion-calendar-mini-weekday" role="columnheader">${d}</div>`).join("")}
            </div>
            <div class="obnotion-calendar-mini-grid" role="grid" aria-label="August 2026">${miniCalendarDays()}</div>
            <div class="obnotion-calendar-mini-footer">
              <button type="button" class="obnotion-calendar-mini-today">Today</button>
            </div>
          </div>
        </div>
      </div>`,
  },
  {
    id: "field-icon-picker",
    title: "Icon picker popover",
    group: "fields",
    width: 350,
    fixtureOf: "constructed-icon-picker",
    sources: ["src/views/icon-picker-popover.ts", "src/views/record-icon-renderer.ts"],
    note: "The Icons tab adds the colour strip; the picker is created on document.body, so it is a top-level element here rather than a child of the container.",
    // Fixed to the viewport and anchored to the icon it was opened from. Nothing anchors
    // it here, so it leaves the flow and the capture box collapses.
    captureCss: `.obnotion-icon-picker-popover { position: static !important; top: auto !important; left: auto !important; }`,
    html: () => {
      const item = (d, color, selected) => `
        <button type="button" class="obnotion-icon-picker-item${selected ? " is-selected" : ""} obnotion-record-icon-color-${color}"
          data-icon-value="lucide:x@${color}" aria-pressed="${Boolean(selected)}" tabindex="-1">${glyph(d)}</button>`;
      const grid = (icons, color, selectedIndex) =>
        icons.map((d, i) => item(d, color, i === selectedIndex)).join("");
      const navButton = (d, active) => `
        <button type="button" role="tab" class="${active ? "is-active" : ""}" aria-selected="${Boolean(active)}">${glyph(d)}</button>`;
      const common = [I.home, I.folder, I.mail, I.bell, I.heart, I.bookmark, I.camera, I.zap, I.globe,
        I.tag, I.flag, I.check, I.trophy, I.plane, I.lightbulb, I.badge, I.clock, I.search,
        I.leaf, I.layers, I.smile, I.star, I.plus, I.code, I.link, I.calendarDays, I.settings];
      return `
      <div class="obnotion-icon-picker-popover" role="dialog" aria-label="Configure record icon property…">
        <div class="obnotion-icon-picker-header">
          <div class="obnotion-icon-picker-tabs" role="tablist">
            <button type="button" role="tab" aria-selected="false">Emoji</button>
            <button type="button" role="tab" class="is-active" aria-selected="true">Icons</button>
          </div>
          <input type="search" class="obnotion-icon-picker-search" placeholder="Search icons and emoji" aria-label="Search icons and emoji">
          <button type="button" class="obnotion-icon-picker-remove">Remove</button>
          <button type="button" class="obnotion-icon-picker-random" aria-label="Random">${glyph(I.shuffle)}</button>
          <button type="button" class="obnotion-icon-picker-settings" aria-label="Configure record icon property…">${glyph(I.settings)}</button>
        </div>
        <div class="obnotion-icon-picker-colors">
          ${COLORS.map((c) => `<button type="button" class="obnotion-icon-color obnotion-icon-color-${c}${c === "blue" ? " is-active" : ""}" aria-label="${c}"></button>`).join("")}
        </div>
        <div class="obnotion-icon-picker-scroll">
          <div class="obnotion-icon-picker-section">
            <div class="obnotion-icon-picker-label">Recent</div>
            <div class="obnotion-icon-picker-grid">${grid([I.star, I.heart, I.zap, I.tag, I.bell, I.folder], "blue", -1)}</div>
          </div>
          <div class="obnotion-icon-picker-section">
            <div class="obnotion-icon-picker-label">Common</div>
            <div class="obnotion-icon-picker-grid">${grid(common, "blue", 4)}</div>
          </div>
        </div>
        <div class="obnotion-icon-picker-nav" role="tablist" aria-label="Configure record icon property…">
          ${navButton(I.clock, false)}
          ${navButton(I.star, true)}
          ${navButton(I.layers, false)}
          ${navButton(I.folder, false)}
          ${navButton(I.mail, false)}
          ${navButton(I.smile, false)}
          ${navButton(I.leaf, false)}
          ${navButton(I.ellipsis, false)}
        </div>
      </div>`;
    },
  },
  {
    id: "field-option-color-picker",
    title: "Option colour picker",
    group: "fields",
    width: 224,
    fixtureOf: "constructed-option-color-picker",
    sources: ["src/views/option-color-picker.ts", "src/views/popover-host.ts", "styles.css"],
    note: "A one-column labelled list (ADR-004) — sixteen rows in the persisted order, each a leading dot and its visible name, the current colour carrying the trailing tick every row in the family uses. Opened from the colour dot in the select editor and created on document.body. On a phone this is the family's own sheet, not the anchored popover: a header names the picker, and the same sixteen rows grow to the 44px floor.",
    captureCss: `.obnotion-color-picker-popup { position: static !important; top: auto !important; left: auto !important; }`,
    html: (device) => {
      const isPhoneSheet = device?.id === "mobile";
      const row = (c) => `
        <button type="button" role="option" class="obnotion-dropdown-option obnotion-menu-item${c === "blue" ? " is-selected" : ""}" aria-selected="${c === "blue"}">
          <span class="obnotion-color-picker-row-dot obnotion-option-color-${c}" aria-hidden="true"></span>
          <span class="obnotion-dropdown-option-label obnotion-menu-item-label">${c.charAt(0).toUpperCase()}${c.slice(1)}</span>
          <span class="obnotion-dropdown-option-check obnotion-menu-item-check">${c === "blue" ? glyph(I.check) : ""}</span>
        </button>`;
      const rows = COLORS.map(row).join("");
      if (!isPhoneSheet) {
        return `
      <div class="obnotion-color-picker-popup" role="listbox" aria-label="Custom">
        ${rows}
      </div>`;
      }
      // The phone sheet `mountPickerSheetHeader` builds: a title-and-close header ahead of the
      // rows, inside the family's own `.obnotion-mobile-bottom-sheet` chrome — the shape the previously
      // registered pair never photographed (`field-option-color-picker-mobile-light.png` was
      // shape-identical to its desktop twin before this fixture branched on device).
      return `
      <div class="obnotion-color-picker-popup obnotion-mobile-bottom-sheet" role="listbox" aria-label="Custom">
        <div class="obnotion-panel-header">
          <span class="obnotion-panel-title">Color</span>
          <button type="button" class="obnotion-sheet-close" aria-label="Close">${glyph('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')}</button>
        </div>
        <div class="obnotion-color-picker-body obnotion-panel-row">
          ${rows}
        </div>
      </div>`;
    },
  },
  {
    id: "field-relation-values",
    title: "Relation values, resolved and broken",
    group: "fields",
    width: 640,
    fixtureOf: "constructed-relation-values",
    sources: ["src/views/relation-value-renderer.ts"],
    note: "A resolved target renders file-text on a tinted chip; a target the metadata cache cannot find renders alert-triangle inside a dashed warning outline.",
    html: () => `
      <div class="obnotion-container">
        <table class="obnotion-table">
          <thead><tr>${th("Name", "file-text")}${th("Related", "file-text")}</tr></thead>
          <tbody>
            <tr>
              <td class="obnotion-cell obnotion-title-cell"><a class="internal-link" href="#"><span class="obnotion-file-title-inline"><span class="obnotion-file-title-name">Figma</span></span></a></td>
              <td class="obnotion-cell"><div class="obnotion-relation-values">
                ${relationLink("Design tooling", true)}${relationLink("Q3 budget", true)}
              </div></td>
            </tr>
            <tr>
              <td class="obnotion-cell obnotion-title-cell"><a class="internal-link" href="#"><span class="obnotion-file-title-inline"><span class="obnotion-file-title-name">Notion</span></span></a></td>
              <td class="obnotion-cell"><div class="obnotion-relation-values">
                ${relationLink("Knowledge base", true)}${relationLink("Archived vendors", false)}
              </div></td>
            </tr>
            <tr>
              <td class="obnotion-cell obnotion-title-cell"><a class="internal-link" href="#"><span class="obnotion-file-title-inline"><span class="obnotion-file-title-name">Adobe CC</span></span></a></td>
              <td class="obnotion-cell"><div class="obnotion-relation-values is-compact">
                ${relationLink("Brand assets", true)}${relationLink("Legacy licence", false)}
              </div></td>
            </tr>
          </tbody>
        </table>
      </div>`,
  },
  {
    id: "field-file-fields",
    title: "File fields",
    group: "fields",
    width: 640,
    fixtureOf: "constructed-file-fields",
    sources: ["src/views/file-field-renderer.ts"],
    note: "file.tags render as status badges, link-list fields as compact chips, and file.file as a link back to the row's own note. The per-tag remove buttons are in the DOM of a writable cell but sit at opacity 0 until the badge is hovered, so they do not appear here.",
    html: () => `
      <div class="obnotion-container">
        <table class="obnotion-table">
          <thead><tr>${th("File", "file-text")}${th("Tags", "circle-dot")}${th("Outlinks", "file-text")}</tr></thead>
          <tbody>
            <tr>
              <td class="obnotion-cell"><a class="internal-link obnotion-file-self-link" href="#" title="Subscriptions/Figma.md">Figma</a></td>
              <td class="obnotion-cell obnotion-editable-cell"><div class="obnotion-file-tags obnotion-multi-select-values">
                <span class="status-badge obnotion-file-tag-badge status-color-blue">design<button type="button" class="obnotion-file-tag-remove" aria-label="Remove design">×</button></span>
                <span class="status-badge obnotion-file-tag-badge">saas<button type="button" class="obnotion-file-tag-remove" aria-label="Remove saas">×</button></span>
              </div></td>
              <td class="obnotion-cell"><div class="obnotion-file-link-list">
                <a class="internal-link obnotion-file-link-list-item" href="#" title="Design tooling">Design tooling</a>
                <a class="internal-link obnotion-file-link-list-item" href="#" title="Q3 budget">Q3 budget</a>
              </div></td>
            </tr>
            <tr>
              <td class="obnotion-cell"><a class="internal-link obnotion-file-self-link" href="#" title="Subscriptions/Spotify.md">Spotify</a></td>
              <td class="obnotion-cell obnotion-editable-cell"><div class="obnotion-file-tags obnotion-multi-select-values">
                <span class="status-badge obnotion-file-tag-badge status-color-green">personal<button type="button" class="obnotion-file-tag-remove" aria-label="Remove personal">×</button></span>
              </div></td>
              <td class="obnotion-cell"><div class="obnotion-file-link-list">
                <a class="internal-link obnotion-file-link-list-item" href="#" title="Household costs">Household costs</a>
              </div></td>
            </tr>
          </tbody>
        </table>
      </div>`,
  },
  {
    id: "field-number-displays",
    title: "Number display styles",
    group: "fields",
    width: 560,
    fixtureOf: "constructed-number-displays",
    sources: ["src/views/number-display-renderer.ts", "src/data/number-display.ts"],
    note: "Rating, progress bar and progress ring all tint through obnotion-num-color-*, which sets --obnotion-number-color. Half slots are the accent overlay clipped to 50%.",
    html: () => `
      <div class="obnotion-container">
        <table class="obnotion-table">
          <thead><tr>${th("Style", "circle-dot")}${th("Value", "hash")}</tr></thead>
          <tbody>
            <tr><td class="obnotion-cell">Plain</td><td class="obnotion-cell obnotion-numeric-value">62.5</td></tr>
            <tr><td class="obnotion-cell">Rating, solid</td><td class="obnotion-cell obnotion-numeric-value">${rating([100, 100, 100, 50, 0])}</td></tr>
            <tr><td class="obnotion-cell">Rating, outline</td><td class="obnotion-cell obnotion-numeric-value">${rating([100, 100, 0, 0, 0], " is-outline")}</td></tr>
            <tr><td class="obnotion-cell">Rating, emoji</td><td class="obnotion-cell obnotion-numeric-value">
              <span class="obnotion-cell-rating obnotion-numeric-value is-emoji">${[100, 100, 100, 100, 0].map((f) => ratingEmojiStar(f, "⭐")).join("")}</span>
            </td></tr>
            <tr><td class="obnotion-cell">Progress</td><td class="obnotion-cell obnotion-numeric-value">${progress(72, "72")}</td></tr>
            <tr><td class="obnotion-cell">Progress, tinted</td><td class="obnotion-cell obnotion-numeric-value">${progress(34, "34", "orange")}</td></tr>
            <tr><td class="obnotion-cell">Ring</td><td class="obnotion-cell obnotion-numeric-value">${ring(72, "72")}</td></tr>
            <tr><td class="obnotion-cell">Ring, tinted</td><td class="obnotion-cell obnotion-numeric-value">${ring(96, "96", "green")}</td></tr>
          </tbody>
        </table>
      </div>`,
  },
  {
    id: "field-record-icon",
    title: "Record icon",
    group: "fields",
    width: 560,
    fixtureOf: "constructed-record-icon",
    sources: ["src/views/record-icon-renderer.ts", "src/views/table-renderer.ts", "src/data/record-icon.ts"],
    note: "The table puts record icons in a 28px gutter column of their own, whose header is blank so the first property header can borrow the width. An unparsed token falls back to file-text and is-default; a lucide token carries obnotion-record-icon-color-*; an emoji token renders through obnotion-record-icon-emoji.",
    html: () => {
      const icon = (body, extra = "") => `
        <td class="obnotion-record-icon-col">
          <span class="obnotion-record-icon is-compact is-editable${extra}" role="button" tabindex="-1">${body}</span>
        </td>`;
      const row = (r, cell) => `
        <tr>
          ${cell}
          <td class="obnotion-cell obnotion-title-cell obnotion-editable-cell"><a class="internal-link" href="#"><span class="obnotion-file-title-inline"><span class="obnotion-file-title-name">${r.name}</span></span></a></td>
          <td class="obnotion-cell obnotion-editable-cell obnotion-numeric-value">${r.cost}</td>
          <td class="obnotion-cell obnotion-editable-cell">${optionPill(r.category)}</td>
        </tr>`;
      const fileText = glyph('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>');
      return `
      <div class="obnotion-container">
        <table class="obnotion-table">
          <colgroup>
            <col class="obnotion-record-icon-colgroup" width="28" style="width:28px">
            <col><col><col>
          </colgroup>
          <thead><tr>
            <th class="obnotion-record-icon-col" role="columnheader" aria-label="Icons" title="Icons"></th>
            ${th("Name", "file-text")}${th("Cost", "hash")}${th("Category", "circle-dot")}
          </tr></thead>
          <tbody>
            ${row(ROWS[0], icon(fileText, " is-default"))}
            ${row(ROWS[1], icon(glyph(I.layers), " obnotion-record-icon-color-blue"))}
            ${row(ROWS[2], icon(glyph(I.zap), " obnotion-record-icon-color-green"))}
            ${row(ROWS[3], icon('<span class="obnotion-record-icon-emoji">☁️</span>'))}
            ${row(ROWS[4], icon(glyph(I.camera), " obnotion-record-icon-color-rose"))}
          </tbody>
        </table>
      </div>`;
    },
  },
  {
    id: "field-status-colors",
    title: "Status colour range",
    group: "fields",
    width: 820,
    fixtureOf: "constructed-status-colors",
    sources: ["src/data/status-colors.ts", "src/views/cell-renderer.ts"],
    // Every badge fill in this vocabulary is `color-mix(<hue> 24%, transparent)`, so what a chip
    // looks like is decided by what is behind it. Element captures use a transparent ground on
    // purpose — a component that can sit on any background — but a translucent component cannot,
    // and this one is captured to be looked at. Composited against nothing, the dark theme's pale
    // foregrounds land on whatever the reader's image viewer paints, and on a white viewer the
    // whole strip reads as illegible when in the product it is not. The surface the product always
    // has behind these chips is `--background-primary`; supplying it here is what makes the
    // capture answerable rather than a picture of the viewer.
    captureCss: `.obnotion-container { background: var(--background-primary); padding: 8px; }`,
    note: "The strip is the whole colour vocabulary — every select, status, multi-select and tag value in the plugin is a status-badge in one of these sixteen status-color-* variants. The table below it is a normally configured schema, one tone per option value, which is what the renderer builds. The multi-select remove buttons only become visible on hover.",
    html: () => `
      <div class="obnotion-container">
        <div class="obnotion-multi-select-values">
          ${COLORS.map((c) => pill(c, c)).join("")}
        </div>
        <table class="obnotion-table">
          <thead><tr>${th("Name", "file-text")}${th("Billing", "circle-dot")}${th("Payment", "circle-dot")}${th("Category", "circle-dot")}</tr></thead>
          <tbody>
            ${ROWS.map((r) => `
            <tr>
              <td class="obnotion-cell obnotion-title-cell"><a class="internal-link" href="#"><span class="obnotion-file-title-inline"><span class="obnotion-file-title-name">${r.name}</span></span></a></td>
              <td class="obnotion-cell">${optionPill(r.cycle)}</td>
              <td class="obnotion-cell">${optionPill(r.payment)}</td>
              <td class="obnotion-cell"><div class="obnotion-multi-select-values">
                <span class="status-badge obnotion-multi-select-badge status-color-${optionTone(r.category)}">
                  <span class="obnotion-multi-select-label">${r.category}</span>
                  <button type="button" class="obnotion-multi-select-remove" aria-label="Remove ${r.category}">×</button>
                </span>
              </div></td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>`,
  },
];
