---
title: "Implementation Plan: Tree-Aware Column Ops"
description: "Rename and delete walk conditionTree with existing SourceRules helpers in ColumnOperations.ts."
trigger_phrases:
  - "tree aware column ops plan"
  - "conditiontree rename"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/010-conditional-format-icons/003-tree-aware-column-ops"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored tree-aware-column-ops child from synthesis rank 5 and final-plan step 6"
    next_safe_action: "Wire conditionTree rename/delete in ColumnOperations.ts"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-tree-aware-column-ops"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Tree-Aware Column Ops

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Existing `SourceRules.ts` tree mutators |
| **Storage** | In-memory view config; persist via existing save path |
| **Testing** | Grep plus manual rename/delete; unit grep in child 005 |

### Overview
Reuse `updateSourceRuleTreeKeyReferences` and `removeSourceRuleTreeReferences`. Do not rewrite those helpers. Keep the `condition.field` loops.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 5 and final-plan step 6 read.
- [ ] Child 001 types include `conditionTree?`.

### Definition of Done
- [ ] Rename updates tree keys and `condition.field`.
- [ ] Last-leaf delete drops the rule; hoist dual-writes `condition`.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Call-site edit only (`ColumnOperations.ts`). Helpers already exist in `SourceRules.ts:183-225`.

### Key Components
- **Rename ~193**: field rewrite + tree key update.
- **Delete ~370**: tree ref removal + drop-if-empty.

### Data Flow
Column op → update `condition.field` → update/remove tree refs → optional drop rule → existing `onChange` persist.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: `ColumnOperations.ts`. Helpers in `SourceRules.ts` stay unchanged. Invariant: drop the CF rule only if nothing remains after tree removal.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read rename ~193, delete ~370, helpers `SourceRules.ts:183-225`.

### Phase 2: Core Implementation
- [ ] Wire rename + delete as specified.

### Phase 3: Verification
- [ ] Rename/delete cases in Scope; grep that both helpers are called.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Manual | Rename Amount; delete last leaf vs sibling | Vault view config |
| Constraint | Both helpers referenced from ColumnOperations | `grep` |
| Unit | E8/E9 are grep, not helper cases (child 005) | Grep later |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 `conditionTree?` | Internal | Predecessor | No field to walk |
| `SourceRules.ts:183-225` | Internal | Green | Do not fork helpers |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Stale tree keys after rename; sibling delete drops the whole rule.
- **Procedure**: Revert `ColumnOperations.ts` only. Helpers in `SourceRules.ts` stay.
<!-- /ANCHOR:rollback -->
