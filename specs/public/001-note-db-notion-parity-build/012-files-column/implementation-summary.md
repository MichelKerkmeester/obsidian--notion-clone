---
title: "Implementation Summary"
description: "Shipped status for the Files/media column phase: built, gate-green, Sonnet-verified PASS on branch impl."
trigger_phrases:
  - "implementation summary"
  - "files column"
  - "scaffold"
  - "not yet implemented"
  - "gallery cover"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/012-files-column"
    last_updated_at: "2026-08-28T10:54:50.251Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Corrected unsupported checklist claims against the shipped code"
    next_safe_action: "Re-run the packet gate after the next code change"
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
    completion_pct: 61
    open_questions: []
    answered_questions: []
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 012-files-column |
| **Completed** | 2026-08-26 (branch `impl`) |
| **Level** | 2 |
| **Actual Effort** | ≈2h 15m, matching `plan.md` estimate |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

Shipped on branch `impl` (commits `b97ee1e..f84a193`): a first-class Files/Attachments column (13th `ColumnDef["type"]`) backed by the isolated `src/data/FilesColumn.ts` module — vault wikilink `string[]` storage, normalize/format/parse, `renderChips` with a 5-chip cap, dangling-link handling — registered across the column type union/labels/icon/pickers/i18n, dispatched via a `CellRenderer.ts` `case "files"` + `startEdit` branch, and wired into the gallery/board cover pipeline with an external-URL guard.

Gate: `tsc --noEmit` exit 0; `vitest` 19 files / 194 tests pass (re-run at Sonnet 5 review time). Independently verified by a fresh, read-only Claude Sonnet 5 review (2026-08-26, hunter/skeptic/referee adversarial self-check): **PASS** — vault-local safety fully traced (no `fetch`/`electron`/`fs`/`adapter` anywhere in the module or `CoverWiring.ts`), write-time URL strip confirmed, and the cover guard confirmed wired at both `GalleryRenderer.ts` and `BoardRenderer.ts` call sites.

Built on Luna-via-cursor after the Codex OpenAI executor's quota died mid-run (see synthesis.md §3); sub-phase `004-files-cover-wiring` first shipped a dead, unwired cover-guard helper, caught by the in-loop DeepSeek review and fixed in the same-sub-phase commit `f84a193` before the phase was marked done.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/data/FilesColumn.ts` | Added | Isolated module: normalize, `formatForEdit`/`parseEdit`, classify, resolve, `renderChips`, chip cap |
| `src/data/CoverWiring.ts` | Added | Cover-guard predicate wiring for gallery/board |
| `src/data/types.ts`, `src/data/ColumnTypes.ts` | Modified | `"files"` as 13th column type, labels, `isColumnType`, default `[]` |
| `src/views/PropertyTypeIcon.ts` | Modified | `files` icon name (tsc-forced completeness) |
| `src/views/CellRenderer.ts` | Modified | `case "files"` render, `normalizeCellValueForSave` write gate, `startEdit` branch |
| `src/views/ColumnMenu.ts`, `src/views/modals/CreatePropertyModal.ts` | Modified | Add-column / change-type picker lists |
| `src/i18n.ts` | Modified | `columnType.files` in en/zh-CN/zh-TW |
| `src/data/PropertyTypeConflict.ts` | Modified | `files → multitext` mapping |
| `src/views/GalleryRenderer.ts`, `src/views/BoardRenderer.ts` | Modified | Cover guard skips `image.external` for `"files"` columns; `onerror` placeholder |
| `src/views/DatabaseView.ts` | Modified | Auto-prefer `col.type === "files"` for gallery cover field |
| `specs/public/001-note-db-notion-parity-build/012-files-column/{spec,plan,tasks,checklist,implementation-summary}.md` | Reconciled | Docs updated to reflect shipped state (this pass) |

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Built serially through sub-phases 001-004 (module → type registry → cell dispatch → cover wiring), each gated on `tsc --noEmit` + `npm run build` + `vitest` before commit, with an in-loop DeepSeek review per sub-phase during the build. Verified read-only by a fresh Claude Sonnet 5 review (2026-08-26) after the phase completed. A follow-up commit (`bd8e467`, 2026-08-26, after this phase's own Sonnet review) extracted the cover guard into a pure `isCoverImageBlocked()` and added the dedicated regression test the review flagged as missing (P1 below).

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Store files as vault wikilink `string[]` | MIT-forkable, mobile-safe, no binary handling |
| Vault-local only — never fetch Notion CDN URLs | Avoids network dependency and iCloud duplication |
| CoverImage parser derives gallery covers from the column's image files | Matches Notion gallery behavior without remote media |
| New isolated module + ≤3 call-site edits (EuroFormat model) | Clean `git rebase` onto upstream |
| Effort M, value 3, wave 5, `depends_on: none` | Roadmap ranking for this phase |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

| Test Type | Status | Coverage | Notes |
|-----------|--------|----------|-------|
| Typecheck | Pass | Whole fork | `tsc --noEmit` exit 0 (re-run at Sonnet review time) |
| Build | Pass | Whole fork | `npm run build` exit 0 |
| Vitest | Pass | 19 files / 194 tests | `FilesColumn.test.ts`, `CoverImage.test.ts` cover round-trip, dispatch, cover safety |
| Manual desktop | Verified by code trace | Gallery covers + Sales PDFs | Sonnet 5 review: cover guard traced at both `GalleryRenderer.ts:445-446` and `BoardRenderer.ts:664-665` |
| Manual mobile | Not independently re-run | Files rendering + inline edit | No `electron`/`fs`/Node in the module (grep-clean); design carries the existing `is-inline-overlay` pattern |
| Rebase dry-run / diff shape | Pass | Diff shape | Sonnet 5 review: scoped to the new module/tests/`CoverWiring.ts` + insertion-only edits; `CoverImage.ts`/`FileFields.ts`/`FileFieldRenderer.ts`/`ListRenderer.ts` untouched |

### Test Coverage Summary

| File | Statements | Branches | Functions |
|------|------------|----------|-----------|
| `FilesColumn.ts` | Covered (`FilesColumn.test.ts`) | Covered — empty/URL-drop/dedupe/malformed | Covered |
| Cover guard (`GalleryRenderer.ts`/`BoardRenderer.ts`) | No dedicated test at phase completion | — | Gap closed post-phase by `bd8e467` (`CoverImage.test.ts`, `isCoverImageBlocked()`) |

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| NFR ID | Target | Actual | Status |
|--------|--------|--------|--------|
| NFR-P01 | Responsive files rendering | Wikilinks resolve once per cell via `metadataCache.getFirstLinkpathDest`, no per-frame vault scans | Pass |
| NFR-S01 | Vault-local, no secrets | Confirmed — grep-zero for `fetch`/`electron`/`fs`/`adapter` in the module and `CoverWiring.ts` | Pass |
| NFR-R01 | Dangling wikilinks render safely | Confirmed by code trace — `is-unresolved` chip, no throw | Pass |
| NFR-M01 | Mobile-safe (no desktop-only APIs) | Confirmed — no `electron`/`fs`/Node in the module | Pass |

<!-- /ANCHOR:nfr-verify -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

1. Files are wikilinks to vault files, not embedded binaries; iCloud offline files render according to vault availability.
2. CoverImage covers image files only; a PDF in the cover slot falls back to the placeholder chip.
3. **Cover-guard test gap at phase completion** (Sonnet 5 P1): the external-image guard in `GalleryRenderer`/`BoardRenderer` had zero automated coverage despite being the single most safety-relevant conditional in the phase — caught only by manual review during the build (sub-phase 004 first shipped a dead unwired helper, fixed same-commit). Closed post-phase by `bd8e467` (`isCoverImageBlocked()` + `CoverImage.test.ts`).
4. `db-file-link-type-*`/overflow/thumbnail/label CSS hook classes have no rules yet (P2 cosmetic no-op, per Sonnet 5 review) — no file-type visual differentiation.

<!-- /ANCHOR:limitations -->
---

<!-- ANCHOR:deviations -->
## Deviations from Plan

| Planned | Actual | Reason |
|---------|--------|--------|
| Build the FilesColumn module and render case | Built as planned across 4 sub-phase commits | Matches estimate |
| Codex-executor build throughout | Codex OpenAI quota died mid-run; rebuilt on Luna-via-cursor | Executor swap, documented in `synthesis.md` §3 |
| Cover-guard regression test in the same sub-phase as the guard | Test landed one day later, in packet-wide follow-up `bd8e467` | Sonnet 5 review flagged the gap as P1 post-phase; fixed same-day |

<!-- /ANCHOR:deviations -->
