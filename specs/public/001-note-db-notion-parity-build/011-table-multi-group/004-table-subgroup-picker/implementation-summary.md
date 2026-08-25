---
title: "Implementation Summary: Table Sub-group Picker"
description: "Planned table-gated toolbar Sub-group child. Not yet implemented in the fork."
trigger_phrases:
  - "table subgroup picker summary"
  - "populateGroupPopover"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/011-table-multi-group/004-table-subgroup-picker"
    last_updated_at: "2026-08-25T20:50:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored table Sub-group picker child from synthesis and final-plan"
    next_safe_action: "Clone renderBoardSubgroupSection behind table view type"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-table-subgroup-picker"
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
| **Spec Folder** | 004-table-subgroup-picker |
| **Completed** | Not yet (Planned) |
| **Level** | 1 |
| **Actual Effort** | Not started |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Nothing in the fork yet. This child is Planned: the Notion-facing Sub-group control is specified as a table-gated toolbar clone, not a ViewConfigPanel board-settings edit that tables never enter.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `spec.md` | Authored | Picker scope and writer rules |
| `plan.md` | Authored | Toolbar clone approach |
| `tasks.md` | Authored | T003–T004 |
| `implementation-summary.md` | Authored | Honest pre-build record |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. Implementation follows `tasks.md` after persist and nested table render exist.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Host in `populateGroupPopover`, not `renderBoardSettings` | Table views never enter board settings (`ViewConfigPanelRenderer.ts:313-317, 329`) |
| Picker max 2 | Notion has no third level; compute stays unbounded in the module |
| Keep `vs().groupByField = primary` | Toolbar and `getActiveGroupField` (`DatabaseView.ts:2890-2894`) stay consistent |
| Extra computed filter on table candidates | Board `:1462` only excludes `file.name` + primary |
| Do not reuse `undo.boardSubgroupConfig` | That string is board-specific (`ViewConfigPanelRenderer.ts:1586`) |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Table-only Sub-group | Not run (Planned) |
| Reload nest after pick | Not run (Planned) |
| `bash .opencode/skills/system-spec-kit/scripts/spec/validate.sh` on this folder `--strict` | Pending after authoring |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **No ViewConfigPanel table section.** Deferred; board-settings cannot host it.
2. **No second toolbar picker.** This child is the single Sub-group control.
3. **Board subgroup flags stay separate.** `groupByFields[]` is not unified with `boardSubgroupField`.
<!-- /ANCHOR:limitations -->
