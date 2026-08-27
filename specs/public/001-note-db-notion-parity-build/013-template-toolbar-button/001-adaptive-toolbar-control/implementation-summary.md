---
title: "Implementation Summary: Adaptive Toolbar Control"
description: "Shipped isolated TemplateToolbarAction.ts plus toolbar host, on branch impl, Sonnet-verified."
trigger_phrases:
  - "adaptive toolbar summary"
  - "template toolbar action"
  - "renderNewButton"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/013-template-toolbar-button/001-adaptive-toolbar-control"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Completion docs reconciled to shipped state; gate green; Sonnet-verified"
    next_safe_action: "None — sub-phase complete"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-adaptive-toolbar-control"
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
| **Spec Folder** | 001-adaptive-toolbar-control |
| **Completed** | 2026-08-26 (branch `impl`, commit `e158b0f`) |
| **Level** | 1 |
| **Actual Effort** | Matches plan |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Shipped in commit `e158b0f`: `src/data/TemplateToolbarAction.ts` with `hasRecordTemplate`, `getNewFromTemplateLabel`, `getNewFromTemplateTooltip`, and `executeNewFromTemplate`, plus the adaptive toolbar host at `ToolbarRenderer.ts:1716-1738` — `hasTemplate` toggles `file-plus-2`/"New from template" vs `plus`/"New", with phone-density icon-only when a template is set (`aria-label`/`title` keep the full string). `executeNewFromTemplate` is the single `createEntry()` caller.

Gate: `tsc --noEmit` exit 0; `vitest` 19 files / 194 tests pass (re-run at Sonnet 5 review time). Sonnet 5 review confirmed by code trace: "control stays rendered/reachable with zero templates (REQ-001/SC-005)."

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/data/TemplateToolbarAction.ts` | Added | Isolated decision module: `hasRecordTemplate`, label/tooltip helpers, `executeNewFromTemplate` |
| `src/views/ToolbarRenderer.ts` | Modified | Adaptive toolbar New control (label/icon/tooltip, phone icon-only) |
| `src/i18n.ts` | Modified | `toolbar.newFromTemplate`, `toolbar.newFromTemplateTooltip`, `menu.newFromTemplate` in en/zh-CN/zh-TW |
| `spec.md` / `implementation-summary.md` | Reconciled | Docs updated to reflect shipped state (this pass) |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Delivered as commit `e158b0f` against the live fork at `Obsidian Plugin/src`, gated on `tsc --noEmit` + `npm run build` + `vitest` before commit. Independently verified read-only by Claude Sonnet 5 as part of the phase 013 review.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Keep module, i18n, tooltip, and phone icon-only in this child | Final-plan folds T009 tooltip and T027 phone-density into the toolbar call site; shipping the longer label onto `:236` and `:282` without `isPhoneLayout()` (`:285-287`) overflows |
| Module is the only `createEntry` caller | Synthesis step 4 plus final-plan correctness trap: host-then-module writes two notes |
| Confirm stays disabled (`confirmEnabled: false`) | REQ-004 deferred; overlay guard (`DatabaseView.ts:845-850`) is the double-click backstop |
| Tooltip is the full vault path | That is the `newRecordTemplate.path` config key (`types.ts:154-157`) |
| Export `menu.newFromTemplate` now | Child 2 must not retouch i18n |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Desktop adaptive label plus path tooltip | Pass — Sonnet 5 code trace, `ToolbarRenderer.ts:1716-1738` |
| Phone icon-only | Pass — verified by code trace; icon-only only when a template is set on phone, `aria-label`/`title` keep the full string |
| One `createEntry` per click | Pass — single `createEntry()` call confirmed |
| `tsc0/build0/vitest 194/19 green` | Pass — commit `e158b0f`, re-confirmed at Sonnet review time |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Row-menu is not this child.** `hasRecordTemplate` and `menu.newFromTemplate` exist so child 2 can consume them (commit `f5ed81a`).
2. **REQ-004 confirm is deferred.** The module still branches on `confirmed !== true` so a later inject cannot regress the string-result trap; confirm disabled at both call sites.
3. **Zero-template toolbar stays labeled New.** Spec REQ-001; the row-menu empty state is a later child.
<!-- /ANCHOR:limitations -->
