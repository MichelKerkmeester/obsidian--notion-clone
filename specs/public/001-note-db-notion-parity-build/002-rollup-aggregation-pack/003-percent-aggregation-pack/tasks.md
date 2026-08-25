---
title: "Tasks: Percent Aggregation Pack"
description: "Tasks for percentEmpty/percentFilled on row totals, RelationRollup records-path dispatch, percent modal options, and chart percent consume."
trigger_phrases:
  - "percent aggregation tasks"
  - "percent empty"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/002-rollup-aggregation-pack/003-percent-aggregation-pack"
    last_updated_at: "2026-08-25T19:05:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored percent-pack child from synthesis rank 6 and final-plan step 9"
    next_safe_action: "Implement percentEmpty/percentFilled after numeric and date children"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-percent-aggregation-pack"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Percent Aggregation Pack

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

- [ ] T001 Confirm child 001 exported percent ids on `isNumericRollupKind` and did not retouch clones; read synthesis rank 6 and final-plan step 9 [15m]
- [ ] T002 Confirm flatten drops empties at `RelationRollup.ts:102-109` and numeric empty return at `:126` so percents must not use that path [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 Add `percentEmpty`/`percentFilled` on `(total, emptyCount)` (or equivalent); `total === 0` → `0`; all-empty N → 100 / 0; 0–100 scale; extend `Aggregate.test.ts` (`src/data/Aggregate.ts`) [S]
- [ ] T004 Dispatch in `RelationRollup.ts` from `records` + `getTargetFieldValue` **before** `:126`, not from flattened `numbers`; missing target still `emptyRollupValue` → `null` (`:159-161`); keep avg non-empty denominator (`:126-128`); keep `:101` (`src/data/RelationRollup.ts`, `src/data/types.ts:44`) [S]
- [ ] T005 Modal percent options; reuse `chart.percentEmptyAggregation` (`ChartViewModel.ts:41-48`); no new `i18n.ts` block unless a key is missing (`RelationRollupConfigModal.ts:137-176`) [S]
- [ ] T006 Route chart `percent-empty` / `percent-not-empty` (`ChartAggregation.ts:788-789`) through Aggregate with `?? 0`. Do **not** add footer percent kinds [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T007 Two-denominator check: percents include empties; avg still divides by non-empty `numbers.length` [S]
- [ ] T008 Matrix: 0 rows → `0`; N all-empty → 100 / 0; missing target → `null`; `npx vitest run` green; no frontmatter writes [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Two-denominator check passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 6
- **Parent final-plan**: `../research/final-plan.md` step 9
<!-- /ANCHOR:cross-refs -->
