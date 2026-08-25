---
title: "Feature Specification: Title Open Affordance"
description: "Wire DatabaseView.renderCell to attach the Name-cell OPEN button (title-hidden fallback included) and add the overlay-lifecycle hunk so refresh cannot orphan the peek. Isolation from title navigation and Page Preview is the same button."
trigger_phrases:
  - "title open affordance"
  - "renderCell open"
  - "title hidden fallback"
  - "syncTableRecordPeek"
  - "closeActiveOverlays peek"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/014-record-detail-panel/003-title-open-affordance"
    last_updated_at: "2026-08-25T21:20:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored title-open affordance child from synthesis ranks 1 and 5 and final-plan steps 5 and 7"
    next_safe_action: "Add DatabaseView renderCell attach plus overlay lifecycle hunks"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-title-open-affordance"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Title Open Affordance

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `014-record-detail-panel` |
| **Parent Spec** | ../spec.md |
| **Phase** | 3 of 5 |
| **Predecessor** | 002-peek-panel-css |
| **Successor** | 004-peek-keyboard-open |
| **Handoff Criteria** | OPEN attaches in renderCell; refresh/overlay close cannot leave an orphan peek |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 3 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `002-peek-panel-css` · Successor: `004-peek-keyboard-open`. This child is `research/final-plan.md` steps 5 and 7 in **one same-diff**: hunk A (`renderCell`) plus hunk C (overlay lifecycle). Do not ship the attach without refresh/close sync — a peek mounted from `renderCell` orphans after `refresh()` (`:10483-10488`).

Synthesis ranks 1 (title-cell hover OPEN) and 5 (isolate OPEN from title navigation and Page Preview) are the same button. Title-hidden fallback (Scenario 5) is the same `renderCell` hunk. `setupRowInteractions` (`:7529-7531`) stays row-menu-only because `setupRow` runs at `TableRenderer.ts:468` before cells exist at `:495-505`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The title cell already navigates on click (`CellRenderer.ts:126-129` → `openNote`) and already feeds Page Preview via `markNoteHoverLink` (`CellRenderer.ts:124`; `HoverLinkPreview.ts:8-17`). There is no OPEN chrome. The iteration-10 insertion point `setupRowInteractions` is timing-wrong. If OPEN is attached from `renderCell` without overlay lifecycle, the next `refresh()` leaves a stale DOM node (spec §8 / CHK-069; final-plan: ship blocker). `hasActiveOverlay` (`:834`) and `closeActiveOverlays` (`:864`) already know the calendar panel; they do not know `.db-record-peek-panel`.

### Purpose
After `cellRenderer.renderCell` in `DatabaseView.renderCell` (~7840–7848), call `attachTitleOpenAffordance` when `col.key === "file.name"` **or** (`file.name` not in `visible` **and** `col.key === visible[0]?.key`). Pass `openTableRecordPeek` with injected `renderRecordIcon` and `returnFocus`. In the same diff, add `.db-record-peek-panel:not(.is-hidden)` to `hasActiveOverlay` (`:834`), call `closeTableRecordPeek()` from `closeActiveOverlays` (`:864`), and call `syncTableRecordPeek(this.rows)` from `refresh()` (`:10483-10488`) next to the calendar sync. Do not route table peek through `refreshRecordDetailPanel`.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Hunk A — `DatabaseView.renderCell` (~7840–7848): table-only (this callback is wired from `TableRenderer` at `:586`). Compute `visible = getVisibleColumns(config, this.rows, this.vs(), this.pendingShowColumns)` (`ColumnConfig.ts:77`). Attach if `col.key === "file.name"` or title-hidden fallback on `visible[0]`. `attachTitleOpenAffordance(td, row, { open: () => openTableRecordPeek({ anchor: td, row, config, visibleColumns: visible, allColumns: getColumnsInOrder(config), container: this.containerEl_, returnFocus: () => td.focus(), renderRecordIcon: (p, r, c) => this.renderRowRecordIcon(p, r, c) }) })`.
- Isolation: do not change the title `<a>` click → `openNote` path; do not set `data-note-database-hover-link` on the button; `setupRowInteractions` stays row-menu-only (`:7529-7531`).
- Hunk C — overlay lifecycle: `hasActiveOverlay` selector (`:834`) gains `.db-record-peek-panel:not(.is-hidden)`; `closeActiveOverlays` (`:864`) also `closeTableRecordPeek()`; `refresh()` (`:10483-10488`) `syncTableRecordPeek(this.rows)`.
- Import the new exports into `DatabaseView.ts` (calendar import at `:143` stays).

### Out of Scope
- Mod+Enter (child `004-peek-keyboard-open`).
- Creating the module or i18n (child 001) or CSS (child 002).
- Editing `src/views/RecordDetailPanel.ts`, `CellRenderer.ts`, or the title `<a>`.
- Board / gallery hosts.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/DatabaseView.ts` | Edit | Hunk A `renderCell` ~7840–7848; hunk C `:834`, `:864`, `:10483-10488`; import peek exports |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | OPEN attaches after the title cell is painted | `renderCell` (~7840-7848) calls `attachTitleOpenAffordance` after `cellRenderer.renderCell`; not from `setupRowInteractions` (`:7529-7531`) |
| REQ-002 | Title click and Page Preview stay the navigation path | Title `<a>` still opens the note (`CellRenderer.ts:126-129`); `markNoteHoverLink` stays on the `<a>` (`:124`); button has no `data-note-database-hover-link` |
| REQ-003 | Refresh cannot orphan the peek | Same diff: `hasActiveOverlay` (`:834`) includes `.db-record-peek-panel:not(.is-hidden)`; `closeActiveOverlays` (`:864`) calls `closeTableRecordPeek()`; `refresh()` (`:10483-10488`) calls `syncTableRecordPeek(this.rows)` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Title-hidden fallback uses the same hunk | If `file.name` is not in `visible`, attach on `visible[0]?.key` from the same `renderCell` call (Scenario 5; `CellRenderer.ts:117-118` never adds `db-title-cell` when title is hidden) |
| REQ-005 | Calendar overlay contract is unchanged | Do not route through `refreshRecordDetailPanel`; calendar import at `DatabaseView.ts:143` remains; `src/views/RecordDetailPanel.ts` untouched |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Hover/tap OPEN appears on the Name cell; with title hidden it appears on the first data `td`.
- **SC-002**: Title `<a>` click still opens the note; modifier-hover Page Preview still fires only on the `<a>`.
- **SC-003**: Table re-render leaves no orphan peek; view switch / overlay close dismisses it; calendar panel behavior unchanged.

### Acceptance Scenarios

- **Given** a populated table view, **when** a row is hovered, **then** OPEN appears on `td.db-title-cell` and activating it opens the peek without navigating.
- **Given** the title column is hidden, **when** a row renders, **then** OPEN attaches to `getVisibleColumns(...)[0]` from the same hunk.
- **Given** the peek is open, **when** `refresh()` or a view switch runs, **then** `syncTableRecordPeek` / `closeTableRecordPeek` prevent a stale node.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Wrong insertion point | Affordance never attaches | `renderCell` after cells exist (`TableRenderer.ts:495-505`) |
| Risk | OPEN inside the `<a>` or with hover-link attr | Navigates away or fights Page Preview | Sibling button; no `data-note-database-hover-link` |
| Risk | Attach without overlay hunk | Orphan peek after `refresh()` | Same-diff REQ-003 |
| Risk | Title column hidden | `col.key === "file.name"` never runs | Attach on `visible[0]` |
| Dependency | Children 001 and 002 | No module/CSS to attach | Wait for exports and classes |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking. Locked defaults: title click still opens the note; table-only; do not reroute `openRow` (`:7545-7548`) or patch `patchToolbarNew`.
<!-- /ANCHOR:questions -->
