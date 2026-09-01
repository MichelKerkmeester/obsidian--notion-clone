# Deep Research: Table Group-by 2+ Fields

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `lineages/deepseek-flash-max-r2`. Stop reason: max_iterations. Average newInfoRatio: 0.815.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 001 — KQ-1: Fork ground truth (R1 citation audit)

Status: complete · newInfoRatio: 1.0 · Focus: verify the R1 lineage's load-bearing citations against the live fork; correct stale lines; establish the R2 baseline.

## Findings

- **F1.1** Real grouped-table render entry: `DatabaseView.ts:6332-6333` dispatches `renderGroupedTable(config, this.vs().groupByField)` when set, else `renderTable`. `renderGroupedTable` (9539-9545) composes `withEmptyOptionGroups` → `getEffectiveGroupOrder` → `queryEngine.sortGroups` → `tableRenderer.renderGroupedTable`. [SOURCE: DatabaseView.ts:6332-6333, 9539-9545] R1's citation "DatabaseView.ts:9541-9548" is a near-miss (actual 9539-9545). The spec's file path `src/views/table/TableRenderer.ts` does NOT exist; the renderer is `src/views/TableRenderer.ts` (spec §3 needs path correction at build).
- **F1.2** `QueryEngine.groupBy(rows, field, order, column, config)` confirmed at QueryEngine.ts:132-152: Map-bucketed, per-row multi-key fan-out (143-147), result `{key, rows, count}[]`. `getGroupKeys` (250-281): checkbox → binary "true"/"false" (261), date/datetime → dateKey normalization (265-270), string keys trimmed + deduped (276-280), empty → localized `t("common.uncategorized")` (279).
- **F1.3** `sortGroups` (154-164): explicit order-map first, then count desc, then `localeCompare`. Per-field group order comes from `getEffectiveGroupOrder(config, field, keys)`.
- **F1.4** Per-field settings maps confirmed at types.ts:364-377: `groupOrders` (364), `showEmptyGroups` (366), `collapsedGroups` (368), `dateGroupModes` (372), `expandedGroupRows` (377, field → groupKey → count). `groupRowLimit` (374) is view-global, NOT per-field. `groupByField?: string` at types.ts:362 (ViewConfig) and types.ts:167 (ViewModeStateDef).
- **F1.5** `TableGroup` is FLAT today: `{key, rows, count}` (TableRenderer.ts:17-21). R1's "nesting composes recursively" claim requires extending this type (depth/path/children) or having the new module emit its own node type — the renderer loop (82-155) currently has zero depth awareness. This is the core renderer change surface.
- **F1.6** `ViewStateStore` owns per-view state: `DatabaseViewState.groupByField` (ViewStateStore.ts:19), created from `viewStates[mode] ?? viewConfig` (86-113), persisted via `persist()` to BOTH `viewConfig.viewStates[mode]` and top-level legacy fields (69-84), invalid-key cleanup at 52-54. `groupByFields[]` must thread through `create()` + `toPersistedState()` + cleanup to survive reloads and invalid schema.
- **F1.7** Gallery and list reuse the exact same single-field pipeline (DatabaseView.ts:9554-9578: `withEmptyOptionGroups` + `groupBy` + `sortGroups` + `renderGrouped`). Multi-field is table-scoped per spec, so the gate must be at render dispatch (6332-6336), not in shared settings.
- **F1.8** Embedded views re-implement the same dispatch: EmbeddedDatabaseRenderer.ts:739-741 (state.groupByField patch), 970-1013 (per-viewType group field resolution incl. timeline), 2017-2021 (group field key collection), 2632-2633, 2960-2968, 3285/3353 (view config copy). Spec §8 requires embedded tables to render identical nested headers — embedded dispatch must be updated alongside top-level (a shared helper keeps this to one logic site).
- **F1.9** GroupVisibility.ts: `withEmptyOptionGroups` (52-60) is per-field (status/select/multi-select only, option-order injection, multi-select defaults to hidden empties at 20); `getGroupVisibleCount(config, field, key, totalCount)` (69-76) is field+key scoped — nested depth needs path-scoped keys in `expandedGroupRows`; `getGroupRowLimit` (63-65) is view-global.
- **F1.10** EuroFormat pattern confirmed: EuroFormat.ts:1-42 — one self-contained pure-function module, header comment "Local fork override. Kept in one module so it stays a small, rebasable diff." The new grouping module should mirror this shape (pure functions, narrow types, no renderer imports).

## Ruled out / corrected from R1
- R1's "TableRenderer.ts:126-141" for collapse toggle is actually 113-127 (toggle button created at 117-127). Minor, but the new code must be written against the real lines.
- R1's suggestion that multi-field is a pure recursion over `renderGroupedTable` is correct in spirit; the flat `TableGroup[]` + per-group full-table loop means the practical design is recursion in the module + a flatten-with-depth list, or a depth-aware recursive render pass (I7 evaluates both).

## Next focus
KQ-2: board subgroup precedent end-to-end (config → UI → render → create-entry).

---

# Iteration 002 — KQ-2: In-fork board subgroup precedent (end-to-end)

Status: complete · newInfoRatio: 1.0 · Focus: the fork's own production 2-level grouping (board) — config shape, settings UI, render, collapse, create-entry, DnD, mobile. R1 only cited `boardSubgroupField` as a naming precedent without reading the implementation; this iteration mines it fully.

## Findings

- **F2.1** Nested group type precedent: `BoardGroup { key; rows; count; subgroups?: BoardSubgroup[] }` with `BoardSubgroup { key; rows; count }` [SOURCE: BoardRenderer.ts:37-48]. The table equivalent is `TableGroup` gaining `children?` or a parallel node type — same shape R1 proposed, now confirmed against the board's real type.
- **F2.2** Config shape precedent: separate `boardSubgroupEnabled: boolean` + `boardSubgroupField: string` (types.ts:339-340), both written together by the UI [SOURCE: ViewConfigPanelRenderer.ts:1584-1585]. A table `groupByFields[]` array is the array-form of exactly this pair; the board's enabled-flag pattern shows the fork's convention for "feature on but field unset".
- **F2.3** Settings UI precedent: a single dropdown ("noSubgroup" empty option) listing schema columns EXCLUDING the primary group field and `file.name`, plus a `__create_property__` flow with `applyReference`/`rollbackReference` transactional edits and an undo label [SOURCE: ViewConfigPanelRenderer.ts:1563-1588; undo.boardSubgroupConfig at 1586]. A table "Add sub-group" picker should reuse this exact pattern (including the exclude-primary-field filter and the createProperty two-phase commit).
- **F2.4** Subgroup render anatomy: `db-board-subgroups` wrapper (351) → per-subgroup `db-board-subgroup` section (383) → header (384) with collapse-toggle button + `db-collapse-triangle` (387-391), `renderGroupLabel(..., "db-board-subgroup-title")` (405), `db-board-subgroup-count` (406), optional summary rules (407-408). When subgrouping is active, column-level card drop is refused — drops must land on subgroup containers (261-262).
- **F2.5** Collapse keys are field+key, NOT path-qualified: `isGroupCollapsed?.(subgroupField, subgroup.key)` [SOURCE: BoardRenderer.ts:385], `toggleGroupCollapsed?.(subgroupField, subgroup.key)` (395). Consequence: two subgroups with the same key under different parents collapse/expand together — an existing quirk. Table multi-field should decide: path-qualified keys (e.g. `parentKey::key`) in the EXISTING `collapsedGroups: Record<field, string[]>` (types.ts:368) avoid the quirk with zero new settings shape; board parity would inherit the quirk. Spec is silent; recommend path keys (R1 agreed).
- **F2.6** Subgroup-aware create-entry defaults: `getCreateDefaults` merges per-field defaults for the primary field AND the subgroup field (DatabaseView.ts:4608-4620, `resolveRowGroupDefaults` at 4623-4628 reuses `queryEngine.groupBy([row], field, ...)`). This is the exact mechanism table multi-field create-entry needs at depth (defaults for every level of the path).
- **F2.7** DnD provenance precedent: `CARD_FROM_SUBGROUP_MIME` + `moveCardAndOrder(row, groupField, groupKey, fromGroup, ..., fromSubgroup, subgroupKey, ...)` (BoardRenderer.ts:34, 282-299). Table's existing `ROW_FROM_GROUP_MIME` + `moveRowsToGroup(field, fromKey, toKey)` (TableRenderer.ts:15, 37-38) has no depth concept; multi-field needs per-depth provenance or must disable intra-table moves between nested groups initially (display-only scope favors the latter).
- **F2.8** Per-group selection: subgroup checkbox with indeterminate state (BoardRenderer.ts:398-402) — `toggleRowsSelected(subgroup.rows, ...)`. Reusable for nested table groups' row-selection UI.
- **F2.9** Mobile in board: `isPhoneLayout()` guards column-resize handles (BoardRenderer.ts:344) — the fork already has a phone-layout branch; table nested headers must integrate with the same responsive model (details in KQ-9).

## Ruled out / notes
- Board subgrouping is exactly ONE extra level (no recursion); table spec wants N (verify 3-field). The board code is a 2-level special case; the table module generalizes it with recursion, but collapse/label/count/DnD semantics should stay board-consistent.
- `applyBoardSubgroups` (DatabaseView.ts:9630-9637) buckets each parent's rows independently (`getBoardSubgroups` 9669-9673) — i.e. per-parent re-grouping, which is precisely the recursion the table module needs (`buildLevel(rows, fields[1:])` per group).

## Next focus
KQ-3: settings persistence path — where ViewConfig.groupByField is parsed/saved/merged (DataSource), and what groupByFields[] needs for rebase-safe persistence + embedded-view config sync.

---

# Iteration 003 — KQ-3: Settings persistence path for groupByFields[]

Status: complete · newInfoRatio: 0.95 · Focus: DataSource parse/serialize/merge, ViewStateStore state bridge, embedded-view config copy-back, toolbar group picker — the exact thread groupByFields[] must follow to survive reloads and embedded edits. R1 named "DataSource ×2 parse lines" without reading them; this iteration pins every line.

## Findings

- **F3.1** Parse sites (exact): `DataSource.parseViewConfig` at DataSource.ts:885 (`groupByField: safeString(v["groupByField"]) || undefined`); legacy flat-format parse at 687 (same pattern). A `groupByFields` key needs one additive parse line each; only the new views-array format (885) is REQUIRED — legacy flat (687) can skip it because legacy flat is a migration-only format (see legacyViewKeys strip list). Old configs simply lack the key → `undefined` → REQ-004 single-field behavior free.
- **F3.2** Serialize site (exact): DataSource.ts:1088 `groupByField: view.groupByField || ""` inside the per-view serialization map (1082-1189). `groupByFields` line goes beside it; serialize as `view.groupByFields?.length ? view.groupByFields : undefined` to keep the file diff clean when unset.
- **F3.3** Migration strip list: `legacyViewKeys()` (1192-1302) — keys deleted when rewriting legacy flat frontmatter; `groupByField` at 1234, `viewStates` at 1300. Since groupByFields exists only in the new format, NO strip entry is needed (one less diff line).
- **F3.4** State bridge (ViewStateStore): `DatabaseViewState.groupByField` (19) is created from `viewStates[mode] ?? viewConfig` (86-113, line 105) and persisted back via `persist()` to BOTH `viewConfig.viewStates[mode]` and the top-level legacy field (69-84, line 78). Decision point: (a) config-only — render dispatch reads `config.groupByFields ?? (state.groupByField ? [state.groupByField] : [])`, zero ViewStateStore changes; or (b) per-mode state — add to `ViewModeStateDef` (types.ts:167 area) + `create()`/`toPersistedState()` (105/120) + `persist()` — 3 more edits, but per-viewType table/list/gallery divergence becomes possible. Recommend (a): spec is table-only and the render entry (DatabaseView.ts:6332) already has `config` in scope; smaller diff, fewer rebase seams.
- **F3.5** Embedded write-back (MANDATORY edit, missed by R1): EmbeddedDatabaseRenderer.ts:3353 `origView.groupByField = this.config.groupByField` sits in the full persisted-config copy-back loop (3344-3364) whose comment states it "整体覆盖所有持久化视图配置" (overwrites ALL persisted view config). If `groupByFields` is not added to this loop, any embedded-view edit silently ERASES the multi-field setting from the view definition. Additive one-liner, but load-bearing for REQ-007 (display-only, no data loss).
- **F3.6** Toolbar group picker (the user-facing group UI): `ToolbarRenderer.renderGroupSelect` (1135-1158) → `renderGroupPopover` (1170-1212); group value resolution `resolveGroupValue` (1160-1168): board → `config.boardGroupField`, else `state.groupByField`. Write path: DatabaseView.ts:2417 `this.vs().groupByField = value`; default init `groupByField: ""` at DatabaseView.ts:760. A table "sub-group" UI slots naturally as a second picker inside the existing popover (Notion parity: Group + Sub-group), writing `config.groupByFields[1]`.
- **F3.7** Default shape: `groupByFields` stays `undefined` by default — `effectiveGroupFields = groupByFields ?? (groupByField ? [groupByField] : [])` gives REQ-004 byte-identical single-field behavior with no migration.
- **F3.8** REQ-005 reconciliation for the CURRENT fork: settings surface = types.ts (1 line) + DataSource.ts (parse 885 + serialize 1088 = 2 lines, 1 file) + EmbeddedDatabaseRenderer copy-back (3353, 1 line) = 3 files/4 lines; renderer = DatabaseView.ts dispatch (6332-6333 + 9539-9545 composition, 1 file) + TableRenderer.ts depth loop (1 file, spec's own modify row); new module = 1 file. Total 6 files, all additive except the TableRenderer loop and DatabaseView composition — rebase-safe by construction (no deletions, no renames).

## Ruled out / notes
- Skipping DataSource serialize for groupByFields is NOT an option: `parseViewConfig` round-trips every field; an unserialized field is lost on the next config write.
- Not adding groupByFields to the toolbar popover keeps the feature config-file-editable only (REQ-001 says "accepted by table view settings" — parse acceptance satisfies it; UI is enhancement, see I6).

## Next focus
KQ-4: AppFlowy Rust grid model — verify R1's single-field claims and hunt for any multi-level/group-by-group machinery.

---

# Iteration 004 — KQ-4: AppFlowy Rust grid model + Flutter UI verification

Status: complete · newInfoRatio: 0.6 · Focus: verify R1's AppFlowy citations against the cloned repo; determine whether any multi-level grouping exists in flowy-database2 or the Flutter board UI.

## Findings

- **F4.1** AppFlowy grouping is STRICTLY single-field: `BaseGroupController.grouping_field_id: String` (controller.rs:41-44, 60), `GroupControllerContext.field_id` (configuration.rs:44-52), persisted per-view `GroupSetting { id, field_id, field_type, groups, content }` (entities.rs:11-17), and the `SetGroupByField` event doc "create a NEW grouping in a database view based on the field_id" (event_map.rs:284-287) — one grouping per view, replaced wholesale. R1's single-field claim CONFIRMED.
- **F4.2** Multi-value fan-out + no-status bucket confirmed at controller.rs:208-232 (`fill_groups`): a row's cell is tested against every group (`can_group`), added to ALL matching groups; if none match, it lands in `no_status_group`. Same semantics as the fork's `getGroupKeys` fan-out (QueryEngine.ts:143-147, 279) — three independent implementations (fork, AppFlowy, Anytype) agree.
- **F4.3** AppFlowy grid has NO grouping UI: `grid/presentation/widgets` contains no group renderer; grid rows carry an optional `groupId` only for row-context actions (grid/presentation/widgets/row/action.dart:20-33). Grouping renders exclusively in the board view. Consequence for the fork: "grid apps don't group" is the industry norm — the fork's table grouping is already ahead of AppFlowy; Notion is the only real multi-level precedent.
- **F4.4** AppFlowy's per-view `GroupSetting` (restored from disk via `GroupSettingMap`/`GroupSettingBuilder`, entities.rs:1-17) is the structural analog of the fork's per-field maps (`groupOrders`/`showEmptyGroups`/`collapsedGroups` keyed by field, types.ts:364-368). The model has no notion of nesting; subgroups do not exist anywhere in flowy-database2.
- **F4.5** Flutter board group header anatomy verified: `_DefaultColumnHeaderContent` (board_column_header.dart:199-229) — ellipsized group name + tooltip, `GroupOptionsButton`, `CreateCardFromTopButton`; hidden-groups rail with `layoutSettings.collapseHiddenGroups` (board_hidden_groups.dart:40-70). R1's anatomy claim stands (R1 cited 194-232; actual class body 199-229).
- **F4.6** Transferable to the fork: (a) per-view grouping settings persistence (already matched by fork's per-field maps — no action); (b) hide-empty-groups collapse rail (fork already has `showEmptyGroups` per field + board hidden-groups equivalent); (c) nothing multi-level. AppFlowy contributes zero multi-level precedent — it is a negative result for "industry does this differently", strengthening Notion-parity as the design anchor.

## Ruled out / notes
- No AppFlowy design element justifies deviating from the fork's recursion design. R1's verdict ("do NOT adopt Anytype's query-as-group; AppFlowy adds nothing multi-level") is confirmed.
- AppFlowy's per-group `CreateCardFromTopButton` is a per-group create affordance the fork already has per group table (`renderNewRow` + `createEntry(defaults)` in TableRenderer.ts:148-152) — nested tables inherit it per leaf; no new UI needed there.

## Next focus
KQ-5: Anytype — verify R1 (groupRelationKey, group.tsx query-as-group, column.tsx) and hunt multi-level capability.

---

# Iteration 005 — KQ-5: Anytype verification (view model, group query, column UI)

Status: complete · newInfoRatio: 0.55 · Focus: verify R1's Anytype citations; hunt multi-level capability; extract transferable per-group mechanics.

## Findings

- **F5.1** Anytype is single-field: `View.groupRelationKey` is ONE string per view (model/view.ts:38, 57; interface/block/dataview.ts:242). Grep across anytype-ts shows the key reused by board AND calendar (calendar/index.tsx:17, 83, 121) — but never more than one grouping relation per view. NO multi-level grouping exists in anytype-ts. R1's claim CONFIRMED.
- **F5.2** Query-as-group confirmed: board/group.tsx:35-66 builds `filters = [Dataview.getGroupFilter(relation, value), ...view.filters]` and subscribes per group; board/column.tsx:63-70 repeats it for column loading. `getGroupFilter` (lib/dataview.ts:521-538): Equal / ExactIn for select+multi-select, Empty when no value. R1's verdict stands: per-group filtered subscriptions are functionally equal to the fork's bucketing but strictly more expensive for a display-only recompute-per-render model — DO NOT adopt; record as ruled out.
- **F5.3** Per-view group order persistence: `block.content.groupOrder.find(it => it.viewId == view.id)` → `order.groups[groupId]` incl. `bgColor` (column.tsx:36-38). Structural analog of fork's `groupOrders: Record<field, string[]>` (types.ts:364). Confirms the fork's per-field map is the right home for per-level orders.
- **F5.4** Optional group background colors: `view.groupBackgroundColors` → `withColor` + `bgColor-bgColor-*` classes (column.tsx:43-45). Optional polish only; spec doesn't ask; R1 rated it optional — agree.
- **F5.5** Create-in-group sets the group field: `head[view.groupRelationKey] = value` (column.tsx:49). Fork equivalent: `resolveGroupCreateDefaults(config, field, groupKey)` (DatabaseView.ts:4623-4628, TableRenderer.ts:148-152) — nested tables inherit per-leaf create defaults; for multi-field the module must merge defaults per depth path (F2.6 mechanism).
- **F5.6** Calendar reuses groupRelationKey as the date field (calendar/index.tsx:17, 83, 93: `onCreate` writes the date field). Fork parallel: timeline grouping follows `state.groupByField` (DatabaseView.ts:6481-6486). Cross-view group-field reuse is already the fork's pattern — `groupByFields[]` should be table-scoped (spec) and NOT leak into timeline/calendar dispatch.

## Ruled out / notes
- Anytype contributes zero multi-level precedent (negative result, same as AppFlowy). Notion remains the only primary multi-level source.
- Anytype's per-group bg color and per-group create-head are the only novel mechanics; both already have fork equivalents or are optional polish.

## Next focus
KQ-6: Notion primary behavior via WebFetch — Group + Sub-group semantics, limits, empty groups, uncategorized, collapse, sort, mobile, settings UI.

---

# Iteration 006 — KQ-6: Notion primary behavior via WebFetch

Status: complete · newInfoRatio: 0.8 · Focus: primary-source Notion evidence for Group + Sub-group — semantics, controls, limits, property support, uncategorized, toggle behavior. R1 relied on the same URLs; this iteration re-fetches and adds specifics R1 did not extract.

## Findings

- **F6.1** Notion's CURRENT help center lists under every view's `View settings`: "**Group:** Group your data by the values in a property" and "**Sub-group:** Create a second layer of grouping within your existing groups. For example, groups by status can also be sub-grouped into priority." — the primary-source confirmation that Notion's model is exactly TWO levels (Group → Sub-group), configured in view settings, one sub-group per view. [SOURCE: https://www.notion.com/help/views-filters-and-sorts (View settings + Groups sections)]
- **F6.2** Notion group controls (primary): per-group show/hide via `👁️`, manual or automatic sorts (alphabetical, ascending, more), `Hide empty groups`, and `Remove grouping`. [SOURCE: same help page, Groups section]
- **F6.3** Groups are TOGGLES: "Each group is tucked into a toggle and filtered for the value it represents" — Notion's group header is a collapse toggle, matching the fork's existing `db-group-collapse-toggle` + `is-collapsed` (TableRenderer.ts:113-127) and the board subgroup toggle (BoardRenderer.ts:385-396). [SOURCE: https://www.notion.vip/insights/the-grouping-guide]
- **F6.4** Grouping property constraints (verified): grouping works in every view format EXCEPT Calendar; the group property cannot be a `Rollup`; formula grouping only by exact-match or first letter (alphabetical) and **dragging rows between formula groups doesn't work**. Fork mapping: `isComputedGroupField` (GroupDisplay.ts:64-69 per R1; recompute at TableRenderer.ts:149-150 computedGroup gate) already refuses drag/create for computed groups — Notion parity confirmed. [SOURCE: notion.vip guide + thomasjfrank.com article]
- **F6.5** Supported group-by property types (Notion): text (exact or first-letter), number (custom ranges + increments), select, multi-select (fan-out), status, person (fan-out), date (relative / day / week / month / year), checkbox, URL/email/phone (as text), formula (no drag), relation, created/edited time. The fork's `getGroupKeys` covers text/select/multi/checkbox/date natively (QueryEngine.ts:250-281); number ranges and first-letter modes are Notion extras NOT in scope (spec's field types are the fork's existing ones).
- **F6.6** "Hide the default group for unpopulated items" — Notion lets you hide the unpopulated bucket (e.g. "No Status"); maps to fork's `showEmptyGroups[field]` + localized `t("common.uncategorized")` (GroupVisibility.ts:24-30; QueryEngine.ts:279). Per-level reuse is free.
- **F6.7** Group summarization: Notion's group header shows a count by default; clicking swaps the calc (count/min/max/avg…) over a chosen property. Fork equivalent exists: `renderGroupSummaries` (TableRenderer.ts:130; TableRendererActions:33) — nested headers inherit it per level without new machinery.
- **F6.8** Sub-group scope reconciliation: notion.vip (older) says sub-groups are Board-only ("Because the Board format intrinsically groups items into columns, the optional toggle groups are 'sub-groups'... two levels"); current Notion help lists Sub-group under generic view settings. Net: Notion exposes exactly 2 levels; the fork's spec asks for N-level compute with UX cap at 2 — fully consistent with Notion.

## Ruled out / notes
- Notion does NOT support a third level ("sub-sub-group") — R1's "cap at 2 for UX surface, unlimited in data layer" is now backed by two independent primary/secondary sources.
- Notion's number-range and first-letter grouping modes are out of scope (fork's field types + getGroupKeys unchanged).
- Notion's formula-group no-drag rule confirms the fork's computedGroup refusal — no new logic needed.

## Next focus
KQ-7: renderer integration contract — recursion vs flatten for TableRenderer.renderGroupedTable; TableGroup extension; collapse keys; drop targets; create-entry defaults; expand controls.

---

# Iteration 007 — KQ-7: Renderer integration contract (recursion vs flatten, collapse keys, drop targets, create defaults)

Status: complete · newInfoRatio: 0.9 · Focus: the exact integration contract for TableRenderer.renderGroupedTable + DatabaseView composition + actions wiring. R1 recommended "flatten with depth" at a high level; this iteration pins the mechanism against the real collapse/expand/order/limit implementations.

## Findings

- **F7.1** Collapse/expand actions are ALREADY depth-agnostic: `isGroupCollapsed(config, field, key)` = `(config.collapsedGroups?.[field] || []).includes(key)` (DatabaseView.ts:9845-9848); `toggleGroupCollapsed` (9850-9860) and `expandGroup` → `setGroupExpandedCount` (9862-9868; GroupVisibility.ts:79-87) treat `key` as an opaque string. NO TableRendererActions interface change is needed for collapse/expand — a nested header just passes its path-joined key. REQ-004 byte-compat: at depth 0, path = [key], so the key string is unchanged.
- **F7.2** Collapse-key namespace decision: `collapsedGroups` is `Record<field, string[]>` (types.ts:368). Board precedent keys subgroups under the SUBGROUP's field (BoardRenderer.ts:385) — causing the same-key-under-two-parents quirk (F2.5). Recommendation for table: store ALL nested path keys under `groupByFields[0]` with `path.join("::")` (e.g. `"Category::Type::key"`), avoiding the quirk with zero new settings shape; single-field configs keep plain keys. Same treatment for `expandedGroupRows` (field → groupKey → count).
- **F7.3** Per-level ordering is free: `getEffectiveGroupOrder(config, field, actualKeys)` (GroupOrder.ts:19-32) merges `groupOrders[field]` + default option order + actual keys per level; checkbox keys filtered to true/false. Each depth level calls it with its own field — no new logic.
- **F7.4** Row-limit + expand controls are per (field, key): `renderGroupExpandControls(parent, config, field, key, totalCount, actions)` (GroupExpandControls.ts:12-48) renders "+N / expand all / collapse to limit" only when `groupRowLimit` applies; nested leaf groups call it with their own field+path-key. `getGroupVisibleCount(config, field, key, totalCount)` (GroupVisibility.ts:69-76) bounds each leaf's rows.
- **F7.5** Actions wiring confirmed for all renderers (DatabaseView.ts:596-598, 619-621, 647-649, 674-676): every renderer receives the same `(field, key)` closures — the grouped-table actions object needs zero edits for depth support.
- **F7.6** Drop targets are the ONE mutation surface that breaks at depth: `setupGroupDropTarget(header/tableWrap/tbody, groupField, group.key)` (TableRenderer.ts:111, 136, 145) + `moveRowsToGroup(row, field, fromKey, toKey)` (37-38, 592) writes the field value (updateBoardGroup). Moving between nested groups (path A::x → B::y) must write BOTH fields — new semantics. Display-only scope recommendation: keep depth-0 drop targets exactly as today; nested groups render WITHOUT drop targets initially (skip `setupGroupDropTarget` when depth > 0), documented as an enhancement. This keeps the diff small and avoids silent multi-field writes. (Notion supports drag-between-groups only for non-computed fields [F6.4]; the fork can add it later.)
- **F7.7** Create-entry defaults per leaf: existing `getGroupDefaults(config, field, group.key)` → `resolveGroupCreateDefaults` (TableRenderer.ts:150-151; DatabaseView.ts:4623-4628). For multi-field leaves, merge per-level defaults in path order (board subgroup precedent at DatabaseView.ts:4613-4620 — exactly the same merge pattern). Computed-group refusal per level: `isComputedGroupField(config, field)` gate already exists (TableRenderer.ts:149).
- **F7.8** Summaries per level: `renderGroupSummaries?.(groupHeader, group.rows, config)` (TableRenderer.ts:130) takes the node's rows (path-prefix rows) — recursive nodes get correct per-level aggregates for free; Notion parity (F6.7).
- **F7.9** Final design (recommended, rebase-safe): NEW module `src/data/MultiFieldGrouping.ts` exporting (a) `effectiveGroupFields(config): string[]` — `config.groupByFields ?? (config.groupByField ? [config.groupByField] : [])`; (b) `buildGroupTree(rows, fields, config, groupFn): GroupNode[]` — recursion where `groupFn(rows, field)` = the EXISTING chain `withEmptyOptionGroups(config, field, queryEngine.groupBy(rows, field, [], col, config))` + `sortGroups(getEffectiveGroupOrder(...))` scoped to parent rows (exactly `getBoardSubgroups` DatabaseView.ts:9669-9673 generalized); (c) `flattenGroupTree(nodes): FlatGroup[]` emitting `{key, rows, count, depth, path, children}`. TableRenderer loop (82-155) gains a depth check: node with children → header (indent class) + recurse; leaf → today's header + full table. `TableGroup` extended additively with optional `depth?: number; path?: string[]; children?: ...`. DatabaseView.renderGroupedTable (9539-9545) becomes: fields = effectiveGroupFields(config); tree = buildGroupTree(this.rows, fields, config, per-level chain); render flattened. Dispatch at 6332-6333: `if (effectiveGroupFields(config).length > 0) renderGroupedTable(config, fields)`. Embedded views: same dispatch via the helper (F1.8) — table-only gating inside `effectiveGroupFields` call site.

## Ruled out / notes
- Recursive DOM rendering (renderer recursing into container children) vs flatten: flatten wins — the existing loop renders one header + one table per flat entry; recursion-in-renderer would duplicate the per-group table block. Flatten keeps the DOM structure and CSS classes identical; only the indent class and "children → skip table" branch are new.
- Moving rows between nested groups is deferred (display-only phase) — no new mutation path in this feature.

## Next focus
KQ-8: edge cases — nulls, mixed types, dates at depth, checkbox, multi-select fan-out, empty groups per level, rollup/computed rejection, 3+ fields, filter-before-group ordering.

---

# Iteration 008 — KQ-8: Edge cases (all levels evidence-pinned)

Status: complete · newInfoRatio: 0.6 · Focus: edge-case semantics at depth — nulls, mixed types, dates, checkbox, multi-select fan-out, empty groups, computed refusal, 3+ fields, filter ordering, empty DB, collapse-subtree.

## Findings

- **F8.1** Date modes are per-field and therefore per-level: `getDateGroupMode(config, field)` (GroupDisplay.ts:15-17) reads `dateGroupModes[field]` (types.ts:372); `datetime` in "date" mode normalizes to dateKey (QueryEngine.ts:265-270). A date column used at depth 1 keeps its own mode independent of depth 0. Display: `formatGroupKeyDisplay` date/datetime branches (GroupDisplay.ts:40-45).
- **F8.2** Checkbox at depth: binary keys "true"/"false" (QueryEngine.ts:261), default order `["true","false"]` (GroupOrder.ts:15), localized display (GroupDisplay.ts:46) — depth-N checkbox subgroups just work.
- **F8.3** Multi-select fan-out applies at EVERY level: a row with multiple values appears in each matching sibling group at each depth (QueryEngine.ts:143-147); counts are non-exclusive; `rowByPath` Map (TableRenderer.ts:90) is render-only so duplicates are harmless. Notion/AppFlowy/Anytype parity (F4.2, F5.2, F6.5).
- **F8.4** Null/missing values per level: localized `t("common.uncategorized")` bucket (QueryEngine.ts:279); `isUncategorizedGroupKey` + display mapping (GroupDisplay.ts:23-26, 35-36); hideable via `showEmptyGroups[field]` (GroupVisibility.ts:24-30) — Notion's "hide the default group for unpopulated items" (F6.6). At depth, each level's uncategorized bucket is a distinct node.
- **F8.5** Mixed-type values in one field: `getGroupKeys` stringifies + trims + dedupes (QueryEngine.ts:276-280) → separate string-key groups, no error; tie-order `localeCompare` (154-164). Spec §8 requirement satisfied by existing code.
- **F8.6** Empty groups at depth: `withEmptyOptionGroups` injects option-order groups per level when `shouldShowEmptyGroups` (GroupVisibility.ts:52-60; multi-select defaults to hidden, line 20). Empty subgroups render empty leaf tables — "Empty groups render per existing groupBy behavior" (spec §8) holds per level. Notion "Hide empty groups" (F6.2) maps 1:1.
- **F8.7** 3+ fields: `buildGroupTree` recursion is unbounded in depth (I7); DOM cost bounded by leaf tables + `groupRowLimit` (GroupVisibility.ts:63-65); UX surface capped at 2 per Notion parity (F6.1, F6.8).
- **F8.8** Computed/rollup refusal, exact lines: `isComputedGroupField` = `formula.*` prefix OR column type computed/rollup (GroupDisplay.ts:64-69); renderer create-entry gate (TableRenderer.ts:149-150); Notion forbids rollup grouping and drag on formula groups (F6.4). Module contract: the group PICKER filters computed fields out; if `groupByFields` config still contains one, the module drops it (console.warn, render remaining fields) — never crash, never write.
- **F8.9** Filter-before-group ordering: `this.rows = buildRowsWithRelations(...)` (DatabaseView.ts:6313) runs the full row pipeline (filters/sorts) BEFORE render dispatch (6332); grouping scopes to already-filtered rows. Nested grouping inherits this automatically — no ordering work needed.
- **F8.10** Empty database: `rows.length === 0` → `db-empty` state (TableRenderer.ts:92-98); `buildGroupTree` over zero rows yields zero groups → same empty state at any depth.
- **F8.11** Collapsed parent must hide the whole subtree: current loop `if (collapsed) continue;` (TableRenderer.ts:132) skips only the table. With the flattened list, either the flatten emits children after parents (guaranteed) and the loop skips entries while `depth > collapsedDepth`, or the renderer checks `node.depth`/parent-collapse state. Flatten ordering makes this a one-line guard.
- **F8.12** Group identity normalization: keys are trimmed + deduped at bucketing (QueryEngine.ts:276-280) so externally authored `"  A"` merges with `"A"` — same normalization at every depth (comment at 271-275 documents the why).

## Ruled out / notes
- No edge case requires new machinery: every per-level semantic reuses an existing per-field mechanism (getGroupKeys, withEmptyOptionGroups, getEffectiveGroupOrder, getGroupVisibleCount, formatGroupKeyDisplay, resolveGroupCreateDefaults). The module is composition, not reimplementation.
- Number-range and first-letter grouping (Notion extras, F6.5) remain out of scope.

## Next focus
KQ-9: mobile + iCloud + a11y — styles.css group-header CSS, breakpoints, min-width, touch targets, ARIA/keyboard, display-only audit, embedded views.

---

# Iteration 009 — KQ-9: Mobile + iCloud + a11y (CSS evidence)

Status: complete · newInfoRatio: 0.85 · Focus: styles.css group-header anatomy, viewport/mobile behavior, sticky offsets, touch targets, a11y, display-only write audit, embedded views. R1 cited styles.css lines (66-68, 6160-6182, 11741, 12379-12484) without reading them; this iteration pins the real CSS.

## Findings

- **F9.1** Group header anatomy (styles.css): `--db-group-header-height: 32px` (66); `.db-grouped-table` = flex column (6153-6156); `.db-group-header` = flex, `min-height: 32px`, `position: sticky; top: calc(var(--db-group-header-top) + 8px + var(--db-selection-status-offset)); z-index: 26`, 13px/600 (6160-6174); label sticky-left z-27, `max-width: min(480px, calc(100vw - 48px))` — viewport-adaptive ellipsis (6176-6184); collapse toggle 20×20px (6199-6219); triangle rotation (6229-6241); inter-group spacing rule `.db-grouped-table > .db-table-wrap + .db-group-header { margin-top: 5px }` (6244-6246).
- **F9.2** The depth-indent CSS must be ADDITIVE: header currently `padding: 0` (6173); depth indent = `padding-left: calc(var(--db-group-indent-unit) * N)` via a `db-group-header--depth-N` class, plus a nested-headers spacing variant (the 6244 selector assumes header-after-table alternation; consecutive nested headers need `+ .db-group-header` margin). `tableMinWidth` per header (TableRenderer.ts:112) keeps nested headers scrolling with the table — SC-004 "no horizontal overflow beyond existing table behavior" holds by construction.
- **F9.3** Mobile evidence: no table-specific narrow breakpoint exists (the 620px query at 11741 is formula-modal-only; 720px at 9046 is a modal); the fork's mobile model is `body.is-phone` (15304-15356: toolbar collapse, width-toggle, search control) + `min(480px, calc(100vw - 48px))` label cap. Nested headers inherit all of this with zero new media queries; REQ-006/NFR-M01 passes by construction (no desktop-only APIs used anywhere in the render path).
- **F9.4** Touch targets: 20×20px collapse toggle (6207-6208) is below the 44px guidance but matches every existing fork toggle (gallery/list/board/subgroup share the same rule at 6199-6203). Consistency over new sizes; the 32px header + label padding keeps it tappable. If the build wants larger targets, ONE rule change covers all toggles — do not special-case depth headers.
- **F9.5** a11y baseline: collapse toggle is a real `<button type="button">` with `aria-label` expand/collapse (TableRenderer.ts:117-120; board subgroup 387-391) — keyboard-focusable + Enter/Space by default; `prefers-reduced-motion: reduce` handled (styles.css:208). Nested headers reuse the same element types → a11y inherits. No new ARIA needed beyond `aria-expanded` (optional polish: toggle already signals state via `is-collapsed` class + aria-label swap).
- **F9.6** Sticky-header stacking at depth: group header z-index 26 > thead 25 (6158-6167) — nested headers at z-index 26 keep the same rule; thead top offsets use `--db-group-table-head-top` var (68, 6250). Depth headers do not change stacking, only vertical position — sticky behavior at depth follows automatically.
- **F9.7** Embedded views already have dedicated group CSS: zero margins + top offsets (12377-12385), embed-headerless thead top 0 (12479-12481), embed group-header top (12484-12486), embed grouped-thead top (12499-12501) — nested headers inside embeds inherit all embed overrides untouched. Spec §8 "Embedded table views render the same nested headers" requires only the JS dispatch change (F1.8) + these CSS rules staying generic (no depth-0-only selectors).
- **F9.8** Display-only / iCloud audit: the grouping COMPUTE path writes nothing — `renderGroupedTable` (DatabaseView.ts:9539-9545) → `groupBy` (QueryEngine.ts:132-152) is pure. The only writes in the grouped-table lifecycle are view-definition writes: `toggleGroupCollapsed`/`expandGroup` → `scheduleConfigSave` (DatabaseView.ts:9850-9868) and settings edits — serialized per-file (DataSource.ts:989-990 comment: "Serialized per-file to prevent conflicts with concurrent frontmatter writes"), same as today's single-field grouping. No note/frontmatter writes from grouping; no network; new module is pure functions → REQ-007/008/NFR-S01 satisfied. The one mutation that DOES write frontmatter is move-between-groups (`updateBoardGroup` via moveRowsToGroup, DatabaseView.ts:592) — existing behavior, unchanged; nested drop targets deferred (F7.6) so multi-field adds no new write paths.

## Ruled out / notes
- No new media queries needed for nested headers; the fork's is-phone + viewport-adaptive label cap covers ≤360px.
- Indent unit: 16px (one per depth) matches the fork's spacing grain (e.g. 5px/8px margins); R1 suggested 16px — confirmed reasonable against the 13px header font.

## Next focus
KQ-10: performance budget + ranked enrichment consolidation — O(rows×depth), DOM bounds, 5k-row interactivity, final ranked evidence-cited enrichment.

---

# Iteration 010 — KQ-10: Performance budget + ranked enrichment consolidation

Status: complete · newInfoRatio: 0.9 · Focus: complexity proof for NFR-P01, DOM bounds, recompute model, worst-case guards; consolidate the ranked enrichment for synthesis. All evidence re-checked against files read in I1-I9.

## Findings

- **F10.1** Compute complexity: `groupBy` is one Map pass per level per parent group (QueryEngine.ts:140-148); depth D over N rows = O(N × D × fanOut) key lookups + O(groups × log groups) sorts (154-164). At the spec's 5k-row finance bound, 2 levels ≈ 10-20k Map ops — sub-millisecond; 3 levels still trivial. NFR-P01 compute side: PASS by construction, no memoization needed (recompute-per-render is today's model; optional future cache keyed on rowsVersion+fields is documented, not required).
- **F10.2** DOM bound: leaf tables PARTITION rows (each row lands in exactly one leaf per fan-out path); total rendered rows ≤ rows × fanOut^depth — the identical model to today's single-field grouped table (TableRenderer.ts:134-153). `groupRowLimit` + `expandedGroupRows` clamp every leaf independently (GroupVisibility.ts:63-76) — a 5k-row finance table at 2 levels renders no more DOM than its single-field equivalent except for subgroup headers themselves. NFR-P01 DOM side: PASS; no virtualization.
- **F10.3** Worst-case guard: leaf-table count ≤ Π(options per level); with multi-select the fan-out can explode. Guards: (a) UX cap at 2 levels (Notion parity, F6.1); (b) `showEmptyGroups` defaults FALSE for multi-select (GroupVisibility.ts:20) — empty multi-select subgroups don't render; (c) module API documents the bound and recommends `groupRowLimit` for pathological option counts. Spec REQ-002's 3-field verification stays in the DATA layer (compute) while the UI surface caps at 2 — consistent with R1 and Notion.
- **F10.4** Recompute trigger surface: refresh re-runs `renderGroupedTable` (DatabaseView.ts:6332-6345) after pipeline rebuild (6313) — multi-field adds one tree-build call in the same path; no new refresh triggers, no churn.
- **F10.5** Enrichment consolidation (full ranked list in research.md §2; anchors): 1) `groupByFields[]` + N-level tree module (REQ-001/002); 2) flatten-with-depth render (REQ-003/004) [F7.9]; 3) path-qualified collapse keys under field[0] (F7.2); 4) per-level reuse of empty/order/limit machinery (F7.3-4, F8.6); 5) uncategorized per level (F8.4); 6) multi-select fan-out documented per level (F8.3); 7) computed/rollup refusal (F8.8); 8) header anatomy + depth indent + additive CSS (F9.1-2); 9) create-defaults merge per path + deferred nested DnD (F7.6-7); 10) persistence thread incl. embedded copy-back (F3.1-5).

## Answer completeness check (KQ-1..10)
All 10 key questions answered with direct file:line evidence. Remaining unknowns are build-time decisions (module filename, exact indent unit, UI picker placement) — all with recommendations and evidence in this lineage.

## Ruled out / notes
- Memoization, virtualization, and incremental regrouping: NOT required at spec scale; noted as future work.
- No new media queries, no new settings shapes, no new persistence formats: the entire feature is one new module + additive edits (I3, I7, I9).

## Next focus
phase_synthesis: research.md + findings-registry + dashboard + resource-map + convergence report.

---
