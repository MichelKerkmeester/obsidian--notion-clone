# Synthesis: Nested AND/OR View Filter Tree
> One-line: ranked Notion-parity enrichment for this feature, synthesized by Grok 4.6 (xhigh-fast) from the phase's 10 research iterations. Evidence trail: research.md.

## Verdict
**Build it.** Nested AND/OR is a real Notion-parity hole: views today are a flat `FilterRule[]` plus one global `filterLogic`, so `(A and B) or C` is inexpressible, while the fork already has the right tree type (`SourceRuleNode`) and a working nested editor for *source* rules. Headline recommendation: add isolated `src/data/ViewFilterTree.ts` with a **Kleene three-valued** walk and a leaf callback into private `matchesFilter`; do **not** reuse `matchesSourceRuleTree` for views, and do **not** invent a `FilterGroup` AST. Single biggest risk: the spec’s EuroFormat budget (one module + ≤3 call sites) under-counts the real mutation surface — if `filterTree` is persisted but chips, column-delete, field-rename, and chart drilldown keep writing only `state.filters`, nested groups desync on the next non-panel edit.

## Ranked backlog
1. **Nested AND/OR evaluation path** — Notion compound `and`/`or` filters evaluate `(A and B) or C`; the fork only runs one uniform `.every` / `.some` over a flat list. **Feasibility: clear.** Files: `src/data/ViewFilterTree.ts` (new), `src/data/QueryEngine.ts` (add `applyFilterTree`; leave `applyFilters` 74–89 untouched), `src/data/RowPipeline.ts` (93–97). **Effort: M.** Depends on: nothing. Citation: `src/data/QueryEngine.ts:74-89`; Notion API compound filters at `https://developers.notion.com/reference/post-database-query-filter`.

2. **Legacy simple→advanced promotion** — Notion keeps simple filters and promotes them into a group; the fork must load existing `filters` + `filterLogic` as a root group with identical row subsets. **Feasibility: clear.** Files: `src/data/ViewFilterTree.ts` (`buildViewFilterTree`), `src/views/ViewStateStore.ts` (`create` 86–113). **Effort: S.** Depends on: #1. Citation: `src/data/SourceRules.ts:48-59` (`createLegacySourceRuleTree`); Notion Help “Add to advanced filter” (`https://www.notion.com/help/views-filters-and-sorts`).

3. **Persisted filter groups (reload / iCloud)** — Notion groups survive close/reopen; without a `filterTree` field the panel is session-only. **Feasibility: clear.** Files: `src/data/types.ts` (`ViewModeStateDef` 164–173 and `ViewConfig` 397–399), `src/views/ViewStateStore.ts` (`persist` 69–84, `toPersistedState` 115–127, recursive prune in `get` 40–46). **Effort: S.** Depends on: #1–2. Citation: `src/views/ViewStateStore.ts:115-127` (already omits empty/undefined — the non-churny write shape).

4. **Nested group editor in the filter panel** — Notion groups have their own AND/OR control and an inner “Add a filter”; the panel is still a global toggle plus a flat row list. **Feasibility: likely** (UX/mobile, not algorithm). Files: `src/views/FilterPanelRenderer.ts` (`renderHeader` 125–146 and the flat loop 81–90; keep `renderSingleRuleEditor` 107–123 working for the active-rail popover). **Effort: M.** Depends on: #3. Citation: `src/views/ViewConfigPanelRenderer.ts:804-929` (existing recursive group/not/leaf editor to copy, not AppFlowy’s flat chips).

5. **Non-panel mutation coherence** — Notion’s chips/model stay one tree; the fork also mutates `state.filters` from the active rail, column delete/rename, and chart drilldown. Leaving those on the flat array while evaluation prefers `filterTree` makes nested views lie. **Feasibility: likely.** Files: `src/views/ViewRuleOperations.ts` (12–15), `src/views/ColumnOperations.ts` (502–514), `src/data/ColumnConfig.ts` (246–249), `src/views/DatabaseView.ts` (`applyChartFilters` 9651–3664), `src/views/EmbeddedDatabaseRenderer.ts` (`applyChartFilters` 1779–1793). **Effort: M.** Depends on: #3. Citation: `src/views/ViewRuleOperations.ts:12-15`.

6. **3-layer UI cap (evaluator unbounded)** — Notion UI: “nested up to three layers deep”; the API is unbounded. Spec requires 3+ *evaluation*; cap belongs in the editor only. **Feasibility: clear.** Files: `src/views/FilterPanelRenderer.ts` (group-header `depth >= 3` guard, modeled on `renderSourceRuleGroup` 901–916). **Effort: S.** Depends on: #4. Citation: Notion Help (`https://www.notion.com/help/views-filters-and-sorts`); API page above (no depth cap).

7. **Wrap-into-group + auto-collapse empty groups** — Notion/Anytype create a group by wrapping a rule and delete the group when the last child is removed; AppFlowy keeps empty groups. Spec empty-group contract is evaluator-side; UI should still prevent empty groups at edit time. **Feasibility: clear.** Files: `src/views/FilterPanelRenderer.ts`. **Effort: S.** Depends on: #4. Citation: `context/anytype-ts/src/ts/component/block/dataview/filters/group.tsx:84-122`.

8. **`not` composition in the view panel** — Spec P0 (REQ-001), not a Notion headline. Source-rule UI already has a labeled `not` wrapper; view filters do not. **Feasibility: likely.** Files: `src/views/FilterPanelRenderer.ts` plus `evaluateViewFilterTree` in `src/data/ViewFilterTree.ts`. **Effort: S.** Depends on: #1 and #4. Citation: `src/data/types.ts:240-243`; `src/views/ViewConfigPanelRenderer.ts:858-869`.

9. **Proof harness (`(A and B) or C` + legacy regression)** — Fork has `vitest.config.ts` including `src/**/*.test.ts` with `setupFiles: ["src/__tests__/setup.ts"]`, but **no** `src/__tests__/setup.ts` and **no** plugin `*.test.ts`. First `vitest` run fails before any assertion. **Feasibility: clear.** Files: `src/__tests__/setup.ts` (new no-op), `src/data/__tests__/ViewFilterTree.test.ts` (new). **Effort: S.** Depends on: #1. Citation: `vitest.config.ts:4-7`.

10. **Export the tree for phase 010** — Conditional formatting is still one `FilterRule` via `applyFilters([row], [rule.condition], "and", …)`. Not a Notion view-filter gap; it is REQ-008. **Feasibility: clear.** Files: export from `src/data/ViewFilterTree.ts` only this phase (`src/data/ConditionalFormatting.ts:38` stays until 010). **Effort: S.** Depends on: #1. Citation: `src/data/ConditionalFormatting.ts:38`.

Ruled out (do not build in 009): a new `FilterGroup` AST (REQ-002); id-based surgery (`SourceRuleNode` is positional — `ViewConfigPanelRenderer.ts:921-927`); AppFlowy per-row `DashMap` cache (`controller.rs:350-409`, optional later); AppFlowy chip-`Wrap` as the group editor (`filter_menu.dart:62-66` is leaf layout only); Anytype `In`/`AllIn`/`ExactIn` (`dataview.ts:60-78`); changing `matchesSourceRuleTree` (data-source path is out of scope); a second persistence pipeline; a 3-level cap in the evaluator.

## Recommended build (locked design)
**Type:** `SourceRuleNode` only (`src/data/types.ts:234-250`). Leaves used by views are `FilterRule`-shaped (`field` + `FilterOperator` at `types.ts:135-141`). No new AST.

**Module:** `src/data/ViewFilterTree.ts` — EuroFormat isolated module (`src/data/EuroFormat.ts:9-10`: one file, small rebasable diff). **Type-only import from `./types`.** **Zero runtime import from `SourceRules.ts` or `QueryEngine.ts`.** That resolves the F1.4 vs F9.1 contradiction: wrapping `parseSourceRuleTree` (`SourceRules.ts:227-257`) would pull source-only operators (`inFolder`, `hasProperty`, … at `SourceRules.ts:7-28`). Unknown view ops currently fall through `matchesFilter`’s `default: return true` (`QueryEngine.ts:124-125`), so a leaked source op would match every row.

Exports:
- `buildViewFilterTree(filters, logic)` — same shape as `createLegacySourceRuleTree` (`SourceRules.ts:48-59`): `[] → undefined`, one rule → leaf, else `{ type:"group", logic, rules }`.
- `normalizeViewFilterTree(value)` — view-operator allow-list; drop unknown kinds with `console.warn`; truncated/non-object root → `undefined` (not an empty OR group).
- `pruneViewFilterTree(tree, isEffective)` — recursive; uses `isEffectiveFilterRule` (`src/data/FilterRules.ts:3-12`) so empty-value in-progress leaves cannot poison an OR.
- `evaluateViewFilterTree(tree, matchesLeaf): boolean | null` — **Kleene three-valued**, not `matchesSourceRuleTree`.
- `serializeViewFilterTree(tree)` — stable JSON for round-trip tests.
- Leaf helpers used by #5: `flattenLeaves`, `mapLeafAt` / `removeLeafAt` / `appendLeaf` (DFS index ↔ `state.filters[i]`).

**Algorithm (empty group = no-op in every position):**
- Leaf → `matchesLeaf` (column-aware).
- `expression` → `false` (do not crash; do not expose “add expression” in the view panel).
- `not` → invert `true`/`false`; `null` stays `null`.
- Empty `group` → `null` (skip).
- AND: first `false` wins; if any `true` and no `false` → `true`; all `null` → `null`.
- OR: first `true` wins; if any `false` and no `true` → `false`; all `null` → `null`.
- **Root `null` / missing tree → keep all rows**, matching `applyFilters` empty short-circuit (`QueryEngine.ts:80`).

Do **not** call `matchesSourceRuleTree` (`SourceRules.ts:144-156`). Empty AND → `true` and empty OR → `false` (`SourceRules.ts:152`) makes a nested empty AND under OR match **every row**. AppFlowy is closer (`controller.rs:482-503`: empty children → `None`) but OR-of-all-skips still returns `Some(false)` (`493-503`). Kleene is the only reading that satisfies spec §8 “empty group = no-op” at both root and nested positions. Short-circuit AND/OR; cost O(rows × nodes), stack O(depth); no per-row cache this phase.

**`QueryEngine.applyFilterTree(rows, tree, columns)`:** same `columnMap` as `applyFilters` (`QueryEngine.ts:81`); `matchesFilter` stays **private** (`91-127`); matcher is `(leaf) => this.matchesFilter(row, leaf, columnMap.get(leaf.field))`. Treat root result `!== false` as visible (`null` passes). Checkbox `empty`/`notempty` and number/date/select compares stay in `matchesFilter` (115–123, 186–203).

**`RowPipeline.ts:93-97`:** prune then evaluate one path:
`tree = state.filterTree ? pruneViewFilterTree(state.filterTree, …) : buildViewFilterTree(getEffectiveFilterRules(state.filters, validFields), state.filterLogic)`; if `tree` then `applyFilterTree`, else today’s `applyFilters` (identical for a single flat group).

**Persistence protocol:** `filterTree` is canonical when present. On panel commit, dual-write DFS leaves into `state.filters` and root logic into `state.filterLogic` so toolbar badges (`getEffectiveFilterRules`) and `ActiveViewControlsRenderer.ts:37-40` keep working without extra files. `toPersistedState` **omits `filterTree` when the tree is a single flat group** (legacy bytes unchanged). Nested/`not` trees persist `filterTree` and still dual-write the leaf snapshot (badge count only; evaluation does not use the snapshot).

**UI:** Recursive renderer copied from `renderSourceRuleNode` / `renderSourceRuleGroup` (`ViewConfigPanelRenderer.ts:846-929`): per-index `onReplace`, header AND/OR dropdown, add-rule / add-group / add-not / remove. Reuse `.db-source-rule-*` chrome (`styles.css:9192-9234`: `border-left` indent, `min-width: 0`, flex 180/130) so **`styles.css` stays out of the diff**. Wrap-selected-rule-into-AND-group is the create-group gesture (Anytype `group.tsx:109-122`; AppFlowy wrap-on-insert `entities.rs:134-155`). Hide “add group” at depth 3. No chip-`Wrap` rebuild (AppFlowy Flutter filter UI is flat — `filter_menu.dart:62-66`).

**EuroFormat call sites (locked):**
1. **`src/data/QueryEngine.ts`** — additive `applyFilterTree` only.
2. **`src/views/FilterPanelRenderer.ts`** — tree editor; keep using `actions.saveState()` (already 99/142/187/212/228/245/264/285/339).
3. **`src/views/ViewStateStore.ts`** — `filterTree` on `DatabaseViewState`; hydrate / persist / recursive dead-field prune.

Mechanical extras required for the feature to actually run (operator must accept these or REQ-001/006 fail): **`src/data/types.ts`** (two additive `filterTree?: SourceRuleNode` fields) and **`src/data/RowPipeline.ts`** (the only evaluation caller). Tests as specced. Do not export `matchesFilter`.

## Edge cases & mobile/iCloud safety
**Must-handle:**
- Missing/`undefined` tree or empty root → all rows (`QueryEngine.ts:80`), even if `filterLogic === "or"` (flat path short-circuits on `filters.length === 0` before OR-false). Nested empty groups are skip (`null`), never “OR poison” (`SourceRules.ts:152`) and never “OR of all-skips hides every row” (AppFlowy `controller.rs:493-503`).
- One leaf ≡ today’s flat path (REQ-003) given the same `matchesFilter`.
- `not` wrapping a group; 3+ levels in the evaluator; UI refuses a 4th group layer.
- Malformed/`unknown` node kinds: drop + `console.warn`, never throw. Truncated root → `undefined`.
- Dead schema fields: prune leaves recursively at `ViewStateStore.get` (same as today’s `state.filters` filter at line 46). Groups emptied by prune stay skip.
- Ineffective leaves (`FilterRules.ts:3-12`): prune recursively before eval so a blank value cannot satisfy/poison OR.
- `expression` nodes in persisted junk: evaluate `false`; no view-panel control.
- New-record defaults (`DatabaseView.ts:3991-4001`) already no-op on root OR; nested trees must keep that (only AND-required leaves seed frontmatter — same idea as `getRequiredSourceRules` at `SourceRules.ts:159-165`).
- Two clients: documented last-write-wins; no new race.

**Mobile:** panel is already a popover (`FilterPanelRenderer.ts:71-77`, `positionToolbarPopover`). Copy source-rule flex + `min-width: 0` (`styles.css:9192-9229`); 30px-class controls already in that block. No desktop-only APIs (NFR-R01). Depth cap 3 also cuts nested chrome at phone width.

**iCloud / display-only:** evaluation does not write notes; rollups/charts/templates are out of scope. Config writes ride the existing path only: panel `saveState()` → `ViewStateStore.persist` (omit empty, `115-127`) → `scheduleConfigSave` debounce **300ms** (`DatabaseView.ts:6213-6252`) with flush-on-deactivate (`1261-1263`) and flush-on-activation (`1805-1811`). No new save API, no extra write trigger, no churny always-on `filterTree: { type:"group", rules:[] }` (omit it). Tree field is view-config JSON, same as `filters` today.

## Open questions / operator decisions
1. **REQ-007 ≤3 call sites vs the files that actually load/eval/mutate the tree.** Spec table names QueryEngine + FilterPanelRenderer (+ tests). Persistence and the only eval caller are `ViewStateStore.ts` and `RowPipeline.ts`; chips/column-delete/rename/chart-drilldown still touch `state.filters`. **Default: accept `types.ts` + `RowPipeline.ts` as mechanical extras, and wire `ViewRuleOperations.ts` + `ColumnOperations.ts` + `ColumnConfig.ts` + both `applyChartFilters` in the same phase** (item #5). Shipping panel+eval without those five makes nested groups correct only until the next chip/delete/drilldown. Shrinking back to three files means nested trees are panel-only and will desync.

2. **Kleene skip vs AppFlowy “OR of all-skips = false”.** **Default: Kleene** (spec §8 no-op). Document the AppFlowy divergence in the test file (`controller.rs:493-503`).

3. **When to persist `filterTree`.** **Default: only when the tree has a nested group or a `not`.** Flat groups stay `filters` + `filterLogic` so existing vault configs do not grow a new key (iCloud-quiet). First nested edit is the promotion write (Notion simple→advanced).

4. **Active-rail chips on nested trees.** Today a single AND/OR toggle (`ActiveViewControlsRenderer.ts:82-89`) is a lie once groups nest. **Default: keep DFS leaf chips (dual-write); hide the rail logic toggle when `filterTree` is nested; those users edit groups in the panel.** Do not rebuild AppFlowy chips.

5. **`expression` in the view filter UI.** Spec says group/`not`/`expression` compose. Expressions are a source-rule feature (`ViewConfigPanelRenderer.ts:840-841`). **Default: no “add expression” in the filter panel; evaluator maps them to `false`.**

6. **Mobile leaf presentation.** Chip-flow vs current row-list. **Default: keep the existing row-list + flex-shrink** (popover, not a toolbar). Measure popover width in the phase checklist (not done in research).

7. **Single-child groups after delete.** AppFlowy does not hoist (`entities.rs:174-190`). **Default: auto-collapse empty groups (Anytype/Notion); do not auto-flatten a remaining single child except when persist-normalization drops `filterTree` because the tree is flat-equivalent.**
