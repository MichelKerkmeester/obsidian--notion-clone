// ───────────────────────────────────────────────────────────────────
// MODULE:    core
// COMPONENT: screenshot scenarios for the primary view types (table, board, gallery, list) and their shared chrome
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { COLUMNS, COVER_BASES, ICONS, OPTION_TONES, ROWS, SUBTASK_FIXTURE_ROWS, boardCard, boardColumn, dots,
  emptyCover, glyph, optionPill, rowCheckbox, subtaskBoardCard, subtaskBoardColumn, tableHeader, tableRows } from "./shared.mjs";

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
    fixtureOf: "constructed-board",
    html: () => `
      <div class="note-database-container pm-kanban-view">
        <div class="pm-kanban-board">
          ${[...new Set(ROWS.map((r) => r.category))]
            .map((cat) => boardColumn(cat, ROWS.filter((r) => r.category === cat), OPTION_TONES[cat], {
              // Figma demonstrates a priority-bearing card and Sketch the due chip's near tier,
              // both forced rather than derived from mapped data or the wall clock so the
              // capture stays reproducible; no other card here carries either state, since this
              // schema maps no priority column.
              cardRenderer: cat === "Design"
                ? (row) => boardCard(row, "", row.name === "Figma"
                  ? { priorityColor: "red" }
                  : row.name === "Sketch"
                    ? { dueUrgency: "near" }
                    : {})
                : undefined,
            }))
            .join("")}
        </div>
      </div>`,
  },
  {
    id: "board-subtask-tree",
    title: "Board view — subtask tree",
    group: "views",
    width: 620,
    sources: ["src/views/board-renderer.ts", "src/views/card-field-renderer.ts", "src/data/subtask-relation.ts", "src/data/subtask-serialize.ts", "src/i18n.ts"],
    fixtureOf: "constructed-board-subtask",
    note: "A parent and two child cards beside an ordinary lane, using the same card, title, chip, progress, and footer tree as the rendered board.",
    html: () => `
      <div class="note-database-container pm-kanban-view">
        <div class="pm-kanban-board">
          ${subtaskBoardColumn("Projects", [
            subtaskBoardCard(SUBTASK_FIXTURE_ROWS.parent, { depth: 0, children: true, done: 1, total: 2, explicit: 62, value: 62 }),
            subtaskBoardCard(SUBTASK_FIXTURE_ROWS.copy, { depth: 1 }),
            subtaskBoardCard(SUBTASK_FIXTURE_ROWS.launch, { depth: 1 }),
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
    sources: ["src/views/board-renderer.ts"],
    note: "A populated lane beside an empty lane, preserving the rendered column header, zero count, and empty cards container.",
    html: () => `
      <div class="note-database-container pm-kanban-view">
        <div class="pm-kanban-board">
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
    note: "A frozen mid-drag frame, reordering a card inside its own column: the column carries the class its own dragover listener adds, the reordered card keeps the dragstart lift, and the hovered card keeps the dragover tint plus the before/after insertion line — the same classes the drag handlers add on dragover/dragenter, applied without a live pointer.",
    html: () => {
      const rows = ROWS.filter((r) => r.category === "Business").slice(0, 3);
      const tone = OPTION_TONES.Business;
      const cardRenderer = (row, index) => {
        if (index === 1) return boardCard(row, "", { dragState: "dragging" });
        if (index === 2) return boardCard(row, "", { dragState: "drop-target", dropPlacement: "before" });
        return boardCard(row);
      };
      return `
      <div class="note-database-container pm-kanban-view">
        <div class="pm-kanban-board">
          ${boardColumn("Business", rows, tone, { columnClass: "is-drop-target", cardRenderer })}
        </div>
      </div>`;
    },
  },
  {
    id: "gallery-view",
    title: "Gallery view",
    group: "views",
    width: 900,
    sources: ["src/views/gallery-renderer.ts", "src/views/card-field-renderer.ts"],
    fixtureOf: "constructed-gallery",
    // Two things this fixture used to get wrong, both of which made the gallery photograph as
    // something the renderer does not build.
    //
    // It drew four cards out of twenty-four, so a 900px-wide capture was one row of cards over
    // eleven hundred pixels of nothing — the empty-looking-product shape the row fixture was sized
    // to avoid in the first place.
    //
    // And its cover was `db-board-card-cover-placeholder`: the OTHER view's class, with no wrapper
    // around it and no glyph inside. `renderCover` builds `.db-gallery-cover`, adds `is-empty` when
    // nothing resolves, and puts Lucide's image glyph in `.db-gallery-cover-placeholder`. The
    // wrapper carries the aspect ratio, so the card it produces is about three times the height of
    // the one this drew — and the class the fixture did name matched no rule, so it painted nothing
    // at all. A gallery with no cover is the surface with its subject removed.
    note: "A gallery whose image field is configured but whose rows resolve no image: every card carries the cover wrapper in its empty state. A gallery with no image field configured draws no cover at all and is the board fixture's shape.",
    html: () => `
      <div class="note-database-container">
        <div class="db-gallery" role="grid">
          ${ROWS.slice(0, 12).map((r) => `
            <div class="db-gallery-card" role="row" aria-keyshortcuts="Enter Space F2" tabindex="-1">
              <div class="db-gallery-card-controls">${rowCheckbox("db-gallery-card-checkbox")}</div>
              ${emptyCover(COVER_BASES.gallery)}
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
    fixtureOf: "constructed-list",
    // renderRow builds `db-list-row-controls` — checkbox, open button, move button — with no
    // device test around it, so a desktop row has all three. This fixture used to render a bare
    // title and two values, which meant the desktop list's own selection checkbox appeared in no
    // capture at all and no check could reach it.
    note: "The desktop list row, controls included. The row checkbox is not a phone-only control; the renderer builds it at every width.",
    html: () => `
      <div class="note-database-container">
        <div class="db-list" role="grid">
          ${/*
            The renderer builds `controls` then a `db-list-row-main` holding a title line and a meta
            line. This fixture used to drop the title and both values in as bare siblings of the
            controls, which makes the row a two-column auto grid: the first column then sizes to
            whichever is wider, the controls or the COST sitting under them, so the title started at
            a different x on almost every row — measured 103 to 114 across six distinct positions,
            where the two fixtures that build the real shape both measure a spread of 0.
          */""}
          ${ROWS.map((r) => `
            <div class="db-list-row" role="row" aria-keyshortcuts="Enter Space F2" tabindex="-1">
              <div class="db-list-row-controls">
                ${rowCheckbox("db-list-row-checkbox")}
                <button type="button" class="db-list-row-open" aria-label="Open note">${ICONS.maximize}</button>
                <button type="button" class="db-list-mobile-move-btn" aria-label="Move">${ICONS.move}</button>
              </div>
              <div class="db-list-row-main">
                <div class="db-record-title-line"><span class="db-list-row-title">${r.name}</span></div>
                <div class="db-list-row-meta">
                  <div class="db-list-field"><span class="db-list-field-label">Cost</span><div class="db-list-field-value">${r.cost}</div></div>
                  <div class="db-list-field"><span class="db-list-field-label">Renews</span><div class="db-list-field-value">${r.renew}</div></div>
                </div>
              </div>
            </div>`).join("")}
        </div>
      </div>`,
  },
  {
    id: "add-view-popover",
    title: "Add view popover",
    group: "components",
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
      return `
      <div class="note-database-container">
        <div class="db-dropdown-popover db-dropdown-popover-context-container">
          <div class="db-dropdown-section-title">Aggregate</div>
          ${option("Sum", "is-selected", "", true)}
          ${option("Average")}
          ${option("Rollup", "is-disabled", 'aria-disabled="true" title="Rollup needs a numeric target field"')}
        </div>
      </div>`;
    },
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
    id: "list-mobile",
    title: "List view — mobile",
    group: "views",
    width: 402,
    sources: ["src/views/list-renderer.ts", "src/views/card-field-renderer.ts"],
    // Superseded by constructed-list's own mobile-device capture — see table-mobile's note above
    // for why no separate constructed scenario is needed.
    fixtureOf: "constructed-list",
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
    // Superseded by constructed-board's own mobile-device capture — see table-mobile's note above
    // for why no separate constructed scenario is needed.
    fixtureOf: "constructed-board",
    note: "The reference board inside the default-width container: its fixed-width columns page horizontally on a phone while the card tree remains unchanged.",
    html: () => `
      <div class="note-database-container pm-kanban-view db-width-default">
        <div class="pm-kanban-board">
          ${[...new Set(ROWS.map((r) => r.category))]
            .map((cat) => boardColumn(cat, ROWS.filter((r) => r.category === cat)))
            .join("")}
        </div>
      </div>`,
  },
  {
    id: "card-cover-states",
    title: "Card covers, board and gallery",
    group: "components",
    width: 620,
    sources: ["src/views/board-renderer.ts", "src/views/gallery-renderer.ts"],
    // Two families that were in source and in no fixture. `renderCover` runs in both card views
    // whenever an image field is configured, and every capture in this corpus was of a view with
    // none — so `.db-board-card-cover`, `.db-board-card-cover-placeholder`, `.db-gallery-cover` and
    // `.db-gallery-cover-placeholder` were unreachable by any check. The only mention of any of
    // them anywhere was one placeholder class in the gallery fixture, from the wrong view, with no
    // wrapper: a name that matched no rule and painted nothing.
    //
    // Side by side on purpose. The two are the same idea implemented twice, with their own wrapper
    // class and their own placeholder class, and the glyph sized 24px on the board against 28px in
    // the gallery. A divergence between them is only visible when they are in one picture. The
    // empty state is the one a fixture can produce honestly: resolving a real image needs a vault.
    note: "The empty cover, in the board's card and the gallery's. Both draw the same Lucide image glyph on --background-secondary at a 0.75 aspect ratio; the board sizes the glyph at 24px and the gallery at 28px, which is the one difference between them.",
    // Each card sits in its real parent rather than on the container. The cover's height is its
    // width over a 0.75 ratio, so a card photographed at the scenario's own width is a cover eight
    // hundred pixels tall — a shape no lane or grid column ever gives it. `.db-board-column` and
    // `.db-gallery` carry the shipped widths (280px and 250px), which is what makes the two
    // covers comparable to each other and to the product.
    html: () => `
      <div class="note-database-container" style="display: flex; gap: 16px; align-items: flex-start">
        <div class="db-board-column">
          <div class="db-board-cards" role="rowgroup">
            <div class="db-board-card" role="row" tabindex="-1">
              ${emptyCover(COVER_BASES.board)}
              <div class="db-board-card-title">Figma</div>
              <div class="db-board-card-field"><span class="db-board-card-field-label">Cost</span><span class="db-board-card-value">€ 18,75</span></div>
            </div>
          </div>
        </div>
        <div class="db-gallery" role="grid">
          <div class="db-gallery-card" role="row" tabindex="-1">
            ${emptyCover(COVER_BASES.gallery)}
            <div class="db-gallery-card-title">Figma</div>
            <div class="db-gallery-field"><span class="db-gallery-field-label">Cost</span><span class="db-gallery-field-value">€ 18,75</span></div>
          </div>
        </div>
      </div>`,
  },
  {
    id: "list-sparse-fields",
    title: "List rows with fields missing",
    group: "views",
    width: 1100,
    sources: ["src/views/list-renderer.ts"],
    fixtureOf: "constructed-list-sparse",
    note: "The shape every other list fixture cannot produce: each row missing a different subset of its properties. A fixture that gives every row every field shows a tidy grid whichever way the row is laid out, so it cannot tell a column claimed by index from a slot taken by count. The mobile capture hides the reserved boxes rather than drawing them: `shouldReserveColumns` reserves only where two properties can share a line, and at 402px only one fits — so the phone capture used to photograph blank gaps the renderer never draws. Static markup cannot make that decision, so `captureCss` makes it instead, at the one width where the answer differs.",
    captureCss: `
      /* What the RENDERER does at this width, which static markup cannot express. Reserving is a
         measured decision — the two narrowest declared widths plus a column gap against the field
         area — and at 402px it comes out false, so no placeholder is built at all. Without this the
         phone capture shows a blank line per missing property: 84px of scrolling for boxes nobody
         can see, which is the exact cost the renderer was changed to stop paying. */
      .is-phone .db-list-field.is-placeholder { display: none; }
    `,
    html: () => {
      // The controls cell is not decoration and its absence was not harmless. `.db-list-row` is a
      // two-track grid on a phone — `auto minmax(0, 1fr)` — so a row with one child puts its main
      // cell in the `auto` track and sizes it to its content. This fixture had no controls cell, so
      // every card was as wide as whatever it happened to contain; that was invisible only because
      // the placeholders padded them all to the same width. Emptying the placeholders exposed six
      // distinct card widths in a list the renderer draws at one.
      //
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
          //
          // EMPTY, though. `renderRowFieldPlaceholder` builds a bare spacer sized from the custom
          // property and puts nothing inside it — a label and a value nobody can see was the shape
          // that took a 1,600-row list to seven seconds. This fixture used to draw both children
          // inside the placeholder, so the capture depicted three nodes per gap where the plugin
          // draws one, and the placement lane's own `nodesInPlaceholders === 0` had no counterpart
          // in the picture.
          .map(([label, key, column]) => `
            <div class="db-list-field${gone.has(key) ? " is-placeholder" : ""}"${gone.has(key) ? ' aria-hidden="true"' : ""} style="grid-column: ${column}; --db-card-field-width: ${WIDTHS[key]}px">${gone.has(key) ? "" : `<span class="db-list-field-label">${label}</span><div class="db-list-field-value">${r[key]}</div>`}</div>`)
          .join("");
        return `
        <div class="db-list-row" role="row" tabindex="-1">
          <div class="db-list-row-controls">
            ${rowCheckbox("db-list-row-checkbox")}
            <button type="button" class="db-list-row-open" aria-label="Open note">${ICONS.maximize}</button>
          </div>
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
