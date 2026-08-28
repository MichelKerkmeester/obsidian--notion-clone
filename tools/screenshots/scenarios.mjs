/**
 * Screenshot scenarios.
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

export const ROWS = [
  { name: "Figma",       cost: "€ 18,75", cycle: "Yearly",  payment: "Revolut", renew: "January 4, 2027",  category: "Business" },
  { name: "Notion",      cost: "€ 96,25", cycle: "Yearly",  payment: "Revolut", renew: "February 14, 2027", category: "Business" },
  { name: "Spotify",     cost: "€ 11,26", cycle: "Monthly", payment: "ING",     renew: "March 2, 2026",     category: "Personal" },
  { name: "iCloud",      cost: "€ 2,99",  cycle: "Monthly", payment: "Apple",   renew: "March 9, 2026",     category: "Personal" },
  { name: "Adobe CC",    cost: "€ 62,50", cycle: "Yearly",  payment: "Revolut", renew: "August 21, 2026",   category: "Business" },
];

const COLUMNS = [
  { label: "Name",         icon: "file-text" },
  { label: "Cost",         icon: "hash" },
  { label: "Billing",      icon: "circle-dot" },
  { label: "Payment",      icon: "circle-dot" },
  { label: "Next Renewal", icon: "calendar" },
  { label: "Category",     icon: "circle-dot" },
];

/** A vertical-ellipsis glyph standing in for the Lucide icon the plugin injects at runtime. */
const dots = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>`;
const glyph = (d) => `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICONS = {
  "file-text": glyph('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'),
  hash: glyph('<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>'),
  "circle-dot": glyph('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>'),
  calendar: glyph('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
};

/* Selects and statuses render through `status-badge` plus a `status-color-*` modifier.
   Those are the real class names, so the fixture uses them rather than a badge class of
   its own that no shipped rule would ever match. */
const pill = (text, tone) => `<span class="status-badge status-color-${tone}">${text}</span>`;

function tableHeader() {
  return COLUMNS.map((c) => `
    <th data-note-database-column-key="${c.label.toLowerCase()}">
      <div class="db-th-content">
        <span class="db-property-icon">${ICONS[c.icon] || ""}</span>
        <span class="db-th-label">${c.label}</span>
        <button type="button" class="db-column-menu-trigger" aria-label="Open ${c.label} menu">${dots}</button>
      </div>
    </th>`).join("");
}

function tableRows() {
  return ROWS.map((r) => `
    <tr>
      <td>${r.name}</td>
      <td>${r.cost}</td>
      <td>${pill(r.cycle, "orange")}</td>
      <td>${pill(r.payment, "gray")}</td>
      <td>${r.renew}</td>
      <td>${pill(r.category, r.category === "Business" ? "blue" : "green")}</td>
    </tr>`).join("");
}

const boardCard = (r) => `
  <div class="db-board-card" role="row" aria-keyshortcuts="Enter Space F2" tabindex="-1">
    <div class="db-board-card-title">${r.name}</div>
    <div class="db-card-field"><span class="db-card-label">Cost</span><span class="db-card-value">${r.cost}</span></div>
    <div class="db-card-field"><span class="db-card-label">Renews</span><span class="db-card-value">${r.renew}</span></div>
  </div>`;

function boardColumn(title, rows) {
  return `
  <div class="db-board-column">
    <div class="db-board-column-header">
      <button type="button" class="db-board-group-toggle"><span class="db-collapse-triangle"></span></button>
      <div class="db-board-header-text">
        <span class="db-board-column-title">${title}</span>
        <span class="db-board-count">${rows.length}</span>
      </div>
      <button type="button" class="db-board-column-options" aria-label="Column options">${dots}</button>
    </div>
    <div class="db-board-cards" role="rowgroup">${rows.map(boardCard).join("")}</div>
  </div>`;
}

export const SCENARIOS = [
  {
    id: "table-view",
    title: "Table view",
    group: "views",
    width: 1100,
    sources: ["src/views/TableRenderer.ts", "src/views/ColumnHeaderController.ts", "src/views/CellRenderer.ts"],
    html: () => `
      <div class="note-database-container">
        <table class="db-table"><thead><tr>${tableHeader()}</tr></thead><tbody>${tableRows()}</tbody></table>
      </div>`,
  },
  {
    id: "table-column-header",
    title: "Column header affordances",
    group: "components",
    width: 620,
    sources: ["src/views/ColumnHeaderController.ts"],
    note: "The menu trigger sits inline after the label and the label truncates before it moves.",
    html: () => `
      <div class="note-database-container">
        <table class="db-table"><thead><tr>
          <th data-note-database-column-key="short"><div class="db-th-content">
            <span class="db-property-icon">${ICONS["circle-dot"]}</span>
            <span class="db-th-label">Payment</span>
            <button type="button" class="db-column-menu-trigger" aria-label="Open menu">${dots}</button>
          </div></th>
          <th data-note-database-column-key="long" style="max-width:220px"><div class="db-th-content">
            <span class="db-property-icon">${ICONS.calendar}</span>
            <span class="db-th-label">A deliberately long column name that must truncate</span>
            <button type="button" class="db-column-menu-trigger" aria-label="Open menu">${dots}</button>
          </div></th>
        </tr></thead><tbody><tr><td>Revolut</td><td>January 4, 2027</td></tr></tbody></table>
      </div>`,
  },
  {
    id: "board-view",
    title: "Board view",
    group: "views",
    width: 1100,
    sources: ["src/views/BoardRenderer.ts", "src/views/CardFieldRenderer.ts"],
    html: () => `
      <div class="note-database-container">
        <div class="db-board" role="grid">
          ${boardColumn("Business", ROWS.filter((r) => r.category === "Business"))}
          ${boardColumn("Personal", ROWS.filter((r) => r.category === "Personal"))}
        </div>
      </div>`,
  },
  {
    id: "gallery-view",
    title: "Gallery view",
    group: "views",
    width: 900,
    sources: ["src/views/GalleryRenderer.ts", "src/views/CardFieldRenderer.ts"],
    html: () => `
      <div class="note-database-container">
        <div class="db-gallery" role="grid">
          ${ROWS.slice(0, 4).map((r) => `
            <div class="db-gallery-card" role="row" aria-keyshortcuts="Enter Space F2" tabindex="-1">
              <div class="db-board-card-cover-placeholder"></div>
              <div class="db-gallery-card-title">${r.name}</div>
              <div class="db-card-field"><span class="db-card-label">Cost</span><span class="db-card-value">${r.cost}</span></div>
            </div>`).join("")}
        </div>
      </div>`,
  },
  {
    id: "list-view",
    title: "List view",
    group: "views",
    width: 900,
    sources: ["src/views/ListRenderer.ts", "src/views/CardFieldRenderer.ts"],
    html: () => `
      <div class="note-database-container">
        <div class="db-list" role="grid">
          ${ROWS.map((r) => `
            <div class="db-list-row" role="row" aria-keyshortcuts="Enter Space F2" tabindex="-1">
              <span class="db-list-row-title">${r.name}</span>
              <span class="db-card-value">${r.cost}</span>
              <span class="db-card-value">${r.renew}</span>
            </div>`).join("")}
        </div>
      </div>`,
  },
  {
    id: "add-view-popover",
    title: "Add view popover",
    group: "components",
    width: 460,
    sources: ["src/views/ToolbarRenderer.ts"],
    note: "Tiles keep icon and caption inside their own bounds; the duplicate checkbox is not stretched.",
    // The popover anchors itself absolutely to the toolbar. With no toolbar to anchor to it
    // leaves the flow and the capture box collapses, so it is placed back in flow here.
    captureCss: `.note-database-container .db-view-tab-popover {
      position: static !important; top: auto !important; left: auto !important;
      max-height: none !important;
    }`,
    html: () => {
      const tile = (label, d) => `
        <button type="button" class="db-add-view-card" role="menuitem" aria-label="${label}">
          <div class="db-add-view-preview"><span class="db-add-view-preview-icon">${glyph(d)}</span>
            <span class="db-add-view-preview-lines"></span></div>
          <span class="db-add-view-card-label">${label}</span>
        </button>`;
      return `
      <div class="note-database-container">
        <div class="db-view-tab-popover db-add-view-popover" role="dialog" aria-label="Add view">
          <div class="db-panel-header"><div class="db-panel-title">Add view</div></div>
          <div class="db-add-view-form">
            <input type="text" class="db-add-view-name" placeholder="View name (optional)">
            <select class="db-add-view-key-field"><option>Cost</option></select>
            <label class="db-add-view-duplicate"><input type="checkbox"><span>Duplicate current view</span></label>
            <input type="text" class="db-add-view-icon" placeholder="Icon (optional)">
          </div>
          <div class="db-add-view-cards">
            ${tile("Table view", '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>')}
            ${tile("Board view", '<rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="11" rx="1"/>')}
            ${tile("Gallery view", '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>')}
            ${tile("Calendar view", '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>')}
          </div>
          <button type="button" class="db-add-view-duplicate-action db-menu-item" role="menuitem">
            <span class="db-menu-item-icon">${glyph('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>')}</span>
            <span class="db-menu-item-label">Duplicate current view</span>
          </button>
        </div>
      </div>`;
    },
  },
  {
    id: "dropdown-field",
    title: "Dropdown with disabled option",
    group: "components",
    width: 380,
    sources: ["src/views/DropdownField.ts"],
    note: "A disabled option is dimmed and carries a tooltip rather than inline explanatory text.",
    html: () => `
      <div class="note-database-container">
        <div class="db-dropdown-popover">
          <div class="db-dropdown-section-title">Aggregate</div>
          <button type="button" class="db-dropdown-option is-selected"><span class="db-dropdown-option-label">Sum</span></button>
          <button type="button" class="db-dropdown-option"><span class="db-dropdown-option-label">Average</span></button>
          <button type="button" class="db-dropdown-option" aria-disabled="true" title="Rollup needs a numeric target field">
            <span class="db-dropdown-option-label">Rollup</span></button>
        </div>
      </div>`,
  },
  {
    id: "empty-state",
    title: "Empty state",
    group: "states",
    width: 720,
    sources: ["src/views/EmptyStateRenderer.ts"],
    html: () => `
      <div class="note-database-container">
        <div class="db-empty-hero">
          <div class="db-empty-hero-content">
            <div class="db-empty-hero-icon">${glyph('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>')}</div>
            <div class="db-empty-card-title">No properties yet</div>
            <div class="db-empty-hero-description">Add a property to start describing these notes.</div>
            <div class="db-empty-action-group">
              <button type="button" class="db-empty-action mod-cta">Add property</button>
              <button type="button" class="db-empty-action">Learn more</button>
            </div>
          </div>
        </div>
      </div>`,
  },
];
