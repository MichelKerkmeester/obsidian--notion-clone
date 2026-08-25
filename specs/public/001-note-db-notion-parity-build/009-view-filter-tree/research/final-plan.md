# Final Plan: Nested AND/OR View Filter Tree
> Reviewed & optimized build plan, from a fresh Grok 4.6 (xhigh-fast) review of this phase's rewritten spec/plan/tasks/checklist plus its synthesis and research.

## Review — strengths, gaps, risks

The locked design is correct and should ship. Views today cannot express `(A and B) or C` because `QueryEngine.applyFilters` is one uniform `.every` / `.some` over a flat `FilterRule[]` (`QueryEngine.ts:74-89`). The fork already owns the right tree type (`SourceRuleNode` at `types.ts:234-250`) and a working nested editor for *source* rules (`ViewConfigPanelRenderer.ts:846-929`). Synthesis is right to forbid both a new `FilterGroup` AST (REQ-002) and reuse of `matchesSourceRuleTree` (`SourceRules.ts:144-156`): empty AND → `true` at `SourceRules.ts:152` makes a nested empty AND under OR match every row. Kleene three-valued eval (`null` = skip) is the only reading that satisfies spec §8 at both root and nested positions; AppFlowy is close (`controller.rs:482-503`) but OR-of-all-skips still returns `Some(false)` (`controller.rs:493-503`).

What is solid: EuroFormat isolation (`ViewFilterTree.ts`, type-only import from `./types`, zero runtime import from `SourceRules.ts` / `QueryEngine.ts` — synthesis F1.4 vs F9.1), private `matchesFilter` (`QueryEngine.ts:91-127`) as the leaf, `styles.css` reuse of `.db-source-rule-*` (`styles.css:9192-9234`), omit-`filterTree`-when-flat persistence, wrap-into-group + auto-collapse, UI depth cap 3 / evaluator unbounded, and the explicit non-panel desync risk (synthesis open question #1).

What is missing or wrong:

1. **Disk round-trip is not ViewStateStore-only.** `DataSource.ts` whitelist-builds views at `701-702` and `908-909` (`filterLogic` / `filters` only). The serializable-view object at `1116-1117` and `1188` copies `filters` and the `viewStates` blob, and `legacyViewKeys()` at `1239-1240` lists `"filterLogic"` / `"filters"` with no `filterTree`. Top-level `filterTree` is dropped on parse/serialize. `viewStates` is a raw object pass-through (`756-758`, `983-984`), so a tree stored *inside* `viewStates[mode]` can survive — but `create()` falls back to top-level `viewConfig` when mode state is missing (`ViewStateStore.ts:88-89`). Without `DataSource.ts`, REQ-006 is a session-only field. This site is absent from spec/plan/tasks.

2. **Wrong `applyChartFilters` citation.** Live method is `DatabaseView.ts:9651-9667`, not `9651-3664`. Embedded twin is correctly `EmbeddedDatabaseRenderer.ts:1779-1793`.

3. **New-record defaults are specified, not tasked.** Synthesis must-handle: `getDefaultFrontmatterFromViewFilters` (`DatabaseView.ts:3991-4009`) no-ops on root OR and otherwise seeds every DFS leaf. A nested `(A and B) or C` dual-written with `filterLogic === "or"` would skip seeding (accidentally OK); a root-AND with an inner OR would seed OR-side leaves into frontmatter. Need AND-required leaves, same idea as `getRequiredSourceRules` (`SourceRules.ts:159-165`).

4. **Active-rail logic toggle is specified, not tasked.** Open question #4 default is hide the rail AND/OR control when the tree is nested. That control is `ActiveViewControlsRenderer.ts:82-89`; `toggleActiveFilterLogic` is `DatabaseView.ts:1999-2006` and `EmbeddedDatabaseRenderer.ts:1452-1458`. Flipping `state.filterLogic` without updating `filterTree` desyncs nested views.

5. **UI copy-paste is the biggest implementation trap.** `renderSourceRuleGroup` (`878-929`) is group chrome; `renderSourceRuleLeaf` (`931+`) is a *source-operator* editor (`inFolder` / `hasProperty` / `strictEq` / `expression`). Unknown view ops fall through `matchesFilter`'s `default: return true` (`QueryEngine.ts:124-125`) — a leaked source op matches every row (synthesis F9.1). There is also **no depth parameter** at `901-916`; those lines are add-rule / add-group / add-expression / add-not / remove. The 3-layer cap must be added, not copied. Keep `renderFilterRow` / `renderSingleRuleEditor` (`FilterPanelRenderer.ts:107-123`, `148+`) as the leaf.

6. **009 → 010 API is incomplete.** REQ-008 exports `evaluateViewFilterTree` from the pure module, but that function needs a `matchesLeaf` callback. `matchesFilter` stays private. Phase 010 cannot call the pure function from `ConditionalFormatting.ts`. `applyFilterTree` (row-array, root `null` → visible) is the wrong primitive for CF fail-closed. 009 must also ship a single-row three-valued wrapper on `QueryEngine`.

7. **Task list is over-split and under-scoped.** T013 and T027 are not build work (T010 already exports). T016/T022/T023/T024/T025 are one renderer change. Effort ~8h is low once DataSource, new-record seeding, and the rail toggle are in; UI is L, not a cluster of S tasks. `ViewConfig` citation `types.ts:397-399` is `filterLogic`/`filters` — add `filterTree` next to them, not *as* them.

## Optimizations

- Treat EuroFormat “3 call sites” as the *isolation core* (`QueryEngine.ts`, `FilterPanelRenderer.ts`, `ViewStateStore.ts`), not the shipping file list. Mechanical extras: `types.ts`, `RowPipeline.ts`, **`DataSource.ts`**. Coherence extras stay in-phase (synthesis default #1) plus the two missed mutators above.
- One UI change in `FilterPanelRenderer.ts`: copy **group/not chrome only**; reuse existing filter leaves; wrap-selected-rule-into-AND-group as the create-group gesture (Anytype `group.tsx:109-122`); do not offer “add empty group” or “add expression”.
- Put local type predicates in `ViewFilterTree.ts` (duck-type `type === "group"|"not"|"expression"`). Do not import `isSourceRuleGroup` from `SourceRules.ts`.
- `pruneViewFilterTree` may runtime-import `isEffectiveFilterRule` (`FilterRules.ts:3-12`). That is allowed; SourceRules/QueryEngine are not.
- Export `getRequiredViewFilterLeaves(tree)` from the same module and call it from `DatabaseView.ts:3991`. Cheap, and it prevents the OR-poisoned new-record bug.
- Add `QueryEngine.evaluateFilterTree(row, tree, columns): boolean | null` next to `applyFilterTree`. Views: `applyFilterTree` keeps `result !== false` (null passes, `QueryEngine.ts:80`). Phase 010: match iff `=== true`. Do not export `matchesFilter`.
- Merge T016+T022–T025. Cut T013/T027 as tasks; keep them as acceptance checks. Scaffold `src/__tests__/setup.ts` once here (`vitest.config.ts:4-7`); 010 reuses it. Add `"test": "vitest run"` to fork `package.json` (no `test` script today) so the harness is runnable.
- Do not extract a shared tree-editor module this phase. Three copies of group chrome (source / view / later CF) is the rebase-cheap choice.

## Final build plan (ordered)

1. **Harness — `src/__tests__/setup.ts` (new, no-op) + `package.json` `test` script.** Effort S. Acceptance: `npx vitest run` starts (no missing-setup crash). Depends: none. `vitest.config.ts:4-7`.

2. **Module — `src/data/ViewFilterTree.ts` (new).** Effort M. Type-only import from `./types`. Runtime OK: `FilterRules.ts`. Forbidden runtime: `SourceRules.ts`, `QueryEngine.ts`. Exports: `buildViewFilterTree` (shape of `createLegacySourceRuleTree`, `SourceRules.ts:48-59`: `[] → undefined`, one rule → leaf, else `{type:"group", logic, rules}`), `normalizeViewFilterTree` (view-op allow-list = `FilterOperator` at `types.ts:135`; drop unknown kinds + `console.warn`; truncated/non-object → `undefined`, never an empty OR), `pruneViewFilterTree` (recursive `isEffectiveFilterRule`), `evaluateViewFilterTree` (Kleene: leaf → `matchesLeaf`; `expression` → `false`; `not` inverts `true`/`false`, `null` stays `null`; empty group → `null`; AND first-`false`; OR first-`true`; all-`null` → `null`), `serializeViewFilterTree`, `flattenLeaves` / `mapLeafAt` / `removeLeafAt` / `appendLeaf`, `getRequiredViewFilterLeaves` (AND-required only; OR / `not` → `[]`). Acceptance: unit tests in step 11 can run against this file with a fake `matchesLeaf`. Depends: 1.

3. **Types — `src/data/types.ts`.** Effort S. Additive `filterTree?: SourceRuleNode` on `ViewModeStateDef` (after `filters` at `169`) and `ViewConfig` (after `filters` at `399`). No new AST. Acceptance: `FilterGroup` grep is empty. Depends: none (parallel with 2).

4. **Eval bridge — `src/data/QueryEngine.ts`.** Effort S (not M). Additive `applyFilterTree(rows, tree, columns)`: same `columnMap` as `applyFilters` (`81`); matcher `(leaf) => this.matchesFilter(row, leaf, columnMap.get(leaf.field))`; root `!== false` visible. Additive `evaluateFilterTree(row, tree, columns): boolean | null` for 010. Leave `applyFilters` `74-89` and `matchesFilter` `91-127` untouched; do not export `matchesFilter`. Acceptance: single-leaf tree ≡ `applyFilters` on the same rules; empty/missing tree ≡ all rows (`80`). Depends: 2.

5. **Eval caller — `src/data/RowPipeline.ts:93-97`.** Effort S. `tree = state.filterTree ? pruneViewFilterTree(state.filterTree, …) : buildViewFilterTree(getEffectiveFilterRules(state.filters, validFields), state.filterLogic)`; if `tree` then `applyFilterTree`, else today’s `applyFilters` (only the empty-filter case). Acceptance: live views with any effective filter go through the tree path; empty filters still no-op. Depends: 3, 4.

6. **Disk — `src/data/DataSource.ts`.** Effort S. Parse `filterTree` via `normalizeViewFilterTree` at both view constructors (`701-702`, `908-909`). Put `filterTree` on the serializable view object (next to `1116-1117`). Add `"filterTree"` to `legacyViewKeys()` next to `"filters"` (`1239-1240`). Do **not** call `parseSourceRuleTree` (`SourceRules.ts:227-257`) — that whitelist is `SOURCE_RULE_OPERATORS` (`7-28`). Acceptance: nested tree survives save/reload; flat views do not grow a `filterTree` key. Depends: 2, 3.

7. **State — `src/views/ViewStateStore.ts`.** Effort S. `filterTree` on `DatabaseViewState` (`16-26`). Hydrate in `create` (`86-113`) through `normalizeViewFilterTree`. `toPersistedState` (`115-127`) omits `filterTree` unless nested group or `not`. `persist` (`69-84`) mirrors `viewConfig.filterTree` like `filters`. Recursive dead-field leaf prune in `get` (`40-46`); groups emptied by prune stay skip. Acceptance: checklist T037 (flat omit / nested persist). Depends: 3, 6.

8. **Panel — `src/views/FilterPanelRenderer.ts`.** Effort L (merged T016+T022–T025). Recursive group/not renderer copied from `renderSourceRuleNode` / `renderSourceRuleGroup` (`846-929`) with a `depth` argument. Leaves stay `renderFilterRow` / `renderSingleRuleEditor` (`107-123`). Reuse `.db-source-rule-*` (`styles.css:9192-9234`); `styles.css` and `i18n.ts` stay out of the diff (reuse `panel.and` / `panel.or` / `panel.addCondition` and existing source-rule add-group/not strings). Keep `actions.saveState()` (`99/142/187/212/228/245/264/285/339`). On commit: tree canonical; dual-write DFS leaves → `state.filters`, root logic → `state.filterLogic`. Gestures: wrap-into-AND-group; auto-collapse empty groups (do not auto-flatten a remaining single child except persist-normalization); hide “add group” at `depth >= 3`; labeled `not` wrapper like `858-869`; no add-expression. Acceptance: `(A and B) or C` editable at mobile width; 4th group layer refused; rail popover still edits one leaf. Depends: 7.

9. **Non-panel coherence (one slice).** Effort M. Dual-write `state.filters` **and** `state.filterTree` at: `ViewRuleOperations.removeFilterRuleAt` (`12-15`); `ColumnOperations` viewState loop (`499-509`) **and** `removeColumnFromState` (`512-514`); `ColumnConfig` rename (`246-249`); `DatabaseView.applyChartFilters` (`9651-9667`); `EmbeddedDatabaseRenderer.applyChartFilters` (`1779-1793`). Hide rail logic toggle when nested (`ActiveViewControlsRenderer.ts:82-89`); if the toggle remains for flat trees, `toggleActiveFilterLogic` (`DatabaseView.ts:1999-2006`, `EmbeddedDatabaseRenderer.ts:1452-1458`) must write both `filterLogic` and tree-root `logic`. New records: `getDefaultFrontmatterFromViewFilters` (`DatabaseView.ts:3991-4009`) uses `getRequiredViewFilterLeaves` instead of “all DFS leaves if root AND”. Acceptance: chip delete / column delete / rename / chart drilldown / new-record on a nested view leave tree and chips consistent; OR-group values do not seed frontmatter. Depends: 2, 7, 8 (panel is source of truth; coherence can start after 7).

10. **010 contract freeze.** Effort S. Public surface from this phase: `evaluateViewFilterTree`, `normalizeViewFilterTree`, `QueryEngine.evaluateFilterTree`, `QueryEngine.applyFilterTree`. `ConditionalFormatting.ts:38` stays on `applyFilters` until 010. Acceptance: grep shows no CF import of the new APIs. Depends: 4.

11. **Proof — `src/data/__tests__/ViewFilterTree.test.ts`.** Effort S. Cases: `(A and B) or C`; `not` wrapping a group; empty root → all rows; nested empty AND under OR is skip (not `SourceRules.ts:152` poison, not AppFlowy all-skips-hide at `controller.rs:493-503`); `expression` → `false`; single-leaf ≡ flat; serialize round-trip; truncated root → `undefined`; `getRequiredViewFilterLeaves` ignores OR children. Then fork `lint` / `build`. Depends: 1, 2, 4.

12. **Manual + grep.** Effort S–M. Vault: nested filter at phone width (measure popover); wrap / collapse / depth 3 / `not`; persistence (nested survives, flat has no `filterTree` key); chip + column-delete + drilldown. Grep: no `FilterGroup`; `styles.css` untouched; `matchesFilter` not exported; `ViewFilterTree.ts` has no runtime import from `SourceRules.ts`. Depends: 8, 9, 11.

**Do not build:** new AST; id-based surgery; AppFlowy `DashMap` cache; chip-`Wrap` group editor; Anytype `In`/`AllIn`/`ExactIn`; changes to `matchesSourceRuleTree`; evaluator depth cap; `styles.css` edits.

## Risks & open decisions

| Item | Recommended default |
|------|---------------------|
| File-count vs REQ-007 “3 call sites” | Accept the isolation core (3) plus `types.ts` + `RowPipeline.ts` + **`DataSource.ts`** plus the coherence set in step 9. Shipping panel+eval without those is a desync bug, not a smaller diff. |
| Kleene vs AppFlowy OR-of-all-skips | Kleene. Document the divergence in the test file (`controller.rs:493-503`). |
| When to persist `filterTree` | Only nested group or `not`. Flat stays `filters` + `filterLogic` (iCloud-quiet). |
| Rail chips on nested trees | Keep DFS leaf chips (dual-write). Hide the rail logic toggle (`ActiveViewControlsRenderer.ts:82-89`). |
| `expression` in the view panel | No add-expression. Evaluator maps them to `false`. |
| Mobile leaf presentation | Keep row-list + flex-shrink. Measure popover width in the checklist. |
| Single-child groups after delete | Auto-collapse empty groups. Do not hoist a remaining single child except persist-normalization when the tree is flat-equivalent. |
| `removeSourceRuleTreeReferences` auto-flatten (`SourceRules.ts:222-224`) | Do **not** use that helper for view-filter panel edits (it hoists). Use `removeLeafAt` / positional splice. Column-delete may prune leaves then persist-normalize. |
| 010 matcher | Ship `QueryEngine.evaluateFilterTree` now so 010 is not forced into `applyFilterTree([row])` (null-passes would paint every row). |

Residual risk: copying `renderSourceRuleLeaf` by accident (source-op leak → every row matches). Residual risk: forgetting `DataSource.ts` (tree dies on reload). Both are grep/round-trip detectable.
