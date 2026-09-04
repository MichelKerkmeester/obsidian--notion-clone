---
title: "Implementation Summary [template:level-2/implementation-summary.md]"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation"
  - "summary"
  - "template"
  - "impl summary core"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/037-timeline-gantt-port"
    last_updated_at: "2026-09-04T07:35:00Z"
    last_updated_by: "gantt-1to1-amendment"
    recent_action: "Recorded the operator's 1:1 gantt copy directive as a next leg"
    next_safe_action: "Dispatch devin leg: port GanttView 1:1"
    blockers:
      - "Not operator-confirmed: the gantt has not been checked on iOS"
      - "Seven product/harness defects from verification round nine remain open (see goal.md Completion Criteria)"
      - "2026-09-04: operator judged the landed legs not a close-enough copy; REQ-007's 1:1 leg pair has not started"
    key_files:
      - "src/views/calendar-timeline-renderer.ts"
      - "src/data/calendar-timeline-model.ts"
      - "src/data/calendar-interaction-model.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "037-timeline-gantt-port"
      parent_session_id: null
    completion_pct: 38
    open_questions: []
    answered_questions:
      - "The dependency-link seam persists as an optional persistence action off the local action contract (calendar-timeline-renderer.ts:173), not note frontmatter"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 037-timeline-gantt-port |
| **Completed** | 2026-09-02 |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The timeline/Gantt surface was ported near one-to-one from `obsidian-pm-main` into
`calendar-timeline-renderer.ts` across two commits. All 17 module-map rows in `spec.md` §3 were rewritten
(never copied) and verified matching, and the new cycle-safe dependency-link seam — no local dependency
renderer existed before this packet — rejects same-side, duplicate, missing-task, and cycle links.

### Timeline/Gantt Port

`0262386` (range geometry + link seam): `buildTimelineRangeGeometry` ports the reference's padded/min-spanned
range (padding -7/+14 days, per-scale minimum span); `resolveTimelineLinkChange` plus
`wouldCreateTimelineDependencyCycle` reject the four link cases, red-first (12 of 12 seam tests red,
`TypeError: resolveTimelineLinkChange is not a function`, before the seam existed).

`55bff9b` (scales, header/grid, milestone, progress, link affordance): five scales with header, grid, weekend
and today fills; bars, milestone diamond, progress fill, and the link affordance with keyboard and touch
equivalents. Two product bugs were fixed on the way: every hour column was painted `is-today` at day scale
(now only the current hour column, unit test red 24 of 24 before); the year was printed twice in the
year-scale title (now once, parity test).

Kept local, unchanged: visible-window rendering, unscheduled backlog (with the declared due-only exclusion),
invalid-event repair, group/lane limits, touch menu, and keyboard nav.

Eleven defects were found during the ninth and final verification round and were NOT fixed in this leg —
they are recorded as open rows in `goal.md` §3 and `spec.md` §1: a header/axis mismatch at quarter and year
scale, a zero-width mount fallback, invalid `span[role=button]` nesting, overlapping link dots at year/quarter,
low-contrast progress-fill meta, a milestone label overpainted by the next bar, a clipped leading axis label on
mobile, a near-unusable day scale and unreadable year scale at phone width, a capture-harness padding note, and
the pre-existing duplicated `.db-timeline-event.is-all-day` CSS block.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/calendar-timeline-renderer.ts` | Modified | Rewrote controls/header/grid/bars/drag/link affordance per `spec.md` §3 |
| `src/data/calendar-timeline-model.ts` | Modified | Extended `buildTimelineModel` with reference padding/min-span semantics; due-only/milestone metadata |
| `src/data/calendar-interaction-model.ts` | Modified | Added `resolveTimelineLinkChange` / `wouldCreateTimelineDependencyCycle` |
| `styles.css` | Modified | Reconciled `db-timeline-*` rules against the reference's visual hierarchy under the `css-lane` protocol; leg c added the `.is-label-above` milestone rules and moved `.db-timeline-events` `row-gap` to `var(--db-space-8)` |
| `src/data/calendar-title-formatter.ts` | Modified | Leg a: the title follows the rendered window, and spans years when the window crosses one |
| `tools/screenshots/scenarios/temporal.mjs` | Modified | Leg c: the timeline fixture takes its title, first-tick anchor, day column width and milestone placement from the viewport window instead of frozen constants. Leg d: the day branch's viewport window centres on a pinned `now` and its tick labels match `buildTimelineTicks`'s bare `"HH"` format |
| `tools/screenshots/scenarios/temporal-tick-parity.test.mjs` | Modified | Leg c: binds each new fixture mirror to the real model export it mirrors. Leg d: adds day-scale window- and tick-label-parity assertions against a pinned `now`, and corrects a downstream test assumption the centring made stale |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Nine fresh in-runtime verification rounds ran against this packet; the code held from round three onward,
and every later rejection traced to fixture fidelity (clamped events, shared lanes, tick tables, day window,
raw width, unit widths) rather than a code regression. The screenshot pipeline cannot mount the production
renderer (`tools/screenshots/capture.mjs` accepts only static HTML), so a fixture mirrors the renderer's
viewport-window mode, content width, and unit widths, backed by parity tests
(`temporal-tick-parity.test.mjs`) that import the fixture helpers directly. 20 timeline captures were read
across all five scales, both devices, both themes. The `css-lane` was acquired before the `styles.css` edit
and released naming all 21 changed captures. `npm run gate` was observed PASS at 25 green twice — once with
`SURFACE_PHASE=037-timeline-gantt-port` (lane held) and once plain (lane released) — by fresh in-runtime
agents, and `validate.sh --strict` returned first `RESULT: PASSED`. This shipped in release 1.4.4. Leg d
(2026-09-04) closed the day-scale row's last fixture-fidelity gap on a dedicated worktree branch: the
screenshot fixture now centres its day-scale viewport window on the pinned "now" through the same clamp
math `resolveTimelineDayCentredStartMinutes` uses, and its tick labels match `buildTimelineTicks`'s bare
`"HH"` format. `temporal-tick-parity.test.mjs` gained window- and tick-label-parity assertions per device
width, observed red first (4 of 118 failed), green after the fixture fix (118/118); all four day-scale
captures were read in both themes, and the twelve other captures the recapture moved were verified as the
toolchain's known encoder noise before being named in the same `css-lane.json` release.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Drop the reference's eager-SVG-height rendering (`GanttView.ts:185-190`) | Conflicts with local virtualization; visible-window rendering and lane limits are a local strength the reference lacks (D2, `research/research.md:375`) |
| Touch-targets baseline raised 215 -> 279 accepted without a new exemption | A/B against a clean HEAD showed the 64 extra are five pre-existing 20px timeline classes now measured across four new scale scenarios, not a new class; the link dot is a real 28x28 element |
| Eleven round-nine defects recorded as open rather than fixed in this leg | The landing round's own scope was the six-item closure gate (module map, link seam, keep-local behaviours, css-lane, gate, validate); newly found defects are tracked in `goal.md` §3 rather than silently expanding this leg's scope |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Unit tests (`npx vitest run`) | PASS — 89 files / 913 tests green after leg c, exit 0 (78 files / 682 at landing; 908 before rebasing onto `7e36671`, whose board leg adds 5) |
| Typecheck / lint / comments after leg c | `npx tsc --noEmit` exit 0; `npm run lint` 169 problems, exactly the recorded baseline; `scan-comments` exit 0 |
| Fixture-mirror mutation checks (leg c) | Forcing `timelineMilestoneLabelPlacement` to `"inline"` — red, 5 failed; mutating the title mirror's same-month branch — red, 1 failed. Both restored, `shasum -a 256` identical to the pre-mutation file |
| `css-lane` (leg c) | Acquired at `32148b7b7646`, released at `4f74f3bd0b1c` naming all 27 changed captures; `check-lane` exit 0 both held (`SURFACE_PHASE=037-timeline-gantt-port`) and plain |
| `touch-targets` after leg c | `under = 264` against the recorded 279 baseline, unchanged from the pre-edit tree — no interactive box shrank |
| Dependency-link seam red-first | Red: 12 of 12, `TypeError: resolveTimelineLinkChange is not a function`; green after `calendar-interaction-model.ts:270` landed |
| Hour-column `is-today` fix | Red: 24 of 24 (`calendar-timeline-hour-column.test.ts`); green after `55bff9b` |
| `npm run gate` | PASS — 25 green, 0 red, observed twice by fresh in-runtime agents (lane held and released) |
| `validate.sh --strict` | First `RESULT: PASSED` |
| Screenshot capture (20 timeline images, five scales x two devices x two themes) | Read, matching renderer's ticks/bars/milestone/progress; day-scale `is-today` column lands on the current hour only |
| Recapture and read after leg c (27 changed PNGs) | All opened and read against their `HEAD` copies. Three of the four open rows are now photographed: quarter titles "February — May 2026" and year "2025 — 2026" over their own axes; "Tue 24" and "00:00" whole at the mobile viewport edge; "Adobe CC Mar 25" above its bar on all 16 week/month/quarter/year captures where `HEAD` read "A N". The day row is half photographed — eleven 32px columns against `HEAD`'s five of 60px, but today out of frame |
| `npm run gate` after leg c | PASS — 25 green, exit 0, run twice (`SURFACE_PHASE=037-timeline-gantt-port` and plain) |
| Day-scale fixture parity (leg d), red-first | Red: 4 of 118 failed in `temporal-tick-parity.test.mjs` (`startMinutes` 0 vs 60 at 1440px / 0 vs 480 at 402px; tick labels `"HH:00"` vs `"HH"` at both widths), before `timelineViewportWindow` took a `now` argument. Green after: 118/118 |
| Typecheck / full suite / tools lint / comments after leg d | `npx tsc --noEmit` exit 0; `npm test` 93 files/929 tests green; `npm run lint:tools` exit 0; `scan-comments` exit 0; `npm run lint` (src) unchanged at 172 problems, confirmed by `git diff --stat main -- src/` reporting no `src/` changes on this leg's branch |
| `css-lane` (leg d) | `styles.css` untouched, `baselineHash` unchanged at `4c7b8b627ab9`; `check-lane` exit 0, release names all 16 recaptured PNGs (4 real day-scale captures, 12 verified toolchain encoder noise) |
| Screenshot capture (leg d), 4 day-scale timeline images read | `timeline-view-day-desktop-{light,dark}.png` show 23 hourly columns "01"–"23"; `timeline-view-day-mobile-{light,dark}.png` show 11 columns "08"–"18"; all four show the 13:00 tick highlighted and the now-line/today band at 13:45 in frame, with plain zero-padded labels and no `:00` collision |
| `npm run gate` after leg d | PASS — 25 green, exit 0 |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. ~~**Header/axis mismatch at quarter and year scale.**~~ Fixed in leg a and photographed in leg c: the
   title describes the rendered window, and spans years when the window crosses one.
2. **Zero-width mount fallback has no centring.** `getTimelineViewportUnitCount` returns `undefined` on a
   0-width mount and falls back to the calendar-boundary window until the next resize.
3. **Invalid interactive nesting.** `span[role=button][tabindex=0]` sits inside `button.db-timeline-event`;
   flagged for `041-shared-ui-ux-port`.
4. **Link-dot overlap at year/quarter scale.** Adjacent bars' 28px link dots overlap each other and
   neighbouring bars.
5. **Low-contrast meta over the progress fill in light mode.**
6. ~~**Milestone label overpaint.**~~ Fixed across legs a and c: the lane model raises a crowded label and
   `.is-label-above` gives it somewhere to go. Photographed on all 16 week/month/quarter/year captures.
7. ~~**Clipped leading axis label on mobile.**~~ Fixed in leg a and photographed in leg c.
8. ~~**Day scale at phone width, partly repaired.**~~ Fixed and fully photographed as of leg d
   (2026-09-04): eleven 32px hour columns, the window centred on the current hour, and — closing the last
   capture gap — the screenshot fixture now derives that centring from the same clamp math the model uses,
   so `timeline-view-day-{desktop,mobile}-{light,dark}.png` all show today (13:00) in frame with no
   colliding tick labels. **Year scale at phone width remains open**: 4px/day still carries almost no
   readable labels, and the 160px label column still overlays the grid.
11. ~~**Two screenshot-fixture fidelity gaps, both in the day branch.**~~ Fixed in leg d: `temporal.mjs`'s
    `timelineTicksFor` day branch now emits the bare `"HH"` label `buildTimelineTicks` emits, and
    `timelineViewportWindow` now takes a `now` argument and centres through
    `resolveTimelineDayCentredStartMinutes`'s own clamp math. `temporal-tick-parity.test.mjs` binds both to
    the real exports, red-first (4 of 118 failed), green after (118/118).
9. **Capture-harness padding note (low priority).** `#shot` carries 16px padding not reflected in the
   fixture's device-width comment; the right edge overflows by up to 8 columns at year desktop, though
   today-centred content stays in frame.
10. **Pre-existing duplicated CSS.** `.db-timeline-event.is-all-day` remains defined at two `styles.css`
    blocks; not introduced by this port.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:next-leg -->
## Next Leg

**Amendment 2026-09-04, operator directive (verbatim): "Same for timeline"**, issued the same
minute as the equivalent board directive. The operator installed obsidian-pm 2.1.0 beside this
plugin in the iCloud vault and ran a side-by-side comparison; the landed legs above and their
round-nine fixes rewrote the reference's behavior contract into local geometry rather than
reproducing `GanttView.ts`/`GanttHeaderRenderer.ts`/`GanttTaskBarRenderer.ts`/`TimelineConfig.ts`'s
DOM structure and class vocabulary, and that fell short of the comparison. `spec.md` REQ-007 and
`goal.md` D6 record the amendment and its supersession of the prior "rewrite, never copied"
disposition for structure and visual language; `acceptance-criteria.md` AC-007 and `tasks.md`
T019-T022 are the new closure gate.

**Today's observed baseline** (read directly this session, not carried over): `db-timeline-*`
classes, five scales (day/week/month/quarter/year) at 60/100/80/15/4px unit-width defaults
(`getTimelineColumnWidthSpec`, `calendar-timeline-model.ts:183-201` — confirmed against this
directive's own dispatch numbers), a viewport-centred window, and a scale trigger button with
sibling link buttons.

**Plan for the next leg pair**, red first:
1. **T019** — write a DOM-structure parity test walking the reference's `GanttView` output shape;
   observe it fail against today's renderer.
2. **T020** — `cli-devin` leg: port the four reference files' DOM structure and class vocabulary
   1:1 onto `calendar-timeline-renderer.ts`, mapped to `RowData` (the dependency-link seam and
   visible-window/backlog/invalid-event/group-limit behavior stay unchanged, REQ-002/REQ-003).
3. **T021** — `cli-codex` leg: copy `gantt.css` verbatim where its rules apply into the
   `css-lane`-held `styles.css` `db-timeline-*` region (MIT notice attached to the copied block)
   and update the screenshot fixtures; local extensions (visible-window rendering, unscheduled
   backlog, invalid-event repair, group/lane limits, touch menu, keyboard link buttons, the
   viewport-centred window) move behind a new default-off setting.
4. **T022** — a fresh in-runtime verifier (not T020/T021's own report) reads the recaptured
   screenshots side by side with the reference's own screenshots or the operator's vault
   comparison, and re-runs T019's parity test to green.

No implementation has landed for this leg yet; this section documents the amendment and its plan
only.
<!-- /ANCHOR:next-leg -->

---


