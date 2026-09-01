# Sonnet 5 Verification — 009-view-filter-tree

- Reviewer: Claude Sonnet 5 (read-only; hunter/skeptic/referee adversarial self-check)
- Date: 2026-08-26
- Scope: shipped implementation on branch `impl` (commits `3a070e9`, `312108e`, `2471e01`, `64163dc`) vs `spec.md` + `research/{synthesis,final-plan,verification}.md`. Concurrent phase-010 working-tree edits ignored (verified against committed 009 range only).
- Gate re-run at review time: `tsc --noEmit` exit 0; `vitest` 13 files / 160 tests pass (incl. new `ViewFilterTree.test.ts`, `ViewStateStore.test.ts`, `DataSource.test.ts`)

## Verdict

**CONCERNS** — Kleene logic, persistence, and panel editor are correct and tested; but the phase's own highest-risk surface (non-panel dual-write coherence) shipped with **zero tests**, its planned manual proof (sub-phase 005) never ran, and completion docs are stale.

## Findings

### Correctness — verified correct
- **Kleene three-valued logic** (`src/data/ViewFilterTree.ts:145-171`, `evaluateViewFilterTree`): AND short-circuits on first `false`, else `null` if any operand unknown, else `true`; OR is the dual; empty group → `null` (skip, not poison); `not(null)=null`; `expression → false`. Matches spec §8/REQ-001; correctly diverges from `SourceRules.ts:152`'s empty-AND→true poisoning.
- **Additive query path:** `QueryEngine.ts:131-160` (`applyFilterTree`/`evaluateFilterTree`) additive; `matchesFilter` (`:93`) stays private; legacy `applyFilters`/`matchesFilter` byte-identical across all 4 commits.
- **Backward-compat:** `RowPipeline.ts:93-107` routes pruned `state.filterTree` when present, else builds from flat filters; Kleene degenerates to classic logic for flat trees (leaves always boolean) — REQ-003 satisfied.

### Persistence round-trip — correct + tested
- `DataSource.ts:741,950,1160,1284` parse/serialize `filterTree` via `normalizeViewFilterTree` at both constructors, the serializable view, and `legacyViewKeys()` (the gap final-plan flagged). `DataSource.test.ts` round-trips + rejects truncated root.
- `ViewStateStore.ts:99-100,124-133,150-153`: hydrate promotes legacy flat filters to a root group; `shouldPersistFilterTree` omits `filterTree` for flat groups (iCloud-quiet), persists only nested; dead-field prune retains emptied groups as skip nodes. Tested (hydrate→persist→reload, legacy-omit, malformed-root, dead-leaf-prune).

### Panel editor — verified
- `FilterPanelRenderer.ts` diff touches only that file; no source-operator leak (grep for `inFolder|hasProperty|strictEq|renderSourceRuleLeaf` empty).
- `MAX_FILTER_GROUP_DEPTH = 3` + `canWrapFilterNode`/`nestedFilterGroupDepth` (`:24-40`) cap the UI at 3 group layers while leaving the evaluator unbounded (REQ-004). DOM-heavy → no automated test; the manual check (child 005) was never executed.

### P1 — non-panel coherence shipped unverified
`ColumnConfig.ts` (rename), `ColumnOperations.ts` (column delete), `ViewRuleOperations.ts` (chip delete), `DatabaseView.ts`/`EmbeddedDatabaseRenderer.ts` (`applyChartFilters`, `toggleActiveFilterLogic`, `getDefaultFrontmatterFromViewFilters`) all correctly dual-write `state.filters`/`state.filterTree` via `mapLeafAt`/`removeLeafAt`/`appendLeaf`; `getRequiredViewFilterLeaves` fixes the OR-poisoned-frontmatter risk. Hand-traced each site — no defect found. **But** commit `64163dc` adds **zero test files** for the surface the spec's risk register named "the single biggest risk," and the dedicated proof sub-phase `005-filter-tree-proof` never ran (its `implementation-summary.md` = "Not yet (Planned)"). **Fix target: add automated coverage for the dual-write coherence sites.**

### Coverage vs synthesis
All 10 ranked items implemented (nested eval, legacy promotion, persistence, panel editor, non-panel coherence, 3-layer cap, wrap/auto-collapse, `not` composition, phase-010 export freeze — confirmed `ConditionalFormatting.ts` imports only `normalizeViewFilterTree`). #9 proof harness **partial** — unit tests exist; the vault/grep/mobile-width manual proof was never executed.

## Remediation candidates
- **P1 — add non-panel coherence tests** (004) and run/record the 005 proof (or convert its manual checks to automated where feasible).
- **P2 — docs stale:** all 6 `implementation-summary.md` (parent + 001-005) + `checklist.md` (parent 0/29, `003` 0/22) say "Planned" despite committed code. Reconcile.
- **P2 — `package.json` `"test":"vitest run"`** (T002) exists only as an uncommitted working-tree edit, never committed on `impl`. Commit it. (No functional impact — `npx vitest run` works regardless.)
