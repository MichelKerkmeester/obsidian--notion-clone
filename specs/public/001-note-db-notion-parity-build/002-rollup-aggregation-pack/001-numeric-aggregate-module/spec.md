---
title: "Feature Specification: Numeric Aggregate Module"
description: "Same-diff numeric slice: create Aggregate.ts (min/max/median/range), bootstrap Vitest, widen the rollup union, dispatch numeric kinds, share isNumericRollupKind, offer numeric modal options, and route footer/chart numeric math through Aggregate."
trigger_phrases:
  - "numeric aggregate"
  - "aggregate ts"
  - "min max median range"
  - "isNumericRollupKind"
  - "rollup config modal"
  - "vitest harness"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/002-rollup-aggregation-pack/001-numeric-aggregate-module"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored numeric same-diff child from synthesis and final-plan"
    next_safe_action: "Implement Aggregate.ts numeric functions plus the same-diff call sites"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-numeric-aggregate-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Numeric Aggregate Module

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `002-rollup-aggregation-pack` |
| **Parent Spec** | ../spec.md |
| **Phase** | 1 of 3 |
| **Predecessor** | None |
| **Successor** | 002-date-aggregation-pack |
| **Handoff Criteria** | Module, tests, types, numeric dispatch, shared predicate, numeric modal, and footer/chart numeric routing all land together; Median types as number and appears in the dropdown |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 3** — Parent: [`../spec.md`](../spec.md) · Successor: `002-date-aggregation-pack`. Independent of phase `001-live-reports-rollups`. Unblocks `003-reports-computed-fields` MAX once numeric kinds exist.

This child is the **same-diff numeric slice** from `research/final-plan.md` steps 1–7. Do not ship `Aggregate.ts` without the predicate, modal numeric options, and numeric footer/chart consume — otherwise Median compiles as `"text"` and never appears in `RelationRollupConfigModal.ts:167-176`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Rollup columns are stuck on `count | sum | avg | list` at `src/data/types.ts:44`. Notion Number-property rollups expose Sum/Average/Median/Min/Max/Range, and the fork already computes median/min/max/range in footers (`SummaryRenderer.ts:431-462`, private median `:576-581`) and charts (`ChartAggregation.ts:775-797`, `:873-880`). Five duplicated `count|sum|avg` tests will type every new kind as `"text"`, and the config modal is a hardcoded four-option dropdown.

### Purpose
Create one EuroFormat-shaped leaf `src/data/Aggregate.ts` (`EuroFormat.ts:1-9` header precedent) with `min`/`max`/`median`/`range` on coerced `readonly number[]`, bootstrap the missing Vitest harness, and land the supporting one-line edits in the **same diff** so Median is reachable, typed as `"number"`, and agrees across cell/footer/chart.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New module `src/data/Aggregate.ts`: `min`, `max`, `median`, `range` taking `readonly number[]`; empty/all-empty → `null`; single value min=max=median=value, range=`0`; even median = mean of the two middle values (copy-sort; match `SummaryRenderer.ts:576-581`); never null→0.
- Export `isNumericRollupKind(id: string)` including **future percent ids** so the percent child does not retouch five clones. Do **not** include `earliest|latest`.
- Create `src/__tests__/setup.ts` stub and `src/data/Aggregate.test.ts` (land with the module). No general test migration.
- Widen `src/data/types.ts:44` with `"min" | "max" | "median" | "range"` (dates/percents may share the line if unused).
- Dispatch numeric kinds in `RelationRollup.ts` `aggregateRollup` after `toChartNumber` (`:123-128`), **before** the empty/avg tail. Change `:128` to `aggregation === "sum"` only. Leave `count` `:99`, rollup-of-rollup `:101`, `list` `:110-119`, `emptyRollupValue` `:159-161` untouched.
- Replace eligibility clones: `RowPipeline.ts:143-147`, `ColumnDisplay.ts:19-23`, `SummaryRenderer.ts:77-79`, `ChartAggregation.ts:102-104` and `:131-133`.
- Numeric modal options in `RelationRollupConfigModal.ts:137-176` and result type `:246`; extend `isSumAvg` to sum/avg/min/max/median/range; reuse i18n (`chart.minAggregation`, `chart.medianAggregation`).
- Footer MIN/MAX/MEDIAN/RANGE-when-numbers-exist call Aggregate (`SummaryRenderer.ts:431-460`); keep custom-formula preemption `:439-442`; **keep date-ms RANGE fallback** `:457-459`. Chart median (required) and min/max/range via Aggregate on `stat.numericValues`; keep empty→`0` (`:781-784`, `:873-874`). Map Aggregate `null` → footer `""`, chart `0`.
- API takes coerced arrays. `Aggregate.ts` imports nothing from `ChartAggregation.ts` / `SummaryRenderer.ts` / `RelationRollup.ts`. `toChartNumber` stays at call sites (`ChartAggregation.ts:191-197`).

### Out of Scope
- Date kinds earliest/latest and `earliest|latest` → `"date"` mapping (child `002-date-aggregation-pack`).
- Percent empty/filled and chart percent routing (child `003-percent-aggregation-pack`).
- Count unique / show unique; checkbox percents; `RollupConfig` format slot (parent roadmap).
- Rewriting existing `count | sum | avg | list`; rollup-of-rollup; Anytype `Number(it || 0)`; range as `[number, number]`.
- Footer percent kinds; unifying empty chrome across surfaces.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/Aggregate.ts` | Create | Numeric functions + `isNumericRollupKind` (percent ids included, dates excluded) |
| `src/__tests__/setup.ts` | Create | Vitest stub required by `vitest.config.ts:1-9` |
| `src/data/Aggregate.test.ts` | Create | Table tests per numeric kind × empty / all-null / single / odd / even / mixed / NaN / Infinity |
| `src/data/types.ts` | Edit | Widen aggregation union at `:44` |
| `src/data/RelationRollup.ts` | Edit | Numeric dispatch after `:123-125`; sum-only tail at `:128` |
| `src/data/RowPipeline.ts` | Edit | Eligibility clone `:143-147` uses the predicate |
| `src/data/ColumnDisplay.ts` | Edit | Eligibility clone `:19-23` uses the predicate |
| `src/views/SummaryRenderer.ts` | Edit | Clone `:77-79`; numeric `calculateSummary` `:431-460`; keep date-ms RANGE `:457-459` |
| `src/data/ChartAggregation.ts` | Edit | Clones `:102-104` / `:131-133`; median/min/max/range via Aggregate |
| `src/views/modals/RelationRollupConfigModal.ts` | Edit | Numeric options `:137-176`; result type `:246` |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | `src/data/Aggregate.ts` exists with numeric functions only first | Exports `min`/`max`/`median`/`range` on `readonly number[]`; empty/all-empty → `null`; range of one value is `0`; even median matches `SummaryRenderer.ts:576-581`; no imports from the three aggregators |
| REQ-002 | Rollup columns gain numeric kinds without silent SUM fallthrough | `types.ts:44` widened; `aggregateRollup` switches min/max/median/range **before** the tail; tail is `aggregation === "sum"` only (`RelationRollup.ts:128`); `count` `:99`, `list` `:110-119`, rollup-of-rollup `:101` unchanged |
| REQ-003 | New kinds inherit empty-relation `null` | `emptyRollupValue` `:159-161` untouched; new numeric kinds fall through to `null` on missing targets |
| REQ-004 | Results stay display-only | Rendering writes nothing to frontmatter; `ComputedSync.ts:3` stays `"display-only"` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Five eligibility clones share `isNumericRollupKind` | Replaces `count\|sum\|avg` tests at `RowPipeline.ts:143-147`, `ColumnDisplay.ts:19-23`, `SummaryRenderer.ts:77-79`, `ChartAggregation.ts:102-104` and `:131-133`; Median/Min/Max/Range type as `"number"` (`ColumnDisplay.ts:14-23` → `CellRenderer.ts:201-203`); predicate includes future percent ids; `earliest\|latest` are **not** in it |
| REQ-006 | Config modal offers numeric kinds | `RelationRollupConfigModal.ts:137-176` lists min/max/median/range; `isSumAvg` covers all numeric kinds; numeric target filter still excludes text (`:137-143`); reuse existing i18n keys |
| REQ-007 | Footer and chart consume Aggregate for numeric overlap | Footer MIN/MAX/MEDIAN/RANGE-when-numbers-exist call Aggregate; keep `:439-442` and date-ms RANGE `:457-459`; chart median required; min/max/range via Aggregate or proven-identical `stat.min`/`stat.max`; `null` → footer `""`, chart `0` |
| REQ-008 | Vitest harness bootstrapped | `src/__tests__/setup.ts` exists; `npx vitest run` executes `Aggregate.test.ts` only — no general test migration |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `npx vitest run` is green on numeric Aggregate tests for empty, all-null, single, odd, even, mixed, and non-finite inputs (call sites pass already-filtered numbers).
- **SC-002**: On a sample numeric relation, rollup cell, footer, and chart agree on min/max/median/range math; chrome may still differ (cell empty / footer blank / chart 0).
- **SC-003**: Median cannot ship as `"text"` or as an unlisted dropdown id — predicate + modal land in the same diff as the kinds they name.
- **SC-004**: No frontmatter bytes change when numeric rollups render.

### Acceptance Scenarios

- **Given** a relation column over numeric values, **when** the user selects Median in the config modal, **then** the column renders the median and is treated as a numeric column.
- **Given** an even-length numeric list, **when** median runs, **then** the result is the mean of the two middle values (`SummaryRenderer.ts:576-581`).
- **Given** a rollup whose target column is itself a rollup, **when** the cell renders, **then** it stays empty (`RelationRollup.ts:101`).
- **Given** empty or all-unparsable numeric targets, **when** min/max/median/range run, **then** Aggregate returns `null` (never 0).
- **Given** a single numeric value, **when** range runs, **then** the result is `0`.
- **Given** an unknown leftover aggregation id, **when** `aggregateRollup` returns, **then** it does not fall through to SUM.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Five `count\|sum\|avg` clones type Median as `"text"` | Wrong render/search/chart bucket | Same-diff REQ-005 |
| Risk | Modal stays four hardcoded options (`:167-176`) | Kinds compile and never appear | Same-diff REQ-006 |
| Risk | `Aggregate.ts` imports `ChartAggregation.ts` | Circular import with `getStatValue` + predicate | Coerced `number[]` API; no aggregator imports |
| Risk | Unknown-kind tail stays `else sum` (`:126-128`) | New ids silently SUM | Exhaustive switch; tail is sum only |
| Risk | Footer numeric RANGE eats date RANGE | Date RANGE regresses | Keep date-ms fallback `:457-459` at the footer edge |
| Dependency | None on phase 001 live reports | — | Numeric pack unblocks reports MAX in `003-reports-computed-fields` |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults from parent research: range is scalar `max − min` (not `[number, number]`); never coerce null→0; average denominator stays non-empty and is not rewritten here; config modal and `isNumericRollupKind` are in-scope because omitting them is a correctness bug.
<!-- /ANCHOR:questions -->
