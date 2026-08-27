---
title: "Tasks: Files Type Registry"
description: "Ordered tasks to register files across union, labels, icon, pickers, three i18n dictionaries, and files-to-multitext mapping."
trigger_phrases:
  - "files type registry tasks"
  - "column type files"
  - "property type icon"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/012-files-column/002-files-type-registry"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored files type-registry child from synthesis ranks 2,3,10,12 and final-plan step 3"
    next_safe_action: "Add files to the union, labels, icon, pickers, i18n, and conflict map"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-files-type-registry"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Files Type Registry

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

T002–T006 are one completeness slice. Do not ship the union without the icon Record and pickers.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read registry + companions: `src/data/types.ts:50`, `src/data/ColumnTypes.ts:108-138,172-177`, `src/views/PropertyTypeIcon.ts:7-20,111,128-129`, `src/views/ColumnMenu.ts:261-264`, `src/views/modals/CreatePropertyModal.ts:26-30`, `src/i18n.ts:1332,4361-4366,4386-4388`, `src/data/PropertyTypeConflict.ts:54-77` [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 Add `"files"` to `ColumnDef["type"]` (`src/data/types.ts:50`); `files: t("columnType.files")` in `COLUMN_TYPE_LABELS`, `"files"` in `isColumnType`, `getDefaultCellValue` → `[]` (`src/data/ColumnTypes.ts:108-138,172-177`) [S]
- [ ] T003 Add `files` to `PROPERTY_TYPE_ICON_NAMES` (`src/views/PropertyTypeIcon.ts:7-20`). Icon name must resolve in `PROPERTY_TYPE_ICON_DEFS` — reuse `link` (`:111`) or add a small `file` def — or fallback is `letter-case` (`:128-129`) [S]
- [ ] T004 Add `"files"` to the advanced group (`src/views/ColumnMenu.ts:261-264`) and `PROPERTY_TYPES` (`src/views/modals/CreatePropertyModal.ts:26-30`). Skip `BaseImportConfirmModal.TYPES` (`:34-36`) [S]
- [ ] T005 Add `columnType.files` in en / zh-CN / zh-TW next to `columnType.rollup` (`src/i18n.ts` `en:1332`, `zh-CN:2804`, zh-TW sibling). Three dictionaries only (`:4361-4366`) [S]
- [ ] T006 Add `case "files": return "multitext"` next to relation (`src/data/PropertyTypeConflict.ts:73-76`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T007 `npx tsc --noEmit` passes after this slice even before chips render [S]
- [ ] T008 Add-column and change-type lists show a localized Files label [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T002–T006 shipped together
- [ ] `tsc` passes
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 2, 3, 10, 12
- **Parent final-plan**: `../research/final-plan.md` step 3
<!-- /ANCHOR:cross-refs -->
