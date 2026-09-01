---
title: "Implementation Plan: Count List Resolution"
description: "Same-diff vault YAML plan for COUNT plus diagnostic list on file.name to prove relation resolution without amount keys."
trigger_phrases:
  - "count list plan"
  - "resolution proof"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/001-live-reports-rollups/003-count-list-resolution"
    last_updated_at: "2026-08-27T12:27:53Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Count List Resolution

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Obsidian vault markdown `database:` YAML |
| **Framework** | Existing `count` and `list` kinds (`types.ts:44`) |
| **Storage** | Reports `db_view` from child 001 inventory |
| **Testing** | COUNT vs unique `list`/`file.name`; empty Report shows COUNT `0` |

### Overview
One YAML change-set: COUNT plus diagnostic `list` on `file.name` beside each of the three relations. Unblocked after both-sides wiring. Not blocked on ops keys. Zero new `src/` files.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 2 and 4 plus final-plan step 7 read; COUNT+list coupling confirmed.
- [ ] Child 001 sample Report relation resolves.

### Definition of Done
- [ ] COUNT equals unique names in the `file.name` list.
- [ ] Empty Report shows COUNT `0`, no crash.
- [ ] Diagnostic lists still present (not removed here).
- [ ] Fork `src/` unchanged.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Configure existing rollup kinds. Do not reimplement `buildRelationRollups`.

### Key Components
- **COUNT**: `RelationRollup.ts:99` short-circuit to `records.length`.
- **`list` / `file.name`**: `stringifyValue` inventory (`RelationRollup.ts:110-119`); modal path `RelationRollupConfigModal.ts:146-147`.

### Data Flow
Cells read `row.computed[col.key]` (`CellRenderer.ts:656`). Consumers: `DatabaseView.calculateRelationRollups` (`DatabaseView.ts:3388-3399`) and `EmbeddedDatabaseRenderer`. This child only adds column defs.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: Reports `database:` rollup column defs. Consumers: existing rollup engine. Invariant: `list` target is a unique identity field, not the amount key.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 sample Report relation resolves.

### Phase 2: Core Implementation
- [ ] Add COUNT + `list`/`file.name` for Expenses, Sales, and Income relations.
- [ ] Do not name unknown calculate ids.

### Phase 3: Verification
- [ ] COUNT matches unique list entries; empty Report COUNT `0`.
- [ ] Fork `src/` clean.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None | — |
| Integration | None | — |
| Manual | COUNT vs `list`/`file.name`; empty Report | Obsidian Reports view |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 both-sides wiring | Internal | Predecessor | COUNT `0` is indistinguishable from unwired |
| Ops amount keys | External | Not required | SUM is child 004 |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: COUNT/list mismatch, unknown kind ids in YAML, or fork dirt.
- **Procedure**: Remove the new rollup column defs from Reports YAML using child 001 backups. Keep relation wiring. Do not delete lists as a "fix" for a bad SUM — SUM is not this child.
<!-- /ANCHOR:rollback -->
