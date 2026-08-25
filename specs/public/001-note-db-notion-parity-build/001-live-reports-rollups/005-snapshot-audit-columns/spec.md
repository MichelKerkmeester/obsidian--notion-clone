---
title: "Feature Specification: Snapshot Audit Columns"
description: "Keep screenshot-era Income/Expenses/Sales/Saved as typed Snapshot columns beside live figures so divergence stays auditable. Saved stays non-live."
trigger_phrases:
  - "snapshot audit columns"
  - "snapshot totals"
  - "saved static"
  - "req-005 snapshot"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/001-live-reports-rollups/005-snapshot-audit-columns"
    last_updated_at: "2026-08-25T19:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored Snapshot child from synthesis rank 5 and final-plan step 9"
    next_safe_action: "Capture screenshot-era totals from Setup inventory; default keep Snapshot columns"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-005-snapshot-audit-columns"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Snapshot Audit Columns

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `001-live-reports-rollups` |
| **Parent Spec** | ../spec.md |
| **Phase** | 5 of 6 |
| **Predecessor** | 004-sum-rollups |
| **Successor** | 006-nowrite-proof-runbook |
| **Handoff Criteria** | Snapshot columns visible beside live figures, or operator deferral recorded; Saved still static |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 5 of 6** — Parent: [`../spec.md`](../spec.md) · Predecessor: `004-sum-rollups` · Successor: `006-nowrite-proof-runbook`. Synthesis rank 5; final-plan step 9. May start in parallel with children 003–004 after Setup captured static totals. Default **yes**. Explicit deferral is allowed only as an operator call.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion has no screenshot-freeze; this vault does. The four Reports figures were static numbers typed to match Notion screenshots. Once live SUM/COUNT exist, those screenshot-era totals disappear unless they are kept as typed copies. Saved must stay non-live this phase (parent REQ-006); Remaining/Saved formulas belong to a later computed-fields phase.

### Purpose
Add typed `Snapshot*` columns holding captured screenshot-era Income/Expenses/Sales/Saved beside live figures so divergence is auditable (parent REQ-005 / Scenario 4). Saved stays a static or Snapshot copy. Operator may defer. No fork `src/` edits.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Capture screenshot-era Income/Expenses/Sales/Saved from child 001 inventory.
- Add typed `Snapshot*` columns on Reports beside live figures (default yes).
- Keep Saved non-live (no Saved rollup, no Remaining formula).

### Out of Scope
- Live Saved / Remaining formulas (later computed-fields phase).
- Binding SUM/COUNT (children 003–004).
- Fork `src/` edits.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Live finance vault Reports `db_view` note `database:` YAML and Report row values | Modify | Typed `Snapshot*` columns plus captured static totals, unless operator defers |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Operator decision recorded | Default keep `Snapshot*`. Explicit deferral is written if the operator says no. |
| REQ-002 | Saved stays non-live | No Saved rollup and no Remaining/Saved formula (parent REQ-006). |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-003 | Snapshot columns hold screenshot-era totals | If kept, typed Income/Expenses/Sales/Saved copies sit beside live figures so both remain visible when they diverge (parent REQ-005). |
| REQ-004 | Configuration only | No fork `src/` file changes. |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Snapshot columns are visible beside live figures, or operator deferral is recorded.
- **SC-002**: Saved is still static or Snapshot; no Remaining/Saved formula shipped.
- **SC-003**: No fork `src/` file differs because of this child.

### Acceptance Scenarios

- **Given** Snapshot columns are present, **when** live rollups diverge from screenshot-era totals, **then** both figures remain visible (parent Scenario 4).
- **Given** the operator defers Snapshot, **when** this child closes, **then** the deferral is written and Saved is still static.
- **Given** this child is implemented, **when** the fork tree is inspected, **then** no `src/` files have changed.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Child 001 captured static totals | Snapshot without captured numbers is empty | Capture in Setup before adding columns |
| Risk | Treating Saved as live | Remaining/Saved formulas leak into this phase | Parent REQ-006: static or Snapshot only |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

- Keep `Snapshot*` columns? Default **yes**. Explicit deferral is allowed only as an operator call (`../research/synthesis.md` Q4).
<!-- /ANCHOR:questions -->
