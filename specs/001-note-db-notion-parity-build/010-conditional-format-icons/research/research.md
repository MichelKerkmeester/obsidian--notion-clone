# Deep Research: Conditional Formatting Multi-Condition and Icons

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `lineages/deepseek-flash-max`. Stop reason: max_iterations. Average newInfoRatio: 0.725.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 001 — Fork Source Grounding + Notion CF Parity Target

**Status:** complete | **Focus:** Fork baseline contract + Notion behavior | **newInfoRatio:** 0.95

## Focus
Capture the exact current conditional-format contract in the fork (types, shared helper, all call sites, editor UI, icon infrastructure) and the Notion conditional-color behavior the fork is chasing, so every later iteration argues against a real baseline.

## Actions Taken
1. Read `src/data/ConditionalFormatting.ts` (69 lines, full).
2. Read `src/data/types.ts` key regions: `FilterRule` (137-141), `ConditionalFormatRule` (143-152), `SourceRuleNode` family (234-250), `ViewConfig.conditionalFormats` (405).
3. Read `src/data/QueryEngine.ts` (74-127: `applyFilters` + `matchesFilter`).
4. Read `src/data/SourceRules.ts` (144-156 `matchesSourceRuleTree`; 227-257 `parseSourceRuleTree`).
5. Grep all call sites of `applyConditionalFormat`/`getConditionalFormatMatch` (10 files).
6. Read `src/views/ViewConfigPanelRenderer.ts` `renderConditionalFormatting` (552-766).
7. Read `src/data/RecordIcon.ts` + `IconPickerCatalog.ts` (icon token infra).
8. WebFetch Notion: help-center guide "Using advanced database filters"; web search + fetch "Notion conditional color formatting" (Thomas Frank guide) and Notion help "Database properties" conditional color section.

## Findings

### F1.1 — The shared path is already a single-condition, first-match, color-only evaluator
`getConditionalFormatMatch` (ConditionalFormatting.ts:23-42) walks `config.conditionalFormats` in list order, skips rules without `id`/`condition.field` (line 31), filters by `target` ("field" rules match only when `targetField` equals `condition.field` at 32-36), resolves the dynamic `valueSource === "today"` date (12-21), and evaluates the condition via `queryEngine.applyFilters([row], [rule.condition], "and", config.schema.columns).length === 0 → continue` (line 38). First match returns `{ color: rule.color || "gray", ruleId }` (line 39). Legacy behavior: one `FilterRule` per rule, background color only, first-match.
[SOURCE: file:/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/ConditionalFormatting.ts:23-42]

### F1.2 — The result contract is CSS variables + one data attribute, applied by a single mutating function
`applyConditionalFormat` (44-69) removes six CSS custom properties plus the class `db-conditional-format` and the `data-note-database-conditional-rule` attribute, then on match sets `--db-conditional-format-bg/-fg`, `--card-bg/--card-accent`, `--db-calendar-event-bg/-accent` from `var(--status-color-bg-<color>)`/`var(--status-color-fg-<color>)` and the rule-id attribute. **All ten consumer files call this same function** — TableRenderer (34, 463, 503), ListRenderer (65, 156, 237, 586), BoardRenderer (80, 495, 643, 1100), GalleryRenderer (67, 165, 243, 626), CalendarRenderer (54, 227, 355, 584, 652, 750), CalendarTimelineRenderer (120, 448), RecordDetailPanel (45, 161, 236), EmbeddedDatabaseRenderer, DatabaseView — through an injected `actions.applyConditionalFormat?.(element, row, config, targetField?)` interface. No renderer walks rules itself: the spec's REQ-002/SC-004 ("no second CF predicate walker") is already true today and must stay true.
[SOURCE: file:.../src/data/ConditionalFormatting.ts:44-69; file:.../src/views/TableRenderer.ts:34,463,503; file:.../src/views/ListRenderer.ts:65,156,237,586; file:.../src/views/BoardRenderer.ts:80,495,643,1100; file:.../src/views/GalleryRenderer.ts:67,165,243,626; file:.../src/views/CalendarRenderer.ts:54,227,355,584,652,750; file:.../src/views/CalendarTimelineRenderer.ts:120,448; file:.../src/views/RecordDetailPanel.ts:45,161,236]

### F1.3 — Additive type surface is small and well-bounded
`FilterRule` is `{ field, op, value? }` with `FilterOperator = eq|neq|contains|hasTag|gt|lt|gte|lte|empty|notempty` (types.ts:135-141). `ConditionalFormatRule` is `{ id, condition: FilterRule, valueSource?: "literal"|"today", target: "record"|"field", targetField?: (deprecated), color: StatusColor }` (143-152). Adding an optional `conditionTree?: SourceRuleNode` (or the 009 `ViewFilterTree` shape), `icon?: string`, `bold?: boolean` is purely additive; `DataSource.parseConditionalFormats` (DataSource.ts:800-825) currently whitelist-parses `field/op/value/color` so legacy JSON without the new keys keeps loading (NFR-R01).
[SOURCE: file:.../src/data/types.ts:135-152; file:.../src/data/DataSource.ts:800-825]

### F1.4 — The recursive AND/OR/NOT tree the spec wants already exists in-repo
`matchesSourceRuleTree(tree, matchesLeaf, matchesExpression)` (SourceRules.ts:144-156) walks `SourceRuleNode`: leaf → `matchesLeaf`; `expression` → `matchesExpression` (default false); `not` → negation; `group` → `.every` for `and`, `.some` for `or`; empty group → `logic === "and"` (AND = no-op pass, OR = false). `parseSourceRuleTree` (227-257) defensively parses persisted trees (drops invalid nodes, normalizes logic, stringifies values). Phase 009 (`009-view-filter-tree/spec.md` REQ-002) explicitly forbids a new AST and reuses this exact tree through a new `src/data/ViewFilterTree.ts` + `QueryEngine.applyFilterTree`; REQ-008 makes the tree export the phase-010 consumption point. **The 009 design is the authoritative AND/OR source for CF** — no third dialect.
[SOURCE: file:.../src/data/SourceRules.ts:144-156,227-257; file:specs/obsidian/002-note-db-notion-parity-build/009-view-filter-tree/spec.md:60-66,88-95,100-110]

### F1.5 — The CF editor is a per-rule single-condition form with reorder/delete; it is the UI extension point
`renderConditionalFormatting` (ViewConfigPanelRenderer.ts:552-766) renders one row per rule: field dropdown, operator dropdown, value input (option dropdown for select/status/multi-select, date picker with dynamic-today footer action, text/number input otherwise), target dropdown (`record`|`field`), color swatch via `openOptionColorPicker`, then move-up/move-down/delete controls. New rules are created with `condition: { field: firstField, op: "eq", value: "" }, valueSource: "literal", target: "record", color: "red"` (573-579). This is the only CF editing surface; multi-condition groups and icon/bold controls extend it, not a new panel.
[SOURCE: file:.../src/views/ViewConfigPanelRenderer.ts:552-766]

### F1.6 — The fork already owns an icon-token dialect: reuse it for the CF icon attribute
`RecordIcon.parseRecordIconToken` (RecordIcon.ts:27-38) accepts exactly two shapes: a single emoji grapheme (via `Intl.Segmenter`, 20-25) or `lucide:<id>@<color>` with a validated id set and 16-color palette (`RECORD_ICON_COLORS`, 3-8). `RecordIconRenderer.renderRecordIcon` (RecordIconRenderer.ts:18-33) paints emoji spans or lucide icons with `db-record-icon-color-<color>` classes. `DatabaseConfig.icon` documents the same token format ("emoji grapheme or lucide:<id>@<color>", types.ts:259-260). **The CF `icon` attribute should store this same token dialect** — zero new representation, mobile-safe (no vault paths), and the renderer already exists. This answers spec Open Question 1 ("icon attribute representation UNKNOWN") with in-repo evidence.
[SOURCE: file:.../src/data/RecordIcon.ts:3-38; file:.../src/views/RecordIconRenderer.ts:18-33; file:.../src/data/types.ts:259-260]

### F1.7 — Notion parity target: per-view, multi-rule, first-match, row-or-property color; no icons/bold in Notion CF
Notion's "Conditional color" (launched 2023, per Thomas Frank guide): view-settings → Conditional Color; per-view rules (duplicate view duplicates settings); **multiple rules per view with the highest/earliest rule winning** ("If a page matches more than one rule, it'll inherit the color of the highest rule that it matches"); `Apply to` (table view) chooses whole row or just the rule's property; for select/multi-select/status the default is `Match Option` (color follows the option's color); rule criteria are per-property (Is / Is Not / Is Empty / Is Not Empty for status; date comparisons etc.); supported layouts: table/board/timeline/calendar/list/gallery/feed — **not Chart** (own color) and not Form; supported properties: Name/Text/Number/Select/Multi-Select/Status/Date/Owner/Person/Checkbox/Created/Last-edited time+by — **not** Phone/Email/URL/Files/Relation/Rollup/Formula/Button/ID/Verification. Conditional color applies at the page level for all viewers (not personal like filters). Notion's CF has **no AND/OR within a rule and no icons/bold**; AND/OR grouping lives only in advanced *filters* ("Filter groups are useful when combining AND logic and OR logic in your filter"). Notion expresses bold+color via formula `style(value, "red", "b")` instead. **Parity conclusion:** the fork's `target: record|field` maps to Notion's Apply-to row/property; multi-rule first-match matches Notion exactly; multi-condition AND/OR per rule is a *superset* the fork adds via the 009 tree; icon+bold is also a superset — both must stay backward compatible with Notion-like single-condition color rules (REQ-004).
[SOURCE: https://thomasjfrank.com/notion-conditional-color-formatting-everything-you-need-to-know/ ; https://www.notion.com/help/database-properties (Conditional color section); https://www.notion.com/help/guides/using-advanced-database-filters]

### F1.8 — Key-reference hygiene points exist that a multi-condition change must keep intact
`ColumnOperations.ts:193` iterates `view.conditionalFormats` to rewrite renamed column keys in `rule.condition.field`, and `:370` filters rules on column delete. A tree-typed condition must be walked with the same key-rewrite/removal semantics (`updateSourceRuleTreeKeyReferences` / `removeSourceRuleTreeReferences`, SourceRules.ts:183-225, already exist for source trees). Also `EmbeddedDatabaseRenderer.ts:3360` treats `conditionalFormats` as a view display setting excluded from structural change detection — tree edits must not trigger view reload churn (iCloud-safe).
[SOURCE: file:.../src/views/ColumnOperations.ts:193,370; file:.../src/data/SourceRules.ts:183-225; file:.../src/views/EmbeddedDatabaseRenderer.ts:3360]

## Questions Answered
- Q1 (fork baseline): Answered — current contract captured above (F1.1-F1.6).
- Q5 (Notion parity target): Answered at the behavioral level (F1.7); CF-internal AND/OR + icon/bold are deliberate supersets.

## Questions Remaining
- Q2 (009 tree reuse mechanics — leaf adapter, normalization, first-match wiring) — next iterations.
- Q3/Q4 (AppFlowy/Anytype reference implementations) — next iterations.
- Q6 (icon/bold result shape + painting) — F1.6 gives the token dialect; result/rendering design still open.
- Q7 (editor UI for groups), Q8 (edge cases), Q9 (mobile/iCloud/perf), Q10 (diff hygiene).

## Next Focus
Iteration 2: AppFlowy — Rust grid filter tree (`appflowy/frontend/rust-lib/flowy-database2/src/services/filter/`) data model + evaluation semantics + Flutter filter UI, mapped onto the fork's `matchesSourceRuleTree` semantics.

---

# Iteration 002 — AppFlowy: Filter Tree Model, Evaluation Semantics, UI

**Status:** complete | **Focus:** AppFlowy grid filter tree as multi-condition reference | **newInfoRatio:** 0.90

## Focus
Mine AppFlowy's Rust grid model (`appflowy/frontend/rust-lib/flowy-database2/src/services/filter/`) and Flutter UI (`appflowy/frontend/appflowy_flutter/lib/plugins/database/`) for the filter-tree data model, evaluation semantics, tree-editing operations, and UI patterns — and map each onto the fork's `SourceRuleNode`/`matchesSourceRuleTree`/CF design.

## Actions Taken
1. Read `services/filter/entities.rs` — `Filter` struct + `FilterInner`, `is_empty`, `find_filter`, `find_parent_of_filter`, `convert_to_and_or_filter_type`, `insert_filter`, `update_filter_data`, `delete_filter`.
2. Read `services/filter/controller.rs` — `apply_changeset` (152-215), `filter_rows` (386-409), `filter_row` (449-473), `apply_filter` (475-519), `fill_cells` (219-260+).
3. Read `entities/filter_entities/util.rs` — `FilterType` (Data/And/Or) + recursive `FilterPB` proto (37-50).
4. Read Flutter `grid/presentation/widgets/filter/filter_menu.dart` (15-72) + `filter_menu_item.dart` (31-50) + `create_filter_list.dart`.
5. Read `grid/application/filter/filter_editor_bloc.dart` event surface (185-198).

## Findings

### F2.1 — AppFlowy's persisted filter model is a recursive three-node tree: Data | And | Or
`FilterType { Data=0, And=1, Or=2 }` (util.rs:20-27) and the protobuf `FilterPB { id, filter_type, children: Vec<FilterPB>, data?: FilterDataPB }` (util.rs:37-50) — group nodes carry `children`, data nodes carry `{ field_id, field_type, data }` (util.rs:51-60). This is structurally identical to the fork's `SourceRuleNode` (leaf without `type` | `group {logic, rules}` | `not`), except AppFlowy has no `not` node and uses `FilterType` instead of a `type` discriminator. **Persistence parity:** the fork's tree shape (JSON) is at least as expressive; no model change needed for CF conditions.
[SOURCE: file:.../context/appflowy/frontend/rust-lib/flowy-database2/src/entities/filter_entities/util.rs:20-60]

### F2.2 — Evaluation semantics: recursive AND/OR with empty-group no-op, short-circuit, top-level implicit AND
`apply_filter` (controller.rs:475-519): `And` → empty children = `None` (no-op, skipped by caller); else short-circuit on first false → `Some(true)` if all pass. `Or` → empty children = `None`; else short-circuit on first true → `Some(false)` if none pass. `Data` → field lookup; **missing field → `Some(false)`** (502-506), **field-type mismatch → `Some(false)`** (507-510). `filter_row` (449-473) AND-combines top-level filters (`new_is_visible = new_is_visible && is_visible`) with short-circuit break and caches the result per row in a `DashMap`. **Mapping to the fork:** `matchesSourceRuleTree` (SourceRules.ts:144-156) already implements the same recursion; the one semantic difference is the empty group — AppFlowy returns no-op for empty AND *and* OR (482-497), the fork returns `logic === "and"` (AND pass / OR fail). For CF fail-closed (spec §8 "Empty condition tree or missing predicate: rule does not match"), CF should explicitly treat an empty tree as non-match — a one-line decision in the CF wrapper, not in the shared walker.
[SOURCE: file:.../context/appflowy/frontend/rust-lib/flowy-database2/src/services/filter/controller.rs:449-519; file:.../src/data/SourceRules.ts:144-156]

### F2.3 — Tree editing is parent-id based; type conversion wraps Data into And/Or groups
`FilterChangeset::Insert { parent_filter_id, data }` (controller.rs:154-168): a new filter can be inserted into *any* named parent group (recursive `find_filter`); `None` pushes to root. `UpdateType` (185-199) calls `convert_to_and_or_filter_type` (entities.rs:89-113): a Data filter converts into an And/Or group **containing itself as child**; an And group converts to Or (and vice-versa) preserving children. `UpdateData` is rejected on group nodes (entities.rs:159-172). `Delete` (421-446) finds the parent of the target id (`find_parent_of_filter`, entities.rs:66-86) and splices the child. **Mapping:** this is the tree-editing contract a CF editor needs; the fork can implement the same ops over `SourceRuleNode` — group-ify leaf (wrap in `{type:"group", logic, rules:[leaf]}`), toggle group logic, delete via `removeSourceRuleTreeReferences`-style splice (SourceRules.ts:208-225 already handles key removal; a child-splice variant is a pure helper).
[SOURCE: file:.../context/appflowy/frontend/rust-lib/flowy-database2/src/services/filter/controller.rs:152-215,421-446; file:.../src/data/SourceRules.ts:208-225]

### F2.4 — Recursive cascade delete on field removal is a first-class op — the fork must mirror it
`FilterChangeset::DeleteAllWithFieldId { field_id }` (controller.rs:205-210) recursively collects and deletes every filter node referencing a field (`find_all_filters_with_field_id`, entities.rs). **Mapping:** the fork's `ColumnOperations.ts:370` filters `view.conditionalFormats` on column delete and `:193` rewrites renamed keys — both must walk the CF condition *tree* recursively. `updateSourceRuleTreeKeyReferences` / `removeSourceRuleTreeReferences` (SourceRules.ts:183-225) already provide exactly this for source trees; reusing them for CF condition trees keeps key hygiene single-sourced.
[SOURCE: file:.../context/appflowy/frontend/rust-lib/flowy-database2/src/services/filter/controller.rs:205-210; file:.../src/views/ColumnOperations.ts:193,370; file:.../src/data/SourceRules.ts:183-225]

### F2.5 — Cell prefetch is filter-driven (perf pattern for NFR-P01)
`fill_cells` (controller.rs:219-260+) walks the tree (`get_min_effective_filters`) and fetches only cells for fields referenced by effective filters, deduplicating field ids. **Mapping:** the fork's CF already evaluates per visible row inside the shared helper (NFR-P01: no second full-table scan). The AppFlowy pattern is not needed for CF (evaluation is per-row, cells are already loaded), but it validates that tree traversal is a single linear pass — `matchesSourceRuleTree` recursion is O(tree) per row, which is the NFR-P02 target.
[SOURCE: file:.../context/appflowy/frontend/rust-lib/flowy-database2/src/services/filter/controller.rs:219-260]

### F2.6 — AppFlowy's filter UI is a compact chip list, not a tree editor (yet)
`FilterMenu` (filter_menu.dart:15-72) renders `state.filters` as `FilterMenuItem` chips in a `Wrap` plus an `AddFilterButton`; each chip is a field-type-specific "choicechip" combining field+condition+value inline (`filter_menu_item.dart:31-50` switches on `FieldType` → Text/Number/URL/Checkbox/Checklist/Date/Select chips). The And/Or tree types exist in the model/proto but the grid UI does not yet expose group editing (no Flutter call sites for `parent_filter_id`/group insert). **Mapping for the CF editor (Q7):** a chip-per-rule Wrap is the proven compact pattern at mobile width; the fork's current CF editor (ViewConfigPanelRenderer:552-766) is a vertical rule-row list — a Wrap of chips could be the mobile presentation, with group controls (Add group / toggle AND-OR) following Anytype's group UI (iteration 3). The Rust-side model proves tree editing can live entirely behind list-style operations.
[SOURCE: file:.../context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/presentation/widgets/filter/filter_menu.dart:15-72; file:.../filter_menu_item.dart:31-50]

## Questions Answered
- Q3 (AppFlowy reference): Answered — model (F2.1), evaluation (F2.2), editing ops (F2.3-F2.4), perf (F2.5), UI (F2.6).

## Questions Remaining
- Q4 (Anytype advanced groups) — iteration 3.
- Q2 (009 tree consumption mechanics) — iteration 4.
- Q6/Q7 (result shape, editor UI) — partially informed (F2.6), still open.

## Next Focus
Iteration 3: Anytype — `Filter`/`nestedFilters`/`FilterOperator`, `flattenFilters` AND-splice behavior, advanced filter group UI (`component/block/dataview/filters/`), and how a group becomes `{relationKey: '', operator, nestedFilters}`.

---

# Iteration 003 — Anytype: Advanced Filter Groups (nestedFilters + operator)

**Status:** complete | **Focus:** Anytype advanced filter group model, evaluation flattening, recursive group UI | **newInfoRatio:** 0.85

## Focus
Mine Anytype's dataview filter implementation (`anytype-ts/src/ts`): the `Filter` interface with `nestedFilters`/`operator`, the group-UI components under `component/block/dataview/filters/`, the flatten/evaluation helpers in `lib/dataview.ts` and `lib/relation.ts` — and map each onto the fork's CF multi-condition design.

## Actions Taken
1. Read `interface/block/dataview.ts` — `FilterOperator` (55-58), `FilterCondition` (60-78), `Filter` interface (138-148).
2. Read `model/filter.ts` — Filter class with nestedFilters coercion.
3. Read `lib/dataview.ts` — `flattenFilters` (780-800), `isAdvancedFilter` (1212-1213), `getDetails` filter consumption (742).
4. Read `lib/relation.ts` — `isFilterActive` (470-488), advanced-group detection (479-481).
5. Read `component/block/dataview/filters/group.tsx` (full) — group head, add/remove/update/turn-into-group ops, recursive render.
6. Read `component/block/dataview/filters/rule.tsx` (head) and `advanced.tsx` (full).

## Findings

### F3.1 — The advanced-group shape is a filter whose relationKey is empty: `{ relationKey: '', operator: And|Or, condition: None, nestedFilters: [...] }`
`FilterOperator { None=0, Or=1, And=2 }` (dataview.ts:55-58); `Filter { id?, relationKey, condition, value, operator?, format?, quickOption?, includeTime?, nestedFilters? }` (138-148). `Relation.isFilterActive` classifies a filter as advanced when `relationKey == '' && operator ∈ {And, Or}` (relation.ts:479-481); `Dataview.isAdvancedFilter` (dataview.ts:1212-1213) is the same test. **Mapping:** the fork's `SourceRuleNode` group node (`{type:"group", logic, rules}`) is the same idea with an explicit `type` discriminator instead of empty-key inference — safer for the fork because a CF condition group needs no sentinel key.
[SOURCE: file:.../context/anytype-ts/src/ts/interface/block/dataview.ts:55-58,138-148; file:.../src/ts/lib/relation.ts:470-481; file:.../src/ts/lib/dataview.ts:1212-1213]

### F3.2 — Display flattening: AND-groups splice flat into the parent list; OR-groups stay nested
`flattenFilters` (dataview.ts:780-800): for each filter, if advanced AND → recursively flatten children into the result (the group node itself disappears — semantically valid because AND-of-children ≡ children joined by AND at the parent level); if advanced OR → the group is *kept* as an opaque item; leaves pass through. The filter popup preview (`getDetails`, 742) then consumes the flattened list. **Mapping:** this is a UI/display optimization, not evaluation semantics; it shows AND-groups are "transparent" at any level, which is exactly why `matchesSourceRuleTree` with `.every` short-circuit is sufficient for the fork — no flattening pass is needed for correctness. The fork should NOT adopt the flattening trick in the evaluator (single-pass recursion is already O(tree)).
[SOURCE: file:.../context/anytype-ts/src/ts/lib/dataview.ts:780-800,742]

### F3.3 — The group UI is a recursive tree editor: per-group operator toggle, add-rule, turn-into-group, delete-last-rule-deletes-group
`group.tsx`: `getHead` renders "Where" for the root (index 0) and an operator And/Or `Select` for index 1 (140-149), i.e. the root list is itself a group whose operator is editable; deeper groups show the operator as a label (166-172). `getItems` (174-200+) maps each `nestedFilters` child to a `Rule` or — when `isGroup` (operator ∈ {And,Or}, 112-114) — a recursive `DataviewFilterGroup` with `depth+1` and path-based node ids (`rule-${parentPath}-${index}`). Ops: `onRuleAdd` appends a default rule (`{relationKey:'name', condition: firstTextCondition, value:''}`, 66-80); `onRuleRemove` splices, and **removing the last child deletes the whole group** (82-94); `onOperatorChange` toggles the group's operator (96-98); `onTurnIntoGroup` wraps an existing rule in a fresh `{operator: And, relationKey:'', condition: None, nestedFilters:[rule]}` group (100-110). Persistence goes through `view.setFilter` + `BlockDataviewFilterReplace` gRPC (123-126). `advanced.tsx` renders a collapsed OR-group as a chip with "N rules".
**Mapping (Q7):** this is the strongest UI reference for the CF rule editor. The fork's CF editor (ViewConfigPanelRenderer:552-766) should keep its per-rule row but add: a group wrapper per rule (root condition group with And/Or toggle), per-group "add condition" row, "turn into group" on a condition, and delete-last-condition-deletes-group semantics — all against a `SourceRuleNode` tree. AppFlowy's Rust ops (iteration 2, F2.3) and Anytype's UI ops (F3.3) agree operation-for-operation, which de-risks the editor design.
[SOURCE: file:.../context/anytype-ts/src/ts/component/block/dataview/filters/group.tsx:66-200; file:.../filters/rule.tsx:1-40; file:.../filters/advanced.tsx:30-60]

### F3.4 — Condition sets are filtered by relation format; Empty/NotEmpty need no value
`rule.tsx` derives `conditionOptions = Relation.filterConditionsByType(relation.format)` and hides the value editor for `Empty`/`NotEmpty` (getValue returns null, rule.tsx:76-80). **Mapping:** the fork already does the equivalent per column type — `getFilterOperatorsForColumn` + `valueDisabled` for empty/notempty (ViewConfigPanelRenderer.ts:593,642-645). The CF editor must reuse the same operator sets for tree leaves; the 009 leaf adapter maps a `SourceRule` leaf (field/op/value) onto `matchesFilter` column-aware semantics (iteration 1 F1.4).
[SOURCE: file:.../context/anytype-ts/src/ts/component/block/dataview/filters/rule.tsx:76-80; file:.../src/views/ViewConfigPanelRenderer.ts:593,642-645]

### F3.5 — Active-state propagation is recursive; None-condition rules are inert
`Relation.isFilterActive` (relation.ts:470-488) recurses into groups (a group is active when any child is active) and treats `condition == None` as inactive. **Mapping:** for the CF editor's "rule is configured" affordance, the fork can mirror this: a condition tree is "meaningful" when at least one leaf is non-default; the evaluator treats missing/empty leaves as non-match anyway (fail-closed), so the affordance is cosmetic only.
[SOURCE: file:.../context/anytype-ts/src/ts/lib/relation.ts:470-488]

## Questions Answered
- Q4 (Anytype reference): Answered — group shape (F3.1), flatten semantics (F3.2), recursive group UI + ops (F3.3), condition-by-format + empty/notempty (F3.4), recursive active state (F3.5).

## Questions Remaining
- Q2 (009 tree consumption mechanics — leaf adapter, normalization, wiring into getConditionalFormatMatch) — iteration 4.
- Q6/Q7 (result shape + editor UI) — editor UI now has two references (AppFlowy chips F2.6, Anytype recursive groups F3.3).

## Next Focus
Iteration 4: 009 view-filter-tree consumption — read 009 research lineage iterations + FilterPanelRenderer + RowPipeline call site; design the CF condition adapter (SourceRuleNode leaves → matchesFilter), normalization (legacy single FilterRule → root group), and the exact getConditionalFormatMatch rewrite preserving first-match.

---

# Iteration 004 — 009 Tree Consumption: Adapter, Normalization, Fail-Closed Semantics

**Status:** complete | **Focus:** How CF consumes the 009 view-filter tree with minimal diff | **newInfoRatio:** 0.80

## Focus
Design the exact consumption path: CF rule condition → `SourceRuleNode` tree → 009 `applyFilterTree` semantics, with legacy normalization, fail-closed behavior, and persistence parsing — grounded in the 009 research lineage, the fork's existing source-rule editor, FilterRules, and DataSource parsing.

## Actions Taken
1. Read 009 research lineage iteration-002 (`009-view-filter-tree/research/lineages/deepseek-flash-max/iterations/iteration-002.md`) — AppFlowy analysis + evaluation-semantics recommendation.
2. Read `views/FilterPanelRenderer.ts` (85-130) — flat filter panel + add-condition flow.
3. Read `data/RowPipeline.ts` (93-97) — view filter call site (`getEffectiveFilterRules` + `applyFilters`).
4. Read `data/FilterRules.ts` (full, 12 lines) — `isEffectiveFilterRule`/`getEffectiveFilterRules`.
5. Read `views/ViewConfigPanelRenderer.ts` — `createEditableSourceRuleRoot` (98-100), full recursive source-rule editor (`renderSourceRules` 804+, `renderSourceRuleNode`, `renderSourceRuleGroup`, `renderSourceRuleLeaf`).
6. Read `data/DataSource.ts` — legacy CF migration (761-765) + `parseConditionalFormats` (800-825).

## Findings

### F4.1 — The 009 research lineage already decided the evaluator semantics CF must inherit
009 iteration-002 F2.2 recommends **three-valued evaluation with empty-group-as-None** (AppFlowy semantics, controller.rs:475-542) for `applyFilterTree`: empty AND/OR groups are skipped, only `Some` verdicts combine; the current two-valued `matchesSourceRuleTree` (SourceRules.ts:152, empty group → `logic === "and"`) poisons nested ORs (`(empty-AND) or C` → always true). CF must consume whatever 009 ships — REQ-001 forbids a private walker — so the CF adapter's only semantic job is at the root: **a missing or empty root tree must mean "rule does not match"** (spec §8: "Empty condition tree or missing predicate: rule does not match; next rule may still match"). Under three-valued semantics the CF wrapper maps root `None` → non-match; under the legacy two-valued walker it must explicitly short-circuit empty roots before evaluation (an empty root AND-group would otherwise match every row — a correctness trap).
[SOURCE: file:specs/obsidian/002-note-db-notion-parity-build/009-view-filter-tree/research/lineages/deepseek-flash-max/iterations/iteration-002.md:10-17; file:.../src/data/SourceRules.ts:144-156; file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/spec.md:186-193]

### F4.2 — The fork ALREADY ships a full recursive `SourceRuleNode` editor — reuse it for CF conditions
`ViewConfigPanelRenderer.renderSourceRules` (804+) renders the data-source rule tree with: `renderSourceRuleNode` (dispatch by group/not/expression/leaf), `renderSourceRuleGroup` (and/or logic dropdown, add-rule/add-group/add-expression/add-not buttons, delete, recursive children with **positional splice** `rules[index] = next | splice`), `renderSourceRuleLeaf` (field/op/value). No node ids: editing is positional (`onReplace` at index), which 009 iteration-002 F2.1 confirms is sufficient (AppFlowy's id-based surgery is a UI convenience). **Design consequence:** the CF editor's multi-condition UI is a *CF-scoped variant* of this renderer — same group chrome (logic dropdown + add/delete), CF-scoped leaves (view `FilterOperator` set via `getFilterOperatorsForColumn`, `valueSource: "today"` date handling), and the existing rule-row chrome (target record/field, color, reorder). This satisfies REQ-001/REQ-002 with zero new tree UI infrastructure.
[SOURCE: file:.../src/views/ViewConfigPanelRenderer.ts:98-100,804-1000; file:.../009-view-filter-tree/research/lineages/deepseek-flash-max/iterations/iteration-002.md:7-9]

### F4.3 — `createEditableSourceRuleRoot` is the exact legacy-normalization primitive
`createEditableSourceRuleRoot` (ViewConfigPanelRenderer.ts:98-100) wraps a non-group root in `{type:"group", logic:"and", rules:[tree]}`. CF legacy normalization mirrors it: a stored single-condition rule (`condition: FilterRule`, no tree) normalizes to `{type:"group", logic:"and", rules:[condition]}` at evaluation time — the single-leaf root group evaluates identically to today's `applyFilters([row],[rule.condition],"and")` (QueryEngine.ts:74-89), preserving NFR-R01. No write-back of the normalized form is needed (display-only), so legacy vault JSON stays untouched (iCloud-safe).
[SOURCE: file:.../src/views/ViewConfigPanelRenderer.ts:98-100; file:.../src/data/QueryEngine.ts:74-89]

### F4.4 — Do NOT apply `getEffectiveFilterRules` semantics to CF leaves (behavior-preservation trap)
`getEffectiveFilterRules` (FilterRules.ts:3-12) drops rules with missing fields or empty values (except empty/notempty) — that is view-filter behavior. CF today evaluates the stored condition as-is: a legacy rule `{field, op:"eq", value:""}` matches rows whose cell is empty (ConditionalFormatting.ts:38 → matchesFilter:91-127, `compareFilterValue("", "") === 0`). Adding effectiveness filtering to CF leaves would silently change legacy colors (violates NFR-R01 and Scenario 1). **The leaf adapter must preserve raw-leaf semantics**; only the existing skip of missing `field` (line 31) and spec's missing-column non-match (§8) apply.
[SOURCE: file:.../src/data/FilterRules.ts:3-12; file:.../src/data/ConditionalFormatting.ts:31-38; file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/spec.md:190]

### F4.5 — DataSource parsing is the additive persistence gate
`parseConditionalFormats` (DataSource.ts:800-825) whitelists field/op/target/color and normalizes `valueSource` to today/literal; legacy db-level rules migrate into views on read (761-765). Multi-condition + icon/bold need additive parse keys: optional `conditionTree` (via `parseSourceRuleTree`, SourceRules.ts:227-257, restricted to view operators) and optional `icon`/`bold` (icon validated through `parseRecordIconToken`-compatible shape; bold as boolean). Rules missing the new keys parse exactly as today → NFR-R01 at the load boundary.
[SOURCE: file:.../src/data/DataSource.ts:761-765,800-825; file:.../src/data/SourceRules.ts:227-257]

## Questions Answered
- Q2 (009 tree consumption): Answered at the design level — root-group normalization (F4.3), root fail-closed mapping (F4.1), reuse of the existing recursive editor (F4.2), leaf raw semantics (F4.4), additive parse gate (F4.5).

## Questions Remaining
- Q6 (icon/bold result shape + painting) — iteration 5.
- Q7 (editor UI specifics) — pattern decided (F4.2); concrete layout next.
- Q8/Q9/Q10 — later iterations.

## Next Focus
Iteration 5: Icon + bold attribute design — `ConditionalFormatMatch` extension, CSS variable + class contract in `applyConditionalFormat`, renderer pass-through (which consumers have icon slots), RecordIcon renderer reuse, and mobile-safe painting (emoji vs lucide on Obsidian mobile).

---

# Iteration 005 — Icon + Bold Attribute Design (Result Shape, Painting, Mobile Safety)

**Status:** complete | **Focus:** Extend the shared format result with icon/bold; paint without consumer edits | **newInfoRatio:** 0.75

## Focus
Design the `ConditionalFormatMatch` extension and the `applyConditionalFormat` painting contract for icon and bold — grounded in the existing CSS variable contract (styles.css), the RecordIcon token/renderer infrastructure, Obsidian `setIcon`, i18n keys, and the fork's test harness state.

## Actions Taken
1. Read `styles.css` — `.db-conditional-format` rules (469-484), `db-record-icon-*` styles (4051, 4680-4715), font-weight usage.
2. Read `src/views/TableRenderer.ts` record-icon wiring (32, 364, 400, 490) and row/cell CF call sites (463, 503).
3. Read `src/views/RecordIconRenderer.ts` (1-54) — `getValidIconIdSet`, `renderRecordIcon`, `setIcon`/`getIconIds` imports.
4. Read `vitest.config.ts`, package.json scripts, searched `*.test.ts` — harness state.
5. Read `src/i18n.ts` — conditionalFormat.* keys (25-35) and panel.* keys (379-385) for reuse.

## Findings

### F5.1 — The painting contract is class + CSS custom properties; bold/icon extend it the same way
`applyConditionalFormat` today sets the `db-conditional-format` class plus `--db-conditional-format-bg/-fg`, `--card-bg/--card-accent`, `--db-calendar-event-bg/-accent` vars; CSS cascades the background to cells via `td.db-conditional-format`, `.db-board-card-field.db-conditional-format`, `.db-gallery-field`, `.db-list-field`, `.db-record-detail-field`, `.db-record-detail-title` and row-level via `tr.db-conditional-format > td:not(.db-conditional-format)` (styles.css:469-484). **Design:** extend the match result and the same mutating function — bold as a class `db-conditional-format-bold` (CSS `font-weight: 700`; a `tr.db-conditional-format-bold > td` rule covers row-level), icon as a `data-note-database-conditional-icon` attribute plus an appended `db-conditional-format-icon` span where the element permits children. Removal phase clears both (mirroring the six existing var removals, ConditionalFormatting.ts:51-58). No consumer file changes required — all ten consumers already call the shared helper.
[SOURCE: file:.../styles.css:469-484; file:.../src/data/ConditionalFormatting.ts:44-69]

### F5.2 — Icon representation: reuse the RecordIcon token dialect verbatim (answers spec Open Question 1)
`parseRecordIconToken(token, validLucideIds)` (RecordIcon.ts:27-38) accepts single emoji graphemes (`Intl.Segmenter`, 20-25) or `lucide:<id>@<color>` (14, 30-35) and rejects anything else → null. `renderRecordIcon` (RecordIconRenderer.ts:18-33) already renders both kinds; `setIcon` + `getIconIds` come from the obsidian API (RecordIconRenderer.ts:1) — pure SVG on all platforms including Obsidian mobile (the record-icon column already ships this pattern). **CF icon design:** store the raw token string in `ConditionalFormatRule.icon`; validate at parse (DataSource) and at render (`parseRecordIconToken`); invalid → no icon (fail-closed, NFR-S02: icon is data, never executed). Emoji spans and lucide SVGs are both safe on mobile — no vault paths, no custom fonts.
[SOURCE: file:.../src/data/RecordIcon.ts:14-38; file:.../src/views/RecordIconRenderer.ts:1-33; file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/spec.md:185,216-217]

### F5.3 — Row-level elements (TR) get attribute-only icons; cell-level elements get the icon span
TableRenderer applies CF to `tr` (row target, line 463) and `td` (field target, line 503); board/gallery/list/calendar apply to cards/fields/events (iteration 1, F1.2). A span child of a `tr` is invalid HTML, so `applyConditionalFormat` must append the `db-conditional-format-icon` span only for non-TR elements and always set the `data-note-database-conditional-icon` attribute. This satisfies the spec's "Consumer ignores icon/bold ... allowed for a view that has no icon slot, but it must still not re-run predicates" (spec §8): ignoring is free, re-matching is impossible by construction.
[SOURCE: file:.../src/views/TableRenderer.ts:463,503; file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/spec.md:190-193]

### F5.4 — Legacy rules stay color-only automatically; bold/icon merge rules need explicit merge semantics
Spec edge case: "Two rules match: first in list wins; later icon/bold must not merge onto the first rule's color unless the first rule itself set them" (spec §8:191). Since `getConditionalFormatMatch` returns on the first matching rule (ConditionalFormatting.ts:39), the returned `icon`/`bold` come from that same rule — merging is structurally impossible. The only nuance: a first rule with `icon` unset but `bold` set returns `{color, bold, icon: undefined}` — consumers render bold but no icon; a later rule's icon never leaks. First-match unchanged (REQ-005).
[SOURCE: file:.../src/data/ConditionalFormatting.ts:23-42; file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/spec.md:191]

### F5.5 — i18n keys exist for reuse; new keys are minimal
`panel.and` ("AND (all)"), `panel.or` ("OR (any)"), `panel.addCondition` exist in en/zh-CN/zh-TW (i18n.ts:379-385, 1831-1837, 3341-3346) — the CF group editor reuses them. New keys needed: `conditionalFormat.icon`, `conditionalFormat.bold`, `conditionalFormat.group` (or similar), in the three locales, following the existing conditionalFormat.* block (25-35).
[SOURCE: file:.../src/i18n.ts:25-35,379-385]

### F5.6 — Test harness is configured but inert — the phase must fix or bypass it (flagged, not executed)
`vitest.config.ts` includes `src/**/*.test.ts` with `setupFiles: ["src/__tests__/setup.ts"]`, but `src/__tests__/setup.ts` does not exist and there are zero `*.test.ts` files; package.json scripts have no `test` entry. Running `vitest run` today would fail on the missing setup file. **Phase 010 test plan must include either creating `src/__tests__/setup.ts` (empty or minimal) or removing the setupFiles line, plus a colocated `ConditionalFormatting.test.ts`** — a small, in-scope addition per plan.md §5 (fork-local tests colocated with the helper).
[SOURCE: file:.../vitest.config.ts:1-8; file:.../package.json scripts; file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/plan.md:127-134]

## Questions Answered
- Q6 (icon/bold result shape + painting): Answered — result extension (F5.1), token reuse (F5.2), row-vs-cell painting (F5.3), merge semantics (F5.4), i18n (F5.5), test harness (F5.6).

## Questions Remaining
- Q7 (editor UI layout for multi-condition + icon/bold controls) — iteration 6.
- Q8 (edge cases), Q9 (mobile/iCloud/perf), Q10 (diff hygiene).

## Next Focus
Iteration 6: CF editor UI — concrete layout combining the existing rule-row chrome (ViewConfigPanelRenderer:552-766) with the recursive source-rule group renderer (804-1000), icon picker reuse (IconPickerPopover), and bold toggle; verify mobile-width behavior.

---

# Iteration 006 — CF Editor UI: Multi-Condition Groups + Icon/Bold Controls

**Status:** complete | **Focus:** Concrete editor layout reusing in-repo patterns | **newInfoRatio:** 0.70

## Focus
Design the rule-editor UI: multi-condition tree editing inside the existing CF rule row, icon button via the existing picker popover, bold toggle — with zero new UI infrastructure, mobile-width behavior, and a diff that stays inside the known file set.

## Actions Taken
1. Read `src/views/IconPickerPopover.ts` (1-50) — `IconPickerOptions`, `openIconPickerPopover` API; callers DatabaseView.ts:4570/4664.
2. Read `src/views/ViewConfigPanelRenderer.ts` `renderSourceRuleLeaf` (935-1005+) — leaf editor pattern (field dropdown with type icons, custom field picker, operator refresh, `updateValueDisabled`).
3. Confirmed `renderSourceRuleGroup`/`renderSourceRuleNode` positional editing (iteration 4, F4.2).
4. Checked `Platform`/`isMobile` usage in ViewConfigPanelRenderer — none; panel is a positioned popover, width handled by CSS.

## Findings

### F6.1 — Reuse `openIconPickerPopover` as-is for the CF icon control; zero new picker chrome
`IconPickerOptions { anchor, current?, recent?, onRecentChange?, onConfigureField?, onSelect(value: string|null) }` (IconPickerPopover.ts:11-23) — emoji/lucide tabs, recent list, null to clear. The CF rule row adds one icon button next to the color swatch (ViewConfigPanelRenderer:721-735): opens the picker with `current: rule.icon`, `onSelect: (v) => { rule.icon = v ?? undefined; persist(); }`. This honors the spec's out-of-scope boundary ("Icon catalog, icon picker UI chrome ... beyond storing and applying an icon attribute" — the existing picker is reused, not built) while giving a complete UX. `onConfigureField` is irrelevant to CF and stays unused.
[SOURCE: file:.../src/views/IconPickerPopover.ts:11-23; file:.../src/views/DatabaseView.ts:4570; file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/spec.md:85]

### F6.2 — The condition editor is the source-rule group renderer with CF-scoped leaves — same file, same patterns
`renderConditionalFormatting` (ViewConfigPanelRenderer.ts:552-766) keeps the rule-row chrome (target dropdown, color swatch, reorder, delete) and replaces the single field/op/value trio with a recursive condition-tree editor modeled on `renderSourceRuleGroup` (iteration 4 F4.2): root group row = AND/OR dropdown (reusing `panel.and`/`panel.or` i18n, i18n.ts:384-385) + add-condition button; children = leaf rows or nested groups; leaf rows = CF-scoped `renderSourceRuleLeaf` variant using `getFilterOperatorsForColumn` (existing CF editor:593), select/status/multi-select option dropdowns (646-662), date picker with `valueSource: "today"` footer action (663-685), number/text inputs (687-702). Editing ops are positional splices inline — identical to `renderSourceRuleGroup`'s `onReplace` (children[index] = next | splice), which 009 research confirmed is sufficient without node ids (iteration 4 F4.2). Bold toggle: one `db-icon-only-button` with `setIcon(button, "bold")`, toggling `rule.bold`.
[SOURCE: file:.../src/views/ViewConfigPanelRenderer.ts:552-766,804-1005; file:.../src/i18n.ts:384-385]

### F6.3 — Mobile behavior inherits from the existing panel: no new width handling needed
`ViewConfigPanelRenderer` has no `Platform.isMobile` branches; the panel is a positioned popover whose width is CSS-driven, and the source-rule tree editor (same panel, same nested rows) is already the shipped mobile pattern for nested rules. The CF tree editor uses the same DOM classes (`db-source-rule-node/-group/-leaf` or parallel `db-conditional-format-*` classes) so mobile layout and touch targets carry over. The existing `db-conditional-format-rule` row already wraps controls for narrow panes.
[SOURCE: file:.../src/views/ViewConfigPanelRenderer.ts:804-1005 (pattern); file:.../styles.css:336-345,469-502]

### F6.4 — Rule ordering + first-match remain list-order; editor keeps move up/down on the rule row
The move-up/move-down controls (ViewConfigPanelRenderer.ts:739-754) operate on `config.conditionalFormats` list order — unchanged by tree conditions (REQ-005: first-match across the rule list is unchanged; iteration 1 F1.1). The tree editor operates only *within* one rule's condition; group children order is semantically meaningful (AND/OR short-circuit) and is edited by the positional splice like AppFlowy's `insert_filter` (iteration 2 F2.3).
[SOURCE: file:.../src/views/ViewConfigPanelRenderer.ts:737-761; file:.../src/data/ConditionalFormatting.ts:29-41]

### F6.5 — Diff inventory for the editor: one file, additive
The entire UI change lands in `ViewConfigPanelRenderer.ts` (renderConditionalFormatting + optional small shared leaf-editor helper within the same file) plus 3 new i18n keys ×3 locales (`conditionalFormat.icon/bold/group`). No new component files, no new modules — consistent with the EuroFormat isolation bar and the spec's Files-to-Change list (CF file, types, editor, parser, key-hygiene).
[SOURCE: file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/spec.md:89-97; file:.../src/i18n.ts:25-35]

## Questions Answered
- Q7 (editor UI): Answered — icon picker reuse (F6.1), condition-tree editor as source-rule renderer variant (F6.2), mobile inheritance (F6.3), order semantics (F6.4), diff inventory (F6.5).

## Questions Remaining
- Q8 (edge-case matrix incl. valueSource today inside trees, missing columns, deep nesting) — iteration 7.
- Q9 (mobile/iCloud/perf verification) — iteration 8.
- Q10 (EuroFormat diff hygiene + test plan + rollback) — iteration 9.

## Next Focus
Iteration 7: Edge cases — build the fail-closed matrix (empty tree, missing column, valueSource "today" inside a tree, deep nesting, legacy migration paths, DataSource parse boundaries, ColumnOperations key refs) and verify each against the current code paths.

---

# Iteration 007 — Edge-Case Matrix: Fail-Closed Semantics, valueSource, Key Hygiene

**Status:** complete | **Focus:** Verify every spec edge case against real code paths | **newInfoRatio:** 0.65

## Focus
Build the edge-case matrix for multi-condition CF and check each case against the current code: empty/missing tree, missing column, `valueSource: "today"` inside a tree, deep nesting, legacy migration, parse boundaries, rename/delete key hygiene, and first-match merging.

## Actions Taken
1. Read `ColumnOperations.ts` rename (185-200) and delete (360-375) paths.
2. Grepped all `valueSource` usages (DataSource:823, ConditionalFormatting:13, editor 576-680) — rule-level flag, three consumers.
3. Re-derived missing-column behavior from `QueryEngine.matchesFilter` (91-127) + `getFieldValue` (283-294).
4. Cross-checked spec §8 edge cases (spec.md:179-198) against iterations 1-6 findings.

## Findings

### F7.1 — Edge-case matrix (each verified against current behavior)
| # | Case | Current behavior | Target behavior (tree rules) | Verdict |
|---|------|------------------|-------------------------------|---------|
| E1 | Missing `id` or `condition.field` (legacy) | Rule skipped (ConditionalFormatting.ts:31) | Unchanged | Keep |
| E2 | Empty/missing condition tree | N/A (no trees today) | **Rule does not match** (fail-closed; spec §8:186-187) — map root None/empty → continue to next rule | New (F4.1) |
| E3 | Leaf references undeclared column | Matches raw frontmatter via string fallback (QueryEngine.ts:91-127,283-294) | Spec §8:190 says non-match; but applying it to legacy rules breaks NFR-R01 (same colors). **Apply non-match only to tree-typed rules**; legacy single-condition path untouched | Spec tension, resolved additively |
| E4 | Empty nested group `(∅) or C` | N/A | Inherit 009 evaluator semantics (AppFlowy skip recommended — 009 iteration-002 F2.2) | Inherit |
| E5 | `valueSource: "today"` + tree | Rule-level flag resolved per rule (resolveRule, ConditionalFormatting.ts:12-21); only date columns (editor 598-599) | Keep rule-level; `resolveRule` substitutes `getLocalDateKey(new Date())` into **every date-like leaf with empty value** on a date-comparison op (gt/lt/gte/lte/eq/neq). Legacy single-leaf rules behave identically (NFR-R01). No new type fields | New, deterministic |
| E6 | Deep nesting | matchesSourceRuleTree is recursion-only, no depth cap (SourceRules.ts:144-156); 009 defines the shipped limit | Inherit; CF adds none | Inherit |
| E7 | Legacy db-level rules | Migrated to views on read (DataSource.ts:761-765), copied `{...rule.condition}` | Unchanged (no tree key → legacy parse) | Keep |
| E8 | Rename column | `rule.condition.field` rewritten (ColumnOperations.ts:193-198) | Tree rules: walk via `updateSourceRuleTreeKeyReferences` (SourceRules.ts:183-206) — same leaf shape → same helper | Extend |
| E9 | Delete column | Rules with `condition.field` removed (ColumnOperations.ts:370-371) | Tree rules: `removeSourceRuleTreeReferences` (SourceRules.ts:208-225), preserving non-matching siblings | Extend |
| E10 | Unknown extra rule fields | Ignored by parse whitelist (DataSource.ts:800-825) | `icon`/`bold`/`conditionTree` parsed additively; unknown ops in tree leaves rejected (view 10-op set) | Add |
| E11 | Invalid icon string | N/A | Stored raw (length-capped at parse), validated at render via `parseRecordIconToken` → invalid = no icon (F5.2, NFR-S02) | New |
| E12 | Two rules match | First wins, returns immediately (ConditionalFormatting.ts:39) | Unchanged; icon/bold merge impossible (F5.4) | Keep |

[SOURCE: file:.../src/data/ConditionalFormatting.ts:12-21,31,39; file:.../src/data/QueryEngine.ts:91-127,283-294; file:.../src/views/ColumnOperations.ts:185-200,360-375; file:.../src/data/SourceRules.ts:183-225; file:.../src/data/DataSource.ts:761-765,800-825; file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/spec.md:179-198]

### F7.2 — The E3 spec tension is real and must be resolved explicitly in the implementation plan
Spec §8 says "Predicate references a missing column: treat as non-match" (spec.md:190), but CF today matches on raw frontmatter even when the column is undeclared (QueryEngine `getFieldValue` falls back to `row.frontmatter[field]`, 292-293; `compareFilterValue` string-compares with an undefined column, 186-203). The 009 view-filter path uses `getEffectiveFilterRules` with `validFields` (RowPipeline.ts:93-97 + FilterRules.ts:3-12) — i.e., view filters DO drop undeclared-field rules. **Recommendation:** the CF tree evaluator takes `config.schema.columns` and treats a leaf whose field is not in the columns set (and not a `file.*`/computed field) as false — for tree rules only — matching both the spec and the 009 view-filter convention without touching legacy single-condition behavior.
[SOURCE: file:.../src/data/QueryEngine.ts:283-294; file:.../src/data/FilterRules.ts:3-12; file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/spec.md:190]

### F7.3 — valueSource consumers are only three — rule-level extension is safe and additive
`valueSource` appears in DataSource parse (823), resolveRule (13), and the editor (576-680). No view renderer reads it. Keeping it rule-level with the E5 substitution rule is therefore a 1-function change in `ConditionalFormatting.ts` (resolveRule) + a doc note; the alternative (per-leaf `valueSource` on a CF-specific leaf type) would fork the leaf shape away from `SourceRule` and break the ColumnOperations helper reuse (E8/E9) — rejected.
[SOURCE: file:.../src/data/DataSource.ts:823; file:.../src/data/ConditionalFormatting.ts:13; file:.../src/views/ViewConfigPanelRenderer.ts:576-680]

### F7.4 — iCloud/concurrency edge: config-change path is unchanged
Tree edits commit through the existing `actions.onChange(t("undo.conditionalFormatConfig"))` path (editor persist, ViewConfigPanelRenderer.ts:601-604); `EmbeddedDatabaseRenderer.ts:3360` already excludes `conditionalFormats` from structural change detection, so multi-condition trees do not trigger view reloads or extra vault writes. Display-only holds: evaluation writes DOM only (F5.1); no note-file writes exist anywhere in the CF path (grep of ConditionalFormatting.ts: no vault API).
[SOURCE: file:.../src/views/ViewConfigPanelRenderer.ts:601-604; file:.../src/views/EmbeddedDatabaseRenderer.ts:3360; file:.../src/data/ConditionalFormatting.ts:44-69]

## Questions Answered
- Q8 (edge cases): Answered — full matrix E1-E12 with code-verified current behavior (F7.1), the E3 tension resolution (F7.2), valueSource scope (F7.3), iCloud path (F7.4).

## Questions Remaining
- Q9 (mobile/iCloud/perf verification evidence) — iteration 8.
- Q10 (EuroFormat diff hygiene, test plan, rollback) — iteration 9.

## Next Focus
Iteration 8: Mobile + iCloud + performance verification — scan the CF path for desktop-only APIs, verify display-only (no writes), confirm per-row single-pass evaluation on the visible-page path, and check the CSS class/attribute contract against all seven view types plus RecordDetailPanel.

---

# Iteration 008 — Mobile, iCloud, and Performance Verification

**Status:** complete | **Focus:** NFR compliance evidence across the CF path | **newInfoRatio:** 0.60

## Focus
Verify mobile-safety (no desktop-only APIs, no new runtime risk), iCloud-safety (display-only, no writes), and performance (single-pass, per-row shared path) for the multi-condition + icon/bold design, against the actual call graph.

## Actions Taken
1. Scanned `ConditionalFormatting.ts` imports (CalendarDateTime, QueryEngine, types) and grepped the CF path files for `require/electron/NodeJS/process/fs` — none.
2. Read `RecordIcon.isSingleEmojiGrapheme` (RecordIcon.ts:14-26) — `Intl.Segmenter` usage without guard.
3. Read TableRenderer row/cell CF calls (455-510) incl. `isPhoneLayout()` branch; DatabaseView.renderCell (7845-7850).
4. Confirmed `getLocalDateKey` (CalendarDateTime.ts:57) — local wall-clock date key.
5. Re-confirmed display-only: ConditionalFormatting.ts uses DOM/CSS only (44-69); config writes flow only through the editor's `actions.onChange` (iteration 7 F7.4).

## Findings

### F8.1 — No desktop-only APIs anywhere in the CF path (NFR-R03 holds)
`ConditionalFormatting.ts` imports only `CalendarDateTime`, `QueryEngine`, and `types`; grep for `require(/electron/NodeJS/process./fs` across ConditionalFormatting.ts, RecordIcon.ts, RecordIconRenderer.ts returns nothing. The icon path uses Obsidian's `setIcon`/`getIconIds` (RecordIconRenderer.ts:1) — platform-neutral SVG, already shipping in the record-icon column on mobile. **Tree evaluation adds no API surface**: 009's `applyFilterTree` is plain TS over `SourceRuleNode`, same as `matchesSourceRuleTree`.
[SOURCE: file:.../src/data/ConditionalFormatting.ts:1-3; file:.../src/views/RecordIconRenderer.ts:1; file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/spec.md:173]

### F8.2 — `Intl.Segmenter` is an existing, shipped risk — CF adds no new exposure
`isSingleEmojiGrapheme` (RecordIcon.ts:20-25) calls `new Segmenter(...)` with no feature guard; if `Intl.Segmenter` were absent it would throw. This ships today for record icons (all views, mobile), so CF icon reuse inherits identical behavior — no new risk class. Optional 1-line hardening (`if (!Segmenter) return false`) could ride along in the phase but is not required by the spec; flag for the implementation plan as an optional additive guard.
[SOURCE: file:.../src/data/RecordIcon.ts:20-25]

### F8.3 — Evaluation is per-row + per-cell on the visible page via the single shared helper (NFR-P01/P02)
TableRenderer applies CF once per `tr` (row target, 463) and once per `td` (field target, 503) — the same in phone layout (`isPhoneLayout()` branch renders the same cells, 478+). DatabaseView.renderCell (7845-7850) and the other six views + RecordDetailPanel call the identical helper (iteration 1 F1.2). Each call walks the rule list with first-match short-circuit (ConditionalFormatting.ts:29-41); a tree rule adds one recursive walk of depth O(tree) using the 009 evaluator. No second full-table scan is introduced (NFR-P01), and the 009 evaluator is the sole walker (NFR-P02 — no private CF walker). `valueSource: "today"` resolves via `getLocalDateKey` (CalendarDateTime.ts:57) — local wall-clock, no timezone API.
[SOURCE: file:.../src/views/TableRenderer.ts:455-510; file:.../src/views/DatabaseView.ts:7845-7850; file:.../src/data/CalendarDateTime.ts:57]

### F8.4 — Display-only is structural: the CF path touches no vault API
`applyConditionalFormat`/`getConditionalFormatMatch` operate exclusively on in-memory `RowData`/`ViewConfig` and the passed `HTMLElement` — no `App.vault` writes, no file I/O (ConditionalFormatting.ts:23-69). Config mutations happen only in the editor via `actions.onChange` (undo-tracked). Icon/bold painting is DOM + CSS variables (iteration 5 F5.1). Scenario 5 (no extra note-file write on iCloud-synced vault) holds by construction.
[SOURCE: file:.../src/data/ConditionalFormatting.ts:23-69; file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/spec.md:137-139,196-198]

### F8.5 — Row-level icon edge on mobile: attribute-only for TR keeps DOM valid; CSS cascade covers bold
Bold on a `tr` needs the CSS rule `tr.db-conditional-format-bold > td` (or `:where(td)` text color) — the existing row-level background cascade (styles.css:473-475) is the precedent. Icon on TR stays attribute-only (iteration 5 F5.3) — no invalid children, no mobile rendering surprises.
[SOURCE: file:.../styles.css:469-484]

## Questions Answered
- Q9 (mobile/iCloud/perf): Answered — NFR-R03 (F8.1), Segmenter risk parity (F8.2), NFR-P01/P02 (F8.3), display-only (F8.4), row-level mobile paint (F8.5).

## Questions Remaining
- Q10 (EuroFormat diff hygiene, concrete test plan, rollback) — iteration 9.

## Next Focus
Iteration 9: EuroFormat diff hygiene — final file inventory against the spec's Files-to-Change, call-site budget, test plan (vitest harness fix + colocated ConditionalFormatting.test.ts cases), rollback path, and the ranking inputs for synthesis.

---

# Iteration 009 — EuroFormat Diff Hygiene: Final Inventory, Test Plan, Rollback

**Status:** complete | **Focus:** Rebase-safe change set + verification plan | **newInfoRatio:** 0.55

## Focus
Consolidate the concrete change set against the fork's actual rebase model (`update-fork.sh`), produce the test plan (fixing the inert vitest harness), and verify the rollback path — the inputs for the ranked synthesis.

## Actions Taken
1. Read `update-fork.sh` (full) — rebase model: upstream pangy9/obsidian-note-database tags, override = EuroFormat.ts + 2 call-site edits (CellRenderer.ts, SummaryRenderer.ts), `git rebase "$NEW"` + force-push fork main.
2. Confirmed `getValidRecordIconIds` is exported (RecordIconRenderer.ts:53) — CF can validate icon tokens with zero new exports.
3. Confirmed StatusColor (types.ts:73-88) and RECORD_ICON_COLORS (RecordIcon.ts:3-8) are both 16 entries.
4. Consolidated iterations 1-8 into the final diff inventory.

## Findings

### F9.1 — Final change set: 8 files, all additive, ZERO consumer call-site edits
| # | File | Change | Type |
|---|------|--------|------|
| 1 | `src/data/types.ts` | `ConditionalFormatRule` + `conditionTree?: SourceRuleNode`, `icon?: string`, `bold?: boolean` (keep `condition` for legacy) | Additive |
| 2 | `src/data/ConditionalFormatting.ts` | `ConditionalFormatMatch` + `icon?`/`bold?`; normalize legacy condition → root AND group; evaluate via 009 tree evaluator; root fail-closed; tree-only missing-column non-match; `valueSource:"today"` substitution on date leaves; paint bold class + icon attribute/span | Modify (core) |
| 3 | `src/views/ViewConfigPanelRenderer.ts` | Condition-tree editor (group rows + CF leaves, positional splice), icon button via `openIconPickerPopover`, bold toggle | Modify (editor) |
| 4 | `src/data/DataSource.ts` | `parseConditionalFormats` additive: `conditionTree` (via `parseSourceRuleTree`, view-op restricted), `icon` (string, ≤64 chars), `bold` (boolean) | Additive |
| 5 | `src/views/ColumnOperations.ts` | Rename/delete: walk `conditionTree` via `updateSourceRuleTreeKeyReferences`/`removeSourceRuleTreeReferences` | Modify (2 loops) |
| 6 | `styles.css` | `.db-conditional-format-bold` (+ `tr.db-conditional-format-bold > td`), `.db-conditional-format-icon` | Additive |
| 7 | `src/i18n.ts` | 3 keys × 3 locales (`conditionalFormat.icon/bold/group`) | Additive |
| 8 | `src/data/ConditionalFormatting.test.ts` (+ `src/__tests__/setup.ts` or drop setupFiles) | Vitest cases below | New |

**Call-site budget:** the spec's "1-3 call-site edits" bar is met with **zero** — all ten view consumers already call the shared helper (iteration 1 F1.2) and the helper paints icon/bold itself (iteration 5 F5.1). This is a *smaller* diff than the EuroFormat precedent (1 module + 2 call sites). No new `src/data/` module is required: evaluation stays in `ConditionalFormatting.ts` (the shared helper IS the EuroFormat-shaped file), and editor tree ops are inline like `renderSourceRuleGroup` (iteration 4 F4.2, iteration 6 F6.2).
[SOURCE: file:.../update-fork.sh:1-12; file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/spec.md:89-97; file:.../src/views/RecordIconRenderer.ts:53]

### F9.2 — The rebase story mirrors EuroFormat: same file shapes, additive-only
`update-fork.sh` rebases the fork onto upstream tags; the override precedent is one pure module + two call-site edits. The CF diff touches 8 files but every edit is additive (new optional fields, extended helper, extended editor/parser) — `git rebase` conflict risk is limited to `ViewConfigPanelRenderer.ts` (largest edit) and `ConditionalFormatting.ts`; `types.ts`/`DataSource.ts` additive blocks merge cleanly unless upstream changes those exact regions. Keep the tree-editor code inside `renderConditionalFormatting` (no new file) so the new-file count stays zero, matching the spec's "prefer additive edits in ConditionalFormatting.ts / types.ts".
[SOURCE: file:.../update-fork.sh:8-16; file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/plan.md:88-93]

### F9.3 — Test plan (vitest, colocated with the helper)
Harness fix first: `vitest.config.ts` requires `src/__tests__/setup.ts` which does not exist and package.json has no `test` script (iteration 5 F5.6) — add a minimal `setup.ts` (or remove `setupFiles`) and a `test` script (`vitest run`). Then `ConditionalFormatting.test.ts` cases, each with real row/config fixtures:
1. Legacy single-condition color-only rule → same color (NFR-R01 baseline, Scenario 1).
2. AND tree: both predicates → match; one predicate → no match (SC-001).
3. OR tree: either predicate → match; neither → no match.
4. First-match: two matching rules → first rule's color/icon/bold only (SC-003, F5.4).
5. Empty/missing tree → no match, next rule may match (E2).
6. Tree leaf on undeclared column → non-match (tree rules only; E3).
7. `valueSource:"today"` with a date leaf in a tree → today's local date key substituted (E5).
8. `icon` token round-trip: valid emoji, valid lucide token, invalid string → no icon (E11).
9. `bold` true/false/undefined round-trip.
10. DataSource.parseConditionalFormats: legacy JSON (no new keys) → identical parse; tree JSON with invalid op → tree dropped, rule kept as legacy or skipped per whitelist (E10).
11. ColumnOperations-style rename/delete helpers on a tree rule (E8/E9) — as pure-function tests reusing `updateSourceRuleTreeKeyReferences`/`removeSourceRuleTreeReferences`.
12. Record-level vs field-level target filtering unchanged for tree rules (line 32-36 path).
[SOURCE: file:.../vitest.config.ts:1-8; file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/plan.md:124-134]

### F9.4 — Rollback is a plain file revert; stored data stays valid
Rollback = revert files 1-7 (+ remove test file). `types.ts` fields are optional → old code ignores unknown keys in saved view JSON (plan.md §7/§L2 rollback), no vault rewrite (iCloud-safe). Stored multi-condition rules become inert (tree key ignored, `condition` absent → rule skipped at line 31's guard — actually legacy parse drops rules without a valid `condition` object, so the rule disappears from the view, not a crash). Flag: the plan's rollback note ("users who saved multi-condition rules would see those rules inert") is accurate; a rule with only `conditionTree` and no `condition` is skipped by the line-31 guard, matching "inert" semantics.
[SOURCE: file:specs/obsidian/002-note-db-notion-parity-build/010-conditional-format-icons/plan.md:155-158,188-204; file:.../src/data/ConditionalFormatting.ts:31]

## Questions Answered
- Q10 (diff hygiene + tests + rollback): Answered — inventory (F9.1), rebase story (F9.2), test plan (F9.3), rollback (F9.4).

## Questions Remaining
- None structurally; iteration 10 cross-checks the whole packet (source diversity, ranking, open-question closure) as synthesis input.

## Next Focus
Iteration 10: Cross-check + ranking — verify source diversity and evidence density, close or carry forward the remaining open questions, and prepare the ranked enrichment for synthesis.

---

# Iteration 010 — Cross-Check, Source Diversity, and Ranked Enrichment

**Status:** complete | **Focus:** Quality-gate cross-check + ranked findings for synthesis | **newInfoRatio:** 0.50

## Focus
Final pass: verify the "single shared path" claim exhaustively across both host surfaces, audit source diversity/evidence density, close the open questions, and rank the enrichment recommendations with citations for synthesis.

## Actions Taken
1. Read DatabaseView actions binding (10436-10437) and EmbeddedDatabaseRenderer bindings (143, 164, 182-183) and RecordDetailPanel per-field call (236).
2. Replayed the finding graph across iterations 1-9 for contradictions (none found; F7.3's rejected alternative is consistent with F2.3/F3.3's wrap-into-group agreement).
3. Counted evidence classes for the quality gate.

## Findings

### F10.1 — "Single shared path" is now exhaustively verified (REQ-002/SC-004 final proof)
Every consumer binds `applyConditionalFormat` from `data/ConditionalFormatting.ts` — full-view host (DatabaseView.ts:10436-10437 `actions.applyConditionalFormat: (element, r, view, targetField) => applyConditionalFormat(...)`), embedded host (EmbeddedDatabaseRenderer.ts:143,164,182-183), and the renderers' optional action interfaces (TableRenderer:34 etc., iteration 1 F1.2). RecordDetailPanel applies per field (236). **There is no second CF predicate walker in the fork today, and the design adds none** — bold/icon paint inside the shared helper (iteration 5 F5.1), so SC-004 holds with zero renderer changes.
[SOURCE: file:.../src/views/DatabaseView.ts:10436-10437; file:.../src/views/EmbeddedDatabaseRenderer.ts:143,164,182-183; file:.../src/views/RecordDetailPanel.ts:236]

### F10.2 — Source diversity and evidence density pass the quality gate
Evidence classes: fork source (13 files, 40+ file:line citations across iterations), predecessor-009 research lineage (1 iteration file), reference repos (AppFlowy Rust `services/filter/*.rs` + `entities/filter_entities/util.rs` + Flutter `grid/presentation/widgets/filter/*.dart`; Anytype `interface/block/dataview.ts`, `model/filter.ts`, `lib/dataview.ts`, `lib/relation.ts`, `component/block/dataview/filters/*.tsx`), and Notion behavior (notion.com help center ×2 + independent third-party guide). No single-weak-source dominance: the two independent implementation references (AppFlowy Rust, Anytype TS) agree on the core tree shape and ops, and the fork's own shipped `matchesSourceRuleTree` corroborates both.

### F10.3 — All ten key questions closed; zero open questions carried into synthesis
Q1 fork baseline → iteration 1; Q2 009 consumption → iteration 4; Q3 AppFlowy → iteration 2; Q4 Anytype → iteration 3; Q5 Notion → iteration 1; Q6 icon/bold → iteration 5; Q7 editor UI → iteration 6; Q8 edge cases → iteration 7; Q9 mobile/iCloud/perf → iteration 8; Q10 diff hygiene → iteration 9. Spec Open Question 1 (icon representation) answered with in-repo evidence (RecordIcon token dialect); spec Open Question 2 (009 unification) answered by 009's spec + research (SourceRuleNode is the tree; no unification needed — the tree already serves both sides); spec Open Question 3 (fork subdirectory) answered by actual fork path (src/data/).

### F10.4 — Ranked enrichment (evidence-cited, for synthesis)
| Rank | Recommendation | Evidence | Effort | Blast radius |
|------|----------------|----------|--------|--------------|
| 1 | Extend `applyConditionalFormat`/`getConditionalFormatMatch` to evaluate a `SourceRuleNode` condition tree via the 009 evaluator; legacy `condition` normalizes to a single-leaf root AND group; root empty/missing tree fails closed | F1.1/F4.1/F4.3/F7.1-E1,E2 | S | Core file only |
| 2 | Add `icon?`/`bold?` to `ConditionalFormatRule` and `ConditionalFormatMatch`; paint bold via `db-conditional-format-bold` class, icon via `data-note-database-conditional-icon` + span (non-TR); reuse `parseRecordIconToken` dialect + `getValidRecordIconIds` | F1.6/F5.1-F5.3/F8.2 | S | Core + styles.css |
| 3 | Editor: condition-tree rows (source-rule group renderer variant, positional splice), icon button via existing `openIconPickerPopover`, bold toggle; reuse `panel.and/or/addCondition` i18n | F4.2/F6.1-F6.3/F5.5 | M | ViewConfigPanelRenderer.ts |
| 4 | Additive parse in `DataSource.parseConditionalFormats` (conditionTree via `parseSourceRuleTree` restricted to view ops; icon ≤64 chars; bold boolean) | F4.5/F7.1-E10,E11 | S | DataSource.ts |
| 5 | Tree-aware rename/delete in `ColumnOperations` via `updateSourceRuleTreeKeyReferences`/`removeSourceRuleTreeReferences` | F2.4/F7.1-E8,E9 | S | ColumnOperations.ts |
| 6 | `valueSource:"today"` substitution for date leaves inside trees (rule-level flag, resolveRule extension) | F7.1-E5/F7.3 | S | Core |
| 7 | Tree-only missing-column non-match (spec §8) — scoped to tree rules to preserve NFR-R01 | F7.2 | S | Core |
| 8 | Test harness: minimal `src/__tests__/setup.ts` + `test` script + 12-case `ConditionalFormatting.test.ts` | F5.6/F9.3 | S | test files |
| 9 | Optional hardening: `Intl.Segmenter` guard in `RecordIcon.isSingleEmojiGrapheme` | F8.2 | XS | RecordIcon.ts |

**Priority note:** ranks 1-2 are REQ-001/REQ-003/REQ-004 blockers; 3-5 complete REQ-006/REQ-007 + editor UX; 6-7 are spec edge-case compliance; 8 is the verification gate; 9 is optional. Items 1-8 together = the 8-file additive inventory (F9.1) with zero consumer call-site edits.

## Questions Answered
- All Q1-Q10 closed (F10.3); quality gates pass (F10.2); REQ/SC mapping complete (F10.4).

## Questions Remaining
- None. Synthesis may proceed.

## Next Focus
Synthesis: compile `research.md` from iterations 1-10 with the ranked enrichment, eliminated alternatives, and convergence report.

---
