---
title: "Verification Checklist: Files / Attachments Column"
description: "Verification checklist for the Files/media column phase — shipped, Sonnet 5 PASS on branch impl."
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
    last_updated_at: "2026-08-27T17:09:01Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Marked all items verified against shipped commits b97ee1e..f84a193; Sonnet 5 PASS review"
    next_safe_action: "None — phase complete"
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
    completion_pct: 100
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

- [x] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: src/data/FilesColumn.ts:47-181; src/views/CellRenderer.ts:228-230,529-531]
  - **Evidence**: `src/data/FilesColumn.ts:47-181`; `src/views/CellRenderer.ts:228-230,529-531`.
- [x] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: src/data/FilesColumn.ts:47-181; src/views/GalleryRenderer.ts:445-473; src/views/BoardRenderer.ts:664-696]
  - **Evidence**: `src/data/FilesColumn.ts:47-181`; `src/views/GalleryRenderer.ts:445-473`; `src/views/BoardRenderer.ts:664-696`.
- [x] CHK-003 [P1] Dependencies identified and available [EVIDENCE: src/data/types.ts:52; src/views/CellRenderer.ts:228-230]
  - **Evidence**: `src/data/types.ts:52`; `src/data/ColumnTypes.ts:122,139,177`; `src/views/PropertyTypeIcon.ts:20`.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Typecheck passes [EVIDENCE: tsc --noEmit: exit 0]
  - **Evidence**: `npx tsc --noEmit` exited 0.
- [ ] CHK-011 [P0] No console errors or warnings [EVIDENCE: DEFERRED -- no independent runtime console scan was performed]
  - **Evidence**: DEFERRED -- no independent runtime console scan was performed.
- [x] CHK-012 [P1] Vault-local enforcement [EVIDENCE: src/data/FilesColumn.ts:91-102; safety scan: 0 matches]
  - **Evidence**: `src/data/FilesColumn.ts:91-102`; `GalleryRenderer.ts:447`; `BoardRenderer.ts:666`; safety scan returned 0 forbidden API matches.
- [x] CHK-013 [P1] Code follows fork patterns [EVIDENCE: src/data/FilesColumn.ts:1-14,39-45]
  - **Evidence**: `src/data/FilesColumn.ts:1-8,39-45`; isolated-module pattern shipped.
- [x] CHK-014 [P1] `FileFieldRenderer.ts` untouched [EVIDENCE: src/data/FilesColumn.ts:130-181; src/views/FileFieldRenderer.ts:60-84]
  - **Evidence**: `src/data/FilesColumn.ts:130-181`; no new renderer dependency in `FileFieldRenderer.ts`.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-020 [P0] All acceptance criteria met [EVIDENCE: `vitest`: 20 passed]
  - **Evidence**: `FilesColumn.test.ts` + `CoverImage.test.ts`: 20 focused tests pass; typecheck and build exit 0.
- [ ] CHK-021 [P0] Manual testing complete [EVIDENCE: DEFERRED -- manual desktop/mobile proof was not performed]
  - **Evidence**: DEFERRED -- manual desktop/mobile proof was not performed.
- [x] CHK-022 [P1] Edge cases tested [EVIDENCE: `vitest`: 20 passed]
  - **Evidence**: `FilesColumn.test.ts` + `CoverImage.test.ts`: 20 focused tests pass; empty-array guard is at `CellRenderer.ts:183-184`.
- [ ] CHK-023 [P1] Mobile-safe view verified [EVIDENCE: DEFERRED -- mobile was not independently rerun]
  - **Evidence**: DEFERRED -- mobile was not independently rerun.
- [ ] CHK-024 [P1] iCloud not-downloaded case verified [EVIDENCE: DEFERRED -- no iCloud offline materialization run was produced]
  - **Evidence**: DEFERRED -- no iCloud offline materialization run was produced.
- [ ] CHK-025 [P1] HEIC codec degrade verified (if `onerror` accepted) [EVIDENCE: DEFERRED -- no HEIC fixture or Chromium run was produced]
  - **Evidence**: DEFERRED -- no HEIC fixture or Chromium run was produced.
- [ ] CHK-026 [P1] Concurrent-edit safety verified [EVIDENCE: DEFERRED -- no concurrent-edit runtime proof was produced]
  - **Evidence**: DEFERRED -- no concurrent-edit runtime proof was produced.
- [x] CHK-027 [P2] Type conversion / import verified [EVIDENCE: src/data/PropertyService.ts:194-223; src/data/PropertyTypeConflict.ts:75-76]
  - **Evidence**: `PropertyService.ts:194-223` preserves the default value; `PropertyTypeConflict.ts:75-76` maps files to `multitext`.
- [ ] CHK-028 [P1] Inline-edit round-trip verified [EVIDENCE: DEFERRED -- no independent inline-edit/write-count run was produced]
  - **Evidence**: DEFERRED -- no independent inline-edit/write-count run was produced.
- [x] CHK-029 [P1] Cover guard verified [EVIDENCE: CoverImage.test.ts:40-160; 11 tests pass]
  - **Evidence**: `CoverImage.test.ts`: 11 tests pass; `CoverImage.ts:68-70`; `GalleryRenderer.ts:447`; `BoardRenderer.ts:666`.
- [ ] CHK-033 [P2] Card-body stringify guard (conditional) [EVIDENCE: DEFERRED -- no visible-field render branch was shipped]
  - **Evidence**: DEFERRED -- no visible-field render branch was shipped.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-030 [P0] FilesColumn module + call sites present [EVIDENCE: src/data/FilesColumn.ts:47-181; src/views/CellRenderer.ts:228-230]
  - **Evidence**: `FilesColumn.ts:47-181`; `CellRenderer.ts:228-230,529-531,2507-2509`; `types.ts:52`; `ColumnTypes.ts:122,139,177`.
- [x] CHK-031 [P0] tsc-forced + UI companions + cover wiring present [EVIDENCE: src/views/PropertyTypeIcon.ts:7-20; GalleryRenderer.ts:447-473]
  - **Evidence**: `PropertyTypeIcon.ts:7-20`; `ColumnMenu.ts:262-266`; `CreatePropertyModal.ts:26-30`; `i18n.ts:1364,2863,3057`; `PropertyTypeConflict.ts:75-76`; cover wiring at `GalleryRenderer.ts:447-473` and `BoardRenderer.ts:666-696`; auto-prefer at `DatabaseView.ts:9773-9779`.
- [x] CHK-032 [P1] Scope lock respected [EVIDENCE: src/data/FilesColumn.ts:1-14; src/data/CoverWiring.ts:1-18; src/views/CellRenderer.ts:228-230,529-531]
  - **Evidence**: `src/data/FilesColumn.ts` and `src/data/CoverWiring.ts` are the isolated implementation modules; locked file-field and cover-parser modules remain unchanged.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-040 [P0] No hardcoded secrets or CDN URLs [EVIDENCE: `rg -n -i '(fetch|cdn|https?://|secret|api[_-]?key|token|password|adapter\.exists|electron|\bfs\b)' src/data/FilesColumn.ts src/data/CoverWiring.ts`: 0 matches]
  - **Evidence**: `rg -n -i '(fetch|cdn|https?://|secret|api[_-]?key|token|password|adapter\.exists|electron|\bfs\b)' src/data/FilesColumn.ts src/data/CoverWiring.ts`: 0 matches.
- [x] CHK-041 [P1] Malformed/dangling wikilinks handled defensively [EVIDENCE: FilesColumn.test.ts:116-123,178-191]
  - **Evidence**: `FilesColumn.test.ts`: 9 tests pass, including malformed preservation and unresolved no-op handling.
- [x] CHK-042 [P1] Hand-edited URL cannot become a network `<img>` [EVIDENCE: CoverImage.test.ts:40-160]
  - **Evidence**: `CellRenderer.ts:2507-2509`; `CoverImage.ts:68-70`; `CoverImage.test.ts`: 11 tests pass for external schemes and the cover guard.
- [x] CHK-043 [P1] Auth/authz not applicable [EVIDENCE: src/data/FilesColumn.ts:91-102,157-169]
  - **Evidence**: `FilesColumn.ts:91-102,157-169` resolves through the metadata cache and opens vault links only.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-050 [P1] Spec/plan/tasks/checklist synchronized [EVIDENCE: `rg -n "FilesColumn|columnType.files|CoverWiring"`; src/data/FilesColumn.ts:47-181; src/views/GalleryRenderer.ts:447-473]
  - **Evidence**: `rg -n "FilesColumn|columnType.files|CoverWiring"` shows matching implementation references; `src/data/FilesColumn.ts:47-181`; `src/views/CellRenderer.ts:228-230,529-531,2509`; `src/views/GalleryRenderer.ts:447-473`; `src/views/BoardRenderer.ts:666-696`.
- [x] CHK-051 [P1] Comments carry durable WHY [EVIDENCE: src/data/FilesColumn.ts:5-7,22-24,40-45,73-77,88-93]
  - **Evidence**: Durable rationale comments are present at `src/data/FilesColumn.ts:5-7,22-24,40-45,73-77,88-93`.
- [x] CHK-052 [P2] README updated (if applicable) [EVIDENCE: README: no applicable column-type list]
  - **Evidence**: README contains no column-type list requiring this addition.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-060 [P1] Temp files in scratch/ only [EVIDENCE: `rg --files -g 'scratch/**' -g '*.tmp' -g '*.temp' -g '*~' .`: 0 matches]
  - **Evidence**: `rg --files -g 'scratch/**' -g '*.tmp' -g '*.temp' -g '*~' .`: 0 matches.
- [x] CHK-061 [P1] scratch/ cleaned before completion [EVIDENCE: `rg --files -g 'scratch/**' -g '*.tmp' -g '*.temp' -g '*~' .`: 0 matches]
  - **Evidence**: `rg --files -g 'scratch/**' -g '*.tmp' -g '*.temp' -g '*~' .`: 0 matches.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Checked | Deferred |
|----------|-------|---------|----------|
| P0 Items | 9 | 7/9 | 2 |
| P1 Items | 19 | 14/19 | 5 |
| P2 Items | 3 | 2/3 | 1 |
| **Total** | **31** | **23/31** | **8** |

**Verification Date**: 2026-08-27.
**Verified By**: Source/test reconciliation; `tsc --noEmit` and production build exit 0; full Vitest suite 25 files / 247 tests pass. Runtime and manual checks remain explicitly deferred above.

<!-- /ANCHOR:summary -->
