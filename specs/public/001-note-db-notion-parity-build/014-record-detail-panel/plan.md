---
title: "Implementation Plan: Record Detail Panel / Hover-Open UX"
description: "Locked build design for a display-only CSS-docked right side-peek record detail panel: new src/views/TableRecordPeek.ts (distinct sibling of the existing calendar src/views/RecordDetailPanel.ts, no DataSource import), a Name-cell OPEN button, Anytype two-group IA, CSS appended to plugin-root styles.css with new .db-record-peek-* classes, i18n data in src/i18n.ts, and three hunks in DatabaseView.ts (renderCell, handleDatabaseKeydown, overlay lifecycle)."
trigger_phrases:
  - "record detail panel"
  - "hover open"
  - "implementation plan"
  - "detail panel"
  - "properties panel"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/014-record-detail-panel"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "markdown-agent"
    recent_action: "Reconciled docs vs final-plan.md per-step acceptance (grep + view-switch); Planned"
    next_safe_action: "Build phase 014 per plan.md and tasks.md (8 ordered steps)"
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
# Implementation Plan: Record Detail Panel / Hover-Open UX

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript + appended `styles.css` block (Obsidian plugin fork) |
| **Framework** | Obsidian plugin API, vanilla TS, EuroFormat isolated-diff model |
| **Storage** | None new — read-only panel over already-hydrated `RowData` + `ViewConfig` |
| **Testing** | Fork typecheck, diff audit (zero toolbar selectors, zero `.db-record-detail-*` selectors, zero edits to `src/views/RecordDetailPanel.ts`, three hunks in one host file), i18n locale check, manual desktop + mobile pass |

### Overview
Build a display-only CSS-docked right side-peek record detail panel from a new `src/views/TableRecordPeek.ts` (a distinct sibling of — and entirely distinct from — the existing calendar `src/views/RecordDetailPanel.ts`, which stays untouched), plus a Name-cell OPEN affordance and Anytype-style header/hidden property groups. Delivered as an isolated diff on the EuroFormat "one new file + few hunks" model: 1 new view module + i18n data (`src/i18n.ts`) + 1 appended `styles.css` block + 1 host file (`DatabaseView.ts`) with three hunks (`renderCell`, `handleDatabaseKeydown`, overlay lifecycle). Hard constraints: no restyle of the core Obsidian toolbar, no reuse of `openRow` / `dataSource.openNote`, no reuse of the calendar `openRecordDetailPanel`, no Obsidian `Modal`, no `DataSource` import (display-only / iCloud-safe), no `.db-record-detail-*` CSS reuse. Status Planned — nothing is built yet.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Research baseline read (`research/synthesis.md` + `research/research.md` + `research/final-plan.md` of this phase).
- [ ] Fork table-view rendering and record model read; the existing calendar `src/views/RecordDetailPanel.ts` (`:23-218`, exports at `:84-104`) read to confirm the export-name collision; the three `DatabaseView.ts` hunk sites confirmed (`renderCell` ~7840-7848; `handleDatabaseKeydown` ~1523; overlay lifecycle `:834`, `:864`, `:10483-10488`); `ColumnConfig.ts:64, 77-101` and `Stringify.ts:1` confirmed.
- [ ] Scope frozen to the new view module + i18n data + appended `styles.css` block + three hunks in one host file; toolbar restyle, `openRow`, the calendar `openRecordDetailPanel`, `Modal`, `DataSource` imports, and `.db-record-detail-*` CSS reuse excluded.

### Definition of Done
- [ ] `src/views/TableRecordPeek.ts` created with `attachTitleOpenAffordance`, `openTableRecordPeek`, `closeTableRecordPeek`, `syncTableRecordPeek` exports and zero `DataSource` imports; `src/views/RecordDetailPanel.ts` untouched.
- [ ] OPEN affordance wired in `renderCell` for `col.key === "file.name"` **or** the first visible data column when the title is hidden; Mod+Enter wired in `handleDatabaseKeydown` before `editAtCellSelection()`; overlay-lifecycle hunk wired (`hasActiveOverlay` selector, `closeActiveOverlays`, `refresh()` sync); `setupRowInteractions` untouched (row-menu-only).
- [ ] i18n keys `panel.open`, `panel.noProperties`, `panel.hiddenProperties` added to `src/i18n.ts` for en / zh-CN / zh-TW.
- [ ] Delimited `.note-database-container …` block appended to plugin-root `styles.css` with new `.db-record-peek-*` classes; zero toolbar selectors; zero `.db-record-detail-*` selectors.
- [ ] Fork typecheck passes; diff audit shows 1 view module + i18n data + 1 `styles.css` block + 1 host file with three hunks; grep of the new module returns no `DataSource` / `mutateFrontmatter` / `openNote` references; manual desktop + mobile pass done (incl. view-switch dismissal); zh locales show no raw English.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated "one new file + few hunks" model, following the `EuroFormat.ts` precedent in the fork: `src/data/EuroFormat.ts` is a single self-contained module consumed at exactly two call sites (`src/views/CellRenderer.ts:13`, `src/views/SummaryRenderer.ts:7`). The isolation lesson is "one new file + few hunks", NOT "must live under `src/data/`" — `EuroFormat.ts` is pure number formatters with no DOM / `App` / `Scope`, whereas this module mounts DOM, pushes a keymap, and needs `renderRecordIcon` / `getVisibleColumns` / `PopoverPosition`-class deps. Putting it in `src/data/` would either import `src/views/` (breaking the cited isolation rule) or inject so many deps the "pure module" is fiction. So the new module lives in `src/views/` as a sibling of the existing calendar `RecordDetailPanel.ts`, with distinct export names to avoid the compile-time and runtime collision. The existing plugin code is touched only at the three `DatabaseView.ts` hunks and the appended `styles.css` block; upstream rebases stay clean.

### Locked design

**Module:** `src/views/TableRecordPeek.ts` (sibling of the existing calendar `src/views/RecordDetailPanel.ts`, which stays untouched; no `DataSource` import; view callbacks injected by the host).

**Exports:**
- `attachTitleOpenAffordance(td, row, deps)` — insert the OPEN control into an already-rendered title cell (or the first visible data cell when the title column is hidden).
- `openTableRecordPeek({ anchor, row, config, visibleColumns, allColumns, container, returnFocus, renderRecordIcon })` — mount the CSS-docked side-peek, own Esc via document capture.
- `closeTableRecordPeek()` — unmount, restore focus.
- `syncTableRecordPeek(rows)` — rebuild the same `row.file.path` or close (called from `refresh()`).

**Core algorithm**
1. **Single-instance state machine** local to the module: `closed → open(rowPath) → closed`. Opening another row replaces the current panel. Never call `DatabaseView.openRow` (`src/views/DatabaseView.ts:7545-7548`) or the calendar `openRecordDetailPanel`.
2. **Affordance.** After the title cell is painted (`col.key === "file.name"` → `td.db-title-cell` at `CellRenderer.ts:117-118`), append a `<button type="button" class="db-record-open-btn" tabindex="-1">` as a **sibling of** the internal-link `<a>`, not inside it. Default CSS `opacity: 0`; reveal with `.note-database-container tr:hover .db-record-open-btn { opacity: 1 }` (same idiom as `.db-heading-row:hover .db-heading-more-button` at `styles.css:770`). On `body.is-phone`, force `opacity: 1` via CSS only (no `isPhoneLayout()` JS). Click: `preventDefault` + `stopPropagation`, then open. Do **not** set `data-note-database-hover-link` on the button (`HoverLinkPreview.ts:4-47`); leave `markNoteHoverLink` on the title `<a>` (`CellRenderer.ts:124-129`) so modifier-hover Page Preview and click-to-note stay the navigation path. **Title-hidden fallback:** if `file.name` is not in `visible`, attach on `visible[0]?.key` from the same `renderCell` hunk (Scenario 5).
3. **Panel anatomy = CSS-docked side-peek**, `position: absolute; top:0; right:0; bottom:0; width: min(360px, 100%)` inside `.note-database-container` (which is already `position: relative; overflow: auto` at `styles.css:63-125` — NOT `:4032`, which is `.db-table-wrap`). Grid left remains interactive. Not GoodBases' centered `Modal` (blocks the grid; Notion table default is Side peek). `role="dialog"`, `aria-label` = basename, `aria-modal="false"` (no full focus trap). Class `db-record-peek-panel` (do NOT reuse `.db-record-detail-panel`). Tab cycles panel controls; Esc closes. Phone becomes full-width for free (`width: min(360px, 100%)`).
4. **Positioning.** CSS-docked right; NO `getVisiblePopoverBounds` / flip / `setPosition` / `positionToolbarPopover` (wrong geometry for a peek). Dismiss on container `scroll` (spec default) so the panel cannot detach inside the `overflow: auto` box; also dismiss on `resize`.
5. **Data flow (display-only).** Input is already-hydrated `RowData` (`src/data/types.ts:113-119`) + current `ViewConfig`. Header: injected `renderRecordIcon: (parent, row, config) => this.renderRowRecordIcon(...)` (NOT the token-level `RecordIconRenderer.ts:18` export) + `row.file.basename`. Property rows: `getColumnValue(row, col)` (`src/data/ColumnDisplay.ts:63`) + `stringifyValue` (`src/data/Stringify.ts:1`) over `getVisibleColumns(config, rows, this.vs(), this.pendingShowColumns)` (`src/data/ColumnConfig.ts:77-101` — four args; NOT `TableRenderer.ts:24`, which is the actions interface), skipping `file.name`. Hidden group: `getColumnsInOrder(config)` (`ColumnConfig.ts:64`) minus that visible set (`ViewConfig` has `schema.columns` / `columnOrder` / `hiddenColumns?`, NOT `.columns`); skip `file.name`; omit empty readonly/derived values. Full rebuild on each open (cheap; no writes). CSS class-toggle for hidden-group collapse (Anytype height animation is unnecessary). Show the hidden reveal control only when the hidden list is non-empty (AppFlowy `numHiddenFields != 0`). Zero-property record: one muted `t("panel.noProperties")` row, not an empty hole.
6. **Keyboard.** OPEN is a real button (Space/Enter activate it). Row-level open: **Mod+Enter** on a focused grid cell. While open, Esc closes the panel via **document capture** (copy `RecordDetailPanel.ts:128-147, 207-209`), NOT a pushed Obsidian `Scope` — `DatabaseView` already owns `this.scope` and registers `Escape` → `handleInlineEditorEscape` (`:1202-1213`); a second `Scope` would fight it. `returnFocus` restores `td[data-note-database-row-path][data-note-database-column-key][tabindex="0"]` (`DatabaseView.ts:4197`).
7. **CSS.** Append a delimited `.note-database-container …` block to plugin-root `styles.css` using only documented theme variables (`styles.css:35-45`: `--background-primary`, `--background-secondary`, `--background-modifier-border`, `--background-modifier-hover`). New classes only: `.db-record-peek-panel`, `.db-record-open-btn`, `.db-record-peek-field`. `td.db-title-cell { position: relative }` so the button can sit on the Name cell. Long values wrap (no `white-space: nowrap` / ellipsis); the panel body `overflow-y: auto`; no horizontal scroll. `z-index` 998 (below the calendar panel's 999 at `:7544` and below edit popovers 1000–1002). Zero toolbar selectors; zero `.db-record-detail-*` selectors.

**Call sites (1 host file, three hunks + styles.css + i18n):**
1. `src/views/DatabaseView.ts` — `renderCell` (~7840-7848), table-only (this callback is wired at `DatabaseView.ts:586`; `TableRenderer.ts:502` invokes `this.actions.renderCell(...)`): after `cellRenderer.renderCell` + conditional format, compute `visible = getVisibleColumns(config, this.rows, this.vs(), this.pendingShowColumns)`; attach if `col.key === "file.name"` **or** (`file.name` not in `visible` **and** `col.key === visible[0]?.key`). `attachTitleOpenAffordance(td, row, { open: () => openTableRecordPeek({ anchor: td, row, config, visibleColumns: visible, allColumns: getColumnsInOrder(config), container: this.containerEl_, returnFocus: () => td.focus(), renderRecordIcon: (p, r, c) => this.renderRowRecordIcon(p, r, c) }) })`.
2. `src/views/DatabaseView.ts` — `handleDatabaseKeydown` (~1523-1526): same `mod = event.metaKey || event.ctrlKey` already at `:1441`; **before** the bare-Enter `editAtCellSelection()` branch, if `mod && event.key === "Enter"` and a cell is focused, `preventDefault`, open the peek for that row, return. Bare Enter / F2 unchanged.
3. `src/views/DatabaseView.ts` — overlay lifecycle: `hasActiveOverlay` selector (`:834`) gains `.db-record-peek-panel:not(.is-hidden)` so **New** is suppressed while the peek is open; `closeActiveOverlays` (`:864`) also calls `closeTableRecordPeek()`; `refresh()` (`:10483-10488`) calls `syncTableRecordPeek(this.rows)` next to the existing calendar sync (do NOT route through `refreshRecordDetailPanel`).
4. `src/i18n.ts` — add `panel.open`, `panel.noProperties`, `panel.hiddenProperties` × en / zh-CN / zh-TW.
5. `styles.css` — append the panel + hover-reveal + phone persistent OPEN rules (the only stylesheet Obsidian loads; do not inject `<link>` from `main.ts`).

`setupRowInteractions` (`DatabaseView.ts:7529-7531`) stays row-menu-only. Grouped tables come for free: same `renderRow` → `renderCell` path (`TableRenderer.ts:450-505`).

### Key Components
- **TableRecordPeek module** (`src/views/TableRecordPeek.ts`): single-instance state machine, OPEN affordance, CSS-docked side-peek mount/Esc, header + hidden group rendering, `syncTableRecordPeek` rebuild.
- **Appended `styles.css` block**: panel + hover-reveal + phone persistent OPEN rules scoped under `.note-database-container`; new `.db-record-peek-*` classes; theme variables only; zero toolbar selectors; zero `.db-record-detail-*` selectors.
- **Three `DatabaseView.ts` hunks**: `renderCell` (affordance, with title-hidden fallback), `handleDatabaseKeydown` (Mod+Enter), and overlay lifecycle (`hasActiveOverlay` / `closeActiveOverlays` / `refresh()`).
- **i18n data** (`src/i18n.ts`): `panel.open` / `panel.noProperties` / `panel.hiddenProperties` × three locales.

### Data Flow
Row hover (or tap on phone via CSS-only persistent OPEN, or Mod+Enter on a focused cell) → OPEN revealed/activated → `openTableRecordPeek` mounts the CSS-docked side-peek inside `.note-database-container` → reads already-hydrated `RowData` + `ViewConfig` → renders header (injected `renderRecordIcon` + basename) and property rows via `getColumnValue` + `stringifyValue` over `getVisibleColumns`, plus a collapsible hidden group (`getColumnsInOrder` minus visible) → Esc, outside-click, or container-scroll dismisses; `returnFocus` returns to the roving cell. On `refresh()`, `syncTableRecordPeek` rebuilds or closes; `closeActiveOverlays` also closes. Read-only end to end; the module imports nothing from `DataSource`; rollups stay display-only; no writes.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read research baseline (`research/synthesis.md` + `research/research.md` + `research/final-plan.md` of this phase).
- [ ] Read the existing calendar `src/views/RecordDetailPanel.ts:23-218` (editable overlay, class `db-record-detail-panel`, `positionToolbarPopover`, no scroll dismiss) and its exports at `:84-104`; confirm the export-name collision. Read `DatabaseView.ts:143, 586, 834, 864, 10418-10440, 10483-10488`, `CellRenderer.ts:117-129`, `TableRenderer.ts:450-505` (invoke at `:502`), `ColumnConfig.ts:64, 77-101`, `HoverLinkPreview.ts:8-17`, `Stringify.ts:1`, `styles.css:63-125, 770, 7543-7618`, `EuroFormat.ts:1-42`; confirm the three hunk sites and the "one new file + few hunks" shape.

### Phase 2: Core Implementation
- [ ] Create `src/views/TableRecordPeek.ts` (no `DataSource` import; view callbacks injected): single-instance state machine, `attachTitleOpenAffordance` (with title-hidden fallback on `visible[0]`), `openTableRecordPeek` (CSS-docked mount + document-capture Esc + scroll/resize dismiss), `closeTableRecordPeek` (unmount + `returnFocus`), `syncTableRecordPeek` (rebuild same path or close), header + hidden group rendering (`getColumnsInOrder` minus `getVisibleColumns`), zero-property empty state, empty-hidden-value omission.
- [ ] Add i18n keys `panel.open`, `panel.noProperties`, `panel.hiddenProperties` × en / zh-CN / zh-TW to `src/i18n.ts`.
- [ ] Append the delimited `.note-database-container …` block to plugin-root `styles.css` (new `.db-record-peek-*` classes; panel + hover-reveal + phone persistent OPEN; `td.db-title-cell { position: relative }`; theme variables only; `z-index` 998; zero toolbar selectors; zero `.db-record-detail-*` selectors).
- [ ] Wire the three `DatabaseView.ts` hunks: `renderCell` (affordance + title-hidden fallback), `handleDatabaseKeydown` (Mod+Enter before `editAtCellSelection()`), overlay lifecycle (`hasActiveOverlay` selector, `closeActiveOverlays`, `refresh()` sync). Leave `setupRowInteractions` row-menu-only. Leave `src/views/RecordDetailPanel.ts` untouched.

### Phase 3: Verification
- [ ] Run fork typecheck with the phase diff.
- [ ] Diff-audit: zero toolbar style edits; zero `.db-record-detail-*` selectors; zero edits to `src/views/RecordDetailPanel.ts`; diff shape 1 view module + i18n data + 1 `styles.css` block + 1 host file with three hunks; grep of the new module returns no `DataSource` / `mutateFrontmatter` / `openNote` references; i18n keys present in all three locales.
- [ ] Manual desktop + mobile pass: hover-open, CSS-only persistent OPEN on phone, title-hidden fallback, hidden-group reveal + empty-hidden omission, zero-property row, long wrap, Mod+Enter / Esc + focus return, inline-edit on another row, grid-scroll dismiss, view-switch dismisses the peek (no orphan DOM), title click still opens the note, calendar event-card panel still edits; zh locales show no raw English. Regression sweep of views/formulas/rollups.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Typecheck | Fork with phase diff | Fork's own check command (resolve from `note-database-fork/package.json` at build time) |
| Diff audit | Phase diff | `git diff` review + selector grep for toolbar styles and `.db-record-detail-*`; grep the new module for `DataSource` / `mutateFrontmatter` / `openNote`; grep the diff for accidental edits to `src/views/RecordDetailPanel.ts` |
| i18n check | `src/i18n.ts` + peek UI | Confirm `panel.open` / `panel.noProperties` / `panel.hiddenProperties` exist for en / zh-CN / zh-TW; switch locale and confirm no raw English in zh |
| Manual pass | Desktop + mobile | Hover-open, CSS-only persistent OPEN on phone, title-hidden fallback, hidden-group reveal + empty-hidden omission, zero-property row, long wrap, Mod+Enter/Esc + focus return, inline-edit concurrency, grid-scroll dismiss, view-switch dismisses the peek, title click still opens the note, calendar event-card panel still edits |
| Regression | Existing views/formulas/rollups + calendar panel | Manual spot-check in the finance vault; confirm the calendar event-card panel still edits in place |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| This phase's research baseline (`research/synthesis.md`, `research/research.md`, `research/final-plan.md`) | Internal | Green | UX decisions lose their evidence base |
| Fork `DatabaseView` hunk sites (`renderCell` ~7840-7848, `handleDatabaseKeydown` ~1523, overlay lifecycle `:834`/`:864`/`:10483-10488`) | Internal | Green | No mount point / no keyboard path / stale DOM after refresh |
| `ColumnConfig.getVisibleColumns` / `getColumnsInOrder` (`ColumnConfig.ts:64, 77-101`) | Internal | Green | Hidden-set math wrong; title-hidden fallback wrong |
| `stringifyValue` (`src/data/Stringify.ts:1`) | Internal | Green | Property values not stringified display-only |
| Existing calendar `src/views/RecordDetailPanel.ts` (`:128-147, 207-209`) | Internal | Green | No document-capture Esc reference pattern |
| `.note-database-container` container (`styles.css:63-125`, `position: relative; overflow: auto`) | Internal | Green | No CSS-dock anchor; no scroll-dismiss box |
| Theme CSS variables (`styles.css:35-45`) | Internal | Green | Panel cannot theme-match Obsidian |
| `src/i18n.ts` locale structure | Internal | Green | No place to add `panel.*` keys |
| Upstream fork base | External | Green | Isolated-diff model keeps rebases clean |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Fork typecheck fails with the phase diff, the diff audit finds toolbar style edits or `.db-record-detail-*` selectors or edits to `src/views/RecordDetailPanel.ts`, the new module imports `DataSource`, or i18n keys are missing in any locale.
- **Procedure**: Revert the phase diff via git (delete `src/views/TableRecordPeek.ts`, restore the `src/i18n.ts` keys, restore the `styles.css` block, restore the three `DatabaseView.ts` hunks); re-run typecheck to confirm the fork is back to baseline.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | Core Implementation |
| Core Implementation | Setup | Verification |
| Verification | Core Implementation | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 30 minutes |
| Core Implementation | Medium | 4 hours |
| Verification | Medium | 1.5 hours |
| **Total** | | **~6 hours (effort M)** |

> Effort override from the final-plan review: the synthesis plan's 2.5h / S ignored calendar coexistence, title-cell vs Page Preview, hidden-set math, the refresh/overlay hunk, and CSS that must not reuse `.db-record-detail-*`. This phase is **M (~6h)**.

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Diff shape confirmed: 1 new view module (`src/views/TableRecordPeek.ts`) + i18n data (`src/i18n.ts`) + 1 appended `styles.css` block + 1 host file (`DatabaseView.ts`) with three hunks.
- [ ] Toolbar selector grep returns no phase-diff matches.
- [ ] `.db-record-detail-*` selector grep returns no phase-diff matches.
- [ ] `src/views/RecordDetailPanel.ts` grep in the diff returns no edits (calendar module untouched).
- [ ] `DataSource` import grep returns no matches in `src/views/TableRecordPeek.ts`.
- [ ] i18n keys `panel.open` / `panel.noProperties` / `panel.hiddenProperties` present for en / zh-CN / zh-TW.
- [ ] Mobile CSS-only persistent OPEN verified on `body.is-phone` (no `isPhoneLayout()` JS).

### Rollback Procedure
1. Revert the phase diff with git (new view module, `src/i18n.ts` keys, `styles.css` block, and the three `DatabaseView.ts` hunks).
2. Re-run fork typecheck to confirm baseline.
3. Re-run the manual desktop/mobile pass if any call-site residue remains.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: N/A — the panel is read-only and performs no writes; the hidden-group toggle is in-memory CSS only.

<!-- /ANCHOR:enhanced-rollback -->
