---
title: "Implementation Plan: Files Type Registry"
description: "Insertion-only plan to register files across union, labels, icon Record, hardcoded pickers, three i18n dictionaries, and files-to-multitext mapping."
trigger_phrases:
  - "files type registry plan"
  - "column type files"
  - "property type icon"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/012-files-column/002-files-type-registry"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Files Type Registry

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Column registry + picker lists + i18n dictionaries |
| **Storage** | None — type registration only; default cell value `[]` |
| **Testing** | `npx tsc --noEmit`; visual picker check |

### Overview
One completeness slice so `"files"` compiles, appears in add/change lists, has a glyph, and maps to Obsidian `multitext`. Count `types.ts` + `ColumnTypes.ts` + later `CellRenderer.ts` as the three named sites; these companions stay insertion-only.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 2, 3, 10, 12 and final-plan step 3 read.
- [x] Locked: do not skip icon or pickers; three dictionaries not four; skip import-modal TYPES.

### Definition of Done
- [ ] Union, labels, `isColumnType`, default `[]`, icon, two pickers, three keys, conflict case all land.
- [ ] `npx tsc --noEmit` passes before chips render.
- [ ] Add-column shows a localized Files label.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Insertion-only companions on the EuroFormat rebase profile. No new module in this child.

### Key Components
- **Type surface**: `types.ts:50` + `ColumnTypes.ts:108-138,172-177`.
- **UI surface**: icon Record + two hardcoded lists.
- **Locale / conflict**: three `columnType.files` keys; `files` → `multitext`.

### Data Flow
Once registered, `getColumnDisplayType` returns `"files"` with no edit (`ColumnDisplay.ts:14-26`). Child 003 then switches on that display type.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producers: union + labels + icon + pickers + i18n + conflict. Consumer later: `CellRenderer.ts` display switch. Algorithm invariant: icon name must exist in `PROPERTY_TYPE_ICON_DEFS` or the dropdown shows `letter-case` (`PropertyTypeIcon.ts:128-129`).
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read `types.ts:50`, `ColumnTypes.ts:108-138,172-177`, `PropertyTypeIcon.ts:7-20,111,128-129`, `ColumnMenu.ts:261-264`, `CreatePropertyModal.ts:26-30`, `i18n.ts:1332,4361-4366,4386-4388`, `PropertyTypeConflict.ts:54-77`.

### Phase 2: Core Implementation
- [ ] Union + labels + default `[]`.
- [ ] Icon + pickers + three i18n keys + conflict case.

### Phase 3: Verification
- [ ] `npx tsc --noEmit`.
- [ ] Add-column / change-type show localized Files.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None — insertion-only type lists | — |
| Integration | `npx tsc --noEmit` | TypeScript |
| Manual | Add-column and change-type lists | Obsidian fork |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 `FilesColumn.ts` | Internal | Required by order | Registry can compile without it; keep the locked order |
| `PROPERTY_TYPE_ICON_DEFS` | Internal | Green | Blank glyph if name missing |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: `tsc` fails, pickers hide Files, or icon is blank.
- **Procedure**: Revert the insertion-only sites as one unit. Do not leave the union widened without the icon Record entry.
<!-- /ANCHOR:rollback -->
