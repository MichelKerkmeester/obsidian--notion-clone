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
    last_updated_at: "2026-09-03T10:40:00Z"
    last_updated_by: "leg-a-verified"
    recent_action: "Leg a verified: completion/weekend/empty-state landed; not committed"
    next_safe_action: "Observe renderMonth's missing completion branch as the red baseline for REQ-002"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-039-goal"
      parent_session_id: null
    completion_pct: 64
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

Five rows are closed with their evidence beneath them. The operator row is not, and only the
operator closes it.

- [x] **Completion-aware milestone treatment exists in month, week and day rendering (REQ-002).**
      Observable check: a calendar event whose row's checkbox/status column reads "done" renders
      visually distinct from one that does not, at all three scales. Red recorded by reading
      `calendar-renderer.ts:239-293`'s `renderMonth` build path before any edit — it consults no
      completion column today, confirmed while writing `spec.md` §1. Green recorded by the same
      read after the change, plus the new harness fixture this phase adds.
      *Closed:* observed red first — the parity block ran `8 failed | 7 passed (15)` against the
      unedited renderer, failing on the missing completion marker. `isRowCompleted`
      (`calendar-renderer.ts:2420-2425`) now drives `is-completed` on month
      segments, month popover events, week all-day segments, all-day overflow, timed events and
      backlog items; the treatment dims to `opacity 0.82` and strikes the title through in
      `--text-success`, leaving the event's own colour alone — measured `border-left-color`
      `rgb(154, 52, 18)` on the completed bar against `rgb(30, 58, 138)` on an incomplete one, and
      read in eight recaptured PNGs across month and week, desktop and phone, dark and light.
- [x] **Calendar header/date-scale wording carries the reference's day-label/weekend-header
      language intent (REQ-003).** Observable check: `calendar-renderer.ts:1701-1782`'s header
      copy compared against `GanttHeaderRenderer.ts:48-75` for wording intent, not visual form. Red
      recorded as today's exact header strings before the change; green as the updated strings
      plus a recaptured screenshot at `screenshots/views/calendar-*`.
      *Closed:* `is-weekend` marks the month weekday row, month day cells, week/day time headers,
      all-day date buttons, all-day columns and time-grid columns; header structure and nav controls
      are unchanged. The fill measures 4.3% on a light day cell and 7.8% on its header (5.5% and 9.0%
      dark) — it was ~1.3-2.6%, which read as no tint at all — and is legible in every recaptured
      calendar PNG.
- [x] **Empty-state and backlog wording reads with the reference's calm density language (REQ-004).**
      Observable check: `renderEmpty`/`EmptyStateRenderer.renderCard` (`calendar-renderer.ts:2478-2489`)
      and the backlog empty path (`:157-180`) compared before and after. Red recorded as today's
      copy; green as the updated copy read from the rendered DOM, not from source.
      *Closed:* observed red — the suite reported `expected 'No dated records' to be 'No events'`
      before the copy change. The backlog drawer now renders
      "Nothing unscheduled." instead of collapsing, and the empty card carries its own density
      (144px desktop, 128px phone) from a token on `.note-database-container`, which is where
      `renderEmpty()` builds the card. Read from the rendered DOM in `calendar-renderer.test.ts` and
      from four new `calendar-empty-state` captures.
- [x] **No source-calendar-module fabrication (REQ-001, negative-evidence discipline).** Observable
      check: every REQ-001 citation (`types.ts:4-11`, `YamlHydrator.ts:51-76`,
      `ProjectView.ts:403-419`) re-read against current disk state and matches this document's
      quoted line window exactly. Red/green is pass/fail on that re-read, recorded in
      `acceptance-criteria.md`.
      *Closed:* this row measures a property that already held, so its evidence is the named
      pre-fix state rather than a number that moved: the same three windows were read at spec-write
      time and matched, and this post-edit re-read against disk agrees — `types.ts:8` stops
      `ViewMode` at `table | gantt | kanban`,
      `YamlHydrator.ts:59-60` hydrates only those three, `ProjectView.ts:400-411` switches only among
      them. No source calendar module exists and none was invented.
- [x] **`npm run gate` passes from the final state**, including the `css-lane` and `comments`
      lanes, with the full output read from `tools/lane/gate-logs/`.
      *Closed:* was 24 green with `screenshots-fresh` red. Now `gate: PASS — 25 green, 0 red for a
      declared reason`, exit 0 read from `$?`, both under `SURFACE_PHASE=039-calendar-parity-port`
      and plain; `css-lane` and `comments` are among the 25.
- [ ] **Operator-only.** The operator confirms on device that a completed milestone reads as
      completed in the calendar, at whatever scale they open first. No artifact in this tree can
      close this row; only the operator's own confirmation does (parent goal D3).
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile section below; not part of the directive.

**LOG.** Leg b verified in-runtime 2026-09-03: the CSS treatment landed, 260 captures were rewritten
and the 20 that moved were opened, `npm run gate` reads PASS 25 green exit 0, and the `css-lane`
release names every changed capture. One fixture correction was made during that verification — the
month scenario had been pinning `--db-calendar-day-min-height` on each day cell; it now sits on the
`.db-calendar-month` wrapper, where `applyMonthSizingVars` writes it, with the same 112px result.
T6 and the operator row stay open.

**LOG.** Opened 2026-09-02 by the markdown agent from `036-obsidian-pm-ui-harvest`'s Final adoption
plan row 3 (`research/research.md` line 400) and §3 CALENDAR (lines 174-218). No iteration has run.
The baseline read confirming `renderMonth` has no completion branch was taken while writing `spec.md`
§1, at `calendar-renderer.ts:239-293`; that read is the observed-red evidence REQ-002's first
completion row cites, and it is a read, not a measurement run, so it is recorded here rather than in
an artifact file.
<!-- /ANCHOR:log -->
