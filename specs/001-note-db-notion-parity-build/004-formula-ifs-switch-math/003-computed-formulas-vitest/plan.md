---
title: "Implementation Plan: Computed Formulas Vitest"
description: "Plan for a moment stub plus module-only computed-formulas.test.ts. Run npx vitest run; do not import ComputedFieldEngine."
trigger_phrases:
  - "computed formulas vitest plan"
  - "formula test harness"
  - "npx vitest run"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/004-formula-ifs-switch-math/003-computed-formulas-vitest"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored vitest child from synthesis rank 6 and final-plan step 7"
    next_safe_action: "Create setup.ts and computed-formulas.test.ts importing only the new module"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-computed-formulas-vitest"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Computed Formulas Vitest

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Vitest (`vitest.config.ts:1-9`); node environment |
| **Storage** | None |
| **Testing** | `npx vitest run` — no `npm test` script |

### Overview
Bootstrap the missing harness and test the new module in isolation. `setup.ts` exists because the config lists it, not because the wrappers need moment. Keep the suite free of `obsidian` types.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 6 and final-plan step 7 read; empty `src/**/*.test.ts` confirmed in research.
- [x] Child 001 specified to export `formulaIfsSwitchMath`.

### Definition of Done
- [ ] `src/__tests__/setup.ts` stub exists.
- [ ] `computed-formulas.test.ts` covers the step-7 matrix.
- [ ] `npx vitest run` exits 0.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
First plugin vitest files. Test the pure module, not the sandbox engine.

### Key Components
- **`setup.ts`**: `globalThis.moment` stub.
- **`computed-formulas.test.ts`**: imports `formulaIfsSwitchMath` and calls wrappers directly.

### Data Flow
Vitest loads `setupFiles` → imports the test file → calls exported functions → asserts return values. No `safeEval`, no `createContext`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Test producers: new setup stub and new test file. Consumer: Vitest runner via `vitest.config.ts:1-9`. Non-consumers: FormulaModal, i18n, SafeEval. Algorithm invariant under test: unary LOG is log10, not ln.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 left `FormulaIfsSwitchMath.ts` on disk.
- [ ] Confirm `vitest.config.ts:6-7` still points at `src/__tests__/setup.ts`.

### Phase 2: Core Implementation
- [ ] Write the moment stub.
- [ ] Write the module test matrix.

### Phase 3: Verification
- [ ] `npx vitest run` green.
- [ ] Confirm a `LOG: Math.log` implementation would fail the suite.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Wrappers × aliases / LOG / IFS / SWITCH / domain / empty | Vitest (`npx vitest run`) |
| Integration | Not this child | Scratch-vault eval is child 001/002 |
| Manual | None required beyond reading vitest output | — |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 `FormulaIfsSwitchMath.ts` | Internal | Required | Nothing to import |
| `vitest` already in the fork | Internal | Green | Config already exists |
| Child 002 discovery | Internal | Not required | Tests do not assert autocomplete |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Vitest cannot start (missing setup); tests import the engine and fail on `obsidian` types; suite green while `LOG === LN`.
- **Procedure**: Delete or revert `src/__tests__/setup.ts` and `src/data/__tests__/computed-formulas.test.ts` together. Do not leave `setupFiles` pointing at a missing file.
<!-- /ANCHOR:rollback -->
