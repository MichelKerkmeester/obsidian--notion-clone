---
title: "Tasks: Rollup Inverse Resolution"
description: "Tasks for key-scoped inverse resolution in RelationRollup.ts after a local relationField miss. Resolution, sourcePaths union, and sourceDatabaseIds (or equivalent) on RelationRollupResult are one atomic RelationRollup.ts diff."
trigger_phrases:
  - "rollup inverse tasks"
  - "key-scoped inverse"
  - "aggregateRollup inbound"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/008-derived-inverse-relations/002-rollup-inverse-resolution"
    last_updated_at: "2026-08-25T21:40:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored rollup inverse-resolution child from synthesis ranks 2 and 4 and final-plan step 3"
    next_safe_action: "Wire key-scoped inverse into RelationRollup.ts after a local relationField miss"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-rollup-inverse-resolution"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Rollup Inverse Resolution

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

T003 resolution and T004 `sourcePaths` / `sourceDatabaseIds` handoff are **one atomic `RelationRollup.ts` diff**. Do not ship the miss branch without the `targetPaths` union and `sourceDatabaseIds` (or equivalent) on `RelationRollupResult`.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child 001 left `buildRelationInverse` plus `sourcePaths` / `sourceDatabaseIds`; read synthesis ranks 2 and 4 and final-plan step 3 [15m]
- [ ] T002 Confirm live lines `RelationRollup.ts:18-22,36,58-88,62-66,92-129,21,76,159-160` and that `:36` still early-returns when the viewed DB has no rollup columns [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Hunk 1 — local miss** (`RelationRollup.ts:62-66`): after `:36`, resolve `column.key === config.relationField && column.type === "relation" && column.relationConfig.targetDatabaseId === sourceDatabase.id`; take inbound `NoteRecord[]` for the current `sourceRecord` from `inboundByPath`; pass to existing `aggregateRollup` (`:92-129`); fail-closed to `emptyRollupValue` (`:159-160`); local relation still wins (`src/data/RelationRollup.ts`) [S]
- [ ] T004 **`sourcePaths` / `sourceDatabaseIds` handoff** — same `RelationRollup.ts` diff as T003: union inverse `sourcePaths` into `targetPaths` (`:21,76`) and return `sourceDatabaseIds` (or equivalent) on `RelationRollupResult` (`:18-22`) so `DatabaseView.ts:3362-3372` can see Expense paths and child 003 can register the Expenses database (`src/data/RelationRollup.ts`) [S]
- [ ] T005 **Round-trip tests**: fixture a DB that *has* rollup columns so `:36` does not early-return; inverse `count === 2` / `list` contains both Expenses via `aggregateRollup`; result `sourceDatabaseIds` (or equivalent) includes the Expenses database; local key still forward; empty → `emptyRollupValue` (`src/data/RelationInverse.test.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T006 Report `count`/`list` over two Expenses with only forward `Month` links, no Report frontmatter relation; result includes Expenses in `sourceDatabaseIds` (or equivalent) (SC-001 / SC-003) [S]
- [ ] T007 Confirm `types.ts`, `RelationLinks.ts`, `DatabaseView.ts`, and `EmbeddedDatabaseRenderer.ts` untouched; `npx vitest run src/data/RelationInverse.test.ts` still green [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T004 shipped as one `RelationRollup.ts` diff (`sourcePaths` union + `sourceDatabaseIds` handoff)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 2, 4
- **Parent final-plan**: `../research/final-plan.md` step 3 (tests also step 6)
<!-- /ANCHOR:cross-refs -->
