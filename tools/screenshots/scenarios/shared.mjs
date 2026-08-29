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
  { name: "A deliberately long service name that has to truncate", cost: "€ 1,00", cycle: "Yearly", payment: "ING", renew: "December 31, 2026", category: "Infrastructure" },
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
};

// ───────────────────────────────────────────────────────────────────
// 3. RENDER HELPERS
// ───────────────────────────────────────────────────────────────────

/* Selects and statuses render through `status-badge` plus a `status-color-*` modifier.
   Those are the real class names, so the fixture uses them rather than a badge class of
   its own that no shipped rule would ever match. */
export const pill = (text, tone) => `<span class="status-badge status-color-${tone}">${text}</span>`;


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

export function tableHeader() {
  return `<th class="db-select-col"><div class="db-select-inner">${rowCheckbox()}</div></th>` +
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
      <td>${pill(r.cycle, "orange")}</td>
      <td>${pill(r.payment, "gray")}</td>
      <td>${r.renew}</td>
      <td>${pill(r.category, r.category === "Business" ? "blue" : "green")}</td>
    </tr>`).join("");
}

export const boardCard = (r) => `
  <div class="db-board-card" role="row" aria-keyshortcuts="Enter Space F2" tabindex="-1">
    <div class="db-board-card-controls">${rowCheckbox("db-board-card-checkbox")}</div>
    <div class="db-board-card-title">${r.name}</div>
    <div class="db-board-card-field"><span class="db-board-card-field-label">Cost</span><span class="db-board-card-value">${r.cost}</span></div>
    <div class="db-board-card-field"><span class="db-board-card-field-label">Renews</span><span class="db-board-card-value">${r.renew}</span></div>
  </div>`;

export function boardColumn(title, rows) {
  return `
  <div class="db-board-column">
    <div class="db-board-column-header">
      <button type="button" class="db-board-group-toggle"><span class="db-collapse-triangle"></span></button>
      ${rowCheckbox("db-board-column-checkbox")}
      <div class="db-board-header-text">
        <span class="db-board-column-title">${title}</span>
        <span class="db-board-count">${rows.length}</span>
      </div>
      <button type="button" class="db-board-column-options" aria-label="Column options">${dots}</button>
    </div>
    <div class="db-board-cards" role="rowgroup">${rows.map(boardCard).join("")}</div>
  </div>`;
}

