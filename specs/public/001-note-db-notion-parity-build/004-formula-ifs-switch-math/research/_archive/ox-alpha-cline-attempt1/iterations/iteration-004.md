# Iteration 004 — Notion Error/Empty Semantics (convergence probe)

Focus: official Notion common-formula-errors doc — empty-value handling, type discipline, evaluation guarding.
[SOURCE: https://www.notion.com/help/common-formula-errors]

## Findings

### F19. Notion treats blank as a first-class typed value (`empty()`)
Verbatim: a formula like `if(Date, Date.dateAdd(1, "day"), "")` fails because "the return type is unknown"; the fix is `if(Date, Date.dateAdd(1, "day"), empty())`.
→ Divergence note for phase docs: our fork is dynamically typed JS — `IFS` returning `null` on no-match coexists with string branches without error. Fork behavior is *looser* than Notion here, which is acceptable for an expression engine but should be stated in the README parity notes so users don't expect Notion's strict typing.

### F20. Notion explicitly recommends if/ifs guards around possibly-empty values
Verbatim: "Use if or ifs to check that a property being operated on has a value… This ensures dateAdd is only performed when Date's value present."
→ Interacts with our eager-evaluation constraint (F2 iter-001): a guard pattern `IFS(Date != null, addDays(Date, 1))` in the fork still evaluates `addDays(Date,1)` eagerly. Mitigation already exists: date built-ins return `null`/`""` on unparsable input (:272–296) instead of throwing, so guarded-or-not the result degrades gracefully to null-cell rather than error. Document the idiom difference in help text.

### F21. Notion caps formula nesting at 15 layers
"Notion formulas can only be **15 layers deep**." Not applicable to the fork's flat engine today; recorded only as parity-reference background for the successor LET/variables phase (005).

### F22. Residual unknowns declared (negative knowledge)
- Notion 2.0 `ifs()` short-circuit/laziness: not stated in fetched official pages; community sources conflict. Marked UNKNOWN — irrelevant to correctness of the fork's wrappers given total-function design (F16.7).
- No further unmined sources remain in scope: fork source fully read (Q1), both reference repos mined to their actual capability ceiling (F8), Notion official docs cover all six math aliases + ifs + switch absence (F13–F15).

## Convergence assessment
All five charter questions (strategy.md) now have evidenced answers; the only open items are declared UNKNOWNs that available sources cannot resolve. Candidate next focus would be a fifth evidence pass over exhausted territory → projected newInfoRatio ≤ 0.05.
