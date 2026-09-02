---
title: "Acceptance Criteria: Calendar Parity Port"
description: "What must be observed, with the number or state each reads today."
trigger_phrases:
  - "039 acceptance criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/039-calendar-parity-port"
    last_updated_at: "2026-09-02T23:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Criteria drafted alongside spec; nothing verified yet"
    next_safe_action: "AC-1 — observe today's non-distinction as the red baseline"
    blockers: []
    key_files:
      - "spec.md"
      - "goal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-039-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Calendar Parity Port

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

---

<!-- ANCHOR:criteria -->
## CRITERIA

Each row states what is measured, the threshold, and **the state it reads today**. A criterion
whose control has not been observed failing is not met, however green it looks.

| ID | Measured | Threshold | Today |
|----|----------|-----------|-------|
| AC-1 | Completed-row vs incomplete-row calendar event styling, month/week/day | visually distinct | identical — `renderMonth` (`calendar-renderer.ts:239-293`) consults no completion column |
| AC-2 | Backlog/unscheduled marker completion state | matches AC-1's scheduled treatment | undifferentiated — `:157-180` has no completion branch |
| AC-3 | Calendar header/date-scale wording vs `GanttHeaderRenderer.ts:48-75` intent | wording-intent parity, structure unchanged | today's header strings unread against the reference; not yet compared |
| AC-4 | Empty-state / backlog copy density | reference's calm density language | today's copy, unread against the reference; not yet compared |
| AC-5 | REQ-001 negative-evidence citations (`types.ts:4-11`, `YamlHydrator.ts:51-76`, `ProjectView.ts:403-419`) | re-read matches quoted line window exactly | matched at spec-write time; not yet re-read post-edit |
| AC-6 | Move/resize/quick-add with completion styling applied | marker survives drag/resize cycle | not applicable yet — styling does not exist |
| AC-7 | Shared date-transaction seam with `037` | documented, and landed only if no collision | not started; `037` status unknown at spec time |
| AC-8 | `npm run gate` | exit 0, `gate: PASS`, including `css-lane` and `comments` | not run |
| AC-9 | Operator confirms completed milestone reads as completed on device | confirmed | unknown — **only the operator closes this** |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:evidence -->
## EVIDENCE STANDARD

Shipped, verified and operator-confirmed are three different things and only the third closes a
defect. A number or state is quoted with the command or file:line that produced it and the exit
code read directly, never through a pipe.
<!-- /ANCHOR:evidence -->
