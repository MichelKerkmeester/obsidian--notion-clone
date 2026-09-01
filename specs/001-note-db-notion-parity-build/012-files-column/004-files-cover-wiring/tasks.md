---
title: "Tasks: Files Cover Wiring"
description: "Ordered tasks for gallery/board files cover external skip, onerror placeholders, and auto-prefer files."
trigger_phrases:
  - "files cover wiring tasks"
  - "gallery cover guard"
  - "board cover onerror"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/012-files-column/004-files-cover-wiring"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Files Cover Wiring

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

Do **not** edit `CoverImage.ts`.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read `src/data/CoverImage.ts:13,41-44,49-58` (locked), `src/views/GalleryRenderer.ts:182,439-469`, `src/views/BoardRenderer.ts:584,656-661`, `src/views/DatabaseView.ts:9599-9602` [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 After `resolveCoverImage(...)`, if cover column type is `"files"` and `image.external`, behave as `!image` (`.is-empty` `:443-447`). Add the guard at `src/views/GalleryRenderer.ts:442`. Add `<img> onerror` → `.is-empty` at `:468` (`src/views/GalleryRenderer.ts`) [S]
- [ ] T003 Same external skip at `src/views/BoardRenderer.ts:661` and `onerror` on the board cover `<img>` (empty path `:662-665`) (`src/views/BoardRenderer.ts`) [S]
- [ ] T004 Auto-prefer: `|| col.type === "files"` in `getDefaultGalleryImageField` (`src/views/DatabaseView.ts:9599-9602`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Gallery with image + Sales PDFs, network off, shows the image; PDF-only slot is placeholder; a hand-edited URL does not become a network `<img>`; `CoverImage.ts` clean [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Both cover sites guarded
- [ ] `CoverImage.ts` untouched
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 5, 8
- **Parent final-plan**: `../research/final-plan.md` step 5
<!-- /ANCHOR:cross-refs -->
