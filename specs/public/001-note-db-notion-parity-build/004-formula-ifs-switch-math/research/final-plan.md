# Final Plan: Formula IFS/SWITCH + Math Function Aliases
> Reviewed & optimized build plan, from a fresh Grok 4.6 (xhigh-fast) review of this phase's rewritten spec/plan/tasks/checklist plus its synthesis and research.

## Review — strengths, gaps, risks

**Solid.** Highest-value remaining formula-surface gap, correctly scoped as named wrappers over an engine that already evaluates `IF` (`ComputedField.ts:325`), exposes `Math` on eval scope (`:433-437`), and dual-names `POWER`/`POW` (`:372-373`). `SafeEval.ts` stays a security boundary: Call args are eager (`:985-1018`); Cond/`&&`/`||`/`??` already short-circuit (`:949-982`). Uppercase-only is mandatory: `RESERVED` includes `"if"` and `"switch"` (`ComputedField.ts:93-98`); the gate blocks `function`/`=>` (`:500-506`). LOG trap is correctly locked: JS `Math.log` is ln; Excel/Sheets `LOG(n)` is log10 (synthesis Q1; Notion has `log10`/`log2` but no generic `log` — research iter 4). Discovery is correctly P1 lock-in: FormulaModal reads its own `FUNCTIONS` registry (`FormulaModal.ts:60-105`), `FUNCTION_NAMES` (`:110, :1202`), autocomplete (`:864-868`); engine-only shipping leaves `IFS(` unhighlighted. Vitest gap is real: `vitest.config.ts` includes `src/**/*.test.ts` and **requires** `src/__tests__/setup.ts`, but `src/**/*.test.ts` is empty and `package.json` has **no test script**. AppFlowy/Anytype are correctly excluded as formula precedents (research F5.1, F6.1).

**Stale sibling doc.** `implementation-summary.md` still says “single-region, single-file edit” / ~3 h. The rewritten spec/plan/tasks already lock the EuroFormat module + three call sites (~5 h). Follow the rewritten set.

**Iter 7 vs locked design.** Research iter 7 preferred inline rows in `ComputedField.ts` for upstream PR fit (F7.1). Synthesis then locked the **fork** on `FormulaIfsSwitchMath.ts` and reserved inlining for the candidate upstream PR. That split is right: this fork already isolates EuroFormat (`EuroFormat.ts:1-10`); FormulaModal is a separate registry anyway. Do not flatten back to ComputedField-only — that reopens REQ-008.

**Gaps / wrong sequence.** T004–T007 are four tasks for one file; they should be one write. T010’s “`IFS.desc` … `CBRT.desc`” can drop `LOG`/`SWITCH` — the help table needs **eight** keys: `IFS`, `SWITCH`, `SQRT`, `LN`, `LOG`, `LOG10`, `EXP`, `CBRT` × en/`zh-CN`/`zh-TW` (`i18n.ts:1115,2587,4105`). `FUNCTIONS` is a `const` initialized once; `FUNCTION_NAMES` is built at load (`FormulaModal.ts:110`). Help rows must be concatenated **at array init**, not pushed later. `LOG(n, b?)` must test `b == null` **before** `Number(b)` — `Number(null)===0` would take the two-arg path and yield ±Infinity. Predecessor 003 is **not** a hard dependency (spec risk table already says wave-order only); 003 is vault YAML, 004 is fork TS — no shared files. Effort: module+spread is S; 24 i18n strings is the long pole; first-ever vitest setup is S only if tests import the **module**, not `ComputedFieldEngine` (which needs `moment` + `t()`).

**Under-weighted edges.** IFS uses JS truthiness like `IF` (`ComputedField.ts:325`) — `IFS(0, "a", 1, "b")` returns `"b"`; tax-bracket comparisons are booleans so this is fine, but help text must not claim Notion-boolean-only. Unmatched dispatch returns `null` with **no** `console.warn` (synthesis table) — distinct from failed eval’s warn+null (`ComputedField.ts:106-108`). Display of NaN/±Infinity is already `"-"` (`EuroFormat.ts:30-31`). Tokenizer needs no edit: `isCall` is `expression[j] === "("` (`FormulaTokenizer.ts:175`); `extractDependencies` skips call identifiers (`ComputedField.ts:411`).

## Optimizations

1. **One module write** covering IFS, SWITCH, five 1:1 aliases, and Excel `LOG` together. Never land aliases without `LOG`.
2. **Keep the EuroFormat shape:** new `src/data/FormulaIfsSwitchMath.ts` (zero `obsidian` imports) + three additive call sites. Upstream PR (T015) inlines the same function literals into pangy9’s UPPERCASE block — do not import the fork module upstream.
3. **Concat help rows at `FUNCTIONS` declaration** so `:110` and `:864-868` see them. Import the help export; do not duplicate names.
4. **Test the module, not the engine**, in vitest. `setup.ts` still must exist because `vitest.config.ts` lists it. Run `npx vitest run` (no `npm test`). Optional later: one engine smoke via `evaluateSingleDetailed` if you want the spread proven in-process — not required if a scratch-vault eval covers T014.
5. **Ungate from 003.** Start 004 whenever the fork is free. Wave order is documentation, not a compiler.
6. **LOG2 stays `[B]`** (T016). One extra row if the operator expands the freeze.
7. **Do not touch `SafeEval.ts`** to get Notion-lazy `ifs`. Document `field("x")` / `IFERROR` / `?:` in IFS/SWITCH help examples.

## Final build plan (ordered)

| Step | Module / call site | Effort | Acceptance | Depends on |
|------|-------------------|--------|------------|------------|
| 1. Re-read freeze | `research/synthesis.md` ranked backlog + LOG/discovery defaults. Read `ComputedField.ts:93-98,310-378,433-437` and the SafeEval Call/Binary gate (`SafeEval.ts:949-1018`). Record upstream base (`v1.2.8` / `2c96359` per research iter 7). | S | Six aliases + Excel LOG + uppercase-only + empty SafeEval diff are unchanged. | — |
| 2. Create `FormulaIfsSwitchMath.ts` | **New** `<fork>/src/data/FormulaIfsSwitchMath.ts`. Header: local, rebasable, candidate-upstream bodies (same sentence pattern as `EuroFormat.ts:9`). Export `formulaIfsSwitchMath` and `formulaIfsSwitchMathHelp`. **IFS:** walk `cond,val`; first JS-truthy cond wins (`ComputedField.ts:325`); odd arity → trailing default; `<1` pair or no match → `null`. **SWITCH:** `expr` then `pat,val` with `===`; odd rest → default; no match → `null`. **Aliases** with `Number(...)` like `ROUNDUP` (`:314-315`): `SQRT→Math.sqrt`, `LN→Math.log`, `LOG10→Math.log10`, `EXP→Math.exp`, `CBRT→Math.cbrt`, `LOG:(n,b?) => (b==null ? Math.log10(Number(n)) : Math.log(Number(n))/Math.log(Number(b)))`. No `LOG: Math.log`. No lowercase `ifs`/`switch`. Help rows: Logic for IFS/SWITCH, Math for the six aliases; examples `=IFS([income]<=69715, 0.14, [income]<=150000, 0.30, 0.36)` and `=SWITCH(UPPER([period]), "MONTH", [amount], "QUARTER", [amount]*3, 0)` (iter 10 + strict `===`). | S | File exists; zero `obsidian` imports; LOG unary ≠ LN. | Step 1 |
| 3. Call site 1 (P0) | `ComputedField.ts`: add import next to `:1-8`; spread `...formulaIfsSwitchMath` **inside** the existing `Object.assign` at `:310-378` (beside `IF`/`AND`/`OR`). Do not add a second assign. Precedence unchanged (`:139-147,306-310`). | S | `IFS`/`SQRT`/`LOG` resolve from `createContext`. | Step 2 |
| 4. Call site 2 (P1) | `FormulaModal.ts:60-105`: `const FUNCTIONS = [ …existing, ...formulaIfsSwitchMathHelp ]`. Confirm `:110`, `:864-868`, `:1202` pick up names with no extra edits. | S | Autocomplete lists IFS/SWITCH/SQRT/LN/LOG/LOG10/EXP/CBRT; `NAME(` highlights as function. | Step 2 |
| 5. Call site 3 (P1) | `i18n.ts` append-only: eight `formula.fn.<NAME>.desc` keys in en (~1115), zh-CN (~2587), zh-TW (~4105). Match existing sentence style. Include **LOG** (“log10, optional base”) not a copy of LN. | S | All three locales have all eight keys. | Step 4 (names frozen) |
| 6. SafeEval freeze | `git diff <upstream-base> -- src/data/SafeEval.ts` after steps 2–5. Also confirm tokenizer, `ComputedEvaluator.ts`, `RelationRollup.ts`, views (other than FormulaModal) untouched. | S | Empty SafeEval diff. | Steps 2–5 |
| 7. Vitest scaffold | **New** `src/__tests__/setup.ts`: minimal `globalThis.moment` stub (`vitest.config.ts:6-7`). **New** `src/data/__tests__/computed-formulas.test.ts` importing only the new module. Cases: `SQRT(9)===3`; `LN(Math.E)≈1`; `LOG(100)===2` (not `Math.log(100)`); `LOG(8,2)===3`; `LOG10`/`EXP`/`CBRT` vs `Math.*`; IFS three-bracket boundaries; SWITCH `"Month"!=="month"`; empty/`<1` pair/`no match` → `null`; trailing defaults; `SQRT(-1)` NaN; `LN(0)` `-Infinity`; `LOG(n,1)` non-finite. No `console.warn` from wrappers. | S | `npx vitest run` exits 0. | Step 2 (can parallel 3–5) |
| 8. Scratch-vault spot-check | One tax-bracket IFS and one period SWITCH on a throwaway computed column. Domain alias `SQRT(-1)` displays `"-"`. | S | Correct branch; unmatched → dash/blank field, not a persisted error; `IFS` no longer yields `formula.error.notFunction` (`ComputedField.ts:527-530`). | Steps 3–5 |
| 9. Lint + additive regression | `npm run lint` (ignores `src/__tests__/**`). Pre-existing formulas still evaluate. | S | Lint 0 on new module + three call sites. | Steps 3–5 |
| 10. Candidate upstream PR notes | REQ-005: inline the **same literals** into upstream UPPERCASE table; state Notion `ifs` + Excel math aliases; base-10 `LOG`; eager args vs Notion lazy `ifs`; `null` on no match; **no** AppFlowy/Anytype formula precedent; MIT/pangy9. | S | Written in implementation-summary / PR draft. Not opened unless asked. | Steps 2–8 |

T016 `LOG2` remains `[B]`.

## Risks & open decisions

| Item | Recommended default |
|------|---------------------|
| `LOG` vs REQ-003 “equal to Math.*” | **Unary LOG = `Math.log10`**, optional base via change-of-base. Record as spec amendment. Never `LOG: Math.log`. |
| FormulaModal + i18n vs “engine-only” | **Ship call sites 2 and 3.** Deferral needs explicit operator approval (REQ-008). |
| SWITCH case folding | **Strict `===`.** Help example uses `UPPER([period])`. |
| `LOG2` | **Defer** (outside six-name freeze). |
| Unmatched IFS/SWITCH | **Return `null`**, no `console.warn`. |
| Eager losing branches vs Notion lazy `ifs` | **Inherit** (`SafeEval.ts:985-1018`). Do not edit the sandbox. Prefer `[field]`/`field("x")` in branches. |
| Fork module vs upstream PR | **Module here; inline literals upstream.** |
| Wait for phase 003 | **No.** Independent surface. |
| Lowercase `ifs`/`switch` | **No.** `RESERVED` + keyword gate. |
| Comment hygiene | Durable WHY only (rebasable isolated module). No packet/REQ ids in source. |
