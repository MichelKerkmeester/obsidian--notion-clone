---
title: "Tasks: Rollup Aggregation Pack"
description: "Ranked task breakdown for the Rollup Aggregation Pack, ordered by the research synthesis backlog with real fork file:line targets and S/M/L effort tiers."
trigger_phrases:
  - "rollup aggregation"
  - "aggregate module"
  - "min max median"
  - "earliest latest"
  - "percent empty"
  - "rollup implementation"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/002-rollup-aggregation-pack"
    last_updated_at: "2026-08-27T17:09:01Z"
    last_updated_by: "swarm"
    recent_action: "Tasks reconciled to final-plan.md; status Planned"
    next_safe_action: "Build phase 002 per plan.md and tasks.md (numeric same-diff first)"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Tasks: Rollup Aggregation Pack

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked / deferred out of this phase |

**Task Format**: `T### [P?] Description (file path) [effort tier]`

Tasks below follow the research synthesis's RANKED BACKLOG order (rank # in parentheses). Effort tiers (S/M/L) come from the synthesis.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Read this phase's decision-ready findings and evidence trail (`research/synthesis.md`, `research/research.md`) — replaces the stale `008-note-db-notion-parity` pointer [15m] -- done during build
- [x] T002 Record the fork's baseline test/lint state — expect zero tests (`src/__tests__/` does not exist despite `vitest.config.ts:1-9`) [10m] -- done during build

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Task order follows the synthesis RANKED BACKLOG (rank # shown per task).

- [x] T010 **(rank 1) Numeric pack on rollup columns** — **same diff as T012+T013+T014 (do not ship T010 without them, or Median compiles as text and never appears in the modal)**: create `Aggregate.ts` with min/max/median/range taking coerced `readonly number[]` (imports nothing from the three aggregators — no cycle); widen the kind union at `types.ts:44`; dispatch new kinds in `RelationRollup.ts` `aggregateRollup` after the existing `toChartNumber` extraction (`RelationRollup.ts:123-128`) via an **exhaustive switch before the sum/avg tail** — narrow the tail (`:128`) to `aggregation === "sum"` only (not `else sum`) so unknown ids cannot silently SUM. Leave `count` (`:99`), `list` (`:110-119`), sum/avg (`:127-128`), rollup-of-rollup guard (`:101`), and `emptyRollupValue` (`:159-161`) untouched. Unblocks phase 003 MAX/SUM. (`src/data/Aggregate.ts`, `src/data/types.ts`, `RelationRollup.ts`) [S] -- src/data/Aggregate.ts:24-48; src/data/types.ts:41-47; src/data/RelationRollup.ts:180-188
- [x] T011 **(rank 7, lands with T010) Vitest harness bootstrap** — SC-001 is currently unrunnable: create the missing `src/__tests__/setup.ts` stub required by `vitest.config.ts`; write table-driven `Aggregate.test.ts` per kind × empty/all-null/single/odd/even/mixed/NaN/Infinity (`vitest.config.ts:1-9`). Harness is `setup.ts` stub + `Aggregate.test.ts` only — **no general test migration**. (`src/__tests__/setup.ts`, `src/data/Aggregate.test.ts`) [S] -- vitest.config.ts:5-7; src/__tests__/setup.ts:1-41; src/data/Aggregate.test.ts:67-165
- [x] T012 **(rank 2) Shared `isNumericRollupKind`** — **same diff as T010**: export the predicate from `Aggregate.ts` (numeric + percent ids only — **`earliest`/`latest` are NOT in it**; they map to `"date"` via the separate T015 display-type edit); replace the five `count|sum|avg` eligibility clones so Median/Min/Max/Range/percents type as `"number"`, not `"text"` (`src/data/RowPipeline.ts:143-147`, `src/data/ColumnDisplay.ts:19-23`, `src/views/SummaryRenderer.ts:77-79`, `src/data/ChartAggregation.ts:102-104` and `:131-133`) [S] -- src/data/Aggregate.ts:8-21; src/data/ColumnDisplay.ts:19-23; src/data/RowPipeline.ts:150-155; src/views/SummaryRenderer.ts:75-79; src/data/ChartAggregation.ts:100-134
- [x] T013 **(rank 3) Config modal offers the new kinds + target filtering** — **same diff as T010**: add options and extend the result type; reuse existing i18n keys (`chart.minAggregation`, `chart.medianAggregation`, `viewConfig.summaryEarliest`, `chart.percentEmptyAggregation`, … — no new `i18n.ts` block unless a key is actually missing); extend `isSumAvg` to all numeric kinds; add a date-kind filter via `isDateLikeColumnType` (`src/views/modals/RelationRollupConfigModal.ts:137-176`, result type `:246`) [S] -- src/views/modals/RelationRollupConfigModal.ts:138-186,254-260; src/i18n.ts:427-468
- [x] T014 **(rank 4, numeric split) Footer + chart numeric consume Aggregate.ts** — numeric pack only; date footer routing is T015, chart percent routing is T016: route footer MIN/MAX/MEDIAN/RANGE-when-numbers-exist through Aggregate from `calculateSummary`, keeping STDDEV/COUNT/UNIQUE/CHECKED local, custom-formula preemption (`:439-442`), and the **date-ms RANGE fallback** (`:457-459`) local so date RANGE does not regress (`src/views/SummaryRenderer.ts:431-462`, private median `:576-581`); route chart **median** through Aggregate (required) and min/max/range via Aggregate on `stat.numericValues` **or** keep `stat.min`/`stat.max` if tests prove identical, keeping `?? 0` at the edge (`src/data/ChartAggregation.ts:775-797`, `getMedianValue :873-880`); map Aggregate `null` → footer `""`, chart `0`. Do not unify chart chrome with rollup empty-text or footer `""`. [S] -- src/views/SummaryRenderer.ts:442-459; src/data/ChartAggregation.ts:778-786,870-871
- [x] T015 **(rank 5) Date pack (earliest/latest)**: implement in `Aggregate.ts` via `toDateTimestamp` taking `readonly number[]` timestamps, returning `Date | null` (`DateTimeFormat.ts:203-214`); parallel date extraction in `RelationRollup.ts` **before** the numeric `numbers.length === 0` return (alongside `:123-128`); **map `earliest|latest` → `"date"`** in `getColumnDisplayType` (`ColumnDisplay.ts:18-23`) and `RowPipeline.withComputedResultTypes` (`:143-147`) — separate from `isNumericRollupKind` — so cells use `renderDate`, not `String(Date)`; route footer EARLIEST/LATEST through Aggregate keeping `parseDateTimeParts(...)?.dateKey` at `:552`; add modal date-kind options via `isDateLikeColumnType` (reuse `viewConfig.summaryEarliest` / `summaryLatest`). [S] -- src/data/Aggregate.ts:50-58; src/data/RelationRollup.ts:168-173; src/data/ColumnDisplay.ts:19-23; src/data/RowPipeline.ts:150-155; src/views/SummaryRenderer.ts:454-455,551-553
- [x] T016 **(rank 6) Percent pack (percentEmpty/percentFilled)** — ships last in this phase per operator default: implement taking `(total, emptyCount)`; denominator = total related rows including empties; **0 rows → `0`**; **N rows all empty → percentEmpty `100` / percentFilled `0`**; **missing target → `null`** via `emptyRollupValue` (`:159-161`); do not reuse average's non-empty denominator. Dispatch in `RelationRollup.ts` from `records` + `getTargetFieldValue` **before** `:126`, not from flattened `numbers`. Wire modal options; route chart `percent-empty`/`percent-not-empty` (`ChartAggregation.ts:788-789`) through Aggregate with `?? 0`. Predicate already includes percent ids (T012). **No footer percent kinds this phase** (footers lack them today). [S] -- src/data/Aggregate.ts:60-66; src/data/RelationRollup.ts:140-147; src/data/ChartAggregation.ts:785-786; src/views/modals/RelationRollupConfigModal.ts:185-186

### Deferred (out of this phase — parent roadmap)

- [B] T017 **(rank 8) Count unique / Show unique values**: fork has UNIQUE footers, chart `unique`, and list-path `stringifyValue` dedupe precedent (`RelationRollup.ts:110-119`). Feasibility likely; depends on this pack's API shape — do not preclude it. Out of scope per spec. -- DEFERRED: no unique-value/count implementation was shipped.
- [B] T018 **(rank 9) Checkbox checked / unchecked / percent-checked**: footers and charts already have CHECKED/UNCHECKED/`percent-checked` (`ChartAggregation.ts:792-795`). Historical Notion checkbox rollups; REQ-001 percent pack is empty/filled only. -- DEFERRED: no checkbox rollup implementation was shipped.
- [B] T019 **(rank 10) Rollup number-format + decimal placement**: Notion's rollup menu asks for these but `RollupConfig` has no format slot (`types.ts:39-45`). Hard inside REQ-008 scope; reuse EuroFormat/NumberDisplay at render time instead — no config field. -- DEFERRED: no rollup number-format slot was shipped.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Unit Tests
- [x] T050 Run `npx vitest run`: every `Aggregate.test.ts` case passes for all kinds × {empty, all-null, single-value, odd-n, even-n median, mixed types, invalid dates, NaN/Infinity} (`src/data/Aggregate.test.ts`) [20m] -- src/data/Aggregate.test.ts:67-165; npx vitest run (247 passed)

### Integration & Manual
- [ ] T051 Fork lint passes; no console errors/warnings after wiring the new kinds (all touched files) [15m] -- DEFERRED: no runtime console-check artifact was produced; repository-wide lint still has unrelated baseline errors.
- [ ] T052 Three-surface agreement (SC-002): rollup column, footer, and chart render the same value for each new kind on a sample relation; empty renders follow each surface's convention (cell empty text / footer blank / chart 0); footer date RANGE still renders `Nd` (date-ms fallback preserved) [20m] -- DEFERRED: no sample-relation/manual three-surface proof artifact was produced.
- [ ] T053 Modal check: new kinds offered and filtered by target field type — numeric target → min/max/median/range(+sum/avg); date-like target → earliest/latest; text target → count/list only (`RelationRollupConfigModal.ts`) [10m] -- DEFERRED: no manual modal-check proof artifact was produced.
- [x] T054 Rollup-of-rollup still renders empty; existing count/sum/avg/list unchanged vs baseline (`RelationRollup.ts:101`) [10m] -- src/data/RelationRollup.ts:137-188
- [ ] T055 Display-only proof: `git diff` on rendered notes shows no frontmatter change; iCloud-safety re-check of ComputedSync vocabulary [10m] -- DEFERRED: no rendered-note diff proof artifact was produced.
- [x] T057 Dispatch + display-mapping proof: `aggregateRollup` tail is `aggregation === "sum"` only (no `else sum` fallthrough — grep the switch); `Aggregate.ts` has no import from `ChartAggregation.ts` / `SummaryRenderer.ts` / `RelationRollup.ts`; `earliest`/`latest` cells render through `renderDate` / `parseDateTimeParts(...)?.dateKey` (not `String(Date)`) [15m] -- src/data/RelationRollup.ts:180-188; src/data/Aggregate.ts:1-70; src/data/ColumnDisplay.ts:19-23

### Documentation
- [x] T056 Update `checklist.md` evidence and this phase's `implementation-summary.md` after verification [15m] -- done during build

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All non-blocked tasks marked `[x]` after the build completes (all pending now). -- DEFERRED: required manual proof tasks remain unproduced.
- [x] `[B]` tasks are deferred-by-design roadmap items (ranks 8–10), not blockers of this phase. -- done during build
- [ ] Fork test suite and lint pass with no regressions vs the T002 baseline. -- DEFERRED: repository-wide lint still reports seven unrelated baseline errors.
- [x] `checklist.md` fully verified with P0/P1/P2 counts recorded. -- checklist records 10/10 P0, 14/14 P1, 1/1 P2

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`

<!-- /ANCHOR:cross-refs -->
