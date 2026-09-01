---
title: "Feature Specification: Nonpanel Filter Coherence"
description: "Dual-write state.filters and state.filterTree from chips, column delete/rename, and chart drilldown; hide the nested rail AND/OR toggle; seed new records from AND-required leaves only."
trigger_phrases:
  - "nonpanel filter coherence"
  - "dual-write filtertree"
  - "applychartfilters"
  - "toggleactivefilterlogic"
  - "getrequiredviewfilterleaves"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Nonpanel Filter Coherence

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `009-view-filter-tree` |
| **Parent Spec** | ../spec.md |
| **Phase** | 4 of 5 |
| **Predecessor** | 003-filter-panel-tree-editor |
| **Successor** | 005-filter-tree-proof |
| **Handoff Criteria** | Chip delete, column delete/rename, and chart drilldown dual-write tree and chips; nested rail toggle hidden; new-record seeding uses `getRequiredViewFilterLeaves` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 4 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `003-filter-panel-tree-editor` · Successor: `005-filter-tree-proof`. Synthesis rank 5 plus the missed mutators in final-plan step 9 (rail toggle, `toggleActiveFilterLogic`, new-record defaults). One slice: shipping panel+eval without these five-plus sites makes nested groups correct only until the next chip/delete/drilldown.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The fork also mutates `state.filters` from the active rail, column delete/rename, and chart drilldown. If evaluation prefers `filterTree` while those sites write only the flat array, nested views lie. Final-plan also found: `toggleActiveFilterLogic` (`DatabaseView.ts:1999-2006`, `EmbeddedDatabaseRenderer.ts:1452-1458`) flips `state.filterLogic` without the tree; `getDefaultFrontmatterFromViewFilters` (`DatabaseView.ts:3991-4009`) seeds every DFS leaf on root AND, so a root-AND with an inner OR would seed OR-side leaves. Live `applyChartFilters` is `DatabaseView.ts:9651-9667` (not `9651-3664`).

### Purpose
Dual-write `state.filters` **and** `state.filterTree` at every non-panel mutation site. Hide the rail AND/OR toggle when the tree is nested (`ActiveViewControlsRenderer.ts:82-89`). Keep DFS leaf chips. Use `getRequiredViewFilterLeaves` (AND-required only; OR / `not` → `[]`) for new-record defaults.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Dual-write at: `ViewRuleOperations.removeFilterRuleAt` (`12-15`); `ColumnOperations` viewState loop (`499-509`) **and** `removeColumnFromState` (`512-514`); `ColumnConfig` rename (`246-249`); `DatabaseView.applyChartFilters` (`9651-9667`); `EmbeddedDatabaseRenderer.applyChartFilters` (`1779-1793`).
- Hide rail logic toggle when nested (`ActiveViewControlsRenderer.ts:82-89`). If the toggle remains for flat trees, `toggleActiveFilterLogic` (`DatabaseView.ts:1999-2006`, `EmbeddedDatabaseRenderer.ts:1452-1458`) must write both `filterLogic` and tree-root `logic`.
- New records: `getDefaultFrontmatterFromViewFilters` (`DatabaseView.ts:3991-4009`) uses `getRequiredViewFilterLeaves` instead of “all DFS leaves if root AND”. Same idea as `getRequiredSourceRules` (`SourceRules.ts:159-165`).
- Keep DFS leaf chips (dual-write). Do not rebuild AppFlowy chips.

### Out of Scope
- Panel editor (child `003-filter-panel-tree-editor`).
- AppFlowy chip-`Wrap` group editor.
- `removeSourceRuleTreeReferences` auto-flatten (`SourceRules.ts:222-224`) — do not use it; column-delete may prune leaves then persist-normalize.
- Proof/grep freeze (child `005-filter-tree-proof`).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/ViewRuleOperations.ts` | Edit | Dual-write on chip remove (`12-15`) |
| `src/views/ColumnOperations.ts` | Edit | Dual-write on column delete (`499-509`, `512-514`) |
| `src/data/ColumnConfig.ts` | Edit | Dual-write on field rename (`246-249`) |
| `src/views/DatabaseView.ts` | Edit | `applyChartFilters` `9651-9667`; `toggleActiveFilterLogic` `1999-2006`; `getDefaultFrontmatterFromViewFilters` `3991-4009` |
| `src/views/EmbeddedDatabaseRenderer.ts` | Edit | `applyChartFilters` `1779-1793`; `toggleActiveFilterLogic` `1452-1458` |
| `src/views/ActiveViewControlsRenderer.ts` | Edit | Hide AND/OR toggle when nested (`82-89`) |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Chip / column / chart dual-write | After `removeFilterRuleAt` (`12-15`), column delete (`499-514`), rename (`246-249`), or either `applyChartFilters`, `state.filters` and `state.filterTree` describe the same leaves |
| REQ-002 | Nested rail toggle does not desync | Toggle hidden when `filterTree` is nested (`82-89`); flat toggle writes `filterLogic` and tree-root `logic` (`1999-2006`, `1452-1458`) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-003 | New-record defaults are AND-required | `getDefaultFrontmatterFromViewFilters` (`3991-4009`) uses `getRequiredViewFilterLeaves`; OR / `not` children do not seed frontmatter |
| REQ-004 | Keep DFS leaf chips | Dual-write leaves so toolbar badges (`getEffectiveFilterRules`, `ActiveViewControlsRenderer.ts:37-40`) stay correct; no chip-`Wrap` rebuild |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Chip delete on a nested view leaves tree and chips consistent.
- **SC-002**: Column delete / rename and chart drilldown do not drop nested groups.
- **SC-003**: Nested views hide the rail AND/OR control.
- **SC-004**: OR-group values do not seed new-record frontmatter.

### Acceptance Scenarios

- **Given** a nested tree, **when** the user deletes a chip, **when** the panel reopens, **then** that leaf is gone from `filterTree` too (`ViewRuleOperations.ts:12-15`).
- **Given** a nested tree, **when** a column is deleted or renamed, **then** both `state.filters` and `state.filterTree` drop or rename that field (`ColumnOperations.ts:499-514`, `ColumnConfig.ts:246-249`).
- **Given** chart drilldown, **when** `applyChartFilters` runs (`9651-9667` / `1779-1793`), **then** the tree is updated, not only the flat array.
- **Given** a nested tree, **when** the active rail renders, **then** the AND/OR toggle is hidden (`82-89`).
- **Given** a root-AND with an inner OR, **when** a new record is created, **then** only AND-required leaves seed frontmatter (`3991-4009`).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Miss one mutator | Nested groups desync on that edit | One slice covering all listed sites |
| Risk | Wrong `applyChartFilters` line | Edit the wrong method | Live method is `9651-9667` |
| Risk | OR-poisoned new records | Frontmatter gets OR-side values | `getRequiredViewFilterLeaves` |
| Dependency | Child 001 leaf helpers + `getRequiredViewFilterLeaves` | Cannot dual-write or seed safely | After 001 |
| Dependency | Child 003 panel as source of truth | Coherence can start after 002; panel should exist so dual-write is testable | After 003 per final-plan |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: keep DFS leaf chips; hide the rail logic toggle when nested; do not rebuild AppFlowy chips.
<!-- /ANCHOR:questions -->
