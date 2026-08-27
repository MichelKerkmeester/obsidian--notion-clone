---
title: "Feature Specification: Table Record Peek Module"
description: "Create src/views/TableRecordPeek.ts as a display-only sibling of the calendar RecordDetailPanel, with i18n panel.* keys, header/hidden groups, Esc capture, and scroll dismiss. No DatabaseView call sites yet."
trigger_phrases:
  - "table record peek"
  - "TableRecordPeek"
  - "record detail sibling"
  - "panel i18n"
  - "hidden property group"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/014-record-detail-panel/001-table-record-peek-module"
    last_updated_at: "2026-08-25T21:20:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored table-record-peek module child from synthesis ranks 2-3-8 and final-plan steps 1-3"
    next_safe_action: "Read live RecordDetailPanel.ts then create TableRecordPeek.ts plus i18n keys"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-table-record-peek-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Table Record Peek Module

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-25 |
| **Branch** | `014-record-detail-panel` |
| **Parent Spec** | ../spec.md |
| **Phase** | 1 of 5 |
| **Predecessor** | None |
| **Successor** | 002-peek-panel-css |
| **Handoff Criteria** | Module exports exist, i18n keys exist, no DataSource import, calendar panel untouched |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 5** — Parent: [`../spec.md`](../spec.md) · Successor: `002-peek-panel-css`. This child is `research/final-plan.md` steps 1–3 (read the live calendar panel, create the sibling module, add i18n). Do not wire `DatabaseView.ts` or `styles.css` here.

Coupled in this child: synthesis ranks 2 (side-peek), 3 (header + hidden groups), and 8 (empty state, hidden-toggle guard, panel scroll) plus i18n (final-plan step 3 — hard-coded `"OPEN"` breaks zh-CN/zh-TW). Do not create `src/data/RecordDetailPanel.ts`; export names `openRecordDetailPanel` / `closeRecordDetailPanel` are already taken (`RecordDetailPanel.ts:84-104`).
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The fork already hydrates records (`RowData` at `src/data/types.ts:113-119`) and stringifies values (`getColumnValue` at `ColumnDisplay.ts:63`; `stringifyValue` at `Stringify.ts:1`). What is missing is a table side-peek. Research named a new `src/data/RecordDetailPanel.ts`, but `src/views/RecordDetailPanel.ts` is already a ~450-line **editable** calendar/timeline overlay exporting `openRecordDetailPanel`, `closeRecordDetailPanel`, `refreshRecordDetailPanel`, `getOpenRecordDetailPath` (`:84-104`), imported by `DatabaseView.ts:143`. Reusing it would ship `editCell` write-back (`:257-263`), `openNote` navigation (`:179-183`), `positionToolbarPopover` geometry (`:198`), no scroll dismiss (`:210-211`), no hidden group, and truncated values. A second file with the same export names is a compile-time collision.

### Purpose
Create `src/views/TableRecordPeek.ts` as an isolated sibling: single-instance `closed → open(rowPath) → closed`, display-only, CSS-docked (no `PopoverPosition` / `positionToolbarPopover`), header + collapsible hidden groups, Esc/outside-click via delayed document capture (copy `RecordDetailPanel.ts:128-147, 207-209`), container `scroll`/`resize` dismiss, and i18n `panel.open` / `panel.noProperties` / `panel.hiddenProperties` × en / zh-CN / zh-TW. View callbacks are injected. Never import `DataSource` or call `DatabaseView.openRow` (`:7545-7548`).
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Read the live calendar panel first (`RecordDetailPanel.ts:23-218`) and confirm export names are taken (`:84-104`; hosts at `DatabaseView.ts:143, 834, 864, 10418-10440, 10483-10488`).
- New module `src/views/TableRecordPeek.ts` with exports `attachTitleOpenAffordance(td, row, deps)`, `openTableRecordPeek({ anchor, row, config, visibleColumns, allColumns, container, returnFocus, renderRecordIcon })`, `closeTableRecordPeek()`, `syncTableRecordPeek(rows)` (same-path rebuild or close).
- Affordance factory: `<button type="button" class="db-record-open-btn" tabindex="-1">` as a **sibling of** the title `<a>`, not inside it; `preventDefault` + `stopPropagation`; **no** `data-note-database-hover-link` (`HoverLinkPreview.ts:8-17`). Label via `t("panel.open")`.
- Panel: `role="dialog"`, `aria-modal="false"`, `aria-label` = basename, class `db-record-peek-panel`. Header: injected `renderRecordIcon` + `row.file.basename`. Visible rows: `getColumnValue` (`ColumnDisplay.ts:63`) + `stringifyValue` (`Stringify.ts:1`) over `visibleColumns`, skip `file.name`. Hidden group: `allColumns` minus that visible set, skip `file.name`, omit empty readonly/derived; CSS class-toggle in-memory only; hide the reveal control when the hidden list is empty. Zero properties: one muted `t("panel.noProperties")` row.
- Esc/outside-click via delayed document capture (copy `RecordDetailPanel.ts:128-147, 207-209`); container `scroll` and `resize` dismiss; `returnFocus` on close. Opening row B replaces row A. Do **not** push an Obsidian `Scope` (would fight `DatabaseView.ts:1202-1213`).
- i18n in `src/i18n.ts`: `panel.open`, `panel.noProperties`, `panel.hiddenProperties` × en / zh-CN / zh-TW.

### Out of Scope
- `DatabaseView.renderCell` / `handleDatabaseKeydown` / overlay lifecycle hunks (children `003-title-open-affordance` and `004-peek-keyboard-open`).
- `styles.css` append (child `002-peek-panel-css`).
- Reusing or editing `src/views/RecordDetailPanel.ts`.
- Creating `src/data/RecordDetailPanel.ts` or sharing calendar export names.
- `PopoverPosition` clamp/flip; Obsidian `Modal`; board/gallery hosts; body/markdown preview; Anytype `local` group; Anytype `Storage.setToggle`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/TableRecordPeek.ts` | Create | Display-only peek module; distinct exports; no `DataSource` import |
| `src/i18n.ts` | Edit | `panel.open`, `panel.noProperties`, `panel.hiddenProperties` × three locales |
| `src/views/RecordDetailPanel.ts` | Do not change | Read-only reference for Esc capture |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | New module is a sibling, not a name collision | `src/views/TableRecordPeek.ts` exists; exports are `attachTitleOpenAffordance`, `openTableRecordPeek`, `closeTableRecordPeek`, `syncTableRecordPeek`; `src/views/RecordDetailPanel.ts:84-104` is unchanged |
| REQ-002 | Module is display-only | Grep of `TableRecordPeek.ts` shows no `DataSource` / `mutateFrontmatter` / `openNote` / `editCell` / `openRow`; reads `row.frontmatter` / `row.computed` only |
| REQ-003 | Header + hidden groups match ColumnConfig math | Visible rows skip `file.name`; hidden = `allColumns` minus visible (host will pass `getColumnsInOrder` minus `getVisibleColumns` from `ColumnConfig.ts:64, 77-101`); empty readonly/derived hidden values omitted; reveal control hidden when that list is empty; zero properties render `t("panel.noProperties")` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Esc and dismiss do not push a second Scope | Document capture copies `RecordDetailPanel.ts:128-147, 207-209`; container `scroll`/`resize` dismiss; `returnFocus` restores the caller cell; opening another row replaces the current panel |
| REQ-005 | i18n covers all locales | `panel.open`, `panel.noProperties`, `panel.hiddenProperties` exist in `src/i18n.ts` for en / zh-CN / zh-TW; peek UI has no raw English in zh locales |
| REQ-006 | OPEN control is isolated from Page Preview | Button is a sibling of the title `<a>`; no `data-note-database-hover-link`; `tabindex="-1"`; click is `preventDefault` + `stopPropagation` (`HoverLinkPreview.ts:8-17`) |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `TableRecordPeek.ts` compiles beside the calendar module; calendar exports are unchanged.
- **SC-002**: Grep of the new file returns no `DataSource` / `mutateFrontmatter` / `openNote`.
- **SC-003**: Hidden-group math uses injected `visibleColumns` / `allColumns`; empty hidden list hides the reveal control; zero-property records show `t("panel.noProperties")`.
- **SC-004**: zh-CN / zh-TW keys exist; no hard-coded `"OPEN"`.

### Acceptance Scenarios

- **Given** the calendar panel already exports `openRecordDetailPanel`, **when** this child lands, **then** the new file uses distinct names and does not edit `RecordDetailPanel.ts`.
- **Given** a row with hidden non-empty properties, **when** the panel opens, **then** the hidden group can reveal them in-memory without a vault write.
- **Given** a row with no properties, **when** the panel opens, **then** one muted no-properties row renders.
- **Given** zh-CN locale, **when** the OPEN label renders, **then** it is not raw English.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Second `RecordDetailPanel.ts` / `openRecordDetailPanel` | Compile-time and runtime collision | New file `TableRecordPeek.ts` with distinct exports (final-plan optimization 1) |
| Risk | Reusing the calendar panel | Ships 015 `editCell` write-back and `openNote` | Sibling display-only; never call calendar `openRecordDetailPanel` |
| Risk | Pushing a second Obsidian `Scope` | Fights `DatabaseView.ts:1202-1213` Esc | Document capture, same pattern as `RecordDetailPanel.ts:136-147` |
| Risk | Hard-coded `"OPEN"` | zh-CN/zh-TW regression | Same-diff i18n keys in `src/i18n.ts` |
| Dependency | Live fork `src/views/RecordDetailPanel.ts` | Must remain the calendar overlay | Read-only this child |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking. Locked defaults from parent research: module lives under `src/views/` not `src/data/`; sibling peek not calendar reuse; CSS-docked side-peek (`aria-modal="false"`); dismiss-on-scroll; hidden-group toggle is in-memory CSS; empty readonly/derived hidden rows are omitted.
<!-- /ANCHOR:questions -->
