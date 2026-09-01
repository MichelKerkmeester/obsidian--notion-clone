---
title: "Tasks: Table Record Peek Module"
description: "Tasks to read the live calendar panel, create src/views/TableRecordPeek.ts, and add panel.* i18n keys. No DatabaseView or styles.css hunks."
trigger_phrases:
  - "table record peek tasks"
  - "TableRecordPeek"
  - "panel i18n"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/014-record-detail-panel/001-table-record-peek-module"
    last_updated_at: "2026-08-27T12:27:53Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Table Record Peek Module

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

T003–T004 are **one atomic diff**. Do not ship `TableRecordPeek.ts` with hard-coded English.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read parent `research/synthesis.md` ranks 2, 3, 8 and `research/final-plan.md` steps 1–3 (calendar collision, sibling module, i18n) [15m]
- [ ] T002 Read live `src/views/RecordDetailPanel.ts:23-218` (class `db-record-detail-panel`, `positionToolbarPopover`, no scroll dismiss, `editCell` `:257-263`, `openRow` `:179-183`) and hosts `DatabaseView.ts:143, 834, 864, 10418-10440, 10483-10488`; confirm export names at `:84-104` are taken. Also confirm `CellRenderer.ts:117-129`, `ColumnConfig.ts:64, 77-101`, `HoverLinkPreview.ts:8-17`, `EuroFormat.ts:1-42` [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Create `src/views/TableRecordPeek.ts`** — singleton `closed → open(rowPath) → closed`; exports `attachTitleOpenAffordance(td, row, deps)`, `openTableRecordPeek({ anchor, row, config, visibleColumns, allColumns, container, returnFocus, renderRecordIcon })`, `closeTableRecordPeek()`, `syncTableRecordPeek(rows)`. Button `class="db-record-open-btn"` `tabindex="-1"` as sibling of title `<a>`; `preventDefault` + `stopPropagation`; no `data-note-database-hover-link` (`HoverLinkPreview.ts:8-17`). Panel `role="dialog"` `aria-modal="false"` class `db-record-peek-panel`. Header: injected `renderRecordIcon` + `row.file.basename`. Properties: `getColumnValue` (`ColumnDisplay.ts:63`) + `stringifyValue` (`Stringify.ts:1`), skip `file.name`. Hidden: `allColumns` minus visible, skip `file.name`, omit empty readonly/derived, hide reveal when empty, CSS class-toggle in-memory only. Zero properties: `t("panel.noProperties")`. Esc/outside-click delayed document capture (copy `RecordDetailPanel.ts:128-147, 207-209`); container `scroll`/`resize` dismiss; `returnFocus` on close. No `DataSource` import; never call `DatabaseView.openRow` (`:7545-7548`) or calendar `openRecordDetailPanel` (`src/views/TableRecordPeek.ts`) [M]
- [ ] T004 **i18n data** — same diff as T003: `panel.open`, `panel.noProperties`, `panel.hiddenProperties` × en / zh-CN / zh-TW (`src/i18n.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Grep `src/views/TableRecordPeek.ts` for `DataSource` / `mutateFrontmatter` / `openNote` / `editCell` — all empty; confirm `src/views/RecordDetailPanel.ts` is unmodified [S]
- [ ] T006 Confirm calendar exports at `RecordDetailPanel.ts:84-104` still present; peek UI strings go through `t("panel.*")` [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T004 shipped as one diff
- [ ] T005–T006 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 2, 3, 8
- **Parent final-plan**: `../research/final-plan.md` steps 1–3
<!-- /ANCHOR:cross-refs -->
