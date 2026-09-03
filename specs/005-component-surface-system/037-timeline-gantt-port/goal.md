---
title: "Goal: Timeline/Gantt Port"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "timeline gantt port goal"
  - "037 goal"
  - "037 timeline gantt port directive"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/037-timeline-gantt-port"
    last_updated_at: "2026-09-03T08:30:00Z"
    last_updated_by: "leg-b-landed"
    recent_action: "Landed gantt port in 0262386+55bff9b; 1.4.4 pending"
    next_safe_action: "Ship 1.4.4; operator confirms the gantt on iOS; open rows stay"
    blockers:
      - "Not operator-confirmed: release 1.4.4 has not been cut yet"
      - "Eleven product/harness defects found in verification round nine remain open (see Completion Criteria)"
    key_files:
      - "spec.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "037-timeline-gantt-port"
      parent_session_id: null
    completion_pct: 35
    open_questions:
      - "Whether the dependency-link seam persists as note frontmatter or a derived/computed field"
    answered_questions:
      - "The seam persists as an optional persistence action off the local action contract (calendar-timeline-renderer.ts:173), not note frontmatter"
---
# Goal: Timeline/Gantt Port

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Port obsidian-pm-main's timeline/Gantt geometry, scale controls, header/grid, bars, drag and
dependency-link UX near one-to-one into `calendar-timeline-renderer.ts`, rewritten to this repo's
`RowData`/`ViewConfig`/action contracts and `db-*` CSS lane, keeping table view, sheets, and
formulas/rollups/calcs local.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | This is a near-1:1 behavior port, not an inspiration harvest — every module-map row in `spec.md` §3 is rewritten (never copied) with a cited ref file:line and a verified local file:line. |
| D2 | Table view, bottom sheets, and formulas/rollups/calcs stay ours; the reference's eager-SVG-height rendering strategy is dropped, per `036-obsidian-pm-ui-harvest/research/research.md:375`. |
| D3 | Shipped, verified, and operator-confirmed are three states; only the third closes a row. This packet's own closure needs `npm run gate` observed green by a fresh in-runtime agent, not a delegate's report. |
| D4 | The dependency-link seam is new local surface — no local dependency renderer exists before this packet — and must reject same-side, duplicate, missing-task, and cycle links, matching `GanttLinkHandler.ts:56-67`, `:77-97`. |
| D5 | External lane order follows the parent goal's D14: (a) `cli-devin` `deepseek-v4-flash-max`, (b) `gpt-5.6-luna` via `cli-codex`/`cli-opencode`, (c) in-runtime fresh verifier runs the browser gate and `validate.sh` itself. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Every module-map row in `spec.md` §3 rewritten and matching its cited reference behavior, observed by
      placement/teardown pass and a screenshot read at all five zoom levels — observed red: 0 of 17 rows
      ported before this leg (the packet's own opening state); green after: 17 of 17 module-map rows
      rewritten and matching, `git show --stat 55bff9b` and `0262386` listing the rewritten files, and the
      reviewer reading all 20 timeline captures across the five scales.
- [x] The dependency-link seam rejects same-side, duplicate, missing-task, and cycle links, each with a unit
      test observed passing — red baseline was 12 failed of 12, `TypeError: resolveTimelineLinkChange is not
      a function` (`src/data/calendar-interaction-model.test.ts:41`, vitest, 2026-09-03); green after the seam
      landed at `calendar-interaction-model.ts:270` in commit `0262386`.
- [x] Local visible-window rendering, unscheduled backlog, invalid-event repair, and group/lane limits are
      unchanged after the port — no regression observed red in a before/after diff. Keep-local behaviours
      left untouched: visible-window rendering, unscheduled backlog (with the declared due-only exclusion),
      invalid-event repair, group/lane limits, touch menu, and keyboard nav.
- [x] `styles.css` `db-timeline-*` rules reconciled under an acquired-and-released `css-lane` hold, with a
      `reviewed` array naming the recaptured screenshots — before the fix, the lane carried no reviewed
      entry for this port; released 2026-09-03T07:30:00Z naming all 21 captures (`tools/lane/css-lane.json`
      history, hash `14e1a5a8e3b6`).
- [x] `npm run gate` reports `gate: PASS` and exit 0, observed by a fresh in-runtime agent per D14 leg (c) —
      before the fix, no gate run existed for this port's changed files; observed red on the pre-port tree's
      dependency-link and hour-column tests (see the two rows above); 25 green observed twice after: once
      with `SURFACE_PHASE=037-timeline-gantt-port` (lane held) and once plain (lane released), both by fresh
      in-runtime agents.
- [x] `validate.sh specs/005-component-surface-system/037-timeline-gantt-port --strict` first `RESULT:` line
      is `PASSED` — before the fix, this packet's docs did not yet describe the landed state; observed first
      `RESULT: PASSED`, 2026-09-03.

### Open defects recorded at landing (round nine, 2026-09-03) — not part of the original six-item gate above,
### but counted in this packet's derived completion figure per the parent's D13

- [x] Header contradicts the rendered axis at quarter and year scale: `getTimelineTitleWindow`
      (`calendar-timeline-model.ts` ~494-505) returns the calendar quarter/year of the anchor while the body
      renders a viewport-centred window — observed red: title reads "January — March 2026" over ticks running
      Feb 14 to May 4. Fixed in leg a: `getTimelineTitleWindow` now takes the visible unit count
      and describes the viewport-centred window (`calendar-timeline-model.ts:528-538`); the year-scale title
      is the window's year span, "2025 — 2026" when it crosses years (`calendar-title-formatter.ts:110,124`);
      the renderer's fallback passes the observed unit count (`calendar-timeline-renderer.ts:1252`); unit-tested
      at `calendar-timeline-model.test.ts:275-289` and `calendar-title-formatter.test.ts:18-27`, red-first,
      verified green in leg b (2026-09-03). Capture pending, not capture-confirmed: leg b recaptured all
      five scales on both devices and themes and read every changed timeline PNG; `timeline-view-quarter-
      desktop-light.png` still shows the title "January — March 2026" over ticks running Feb 7 – May 9,
      the same mismatch this row describes, because `tools/screenshots/scenarios/temporal.mjs`'s fixture
      builds that title from its own frozen constant rather than calling `getTimelineTitleWindow` — see the
      Deviations row below.
- [ ] Zero-width mount fallback: `getTimelineViewportUnitCount` returns `undefined` when the measured content
      width is 0 (hidden or collapsed container at mount); `buildTimelineModel` then falls back to the
      calendar-boundary window with no centring, recovering only on the next resize.
- [ ] Invalid interactive nesting: `span[role=button][tabindex=0]` inside `button.db-timeline-event`
      (renderer ~:623) — flagged for `041-shared-ui-ux-port`.
- [ ] At year and quarter scale the two 28px link dots of adjacent bars overlap each other and neighbouring
      bars — observed on capture.
- [ ] Light-mode meta text over the progress fill is low contrast — observed on capture.
- [x] The milestone label paints outside its bar by design (`.is-milestone overflow: visible`) and is
      overpainted by the next bar in the same lane — observed red: reads "A. M" on 12 of 20 captures (week
      and month, both devices). Fixed in leg a: the lane model decides per milestone whether the next bar
      starts within the label span and the renderer moves that label above the bar
      (`resolveTimelineMilestoneLabelPlacement`, `calendar-timeline-model.ts:881-901`;
      `is-label-above` at `calendar-timeline-renderer.ts:945-958`); the placement is unit-tested at
      `calendar-timeline-model.test.ts:297-331`, red-first, verified green in leg b (2026-09-03). Still needs
      the CSS leg named in the Deviations row below (`.is-label-above` has no rule yet, so the class has
      nowhere to apply). Capture pending, not capture-confirmed: `timeline-view-month-desktop-light.png`
      (recaptured 2026-09-03) still reads "A N" — "Adobe CC" still overpainted by "Notion" — because the
      fixture markup never calls `resolveTimelineMilestoneLabelPlacement` in the first place, so this row
      cannot show green even after the CSS lands without a further fixture or real-renderer capture change.
- [x] The leading axis tick label is clipped at the viewport's left edge on every mobile capture ("00:00"
      reads "0:00", "Tue 24" reads "ue 24") — observed red, looks like missing left padding in the axis, not
      a capture artefact. Fixed in leg a: the first tick's label anchors at the viewport edge
      instead of centring past it (`renderTimelineTickLabel`, `calendar-timeline-renderer.ts:909-919`, call
      site `:430`); unit-tested at `calendar-timeline-tick-label.test.ts:72-84`, red-first ("expected
      undefined to be 'none'"), verified green in leg b (2026-09-03). Capture pending, not
      capture-confirmed: `timeline-view-day-mobile-dark.png` (recaptured 2026-09-03) still clips "00:00" to
      "0:00" at the left edge, because the static fixture emits its tick-label span directly rather than
      through `renderTimelineTickLabel` and never sets the fixed tick's `transform: none`.
- [x] Day scale at phone width is close to unusable: about five hour columns, partly occluded by the 160px
      label column, today never in frame without scrolling. Observed red (pre-fix): 60px columns at 402px
      device width. Fixed in leg a: the day scale
      uses a 32px column below a 560px container (`resolveTimelineUnitWidth`, `calendar-timeline-model.ts:
      208-227`, renderer `calendar-timeline-renderer.ts:318`) so about eleven hour columns fit, and a fresh
      window centres on the current hour (`resolveTimelineDayCentredStartMinutes`,
      `calendar-timeline-model.ts:436-442`, threaded via `buildTimelineModel` at `:689` and the renderer's
      `now` option at `calendar-timeline-renderer.ts:325`); unit-tested at
      `calendar-timeline-model.test.ts:337-384`, red-first ("expected 60 to be 32"), verified green in leg b
      (2026-09-03), and confirmed threaded from `container.clientWidth` at both the initial render
      (`calendar-timeline-renderer.ts:318`) and the resize observer (`:2512`) by direct read. The 160px label
      column still overlays the grid at phone width (unchanged layout). Capture pending, not
      capture-confirmed: `timeline-view-day-mobile-dark.png` (recaptured 2026-09-03) still measures 60px
      columns (5 hours visible, not ~11), because `tools/screenshots/scenarios/temporal.mjs`'s
      `TIMELINE_FIXTURES.day.width` is the hardcoded desktop default and never receives a container width
      to narrow against.
- [ ] Year scale at 4px/day carries almost no readable labels at phone width: one tick label survives; bar
      titles are illegible slivers.
- [ ] Harness note: the capture frame (`#shot`) carries 16px padding, so the captured container is 1408/370
      wide, not 1440/402; the fixture's device-width comment is wrong by 16px a side and the right edge
      overflows by up to 8 columns at year desktop. Low priority; today-centred content stays in frame.
- [ ] `.db-timeline-event.is-all-day` remains duplicated at two `styles.css` blocks — pre-existing, not
      introduced by this port.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet scaffolded (spec.md, plan.md, tasks.md, acceptance-criteria.md, goal.md) | Done | This write, 2026-09-02 |
| Port implementation (range geometry, cycle-safe link seam) | Done | `0262386`, 2026-09-03 |
| Port implementation (scales, header/grid, milestone, progress, link affordance, css lane) | Done | `55bff9b`, 2026-09-03 |
| Product bug: every hour column painted `is-today` at day scale | Fixed | Unit test `src/views/calendar-timeline-hour-column.test.ts`, red 24 of 24 before the fix; landed in `55bff9b` |
| Product bug: year printed twice in the year-scale title | Fixed | Parity test in `calendar-timeline-model.test.ts`; landed in `55bff9b` |
| Leg b: title/axis, milestone-label, tick-clip and day-scale-phone fixes for four of the open rows above | Fixed, capture pending | Red-first: `calendar-timeline-model.test.ts`, `calendar-title-formatter.test.ts`, `calendar-timeline-tick-label.test.ts` (10 failed / 30 passed, exact assertions recorded on the rows above); green after (40/40); full gate tsc=0, vitest=89 files/881 tests, lint=169 (= baseline), scan-comments=0. Recaptured and read all changed timeline PNGs; see the fixture-independence row below for why none of the four show as visually fixed yet. |

### Deviations and findings

| Item | Note |
|------|------|
| `research/research.md:109`'s CSS citation (`gantt.css:1-17` -> `styles.css:17126-17133`) | Verified wrong on direct read: `:17126-17133` resolves to `.db-timeline-group-toggle` hover CSS, not timeline-unit CSS variables. The actual `--db-timeline-unit-width`/`--db-timeline-content-width` definitions are at `styles.css:16759-16760`. Corrected in `spec.md` §3; the parent catalog is not edited by this packet. |
| No standalone `checklist.md` template exists in this repo's `system-spec-kit` Level 2 template set (confirmed against sibling packets `029-numeric-coercion-parity` and `033-list-virtualisation`, neither of which carries one) | `tasks.md`'s own Verification Checklist (CHK-xxx rows) serves that function instead of fabricating an unsupported file. |
| Harness: production renderer cannot be mounted in the screenshot pipeline | `tools/screenshots/capture.mjs` accepts only static HTML; mounting the production renderer needs an async-mount scenario type plus an esbuild/obsidian-stub stage shared by ~230 scenarios — recorded as infeasible for this phase. The fixture mirrors the renderer's viewport-window mode, content width and unit widths, with parity tests (`temporal-tick-parity.test.mjs`) importing the fixture helpers directly. |
| Touch-targets baseline raised 215 -> 279 | A/B against a clean HEAD export showed the 64 extra are five pre-existing 20px timeline classes (nav-button, group-toggle, event, create-button, scale-menu) now measured across four new scale scenarios — no new class. The link dot is a real 28x28 element with no exemption. |
| Verification history | Nine fresh in-runtime rounds; the code held from round three onward, every later rejection was fixture fidelity (clamped events, shared lanes, tick tables, day window, raw width, unit widths), not a code regression. |
| Leg b: the screenshot fixture cannot demonstrate any of the four title/tick/milestone/day-width fixes | `tools/screenshots/scenarios/temporal.mjs` builds `timeline-view-*`'s title text (`TIMELINE_FIXTURES[scale].title`), tick-label markup, and day-scale `width` from its own hand-mirrored constants — none of them call `getTimelineTitleWindow`, `renderTimelineTickLabel`, `resolveTimelineMilestoneLabelPlacement`, or `resolveTimelineUnitWidth` with a container width. Recapturing and reading every changed timeline PNG (2026-09-03) confirms the pre-fix patterns are still pixel-present: `timeline-view-quarter-desktop-light.png` still titles "January — March 2026" over Feb 7 – May 9 ticks; `timeline-view-month-desktop-light.png`'s "Adobe CC" still reads "A N" under "Notion"; `timeline-view-day-mobile-dark.png`'s first tick still clips to "0:00" and still measures 60px/11px columns (5 visible, not ~11). The other seven changed PNGs (`css-lane.json`'s new release entry) are confirmed byte-only encoder noise (0-64 changed px of 1.4-5.2M) against their HEAD copies, the same phenomenon `040-subtask-tree-port`'s release note already recorded for this toolchain. Closing these four rows visually needs either a real-renderer capture path (the row above) or updating `temporal.mjs` to call the changed functions — both out of this leg's scope. |
<!-- /ANCHOR:log -->
