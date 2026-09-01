# Synthesis: Reports Remaining/Saved Computed Fields
> One-line: ranked Notion-parity enrichment for this feature, synthesized by Grok 4.6 (xhigh-fast) from the phase's 10 research iterations. Evidence trail: research.md.

## Verdict
Build it. Remaining and Saved are a config-only close of Notion’s formula-on-rollup pattern: the native engine already rewrites `[Income] - [Expenses]` to `field("…")`, seeds rollups into a multi-pass evaluator, and stays write-free under `computedSyncMode: display-only`. Do not add a plugin module, do not wait on rollup MAX, and do not enable automatic sync. The single biggest risk is writing the wrong `[field]` names or Saved expression before inspecting live Reports column ids after `001-live-reports-rollups` and `002-rollup-aggregation-pack` ship; a mistype blanks the cell, while flipping the view to `automatic` would churn iCloud YAML on every upstream rollup change.

## Ranked backlog
1. **Remaining as `[Income] - [Expenses]`** — Notion formulas already consume numeric rollups (`prop("Average cost") * 12`; [notion.com/help/formula-syntax](https://www.notion.com/help/formula-syntax)); Reports still lacks the per-row leftover column. Feasibility: **clear**. Fork files: **none** (vault Reports `db_view` YAML only: `schema.computedFields` + matching `type: computed` column). Effort: **S**. Depends on: live Income/Expenses sum-rollups from `001` + aggregations from `002`. Citation: `ComputedField.ts:549-554` (`normalizeFormula` rewrites `[name]` → `field("name")`).

2. **Saved/savings from the same live rollups** — Notion budget templates derive savings from income/rollup inputs ([grizzlytemplates.com/blog/notion-budget-template](https://www.grizzlytemplates.com/blog/notion-budget-template)); Reports has no Saved column. Feasibility: **likely** (expression UNKNOWN until inspect). Fork files: **none** (same `db_view`; second `ComputedFieldDef` with `type: "number"`). Effort: **S**. Depends on: item 1 plus inspect of Sales’ meaning and exact column labels/keys. Citation: `types.ts:102-110` (`ComputedFieldDef` shape).

3. **Lock display-only sync (do not persist formula results)** — Notion returns rollups as computed property values ([developers.notion.com/reference/retrieve-a-page-property](https://developers.notion.com/reference/retrieve-a-page-property)); the fork’s iCloud-safe analogue is *not* writing them. Feasibility: **clear**. Fork files: **none**; keep `computedSyncMode: display-only` explicit in the Reports note. Effort: **S**. Depends on: none (default is already display-only). Citation: `DatabaseView.ts:10244` (`syncComputedForFile` returns unless automatic) plus `ComputedSync.ts:3,42-45`.

4. **SUM-only inputs; do not block 003 on rollup MAX** — Notion rollups expose Sum/Average/Median/Min/Max/Range ([notion.com/help/relations-and-rollups](https://www.notion.com/help/relations-and-rollups)); fork rollups are only `count|sum|avg|list`. Remaining/Saved need SUM, which already exists. Feasibility: **clear** for 003; MAX is a **002** gap. Fork files for 003: **none**. Effort: **S** (decision). Depends on: `002` shipping SUM for the live rollups, not MAX. Citation: `types.ts:39-44` and `RelationRollup.ts:92-129`.

5. **Column order Income → Expenses → Remaining → Saved, with human labels** — Notion/Anytype/AppFlowy pair a short label with the value, not the raw formula. Feasibility: **clear**. Fork files: **none** (`ComputedFieldDef.label`; `schema.columns` order preserved at parse). Effort: **S**. Depends on: items 1–2 existing as columns. Citation: `types.ts:102-104` (`label`) and Anytype `grid/foot/cell.tsx:17-63` (label + value).

6. **Empty-month blank vs numeric zero (`IFERROR` opt-in)** — Notion/Anytype fail empty aggregates to null, not silent 0 (Anytype `min`/`max` at `dataview.ts:1003-1011`; fork `aggregateRollup` returns `null` when no numbers remain). Feasibility: **clear** for native blank; **likely** if operator wants `0`. Fork files: **none** (expression string only; `iferror`/`IFERROR` already in the engine). Effort: **S**. Depends on: Remaining/Saved expressions from items 1–2. Citation: `RelationRollup.ts:126-129` and `ComputedEvaluator.ts:48-70` (error → `null` / blank).

7. **Percent-of-income Saved companion (defer)** — Notion templates use `prop("Expected Income") * 0.2`. Feasibility: **likely** as a third computed column later; percent *style* is not required for 003. Fork files now: **none**. Effort: **S** (formula) / **M** if a new percent display style is invented. Depends on: Saved existing (item 2). Citation: `ComputedField.ts:617-660` (`formatExcelNumber` `%` branch) and [grizzlytemplates.com/blog/notion-budget-template](https://www.grizzlytemplates.com/blog/notion-budget-template).

8. **Rollup MAX/Median/Range/percent-empty (defer to 002/later)** — full Notion rollup catalog vs fork `count|sum|avg|list`. Feasibility: **hard** if forced into 003 (TypeScript; violates REQ-003). Fork files if ever: `types.ts` (`RollupConfig.aggregation`), `RelationRollup.ts` (`aggregateRollup`). Effort: **M**. Depends on: not 003; AppFlowy models Max as footer `CalculationType`, not a cell rollup (`calculation_entities.rs:69-78`). Citation: [notion.com/help/relations-and-rollups](https://www.notion.com/help/relations-and-rollups).

9. **Inline formula errors (defer)** — Notion shows formula errors in-cell; the fork only `console.warn`s and blanks. Feasibility: **hard** under this phase (no engine edits). Fork files if ever: `ComputedEvaluator.ts:68-70`, cell render path. Effort: **M**. Depends on: out of scope (REQ-003). Citation: `ComputedField.ts:100-113` / `:508-546`.

10. **`LET` / 1M–3M–1Y projections (blocked here)** — Notion Formulas 2.0-style named bindings; fork has no `LET`. Feasibility: **blocked** for 003. Fork files: would be `ComputedField.ts` (forbidden). Effort: **L**. Depends on: successor `004-formula-ifs-switch-math` / later LET work. Citation: iteration 001 negative search (no `LET` in context/aliases).

## Recommended build (locked design)
**Core algorithm (already in the fork; do not reimplement).** Live Income/Expenses/Sales rollups are computed in memory (`buildRelationRollups` → `valuesByPath`; `RelationRollup.ts:24-89`) and injected as `context.derivedValues`. `evaluateComputedFields` copies that map into `result` and re-evaluates every `ComputedFieldDef` for `max(defs.length, 1)` passes until formula-on-rollup and formula-on-formula refs converge (`ComputedEvaluator.ts:29-48`). Each native expression is stripped of a leading `=` and every `[Name]` becomes `field("Name")` (`ComputedField.ts:549-554`). If the matched column `type === "rollup"`, `getFieldValue` reads **only** `computed[column.key]` so stale YAML cannot shadow live rollups (`ComputedField.ts:557-572`). Errors set the cell to `null` and warn on the last pass (`ComputedEvaluator.ts:68-70`); they never call `updateFrontmatter`. Remaining is the literal expression `[Income] - [Expenses]`. Saved is a second `type: "number"` def whose expression is chosen at inspect from the same rollup keys (see Open questions). Matching `schema.columns` entries use `type: computed` and `computedKey: remaining|saved`. Keep `computedSyncMode: display-only` explicit. Use native syntax, not `expressionSyntax: "base"`. Rollup-of-rollup is already rejected (`RelationRollup.ts:101`), matching Notion’s loop ban ([notion.com/help/relations-and-rollups](https://www.notion.com/help/relations-and-rollups)).

**Config mutation (the only legal change).** Edit the Reports note with `db_view: true` (`DataSource.ts` parse of `computedSyncMode` + `schema`; research cites `:770-799` / `:787`). Shape:

```yaml
computedSyncMode: display-only
schema:
  computedFields:
    - key: remaining
      label: Remaining
      expression: "[Income] - [Expenses]"
      type: number
    - key: saved
      label: Saved
      expression: "<inspect-time; see Open questions>"
      type: number
```

**EuroFormat isolated-module pattern: inherit, do not clone.** Spec §3 and plan §3 forbid a new `src/data/` module and any call-site TypeScript. The established rebase recipe is the existing module `src/data/EuroFormat.ts` (header: one module, small rebasable diff) with three production call sites already formatting computed/number cells: `views/CellRenderer.ts:13` (import), `:198` (`formatEuroCurrency`), `:2576` (`formatEuroNumber`); footer numbers via `views/SummaryRenderer.ts:7` (import) and `:556` (`formatEuroNumber2`). Remaining/Saved ride that path automatically (`row.computed[col.computedKey || col.key]`). Do **not** add `RemainingSaved.ts` or a fourth call site. Clone the EuroFormat pattern only later if a percent/currency style cannot be expressed with `numberDisplayStyle` / existing `TEXT()`/`%` formatting (`ComputedField.ts:617-660`).

**Verification (locked with the design).** Known row Income=1000, Expenses=400 → Remaining 600. Hash Report note bytes before/after open+scroll on desktop and mobile (must match). `git diff` empty on `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts`. Negative control: `[Incme] - [Expenses]` → blank cell, still no YAML write, then restore.

## Edge cases & mobile/iCloud safety
- **Missing / non-numeric Income or Expenses.** Rollup aggregation returns `null` when no numbers remain (`RelationRollup.ts:126-129`). `field()` then yields `undefined`; arithmetic throws; the evaluator stores `null` (blank cell), never a YAML fallback. Same null-not-zero discipline as Anytype `min`/`max` (`dataview.ts:1003-1011`). If a sparse month must show `0`, wrap with `IFERROR([Income] - [Expenses], 0)` — already in the builtin set (`ComputedField.ts:135-380`).
- **Mistyped `[field]`.** Fail-closed: localized error string, result `null`, no persistence (`ComputedField.ts:508-546`). Do not “fix” this in `SafeEval.ts`.
- **Currency strings.** `coerceValue` strips `, ¥ ￥ $` and whitespace before `Number` (`ComputedField.ts:590-597`), so `"1,000"` / `$400` still subtract.
- **Sales unused by Remaining.** Allowed. Saved may reference Sales only if inspect shows that intent; a formula must not target another rollup-of-rollup (fork + Notion both forbid it).
- **Definition order.** Irrelevant; multi-pass converges (`ComputedEvaluator.ts:48`). `hasRollupComputedDependency` already flags formulas that read rollup keys (`ComputedEvaluator.ts:16-27`).
- **Automatic mode left on.** The only writer is `syncComputedForFile` (`DatabaseView.ts:10244`); automatic mode stringifies and writes even nulls as `""`, so every live rollup change would churn notes. Unknown YAML values normalize back to display-only (`ComputedSync.ts:42-45`). Rollback: delete the two computedFields/columns; if a stray persisted key exists from an earlier automatic session, use the existing cleanup modal (`DatabaseView.ts:5576+`).
- **Mobile.** No `Platform` gate on computed/rollup evaluation. The two `DatabaseView.ts` Platform checks (research: `:4648`, `:6848`) are icon editing and bulk-editor dismissal, not cells. EuroFormat call sites are unconditional — same numbers on phone and desktop (REQ-005).
- **iCloud.** Display-only + in-memory rollups (`RelationRollup.ts:24-89`) mean two devices viewing Reports produce zero note mutations. Safe because this phase is display-only (spec REQ-002 / REQ-005), not because of a new module. Rebase onto upstream plugin code is unaffected: vault YAML only.

## Open questions / operator decisions
1. **Exact Saved formula string (spec UNKNOWN).** Recommended default: inspect the live Reports columns after `001`/`002`. If Sales is an outflow from income, use `[Income] - [Expenses] - [Sales]`. If Sales is unused or is itself income, use `[Income] - [Expenses]` (may duplicate Remaining — acceptable under REQ-004, but then confirm you still want two columns). Do not invent a percent Saved in this phase.
2. **Exact `[field]` names / Reports note path.** Recommended default: match `col.label` or `col.key` exactly as shipped (`getFieldValue` uses both; `ComputedField.ts:563-564`). Do not assume the strings `Income` / `Expenses` / `Sales` until inspect. Path of the `db_view: true` note stays inspect-time UNKNOWN.
3. **Blank vs zero on empty months.** Recommended default: native blank (fail-closed). Opt into `IFERROR(..., 0)` only if empty-month rows must show numeric zero in finance reading.
4. **Wait for rollup MAX before shipping 003?** Recommended default: **no**. Proceed on SUM rollups (item 4). MAX/Median/Range stay in `002` or footer `SummaryRenderer` (already has MAX; spec puts footer kinds out of scope).
5. **Enable `automatic` computed sync for Reports?** Recommended default: **never** on an iCloud vault. Keep `display-only`; the 5 s debounce queue (`DatabaseView.ts:10286-10330`) is evidence of how chatty persistence is.
6. **Add a new EuroFormat-style `src/` module for Remaining/Saved?** Recommended default: **no**. Spec forbids it; CellRenderer/SummaryRenderer already format these cells.
7. **Percent Saved / `LET` projections / inline errors?** Recommended default: defer (backlog 7, 9, 10). Successor `004` owns IFS/SWITCH/math expansion; LET is explicitly out of this phase.
