// ───────────────────────────────────────────────────────────────────
// MODULE:    panels
// COMPONENT: screenshot scenarios for toolbar-anchored panels and overlays (filter, sort, view config, record detail/peek)
// ───────────────────────────────────────────────────────────────────

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

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ROWS, fieldCheckbox, glyph, optionPill, optionTone, rowCheckbox, tableHeader } from "./shared.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. ICONS
// ───────────────────────────────────────────────────────────────────

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

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

/**
 * The record's note body, as it sits under the properties.
 *
 * The inner markup is a stand-in and is worth being explicit about: at runtime Obsidian's own
 * `MarkdownRenderer` fills this element, and it has no standalone build, so nothing in this
 * repository can photograph its real output. These are the block elements it emits, hand-written,
 * which is enough to photograph the region's spacing, its separator and its type — and is not
 * evidence that a link, an embed or a task checkbox renders. That is device-verified only.
 */
const BODY_RENDERED = `
          <div class="db-record-detail-body">
            <div class="db-record-detail-body-rendered" tabindex="0">
              <h3>Cancellation</h3>
              <p>Cancel before the renewal date or it bills for another year.</p>
              <ul><li>Support answer on weekdays only</li><li>Keep the receipt</li></ul>
            </div>
          </div>`;

/** The phone sheet with its header and properties, wrapped around whichever body state is shown. */
function sheetWithBody(bodyHtml) {
  const row = ROWS[1];
  const closeGlyph = glyph('<path d="M18 6 6 18M6 6l12 12"/>');
  const field = (col, value, valueClass = "") => `
        <div class="db-record-detail-field" data-note-database-column-key="${col.key}" role="gridcell">
          <span class="db-record-detail-field-label">${col.label}</span>
          <div class="db-board-card-value${valueClass ? ` ${valueClass}` : ""}">${value}</div>
        </div>`;
  /* The panel's badge carries a `title` the table's does not, so it cannot just be `optionPill` —
     but the tone is the option's, not the panel's. A value that is purple in a table and orange in
     the panel beside it says the plugin colours by surface, which it does not: the colour comes
     from the schema and is the same everywhere the value appears. */
  const badge = (text) => `<span class="status-badge status-color-${optionTone(text)}" title="${text}">${text}</span>`;
  return `
      <div class="note-database-container db-width-default">
        <div class="db-record-detail-panel db-anchored-popover db-mobile-bottom-sheet is-visible" role="dialog" aria-modal="true" aria-label="${row.name}">
          <div class="db-mobile-bottom-sheet-handle" aria-hidden="true"></div>
          <div class="db-record-detail-header">
            <div class="db-record-detail-title">${row.name}</div>
            <button type="button" class="db-board-card-open" aria-label="Open note">${I.maximize2}</button>
            <button type="button" class="db-cell-edit-close" aria-label="Close">${closeGlyph}</button>
          </div>
          <div class="db-record-detail-fields">
            ${field(COLUMN_DEFS[1], row.cost, "db-card-field-number")}
            ${field(COLUMN_DEFS[2], badge(row.cycle))}
            ${field(COLUMN_DEFS[4], row.renew, "db-date-value")}
          </div>
${bodyHtml}
        </div>
      </div>`;
}

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

// ───────────────────────────────────────────────────────────────────
// 4. SCENARIOS
// ───────────────────────────────────────────────────────────────────

export const PANEL_SCENARIOS = [
  {
    id: "panel-filter-conditions",
    title: "Filter panel with active conditions",
    group: "panels",
    width: 600,
    fixtureOf: "constructed-filter-panel",
    sources: ["src/views/filter-panel-renderer.ts", "src/views/dropdown-field.ts"],
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
    fixtureOf: "constructed-filter-panel-nested",
    sources: ["src/views/filter-panel-renderer.ts", "src/data/view-filter-tree.ts"],
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
    fixtureOf: "constructed-sort-panel",
    sources: ["src/views/sort-panel-renderer.ts", "src/views/dropdown-field.ts"],
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
    fixtureOf: "constructed-sort-panel-calendar",
    sources: ["src/views/sort-panel-renderer.ts"],
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
    fixtureOf: "constructed-view-config",
    sources: ["src/views/view-config-panel-renderer.ts", "src/views/dropdown-field.ts"],
    note: "The top of the panel for a table view: database-scoped rows above the section divider, view-scoped rows below. Conditional formatting and status presets sit further down and are not in frame.",
    captureCss: ANCHORED_PANEL_CSS,
    html: () => `
      <div class="note-database-container">
        <div class="db-view-config-panel" id="db-view-config-panel">
          <div class="db-panel-header"><div class="db-panel-title">Settings</div></div>

          <!-- The renderer puts everything below the header in this region so a sheet can scroll it
               while the header and the grab bar above it stay put. It is inert here: the anchored
               panel is still its own scroller and this region has no overflow of its own. -->
          <div class="db-view-config-body">
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
              <input class="db-toggle-switch" type="checkbox" role="switch" aria-label="Enable this view's source rules">
            </div>
          </div>
          <div class="db-view-config-row">
            <div class="db-view-config-label">Show icon</div>
            <div class="db-view-config-field">
              <input class="db-toggle-switch" type="checkbox" role="switch" aria-label="Show icon" checked>
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
        </div>
      </div>`,
  },
  {
    id: "panel-column-manager",
    title: "Column manager",
    group: "panels",
    width: 600,
    fixtureOf: "constructed-column-manager",
    sources: ["src/views/column-manager-renderer.ts", "src/views/property-type-icon.ts"],
    note: "One row per property: drag handle, visibility checkbox, type icon, name with its frontmatter key, then wrap, edit and delete.",
    captureCss: ANCHORED_PANEL_CSS,
    html: () => {
      const row = (col, { visible = true, wrap = false, isFirst = false, isLast = false } = {}) => `
        <div class="db-column-manager-row" draggable="true">
          <span class="db-column-drag" title="Drag to reorder">⋮⋮</span>
          ${reorderControls(isFirst, isLast)}
          <input type="checkbox" class="db-checkbox db-checkbox-field"${visible ? " checked" : ""}>
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
              <label class="db-column-manager-toggle-all"><input type="checkbox" class="db-checkbox db-checkbox-field"><span>All</span></label>
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
    fixtureOf: "constructed-record-detail",
    sources: [
      "src/views/record-detail-panel.ts",
      "src/views/card-field-renderer.ts",
      "src/views/note-body-region.ts",
    ],
    note: "Opened from a calendar or timeline event card. Fields are click-to-edit; an empty field only appears when the view asks for empty properties. The note body sits last, under the properties. What is photographed there is hand-written markup standing in for Obsidian's renderer output — the real MarkdownRenderer has no standalone build, so no capture in this repository can show it.",
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
      /* The panel's badge carries a `title` the table's does not, so it cannot just be `optionPill` —
     but the tone is the option's, not the panel's. A value that is purple in a table and orange in
     the panel beside it says the plugin colours by surface, which it does not: the colour comes
     from the schema and is the same everywhere the value appears. */
  const badge = (text) => `<span class="status-badge status-color-${optionTone(text)}" title="${text}">${text}</span>`;
      return `
      <div class="note-database-container">
        <div class="db-record-detail-panel" role="dialog" aria-modal="true" aria-label="${row.name}">
          <div class="db-record-detail-header">
            <div class="db-record-detail-title">${row.name}</div>
            <button type="button" class="db-board-card-open" aria-label="Open note">${I.maximize2}</button>
          </div>
          <div class="db-record-detail-fields">
            ${field(COLUMN_DEFS[1], row.cost, "db-card-field-number")}
            ${field(COLUMN_DEFS[2], badge(row.cycle))}
            ${field(COLUMN_DEFS[3], badge(row.payment))}
            ${field(COLUMN_DEFS[4], row.renew, "db-date-value")}
            ${field(COLUMN_DEFS[5], badge(row.category))}
            <div class="db-record-detail-field is-empty-field" data-note-database-column-key="notes" role="gridcell">
              <span class="db-record-detail-field-label">Notes</span>
              <div class="db-board-card-value db-card-empty-placeholder">Empty</div>
            </div>
          </div>
          ${BODY_RENDERED}
        </div>
      </div>`;
    },
  },
  {
    id: "panel-record-detail-sheet",
    title: "Record detail — mobile bottom sheet",
    group: "panels",
    width: 402,
    capture: "viewport",
    fixtureOf: "constructed-record-detail",
    // Photographed on the phone only, for the reason the owned-menu sheet carries: the desktop pass
    // stretched a phone bottom sheet across a 1440px window the plugin never presents it in.
    devices: ["mobile"],
    sources: [
      "src/views/record-detail-panel.ts",
      "src/views/popover-position.ts",
      "src/views/card-field-renderer.ts",
      "src/views/note-body-region.ts",
    ],
    note: "The phone form of the record detail panel. positionToolbarPopover renders it as a bottom sheet with a grab handle; a permanent close button (reusing db-cell-edit-close) and drag-down on the handle dismiss it where the desktop panel relies on Escape and outside-click. Captured in viewport mode so the fixed sheet docks at the bottom. The note body is the last group, below the properties.",
    html: () => {
      const row = ROWS[1];
      const closeGlyph = glyph('<path d="M18 6 6 18M6 6l12 12"/>');
      const field = (col, value, valueClass = "") => `
        <div class="db-record-detail-field" data-note-database-column-key="${col.key}" role="gridcell">
          <span class="db-record-detail-field-label">${col.label}</span>
          <div class="db-board-card-value${valueClass ? ` ${valueClass}` : ""}">${value}</div>
        </div>`;
      /* The panel's badge carries a `title` the table's does not, so it cannot just be `optionPill` —
     but the tone is the option's, not the panel's. A value that is purple in a table and orange in
     the panel beside it says the plugin colours by surface, which it does not: the colour comes
     from the schema and is the same everywhere the value appears. */
  const badge = (text) => `<span class="status-badge status-color-${optionTone(text)}" title="${text}">${text}</span>`;
      return `
      <div class="note-database-container db-width-default">
        <div class="db-record-detail-panel db-anchored-popover db-mobile-bottom-sheet is-visible" role="dialog" aria-modal="true" aria-label="${row.name}">
          <div class="db-mobile-bottom-sheet-handle" aria-hidden="true"></div>
          <div class="db-record-detail-header">
            <div class="db-record-detail-title">${row.name}</div>
            <button type="button" class="db-board-card-open" aria-label="Open note">${I.maximize2}</button>
            <button type="button" class="db-cell-edit-close" aria-label="Close">${closeGlyph}</button>
          </div>
          <div class="db-record-detail-fields">
            ${field(COLUMN_DEFS[1], row.cost, "db-card-field-number")}
            ${field(COLUMN_DEFS[2], badge(row.cycle))}
            ${field(COLUMN_DEFS[3], badge(row.payment))}
            ${field(COLUMN_DEFS[4], row.renew, "db-date-value")}
            ${field(COLUMN_DEFS[5], badge(row.category))}
          </div>
          ${BODY_RENDERED}
        </div>
      </div>`;
    },
  },
  {
    id: "panel-record-detail-sheet-body-editing",
    title: "Record detail — note body being typed",
    group: "panels",
    width: 402,
    capture: "viewport",
    fixtureOf: "constructed-record-detail-body-editing",
    sources: ["src/views/record-detail-panel.ts", "src/views/note-body-region.ts"],
    note: "Tapping the rendered body swaps it for a textarea. The box grows to its content rather than scrolling inside itself, because the sheet is already a scroll container. What a capture cannot show is the software keyboard: the sheet lifts and shortens against --db-keyboard-inset only when one is open, and no capture has one, so this is the editor at an inset of zero. Focus and the keyboard-avoided sheet are device-verified.",
    // The height is pinned to the content because nothing runs the auto-fit here. It is the height
    // `fit()` would set at this width, so the capture shows a box that ends where its text does —
    // which is the shipped behaviour. A box that clipped its own last line would photograph a
    // defect this editor does not have.
    html: () => sheetWithBody(`
          <div class="db-record-detail-body is-editing">
            <textarea class="db-record-detail-body-editor" rows="1" style="height: 138px;">## Cancellation

Cancel before the renewal date or it bills for another year. Support answer on weekdays.</textarea>
          </div>`),
  },
  {
    id: "panel-record-detail-sheet-body-empty",
    title: "Record detail — note body not written yet",
    group: "panels",
    width: 402,
    capture: "viewport",
    fixtureOf: "constructed-record-detail-body-empty",
    sources: ["src/views/record-detail-panel.ts", "src/views/note-body-region.ts"],
    note: "A record whose note has frontmatter and nothing else. One faint line rather than an empty box: without an affordance the records most in need of a body would be exactly the ones that could not be given one.",
    html: () => sheetWithBody(`
          <div class="db-record-detail-body">
            <div class="db-record-detail-body-rendered is-empty" tabindex="0">Write a note…</div>
          </div>`),
  },
  {
    id: "panel-column-width-sheet",
    title: "Column width adjuster — mobile bottom sheet",
    group: "panels",
    width: 402,
    capture: "viewport",
    devices: ["mobile"],
    fixtureOf: "constructed-column-width-adjuster",
    // Photographed on the phone only, for the same reason the record-detail sheet is: this
    // markup is the shared bottom-sheet presentation, and the desktop pass would stretch it
    // across a window the plugin never presents it in — the desktop form is the same body inside
    // the fixed panel shape .db-mobile-column-width-panel already carries without a sheet.
    sources: ["src/views/column-width.ts", "src/views/mobile-bottom-sheet.ts", "src/views/popover-position.ts"],
    note: "The adjuster mounts through the shared sheet host (applySheetChrome, placeSheet, "
      + "attachSheetDragToDismiss) with the same panel-family body every other sheet in this file "
      + "uses: db-panel-header with a db-cell-edit-close close button, a db-panel-row holding the "
      + "shared db-view-config-range/db-view-config-number slider-and-value, and a second "
      + "db-panel-row holding the db-new-placement preset group. No explicit width is set, so Auto "
      + "is the selected preset and the field shows the column's fallback width.",
    html: () => {
      const closeGlyph = glyph('<path d="M18 6 6 18M6 6l12 12"/>');
      return `
      <div class="note-database-container db-width-default">
        <div class="db-mobile-column-width-panel db-mobile-bottom-sheet is-visible">
          <div class="db-mobile-bottom-sheet-handle" aria-hidden="true"></div>
          <div class="db-panel-header">
            <div class="db-panel-title">Adjust "Cost"</div>
            <button type="button" class="db-cell-edit-close" aria-label="Close">${closeGlyph}</button>
          </div>
          <div class="db-panel-row">
            <div class="db-view-config-range">
              <input type="range" min="60" max="360" step="1" value="150" aria-label="Adjust column width">
              <input type="number" class="db-view-config-number" inputmode="numeric" min="60" step="1" value="150" aria-label="Adjust column width">
            </div>
          </div>
          <div class="db-panel-row">
            <div class="db-new-placement" role="group" aria-label="Adjust column width">
              <button type="button" class="db-new-placement-option is-active" role="radio" aria-checked="true">Auto</button>
              <button type="button" class="db-new-placement-option" role="radio" aria-checked="false">Narrow</button>
              <button type="button" class="db-new-placement-option" role="radio" aria-checked="false">Medium</button>
              <button type="button" class="db-new-placement-option" role="radio" aria-checked="false">Wide</button>
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
    fixtureOf: "constructed-record-peek",
    // Desktop only: on touch, openTableRecordPeek now hands off to the record sheet rather than
    // opening this docked rail (table-record-peek.ts's openRecordDetail option), so a mobile
    // capture of this markup would depict a rail phones no longer get. constructed-record-peek's
    // own mobile capture already photographs the real hand-off — the record sheet, not this panel.
    devices: ["desktop"],
    sources: ["src/views/table-record-peek.ts", "src/views/table-renderer.ts"],
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
      /* `renderProperty` badges an option-typed value and writes text for everything else. The
         three option columns here take the chip; cost and the dates do not. This fixture wrote text
         for all of them, which is what the panel used to do — and since the peek docks beside the
         table, the capture showed the same value as a coloured chip in a cell and as bare text six
         inches to its right. */
      const OPTION_KEYS = new Set(["cycle", "payment", "category"]);
      const peekField = (key, label, value) => `
        <div class="db-record-peek-field" data-note-database-column-key="${key}">
          <span class="db-record-peek-field-label">${label}</span>
          <span class="db-record-peek-field-value">${OPTION_KEYS.has(key) ? optionPill(value) : value}</span>
        </div>`;
      return `
      <div class="note-database-container">
        <table class="db-table">
          <thead><tr>${tableHeader()}</tr></thead>
          <tbody>${rows.map((r) => `
            <tr>
              <!-- The select cell the header declares. Without it every body row sat one column
                   left of its own header: the name rendered inside the 76px checkbox column and
                   truncated to two characters, the cost sat under Name, and the category under
                   Next Renewal. The header comes from tableHeader(), which emits the th; these
                   rows are hand-rolled rather than built by tableRows(), and the cell was missing. -->
              <td class="db-select-col"><div class="db-select-inner">${rowCheckbox()}</div></td>
              <td>${r.name}</td>
              <td>${r.cost}</td>
              <td>${optionPill(r.cycle)}</td>
              <td>${optionPill(r.payment)}</td>
              <td>${r.renew}</td>
              <td>${optionPill(r.category)}</td>
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
  {
    id: "panel-computed-cleanup-modal",
    title: "Computed field cleanup modal",
    group: "components",
    width: 520,
    sources: ["src/views/modals/computed-frontmatter-cleanup-modal.ts"],
    // db-modal-checkbox is a factory family with a call site and a stylesheet rule and no fixture,
    // so its box was the one field-role box nothing measured. It is also the only family mounted
    // under .note-database-modal rather than .note-database-container, which is the mount point a
    // container-scoped rule cannot reach — the exact shape of the original defect.
    note: "The one checkbox family that mounts under the modal root instead of the view container. Its box must match every other field-role box.",
    html: () => {
      const option = (label, key, count, checked) => `
        <label class="db-computed-cleanup-option">
          ${checked ? fieldCheckbox("db-modal-checkbox").replace(" aria-label=", " checked aria-label=") : fieldCheckbox("db-modal-checkbox")}
          <div class="db-computed-cleanup-option-text">
            <div class="db-computed-cleanup-option-label">Field: ${label}</div>
            <div class="db-computed-cleanup-option-key">${key} — ${count} records</div>
          </div>
        </label>`;
      return `
      <div class="note-database-modal">
        <h3>Remove computed values from frontmatter</h3>
        <div class="db-modal-help">These properties are computed at render time. Their stored values can be removed.</div>
        <div class="db-computed-cleanup-list">
          ${option("Total cost", "total_cost", 24, true)}
          ${option("Days until renewal", "days_until_renewal", 24, false)}
          ${option("Monthly equivalent", "monthly_equivalent", 18, false)}
        </div>
        <div class="db-modal-actions">
          <button type="button">Cancel</button>
          <button type="button" class="mod-warning">Remove</button>
        </div>
      </div>`;
    },
  },
  {
    id: "panel-invalid-events-modal",
    title: "Invalid time events modal",
    group: "components",
    width: 1212,
    sources: ["src/views/modals/invalid-time-events-modal.ts"],
    // Two families were declared with two classes on one `cls`, and the collector that reads those
    // declarations matched a single word, so both dropped out of the coverage set entirely and
    // "no family is uncovered" was a statement about ten families rather than twelve. This is one of
    // them, and the one that carries its own placement: the box is centred in a 28px grid column
    // here and moved to a named grid area in the compact layout, neither of which any capture showed.
    note: "The select box in the invalid-events grid. It carries placement of its own — centred in the 28px lead column — on top of the shared field-role appearance. Every row is invalid, which is the only state this modal opens in: a red dot after the name, a red-bordered end input, and a span reading \"Still invalid\" rather than a duration. The phone form is the compact-and-narrow grid the modal's own ResizeObserver switches to below 1040 and 680.",
    // Every row this modal lists is invalid by definition — that is why it opened — and `renderSpan`
    // says so in three places at once: `is-invalid` on the row, on the END input, and on the span,
    // whose text becomes "Still invalid" rather than a duration. The fixture set none of them, so
    // the red dot after the name, the red-bordered end input and the red span were three states the
    // stylesheet declares and no capture had ever shown; the span instead read "-1h", a negative
    // duration the modal never writes. The quick-fix button and the sticky action bar were absent
    // as well, and the actions carry the destructive confirm this whole surface leads to.
    //
    // The two layout classes come from a ResizeObserver on the MODAL, at 1040 and 680, so they
    // cannot be inferred from the markup and must not be inferred from the capture box either. The
    // host is `width: min(1180px, 100vw - 24px)` on a desktop, which is 1180 and therefore neither
    // compact nor narrow; on a phone the fullscreen presentation makes it the 402px viewport, which
    // is both. Reading the capture box instead put the desktop shot in the compact layout, whose
    // header is `display: none` — and a hidden header is a select-all checkbox measuring 0x0, which
    // the placement lane correctly read as a second box for one role.
    //
    // The declared width is that 1180 plus the 16px the capture box frames it with on each side. At
    // 860 the phone capture photographed the desktop five-column grid and pushed End and Span off
    // the frame, which is the one thing a mobile capture of this surface exists to answer.
    html: (device) => {
      const narrow = device?.id === "mobile";
      const row = (name, start, end) => `
        <div class="db-invalid-event-row is-invalid">
          ${fieldCheckbox("db-modal-checkbox db-invalid-event-select").replace(" aria-label=", " checked aria-label=")}
          <div class="db-invalid-event-name" title="Timeline/${name}.md">${name}</div>
          <div class="db-invalid-event-time-field is-start">
            <span class="db-invalid-event-time-label">Start</span>
            <input type="datetime-local" class="db-invalid-event-datetime" value="${start}">
          </div>
          <div class="db-invalid-event-time-field is-end">
            <span class="db-invalid-event-time-label">End</span>
            <input type="datetime-local" class="db-invalid-event-datetime is-invalid" value="${end}">
          </div>
          <div class="db-invalid-event-span-cell">
            <span class="db-invalid-event-span is-invalid">Still invalid</span>
            <button type="button" class="db-invalid-event-row-fix" title="Quick fix selected">Fix</button>
          </div>
        </div>`;
      return `
      <div class="note-database-modal db-invalid-events-modal${narrow ? " is-invalid-events-compact is-invalid-events-narrow" : ""}">
        <h3>Invalid time events (3)</h3>
        <div class="db-modal-help">These events end at or before they start and are hidden from the timeline. Adjust start/end so end is after start.</div>
        <div class="db-invalid-event-grid">
          <div class="db-invalid-event-grid-header">
            ${fieldCheckbox("db-modal-checkbox db-invalid-event-select").replace(" aria-label=", " checked aria-label=")}
            <div class="db-invalid-event-col-note">Note</div>
            <div class="db-invalid-event-col-time">Start</div>
            <div class="db-invalid-event-col-time">End</div>
            <div class="db-invalid-event-col-span">Span</div>
          </div>
          ${row("Design review", "2026-03-04T14:00", "2026-03-04T13:00")}
          ${row("Quarterly planning", "2026-03-11T09:30", "2026-03-11T09:00")}
          ${row("Retrospective", "2026-03-18T16:00", "2026-03-18T15:15")}
        </div>
        <div class="db-invalid-event-actions">
          <div class="db-invalid-event-bulk-actions">
            <button type="button">Quick fix selected</button>
            <span class="db-invalid-event-selected-count">3 selected</span>
          </div>
          <div class="db-modal-actions">
            <button type="button">Cancel</button>
            <button type="button" class="mod-warning">Save changes</button>
          </div>
        </div>
      </div>`;
    },
  },
  {
    id: "panel-base-import-modal",
    title: "Base import confirm modal",
    group: "components",
    width: 760,
    sources: ["src/views/modals/base-import-confirm-modal.ts"],
    // The second of the two families the single-word collector dropped. It sits in a table cell
    // rather than a grid column, which is why both are captured: one family, two placements, and
    // the shared appearance has to survive each.
    note: "The include box in the base-import column table. Same field role as every other modal box, mounted in a centred table cell.",
    html: () => {
      const box = (checked) => (checked
        ? fieldCheckbox("db-modal-checkbox base-import-include-checkbox").replace(" aria-label=", " checked aria-label=")
        : fieldCheckbox("db-modal-checkbox base-import-include-checkbox"));
      const row = (key, label, type, count, checked, excluded) => `
        <tr${excluded ? ' class="base-import-excluded"' : ""}>
          <td>${key}</td>
          <td><input type="text" value="${label}"></td>
          <td class="base-import-type-cell">${type}</td>
          <td>${count}</td>
          <td class="base-import-check-cell">${box(checked)}</td>
        </tr>`;
      return `
      <div class="note-database-modal">
        <h3>Import 4 columns from base</h3>
        <div class="db-modal-help">Choose which columns to bring in and confirm the type inferred for each.</div>
        <table class="base-import-table">
          <thead>
            <tr>
              <th>Key</th><th>Label</th><th>Inferred type</th><th>Files</th>
              <th class="base-import-check-cell">${box(true)}</th>
            </tr>
          </thead>
          <tbody>
            ${row("cost", "Cost", "Number", 24, true, false)}
            ${row("renews", "Renews", "Date", 24, true, false)}
            ${row("payment", "Payment", "Select", 18, false, true)}
            ${row("notes", "Notes", "Text", 6, false, false)}
          </tbody>
        </table>
      </div>`;
    },
  },
];
