---
title: "Feature Specification: Multi-Field Grouping Module"
description: "Same-diff data slice: create MultiFieldGrouping.ts, add groupByFields[] beside groupByField, and land DataSource parse plus serialize so the array survives reload."
trigger_phrases:
  - "multifield grouping"
  - "groupbyfields"
  - "buildGroupTree"
  - "effectiveGroupFields"
  - "flattenGroupTree"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/011-table-multi-group/001-multifield-grouping-module"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored MultiFieldGrouping same-diff child from synthesis and final-plan"
    next_safe_action: "Implement MultiFieldGrouping.ts plus types and DataSource persist"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-multifield-grouping-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Multi-Field Grouping Module

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `011-table-multi-group` |
| **Parent Spec** | ../spec.md |
| **Phase** | 1 of 5 |
| **Predecessor** | None |
| **Successor** | 002-grouped-table-flatten |
| **Handoff Criteria** | Module, `groupByFields?`, and DataSource parse/serialize land together; 1-field fallback equals `[groupByField]` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 5** — Parent: [`../spec.md`](../spec.md) · Successor: `002-grouped-table-flatten`. This child is the **same-diff data slice** from `research/final-plan.md` steps 1–2 (synthesis ranks 1, 2, and 5). Do not ship `groupByFields[]` on `ViewConfig` without DataSource parse `885` + serialize `1088`. Compose `withEmptyOptionGroups` → `groupBy` → `sortGroups(getEffectiveGroupOrder)` inside `buildGroupTree`; do not split that chain into a later child.

The renderer loop, embedded dispatch, and toolbar Sub-group picker wait for later children. Nested row drag stays out of this phase.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Tables still dispatch on one string (`src/views/DatabaseView.ts:6332-6333`) while Notion View settings expose Group + Sub-group. `parseViewConfig` / serialize only know `groupByField` (`src/data/DataSource.ts:885, 1088`). An unserialized `groupByFields[]` is deleted on the next config save. `getBoardSubgroups` already has the per-parent regroup (`DatabaseView.ts:9669-9673`); tables do not reuse it.

### Purpose
Create one EuroFormat-shaped leaf `src/data/MultiFieldGrouping.ts` (`EuroFormat.ts:1-42`: pure functions, no renderer imports) with `effectiveGroupFields`, `buildGroupTree`, `flattenGroupTree`, and `dropComputedGroupFields`, add `groupByFields?: string[]` beside `groupByField` (`types.ts:362`), and land parse + serialize in the **same diff** so a 2-field YAML config survives reload.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New module `src/data/MultiFieldGrouping.ts` on the `EuroFormat.ts:1-42` contract. Exports: `effectiveGroupFields(config, state)`, `buildGroupTree(rows, fields, config, groupFn)`, `flattenGroupTree`, `dropComputedGroupFields`. Pure; no renderer imports.
- `effectiveGroupFields` = `config.groupByFields?.length ? config.groupByFields : (state.groupByField || config.groupByField ? [that] : [])`. Empty array falls back. Compute unbounded; picker later caps at 2.
- `groupFn` is exactly `getBoardSubgroups` (`DatabaseView.ts:9669-9673`): `withEmptyOptionGroups` → `queryEngine.groupBy` → `sortGroups(getEffectiveGroupOrder)` per parent. Recurse `buildLevel(group.rows, fields.slice(1))`.
- Flatten preorder `{ key /* leaf value */, rows, count, depth, path /* leaf keys */, field, collapseKey, children }`. Depth 0: `collapseKey === key` (REQ-004). Nested: `collapseKey = path.join("::")`.
- `groupByFields?: string[]` beside `groupByField` (`types.ts:362`). Group-hide map at `:368` unchanged.
- Parse: `Array.isArray(v["groupByFields"]) ? filtered strings : undefined` at `DataSource.ts:885`. Serialize: `view.groupByFields?.length ? view.groupByFields : undefined` at `1088`. No `legacyViewKeys` entry.
- Drop leftover `formula.*` / computed / rollup with one `console.warn` (`GroupDisplay.ts:64-69`); never crash, never write.

### Out of Scope
- Table dispatch and `renderGroupedTable` (child `002-grouped-table-flatten`).
- Depth-aware `TableRenderer` loop, CSS, create defaults (child 002).
- Embedded copy-back (child `003-embedded-table-grouping`).
- Toolbar Sub-group picker (child `004-table-subgroup-picker`).
- Nested row drag; ViewStateStore threading; unifying with `boardSubgroupEnabled` / `boardSubgroupField` (`types.ts:339-340`).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/MultiFieldGrouping.ts` | Create | Pure helpers: `effectiveGroupFields`, `buildGroupTree`, `flattenGroupTree`, `dropComputedGroupFields` |
| `src/data/types.ts` | Edit | Add `groupByFields?: string[]` beside `groupByField` at `:362` |
| `src/data/DataSource.ts` | Edit | Parse at `:885`; serialize at `:1088` (`undefined` when empty) |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | `src/data/MultiFieldGrouping.ts` exists with the locked exports | Pure functions; EuroFormat header; **no renderer imports**; `buildGroupTree` uses the `getBoardSubgroups` chain (`DatabaseView.ts:9669-9673`) per parent |
| REQ-002 | `groupByFields?` is on `ViewConfig` | Additive field beside `groupByField` at `types.ts:362`; group-hide map at `:368` unchanged |
| REQ-003 | Persistence round-trips in the same commit | Parse at `DataSource.ts:885` (`Array.isArray` → filtered strings, else `undefined`); serialize at `:1088` (`view.groupByFields?.length ? view.groupByFields : undefined`); no `legacyViewKeys` strip |
| REQ-004 | Legacy 1-field fallback | `groupByFields` absent or empty ⇒ `effectiveGroupFields` is `[groupByField]` when that string is set, else `[]` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Flatten distinguishes leaf `key` from `collapseKey` | Depth 0: `collapseKey === key`. Nested: `collapseKey = path.join("::")`. Create/DnD later use per-level `(field, leaf key)` — never `Cat::Type` as a property value |
| REQ-006 | Computed / rollup leftovers are dropped | `dropComputedGroupFields` uses `isComputedGroupField` (`GroupDisplay.ts:64-69`); one warning; remaining fields still build a tree |
| REQ-007 | Module is display-only | No vault writes, no `fetch`, no renderer imports; `groupBy` stays pure (`QueryEngine.ts:132-152`) |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: 1-field `effectiveGroupFields` equals `[groupByField]`.
- **SC-002**: A 2-field tree has Type nodes inside each Category; a 3-field config still nests in the data layer.
- **SC-003**: YAML round-trip keeps `groupByFields: [Category, Type]` and omits the key when unset.
- **SC-004**: Leftover computed/rollup fields drop with one warning and never write.

### Acceptance Scenarios

- **Given** a view with only `groupByField: Category`, **when** `effectiveGroupFields` runs, **then** the result is `["Category"]`.
- **Given** `groupByFields: [Category, Type]`, **when** `buildGroupTree` runs, **then** each Category parent has Type children from the same `groupFn` chain as `getBoardSubgroups` (`DatabaseView.ts:9669-9673`).
- **Given** a leftover `formula.*` in the field list, **when** the tree is built, **then** it is dropped with one console warning (`GroupDisplay.ts:64-69`).
- **Given** `groupByFields: [Category, Type]` in YAML, **when** parse then serialize run, **then** the array is kept; when the array is empty, serialize omits the key (`DataSource.ts:885, 1088`).
- **Given** a depth-0 node, **when** flatten emits it, **then** `collapseKey === key` so later hide keys match today (REQ-004).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Persistence miss (DataSource whitelist) | `groupByFields[]` deleted on next save | Same-diff REQ-003; serialize `undefined` when empty |
| Risk | Reimplementing grouping inside the module | Divergent empty/order/uncategorized vs board | `groupFn` is the `getBoardSubgroups` body (`DatabaseView.ts:9669-9673`) |
| Risk | Conflating `collapseKey` with leaf `key` | Later create path writes `Category = "Cat::Type"` | REQ-005: three distinct fields on the flat node |
| Dependency | Live fork `Obsidian Plugin/src` | Cannot cite or edit call sites | Read-only confirm of `EuroFormat.ts:1-42`, `types.ts:362`, `DataSource.ts:885, 1088` |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults from parent research: module filename `src/data/MultiFieldGrouping.ts`; keep `groupByFields[]` separate from `boardSubgroupField` (`types.ts:339-340`); no ViewStateStore thread; compute unbounded (picker cap is child 004).
<!-- /ANCHOR:questions -->
