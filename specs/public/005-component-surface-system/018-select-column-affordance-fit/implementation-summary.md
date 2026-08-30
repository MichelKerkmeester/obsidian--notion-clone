---
title: "Implementation Summary: Select Column Affordance Fit"
description: "What landed for the select column's two controls, under whose lane hold, and what has not been measured."
trigger_phrases:
  - "018 implementation summary"
  - "select column summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/018-select-column-affordance-fit"
    last_updated_at: "2026-08-30T11:00:00Z"
    last_updated_by: "roadmap-reconciliation"
    recent_action: "Opened for code that landed before this folder existed"
    next_safe_action: "Run the listed verification"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-018"
      parent_session_id: null
    completion_pct: 60
    open_questions: []
    answered_questions: []
---
# Implementation Summary: Select Column Affordance Fit

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Status** | In Progress — code landed, verification outstanding |
| **Completed** | Not complete |
| **Level** | 1 |
| **Landed under** | `004-checkbox-ownership`'s `styles.css` lane hold, 2026-08-30T08:05:18Z |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Three stylesheet changes and one harness check, all landed before this phase folder existed.

1. **`display` removed from the touch-floor block**, the floor kept. That block had been asserting
   `display: inline-flex` at the same specificity as, and later in the file than, the `display: none`
   written for the non-phone case — so a minimum-size rule was deciding visibility and painting a
   phone-only control, unstyled, into every desktop list and gallery row.
2. **The select column re-derived.** Its comment recorded `48 = button 24 + checkbox 16 + gap 8`.
   Both controls had since grown to 28px for the touch floor, and two 28px controls do not fit in
   48px at any gap. New sum: `4 + 28 + 4 + 28 = 64`, matched in the touch branch.
3. **The phone pin taken 6px to 4px** and the phone button declared at the 28px it had been painting.
4. **An overlap check** in `tools/storybook/verify-placement.mjs`, built from `overlapResults`.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Under another phase's lane hold, with no spec and no acceptance criteria. This folder was opened
afterwards to give the work an owner. `004`'s lane acquire note names the task, so it was not hidden;
`004`'s thirteen criteria simply never covered it.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| Widen the column rather than shrink the controls | Both controls sit at 28px to clear a touch floor an earlier phase established. Shrinking either reopens that. |
| Keep the touch floor, remove only `display` from its block | The floor is correct; carrying `display` was the fault. A block should decide one thing. |
| Open this phase rather than fold the work into `004` | A lane hold is permission to edit a file, not a scope grant. `004` measures checkbox appearance; this is column geometry. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

**None performed by this phase.** The numbers in `acceptance-criteria.md` are copied from the lane
journal, marked recorded-not-reproduced, and no negative control has been run for either edit.

Outstanding: re-run `npm run storybook:placement`; observe the check red with each edit reverted in
turn; recapture once the lane frees; ask the operator.
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

- The 64px column is measured only in the touch branch. Whether it survives the operator's density
  setting is an open question in `spec.md`.
- The overlap check was written by the lane holder, not by this phase. Until it has been seen red it
  is a check this phase cannot cite.
- No recapture has been taken, so no PNG shows the wider column.
<!-- /ANCHOR:limitations -->
