---
title: "Tasks: Formula IFS/SWITCH + Math Function Aliases"
description: "Ordered tasks: one module write (IFS/SWITCH + five aliases + Excel LOG), three call sites, vitest scaffolding (npx vitest run), lint + regression, upstream PR notes; LOG2 deferred."
trigger_phrases:
  - "ifs"
  - "switch"
  - "sqrt"
  - "math aliases"
  - "tax brackets"
  - "computed field"
  - "tasks"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/004-formula-ifs-switch-math"
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "markdown"
    recent_action: "Reconciled tasks with final-plan review findings"
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
# Tasks: Formula IFS/SWITCH + Math Function Aliases

> Ranked backlog from `research/synthesis.md`, converted to ordered tasks. Every task cites its real fork file:line target and effort tier. `[B]` marks the one deferred item.

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked / deferred |

**Task Format**: `T### [P?] Description (file path) [effort tier]`

**Evidence trail**: `research/synthesis.md` (ranked findings), `research/research.md` (full citations).

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Re-read the ranked backlog and locked design (`research/synthesis.md`) and confirm the six-name alias freeze and Excel-LOG decision [S]
- [ ] T002 Read the `createContext` UPPERCASE table region, `RESERVED` gate, and eval-scope line (`<fork>/src/data/ComputedField.ts:310-378`, `:93-98`, `:433-437`), plus the `SafeEval.ts` Call/Binary gate (`:949-1018`) marked off-limits [S]
- [ ] T003 Record the fork's upstream base commit for diff and rebase hygiene (research iter 7 records `v1.2.8` / `2c96359`) [S]

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

> Ordered by `research/synthesis.md` ranked backlog; every task cites its real fork file:line target. Backlog items #1-#4 are one module write (final-plan optimization #1: never land aliases without `LOG`).

### Backlog #1-#4 — One module write (IFS + SWITCH + five aliases + Excel LOG)
- [ ] T004 Create `src/data/FormulaIfsSwitchMath.ts` as a single write covering IFS, SWITCH, the five 1:1 aliases, and Excel `LOG` together; export `formulaIfsSwitchMath` (runtime table) and `formulaIfsSwitchMathHelp` (modal rows); zero `obsidian` imports; header in the same sentence pattern as `EuroFormat.ts:9` (local, rebasable, candidate-upstream bodies) (`<fork>/src/data/FormulaIfsSwitchMath.ts`) [S]
  - **IFS(...args)**: walk `cond,val` pairs on JS truthiness (same as existing `IF`, `ComputedField.ts:325` — `IFS(0, "a", 1, "b")` returns `"b"`; help text must not claim Notion-boolean-only); odd arity → trailing default; even arity no-match or <1 pair → `null`.
  - **SWITCH(expr, ...rest)**: `expr` then `pat,val` pairs with strict `===`; odd remaining arity → trailing default; no match/no default/no pair → `null`. Help example: `=SWITCH(UPPER([period]), "MONTH", [amount], "QUARTER", [amount]*3, 0)`.
  - **Aliases** (each `Number(...)`-coerced like `ROUNDUP`, `ComputedField.ts:314-315`): `SQRT→Math.sqrt`, `LN→Math.log`, `LOG10→Math.log10`, `EXP→Math.exp`, `CBRT→Math.cbrt`.
  - **LOG(n, b?)**: `b == null ? Math.log10(Number(n)) : Math.log(Number(n))/Math.log(Number(b))` — test `b == null` BEFORE `Number(b)` (`Number(null)===0` would take the two-arg path and yield ±Infinity); `LOG: Math.log` is forbidden (silently equals `LN`). Help example: `=IFS([income]<=69715, 0.14, [income]<=150000, 0.30, 0.36)`.
  - **Help rows**: Logic category for IFS/SWITCH, Math category for the six aliases; document `field("x")` / `IFERROR` / nested ternary `?:` as the eager-branch workaround in IFS/SWITCH examples (do not edit `SafeEval.ts` to get Notion-lazy `ifs`). No lowercase `ifs`/`switch`.

### Integration
- [ ] T008 Call site 1 (P0): single additive `Object.assign(context, { ...existing, ...formulaIfsSwitchMath })` beside `IF`/`AND`/`OR`; precedence unchanged since UPPERCASE assigns already override frontmatter/computed (`<fork>/src/data/ComputedField.ts:310-378`) [S]
- [ ] T009 Call site 2 (P1 lock-in): concat `...formulaIfsSwitchMathHelp` into the `FUNCTIONS` array **at its declaration** (`FUNCTIONS` is a `const` initialized once; `FUNCTION_NAMES` is built at load from it) so `:110`, `:1202`, and autocomplete `:864-868` pick up the names — import the help export, do not duplicate names or push rows later (`<fork>/src/views/modals/FormulaModal.ts:60-105`, `:110`, `:1202`, `:864-868`) [S]
- [ ] T010 Call site 3 (P1 lock-in): append eight `formula.fn.<NAME>.desc` keys — `IFS`, `SWITCH`, `SQRT`, `LN`, `LOG`, `LOG10`, `EXP`, `CBRT` — to the three locale blocks (24 strings total), append-only; the `LOG` description covers "log10, optional base" (not a copy of `LN`) (`<fork>/src/i18n.ts` en ~1115, zh-CN ~2587, zh-TW ~4105) [S]
- [ ] T011 Confirm `git diff <upstream-base> -- src/data/SafeEval.ts` stays empty after every edit; tokenizer, `ComputedEvaluator.ts`, `RelationRollup.ts`, and views (other than FormulaModal) untouched [S]

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Unit Tests (Backlog #6 — vitest scaffolding)
- [ ] T012 Scaffold `src/__tests__/setup.ts` with the minimal `globalThis.moment` stub — `setup.ts` MUST exist because `vitest.config.ts` lists it as a required setup file; the fork has zero plugin test files today (`<fork>/src/__tests__/setup.ts`) [S]
- [ ] T013 Write `computed-formulas.test.ts` importing **only the new module** (not `ComputedFieldEngine`, which needs `moment` + `t()`); run via `npx vitest run` (the fork's `package.json` has no test script, so `npm test` is unavailable). Cases: `SQRT(9)===3`; `LN(Math.E)≈1`; `LOG(100)===2` (not `Math.log(100)`); `LOG(8,2)===3`; `LOG10`/`EXP`/`CBRT` vs `Math.*`; IFS three-bracket boundaries; SWITCH `"Month"!=="month"`; empty/`<1` pair/no match → `null`; trailing defaults; `SQRT(-1)` NaN; `LN(0)` `-Infinity`; `LOG(n,1)` non-finite; no `console.warn` from wrappers (`<fork>/src/data/__tests__/computed-formulas.test.ts`) [S]

### Manual Verification
- [ ] T014 Evaluate one tax-bracket IFS and one period SWITCH on a throwaway computed column in a scratch vault with recorded output; confirm the correct branch is selected, unmatched dispatch renders blank (not a persisted error), domain alias `SQRT(-1)` displays `"-"`, and `IFS` no longer yields `formula.error.notFunction` (`ComputedField.ts:527-530`) [S]
- [ ] T017 Run `npm run lint` (ignores `src/__tests__/**`); confirm pre-existing formulas still evaluate identically (purely additive regression) [S]

### Documentation (Backlog #7's PR half)
- [ ] T015 Draft the candidate upstream PR: inline the same function literals into pangy9's UPPERCASE block — do NOT import the fork module upstream; state honestly Notion `ifs` + Excel math aliases, base-10 LOG, eager branches vs Notion lazy `ifs`, blank/null on no match, and that AppFlowy/Anytype offer no formula precedent [S]

### Deferred
- [B] T016 Add optional `LOG2` alias completing Notion's log set — deferred outside the six-name freeze unless the operator explicitly expands scope; one extra table row plus one FormulaModal/i18n entry if approved (`<fork>/src/data/FormulaIfsSwitchMath.ts`) [S]

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All non-deferred tasks marked `[x]`. [Evidence: pending — task set in the Phase 1-3 anchors once built]
- [ ] Only `[B]`-marked deferred tasks remain open, with operator sign-off recorded. [Evidence: pending — T016 deferral note in implementation summary]
- [ ] Vitest suite and scratch-vault spot-checks passed. [Evidence: pending — recorded command output at build time]
- [ ] Checklist.md fully verified. [Evidence: pending — checklist summary records verified counts at build time]

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Research Synthesis**: See `research/synthesis.md`

<!-- /ANCHOR:cross-refs -->
