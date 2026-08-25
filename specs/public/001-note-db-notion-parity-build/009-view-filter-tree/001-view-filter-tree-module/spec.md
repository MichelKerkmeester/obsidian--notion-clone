---
title: "Feature Specification: View Filter Tree Module"
description: "Isolated ViewFilterTree.ts Kleene evaluator plus additive filterTree types, QueryEngine applyFilterTree/evaluateFilterTree, RowPipeline caller, Vitest harness, and the phase-010 public surface. No persist, panel, or non-panel mutators."
trigger_phrases:
  - "view filter tree"
  - "kleene evaluator"
  - "applyfiltertree"
  - "evaluateviewfiltertree"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: View Filter Tree Module

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `009-view-filter-tree` |
| **Parent Spec** | ../spec.md |
| **Phase** | 1 of 4 |
| **Predecessor** | None |
| **Successor** | 002-filter-tree-persist |
| **Handoff Criteria** | Module, types, QueryEngine bridges, RowPipeline caller, harness, and tests land together; CF stays on `applyFilters` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 4** — Parent: [`../spec.md`](../spec.md) · Successor: `002-filter-tree-persist`. This child is the evaluation slice from `research/final-plan.md` steps 1–5, 10, and 11. Do not ship `ViewFilterTree.ts` without `applyFilterTree` / `evaluateFilterTree` and the `RowPipeline.ts:93-97` caller — otherwise live views never take the tree path.

Persist (`DataSource.ts`, `ViewStateStore.ts`), the filter-panel editor, and non-panel mutators belong to later children.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
View filters are a flat `FilterRule[]` plus one global `filterLogic`, so `(A and B) or C` is inexpressible (`QueryEngine.ts:74-89`). The fork already owns `SourceRuleNode` (`types.ts:234-250`) but `matchesSourceRuleTree` is the wrong walk: empty AND → `true` at `SourceRules.ts:152` makes a nested empty AND under OR match every row. There is also no Vitest setup file (`vitest.config.ts:4-7`) and no plugin `*.test.ts`.

### Purpose
Create one EuroFormat-shaped module `src/data/ViewFilterTree.ts` (`EuroFormat.ts:9-10`) with a Kleene three-valued evaluator, additive `filterTree?: SourceRuleNode` fields, QueryEngine bridges that keep `matchesFilter` private, a `RowPipeline` caller, and a runnable proof harness. Reuse `SourceRuleNode`; do not invent a `FilterGroup` AST; do not call `matchesSourceRuleTree`.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New `src/data/ViewFilterTree.ts`: type-only import from `./types`; runtime OK from `FilterRules.ts:3-12`; **zero runtime import** from `SourceRules.ts` or `QueryEngine.ts`. Local duck-type predicates (`type === "group"|"not"|"expression"`); do not import `isSourceRuleGroup`.
- Exports: `buildViewFilterTree` (shape of `createLegacySourceRuleTree`, `SourceRules.ts:48-59`: `[] → undefined`, one rule → leaf, else `{ type:"group", logic, rules }`); `normalizeViewFilterTree` (view-op allow-list = `FilterOperator` at `types.ts:135`; drop unknown kinds + `console.warn`; truncated/non-object → `undefined`, never an empty OR); `pruneViewFilterTree` (recursive `isEffectiveFilterRule`); `evaluateViewFilterTree` (Kleene: leaf → `matchesLeaf`; `expression` → `false`; `not` inverts `true`/`false`, `null` stays `null`; empty group → `null`; AND first-`false`; OR first-`true`; all-`null` → `null`); `serializeViewFilterTree`; `flattenLeaves` / `mapLeafAt` / `removeLeafAt` / `appendLeaf`; `getRequiredViewFilterLeaves` (AND-required only; OR / `not` → `[]`).
- Additive `filterTree?: SourceRuleNode` on `ViewModeStateDef` (after `filters` at `types.ts:169`) and `ViewConfig` (after `filters` at `types.ts:399`). No new AST.
- `QueryEngine.applyFilterTree(rows, tree, columns)`: same `columnMap` as `applyFilters` (`QueryEngine.ts:81`); matcher `(leaf) => this.matchesFilter(row, leaf, columnMap.get(leaf.field))`; root `!== false` visible. Additive `evaluateFilterTree(row, tree, columns): boolean | null` for phase 010. Leave `applyFilters` `74-89` and `matchesFilter` `91-127` untouched; do not export `matchesFilter`.
- `RowPipeline.ts:93-97`: `tree = state.filterTree ? pruneViewFilterTree(state.filterTree, …) : buildViewFilterTree(getEffectiveFilterRules(state.filters, validFields), state.filterLogic)`; if `tree` then `applyFilterTree`, else today’s `applyFilters`.
- Harness: `src/__tests__/setup.ts` (new no-op), `src/data/__tests__/ViewFilterTree.test.ts`, and `"test": "vitest run"` on fork `package.json`.
- Phase-010 contract freeze: public surface is `evaluateViewFilterTree`, `normalizeViewFilterTree`, `QueryEngine.evaluateFilterTree`, `QueryEngine.applyFilterTree`. `ConditionalFormatting.ts:38` stays on `applyFilters`.

### Out of Scope
- `DataSource.ts` parse/serialize and `ViewStateStore.ts` hydrate/persist (child `002-filter-tree-persist`).
- `FilterPanelRenderer.ts` nested editor (child `003-filter-panel-tree-editor`).
- Non-panel dual-write, rail toggle, new-record seeding (child `004-non-panel-filter-coherence`).
- A new `FilterGroup` AST; `matchesSourceRuleTree` changes; wrapping `parseSourceRuleTree` (`SourceRules.ts:227-257`); evaluator depth cap; AppFlowy `DashMap` cache (`controller.rs:350-409`).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/ViewFilterTree.ts` | Create | Kleene module + leaf helpers + `getRequiredViewFilterLeaves`; type-only `./types` |
| `src/data/types.ts` | Edit | Additive `filterTree?: SourceRuleNode` after `filters` at `:169` and `:399` |
| `src/data/QueryEngine.ts` | Edit | Additive `applyFilterTree` and `evaluateFilterTree`; `matchesFilter` stays private |
| `src/data/RowPipeline.ts` | Edit | Route through `applyFilterTree` when a tree exists (`:93-97`) |
| `src/__tests__/setup.ts` | Create | No-op setup referenced by `vitest.config.ts:4-7` |
| `src/data/__tests__/ViewFilterTree.test.ts` | Create | Kleene + legacy-equivalence + serialize + truncated-root cases |
| `package.json` | Edit | Add `"test": "vitest run"` (none today) |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Kleene `evaluateViewFilterTree` exists in `src/data/ViewFilterTree.ts` | `(A and B) or C` returns the expected subset via a fake `matchesLeaf`; empty group → `null` in every position; nested empty AND under OR is skip (not `SourceRules.ts:152` poison, not AppFlowy all-skips-hide at `controller.rs:493-503`); `expression` → `false`; `not` inverts `true`/`false` and leaves `null` as `null` |
| REQ-002 | Reuse `SourceRuleNode` — no new AST | `types.ts:234-250` is the only tree type; grep-verifiable: no `FilterGroup` |
| REQ-003 | `QueryEngine.applyFilterTree` evaluates view trees | Same `columnMap` as `applyFilters` (`:81`); single-leaf tree ≡ `applyFilters` on the same rules; root `null`/missing tree → all rows (`QueryEngine.ts:80`); `matchesFilter` stays private (`:91-127`) |
| REQ-004 | `RowPipeline.ts:93-97` is the only live eval caller this child | Effective filters go through the tree path; empty filters still no-op via today’s `applyFilters` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Vitest harness bootstrapped | `src/__tests__/setup.ts` exists; `npx vitest run` executes `ViewFilterTree.test.ts`; fork `package.json` has `"test": "vitest run"` |
| REQ-006 | Phase 010 is unblocked without painting every row | `QueryEngine.evaluateFilterTree` ships next to `applyFilterTree` (010 matches iff `=== true`); `ConditionalFormatting.ts:38` still calls `applyFilters`; grep shows no CF import of the new APIs |
| REQ-007 | Module stays cycle-free | Zero runtime import from `SourceRules.ts` / `QueryEngine.ts`; `pruneViewFilterTree` may import `isEffectiveFilterRule` (`FilterRules.ts:3-12`); local duck-types, no `isSourceRuleGroup` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `npx vitest run` is green on `ViewFilterTree.test.ts` for `(A and B) or C`, `not` wrapping a group, empty root → all rows, nested empty AND under OR is skip, `expression` → `false`, single-leaf ≡ flat, serialize round-trip, truncated root → `undefined`, `getRequiredViewFilterLeaves` ignores OR children.
- **SC-002**: Grep confirms no `FilterGroup` type and `ViewFilterTree.ts` has no runtime import from `SourceRules.ts`.
- **SC-003**: `matchesFilter` is not exported; `ConditionalFormatting.ts:38` is unchanged.
- **SC-004**: Live views with any effective filter go through `applyFilterTree`; empty filters still no-op.

### Acceptance Scenarios

- **Given** tree `(A and B) or C`, **when** `evaluateViewFilterTree` runs with a fake `matchesLeaf`, **then** the Kleene result matches the expected boolean and a nested empty AND is skip.
- **Given** a single-leaf tree and the same `matchesFilter`, **when** `applyFilterTree` runs, **then** the row subset equals `applyFilters` on those rules.
- **Given** a missing or empty root tree, **when** evaluation runs, **then** every row stays visible (`QueryEngine.ts:80`).
- **Given** a truncated or non-object root, **when** `normalizeViewFilterTree` runs, **then** the result is `undefined` (not an empty OR group) and unknown kinds log `console.warn`.
- **Given** the final module, **when** grepped, **then** `ConditionalFormatting.ts` does not import the new APIs.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Reusing `matchesSourceRuleTree` | Empty AND under OR matches every row (`SourceRules.ts:152`) | Kleene `evaluateViewFilterTree`; document AppFlowy divergence (`controller.rs:493-503`) in the test file |
| Risk | Runtime import from `SourceRules.ts` | `parseSourceRuleTree` whitelist is `SOURCE_RULE_OPERATORS` (`:7-28`); unknown view ops fall through `matchesFilter` `default: return true` (`QueryEngine.ts:124-125`) | Type-only `./types`; local duck-types; view-op allow-list in `normalizeViewFilterTree` |
| Risk | Shipping the module without QueryEngine / RowPipeline | Live views never evaluate the tree | Same-child REQ-003 and REQ-004 |
| Risk | `applyFilterTree([row])` as the 010 primitive | Root `null` passes and would paint every CF row | Ship `evaluateFilterTree` now; CF stays on `applyFilters` until 010 |
| Dependency | Later persist/panel/coherence children | Nested groups are in-memory only until those land | Export persist/UI helpers now (`normalizeViewFilterTree`, leaf index helpers, `getRequiredViewFilterLeaves`) so later children do not retouch the module |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults from parent research: Kleene skip (not AppFlowy OR-of-all-skips); `expression` evaluates `false` with no view-panel control in this child; evaluator is unbounded (UI cap is child 003).
<!-- /ANCHOR:questions -->
