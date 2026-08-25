---
title: "Implementation Summary: Column Menu Scheme Picker"
description: "Planned column-menu picker for textLinkScheme. Not yet implemented in the fork."
trigger_phrases:
  - "column menu scheme picker summary"
  - "setTextLinkScheme"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields/003-column-menu-scheme-picker"
    last_updated_at: "2026-08-25T19:40:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored menu-picker child from synthesis rank 4 and final-plan T012"
    next_safe_action: "Implement ColumnMenu picker and setTextLinkScheme after the table same-diff child"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-column-menu-scheme-picker"
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
| **Spec Folder** | 003-column-menu-scheme-picker |
| **Completed** | Not yet (Planned) |
| **Level** | 1 |
| **Actual Effort** | Not started |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Nothing in the fork yet. This child is Planned: the menu picker is specified so discoverability is not mixed into the EuroFormat table same-diff (REQ-005 tension).

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `spec.md` | Authored | Menu-picker scope and requirements |
| `plan.md` | Authored | Popover + setter plan |
| `tasks.md` | Authored | T003–T004 atomic unit |
| `implementation-summary.md` | Authored | Honest pre-build record |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. Implementation follows `tasks.md` after child 001 lands the `ColumnDef` field.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Own child, not part of 001 | Synthesis: 4th/5th file vs 1–3 call-site budget (REQ-005) |
| Sibling field, not `textRenderMode` values | Extending that union breaks every switch, i18n key, and width measurer |
| Nested under the existing display popover | Fork already has `plain` / `link` / `markdown` at `ColumnMenu.ts:393-418` |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Manual set / clear from menu | Not run (Planned) |
| `types.ts:50` / `textRenderMode` union untouched | Not run (Planned) |
| `bash .opencode/skills/system-spec-kit/scripts/spec/validate.sh` on this folder `--strict` | Pending after authoring |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Depends on child 001.** No field to persist until the table same-diff lands.
2. **Does not require child 002.** Table-only rendering is enough for the picker to be useful.
3. **Width measuring** of scheme-hint columns is child 004.
<!-- /ANCHOR:limitations -->
