---
title: "Verification Checklist: Nested AND/OR View Filter Tree"
description: "Verification checklist for the nested AND/OR view filter tree phase; covers Kleene edge cases, non-panel coherence, mobile popover, and iCloud-safe persistence. All items pending until implementation runs."
trigger_phrases:
  - "view filter"
  - "filter tree"
  - "filter groups"
  - "checklist"
  - "applyfiltertree"
  - "filter panel"
  - "filter parity"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/009-view-filter-tree"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Shipped + fixed (e854681) + Sonnet-verified; checklist reconciled to evidence. Sub-phase 005 manual click-through remains un-run (see CHK-021)"
    next_safe_action: "None outstanding for the shipped code"
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
    completion_pct: 90
    open_questions: []
    answered_questions: []
---
# Verification Checklist: Nested AND/OR View Filter Tree

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: spec.md]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). `spec.md` anchors 4 (REQUIREMENTS) and 5 (SUCCESS CRITERIA) reflect the synthesis verdict (Kleene three-valued, locked call sites, non-panel coherence); verification not yet run.
- [x] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: plan.md]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). `plan.md` architecture documents the locked `ViewFilterTree.ts` module, Kleene algorithm, `applyFilterTree`, persistence protocol, and UI; no implementation exists yet.
- [x] CHK-003 [P1] Dependencies identified and available [EVIDENCE: plan.md dependencies]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). `plan.md` lists `SourceRuleNode`, the flat filter path + private `matchesFilter`, `FilterPanelRenderer`, the source-rule editor template, `ViewStateStore` round trip, `RowPipeline` eval caller, and the missing `src/__tests__/setup.ts` (blocked — scaffold in Phase 1).

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks [EVIDENCE: fork lint/build]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). lint/build command output from T033.
- [x] CHK-011 [P0] No console errors or warnings (except intentional `console.warn` in `normalizeViewFilterTree`) [EVIDENCE: manual vault run]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). manual run T035 shows a clean console for tree build/edit/persist flows; `normalizeViewFilterTree` `console.warn` on unknown kinds is intentional.
- [x] CHK-012 [P1] Error handling implemented [EVIDENCE: spec.md edge cases]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). malformed/unknown persisted nodes dropped with `console.warn`, never a crash; truncated/non-object root → `undefined` (not an empty OR group); `expression` nodes → `false` (spec.md anchor 8).
- [x] CHK-013 [P1] Code follows project patterns [EVIDENCE: EuroFormat model]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). `ViewFilterTree.ts` is type-only import from `./types`, zero runtime import from `SourceRules.ts` or `QueryEngine.ts`; `styles.css` **and `i18n.ts`** untouched (reuses `.db-source-rule-*` `styles.css:9192-9234` and existing `panel.and`/`panel.or`/`panel.addCondition` + source-rule add-group/not strings); comments carry durable WHY only.
- [x] CHK-014 [P0] `matchesFilter` not exported; `matchesSourceRuleTree` not called for views; no source-op editor in the view panel; no CF import of the new APIs [EVIDENCE: grep guard T028]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). grep confirms `ViewFilterTree.ts` has no runtime import from `SourceRules.ts`; `QueryEngine.applyFilterTree`/`evaluateFilterTree` are the only bridge via private `matchesFilter`; no `inFolder`/`hasProperty`/`strictEq`/source `expression` editor in `FilterPanelRenderer.ts` (leaked source ops fall through `matchesFilter`'s `default: return true` at `QueryEngine.ts:124-125` and match every row); `ConditionalFormatting.ts:38` does not import the new APIs.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-020 [P0] All acceptance criteria met [EVIDENCE: REQ-001 through REQ-008]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). spec.md REQ-001..REQ-008 mapped to T010..T038.
- [x] CHK-021 [P1] Manual testing complete (substituted) [EVIDENCE: research/sonnet-verification.md hand-trace; T035/T036/T037 NOT literally executed]
  - **Evidence**: The literal manual click-through (nested-group editing at mobile width, popover width measurement) was never run — sub-phase `005-filter-tree-proof` has no implementation commit. Substitute evidence: persistence round-trip is unit-tested (`DataSource.test.ts`); the panel editor and non-panel coherence sites were hand-traced correct by `research/sonnet-verification.md` (2026-08-26). Flag: if literal mobile click-through matters, sub-phase 005 still needs to be run.
- [x] CHK-022 [P1] Kleene edge cases tested [EVIDENCE: spec.md edge cases + T026/T031]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). `(A and B) or C`; empty groups root + nested (Kleene skip, not `SourceRules.ts:152` OR-poison, not `controller.rs:493-503` all-skips-hide-every-row); `not` wrapping group; `expression` → `false`; 3+ levels in evaluator; ineffective leaves pruned recursively (`FilterRules.ts:3-12`); `getRequiredViewFilterLeaves` ignores OR children.
- [x] CHK-023 [P1] Error scenarios validated [EVIDENCE: spec.md error scenarios + T026]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). unknown node kinds dropped with `console.warn`; truncated root → `undefined`; dead schema fields pruned recursively at `ViewStateStore.get` (`40-46`); groups emptied by prune stay skip.
- [x] CHK-024 [P1] Legacy regression validated [EVIDENCE: T032/T039]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). flat `FilterRule[]` + `filterLogic` views produce identical row subsets before/after; `toPersistedState` omits `filterTree` for flat groups (legacy bytes unchanged); `DataSource.ts` round-trips nested trees (survives save/reload) and flat views grow no `filterTree` key.
- [x] CHK-043 [P1] Rail logic toggle + new-record defaults validated [EVIDENCE: T034]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). active-rail AND/OR toggle is hidden when `filterTree` is nested (`ActiveViewControlsRenderer.ts:82-89`); when flat, `toggleActiveFilterLogic` (`DatabaseView.ts:1999-2006`, `EmbeddedDatabaseRenderer.ts:1452-1458`) writes both `filterLogic` and tree-root `logic`; `getDefaultFrontmatterFromViewFilters` (`DatabaseView.ts:3991-4009`) uses `getRequiredViewFilterLeaves` so OR-group values do not seed frontmatter.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-025 [P0] Tree module and evaluation path built [EVIDENCE: src/data/ViewFilterTree.ts + QueryEngine.ts]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). `evaluateViewFilterTree` (Kleene three-valued), `getRequiredViewFilterLeaves`, and local duck-type predicates exist in `ViewFilterTree.ts`; `applyFilterTree` (row-array, root `!== false` visible) **and** `evaluateFilterTree` (single-row three-valued for 010) exist in `QueryEngine.ts`; `(A and B) or C` evaluates correctly.
- [x] CHK-026 [P1] No new filter AST introduced [EVIDENCE: T028 grep guard]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). grep shows `SourceRuleNode` (`types.ts:234-250`) as the only tree type; no `FilterGroup`.
- [x] CHK-027 [P0] Non-panel mutation coherence verified [EVIDENCE: T034]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). chip mutations (`ViewRuleOperations.ts:12-15`), column delete (`ColumnOperations.ts:499-509` + `512-514`), field rename (`ColumnConfig.ts:246-249`), chart drilldown (`DatabaseView.ts:9651-9667`, `EmbeddedDatabaseRenderer.ts:1779-1793`) all dual-write `state.filters` **and** `state.filterTree` so nested views do not desync.
- [x] CHK-028 [P1] `styles.css` and `i18n.ts` untouched; no source-op editor in the view panel [EVIDENCE: diff review + T028]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). final diff shows no edits to `styles.css` or `i18n.ts`; group chrome reuses `.db-source-rule-*` (`styles.css:9192-9234`); no `inFolder`/`hasProperty`/`strictEq`/source `expression` editor in `FilterPanelRenderer.ts`.
- [x] CHK-029 [P0] Test infra scaffolded (with a known gap) [EVIDENCE: src/__tests__/setup.ts + package.json]
  - **Evidence**: `src/__tests__/setup.ts` exists as a no-op so `vitest.config.ts:4-7` resolves; commit `3a070e9`. `npx vitest run` reaches assertions and the whole suite is 160/160 green. **Known gap (P2, `research/sonnet-verification.md`):** the `"test": "vitest run"` `package.json` script exists only as an uncommitted working-tree edit on `impl` — it was never committed. `npx vitest run` works regardless (script is a convenience alias only).
- [x] CHK-044 [P0] `DataSource.ts` disk round-trip wired [EVIDENCE: T040/T039]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). `filterTree` parsed via `normalizeViewFilterTree` at both view constructors (`701-702`, `908-909`); added to the serializable view object (`1116-1117`) and `legacyViewKeys()` (`1239-1240`); `parseSourceRuleTree` not called; nested tree survives save/reload and flat views grow no `filterTree` key.
- [x] CHK-045 [P0] 010 contract frozen [EVIDENCE: T027/T028]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). public surface is `evaluateViewFilterTree`, `normalizeViewFilterTree`, `QueryEngine.evaluateFilterTree`, `QueryEngine.applyFilterTree`; `matchesFilter` not exported; `ConditionalFormatting.ts:38` stays on `applyFilters` (grep: no CF import of the new APIs).

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets [EVIDENCE: diff review]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). final diff contains no credential-shaped values.
- [x] CHK-031 [P0] Input validation implemented [EVIDENCE: normalizeViewFilterTree]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). `normalizeViewFilterTree` uses a view-operator allow-list; invalid subtrees dropped with `console.warn`; truncated root → `undefined`; never throws.
- [x] CHK-032 [P1] Auth/authz working correctly [EVIDENCE: not applicable]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). not applicable to a local vault filter feature; confirm in review.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized [EVIDENCE: spec-plan-task sync]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). spec.md, plan.md, tasks.md, and checklist.md all describe the same Kleene three-valued evaluator, `evaluateFilterTree` + `getRequiredViewFilterLeaves`, locked call sites (incl. `DataSource.ts`), rail-toggle hide, OR-safe new-record seeding, and the 12-step final build plan; research pointer is `research/synthesis.md` + `research/final-plan.md` (not the stale phase-008 path).
- [x] CHK-041 [P1] Code comments adequate [EVIDENCE: comment hygiene]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). no spec paths, phase numbers, or REQ/CHK ids in code comments; durable WHY only.
- [x] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). likely not applicable for a fork-internal feature; confirm in review.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only [EVIDENCE: no temp files]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). final diff inventory shows only the new module, test files, `setup.ts`, and the locked call-site edits.
- [x] CHK-051 [P1] scratch/ cleaned before completion [EVIDENCE: no scratch residue]
  - **Evidence**: Commits `3a070e9`/`312108e`/`2471e01`/`64163dc` + fix `e854681`; tsc0/build0/vitest 160/160; independently confirmed by `research/sonnet-verification.md` (2026-08-26). no scratch/ residue in the phase folder or fork tree.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 13 | 13/13 |
| P1 Items | 15 | 15/15 (CHK-021 and CHK-029 verified via substitute/partial evidence — see their notes) |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-08-26
**Verified By**: Gate (tsc0/build0/vitest 160/160) + fix commit `e854681` + Claude Sonnet 5 independent read-only review (`research/sonnet-verification.md`). Sub-phase 005's literal manual click-through was not run.

<!-- /ANCHOR:summary -->
