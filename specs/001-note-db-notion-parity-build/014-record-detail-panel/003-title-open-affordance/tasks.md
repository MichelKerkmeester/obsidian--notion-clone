---
title: "Tasks: Title Open Affordance"
description: "Same-diff tasks for DatabaseView.renderCell OPEN attach (title-hidden fallback) plus overlay lifecycle. Do not ship attach without refresh sync."
trigger_phrases:
  - "title open affordance tasks"
  - "renderCell open"
  - "syncTableRecordPeek"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/014-record-detail-panel/003-title-open-affordance"
    last_updated_at: "2026-08-27T12:27:53Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Title Open Affordance

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

T003–T004 are **one atomic diff**. Do not ship `renderCell` attach without overlay lifecycle.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm children `001-table-record-peek-module` and `002-peek-panel-css` shipped exports/classes; read synthesis ranks 1 and 5 plus final-plan steps 5 and 7 [15m]
- [ ] T002 Confirm insertion point `DatabaseView.renderCell` ~7840–7848 (after `cellRenderer.renderCell`); `setupRow` at `TableRenderer.ts:468` before cells `:495-505`; `setupRowInteractions` `:7529-7531` stays row-menu-only [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Hunk A — `renderCell` (~7840–7848)** — after `cellRenderer.renderCell` + conditional format: `visible = getVisibleColumns(config, this.rows, this.vs(), this.pendingShowColumns)` (`ColumnConfig.ts:77`). Attach if `col.key === "file.name"` **or** (`file.name` not in `visible` and `col.key === visible[0]?.key`). `attachTitleOpenAffordance(td, row, { open: () => openTableRecordPeek({ anchor: td, row, config, visibleColumns: visible, allColumns: getColumnsInOrder(config), container: this.containerEl_, returnFocus: () => td.focus(), renderRecordIcon: (p, r, c) => this.renderRowRecordIcon(p, r, c) }) })`. Import peek exports; do not edit the title `<a>`. Table-only: callback wired at `DatabaseView.ts:586`; `TableRenderer.ts:502` invokes `this.actions.renderCell(...)` (`src/views/DatabaseView.ts:7840-7848`) [S]
- [ ] T004 **Hunk C — overlay lifecycle** — same diff as T003: `hasActiveOverlay` (`:834`) add `.db-record-peek-panel:not(.is-hidden)`; `closeActiveOverlays` (`:864`) also `closeTableRecordPeek()`; `refresh()` (`:10483-10488`) `syncTableRecordPeek(this.rows)` next to calendar sync. Do not call `refreshRecordDetailPanel` for the table peek (`src/views/DatabaseView.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Hover/tap OPEN on Name cell; title `<a>` click still opens the note; modifier-hover Page Preview still fires only on the `<a>` (`HoverLinkPreview.ts:8-17`) [S]
- [ ] T006 Title-hidden fallback: OPEN on first visible data `td`; `refresh()` / view switch leaves no orphan peek; calendar event-card panel still edits [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T004 shipped as one diff
- [ ] T005–T006 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 1, 5
- **Parent final-plan**: `../research/final-plan.md` steps 5, 7
<!-- /ANCHOR:cross-refs -->
