---
title: "Implementation Plan: Files Cover Wiring"
description: "Two renderCover one-liners skip files-column external images, both cover img tags get onerror, and getDefaultGalleryImageField auto-prefers files. CoverImage.ts stays locked."
trigger_phrases:
  - "files cover wiring plan"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Files Cover Wiring

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Existing `resolveCoverImage` / `galleryImageField` pipeline |
| **Storage** | None — display guard only |
| **Testing** | Manual gallery/board, network off |

### Overview
Cover guard is two one-liners, not a second pipeline. Reuse `parseCoverImage` / `resolveCoverImage`. First internal image in array order (Notion + AppFlowy).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 5, 8 and final-plan step 5 read.
- [x] Locked: do not edit `CoverImage.ts`; keep `IMAGE_TARGET_RE` conservative.

### Definition of Done
- [ ] Both `renderCover` sites skip `image.external` when type is `"files"`.
- [ ] Both cover `<img>` elements have `onerror` → `.is-empty`.
- [ ] Auto-prefer in `DatabaseView.ts:9599-9602`.
- [ ] `CoverImage.ts` clean.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Call-site guards around an unchanged shared parser.

### Key Components
- **Gallery**: `GalleryRenderer.ts:182,439-469`.
- **Board**: `BoardRenderer.ts:584,656-661`.
- **Default field**: `DatabaseView.ts:9599-9602`.

### Data Flow
Operator or auto-prefer sets `galleryImageField` / `boardImageField` to the files key. `resolveCoverImage` walks arrays (`CoverImage.ts:49-58`). This child rejects `external: true` when the column is `"files"`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producers: gallery/board `renderCover` plus `getDefaultGalleryImageField`. `CoverImage.ts` is unchanged on purpose. Algorithm invariant: files covers never use a network `src`; PDFs never match `IMAGE_TARGET_RE` (`CoverImage.ts:13`).
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read `CoverImage.ts:13,41-44,49-58` (do not edit), `GalleryRenderer.ts:182,439-469`, `BoardRenderer.ts:584,656-661`, `DatabaseView.ts:9599-9602`.

### Phase 2: Core Implementation
- [ ] External skip + `onerror` on gallery and board; auto-prefer files.

### Phase 3: Verification
- [ ] Offline gallery image; PDF placeholder; stale URL is not a network `<img>`.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None — two call-site branches | — |
| Integration | Gallery + board covers | Obsidian fork, network off |
| Manual | Image+PDFs, PDF-only, stale URL, HEIC onerror | Desktop |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 002 `"files"` type | Internal | Required | Guard cannot branch on type |
| Child 003 write-time strip | Internal | Helpful | Does not fix stale URLs; this child still required |
| `CoverImage.ts` (read-only) | Internal | Green | Must stay unmodified |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Network `<img>` from a files column, or `CoverImage.ts` was edited.
- **Procedure**: Revert gallery/board/DatabaseView insertions. Restore `CoverImage.ts` if it changed.
<!-- /ANCHOR:rollback -->
