---
title: "Tasks: Snapshot Audit Columns"
description: "Tasks to add Snapshot columns for screenshot-era totals beside live figures. Default yes; Saved stays non-live."
trigger_phrases:
  - "snapshot tasks"
  - "audit columns"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/001-live-reports-rollups/005-snapshot-audit-columns"
    last_updated_at: "2026-08-25T19:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored Snapshot child from synthesis rank 5 and final-plan step 9"
    next_safe_action: "Capture screenshot-era totals from Setup inventory; default keep Snapshot columns"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-005-snapshot-audit-columns"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Snapshot Audit Columns

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (target — fork file:line or vault config)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read screenshot-era Income/Expenses/Sales/Saved values from the child 001 inventory (live vault — fork files: none) [S]
- [ ] T002 Record operator decision: keep `Snapshot*` (default yes) or explicit deferral (`../research/synthesis.md` Q4) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 [P] If keeping: add typed `Snapshot*` columns holding captured Income/Expenses/Sales/Saved beside live figures. Saved stays non-live — no Saved rollup (parent REQ-005/006) (Reports `db_view` markdown — fork files: none) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T004 Confirm both live and snapshot are visible when they diverge, or the deferral note exists; Saved still static (Reports view) [S]
- [ ] T005 Confirm fork `src/` has no this-child diffs [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] Snapshot present or deferral recorded
- [ ] Saved non-live
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 5
- **Parent final-plan**: `../research/final-plan.md` step 9
<!-- /ANCHOR:cross-refs -->
