---
title: "Tasks: Inverse Refresh Membership"
description: "Same-seam tasks for registering inverse sourceDatabaseIds in both buildRowsWithRelations copies so live Report views refresh on Expense edits without writing the Report file."
trigger_phrases:
  - "inverse refresh tasks"
  - "sourceDatabaseIds"
  - "handleDataChangeBatch inverse"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/008-derived-inverse-relations/003-inverse-refresh-membership"
    last_updated_at: "2026-08-25T21:40:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored inverse refresh-membership child from synthesis rank 7 and final-plan step 4"
    next_safe_action: "Register sourceDatabaseIds in both buildRowsWithRelations copies"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-inverse-refresh-membership"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Inverse Refresh Membership

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

T003–T004 are **one atomic view-membership seam**. Do not ship `DatabaseView.ts` without the `EmbeddedDatabaseRenderer.ts` copy.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm children 001–002 left `sourceDatabaseIds` (or equivalent) on `RelationRollupResult` / the membership helper and inverse rollups; read synthesis rank 7 and final-plan step 4 [15m]
- [ ] T002 Confirm live lines `DatabaseView.ts:2101-2140,2120-2128,3348-3401,3362-3372` and `EmbeddedDatabaseRenderer.ts:3190-3221,3210-3221`; confirm `planRelationTargetChange.ts:23-49` is not the refresh path [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Hunk 2 — `DatabaseView.buildRowsWithRelations` (`:3348-3372`)**: after inverse rollups, include `sourceDatabaseIds` from Hunk 1's `RelationRollupResult` (or equivalent) in `relationTargetDatabases` and inverse `sourcePath`s in `relationTargetDatabasePaths` via the helper next to `buildRelationInverse` so `handleDataChangeBatch` (`:2120-2128`) refreshes on Expense create/retarget/edit (`src/views/DatabaseView.ts`) [S]
- [ ] T004 **Hunk 2 mirror — `EmbeddedDatabaseRenderer.buildRowsWithRelations` (`:3190-3221`)** — same seam as T003: same helper, same membership; do not fork the merge (`src/views/EmbeddedDatabaseRenderer.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Write-path: set Expense.Month; assert Report path is not passed to `processFrontMatter`; do not export `enqueueWrite` (`DataSource.ts:99`); `SYNC_WRITES_DEFAULT === false` still holds [S]
- [ ] T006 Manual: with a Report view open, changing Expense.Month to that Report updates inverse `count` without a manual refresh; empty Month → 0/`[]`; dangling omitted; Report mtime unchanged (SC-001 / SC-002) [S]
- [ ] T007 `npx vitest run src/data/RelationInverse.test.ts` still green; `git diff --stat` is `RelationInverse.ts` + `RelationRollup.ts` + the two view copies (or the shared helper); grep the diff for `electron` / `node:` / `fs` / telemetry; `types.ts` untouched [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T004 shipped as one view-membership seam
- [ ] Manual T006 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 7
- **Parent final-plan**: `../research/final-plan.md` step 4 (write-path also step 6; diff gate step 5)
<!-- /ANCHOR:cross-refs -->
