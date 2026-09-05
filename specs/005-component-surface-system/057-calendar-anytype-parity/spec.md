---
title: "Feature Specification: Calendar Anytype Parity"
description: "The calendar is ours by shape and Project Manager's by behaviour; the operator has retargeted it to Anytype, and the phone half has no reference to retarget against."
trigger_phrases:
  - "057 spec"
  - "calendar anytype parity"
  - "calendar month grid anatomy"
  - "calendar phone gap"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/057-calendar-anytype-parity"
    last_updated_at: "2026-09-05T23:40:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "trued the nine anatomy rows against the calendar captures"
    next_safe_action: "Run T002's red-first pass, then leg A against design-trueup.md"
    blockers:
      - "The phone calendar has no Anytype capture and never will"
      - "Six-week rows, overflow and chip hover are pixel read owed"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "src/views/calendar-toolbar-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-057-spec"
      parent_session_id: null
    completion_pct: 20
    open_questions:
      - "What a six-week month, an overflowing day and a chip hover look like: pixel read owed"
    answered_questions:
      - "ADR-002 ruled: keep week and day, styled to the month grid"
      - "A4 and A6 are absences, established across all twenty set captures"
      - "The desktop captures are 1:1, not 2x, and the 24 menu files are five distinct menus"
      - "The calendar carries zero pm-* classes, so a class-count threshold would be unobservable here"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Calendar Anytype Parity

<!-- SPECKIT_LEVEL: 3 -->


---

## EXECUTIVE SUMMARY

The calendar shipped in 1.4.6 under `039-calendar-parity-port` as a behavioural parity port of
Project Manager's. On 2026-09-05 ~22:45 the operator retargeted it: *"Same for calendar etc."*,
clarified as *"Board + calendar to Anytype; gantt stays PM."* This packet rebuilds the calendar
against Anytype's captured calendar layout — month grid, day cells, event chips, the unscheduled
area, navigation, the scale switch, the today marker and the date-property picker — and names the
one thing it cannot do: iOS Anytype ships no calendar layout, so the phone calendar has no
reference and every phone value carries the label **"design inferred from desktop"**.

**Key Decisions**: the calendar's own `db-calendar-*` vocabulary stays and its shape is retargeted,
because there is no Project Manager markup here to remove (goal D-note in section 2); the phone gap
is labelled rather than filled (goal D4); the week and day scales are an operator question, not an
inference (goal D6, ADR-002).

**Critical Dependencies**: T001, the capture true-up, gates every geometry value; the operator's
scale ruling gates one whole element; the parent's serialized CSS lane gates every `styles.css` leg.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | In progress — T001 landed |
| **Created** | 2026-09-05 |
| **Branch** | `worktrees/117-phases-056-057` |
| **Parent Spec** | ../spec.md |
| **Phase** | 57 of 57 |
| **Predecessor** | 056-board-anytype-parity |
| **Successor** | None — this is the last phase opened in this program |
| **Handoff Criteria** | The anatomy table in section 4 is complete with no `unknown` cell, ADR-002's scale ruling is recorded, and `acceptance-criteria.md` AC-001 through AC-009 are Met, Waived or Superseded |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 57** of the Component Surface System.

**Scope Boundary**: the calendar view only — `src/views/calendar-renderer.ts`,
`calendar-toolbar-renderer.ts`, `calendar-mini-calendar-renderer.ts`, the calendar block of
`styles.css`, and the calendar's own tests. The board is `056`. The gantt is nobody's:
`037`'s 1:1 Project Manager port stands untouched, and it lives next door in
`calendar-timeline-renderer.ts`.

**Dependencies**:
- `050-anytype-adoption/design-trueup.md` is the design read of record (`050` ADR-003), though it
  is largely silent on the calendar — T001 reads first-hand.
- `044-phone-sheet-alignment`'s seven-element grammar and `048-stacked-sheets`'s stacking model
  are constraints every phone surface here must still satisfy.
- `053-toolbar-and-view-controls` owns the toolbar and the view-settings panel; the calendar's own
  toolbar (`calendar-toolbar-renderer.ts`, 578 lines) is this packet's, and the boundary between
  them is named before the first leg.
- `039-calendar-parity-port` is the predecessor. It is not reopened; it carries a superseding note.

**Deliverables**:
- The per-element anatomy table in section 4, complete.
- An Anytype-shaped calendar with each element trued against a named capture.
- ADR-002: the operator's ruling on whether the week and day scales survive.
- A phone calendar whose every value is labelled as inferred from the desktop capture it came from.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The calendar is shaped by nobody's reference in particular. `039` ported Project Manager's
behaviour but not its markup: `src/views/calendar-renderer.ts` constructs **91** distinct
`db-calendar-*` classes and **zero** `pm-*` classes, and `styles.css` carries **133** `db-calendar`
rules, none of which was trued against an Anytype screen. The operator has now named Anytype as the
target. Three things make this harder than `056`'s board: there is no Project Manager vocabulary to
count down to zero, so the obvious headline threshold would read green on an untouched tree; our
calendar has three scales (`month | week | day`, `calendar-renderer.ts:82`) against a product that
ships one calendar layout among six; and **iOS Anytype has no calendar layout at all**, so the
phone half of the retarget has no reference and cannot get one.

### Purpose
The calendar reads as Anytype's calendar to an operator holding both products open on desktop, with
every adopted value traceable to a named capture, every declined value carrying an accessibility
ground, and every phone value visibly labelled as an inference from the desktop.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The calendar anatomy in section 4, element by element, against the captures named there.
- The date-property picker, against the captured calendar settings menu.
- The unscheduled backlog drawer's disposition: matched, or kept as ours with an argument.
- The scale-switch question, put to the operator and recorded as ADR-002.
- The phone calendar, with every value labelled as inferred from a named desktop capture.

### Out of Scope
- The gantt and the timeline — *"gantt stays PM"*, and Anytype ships no timeline layout. `037`'s
  copy stands. This matters more here than in `056` because the gantt's renderer is the calendar's
  next-door neighbour.
- The board — `056`'s.
- The table view — it stays ours, with Anytype grid patterns adopted where the captures show them
  better; `050`, `053` and `054` already carry those.
- The data model: no Objects, Types or Queries (goal D8).
- Deleting a shipped scale on an inference — goal D6 forbids it until the operator rules.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/calendar-renderer.ts` | Modify | Month grid, day cells, event chips, today marker, the unscheduled area, and the scales per ADR-002 |
| `src/views/calendar-toolbar-renderer.ts` | Modify | Navigation: the month/year selects, arrows and Today button the captures show |
| `src/views/calendar-mini-calendar-renderer.ts` | Modify | Only if T001 finds an Anytype counterpart; otherwise dispositioned as ours |
| `styles.css` | Modify | The calendar block (133 rules), under the parent's serialized CSS lane |
| `src/views/calendar-renderer.test.ts` | Modify | Follow the retargeted shape |
| `src/views/calendar-keyboard-navigation.test.ts` | Verify | Keyboard behaviour must survive a presentation retarget unchanged |
| `src/views/calendar-search-placement.test.ts` | Verify | Must stay green |
| `specs/005-component-surface-system/057-calendar-anytype-parity/design-trueup.md` | Create | T001's capture read, the design record of this packet |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### The Anytype calendar anatomy this packet matches

Nine elements. Every geometry cell is **owed to T001** unless it cites a measurement already taken;
a value labelled *design inferred* was never read off a screen and says so.

| # | Element | What the capture shows | Reference capture |
|---|---------|------------------------|-------------------|
| A1 | **Month grid** | **Measured (T001).** Seven equal columns at a 213.1px pitch across a 1492px grid inset 16px each side; **136px** week rows; 1px `#EBEBEB` / `#292929` rules; a **22px** weekday band whose labels are right-aligned 11px inside the column at ≈12px, Monday first, with **no** weekend tint on the header itself. A month spilling into adjacent weeks keeps the cell's normal background and dims only the day number. **Six-week months are pixel read owed** — all three captured months fit five rows | `anytype-<use-case>-calendar-{light,dark}.png`, ten use cases x two themes |
| A2 | **Day cells** | **Measured (T001).** 136px tall; the date number sits **top-right**, 12px below the cell top and 5px inside the right rule, at ≈16px weight 400; the first chip starts 32px down. Adjacent-month numbers dim to `#C8C8C8` / `#525252` (**1.67:1** / **2.29:1**, declined — §6 R1) while the cell keeps its normal background. **The overflow affordance is pixel read owed**: the busiest captured cell holds 3 chips in a cell that fits 5. `047` section 5's self-loading is behaviour, not presentation | `anytype-content-calendar-calendar-{light,dark}.png`, `anytype-crm-contacts-deals-calendar-{light,dark}.png` |
| A3 | **Event chips** | **Measured (T001).** A flat row on **no background at all** — no fill, tint, border, radius or accent bar; **20px pitch**, 14px ink, a ≈14x12px leading icon 10px in with an ≈8px gap, label ≈12px `#292929` / `#DDDDDD`. **The colour source is: there is none** — every chip in twenty captures is the same grey pair. Truncation and the overflow affordance are **pixel read owed**: no chip truncates and no cell overflows in the set | `anytype-project-tracker-calendar-{light,dark}.png`; the chip's own menu is the **same capture** as the day menu — see the inventory note |
| A4 | **Unscheduled area** | **Absent, established (T001).** Zero non-background pixels below the grid's bottom rule across all 10 light and all 10 dark set captures. No drawer, no collapsed strip, no toggle. Ours is **kept and argued**, not deleted — `design-trueup.md` §A4 — and restyled to the month grid's measured values | all twenty `anytype-<use-case>-calendar-{light,dark}.png` |
| A5 | **Navigation** | **Measured (T001).** A month select and a **separate** year select, both ≈16px `#252525`, 12px apart; then `‹` `Today` `›` at fixed x in all twenty. The month list is 12 rows at a 28px pitch in a 224x352px panel; the year list is scrollable in a 225x368px panel. **The 0-3000 range and the "today scroll" stay `047`-sourced and are not observable in a static capture** — labelled, never quoted as measured | `anytype-menu-calendar-month-select-{light,dark}.png`, `anytype-menu-calendar-year-select-{light,dark}.png` |
| A6 | **Day/week/month switch — as Anytype does or does not have it** | **Absent, established (T001).** Zero ink in the header band between the month title and the `‹ Today ›` cluster across all 10 light and all 10 dark set captures; the layout panel's whole settings surface is `Date Property` and `Show icon`. **ADR-002 is Accepted**: the operator ruled *"Keep week and day, styled to the month grid"* — the month view goes Anytype 1:1 and the two extra scales survive as **ours, restyled to the month grid's measured values**, never as an inference from Anytype | `anytype-menu-set-layout-calendar-{light,dark}.png`; all twenty set captures |
| A7 | **Today marker** | **Measured (T001).** A **26 x 24px fully-rounded `#3C7FFB` disc** with a white numeral at the day number's own size, right edge 5px inside the cell's right rule and top 7px below it; and the today cell **drops the weekend tint** back to the plain surface. White on that blue is **3.74:1** and is declined for `#216DFA` at 4.53:1 — `design-trueup.md` §6 R4. Not readable in the set captures, which all show a month with no today; read on the day-menu capture, whose Sat 5 September is today | `anytype-menu-calendar-day-menu-{light,dark}-full.png` |
| A8 | **Date-property picker** | **Measured (T001).** A `Date Property ›` row in the 358 x 298px layout panel, value right-aligned; the submenu is **224px wide at a 28px row pitch**, nine date properties each with a leading icon, the current one checkmarked, an `#EBEBEB` divider, then `+ Add Property`. Beside it a `Show icon` toggle, **26 x 16px `#6E9EFC`** (2.64:1, declined — §6 R5), which is what gates A3's chip icon | `anytype-menu-set-layout-calendar-date-property-{light,dark}.png` |
| A9 | **Day menu** | **Measured (T001).** A **224 x 72px** panel, 2 rows at a 28px pitch with 8px panel padding, hover fill `#F2F2F2`: `Open as Object`, `New Object`. **This is also A3's item menu** — the two captures are byte-identical, so one menu serves both and building two would be an invention | `anytype-menu-calendar-day-menu-{light,dark}.png` |

**Capture inventory, counted rather than quoted, and corrected by T001.** The calendar set is **20**
files — `screenshots/anytype/desktop/sets/<use-case>/anytype-<use-case>-calendar-{light,dark}.png`,
ten use cases by two themes. (A `ls` glob on `*calendar*` returns 30 because the `content-calendar`
use-case folder matches by name; the calendar-layout captures are 20.) The calendar menu crawl is
**24** files. The file count survived T001; the **menu** count did not.

*This row said six menus. There are **five distinct surfaces in those 24 files**.* The day-menu and
item-menu captures are byte-identical — `anytype-menu-calendar-day-menu-light-full.png` and
`-item-menu-light-full.png` share MD5 `28d38b3a11620d04ef06e7e86c65b5c5`, the dark pair shares
`6e9f31e1629cbffad9a1183148a8f963`, and the clipped light pair shares
`9c74340bc6bdd972363f80706305a4b5`. The five are: the day/item menu, the month select, the year
select, and the two `set-layout-calendar` panels (base and date-property). *The opening brief said
"calendar 4 menus", this row said six, and the answer is five.* A6's warning about asserting from
one screen has a counterpart here: **counting files is not counting surfaces.**

**One more premise T001 overturned, recorded where it was written rather than only in the true-up.**
Every desktop capture in this set is **1 device pixel to 1 CSS pixel**, not 2x: the grid rules are
one device pixel wide, the frame is 2168 x 1217 with an odd height, and `051`'s true-up reached the
same conclusion independently on the same window. Any later leg that halves these numbers will build
a calendar at half scale.

### The phone gap, stated plainly

**There is no iOS Anytype calendar reference and there will not be one.** `screenshots/anytype/mobile/`
contains no calendar capture of any kind: the iOS view-layout sheets are picker, gallery and kanban
(`anytype-mobile-sheet-view-layout-{picker,gallery,kanban}-{light,dark}.png`), and the 104
`mobile/sheets/` captures include no calendar surface. iOS Anytype does not ship a calendar layout.

Every phone-calendar value this packet writes therefore carries the label **"design inferred from
desktop"** and names the desktop capture it was inferred from. This is not a caveat to be dropped
once the work looks right; it is REQ-007, and AC-007 counts it.

### The three-scale question, answered by the operator on 2026-09-05 ~23:20

`updateCalendarScale?(scale: "month" | "week" | "day", anchorDateKey, label?)`
(`src/views/calendar-renderer.ts:82`) is a shipped, working feature with its own control, menu,
popover and segment classes, its own keyboard navigation tests, and a week body with all-day rows,
hour gutters and timed events — roughly a third of the 91-class vocabulary. Anytype ships one
calendar layout.

Deleting two of three scales to match a product that never had them is a large, irreversible,
operator-visible change that the operator did not ask for; keeping them is a visible deviation from
*"1:1 Anytype"*. Goal D6 made this the operator's call, put as **ADR-002**. It was not inferred.

**The ruling, verbatim: *"Keep week and day, styled to the month grid."*** ADR-002 is **Accepted**.
The month view becomes Anytype 1:1 against `design-trueup.md` §4's measured values. The week and day
scales survive as **our extension**, restyled to that same grid — the same rules, tints, today
marker, chip grammar and header. Their values are labelled **"ours, restyled to the month grid's
measured values"** and name the §2c row each number came from; they are never labelled *inferred
from Anytype*, because twenty captures contain nothing to infer a week or day scale from and
claiming otherwise would be the fabrication the phone label below exists to prevent.

One deviation the ruling creates: the scale control stays in the header, so ours carries four
controls where Anytype's carries three. ADR-002 authorises it; it is not a measured value.

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Every one of the nine anatomy elements is trued against a named capture by an image-capable leaf reading it px by px, recorded in `design-trueup.md` with either a measurement or the **design inferred** label and its reason |
| REQ-002 | The month grid, the day cell and the event chip each match a measured captured value or carry a named accessibility deviation with its ratio or size |
| REQ-003 | Navigation matches the captured toolbar — month and year selects, arrows, Today button — or declines a part with a written reason |
| REQ-004 | The date-property picker matches `anytype-menu-set-layout-calendar-date-property-*` |
| REQ-005 | ADR-002 carries the operator's ruling on the week and day scales, and the implementation follows it |
| REQ-006 | The unscheduled backlog drawer is dispositioned: matched to a captured counterpart, or kept as ours with a written argument. Absence is concluded only after all twenty calendar captures are read |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-007 | Every phone-calendar value carries the label **"design inferred from desktop"** and names its source capture. Count of unlabelled phone values → 0 |
| REQ-008 | `044`'s seven-element grammar and `048`'s stacking model hold after every leg — `tools/live/sheet-grammar.mjs` exit 0, 12 surfaces and 31 pairs |
| REQ-009 | The gantt is unmoved: the `pm-gantt-*` class count and the gantt capture hashes match their pre-leg baseline, or a move is explained by a named gap |
| REQ-010 | The calendar's keyboard navigation survives the retarget: `calendar-keyboard-navigation.test.ts` and `calendar-search-placement.test.ts` green **without modification** |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Nine of nine anatomy elements carry a measurement or a labelled inference in
  `design-trueup.md`, each with a named capture file.
- **SC-002**: Unlabelled phone-calendar values → **0**.
- **SC-003**: ADR-002 has a status other than Proposed — the operator ruled either way.
- **SC-004**: `calendar-keyboard-navigation.test.ts` and `calendar-search-placement.test.ts` green
  with **0** lines changed.
- **SC-005**: `npm run gate` exit 0 read from `$?`, `sheet-grammar.mjs` 12 surfaces and 31 pairs
  green, and the `pm-gantt-*` baseline unmoved.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | T001's image-capable leaf | Every geometry value is owed to it | Goal D1 makes it a gate. `054` ADR-005: a measurement-only leg records "pixel read owed" rather than substituting a DOM reading |
| Dependency | The operator's ADR-002 ruling | One whole element (A6) and roughly a third of the class vocabulary hang on it | Ask early, in the same pass as `056`'s first legs, so the answer arrives before the calendar legs start |
| Dependency | The parent's serialized CSS lane | 133 calendar rules in a file four other packets are editing | Take the lane per leg |
| Risk | The gantt renderer is the calendar's neighbour and shares the stylesheet | A calendar leg breaks `037`'s verified 1:1 parity | REQ-009: baseline the `pm-gantt-*` count and gantt capture hashes before leg 1, re-read after the last. `037`'s in-repo parity was 60 of 60 classes with zero divergence at `30c4b746` and must stay so |
| Risk | The phone calendar is designed from desktop inference and drifts | Ships a phone surface nobody has a reference for and nobody labelled | REQ-007 counts unlabelled values; goal D4 makes the label mandatory, not decorative |
| Risk | Absence is concluded from one capture | The `050` error, five times over: read one panel, call it the product default | A6 and A4 both require all twenty captures read before absence is recorded |
| Risk | A behavioural port is mistaken for a markup port | A criterion is written as a class count, reads green on an untouched tree, and certifies nothing | Stated in goal section 1 and in section 2 above: 0 `pm-*` classes here, so per-element parity is the only observable form |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Calendar render over the `049` 326-record mock catalogue must not regress against
  the pre-leg baseline by more than 10%, same machine, same session. The day cell's self-loading
  behaviour (A2) is a per-cell cost and is measured rather than assumed cheap.

### Security
- **NFR-S01**: No new network reads. The calendar reads vault frontmatter dates and nothing else.

### Reliability
- **NFR-R01**: `npm run gate` exit 0 and `npm run replay` holding with a reversed 0, both read from
  `$?` rather than through a pipe, after every leg.

---

## 8. EDGE CASES

### Data Boundaries
- Empty input: a month with no scheduled records renders the captured empty grid, not a blank pane.
- Maximum length: a day holding more objects than the cell fits uses the captured overflow
  affordance (A2), which our `db-calendar-more-events` may or may not already match.
- A record with an invalid or unparseable date: the existing invalid-event path
  (`getCalendarInvalidEventCount` / `openCalendarInvalidEvents`) is behaviour, not presentation, and
  survives the retarget unchanged.
- Month boundaries: a record spanning a month edge renders its segment as the captures show, read
  from a use case whose data crosses one.

### Error Scenarios
- A date property that is deleted while the calendar is open: the analogue of the board's
  deleted-group-relation empty state. Whether Anytype's calendar has one is owed to T001.
- A timezone or DST boundary landing an event on the adjacent day: existing behaviour, unchanged;
  the retarget must not silently alter which cell a record lands in.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 20/25 | Files: 8, LOC: ~800, Systems: calendar renderer, its toolbar, mini-calendar, stylesheet |
| Risk | 13/25 | Auth: N, API: N, Breaking: Y — it may delete two shipped scales, and it shares a stylesheet and a file neighbourhood with the gantt |
| Research | 14/20 | Nine elements against 44 capture files, plus a proven absence to establish |
| Multi-Agent | 8/15 | Workstreams: 2 — an image-capable true-up leaf, then implementation legs |
| Coordination | 8/15 | Dependencies: 039, 044, 048, 050, 053, the operator's ADR-002, and the serialized CSS lane |
| **Total** | **63/100** | **Level 3** |

`recommend-level.sh --loc 800 --files 10 --architectural` returns 63/100 at 92% confidence, which
is **Level 2** on the script's own thresholds (`level_2_max` 69), and a phase score of 10/50, below
the 25 threshold — a standard child. It is scaffolded at **Level 3** under the go-higher rule and
for consistency with every peer family packet (`050`-`055`). The script's own figure is recorded
here rather than replaced by the judgment that overrode it.

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---------|-------------|--------|------------|------------|
| R-001 | A geometry value is written from an unopened capture | H | M | Goal D1; the **design inferred** label; `054` ADR-005 |
| R-002 | Two shipped scales are deleted on an inference | H | M | Goal D6 and ADR-002: the operator rules, this packet implements |
| R-003 | A calendar leg moves a gantt pixel | H | M | REQ-009 baseline and re-read |
| R-004 | The phone calendar ships unlabelled inferences | M | H | REQ-007 counts them; the count must be 0 |
| R-005 | Absence concluded from one capture | M | H | All twenty captures read before A4 or A6 records an absence |
| R-006 | Keyboard navigation breaks under a presentation retarget | M | M | REQ-010's unchanged-test guard |

---

## 11. USER STORIES

### US-001: The operator opens the calendar next to Anytype (Priority: P0)

**As an** operator holding both products open on desktop, **I want** our calendar to read as
Anytype's calendar layout, **so that** the side-by-side shows a match rather than a third design.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

### US-002: A reader can tell a measurement from an inference (Priority: P0)

**As a** later session or reviewer, **I want** every phone-calendar value to say it was inferred
from the desktop and name the capture, **so that** I never mistake an inference for a reference
that does not exist.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

## 12. OPEN QUESTIONS

**Two of the three closed on 2026-09-05.**

- ~~**ADR-002, for the operator**: do the week and day scales survive?~~ **Answered ~23:20:**
  *"Keep week and day, styled to the month grid."* ADR-002 Accepted.
- ~~Does the unscheduled backlog drawer have an Anytype counterpart?~~ **Answered by T001:** no, and
  not from one screen — zero non-background pixels below the grid rule in all twenty set captures.
  Kept as ours with the argument in `design-trueup.md` §A4.
- **Still open. What does the phone calendar target?** There is no reference and there will not be
  one. The desktop capture is the only source, and goal D4 requires every value derived from it to
  say so.

**Three opened by T001 and owed to a capture nobody has.** Each is **pixel read owed** in
`design-trueup.md` §4, not filled with a plausible number: what a six-week month does to the row
height; what the overflow affordance looks like when a day holds more than five objects; and what
hover, focus and press do to a chip that now has no box to lift.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Decision Records**: See `decision-record.md`

---
