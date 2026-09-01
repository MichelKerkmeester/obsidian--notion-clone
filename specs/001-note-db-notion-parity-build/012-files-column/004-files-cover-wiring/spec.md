---
title: "Feature Specification: Files Cover Wiring"
description: "Guard gallery and board renderCover so files-column external images never become network img tags, add onerror placeholders, and auto-prefer files in getDefaultGalleryImageField. CoverImage.ts stays untouched."
trigger_phrases:
  - "files cover wiring"
  - "gallery image field files"
  - "board cover files"
  - "image external skip"
  - "cover onerror"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/012-files-column/004-files-cover-wiring"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored files cover-wiring child from synthesis ranks 5,8 and final-plan step 5"
    next_safe_action: "Add renderCover external skip, onerror, and auto-prefer files"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-files-cover-wiring"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Files Cover Wiring

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
| **Phase** | 4 of 5 |
| **Predecessor** | 003-files-cell-dispatch |
| **Successor** | 005-files-column-proof |
| **Handoff Criteria** | Both renderCover sites skip image.external on files columns; onerror placeholders; auto-prefer; CoverImage.ts untouched |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 4 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `003-files-cell-dispatch` · Successor: `005-files-column-proof`. Synthesis ranks 5 and 8; final-plan step 5. `GalleryRenderer.renderCover` (`:439-468`) and `BoardRenderer.renderCover` (`:656-661`) call `resolveCoverImage` directly. A FilesColumn adapter that skips `external` never runs unless those two sites branch on `col.type === "files"`. `CoverImage.ts` stays locked.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
`parseCoverImage` sets `external: true` for URLs (`CoverImage.ts:41-44`) and `resolveImageSrc` returns that URL as `src` (`:22-23`). Write-time URL strip (child 003) does not save hand-edited stale URLs already on disk (NFR-S01). PDFs never match `IMAGE_TARGET_RE` (`CoverImage.ts:13`) so they never become covers. HEIC on Chromium desktop needs `<img> onerror` → `.is-empty`, not a wider regex.

### Purpose
After `resolveCoverImage`, if the cover column type is `"files"` and `image.external`, behave as `!image` (gallery `.is-empty` `:443-447` / board `:662-665`). Add `onerror` on both cover `<img>` elements. Auto-prefer `|| col.type === "files"` in `getDefaultGalleryImageField` (`DatabaseView.ts:9599-9602`). Operator (or auto-prefer) sets `galleryImageField` / `boardImageField` to the files key — the picker already lists every column (`ViewConfigPanelRenderer.ts:1456,1468-1471`).
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `src/views/GalleryRenderer.ts:442` — after `resolveCoverImage(...)`, if cover column type is `"files"` and `image.external`, treat as empty (placeholder `:443-447`).
- `src/views/GalleryRenderer.ts:468` — `<img> onerror` → `.is-empty`.
- `src/views/BoardRenderer.ts:661` — same external skip; `onerror` on the board cover `<img>` (`:662-665` empty path).
- `src/views/DatabaseView.ts:9599-9602` — `|| col.type === "files"` in `getDefaultGalleryImageField`.
- Keep `IMAGE_TARGET_RE` conservative (`CoverImage.ts:13`). PDFs never match it.

### Out of Scope
- Any edit to `CoverImage.ts` (locked — the guard belongs at the call sites, not a second parser).
- Ranking/recency cover heuristics.
- Gallery “N attachments” count badge (deferred).
- Card-body `renderValue` stringify (do not pre-open).
- Widening HEIC/TIFF/ICO into the regex.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/GalleryRenderer.ts` | Edit | External skip at `:442`; `onerror` at `:468` |
| `src/views/BoardRenderer.ts` | Edit | External skip at `:661`; `onerror` on cover `<img>` |
| `src/views/DatabaseView.ts` | Edit | Auto-prefer `"files"` at `:9599-9602` |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Files cover is vault-local | After `resolveCoverImage`, `"files"` + `image.external` behaves as `!image` at `GalleryRenderer.ts:442` and `BoardRenderer.ts:661` |
| REQ-002 | `CoverImage.ts` is untouched | `git diff` on `CoverImage.ts` is empty for this child |
| REQ-003 | Non-image slot is a placeholder | PDF-only files column → `.is-empty` (`GalleryRenderer.ts:443-447`; board `:662-665`); PDFs never match `IMAGE_TARGET_RE` (`CoverImage.ts:13`) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Codec fail degrades | Gallery `:468` and board cover `<img>` `onerror` → `.is-empty` (synthesis Q4) |
| REQ-005 | Auto-prefer files columns | `getDefaultGalleryImageField` includes `\|\| col.type === "files"` (`DatabaseView.ts:9599-9602`) |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Gallery with image + Sales PDFs in the files column, network off, shows the image.
- **SC-002**: PDF-only slot is placeholder; a hand-edited URL does not become a network `<img>`.
- **SC-003**: `CoverImage.ts` / `FileFieldRenderer.ts` / `FileFields.ts` stay clean.

### Acceptance Scenarios

- **Given** a files column used as `galleryImageField` with a vault PNG and PDFs, **when** the gallery renders offline, **then** the PNG is the cover.
- **Given** a stale `https://` value in that column, **when** `parseCoverImage` sets `external: true`, **then** the call-site guard treats it as empty.
- **Given** a HEIC in the cover slot on Chromium desktop, **when** `<img>` errors, **then** the placeholder shows.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Adapter-only inside FilesColumn | Never runs; `renderCover` calls `resolveCoverImage` | Guard at the two call sites |
| Risk | Editing `CoverImage.ts` | Second parser; CDN-creep lives in the shared helper | Locked: do not edit |
| Risk | Regex widen for HEIC | Broken `<img>` hang | Conservative regex + `onerror` |
| Dependency | Child 002 `"files"` type | Guard cannot branch on type | After registry |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: cover-site external skip (Q4/Q5); no regex widen (Q3); auto-prefer yes; count badge deferred.
<!-- /ANCHOR:questions -->
