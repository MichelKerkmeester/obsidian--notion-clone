---
title: "Feature Specification: Let Vitest Matrix"
description: "Bootstrap src/__tests__/setup.ts and a test script, then prove transformLetCalls and the corrected 18-case engine matrix so SC-001/SC-002 are runnable."
trigger_phrases:
  - "let vitest matrix"
  - "LetVariables.test.ts"
  - "ComputedField.let.test.ts"
  - "formula test harness"
  - "18-case matrix"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/005-formula-let-variables/002-let-vitest-matrix"
    last_updated_at: "2026-08-25T21:30:00Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Let Vitest Matrix

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `005-formula-let-variables` |
| **Parent Spec** | ../spec.md |
| **Phase** | 2 of 3 |
| **Predecessor** | 001-let-variables-module |
| **Successor** | 003-formula-modal-let-help |
| **Handoff Criteria** | `npx vitest run` green on in-scope cases; setup.ts and `test` script exist |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 2 of 3** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-let-variables-module` (hard: the module and wiring must exist for engine tests; pure-transform tests need `LetVariables.ts` on disk) · Successor: `003-formula-modal-let-help`. Harness files may start as soon as child 001's module exists.

This child is synthesis rank 5 and final-plan steps 1–2, 4, 8–10. The fork has vitest (`vitest.config.ts` includes `src/**/*.test.ts`, `setupFiles: src/__tests__/setup.ts`) but **zero** `*.test.ts` files, no `src/__tests__/`, and no `package.json` `test` script (`package.json:6-10`). Without this child, SC-001 / SC-002 / REQ-006 cannot be evidenced.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Parent success criteria assume “the fork’s formula test suite.” It does not exist. A missing `setup.ts` fails the runner even if tests are added (`vitest.config.ts` `setupFiles`). Copying the research matrix as written will also fail: `pi` is a number constant (`ComputedField.ts:148`), not `pi()`; fork power is `**` (`SafeEval.ts:233`); `round(n, d)` requires digits (`ComputedField.ts:152`); lowercase `if(...)` is a statement (`SafeEval.ts:270`, `:495-523`), not `context.if`.

### Purpose
Bootstrap `src/__tests__/setup.ts` (minimal `globalThis.moment` for `parseMoment` / `today`) and `"test": "vitest run"`, then land `LetVariables.test.ts` (pure transform, written first) and `ComputedField.let.test.ts` (engine matrix via `evaluateSingleDetailed`) with the corrected cases.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **New** `src/__tests__/setup.ts`: assign a minimal `globalThis.moment` (or `vi.stubGlobal`) sufficient for `parseMoment` / `today`. Do **not** mock the whole Obsidian API (`ComputedField.ts` and `i18n.ts` do not import `obsidian`; skip `obsidian` mocks until a test actually imports a view).
- **Modify** fork `package.json` scripts: add `"test": "vitest run"`.
- **New** `src/data/__tests__/LetVariables.test.ts` (pure transform, no `moment` required). Scanner: `let("a", "x,y", a)` is one arg split; `"let("` in strings untouched; `obj.let(` untouched; `let ("a",1,a)` matches. Emission is nested, not flat. `lets("a",1)` → argCount; `let(5,1,2)`, `let("a b",1,2)`, `let("if",1,2)` → name. `let("let",5,let+1)` allowed. Recurse covers value-position `let("a", let("b",1,b+1), a)`.
- **New** `src/data/__tests__/ComputedField.let.test.ts` via `evaluateSingleDetailed`. Corrected matrix: (1) amount=100 → 5; (2)(3) multi-var let/lets → 3; (4) sequential → 3; (5)(6) nested / shadow `"Monkey D. Luffy"` / `"Monkey D. Garp"`; (7) `let("rate",0.05,rate)+rate` → NaN, no throw (leakage proven **inside one expression**); (8) `"Hello, Alan!"`; (9) `let("radius",4,round(pi * radius ** 2, 0))` → 50; (10) triangle 12; (11) `[amount]` / `field("amount")` after normalize; (12) `let("round",5,round(3.14))` → `notFunction`; (13)(14) typed errors; (15) `let("a",a,a)` → undefined/NaN, no throw; (16) `IF(amount>50, let("rate",0.1,amount*rate), 0)` amount=100 → 10 (eager both branches); (17) **only if 004 merged** `let("r",4,sqrt(pi * r ** 2))`; (18) `round(3.14, 2)` identical to pre-change. Also: user `__let` + `=>` still errors `noArrowFunction`.
- Baseline: `npx vitest run` after harness, before engine edits if this child starts early; after child 001, record pass count then the matrix.
- Display-only proof (final-plan step 9): review `ComputedEvaluator.ts:29-78` + LetVariables exports — no frontmatter / `TFile` / `fs` / network in the let path; errors → `null` in the result map.
- Gates (step 10): `npx vitest run`; `npm run build`; `npm run lint`; `git diff --exit-code -- src/data/SafeEval.ts`.

### Out of Scope
- `LetVariables.ts` / `ComputedField.ts` wiring / error keys (child 001).
- FormulaModal `FUNCTIONS` and `formula.fn.LET.desc` (child 003).
- General test migration of the rest of the plugin.
- Blocking on CHK-032 live rollup iCloud screenshots (construction + step 9 is enough).
- Blocking the transform on phase 004; skip case 17 if `sqrt` is absent.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/__tests__/setup.ts` | Create | Minimal `globalThis.moment` stub for `vitest.config.ts` `setupFiles` |
| `package.json` | Edit | Add `"test": "vitest run"` |
| `src/data/__tests__/LetVariables.test.ts` | Create | Pure-transform scanner / emission / error cases |
| `src/data/__tests__/ComputedField.let.test.ts` | Create | Engine 18-case matrix via `evaluateSingleDetailed` |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Harness exists | `src/__tests__/setup.ts` provides `globalThis.moment`; `"test": "vitest run"` is in `package.json`; `npx vitest run` can start (`vitest.config.ts` `setupFiles` path exists) |
| REQ-002 | Pure-transform suite | `LetVariables.test.ts` covers scanner, nested (not flat) emission, argCount/name including `let("if",…)`, and `let("let",…)` allowed |
| REQ-003 | Engine matrix (in-scope) | `ComputedField.let.test.ts` greens cases 1–16 + 18; case 17 runs only if 004 `sqrt` exists; case 9 uses `round(pi * radius ** 2, 0)` not `pi()`; case 16 uses uppercase `IF(...)` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | SC-002 0-delta | Case 18 `round(3.14, 2)` matches pre-change; formulas with no `let(`/`lets(` stay pass-through |
| REQ-005 | Display-only let path | `ComputedEvaluator.ts:29-78` still writes only a result map; errors → `null`; LetVariables exports stay pure (no `fs` / network / `TFile`) |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: In-scope matrix cases are green (`npx vitest run` / `npm test`).
- **SC-002**: Case 18 and no-let formulas show 0 delta against the post-harness baseline.
- **SC-003**: `SafeEval.ts` diff remains empty after this child (tests only).
- **SC-004**: Harness is `setup.ts` + `test` script + the two let test files — no general migration.

### Acceptance Scenarios

- **Given** `LetVariables.ts` on disk, **when** `LetVariables.test.ts` runs, **then** `lets("a", 1, "b", a + 1, a + b)` emits nested `__let`, not a flat two-param arrow.
- **Given** wired `evaluateSingleDetailed`, **when** case 9 runs, **then** `let("radius",4,round(pi * radius ** 2, 0))` is 50.
- **Given** case 16, **when** `IF(amount>50, let(...), 0)` runs with amount=100, **then** the result is 10 and both branches still eager-eval.
- **Given** case 17, **when** 004 has not merged `sqrt`, **then** the case is skipped rather than failing the suite.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Copying the research matrix verbatim | `pi()` throws `notFunction`; `if(...)` is a statement; `round` without digits is NaN | Use the corrected cases from final-plan gap 3 |
| Risk | Missing `setup.ts` | Vitest fails on `setupFiles` even if tests are correct | Create the stub in the same child as the tests |
| Risk | Mocking the whole Obsidian API | Extra surface, unused (`ComputedField.ts` does not import `obsidian`) | Moment global only; skip view mocks |
| Dependency | Child 001 module + wiring | Pure tests need `LetVariables.ts`; engine tests need both call sites and error keys | Harness can start in parallel; engine tests wait on 001 |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: bootstrap the harness here (synthesis Q2); skip case 17 unless 004 merged; no special unbound check on case 15; do not block on a live rollup screenshot.
<!-- /ANCHOR:questions -->
