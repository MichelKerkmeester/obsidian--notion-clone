---
title: "Goal: Calendar Anytype Parity"
description: "The durable directive for rebuilding the calendar to Anytype's calendar layout, and the criteria that decide when it is done."
trigger_phrases:
  - "057 goal"
  - "calendar anytype parity goal"
  - "calendar month grid goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/057-calendar-anytype-parity"
    last_updated_at: "2026-09-05T22:45:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "authored the packet from the operator's board/calendar anytype ruling"
    next_safe_action: "Execute T001, the calendar capture true-up, by an image-capable leaf"
    blockers:
      - "The phone calendar has no Anytype reference at all: iOS Anytype ships no calendar layout and the capture set contains none"
      - "Whether the week and day scales survive is an operator question, not this packet's to settle"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "src/views/calendar-toolbar-renderer.ts"
      - "screenshots/anytype/desktop/sets"
      - "screenshots/anytype/desktop/menus"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-057-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Do the week and day scales survive, given Anytype ships one calendar layout and no scale switch was captured"
      - "Does the unscheduled backlog drawer have an Anytype counterpart, or is it ours to keep and argue"
      - "What does the phone calendar target, with no Anytype reference to read"
    answered_questions:
      - "The calendar was never a class-level 1:1 Project Manager copy; 039 was a behavioural parity port"
      - "The gantt is not this packet's and stays the Project Manager 1:1 port"
---
# Goal: Calendar Anytype Parity

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Rebuild the calendar view so its UI and UX read as Anytype's calendar layout rather
than ours — month grid, day cells, event chips, the unscheduled area, navigation, the scale switch
as Anytype has it or does not, the today marker, and the date-property picker the captured calendar
settings menu shows — with the phone gap named rather than filled by a guess.

**Why.** The operator's instruction of 2026-09-05 ~22:45, verbatim: *"Board UI/UX should almost be
1:1 Anytype"*, then *"Same for calendar etc."*, with the clarification *"Board + calendar to
Anytype; gantt stays PM"* and *"Make sure we have phases for that"*. This packet is the calendar
half; `056` is the board half. The gantt is untouched and stays the Project Manager 1:1 port,
because Anytype ships no timeline layout to port from.

**What it retargets, and what that is not.** `039-calendar-parity-port` landed and shipped in
1.4.6 and stands at 5 of 6. It was a **behavioural** parity port: `src/views/calendar-renderer.ts`
constructs **91** distinct `db-calendar-*` classes and **zero** `pm-*` classes, so unlike the board
there is no Project Manager element vocabulary here to remove. The reversal is therefore different
in kind from `056`'s: the calendar's own vocabulary stays and its **shape** is retargeted, element
by element, against the captures. Saying so precisely matters, because a threshold copied from
`056` — a class count driven to zero — would be unobservable here and therefore false.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Captures first, and this is a gate rather than a preference.** Every element this packet adopts is trued against a real Anytype calendar screen before it is written. The reference set is `screenshots/anytype/desktop/sets/<use-case>/anytype-<use-case>-calendar-{light,dark}.png` (10 use cases x 2 themes), the six `anytype-menu-calendar-*` and `anytype-menu-set-layout-calendar-*` menu crawls, and `047/research/research.md` section 5 "Calendar". A value nobody read off a screen is labelled **design inferred**, in its own task, and never presented as measured. |
| D2 | **Red first, per criterion, on a threshold.** Every row in `acceptance-criteria.md` carries one number or one boolean observed failing on the current tree before the work is written, recorded in `checklist.md` by T002. A threshold that cannot be made to fail is not a threshold. |
| D3 | **Parity by default, and a deviation must be an accessibility one, named with its measurement.** `051` ADR-007's posture, applied here: WCAG 1.4.11, WCAG 1.4.3 and a 44px touch floor are the only grounds for declining a captured value. Taste is not a ground. |
| D4 | **The phone calendar has no reference, and that is stated rather than papered over.** iOS Anytype ships no calendar layout: `screenshots/anytype/mobile/` contains no calendar capture of any kind, and the iOS view-layout sheets cover picker, gallery and kanban only. Every phone-calendar value this packet writes carries the label **"design inferred from desktop"** and names the desktop capture it was inferred from. |
| D5 | **`044`'s sheet grammar and `048`'s stacking model are constraints, not deliverables.** Every phone surface this packet produces or moves must still pass `tools/live/sheet-grammar.mjs` — 12 surfaces, 31 stacked pairs — after every leg. |
| D6 | **The week and day scales are an open question for the operator, not this packet's to close.** Anytype ships one calendar layout among six, and no scale switch appears in the capture sweep. Our calendar has three (`calendar-renderer.ts:82`). This packet inventories what parity would cost and asks; it does not delete a shipped scale on an inference. |
| D7 | **The gantt is not touched.** `037-timeline-gantt-port`'s 1:1 Project Manager copy stands, and it shares `calendar-timeline-renderer.ts`'s file neighbourhood and `styles.css`. A calendar leg that moves a `pm-gantt-*` pixel is wrong until the gantt parity captures are re-read and shown unchanged. |
| D8 | **Anytype is a design source, not a data model.** `050`'s D6 non-adoptions carry over: no Objects/Types/Queries, no sidebar widgets, no full template system, no dynamic filter values. The two values `050` refused stay refused. |
| D9 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the parent's `goal.md` first** (`../goal.md`) — D1-D14 bind here as written there.
`../roadmap.md` section 4 maps report to phase, section 5.A places this phase, section 6A holds the
operator decisions this packet consumes, and section 7.12 records the conflict `056`'s ADR-001
resolves and this packet inherits.

**The design read of record is `../050-anytype-adoption/design-trueup.md`,** not `047`'s research.
Where the two disagree the true-up wins (`050` ADR-003). The true-up is largely silent on the
calendar — it names it only to say the chip rail and the page-limit row are **absent** there — so
T001 does most of this packet's reading first-hand rather than inheriting it.

**Precedence.** Parent decisions outrank this file, which outranks any summary. Name conflicts;
never resolve them silently.

**Stop.** Only the criteria below decide done.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] **Every element in `spec.md` section 4's anatomy is trued against a named capture, measured,
      and matched.** **Today: no such record exists.** Done is `design-trueup.md` written with a
      capture filename per element and either a measurement or the **design inferred** label with
      its reason.
      **Closed 2026-09-05, recorded 0 of 9.** `design-trueup.md` did not exist and the capture set
      was unread; it now carries 9 of 9 elements with a capture filename each.
- [x] **The month grid, the day cell and the event chip match the captures.** **Today: ours.**
      `src/views/calendar-renderer.ts` constructs **91** distinct `db-calendar-*` classes and
      `styles.css` carries **133** `db-calendar` rules, none of them trued against an Anytype
      screen. Done is each of the three matched to a measured value or carrying a named
      accessibility deviation.
      **Closed 2026-09-06 and re-measured at the landing.** The failing values it moved from, each
      observed red on the pre-fix capture at DPR 2: the grid's rules sat at device x 112..2815
      against a container of 80..2783, so the 16px inset landed on the **left edge only**; the
      weekday row's pitch was **377.3** device px against the grid's **386.2**, drifting each label
      **15.5px at Monday to 43.5px at Sunday** out of its own column; the day number's ink sat
      **18px** below the cell top against a 12px reference; the labels read three-letter `Sun`
      `Mon`; and the empty unscheduled drawer occupied **85 CSS px**. Now: 16px on both edges,
      pitch delta **0.00**, ink at **12.5px**, two-letter labels, and no drawer element at all.
- [x] **Navigation matches the captured toolbar.** `047` section 5 records Anytype's as month and
      year selects spanning years 0-3000, arrows, and a Today button; plus a "today scroll" that
      positions the current week at the bottom of the viewport. Done is our navigation matching
      that or declining a part of it with a reason.
      **Closed 2026-09-06.** Was **6 controls beside a one-string title and no today scroll**,
      measured on `cc5a7ff2`; now two title selects opening the shared listbox, and the today
      scroll lands the current week at the viewport bottom.
- [ ] **The date-property picker matches the captured calendar settings menu.**
      `anytype-menu-set-layout-calendar-date-property-{light,dark}-full.png` is the reference.
      **Today: unread.**
- [ ] **The scale switch question is answered by the operator, not inferred.** **Today: three
      scales** — `updateCalendarScale?(scale: "month" | "week" | "day", ...)`
      (`calendar-renderer.ts:82`) with a scale control, menu, popover and segment class family.
      Anytype's capture sweep shows one calendar layout and no scale switch. Done is the operator's
      ruling recorded as an ADR, whichever way it goes.
- [x] **The unscheduled area is dispositioned.** **Today: ours** — a collapsible backlog drawer
      (`db-calendar-backlog*`, `calendar-renderer.ts:160-163`). Done is either a captured Anytype
      counterpart it is matched to, or a written argument for keeping it as ours.
      **Closed 2026-09-06, was 85 CSS px of drawer above a surface the reference does not have** —
      **0** non-background px below the grid rule in any of the twenty set captures, so there was
      no counterpart to match. Kept as ours with the argument written, and an empty drawer now
      renders nothing.
- [x] **The phone calendar's every value is labelled "design inferred from desktop".** **Today: no
      phone reference exists and none is coming** — iOS Anytype has no calendar layout. Done is
      zero phone values presented as measured.
      **Closed 2026-09-06, was 1 unlabelled.** The pre-retarget `body.is-mobile` chip override
      (`height: 18px; padding: 0 4px; font-size: 11px`) carried no label and no ground; it is
      replaced by a single `.is-phone` 44px height labelled against the measured 20px desktop pitch
      and the touch floor it takes instead. Unlabelled count now **0**.
- [x] **`044`'s grammar and `048`'s stacking still hold.** Done is `node
      tools/live/sheet-grammar.mjs` exit 0 with 12 surfaces and 31 pairs green, read from `$?`.
      **Closed 2026-09-06**, was 12 surfaces and 31 pairs recorded at `cc5a7ff2`; the landing
      reads **13** and **31** at exit 0, the thirteenth being `055`'s `confirm`, registered while
      this packet was open. 057 added none.
- [x] **The gantt did not move.** Done is the `pm-gantt-*` class count and the gantt capture hashes
      unchanged against their pre-leg baseline, or any move explained by a named gap.
      **Closed 2026-09-06**, was 119 `pm-gantt-*` tokens and eight capture MD5s recorded at
      `cc5a7ff2`; the landing reproduces **119** and all eight MD5s byte-identical, with a
      zero-line diff on `calendar-timeline-renderer.ts` and on both guard tests.
- [ ] **OPERATOR:** the operator reads the rebuilt calendar on iOS and on desktop and reports it as
      Anytype-shaped, knowing the phone half was inferred. Nothing in this repository closes this row.
- [ ] **The unscheduled affordance is subtle and integrated, not a band above the grid.**
      **Added 2026-09-06** from the operator's ~10:33 desktop report on 0.0.29 (`../roadmap.md` §4
      row 62; capture `operator-calendar-unscheduled-20260906.png`, the operator's own, not
      committed here), verbatim: *"For calendar the unscheduled pinned stuff needs to be done
      better. Like more subtlely integrated, check how anytype or other would do that."* **Today:
      red on the operator's own screen** — a lone centred item sits in an *"Unscheduled (1)"* band
      of roughly **80** CSS px above the grid. Done is **0** px of dedicated band above the grid,
      the unscheduled items reachable from a compact affordance in the header row, and the
      alternatives written as an ADR before anything is built. **This does not withdraw the ticked
      disposition row above**: that row closed the question *does the reference have a counterpart*
      (it does not, 0 non-background px below the grid rule in twenty set captures) and the answer
      stands. This row is the different question the operator has now asked — what ours should be
      instead. Leg `worktrees/161-impl-057-unscheduled`.
- [ ] **OPERATOR/GESTALT: the calendar reads as Anytype's, judged whole rather than value by
      value.** **Added 2026-09-06** from the operator's ~10:40 report, verbatim: *"in general our
      calendar looks nothing like anytype yet"*. **This reopens the packet.** Every Met row above
      was measured at the value level — a pitch, an ink pair, a class count — and every one of them
      can hold while the surface still reads as a different product. The operator's gestalt
      judgement outranks a value-level Met, so none of those rows is withdrawn and none of them
      closes this one. **Threshold, now that the side-by-side review has landed**: every one of
      `acceptance-criteria.md`'s **G1-G15** rows Met, each re-measured per pixel on a corpus
      recaptured on HEAD **and** on a second-theme capture whose `--background-primary` is neither
      `#1E1E1E` nor `#FFFFFF` (G12) — no row closes on the theme it was written against. **Today:
      red on all fifteen**, the six P0s among them measured on the operator's own 2000x967 dark
      capture: a `#282828` rule two levels off a `#262626` page, a Sunday-start week against Monday
      in all twenty captures, a first chip at ~98 CSS px below the cell top against 32, a 288x26
      filled `+N more` band, a 2031px grid in a 2000px screen, and 0 of 40 chips carrying an icon.
      `tasks.md` T019 is the leg; G7 additionally waits on the operator's ruling on the review's
      P0-2, which `decision-record.md`'s 2026-09-06 note carries as Proposed.
<!-- /ANCHOR:completion -->

---

## 4. LOG

### Opened 2026-09-05 ~22:45, on the operator's calendar ruling

The operator, using 0.0.27: *"Board UI/UX should almost be 1:1 Anytype"*, *"Same for calendar
etc."*, then the clarification *"Board + calendar to Anytype; gantt stays PM"*, and *"Make sure we
have phases for that"*. Two phases were opened: `056-board-anytype-parity` and this one.

Level 3. `recommend-level.sh --loc 800 --files 10 --architectural` returns **63/100**, confidence
92%, which is Level 2 by the script's own thresholds (level_2_max 69); phase score **10/50**, well
below the 25 threshold, so a standard child. It is scaffolded at **Level 3** on the go-higher rule
and for consistency with every peer family packet (`050`-`055`). The script's figure is recorded
rather than hidden.

**One finding is worth recording at authoring time**, because it changes what this packet can
promise: the calendar carries **zero** `pm-*` classes. `039` ported behaviour, not markup. So the
board's headline threshold — a Project Manager class count driven to zero — has no analogue here,
and writing one would have produced a criterion that reads green on an untouched tree. The
calendar's thresholds are per-element parity instead, which costs more to verify and is the only
honest form.

Nothing else is measured. T001 is the true-up and it is owed to an image-capable leaf; T002 is the
red-first pass. No code has been written and no criterion is met.


### 2026-09-06 amendment: state is REOPENED — PENDING REVIEW

**Three operator inputs the same hour, and they do not all say the same thing.**

**~10:33, the unscheduled affordance** (`../roadmap.md` §4 row 62): *"For calendar the unscheduled
pinned stuff needs to be done better. Like more subtlely integrated, check how anytype or other
would do that."* This is a design ask against a row this packet already ticked, and the two are
compatible: the ticked row answered *does Anytype have a counterpart* — it does not, **0**
non-background px below the grid rule across twenty set captures — and kept ours with the argument
written. The operator is not disputing that finding; they are asking that ours be better. Research
Anytype's own captures, the Notion harvest once it lands, and Project Manager's sidebar; the
proposal on the table is a compact *"Unscheduled · N"* chip in the header row beside the month/year
title, opening a popover on desktop and a sheet on phone, with drag-onto-a-day kept and **zero**
band above the grid. Write the alternatives as an ADR before building. The same capture also shows
multi-day ranges rendering as centred date-range text and per-column chip alignment drifting (Su
left, Mo/Tu centred, Fr right); both are ordinary defects and are owned by the review's **G3** and **G5** rows rather than restated here; the unscheduled affordance itself is `tasks.md` T021, leg `worktrees/161-impl-057-unscheduled`.

**~10:40, and this one reopens the packet**: *"in general our calendar looks nothing like anytype
yet"*. **State: REOPENED.** The packet stood at 7/10 goal criteria with eight of ten acceptance rows
Met, and every one of those was measured value by value: the grid's 188.57px column pitch, the
chip's flat ink pair, the 44px phone chip, 119 unmoved `pm-gantt-*` tokens. None of that is
withdrawn and none of it is wrong. What it does not establish is the thing the operator just judged
— whether the surface, seen whole, reads as Anytype. A value-level Met cannot answer a gestalt
question, and when the two disagree the operator's reading wins (parent D3: only the operator's
confirmation closes). **The side-by-side review has since landed**: `review-ui-calendar-2026-09-06.md`
measures why both readings are true at once — parity was read per element, on the harness's default
theme, never as a whole surface on the operator's `#262626` page — and its fifteen gestalt rows are
now `acceptance-criteria.md` **G1-G15**, each with an observed red, with `tasks.md` T019 the leg
that closes them. The new completion criterion above takes G1-G15 as its threshold rather than a
number invented here. One item is the operator's rather than the rebuild's: the review's **P0-2**,
a Monday-start default, is **Proposed** in `decision-record.md`'s 2026-09-06 note because it
overturns AC-002's written call that the week's start stays locale-driven.

**~10:47, the stagger ruling**, verbatim: *"Stagger overlaps at 45px"*. This **supersedes the 80px
minimum column width landed at `396bcae7`**. ADR-005 named the stagger as the alternative it did
not take — each later overlapping block inset a fixed step, keeping the column's remaining width —
and the operator has now chosen it: overlapping blocks cascade, and the phone week's minimum column
goes back to **45px**, the month grid's own cell. ADR-005 is amended in place with the ruling,
dated, rather than rewritten; T018 stays closed as the record of what landed and **T020** carries
the supersession, folded into T019's rebuild because both touch the same renderer.

**What is not reopened.** The gantt guard (119 tokens, eight identical MD5s), the sheet-grammar
registry (13 surfaces, 31 pairs, exit 0) and the flatten ruling (ADR-002) are untouched by any of
the three. Recorded in `../roadmap.md` §4 rows 62 and 63, §5.A, §6A and §7.
