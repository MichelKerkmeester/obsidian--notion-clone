---
title: "Implementation Plan: Table Group-by 2+ Fields"
description: "Implementation plan for multi-field table grouping via groupByFields[] and recursive indented group headers."
trigger_phrases:
  - "groupbyfields"
  - "multi-field grouping plan"
  - "recursive group by"
  - "indented group headers"
  - "table grouping implementation"
  - "table subgroup plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/011-table-multi-group"
    last_updated_at: "2026-08-27T17:27:13Z"
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
# Implementation Plan: Table Group-by 2+ Fields

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript — MIT-forked Obsidian note-database plugin |
| **Framework** | Obsidian plugin API (fork root: `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin`) |
| **Storage** | Vault notes; grouping settings display-only (iCloud-safe); config serialized per-file via `DataSource` |
| **Testing** | Dev vault manual render matrix, diff-shape audit, rebase dry-run |

### Overview
Add `groupByFields?: string[]` to `ViewConfig` and recurse `groupBy` through a new isolated module `src/data/MultiFieldGrouping.ts`, rendering indented group headers per depth. The locked shape is **composition, not a rewrite**: the new module mirrors `src/data/EuroFormat.ts:1-42` (one file, pure functions, no renderer imports, kept as a small rebasable diff) and recursively reuses `QueryEngine.groupBy` + the existing per-field maps; `TableRenderer` gets a flatten-with-depth pass and additive `TableGroup` fields. Effort **M**. The single biggest risk is a persistence miss — `DataSource` parse/serialize is a whitelist, so `groupByFields[]` that is never serialized is deleted on the next config save — plus any nested `setupGroupDropTarget` that would write two frontmatter fields and break the display-only / iCloud contract.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Locked design in `research/synthesis.md` read (1 new module + 3 logical call sites).
- [ ] `EuroFormat.ts:1-42` isolated-diff contract read.
- [ ] Board `boardSubgroupField` precedent and `getBoardSubgroups` (`DatabaseView.ts:9669-9673`) read as the recursion model.
- [ ] Scope limited to table-view multi-field grouping; gallery/list/timeline and nested DnD excluded.

### Definition of Done
- [ ] `groupByFields[]` renders recursive, indented group headers in the dev vault (2-field config).
- [ ] Single-field config renders byte-identically to today (`groupByFields` absent ⇒ `effectiveGroupFields = [groupByField]`).
- [ ] Persistence round-trips: parse `885` + serialize `1088`; reload preserves `groupByFields`.
- [ ] Path-qualified collapse keys (`path.join("::")` under `groupByFields[0]`); collapsed parent hides subtree; collapse key, leaf value, and create defaults are three distinct fields on the flat node.
- [ ] Sticky only at depth 0; depth ≥ 1 headers are not sticky (no stacked `top` offsets).
- [ ] Patch behavior: 1-field external patch still succeeds; 2-field flatten fails `patchGroupedRows` and full-rerenders (the safety valve — `patchGroupedRows` is not extended this phase).
- [ ] Embedded views render identical nested headers; copy-back `3353` preserves `groupByFields`.
- [ ] Diff shape: one new `src/data/MultiFieldGrouping.ts` module + 3 logical call sites; CSS + Embedded additive.
- [ ] Verified in the dev vault on desktop and at ≤360px mobile viewport; no new write paths.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated module plus minimal call sites, on the `EuroFormat.ts:1-42` model: the grouping logic lives in a NEW module `src/data/MultiFieldGrouping.ts` (pure functions, no renderer imports, small rebasable diff); existing files receive only small, additive, rebase-friendly edits. The renderer does **not** recurse the DOM — it consumes a flattened preorder list with depth.

### Key Components
- **`src/data/MultiFieldGrouping.ts` (new):** pure functions. Exports `effectiveGroupFields`, `buildGroupTree`, `flattenGroupTree`, `dropComputedGroupFields`.
  - `effectiveGroupFields(config, state) = config.groupByFields?.length ? config.groupByFields : (state.groupByField || config.groupByField ? [that] : [])`. When the array is present, also keep `groupByField = fields[0]` so the toolbar and `getActiveGroupField` stay consistent. Picker UX caps at 2; compute unbounded (REQ-002). Gate multi-field at **table dispatch only**.
  - `buildGroupTree(rows, fields, config, groupFn)` is the board's per-parent regroup generalized: `groupFn(rows, field)` = `withEmptyOptionGroups(config, field, queryEngine.groupBy(rows, field, [], col, config))` then `sortGroups(getEffectiveGroupOrder(...))` — the exact body of `getBoardSubgroups` (`DatabaseView.ts:9669-9673`). The per-level empty/order/uncategorized chain is the body of `buildGroupTree`, not a separate task. Recurse `buildLevel(group.rows, fields.slice(1))`. Drop computed/rollup entries with a console warning (`isComputedGroupField`, `GroupDisplay.ts:64-69`); never crash, never write.
  - `flattenGroupTree` emits preorder `{ key /* leaf value */, rows, count, depth, path /* leaf keys */, field, collapseKey, children }`. Depth-0 single-field nodes keep `collapseKey === key` so collapse keys and DOM match today (REQ-004); nested nodes use `collapseKey = path.join("::")`. Collapse key, leaf value, and create defaults are three distinct fields — never conflate them or new rows get `Category = "Cat::Type"`.
- **`src/views/TableRenderer.ts`:** extend `TableGroup` additively (`depth?`, `path?`, `field?`, `collapseKey?`, `children?`). In the loop (`82-155`): header always; indent via `db-group-header--depth-N`; collapse via `isGroupCollapsed(fields[0], collapseKey)` / `toggleGroupCollapsed` (`DatabaseView.ts:9845-9856`); if collapsed, skip while `depth > collapsedDepth`; if `children.length`, skip the leaf table; if leaf, render today's table + summaries + expand controls. Call `setupGroupDropTarget` **only at depth 0** using `fields[0]` and the plain leaf `key` (not `collapseKey`). Create-entry: leaf `defaults` = merge `resolveGroupCreateDefaults` for every `(field, key)` in the path; `setupRow` `context.groups` = that same array (`DatabaseView.ts:4599-4606`); computed level ⇒ no create.
- **`src/views/DatabaseView.ts`:** dispatch `6332-6333` becomes `effectiveGroupFields(...).length > 0`; `renderGroupedTable` `9539-9545` sets `fields = dropComputedGroupFields(effectiveGroupFields(...))`, `flattened = flattenGroupTree(buildGroupTree(...))`, then `tableRenderer.renderGroupedTable(..., flattened, fields[0])`. Leave `tryPatchExternalTableRows` (`:2241-2263`) on `state.groupByField` + today's flat groups — nested flatten fails `patchGroupedRows` and full-rerenders (the safety valve; `patchGroupedRows` is not extended this phase).
- **Settings:** `src/data/types.ts` beside `groupByField` (`362`); `src/data/DataSource.ts` parse `885` + serialize `1088` (`undefined` when empty) — **same commit as the module**. Required siblings: `EmbeddedDatabaseRenderer.ts:3353` (`groupByFields` next to `groupByField`) and embed grouped dispatch (`:1012-1016`); additive indent/spacing in `styles.css` (class + `.db-group-header + .db-group-header` next to `6255-6257`).
- **Table Sub-group picker (toolbar clone, table-gated):** `src/views/ToolbarRenderer.ts` clones `renderBoardSubgroupSection` (`:1423-1448`) behind `currentViewType === "table"` inside `populateGroupPopover` (`:1221-1266`); same candidate filter as board plus `!isComputedGroupField`; write path `DatabaseView.ts:2408-2426` sets `config.groupByFields = sub ? [primary, sub] : undefined` and keeps `vs().groupByField = primary`; changing primary clears a colliding subgroup; undo label reuses `undo.groupConfig` or a new i18n key (not `undo.boardSubgroupConfig`). **Do not edit `renderBoardSettings`** (board-only) — a ViewConfigPanel table section is deferred.

### Data Flow
View config (`groupByFields` + per-field maps) → `effectiveGroupFields(config, vs())` → `buildGroupTree` recurses `groupBy` per parent (reusing `withEmptyOptionGroups` → `groupBy` → `sortGroups(getEffectiveGroupOrder)`) → `flattenGroupTree` emits preorder nodes with `depth`/`path` → `TableRenderer` loop renders headers indented by depth, leaf tables inside the innermost group, collapse keys path-qualified under `groupByFields[0]`.

```ts
// MultiFieldGrouping.ts — pure, no renderer imports; EuroFormat-style rebasable diff.
export function effectiveGroupFields(config, state): string[] { /* fallback to [groupByField] */ }
export function buildGroupTree(rows, fields, config, groupFn): GroupNode[] { /* recurse per parent */ }
export function flattenGroupTree(nodes): FlatGroup[] { /* preorder with depth/path */ }
```

### Locked Facts
- Spec path `src/views/table/TableRenderer.ts` is **wrong**; the file is `src/views/TableRenderer.ts` (re-verified).
- Do **not** adopt Anytype query-as-group (`context/anytype-ts` `model/view.ts:37,57` — one `groupRelationKey`; per-group filtered subscribe). AppFlowy is single-field (`group/controller.rs:41-44, 60`) with no grid grouping UI.
- Keep `groupByFields[]` **separate** from `boardSubgroupEnabled` / `boardSubgroupField` (`types.ts:339-340`).
- Do **not** add `ViewStateStore` (`persist` already writes top-level `groupByField` at `69-84`).

### Edge Cases & Mobile/iCloud Safety
- **Legacy 1-field:** `groupByFields` absent ⇒ `effectiveGroupFields` is `[groupByField]`; flatten depth 0; collapse keys unchanged; byte-identical to today.
- **Null / missing:** each level gets `t("common.uncategorized")` (`QueryEngine.ts:279`); hide via `showEmptyGroups[field]` (`GroupVisibility.ts:24-30`); distinct nodes per depth.
- **Empty groups:** `withEmptyOptionGroups` per level (`GroupVisibility.ts:52-60`); multi-select defaults to hidden empties (`:20`).
- **Mixed types:** stringify + trim + dedupe (`QueryEngine.ts:276-280`); `localeCompare` tie-break; no throw.
- **Checkbox / date at depth:** checkbox `"true"`/`"false"` (`QueryEngine.ts:261`); date modes stay per-field (`dateGroupModes[field]`).
- **Multi-select fan-out:** a row can appear in multiple sibling groups at every depth (`QueryEngine.ts:143-147`); `rowByPath` is render-only (`TableRenderer.ts:90`); counts are non-exclusive.
- **3+ fields:** compute recurses; UI picker caps at 2; `groupRowLimit` + `expandedGroupRows` clamp each leaf (`GroupVisibility.ts:63-75`); 5k×2 is O(N·D) Map passes — no memoization (`QueryEngine.ts:140-148`).
- **Computed / rollup:** picker filters them; module drops leftovers (`GroupDisplay.ts:64-69`; create gate `TableRenderer.ts:149-150`).
- **Filter-before-group:** `this.rows` already filtered at `DatabaseView.ts:6313` before `6332`.
- **Empty DB:** `rows.length === 0` → `db-empty` (`TableRenderer.ts:92-98`).
- **Collapsed parent:** flatten is preorder; skip while `depth > collapsedDepth` (`TableRenderer.ts:132`).
- **Sticky stacking:** every `.db-group-header` shares one `position: sticky; top: calc(...); z-index: 26` slot (`styles.css:6171-6184`); two depths paint over each other. **Sticky only at depth 0**; depth ≥ 1 headers are `position: relative` (cheaper and safer than stacked `top` offsets).
- **Patch path:** `patchGroupedRows` requires each header's next sibling to be `.db-table-wrap` (`TableRenderer.ts:209-250`); parent nodes skip the table, so 2-field trees return `false` and `tryPatchExternalTableRows` (`DatabaseView.ts:2199-2272`) falls through to a full refresh. Do **not** extend `patchGroupedRows` this phase; do prove 1-field still patches.
- **DnD:** depth-0 drop targets unchanged; nested groups have **no** drop target so regrouping cannot `updateBoardGroup` two fields.
- **Mobile (REQ-006 / NFR-M01):** no table-specific narrow breakpoint; `body.is-phone` plus label `max-width: min(480px, calc(100vw - 48px))`; nested headers add no desktop-only APIs and no new media queries; `tableMinWidth` on each header (`TableRenderer.ts:112`) keeps horizontal overflow equal to today (SC-004); collapse toggles stay 20×20 — do not special-case depth.
- **iCloud / display-only (REQ-007 / NFR-R01):** `groupBy` is pure (`QueryEngine.ts:132-152`); the new module writes nothing; collapse/expand still only `scheduleConfigSave` view definition (`DatabaseView.ts:9850-9856`), serialized per-file; no note-body / frontmatter row writes; no network (REQ-008). Nested DnD is deferred, so this phase adds **no new write path**.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Core Data Layer + Persistence (one commit)
- [ ] Add `src/data/MultiFieldGrouping.ts` (EuroFormat contract): `effectiveGroupFields`, `buildGroupTree`, `flattenGroupTree`, `dropComputedGroupFields`. `buildGroupTree` owns the per-level `withEmptyOptionGroups` → `groupBy` → `sortGroups(getEffectiveGroupOrder)` chain (the body of `getBoardSubgroups`); `flattenGroupTree` emits `collapseKey`/`field` on each node.
- [ ] Add `groupByFields?: string[]` to `ViewConfig` beside `groupByField` (`src/data/types.ts:362`); `collapsedGroups` (`368`) unchanged.
- [ ] Persistence round-trip in `src/data/DataSource.ts`: parse `885`, serialize `1088` as `undefined` when empty; no `legacyViewKeys` strip entry — **same commit as the module** (one PR for data + persist).

### Phase 2: Renderer + Integration
- [ ] Table dispatch only: `DatabaseView.ts:6332-6333` → `effectiveGroupFields(...).length > 0`; `renderGroupedTable` `9539-9545` builds the tree then `tableRenderer.renderGroupedTable(..., flattened, fields[0])`; leave `tryPatchExternalTableRows` (`:2241-2263`) on `state.groupByField` (2-field patch falls back to full render).
- [ ] Depth-aware loop + CSS + collapse keys + create defaults (one loop edit): extend `TableGroup` additively (`depth?`, `path?`, `field?`, `collapseKey?`, `children?`) in `src/views/TableRenderer.ts:17-21`; loop `82-155` — header always, `db-group-header--depth-N` indent, collapse via `isGroupCollapsed(fields[0], collapseKey)`, skip while `depth > collapsedDepth`, `children.length` ⇒ skip leaf table; `setupGroupDropTarget` only at depth 0 using the plain leaf `key` (not `collapseKey`); create defaults merge `resolveGroupCreateDefaults` per `(field, key)` in the path; computed level ⇒ no create.
- [ ] Additive CSS: `padding-left: calc(16px * N)` on `--depth-N` (`styles.css:6171-6185`); consecutive-header margin beside `6255-6257`; **depth ≥ 1 not sticky** (only depth 0 keeps `position: sticky`); toggles stay 20×20.
- [ ] Embedded table dispatch + copy-back sibling: `EmbeddedDatabaseRenderer.ts:1012-1016` (same tree + flatten); add `origView.groupByFields = this.config.groupByFields` beside `:3353`; do not change gallery/list (`:973-986`) or timeline (`:1005-1007`).
- [ ] Table Sub-group picker (toolbar clone, table-gated): clone `renderBoardSubgroupSection` (`ToolbarRenderer.ts:1423-1448`) behind `currentViewType === "table"` in `populateGroupPopover` (`:1221-1266`); candidate filter = board filter plus `!isComputedGroupField`; write path `DatabaseView.ts:2408-2426`; undo label reuses `undo.groupConfig` (not `undo.boardSubgroupConfig`). **Do not edit `renderBoardSettings`** — the ViewConfigPanel table section and a second toolbar picker are deferred.
- [ ] [B] Nested-group row drag (multi-field write) — **deferred**; depth-0 drop targets unchanged, nested groups have no drop target.

### Phase 3: Verification
- [ ] Manual render matrix in the dev vault (1/2/3 fields, nulls, empty groups, mixed types, checkbox/date at depth, multi-select fan-out, computed/rollup refusal, empty DB, collapsed parent, filter-before-group).
- [ ] Patch behavior: 1-field external patch still succeeds; 2-field patch falls back to full render.
- [ ] Mobile viewport check (≤360px): no new media queries, no desktop-only APIs, horizontal overflow equal to today; sticky only at depth 0.
- [ ] Persistence round-trip: set `groupByFields`, reload, confirm preservation; confirm single-field byte-identical.
- [ ] Embedded-view regression: identical nested headers; copy-back preserves `groupByFields`.
- [ ] Diff-shape audit (`git diff --stat`): one new `src/data/` module + 3 logical call sites; CSS + Embedded additive; grep the new module for vault writes / `fetch`.
- [ ] Rebase dry-run on a scratch branch.
- [ ] Display-only / iCloud-safety audit: no new write paths; no note-body / frontmatter row writes; no network.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Render matrix | 1/2/3 fields, nulls, empty groups, mixed types, checkbox/date at depth, multi-select fan-out, computed/rollup refusal, empty DB, collapsed parent, filter-before-group | Dev vault manual verification |
| Backward compatibility + patch | Legacy single-field tables byte-identical; collapse keys unchanged; 1-field external patch still succeeds; 2-field patch falls back to full render | Before/after render comparison + patch observation |
| Persistence | `groupByFields` survives reload; serialize `undefined` when empty | Dev vault reload round-trip |
| Embedded | Identical nested headers; copy-back preserves `groupByFields` | Dev vault embedded-view spot-check |
| Mobile + sticky | Nested headers at ≤360px; no new media queries; overflow equal to today; sticky only at depth 0 | Dev vault on narrow viewport |
| Diff shape | One new module + 3 logical call sites; CSS + Embedded additive; grep new module for vault writes / `fetch` | `git diff --stat` audit |
| Rebase | Upstream rebase applies cleanly | Rebase dry-run on a scratch branch |
| Display-only / iCloud | No new write paths; no note-body/frontmatter row writes; no network | Diff audit + render observation |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Upstream note-database fork | External (MIT) | Green | Renderer and settings sources unavailable |
| `boardSubgroupField` precedent / `getBoardSubgroups` | Internal | Green | Two-field grouping recursion pattern reference missing |
| `EuroFormat.ts` isolated-diff model | Internal | Green | Rebase-safe module contract missing |
| Research synthesis (`research/synthesis.md`) | Internal | Green | Ranked backlog and locked design unavailable |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Nested rendering regresses table views, single-field behavior changes, or persistence loses `groupByFields`.
- **Procedure**: Remove `src/data/MultiFieldGrouping.ts` and revert the 3 logical call-site edits (DatabaseView dispatch+render, TableRenderer depth loop, settings types.ts+DataSource.ts) plus the additive CSS/Embedded siblings and the toolbar Sub-group picker clone. Single-field config is untouched by the change, so tables degrade to today's grouping behavior.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Core Data Layer + Persistence | None | Renderer + Integration |
| Renderer + Integration | Core Data Layer + Persistence | Verification |
| Verification | Renderer + Integration | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Core Data Layer + Persistence | Medium | 1.5 hours |
| Renderer + Integration | Medium | 2.5 hours |
| Verification | Medium | 1 hour |
| **Total** | | **≈5 hours (M)** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Diff shape audited (one new module + 3 logical call sites; CSS + Embedded additive).
- [ ] Single-field render comparison captured before/after (byte-identical).
- [ ] Persistence round-trip verified (reload preserves `groupByFields`).

### Rollback Procedure
1. Remove `src/data/MultiFieldGrouping.ts`.
2. Revert the call-site edits (DatabaseView, TableRenderer, settings types.ts+DataSource.ts) and the additive CSS/Embedded siblings.
3. Re-run the render matrix for single-field configs.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: N/A — grouping is display-only; no vault data is written. `groupByFields` is a view-config field; removing the parse/serialize lines leaves old configs with an ignored key (harmless).

<!-- /ANCHOR:enhanced-rollback -->
