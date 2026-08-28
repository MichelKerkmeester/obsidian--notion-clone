/**
 * Panels and overlays: the surfaces the toolbar opens on top of a view.
 *
 * Most of these anchor themselves against a toolbar button at runtime, so the shipped rules
 * take them out of the flow (`position: absolute`, or the `position: fixed` that
 * `positionToolbarPopover` writes). With no toolbar to anchor to they contribute no height
 * and the capture box collapses, so those scenarios carry a `captureCss` block that only
 * restores flow — never restyles what is being photographed. The record peek is the one
 * that needs none: it docks to the container rather than to a control, and the table it is
 * captured over gives it exactly that.
 *
 * Markup mirrors the renderers named in each `sources` list, including the parts that look
 * redundant: the dropdowns are the `db-dropdown-field` button the plugin builds rather than
 * a `<select>`, and the reorder buttons are present because the renderers emit them
 * unconditionally.
 */

import { ROWS, glyph, pill, tableHeader } from "./_shared.mjs";

/* Lucide glyphs standing in for the icons `setIcon()` injects at runtime. Named for the
   icon the renderer asks for so a reader can match them back to the call site. */
const I = {
  chevronDown: glyph('<path d="m6 9 6 6 6-6"/>'),
  plus: glyph('<path d="M5 12h14M12 5v14"/>'),
  folderPlus: glyph('<path d="M12 10v6M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>'),
  circleSlash: glyph('<circle cx="12" cy="12" r="10"/><path d="M22 2 2 22"/>'),
  trash2: glyph('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/>'),
  undo2: glyph('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
  arrowUp: glyph('<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>'),
  arrowDown: glyph('<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>'),
  wrapText: glyph('<path d="M3 6h18"/><path d="M3 12h15a3 3 0 1 1 0 6h-4"/><path d="m16 16-2 2 2 2"/><path d="M3 18h4"/>'),
  edit: glyph('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>'),
  trash: glyph('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
  maximize2: glyph('<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/>'),
  table: glyph('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>'),
};

/* The property-type icons are drawn by PropertyTypeIcon.ts from its own path table rather
   than by Lucide, so these reproduce that table's paths for the four types used here. A
   generic stand-in would photograph an icon the plugin never draws. */
const TYPE_ICON = {
  text: glyph('<path d="M14 15.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0"/><path d="M3 19v-10.5a3.5 3.5 0 0 1 7 0v10.5"/><path d="M3 13h7"/><path d="M21 12v7"/>'),
  currency: glyph('<path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0"/><path d="M14.8 9a3 3 0 0 0 -2.8 -1.5a2.5 2.5 0 0 0 0 5a2.5 2.5 0 0 1 0 5a3 3 0 0 1 -2.8 -1.5"/><path d="M12 6v12"/>'),
  select: glyph('<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>'),
  date: glyph('<path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 11h16"/>'),
};

/** The six columns the subscription fixture describes, with the types the plugin stores. */
const COLUMN_DEFS = [
  { key: "file.name", label: "Name", type: "text" },
  { key: "cost", label: "Cost", type: "currency" },
  { key: "cycle", label: "Billing", type: "select" },
  { key: "payment", label: "Payment", type: "select" },
  { key: "renew", label: "Next Renewal", type: "date" },
  { key: "category", label: "Category", type: "select" },
];

/**
 * The button `createDropdownField` builds. `hideLabel` is set at every call site in these
 * panels, so the label span is absent and only the value span is rendered; `has-current-icon`
 * is present exactly when the selected option carries an icon, because that is the class the
 * grid template keys off.
 */
function dropdownField(className, value, icon) {
  const withIcon = Boolean(icon);
  return `
    <button type="button" class="db-dropdown-field ${className}${withIcon ? " has-current-icon" : ""}"
      aria-haspopup="listbox" aria-expanded="false">
      <span class="db-dropdown-field-icon">${withIcon ? `<span class="db-dropdown-option-type-icon">${icon}</span>` : ""}</span>
      <div class="db-dropdown-field-text"><span class="db-dropdown-field-value">${value}</span></div>
      <span class="db-dropdown-field-chevron">${I.chevronDown}</span>
    </button>`;
}

const ruleIcon = (label, icon) =>
  `<button type="button" class="db-source-rule-icon-button" aria-label="${label}">${icon}</button>`;

/**
 * One condition row. `value` is the already-rendered value control: an `<input>` for text
 * and number columns, a dropdown for select columns, and the em-dash span when the operator
 * is empty/notempty and takes no value at all.
 */
function filterRow(field, fieldType, operator, value, { canWrap = true } = {}) {
  return `
    <div class="db-panel-row">
      ${dropdownField("db-panel-dropdown db-filter-field-dropdown", field, TYPE_ICON[fieldType])}
      ${dropdownField("db-panel-dropdown db-filter-operator-dropdown", operator)}
      ${value}
      ${canWrap ? ruleIcon("Add rule group", I.folderPlus) : ""}
      ${ruleIcon("Negate rule", I.circleSlash)}
      <button type="button" class="db-panel-button">×</button>
    </div>`;
}

/* Number and currency columns get a native number input; select and status columns get a
   dropdown of the column's options instead. */
const numberValue = (v) => `<input type="number" placeholder="Value" value="${v}">`;
const selectValue = (v) => dropdownField("db-panel-dropdown db-filter-value-dropdown", v);
const noValue = `<span class="db-panel-empty-value">—</span>`;

/** The header of a group node: its AND/OR dropdown plus the node-level actions. */
function groupHeader({ logic = "AND (all)", canWrap = true } = {}) {
  return `
    <div class="db-source-rule-header">
      ${dropdownField("db-source-rule-dropdown db-source-rule-logic", logic)}
      <div class="db-source-rule-actions">
        ${ruleIcon("Add source rule", I.plus)}
        ${canWrap ? ruleIcon("Add rule group", I.folderPlus) : ""}
        ${ruleIcon("Negate rule", I.circleSlash)}
        ${ruleIcon("Remove rule", I.trash2)}
      </div>
    </div>`;
}

/* Both reorder buttons are emitted by every sort rule and every column-manager row. They
   are kept here because the renderers emit them unconditionally — see the report note about
   `.db-mobile-reorder-controls` being shown on desktop by a late rule in styles.css. */
function reorderControls(isFirst, isLast) {
  return `
    <span class="db-mobile-reorder-controls">
      <button type="button" title="Move up" aria-label="Move up"${isFirst ? " disabled" : ""}>${I.arrowUp}</button>
      <button type="button" title="Move down" aria-label="Move down"${isLast ? " disabled" : ""}>${I.arrowDown}</button>
    </span>`;
}

/* Filter, sort, view-config and column-manager panels all share one absolute-positioning
   rule keyed to a toolbar height the capture has no toolbar to supply. Restoring flow is
   the whole job; the height cap is lifted so a panel taller than the viewport is
   photographed whole instead of scrolled. */
const ANCHORED_PANEL_CSS = `.note-database-container :is(.db-filter-panel, .db-sort-panel, .db-view-config-panel, .db-column-manager) {
  position: static !important; top: auto !important; right: auto !important;
  max-height: none !important;
}`;

export const PANEL_SCENARIOS = [
  {
    id: "panel-filter-conditions",
    title: "Filter panel with active conditions",
    group: "panels",
    width: 600,
    sources: ["src/views/FilterPanelRenderer.ts", "src/views/DropdownField.ts"],
    note: "Three conditions build a group node, so the panel header drops its AND/OR button and the group's own logic dropdown carries it instead.",
    captureCss: ANCHORED_PANEL_CSS,
    html: () => `
      <div class="note-database-container">
        <div class="db-filter-panel" id="db-filter-panel" role="dialog" aria-label="Filter">
          <div class="db-panel-header"><span class="db-panel-title">Filter</span></div>
          <div class="db-source-rule-node db-source-rule-group">
            ${groupHeader()}
            <div class="db-source-rule-children">
              ${filterRow("Category", "select", "equals", selectValue("Business"))}
              ${filterRow("Cost", "currency", "greater than", numberValue("20"))}
              ${filterRow("Next Renewal", "date", "is not empty", noValue)}
            </div>
          </div>
          <button class="db-panel-button">+ Add condition</button>
        </div>
      </div>`,
  },
  {
    id: "panel-filter-nested-group",
    title: "Filter panel with a nested group and a NOT",
    group: "panels",
    width: 640,
    sources: ["src/views/FilterPanelRenderer.ts", "src/data/ViewFilterTree.ts"],
    note: "Nesting stops at three levels: the innermost rows lose their add-group button because the tree can go no deeper.",
    captureCss: ANCHORED_PANEL_CSS,
    html: () => `
      <div class="note-database-container">
        <div class="db-filter-panel" id="db-filter-panel" role="dialog" aria-label="Filter">
          <div class="db-panel-header"><span class="db-panel-title">Filter</span></div>
          <div class="db-source-rule-node db-source-rule-group">
            ${groupHeader()}
            <div class="db-source-rule-children">
              ${filterRow("Category", "select", "equals", selectValue("Business"))}
              <div class="db-source-rule-node db-source-rule-not">
                <div class="db-source-rule-header">
                  <span class="db-source-rule-not-label">NOT</span>
                  <div class="db-source-rule-actions">
                    ${ruleIcon("Remove NOT", I.undo2)}
                    ${ruleIcon("Remove rule", I.trash2)}
                  </div>
                </div>
                <div class="db-source-rule-children">
                  ${filterRow("Payment", "select", "equals", selectValue("Apple"))}
                </div>
              </div>
              <div class="db-source-rule-node db-source-rule-group">
                ${groupHeader({ logic: "OR (any)" })}
                <div class="db-source-rule-children">
                  ${filterRow("Cost", "currency", "greater than", numberValue("50"), { canWrap: false })}
                  ${filterRow("Billing", "select", "equals", selectValue("Yearly"), { canWrap: false })}
                </div>
              </div>
            </div>
          </div>
          <button class="db-panel-button">+ Add condition</button>
        </div>
      </div>`,
  },
  {
    id: "panel-sort-rules",
    title: "Sort panel with two rules",
    group: "panels",
    width: 560,
    sources: ["src/views/SortPanelRenderer.ts", "src/views/DropdownField.ts"],
    note: "Rows are draggable; the first rule's move-up and the last rule's move-down are disabled.",
    captureCss: ANCHORED_PANEL_CSS,
    html: () => {
      const rule = (field, type, direction, isFirst, isLast) => `
        <div class="db-panel-row db-sort-rule-row" draggable="true">
          <span class="db-panel-drag" title="Drag to reorder">⋮⋮</span>
          ${reorderControls(isFirst, isLast)}
          ${dropdownField("db-panel-dropdown db-sort-field-dropdown", field, TYPE_ICON[type])}
          ${dropdownField("db-panel-dropdown db-sort-direction-dropdown", direction)}
          <button class="db-panel-button">×</button>
        </div>`;
      return `
      <div class="note-database-container">
        <div class="db-sort-panel db-filter-panel" id="db-sort-panel">
          <div class="db-panel-header"><span class="db-panel-title">Sort</span></div>
          ${rule("Next Renewal", "date", "Ascending", true, false)}
          ${rule("Cost", "currency", "Descending", false, true)}
          <button class="db-panel-button">+ Add sort</button>
        </div>
      </div>`;
    },
  },
  {
    id: "panel-sort-calendar-empty",
    title: "Sort panel with no rules, calendar hint",
    group: "panels",
    width: 560,
    sources: ["src/views/SortPanelRenderer.ts"],
    note: "Calendar views add a hint above the empty state because layout order wins over user sort.",
    captureCss: ANCHORED_PANEL_CSS,
    html: () => `
      <div class="note-database-container">
        <div class="db-sort-panel db-filter-panel" id="db-sort-panel">
          <div class="db-panel-header"><span class="db-panel-title">Sort</span></div>
          <div class="db-panel-hint">Calendar views place spanning, all-day, and overlapping timed events first; sort rules apply within the available event order.</div>
          <div class="db-panel-empty">Click "Add sort" below to add multi-sort rules.</div>
          <button class="db-panel-button">+ Add sort</button>
        </div>
      </div>`,
  },
  {
    id: "panel-view-config",
    title: "View configuration panel",
    group: "panels",
    width: 520,
    sources: ["src/views/ViewConfigPanelRenderer.ts", "src/views/DropdownField.ts"],
    note: "The top of the panel for a table view: database-scoped rows above the section divider, view-scoped rows below. Conditional formatting and status presets sit further down and are not in frame.",
    captureCss: ANCHORED_PANEL_CSS,
    html: () => `
      <div class="note-database-container">
        <div class="db-view-config-panel" id="db-view-config-panel">
          <div class="db-panel-header"><div class="db-panel-title">Settings</div></div>

          <div class="db-view-config-section-title" data-scope="database">Current database</div>
          <div class="db-view-config-row">
            <div class="db-view-config-label">Name</div>
            <div class="db-view-config-field db-view-config-field-stack">
              <input class="db-view-config-text" type="text" placeholder="Database name" value="Subscriptions">
            </div>
          </div>
          <div class="db-view-config-row">
            <div class="db-view-config-label">Description</div>
            <textarea class="db-view-config-textarea" rows="3" placeholder="Add a short description...">Recurring charges, grouped by who pays for them.</textarea>
          </div>
          <div class="db-view-config-row">
            <div class="db-view-config-label">Source folder</div>
            <div class="db-view-config-field db-view-config-field-stack">
              <input class="db-view-config-text" type="text" placeholder="Example: Projects" value="Finance/Subscriptions">
              <div class="db-view-config-help">Vault path to scan for notes. Leave empty to scan the vault root.</div>
            </div>
          </div>

          <div class="db-view-config-section-title" data-scope="view">Current view</div>
          <div class="db-view-config-row">
            <div class="db-view-config-label">View type</div>
            <div class="db-view-config-field">
              ${dropdownField("db-view-config-dropdown", "Table", I.table)}
            </div>
          </div>
          <div class="db-view-config-row">
            <div class="db-view-config-label">Enable this view's source rules</div>
            <div class="db-view-config-field">
              <input class="db-toggle-switch" type="checkbox" role="switch">
            </div>
          </div>
          <div class="db-view-config-row">
            <div class="db-view-config-label">Show icon</div>
            <div class="db-view-config-field">
              <input class="db-toggle-switch" type="checkbox" role="switch" checked>
            </div>
          </div>
          <div class="db-view-config-row">
            <div class="db-view-config-label">Row density</div>
            <div class="db-view-config-field">
              ${dropdownField("db-view-config-dropdown", "Default")}
            </div>
          </div>
          <div class="db-view-config-row">
            <div class="db-view-config-label">Date year display</div>
            <div class="db-view-config-field">
              ${dropdownField("db-view-config-dropdown", "Always")}
            </div>
          </div>
        </div>
      </div>`,
  },
  {
    id: "panel-column-manager",
    title: "Column manager",
    group: "panels",
    width: 600,
    sources: ["src/views/ColumnManagerRenderer.ts", "src/views/PropertyTypeIcon.ts"],
    note: "One row per property: drag handle, visibility checkbox, type icon, name with its frontmatter key, then wrap, edit and delete.",
    captureCss: ANCHORED_PANEL_CSS,
    html: () => {
      const row = (col, { visible = true, wrap = false, isFirst = false, isLast = false } = {}) => `
        <div class="db-column-manager-row" draggable="true">
          <span class="db-column-drag" title="Drag to reorder">⋮⋮</span>
          ${reorderControls(isFirst, isLast)}
          <input type="checkbox"${visible ? " checked" : ""}>
          <span class="db-column-type" title="${col.type}">
            <span class="db-column-type-icon">${TYPE_ICON[col.type]}</span>
          </span>
          <div class="db-column-name-wrap">
            <span class="db-column-name" title="Double-click to edit">${col.label} [${col.key}]</span>
          </div>
          <button class="clickable-icon db-column-wrap-toggle${wrap ? " is-active" : ""}">${I.wrapText}</button>
          <button class="clickable-icon">${I.edit}</button>
          <button class="clickable-icon db-column-delete-btn">${I.trash}</button>
        </div>`;
      return `
      <div class="note-database-container">
        <div class="db-column-manager" id="db-column-manager">
          <div class="db-panel-header">
            <span class="db-panel-title">Properties</span>
            <div class="db-panel-header-actions">
              <label class="db-column-manager-toggle-all"><input type="checkbox"><span>All</span></label>
            </div>
          </div>
          ${COLUMN_DEFS.map((col, i) => row(col, {
            visible: col.key !== "payment",
            wrap: col.key === "file.name",
            isFirst: i === 0,
            isLast: i === COLUMN_DEFS.length - 1,
          })).join("")}
          <div class="db-column-manager-add-row">
            <button type="button" class="db-panel-button db-column-manager-add-button">
              <span class="db-panel-button-label">+ Add property</span>
            </button>
            <button type="button" class="db-panel-button db-column-manager-add-button">
              <span class="db-panel-button-label">+ File property</span>
            </button>
          </div>
        </div>
      </div>`;
    },
  },
  {
    id: "panel-record-detail",
    title: "Record detail panel",
    group: "panels",
    width: 392,
    sources: ["src/views/RecordDetailPanel.ts", "src/views/CardFieldRenderer.ts"],
    note: "Opened from a calendar or timeline event card. Fields are click-to-edit; an empty field only appears when the view asks for empty properties.",
    // This panel is the exception in this family: nothing in the stylesheet positions it, so
    // it is already in flow here — `positionToolbarPopover` is what makes it fixed at
    // runtime. Only the 60vh cap is lifted, and the panel keeps its --db-layer-panel z-index,
    // which is what keeps it under the field editors it opens.
    captureCss: `.note-database-container .db-record-detail-panel { max-height: none !important; }`,
    html: () => {
      const row = ROWS[0];
      const field = (col, value, valueClass = "") => `
        <div class="db-record-detail-field" data-note-database-column-key="${col.key}" role="gridcell">
          <span class="db-record-detail-field-label">${col.label}</span>
          <div class="db-board-card-value${valueClass ? ` ${valueClass}` : ""}">${value}</div>
        </div>`;
      const badge = (text, tone) => `<span class="status-badge status-color-${tone}" title="${text}">${text}</span>`;
      return `
      <div class="note-database-container">
        <div class="db-record-detail-panel" role="dialog" aria-modal="true" aria-label="${row.name}">
          <div class="db-record-detail-header">
            <div class="db-record-detail-title">${row.name}</div>
            <button type="button" class="db-board-card-open" aria-label="Open note">${I.maximize2}</button>
          </div>
          <div class="db-record-detail-fields">
            ${field(COLUMN_DEFS[1], row.cost, "db-card-field-number")}
            ${field(COLUMN_DEFS[2], badge(row.cycle, "orange"))}
            ${field(COLUMN_DEFS[3], badge(row.payment, "gray"))}
            ${field(COLUMN_DEFS[4], row.renew, "db-date-value")}
            ${field(COLUMN_DEFS[5], badge(row.category, "blue"))}
            <div class="db-record-detail-field is-empty-field" data-note-database-column-key="notes" role="gridcell">
              <span class="db-record-detail-field-label">Notes</span>
              <div class="db-board-card-value db-card-empty-placeholder">Empty</div>
            </div>
          </div>
        </div>
      </div>`;
    },
  },
  {
    id: "panel-record-peek",
    title: "Table record peek",
    group: "panels",
    width: 1100,
    sources: ["src/views/TableRecordPeek.ts", "src/views/TableRenderer.ts"],
    note: "Docks against the right edge of the table it was opened from. Values are display-only text, and properties hidden from the table sit behind the disclosure.",
    // No captureCss: the peek is absolute against .note-database-container, which is
    // position: relative, so the table below gives it something real to dock against — the
    // same relationship it has in the plugin. The row count is what keeps the panel's
    // top/bottom docking taller than its own content.
    html: () => {
      const extra = [
        { name: "Dropbox", cost: "€ 119,88", cycle: "Yearly", payment: "Revolut", renew: "April 3, 2027", category: "Business" },
        { name: "1Password", cost: "€ 4,99", cycle: "Monthly", payment: "ING", renew: "March 18, 2026", category: "Personal" },
        { name: "Netflix", cost: "€ 15,99", cycle: "Monthly", payment: "ING", renew: "March 22, 2026", category: "Personal" },
        { name: "Linear", cost: "€ 96,00", cycle: "Yearly", payment: "Revolut", renew: "June 30, 2026", category: "Business" },
      ];
      const rows = [...ROWS, ...extra];
      const peekField = (key, label, value) => `
        <div class="db-record-peek-field" data-note-database-column-key="${key}">
          <span class="db-record-peek-field-label">${label}</span>
          <span class="db-record-peek-field-value">${value}</span>
        </div>`;
      return `
      <div class="note-database-container">
        <table class="db-table">
          <thead><tr>${tableHeader()}</tr></thead>
          <tbody>${rows.map((r) => `
            <tr>
              <td>${r.name}</td>
              <td>${r.cost}</td>
              <td>${pill(r.cycle, "orange")}</td>
              <td>${pill(r.payment, "gray")}</td>
              <td>${r.renew}</td>
              <td>${pill(r.category, r.category === "Business" ? "blue" : "green")}</td>
            </tr>`).join("")}</tbody>
        </table>
        <div class="db-record-peek-panel" role="dialog" aria-modal="true"
          aria-label="${ROWS[0].name}" data-note-database-row-path="Finance/Subscriptions/Figma.md">
          <div class="db-record-peek-header"><span class="db-record-peek-title">${ROWS[0].name}</span></div>
          <div class="db-record-peek-properties">
            ${peekField("cost", "Cost", ROWS[0].cost)}
            ${peekField("cycle", "Billing", ROWS[0].cycle)}
            ${peekField("payment", "Payment", ROWS[0].payment)}
            ${peekField("renew", "Next Renewal", ROWS[0].renew)}
            ${peekField("category", "Category", ROWS[0].category)}
          </div>
          <div class="db-record-peek-hidden-group">
            <button type="button" class="db-record-peek-hidden-toggle" aria-expanded="false">Hidden properties</button>
            <div class="db-record-peek-hidden-fields is-hidden" aria-hidden="true">
              ${peekField("seats", "Seats", "3")}
              ${peekField("owner", "Owner", "Michel")}
            </div>
          </div>
        </div>
      </div>`;
    },
  },
];
