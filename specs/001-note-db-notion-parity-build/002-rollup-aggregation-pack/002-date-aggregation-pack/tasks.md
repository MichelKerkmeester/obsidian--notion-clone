---
title: "Tasks: Date Aggregation Pack"
description: "Tasks for earliest/latest Aggregate functions, RelationRollup date dispatch, date display-type mapping, date modal filter, and footer EARLIEST/LATEST consume."
trigger_phrases:
  - "date aggregation tasks"
  - "earliest latest"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/002-rollup-aggregation-pack/002-date-aggregation-pack"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored date-pack child from synthesis rank 5 and final-plan step 8"
    next_safe_action: "Implement earliest/latest after the numeric same-diff child"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-date-aggregation-pack"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Date Aggregation Pack

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

- [ ] T001 Confirm child 001 left `src/data/Aggregate.ts` and `isNumericRollupKind` **without** `earliest|latest`; read synthesis rank 5 and final-plan step 8 [15m]
- [ ] T002 Confirm `toDateTimestamp` at `DateTimeFormat.ts:203-214`, footer EARLIEST/LATEST at `SummaryRenderer.ts:455-456`, dateKey at `:552` [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 Add `earliest`/`latest(timestamps: readonly number[])` returning `Date | null`; empty/all-invalid → `null`; local wall-time; extend `Aggregate.test.ts` (`src/data/Aggregate.ts`) [S]
- [ ] T004 Parallel date extraction in `RelationRollup.ts` with `toDateTimestamp` **before** `numbers.length === 0` (`:126`); keep rollup-of-rollup `:101`; ensure `"earliest" \| "latest"` on `types.ts:44` (`src/data/RelationRollup.ts`, `src/data/types.ts`) [S]
- [ ] T005 Map `earliest|latest` → `"date"` in `ColumnDisplay.ts:18-23` and `RowPipeline.ts:143-147` so cells use `renderDate` (`CellRenderer.ts:205-206`), not `String(Date)` (`:231-232`). Do **not** add these ids to `isNumericRollupKind` [S]
- [ ] T006 Modal date-kind filter via `isDateLikeColumnType`; options reuse `viewConfig.summaryEarliest` / `summaryLatest` (`RelationRollupConfigModal.ts:137-176`) [S]
- [ ] T007 Route footer EARLIEST/LATEST through Aggregate (`SummaryRenderer.ts:455-456`); keep `parseDateTimeParts(...)?.dateKey` at `:552`; keep date-ms RANGE `:457-459` [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T008 Scenario 2: earliest/latest match footer dateKey on the same dates [S]
- [ ] T009 Confirm date cells are not `String(Date)`; footer date RANGE still formats `Nd`; `npx vitest run` still green [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Scenario 2 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 5
- **Parent final-plan**: `../research/final-plan.md` step 8
<!-- /ANCHOR:cross-refs -->
