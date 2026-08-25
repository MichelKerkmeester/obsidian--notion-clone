# Iteration 001 — Local Engine Ground Truth (Q1)

Focus: exact insertion point, evaluation semantics, and constraints for IFS/SWITCH/math aliases in the fork's formula engine.
All paths relative to fork src root `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src` unless noted.

## Findings

### F1. Two-tier function table; uppercase Excel-style tier is the insertion point
`ComputedField.ts:135` `createContext` builds a flat `Record<string, unknown>` context in two tiers:
- Lowercase built-ins + date/string helpers: lines 146–309 (`round`, `sum`, `iferror`, …).
- Uppercase Excel-style aliases via one `Object.assign(context, {...})`: lines **310–378** (`ROUND…COUNTIF`; `IF:` at :325, `IFERROR:` :326, `AND/OR/NOT:` :327–329).

[SOURCE: data/ComputedField.ts:135,146,233,260,310,325-329]

→ IFS/SWITCH and math aliases belong in the 310–378 `Object.assign` block as uppercase entries (`IFS`, `SWITCH`, `SQRT`, `LN`, `LOG`, `LOG10`, `EXP`, `CBRT`), mirroring how `POW/POW` aliasing is already done at :372–373.

### F2. Evaluation is EAGER for all function-call arguments
SafeEval's evaluator resolves call arguments before invoking the function (plain JS function objects on the context). Consequences:
- Existing `IF(cond,t,f)` at :325 is a plain ternary inside a function — both branches are computed first. There is no lazy branch machinery anywhere in the engine.
- IFS/SWITCH will therefore evaluate every condition AND every result expression eagerly. A throwing or domain-erroring branch expression cannot be "skipped" by the wrapper.
[SOURCE: data/SafeEval.ts:1074+ evalNode; data/ComputedField.ts:325]

→ Design consequence: wrappers must be total functions over their evaluated args (never rely on short-circuit), and docs/scenarios must note that heavy branches still compute. Notion's engine differs here (see iteration 003 web check).

### F3. Casing/keyword constraints pin the naming
- SafeEval keyword set is only `true/false/null/undefined/typeof/if/else/return` [SOURCE: data/SafeEval.ts:265–275]. So lowercase `ifs(...)` and even lowercase `switch(...)` tokenize as plain identifiers and would resolve via the context — technically feasible for Notion-style lowercase naming.
- BUT `ComputedFieldEngine.RESERVED` (:119–124) blocks any frontmatter field named `switch` from entering context, so a lowercase `switch` built-in could not be shadowed by user fields — actually favorable.
- Uppercase names are unconditionally safe and match the existing alias-tier convention.
[SOURCE: data/ComputedField.ts:119–124]

→ Recommendation shape: register uppercase `IFS`/`SWITCH` (primary, convention-consistent); optionally add lowercase mirrors `ifs`/`switch` for Notion muscle-memory parity since neither collides with SafeEval keywords.

### F4. Math aliases are pure sugar over already-scoped globals
`evaluateExpressionDetailed` injects `{ Math, Number, String, Boolean, Array, Object, JSON, Date, … }` into the eval scope [SOURCE: data/ComputedField.ts:397–404]. So:
- `SQRT: Math.sqrt`, `LN: Math.log`, `LOG10: Math.log10`, `EXP: Math.exp`, `CBRT: Math.cbrt` are direct references.
- `LOG` needs arity handling to match Excel/Notion semantics: `LOG(n)` = log10, `LOG(n, base)` = log base b — implement as `(n, base=10) => base===10 ? Math.log10(Number(n)) : Math.log(Number(n))/Math.log(Number(base))`. Note existing precedent of default args in table entries: `LEFT(value, count=1)` :339.
- Domain behavior: `Math.sqrt(-1)=NaN`, `Math.log(0)=-Infinity` do NOT throw; they return non-finite numbers. Engine convention for these is `IFERROR`, which explicitly catches `!Number.isFinite` values [SOURCE: data/ComputedField.ts:296–307]. So aliases should return raw results and let IFERROR handle fallbacks — consistent with `pow`/`mod`.

### F5. Unknown-function / no-match error conventions
- Unknown name → SafeEval throws `X is not defined` → `formatEvaluationError` maps it to `formula.error.undefinedVar` [SOURCE: data/ComputedField.ts:476–479]; evaluation result becomes `{value:null,error}` and the field renders null (:102–108). Purely additive change: pre-phase formulas keep this behavior.
- Empty varargs precedent: `sum()` → 0, `avg()` empty → 0 [SOURCE: data/ComputedField.ts:159–161].
→ For IFS with no true condition and SWITCH with no match + no default, follow the field-null convention by returning `null` (matches REQ-001 "engine's existing error/fallback conventions") rather than throwing.

### F6. Sandbox stays intact by construction
- The security gate has two layers: pre-eval regex blocklist incl. `while/for/do/function/=>/constructor/eval` [SOURCE: data/ComputedField.ts:442–497] and SafeEval's own interpreter (no `eval()`, arrows parsed but gated upstream) [SOURCE: data/SafeEval.ts:1–12].
- Adding named function entries to the context object adds zero new evaluation paths: no new token types, no parser/eval changes. REQ-002 zero-diff on SafeEval.ts is achievable trivially.

### F7. Isolated-module pattern assessment
Precedent module `data/EuroFormat.ts` (42 lines, pure exported functions, small call-site edits) exists precisely to keep diffs rebase-safe [SOURCE: data/EuroFormat.ts:1–42 header comment]. Spec pins the edit to a single region of `createContext` (plan.md §3). Trade-off found:
- Option A (spec-pinned): inline entries in the 310–378 block — smallest possible diff, matches spec REQ-004 exactly.
- Option B (EuroFormat-style): new `data/FormulaConditionalMath.ts` exporting an entry object spread into the Object.assign block — one added file + ~2-line call-site edit; slightly larger footprint but keeps future function additions out of ComputedField.ts entirely and gives unit-testable pure wrappers.
The research topic explicitly names the EuroFormat pattern as desired; B satisfies REQ-004 ("one region": the spread lands at the tail of the same Object.assign) while improving testability. This is a ranked recommendation, not a scope change.

## Ruled Out
- Editing SafeEval.ts for lazy branches — forbidden by spec and unnecessary (F2/F6).
- Lowercase-only naming — breaks convention with the uppercase alias tier (F3).
- Throwing on no-match IFS/SWITCH — contradicts the null-field convention (F5).
