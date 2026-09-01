---
title: "Implementation Summary: Rollup Inverse Resolution"
description: "Planned key-scoped inverse resolution inside RelationRollup.ts. Not yet implemented in the fork."
trigger_phrases:
  - "rollup inverse summary"
  - "key-scoped inverse"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/008-derived-inverse-relations/002-rollup-inverse-resolution"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Completion docs reconciled to shipped state; gate green; Sonnet-verified"
    next_safe_action: "None outstanding for this sub-phase"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-rollup-inverse-resolution"
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
| **Spec Folder** | 002-rollup-inverse-resolution |
| **Completed** | Complete — shipped `90c335d` |
| **Level** | 1 |
| **Actual Effort** | Not separately tracked |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Shipped: Hunk 1 in `src/data/RelationRollup.ts`. After `relationColumns.get(config.relationField)` misses and the `:36` rollup-columns gate has passed, the rollup resolves a **key-scoped** inverse (`column.key === config.relationField && column.type === "relation" && column.relationConfig.targetDatabaseId === sourceDatabase.id`) and feeds inbound records for the current row to the existing `aggregateRollup`. Inverse `sourcePaths` are unioned into `targetPaths`; `sourceDatabaseIds` is returned on `RelationRollupResult` for child 003 to consume. No new aggregation kinds; `types.ts`/`RollupConfig` shape untouched. `RelationInverse.test.ts` was extended with round-trip `count`/`list` cases against a DB with rollup columns.

Independent Sonnet 5 review confirmed the handoff (`sourceDatabaseIds` produced at `RelationInverse.ts:42,80`, re-aggregated at `RelationRollup.ts:31,85`) and confirmed local-relation-precedence and empty-inbound behavior via tests.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/data/RelationRollup.ts` | Modified (`90c335d`) | Key-scoped inverse resolution after local miss; +44/-6 |
| `src/data/RelationInverse.test.ts` | Extended (`90c335d`) | Round-trip `count`/`list` cases |
| `spec.md` | Authored | Key-scoped resolution and fail-closed empty |
| `plan.md` | Authored | Call inverse only after the `:36` gate |
| `tasks.md` | Authored | T003–T004 atomic RelationRollup.ts unit |
| `implementation-summary.md` | Updated | Shipped-state record |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Delivered after `001-relation-inverse-module` landed `RelationInverse.ts`; gated (tsc 0 / build 0 / vitest green) and committed at `90c335d`.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Resolution rule, no `types.ts` | Final-plan: a new config field is a schema migration and a fourth-file risk |
| Key-scoped union | A Report rollup with `relationField: "Month"` must not swallow `Sales.Report` |
| Call inverse only after `:36` | Rollup-only SC-002: no inverse work on DBs with zero rollup columns |
| Hide-when-empty is `emptyRollupValue` | Ranked item 4 has no new persistence under the rollup-only default |
| Union `sourcePaths` here, register databases in child 003 | `targetPaths` assignment already exists (`DatabaseView.ts:3362`); first-time Expense creates still need `sourceDatabaseIds` |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Inverse `count === 2` / `list` via `aggregateRollup` | **PASS** — round-trip cases green |
| `npx vitest run src/data/RelationInverse.test.ts` | **PASS** — 12/12 (160/160 whole suite at review time) |
| `npx tsc --noEmit` | **PASS** — exit 0 |
| Independent Sonnet 5 review | **PASS** on correctness/coverage (`../research/sonnet-verification.md`) |
| `validate.sh` on this folder `--strict` | Not re-run by this reconciliation pass |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Live views can still go stale from this sub-phase's diff alone.** A Report with only rollup columns has zero local relations, so `relationTargetDatabases` stays empty until child 003's refresh-membership wiring (shipped separately, `fdaf730`).
2. **YAML v1.** `RelationRollupConfigModal.ts` still lists only local relations; inverse `relationField` is hand-edited.
3. **No chips.** Rollup `list`/`count` render as ordinary computed cells (`CellRenderer.ts:115-116,656`) — deferred by design.
<!-- /ANCHOR:limitations -->
