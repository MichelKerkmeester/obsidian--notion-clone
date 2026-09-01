---
title: "Implementation Plan: Rollup Inverse Resolution"
description: "Plan for key-scoped inverse resolution inside RelationRollup.ts after a local relationField miss, feeding inbound records to existing aggregateRollup, unioning sourcePaths into targetPaths, and returning sourceDatabaseIds (or equivalent) on RelationRollupResult."
trigger_phrases:
  - "rollup inverse plan"
  - "key-scoped inverse"
  - "aggregateRollup inbound"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/008-derived-inverse-relations/002-rollup-inverse-resolution"
    last_updated_at: "2026-08-27T12:27:53Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Rollup Inverse Resolution

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork `Obsidian Plugin/src` |
| **Storage** | None — rollups remain display-only (`types.ts:69`) |
| **Testing** | Extend `RelationInverse.test.ts` with `buildRelationRollups` round-trips |

### Overview
Hunk 1 is one `RelationRollup.ts` edit: local miss → key-scoped inverse → existing `aggregateRollup`. Union inverse `sourcePaths` into `targetPaths` and return `sourceDatabaseIds` (or equivalent) on `RelationRollupResult` in the same diff so later view membership can see Expense paths and the Expenses database. Do not add kinds. Do not change `RollupConfig`.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Child 001 specified as the scan owner.
- [x] Synthesis ranks 2 and 4 plus final-plan step 3 read; key-scoped union recorded.
- [x] Early-return trap at `:36` recorded: inverse is not a sole entry.

### Definition of Done
- [ ] Local miss feeds inbound records to `aggregateRollup` (`:92-129`).
- [ ] Local relation still wins; unresolved inverse is `emptyRollupValue`.
- [ ] Inverse `sourcePaths` unioned into `targetPaths`.
- [ ] Inverse `sourceDatabaseIds` (or equivalent) returned on `RelationRollupResult`.
- [ ] Round-trip `count === 2` / `list` green; `types.ts` and both view files untouched.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
EuroFormat call site 1: one rebase-safe hunk in `RelationRollup.ts`. Resolution rule only.

### Key Components
- **Local-miss branch (`:62-66`)**: after `:36`, call `buildRelationInverse` and slice `inboundByPath` by current `sourceRecord.file.path` and `config.relationField`.
- **`aggregateRollup` (`:92-129`)**: unchanged kinds; inbound `NoteRecord[]` is just another related set.
- **`targetPaths` (`:21,76`)**: union inverse `sourcePaths` so Expense paths are visible to existing `relationTargetPaths` assignment.
- **`sourceDatabaseIds` (`RelationRollupResult` `:18-22`)**: return inverse source DB ids (or equivalent) on the same result so child 003 can register Expenses without a second scan.

### Data Flow
Viewed DB with rollup columns → `buildRelationRollups` passes `:36` → local `relationField` miss → `buildRelationInverse` → key-scoped inbound records → `aggregateRollup` → `row.computed[col.key]`; inverse `sourcePaths` unioned into `targetPaths` and `sourceDatabaseIds` (or equivalent) returned on `RelationRollupResult`. Empty inbound → `emptyRollupValue`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Producers: `RelationRollup.ts` miss branch, including the `sourcePaths`→`targetPaths` union and `sourceDatabaseIds` (or equivalent) on `RelationRollupResult`. Consumers not in this child: `DatabaseView.buildRowsWithRelations` / `EmbeddedDatabaseRenderer.buildRowsWithRelations` (child 003) register those ids on `relationTargetDatabases`. Unchanged: `types.ts`, `RelationLinks.ts`, `CellRenderer.ts` (already renders `row.computed`). Invariant: never a second scanner; local relation always wins.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 left `buildRelationInverse` and `sourcePaths` / `sourceDatabaseIds`.
- [ ] Confirm live lines `RelationRollup.ts:18-22,36,58-88,62-66,92-129,21,76,159-160`.

### Phase 2: Core Implementation
- [ ] Local-miss inverse resolution + `sourcePaths` union + `sourceDatabaseIds` (or equivalent) on `RelationRollupResult` in one `RelationRollup.ts` edit.
- [ ] Add rollup round-trip cases to `RelationInverse.test.ts` (DB that has rollup columns).

### Phase 3: Verification
- [ ] `count === 2` / `list` contains both Expenses; result includes Expenses in `sourceDatabaseIds` (or equivalent); local key still forward; empty → `emptyRollupValue`.
- [ ] Confirm `types.ts` and both view files untouched.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Integration | Inverse `count === 2` / `list` via `aggregateRollup`; `sourceDatabaseIds` (or equivalent) on the result includes Expenses; local relation still wins; empty fail-closed | Vitest (extend `RelationInverse.test.ts`) |
| Unit | Child 001 fixtures still green | Vitest |
| Manual | Optional YAML `relationField: "Month"` on a Report (child 003 live refresh) | Obsidian fork |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-relation-inverse-module` | Internal | Planned first | No `buildRelationInverse` |
| Existing `aggregateRollup` (`:92-129`) | Internal | Exists | Do not add kinds |
| Child 003 view membership | Internal | Later | `sourcePaths` in `targetPaths` and `sourceDatabaseIds` on `RelationRollupResult` (or equivalent) are the Hunk 1 handoff; child 003 still registers them |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Inverse used when a local relation exists; all inbound keys mixed; `RollupConfig` shape changed; second scanner invented.
- **Procedure**: Revert `RelationRollup.ts` (and round-trip tests). Leave `RelationInverse.ts` (child 001) intact.
<!-- /ANCHOR:rollback -->
