# Deep Research: Rollup Aggregation Pack

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `ox-alpha-cline`. Stop reason: max_iterations. Average newInfoRatio: 0.700.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 001 — Fork call-site inventory and gap analysis

**Focus:** Map exactly what the three fork call sites implement today, with file:line evidence, and derive the precise gap vs the Notion rollup aggregation set.

## Findings

### F1.1 Rollup columns support only 4 kinds, typed narrowly
`data/types.ts:44` — `aggregation: "count" | "sum" | "avg" | "list"` inside `RollupConfig` (interface at `data/types.ts:39`, attached to columns via `rollupConfig?` at `:70`). The union type is the single point that must grow for the new kinds; widening it is a one-line type change but every consumer switch must be audited.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/types.ts:39-70]

### F1.2 Rollup dispatch is centralized in one function — good seam for Aggregate.ts
`data/RelationRollup.ts:100-137` (`aggregateRollup`):
- `count` → `records.length` (:101).
- Rollup-of-rollup guard: target column of type `"rollup"` → `emptyRollupValue(aggregation)` (:103-104). This is REQ-003's existing mechanism; it must be preserved byte-for-byte.
- Value flattening (:105-111): arrays flattened, null/"" dropped — non-empty extraction already exists.
- `list` dedupe by `stringifyValue` key (:113-123).
- Numeric path (:125-133): maps through `toChartNumber` then filters nulls (a deliberate bug fix per the in-file comment: never scrape digits from strings like wikilinks), returns `null` when no numbers; `avg = sum/n`; otherwise sum.
- Empty fallback `emptyRollupValue` (:155-161): count→0, list→[], else null.

Key enrichment signal: numeric coercion is **already shared** via `toChartNumber` (imported from ChartAggregation at `RelationRollup.ts:4`), so the fork already has a precedent for cross-module sharing of aggregation primitives.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/RelationRollup.ts:100-137,155-161]

### F1.3 SummaryRenderer implements ~15 kinds privately — duplicated math
`views/SummaryRenderer.ts:11-14` defines `SummaryKind` = SUM|AVERAGE|MEDIAN|MIN|MAX|RANGE|STDDEV|COUNT|UNIQUE|EMPTY|FILLED|CHECKED|UNCHECKED|EARLIEST|LATEST.
- `calculateSummary` (:437-470): min/max via spread `Math.min(...numbers)`; median via private helper `median()` sorting a copy and averaging middle pair for even length (:592-597); stddev population formula (:599-603); earliest/latest via date timestamps `Math.min(...dates)` → `new Date(...)` (:467-468); range tries numbers first then dates (:469-472).
- Date parsing unified on `toDateTimestamp` local-wall-time (:572-575) with an explicit comment that this matches sort ordering and avoids UTC off-by-one from `Date.parse`.
- Number formatting routes through `formatEuroNumber2` (:556) — the EuroFormat module precedent.
- Kind availability per column type: `getSummaryKindsForColumn` (:77-84) — numeric cols get SUM..STDDEV; date-like get EARLIEST/LATEST/RANGE; checkbox gets CHECKED/UNCHECKED; all get COUNT/UNIQUE/EMPTY/FILLED.

Enrichment: median even-length semantics (mean of middle two) are already the fork's convention here — Aggregate.ts must match to avoid SC-002 drift.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/SummaryRenderer.ts:11-14,77-84,437-472,592-603]

### F1.4 ChartAggregation is the most complete aggregator — single-pass accumulator
`data/ChartAggregation.ts`:
- `toChartNumber` (:191-197): finite-number passthrough; numeric-string parse; else null. This is the fork's canonical numeric coercion.
- `ChartStat` accumulator (`emptyStat` :740-756) collects groupCount, numericCount, numericValues[], sum, min, max, unique set, emptyCount, notEmptyCount, checked/unchecked counts **in one pass** over rows — direct evidence NFR-P01 (single-pass) is achievable and idiomatic in this codebase.
- `getStatValue` (:776-796) maps aggregation name → computed stat, including `median` (via `getMedianValue`), `range` (max-min with 0 when either bound missing), `percent-empty`/`percent-not-empty` as `(count/groupCount)*100` guarded against divide-by-zero, `percent-checked`.

Enrichment: percent conventions in the fork are 0–100 floats, not 0–1 fractions; Aggregate.ts should return the same scale or the call sites will render wrong magnitudes.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ChartAggregation.ts:191-197,740-756,776-796]

### F1.5 Gap matrix vs Notion's rollup calculations
Notion exposes per-relation rollups: Original, Count all / Count values / Count unique / Count empty / Count not empty / Percent empty / Percent not empty, plus per-target-property calcs (Show original, Show unique, Show empty/not-empty, Percent checked etc., Sum/Median/Min/Max/Range/Average for numbers, Earliest/Latest/Date range/% empty-% not empty for dates, Checked/Unchecked/% checked for checkboxes). Verified in iteration 005 (Notion web).

| Notion calc | Rollup col today | Footer today | Chart today |
|---|---|---|---|
| count all/values | count ✅ | COUNT/FILLED ✅ | count ✅ |
| count unique | ❌ | UNIQUE ✅ | unique ✅ |
| count empty/not-empty | ❌ | EMPTY/FILLED ✅ | empty/not-empty ✅ |
| percent empty/not-empty | ❌ | ❌ | percent-empty/-not-empty ✅ |
| sum/avg | ✅ | SUM/AVERAGE ✅ | ✅ |
| median | ❌ | MEDIAN ✅ | median ✅ |
| min/max/range | ❌ | MIN/MAX/RANGE ✅ | ✅ |
| earliest/latest | ❌ | EARLIEST/LATEST ✅ | ❌ (date group only) |
| checked/unchecked/%checked | ❌ | CHECKED/UNCHECKED ✅ | ✅ |

The spec's Aggregate.ts set (min,max,median,range,earliest,latest,percentEmpty,percentFilled) closes the rollup-column gaps; footers/charts contribute existing implementations to be deduplicated into shared math (REQ-005/006). Note two kinds the spec does NOT list but parity research suggests considering later: count-unique and percent-checked — out of scope now but the Aggregate.ts API shape should not preclude them.

## Ruled out
- Adding new kinds directly inside `aggregateRollup` without a shared module: rejected — repeats the three-way duplication the spec exists to remove (spec Risk table).
- Changing `toChartNumber` semantics: rejected — its strictness is a recorded bug fix; reuse as-is.

## Next Focus
AppFlowy Rust grid model: how flowy-database2 implements aggregations natively.

---

# Iteration 002 — AppFlowy Rust grid model: aggregation implementation

**Focus:** How `flowy-database2` implements aggregation math natively, as design evidence for Aggregate.ts.

## Findings

### F2.1 Aggregations live in a dedicated, isolated service module
`calculations/service.rs` is a stateless struct (`CalculationsService`) with one public entry `calculate(field, calculation_type, cells)` that dispatches on a typed enum to per-kind private functions. This mirrors the spec's plan: one pure math module, dispatch at the edge.
- Dispatch match: [SOURCE: context/appflowy/frontend/rust-lib/flowy-database2/src/services/calculations/service.rs:12-26]

### F2.2 Numeric extraction is delegated to the field-type layer
All numeric kinds funnel through `reduce_values_f64` (:120-129) which uses `TypeOptionCellExt::new(field, None).get_type_option_cell_data_handler()` and `handler.handle_numeric_cell(cell)`. Empty/non-empty detection likewise delegates to `handler.handle_is_empty(cell, field)` (:92-118). Lesson for the fork: **coercion rules belong to the column type**, not to each aggregation — Aggregate.ts should accept a coercer or reuse `toChartNumber`, but must not re-implement parsing per kind.

[SOURCE: context/appflowy/frontend/rust-lib/flowy-database2/src/services/calculations/service.rs:92-129]

### F2.3 Median semantics match the fork's footer convention
`fn median(array: &[f64])` (:131-139): even length → `(array[len/2 - 1] + array[len/2]) / 2.0`; odd → middle element. Identical to SummaryRenderer's `median()` (`views/SummaryRenderer.ts:592-597`) and Anytype's MathMedian (see F4.x). Three-way agreement confirms the even-length convention in spec Edge Cases.

### F2.4 Empty-input semantics: empty string result, never NaN or zero
Every numeric function returns `String::new()` when there are no values (average :29-41, median :43-52, min/max :54-68, sum :70-79). Count of all cells counts raw cells including empties (:81-84); count-empty/count-non-empty use the type handler (:86-99). This matches the fork's `null`/`""` returns rather than 0.

### F2.5 The supported set is exactly 8 — AppFlowy has NO rollups and NO date aggregations
`enum CalculationType` in `entities/calculation/calculation_entities.rs:69-79`: Average=0, Max=1, Median=2, Min=3, Sum=4, Count=5, CountEmpty=6, CountNonEmpty=7. There is no earliest/latest, no range, no percent, and no relation-rollup feature anywhere under flowy-database2 (repo-wide search for "rollup" in flowy-database2 returns nothing). Consequence: **AppFlowy cannot serve as parity evidence for earliest/latest/range/percent; it only corroborates min/max/median/sum/avg/empty-counts.** Notion and Anytype are the parity anchors for those.

### F2.6 Parallelism is a service detail, not a semantic one
Rayon `par_iter` used throughout (e.g., :31, :46) — an implementation choice irrelevant to the fork's single-threaded renderer, but the *reduce* shape `(sum,len)` pairs show single-pass foldability of sum+count stats, same as ChartStat.

## Ruled out
- Modeling Aggregate.ts as a class with per-field handlers (AppFlowy style): overkill for the fork's three call sites; plain pure functions match EuroFormat precedent.

## Next Focus
AppFlowy Flutter UI: how users select calculations and how results render.

---

# Iteration 003 — AppFlowy Flutter UI: calculation selection and rendering

**Focus:** UI affordances for picking aggregations per column, as evidence for the fork's footer/rollup UX.

## Findings

### F3.1 Per-field-type menu filtering is an extension function
`grid/application/calculations/field_type_calc_ext.dart:4-31` — `calculationsForFieldType()` returns Count always; CountEmpty/CountNonEmpty unless the field type "cannot be empty or might hold secondary data" (URL, Checkbox, LastEditedTime, CreatedTime); numeric pack (Sum/Average/Min/Max/Median) only for `FieldType.Number`.
This is exactly the fork's existing `getSummaryKindsForColumn(config, col)` pattern (`views/SummaryRenderer.ts:77-84`). Enrichment: when Aggregate.ts adds kinds to rollup columns, the rollup-column kind menu should be filtered by the **target field's type** (numeric target → min/max/median/range; date target → earliest/latest/range), not by the relation itself. Neither AppFlowy nor the fork currently does this for rollups — it is a concrete UX improvement to carry into the build.

[SOURCE: context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/application/calculations/field_type_calc_ext.dart:4-31]

### F3.2 Hover-reveal "Calculate" affordance
`grid/presentation/widgets/calculations/calculation_selector.dart:33-58` renders a hint button ("Calculate" + dropdown arrow) whose opacity animates from 0 → visible on hover or when selected. The fork's `addSummaryEntryHint` (`views/SummaryRenderer.ts`) already implements the equivalent faded entry hint — parity confirmed, no change needed.

### F3.3 Labels are i18n keys with short variants
`application/calculations/calculation_type_ext.dart:5-36` maps each CalculationType to locale labels plus `shortLabel` overrides for count-empty/count-non-empty (used in narrow cells). Enrichment for the fork: new rollup kinds need i18n entries in `i18n.ts`; short labels matter because rollup values render inside table cells (narrow), unlike footers.

### F3.4 Numeric rendering fixed at 2 decimals — differs from fork convention
AppFlowy Rust formats all numeric aggregates `{:.2}` (service.rs :37,50,60,70). The fork instead routes through `formatEuroNumber2` (`SummaryRenderer.ts:556`, EuroFormat.ts) with up-to-2-fraction grouped formatting and `-` for non-finite. Decision evidence: keep the fork's EuroFormat pipeline; do not copy AppFlowy's fixed 2-decimal style. This also confirms Aggregate.ts should return raw numbers and leave formatting to call sites (matches plan.md API sketch).

### F3.5 Selection flow: choose field first, then type, per footer cell
`grid/presentation/widgets/calculations/calculate_cell.dart:72-110`: prefix label from field type (:203+), then menu of types filtered by `calculationsForFieldType()`; selecting dispatches `updateCalculationType`. The fork's two-step menu (`openSummaryFieldMenu` → `openSummaryAggregationMenu`, SummaryRenderer.ts) matches this shape.

## Ruled out
- Copying AppFlowy's bloc/service listener architecture: the fork's derived-value render pass (buildRelationRollups → views) is simpler and display-only by construction.

## Next Focus
Anytype ts: full Notion-grade formula set including earliest/latest/range/percents.

---

# Iteration 004 — Anytype ts: the closest Notion-parity reference implementation

**Focus:** Anytype's dataview "formula" system (its name for footer/rollup aggregations) — full kind set, per-type menus, and edge-case semantics in TypeScript.

## Findings

### F4.1 The enum is a near-exact Notion aggregation list
`src/ts/interface/block/dataview.ts:104-119`: `FormulaType` = None, Count(1), CountValue(2), CountDistinct(3), CountEmpty(4), CountNotEmpty(5), PercentEmpty(6), PercentNotEmpty(7), MathSum(8), MathAverage(9), MathMedian(10), MathMin(11), MathMax(12), Range(13). Plus `FormulaSection` (:121-127) grouping menu entries into Count / Percent / Math / Date sections — a UX detail worth borrowing for the fork's aggregation dropdowns.

[SOURCE: context/anytype-ts/src/ts/interface/block/dataview.ts:104-127]

### F4.2 Per-type menu composition with skip-lists
`src/ts/lib/relation.ts:160-230+` (`formulaByType`): common set (count family + percents) for every type; Date gets MathMin/MathMax labeled as date min/max ("Earliest/Latest" semantics) plus Range; Checkbox gets its own reduced set (no math); Number gets Sum/Average/Median/Min/Max/Range. Empty-count and unique-count options are skipped for specific system keys (`skipEmptyKeys`, `skipUnique`). This is the strongest available open-source model for "which aggregations apply to which target column type" — directly applicable to rollup-column menu filtering by target field type.

### F4.3 Single dispatch function, per-kind semantics with explicit edge handling
`src/ts/lib/dataview.ts:977-1183` (`getFormulaResult(subId, viewRelation)`):
- min/max helpers (:1000-1006): map values, `filter(!Relation.isEmpty)`, empty→null; note `Number(it || 0)` coercion — **Anytype treats null-as-0 inside min/max**, which contradicts the fork's rule (nulls skipped, spec Edge Cases) and is flagged as an anti-pattern NOT to copy.
- PercentEmpty/PercentNotEmpty (:1104-1113): `(filtered(true|false).length / total * 100)` with `%` appended at render. Confirms 0–100 scale and that percent base = total rows including empties.
- MathAverage (:1119): sum/total — divides by ALL rows (including empty), unlike AppFlowy which divides by non-empty count (`service.rs:29-41`) and unlike the fork's footers (`SummaryRenderer.ts:441`, numbers.length after filter). Fork should keep its divide-by-non-empty semantics; divergence documented.
- MathMedian (:1124-1137): sorts copy of numeric array; odd → middle; even → mean of middle two; coerces `Number(x)||0` (again null→0 — anti-pattern).
- Date rendering for min/max (:1140-1159): when relation is a date, min/max results render through the same `date()` formatter used for cells (:995-999), honoring includeTime and relative-date settings.
- Range (:1160-1167): numbers → max−min formatted; **dates → duration string** via `U.Date.duration(max−min())` — Notion's "Date range" shows e.g. "Mar 3, 2026 → Mar 9, 2026"; Anytype shows a duration instead. The fork's footer RANGE already does number-range then date-range-ms fallback (`SummaryRenderer.ts:469-472`) and formats ≥1-day ms spans as "Nd" (:556-559). Aggregate.ts range() on dates must decide: ms delta (fork convention, simple) vs start→end pair display (Notion convention). Recommendation recorded in synthesis.

### F4.4 CountValue vs CountDistinct distinction
(:1051-1102): CountValue counts rows whose value-set differs (dates normalized to formatted day string first); CountDistinct counts distinct leaf values across arrays. For Aggregate.ts this validates keeping dedupe keyed on `stringifyValue` like RelationRollup's list path (`RelationRollup.ts:113-123`).

## Ruled out
- Copying Anytype's null-coerces-to-zero behavior: violates spec REQ/edge rules ("Null/undefined cells are skipped, not treated as zero") and would corrupt median/min.
- Duration-string date range in v1: fork convention (ms → "Nd") already shipped in footers; changing it belongs to a formatting decision, not the math module.

## Next Focus
Notion's live behavior via web: authoritative calc list, rollup restrictions, display options.

---

# Iteration 005 — Notion behavior via web (authoritative parity anchor)

**Focus:** The exact Notion rollup calculation set, restrictions, and configuration surface, from Notion's own help center.

## Findings

### F5.1 The complete official rollup type list
From `Database relations & rollups in Notion` (fetched 2026-08-24):
- **Universal:** `Show original`, `Show unique values`, `Count all`, `Count values`, `Count unique values`, `Count empty`, `Count not empty`, `Percent empty`, `Percent not empty`.
- **Number-property only:** `Sum`, `Average`, `Median`, `Min`, `Max`, `Range` (Max − Min).
- **Date-property only:** `Earliest date`, `Latest date`, `Date range` (span between latest and earliest).

[SOURCE: https://www.notion.com/help/relations-and-rollups]

### F5.2 Rollup configuration includes formatting, not just math
The rollup cell menu asks for: relation property → target property → calculation → **number format** → **decimal point placement**. Enrichment: the fork's `RollupConfig` (`data/types.ts:39-44`) has no display-format slot; numeric kinds added to rollup columns will render through whatever the column pipeline does today. A minimal parity move is to reuse the fork's existing NumberDisplay/EuroFormat path rather than adding a new format config field (keeps rebase-safe scope).

### F5.3 Restrictions that confirm spec decisions
- **Rollup of rollup is impossible in Notion**: "Unfortunately not, as this could create unintended loops." The fork's guard (`RelationRollup.ts:103-104`) is therefore exactly right and must be preserved.
- **Sorting works only on numeric rollup output** — relevant later if the fork adds view-sort over rollup columns.
- Footers can aggregate *over* rollup columns ("Aggregate rollups" section) — the fork already allows this since SummaryRenderer treats rollup columns as numeric when count/sum/avg (`isNumericSummaryColumn`, SummaryRenderer.ts:65-72). Enrichment: after adding min/max/median/range rollup kinds, those should also qualify as numeric summary columns.

[SOURCE: https://www.notion.com/help/relations-and-rollups]

### F5.4 Checkbox rollups
Notion's current help page no longer enumerates checkbox-specific rollups in the main list; community references (aNotioneer) document Checked/Unchecked/Percent-checked behavior historically. The spec's optional percent pack covers percentEmpty/Filled only — checkbox percent stays out of scope, consistent with REQ-001.

### F5.5 Percent semantics
Notion's Percent empty/not empty is computed over all related pages (denominator = related-page count), rendered as a percentage. Matches Anytype's `(count/total*100)+'%'` (dataview.ts:1104-1113) and ChartAggregation's `(emptyCount/groupCount)*100` (ChartAggregation.ts:788-789). Three-way agreement: denominator = total rows, not non-empty rows.

## Ruled out
- Adding "Show original"/"Show unique values" as rollup kinds: spec Out of Scope ("the relation column already displays originals").
- Number-format config on RollupConfig: deferred; out of minimal rebase-safe scope.

## Next Focus
Core algorithm semantics matrix for Aggregate.ts (empty/mixed inputs, even median, percent base, date parsing).

---

# Iteration 006 — Core algorithm semantics matrix for Aggregate.ts

**Focus:** Lock per-kind semantics for min/max/median/range/earliest/latest/percentEmpty/percentFilled, reconciling fork convention with AppFlowy/Anytype/Notion evidence. Analytical iteration; evidence already gathered.

## Findings

### F6.1 The semantic matrix (locked recommendation)

| Kind | Input filter | Empty input → | Semantics | Evidence |
|---|---|---|---|---|
| `min`/`max` | `toChartNumber` non-null | `null` | finite compare; never treat null as 0 | ChartAggregation.ts:191-197; spec Edge Cases; Anytype's null→0 rejected (dataview.ts:1000-1006) |
| `median` | same | `null` | sort copy ascending; odd→middle; even→mean of middle two | SummaryRenderer.ts:592-597 ≡ AppFlowy service.rs:131-139 ≡ Anytype dataview.ts:1124-1137 (three-way agreement) |
| `range` | numeric first | `null` when <2 distinct bounds… see F6.2 | max−min; date inputs → ms delta via `toDateTimestamp` | Notion "Range = Max − Min"; fork footer fallback SummaryRenderer.ts:469-472 |
| `earliest`/`latest` | `toDateTimestamp` non-null (DateTimeFormat.ts:203-218) | `null` | Math.min/max over timestamps; return Date or timestamp in the call site's existing format | SummaryRenderer.ts:467-468 pattern; local-wall-time comment :572-575 avoids UTC off-by-one |
| `percentEmpty` | all values incl. empty | `0` on zero rows (guard div-by-zero) | emptyCount/totalCount × 100, 0–100 scale | ChartAggregation.ts:788-789 ≡ Anytype dataview.ts:1104-1113 ≡ Notion help |
| `percentFilled` | complement | `0` | 100 − percentEmpty (or symmetric count) | same |

### F6.2 One real divergence to decide: range on single value
Fork chart `range` returns **0** when either bound is null (`stat.min == null || stat.max == null ? 0`, ChartAggregation.ts:784). But a single-value column has min=max=x; Notion Range would show 0 — consistent. Empty column: chart shows 0, footer returns "" (:469-472 falls through to ""). Recommendation: Aggregate.ts `range` returns `null` for empty input and `0` for single value; call sites map null to their existing empty rendering (""). This preserves both current behaviors while giving rollup columns a defined empty state.

### F6.3 Mixed-type rule is uniform: coerce, drop nulls, aggregate survivors
Numeric kinds skip non-numerics (spec Edge Cases "non-numeric cells skipped" — matches `toChartNumber` returning null for non-parsables). Date kinds skip invalid dates (`toDateTimestamp` null). No kind treats a skipped value as zero — explicitly contradicts Anytype's `Number(it || 0)`.

### F6.4 Percent denominator locked
Denominator = total related values (including empties), not non-empty count. Note the contrast with average: average divides by **non-empty count** in both the fork (SummaryRenderer.ts:441, RelationRollup sum/n where n = numbers.length :125-133) and AppFlowy (service.rs:29-41); Anytype's divide-by-total is the outlier and was rejected. Aggregate.ts must not conflate these two denominators.

### F6.5 Determinism + single-pass feasibility
All recommended kinds are foldable into one pass collecting `{min,max,sum,count,values?}` like ChartStat (ChartAggregation.ts:740-756) except median which needs the value array (or two-pass selection). Given relation fan-out sizes in an Obsidian vault (tens–hundreds), keeping the full numeric array per cell (as ChartStat.numericValues does) is acceptable; NFR-P01's "single-pass over the value array" is satisfied by construction since values are extracted once.

## Ruled out
- Returning formatted strings from Aggregate.ts: formatting stays at call sites (EuroFormat pipeline); plan.md API sketch agrees.
- Nearest-rank median (lower median): breaks three-way agreement with existing footers/charts.

## Next Focus
Integration design: dispatch shape, type widening, rebase safety on the EuroFormat model.

---

# Iteration 007 — Integration design: Aggregate.ts on the EuroFormat model, and the hidden fourth/fifth call sites

**Focus:** Concrete integration shape for the new module; audit every place that branches on rollup aggregation kinds (found two beyond the spec's three).

## Findings

### F7.1 EuroFormat precedent decoded
`data/EuroFormat.ts` is 40 lines: module-level pure functions, no plugin state, a header comment stating the intent ("Kept in one module so it stays a small, rebasable diff"), consumed by import at `SummaryRenderer.ts:7` (`formatEuroNumber2`). The pattern's rebase safety comes from: (a) new file = zero upstream conflict surface; (b) call sites change only import lines + one-line dispatch swaps. Aggregate.ts should copy this shape exactly.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/EuroFormat.ts:1-9]

### F7.2 The kind-eligibility branch is duplicated in FIVE places, not three
Beyond the spec's named trio, these sites hard-code the numeric-kind list `count|sum|avg` for rollup columns:
- `data/RowPipeline.ts:142-148` (`withComputedResultTypes`): maps rollup column → effective type "number" vs "text". A median/min/max/range/percent rollup would be typed "text" → wrong rendering/search bucket.
- `data/ColumnDisplay.ts:17-23` (`getColumnDisplayType`): same numeric test for display type.
- `views/SummaryRenderer.ts:76-80` (`isNumericSummaryColumn`).
- `data/ChartAggregation.ts:100-106` (`isChartNumberGroupColumn`).
Enrichment (high value): extract one predicate into Aggregate.ts — e.g. `isNumericRollupKind(aggregation)` and later `rollupKindsForTargetType(targetType)` — and have all five sites consume it. This turns five divergent copies of the eligibility rule into one shared definition, directly serving spec Risk "behavior drift across call sites", while keeping each edit to ~3 lines. It also makes the new kinds automatically eligible as numeric everywhere (Notion sorts/filters numeric rollups; footer-over-rollup aggregation per Notion's "Aggregate rollups" section).

### F7.3 Dispatch sketch grounded in existing seams
- `types.ts:44`: widen to `"count" | "sum" | "avg" | "list" | "min" | "max" | "median" | "range" | "earliest" | "latest"` (+ optional `"percent-empty" | "percent-filled"`). One line.
- `RelationRollup.ts` `aggregateRollup` (:100-137): after the existing numbers extraction (:125-129), replace the sum/avg tail with a switch delegating min/max/median/range to Aggregate.ts using the already-extracted `numbers`; date kinds need a parallel date extraction via `toDateTimestamp` on the same flattened `values`. count/list untouched; rollup-of-rollup guard untouched.
- `SummaryRenderer.ts` `calculateSummary` (:437-472): swap private median/min/max/range/date-min/max bodies for Aggregate calls (behavior-identical per iteration-006 matrix); keep custom-formula preemption.
- `ChartAggregation.ts` `getStatValue` (:776-796) + `getMedianValue` (:873-881): route through Aggregate; note chart median returns **0** on empty while footers return "" — Aggregate returns null and getStatValue keeps its `?? 0` mapping at the edge so chart behavior is unchanged.

### F7.4 Settings/UI config surface must list new kinds
Wherever users pick a rollup aggregation (settings/column editor), the options list derives from the widened union; i18n labels needed (AppFlowy uses locale keys with short variants — calculation_type_ext.dart:5-36). Fork's `i18n.ts` gains entries; that file churn is acceptable (single block append).

### F7.5 Rebase-risk ranking of edits
Lowest risk: new Aggregate.ts (none) > types union widening (one-line, additive) > aggregateRollup switch (localized) > eligibility-predicate dedup across 5 files (small but multi-file). Recommendation: land numeric+date packs first with only RelationRollup/types touched; do the SummaryRenderer/ChartAggregation routing second; the 5-site predicate extraction third — matching plan.md's phase order and keeping any single commit tiny.

## Ruled out
- A RollupConfig format field (Notion number-format parity): deferred — expands scope beyond minimal diff.
- Making Aggregate.ts generic over coercers: YAGNI; fixed `toChartNumber`/`toDateTimestamp` match all three call sites.

## Next Focus
UI/UX enrichment details (menus by target type, labels, percent/date rendering).

---

# Iteration 008 — UI/UX enrichment for the new aggregation kinds

**Focus:** How users discover and select aggregations across Notion/AppFlowy/Anytype and what the fork should adopt. Synthesis of gathered UI evidence plus fork menu code.

## Findings

### F8.1 Three-step selection is universal
Notion's rollup cell menu: relation → property → calculation (+format) [notion.com/help]. AppFlowy: footer cell → "Calculate" hover affordance → type menu filtered by field type (calculate_cell.dart:100-110). Anytype: per-view-relation formula dropdown grouped into sections Count/Percent/Math/Date (dataview.ts:121-127, relation.ts:193+). Fork's rollup column config lives in settings; footers use the two-step field→aggregation menus (`openSummaryFieldMenu`/`openSummaryAggregationMenu`, SummaryRenderer.ts:349-455).

Enrichment (UX): group the fork's aggregation options with section headers mirroring Anytype's FormulaSection — Count / Percent / Math / Date — once percent kinds land; cheap because `getSummaryAggregationOptions` already maps kinds to DropdownOption objects that could carry a group field.

### F8.2 Menu contents must follow the TARGET property type for rollups
Notion shows Sum..Range only when rolling up a Number property and Earliest/Latest/Date range only for Date properties. AppFlowy implements exactly this via `calculationsForFieldType()` (field_type_calc_ext.dart:4-31). Anytype via `formulaByType` switch on relation type (relation.ts:213-230+).
Fork gap: today's rollup config offers all four kinds regardless of target field type. When adding the new kinds, filter by target column type: numeric target → min/max/median/range(+existing sum/avg); date-like target → earliest/latest/range; otherwise count/list/percents only. This prevents users from selecting Median over a text target.

### F8.3 Labels: reuse footer vocabulary for consistency
The fork already has i18n keys for every new kind via chart/footer labels (`chart.minAggregation`, `chart.medianAggregation`, `viewConfig.summaryEarliest`, etc., SummaryRenderer.ts:31-49). New rollup-kind menus can reuse them — no new strings except percent kinds. Short labels matter in narrow cells (AppFlowy shortLabel precedent); the fork's cell title attr pattern (SummaryRenderer.ts:110-113) already provides full-label-on-hover.

### F8.4 Rendering dates and percents in cells
- Dates: footer EARLIEST/LATEST render through `parseDateTimeParts(...)?.dateKey` (SummaryRenderer.ts:554-555); rollup columns rendering earliest/latest must route through the same DateTimeFormat pipeline so table cells match footer formatting.
- Percents: ChartAggregation emits 0–100 floats; NumberDisplay has percent helpers (NumberDisplay.ts:29-48 progress/ring percent clamped 0–100). For rollup percent-empty/filled cells, append "%" at render time or add a display style; keep Aggregate returning raw numbers (iteration-006 decision).

### F8.5 Empty-cell display conventions differ by surface — keep them
Footer: skips items whose result is null/"" (SummaryRenderer.ts:107-108). Charts: map null stat → 0 (:781-784). Rollup columns: `emptyRollupValue` → null renders as empty text. Preserving each surface's existing empty convention while Aggregate uniformly returns null keeps diffs minimal and avoids visual regressions.

## Ruled out
- Hover-reveal footer hint redesign: fork already matches AppFlowy's affordance.
- A dedicated rollup-format submenu (Notion number format + decimals): scope creep for this phase.

## Next Focus
Edge cases + mobile/iCloud display-only safety verification approach.

---

# Iteration 009 — Edge cases, mobile, and iCloud safety (display-only verification)

**Focus:** Prove the display-only property from code structure; enumerate edge cases with owners (module vs call site); mobile-specific constraints.

## Findings

### F9.1 Display-only is structural, not incidental
`buildRelationRollups` returns an in-memory `valuesByPath: Map<string, Record<string, unknown>>` (`RelationRollup.ts:24-97`) consumed by two renderers — `views/DatabaseView.ts:3393` and `views/EmbeddedDatabaseRenderer.ts:3202`. Grep of `RelationRollup.ts` and `RowPipeline.ts` shows **zero** occurrences of vault write calls (`modify`, `processFrontMatter`, `create`). Aggregate.ts inheriting this shape (pure functions → derived map → DOM) cannot introduce writes. The fork even has a `ComputedSync` module whose default mode constant is `"display-only"` (`data/ComputedSync.ts:3`) — the vocabulary is established.
iCloud implication (SC-004): no frontmatter bytes change on render because nothing in the render path touches the file system; sync churn is impossible by construction. The plan's manual `git diff` check on rendered notes remains the acceptance proof.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/RelationRollup.ts:24-97; views/DatabaseView.ts:3393; data/ComputedSync.ts:3]

### F9.2 Edge-case ownership matrix
| Case | Owner | Defined behavior |
|---|---|---|
| Empty relation (no related rows) | RelationRollup pre-existing | `emptyRollupValue` (:155-161): count 0 / list [] / else null. New kinds fall into "else null" automatically |
| All-null target values | Aggregate.ts | null for numeric/date kinds; percentEmpty → 100, percentFilled → 0 |
| Single value | Aggregate.ts | min=max=median=value; range=0; earliest=latest=the date |
| Even-length median | Aggregate.ts | mean of middle two (three-way precedent) |
| Mixed types in numeric kinds | Aggregate.ts via toChartNumber | non-numeric dropped (RelationRollup.ts:125-129 already does this pre-call) |
| Invalid dates | toDateTimestamp | returns null → skipped (DateTimeFormat.ts:203-218) |
| Rollup-of-rollup | RelationRollup guard :103-104 | renders empty — untouched |
| NaN/Infinity input | toChartNumber | filtered (finite-only, ChartAggregation.ts:192-193) |

### F9.3 Mobile constraints
Obsidian mobile runs the same plugin code with constrained memory/CPU. Evidence-based mitigations already present: rollups are computed per source record over cached target maps (targetCache, RelationRollup.ts:47-62), no repeated metadataCache hits per row beyond `getFirstLinkpathDest`. New kinds are O(n log n) worst case (median sort) over per-cell value counts that are small (a note's relations). No virtualization or memoization change is warranted at this scale — matches NFR-P01's intent.

### F9.4 Test matrix derived for SC-001
Per kind × {empty array, all-null, single, odd-n, even-n, mixed-with-strings, mixed-with-invalid-dates, NaN/Infinity} — mirrors spec SC-001 and the AppFlowy-style per-kind function layout makes these table-driven unit tests trivial.

## Ruled out
- Memoizing aggregate results across renders: unnecessary complexity at vault scale; display-only rerenders are idempotent.
- Web-worker offload for median sorts: no evidence of need at Obsidian relation sizes.

## Next Focus
Broadened cross-cutting review: performance, formatting consistency, remaining parity gaps, final ranked enrichment list.

---

# Iteration 010 — Broadened cross-cutting review: config UI, test harness reality, formatting consistency, residual parity gaps

**Focus:** Angles untouched by earlier iterations: where rollup kinds are configured in the fork, the actual test infrastructure, cross-surface formatting consistency, and what remains outside parity after the pack.

## Findings

### F10.1 Rollup configuration entry point is ColumnMenu
Rollup configuration opens via column context menu → `t("rollup.configure")` (`views/ColumnMenu.ts:88-90`); rollup columns are created from the advanced type group (:264). The aggregation picker itself flows through the rollup-config editing surface (ColumnOperations/ViewConfigPanelRenderer). Enrichment: when widening the kind union, this menu needs (a) new options filtered by target field type (iteration-008 F8.2) and (b) labels reused from existing i18n keys. This is part of the "1-3 call-site edits" budget in spirit but must be counted — the settings surface is a fourth edit location for full UX, though it can compile and function without changes (options may simply not be offered until wired).

### F10.2 Test harness exists but has never been used — first-tester risk
Fork root has `vitest.config.ts` including `src/**/*.test.ts` with setup file `src/__tests__/setup.ts`, and vitest 4.1.8 in devDependencies — but **`src/__tests__/` does not exist**; there are zero test files in the fork. Consequences:
- SC-001 ("unit tests pass") requires bootstrapping the harness directory + setup file as part of this phase.
- Aggregate.ts being pure functions with zero Obsidian-API imports makes it the ideal first tested module — no mocking needed.
- plan.md's "fork's existing test infrastructure (command confirmed at build start)" resolves to: `npx vitest run`, needing the missing setup stub created.

[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/vitest.config.ts:1-11; package.json:32]

### F10.3 Formatting consistency check across surfaces
Three renderers currently format numbers differently: cells via ColumnDisplay/EuroFormat pipeline; footers via `formatEuroNumber2` (SummaryRenderer.ts:556); charts via ChartJs ticks. After routing shared math through Aggregate.ts, numeric *values* agree (SC-002) but rendered strings still differ by surface — acceptable and pre-existing. The one new consistency requirement: earliest/latest must use the identical dateKey rendering in both rollup cells and footers (`parseDateTimeParts(...)?.dateKey`) so Scenario 2 renders uniformly.

### F10.4 Residual parity gaps after the pack (documented, out of scope)
1. Count unique / Show unique values rollup kinds (Notion universal set) — fork has UNIQUE footer + chart unique already, so later addition is cheap via the same Aggregate pattern.
2. Percent checked/unchecked for checkbox targets (Notion/AppFlowy/Anytype all support checkbox-family aggregations).
3. Number-format + decimal placement on rollup config (Notion cell menu step 4-5).
4. Sorting restricted to numeric rollup output (Notion rule) — relevant only if fork adds rollup sorting later.
These belong in the parent roadmap, not this phase (spec Out of Scope).

### F10.5 Cross-checking the spec's "~15 aggregations" claim against evidence
Notion official list: 9 universal + 6 number-only + 3 date-only = 18 total, of which the fork covers count(≈Count values/all), sum, avg, list(≈Show original-lite). The pack adds min/max/median/range/earliest/latest (+2 optional percents) = 12–14 of 18 ≈ Notion's commonly-used core. Claim verified with correction: the real number is ~18, not ~15.

## Ruled out
- Expanding scope to close F10.4 gaps now: violates REQ-008 rebase-friendly minimal diff; recorded for roadmap.

## Next Focus
Synthesis phase — ranked, evidence-cited enrichment report.

---
