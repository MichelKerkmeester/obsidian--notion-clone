---
title: "Implementation Plan: Peek Keyboard Open"
description: "Plan for Mod+Enter in handleDatabaseKeydown before editAtCellSelection, leaving bare Enter and Esc capture unchanged."
trigger_phrases:
  - "peek keyboard plan"
  - "mod enter peek"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/014-record-detail-panel/004-peek-keyboard-open"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored peek-keyboard child from synthesis rank 7 and final-plan step 6"
    next_safe_action: "Add Mod+Enter in handleDatabaseKeydown before editAtCellSelection"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-peek-keyboard-open"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Peek Keyboard Open

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | `DatabaseView.handleDatabaseKeydown` |
| **Storage** | None |
| **Testing** | Manual Mod+Enter vs Enter vs Esc |

### Overview
Final-plan step 6. Third `DatabaseView` hunk for the phase. Esc stays document capture from child 001.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 7 and final-plan step 6 read.
- [x] Child 003 will have imported peek open; this child adds the key branch.

### Definition of Done
- [ ] Mod+Enter opens peek; Enter still edits; no new `Scope`.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
One early-return in the existing keydown handler, using `mod` already at `:1441`.

### Key Components
- **`handleDatabaseKeydown`**: Mod+Enter → `openTableRecordPeek` for the focused row.
- **Esc**: unchanged here (module capture).

### Data Flow
Focused `td` → row path → same `openTableRecordPeek` args as the OPEN button. `returnFocus` restores `:4197` selector.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Only `DatabaseView.ts` `handleDatabaseKeydown`. Algorithm invariant: bare Enter remains `editAtCellSelection()`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 003 import and `mod` at `:1441`.

### Phase 2: Core Implementation
- [ ] Insert Mod+Enter branch before `:1523` edit.

### Phase 3: Verification
- [ ] Mod+Enter opens; Enter edits; Esc closes via module.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Manual | Mod+Enter vs Enter vs F2 | Obsidian fork |
| Manual | Esc + focus return | Peek open |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child `003-title-open-affordance` | Child predecessor | Required | Peek may not be imported / column args unknown |
| Child `001-table-record-peek-module` | Child predecessor | Required | No `openTableRecordPeek` |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Bare Enter no longer edits, or a second `Scope` was pushed.
- **Procedure**: Revert the `handleDatabaseKeydown` hunk only.
<!-- /ANCHOR:rollback -->
