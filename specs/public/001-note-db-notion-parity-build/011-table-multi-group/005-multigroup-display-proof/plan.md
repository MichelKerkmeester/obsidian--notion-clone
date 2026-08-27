---
title: "Implementation Plan: Multigroup Display Proof"
description: "Ordered proofs after nest + persist + picker: render matrix, reload, patch valve, mobile, diff-shape, display-only."
trigger_phrases:
  - "multigroup display proof plan"
  - "table grouping matrix"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/011-table-multi-group/005-multigroup-display-proof"
    last_updated_at: "2026-08-27T17:27:13Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored multi-group display-proof child from synthesis and final-plan"
    next_safe_action: "Run render matrix and persist proofs after children 001-004 ship"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-005-multigroup-display-proof"
      parent_session_id: null
    completion_pct: 95
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Implementation Plan: Multigroup Display Proof

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Obsidian table view + view-config YAML |
| **Framework** | Existing QueryEngine / TableRenderer (untouched in this child) |
| **Storage** | Display-only grouping; hide/show saves view definition only |
| **Testing** | Manual render matrix; YAML reload; patch observation; grep; rebase dry-run |

### Overview
Final-plan step 7. Re-budget: verification is the remaining M. Do not patch `TableRenderer.patchGroupedRows` when 2-field full-rerenders. Do not treat computed-drop `console.warn` as a fail.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Children 001–004 shipped (module, flatten loop, embed, picker).
- [ ] Dev vault has Category/Type sample rows.

### Definition of Done
- [ ] Render matrix recorded.
- [ ] Persist reload + 1-field identity + patch valve recorded.
- [ ] Mobile + diff-shape + no new write path recorded.
- [ ] Checklist evidence filled honestly.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Observation-only proofs over children 001–004. No fork TypeScript in this child.

### Key Components
- **Render matrix**: `QueryEngine.groupBy` + flatten loop already shipped.
- **Persist**: DataSource parse `885` / serialize `1088`.
- **Patch valve**: `patchGroupedRows` `:209-250` vs `tryPatchExternalTableRows` `:2199-2272`.

### Data Flow
Open table → grouping is in-memory → hide/show may `scheduleConfigSave` → note bodies must not change from grouping.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. This child observes DatabaseView, TableRenderer, DataSource, EmbeddedDatabaseRenderer, and ToolbarRenderer. It must not update those producers. Algorithm invariant: nested DnD stays out; computed-drop warning is allowed.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm children 001–004 shipped.
- [ ] Snapshot 1-field table DOM/hide keys before proofs if still comparable.

### Phase 2: Core Implementation
- [ ] Run render matrix, persist reload, patch valve, mobile, diff-shape, grep.
- [ ] Do not edit fork TypeScript.

### Phase 3: Verification
- [ ] Fill `checklist.md` evidence rows.
- [ ] Honest `implementation-summary.md`.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Render matrix | 1/2/3-field, nulls, empties, mixed, checkbox/date, multi-select, computed, empty DB, hidden parent, filter-before-group | Obsidian table |
| Persist | Save + reload 2-field YAML | View-config file |
| Patch | 1-field in-place vs 2-field full render | External row edit |
| Constraint | Diff-shape, grep writes/`fetch`, nested drop absent | `git diff --stat`, `rg` |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-multifield-grouping-module` | Child predecessor | Required | No persist/module |
| `002-grouped-table-flatten` | Child predecessor | Required | No nested UI |
| `003-embedded-table-grouping` | Child predecessor | Required | Embed proofs |
| `004-table-subgroup-picker` | Child predecessor | Required | Picker proofs |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Proofs fail, nested DnD appeared, or patch was rewritten during proofs.
- **Procedure**: Revert any fork TypeScript from this child (there must be none). Do not ship with 1-field hide keys changed or `groupByFields` stripped on save.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | Children 001–004 | Core Implementation |
| Core Implementation | Setup | Verification |
| Verification | Core Implementation | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 15 minutes |
| Proofs (matrix + persist + patch + mobile + diff) | Medium | 3–4 hours |
| Evidence record | Low | 20 minutes |
| **Total** | | **~4 hours (effort M)** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] 1-field baseline notes available if identity must be compared.
- [ ] Fork files confirmed unmodified by this child before proofs.

### Rollback Procedure
1. Confirm no fork TypeScript from this child.
2. Confirm nested groups still have no drop target.
3. Confirm DataSource still omits empty `groupByFields`.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: View-config only. Grouping does not persist row values.
<!-- /ANCHOR:enhanced-rollback -->
