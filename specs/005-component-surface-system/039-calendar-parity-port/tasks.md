---
title: "Tasks: Calendar Parity Port"
description: "Merge verified milestone/date wording into calendar-renderer.ts; no source calendar file to port."
trigger_phrases:
  - "039 tasks"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/039-calendar-parity-port"
    last_updated_at: "2026-09-02T23:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened; every task unticked"
    next_safe_action: "T1 — observe the missing completion branch as red"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-039"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Tasks: Calendar Parity Port

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

<!-- ANCHOR:notation -->
> `[ ]` open · `[x]` closed with its evidence named beneath it.
<!-- /ANCHOR:notation -->

<!-- ANCHOR:phase -->
## TASKS

- [ ] **T1** Observe today's non-distinction between a completed-row event and an incomplete-row
      event, before any edit — REQ-002.
      *Evidence to close:* a harness assertion against the real `calendar-renderer.ts` mount that
      confirms both render with identical styling today, recorded as the red baseline.
- [ ] **T2** Read the calendar event adapter's completion-aware build path in — REQ-002.
      *Evidence to close:* `calendar-renderer.ts:239-293` (and the week/day equivalents at
      `:619-681`, `:882-941`) reads the existing checkbox/status column value and applies a
      visually distinct treatment to a completed-row event, at all three scales.
- [ ] **T3** Carry the completion-aware marker into the backlog/unscheduled path — REQ-002.
      *Evidence to close:* `calendar-renderer.ts:157-180` reflects the same completion state for an
      unscheduled row that T2 established for a scheduled one.
- [ ] **T4** Header/date-scale wording carries the reference's day-label intent — REQ-003.
      *Evidence to close:* `calendar-renderer.ts:1701-1782` header copy compared against
      `GanttHeaderRenderer.ts:48-75` for wording intent; local header structure unchanged.
- [ ] **T5** Empty-state and backlog wording reads with calm density language — REQ-004.
      *Evidence to close:* `renderEmpty`/`EmptyStateRenderer.renderCard`
      (`calendar-renderer.ts:2478-2489`) and the backlog empty path (`:157-180`) copy updated and
      re-read from the rendered DOM.
- [ ] **T6** Re-confirm move/resize/quick-add survive the completion styling unchanged — REQ-005.
      *Evidence to close:* `:1033-1156`, `:1488-1542`, `:1558-1642`, `:2070-2088` re-exercised; the
      completion marker persists across a drag/resize cycle through `safeUpdateEventDates`
      (`:195-210`).
- [ ] **T7** Shared date-transaction seam documented, and landed only if it does not collide with
      `037` — REQ-006 (P1).
      *Evidence to close:* a read of whether `037-timeline-gantt-port` has already created a shared
      date-transaction module in this checkout; either adopted as a caller, or the seam is
      documented in `spec.md` with the module deferred.
- [ ] **T8** REQ-001 negative-evidence re-read against current disk state.
      *Evidence to close:* `types.ts:4-11`, `YamlHydrator.ts:51-76`, `ProjectView.ts:403-419`
      re-read and confirmed to match this packet's quoted line windows exactly.
- [ ] **T9** Screenshots recaptured and read.
      *Evidence to close:* every changed calendar PNG recaptured in full for its surface and opened
      by a human; `npm run screenshots:verify` exit 0 recorded alongside, not in place of, the read.
- [ ] **T10** `npm run gate` passes from the final state.
      *Evidence to close:* `gate: PASS`, exit 0, including the `css-lane` and `comments` lanes; any
      red lane's full log read from `tools/lane/gate-logs/<lane>.log`.
- [ ] **T11** Operator confirms on device.
      *Evidence to close:* the operator says a completed milestone reads as completed in the
      calendar. Nothing else closes this — only the operator does.
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION
Complete when T11 closes. Everything else is a precondition for asking.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES
- [`spec.md`](spec.md) · [`../036-obsidian-pm-ui-harvest/research/research.md`](../036-obsidian-pm-ui-harvest/research/research.md) §3 CALENDAR
<!-- /ANCHOR:cross-refs -->
