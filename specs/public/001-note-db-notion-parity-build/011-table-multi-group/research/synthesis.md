# Synthesis: Table Group-by 2+ Fields
> One-line: ranked Notion-parity enrichment for this feature, synthesized by Grok 4.6 (xhigh-fast) from the phase's 10 research iterations. Evidence trail: research.md.

## Verdict
Build it. Table grouping is still a single string (`groupByField`) while Notion’s current View settings expose **Group + Sub-group** (exactly two levels), and the fork already ships the 2-level algorithm on the board (`applyBoardSubgroups` / `getBoardSubgroups`). The locked shape is composition, not a rewrite: one EuroFormat-style module that recursively reuses `QueryEngine.groupBy` + the existing per-field maps, then a flatten-with-depth pass in `TableRenderer`. Effort stays **M**. The single biggest risk is a persistence miss — `DataSource` parse/serialize is a whitelist, so `groupByFields[]` that is never serialized is deleted on the next config save — plus any nested `setupGroupDropTarget` that would write two frontmatter fields and break the display-only / iCloud contract.

## Ranked backlog
1. **`groupByFields[]` + `MultiFieldGrouping` tree at table dispatch** — Gap vs Notion: tables can Group, not Sub-group; fork tables dispatch on one field (`src/views/DatabaseView.ts:6332-6333`). Feasibility: **clear**. Files: new `src/data/MultiFieldGrouping.ts`; `src/data/types.ts` (`groupByFields?: string[]` beside `groupByField` at 362); `src/views/DatabaseView.ts` (6332-6333 and `renderGroupedTable` 9539-9545). Effort: **M**. Depends on: nothing. Citation: `src/views/DatabaseView.ts:6332-6333, 9539-9545`.

2. **Persistence round-trip (parse + serialize)** — Gap vs Notion: view settings survive reload; fork `parseViewConfig` / serialize only know `groupByField`. Feasibility: **clear**. Files: `src/data/DataSource.ts` (parse `885`; serialize `1088`; skip `legacyViewKeys` strip — new-format only). Effort: **S**. Depends on: #1 (same PR). Citation: `src/data/DataSource.ts:885, 1088`.

3. **Flatten-with-depth grouped table + indented headers** — Gap vs Notion: nested toggle headers inside groups. Feasibility: **clear**. Files: `src/views/TableRenderer.ts` (`TableGroup` 17-21 is flat; loop 82-155 has zero depth); additive CSS on `.db-group-header` (`styles.css:6171-6185`, `padding: 0` at 6184) plus consecutive-header spacing beside `styles.css:6255-6257`. Effort: **S**. Depends on: #1. Citation: `src/views/TableRenderer.ts:17-21, 82-155`.

4. **Path-qualified collapse keys + collapsed parent hides subtree** — Gap vs Notion: each nested toggle is independent; fork board keys subgroups as `(subgroupField, key)` so same key under two parents collapses together (`src/views/BoardRenderer.ts:385-396`). Feasibility: **clear**. Files: `src/views/TableRenderer.ts` (pass `path.join("::")` into existing `isGroupCollapsed` / `toggleGroupCollapsed`); `src/data/types.ts:368` (`collapsedGroups`) unchanged. Effort: **S**. Depends on: #3. Citation: `src/views/DatabaseView.ts:9845-9856`.

5. **Per-level empty / order / limit / uncategorized (compose, don’t reimplement)** — Gap vs Notion: Hide empty groups, hide unpopulated, per-group sort. Feasibility: **clear**. Files: none new — `buildGroupTree` calls the existing chain `withEmptyOptionGroups` → `groupBy` → `sortGroups(getEffectiveGroupOrder)` per parent, same as `getBoardSubgroups`. Effort: **S**. Depends on: #1. Citation: `src/views/DatabaseView.ts:9669-9673`.

6. **Embedded table dispatch + copy-back sibling** — Gap vs Notion: same grouping in linked/embedded views; spec §8 requires identical nested headers. Feasibility: **clear**. Files: `src/views/EmbeddedDatabaseRenderer.ts` (grouped dispatch around 970-1013 / 2632; explicit `groupByField` copy at 3353 — add `groupByFields` beside it; `Object.assign` at 3364-3365 only copies keys already on `this.config`, so parse #2 is still the load-bearing load path). Effort: **S**. Depends on: #1 and #2. Citation: `src/views/EmbeddedDatabaseRenderer.ts:3353, 3364-3365`.

7. **View-settings Sub-group picker (Notion UX)** — Gap vs Notion: Group and Sub-group are first-class View settings controls. Feasibility: **likely** (clone the board picker). Files: `src/views/ViewConfigPanelRenderer.ts:1563-1587` (exclude primary field + `file.name`; `applyReference` / `rollbackReference`; undo label). REQ-001 is satisfied by parse acceptance; this is the user-facing closer. Effort: **M**. Depends on: #1 and #2. Citation: `src/views/ViewConfigPanelRenderer.ts:1563-1587`.

8. **Create-in-group defaults for the full path + computed/rollup refusal** — Gap vs Notion: new rows in a nested group get both property values; rollup grouping is forbidden and formula groups refuse drag. Feasibility: **clear**. Files: `src/views/TableRenderer.ts:148-151`; `src/views/DatabaseView.ts:4599-4617` (already merges `context.groups[]` and board subgroup defaults); `src/data/GroupDisplay.ts:64-69` (`isComputedGroupField`). Effort: **S**. Depends on: #3. Citation: `src/data/GroupDisplay.ts:64-69`.

9. **Toolbar second picker** — Gap vs Notion: grouping is also reachable from the view chrome. Feasibility: **likely**. Files: `src/views/ToolbarRenderer.ts` (`renderGroupSelect` / `renderGroupPopover`); write path `src/views/DatabaseView.ts:2417` (`vs().groupByField`). Keep table-scoped — do not leak into gallery/list (`9554-9578`) or timeline (`getActiveGroupField` at 2890-2894). Effort: **M**. Depends on: #7. Citation: `src/views/ToolbarRenderer.ts` group popover (`renderGroupSelect` / `renderGroupPopover`).

10. **Nested-group row drag (multi-field write)** — Gap vs Notion: drag between groups for non-computed properties. Feasibility: **hard**. Files: `src/views/TableRenderer.ts:111, 136, 145, 672` (`setupGroupDropTarget`); `moveRowsToGroup` is one field (`37-38`). Depth > 0 must write every field on the path. Effort: **L**. Depends on: #3. **Defer** — display-only phase. Citation: `src/views/TableRenderer.ts:111, 136, 145`.

## Recommended build (locked design)

**Algorithm.** Keep `groupByField` working. Add optional `groupByFields?: string[]` on `ViewConfig`. Resolve fields with a pure helper (no ViewStateStore thread):

`effectiveGroupFields(config, state) = config.groupByFields?.length ? config.groupByFields : (state.groupByField || config.groupByField ? [that] : [])`

When the array is present, also keep `groupByField = fields[0]` so the toolbar and `getActiveGroupField` stay consistent. Cap the **picker UX at 2 fields** (Notion Group → Sub-group). Keep **compute unbounded** so a 3-field config still nests (REQ-002). Gate multi-field at **table dispatch only** — gallery/list stay on `vs().groupByField`.

`buildGroupTree(rows, fields, config, groupFn)` is the board’s per-parent regroup generalized: `groupFn(rows, field)` = `withEmptyOptionGroups(config, field, queryEngine.groupBy(rows, field, [], col, config))` then `sortGroups(getEffectiveGroupOrder(...))` — the exact body of `getBoardSubgroups` (`src/views/DatabaseView.ts:9669-9673`). Recurse `buildLevel(group.rows, fields.slice(1))`. Drop computed/rollup entries with a console warning (`isComputedGroupField`); never crash, never write.

`flattenGroupTree` emits preorder `{ key, rows, count, depth, path, field, children }`. Depth-0 single-field nodes keep `key` unchanged so collapse keys and DOM match today (REQ-004).

**Renderer.** Do **not** recurse the DOM. Extend `TableGroup` additively (`depth?`, `path?`, `children?`). In the loop (`TableRenderer.ts:82-155`): header always; indent via `db-group-header--depth-N`; collapse key = `path.join("::")` stored under `groupByFields[0]` (depth 0 ⇒ plain key); if collapsed, skip while `depth > collapsedDepth`; if `children.length`, skip the leaf table; if leaf, render today’s table + summaries + expand controls. Call `setupGroupDropTarget` **only at depth 0**. Create-entry: pass the full path as `context.groups` so `getCreateDefaults` (`DatabaseView.ts:4599-4606`) merges every level.

**EuroFormat integration.** New module `src/data/MultiFieldGrouping.ts`, same contract as `src/data/EuroFormat.ts:1-42`: one file, header that it is a local fork override kept as a small rebasable diff, **pure functions, no renderer imports**. Exports: `effectiveGroupFields`, `buildGroupTree`, `flattenGroupTree` (optional `dropComputedGroupFields`).

**Call sites (1 module + 3 edits):**
1. `src/views/DatabaseView.ts` — dispatch `6332-6333` becomes `effectiveGroupFields(...).length > 0`; `renderGroupedTable` `9539-9545` builds the tree then `tableRenderer.renderGroupedTable(..., flattened, fields[0])`.
2. `src/views/TableRenderer.ts` — depth-aware loop `82-155` only (no new actions interface; collapse/expand already take opaque keys at `DatabaseView.ts:9845-9856`).
3. Settings: `src/data/types.ts` beside `groupByField` (`362`); `src/data/DataSource.ts` parse `885` + serialize `1088` (`undefined` when empty). Required siblings of site 3, not extra architecture: `EmbeddedDatabaseRenderer.ts:3353` (`groupByFields` next to `groupByField`) and embed grouped dispatch; additive indent/spacing in `styles.css` (class + `.db-group-header + .db-group-header` next to `6255-6257`).

**Locked facts.** Spec path `src/views/table/TableRenderer.ts` is wrong; the file is `src/views/TableRenderer.ts` (F1.1, re-verified). Do **not** adopt Anytype query-as-group (`context/anytype-ts` `model/view.ts:37,57` — one `groupRelationKey`; `group.tsx` per-group filtered subscribe). AppFlowy is single-field (`context/appflowy/.../group/controller.rs:41-44, 60`) and its grid has no grouping UI. Keep `groupByFields[]` **separate** from `boardSubgroupEnabled` / `boardSubgroupField` (`types.ts:339-340`).

**REQ-005 reading.** Count 1 new module + 3 logical call sites above. Do not add `ViewStateStore` (`persist` already writes top-level `groupByField` at `69-84`). CSS and the Embedded one-liner stay additive. Nested DnD stays out.

## Edge cases & mobile/iCloud safety
- **Legacy 1-field:** `groupByFields` absent ⇒ `effectiveGroupFields` is `[groupByField]`; flatten depth 0; collapse keys unchanged; byte-identical to today (`types.ts:362`; dispatch still works via the fallback).
- **Null / missing:** each level gets `t("common.uncategorized")` (`QueryEngine.ts:279`); hide via `showEmptyGroups[field]` (`GroupVisibility.ts:24-30`). Distinct nodes per depth.
- **Empty groups:** `withEmptyOptionGroups` per level (`GroupVisibility.ts:52-60`); multi-select defaults to hidden empties (`:20`). Empty leaf tables follow today’s groupBy behavior.
- **Mixed types:** stringify + trim + dedupe (`QueryEngine.ts:276-280`); `localeCompare` tie-break; no throw.
- **Checkbox / date at depth:** checkbox `"true"`/`"false"` (`QueryEngine.ts:261`); date modes stay per-field (`dateGroupModes[field]`).
- **Multi-select fan-out:** a row can appear in multiple sibling groups at every depth (`QueryEngine.ts:143-147`); `rowByPath` is render-only (`TableRenderer.ts:90`). Counts are non-exclusive (fork / AppFlowy `fill_groups` / Notion multi-select agree).
- **3+ fields:** compute recurses; UI picker caps at 2 (`https://www.notion.com/help/views-filters-and-sorts`). `groupRowLimit` + `expandedGroupRows` clamp each leaf (`GroupVisibility.ts:63-75`). 5k×2 is O(N·D) Map passes — no memoization (`QueryEngine.ts:140-148`).
- **Computed / rollup:** picker filters them; module drops leftovers (`GroupDisplay.ts:64-69`; create gate `TableRenderer.ts:149-150`). Matches Notion (no rollup grouping; no drag on formula groups).
- **Filter-before-group:** `this.rows` is already filtered at `DatabaseView.ts:6313` before `6332`; nested grouping inherits that.
- **Empty DB:** `rows.length === 0` → `db-empty` (`TableRenderer.ts:92-98`); tree is empty at any depth.
- **Collapsed parent:** flatten is preorder; skip while `depth > collapsedDepth` (`TableRenderer.ts:132` today only skips the table).
- **DnD:** depth-0 drop targets unchanged; nested groups have **no** drop target so regrouping cannot `updateBoardGroup` two fields.
- **Mobile (REQ-006 / NFR-M01):** no table-specific narrow breakpoint; `body.is-phone` plus label `max-width: min(480px, calc(100vw - 48px))`. Nested headers add no desktop-only APIs and no new media queries. `tableMinWidth` on each header (`TableRenderer.ts:112`) keeps horizontal overflow equal to today’s grouped table (SC-004). Collapse toggles stay 20×20 — same as board/gallery; do not special-case depth.
- **iCloud / display-only (REQ-007 / NFR-R01):** `groupBy` is pure (`QueryEngine.ts:132-152`). The new module writes nothing. Collapse/expand still only `scheduleConfigSave` view definition (`DatabaseView.ts:9850-9856`), serialized per-file. No note-body / frontmatter row writes from grouping; no network (REQ-008). Nested DnD is deferred, so this phase adds **no new write path**.

## Open questions / operator decisions
1. **Unify `groupByFields[]` with board `boardSubgroupField`?** Default: **keep them separate** (spec default). Board is a 2-level special case with its own enabled flag and DnD MIME; table is N-level + flatten. Shared helper (`buildGroupTree`) is enough overlap.
2. **Module filename?** Default: **`src/data/MultiFieldGrouping.ts`**. Alternative `GroupByFields.ts` is fine; do not put it under `src/views/`.
3. **Collapse-key namespace?** Default: **`path.join("::")` under `groupByFields[0]`**. Do not copy the board’s field+key quirk.
4. **Indent unit?** Default: **16px per depth** via `db-group-header--depth-N` (`padding-left`; header is currently `padding: 0` at `styles.css:6184`). Add consecutive-header margin; the existing `wrap + header` rule at `6255` will not fire between two headers.
5. **Settings UI in this phase?** Default: **ship parse + the view-config Sub-group dropdown (#7) in the same PR**; defer the toolbar second picker (#9). Config-file-only would meet REQ-001 but not Notion’s View settings surface.
6. **UX cap at 2 vs expose 3+ in the picker?** Default: **picker max 2**; still verify a 3-field config in the data layer (REQ-002). Notion has no third level.
7. **Thread `groupByFields` through `ViewStateStore`?** Default: **no** (config-only). Dispatch reads `effectiveGroupFields(config, vs())`. Adding per-mode state is three more edits (`types.ts:167`, `create` / `toPersistedState` / `persist`) and blows the EuroFormat budget.
8. **Nested drag-and-drop?** Default: **defer**. Enabling it is a vault-write feature, not grouping display.
9. **Correct spec §3 path at build?** Default: **yes** — `src/views/TableRenderer.ts` + `src/views/DatabaseView.ts`, not `src/views/table/TableRenderer.ts`.
10. **REQ-005 vs discovered files?** Default: **lock the 1+3 call-site reading in Recommended build**; treat DataSource as the settings site, Embedded + CSS as siblings. Do not open ViewStateStore, gallery/list, or nested DnD to “use up” the budget.
