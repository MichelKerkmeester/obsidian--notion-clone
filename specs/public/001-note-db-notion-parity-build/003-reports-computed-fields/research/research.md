# Deep Research: Reports Remaining/Saved Computed Fields

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `ox-alpha-cline`. Stop reason: max_iterations. Average newInfoRatio: n/a.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 001 — Native formula engine core (ComputedField + SafeEval + tokenizer)

**Focus:** Q1 — what the native engine supports today for `[field]` refs, multi-pass evaluation, arithmetic, and blank/error behavior.
**Status:** complete
**newInfoRatio:** 1.0 — first iteration; everything is new relative to the init record.
**Novelty justification:** All engine facts below are first-cited from fork source.

## Findings

### F1.1 `[field]` refs are normalized to `field("name")` calls
`normalizeFormula` strips a leading `=` then rewrites every `[name]` bracket into a `field("name")` function call via regex [SOURCE: src/data/ComputedField.ts:549-554]. So the spec's Remaining formula `[Income] - [Expenses]` is literally supported syntax.

### F1.2 Rollup columns resolve as virtual values that frontmatter can never shadow
In `getFieldValue`, when the referenced column `type === "rollup"`, the value comes only from the computed/derived map (`computed[column.key]`), with an explicit comment: stale or legacy frontmatter with the same key must never shadow rollups [SOURCE: src/data/ComputedField.ts:557-589 (rollup branch)]. Non-rollup columns resolve frontmatter first, then computed. This is exactly the hook that lets a formula read live Income/Expenses/Sales rollup columns on the same row (SC-001).

### F1.3 Multi-pass evaluation converges formula-on-formula and formula-on-rollup dependencies
`evaluateComputedFields` seeds results with `context.derivedValues` (the rollups) and loops `for pass 0..max(defs.length,1)` re-evaluating every def until values stabilize regardless of definition order [SOURCE: src/data/ComputedEvaluator.ts:35-66 (loop at :48); seeding at :35]. A warning is logged only on the final pass (:52-54). The spec's "multi-pass native engine" claim is confirmed verbatim in code.
Additionally `hasRollupComputedDependency` statically detects formulas depending on rollup keys so callers can order rollup computation before formulas [SOURCE: ComputedEvaluator.ts:16-27].

### F1.4 Dependency extraction understands four reference forms
`ComputedFieldEngine.extractDependencies` recognizes `[field]`, `field("x")`, bare identifiers, and Bases-style `formula.<key>` member refs mapped back to computed/rollup schema columns [SOURCE: ComputedField.ts:390-412; segment kinds in src/data/FormulaTokenizer.ts:17-20]. Built-in constants are excluded (FormulaTokenizer.ts:22). This is what powers incremental automatic sync — and it means Remaining/Saved will be correctly tracked as dependents of Income/Expenses/Sales if any future mode change occurs.

### F1.5 Sandbox: no eval/new Function, token blocklist, statement fallback
`safeEval` is an interpreter replacing `new Function()`/`eval()` [SOURCE: src/data/SafeEval.ts:3 header comment, :1129-1139 exports with `allowStatements` option]. Before evaluation, `validateFormulaSecurity` rejects dangerous tokens (constructor/__proto__/eval/import/fetch/Worker/process/globalThis/while/for/do/class/new/this/throw/delete/async/await...) and both `function` declarations and arrow functions [SOURCE: ComputedField.ts:429-431 gate, :460-545 list]. Formulas stay arithmetic/`[field]` expressions as the spec's NFR-S01 requires.

### F1.6 Rich Excel-style function set already available to Remaining/Saved
Context builtins include `round/floor/ceil/max/min/sum/avg/if/iferror/mod/pow/sign`, date helpers, text helpers, and Excel-cased aliases (`IF`, `IFERROR`, `ROUND`, `SUM`, `TEXT`, ...) [SOURCE: ComputedField.ts:135-305 lowercase set; :310-380 uppercase alias block]. `formatText`+`formatExcelNumber` support `0.00`, `#,##0`, zero-padding, and `%` formats [SOURCE: ComputedField.ts:617-660] — directly usable for currency-style display of Remaining/Saved without any engine change.
Notably absent: no `LET` anywhere — consistent with the spec deferring LET projections.

### F1.7 Blank/error behavior is fail-closed to null
On error, `result[def.key] = null` (cell blank) plus console.warn [SOURCE: ComputedEvaluator.ts:51-62; same contract in ComputedField.ts:100-113 `evaluate`]. `formatEvaluationError` maps `X is not defined` → undefined-variable message, SyntaxError variants, TypeErrors, RangeErrors [SOURCE: ComputedField.ts:508-546]. A mistyped `[Incme]` therefore yields a blank cell + localized error string, never YAML output — matches spec edge-case expectations ("fail closed").

### F1.8 Currency-string coercion is built in
`coerceValue` trims, strips `, ¥ ￥ $` and whitespace, and converts pure numeric strings to Number [SOURCE: ComputedField.ts:590-597]. Finance amounts stored as `"1,000"` or `$400` still evaluate numerically inside Remaining — reduces data-hygiene risk for the finance vault.

## Ruled out / failed
- Searched for `LET` support: none in ComputedField.ts context or aliases — confirms out-of-scope claim.
- No separate per-view evaluation pipeline exists; views reuse `evaluateComputedFields`.

## Next-focus input
Q2: where computed results could be persisted (sync modes), to prove REQ-002's display-only path.

---

# Iteration 002 — computedSyncMode, write-back paths, iCloud safety

**Focus:** Q2 (+Q3 partial) — what `computedSyncMode` does, which code paths persist formula results, and why display-only is iCloud-safe.
**Status:** complete
**newInfoRatio:** 0.85 — mostly new; overlaps iteration 1 on the rollup-seeding detail already cited.
**Novelty justification:** First citation of the sync-mode enum, the automatic write-back path, debounce queue, cleanup modal, and the rollup display-only contract.

## Findings

### F2.1 Sync-mode enum and default
```ts
export type ComputedSyncMode = "automatic" | "display-only" | "manual";
```
[SOURCE: src/data/types.ts:111]
Default is `"display-only"` (`DEFAULT_COMPUTED_SYNC_MODE`, src/data/ComputedSync.ts:3), and any unknown YAML value normalizes back to it (`normalizeComputedSyncMode`, ComputedSync.ts:42-45). Parsing happens at both load sites in DataSource.ts:787 and :1056 — a malformed `computedSyncMode` in the Reports `db_view` cannot accidentally enable persistence.

### F2.2 The ONLY persistence path is gated on automatic mode
`syncComputedForFile` returns immediately unless `isAutomaticComputedSync()`; in automatic mode it writes computed results into row frontmatter via `dataSource.updateFrontmatter`:

```ts
if (!config?.schema.computedFields.length || !this.isAutomaticComputedSync()) return;
...
await this.dataSource.updateFrontmatter(file, updates, { sourceInstanceId: this.instanceId });
```
[SOURCE: views/DatabaseView.ts:10238-10244 (guard), :10276-10282 (write)]
With `computedSyncMode: display-only`, this function is a no-op — the exact property REQ-002 needs. Note the write compares stringified old vs new and writes `""` for null (:10268-10271), i.e. even automatic mode would churn notes whenever a rollup changes upstream — strong evidence for keeping the Reports DB display-only on iCloud-synced vaults.

### F2.3 Automatic mode also has a 5-second debounced queue
`scheduleComputedSync` merges pending rows with database-scope dominance and drains after a 5 s timer [SOURCE: DatabaseView.ts:10286-10330; queue coalescing semantics in src/data/ComputedSync.ts:10-40]. Not directly exercised under display-only, but documents how chatty the persistent mode is by design.

### F2.4 Rollups are contractually display-only — never written to frontmatter
Schema doc: "Rollups are display-only derived values and are never written to frontmatter." [SOURCE: src/data/types.ts:69]
Implementation matches: `buildRelationRollups` computes a `valuesByPath` map in memory and returns it; nothing calls updateFrontmatter [SOURCE: src/data/RelationRollup.ts:24-89]. Adding Remaining/Saved as formulas reading these rollups keeps the whole chain write-free.

### F2.5 UI surfaces the mode switch and warns on the dangerous transition
ViewConfigPanelRenderer builds the mode dropdown including `"automatic"` and reacts specifically to `previousMode === "display-only" && nextMode === "automatic"` [SOURCE: views/ViewConfigPanelRenderer.ts:1282-1330]. There is also a cleanup modal that clears previously persisted computed properties from note YAML and force-flips the mode back to display-only while cancelling queued syncs [SOURCE: DatabaseView.ts:5576-5620 (`showComputedFrontmatterCleanupModal`, `clearComputedFrontmatterProperties`)].

### F2.6 Rollup aggregation semantics feed the formulas' inputs
`aggregateRollup` supports `count/list/sum/avg` style aggregations; empty/no-number inputs yield `null` (not 0) after the Bug-T fix that stopped extracting digits from wikilinks and treating `Number("")===0` as a summand [SOURCE: RelationRollup.ts:92-129, comment at :126-128, `toChartNumber` filter]. A rollup-over-rollup is deliberately rejected (`column?.type === "rollup"` returns empty value, :101).
Implication: Income/Expenses rollups may legitimately be `null` on sparse months; Remaining must tolerate `null - null`. The engine coerces null operands through JS (`null` in arithmetic → `null` converts to 0? — actually `field()` returns `undefined` for missing rollups, and `undefined - undefined` throws → caught → blank cell, see F1.7). Formulas should wrap with `IFERROR([Income] - [Expenses], 0)` if a numeric 0 is preferred over blank — a concrete enrichment recommendation.

### F2.7 Storage key indirection for computed columns
Computed cells persist under `getComputedStorageKey(col)` (= `col.computedKey || col.key`) [SOURCE: src/data/ColumnDisplay.ts:50; usage in the automatic write path DatabaseView.ts:10264-10267]. Under display-only this key never reaches disk.

## Ruled out / failed
- Looked for any background process that persists computed or rollup values outside `syncComputedForFile`: grep of `updateFrontmatter` call sites in views/DatabaseView.ts (:5223,:5617,:7942,:8212,:8588,:8810,:9092,:9155,:9219,:10278) shows the rest are user-edit/bulk/cleanup flows, none compute-derived.
- No platform-conditional code around the sync path (no `Platform.isDesktop` gating) — mobile uses the same logic, supporting REQ-005.

## Next-focus input
Q4: exact `db_view` YAML shape (schema.columns/computedFields/rollupConfig/aggregation) and how a Reports-type view is configured — needed to specify the actual config diff.

---

# Iteration 003 — db_view config shape, computed/rollup column schema, EuroFormat integration pattern

**Focus:** Q4 (+Q10 partial) — exact YAML/config surface a Remaining/Saved column lives in; what predecessor 002 must already have changed; how the EuroFormat isolated-module pattern applies (or not).
**Status:** complete
**newInfoRatio:** 0.8
**Novelty justification:** First citations of schema parsing, RollupConfig union limits, computedFields def shape, view types, and the EuroFormat call-site map.

## Findings

### F3.1 A "db_view" is a markdown note whose frontmatter holds the whole database config
Files with `db_view: true` are discovered and parsed into `DatabaseConfig` [SOURCE: src/data/DataSource.ts:421-549 (`scanViewDefinitions`, id backfill), :770-799 parse returning `{id, name, computedSyncMode, summaryFormulas, schema, views, ...}`]. So "add Remaining and Saved on the Reports db_view" = editing that note's YAML `schema.computedFields` (+ optionally `schema.columns`) — exactly the config-only surface spec §3 names.

### F3.2 Computed fields: definition shape
```ts
export interface ComputedFieldDef {
  key: string; label: string; expression: string;
  type: "number" | "text" | "date" | "datetime" | "checkbox";
  expressionSyntax?: "note-database" | "base";
}
```
[SOURCE: src/data/types.ts:102-110]. Remaining/Saved would be two entries with `type: "number"`, native syntax (not `"base"`), expressions like `[Income] - [Expenses]`. Computed columns in `schema.columns` carry `computedKey` pointing at these defs [SOURCE: types.ts:47-54].

### F3.3 Rollup config: aggregation union today is count|sum|avg|list — no MAX/MIN
```ts
aggregation: "count" | "sum" | "avg" | "list";
```
[SOURCE: src/data/types.ts:39-44] and `aggregateRollup` implements only those four [SOURCE: RelationRollup.ts:92-129].
**Consequence for this phase:** plan.md assumes predecessor `002-rollup-aggregation-pack` ships MAX/SUM. SUM exists; MAX does not exist anywhere in rollup land (chart aggregation does have max/min — ChartAggregation union at src/data/types.ts:~424 — but that is charts, not rollups). Either 002 extends `RollupConfig.aggregation` (a TypeScript change outside 003's scope) or Remaining/Saved must be expressed purely over sum/avg/count rollups. This is a concrete predecessor-contract risk to verify before implementation (spec risk table already flags it generically).

### F3.4 View layer reads computed cells through one accessor
Every renderer path resolves computed/rollup cell values via `row.computed[col.computedKey || col.key]` with identical branching [SOURCE: data/CalendarLayoutModel.ts:300-301; CalendarTimelineModel.ts:992-993; ClipboardSerializer.ts:203-204; ColumnDisplay.ts:50-60 helper]. Adding two more computed columns requires zero renderer changes — they flow through the same accessor.

### F3.5 Display formatting hooks exist per column
`ColumnDef.numberDisplayStyle` + `numberDisplayConfig` allow per-column styled numbers [SOURCE: types.ts:63-66]; the fork's EuroFormat module forces Dutch/euro formatting at three call sites: `views/CellRenderer.ts:13,198,2576` and `views/SummaryRenderer.ts:7,556` [SOURCE: src/data/EuroFormat.ts:1-42 header "Kept in one module so it stays a small, rebasable diff"]. The research topic's "isolated-module EuroFormat pattern (new module under src plus 1-3 call-site edits)" is thus real but **does not apply to phase 003 as specced**: no new display behavior is needed if numberDisplayStyle/EuroFormat already cover currency rendering of computed cells. It becomes relevant only if Saved/Remaining need a bespoke format (e.g., percentage-of-income) not expressible via existing styles — then a new isolated module + ≤3 call-site edits is the established rebase-safe recipe.

### F3.6 Config parse is tolerant; unknown keys ignored
Parse builds config from whitelisted keys and warns+returns null on structural failure [SOURCE: DataSource.ts:772-797 catch]. A typo'd formula key degrades to absence rather than corrupting the DB — supports safe rollback (plan §7).

## Ruled out / failed
- No per-viewType formula engine: `viewType` (types.ts:175) selects layout only; evaluation is database-scoped.
- No evidence of a dedicated "Reports" viewType; Reports is presumably a table/chart db_view note named "Reports" in the vault — exact note path remains an inspect-time UNKNOWN per spec.

## Next-focus input
Q5/Q6: AppFlowy Rust grid model + Flutter UI for formula/rollup fields.

---

# Iteration 004 — AppFlowy reference mining (Rust grid model + Flutter UI)

**Focus:** Q5/Q6 — how AppFlowy models derived numeric columns and their UX, citing real paths/lines in the cloned repo.
**Status:** complete
**newInfoRatio:** 0.9
**Novelty justification:** First AppFlowy citations; includes a negative finding that reshapes the parity comparison.

## Findings

### F4.1 NEGATIVE FINDING: this AppFlowy snapshot has no Formula/Rollup field types
The full `FieldType` enum is RichText=0 … Relation=10, Summary=11, Translate=12, Time=13, Media=14 — there is no `Formula` or `Rollup` variant [SOURCE: context/appflowy/frontend/rust-lib/flowy-database2/src/entities/field_entities.rs:427-445]. Greps for "rollup"/"Formula" across `flowy-database2/src` and the Flutter database plugin return no field-type hits. Parity claims about "AppFlowy formulas/rollups" must therefore rest on its two adjacent mechanisms instead:
1. **Footer Calculations** (per-column aggregation), and
2. **Relation cells** storing row ids.

### F4.2 Footer Calculations are a first-class entity with exactly the finance aggregations at issue
```rust
pub enum CalculationType {
  Average = 0, Max = 1, Median = 2, Min = 3, Sum = 4,
  Count = 5, CountEmpty = 6, CountNonEmpty = 7,
}
```
[SOURCE: flowy-database2/src/entities/calculation/calculation_entities.rs:69-78]
Flutter gates availability by field type — Number fields get Sum/Average/Min/Max/Median plus counts [SOURCE: appflowy_flutter/lib/plugins/database/grid/application/calculations/field_type_calc_ext.dart:24-33].
**Parity signal for predecessor 002:** AppFlowy treats Max/Median as table-level column calculations, not cell-level rollups — mirroring the fork's split between `rollupConfig.aggregation` (cell-level, currently count|sum|avg|list) and chart aggregations (max/min exist only in charts). If MAX-on-rollup proves necessary for Saved, AppFlowy's model suggests implementing it as a view/footer calculation rather than widening the rollup union.

### F4.3 Calculations are computed values rendered in a dedicated footer row — never stored in records
The Flutter side keeps calculations in their own bloc/listener/service trio (`application/calculations/*`) and renders them via `grid/presentation/widgets/calculations/` (`calculations_row.dart`, `calculate_cell.dart`, `calculation_selector.dart`, `calculation_type_item.dart`). The Rust entity stores `{fieldId, calculationType, value}` per view [SOURCE: calculation_entities.rs:1-66 struct region]. Nothing writes results back to row data.
**UX pattern worth borrowing:** the value shows alongside a short label of the chosen function (e.g. "Sum 1.234") — `CalculationTypeItem` renders `type.label` from a localized ext map [SOURCE: grid/presentation/widgets/calculations/calculation_type_item.dart:16-30].

### F4.4 Number formatting is a type-option concern, applied at render
Number cells persist raw text (`updateCell → saveCellData(text)` stores the string unchanged) while formatting happens in the type option's `format_cell_data` [SOURCE: appflowy_flutter/lib/plugins/database/application/cell/bloc/number_cell_bloc.dart:44-50; rust-lib flowy-database2/src/services/field/type_options/number_type_option/number_type_option.rs:127-142]. Formats resolve through `collab_database`'s `NumberCellFormat/NumberFormat` [SOURCE: number_type_option/number_type_option_entities.rs:7-10 import].
**Parity signal:** same philosophy as the fork — store raw, format at display (fork's EuroFormat.ts does this at CellRenderer call sites). Remaining/Saved need no storage-format work.

### F4.5 Relation cells store ids; derived reads resolve through metadata
Relation cell changesets carry inserted/removed RowIds [SOURCE: flowy-database2/src/services/field/type_options/relation_type_option/relation_entities.rs:2-5]; the fork's equivalent (wikilinks resolved via `getFirstLinkpathDest`, RelationRollup.ts:70-77) matches this shape conceptually.

## Ruled out / failed
- Searched `rust-lib` and Flutter lib for formula editors/rollup type options: absent in this snapshot (see F4.1). Not retried elsewhere — recorded as a clone-version limitation rather than an AppFlowy capability claim.

## Next-focus input
Q7: Anytype anytype-ts formula implementation.

---

# Iteration 005 — Anytype reference mining (anytype-ts)

**Focus:** Q7 — how Anytype implements view-level formula ("aggregation") columns in TypeScript, with real path:line citations.
**Status:** complete
**newInfoRatio:** 0.9
**Novelty justification:** First Anytype citations; reveals the closest architectural sibling to the fork's display-only computed columns.

## Findings

### F5.1 Formulas are view-scoped config on a relation — never object data
```ts
export interface ViewRelation {
  relationKey: string;
  isVisible?: boolean;
  width?: number;
  includeTime?: boolean;
  formulaType?: I.FormulaType;
  align?: I.BlockHAlign;
  relation?: any;
};
```
[SOURCE: context/anytype-ts/src/ts/interface/block/dataview.ts:150-158]
The `formulaType` lives on the **view's relation entry**, so a formula result exists only inside that view — the exact "display-only computed column" contract phase 003 wants (`computedSyncMode` display-only). No Anytype code path persists formula output into objects.

### F5.2 The formula catalog covers everything Remaining/Saved need
```ts
export enum FormulaType {
  None=0, Count=1, CountValue=2, CountDistinct=3, CountEmpty=4, CountNotEmpty=5,
  PercentEmpty=6, PercentNotEmpty=7,
  MathSum=8, MathAverage=9, MathMedian=10, MathMin=11, MathMax=12, Range=13,
};
export enum FormulaSection { None=0, Count=1, Percent=2, Math=3, Date=4 };
```
[SOURCE: src/ts/interface/block/dataview.ts:104-121]
Options are filtered by relation type via `formulaByType(relationKey, type)` returning `{id, name, short?, section}` entries grouped into sections [SOURCE: src/ts/interface/block/dataview.ts:163-190; consumer menu at src/ts/component/menu/dataview/relation/edit.tsx:234-248 filtering by `section`].

### F5.3 Evaluation is client-side, single-pass, over visible records
`getFormulaResult(subId, viewRelation)` pulls the subscription's records and switches on formulaType [SOURCE: src/ts/lib/dataview.ts:980-1160]:
- `min()`/`max()` filter empty values first and return **null when nothing remains** (:1003-1011) — same null-not-zero semantics as the fork's `aggregateRollup` (Bug-T fix).
- `MathSum` uses `Number(it[key]) || 0`; `MathAverage` divides by `total` including empties (:1116-1120).
- `Range` computes `max() - min()` (:1157-1163) — literally Anytype's built-in "Remaining-like" arithmetic over two aggregates; the fork expresses the same thing as a formula `[Income] - [Expenses]` over two sum-rollups.
- Output goes through `float()` → relation-aware mapping, round-to-3, locale grouping via `U.Common.formatNumber` (:1012-1024).

### F5.4 Rendering: footer cell recomputes on render and pairs label+value
`grid/foot/cell.tsx` resolves the chosen option for the label (`option.short || option.name`), calls `Dataview.getFormulaResult` in `calculate()`, and re-renders when the result changes [SOURCE: src/ts/component/block/dataview/view/grid/foot/cell.tsx:17-63]. This is the UX shape AppFlowy also uses (label + value under each column) — a strong parity signal for how Reports could surface Income/Expenses/Sales/Remaining summaries without any new engine.

### F5.5 Empty-value discipline is explicit everywhere
`filtered(filterEmpty)` special-cases `name`, checkboxes, and array types when counting empties (:1030-1041); date min/max format through `date()` and degrade to `''` (:1140-1155). Anytype never lets an empty operand silently become 0 except where explicitly chosen (`|| 0` in Sum/Average).

## Ruled out / failed
- No expression parser exists in anytype-ts for dataview formulas — they are enum-selected aggregations, not free-form expressions. Free-form formula editing in Anytype lives elsewhere (not in this dataview layer); not pursued since the Reports feature needs exactly this aggregation-over-relation shape.

## Next-focus input
Q8: Notion behavior for rollups-in-formulas and finance templates (web).

---

# Iteration 006 — Notion behavior via web (formulas-on-rollups, aggregations, finance patterns)

**Focus:** Q8 — Notion's authoritative behavior for the capability phase 003 replicates.
**Status:** complete
**newInfoRatio:** 0.75
**Novelty justification:** First external (web-cited) behavior baseline; confirms formula-references-rollup and no-rollup-of-rollups.

## Findings

### F6.1 Notion formulas can reference rollups; the result type follows the rollup config
Property-type table, Rollup row: `prop("Purchases").length()`, `prop("Average cost") * 12` — "Formula Type: Number, date, or list of any type. Depends on rollup configuration." [SOURCE: https://www.notion.com/help/formula-syntax]
This is precisely the fork's Remaining pattern (`[Income] - [Expenses]` where Income/Expenses are sum-rollups): a formula consuming numeric rollup outputs. The fork's multi-pass evaluator (ComputedEvaluator.ts:48) is its equivalent mechanism.

### F6.2 Notion's aggregation catalog matches Anytype/AppFlowy and exceeds the fork's rollup union
Rollup calculations: Show original/unique values, Count all/values/unique/empty/not-empty, Percent empty/not-empty (general); **Sum, Average, Median, Min, Max, Range for Number properties**; Earliest/Latest/Range for dates [SOURCE: https://www.notion.com/help/relations-and-rollups].
Fork gap confirmed from it.3: `rollupConfig.aggregation` has count|sum|avg|list only (types.ts:39-44). Median/Min/Max/Range and percent-of-total are Notion parity gaps that belong to predecessor 002 or later phases — not 003.

### F6.3 Notion explicitly forbids rollup-of-rollup to prevent loops
FAQ: "Can I rollup a rollup? Unfortunately not, as this could create unintended loops." [SOURCE: https://www.notion.com/help/relations-and-rollups]
The fork independently made the same call: `aggregateRollup` returns an empty value when the target column is itself a rollup [SOURCE: RelationRollup.ts:101]. Remaining/Saved must therefore read first-class rollups only — which they do.

### F6.4 Finance-template convention: Savings derived from income via formula
Community/template practice defines Savings Target as `prop("Expected Income") * 0.2`, Needs/Wants budgets as income-percentage formulas, with actuals fed by transaction-database rollups [SOURCE: https://www.grizzlytemplates.com/blog/notion-budget-template]. This validates Saved-as-formula-over-live-inputs as the canonical Notion shape, and suggests offering percentage-based Saved variants (e.g. `[Saved] / [Income]`) once display formats allow.

### F6.5 Rollups are computed property values, not user-typed content
Notion's API returns rollup results under a `rollup` value object computed server-side ("For rollups with an aggregation, the endpoint returns a rollup property value under the `rollup` key") [SOURCE: https://developers.notion.com/reference/retrieve-a-page-property]. Behaviorally this is display-time computation — matching the fork's display-only contract rather than write-back.

### F6.6 Formulas 2.0 compatibility note (cautionary parity tale)
Notion had to auto-convert legacy formulas referencing rollup/person/file/multi-select props to text when types changed in Formulas 2.0 [SOURCE: https://www.notion.com/help/guides/new-formulas-whats-changed]. Lesson for the fork: keep Remaining/Saved typed `number` and coerce inputs at evaluation (fork already does — coerceValue, ComputedField.ts:590) so future type-option changes don't silently change formula output types.

## Ruled out / failed
- notion.com/help/relations-rollups-and-linked-databases → HTTP 404; replaced with /help/relations-and-rollups.
- No official statement found on where Notion stores rollup values internally; F6.5 relies on API docs describing returned computed values (labeled accordingly).

---

# Iteration 007 — Edge cases cross-system synthesis (missing inputs, errors, concurrency, mobile)

**Focus:** Q9 — how each system handles the edge cases spec §8 names, and what phase 003 should therefore pin down.
**Status:** complete
**newInfoRatio:** 0.55
**Novelty justification:** New synthesis linking fork error paths to AppFlowy/Anytype/Notion null semantics; first citation of fork footer-summary capability.

## Findings

### F7.1 Missing/non-numeric rollup input → blank, not 0, in both fork and Anytype
Fork: `aggregateRollup` filters non-numbers to null and returns null when no numbers remain [SOURCE: RelationRollup.ts:126-129]; a formula reading that null via `field()` gets `undefined`, arithmetic throws, evaluator catches → cell renders blank with a console warn on final pass [SOURCE: ComputedEvaluator.ts:51-62].
Anytype: `min()`/`max()` return `null` when every value is empty [SOURCE: anytype-ts/src/ts/lib/dataview.ts:1003-1011]; only Sum/Average deliberately use `|| 0` [SOURCE: dataview.ts:1116-1120].
**Recommendation seed:** document in the db_view config comment that Remaining shows blank for empty months; if a numeric zero is preferred, write `[Income] - [Expenses]` wrapped as `IFERROR([Income] - [Expenses], 0)` — engine-supported today (ComputedField.ts iferror/iferror alias).

### F7.2 Mistyped `[field]` refs fail closed everywhere
Fork: undefined-variable → localized error string, result null, no persistence [SOURCE: ComputedField.ts:508-546]. Anytype/Notion: unknown keys yield null/empty rather than partial data. No system writes derived results on error — REQ-002 holds even in failure modes.

### F7.3 Rollup-of-rollup loops are prevented identically
Fork rejects rollup targets in aggregateRollup (RelationRollup.ts:101); Notion FAQ forbids rolling up rollups due to unintended loops [SOURCE: notion.com/help/relations-and-rollups]. Remaining/Saved are safe because they reference first-class rollups; a future "Remaining of Remaining" should be refused the same way.

### F7.4 Concurrent devices: display-only means nothing to conflict
The only writer (`syncComputedForFile`) is gated off under display-only (DatabaseView.ts:10244); rollups live in an in-memory map rebuilt per refresh (RelationRollup.ts:24-89). Two devices rendering Reports produce zero note mutations — stronger iCloud safety than Notion's server-computed values, which do sync (as computed property values).

### F7.5 Mobile uses the identical evaluation and render path
No platform gating exists anywhere in ComputedField/ComputedEvaluator/RelationRollup; the two Platform checks in DatabaseView.ts concern icon editing and bulk-editor dismissal, not computed cells [SOURCE: grep of src/views/DatabaseView.ts:4648,6848]. CellRenderer's EuroFormat call sites are unconditional (CellRenderer.ts:198,2576) — same euro formatting on mobile. REQ-005 is satisfiable without new code.

### F7.6 The fork already ships footer summaries — relevant boundary
SummaryRenderer supports SUM/AVERAGE/MEDIAN/MIN/MAX/RANGE/STDDEV/COUNT/UNIQUE/EMPTY/FILLED/CHECKED/EARLIEST/LATEST and includes rollup columns whose aggregation is sum/avg in its selectable fields [SOURCE: views/SummaryRenderer.ts:17-33,78-79]. Spec §3 puts "footer summary kinds" out of scope — correct, but the existence matters: column-total questions ("how much did I spend this month?") are already answered by footers, so Remaining/Saved must justify themselves at **row** granularity (per Report/month), which is exactly what formulas give and footers cannot.

## Ruled out / failed
- Searched for mobile-specific computed-cell renderers: none; single renderer path confirmed.

---

# Iteration 008 — UI/UX enrichment (what "Notion parity" should look and feel like)

**Focus:** Q6/Q10 — UX patterns from the three reference systems mapped onto the fork's existing surfaces, plus the fork's own UX affordances.
**Status:** complete
**newInfoRatio:** 0.5
**Novelty justification:** First cross-system UX comparison; identifies label+value footer pattern, grouped formula picker sections, and per-column number style as the parity levers.

## Findings

### F8.1 All three references pair the aggregation with a short human label
Anytype foot cells show `option.short || option.name` next to the value [SOURCE: anytype-ts/src/ts/component/block/dataview/view/grid/foot/cell.tsx:41-42]; AppFlowy renders localized calculation labels via `type.label` [SOURCE: calculations/calculation_type_item.dart:16-30]; Notion names rollup columns descriptively ("Average cost"). For Remaining/Saved this argues for clear column labels ("Remaining", "Saved") rather than formula text as display name — labels live in ComputedFieldDef.label (types.ts:104).

### F8.2 Formula/aggregation pickers group options into named sections
Anytype's `FormulaSection` enum (Count/Percent/Math/Date) drives a sectioned menu [SOURCE: dataview.ts:121-127; menu filter at relation/edit.tsx:248]; AppFlowy's selector is likewise type-filtered (field_type_calc_ext.dart:9-35). The fork's config is raw YAML, so its "picker" is documentation: keep formulas in the Excel-style dialect users already know (`[Income] - [Expenses]`), which matches Notion's own examples (`prop("Average cost") * 12`).

### F8.3 Number presentation: store raw, format at render — already uniform in the fork
AppFlowy saves cell text raw and formats via type options (number_cell_bloc.dart:44-50; number_type_option.rs:127-142); Anytype rounds to 3 decimals + locale grouping inside `float()` (dataview.ts:1012-1024); the fork formats at CellRenderer with EuroFormat and supports per-column numberDisplayStyle (types.ts:63-66; EuroFormat.ts:1-42). Remaining/Saved get euro formatting for free on both desktop and mobile.

### F8.4 Notion-style finance layouts suggest two extra display affordances (future, out of 003 scope)
Templates pair absolute savings with percentage-of-income formulas (`prop("Expected Income") * 0.2`) [SOURCE: grizzlytemplates.com/blog/notion-budget-template]. A percentage Saved variant needs only another computed column today (e.g. `[Saved] / [Income]`), but percent formatting would want either TEXT() with `%` format (engine supports: formatExcelNumber percent branch, ComputedField.ts:640-660) or a future percent numberDisplayStyle. Record as follow-up, not scope creep.

### F8.5 Error visibility is the one UX gap worth closing cheaply
Fork errors surface only as console.warn (ComputedEvaluator.ts:52-54) — blank cells are silent. Notion shows formula errors inline; AppFlowy marks invalid states. A minimal enrichment within phase rules: none (no code changes allowed) — instead the db_view comment block should document expected blanks and the IFERROR idiom, and verification should screenshot a deliberately-broken ref to capture fail-closed behavior before fixing it. This keeps REQ-003 intact while making errors legible during setup.

### F8.6 Column ordering/visibility completes the finance reading pattern
Reports should read Income → Expenses → Remaining → Saved left-to-right; column order is schema.columns order in YAML (parse preserves order, DataSource.ts:773+). Zero code impact; pure config ergonomics aligned with how Notion templates order their budget columns.

---

# Iteration 009 — Fork integration & safety recipe (config diff shape, negative controls, predecessor contract)

**Focus:** Q4/Q9 deepening — what the actual phase-003 change looks like, how to prove each acceptance criterion, and the one open contract risk.
**Status:** complete
**newInfoRatio:** 0.45
**Novelty justification:** First concrete config-diff sketch and objective verification mapping; consolidates prior citations into an implementable recipe.

## Findings

### F9.1 The entire phase fits a two-entry computedFields addition
Reports db_view note frontmatter gains (shape per types.ts:102-110, parsed at DataSource.ts:787/1059):
```yaml
computedSyncMode: display-only          # already the default; keep explicit
schema:
  computedFields:
    - key: remaining
      label: Remaining
      expression: "[Income] - [Expenses]"
      type: number
    - key: saved
      label: Saved
      expression: "<from inspect; e.g. IFERROR([Income] - [Expenses] - [Sales], ...)>"
      type: number
```
plus matching `type: computed` columns with `computedKey: remaining|saved` in `schema.columns` if the view needs explicit width/order/display config. Evaluation order does not matter — multi-pass converges (ComputedEvaluator.ts:48).

### F9.2 Objective proof plan maps 1:1 onto existing code facts
- SC-001/Scenario 1: row with Income rollup 1000, Expenses 400 → Remaining cell shows 600. Engine path: normalizeFormula → field() → rollup branch of getFieldValue (ComputedField.ts:549,557).
- REQ-002/Scenario 3: hash Report note bytes before/after opening+scrolling on desktop and mobile; must be identical because the only writer is gated at DatabaseView.ts:10244 and mode normalizes to display-only (ComputedSync.ts:42-45).
- REQ-003/Scenario 4: fork TypeScript untouched by construction (no code change); verify with `git status --porcelain` scoped to src/data+src/views showing no entries.
- Negative control: temporarily set one formula to `[Incme] - [Expenses]`, confirm blank cell + no file writes, then restore (fail-closed contract, ComputedField.ts:508-546).

### F9.3 The Saved formula's UNKNOWN resolves to a small decision tree at inspect time
Inputs available as live rollup columns after predecessors (per spec): Income, Expenses, Sales. Candidate definitions grounded in engine capability:
1. `Saved = [Income] - [Expenses]` (identical to Remaining → then differentiate: Saved should exclude reinvested Sales)
2. `Saved = [Income] - [Expenses] - [Sales]` if Sales means "spent from income"
3. Percentage variant later: `[Saved] / [Income]` (engine supports division; percent formatting via TEXT or future style)
Pick by reading the Reports intent columns that actually exist post-predecessors; every option is display-only and engine-native.

### F9.4 Predecessor-002 MAX gap: three resolutions, ranked
The plan assumes MAX/SUM aggregations exist for rollups (types.ts:39-44 has sum but not max). Options:
- **A (recommended): proceed without MAX.** Remaining/Saved need only SUM rollups over relation targets — fully supported today. Note the gap for 002 rather than blocking 003.
- B: have 002 extend `RollupConfig.aggregation` with max/min/median (TypeScript change; breaks 003's zero-code property only if done inside 003 — it must not be).
- C: emulate MAX via footer summary (SummaryRenderer supports MAX over rollup-sum columns, SummaryRenderer.ts:33,78-79) if any future Saved variant truly needs it — view-level, still no schema/engine change.

### F9.5 Rollback is trivial and provable
Remove the two computedFields entries + columns and restore the saved db_view copy (plan §7). Nothing else can hold state: no storage keys hit disk under display-only (F2.2/F2.7), rollups are memory-only (RelationRollup.ts:24-89). A stray persisted key would only exist if someone had switched automatic mode earlier — detectable via ComputedFrontmatterCleanupOptions flow (DatabaseView.ts:5576+).

### F9.6 EuroFormat-pattern verdict (research-topic directive)
The isolated-module + ≤3-call-site pattern is confirmed real (EuroFormat.ts; CellRenderer.ts:13,198,2576; SummaryRenderer.ts:7,556) but **must not be used in phase 003**: spec §3 explicitly excludes new src modules, and no rendering gap exists (numberDisplayStyle + EuroFormat already format computed number cells through CellRenderer.ts:2576). Keep the pattern in reserve for any future percent/currency-style column that outgrows existing styles.

---

# Iteration 010 — Ranked enrichment assembly and residual gaps

**Focus:** Q10 — consolidate all evidence into the ranked recommendation set (fed to synthesis), verify question coverage, name what remains UNKNOWN.
**Status:** complete
**newInfoRatio:** 0.35
**Novelty justification:** New: coverage audit, ranking rationale, and explicit unknowns; no new source facts required.

## Question-coverage audit

| Q | Status | Anchor |
|---|--------|--------|
| Q1 engine | answered | it.1 |
| Q2 sync/write-back | answered | it.2 |
| Q3 rollups/aggregation | answered | it.2/it.3 |
| Q4 db_view config | answered | it.3/it.9 |
| Q5 AppFlowy Rust | answered-with-limitation | it.4 (no formula field type in snapshot) |
| Q6 AppFlowy UI | answered | it.4/it.8 |
| Q7 Anytype | answered | it.5 |
| Q8 Notion | answered | it.6 |
| Q9 edge cases | answered | it.7/it.9 |
| Q10 ranking | this iteration | → synthesis |

## Ranked enrichment recommendations (draft for synthesis; full rationale in research.md)

1. **Ship Remaining + Saved as two display-only computedFields** — engine-proven (it.1), zero-code, Notion-parity shape (it.6).
2. **Pin Saved's definition via a 3-way decision at inspect time** — it.9 F9.4/F9.3.
3. **Resolve predecessor-002 MAX gap by proceeding with SUM-only** — it.9 F9.4 option A.
4. **Encode the verification recipe as negative controls** — it.9 F9.2.
5. **Document blank-vs-zero semantics and IFERROR idiom in the config comment** — it.7 F7.1.
6. **Order columns Income→Expenses→Remaining→Saved; label clearly** — it.8 F8.6/F8.1.
7. **Defer (do not do): percent style, MAX/Median rollups, LET, EuroFormat module reuse** — it.8 F8.4, it.3 F3.3, spec out-of-scope.

## Residual UNKNOWNs (honest gaps)

- Exact Reports db_view note path and current column ids — inspect-time per spec.
- Whether predecessor 001 shipped column names exactly `Income`/`Expenses`/`Sales` — formulas must match live labels exactly (getFieldValue matches label or key, ComputedField.ts:559).
- AppFlowy snapshot lacks formula field types entirely; parity claims about AppFlowy formulas would need a newer clone or upstream docs beyond this repo.
- Where "Sales" fits the vault's finance intent (affects Saved formula choice) — user decision.

## Convergence telemetry (informational only; stop policy is max-iterations)
newInfoRatio trend: 1.00, 0.85, 0.80, 0.90, 0.90, 0.75, 0.55, 0.50, 0.45, 0.35 — declining as expected; loop continued per operator instruction, broadening into UX/synthesis angles rather than early synthesis.

---
