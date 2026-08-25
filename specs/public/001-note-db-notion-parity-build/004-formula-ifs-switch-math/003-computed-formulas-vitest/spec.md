---
title: "Feature Specification: Computed Formulas Vitest"
description: "Bootstrap src/__tests__/setup.ts and src/data/__tests__/computed-formulas.test.ts against FormulaIfsSwitchMath.ts so SC-001 has something to run."
trigger_phrases:
  - "computed formulas vitest"
  - "formula test harness"
  - "setup.ts moment stub"
  - "npx vitest run"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/004-formula-ifs-switch-math/003-computed-formulas-vitest"
    last_updated_at: "2026-08-25T19:15:00Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Computed Formulas Vitest

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `004-formula-ifs-switch-math` |
| **Parent Spec** | ../spec.md |
| **Phase** | 3 of 3 |
| **Predecessor** | 001-formula-ifs-switch-math-module |
| **Successor** | None |
| **Handoff Criteria** | `npx vitest run` exits 0 on the module tests; no `obsidian` types; setup.ts stub present |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 3 of 3** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-formula-ifs-switch-math-module` (hard: the module must exist). May run in parallel with `002-formula-modal-i18n-discovery` once child 001's module is on disk (final-plan step 7: can parallel steps 3–5).

This child is synthesis rank 6 and final-plan step 7. `vitest.config.ts` includes `src/**/*.test.ts` and **requires** `src/__tests__/setup.ts` (`:6-7`), but the fork has no plugin `*.test.ts` and no `__tests__` tree. `package.json` has no test script — run `npx vitest run`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Parent plan.md's “run the plugin test suite” currently has nothing to run. The glob of fork `src/**/*.test.ts` is empty (node_modules only). `vitest.config.ts:6-7` lists `setupFiles: ["src/__tests__/setup.ts"]`, so a missing setup file fails the runner even if tests exist.

### Purpose
Create a minimal `globalThis.moment` stub at `src/__tests__/setup.ts` and a module-only suite at `src/data/__tests__/computed-formulas.test.ts` that imports `formulaIfsSwitchMath` (no `obsidian` types, no `ComputedFieldEngine`). Prove LOG ≠ LN, IFS/SWITCH edges, and IEEE domain on the wrappers themselves.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **New** `src/__tests__/setup.ts`: minimal `globalThis.moment` stub required by `vitest.config.ts:6-7`.
- **New** `src/data/__tests__/computed-formulas.test.ts` importing only the new module. Cases from final-plan step 7:
  - `SQRT(9)===3`
  - `LN(Math.E)≈1`
  - `LOG(100)===2` (not `Math.log(100)`)
  - `LOG(8,2)===3`
  - `LOG10` / `EXP` / `CBRT` vs `Math.*`
  - IFS three-bracket boundaries
  - SWITCH `"Month" !== "month"`
  - empty / &lt;1 pair / no match → `null`
  - trailing defaults
  - `SQRT(-1)` NaN; `LN(0)` `-Infinity`; `LOG(n,1)` non-finite
  - wrappers emit no `console.warn`
- Run `npx vitest run` (not `npm test`).
- Lint: `npm run lint` ignores `src/__tests__/**`; still keep the new module lint-clean from child 001.

### Out of Scope
- Importing `ComputedFieldEngine` (needs `moment` + `t()`). Optional later engine smoke via `evaluateSingleDetailed` is not required if a scratch-vault eval covers the spread.
- FormulaModal / i18n assertions (child 002).
- General test migration of the rest of the plugin.
- Adding an `npm test` script unless the operator asks.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/__tests__/setup.ts` | Create | `globalThis.moment` stub for `vitest.config.ts:6-7` |
| `src/data/__tests__/computed-formulas.test.ts` | Create | Module-only wrapper tests |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Setup file exists | `src/__tests__/setup.ts` provides a `globalThis.moment` stub so vitest can start (`vitest.config.ts:6-7`) |
| REQ-002 | Tests import the module only | `computed-formulas.test.ts` does not import `ComputedFieldEngine` or `obsidian` types |
| REQ-003 | `npx vitest run` exits 0 | Covers aliases, Excel LOG vs LN, IFS/SWITCH edges, IEEE domain, and no `console.warn` from wrappers |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | LOG trap is asserted | `LOG(100)===2` and `LOG(100) !== Math.log(100)`; two-arg `LOG(8,2)===3` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `npx vitest run` is green on `computed-formulas.test.ts`.
- **SC-002**: The suite fails if someone ships `LOG: Math.log`.
- **SC-003**: Empty / unmatched IFS/SWITCH cases expect `null`, not throws.
- **SC-004**: Harness is setup stub + this one test file — no general migration.

### Acceptance Scenarios

- **Given** the new module, **when** `npx vitest run` executes, **then** SQRT/LN/LOG/LOG10/EXP/CBRT match the locked semantics.
- **Given** `IFS(0, "a", 1, "b")`, **when** the wrapper runs, **then** the result is `"b"` (JS truthiness like `IF` at `ComputedField.ts:325`).
- **Given** SWITCH `"Month"` vs `"month"`, **when** matched, **then** they are not equal.
- **Given** wrappers, **when** they miss / go empty, **then** they return `null` and do not `console.warn`.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Import `ComputedFieldEngine` | Tests need `moment` + `t()` and Obsidian types | Import only `FormulaIfsSwitchMath.ts` |
| Risk | Missing `setup.ts` | Vitest fails on `setupFiles` even if tests are correct | Create the stub in the same child as the tests |
| Dependency | Child 001 module on disk | Nothing to import | May parallel child 002; cannot start before 001 |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked default: test the module, not the engine. Optional engine smoke is later, not required here.
<!-- /ANCHOR:questions -->
