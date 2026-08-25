# Iteration 003 — Anytype evidence (Q5)

**Focus:** How anytype-ts implements live column totals and view configuration relevant to rollups.
**Status:** complete

## Findings (paths relative to `specs/obsidian/002-note-db-notion-parity-build/context/anytype-ts/src/ts`)

### F3.1 Anytype aggregates via per-column "formula" on the visible-relation config
- `interface/block/dataview.ts:104-119` — `enum FormulaType { None, Count, CountValue, CountDistinct, CountEmpty, CountNotEmpty, PercentEmpty, PercentNotEmpty, MathSum, MathAverage, MathMedian, MathMin, MathMax, Range }` — 13 kinds including the median/min/max/range/percent family the fork's spec explicitly defers to successor pack `002-rollup-aggregation-pack`.
- The formula is stored **on the ViewRelation** (column config): `model/viewRelation.ts:9` `formulaType: I.FormulaType = I.FormulaType.None`, parsed at :16, observable at :22; declared in `interface/block/dataview.ts:155` (`ViewRelation.formulaType`).
- **Parity insight:** Anytype's storage shape is exactly the fork's shape — aggregation lives on the column/view config, not on rows. The fork's per-column `rollupConfig.aggregation` (`data/types.ts:44`) is the same design point.

### F3.2 Computation is client-side, on-render, over already-fetched records
- `component/block/dataview/view/grid/foot/cell.tsx:33` — `useEffect(() => calculate())`; :55-62 `calculate()` calls `Dataview.getFormulaResult(subId, viewRelation)` and setState only if changed.
- `lib/dataview.ts:980+` (`getFormulaResult`) — pulls records via `S.Record.getRecords(subId, [relationKey], true)`, uses store meta `total` for plain Count, filters empties per relation format (:1016-1030), computes min/max via `Math.min/max(...map(Number))` (:1008-1015), formats numbers with `round(v, 3)` + locale-aware `formatNumber` (:1020-1025).
- No write-back anywhere in this path: results are ephemeral React state. Same display-only philosophy as the fork's default (`ComputedSync.ts:4`).

### F3.3 Footer UX affordance: click-to-change formula, gated by relation type
- `foot/cell.tsx:64-95` (`onSelect`) opens a select menu built from `U.Menu.getFormulaSections(relationKey)` — options are filtered by the relation's format (number/date/etc., cf. `Relation.formulaByType(relationKey, relation.format)` :52-53); fires `analytics.event('ClickGridFormula', ...)` :96-99.
- Editor surface: `component/menu/dataview/relation/edit.tsx` also exposes formulaType.
- **UX enrichment:** both references converge on "user clicks the aggregate cell/pill to switch aggregation." The fork currently requires YAML edits for that; a future pack could mirror this affordance in `SummaryRenderer`.

### F3.4 Anytype has no parent-row relation-rollup either
- Repo grep for `rollup|Rollup` hits only an unrelated text-block component (`ts/component/block/text.tsx`). Dataview views (`model/content/dataview.ts:1-45`) carry sources/views/relationLinks/groupOrder only; relations between objects exist but there is no field type that aggregates *related objects'* properties into a parent row.
- **Parity conclusion across all three systems:** Notion-style per-row rollups are the rarest primitive — the fork has it; AppFlowy and Anytype both implement only the footer/column-aggregate axis. The Reports feature sits on the stronger of the two mechanisms already.

### F3.5 Reactive state model worth noting
- View models are MobX observables (`model/content/dataview.ts:31-39`, `model/view.ts:81-95`); totals recompute through React effects when records or configs change — conceptually the same derived-value flow as the fork's rebuild-on-batch pipeline (`DatabaseView.ts:2119-2158`), minus the explicit path-based refresh targeting the fork uses (which is what makes iCloud-safe refresh cheap).

## Ruled out / failed this iteration
- Looked for server-side aggregation or a dedicated aggregation service in anytype-ts — none found; computation is fully client-side in `lib/dataview.ts`. Also confirmed `store/chat.ts` aggregation hits were chat counters, unrelated.

## Novelty justification
First Anytype evidence: identifies its 13-kind FormulaType taxonomy (directly relevant to the successor pack), confirms client-side on-render computation with no write-back, and completes the three-system comparison showing the fork uniquely owns per-row rollups.
