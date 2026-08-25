---
title: "Tasks: Column Menu Scheme Picker"
description: "Tasks for nested scheme choices under the display popover and setTextLinkScheme beside setTextRenderMode."
trigger_phrases:
  - "column menu scheme picker tasks"
  - "setTextLinkScheme"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields/003-column-menu-scheme-picker"
    last_updated_at: "2026-08-25T19:40:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored menu-picker child from synthesis rank 4 and final-plan T012"
    next_safe_action: "Implement ColumnMenu picker and setTextLinkScheme after the table same-diff child"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-column-menu-scheme-picker"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Column Menu Scheme Picker

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

T003–T004 are **one atomic diff** (final-plan T012). Do not ship the menu without the setter.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read parent `research/synthesis.md` rank 4 plus `research/final-plan.md` T012 (REQ-005 tension; nested under display popover) [10m]
- [ ] T002 Confirm child 001 `textLinkScheme?` exists on `ColumnDef` (`types.ts:62`) [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Display popover choices** — nest `https` \| `mailto` \| `tel` \| none under the existing text display popover; text columns only; none clears the field (`src/views/ColumnMenu.ts:133-150,393-418`) [S]
- [ ] T004 **Setter** — same diff as T003: `setTextLinkScheme` beside `setTextRenderMode` (`src/views/DatabaseView.ts:5096-5100`); same config-save path; do not extend `textRenderMode` [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Manual: pick mailto, confirm cells assemble; pick none, confirm plain; number column has no picker [S]
- [ ] T006 `npm run build`; `npm run lint`; confirm `types.ts:50` and `textRenderMode` union untouched [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T004 shipped as one diff
- [ ] Manual verification of T005 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
<!-- /ANCHOR:cross-refs -->
