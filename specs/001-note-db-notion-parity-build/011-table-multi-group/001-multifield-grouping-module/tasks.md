---
title: "Tasks: Multi-Field Grouping Module"
description: "Same-diff task list for MultiFieldGrouping.ts, groupByFields on ViewConfig, and DataSource parse plus serialize."
trigger_phrases:
  - "multifield grouping tasks"
  - "groupbyfields persist"
  - "buildGroupTree"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/011-table-multi-group/001-multifield-grouping-module"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Multi-Field Grouping Module

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

T003–T005 are **one atomic diff**. Do not ship `groupByFields[]` without DataSource parse `885` + serialize `1088`. The empty/order/uncategorized chain lives inside `buildGroupTree` (do not split it).
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read parent `research/synthesis.md` ranks 1, 2, 5 plus `research/final-plan.md` steps 1–2 (same-diff persist, compose chain, flatten node shape) [15m]
- [ ] T002 Confirm live fork paths — `EuroFormat.ts:1-42`, `getBoardSubgroups` `DatabaseView.ts:9669-9673`, dispatch `6332-6333`, loop `TableRenderer.ts:82-155`; confirm there is no `src/views/table/TableRenderer.ts`; gallery/list `9554-9578` and timeline `2890-2894` stay on `vs().groupByField` [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Create `src/data/MultiFieldGrouping.ts`**: EuroFormat header (`EuroFormat.ts:1-42`); pure; **no renderer imports**. Exports `effectiveGroupFields(config, state)` = `config.groupByFields?.length ? config.groupByFields : (state.groupByField \|\| config.groupByField ? [that] : [])`; `buildGroupTree(rows, fields, config, groupFn)` where `groupFn` is `withEmptyOptionGroups` → `queryEngine.groupBy` → `sortGroups(getEffectiveGroupOrder)` per parent (`DatabaseView.ts:9669-9673`) then recurse `buildLevel(group.rows, fields.slice(1))`; `flattenGroupTree` preorder `{ key, rows, count, depth, path, field, collapseKey, children }` with depth 0 `collapseKey === key` and nested `collapseKey = path.join("::")`; `dropComputedGroupFields` via `isComputedGroupField` (`GroupDisplay.ts:64-69`) with one warning (`src/data/MultiFieldGrouping.ts`) [M]
- [ ] T004 **Type** — same diff as T003: add `groupByFields?: string[]` beside `groupByField` at `types.ts:362`; leave `:368` untouched (`src/data/types.ts`) [S]
- [ ] T005 **Persist** — same diff as T003: parse `Array.isArray(v["groupByFields"]) ? filtered strings : undefined` at `DataSource.ts:885`; serialize `view.groupByFields?.length ? view.groupByFields : undefined` at `:1088`; no `legacyViewKeys` entry (`src/data/DataSource.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T006 1-field `effectiveGroupFields` equals `[groupByField]`; 2-field tree has Type nodes inside each Category; 3-field config still nests in the data layer (REQ-002) [S]
- [ ] T007 Leftover `formula.*` / computed / rollup dropped with one warning; YAML round-trip keeps `groupByFields: [Category, Type]` and omits the key when unset (`DataSource.ts:885, 1088`) [S]
- [ ] T008 Grep the new module for vault writes / `fetch`; confirm no renderer imports (REQ-007) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T005 shipped as one diff
- [ ] Manual verification of T006–T008 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 1, 2, 5
- **Parent final-plan**: `../research/final-plan.md` steps 1–2
<!-- /ANCHOR:cross-refs -->
