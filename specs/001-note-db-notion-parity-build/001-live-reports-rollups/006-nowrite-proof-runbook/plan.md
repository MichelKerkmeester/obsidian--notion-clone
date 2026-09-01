---
title: "Implementation Plan: Nowrite Proof Runbook"
description: "Go-live plan: SC-001 accuracy, SC-002 byte-equality, edges, diagnostic-list removal, two-sided maintenance runbook, fork src scope lock."
trigger_phrases:
  - "nowrite proof plan"
  - "go-live runbook"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/001-live-reports-rollups/006-nowrite-proof-runbook"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored go-live proof child from synthesis rank 7 and final-plan steps 10-14"
    next_safe_action: "Run SC-001 and SC-002 after SUM is bound; then remove diagnostic lists"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-006-nowrite-proof-runbook"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Nowrite Proof Runbook

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Obsidian vault verification; YAML cleanup |
| **Framework** | Existing display-only rollup engine (read-only cites) |
| **Storage** | Report note bytes + Reports `db_view` |
| **Testing** | Manual SUM vs list; byte-equality; edge walk; fork `git status` |

### Overview
Prove the live figures, prove the Report file does not rewrite on child amount edits, write the runbook, then remove diagnostic lists. Zero new `src/` files. Successor module is `Aggregate.ts` in pack 002 — do not pre-create it.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 7 and final-plan steps 10–14 read.
- [ ] Child 002 display-only pin present.
- [ ] Child 004 SUM bound (or UNKNOWN halt already recorded — then accuracy proof is blocked).
- [ ] Child 003 diagnostic lists still present.

### Definition of Done
- [ ] SC-001 and SC-002 passed.
- [ ] Edges covered; runbook written.
- [ ] Diagnostic lists removed; SUM/COUNT remain.
- [ ] Fork `src/` unchanged.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Verification and YAML cleanup only. No new module.

### Key Components
- **Accuracy**: CellRenderer computed cells vs manual sum vs `list`.
- **No-write**: Report path off `writeQueues` under display-only (`DataSource.ts:88-120`).
- **Runbook**: benign writes vs rollup recompute; two-sided pairing.

### Data Flow
Child amount save → 80ms coalesced refresh (`DataSource.ts:1938-1998`) → rollup recompute in memory → Report file bytes unchanged.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producers: Reports YAML (list-column removal) and a written runbook. Consumers: operators maintaining both relation sides. Invariant: rollups never write frontmatter (`types.ts:69`).
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm display-only pin, bound SUM, and lists still present.

### Phase 2: Core Implementation
- [ ] Run SC-001 accuracy vs `list`/`file.name`.
- [ ] Run SC-002 byte-equality; write benign-write and pairing runbook.
- [ ] Walk edges (empty Month, duplicates, independent relations, nested rollup, Saved static).

### Phase 3: Verification
- [ ] Remove diagnostic lists; confirm SUM/COUNT remain.
- [ ] Fork `src/` clean; mobile smoke same figures.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None | — |
| Integration | None | — |
| Manual | Accuracy, byte-equality, edges, list removal, fork status | Obsidian vault + `git status` |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 002 display-only | Internal | Predecessor | Cannot claim iCloud-safe no-write |
| Child 004 SUM | Internal | Predecessor | SC-001 blocked if SUM unbound |
| Child 003 lists | Internal | Must still exist | Inventory for SC-001 |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Report bytes change on child edit, accuracy mismatch, or lists removed too early.
- **Procedure**: Restore Reports YAML from backups (re-add lists if removed prematurely). Revert any fork file. Do not treat a view-config save as a rollup write.
<!-- /ANCHOR:rollback -->
