---
title: "Implementation Plan: Snapshot Audit Columns"
description: "Parallel vault YAML plan to keep screenshot-era totals as Snapshot columns beside live figures. Default yes; Saved stays non-live."
trigger_phrases:
  - "snapshot plan"
  - "audit columns"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/001-live-reports-rollups/005-snapshot-audit-columns"
    last_updated_at: "2026-08-27T12:27:53Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Snapshot Audit Columns

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Obsidian vault markdown `database:` YAML and typed values |
| **Framework** | None — static columns, not rollups |
| **Storage** | Reports `db_view` and Report rows |
| **Testing** | Both live and snapshot visible when they diverge, or deferral recorded |

### Overview
Default keep Snapshot copies of screenshot-era Income/Expenses/Sales/Saved. Parallel with COUNT/SUM after Setup captured totals. Saved stays non-live. Zero new `src/` files.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 5 and final-plan step 9 read; default yes.
- [ ] Child 001 inventory captured static totals.

### Definition of Done
- [ ] Snapshot columns exist beside live figures, or operator deferral is recorded.
- [ ] Saved has no live rollup.
- [ ] Fork `src/` unchanged.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Typed static columns on Reports. Not rollup kinds. Not footer math.

### Key Components
- **`Snapshot*` columns** for Income/Expenses/Sales/Saved.
- **Captured values** from child 001 inventory.

### Data Flow
No engine compute. Values are stored on the Report row so they remain when live SUM diverges.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: Reports YAML plus row values. Consumers: Reports view display. Invariant: Saved is never a live rollup in this child.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read captured totals from child 001 inventory.
- [ ] Confirm operator default (keep) or record deferral.

### Phase 2: Core Implementation
- [ ] Add typed Snapshot columns and fill captured values, unless deferred.

### Phase 3: Verification
- [ ] Live and snapshot both visible, or deferral written.
- [ ] Saved still static.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None | — |
| Integration | None | — |
| Manual | Snapshot vs live when they diverge; Saved static | Obsidian Reports view |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 captured totals | Internal | Predecessor | Snapshot columns would be empty |
| Operator keep/defer | External | Default yes | Explicit deferral allowed |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Snapshot overwrites live columns, or Saved becomes a rollup.
- **Procedure**: Remove Snapshot column defs and restore row values from child 001 backups. Do not delete live SUM/COUNT.
<!-- /ANCHOR:rollback -->
