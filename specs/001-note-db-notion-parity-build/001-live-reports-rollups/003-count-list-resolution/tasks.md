---
title: "Tasks: Count List Resolution"
description: "Same-diff tasks for COUNT plus diagnostic list on file.name. Do not bind SUM. Do not remove the list."
trigger_phrases:
  - "count list tasks"
  - "file.name list"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/001-live-reports-rollups/003-count-list-resolution"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored COUNT plus diagnostic-list child from synthesis ranks 2 and 4 and final-plan step 7"
    next_safe_action: "Add COUNT and list/file.name after both relation sides exist"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-count-list-resolution"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Count List Resolution

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

T002 COUNT and T002's diagnostic `list` are **one YAML change-set**. Do not ship COUNT without the `file.name` list.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child 001 sample Report relation resolves to the expected child set (`RelationRollup.ts:70-78`) (Reports view) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 Add Reports COUNT rollups of related children plus a temporary diagnostic `list` rollup beside each of the three relations, with `targetField: file.name` (NOT the amount key). COUNT short-circuits before any field lookup (`RelationRollup.ts:99`). The `list` MUST target `file.name`: `list` dedupes via `stringifyValue` (`RelationRollup.ts:110-119`). Modal `file.name` path at `RelationRollupConfigModal.ts:146-147`. Do not name `median\|min\|max\|range` in YAML (unknown id → sum at `RelationRollup.ts:126-128`) (Reports `db_view` markdown — fork files: none) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T003 Accept: COUNT equals unique resolved children in the `list`; an empty Report shows COUNT `0` and a SUM-to-come empty placeholder, not a crash (`RelationRollup.ts:159-160`) (Reports view) [S]
- [ ] T004 Confirm the diagnostic `list` columns are still present (removal is child 006) and fork `src/` has no this-child diffs [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] COUNT and `list`/`file.name` shipped together
- [ ] Lists not removed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 2, 4
- **Parent final-plan**: `../research/final-plan.md` step 7
<!-- /ANCHOR:cross-refs -->
