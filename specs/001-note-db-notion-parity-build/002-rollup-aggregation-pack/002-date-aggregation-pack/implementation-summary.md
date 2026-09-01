---
title: "Implementation Summary: Date Aggregation Pack"
description: "Shipped earliest/latest rollup kinds, gate-green and Sonnet-verified PASS."
trigger_phrases:
  - "date aggregation summary"
  - "earliest latest"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/002-rollup-aggregation-pack/002-date-aggregation-pack"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Completion docs reconciled to shipped state; gate green; Sonnet-verified"
    next_safe_action: "None — sub-phase complete"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-date-aggregation-pack"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Summary

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 002-date-aggregation-pack |
| **Completed** | 2026-08-26 — commit `58490ee` on branch `impl` |
| **Level** | 1 |
| **Actual Effort** | Shipped as one commit |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Shipped in commit `58490ee` on branch `impl`. `src/data/Aggregate.ts` now exports `earliest`/`latest` returning `Date | null`; `src/data/RelationRollup.ts` dispatches them before the numeric empty-return; `ColumnDisplay.ts` and `RowPipeline.ts` map those ids to `"date"` display type so cells render via `renderDate`/`parseDateTimeParts`, not `String(Date)` (confirmed in Sonnet verification).

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `spec.md` | Authored | Date-pack scope including display-type map |
| `plan.md` | Authored | Call-site coercion and formatter split |
| `tasks.md` | Authored | Rank-5 / step-8 task list |
| `implementation-summary.md` | Authored | Honest pre-build record |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Delivered as commit `58490ee` on branch `impl`, after `001-numeric-aggregate-module` (`b83d666`) landed `Aggregate.ts`, per the build-order requirement.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Keep `earliest\|latest` out of `isNumericRollupKind` | They must type as `"date"`, not `"number"`; otherwise cells hit `String(Date)` |
| Extract dates before `numbers.length === 0` | Flatten+numeric empty return would hide all-date relations |
| Keep footer date-ms RANGE local | Aggregate `range` is numeric; `Nd` chrome is `SummaryRenderer.ts:551-556` |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx vitest run` after earliest/latest tests | Pass — tsc0/build0/vitest green (commit `58490ee`) |
| Scenario 2 dateKey match | Confirmed — Sonnet verification traced `earliest\|latest` → `"date"` mapping in `ColumnDisplay.ts:19-23` / `RowPipeline.ts:150-155` |
| Full Vitest suite at Sonnet re-verification | Pass — 160/160 (2026-08-26) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **No Notion start→end date-range kind.** v1 keeps fork `Nd` at the formatter.
2. **Depends on child 001.** There is no second module name; do not create `RollupAggPack.ts`.
<!-- /ANCHOR:limitations -->
