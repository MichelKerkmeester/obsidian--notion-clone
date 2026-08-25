---
title: "Tasks: Formula Modal LET Help"
description: "Tasks to add LET/LETS rows at FUNCTIONS init under formula.catLogic and append formula.fn.LET.desc / LETS.desc in three locales."
trigger_phrases:
  - "formula modal let tasks"
  - "LET help"
  - "formula.catLogic"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/005-formula-let-variables/003-formula-modal-let-help"
    last_updated_at: "2026-08-25T21:30:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored P2 discovery child from synthesis rank 6 and final-plan step 11"
    next_safe_action: "Add LET/LETS FUNCTIONS rows and formula.fn.LET.desc / LETS.desc in three locales"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-formula-modal-let-help"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Formula Modal LET Help

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

T003–T004 land together so autocomplete names have matching locale strings. This is the P2 commit; do not include `formula.error.let*` keys.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child 001 did not add `__let` to FormulaModal and already shipped `formula.error.letArgCount` / `letName`; read synthesis rank 6 and final-plan step 11 [15m]
- [ ] T002 Confirm `FUNCTIONS` at `FormulaModal.ts:60-105`, `FUNCTION_NAMES` at `:110`, and existing `formula.fn.*` help rows in `i18n.ts` three locale blocks; confirm `SafeEval.ts` `TT.Pow` is `**` (line 32) [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Call site 3 (P2)** — add `LET` / `LETS` rows under `formula.catLogic` at `const FUNCTIONS` (`FormulaModal.ts:60-105`). Do not push later. Confirm `:110` picks up names with no extra edits. Examples use `**` / `pow`, never `^`. Quoted names + live body (`let("rate", 0.05, amount * rate)`). No `__let` row. No `formula.catVars` (`src/views/modals/FormulaModal.ts:60-105`) [S]
- [ ] T004 **Help i18n** — same child as T003: append `formula.fn.LET.desc` and `formula.fn.LETS.desc` in en / zh-CN / zh-TW. Match existing `formula.fn.*` sentence style. Do **not** add or edit `formula.error.letArgCount` / `letName` (`src/i18n.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Autocomplete lists LET/LETS; `LET(` / `LETS(` highlight as function (`FormulaModal.ts:110`) [S]
- [ ] T006 All three locales have both help keys; examples use `**` / `pow`; `__let` absent from `FUNCTIONS` and help copy [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T004 shipped together as the P2 commit
- [ ] Manual verification of T005–T006 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 6
- **Parent final-plan**: `../research/final-plan.md` step 11
<!-- /ANCHOR:cross-refs -->
