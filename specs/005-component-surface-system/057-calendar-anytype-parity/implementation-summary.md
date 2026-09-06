---
title: "Implementation Summary: Calendar Anytype Parity"
description: "T015's seven residuals, T016's icon verification, T008's phone chip floor, T009's date-property submenu geometry and the two blocked-on-057 toolbar headers all landed; the gate is 26 green; AC-010 stays the operator's."
trigger_phrases:
  - "057 implementation summary"
  - "calendar anytype parity status"
  - "calendar retarget progress"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/057-calendar-anytype-parity"
    last_updated_at: "2026-09-06T16:30:00Z"
    last_updated_by: "code-implementer"
    recent_action: "landed T015 R1-R7, T016, T008, T009; gate 26 green"
    next_safe_action: "await operator AC-010 device read"
    blockers:
      - "AC-010 is the operator's device read, unclosable here"
      - "Five AC-002 sub-rows stay pixel read owed"
      - "Timed-block per-event colour is an open operator question"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "src/views/calendar-toolbar-renderer.ts"
      - "src/views/calendar-timeline-toolbar-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-057-impl"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Does the month-grid styling strip the timed blocks' colour too?"
    answered_questions:
      - "ADR-002 ruled: keep week and day, styled to the month grid"
      - "T015 R1-R7 closed: inset, pitch, rule colour, marker, header, offset, label, drawer"
      - "T016: chip icon confirmed rendering, not just wired"
      - "T008: phone chip takes the 44px touch floor, CSS and JS pitch alike"
      - "T009: submenu geometry scoped to date-field dropdowns only"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 057-calendar-anytype-parity |
| **Completed** | Code landed and gated. AC-010 (the operator's device read) is the only row left open, by design — an agent never ticks it |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

T001 (capture true-up) and T004-T007 (the month-grid retarget) landed before this leg, and are
recorded in their own prior commits. This leg picked up where an independent post-landing capture
read had reopened AC-002: seven measured residuals (`T015 R1`-`R7`), plus three further named gaps
(`T008`, `T009`, `T016`) and an ancillary cleanup the `051` header-componentization packet could not
reach while this packet held the two files it lives in.

### T015 — the seven residuals

- **R1/R2 — the month grid's one-sided inset.** `.db-calendar-month-grid` carried both the shared
  `db-calendar-grid` class (`width: 100%`, content-box) and its own `padding: 0 16px`, with no
  `box-sizing` override — the padding stacked on top of an already-100%-wide content box, landing
  the inset on the left edge only and overrunning the container by 16px on the right. One line,
  `box-sizing: border-box`, fixed both sides of the same defect: the grid's 8 vertical rules now sit
  at device x 112/489/865/1243/1619/1997/2373/2751, a 16px CSS inset on both edges, matching the
  weekday row's own (always-correct) box, at a 377.0 device px column pitch (was 386.2).
- **R3 — week/day rule colour and today marker, geometry only.** The week body's slot lines and the
  current-time marker read `--background-modifier-border`/`--db-current-time-color` instead of the
  month grid's measured `#EBEBEB`/`#292929`/`#216DFA`. Fixed by mixing off the literal hex values
  and by splitting the selectors that grouped a `.db-timeline-*` declaration with a `.db-calendar-*`
  one, so `--db-current-time-color` and the gantt's own rules are untouched. The week/day timed
  block's own per-event colour is deliberately left alone — that is the open operator question, not
  this fix's.
- **R4 — the header grammar.** Week and day still built a static one-string title while month alone
  used two select buttons. `renderCalendarTitle` is replaced by `renderScaleTitleSelects`, the same
  two-button component month uses, with a new `navigateCalendarTitleTo` that clamps the existing
  day-of-month to the target month's last day.
- **R5 — the day number's ink offset.** `align-items: center` let the `+` add button's own height
  push the number past its own top padding. Switched to `flex-start` plus `line-height: 1`; padding
  tuned by measurement to `9px 3px 2px`. Ink top offset now measures 12px CSS exactly (was 18px),
  right inset 5px CSS exactly (was 6-7px).
- **R6 — the weekday label form.** `getWeekdayLabels` read the locale's own "short" width (3 letters
  for English); the reference is a constant 2 letters. `.slice(0, 2)` closes it, a no-op for any
  locale already at or under that width. Week-start configurability is untouched.
- **R7 — the empty drawer's placement.** `renderUnscheduledBacklog` now returns before creating any
  element when nothing is unscheduled, instead of rendering a header and an empty line at 85 CSS px
  of height. The now-unreachable `.db-calendar-backlog-empty` rule is removed.

### T016 — the chip's leading icon, verified rather than merely wired

Every calendar capture's harness bag stubbed `renderRecordIcon: () => null`, so the `Show icon`
toggle's effect had never actually rendered in any of the 28 recaptured images. A new opt-in
`calendarRecordIcon` scenario option wires a real icon renderer and gives one bench row an icon
token; `constructed-calendar-month` now sets it, and every chip in that capture carries a leading
icon (one the real emoji variant, the rest the default file-icon fallback).

### T008 — the phone chip's 44px touch floor

The flat chip's mobile override was still `height: 18px; padding: 0 4px; font-size: 11px`, under the
44px floor the nav buttons already had. `.is-phone .db-calendar-month-segment` now sets `height:
44px` only, keeping the desktop's 12px label and 8px gap. That needed a matching JS-side fix: the
20px lane pitch was hardcoded as a literal in four places (three in the month grid's row sizing, one
in the week/day all-day row); a new `isPhoneLayout()`/`getMonthChipPitch()` pair reads the same
20/44 value everywhere. The day/chip context menu is built on the already-registered shared
`owned-menu` primitive and does not add a thirteenth `sheet-grammar.mjs` surface.

### T009 — the date-property submenu's measured geometry

Per-option icons and the selected checkmark already existed, unmodified, in the shared dropdown-menu
component. What was missing was the measured 224px/28px geometry. Resizing the shared component for
every consumer in the app is not this packet's to do — the same boundary `design-trueup.md` already
draws for the layout-tile panel. A new class, `db-calendar-date-field-dropdown`, scopes the geometry
to the start/end date-field dropdowns only.

### Ancillary — the two toolbar headers `051` could not reach

`calendar-toolbar-renderer.ts:89` and `calendar-timeline-toolbar-renderer.ts:69`'s hand-built
`db-panel-header`/`db-panel-title` pairs are replaced with `buildShellHeader`, the same call every
other migrated site in `051` uses. `calendar-timeline-renderer.ts` — the gantt itself, a different
file from its own toolbar — is untouched. Recorded with file:line in `051`'s own `tasks.md`.

### A pinned-values test

`calendar-pinned-values.test.ts` reads styles.css directly and asserts five measured values by
literal text: the month row's 136px height, the day-cell rule colour pair, the chip's 20px desktop
pitch and square corners, the phone chip's 44px override, and the today marker's 26x24px size and
`#216DFA` fill — so a future edit that quietly moves one of these fails at `npm test` speed, before
a lane merely reports that styles.css moved.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/calendar-renderer.ts` | Edited | T015 R1 (via styles.css)/R3/R4/R5/R6/R7, T008's phone chip pitch |
| `src/data/calendar-date-time.ts` | Edited | R6, the two-letter weekday label |
| `src/views/calendar-renderer.test.ts` | Edited | R7's rewritten backlog tests |
| `src/views/calendar-toolbar-renderer.ts` | Edited | T009's scoped submenu geometry; the `buildShellHeader` migration |
| `src/views/calendar-toolbar-renderer.test.ts` | Created | Pins the date-field submenu class scoping |
| `src/views/calendar-timeline-toolbar-renderer.ts` | Edited | The `buildShellHeader` migration (gantt's own renderer untouched) |
| `src/views/calendar-pinned-values.test.ts` | Created | Five pinned calendar values, read-first from styles.css |
| `styles.css` | Edited | R1/R2 (`box-sizing`), R3 (rule colour/today marker), R5 (day-number padding/align), R7 (dead rule removed), T008 (phone chip height), T009 (submenu geometry) |
| `tools/live/render-assertion-harness.ts` | Edited | T016's `calendarRecordIcon` option |
| `tools/screenshots/constructed-scenarios.mjs` | Edited | T016's option wired to `constructed-calendar-month`; its note corrected |
| `tools/screenshots/scenarios/temporal.mjs` | Edited | R7's fixture notes corrected; `calendarBacklogEmptyMarkup` removed |
| `tools/screenshots/scenarios/temporal-tick-parity.test.mjs` | Edited | Dropped assertions against the removed helper |
| `tools/live/replay.mjs` | Edited | `039`'s calm-empty-marker claim superseded in place, recorded as such |
| `tools/lane/css-lane.json` | Edited | Nine held edits, then released at `4f88f8ebfee6` naming 37 reviewed captures |
| `specs/005-component-surface-system/051-modal-and-sheet-componentization/tasks.md` | Edited | Addendum recording the two migrated files, file:line |
| 37 `screenshots/notion-clone/**/*.png` | Recaptured | Every content-changed capture this leg's fixes moved |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Each residual and task landed red-first, in its own commit, with the measured before/after value
written into `tasks.md`/`checklist.md` at landing time rather than after the fact. Every styles.css
edit was recaptured with `node tools/screenshots/capture.mjs --only <scenario>` and read pixel-by-
pixel using a small ad hoc PNG decoder (`tools/screenshots/pixel-hash.mjs`'s exported `decodePng`)
rather than by eye alone, so the "before" and "after" numbers in this document and in `tasks.md` are
measurements, not descriptions. The gantt was re-checked after every capture run: all eight
`reference-gantt-*.png` MD5s and a `git diff --stat` on `calendar-timeline-renderer.ts` (empty
across the whole leg).
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| R3's colour fix stops at rule/marker geometry, not the timed block's own colour | ADR-002's open question (does "styled to the month grid" strip the per-event colour too) is the operator's, not inferable from a reference that ships no time grid |
| The date-property submenu's 224px/28px geometry is scoped to a new class, not applied to the shared dropdown-menu component | The same boundary `design-trueup.md` already draws for the layout-tile panel: `053` owns the view switcher, and the shared dropdown is a cross-cutting component this packet does not own either |
| The layout-tile panel and `+ Add Property` stay declined/out of scope | Recorded, not silently dropped: frontmatter keys are not a property registry, and the tile panel is a different packet's surface |
| Five byte-only capture re-encodes are left at their freshly-captured bytes rather than restored to origin bytes | Restoring them would reintroduce stale manifest `sourceHashes` against the tree's actual final file hashes and fail the `screenshots-fresh` gate lane — the gate's mechanical pass is weighted over a marginally smaller diff |
| `039`'s calm-empty-marker claim in `tools/live/replay.mjs` is superseded in place rather than left to go silently red | A reversal of a held claim is either a regression or a recorded supersession; this one is the latter, and the file's own philosophy is to say which |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Exit 0, read at every landing commit |
| `npm test` | 1425/1425, final count (started this leg at 1418/1418 before T015 R7's two rewritten tests and T009/pinned-values' three new ones) |
| `npm run build` | Exit 0; the regenerated `main.js` is restored to `HEAD` rather than committed, per this repository's own rule |
| `npm run gate` (foreground, exit read from a file, no pipe) | **26 green, 0 red** |
| `node tools/live/sheet-grammar.mjs` | Exit 0, 12 surfaces, 31 stacked pairs, unchanged throughout |
| `node tools/screenshots/verify.mjs` | Exit 0, 558 fresh |
| Gantt unmoved | All eight `reference-gantt-*.png` MD5-identical to `T002`'s recorded values; `git diff --stat 793ab9b4..HEAD -- src/views/calendar-timeline-renderer.ts` empty |
| Guard tests unedited | `git diff --stat 793ab9b4..HEAD -- calendar-keyboard-navigation.test.ts calendar-search-placement.test.ts` empty; both 16/16 |
| Acceptance criteria | AC-001, AC-003, AC-005, AC-006 Met; AC-002/004 measurably narrower (T015/T009 closed what they could) but still carry "pixel read owed" rows a static capture cannot answer; AC-007/008/009 hold after this leg; AC-010 is the operator's |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Five `AC-002` sub-rows stay pixel read owed.** Hover, focus, press, drag, the overflow
   affordance, chip truncation, multi-day spans, a two-digit today, and a six-week month's row
   height cannot be answered from a static capture. Unchanged by this leg.
2. **The timed-block per-event colour is an open operator question.** `decision-record.md` ADR-002
   names it explicitly; this leg's R3 fix deliberately stops at rule/marker geometry and does not
   touch it.
3. **`AC-004`'s layout-tile panel and `+ Add Property` stay unbuilt.** Named as out of scope
   (`053` owns the view switcher) and declined on product grounds (frontmatter keys are not a
   property registry), respectively — recorded, not silently missing.
4. **The phone calendar's every value carries "design inferred from desktop."** `T013` counted
   zero unlabelled ones; the two phone-specific calendar values this packet owns (the nav-button
   and chip 44px floors) are both labelled with their measured desktop source and their
   accessibility ground.
5. **`AC-010` is the operator's own device read**, on iOS and desktop, knowing the phone half was
   inferred. Nothing in this repository closes this row, and it is not ticked here.
<!-- /ANCHOR:limitations -->

---
