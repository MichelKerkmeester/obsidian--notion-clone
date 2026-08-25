---
title: "Tasks: Display-Only Amount Types"
description: "Tasks to pin Reports computedSyncMode display-only and type child amount columns number/currency."
trigger_phrases:
  - "display-only tasks"
  - "amount types tasks"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/001-live-reports-rollups/002-display-only-amount-types"
    last_updated_at: "2026-08-25T19:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored display-only and amount-types child"
    next_safe_action: "Pin computedSyncMode: display-only in Reports YAML after inventory exists"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-display-only-amount-types"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Display-Only Amount Types

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

- [ ] T001 Confirm child 001 inventory recorded the Reports / Expenses / Sales / Income `db_view` paths (live vault — fork files: none) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 Pin Reports `computedSyncMode: display-only` in YAML — independent of the SUM change-set because it is the iCloud P0. Fork default is display-only (`ComputedSync.ts:3`; load-time coerce at `DataSource.ts:787`); real early-returns that block write-back are `DatabaseView.ts:10244` and `EmbeddedDatabaseRenderer.ts:2834` (`!this.isAutomaticComputedSync()`). Pin anyway so the view-config UI cannot be left on `automatic` (Reports `db_view` markdown — fork files: none) [S]
- [ ] T003 [P] Verify child amount columns are typed `number`/currency so free text cannot enter SUM inputs — non-numeric values are silently dropped and AVG divides by numeric-count only (`Obsidian Plugin/src/data/ChartAggregation.ts:191-198`; `RelationRollup.ts:123-125`) (child `db_view` schema — fork files: none) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T004 Confirm Reports YAML literally contains `display-only` and the three amount columns are typed `number` or `currency` (vault YAML) [S]
- [ ] T005 Confirm fork `src/` has no this-child diffs (Obsidian Plugin tree) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] YAML pin and amount types verified
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 3, 6
- **Parent final-plan**: `../research/final-plan.md` steps 5–6
<!-- /ANCHOR:cross-refs -->
