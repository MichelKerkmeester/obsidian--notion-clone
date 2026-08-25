# Synthesis: Rollup Aggregation Pack
> One-line: ranked Notion-parity enrichment for this feature, synthesized by Grok 4.6 (xhigh-fast) from the phase's 10 research iterations. Evidence trail: research.md.

## Verdict

Build it. The fork already has Notion's missing rollup math in footers and charts; rollup columns are stuck on `count | sum | avg | list`, and the cheapest Notion-parity win is one EuroFormat-shaped `src/data/Aggregate.ts` consumed by the three aggregators, numeric pack first so phase `003-reports-computed-fields` can take MAX/SUM. Ship display-only, keep rollup-of-rollup empty, and do not copy Anytype's null-as-zero coercion.

The single biggest risk is not the math: five `count|sum|avg` eligibility clones will type new kinds as `"text"`, and `RelationRollupConfigModal` will not offer them, unless those surfaces are in the same diff as the spec's three call sites.

## Ranked backlog

1. **Numeric pack on rollup columns (min / max / median / range)** — Notion Number-property rollups expose Sum/Average/Median/Min/Max/Range; the fork rollup union is only four kinds, so Median/Min/Max/Range are unreachable on rollup cells while footers and charts already compute them. Feasibility: **clear**. Files: create `src/data/Aggregate.ts`; widen `src/data/types.ts:44`; dispatch in `src/data/RelationRollup.ts` `aggregateRollup` after the existing `toChartNumber` extraction (`:123-128`); leave `count`/`sum`/`avg`/`list` and the rollup-of-rollup guard (`:101`) untouched. Effort: **S**. Depends on: none (unblocks 003). Citation: `src/data/types.ts:44`; Notion list at https://www.notion.com/help/relations-and-rollups.

2. **Shared `isNumericRollupKind` (stop typing new kinds as text)** — Without this, Median/Min/Max/Range/percent rollups fail the duplicated `aggregation === "count" \|\| "sum" \|\| "avg"` tests and render/search/chart as text; Notion also aggregates *over* numeric rollup output. Feasibility: **clear**. Files: export the predicate from `Aggregate.ts`; replace clones in `src/data/RowPipeline.ts:143-147`, `src/data/ColumnDisplay.ts:19-23`, `src/views/SummaryRenderer.ts:77-79`, `src/data/ChartAggregation.ts:102-104` and `:131-133`. Effort: **S**. Depends on: item 1 kind names. Citation: `src/data/ColumnDisplay.ts:19-23`.

3. **Config modal: offer the new kinds and filter targets by kind** — Column menu only opens configure (`src/views/ColumnMenu.ts:88-93`); the live picker is a hardcoded four-option dropdown, and `isSumAvg` already restricts sum/avg to numeric targets. Feasibility: **clear**. Files: `src/views/modals/RelationRollupConfigModal.ts:137-176` and result type `:246`; reuse existing i18n keys (`chart.minAggregation`, `chart.medianAggregation`, `viewConfig.summaryEarliest`, …). Extend `isSumAvg` to all numeric kinds; add a date-kind filter via `isDateLikeColumnType`. Effort: **S**. Depends on: item 1 (date filter also on item 5). Citation: `src/views/modals/RelationRollupConfigModal.ts:167-176`.

4. **Footer + chart consume Aggregate.ts (one math, three surfaces)** — Footers privately implement MEDIAN/MIN/MAX/RANGE/EARLIEST/LATEST; charts already have median/min/max/range/percent-empty. Spec SC-002 requires agreement. Feasibility: **clear**. Files: `src/views/SummaryRenderer.ts` `calculateSummary` (`:431-462`) plus private `median` (`:576-581`); `src/data/ChartAggregation.ts` `getStatValue` (`:775-797`) and `getMedianValue` (`:873-880`). Keep custom-formula preemption in the footer. Map Aggregate `null` → footer `""` and chart `0` at the edge so empty rendering does not regress. Effort: **S**. Depends on: item 1. Citation: `src/views/SummaryRenderer.ts:431-462`.

5. **Date pack (earliest / latest)** — Notion Date-property rollups are Earliest date / Latest date / Date range; rollup columns have none; footers already do EARLIEST/LATEST via `toDateTimestamp`. Feasibility: **clear**. Files: `Aggregate.ts` `earliest`/`latest`; date extraction in `RelationRollup.ts` (parallel to `:123-128`); render through `parseDateTimeParts(...)?.dateKey` like footers (`SummaryRenderer.ts:552`). Effort: **S**. Depends on: item 1 module. Citation: `src/views/SummaryRenderer.ts:455-456`; `src/data/DateTimeFormat.ts:203-214`.

6. **Percent pack (percentEmpty / percentFilled)** — Notion universal Percent empty / Percent not empty; charts already emit 0–100 floats; rollup columns and footers do not. Spec marks this optional and defaults to shipping it last in this phase. Feasibility: **clear**. Files: `Aggregate.ts`; wire in `RelationRollup.ts` and chart `percent-empty`/`percent-not-empty` (`ChartAggregation.ts:788-789`); modal options. Denominator = total related rows including empties; zero rows → `0`. Effort: **S**. Depends on: item 1. Citation: `src/data/ChartAggregation.ts:788-789`; https://www.notion.com/help/relations-and-rollups.

7. **Vitest harness bootstrap (SC-001 is currently unrunnable)** — `vitest.config.ts` includes `src/**/*.test.ts` and `setupFiles: ["src/__tests__/setup.ts"]`, but `src/__tests__/` does not exist and there are zero tests. Aggregate.ts is pure (no Obsidian API) and is the right first module. Feasibility: **clear**. Files: `src/__tests__/setup.ts` stub; `src/data/Aggregate.test.ts` table-driven per kind × empty/all-null/single/odd/even/mixed/NaN. Effort: **S**. Depends on: none (land with item 1). Citation: fork `vitest.config.ts:1-11`.

8. **Count unique / Show unique values (deferred)** — Notion universal Count unique values / Show unique values; fork has UNIQUE footers and chart `unique`, plus list-path `stringifyValue` dedupe. Feasibility: **likely**. Files later: `Aggregate.ts` + `RelationRollup.ts` + modal. Effort: **S**. Depends on: this pack's API shape (do not preclude it). Out of this phase (spec Out of Scope). Citation: `src/data/RelationRollup.ts:110-119`.

9. **Checkbox checked / unchecked / percent-checked (deferred)** — Historical Notion checkbox rollups; footers and charts already have CHECKED/UNCHECKED/`percent-checked`. Feasibility: **likely**. Out of this phase (REQ-001 percent pack is empty/filled only). Citation: `src/data/ChartAggregation.ts:792-795`.

10. **Rollup number-format + decimal placement (deferred)** — Notion's rollup menu asks for number format and decimal placement; `RollupConfig` has no format slot. Feasibility: **hard** inside REQ-008. Reuse EuroFormat/NumberDisplay at render time; do not add a config field. Citation: `src/data/types.ts:39-45`; https://www.notion.com/help/relations-and-rollups.

## Recommended build (locked design)

**Module:** `src/data/Aggregate.ts`, copied from the EuroFormat shape: module-level pure functions, no plugin state, a header that it exists to stay a small rebasable diff (`src/data/EuroFormat.ts:1-9`). Return raw values; formatting stays at call sites (`formatEuroNumber2`, `parseDateTimeParts` dateKey, chart ticks). AppFlowy's `CalculationsService` match-dispatch is the same idea and must not become a class (`context/appflowy/frontend/rust-lib/flowy-database2/src/services/calculations/service.rs:12-26`).

**Algorithm (locked semantics):**

| Kind | Filter | Empty / all-null | Rule |
|---|---|---|---|
| min / max | `toChartNumber` finite (`src/data/ChartAggregation.ts:191-197`) | `null` | never coerce null→0 (reject Anytype `Number(it \|\| 0)` in `context/anytype-ts/src/ts/lib/dataview.ts:1000-1006`) |
| median | same | `null` | sort a copy; odd → middle; even → mean of the two middle values — three-way lock: `SummaryRenderer.ts:576-581` ≡ AppFlowy `service.rs:129-137` ≡ Anytype MathMedian |
| range | numeric first | `null` if no survivors | **scalar** `max − min` (Notion Range; footer `:457-459`; chart `:784`). Single value → `0`. Plan.md's `[number, number]` sketch is wrong; do not implement it |
| earliest / latest | `toDateTimestamp` (`DateTimeFormat.ts:203-214`) | `null` | min/max timestamps; return `Date`. Local wall-time, not `Date.parse` |
| percentEmpty / percentFilled | all cells including empty | `0` when `total === 0` | `emptyCount / total × 100` on a 0–100 scale; filled = complement. Do not reuse average's non-empty denominator |

Average/sum stay in `RelationRollup.ts` unchanged (divide by non-empty `numbers.length`, `:126-128`). Aggregate.ts must not conflate that denominator with the percent denominator.

**EuroFormat integration (new module + rebase-safe call sites):**

1. **`src/data/RelationRollup.ts`** — after the existing flatten (`:102-109`) and `toChartNumber` map (`:123-128`), switch new kinds into Aggregate; add a parallel date extraction for earliest/latest. Do not rewrite `count` (`:99`), `list` (`:110-119`), sum/avg (`:127-128`), or `emptyRollupValue` (`:159-161` — new kinds already fall through to `null`). Preserve `column?.type === "rollup"` → empty (`:101`) byte-for-byte (Notion: rollup-of-rollup is impossible).
2. **`src/views/SummaryRenderer.ts`** — `calculateSummary` (`:431-462`) calls Aggregate for MIN/MAX/MEDIAN/RANGE/EARLIEST/LATEST; keep STDDEV/COUNT/UNIQUE/CHECKED local; keep custom-formula preemption (`:439-442`).
3. **`src/data/ChartAggregation.ts`** — `getStatValue` / `getMedianValue` route overlapping kinds through Aggregate; keep `?? 0` at this edge so charts still show 0 on empty (`:781-784`, `:873-874`).

Compile/UX extras that are still one-line-class edits, not a fourth architecture: widen `types.ts:44`; add options + target filters in `RelationRollupConfigModal.ts`; export `isNumericRollupKind` from Aggregate.ts for the five eligibility clones (item 2). Data flow stays `buildRelationRollups` → in-memory `valuesByPath` → `DatabaseView.ts:3393` / `EmbeddedDatabaseRenderer.ts:3202`. Nothing is persisted.

## Edge cases & mobile/iCloud safety

- **Empty relation:** existing `emptyRollupValue` → count `0`, list `[]`, else `null` (`RelationRollup.ts:159-161`). New kinds inherit `null`.
- **All-null / all-unparsable targets:** numeric and date kinds → `null`; percentEmpty → `100`; percentFilled → `0`.
- **Single value:** min = max = median = that value; range = `0`; earliest = latest = that date.
- **Even-length median:** mean of the two middle values (locked above). Do not use nearest-rank.
- **Mixed types:** skip non-numerics via `toChartNumber`; skip invalid dates via `toDateTimestamp`. Never treat a skip as zero.
- **NaN / Infinity:** `toChartNumber` already drops non-finite (`ChartAggregation.ts:192`).
- **Rollup-of-rollup:** empty, never aggregated (`RelationRollup.ts:101`).
- **Empty-display drift by surface:** Aggregate returns `null`; footer skips/blank (`SummaryRenderer.ts` format `""`); charts map to `0`; rollup cells stay empty text. Do not unify the chrome.
- **Date range vs number range:** footer RANGE tries numbers first, then date-ms (`:457-459`) and formats whole-day spans as `Nd` (`:555`). v1 Aggregate `range` is numeric max−min; date span is a formatter concern, not a second math kind.

**Mobile + iCloud:** display-only is structural. `buildRelationRollups` returns an in-memory map (`RelationRollup.ts:24-89`); greps of that module show no vault writes. Default computed-sync vocabulary is already `"display-only"` (`src/data/ComputedSync.ts:3`). Renders are idempotent; iCloud cannot churn on bytes that are never written (SC-004). Mobile runs the same code; median is O(n log n) over per-cell related values (tens–hundreds), with `targetCache` already avoiding repeated DB scans (`RelationRollup.ts:38-56`). No workers, no memoization, no frontmatter.

## Open questions / operator decisions

1. **Include percent-empty/filled in this phase?** Recommended default: **yes, last** (spec §9; plan Phase 4). Deferring it to 003 splits the only shared math module.
2. **Date-range display: Notion start→end, Anytype duration, or fork `Nd`?** Recommended default: **keep fork `Nd` / ms delta at the formatter**; Aggregate returns a number. Changing chrome is not this pack.
3. **Honor plan.md `range(): [number, number] \| null`?** Recommended default: **no — scalar `max − min`**, matching Notion and both live fork surfaces. Amend the plan sketch at build start.
4. **Count the config modal as in-scope (spec lists three files)?** Recommended default: **yes**. Without `RelationRollupConfigModal.ts:167-176`, kinds compile and never appear. Still a small, rebase-safe edit.
5. **Extract `isNumericRollupKind` this phase?** Recommended default: **yes**. Skipping it ships Median as type `"text"` (RowPipeline/ColumnDisplay). Same-phase, ~3 lines × 5 sites.
6. **Close count-unique / checkbox-percent / rollup number-format now?** Recommended default: **no**. Parent roadmap; violates REQ-008.
7. **Average denominator: non-empty (fork + AppFlowy) vs all rows (Anytype)?** Recommended default: **non-empty**, and do not change existing avg. Percents keep all-rows. Two denominators, documented, not unified.
