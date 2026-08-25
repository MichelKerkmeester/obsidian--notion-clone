---
title: "Verification Checklist: Rollup Aggregation Pack"
description: "Pending verification checklist for the Rollup Aggregation Pack phase: locked edge-case semantics, three-surface agreement, and display-only/mobile/iCloud-safety checks."
trigger_phrases:
  - "rollup"
  - "aggregate"
  - "verification"
  - "display only"
  - "rollup of rollup"
  - "percent empty"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/002-rollup-aggregation-pack"
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "swarm"
    recent_action: "Checklist reconciled to final-plan.md; status Planned"
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
# Verification Checklist: Rollup Aggregation Pack

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md
  - **Evidence**: Pending — `spec.md` REQ-001..011 reflect the synthesis verdict (numeric-first, shared predicate, modal in scope, harness bootstrap); verification runs at build time.
- [ ] CHK-002 [P0] Technical approach defined in plan.md
  - **Evidence**: Pending — `plan.md` locks the Aggregate.ts design, per-kind semantics table, and exact call sites (`RelationRollup.ts:123-128`, `SummaryRenderer.ts:431-462`, `ChartAggregation.ts:775-797`).
- [ ] CHK-003 [P1] Dependencies identified and available
  - **Evidence**: Pending — phase `depends_on: none`; unblocks `003-reports-computed-fields`; Vitest devDependency present but harness missing until bootstrapped.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes fork lint/format checks
  - **Evidence**: Pending — run the fork's lint on `Aggregate.ts` and the edited call-site files.
- [ ] CHK-011 [P0] No console errors or warnings
  - **Evidence**: Pending — dev-view check after wiring the new kinds.
- [ ] CHK-012 [P1] Empty/invalid input handling matches the locked semantics table for every kind — and the three percent cases are NOT conflated
  - **Evidence**: Pending — plan.md locked-semantics matrix encoded in tests. Numeric/date kinds: empty → `null`; never null→0. Percent: **0 related rows → `0`** (empty relation); **N rows all empty → percentEmpty `100` / percentFilled `0`** (all-null targets); **missing target → `null`** via `emptyRollupValue` (`:159-161`). Percent dispatches from `records` before `:126`, not from flattened `numbers`.
- [ ] CHK-013 [P1] Code follows fork patterns (EuroFormat isolated-module model)
  - **Evidence**: Pending — Aggregate.ts is module-level pure functions (not a class), raw-value returns, formatting at call sites.
- [ ] CHK-014 [P1] Exhaustive dispatch — no fallthrough to sum
  - **Evidence**: Pending — `aggregateRollup` switch dispatches every new kind explicitly before the sum/avg tail; the tail is `aggregation === "sum"` only (grep confirms no `else sum`); an unknown id cannot silently SUM.
- [ ] CHK-015 [P1] Aggregate.ts is cycle-free and coercion-free
  - **Evidence**: Pending — `Aggregate.ts` has no import from `ChartAggregation.ts` / `SummaryRenderer.ts` / `RelationRollup.ts`; API takes coerced `readonly number[]` / timestamps / `(total, emptyCount)`, never `CellValue[]`; `toChartNumber` / `toDateTimestamp` stay at call sites.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All P0 acceptance criteria met (REQ-001 through REQ-004)
  - **Evidence**: Pending — REQ-001..004 in `spec.md` mapped to passing checks.
- [ ] CHK-021 [P0] Unit tests pass for all Aggregate.ts kinds via the bootstrapped harness
  - **Evidence**: Pending — `npx vitest run` green on table-driven `Aggregate.test.ts` (`vitest.config.ts` requires the created `src/__tests__/setup.ts` stub).
- [ ] CHK-022 [P1] Three-surface agreement (SC-002): rollup columns, footers, and charts render the same value per new kind
  - **Evidence**: Pending — manual view check on a sample relation; empty-render conventions preserved per surface (cell empty / footer blank / chart 0).
- [ ] CHK-023 [P1] Edge-case matrix verified (empty relation, all-null, single value, even median, mixed types, invalid dates, NaN)
  - **Evidence**: Pending — single value: min=max=median=value, range=`0`; even-length median = mean of middle two (never nearest-rank); NaN dropped by `toChartNumber`.
- [ ] CHK-024 [P1] New kinds type as `"number"` everywhere; modal offers them filtered by target field type
  - **Evidence**: Pending — all five eligibility clones consume `isNumericRollupKind` (`RowPipeline.ts`, `ColumnDisplay.ts`, `SummaryRenderer.ts`, `ChartAggregation.ts` ×2); the predicate covers numeric + percent ids only (not `earliest`/`latest`); modal shows numeric kinds only for numeric targets, earliest/latest only for date-like targets.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-025 [P0] Display-only verified — rendering writes nothing to frontmatter
  - **Evidence**: Pending — `git diff` on rendered notes shows no frontmatter change; no vault-write calls introduced in any new path.
- [ ] CHK-026 [P0] Rollup-of-rollup still returns empty
  - **Evidence**: Pending — manual render check; guard at `RelationRollup.ts:101` preserved byte-for-byte (Notion parity).
- [ ] CHK-027 [P1] Percent denominators correct and distinct from average's
  - **Evidence**: Pending — percentEmpty/Filled divide by total rows including empties (`0` when total is 0); N rows all empty → percentEmpty `100` / percentFilled `0`; missing target → `null` via `emptyRollupValue`; percent dispatches from `records` before `:126`, not from flattened `numbers`; average keeps its non-empty denominator unchanged (`RelationRollup.ts:126-128`).
- [ ] CHK-028 [P1] Date display mapping — `earliest`/`latest` render as dates, not `String(Date)`
  - **Evidence**: Pending — `getColumnDisplayType` (`ColumnDisplay.ts:18-23`) and `RowPipeline.withComputedResultTypes` (`:143-147`) map `earliest|latest` → `"date"` (separate from `isNumericRollupKind`); cells use `renderDate` / `parseDateTimeParts(...)?.dateKey` like footers (`SummaryRenderer.ts:552`); footer date-ms RANGE fallback (`:457-459`) preserved so date RANGE does not regress.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets or credentials
  - **Evidence**: Pending — review of `Aggregate.ts` and call-site diffs.
- [ ] CHK-031 [P0] No telemetry or network calls added
  - **Evidence**: Pending — diff review; MIT-forkable constraint.
- [ ] CHK-032 [P1] Mobile-safe: same code path on mobile, no desktop-only APIs
  - **Evidence**: Pending — mobile vault test of the new rollup kinds; median O(n log n) acceptable at relation sizes with `targetCache` avoiding repeated scans.
- [ ] CHK-033 [P1] iCloud-safe: idempotent display-only renders cannot churn sync
  - **Evidence**: Pending — ComputedSync vocabulary stays `"display-only"`; renders write nothing, so iCloud has no bytes to conflict over.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
  - **Evidence**: Pending — `spec.md`, `plan.md`, and `tasks.md` all describe the same module, call sites, and ranked order from `research/synthesis.md`.
- [ ] CHK-041 [P1] Code comments adequate (durable WHY only)
  - **Evidence**: Pending — comment-hygiene review of the new module.
- [ ] CHK-042 [P2] Upstream PR description drafted (candidate upstream patch)
  - **Evidence**: Pending — optional; only if the rebase stays clean.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Diff limited to the files listed in spec.md §Files to Change
  - **Evidence**: Pending — `git status`/diff inventory at completion (Aggregate.ts + types.ts + RelationRollup.ts + SummaryRenderer.ts + ChartAggregation.ts + RowPipeline.ts + ColumnDisplay.ts + RelationRollupConfigModal.ts + test files).
- [ ] CHK-051 [P1] No scratch/temp files left in the fork
  - **Evidence**: Pending — final working-tree sweep.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 10 | 0/10 |
| P1 Items | 14 | 0/14 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-08-24
**Verified By**: Pending — no verification run yet (phase status: Planned)

<!-- /ANCHOR:summary -->
