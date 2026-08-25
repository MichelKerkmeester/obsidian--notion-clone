# Synthesis: Formula IFS/SWITCH + Math Function Aliases
> One-line: ranked Notion-parity enrichment for this feature, synthesized by Grok 4.6 (xhigh-fast) from the phase's 10 research iterations. Evidence trail: research.md.

## Verdict
Build it. This is the highest-value remaining formula-surface gap: Notion `ifs` plus the missing Excel-style math names, implemented as named wrappers over an engine that already evaluates `IF`, exposes `Math` on the sandbox scope, and already dual-names `POWER`/`POW`. Lock a pure `src/data/FormulaIfsSwitchMath.ts` module (EuroFormat isolated-diff) and spread it into the existing UPPERCASE `createContext` table; do not touch `SafeEval.ts`. The single biggest risk is not the sandbox — it is shipping the wrong `LOG` (JS `Math.log` is ln; Excel/Sheets `LOG` is log10) and/or shipping engine-only so `IFS`/`SQRT` stay invisible in FormulaModal autocomplete and highlighting.

## Ranked backlog
1. **IFS varargs (Notion `ifs`)** — Gap: Notion `ifs(cond, val, …, [else])` is absent; users nest `IF`. Feasibility: **clear**. Files: `src/data/FormulaIfsSwitchMath.ts` (new), `src/data/ComputedField.ts` `Object.assign` at 310–378 beside `IF`. Effort: **S**. Depends on: nothing. Citation: [Notion formula syntax — `ifs`](https://www.notion.com/help/formula-syntax) (`ifs(true, 1, true, 2, 3)` = 1; `ifs(false, 1, false, 2, 3)` = 3).

2. **Math aliases SQRT / LN / LOG10 / EXP / CBRT** — Gap: Notion lists `sqrt`/`ln`/`log10`/`exp`/`cbrt`; the fork has `abs`/`round`/`pow`/`sign` but not these names (raw `Math.*` already works). Feasibility: **clear**. Files: same module + same `Object.assign` region. Effort: **S**. Depends on: can land in the same edit as #1. Citation: `ComputedField.ts:433–437` (`Math` already in eval scope) plus [Notion formula syntax](https://www.notion.com/help/formula-syntax).

3. **LOG as Excel LOG, not `Math.log`** — Gap: Notion has no generic `log(n, base)` (only `log10`/`log2`); a naïve `LOG: Math.log` silently equals `LN` and contradicts spreadsheet dialect. Feasibility: **clear** (one wrapper). Files: same module. Effort: **S**. Depends on: must ship with #2, not after. Citation: `ComputedField.ts:314–315` (`ROUNDUP` already uses `Number(n)`); JS `Math.log` is ln.

4. **SWITCH varargs (Excel/Sheets, not Notion)** — Gap: Notion has no `switch`/`switches`; the spec’s monthly-vs-quarterly scenario is spreadsheet dispatch, not Notion parity. Feasibility: **clear**. Files: same module + same table region. Effort: **S**. Depends on: same varargs/null-default skeleton as #1; land together. Citation: spec Scenario 2; Notion official list has no `switches` ([formula syntax](https://www.notion.com/help/formula-syntax)).

5. **FormulaModal FUNCTIONS + i18n discovery** — Gap: even after #1–4 evaluate, the editor’s own registry drives autocomplete, `NAME(` highlighting, and help; unregistered names render as plain text. Feasibility: **likely** (append-only rows + 3 locale keys). Files: `src/views/modals/FormulaModal.ts:60–105` (`FUNCTIONS`), `:110` / `:1202` (`FUNCTION_NAMES`), `:864–868` (knownNames); `src/i18n.ts` `formula.fn.*` at en ~1115, zh-CN ~2587, zh-TW ~4105. Effort: **S**. Depends on: names frozen from #1–4. Citation: `FormulaModal.ts:60–105, 110, 1202`.

6. **Vitest scaffolding for SC-001** — Gap: `vitest.config.ts` includes `src/**/*.test.ts` and `src/__tests__/setup.ts`, but the fork has **no** plugin `*.test.ts` and no `__tests__` tree — plan.md’s “run the plugin test suite” currently has nothing to run. Feasibility: **likely**. Files: `src/__tests__/setup.ts` (`globalThis.moment` stub), `src/data/__tests__/computed-formulas.test.ts` (import the new module; no `obsidian` types required). Effort: **S**. Depends on: #1–4 implemented. Citation: glob of fork `src/**/*.test.ts` = empty (node_modules only).

7. **Optional LOG2 alias** — Gap: Notion `log2` is the one math name still missing after #2–3; spec freeze lists six aliases, not seven. Feasibility: **clear**. Files: same module + one FormulaModal/i18n row if #5 is in. Effort: **S**. Depends on: #2; **defer unless operator expands freeze**. Citation: [Notion formula syntax](https://www.notion.com/help/formula-syntax) (`log2`).

AppFlowy and Anytype are **not** implementation sources for this feature (negative, load-bearing): AppFlowy `FieldType` has no formula variant (`context/appflowy/frontend/rust-lib/flowy-database2/src/entities/field_entities.rs:427–441`); Anytype `FormulaType` is aggregation-only Count/Percent/MathMin–Range (`context/anytype-ts/src/ts/interface/block/dataview.ts:104–118`). Do not claim competitor precedent in the upstream PR.

## Recommended build (locked design)
**Algorithm (pure, deterministic, no I/O):**

- **IFS(...args)** — Walk `cond,val` pairs; first JS-truthy cond returns its val (same truthiness as existing `IF` at `ComputedField.ts:325`). Odd arity → last arg is default. Even arity and no match → `null`. Fewer than one pair → `null`. Matches Notion blank-default ([Thomas Frank `ifs`](https://thomasjfrank.com/formulas/functions/ifs/); engine already stores `null` on failed eval at `ComputedField.ts:106–108`).
- **SWITCH(expr, ...rest)** — Walk `pat,val` pairs with **strict `===`**. Odd remaining arity → trailing default. No match / no default / no pair → `null`. Case-sensitive by design (the function table has no other silent fuzzy matcher; users can `UPPER()`).
- **Aliases** (always `Number(...)` like `ROUNDUP`): `SQRT → Math.sqrt`, `LN → Math.log`, `LOG10 → Math.log10`, `EXP → Math.exp`, `CBRT → Math.cbrt`, `LOG(n, b?) → b == null ? Math.log10(n) : Math.log(n)/Math.log(b)`. IEEE NaN/±Infinity stand; display already maps non-finite to `-` (`EuroFormat.ts:30–31`).
- **UPPERCASE only.** Do not add lowercase `ifs`/`switch`/`if`: `RESERVED` already contains `"if"` and `"switch"` (`ComputedField.ts:93–98`); the security gate blocks `function`/`=>` in user text (`ComputedField.ts:500–506`). Dual-name precedent is `POWER`/`POW` (`ComputedField.ts:372–373`), not a third registration layer.
- **Eager args, lazy operators — inherit, do not special-case.** `SafeEval` `Call` evaluates every argument before apply (`SafeEval.ts:985–1018`); `Cond`/`&&`/`||`/`??` short-circuit (`SafeEval.ts:950–982`). Existing `IF` is already eager. **Do not edit `SafeEval.ts`** (REQ-002). Bracket refs are rewritten to `field("…")` (`ComputedField.ts:549–555`) which returns `undefined` when absent (`getFieldValue` `ComputedField.ts:587`) — the spec’s `[income]` / `[period]` scenarios therefore do not throw on missing keys. Bare identifiers in a losing branch still throw `ReferenceError` and null the field; document `field("x")` / `IFERROR` / ternary `?:` as the Notion-lazy workaround.
- **No tokenizer / dep-extract change.** `isCall` is `expression[j] === "("` (`FormulaTokenizer.ts:175`); `extractDependencies` skips call identifiers (`ComputedField.ts:411`). `SQRT([x])` adds no false dependency.

**EuroFormat integration (fork contract):** isolate the wrappers in a new pure module, then make 1–3 rebase-safe call-site edits — same shape as `EuroFormat.ts:1–10` (“Kept in one module so it stays a small, rebasable diff”) consumed at `CellRenderer.ts:13` and `SummaryRenderer.ts:7`.

| Piece | Path | Edit |
|---|---|---|
| **Module** | `src/data/FormulaIfsSwitchMath.ts` | Export `formulaIfsSwitchMath` (runtime table) and `formulaIfsSwitchMathHelp` (modal rows). Zero `obsidian` imports. Header: local, rebasable, candidate-upstream bodies. |
| **Call site 1 (P0)** | `src/data/ComputedField.ts:310–378` | `Object.assign(context, { …existing, ...formulaIfsSwitchMath })` — additive keys beside `IF`/`AND`/`OR`. Precedence unchanged: UPPERCASE assign already overrides frontmatter and computed (`ComputedField.ts:139–147, 306–310`). |
| **Call site 2 (P1, lock-in)** | `src/views/modals/FormulaModal.ts:60–105` | Spread/concat `formulaIfsSwitchMathHelp` into `FUNCTIONS` so `FUNCTION_NAMES` (`:110, :1202`) and autocomplete (`:864–868`) see `IFS`/`SWITCH`/`SQRT`/…. |
| **Call site 3 (P1, lock-in)** | `src/i18n.ts` | Append `formula.fn.IFS.desc` … `CBRT.desc` in the three existing locale blocks (en / zh-CN / zh-TW). Append-only. |

Iteration 7 preferred inline-only for upstream PR fit; that finding still applies to the **upstream patch shape** (paste the same function literals into pangy9’s table). For **this fork**, the parent EuroFormat contract plus FormulaModal’s separate registry make the module the locked design: one conflict-friendly file, two import lines, i18n appends. REQ-004’s “one file, one region” remains true for the **engine** half; the shippable feature is the module + those call sites. `git diff <upstream-base> -- src/data/SafeEval.ts` must stay empty. Tokenizer, `ComputedEvaluator`, rollups, and views stay untouched.

## Edge cases & mobile/iCloud safety
**Must handle**

| Case | Contract |
|---|---|
| Empty / &lt;1 pair | `IFS`/`SWITCH` return `null` (blank), not a thrown error — same as failed eval (`ComputedField.ts:106–108`) and Notion unmatched `ifs` without else. |
| Trailing default | `IFS`: odd arg count. `SWITCH`: odd count after `expr`. |
| No match, no default | `null`. Do not `console.warn` (would pollute legitimate empty states). |
| SWITCH matching | Strict `===`; `"Month" !== "month"`. |
| Math domain | `SQRT(-1)` → NaN; `LN(0)` → `-Infinity`; `LOG(n, 1)` or `b≤0` → IEEE NaN/±Infinity. Non-numeric strings → NaN via `Number(...)`. Display: `formatEuroNumber` prints `-` when `!Number.isFinite` (`EuroFormat.ts:30–31`). |
| Eager losing branch | Bracket/`field()` miss → `undefined`, no throw. Bare missing ident → field `null` + warn. `IFERROR` already treats null/undefined/non-finite (`ComputedField.ts:294–304`). Nested `?:` remains the lazy escape hatch. |
| Pre-ship unknown name | `IFS(...)` → TypeError “IFS is not a function” → `formula.error.notFunction` (`ComputedField.ts:527–530`). Additive change. |
| Name collision | A frontmatter key `SQRT` is already overridden by UPPERCASE builtins, same as `IF`/`ABS` today. Lowercase field `switch` is filtered by `RESERVED` and does not collide with `SWITCH(`. |
| Dependencies / rename | Call tokens are not field refs; column rename will not rewrite `IFS(` / `SQRT(`. |
| Determinism | No clock/random in these wrappers (`rand`/`TODAY` stay separate). NFR-R01 holds. |

**Mobile + iCloud.** Wrappers are pure compute: no `Platform`, no `obsidian` APIs, no network, no telemetry, no frontmatter writes (NFR-S01 / NFR-R02 / REQ-006). The same `createContext` path runs on desktop and mobile builds. Rollups stay `count\|sum\|avg\|list` and **display-only** (spec out of scope). Evaluation is read-only over already-loaded field data; iCloud sees no extra file churn from these functions. Per-`createContext` cost is a handful of extra closures next to the existing 60+ table entries (NFR-P01).

## Open questions / operator decisions
1. **`LOG` vs REQ-003** — Spec text says aliases equal their `Math.*` counterpart; that would make `LOG === LN`. **Default: Excel/Sheets `LOG(n)` = log10, optional second base; treat REQ-003’s counterpart for unary `LOG` as `Math.log10`.** Record this as a spec amendment in the implementation summary. Do not ship `LOG: Math.log`.

2. **Discovery scope vs REQ-004** — Spec Files-to-Change lists only `ComputedField.ts`. Without FormulaModal + i18n the functions evaluate but are unstyled, unlisted, and omitted from autocomplete. **Default: include call sites 2 and 3 (complete P1). Do not defer.** If deferred, write an explicit user-approved P1 deferral.

3. **SWITCH case folding** — Excel SWITCH is often treated case-insensitively; this engine is `===`. **Default: strict `===`.** Document `UPPER([period])` in the help example: `=SWITCH([period], "month", [amount], "quarter", [amount]*3, 0)` (`FormulaModal` example from iter 10).

4. **`LOG2`** — Completes Notion’s log set. **Default: defer** (outside the six-name freeze). One extra table row if the operator expands scope.

5. **Upstream PR shape** — Fork keeps the EuroFormat module. **Default: candidate PR (REQ-005) inlines the same function literals into upstream’s UPPERCASE block** (where they will accept it), and states honestly: Notion `ifs` + Excel math aliases; `LOG` base-10; eager branches vs Notion lazy `ifs`; blank/`null` on no match; no AppFlowy/Anytype formula precedent. MIT / pangy9.

6. **Unmatched-dispatch errors vs blank** — Throwing a localized error would contradict Notion and spam `console.warn`. **Default: return `null`.**
