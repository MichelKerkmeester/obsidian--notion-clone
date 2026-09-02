---
title: "Goal: Calendar Parity Port"
description: "obsidian-pm has no calendar; merge its verified date and milestone language into calendar-renderer.ts, and the criteria that decide when it is done."
trigger_phrases:
  - "039 goal"
  - "calendar parity goal"
  - "calendar milestone completion goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/039-calendar-parity-port"
    last_updated_at: "2026-09-02T23:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened from 036's Final adoption plan row 3; nothing has run"
    next_safe_action: "Observe renderMonth's missing completion branch as the red baseline for REQ-002"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-039-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Whether the shared date-transaction module lands here or in 037"
    answered_questions:
      - "obsidian-pm has no calendar view; ViewMode is table|gantt|kanban, confirmed at types.ts:4-11"
---
# Goal: Calendar Parity Port

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Merge obsidian-pm's verified date and milestone language into the existing
`src/views/calendar-renderer.ts` host. There is no reference calendar file to port — `types.ts:4-11`
stops `ViewMode` at `table | gantt | kanban` — so this phase is behavioral parity, not a file port.

**What "done" means here differs from a normal port packet.** Every other packet in the adoption
plan (`037`, `038`, `040`, `041`) rewrites a source module into a local one. This phase has no
source module. It rewrites source *behavior* — milestone completion ordering, date-scale header
wording, empty-state density — into a renderer that already exists and already does more than the
reference does (month/week/day scales, quick-add, move/resize, keyboard/touch grids the reference
never had to build).

### Decisions

| ID | Decision |
|----|----------|
| D1 | The absence of a source calendar module is itself the finding, cited three times over (`types.ts:4-11`, `YamlHydrator.ts:51-76`, `ProjectView.ts:403-419`). Treating any of those as "the calendar to port" is a defect, not a discovery. |
| D2 | Every borrowed item is behavior, not code. Disposition is `rewrite` for all eight module-map rows; `copy-verbatim-with-MIT-notice` is not used anywhere in this phase (catalog Copy/rewrite/drop policy, `research.md` lines 369-377). |
| D3 | Shipped, verified and operator-confirmed are three states; only the third closes a row (parent goal D3). A milestone visually distinguished in a screenshot is shipped, not confirmed, until the operator reads it on device. |
| D6 (local) | The shared date-transaction seam with `037-timeline-gantt-port` is documentation-first. This phase does not assume ownership of a shared module; it documents the seam and lands the module only if doing so does not collide with `037`'s own concurrent write. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

Every row below is unticked. Nothing in this phase has run.

- [ ] **Completion-aware milestone treatment exists in month, week and day rendering (REQ-002).**
      Observable check: a calendar event whose row's checkbox/status column reads "done" renders
      visually distinct from one that does not, at all three scales. Red recorded by reading
      `calendar-renderer.ts:239-293`'s `renderMonth` build path before any edit — it consults no
      completion column today, confirmed while writing `spec.md` §1. Green recorded by the same
      read after the change, plus the new harness fixture this phase adds.
- [ ] **Calendar header/date-scale wording carries the reference's day-label/weekend-header
      language intent (REQ-003).** Observable check: `calendar-renderer.ts:1701-1782`'s header
      copy compared against `GanttHeaderRenderer.ts:48-75` for wording intent, not visual form. Red
      recorded as today's exact header strings before the change; green as the updated strings
      plus a recaptured screenshot at `screenshots/views/calendar-*`.
- [ ] **Empty-state and backlog wording reads with the reference's calm density language (REQ-004).**
      Observable check: `renderEmpty`/`EmptyStateRenderer.renderCard` (`calendar-renderer.ts:2478-2489`)
      and the backlog empty path (`:157-180`) compared before and after. Red recorded as today's
      copy; green as the updated copy read from the rendered DOM, not from source.
- [ ] **No source-calendar-module fabrication (REQ-001, negative-evidence discipline).** Observable
      check: every REQ-001 citation (`types.ts:4-11`, `YamlHydrator.ts:51-76`,
      `ProjectView.ts:403-419`) re-read against current disk state and matches this document's
      quoted line window exactly. Red/green is pass/fail on that re-read, recorded in
      `acceptance-criteria.md`.
- [ ] **`npm run gate` passes from the final state**, including the `css-lane` and `comments`
      lanes, with the full output read from `tools/lane/gate-logs/`.
- [ ] **Operator-only.** The operator confirms on device that a completed milestone reads as
      completed in the calendar, at whatever scale they open first. No artifact in this tree can
      close this row; only the operator's own confirmation does (parent goal D3).
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile section below; not part of the directive.

**LOG.** Opened 2026-09-02 by the markdown agent from `036-obsidian-pm-ui-harvest`'s Final adoption
plan row 3 (`research/research.md` line 400) and §3 CALENDAR (lines 174-218). No iteration has run.
The baseline read confirming `renderMonth` has no completion branch was taken while writing `spec.md`
§1, at `calendar-renderer.ts:239-293`; that read is the observed-red evidence REQ-002's first
completion row cites, and it is a read, not a measurement run, so it is recorded here rather than in
an artifact file.
<!-- /ANCHOR:log -->
