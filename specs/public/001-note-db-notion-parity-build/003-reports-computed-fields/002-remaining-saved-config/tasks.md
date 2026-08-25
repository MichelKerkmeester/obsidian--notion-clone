---
title: "Tasks: Remaining Saved Config"
description: "One config transaction: Remaining, Saved if distinct, view columnOrder, labels, explicit display-only. No engine edits."
trigger_phrases:
  - "remaining saved config tasks"
  - "saveFormula"
  - "columnOrder"
  - "display-only pin"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/003-reports-computed-fields/002-remaining-saved-config"
    last_updated_at: "2026-08-25T19:30:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored remaining-saved config child from synthesis and final-plan"
    next_safe_action: "Apply the one config transaction after the 001 inspect record exists"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-remaining-saved-config"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Remaining Saved Config

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

T002–T005 are **one config transaction**. Do not ship Remaining without the display-only pin, view `columnOrder`, and the Saved ship-or-skip decision.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child `001-live-reports-inspect` inspect record exists (live names, locked expressions, Saved skip-or-ship, blank-vs-zero). Copy the current Reports `db_view` payload for rollback (Reports note from inspect record) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 Add Remaining (and Saved, if not skipped) using inspected names. **Preferred:** Formula modal → `saveFormula` (`DatabaseView.ts:5678-5705`) creating `ComputedFieldDef` `{key,label,expression,type:"number"}` (`types.ts:102-109`) and matching `type: computed` columns with `computedKey`. **Alt:** flattened YAML `computedFields` + `columns` next to `computedSyncMode` (`DataSource.ts:1041-1062`; parse `:634-636,787`). Native `[field]` syntax; no `expressionSyntax: "base"`. No `src/data/*.ts` (Reports `db_view`) [S]
- [ ] T003 Remaining expression from the inspect record: default-blank null-guard `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])` (`SafeEval.ts:972`). Numeric-zero opt-in only if inspect recorded bare subtraction (`SafeEval.ts:962-1108`). Do not wrap with `IFERROR` (`ComputedField.ts:294-304`) (Reports `db_view`) [S]
- [ ] T004 Saved per inspect: Sales outflow → null-guarded `[Income] - [Expenses] - [Sales]`; else skip Saved. No percent Saved (Reports `db_view`) [S]
- [ ] T005 Order columns Income, Expenses, Remaining, Saved on view `columnOrder` (`ColumnConfig.ts:64-74`); keep new keys out of `hiddenColumns` (`:100-101`); human labels (`types.ts:102-104`). Pin `computedSyncMode: display-only` (`DataSource.ts:1056`); never `automatic` (`ComputedSync.ts:42-45`; `DatabaseView.ts:10244`) (Reports `db_view`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T006 Confirm defs present, view order, explicit display-only YAML, and `git diff` empty on `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts` [S]
- [ ] T007 Hand off arithmetic/empty-month/mistype/hash proofs to `003-reports-display-proof` [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T002–T005 shipped as one config transaction
- [ ] T006 engine freeze passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 1–6
- **Parent final-plan**: `../research/final-plan.md` steps 3–5
<!-- /ANCHOR:cross-refs -->
