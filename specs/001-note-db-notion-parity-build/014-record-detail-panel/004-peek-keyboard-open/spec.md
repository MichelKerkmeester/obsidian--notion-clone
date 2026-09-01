---
title: "Feature Specification: Peek Keyboard Open"
description: "Handle Mod+Enter on a focused grid cell in DatabaseView.handleDatabaseKeydown before the bare-Enter inline-edit branch so the peek opens without stealing Enter."
trigger_phrases:
  - "peek keyboard"
  - "mod enter peek"
  - "handleDatabaseKeydown"
  - "inline edit enter"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/014-record-detail-panel/004-peek-keyboard-open"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored peek-keyboard child from synthesis rank 7 and final-plan step 6"
    next_safe_action: "Add Mod+Enter in handleDatabaseKeydown before editAtCellSelection"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-peek-keyboard-open"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Peek Keyboard Open

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `014-record-detail-panel` |
| **Parent Spec** | ../spec.md |
| **Phase** | 4 of 5 |
| **Predecessor** | 003-title-open-affordance |
| **Successor** | 005-peek-display-proof |
| **Handoff Criteria** | Mod+Enter opens peek; bare Enter still edits |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 4 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `003-title-open-affordance` · Successor: `005-peek-display-proof`. This child is `research/final-plan.md` step 6 / synthesis rank 7. Esc close already lives in `TableRecordPeek.ts` (document capture). Do **not** push an Obsidian `Scope` here (`DatabaseView.ts:1202-1213` already owns Escape for inline edit).
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Spec §8 requires a keyboard path beside hover. Bare Enter is already inline edit (`DatabaseView.ts:1523-1526`); F2 is also edit (`:1523-1531`). OPEN is a real button so Space/Enter can activate it when focused, but the button uses `tabindex="-1"` (same rule as the icon gutter, `TableRenderer.ts:491-493`) so it is not an extra Tab stop. Keyboard users therefore need **Mod+Enter** on a focused grid cell. The existing `mod = event.metaKey || event.ctrlKey` is already computed at `:1441`.

### Purpose
In `handleDatabaseKeydown` (~1523): if `mod && event.key === "Enter"` and a cell is focused, `preventDefault`, open the peek for that row, return. This branch must precede `editAtCellSelection()`. Bare Enter / F2 unchanged. Focus return on Esc stays the module's `returnFocus` to `td[data-note-database-row-path][data-note-database-column-key][tabindex="0"]` (`DatabaseView.ts:4197`).
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- One hunk in `DatabaseView.handleDatabaseKeydown` (~1523-1526): Mod+Enter opens `openTableRecordPeek` for the focused row and returns before the Enter-to-edit branch.
- Reuse the same `mod` already at `:1441`.
- Reuse peek open args already used by child 003's `renderCell` attach (same row, config, columns, container, `returnFocus`).

### Out of Scope
- Pushing a second `Scope` for Esc.
- Changing bare Enter / F2 inline edit.
- Creating the module, CSS, or `renderCell` attach (children 001–003).
- Stealing Space on the grid (OPEN is a real button when hovered/tapped).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/DatabaseView.ts` | Edit | `handleDatabaseKeydown` ~1523: Mod+Enter before `editAtCellSelection()` |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Mod+Enter opens the peek | Focused grid cell + `metaKey \|\| ctrlKey` + Enter opens the peek for that row and returns (`DatabaseView.ts:1523-1526`) |
| REQ-002 | Bare Enter stays inline edit | The Mod+Enter branch precedes `editAtCellSelection()`; Enter / F2 still edit (`:1523-1531`) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-003 | Esc is not re-implemented here | No pushed `Scope`; module document capture from child 001 remains the close path (`RecordDetailPanel.ts:128-147` pattern) |
| REQ-004 | Roving tabindex is unchanged | OPEN keeps `tabindex="-1"` (`TableRenderer.ts:491-493` rule); keyboard users use hover/tap or Mod+Enter |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Mod+Enter opens the peek on the focused row.
- **SC-002**: Enter still starts inline edit.
- **SC-003**: Esc while open still closes the peek first via the module's document capture, then `returnFocus` restores the roving cell (`:4197`).

### Acceptance Scenarios

- **Given** a focused table cell, **when** the user presses Mod+Enter, **then** the peek opens and the cell is not edited.
- **Given** a focused table cell, **when** the user presses Enter, **then** inline edit still starts (`:1523-1526`).
- **Given** the peek is open, **when** the user presses Esc, **then** the panel closes (module capture) and focus returns to the roving `td`.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Handling bare Enter | Breaks inline edit | Only `mod && Enter`; branch before `editAtCellSelection()` |
| Risk | Pushing a Scope here | Fights `:1202-1213` | Esc stays in the module |
| Dependency | Child `003-title-open-affordance` | Peek open helper may not be imported yet | Land after hunk A; reuse the same `openTableRecordPeek` call shape |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking. Locked default: visible button plus Mod+Enter; do not steal bare Enter.
<!-- /ANCHOR:questions -->
