---
title: "Acceptance Criteria: Sheet Lifecycle Ownership"
description: "What must be observed, with the number each reads today."
trigger_phrases: ["031 acceptance criteria"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/031-sheet-lifecycle-ownership"
    last_updated_at: "2026-09-02T19:30:00Z"
    last_updated_by: "report-29-second-mechanism"
    recent_action: "AC-8 met on the bench; AC-9 opened; one proposal refuted"
    next_safe_action: "The operator long-presses a row on iOS and looks behind the menu"
    blockers: []
    key_files: ["spec.md", "goal.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-031-ac"
      parent_session_id: null
    completion_pct: 83
    open_questions: []
    answered_questions: ["A criterion without a failing number is a wish, not a criterion"]
---
# Acceptance Criteria: Sheet Lifecycle Ownership

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

---

<!-- ANCHOR:criteria -->
## CRITERIA

Each row states what is measured, the threshold, and **the number it reads today**. A criterion
whose control has not been observed failing is not met, however green it looks.

| ID | Measured | Threshold | Today |
|----|----------|-----------|-------|
| AC-1 | Scrim and sheet nodes on `document.body` after closing each sheet family | 0 and 0 | Scrim survives on every panel family; two panels leave the sheet too |
| AC-2 | The parity check's own discrimination | Passes for the owned menu, **fails** for panel families before the fix | Untested — this is the control, and a check green everywhere beforehand must be rebuilt |
| AC-3 | Group sheet drag distance after a toggle re-render | 120px drag dismisses | 0.0px, handle absent |
| AC-4 | `overlayStack.dismissPanel(panel, "programmatic")` on a phone view sheet | returns true | returns false |
| AC-5 | Sheets drawing a handle with no drag attached | 0 | 16 |
| AC-6 | A short fast flick | dismisses | springs back at 96px distance-only |
| AC-7 | Operator opens and closes each sheet on device | no lock-up | unknown — **only the operator closes this** |
| AC-8 | The target's tap handler after a completed long press | receives nothing | **was** `["mousedown", "click"]` — the row's tap ran on top of the menu; now `[]` |
| AC-9 | Operator long-presses a row on iOS and looks behind the menu | no record sheet | unknown — **only the operator closes this** |
<!-- /ANCHOR:criteria -->

<!-- ANCHOR:refuted -->
## REFUTED, AND WHY IT IS NOT A CRITERION

A proposed criterion — *two registered sheets, one closes correctly, the backdrop goes when the last
live sheet leaves; was `scrimsLeft: 1`, now 0* — was **not** added. The sheet it calls stale is
classed and still on the body, which makes it an open sheet, and holding the backdrop up for an open
sheet is this packet's recorded correct behaviour. Ticking it would re-import the inverted assertion
the compounding case already had once. The reasoning and its three observations are in `goal.md`'s
2026-09-02 second-mechanism entry.
<!-- /ANCHOR:refuted -->

---

<!-- ANCHOR:evidence -->
## EVIDENCE STANDARD

Shipped, verified and operator-confirmed are three different things and only the third closes a
defect. A number is quoted with the command that produced it and the exit code read directly, never
through a pipe.
<!-- /ANCHOR:evidence -->
