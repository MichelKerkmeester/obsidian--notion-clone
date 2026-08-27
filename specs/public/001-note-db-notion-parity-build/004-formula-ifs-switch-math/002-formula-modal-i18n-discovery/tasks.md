---
title: "Tasks: Formula Modal i18n Discovery"
description: "Tasks to concat formulaIfsSwitchMathHelp at FUNCTIONS init and append eight formula.fn.*.desc keys in three locales."
trigger_phrases:
  - "formula modal tasks"
  - "FUNCTIONS concat"
  - "i18n formula"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/004-formula-ifs-switch-math/002-formula-modal-i18n-discovery"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored discovery child from synthesis rank 5 and final-plan steps 4-5"
    next_safe_action: "Concat help rows at FUNCTIONS init and append eight i18n keys per locale"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-formula-modal-i18n-discovery"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Formula Modal i18n Discovery

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

T003–T004 land together so autocomplete names have matching locale strings.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child 001 exported `formulaIfsSwitchMathHelp` with eight rows (IFS, SWITCH, SQRT, LN, LOG, LOG10, EXP, CBRT); read synthesis rank 5 and final-plan steps 4–5 [15m]
- [ ] T002 Confirm `FUNCTIONS` at `FormulaModal.ts:60-105`, `FUNCTION_NAMES` at `:110`, knownNames at `:864-868`, highlight at `:1202`; confirm `formula.fn.IF.desc` at `i18n.ts:1115,2587,4105` [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Call site 2 (P1)** — import `formulaIfsSwitchMathHelp` next to other `../../data/` imports (`FormulaModal.ts:1-16`); `const FUNCTIONS = [ …existing, ...formulaIfsSwitchMathHelp ]` at `:60-105`. Do not push later. Confirm `:110`, `:864-868`, `:1202` pick up names with no extra edits (`src/views/modals/FormulaModal.ts:60-105`) [S]
- [ ] T004 **Call site 3 (P1)** — same child as T003: append eight `formula.fn.<NAME>.desc` keys (IFS, SWITCH, SQRT, LN, LOG, LOG10, EXP, CBRT) in en (~1115), zh-CN (~2587), zh-TW (~4105). Match existing sentence style. LOG = “log10, optional base”, not a copy of LN (`src/i18n.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Autocomplete lists IFS/SWITCH/SQRT/LN/LOG/LOG10/EXP/CBRT; `IFS(` / `SQRT(` highlight as function (`FormulaModal.ts:1202`) [S]
- [ ] T006 All three locales have all eight keys; LOG strings mention log10 / optional base; scratch-vault IFS no longer yields `formula.error.notFunction` (`ComputedField.ts:527-530`) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T004 shipped together
- [ ] Manual verification of T005–T006 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 5
- **Parent final-plan**: `../research/final-plan.md` steps 4–5, 8
<!-- /ANCHOR:cross-refs -->
