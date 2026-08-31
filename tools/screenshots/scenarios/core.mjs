// ───────────────────────────────────────────────────────────────────
// MODULE:    core
// COMPONENT: screenshot scenarios for the primary view types (table, board, gallery, list) and their shared chrome
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { COLUMNS, ICONS, ROWS, boardColumn, dots, glyph, pill, rowCheckbox, tableHeader, tableRows } from "./shared.mjs";

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
              <div class="db-gallery-card-controls">${rowCheckbox("db-gallery-card-checkbox")}</div>
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
    // renderRow builds `db-list-row-controls` — checkbox, open button, move button — with no
    // device test around it, so a desktop row has all three. This fixture used to render a bare
    // title and two values, which meant the desktop list's own selection checkbox appeared in no
    // capture at all and no check could reach it.
    note: "The desktop list row, controls included. The row checkbox is not a phone-only control; the renderer builds it at every width.",
    html: () => `
      <div class="note-database-container">
        <div class="db-list" role="grid">
          ${ROWS.map((r) => `
            <div class="db-list-row" role="row" aria-keyshortcuts="Enter Space F2" tabindex="-1">
              <div class="db-list-row-controls">
                ${rowCheckbox("db-list-row-checkbox")}
                <button type="button" class="db-list-row-open" aria-label="Open note">${ICONS.maximize}</button>
                <button type="button" class="db-list-mobile-move-btn" aria-label="Move">${ICONS.move}</button>
              </div>
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
    // The width the positioner actually gives this panel. At 460 the capture was 1.6x the
    // surface, so every judgement made from it — spacing, wrapping, how crowded a row looks —
    // was made about a picture the product never draws.
    width: 292,
    sources: ["src/views/toolbar-renderer.ts"],
    note: "Settings above, actions below, one row grammar for both the seven types and the duplicate.",
    // The popover anchors itself absolutely to the toolbar. With no toolbar to anchor to it
    // leaves the flow and the capture box collapses, so it is placed back in flow here.
    //
    // That override is also why NO capture of this scenario can answer a placement question. On a
    // phone the shipped positioner makes this surface a bottom sheet; pinned static, it photographs
    // as a popover in both devices. A defect was once read off this image that the image was
    // structurally incapable of showing. Placement is measured in verify-placement, never here.
    captureCss: `.note-database-container .db-view-tab-popover {
      position: static !important; top: auto !important; left: auto !important;
      max-height: none !important;
    }`,
    // Seven types, because getViewTypeOptions() returns seven. This markup is hand-written and
    // cannot import the renderer, so add-view-popover-layout.test.ts holds the two in step instead.
    html: () => {
      const row = (label, d) => `
        <button type="button" class="db-menu-item" role="menuitem" aria-checked="false">
          <span class="db-menu-item-icon">${glyph(d)}</span>
          <span class="db-menu-item-label">${label}</span>
        </button>`;
      const field = (id, label, control) => `
        <div class="db-add-view-field">
          <label class="db-add-view-field-label" for="${id}">${label}</label>
          ${control}
        </div>`;
      return `
      <div class="note-database-container">
        <div class="db-view-tab-popover db-add-view-popover" role="dialog" aria-label="Add view">
          <div class="db-panel-header"><div class="db-panel-title">Add view</div></div>
          <div class="db-menu-section">Options</div>
          <div class="db-add-view-form">
            ${field("db-add-view-field-1", "View name (optional)",
              '<input type="text" class="db-add-view-name" id="db-add-view-field-1">')}
            ${field("db-add-view-field-2", "Title property",
              '<select class="db-add-view-key-field" id="db-add-view-field-2"><option>Cost</option></select>')}
            ${field("db-add-view-field-3", "Icon (optional)",
              '<input type="text" class="db-add-view-icon" maxlength="8" id="db-add-view-field-3">')}
            <label class="db-add-view-duplicate"><input type="checkbox" class="db-checkbox db-checkbox-field"><span>Copy settings from current view</span></label>
          </div>
          <div class="db-menu-separator" role="separator"></div>
          <div class="db-menu-section">Create</div>
          <div class="db-add-view-choices">
            ${row("Table view", '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>')}
            ${row("Board view", '<rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="11" rx="1"/>')}
            ${row("List view", '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>')}
            ${row("Chart view", '<path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="7"/><rect x="13" y="6" width="3" height="11"/>')}
            ${row("Calendar view", '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>')}
            ${row("Timeline view", '<path d="M3 6h11M3 12h7M3 18h14"/>')}
            <button type="button" class="db-menu-item db-add-view-duplicate-action" role="menuitem" aria-checked="false">
              <span class="db-menu-item-icon">${glyph('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>')}</span>
              <span class="db-menu-item-label">Duplicate current view</span>
            </button>
          </div>
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
    sources: ["src/views/table-renderer.ts", "src/views/table-column-layout-sync.ts", "src/views/table-layout.ts", "src/views/cell-renderer.ts", "src/views/file-title-display.ts", "src/views/table-record-peek.ts", "styles.css"],
    note: "The full table the renderer builds: a select gutter, a record-icon gutter and a runtime <colgroup> of fixed px widths. On desktop those widths hold; on the phone (is-phone) the columns auto-fit to content and the select column is no longer clipped by the scroll-area fade mask. The name column is the title cell — a content-sized link plus the always-visible open affordance, rendered on touch as a compact maximize icon so its width goes to the note name instead of a text label.",
    html: () => {
      const rows = [...ROWS.slice(0, 10), ROWS[17]];
      const move = glyph('<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>');
      const icon = glyph('<rect x="3" y="3" width="18" height="18" rx="2"/>');
      const openIcon = glyph('<path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="M9 21H3v-6"/><path d="m3 21 7-7"/>');
      const colWidths = [200, 120, 130, 140, 170, 140];
      const cols = COLUMNS
        .map((c, i) => `<col data-note-database-column-key="${c.label.toLowerCase()}" style="width:${colWidths[i]}px">`)
        .join("");
      const titleCell = (r) => `
        <td class="db-cell db-title-cell db-editable-cell db-record-open-host">
          <a class="internal-link"><span class="db-file-title-inline has-folder-prefix"><span class="db-file-title-name">${r.name}</span></span></a>
          <button type="button" class="db-record-open-btn db-record-open-btn-icon" aria-label="Open">${openIcon}</button>
        </td>`;
      const dataCells = (r) => `
        ${titleCell(r)}<td>${r.cost}</td><td>${pill(r.cycle, "orange")}</td>
        <td>${pill(r.payment, "gray")}</td><td>${r.renew}</td>
        <td>${pill(r.category, r.category === "Business" ? "blue" : "green")}</td>`;
      const bodyRows = rows.map((r) => `
        <tr>
          <td class="db-select-col"><div class="db-select-inner">
            <button type="button" class="db-table-mobile-move-btn" aria-label="Move row">${move}</button>
            ${rowCheckbox()}</div></td>
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
              <th class="db-select-col"><div class="db-select-inner">${rowCheckbox()}</div></th>
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
    sources: ["src/views/list-renderer.ts", "src/views/card-field-renderer.ts"],
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
            <input type="checkbox" class="db-checkbox db-checkbox-row db-list-row-checkbox" aria-label="Select">
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
    sources: ["src/views/board-renderer.ts", "src/views/group-label-renderer.ts", "src/views/card-field-renderer.ts"],
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
  {
    id: "list-sparse-fields",
    title: "List rows with fields missing",
    group: "views",
    width: 1100,
    sources: ["src/views/list-renderer.ts"],
    note: "The shape every other list fixture cannot produce: each row missing a different subset of its properties. A fixture that gives every row every field shows a tidy grid whichever way the row is laid out, so it cannot tell a column claimed by index from a slot taken by count.",
    html: () => {
      // Which fields each row is missing. Fixed rather than random so the capture is reproducible,
      // and spread so no two adjacent rows share a subset.
      const MISSING = [[], ["payment"], ["cost", "cycle"], ["renew"], ["cost"], ["cycle", "payment"],
                       [], ["cost", "renew", "cycle"], ["payment"], ["renew"], ["cost"], []];
      // Deliberately not all equal: with four identical widths a container-level track rule and a
      // per-column one produce the same picture, and the fixture cannot tell them apart.
      const WIDTHS = { cost: 110, renew: 190, payment: 150, cycle: 130 };
      const template = ["cost", "renew", "payment", "cycle"].map((k) => `${WIDTHS[k]}px`).join(" ");
      const rows = ROWS.slice(0, 12).map((r, i) => {
        const gone = new Set(MISSING[i] || []);
        const pairs = [["Cost", "cost"], ["Renews", "renew"], ["Payment", "payment"], ["Billing", "cycle"]]
          // The column each property owns, assigned before the skip — the renderer sets the same
          // value from the unfiltered field list, so a fixture that numbered the survivors instead
          // would photograph an alignment the renderer never produces.
          .map(([label, key], column) => [label, key, column + 1])
          // The renderer's own treatment of an empty value, reproduced: the field is still built
          // and still claims its column, and `is-placeholder` hides it. Reproducing the older
          // behaviour — dropping the element — would photograph a row the renderer no longer
          // builds, and would hide the phone defect this fixture exists to show, because a
          // wrapping flex line has no grid column to fall back on.
          .map(([label, key, column]) => `
            <div class="db-list-field${gone.has(key) ? " is-placeholder" : ""}"${gone.has(key) ? ' aria-hidden="true"' : ""} style="grid-column: ${column}; --db-card-field-width: ${WIDTHS[key]}px"><span class="db-list-field-label">${label}</span><div class="db-list-field-value">${r[key]}</div></div>`)
          .join("");
        return `
        <div class="db-list-row" role="row" tabindex="-1">
          <div class="db-list-row-main">
            <div class="db-record-title-line"><span class="db-list-row-title">${r.name}</span></div>
            <div class="db-list-row-meta" style="grid-template-columns: ${template}">${pairs}</div>
          </div>
        </div>`;
      }).join("");
      return `
      <div class="note-database-container db-width-default">
        <div class="db-list" role="grid">${rows}</div>
      </div>`;
    },
  },
];
