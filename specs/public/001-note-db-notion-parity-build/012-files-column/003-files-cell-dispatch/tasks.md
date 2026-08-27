---
title: "Tasks: Files Cell Dispatch"
description: "Ordered tasks to wire CellRenderer case files, save normalize, and startEdit formatForEdit."
trigger_phrases:
  - "files cell dispatch tasks"
  - "cellrenderer files"
  - "startedit files"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/012-files-column/003-files-cell-dispatch"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored files CellRenderer dispatch child from synthesis ranks 4,9 and final-plan step 4"
    next_safe_action: "Add case files, save normalize, and startEdit formatForEdit in CellRenderer.ts"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-files-cell-dispatch"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Files Cell Dispatch

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

Render, save, and `startEdit` are **one** CellRenderer diff.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read `src/views/CellRenderer.ts` render switch (`:185`), `normalizeCellValueForSave` (`:2476-2482`), `isEditableCellColumn` (`:300-304`), `startEdit` (`:435-524`), and `is-inline-overlay` (`:1484-1528`) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 Add `case "files":` via `FilesColumn.renderChips` at `src/views/CellRenderer.ts:185` (empty `[]` already `isEmptyValue` → `db-empty-value` at `:2665-2667` + `:151-152`); wire `normalizeCellValueForSave` `col.type === "files"` at `:2476-2482` (only write gate); add `startEdit` branch before `:524` so `col.type === "files"` → `editText` with `formatForEdit`, commit `parseEdit` → `normalize`. Mobile uses `is-inline-overlay` (`:1484-1528`); no new `Platform` detection. Leave `FileFields.ts` / `FileFieldRenderer.ts` untouched (`src/views/CellRenderer.ts`) [M]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T003 Table: ≤5 chips + `+N`; click opens vault file; dangling `is-unresolved` click no-ops; empty `[]` is empty [S]
- [ ] T004 Typing `[[Sales.pdf]]` and `https://cdn.example/x.pdf` stores only the wikilink; one `processFrontMatter` per commit (`CellRenderer.ts:2458-2470`; `DataSource.ts:296-301`) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Render + save + edit landed together
- [ ] `FileFieldRenderer.ts` untouched
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 4, 9
- **Parent final-plan**: `../research/final-plan.md` step 4
<!-- /ANCHOR:cross-refs -->
