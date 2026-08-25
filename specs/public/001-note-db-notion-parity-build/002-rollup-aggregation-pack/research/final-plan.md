# Final Plan: Rollup Aggregation Pack
> Reviewed & optimized build plan, from a fresh Grok 4.6 (xhigh-fast) review of this phase's rewritten spec/plan/tasks/checklist plus its synthesis and research.

## Review — strengths, gaps, risks

Verdict **build** is right. Rollup columns are stuck on four kinds (`types.ts:44`) while footers already implement MEDIAN/MIN/MAX/RANGE/EARLIEST/LATEST (`SummaryRenderer.ts:19-22,431-460,576-581`) and charts already have median/min/max/range/percent-empty (`ChartAggregation.ts:775-789,873-880`). One EuroFormat-shaped leaf is the cheapest parity win. Numeric pack first correctly unblocks `003-reports-computed-fields` MAX (SUM already exists). Rollup-of-rollup stays empty (`RelationRollup.ts:101`). Anytype `Number(it \|\| 0)` is correctly rejected (`research/synthesis.md` algorithm table). Range is correctly locked as scalar `max − min`, not the old `[number, number]` sketch. Vitest is configured (`vitest.config.ts:1-11`) but `src/__tests__/` is missing — SC-001 is unrunnable until bootstrap. Five `count\|sum\|avg` clones will type Median as `"text"` (`RowPipeline.ts:143-147`, `ColumnDisplay.ts:19-23`, `SummaryRenderer.ts:77-79`, `ChartAggregation.ts:102-104` and `:131-133`) — synthesis’s top risk is real, and the rewritten spec’s same-diff predicate is the right fix.

Gaps and traps the current plan under-weights:

1. **EuroFormat “1–3 call sites” vs eight files.** Parent doctrine wants a new module plus 1–3 seams. Spec §Files to Change lists ten paths. That is not a reason to cut the predicate or the modal: without them Median compiles, types as text, and never appears (`RelationRollupConfigModal.ts:167-176` is four hardcoded options; result type `:246` is the same four-kind union). Reframe: **one compute module + three aggregator seams**, and treat types/predicate/modal as one-line supporting edits in the **same diff** as the kinds they name. Do not ship T010 without T012+T013.

2. **`CellValue[]` API will circular-import.** Spec API sketch takes `CellValue[]` and “reuses `toChartNumber`.” `toChartNumber` lives in `ChartAggregation.ts:191-197`. `RelationRollup.ts:4` already imports it. If `Aggregate.ts` imports `ChartAggregation` and `ChartAggregation` imports `Aggregate` for `getStatValue` + `isNumericRollupKind`, the cycle is guaranteed. Call sites **already extract** `number[]` / timestamps. Aggregate must take coerced arrays and **must not** import `ChartAggregation.ts`.

3. **Unknown-kind fallthrough is a landmine.** After `if (numbers.length === 0) return null`, the tail is `return aggregation === "avg" ? sum / n : sum` (`RelationRollup.ts:126-128`). Widen `types.ts:44` without an exhaustive switch and every new id **silently SUMs**. Change the tail to `aggregation === "sum"` only; new kinds dispatch explicitly **before** that return.

4. **Percent cannot reuse the numeric path.** Flatten drops `null`/`""` (`RelationRollup.ts:102-109`). Then `numbers.length === 0` returns `null`. All-empty related rows would yield `null` instead of percentEmpty `100`. Zero related rows would yield `null` instead of `0`. Percent must run on **`records` (row count + empty detection) before** the numeric early return. Checklist CHK-012 currently conflates “empty relation” with “all-null targets.” Locked semantics: 0 rows → `0`; N rows all empty → percentEmpty `100` / percentFilled `0`; missing target still uses `emptyRollupValue` → `null` (`RelationRollup.ts:64-66,159-160`).

5. **T014 routes EARLIEST/LATEST/RANGE before those packs exist**, and would regress footer **date RANGE**. Footer RANGE is numeric first, then date-ms (`SummaryRenderer.ts:457-459`) and formats whole-day spans as `Nd` (`:551-556`). Aggregate v1 `range` is numeric only (`research/synthesis.md`). Keep the date-ms fallback at the footer edge. Split T014: numeric footer/chart with the numeric pack; date footer with the date pack; chart percent with the percent pack.

6. **Date rollups will render as `String(Date)` unless display type maps to `"date"`.** Today only `count|sum|avg` → `"number"`, else `"text"` (`ColumnDisplay.ts:18-23`). Text path is `td.textContent = String(value)` (`CellRenderer.ts:231-232`). Scenario 2 needs `parseDateTimeParts(...)?.dateKey` like footers (`SummaryRenderer.ts:552`). REQ-009’s `isNumericRollupKind` is necessary but not sufficient: `getColumnDisplayType` / `RowPipeline.withComputedResultTypes` must map `earliest|latest` → `"date"`. Do not put earliest/latest in `isNumericRollupKind`.

7. **T014 over-claims chart routing.** `getStatValue` already holds min/max/range on `ChartStat` (`:782-784`). Route **median** (and percents) through Aggregate for one-math; min/max/range may call Aggregate on `stat.numericValues` **or** keep `stat.min`/`stat.max` if tests prove identical. Keep `?? 0` / empty→0 at the chart edge (`:781-784`, `:873-874`). Do not unify chrome with rollup empty-text or footer `""`.

8. **Line-number drift in older research is stale; live fork wins.** Rollup-of-rollup is `:101` not `:88`. COUNT is `:99`. `emptyRollupValue` is `:159-160`. `calculateRelationRollups` is `DatabaseView.ts:3388-3400`. `plan.md` “Framework” path pointing at `001-notion-finance-migration/build/note-database-fork` is wrong; live source is `Obsidian Plugin/src`.

9. **Effort ~3h is tight** for harness + eight call-site files + three-surface agreement. Each backlog item is still **S**, but the numeric integration slice is **M** because of breadth, not math difficulty.

10. **001 handoff name.** Phase 001 still says `RollupAggPack.ts`. This phase’s module name is **`Aggregate.ts`**. Do not create a second module.

## Optimizations

- **API:** `min/max/median/range(numbers: readonly number[])`, `earliest/latest(timestamps: readonly number[])` returning `Date | null`, `percentEmpty/percentFilled(total, emptyCount)` or equivalent row-level counts. Pure functions, no plugin state, EuroFormat header (`EuroFormat.ts:1-9`). Formatting stays at call sites.
- **Avoid cycle:** `Aggregate.ts` imports nothing from `ChartAggregation.ts` / `SummaryRenderer.ts` / `RelationRollup.ts`. `toChartNumber` / `toDateTimestamp` stay at call sites (`ChartAggregation.ts:191-197`, `DateTimeFormat.ts:203-214`).
- **Same-diff numeric slice:** create module + tests + `types.ts:44` + RelationRollup numeric dispatch + `isNumericRollupKind` in all five clones + modal numeric options + footer/chart numeric routing. One commit-sized unit so Median cannot ship as text or as an unlisted dropdown id.
- **Exhaustive dispatch** in `aggregateRollup`; never fall through to sum.
- **Percent last**, as specified, but implement against `records`, not `numbers`.
- **Do not** add count-unique, checkbox percents, or a `RollupConfig` format slot (ranks 8–10). Reuse EuroFormat/NumberDisplay at render.
- **Do not** add footer percent kinds this phase (footers lack them today; T016 already excludes them).
- **i18n:** reuse `chart.minAggregation`, `chart.medianAggregation`, `viewConfig.summaryEarliest`, `chart.percentEmptyAggregation` (`ChartViewModel.ts:41-48`, `SummaryRenderer.ts:54-71`). No new `i18n.ts` block unless a key is actually missing.
- **Harness:** empty `src/__tests__/setup.ts` stub + `src/data/Aggregate.test.ts` only. Do not start a general test migration.

## Final build plan (ordered)

1. **Baseline** — Record fork lint/test (`npx vitest run` will fail on missing setupFiles). Effort **S**. Accept: written baseline (zero tests). Deps: none. Target: fork root `vitest.config.ts:1-11`.

2. **Create `src/data/Aggregate.ts` (numeric functions only first)** — `min`, `max`, `median`, `range` on `readonly number[]`. Empty/all-empty → `null`; single value min=max=median=value, range=`0`; even median = mean of two middle (copy-sort; match `SummaryRenderer.ts:576-581`); never null→0. Header: small rebasable diff (`EuroFormat.ts:1-9`). Export `isNumericRollupKind(id: string)` including future percent ids (so T016 does not retouch five clones). Effort **S**. Accept: module compiles; no imports from aggregators. Deps: step 1.

3. **Harness + table tests (synthesis #7)** — Create `src/__tests__/setup.ts` stub; `src/data/Aggregate.test.ts` per kind × empty / all-null / single / odd / even / mixed (call-site coercion: pass already-filtered numbers). Effort **S**. Accept: `npx vitest run` green on Aggregate tests. Deps: step 2. Land with step 2.

4. **Widen union + numeric dispatch (synthesis #1)** — `types.ts:44` add `"min" | "max" | "median" | "range"` now (dates/percents in the same line is fine if unused). In `RelationRollup.ts` `aggregateRollup`: keep `count` `:99`, rollup-of-rollup `:101`, `list` `:110-119` untouched. After `toChartNumber` map `:123-125`, **before** empty/`avg` tail: switch min/max/median/range to Aggregate. Change `:128` to **sum only** (`aggregation === "sum"`), not `else sum`. Leave `emptyRollupValue` `:159-160` (new kinds inherit `null`). Effort **S**. Accept: Median on a numeric relation; unknown leftover ids do not compile or do not fall through to sum. Deps: steps 2–3. Call site: `RelationRollup.ts:123-128`.

5. **Shared predicate in five clones (synthesis #2) — same diff as 4** — Replace `count\|sum\|avg` tests: `RowPipeline.ts:143-147`, `ColumnDisplay.ts:19-23`, `SummaryRenderer.ts:77-79`, `ChartAggregation.ts:102-104` and `:131-133`. Effort **S**. Accept: Median/Min/Max/Range display/search/chart as `"number"` not `"text"` (`ColumnDisplay.ts:14-23` → `CellRenderer.ts:201-203`). Deps: step 2 kind names. Do not include `earliest|latest`.

6. **Config modal numeric options (synthesis #3) — same diff as 4** — `RelationRollupConfigModal.ts:137-176` and result type `:246`. Extend `isSumAvg` to all numeric kinds (sum/avg/min/max/median/range). Reuse i18n keys. Effort **S**. Accept: dropdown lists new numeric kinds; numeric target filter still excludes text (`:137-143`). Deps: step 4 union.

7. **Footer + chart numeric consume Aggregate (synthesis #4, split)** — `SummaryRenderer.ts:431-460`: MIN/MAX/MEDIAN/RANGE-when-numbers-exist call Aggregate; map `null` → `""`; keep custom-formula preemption `:439-442`; keep STDDEV/COUNT/UNIQUE/CHECKED local; **keep date-ms RANGE fallback** `:457-459`. `ChartAggregation.ts:775-784,873-880`: median (required) and min/max/range via Aggregate on `stat.numericValues`; keep empty→`0`. Effort **S**. Accept: same numeric result on a sample relation across cell/footer/chart; empty chrome unchanged (cell empty / footer blank / chart 0). Deps: steps 4–5.

8. **Date pack (synthesis #5)** — `earliest`/`latest` in Aggregate via timestamps; parallel extraction in `RelationRollup.ts` with `toDateTimestamp` (`DateTimeFormat.ts:203-214`) **before** the numeric `numbers.length === 0` return. Map `earliest|latest` → `"date"` in `ColumnDisplay.ts:18-23` and `RowPipeline.ts:143-147` so cells use `renderDate` (`CellRenderer.ts:205-206`), not `String(Date)`. Modal: date-kind filter via `isDateLikeColumnType`; options reuse `viewConfig.summaryEarliest` / `summaryLatest`. Footer EARLIEST/LATEST already return `Date` (`SummaryRenderer.ts:455-456`); route through Aggregate and keep `parseDateTimeParts(...)?.dateKey` at `:552`. Effort **S**. Accept: Scenario 2 — earliest/latest match footer dateKey on the same dates. Deps: step 2 module; step 6 modal pattern.

9. **Percent pack last (synthesis #6)** — `percentEmpty` / `percentFilled` on **row totals including empties**; `total === 0` → `0`; all-null N rows → 100 / 0. Dispatch in `RelationRollup.ts` from `records` + `getTargetFieldValue`, **not** from flattened `numbers`, and **before** `:126`. Wire modal options; chart `percent-empty` / `percent-not-empty` (`ChartAggregation.ts:788-789`) through Aggregate with `?? 0`. Predicate already includes percent ids (step 2). Average denominator stays non-empty (`RelationRollup.ts:126-128` for avg). Effort **S**. Accept: CHK-027 two denominators; SC-002 percents 0–100 scale. Deps: numeric slice. Default: **yes, last** (do not defer to 003).

10. **Verification** — `npx vitest run`; fork lint vs step 1; three-surface agreement; modal filter matrix (numeric → min/max/median/range+sum/avg; date-like → earliest/latest; text → count/list only); rollup-of-rollup empty (`RelationRollup.ts:101` byte-stable); existing count/sum/avg/list unchanged; `git diff` on notes shows no frontmatter from rendering (display-only; `ComputedSync.ts:3`; `types.ts:69-70`). Mobile: same path, no Electron. Effort **M** (breadth). Deps: steps 2–9.

Deferred (not this diff): count unique / show unique (`RelationRollup.ts:110-119` precedent); checkbox percents (`ChartAggregation.ts:792-795`); `RollupConfig` number-format slot (`types.ts:39-45`). Do not preclude unique in the API.

## Risks & open decisions

| Item | Default |
|------|---------|
| Percent-empty/filled this phase? | **Yes, last.** Deferring splits the only shared module. |
| Date-range chrome (Notion start→end vs `Nd`) | Keep fork `Nd`/ms at the **formatter** (`SummaryRenderer.ts:551-556`). Aggregate range stays numeric. |
| Range shape | **Scalar** `max − min`. Do not implement `[number, number]`. |
| Config modal in scope? | **Yes.** Kinds that do not appear in `RelationRollupConfigModal.ts:167-176` are unused. |
| `isNumericRollupKind` this phase? | **Yes**, same diff as numeric kinds. Skipping ships Median as `"text"`. |
| Date display mapping | **Yes** for earliest/latest → `"date"` in `ColumnDisplay` / `RowPipeline`. Not part of the numeric predicate. |
| Count-unique / checkbox-percent / rollup format field | **No** this phase. |
| Average denominator | Keep non-empty. Percents keep all-rows. Document; do not unify. |
| Aggregate API (`CellValue[]` vs coerced arrays) | **Coerced arrays / row counts.** No `ChartAggregation` import from `Aggregate.ts`. |
| Footer RANGE on dates | Keep local date-ms fallback; do not feed dates into numeric `range()`. |
| Call-site budget vs parent EuroFormat rule | Honor **module shape** (new leaf, pure, rebase-safe seams). Supporting one-liners (types, five clones, modal, date display map, tests) stay in-scope because omitting them is a correctness bug, not extra product. |
| Phase 001 dependency | **None.** Vault Reports wiring is independent. Do not block 002 on 001. |
| Effort | Numeric slice **M**; date **S**; percent **S**; verify **M**. Treat “every item is S” as per-function size, not calendar time. |
