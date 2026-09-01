---
title: "Implementation Plan: Filter Tree Proof"
description: "Run Vitest, vault, grep, lint/build, and freeze the 010 QueryEngine.evaluateFilterTree contract without editing ConditionalFormatting.ts."
trigger_phrases:
  - "filter tree proof plan"
  - "010 evaluatefiltertree"
  - "filtertree grep"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/009-view-filter-tree/005-filter-tree-proof"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored filter-tree-proof child from synthesis rank 9 and final-plan steps 10-12"
    next_safe_action: "Run Vitest, vault, grep, and 010 freeze after 001-004"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-005-filter-tree-proof"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Implementation Plan: Filter Tree Proof

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript tests + vault YAML |
| **Framework** | Vitest (`vitest.config.ts:4-7`); Obsidian vault |
| **Storage** | Evidence in this packet `checklist.md` / `scratch/` |
| **Testing** | `npx vitest run`; manual vault; grep; fork lint/build |

### Overview
No sixth implementation slice. Re-run child 001 tests, confirm 010 primitives without CF adoption, and record vault + grep evidence for parent SC-001–SC-006.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Children 001–004 specified; this child owns steps 10–12.
- [x] 010 matcher locked: `evaluateFilterTree` match iff `=== true`.

### Definition of Done
- [ ] Vitest green; lint/build green.
- [ ] Vault nested persist + mobile panel + non-panel dual-write recorded.
- [ ] Grep freeze + CF still on `applyFilters` (`ConditionalFormatting.ts:38`).
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Verification-only child (same shape as reports display-proof).

### Key Components
- **Harness**: `src/__tests__/setup.ts` + `ViewFilterTree.test.ts` from child 001.
- **010 freeze**: public surface list; no CF import.
- **Grep / vault**: parent success criteria.

### Data Flow
Run tests → record output → vault scenarios → grep → write checklist evidence. No fork `src/` edits.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producers: none in `src/`. Consumers: phase 010 will read `QueryEngine.evaluateFilterTree`. Algorithm invariant: `ConditionalFormatting.ts:38` stays on `applyFilters` until 010.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm children 001–004 diffs are in the fork before proving.

### Phase 2: Core Implementation
- [ ] Run Vitest, vault, grep, lint/build; record 010 freeze.

### Phase 3: Verification
- [ ] checklist.md fully evidenced; packet scratch cleaned.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Re-run `ViewFilterTree.test.ts` | `npx vitest run` |
| Integration | Fork lint/build | Fork scripts |
| Manual | Nested persist, mobile panel, chip/delete/drilldown | Obsidian vault |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Children 001–004 | Internal | Required | Nothing to prove |
| `src/__tests__/setup.ts` from 001 | Internal | Required | Vitest missing-setup crash |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Proofs fail and someone starts patching CF or exporting `matchesFilter`.
- **Procedure**: Stop. Record the failure in checklist.md. Do not expand 009. Revert any accidental `src/` edits from this child.
<!-- /ANCHOR:rollback -->
