---
title: "Feature Specification: Files Type Registry"
description: "Register files as the 13th column type across the union, labels, icon map, add/change pickers, three i18n dictionaries, and files-to-multitext conflict mapping so tsc and REQ-001 pass."
trigger_phrases:
  - "files type registry"
  - "column type files"
  - "property type icon files"
  - "create property files"
  - "column type i18n"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/012-files-column/002-files-type-registry"
    last_updated_at: "2026-08-25T21:20:00Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Files Type Registry

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `012-files-column` |
| **Parent Spec** | ../spec.md |
| **Phase** | 2 of 5 |
| **Predecessor** | 001-files-column-module |
| **Successor** | 003-files-cell-dispatch |
| **Handoff Criteria** | Union, labels, icon, pickers, three i18n keys, and files-to-multitext land together; tsc passes before chips render |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 2 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-files-column-module` · Successor: `003-files-cell-dispatch`. Synthesis ranks 2, 3, 10, 12; final-plan step 3. Do not hold REQ-007 to three files: `PROPERTY_TYPE_ICON_NAMES` is `Record<ColumnDef["type"], string>` (`PropertyTypeIcon.ts:7-20`) so `tsc` fails without `files`, and pickers are hardcoded lists (`ColumnMenu.ts:261-264`, `CreatePropertyModal.ts:26-30`).
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The fork union is 12 types (`types.ts:50`). Adding `"files"` only there is not enough: `COLUMN_TYPE_LABELS` / `isColumnType` / `getDefaultCellValue` live in `ColumnTypes.ts:108-138,172-177`, the icon map is a `Record` that `tsc` exhausts, and add/change-type UIs do **not** read `COLUMN_TYPE_LABELS()`. Iteration 9’s “zero UI edits” claim does not hold. Missing i18n keys render the raw key (`i18n.ts:4386-4388`). Without `files` to `multitext`, `PropertyTypeConflict` default returns `null` (`:75-76`).

### Purpose
Register `"files"` as the 13th type across the union, labels, icon, advanced picker, create-property list, three dictionaries, and the conflict map so `npx tsc --noEmit` passes even before chips render and a user can add a Files column.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `src/data/types.ts:50` — add `"files"` to `ColumnDef["type"]`. `getColumnDisplayType` already returns `col.type` for non-computed columns (`ColumnDisplay.ts:14-26`).
- `src/data/ColumnTypes.ts:108-138,172-177` — `files: t("columnType.files")`, `"files"` in `isColumnType`, `getDefaultCellValue` → `[]` (multi-select at `:174`).
- `src/views/PropertyTypeIcon.ts:7-20` — `files` on `PROPERTY_TYPE_ICON_NAMES`. The name **must resolve in `PROPERTY_TYPE_ICON_DEFS`** — reuse `link` (`:111`) or add a small `file` def — or `getPropertyTypeIconDef` falls back to `letter-case` (`:128-129`).
- `src/views/ColumnMenu.ts:261-264` — add `"files"` to the advanced group beside computed/relation/rollup.
- `src/views/modals/CreatePropertyModal.ts:26-30` — add `"files"` to `PROPERTY_TYPES`. Skip `BaseImportConfirmModal.TYPES` (`:34-36` — import mapping, not add-column).
- `src/i18n.ts` — `columnType.files` in **three** dictionaries (en, zh-CN, zh-TW). `LocaleCode` is `system | en | zh-CN | zh-TW` (`i18n.ts:1`) but only three dictionaries exist (`:4361-4366`). Place keys next to `columnType.rollup` (`en:1332`, `zh-CN:2804`, zh-TW rollup sibling).
- `src/data/PropertyTypeConflict.ts:73-76` — `case "files": return "multitext"` next to relation.

### Out of Scope
- `FilesColumn.ts` algorithm (child 001).
- `CellRenderer.ts` dispatch (child 003).
- Cover wiring (child 004).
- A literal three-file diff. Companions stay insertion-only (synthesis Q1).
- `filesColumnLabel()` helper unless someone re-imposes a three-file cap (Q2 default: dictionary keys).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/types.ts` | Edit | Add `"files"` at `:50` |
| `src/data/ColumnTypes.ts` | Edit | Labels, `isColumnType`, default `[]` at `:108-138,172-177` |
| `src/views/PropertyTypeIcon.ts` | Edit | `PROPERTY_TYPE_ICON_NAMES.files` resolving in `PROPERTY_TYPE_ICON_DEFS` |
| `src/views/ColumnMenu.ts` | Edit | Advanced group `:261-264` |
| `src/views/modals/CreatePropertyModal.ts` | Edit | `PROPERTY_TYPES` `:26-30` |
| `src/i18n.ts` | Edit | `columnType.files` in en / zh-CN / zh-TW |
| `src/data/PropertyTypeConflict.ts` | Edit | `files` returns `"multitext"` at `:73-76` |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | `"files"` is a first-class union member | `types.ts:50` includes `"files"`; `isColumnType` accepts it; `COLUMN_TYPE_LABELS.files = t("columnType.files")`; default cell value is `[]` (`ColumnTypes.ts:172-177`) |
| REQ-002 | `tsc` does not fail on the icon Record | `PROPERTY_TYPE_ICON_NAMES` gains `files` with a name that exists in `PROPERTY_TYPE_ICON_DEFS` (`PropertyTypeIcon.ts:7-20,111,128-129`) |
| REQ-003 | Users can add a files column | `"files"` is in `ColumnMenu.ts:261-264` advanced group and `CreatePropertyModal.ts:26-30` `PROPERTY_TYPES` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Localized type label | `columnType.files` exists in en, zh-CN, and zh-TW next to `columnType.rollup` siblings; missing keys would render the raw key (`i18n.ts:4386-4388`) |
| REQ-005 | Obsidian treats the array as a list | `mapColumnTypeToObservablePropertyType` returns `"multitext"` for `"files"` (`PropertyTypeConflict.ts:73-74`) |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `npx tsc --noEmit` passes after this child even before chips render.
- **SC-002**: Add-column and change-type lists show a localized “Files” (or locale equivalent).
- **SC-003**: All edits are insertion-only; `BaseImportConfirmModal.TYPES` is skipped.

### Acceptance Scenarios

- **Given** the union includes `"files"` but the icon Record does not, **when** `tsc` runs, **then** it fails — this child must add the icon in the same slice.
- **Given** only `COLUMN_TYPE_LABELS` is updated, **when** the operator opens add-column, **then** `"files"` is still missing until `ColumnMenu.ts:264` and `PROPERTY_TYPES` gain it.
- **Given** no `files` conflict case, **when** Obsidian maps the type, **then** default returns `null` (`PropertyTypeConflict.ts:75-76`).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Literal three-file diff | `tsc` fails; type hidden from pickers | Include companions (synthesis Q1) |
| Risk | Icon name not in `PROPERTY_TYPE_ICON_DEFS` | Blank dropdown glyph (`:128-129`) | Reuse `link` (`:111`) or add a `file` def |
| Risk | Four-locale i18n claim | Only three dictionaries exist (`i18n.ts:4361-4366`) | Three keys, not four |
| Dependency | Child 001 `FilesColumn.ts` | Labels do not require the module at compile time, but the slice is ordered after 001 | Start after 001 exists |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: include tsc/UI insertions; three dictionary keys not `filesColumnLabel()`; `files` maps to `multitext`; skip `BaseImportConfirmModal.TYPES`.
<!-- /ANCHOR:questions -->
