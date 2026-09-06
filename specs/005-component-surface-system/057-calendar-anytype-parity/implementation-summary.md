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
    last_updated_at: "2026-09-06T19:00:00Z"
    last_updated_by: "code-implementer"
    recent_action: "landed T017, the flatten-to-chip-ink repaint; AC-005 closes"
    next_safe_action: "the operator's AC-010 device read; AC-004's layout-tile panel stays a named gap"
    blockers:
      - "AC-010 is the operator's device read, unclosable here"
      - "Five AC-002 sub-rows stay pixel read owed"
      - "AC-004's layout-tile panel has no measured value in design-trueup.md and is named out of scope"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "src/views/calendar-toolbar-renderer.ts"
      - "src/views/calendar-timeline-toolbar-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-057-impl"
      parent_session_id: null
    completion_pct: 98
    open_questions: []
    answered_questions:
      - "ADR-002 ruled: keep week and day, styled to the month grid"
      - "T015 R1-R7 closed: inset, pitch, rule colour, marker, header, offset, label, drawer"
      - "T016: chip icon confirmed rendering, not just wired"
      - "T008: phone chip takes the 44px touch floor, CSS and JS pitch alike"
      - "T009: submenu geometry scoped to date-field dropdowns only"
      - "T017: the week/day timed block flattens to the month chip's ink, measured at 0 fill/bar px"
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
| **Completed** | Code landed and gated. Two rows stay open: AC-004's out-of-scope layout-tile panel, and AC-010 (the operator's device read), which an agent never ticks |
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

**Neither measured value had actually landed, and the verification pass at the landing found it.**
Opened in the capture harness's own Chrome at DPR 2, the panel measured **280px** and its rows
**29.39px**. Two independent causes: `positionToolbarPopover` — the placer every dropdown in the app
goes through — writes a flat `preferredWidth: 280` as an **inline** style, and an inline declaration
outranks any stylesheet rule, so the scoped `width: 224px` was dead the moment it was written; and
`min-height` cannot shrink a row whose content already measures 29.39px, so the 28px floor never
bound. The scoping was correct, which is exactly why the test stayed green: it pinned that the class
reaches the right two rows, and a class reaching a row is not the geometry applying to it. Repaired
by carrying `!important` on the width — scoped to this one class, and only on the width, in
preference to teaching the shared positioner a per-caller width it does not own — and by tightening
the row's block padding until the floor binds. Re-measured live: **224 x 28** on the two date-field
rows, **280 x 30** on every other dropdown in the same popover, which is the scoping assertion and
its own negative control in one read.

### T017 — the week/day timed block flattens to the month chip's ink

The operator's last open question, answered 2026-09-06 ~04:45 verbatim *"Flatten to chip ink"*,
after this packet's stylesheet legs had already landed and been captured. `.db-calendar-week-
timed-event` dropped its `border-left` accent bar, its `background-color`/`background-image` fill
and its `box-shadow`, taking `background: none`, `border: 0`, `border-radius: 0` and the literal
`#292929`/`#DDDDDD` ink pair `.db-calendar-month-segment` already carries; `.db-calendar-week-
event-title`'s own explicit colour is removed so it inherits that ink exactly the way the month
title inherits from its own parent. Block height stays duration-proportional — the geometry half
of ADR-002 was already settled and this ruling does not touch it. A duplicate, fully-subsumed
declaration of the same selector eleven rules above the one this leg rewrote (three properties, all
three already repeated in the surviving rule) is deleted as a zero-behaviour-change cleanup, which
also makes the selector unique for the pinned-values test. No separator rule was added between
adjacent blocks: dropping the fill lets the week grid's own slot lines show through in its place,
the same "cell surface shows through" reasoning the month chip's own flat background already reads
under (`decision-record.md` ADR-002's landing note). Recaptured and read pixel-by-pixel: **0**
device px of the three former per-event fills and the former accent bar, against a red value of
138,411 / 9,873 / 8,336 device px plus a bar at every block.

### Ancillary — the two toolbar headers `051` could not reach

`calendar-toolbar-renderer.ts:89` and `calendar-timeline-toolbar-renderer.ts:69`'s hand-built
`db-panel-header`/`db-panel-title` pairs are replaced with `buildShellHeader`, the same call every
other migrated site in `051` uses. `calendar-timeline-renderer.ts` — the gantt itself, a different
file from its own toolbar — is untouched. Recorded with file:line in `051`'s own `tasks.md`.

### A pinned-values test

`calendar-pinned-values.test.ts` reads styles.css directly and asserts six measured values by
literal text: the month row's 136px height, the day-cell rule colour pair, the chip's 20px desktop
pitch and square corners, the phone chip's 44px override, the today marker's 26x24px size and
`#216DFA` fill, and (T017) the week/day timed block's flat background/border-left/radius/colour —
so a future edit that quietly moves one of these fails at `npm test` speed, before a lane merely
reports that styles.css moved.

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
| `styles.css` | Edited | R1/R2 (`box-sizing`), R3 (rule colour/today marker), R5 (day-number padding/align), R7 (dead rule removed), T008 (phone chip height), T009 (submenu geometry), T017 (timed block flattened to chip ink, one duplicate rule removed) |
| `tools/live/render-assertion-harness.ts` | Edited | T016's `calendarRecordIcon` option |
| `tools/screenshots/constructed-scenarios.mjs` | Edited | T016's option wired to `constructed-calendar-month`; its note corrected |
| `tools/screenshots/scenarios/temporal.mjs` | Edited | R7's fixture notes corrected; `calendarBacklogEmptyMarkup` removed |
| `tools/screenshots/scenarios/temporal-tick-parity.test.mjs` | Edited | Dropped assertions against the removed helper |
| `tools/live/replay.mjs` | Edited | `039`'s calm-empty-marker claim superseded in place, recorded as such |
| `tools/lane/css-lane.json` | Edited | Nine held edits, then released at `4f88f8ebfee6` naming 37 reviewed captures; T017 released again at a new `baselineHash` naming 4 more |
| `specs/005-component-surface-system/051-modal-and-sheet-componentization/tasks.md` | Edited | Addendum recording the two migrated files, file:line |
| `src/views/calendar-pinned-values.test.ts` | Edited | T017's sixth pin: the timed block's flat background/border-left/radius/colour, with a negative-control check |
| 37 `screenshots/notion-clone/**/*.png` | Recaptured | Every content-changed capture this leg's fixes moved |
| 4 `screenshots/notion-clone/views/calendar-week-time-grid-*.png` | Recaptured | T017's flattened timed block |
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
| R3's colour fix stopped at rule/marker geometry, leaving the timed block's own colour for the operator to rule on | ADR-002's open question (does "styled to the month grid" strip the per-event colour too) was not inferable from a reference that ships no time grid; the operator answered it and T017 landed the answer |
| No separator rule was added between adjacent flattened timed blocks | Twenty Anytype captures show no time-grid view to read a separator off either way; dropping the fill lets the already-landed slot lines show through in its place, so the existing grid does the separating rather than a new rule |
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
| `npx vitest run` | **1437/1437** in 137 files, from the T017 landing (the pinned-values test's sixth pin added net +1) |
| `npm run build` | Exit 0; `main.js` unmoved — T017 is a stylesheet-only and test-only change |
| `npm run gate` (foreground, exit read from a file, no pipe) | **26 green, 0 red** |
| `node tools/live/sheet-grammar.mjs` | Exit 0, **13** surfaces and **31** stacked pairs. The thirteenth is `055`'s `confirm`, registered while this packet was open; 057 registered none |
| `node tools/screenshots/verify.mjs` | Exit 0, **562** current |
| Gantt unmoved | All eight `reference-gantt-*.png` MD5-identical to `T002`'s recorded values; `git diff --stat origin/main -- src/views/calendar-timeline-renderer.ts` empty; `pm-gantt-*` still **119** |
| Guard tests unedited | `git diff --stat origin/main -- calendar-keyboard-navigation.test.ts calendar-search-placement.test.ts` empty; with `calendar-renderer.test.ts`, 32/32 |
| Acceptance criteria | **Eight Met** — AC-001, AC-002, AC-003, AC-005, AC-006, AC-007, AC-008, AC-009, each re-measured at a landing rather than accepted on the implementing leg's own report. **Two open** — AC-004's one remaining out-of-scope surface, and AC-010, the operator's |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Five `AC-002` sub-rows stay pixel read owed.** Hover, focus, press, drag, the overflow
   affordance, chip truncation, multi-day spans, a two-digit today, and a six-week month's row
   height cannot be answered from a static capture. Unchanged by this leg.
2. **`AC-004`'s layout-tile panel and `+ Add Property` stay unbuilt.** Named as out of scope
   (`053` owns the view switcher) and declined on product grounds (frontmatter keys are not a
   property registry), respectively — recorded, not silently missing.
3. **The phone calendar's every value carries "design inferred from desktop."** `T013` counted
   zero unlabelled ones; the two phone-specific calendar values this packet owns (the nav-button
   and chip 44px floors) are both labelled with their measured desktop source and their
   accessibility ground.
4. **`AC-010` is the operator's own device read**, on iOS and desktop, knowing the phone half was
   inferred. Nothing in this repository closes this row, and it is not ticked here.
5. **The weekday labels take the reference's two-letter form, but not its Monday start.** The
   capture corpus renders `Su Mo Tu We Th Fr Sa` against the reference's `Mo Tu We Th Fr Sa Su`,
   because which day starts the week is locale- and `calendarFirstDayOfWeek`-driven and the harness
   runs `en-US`. T015 R6 moved the label's character count deliberately and left the week start
   alone; changing a default week start is a product decision and no capture in the corpus is
   evidence for it. Recorded here rather than left for a reader to notice in an image.
<!-- /ANCHOR:limitations -->

---
