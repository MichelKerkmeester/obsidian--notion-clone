---
title: "Implementation Summary: Table Sub-group Picker"
description: "Shipped table-gated toolbar Sub-group child, on branch impl, Sonnet-verified."
trigger_phrases:
  - "table subgroup picker summary"
  - "populateGroupPopover"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/011-table-multi-group/004-table-subgroup-picker"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Reconciled docs to shipped state: table Sub-group picker landed in commit d26f517"
    next_safe_action: "None — sub-phase complete"
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
    completion_pct: 100
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
| **Completed** | 2026-08-26 (branch `impl`, commit `d26f517`) |
| **Level** | 1 |
| **Actual Effort** | Matches plan |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Shipped in commit `d26f517`: a table-gated Sub-group section in `populateGroupPopover` (`ToolbarRenderer.ts:1269-1479`), cloned from the board popover — not a `ViewConfigPanel` board-settings edit — with a candidate filter adding `!isComputedGroupField` on top of the board filter, and a write path (`DatabaseView.ts:2421-2432`) that mutates only when `viewType === "table"`.

Gate: `tsc --noEmit` exit 0; `vitest` 17 files / 181 tests pass (re-run at Sonnet review time, isolated worktree @ `d9e038c`). Sonnet 5 review: "Sub-group picker (`TableSubgroupPicker.ts`, `ToolbarRenderer.ts:1269-1479`) clones the board popover (not the dead-end table settings path), adds `!isComputedGroupField`, gated to table."

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/TableSubgroupPicker.ts` | Added | Table-gated Sub-group popover section |
| `src/views/ToolbarRenderer.ts` | Modified | Wires the picker into `populateGroupPopover` |
| `src/views/DatabaseView.ts` | Modified | `setGroupByField` gated to `viewType === "table"` |
| `spec.md` / `implementation-summary.md` | Reconciled | Docs updated to reflect shipped state (this pass) |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Delivered against the live fork at `Obsidian Plugin/src` after persist (child 001) and nested table render (child 002) shipped, gated on `tsc --noEmit` + `npm run build` + `vitest` before commit. Independently verified read-only by Claude Sonnet 5 as part of the phase 011 review.
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
| Table-only Sub-group | Pass — `DatabaseView.ts:2421-2432` mutates only when `viewType==="table"` (Sonnet 5 review) |
| Reload nest after pick | Pass — round-trip covered by `TableSubgroupPicker.test.ts` + `DataSource.test.ts` |
| `tsc0/build0/vitest 181/17 green` | Pass — commit `d26f517`, re-confirmed at Sonnet review `d9e038c` |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **No ViewConfigPanel table section.** Deferred; board-settings cannot host it.
2. **No second toolbar picker.** This child is the single Sub-group control.
3. **Board subgroup flags stay separate.** `groupByFields[]` is not unified with `boardSubgroupField`.
<!-- /ANCHOR:limitations -->
