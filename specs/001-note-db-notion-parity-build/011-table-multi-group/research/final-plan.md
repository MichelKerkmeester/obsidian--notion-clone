# Final Plan: Table Group-by 2+ Fields
> Reviewed & optimized build plan, from a fresh Grok 4.6 (xhigh-fast) review of this phase's rewritten spec/plan/tasks/checklist plus its synthesis and research.

## Review — strengths, gaps, risks

The locked shape is right: composition, not a rewrite. `QueryEngine.groupBy` at `DatabaseView.ts` is already the board’s per-parent regroup (`getBoardSubgroups` at `9669-9673`), `TableGroup` is still flat `{key, rows, count}` (`TableRenderer.ts:17-21`), and the table dispatch is still one string (`DatabaseView.ts:6332-6333` → `renderGroupedTable` `9539-9545`). A pure `src/data/MultiFieldGrouping.ts` on the `EuroFormat.ts:1-42` contract, then a flatten-with-depth pass through the existing loop (`TableRenderer.ts:82-155`), is the cheapest Notion Group + Sub-group. Persistence as a whitelist is correctly named as the #1 risk: parse is `DataSource.ts:885`, serialize is `1088`; an unserialized `groupByFields[]` is deleted on the next save (synthesis ranked #2; research F3.1–F3.3). Nested `setupGroupDropTarget` (`TableRenderer.ts:111, 136, 145, 672`) would call `moveRowsToGroup` (`:37-38`) on one field and break the display-only / iCloud contract — deferring it is correct.

The current task list fights itself.

- **T006 is not a task.** “Compose `withEmptyOptionGroups` → `groupBy` → `sortGroups(getEffectiveGroupOrder)`” is the body of `buildGroupTree`. Shipping T002 without that chain would reimplement grouping. Merge it into the module.
- **T004 and T005 are one loop edit.** Collapse keys, `skip while depth > collapsedDepth`, indent class, and “children ⇒ skip leaf table” all live in `TableRenderer.ts:82-155`. Splitting them invites a half-loop that collapses only the table (`:132` today) and leaves subgroup headers visible — the exact collapsed-parent bug research F8.11 called out.
- **T009 is mis-homed; T010 contradicts the spec.** Spec Q5 / synthesis Q5: ship the Sub-group control, defer a second toolbar picker. `ViewConfigPanelRenderer.renderBoardSettings` (`:1561-1587`) is reached only when `viewType === "board"` (`:313-317`). Table views never enter it (`:329`). Cloning the board dropdown there does not give tables a Sub-group UI. Table Group already lives in `ToolbarRenderer.populateGroupPopover` (`:1221-1266`), and the board Sub-group section is already in that popover (`renderBoardSubgroupSection` `:1423-1448`, gated at `:1264`). That is the call site to clone, not `renderBoardSettings`. Plan.md Phase 2 still lists both T009 and T010 as in-scope — cut T009-as-board-settings, implement one table-gated toolbar section, drop the second M.
- **Create-in-group will write the collapse key if you conflate key namespaces.** `renderRows` passes `groups: [{ field: groupField, key: groupKey }]` (`TableRenderer.ts:470`). `getCreateEntryDefaultsForRow` already merges `context.groups[]` (`DatabaseView.ts:4599-4606`). If `groupKey` is `path.join("::")` and `groupField` is always `fields[0]`, new rows get `Category = "Cat::Type"`. Collapse key, leaf value, and create defaults must be three different fields on the flat node (research F7.2 vs F7.7).
- **`patchGroupedRows` is a silent full-rerender, not a rewrite.** It requires each header’s next sibling to be `.db-table-wrap` (`TableRenderer.ts:209-250`). Parent nodes skip the table, so 2-field trees return `false` and `tryPatchExternalTableRows` (`DatabaseView.ts:2199-2272`) falls through to a full refresh. Do not expand the patch path this phase. Do prove 1-field still patches.
- **Sticky stacking is under-weighted.** Research F9.6 claims nested headers “follow automatically.” Every `.db-group-header` uses the same `position: sticky; top: calc(...); z-index: 26` (`styles.css:6171-6184`). Two depths will occupy one sticky slot and paint over each other. Consecutive-header margin (F9.2, beside `:6255-6257`) does not fix that.
- **CHK-011 vs computed drop.** Checklist wants a clean console; the module is specified to `console.warn` leftover computed/rollup fields (`GroupDisplay.ts:64-69`). That is a planned warning, not a failure.
- **CHK-033 cites the wrong deferred task** (`T010` vs nested-DnD `T011`).
- **Effort: plan ≈6h includes two M pickers.** After cutting the mis-homed ViewConfigPanel work, remaining work is still **M (~5h)**: the loop + create-path + persistence are the real hours, not a second settings surface.

## Optimizations

1. **One PR for data + persist.** Never land `groupByFields[]` on `ViewConfig` without `DataSource` parse `885` + serialize `1088` (`undefined` when empty; no `legacyViewKeys` strip). Same commit as the module.
2. **Merge T002+T006, T004+T005+T008.** Module owns the tree; renderer loop owns indent, collapse, drop-target gate, and full-path create defaults.
3. **Sub-group UI = toolbar clone, table-gated.** Copy `renderBoardSubgroupSection` (`ToolbarRenderer.ts:1423-1448`) behind `currentViewType === "table"`. Write `config.groupByFields = [primary, sub]` and keep `vs().groupByField = primary` (`setGroupByField` `:2417`) so the toolbar and `getActiveGroupField` (`:2890-2894`) stay consistent. On primary change, drop a subgroup that equals the new primary (board already does this at `:2428-2430`). **Do not** edit `renderBoardSettings`. Defer a ViewConfigPanel table section.
4. **Sticky: only depth 0.** Depth ≥ 1 headers are `position: relative` (or no sticky). Cheaper and safer than stacked `top` offsets. Indent 16px per depth via `padding-left` on `.db-group-header--depth-N` (header is `padding: 0` at `styles.css:6184`; do not fight the label’s `left: 0` sticky at `:6188-6198`).
5. **Do not rewrite `patchGroupedRows`.** Document: 2-field ⇒ patch returns false ⇒ full render; 1-field flatten (depth 0, plain keys, header then table) still patches.
6. **Computed filter in the picker, warn in the module.** Board candidates only exclude `file.name` + primary (`ToolbarRenderer.ts:1462`). Table Sub-group candidates must also drop `isComputedGroupField`. Module still drops leftovers.
7. **Keep `groupByFields[]` off the board.** Do not unify with `boardSubgroupEnabled` / `boardSubgroupField` (`types.ts:339-340`). Shared helper is enough overlap (synthesis Q1).

## Final build plan (ordered)

1. **Confirm call sites (S)** — `src/data/MultiFieldGrouping.ts` (new). Deps: none.
   - Read `EuroFormat.ts:1-42`, `getBoardSubgroups` `DatabaseView.ts:9669-9673`, dispatch `6332-6333`, loop `TableRenderer.ts:82-155`. Confirm there is no `src/views/table/TableRenderer.ts`.
   - **Check:** those lines still match; gallery/list (`9554-9578`) and timeline (`2890-2894`) stay on `vs().groupByField`.

2. **Module + type + persist, one commit (M)** — create `src/data/MultiFieldGrouping.ts`; edit `src/data/types.ts:362`; `src/data/DataSource.ts:885, 1088`. Deps: 1.
   - Exports: `effectiveGroupFields(config, state)`, `buildGroupTree(rows, fields, config, groupFn)`, `flattenGroupTree`, `dropComputedGroupFields`. Pure; no renderer imports.
   - `effectiveGroupFields` = `config.groupByFields?.length ? config.groupByFields : (state.groupByField || config.groupByField ? [that] : [])`. Empty array falls back. Compute unbounded; picker will cap at 2.
   - `groupFn` is exactly `getBoardSubgroups`: `withEmptyOptionGroups` → `queryEngine.groupBy` → `sortGroups(getEffectiveGroupOrder)` per parent. Recurse `buildLevel(group.rows, fields.slice(1))`.
   - Flatten preorder `{ key /* leaf value */, rows, count, depth, path /* leaf keys */, field, collapseKey, children }`. Depth 0: `collapseKey === key` (REQ-004). Nested: `collapseKey = path.join("::")`.
   - `groupByFields?: string[]` beside `groupByField` (`types.ts:362`). `collapsedGroups` (`:368`) unchanged.
   - Parse: `Array.isArray(v["groupByFields"]) ? filtered strings : undefined` at `DataSource.ts:885`. Serialize: `view.groupByFields?.length ? view.groupByFields : undefined` at `1088`. No `legacyViewKeys` entry (F3.3).
   - **Check:** 1-field `effectiveGroupFields` equals `[groupByField]`; 2-field tree has Type nodes inside each Category; leftover `formula.*` / computed / rollup dropped with one warning; YAML round-trip keeps `groupByFields: [Category, Type]` and omits the key when unset.

3. **Table dispatch only (S)** — `src/views/DatabaseView.ts:6332-6333, 9539-9545`. Deps: 2.
   - Dispatch: `effectiveGroupFields(config, this.vs()).length > 0` then `renderGroupedTable`. Do not change gallery/list/timeline.
   - `renderGroupedTable`: `fields = dropComputedGroupFields(effectiveGroupFields(...))`; `flattened = flattenGroupTree(buildGroupTree(this.rows, fields, config, groupFn))`; `tableRenderer.renderGroupedTable(..., flattened, fields[0])`.
   - Leave `tryPatchExternalTableRows` (`:2241-2263`) on `state.groupByField` + today’s flat groups. Nested flatten fails `patchGroupedRows` and full-rerenders — that is the safety valve.
   - **Check:** table with 2 fields nests; gallery/list with the same config still single-field; 1-field external patch still succeeds.

4. **Depth-aware loop + CSS (M)** — `src/views/TableRenderer.ts:17-21, 82-155, 148-151, 470`; `styles.css:6171-6185, 6255-6257`. Deps: 2–3.
   - Extend `TableGroup` additively: `depth?`, `path?`, `field?`, `collapseKey?`, `children?`.
   - Loop: always render header; class `db-group-header--depth-N`; collapse via `isGroupCollapsed(fields[0], collapseKey)` / `toggleGroupCollapsed` (`DatabaseView.ts:9845-9856` — keys stay opaque). If collapsed, skip while `depth > collapsedDepth`. If `children.length`, skip the leaf table. If leaf: today’s table + summaries + `getGroupVisibleCount(config, fields[0], collapseKey, ...)` + expand controls.
   - `setupGroupDropTarget` **only at depth 0**, using `fields[0]` and the plain leaf `key` (not `collapseKey`). Nested groups: no drop target.
   - Create: leaf `defaults` = merge `resolveGroupCreateDefaults` for every `(field, key)` in the path (`GroupDisplay` + `DatabaseView.ts:4599-4606`). `setupRow` `context.groups` = that same array (`TableRenderer.ts:470` today is one pair). Computed level ⇒ no create (`:149-150`).
   - CSS: `padding-left: calc(16px * N)` on `--depth-N`; `.db-group-header + .db-group-header { margin-top: 5px }` beside `:6255-6257`; depth ≥ 1 not sticky. Toggles stay 20×20 (`:6218-6219`). `tableMinWidth` per header (`:112`) unchanged.
   - **Check:** 2-field Category/Type, indented headers, collapse Category hides Type subtree; 1-field DOM/collapse keys match today; drop on a Type header does not write; new row in `Cat / Type` gets both properties; ≤360px no new media queries, overflow equal to today.

5. **Embedded sibling (S)** — `src/views/EmbeddedDatabaseRenderer.ts:1012-1016, 3353`. Deps: 2–4.
   - Table grouped branch (`:1012-1016`) uses the same `effectiveGroupFields` + tree + flatten as DatabaseView. Do not change gallery/list at `:973-986` or timeline `:1005-1007`.
   - Add `origView.groupByFields = this.config.groupByFields` beside `:3353`. `Object.assign` at `:3364-3365` already copies own keys; parse is still the load path (F3.5).
   - **Check:** embedded 2-field table matches top-level; an embed settings save does not strip `groupByFields`.

6. **Table Sub-group picker (S)** — `src/views/ToolbarRenderer.ts` (`populateGroupPopover` `:1221-1266`, clone `:1423-1448`); write path `src/views/DatabaseView.ts:2408-2426`. Deps: 2.
   - Table-only section, same candidate filter as board plus `!isComputedGroupField`. Cap at one subgroup (picker max 2; synthesis Q6).
   - Writer: `config.groupByFields = sub ? [primary, sub] : undefined`; keep `vs().groupByField = primary`; `viewStateStore.persist` already copies primary to `config.groupByField` (`ViewStateStore.ts:69-84`). Changing primary clears a colliding subgroup.
   - Undo label: reuse `undo.groupConfig` or add one i18n key — do not reuse `undo.boardSubgroupConfig` (`ViewConfigPanelRenderer.ts:1586`).
   - **Check:** Sub-group appears only on table views; board UI unchanged; gallery/list never see `groupByFields`; reload after picking two fields still nests.

7. **Verification (M)** — deps: 1–6.
   - Render matrix: 1 / 2 / 3-field (data layer only for 3), nulls → `t("common.uncategorized")` (`QueryEngine.ts:279`), empty groups (`GroupVisibility.ts:52-60`; multi-select default hidden `:20`), mixed types (`QueryEngine.ts:276-280`), checkbox/date at depth (`:261`, `dateGroupModes[field]`), multi-select fan-out (`:143-147`; counts non-exclusive), computed refusal, empty DB (`TableRenderer.ts:92-98`), collapsed parent, filter-before-group (`DatabaseView.ts:6313` then `:6332`).
   - Persistence reload; 1-field byte-identical + collapse keys unchanged; 1-field patch still works; 2-field patch falls back.
   - Mobile ≤360px; diff-shape: 1 new `src/data/` module + 3 logical sites (DatabaseView dispatch+render, TableRenderer loop, types+DataSource) with CSS + Embedded + toolbar as siblings; rebase dry-run; grep new module for vault writes / `fetch`.
   - **Check:** REQ-001–008 and SC-001–004 pass; T011 nested DnD stays `[B]`.

## Risks & open decisions

- **Persistence miss** — still the load-bearing bug. Default: parse + serialize in the same commit as the type (step 2). Verify reload before calling the renderer done.
- **Collapse key vs create value** — default: `collapseKey = path.join("::")` under `groupByFields[0]`; create/DnD use per-level `(field, leaf key)`. Do not copy the board’s field+key quirk (`BoardRenderer.ts:385-396`).
- **Sticky nested headers** — default: sticky only at depth 0. Do not stack `top` in this phase.
- **Sub-group UI host** — default: toolbar clone (step 6), not `renderBoardSettings`. Revisit a ViewConfigPanel table section only if operators want Group + Sub-group in the panel as well.
- **Unify with board subgroup?** — default: **no** (synthesis Q1). Shared `buildGroupTree` only.
- **ViewStateStore thread?** — default: **no** (F3.4). Dispatch reads `effectiveGroupFields(config, vs())`. Per-mode `groupByFields` would add `types.ts:167` + `create` / `toPersistedState` / `persist` and blow the EuroFormat budget.
- **Picker cap 2 vs compute N** — default: picker max 2; still unit-check a 3-field tree (REQ-002). Notion has no third level (research F6.1, F6.8).
- **Nested DnD** — default: **defer** (T011). Revisit when product wants multi-field `moveRowsToGroup`. Until then depth > 0 has no drop target.
- **`patchGroupedRows`** — default: do not extend. Revisit only if 2-field finance tables feel janky on single-cell edits (they full-rerender). 5k×2 is still O(N·D) Map passes with no memo (`QueryEngine.ts:140-148`; F10.1).
- **CHK-011 console.warn** — default: allow the computed-drop warning; fail only on thrown errors.
