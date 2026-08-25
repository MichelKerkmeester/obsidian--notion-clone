# Final Plan: Formula LET/LETS Variables
> Reviewed & optimized build plan, from a fresh Grok 4.6 (xhigh-fast) review of this phase's rewritten spec/plan/tasks/checklist plus its synthesis and research.

## Review — strengths, gaps, risks

The locked design is correct and the current docs finally match research. Do not implement `context.let` as a normal helper: SafeEval evaluates every Call argument in the caller scope before the function runs (`SafeEval.ts:1010-1017`), so `let("rate", 0.05, amount * rate)` dies on unbound `rate`. The nested `__let((name) => body, value)` transform is the right analogue of notion-vm `runLets`: Arrow evaluation builds `childScope = Object.create(scope)` (`SafeEval.ts:1043-1050`), and inner value args evaluate in the outer arrow’s scope. Naive IIFE `((rate) => body)(value)` is still dead (`parseArrowFunction` at `SafeEval.ts:824-838`). Flat `__let((a, b) => expr, v1, v2)` is still dead (eager `a + 1` in the caller). `SafeEval.ts` stays byte-identical. Pipeline order is locked: `normalizeFormula` (`ComputedField.ts:549-555`) → `validateFormulaSecurity` on the user string (`=>` ban at `:504-506`) → trusted `transformLetCalls` → both `safeEval` calls (`:441` and `:447`). Placement of `__let` near `iferror` (`:294-304`) correctly avoids the phase-004 UPPERCASE block (`:310-378`). Scanner rules (strings, `lets(` before `let(`, no `obj.let(`) and sequential-binding emission are specified well. EuroFormat isolation (`EuroFormat.ts:1-42`) is the right rebase shape.

What is solid in tasks: T004–T009 are the real work; T017/T018 correctly stay parent-backlog; security ordering and `__let` kept out of FormulaModal are right.

Gaps and wrong sequencing:

1. **Transform throws sit outside the try today.** `evaluateExpressionDetailed` (`ComputedField.ts:421-452`) runs security, then builds scope, then `try { safeEval }`. Research F66 inserts `transformLetCalls` *before* that try. An uncaught `Error("let: …")` escapes `evaluateSingleDetailed` and is not mapped to `formula.error.letArgCount` / `letName`. Statement-mode fallback must also **not** run on a failed transform. Plan/tasks say “wrap in existing try/catch” but do not pin the control flow.

2. **REQ-005 i18n is wrongly parked in the P2 commit.** T011 bundles `formula.error.letArgCount` / `letName` with FormulaModal help. Typed errors are P0 (`spec.md` REQ-005). `formatEvaluationError` (`ComputedField.ts:511-547`) currently maps SyntaxError/TypeError then falls through to `formula.error.generic`. Without the two keys in the **core** commit, `t()` will surface the key string. Help entries are P2; error keys are not.

3. **The 18-case matrix as written will fail if copied.** Research F63 / `tasks.md` T013:
   - Case 9 `round(pi()*radius**2)`: `pi` is a **number constant** (`ComputedField.ts:148`), not a function. `pi()` throws `notFunction`. Fork power is `**` (`SafeEval.ts:233`), not `^`. `round(n, d)` requires digits (`ComputedField.ts:152`); omit `d` and you get `NaN`. Expected `50` needs `round(pi * radius ** 2, 0)`.
   - Case 16 `if(amount>50, let(...), 0)`: tokenizer emits `TT.If` (`SafeEval.ts:270`), and `parseIfStatement` expects `if (test) cons else alt` (`:495-523`), not comma-call form. There is **no** lowercase `context.if`. Use `IF(amount>50, let(...), 0)` (`ComputedField.ts:325`). Both branches still eager-eval — that caveat is real.
   - Case 17 `sqrt(pi()*r**2)` waits on phase 004 (`004-formula-ifs-switch-math` is still Planned; `sqrt` is absent in current `ComputedField.ts`). Do not block 005’s transform on 004. Gate case 17 on 004 merge; ship 1–16 + 18 without it.
   - Case 7 “non-leakage” is underspecified: a second formula `rate` after `let("rate",…)` is a new evaluation, so leakage must be proven **inside one expression**, e.g. `let("rate",0.05,rate)+rate` with no field `rate` → `0.05 + undefined` → `NaN`, not a second evaluate call.

4. **Name validation is weaker than the parser.** IDENT_RE `[A-Za-z_$][A-Za-z0-9_$]*` accepts `if`, `true`, `return`. Those tokenize as keywords, not `TT.Ident` (`SafeEval.ts:264-272`), so `expect(TT.Ident)` at `:828` throws `unexpectedToken` on the transformed form — the exact user-facing failure REQ-005 exists to prevent. Research even celebrates `let("let", 5, let + 1) = 6` because `let` is *not* a keyword (`:258-269`). Keyword names must be `letName`. `ComputedFieldEngine.RESERVED` (`:93-98`) is the wrong set: it filters **frontmatter keys**, and it includes `let` which must remain a legal binding name.

5. **“Recurse on the body first” is incomplete.** Body-nested `let` is covered. `let` in a **value** position (`let("a", let("b",1,b+1), a)`) is not. Recurse `transformLetCalls` on every value arg and the body.

6. **Harness effort is padded; engine tests are cheaper than claimed.** Fork has vitest (`vitest.config.ts` `include: src/**/*.test.ts`, `setupFiles: src/__tests__/setup.ts`) but **zero** `src/**/*.test.ts` and no `test` script (`package.json:6-10`) — F60 is right, bootstrap is in-phase. Overstated: `ComputedField.ts` does not import `obsidian`; `i18n.ts` does not either. Engine tests need a `moment` global and a `src/__tests__/setup.ts` so vitest’s `setupFiles` path exists. Do not mock the whole Obsidian API.

7. **Task granularity:** T006 is a scanner rule, not a task. T010 is a read-only confirmation. T012/T013 belong next to the module, not after wiring. Plan total ~4h is plausible; “Harness = 45 min” is high if you only stub `moment` + empty setup.

8. **Checklist over-weight:** CHK-032 (live rollup iCloud render) is not a unique let path. `evaluateComputedFields` writes only a result map (`ComputedEvaluator.ts:29-78`); errors → `null`. Prove that; do not block on a manual rollup screenshot.

Correctness traps to keep in front: security scan **before** emit `=>`; never special-case Call inside SafeEval; `__let` must not be documented; `extractDependencies` stays on the original formula (`ComputedField.ts:390-414`) — a let-bound name that *also* names a column will over-approximate deps (harmless extra invalidate; F10). Bases dialect never hits this pipeline (`ComputedEvaluator.ts:50-54`).

## Optimizations

- Merge T004–T007 into one `LetVariables.ts` implementation with a written scanner contract (below). Drop T006/T010 as standalone work.
- Put `transformLetCalls` **inside** the evaluation try; on transform failure return mapped error immediately (no `allowStatements` retry).
- Move the two `formula.error.let*` keys into the core commit (three locales, next to existing error keys at `i18n.ts:1175` / `2647` / `4165`). Keep FormulaModal FUNCTIONS + `formula.fn.LET.desc` / `LETS.desc` as the separate P2 commit.
- Write pure-transform tests **before** engine wiring (TDD the scanner: cheap, no `moment`).
- Do not wait on 004 to start. 004 is required only for case 17 (`sqrt`) and to avoid rebasing the UPPERCASE alias table. `__let` registration does not touch that table. Case 16 works today with `IF(...)`.
- Keyword denylist for names = SafeEval tokenizer keywords only: `true false null undefined typeof if else return`.
- Match `lets`/`let` with optional whitespace before `(` so `let ("a", 1, a)` still transforms.
- Recurse on all args, not only the body.
- Harness: create `src/__tests__/setup.ts` that assigns a minimal `globalThis.moment` (or `vi.stubGlobal`) sufficient for `parseMoment` / `today`; add `"test": "vitest run"`. Skip `obsidian` mocks until a test actually imports a view.

## Final build plan (ordered)

| # | Step | Module / call site | Effort | Acceptance | Depends on |
|---|------|--------------------|--------|------------|------------|
| 0 | DoR | Read `ComputedField.ts:135-380` (createContext), `:421-506` (eval + security), `SafeEval.ts:1010-1050` | S | Confirm UPPERCASE block still `:310-378`; note whether 004 `sqrt` exists. If 004 not merged, skip matrix 17 only. | — |
| 1 | Harness | Add `src/__tests__/setup.ts` (moment global). Add `"test": "vitest run"` to fork `package.json` scripts. | S | `npx vitest run` exits 0 on an empty suite (or a trivial `expect(true)`). `vitest.config.ts` `setupFiles` path exists. | 0 |
| 2 | Baseline | `npx vitest run` after step 1; record pass count. | S | Baseline captured. No engine edits yet. | 1 |
| 3 | New module | Create `src/data/LetVariables.ts` (EuroFormat: no Obsidian imports). Export `transformLetCalls(formula: string): string` and `registerLetHelper(context)`. Scanner: depth over `(`/`[`/`{`; skip `"…"`, `'…'`, `` `…` `` with `\`; match `\blets\s*\(` before `\blet\s*\(`; require non-ident left boundary and no preceding `.`. Split args at depth-1 commas. Recurse transform on **every** arg. Validate: odd argc ≥ 3 else throw `Error` with stable prefix `let:argCount`; each name a quoted string matching IDENT_RE **and not** `{true,false,null,undefined,typeof,if,else,return}` else `let:name`. Emit right-to-left nested `__let((name) => body, value)`. Pass-through if no bare let/lets. | M | Pure tests (step 4) green. `let("rate", 0.05, amount * rate)` → `__let((rate) => amount * rate, 0.05)`. `lets("a", 1, "b", a + 1, a + b)` → `__let((a) => __let((b) => a + b, a + 1), 1)`. | 1 |
| 4 | Pure tests | `src/data/__tests__/LetVariables.test.ts` | S | Scanner: `let("a", "x,y", a)` one arg split; `"let("` in strings untouched; `obj.let(` untouched; `let ("a",1,a)` matches. Emission nested, not flat. `lets("a",1)` → argCount; `let(5,1,2)`, `let("a b",1,2)`, `let("if",1,2)` → name. `let("let",5,let+1)` allowed. | 3 |
| 5 | Call site 1 | `ComputedField.ts` `evaluateExpressionDetailed` `:428-448`: `import { transformLetCalls } from "./LetVariables"`. After security pass, **inside** the existing try: `transformedExpr = transformLetCalls(normalizedExpr)`; both `safeEval` calls use `transformedExpr`. Catch transform errors **before** statement fallback. | S | Direct user `__let((a) => a, 5)` still blocked by `:504-506`. Malformed let never hits `unexpectedToken` on commas the user did not write. | 3 |
| 6 | Error map + i18n (core) | `formatEvaluationError` `:511-547`: map `let:argCount` → `t("formula.error.letArgCount")`, `let:name` → `t("formula.error.letName")`. Add those two keys in en / zh-CN / zh-TW (`i18n.ts` error cluster ~1175 / ~2647 / ~4165). | S | `lets("a",1)` and `let(5,1,2)` return those keys’ strings, not `formula.error.generic`. | 5 |
| 7 | Call site 2 | `registerLetHelper(context)` from `createContext` immediately after `iferror` (`:294-304`). `__let: (fn, ...vals) => fn(...vals)`. Do **not** edit `:310-378`. Do **not** add `__let` to FormulaModal. | S | `git diff` on `createContext` is a few lines in the lowercase block only. | 3 |
| 8 | Engine tests | `src/data/__tests__/ComputedField.let.test.ts` via `evaluateSingleDetailed`. Corrected matrix: (1) amount=100 → 5; (2)(3) multi-var let/lets → 3; (4) sequential → 3; (5)(6) nested / shadow `"Monkey D. Luffy"` / `"Monkey D. Garp"`; (7) `let("rate",0.05,rate)+rate` → NaN, no throw; (8) `"Hello, Alan!"`; (9) `let("radius",4,round(pi * radius ** 2, 0))` → 50; (10) triangle 12; (11) `[amount]` / `field("amount")` after normalize; (12) `let("round",5,round(3.14))` → `notFunction`; (13)(14) typed errors; (15) `let("a",a,a)` → undefined/NaN, no throw; (16) `IF(amount>50, let("rate",0.1,amount*rate), 0)` amount=100 → 10 (eager both branches); (17) **only if 004 merged** `let("r",4,sqrt(pi * r ** 2))`; (18) `round(3.14, 2)` identical to pre-change. Also: `__let` + `=>` from the user still errors `noArrowFunction`. | M | All in-scope cases green. | 5–7, 1 |
| 9 | Display-only proof | Review `ComputedEvaluator.ts:29-78` + LetVariables exports. | S | No frontmatter/`TFile`/`fs`/network in the let path; errors → `null` in the result map. | 7 |
| 10 | Gates | `npx vitest run`; `npm run build`; `npm run lint`; `git diff --exit-code -- src/data/SafeEval.ts`; `git diff --stat` confined to `LetVariables.ts`, `ComputedField.ts`, `i18n.ts` (error keys), tests, `setup.ts`, `package.json`. | S | SC-001 (in-scope cases), SC-002 0-delta on no-let formulas, SC-003, REQ-004/006/007. | 8 |
| 11 | P2 commit (same PR) | `FormulaModal.ts` `FUNCTIONS` `:60-105` under `formula.catLogic`; names `LET`/`LETS` so `FUNCTION_NAMES` (`:110`) highlights them. Examples use `**` / `pow`, never `^`. i18n `formula.fn.LET.desc` / `LETS.desc` in three locales. No `formula.catVars`. No `__let` help. | S | Help lists LET/LETS; `__let` absent. | 10 |

Rollback: `git checkout` `ComputedField.ts` + `i18n.ts` (error keys) and delete `LetVariables.ts` (and tests/harness if you want a clean tree). `SafeEval.ts` never changes.

## Risks & open decisions

| Item | Recommendation (default) |
|------|--------------------------|
| Phase 004 not merged on `createContext` | **Build 005 anyway.** Park matrix 17. Rebase `__let` after 004 if the lowercase `iferror` block moves. Do not collide with `:310-378`. |
| Unbound / self-ref vs Notion type-error | **No special check.** Ident is non-throwing (`SafeEval.ts:935-936`). Note on parent backlog (T018). |
| Keyword binding names | **Reject as `letName`** (tokenizer keywords only). Do not reuse `RESERVED` (it bans `let`). |
| Lazy `IF`/`IFS` | **Do not fix in 005** (T017). Document eager both-branches on case 16. |
| Harness vs “enabling phase” | **Bootstrap here** (synthesis Q2). 006’s vitest `setupFiles` also needs `setup.ts` to exist. |
| FormulaModal in this PR | **Same PR, second commit.** Error i18n is **not** part of that commit. |
| `let` in value position | **In scope** (recurse all args). Cheap once the scanner is recursive. |
| `extractDependencies` over-approx when a binding name equals a column | **Accept.** Do not retouch `FormulaTokenizer.ts`. |
| CHK-032 live rollup | **Do not block.** Construction + step 9 is enough. |
