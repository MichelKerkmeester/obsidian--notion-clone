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
    last_updated_at: "2026-09-03T13:25:00Z"
    last_updated_by: "leg-b-verified"
    recent_action: "AC-1 to AC-5, AC-7 and AC-8 met and evidenced; AC-6 and AC-9 open"
    next_safe_action: "AC-6 — exercise a drag/resize cycle against the completion marker"
    blockers: []
    key_files:
      - "spec.md"
      - "goal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-039-ac"
      parent_session_id: null
    completion_pct: 82
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
| AC-1 | Completed-row vs incomplete-row calendar event styling, month/week/day | visually distinct | met — was identical; now `opacity 0.82` plus a `--text-success` strikethrough with the event's own colour intact (measured `border-left-color rgb(154, 52, 18)` completed vs `rgb(30, 58, 138)` incomplete) |
| AC-2 | Backlog/unscheduled marker completion state | matches AC-1's scheduled treatment | met — was undifferentiated; `is-completed` now comes from the same `isRowCompleted` helper (`calendar-renderer.ts:181`) and carries the done accent, background and strikethrough |
| AC-3 | Calendar header/date-scale wording vs `GanttHeaderRenderer.ts:48-75` intent | wording-intent parity, structure unchanged | met — weekend marking spans the weekday row, day cells, time headers, all-day buttons and columns; tint measured 4.3%/7.8% light and 5.5%/9.0% dark, was ~1.3-2.6%; header structure and nav unchanged |
| AC-4 | Empty-state / backlog copy density | reference's calm density language | met — was `No dated records`; now `No events` / `No date property` with a 144px desktop, 128px phone card and a `Nothing unscheduled.` backlog line, read from the rendered DOM and from four new captures |
| AC-5 | REQ-001 negative-evidence citations (`types.ts:4-11`, `YamlHydrator.ts:51-76`, `ProjectView.ts:403-419`) | re-read matches quoted line window exactly | met — re-read post-edit: `types.ts:8`, `YamlHydrator.ts:59-60`, `ProjectView.ts:400-411` all confirm table/gantt/kanban only |
| AC-6 | Move/resize/quick-add with completion styling applied | marker survives drag/resize cycle | OPEN — the styling now exists, and no run or test has exercised a drag/resize cycle against it (T6) |
| AC-7 | Shared date-transaction seam with `037` | documented, and landed only if no collision | met — `src/data/` holds no date-transaction module from `037`, so the seam stays documented in `spec.md` REQ-006 and none was created |
| AC-8 | `npm run gate` | exit 0, `gate: PASS`, including `css-lane` and `comments` | met — was 24 green with `screenshots-fresh` red; now `PASS — 25 green, 0 red`, exit 0, plain and under `SURFACE_PHASE` |
| AC-9 | Operator confirms completed milestone reads as completed on device | confirmed | unknown — **only the operator closes this** |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:evidence -->
## EVIDENCE STANDARD

Shipped, verified and operator-confirmed are three different things and only the third closes a
defect. A number or state is quoted with the command or file:line that produced it and the exit
code read directly, never through a pipe.
<!-- /ANCHOR:evidence -->
