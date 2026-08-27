---
title: "Feature Specification: Embedded Table Grouping"
description: "Honor groupByFields in embedded/linked table views: same tree plus flatten as DatabaseView, plus copy-back beside groupByField so a settings save does not strip the array."
trigger_phrases:
  - "embedded table grouping"
  - "groupbyfields copy-back"
  - "embedded grouped dispatch"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/011-table-multi-group/003-embedded-table-grouping"
    last_updated_at: "2026-08-25T20:50:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored embedded grouping child from synthesis and final-plan"
    next_safe_action: "Wire EmbeddedDatabaseRenderer grouped dispatch and copy-back"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-embedded-table-grouping"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Embedded Table Grouping

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-25 |
| **Branch** | `011-table-multi-group` |
| **Parent Spec** | ../spec.md |
| **Phase** | 3 of 5 |
| **Predecessor** | 002-grouped-table-flatten |
| **Successor** | 004-table-subgroup-picker |
| **Handoff Criteria** | Embedded 2-field table matches top-level; embed settings save does not strip `groupByFields` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 3 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `002-grouped-table-flatten` · Successor: `004-table-subgroup-picker`. This child owns `research/final-plan.md` step 5 (synthesis rank 6). Parse in child 001 is still the load-bearing load path (`Object.assign` at `EmbeddedDatabaseRenderer.ts:3364-3365` only copies keys already on `this.config`).
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Spec §8 requires identical nested headers in linked/embedded views. The embed grouped table branch (`EmbeddedDatabaseRenderer.ts:1012-1016`) still follows the one-field path. Copy-back writes `groupByField` at `:3353` and will drop `groupByFields` on the next embed settings save unless the sibling assignment exists. Gallery/list at `:973-986` and timeline `:1005-1007` must stay single-field.

### Purpose
Use the same `effectiveGroupFields` + tree + flatten as `DatabaseView` on the embed table grouped branch, and add `origView.groupByFields = this.config.groupByFields` beside `:3353` so a settings save does not strip the array.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Table grouped branch (`EmbeddedDatabaseRenderer.ts:1012-1016`) uses `effectiveGroupFields` + `buildGroupTree` + `flattenGroupTree` like `DatabaseView.ts:9539-9545`.
- Add `origView.groupByFields = this.config.groupByFields` beside `:3353`. `Object.assign` at `:3364-3365` already copies own keys; parse (`DataSource.ts:885`) remains the load path.
- Do not change gallery/list at `:973-986` or timeline `:1005-1007`.

### Out of Scope
- Module / persist (child 001); top-level table loop (child 002); toolbar picker (child 004).
- Gallery/list/timeline multi-field grouping; ViewStateStore; nested DnD.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/EmbeddedDatabaseRenderer.ts` | Edit | Table grouped branch `:1012-1016`; copy-back beside `:3353` |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Embedded table grouped dispatch matches top-level | `:1012-1016` uses `effectiveGroupFields` + tree + flatten; 2-field embed nests like the top-level table |
| REQ-002 | Copy-back preserves `groupByFields` | `origView.groupByFields = this.config.groupByFields` beside `:3353`; an embed settings save does not strip the array |
| REQ-003 | Non-table embed layouts stay single-field | Gallery/list `:973-986` and timeline `:1005-1007` unchanged |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Parse remains the load path | Do not replace DataSource parse; `Object.assign` `:3364-3365` only copies keys already on `this.config` |
| REQ-005 | Display-only | No new vault write path; grouping still does not mutate note bodies |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Embedded 2-field table matches top-level nested headers.
- **SC-002**: Embed settings save keeps `groupByFields`.
- **SC-003**: Gallery/list/timeline embeds still group on one field.

### Acceptance Scenarios

- **Given** an embedded table with `groupByFields: [Category, Type]`, **when** it renders, **then** nested headers match the top-level view.
- **Given** that embed, **when** settings save runs, **then** `groupByFields` is still present (`:3353` sibling + parse `:885`).
- **Given** an embedded gallery with the same config blob, **when** it renders, **then** it still uses `vs().groupByField` (`:973-986`).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Children 001 and 002 | No module or flatten loop to reuse | Wait for persist + table loop |
| Risk | Copy-back omits `groupByFields` | Next embed save deletes the array | Sibling assignment at `:3353` |
| Risk | Editing gallery/list embed dispatch | Multi-field leaks off table | REQ-003 leave `:973-986` / `:1005-1007` |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking. Locked default: CSS and Embedded stay additive siblings of the settings site (REQ-005 parent reading); do not open ViewStateStore.
<!-- /ANCHOR:questions -->
