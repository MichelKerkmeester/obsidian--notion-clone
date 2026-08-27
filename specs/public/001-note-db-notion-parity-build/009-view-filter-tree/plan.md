---
title: "Implementation Plan: Nested AND/OR View Filter Tree"
description: "Implementation plan for reusing the SourceRuleNode tree in view filters via a new isolated ViewFilterTree.ts module with a Kleene three-valued evaluator and QueryEngine.applyFilterTree."
trigger_phrases:
  - "view filter"
  - "filter tree"
  - "filter groups"
  - "applyfiltertree"
  - "filter panel"
  - "and or filters"
  - "filter parity"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/009-view-filter-tree"
    last_updated_at: "2026-08-27T17:09:01Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan findings; 12-step phases + DataSource + evaluateFilterTree"
    next_safe_action: "Run validate.sh --strict; then implement tasks.md Step 1"
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
# Implementation Plan: Nested AND/OR View Filter Tree

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API |
| **Framework** | Fork of an MIT Obsidian plugin (`note-database-fork`) |
| **Storage** | Vault markdown/frontmatter data + view config (iCloud-synced) |
| **Testing** | `vitest` (`vitest.config.ts:4-7`); `src/__tests__/setup.ts` must be scaffolded (missing); `"test": "vitest run"` must be added to fork `package.json` (no `test` script today) |

### Overview
This plan adds nested AND/OR groups to VIEW filters by reusing the existing `SourceRuleNode` tree type (`types.ts:234-250`) through a new isolated `src/data/ViewFilterTree.ts` module with a **Kleene three-valued** evaluator (`evaluateViewFilterTree`) and a leaf callback into `QueryEngine`'s private `matchesFilter`. The evaluator does **not** reuse `matchesSourceRuleTree` (`SourceRules.ts:144-156`) — its empty-AND→true / empty-OR→false semantics (`SourceRules.ts:152`) poison nested OR groups. The module follows the `EuroFormat.ts` isolated-diff model (`EuroFormat.ts:9-10`): type-only import from `./types`, zero runtime import from `SourceRules.ts` or `QueryEngine.ts`. `FilterPanelRenderer.ts` gets a recursive tree editor copying **group/`not` chrome only** from the fork's own source-rule editor (`ViewConfigPanelRenderer.ts:846-929`) with an added `depth` argument, reusing `.db-source-rule-*` CSS (`styles.css:9192-9234`) so `styles.css` and `i18n.ts` stay out of the diff. Persistence spans `ViewStateStore.ts` **and** `DataSource.ts` (without the latter `filterTree` dies on reload); non-panel coherence covers chip/delete/rename/drilldown plus the rail-logic-toggle hide and OR-safe new-record seeding. This unblocks phase 010, which consumes `QueryEngine.evaluateFilterTree` (single-row three-valued) rather than exporting `matchesFilter`.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Fork `QueryEngine.ts` (`74-89`, `91-127`), `types.ts` (`234-250`, `164-173`, `397-399`), `FilterPanelRenderer.ts` (`81-90`, `107-123`, `125-146`), `RowPipeline.ts` (`93-97`), `ViewStateStore.ts` (`40-46`, `69-127`), `DataSource.ts` (`701-702`, `908-909`, `1116-1117`, `1239-1240`), `ActiveViewControlsRenderer.ts` (`82-89`), `DatabaseView.ts` (`1999-2006`, `3991-4009`, `9651-9667`), `EmbeddedDatabaseRenderer.ts` (`1452-1458`, `1779-1793`), and `ViewConfigPanelRenderer.ts` (`846-929`) read.
- [ ] `research/synthesis.md`, `research/research.md`, and `research/final-plan.md` read.
- [ ] Scope limited to the view-filter tree; `matchesSourceRuleTree` and data-source rule files untouched.

### Definition of Done
- [ ] `src/data/ViewFilterTree.ts` built with Kleene three-valued `evaluateViewFilterTree`, `getRequiredViewFilterLeaves`, and local duck-type predicates; `QueryEngine.applyFilterTree` + `evaluateFilterTree`, `RowPipeline` routing, `types.ts` fields, `ViewStateStore` hydrate/persist/prune, `DataSource.ts` parse/serialize/`legacyViewKeys`, and `FilterPanelRenderer` tree editor all built.
- [ ] Non-panel mutation coherence: `ViewRuleOperations.ts`, `ColumnOperations.ts`, `ColumnConfig.ts`, both `applyChartFilters`, `ActiveViewControlsRenderer.ts` (rail toggle hide), `toggleActiveFilterLogic` (both sites), and `getDefaultFrontmatterFromViewFilters` all dual-write / use `getRequiredViewFilterLeaves`.
- [ ] `src/__tests__/setup.ts` scaffolded; `"test": "vitest run"` added to fork `package.json`; `src/data/__tests__/ViewFilterTree.test.ts` passes: `(A and B) or C`, `not` groups, empty groups (root + nested), single-leaf ≡ flat, serialization round-trip, `getRequiredViewFilterLeaves` ignores OR children, legacy regression.
- [ ] `styles.css` and `i18n.ts` untouched; no source-operator editor leaked into the view panel; diff is 1 new module + locked call sites; checklist fully verified.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Recursive `SourceRuleNode` tree (`types.ts:234-250`) reused verbatim as the view-filter tree — no new filter AST. Evaluation is a **Kleene three-valued** walk in `evaluateViewFilterTree` (not `matchesSourceRuleTree`); the UI builds the same tree shape via a recursive renderer copied from the fork's source-rule editor.

### Locked Module: `src/data/ViewFilterTree.ts`
EuroFormat isolated module (`EuroFormat.ts:9-10`): **type-only import from `./types`**, **zero runtime import from `SourceRules.ts` or `QueryEngine.ts`**. This resolves the F1.4 vs F9.1 contradiction: wrapping `parseSourceRuleTree` (`SourceRules.ts:227-257`) would pull source-only operators (`inFolder`, `hasProperty`, … at `SourceRules.ts:7-28`); unknown view ops fall through `matchesFilter`'s `default: return true` (`QueryEngine.ts:124-125`), so a leaked source op would match every row.

Exports:
- `buildViewFilterTree(filters, logic)` — same shape as `createLegacySourceRuleTree` (`SourceRules.ts:48-59`): `[] → undefined`, one rule → leaf, else `{ type:"group", logic, rules }`.
- `normalizeViewFilterTree(value)` — view-operator allow-list; drop unknown kinds with `console.warn`; truncated/non-object root → `undefined` (not an empty OR group).
- `pruneViewFilterTree(tree, isEffective)` — recursive; may runtime-import `isEffectiveFilterRule` (`FilterRules.ts:3-12`) so empty-value in-progress leaves cannot poison an OR. (`SourceRules.ts`/`QueryEngine.ts` remain forbidden runtime imports.)
- `evaluateViewFilterTree(tree, matchesLeaf): boolean | null` — **Kleene three-valued**, not `matchesSourceRuleTree`.
- `serializeViewFilterTree(tree)` — stable JSON for round-trip tests.
- `getRequiredViewFilterLeaves(tree)` — AND-required leaves only; OR / `not` children → `[]`. Called from `DatabaseView.ts:3991` to prevent OR-poisoned new-record defaults (same idea as `getRequiredSourceRules` `SourceRules.ts:159-165`).
- Leaf helpers for non-panel coherence: `flattenLeaves`, `mapLeafAt` / `removeLeafAt` / `appendLeaf` (DFS index ↔ `state.filters[i]`).
- Local duck-type predicates (`type === "group"|"not"|"expression"`) — do **not** import `isSourceRuleGroup` from `SourceRules.ts`.

### Kleene Algorithm (empty group = no-op in every position)
- Leaf → `matchesLeaf` (column-aware).
- `expression` → `false` (do not crash; do not expose "add expression" in the view panel).
- `not` → invert `true`/`false`; `null` stays `null`.
- Empty `group` → `null` (skip).
- AND: first `false` wins; if any `true` and no `false` → `true`; all `null` → `null`.
- OR: first `true` wins; if any `false` and no `true` → `false`; all `null` → `null`.
- **Root `null` / missing tree → keep all rows**, matching `applyFilters` empty short-circuit (`QueryEngine.ts:80`).

Do **not** call `matchesSourceRuleTree` (`SourceRules.ts:144-156`). Empty AND → `true` and empty OR → `false` (`SourceRules.ts:152`) makes a nested empty AND under OR match **every row**. AppFlowy is closer (`controller.rs:482-503`: empty children → `None`) but OR-of-all-skips still returns `Some(false)` (`493-503`). Kleene is the only reading that satisfies spec §8 "empty group = no-op" at both root and nested positions. Short-circuit AND/OR; cost O(rows × nodes), stack O(depth); no per-row cache this phase.

### `QueryEngine.applyFilterTree` + `evaluateFilterTree`
`applyFilterTree(rows, tree, columns)`: same `columnMap` as `applyFilters` (`QueryEngine.ts:81`); `matchesFilter` stays **private** (`91-127`); matcher is `(leaf) => this.matchesFilter(row, leaf, columnMap.get(leaf.field))`. Treat root result `!== false` as visible (`null` passes). Checkbox `empty`/`notempty` and number/date/select compares stay in `matchesFilter` (`115-123`, `186-203`). Do not export `matchesFilter`.

`evaluateFilterTree(row, tree, columns): boolean | null` — single-row three-valued wrapper added next to `applyFilterTree` so phase 010 can match iff `=== true` (fail-closed) without exporting `matchesFilter` or forcing `applyFilterTree([row])` (null-passes would paint every row). Views keep `applyFilterTree` (`result !== false`); 010 uses `evaluateFilterTree` (`=== true`).

### `RowPipeline.ts:93-97`
Prune then evaluate one path:
`tree = state.filterTree ? pruneViewFilterTree(state.filterTree, …) : buildViewFilterTree(getEffectiveFilterRules(state.filters, validFields), state.filterLogic)`; if `tree` then `applyFilterTree`, else today's `applyFilters` (identical for a single flat group).

### Persistence Protocol
`filterTree` is canonical when present. On panel commit, dual-write DFS leaves into `state.filters` and root logic into `state.filterLogic` so toolbar badges (`getEffectiveFilterRules`) and `ActiveViewControlsRenderer.ts:37-40` keep working without extra files. `toPersistedState` **omits `filterTree` when the tree is a single flat group** (legacy bytes unchanged). Nested/`not` trees persist `filterTree` and still dual-write the leaf snapshot (badge count only; evaluation does not use the snapshot). Config writes ride the existing path only: panel `saveState()` → `ViewStateStore.persist` (omit empty, `115-127`) → `scheduleConfigSave` debounce **300ms** (`DatabaseView.ts:6213-6252`) with flush-on-deactivate (`1261-1263`) and flush-on-activation (`1805-1811`). No new save API, no extra write trigger, no churny always-on `filterTree: { type:"group", rules:[] }` (omit it).

### UI
Recursive renderer copying **group/`not` chrome only** from `renderSourceRuleNode` / `renderSourceRuleGroup` (`ViewConfigPanelRenderer.ts:846-929`) with an **added `depth` argument** (those lines have no depth param today — `901-916` are add-rule/add-group/add-expression/add-not/remove, so the 3-layer cap is *added*, not copied). Leaves stay `renderFilterRow` / `renderSingleRuleEditor` (`FilterPanelRenderer.ts:107-123`, `148+`) — do **not** copy `renderSourceRuleLeaf` (`931+`), which is a source-operator editor (`inFolder`/`hasProperty`/`strictEq`/source `expression`); a leaked source op falls through `matchesFilter`'s `default: return true` (`QueryEngine.ts:124-125`) and matches every row. Reuse `.db-source-rule-*` chrome (`styles.css:9192-9234`: `border-left` indent, `min-width: 0`, flex 180/130) so **`styles.css` and `i18n.ts` stay out of the diff** (reuse `panel.and` / `panel.or` / `panel.addCondition` and existing source-rule add-group/not strings). Wrap-selected-rule-into-AND-group is the create-group gesture (Anytype `group.tsx:109-122`; AppFlowy wrap-on-insert `entities.rs:134-155`); do **not** offer "add empty group" or "add expression". Hide "add group" at depth 3. No chip-`Wrap` rebuild (AppFlowy Flutter filter UI is flat — `filter_menu.dart:62-66`). Keep using `actions.saveState()` (already `99/142/187/212/228/245/264/285/339`). Do not extract a shared tree-editor module this phase — three copies of group chrome (source / view / later CF) is the rebase-cheap choice.

### EuroFormat Call Sites (locked)
1. **`src/data/QueryEngine.ts`** — additive `applyFilterTree` + `evaluateFilterTree` only.
2. **`src/views/FilterPanelRenderer.ts`** — tree editor; keep using `actions.saveState()`.
3. **`src/views/ViewStateStore.ts`** — `filterTree` on `DatabaseViewState`; hydrate / persist / recursive dead-field prune.

Mechanical extras required for the feature to actually run: **`src/data/types.ts`** (two additive `filterTree?: SourceRuleNode` fields, next to `filters` not as `filters`), **`src/data/RowPipeline.ts`** (the only evaluation caller), and **`src/data/DataSource.ts`** (parse `filterTree` via `normalizeViewFilterTree` at both view constructors `701-702`/`908-909`; add `filterTree` to the serializable view object `1116-1117`; add `"filterTree"` to `legacyViewKeys()` `1239-1240`; do **not** call `parseSourceRuleTree` — without this site `filterTree` is session-only and dies on reload). Non-panel coherence (one slice): **`src/views/ViewRuleOperations.ts`** (`removeFilterRuleAt` `12-15`), **`src/views/ColumnOperations.ts`** (viewState loop `499-509` **and** `removeColumnFromState` `512-514`), **`src/data/ColumnConfig.ts`** (rename `246-249`), **`src/views/DatabaseView.ts`** (`applyChartFilters` `9651-9667`, `toggleActiveFilterLogic` `1999-2006`, `getDefaultFrontmatterFromViewFilters` `3991-4009`), **`src/views/EmbeddedDatabaseRenderer.ts`** (`applyChartFilters` `1779-1793`, `toggleActiveFilterLogic` `1452-1458`), **`src/views/ActiveViewControlsRenderer.ts`** (hide rail AND/OR toggle when nested `82-89`). Tests as specced plus a `"test": "vitest run"` script in fork `package.json`.

### Data Flow
The filter panel edits a `SourceRuleNode` tree → `actions.saveState()` → `ViewStateStore.persist` (omits `filterTree` when flat) → `scheduleConfigSave` debounce → on render, `RowPipeline` prunes then evaluates via `applyFilterTree` → `evaluateViewFilterTree` (Kleene) with `matchesFilter` leaf callback → row subset. Legacy flat rules normalize into a root AND/OR group at load via `buildViewFilterTree`, so a single evaluation path serves both.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read fork `QueryEngine.ts` (`74-89`, `91-127`), `types.ts` (`234-250`, `164-173`, `397-399`), `FilterPanelRenderer.ts` (`81-90`, `107-123`, `125-146`), `RowPipeline.ts` (`93-97`), `ViewStateStore.ts` (`40-127`), `DataSource.ts` (`701-702`, `908-909`, `1116-1117`, `1239-1240`), `ActiveViewControlsRenderer.ts` (`82-89`), `DatabaseView.ts` (`1999-2006`, `3991-4009`, `9651-9667`), `EmbeddedDatabaseRenderer.ts` (`1452-1458`, `1779-1793`), `ViewConfigPanelRenderer.ts` (`846-929`), and `research/synthesis.md` + `research/final-plan.md`.
- [ ] Scaffold `src/__tests__/setup.ts` (no-op) so `vitest` can run (`vitest.config.ts:4-7`); add `"test": "vitest run"` to fork `package.json` (no `test` script today).
- [ ] Confirm fork lint/build commands.

### Phase 2: Core Implementation
- [ ] Create `src/data/ViewFilterTree.ts` — `buildViewFilterTree`, `normalizeViewFilterTree`, `pruneViewFilterTree` (may runtime-import `isEffectiveFilterRule`), `evaluateViewFilterTree` (Kleene), `serializeViewFilterTree`, `getRequiredViewFilterLeaves`, leaf helpers, local duck-type predicates; type-only import from `./types`; no new AST; no `isSourceRuleGroup` import.
- [ ] Add `QueryEngine.applyFilterTree` + `evaluateFilterTree` (single-row three-valued for 010) — `matchesFilter` stays private; same `columnMap` as `applyFilters`.
- [ ] Add `filterTree?: SourceRuleNode` to `types.ts` (`ViewModeStateDef` after `filters` `164-173`, `ViewConfig` after `filters` `397-399`).
- [ ] Wire `RowPipeline.ts:93-97` — prune then evaluate one path.
- [ ] Wire `DataSource.ts` — parse `filterTree` via `normalizeViewFilterTree` at both view constructors (`701-702`, `908-909`); add `filterTree` to serializable view object (`1116-1117`); add `"filterTree"` to `legacyViewKeys()` (`1239-1240`); do not call `parseSourceRuleTree`.
- [ ] Wire `ViewStateStore.ts` — hydrate (`create` `86-113`), persist (`toPersistedState` `115-127`, omit when flat), recursive dead-field prune (`get` `40-46`).
- [ ] Extend `FilterPanelRenderer.ts` — recursive tree editor copying **group/`not` chrome only** from `renderSourceRuleGroup` (`846-929`) with an added `depth` arg; leaves reuse `renderFilterRow`/`renderSingleRuleEditor` (`107-123`); depth cap 3; wrap-into-group; auto-collapse empty groups; no add-expression/add-empty-group; reuse `.db-source-rule-*` CSS; `i18n.ts` untouched.
- [ ] Non-panel coherence (one slice): dual-write `state.filters` **and** `state.filterTree` in `ViewRuleOperations.ts` (`12-15`), `ColumnOperations.ts` (`499-509` + `512-514`), `ColumnConfig.ts` (`246-249`), `DatabaseView.ts` (`applyChartFilters` `9651-9667`), `EmbeddedDatabaseRenderer.ts` (`applyChartFilters` `1779-1793`); hide rail AND/OR toggle when nested (`ActiveViewControlsRenderer.ts:82-89`); `toggleActiveFilterLogic` (`DatabaseView.ts:1999-2006`, `EmbeddedDatabaseRenderer.ts:1452-1458`) writes tree-root `logic` too; `getDefaultFrontmatterFromViewFilters` (`DatabaseView.ts:3991-4009`) uses `getRequiredViewFilterLeaves`.

### Phase 3: Verification
- [ ] Unit tests: `(A and B) or C`, `not` groups, empty groups (root + nested — Kleene skip, not OR-poison), single-leaf ≡ flat, serialization round-trip, `getRequiredViewFilterLeaves` ignores OR children, legacy regression; document AppFlowy divergence (`controller.rs:493-503`).
- [ ] Fork lint/build; manual vault check at mobile width (popover width measured).
- [ ] Grep guard: `SourceRuleNode` is the only tree type; no `FilterGroup`; `styles.css`/`i18n.ts` untouched; no source-op leak in the view panel; `matchesFilter` not exported; `ViewFilterTree.ts` has no runtime import from `SourceRules.ts`; no CF import of the new APIs.
- [ ] Record evidence in `checklist.md`.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit tests | `evaluateViewFilterTree`: `(A and B) or C`, `not` wrapping group, empty groups (root + nested — Kleene skip vs `SourceRules.ts:152` poison vs `controller.rs:493-503` all-skips), `expression` → `false`, single-leaf ≡ flat path, `getRequiredViewFilterLeaves` ignores OR children | `vitest` |
| Serialization | `serializeViewFilterTree` round-trip; `normalizeViewFilterTree` drops unknown kinds with `console.warn`, truncated root → `undefined` | `vitest` |
| Regression | Legacy flat `FilterRule[]` + `filterLogic` views via `buildViewFilterTree` → identical row subsets; `toPersistedState` omits `filterTree` for flat groups; `DataSource.ts` round-trips nested trees and flat views grow no `filterTree` key | `vitest` + manual reload |
| Integration | `applyFilterTree` against sample vault rows; non-panel dual-write (chip/delete/rename/drilldown) keeps tree in sync; rail toggle hidden when nested; new-record defaults use `getRequiredViewFilterLeaves` (OR-group values do not seed frontmatter) | Manual vault run |
| Manual | Panel group editing at mobile width; popover width measured; depth cap 3 enforced; no source-op editor in the view panel | Obsidian vault test note |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `SourceRuleNode` tree (`types.ts:234-250`) | Internal | Green | Filter-tree type unavailable → phase blocked |
| Flat view-filter path (`QueryEngine.ts:74-89`) + private `matchesFilter` (`91-127`) | Internal | Green | Legacy normalization source + leaf matcher unavailable |
| `FilterPanelRenderer.ts` (`81-90`, `125-146`) | Internal | Green | UI extension point missing |
| Source-rule editor (`ViewConfigPanelRenderer.ts:846-929`) + `.db-source-rule-*` CSS (`styles.css:9192-9234`) | Internal | Green | Recursive renderer template + mobile-safe CSS unavailable |
| `ViewStateStore.ts` round trip (`40-127`) | Internal | Green | Persistence path unavailable |
| `DataSource.ts` view constructors + `legacyViewKeys()` (`701-702`, `908-909`, `1116-1117`, `1239-1240`) | Internal | Green | Disk round-trip unavailable → `filterTree` is session-only (REQ-006 fails on reload) |
| `ActiveViewControlsRenderer.ts` rail toggle (`82-89`) + `toggleActiveFilterLogic` (`DatabaseView.ts:1999-2006`, `EmbeddedDatabaseRenderer.ts:1452-1458`) | Internal | Green | Rail toggle desyncs nested views if not hidden / not dual-writing tree-root `logic` |
| `DatabaseView.getDefaultFrontmatterFromViewFilters` (`3991-4009`) | Internal | Green | OR-poisoned new-record defaults if not switched to `getRequiredViewFilterLeaves` |
| `RowPipeline.ts:93-97` | Internal | Green | Only evaluation caller unavailable |
| `vitest.config.ts:4-7` + missing `src/__tests__/setup.ts` + missing `package.json` `test` script | Internal | Blocked (setup file + script missing) | First `vitest` run fails before any assertion → scaffold in Phase 1 |
| `research/synthesis.md` + `research/research.md` | Internal | Green | Acceptance criteria lack grounding |
| Phase 010 conditional-format-icons | Outbound | Planned | 010 is blocked until this tree ships |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Parity test fails, `styles.css`/`i18n.ts` touched, or diff review shows non-isolated churn.
- **Procedure**: Remove `src/data/ViewFilterTree.ts` and its test file; revert the call-site edits in `QueryEngine.ts`, `RowPipeline.ts`, `types.ts`, `ViewStateStore.ts`, `DataSource.ts`, `FilterPanelRenderer.ts`, `ActiveViewControlsRenderer.ts`, the `package.json` `test` script, and the non-panel coherence sites (chip/delete/rename/drilldown/rail-toggle/new-record). The legacy flat path is untouched, so view behavior returns to baseline without data migration. `filterTree` keys in persisted configs are ignored by the legacy path (additive optional field).

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | Core Implementation |
| Core Implementation | Setup | Verification |
| Verification | Core Implementation | Phase 010 |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 30 minutes (includes `setup.ts` scaffold + `package.json` `test` script) |
| Core Implementation | High | 8 hours (evaluator + `evaluateFilterTree` + UI (L, merged) + persistence (`ViewStateStore` + `DataSource`) + non-panel coherence: chip/delete/rename/drilldown + rail toggle + new-record seeding) |
| Verification | Medium | 1.5 hours |
| **Total** | | **~10h (Effort L)** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Diff reviewed: 1 new module + locked call sites; `styles.css` and `i18n.ts` untouched; no source-operator editor leaked into the view panel.
- [ ] Legacy flat-filter regression passed; `toPersistedState` omits `filterTree` for flat groups; `DataSource.ts` round-trips nested trees and flat views grow no `filterTree` key.
- [ ] Kleene empty-group tests pass (nested empty AND under OR does not match every row); `getRequiredViewFilterLeaves` ignores OR children.
- [ ] Non-panel dual-write verified (chip/delete/rename/drilldown keep tree in sync); rail AND/OR toggle hidden when nested (or writes tree-root `logic` when flat); new-record defaults use `getRequiredViewFilterLeaves`.
- [ ] `package.json` has a `"test": "vitest run"` script; `npx vitest run` starts without a missing-setup crash.
- [ ] No telemetry or secrets introduced.

### Rollback Procedure
1. Remove `src/data/ViewFilterTree.ts`, `src/__tests__/setup.ts`, and `src/data/__tests__/ViewFilterTree.test.ts`.
2. Revert the call-site edits in `QueryEngine.ts`, `RowPipeline.ts`, `types.ts`, `ViewStateStore.ts`, `DataSource.ts`, `FilterPanelRenderer.ts`, `ActiveViewControlsRenderer.ts`, the `package.json` `test` script, and the non-panel coherence sites (chip/delete/rename/drilldown/rail-toggle/new-record).
3. Re-run the regression suite to confirm baseline behavior.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: `filterTree` is an additive optional field in view-config JSON; legacy flat configs remain parseable, so reversal is config-trivial. Any persisted `filterTree` keys are ignored by the reverted code path.

<!-- /ANCHOR:enhanced-rollback -->
