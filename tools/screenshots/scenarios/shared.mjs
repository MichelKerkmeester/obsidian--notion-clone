// ───────────────────────────────────────────────────────────────────
// MODULE:    shared
// COMPONENT: hand-built fixture rows, columns, icons, and markup helpers shared by all scenario modules
// ───────────────────────────────────────────────────────────────────

/**
 * Shared fixture helpers.
 *
 * Each scenario renders the same class structure the renderers emit, against mock rows, so
 * the shipped stylesheet is what gets photographed. The markup is written by hand rather
 * than driven through the real renderers because those need a live Obsidian App, a vault
 * and a metadata cache; a hand-built fixture keeps the capture runnable anywhere and keeps
 * the captures deterministic. The cost is that markup drift has to be caught by the
 * structure check in verify.mjs rather than by the renderers themselves.
 *
 * `sources` lists the files a scenario depicts. The staleness checker uses it to decide
 * which screenshots a change invalidates, so keep it accurate.
 */

// ───────────────────────────────────────────────────────────────────
// 1. FIXTURE ROWS
// ───────────────────────────────────────────────────────────────────

/* Enough rows, across enough groups and dates, that a board shows several populated columns,
   a gallery fills more than one row, and a calendar month has events in most weeks. A
   five-row fixture photographs as an empty-looking product however good the layout is. One
   name is deliberately long so truncation stays visible in every view. */
export const ROWS = [
  { name: "Figma",            cost: "€ 18,75",  cycle: "Yearly",  payment: "Revolut", renew: "January 4, 2027",   category: "Design" },
  { name: "Adobe Creative Cloud", cost: "€ 62,50", cycle: "Yearly", payment: "Revolut", renew: "August 21, 2026",  category: "Design" },
  { name: "Sketch",           cost: "€ 9,00",   cycle: "Monthly", payment: "ING",     renew: "March 12, 2026",    category: "Design" },
  { name: "Framer",           cost: "€ 20,00",  cycle: "Monthly", payment: "Revolut", renew: "March 28, 2026",    category: "Design" },
  { name: "Notion",           cost: "€ 96,25",  cycle: "Yearly",  payment: "Revolut", renew: "February 14, 2027", category: "Business" },
  { name: "Linear",           cost: "€ 14,00",  cycle: "Monthly", payment: "Revolut", renew: "March 5, 2026",     category: "Business" },
  { name: "Slack",            cost: "€ 7,25",   cycle: "Monthly", payment: "ING",     renew: "March 18, 2026",    category: "Business" },
  { name: "Google Workspace", cost: "€ 11,50",  cycle: "Monthly", payment: "ING",     renew: "March 22, 2026",    category: "Business" },
  { name: "Zoom",             cost: "€ 13,99",  cycle: "Monthly", payment: "Apple",   renew: "April 2, 2026",     category: "Business" },
  { name: "1Password Families", cost: "€ 4,99", cycle: "Monthly", payment: "Apple",   renew: "March 9, 2026",     category: "Business" },
  { name: "Raycast Pro",      cost: "€ 8,00",   cycle: "Monthly", payment: "Revolut", renew: "March 20, 2026",    category: "Business" },
  { name: "Vercel",           cost: "€ 20,00",  cycle: "Monthly", payment: "Revolut", renew: "March 1, 2026",     category: "Infrastructure" },
  { name: "AWS",              cost: "€ 148,30", cycle: "Monthly", payment: "Revolut", renew: "March 3, 2026",     category: "Infrastructure" },
  { name: "Cloudflare",       cost: "€ 5,00",   cycle: "Monthly", payment: "Revolut", renew: "March 14, 2026",    category: "Infrastructure" },
  { name: "GitHub Team",      cost: "€ 3,67",   cycle: "Monthly", payment: "Revolut", renew: "March 26, 2026",    category: "Infrastructure" },
  { name: "Supabase",         cost: "€ 23,00",  cycle: "Monthly", payment: "ING",     renew: "April 8, 2026",     category: "Infrastructure" },
  { name: "Backblaze",        cost: "€ 8,25",   cycle: "Monthly", payment: "Revolut", renew: "April 11, 2026",    category: "Infrastructure" },
  { name: "A deliberately long service name, wraps on a card and truncates in a cell", cost: "€ 1,00", cycle: "Yearly", payment: "ING", renew: "December 31, 2026", category: "Infrastructure" },
  { name: "Spotify",          cost: "€ 11,26",  cycle: "Monthly", payment: "ING",     renew: "March 2, 2026",     category: "Personal" },
  { name: "iCloud+",          cost: "€ 2,99",   cycle: "Monthly", payment: "Apple",   renew: "March 9, 2026",     category: "Personal" },
  { name: "Netflix",          cost: "€ 13,99",  cycle: "Monthly", payment: "ING",     renew: "March 16, 2026",    category: "Personal" },
  { name: "Strava",           cost: "€ 59,99",  cycle: "Yearly",  payment: "Apple",   renew: "June 4, 2026",      category: "Personal" },
  { name: "Duolingo",         cost: "€ 6,99",   cycle: "Monthly", payment: "Apple",   renew: "March 24, 2026",    category: "Personal" },
  { name: "NS Flex",          cost: "€ 5,60",   cycle: "Monthly", payment: "ING",     renew: "March 30, 2026",    category: "Personal" },
];

// ───────────────────────────────────────────────────────────────────
// 2. COLUMNS & ICONS
// ───────────────────────────────────────────────────────────────────

export const COLUMNS = [
  { label: "Name",         icon: "file-text" },
  { label: "Cost",         icon: "hash" },
  { label: "Billing",      icon: "circle-dot" },
  { label: "Payment",      icon: "circle-dot" },
  { label: "Next Renewal", icon: "calendar" },
  { label: "Category",     icon: "circle-dot" },
];

/** A vertical-ellipsis glyph standing in for the Lucide icon the plugin injects at runtime. */
export const dots = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>`;
export const glyph = (d) => `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
export const ICONS = {
  "file-text": glyph('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'),
  hash: glyph('<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>'),
  "circle-dot": glyph('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>'),
  calendar: glyph('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
  // The row-control glyphs. Identical path data to the copies table-mobile and list-mobile
  // declare inline, so a fixture built from either source draws the same button.
  move: glyph('<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>'),
  maximize: glyph('<path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="M9 21H3v-6"/><path d="m3 21 7-7"/>'),
  // Lucide's `check`, which `openDropdownPopover` puts in the check span of the matching option.
  // Without it a fixture can carry `is-selected` and still photograph an unmarked row.
  check: glyph('<path d="M20 6 9 17l-5-5"/>'),
  // Lucide's `image`, which is what `setIcon(placeholder, "image")` injects into an empty cover.
  // The 14px attributes are defaults; `.db-*-cover-placeholder svg` sizes it to 28px.
  image: glyph('<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/>'
    + '<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>'),
};

/**
 * A card cover with no image behind it.
 *
 * Both card views build this and only when an image field is configured: `renderCover` creates the
 * wrapper, and with nothing to resolve it adds `is-empty` and puts Lucide's `image` glyph in a
 * placeholder span. The wrapper is what carries the aspect ratio, so a card that has one is roughly
 * three times the height of a card that does not — which is why a fixture cannot leave it out and
 * still be a picture of the surface.
 *
 * The gallery fixture had the placeholder class from the OTHER view, with no wrapper and no glyph,
 * so `.db-gallery-cover`, `.db-gallery-cover-placeholder`, `.db-board-card-cover` and
 * `.db-board-card-cover-placeholder` were four families the whole corpus never photographed, and
 * the one class it did name matched no rule.
 */
export const emptyCover = (base) => `
  <div class="${base} is-empty">
    <span class="${base}-placeholder">${ICONS.image}</span>
  </div>`;

/** The two bases, spelt out because they do not follow one pattern: the board's carries `card`. */
export const COVER_BASES = { board: "db-board-card-cover", gallery: "db-gallery-cover" };

// ───────────────────────────────────────────────────────────────────
// 3. RENDER HELPERS
// ───────────────────────────────────────────────────────────────────

/* Selects and statuses render through `status-badge` plus a `status-color-*` modifier.
   Those are the real class names, so the fixture uses them rather than a badge class of
   its own that no shipped rule would ever match. */
export const pill = (text, tone) => `<span class="status-badge status-color-${tone}">${text}</span>`;

/**
 * One tone per option VALUE, the way a configured database assigns them.
 *
 * The renderer writes `status-color-${option.color}` from each option's own colour and falls back to
 * grey only where none is set, so distinct values normally look distinct. These fixtures used to
 * hand a whole column one tone — every payment grey, both billing values orange — and map three of
 * the four categories onto a single green. That photographs a table where Yearly and Monthly are
 * indistinguishable and three categories are the same chip, which is a picture of a "states with no
 * visible difference" defect the product does not have.
 *
 * A value with no entry falls back to grey, which is exactly what the renderer does for an option
 * whose colour was never chosen.
 */
export const OPTION_TONES = {
  Yearly: "purple", Monthly: "cyan",
  Revolut: "indigo", ING: "orange", Apple: "slate",
  Design: "pink", Business: "blue", Infrastructure: "teal", Personal: "green",
};

export const optionTone = (value) => OPTION_TONES[value] || "gray";
export const optionPill = (value) => pill(value, optionTone(value));

/**
 * The group title, as `renderGroupLabel` builds it.
 *
 * All four grouped views route their header title through that one function, and it does NOT write
 * the label as text: for a status, select or multi-select group field it nests a `.status-badge`
 * inside the title span, coloured from the matching option and grey when no option matches. Only a
 * non-option field and the empty "uncategorized" group get bare text.
 *
 * These helpers used to write bare text for every title, which meant the list, gallery and board
 * group headers were photographed in a state the renderer only reaches when grouping by a date or a
 * number — while the titles they were given ("Design", "Business", "Monthly") are all option values.
 * A badge is taller and wider than the text it replaces, so that also mis-stated the header height
 * every control in the row is aligned against.
 *
 * Passing no tone is still a legitimate picture: it is the non-option branch.
 */
const groupTitle = (cls, title, tone) =>
  `<span class="${cls}">${tone ? pill(title, tone) : title}</span>`;

/**
 * The grouped table's divider title. Exported rather than kept beside the `<tr>` that uses it so the
 * parity check can build one: a title helper the check cannot call is a title helper nothing
 * watches, which is how the board lane went un-noticed.
 *
 * An explicit empty tone renders bare text — the non-option branch — and overrides the default.
 */
export const tableGroupTitle = (title, tone = OPTION_TONES[title]) =>
  groupTitle("db-group-title-text", title, tone);


/**
 * The checkbox markup the renderer actually produces.
 *
 * Every one of these families was absent from every fixture, so nothing photographed or measured
 * the board, gallery and table selection controls — the exact families originally reported as
 * rendering wrong. A fixture that omits a control cannot show it is broken.
 *
 * The class list mirrors what createCheckbox emits for the row role; the family class is what each
 * call site passes. Kept in one place so a change to the factory has one fixture to update.
 */
export const rowCheckbox = (family) =>
  `<input type="checkbox" class="db-checkbox db-checkbox-row${family ? ` ${family}` : ""}" aria-label="Select">`;

/** The field role, for a boolean value rather than a row selection. */
export const fieldCheckbox = (family) =>
  `<input type="checkbox" class="db-checkbox db-checkbox-field${family ? ` ${family}` : ""}" aria-label="Toggle">`;

/**
 * The switch is a checkbox too, and it does not come from the factory.
 *
 * Eight call sites build it with a raw `createEl`, so it carries `db-toggle-switch` alone and
 * shares none of the checkbox component's contract. It is included here because it is an
 * `input[type="checkbox"]` in the shipped DOM: any census that walks checkboxes finds it, and a
 * fixture that leaves it out makes that census silently partial.
 */
export const toggleSwitch = ({ checked = false, disabled = false } = {}) =>
  `<input type="checkbox" role="switch" class="db-toggle-switch"${checked ? " checked" : ""}${disabled ? " disabled" : ""} aria-label="Toggle">`;

/** The collapse chevron every group header opens with. */
export const collapseToggle = (cls) =>
  `<button type="button" class="${cls}"><span class="db-collapse-triangle"></span></button>`;

/**
 * The header cells for the standard column set.
 *
 * `selectColumn` exists because a caller that draws its own gutters was still getting this one's.
 * `table-mobile` wrote a select `th` and a record-icon `th` of its own and then called this, which
 * emitted a SECOND select header — nine header cells against eight body cells, so every column was
 * labelled with its neighbour's name and the phone shot had no visible labels at all. Passing the
 * flag is how a caller says it has already drawn the gutter.
 */
export function tableHeader({ selectColumn = true } = {}) {
  return (selectColumn
    ? `<th class="db-select-col"><div class="db-select-inner">${rowCheckbox()}</div></th>`
    : "") +
    COLUMNS.map((c) => `
    <th data-note-database-column-key="${c.label.toLowerCase()}">
      <div class="db-th-content">
        <span class="db-property-icon">${ICONS[c.icon] || ""}</span>
        <span class="db-th-label">${c.label}</span>
        <button type="button" class="db-column-menu-trigger" aria-label="Open ${c.label} menu">${dots}</button>
      </div>
    </th>`).join("");
}

export function tableRows() {
  return ROWS.map((r) => `
    <tr>
      <td class="db-select-col"><div class="db-select-inner">${rowCheckbox()}</div></td>
      <td>${r.name}</td>
      <td>${r.cost}</td>
      <td>${optionPill(r.cycle)}</td>
      <td>${optionPill(r.payment)}</td>
      <td>${r.renew}</td>
      <td>${optionPill(r.category)}</td>
    </tr>`).join("");
}

export const boardCard = (r, tone = OPTION_TONES[r.category], parent = "Subscriptions") => `
  <div class="db-board-card" role="row" aria-keyshortcuts="Enter Space F2" tabindex="-1">
    ${tone ? `<div class="db-board-card-priority-strip status-color-${tone}" data-status-color="${tone}" aria-hidden="true"></div>` : ""}
    <div class="db-board-card-controls">
      ${rowCheckbox("db-board-card-checkbox")}
      <button type="button" class="db-board-card-open" aria-label="Open note">${ICONS.maximize}</button>
      <button type="button" class="db-card-mobile-move-btn" aria-label="Move">${ICONS.move}</button>
    </div>
    <div class="db-board-card-body">
      ${parent ? `<div class="db-board-card-parent" title="${parent}">${parent}</div>` : ""}
      <div class="db-record-title-line">
        <div class="db-board-card-title db-file-title-stacked has-folder-prefix" title="${parent ? `${parent}/` : ""}${r.name}.md">
          <div class="db-file-title-name">${r.name}</div>
          <div class="db-file-title-prefix">${parent ? `${parent}/` : ""}</div>
        </div>
        <span class="db-board-card-chips">
          <span class="db-board-card-chip" data-note-database-column-key="cycle">${optionPill(r.cycle)}</span>
          <span class="db-board-card-chip" data-note-database-column-key="payment">${optionPill(r.payment)}</span>
        </span>
      </div>
      <div class="db-board-card-meta">
        <div class="db-board-card-field" data-note-database-column-key="cost" role="gridcell"><span class="db-board-card-field-label">Cost</span><span class="db-board-card-value">${r.cost}</span></div>
        <div class="db-board-card-field" data-note-database-column-key="renew" role="gridcell"><span class="db-board-card-field-label">Renews</span><span class="db-board-card-value">${r.renew}</span></div>
      </div>
    </div>
  </div>`;

/**
 * A board lane. Its title is `renderGroupLabel`'s too — `board-renderer.ts:314` passes
 * `db-board-column-title` to the same function the list, gallery and subgroup headers use — so an
 * option-typed lane field arrives as a badge here exactly as it does there.
 */
export function boardColumn(title, rows, tone = OPTION_TONES[title]) {
  return `
  <div class="db-board-column">
    <div class="db-board-column-header">
      ${tone ? `<div class="db-board-column-topbar status-color-${tone}" data-status-color="${tone}" aria-hidden="true"></div>` : ""}
      <button type="button" class="db-board-group-toggle"><span class="db-collapse-triangle"></span></button>
      ${rowCheckbox("db-board-column-checkbox")}
      <div class="db-board-header-text">
        ${groupTitle("db-board-column-title", title, tone)}
        <span class="db-board-count">${rows.length}</span>
        <button type="button" class="db-board-column-options" aria-label="Column options">${dots}</button>
      </div>
    </div>
    <div class="db-board-column-resize-handle" aria-hidden="true"></div>
    <div class="db-board-cards" role="rowgroup">${rows.map((row) => boardCard(row, tone ?? null)).join("")}</div>
  </div>`;
}

/**
 * Group-level selection headers.
 *
 * These are the controls that select a whole group at once, and they are a different family from
 * the per-row box beside them: board subgroup, gallery group and list group each pass their own
 * class to the factory. All three were absent from every fixture, so nothing photographed them and
 * no check could reach them — the same hole that let eleven of twelve row families ship round.
 *
 * The nesting mirrors each renderer: the list wraps toggle, checkbox, title and count in
 * `db-list-group-header-label`, the gallery puts them straight on the header, and the board's
 * subgroup keeps its title and count in `db-board-header-text`.
 */
export const listGroupHeader = (title, count, tone = OPTION_TONES[title]) => `
  <div class="db-list-group">
    <div class="db-list-group-header">
      <span class="db-list-group-header-label">
        ${collapseToggle("db-list-group-toggle")}
        ${rowCheckbox("db-list-group-checkbox")}
        ${groupTitle("db-list-group-title", title, tone)}
        <span class="db-list-group-count">${count}</span>
      </span>
      <button type="button" class="db-list-group-new">+ New</button>
    </div>
  </div>`;

export const galleryGroupHeader = (title, count, tone = OPTION_TONES[title]) => `
  <div class="db-gallery-group">
    <div class="db-gallery-group-header">
      ${collapseToggle("db-gallery-group-toggle")}
      ${rowCheckbox("db-gallery-group-checkbox")}
      ${groupTitle("db-gallery-group-title", title, tone)}
      <span class="db-gallery-group-count">${count}</span>
      <button type="button" class="db-gallery-group-new">+ New</button>
    </div>
  </div>`;

export const boardSubgroupHeader = (title, count, tone = OPTION_TONES[title]) => `
  <div class="db-board-subgroup">
    <div class="db-board-subgroup-header">
      ${collapseToggle("db-board-subgroup-toggle")}
      ${rowCheckbox("db-board-subgroup-checkbox")}
      <div class="db-board-header-text">
        ${groupTitle("db-board-subgroup-title", title, tone)}
        <span class="db-board-subgroup-count">${count}</span>
      </div>
    </div>
    <div class="db-board-cards" role="rowgroup"></div>
  </div>`;
