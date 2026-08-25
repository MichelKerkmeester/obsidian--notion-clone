# Deep Research: Formula IFS/SWITCH + Math Function Aliases

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `lineages/ox-alpha-cline`. Stop reason: max_iterations. Average newInfoRatio: n/a.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 001 — Fork engine contract: createContext layers & insertion region

**Status:** complete · **Focus:** Q1 · **newInfoRatio:** 1.0 (fully-new: first grounded read of the live fork engine)

## Evidence Gathered

1. `createContext` spans two casing layers inside one method — lowercase built-ins first, then an UPPERCASE Excel-style alias block.
   - [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ComputedField.ts:135-308] lowercase layer (`round`, `floor`, `abs`, `max`, `min`, `sum`, `avg`, date/text helpers, `iferror`).
   - [SOURCE: ComputedField.ts:310-378] `Object.assign(context, { TODAY, NOW, ROUND, ..., IF: (cond,t,f)=>cond?t:f, AND, OR, NOT, ... COUNTIF })` — the UPPERCASE block unconditionally overrides everything already in context.

2. Precedence chain (who wins over user fields):
   - Frontmatter is spread first with RESERVED keys filtered ([ComputedField.ts:141-147]).
   - Built-ins assigned next override frontmatter.
   - `computed` values fill only keys that are still `undefined` ([ComputedField.ts:306-309]).
   - The UPPERCASE `Object.assign` overrides all of the above ([ComputedField.ts:310]).
   ⇒ Adding IFS/SWITCH/SQRT/... to the UPPERCASE block makes them win even if a vault has a frontmatter property literally named `SQRT`, exactly matching how `IF`/`ABS` behave today. No new precedence rule is created.

3. `RESERVED` includes lowercase `"switch"` ([ComputedField.ts:100-107]) — a *frontmatter field* named `switch` is filtered from variable scope, but this does not collide with an uppercase `SWITCH(...)` function entry. Verified: RESERVED filters only the frontmatter spread at line ~143.

4. Evaluation scope already exposes `Math`, `Number`, `String`, etc. to every formula ([ComputedField.ts:420-427] — `const scope = { Math, Number, String, Boolean, Array, Object, JSON, Date, ...context }`). This confirms the spec's claim that math aliases are named sugar over existing capability; no evaluation machinery changes.

5. Error/fallback convention for failed evaluation: `evaluate()` logs `console.warn` and stores `null` for the field ([ComputedField.ts:87-92]); `formatEvaluationError` maps `TypeError "... is not a function"` to a localized unknown-function message via `t("formula.error.notFunction", { name })` ([ComputedField.ts:~500s]). Before phase 004 lands, `IFS(...)` therefore produces a clean localized "IFS is not a function" error — the change is purely additive (spec edge-case §8 satisfied by construction).

## Findings

- F1.1 (high): Insertion point is the existing UPPERCASE `Object.assign` region (ComputedField.ts:310-378), directly beside `IF`/`AND`/`OR`. This keeps REQ-004's "one file, one region" literally true and mirrors the established alias pattern (`POWER`/`POW` show dual-name entries are already normal).
- F1.2 (medium): Lowercase aliases should NOT be added for IFS/SWITCH (unlike `adddays`/`dateadd` precedent) because `if`/`switch` are JS keywords blocked by the security gate and by RESERVED; uppercase-only matches Notion's own `ifs` being keyword-safe while keeping the diff minimal.
- F1.3 (low): `evaluateExpressionDetailed` retries the expression in statement mode on failure ([ComputedField.ts:430-442]) — wrappers must not depend on statement-mode behavior; they are plain functions callable from expression mode.

## Ruled Out
- Adding a third registration layer or a new registry abstraction — rejected: two layers already exist and upstream PR mergeability favors following the local convention.

## Next Focus
Iteration 2 — SafeEval evaluation semantics: eager call arguments vs lazy ternary, and what that means for branch semantics.

---

# Iteration 002 — Sandbox semantics: eager args, lazy operators, gate interplay

**Status:** complete · **Focus:** Q2 · **newInfoRatio:** 0.9

## Evidence Gathered

1. **Function-call arguments are evaluated eagerly** before the callee runs:
   [SOURCE: src/data/SafeEval.ts:985-1018] `case "Call":` builds `const args: unknown[] = []; for (const a of node.args) { args.push(evalNode(a, scope)); }` then applies the callee. There is no thunk/lazy-arg mechanism.

2. **Ternary IS lazy:** `case "Cond": return test ? evalNode(cons) : evalNode(alt)` [SOURCE: SafeEval.ts, case "Cond"; parsed at parseTernary lines ~542-551]. `&&`/`||`/`??` also short-circuit [SOURCE: SafeEval.ts:947-951].

3. Consequence for the feature: as plain JS functions, `IFS`/`SWITCH` will evaluate **every condition and every value argument**, including branches that lose. The existing `IF` wrapper ([ComputedField.ts:~322], `(cond,t,f)=>cond?t:f`) has identical eager behavior — so IFS/SWITCH extend an existing engine-wide trait rather than introducing a new hazard class.

4. Concrete failure mode: `IFS([status] === "a", [priceA], [status] === "b", [priceB])` where note B lacks `priceB`: the bare identifier throws ReferenceError ("priceB is not defined") during arg evaluation **even when status==="a"** → whole field becomes null + console.warn. Mitigations already in-engine:
   - `field("priceB")` / `[priceB]` bracket-ref path returns `undefined` instead of throwing ([ComputedField.ts:getFieldValue, ~line 640s]: returns undefined when key absent).
   - `IFERROR(value, fallback)` catches null/undefined/non-finite ([ComputedField.ts:296-307]).
   - Users can fall back to nested lazy ternaries (`?:`) which SafeEval short-circuits.

5. Gate interplay: wrappers add no tokens the gate cares about. `validateFormulaSecurity` blocks `while/for/do/new/function/=>/eval/constructor/...` ([ComputedField.ts:452-510]); none of the new names or their bodies introduce such tokens into *user expressions*, and the wrappers live in plugin code outside the sandboxed expression text. SafeEval.ts itself stays byte-identical (REQ-002 verified feasible: zero-diff gate is just `git diff v1.2.8 -- src/data/SafeEval.ts`).

6. Division/NaN behavior: JS `/0 → Infinity`, `Math.sqrt(-1) → NaN` — no exceptions thrown from typical branch bodies; display layer renders non-finite numbers as `-` via `formatEuroNumber`'s `Number.isFinite` guard [SOURCE: src/data/EuroFormat.ts:31-34]. So most "bad branch" values degrade to a dash, not a crash.

## Findings

- F2.1 (high): Ship eager IFS/SWITCH (consistent with existing IF), and document the divergence from Notion's laziness: in Notion, unmatched branches are not evaluated, so a missing-property reference in a dead branch does not fail the formula. In the fork, prefer `field("x")`-style access or IFERROR guards inside branch values.
- F2.2 (medium): This eagerness is invisible for pure-value branches (the common tax-bracket/period-selection cases in the spec scenarios) because conditions like comparisons never throw. Only bare-identifier references to absent fields throw. A one-paragraph docs note covers it.
- F2.3 (info): No sandbox modification is required or permissible for any part of this feature; every semantic need is met at the context-table layer.

## Ruled Out
- Making IFS/SWITCH lazy via AST special-casing in SafeEval — forbidden (security boundary) and unnecessary.
- Wrapping branch values in try/catch thunks — impossible without arrow support in user expressions and adds hidden control flow.

## Next Focus
Iteration 3 — Tokenizer & dependency-extraction impact (incremental save correctness).

---

# Iteration 003 — Tokenizer & dependency-extraction impact

**Status:** complete · **Focus:** Q3 · **newInfoRatio:** 0.7

## Evidence Gathered

1. `scanFormulaSegments` marks an identifier segment with `isCall = expression[i] === "("` [SOURCE: src/data/FormulaTokenizer.ts:167-168]; `extractDependencies` only counts `bracket-ref`, `field-call`, non-call/non-member identifiers not in `FORMULA_BUILTIN_CONSTANTS` [SOURCE: ComputedField.ts:381-407; FormulaTokenizer.ts:22-25].
   ⇒ `SQRT([x])`, `IFS(...)` etc. are recorded as calls and contribute **zero false dependencies**. No tokenizer or constants-set change is required.
2. Dependency consumers that stay correct automatically:
   - Incremental-save coupling: `hasRollupComputedDependency` + evaluation loop [SOURCE: src/data/ComputedEvaluator.ts:19-31].
   - View-layer dep scans in EmbeddedDatabaseRenderer.ts:2848 and DatabaseView.ts:10262 — all funnel through the same `extractDependencies`.
3. Column rename reference rewriting (FormulaTokenizer header note, line 4) also operates on segments — uppercase function names followed by `(` are never rewritten as field refs. Verified by segment kinds: rename logic targets bracket/field/identifier-ref forms, not call positions.
4. Bare use without parens (e.g. `SQRT` as a value) would be treated as a potential field identifier but only counted if a schema column matches that key — harmless noise, identical to existing behavior for e.g. `ABS`.

## Findings

- F3.1 (high): Zero-diff outside `ComputedField.ts` is achievable for the *engine* half of the feature: tokenizer, dependency extraction, sync, and view layers all need no changes. This strengthens REQ-004 feasibility.
- F3.2 (medium): The one real integration surface beyond the function table is **FormulaModal** (see iteration 10): autocomplete/highlight/help read a separate FUNCTIONS registry, so engine-only scope would ship invisible functions.

## Ruled Out
- Adding new names to `FORMULA_BUILTIN_CONSTANTS` — unnecessary: that set exists for constant-shaped built-ins (`pi`, `today`) referenced bare; our names are always calls.

## Next Focus
Iteration 4 — Notion ground truth for ifs()/switches()/math aliases.

---

# Iteration 004 — Notion ground truth: ifs(), switches absence, math set

**Status:** complete · **Focus:** Q4 · **newInfoRatio:** 0.8

## Evidence Gathered

1. Official Notion function list ([SOURCE: https://www.notion.com/help/formula-syntax], fetched full table) confirms:
   - **ifs**: "Returns the value that corresponds to the first true condition." Examples: `ifs(true, 1, true, 2, 3)` = 1 · `ifs(false, 1, false, 2, 3)` = 3 ⇒ trailing argument acts as default/fallback.
   - Math set includes exactly: `sqrt`, `cbrt`, `exp`, `ln`, `log10`, `log2` (plus abs/round/ceil/floor/mod/pow/sign already present in the fork).
   - **No `switches()` / `switch()` exists** in Notion's official list. No generic `log(number, base)` either — Notion splits into log10/log2 only.
   - Notion `pi()`/`e()` are zero-arg functions; fork exposes `pi`/`e` constants ([ComputedField.ts:148-149]) — cosmetic divergence, out of scope.
2. Thomas Frank's reference (comprehensive third-party, consistent with official docs):
   - ifs else-expression is optional; without it the result is blank: "no need to add the 'else' expression — this will be blank by default" [SOURCE: https://thomasjfrank.com/formulas/functions/ifs/, fetched].
   - Same page documents arbitrary condition/then pair count with final else slot.
   - Direct fetch of a `switches()` reference page returned HTTP 403 (non-existent route), consistent with the official list having no such function.
3. Parity mapping derived from the above:

| Proposed fork name | Notion counterpart | Notes |
|---|---|---|
| IFS(cond,val,...,[default]) | ifs | odd arg count = trailing default; no match & no default ⇒ blank |
| SWITCH(expr, pat, val, ..., [default]) | none (Excel/Sheets parity instead) | keep Excel semantics; Notion users emulate via nested ifs |
| SQRT/LN/LOG10/EXP/CBRT | sqrt/ln/log10/exp/cbrt | direct 1:1 |
| LOG(n, b?) | none generic (Notion: log10/log2) | Excel LOG semantics required |

## Findings

- F4.1 (high): The spec's six aliases match five Notion names 1:1 plus LOG. **LOG is the one trap**: JS `Math.log` is natural-log, Excel/Sheets `LOG(n)` is base-10. Naive `LOG: Math.log` would silently produce wrong values vs spreadsheet convention. Recommended: `LOG: (n, b) => b == null ? Math.log10(Number(n)) : Math.log(Number(n)) / Math.log(Number(b))`.
- F4.2 (high): Unmatched-dispatch convention should be **blank/null**, matching Notion ("blank by default") rather than throwing. Engine-native way: wrappers return `null` when pairs are exhausted without a default. This satisfies spec edge-case §8 ("follow the engine's existing fallback/error convention" — null is what failed evaluation already stores).
- F4.3 (medium): Candidate scope extension for upstream PR: add `LOG2` alias too — it completes the Notion math set for one extra table row. Mark as optional (spec freeze lists six).
- F4.4 (info): SWITCH is justified by Excel/Google Sheets parity + the spec's own monthly-vs-quarterly scenario, not by Notion parity; state that honestly in the upstream PR description.

## Ruled Out
- Naming lowercase `ifs`/`sqrt` to mirror Notion exactly — rejected: collides with gate keywords/casing convention (see iter 1); UPPERCASE aliases are this engine's established Excel dialect.

## Next Focus
Iteration 5 — AppFlowy reference repo mining.

---

# Iteration 005 — AppFlowy reference mining

**Status:** complete · **Focus:** Q5 · **newInfoRatio:** 0.4 (negative finding, but load-bearing)

## Evidence Gathered

1. The cloned AppFlowy's database field-type enum has **no formula type**: `FieldType { RichText=0, Number=1, DateTime=2, SingleSelect=3, MultiSelect=4, Checkbox=5, URL=6, Checklist=7, LastEditedTime=8, CreatedTime=9, Relation=10, Summary=11, Translate=12, Time=13, Media=14 }`
   [SOURCE: specs/obsidian/002-note-db-notion-parity-build/context/appflowy/frontend/rust-lib/flowy-database2/src/entities/field_entities.rs:427-441].
2. `flowy-database2/src/services/field/type_options/` contains no `formula_type_option` directory (checkbox/checklist/date/media/number/relation/selection/summary/text/time/timestamp/translate/url only).
3. AppFlowy's formula engine lives in the **external** AppFlowy-Collab crate, not vendored here: `collab-database = { version = "0.2" }` / pinned `git = "https://github.com/AppFlowy-IO/AppFlowy-Collab", rev = "4dfccef"` [SOURCE: context/appflowy/frontend/rust-lib/Cargo.toml:94,154].
4. Flutter-side database tree has no formula field UI files (`find .../lib/plugins/database -iname "*formula*"` → empty); the only "formula"/"sqrt" hits in the clone are document LaTeX math-equation parsing [SOURCE: frontend/rust-lib/flowy-document/src/parser/parser_entities.rs:346].

## Findings

- F5.1 (high): **AppFlowy cannot serve as an implementation reference for IFS/SWITCH/math-function semantics in this clone.** The parity anchor for behavior must be Notion's official documentation; AppFlowy contributes only architecture contrast (expression engine externalized into a collab crate vs the fork's in-plugin engine).
- F5.2 (medium): The contrast still informs fork integration: keeping the feature as additive table rows inside the plugin (rather than extracting an engine crate) matches the smallest-reblast-radius goal and the EuroFormat precedent.
- F5.3 (info): Any upstream PR description should not claim AppFlowy precedent for these functions.

## Ruled Out
- Further digging into AppFlowy-Collab source (not present in the write-scoped environment; network fetch of a pinned Rust rev adds cost with no decision value given F5.1).

## Next Focus
Iteration 6 — Anytype reference mining.

---

# Iteration 006 — Anytype reference mining

**Status:** complete · **Focus:** Q6 · **newInfoRatio:** 0.4

## Evidence Gathered

1. Anytype's client-side "formula" surface is **aggregation-only**: `enum FormulaType { None=0, Count=1, CountValue=2, CountDistinct=3, CountEmpty=4, CountNotEmpty=5, PercentEmpty=6, PercentNotEmpty=7, MathSum=8, MathAverage=9, MathMedian=10, MathMin=11, MathMax=12, Range=13 }`
   [SOURCE: specs/obsidian/002-note-db-notion-parity-build/context/anytype-ts/src/ts/interface/block/dataview.ts:104-118; sections at 121-127].
2. Per-type aggregation menus: `formulaByType()` builds Count/Percent/Math(Min/Max/Median/Range) option lists per relation type [SOURCE: context/anytype-ts/src/ts/lib/relation.ts:163-260].
3. Release notes confirm scope: "Simple Formulas — …count objects in the Grid view and perform simple math and aggregation functions with all types of relations" shipped Desktop 0.44.0 [SOURCE: context/anytype-ts/src/ts/docs/help/whatsNew/v050.ts:878-880]. Grep for `Ifs(`/`Switch(`/`Sqrt(` across `src/ts` returns no function-table hits — any expression-level formula language Anytype has lives in the any-sync Go backend, absent from this TS repo.

## Findings

- F6.1 (high): **Anytype also cannot anchor IFS/SWITCH/math-alias semantics** — its shipped formula feature is per-column aggregation (closer to the fork's `RelationRollup` count|sum|avg|list than to computed-field expressions).
- F6.2 (medium): Useful negative-space insight: both major Notion-alternatives defer expression-level conditional dispatch entirely; the fork's Excel-style engine is already *ahead* of both references here. Parity work is therefore defined purely against Notion + spreadsheet convention, which iteration 4 established.
- F6.3 (info): For the ranked backlog this means phase 004's value case rests on everyday spreadsheet ergonomics (tax brackets, period switching), not on matching a competitor checklist item.

## Ruled Out
- Mining anytype-ts further for backend formula semantics (out of clone; no decision value).

## Next Focus
Iteration 7 — Integration shape: inline rows vs EuroFormat-style isolated module; rebase mechanics.

---

# Iteration 007 — Integration shape: inline rows vs EuroFormat module pattern

**Status:** complete · **Focus:** Q7 · **newInfoRatio:** 0.6

## Evidence Gathered

1. EuroFormat precedent precisely: one new module (`src/data/EuroFormat.ts`, self-contained, documented "Kept in one module so it stays a small, rebasable diff") + **two call-site edits** (imports in `src/views/CellRenderer.ts:13`, `src/views/SummaryRenderer.ts:7`). Fork maintenance is scripted: `update-fork.sh` fetches upstream tags of `pangy9/obsidian-note-database`, rebases the override commits onto the newest release tag, rebuilds, and re-releases; conflict guidance assumes only main.js or small source conflicts [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/update-fork.sh:1-45].
2. Current fork lineage (read-only `git log`): fork commits sit atop upstream `2c96359 Release 1.2.8` (euro-format commit `3f249c2`, tooling `b3ecf07`, mobile fix `05e67e7`). The spec's diff base is therefore tag `v1.2.8`.
3. Shape comparison for phase 004:

| Option | Diff surface | Rebase risk | Upstream PR fit |
|---|---|---|---|
| A. Inline table rows in UPPERCASE block (ComputedField.ts only) | ~20-30 added lines, 1 file | Minimal — additive lines inside a stable region | High — exactly how upstream extends the table today |
| B. New `FormulaFunctions.ts` module + spread into table | 1 new file + 1-2 edits | Low but adds a fork-only file upstream would reject or relocate | Low — upstream must adopt the module too |

4. The two options compose: implement inline now (A); IF upstream later resists, a module extraction is a mechanical follow-up. The reverse (module first) would need re-inlining before an upstream PR.

## Findings

- F7.1 (high): **Recommend Option A** for phase 004 proper. The EuroFormat pattern exists to isolate *fork-only divergences from upstream*; IFS/SWITCH/aliases are *upstream-PR-candidate additions* (REQ-005), so they should live where upstream accepts PRs — inline in its own table.
- F7.2 (medium): Keep REQ-004 verifiable with exact gates: `git diff v1.2.8 --stat -- src/` shows only scoped files; `git diff v1.2.8 -- src/data/SafeEval.ts` empty.
- F7.3 (info): If FormulaModal/i18n entries are included (iteration 10 finding), scope grows by 2 files — still rebase-safe because FUNCTIONS array and locale JSON blocks are append-only regions.

## Ruled Out
- Option B as primary path — wrong tool: EuroFormat pattern solves "fork-only override", this feature solves "missing upstream capability".

## Next Focus
Iteration 8 — Edge cases & fallback conventions.

---

# Iteration 008 — Edge cases & fallback conventions

**Status:** complete · **Focus:** Q8 · **newInfoRatio:** 0.5

## Evidence Gathered

1. Engine fallback conventions inventory (what "existing convention" concretely means):
   - Failed evaluation ⇒ field stored as `null` + console.warn [ComputedField.ts:87-92].
   - Missing dates/keys ⇒ wrappers return `null` or `""` depending on domain ([ComputedField.ts:170-260]: date fns return null on unparseable, "" on null input).
   - `avg([])` returns 0; `sum` coerces non-numbers via `(Number(b) || 0)` [ComputedField.ts:158-162].
2. Proposed wrapper contracts derived against those conventions:

| Case | IFS | SWITCH |
|---|---|---|
| Empty args / fewer than one pair | return `null` (blank, Notion-style) | return `null` |
| Odd arg count (trailing default) | default = last arg | default = last arg when pair-count is even after expr |
| No match, no default | `null` | `null` |
| Condition truthiness | JS truthiness (`Boolean(arg)`) — matches existing `IF` and SafeEval `Cond` semantics | strict `===` matching; document case-sensitivity for text (Excel's SWITCH is case-insensitive — divergence accepted, users can wrap with UPPER()) |
| Numeric-string inputs | coerce via `Number()` for math aliases only | compare raw values first, fall back to String() equality? — recommend raw strict equality to stay predictable |

3. Math alias boundary cases: `SQRT(-1)` → NaN (renders `-` via EuroFormat guard, iter 2 E6); `LN(0)` → -Infinity (also renders `-`); `LOG(n, b)` with b≤0 or b=1 → ±Infinity/NaN. Non-numeric strings: `Math.sqrt("abc")` → NaN — consistent with engine's NaN-tolerant style rather than throwing. Recommend explicit `Number(...)` coercion mirroring `ROUNDUP`'s `Number(n)` pattern [ComputedField.ts:314-315].
4. `coerceValue` turns numeric frontmatter strings into numbers before they reach formulas [ComputedField.ts:~700s] — aliases receive real numbers in the common path.
5. Determinism (NFR-R01): all six aliases are pure Math.* mappings; IFS/SWITCH are pure selection — no clock/random coupling (rand/randBetween already exist separately).

## Findings

- F8.1 (high): Blank-on-no-match via returning `null` is the single convention choice that satisfies Notion parity + engine precedent + spec §8 simultaneously.
- F8.2 (medium): SWITCH should use strict `===` and say so; silent case-insensitivity would be the only fuzzy matcher in the whole function table.
- F8.3 (low): Guard clause recommendation for LOG base argument (`b === 1` → return NaN? or divide producing Infinity) — simplest: compute directly, let IEEE semantics stand; display layer already degrades gracefully.

## Ruled Out
- Throwing localized errors for unmatched branches — rejected: contradicts blank-default parity and pollutes console with warns for legitimate empty states.

## Next Focus
Iteration 9 — Verification infrastructure reality check.

---

# Iteration 009 — Verification infrastructure reality check

**Status:** complete · **Focus**: Q9 · **newInfoRatio:** 0.5

## Evidence Gathered

1. Vitest is configured but the suite is **vacuous/broken today**: `vitest.config.ts` includes `src/**/*.test.ts` and requires setup file `src/__tests__/setup.ts`; neither any `*.test.ts` nor the `__tests__` directory exists in the fork (verified via find/ls). plan.md's "Run the plugin test suite" gate therefore currently has nothing to run — a hidden gap in the Definition of Done.
2. What CAN be gated mechanically today (all read-only verified):
   - Alias equivalence: pure functions — testable in plain node/vitest without Obsidian runtime (`SQRT(4)===Math.sqrt(4)` etc.), since wrappers don't touch `obsidian` imports.
   - IFS/SWITCH scenarios: `evaluateSingleDetailed` needs only `moment` global + i18n `t()` — check whether instantiating `ComputedFieldEngine` pulls obsidian: ComputedField.ts imports only local modules + `t()` from ../i18n → node-safe except moment shim (setup.ts is exactly where upstream-style tests stub it).
3. Diff gates against recorded base:
   - `git diff v1.2.8 --stat` → expect only scoped files (+docs).
   - `git diff v1.2.8 -- src/data/SafeEval.ts` → must be empty (REQ-002/SC-002).
4. Spot-check harness precedent: plan.md proposes "throwaway eval harness"; safer recommendation is a permanent tiny vitest file so regression protection outlives the phase.

## Findings

- F9.1 (high): Add `src/__tests__/setup.ts` (minimal `globalThis.moment` stub) + `src/data/__tests__/computed-formulas.test.ts` covering: six alias-equivalence spot checks; three-bracket IFS incl. boundary incomes; monthly/quarterly SWITCH; unmatched→null cases; SafeEval zero-diff is a shell gate not a unit test.
- F9.2 (medium): Without F9.1, SC-001's "recorded command output" has no runner; creating the missing setup file is in-scope verification scaffolding, not scope creep — it lives under the fork's already-configured test include path.
- F9.3 (info): `npm run lint` (eslint flat config, ignores src/__tests__/**) remains available as an additional gate.

## Ruled Out
- Manual scratch-vault-only testing as sole verification — fails SC-001 reproducibility.

## Next Focus
Iteration 10 — UI/UX discovery surface, mobile/iCloud safety, upstream PR packaging.

---

# Iteration 010 — UI/UX discovery surface, mobile/iCloud safety, upstream PR packaging

**Status:** complete · **Focus:** Q10 · **newInfoRatio:** 0.3 (completes the angle matrix; final loop iteration per stop policy max-iterations)

## Evidence Gathered

1. **FormulaModal is a hard discovery dependency.** The formula editor's UX reads its own registry, not the engine:
   - `FUNCTIONS: FormulaFunctionHelp[]` — 44 entries with category/signature/descriptionKey/example [SOURCE: src/views/modals/FormulaModal.ts:60-107].
   - Autocomplete suggestions built from `...FUNCTIONS.map(fn => fn.name)` + lowercase [FormulaModal.ts:864-868].
   - Syntax highlighting marks `NAME(` as a "function" token ONLY if `FUNCTION_NAMES.has(token.toUpperCase())` [FormulaModal.ts:110, 1202] ⇒ unregistered `SQRT(4)` renders as plain text.
   - Help panel categories/search filter over FUNCTIONS [FormulaModal.ts:664, 1285, 1528].
   - Each entry needs an i18n description key; `formula.fn.*` strings exist in 3 locales (en / zh-CN / zh-TW) — 132 keys today [SOURCE: src/i18n.ts].
2. Mobile/iCloud safety assessment of proposed additions: wrappers are pure compute (`Math.*`, comparisons), no `obsidian`/Platform API imports, no writes, no network, no telemetry → NFR-S01/NFR-R02 satisfied by construction; identical code path on desktop Capacitor/iOS mobile builds. Rollups untouched (display-only constraint preserved).
3. Performance: table entries are closures created once per `createContext` call (already true for 60+ entries); per-evaluation overhead is one function lookup — NFR-P01 trivially met.
4. Upstream PR packaging inputs: MIT license confirmed in fork package.json (author pangy9); candidate PR = inline table rows (+ optionally the modal/i18n discovery entries, which upstream would need anyway for consistency).

## Findings

- F10.1 (high): The spec's Files-to-Change list (ComputedField.ts only) is **insufficient for a shippable feature**: without FormulaModal FUNCTIONS entries + i18n keys in 3 locales, the new functions are invisible/unstyled in the editor. Recommend amending scope to ComputedField.ts + FormulaModal.ts + i18n.ts (all append-only regions; rebase-safe), or recording an explicit user-approved deferral per REQ-P1 rules.
- F10.2 (medium): Upstream PR description should include: motivation (Notion ifs parity + Excel math aliases), the LOG base-10 default decision, eager-branch caveat vs Notion laziness, and the blank-on-no-match convention.
- F10.3 (info): Suggested example strings for the help panel mirror spec scenarios: `=IFS([income]<=69715, 0.14, [income]<=150000, 0.30, 0.36)` and `=SWITCH([period], "month", [amount], "quarter", [amount]*3, 0)`.

## Ruled Out
- Building a separate formula-function documentation page — modal help panel already owns that role.

## Loop Closure
All ten strategy questions answered; stop policy maxIterations reached. Proceed to synthesis.

---
