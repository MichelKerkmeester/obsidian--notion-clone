---
title: "Tasks: Live Reports Inspect"
description: "Ordered inspect tasks: confirm SUM predecessors, record live Reports ids, lock Remaining/Saved expressions, write the inspect record."
trigger_phrases:
  - "live reports inspect tasks"
  - "inspect db_view"
  - "lock remaining saved"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/003-reports-computed-fields/001-live-reports-inspect"
    last_updated_at: "2026-08-25T19:30:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored live-reports inspect child from synthesis and final-plan"
    next_safe_action: "Inspect live Reports db_view after 001 and 002 ship SUM; write the inspect record"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-live-reports-inspect"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Live Reports Inspect

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

T003–T004 are one inspect. Do not lock expressions without the live column record.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read parent `research/synthesis.md` ranks 1–6 plus Open questions, and `research/final-plan.md` steps 1–2 (inspect + lock; `IFERROR` is a no-op) [S]
- [ ] T002 Hard gate: confirm `001-live-reports-rollups` and `002-rollup-aggregation-pack` shipped live SUM (`types.ts:44`; `RelationRollup.ts:92-129`). If not, stop. Do not block on MAX [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 Inspect live Reports `db_view` via `DataSource.parseDatabaseConfig` (`:627-637,787`). Record: note path; `computedSyncMode`; each Income/Expenses/Sales `col.key` + `col.label` (`ComputedField.ts:563-564`); Sales meaning; current `columns`, `computedFields`, `views[].columnOrder`, `views[].hiddenColumns`. Confirm aggregation is `sum`. Names are not assumed (Reports note; this child's inspect record) [S]
- [ ] T004 Lock expressions into that record using inspected names: Remaining default `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])` (`SafeEval.ts:972`). Saved: Sales outflow → same null-guard minus Sales; else skip Saved. Blank-vs-zero: null-guard default; bare subtraction is the zero opt-in; do not use `IFERROR` (`ComputedField.ts:294-304`) (this child's spec.md Open Questions) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Confirm Open Q1–Q3 are answered with live values in this packet, not only in chat (`spec.md`, `implementation-summary.md`) [S]
- [ ] T006 Confirm Reports note bytes and fork `ComputedField.ts` / `SafeEval.ts` / `BaseExpression.ts` / `RelationRollup.ts` are unmodified [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Inspect record exists; no formula YAML written
- [ ] Manual verification of T005–T006 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 1–6, Open questions
- **Parent final-plan**: `../research/final-plan.md` steps 1–2
<!-- /ANCHOR:cross-refs -->
