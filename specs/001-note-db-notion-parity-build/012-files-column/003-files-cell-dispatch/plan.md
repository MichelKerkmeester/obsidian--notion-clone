---
title: "Implementation Plan: Files Cell Dispatch"
description: "Plan to wire CellRenderer case files, save-time FilesColumn.normalize, and startEdit formatForEdit on the existing editText overlay."
trigger_phrases:
  - "files cell dispatch plan"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Files Cell Dispatch

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | `CellRenderer.ts` display switch + `editText` overlay |
| **Storage** | One `processFrontMatter` commit per save (`DataSource.ts:296-301`) |
| **Testing** | Manual table: chips, URL strip, overlay edit |

### Overview
Three edits in one file: render case, save gate, `startEdit` branch. EuroFormat import precedent: `EuroFormat.ts:1-42` imported once at `CellRenderer.ts:13`.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 4, 9 and final-plan step 4 read; T015 is not independent.
- [x] Children 001–002 exist (`FilesColumn.ts` + `"files"` type).

### Definition of Done
- [ ] `case "files"` paints chips; empty `[]` is empty.
- [ ] Save normalize strips URLs; one commit per save.
- [ ] `startEdit` uses `formatForEdit`; mobile overlay inherited.
- [ ] `FileFieldRenderer.ts` / `FileFields.ts` clean.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
One rebase-safe call-site file. Algorithm stays in `FilesColumn.ts`.

### Key Components
- **Display**: `displayType` switch `:185`.
- **Write gate**: `normalizeCellValueForSave` `:2476-2482`.
- **Edit**: `startEdit` `:449-524` → existing `editText` / `is-inline-overlay` `:1484-1528`.

### Data Flow
Render reads `row.frontmatter`. Edit serializes via `formatForEdit`. Commit: `parseEdit` → `normalize` → `saveValue` → `updateFrontmatter` → `processFrontMatter` (`:2458-2470`).
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: `FilesColumn.ts` (child 001). Consumer this child: `CellRenderer.ts` only. Algorithm invariant: no second write path; no new `Platform` detection; `file.*` renderer unchanged.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read `CellRenderer.ts:185, 2476-2482, 300-304, 435-524, 1484-1528`.

### Phase 2: Core Implementation
- [ ] Import FilesColumn; add `case "files"`; save gate; `startEdit` branch.

### Phase 3: Verification
- [ ] Chips, dangling, empty, URL strip, one commit, overlay on mobile chrome.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None — renderer wiring | — |
| Integration | Save → `processFrontMatter` | Obsidian fork |
| Manual | Table chips, edit round-trip, overlay | Desktop + phone layout |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 `FilesColumn.ts` | Internal | Required | No `renderChips` / `normalize` |
| Child 002 `"files"` type | Internal | Required | Switch never matches |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Arrays stringify, URLs persist, or `FileFieldRenderer.ts` was edited.
- **Procedure**: Revert the `CellRenderer.ts` insertions. Keep `FilesColumn.ts` if child 001 should remain.
<!-- /ANCHOR:rollback -->
