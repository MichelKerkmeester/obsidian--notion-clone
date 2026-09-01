---
title: "Feature Specification: Tree-Aware Column Ops"
description: "Walk conditionTree on column rename and delete using updateSourceRuleTreeKeyReferences and removeSourceRuleTreeReferences so CF trees do not keep stale keys."
trigger_phrases:
  - "tree aware column ops"
  - "conditional format rename"
  - "conditiontree delete"
  - "updatesourceruletreekeyreferences"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Tree-Aware Column Ops

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `010-conditional-format-icons` |
| **Parent Spec** | ../spec.md |
| **Phase** | 3 of 5 |
| **Predecessor** | 002-format-parse-persist |
| **Successor** | 004-format-editor-panel |
| **Handoff Criteria** | Rename updates tree keys; last-leaf delete drops the CF rule; dual-write `condition` from the remaining leaf |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 3 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `002-format-parse-persist` · Successor: `004-format-editor-panel`. Synthesis rank 5; final-plan step 6 (E8/E9). Today's loops rewrite/filter only `rule.condition.field` (`ColumnOperations.ts:193,370`).
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Column rename rewrites `rule.condition.field` (~193). Column delete filters rules by that field (~370). A persisted `conditionTree` would keep stale keys after rename and keep matching deleted columns after delete. Notion drops rules with the property; the fork must walk the tree with existing helpers.

### Purpose
On rename, also call `updateSourceRuleTreeKeyReferences(rule.conditionTree, oldKey, newKey)` (`SourceRules.ts:183-206`). On delete, `removeSourceRuleTreeReferences` (`:208-225`) and drop the CF rule only if nothing remains, accepting the helper's single-child hoist (`:222-224`) and dual-writing `condition` from that leaf.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Rename loop ~193: keep `rule.condition.field` rewrite **and** `updateSourceRuleTreeKeyReferences(rule.conditionTree, oldKey, newKey)`.
- Delete filter ~370: `removeSourceRuleTreeReferences`; drop the rule only if nothing remains.
- Accept hoist of a single remaining child (`SourceRules.ts:222-224`); dual-write `condition` from that remaining leaf.
- Keep `valueSource` rule-level (do not fork a per-leaf `valueSource` that would break these helpers).

### Out of Scope
- Match/paint (child 001). Parse (child 002). Editor (child 004). Tests (child 005).
- Changing `SourceRules.ts` helpers themselves.
- Id-based tree surgery.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/ColumnOperations.ts` | Edit | Tree-aware rename ~193 and delete ~370 |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Rename updates tree keys | `updateSourceRuleTreeKeyReferences` runs on `rule.conditionTree` in addition to `rule.condition.field` (`ColumnOperations.ts` ~193; `SourceRules.ts:183-206`) |
| REQ-002 | Delete walks the tree | `removeSourceRuleTreeReferences` (`:208-225`); rule dropped only if nothing remains |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-003 | Single-child hoist is accepted | Helper hoist `:222-224` may collapse the tree to a leaf; dual-write `condition` from that leaf so rollback stays safe |
| REQ-004 | Legacy single-condition path still updates | `rule.condition.field` rewrite/filter remains for rules with no tree |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Rename does not leave stale `conditionTree` keys.
- **SC-002**: Last-leaf delete drops the CF rule.
- **SC-003**: A remaining sibling leaf keeps the rule; `condition` matches that leaf.

### Acceptance Scenarios

- **Given** a CF tree that references field `Amount`, **when** the column is renamed to `Amount EUR`, **then** every tree leaf key updates (`SourceRules.ts:183-206`).
- **Given** a tree whose last remaining leaf is the deleted field, **when** delete runs, **then** the CF rule is dropped (`:208-225`).
- **Given** a two-leaf tree where one leaf is deleted, **when** the helper hoists the survivor (`:222-224`), **then** the rule remains and `condition` is that leaf.
- **Given** a legacy rule with no `conditionTree`, **when** rename/delete runs, **then** today's `condition.field` behavior is unchanged.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Child 001 types (`conditionTree?`) | Nothing to walk | Wait for 001 |
| Risk | Forgetting the tree walk | Stale keys after rename (E8/E9) | REQ-001/002 |
| Risk | Dropping the rule too early | AND sibling deleted with one leaf | Drop only if nothing remains |
| Risk | Per-leaf `valueSource` | Breaks these helpers' leaf shape | Keep flag rule-level (synthesis rank 6) |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked default: accept `removeSourceRuleTreeReferences` hoist on CF delete (final-plan risks table).
<!-- /ANCHOR:questions -->
