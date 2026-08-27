---
title: "Feature Specification: Rollup Aggregation Pack"
description: "Adds the missing Notion rollup aggregations as a new isolated Aggregate.ts module shared by rollup columns, summary footers, and charts — display-only."
trigger_phrases:
  - "rollup aggregation"
  - "aggregate ts"
  - "min max median"
  - "earliest latest"
  - "percent empty"
  - "summary footer math"
  - "chart aggregation"
  - "notion rollup parity"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/002-rollup-aggregation-pack"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "swarm"
    recent_action: "Nested sub-phases authored; numeric same-diff first"
    next_safe_action: "Build 001-numeric-aggregate-module per its plan.md and tasks.md"
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
# Feature Specification: Rollup Aggregation Pack

> Phase chain: predecessor `001-live-reports-rollups`, successor `003-reports-computed-fields`. Parent spec: [`../spec.md`](../spec.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-24 |
| **Branch** | `002-rollup-aggregation-pack` |
| **Wave** | 1 |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The fork's rollup columns are stuck on four kinds — `count | sum | avg | list` (`src/data/types.ts:44`) — while Notion exposes ~18 rollup calculations (9 universal + 6 number-only + 3 date-only). The missing math already exists in two other aggregators: footers implement ~15 `SummaryKind`s privately in `SummaryRenderer.ts`, and charts already compute median, min, max, range, and percent-empty in `ChartAggregation.ts`. None of it is shared, so rollup cells cannot express min/max/median/range/earliest/latest/percent at all.

The single biggest risk is not the math: five duplicated `count|sum|avg` eligibility tests will type every new kind as `"text"` (wrong rendering/search bucket), and the rollup config modal will never offer the new options, unless those surfaces ship in the same diff as the aggregation math.

### Purpose
Build one EuroFormat-shaped module, `src/data/Aggregate.ts` — pure functions, no plugin state, small rebasable diff — consumed by the three aggregators (rollup columns, footers, charts), plus the small supporting edits (type widening, shared eligibility predicate, config-modal options, test-harness bootstrap) that make the new kinds reachable and correctly typed. Ship display-only, keep rollup-of-rollup empty (Notion parity), and reject Anytype-style null-as-zero coercion. Nested children below own the ordered slices: numeric same-diff first, then date, then percent.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New module `src/data/Aggregate.ts`: pure functions `min`, `max`, `median`, `range`, `earliest`, `latest`, `percentEmpty`, `percentFilled`. Returns raw values; formatting stays at call sites. **API takes coerced arrays / row counts** (`readonly number[]`, `readonly number[]` timestamps, `(total, emptyCount)`), never `CellValue[]` — call sites already extract `number[]` / timestamps, so Aggregate imports nothing from `ChartAggregation.ts` / `SummaryRenderer.ts` / `RelationRollup.ts` (no circular import). `toChartNumber` / `toDateTimestamp` stay at call sites.
- Widen the rollup kind union at `src/data/types.ts:44` (one-line, additive).
- Dispatch new kinds in `RelationRollup.ts` `aggregateRollup` with an **exhaustive switch** — new kinds dispatch explicitly **before** the sum/avg tail; the tail is narrowed to `aggregation === "sum"` only (not `else sum`) so any unknown id cannot silently SUM. `count | sum | avg | list` behavior unchanged; rollup-of-rollup guard preserved byte-for-byte.
- Export a shared `isNumericRollupKind` predicate from `Aggregate.ts` and replace the five duplicated `count|sum|avg` eligibility clones (`RowPipeline.ts:143-147`, `ColumnDisplay.ts:19-23`, `SummaryRenderer.ts:77-79`, `ChartAggregation.ts:102-104` and `:131-133`). The predicate covers numeric + percent ids only — **`earliest`/`latest` are NOT in it** (they map to `"date"`, not `"number"`).
- Date display mapping (separate from the numeric predicate): `getColumnDisplayType` / `RowPipeline.withComputedResultTypes` map `earliest|latest` → `"date"` so cells render through `renderDate` / `parseDateTimeParts(...)?.dateKey`, not `String(Date)`.
- Config modal `RelationRollupConfigModal.ts` offers the new kinds, filters targets by kind (numeric via an extended `isSumAvg`; date-like via `isDateLikeColumnType`), and reuses existing i18n keys (`chart.minAggregation`, `chart.medianAggregation`, `viewConfig.summaryEarliest`, `chart.percentEmptyAggregation`, …) — no new `i18n.ts` block unless a key is actually missing.
- Footer (`SummaryRenderer.ts` `calculateSummary`) and chart (`ChartAggregation.ts` `getStatValue`/`getMedianValue`) route overlapping kinds through Aggregate.ts — one math, three surfaces. Footer numeric routing (MIN/MAX/MEDIAN/RANGE-when-numbers-exist) lands with the numeric pack; footer EARLIEST/LATEST routing lands with the date pack; the footer **date-ms RANGE fallback** (`SummaryRenderer.ts:457-459`) stays local so date RANGE does not regress. Chart median routes through Aggregate (required); chart min/max/range may call Aggregate on `stat.numericValues` or keep `stat.min`/`stat.max` if tests prove identical; chart `percent-empty`/`percent-not-empty` route through Aggregate with the existing `?? 0` edge mapping.
- Bootstrap the Vitest harness (`src/__tests__/setup.ts` stub + `Aggregate.test.ts`) — SC-001 is currently unrunnable because `src/__tests__/` does not exist.
- Build order: numeric pack first (unblocks Reports MAX/SUM in `003-reports-computed-fields`), dates next, percents last in this phase.
- Rollup-of-rollup remains forbidden and renders empty.
- Display-only rendering; no frontmatter writes (iCloud-safe).
- Candidate upstream PR: the diff stays small enough to propose back to the MIT upstream.

### Out of Scope
- Writing rollup results to note frontmatter or any persistent store.
- A separate "show original" option — the relation column already displays originals.
- Count unique / Show unique values rollup kinds (roadmap; this pack's API shape must not preclude them).
- Checkbox checked / unchecked / percent-checked rollup kinds (the percent pack covers empty/filled only).
- A `RollupConfig` number-format/decimal-placement slot (Notion asks for these; reuse EuroFormat/NumberDisplay at render time instead).
- Changes to the average denominator (stays divide-by-non-empty) or to existing `count | sum | avg | list` behavior.
- Null-coerces-to-zero semantics (Anytype's `Number(it || 0)` anti-pattern is rejected).
- Date-range start→end display chrome (v1 keeps the fork's `Nd`/ms-delta formatter concern out of the math module).
- Rollup-of-rollup support.
- Changes to the formula engines (`ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`), filters, record templates, or conditional formatting.

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/Aggregate.ts` | Create | Shared aggregation math: min, max, median, range, earliest, latest, percentEmpty, percentFilled; exports `isNumericRollupKind`. API takes coerced arrays / row counts; imports nothing from the three aggregators (no cycle) |
| `src/data/types.ts` | Edit | Widen the rollup `aggregation` union at `:44` |
| `src/data/RelationRollup.ts` | Edit | Dispatch new kinds through Aggregate.ts after the existing `toChartNumber` extraction (`:123-128`) via an exhaustive switch before the sum/avg tail (tail narrowed to `aggregation === "sum"` only); percent dispatches from `records` before `:126`; count (`:99`), list (`:110-119`), sum/avg (`:127-128`), rollup-of-rollup guard (`:101`), and `emptyRollupValue` (`:159-161`) untouched |
| `src/views/SummaryRenderer.ts` | Edit | `calculateSummary` (`:431-462`) calls Aggregate for MIN/MAX/MEDIAN/RANGE-when-numbers-exist (numeric pack) and EARLIEST/LATEST (date pack); keeps the date-ms RANGE fallback (`:457-459`) local; eligibility clone (`:77-79`) uses the shared predicate |
| `src/data/ChartAggregation.ts` | Edit | `getMedianValue` (`:873-880`) routes median through Aggregate (required); `getStatValue` (`:775-797`) min/max/range via Aggregate on `stat.numericValues` or keeps `stat.min`/`stat.max`; chart `percent-empty`/`percent-not-empty` (`:788-789`) via Aggregate with `?? 0`; clones at `:102-104`/`:131-133` use the shared predicate |
| `src/data/RowPipeline.ts` | Edit | Eligibility clone at `:143-147` uses the shared predicate; `withComputedResultTypes` maps `earliest|latest` → `"date"` (date pack) |
| `src/data/ColumnDisplay.ts` | Edit | Eligibility clone at `:19-23` uses the shared predicate; `getColumnDisplayType` maps `earliest|latest` → `"date"` (date pack) |
| `src/views/modals/RelationRollupConfigModal.ts` | Edit | Offer new kinds (`:137-176`), extend result type (`:246`), filter targets by kind |
| `src/__tests__/setup.ts` | Create | Vitest setup stub required by `vitest.config.ts` |
| `src/data/Aggregate.test.ts` | Create | Table-driven unit tests per kind |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | `Aggregate.ts` exists in the fork under `src/data/` | Exports pure functions for min, max, median, range, earliest, latest, and percent-empty/filled (empty/filled only — no checkbox percents); returns raw values/nulls, never formatted strings; compiles under the fork's TypeScript config |
| REQ-002 | Rollup columns gain the new kinds | `types.ts:44` widened; `RelationRollup.ts` dispatches the new kinds through Aggregate.ts via an **exhaustive switch before the sum/avg tail** (tail narrowed to `aggregation === "sum"` only — no `else sum` fallthrough, so unknown ids cannot silently SUM); existing count/sum/avg/list behavior is unchanged; new kinds inherit the `null` fallback from `emptyRollupValue` |
| REQ-003 | Rollup-of-rollup stays forbidden | The `column?.type === "rollup"` → empty guard (`RelationRollup.ts:139`) is preserved byte-for-byte; no new dispatch path enables rollup-of-rollup |
| REQ-004 | Results are display-only | Rendering the new kinds writes nothing to frontmatter or any other persistence; `ComputedSync` vocabulary stays `"display-only"` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Footer summaries share the math | `SummaryRenderer.ts` `calculateSummary` calls Aggregate for MIN/MAX/MEDIAN/RANGE-when-numbers-exist (numeric pack) and EARLIEST/LATEST (date pack); keeps STDDEV/COUNT/UNIQUE/CHECKED local and custom-formula preemption (`:439-442`); keeps the **date-ms RANGE fallback** (`:457-459`) local so date RANGE does not regress; maps Aggregate `null` → `""` at the edge |
| REQ-006 | Charts share the math | `ChartAggregation.ts` routes **median** through Aggregate (required); min/max/range via Aggregate on `stat.numericValues` or keeps `stat.min`/`stat.max` if tests prove identical; chart `percent-empty`/`percent-not-empty` (`:788-789`) route through Aggregate (percent pack); keeps the `?? 0` mapping so charts still show 0 on empty |
| REQ-007 | Build order respected | Numeric pack lands first, dates next, percents last in this phase |
| REQ-008 | Rebase-friendly diff | One new module plus minimal call-site edits on the EuroFormat model; no unrelated refactors; Aggregate.ts must stay a set of module-level pure functions (not a class) |
| REQ-009 | New kinds are typed correctly everywhere | The five `count|sum|avg` eligibility clones consume one shared `isNumericRollupKind` exported from Aggregate.ts; median/min/max/range/percent rollups render/search/chart as numbers, not `"text"`. The predicate covers numeric + percent ids only — `earliest`/`latest` are **not** in it; they map to `"date"` via a separate `getColumnDisplayType` / `RowPipeline.withComputedResultTypes` edit (date pack) so cells use `renderDate`, not `String(Date)` |
| REQ-010 | Config modal offers the new kinds | `RelationRollupConfigModal.ts` lists the new kinds with reused i18n labels (`chart.minAggregation`, `chart.medianAggregation`, `viewConfig.summaryEarliest`, `chart.percentEmptyAggregation`, … — no new `i18n.ts` block unless a key is actually missing); numeric targets offered the numeric kinds (extended `isSumAvg`); date-like targets offered earliest/latest via `isDateLikeColumnType` |
| REQ-011 | Test harness bootstrapped | `src/__tests__/setup.ts` created (required by `vitest.config.ts`); `npx vitest run` executes `Aggregate.test.ts`. Harness is `setup.ts` stub + `Aggregate.test.ts` only — **no general test migration** |
| REQ-012 | Aggregate.ts is cycle-free and coercion-free | `Aggregate.ts` imports nothing from `ChartAggregation.ts` / `SummaryRenderer.ts` / `RelationRollup.ts`; its API takes coerced arrays / row counts (`readonly number[]`, `readonly number[]` timestamps, `(total, emptyCount)`), never `CellValue[]`; `toChartNumber` / `toDateTimestamp` stay at call sites |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Unit tests pass for every Aggregate.ts kind, including empty, all-null, single-value, odd/even-length, mixed-type, and NaN/Infinity inputs (requires the REQ-011 harness bootstrap — zero tests exist today).
- **SC-002**: Rollup column, footer, and chart renders of the new kinds agree with each other (one shared math); rendered *strings* may still differ per surface chrome.
- **SC-003**: Rebasing the fork onto upstream stays clean — one new module plus small call-site edits.
- **SC-004**: No frontmatter bytes change when rollups render (display-only); renders are idempotent, so iCloud cannot churn on bytes that are never written.

### Acceptance Scenarios

- **Scenario 1**: **Given** a relation column over numeric values, **when** the user selects the Median rollup in the config modal, **then** the column renders the median and is treated as a numeric column (sortable/displayable as such).
- **Scenario 2**: **Given** a relation column over dates, **when** the user selects Earliest or Latest, **then** the earliest/latest date renders through the same dateKey pipeline footers use.
- **Scenario 3**: **Given** a rollup whose target relation column is itself a rollup, **when** the cell renders, **then** it renders empty (Notion parity).
- **Scenario 4**: **Given** rollups render in a note, **when** the vault syncs (iCloud), **then** no churny writes occur and frontmatter is untouched.
- **Scenario 5**: **Given** a footer or chart kind shared with Aggregate.ts, **when** it renders, **then** it uses the same math as rollup columns (null mapped to each surface's existing empty convention).

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Five `count\|sum\|avg` eligibility clones type new kinds as `"text"` | Median/Min/Max/Range/percent rollups render/search/chart wrong; modal never offers them | Same-diff shared `isNumericRollupKind` (REQ-009) — the top-ranked risk from research |
| Dependency | None upstream — this phase `depends_on: none` | — | Unblocks phase `003-reports-computed-fields` (needs MAX/SUM from the numeric pack) |
| Dependency | Parity research | Wrong aggregation list or semantics | Decision-ready findings in `research/synthesis.md`; evidence trail in `research/research.md` |
| Risk | Behavior drift across the three call sites | Same math implemented three ways today (footers privately implement MEDIAN/MIN/MAX/RANGE/EARLIEST/LATEST; charts have their own median/range/percents) | Single shared module as the only implementation; SC-002 agreement check |
| Risk | Rebase conflicts with upstream | Fork diverges from the MIT upstream | EuroFormat-shaped isolated module (`EuroFormat.ts:1-9` header precedent) + minimal edits |
| Risk | Empty/invalid inputs produce NaN or crashes | Median/range/percent on empty or mixed cells | Per-kind locked semantics (plan.md) + table-driven unit tests; never coerce null→0 |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Values are extracted once per cell (existing `targetCache` avoids repeated DB scans); worst case is the O(n log n) median sort over per-cell related-value counts of tens–hundreds — acceptable on Obsidian mobile. No workers, no memoization.

### Security
- **NFR-S01**: No secrets, no telemetry, no network calls; MIT-forkable.

### Reliability
- **NFR-R01**: Deterministic results for identical inputs; display-only means no writes to contend with under iCloud.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- Empty relation: existing `emptyRollupValue` → count `0`, list `[]`, else `null` (`RelationRollup.ts:159-161`); new kinds inherit `null`.
- All-null / all-unparsable targets: numeric and date kinds → `null`; percentEmpty → `100`; percentFilled → `0`.
- Single value: min = max = median = that value; range = `0`; earliest = latest = that date.
- Even-length median: mean of the two middle values (three-way lock: fork footer ≡ AppFlowy ≡ Anytype). Never nearest-rank.
- Mixed types: non-numerics skipped via `toChartNumber`; invalid dates skipped via `toDateTimestamp`. A skip is never treated as zero.
- NaN/Infinity: dropped by `toChartNumber`'s finite-only filter (`ChartAggregation.ts:192`).
- Rollup-of-rollup: empty, never aggregated (`RelationRollup.ts:139`).

### Error Scenarios
- Percent denominators: percentEmpty/Filled divide by total related rows **including empties**. Three distinct cases must not be conflated: **0 related rows → `0`** (empty relation); **N rows all empty → percentEmpty `100` / percentFilled `0`** (all-null targets); **missing target field → `null`** via the existing `emptyRollupValue` (`RelationRollup.ts:159-161`). Percent dispatches from `records` + `getTargetFieldValue` **before** the numeric `numbers.length === 0` early return (`:126`), not from flattened `numbers`. This differs deliberately from average's non-empty denominator. Two denominators, documented, not unified.
- Unknown-kind dispatch: `aggregateRollup` uses an exhaustive switch before the sum/avg tail; the tail is `aggregation === "sum"` only. Any id not in the switch cannot fall through to SUM.
- Empty-display drift by surface is intentional: Aggregate returns `null`; footers skip/blank (`""`); charts map to `0`; rollup cells stay empty text. Do not unify the chrome.
- Date range vs number range: v1 Aggregate `range` is scalar numeric `max − min`; whole-day-span `Nd` formatting stays a footer-formatter concern, not a second math kind. The footer keeps its date-ms RANGE fallback (`SummaryRenderer.ts:457-459`) so date RANGE does not regress when the numeric pack lands.

### Concurrent Operations
- Display-only rendering is idempotent; there are no writes to contend with during mobile or iCloud sync.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 8/25 | One new module + small edits to seven existing files (all one-line-class changes) |
| Risk | 8/25 | Rebase-friendliness and Notion-parity semantics; eligibility-clone drift contained in-diff |
| Research | 6/20 | Parity list and semantics locked by completed research |
| **Total** | **22/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

All operator decisions below carry the synthesis's recommended default; none blocks the build.

- **Percent-empty/filled in this phase?** Default: **yes, last** — deferring to `003-reports-computed-fields` would split the only shared math module.
- **Date-range display**: keep the fork's `Nd`/ms delta at the formatter; Aggregate returns a number. Chrome changes are not this pack. The footer keeps its date-ms RANGE fallback so date RANGE does not regress.
- **Range shape**: scalar `max − min` (matches Notion and both live fork surfaces); the earlier `[number, number]` plan sketch is amended at build start.
- **Config modal in scope?** Yes — without `RelationRollupConfigModal.ts:167-176`, the kinds compile but never appear.
- **Extract `isNumericRollupKind` this phase?** Yes — skipping it ships Median as type `"text"`. The predicate covers numeric + percent ids only; `earliest`/`latest` map to `"date"` via a separate display-type edit.
- **Date display mapping for earliest/latest?** Yes — `getColumnDisplayType` / `RowPipeline.withComputedResultTypes` map `earliest|latest` → `"date"` (date pack), separate from `isNumericRollupKind`. Without it, date rollups render as `String(Date)`.
- **Aggregate API (`CellValue[]` vs coerced arrays)?** Coerced arrays / row counts. Aggregate imports nothing from the three aggregators (no circular import); `toChartNumber` / `toDateTimestamp` stay at call sites.
- **Unknown-kind dispatch?** Exhaustive switch before the sum/avg tail; tail narrowed to `aggregation === "sum"` only. No `else sum` fallthrough.
- **Module name?** `src/data/Aggregate.ts` — not `RollupAggPack.ts`. One module, no second handoff artifact.
- **Count-unique / checkbox-percent / rollup number-format**: closed for this phase (parent roadmap; rebase-friendly scope).
- **Average denominator**: stays non-empty (fork + AppFlowy convention); percents keep all-rows. Documented, not unified.
- **Phase 001 dependency?** None — Vault Reports wiring is independent; do not block 002 on 001.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Research Synthesis (decision-ready)**: `research/synthesis.md`
- **Research Evidence Trail**: `research/research.md`
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`

<!-- /ANCHOR:related-docs -->

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | 001-numeric-aggregate-module/ | Shared `Aggregate.ts` numeric kinds (min/max/median/range), Vitest harness, type widening, rollup dispatch, `isNumericRollupKind`, numeric modal options, footer/chart numeric consume — one same-diff slice | Complete |
| 2 | 002-date-aggregation-pack/ | Earliest/latest date kinds, date extraction before the numeric empty return, `earliest\|latest` display type `"date"`, date modal filter, footer EARLIEST/LATEST via Aggregate | Complete |
| 3 | 003-percent-aggregation-pack/ | Percent empty/filled from related-row totals (not flattened numbers), percent modal options, chart percent-empty / percent-not-empty via Aggregate | Complete |

Future / out of this phase (not child folders): count unique / show unique values; checkbox checked / unchecked / percent-checked; `RollupConfig` number-format and decimal-placement slot.

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001-numeric-aggregate-module | 002-date-aggregation-pack | `Aggregate.ts` exports min/max/median/range plus `isNumericRollupKind` covering numeric and future percent ids; `types.ts:44` widened; `aggregateRollup` dispatches numeric kinds before a sum-only tail; five eligibility clones use the predicate; numeric modal options exist; footer/chart numeric kinds consume Aggregate; rollup-of-rollup guard at `RelationRollup.ts:139` unchanged | `npx vitest run` green on `Aggregate.test.ts`; Median rollup cell types as `"number"` not `"text"` (`ColumnDisplay.ts:19-23`) |
| 002-date-aggregation-pack | 003-percent-aggregation-pack | `earliest`/`latest` take timestamps and return `Date \| null`; date extraction runs before `numbers.length === 0`; `earliest\|latest` map to `"date"` in `ColumnDisplay` / `RowPipeline`; modal offers date kinds via `isDateLikeColumnType`; footer EARLIEST/LATEST route through Aggregate and keep `parseDateTimeParts(...)?.dateKey` at `SummaryRenderer.ts:552` | Scenario 2: earliest/latest match footer dateKey on the same dates; cells use `renderDate` not `String(Date)` |
<!-- /ANCHOR:phase-map -->
