---
title: "Implementation Summary: Row Menu Template Item"
description: "Shipped row-menu New-from-template twin plus DatabaseView getDatabaseConfig wiring, on branch impl, Sonnet-verified."
trigger_phrases:
  - "row menu template summary"
  - "getDatabaseConfig"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/013-template-toolbar-button/002-row-menu-template-item"
    last_updated_at: "2026-08-27T00:00:00Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Reconciled docs to shipped state: row-menu item + getDatabaseConfig wiring landed in commit f5ed81a"
    next_safe_action: "None — sub-phase complete"
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
| **Spec Folder** | 002-row-menu-template-item |
| **Completed** | 2026-08-26 (branch `impl`, commit `f5ed81a`) |
| **Level** | 1 |
| **Actual Effort** | Matches plan |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Shipped in commit `f5ed81a`: the row-menu twin (`RowMenu.ts:83-101`) inside the existing `!isReadOnly` + non-calendar/timeline guards, gated on `hasRecordTemplate`, wired at `DatabaseView.ts:569` via `getDatabaseConfig`. No double-create in either host.

Gate: `tsc --noEmit` exit 0; `vitest` 19 files / 194 tests pass (re-run at Sonnet 5 review time). Sonnet 5 review: "Both hosts' `createEntry` callbacks resolve to `guardedCreateEntry`/`guardedCalendarCreate` → `createBlankEntry`... the single shared create function, which 013's commits never modify."

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/RowMenu.ts` | Modified | Row-menu New-from-template twin, gated on `hasRecordTemplate` |
| `src/views/DatabaseView.ts` | Modified | `getDatabaseConfig: () => this.getActiveDb()` wiring on the RowMenu ctor |
| `spec.md` / `implementation-summary.md` | Reconciled | Docs updated to reflect shipped state (this pass) |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Delivered as commit `f5ed81a` against the live fork at `Obsidian Plugin/src` after child 1's module shipped, gated on `tsc --noEmit` + `npm run build` + `vitest` before commit. Independently verified read-only by Claude Sonnet 5 as part of the phase 013 review.
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
| Item present with template on table/board/gallery/list | Pass — verified by Sonnet 5 code trace, `RowMenu.ts:83-101` |
| Item absent with zero templates / calendar / timeline / read-only | Pass — gated on `hasRecordTemplate` inside existing guards |
| One `createEntry` per click | Pass — confirmed reuse of the single shared `createBlankEntry` chain, no bypass |
| `tsc0/build0/vitest 194/19 green` | Pass — commit `f5ed81a`, re-confirmed at Sonnet review time |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Toolbar discoverability is child 1.** This child does not retouch `ToolbarRenderer.ts` (commit `e158b0f`).
2. **Confirm is still deferred.** Recorded for child 3 / parent map; not injected here.
3. **Native menus are off.** `setUseNativeMenu(false)` (`RowMenu.ts:45`) is pre-existing; this child did not flip it.
<!-- /ANCHOR:limitations -->
