---
title: "Implementation Summary: Scheme Column Width"
description: "Shipped ColumnWidth measuring for scheme-hint cells, commits 30ce2ea + review fix a179b97 on branch impl, Sonnet-verified sound."
trigger_phrases:
  - "scheme column width summary"
  - "parseTextLink label"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields/004-scheme-column-width"
    last_updated_at: "2026-08-27T00:00:00Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Reconciled to shipped state: commits 30ce2ea + a179b97 (review fix) on branch impl, tsc0/build0/vitest green, Sonnet 5 review sound"
    next_safe_action: "None — sub-phase complete"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-scheme-column-width"
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
| **Spec Folder** | 004-scheme-column-width |
| **Completed** | 2026-08-25 (commits `30ce2ea` + `a179b97` on branch `impl`) |
| **Level** | 1 |
| **Actual Effort** | Shipped and Sonnet-verified sound |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Shipped on branch `impl` (commit `30ce2ea`, review fix `a179b97`): width measuring, so scheme-hint columns do not over-fit on assembled hrefs. `ColumnWidth.ts` now measures `isTextLinkScheme(col.textLinkScheme)` cells like link-mode labels (auto-width and wrap), matching the pre-existing `textRenderMode === "link"` / `parseTextLink` label path.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/ColumnWidth.ts` | Modified | Scheme-hint cells measure like link-mode labels (`:17-31,48,101-105`); review fix `a179b97` addressed concerns raised on first pass |
| `spec.md` | Reconciled | Status Planned → Complete |
| `implementation-summary.md` | Reconciled | This record — shipped-state evidence |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Delivered after child 001 (commit `74b836a`) exported `isTextLinkScheme`. Gated `tsc --noEmit` 0 / `npm run build` 0 / `npx vitest run` green, committed `30ce2ea`; an in-loop review found a concern, fixed and re-gated in `a179b97`; then independently Sonnet-verified as part of the parent phase review.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Size on the visible raw label, not the assembled href | Notion sizes on the visible value; link-mode already uses `parseTextLink` label (`:22-26`) |
| Own child, not part of 001 | Final-plan T013 is off the v1 EuroFormat diff; JSON-set hints still need this after 001 |
| Do not wait on the menu | Width is a renderer/measurer concern, not discoverability |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Manual auto-width on a hinted URL column | Confirmed via code trace (label-measure call sites); on-device manual measurement not separately performed |
| Link-mode / unhinted regression | **Confirmed unchanged** — `parseTextLink` label path untouched (Sonnet-traced) |
| `bash .opencode/skills/system-spec-kit/scripts/spec/validate.sh` on this folder `--strict` | Not run by this reconciliation pass (docs-only; see task scope) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Depends on child 001.** No `isTextLinkScheme` until the table same-diff lands.
2. **Does not add CSS.** `db-text-link` padding stays out of this phase unless a real tight hit-box appears later.
3. **Last child in this phase.** Copy / Visit and auto-detect stay parent out-of-scope.
<!-- /ANCHOR:limitations -->
