---
title: "Feature Specification: Calendar Parity Port"
description: "obsidian-pm has no calendar view; this phase merges its verified date and milestone language into the existing calendar-renderer.ts, not a file port."
trigger_phrases:
  - "calendar parity port"
  - "039 calendar"
  - "calendar milestone language"
  - "no source calendar file"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/039-calendar-parity-port"
    last_updated_at: "2026-09-03T13:25:00Z"
    last_updated_by: "leg-b-verified"
    recent_action: "Leg b verified: CSS treatment, captures read, gate PASS 25 green"
    next_safe_action: "T6 — exercise move/resize/quick-add against the completion marker"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-039"
      parent_session_id: null
    completion_pct: 82
    open_questions:
      - "Whether the shared date-transaction module lands here or in 037, if both reach it first"
    answered_questions:
      - "obsidian-pm has no calendar view; ViewMode is table|gantt|kanban, confirmed at types.ts:4-11"
---
# Feature Specification: Calendar Parity Port

> Phase chain: parent [`../spec.md`](../spec.md). Source catalog:
> [`../036-obsidian-pm-ui-harvest/research/research.md`](../036-obsidian-pm-ui-harvest/research/research.md)
> §3 CALENDAR (lines 174-218) and "Final adoption plan (ordered)" row 3 (line 400).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 039-calendar-parity-port |
| **Level** | 2 — `recommend-level.sh --loc 1150 --files 9 --architectural` scores 65/100, confidence 82%. Phase score 20/50 stays below the 25 decomposition threshold, so this is a standard Level 2 child, not a further phase parent. |
| **Status** | In progress — leg a and leg b landed and verified in-runtime; `npm run gate` PASS 25 green. Open: T6 (drag/resize against the marker) and T11 (operator confirmation on device). |
| **Complexity** | 65/100, confidence 82% |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 1. PROBLEM

**obsidian-pm has no calendar view.** `specs/context/obsidian-pm-main/src/types.ts:4-11` defines
`ViewMode` as `table | gantt | kanban` only. `specs/context/obsidian-pm-main/src/store/YamlHydrator.ts:51-76`
hydrates saved views for exactly those three modes, and
`specs/context/obsidian-pm-main/src/views/ProjectView.ts:403-419` switches only among overview,
table, Gantt and board. Any claim that the reference ships a month/week/day calendar, event bars, or
calendar drag is a finding against the catalog, not a port target.

This phase is therefore **not a file port**. It is behavioral parity of date language,
completion-aware milestone treatment, density and empty states, merged into our existing
`src/views/calendar-renderer.ts`, which already builds month/week/day grids, quick-add,
move/resize, and keyboard/touch handling with no reference counterpart to copy from.

**The nearest verified date behavior in the reference** is milestone ordering:
`specs/context/obsidian-pm-main/src/views/ProjectOverviewView.ts:244-255` filters milestone tasks,
parses due dates, sorts by due date, and separates completed from next milestones. Gantt headers
supply shared date-scale wording
(`specs/context/obsidian-pm-main/src/views/gantt/GanttHeaderRenderer.ts:25-45,:48-75`), but that
evidence stays Gantt evidence, borrowed as language intent only.

**Local baseline read before this spec was written.** `src/views/calendar-renderer.ts:239-293`
(`renderMonth`) builds `model.days` from `buildCalendarMonthModel` and renders every day's events
with no branch on row completion state — a checkbox or status column value already exists on
`RowData` and is already read elsewhere for coloring (`src/data/calendar-timeline-model.ts:729`,
`:1062`), but `renderMonth` does not consult it. This is the observed red this phase's first check
must record before any edit.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 2. SCOPE

### In Scope — the catalog's calendar module-map rows

Each row below cites the reference `file:line` this phase must not exceed, and the local host file
the merge lands in. Source: `036-obsidian-pm-ui-harvest/research/research.md` lines 207-214.

| # | Reference (negative or informing evidence) | Local host | What merges |
|---|---|---|---|
| 1 | `types.ts:4-11` — modes stop at table/gantt/kanban | `calendar-renderer.ts:75-92` — local calendar action contract | Negative evidence only; the local renderer is the host, not a source port (REQ-001). |
| 2 | `YamlHydrator.ts:51-76` — hydrate saved table/gantt/kanban views | `calendar-renderer.ts:239-276` — build month model/grid | Extend local view/config persistence only where product config already requires it; do not invent source calendar config (REQ-001). |
| 3 | `ProjectView.ts:403-419` — overview/table/Gantt/board switcher | `calendar-renderer.ts:619-681` — week/day host | Local calendar selection stays local; no source switcher to adopt (REQ-001). |
| 4 | `ProjectOverviewView.ts:244-255` — filter/sort milestone due dates | `calendar-renderer.ts:239-293` — month anchor/today/grid | Rewrite completion-aware milestone ordering into the local event adapter (REQ-002). |
| 5 | `GanttHeaderRenderer.ts:48-75` — day labels/weekend headers | `calendar-renderer.ts:1701-1782` — local calendar headers/navigation | Borrow date-language intent; retain local month/week/day headers (REQ-003). |
| 6 | `types.ts:4-11` — no source calendar drag contract | `calendar-renderer.ts:1033-1156` — month resize/move preview | Negative evidence; local pointer implementation is unchanged (REQ-005). |
| 7 | `types.ts:4-11` — no source calendar keyboard/touch contract | `calendar-keyboard-navigation.ts:1-130` — grid navigation | Local implementation; source does not substantiate a copy (REQ-005). |
| 8 | `ProjectOverviewView.ts:244-284` — done/next milestone timeline | `calendar-renderer.ts:157-180` — backlog/unscheduled path | Adapt marker/empty semantics; keep the local backlog (REQ-002, REQ-004). |

**Shared date transaction.** The catalog names one cross-surface seam: "Share the date transaction
helper with timeline where practical" (research.md:201). The local optimistic-write-with-rollback
pattern already exists at `calendar-renderer.ts:195-210` (`safeUpdateEventDates`), the calendar side
of the seam this phase and `037-timeline-gantt-port` both touch. REQ-006 documents and, where it can
land without colliding with 037's own file creation, aligns this shape (P1, not a blocker).

### Out of Scope

- **The do-not-borrow list**: table view, bottom sheets, formulas/rollups/summaries/calcs stay ours
  (`036-obsidian-pm-ui-harvest/research/research.md` lines 404-419). Nothing in this phase touches
  those systems.
- **Porting a source calendar file.** None exists. Any code review finding a "ported calendar file"
  claim is a defect in this phase, not a completion.
- **Timeline, board, subtask, and shared-UI ports.** Those are `037-timeline-gantt-port`,
  `038-board-kanban-port`, `040-subtask-tree-port`, and `041-shared-ui-ux-port`, each gating
  independently.
- **Unilaterally creating a new shared date-transaction module file** if `037` already created one
  for the same purpose in a concurrent session — see REQ-006 and the risk row below.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `src/views/calendar-renderer.ts` | Modify | Completion-aware event build, header/date-language wording, empty-state density (REQ-002 to REQ-004) |
| `src/data/calendar-timeline-model.ts` | Modify | Read the existing checkbox/status column value into the calendar event adapter (REQ-002) |
| `src/data/calendar-date-transaction.ts` | Create (P1, conditional) | Shared date-write helper seam, only if it does not collide with a module `037` creates first (REQ-006) |
| `styles.css` | Modify | Density and empty-state wording tokens, under the styles.css lane protocol (REQ-003, REQ-004) |
| `tools/live/calendar-*.json` or equivalent gate fixture | Create/Modify | Harness recording the completion-aware and density checks red-before-green |
| `screenshots/views/calendar-*` | Modify | Recaptured after the density/empty-state and milestone changes |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 3. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | No source calendar module is invented or copied. Every negative-evidence row (module-map rows 1-3, 6-7) stays cited to `types.ts:4-11`, `YamlHydrator.ts:51-76`, and `ProjectView.ts:403-419`; the local `calendar-renderer.ts:75-92` action contract remains the host and is extended, not replaced. |
| REQ-002 | A calendar event backed by a completed row (existing checkbox/status column) receives a visually distinct, completion-aware treatment in month, week, and day rendering, rewriting `ProjectOverviewView.ts:244-255`'s due-date parse/sort/complete-vs-next separation into the local event adapter at `calendar-renderer.ts:239-293` (and the week/day equivalents at `:619-681`, `:882-941`), and into the backlog/unscheduled marker at `:157-180`. |
| REQ-003 | Calendar headers and navigation at `calendar-renderer.ts:1701-1782` adopt the reference's day-label/weekend-header date-scale wording intent (`GanttHeaderRenderer.ts:48-75`) without adopting a Gantt-only visual form; local month/week/day header structure and nav controls are unchanged in shape. |
| REQ-004 | Empty-state and backlog wording move toward the reference's calm density language at the local `renderEmpty`/`EmptyStateRenderer.renderCard` seam (`calendar-renderer.ts:2478-2489`) and the backlog empty path (`:157-180`), keeping the local `EmptyStateRenderer` component and its existing reasons (`no-date-field`, `no-events`). |
| REQ-005 | Local month/week/day layout, multi-day segments, overflow/backlog (`:304-359`), timed slots (`:619-681`, `:882-941`), quick-add (`:1488-1542`), move/resize (`:1033-1156`, `:1558-1642`, `:2070-2088`), keyboard grid (`calendar-keyboard-navigation.ts:1-130`), touch behavior, invalid-event repair, and the source action contract (`:75-92`) behave exactly as observed at spec time except where REQ-002 to REQ-004 require touching the event-build or header/empty-state seams. |
| REQ-007 | No spec path, phase number, task id or requirement id appears in any code comment this phase writes (Comment Hygiene HARD BLOCK). Every disposition in this phase's module-map rows is `rewrite`; no verbatim reference code or CSS is copied, so no MIT notice is required under the catalog's Copy/rewrite/drop policy (`research.md` lines 369-377). |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-006 | The local optimistic-write-with-rollback pattern (`safeUpdateEventDates`, `calendar-renderer.ts:195-210`) is documented against the reference's release-once-on-drag-end pattern (cited in the catalog's timeline row, `GanttDragHandler.ts:48-58`) as the calendar side of a shared date-transaction seam with `037-timeline-gantt-port`. If a shared module can land without colliding with a module `037` creates independently for the same purpose, it lands under `src/data/`; otherwise this phase records the seam and defers the extraction, and REQ-006 is met by the documentation alone. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 4. SUCCESS CRITERIA

- **SC-001**: A milestone-carrying calendar event's completion state is visually distinguishable in
  month, week, and day scales, where today it is not (observed red at `calendar-renderer.ts:239-293`).
- **SC-002**: Calendar header/date-scale wording reads with the reference's day-label/weekend
  language intent, with local header structure unchanged.
- **SC-003**: Empty-state and backlog wording reads with the reference's calm density language,
  through the existing `EmptyStateRenderer` seam.
- **SC-004**: No requirement in this phase depends on a source calendar file that does not exist;
  every REQ-001 citation resolves to the exact line window quoted.
- **SC-005**: `npm run gate` passes from the final state, including the `css-lane` and `comments`
  lanes.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 5. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `036-obsidian-pm-ui-harvest/research/research.md` staying accurate | A stale citation propagates a false claim into product code | Re-read cited lines against current disk state before relying on them, per `036`'s own spot-check discipline |
| Risk | `037-timeline-gantt-port` runs concurrently and creates its own date-transaction module | Two packets land conflicting files for the same seam | REQ-006 makes the shared module conditional; documentation-only satisfies the requirement if collision risk is live |
| Risk | Completion-aware treatment invents a visual language the reference does not substantiate for calendar specifically (only for the overview milestone list) | Over-claiming reference fidelity | REQ-002 is scoped to "adapts" the reference's ordering behavior, not a visual copy; the reference has no calendar UI to copy visually |
| Risk | `styles.css` lane held by another packet at the same time | Blocked density/empty-state edit | Acquire the lane per `tools/lane/css-lane.json` before editing; release only after a recapture that is read |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Completion-aware event styling adds no additional pass over `rows`; it reads the
  existing per-row column value already fetched by the event adapter.

### Security
- **NFR-S01**: No code from `obsidian-pm-main` lands without its MIT notice; not applicable here
  since every disposition in this phase is `rewrite` (REQ-007).

### Reliability
- **NFR-R01**: `safeUpdateEventDates`'s existing rollback-on-failure behavior is preserved exactly;
  REQ-006 documents, it does not modify, that failure path unless the shared module lands.
<!-- /ANCHOR:nfr -->

---

## L2: EDGE CASES

### Data Boundaries
- A calendar event with no checkbox/status column configured on its view: falls back to today's
  undifferentiated treatment; REQ-002 does not require a column that is not configured.
- A milestone due date that parses to an invalid date: uses the existing invalid-event repair path
  (`calendar-renderer.ts` invalid-event seam), unchanged by REQ-005.

### Error Scenarios
- `037-timeline-gantt-port` lands a shared date-transaction module before this phase's REQ-006 step
  runs: this phase reads that module, does not duplicate it, and REQ-006 is met by adopting it
  instead of creating a second one.
- `styles.css` lane is held elsewhere when REQ-003/REQ-004 need it: this phase blocks on that edit
  and reports it rather than working around the lane.

## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| LOC | 35/100 | 900-1,400 LOC estimate per the catalog (`research.md` line 216) |
| Files | 10/100 | 9 files estimated: renderer, model, optional shared module, styles, harness, screenshots |
| Architectural | 20/100 | Merges into an existing renderer; no new surface |
| **Total** | **65/100** | **Level 2** |
