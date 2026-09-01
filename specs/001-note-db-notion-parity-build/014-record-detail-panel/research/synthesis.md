# Synthesis: Record Detail Panel / Hover-Open UX
> One-line: ranked Notion-parity enrichment for this feature, synthesized by Grok 4.6 (xhigh-fast) from the phase's 10 research iterations. Evidence trail: research.md.

## Verdict

Build it as an S-tier polish phase, not a capability project: the fork already has the record model, value helpers, and table chrome; the remaining gap is the visible Notion feel (Name-cell OPEN + a properties panel with header/hidden groups) while write-back stays in successor 015. Headline: ship a **display-only right side-peek** from a new `src/data/RecordDetailPanel.ts`, with an OPEN `<button>` in `.db-title-cell`, Anytype’s two-group IA (drop Anytype’s third “local” group), and CSS scoped under `.note-database-container` using theme variables only. Do **not** reuse `openRow` / `dataSource.openNote`, do **not** use an Obsidian `Modal`, and do **not** restyle the core toolbar. The single biggest risk is the title cell itself: it already navigates on click and already feeds Obsidian Page Preview, and the iteration-10 insertion point (`setupRowInteractions` querying `.db-title-cell`) is timing-wrong because `setupRow` runs before cells exist.

## Ranked backlog

1. **Title-cell hover OPEN** — Notion shows OPEN on hover of the Name cell; the fork has no equivalent chrome (Anytype is the outlier: implicit name-cell click, no OPEN button). Feasibility: **clear**. Files: new `src/data/RecordDetailPanel.ts`; `src/views/DatabaseView.ts` `renderCell` (~7840–7848) after `cellRenderer.renderCell` paints `db-title-cell` (not `setupRowInteractions` at 7529 — `TableRenderer.renderRow` calls `setupRow` at 468, cells only at 495–505). Effort: **S**. Depends: none. Citation: `src/views/CellRenderer.ts:117-118`

2. **Side-peek overlay (grid stays interactive; no navigation)** — Notion tables default to Side peek with the database still usable; the fork’s `openRow` is full navigation via `dataSource.openNote`. Feasibility: **likely** (no dedicated record overlay, but clamp primitives already exist). Files: `src/data/RecordDetailPanel.ts` (mount inside `.note-database-container`); `src/views/DatabaseView.ts` passes `this.containerEl_` / `this.app` into `openRecordDetailPanel`. Effort: **M**. Depends: item 1. Citation: `context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/presentation/grid_page.dart:203-213`

3. **Header group + collapsible hidden group** — Notion/Anytype properties IA; the fork has no in-panel sections. Header = icon + title + **visible** columns; hidden = view `hiddenColumns` / `columns − getVisibleColumns`; omit Anytype’s third `local` group (no per-object local relations in this fork). Feasibility: **clear**. Files: `src/data/RecordDetailPanel.ts` only (read `RowData` + `ViewConfig`; `getColumnValue` for every row). Effort: **S**. Depends: item 2. Citation: `context/anytype-ts/src/ts/component/sidebar/page/object/relation.tsx:19-49`

4. **Toolbar-safe, theme-variable panel CSS** — GoodBases had to revert a core-toolbar restyle; this phase’s hard constraint is zero toolbar selectors. Feasibility: **clear** (prefix-by-construction). Files: plugin-root `styles.css` (Obsidian loads only this file; esbuild has no CSS pipeline). Effort: **S**. Depends: item 2 (rules can be written in parallel). Citation: `styles.css:770`

5. **Isolate OPEN from title navigation and Page Preview** — without this, OPEN either navigates away (violates REQ-002) or fights the existing hover-preview. Feasibility: **clear**. Files: `src/data/RecordDetailPanel.ts` (real `<button>`, `stopPropagation`/`preventDefault`, **no** `data-note-database-hover-link`); do not change the title `<a>` click → `openNote` path. Effort: **S**. Depends: item 1. Citation: `src/views/HoverLinkPreview.ts:8-17`

6. **Phone/tap fallback (persistent OPEN)** — hover does not exist on touch; AppFlowy splits desktop overlay vs mobile full-page, but REQ-005 is tap fallback, not a new mobile route. Feasibility: **clear**. Files: `src/data/RecordDetailPanel.ts` (reuse `isPhoneLayout()` / `body.is-phone`; keep OPEN at opacity 1 on phone, matching the existing MobileMoveIcon caret pattern). Effort: **S**. Depends: item 1. Citation: `src/views/TableRenderer.ts:759-761`

7. **Keyboard open/close + focus return** — spec §8 requires a keyboard path beside hover; Enter is already taken by inline edit. Feasibility: **likely**. Files: `src/views/DatabaseView.ts` `handleDatabaseKeydown` (~1523): handle **Mod+Enter** *before* the Enter-to-edit branch (same `mod = metaKey \|\| ctrlKey` already at 1441); Esc + focus-return owned by the module via a pushed Obsidian `Scope` while open, then restore `td[data-note-database-row-path][data-note-database-column-key][tabindex="0"]`. Effort: **S**. Depends: item 2. Citation: `src/views/DatabaseView.ts:1523-1526`

8. **Viewport clamp, empty state, hidden-toggle guard, panel scroll** — spec §8: edge hover stays on-screen; zero-property records stay a clean layout; long hidden lists scroll inside the panel. Feasibility: **clear** once item 2 exists (reuse `getVisiblePopoverBounds` / `clamp` / `setPosition` from `src/views/PopoverPosition.ts` — iteration 6’s “no overlay util” overstated `FieldTooltip.ts`; that helper is title-attribute only, but popover clamp already lives beside CellRenderer). Files: `src/data/RecordDetailPanel.ts`. Effort: **S**. Depends: items 2–3. Citation: `src/views/PopoverPosition.ts:24-29`

## Recommended build (locked design)

**Module:** `src/data/RecordDetailPanel.ts` (EuroFormat shape: pure exports, no `DataSource` import). Mirror `src/data/EuroFormat.ts` consumed at `src/views/CellRenderer.ts:13` and `src/views/SummaryRenderer.ts:7`.

**Exports:**
- `attachTitleOpenAffordance(td, row, deps)` — insert the OPEN control into an already-rendered title cell.
- `openRecordDetailPanel({ anchor, row, config, container, app, returnFocus })` — mount, clamp, own Esc.
- `closeRecordDetailPanel()` — unmount, pop Scope, restore focus.

**Core algorithm**
1. **Single-instance state machine** local to the module: `closed → open(rowPath) → closed`. Opening another row replaces the current panel. Never call `DatabaseView.openRow` (`src/views/DatabaseView.ts:7545-7548`).
2. **Affordance.** After the title cell is painted (`col.key === "file.name"` → `td.db-title-cell`), append a `<button type="button" class="db-record-open-btn">` as a **sibling of** the internal-link `<a>`, not inside it. Default CSS `opacity: 0`; reveal with `.note-database-container tr:hover .db-record-open-btn { opacity: 1 }` (same idiom as `.db-heading-row:hover .db-heading-more-button` at `styles.css:770`). On `body.is-phone`, force `opacity: 1`. Click: `preventDefault` + `stopPropagation`, then open. Do **not** set `data-note-database-hover-link` on the button (`HoverLinkPreview.ts:4-47`); leave `markNoteHoverLink` on the title `<a>` (`CellRenderer.ts:124-129`) so modifier-hover Page Preview and click-to-note stay the navigation path.
3. **Panel anatomy = in-view side-peek**, `position: absolute` inside `.note-database-container` (`styles.css:4032`), grid left remains interactive. Not GoodBases’ centered `Modal` (blocks the grid; Notion table default is Side peek). `role="dialog"`, `aria-label` = record name, `aria-modal="false"` (no full focus trap). Tab cycles panel controls; Esc closes.
4. **Positioning.** Right-align in the container; if the panel would overflow, flip to the left and clamp with `getVisiblePopoverBounds` / `clamp` / `setPosition` (`PopoverPosition.ts`). Do not reuse `positionToolbarPopover`’s below-anchor toolbar layout (wrong geometry for a peek).
5. **Data flow (display-only).** Input is already-hydrated `RowData` (`src/data/types.ts:113-119`) + current `ViewConfig`. Header: `renderRecordIcon` (`src/views/RecordIconRenderer.ts:18`) + `row.file.basename`. Property rows: `getColumnValue(row, col)` (`src/data/ColumnDisplay.ts:63`) over `getVisibleColumns(config, rows)` (`TableRenderer.ts:24`), skipping `file.name` (already the header). Hidden group: `config.columns` minus that visible set / `ViewModeStateDef.hiddenColumns` (`types.ts:164-172`). Full rebuild on each open (GoodBases `onDataUpdated` pattern; cheap because there are no writes). Stringify with existing helpers (`stringifyValue` / `formatFieldTooltipValue`); **no new formatters**. CSS class-toggle for hidden-group collapse (Anytype height animation is unnecessary). Show the hidden reveal control only when the hidden set is non-empty (AppFlowy `numHiddenFields != 0`). Omit empty readonly/derived hidden values (Anytype `relation.tsx:40-42`). Zero-property record: one muted “No properties” row, not an empty hole.
6. **Keyboard.** OPEN is a real button (Space/Enter activate it). Row-level open: **Mod+Enter** on a focused grid cell. While open, push an Obsidian `Scope` so Esc closes the panel before the grid’s Esc (`DatabaseView.ts:1213` inline-edit; `:1425` selection clear). Focus return uses the existing roving selector (`DatabaseView.ts:4197`).
7. **CSS.** Append a delimited `.note-database-container …` block to plugin-root `styles.css` using only documented theme variables (`styles.css:35-38`: `--background-primary`, `--background-secondary`, `--background-modifier-border`, `--background-modifier-hover`). Long values wrap; the panel body `overflow-y: auto`; no horizontal scroll. Zero toolbar selectors.

**Call sites (≤3, SC-002):**
1. `src/views/DatabaseView.ts` — `renderCell` (~7840–7848): if `col.key === "file.name"`, `attachTitleOpenAffordance(td, row, { config: this.getConfig(), container: this.containerEl_, app: this.app })`.
2. `src/views/DatabaseView.ts` — `handleDatabaseKeydown` (~1523): if `mod && Enter` and a cell is focused, open the panel for that row and return (must precede `editAtCellSelection()`).
3. `styles.css` — append the panel + hover-reveal rules (the only stylesheet Obsidian loads; do not inject `<link>` from `main.ts`).

`setupRowInteractions` (`DatabaseView.ts:7529-7531`) stays row-menu-only. Grouped tables come for free: same `renderRow` → `renderCell` path (`TableRenderer.ts:450-505`).

## Edge cases & mobile/iCloud safety

**Must handle**
- **Title column hidden:** `db-title-cell` is only added when `file.name` is in the visible column loop (`CellRenderer.ts:117-118`). If missing, attach a compact OPEN control on the row’s first data `td` (still one renderCell call site).
- **OPEN vs title click vs Page Preview:** button outside the `<a>`, no hover-link attribute, stop the click. Title click remains navigation.
- **Viewport edge:** clamp/flip with `PopoverPosition` primitives so the panel stays inside `.note-database-container` (spec §8).
- **Zero properties:** muted “No properties” row (spec §8; not GoodBases’ CSS-hide-everything, not a broken header).
- **Many hidden properties:** hidden list scrolls inside the panel; reveal button omitted when the hidden set is empty (`row_property.dart:90-97`).
- **Long values:** wrap; no truncation (spec §8).
- **Inline-edit on another row while panel is open:** both stay functional; panel is keyed to `row.file.path` (spec §8).
- **Grid scroll while open:** **dismiss** (recommended default) so the panel cannot detach; follow-on-scroll is the alternative if the operator wants Notion-like stickiness.
- **Re-render / refresh:** close or rebuild from the same `row.file.path`; never keep a stale DOM node after `renderTable`.
- **Keyboard conflict:** bare Enter stays inline edit (`DatabaseView.ts:1523-1526`); only Mod+Enter opens. Esc while open closes the panel first.
- **Roving tabindex:** OPEN `tabIndex="-1"` so it is not an extra Tab stop between cells (same rule as the icon gutter, `TableRenderer.ts:491-493`); keyboard users hit the button via hover/tap or Mod+Enter.

**Mobile.** Reuse `isPhoneLayout()` (`TableRenderer.ts:759-761`, `DatabaseView.ts:4254`): `window.activeDocument.body.classList.contains("is-phone")`. Persistent visible OPEN on phone (precedent: `renderMobileMoveButton` only when phone, `TableRenderer.ts:478-480`). No hover-only API, no `MouseEvent`-only path. AppFlowy’s `MobileRowDetailPage` full-page route (`mobile_grid_page.dart:136-141`) is **not** the fork target; overlay + tap is.

**iCloud / display-only.** Enforce by construction: the module imports nothing from `DataSource` (write surface is `mutateFrontmatter` `:288`, `updateFrontmatter` `:314`, `createNote` `:328`, `duplicateNote` `:360`, `trashNote` `:389`, `renameNote` `:409`, `updateViewDefFile` `:991`). Reads `row.frontmatter` and `row.computed` only. Rollups stay display-only (`ColumnDef` comment at `types.ts:69-70`; SC-004 / NFR-R01). Hidden-group toggle is in-memory CSS, not a vault write (do not copy Anytype `Storage.setToggle` into note files). No new evaluation paths (NFR-S02).

## Open questions / operator decisions

1. **Side-peek vs centered Modal.** Default: **side-peek** (Notion table default; grid stays interactive). Use Modal only if side-peek proves too invasive in the finance-vault layout.
2. **Grid scroll while open: dismiss vs follow.** Default: **dismiss** (no detached panel, simpler than scroll-sync). Follow if you want the peek glued to the row.
3. **Mod+Enter vs button-only keyboard.** Default: **both** — visible button plus Mod+Enter on the focused cell. Do not steal bare Enter.
4. **Empty hidden values.** Default: **omit** empty readonly/derived hidden rows (Anytype filter); still show the hidden group if any non-empty hidden property exists.
5. **Hidden-group toggle persistence.** Default: **in-memory only** for the panel instance (spec: no persistence changes). Do not write toggle state to the view def or the note.
6. **CSS isolation vs Obsidian loader.** Default: **append a delimited block to plugin-root `styles.css`**. A sibling `src/data/RecordDetailPanel.css` is fine as an authoring file only if its bytes are copied into `styles.css`; a second runtime stylesheet will not load (README ships `main.js` + `styles.css` + `manifest.json`).
7. **Title click still opens the note.** Default: **yes** — OPEN is peek; the existing title `<a>` remains the navigation path. Do not reroute `openRow` or patch the core toolbar New button (`patchToolbarNew` is the GoodBases trap; REQ-003).
8. **Panel body / markdown preview (GoodBases note-modal).** Default: **no** — this phase is properties IA only. Body editing and two-way write-back belong to 015.
9. **Board / gallery / other views.** Default: **table-only** (spec Scenario 1). Extra view call sites would blow the EuroFormat budget.
10. **`aria-modal`.** Default: **`false`** for side-peek. Set `true` only if you switch to a blocking Modal.
