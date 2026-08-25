---
title: "Feature Specification: Display-Only Amount Types"
description: "Pin Reports computedSyncMode to display-only and type child amount columns number/currency so iCloud stays quiet and SUM cannot ingest free text."
trigger_phrases:
  - "computed sync display-only"
  - "amount column types"
  - "icloud-safe rollups"
  - "number currency schema"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/001-live-reports-rollups/002-display-only-amount-types"
    last_updated_at: "2026-08-25T19:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored display-only and amount-types child"
    next_safe_action: "Pin computedSyncMode: display-only in Reports YAML after inventory exists"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-display-only-amount-types"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Display-Only Amount Types

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
| **Phase** | 2 of 6 |
| **Predecessor** | 001-reports-relation-wiring |
| **Successor** | 003-count-list-resolution |
| **Handoff Criteria** | YAML literally contains `display-only`; three child amount columns typed `number` or `currency` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 2 of 6** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-reports-relation-wiring` · Successor: `003-count-list-resolution`. Synthesis ranks 3 and 6; final-plan steps 5–6. Display-only is independent of SUM and is the iCloud P0 — pin it in this YAML edit, not in the SUM change-set.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The fork defaults to display-only (`ComputedSync.ts:3`; load-time coerce at `DataSource.ts:787`), but leaving the view-config UI on `automatic` would `updateFrontmatter` computed keys and enqueue Report/child paths. Real write-back early-returns are `DatabaseView.ts:10244` and `EmbeddedDatabaseRenderer.ts:2834` (`!this.isAutomaticComputedSync()`), not `ComputedSync.ts:42-44`. Separately, `toChartNumber` plus filter silently **drops** non-numeric cells (`ChartAggregation.ts:191-198`; `RelationRollup.ts:123-125`), so free-text in an amount field under-counts without error.

### Purpose
Pin Reports `computedSyncMode: display-only` in YAML and type Expenses/Sales/Income amount columns `number` or `currency` so later SUM cannot ingest free text and Report files stay off the writer. No fork `src/` edits. No rollup column defs in this child.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Set Reports `computedSyncMode: display-only` in `database:` YAML so the view-config UI cannot be left on `automatic`.
- Type child Expenses/Sales/Income amount columns `number` or `currency`.
- Confirm the YAML literal and the three schema types after the edit.

### Out of Scope
- Binding COUNT, `list`, or SUM columns (children 003 and 004).
- Proving Report-file byte-equality after a child edit (child `006-nowrite-proof-runbook`).
- Patching `ColumnDisplay.ts` for euro-sign (parent REQ-004; rollup display type is hardcoded `"number"` at `ColumnDisplay.ts:18-23`).
- Any fork `src/` edit.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Live finance vault Reports `db_view` note `database:` YAML (path from child 001 inventory) | Modify | Set `computedSyncMode: display-only` |
| Live finance vault Expenses / Sales / Income `db_view` notes `database:` YAML | Modify | Amount columns typed `number` or `currency` |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Reports YAML pins display-only | The Reports `database:` block literally contains `computedSyncMode: display-only` (`ComputedSync.ts:3`; `DataSource.ts:787`). |
| REQ-002 | Write-back stays off under that pin | Automatic write-back early-returns remain `DatabaseView.ts:10244` and `EmbeddedDatabaseRenderer.ts:2834`. This child does not change those files; it only pins YAML so the UI cannot leave `automatic` on. |
| REQ-003 | Child amount columns reject free text at schema | Expenses/Sales/Income amount columns are typed `number` or `currency` so non-numerics cannot enter via normal editing (`ChartAggregation.ts:191-198`; `RelationRollup.ts:123-125`). |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Configuration only | No fork `src/` file changes. EuroFormat is already the display seam (`EuroFormat.ts:1-42`); this child adds no call sites. |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Reports YAML contains `computedSyncMode: display-only`.
- **SC-002**: The three child amount columns are typed `number` or `currency`.
- **SC-003**: No fork `src/` file differs because of this child.

### Acceptance Scenarios

- **Given** Reports YAML is pinned to display-only, **when** a later child amount edit lands, **then** `syncComputedForFile` must not write the Report path (`DatabaseView.ts:10244`, `EmbeddedDatabaseRenderer.ts:2834`).
- **Given** an amount column is typed `number`/`currency`, **when** a user tries free text, **then** the schema blocks it instead of letting SUM silently drop the cell (`ChartAggregation.ts:191-198`).
- **Given** this child is implemented, **when** the fork tree is inspected, **then** no `src/` files have changed.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Omitting the YAML pin | `automatic` writes computed keys and enqueues paths | Pin in this child, independent of SUM |
| Risk | Citation drift on early-return | Docs that cite `ComputedSync.ts:42-44` as the write-back guard are wrong | Use `DatabaseView.ts:10244` and `EmbeddedDatabaseRenderer.ts:2834` |
| Dependency | Child 001 inventory | Need the Reports `db_view` path | Do not invent paths |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Live amount *keys* (cost/gross/net labels vs YAML keys) gate SUM in child 004, not this schema-type edit. Euro sign on rollup cells is out of scope: accept `formatEuroNumber` grouping (`ColumnDisplay.ts:18-23`).
<!-- /ANCHOR:questions -->
