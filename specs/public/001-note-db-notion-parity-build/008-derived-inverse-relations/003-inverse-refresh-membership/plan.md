---
title: "Implementation Plan: Inverse Refresh Membership"
description: "Plan for registering inverse sourceDatabaseIds and sourcePaths in both buildRowsWithRelations copies so live Report views refresh on Expense edits without writing the Report file."
trigger_phrases:
  - "inverse refresh plan"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Inverse Refresh Membership

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork `Obsidian Plugin/src` |
| **Storage** | None — inverse remains display-only; writes stay per edited Expense path (`DataSource.ts:89,99-120`) |
| **Testing** | Write-path assert Report untouched; manual live-view refresh |

### Overview
Hunk 2 is the two `buildRowsWithRelations` copies. After inverse rollups, register Expenses via `sourceDatabaseIds` / `sourcePaths` from Hunk 1's `RelationRollupResult` (or equivalent) so `handleDataChangeBatch` (`DatabaseView.ts:2120-2128`) sees Expense creates and retargets. Prefer the tiny helper next to `buildRelationInverse` so the copies do not diverge.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Children 001–002 specified; this child needs `sourceDatabaseIds` (or equivalent) on Hunk 1's `RelationRollupResult` and inverse rollups already computing.
- [x] Final-plan step 4 and synthesis rank 7 read; `planRelationTargetChange` ruled out as the refresh path.
- [x] `enqueueWrite` stays private; spy `processFrontMatter` instead.

### Definition of Done
- [ ] Both view copies register `sourceDatabaseIds` / inverse `sourcePath`s.
- [ ] Open Report view updates inverse `count` without a manual refresh when Expense.Month changes.
- [ ] Report file is not written.
- [ ] Diff stays the module + `RelationRollup.ts` + the two view copies (or the shared helper).
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
EuroFormat call site 2: two rebase-safe hunks that share one helper. Not a new planner.

### Key Components
- **`DatabaseView.buildRowsWithRelations` (`:3348-3372`)**: after filling local `targetIds`, also merge inverse membership.
- **`EmbeddedDatabaseRenderer.buildRowsWithRelations` (`:3190-3221`)**: same merge.
- **Helper next to `buildRelationInverse`**: pure merge of `sourceDatabaseIds` / `sourcePaths` from Hunk 1's `RelationRollupResult` (or equivalent) into the existing sets (child 001 already exports the fields; child 002 must return them on the rollup result).

### Data Flow
Inverse rollup result → helper merges source DBs/paths from `RelationRollupResult.sourceDatabaseIds` (or equivalent) → `relationTargetDatabases` / `relationTargetDatabasePaths` → `handleDataChangeBatch` (`:2120-2128`) refreshes the Report view. Expense write still goes through `enqueueWrite` keyed by the Expense path only.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Producers: the two `buildRowsWithRelations` copies. Consumers: `handleDataChangeBatch` (`DatabaseView.ts:2120-2128`). Unchanged: `planRelationTargetChange.ts` unless a one-line consumer is required; `RelationLinks.ts`; `RecordDetailPanel.ts`; `types.ts`. Invariant: Report path never joins `writeQueues`; both copies stay aligned.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 002 left inverse rollups plus `sourcePaths` on `targetPaths` and `sourceDatabaseIds` (or equivalent) on `RelationRollupResult`.
- [ ] Confirm live lines `DatabaseView.ts:2101-2140,2120-2128,3348-3401,3362-3372` and `EmbeddedDatabaseRenderer.ts:3190-3221,3210-3221`.

### Phase 2: Core Implementation
- [ ] Call the membership helper from `DatabaseView.buildRowsWithRelations`.
- [ ] Same call from `EmbeddedDatabaseRenderer.buildRowsWithRelations` in the same seam.

### Phase 3: Verification
- [ ] Live Report view refreshes on Expense.Month change; Report file untouched.
- [ ] Grep diff for `electron` / `node:` / `fs` / telemetry; confirm `types.ts` untouched.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Write-path | Report path not passed to `processFrontMatter`; Expense write only | Vitest or manual mtime/content |
| Manual | Open Report view; create/retarget Expense.Month; empty Month; dangling omitted | Obsidian fork / finance vault |
| Regression | Child 001–002 vitest still green; no `types.ts` | Vitest / `git diff --stat` |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-relation-inverse-module` | Internal | Planned first | No `sourceDatabaseIds` / helper |
| `002-rollup-inverse-resolution` | Internal | Planned second | No inverse rollup cells / no `sourceDatabaseIds` (or equivalent) on `RelationRollupResult` |
| `handleDataChangeBatch` (`:2120-2128`) | Internal | Exists | Do not invent a second refresh bus |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Only one view copy updated; Report file written; `enqueueWrite` exported; `planRelationTargetChange.ts` rewritten.
- **Procedure**: Revert `DatabaseView.ts` and `EmbeddedDatabaseRenderer.ts` together. Leave RelationInverse + RelationRollup (children 001–002) intact.
<!-- /ANCHOR:rollback -->
