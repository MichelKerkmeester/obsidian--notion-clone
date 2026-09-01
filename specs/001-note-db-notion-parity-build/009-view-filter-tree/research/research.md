# Deep Research: Nested AND/OR View Filter Tree

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `lineages/deepseek-flash-max`. Stop reason: max_iterations. Average newInfoRatio: 0.760.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 001 — Fork Source Grounding: Reuse Candidates for the View Filter Tree

**Status:** complete | **Focus:** Fork source grounding | **newInfoRatio:** 0.95

## Findings

### F1.1 — The recursive evaluator already exists: `matchesSourceRuleTree`
`src/data/SourceRules.ts:144-156` implements exactly the tree walk the spec's `applyFilterTree` needs:
- Leaf (no `type` key) → `matchesLeaf(rule)`; `expression` node → `matchesExpression` (default false); `not` → negation of subtree; `group` → `every` (and) / `some` (or) over children.
- Empty group semantics are already defined: `rules.length === 0` evaluates to `logic === "and"` (i.e. AND-group = pass-through/no-op, OR-group = false).
- Tree recursion is depth-unbounded (safe for 3+ levels; JS call stack is fine at realistic depths).

**Implication:** `QueryEngine.applyFilterTree` does NOT need new tree-walk logic. It needs (a) a leaf matcher that maps view `SourceRule` leaves into the column-aware `matchesFilter` behavior, and (b) a root normalization adapter. The spec's "no new filter AST" (REQ-002) is trivially satisfiable: the type is `SourceRuleNode` (types.ts:250).

### F1.2 — Column-aware leaf semantics must be preserved
`QueryEngine.applyFilters` (QueryEngine.ts:74-89) + `matchesFilter` (91-127) carry column-type-aware semantics the data-source leaf evaluator may not share:
- `empty`/`notempty` are checkbox-aware (QueryEngine.ts:115-123); `eq` uses `compareFilterValue` with number/date/select/status/checkbox rank comparisons (186-203).
- The view `FilterOperator` set (types.ts:135: eq/neq/contains/hasTag/gt/lt/gte/lte/empty/notempty) is a strict subset of `SourceRuleOperator` (types.ts:210-214), so view-tree leaves can be `SourceRule`-typed and validated against the view operator set. **The adapter must map a `SourceRule` leaf → `matchesFilter(row, {field, op, value}, column)`**, reusing QueryEngine's private matcher (either export it or implement the adapter inside QueryEngine.ts — a call-site-visible design decision for later iterations).

### F1.3 — Defensive persistence parser is reusable
`parseSourceRuleTree` (SourceRules.ts:227-257) is the existing malformed-input guard for source-rule trees: it drops non-objects, normalizes `logic` to and/or, filters invalid nodes recursively (missing field, unknown op via `SOURCE_RULE_OPERATORS` set at 7-28, empty `not`), and stringifies values. This is exactly the "skip with console warning, never crash / truncated → empty root group" edge-case contract (spec §8) — **reuse it in `ViewFilterTree.normalize` instead of writing a second parser**. One caveat: it currently returns `undefined` for a truncated root rather than an empty group; the view adapter can wrap `?? {type:"group", logic:"and", rules:[]}`.

### F1.4 — The EuroFormat pattern is a pure, dependency-free module
`src/data/EuroFormat.ts` (42 lines) is the isolated-module template: no imports from the repo, only platform `Intl`; header comment "Local fork override. Kept in one module so it stays a small, rebasable diff." (lines 9-10). **`ViewFilterTree.ts` must follow the same shape**: pure helpers (build/normalize/serialize/legacy-adapter), zero repo imports, so the upstream diff is exactly one new file + minimal call sites. The one tension: the evaluator needs `matchesFilter` (QueryEngine private). Two EuroFormat-compatible options to weigh in later iterations: (a) `ViewFilterTree` stays pure and `QueryEngine.applyFilterTree` does the column-aware leaf adapter inline (evaluation logic lives in QueryEngine — slightly larger call-site diff), or (b) pass a `matchesLeaf` callback into `ViewFilterTree.evaluate(tree, matchesLeaf)` so the module stays pure AND evaluation is one exported function (EuroFormat-shaped, better testability).

### F1.5 — Flat path and panel state
- `applyFilters` empty-array short-circuit (`filters.length === 0 → return rows`, QueryEngine.ts:80) matches spec's empty-group no-op expectation; `or` uses `.some`, `and` uses `.every` — the flat path is the single-group special case of the tree evaluator (matchesSourceRuleTree with `rules.length===1` also collapses).
- The panel header renders a single global and/or toggle (`state.filterLogic`, FilterPanelRenderer.ts:135-145); rows are `renderFilterRow` (148+) with field dropdown (migrates legacy checkbox eq/neq → empty/notempty at 196-200), operator dropdown, value editor; `renderSingleRuleEditor` (107-123) is the compact variant. **The UI extension point is `renderHeader` (global toggle → root group logic) + a recursive row renderer modeled on the existing source-rule editor (`ViewConfigPanelRenderer.ts:804-929`, per init snapshot)**, not a new component.
- The only view-filter evaluation call site is `RowPipeline.ts:93-97` (`state.filters` + `state.filterLogic`) — a single call-site edit to route through `applyFilterTree` when a tree is present.

## Ruled-out this iteration
- Building a new evaluator: NOT needed (F1.1).
- Writing a second defensive parser: NOT needed (F1.3).
- A new UI component class for the panel: the existing source-rule editor interaction patterns (indent-based depth) already model the UX; reuse beats rebuild (spec §6 risk mitigation).

## Next focus
Iteration 2: AppFlowy — data model + evaluation algorithm in `context/appflowy/frontend/rust-lib/flowy-database2` (filter module), citing real file:line.

---

# Iteration 002 — AppFlowy Data Model + Evaluation Algorithm (Rust grid model)

**Status:** complete | **Focus:** AppFlowy filter tree data model and evaluator | **newInfoRatio:** 0.90

## Findings

### F2.1 — AppFlowy's filter tree is an explicit recursive enum, not a generic "node"
`context/appflowy/frontend/rust-lib/flowy-database2/src/services/filter/entities.rs:27-31` (`Filter { id, inner }`) and `252-264` (`FilterInner::And { children } | Or { children } | Data { field_id, field_type, condition_and_content }`). Every node carries an `id` — tree surgery (insert/delete/convert) operates by id, and `find_filter`/`find_parent_of_filter` (46-85) are the recursive navigators. **Takeaway for the fork:** `SourceRuleNode` has NO node ids (types.ts:234-250), and the fork's tree operations (`combineSourceRuleTrees`, `removeSourceRuleTreeReferences`) are structural. The view editor that needs add/remove/regroup by position can work positionally (children[index]) — AppFlowy's id-based ops are a UI convenience, not a semantic requirement. Not a blocker for REQ-002.

### F2.2 — Evaluation is THREE-VALUED: `Option<bool>` with empty-group SKIP
`context/appflowy/frontend/rust-lib/flowy-database2/src/services/filter/controller.rs:475-542`:
- `And` with `children.is_empty()` → `None` (neutral); else short-circuit `Some(false)` on first false child, else `Some(true)` (482-492).
- `Or` with `children.is_empty()` → `None`; else short-circuit `Some(true)` on first true child, else `Some(false)` (493-503).
- `Data`: unknown field → `Some(false)` (log + false, 509-514); field-type mismatch → `Some(false)` (516-519); else the type-option handler's `handle_cell_filter` (533-539).
- Top level (`filter_row`, 449-472): `if let Some(is_visible) = apply_filter(...)` — only `Some` results are AND-combined; `None` (empty group) is **skipped entirely**, with short-circuit break on the first false (462-467). Rows with no filters stay visible (`new_is_visible = true` initial, 458).

**Contrast with the fork (F1.1):** `matchesSourceRuleTree` (SourceRules.ts:152) maps an empty group to `logic === "and"` (true) or false. At the ROOT both semantics agree with "no-op" (empty AND root → all rows pass), but **nested they diverge**: `(empty-group) or C` — fork: empty AND → true ⇒ whole OR → true ⇒ every row passes (empty group POISONS the OR); AppFlowy: empty → skip ⇒ only C matters. The spec's edge-case contract (§8: "Empty group evaluates as a no-op") is satisfied ONLY by AppFlowy's skip semantics. **Recommendation: the view-tree evaluator should implement three-valued evaluation with empty-group-as-None, even though the data-source path keeps its existing two-valued walk (out of scope, spec REQ/out-of-scope §3).**

### F2.3 — Insert/convert/delete tree surgery
`entities.rs:87-155`:
- `convert_to_and_or_filter_type` (89-128): Data→And/Or wraps the data filter in a fresh group (`mem::swap`); And↔Or converts in place; And/Or→Data is an explicit error (116-122). **UI implication:** "add group" = wrap existing child, not restructure siblings.
- `insert_filter` (134-155): appending a new sibling under a Data filter auto-wraps it into an And group first — the editor never leaves a data filter with children.
- `delete_filter` (174-190): parent-scoped removal; a deleted group's children are removed wholesale (no hoisting of grandchildren). AppFlowy does NOT auto-collapse single-child groups after delete.

### F2.4 — Performance: parallel + differential + short-circuit
- `filter_rows_and_notify` (controller.rs:350-384): `rows.par_iter()` (rayon) + `partition_map` into visible/invisible; `filter_rows` (386-409) re-uses a `DashMap<RowId, bool>` per-row result cache (`result_by_row_id`, 457, 470) so unchanged rows keep their cached verdict — differential re-filtering.
- Short-circuits: per-row AND at top level (462-467), and inside And/Or children (487-499).
- **Fork takeaway:** the fork filters thousands of rows in JS on each refresh (RowPipeline.ts:93-97, no per-row cache); tree evaluation adds only O(depth) per row with short-circuit — the single linear pass claim (NFR-P01) holds; a per-row result cache like AppFlowy's is an optional future optimization, NOT required for this phase.

### F2.5 — Persistence: nested map with per-child fault tolerance
- Serialization (entities.rs:329-423): `FilterMap` with `id`, `filter_type` (0/1/2 ints, 325-327), `children` as nested `Any` arrays, `field_id`/`ty`/`condition`/`content` for data nodes — a faithful recursive mirror.
- Deserialization (425-483): unknown filter_type → `bail!` per node; `get_children` (464-483) logs and **drops** unparseable children instead of failing the whole tree — the same "skip invalid subtree" contract as the fork's `parseSourceRuleTree` (F1.3). Unknown node kinds are dropped, never fatal.

## Ruled-out this iteration
- Id-based tree surgery for the fork UI: NOT needed — positional children editing suffices for `SourceRuleNode` (F2.1).
- A per-row result cache for this phase: NOT required — NFR-P01 is satisfied by the linear walk (F2.4).

## Next focus
Iteration 3: AppFlowy Flutter UI — filter panel widget tree (nested group editing UX, mobile), `context/appflowy/frontend/appflowy_flutter/lib/plugins/database`.

---

# Iteration 003 — AppFlowy Flutter Filter UI: Chip-Flow, Not a Tree Editor

**Status:** complete | **Focus:** AppFlowy Flutter filter panel UI | **newInfoRatio:** 0.55

## Findings

### F3.1 — The filter menu is a responsive chip flow, not a tree editor
`context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/presentation/widgets/filter/filter_menu.dart:62-66`: filters render as chips inside a `Wrap(spacing: 6, runSpacing: 4)` — the flow layout wraps to multiple lines at narrow widths **for free** (mobile-safe pattern). Each chip is a `FilterMenuItem` keyed by `filterId` (41-49); a trailing `AddFilterButton` (55-59, 73-123) opens a popover field picker (`CreateDatabaseViewFilterList`).

### F3.2 — Per-chip editors are field-type-specific choice chips
`filter_menu_item.dart:25-38` dispatches per `FieldType` to `TextFilterChoicechip` / `NumberFilterChoiceChip` / `DateFilterChoicechip` / `SelectOptionFilterChoicechip` / `CheckboxFilterChoicechip` / `ChecklistFilterChoicechip` / `URLFilterChoicechip` under `choicechip/`. Each chip embeds its own condition dropdown (`ConditionButton`, condition_button.dart:10-48 — small 20px-high button with label + arrow, `fontSize: 10`) and value editor. The delete affordance is a disclosure "…" menu (`disclosure_button.dart:11-75`, enum `FilterDisclosureAction.delete`, 53-55) — the only per-chip action besides editing. **Takeaway for the fork panel:** the existing `renderFilterRow` field/operator/value dropdown row (FilterPanelRenderer.ts:148+) is the desktop form of the same idea; the chip + Wrap layout is the mobile-width answer and matches "usable at mobile width" (REQ-004) without a bespoke responsive design.

### F3.3 — The UI state is FLAT; the tree lives in the model
`filter_editor_bloc.dart:202-216`: `FilterEditorState.filters` is `List<DatabaseFilter>`; events are flat CRUD (`createFilter` with optional parent id — `_createDefaultFilter(filterId: null, field)` at 51-53 — `updateFilter`, `deleteFilter`, 57-67). No group widget, no and/or connector chip, no indent hierarchy exists in the Flutter filter widgets in this snapshot. The Rust model (F2.1) supports And/Or trees and even auto-wraps (entities.rs:134-155), but the current grid UI only ever shows the root level. **Contrast:** the fork ALREADY has a full nested tree editor for source rules (ViewConfigPanelRenderer.ts:804-929) — so the fork's UI target is ahead of AppFlowy's here; AppFlowy's contribution is the chip-flow layout, not group editing.

### F3.4 — And/or is implicit at the root level
No explicit global and/or toggle or per-group connector was found in the filter widgets. Root filters are AND-combined by `filter_row` (controller.rs:460-468) unless a root is itself an Or node. The `create_filter_list.dart` picker only offers fields. (The and/or semantics exist in the data model via `FilterType` and `convert_to_and_or_filter_type` — entities.rs:89-128, 325-327 — but are not surfaced by this UI snapshot.)

## Ruled-out this iteration
- Copying AppFlowy's flat chip list as the fork's group editor: the fork's own source-rule tree editor is the better model for nesting; AppFlowy's chips are the mobile-width layout answer for leaf rows only.

## Next focus
Iteration 4: Anytype — data model + evaluation in `context/anytype-ts/src/ts` (filter/store), real file:line.

---

# Iteration 004 — Anytype Data Model + Filter Semantics (anytype-ts/src/ts)

**Status:** complete | **Focus:** Anytype filter model + evaluation | **newInfoRatio:** 0.85

## Findings

### F4.1 — Anytype's "tree" is a self-referential node: a group IS a filter with children
`context/anytype-ts/src/ts/interface/block/dataview.ts:138-148`: `Filter { id?, relationKey, condition, value, operator?, quickOption?, includeTime?, nestedFilters? }`. The runtime model (`model/filter.ts:21-51`) recursively maps `nestedFilters` into `Filter` instances (line 39). `FilterOperator` (dataview.ts:54-58) is `None=0 | Or=1 | And=2`. **A group is detected by shape, not by a `type` tag**: `isGroup = [And, Or].includes(item.operator)` (component/block/dataview/filters/group.tsx:130-132), and an "advanced" (grouped) filter is `!filter.relationKey && filter.nestedFilters?.length` (lib/dataview.ts:786). This is the "operator doubles as group marker" design — a valid alternative to the fork's explicit `{type:"group"}` node, but the spec pins the fork to `SourceRuleNode` (REQ-002), so Anytype's shape is a reference, not a template.

### F4.2 — Leaf condition vocabulary is much richer than the fork's
`FilterCondition` (dataview.ts:60-78): Equal/NotEqual/Greater/Less/GreaterOrEqual/LessOrEqual/Like/NotLike/In/NotIn/Empty/NotEmpty/AllIn/NotAllIn/ExactIn/NotExactIn. The fork's view set (types.ts:135) covers the core (eq/neq/contains/gt/lt/gte/lte/empty/notempty + hasTag); Anytype adds list-semantics operators (In/AllIn/ExactIn and their negations) that the fork's multi-select handling partially covers via `hasTag` and `contains` on arrays (QueryEngine.ts:104-106). **Not a gap to close in this phase** — the spec scopes the tree to existing view operators; list-operator parity can ride on a later phase.

### F4.3 — Evaluation is delegated to the backend; frontend normalizes defensively
Frontend persists/updates trees via gRPC (`C.BlockDataviewFilterAdd`/`BlockDataviewFilterReplace`, dataview.ts:1278, 1292); actual row matching runs in anytype-heart (Go). Frontend-side guards: `getFilteredFilters` (dataview.ts:1241-1243) drops filters with deleted relations (`checkDeletedRelation`) but keeps advanced groups (`isAdvancedFilter`); `clearFilter` (1257-1279) resets a group to defaults via `getDefaultAdvancedFilter`. `flattenFilters` (780-798) partially flattens And-only groups for query paths (Or groups are never flattened — they must reach the backend intact). **Fork takeaway:** keeping evaluation client-side in `QueryEngine.applyFilterTree` (as the spec requires) is simpler than Anytype's split; the fork should copy Anytype's defensive normalization (drop filters whose field no longer exists in the schema) — the fork's `getViewRuleColumns` already bounds the field dropdown to live columns (FilterPanelRenderer.ts:169).

### F4.4 — Persistence mirrors the tree recursively
`lib/api/mapper.ts:412` (`nestedFilters: (obj.nestedFilters || []).map(Mapper.From.Filter)`) and `1102` (To.Filter) — recursive JSON-ish mapping both directions, exactly the "serialized tree in config survives save/reload" shape REQ-006 asks for. No ids required on children (`id?` optional, dataview.ts:139) — positional arrays suffice, which validates the fork plan (SourceRuleNode children arrays, no ids).

## Ruled-out this iteration
- Copying Anytype's operator-as-group-marker shape: NOT possible under REQ-002 (`SourceRuleNode` is fixed); noted as reference-only alternative (F4.1).
- Closing Anytype's list-operator gap (In/AllIn/ExactIn): out of scope for this phase (F4.2).

## Next focus
Iteration 5: Anytype UI — `component/block/dataview/filters/` (group/rule/item/bar) + `component/menu/dataview/filter/` — nesting UX details: depth indentation, operator select placement, add-rule affordances, mobile/compact behavior.

---

# Iteration 005 — Anytype Nested-Group Editor UI/UX Anatomy

**Status:** complete | **Focus:** Anytype group editor UX details | **newInfoRatio:** 0.70

## Findings

### F5.1 — Recursive group renderer with depth-driven chrome
`component/block/dataview/filters/group.tsx` is the whole editor: `DataviewFilterGroup` recurses into itself for child groups (`isGroup` → `<DataviewFilterGroup key={i} ...>`, 194-199) with a `depth` prop; each group carries `className="group depth{depth}"` (188) and a path id (`${parentPath}-${index}`, line 30). The SCSS (scss/block/dataview/filters/group.scss) implements the visual hierarchy:
- **Indentation** via `.items { padding: 0px 16px }` (line 17) — each nesting level indents 16px.
- **Group boxing**: nested (non-depth0) groups get `border-radius: 8px; border: 1px solid var(--color-shape-highlight-medium); padding: 8px 16px` on `.items` (81-88) — a soft bordered container that makes the group a visible unit. Depth0 is unboxed (96-102).
- Rule row layout: `.rule > .inner { display: flex; align-items: center; gap: 0px 8px }` (19-20) with `relationSelect` + `conditionSelect` + flex-grow `valueSelect` (`min-width: 0`, 33) — the value editor absorbs remaining width and truncates, so rows never blow out the panel.
- Group head: borderless inline operator `Select` (And/Or) at `font-weight: 500` with hover highlight (10-14) — the connector lives in the group's own header row, Notion-style, not between siblings.

### F5.2 — Group-editing operations: wrap, auto-collapse, add-rule
In group.tsx:
- **Turn into group** (109-122): `onTurnIntoGroup(idx)` wraps a single rule into a new And group `{ operator: And, relationKey: '', nestedFilters: [rule] }` — one click converts a leaf into a group root. Same operation as AppFlowy's `convert_to_and_or_filter_type` (F2.3) — converging evidence that "wrap selected rule(s) in a group" is the canonical group-creation gesture.
- **Auto-collapse on empty** (84-95): removing the LAST rule deletes the group itself (`nestedFilters.length <= 1 → onDelete()`). AppFlowy keeps empty groups; Anytype collapses them. For the fork, the spec's empty-group no-op contract plus Anytype's auto-collapse means: the UI should prevent/cleanup empty groups at save time, while the evaluator still tolerates them.
- **Add rule** (65-82): appends `{ relationKey: 'name', condition: <first condition of ShortText>, value: '' }` with sensible defaults; the menu item "Add rule" is the last item of the group's item list (180).
- Operator of the ROOT group is chosen by the parent (head Select at index==1 shows `parentOperator`, 143-157); deeper groups show a static Label with the parent operator name (163-167).

### F5.3 — Value editors are per-type and overflow-safe
`rule.tsx` (200-319): Number/Url/Phone/Email → `Input`; Object/File → `objectsList` chips with `+N rest` overflow count and tooltip (238-277); Select/MultiSelect → `optionsList` Tags, max 2 visible + `+N rest` (280-315); date → `dateWrapper` with two `dateInput`s (group.scss:67-70). Placeholders per type (filterPlaceholderSelect/File/Object). **Fork mapping:** FilterPanelRenderer's renderFilterRow already has per-type value editors; the overflow-chip pattern (`+N`) is the mobile-width answer for select/status/tags values — the fork's dropdown-in-row may need the same truncation at narrow widths (REQ-004).

### F5.4 — Popover list scales by rule count
`component/menu/dataview/filter/list.tsx:115` uses `item.nestedFilters?.length || 1` for row-height calculation — the advanced-group row in the "Add filter" picker is sized by its children count. Minor but shows group-aware layout in the picker.

## Ruled-out this iteration
- The border-box group visual: keep as a strong candidate for the fork's group chrome (CSS-only, mobile-safe), but final choice deferred to synthesis (depends on the fork's existing `.db-panel-*` styling conventions).

## Next focus
Iteration 6: Notion filter UX via WebFetch — nested group editor behavior, and/or group placement, mobile app filter panel, keyboard affordances.

---

# Iteration 006 — Notion Filter Groups: Official Behavior Contract (WebFetch)

**Status:** complete | **Focus:** Notion nested filter groups via WebFetch | **newInfoRatio:** 0.75

## Findings

### F6.1 — Notion's official depth limit: THREE layers
Notion Help Center, "Views, filters, sorts & groups" (`https://www.notion.com/help/views-filters-and-sorts`): *"You can create more specific database views and combine AND and OR logic by using filter groups. These can be nested up to three layers deep!"* — the product's own UX contract caps nesting at 3 levels.
**Fork implication:** the spec's edge case says "Deeply nested groups (3+ levels) evaluate correctly". Notion's cap is a UX decision (manipulability), not an evaluator constraint. Recommendation: evaluator unbounded (trivial), UI caps group creation at 3 levels (depth counter) — matches Notion parity AND the fork's own source-rule editor risk note ("deep trees are hard to manipulate").

### F6.2 — Promotion path: simple → advanced filter
Same page, Tip: *"You can turn a simple filter into an advanced one by opening the edit menu ... select Filter. Click on a particular filter and in the menu that appears, select ••• → Add to advanced filter."* — the legacy flat rule does NOT get thrown away; it is **promoted into a group**. This is the direct UX analog of REQ-005's legacy normalization: when the user first opens the advanced editor, the existing `FilterRule[]` + `filterLogic` should materialize as a root group (Notion behaves the same way). Deletion is symmetric: `•••` → `Delete filter` (same page, "Delete a filter").

### F6.3 — Group anatomy (corroborated by third-party walkthrough)
WiseChecker's breakdown (`https://wisechecker.com/notion-database-filter-and-vs-or-conditions/`), consistent with the official docs: "Add a filter group" creates a section with its **own AND/OR logic dropdown at the top** and its **own Add a filter button inside**; rules inside the group combine by the group's logic; the main filter's logic (default AND) combines groups; nesting works by adding groups inside groups. The known failure mode is also documented: users misread outer vs inner logic — the UI must visually distinguish group containers (cf. Anytype's border-boxed groups, F5.1).

### F6.4 — What Notion does NOT constrain
No official statement on empty groups (Notion's editor deletes groups when the last rule is removed — consistent with Anytype's auto-collapse, F5.2), and no mobile-specific filter-group docs (the mobile app reuses the same filter popover; the fork's mobile constraint REQ-004 therefore has no Notion-specific pattern to copy — AppFlowy's chip Wrap remains the best mobile layout reference, F3.1).

## Ruled-out this iteration
- A 3-level cap in the EVALUATOR: ruled out — cap belongs in the UI only (F6.1).

## Next focus
Iteration 7: Legacy flat→tree normalization semantics (q4) + persistence/edge-case guarantees (q5) — fork save path, iCloud churn analysis, malformed/truncated handling; combine fork + reference evidence.

---

# Iteration 007 — Legacy Normalization + Persistence: The Fork's Single Save Path

**Status:** complete | **Focus:** q4 legacy normalization + q5 persistence/edge cases | **newInfoRatio:** 0.85

## Findings

### F7.1 — THE persistence call site is `ViewStateStore` — one file, three touches
`src/views/ViewStateStore.ts` owns the entire view-state round trip:
- Runtime state the panel edits: `DatabaseViewState { filters: FilterRule[]; filterLogic: "and"|"or"; ... }` (16-26).
- Hydration: `create()` (86-113) reads `viewConfig.viewStates[mode]` (per-viewType map) with fallback to top-level legacy fields (89), defaults `filterLogic` to "and" (108).
- Persistence: `persist()` (69-84) writes `viewStates[mode]` AND mirrors to top-level legacy fields (76-83); `toPersistedState()` (115-127) **omits undefined/empty values** (`filters: state.filters.length > 0 ? copy : undefined`, 122) — non-churny by construction.
**Implication (REQ-006, REQ-007):** adding `filterTree` to `ViewModeStateDef` (types.ts:164-173) + `create`/`toPersistedState` is ONE file edit with 3 tiny touches; the tree serializes exactly like filters do, omitted when empty root — zero new write paths, iCloud-safe (existing `scheduleConfigSave` debounce in DatabaseView.ts:452-453 + flush-on-deactivate at 1261-1263 + flush-on-activation at 1807-1812 already gates every config save). The filter panel's only persistence hook is `actions.saveState()` (FilterPanelRenderer.ts:13-14, called at 99/142/187/212/228/245/264/285) — the tree editor reuses it; no new save API.

### F7.2 — Legacy normalization is a pure function of existing fork helpers
REQ-005's flat→root-group adapter can be built directly on `createLegacySourceRuleTree` semantics (SourceRules.ts:48-59): `rules.length===0 → undefined` (→ empty root group ⇒ no-op); `rules.length===1 → single leaf`; else `{type:"group", logic, rules}`. For view filters the adapter is `normalizeViewFilters(filters, filterLogic) → { type:"group", logic: filterLogic, rules: filters.map(f => ({...f})) }` when `filters.length > 0`, else `undefined`/empty group. **Equivalence proof for REQ-003:** `applyFilters` with `logic==="and"` = `every(matchesFilter)`; `matchesSourceRuleTree` on a single group with `logic==="and"` = `every(matchesLeaf)` — identical row subsets given the same leaf matcher (F1.1/F1.2). Empty `filters` → `applyFilters` returns all rows (QueryEngine.ts:80) ≡ empty root AND-group returns true. The ONE behavioral fork to decide: `filterLogic==="or"` with EMPTY rules — flat path returns ALL rows (short-circuit at 80), while `matchesSourceRuleTree` on an empty OR group returns FALSE. Normalization must therefore keep the "no filters → no filtering" rule at the TOP level: `applyFilterTree` should treat `undefined` tree as no-op before evaluation (mirroring `applyFilters` line 80) — the empty-group semantics only matter for NESTED groups.

### F7.3 — The fork already prunes dead-field rules at hydration — the tree needs the same, recursively
`ViewStateStore.get()` (ViewStateStore.ts:40-55) prunes `state.filters` entries whose field is gone from the schema (line 46) and prunes hiddenColumns/sortRules/groupByField the same way. Anytype does the same (F4.3, dataview.ts:1241-1243). For the tree: prune dead-field LEAVES recursively at hydration; keep groups intact (a group left empty by pruning is a no-op under three-valued semantics, F2.2). This is the concrete answer to spec §8 "Unknown or malformed node kinds from persisted config are skipped with a console warning, never a crash" — `parseSourceRuleTree` (F1.3) does the shape-level skip; ViewStateStore does the field-existence-level skip.

### F7.4 — Empty-group handling: what each reference does (consolidated)
| Source | Empty group semantics | UI behavior |
|---|---|---|
| Fork `matchesSourceRuleTree` (SourceRules.ts:152) | AND→true, OR→false (nested OR poisoning, F2.2) | n/a |
| AppFlowy (controller.rs:483, 495) | `None` = SKIP (three-valued) | groups persist; no auto-collapse (F2.3) |
| Anytype (group.tsx:87-90) | evaluator in backend; UI auto-deletes group when last rule removed | auto-collapse |
| Notion (F6.1/F6.4) | not documented; editor deletes empty groups | auto-collapse |
**Recommendation for the view path:** three-valued evaluation (AppFlowy semantics — the ONLY reading that satisfies "empty group evaluates as a no-op" for both root and nested positions) + UI auto-collapse on last-rule-removal (Anytype/Notion parity), with persisted empty groups tolerated as no-ops (defensive, never crash). The existing `matchesSourceRuleTree` boolean walk stays untouched for the DATA-SOURCE path (out of scope); the view evaluator is a small three-valued variant in `ViewFilterTree.ts` (EuroFormat-pure, F1.4) or a `matchesViewFilterTree` wrapper.

## Ruled-out this iteration
- A separate persistence path for the tree: ruled out — ViewStateStore is the single round trip (F7.1).
- Changing `matchesSourceRuleTree` itself: ruled out — data-source semantics frozen (spec out-of-scope §3); three-valued logic lives in the view module.

## Next focus
Iteration 8: Mobile + iCloud safety deep-dive + panel UX synthesis — touch targets, width behavior, `db-panel-*` styles, existing source-rule editor patterns to mirror (ViewConfigPanelRenderer.ts 804-929), and the fork's i18n/`t()` conventions.

---

# Iteration 008 — Mobile-Safe Panel: Mirror the Fork's Own Source-Rule Editor, Not the References

**Status:** complete | **Focus:** Mobile/iCloud-safe UI + effectiveness semantics | **newInfoRatio:** 0.65

## Findings

### F8.1 — The fork ALREADY has a recursive group editor with mobile-safe CSS
`ViewConfigPanelRenderer.ts` `renderSourceRules`/`renderSourceRuleNode`/`renderSourceRuleGroup`/`renderSourceRuleLeaf` (804-929) is the exact interaction model the view filter tree needs:
- Entry (`renderSourceRules`, 804-844): builds an editable root via `createEditableSourceRuleRoot(getSourceRuleTree(...))`; every mutation goes through a single `commit(next)` that writes the tree and clears legacy flat fields (821-826); empty state + add rule/group/expression buttons (832-843).
- Dispatcher (`renderSourceRuleNode`, 846-876): group/not/expression/leaf branches; `not` gets a labeled wrapper with removeNot/remove actions (858-869).
- Group (`renderSourceRuleGroup`, 878-929): header = logic dropdown + add rule/group/expression/not + remove icon buttons (888-916); children loop with **per-index `onReplace` that splices on undefined** (921-927) — i.e. delete-by-position, exactly the positional surgery the view panel needs (F2.1 said ids aren't required; here's the proof pattern).
- The CSS (`styles.css:9165-9229`) is the mobile-safe language: **indentation via `border-left: 2px solid var(--background-modifier-border); padding-left: 7px` on `.db-source-rule-node`** (9181-9185) — a cheaper, cleaner depth cue than Anytype's 16px padding + box (F5.1), and already themed; leaf rows are flex with `min-width: 0` + `flex: 1 1 180px/130px` (9209-9219) so rows shrink and truncate at mobile width; dropdowns are `minmax(0,1fr)` grids with 30px min-height (9221-9229).
**Recommendation (REQ-004, NFR-R01):** render view filter groups with the SAME structure — `.db-filter-tree-*` classes mirroring `.db-source-rule-*` (border-line indentation, flex leaf rows, header action buttons), i18n via existing `t()` keys (i18n.ts), no new CSS framework, no desktop-only APIs. This also answers spec §6's risk row ("reuse existing source-rule editor interaction patterns") with a concrete, cited implementation to copy.

### F8.2 — Effectiveness semantics must be preserved through the tree
`RowPipeline.ts:94` pre-filters rules with `getEffectiveFilterRules(state.filters, validFields)` BEFORE `applyFilters` (96). `isEffectiveFilterRule` (FilterRules.ts:3-12): no field → false; field not in validFields → false; `empty`/`notempty` always effective; other ops require non-empty trimmed value. **Tree parity requirement:** `applyFilterTree` must apply the same leaf-effectiveness prune RECURSIVELY before evaluation. Because pruning is per-leaf and semantics are positional, a pruned leaf in an AND group ≡ dropped rule in flat mode; in an OR group ≡ dropped rule in flat mode — so recursive prune + three-valued evaluation keeps REQ-003/REQ-005 equivalence exactly, AND prevents an in-progress (empty-value) rule from poisoning an OR group. Groups left empty after pruning evaluate as no-op (F7.4).

### F8.3 — iCloud safety is already architected; the tree adds nothing
Verified chain (F7.1): panel mutations → `actions.saveState()` → ViewStateStore.persist (omits empty/undefined fields, ViewStateStore.ts:115-127) → `scheduleConfigSave()` debounce (DatabaseView.ts:452-453) with flush on deactivate/activation (1261-1263, 1807-1812). The tree field rides this exact path — **no new write trigger, no churny writes** (REQ-006). Concurrency: two clients editing one config remains documented last-write-wins via the existing debounce; the tree adds no new race (same field set).

### F8.4 — UI depth cap (parity with Notion's 3 levels)
Notion caps nesting at 3 (F6.1). The fork's source-rule editor has no cap; for the view panel, recommend: evaluator unbounded; UI shows a depth counter and hides/ghosts the "add group" affordance at depth 3 (a one-line `depth >= 3` guard in the group header, mirroring `renderSourceRuleGroup`'s button row at 901-916). Cheap, parity-aligned, and mobile-friendly (fewer nested controls at narrow widths).

## Ruled-out this iteration
- Anytype's 16px-padding + border-box group chrome over the fork's existing border-line indentation: the fork's established pattern wins (F8.1).
- A new CSS file or theme variables: reuse `.note-database-container` scoping + existing vars (F8.1).

## Next focus
Iteration 9: Algorithm/performance + module-shape synthesis — finalize ViewFilterTree.ts API surface (pure helpers + callback matcher), applyFilterTree integration points, evaluation complexity proof, and the exact ≤3 call-site list.

---

# Iteration 009 — Module API Surface, Algorithm Proof, Call-Site Inventory, Test Infra

**Status:** complete | **Focus:** ViewFilterTree.ts API + integration + complexity + test layout | **newInfoRatio:** 0.80

## Findings

### F9.1 — Final module shape (resolves the F1.4 open decision)
Two-layer design that satisfies BOTH the EuroFormat isolated-module model AND the spec's "add `applyFilterTree` to QueryEngine":
- **`src/data/ViewFilterTree.ts` (new, pure, EuroFormat-shaped)**: zero repo imports; exports
  1. `normalizeViewFilterTree(value: unknown): SourceRuleNode | undefined` — wraps `parseSourceRuleTree` + top-level `?? undefined` convention (F1.3/F7.2);
  2. `buildViewFilterTree(filters: FilterRule[], logic): SourceRuleNode | undefined` — legacy adapter in the `createLegacySourceRuleTree` shape (F7.2);
  3. `pruneIneffectiveLeaves(tree, isEffective: (leaf) => boolean): SourceRuleNode | undefined` — recursive effectiveness prune (F8.2) + dead-field prune (F7.3);
  4. `evaluateViewFilterTree(tree, matchesLeaf): boolean` — three-valued walk with empty-group SKIP (F2.2/F7.4), signature-mate of `matchesSourceRuleTree(tree, matchesLeaf, matchesExpression)` (SourceRules.ts:144-156);
  5. `serializeViewFilterTree(tree)` — passthrough/stable-key JSON for round-trip tests (REQ-006).
- **`QueryEngine.applyFilterTree(rows, tree, columns)` (call-site edit in QueryEngine.ts)**: builds the same `columnMap` as `applyFilters` (QueryEngine.ts:81), passes `(leaf) => this.matchesFilter(row, leaf, columnMap.get(leaf.field))` as the matcher — **`matchesFilter` stays private**; the adapter is the only bridge. Empty/undefined tree → return rows (mirrors line 80).

### F9.2 — Complexity proof (NFR-P01)
Let R = row count, N = node count, D = max depth. `evaluateViewFilterTree` visits each node ≤ once per row with short-circuits (AND: first false; OR: first true — same as AppFlowy controller.rs:487-499 and the flat path's `.every`/`.some`, QueryEngine.ts:83-87). Cost: O(R·N) worst case, O(R·(N−k)) with short-circuit, memory O(D) stack. No per-row cache needed (AppFlowy's DashMap cache is a differential-refresh optimization for live edits, F2.4 — optional future work). Thousands of rows × tens of nodes = tens of thousands of matcher calls per refresh, each `getFieldValue` + `getComparableValues` — the same per-leaf cost the flat path already pays (QueryEngine.ts:92-93). **Linear pass claim holds; no memoization required for this phase.**

### F9.3 — The ≤3 call-site edit list (REQ-007), now fully evidenced
1. **`src/data/types.ts`**: add `filterTree?: SourceRuleNode` to `ViewModeStateDef` (164-173) + `ViewConfig` (301+) — 2 additive lines, no existing line touched.
2. **`src/views/ViewStateStore.ts`**: `create()` hydration (86-113), `toPersistedState()` (115-127), `persist()` mirror write (69-84) + recursive dead-field prune in `get()` (46) — one file, ~5 additive lines.
3. **`src/data/QueryEngine.ts`**: `applyFilterTree` method + leaf adapter (~15 lines, additive).
4. **`src/data/RowPipeline.ts`**: route through `applyFilterTree` when a tree exists else legacy path (line 94-96) — 1-2 lines.
Plus the spec-mandated UI edit in `FilterPanelRenderer.ts` (tree editor rows; mirrors ViewConfigPanelRenderer.ts:804-929). That is exactly the EuroFormat diff model: **1 new module + ≤3 core call-site edits**, panel UI as the fourth scoped change per spec's Files-to-Change table.

### F9.4 — Test infrastructure gap (verified): the fork has NO tests yet
`vitest.config.ts` includes `src/**/*.test.ts` with `setupFiles: ["src/__tests__/setup.ts"]` — but `src/__tests__/` does NOT exist and there are zero `.test.ts`/`.spec.ts` files in the fork (verified by find). **Phase 1/3 must scaffold `src/__tests__/setup.ts` (minimal no-op) and add `src/data/__tests__/ViewFilterTree.test.ts`** (the spec's exact path, now confirmed as the natural layout). The first vitest run will fail on the missing setup file otherwise. Test cases per spec: `(A and B) or C`, `not` wrapping group, empty groups (root + nested), single-rule ≡ flat, serialization round-trip (stable-key), legacy normalization equivalence vs `applyFilters`.

### F9.5 — Phase 010 consumer surface (REQ-008)
`ConditionalFormatting.ts:38` — `queryEngine.applyFilters([row], [rule.condition], "and", columns)` — is the single-rule consumer phase 010 replaces with the tree. The export surface 010 needs: the `SourceRuleNode`-based tree type + `evaluateViewFilterTree` (or `QueryEngine.applyFilterTree` for row sets). No additional API required; the module as specced (F9.1) unblocks 010 unchanged.

## Ruled-out this iteration
- Exporting `matchesFilter` publicly: NOT needed — the QueryEngine adapter bridges without it (F9.1).
- A per-row result cache (AppFlowy-style) in this phase: NOT needed for NFR-P01 (F9.2).

## Next focus
Iteration 10 (final): Cross-verification pass — re-check the two strongest claims (three-valued empty-group semantics; call-site count) against fresh reads, then consolidate the ranked enrichment for synthesis.

---

# Iteration 010 — Cross-Verification + Notion API Filter Model (Final Loop Iteration)

**Status:** complete | **Focus:** Final verification + Notion API filter object | **newInfoRatio:** 0.60

## Findings

### F10.1 — Notion's API filter object: recursive and/or with NO documented depth cap
`https://developers.notion.com/reference/post-database-query-filter` defines the filter object:
- **Leaf**: `{ "property": "<name|id>", "<type>": { <condition> } }` — property + type-specific condition object (checkbox/date/select/status/rich_text/... each with equals/does_not_equal/contains/is_empty/is_not_empty/relative-dates etc.).
- **Compound**: `{ "and": [ ...filter objects ] }` / `{ "or": [ ...filter objects ] }` — recursive; the doc's own example is exactly `(Done) and (Tags contains A or Tags contains B)` — the spec's `(A and B) or C` shape.
- The page explicitly notes: *"The filter object mimics the database filter option in the Notion UI"* — API ⇄ UI parity.
- **The API is unbounded in depth even though the UI caps at 3 layers** (F6.1) — final confirmation that a depth cap is a UI affordance, not a semantic constraint. The fork should mirror this: evaluator unbounded, editor caps at 3.

### F10.2 — Cross-verification of the two load-bearing claims
1. **Three-valued empty-group semantics (AppFlowy)** — re-read controller.rs:475-542 during iteration 2; `And/Or` with `children.is_empty() → None`, top-level `filter_row` AND-combines only `Some(...)` (449-472). CONFIRMED as read directly, no second-hand source.
2. **Fork's nested empty-group poisoning** — re-derived from SourceRules.ts:152 (`rules.length === 0 → logic === "and"`): an empty AND group nested under OR forces `some(...)` to true ⇒ whole OR matches every row. CONFIRMED by direct code read; the divergence from AppFlowy is structural, not stylistic.
3. **Call-site inventory** — types.ts (ViewModeStateDef 164-173, ViewConfig 301+), ViewStateStore.ts (69-127), QueryEngine.ts (additive method), RowPipeline.ts (94-96), FilterPanelRenderer.ts (UI). All paths read directly across iterations 1/7/9. No conflicting evidence found.

### F10.3 — Residual open questions (low severity, no blocking)
- Exact `db-panel-*` CSS values for the filter popover width at narrow screens were not measured (no live vault run in research scope; manual verification remains in the phase's checklist).
- Whether the fork wants a chip-flow (AppFlowy) vs row-list (existing panel) leaf presentation at mobile width is a design call for implementation; research recommends keeping the existing row-list + flex-shrink behavior (F8.1) since the panel is a popover, not a toolbar.

## Ruled-out this iteration
- Nothing new; all prior ruled-out directions stand (no new evaluator, no second parser, no id-based surgery, no per-row cache, no public matchesFilter, no separate persistence path, no 3-level evaluator cap).

## Next focus
SYNTHESIS: consolidate all 10 iterations into the ranked, evidence-cited enrichment (research.md).

---
