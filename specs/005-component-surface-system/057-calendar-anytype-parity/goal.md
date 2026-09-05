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

- [ ] **Every element in `spec.md` section 4's anatomy is trued against a named capture, measured,
      and matched.** **Today: no such record exists.** Done is `design-trueup.md` written with a
      capture filename per element and either a measurement or the **design inferred** label with
      its reason.
- [ ] **The month grid, the day cell and the event chip match the captures.** **Today: ours.**
      `src/views/calendar-renderer.ts` constructs **91** distinct `db-calendar-*` classes and
      `styles.css` carries **133** `db-calendar` rules, none of them trued against an Anytype
      screen. Done is each of the three matched to a measured value or carrying a named
      accessibility deviation.
- [ ] **Navigation matches the captured toolbar.** `047` section 5 records Anytype's as month and
      year selects spanning years 0-3000, arrows, and a Today button; plus a "today scroll" that
      positions the current week at the bottom of the viewport. Done is our navigation matching
      that or declining a part of it with a reason.
- [ ] **The date-property picker matches the captured calendar settings menu.**
      `anytype-menu-set-layout-calendar-date-property-{light,dark}-full.png` is the reference.
      **Today: unread.**
- [ ] **The scale switch question is answered by the operator, not inferred.** **Today: three
      scales** — `updateCalendarScale?(scale: "month" | "week" | "day", ...)`
      (`calendar-renderer.ts:82`) with a scale control, menu, popover and segment class family.
      Anytype's capture sweep shows one calendar layout and no scale switch. Done is the operator's
      ruling recorded as an ADR, whichever way it goes.
- [ ] **The unscheduled area is dispositioned.** **Today: ours** — a collapsible backlog drawer
      (`db-calendar-backlog*`, `calendar-renderer.ts:160-163`). Done is either a captured Anytype
      counterpart it is matched to, or a written argument for keeping it as ours.
- [ ] **The phone calendar's every value is labelled "design inferred from desktop".** **Today: no
      phone reference exists and none is coming** — iOS Anytype has no calendar layout. Done is
      zero phone values presented as measured.
- [ ] **`044`'s grammar and `048`'s stacking still hold.** Done is `node
      tools/live/sheet-grammar.mjs` exit 0 with 12 surfaces and 31 pairs green, read from `$?`.
- [ ] **The gantt did not move.** Done is the `pm-gantt-*` class count and the gantt capture hashes
      unchanged against their pre-leg baseline, or any move explained by a named gap.
- [ ] **OPERATOR:** the operator reads the rebuilt calendar on iOS and on desktop and reports it as
      Anytype-shaped, knowing the phone half was inferred. Nothing in this repository closes this row.
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
