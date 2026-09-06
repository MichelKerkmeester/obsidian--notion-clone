// ───────────────────────────────────────────────────────────────────
// MODULE:    core
// COMPONENT: screenshot scenarios for the primary view types (table, board) and their shared chrome
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { COLUMNS, COVER_BASES, ICONS, OPTION_TONES, ROWS, SUBTASK_FIXTURE_ROWS, boardCard, boardColumn, dots,
  emptyCover, glyph, optionPill, optionTone, rowCheckbox, subtaskBoardCard, subtaskBoardColumn, tableHeader, tableRows } from "./shared.mjs";

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
    fixtureOf: "constructed-table",
    html: () => `
      <div class="note-database-container">
        <table class="db-table"><thead><tr>${tableHeader()}</tr></thead><tbody>${tableRows()}</tbody></table>
      </div>`,
  },
  {
    id: "table-wrap-off",
    title: "Table wrap off — a markdown column clips to one line",
    group: "views",
    width: 640,
    sources: ["src/data/column-types.ts", "src/views/cell-renderer.ts", "src/views/inline-markdown-renderer.ts"],
    note: "The view's wrap switch off, which clips every column whatever mode it carries. Both "
      + "ways a value used to escape that are shown holding the floor: a long sentence ellipsised "
      + "at one line, and a value carrying its own line breaks collapsed to spaces instead of "
      + "forcing a <br> through white-space: nowrap.",
    html: () => `
      <div class="note-database-container">
        <table class="db-table"><thead><tr>
          <th><div class="db-th-content"><span class="db-th-label">Title</span></div></th>
          <th><div class="db-th-content"><span class="db-th-label">Journal</span></div></th>
        </tr></thead><tbody>
          <tr><td class="db-cell">Log 2026-02-01</td><td class="db-cell">Nothing measurable changed, but the day felt heavier than the numbers suggest. Worth noting rather than explaining away.</td></tr>
          <tr><td class="db-cell">Log 2026-02-02</td><td class="db-cell">Streak intact Watch tomorrow morning Third week running</td></tr>
          <tr><td class="db-cell">Log 2026-02-03</td><td class="db-cell">Best sleep of the month by a wide margin</td></tr>
        </tbody></table>
      </div>`,
  },
  {
    id: "table-wrap-on",
    title: "Table wrap on — the same markdown column wraps",
    group: "views",
    width: 640,
    sources: ["src/data/column-types.ts", "src/views/cell-renderer.ts", "src/views/inline-markdown-renderer.ts"],
    note: "The same column and the same source values with the switch on: db-cell-wrap sets "
      + "white-space: normal, so the long sentence takes a second line and the value's own line "
      + "breaks render as real line breaks again. The phone renders this identically now.",
    html: () => `
      <div class="note-database-container">
        <table class="db-table"><thead><tr>
          <th><div class="db-th-content"><span class="db-th-label">Title</span></div></th>
          <th><div class="db-th-content"><span class="db-th-label">Journal</span></div></th>
        </tr></thead><tbody>
          <tr><td class="db-cell">Log 2026-02-01</td><td class="db-cell db-cell-wrap">Nothing measurable changed, but the day felt heavier than the numbers suggest.<br>Worth noting rather than explaining away.</td></tr>
          <tr><td class="db-cell">Log 2026-02-02</td><td class="db-cell db-cell-wrap">Streak intact<br>Watch tomorrow morning<br>Third week running</td></tr>
          <tr><td class="db-cell">Log 2026-02-03</td><td class="db-cell db-cell-wrap">Best sleep of the month by a wide margin</td></tr>
        </tbody></table>
      </div>`,
  },
  {
    id: "table-column-header",
    title: "Column header affordances",
    group: "components",
    width: 620,
    fixtureOf: "constructed-column-header",
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
    sources: ["src/views/board-renderer.ts", "src/views/card-field-renderer.ts", "src/views/record-surface/property-row.ts"],
    fixtureOf: "constructed-board",
    html: () => `
      <div class="note-database-container db-kanban-view">
        <div class="db-kanban-board">
          ${[...new Set(ROWS.map((r) => r.category))]
            .map((cat) => boardColumn(cat, ROWS.filter((r) => r.category === cat), OPTION_TONES[cat]))
            .join("")}
        </div>
      </div>`,
  },
  {
    id: "board-subtask-tree",
    title: "Board view — subtask tree",
    group: "views",
    width: 620,
    sources: ["src/views/board-renderer.ts", "src/views/card-field-renderer.ts", "src/views/record-surface/property-row.ts", "src/data/subtask-relation.ts", "src/data/subtask-serialize.ts", "src/i18n.ts"],
    fixtureOf: "constructed-board-subtask",
    note: "A parent and two child cards beside an ordinary lane, using the same card, title, chip, progress, and footer tree as the rendered board.",
    html: () => `
      <div class="note-database-container db-kanban-view">
        <div class="db-kanban-board">
          ${subtaskBoardColumn("Projects", [
            subtaskBoardCard(SUBTASK_FIXTURE_ROWS.parent, { depth: 0 }),
            subtaskBoardCard(SUBTASK_FIXTURE_ROWS.copy, { depth: 1, parent: SUBTASK_FIXTURE_ROWS.parent.name }),
            subtaskBoardCard(SUBTASK_FIXTURE_ROWS.launch, { depth: 1, parent: SUBTASK_FIXTURE_ROWS.parent.name }),
          ], "purple")}
          ${boardColumn("Design", ROWS.filter((r) => r.category === "Design"))}
        </div>
      </div>`,
  },
  {
    id: "board-empty-column",
    title: "Board view — empty column",
    group: "components",
    width: 660,
    fixtureOf: "constructed-board-empty-column",
    sources: ["src/views/board-renderer.ts"],
    note: "A populated lane beside an empty lane, preserving the rendered column header and empty cards container.",
    html: () => `
      <div class="note-database-container db-kanban-view">
        <div class="db-kanban-board">
          ${boardColumn("Design", ROWS.filter((r) => r.category === "Design").slice(0, 2))}
          ${boardColumn("Personal", [])}
        </div>
      </div>`,
  },
  {
    id: "board-drop-language",
    title: "Board view — drag and drop-target language",
    group: "components",
    width: 620,
    sources: ["src/views/board-renderer.ts"],
    note: "A frozen mid-drag frame, reordering a card inside its own column: the cards container carries the class its own dragover listener adds (db-kanban-drop-target), and the dragged card keeps the dragstart lift (db-kanban-card--dragging) — the same classes the drag handlers add on dragover/dragenter, applied without a live pointer. The reference reorders live by moving the dragged card's own element ahead of or behind its neighbour on dragover, not by drawing a separate before/after insertion line, so the third card here is an ordinary neighbour rather than a distinct hovered state.",
    html: () => {
      const rows = ROWS.filter((r) => r.category === "Business").slice(0, 3);
      const tone = OPTION_TONES.Business;
      const cardRenderer = (row, index) => (index === 1 ? boardCard(row, "", { dragState: "dragging" }) : boardCard(row));
      return `
      <div class="note-database-container db-kanban-view">
        <div class="db-kanban-board">
          ${boardColumn("Business", rows, tone, { columnClass: "is-drop-target", cardRenderer })}
        </div>
      </div>`;
    },
  },
  {
    id: "add-view-popover",
    title: "Add view popover",
    group: "components",
    fixtureOf: "constructed-toolbar-add-view",
    // The width the stylesheet actually gives this panel, plus the 16px the capture box frames it
    // with on each side. It read 292 — narrower than the surface — and `#shot` is `overflow:
    // hidden`, so the capture cut 84px off the right: the three inputs ran out of the frame and the
    // select lost its chevron. The panel takes `width: min(360px, calc(100vw - 24px))`, which is
    // 360 at any viewport this is photographed in. A declared width narrower than the surface does
    // not shrink it, it only crops the picture, which is now a capture failure rather than a shot.
    width: 392,
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
    // Seven exist in the union; five are offered. Gallery and list are deprecated, not deleted —
    // the types are persisted in vault files, so the picker withdraws them while the on-open
    // migration converts whichever database already is one. This markup is hand-written and
    // cannot import the picker, so add-view-popover-layout.test.ts holds the two in step instead.
    html: () => {
      const chevron = glyph('<path d="m9 18 6-6-6-6"/>');
      const row = (label, d) => `
        <button type="button" class="db-menu-item" role="menuitem" aria-checked="false">
          <span class="db-menu-item-icon">${glyph(d)}</span>
          <span class="db-menu-item-label">${label}</span>
          <span class="db-menu-item-chevron db-menu-item-current">${chevron}</span>
        </button>`;
      const field = (id, label, control) => `
        <div class="db-panel-row">
          <div class="db-add-view-field">
            <label class="db-add-view-field-label" for="${id}">${label}</label>
            ${control}
          </div>
        </div>`;
      return `
      <div class="note-database-container">
        <div class="db-view-tab-popover db-add-view-popover" role="dialog" aria-label="Add view">
          <div class="db-panel-header">
            <span class="db-panel-title">Add view</span>
            <button type="button" class="db-sheet-close" aria-label="Close">${glyph('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')}</button>
          </div>
          <div class="db-menu-section">Options</div>
          <div class="db-add-view-form">
            ${field("db-add-view-field-1", "View name (optional)",
              '<input type="text" class="db-add-view-name" id="db-add-view-field-1">')}
            ${field("db-add-view-field-2", "Title property",
              `<button type="button" class="db-dropdown-field db-add-view-key-field" id="db-add-view-field-2" aria-haspopup="listbox" aria-expanded="false">
                 <span class="db-dropdown-field-icon"></span>
                 <div class="db-dropdown-field-text"><span class="db-dropdown-field-value">Cost</span></div>
                 <span class="db-dropdown-field-chevron">${glyph('<path d="m6 9 6 6 6-6"/>')}</span>
               </button>`)}
            ${field("db-add-view-field-3", "Icon (optional)",
              '<input type="text" class="db-add-view-icon" maxlength="8" id="db-add-view-field-3">')}
            <label class="db-add-view-duplicate db-panel-row"><input type="checkbox" class="db-checkbox db-checkbox-field"><span>Copy settings from current view</span></label>
          </div>
          <div class="db-menu-separator" role="separator"></div>
          <div class="db-menu-section">Create</div>
          <div class="db-add-view-choices">
            ${row("Table view", '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>')}
            ${row("Board view", '<rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="11" rx="1"/>')}
            ${row("Chart view", '<path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="7"/><rect x="13" y="6" width="3" height="11"/>')}
            ${row("Calendar view", '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>')}
            ${row("Timeline view", '<path d="M3 6h11M3 12h7M3 18h14"/>')}
            <button type="button" class="db-menu-item db-add-view-duplicate-action" role="menuitem" aria-checked="false">
              <span class="db-menu-item-icon">${glyph('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>')}</span>
              <span class="db-menu-item-label">Duplicate current view</span>
              <span class="db-menu-item-chevron db-menu-item-current">${chevron}</span>
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
    fixtureOf: "constructed-dropdown",
    sources: ["src/views/dropdown-field.ts"],
    note: "A disabled option is dimmed and carries a tooltip rather than inline explanatory text.",
    html: () => {
      // The option's real shape, from `openDropdownPopover`: a check span, then a text wrapper
      // holding the label. The row is `display: grid` with `grid-template-columns: 16px minmax(0,
      // 1fr)`, so the check takes the first track and the text takes the second.
      //
      // Without the check, the LABEL landed in the 16px track. Every option rendered as one
      // character and an ellipsis — "S…", "A…", "R…" — in a popover over a thousand pixels wide,
      // which is a picture of a dropdown the plugin does not build.
      //
      // The row carries `db-menu-item` too, and that is not decoration: the disabled appearance
      // both menus share is declared on `.db-menu-item[aria-disabled="true"]`, so a row with the
      // attribute and not the class matched nothing. `is-disabled` was missing beside it, which is
      // the other half — `.db-dropdown-option.is-disabled` is where the 0.45 opacity lives. The
      // disabled option was therefore drawn exactly like the two available ones, in the one
      // scenario whose whole title is "Dropdown with disabled option".
      //
      // The selected row's check span was empty. `openDropdownPopover` puts Lucide's `check` in it
      // for the matching value, so the fixture claimed a selected state with nothing marking it.
      const option = (label, extra = "", attrs = "", checked = false) => `
          <button type="button" class="${`db-dropdown-option db-menu-item ${extra}`.trim()}" ${attrs}>
            <span class="db-dropdown-option-check db-menu-item-check">${checked ? ICONS.check : ""}</span>
            <span class="db-dropdown-option-text db-menu-item-label"><span class="db-dropdown-option-label">${label}</span></span>
          </button>`;
      // The desktop panel opens with its query field first and the options in their own scroll
      // container beneath it — every desktop menu is searchable, so a three-option list carries
      // the same row a thirty-option one does.
      return `
      <div class="note-database-container">
        <div class="db-dropdown-popover db-dropdown-popover-context-container is-searchable">
          <div class="db-dropdown-search">
            <input type="search" placeholder="Aggregate" role="combobox" aria-expanded="true" aria-autocomplete="list">
          </div>
          <div class="db-dropdown-options">
            <div class="db-dropdown-section-title">Aggregate</div>
            ${option("Sum", "is-selected", "", true)}
            ${option("Average")}
            ${option("Rollup", "is-disabled", 'aria-disabled="true" title="Rollup needs a numeric target field"')}
          </div>
        </div>
      </div>`;
    },
  },
  {
    id: "empty-state",
    title: "Empty state",
    group: "states",
    width: 720,
    fixtureOf: "constructed-empty-state",
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
    id: "empty-state-source-missing",
    title: "Empty state — source missing",
    group: "states",
    width: 720,
    // Mirrors EmptyStateRenderer.renderCard() class-for-class for the "source-missing" reason
    // (getEmptyStateReason routes a view whose source resolved to zero files here, distinct from
    // "no-database" — a view that never named one — and "no-matching-data" — a source that
    // resolves and matched nothing). Copy is EMPTY_STATE_COPY's real English strings, and the
    // action is the state's own primary "Choose database" affordance, not a stand-in.
    sources: ["src/views/empty-state-renderer.ts", "styles.css"],
    html: () => `
      <div class="note-database-container">
        <div class="db-empty db-empty-card" data-empty-reason="source-missing">
          <div class="db-empty-card-icon" aria-hidden="true">${ICONS.database}</div>
          <div class="db-empty-card-content">
            <h3 class="db-empty-card-title">This view's source is missing</h3>
            <p class="db-empty-card-message">The folder or database this view pointed to was moved or deleted. Choose a database to continue.</p>
            <div class="db-empty-action-group">
              <button type="button" class="db-empty-action mod-cta" aria-label="Choose database">
                <span class="db-empty-action-icon" aria-hidden="true">${ICONS.database}</span>
                <span>Choose database</span>
              </button>
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
    // Superseded by constructed-table's own mobile-device capture, not a separate constructed
    // scenario: the shared device loop in capture.mjs already mounts constructed-table at the
    // "mobile" device (is-phone applied), which is the identical renderer/stylesheet path this
    // fixture exists to depict — a genuinely different layoutHash is already recorded for that
    // device against the desktop one, confirming the phone layout actually differs.
    fixtureOf: "constructed-table",
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
        ${titleCell(r)}<td>${r.cost}</td><td>${optionPill(r.cycle)}</td>
        <td>${optionPill(r.payment)}</td><td>${r.renew}</td>
        <td>${optionPill(r.category)}</td>`;
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
              ${tableHeader({ selectColumn: false })}
            </tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </div>
      </div>`;
    },
  },
  {
    id: "board-mobile",
    title: "Board view — mobile",
    group: "views",
    width: 402,
    sources: ["src/views/board-renderer.ts", "src/views/group-label-renderer.ts", "src/views/card-field-renderer.ts", "src/views/record-surface/property-row.ts"],
    // Superseded by constructed-board's own mobile-device capture — see table-mobile's note above
    // for why no separate constructed scenario is needed.
    fixtureOf: "constructed-board",
    note: "The reference board inside the default-width container: its fixed-width columns page horizontally on a phone while the card tree remains unchanged.",
    html: () => `
      <div class="note-database-container db-kanban-view db-width-default">
        <div class="db-kanban-board">
          ${[...new Set(ROWS.map((r) => r.category))]
            .map((cat) => boardColumn(cat, ROWS.filter((r) => r.category === cat)))
            .join("")}
        </div>
      </div>`,
  },
  {
    id: "card-cover-states",
    title: "Card covers, board",
    group: "components",
    width: 620,
    fixtureOf: "constructed-card-covers",
    sources: ["src/views/board-renderer.ts"],
    // `renderCover` runs in the board card whenever an image field is configured, and every
    // capture in this corpus was of a view with none — so `.db-board-card-cover` and
    // `.db-board-card-cover-placeholder` were unreachable by any check. This fixture is what makes
    // them reachable: the empty state is the one a fixture can produce honestly, since resolving a
    // real image needs a vault.
    //
    // The gallery drew this same empty cover once, side by side with the board's, to catch a
    // divergence between their glyph sizes (24px on the board against 28px in the gallery). The
    // gallery is retired; the comparison went with it, and this fixture keeps the board's own
    // empty-cover coverage the comparison also carried.
    note: "The empty cover in the board's card: the same Lucide image glyph on --background-secondary at a 0.75 aspect ratio the board has always drawn.",
    // The card sits in its real parent rather than on the container. The cover's height is its
    // width over a 0.75 ratio, so a card photographed at the scenario's own width is a cover eight
    // hundred pixels tall — a shape no lane or grid column ever gives it. `.db-kanban-col`
    // carries the shipped width (246px).
    html: () => `
      <div class="note-database-container" style="display: flex; gap: 16px; align-items: flex-start">
        <div class="db-kanban-col">
          <div class="db-kanban-cards" role="rowgroup">
            <div class="db-kanban-card" role="row" tabindex="-1">
              ${emptyCover(COVER_BASES.board)}
              <div class="db-kanban-card-body">
                <div class="db-kanban-card-title-row"><div class="db-kanban-card-title">Figma</div></div>
                <div class="db-kanban-card-meta">
                  <div class="db-board-card-field"><span class="db-board-card-field-label">Cost</span><span class="db-board-card-value">€ 18,75</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`,
  },
  {
    id: "board-card-title-currency",
    title: "Board card titled by a currency column",
    group: "components",
    width: 300,
    sources: [
      "src/data/title-field-display.ts", "src/views/board-renderer.ts",
      "src/views/card-field-renderer.ts", "src/views/record-surface/property-row.ts",
    ],
    note: "The view's titleField points at the Cost column: the card's main name reads that "
      + "column's own euro-formatted text (resolveTitleFieldDisplay's typed-format routing) "
      + "instead of the raw stored number — the operator's phone report, closed. Cost is left "
      + "out of the meta list below the title, matching how a card's own property list already "
      + "excludes whichever column is chosen as its title.",
    html: () => {
      const currencyTitleField = (label, value, tone) => `
        <div class="db-board-card-field" data-note-database-column-key="${label.toLowerCase()}" role="gridcell">
          <span class="db-board-card-field-label">${label}</span>
          <div class="db-board-card-value">${tone ? optionPill(value) : value}</div>
        </div>`;
      const currencyTitleCard = (row) => `
      <div class="db-kanban-card" role="row" tabindex="-1">
        <div class="db-kanban-card-body">
          <div class="db-kanban-card-title-row">
            <span class="db-kanban-card-title">${row.cost}</span>
          </div>
          <div class="db-kanban-card-meta">
            ${currencyTitleField("Billing", row.cycle, true)}
            ${currencyTitleField("Payment", row.payment, true)}
            ${currencyTitleField("Next Renewal", row.renew)}
          </div>
        </div>
      </div>`;
      const [first, second] = ROWS;
      return `
      <div class="note-database-container db-kanban-view">
        ${boardColumn(first.category, [first, second], optionTone(first.category), { cardRenderer: currencyTitleCard })}
      </div>`;
    },
  },
];
