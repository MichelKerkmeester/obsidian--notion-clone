---
title: "Task Breakdown: Screenshot Coverage Expansion"
description: "Task breakdown for closing the screenshot coverage gap in three effort tiers: the surfaces the harness can already photograph, the calendar and timeline geometry stand-ins, and the interaction-state fixtures."
trigger_phrases:
  - "coverage expansion tasks"
  - "screenshot coverage task breakdown"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "004-component-screenshot-system/004-coverage-expansion"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Broke the coverage expansion into three effort tiers"
    next_safe_action: "Start with the surfaces needing no new harness stand-ins"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "screenshot-system-004"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Task Breakdown: Screenshot Coverage Expansion

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Notation | Meaning | Time Estimate |
|---|---|---|
| `[S]` | Small task | < 30 minutes |
| `[M]` | Medium task | 30–90 minutes |
| `[L]` | Large task | > 90 minutes |
| `- [ ]` | Incomplete task (unstarted) | — |
| `- [/]` | In progress task | — |
| `- [x]` | Completed task | — |

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 [S] Confirm the renderer file behind each uncaptured surface exists, so every new `sources` list is accurate from the start (REQ-008)
- [ ] T002 [M] Read the class names each new fixture will use from the renderer that emits them, rather than inferring them from `styles.css` (REQ-001 through REQ-006)
- [ ] T003 [M] Review the 12 calendar and 23 timeline geometry properties in `tools/screenshots/runtime-vars.css` against what the plugin measures at runtime, and note which current values are placeholders rather than plausible layout (REQ-009, REQ-010, REQ-011)
- [ ] T004 [S] Locate the state classes for drag feedback, selection perimeter and conditional formatting in the renderers that apply them (REQ-013, REQ-014, REQ-015)

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### Tier 1 — surfaces the harness can already photograph

- [ ] T005 [M] Register a `record-detail-panel` scenario with the panel header, a populated property list and the empty-properties accordion, naming `src/views/RecordDetailPanel.ts` (REQ-001)
- [ ] T006 [M] Register a `table-record-peek` scenario rendering the peek over a table context, naming `src/views/TableRecordPeek.ts` (REQ-002)
- [ ] T007 [M] Register a `filter-panel` scenario with a rule row, the conjunction control and the add-rule affordance, naming `src/views/FilterPanelRenderer.ts` (REQ-003)
- [ ] T008 [M] Register a `sort-panel` scenario with two sort rules, their direction controls and drag handles, naming `src/views/SortPanelRenderer.ts` (REQ-004)
- [ ] T009 [M] Register a `toolbar` scenario with the view tab strip, an active tab, the search field and the control cluster, naming `src/views/ToolbarRenderer.ts` (REQ-005)
- [ ] T010 [M] Register a `board-swimlanes` scenario with a horizontal lane spanning the primary columns, its collapsible header and counts, naming `src/views/BoardRenderer.ts` (REQ-006)
- [ ] T011 [S] Run `npm run screenshots` and look at the six new pairs before moving on (REQ-007)

### Tier 2 — geometry stand-ins

- [ ] T012 [L] Set the calendar geometry properties to values that resolve into a plausible month grid — column width, row height, day-cell minimum height, month week height — each with a comment stating what the running plugin would have measured (REQ-009, REQ-016)
- [ ] T013 [M] Register a `calendar-month` scenario with day cells, a multi-day event band and a `+N` overflow indicator, naming `src/views/CalendarRenderer.ts` (REQ-009)
- [ ] T014 [L] Set the week time-grid properties — all-day rows, day count, segment lane, span and start, week grid height — so an event segment lands at a sensible position (REQ-010, REQ-016)
- [ ] T015 [M] Register a `calendar-week` scenario with the all-day row, hour ruler, a positioned event segment and the current-time line, positioned from a fixed offset rather than the clock (REQ-010)
- [ ] T016 [L] Set the timeline geometry properties — unit count, unit width, row height, group column width, event rows, band start and span, tick and today offsets (REQ-011, REQ-016)
- [ ] T017 [M] Register a `timeline-view` scenario with the group column, unit ruler, two bands on distinct rows and the today marker, naming `src/views/CalendarTimelineRenderer.ts` (REQ-011)
- [ ] T018 [M] Register a `mobile-bottom-sheet` scenario at a phone-width viewport with the sheet handle, header and content, naming `src/views/PopoverPosition.ts` (REQ-012)
- [ ] T019 [M] Run `npm run screenshots` and look at every Tier 2 capture, confirming day cells have height, segments are positioned and bands are not stacked at the origin (REQ-009, REQ-010, REQ-011, REQ-012)

### Tier 3 — interaction states

- [ ] T020 [M] Register a `drag-states` scenario rendering a row or card mid-drag with its drop indicator line, using the state classes the drag path applies (REQ-013)
- [ ] T021 [M] Register a `selection-states` scenario with a contiguous cell selection, its bounding perimeter, the corner fill handle and the selection action bar (REQ-014)
- [ ] T022 [M] Register a `conditional-formatting` scenario exercising the `--db-conditional-format-*` properties with a tinted background, readable foreground and left accent indicator, naming `src/data/ConditionalFormatting.ts` (REQ-015)
- [ ] T023 [S] Run `npm run screenshots` and compare each state capture against its resting counterpart (REQ-013, REQ-014, REQ-015)

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T024 [L] For each new scenario, edit every file it names in turn and confirm `npm run screenshots:verify` names exactly that scenario's captures, then revert (REQ-008)
- [ ] T025 [S] Confirm `npm run screenshots:verify` reports nothing under `NEVER CAPTURED` (REQ-007)
- [ ] T026 [S] Confirm the regenerated `screenshots/README.md` lists every registered scenario and that the capture count is twice the scenario count (REQ-017)
- [ ] T027 [S] Confirm every geometry value added in this phase carries a comment stating what it stands in for (REQ-016)

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] T028 [S] Run TypeScript compiler type-check verification `npx tsc --noEmit`
- [ ] T029 [S] Run Vitest unit test suite `npx vitest run`
- [ ] T030 [S] Run production bundle build `npm run build`
- [ ] T031 [S] Run the freshness gate `npm run screenshots:verify` and confirm exit 0
- [ ] T032 [M] Look at every new capture against the running plugin — the only check that catches a geometry value resolving to an empty box

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

| Requirement | Description | Tasks |
|---|---|---|
| REQ-001 | The record detail panel is photographed | T002, T005, T011 |
| REQ-002 | The table record peek is photographed | T002, T006, T011 |
| REQ-003 | The filter panel is photographed | T002, T007, T011 |
| REQ-004 | The sort panel is photographed | T002, T008, T011 |
| REQ-005 | The toolbar and view switcher are photographed | T002, T009, T011 |
| REQ-006 | Grouped and swimlane boards are photographed | T002, T010, T011 |
| REQ-007 | Every new scenario is captured, not merely registered | T011, T019, T023, T025 |
| REQ-008 | Every new scenario declares an accurate source list | T001, T024 |
| REQ-009 | The calendar month view is photographed | T003, T012, T013, T019 |
| REQ-010 | The calendar week time grid is photographed | T003, T014, T015, T019 |
| REQ-011 | The timeline view is photographed | T003, T016, T017, T019 |
| REQ-012 | Mobile and bottom-sheet layouts are photographed | T018, T019 |
| REQ-013 | Drag feedback is photographed | T004, T020, T023 |
| REQ-014 | Selection state is photographed | T004, T021, T023 |
| REQ-015 | Conditional formatting is photographed | T004, T022, T023 |
| REQ-016 | New geometry stand-ins are recorded with their reasoning | T012, T014, T016, T027 |
| REQ-017 | Coverage is stated rather than implied | T026 |

<!-- /ANCHOR:cross-refs -->
