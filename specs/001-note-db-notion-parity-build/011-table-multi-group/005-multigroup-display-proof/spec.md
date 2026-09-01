---
title: "Feature Specification: Multigroup Display Proof"
description: "Prove table multi-group after children 001–004: render matrix, persist reload, 1-field patch, mobile, diff-shape, display-only, nested DnD still out."
trigger_phrases:
  - "multigroup display proof"
  - "table grouping matrix"
  - "groupbyfields reload"
  - "1-field patch"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/011-table-multi-group/005-multigroup-display-proof"
    last_updated_at: "2026-08-27T17:27:13Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored multi-group display-proof child from synthesis and final-plan"
    next_safe_action: "Run render matrix and persist proofs after children 001-004 ship"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-005-multigroup-display-proof"
      parent_session_id: null
    completion_pct: 95
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Feature Specification: Multigroup Display Proof

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `011-table-multi-group` |
| **Parent Spec** | ../spec.md |
| **Phase** | 5 of 5 |
| **Predecessor** | 004-table-subgroup-picker |
| **Successor** | None |
| **Handoff Criteria** | REQ-001–008 and SC-001–004 recorded in checklist.md; nested DnD still out |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 5 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `004-table-subgroup-picker`. This child owns `research/final-plan.md` step 7. Do not extend `patchGroupedRows`. Do not enable nested drop targets. The module's computed-drop `console.warn` (`GroupDisplay.ts:64-69`) is a planned warning, not a proof failure.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Without the locked proofs, a 2-field table can "pass" while 1-field hide keys change, while persist drops `groupByFields`, while a Type header writes on drop, or while empty months of grouping (nulls, multi-select fan-out, computed leftovers) throw. `patchGroupedRows` requires each header's next sibling to be `.db-table-wrap` (`TableRenderer.ts:209-250`); 2-field trees must full-rerender. Nested DnD would break the display-only / iCloud contract.

### Purpose
Prove the render matrix, persistence reload, 1-field byte-identical DOM, 1-field patch vs 2-field fallback, mobile ≤360px, EuroFormat diff-shape, and zero new write path. Record evidence in this packet. Nested DnD stays out.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Render matrix: 1 / 2 / 3-field (data layer only for 3), nulls → `t("common.uncategorized")` (`QueryEngine.ts:279`), empty groups (`GroupVisibility.ts:52-60`; multi-select default hidden `:20`), mixed types (`QueryEngine.ts:276-280`), checkbox/date at depth (`:261`, `dateGroupModes[field]`), multi-select fan-out (`:143-147`; counts non-exclusive), computed refusal, empty DB (`TableRenderer.ts:92-98`), hidden parent subtree, filter-before-group (`DatabaseView.ts:6313` then `:6332`).
- Persistence reload; 1-field byte-identical + hide keys unchanged; 1-field patch still works; 2-field patch falls back.
- Mobile ≤360px; no new media queries; overflow equal to today (`TableRenderer.ts:112`).
- Diff-shape: 1 new `src/data/` module + 3 logical sites (DatabaseView dispatch+render, TableRenderer loop, types+DataSource) with CSS + Embedded + toolbar as siblings; rebase dry-run; grep new module for vault writes / `fetch`.
- Nested DnD still out (depth > 0 has no drop target).
- Record evidence in `checklist.md` + honest `implementation-summary.md`.

### Out of Scope
- Implementing the module, loop, embed, or picker (children 001–004).
- Extending `patchGroupedRows` for nested trees.
- Nested multi-field row drag.
- Unifying with board subgroup; ViewStateStore `groupByFields` thread.
- Treating the computed-drop `console.warn` as a failure.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| This child's `checklist.md` / `implementation-summary.md` | Modify | Evidence rows for proofs |
| Fork TypeScript | Do not change | Proofs only |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | 2-field table nests | Category then Type with indented headers; hiding Category conceals Type (parent SC-001) |
| REQ-002 | 1-field is byte-identical | Hide keys and DOM match today (parent REQ-004 / SC-002) |
| REQ-003 | Persist survives reload | `groupByFields: [Category, Type]` still nests after save+reload (`DataSource.ts:885, 1088`) |
| REQ-004 | Display-only | New module writes nothing; no `fetch`; nested groups have no drop target; grep `MultiFieldGrouping.ts` for vault writes |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Patch safety valve | 1-field `patchGroupedRows` succeeds; 2-field returns false and full-rerenders (`TableRenderer.ts:209-250`) |
| REQ-006 | Edge matrix | Nulls, empty groups, mixed types, checkbox/date, multi-select fan-out, computed drop (planned warn), empty DB, filter-before-group all hold |
| REQ-007 | Mobile + diff-shape | ≤360px no new media queries; 1 module + 3 logical sites; CSS + Embedded + toolbar additive; rebase dry-run |
| REQ-008 | Nested DnD stays out | Depth > 0 has no `setupGroupDropTarget`; no multi-field `moveRowsToGroup` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Render matrix and persist reload pass; 1-field DOM unchanged.
- **SC-002**: 1-field patch works; 2-field full-rerenders; no new write path.
- **SC-003**: Diff-shape and mobile checks pass; nested DnD still out.

### Acceptance Scenarios

- **Given** 1 / 2 / 3-field configs (3 in data layer only), **when** grouping runs, **then** nest depth matches field count and picker still caps at 2.
- **Given** null / empty / mixed / checkbox / date / multi-select / computed leftover / empty DB / hidden parent / filter-before-group, **when** the table renders, **then** none of those cases throw and computed leftover only warns.
- **Given** a 1-field and a 2-field table, **when** an external cell edit lands, **then** 1-field patches in place and 2-field full-rerenders.
- **Given** the phase diff, **when** audited, **then** one new `src/data/` module and three logical call sites; CSS + Embedded + toolbar are siblings.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Children 001–004 | Nothing to prove | Do not start until nest + persist + picker exist |
| Risk | Treating computed-drop warn as fail | False failure vs locked design | Allow one `console.warn`; fail only on throws |
| Risk | Extending patch "to make 2-field feel native" | Nested DOM assumptions break | REQ-005 documents the fallback |
| Risk | Enabling nested DnD during proofs | iCloud write contract | REQ-008; depth > 0 has no drop target |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: 5k×2 is O(N·D) Map passes with no memo (`QueryEngine.ts:140-148`); proofs must not add memoization or extra note I/O.

### Security
- **NFR-S01**: No secrets, no network, no `fetch` in `MultiFieldGrouping.ts`.

### Reliability
- **NFR-R01**: Grouping is display-only; hide/show only `scheduleConfigSave` view definition (`DatabaseView.ts:9850-9856`).

### Mobile
- **NFR-M01**: ≤360px; no desktop-only APIs; no new media queries; `tableMinWidth` per header (`TableRenderer.ts:112`); toggles stay 20×20.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Null / missing → `t("common.uncategorized")` (`QueryEngine.ts:279`); distinct nodes per depth.
- Empty groups via `withEmptyOptionGroups` (`GroupVisibility.ts:52-60`); multi-select default hidden (`:20`).
- Empty DB → `db-empty` (`TableRenderer.ts:92-98`).
- Filter-before-group: `this.rows` already filtered at `DatabaseView.ts:6313`.

### Error Scenarios
- Mixed types stringify + trim + dedupe (`QueryEngine.ts:276-280`); no throw.
- Checkbox `"true"`/`"false"` (`:261`); date modes per-field.
- Multi-select fan-out (`:143-147`); counts non-exclusive.
- Computed leftover: planned `console.warn`, never write.

### Concurrent Operations
- Hide/show only saves view definition per-file.
- 2-field external edits full-rerender; 1-field still patches.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 8/25 | Proofs only; no new code surface |
| Risk | 9/25 | Persist miss, hide-subtree, iCloud write, patch fallback |
| Research | 6/20 | Locked by `research/final-plan.md` step 7 |
| **Total** | **23/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking. Locked defaults: allow computed-drop warning; do not extend `patchGroupedRows`; nested DnD stays out; sticky only at depth 0 already locked in child 002.
<!-- /ANCHOR:questions -->
