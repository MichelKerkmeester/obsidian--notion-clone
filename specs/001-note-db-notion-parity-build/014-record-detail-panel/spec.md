---
title: "Feature Specification: Record Detail Panel / Hover-Open UX"
description: "Phase 014 specification: a display-only CSS-docked right side-peek record detail panel (new src/views/TableRecordPeek.ts, distinct from the existing calendar src/views/RecordDetailPanel.ts which already owns the openRecordDetailPanel/closeRecordDetailPanel/refreshRecordDetailPanel/getOpenRecordDetailPath exports) with a Name-cell OPEN affordance and Anytype-style header/hidden property groups, scoped under .note-database-container with theme variables only. Core Obsidian toolbar is explicitly out of scope; two-way write-back is deferred to successor 015."
trigger_phrases:
  - "record detail panel"
  - "hover open"
  - "properties panel"
  - "detail panel"
  - "hover chrome"
  - "notion feel"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/014-record-detail-panel"
    last_updated_at: "2026-08-27T17:09:01Z"
    last_updated_by: "phase-architect"
    recent_action: "Nested sub-phases authored from synthesis and final-plan"
    next_safe_action: "Build 001-table-record-peek-module per its plan.md and tasks.md"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Record Detail Panel / Hover-Open UX

> Adjacent phases: predecessor `013-template-toolbar-button`, successor `015-two-way-write-back`. Parent spec: [`../spec.md`](../spec.md). Research baseline: [`research/synthesis.md`](research/synthesis.md) and [`research/research.md`](research/research.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | In Progress — shipped with documented deferrals (branch `impl`, commits `c4ceb74..02929b0`; CSS fix `c90aee6`; tests `86eee77`) |
| **Created** | 2026-08-24 |
| **Branch** | `014-record-detail-panel` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
This is an S-tier polish phase, not a capability project. The fork already has the record model (`RowData`, `src/data/types.ts:113-119`), the value helpers (`getColumnValue` at `src/data/ColumnDisplay.ts:63`; `stringifyValue` at `src/data/Stringify.ts:1`), and the table chrome (`TableRenderer.renderRow` → `renderCell`). What is missing is the visible Notion feel: a Name-cell OPEN affordance and a properties panel with header/hidden groups. Three risks shape the design:

1. **Title cell** — it already navigates on click (`DatabaseView.openRow` → `dataSource.openNote` at `src/views/DatabaseView.ts:7545-7548`) and already feeds Obsidian Page Preview (`HoverLinkPreview.ts:4-47` via `markNoteHoverLink` at `CellRenderer.ts:124-129`).
2. **Insertion point** — the iteration-10 candidate `setupRowInteractions` (`DatabaseView.ts:7529-7531`) is timing-wrong because `setupRow` runs at `TableRenderer.ts:468` before the cells exist at `:495-505`; the correct seam is `DatabaseView.renderCell` (~`7840-7848`) after `cellRenderer.renderCell` paints `db-title-cell` (`CellRenderer.ts:117-118`).
3. **Module-name collision** — `src/views/RecordDetailPanel.ts` is a live ~450-line **editable** calendar/timeline overlay that already exports `openRecordDetailPanel`, `closeRecordDetailPanel`, `refreshRecordDetailPanel`, `getOpenRecordDetailPath` (`RecordDetailPanel.ts:84-104`) and is already imported by `DatabaseView.ts:143`, `CalendarRenderer.ts:1402-1403`, `CalendarTimelineRenderer.ts:456-457`, and `EmbeddedDatabaseRenderer.ts:57-61`. Creating a second `RecordDetailPanel.ts` (in `src/data/` or anywhere) with the same export names is a compile-time and runtime collision. The research baseline never found this file. The new module must be a distinct sibling, not a name-share.

### Purpose
Ship a **display-only CSS-docked right side-peek** from a new `src/views/TableRecordPeek.ts` (a sibling of — and entirely distinct from — the existing calendar `src/views/RecordDetailPanel.ts`, which stays untouched), with an OPEN `<button>` appended as a sibling of the title `<a>` in `.db-title-cell`, Anytype's two-group IA (header + collapsible hidden; drop Anytype's third `local` group — no per-object local relations in this fork), and CSS scoped under `.note-database-container` using theme variables only. Do **not** reuse `openRow` / `dataSource.openNote`, do **not** reuse the calendar `openRecordDetailPanel` (it edits in place, calls `openNote`, uses `positionToolbarPopover` geometry, lacks scroll-dismiss, lacks a hidden group, and truncates values — it would ship 015 write-back and fight this phase's side-peek IA), do **not** use an Obsidian `Modal` (it blocks the grid; Notion's table default is Side peek), and do **not** restyle the core toolbar. Write-back stays in successor `015`. Nested children below own the ordered slices: TableRecordPeek module plus i18n first, then peek CSS, then title OPEN plus overlay lifecycle, then Mod+Enter, then display proofs.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- A new display-only module `src/views/TableRecordPeek.ts` (a sibling of the existing calendar `src/views/RecordDetailPanel.ts`, which stays untouched) exporting `attachTitleOpenAffordance`, `openTableRecordPeek`, `closeTableRecordPeek`, and `syncTableRecordPeek`. No `DataSource` import; view callbacks (`renderRecordIcon`, `returnFocus`) are injected by the host, never imported from `DataSource` or the calendar module.
- A Name-cell OPEN `<button class="db-record-open-btn">` appended as a **sibling of** the internal-link `<a>` inside `td.db-title-cell`, revealed on row hover (opacity 0 → 1), persistent at opacity 1 on `body.is-phone` via CSS only (no `isPhoneLayout()` JS, no `MouseEvent`-only path). When the title column is hidden, the affordance attaches to the row's first visible data column (`getVisibleColumns(...)[0]`) from the same `renderCell` hunk.
- A CSS-docked side-peek panel (`position: absolute; top:0; right:0; bottom:0; width: min(360px, 100%)` inside `.note-database-container`, which is already `position: relative; overflow: auto` at `styles.css:63-125`; `role="dialog"`, `aria-modal="false"`) with a header group (injected `renderRecordIcon` + `row.file.basename` + visible columns) and a collapsible hidden group. Hidden set = `getColumnsInOrder(config)` (`src/data/ColumnConfig.ts:64`) minus `getVisibleColumns(config, rows, state, pendingShowColumns)` (`ColumnConfig.ts:77-101`), skipping `file.name` and omitting empty readonly/derived values; omit Anytype's third `local` group. The reveal control is shown only when the hidden list is non-empty. Docking skips `getVisiblePopoverBounds` / flip / `positionToolbarPopover` (wrong geometry for a peek); the panel dismisses on container `scroll` (default) so it cannot detach inside the `overflow: auto` box.
- New CSS classes `.db-record-peek-panel`, `.db-record-open-btn`, `.db-record-peek-field` (do **not** reuse `.db-record-detail-*` — those truncate values and set `cursor: pointer` at `styles.css:7543-7618`). A delimited `.note-database-container …` block appended to plugin-root `styles.css` using only documented theme variables (`--background-primary`, `--background-secondary`, `--background-modifier-border`, `--background-modifier-hover` at `styles.css:35-45`). `z-index` 998 (below the calendar panel's 999 at `:7544` and below edit popovers 1000–1002).
- A Mod+Enter keyboard open path on a focused grid cell (bare Enter stays inline edit) and an Esc/close path via **document capture** (copying `RecordDetailPanel.ts:128-147, 207-209`), NOT a pushed Obsidian `Scope` (which would fight `DatabaseView`'s own `this.scope` / `Escape` → `handleInlineEditorEscape` at `:1202-1213`). `returnFocus` restores `td[data-note-database-row-path][data-note-database-column-key][tabindex="0"]` (`DatabaseView.ts:4197`).
- An overlay-lifecycle hunk in `DatabaseView.ts`: `hasActiveOverlay` selector (`:834`) gains `.db-record-peek-panel:not(.is-hidden)` so **New** is suppressed while the peek is open; `closeActiveOverlays` (`:864`) also calls `closeTableRecordPeek()`; `refresh()` (`:10483-10488`) calls `syncTableRecordPeek(this.rows)` (rebuild same `row.file.path` or close) next to the existing calendar sync. This is the stale-DOM fix: a peek mounted from `renderCell` would otherwise orphan on the next refresh.
- i18n data: `panel.open`, `panel.noProperties`, `panel.hiddenProperties` × en / zh-CN / zh-TW in `src/i18n.ts` (hard-coded `"OPEN"` breaks zh-CN/zh-TW).

### Out of Scope
- Restyling the core Obsidian toolbar or any existing view chrome (hard constraint — GoodBases had to revert exactly that; `patchToolbarNew` is the trap).
- Reusing `openRow` / `dataSource.openNote` (navigation), any Obsidian `Modal` (blocks the grid), or the calendar `openRecordDetailPanel` / `src/views/RecordDetailPanel.ts` (it edits in place, calls `openNote`, uses `positionToolbarPopover`, lacks scroll-dismiss, lacks a hidden group, and truncates values — reusing it ships 015 write-back and fights this phase's IA). The calendar module is touched only as a read-only reference for the Esc document-capture pattern.
- Reusing `.db-record-detail-*` CSS (truncates values, sets `cursor: pointer`); new classes only.
- Two-way write-back, body/markdown editing, and panel-body preview — owned by successor phase `015-two-way-write-back`.
- Any persistence changes: the panel is read-only, the hidden-group toggle is in-memory CSS only (do not copy Anytype `Storage.setToggle` into note files or the view def), and rollups stay display-only.
- New column types, view types, formula dialects, rollup kinds, or new formatters — the capability baseline is untouched and existing helpers are reused.
- Board / gallery / other views — table-only (Scenario 1). Extra view call sites would blow the budget.
- Anytype's third `local` group — no per-object local relations exist in this fork.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `specs/001-note-db-notion-parity-build/014-record-detail-panel/spec.md` | Edit | Level 2 specification rewritten to match synthesis + final-plan review |
| `specs/001-note-db-notion-parity-build/014-record-detail-panel/plan.md` | Edit | Level 2 implementation plan rewritten to match synthesis + final-plan review |
| `specs/001-note-db-notion-parity-build/014-record-detail-panel/tasks.md` | Edit | Level 2 task list rewritten to match synthesis ranked backlog + final-plan review |
| `specs/001-note-db-notion-parity-build/014-record-detail-panel/checklist.md` | Edit | Level 2 verification checklist rewritten to match synthesis edge cases + final-plan review |
| `specs/001-note-db-notion-parity-build/014-record-detail-panel/implementation-summary.md` | Untouched | Nothing is implemented yet |
| `src/views/TableRecordPeek.ts` (fork) | Create (planned) | Display-only CSS-docked side-peek panel + title-cell OPEN affordance; distinct exports (`attachTitleOpenAffordance`, `openTableRecordPeek`, `closeTableRecordPeek`, `syncTableRecordPeek`); no `DataSource` import; sibling of — and distinct from — the existing calendar `src/views/RecordDetailPanel.ts` |
| `src/views/DatabaseView.ts` (fork) | Edit (planned) | Three hunks: (A) `renderCell` (~7840-7848) attaches the affordance for `col.key === "file.name"` or the first visible data column when the title is hidden; (B) `handleDatabaseKeydown` (~1523) handles Mod+Enter before `editAtCellSelection()`; (C) overlay lifecycle — `hasActiveOverlay` (`:834`), `closeActiveOverlays` (`:864`), `refresh()` (`:10483-10488`) |
| `src/i18n.ts` (fork) | Edit (planned) | Add `panel.open`, `panel.noProperties`, `panel.hiddenProperties` × en / zh-CN / zh-TW |
| `styles.css` (fork, plugin root) | Edit (planned) | Append a delimited `.note-database-container …` block (panel + hover-reveal + phone persistent OPEN; new classes `.db-record-peek-panel` / `.db-record-open-btn` / `.db-record-peek-field`; zero `.db-record-detail-*` reuse); the only stylesheet Obsidian loads |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | TableRecordPeek renders a record's properties in Anytype-style header + hidden groups (the `local` group is omitted) | Header group (injected `renderRecordIcon` + title + visible columns) and a collapsible hidden group render; hidden set = `getColumnsInOrder(config)` (`ColumnConfig.ts:64`) minus `getVisibleColumns(config, rows, state, pendingShowColumns)` (`ColumnConfig.ts:77-101`), skipping `file.name`; hidden properties are revealable in-panel; the hidden reveal control is shown only when the hidden set is non-empty; empty readonly/derived hidden values are omitted |
| REQ-002 | A Name-cell OPEN affordance opens a display-only side-peek without navigating away | Hovering a table row reveals the OPEN `<button>` on `td.db-title-cell`; activating it opens the panel over the grid; the title `<a>` click → `openNote` navigation path is unchanged; the button carries no `data-note-database-hover-link` attribute; when the title column is hidden the affordance attaches to the row's first visible data column (`getVisibleColumns(...)[0]`) from the same `renderCell` hunk |
| REQ-003 | Core Obsidian toolbar is not restyled and the calendar panel is not reused | The phase diff contains zero edits to toolbar styles and zero edits to `src/views/RecordDetailPanel.ts`; panel CSS is scoped under `.note-database-container` with new `.db-record-peek-*` classes (no `.db-record-detail-*` reuse); `openRow` / `dataSource.openNote`, the calendar `openRecordDetailPanel`, and `patchToolbarNew` are not reused or patched |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Diff follows the EuroFormat isolated-diff model (one new file + few hunks) | 1 new view module (`src/views/TableRecordPeek.ts`) + i18n data (`src/i18n.ts`) + 1 appended `styles.css` block + 1 host file (`DatabaseView.ts`) with three hunks (`renderCell`, `handleDatabaseKeydown`, overlay lifecycle); clean `git rebase` onto upstream; `setupRowInteractions` stays row-menu-only; the existing calendar `src/views/RecordDetailPanel.ts` is untouched |
| REQ-005 | Mobile-safe and iCloud-safe | Phone OPEN is CSS-only (`body.is-phone .db-record-open-btn { opacity: 1 }`); no `isPhoneLayout()` JS, no hover-only or `MouseEvent`-only path; the module imports nothing from `DataSource` (write surface is `mutateFrontmatter` `:288` etc.); reads `row.frontmatter` / `row.computed` only; hidden-group toggle is in-memory CSS, not a vault write |
| REQ-006 | Existing capability baseline unchanged | Views, formula engines, filters, rollups (count\|sum\|avg\|list, display-only), and templates pass regression; the calendar event-card panel still edits in place; no new formatters or evaluation paths (NFR-S02) |
| REQ-007 | i18n covers all locales | `panel.open`, `panel.noProperties`, `panel.hiddenProperties` exist in `src/i18n.ts` for en / zh-CN / zh-TW; the peek UI shows no raw English in the zh locales |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Fork typecheck passes with the phase diff applied.
- **SC-002**: Diff audit shows zero core-toolbar selector edits, zero edits to `src/views/RecordDetailPanel.ts`, and the reconciled diff shape: 1 new view module (`src/views/TableRecordPeek.ts`) + i18n data (`src/i18n.ts`) + 1 appended `styles.css` block + 1 host file (`DatabaseView.ts`) with three hunks. Zero `.db-record-detail-*` selectors added. Grep of the new module returns no `DataSource` / `mutateFrontmatter` / `openNote` references.
- **SC-003**: Manual pass on desktop and mobile: hover-open (with CSS-only persistent OPEN on phone), hidden-group reveal, title-hidden fallback, zero-property row, long-value wrap, Mod+Enter/Esc + focus return, grid-scroll dismiss, view-switch dismisses the peek (no orphan DOM); the calendar event-card panel still edits in place; the zh locales show no raw English.
- **SC-004**: No writes issued by the panel (iCloud-safe; rollups remain display-only; the module imports nothing from `DataSource` and references no `mutateFrontmatter` / `openNote`).

### Acceptance Scenarios

- **Scenario 1**: **Given** a populated table view, **when** a row is hovered, **then** an OPEN affordance appears on the Name cell and activating it opens the CSS-docked side-peek panel over the grid (grid stays interactive).
- **Scenario 2**: **Given** the panel open on a record with hidden properties, **when** the hidden group is expanded, **then** non-empty hidden properties render in-panel; the reveal control is omitted when the hidden set is empty.
- **Scenario 3**: **Given** the phase diff, **when** toolbar style selectors and `.db-record-detail-*` selectors are searched, **then** no toolbar rules and no `.db-record-detail-*` rules are added or modified, and `src/views/RecordDetailPanel.ts` is unchanged.
- **Scenario 4**: **Given** the fork with the phase diff, **when** an upstream rebase is simulated, **then** only the single host file's three hunks plus the appended `styles.css` block and `src/i18n.ts` require attention.
- **Scenario 5**: **Given** the title column is hidden, **when** a row renders, **then** a compact OPEN control attaches to the row's first visible data column (`getVisibleColumns(...)[0]`) from the same `renderCell` hunk (still one call site).
- **Scenario 6**: **Given** the panel is open and the `.note-database-container` scrolls, **then** the panel dismisses (default) so it cannot detach inside the `overflow: auto` box.
- **Scenario 7**: **Given** the panel is open and the table re-renders (`refresh()`) or the user switches views (which fires `closeActiveOverlays`), **then** `syncTableRecordPeek` rebuilds the same `row.file.path` or closes the panel, and the view switch dismisses the peek — no orphan DOM remains.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Title cell already navigates and feeds Page Preview | OPEN either navigates away (violates REQ-002) or fights the hover-preview | Button is a sibling of the `<a>`, not inside it; `preventDefault` + `stopPropagation`; no `data-note-database-hover-link` on the button; `markNoteHoverLink` stays on the title `<a>` (`CellRenderer.ts:124-129`) |
| Risk | Wrong insertion point (`setupRowInteractions` runs before cells exist) | Affordance never attaches; silent failure | Attach in `renderCell` (~7840-7848) after `cellRenderer.renderCell` paints `db-title-cell`; `setupRowInteractions` stays row-menu-only |
| Risk | Module-name collision with the existing calendar `src/views/RecordDetailPanel.ts` | Compile-time and runtime collision; duplicate exports | New module is `src/views/TableRecordPeek.ts` with distinct exports (`attachTitleOpenAffordance`, `openTableRecordPeek`, `closeTableRecordPeek`, `syncTableRecordPeek`); the calendar module is untouched |
| Risk | Reusing the calendar panel ships 015 write-back | Reusing `openRecordDetailPanel` brings `editCell`, `openNote`, `positionToolbarPopover` geometry, truncation CSS, no hidden group, no scroll-dismiss | Sibling display-only peek; never call the calendar `openRecordDetailPanel`; new `.db-record-peek-*` CSS, no `.db-record-detail-*` reuse |
| Risk | Stale DOM after `refresh()` / view switch | A peek mounted from `renderCell` orphans on the next re-render (ship blocker) | Third `DatabaseView` hunk: `hasActiveOverlay` selector, `closeActiveOverlays` calls `closeTableRecordPeek()`, `refresh()` calls `syncTableRecordPeek(this.rows)` |
| Risk | Esc fights `DatabaseView`'s own `Scope` | A pushed second `Scope` competes with `this.scope` / `Escape` → `handleInlineEditorEscape` (`:1202-1213`) | Esc via document capture (copy `RecordDetailPanel.ts:128-147, 207-209`), not a pushed `Scope`; `returnFocus` restores the roving cell |
| Risk | Wrong hidden-set math (`config.columns` does not exist) | Hidden group renders the wrong set or crashes | Hidden = `getColumnsInOrder(config)` (`ColumnConfig.ts:64`) minus `getVisibleColumns(config, rows, state, pendingShowColumns)` (`ColumnConfig.ts:77-101`); `ViewConfig` has `schema.columns` / `columnOrder` / `hiddenColumns?`, not `.columns` |
| Risk | Title column hidden → `col.key === "file.name"` never runs | No affordance appears (Scenario 5 fails) | Attach on the first visible data column (`getVisibleColumns(...)[0]`) from the same `renderCell` hunk |
| Risk | Scope creep into toolbar restyle | GoodBases had to revert exactly that; violates a hard constraint | Zero toolbar selectors; diff-audit for toolbar selectors before completion |
| Risk | Panel looks foreign under Obsidian themes | Diminishes the polish value | Style from theme CSS variables only (`styles.css:35-45`); no hard-coded colors |
| Risk | Hover does not exist on touch | Hover-open is unusable on mobile | CSS-only persistent OPEN on `body.is-phone` (`body.is-phone .db-record-open-btn { opacity: 1 }`); no `isPhoneLayout()` JS, no `MouseEvent`-only path |
| Risk | Hard-coded `"OPEN"` breaks zh-CN/zh-TW | i18n regression | Add `panel.open` / `panel.noProperties` / `panel.hiddenProperties` × en / zh-CN / zh-TW in `src/i18n.ts` (REQ-007) |
| Risk | Keyboard conflict with inline edit | Bare Enter is already inline edit | Only Mod+Enter opens; Esc while open closes the panel first via document capture |
| Dependency | Existing table-view rendering in the fork | Panel mounts on `renderCell` | Keep host-file hunks to three; `setupRowInteractions` stays row-menu-only |
| Dependency | Research baseline | UX decisions derive from peer-app mining | Derived from `research/synthesis.md` and `research/research.md` (this phase) |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Panel opens without layout jank; CSS is scoped under `.note-database-container` and adds no global style recalcs; full rebuild on each open is cheap because there are no writes.

### Security
- **NFR-S01**: No secrets, credentials, or telemetry in the panel or its CSS.
- **NFR-S02**: No new evaluation paths; the existing sandboxed engines remain the only executors; existing helpers (`stringifyValue` at `src/data/Stringify.ts:1`) are reused, no new formatters.

### Reliability
- **NFR-R01**: Panel is read-only; the module imports nothing from `DataSource`; no churny writes (iCloud-safe); rollups stay display-only (`ColumnDef` comment at `types.ts:69-70`).
- **NFR-R02**: Diff stays rebase-friendly: 1 new view module + i18n data + 1 appended `styles.css` block + 1 host file (`DatabaseView.ts`) with three hunks on the EuroFormat "one new file + few hunks" model.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **Title column hidden:** `db-title-cell` is only added when `file.name` is in the visible column loop (`CellRenderer.ts:117-118`); if missing, attach a compact OPEN control on the row's first visible data column (`getVisibleColumns(...)[0]`) from the same `renderCell` hunk.
- **Zero properties:** one muted `t("panel.noProperties")` row, not an empty hole (not GoodBases' CSS-hide-everything, not a broken header).
- **Many hidden properties:** the hidden list scrolls inside the panel (`overflow-y: auto`); the reveal button is omitted when the hidden set is empty.
- **Empty hidden values:** omit empty readonly/derived hidden rows (Anytype filter at `relation.tsx:40-42`); still show the hidden group if any non-empty hidden property exists.
- **Long values:** wrap within the panel; no truncation or overflow; no horizontal scroll (do not reuse `.db-record-detail-*` which truncates at `styles.css:7592-7597`).

### Error Scenarios
- **OPEN vs title click vs Page Preview:** button outside the `<a>`, no hover-link attribute, stop the click; title click remains navigation.
- **Viewport edge:** the panel is CSS-docked to the right of `.note-database-container` (`position: absolute; width: min(360px, 100%)`); on phone it is full-width for free. No `getVisiblePopoverBounds` / flip / `positionToolbarPopover` (wrong geometry for a peek). Dismiss on container `scroll` so the panel cannot detach inside the `overflow: auto` box.
- **Keyboard-open path must work alongside hover-open:** Mod+Enter on a focused cell opens; bare Enter stays inline edit (`DatabaseView.ts:1523-1526`); Esc while open closes the panel first via document capture (not a pushed `Scope`).
- **Roving tabindex:** OPEN `tabIndex="-1"` so it is not an extra Tab stop between cells (same rule as the icon gutter, `TableRenderer.ts:491-493`); keyboard users hit the button via hover/tap or Mod+Enter.

### Concurrent Operations
- **Panel open while inline-edit is active on another row:** both stay functional; the panel is keyed to `row.file.path`.
- **Grid scroll while the panel is open:** dismiss (default) on container `scroll` so the panel cannot detach; follow-on-scroll is the alternative if the operator wants Notion-like stickiness.
- **Re-render / refresh / view switch:** `syncTableRecordPeek(this.rows)` rebuilds from the same `row.file.path` or closes; `closeActiveOverlays` also calls `closeTableRecordPeek()` (fired on view switch); never keep a stale DOM node after `renderTable` or a view switch.

### Mobile
- Phone OPEN is CSS-only: `body.is-phone .note-database-container .db-record-open-btn { opacity: 1 }` plus the row-hover rule copied from `styles.css:770`. No `isPhoneLayout()` JS, no `MouseEvent`-only path. The docked panel becomes full-width for free (`width: min(360px, 100%)`). AppFlowy's `MobileRowDetailPage` full-page route is **not** the fork target; overlay + tap is.

### iCloud / display-only
- Enforced by construction: the module imports nothing from `DataSource` (write surface is `mutateFrontmatter` `:288`, `updateFrontmatter` `:314`, `createNote` `:328`, `duplicateNote` `:360`, `trashNote` `:389`, `renameNote` `:409`, `updateViewDefFile` `:991`). Reads `row.frontmatter` and `row.computed` only. The hidden-group toggle is in-memory CSS, not a vault write. No new evaluation paths (NFR-S02).

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 8/25 | One panel module + appended `styles.css` block + ≤3 call sites |
| Risk | 10/25 | Title-cell navigation/Page-Preview conflict; wrong insertion point; toolbar-restyle trap; mobile hover fallback |
| Research | 8/20 | Peer-app UX mining done in this phase's 10 research iterations |
| **Total** | **26/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

Operator decisions (defaults locked in plan.md from the final-plan review; revisit only if a default proves wrong at build time):

1. Module name / location — default **`src/views/TableRecordPeek.ts`**, not `src/data/RecordDetailPanel.ts`. The calendar module already owns that name and those exports; isolation = "one new file + few hunks", not "must live under `src/data/`".
2. Reuse calendar panel vs sibling peek — default **sibling, display-only**. Reusing `openRecordDetailPanel` ships `editCell` write-back (015), `openNote` navigation, toolbar-popover geometry, truncation CSS, and no hidden group.
3. Side-peek vs centered Modal — default **CSS-docked side-peek** (`aria-modal="false"`). Container is `overflow: auto` (`styles.css:63-125`); dismiss-on-scroll is the detach prevention. Switch to `Modal` only if the finance-vault layout cannot tolerate the dock.
4. Grid scroll while open: dismiss vs follow — default **dismiss** (container `scroll`).
5. Mod+Enter vs button-only keyboard — default **both** (visible button plus Mod+Enter; do not steal bare Enter). Esc via document capture, not a pushed `Scope`.
6. Empty hidden values — default **omit** empty readonly/derived hidden rows.
7. Hidden-group toggle persistence — default **in-memory only** for the panel instance (no view-def or note writes; do not copy Anytype `Storage.setToggle`).
8. CSS isolation vs Obsidian loader — default **append a delimited block to plugin-root `styles.css`** with new `.db-record-peek-*` classes (no `.db-record-detail-*` reuse; a second runtime stylesheet will not load).
9. Title click still opens the note — default **yes** (OPEN is peek; the title `<a>` remains navigation; do not reroute `openRow` or patch `patchToolbarNew`).
10. Panel body / markdown preview — default **no** (properties IA only this phase; body editing and write-back belong to 015).
11. Board / gallery / other views — default **table-only**.
12. `aria-modal` — default **`false`** for side-peek (`true` only if switching to a blocking Modal).
13. z-index vs calendar panel — default **peek at 998**, calendar detail at 999 (`styles.css:7544`). They should not be open together; `refresh` / `closeActiveOverlays` is the backstop.
14. Effort override — default **M (~6h)**, not the synthesis plan's 2.5h S. The calendar coexistence and the refresh/overlay hunk are not optional.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Research Baseline**: See `research/synthesis.md` (decision-ready) and `research/research.md` (full evidence trail)

<!-- /ANCHOR:related-docs -->

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | 001-table-record-peek-module/ | Create `src/views/TableRecordPeek.ts` plus i18n `panel.*` keys as a display-only sibling of the calendar panel | Complete |
| 2 | 002-peek-panel-css/ | Append toolbar-safe theme-variable peek CSS, including phone-persistent OPEN | Complete |
| 3 | 003-title-open-affordance/ | Attach Name-cell OPEN in `renderCell` and wire overlay lifecycle so refresh cannot orphan the peek | Complete |
| 4 | 004-peek-keyboard-open/ | Open the peek with Mod+Enter before the bare-Enter edit branch | Complete |
| 5 | 005-peek-display-proof/ | Prove typecheck, greps, and the locked manual desktop/phone scenarios | Deferred |

Future / out of this phase (not child folders): board/gallery hosts; body/markdown preview and two-way write-back (successor `015`); Anytype `local` group; Anytype `Storage.setToggle`; reuse of calendar `openRecordDetailPanel`; Obsidian `Modal`; follow-on-scroll; a pushed keymap `Scope`; `src/data/RecordDetailPanel.ts`; `PopoverPosition` clamp/flip.

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001-table-record-peek-module | 002-peek-panel-css | `src/views/TableRecordPeek.ts` exports `attachTitleOpenAffordance`, `openTableRecordPeek`, `closeTableRecordPeek`, `syncTableRecordPeek`; i18n `panel.open` / `panel.noProperties` / `panel.hiddenProperties` exist × en / zh-CN / zh-TW; calendar `src/views/RecordDetailPanel.ts` is untouched | Grep of the new module shows no `DataSource` / `mutateFrontmatter` / `openNote`; calendar exports at `RecordDetailPanel.ts:84-104` still compile |
| 002-peek-panel-css | 003-title-open-affordance | Plugin-root `styles.css` has one appended `.note-database-container` block for `.db-record-peek-panel` / `.db-record-open-btn` / `.db-record-peek-field`; phone OPEN is CSS-only | `git diff styles.css` is one appended block; grep of that diff for `toolbar` / `patchToolbarNew` / `.db-record-detail-` is empty; `body.is-phone` opacity-1 rule present; z-index 998 |
| 003-title-open-affordance | 004-peek-keyboard-open | `renderCell` (~7840-7848) attaches OPEN on `file.name` or the first visible data column; overlay selector, `closeActiveOverlays`, and `refresh()` sync the peek | Title `<a>` still navigates (`CellRenderer.ts:126-129`); button has no `data-note-database-hover-link`; `refresh()` calls `syncTableRecordPeek(this.rows)` (`DatabaseView.ts:10483-10488`) |
| 004-peek-keyboard-open | 005-peek-display-proof | Mod+Enter on a focused cell opens the peek and returns before `editAtCellSelection()`; bare Enter / F2 unchanged | Mod+Enter opens peek; Enter still edits (`DatabaseView.ts:1523-1531`); Esc stays document capture in the module (`RecordDetailPanel.ts:128-147` pattern), not a pushed `Scope` |
<!-- /ANCHOR:phase-map -->
