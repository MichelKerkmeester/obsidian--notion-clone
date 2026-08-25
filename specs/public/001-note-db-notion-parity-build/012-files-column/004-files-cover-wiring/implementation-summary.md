---
title: "Implementation Summary: Files Cover Wiring"
description: "Planned gallery/board files cover guards, onerror, and auto-prefer. Not yet implemented in the fork."
trigger_phrases:
  - "files cover wiring summary"
  - "gallery cover guard"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/012-files-column/004-files-cover-wiring"
    last_updated_at: "2026-08-25T21:20:00Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Summary

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 004-files-cover-wiring |
| **Completed** | Not yet (Planned) |
| **Level** | 1 |
| **Actual Effort** | Not started |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Nothing in the fork yet. This child is Planned: cover wiring is specified so a FilesColumn helper cannot sit unused while `renderCover` still feeds `image.external` to a network `<img>`.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `spec.md` | Authored | Cover-guard scope |
| `plan.md` | Authored | Two call-site one-liners |
| `tasks.md` | Authored | T002–T004 |
| `implementation-summary.md` | Authored | Honest pre-build record |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. Implementation follows `tasks.md` against the live fork at `Obsidian Plugin/src`.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Guard at `renderCover` call sites, not inside CoverImage | `CoverImage.ts` is locked; `parseCoverImage` happily sets `external: true` (`:41-44`) |
| `onerror` this phase | Cheap HEIC degrade without widening `IMAGE_TARGET_RE` (`CoverImage.ts:13`) |
| Auto-prefer `col.type === "files"` | Picker already lists every column (`ViewConfigPanelRenderer.ts:1456,1468-1471`) |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Offline gallery cover | Not run (Planned) |
| Stale URL not a network `<img>` | Not run (Planned) |
| `CoverImage.ts` clean | Not run (Planned) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Count badge is not this child.** Gallery “N attachments” stays deferred.
2. **Card-body stringify remains.** Do not pre-open `GalleryRenderer.renderValue` / `ListRenderer.renderValue`.
3. **WebKit mobile may still paint HEIC.** Chromium desktop must not hang; `onerror` covers that.
<!-- /ANCHOR:limitations -->
