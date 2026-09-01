---
title: "Tasks: Filter Tree Proof"
description: "Proof tasks: re-run ViewFilterTree tests, freeze the 010 API, vault nested persist and mobile panel, grep guards, lint/build."
trigger_phrases:
  - "filter tree proof tasks"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Tasks: Filter Tree Proof

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (target — fork file:line)`

This child does not add fork `src/` files. T013/T027 from the parent task list are acceptance checks here, not build work.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm children 001–004 shipped in the fork (`ViewFilterTree.ts`, DataSource/ViewStateStore, FilterPanelRenderer, coherence mutators) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 010 contract freeze: public surface is `evaluateViewFilterTree`, `normalizeViewFilterTree`, `QueryEngine.evaluateFilterTree`, `QueryEngine.applyFilterTree`. Grep: `ConditionalFormatting.ts:38` stays on `applyFilters` and does not import the new APIs (`src/data/ConditionalFormatting.ts:38`) [S]
- [ ] T003 Re-run `npx vitest run` on `src/data/__tests__/ViewFilterTree.test.ts`: `(A and B) or C`; `not` wrapping a group; empty root → all rows; nested empty AND under OR is skip (not `SourceRules.ts:152`, not AppFlowy `controller.rs:493-503`); `expression` → `false`; single-leaf ≡ flat; serialize round-trip; truncated root → `undefined`; `getRequiredViewFilterLeaves` ignores OR children (`src/data/__tests__/ViewFilterTree.test.ts`) [S]
- [ ] T004 Manual vault: nested filter at phone width; wrap / collapse / depth 3 / `not`; persistence (nested survives, flat has no `filterTree` key); chip + column-delete + drilldown (vault `database:` config — fork files: none this child) [M]
- [ ] T005 Grep: no `FilterGroup`; `styles.css` untouched; `matchesFilter` not exported; `ViewFilterTree.ts` has no runtime import from `SourceRules.ts`. Then fork `lint` / `build` [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T006 Record T002–T005 evidence in `checklist.md`; clean `scratch/` [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] checklist.md evidence filled
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Parent synthesis**: `../research/synthesis.md` rank 9
- **Parent final-plan**: `../research/final-plan.md` steps 10–12
<!-- /ANCHOR:cross-refs -->
