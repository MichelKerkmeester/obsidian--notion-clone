---
title: "Tasks: Peek Display Proof"
description: "Ordered proof tasks: typecheck, greps, desktop/phone manuals, calendar coexistence, packet evidence."
trigger_phrases:
  - "peek display proof tasks"
  - "hover open proof"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/014-record-detail-panel/005-peek-display-proof"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored peek display-proof child from synthesis edge cases and final-plan step 8"
    next_safe_action: "Run typecheck, greps, and locked manual scenarios after children 001-004 ship"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-005-peek-display-proof"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Tasks: Peek Display Proof

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

- [ ] T001 Confirm children `001-table-record-peek-module` through `004-peek-keyboard-open` shipped the module, i18n, CSS block, `renderCell`+overlay hunks, and Mod+Enter [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Proofs only; do not add production files. Do not edit `src/views/RecordDetailPanel.ts`.

- [ ] T002 Fork typecheck with the phase diff (SC-001) [S]
- [ ] T003 Grep `src/views/TableRecordPeek.ts` for `DataSource` / `mutateFrontmatter` / `openNote`; grep phase diff for toolbar / `patchToolbarNew` / `.db-record-detail-` / edits to `views/RecordDetailPanel.ts` (SC-002 / SC-004) [S]
- [ ] T004 Manual: desktop hover-open; phone persistent OPEN (`body.is-phone`); title click vs OPEN vs Page Preview (`HoverLinkPreview.ts:8-17`); hidden-group reveal + empty-hidden omission; zero-property row; long wrap [M]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Manual: Mod+Enter / Esc + focus return (`DatabaseView.ts:4197`); inline-edit on another row; grid-scroll dismiss; title-column hidden; view-switch / `refresh()` no orphan; zh locales show no raw English [M]
- [ ] T006 Calendar event-card panel still edits in place (`RecordDetailPanel.ts:257-263`); peek z-index 998 vs calendar 999 (`styles.css:7544`) [S]
- [ ] T007 Record evidence in `checklist.md` + honest `implementation-summary.md` [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Typecheck, greps, and manual list passed
- [ ] `checklist.md` evidence filled
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Parent synthesis**: `../research/synthesis.md` Edge cases
- **Parent final-plan**: `../research/final-plan.md` step 8
<!-- /ANCHOR:cross-refs -->
