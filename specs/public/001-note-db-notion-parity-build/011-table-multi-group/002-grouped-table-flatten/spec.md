---
title: "Feature Specification: Grouped Table Flatten"
description: "Table-only dispatch plus a depth-aware TableRenderer loop: indented headers, path-qualified hide keys, depth-0 drop targets, and full-path create defaults."
trigger_phrases:
  - "grouped table flatten"
  - "depth-aware table loop"
  - "db-group-header depth"
  - "renderGroupedTable"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/011-table-multi-group/002-grouped-table-flatten"
    last_updated_at: "2026-08-25T20:50:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored flatten-loop child from synthesis and final-plan"
    next_safe_action: "Implement table dispatch, TableRenderer loop, and indent CSS"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-grouped-table-flatten"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Grouped Table Flatten

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `011-table-multi-group` |
| **Parent Spec** | ../spec.md |
| **Phase** | 2 of 5 |
| **Predecessor** | 001-multifield-grouping-module |
| **Successor** | 003-embedded-table-grouping |
| **Handoff Criteria** | 2-field table nests with indented headers; 1-field DOM matches today; create defaults use per-level leaf keys |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 2 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-multifield-grouping-module` · Successor: `003-embedded-table-grouping`. This child owns `research/final-plan.md` steps 3–4 (synthesis ranks 3, 4, 8). Indent, hide-subtree, drop-target gate, and full-path create defaults are **one loop edit** at `TableRenderer.ts:82-155` — do not ship a half-loop that only skips the leaf table (`:132` today).

Gallery/list (`DatabaseView.ts:9554-9578`) and timeline (`getActiveGroupField` at `2890-2894`) stay on `vs().groupByField`. Nested DnD stays out.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Table dispatch is still one string (`DatabaseView.ts:6332-6333` → `renderGroupedTable` `9539-9545`). `TableGroup` is flat `{key, rows, count}` (`TableRenderer.ts:17-21`) and the loop (`:82-155`) has zero depth. Path-qualified hide keys and indented headers do not exist. Create-in-group passes one pair (`:470`); if that pair used `path.join("::")` as the value, new rows would get `Category = "Cat::Type"`. Nested `setupGroupDropTarget` (`:111, 136, 145, 672`) would call `moveRowsToGroup` (`:37-38`) on one field and break display-only / iCloud.

### Purpose
Gate multi-field grouping at **table dispatch only**, flatten the tree into the existing loop, indent via `db-group-header--depth-N`, hide a Category subtree when that header is closed, call `setupGroupDropTarget` **only at depth 0**, and pass the full path as `context.groups` so `getCreateDefaults` (`DatabaseView.ts:4599-4606`) merges every level.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Dispatch `DatabaseView.ts:6332-6333`: `effectiveGroupFields(config, this.vs()).length > 0` then `renderGroupedTable`. Do not change gallery/list/timeline.
- `renderGroupedTable` (`:9539-9545`): `fields = dropComputedGroupFields(effectiveGroupFields(...))`; `flattened = flattenGroupTree(buildGroupTree(this.rows, fields, config, groupFn))`; `tableRenderer.renderGroupedTable(..., flattened, fields[0])`.
- Leave `tryPatchExternalTableRows` (`:2241-2263`) on `state.groupByField` + today's flat groups. Nested flatten fails `patchGroupedRows` (`TableRenderer.ts:209-250`) and full-rerenders — that is the safety valve. Prove 1-field still patches.
- Extend `TableGroup` additively: `depth?`, `path?`, `field?`, `collapseKey?`, `children?` (`TableRenderer.ts:17-21`).
- Loop (`:82-155`): always render header; class `db-group-header--depth-N`; hide via `isGroupCollapsed(fields[0], collapseKey)` / `toggleGroupCollapsed` (`DatabaseView.ts:9845-9856` — keys stay opaque). If hidden, skip while `depth` is deeper than that ancestor. If `children.length`, skip the leaf table. If leaf: today's table + summaries + `getGroupVisibleCount(config, fields[0], collapseKey, ...)` + expand controls.
- `setupGroupDropTarget` **only at depth 0**, using `fields[0]` and the plain leaf `key` (not `collapseKey`). Nested groups: no drop target.
- Create: leaf `defaults` = merge `resolveGroupCreateDefaults` for every `(field, key)` in the path (`GroupDisplay` + `DatabaseView.ts:4599-4606`). `setupRow` `context.groups` = that same array (`TableRenderer.ts:470` today is one pair). Computed level ⇒ no create (`:149-150`).
- CSS: `padding-left: calc(16px * N)` on `--depth-N` (`styles.css:6171-6185`, header is `padding: 0` at `6184`); `.db-group-header + .db-group-header { margin-top: 5px }` beside `:6255-6257`; depth ≥ 1 not sticky (depth 0 keeps sticky). Toggles stay 20×20 (`:6218-6219`). `tableMinWidth` per header (`TableRenderer.ts:112`) unchanged.

### Out of Scope
- Creating the module / persist (child 001).
- Embedded dispatch (child 003).
- Toolbar Sub-group picker (child 004).
- Nested multi-field row drag; extending `patchGroupedRows`; stacked sticky `top` offsets; ViewStateStore; gallery/list/timeline multi-field.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/DatabaseView.ts` | Edit | Dispatch `:6332-6333`; `renderGroupedTable` `:9539-9545`; leave patch path `:2241-2263` |
| `src/views/TableRenderer.ts` | Edit | Additive `TableGroup` `:17-21`; depth-aware loop `:82-155`; create path `:148-151, 470` |
| `styles.css` | Edit | `--depth-N` indent, consecutive-header margin beside `:6255-6257`, sticky only at depth 0 (`:6171-6185`) |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Table dispatch uses `effectiveGroupFields` | `DatabaseView.ts:6332-6333` length > 0 then grouped table; gallery/list `:9554-9578` and timeline `:2890-2894` unchanged |
| REQ-002 | Nested headers indent and hide subtrees | `db-group-header--depth-N` at 16px per depth; hiding a Category skips Type headers (`TableRenderer.ts:82-155`); depth 0 hide keys stay plain |
| REQ-003 | 1-field backward compatibility | Flatten depth 0; hide keys unchanged; DOM byte-identical to today; 1-field `patchGroupedRows` still succeeds |
| REQ-004 | Display-only drop-target gate | `setupGroupDropTarget` only at depth 0 with the plain leaf `key`; nested groups have no drop target (`TableRenderer.ts:111, 136, 145`) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Create-in-group writes every path field | New row in `Cat / Type` gets both properties, not `Category = "Cat::Type"` (`DatabaseView.ts:4599-4606`; `TableRenderer.ts:470`) |
| REQ-006 | Sticky only at depth 0 | Depth ≥ 1 headers are `position: relative` (or not sticky); two depths must not share one sticky slot (`styles.css:6171-6184`) |
| REQ-007 | Mobile-safe | No new media queries; `tableMinWidth` per header (`:112`); toggles stay 20×20 (`styles.css:6218-6219`); overflow equal to today at ≤360px |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A 2-field Category/Type table nests with indented headers; hiding Category conceals Type.
- **SC-002**: A 1-field table matches today's DOM and hide keys; 1-field external patch still works.
- **SC-003**: Drop on a Type header does not write; new row in `Cat / Type` gets both properties.
- **SC-004**: ≤360px, no new media queries, overflow equal to today.

### Acceptance Scenarios

- **Given** `groupByFields: [Category, Type]`, **when** the table renders, **then** Type headers sit inside each Category with `--depth-1` indent.
- **Given** a hidden Category, **when** the loop runs, **then** its Type headers and leaf tables are skipped (not only the table at `:132`).
- **Given** a legacy `groupByField` table, **when** this child lands, **then** collapseKey equals leaf key at depth 0 and `patchGroupedRows` still finds `.db-table-wrap`.
- **Given** a 2-field tree, **when** an external cell edit hits `tryPatchExternalTableRows` (`DatabaseView.ts:2199-2272`), **then** patch returns false and a full render runs.
- **Given** create inside `Cat / Type`, **when** defaults merge, **then** both fields are set from per-level leaf keys (`DatabaseView.ts:4599-4606`).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Child `001-multifield-grouping-module` | No tree/flatten helpers | Wait for module + persist |
| Risk | Half-loop that only skips the table (`:132`) | Subgroup headers stay visible under a hidden parent | One loop edit; skip while deeper than the hidden ancestor |
| Risk | `collapseKey` used as create/DnD value | `Category = "Cat::Type"` | Three fields: `collapseKey`, leaf `key`, per-level `(field, key)` |
| Risk | Nested drop target | Two-field vault write | `setupGroupDropTarget` only at depth 0 |
| Risk | Sticky stacking | Nested headers paint over each other (`styles.css:6171-6184`) | Sticky only at depth 0 |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking. Locked defaults: indent 16px per depth via `padding-left`; sticky only at depth 0; do not extend `patchGroupedRows`; nested DnD deferred.
<!-- /ANCHOR:questions -->
