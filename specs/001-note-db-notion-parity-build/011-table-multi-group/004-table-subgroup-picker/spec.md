---
title: "Feature Specification: Table Sub-group Picker"
description: "Table-gated toolbar Sub-group section cloned from the board popover: picker max 2, computed fields filtered, writes groupByFields while keeping vs().groupByField as primary."
trigger_phrases:
  - "table subgroup picker"
  - "renderBoardSubgroupSection"
  - "populateGroupPopover"
  - "groupByFields writer"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/011-table-multi-group/004-table-subgroup-picker"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored table Sub-group picker child from synthesis and final-plan"
    next_safe_action: "Clone renderBoardSubgroupSection behind table view type"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-table-subgroup-picker"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Table Sub-group Picker

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `011-table-multi-group` |
| **Parent Spec** | ../spec.md |
| **Phase** | 4 of 5 |
| **Predecessor** | 003-embedded-table-grouping |
| **Successor** | 005-multigroup-display-proof |
| **Handoff Criteria** | Sub-group appears only on table views; reload after picking two fields still nests; board UI unchanged |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 4 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `003-embedded-table-grouping` · Successor: `005-multigroup-display-proof`. This child owns `research/final-plan.md` step 6 (synthesis rank 7, corrected). `ViewConfigPanelRenderer.renderBoardSettings` (`:1561-1587`) is reached only when `viewType === "board"` (`:313-317`); table views never enter it (`:329`). **Do not** edit `renderBoardSettings`. Clone `renderBoardSubgroupSection` (`ToolbarRenderer.ts:1423-1448`) inside `populateGroupPopover` (`:1221-1266`) behind `currentViewType === "table"`. A second toolbar picker and a ViewConfigPanel table section are deferred.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Parse acceptance (child 001) meets REQ-001 technically, but Notion's View settings surface needs a Group + Sub-group control. Table Group already lives in `ToolbarRenderer.populateGroupPopover` (`:1221-1266`). Cloning the board dropdown into `renderBoardSettings` would never show on tables. Board candidates only exclude `file.name` + primary (`ToolbarRenderer.ts:1462`); table Sub-group candidates must also drop `isComputedGroupField` (`GroupDisplay.ts:64-69`).

### Purpose
Add one table-gated Sub-group section in the existing group popover: cap at one subgroup (picker max 2), write `config.groupByFields = sub ? [primary, sub] : undefined`, keep `vs().groupByField = primary` (`setGroupByField` at `DatabaseView.ts:2417` / write path `:2408-2426`), and clear a colliding subgroup when primary changes (board already does this at `:2428-2430`).
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Table-only section in `populateGroupPopover` (`ToolbarRenderer.ts:1221-1266`), cloned from `renderBoardSubgroupSection` (`:1423-1448`).
- Candidate filter = board filter (`:1462`: exclude primary + `file.name`) plus `!isComputedGroupField`.
- Writer: `config.groupByFields = sub ? [primary, sub] : undefined`; keep `vs().groupByField = primary`; `viewStateStore.persist` already copies primary to `config.groupByField` (`ViewStateStore.ts:69-84`). Changing primary clears a colliding subgroup (`DatabaseView.ts:2428-2430` pattern).
- Undo label: reuse `undo.groupConfig` or add one i18n key — do **not** reuse `undo.boardSubgroupConfig` (`ViewConfigPanelRenderer.ts:1586`).
- Picker max 2 (one subgroup). Compute remains unbounded in the module (child 001).

### Out of Scope
- Editing `renderBoardSettings` / any ViewConfigPanel table section.
- A second toolbar picker beyond this single Sub-group control (synthesis rank 9 deferred).
- Unifying with `boardSubgroupEnabled` / `boardSubgroupField` (`types.ts:339-340`).
- Gallery/list seeing `groupByFields`.
- Nested DnD; ViewStateStore `groupByFields` thread (`types.ts:167`).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/ToolbarRenderer.ts` | Edit | Table-gated clone of `:1423-1448` in `populateGroupPopover` `:1221-1266`; candidates `:1462` plus computed filter |
| `src/views/DatabaseView.ts` | Edit | Write path `:2408-2426`; keep `vs().groupByField = primary`; clear colliding subgroup on primary change |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Sub-group control appears only on table views | Gated on `currentViewType === "table"` inside `populateGroupPopover`; board UI unchanged; gallery/list never see `groupByFields` |
| REQ-002 | Writer keeps primary consistent | `config.groupByFields = sub ? [primary, sub] : undefined`; `vs().groupByField = primary` (`:2408-2426`); persist still copies primary (`ViewStateStore.ts:69-84`) |
| REQ-003 | Computed / rollup cannot be picked | Table candidates drop `isComputedGroupField` (`GroupDisplay.ts:64-69`) in addition to board's `file.name` + primary (`:1462`) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Picker cap is 2 | One subgroup only; a 3-field config still nests in the data layer (child 001) but the UI does not offer a third |
| REQ-005 | Primary change drops a colliding subgroup | Same pattern as board `:2428-2430` |
| REQ-006 | Undo label is not board-specific | Reuse `undo.groupConfig` (or one new i18n key); do not reuse `undo.boardSubgroupConfig` (`ViewConfigPanelRenderer.ts:1586`) |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Sub-group appears only on table views; board popover unchanged.
- **SC-002**: Picking Category then Type writes `groupByFields: [Category, Type]` and still nests after reload.
- **SC-003**: Computed/rollup fields are absent from the Sub-group list.
- **SC-004**: Gallery/list never grow a `groupByFields` writer.

### Acceptance Scenarios

- **Given** a table view, **when** the group popover opens, **then** a Sub-group control is visible and capped at one extra field.
- **Given** a board view, **when** the same popover opens, **then** the existing board subgroup UI is unchanged and `groupByFields` is not written.
- **Given** primary changes to equal the current subgroup, **when** the writer runs, **then** the subgroup is cleared (`:2428-2430` pattern).
- **Given** a computed field, **when** Sub-group candidates are listed, **then** it is omitted (`GroupDisplay.ts:64-69`).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Child 001 persist | Picker writes an array that would be stripped | Wait for DataSource serialize |
| Dependency | Child 002 flatten | Picker would save config with no nested UI | Nested display should already work from YAML |
| Risk | Cloning into `renderBoardSettings` | Tables never see the control (`:313-317, :329`) | Toolbar clone only |
| Risk | Reusing `undo.boardSubgroupConfig` | Wrong undo string on tables | REQ-006 |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking. Locked defaults: picker max 2; do not edit `renderBoardSettings`; defer a ViewConfigPanel table section and a second toolbar picker.
<!-- /ANCHOR:questions -->
