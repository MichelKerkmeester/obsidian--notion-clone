---
title: "Feature Specification: Count List Resolution"
description: "Bind Reports COUNT rollups plus a temporary list on file.name to prove relation resolution before any SUM key is chosen."
trigger_phrases:
  - "count list resolution"
  - "diagnostic list rollup"
  - "file.name list"
  - "relation resolution proof"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/001-live-reports-rollups/003-count-list-resolution"
    last_updated_at: "2026-08-25T19:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored COUNT plus diagnostic-list child from synthesis ranks 2 and 4 and final-plan step 7"
    next_safe_action: "Add COUNT and list/file.name after both relation sides exist"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-count-list-resolution"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Count List Resolution

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P0 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `001-live-reports-rollups` |
| **Parent Spec** | ../spec.md |
| **Phase** | 3 of 6 |
| **Predecessor** | 002-display-only-amount-types |
| **Successor** | 004-sum-rollups |
| **Handoff Criteria** | COUNT equals unique resolved children in the `list`/`file.name` inventory; empty Report shows COUNT `0` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 3 of 6** — Parent: [`../spec.md`](../spec.md) · Predecessor: `002-display-only-amount-types` · Successor: `004-sum-rollups`. COUNT and the diagnostic `list` are **one YAML change-set** (final-plan step 7). Do not split them. Not blocked on ops amount keys. Do not remove the `list` here — removal is child 006 after SC-001 and SC-002.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
A wrong amount key or empty relation is UI-indistinguishable from "no children" (`emptyRollupValue` → COUNT `0`, SUM `null`, `RelationRollup.ts:159-160`). There is **no Notice** on unresolved `targetDatabaseId` (`RelationRollup.ts:64-66`). COUNT short-circuits at `RelationRollup.ts:99` before any field lookup, so COUNT plus a `list` on `file.name` can prove resolution **before** amount keys exist. `list` dedupes via `stringifyValue` (`RelationRollup.ts:110-119`); targeting the amount field would collapse two children with the same amount into one entry.

### Purpose
Add Reports COUNT rollups of related children and a temporary `list` with `targetField: file.name` beside each of the three relations. Do not bind SUM. Do not name `median|min|max|range` in YAML (unknown id → sum at `RelationRollup.ts:126-128`).
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Reports rollup columns: COUNT of related children for Expenses / Sales / Income relations.
- Temporary `list` with `targetField: file.name` (or another unique identity field), not the amount key. Modal already special-cases `file.name` for count/list (`RelationRollupConfigModal.ts:146-147`).
- Existing kinds only (`types.ts:44`): `count` and `list`.

### Out of Scope
- SUM binding (child `004-sum-rollups`, gated on ops keys).
- Removing the diagnostic `list` (child `006-nowrite-proof-runbook` after accuracy and no-write proof).
- Snapshot columns (child `005-snapshot-audit-columns`).
- Extra Notion calculate functions in YAML.
- Fork `src/` edits.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Live finance vault Reports `db_view` note `database:` YAML | Modify | COUNT + `list`/`file.name` rollup column defs for the three relations |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | COUNT rollups exist for the three relations | COUNT short-circuits to record count (`RelationRollup.ts:99`). Empty Report shows COUNT `0`. |
| REQ-002 | Diagnostic `list` targets `file.name` | `targetField: file.name` (not cost/gross/net). `list` dedupes via `stringifyValue` (`RelationRollup.ts:110-119`). COUNT equals unique resolved children in the `list`. |
| REQ-003 | YAML names only existing kinds | Do not name `median\|min\|max\|range` (unknown id → sum at `RelationRollup.ts:126-128`). |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Lists stay until go-live proof | Do not remove `list` columns in this child. Removal is after SC-001 and SC-002 in child 006. |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: COUNT equals unique resolved children in the `list`/`file.name` inventory for a sample Report.
- **SC-002**: An empty Report shows COUNT `0` and does not crash (`RelationRollup.ts:159-160`).
- **SC-003**: No fork `src/` file differs because of this child.

### Acceptance Scenarios

- **Given** both relation sides exist, **when** COUNT and `list`/`file.name` load, **then** COUNT matches the unique names in the list (`RelationRollup.ts:99,110-119`).
- **Given** two children share the same amount, **when** `list` targets `file.name`, **then** both names appear (they would collapse if the list targeted the amount field).
- **Given** YAML named `median` as a rollup kind, **when** the engine ran, **then** it would silently SUM (`RelationRollup.ts:126-128`) — this child must not write that id.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | `list` on the amount field | Two children with the same amount collapse | Require `file.name` (`RelationRollup.ts:110-119`; modal `:146-147`) |
| Risk | Unknown kind id in YAML | Silent SUM (`RelationRollup.ts:126-128`) | Bind only `count` and `list` |
| Dependency | Child 001 both-sides wiring | COUNT of an empty relation is `0` and looks like success | Do not start until a sample Report relation resolves |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Ops amount keys are not required here (COUNT short-circuits before field lookup). Keep the `list` until child 006.
<!-- /ANCHOR:questions -->
