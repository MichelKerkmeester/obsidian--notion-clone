---
title: "Feature Specification: Files Column Module"
description: "Create isolated FilesColumn.ts: vault wikilink string[] normalize, edit serialize, resolve, classify, and renderChips with cap 5, unresolved class, and optional in-module thumbnails."
trigger_phrases:
  - "files column module"
  - "filescolumn ts"
  - "wikilink string array"
  - "renderchips"
  - "file chip cap"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/012-files-column/001-files-column-module"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored FilesColumn module child from synthesis ranks 1,6,7,11 and final-plan step 2"
    next_safe_action: "Create src/data/FilesColumn.ts on the EuroFormat isolation rule"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-files-column-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Files Column Module

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
| **Phase** | 1 of 5 |
| **Predecessor** | None |
| **Successor** | 002-files-type-registry |
| **Handoff Criteria** | Module exists with normalize, edit serialize, resolve, classify, FILE_CHIP_CAP, and renderChips; FileFieldRenderer.ts untouched |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 5** — Parent: [`../spec.md`](../spec.md) · Successor: `002-files-type-registry`. This child is synthesis ranks 1, 6, 7, 11 and final-plan step 2. Cap, unresolved chips, classify, and optional thumbnails belong in this module — they are not later diffs. Registry, CellRenderer, and cover call sites wait for later children.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The fork already resolves vault wikilinks (`CoverImage.ts:22-26`, `FileFieldRenderer.ts:74-84`) but has no files-column value type. Editing `FileFieldRenderer.ts` would leak unresolved-chip behavior into virtual `file.*` fields (`:74-84`). A second cover parser is forbidden. Cap, unresolved class, classify, and thumbnails must live in one EuroFormat module or they duplicate across later children.

### Purpose
Create one isolated leaf `src/data/FilesColumn.ts` (`EuroFormat.ts:1-42`) that owns vault wikilink `string[]` normalize, `formatForEdit`/`parseEdit`, resolve, classify, `FILE_CHIP_CAP = 5`, and `renderChips` — with no renderer imports that pull CellRenderer, no `fetch`, and no `adapter.exists`.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New module `src/data/FilesColumn.ts` on the EuroFormat header: one new file owns the algorithm; rebase stays an insertion-only diff (`EuroFormat.ts:1-42`).
- `normalize(value)`: coerce to array, trim, drop empty, drop URLs (`isExternalUrl` / `http(s):`), parse `[[target|label]]` / markdown / bare path (same forms as `FileFieldRenderer.ts:124-141`), dedupe by target (`:111-122`). Malformed → keep as raw-text chip, never throw.
- `formatForEdit` / `parseEdit` for newline- or comma-separated `[[target]]` text (wired by child 003).
- `resolveFileTarget(app, row, target)` → `metadataCache.getFirstLinkpathDest` (`CoverImage.ts:24`); null ⇒ unresolved.
- `classifyFileType` / `isImageTarget` (delegate to `CoverImage.ts:13-16`; do not widen HEIC/TIFF/ICO).
- `FILE_CHIP_CAP = 5`.
- `renderChips(parent, app, row, values)`: cap 5 + `+N`, tooltip all names (`FileFieldRenderer.ts:73`), `internal-link` + `is-unresolved` when dest is null, click → `openLinkText` or no-op. Do **not** call `renderFileLinkList`.
- Optional in-module thumbnails: `getResourcePath` + `isImageTarget` with existing chip CSS. If that needs new CSS, ship type-icon + filename chips (text chips satisfy parent REQ-005).
- No `fetch`, no CDN, no `adapter.exists`, no `electron`/`fs`.

### Out of Scope
- Union / labels / pickers / icon / i18n / conflict mapping (child `002-files-type-registry`).
- `CellRenderer.ts` `case "files"`, save gate, `startEdit` (child `003-files-cell-dispatch`).
- Gallery/board cover guards (child `004-files-cover-wiring`). Do not add a second cover parser; a module-only `resolveFilesColumnCover` is dead without those call sites.
- Edits to `FileFieldRenderer.ts`, `FileFields.ts`, or `CoverImage.ts`.
- Per-file Notion menu, reorder, upload UI, `db-file-pending`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/FilesColumn.ts` | Create | Normalize, edit serialize, resolve, classify, `FILE_CHIP_CAP`, `renderChips` |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Isolated `FilesColumn.ts` exists | New file under `src/data/` with EuroFormat header (`EuroFormat.ts:1-42`); no imports that pull `CellRenderer` |
| REQ-002 | Normalize is vault-local `string[]` | Arrays, trims, drops empty, drops URLs, parses the same forms as `FileFieldRenderer.ts:124-141`, dedupes by target (`:111-122`); malformed stays a raw-text chip and never throws |
| REQ-003 | Module has no network or disk probe | Grep shows no `fetch`, no CDN path, no `adapter.exists`, no `electron`/`fs` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Chips cap, unresolved, optional thumbnails | `FILE_CHIP_CAP = 5`; dest null → `internal-link is-unresolved` and click no-ops; tooltip lists every name (`FileFieldRenderer.ts:73`); thumbnails only if `getResourcePath` + `isImageTarget` stay in-module with existing CSS |
| REQ-005 | `FileFieldRenderer.ts` stays untouched | Broken-link chips for this column live here; changing `FileFieldRenderer.ts:74-84` would leak into virtual `file.*` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `src/data/FilesColumn.ts` exports `normalize`, `formatForEdit`, `parseEdit`, `resolveFileTarget`, `classifyFileType`, `isImageTarget`, `FILE_CHIP_CAP`, and `renderChips`.
- **SC-002**: Scratch cases cover `[]`, one PDF, URL dropped, duplicate targets, dangling dest, 50+ names in tooltip.
- **SC-003**: `FileFieldRenderer.ts` / `FileFields.ts` / `CoverImage.ts` have no this-child diffs.

### Acceptance Scenarios

- **Given** a value that is a URL and a `[[Sales.pdf]]` wikilink, **when** `normalize` runs, **then** only the wikilink remains.
- **Given** `getFirstLinkpathDest` returns null, **when** `renderChips` paints, **then** the chip has `is-unresolved` and click no-ops.
- **Given** 50 file names, **when** chips render, **then** at most 5 chips plus `+N` and the tooltip lists every name.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Editing `FileFieldRenderer.ts` | Unresolved chips leak into `file.*` | Paint chips in this module only |
| Risk | Module-only cover helper | `resolveFilesColumnCover` never runs; `renderCover` calls `resolveCoverImage` directly | Leave cover wiring to child 004 |
| Risk | Widening `IMAGE_TARGET_RE` | HEIC hangs Chromium desktop `<img>` | Delegate `isImageTarget` to `CoverImage.ts:13-16` |
| Dependency | Live fork `src/data/EuroFormat.ts:1-42` | Isolation rule | Copy the header; no CellRenderer import |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults from parent research: thumbnails yes if cheap (`getResourcePath` + `isImageTarget`); HEIC/TIFF/ICO stay out of the regex; no `db-file-pending`; no per-cell `adapter.exists`.
<!-- /ANCHOR:questions -->
