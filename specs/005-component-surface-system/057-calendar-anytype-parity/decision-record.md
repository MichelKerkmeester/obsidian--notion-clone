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
    last_updated_at: "2026-09-06T19:00:00Z"
    last_updated_by: "verify-and-land"
    recent_action: "landed t017: the week/day timed blocks flatten to chip ink, measured at 0 fill/bar px"
    next_safe_action: "The operator's own device read (AC-010); nothing else in this packet is unlanded"
    blockers: []
    key_files:
      - "src/views/calendar-renderer.ts"
      - "specs/005-component-surface-system/039-calendar-parity-port/decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-057-adr"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "ADR-002 is ruled: keep week and day, styled to the month grid"
      - "The calendar's thresholds are per-element because it carries zero pm-* classes"
      - "Parity by default is inherited from 051 ADR-007 without re-asking"
      - "ADR-002's implementation half is partly landed: the weekend tint and nav cluster carried to week and day, the rule colour and today marker did not"
      - "ADR-002's colour question is answered: the timed blocks flatten to chip ink, carried as T017"
      - "T017 landed: the week/day timed block reads the month chip's flat ink, no separator rule needed since the slot lines show through"
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
<!-- /ANCHOR:decisions -->
