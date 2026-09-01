---
title: "Tasks: Files Column Module"
description: "Ordered tasks to create FilesColumn.ts with normalize, edit serialize, resolve, classify, FILE_CHIP_CAP, and renderChips."
trigger_phrases:
  - "files column module tasks"
  - "filescolumn ts"
  - "renderchips"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/012-files-column/001-files-column-module"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Files Column Module

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

Cap, unresolved chips, classify, and optional thumbnails are **this module**, not later diffs.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read `src/data/EuroFormat.ts:1-42` (isolation header), `src/views/FileFieldRenderer.ts:73,111-122,124-141` (tooltip, dedupe, parse forms), and `src/data/CoverImage.ts:13-16,24` (`IMAGE_TARGET_RE`, `getFirstLinkpathDest`) at `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src` [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 Create `src/data/FilesColumn.ts` with: `normalize` (array + trim + drop URLs via `isExternalUrl` / `http(s):` + parse `[[target|label]]` / markdown / bare path like `FileFieldRenderer.ts:124-141` + dedupe-by-target `:111-122`; malformed → raw-text chip, never throw); `formatForEdit` / `parseEdit` (newline- or comma-separated `[[target]]`); `resolveFileTarget` (`getFirstLinkpathDest` at `CoverImage.ts:24`; null ⇒ unresolved); `classifyFileType` / `isImageTarget` (delegate to `CoverImage.ts:13-16`; do not widen HEIC/TIFF/ICO); `FILE_CHIP_CAP = 5`; `renderChips(parent, app, row, values)` — cap 5 + `+N`, tooltip all names (`FileFieldRenderer.ts:73`), `internal-link` + `is-unresolved` when dest is null, click → `openLinkText` or no-op. Do **not** call `renderFileLinkList`. No `fetch`, no CDN, no `adapter.exists`, no `electron`/`fs`. Precedent: `EuroFormat.ts:1-42` (`src/data/FilesColumn.ts`) [M]
- [ ] T003 Optional in-module thumbnails: `isImageTarget` + `getResourcePath` for image targets; type-icon + filename if new CSS would be required (text chips satisfy parent REQ-005) (`src/data/FilesColumn.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T004 Scratch cases: `[]`, one PDF, URL dropped, duplicate targets, dangling dest, 50+ names in tooltip (`src/data/FilesColumn.ts`) [S]
- [ ] T005 Grep the new module for `fetch` / `cdn` / `http` / `adapter.exists` / `electron` / `fs`; confirm `FileFieldRenderer.ts` / `FileFields.ts` / `CoverImage.ts` have no this-child diffs [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Module exists and grep is clean
- [ ] `FileFieldRenderer.ts` untouched
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 1, 6, 7, 11
- **Parent final-plan**: `../research/final-plan.md` step 2
<!-- /ANCHOR:cross-refs -->
