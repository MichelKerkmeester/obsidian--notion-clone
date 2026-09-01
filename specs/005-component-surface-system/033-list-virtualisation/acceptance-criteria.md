---
title: "Acceptance Criteria: List Virtualisation"
description: "What must be observed, with the number each reads today."
trigger_phrases: ["033 acceptance criteria"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/033-list-virtualisation"
    last_updated_at: "2026-08-31T17:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Acceptance criteria added; Level 2 requires them and they were missing"
    next_safe_action: "Reproduce the inherited timings before relying on them"
    blockers: []
    key_files: ["spec.md", "goal.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-033-ac"
      parent_session_id: null
    completion_pct: 83
    open_questions: []
    answered_questions: ["A criterion without a failing number is a wish, not a criterion"]
---
# Acceptance Criteria: List Virtualisation

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

---

<!-- ANCHOR:criteria -->
## CRITERIA

Each row states what is measured, the threshold, and **the number it reads today**. A criterion
whose control has not been observed failing is not met, however green it looks.

| ID | Measured | Threshold | Today |
|----|----------|-----------|-------|
| AC-1 | Blocked main thread at 3,000 rows, 21 cols, full fill, 6x throttle | < 2,000ms | 4,908.6ms **(inherited figure, no artifact — reproduce first)** |
| AC-2 | DOM nodes as row count grows | sub-linear | linear: 225,007 at 3,000 rows |
| AC-3 | Row drag on an **off-window** row | behaves as recorded pre-windowing | untested; assumes every row exists |
| AC-4 | Range selection across the window boundary | behaves as recorded pre-windowing | untested; same assumption |
| AC-5 | Group collapse with off-window members | behaves as recorded pre-windowing | untested; same assumption |
| AC-6 | Scroll offset across a window recycle | stable | not applicable yet |
| AC-7 | Scaling verdict, measured past 3,200 rows | LINEAR | LINEAR x1.06 |
| AC-8 | Operator opens their real database | no stall | unknown — **only the operator closes this** |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:evidence -->
## EVIDENCE STANDARD

Shipped, verified and operator-confirmed are three different things and only the third closes a
defect. A number is quoted with the command that produced it and the exit code read directly, never
through a pipe.
<!-- /ANCHOR:evidence -->
