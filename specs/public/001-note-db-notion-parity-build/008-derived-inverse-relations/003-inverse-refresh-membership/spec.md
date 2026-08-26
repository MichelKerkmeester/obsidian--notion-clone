---
title: "Feature Specification: Inverse Refresh Membership"
description: "Register inverse sourceDatabaseIds and sourcePaths in both buildRowsWithRelations copies so handleDataChangeBatch refreshes an open Report view when an Expense is created, retargeted, or edited, without writing the Report file."
trigger_phrases:
  - "inverse refresh membership"
  - "sourceDatabaseIds"
  - "relationTargetDatabases"
  - "handleDataChangeBatch inverse"
  - "buildRowsWithRelations"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Inverse Refresh Membership

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `008-derived-inverse-relations` |
| **Parent Spec** | ../spec.md |
| **Phase** | 3 of 3 |
| **Predecessor** | 002-rollup-inverse-resolution |
| **Successor** | None |
| **Handoff Criteria** | With a Report view open, changing Expense.Month updates inverse count without a manual refresh; Report file is not written |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 3 of 3** — Parent: [`../spec.md`](../spec.md) · Predecessor: `002-rollup-inverse-resolution`. Hunk 2 is in-scope, not optional: without it inverse counts stay stale.

This child is synthesis ranked item 7 plus `research/final-plan.md` step 4 and the write-path half of step 6. Today `relationTargetDatabases` is only local relation *targets* (`DatabaseView.ts:3363-3368` / `EmbeddedDatabaseRenderer.ts:3212-3218`). A Report that only has rollup columns has zero local relations, so `handleDataChangeBatch` (`DatabaseView.ts:2120-2128`) never refreshes when an Expense is edited. Do not edit `planRelationTargetChange.ts` unless a relation `targetDatabaseId` change on Expenses must drop stale Report rollups; if needed, that is a one-line consumer, not a new planner.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
`handleDataChangeBatch` refreshes when `relationTargetPaths.has(change.path)` **or** the record matches `relationTargetDatabases` (`DatabaseView.ts:2120-2128`). Those sets are filled from **local** relation columns on the viewed DB (`3362-3372`; duplicate at `EmbeddedDatabaseRenderer.ts:3210-3221`): `targetIds` = `columns.filter(type === "relation")`. A Report that only has rollup columns (the 008 default surface) has **zero** local relations. Editing or creating an Expense does not refresh the Report view. Stale inbound counts are the silent failure mode — the same class as 001's "silent empty SUM". Child 002's `sourcePaths` union into `targetPaths` is not enough for a first-time `Month` link whose path was not in the previous `targetPaths` set.

### Purpose
After inverse rollups, include databases in `sourceDatabaseIds` (Expenses) from Hunk 1's `RelationRollupResult` (or equivalent) and their `sourcePath`s in `relationTargetDatabasePaths` in **both** `buildRowsWithRelations` copies (`DatabaseView.ts:3348-3372` and `EmbeddedDatabaseRenderer.ts:3190-3221`). Prefer the tiny helper next to `buildRelationInverse` (child 001) so the two view copies do not diverge. That makes `handleDataChangeBatch` refresh Reports when an Expense is created, retargeted, or edited. The Report file is not written.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `src/views/DatabaseView.ts` `buildRowsWithRelations` (`:3348-3372`): after inverse rollups, include `sourceDatabaseIds` from Hunk 1's `RelationRollupResult` (or equivalent) in `relationTargetDatabases` and inverse `sourcePath`s in `relationTargetDatabasePaths` so `handleDataChangeBatch` (`:2120-2128`, also confirm `:2101-2140`) refreshes Reports.
- `src/views/EmbeddedDatabaseRenderer.ts` `buildRowsWithRelations` (`:3190-3221`): same membership change. Call the tiny helper next to `buildRelationInverse` rather than forking the merge.
- Write-path proof: set Expense.Month; assert Report path is not passed to `processFrontMatter`; `enqueueWrite` stays private (`DataSource.ts:99`) — do not export it. Spy `processFrontMatter` / `vault.create` or assert Report mtime/content unchanged (`research/final-plan.md`).
- Manual accept: with a Report view open, changing Expense.Month to that Report updates the inverse `count` without a manual refresh; Report file is not written; empty Month → 0/`[]`; dangling omitted.
- Diff gate: `git diff --stat` is `RelationInverse.ts` + `RelationRollup.ts` + the two `buildRowsWithRelations` copies (or the shared helper they both call). Grep the diff for `electron` / `node:` / `fs` / telemetry.

### Out of Scope
- `RelationInverse.ts` scan (child 001) and `RelationRollup.ts` resolution (child 002), except calling the existing membership helper.
- `planRelationTargetChange.ts` rewrite (only a one-line consumer if a `targetDatabaseId` change on Expenses must drop stale Report rollups).
- `RelationLinks.ts` chips, `RecordDetailPanel.ts` Backlinks, `CellRenderer.ts` inbound badge, `types.ts`, any `syncWrites` ON path.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/DatabaseView.ts` | Modify | Hunk 2: register inverse `sourceDatabaseIds` / `sourcePaths` in `buildRowsWithRelations` (`:3348-3372`) |
| `src/views/EmbeddedDatabaseRenderer.ts` | Modify | Hunk 2 mirror: same membership in `buildRowsWithRelations` (`:3190-3221`) |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Both `buildRowsWithRelations` copies register inverse sources | After inverse rollups, `relationTargetDatabases` includes Hunk 1's `sourceDatabaseIds` (or equivalent; Expenses) and `relationTargetDatabasePaths` includes inverse `sourcePath`s (`DatabaseView.ts:3348-3372`, `EmbeddedDatabaseRenderer.ts:3190-3221`) |
| REQ-002 | Live Report view refreshes without a manual reload | With a Report view open, creating, retargeting, or editing Expense.Month to that Report updates inverse `count`/`list` via `handleDataChangeBatch` (`:2120-2128`), including first-time links whose paths were not in the previous `targetPaths` set |
| REQ-003 | Report file is not a write participant | Setting Expense.Month does not pass the Report path to `processFrontMatter`; `RelationInverse.ts` still never joins `writeQueues` (`DataSource.ts:89,99-120`) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Two view copies stay aligned | Both copies call the tiny helper next to `buildRelationInverse`; do not rewrite `planRelationTargetChange.ts` unless a one-line consumer is required; grep the shipped diff for `electron` / `node:` / `fs` / telemetry |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: With a Report view open, changing `Expenses.Month` to that Report updates the inverse `count`/`list` without a manual refresh (parent SC-006).
- **SC-002**: The Report file's mtime/content is unchanged by that click; Expense `processFrontMatter` is the only write (parent SC-001).
- **SC-003**: The shipped diff stays `RelationInverse.ts` + `RelationRollup.ts` + the two `buildRowsWithRelations` copies (or the shared helper); no `types.ts` touch (parent SC-005).

### Acceptance Scenarios

- **Given** a Report view is open and an Expense's `Month` link is created or retargeted to that Report, **when** `handleDataChangeBatch` runs, **then** the Report's inverse `count`/`list` refreshes without a manual reload.
- **Given** that same click, **when** writes are inspected, **then** the Report path is not passed to `processFrontMatter`.
- **Given** Expense.Month is emptied, **when** the Report view refreshes, **then** the inverse is 0/`[]` (hide-when-empty via `emptyRollupValue`).
- **Given** a dangling wikilink, **when** the inverse scan runs, **then** the target shows no bogus inbound row and no file is created.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Refresh omitted | Inverse counts stay stale (the real UX bug) | Hunk 2 is in-scope; do not keep SC-005 at "two hunks" if that drops DatabaseView |
| Risk | Only `DatabaseView.ts` updated | Embedded reports stay stale | Same helper in both copies |
| Risk | Spy `enqueueWrite` | Method is private (`DataSource.ts:99`) | Do not export it; assert Report file untouched |
| Risk | `planRelationTargetChange` assumed sufficient | It only walks rollups on the *source* DB whose `relationField` matches a changed *local* relation (`:23-49`) | Do not treat it as the refresh path; register `sourceDatabaseIds` instead |
| Dependency | Children 001 and 002 | No `sourceDatabaseIds` on `RelationRollupResult` (or equivalent) / no inverse rollups | Start after Hunk 1 lands the handoff |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: rollup-only SC-002 (no `RecordDetailPanel.ts` waiver); `syncWrites` OFF forever in this phase; YAML v1 for inverse `relationField`; chip window N=25 waits for a chip surface.
<!-- /ANCHOR:questions -->
