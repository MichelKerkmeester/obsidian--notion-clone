---
title: "Decision Record: Calendar Anytype Parity"
description: "The decisions this packet takes, and the one it deliberately leaves open for the operator."
trigger_phrases:
  - "057 decision record"
  - "calendar parity adr"
  - "calendar scale ruling adr-002"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/057-calendar-anytype-parity"
    last_updated_at: "2026-09-06T20:30:00Z"
    last_updated_by: "land-calendar-ui-review"
    recent_action: "The operator's gestalt read reopened the phase; P0-2's Monday default is Proposed"
    next_safe_action: "Ask the operator to rule P0-2, the Monday-start default with the setting as override"
    blockers:
      - "P0-2 needs the operator: a Monday-start default overturns AC-002's locale-driven call"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "specs/005-component-surface-system/039-calendar-parity-port/decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-057-adr"
      parent_session_id: null
    completion_pct: 70
    open_questions:
      - "Does the calendar default to Monday regardless of locale, keeping the setting as an override?"
    answered_questions:
      - "ADR-002 is ruled: keep week and day, styled to the month grid"
      - "The calendar's thresholds are per-element because it carries zero pm-* classes"
      - "Parity by default is inherited from 051 ADR-007 without re-asking"
      - "ADR-002's implementation half is partly landed: the weekend tint and nav cluster carried to week and day, the rule colour and today marker did not"
      - "ADR-002's colour question is answered: the timed blocks flatten to chip ink, carried as T017"
      - "T017 landed: the week/day timed block reads the month chip's flat ink, no separator rule needed since the slot lines show through"
      - "The 2026-09-06 gestalt read changes no ADR: ADR-001 through ADR-005 stand unaltered"
---
# Decision Record: Calendar Anytype Parity

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:decisions -->
## ADR-001: The calendar's parity target moves to Anytype

**Status**: **Accepted** — 2026-09-05 ~22:45, operator.

**Context.** `039-calendar-parity-port` landed and shipped in 1.4.6 as a parity port of Project
Manager's calendar, and stands at 5 of 6 in `../roadmap.md` section 5.A. It was a **behavioural**
port: `src/views/calendar-renderer.ts` constructs 91 `db-calendar-*` classes and **zero** `pm-*`
classes.

Then the operator saw Anytype. On 2026-09-05 ~22:45, verbatim:

> *"Board UI/UX should almost be 1:1 Anytype"*

> *"Same for calendar etc."*

and, asked how far "etc." reached:

> *"Board + calendar to Anytype; gantt stays PM"*

> *"Make sure we have phases for that"*

**Decision.** The calendar is rebuilt against Anytype's captured calendar layout. The gantt is not:
`037`'s 1:1 Project Manager port stands, and rows 37/38's *"align closer"* now applies to it alone.

**Why the split is coherent.** Anytype ships six set layouts — Grid, Gallery, List, Kanban,
Calendar and Graph — and no timeline among them. There is no Anytype gantt to port to. The table is
a third case: it stays ours, with Anytype grid patterns adopted where the captures show them
better, which `050`, `053` and `054` already carry.

**Consequences.**
- `039`'s port is superseded rather than deleted; its record keeps its history and carries a note
  pointing here.
- Unlike `056`, there is no Project Manager markup to remove. The retarget is per-element, which
  costs more to verify and is the only observable form — see ADR-003.
- The phone half has no reference and cannot get one; goal D4 and AC-007 handle that explicitly.

**Alternatives rejected.**
- *Reopen `039`.* It shipped and verified a different target; reopening would make its record
  contradict itself, and the operator asked for phases explicitly.
- *Treat the calendar as covered by `056`.* Rejected: different renderer, different reference set,
  different phone situation, and a different kind of threshold. One packet would have hidden all
  four differences.

---

## ADR-002: Do the week and day scales survive?

**Status**: **Accepted** — 2026-09-05 ~23:20, operator: *"Keep week and day, styled to the month
grid."* Put at T003 with T001's absence finding attached, and answered in the same pass.

**Context.** Ours has three scales: `updateCalendarScale?(scale: "month" | "week" | "day",
anchorDateKey, label?)` (`src/views/calendar-renderer.ts:82`). Around them sit seven scale-switch
classes (`db-calendar-scale-button`, `-control`, `-menu`, `-menu-chevron`, `-menu-label`,
`-popover`, `-segment`), a full week body of 22 more (`db-calendar-week-*`: all-day rows, hour
gutters, time columns, timed events, a current-time line), a day view, and
`calendar-keyboard-navigation.test.ts` exercising them. That is roughly a third of the calendar's
91-class vocabulary.

Anytype ships **one** calendar layout among six, and no scale switch appears anywhere in
`anytype-menu-set-layout-calendar-*`. T001 confirms that absence across all twenty set captures
before this question is put — an absence asserted from one screen is the mistake `050` made five
times and was corrected for five times.

**Decision.** **The week and day scales stay, styled to the month grid.** The month view becomes
Anytype 1:1 — every value in `design-trueup.md` §4 marked *adopt* applies to it without
qualification. The week and day scales survive as **our extension**, taking the month grid's
measured vocabulary: the same 1px `#EBEBEB` / `#292929` rules, the same `#F7F7F7` / `#1E1E1E`
weekend tint, the same `#216DFA` today marker, the same flat 20px-pitch chip with a 10px inset and
an 8px icon gap, and the same header grammar.

This was an operator call because it is large, irreversible, operator-visible, and not something
*"almost 1:1 Anytype"* settles on its own: parity said remove them, and the operator has never asked
for a working feature to be deleted. The ruling resolves it the other way, and this ADR is what
authorises the resulting deviation — ADR-004 does not, because keeping them is not an accessibility
ground.

**Consequences of each answer, both recorded because the ADR asked for both.**
- *Remove*, not taken: the calendar becomes month-only; seven scale-switch classes, twenty-two
  `db-calendar-week-*` classes, the timed-event body with its hour gutters and current-time line,
  the day view and `calendar-keyboard-navigation.test.ts`'s coverage of all of it go with them —
  roughly a third of the 91-class vocabulary. Parity is closer, and shipped, tested,
  operator-visible function is gone.
- *Keep*, taken: a visible deviation from the stated target, recorded here with its reason rather
  than left as drift. Goal D3 does not cover it, so this ADR authorises it.

**Consequences of the ruling as taken.**
- Every week and day value is labelled **"ours, restyled to the month grid's measured values"** and
  names the `design-trueup.md` §2c row it took its number from. It is never labelled *inferred from
  Anytype*: twenty captures contain nothing to infer a week or day scale from, and calling it an
  inference would be the same fabrication AC-007's phone label exists to prevent.
- The scale control stays in the header, so our header carries four controls where Anytype's carries
  three (`design-trueup.md` §A5, §7). That deviation is created by this ruling, sits inside its
  scope, and is not presented as a measured value.
- `plan.md` section 7's "deletion lands as its own last leg" contingency is moot and does not run.
- **Landed 2026-09-06 (T005/T007), and the landing note is corrected here 2026-09-06 after a
  measured read-back.** The note originally said *"the shared tokens (rule colour, weekend tint,
  today marker, header grammar) now apply to week and day."* Two of those four do not, measured on
  `screenshots/notion-clone/views/calendar-week-time-grid-desktop-light.png`: the week body's slot
  lines are `#F1F1F1`/`#E1E1E1` (`styles.css:16922`, `:16931`, untouched by the leg), not the
  month grid's `#EBEBEB`/`#292929`; and the today marker is `#5E33EB` off `--db-current-time-color`
  (`styles.css:18879`, `:18892`, `:18905`) — the capture holds **zero** `#216DFA` pixels. The
  weekend tint did carry over, and so did the nav cluster; the header *title* did not, because
  week and day still build the one-string form (`calendar-renderer.ts:1731`, `:1748`) while only
  the month header takes the two selects. `tasks.md` T015 R3-R4 carry the gap. It is unfinished
  work, not a reversal of the ruling.
- One further scope line was drawn implementing it: the week/day time grid's own timed-event blocks
  (`db-calendar-week-timed-event`) are duration-proportional cards, not fixed-pitch rows, and
  Anytype ships no time-grid view to measure a flat chip treatment against — they keep their
  existing coloured presentation rather than being flattened to the month chip's grammar. The
  **geometry** half of that reasoning holds: a block whose height encodes a duration cannot take a
  fixed 20px pitch, and nothing in twenty captures shows what it should take instead. The
  **colour** half is a separate question and is put to the operator below rather than settled here.

**Alternatives rejected.**
- *Decide it in-repo.* Rejected under goal D6. Inferring a deletion of shipped, tested,
  operator-visible functionality from a capture absence is exactly the class of silent decision the
  program's D3 and section 7 exist to prevent.

**OPEN QUESTION for the operator, raised 2026-09-06, not decided here.** *"Styled to the month
grid"* and the flat-chip grammar this ADR itself listed as one of the five shared values both point
at the timed-event block's **colour**, and the geometry argument above does not reach it. The month
chip lost its per-event accent bar and its 7% tint under ADR-004 because twenty captures show no
per-event colour anywhere in the reference calendar. The week and day timed blocks keep both
(`db-calendar-week-timed-event`, visible as the blue, green and orange cards in
`screenshots/notion-clone/views/calendar-week-time-grid-desktop-light.png`). ADR-004 does not
authorise that: keeping a colour is not an accessibility ground. This ADR authorises *keeping the
scales*, which is not the same permission. So the question is narrow and it is the operator's:

> **Does *"styled to the month grid"* strip the timed blocks' per-event colour too, or does the
> time grid keep colour because a duration-proportional block has no label rail to carry the
> distinction the month chip carries in text?**

Both answers are defensible and neither is inferable from a reference that ships no time grid.

**ANSWERED 2026-09-06 ~04:45, operator, verbatim:**

> *"Flatten to chip ink"*

**The colour question closes the first way.** The week and day timed blocks take the month chip's
flat ink: no per-event fill, no accent bar, the same text-carried distinction the month chip
already uses. The geometry half of the block stays exactly as this ADR settled it — a
duration-proportional height is not a fixed 20px pitch, and the ruling does not touch it.

**Not implemented in the leg that recorded this.** The ruling arrived after that leg's stylesheet
edits had landed and been captured, and repainting every timed block is a visible change to a
shipped surface that owes its own recapture and its own read-back. It is carried as `tasks.md`
T017 with the threshold it has to meet and the value that is red today, rather than folded in
unmeasured — the same treatment T015's own residuals got. Until T017 lands, the blocks still carry
their colour, and `screenshots/notion-clone/views/calendar-week-time-grid-desktop-light.png` is
the record of what that looks like.

**Landed 2026-09-06 (T017).** `.db-calendar-week-timed-event` took the exact declarations
`.db-calendar-month-segment` carries — `background: none`, `border: 0`, `border-radius: 0`, and
the literal `#292929` / `#DDDDDD` ink pair, inherited by the title the same way the month title
inherits it from its own parent. Recaptured and read pixel-by-pixel: **0** device px of the three
former per-event fills and **0** of the former accent bar, against the 138,411 / 9,873 / 8,336 red
value.

**The one design question the ruling did not answer — whether a flattened block still needs
something to separate it from its neighbour — is settled here rather than left implicit.** Twenty
Anytype captures show no time-grid view at all, so there is no reference to read a separator off
either way. No separator rule was added. Dropping the block's own fill means the week grid's
already-landed slot lines (`.db-calendar-week-slot-line`, the `#EBEBEB`/`#292929` pair T015 R3
took from the month grid) now show through where the block used to paint over them, which is the
same "the cell surface shows through" reasoning the month chip's own flat background reads under —
so the existing grid, not a new rule, is what separates one block from the next. If a future
capture ever shows a genuine gap between back-to-back blocks, that is a geometry question (padding
between blocks), not a colour one, and does not reopen this ADR.

**A capture did show one, on the phone, and it is filed under that disposition rather than as a
reopening.** The verification read of the landed captures found the separator question was never the
binding one here: no two blocks in the corpus touch vertically, and the overlapping pair splits the
column horizontally with an 8px gap between them, so the slot lines are enough on desktop at both
themes. On a phone they are not enough for a different reason. Seven week columns inside ~286px
leave each about 41px, an overlapping pair halves that, and after the block's inset and
`.is-phone .db-calendar-week-event-content`'s padding there is no width left for a title —
`calendar-week-time-grid-mobile-{light,dark}.png` decode the 14:00 pair as one clipped glyph and no
ink at all, where they previously read as an orange and a blue bar. The fill was carrying *"an event
is here"* by itself at that width. That is a width fact about the phone column, not a colour one:
the ruling is implemented exactly as given, and the remedy — a minimum column width, a wrapped
phone title, or the 1px hairline declined above — changes either a value this ruling settled or a
geometry this ADR froze, so it is the operator's and is carried as `tasks.md` T018.

**The operator ruled, 2026-09-06 (~08:55), verbatim: *"Phone week scrolls horizontally with a
minimum column width"*.** The geometry disposition this ADR named is exercised rather than
reopened: the phone week grid takes a minimum column width and scrolls horizontally past it. The
flatten stays exactly as ruled, the declined 1px hairline stays declined, and the phone title stays
clipped rather than wrapped. Implementation is `tasks.md` T018's, and the row stays open until it
lands.

---

## ADR-003: The calendar's thresholds are per-element, not a class count

**Status**: **Accepted** — orchestrator decision, and it is a correction rather than a preference.

**Context.** `056`'s headline criterion is a count: Project Manager classes in the board renderer,
39 → 0. The obvious move was to mirror it here. Measured on `3407dab0`,
`grep -o "pm-[a-z-]*" src/views/calendar-renderer.ts | sort -u | wc -l` returns **0**.

**Decision.** The calendar's criteria assert per-element parity against named captures instead.

**Consequences.**
- AC-002 costs more to verify: three elements measured on the production render path at two themes,
  rather than one `grep`.
- It is the only form that can be observed failing today, which is goal D2's whole point.
- The absence of the mirrored threshold is stated in `checklist.md` rather than left for a reader
  to notice, because a criterion that is missing for a good reason and one that was forgotten look
  identical afterwards.

**Alternatives rejected.**
- *Write the class-count criterion anyway.* It would have read **green on an untouched tree**.
  `050`'s true-up found six such false premises in its own criteria; this is the seventh, caught
  before it was written rather than after it was believed.

---

## ADR-004: Parity by default, with accessibility as the only ground for declining

**Status**: **Accepted** — inherited from `051` ADR-007 (operator: *"Yes, parity by default"*,
2026-09-05 ~18:30), applied here without re-asking.

**Decision.** Every captured value is adopted. The only permitted grounds for declining one are
WCAG 1.4.11 (non-text contrast), WCAG 1.4.3 (text contrast) and a 44px touch floor, each named with
its measured ratio or size.

**Consequences.**
- ADR-002's "keep" branch, if the operator takes it, is **not** covered by this rule — it is a
  deviation on product grounds, which is why it needs its own accepted ADR rather than a footnote.
- `050`'s two refusals carry over: the `#232323` row highlight at 1.14:1, and colour-only
  active-state signalling.

---

## ADR-005: T018's phone week/day time grid gets a minimum column width, not a wrapped title or a hairline

**Status**: **Accepted** — 2026-09-06 ~08:55, operator, verbatim option: *"Phone week scrolls
horizontally with a minimum column width."* `roadmap.md` §6A carries the same ruling as an
operator decision on record.

**Context.** T018 found that ADR-002's flatten (T017) costs the phone an overlap-column timed
block its only remaining way to read as "an event is here": with no per-event fill, a halved
column at the phone's default width leaves the title's own text box a handful of device pixels
wide, decoding as a clipped glyph or no ink at all. Three candidate remedies were named and none
of them is free: a minimum column width (widens the grid, may need horizontal scroll), a wrapped
rather than clipped phone title (reopens the flat 20px/44px chip pitch T015 and the phone touch
floor both settled), or the 1px shared hairline ADR-002 itself declined when it ruled the existing
slot lines were separator enough. Each spends a value or a geometry this packet had already
closed, which is why T018 named the choice the operator's rather than picking one in-repo.

**Decision.** **A minimum column width, sized to what a SPLIT column still reads at.** The exact
figure is **80px**.

The first pass took the ruling's parenthetical literally and landed **45px**, the month grid's own
phone cell. That value is faithful to the wording and fails the sentence beside it. Measured on
the recaptured phone capture at DPR 2, the month grid's phone cell is a 87.4 device px pitch
(43.7 CSS px) with 84-86 device px of content, so 45px is indeed "about the month grid's cell" —
but a day carrying two events in the same hour splits its column, and the halved block pays the
block inset and the content padding out of that half. At 45px the split block's title paint box is
**4.5px and 0.5px** — zero glyphs. The recaptured 45px files read the same way: the overlap pair
decoded **8 and 2 device px** of title ink, a partial "D" and a sliver of "1", against **4 and 0**
before the fix. The ruling says blocks always have room for a title; 45px moved that reading from
nothing to nothing.

80px is the measured point where it stops being nothing. Swept on the week fixture at 402px, the
split block's title paint box goes 4.5px at 45px → 14px at 64px (one glyph) → 18px at 72px (two)
→ **22px at 80px, three glyphs plus the ellipsis** — the same legibility an UNSPLIT block already
has at the month cell's own width. A literal first word ("Design" in the fixture) would need
114px, which spends more than the defect costs. 80px is also the floor this product already calls
a readable week/month calendar column: `getCalendarColumnWidthRange` clamps a dragged custom
column to it. The two arrived independently and agree, and the operator's "readable minimum" is
the half of the ruling that binds when the two halves cannot both hold.

Below that width the week and day time grids (`.is-phone` only; the day scale carries the same
`db-calendar-week` class) now pan horizontally inside their own scroll boxes rather than shrinking
columns further — three independent tracks (header day-names, all-day segments, timed-event
columns) since the header/all-day pair sits inside the vertically `position: sticky` wrap and a
single new scrolling ancestor there would swallow that stickiness; `syncPhoneWeekHorizontalScroll`
(`calendar-renderer.ts`) mirrors `scrollLeft` across the three so they read as one surface, and
scrolls today's column into view on open. The hour gutter is a separate, un-scrolled 52px grid
column in each row, so it never leaves the viewport. Desktop is untouched — every new rule is
`.is-phone`-scoped, added beside the shared default rules rather than edited into them.

**What it costs.** Seven 80px columns need 560px against the ~286px a 402px phone leaves for them,
so roughly half a week is in frame at a time. That is the trade the ruling chose when it chose
scrolling, taken at the width the readability half of the ruling actually requires.

**Why not the other two.** A wrapped title reopens the flat chip pitch (20px desktop, 44px phone)
T015 and the touch floor both fixed at a specific number — the timed block's height is
duration-proportional, but its *title* taking two lines mid-block is a font-metrics change the
chip grammar was never asked to carry, and nothing in twenty Anytype captures shows a two-line
week/day title to measure it against. The 1px hairline is ADR-002's own declined option, kept
declined here: the defect is a title with nowhere to sit, not an ambiguous boundary between two
blocks, and a separator does not widen anything.

**Consequences.**
- `styles.css` gains one new token, `--db-calendar-phone-week-col-min: 80px`, read by
  `minmax(var(--db-calendar-phone-week-col-min, 80px), 1fr)` everywhere the phone week/day grid
  used to read `minmax(0, 1fr)` — a token per the ruling's own instruction to write the value
  once, not a literal repeated at each call site.
- The grid's per-track `min-width: auto` (the implicit grid-item floor, distinct from the
  `minmax()` track minimum above) has to be overridden to `0` on the header and all-day tracks, or
  the un-overridden implicit floor would grow those rows past the viewport instead of letting the
  new `overflow-x: auto` contain it — a page-level overflow, which `tools/live/sheet-grammar.mjs`'s
  overflow sweep must stay green against.
- `calendar-pinned-values.test.ts` pins the token's value and the two synchronised tracks'
  `minmax()` + `overflow-x` declarations, and `render-assertions.mjs` gained a phone-profile
  scenario (`calendarOverlapTimed`) asserting the overlap pair's title carries visible ink past a
  measured floor — red on the pre-ruling geometry, green after. The floor is **16px**, set between
  the two states the real renderer measures at a 286px container: token at `0px` gives a 8px block
  and **3px and 1px** of title ink; the shipped 80px gives a 32px block and **27px and 25px**.
- The pan was confirmed on the engine a phone actually runs. In WebKit and in Chromium alike the
  seven columns resolve at 80px, the three tracks report `scrollWidth` 560 against `clientWidth`
  286/294, driving the body track to `scrollLeft` 200 moves the header and all-day tracks to 200,
  and today's column scrolls itself into the body's box on open (`scrollLeft` 0 → 137 Chromium,
  0 → 133 WebKit). `document.documentElement` and `document.body` both stay 402/402 with
  `scrollLeft` 0, so the pan is contained and the page does not scroll sideways.
- **Named, not taken:** the halving itself is the producer. Staggering overlapping blocks the way
  a phone calendar usually does — each later block inset a fixed amount and keeping the column's
  remaining width — would give every block a readable title at the month cell's own 45px and cost
  no extra panning at all. It changes `calendar-renderer.ts`'s overlap layout rather than a width,
  which is a different mechanism from the one the ruling named, so it is recorded here for the
  operator rather than folded into this landing.

**Alternatives rejected.** Decide it in-repo, without naming a candidate to the operator: rejected
under the same reasoning ADR-002 gave its own open question — the geometry a fixed value spends is
one this packet already closed once (T015's chip pitch, the phone touch floor), and re-closing it
silently is the class of decision goal D6 exists to route to the operator instead.

---

## Note, 2026-09-06 ~10:40: the operator's gestalt read reopens the phase, and P0-2 is proposed

**Not an ADR, and deliberately so — nothing is decided here.** With eight of ten
`acceptance-criteria.md` rows Met, the operator opened 0.0.29 on desktop beside Anytype and said,
verbatim, *"in general our calendar looks nothing like anytype yet"*. That judgement outranks the
met rows and reopens the phase, and `review-ui-calendar-2026-09-06.md` measures why both are true
at once: every met row is true of one element on one theme, and parity was never read as a whole
surface on the operator's `#262626` page, where our `#282828` rule is two levels off the page and
the `#1E1E1E` weekend tint falls *darker* than the page that Anytype's falls lighter than. The
review's fifteen gestalt rows are now carried as `acceptance-criteria.md` G1-G15 with an observed
red each, and `tasks.md` T019 is the leg that closes them; none of ADR-001 through ADR-005 is
changed by any of it. One item in the review needs a ruling rather than a rebuild, and is
**Proposed pending the operator**: the review's **P0-2**, to default the calendar's week start to
**Monday** regardless of locale while keeping the existing setting as an override, which puts the
weekend tint on columns 6 and 7 by itself. It is proposed rather than taken because it overturns
AC-002's written call that *"which day starts the week stays locale-driven and is not a measured
value"* — twenty of twenty Anytype captures start on Monday, so it is measured, and reversing a
closed row's reasoning is the operator's call under goal D6, not an in-repo one. G7 stays Unmet
until that ruling lands.

<!-- /ANCHOR:decisions -->
