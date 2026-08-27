---
title: "Feature Specification: Files Column Proof"
description: "Prove files column after children 001–004: tsc, fork build, grep vault-local, desktop chips and covers, mobile overlay edit, iCloud open-through-Obsidian, and insertion-only diff-shape."
trigger_phrases:
  - "files column proof"
  - "files tsc sc-001"
  - "vault local grep"
  - "sales pdf chips"
  - "gallery cover offline"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/012-files-column/005-files-column-proof"
    last_updated_at: "2026-08-27T17:27:13Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored files-column-proof child from synthesis edges and final-plan step 6"
    next_safe_action: "Run tsc, grep, desktop, mobile, and diff-shape proofs after children 001-004 ship"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-005-files-column-proof"
      parent_session_id: null
    completion_pct: 86
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Feature Specification: Files Column Proof

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `012-files-column` |
| **Parent Spec** | ../spec.md |
| **Phase** | 5 of 5 |
| **Predecessor** | 004-files-cover-wiring |
| **Successor** | None |
| **Handoff Criteria** | REQ-001–007 and SC-001–004 recorded in checklist.md; T019 gallery count badge and T020 per-file menu stay blocked |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 5 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `004-files-cover-wiring`. This child owns `research/final-plan.md` step 6. External skip must be at the cover call sites, not only in an unused helper. Do not add `db-file-pending`. Do not enable per-file Notion menus.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Without this proof, `"files"` can compile while cells still stringify, covers still fetch URLs, or `PROPERTY_TYPE_ICON_NAMES` is missing and `tsc` was never re-run. REQ-003 and NFR-S01 need a grep that the module has no `fetch` / CDN / `adapter.exists`, and that the external skip is at `GalleryRenderer.ts:442` and `BoardRenderer.ts:661`. Diff-shape must stay 1 new module + insertion-only sites with `CoverImage.ts` / `FileFieldRenderer.ts` / `FileFields.ts` clean.

### Purpose
Prove parent REQ-001–007 and SC-001–004 on the live fork: `npx tsc --noEmit`, fork build, vault-local grep, desktop network-off Sales PDF chips and gallery cover, dangling/cap/empty/HEIC/onerror, inline-edit URL strip, mobile overlay, iCloud open-through-Obsidian, and `git diff --stat`.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `npx tsc --noEmit` (SC-001) and the fork build (SC-002).
- Grep `FilesColumn.ts` for `fetch` / `cdn` / `http` / `adapter.exists` (REQ-003, NFR-S01). Confirm external skip at cover call sites, not only in an unused helper.
- Desktop, network off: Sales PDF chips + `openLinkText` (SC-004); dangling wikilink; 50+ cap; empty `[]`; HEIC cover `onerror` if a HEIC exists in vault; gallery cover (SC-003); inline-edit round-trip; cover URL guard.
- Mobile: render + inline-edit via overlay; no `electron`/`fs`/Node in the module (NFR-M01).
- iCloud not-downloaded: chip from metadata-cache `TFile`; open materializes; no `db-file-pending` (Q8).
- `git diff --stat`: 1 new module + insertion-only sites; `CoverImage.ts` / `FileFieldRenderer.ts` / `FileFields.ts` clean.
- Record evidence in this child's `checklist.md`. T019 and T020 stay `[B]`.

### Out of Scope
- New fork TypeScript in this child (implementation lives in 001–004).
- Gallery count badge (T019) and per-file menu (T020).
- Card-body stringify unless a finance gallery actually shows the column.
- Per-cell `adapter.exists` / `db-file-pending`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| This child's `checklist.md` / `implementation-summary.md` | Modify | Evidence rows for proofs |
| Fork `src/` | Do not change | Freeze except children 001–004 already shipped |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Typecheck and build pass | `npx tsc --noEmit` exits 0 with `PROPERTY_TYPE_ICON_NAMES.files` (SC-001); fork build completes (SC-002) |
| REQ-002 | Files stay vault-local | Module grep has no `fetch`/CDN/`adapter.exists`; cover external skip is at `GalleryRenderer.ts:442` and `BoardRenderer.ts:661` |
| REQ-003 | Gallery cover works offline | Files column as `galleryImageField` shows the first internal image with network off (SC-003); PDF-only is `.is-empty` |
| REQ-004 | Table chips open vault files | Sales PDF chips; `openLinkText` (SC-004); dangling `is-unresolved` click no-ops |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Edit and mobile | Typing `[[Sales.pdf]]` plus a URL stores only the wikilink; mobile uses `is-inline-overlay` (`CellRenderer.ts:1484-1528`) |
| REQ-006 | Diff-shape and freeze | `git diff --stat` is 1 module + insertion-only sites; `CoverImage.ts` / `FileFieldRenderer.ts` / `FileFields.ts` clean; T019/T020 remain `[B]` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `tsc` and fork build recorded in `checklist.md`.
- **SC-002**: Offline gallery cover + table chips + dangling + cap + empty + URL strip recorded.
- **SC-003**: Mobile overlay and iCloud open-through-Obsidian recorded; no `db-file-pending`.

### Acceptance Scenarios

- **Given** children 001–004 shipped, **when** `tsc` runs, **then** it exits 0 including the icon Record.
- **Given** network off, **when** gallery uses the files column, **then** the vault image shows and a stale URL does not.
- **Given** a dangling wikilink, **when** the cell renders, **then** the chip has `is-unresolved` and does not throw.
- **Given** this child has run, **when** `git diff --stat` is inspected, **then** `CoverImage.ts` is clean.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Children 001–004 | Nothing to prove | Do not start until they ship |
| Risk | Unused cover helper | CDN still reaches `<img>` | Grep call sites, not only FilesColumn |
| Risk | Treating HEIC paint on WebKit as Chromium pass | Desktop hang | Require `onerror` on Chromium if HEIC exists |
| Risk | Adding TypeScript during proofs | Diff-shape breaks | This child is observation-only |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Dozens of attachments stay responsive; resolve once per cell via `getFirstLinkpathDest`; no per-cell `adapter.exists`; cover I/O is `getResourcePath` only.

### Security
- **NFR-S01**: No secrets; no Notion CDN URLs in stored value or cover `src`. Write-time strip plus cover-site external skip.

### Reliability
- **NFR-R01**: Dangling wikilinks are `internal-link is-unresolved`; click no-ops; malformed is a raw-text chip, never throw.

### Mobile
- **NFR-M01**: No `electron` / `fs` / Node in `FilesColumn.ts`; overlay inherited; no new bottom sheet.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Empty `[]` → `db-empty-value` (`CellRenderer.ts:151-152`).
- 50+ files → cap 5 + `+N`; tooltip lists every name (`FileFieldRenderer.ts:73`).
- PDF in cover slot → `.is-empty` (`GalleryRenderer.ts:443-447`); PDF stays a table chip.

### Error Scenarios
- Dangling dest → `is-unresolved`; no throw.
- iCloud not downloaded → chip from metadata-cache `TFile`; `openLinkText` materializes; no `db-file-pending`.
- HEIC on Chromium → `onerror` placeholder (`CoverImage.ts:13`).
- Hand-edited URL → stripped at save; skipped at cover if `external`.

### Concurrent Operations
- Stateless read of `row.frontmatter`; one `processFrontMatter` per commit (`DataSource.ts:296`).
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 8/25 | Proofs only; no new code surface |
| Risk | 8/25 | CDN creep, garbled edit, tsc icon Record, iCloud |
| Research | 6/20 | Locked by `research/final-plan.md` step 6 |
| **Total** | **22/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking. Locked defaults: skip `db-file-pending` (Q8); T019/T020 stay blocked; card-body stringify accepted unless a finance gallery shows the column.
<!-- /ANCHOR:questions -->
