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
    last_updated_at: "2026-09-03T22:40:00Z"
    last_updated_by: "leg-c-landed"
    recent_action: "Landed leg c: .is-label-above CSS plus viewport-aware fixture; 3 of 4 rows photographed"
    next_safe_action: "Centre temporal.mjs's day window, fix its HH tick label, recapture"
    blockers:
      - "Not operator-confirmed: the gantt has not been checked on iOS"
      - "Day-scale row half capture-pending: the fixture's day window never centres on the current hour"
      - "Seven product/harness defects from verification round nine remain open (see Completion Criteria)"
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
      verified green in leg b (2026-09-03). Capture-confirmed in leg c (2026-09-03), after
      `tools/screenshots/scenarios/temporal.mjs` was made to build its title from the same viewport window
      it renders: `timeline-view-quarter-desktop-light.png` reads "February — May 2026" over ticks running
      Feb 7 – May 9, and `timeline-view-year-desktop-light.png` reads "2025 — 2026" over a November-to-
      September axis. Both were read side by side against their `HEAD` copies, which still read
      "January — March 2026" and "March 23 — April 5" over those same ticks. The fixture title is bound to
      the real pair by `temporal-tick-parity.test.mjs`'s `getTimelineTitleWindow` +
      `formatCalendarTitleParts` assertions at both device widths; mutating the mirror's same-month branch
      was observed red (1 failed) and restored.
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
      `calendar-timeline-model.test.ts:297-331`, red-first, verified green in leg b (2026-09-03). The CSS
      landed in leg c: `.db-timeline-event.is-milestone.is-label-above` gives the trigger `overflow: visible`
      and lifts the content box to `bottom: calc(100% + 4px)` at `--db-font-xs` (`styles.css:18256-18276`),
      and `.db-timeline-events` `row-gap` moves 4px to `var(--db-space-8)` (`:17677-17680`) so the lifted
      label clears the lane above. Capture-confirmed: "Adobe CC Mar 25" reads whole and unoverpainted above
      its bar on all 16 week/month/quarter/year captures, both devices and themes; the `HEAD` copies of
      `timeline-view-month-desktop-light.png` and `timeline-subtask-tree-desktop-light.png` were opened
      beside them and still read "A N" and "A. M" under "Notion". The fixture's placement mirror is bound to
      `resolveTimelineMilestoneLabelPlacement` by `temporal-tick-parity.test.mjs`; forcing the mirror to
      return "inline" was observed red (5 failed) and restored byte-identically.
- [x] The leading axis tick label is clipped at the viewport's left edge on every mobile capture ("00:00"
      reads "0:00", "Tue 24" reads "ue 24") — observed red, looks like missing left padding in the axis, not
      a capture artefact. Fixed in leg a: the first tick's label anchors at the viewport edge
      instead of centring past it (`renderTimelineTickLabel`, `calendar-timeline-renderer.ts:909-919`, call
      site `:430`); unit-tested at `calendar-timeline-tick-label.test.ts:72-84`, red-first ("expected
      undefined to be 'none'"), verified green in leg b (2026-09-03). Capture-confirmed in leg c, after the
      fixture was made to emit the same `db-timeline-tick-label` wrapper and set `transform: none` on the
      first tick: `timeline-view-mobile-dark.png` and `timeline-view-mobile-light.png` read "Tue 24" whole
      at the left edge (the `HEAD` copies read "ue 24"), and `timeline-view-day-mobile-dark.png` reads
      "00:00" whole where its `HEAD` copy clipped it to ")0:00".
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
      column still overlays the grid at phone width (unchanged layout). Half capture-confirmed in leg c:
      `timeline-view-day-mobile-dark.png` and `-light.png` now show eleven 32px hour columns (00:00 – 10:00)
      where the `HEAD` copies, read beside them, show five at 60px. Still capture pending for the centring
      half — today (13:00) is out of frame in both, because `temporal.mjs`'s `timelineViewportWindow` day
      branch hardcodes `startMinutes: 0` while the model centres on the current hour through
      `resolveTimelineDayCentredStartMinutes` whenever the renderer passes `now`
      (`calendar-timeline-renderer.ts:325` -> `calendar-timeline-model.ts:689`), and
      `temporal-tick-parity.test.mjs` calls `getTimelineViewportWindow` without `now`, so its
      `startMinutes` assertion passes on the legacy branch and never reaches the centring one.
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
| Leg c: the `.is-label-above` stylesheet rules, and the screenshot fixture rebuilt to call the changed model code | Three of four photographed | `styles.css` under an acquired-and-released `css-lane` hold (`32148b7b7646` -> `4f74f3bd0b1c`, release names all 27 changed captures); `temporal.mjs` now takes its title, first-tick anchor, day column width and milestone placement from the viewport window instead of frozen constants, and `temporal-tick-parity.test.mjs` binds each mirror to the real export. Two independent mutations observed red and restored byte-identically: forcing the placement mirror to `"inline"` (5 failed) and mutating the title mirror's same-month branch (1 failed). Gate: tsc=0, vitest=89 files/913 tests (908 + main's 5 board additions), lint=169 (= baseline), scan-comments=0, touch-targets under=264 vs the 279 baseline, `npm run gate` 25 green twice. Title, tick-clip and milestone rows are capture-confirmed; the day row's centring half is not — see the two fixture-fidelity rows below. |

### Deviations and findings

| Item | Note |
|------|------|
| `research/research.md:109`'s CSS citation (`gantt.css:1-17` -> `styles.css:17126-17133`) | Verified wrong on direct read: `:17126-17133` resolves to `.db-timeline-group-toggle` hover CSS, not timeline-unit CSS variables. The actual `--db-timeline-unit-width`/`--db-timeline-content-width` definitions are at `styles.css:16759-16760`. Corrected in `spec.md` §3; the parent catalog is not edited by this packet. |
| No standalone `checklist.md` template exists in this repo's `system-spec-kit` Level 2 template set (confirmed against sibling packets `029-numeric-coercion-parity` and `033-list-virtualisation`, neither of which carries one) | `tasks.md`'s own Verification Checklist (CHK-xxx rows) serves that function instead of fabricating an unsupported file. |
| Harness: production renderer cannot be mounted in the screenshot pipeline | `tools/screenshots/capture.mjs` accepts only static HTML; mounting the production renderer needs an async-mount scenario type plus an esbuild/obsidian-stub stage shared by ~230 scenarios — recorded as infeasible for this phase. The fixture mirrors the renderer's viewport-window mode, content width and unit widths, with parity tests (`temporal-tick-parity.test.mjs`) importing the fixture helpers directly. |
| Touch-targets baseline raised 215 -> 279 | A/B against a clean HEAD export showed the 64 extra are five pre-existing 20px timeline classes (nav-button, group-toggle, event, create-button, scale-menu) now measured across four new scale scenarios — no new class. The link dot is a real 28x28 element with no exemption. |
| Verification history | Nine fresh in-runtime rounds; the code held from round three onward, every later rejection was fixture fidelity (clamped events, shared lanes, tick tables, day window, raw width, unit widths), not a code regression. |
| Leg b: the screenshot fixture cannot demonstrate any of the four title/tick/milestone/day-width fixes | `tools/screenshots/scenarios/temporal.mjs` builds `timeline-view-*`'s title text (`TIMELINE_FIXTURES[scale].title`), tick-label markup, and day-scale `width` from its own hand-mirrored constants — none of them call `getTimelineTitleWindow`, `renderTimelineTickLabel`, `resolveTimelineMilestoneLabelPlacement`, or `resolveTimelineUnitWidth` with a container width. Recapturing and reading every changed timeline PNG (2026-09-03) confirms the pre-fix patterns are still pixel-present: `timeline-view-quarter-desktop-light.png` still titles "January — March 2026" over Feb 7 – May 9 ticks; `timeline-view-month-desktop-light.png`'s "Adobe CC" still reads "A N" under "Notion"; `timeline-view-day-mobile-dark.png`'s first tick still clips to "0:00" and still measures 60px/11px columns (5 visible, not ~11). The other seven changed PNGs (`css-lane.json`'s new release entry) are confirmed byte-only encoder noise (0-64 changed px of 1.4-5.2M) against their HEAD copies, the same phenomenon `040-subtask-tree-port`'s release note already recorded for this toolchain. Closing these four rows visually needs either a real-renderer capture path (the row above) or updating `temporal.mjs` to call the changed functions — both out of this leg's scope. |
| Leg c: the fixture's day tick labels are wider than production's | `temporal.mjs`'s `timelineTicksFor` day branch emits `"HH:00"` (five characters) where the model's own day branch emits `String(hourOfDay).padStart(2, "0")` — `"00"`, `"01"` (`calendar-timeline-model.ts:913-931`, which never calls `formatTimelineTickLabel`). `temporal-tick-parity.test.mjs`'s tick-parity loop covers week/month/quarter/year and its own comment records that it skips day, so nothing binds this label. Consequence: `timeline-view-day-mobile-*.png` show the eleven 32px hour labels colliding into each other, which no production render draws. Fixture fidelity, not a product defect; the eleven-column and whole-first-label readings on that capture are unaffected because both are geometry, not label width. |
| Leg c: the fixture's day window never centres on the current hour | `timelineViewportWindow`'s day branch returns `startMinutes: TL_DAY_START_MINUTES` (0) and its comment still asserts that day scale never centres. The model gained `resolveTimelineDayCentredStartMinutes` (`calendar-timeline-model.ts:441-445`), reached from `getTimelineAnchorStartMinutes` (`:1151-1155`) whenever `getTimelineViewportWindow` is passed a `now` — which the renderer always passes (`calendar-timeline-renderer.ts:325` -> `calendar-timeline-model.ts:689`). The parity test calls `getTimelineViewportWindow` without `now`, so its `expect(mirrored.startMinutes).toBe(real.startMinutes)` is satisfied on the legacy branch and never exercises the centring one. This is why the day row above stays half capture-pending. |
| Leg c: `.db-timeline-events` `row-gap` is the one edit not scoped to `.is-label-above` | The lifted label is absolutely positioned above its bar, so its clearance can only come from the lane's own row gap; 4px is smaller than an 11px/1.3 label plus its 4px offset. Raising the gap to `var(--db-space-8)` changes lane rhythm on every timeline capture, at every scale and both devices, which is why all 24 timeline PNGs were read rather than the four the fixes name: every lane stays legible, and no bar, dot, toggle or create row moved. Both new numbers are existing tokens (`--db-space-8` 24px at `styles.css:52`, `--db-font-xs` 11px at `:53`); `z-index: 8` sits one step above the timeline block's existing 0-7 ladder. |
| Leg c: `checkbox-appearance` reports one board checkbox below the 3:1 non-text minimum | Not introduced here and not a gate check. `db-board-card-checkbox` measures 2.99:1 in `board-drop-language`, a scenario that arrived on `main` in `7e36671`; `main`'s own `checkbox-appearance.json` was stamped at 68 fixtures, before those scenarios existed, so this re-run is the first measurement that includes them. This leg's stylesheet diff contains no board, checkbox, field, panel or chrome selector. `engine-parity` likewise exits 1 with 51 differences — byte-identical to the list `main`'s artefact already records, and naming no timeline element. Both belong to whoever owns the board leg. |
<!-- /ANCHOR:log -->
