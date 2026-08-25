---
title: "Implementation Summary: Title Open Affordance"
description: "Planned DatabaseView renderCell OPEN attach plus overlay lifecycle. Not yet implemented in the fork."
trigger_phrases:
  - "title open affordance summary"
  - "renderCell open"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/014-record-detail-panel/003-title-open-affordance"
    last_updated_at: "2026-08-25T21:20:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored title-open affordance child from synthesis ranks 1 and 5 and final-plan steps 5 and 7"
    next_safe_action: "Add DatabaseView renderCell attach plus overlay lifecycle hunks"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-title-open-affordance"
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
| **Spec Folder** | 003-title-open-affordance |
| **Completed** | Not yet (Planned) |
| **Level** | 1 |
| **Actual Effort** | Not started |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Nothing in the fork yet. This child is Planned: the `renderCell` attach and overlay lifecycle hunks so OPEN can ship without a stale peek after `refresh()`.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `spec.md` | Authored | Same-diff attach + overlay scope |
| `plan.md` | Authored | Insertion point and stale-DOM fix |
| `tasks.md` | Authored | T003–T004 atomic unit |
| `implementation-summary.md` | Authored | Honest pre-build record |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. Implementation is two hunks in `src/views/DatabaseView.ts` after children 001–002 exist.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Keep overlay lifecycle with `renderCell` attach | Final-plan: peek mounted from `renderCell` orphans on `refresh()` (`:10483-10488`) |
| Isolation is the same button as OPEN | Rank 5 is not a second control; sibling of `<a>`, no hover-link attr (`HoverLinkPreview.ts:8-17`) |
| Title-hidden fallback in the same hunk | `col.key === "file.name"` never runs when title is hidden (`CellRenderer.ts:117-118`) |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Hover OPEN vs title click vs Page Preview | Not run (Planned) |
| Title-hidden fallback | Not run (Planned) |
| Refresh/view-switch no orphan | Not run (Planned) |
| `validate.sh` on this folder `--strict` | Pending after authoring |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Mod+Enter is not this child.** Keyboard open is `004-peek-keyboard-open`.
2. **Table-only.** `renderCell` is wired from `TableRenderer.ts:586`; board/gallery are out.
<!-- /ANCHOR:limitations -->
