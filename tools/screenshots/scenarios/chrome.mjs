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
 * the real tree, because several rules are descendant- or child-scoped (`.obnotion-panel-row
 * .obnotion-panel-dropdown`, `.obnotion-grouped-table tr.obnotion-group-divider-row`) and match nothing when
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

import { OPTION_TONES, ROWS, ICONS, dots, glyph,
  optionPill, rowCheckbox, tableGroupTitle, tableHeader } from "./shared.mjs";

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
  /* The More-tools rows. `renderUtilitiesOverflowButton` names `refresh-cw`, `settings-2`,
     `arrow-left-right` and `file-output`; the first two had no glyph here, and the same omission
     that drew a bare delete row would have drawn bare utility rows. */
  refresh: glyph('<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>'),
  // Two actions, two glyphs, because the toolbar draws two. Saving computed results uses a custom
  // recalculate badge and refreshing the database uses the host's plain refresh; the fixture drew
  // the plain one twice, which is the same rendering for two different actions and exactly the
  // "no visible difference between states" the capture review exists to catch.
  refreshFx: glyph('<path d="M15 7a7 7 0 1 0 2 5"/><path d="M15 4v4h-4"/>'
    + '<g transform="translate(12 10)"><g transform="scale(0.6)" stroke-width="4">'
    + '<path d="M6.5 5.5h10.5l-5.5 6.5l5.5 6.5h-10.5"/></g></g>'),
  // The cog the rail's permanent settings control actually draws, path for path — the same
  // lucide `settings` outline the icon stub hands the constructed capture, so the hand-written
  // fixture and its constructed sibling photograph one icon rather than two. The spoked
  // circle that used to sit here stood in for the retired `settings-2` slider glyph of the
  // overflow menu's deleted row, and reusing it for a cog would have drawn a sun.
  settings: glyph('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.39a2 2 0 0 0 .73 2.73l.15.08a2 2 0 0 1 1 1.74v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),
  arrowLeftRight: glyph('<path d="m8 3-5 5 5 5"/><path d="M3 8h13"/><path d="m16 21 5-5-5-5"/><path d="M21 16H8"/>'),
  fileOutput: glyph('<path d="M14 2H7a2 2 0 0 0-2 2v6"/><path d="M14 2v5h5"/><path d="M19 7v13a2 2 0 0 1-2 2H9"/><path d="M3 15h8"/><path d="m7 11-4 4 4 4"/>'),
  // The toast's severity glyphs and its close control. `showToast` pairs `check`/`alert-triangle`
  // with success/error so severity survives for a reader who cannot separate the two colours; `x`
  // is its keyboard-reachable dismiss button.
  alertTriangle: glyph('<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/>'),
  x: glyph('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
};

/* One More-tools row, built the way `renderToolbarMenuRow` builds it: the shared `obnotion-menu-item`
   from `createMenuRow`, plus the per-surface `obnotion-toolbar-menu-row` whose own inline padding is the
   inset the heading above it is aligned to. */
const utilitiesRow = (label, icon) => `
  <button type="button" class="obnotion-menu-item obnotion-toolbar-menu-row" role="menuitem">
    <span class="obnotion-menu-item-icon">${icon}</span>
    <span class="obnotion-menu-item-label">${label}</span>
  </button>`;

/* `createIconButton` builds `button.obnotion-toolbar-icon-button` with the extra classes the call
   site passes; `setBadge`/`setHiddenBadge` append the count span inside the same button. */
const iconButton = (icon, label, extra = "", badgeHtml = "") => `
  <button type="button" class="obnotion-toolbar-icon-button${extra ? ` ${extra}` : ""}" aria-label="${label}">${icon}${badgeHtml}</button>`;

const badge = (text) => `<span class="obnotion-toolbar-badge">${text}</span>`;
const neutralBadge = (text) => `<span class="obnotion-toolbar-badge obnotion-toolbar-badge-neutral">${text}</span>`;

const viewTab = (name, icon, active) => `
  <button type="button" class="obnotion-view-tab${active ? " is-active" : ""}" role="tab"
    aria-selected="${active ? "true" : "false"}" tabindex="${active ? "0" : "-1"}">
    <span class="obnotion-view-tab-icon">${icon}</span>
    <span class="obnotion-view-tab-name">${name}</span>
  </button>`;

/* `renderSearch` leaves the wrap collapsed to 28px until it has text or focus; `is-active`
   is the widened state, so both are shown where the point is the control itself. */
const searchControl = (active) => `
  <div class="obnotion-search-control${active ? " is-active" : ""}">
    <button type="button" class="obnotion-search-button" aria-label="Search">${I.search}</button>
    <div class="obnotion-search-input-wrap">
      <input type="text" class="obnotion-search-input" placeholder="Search" aria-label="Search"${active ? ' value="notion"' : ""}>
      <span class="obnotion-search-activity-pulse" aria-hidden="true"></span>
    </div>
    <button type="button" class="obnotion-search-clear" aria-label="Clear search"${active ? "" : " hidden"}>×</button>
  </div>`;

const newButtonGroup = () => `
  <div class="obnotion-new-button-group">
    <button type="button" class="obnotion-new-button obnotion-new-button-primary" aria-label="New">
      <span class="obnotion-new-button-icon">${I.plus}</span><span>New</span>
    </button>
    <button type="button" class="obnotion-new-button-dropdown" aria-label="Choose a template">${I.chevronDown}</button>
  </div>`;

/* The right half of the toolbar: four clusters in the order ToolbarRenderer creates them,
   with the search control inside the utilities cluster where it lands on desktop. */
const toolbarRight = () => `
  <div class="obnotion-toolbar-right">
    <div class="obnotion-toolbar-cluster obnotion-toolbar-query-cluster" aria-label="Query controls">
      ${iconButton(I.listFilter, "Filter", "obnotion-filter-btn obnotion-toolbar-badge-button", badge("2"))}
      ${iconButton(I.arrowUpDown, "Sort", "obnotion-sort-btn obnotion-toolbar-badge-button", badge("1"))}
      ${iconButton(I.group, "Group", "obnotion-group-btn is-active")}
    </div>
    <div class="obnotion-toolbar-cluster obnotion-toolbar-properties-cluster" aria-label="Properties">
      ${iconButton(I.columns3, "Properties", "obnotion-col-manager-btn obnotion-toolbar-badge-button", neutralBadge("2 hidden"))}
    </div>
    <div class="obnotion-toolbar-cluster obnotion-toolbar-utilities-cluster" aria-label="More tools">
      ${iconButton(I.settings, "Settings", "obnotion-toolbar-settings-btn")}
      ${iconButton(I.moreHorizontal, "More tools", "obnotion-toolbar-more-btn")}
      ${searchControl(false)}
    </div>
    <div class="obnotion-toolbar-cluster obnotion-toolbar-creation-cluster">
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
  <th class="obnotion-select-col" role="columnheader"><div class="obnotion-select-inner"><input type="checkbox" class="obnotion-checkbox obnotion-checkbox-row"></div></th>`;

const utilityCell = () => `
  <td class="obnotion-select-col"><div class="obnotion-select-inner">
    <button type="button" class="obnotion-table-row-drag-handle" aria-label="Drag to sort">${I.grip}</button>
    <input type="checkbox" class="obnotion-checkbox obnotion-checkbox-row">
  </div></td>`;

/* The table is `table-layout: fixed`, and the plugin sizes its columns through a colgroup
   built at runtime from the stored widths. With no colgroup the fixed layout has nothing to
   divide and the table resolves to a runaway width large enough to take the browser down,
   so the fixture supplies one the same way the renderer does. */
const fullColgroup = () => `
  <colgroup>
    <col class="obnotion-select-colgroup">
    ${FOOTER_COLUMNS.map(() => `<col style="width:150px">`).join("")}
    <col style="width:44px">
  </colgroup>`;

const fullHeader = () => `
  ${fullColgroup()}
  <thead><tr role="row">
    ${utilityHeader()}
    ${FOOTER_COLUMNS.map((c) => `
      <th role="columnheader" data-obnotion-column-key="${c.key}"><div class="obnotion-th-content">
        <span class="obnotion-property-icon">${ICONS[c.icon]}</span>
        <span class="obnotion-th-label">${c.label}</span>
        <button type="button" class="obnotion-column-menu-trigger" aria-label="Open ${c.label} menu">${dots}</button>
      </div></th>`).join("")}
    <th class="obnotion-add-column-th" role="columnheader">
      <button type="button" class="obnotion-add-column-button" aria-label="Add property">${I.plus}</button>
    </th>
  </tr></thead>`;

const fullRow = (r) => `
  <tr role="row" data-obnotion-row-path="Subscriptions/${r.name}.md">
    ${utilityCell()}
    <td data-obnotion-column-key="name">${r.name}</td>
    <td data-obnotion-column-key="cost">${r.cost}</td>
    <td data-obnotion-column-key="billing">${optionPill(r.cycle)}</td>
    <td data-obnotion-column-key="payment">${optionPill(r.payment)}</td>
    <td data-obnotion-column-key="renew">${r.renew}</td>
    <td class="obnotion-add-column-cell" aria-hidden="true"></td>
  </tr>`;

/* `TableFooterRenderer` stacks a kind label over its result inside one trigger, and repeats
   the pair when a column carries several summary rules. */
/* The footer's numbers, computed from the rows above them rather than typed beside them.
 *
 * They were hand-picked and contradicted the table they footed: COUNT 5 under 24 rows, SUM 191,75
 * against 576,27, AVERAGE 38,35 against 24,01, EARLIEST 2026-03-02 when the earliest renewal in
 * ROWS is March 1. A reader checking whether the footer adds up got a picture in which it does not,
 * and the one aggregate that was right — UNIQUE 3 payment methods — was right by luck.
 *
 * `calculateTableAggregate` drops empty values first, so these mirror it: COUNT is the non-empty
 * count, UNIQUE the size of the distinct set, EARLIEST the smallest timestamp. Results go through
 * `formatEuroNumber2`, which is nl-NL with up to two fraction digits and no minimum — so a whole
 * count prints as "24" and a sum as "576,27".
 *
 * ROWS holds cost as a display string ("€ 148,30") where the product holds a number, so the euro
 * sign and the Dutch decimal comma are undone before summing and re-applied by the formatter.
 */
const nl2 = new Intl.NumberFormat("nl-NL", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const costOf = (row) => Number(row.cost.replace(/[^0-9,.]/g, "").replace(/\./g, "").replace(",", "."));
const footerSum = ROWS.reduce((total, row) => total + costOf(row), 0);
// Local parts, not `toISOString()`: these dates parse as local midnight, and converting one to UTC
// in a positive-offset zone moves it to the previous day. That put March 1 in the footer as
// 2026-02-28 — a date not in the table, produced by the fix for a date not in the table.
const footerEarliestDate = ROWS
  .map((row) => new Date(row.renew))
  .reduce((earliest, date) => (date < earliest ? date : earliest));
const footerEarliest = `${footerEarliestDate.getFullYear()}-`
  + `${String(footerEarliestDate.getMonth() + 1).padStart(2, "0")}-`
  + `${String(footerEarliestDate.getDate()).padStart(2, "0")}`;

const footerCell = (key, values) => `
  <td class="obnotion-table-footer-cell" data-obnotion-column-key="${key}">
    <button type="button" class="obnotion-table-footer-trigger${values.length ? " has-calculation" : ""}"
      aria-label="Calculate for ${key}">
      ${values.length
        ? values.map(([kind, result]) => `<span class="obnotion-table-footer-value">
            <span class="obnotion-table-footer-kind">${kind}</span>
            <span class="obnotion-table-footer-result">${result}</span>
          </span>`).join("")
        : `<span class="obnotion-table-footer-calculate-hint">+ Calculate</span>`}
    </button>
  </td>`;

/* `renderGroupLabel` puts a colored `.status-badge` inside the title span for option-typed group
   fields, and plain text only for a non-option field or the empty "uncategorized" group. The
   subgroup here used to pass no tone and be described as the plain-text case, but it groups by
   payment, which is option-typed — the renderer badges it. Passing "" still renders text, for
   whenever a non-option group field is photographed; nothing does yet. */
const groupDividerRow = (title, field, count, badgeTone, summaries, depth = 0) => `
  <tr class="obnotion-group-divider-row obnotion-group-header${depth ? ` obnotion-group-header--depth-${depth}` : ""}"
    data-obnotion-group-key="${title}" data-obnotion-group-field="${field}"
    ${depth ? `style="--obnotion-group-depth:${depth}"` : ""}>
    <td colspan="7">
      <div class="obnotion-group-divider-content">
        <input type="checkbox" class="obnotion-checkbox obnotion-checkbox-row obnotion-group-divider-checkbox" aria-label="Select rows">
        <span class="obnotion-group-header-label">
          <button type="button" class="obnotion-group-collapse-toggle" aria-label="Collapse" aria-expanded="true">
            <span class="obnotion-collapse-triangle"></span>
          </button>
          ${tableGroupTitle(title, badgeTone)}
          <span class="obnotion-group-count">${count}</span>
        </span>
        <div class="obnotion-group-divider-summaries">
          ${summaries.map(([label, value]) => `
            <span class="obnotion-group-summary-item">
              <span class="obnotion-group-summary-label">${label}</span>
              <span class="obnotion-group-summary-value">${value}</span>
            </span>`).join("")}
        </div>
      </div>
    </td>
  </tr>`;

/* A `obnotion-panel-row` inside the active-rule popover: two or three dropdown fields, no remove
   button (`renderSingleRuleEditor` passes `showRemove: false`). */
const panelDropdown = (extraClass, value, icon) => `
  <button type="button" class="obnotion-dropdown-field obnotion-panel-dropdown ${extraClass}${icon ? " has-current-icon" : ""}"
    aria-haspopup="listbox" aria-expanded="false">
    <span class="obnotion-dropdown-field-icon">${icon ? `<span class="obnotion-dropdown-option-type-icon">${icon}</span>` : ""}</span>
    <div class="obnotion-dropdown-field-text"><span class="obnotion-dropdown-field-value">${value}</span></div>
    <span class="obnotion-dropdown-field-chevron">${I.chevronDown}</span>
  </button>`;

/* Every panel in the plugin is `position: absolute` against a toolbar anchor that a
   screenshot has no equivalent of, so each one is put back in flow to be photographed. The
   height cap is lifted with it: it is measured against the viewport, and a 600px-tall
   capture would scroll the panel instead of showing all of it. Width is deliberately left
   alone so the shot still reports the width the stylesheet gives the panel. */
const IN_FLOW_PANEL = `position: static !important; top: auto !important; right: auto !important;
  left: auto !important; max-height: none !important;`;

// ───────────────────────────────────────────────────────────────────
// 3. SCENARIOS
// ───────────────────────────────────────────────────────────────────

export const CHROME_SCENARIOS = [
  {
    id: "chrome-toolbar",
    title: "Main toolbar",
    group: "components",
    width: 1100,
    fixtureOf: "constructed-toolbar",
    sources: ["src/views/toolbar-renderer.ts"],
    note: "View switcher on the left; query, properties, utilities and creation clusters on the right. The search control sits collapsed in the utilities cluster until it has text or focus.",
    html: () => `
      <div class="obnotion-container">
        <div class="obnotion-header">
          <div class="obnotion-toolbar">
            <div class="obnotion-toolbar-left">
              <div class="obnotion-view-tabs" role="tablist" aria-label="View switcher">
                ${viewTab("All subscriptions", I.table, true)}
                ${viewTab("By category", I.layoutGrid, false)}
                ${viewTab("Covers", I.image, false)}
                <button type="button" class="obnotion-view-tab obnotion-view-tab-add" aria-label="Add view"
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
    fixtureOf: "constructed-toolbar",
    sources: ["src/views/toolbar-renderer.ts"],
    note: "The active tab carries is-active; the ⋯ tab appears only once the toolbar has measured tabs out of view, and opens the all-views hub.",
    html: () => `
      <div class="obnotion-container">
        <div class="obnotion-header">
          <div class="obnotion-toolbar">
            <div class="obnotion-toolbar-left">
              <div class="obnotion-view-tabs" role="tablist" aria-label="View switcher">
                ${viewTab("All subscriptions", I.table, true)}
                ${viewTab("By category", I.layoutGrid, false)}
                ${viewTab("Covers", I.image, false)}
                ${viewTab("Spend", I.barChart, false)}
                <button type="button" class="obnotion-view-tab obnotion-view-tab-more" aria-label="2 more views"
                  aria-haspopup="dialog" aria-expanded="false"><span>⋯</span></button>
                <button type="button" class="obnotion-view-tab obnotion-view-tab-add" aria-label="Add view"
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
    fixtureOf: "constructed-toolbar-search",
    sources: ["src/views/toolbar-renderer.ts"],
    note: "The wrap is 28px wide at rest and widens to 150px under is-active; the clear button is hidden until the input has text.",
    html: () => `
      <div class="obnotion-container">
        <div class="obnotion-header"><div class="obnotion-toolbar">
          <div class="obnotion-toolbar-right">
            <div class="obnotion-toolbar-cluster obnotion-toolbar-utilities-cluster" aria-label="More tools">
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
    fixtureOf: "constructed-active-view-controls",
    sources: ["src/views/active-view-controls-renderer.ts"],
    note: "The rail lives in the header below the toolbar. Sort chips come first and carry their position as a superscript; the AND button between the groups toggles filter logic.",
    html: () => {
      const chip = (kind, icon, field, detail, order) => `
        <div class="obnotion-active-control-chip is-${kind}" data-active-rule-key="${kind}:0">
          <button type="button" class="obnotion-active-control-edit" title="${field} · ${detail}" aria-label="${field} · ${detail}">
            <span class="obnotion-active-control-icon">${icon}${order ? `<span class="obnotion-active-control-order">${order}</span>` : ""}</span>
            <span class="obnotion-active-control-field">${field}</span>
            <span class="obnotion-active-control-detail">${detail}</span>
          </button>
          <button type="button" class="obnotion-active-control-remove" aria-label="Delete ${kind}">×</button>
        </div>`;
      return `
      <div class="obnotion-container">
        <div class="obnotion-header">
          <div class="obnotion-active-view-controls" aria-label="Filter / Sort">
            <div class="obnotion-active-view-controls-scroll">
              <div class="obnotion-active-control-group is-sort" aria-label="Sort">
                ${chip("sort", I.arrowDown, "Cost", "Descending", "1")}
                ${chip("sort", I.arrowUp, "Next Renewal", "Ascending", "2")}
              </div>
              <div class="obnotion-active-control-group is-filter" aria-label="Filter">
                <button type="button" class="obnotion-active-control-logic" title="AND (all)" aria-label="AND (all)">AND</button>
                ${chip("filter", I.listFilter, "Category", "equals · Business", "")}
                ${chip("filter", I.listFilter, "Payment", "equals · Revolut", "")}
              </div>
            </div>
            <button type="button" class="obnotion-active-view-controls-clear" aria-label="Clear all">Clear all</button>
          </div>
        </div>
      </div>`;
    },
  },
  {
    // Four operator reports named this surface before anything photographed it, and the alignment
    // they were describing is the one thing a measurement caught and no capture could show — because
    // there was no capture. That is the gap this closes: the heading and the rows' first ink now sit
    // on one edge, and from here a person can see whether they still do.
    id: "chrome-utilities-popover",
    title: "More-tools dropdown",
    group: "components",
    width: 420,
    fixtureOf: "constructed-toolbar-utilities",
    sources: ["src/views/toolbar-renderer.ts", "src/views/menu-row.ts"],
    note: "The toolbar's overflow menu. Rows come from the shared createMenuRow but carry obnotion-toolbar-menu-row, whose own inline padding is what the heading is aligned to.",
    captureCss: `.obnotion-container .obnotion-toolbar-utilities-popover { ${IN_FLOW_PANEL} }`,
    html: () => `
      <div class="obnotion-container">
        <div class="obnotion-view-tab-popover obnotion-toolbar-utilities-popover" role="menu" aria-label="Utilities">
          <div class="obnotion-panel-header"><div class="obnotion-panel-title">Utilities</div></div>
          ${utilitiesRow("Wide display", I.arrowLeftRight)}
          ${utilitiesRow("Save computed results", I.refreshFx)}
          ${utilitiesRow("Refresh database", I.refresh)}
          ${utilitiesRow("Copy formatting", I.copy)}
          ${utilitiesRow("Open database file", I.fileOutput)}
        </div>
      </div>`,
  },
  {
    id: "chrome-active-rule-popover-filter",
    title: "Active rule popover — filter",
    group: "components",
    width: 620,
    fixtureOf: "constructed-active-rule-filter",
    sources: ["src/views/active-rule-popover-renderer.ts", "src/views/filter-panel-renderer.ts"],
    note: "Editing one chip opens the filter panel's single-rule editor: field, operator and value, with no remove button.",
    // Anchored to the chip that opened it, so it leaves the flow and the capture box collapses.
    captureCss: `.obnotion-container .obnotion-active-rule-popover { ${IN_FLOW_PANEL} }`,
    html: () => `
      <div class="obnotion-container">
        <div class="obnotion-active-rule-popover obnotion-filter-panel is-filter" role="dialog" aria-label="Filter">
          <div class="obnotion-panel-row obnotion-active-rule-editor-row">
            ${panelDropdown("obnotion-filter-field-dropdown", "Category", ICONS["circle-dot"])}
            ${panelDropdown("obnotion-filter-operator-dropdown", "equals", "")}
            ${panelDropdown("obnotion-filter-value-dropdown", "Business", "")}
          </div>
        </div>
      </div>`,
  },
  {
    id: "chrome-active-rule-popover-sort",
    title: "Active rule popover — sort",
    group: "components",
    fixtureOf: "constructed-active-rule-sort",
    // 538px of surface plus the 16px the capture box frames it with on each side. It read 480,
    // which cropped 74px: "Descending" was photographed as "Des" and the field chip, which is
    // `flex: 1 1 0`, stretched into the space the cut hid. The panel inherits the filter panel's
    // `width: min(520px, calc(100vw - 72px))` and adds its own 8px padding and 1px border.
    width: 570,
    sources: ["src/views/active-rule-popover-renderer.ts", "src/views/sort-panel-renderer.ts"],
    note: "The sort variant adds obnotion-sort-panel and drops the drag handle and reorder buttons the full panel shows.",
    captureCss: `.obnotion-container .obnotion-active-rule-popover { ${IN_FLOW_PANEL} }`,
    html: () => `
      <div class="obnotion-container">
        <div class="obnotion-active-rule-popover obnotion-filter-panel obnotion-sort-panel is-sort" role="dialog" aria-label="Sort">
          <div class="obnotion-panel-row obnotion-sort-rule-row obnotion-active-rule-editor-row">
            ${panelDropdown("obnotion-sort-field-dropdown", "Cost", ICONS.hash)}
            ${panelDropdown("obnotion-sort-direction-dropdown", "Descending", "")}
          </div>
        </div>
      </div>`,
  },
  {
    id: "chrome-table-footer",
    title: "Table footer aggregates",
    group: "components",
    width: 1100,
    fixtureOf: "constructed-table-footer",
    sources: ["src/views/table-footer-renderer.ts", "src/views/table-renderer.ts"],
    note: "A column with summary rules stacks each kind over its result; a column without one shows a + Calculate hint that the stylesheet keeps at zero opacity until the trigger is hovered, so it is invisible here by design.",
    html: () => `
      <div class="obnotion-container">
        <div class="obnotion-table-wrap">
          <table class="obnotion-table" role="grid">
            ${fullHeader()}
            <tbody>${ROWS.map(fullRow).join("")}</tbody>
            <tfoot class="obnotion-table-footer">
              <tr class="obnotion-table-footer-row">
                <td class="obnotion-table-footer-utility"></td>
                ${footerCell("name", [["Count", nl2.format(ROWS.length)]])}
                ${footerCell("cost", [["Sum", nl2.format(footerSum)], ["Average", nl2.format(footerSum / ROWS.length)]])}
                ${footerCell("billing", [])}
                ${footerCell("payment", [["Unique", nl2.format(new Set(ROWS.map((r) => r.payment)).size)]])}
                ${footerCell("renew", [["Earliest", footerEarliest]])}
                <td class="obnotion-table-footer-add-column"></td>
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
    fixtureOf: "constructed-table-grouped",
    sources: ["src/views/group-label-renderer.ts", "src/views/table-renderer.ts", "src/views/summary-renderer.ts"],
    note: "Every group field here is option-typed, so every divider title is a colored status badge — at both nesting depths. Per-group summaries sit at the right of each divider.",
    html: () => {
      const business = ROWS.filter((r) => r.category === "Business");
      const personal = ROWS.filter((r) => r.category === "Personal");
      return `
      <div class="obnotion-container">
        <div class="obnotion-grouped-table">
          <div class="obnotion-table-wrap">
            <table class="obnotion-table" role="grid">
              ${fullHeader()}
              <tbody>
                ${groupDividerRow("Business", "category", business.length, OPTION_TONES.Business, [["Cost Sum", "177,50"], ["Cost Average", "59,17"]])}
                ${groupDividerRow("Revolut", "payment", business.length, OPTION_TONES.Revolut, [["Cost Sum", "177,50"]], 1)}
                ${business.map(fullRow).join("")}
                ${groupDividerRow("Personal", "category", personal.length, OPTION_TONES.Personal, [["Cost Sum", "14,25"], ["Cost Average", "7,13"]])}
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
    fixtureOf: "constructed-summary",
    sources: ["src/views/summary-renderer.ts"],
    note: "Total is always present; each configured summary rule is a draggable, clickable item, and the faint + Summary entry adds another.",
    html: () => `
      <div class="obnotion-container">
        <div class="obnotion-summary">
          <div class="obnotion-summary-item"><div class="label">Total</div><span class="value">5</span></div>
          <div class="obnotion-summary-item obnotion-summary-sum-item obnotion-summary-draggable" data-summary-rule-index="0">
            <div class="label">Cost Sum</div><span class="value">191,75</span>
          </div>
          <div class="obnotion-summary-item obnotion-summary-sum-item obnotion-summary-draggable" data-summary-rule-index="1">
            <div class="label">Cost Average</div><span class="value">38,35</span>
          </div>
          <div class="obnotion-summary-item obnotion-summary-sum-item obnotion-summary-draggable" data-summary-rule-index="2">
            <div class="label">Payment Count</div><span class="value">5</span>
          </div>
          <div class="obnotion-summary-item obnotion-summary-sum-hint"><span class="value">+ Summary</span></div>
        </div>
      </div>`,
  },
  {
    id: "chrome-owned-menu",
    title: "Owned menu — the shell every context menu uses",
    group: "components",
    width: 420,
    fixtureOf: "constructed-owned-menu",
    sources: ["src/views/owned-menu.ts", "src/views/menu-row.ts"],
    note: "Deliberately not wrapped in obnotion-container: this menu mounts on document.body, so a fixture that wrapped it would photograph a surface the plugin never ships. Chromed from Obsidian's own menu variables so it matches the app's real menus and follows a theme that restyles them.",
    // The destructive row carries its icon here as it does in the sheet below. `ColumnMenu` builds
    // it with `icon: "trash"`, so drawn bare it was a picture of a row the renderer does not make,
    // and it quietly exercised the icon-less alignment path on a menu that always has one. The
    // sheet fixture was corrected and this one was not, so the two presentations of the same menu
    // disagreed about the same row while sitting side by side in the index.
    html: () => `
      <div class="obnotion-surface obnotion-menu obnotion-owned-menu" role="menu" tabindex="-1">
        <div class="obnotion-menu-section">Column</div>
        <button type="button" class="obnotion-menu-item" aria-checked="false">
          <span class="obnotion-menu-item-icon">${I.arrowUpDown}</span>
          <span class="obnotion-menu-item-label">Sort ascending</span>
        </button>
        <button type="button" class="obnotion-menu-item" aria-checked="true">
          <span class="obnotion-menu-item-icon">${I.listFilter}</span>
          <span class="obnotion-menu-item-label">Filter on this column</span>
        </button>
        <button type="button" class="obnotion-menu-item" aria-checked="false" aria-haspopup="true" aria-expanded="false">
          <span class="obnotion-menu-item-icon">${I.columns3}</span>
          <span class="obnotion-menu-item-label">Property type</span>
          <span class="obnotion-menu-item-current">Select</span>
          <span class="obnotion-menu-item-chevron">${I.chevronRight}</span>
        </button>
        <div class="obnotion-menu-separator" role="separator"></div>
        <button type="button" class="obnotion-menu-item" aria-checked="false" disabled aria-disabled="true">
          <span class="obnotion-menu-item-icon">${I.group}</span>
          <span class="obnotion-menu-item-label">Group by this column</span>
        </button>
        <button type="button" class="obnotion-menu-item is-warning" aria-checked="false">
          <span class="obnotion-menu-item-icon">${I.trash}</span>
          <span class="obnotion-menu-item-label">Delete property</span>
        </button>
      </div>`,
  },
  {
    id: "chrome-owned-menu-submenu-open",
    title: "Owned menu — the row whose submenu is open",
    group: "components",
    width: 420,
    fixtureOf: "constructed-owned-menu",
    sources: ["src/views/owned-menu.ts", "src/views/menu-row.ts"],
    note: "The same menu as the fixture above with one row in its open-submenu state, which is the only state the stylesheet draws differently and the one no other capture reaches. The child menu itself is not drawn here: where it lands is arithmetic the plugin runs in JavaScript against a live viewport, and a fixture that placed it would be photographing a guess at that arithmetic rather than the stylesheet this harness exists to photograph.",
    // Two signals belong to this state and both are stylesheet-owned, so both have to be visible in
    // a capture or a theme could silently drop either one: the row keeps its hover fill after the
    // pointer has moved onto the child, and its chevron rotates from pointing right to pointing
    // down. Drawn without `:hover`, exactly as the real row sits once the pointer has left it.
    html: () => `
      <div class="obnotion-surface obnotion-menu obnotion-owned-menu" role="menu" tabindex="-1">
        <div class="obnotion-menu-section">Column</div>
        <button type="button" class="obnotion-menu-item" aria-checked="false">
          <span class="obnotion-menu-item-icon">${I.arrowUpDown}</span>
          <span class="obnotion-menu-item-label">Sort ascending</span>
        </button>
        <button type="button" class="obnotion-menu-item is-submenu-open" aria-checked="false" aria-haspopup="true" aria-expanded="true">
          <span class="obnotion-menu-item-icon">${I.columns3}</span>
          <span class="obnotion-menu-item-label">Property type</span>
          <span class="obnotion-menu-item-current">Select</span>
          <span class="obnotion-menu-item-chevron">${I.chevronRight}</span>
        </button>
        <div class="obnotion-menu-separator" role="separator"></div>
        <button type="button" class="obnotion-menu-item is-warning" aria-checked="false">
          <span class="obnotion-menu-item-icon">${I.trash}</span>
          <span class="obnotion-menu-item-label">Delete property</span>
        </button>
      </div>`,
  },
  {
    id: "chrome-owned-menu-sheet",
    title: "Owned menu — the sheet presentation on a phone",
    group: "components",
    width: 402,
    capture: "viewport",
    fixtureOf: "constructed-owned-menu",
    // Photographed on the phone only. This surface exists because a phone gets it; the desktop pass
    // put the same markup in a 1440px frame with `is-phone` absent, so the sheet spanned the whole
    // window above 900px of empty page. Nothing in the product presents that, and the row grammar
    // this scenario exists to show — one left edge, a fixed leading column, a 44px target — was
    // being read off a width no phone has. Framing the desktop pass at 402px instead would produce
    // an image identical to the mobile one, which the device-parity ratchet exists to catch.
    devices: ["mobile"],
    sources: ["src/views/owned-menu.ts", "src/views/menu-row.ts", "src/views/mobile-bottom-sheet.ts"],
    // The same rows as the popover above, in the presentation a phone actually gets. It exists
    // because the row grammar the sheet applies — a fixed leading column, one left edge, a hairline
    // between neighbours, a 44px target — is stated only under `.obnotion-mobile-bottom-sheet`, so the
    // desktop fixture photographs none of it.
    //
    // What this proves is bounded, and worth stating plainly: it is hand-written markup against the
    // shipped stylesheet, so it documents the CSS and says nothing about the module that builds the
    // rows. The alignment and divider claims are measured in verify-placement, against the real
    // menu, with the host's own button rule loaded.
    note: "The phone form of the owned menu. Rows share one left edge with the icon in a fixed leading column, hairlines divide neighbours but not the last row of a group, and a row that opens a submenu carries a trailing chevron. Captured in viewport mode so the fixed sheet docks at the bottom. Every row carries its icon, including the destructive one: `ColumnMenu` builds that row with `icon: \"trash\"`, and the fixture drew it bare — a picture of a row the renderer does not make. The icon-less shape is real elsewhere and is exercised where it belongs, by the placement lane's own three-row menu.",
    html: () => `
      <div class="obnotion-surface obnotion-menu obnotion-owned-menu obnotion-mobile-bottom-sheet obnotion-overlay-enter is-visible" role="menu" tabindex="-1">
        <div class="obnotion-mobile-bottom-sheet-handle" aria-hidden="true"></div>
        <div class="obnotion-menu-section">Column</div>
        <button type="button" class="obnotion-menu-item">
          <span class="obnotion-menu-item-icon">${I.arrowUpDown}</span>
          <span class="obnotion-menu-item-label">Sort ascending</span>
        </button>
        <button type="button" class="obnotion-menu-item">
          <span class="obnotion-menu-item-icon">${I.listFilter}</span>
          <span class="obnotion-menu-item-label">Filter on this column</span>
        </button>
        <button type="button" class="obnotion-menu-item" aria-haspopup="true" aria-expanded="false">
          <span class="obnotion-menu-item-icon">${I.columns3}</span>
          <span class="obnotion-menu-item-label">Property type</span>
          <span class="obnotion-menu-item-current">Select</span>
          <span class="obnotion-menu-item-chevron">${I.chevronRight}</span>
        </button>
        <div class="obnotion-menu-separator" role="separator"></div>
        <button type="button" class="obnotion-menu-item">
          <span class="obnotion-menu-item-icon">${I.copy}</span>
          <span class="obnotion-menu-item-label">Duplicate property</span>
        </button>
        <button type="button" class="obnotion-menu-item" disabled aria-disabled="true">
          <span class="obnotion-menu-item-icon">${I.group}</span>
          <span class="obnotion-menu-item-label">Group by this column</span>
        </button>
        <button type="button" class="obnotion-menu-item is-warning">
          <span class="obnotion-menu-item-icon">${I.trash}</span>
          <span class="obnotion-menu-item-label">Delete property</span>
        </button>
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
    captureCss: `.obnotion-container .obnotion-selection-status-bar {
      position: static !important; left: auto !important; bottom: auto !important;
      transform: none !important;
    }`,
    note: "The bar that appears while table cells are selected. Its checkbox clears the selection, so it is always rendered checked.",
    html: () => `
      <div class="obnotion-container">
        <div class="obnotion-selection-status-bar">
          ${rowCheckbox("obnotion-selection-clear-checkbox").replace(" aria-label=", " checked aria-label=")}
          <span class="obnotion-selection-count">6 cells selected</span>
          <button type="button" class="obnotion-selection-action">Copy TSV</button>
          <button type="button" class="obnotion-selection-action">Copy Markdown</button>
          <button type="button" class="obnotion-selection-action">Copy CSV</button>
        </div>
      </div>`,
  },
  {
    id: "chrome-toast-success",
    title: "Toast — success, with an Undo action",
    group: "components",
    sources: ["src/views/toast.ts"],
    // `.obnotion-toast-stack` docks to the viewport with position: fixed, and `.obnotion-toast` sits inside it
    // with position: absolute — the same collapsed-stack idiom the selection bar's own fixed dock
    // hits above. Neither contributes height to the element being captured undone, so both are put
    // back in flow; nothing about the card's own furniture is touched.
    //
    // `.obnotion-toast` also carries its own entrance keyframe (`animation: obnotion-toast-in`), scaling from
    // `--obnotion-motion-scale-from` to 1. `reducedMotion: "reduce"` shortens that to 0.01ms rather than
    // removing it, and capture.mjs reads the layout hash through `getBoundingClientRect()` — which
    // includes the live transform — before the screenshot call's own `animations: "disabled"` fast-
    // forwards anything. Whether the read landed before or after that sub-millisecond keyframe
    // finished was a scheduling race, and it decided which of two scaled rects the hash described:
    // the same PNG (pixelHash stable) with two different layoutHashes across runs. Disabling the
    // animation outright removes the race instead of narrowing it.
    captureCss: `.obnotion-toast-stack {
      position: static !important; right: auto !important; bottom: auto !important;
    }
    .obnotion-toast { position: static !important; inset: auto !important; animation: none !important; }`,
    note: "The shared feedback surface `showToast` builds, raised here exactly as the gallery-migration notice raises it: success severity, paired with the check glyph rather than colour alone, and an Undo action. Not wrapped in `obnotion-container`: this stack mounts on `doc.body`, so a fixture that wrapped it would photograph a surface the plugin never ships.",
    html: () => `
      <div class="obnotion-surface obnotion-toast-stack">
        <div class="obnotion-toast is-success" role="status" aria-live="polite" aria-atomic="true">
          <div class="obnotion-toast-header">
            <div class="obnotion-toast-icon">${ICONS.check}</div>
            <div class="obnotion-toast-message">"Subscriptions" was a gallery. Gallery views are being retired, so it now shows as a board with the same cover image, fit and aspect ratio. Its card-size settings do not carry over. Undo to keep it a gallery.</div>
            <button type="button" class="obnotion-toast-close" aria-label="Close">${I.x}</button>
          </div>
          <div class="obnotion-toast-actions">
            <button type="button" class="obnotion-toast-action">Undo</button>
          </div>
        </div>
      </div>`,
  },
  {
    id: "chrome-toast-error",
    title: "Toast — error, sticky until dismissed",
    group: "components",
    sources: ["src/views/toast.ts"],
    // `animation: none` on `.obnotion-toast`: see `chrome-toast-success`'s captureCss comment above — the
    // entrance keyframe's live transform otherwise races the layout-hash read, not the pixels.
    captureCss: `.obnotion-toast-stack {
      position: static !important; right: auto !important; bottom: auto !important;
    }
    .obnotion-toast { position: static !important; inset: auto !important; animation: none !important; }`,
    note: "An error toast carries no auto-dismiss timer and no action row — `showToast` builds the row unconditionally and `:empty` hides it, so a plain error photographs with no stray gap under its message.",
    html: () => `
      <div class="obnotion-surface obnotion-toast-stack">
        <div class="obnotion-toast is-error" role="status" aria-live="polite" aria-atomic="true">
          <div class="obnotion-toast-header">
            <div class="obnotion-toast-icon">${I.alertTriangle}</div>
            <div class="obnotion-toast-message">Could not read the source. Check the database source and try again.</div>
            <button type="button" class="obnotion-toast-close" aria-label="Close">${I.x}</button>
          </div>
          <div class="obnotion-toast-actions"></div>
        </div>
      </div>`,
  },
  {
    id: "chrome-table-load-more",
    title: "Embedded table — Load more row",
    group: "components",
    width: 900,
    sources: ["src/views/embedded-database-renderer.ts", "styles.css"],
    note: "The row `renderTableLoadMoreRow` appends once an embedded table's page limit is reached, colspan read off the real header rather than a second column count. 30px cell / 29px button on desktop; the phone (`is-phone`) capture holds the same 44px thumb floor this stylesheet's other phone rows use.",
    html: () => {
      const rows = ROWS.slice(0, 4).map((r) => `
        <tr>
          <td class="obnotion-select-col"><div class="obnotion-select-inner">${rowCheckbox()}</div></td>
          <td>${r.name}</td>
          <td>${r.cost}</td>
          <td>${optionPill(r.cycle)}</td>
          <td>${optionPill(r.payment)}</td>
          <td>${r.renew}</td>
          <td>${optionPill(r.category)}</td>
        </tr>`).join("");
      return `
      <div class="obnotion-container">
        <div class="obnotion-table-wrap">
          <table class="obnotion-table"><thead><tr>${tableHeader()}</tr></thead><tbody>
            ${rows}
            <tr class="obnotion-table-load-more-row"><td colspan="7">
              <button type="button" class="obnotion-table-load-more-button">Load 20 more</button>
            </td></tr>
          </tbody></table>
        </div>
      </div>`;
    },
  },
];
