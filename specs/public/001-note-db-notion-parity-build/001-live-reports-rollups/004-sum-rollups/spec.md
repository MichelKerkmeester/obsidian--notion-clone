---
title: "Feature Specification: Sum Rollups"
description: "Bind Reports SUM rollups to ops-confirmed Expenses/Sales/Income amount keys after COUNT plus list/file.name proved resolution. Halt if keys are UNKNOWN."
trigger_phrases:
  - "sum rollups"
  - "ops-confirmed amount keys"
  - "silent empty sum"
  - "toChartNumber sum"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/001-live-reports-rollups/004-sum-rollups"
    last_updated_at: "2026-08-25T19:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored SUM child from synthesis rank 2 remainder and final-plan step 8"
    next_safe_action: "Halt for ops amount keys; do not bind SUM while UNKNOWN"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-sum-rollups"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Sum Rollups

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
| **Phase** | 4 of 6 |
| **Predecessor** | 003-count-list-resolution |
| **Successor** | 005-snapshot-audit-columns |
| **Handoff Criteria** | On-screen SUM equals a manual sum of the `list` children, or UNKNOWN is recorded and SUM stays unbound |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 4 of 6** — Parent: [`../spec.md`](../spec.md) · Predecessor: `003-count-list-resolution` · Successor: `005-snapshot-audit-columns`. Synthesis rank 2 remainder; final-plan step 8. Split from COUNT on purpose: SUM is the only step that must halt on UNKNOWN keys. If COUNT > 0 and SUM is empty, the amount key is wrong — fix YAML, do not patch the fork.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The vault still stores screenshot-era static totals. Notion page rollups are a 4-tuple (relation + target property + calculate + format) at read time. The fork already implements `sum` via `toChartNumber` (`RelationRollup.ts:123-128`). Labels `cost` / `gross` / `net` are Notion-facing, not necessarily YAML keys. A guessed key yields a plausible empty SUM (`emptyRollupValue` → `null`, `RelationRollup.ts:159-160`).

### Purpose
Bind Reports SUM rollups to ops-confirmed amount keys for Expenses / Sales / Income after COUNT plus `list`/`file.name` proved resolution. Halt and write UNKNOWN rather than guess. No new `src/` module. Do not remove diagnostic lists here.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Confirm live YAML keys with ops (or record UNKNOWN and stop SUM).
- Bind SUM against those keys for the three relations (`RelationRollup.ts:123-128`).
- Compare on-screen SUM to a manual sum of the child 003 `list` inventory.

### Out of Scope
- Guessing keys. Footer `SummaryRenderer` as the monthly figure (`SummaryRenderer.ts:19-22`; `GroupDisplay.ts:28-61` has no per-group aggregation).
- Removing diagnostic `list` columns (child 006).
- Saved as a live field (parent REQ-006).
- Extra Notion calculate functions (`median|min|max|range` unknown id → sum at `RelationRollup.ts:126-128`).
- Fork `src/` edits. EuroFormat already formats number cells (`ColumnDisplay.ts:18-23` → `CellRenderer.ts:13,201-203,2575-2576`).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Live finance vault Reports `db_view` note `database:` YAML | Modify | SUM rollup column defs bound to ops-confirmed keys |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Ops keys confirmed or SUM stays unbound | Three live YAML keys written down, or UNKNOWN recorded. Do not copy screenshot labels as keys. |
| REQ-002 | SUM uses existing `sum` kind only | `RelationRollup.ts:123-128` via strict `toChartNumber`. No `median\|min\|max\|range` in YAML. |
| REQ-003 | Silent-empty detector | If COUNT > 0 and SUM is empty, the amount key is wrong — fix YAML, do not patch the fork. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | SUM matches the `list` inventory | On-screen SUM equals a manual sum of the `list`/`file.name` children (`CellRenderer.ts:656`). |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: On-screen SUM equals a manual sum of related children for a sample Report, or SUM is unbound with UNKNOWN recorded.
- **SC-002**: COUNT > 0 with empty SUM is treated as a wrong key, not a plugin bug.
- **SC-003**: No fork `src/` file differs because of this child.

### Acceptance Scenarios

- **Given** ops-confirmed keys and a resolving relation, **when** SUM loads, **then** the figure matches a manual sum of the `list` children (`RelationRollup.ts:123-128`).
- **Given** COUNT > 0 and SUM empty, **when** the operator inspects YAML, **then** they change the amount key rather than edit `RelationRollup.ts`.
- **Given** keys remain UNKNOWN, **when** this child closes, **then** SUM columns are not bound.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Ops amount keys | Guessed key → plausible empty SUM | Halt; write UNKNOWN |
| Dependency | Child 003 COUNT/`list` proof | SUM on an unresolved relation looks empty | Bind SUM only after COUNT matches the list |
| Risk | Unknown kind id | Silent SUM of the wrong thing (`RelationRollup.ts:126-128`) | Bind only `sum` |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

- Live amount YAML keys for Expenses / Sales / Income: UNKNOWN. Default: halt; do not bind. COUNT/`list` may already have proceeded in child 003.
<!-- /ANCHOR:questions -->
