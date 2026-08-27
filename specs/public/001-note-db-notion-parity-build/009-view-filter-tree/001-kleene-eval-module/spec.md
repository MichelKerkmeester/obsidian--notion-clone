---
title: "Feature Specification: Kleene Eval Module"
description: "Isolated ViewFilterTree.ts Kleene evaluator plus QueryEngine applyFilterTree/evaluateFilterTree, RowPipeline routing, additive filterTree types, Vitest harness, and module tests so (A and B) or C is expressible without matchesSourceRuleTree."
trigger_phrases:
  - "kleene eval module"
  - "view filter tree"
  - "applyfiltertree"
  - "evaluatefiltertree"
  - "buildviewfiltertree"
  - "vitest harness"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/009-view-filter-tree/001-kleene-eval-module"
    last_updated_at: "2026-08-25T21:00:00Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Kleene Eval Module

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-25 |
| **Branch** | `009-view-filter-tree` |
| **Parent Spec** | ../spec.md |
| **Phase** | 1 of 5 |
| **Predecessor** | None |
| **Successor** | 002-filter-tree-persistence |
| **Handoff Criteria** | Module, QueryEngine bridges, RowPipeline routing, additive types, harness, and `ViewFilterTree.test.ts` land together; `applyFilters` and `matchesFilter` stay private and untouched |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 5** — Parent: [`../spec.md`](../spec.md) · Successor: `002-filter-tree-persistence`. This child is synthesis rank 1 (evaluation path) plus ranks 8-eval / 9 harness / 10 export, and final-plan steps 1–5 with unit tests from step 11. Persistence, panel, and non-panel mutators wait for later children.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
View filters are a flat `FilterRule[]` plus one global `filterLogic`, so `(A and B) or C` is inexpressible. `QueryEngine.applyFilters` is one uniform `.every` / `.some` (`QueryEngine.ts:74-89`). Reusing `matchesSourceRuleTree` (`SourceRules.ts:144-156`) would poison nested OR groups because empty AND → `true` at `SourceRules.ts:152`. `vitest.config.ts:4-7` points at `src/__tests__/setup.ts` which does not exist.

### Purpose
Land EuroFormat-isolated `src/data/ViewFilterTree.ts` with a Kleene three-valued walk, additive `QueryEngine.applyFilterTree` / `evaluateFilterTree` that call private `matchesFilter`, `RowPipeline.ts:93-97` routing, two additive `filterTree?` type fields, and a runnable Vitest harness plus module tests.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New `src/data/ViewFilterTree.ts`: type-only import from `./types`; runtime OK from `FilterRules.ts:3-12`; forbidden runtime from `SourceRules.ts` and `QueryEngine.ts`. Local duck-type predicates (`type === "group"|"not"|"expression"`); do not import `isSourceRuleGroup`.
- Exports: `buildViewFilterTree` (shape of `createLegacySourceRuleTree`, `SourceRules.ts:48-59`: `[] → undefined`, one rule → leaf, else `{ type:"group", logic, rules }`), `normalizeViewFilterTree` (view-op allow-list = `FilterOperator` at `types.ts:135`; drop unknown kinds + `console.warn`; truncated/non-object → `undefined`, never an empty OR), `pruneViewFilterTree`, `evaluateViewFilterTree` (Kleene), `serializeViewFilterTree`, `flattenLeaves` / `mapLeafAt` / `removeLeafAt` / `appendLeaf`, `getRequiredViewFilterLeaves` (AND-required only; OR / `not` → `[]`).
- Kleene: leaf → `matchesLeaf`; `expression` → `false`; `not` inverts `true`/`false`, `null` stays `null`; empty group → `null`; AND first-`false`; OR first-`true`; all-`null` → `null`. Root `null` / missing tree → keep all rows (`QueryEngine.ts:80`).
- Additive `filterTree?: SourceRuleNode` on `ViewModeStateDef` (after `filters` at `169`) and `ViewConfig` (after `filters` at `399`). No new AST.
- `QueryEngine.applyFilterTree(rows, tree, columns)`: same `columnMap` as `applyFilters` (`81`); matcher `(leaf) => this.matchesFilter(row, leaf, columnMap.get(leaf.field))`; root `!== false` visible. `evaluateFilterTree(row, tree, columns): boolean | null` for phase 010. Leave `applyFilters` `74-89` and `matchesFilter` `91-127` untouched; do not export `matchesFilter`.
- `RowPipeline.ts:93-97`: prune then evaluate one path — `state.filterTree` via `pruneViewFilterTree`, else `buildViewFilterTree(getEffectiveFilterRules(...), state.filterLogic)`; if `tree` then `applyFilterTree`, else today’s `applyFilters`.
- `src/__tests__/setup.ts` (new no-op), `"test": "vitest run"` on fork `package.json`, `src/data/__tests__/ViewFilterTree.test.ts`.

### Out of Scope
- `DataSource.ts` parse/serialize and `ViewStateStore` hydrate/persist (child `002-filter-tree-persistence`).
- Filter panel editor, wrap-into-group, depth cap, labeled `not` chrome (child `003-filter-panel-tree-editor`).
- Non-panel dual-write, rail toggle, new-record seeding (child `004-nonpanel-filter-coherence`).
- Vault/manual proof and CF grep freeze (child `005-filter-tree-proof`).
- A new `FilterGroup` AST; calling `matchesSourceRuleTree`; exporting `matchesFilter`; evaluator depth cap.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/ViewFilterTree.ts` | Create | Kleene module + leaf helpers + `getRequiredViewFilterLeaves` |
| `src/data/types.ts` | Edit | Additive `filterTree?: SourceRuleNode` after `filters` at `169` and `399` |
| `src/data/QueryEngine.ts` | Edit | Additive `applyFilterTree` and `evaluateFilterTree`; leave `74-89` and `91-127` |
| `src/data/RowPipeline.ts` | Edit | Tree path at `93-97` |
| `src/__tests__/setup.ts` | Create | No-op setup referenced by `vitest.config.ts:4-7` |
| `package.json` | Edit | Add `"test": "vitest run"` |
| `src/data/__tests__/ViewFilterTree.test.ts` | Create | `(A and B) or C`, Kleene skip, `not`, serialize, required-leaves |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Kleene `evaluateViewFilterTree` in `src/data/ViewFilterTree.ts` | `(A and B) or C` matches the expected subset; empty group is `null` in every position (not `SourceRules.ts:152` poison, not AppFlowy all-skips-hide at `controller.rs:493-503`); `expression` → `false`; `not` inverts `true`/`false` and leaves `null` |
| REQ-002 | No new AST; no `matchesSourceRuleTree` reuse | `SourceRuleNode` (`types.ts:234-250`) is the only tree type; grep: no `FilterGroup`; zero runtime import from `SourceRules.ts` or `QueryEngine.ts` |
| REQ-003 | `QueryEngine.applyFilterTree` plus `evaluateFilterTree` | Single-leaf tree ≡ `applyFilters` on the same rules; empty/missing tree ≡ all rows (`QueryEngine.ts:80`); `evaluateFilterTree` returns `boolean \| null`; `matchesFilter` stays private (`91-127`) |
| REQ-004 | `RowPipeline.ts:93-97` routes through the tree | Live views with any effective filter go through `applyFilterTree`; empty filters still no-op via today’s `applyFilters` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Additive `filterTree?` types | `ViewModeStateDef` after `filters` at `169` and `ViewConfig` after `filters` at `399`; `FilterGroup` grep empty |
| REQ-006 | Vitest harness and module tests | `src/__tests__/setup.ts` exists; `"test": "vitest run"` on `package.json`; `npx vitest run` executes `ViewFilterTree.test.ts` including serialize round-trip, truncated root → `undefined`, `getRequiredViewFilterLeaves` ignores OR children |
| REQ-007 | Phase 010 primitives exported here | Public surface includes `evaluateViewFilterTree`, `normalizeViewFilterTree`, `QueryEngine.evaluateFilterTree`, `QueryEngine.applyFilterTree`. `ConditionalFormatting.ts:38` is not edited this child |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `(A and B) or C` unit test passes; nested empty AND under OR is skip.
- **SC-002**: Single-leaf tree ≡ flat `applyFilters`; empty/missing tree keeps all rows.
- **SC-003**: `matchesFilter` is not exported; `applyFilters` `74-89` is byte-stable for the flat contract.
- **SC-004**: `npx vitest run` starts (no missing-setup crash) and the new test file is green.

### Acceptance Scenarios

- **Given** tree `(A and B) or C`, **when** `evaluateViewFilterTree` runs with a fake `matchesLeaf`, **then** the Kleene result matches AND-of-A-B OR C.
- **Given** a nested empty AND under OR, **when** evaluation runs, **then** the empty group is skip (`null`), not every-row (`SourceRules.ts:152`) and not hide-all (`controller.rs:493-503`).
- **Given** a single leaf and the same `matchesFilter`, **when** `applyFilterTree` runs, **then** the row subset equals `applyFilters`.
- **Given** a missing or empty root tree, **when** `applyFilterTree` / the pipeline runs, **then** all rows stay visible (`QueryEngine.ts:80`).
- **Given** an `expression` node in junk JSON, **when** evaluation runs, **then** the node is `false` and does not throw.
- **Given** `vitest.config.ts:4-7` without `src/__tests__/setup.ts` today, **when** this child ships, **then** `npx vitest run` starts.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Reusing `matchesSourceRuleTree` | Nested empty AND under OR matches every row (`SourceRules.ts:152`) | Kleene `evaluateViewFilterTree` only; document AppFlowy divergence in the test file |
| Risk | Runtime import from `SourceRules.ts` | Source ops (`inFolder`, `hasProperty`, `SourceRules.ts:7-28`) leak; unknown view ops match every row (`QueryEngine.ts:124-125`) | Type-only `./types`; local duck-type predicates |
| Risk | Exporting `matchesFilter` | Breaks the private leaf contract | Additive methods only; `91-127` untouched |
| Dependency | Later persistence / panel / coherence children | Nested trees are in-memory until those ship | This child still makes legacy flat filters take the tree path via `buildViewFilterTree` |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults from parent research: Kleene skip (not AppFlowy OR-of-all-skips); `expression` evaluates `false`; `getRequiredViewFilterLeaves` is AND-required only so later new-record seeding does not OR-poison frontmatter.
<!-- /ANCHOR:questions -->
