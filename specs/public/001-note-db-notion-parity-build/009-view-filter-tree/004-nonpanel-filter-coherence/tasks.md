---
title: "Tasks: Nonpanel Filter Coherence"
description: "One-slice tasks to dual-write filter tree and chips at chip/column/chart sites, hide the nested rail toggle, and seed AND-required new-record leaves."
trigger_phrases:
  - "nonpanel filter coherence tasks"
  - "dual-write filtertree"
  - "applychartfilters"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/009-view-filter-tree/004-nonpanel-filter-coherence"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored nonpanel-filter-coherence child from synthesis rank 5 and final-plan step 9"
    next_safe_action: "Dual-write chip/column/chart mutators; hide nested rail toggle; AND-required new-record leaves"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-nonpanel-filter-coherence"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Nonpanel Filter Coherence

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (target — fork file:line)`

T002–T004 are one coherence slice. Do not ship chip dual-write without column/chart/rail/new-record.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Re-read `ViewRuleOperations.ts:12-15`, `ColumnOperations.ts:499-514`, `ColumnConfig.ts:246-249`, `DatabaseView.ts:1999-2006`, `3991-4009`, `9651-9667`, `EmbeddedDatabaseRenderer.ts:1452-1458`, `1779-1793`, `ActiveViewControlsRenderer.ts:82-89` [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 Dual-write `state.filters` **and** `state.filterTree` at `ViewRuleOperations.removeFilterRuleAt` (`12-15`); `ColumnOperations` viewState loop (`499-509`) **and** `removeColumnFromState` (`512-514`); `ColumnConfig` rename (`246-249`); `DatabaseView.applyChartFilters` (`9651-9667`); `EmbeddedDatabaseRenderer.applyChartFilters` (`1779-1793`). Use `mapLeafAt` / `removeLeafAt` / `appendLeaf`; do not use `removeSourceRuleTreeReferences` (`SourceRules.ts:222-224`) (`src/views/ViewRuleOperations.ts`, `src/views/ColumnOperations.ts`, `src/data/ColumnConfig.ts`, `src/views/DatabaseView.ts`, `src/views/EmbeddedDatabaseRenderer.ts`) [M]
- [ ] T003 Hide the rail AND/OR toggle when `filterTree` is nested (`ActiveViewControlsRenderer.ts:82-89`); if the toggle remains for flat trees, `toggleActiveFilterLogic` (`DatabaseView.ts:1999-2006`, `EmbeddedDatabaseRenderer.ts:1452-1458`) writes both `filterLogic` and tree-root `logic` (`src/views/ActiveViewControlsRenderer.ts`, `src/views/DatabaseView.ts`, `src/views/EmbeddedDatabaseRenderer.ts`) [S]
- [ ] T004 `getDefaultFrontmatterFromViewFilters` (`DatabaseView.ts:3991-4009`) uses `getRequiredViewFilterLeaves` instead of all DFS leaves if root AND (`src/views/DatabaseView.ts:3991-4009`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Nested view: chip delete, column delete, rename, chart drilldown leave tree and chips consistent; OR-group values do not seed frontmatter [M]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T002–T004 shipped together
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 5
- **Parent final-plan**: `../research/final-plan.md` step 9
<!-- /ANCHOR:cross-refs -->
