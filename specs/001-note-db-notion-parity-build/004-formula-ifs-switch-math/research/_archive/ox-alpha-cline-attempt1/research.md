# Research: Formula IFS/SWITCH + Math Function Aliases — Ranked Enrichment

Lineage `ox-alpha-cline` · session `fanout-ox-alpha-cline-1787614633518-33q0rc` · converged at iteration 5 (newInfoRatio 0.0 < 0.05).

Synthesizes 5 iterations / 22 registered findings. Fork src paths are relative to `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`; reference repos live under `specs/obsidian/002-note-db-notion-parity-build/context/`.

---

## RANKED RECOMMENDATIONS

### RANK 1 — Land the wrappers as total functions with `null` no-match fallback (core logic)

The engine evaluates **every** function argument eagerly — SafeEval resolves call arguments before invocation and the existing `IF` is a plain ternary inside a function [SOURCE: data/ComputedField.ts:325; data/SafeEval.ts evalNode]. IFS/SWITCH therefore cannot short-circuit and must be designed as total functions:

```ts
IFS: (...args: unknown[]) => {
  for (let i = 0; i + 1 < args.length; i += 2) if (args[i]) return args[i + 1];
  return args.length % 2 === 1 ? args[args.length - 1] : null;
},
SWITCH: (value: unknown, ...args: unknown[]) => {
  // args = [pattern1, result1, pattern2, result2, ..., default?]
  const nPairs = Math.floor(args.length / 2);
  for (let i = 0; i < nPairs; i++) {
    if (value === args[i * 2]) return args[i * 2 + 1];
  }
  return args.length % 2 === 1 ? args[args.length - 1] : null;
},
```
(Exact SWITCH pairing: iterate `(pattern, result)` pairs over even indices; fall through to an odd trailing default; return `null` otherwise.)

Semantics grounded in Notion's official docs: `ifs(cond1, then1, …, else?)`, where omitting the else yields blank [SOURCE: https://www.notion.com/help/formula-syntax]. Map "blank" to the fork's existing null-cell convention: evaluation failures already render fields as `null` [SOURCE: data/ComputedField.ts:102–108], and empty-varargs tolerance has precedent (`sum() → 0`) [SOURCE: data/ComputedField.ts:159–161]. Anytype likewise returns `null` when there is no data rather than erroring [SOURCE: context/anytype-ts/src/ts/lib/dataview.ts:1007–1010].

**Why rank 1:** this decision determines correctness of REQ-001's "no-match follows existing conventions" clause and every acceptance scenario.

### RANK 2 — Position SWITCH as Excel parity; name entries uppercase-first with lowercase mirrors (naming & parity truth)

Pivotal negative finding: **Notion formula 2.0 has no `switch()`** — the official function list documents only `if`/`ifs`; users emulate dispatch by nesting ifs [SOURCE: https://www.notion.com/help/formula-syntax ; https://wisechecker.com/notion-formula-switch-equivalent-if-else-chain/]. The spec's framing should therefore treat SWITCH as Excel-convention parity (`SWITCH(expr, pat1, val1, …, [default])`), not Notion parity.

Naming evidence: SafeEval's keyword set is only `true/false/null/undefined/typeof/if/else/return` [SOURCE: data/SafeEval.ts:265–275], so lowercase `ifs(...)`/`switch(...)` tokenize as identifiers and resolve through the context table safely. The uppercase alias tier via one `Object.assign(context, {...})` block (:310–378) is the established home for Excel-style names (`IF:` :325, `POW/POWER:` :372–373) [SOURCE: data/ComputedField.ts:310–378].

**Recommendation:** register `IFS`, `SWITCH` uppercase (primary) + lowercase mirrors `ifs`, `switch` for Notion muscle memory — mirroring how lowercase built-ins coexist with aliases today (`iferror` :296 vs `IFERROR` :326). Frontmatter shadowing is a non-issue: built-ins override user fields by spread order, and `switch` is already in RESERVED [SOURCE: data/ComputedField.ts:119–124,146 comment].

### RANK 3 — Math aliases as direct `Math.*` references; give LOG an Excel optional base (core logic, REQ-003)

`Math` is injected into every eval scope [SOURCE: data/ComputedField.ts:397–404], so:
- `SQRT: Math.sqrt`, `LN: Math.log`, `LOG10: Math.log10`, `EXP: Math.exp`, `CBRT: Math.cbrt` — trivially satisfying REQ-003 equivalence.
- `LOG(n, base = 10)`: Notion ships only fixed-base `log10`/`log2` — there is **no general log(n, base)** [SOURCE: https://www.notion.com/help/formula-syntax]; Excel's `LOG(number,[base])` default-10 form is the right contract, and optional params have precedent in the same table (`LEFT(v, count=1)` :339).
- Domain results (`SQRT(-1)→NaN`, `LN(0)→-Infinity`) do not throw; return them raw — the engine's `IFERROR` explicitly catches non-finite values [SOURCE: data/ComputedField.ts:296–307].
- Optional freebie for the upstream PR candidate only (out of phase scope): Notion-parity `LOG2` alias.

### RANK 4 — Integration shape: two rebase-safe options, recommend the EuroFormat-style module (fork integration)

Precedent module `data/EuroFormat.ts` exists precisely to keep diffs small and rebasable ("Kept in one module so it stays a small, rebasable diff") [SOURCE: data/EuroFormat.ts:1–42]. Two viable shapes:

| Option | Shape | Rebase footprint | Testability |
|---|---|---|---|
| A (spec-pinned) | Inline entries appended inside the :310–378 `Object.assign` block | One region, one file — exactly REQ-004 | Only via full-engine eval |
| B (EuroFormat pattern, recommended) | New `data/FormulaConditionalMath.ts` exporting `{IFS, SWITCH, SQRT, …}` pure functions; call site spreads it into the same block (+2 lines) | One new file + 2-line edit in one region | Wrappers unit-testable without the engine |

Both satisfy REQ-002 (SafeEval zero-diff — context-table additions create zero new parser/eval paths [SOURCE: data/SafeEval.ts:1–12; data/ComputedField.ts:442–497]) and REQ-004's single-region constraint. B trades two extra touched lines for pure-function testability of the tax-bracket/monthly-quarterly scenarios.

### RANK 5 — Edge-case verification matrix (verification, SC-003)

Derived from all three sources; each row is an objective pass/fail spot-check:
1. `IFS()` and `SWITCH(x)` empty/degenerate args → `null`.
2. `IFS(false, 1, false, 2)` → `null`; `IFS(false, 1, false, 2, 3)` → `3` (mirrors Notion's documented example verbatim).
3. `SWITCH("q", "m", monthly, "q", quarterly)` → quarterly; unmatched with no default → `null`.
4. Boundary tax-bracket chain (Scenario 1): conditions evaluated in order, first true wins.
5. Alias equivalence on spot inputs incl. negatives/zeros: `SQRT(4)=2`, `LN(e)=1`, `LOG(100)=2`, `LOG(8,2)=3`, `EXP(0)=1`, `CBRT(64)=4`.
6. `SQRT(-1)` → NaN renders via IFERROR fallback; bare NaN cell shows engine's number rendering.
7. Truthiness parity: conditions coerce like JS booleans, consistent with existing `AND/OR` (:327–328) and Notion's "evaluated for truthiness" framing.
8. Eager-branch caveat documented: both branches compute even when unselected — safe because sandbox forbids side effects and date/text built-ins return `null`/"" on bad input instead of throwing [SOURCE: data/ComputedField.ts:272–309]; matches Notion's own guidance to guard empties with if/ifs [SOURCE: https://www.notion.com/help/common-formula-errors].

### RANK 6 — UI/UX: docs-inventory update now; Anytype's sectioned picker pattern when a picker ever lands

The fork has no formula autocomplete surface (no function-list UI outside ComputedField.ts; formulas are raw expressions). Parity UX work is therefore documentation: extend the canonical function inventory doc-comment (:33–77) grouping **Conditionals** (IFS, SWITCH) and **Math** (six aliases), following the transplantable patterns mined from the references:
- Type-gated, sectioned option lists with long+short labels [SOURCE: context/anytype-ts/src/ts/lib/relation.ts:163–253; util/menu.ts:1406–1425].
- Centralized label extension with short forms for dense footer cells [SOURCE: context/appflowy/frontend/appflowy_flutter/lib/plugins/database/application/calculations/calculation_type_ext.dart:5–34].
- Error strings need zero new i18n keys since wrappers never throw (existing `formula.error.*` mapping suffices) [SOURCE: data/ComputedField.ts:476–506].

### RANK 7 — Mobile/iCloud safety: satisfied by construction (REQ-006)

Additions are pure compute over already-loaded frontmatter — no Obsidian API surface, no vault writes, no network. SafeEval is a pure-TS interpreter that runs identically on mobile [SOURCE: data/SafeEval.ts:1–12]. Both reference implementations follow the same read-only display-value posture [SOURCE: appflowy …/calculations/service.rs:31–84; anytype-ts/src/ts/lib/dataview.ts:1041+], corroborating NFR-S01/NFR-R02.

---

## REFERENCE-REPO REALITY CHECK (negative knowledge)

Neither clone contains a per-cell expression language to mine:
- AppFlowy (commit `5cf3a36`): `FieldType` enum has no Formula variant [SOURCE: frontend/rust-lib/flowy-database2/src/entities/field_entities.rs:427–441]; only closed aggregate Calculations (Average/Max/Median/Min/Sum/Count…) [SOURCE: …/src/services/calculations/service.rs:17–27]. The historical expression engine lives in the external collab-database crate, absent from this clone.
- Anytype: `FormulaType` is a closed numeric aggregate enum computed client-side [SOURCE: anytype-ts/src/ts/interface/block/dataview.ts:104–119; lib/dataview.ts:981–1170].

Consequence: the fork's free-form Excel-style engine is already more expressive than both references on this axis; their value here is UX patterns and behavioral conventions, which Ranks 5–6 absorb.

## DOCUMENTED DIVERGENCES FROM NOTION
1. Dynamic typing: Notion requires typed blanks (`empty()`); the fork mixes types freely — looser, document it [SOURCE: https://www.notion.com/help/common-formula-errors].
2. Eager branch evaluation vs Notion's guard-recommended model (laziness itself remains UNKNOWN from official sources — declared residual unknown).
3. `SWITCH` exists here but not in Notion; `LOG(n,base)` exists here but not in Notion.
4. Notion's 15-layer nesting cap has no analogue in the flat engine (background for successor phase 005 LET work).

## CONVERGENCE REPORT
- Stop reason: **converged** (iteration 5 newInfoRatio 0.0 < threshold 0.05; stopPolicy max-iterations cap 6 not reached)
- Iterations completed: 5 (4 evidence + 1 analytical thought)
- Questions answered: 5/5 charter questions
- newInfoRatio trend: 1.0 → 0.7 → 0.6 → 0.5 → 0.0
- Quality guards: source diversity (fork TS ×2 files + 2 reference repos + 2 official Notion pages), focus alignment, no weak single source — all pass.
