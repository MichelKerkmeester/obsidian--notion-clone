---
title: "Tasks: Table Group-by 2+ Fields"
description: "Task list for multi-field table grouping: groupByFields[] plus recursive indented group headers."
trigger_phrases:
  - "groupbyfields tasks"
  - "table grouping build"
  - "recursive grouping"
  - "group header indent"
  - "grouping verification"
  - "table subgroup tasks"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/011-table-multi-group"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan.md review findings; refreshed graph metadata; compacted continuity fields"
    next_safe_action: "Build phase 011 per plan.md and tasks.md (T001 then T002)"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Tasks: Table Group-by 2+ Fields

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked / deferred |

**Task Format**: `T### [P?] Description (file path:line) [effort S/M/L]`

Phase 2 tasks are ordered by the research synthesis ranked backlog. Effort tiers: **S** ≈ ≤30m, **M** ≈ 1-3h, **L** ≈ >3h. Fork-relative paths; fork root `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin`.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm call sites and fork paths — re-read `research/synthesis.md` (1 new module + 3 logical call sites); confirm `src/views/TableRenderer.ts` (not `src/views/table/TableRenderer.ts`); read `EuroFormat.ts:1-42`, `getBoardSubgroups` (`DatabaseView.ts:9669-9673`), dispatch `6332-6333`, loop `TableRenderer.ts:82-155`; confirm those lines still match; confirm gallery/list (`9554-9578`) and timeline (`2890-2894`) stay on `vs().groupByField`; confirm scope (table only; gallery/list/timeline and nested DnD excluded) [15m]

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 Module + type + persist, one commit — add new `src/data/MultiFieldGrouping.ts` (`effectiveGroupFields`, `buildGroupTree`, `flattenGroupTree`, `dropComputedGroupFields`; EuroFormat contract, pure, no renderer imports); `buildGroupTree` recurses `groupFn` = `withEmptyOptionGroups` → `queryEngine.groupBy` → `sortGroups(getEffectiveGroupOrder)` per parent (the exact body of `getBoardSubgroups`, `DatabaseView.ts:9669-9673`) — the per-level empty/order/uncategorized chain is the body of `buildGroupTree`, not a separate task; `flattenGroupTree` emits preorder `{ key, rows, count, depth, path, field, collapseKey, children }` (depth 0: `collapseKey === key`; nested: `collapseKey = path.join("::")`); `effectiveGroupFields(config, state) = config.groupByFields?.length ? config.groupByFields : (state.groupByField || config.groupByField ? [that] : [])`; add `groupByFields?: string[]` to `ViewConfig` beside `groupByField` (`src/data/types.ts:362`); parse `groupByFields` at `DataSource.ts:885` and serialize at `1088` as `view.groupByFields?.length ? view.groupByFields : undefined`; no `legacyViewKeys` strip entry; **same commit as the module** (new `src/data/MultiFieldGrouping.ts`; `src/data/types.ts:362`; `src/data/DataSource.ts:885, 1088`) [M]
- [ ] T003 Table dispatch only — `DatabaseView.ts:6332-6333` dispatch becomes `effectiveGroupFields(config, this.vs()).length > 0` then `renderGroupedTable`; `renderGroupedTable` `9539-9545` sets `fields = dropComputedGroupFields(effectiveGroupFields(...))`, `flattened = flattenGroupTree(buildGroupTree(this.rows, fields, config, groupFn))`, then `tableRenderer.renderGroupedTable(..., flattened, fields[0])`; leave `tryPatchExternalTableRows` (`:2241-2263`) on `state.groupByField` + today's flat groups (nested flatten fails `patchGroupedRows` and full-rerenders — the safety valve, not a rewrite); do not change gallery/list (`9554-9578`) or timeline (`2890-2894`) (`src/views/DatabaseView.ts:6332-6333, 9539-9545, 2241-2263`) [S]
- [ ] T004 Depth-aware loop + CSS + collapse keys + create defaults (one loop edit) — extend `TableGroup` additively (`depth?`, `path?`, `field?`, `collapseKey?`, `children?`) at `TableRenderer.ts:17-21`; loop `82-155`: header always, class `db-group-header--depth-N`, collapse via `isGroupCollapsed(fields[0], collapseKey)` / `toggleGroupCollapsed` (`DatabaseView.ts:9845-9856` — keys stay opaque); if collapsed skip while `depth > collapsedDepth`; if `children.length` skip the leaf table; if leaf render today's table + summaries + `getGroupVisibleCount(config, fields[0], collapseKey, ...)` + expand controls; `setupGroupDropTarget` **only at depth 0** using `fields[0]` and the plain leaf `key` (not `collapseKey`) — nested groups have no drop target; create: leaf `defaults` = merge `resolveGroupCreateDefaults` for every `(field, key)` in the path (collapse key, leaf value, and create defaults are three distinct fields — never conflate them or new rows get `Category = "Cat::Type"`), `setupRow` `context.groups` = that same array (`TableRenderer.ts:470` today is one pair); computed level ⇒ no create (`:149-150`); CSS: `padding-left: calc(16px * N)` on `--depth-N`, `.db-group-header + .db-group-header { margin-top: 5px }` beside `styles.css:6255-6257`, **depth ≥ 1 not sticky** (only depth 0 keeps `position: sticky` — two depths share one sticky slot and paint over each other), toggles stay 20×20 (`:6218-6219`), `tableMinWidth` per header (`:112`) unchanged (`src/views/TableRenderer.ts:17-21, 82-155, 148-151, 470`; `styles.css:6171-6185, 6255-6257`) [M]
- [ ] T007 Embedded table dispatch + copy-back sibling — table grouped branch (`EmbeddedDatabaseRenderer.ts:1012-1016`) uses the same `effectiveGroupFields` + tree + flatten as DatabaseView; do not change gallery/list (`:973-986`) or timeline (`:1005-1007`); add `origView.groupByFields = this.config.groupByFields` beside `:3353` (`Object.assign` at `:3364-3365` copies own keys; parse is still the load-bearing load path) (`src/views/EmbeddedDatabaseRenderer.ts:1012-1016, 3353, 3364-3365`) [S]
- [ ] T009 Table Sub-group picker (toolbar clone, table-gated) — clone `renderBoardSubgroupSection` (`ToolbarRenderer.ts:1423-1448`) behind `currentViewType === "table"` inside `populateGroupPopover` (`:1221-1266`); table-only section, same candidate filter as board plus `!isComputedGroupField` (board candidates exclude `file.name` + primary at `:1462`); cap at one subgroup (picker max 2); write path `DatabaseView.ts:2408-2426`: `config.groupByFields = sub ? [primary, sub] : undefined`, keep `vs().groupByField = primary` (`viewStateStore.persist` copies primary to `config.groupByField`); changing primary clears a colliding subgroup; undo label: reuse `undo.groupConfig` or add one i18n key — do not reuse `undo.boardSubgroupConfig`; **do not edit `renderBoardSettings`** (board-only, `:313-317`) — the ViewConfigPanel table section is deferred (`src/views/ToolbarRenderer.ts:1221-1266, 1423-1448, 1462`; `src/views/DatabaseView.ts:2408-2426`) [S]
- [ ] [B] T011 Nested-group row drag (multi-field write) — **deferred**; depth > 0 must write every field on the path; `moveRowsToGroup` is one field today (`37-38`); depth-0 drop targets unchanged and nested groups have no drop target so regrouping cannot `updateBoardGroup` two fields (`src/views/TableRenderer.ts:111, 136, 145, 672`; `moveRowsToGroup` `37-38`) [L]

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Render Matrix
- [ ] T012 Render matrix in dev vault: 1/2/3 fields, nulls, empty groups, mixed types, checkbox/date at depth, multi-select fan-out, computed/rollup refusal, empty DB, collapsed parent, filter-before-group (`DatabaseView.ts:6313` then `:6332`) [45m]

### Integration Tests
- [ ] T013 Persistence round-trip: set `groupByFields`, reload, confirm preservation; serialize `undefined` when empty [15m]
- [ ] T014 Embedded-view regression: identical nested headers; copy-back `3353` preserves `groupByFields` [15m]
- [ ] T015 Mobile viewport check (≤360px): no new media queries, no desktop-only APIs, horizontal overflow equal to today [15m]
- [ ] T016 Diff-shape audit: one new `src/data/` module + 3 logical call sites; CSS + Embedded additive (`git diff --stat`) [10m]
- [ ] T017 Rebase dry-run on a scratch branch [15m]

### Manual Verification
- [ ] T018 Display-only / iCloud-safety audit: no new write paths; no note-body / frontmatter row writes; no network; grep the new module for vault writes / `fetch` [10m]
- [ ] T019 Single-field backward compatibility + patch behavior: before/after render byte-identical; collapse keys unchanged; 1-field external patch still succeeds; 2-field patch falls back to full render (safety valve) [10m]

### Documentation
- [ ] T020 Update checklist evidence and implementation summary [10m]

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All non-deferred tasks marked `[x]` (T005/T006/T008 merged into T002/T004; T010 dropped — the single Sub-group picker is T009).
- [ ] T011 remains `[B]` (deferred — nested DnD is a vault-write feature, not grouping display).
- [ ] Render matrix passed (2-field nesting + single-field backward compatibility + edge cases).
- [ ] Persistence round-trip verified; embedded views render identical nested headers.
- [ ] Checklist fully verified.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Research Source**: `research/synthesis.md` (ranked backlog) and `research/research.md` (evidence trail)

<!-- /ANCHOR:cross-refs -->
