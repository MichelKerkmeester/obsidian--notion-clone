---
title: "Feature Specification: Column Menu Scheme Picker"
description: "Add a column-menu picker for https, mailto, tel, or none, plus setTextLinkScheme beside setTextRenderMode, so users are not forced to hand-edit schema JSON."
trigger_phrases:
  - "column menu scheme picker"
  - "setTextLinkScheme"
  - "textLinkScheme menu"
  - "display popover scheme"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/006-link-scheme-fields/003-column-menu-scheme-picker"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored menu-picker child from synthesis rank 4 and final-plan T012"
    next_safe_action: "Implement ColumnMenu picker and setTextLinkScheme after the table same-diff child"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-column-menu-scheme-picker"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Column Menu Scheme Picker

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `006-link-scheme-fields` |
| **Parent Spec** | ../spec.md |
| **Phase** | 3 of 4 |
| **Predecessor** | 002-layout-scheme-honor |
| **Successor** | 004-scheme-column-width |
| **Handoff Criteria** | Display popover can set `textLinkScheme`; setter sits beside `setTextRenderMode` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 3 of 4** — Parent: [`../spec.md`](../spec.md) · Predecessor: `002-layout-scheme-honor` · Successor: `004-scheme-column-width`. Synthesis rank 4; final-plan T012. Depends on child 001's `ColumnDef` field. Does not require child 002 at compile time (menu can ship against table-only rendering). This is the REQ-005 tension child: a 4th/5th file vs the 1–3 call-site budget, which is why it is not in the table same-diff.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion users pick URL / Email / Phone in the property-type menu. The fork already has a text “display” popover (`plain` / `link` / `markdown`) at `ColumnMenu.ts:393-418` but no way to set `textLinkScheme` without hand-editing view config. Child 001 leaves power users on raw JSON.

### Purpose
Nest scheme choices (`https` | `mailto` | `tel` | none) under the existing display popover and add `setTextLinkScheme` beside `setTextRenderMode` (`DatabaseView.ts:5096-5100`) so the optional field is set the same way `textRenderMode` already saves.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Column-menu UI at `src/views/ColumnMenu.ts:133-150,393-418` to pick `https` | `mailto` | `tel` | none (clear / omit the field).
- `setTextLinkScheme` beside `setTextRenderMode` at `DatabaseView.ts:5096-5100` (same config-save churn profile).
- Picker only on text columns; ignore / hide on non-text types (they never hit `CellRenderer` `default:`).
- Clearing the picker removes the hint (plain text), matching REQ-001 absent-field behavior.

### Out of Scope
- Assemble / CellRenderer / layout honor (children 001–002).
- ColumnWidth (child 004).
- Extending `textRenderMode` with `"https"|"mailto"|"tel"` (breaks every switch on that union).
- Auto-detect, Copy / Visit, confirm sheet.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/ColumnMenu.ts` | Edit | Scheme choices under the existing display popover (`:133-150,393-418`) |
| `src/views/DatabaseView.ts` | Edit | `setTextLinkScheme` beside `setTextRenderMode` (`:5096-5100`) |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Menu can set the three allowed schemes | Choosing https / mailto / tel writes `textLinkScheme` on the text `ColumnDef` |
| REQ-002 | None / clear omits the hint | Absent field after clear; table path renders plain text |
| REQ-003 | Save path matches `textRenderMode` | `setTextLinkScheme` lives beside `setTextRenderMode` (`DatabaseView.ts:5096-5100`); same `ColumnDef` JSON round-trip |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Text-only surface | Picker is not offered (or is ignored) on non-text columns |
| REQ-005 | Do not widen `textRenderMode` | Display popover still uses `plain` / `link` / `markdown`; scheme is a sibling field |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A user can set `textLinkScheme: "mailto"` from the column menu without editing JSON.
- **SC-002**: Clearing the picker restores today's plain-text render.
- **SC-003**: `textRenderMode` union and `types.ts:50` stay unchanged.

### Acceptance Scenarios

- **Given** a text column, **when** the user picks Email in the display popover, **then** the saved `ColumnDef` has `textLinkScheme: "mailto"` and cells assemble `mailto:` hrefs.
- **Given** that column, **when** the user picks none, **then** `textLinkScheme` is absent and cells are plain text.
- **Given** a number column, **when** the column menu opens, **then** the scheme picker is not offered.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Child `001-text-link-scheme-module` | No `textLinkScheme` field to set | Wait for the table same-diff |
| Risk | Folding schemes into `textRenderMode` | Breaks every switch, i18n key, and width measurer on that union | Sibling field only |
| Risk | Extra files vs REQ-005 | 4th/5th file vs 1–3 call-site budget | Own child; do not merge into 001 |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking. Locked default from parent research: nested under the existing display popover, not a new property type. Approve this child when discoverability is a launch requirement; table v1 can ship on JSON alone.
<!-- /ANCHOR:questions -->
