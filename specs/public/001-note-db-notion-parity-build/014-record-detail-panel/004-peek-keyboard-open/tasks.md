---
title: "Tasks: Peek Keyboard Open"
description: "Tasks for Mod+Enter in handleDatabaseKeydown before the bare-Enter edit branch."
trigger_phrases:
  - "peek keyboard tasks"
  - "mod enter peek"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/014-record-detail-panel/004-peek-keyboard-open"
    last_updated_at: "2026-08-25T21:20:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored peek-keyboard child from synthesis rank 7 and final-plan step 6"
    next_safe_action: "Add Mod+Enter in handleDatabaseKeydown before editAtCellSelection"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-peek-keyboard-open"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Peek Keyboard Open

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
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child `003-title-open-affordance` imported peek helpers; read synthesis rank 7 and final-plan step 6 [10m]
- [ ] T002 Confirm `mod = event.metaKey \|\| event.ctrlKey` at `DatabaseView.ts:1441` and the Enter-to-edit branch at `:1523-1531` [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Hunk B — `handleDatabaseKeydown` (~1523)** — before `editAtCellSelection()`: if `mod && event.key === "Enter"` and a cell is focused, preventDefault, open peek for that row with the same args as child 003, return. Do not push a `Scope`. Bare Enter / F2 unchanged (`src/views/DatabaseView.ts:1523-1531`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T004 Mod+Enter opens peek; Enter still edits; F2 still edits [S]
- [ ] T005 Esc while open closes via module document capture and `returnFocus` restores `td[data-note-database-row-path][data-note-database-column-key][tabindex="0"]` (`DatabaseView.ts:4197`) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T004–T005 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 7
- **Parent final-plan**: `../research/final-plan.md` step 6
<!-- /ANCHOR:cross-refs -->
