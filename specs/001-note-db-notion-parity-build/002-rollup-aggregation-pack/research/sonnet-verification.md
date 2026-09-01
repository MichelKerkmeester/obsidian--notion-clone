# Sonnet 5 Verification — 002-rollup-aggregation-pack

- Reviewer: Claude Sonnet 5 (read-only; hunter/skeptic/referee adversarial self-check)
- Date: 2026-08-26
- Scope: shipped implementation on branch `impl` vs `research/synthesis.md` + sub-phase specs
- Gate re-run at review time: `tsc --noEmit` clean; full `vitest` 160/160 (incl. `Aggregate.test.ts` 57/57)

## Verdict

**PASS** — numeric, date, and percent aggregation are correctly and completely implemented in `src/data/Aggregate.ts` and its call sites.

## Findings

- **Correctness (confirmed against locked semantics):** `min`/`max`/`median`/`range` filter to finite numbers, return `null` on empty, even-median = mean of two middle values (`src/data/Aggregate.ts:24-48`). `earliest`/`latest` return `Date | null` (`:50-58`). `percentEmpty`/`percentFilled` special-case `total===0 → 0`, else `emptyCount/total*100` (`:60-66`).
- **Non-silent dispatch:** `aggregateRollup` handles `min|max|median|range` explicitly and narrows the tail to `aggregation === "sum"` only (not `else sum`) — `src/data/RelationRollup.ts:180-188`.
- **Percent dispatch** runs before the numeric flatten with a "missing target field → null" guard (`RelationRollup.ts:140-148`); forward "0 related rows" → `percentEmpty(0,0)=0`. Rollup-of-rollup guard untouched (`RelationRollup.ts:139`).
- **Date display:** `earliest|latest` map to `"date"` display type (not the numeric predicate) in `ColumnDisplay.ts:19-23` and `RowPipeline.ts:150-155`; render via `parseDateTimeParts`/`renderDate`, not `String(Date)`.
- **Coverage:** all 7 "clear/feasible" synthesis items shipped; items 8–10 (count-unique, checkbox percents, rollup number-format slot) explicitly out of scope, correctly deferred.
- **No-regression:** `git show` for `b83d666`, `58490ee`, `18e5461` strictly additive; `count`/`sum`/`avg`/`list` byte-identical; five eligibility clones now route through single `isNumericRollupKind`; chart percent refactor is a proven no-op.
- **Safety:** `Aggregate.ts` has zero imports (cycle-free); `buildRelationRollups` returns in-memory map only; consumers never write back to frontmatter; `DEFAULT_COMPUTED_SYNC_MODE` stays `"display-only"`.
- **Tests:** `Aggregate.test.ts` table-drives every kind across empty/all-null/single/odd/even/mixed/NaN/Infinity + `isNumericRollupKind` matrix — 57 assertions green.

## Remediation candidates (non-blocking)

- **P2 — stale completion docs:** all three sub-phases' `implementation-summary.md` still say "Not yet implemented (Planned)" / verification rows "Not run," though all three commits landed gate-green. Metadata-reconciliation item.
- **Cross-phase note (belongs to 008, not a 002 regression):** the inverse-relation rollup path added by phase 008 (`RelationRollup.ts:70-80`, commit `90c335d`) short-circuits to `emptyRollupValue` (`null`) on zero inbound edges, instead of this phase's "0 related rows → 0" rule for `percentEmpty`/`percentFilled`. The forward-relation path 002 authored is correct.
