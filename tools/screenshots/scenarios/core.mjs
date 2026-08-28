// ───────────────────────────────────────────────────────────────────
// MODULE:    core
// COMPONENT: screenshot scenarios for the primary view types (table, board, gallery, list) and their shared chrome
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ROWS, COLUMNS, ICONS, dots, glyph, pill, tableHeader, tableRows, boardColumn } from "./shared.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. SCENARIOS
// ───────────────────────────────────────────────────────────────────

export const CORE_SCENARIOS = [
  {
    id: "table-view",
    title: "Table view",
    group: "views",
    width: 1100,
    sources: ["src/views/table-renderer.ts", "src/views/column-header-controller.ts", "src/views/cell-renderer.ts"],
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
    sources: ["src/views/column-header-controller.ts"],
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
    sources: ["src/views/board-renderer.ts", "src/views/card-field-renderer.ts"],
    html: () => `
      <div class="note-database-container">
        <div class="db-board" role="grid">
          ${[...new Set(ROWS.map((r) => r.category))]
            .map((cat) => boardColumn(cat, ROWS.filter((r) => r.category === cat)))
            .join("")}
        </div>
      </div>`,
  },
  {
    id: "gallery-view",
    title: "Gallery view",
    group: "views",
    width: 900,
    sources: ["src/views/gallery-renderer.ts", "src/views/card-field-renderer.ts"],
    html: () => `
      <div class="note-database-container">
        <div class="db-gallery" role="grid">
          ${ROWS.slice(0, 4).map((r) => `
            <div class="db-gallery-card" role="row" aria-keyshortcuts="Enter Space F2" tabindex="-1">
              <div class="db-board-card-cover-placeholder"></div>
              <div class="db-gallery-card-title">${r.name}</div>
              <div class="db-gallery-field"><span class="db-gallery-field-label">Cost</span><span class="db-gallery-field-value">${r.cost}</span></div>
            </div>`).join("")}
        </div>
      </div>`,
  },
  {
    id: "list-view",
    title: "List view",
    group: "views",
    width: 900,
    sources: ["src/views/list-renderer.ts", "src/views/card-field-renderer.ts"],
    html: () => `
      <div class="note-database-container">
        <div class="db-list" role="grid">
          ${ROWS.map((r) => `
            <div class="db-list-row" role="row" aria-keyshortcuts="Enter Space F2" tabindex="-1">
              <span class="db-list-row-title">${r.name}</span>
              <span class="db-list-field-value">${r.cost}</span>
              <span class="db-list-field-value">${r.renew}</span>
            </div>`).join("")}
        </div>
      </div>`,
  },
  {
    id: "add-view-popover",
    title: "Add view popover",
    group: "components",
    width: 460,
    sources: ["src/views/toolbar-renderer.ts"],
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
    sources: ["src/views/dropdown-field.ts"],
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
    sources: ["src/views/empty-state-renderer.ts"],
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
  {
    id: "table-mobile",
    title: "Table view — mobile auto-fit",
    group: "views",
    width: 402,
    sources: ["src/views/TableRenderer.ts", "src/views/TableColumnLayoutSync.ts", "src/views/TableLayout.ts"],
    note: "The full table the renderer builds: a select gutter, a record-icon gutter and a runtime <colgroup> of fixed px widths. On desktop those widths hold; on the phone (is-phone) the columns auto-fit to content and the select column is no longer clipped by the scroll-area fade mask.",
    html: () => {
      const rows = [...ROWS.slice(0, 10), ROWS[17]];
      const move = glyph('<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>');
      const icon = glyph('<rect x="3" y="3" width="18" height="18" rx="2"/>');
      const colWidths = [200, 120, 130, 140, 170, 140];
      const cols = COLUMNS
        .map((c, i) => `<col data-note-database-column-key="${c.label.toLowerCase()}" style="width:${colWidths[i]}px">`)
        .join("");
      const dataCells = (r) => `
        <td>${r.name}</td><td>${r.cost}</td><td>${pill(r.cycle, "orange")}</td>
        <td>${pill(r.payment, "gray")}</td><td>${r.renew}</td>
        <td>${pill(r.category, r.category === "Business" ? "blue" : "green")}</td>`;
      const bodyRows = rows.map((r) => `
        <tr>
          <td class="db-select-col"><div class="db-select-inner">
            <button type="button" class="db-table-mobile-move-btn" aria-label="Move row">${move}</button>
            <input type="checkbox" aria-label="Select row"></div></td>
          <td class="db-record-icon-col"><span class="db-record-icon">${icon}</span></td>
          ${dataCells(r)}
        </tr>`).join("");
      const total = 40 + 28 + colWidths.reduce((a, b) => a + b, 0);
      return `
      <div class="note-database-container db-width-default">
        <div class="db-table-wrap">
          <table class="db-table" style="width:${total}px;min-width:${total}px">
            <colgroup>
              <col class="db-select-colgroup"><col class="db-record-icon-colgroup">${cols}
            </colgroup>
            <thead><tr>
              <th class="db-select-col"><div class="db-select-inner"><input type="checkbox" aria-label="Select all"></div></th>
              <th class="db-record-icon-col"></th>
              ${tableHeader()}
            </tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </div>
      </div>`;
    },
  },
  {
    id: "list-mobile",
    title: "List view — mobile",
    group: "views",
    width: 402,
    sources: ["src/views/ListRenderer.ts", "src/views/CardFieldRenderer.ts"],
    note: "The list row the renderer builds: controls, a title line and a meta row of fixed-width fields. On desktop the fields sit on one line; on the phone (is-phone) the card fills the viewport and the fields wrap inside its border instead of escaping it.",
    html: () => {
      const open = glyph('<path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="M9 21H3v-6"/><path d="m3 21 7-7"/>');
      const move = glyph('<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>');
      const fieldPairs = (r) => [
        ["Cost", r.cost], ["Renews", r.renew], ["Payment", r.payment], ["Billing", r.cycle],
      ].map(([label, value]) => `
        <div class="db-list-field"><span class="db-list-field-label">${label}</span><div class="db-list-field-value">${value}</div></div>`).join("");
      const rows = ROWS.slice(0, 12).map((r) => `
        <div class="db-list-row" role="row" aria-keyshortcuts="Enter Space F2" tabindex="-1">
          <div class="db-list-row-controls">
            <input type="checkbox" class="db-list-row-checkbox" aria-label="Select">
            <button type="button" class="db-list-row-open" aria-label="Open note">${open}</button>
            <button type="button" class="db-list-mobile-move-btn" aria-label="Move">${move}</button>
          </div>
          <div class="db-list-row-main">
            <div class="db-record-title-line"><span class="db-list-row-title">${r.name}</span></div>
            <div class="db-list-row-meta">${fieldPairs(r)}</div>
          </div>
        </div>`).join("");
      return `
      <div class="note-database-container db-width-default">
        <div class="db-list" role="grid">${rows}</div>
      </div>`;
    },
  },
  {
    id: "board-mobile",
    title: "Board view — mobile",
    group: "views",
    width: 402,
    sources: ["src/views/BoardRenderer.ts", "src/views/GroupLabelRenderer.ts", "src/views/CardFieldRenderer.ts"],
    note: "The board inside the default-width container. On the phone (is-phone) the container no longer centres the grid off-screen, and the sticky group header is taken out of sticky flow so it cannot float down over the cards; columns page horizontally with snap-scroll.",
    html: () => `
      <div class="note-database-container db-width-default">
        <div class="db-board" role="grid">
          ${[...new Set(ROWS.map((r) => r.category))]
            .map((cat) => boardColumn(cat, ROWS.filter((r) => r.category === cat)))
            .join("")}
        </div>
      </div>`,
  },
];
