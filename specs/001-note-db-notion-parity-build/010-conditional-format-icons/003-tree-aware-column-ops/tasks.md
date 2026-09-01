---
title: "Tasks: Tree-Aware Column Ops"
description: "Wire conditionTree rename and delete in ColumnOperations.ts using existing SourceRules helpers."
trigger_phrases:
  - "tree aware column ops tasks"
  - "conditiontree rename"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/010-conditional-format-icons/003-tree-aware-column-ops"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored tree-aware-column-ops child from synthesis rank 5 and final-plan step 6"
    next_safe_action: "Wire conditionTree rename/delete in ColumnOperations.ts"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-tree-aware-column-ops"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Tree-Aware Column Ops

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

- [ ] T001 Read rename loop ~193, delete filter ~370, and helpers `updateSourceRuleTreeKeyReferences` / `removeSourceRuleTreeReferences` (`ColumnOperations.ts`, `SourceRules.ts:183-225`) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 **Rename** — in addition to `rule.condition.field`, call `updateSourceRuleTreeKeyReferences(rule.conditionTree, oldKey, newKey)` (`src/views/ColumnOperations.ts` ~193; `src/data/SourceRules.ts:183-206`) [S]
- [ ] T003 **Delete** — `removeSourceRuleTreeReferences` (`:208-225`); drop the CF rule only if nothing remains; dual-write `condition` from the remaining leaf when the helper hoists (`:222-224`) (`src/views/ColumnOperations.ts` ~370) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T004 Rename does not leave stale tree keys; last-leaf delete drops the rule; sibling delete keeps the rule with `condition` from the survivor (`src/views/ColumnOperations.ts`) [S]
- [ ] T005 Grep `ColumnOperations.ts` for both helper names; confirm legacy no-tree rules still follow `condition.field` (`src/views/ColumnOperations.ts`) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Manual verification of T004–T005 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 5
- **Parent final-plan**: `../research/final-plan.md` step 6
<!-- /ANCHOR:cross-refs -->
