---
title: "Implementation Plan: Formula Modal LET Help"
description: "Plan to add LET/LETS rows at FormulaModal FUNCTIONS init under formula.catLogic and append formula.fn.LET.desc / LETS.desc in three locales."
trigger_phrases:
  - "formula modal let plan"
  - "LET help"
  - "formula.catLogic"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/005-formula-let-variables/003-formula-modal-let-help"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Formula Modal LET Help

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian Modal; live fork `Obsidian Plugin/src` |
| **Storage** | None — editor registry only |
| **Testing** | Manual FormulaModal check; unit tests stay in child 002 |

### Overview
Same PR, second commit: add LET/LETS to `FUNCTIONS` under `formula.catLogic` so load-time `FUNCTION_NAMES` sees them, then append two help strings per locale. Do not export help rows from `LetVariables.ts`. Do not touch error keys.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 6 and final-plan step 11 read; `FUNCTIONS` is a one-shot `const` at `FormulaModal.ts:60-105`.
- [x] Child 001 specified **not** to register `__let` in FormulaModal; child 001 already owns error keys.

### Definition of Done
- [ ] LET/LETS rows at `FUNCTIONS` declaration; `:110` needs no extra edits.
- [ ] Two keys × three locales; examples use `**` / `pow`; `__let` absent.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Append-only editor-registry rows. Unlike phase 004, this child does not concat a module help export — LET/LETS rows are authored here. FormulaModal stays the single editor registry.

### Key Components
- **`FUNCTIONS`**: existing rows plus LET/LETS under `formula.catLogic`.
- **`FUNCTION_NAMES`**: derived at `:110` from `FUNCTIONS`.
- **`i18n.ts`**: three locale objects; append `formula.fn.LET.desc` / `LETS.desc` after existing `formula.fn.*` help rows.

### Data Flow
Hand-authored help rows → `FUNCTIONS` array init → `FUNCTION_NAMES` Set → autocomplete and highlighter. Description keys resolve through `t()` from `i18n.ts`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Discovery producers: this child's FUNCTIONS rows (not a LetVariables export). Consumers this child: `FormulaModal.ts` `FUNCTIONS` / `FUNCTION_NAMES`, `i18n.ts` three locale blocks. Non-consumers: `ComputedField.ts`, `LetVariables.ts`, `SafeEval.ts`, vitest. Copy invariant: no `__let`; no `^`; no `formula.catVars`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 did not register names in FormulaModal and did not document `__let`.
- [ ] Confirm `FUNCTIONS` at `:60-105` and `FUNCTION_NAMES` at `:110`.

### Phase 2: Core Implementation
- [ ] Add LET/LETS rows under `formula.catLogic` at `FUNCTIONS` declaration.
- [ ] Append `formula.fn.LET.desc` / `LETS.desc` in en / zh-CN / zh-TW.

### Phase 3: Verification
- [ ] Autocomplete lists LET/LETS; `LET(` highlights.
- [ ] Examples use `**` / `pow`; `__let` absent from help.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Not this child | Child 002 tests the transform and engine |
| Manual | Autocomplete, highlighting, help panel in three locales | Obsidian fork FormulaModal |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 engine | Internal | Required for an honest help commit | Help without a working transform misleads Notion migrants |
| Child 002 vitest | Internal | Preferred predecessor | Final-plan step 11 sits after gates; can still author rows if tests are green |
| `i18n.ts` locale block structure | Internal | Green | Append-only `formula.fn.*` help keys |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Names missing from autocomplete; i18n key missing; example uses `^`; `__let` appears in help.
- **Procedure**: Revert the FormulaModal rows and the six i18n help strings as one unit. Do not revert child 001 error keys. Do not leave `FUNCTIONS` names without matching `formula.fn.*.desc` keys.
<!-- /ANCHOR:rollback -->
