---
title: "Tasks: View Filter Tree Module"
description: "Task list for ViewFilterTree.ts Kleene evaluator, types, QueryEngine bridges, RowPipeline caller, Vitest harness, and phase-010 API freeze."
trigger_phrases:
  - "view filter tree tasks"
  - "kleene evaluator"
  - "applyfiltertree"
  - "viewfiltertree module"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/009-view-filter-tree/001-view-filter-tree-module"
    last_updated_at: "2026-08-25T19:45:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored Kleene module child from synthesis ranks 1/9/10 and final-plan steps 1-5/10/11"
    next_safe_action: "Implement ViewFilterTree.ts plus QueryEngine and RowPipeline bridges"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-view-filter-tree-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: View Filter Tree Module

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

T003–T008 are **one atomic eval slice**. Do not ship T003 without T004–T008.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read parent `research/synthesis.md` ranks 1, 9, 10 plus `research/final-plan.md` steps 1–5 / 10 / 11 (Kleene lock, cycle rule, 010 wrapper) [15m]
- [ ] T002 Record fork baseline — expect missing `src/__tests__/setup.ts` despite `vitest.config.ts:4-7`; note no `test` script on `package.json` [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Create `src/data/ViewFilterTree.ts`**: type-only import from `./types`; runtime OK `FilterRules.ts:3-12`; forbidden runtime `SourceRules.ts` / `QueryEngine.ts`; local duck-types (no `isSourceRuleGroup`); exports `buildViewFilterTree` (shape of `SourceRules.ts:48-59`), `normalizeViewFilterTree` (allow-list `types.ts:135`; unknown kinds + `console.warn`; truncated root → `undefined`), `pruneViewFilterTree`, `evaluateViewFilterTree` (Kleene: leaf → `matchesLeaf`; `expression` → `false`; `not` inverts `true`/`false`, `null` stays `null`; empty group → `null`; AND first-`false`; OR first-`true`; all-`null` → `null`), `serializeViewFilterTree`, `flattenLeaves` / `mapLeafAt` / `removeLeafAt` / `appendLeaf`, `getRequiredViewFilterLeaves` (AND-required only; OR / `not` → `[]`) (`src/data/ViewFilterTree.ts`) [M]
- [ ] T004 **Harness + table tests** — land with T003: `src/__tests__/setup.ts` no-op; `src/data/__tests__/ViewFilterTree.test.ts` cases `(A and B) or C`, `not` wrapping a group, empty root → all rows, nested empty AND under OR is skip (not `SourceRules.ts:152`, not `controller.rs:493-503`), `expression` → `false`, single-leaf ≡ flat, serialize round-trip, truncated root → `undefined`, `getRequiredViewFilterLeaves` ignores OR children; add `"test": "vitest run"` to fork `package.json` (`vitest.config.ts:4-7`) [S]
- [ ] T005 **Additive types** — same slice as T003: `filterTree?: SourceRuleNode` on `ViewModeStateDef` after `filters` at `types.ts:169` and on `ViewConfig` after `filters` at `types.ts:399`; no new AST (`src/data/types.ts`) [S]
- [ ] T006 **QueryEngine bridges** — same slice as T003: additive `applyFilterTree(rows, tree, columns)` with `columnMap` like `applyFilters` (`:81`), matcher `(leaf) => this.matchesFilter(row, leaf, columnMap.get(leaf.field))`, root `!== false` visible; additive `evaluateFilterTree(row, tree, columns): boolean \| null`; leave `applyFilters` `:74-89` and `matchesFilter` `:91-127` untouched; do not export `matchesFilter` (`src/data/QueryEngine.ts`) [S]
- [ ] T007 **RowPipeline caller** — same slice as T003: `tree = state.filterTree ? pruneViewFilterTree(state.filterTree, …) : buildViewFilterTree(getEffectiveFilterRules(state.filters, validFields), state.filterLogic)`; if `tree` then `applyFilterTree`, else today’s `applyFilters` (`src/data/RowPipeline.ts:93-97`) [S]
- [ ] T008 **010 contract freeze** — same slice as T003: public surface is `evaluateViewFilterTree`, `normalizeViewFilterTree`, `QueryEngine.evaluateFilterTree`, `QueryEngine.applyFilterTree`; leave `ConditionalFormatting.ts:38` on `applyFilters` (`src/data/ConditionalFormatting.ts:38`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T009 `npx vitest run` green on `src/data/__tests__/ViewFilterTree.test.ts` (SC-001) [S]
- [ ] T010 Grep: no `FilterGroup`; `ViewFilterTree.ts` has no runtime import from `SourceRules.ts`; `matchesFilter` not exported; no CF import of the new APIs [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T008 shipped as one slice
- [ ] T009–T010 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 1, 9, 10
- **Parent final-plan**: `../research/final-plan.md` steps 1–5, 10, 11
<!-- /ANCHOR:cross-refs -->
