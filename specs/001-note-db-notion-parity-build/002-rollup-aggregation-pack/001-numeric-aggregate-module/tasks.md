---
title: "Tasks: Numeric Aggregate Module"
description: "Same-diff task list for Aggregate.ts numeric kinds, Vitest harness, type widening, rollup dispatch, isNumericRollupKind, numeric modal, and footer/chart numeric consume."
trigger_phrases:
  - "numeric aggregate tasks"
  - "aggregate ts"
  - "isNumericRollupKind"
  - "vitest harness"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/002-rollup-aggregation-pack/001-numeric-aggregate-module"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Numeric Aggregate Module

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

T003–T008 are **one atomic diff**. Do not ship T003 without T004–T008.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read parent `research/synthesis.md` ranks 1–4 and 7 plus `research/final-plan.md` steps 1–7 (same-diff coupling, cycle rule, sum-only tail) [15m]
- [ ] T002 Record fork baseline — expect missing `src/__tests__/` despite `vitest.config.ts:1-9`; note lint/test starting state [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Create `src/data/Aggregate.ts`** (numeric only): `min`/`max`/`median`/`range` on `readonly number[]`; empty/all-empty → `null`; single value min=max=median=value, range=`0`; even median = mean of two middle (copy-sort; match `SummaryRenderer.ts:576-581`); never null→0; EuroFormat header (`EuroFormat.ts:1-9`); export `isNumericRollupKind` including future percent ids, excluding `earliest|latest`; **no imports** from `ChartAggregation.ts` / `SummaryRenderer.ts` / `RelationRollup.ts` (`src/data/Aggregate.ts`) [S]
- [ ] T004 **Harness + table tests** — land with T003: `src/__tests__/setup.ts` stub; `src/data/Aggregate.test.ts` per kind × empty / all-null / single / odd / even / mixed / NaN / Infinity (pass already-filtered numbers). No general test migration (`vitest.config.ts:1-9`) [S]
- [ ] T005 **Widen union + numeric dispatch** — same diff as T003: `types.ts:44` add `"min" \| "max" \| "median" \| "range"`; in `aggregateRollup` keep `count` `:99`, rollup-of-rollup `:101`, `list` `:110-119`; after `toChartNumber` `:123-125` switch min/max/median/range **before** the empty/avg tail; change `:128` to `aggregation === "sum"` only; leave `emptyRollupValue` `:159-161` (`src/data/types.ts`, `src/data/RelationRollup.ts:123-128`) [S]
- [ ] T006 **Shared predicate in five clones** — same diff as T003: replace `count\|sum\|avg` tests in `RowPipeline.ts:143-147`, `ColumnDisplay.ts:19-23`, `SummaryRenderer.ts:77-79`, `ChartAggregation.ts:102-104` and `:131-133`. Do not put `earliest|latest` in the predicate (`src/data/Aggregate.ts`) [S]
- [ ] T007 **Config modal numeric options** — same diff as T003: `RelationRollupConfigModal.ts:137-176` and result type `:246`; extend `isSumAvg` to sum/avg/min/max/median/range; reuse `chart.minAggregation` / `chart.medianAggregation`; numeric target filter still excludes text (`:137-143`) [S]
- [ ] T008 **Footer + chart numeric consume Aggregate** — same diff as T003: `SummaryRenderer.ts:431-460` MIN/MAX/MEDIAN/RANGE-when-numbers-exist; keep custom-formula `:439-442` and date-ms RANGE `:457-459`; `ChartAggregation.ts:775-784,873-880` median required, min/max/range via Aggregate on `stat.numericValues` or keep `stat.min`/`stat.max` if identical; `null` → footer `""`, chart `0` [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T009 `npx vitest run` green on `Aggregate.test.ts` (SC-001) [S]
- [ ] T010 Three-surface numeric agreement on a sample relation; empty chrome unchanged (cell empty / footer blank / chart 0); Median types as `"number"` (`ColumnDisplay.ts:19-23` → `CellRenderer.ts:201-203`) [S]
- [ ] T011 Confirm rollup-of-rollup empty (`RelationRollup.ts:101`); existing count/sum/avg/list unchanged; no frontmatter writes (`ComputedSync.ts:3`) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T008 shipped as one diff
- [ ] Manual verification of T010–T011 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 1–4, 7
- **Parent final-plan**: `../research/final-plan.md` steps 1–7
<!-- /ANCHOR:cross-refs -->
