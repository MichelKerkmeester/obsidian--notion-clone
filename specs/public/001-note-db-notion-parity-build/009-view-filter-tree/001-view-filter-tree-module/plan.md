---
title: "Implementation Plan: View Filter Tree Module"
description: "Plan for ViewFilterTree.ts Kleene evaluator, additive filterTree types, QueryEngine applyFilterTree/evaluateFilterTree, RowPipeline caller, Vitest harness, and the phase-010 public surface."
trigger_phrases:
  - "view filter tree plan"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: View Filter Tree Module

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | None this child — `filterTree` is in-memory until child 002 |
| **Testing** | Vitest (`vitest.config.ts:4-7`); `src/__tests__/setup.ts` missing today |

### Overview
Land one EuroFormat-shaped leaf plus the evaluation seams so `(A and B) or C` can run without touching `matchesSourceRuleTree`. `ViewFilterTree.ts` takes a `matchesLeaf` callback and must not runtime-import `SourceRules.ts` or `QueryEngine.ts`. `QueryEngine.evaluateFilterTree` is the phase-010 primitive (match iff `=== true`); views keep `applyFilterTree` with root `!== false` visible.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 1, 9, 10 and final-plan steps 1–5 / 10 / 11 read; persist/panel/coherence couplings confirmed as later children.
- [x] Kleene semantics locked: empty group → `null`; AND first-`false`; OR first-`true`; all-`null` → `null`.
- [x] Cycle rule locked: no runtime `SourceRules.ts` / `QueryEngine.ts` import from `ViewFilterTree.ts`.

### Definition of Done
- [ ] `ViewFilterTree.ts` exports the locked function set including `getRequiredViewFilterLeaves`.
- [ ] `npx vitest run` green on `ViewFilterTree.test.ts`.
- [ ] `applyFilterTree` + `evaluateFilterTree` additive; `applyFilters` `:74-89` and `matchesFilter` `:91-127` untouched.
- [ ] `RowPipeline.ts:93-97` routes through the tree path when a tree exists.
- [ ] `ConditionalFormatting.ts:38` still `applyFilters`; no `FilterGroup` type.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated module + rebase-safe call sites (EuroFormat: `src/data/EuroFormat.ts:9-10`). Module-level pure functions, not a class. Leaf matching stays inside private `matchesFilter`.

### Key Components
- **`ViewFilterTree.ts`**: build / normalize / prune / Kleene evaluate / serialize / leaf index helpers / `getRequiredViewFilterLeaves`.
- **`QueryEngine.ts`**: `applyFilterTree` (row-array, `!== false` visible) and `evaluateFilterTree` (single-row three-valued).
- **`RowPipeline.ts:93-97`**: prune present `state.filterTree` or build from flat `filters` + `filterLogic`, then one eval path.

### Data Flow
`RowPipeline` chooses a tree, then `applyFilterTree` builds the same `columnMap` as `applyFilters` (`QueryEngine.ts:81`) and calls `evaluateViewFilterTree` with `(leaf) => this.matchesFilter(...)`. Root `null` keeps the row. Ineffective leaves are pruned first (`FilterRules.ts:3-12`) so a blank value cannot poison OR.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: new `ViewFilterTree.ts`. Consumers in this child: `QueryEngine.ts` (bridges) and `RowPipeline.ts:93-97` (only live eval caller). Persist, panel, and non-panel mutators wait for later children. Algorithm invariant: Kleene skip at every empty group; never `matchesSourceRuleTree` empty-AND→true (`SourceRules.ts:152`).
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Record fork baseline (`npx vitest run` will fail on missing `setupFiles` at `vitest.config.ts:4-7`).
- [ ] Confirm live fork paths: `QueryEngine.ts:74-89`, `RowPipeline.ts:93-97`, `types.ts:169` / `:399`.

### Phase 2: Core Implementation
- [ ] Create `ViewFilterTree.ts` with the locked exports.
- [ ] Create `src/__tests__/setup.ts` and `ViewFilterTree.test.ts`; add `package.json` `"test"` script.
- [ ] Add `filterTree?` on `types.ts`; add QueryEngine bridges; switch `RowPipeline.ts:93-97`.

### Phase 3: Verification
- [ ] `npx vitest run` green on the new test file.
- [ ] Grep: no `FilterGroup`; `matchesFilter` not exported; no CF import of new APIs; no runtime `SourceRules` import from `ViewFilterTree.ts`.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Kleene walk, normalize, serialize, `getRequiredViewFilterLeaves` (fake `matchesLeaf`) | Vitest (`npx vitest run`) |
| Integration | Single-leaf ≡ `applyFilters` via `applyFilterTree` | Same test file |
| Manual | Not this child — persist/panel/vault checks wait | — |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Live fork `Obsidian Plugin/src` | Internal | Green | Cannot cite or edit call sites |
| Persist / panel / coherence children | Internal | Later | This child must export normalize, leaf helpers, and `getRequiredViewFilterLeaves` so they do not retouch the module |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Kleene walk reuses `matchesSourceRuleTree`; `matchesFilter` is exported; CF starts importing the new APIs; tests fail; circular import with `QueryEngine.ts`.
- **Procedure**: Revert this child’s files as one unit (`ViewFilterTree.ts`, tests, setup, `types.ts`, `QueryEngine.ts` bridges, `RowPipeline.ts:93-97`, `package.json` script). Do not leave `filterTree?` on types without the evaluator.
<!-- /ANCHOR:rollback -->
