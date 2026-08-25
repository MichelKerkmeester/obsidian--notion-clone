---
title: "Implementation Plan: Formula Modal i18n Discovery"
description: "Plan to concat formulaIfsSwitchMathHelp at FormulaModal FUNCTIONS init and append eight formula.fn.*.desc keys in three locales."
trigger_phrases:
  - "formula modal plan"
  - "FUNCTIONS concat"
  - "i18n formula"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/004-formula-ifs-switch-math/002-formula-modal-i18n-discovery"
    last_updated_at: "2026-08-25T19:15:00Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Formula Modal i18n Discovery

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian Modal; live fork `Obsidian Plugin/src` |
| **Storage** | None — editor registry only |
| **Testing** | Manual FormulaModal check; unit tests stay in child 003 |

### Overview
Import the child-001 help export and concat it at `FUNCTIONS` declaration so load-time `FUNCTION_NAMES` sees the eight names. Then append 24 i18n strings. Names are frozen from child 001; do not invent a ninth (`LOG2`).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 5 and final-plan steps 4–5 read; `FUNCTIONS` is a one-shot `const`.
- [x] Child 001 specified to export `formulaIfsSwitchMathHelp` with eight rows.

### Definition of Done
- [ ] `FUNCTIONS` concat at declaration; `:110`, `:864-868`, `:1202` need no extra edits.
- [ ] Eight keys × three locales; LOG copy is log10 with optional base.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Append-only consume of an already-exported help table. FormulaModal stays the single editor registry.

### Key Components
- **`FUNCTIONS`**: existing rows plus `...formulaIfsSwitchMathHelp`.
- **`FUNCTION_NAMES`**: derived at `:110`; highlighting at `:1202` uses `FUNCTION_NAMES.has(token.toUpperCase())`.
- **`i18n.ts`**: three locale objects; append after the existing `formula.fn.*` block.

### Data Flow
Help export → `FUNCTIONS` array init → `FUNCTION_NAMES` Set → autocomplete (`:864-868`) and highlighter (`:1202`). Description keys resolve through `t()` from `i18n.ts`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Discovery producers: child 001 `formulaIfsSwitchMathHelp`. Consumers this child: `FormulaModal.ts` `FUNCTIONS` / `FUNCTION_NAMES` / knownNames, `i18n.ts` three locale blocks. Non-consumers: `ComputedField.ts`, `SafeEval.ts`, vitest.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 exported eight help rows and did not register names in FormulaModal.
- [ ] Confirm `FUNCTIONS` at `:60-105`, `FUNCTION_NAMES` at `:110`, knownNames at `:864-868`, highlight at `:1202`.

### Phase 2: Core Implementation
- [ ] Import + concat at `FUNCTIONS` declaration.
- [ ] Append eight keys in en / zh-CN / zh-TW.

### Phase 3: Verification
- [ ] Autocomplete lists all eight; `IFS(` highlights.
- [ ] LOG locale strings are not LN copies.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Not this child | Child 003 tests the module |
| Manual | Autocomplete, highlighting, help panel in three locales | Obsidian fork FormulaModal |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 `formulaIfsSwitchMathHelp` | Internal | Required | Cannot concat |
| `i18n.ts` locale block structure | Internal | Green | Append-only at `:1115`, `:2587`, `:4105` |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Names missing from autocomplete; i18n key missing; LOG copy equals LN.
- **Procedure**: Revert the FormulaModal import/concat and the 24 i18n lines as one unit. Do not leave `FUNCTIONS` names without matching `formula.fn.*.desc` keys.
<!-- /ANCHOR:rollback -->
