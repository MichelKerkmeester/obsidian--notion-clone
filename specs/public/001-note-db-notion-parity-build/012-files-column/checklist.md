---
title: "Verification Checklist: Files / Attachments Column"
description: "Pending verification checklist for the Files/media column phase with concrete planned checks."
trigger_phrases:
  - "files column"
  - "checklist"
  - "verification"
  - "gallery cover"
  - "vault local"
  - "sales pdfs"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/012-files-column"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan.md review findings to planning docs"
    next_safe_action: "Build phase 012 per plan.md and tasks.md (live fork: Obsidian Plugin/src)"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Verification Checklist: Files / Attachments Column

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: spec.md]
  - **Evidence**: `spec.md` records scope, P0/P1 requirements (REQ-001 through REQ-007 with synthesis call sites), NFRs, edge cases, operator decisions, and related docs; verification pending.
- [ ] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: plan.md]
  - **Evidence**: `plan.md` includes the locked design (module + three call sites + companions), algorithm, edge-cases/mobile/iCloud notes, phases, testing, dependencies, rollback, and L2 addenda; verification pending.
- [ ] CHK-003 [P1] Dependencies identified and available [EVIDENCE: plan.md dependencies]
  - **Evidence**: `plan.md` lists fork-internal dependencies (registry, `PROPERTY_TYPE_ICON_NAMES`, picker lists, `CellRenderer`, cover pipeline) as green and the phase as `depends_on: none`.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Typecheck passes [EVIDENCE: `npx tsc --noEmit`]
  - **Evidence**: Pending — must pass with `PROPERTY_TYPE_ICON_NAMES` carrying `files` (else `Record<ColumnDef["type"], string>` fails `tsc` — SC-001).
- [ ] CHK-011 [P0] No console errors or warnings [EVIDENCE: dev-vault run]
  - **Evidence**: Pending — observed during the desktop manual pass.
- [ ] CHK-012 [P1] Vault-local enforcement [EVIDENCE: grep for fetch/CDN/`adapter.exists` patterns]
  - **Evidence**: Pending — the new module contains no `fetch`/CDN/`http` path and no per-cell `adapter.exists`; the external skip is at the cover call sites (`GalleryRenderer.ts:442`, `BoardRenderer.ts:661`), not only in an unused helper.
- [ ] CHK-013 [P1] Code follows fork patterns [EVIDENCE: EuroFormat isolated-diff model]
  - **Evidence**: Pending — diff shape is 1 new module + insertion-only call-site edits (`git diff --stat`); `CoverImage.ts` / `FileFieldRenderer.ts` / `FileFields.ts` clean.
- [ ] CHK-014 [P1] `FileFieldRenderer.ts` untouched [EVIDENCE: git diff]
  - **Evidence**: Pending — broken-link chips live in `FilesColumn.ts`; editing `FileFieldRenderer.ts` would leak into virtual `file.*` fields.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All acceptance criteria met [EVIDENCE: REQ-001 through REQ-007]
  - **Evidence**: Pending — each requirement checked against its synthesis call sites after the build.
- [ ] CHK-021 [P0] Manual testing complete [EVIDENCE: gallery cover + Sales PDFs, network off]
  - **Evidence**: Pending — desktop and mobile passes in the finance dev vault with the network off.
- [ ] CHK-022 [P1] Edge cases tested [EVIDENCE: spec.md §8]
  - **Evidence**: Pending — empty `string[]` → `db-empty-value`; dangling wikilink → `is-unresolved`; 50+ files → cap 5 + `+N`; non-image cover slot → `.is-empty` placeholder; malformed wikilink → raw-text chip; hand-edited URL stripped at write and skipped by cover guard at the call sites.
- [ ] CHK-023 [P1] Mobile-safe view verified [EVIDENCE: mobile pass]
  - **Evidence**: Pending — files column renders and inline-edits on mobile via `is-inline-overlay`; `startEdit` branches `col.type === "files"` into `editText` with `formatForEdit`; no `electron`/`fs`/Node in the module.
- [ ] CHK-024 [P1] iCloud not-downloaded case verified [EVIDENCE: mobile/desktop pass]
  - **Evidence**: Pending — chip renders from metadata-cache `TFile`; opening via `openLinkText` materializes the placeholder; no `db-file-pending` overlay, no per-cell `adapter.exists` (NFR-P01).
- [ ] CHK-025 [P1] HEIC codec degrade verified (if `onerror` accepted) [EVIDENCE: desktop pass]
  - **Evidence**: Pending — HEIC cover on Chromium desktop falls back to `.is-empty` via `onerror` on `GalleryRenderer.ts:468` and the board cover `<img>`; `IMAGE_TARGET_RE` stays conservative (operator decision 3/4).
- [ ] CHK-026 [P1] Concurrent-edit safety verified [EVIDENCE: dev-vault pass]
  - **Evidence**: Pending — editing while a gallery renders does not crash; one atomic `processFrontMatter` write per save; no churny per-keystroke writes.
- [ ] CHK-027 [P2] Type conversion / import verified [EVIDENCE: `PropertyService` pass-through]
  - **Evidence**: Pending — `convertValueForType` `default` passes arrays through; optional `files → multitext` mapping present (operator decision 6).
- [ ] CHK-028 [P1] Inline-edit round-trip verified [EVIDENCE: dev-vault pass]
  - **Evidence**: Pending — typing `[[Sales.pdf]]` and `https://cdn.example/x.pdf` stores only the wikilink; one `processFrontMatter` per commit; `startEdit` does not garble `string[]` via `safeString`.
- [ ] CHK-029 [P1] Cover guard verified [EVIDENCE: dev-vault pass, network off]
  - **Evidence**: Pending — a hand-edited URL in the files column does not become a network `<img>` (gallery + board); PDF-only slot is placeholder; guard is at `GalleryRenderer.ts:442` and `BoardRenderer.ts:661`, not inside `FilesColumn.ts`.
- [ ] CHK-033 [P2] Card-body stringify guard (conditional) [EVIDENCE: dev-vault pass]
  - **Evidence**: Pending — only if a finance gallery/list shows the files column as a visible field; add `col.type === "files"` calling `FilesColumn.renderChips` in `GalleryRenderer.renderValue` / `ListRenderer.renderValue`. Skip if the column is cover-only.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-030 [P0] FilesColumn module + call sites present [EVIDENCE: fork diff]
  - **Evidence**: Pending — `src/data/FilesColumn.ts` created (normalize, `formatForEdit`/`parseEdit`, `renderChips`, `classifyFileType`/`isImageTarget`, `resolveFileTarget`, `FILE_CHIP_CAP`); `case "files"` at `CellRenderer.ts:185`; `normalizeCellValueForSave` at `:2476`; `startEdit` branch at `:449-524`; union at `types.ts:50`; registry at `ColumnTypes.ts:108-138,172-177`.
- [ ] CHK-031 [P0] tsc-forced + UI companions + cover wiring present [EVIDENCE: fork diff]
  - **Evidence**: Pending — `PROPERTY_TYPE_ICON_NAMES` gains `files` with a name resolving in `PROPERTY_TYPE_ICON_DEFS` (`PropertyTypeIcon.ts:7-20`); picker lists gain `"files"` (`ColumnMenu.ts:261-264`, `CreatePropertyModal.ts:26-30`); i18n keys in three dictionaries (`i18n.ts` — en, zh-CN, zh-TW next to `columnType.rollup` siblings); `PropertyTypeConflict` `files→multitext` (`:73-76`); cover guard at `GalleryRenderer.ts:442` and `BoardRenderer.ts:661`; `onerror` on both cover `<img>` elements; auto-prefer at `DatabaseView.ts:9599-9602`.
- [ ] CHK-032 [P1] Scope lock respected [EVIDENCE: git status]
  - **Evidence**: Pending — only this phase's files changed; `CoverImage.ts`, `FileFields.ts`, `FileFieldRenderer.ts`, `ListRenderer.ts` untouched; `GalleryRenderer.ts` and `BoardRenderer.ts` touched only for the cover guard + `onerror`; no sibling phase folders touched.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-040 [P0] No hardcoded secrets or CDN URLs [EVIDENCE: code review]
  - **Evidence**: Pending — new module stores and renders vault wikilinks only; no Notion CDN URLs.
- [ ] CHK-041 [P1] Malformed/dangling wikilinks handled defensively [EVIDENCE: edge-case pass]
  - **Evidence**: Pending — dangling → `internal-link is-unresolved` (no throw); malformed → raw-text chip (no throw).
- [ ] CHK-042 [P1] Hand-edited URL cannot become a network `<img>` [EVIDENCE: cover-guard check]
  - **Evidence**: Pending — `normalizeCellValueForSave` strips URLs at write; cover guard at `GalleryRenderer.ts:442` and `BoardRenderer.ts:661` skips `image.external` when the column type is `"files"` (NFR-S01).
- [ ] CHK-043 [P1] Auth/authz not applicable [EVIDENCE: local vault files]
  - **Evidence**: Records N/A — rendering resolves only files already inside the user's vault.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-050 [P1] Spec/plan/tasks/checklist synchronized [EVIDENCE: doc review]
  - **Evidence**: Pending — all four describe the same module, three call sites, companions, cover guard at call sites, `startEdit` branch, and vault-local constraint, matching `research/synthesis.md` and `research/final-plan.md`.
- [ ] CHK-051 [P1] Comments carry durable WHY [EVIDENCE: comment hygiene gate]
  - **Evidence**: Pending — no phase ids, spec paths, or task ids inside code comments.
- [ ] CHK-052 [P2] README updated (if applicable) [EVIDENCE: fork README]
  - **Evidence**: Pending — only if the column type list is documented there.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-060 [P1] Temp files in scratch/ only [EVIDENCE: file inventory]
  - **Evidence**: Pending — no scratch residue outside the fork's scratch location.
- [ ] CHK-061 [P1] scratch/ cleaned before completion [EVIDENCE: no scratch dir]
  - **Evidence**: Pending — final inventory shows only committed files.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 9 | 0/9 |
| P1 Items | 19 | 0/19 |
| P2 Items | 3 | 0/3 |

**Verification Date**: 2026-08-25
**Verified By**: markdown-agent (docs rewritten to synthesis; pending implementation)

<!-- /ANCHOR:summary -->
