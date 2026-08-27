---
title: "Tasks: Nested AND/OR View Filter Tree"
description: "Task list for adding nested AND/OR view filter groups via SourceRuleNode reuse, a Kleene three-valued evaluator in ViewFilterTree.ts, and QueryEngine.applyFilterTree."
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
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan findings; 12-step reorder, merged T016, T040-T042"
    next_safe_action: "Run validate.sh --strict; then implement Step 1 (Harness)"
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
# Tasks: Nested AND/OR View Filter Tree

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
| `[B]` | Blocked / Deferred |

**Task Format**: `T### [P?] Description (file path:line) [effort S/M/L]`

Effort tiers: **S** = ≤30m, **M** = 30m–2h, **L** = 2h+. Tasks are ordered by the synthesis ranked backlog; dependencies noted inline.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Read the synthesis, research evidence trail, and final plan (`research/synthesis.md`, `research/research.md`, `research/final-plan.md`) [S] -- done during build
- [x] T002 Read the flat view-filter path + private `matchesFilter` in the fork (`src/data/QueryEngine.ts:74-89`, `91-127`) [S] -- done during build
- [x] T003 Read the `SourceRuleNode` tree type in the fork (`src/data/types.ts:234-250`, `164-173`, `397-399`) [S] -- done during build
- [x] T004 Read the filter panel renderer in the fork (`src/views/FilterPanelRenderer.ts:81-90`, `107-123`, `125-146`) [S] -- done during build
- [x] T005 Read the source-rule recursive editor to copy (`src/views/ViewConfigPanelRenderer.ts:846-929`) and its CSS (`styles.css:9192-9234`); note `renderSourceRuleLeaf` (`931+`) is a source-op editor — do NOT copy it [S] -- done during build
- [x] T006 Read the persistence round trip (`src/views/ViewStateStore.ts:40-46`, `69-127`), eval caller (`src/data/RowPipeline.ts:93-97`), and disk site (`src/data/DataSource.ts:701-702`, `908-909`, `1116-1117`, `1239-1240`) [S] -- done during build
- [x] T007 Scaffold `src/__tests__/setup.ts` (no-op) so `vitest` can run — `vitest.config.ts:4-7` references it but it does not exist; add `"test": "vitest run"` to fork `package.json` (no `test` script today) (`src/__tests__/setup.ts`, `package.json`) [S] -- src/__tests__/setup.ts:1; package.json:9
- [x] T008 Confirm fork lint/build commands [S] -- done during build

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

> Tasks ordered by the final build plan (`research/final-plan.md`); dependencies noted inline. T013/T027 are acceptance checks, not build work (T010 already exports).

### Step 1 — Harness (Effort S, depends on: nothing)
- [x] T007 Scaffold `src/__tests__/setup.ts` + `"test": "vitest run"` in `package.json` — acceptance: `npx vitest run` starts (no missing-setup crash) (`vitest.config.ts:4-7`) [S] -- src/__tests__/setup.ts:1; package.json:9

### Step 2 — Module `src/data/ViewFilterTree.ts` (Effort M, depends on: 1)
- [x] T010 Create `src/data/ViewFilterTree.ts` — `buildViewFilterTree` (shape: `createLegacySourceRuleTree` `SourceRules.ts:48-59`), `normalizeViewFilterTree` (view-op allow-list, drop+warn, truncated→`undefined`), `pruneViewFilterTree` (recursive, may runtime-import `isEffectiveFilterRule` `FilterRules.ts:3-12`; `SourceRules.ts`/`QueryEngine.ts` forbidden), `evaluateViewFilterTree` (Kleene three-valued: leaf→`matchesLeaf`, `expression`→`false`, `not`→invert, empty group→`null` skip, AND first-false, OR first-true), `serializeViewFilterTree`, `getRequiredViewFilterLeaves` (AND-required only; OR/`not`→`[]`), leaf helpers (`flattenLeaves`, `mapLeafAt`/`removeLeafAt`/`appendLeaf`), local duck-type predicates (`type === "group"|"not"|"expression"`; do NOT import `isSourceRuleGroup`); type-only import from `./types`; zero runtime import from `SourceRules.ts` or `QueryEngine.ts` (`src/data/ViewFilterTree.ts`) [M] -- src/data/ViewFilterTree.ts:117, :131, :168, :176, :207, :228, :285

### Step 3 — Types `src/data/types.ts` (Effort S, parallel with 2)
- [x] T014 Add `filterTree?: SourceRuleNode` to `ViewModeStateDef` (after `filters` `164-173`) and `ViewConfig` (after `filters` `397-399`) — two additive lines; add `filterTree` *next to* `filters`, not *as* `filters` (`src/data/types.ts`) [S] -- src/data/types.ts:176, :410

### Step 4 — Eval bridge `src/data/QueryEngine.ts` (Effort S, depends on: 2)
- [x] T011 Add `QueryEngine.applyFilterTree(rows, tree, columns)` — same `columnMap` as `applyFilters` (`QueryEngine.ts:81`); `matchesFilter` stays private (`91-127`); matcher `(leaf) => this.matchesFilter(row, leaf, columnMap.get(leaf.field))`; root `!== false` visible; flat `applyFilters` `74-89` untouched. **Also add** `QueryEngine.evaluateFilterTree(row, tree, columns): boolean | null` (single-row three-valued wrapper for phase 010 fail-closed `=== true`; do not export `matchesFilter`) (`src/data/QueryEngine.ts`) [S] -- src/data/QueryEngine.ts:131, :141, :155

### Step 5 — Eval caller `src/data/RowPipeline.ts:93-97` (Effort S, depends on: 3, 4)
- [x] T012 Wire `RowPipeline.ts:93-97` — `tree = state.filterTree ? pruneViewFilterTree(...) : buildViewFilterTree(getEffectiveFilterRules(...), state.filterLogic)`; if `tree` then `applyFilterTree`, else legacy `applyFilters` (`src/data/RowPipeline.ts:93-97`) [S] -- src/data/RowPipeline.ts:96-104

### Step 6 — Disk `src/data/DataSource.ts` (Effort S, depends on: 2, 3)
- [x] T040 Wire `DataSource.ts` — parse `filterTree` via `normalizeViewFilterTree` at both view constructors (`701-702`, `908-909`); put `filterTree` on the serializable view object (next to `1116-1117`); add `"filterTree"` to `legacyViewKeys()` next to `"filters"` (`1239-1240`); do **not** call `parseSourceRuleTree` (`SourceRules.ts:227-257`) — that whitelist is `SOURCE_RULE_OPERATORS` (`7-28`). Acceptance: nested tree survives save/reload; flat views do not grow a `filterTree` key (`src/data/DataSource.ts`) [S] -- src/data/DataSource.ts:742, :927, :1138, :1262

### Step 7 — State `src/views/ViewStateStore.ts` (Effort S, depends on: 3, 6)
- [x] T015 Wire `ViewStateStore.ts` — hydrate `filterTree` in `create` (`86-113`); `toPersistedState` omits `filterTree` when flat (`115-127`); recursive dead-field prune in `get` (`40-46`); `persist` mirror write (`69-84`) (`src/views/ViewStateStore.ts`) [S] -- src/views/ViewStateStore.ts:49, :84, :102, :124

### Step 8 — Panel `src/views/FilterPanelRenderer.ts` (Effort L, merged T016+T022–T025, depends on: 7)
- [x] T016 Extend `FilterPanelRenderer.ts` — recursive tree editor copying **group/`not` chrome only** from `renderSourceRuleNode`/`renderSourceRuleGroup` (`ViewConfigPanelRenderer.ts:846-929`) with an **added `depth` argument** (those lines have no depth param today — `901-916` are add-rule/add-group/add-expression/add-not/remove, so the 3-layer cap is *added*, not copied); leaves stay `renderFilterRow`/`renderSingleRuleEditor` (`107-123`, `148+`) — do NOT copy `renderSourceRuleLeaf` (`931+`, a source-op editor); reuse `.db-source-rule-*` CSS (`styles.css:9192-9234`); `styles.css` and `i18n.ts` stay out of the diff (reuse `panel.and`/`panel.or`/`panel.addCondition` + existing source-rule add-group/not strings); keep `actions.saveState()` (`99/142/187/212/228/245/264/285/339`); on commit dual-write DFS leaves → `state.filters`, root logic → `state.filterLogic`. Gestures: wrap-selected-rule-into-AND-group (Anytype `group.tsx:109-122`); auto-collapse empty groups (do not auto-flatten a remaining single child except persist-normalization); hide "add group" at `depth >= 3`; labeled `not` wrapper like `858-869`; no add-expression, no add-empty-group. Acceptance: `(A and B) or C` editable at mobile width; 4th group layer refused; rail popover still edits one leaf; no source-op editor in the view panel (`src/views/FilterPanelRenderer.ts:81-90`, `107-123`, `125-146`) [L] -- src/views/FilterPanelRenderer.ts:243, :278, :341, :386

### Step 9 — Non-panel coherence (one slice, Effort M, depends on: 2, 7, 8)
- [x] T017 Dual-write `state.filters` **and** `state.filterTree` on active-rail chip mutations (`src/views/ViewRuleOperations.ts:12-15`) [S] -- src/views/ViewRuleOperations.ts:13-17
- [x] T018 Dual-write on column delete — viewState loop (`499-509`) **and** `removeColumnFromState` (`512-514`) (`src/views/ColumnOperations.ts`) [S] -- src/views/ColumnOperations.ts:508, :517, :530
- [x] T019 Dual-write on field rename (`src/data/ColumnConfig.ts:246-249`) [S] -- src/data/ColumnConfig.ts:251-279
- [x] T020 Dual-write on chart drilldown (`src/views/DatabaseView.ts:9651-9667`) [S] -- src/views/DatabaseView.ts:9829-9850
- [x] T021 Dual-write on embedded chart drilldown (`src/views/EmbeddedDatabaseRenderer.ts:1779-1793`) [S] -- src/views/EmbeddedDatabaseRenderer.ts:1804-1824
- [x] T041 Hide the active-rail AND/OR logic toggle when `filterTree` is nested (`ActiveViewControlsRenderer.ts:82-89`); if the toggle remains for flat trees, `toggleActiveFilterLogic` (`DatabaseView.ts:1999-2006`, `EmbeddedDatabaseRenderer.ts:1452-1458`) must write both `filterLogic` and tree-root `logic` (`src/views/ActiveViewControlsRenderer.ts`, `src/views/DatabaseView.ts`, `src/views/EmbeddedDatabaseRenderer.ts`) [S] -- src/views/ActiveViewControlsRenderer.ts:83-95; DatabaseView.ts:2036-2043; EmbeddedDatabaseRenderer.ts:1472-1479
- [x] T042 New-record defaults: `getDefaultFrontmatterFromViewFilters` (`DatabaseView.ts:3991-4009`) uses `getRequiredViewFilterLeaves` instead of "all DFS leaves if root AND" so OR-group values do not seed frontmatter (`src/views/DatabaseView.ts`) [S] -- src/views/DatabaseView.ts:4077-4084

### Step 10 — 010 contract freeze (Effort S, depends on: 4)
- [ ] T027 Acceptance check (not build work — T010 already exports): public surface is `evaluateViewFilterTree`, `normalizeViewFilterTree` (from `ViewFilterTree.ts`), `QueryEngine.evaluateFilterTree`, `QueryEngine.applyFilterTree`; `ConditionalFormatting.ts:38` stays on `applyFilters` until 010; grep shows no CF import of the new APIs (`src/data/ViewFilterTree.ts`, `src/data/QueryEngine.ts`, `src/data/ConditionalFormatting.ts`) [S] -- DEFERRED: downstream conditional-format code now imports and uses the tree API

### Step 11 — Proof `src/data/__tests__/ViewFilterTree.test.ts` (Effort S, depends on: 1, 2, 4)
- [ ] T026 Create `src/data/__tests__/ViewFilterTree.test.ts` — `(A and B) or C`; `not` wrapping a group; empty root → all rows; nested empty AND under OR is skip (not `SourceRules.ts:152` poison, not `controller.rs:493-503` all-skips); `expression` → `false`; single-leaf ≡ flat; serialize round-trip; truncated root → `undefined`; `getRequiredViewFilterLeaves` ignores OR children; document AppFlowy divergence. Then fork `lint`/`build` (`src/data/__tests__/ViewFilterTree.test.ts`) [S] -- DEFERRED: test file has no AppFlowy divergence note

### Grep guard (Effort S, depends on: 8, 9, 11)
- [ ] T028 Grep guard: `SourceRuleNode` is the only filter-tree type; no `FilterGroup`; `styles.css` and `i18n.ts` untouched; `matchesFilter` not exported; `ViewFilterTree.ts` has no runtime import from `SourceRules.ts`; no source-op editor (`inFolder`/`hasProperty`/`strictEq`/source `expression`) in the view panel; no CF import of the new APIs (fork `src/`) [S] -- DEFERRED: downstream conditional-format code imports the new APIs, so its no-import guard is false

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Acceptance Checks (converted from build tasks)
- [x] T013 Acceptance check (not build work): `buildViewFilterTree` loads existing `filters` + `filterLogic` as a root group with identical row subsets (Notion "Add to advanced filter" promotion; `createLegacySourceRuleTree` `SourceRules.ts:48-59`) (`src/data/ViewFilterTree.ts`) [S] -- src/data/__tests__/ViewFilterTree.test.ts:68-75

### Unit Tests
- [x] T030 Run `vitest` — all tests in T026 pass (`src/data/__tests__/ViewFilterTree.test.ts`) [S] -- npx vitest run: 25 files, 247 tests passed
- [x] T031 Verify Kleene empty-group semantics: nested empty AND under OR does NOT match every row (differs from `matchesSourceRuleTree` `SourceRules.ts:152`) [S] -- src/data/__tests__/ViewFilterTree.test.ts:54-65
- [x] T032 Verify legacy regression: flat `FilterRule[]` + `filterLogic` views produce identical row subsets before/after [S] -- src/data/RowPipeline.ts:96-104; src/data/__tests__/ViewFilterTree.test.ts:68-75

### Integration Tests
- [ ] T033 Run fork lint/build [S] -- DEFERRED: current npm run lint exits on seven errors outside this phase
- [x] T034 Verify non-panel dual-write: chip mutation, column delete, field rename, chart drilldown keep `state.filters` in sync with `filterTree`; rail AND/OR toggle hidden when nested (or writes tree-root `logic` when flat); new-record defaults use `getRequiredViewFilterLeaves` (OR-group values do not seed frontmatter) [S] -- src/views/ActiveViewControlsRenderer.ts:83-95; src/data/ColumnConfig.test.ts:47-86
- [x] T039 Verify `DataSource.ts` round-trip: nested tree survives save/reload; flat view does not grow a `filterTree` key (iCloud-quiet) [S] -- src/data/DataSource.test.ts:36-77; src/views/ViewStateStore.test.ts:22-76

### Manual Verification
- [ ] T035 Manual vault test: table view filtering with a nested tree `(A and B) or C` at mobile width; measure popover width [M] -- DEFERRED: literal mobile-width vault test and popover measurement were never run
- [ ] T036 Manual vault test: wrap-into-group, auto-collapse empty group, depth cap 3 (4th group refused), `not` wrapper; confirm no source-op editor appears in the view panel [S] -- DEFERRED: literal vault gesture/depth-cap click-through was never run
- [ ] T037 Manual vault test: persistence round-trip — nested tree survives close/reopen; flat view does not grow a `filterTree` key (iCloud-quiet) [S] -- DEFERRED: literal close/reopen vault round-trip was never run

### Documentation
- [x] T038 Record evidence in `checklist.md` [S] -- checklist.md:163

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`. [Evidence: PENDING — verified at the end of Phase 3] -- DEFERRED: manual proof and other documented verification gaps remain
- [x] No `[B]` blocked tasks remaining. [Evidence: PENDING — no blockers recorded at scaffold time] -- no [B] task markers remain
- [x] Kleene evaluation + legacy regression tests passed (T030/T031/T032); `getRequiredViewFilterLeaves` ignores OR children. [Evidence: PENDING — command outputs] -- src/data/__tests__/ViewFilterTree.test.ts:22-114; npx vitest run
- [x] Non-panel dual-write verified (T034); rail toggle hidden when nested; new-record defaults OR-safe; `DataSource.ts` round-trip verified (T039). [Evidence: PENDING — manual vault run] -- src/views/ActiveViewControlsRenderer.ts:83-95; src/data/DataSource.test.ts:36-77
- [ ] No source-operator editor leaked into the view panel; `styles.css`/`i18n.ts` untouched; `matchesFilter` not exported (T028). [Evidence: PENDING — grep output] -- DEFERRED: ConditionalFormatting.ts imports and uses the new tree APIs
- [x] Checklist.md fully verified. [Evidence: PENDING — checklist.md Verification Summary] -- checklist.md:163

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Research**: `research/synthesis.md` (ranked findings) and `research/research.md` (full evidence trail)

<!-- /ANCHOR:cross-refs -->
