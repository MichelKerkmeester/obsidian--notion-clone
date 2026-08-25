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
    packet_pointer: "obsidian/002-note-db-notion-parity-build/008-derived-inverse-relations/002-rollup-inverse-resolution"
    last_updated_at: "2026-08-25T21:40:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored rollup inverse-resolution child from synthesis ranks 2 and 4 and final-plan step 3"
    next_safe_action: "Wire key-scoped inverse into RelationRollup.ts after a local relationField miss"
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
| **Spec Folder** | 002-rollup-inverse-resolution |
| **Completed** | Not yet (Planned) |
| **Level** | 1 |
| **Actual Effort** | Not started |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Nothing in the fork yet. This child is Planned: Hunk 1 so a Report `count`/`list` can consume inbound Expenses without a stored back-property.

Planned work edits `RelationRollup.ts` after a local `relationField` miss and extends `RelationInverse.test.ts` with rollup round-trips.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `spec.md` | Authored | Key-scoped resolution and fail-closed empty |
| `plan.md` | Authored | Call inverse only after the `:36` gate |
| `tasks.md` | Authored | T003–T004 atomic RelationRollup.ts unit |
| `implementation-summary.md` | Authored | Honest pre-build record |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. Starts only after `001-relation-inverse-module` has `RelationInverse.ts` on disk.
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
| Inverse `count === 2` / `list` via `aggregateRollup` | Not run (Planned) |
| `npx vitest run src/data/RelationInverse.test.ts` | Not run (Planned) |
| `validate.sh` on this folder `--strict` | Pending after authoring |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Live views can still go stale.** A Report with only rollup columns has zero local relations, so `relationTargetDatabases` stays empty until child 003.
2. **YAML v1.** `RelationRollupConfigModal.ts` still lists only local relations; inverse `relationField` is hand-edited.
3. **No chips.** Rollup `list`/`count` render as ordinary computed cells (`CellRenderer.ts:115-116,656`).
<!-- /ANCHOR:limitations -->
