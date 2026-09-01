---
title: "Feature Specification: Files Cell Dispatch"
description: "Wire CellRenderer case files to FilesColumn.renderChips, normalizeCellValueForSave as the only URL-strip write gate, and startEdit formatForEdit so string[] is not garbled."
trigger_phrases:
  - "files cell dispatch"
  - "cellrenderer files"
  - "normalize files save"
  - "startedit files"
  - "inline overlay files"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Files Cell Dispatch

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `012-files-column` |
| **Parent Spec** | ../spec.md |
| **Phase** | 3 of 5 |
| **Predecessor** | 002-files-type-registry |
| **Successor** | 004-files-cover-wiring |
| **Handoff Criteria** | Render case, save gate, and startEdit branch land together; FileFieldRenderer.ts untouched |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 3 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `002-files-type-registry` · Successor: `004-files-cover-wiring`. Synthesis ranks 4 and 9; final-plan step 4. Inline-edit is not “inherit overlay and you’re done”: `startEdit` falls through to `editText` with `safeString(currentValue)` (`CellRenderer.ts:524`) and a `string[]` becomes garbled text. T015 is not a separate diff.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
A `"files"` column would fall through the `displayType` switch (`CellRenderer.ts:185-234`) to `default` and `String(value)`. Empty `[]` already hits `isEmptyValue` (`:2665-2667` + `:151-152`). `isEditableCellColumn` is already true for non-`file.*` keys (`:300-304`), so mobile overlay chrome exists (`:1484-1528`), but without a `startEdit` branch NFR-M01 fails. `normalizeCellValueForSave` (`:2476-2482`) is the only write gate that can strip URLs (REQ-002).

### Purpose
Dispatch `case "files"` to `FilesColumn.renderChips`, run `FilesColumn.normalize` on save, and branch `startEdit` into existing `editText` with `formatForEdit` so desktop and mobile share one atomic `processFrontMatter` commit (`:2458-2470`; `DataSource.ts:296-301`).
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `src/views/CellRenderer.ts:185` — `case "files":` empty `[]` already `db-empty-value`; else `FilesColumn.renderChips`.
- `src/views/CellRenderer.ts:2476-2482` — `if (col.type === "files") return FilesColumn.normalize(value)`. Only write gate (REQ-002). Commit stays `saveValue` → `updateFrontmatter` → `processFrontMatter` (`:2458-2470`; `DataSource.ts:296-301`).
- `src/views/CellRenderer.ts:449-524` — before the text fallback (`:524`), `col.type === "files"` → `editText` with `formatForEdit`; commit runs `parseEdit` → `normalize`.
- Mobile uses existing `is-inline-overlay` (`:1484-1528`). No new `Platform` detection.
- Leave `FileFields.ts` / `FileFieldRenderer.ts` untouched.

### Out of Scope
- Cover `renderCover` guards (child 004).
- Per-file Notion menu + reorder (out of this phase).
- Gallery/list card-body `renderValue` stringify (accept unless a finance gallery shows the column; do not pre-open those renderers).
- Vault-file suggester (relation-popover style) — out of scope this phase.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/CellRenderer.ts` | Edit | `case "files"` at `:185`; save gate at `:2476-2482`; `startEdit` at `:449-524` |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Table cells dispatch `"files"` | `CellRenderer.ts:185` calls `FilesColumn.renderChips`; empty `[]` is `db-empty-value` (`:151-152`); chips cap ≤5 + `+N` |
| REQ-002 | Save strips URLs | `normalizeCellValueForSave` (`:2476-2482`) is the only write gate; typing `[[Sales.pdf]]` and `https://cdn.example/x.pdf` stores only the wikilink |
| REQ-003 | Inline-edit does not garble `string[]` | `startEdit` (`:449-524`) uses `formatForEdit`; commit runs normalize; one `processFrontMatter` per commit |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Mobile render + edit via overlay | No new `Platform` detection; `is-inline-overlay` (`:1484-1528`); `isEditableCellColumn` stays on unless the key is `file.*` (`:300-304`) |
| REQ-005 | `file.*` chips unchanged | `FileFields.ts` / `FileFieldRenderer.ts` have no this-child diffs |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Table cell shows ≤5 chips + `+N`; click opens via `openLinkText`; dangling chip has `is-unresolved` and click no-ops.
- **SC-002**: Empty `[]` is empty; URL input is stripped at save.
- **SC-003**: Mobile uses the existing overlay; no `electron`/`fs` added here.

### Acceptance Scenarios

- **Given** a files cell with two PDFs, **when** the table renders, **then** chips paint via `renderChips`, not `String(value)`.
- **Given** `startEdit` without a files branch, **when** the value is `string[]`, **then** `safeString` garbles it — this child must branch before `:524`.
- **Given** a commit of `[[Sales.pdf]]` plus a URL, **when** `normalizeCellValueForSave` runs, **then** only the wikilink is stored.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Missing `startEdit` branch | `string[]` becomes `"[[a.pdf]],[[b.pdf]]"` (`:524`) | Same diff as render + save |
| Risk | Second write path | URLs survive in frontmatter | Only `:2476-2482` normalizes |
| Dependency | Children 001–002 | No `renderChips` / no `"files"` type | Do not start until those exist |
| Risk | Card-body stringify | Gallery/list `renderValue` has no files case | Accept unless a finance gallery shows the column |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: wikilink text editor this phase (not a file picker); per-file Notion menu deferred; empty/not-empty filter already free (`types.ts:135`).
<!-- /ANCHOR:questions -->
