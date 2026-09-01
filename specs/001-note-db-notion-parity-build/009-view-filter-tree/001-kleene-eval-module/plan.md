---
title: "Implementation Plan: Kleene Eval Module"
description: "EuroFormat plan for ViewFilterTree.ts Kleene evaluation, QueryEngine bridges, RowPipeline routing, additive filterTree types, and the Vitest harness plus module tests."
trigger_phrases:
  - "kleene eval plan"
  - "view filter tree module"
  - "applyfiltertree"
  - "vitest harness"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/009-view-filter-tree/001-kleene-eval-module"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Kleene Eval Module

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | None this child — `filterTree` persistence is child 002 |
| **Testing** | Vitest (`vitest.config.ts:4-7`); harness file missing today |

### Overview
EuroFormat isolated module (`EuroFormat.ts:9-10`): one new file, type-only import from `./types`, zero runtime import from `SourceRules.ts` or `QueryEngine.ts`. `pruneViewFilterTree` may runtime-import `isEffectiveFilterRule` (`FilterRules.ts:3-12`). QueryEngine grows two additive methods; `matchesFilter` stays private. `RowPipeline.ts:93-97` is the only evaluation caller.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 1 and final-plan steps 1–5 plus 11 read; Kleene vs `SourceRules.ts:152` confirmed.
- [x] Locked: do not call `matchesSourceRuleTree`; do not invent `FilterGroup`.
- [x] Harness gap locked: `vitest.config.ts:4-7` references missing `src/__tests__/setup.ts`.

### Definition of Done
- [ ] `ViewFilterTree.ts` exports the locked surface including `getRequiredViewFilterLeaves`.
- [ ] `npx vitest run` green on `ViewFilterTree.test.ts`.
- [ ] `applyFilterTree` / `evaluateFilterTree` additive; `applyFilters` `74-89` and `matchesFilter` `91-127` untouched.
- [ ] `RowPipeline.ts:93-97` uses prune-then-tree, else legacy `applyFilters`.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated module + rebase-safe call sites (EuroFormat: `src/data/EuroFormat.ts:9-10`). Pure functions in `ViewFilterTree.ts`; QueryEngine holds the private leaf.

### Key Components
- **`ViewFilterTree.ts`**: build / normalize / prune / Kleene evaluate / serialize / leaf index helpers / `getRequiredViewFilterLeaves`.
- **`QueryEngine.ts`**: `applyFilterTree` (row-array, root `!== false` visible) and `evaluateFilterTree` (single-row three-valued for 010).
- **`RowPipeline.ts:93-97`**: one evaluation path.
- **`types.ts`**: two additive optional fields so `state.filterTree` typechecks.

### Data Flow
`tree = state.filterTree ? pruneViewFilterTree(...) : buildViewFilterTree(getEffectiveFilterRules(...), state.filterLogic)`; if `tree` then `applyFilterTree` with matcher `(leaf) => this.matchesFilter(row, leaf, columnMap.get(leaf.field))`, else today’s `applyFilters`. Short-circuit AND/OR; cost O(rows × nodes); no per-row cache this phase.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: new `ViewFilterTree.ts`. Consumers this child: `QueryEngine.ts` (additive methods) and `RowPipeline.ts:93-97`. Later consumers (DataSource, ViewStateStore, FilterPanelRenderer, chip/column/chart mutators) wait. Algorithm invariant: empty group = no-op (`null`) at root and nested positions; never `SourceRules.ts:152` empty-AND→true.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Scaffold `src/__tests__/setup.ts` and add `"test": "vitest run"` so `npx vitest run` starts.
- [ ] Confirm live fork lines: `QueryEngine.ts:74-89`, `81`, `91-127`, `RowPipeline.ts:93-97`, `types.ts:135`, `169`, `399`.

### Phase 2: Core Implementation
- [ ] Create `ViewFilterTree.ts` with locked exports and Kleene walk.
- [ ] Add `filterTree?` on `ViewModeStateDef` and `ViewConfig`.
- [ ] Add `applyFilterTree` and `evaluateFilterTree`; leave `matchesFilter` private.
- [ ] Route `RowPipeline.ts:93-97`.
- [ ] Write `ViewFilterTree.test.ts` including the AppFlowy divergence comment (`controller.rs:493-503`).

### Phase 3: Verification
- [ ] `npx vitest run` green on the new tests.
- [ ] Grep: no `FilterGroup`; no runtime `SourceRules` import from `ViewFilterTree.ts`; `matchesFilter` not exported.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Kleene cases with fake `matchesLeaf`; serialize; truncated root; required-leaves | Vitest (`npx vitest run`) |
| Integration | Single-leaf ≡ `applyFilters` via `applyFilterTree` | Vitest against QueryEngine if the test file can construct it; otherwise fake matcher plus a comment that live ≡ is REQ-003 |
| Manual | Not this child — panel/vault wait | — |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Live fork `Obsidian Plugin/src` | Internal | Green | Cannot cite or edit call sites |
| `FilterRules.ts:3-12` `isEffectiveFilterRule` | Internal | Green | Ineffective leaves would poison OR |
| Child 002 DataSource / ViewStateStore | Internal | Later | Nested trees die on reload until 002; in-memory + legacy promotion still work |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Kleene tests fail, `matchesFilter` is exported, or `ViewFilterTree.ts` runtime-imports `SourceRules.ts`.
- **Procedure**: Revert this child's files as one unit (`ViewFilterTree.ts`, tests, setup, `package.json` test script, `types.ts` fields, QueryEngine additive methods, RowPipeline routing). Do not leave `filterTree?` on types without the evaluator.
<!-- /ANCHOR:rollback -->
