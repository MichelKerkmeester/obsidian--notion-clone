---
title: "Feature Specification: Rollup Inverse Resolution"
description: "After a local relationField miss, resolve that key as a foreign relation targeting this DB, feed inbound NoteRecords to existing aggregateRollup, union inverse sourcePaths into targetPaths, and return sourceDatabaseIds (or equivalent) on RelationRollupResult. No new aggregation kinds and no types.ts change."
trigger_phrases:
  - "rollup inverse resolution"
  - "key-scoped inverse"
  - "relationField miss"
  - "aggregateRollup inbound"
  - "emptyRollupValue"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/008-derived-inverse-relations/002-rollup-inverse-resolution"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Rollup Inverse Resolution

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-25 |
| **Branch** | `008-derived-inverse-relations` |
| **Parent Spec** | ../spec.md |
| **Phase** | 2 of 3 |
| **Predecessor** | 001-relation-inverse-module |
| **Successor** | 003-inverse-refresh-membership |
| **Handoff Criteria** | Local miss resolves by key into aggregateRollup; sourcePaths unioned into targetPaths; sourceDatabaseIds (or equivalent) returned on RelationRollupResult; local relation still wins; unresolved inverse is emptyRollupValue |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 2 of 3** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-relation-inverse-module` · Successor: `003-inverse-refresh-membership`. Depends on child 001's `buildRelationInverse`.

This child is synthesis ranked items 2 (rollup-over-inverse) and 4 (hide-when-empty via `emptyRollupValue`) plus `research/final-plan.md` step 3. Call `buildRelationInverse` only after `buildRelationRollups` has passed its `:36` gate and a specific `relationField` misses locally. Do not edit the two view copies here.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion rollups compute over the related-pages set on whichever side the rollup column lives. Today `buildRelationRollups` only follows a *local* `RollupConfig.relationField` and writes `emptyRollupValue` when that key is missing (`src/data/RelationRollup.ts:62-66`). A Report with `relationField: "Month"` and no local `Month` column therefore cannot count Expenses. The full fan-in index unions *all* inbound edges; a Report rollup with `relationField: "Month"` must match columns **named `Month`** that target Reports (`research/final-plan.md` key-scoped union). Hide-when-empty is already `emptyRollupValue` (`:159-160`) plus ordinary rollup cells (`CellRenderer.ts:115-116,656`).

### Purpose
After `relationColumns.get(config.relationField)` misses (`RelationRollup.ts:62-66`) and the `:36` gate has passed, resolve inverse by key: columns in `context.databases` with `column.key === config.relationField && column.type === "relation" && column.relationConfig.targetDatabaseId === context.sourceDatabase.id`. Feed those inbound `NoteRecord`s for the current `sourceRecord` into existing `aggregateRollup` (`:92-129`). Union inverse `sourcePaths` into `targetPaths` (`:21,76`). Return `sourceDatabaseIds` (or equivalent) on `RelationRollupResult` (`:18-22`). Do not add aggregation kinds. Do not change `RollupConfig` shape (`types.ts:39-45`).
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `src/data/RelationRollup.ts:58-88` (Hunk 1): after local miss, call `buildRelationInverse` (not as the sole entry; the function already passed `:36`). Build inbound `NoteRecord[]` for the current `sourceRecord` from `inboundByPath.get(sourceRecord.file.path)` filtered to that relation key (or compute that slice lazily).
- Key-scoped union, not all inbound regardless of column key. `Sales.Report` (different key) is a second rollup column.
- Pass inbound records to existing `aggregateRollup` (`:92-129`). No new aggregation kinds. Local relation always wins if the key exists on the viewed DB.
- Union inverse `sourcePaths` into `targetPaths` (`:21,76`) so existing `relationTargetPaths` assignment (`DatabaseView.ts:3362`) sees Expense paths. Return `sourceDatabaseIds` (or equivalent) on `RelationRollupResult` (`:18-22`) so child 003 can register the Expenses database in `relationTargetDatabases` (`DatabaseView.ts:3363-3372`). Child 003 still performs that registration; this child owns the handoff.
- Fail-closed: unresolved inverse → `emptyRollupValue` (`:159-160`); never a second scanner. Empty inbound is hide-when-empty (ranked item 4) with no new persistence.
- Integration tests: fixture a DB that *has* rollup columns so `buildRelationRollups` does not early-return; inverse `count === 2` / `list` contains both Expenses via `aggregateRollup`; result `sourceDatabaseIds` (or equivalent) includes the Expenses database (`research/final-plan.md` step 6).

### Out of Scope
- `RelationInverse.ts` implementation (child 001).
- `DatabaseView.ts` / `EmbeddedDatabaseRenderer.ts` `relationTargetDatabases` membership (child 003). Do not edit `planRelationTargetChange.ts` here.
- `RelationLinks.ts` chips, `RecordDetailPanel.ts`, `types.ts`, `RelationRollupConfigModal.ts` (YAML `rollupConfig.relationField: "Month"` is v1).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/RelationRollup.ts` | Modify | Hunk 1: key-scoped inverse resolution after local miss; union `sourcePaths` into `targetPaths`; return `sourceDatabaseIds` (or equivalent) on `RelationRollupResult` |
| `src/data/RelationInverse.test.ts` | Modify | Add round-trip `count`/`list` cases that call `buildRelationRollups` on a DB with rollup columns |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Local miss resolves as a key-scoped inverse | After `relationColumns.get(config.relationField)` misses (`:62-66`) and `:36` has passed, match `column.key === config.relationField && column.type === "relation" && column.relationConfig.targetDatabaseId === sourceDatabase.id`; feed inbound records for the current row to `aggregateRollup` (`:92-129`) |
| REQ-002 | Local relation still wins | When the viewed DB has a relation column at `config.relationField`, the existing forward loop is unchanged and inverse is unused for that rollup |
| REQ-003 | Unresolved inverse fail-closes | Missing inverse match or empty inbound writes `emptyRollupValue` (`:159-160`); never invent a second scanner |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Inverse `sourcePaths` and `sourceDatabaseIds` reach Hunk 2 | Union inverse `sourcePaths` into `targetPaths` (`:21,76`) so `DatabaseView.ts:3362` can see Expense paths; return `sourceDatabaseIds` (or equivalent) on `RelationRollupResult` (`:18-22`) so child 003 can register Expenses in `relationTargetDatabases`; no `types.ts` / `RollupConfig` shape change |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A Report `count`/`list` over two Expenses with only forward `Month` links and no Report frontmatter relation yields `count === 2` and a list containing both Expenses via `aggregateRollup`.
- **SC-002**: A local relation key still uses the forward loop unchanged.
- **SC-003**: Unresolved inverse is `emptyRollupValue`; `RelationRollupResult` returns `sourceDatabaseIds` (or equivalent); `types.ts` and both view files are untouched in this child's diff.

### Acceptance Scenarios

- **Given** two Expenses store `Month` as a wikilink to a Report and the Report rollup uses `relationField: "Month"` with no local `Month` column, **when** `buildRelationRollups` runs, **then** `count` is 2 and `list` contains both Expenses.
- **Given** the viewed DB already has a local relation keyed `Month`, **when** the same rollup runs, **then** the forward loop is used and inverse is unused.
- **Given** `relationField: "Month"` but no source DB has a `Month` relation targeting this DB, **when** the rollup runs, **then** the cell is `emptyRollupValue`.
- **Given** a second source DB uses key `Report` instead of `Month`, **when** the `Month` rollup runs, **then** those rows are not included (key-scoped union).
- **Given** Hunk 1 resolves inbound Expenses, **when** `buildRelationRollups` returns, **then** `RelationRollupResult` includes those Expense paths in `targetPaths` and the Expenses database in `sourceDatabaseIds` (or equivalent).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Inverse called before the `:36` gate | Work on DBs with zero rollups; contradicts rollup-only SC-002 | Call inverse only inside the rollup loop after `:36` and a local miss |
| Risk | All-inbound instead of key-scoped | `Sales.Report` leaks into a `Month` rollup | Filter edges to `column.key === config.relationField` |
| Risk | New `RollupConfig` field | Schema migration and a fourth-file risk | Resolution rule only (`types.ts:39-45` unchanged) |
| Risk | `sourcePaths` unioned without `sourceDatabaseIds` on the result | Child 003 cannot register Expenses for first-time creates | Same `RelationRollup.ts` diff returns `sourceDatabaseIds` (or equivalent) on `RelationRollupResult` (`:18-22`) |
| Dependency | Child 001 exports | Cannot resolve inbound | Start after `buildRelationInverse` exists |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: resolution rule only (no schema field); YAML `rollupConfig.relationField: "Month"` on the Report; hide-when-empty is `emptyRollupValue`; chips stay deferred.
<!-- /ANCHOR:questions -->
