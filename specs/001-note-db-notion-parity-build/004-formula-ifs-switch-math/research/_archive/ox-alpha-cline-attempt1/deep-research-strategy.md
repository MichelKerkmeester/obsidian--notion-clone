# Deep Research Strategy — Formula IFS/SWITCH + Math Function Aliases

Lineage: `ox-alpha-cline` · Session: `fanout-ox-alpha-cline-1787614633518-33q0rc`

## Charter

**Goal:** Produce a ranked, evidence-cited enrichment of the IFS/SWITCH + math-alias formula feature so it lands Notion-parity quality inside the fork's rebase-safe isolated-module discipline.

**Non-Goals:** Implementing code changes; editing `SafeEval.ts` or any file outside the lineage dir; expanding rollups beyond display-only; successor-phase LET variables.

**Stop Conditions:** newInfoRatio < 0.05 (legal convergence), or max iterations reached.

## Known Context (bounded snapshot)

- Fork src root: `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`.
- Engine: `data/ComputedField.ts` (740 lines). `createContext` at :135 builds a flat function table: lowercase built-ins (:146–309) then an uppercase Excel-style alias table via `Object.assign(context, {...})` (:310–378).
- Existing conditional surface: `IF(cond,t,f)` at :325 only — eager evaluation of both branches; `IFERROR` :326; `AND/OR/NOT` :327–329.
- Math built-ins already present: `round/floor/ceil/abs/max/min/pow/mod/sign/rand/randBetween` (:157–166); `Math`, `Number`, etc. injected into eval scope at `evaluateExpressionDetailed` (~:397–404).
- Sandbox: `data/SafeEval.ts` (1149 lines), tokenizer/parser/evaluator replacing `eval()`; parses arrow tokens but gate blocks them; security pre-check also in `ComputedField.validateFormulaSecurity` (:437+ dangerous-token regexes incl. `while/for/do/function/=>`).
- Isolated-module precedent: `data/EuroFormat.ts` (42 lines, pure functions, one module, small call-site edits — the fork's rebase-safe pattern).
- Reference repos under `context/`: `appflowy` (Rust `flowy-database2` + Flutter UI), `anytype-ts` (`src/ts`).

## Questions

1. Q1: What is the exact insertion point and shape for IFS/SWITCH/math aliases in `createContext`, consistent with existing varargs (`sum`, `TEXTJOIN`) and eager-eval conventions?
2. Q2: How do AppFlowy's Rust grid model and Flutter UI implement conditional-branch and math formula functions (names, arity, empty/no-match semantics)?
3. Q3: How does Anytype implement the same capability, and what naming/behavior conventions does it share with Notion?
4. Q4: What are Notion's exact `ifs`/`switch` semantics (no-match result, default arg, type behavior) and what does the formula editor UX expose (autocomplete, docs)?
5. Q5: What edge cases and test matrix must the phase cover (empty args, non-numeric math inputs, NaN/domain errors, lazy vs eager branches), and how do they interact with the sandbox boundary, mobile, and iCloud safety?

## Next Focus

Iteration 002 → Q2+Q3 (AppFlowy + Anytype reference implementations).

## What Worked / What Failed
- Iter 001: direct source read of the two-tier table + SafeEval keyword list settled naming and eagerness questions in one pass.
- Iter 002: negative finding (no expression engine in either clone) redirected effort to transplantable UX patterns — cheaper than expected.
- Iter 003–004: official Notion pages overturned the SWITCH-parity framing; pivoted spec positioning to Excel parity for SWITCH.
- Failed/skipped: 403 on thomasjfrank.com/functions/switch, 404 on bensomething.com switch page — recovered via official formula-syntax page.

## What Worked / What Failed

- (appended per iteration)
