---
title: "Implementation Summary: Row Menu Template Item"
description: "Planned row-menu New-from-template twin plus DatabaseView getDatabaseConfig wiring. Not yet implemented in the fork."
trigger_phrases:
  - "row menu template summary"
  - "getDatabaseConfig"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/013-template-toolbar-button/002-row-menu-template-item"
    last_updated_at: "2026-08-25T21:20:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored row-menu-template-item child from synthesis rank 2 and final-plan steps 5-6"
    next_safe_action: "Add the RowMenu item and DatabaseView getDatabaseConfig wiring"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-row-menu-template-item"
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
| **Spec Folder** | 002-row-menu-template-item |
| **Completed** | Not yet (Planned) |
| **Level** | 1 |
| **Actual Effort** | Not started |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Nothing in the fork yet. This child is Planned: the row-menu twin is specified so it cannot appear as a blank **New** next to insert above/below, and so DatabaseView cannot wire `ViewConfig` where `DatabaseConfig.newRecordTemplate` lives.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `spec.md` | Authored | Gated row-menu item plus ctor wiring |
| `plan.md` | Authored | Call sites 2 and 3 |
| `tasks.md` | Authored | T002–T003 shippable slice |
| `implementation-summary.md` | Authored | Honest pre-build record |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. Implementation follows `tasks.md` after child 1's module exists.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Hide the item when no template is set | Final-plan: insert above/below already create; a no-arg `createEntry?.()` is a worse duplicate. Toolbar still satisfies zero-template REQ-001 |
| Wire `getActiveDb()`, not `getConfig()` | `newRecordTemplate` is on `DatabaseConfig` (`types.ts:279`), not `ViewConfig` (`DatabaseView.ts:794-796`) |
| Keep confirm disabled | Same deferred REQ-004 as child 1; overlay guard stays the backstop |
| No insert `position` | This is not insert-above/below (`RowMenu.ts:58-74`) |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Item present with template on table/board/gallery/list | Not run (Planned) |
| Item absent with zero templates / calendar / timeline / read-only | Not run (Planned) |
| One `createEntry` per click | Not run (Planned) |
| `bash .opencode/skills/system-spec-kit/scripts/spec/validate.sh` on this folder `--strict` | Pending after authoring |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Toolbar discoverability is child 1.** This child does not retouch `ToolbarRenderer.ts`.
2. **Confirm is still deferred.** Recorded for child 3 / parent map; not injected here.
3. **Native menus are off.** `setUseNativeMenu(false)` (`RowMenu.ts:45`) is pre-existing; this child must not flip it.
<!-- /ANCHOR:limitations -->
