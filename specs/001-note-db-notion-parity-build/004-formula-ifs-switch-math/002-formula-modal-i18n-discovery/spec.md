---
title: "Feature Specification: Formula Modal i18n Discovery"
description: "P1 lock-in: concat formulaIfsSwitchMathHelp into FormulaModal FUNCTIONS at array init and append eight formula.fn.*.desc keys in en / zh-CN / zh-TW so IFS and friends autocomplete and highlight."
trigger_phrases:
  - "formula modal discovery"
  - "FUNCTIONS concat"
  - "formula.fn.IFS"
  - "i18n formula"
  - "autocomplete highlighting"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/004-formula-ifs-switch-math/002-formula-modal-i18n-discovery"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Formula Modal i18n Discovery

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `004-formula-ifs-switch-math` |
| **Parent Spec** | ../spec.md |
| **Phase** | 2 of 3 |
| **Predecessor** | 001-formula-ifs-switch-math-module |
| **Successor** | 003-computed-formulas-vitest |
| **Handoff Criteria** | Autocomplete lists the eight names; NAME( highlights; 24 i18n strings present |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 2 of 3** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-formula-ifs-switch-math-module` · Successor: `003-computed-formulas-vitest`. Depends on child 001's `formulaIfsSwitchMathHelp` export. Vitest (child 003) may already be running in parallel against the module.

This child is synthesis rank 5 and final-plan steps 4–5. Engine-only shipping leaves `IFS(` unhighlighted because FormulaModal reads its own `FUNCTIONS` registry (`FormulaModal.ts:60-105`), not the eval table. Do not defer without explicit operator approval.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Even after child 001 evaluates, the editor's own registry drives autocomplete, `NAME(` highlighting, and help. Unregistered names render as plain text. `FUNCTIONS` is a `const` initialized once (`FormulaModal.ts:60-105`); `FUNCTION_NAMES` is built at load (`:110`, reused at `:1202`); autocomplete/knownNames read `FUNCTIONS` (`:864-868`). Pushing rows later is too late.

### Purpose
Import `formulaIfsSwitchMathHelp` and concat it **at the `FUNCTIONS` declaration** so `:110`, `:864-868`, and `:1202` pick up IFS/SWITCH/SQRT/LN/LOG/LOG10/EXP/CBRT with no extra edits. Append eight `formula.fn.<NAME>.desc` keys in en (~1115), zh-CN (~2587), and zh-TW (~4105). LOG's description is log10 with optional base, not a copy of LN.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `FormulaModal.ts:60-105`: `const FUNCTIONS = [ …existing, ...formulaIfsSwitchMathHelp ]`. Import the help export next to the other `../../data/` imports (`FormulaModal.ts:1-16`). Do not duplicate names. Do not mutate `FUNCTIONS` after init.
- Confirm `:110`, `:864-868`, and `:1202` see the new names with no extra edits.
- `i18n.ts` append-only: eight keys `formula.fn.IFS.desc`, `SWITCH`, `SQRT`, `LN`, `LOG`, `LOG10`, `EXP`, `CBRT` in all three locale blocks (24 strings). Match existing sentence style (`formula.fn.IF.desc` at `:1115` / `:2587` / `:4105`). LOG: “log10, optional base”.
- Help examples already on the child-001 export (tax-bracket IFS, `UPPER([period])` SWITCH, eager-branch workaround) must keep those strings; do not rewrite them here except to consume the export.

### Out of Scope
- Engine wrappers or `ComputedField.ts` spread (child 001).
- Vitest files (child 003).
- New locale files; rewriting existing `formula.fn.*` rows; `LOG2` key.
- Touching `SafeEval.ts`, tokenizer, or views other than FormulaModal.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/modals/FormulaModal.ts` | Edit | Import help export; concat at `FUNCTIONS` declaration `:60-105` |
| `src/i18n.ts` | Edit | Append eight `formula.fn.<NAME>.desc` keys in en / zh-CN / zh-TW |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Help rows concat at `FUNCTIONS` init | `const FUNCTIONS = [ …existing, ...formulaIfsSwitchMathHelp ]` at `FormulaModal.ts:60-105`; names are not pushed later |
| REQ-002 | Autocomplete and highlighting see the names | `FUNCTION_NAMES` (`:110`, `:1202`) and knownNames (`:864-868`) list IFS/SWITCH/SQRT/LN/LOG/LOG10/EXP/CBRT; `NAME(` highlights as function |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-003 | Eight i18n keys in three locales | `formula.fn.IFS.desc` … `CBRT.desc` present at en ~1115, zh-CN ~2587, zh-TW ~4105 (24 strings); append-only |
| REQ-004 | LOG copy is not LN | LOG description states log10 with optional base; it is not a duplicate of the LN string |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: FormulaModal autocomplete lists IFS, SWITCH, SQRT, LN, LOG, LOG10, EXP, CBRT.
- **SC-002**: Typing `IFS(` highlights as a function token (`FormulaModal.ts:1202`).
- **SC-003**: All three locales have all eight `formula.fn.<NAME>.desc` keys.
- **SC-004**: No second `FUNCTIONS` mutation after the `const` init.

### Acceptance Scenarios

- **Given** FormulaModal open on a computed column, **when** the user types `IFS`, **then** autocomplete offers `IFS` and `IFS(` highlights as a function.
- **Given** the help panel, **when** IFS or SWITCH is selected, **then** the example uses `[income]` tax brackets or `UPPER([period])` SWITCH.
- **Given** zh-CN and zh-TW locales, **when** help renders, **then** each of the eight names has a description, and LOG is not a copy of LN.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Push help rows after `FUNCTION_NAMES` is built | Names evaluate but stay unstyled / unlistable | Concat at the `FUNCTIONS` declaration |
| Risk | Drop LOG or SWITCH from i18n | Autocomplete shows a name with a missing help string | Eight keys, not six; include LOG and SWITCH |
| Dependency | Child 001 `formulaIfsSwitchMathHelp` | Cannot concat an export that does not exist | Start after 001's module is on disk |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked default: ship call sites 2 and 3; deferral needs explicit operator approval. SWITCH help keeps `UPPER([period])` because matching is strict `===`.
<!-- /ANCHOR:questions -->
