---
title: "Implementation Plan: Let Vitest Matrix"
description: "Plan for a moment stub, a test script, LetVariables.test.ts, and the corrected ComputedField.let.test.ts engine matrix."
trigger_phrases:
  - "let vitest plan"
  - "LetVariables.test.ts"
  - "18-case matrix"
  - "npx vitest run"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/005-formula-let-variables/002-let-vitest-matrix"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored vitest child from synthesis rank 5 and final-plan steps 1-2, 4, 8-10"
    next_safe_action: "Create setup.ts, the test script, LetVariables.test.ts, and ComputedField.let.test.ts"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-let-vitest-matrix"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Let Vitest Matrix

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Vitest (`vitest.config.ts`); node environment |
| **Storage** | None |
| **Testing** | `"test": "vitest run"` plus `npx vitest run` |

### Overview
Bootstrap the missing harness, TDD the scanner with pure-transform tests, then prove the wired engine with the corrected 18-case matrix. `setup.ts` exists because the config lists it and because engine tests need a `moment` global. Do not mock Obsidian until a test imports a view.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 5 and final-plan steps 1–2, 4, 8–10 read; empty `src/**/*.test.ts` confirmed in research.
- [x] Child 001 specified to export `transformLetCalls` / `registerLetHelper` and to wire both call sites.

### Definition of Done
- [ ] `src/__tests__/setup.ts` stub exists; `"test": "vitest run"` is in `package.json`.
- [ ] `LetVariables.test.ts` green (scanner, nested emission, typed errors).
- [ ] `ComputedField.let.test.ts` green on in-scope cases (1–16 + 18; 17 gated).
- [ ] `npx vitest run` exits 0; `git diff --exit-code -- src/data/SafeEval.ts` empty.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
First plugin vitest files for LET. Pure-transform tests import `LetVariables.ts` only. Engine tests call `evaluateSingleDetailed` with a `moment` global from `setup.ts`.

### Key Components
- **`setup.ts`**: `globalThis.moment` stub for `parseMoment` / `today`.
- **`LetVariables.test.ts`**: string in → string/throw out. No `safeEval`.
- **`ComputedField.let.test.ts`**: full pipeline including `normalizeFormula` and `__let`.

### Data Flow
Vitest loads `setupFiles` → pure tests assert `transformLetCalls` → engine tests call `evaluateSingleDetailed` → assert values and mapped error strings. Baseline case 18 is a no-let formula so SC-002 has a number.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Test producers: new setup stub, `package.json` `test` script, two new test files. Consumers: Vitest runner via `vitest.config.ts`. Non-consumers: FormulaModal, SafeEval. Algorithm invariants under test: nested (not flat) emission; `pi` is a number; `IF(...)` not `if(...)`; leakage is proven inside one expression.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 left `LetVariables.ts` and the two call sites on disk.
- [ ] Confirm `vitest.config.ts` still points at `src/__tests__/setup.ts`.

### Phase 2: Core Implementation
- [ ] Write the moment stub and the `test` script; capture an empty-suite / harness baseline.
- [ ] Write `LetVariables.test.ts` before relying on engine tests.
- [ ] Write `ComputedField.let.test.ts` with the corrected matrix; gate case 17.

### Phase 3: Verification
- [ ] `npx vitest run` green; `npm run build`; `npm run lint`.
- [ ] Review `ComputedEvaluator.ts:29-78` for display-only; SafeEval diff empty.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Scanner / emission / transform errors | Vitest `LetVariables.test.ts` |
| Integration | 18-case engine matrix via `evaluateSingleDetailed` | Vitest `ComputedField.let.test.ts` |
| Manual | Display-only review of `ComputedEvaluator.ts:29-78` | Read + construction proof |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 `LetVariables.ts` + wiring | Internal | Required for tests | Pure tests need the module; engine tests need `__let` and error map |
| `vitest` already in the fork | Internal | Green | Config already exists |
| Phase 004 `sqrt` | Internal | Optional | Skip matrix case 17 only |
| Child 003 discovery | Internal | Not required | Tests do not assert autocomplete |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Vitest cannot start (missing setup); engine tests import a view and fail on `obsidian` types; case 9 still calls `pi()`; case 17 fails the suite when 004 is absent.
- **Procedure**: Revert `package.json` `test` script and delete `src/__tests__/setup.ts`, `LetVariables.test.ts`, and `ComputedField.let.test.ts` together. Do not leave `setupFiles` pointing at a missing file.
<!-- /ANCHOR:rollback -->
