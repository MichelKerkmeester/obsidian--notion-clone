# Synthesis: Formula LET/LETS Variables
> One-line: ranked Notion-parity enrichment for this feature, synthesized by Grok 4.6 (xhigh-fast) from the phase's 10 research iterations. Evidence trail: research.md.

## Verdict

Build it. Notion `let`/`lets` is a real per-row binding gap the fork can close without touching `SafeEval.ts`, and AppFlowy/Anytype contribute nothing (they only have hardcoded column aggregates, not an expression engine). Do **not** implement the spec/plan sketch of `context.let = (name, value, expr) => evaluate(expr, child)`: SafeEval evaluates every Call argument in the caller scope before the function runs (`SafeEval.ts:1010-1017`), so `let("rate", 0.05, amount * rate)` fails on unbound `rate` before `let` exists. Lock the nested `__let` transform in a new EuroFormat-style module `src/data/LetVariables.ts` plus two rebase-safe edits in `ComputedField.ts`. The single biggest risk is verification, not the design: the fork has vitest configured but **zero** `*.test.ts` files and no `test` script, so SC-002's 0-delta regression gate is unprovable unless phase 005 bootstraps the harness.

## Ranked backlog

1. **Nested `__let` transform (core LET/LETS)** — Notion evaluates the body in a child binding context (`let(person, "Alan", "Hello, " + person + "!")` = `"Hello, Alan!"`); the fork has no binding construct, and a plain context function cannot defer the body. Feasibility: **clear**. Files: new `src/data/LetVariables.ts` (`transformLetCalls`); `src/data/ComputedField.ts` (`evaluateExpressionDetailed` after `validateFormulaSecurity`, both `safeEval` calls). Effort: **M**. Depends on: nothing in this phase except REQ-004 (do not touch `SafeEval.ts`); phase 004 is needed only for IF/SWITCH/MATH composition tests, not for the transform itself. Citation: `SafeEval.ts:1010-1017` (eager args) + `SafeEval.ts:1043-1050` (Arrow `Object.create` child scope).

2. **Sequential left-to-right multi-var binding** — Notion `lets`/`let` evaluates each value in a context that already holds earlier names in the **same** call (`lets("a", 1, "b", a + 1, a + b)` → 3). A flat `__let((a, b) => a + b, 1, a + 1)` eager-evals `a + 1` in the caller scope and is wrong. Feasibility: **clear**. Files: `src/data/LetVariables.ts` (emit nested `__let`, fold pairs right-to-left). Effort: **S** (same scanner as #1; this is the emission rule, not extra surface). Depends on: #1. Citation: notion-vm `runLets` sequential push-then-eval (`https://raw.githubusercontent.com/fluffyox/notion-vm/main/src/engine.js`, `runLets` ~435-444).

3. **Treat `let` and `lets` as one transform** — Since April 2025 Notion `let()` accepts multiple pairs and is identical to `lets()`; official docs still list two rows. Feasibility: **clear**. Files: `src/data/LetVariables.ts` (match `lets(` before `let(` to avoid prefix collision). Effort: **S**. Depends on: #1. Citation: `https://thomasjfrank.com/formulas/functions/let/` (April 2025 identity).

4. **Transform-side arg-count and name errors** — Notion rejects malformed `let` at compile time; if the fork emits `__let((a) => , 1)` or `__let((5) => 2, 1)`, SafeEval throws `SyntaxError` mapped to `formula.error.unexpectedToken` pointing at commas/tokens the user never wrote (`ComputedField.ts:520-523`). Feasibility: **clear**. Files: `src/data/LetVariables.ts` (odd count ≥ 3; name args must be quoted strings matching `[A-Za-z_$][A-Za-z0-9_$]*`); `src/data/ComputedField.ts` (`formatEvaluationError` / catch around `transformLetCalls`). Effort: **S**. Depends on: #1. Citation: REQ-005 + `SafeEval.ts:826-828` (`expect(TT.Ident)` on arrow params).

5. **Vitest harness + 18-case matrix** — Spec/plan assume “the fork’s formula test suite”; it does not exist (`vitest.config.ts` includes `src/**/*.test.ts`, `setupFiles: src/__tests__/setup.ts`, but zero tests, no `src/__tests__/`, no `package.json` `test` script). Without this, SC-001/SC-002/REQ-006 cannot be evidenced. Feasibility: **likely**. Files: `src/__tests__/setup.ts` (new); `package.json` (`"test": "vitest run"`); `src/data/__tests__/LetVariables.test.ts`; `src/data/__tests__/ComputedField.let.test.ts`. Effort: **M**. Depends on: operator decision to expand REQ-007; can land in parallel with #1. Citation: fork `vitest.config.ts` + `package.json` scripts (`dev`/`build`/`lint` only).

6. **FormulaModal help + 3-locale i18n (P2 discoverability)** — Notion surfaces `let`/`lets` in formula docs/UI; fork `FUNCTIONS` (`FormulaModal.ts:60-105`) has no LET/LETS, so `FUNCTION_NAMES` will not highlight them and the help panel will not list them. Feasibility: **clear**. Files: `src/views/modals/FormulaModal.ts` (`FUNCTIONS`, category `formula.catLogic`); `src/i18n.ts` (en / zh-CN / zh-TW: `formula.fn.LET.desc`, `formula.fn.LETS.desc`, `formula.error.letArgCount`, `formula.error.letName`). Effort: **S**. Depends on: #1 working; operator approval to touch files outside REQ-007. Citation: `FormulaModal.ts:60-110`.

7. **Lazy `if`/`ifs` (parent backlog, not phase 005)** — Notion compiles `if` to `jumpIfTruthy` and evaluates only the taken branch; fork `IF: (cond, t, f) => cond ? t : f` (`ComputedField.ts:325`) receives already-eager args, so a `let` in the unused branch still runs. Feasibility: **hard** (engine-wide; fixing it inside SafeEval is **blocked** by REQ-004). Files: none in 005. Effort: **L** later. Depends on: a future lazy-arg phase. Citation: notion-vm `compileIf` ~288-302 + `SafeEval.ts:1010-1017`.

8. **Unbound identifiers / static typing (parent backlog, not phase 005)** — Notion Formula 2.0 type-errors `let(a, a, a)` when `a` is not a property; fork `Ident` returns `scope[name]` with no throw (`SafeEval.ts:935-936`), so the transform yields `undefined`/`NaN`. Feasibility: **hard** (engine-wide). Files: none in 005. Effort: **L** later. Depends on: a typing/strict-ident phase. Citation: `SafeEval.ts:935-936` vs Notion help `https://www.notion.com/help/formula-syntax`.

## Recommended build (locked design)

**Do not ship:** (a) the spec/plan `createContext` function that re-evaluates a pre-computed `expr` (`DE1`); (b) string-body Approach A `let("rate", 0.05, "amount * rate")` — inner `let` closes over the fixed `context`, not SafeEval’s live caller scope, so nested `let` loses outer bindings (`SafeEval.ts:1002-1018`, `DE6`); (c) naive IIFE `((rate) => body)(value)` — `parseArrowFunction` consumes the outer `(` and then `expect(TT.Ident)` hits the inner `(` (`SafeEval.ts:824-838`, `DE7`); (d) a Call special-case inside SafeEval (`DE3`, REQ-004); (e) a single flat `__let((a, b) => expr, v1, v2)` (`DE14`).

**Core algorithm.** User syntax stays Notion-natural (quoted names, live expression, not a string):

- `let("rate", 0.05, amount * rate)` → `__let((rate) => amount * rate, 0.05)`
- `lets("a", 1, "b", a + 1, a + b)` → `__let((a) => __let((b) => a + b, a + 1), 1)`
- nested `let("firstName", "Monkey", let("lastName", "Luffy", firstName + " D. " + lastName))` → innermost-first nested `__let`, which is how Arrow closures + `Object.create(scope)` reproduce Notion access and shadowing (`https://thomasjfrank.com/formulas/functions/let/`).

`__let` is a trusted context helper: `(fn, ...vals) => fn(...vals)`. SafeEval’s Arrow node builds `childScope = Object.create(scope)` and binds params (`SafeEval.ts:1043-1050`). Values of an inner `__let` are eager-eval’d in the **outer** arrow’s scope, which is the sandbox analogue of notion-vm `runLets` (compile body as deferred code; eval values then body in a child binding stack). This is homologous to Notion’s real engine, not a hack (`notion-vm` `compileLet` ~304-311 + `runLets` ~435-444).

**Scanner (the only non-trivial cost, ~35–45 lines, regex is insufficient).** Walk the formula tracking `(`/`[`/`{` depth; skip `"…"`, `'…'`, `` `…` `` (honor `\`); match `lets(` before `let(`; require a non-identifier boundary and **not** a preceding `.` (`obj.let(` is a method, not LET). Split args only at depth-1 commas. Recurse on the body first. Validate: odd argc ≥ 3; each name is a quoted `IDENT_RE`. Throw typed `Error("let: …")` for mapping to `formula.error.letArgCount` / `formula.error.letName`. Pass through unchanged when no bare `let(`/`lets(` is present (NFR-P01 by construction).

**Pipeline order (locked):** `normalizeFormula` (`[amount]` → `field("amount")`, `ComputedField.ts:549-555`) → `validateFormulaSecurity` on the **user** string (blocks `=>` at `ComputedField.ts:504-506`) → `transformLetCalls` (trusted; may emit `=>`) → `safeEval(transformedExpr, scope)` **and** the `allowStatements: true` fallback. Precedent: `normalizeFormula` is already a trusted rewrite between security and eval. The arrow body is verbatim already-scanned user text.

**EuroFormat integration.** `EuroFormat.ts` is a zero-coupling module (`src/data/EuroFormat.ts:1-42`) imported at a few call sites (`CellRenderer.ts`, `SummaryRenderer.ts`). Mirror that:

| Piece | Path | Role |
|-------|------|------|
| **New module** | `src/data/LetVariables.ts` | Pure `transformLetCalls(formula: string): string`; optionally `registerLetHelper(context)` so `__let` does not sit in the dense function table |
| **Call site 1** | `ComputedField.ts` `evaluateExpressionDetailed` (~428-448) | `import { transformLetCalls } from "./LetVariables"`; after the security check, `transformedExpr = transformLetCalls(normalizedExpr)`; both `safeEval` calls use `transformedExpr`; wrap transform throws in the existing try/catch |
| **Call site 2** | `ComputedField.ts` `createContext` lowercase region near `iferror` (~294-304) | Register `__let: (fn, ...vals) => fn(...vals)` (or `registerLetHelper(context)`). Do **not** put `__let` in `FormulaModal` `FUNCTIONS`. Place here to avoid phase-004 UPPERCASE-alias churn (~310-378) |
| **Call site 3 (P2, operator)** | `src/views/modals/FormulaModal.ts` `FUNCTIONS` (~60-105) | LET/LETS help entries under `formula.catLogic`; examples must use fork `**`/`pow`, not Notion `^` (`SafeEval.ts` `TT.Pow` is `**`, line 32) |

`extractDependencies` stays on the original formula (`ComputedField.ts:390-414`); let-bound names are not columns, so they are not dependencies. Bases dialect is untouched: `ComputedEvaluator.ts:50-54` routes `expressionSyntax === "base"` to `BaseExpression.ts` and never hits this pipeline.

## Edge cases & mobile/iCloud safety

Handle these in tests (matrix cases 1–18 in iteration 010):

| Case | Required behavior | Why |
|------|-------------------|-----|
| Self-ref `let("a", a, a)` with no field `a` | Value resolved in **caller** scope → `undefined`/`NaN`, no throw | Transform `__let((a) => a, a)`; Ident is non-throwing (`SafeEval.ts:935-936`). Notion would type-error; keep engine-uniform (no special unbound check) |
| Built-in collision `let("round", 5, round(3.14))` | Child shadows `round`; `5(3.14)` → `formula.error.notFunction` | Arrow own-prop shadows prototype (`SafeEval.ts:1043-1050`, `ComputedField.ts:527-531`) |
| `lets("a", 1)` / even argc | `formula.error.letArgCount`, not a transformed `unexpectedToken` | REQ-005 |
| `let(5, 1, 2)` / `let("a b", …)` / empty name | `formula.error.letName` | Arrow param must be `Ident` (`SafeEval.ts:826-828`) |
| Nested access + inner shadow | `"Monkey D. Luffy"` / `"Monkey D. Garp"` | Prototype chain vs child own-prop |
| Sequential `lets("a", 1, "b", a + 1, a + b)` | `3` | Nested `__let` only |
| `let("a", "x,y", a)` / `"let("` inside strings / `obj.let(` | No false rewrite | Scanner rules |
| `let("let", 5, let + 1)` | `6` (confusing but valid; `let` is Ident, not a keyword — `SafeEval.ts:258-269`) | No extra ban |
| Direct user `__let((a) => a, 5)` | Blocked by `=>` security check | `__let` stays internal |
| `[amount]` / `field("amount")` inside body | Works | `normalizeFormula` runs first |
| `if(amount>50, let(...), 0)` | Correct result; **both** branches evaluate | Pre-existing eager `IF`, not a let defect |
| Deep nesting | One fresh `Object.create` per Arrow; no shared mutable state | Concurrent renders are isolated |
| Formulas with no `let(`/`lets(` | Byte-identical path | Transform is a no-op (`F67`) |

**Mobile + iCloud.** Spec §3 and Scenario 4: let/lets are evaluation-only. `evaluateComputedFields` writes a `result` map (`ComputedEvaluator.ts:29-78`); errors → `null`; success → display values. No frontmatter write, no vault/`TFile` mutation, no `fs`/DOM/network/timers. `__let` and `transformLetCalls` are pure. NFR-M01 (no desktop-only APIs) and NFR-S02 (no telemetry/secrets) hold. Rollups that consume a let-using computed field remain display-only. Rollback is `git checkout` of `ComputedField.ts` + delete `LetVariables.ts`; `SafeEval.ts` never changes (`git diff --exit-code -- src/data/SafeEval.ts`).

## Open questions / operator decisions

1. **REQ-007 vs EuroFormat module.** Spec says “diff confined to `ComputedField.ts` plus tests”; the locked design needs `LetVariables.ts` because the scanner must not live inside `createContext`. **Default: relax REQ-007 to `ComputedField.ts` + `LetVariables.ts` + tests**, matching the plan’s EuroFormat isolated-diff model and SC-004’s “minimal rebase-friendly edits.” Inlining the scanner in `ComputedField.ts` is the worse rebase.

2. **Bootstrap the missing vitest harness in phase 005?** SC-002 is otherwise unprovable. **Default: yes** — add `src/__tests__/setup.ts` and a `test` script, then the 18-case matrix (`LetVariables.test.ts` pure transform + `ComputedField.let.test.ts` engine). Deferring leaves DoD blocked.

3. **FormulaModal + i18n in this PR?** Without help entries the feature works but is undiscoverable for Notion migrants. **Default: same PR, separate commit** (core module+call sites first; P2 `FormulaModal.ts`/`i18n.ts` second). Do not add a `formula.catVars` category. Do not document `__let`. Examples use `**`/`pow`, not `^`.

4. **Self-reference / unbound names.** Notion errors; fork returns `undefined`/`NaN`. **Default: no special `letUnbound` check** — stay consistent with existing Ident semantics; note the divergence on the parent parity backlog.

5. **`__let` registration shape.** **Default: `registerLetHelper(context)` exported from `LetVariables.ts`**, called from `createContext` near `iferror`, to keep the helper line out of phase-004’s function-table churn. Inline `__let:` in that same region is acceptable if you want one fewer export.

6. **Phase 004 ordering.** **Default: 004 merges first** on `createContext`, then 005 adds `__let` + the `evaluateExpressionDetailed` hook (004 does not touch that function). Composition tests (matrix 16–17: `if`+`let`, `sqrt`/`pi` in a let body) wait on 004; the transform itself does not.

7. **Out of scope (do not decide inside 005).** Lazy `if`/`ifs`; static typing; Notion method-chaining on bound values (`.dateAdd()`, `.last()`); Bases dialect `BaseExpression.ts`; any `SafeEval.ts` edit.
