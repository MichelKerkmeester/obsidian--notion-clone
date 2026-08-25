---
title: "Implementation Summary: Date Aggregation Pack"
description: "Planned earliest/latest rollup kinds. Not yet implemented in the fork."
trigger_phrases:
  - "date aggregation summary"
  - "earliest latest"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/002-rollup-aggregation-pack/002-date-aggregation-pack"
    last_updated_at: "2026-08-25T19:05:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored date-pack child from synthesis rank 5 and final-plan step 8"
    next_safe_action: "Implement earliest/latest after the numeric same-diff child"
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
    completion_pct: 0
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
| **Completed** | Not yet (Planned) |
| **Level** | 1 |
| **Actual Effort** | Not started |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Nothing in the fork yet. This child is Planned: date kinds after the numeric module exists.

Planned work extends `src/data/Aggregate.ts` with `earliest`/`latest`, dispatches them from `src/data/RelationRollup.ts` before `:126`, and maps those ids to `"date"` in `ColumnDisplay.ts` / `RowPipeline.ts`.

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

Not delivered. Starts only after `001-numeric-aggregate-module` has `Aggregate.ts` on disk.
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
| `npx vitest run` after earliest/latest tests | Not run (Planned) |
| Scenario 2 dateKey match | Not run (Planned) |
| `validate.sh` on this folder `--strict` | Pending after authoring |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **No Notion start→end date-range kind.** v1 keeps fork `Nd` at the formatter.
2. **Depends on child 001.** There is no second module name; do not create `RollupAggPack.ts`.
<!-- /ANCHOR:limitations -->
