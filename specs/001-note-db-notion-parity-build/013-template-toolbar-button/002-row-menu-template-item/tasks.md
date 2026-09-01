---
title: "Tasks: Row Menu Template Item"
description: "Ordered tasks for the RowMenu New-from-template item and DatabaseView getDatabaseConfig wiring."
trigger_phrases:
  - "row menu template tasks"
  - "getDatabaseConfig"
  - "hasRecordTemplate menu"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Row Menu Template Item

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

T002–T003 are **one shippable slice** (call sites 2 and 3). Do not ship the menu item without `getDatabaseConfig`.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child 1 landed `TemplateToolbarAction.ts` plus `menu.newFromTemplate`. Re-read `RowMenu.ts:6, 54-75` and `DatabaseView.ts:555-567, 783-786, 794-796` (fork files: read-only until T002) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 **Call site 2 — `src/views/RowMenu.ts`**: import module plus `DatabaseConfig`; add `getDatabaseConfig?: () => DatabaseConfig | undefined`. After the insert separator (`:75`), inside `!isReadOnly` and `viewType !== "calendar" && viewType !== "timeline"` (`:54-58`), add the item **only if** `hasRecordTemplate(getDatabaseConfig?.())`. Icon `file-plus-2`, title `getNewFromTemplateLabel`, tooltip path. `onClick` = `void executeNewFromTemplate({ config, confirmEnabled: false, confirm: async () => true, createEntry: () => this.actions.createEntry?.() })` with no extra `createEntry` after and no insert `position` (`src/views/RowMenu.ts:54-75`) [S]
- [ ] T003 **Call site 3 — `src/views/DatabaseView.ts`**: same slice as T002. RowMenu ctor `:555-567` add `getDatabaseConfig: () => this.getActiveDb()` (`getActiveDb` at `:783-786`). Do not use `getConfig()` (`:794-796`). No new import. Do not touch toolbar actions at `:1902`. Do not touch `RecordTemplate.ts`, `CreateEntryPlan.ts`, `ViewConfigPanelRenderer.ts` (`src/views/DatabaseView.ts:555-567`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T004 Item present on table/board/gallery/list with a template; absent with zero templates, on calendar/timeline, and when read-only. Click creates one row via the existing `guardedCreateEntry` (`DatabaseView.ts:563, 845-850`). Host does not call `createEntry` afterwards (`src/views/RowMenu.ts`, `src/views/DatabaseView.ts`) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T002–T003 shipped together
- [ ] Manual verification of T004 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 2
- **Parent final-plan**: `../research/final-plan.md` steps 5–6
<!-- /ANCHOR:cross-refs -->
