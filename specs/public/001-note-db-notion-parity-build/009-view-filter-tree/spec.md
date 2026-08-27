---
title: "Feature Specification: Nested AND/OR View Filter Tree"
description: "Add nested AND/OR filter groups to view filters by reusing the existing recursive SourceRuleNode tree with a Kleene three-valued evaluator, instead of inventing a new filter AST or reusing the data-source matchesSourceRuleTree walk."
trigger_phrases:
  - "view filter"
  - "nested and or"
  - "filter tree"
  - "filter groups"
  - "filter panel"
  - "filter parity"
  - "applyfiltertree"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/009-view-filter-tree"
    last_updated_at: "2026-08-27T17:09:01Z"
    last_updated_by: "phase-architect"
    recent_action: "Nested sub-phases authored from synthesis and final-plan"
    next_safe_action: "Build 001-kleene-eval-module per its plan.md and tasks.md"
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
# Feature Specification: Nested AND/OR View Filter Tree

> Phase adjacency — predecessor: `008-derived-inverse-relations`; successor: `010-conditional-format-icons` Parent spec: [`../spec.md`](../spec.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-24 |
| **Branch** | `009-view-filter-tree` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
View filters today are a flat `FilterRule[]` with a single global `filterLogic` (`and` | `or`) applied uniformly across every rule (`QueryEngine.ts:74-89`). A user cannot express `(A and B) or C` in a view. The data-SOURCE rules already solve this with a recursive `SourceRuleNode` tree (`group` | `not` | `expression`, `types.ts:234-250`) and a working nested editor (`ViewConfigPanelRenderer.ts:804-929`). The view side is the Notion-parity gap: Notion's own API defines recursive `and`/`or` compound filter objects with no depth cap (`https://developers.notion.com/reference/post-database-query-filter`), and its UI caps nesting at three layers.

### Purpose
Close the gap by reusing the `SourceRuleNode` tree type in a new isolated `src/data/ViewFilterTree.ts` module with a **Kleene three-valued** evaluator (`evaluateViewFilterTree`) and a leaf callback into `QueryEngine`'s private `matchesFilter`. Do **not** reuse `matchesSourceRuleTree` for views — its empty-AND→true / empty-OR→false semantics (`SourceRules.ts:152`) poison nested OR groups. Do **not** invent a `FilterGroup` AST. The module follows the fork's `EuroFormat.ts` isolated-diff model (`EuroFormat.ts:9-10`): type-only import from `./types`, zero runtime import from `SourceRules.ts` or `QueryEngine.ts`. This unblocks phase 010 (multi-condition conditional formatting reuses the same tree). Nested children own the ordered slices: Kleene eval module, persistence, panel editor, non-panel coherence, then proof.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New isolated module `src/data/ViewFilterTree.ts`: `buildViewFilterTree`, `normalizeViewFilterTree`, `pruneViewFilterTree` (may runtime-import `isEffectiveFilterRule` from `FilterRules.ts:3-12`; `SourceRules.ts`/`QueryEngine.ts` still forbidden), `evaluateViewFilterTree` (Kleene three-valued), `serializeViewFilterTree`, leaf helpers (`flattenLeaves`, `mapLeafAt`/`removeLeafAt`/`appendLeaf`), `getRequiredViewFilterLeaves` (AND-required only; OR/`not` → `[]`), and local duck-type predicates (`type === "group"|"not"|"expression"`) — do **not** import `isSourceRuleGroup` from `SourceRules.ts`.
- `QueryEngine.applyFilterTree` (row-array; root `!== false` visible) **and** `QueryEngine.evaluateFilterTree(row, tree, columns): boolean | null` (single-row three-valued wrapper so phase 010 can match iff `=== true` without exporting `matchesFilter`) — additive; `matchesFilter` stays private; flat `applyFilters` (`74-89`) untouched.
- `RowPipeline.ts:93-97` — prune then evaluate one path (tree if present, else legacy flat).
- `types.ts` — two additive `filterTree?: SourceRuleNode` fields on `ViewModeStateDef` (after `filters` at `164-173`) and `ViewConfig` (after `filters` at `397-399`); add `filterTree` *next to* `filters`, not *as* `filters`.
- `ViewStateStore.ts` — `filterTree` on `DatabaseViewState`; hydrate (`create` `86-113`), persist (`toPersistedState` `115-127`), recursive dead-field prune in `get` (`40-46`).
- `DataSource.ts` — parse `filterTree` via `normalizeViewFilterTree` at both view constructors (`701-702`, `908-909`); put `filterTree` on the serializable view object (next to `1116-1117`); add `"filterTree"` to `legacyViewKeys()` next to `"filters"` (`1239-1240`). Do **not** call `parseSourceRuleTree` (`SourceRules.ts:227-257`) — that whitelist is `SOURCE_RULE_OPERATORS` (`7-28`). Without this site `filterTree` is session-only and REQ-006 fails on reload.
- `FilterPanelRenderer.ts` — recursive tree editor copying **group/`not` chrome only** from `renderSourceRuleNode`/`renderSourceRuleGroup` (`ViewConfigPanelRenderer.ts:846-929`) with an added `depth` argument (those lines have no depth param today — the 3-layer cap is *added*, not copied); leaves stay `renderFilterRow`/`renderSingleRuleEditor` (`FilterPanelRenderer.ts:107-123`, `148+`) so no source-operator editor leaks (a leaked source op falls through `matchesFilter`'s `default: return true` at `QueryEngine.ts:124-125` and matches every row); reuse `.db-source-rule-*` CSS (`styles.css:9192-9234`) so `styles.css` and `i18n.ts` stay out of the diff; no "add empty group", no "add expression".
- Non-panel mutation coherence (one slice): `ViewRuleOperations.removeFilterRuleAt` (`12-15`), `ColumnOperations` viewState loop (`499-509`) **and** `removeColumnFromState` (`512-514`), `ColumnConfig.ts` rename (`246-249`), `DatabaseView.applyChartFilters` (`9651-9667`), `EmbeddedDatabaseRenderer.applyChartFilters` (`1779-1793`) — dual-write `state.filters` **and** `state.filterTree` so nested views do not desync on chip/delete/rename/drilldown. Hide the active-rail AND/OR logic toggle when the tree is nested (`ActiveViewControlsRenderer.ts:82-89`); if the toggle remains for flat trees, `toggleActiveFilterLogic` (`DatabaseView.ts:1999-2006`, `EmbeddedDatabaseRenderer.ts:1452-1458`) must write both `filterLogic` and tree-root `logic`. New-record defaults: `getDefaultFrontmatterFromViewFilters` (`DatabaseView.ts:3991-4009`) uses `getRequiredViewFilterLeaves` instead of "all DFS leaves if root AND" so OR-group values do not seed frontmatter.
- Test scaffold: `src/__tests__/setup.ts` (new no-op; `vitest.config.ts:4-7` references it but it does not exist), `src/data/__tests__/ViewFilterTree.test.ts`, and a `"test": "vitest run"` script added to the fork `package.json` (no `test` script today) so the harness is runnable.
- Legacy flat `FilterRule[]` + `filterLogic` promotion into a root group (backward compatible).

### Out of Scope
- A new `FilterGroup` AST — explicitly forbidden; `SourceRuleNode` is the single tree type.
- Changes to `matchesSourceRuleTree` or the data-source rule evaluation path — frozen, out of scope.
- Id-based tree surgery — `SourceRuleNode` is positional (`ViewConfigPanelRenderer.ts:921-927`); AppFlowy's id-based ops are not needed.
- AppFlowy per-row `DashMap` cache (`controller.rs:350-409`) — optional future optimization.
- AppFlowy chip-`Wrap` as the group editor (`filter_menu.dart:62-66` is leaf layout only).
- Anytype `In`/`Allin`/`ExactIn` operators (`dataview.ts:60-78`) — list-operator parity is a later phase.
- A 3-level cap in the evaluator — cap belongs in the editor only (Notion UI caps at 3; API is unbounded).
- Phase 010 conditional-format icons (consumes this tree, built in its own phase; `ConditionalFormatting.ts:38` stays until 010).
- Rollup, footer, chart, or template changes.

### Files to Change

All paths are relative to the fork root.

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/ViewFilterTree.ts` | Add | Isolated EuroFormat module: build/normalize/prune/evaluate (Kleene)/serialize + leaf helpers + `getRequiredViewFilterLeaves` + local duck-type predicates; type-only import from `./types` |
| `src/data/QueryEngine.ts` | Edit | Additive `applyFilterTree` (row-array, root `!== false` visible) **and** `evaluateFilterTree(row, tree, columns): boolean \| null` (single-row three-valued for 010); `matchesFilter` stays private (`91-127`); flat path `74-89` untouched |
| `src/data/RowPipeline.ts` | Edit | Route through `applyFilterTree` when tree present, else legacy `applyFilters` (`93-97`) |
| `src/data/types.ts` | Edit | Two additive `filterTree?: SourceRuleNode` fields (`ViewModeStateDef` after `filters` `164-173`, `ViewConfig` after `filters` `397-399`) |
| `src/data/DataSource.ts` | Edit | Parse `filterTree` via `normalizeViewFilterTree` at both view constructors (`701-702`, `908-909`); add `filterTree` to serializable view object (`1116-1117`); add `"filterTree"` to `legacyViewKeys()` (`1239-1240`); do not call `parseSourceRuleTree` |
| `src/views/ViewStateStore.ts` | Edit | Hydrate/persist/prune `filterTree` (`create` `86-113`, `toPersistedState` `115-127`, `get` `40-46`) |
| `src/views/FilterPanelRenderer.ts` | Edit | Recursive tree editor copying **group/`not` chrome only** from `renderSourceRuleGroup` (`846-929`) with an added `depth` arg; leaves reuse `renderFilterRow`/`renderSingleRuleEditor` (`107-123`); depth cap 3; wrap-into-group gesture; no add-expression/add-empty-group |
| `src/views/ViewRuleOperations.ts` | Edit | Dual-write `state.filters` + `state.filterTree` on chip mutations (`12-15`) |
| `src/views/ColumnOperations.ts` | Edit | Dual-write on column delete — viewState loop (`499-509`) and `removeColumnFromState` (`512-514`) |
| `src/data/ColumnConfig.ts` | Edit | Dual-write on field rename (`246-249`) |
| `src/views/DatabaseView.ts` | Edit | Dual-write on chart drilldown (`applyChartFilters` `9651-9667`); `toggleActiveFilterLogic` writes tree-root `logic` too (`1999-2006`); `getDefaultFrontmatterFromViewFilters` uses `getRequiredViewFilterLeaves` (`3991-4009`) |
| `src/views/EmbeddedDatabaseRenderer.ts` | Edit | Dual-write on chart drilldown (`applyChartFilters` `1779-1793`); `toggleActiveFilterLogic` writes tree-root `logic` too (`1452-1458`) |
| `src/views/ActiveViewControlsRenderer.ts` | Edit | Hide the AND/OR logic toggle when `filterTree` is nested (`82-89`) |
| `package.json` | Edit | Add `"test": "vitest run"` script (none today) so the harness is runnable |
| `src/__tests__/setup.ts` | Add | No-op setup file referenced by `vitest.config.ts:4-7` but missing |
| `src/data/__tests__/ViewFilterTree.test.ts` | Add | `(A and B) or C`, `not` groups, empty groups (root + nested), single-leaf ≡ flat, serialization round-trip, `getRequiredViewFilterLeaves` ignores OR children, legacy regression |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | View filters support nested AND/OR groups with Kleene three-valued evaluation | A tree evaluating `(A and B) or C` returns the expected row subset; `group` and `not` nodes compose; empty groups are skip (`null`) in every position, never OR-poison (`SourceRules.ts:152`) or OR-of-all-skips-hides-every-row (`controller.rs:493-503`); `expression` nodes evaluate `false` |
| REQ-002 | Reuse the existing `SourceRuleNode` tree — no new AST | `SourceRuleNode` (`types.ts:234-250`) is the only filter-tree type used by view filters; grep-verifiable: no `FilterGroup` type introduced |
| REQ-003 | `QueryEngine.applyFilterTree` evaluates view trees | The new path returns the same row subset as the flat path for single-group trees given the same `matchesFilter`; root `null`/missing tree → all rows (`QueryEngine.ts:80`) |
| REQ-004 | Filter panel builds and edits the tree | `FilterPanelRenderer.ts` renders recursive group/not rows copying **group/`not` chrome only** from `renderSourceRuleGroup` (`ViewConfigPanelRenderer.ts:878-929`) with an added `depth` argument; leaves reuse `renderFilterRow`/`renderSingleRuleEditor` (`107-123`) — no source-operator editor leaks (grep: no `inFolder`/`hasProperty`/`strictEq`/source `expression` in the view panel); wrap-selected-rule-into-AND-group is the create-group gesture (no "add empty group", no "add expression"); depth cap 3 in the UI (4th group layer refused); usable at mobile width |
| REQ-005 | Legacy flat filters keep working | Existing `FilterRule[]` + `filterLogic` views load via `buildViewFilterTree` as a root group with identical row subsets; `toPersistedState` omits `filterTree` when the tree is a single flat group (legacy bytes unchanged) |
| REQ-006 | Persistence round-trips without churny writes | `filterTree` is canonical when present; on panel commit, dual-write DFS leaves into `state.filters` and root logic into `state.filterLogic` for toolbar badges; nested/`not` trees persist `filterTree`; **`DataSource.ts` parses and serializes `filterTree`** at both view constructors (`701-702`, `908-909`) and via `legacyViewKeys()` (`1239-1240`) so the tree survives save/reload (without this site `filterTree` is session-only); flat views do not grow a `filterTree` key; config writes ride the existing `scheduleConfigSave` debounce (`DatabaseView.ts:6213-6252`) — no new save API |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-007 | Rebase-friendly diff with honest call-site count | EuroFormat isolation core: 1 new module + 3 call sites (`QueryEngine.ts`, `FilterPanelRenderer.ts`, `ViewStateStore.ts`); mechanical extras required to run: `types.ts` + `RowPipeline.ts` + **`DataSource.ts`** (without it `filterTree` dies on reload); non-panel coherence: `ViewRuleOperations.ts`, `ColumnOperations.ts`, `ColumnConfig.ts`, both `applyChartFilters`, `ActiveViewControlsRenderer.ts` (rail toggle hide), and `DatabaseView.ts`/`EmbeddedDatabaseRenderer.ts` `toggleActiveFilterLogic` + `getDefaultFrontmatterFromViewFilters` — shipping panel+eval without those makes nested groups correct only until the next chip/delete/drilldown/new-record |
| REQ-008 | Phase 010 unblocked | Public surface exported this phase: `evaluateViewFilterTree`, `normalizeViewFilterTree` (from `src/data/ViewFilterTree.ts`), **and** `QueryEngine.evaluateFilterTree` (single-row three-valued) + `QueryEngine.applyFilterTree` — so 010 can match iff `=== true` without exporting `matchesFilter` or forcing `applyFilterTree([row])` (null-passes would paint every row); `ConditionalFormatting.ts:38` stays on `applyFilters` until 010 |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `(A and B) or C` evaluation test passes; empty nested AND under OR does not match every row (Kleene skip, not `matchesSourceRuleTree` poison).
- **SC-002**: Grep across the fork source confirms `SourceRuleNode` is the only filter-tree type; no `FilterGroup` AST introduced.
- **SC-003**: The filter panel creates, edits, and persists nested groups; wrap-into-group, auto-collapse empty groups, and depth cap 3 verified in the vault at mobile width; no source-operator editor leaks into the view panel.
- **SC-004**: Legacy flat-filter views are unchanged; `toPersistedState` omits `filterTree` for flat groups; `DataSource.ts` round-trips nested trees (survives save/reload) and flat views do not grow a `filterTree` key; regression suite passes.
- **SC-005**: Non-panel mutations (chips, column delete/rename, chart drilldown) dual-write `state.filters` **and** `state.filterTree` so nested views do not desync; the active-rail AND/OR toggle is hidden when nested (or writes tree-root `logic` when flat); new-record defaults use `getRequiredViewFilterLeaves` so OR-group values do not seed frontmatter.
- **SC-006**: Diff review shows 1 new module + the locked call sites; `styles.css` and `i18n.ts` stay out of the diff; no telemetry, no secrets.

### Acceptance Scenarios

- **Scenario 1**: **Given** a view with tree `(A and B) or C`, **when** `applyFilterTree` runs, **then** the expected rows are shown and an empty nested group is skipped (not OR-poison).
- **Scenario 2**: **Given** a legacy flat-filter view, **when** the view loads, **then** `buildViewFilterTree` produces a root group with identical row subsets and `filterTree` is omitted from persisted config.
- **Scenario 3**: **Given** the extended filter panel, **when** a user wraps a rule into a group and adds a nested `not`, **then** the tree serializes and survives reload; depth 4 is refused.
- **Scenario 4**: **Given** a chart drilldown or column delete on a nested-tree view, **when** the mutation fires, **then** `state.filters` is dual-written so the next panel open shows the correct tree.
- **Scenario 5**: **Given** the final diff, **when** reviewed, **then** it matches the EuroFormat isolated-module shape with `styles.css` untouched.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Phase 010 conditional-format-icons | Multi-condition formatting stays blocked until the tree ships | Ship the tree as its own exported module so 010 only consumes it |
| Risk | Non-panel mutation desync — the single biggest risk | If `filterTree` is persisted but chips (`ViewRuleOperations.ts:12-15`), column-delete (`ColumnOperations.ts:499-514`), field-rename (`ColumnConfig.ts:246-249`), and chart drilldown (`DatabaseView.ts:9651-9667`, `EmbeddedDatabaseRenderer.ts:1779-1793`) keep writing only `state.filters`, nested groups desync on the next non-panel edit | Wire all non-panel sites to dual-write `state.filters` **and** `state.filterTree` in the same phase (synthesis open question #1 default) |
| Risk | `filterTree` lost on reload (DataSource gap) | `DataSource.ts` whitelist-builds views from `filterLogic`/`filters` only (`701-702`, `908-909`); the serializable view object (`1116-1117`) and `legacyViewKeys()` (`1239-1240`) have no `filterTree` — without wiring this site, `filterTree` is session-only and REQ-006 fails | Parse `filterTree` via `normalizeViewFilterTree` at both view constructors; add it to the serializable view object and `legacyViewKeys()`; do not call `parseSourceRuleTree` |
| Risk | Active-rail logic toggle desync | `toggleActiveFilterLogic` (`DatabaseView.ts:1999-2006`, `EmbeddedDatabaseRenderer.ts:1452-1458`) flips `state.filterLogic` without updating `filterTree`, desyncing nested views | Hide the rail AND/OR toggle when nested (`ActiveViewControlsRenderer.ts:82-89`); if it stays for flat trees, write both `filterLogic` and tree-root `logic` |
| Risk | OR-poisoned new-record defaults | `getDefaultFrontmatterFromViewFilters` (`DatabaseView.ts:3991-4009`) seeds every DFS leaf when root is AND; a root-AND with an inner OR would seed OR-side leaves into frontmatter | Use `getRequiredViewFilterLeaves` (AND-required only; OR/`not` → `[]`) instead of "all DFS leaves if root AND" |
| Risk | Source-operator editor leak in the view panel | Copying `renderSourceRuleLeaf` (`ViewConfigPanelRenderer.ts:931+`) by accident pulls source ops (`inFolder`/`hasProperty`/`strictEq`/source `expression`); unknown view ops fall through `matchesFilter`'s `default: return true` (`QueryEngine.ts:124-125`), matching every row | Copy **group/`not` chrome only**; leaves reuse `renderFilterRow`/`renderSingleRuleEditor`; grep guard for source ops in the view panel |
| Risk | `matchesSourceRuleTree` empty-group poisoning | Empty AND → true nested under OR matches every row (`SourceRules.ts:152`) | Use Kleene three-valued `evaluateViewFilterTree`, not `matchesSourceRuleTree`; document the AppFlowy divergence (`controller.rs:493-503`) in the test file |
| Risk | Source-only operator leak via `parseSourceRuleTree` | Wrapping `parseSourceRuleTree` (`SourceRules.ts:227-257`) would pull `inFolder`, `hasProperty`, etc. (`SourceRules.ts:7-28`); unknown view ops fall through `matchesFilter`'s `default: return true` (`QueryEngine.ts:124-125`), matching every row | `ViewFilterTree.ts` has zero runtime import from `SourceRules.ts`; `normalizeViewFilterTree` uses a view-operator allow-list; local duck-type predicates, no `isSourceRuleGroup` import |
| Risk | Nested-group UI complexity on mobile | Deep trees are hard to manipulate at phone width | Reuse `.db-source-rule-*` CSS (`styles.css:9192-9234`): `border-left` indent, `min-width: 0`, flex 180/130; depth cap 3 cuts nested chrome |
| Risk | Malformed persisted trees | Old or corrupted view configs crash evaluation | `normalizeViewFilterTree` drops unknown kinds with `console.warn`; truncated/non-object root → `undefined` (not an empty OR group); never throw |
| Risk | Test infra missing | `vitest.config.ts:4-7` references `src/__tests__/setup.ts` which does not exist; first `vitest` run fails before any assertion | Scaffold `src/__tests__/setup.ts` as a no-op in this phase |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Tree evaluation stays fast on vault-scale views (thousands of rows) — a single linear pass: O(rows × nodes) with short-circuit AND/OR, stack O(depth); no per-row cache this phase (`controller.rs:350-409` DashMap is optional future work).

### Security
- **NFR-S01**: No secrets, no telemetry; code stays MIT-forkable.

### Reliability
- **NFR-R01**: Mobile-safe only (no desktop-only APIs); iCloud-safe — no churny writes (omit `filterTree` when flat; ride existing `scheduleConfigSave` debounce `300ms` with flush-on-deactivate `1261-1263` and flush-on-activation `1805-1811`); rollups/charts/templates remain display-only — evaluation does not write notes.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- Missing/`undefined` tree or empty root → all rows (`QueryEngine.ts:80`), even if `filterLogic === "or"` (flat path short-circuits on `filters.length === 0` before OR-false). Nested empty groups are skip (`null`), never OR-poison (`SourceRules.ts:152`) and never OR-of-all-skips-hides-every-row (`controller.rs:493-503`).
- One leaf ≡ today's flat path (REQ-003) given the same `matchesFilter`.
- `not` wrapping a group; 3+ levels in the evaluator (unbounded); UI refuses a 4th group layer.
- Ineffective leaves (`FilterRules.ts:3-12`): prune recursively before eval so a blank value cannot satisfy/poison OR.
- New-record defaults (`DatabaseView.ts:3991-4009`) already no-op on root OR; nested trees must keep that — only AND-required leaves seed frontmatter via `getRequiredViewFilterLeaves` (OR/`not` children → `[]`), same idea as `getRequiredSourceRules` (`SourceRules.ts:159-165`).

### Error Scenarios
- Malformed/`unknown` node kinds: drop + `console.warn`, never throw. Truncated/non-object root → `undefined` (not an empty OR group).
- Dead schema fields: prune leaves recursively at `ViewStateStore.get` (same as today's `state.filters` filter at line 46). Groups emptied by prune stay skip.
- `expression` nodes in persisted junk: evaluate `false`; no view-panel control to add them.

### Concurrent Operations
- Two clients editing the same view config: documented last-write-wins; no new race (tree field is view-config JSON, same as `filters` today; same debounce path).

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 18/25 | One view-surface feature: Kleene evaluator + UI + persistence (`ViewStateStore` + `DataSource`) + non-panel coherence (chip/delete/rename/drilldown + rail toggle + new-record seeding) |
| Risk | 13/25 | Non-panel desync + DataSource reload gap + source-op leak + empty-group poisoning + rail-toggle desync + OR-poisoned new-record; all mitigated in synthesis/final-plan |
| Research | 10/20 | 10 iterations across fork + AppFlowy + Anytype + Notion; synthesis ranked and cited; final-plan review added DataSource/rail/new-record/010-API gaps |
| **Total** | **41/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

1. **REQ-007 ≤3 call sites vs the real mutation surface.** Default: accept `types.ts` + `RowPipeline.ts` + **`DataSource.ts`** as mechanical extras, and wire `ViewRuleOperations.ts` + `ColumnOperations.ts` + `ColumnConfig.ts` + both `applyChartFilters` + `ActiveViewControlsRenderer.ts` (rail toggle hide) + `toggleActiveFilterLogic` + `getDefaultFrontmatterFromViewFilters` in the same phase. Shrinking back to three files means nested trees are panel-only and will desync (or die on reload without `DataSource.ts`).
2. **Kleene skip vs AppFlowy "OR of all-skips = false".** Default: Kleene (spec §8 no-op). Document the AppFlowy divergence in the test file (`controller.rs:493-503`).
3. **When to persist `filterTree`.** Default: only when the tree has a nested group or a `not`. Flat groups stay `filters` + `filterLogic` so existing vault configs do not grow a new key (iCloud-quiet). First nested edit is the promotion write.
4. **Active-rail chips on nested trees.** Default (now tasked): keep DFS leaf chips (dual-write); **hide the rail logic toggle when `filterTree` is nested** (`ActiveViewControlsRenderer.ts:82-89`); if the toggle remains for flat trees, `toggleActiveFilterLogic` (`DatabaseView.ts:1999-2006`, `EmbeddedDatabaseRenderer.ts:1452-1458`) writes both `filterLogic` and tree-root `logic`. Those users edit groups in the panel.
5. **`expression` in the view filter UI.** Default: no "add expression" in the filter panel; evaluator maps them to `false`.
6. **Mobile leaf presentation.** Default: keep the existing row-list + flex-shrink (popover, not a toolbar). Measure popover width in the phase checklist.
7. **Single-child groups after delete.** Default: auto-collapse empty groups (Anytype/Notion); do not auto-flatten a remaining single child except when persist-normalization drops `filterTree` because the tree is flat-equivalent.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Research**: `research/synthesis.md` (ranked findings) and `research/research.md` (full evidence trail)

<!-- /ANCHOR:related-docs -->

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | 001-kleene-eval-module/ | Isolated `ViewFilterTree.ts` Kleene evaluator, QueryEngine bridges, RowPipeline routing, additive `filterTree` types, Vitest harness and module tests | Complete |
| 2 | 002-filter-tree-persistence/ | Disk round-trip: `DataSource.ts` parse/serialize plus `ViewStateStore` hydrate/persist/prune; omit `filterTree` when flat | Complete |
| 3 | 003-filter-panel-tree-editor/ | Recursive group/`not` filter panel: wrap-into-group, auto-collapse empty groups, UI depth cap 3, existing filter leaves | Complete |
| 4 | 004-nonpanel-filter-coherence/ | Dual-write chips, column delete/rename, chart drilldown; hide nested rail logic toggle; AND-required new-record leaves | Complete (coherence tests added in a later fix pass, commit `e854681`) |
| 5 | 005-filter-tree-proof/ | 010 API freeze, `(A and B) or C` plus legacy tests, vault reload, grep guards | Deferred — manual vault/grep proof never executed; the automated portions (Vitest, 010 export freeze) are independently confirmed by `research/sonnet-verification.md` |

Future / out of this phase (not child folders): a new `FilterGroup` AST; id-based tree surgery; AppFlowy `DashMap` cache; chip-`Wrap` group editor; Anytype `In`/`AllIn`/`ExactIn`; changes to `matchesSourceRuleTree`; a 3-level cap in the evaluator; `styles.css` edits; `ConditionalFormatting.ts:38` stays on `applyFilters` until phase 010.

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001-kleene-eval-module | 002-filter-tree-persistence | `ViewFilterTree.ts` exports Kleene eval plus leaf helpers; `QueryEngine.applyFilterTree` and `evaluateFilterTree` additive; `RowPipeline.ts:93-97` routes; `types.ts` has `filterTree?`; `npx vitest run` green on `ViewFilterTree.test.ts`; `applyFilters` `74-89` and `matchesFilter` `91-127` untouched | Single-leaf ≡ flat; empty/missing tree ≡ all rows (`QueryEngine.ts:80`); no runtime import from `SourceRules.ts`; `matchesFilter` not exported |
| 002-filter-tree-persistence | 003-filter-panel-tree-editor | Nested tree survives save/reload; flat views omit `filterTree`; `create` hydrates via `normalizeViewFilterTree`; dead-field prune is recursive | `DataSource.ts` constructors `701-702`/`908-909`, serializable object `1116-1117`, `legacyViewKeys()` `1239-1240`; `toPersistedState` `115-127` omits when flat |
| 003-filter-panel-tree-editor | 004-nonpanel-filter-coherence | `(A and B) or C` editable in the panel at mobile width; wrap-into-group; empty groups removed; 4th group layer refused; rail popover still edits one leaf | Copy group/`not` chrome only (`ViewConfigPanelRenderer.ts:846-929`); leaves stay `renderFilterRow`/`renderSingleRuleEditor` (`107-123`); `styles.css` untouched |
| 004-nonpanel-filter-coherence | 005-filter-tree-proof | Chip delete, column delete/rename, and chart drilldown dual-write `state.filters` and `state.filterTree`; nested rail AND/OR toggle hidden; new-record seeding uses AND-required leaves only | Sites: `ViewRuleOperations.ts:12-15`, `ColumnOperations.ts:499-514`, `ColumnConfig.ts:246-249`, `applyChartFilters` `9651-9667` and `1779-1793`, `ActiveViewControlsRenderer.ts:82-89`, `getRequiredViewFilterLeaves` at `DatabaseView.ts:3991-4009` |
<!-- /ANCHOR:phase-map -->
