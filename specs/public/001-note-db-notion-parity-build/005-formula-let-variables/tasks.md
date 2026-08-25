---
title: "Tasks: Formula LET/LETS Variables"
description: "Ranked backlog from research/synthesis.md as ordered tasks for the LetVariables.ts transform and ComputedField.ts call sites; all tasks pending."
trigger_phrases:
  - "let variable"
  - "lets variable"
  - "formula let"
  - "notion let"
  - "formula tasks"
  - "computed field"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/005-formula-let-variables"
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "markdown"
    recent_action: "Applied final-plan.md review findings"
    next_safe_action: "Start at T001 — bootstrap the vitest harness"
    blockers:
      - "T014 lazy if/ifs — parent backlog"
      - "T015 unbound identifiers/static typing — parent backlog"
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
# Tasks: Formula LET/LETS Variables

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
| `[B]` | Blocked / deferred (parent backlog) |

**Task Format**: `T### [P?] Description (fork file:line target) [effort S/M/L]`

**Source of truth**: `research/synthesis.md` ranked backlog; evidence in `research/research.md`. Effort tiers are the synthesis's S/M/L estimates.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

> Backlog #5 (harness) + ordering prerequisites.

- [ ] T001 Bootstrap the vitest harness: create `src/__tests__/setup.ts` that assigns a minimal `globalThis.moment` (or `vi.stubGlobal`) sufficient for `parseMoment` / `today` — do NOT mock the whole Obsidian API (`ComputedField.ts` and `i18n.ts` do not import `obsidian`; skip `obsidian` mocks until a test actually imports a view); add `"test": "vitest run"` to `package.json` scripts so `vitest.config.ts` `setupFiles` path resolves — the fork has zero `*.test.ts` files today, so SC-002 is otherwise unprovable (`package.json`, `vitest.config.ts`) [S]
- [ ] T002 Confirm phase 004 merged on `createContext`; verify its UPPERCASE-alias region (~310-378) is untouched by this phase's placement decisions. NOTE: 004 is required only for matrix case 17 (`sqrt`) and to avoid rebasing the UPPERCASE alias table; `__let` registration does not touch that table, so the transform and cases 1–16 + 18 ship without 004 (`ComputedField.ts:294-304`, `ComputedField.ts:310-378`) [S]
- [ ] T003 Capture the regression baseline with the new harness before any engine change (`npx vitest run`) [S]

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

> Backlog #1–#4 core transform + call sites, #6 P2 discoverability.

### Core Transform
- [ ] T004 Create `src/data/LetVariables.ts` — one implementation covering scanner + emission + validation (merged T004–T007; `let`/`lets` are one transform, no separate code path). Scanner contract: depth-track over `(`/`[`/`{`; skip `"…"`, `'…'`, `` `…` `` honoring `\`; match `lets\s*\(` before `let\s*\(` (optional whitespace before `(` so `let ("a", 1, a)` still transforms); require a non-identifier left boundary and no preceding `.` (`obj.let(` is a method, not LET). Split args only at depth-1 commas. **Recurse `transformLetCalls` on every arg (value args AND body)** so `let("a", let("b",1,b+1), a)` rewrites the inner value-position `let`, not only the body. Validate: odd argc ≥ 3 else throw `Error` with stable prefix `let:argCount`; each name a quoted string matching `[A-Za-z_$][A-Za-z0-9_$]*` **and not in the SafeEval tokenizer keyword denylist** `{true, false, null, undefined, typeof, if, else, return}` else `let:name` — keyword names tokenize as `TT.If`/`TT.True` etc., not `TT.Ident`, so `expect(TT.Ident)` (`SafeEval.ts:826-828`) would throw `unexpectedToken` on the transformed form. Do NOT reuse `ComputedFieldEngine.RESERVED` (`:93-98`) — it filters frontmatter keys and bans `let`, which must remain a legal binding name (`let("let", 5, let + 1)` = 6). Emit right-to-left nested `__let((name) => body, value)`. Pass-through if no bare let/lets. (~35–45 lines) (`LetVariables.ts`; rules per `SafeEval.ts:258-269`) [M]
- [ ] T005 Pure-transform tests `src/data/__tests__/LetVariables.test.ts` — written BEFORE engine wiring (TDD the scanner; cheap, no `moment`): `let("a", "x,y", a)` one arg split; `"let("` in strings untouched; `obj.let(` untouched; `let ("a",1,a)` matches; nested emission not flat; `lets("a",1)` → argCount; `let(5,1,2)`, `let("a b",1,2)`, `let("if",1,2)` → name; `let("let",5,let+1)` allowed; value-position `let("a", let("b",1,b+1), a)` rewrites inner `let` [S]

### Engine Call Sites
- [ ] T006 Call site 1: import `transformLetCalls` into `evaluateExpressionDetailed`; insert `transformedExpr = transformLetCalls(normalizedExpr)` AFTER `validateFormulaSecurity` and **INSIDE the existing try** that wraps the `safeEval` calls — on transform failure, return the mapped error immediately and do NOT fall through to the `allowStatements: true` statement-mode retry (statement-mode fallback must not run on a failed transform). Both `safeEval` calls (expression + `allowStatements` fallback) consume `transformedExpr` (`ComputedField.ts:428-448`; security ban `ComputedField.ts:504-506`) [S]
- [ ] T007 Call site 2: export `registerLetHelper(context)` from `LetVariables.ts` registering `__let: (fn, ...vals) => fn(...vals)`; call it in `createContext` near `iferror` — do NOT add `__let` to the function table's phase-004 churn region or to FormulaModal FUNCTIONS (`ComputedField.ts:294-304`; Arrow child scope `SafeEval.ts:1043-1050`) [S]
- [ ] T008 Error map + i18n (CORE commit, P0): in `formatEvaluationError` (`ComputedField.ts:511-547`) map `let:argCount` → `t("formula.error.letArgCount")`, `let:name` → `t("formula.error.letName")`; add those two keys in en / zh-CN / zh-TW next to the existing error-key clusters (`i18n.ts` ~1175 / ~2647 / ~4165). Without these keys in the core commit, `t()` surfaces the key string. `extractDependencies` needs no change — it stays on the original formula; let-bound names are not columns (`ComputedField.ts:390-414`) [S]

### P2 Discoverability (separate commit, same PR)
- [ ] T009 Add LET/LETS entries to `FUNCTIONS` under `formula.catLogic` (examples use fork `**`/`pow`, never Notion `^`) plus en/zh-CN/zh-TW keys: `formula.fn.LET.desc`, `formula.fn.LETS.desc` only — the two `formula.error.let*` keys are NOT in this commit (they are P0 core, T008). Names `LET`/`LETS` so `FUNCTION_NAMES` (`FormulaModal.ts:110`) highlights them. No `formula.catVars`. No `__let` help. (`FormulaModal.ts:60-105`; `src/i18n.ts` three locale blocks) [S]

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

> Backlog #5 matrix + integrity gates; T014/T015 stay blocked on the parent backlog.

### Test Files
- [ ] T010 Write engine tests `src/data/__tests__/ComputedField.let.test.ts` covering the corrected 18-case matrix via `evaluateSingleDetailed`: (1) amount=100 `let("rate",0.05,amount*rate)`=5; (2)(3) multi-var let/lets = 3; (4) sequential `lets("a",1,"b",a+1,a+b)`=3; (5)(6) nested access / shadow `"Monkey D. Luffy"` / `"Monkey D. Garp"`; (7) **non-leakage proven inside one expression**: `let("rate",0.05,rate)+rate` with no field `rate` → `0.05 + undefined` → `NaN`, no throw (not a second evaluate call); (8) `"Hello, Alan!"`; (9) `let("radius",4,round(pi * radius ** 2, 0))`=50 — `pi` is a number constant not a function, fork power is `**` not `^`, and `round(n, d)` requires digits; (10) triangle 12; (11) `[amount]` / `field("amount")` after normalize; (12) `let("round",5,round(3.14))` → `notFunction`; (13) `lets("a",1)` → `letArgCount`; (14) `let(5,1,2)` → `letName`; (15) `let("a",a,a)` → undefined/NaN no throw; (16) `IF(amount>50, let("rate",0.1,amount*rate), 0)` amount=100 → 10 — use uppercase `IF(...)` not lowercase `if(...)` (tokenizer emits `TT.If`, `parseIfStatement` expects `if (test) cons else alt`, there is no lowercase `context.if`); both branches eager-eval (documented caveat); (17) **ONLY if 004 merged** `let("r",4,sqrt(pi * r ** 2))` — `sqrt` is absent until 004, do not block 005's transform on 004; (18) `round(3.14, 2)` identical to pre-change. Also: direct user `__let((a) => a, 5)` + `=>` still errors `noArrowFunction` [S]
- [ ] T011 Display-only proof: review `ComputedEvaluator.ts:29-78` + LetVariables exports — confirm no frontmatter/`TFile`/`fs`/network in the let path; errors → `null` in the result map. This is a read-only confirmation, not a manual rollup screenshot (`ComputedEvaluator.ts:29-78`) [S]

### Gates
- [ ] T012 Run the full suite; confirm 0-delta regression vs the T003 baseline; run `npm run build` and `npm run lint` [S]
- [ ] T013 Scope + integrity gates: `git diff --exit-code -- src/data/SafeEval.ts`; `git diff --stat` confined to `LetVariables.ts`, `ComputedField.ts`, `i18n.ts` (error keys), tests, `setup.ts`, `package.json` (+ the separate P2 commit's `FormulaModal.ts`/`i18n.ts` help keys); update `checklist.md` evidence [S]

### Blocked / Parent Backlog — do not build here
- [B] T014 Lazy `if`/`ifs` (Notion compiles to `jumpIfTruthy`; fork `IF` receives eager args, `ComputedField.ts:325`) — engine-wide, fixing inside SafeEval violates REQ-004; future lazy-arg phase [L]
- [B] T015 Unbound identifiers / static typing (Notion type-errors `let(a,a,a)`; fork Ident returns `scope[name]` without throwing, `SafeEval.ts:935-936`) — engine-wide typing/strict-ident phase; divergence noted on the parent parity backlog [L]

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All non-`[B]` tasks marked `[x]`. [Evidence: pending — phase not yet built]
- [ ] The two `[B]` parent-backlog items remain deferred with documented reasons. [Evidence: pending — tracked on parent backlog]
- [ ] 18-case matrix green including sequential binding and all edge cases. [Evidence: pending — phase not yet built]
- [ ] Regression check passed with 0 delta against the captured baseline. [Evidence: pending — phase not yet built]
- [ ] `SafeEval.ts` diff verified empty. [Evidence: pending — phase not yet built]
- [ ] `checklist.md` fully verified. [Evidence: pending — phase not yet built]

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Research**: `research/synthesis.md` · `research/research.md`

<!-- /ANCHOR:cross-refs -->
