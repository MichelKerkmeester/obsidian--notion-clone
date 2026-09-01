---
title: "Implementation Plan: Formula IFS/SWITCH + Math Function Aliases"
description: "Locked build design: pure FormulaIfsSwitchMath module spread into the createContext table, plus FormulaModal and i18n discovery call sites, without touching the SafeEval.ts sandbox."
trigger_phrases:
  - "ifs"
  - "switch"
  - "sqrt"
  - "math aliases"
  - "formula functions"
  - "computed field"
  - "createcontext"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/004-formula-ifs-switch-math"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "markdown"
    recent_action: "Reconciled plan with final-plan review findings"
    next_safe_action: "Build phase 004 per reconciled tasks"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Formula IFS/SWITCH + Math Function Aliases

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (MIT Obsidian plugin fork) |
| **Framework** | `note-database-fork` at `specs/obsidian/001-notion-finance-migration/build/note-database-fork` |
| **Storage** | Source in the fork; docs in this phase folder |
| **Testing** | Vitest suite (newly scaffolded) + evaluation spot-checks + git diff verification |

### Overview
This plan implements the synthesis verdict: the highest-value remaining formula-surface gap, built as named wrappers over an engine that already evaluates `IF`, exposes `Math` on the sandbox scope (`ComputedField.ts:433-437`), and dual-names `POWER`/`POW`. The locked design is a pure `src/data/FormulaIfsSwitchMath.ts` module (EuroFormat isolated-diff model, zero `obsidian` imports) spread into the existing UPPERCASE `createContext` table at `ComputedField.ts:310-378`, with two P1 lock-in call sites (FormulaModal `FUNCTIONS` at `FormulaModal.ts:60-105`, i18n `formula.fn.*` keys in three locales). `SafeEval.ts` is never edited; its diff must stay empty. The two traps this design defuses: shipping `LOG: Math.log` (JS ln — wrong; `LOG(n)` must be log10 with optional base), and shipping engine-only so `IFS`/`SQRT` never surface in autocomplete or highlighting.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Synthesis re-read (`research/synthesis.md`) including ranked backlog and locked semantics.
- [ ] Existing `createContext` function table read (`ComputedField.ts` regions ~310-378, ~93-98 RESERVED, ~433 eval scope).
- [ ] `SafeEval.ts` gate read and marked off-limits.
- [ ] Fork's upstream base commit recorded.

### Definition of Done
- [ ] Module contains wrappers, alias table (with Excel base-10 `LOG`, `b==null` tested before `Number(b)`), and modal help rows.
- [ ] All three call sites land: `Object.assign` spread, FormulaModal `FUNCTIONS` (concat at declaration), i18n locale appends (eight keys × 3 locales).
- [ ] Evaluation spot-checks and vitest suite pass via `npx vitest run` (alias equivalence + IFS/SWITCH scenarios incl. no-match → null).
- [ ] `npm run lint` exits 0 on the new module + three call sites; pre-existing formulas still evaluate.
- [ ] Diff shows zero changes to `SafeEval.ts`; tokenizer/`ComputedEvaluator`/rollups/views untouched.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
EuroFormat isolated-diff model — logic isolated in one conflict-friendly module ("kept in one module so it stays a small, rebasable diff", cf. `EuroFormat.ts:1-10`), consumed via minimal additive call-site edits. Same consumption shape as `CellRenderer.ts:13` / `SummaryRenderer.ts:7`.

### Key Components

| Piece | Path | Edit |
|---|---|---|
| **Module** | `<fork>/src/data/FormulaIfsSwitchMath.ts` | Exports `formulaIfsSwitchMath` (runtime table) and `formulaIfsSwitchMathHelp` (modal rows); zero `obsidian` imports; local, rebasable, candidate-upstream bodies |
| **Call site 1 (P0)** | `<fork>/src/data/ComputedField.ts:310-378` | `Object.assign(context, { ...existing, ...formulaIfsSwitchMath })` — additive keys beside `IF`/`AND`/`OR`; precedence unchanged since UPPERCASE assigns already override frontmatter/computed (`ComputedField.ts:139-147, 306-310`) |
| **Call site 2 (P1 lock-in)** | `<fork>/src/views/modals/FormulaModal.ts:60-105` | Concat `...formulaIfsSwitchMathHelp` into `FUNCTIONS` **at its declaration** (a `const` initialized once; `FUNCTION_NAMES` is built at load) so `:110`, `:1202`, and autocomplete `:864-868` see the new names — import the help export, do not duplicate names or push rows later |
| **Call site 3 (P1 lock-in)** | `<fork>/src/i18n.ts` | Append eight `formula.fn.<NAME>.desc` keys (`IFS`, `SWITCH`, `SQRT`, `LN`, `LOG`, `LOG10`, `EXP`, `CBRT`) in the three existing locale blocks (en ~1115, zh-CN ~2587, zh-TW ~4105); 24 strings total |

### Algorithm Contracts
- **IFS(...args)**: walk `cond,val` pairs; first JS-truthy cond returns its val (same truthiness as existing `IF` at `ComputedField.ts:325` — `IFS(0, "a", 1, "b")` returns `"b"`; help text must not claim Notion-boolean-only). Odd arity → last arg is default. Even arity without match, or <1 pair → `null`.
- **SWITCH(expr, ...rest)**: walk `pat,val` pairs with strict `===`. Odd remaining arity → trailing default. No match/no default/no pair → `null`. Case-sensitive by design; help example `=SWITCH(UPPER([period]), "MONTH", [amount], "QUARTER", [amount]*3, 0)`.
- **Aliases**: always `Number(...)`-coerced like `ROUNDUP` (`ComputedField.ts:314-315`): `SQRT→Math.sqrt`, `LN→Math.log`, `LOG10→Math.log10`, `EXP→Math.exp`, `CBRT→Math.cbrt`, `LOG(n,b?) → b==null ? Math.log10(Number(n)) : Math.log(Number(n))/Math.log(Number(b))` — test `b == null` BEFORE `Number(b)` (`Number(null)===0` would take the two-arg path and yield ±Infinity). `LOG: Math.log` is forbidden.
- **Help rows**: Logic category for IFS/SWITCH, Math category for the six aliases; IFS example `=IFS([income]<=69715, 0.14, [income]<=150000, 0.30, 0.36)`; document `field("x")` / `IFERROR` / nested ternary `?:` as the eager-branch workaround (do not edit `SafeEval.ts` to get Notion-lazy `ifs`).
- **Eager args, lazy operators — inherited, not special-cased**: `SafeEval` `Call` evaluates every argument before apply (`SafeEval.ts:985-1018`); existing `IF` is already eager. No edits to `SafeEval.ts`.

### Data Flow
Computed field expression → `SafeEval` parse (unchanged) → context function lookup finds the spread wrapper/alias → wrapper selects a branch or computes over coerced numbers → non-finite results display as `-` via `formatEuroNumber` (`EuroFormat.ts:30-31`). No new evaluation paths are introduced; `isCall` tokenization (`FormulaTokenizer.ts:175`) and dependency extraction (`ComputedField.ts:411`) already treat these names as plain calls.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read `research/synthesis.md`; confirm the six-name freeze and LOG decision are unchanged.
- [ ] Read `ComputedField.ts` `createContext` region (~310-378), `RESERVED` (~93-98), eval-scope line (~433-437).
- [ ] Read the `SafeEval.ts` Call/Binary gate (~949-1018); confirm the boundary contract and record the upstream base commit (research iter 7: `v1.2.8` / `2c96359`).

### Phase 2: Core Implementation
- [ ] Create `src/data/FormulaIfsSwitchMath.ts` as **one write** covering IFS, SWITCH, the five 1:1 aliases, Excel `LOG`, and the modal help rows per the algorithm contracts (never land aliases without `LOG`); `LOG(n,b?)` is log10/base-formula with `b==null` tested before `Number(b)` (never `Math.log` as `LOG`).
- [ ] Call site 1: single additive `Object.assign` spread into `ComputedField.ts` ~310-378.
- [ ] Call site 2: concat `...formulaIfsSwitchMathHelp` into FormulaModal `FUNCTIONS` **at declaration** (~60-105).
- [ ] Call site 3: append eight `formula.fn.<NAME>.desc` keys to en / zh-CN / zh-TW locale blocks in `i18n.ts`.
- [ ] Confirm `git diff <upstream-base> -- src/data/SafeEval.ts` is empty after each edit; tokenizer/`ComputedEvaluator`/`RelationRollup`/views (other than FormulaModal) untouched.

### Phase 3: Verification
- [ ] Scaffold `src/__tests__/setup.ts` (moment stub — required by `vitest.config.ts`) and `src/data/__tests__/computed-formulas.test.ts` importing **only the new module** (not `ComputedFieldEngine`); run `npx vitest run` (the fork's `package.json` has no test script).
- [ ] Run evaluation spot-checks (tax-bracket IFS incl. boundaries; case-sensitive SWITCH; alias equivalence; no-match → blank; `SQRT(-1)` displays `-`).
- [ ] Run `npm run lint` (ignores `src/__tests__/**`); confirm pre-existing formulas still evaluate identically (purely additive regression).
- [ ] Verify the fork diff touches only module + call sites + test scaffolding; draft the candidate upstream PR (inline literals shape — do not import the fork module upstream).

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Alias equivalence | Six frozen aliases vs `Math.*` (incl. unary `LOG(100)` = 2, `LOG(8,2)` = 3) | New vitest suite (`computed-formulas.test.ts`) — pure functions, no `obsidian` types needed; run via `npx vitest run` |
| Wrapper scenarios | Tax-bracket IFS incl. boundary incomes; monthly-vs-quarterly SWITCH; unmatched → null cases | Vitest unit tests + scratch-vault manual evaluation with recorded output |
| Edge cases | Empty args, trailing defaults, domain NaN/±Infinity, eager losing branches, `LOG(n,1)` non-finite | Vitest unit tests mirroring the spec edge-case table |
| Diff verification | Fork diff vs upstream base | `git diff --stat` and explicit empty-diff check on `SafeEval.ts` |
| Lint + regression | New module + three call sites lint clean; pre-existing formulas unchanged | `npm run lint` (ignores `src/__tests__/**`) + additive regression spot-check |
| Discovery | Autocomplete/highlighting registration and eight locale keys × 3 locales | Manual FormulaModal inspection across the three locales |

The fork currently has **no** plugin test files (`glob src/**/*.test.ts` is empty) and `package.json` has **no test script**, so tests run via `npx vitest run` (not `npm test`). Tests import **only the new module** — importing `ComputedFieldEngine` would pull `moment` + `t()` and defeat the pure-function scope; `setup.ts` must still exist because `vitest.config.ts` lists it as a required setup file. Phase 3 creates the first test files, which is why SC-001 depends on the scaffolding task landing before verification.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Fork codebase (`note-database-fork`) | Internal | Green | Phase cannot land |
| Upstream base commit (MIT plugin) | External | Green | Rebase hygiene and PR candidacy lost |
| `SafeEval.ts` sandbox | Internal | Untouchable | Boundary is the security model; zero-diff is a gate |
| FormulaModal `FUNCTIONS` registry | Internal | Green | Without call site 2 the functions evaluate but stay undiscoverable (REQ-008 fails) |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Vitest or spot-check failures, locale-key drift, or any non-empty `SafeEval.ts` diff.
- **Procedure**: Revert the module file and the three small call-site edits (`git checkout` of `ComputedField.ts`, `FormulaModal.ts`, `i18n.ts` in the fork; delete the new files). Each edit is additive and localized, so rollback is four git operations plus deleting two new files.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | Core Implementation |
| Core Implementation | Setup | Verification |
| Verification | Core Implementation | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 15 minutes |
| Core Implementation | Low-Medium | 3 hours (one module write + three call sites; the 24 i18n strings across 3 locales are the long pole) |
| Verification | Medium | 1.5 hours (first-ever vitest scaffold from zero — S only because tests import the module, not `ComputedFieldEngine` — + spot-checks + `npm run lint`) |
| **Total** | | **~5 hours (backlog tiers all S)** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Scope confirmed against spec.md (module + three call sites + tests; nothing else).
- [ ] Upstream base commit recorded.
- [ ] `SafeEval.ts` diff confirmed empty before deploy.

### Rollback Procedure
1. Revert the `ComputedField.ts`, `FormulaModal.ts`, and `i18n.ts` diffs in the fork.
2. Delete `src/data/FormulaIfsSwitchMath.ts` and the two test scaffolding files.
3. Re-run evaluation spot-checks and vitest to confirm pre-phase behavior (unknown-function errors for the new names).

### Data Reversal
- **Has data migrations?** No — formula evaluation is compute-only; no stored state changes, no extra iCloud churn.
- **Reversal procedure**: N/A beyond the file reverts; formulas referencing the new names return to the engine's unknown-function behavior, exactly as before the phase.

<!-- /ANCHOR:enhanced-rollback -->
