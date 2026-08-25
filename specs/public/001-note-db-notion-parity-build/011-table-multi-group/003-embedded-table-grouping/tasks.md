---
title: "Tasks: Embedded Table Grouping"
description: "Task list for embed table grouped dispatch and groupByFields copy-back."
trigger_phrases:
  - "embedded table grouping tasks"
  - "groupbyfields copy-back"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/011-table-multi-group/003-embedded-table-grouping"
    last_updated_at: "2026-08-25T20:50:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored embedded grouping child from synthesis and final-plan"
    next_safe_action: "Wire EmbeddedDatabaseRenderer grouped dispatch and copy-back"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-embedded-table-grouping"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Embedded Table Grouping

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

- [ ] T001 Confirm children 001–002 shipped; read parent `research/synthesis.md` rank 6 plus `research/final-plan.md` step 5 [10m]
- [ ] T002 Re-read `EmbeddedDatabaseRenderer.ts:1012-1016, 3353, 3364-3365` and gallery/list `:973-986` / timeline `:1005-1007` [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Table grouped branch** — `:1012-1016` uses `effectiveGroupFields` + `dropComputedGroupFields` + `buildGroupTree` + `flattenGroupTree` like `DatabaseView.ts:9539-9545`. Do not change gallery/list `:973-986` or timeline `:1005-1007` (`src/views/EmbeddedDatabaseRenderer.ts`) [S]
- [ ] T004 **Copy-back sibling** — add `origView.groupByFields = this.config.groupByFields` beside `:3353`; leave `Object.assign` `:3364-3365` as-is (parse remains the load path) (`src/views/EmbeddedDatabaseRenderer.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Embedded 2-field table matches top-level nested headers [S]
- [ ] T006 Embed settings save does not strip `groupByFields`; gallery/list embed still single-field [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Manual verification of T005–T006 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 6
- **Parent final-plan**: `../research/final-plan.md` step 5
<!-- /ANCHOR:cross-refs -->
