// ───────────────────────────────────────────────────────────────────
// MODULE:    chrome
// COMPONENT: screenshot scenarios for application chrome (toolbar, footer, group/summary rows, chart popover)
// ───────────────────────────────────────────────────────────────────

/**
 * Application chrome: the toolbar and everything the toolbar hangs off.
 *
 * Every class here was read out of the renderer that emits it — ToolbarRenderer,
 * ActiveViewControlsRenderer, ActiveRulePopoverRenderer, TableFooterRenderer,
 * GroupLabelRenderer, SummaryRenderer and the two chart renderers — and the nesting mirrors
 * the real tree, because several rules are descendant- or child-scoped (`.db-panel-row
 * .db-panel-dropdown`, `.db-grouped-table tr.db-group-divider-row`) and match nothing when
 * the structure is flattened.
 *
 * Two surfaces here are drawn by JavaScript at runtime rather than by the stylesheet: the
 * Lucide icons the plugin injects with `setIcon`, stood in for by hand-written SVG at the
 * size the stylesheet gives them, and the Chart.js canvas, which no stylesheet can produce.
 * See `chrome-chart-empty` for what is captured instead of a fabricated chart body.
 */

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ROWS, ICONS, boardSubgroupHeader, dots, galleryGroupHeader, glyph, listGroupHeader,
  pill, rowCheckbox } from "./shared.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. ICONS
// ───────────────────────────────────────────────────────────────────

/* Stand-ins for the Lucide icons `setIcon` injects at runtime, named after the icon each
   renderer actually asks for so a drifting call site is easy to spot. The stylesheet sizes
   them (19px in a toolbar button, 14px on a view tab, 13px on a chip), so the intrinsic
   size below only matters where no rule applies. */
const I = {
  listFilter: glyph('<path d="M3 6h18M7 12h10M10 18h4"/>'),
  arrowUpDown: glyph('<path d="m21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16"/>'),
  group: glyph('<rect x="3" y="4" width="18" height="6" rx="1"/><rect x="3" y="14" width="18" height="6" rx="1"/>'),
  columns3: glyph('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/>'),
  moreHorizontal: glyph('<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'),
  search: glyph('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  plus: glyph('<path d="M5 12h14M12 5v14"/>'),
  chevronDown: glyph('<path d="m6 9 6 6 6-6"/>'),
  chevronRight: glyph('<path d="m9 18 6-6-6-6"/>'),
  table: glyph('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>'),
  layoutGrid: glyph('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'),
  image: glyph('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>'),
  barChart: glyph('<path d="M12 20V10M18 20V4M6 20v-4"/>'),
  arrowUp: glyph('<path d="m5 12 7-7 7 7M12 19V5"/>'),
  arrowDown: glyph('<path d="M12 5v14M19 12l-7 7-7-7"/>'),
  layers: glyph('<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/>'),
  trendingUp: glyph('<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
  eyeOff: glyph('<path d="M9.9 4.2A9 9 0 0 1 21 12a17 17 0 0 1-2.2 3M6.6 6.6A17 17 0 0 0 3 12a9 9 0 0 0 12.5 5.4"/><path d="m2 2 20 20"/>'),
  download: glyph('<path d="M12 3v12M7 12l5 5 5-5"/><path d="M4 21h16"/>'),
  copy: glyph('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
  /* The destructive row's icon. `ColumnMenu` builds that row with `icon: "trash"` and this file had
     no trash glyph, so the fixture drew the row bare — a picture of a row the renderer does not
     make, and one that quietly exercised the icon-less alignment path on a menu that never has one. */
  trash: glyph('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
  listChecks: glyph('<path d="M11 6h10M11 12h10M11 18h10"/><path d="m3 7 2 2 3-3"/>'),
  palette: glyph('<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20 2 2 0 0 0 2-2v-1a2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 10 10 0 0 0-10-11Z"/>'),
  paintBucket: glyph('<path d="m5 11 8-8 8 8-8 8-8-8Z"/><path d="M5 11h16"/><path d="M20 17a2 2 0 1 1-4 0c0-1.1 2-3 2-3s2 1.9 2 3Z"/>'),
  paintbrush: glyph('<path d="M18 3a3 3 0 0 1 3 3c0 3-4 5-7 8"/><path d="M9 14a3 3 0 0 1 3 3c0 2-2 4-5 4H3c1-2 2-3 2-5a3 3 0 0 1 4-2Z"/>'),
  textCursor: glyph('<path d="M5 4h4M5 20h4M7 4v16"/><rect x="12" y="7" width="9" height="10" rx="1"/>'),
  grip: glyph('<circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>'),
};

/* `createIconButton` builds `button.db-toolbar-icon-button` with the extra classes the call
   site passes; `setBadge`/`setHiddenBadge` append the count span inside the same button. */
const iconButton = (icon, label, extra = "", badgeHtml = "") => `
  <button type="button" class="db-toolbar-icon-button${extra ? ` ${extra}` : ""}" aria-label="${label}">${icon}${badgeHtml}</button>`;

const badge = (text) => `<span class="db-toolbar-badge">${text}</span>`;
const neutralBadge = (text) => `<span class="db-toolbar-badge db-toolbar-badge-neutral">${text}</span>`;

const viewTab = (name, icon, active) => `
  <button type="button" class="db-view-tab${active ? " is-active" : ""}" role="tab"
    aria-selected="${active ? "true" : "false"}" tabindex="${active ? "0" : "-1"}">
    <span class="db-view-tab-icon">${icon}</span>
    <span class="db-view-tab-name">${name}</span>
  </button>`;

/* `renderSearch` leaves the wrap collapsed to 28px until it has text or focus; `is-active`
   is the widened state, so both are shown where the point is the control itself. */
const searchControl = (active) => `
  <div class="db-search-control${active ? " is-active" : ""}">
    <button type="button" class="db-search-button" aria-label="Search">${I.search}</button>
    <div class="db-search-input-wrap">
      <input type="text" class="db-search-input" placeholder="Search" aria-label="Search"${active ? ' value="notion"' : ""}>
      <span class="db-search-activity-pulse" aria-hidden="true"></span>
    </div>
    <button type="button" class="db-search-clear" aria-label="Clear search"${active ? "" : " hidden"}>×</button>
  </div>`;

const newButtonGroup = () => `
  <div class="db-new-button-group">
    <button type="button" class="db-new-button db-new-button-primary" aria-label="New">
      <span class="db-new-button-icon">${I.plus}</span><span>New</span>
    </button>
    <button type="button" class="db-new-button-dropdown" aria-label="Choose a template">${I.chevronDown}</button>
  </div>`;

/* The right half of the toolbar: four clusters in the order ToolbarRenderer creates them,
   with the search control inside the utilities cluster where it lands on desktop. */
const toolbarRight = () => `
  <div class="db-toolbar-right">
    <div class="db-toolbar-cluster db-toolbar-query-cluster" aria-label="Query controls">
      ${iconButton(I.listFilter, "Filter", "db-filter-btn db-toolbar-badge-button", badge("2"))}
      ${iconButton(I.arrowUpDown, "Sort", "db-sort-btn db-toolbar-badge-button", badge("1"))}
      ${iconButton(I.group, "Group", "db-group-btn is-active")}
    </div>
    <div class="db-toolbar-cluster db-toolbar-properties-cluster" aria-label="Properties">
      ${iconButton(I.columns3, "Properties", "db-col-manager-btn db-toolbar-badge-button", neutralBadge("2 hidden"))}
    </div>
    <div class="db-toolbar-cluster db-toolbar-utilities-cluster" aria-label="More tools">
      ${iconButton(I.moreHorizontal, "More tools", "db-toolbar-more-btn")}
      ${searchControl(false)}
    </div>
    <div class="db-toolbar-cluster db-toolbar-creation-cluster">
      ${newButtonGroup()}
    </div>
  </div>`;

/* A full-width table header/body, including the utility columns the footer aligns to: the
   selection column on the left and the add-column gutter on the right. Without them the
   footer's own utility cells would be one column out of step with the header. */
const FOOTER_COLUMNS = [
  { key: "name", label: "Name", icon: "file-text" },
  { key: "cost", label: "Cost", icon: "hash" },
  { key: "billing", label: "Billing", icon: "circle-dot" },
  { key: "payment", label: "Payment", icon: "circle-dot" },
  { key: "renew", label: "Next Renewal", icon: "calendar" },
];

const utilityHeader = () => `
  <th class="db-select-col" role="columnheader"><div class="db-select-inner"><input type="checkbox" class="db-checkbox db-checkbox-row"></div></th>`;

const utilityCell = () => `
  <td class="db-select-col"><div class="db-select-inner">
    <button type="button" class="db-table-row-drag-handle" aria-label="Drag to sort">${I.grip}</button>
    <input type="checkbox" class="db-checkbox db-checkbox-row">
  </div></td>`;

/* The table is `table-layout: fixed`, and the plugin sizes its columns through a colgroup
   built at runtime from the stored widths. With no colgroup the fixed layout has nothing to
   divide and the table resolves to a runaway width large enough to take the browser down,
   so the fixture supplies one the same way the renderer does. */
const fullColgroup = () => `
  <colgroup>
    <col class="db-select-colgroup">
    ${FOOTER_COLUMNS.map(() => `<col style="width:150px">`).join("")}
    <col style="width:44px">
  </colgroup>`;

const fullHeader = () => `
  ${fullColgroup()}
  <thead><tr role="row">
    ${utilityHeader()}
    ${FOOTER_COLUMNS.map((c) => `
      <th role="columnheader" data-note-database-column-key="${c.key}"><div class="db-th-content">
        <span class="db-property-icon">${ICONS[c.icon]}</span>
        <span class="db-th-label">${c.label}</span>
        <button type="button" class="db-column-menu-trigger" aria-label="Open ${c.label} menu">${dots}</button>
      </div></th>`).join("")}
    <th class="db-add-column-th" role="columnheader">
      <button type="button" class="db-add-column-button" aria-label="Add property">${I.plus}</button>
    </th>
  </tr></thead>`;

const fullRow = (r) => `
  <tr role="row" data-note-database-row-path="Subscriptions/${r.name}.md">
    ${utilityCell()}
    <td data-note-database-column-key="name">${r.name}</td>
    <td data-note-database-column-key="cost">${r.cost}</td>
    <td data-note-database-column-key="billing">${pill(r.cycle, "orange")}</td>
    <td data-note-database-column-key="payment">${pill(r.payment, "gray")}</td>
    <td data-note-database-column-key="renew">${r.renew}</td>
    <td class="db-add-column-cell" aria-hidden="true"></td>
  </tr>`;

/* `TableFooterRenderer` stacks a kind label over its result inside one trigger, and repeats
   the pair when a column carries several summary rules. */
const footerCell = (key, values) => `
  <td class="db-table-footer-cell" data-note-database-column-key="${key}">
    <button type="button" class="db-table-footer-trigger${values.length ? " has-calculation" : ""}"
      aria-label="Calculate for ${key}">
      ${values.length
        ? values.map(([kind, result]) => `<span class="db-table-footer-value">
            <span class="db-table-footer-kind">${kind}</span>
            <span class="db-table-footer-result">${result}</span>
          </span>`).join("")
        : `<span class="db-table-footer-calculate-hint">+ Calculate</span>`}
    </button>
  </td>`;

/* `renderGroupLabel` puts a colored `.status-badge` inside the title span for option-typed
   group fields, and plain text for everything else. Both are shown. */
const groupDividerRow = (title, field, count, badgeTone, summaries, depth = 0) => `
  <tr class="db-group-divider-row db-group-header${depth ? ` db-group-header--depth-${depth}` : ""}"
    data-note-database-group-key="${title}" data-note-database-group-field="${field}"
    ${depth ? `style="--db-group-depth:${depth}"` : ""}>
    <td colspan="7">
      <div class="db-group-divider-content">
        <input type="checkbox" class="db-checkbox db-checkbox-row db-group-divider-checkbox" aria-label="Select rows">
        <span class="db-group-header-label">
          <button type="button" class="db-group-collapse-toggle" aria-label="Collapse" aria-expanded="true">
            <span class="db-collapse-triangle"></span>
          </button>
          <span class="db-group-title-text">${badgeTone ? pill(title, badgeTone) : title}</span>
          <span class="db-group-count">${count}</span>
        </span>
        <div class="db-group-divider-summaries">
          ${summaries.map(([label, value]) => `
            <span class="db-group-summary-item">
              <span class="db-group-summary-label">${label}</span>
              <span class="db-group-summary-value">${value}</span>
            </span>`).join("")}
        </div>
      </div>
    </td>
  </tr>`;

/* A `db-panel-row` inside the active-rule popover: two or three dropdown fields, no remove
   button (`renderSingleRuleEditor` passes `showRemove: false`). */
const panelDropdown = (extraClass, value, icon) => `
  <button type="button" class="db-dropdown-field db-panel-dropdown ${extraClass}${icon ? " has-current-icon" : ""}"
    aria-haspopup="listbox" aria-expanded="false">
    <span class="db-dropdown-field-icon">${icon ? `<span class="db-dropdown-option-type-icon">${icon}</span>` : ""}</span>
    <div class="db-dropdown-field-text"><span class="db-dropdown-field-value">${value}</span></div>
    <span class="db-dropdown-field-chevron">${I.chevronDown}</span>
  </button>`;

/* Every panel in the plugin is `position: absolute` against a toolbar anchor that a
   screenshot has no equivalent of, so each one is put back in flow to be photographed. The
   height cap is lifted with it: it is measured against the viewport, and a 600px-tall
   capture would scroll the panel instead of showing all of it. Width is deliberately left
   alone so the shot still reports the width the stylesheet gives the panel. */
const IN_FLOW_PANEL = `position: static !important; top: auto !important; right: auto !important;
  left: auto !important; max-height: none !important;`;

const chartOptionsRow = {
  select: (label, value, icon) => `
    <button type="button" class="db-dropdown-field db-chart-options-row db-chart-options-select-row"
      aria-haspopup="listbox" aria-expanded="false">
      <span class="db-dropdown-field-icon">${icon}</span>
      <div class="db-dropdown-field-text">
        <span class="db-dropdown-field-label">${label}</span>
        <span class="db-dropdown-field-value">${value}</span>
      </div>
      <span class="db-dropdown-field-chevron">${I.chevronDown}</span>
    </button>`,
  entry: (label, value, icon) => `
    <button type="button" class="db-chart-options-row db-chart-options-popover-entry">
      <span class="db-chart-options-row-icon">${icon}</span>
      <div class="db-chart-options-row-text">
        <span class="db-chart-options-label">${label}</span>
        <span class="db-chart-options-value">${value}</span>
      </div>
      <span class="db-chart-options-chevron">${I.chevronRight}</span>
    </button>`,
  toggle: (label, icon, checked) => `
    <div class="db-chart-options-row db-chart-options-switch">
      <span class="db-chart-options-row-icon">${icon}</span>
      <div class="db-chart-options-row-text"><span class="db-chart-options-label">${label}</span></div>
      <input type="checkbox" class="db-toggle-switch" role="switch" aria-label="${label}"${checked ? " checked" : ""}>
    </div>`,
  text: (label, placeholder, icon) => `
    <div class="db-chart-options-row db-chart-options-title-row">
      <span class="db-chart-options-row-icon">${icon}</span>
      <div class="db-chart-options-row-text">
        <span class="db-chart-options-label">${label}</span>
        <input type="text" class="db-chart-options-text-input" placeholder="${placeholder}" aria-label="${label}">
      </div>
      <span></span>
    </div>`,
  exportAction: (label, icon) => `
    <button type="button" class="db-chart-options-row db-chart-options-export">
      <span class="db-chart-options-row-icon">${icon}</span>
      <div class="db-chart-options-row-text"><span class="db-chart-options-label">${label}</span></div>
      <span></span>
    </button>`,
};

// ───────────────────────────────────────────────────────────────────
// 3. SCENARIOS
// ───────────────────────────────────────────────────────────────────

export const CHROME_SCENARIOS = [
  {
    id: "chrome-toolbar",
    title: "Main toolbar",
    group: "components",
    width: 1100,
    sources: ["src/views/toolbar-renderer.ts"],
    note: "View switcher on the left; query, properties, utilities and creation clusters on the right. The search control sits collapsed in the utilities cluster until it has text or focus.",
    html: () => `
      <div class="note-database-container">
        <div class="db-header">
          <div class="db-toolbar">
            <div class="db-toolbar-left">
              <div class="db-view-tabs" role="tablist" aria-label="View switcher">
                ${viewTab("All subscriptions", I.table, true)}
                ${viewTab("By category", I.layoutGrid, false)}
                ${viewTab("Covers", I.image, false)}
                <button type="button" class="db-view-tab db-view-tab-add" aria-label="Add view"
                  aria-haspopup="dialog" aria-expanded="false">${I.plus}</button>
              </div>
            </div>
            ${toolbarRight()}
          </div>
        </div>
      </div>`,
  },
  {
    id: "chrome-view-switcher",
    title: "View switcher tablist",
    group: "components",
    width: 760,
    sources: ["src/views/toolbar-renderer.ts"],
    note: "The active tab carries is-active; the ⋯ tab appears only once the toolbar has measured tabs out of view, and opens the all-views hub.",
    html: () => `
      <div class="note-database-container">
        <div class="db-header">
          <div class="db-toolbar">
            <div class="db-toolbar-left">
              <div class="db-view-tabs" role="tablist" aria-label="View switcher">
                ${viewTab("All subscriptions", I.table, true)}
                ${viewTab("By category", I.layoutGrid, false)}
                ${viewTab("Covers", I.image, false)}
                ${viewTab("Spend", I.barChart, false)}
                <button type="button" class="db-view-tab db-view-tab-more" aria-label="2 more views"
                  aria-haspopup="dialog" aria-expanded="false"><span>⋯</span></button>
                <button type="button" class="db-view-tab db-view-tab-add" aria-label="Add view"
                  aria-haspopup="dialog" aria-expanded="false">${I.plus}</button>
              </div>
            </div>
          </div>
        </div>
      </div>`,
  },
  {
    id: "chrome-toolbar-search",
    title: "Toolbar search, collapsed and expanded",
    group: "components",
    width: 340,
    sources: ["src/views/toolbar-renderer.ts"],
    note: "The wrap is 28px wide at rest and widens to 150px under is-active; the clear button is hidden until the input has text.",
    html: () => `
      <div class="note-database-container">
        <div class="db-header"><div class="db-toolbar">
          <div class="db-toolbar-right">
            <div class="db-toolbar-cluster db-toolbar-utilities-cluster" aria-label="More tools">
              ${searchControl(false)}
              ${searchControl(true)}
            </div>
          </div>
        </div></div>
      </div>`,
  },
  {
    id: "chrome-active-view-controls",
    title: "Active filter and sort chips",
    group: "components",
    width: 900,
    sources: ["src/views/active-view-controls-renderer.ts"],
    note: "The rail lives in the header below the toolbar. Sort chips come first and carry their position as a superscript; the AND button between the groups toggles filter logic.",
    html: () => {
      const chip = (kind, icon, field, detail, order) => `
        <div class="db-active-control-chip is-${kind}" data-active-rule-key="${kind}:0">
          <button type="button" class="db-active-control-edit" title="${field} · ${detail}" aria-label="${field} · ${detail}">
            <span class="db-active-control-icon">${icon}${order ? `<span class="db-active-control-order">${order}</span>` : ""}</span>
            <span class="db-active-control-field">${field}</span>
            <span class="db-active-control-detail">${detail}</span>
          </button>
          <button type="button" class="db-active-control-remove" aria-label="Delete ${kind}">×</button>
        </div>`;
      return `
      <div class="note-database-container">
        <div class="db-header">
          <div class="db-active-view-controls" aria-label="Filter / Sort">
            <div class="db-active-view-controls-scroll">
              <div class="db-active-control-group is-sort" aria-label="Sort">
                ${chip("sort", I.arrowDown, "Cost", "Descending", "1")}
                ${chip("sort", I.arrowUp, "Next Renewal", "Ascending", "2")}
              </div>
              <div class="db-active-control-group is-filter" aria-label="Filter">
                <button type="button" class="db-active-control-logic" title="AND (all)" aria-label="AND (all)">AND</button>
                ${chip("filter", I.listFilter, "Category", "equals · Business", "")}
                ${chip("filter", I.listFilter, "Payment", "equals · Revolut", "")}
              </div>
            </div>
            <button type="button" class="db-active-view-controls-clear" aria-label="Clear all">Clear all</button>
          </div>
        </div>
      </div>`;
    },
  },
  {
    id: "chrome-active-rule-popover-filter",
    title: "Active rule popover — filter",
    group: "components",
    width: 620,
    sources: ["src/views/active-rule-popover-renderer.ts", "src/views/filter-panel-renderer.ts"],
    note: "Editing one chip opens the filter panel's single-rule editor: field, operator and value, with no remove button.",
    // Anchored to the chip that opened it, so it leaves the flow and the capture box collapses.
    captureCss: `.note-database-container .db-active-rule-popover { ${IN_FLOW_PANEL} }`,
    html: () => `
      <div class="note-database-container">
        <div class="db-active-rule-popover db-filter-panel is-filter" role="dialog" aria-label="Filter">
          <div class="db-panel-row db-active-rule-editor-row">
            ${panelDropdown("db-filter-field-dropdown", "Category", ICONS["circle-dot"])}
            ${panelDropdown("db-filter-operator-dropdown", "equals", "")}
            ${panelDropdown("db-filter-value-dropdown", "Business", "")}
          </div>
        </div>
      </div>`,
  },
  {
    id: "chrome-active-rule-popover-sort",
    title: "Active rule popover — sort",
    group: "components",
    width: 480,
    sources: ["src/views/active-rule-popover-renderer.ts", "src/views/sort-panel-renderer.ts"],
    note: "The sort variant adds db-sort-panel and drops the drag handle and reorder buttons the full panel shows.",
    captureCss: `.note-database-container .db-active-rule-popover { ${IN_FLOW_PANEL} }`,
    html: () => `
      <div class="note-database-container">
        <div class="db-active-rule-popover db-filter-panel db-sort-panel is-sort" role="dialog" aria-label="Sort">
          <div class="db-panel-row db-sort-rule-row db-active-rule-editor-row">
            ${panelDropdown("db-sort-field-dropdown", "Cost", ICONS.hash)}
            ${panelDropdown("db-sort-direction-dropdown", "Descending", "")}
          </div>
        </div>
      </div>`,
  },
  {
    id: "chrome-table-footer",
    title: "Table footer aggregates",
    group: "components",
    width: 1100,
    sources: ["src/views/table-footer-renderer.ts", "src/views/table-renderer.ts"],
    note: "A column with summary rules stacks each kind over its result; a column without one shows a + Calculate hint that the stylesheet keeps at zero opacity until the trigger is hovered, so it is invisible here by design.",
    html: () => `
      <div class="note-database-container">
        <div class="db-table-wrap">
          <table class="db-table" role="grid">
            ${fullHeader()}
            <tbody>${ROWS.map(fullRow).join("")}</tbody>
            <tfoot class="db-table-footer">
              <tr class="db-table-footer-row">
                <td class="db-table-footer-utility"></td>
                ${footerCell("name", [["Count", "5"]])}
                ${footerCell("cost", [["Sum", "191,75"], ["Average", "38,35"]])}
                ${footerCell("billing", [])}
                ${footerCell("payment", [["Unique", "3"]])}
                ${footerCell("renew", [["Earliest", "2026-03-02"]])}
                <td class="db-table-footer-add-column"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`,
  },
  {
    id: "chrome-group-header-row",
    title: "Grouped table header rows",
    group: "components",
    width: 1100,
    sources: ["src/views/group-label-renderer.ts", "src/views/table-renderer.ts", "src/views/summary-renderer.ts"],
    note: "An option-typed group field renders its key as a colored status badge; a field with no options renders plain text, as the nested Revolut subgroup does. Per-group summaries sit at the right of each divider.",
    html: () => {
      const business = ROWS.filter((r) => r.category === "Business");
      const personal = ROWS.filter((r) => r.category === "Personal");
      return `
      <div class="note-database-container">
        <div class="db-grouped-table">
          <div class="db-table-wrap">
            <table class="db-table" role="grid">
              ${fullHeader()}
              <tbody>
                ${groupDividerRow("Business", "category", business.length, "blue", [["Cost Sum", "177,50"], ["Cost Average", "59,17"]])}
                ${groupDividerRow("Revolut", "payment", business.length, "", [["Cost Sum", "177,50"]], 1)}
                ${business.map(fullRow).join("")}
                ${groupDividerRow("Personal", "category", personal.length, "green", [["Cost Sum", "14,25"], ["Cost Average", "7,13"]])}
                ${personal.map(fullRow).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
    },
  },
  {
    id: "chrome-summary-row",
    title: "Summary row",
    group: "components",
    width: 760,
    sources: ["src/views/summary-renderer.ts"],
    note: "Total is always present; each configured summary rule is a draggable, clickable item, and the faint + Summary entry adds another.",
    html: () => `
      <div class="note-database-container">
        <div class="db-summary">
          <div class="db-summary-item"><div class="label">Total</div><span class="value">5</span></div>
          <div class="db-summary-item db-summary-sum-item db-summary-draggable" data-summary-rule-index="0">
            <div class="label">Cost Sum</div><span class="value">191,75</span>
          </div>
          <div class="db-summary-item db-summary-sum-item db-summary-draggable" data-summary-rule-index="1">
            <div class="label">Cost Average</div><span class="value">38,35</span>
          </div>
          <div class="db-summary-item db-summary-sum-item db-summary-draggable" data-summary-rule-index="2">
            <div class="label">Payment Count</div><span class="value">5</span>
          </div>
          <div class="db-summary-item db-summary-sum-hint"><span class="value">+ Summary</span></div>
        </div>
      </div>`,
  },
  {
    id: "chrome-chart-options-popover",
    title: "Chart options popover",
    group: "components",
    width: 620,
    sources: ["src/views/chart-toolbar-renderer.ts"],
    note: "What the chart view uses instead of a toolbar of its own: the chart-options button in the toolbar opens this panel. Every row is a 18px/1fr/16px grid, so selects, switches, drill-in entries and export buttons line up on one set of columns.",
    captureCss: `.note-database-container .db-chart-options-popover { ${IN_FLOW_PANEL} }`,
    html: () => `
      <div class="note-database-container">
        <div class="db-chart-options-popover">
          <div class="db-panel-header"><div class="db-panel-title">Chart options</div></div>
          <div class="db-chart-options-section">
            <div class="db-chart-options-section-title"><span>Data</span></div>
            ${chartOptionsRow.select("Type", "Bar", I.barChart)}
            ${chartOptionsRow.select("Group", "Category", I.group)}
            ${chartOptionsRow.select("Subgroup", "Billing", I.layers)}
            ${chartOptionsRow.entry("Value", "Sum · Cost", ICONS.hash)}
            ${chartOptionsRow.select("Sort", "Value descending", I.arrowUpDown)}
            ${chartOptionsRow.toggle("Omit zero values", I.eyeOff, false)}
            ${chartOptionsRow.toggle("Cumulative", I.trendingUp, true)}
          </div>
          <div class="db-chart-options-section">
            <div class="db-chart-options-section-title"><span>Visible groups</span></div>
            ${chartOptionsRow.entry("Groups", "2/3", I.listChecks)}
          </div>
          <div class="db-chart-options-section">
            <div class="db-chart-options-section-title"><span>Style</span></div>
            ${chartOptionsRow.select("Colors", "Auto", I.palette)}
            ${chartOptionsRow.toggle("Color by value", I.paintBucket, false)}
            ${chartOptionsRow.entry("Customize", "", I.paintbrush)}
            ${chartOptionsRow.text("Title", "Sum of Cost by Category", I.textCursor)}
          </div>
          <div class="db-chart-options-section">
            <div class="db-chart-options-section-title"><span>Export</span></div>
            ${chartOptionsRow.exportAction("Export PNG", I.download)}
            ${chartOptionsRow.exportAction("Copy PNG", I.copy)}
          </div>
        </div>
      </div>`,
  },
  {
    id: "chrome-chart-number",
    title: "Chart view — single number",
    group: "components",
    width: 900,
    sources: ["src/views/chart-renderer.ts"],
    note: "The one chart type the stylesheet draws in full: renderNumber writes three divs and no canvas, so this is the only plotted chart a screenshot can show. The height class is what sizes it.",
    html: () => `
      <div class="note-database-container">
        <div class="db-chart-number db-chart-height-medium">
          <div class="db-chart-number-label">Sum of Cost</div>
          <div class="db-chart-number-value">191,75</div>
          <div class="db-chart-number-caption">Single number</div>
        </div>
      </div>`,
  },
  {
    id: "chrome-chart-empty",
    title: "Chart view — empty state",
    group: "components",
    width: 900,
    sources: ["src/views/chart-renderer.ts"],
    note: "Every other chart type is a Chart.js canvas painted at runtime, so this recovery state and the single-number chart are what a capture can show of the chart body.",
    html: () => `
      <div class="note-database-container">
        <div class="db-chart-empty db-chart-height-medium">
          <div class="db-chart-empty-icon">${I.barChart}</div>
          <div class="db-chart-empty-text">All chart groups are hidden. Show at least one group in Chart options.</div>
          <button type="button" class="db-chart-empty-action">Show all groups</button>
        </div>
      </div>`,
  },
  {
    id: "chrome-owned-menu",
    title: "Owned menu — the shell every context menu uses",
    group: "components",
    width: 420,
    sources: ["src/views/owned-menu.ts", "src/views/menu-row.ts"],
    note: "Deliberately not wrapped in note-database-container: this menu mounts on document.body, so a fixture that wrapped it would photograph a surface the plugin never ships. Chromed from Obsidian's own menu variables so it matches the app's real menus and follows a theme that restyles them.",
    html: () => `
      <div class="db-surface db-menu db-owned-menu" role="menu" tabindex="-1">
        <div class="db-menu-section">Column</div>
        <button type="button" class="db-menu-item" aria-checked="false">
          <span class="db-menu-item-icon">${I.arrowUpDown}</span>
          <span class="db-menu-item-label">Sort ascending</span>
        </button>
        <button type="button" class="db-menu-item" aria-checked="true">
          <span class="db-menu-item-icon">${I.listFilter}</span>
          <span class="db-menu-item-label">Filter on this column</span>
        </button>
        <button type="button" class="db-menu-item" aria-checked="false" aria-haspopup="true" aria-expanded="false">
          <span class="db-menu-item-icon">${I.columns3}</span>
          <span class="db-menu-item-label">Property type</span>
          <span class="db-menu-item-current">Select</span>
          <span class="db-menu-item-chevron">${I.chevronRight}</span>
        </button>
        <div class="db-menu-separator" role="separator"></div>
        <button type="button" class="db-menu-item" aria-checked="false" disabled aria-disabled="true">
          <span class="db-menu-item-icon">${I.group}</span>
          <span class="db-menu-item-label">Group by this column</span>
        </button>
        <button type="button" class="db-menu-item is-warning" aria-checked="false">
          <span class="db-menu-item-label">Delete property</span>
        </button>
      </div>`,
  },
  {
    id: "chrome-owned-menu-sheet",
    title: "Owned menu — the sheet presentation on a phone",
    group: "components",
    width: 402,
    capture: "viewport",
    sources: ["src/views/owned-menu.ts", "src/views/menu-row.ts", "src/views/mobile-bottom-sheet.ts"],
    // The same rows as the popover above, in the presentation a phone actually gets. It exists
    // because the row grammar the sheet applies — a fixed leading column, one left edge, a hairline
    // between neighbours, a 44px target — is stated only under `.db-mobile-bottom-sheet`, so the
    // desktop fixture photographs none of it.
    //
    // What this proves is bounded, and worth stating plainly: it is hand-written markup against the
    // shipped stylesheet, so it documents the CSS and says nothing about the module that builds the
    // rows. The alignment and divider claims are measured in verify-placement, against the real
    // menu, with the host's own button rule loaded.
    note: "The phone form of the owned menu. Rows share one left edge with the icon in a fixed leading column, hairlines divide neighbours but not the last row of a group, and a row that opens a submenu carries a trailing chevron. Captured in viewport mode so the fixed sheet docks at the bottom. Every row carries its icon, including the destructive one: `ColumnMenu` builds that row with `icon: \"trash\"`, and the fixture drew it bare — a picture of a row the renderer does not make. The icon-less shape is real elsewhere and is exercised where it belongs, by the placement lane's own three-row menu.",
    html: () => `
      <div class="db-surface db-menu db-owned-menu db-mobile-bottom-sheet db-overlay-enter is-visible" role="menu" tabindex="-1">
        <div class="db-mobile-bottom-sheet-handle" aria-hidden="true"></div>
        <div class="db-menu-section">Column</div>
        <button type="button" class="db-menu-item">
          <span class="db-menu-item-icon">${I.arrowUpDown}</span>
          <span class="db-menu-item-label">Sort ascending</span>
        </button>
        <button type="button" class="db-menu-item">
          <span class="db-menu-item-icon">${I.listFilter}</span>
          <span class="db-menu-item-label">Filter on this column</span>
        </button>
        <button type="button" class="db-menu-item" aria-haspopup="true" aria-expanded="false">
          <span class="db-menu-item-icon">${I.columns3}</span>
          <span class="db-menu-item-label">Property type</span>
          <span class="db-menu-item-current">Select</span>
          <span class="db-menu-item-chevron">${I.chevronRight}</span>
        </button>
        <div class="db-menu-separator" role="separator"></div>
        <button type="button" class="db-menu-item">
          <span class="db-menu-item-icon">${I.copy}</span>
          <span class="db-menu-item-label">Duplicate property</span>
        </button>
        <button type="button" class="db-menu-item" disabled aria-disabled="true">
          <span class="db-menu-item-icon">${I.group}</span>
          <span class="db-menu-item-label">Group by this column</span>
        </button>
        <button type="button" class="db-menu-item is-warning">
          <span class="db-menu-item-icon">${I.trash}</span>
          <span class="db-menu-item-label">Delete property</span>
        </button>
      </div>`,
  },
  {
    id: "chrome-group-selection-controls",
    title: "Group selection controls",
    group: "components",
    width: 620,
    sources: ["src/views/list-renderer.ts", "src/views/gallery-renderer.ts", "src/views/board-renderer.ts"],
    // Three families that existed in source and in no fixture: renderGroupCheckbox in the list and
    // the gallery, and renderSubgroup in the board. Nothing photographed them and no check could
    // reach them, which is the same hole that let a row checkbox family ship unstyled.
    //
    // They are captured together on purpose. The criterion these controls have to meet is that one
    // role paints one box, so three headers side by side is the picture that shows a divergence at
    // a glance; three separate captures would not.
    note: "The whole-group selection box from the list, the gallery and a board subgroup. One role, so all three boxes must be the same size and radius.",
    html: () => `
      <div class="note-database-container">
        ${listGroupHeader("Design", 4)}
        ${galleryGroupHeader("Business", 7)}
        ${boardSubgroupHeader("Monthly", 3)}
      </div>`,
  },
  {
    id: "chrome-selection-status-bar",
    title: "Cell selection status bar",
    group: "components",
    width: 720,
    sources: ["src/views/embedded-database-renderer.ts"],
    // The clear-selection checkbox is checked by construction — the bar only exists while a
    // selection does — so this is also the only fixture that photographs a row-role box in its
    // checked state at the size the bar gives it.
    // The bar docks to the viewport with position: fixed, which means it contributes no height to
    // the element being captured. Without this override the shot was an empty 80x64 rectangle —
    // fully transparent, byte-identical in both themes and on both devices — while every check
    // stayed green, because freshness and existence were the only things anyone asked about.
    // Positioning is all that is undone; the height, border, radius, background and padding that
    // make up the thing being photographed are left exactly as the stylesheet sets them.
    captureCss: `.note-database-container .db-selection-status-bar {
      position: static !important; left: auto !important; bottom: auto !important;
      transform: none !important;
    }`,
    note: "The bar that appears while table cells are selected. Its checkbox clears the selection, so it is always rendered checked.",
    html: () => `
      <div class="note-database-container">
        <div class="db-selection-status-bar">
          ${rowCheckbox("db-selection-clear-checkbox").replace(" aria-label=", " checked aria-label=")}
          <span class="db-selection-count">6 cells selected</span>
          <button type="button" class="db-selection-action">Copy TSV</button>
          <button type="button" class="db-selection-action">Copy Markdown</button>
          <button type="button" class="db-selection-action">Copy CSV</button>
        </div>
      </div>`,
  },
];
