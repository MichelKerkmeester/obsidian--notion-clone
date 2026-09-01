---
title: "Tasks: Sum Rollups"
description: "Gated tasks to confirm ops amount keys and bind SUM after COUNT plus list/file.name proved resolution."
trigger_phrases:
  - "sum rollups tasks"
  - "ops keys"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/001-live-reports-rollups/004-sum-rollups"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored SUM child from synthesis rank 2 remainder and final-plan step 8"
    next_safe_action: "Halt for ops amount keys; do not bind SUM while UNKNOWN"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-sum-rollups"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Sum Rollups

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] [B?] Description (target — fork file:line or vault config)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm live currency/amount property keys with ops before binding SUM; halt and record UNKNOWN if unconfirmed — a guessed key yields a plausible empty SUM. Labels `cost`/`gross`/`net` are not keys (`../research/synthesis.md` Q1) (vault property schema — fork files: none) [S]
- [ ] T002 Confirm child 003 COUNT equals unique `list`/`file.name` children (`RelationRollup.ts:99,110-119`) (Reports view) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 [B→T001 ops keys + T002 resolution proof] Bind Reports SUM rollups to ops-confirmed amount keys for Expenses / Sales / Income (`RelationRollup.ts:123-128`). SUM aggregates through strict `toChartNumber`; unknown kind ids fall through to sum. If COUNT > 0 and SUM is empty, the amount key is wrong — fix the YAML, do not patch the fork (Reports `db_view` markdown — fork files: none) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T004 Compare on-screen SUM to a manual sum of the `list` children (`CellRenderer.ts:656`; consumers `DatabaseView.ts:3388-3399`, `EmbeddedDatabaseRenderer.ts:3198-3209`). Do not read SUM-empty as `0` (`RelationRollup.ts:159-160`) (Reports view) [S]
- [ ] T005 Confirm diagnostic lists still present and fork `src/` has no this-child diffs [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]` or SUM unbound with UNKNOWN recorded
- [ ] No fork patch for a wrong key
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 2
- **Parent final-plan**: `../research/final-plan.md` step 8
<!-- /ANCHOR:cross-refs -->
