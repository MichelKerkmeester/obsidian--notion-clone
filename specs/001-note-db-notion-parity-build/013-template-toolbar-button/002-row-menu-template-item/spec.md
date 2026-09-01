---
title: "Feature Specification: Row Menu Template Item"
description: "Add a New-from-template row-menu item only when a template is configured, and wire DatabaseView.getActiveDb into RowMenu via getDatabaseConfig."
trigger_phrases:
  - "row menu template item"
  - "new from template menu"
  - "getDatabaseConfig row menu"
  - "hasRecordTemplate menu"
  - "insert separator template"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/013-template-toolbar-button/002-row-menu-template-item"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored row-menu-template-item child from synthesis rank 2 and final-plan steps 5-6"
    next_safe_action: "Add the RowMenu item and DatabaseView getDatabaseConfig wiring"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-row-menu-template-item"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Row Menu Template Item

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P2 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `013-template-toolbar-button` |
| **Parent Spec** | ../spec.md |
| **Phase** | 2 of 3 |
| **Predecessor** | 001-adaptive-toolbar-control |
| **Successor** | 003-create-path-proof |
| **Handoff Criteria** | Item shown only when `hasRecordTemplate`; DatabaseView wires `getActiveDb`; module is the only row-menu `createEntry` caller |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 2 of 3** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-adaptive-toolbar-control` · Successor: `003-create-path-proof`. Synthesis rank 2 and final-plan steps 5–6 (call sites 2 and 3). Reuse child 1's module and `menu.newFromTemplate`. Do not show a blank **New** next to insert above/below when no template is set.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion exposes templates from the New control. `RowMenu.show` has Open / Insert above / Insert below / icon / Duplicate / Delete and no template action (`src/views/RowMenu.ts:36-120`). That host is distinct from the toolbar (`src/views/DatabaseView.ts:555-567`). A no-arg `createEntry?.()` beside insert above/below (`:58-74`) would duplicate a worse create when no template is configured.

### Purpose
Add a **New from template** item after the insert separator (`RowMenu.ts:75`) only when `hasRecordTemplate(getDatabaseConfig?.())`, inside the existing `!isReadOnly` and `viewType !== "calendar" && viewType !== "timeline"` guards (`:54-58`). Wire `getDatabaseConfig: () => this.getActiveDb()` on the RowMenu ctor (`DatabaseView.ts:555-567`, `getActiveDb` at `:783-786`). The module is the only `createEntry` caller.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Call site 2: `src/views/RowMenu.ts`. Import `TemplateToolbarAction` plus `DatabaseConfig`. Add `getDatabaseConfig?: () => DatabaseConfig | undefined`. After the insert separator (`:75`), inside `!isReadOnly` and `viewType !== "calendar" && viewType !== "timeline"` (`:54-58`), add the item **only if** `hasRecordTemplate(getDatabaseConfig?.())`. Icon `file-plus-2`, title `getNewFromTemplateLabel`, tooltip path. `onClick` is only `void executeNewFromTemplate({ config, confirmEnabled: false, confirm: async () => true, createEntry: () => this.actions.createEntry?.() })` with no extra `createEntry` after. Do not pass insert `position` (this is not insert-above/below). Reuse existing `confirmWithModal` import (`:6`) only if REQ-004 later ships; this child does not enable confirm.
- Call site 3: `src/views/DatabaseView.ts` RowMenu ctor (`:555-567`). Add `getDatabaseConfig: () => this.getActiveDb()`. `newRecordTemplate` lives on `DatabaseConfig` (`types.ts:279`), not on `ViewConfig` (`getConfig()` at `:794-796`). No new import. Do not touch toolbar actions at `:1902`.

### Out of Scope
- Creating `TemplateToolbarAction.ts` or i18n keys (child `001-adaptive-toolbar-control`).
- REQ-004 confirm on toolbar or row-menu (`confirmNewFromTemplate` / `confirmCreate`).
- Toolbar label, phone-density, or `ToolbarRenderer.ts` edits.
- Recurrence (stays on duplicate-row, `RowMenu.ts:89-92`). Split-button / multi-template / `ViewConfigPanelRenderer.ts`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/RowMenu.ts` | Modify | Call site 2: `getDatabaseConfig?`; item after `:75` only when `hasRecordTemplate`; module-only onclick |
| `src/views/DatabaseView.ts` | Modify | Call site 3: RowMenu ctor `:555-567` wires `getDatabaseConfig: () => this.getActiveDb()` (`:783-786`) |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Row-menu item only when a template is configured | Item present on table/board/gallery/list with `hasRecordTemplate`; absent with zero templates, on calendar/timeline, and when read-only (`RowMenu.ts:54-75`) |
| REQ-002 | Module is the only `createEntry` caller | `onClick` is only `void executeNewFromTemplate({ ..., createEntry: () => this.actions.createEntry?.() })`. No extra `createEntry` after. Do not pass insert `position`. |
| REQ-003 | DatabaseView wires the active database, not the view config | `getDatabaseConfig: () => this.getActiveDb()` (`:783-786`). `newRecordTemplate` is on `DatabaseConfig` (`types.ts:279`), not `ViewConfig` (`:794-796`). |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Same isolated module as the toolbar | Import child 1's `TemplateToolbarAction` and `menu.newFromTemplate` / `getNewFromTemplateLabel`. Do not fork a second label helper. |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Opening the row menu on a non-calendar, non-timeline, non-read-only view with a template shows **New from template** after the insert separator.
- **SC-002**: The same menu with zero templates has no template item; insert above/below still create with positional `createEntry(defaults, position)`.
- **SC-003**: The item calls `executeNewFromTemplate` once; the host does not call `createEntry` afterwards.
- **SC-004**: Diff adds two view hosts only; no second `src/data/` module.

### Acceptance Scenarios

- **Given** a table view with a record template, **when** the row menu opens, **then** **New from template** is present after the insert separator and uses icon `file-plus-2`.
- **Given** the same view with no template, **when** the row menu opens, **then** the item is absent.
- **Given** a calendar or timeline view, **when** the row menu opens, **then** the item is absent (`RowMenu.ts:58`).
- **Given** a click on the item, **when** `executeNewFromTemplate` runs, **then** `this.actions.createEntry?.()` is invoked exactly once by the module with no insert `position`.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Child 1 module plus `menu.newFromTemplate` | Item has no label/helper | Do not start until T002–T004 of child 1 exist |
| Risk | Showing adaptive **New** with zero templates | Worse duplicate of insert above/below | Hide unless `hasRecordTemplate` (final-plan default) |
| Risk | Wiring `getConfig()` instead of `getActiveDb()` | Template path lives on `DatabaseConfig`, not `ViewConfig` | `getActiveDb` at `DatabaseView.ts:783-786` |
| Risk | Passing insert `position` | Creates above/below instead of a new row | No-arg `createEntry?.()` through the module |
| Risk | Host calls `createEntry` after the module | Two notes per click | Same single-caller rule as the toolbar |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults from parent research: hide the row-menu item when no template is set; confirm stays deferred; recurrence stays on duplicate-row (`RowMenu.ts:89-92`).
<!-- /ANCHOR:questions -->
