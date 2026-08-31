---
title: "Acceptance Criteria: Sheet Lifecycle Ownership"
description: "What must be observed, with the number each reads today."
trigger_phrases: ["031 acceptance criteria"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/031-sheet-lifecycle-ownership"
    last_updated_at: "2026-08-31T17:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Acceptance criteria added; Level 2 requires them and they were missing"
    next_safe_action: "Build the producer-parity check and observe it failing"
    blockers: []
    key_files: ["spec.md", "goal.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-031-ac"
      parent_session_id: null
    completion_pct: 0
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
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:evidence -->
## EVIDENCE STANDARD

Shipped, verified and operator-confirmed are three different things and only the third closes a
defect. A number is quoted with the command that produced it and the exit code read directly, never
through a pipe.
<!-- /ANCHOR:evidence -->
