---
title: "Tasks: Kleene Eval Module"
description: "Ordered tasks for ViewFilterTree.ts, QueryEngine bridges, RowPipeline routing, additive types, Vitest harness, and module tests."
trigger_phrases:
  - "kleene eval tasks"
  - "view filter tree"
  - "applyfiltertree"
  - "vitest harness"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/009-view-filter-tree/001-kleene-eval-module"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored kleene-eval-module child from synthesis rank 1 and final-plan steps 1-5 plus 11"
    next_safe_action: "Create ViewFilterTree.ts, QueryEngine bridges, RowPipeline routing, and ViewFilterTree.test.ts"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-kleene-eval-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Kleene Eval Module

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

T003–T007 are one shippable eval slice. Do not ship `ViewFilterTree.ts` without the QueryEngine bridges and RowPipeline caller.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read parent `research/synthesis.md` rank 1 and `research/final-plan.md` steps 1–5 plus 11 (Kleene vs `SourceRules.ts:152`, EuroFormat isolation) [S]
- [ ] T002 Scaffold `src/__tests__/setup.ts` (no-op) and add `"test": "vitest run"` to fork `package.json` so `npx vitest run` starts (`vitest.config.ts:4-7`) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 Create `src/data/ViewFilterTree.ts`: type-only import from `./types`; runtime OK `FilterRules.ts:3-12`; forbidden runtime `SourceRules.ts` / `QueryEngine.ts`; local duck-type `type === "group"|"not"|"expression"` (do not import `isSourceRuleGroup`). Exports: `buildViewFilterTree` (shape of `createLegacySourceRuleTree`, `SourceRules.ts:48-59`: `[] → undefined`, one rule → leaf, else `{type:"group", logic, rules}`), `normalizeViewFilterTree` (view-op allow-list = `FilterOperator` at `types.ts:135`; drop unknown kinds + `console.warn`; truncated/non-object → `undefined`), `pruneViewFilterTree`, `evaluateViewFilterTree` (Kleene: leaf → `matchesLeaf`; `expression` → `false`; `not` inverts `true`/`false`, `null` stays `null`; empty group → `null`; AND first-`false`; OR first-`true`; all-`null` → `null`), `serializeViewFilterTree`, `flattenLeaves` / `mapLeafAt` / `removeLeafAt` / `appendLeaf`, `getRequiredViewFilterLeaves` (AND-required only; OR / `not` → `[]`) (`src/data/ViewFilterTree.ts`) [M]
- [ ] T004 [P] Additive `filterTree?: SourceRuleNode` on `ViewModeStateDef` after `filters` at `169` and `ViewConfig` after `filters` at `399`; no new AST (`src/data/types.ts:169`, `399`) [S]
- [ ] T005 Additive `applyFilterTree(rows, tree, columns)`: same `columnMap` as `applyFilters` (`QueryEngine.ts:81`); matcher `(leaf) => this.matchesFilter(row, leaf, columnMap.get(leaf.field))`; root `!== false` visible. Additive `evaluateFilterTree(row, tree, columns): boolean | null`. Leave `applyFilters` `74-89` and `matchesFilter` `91-127` untouched; do not export `matchesFilter` (`src/data/QueryEngine.ts`) [S]
- [ ] T006 `RowPipeline.ts:93-97`: `tree = state.filterTree ? pruneViewFilterTree(state.filterTree, …) : buildViewFilterTree(getEffectiveFilterRules(state.filters, validFields), state.filterLogic)`; if `tree` then `applyFilterTree`, else today’s `applyFilters` (`src/data/RowPipeline.ts:93-97`) [S]
- [ ] T007 `src/data/__tests__/ViewFilterTree.test.ts`: `(A and B) or C`; `not` wrapping a group; empty root → all rows; nested empty AND under OR is skip (not `SourceRules.ts:152`, not AppFlowy `controller.rs:493-503`); `expression` → `false`; single-leaf ≡ flat; serialize round-trip; truncated root → `undefined`; `getRequiredViewFilterLeaves` ignores OR children (`src/data/__tests__/ViewFilterTree.test.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T008 `npx vitest run` green on `ViewFilterTree.test.ts` (SC-001, SC-004) [S]
- [ ] T009 Grep: no `FilterGroup`; `ViewFilterTree.ts` has no runtime import from `SourceRules.ts`; `matchesFilter` not exported (SC-003) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T007 shipped together
- [ ] T008–T009 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 1
- **Parent final-plan**: `../research/final-plan.md` steps 1–5, 11
<!-- /ANCHOR:cross-refs -->
