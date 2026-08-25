---
title: "Tasks: Record Detail Panel / Hover-Open UX"
description: "Ordered task list for building the display-only CSS-docked right side-peek record detail panel, derived from the synthesis ranked backlog and reconciled with the final-plan review. New module is src/views/TableRecordPeek.ts (distinct sibling of the existing calendar src/views/RecordDetailPanel.ts). Each task carries its real fork file:line target and effort tier (S/M/L)."
trigger_phrases:
  - "record detail panel"
  - "hover open"
  - "tasks"
  - "detail panel"
  - "properties panel"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/014-record-detail-panel"
    last_updated_at: "2026-08-25T00:00:00Z"
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
# Tasks: Record Detail Panel / Hover-Open UX

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked / deferred |

**Task Format**: `T### [P?] Description (file path:line) [effort S/M/L]`

Tasks are ordered by the synthesis ranked backlog (dependencies noted inline). Effort tiers: S = small, M = medium, L = large.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read this phase's research baseline (`research/synthesis.md`, `research/research.md`, `research/final-plan.md`) [10m]
- [ ] T002 Read fork call sites and helpers: the existing calendar `src/views/RecordDetailPanel.ts:23-218` (exports `:84-104` — confirm the name collision), `DatabaseView.ts:143, 834, 864, 10418-10440, 10483-10488`, `DatabaseView.renderCell` (~`src/views/DatabaseView.ts:7840-7848`), `handleDatabaseKeydown` (~`src/views/DatabaseView.ts:1523-1526`), `CellRenderer.ts:117-129`, `TableRenderer.ts:450-505, 586`, `ColumnConfig.ts:64, 77-101` (the real `getVisibleColumns` / `getColumnsInOrder`), `HoverLinkPreview.ts:8-17`, `Stringify.ts:1`, `styles.css:63-125, 770, 7543-7618`, `EuroFormat.ts:1-42` + its two consumers (`CellRenderer.ts:13`, `SummaryRenderer.ts:7`) [20m]
- [ ] T003 Confirm the three `DatabaseView.ts` hunk sites and the "one new file + few hunks" shape; confirm `setupRowInteractions` (`DatabaseView.ts:7529-7531`) stays row-menu-only; state why a second `RecordDetailPanel.ts` / `openRecordDetailPanel` is illegal (export-name collision with the live calendar module) [10m]

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### Ranked backlog (ordered by synthesis rank; dependencies noted)

- [ ] T004 **Title-cell hover OPEN + module skeleton** (rank 1, effort S, depends: none). Create `src/views/TableRecordPeek.ts` (sibling of — and distinct from — the existing calendar `src/views/RecordDetailPanel.ts`, which stays untouched) and implement `attachTitleOpenAffordance(td, row, deps)`: append `<button type="button" class="db-record-open-btn" tabindex="-1">` as a sibling of the title `<a>` inside `td.db-title-cell` (`src/views/CellRenderer.ts:117-118`). Wire it from `DatabaseView.renderCell` (~`src/views/DatabaseView.ts:7840-7848`), table-only (callback wired from `TableRenderer` at `:586`), when `col.key === "file.name"` **or** (`file.name` not in `visible` **and** `col.key === visible[0]?.key`) — title-hidden fallback, still one hunk. Do NOT use `setupRowInteractions` (`DatabaseView.ts:7529-7531`) — `setupRow` runs at `TableRenderer.ts:468` before cells exist at `:495-505`. [S]
- [ ] T005 **Isolate OPEN from title navigation and Page Preview** (rank 5, effort S, depends: T004). Button click: `preventDefault` + `stopPropagation`; no `data-note-database-hover-link` on the button (`src/views/HoverLinkPreview.ts:8-17`); leave `markNoteHoverLink` on the title `<a>` (`src/views/CellRenderer.ts:124-129`) so the title click → `openNote` path and modifier-hover Page Preview stay intact. [S]
- [ ] T006 **CSS-docked side-peek overlay (grid stays interactive; no navigation)** (rank 2, effort M, depends: T004). Implement `openTableRecordPeek({ anchor, row, config, visibleColumns, allColumns, container, returnFocus, renderRecordIcon })`, `closeTableRecordPeek()`, and `syncTableRecordPeek(rows)`: single-instance state machine `closed → open(rowPath) → closed`; mount `position: absolute; top:0; right:0; bottom:0; width: min(360px, 100%)` inside `.note-database-container` (`styles.css:63-125`, NOT `:4032`); `role="dialog"`, `aria-modal="false"`, class `db-record-peek-panel` (do NOT reuse `.db-record-detail-panel`); never call `DatabaseView.openRow` (`src/views/DatabaseView.ts:7545-7548`) or the calendar `openRecordDetailPanel`. NO `getVisiblePopoverBounds` / flip / `positionToolbarPopover`. Dismiss on container `scroll` and `resize`. [M]
- [ ] T007 **Header group + collapsible hidden group** (rank 3, effort S, depends: T006). Header: injected `renderRecordIcon: (parent, row, config) => this.renderRowRecordIcon(...)` (NOT the token-level `RecordIconRenderer.ts:18` export) + `row.file.basename`. Property rows: `getColumnValue(row, col)` (`src/data/ColumnDisplay.ts:63`) + `stringifyValue` (`src/data/Stringify.ts:1`) over `getVisibleColumns(config, rows, this.vs(), this.pendingShowColumns)` (`src/data/ColumnConfig.ts:77-101` — four args; NOT `TableRenderer.ts:24`), skipping `file.name`. Hidden group: `getColumnsInOrder(config)` (`ColumnConfig.ts:64`) minus that visible set (`ViewConfig` has `schema.columns` / `columnOrder` / `hiddenColumns?`, NOT `.columns`); skip `file.name`; CSS class-toggle collapse; reveal control only when the hidden list is non-empty; omit empty readonly/derived hidden values (`context/anytype-ts/.../relation.tsx:19-49`). Omit Anytype's third `local` group. No new formatters. [S]
- [ ] T008 **Toolbar-safe, theme-variable panel CSS (new classes only)** (rank 4, effort S, depends: T006; rules can be written in parallel). Append a delimited `.note-database-container …` block to plugin-root `styles.css` (`styles.css:770` hover idiom; `styles.css:35-45` theme variables): new classes `.db-record-peek-panel`, `.db-record-open-btn`, `.db-record-peek-field` (do NOT reuse `.db-record-detail-*` — those truncate at `:7592-7597` and set `cursor: pointer`); `td.db-title-cell { position: relative }`; `.db-record-open-btn` default `opacity: 0`; `tr:hover .db-record-open-btn { opacity: 1 }`; `.db-record-peek-panel` absolute right dock, `overflow-y: auto`, wrap (no `nowrap`/ellipsis), `z-index` 998 (below calendar `:7544` 999 and edit popovers 1000–1002). Zero toolbar selectors; zero `.db-record-detail-*` selectors. The only stylesheet Obsidian loads. [S]
- [ ] T009 **Phone/tap fallback (CSS-only persistent OPEN)** (rank 6, effort S, depends: T004). CSS-only: `body.is-phone .note-database-container .db-record-open-btn { opacity: 1 }` plus the row-hover rule copied from `styles.css:770`. No `isPhoneLayout()` JS, no `MouseEvent`-only path. The docked panel becomes full-width for free (`width: min(360px, 100%)`). AppFlowy's full-page mobile route is NOT the target. [S]
- [ ] T010 **Keyboard open/close + focus return (document capture, not Scope)** (rank 7, effort S, depends: T006). In `handleDatabaseKeydown` (~`src/views/DatabaseView.ts:1523-1526`), handle `Mod+Enter` (same `mod = metaKey || ctrlKey` already at `:1441`) BEFORE the Enter-to-edit branch; open the panel for the focused cell's row and return. While open, Esc closes the panel via **document capture** (copy `RecordDetailPanel.ts:128-147, 207-209`), NOT a pushed Obsidian `Scope` (which would fight `DatabaseView`'s `this.scope` / `Escape` → `handleInlineEditorEscape` at `:1202-1213`). `returnFocus` restores `td[data-note-database-row-path][data-note-database-column-key][tabindex="0"]` (`DatabaseView.ts:4197`). Bare Enter stays inline edit. [S]
- [ ] T011 **Empty state, hidden-toggle guard, panel scroll, scroll-dismiss** (rank 8, effort S, depends: T006, T007). Zero-property record → one muted `t("panel.noProperties")` row. Long hidden list → `overflow-y: auto` inside the panel. Long values wrap; no truncation; no horizontal scroll. Container `scroll` and `resize` dismiss the panel (default) so it cannot detach inside the `overflow: auto` box. No `getVisiblePopoverBounds` / flip / `positionToolbarPopover`. [S]
- [ ] T011a **i18n data** (effort S, depends: T006). Add `panel.open`, `panel.noProperties`, `panel.hiddenProperties` × en / zh-CN / zh-TW to `src/i18n.ts`. Hard-coded `"OPEN"` breaks zh-CN/zh-TW. Accept: peek UI shows no raw English in the zh locales. [S]

### Integration

- [ ] T011b **Overlay-lifecycle hunk in `DatabaseView.ts`** (effort S, depends: T006). `hasActiveOverlay` selector (`DatabaseView.ts:834`): add `.db-record-peek-panel:not(.is-hidden)` so **New** is suppressed while the peek is open. `closeActiveOverlays` (`:864`): also `closeTableRecordPeek()`. `refresh()` (`:10483-10488`): next to the existing calendar sync, `syncTableRecordPeek(this.rows)` (rebuild same `row.file.path` or close). Do NOT route table peek through `refreshRecordDetailPanel`. This is the stale-DOM fix (ship blocker). [S]
- [ ] T012 Verify diff shape: 1 new view module (`src/views/TableRecordPeek.ts`) + i18n data (`src/i18n.ts`) + 1 appended `styles.css` block + 1 host file (`DatabaseView.ts`) with three hunks (`renderCell`, `handleDatabaseKeydown`, overlay lifecycle); no `DataSource` / `mutateFrontmatter` / `openNote` references in the new module (final-plan step 2 acceptance — display-only by construction, not just by `DataSource` import); `src/views/RecordDetailPanel.ts` untouched (calendar module still compiles with its original exports); zero `.db-record-detail-*` selectors [10m]

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Unit Tests
- [ ] T013 Run fork typecheck with the phase diff [10m]

### Integration Tests
- [ ] T014 Diff-audit: zero toolbar selectors; zero `.db-record-detail-*` selectors; zero edits to `src/views/RecordDetailPanel.ts`; grep of `src/views/TableRecordPeek.ts` returns no matches for `DataSource`, `mutateFrontmatter`, or `openNote` (final-plan step 2 acceptance — display-only / no-navigation by construction); i18n keys `panel.open` / `panel.noProperties` / `panel.hiddenProperties` present for en / zh-CN / zh-TW [10m]
- [ ] T015 Regression sweep: views, formula engines, filters, rollups (count|sum|avg|list, display-only), templates unchanged; the calendar event-card panel still edits in place [30m]

### Manual Verification
- [ ] T016 Manual pass: hover-open (desktop), CSS-only persistent OPEN (phone via `body.is-phone`, no `isPhoneLayout()` JS), title-hidden fallback (OPEN on first visible data column), hidden-group reveal (incl. empty-hidden-set guard and empty-hidden-value omission), zero-property empty state, long-value wrap, Mod+Enter open, Esc close + focus return (document capture, not Scope), inline-edit concurrency on another row, grid-scroll dismiss, view-switch dismisses the peek (final-plan step 7 acceptance — `closeActiveOverlays` fires on view switch; no orphan DOM), title click still opens the note, calendar event-card panel still edits; switch locale to zh-CN/zh-TW and confirm no raw English [40m]

### Documentation
- [ ] T017 Update checklist evidence and implementation summary (`checklist.md`, `implementation-summary.md`) [15m]

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`. [Evidence: pending — recorded at verification time in `tasks.md`]
- [ ] No `[B]` blocked tasks remaining. [Evidence: pending — `tasks.md` contains 0 blocked markers]
- [ ] Fork typecheck passed. [Evidence: pending — T013 output recorded in `checklist.md`]
- [ ] Diff audit passed with zero toolbar edits, zero `.db-record-detail-*` selectors, zero edits to `src/views/RecordDetailPanel.ts`, and zero `DataSource` / `mutateFrontmatter` / `openNote` references in the new module. [Evidence: pending — T014 grep output recorded in `checklist.md`]
- [ ] i18n keys present in all three locales; zh locales show no raw English. [Evidence: pending — T014/T016 recorded in `checklist.md`]

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Research Baseline**: See `research/synthesis.md` (decision-ready) and `research/research.md` (full evidence trail)

<!-- /ANCHOR:cross-refs -->
