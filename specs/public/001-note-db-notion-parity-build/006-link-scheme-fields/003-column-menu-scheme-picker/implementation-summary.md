---
title: "Implementation Summary: Column Menu Scheme Picker"
description: "Shipped column-menu picker for textLinkScheme, commit c3d3a01 on branch impl; Sonnet found the picker labels hardcoded English (P1), fixed via i18n in commit 29d7b14."
trigger_phrases:
  - "column menu scheme picker summary"
  - "setTextLinkScheme"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields/003-column-menu-scheme-picker"
    last_updated_at: "2026-08-27T00:00:00Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Reconciled to shipped state: commit c3d3a01 + i18n fix 29d7b14 on branch impl, tsc0/build0/vitest green"
    next_safe_action: "None — sub-phase complete"
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
| **Spec Folder** | 003-column-menu-scheme-picker |
| **Completed** | 2026-08-25 (commit `c3d3a01`; i18n fix `29d7b14`, both on branch `impl`) |
| **Level** | 1 |
| **Actual Effort** | Shipped; one P1 finding fixed |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Shipped on branch `impl` (commit `c3d3a01`): the menu picker, kept out of the EuroFormat table same-diff (REQ-005 tension) as designed. `ColumnMenu.ts` gained a "Link scheme" section under the existing display popover (`https`/`Email`/`Phone`/`None`), and `DatabaseView.ts` gained `setTextLinkScheme` beside `setTextRenderMode`.

A fresh Claude Sonnet 5 review found a confirmed P1: the new picker labels (`"HTTPS"`/`"Email"`/`"Phone"`/`"None"`, `ColumnMenu.ts:419,423-430`) were raw literals, not routed through `t()` — a regression against the immediately preceding `textRenderMode` section in the same function, which correctly used `t()`. This was fixed in commit `29d7b14`: labels now route through `t()`, with keys added to all 3 locales (en/zh-Hans/zh-Hant).

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/ColumnMenu.ts` | Modified | Scheme choices under the existing display popover (`:133-150,393-418`); labels localized via `t()` in fix `29d7b14` |
| `src/views/DatabaseView.ts` | Modified | `setTextLinkScheme` beside `setTextRenderMode` (`:5104-5110`) |
| `src/i18n.ts` | Modified (fix `29d7b14`) | Link-scheme picker label keys in en / zh-Hans / zh-Hant |
| `spec.md` | Reconciled | Status Planned → Complete |
| `implementation-summary.md` | Reconciled | This record — shipped-state evidence plus the i18n fix |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Delivered after child 001 (commit `74b836a`) landed the `ColumnDef` field. Gated `tsc --noEmit` 0 / `npm run build` 0 / `npx vitest run` green, committed `c3d3a01`. The parent-phase Sonnet review found the hardcoded-label P1; fixed and re-gated in the packet-wide fix stage (`29d7b14`).
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
| Manual set / clear from menu | Confirmed via code trace (setter wiring, config round-trip); on-device manual click not separately performed |
| `types.ts:50` / `textRenderMode` union untouched | **Confirmed untouched** (Sonnet-traced) |
| Picker labels localized | **Fixed and confirmed** — `t()` routing added in `29d7b14`, keys present in all 3 locales |
| `bash .opencode/skills/system-spec-kit/scripts/spec/validate.sh` on this folder `--strict` | Not run by this reconciliation pass (docs-only; see task scope) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Depends on child 001.** No field to persist until the table same-diff lands.
2. **Does not require child 002.** Table-only rendering is enough for the picker to be useful.
3. **Width measuring** of scheme-hint columns is child 004.
<!-- /ANCHOR:limitations -->
