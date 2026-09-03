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
    last_updated_at: "2026-09-03T13:25:00Z"
    last_updated_by: "leg-b-verified"
    recent_action: "Leg b verified in-runtime: recapture read, gate PASS 25 green, lane released"
    next_safe_action: "T6 — re-exercise move/resize/quick-add against the completion marker"
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

- [x] **T1** Observe today's non-distinction between a completed-row event and an incomplete-row
      event, before any edit — REQ-002.
      *Evidence to close:* a harness assertion against the real `calendar-renderer.ts` mount that
      confirms both render with identical styling today, recorded as the red baseline.
      *Closed:* parity assertions at `src/views/calendar-renderer.test.ts:429-630` ran red before any
      renderer edit — `8 failed | 7 passed (15)` — failing exactly on the missing completion marker,
      weekend header, backlog empty line, and old empty-state copy.
- [x] **T2** Read the calendar event adapter's completion-aware build path in — REQ-002.
      *Evidence to close:* `calendar-renderer.ts:239-293` (and the week/day equivalents at
      `:619-681`, `:882-941`) reads the existing checkbox/status column value and applies a
      visually distinct treatment to a completed-row event, at all three scales.
      *Closed:* `isRowCompleted` at `calendar-renderer.ts:2420-2425` reads the view's checkbox column;
      `is-completed` applied to month segments (`:385`), month popover events (`:556`), week all-day
      segments (`:791`), all-day overflow events (`:865`), and timed events (`:992`); day scale shares
      the week paths.
- [x] **T3** Carry the completion-aware marker into the backlog/unscheduled path — REQ-002.
      *Evidence to close:* `calendar-renderer.ts:157-180` reflects the same completion state for an
      unscheduled row that T2 established for a scheduled one.
      *Closed:* backlog items carry `is-completed` from the same helper at `calendar-renderer.ts:181`.
- [x] **T4** Header/date-scale wording carries the reference's day-label intent — REQ-003.
      *Evidence to close:* `calendar-renderer.ts:1701-1782` header copy compared against
      `GanttHeaderRenderer.ts:48-75` for wording intent; local header structure unchanged.
      *Closed:* weekend marking follows the reference's weekend-header intent across the month weekday
      row (`:2072`), month day cells (`:345`), week/day time headers (`:700`), all-day date buttons
      (`:755`), all-day columns (`:741`), and time-grid columns (`:930`); header structure and nav
      controls unchanged.
- [x] **T5** Empty-state and backlog wording reads with calm density language — REQ-004.
      *Evidence to close:* `renderEmpty`/`EmptyStateRenderer.renderCard`
      (`calendar-renderer.ts:2478-2489`) and the backlog empty path (`:157-180`) copy updated and
      re-read from the rendered DOM.
      *Closed:* backlog empty line rendered at `calendar-renderer.ts:173-177` and re-read from the
      rendered DOM (`calendar-renderer.test.ts:611-622`); calm copy landed in all three locale blocks
      (`src/i18n.ts:118,1483-1486` en, `:1789,3130-3133` zh-CN, `:3450,4783-4786` zh-TW).
- [ ] **T6** Re-confirm move/resize/quick-add survive the completion styling unchanged — REQ-005.
      *Evidence to close:* `:1033-1156`, `:1488-1542`, `:1558-1642`, `:2070-2088` re-exercised; the
      completion marker persists across a drag/resize cycle through `safeUpdateEventDates`
      (`:195-210`).
- [x] **T7** Shared date-transaction seam documented, and landed only if it does not collide with
      `037` — REQ-006 (P1).
      *Evidence to close:* a read of whether `037-timeline-gantt-port` has already created a shared
      date-transaction module in this checkout; either adopted as a caller, or the seam is
      documented in `spec.md` with the module deferred.
      *Closed:* `src/data/` contains no date-transaction module (only `calendar-date-time.ts` /
      `date-time-format.ts`), so no shared module has landed from `037`; the seam stays documented in
      `spec.md` REQ-006 and no module is created, per the collision rule.
- [x] **T8** REQ-001 negative-evidence re-read against current disk state.
      *Evidence to close:* `types.ts:4-11`, `YamlHydrator.ts:51-76`, `ProjectView.ts:403-419`
      re-read and confirmed to match this packet's quoted line windows exactly.
      *Closed:* re-read — `types.ts:8` (`ViewMode = 'table' | 'gantt' | 'kanban'`),
      `YamlHydrator.ts:59-60` (valid modes table/gantt/kanban only), `ProjectView.ts:400-411`
      (switcher options table/gantt/board only) — all match the quoted windows; no source calendar
      module exists.
- [x] **T9** Screenshots recaptured and read.
      *Evidence to close:* every changed calendar PNG recaptured in full for its surface and opened
      by a human; `npm run screenshots:verify` exit 0 recorded alongside, not in place of, the read.
      *Closed:* was red — `screenshots-fresh` reported 12 calendar PNGs stale against
      `calendar-renderer.ts`. A full `npm run screenshots` run rewrote 260 captures; the 20 that moved
      were opened: `calendar-month-view` and `calendar-week-time-grid` (desktop+mobile, dark+light)
      show the completed "Q1 renewals sweep" still orange and "Spotify billing" still green, both
      struck through, weekend columns and headers tinted, the "Nothing unscheduled." line present and
      all five month weeks in frame (grid bottom y=789.5 in a 900px viewport); the four new
      `calendar-empty-state` PNGs show the "No date property" card with its calendar-plus glyph and
      action button at 144px desktop / 128px phone density; `calendar-mini-calendar` is byte-identical
      to HEAD (0 differing pixels). The eight timeline PNGs are capture-run noise — each differs from
      its HEAD copy by at most 7/255 on one channel across 0.01-0.34% of pixels, and all eight still
      show their lanes, bars, milestone diamond and today ruler. `npm run screenshots:verify` exit 0,
      260 entries match their sources.
- [x] **T10** `npm run gate` passes from the final state.
      *Evidence to close:* `gate: PASS`, exit 0, including the `css-lane` and `comments` lanes; any
      red lane's full log read from `tools/lane/gate-logs/<lane>.log`.
      *Closed:* was 24 green with `screenshots-fresh` red. From the final state `npm run gate` reads
      `gate: PASS — 25 green, 0 red for a declared reason`, exit 0 read from `$?`, both under
      `SURFACE_PHASE=039-calendar-parity-port` and plain; `css-lane` and `comments` are among the 25.
      `node tools/lane/check-lane.mjs` exit 0 — the release names all 20 changed captures.
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
