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
    packet_pointer: "obsidian/002-note-db-notion-parity-build/009-view-filter-tree"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan findings; CHK-043/044/045 added, counts refreshed"
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

- [ ] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: spec.md]
  - **Evidence**: PENDING — `spec.md` anchors 4 (REQUIREMENTS) and 5 (SUCCESS CRITERIA) reflect the synthesis verdict (Kleene three-valued, locked call sites, non-panel coherence); verification not yet run.
- [ ] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: plan.md]
  - **Evidence**: PENDING — `plan.md` architecture documents the locked `ViewFilterTree.ts` module, Kleene algorithm, `applyFilterTree`, persistence protocol, and UI; no implementation exists yet.
- [ ] CHK-003 [P1] Dependencies identified and available [EVIDENCE: plan.md dependencies]
  - **Evidence**: PENDING — `plan.md` lists `SourceRuleNode`, the flat filter path + private `matchesFilter`, `FilterPanelRenderer`, the source-rule editor template, `ViewStateStore` round trip, `RowPipeline` eval caller, and the missing `src/__tests__/setup.ts` (blocked — scaffold in Phase 1).

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks [EVIDENCE: fork lint/build]
  - **Evidence**: PENDING — lint/build command output from T033.
- [ ] CHK-011 [P0] No console errors or warnings (except intentional `console.warn` in `normalizeViewFilterTree`) [EVIDENCE: manual vault run]
  - **Evidence**: PENDING — manual run T035 shows a clean console for tree build/edit/persist flows; `normalizeViewFilterTree` `console.warn` on unknown kinds is intentional.
- [ ] CHK-012 [P1] Error handling implemented [EVIDENCE: spec.md edge cases]
  - **Evidence**: PENDING — malformed/unknown persisted nodes dropped with `console.warn`, never a crash; truncated/non-object root → `undefined` (not an empty OR group); `expression` nodes → `false` (spec.md anchor 8).
- [ ] CHK-013 [P1] Code follows project patterns [EVIDENCE: EuroFormat model]
  - **Evidence**: PENDING — `ViewFilterTree.ts` is type-only import from `./types`, zero runtime import from `SourceRules.ts` or `QueryEngine.ts`; `styles.css` **and `i18n.ts`** untouched (reuses `.db-source-rule-*` `styles.css:9192-9234` and existing `panel.and`/`panel.or`/`panel.addCondition` + source-rule add-group/not strings); comments carry durable WHY only.
- [ ] CHK-014 [P0] `matchesFilter` not exported; `matchesSourceRuleTree` not called for views; no source-op editor in the view panel; no CF import of the new APIs [EVIDENCE: grep guard T028]
  - **Evidence**: PENDING — grep confirms `ViewFilterTree.ts` has no runtime import from `SourceRules.ts`; `QueryEngine.applyFilterTree`/`evaluateFilterTree` are the only bridge via private `matchesFilter`; no `inFolder`/`hasProperty`/`strictEq`/source `expression` editor in `FilterPanelRenderer.ts` (leaked source ops fall through `matchesFilter`'s `default: return true` at `QueryEngine.ts:124-125` and match every row); `ConditionalFormatting.ts:38` does not import the new APIs.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All acceptance criteria met [EVIDENCE: REQ-001 through REQ-008]
  - **Evidence**: PENDING — spec.md REQ-001..REQ-008 mapped to T010..T038.
- [ ] CHK-021 [P1] Manual testing complete [EVIDENCE: T035/T036/T037]
  - **Evidence**: PENDING — nested-group editing verified in the vault at mobile width; popover width measured; persistence round-trip verified.
- [ ] CHK-022 [P1] Kleene edge cases tested [EVIDENCE: spec.md edge cases + T026/T031]
  - **Evidence**: PENDING — `(A and B) or C`; empty groups root + nested (Kleene skip, not `SourceRules.ts:152` OR-poison, not `controller.rs:493-503` all-skips-hide-every-row); `not` wrapping group; `expression` → `false`; 3+ levels in evaluator; ineffective leaves pruned recursively (`FilterRules.ts:3-12`); `getRequiredViewFilterLeaves` ignores OR children.
- [ ] CHK-023 [P1] Error scenarios validated [EVIDENCE: spec.md error scenarios + T026]
  - **Evidence**: PENDING — unknown node kinds dropped with `console.warn`; truncated root → `undefined`; dead schema fields pruned recursively at `ViewStateStore.get` (`40-46`); groups emptied by prune stay skip.
- [ ] CHK-024 [P1] Legacy regression validated [EVIDENCE: T032/T039]
  - **Evidence**: PENDING — flat `FilterRule[]` + `filterLogic` views produce identical row subsets before/after; `toPersistedState` omits `filterTree` for flat groups (legacy bytes unchanged); `DataSource.ts` round-trips nested trees (survives save/reload) and flat views grow no `filterTree` key.
- [ ] CHK-043 [P1] Rail logic toggle + new-record defaults validated [EVIDENCE: T034]
  - **Evidence**: PENDING — active-rail AND/OR toggle is hidden when `filterTree` is nested (`ActiveViewControlsRenderer.ts:82-89`); when flat, `toggleActiveFilterLogic` (`DatabaseView.ts:1999-2006`, `EmbeddedDatabaseRenderer.ts:1452-1458`) writes both `filterLogic` and tree-root `logic`; `getDefaultFrontmatterFromViewFilters` (`DatabaseView.ts:3991-4009`) uses `getRequiredViewFilterLeaves` so OR-group values do not seed frontmatter.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-025 [P0] Tree module and evaluation path built [EVIDENCE: src/data/ViewFilterTree.ts + QueryEngine.ts]
  - **Evidence**: PENDING — `evaluateViewFilterTree` (Kleene three-valued), `getRequiredViewFilterLeaves`, and local duck-type predicates exist in `ViewFilterTree.ts`; `applyFilterTree` (row-array, root `!== false` visible) **and** `evaluateFilterTree` (single-row three-valued for 010) exist in `QueryEngine.ts`; `(A and B) or C` evaluates correctly.
- [ ] CHK-026 [P1] No new filter AST introduced [EVIDENCE: T028 grep guard]
  - **Evidence**: PENDING — grep shows `SourceRuleNode` (`types.ts:234-250`) as the only tree type; no `FilterGroup`.
- [ ] CHK-027 [P0] Non-panel mutation coherence verified [EVIDENCE: T034]
  - **Evidence**: PENDING — chip mutations (`ViewRuleOperations.ts:12-15`), column delete (`ColumnOperations.ts:499-509` + `512-514`), field rename (`ColumnConfig.ts:246-249`), chart drilldown (`DatabaseView.ts:9651-9667`, `EmbeddedDatabaseRenderer.ts:1779-1793`) all dual-write `state.filters` **and** `state.filterTree` so nested views do not desync.
- [ ] CHK-028 [P1] `styles.css` and `i18n.ts` untouched; no source-op editor in the view panel [EVIDENCE: diff review + T028]
  - **Evidence**: PENDING — final diff shows no edits to `styles.css` or `i18n.ts`; group chrome reuses `.db-source-rule-*` (`styles.css:9192-9234`); no `inFolder`/`hasProperty`/`strictEq`/source `expression` editor in `FilterPanelRenderer.ts`.
- [ ] CHK-029 [P0] Test infra scaffolded [EVIDENCE: src/__tests__/setup.ts + package.json]
  - **Evidence**: PENDING — `src/__tests__/setup.ts` exists as a no-op so `vitest.config.ts:4-7` resolves; fork `package.json` has a `"test": "vitest run"` script (none today); first `npx vitest run` reaches assertions.
- [ ] CHK-044 [P0] `DataSource.ts` disk round-trip wired [EVIDENCE: T040/T039]
  - **Evidence**: PENDING — `filterTree` parsed via `normalizeViewFilterTree` at both view constructors (`701-702`, `908-909`); added to the serializable view object (`1116-1117`) and `legacyViewKeys()` (`1239-1240`); `parseSourceRuleTree` not called; nested tree survives save/reload and flat views grow no `filterTree` key.
- [ ] CHK-045 [P0] 010 contract frozen [EVIDENCE: T027/T028]
  - **Evidence**: PENDING — public surface is `evaluateViewFilterTree`, `normalizeViewFilterTree`, `QueryEngine.evaluateFilterTree`, `QueryEngine.applyFilterTree`; `matchesFilter` not exported; `ConditionalFormatting.ts:38` stays on `applyFilters` (grep: no CF import of the new APIs).

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets [EVIDENCE: diff review]
  - **Evidence**: PENDING — final diff contains no credential-shaped values.
- [ ] CHK-031 [P0] Input validation implemented [EVIDENCE: normalizeViewFilterTree]
  - **Evidence**: PENDING — `normalizeViewFilterTree` uses a view-operator allow-list; invalid subtrees dropped with `console.warn`; truncated root → `undefined`; never throws.
- [ ] CHK-032 [P1] Auth/authz working correctly [EVIDENCE: not applicable]
  - **Evidence**: PENDING — not applicable to a local vault filter feature; confirm in review.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized [EVIDENCE: spec-plan-task sync]
  - **Evidence**: PENDING — spec.md, plan.md, tasks.md, and checklist.md all describe the same Kleene three-valued evaluator, `evaluateFilterTree` + `getRequiredViewFilterLeaves`, locked call sites (incl. `DataSource.ts`), rail-toggle hide, OR-safe new-record seeding, and the 12-step final build plan; research pointer is `research/synthesis.md` + `research/final-plan.md` (not the stale phase-008 path).
- [ ] CHK-041 [P1] Code comments adequate [EVIDENCE: comment hygiene]
  - **Evidence**: PENDING — no spec paths, phase numbers, or REQ/CHK ids in code comments; durable WHY only.
- [ ] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: PENDING — likely not applicable for a fork-internal feature; confirm in review.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only [EVIDENCE: no temp files]
  - **Evidence**: PENDING — final diff inventory shows only the new module, test files, `setup.ts`, and the locked call-site edits.
- [ ] CHK-051 [P1] scratch/ cleaned before completion [EVIDENCE: no scratch residue]
  - **Evidence**: PENDING — no scratch/ residue in the phase folder or fork tree.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 13 | 0/13 |
| P1 Items | 15 | 0/15 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-08-25
**Verified By**: Pending — phase not yet implemented

<!-- /ANCHOR:summary -->
