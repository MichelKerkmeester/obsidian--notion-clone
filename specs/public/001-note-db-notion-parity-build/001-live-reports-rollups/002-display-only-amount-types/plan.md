---
title: "Implementation Plan: Display-Only Amount Types"
description: "Vault YAML plan to pin computedSyncMode display-only and type child amount columns number/currency before any rollup column is bound."
trigger_phrases:
  - "display-only plan"
  - "amount types plan"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Display-Only Amount Types

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Obsidian vault markdown `database:` YAML |
| **Framework** | Existing computed-sync and `toChartNumber` filters (read-only cites) |
| **Storage** | Reports + three child `db_view` notes from child 001 inventory |
| **Testing** | YAML literal check; schema type check on three amount columns |

### Overview
Two independent schema-safety edits after inventory: pin display-only (iCloud P0) and type amount columns so later SUM cannot swallow free text. Zero new `src/` files, zero call sites.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 3 and 6 plus final-plan steps 5–6 read.
- [x] Early-return cites locked to `DatabaseView.ts:10244` and `EmbeddedDatabaseRenderer.ts:2834`.
- [ ] Child 001 inventory has the Reports `db_view` path.

### Definition of Done
- [ ] Reports YAML contains `computedSyncMode: display-only`.
- [ ] Three child amount columns typed `number` or `currency`.
- [ ] Fork `src/` unchanged.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Vault YAML only. Display-only is already the fork default; this child makes it an explicit view-config pin.

### Key Components
- **`computedSyncMode: display-only`** on Reports (`ComputedSync.ts:3`; coerce at `DataSource.ts:787`).
- **Amount column types** `number`/`currency` on Expenses/Sales/Income.

### Data Flow
Under display-only, `syncComputedForFile` early-returns unless automatic (`DatabaseView.ts:10244`; `EmbeddedDatabaseRenderer.ts:2834`). The only enqueue sites stay `mutateFrontmatter` and `updateViewDefFile` (`DataSource.ts:989-992`). Amount typing happens before `toChartNumber` would drop free text (`ChartAggregation.ts:191-198`).
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producers: Reports and child `database:` YAML. Consumers: existing computed-sync and numeric extraction. No fork edits. Invariant: Report path stays off `writeQueues` for rollup recompute (`DataSource.ts:88-120`).
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 inventory paths exist.

### Phase 2: Core Implementation
- [ ] Pin `computedSyncMode: display-only` on Reports.
- [ ] Type the three child amount columns `number` or `currency`.

### Phase 3: Verification
- [ ] YAML literal contains `display-only`.
- [ ] Schema type check on the three amount columns.
- [ ] Fork `src/` clean.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None | — |
| Integration | None | — |
| Manual | YAML grep for `display-only`; amount column type in `db_view` | Obsidian vault |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 inventory | Internal | Predecessor | Cannot edit YAML without paths |
| Fork computed-sync default | Internal (read-only) | Green | Pin still required so UI cannot leave `automatic` |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: YAML pin missing, amount types still text, or fork dirt.
- **Procedure**: Restore YAML from child 001 backups. Revert any fork file. Do not leave `automatic` on Reports.
<!-- /ANCHOR:rollback -->
